import mongoose from "mongoose";

let isConnected = false;

export async function connectMongoDb() {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(String(process.env.MONGO_URI));
    isConnected = db.connections[0].readyState === 1;
    console.log("database connected");
  } catch (err) {
    console.log("database connection failed: ", err);
  }
}
