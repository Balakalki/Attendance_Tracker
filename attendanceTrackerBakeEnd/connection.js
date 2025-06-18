const mongoose = require("mongoose");

let isConnected = false;

const connection = async (url) => {
  if (isConnected) {
    console.log("Using cached database connection");
    return;
  }

  try {
    const db = await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = db.connections[0].readyState;
    console.log("New MongoDB connection established");
  } catch (error) {
    console.error("MongoDB connection error: ", error);
    throw error;
  }
};

module.exports = connection;
