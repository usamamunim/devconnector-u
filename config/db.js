const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

const connectDB = async () => {
  try{
  await mongoose.connect(db);
    console.log("Connected to Database");
  }
  catch(err){
    console.log(`Couldn't connect to db, err: ${err}`);
    process.exit(1);
  }
}

module.exports = connectDB;
