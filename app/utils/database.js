import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log("Success: Connected to MongoDB");
  } catch (e) {
    isConnected = false;
    console.log("Failed: UnConnected to MongoDB");
    console.error(e);
    throw e;
  }
};

export default connectDB;