/**
 * One-off migration for the attendance collection after the DB refactor.
 *
 * The schema changed:
 *   - date:      Date            ->  "YYYY-MM-DD" string (timezone-safe)
 *   - slotId:    String          ->  ObjectId
 *   - subjectId: String          ->  ObjectId
 *
 * Rows written before the refactor still have the old BSON types. This script
 * rewrites them in place so per-day upserts key consistently.
 *
 * Usage (from attendanceTrackerBakeEnd/):
 *   node scripts/migrateAttendance.js            # convert old rows in place
 *   node scripts/migrateAttendance.js --dry-run  # report what would change
 *   node scripts/migrateAttendance.js --drop     # wipe the collection instead
 *
 * Requires MONGODB_URL in the environment / .env.
 */
require("dotenv").config();
const mongoose = require("mongoose");

const DRY_RUN = process.argv.includes("--dry-run");
const DROP = process.argv.includes("--drop");

function toDateString(value) {
  // Old rows stored the date as a Date at UTC midnight (cast from "YYYY-MM-DD").
  if (value instanceof Date) return value.toISOString().split("T")[0];
  return value; // already a string
}

async function run() {
  const url = process.env.MONGODB_URL;
  if (!url) {
    console.error("MONGODB_URL is not set. Aborting.");
    process.exit(1);
  }

  await mongoose.connect(url);
  const col = mongoose.connection.db.collection("attendance");

  if (DROP) {
    const { deletedCount } = await col.deleteMany({});
    console.log(`Dropped ${deletedCount} attendance document(s).`);
    await mongoose.disconnect();
    return;
  }

  const cursor = col.find({});
  let scanned = 0;
  let migrated = 0;
  let conflicts = 0;
  let alreadyOk = 0;

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    scanned++;

    const set = {};

    if (doc.date instanceof Date) set.date = toDateString(doc.date);

    if (typeof doc.slotId === "string" && mongoose.Types.ObjectId.isValid(doc.slotId))
      set.slotId = new mongoose.Types.ObjectId(doc.slotId);

    if (
      typeof doc.subjectId === "string" &&
      mongoose.Types.ObjectId.isValid(doc.subjectId)
    )
      set.subjectId = new mongoose.Types.ObjectId(doc.subjectId);

    if (Object.keys(set).length === 0) {
      alreadyOk++;
      continue;
    }

    if (DRY_RUN) {
      migrated++;
      console.log(`[dry-run] ${doc._id} ->`, set);
      continue;
    }

    try {
      await col.updateOne({ _id: doc._id }, { $set: set });
      migrated++;
    } catch (err) {
      // A converted row can collide with the unique {userId,date,slotId} index
      // if a duplicate already existed. Report it; leave the row for review.
      if (err.code === 11000) {
        conflicts++;
        console.warn(`Conflict on ${doc._id} (duplicate key), skipped.`);
      } else {
        throw err;
      }
    }
  }

  console.log(
    `Done. scanned=${scanned} migrated=${migrated} alreadyOk=${alreadyOk} conflicts=${conflicts}${
      DRY_RUN ? " (dry-run, nothing written)" : ""
    }`
  );

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
