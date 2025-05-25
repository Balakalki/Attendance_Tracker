const { connect } = require("mongoose");

const connection = async (url) => {
  try {
    await connect(url);
    console.log("mongodb connected successfully");
  } catch (error) {
    console.error("mongodb connection error: ", error);
    process.exit(1);
  }
};

module.exports = connection;
