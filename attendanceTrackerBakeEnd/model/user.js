const { randomBytes, createHmac } = require("crypto");
const { Schema, model } = require("mongoose");

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
    salt: {
      type: String,
    },
  },
  { timestamps: true }
);

function getHashedPassword(salt, password) {
  return createHmac("sha256", salt).update(password).digest("hex");
}

userSchema.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password")) return next();

  const salt = randomBytes(16).toString();

  const hashedPassword = getHashedPassword(salt, user.password);

  this.password = hashedPassword;
  this.salt = salt;

  next();
});

userSchema.static("matchPassword", async function (email, password) {
  const user = await User.findOne({ email });

  if (!user) throw new Error("incorrect email");
  const hashedPassword = getHashedPassword(user.salt, password);

  if (hashedPassword !== user.password) throw new Error("incorrect Password");

  return { id: user._id, email: user.email };
});

const User = model("users", userSchema);

module.exports = User;
