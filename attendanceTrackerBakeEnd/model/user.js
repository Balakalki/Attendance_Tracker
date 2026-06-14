const { createHmac } = require("crypto");
const bcrypt = require("bcryptjs");
const { Schema, model } = require("mongoose");

const BCRYPT_ROUNDS = 10;

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    // Legacy HMAC salt. Only present on accounts created before the bcrypt
    // migration; cleared the first time such an account logs in.
    salt: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Hash the password with bcrypt whenever it changes (signup, password reset,
// or the transparent legacy upgrade below).
userSchema.pre("save", async function (next) {
  const user = this;

  if (!user.isModified("password")) return next();

  try {
    user.password = await bcrypt.hash(user.password, BCRYPT_ROUNDS);
    user.salt = undefined; // bcrypt embeds its own salt
    next();
  } catch (error) {
    next(error);
  }
});

function legacyHash(salt, password) {
  return createHmac("sha256", salt).update(password).digest("hex");
}

userSchema.static("matchPassword", async function (email, password) {
  const user = await User.findOne({ email });

  if (!user) throw new Error("incorrect email");

  let isMatch;

  if (user.password.startsWith("$2")) {
    // Already a bcrypt hash.
    isMatch = await bcrypt.compare(password, user.password);
  } else {
    // Legacy HMAC-SHA256 account: verify the old way, then transparently
    // re-hash with bcrypt on success so the next login uses bcrypt.
    isMatch = legacyHash(user.salt, password) === user.password;
    if (isMatch) {
      user.password = password; // pre-save hook re-hashes with bcrypt
      await user.save();
    }
  }

  if (!isMatch) throw new Error("incorrect Password");

  return { id: user._id, email: user.email, isVerified: user.isVerified };
});

const User = model("users", userSchema);

module.exports = User;
