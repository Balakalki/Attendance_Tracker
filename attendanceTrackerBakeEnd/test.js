require("dotenv").config();
const app = require("./index");
const connectToDb = require("./connection");

const port = process.env.PORT || 8000;

// Local dev entrypoint. On Lambda the DB connection is managed in handler.js
// (per cold start); here we connect before accepting traffic so requests
// don't hang waiting on Mongoose.
connectToDb(process.env.MONGODB_URL)
  .then(() => {
    app.listen(port, () => console.log("server start on port ", port));
  })
  .catch((err) => {
    console.error("Failed to connect to DB. Server not started.", err);
    process.exit(1);
  });
