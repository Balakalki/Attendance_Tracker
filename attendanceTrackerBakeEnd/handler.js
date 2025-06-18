const serverless = require("serverless-http");
const app = require("./index"); // or ./app if your app file is named app.js
const connectToDb = require("./connection");

let cachedHandler;

module.exports.handler = async (event, context) => {
  // Connect to DB only on cold start
  if (!cachedHandler) {
    console.log("hello using old connection")
    await connectToDb(process.env.MONGODB_URL);
    cachedHandler = serverless(app);
  }

  return cachedHandler(event, context);
};
