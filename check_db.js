const mongoose = require("mongoose");
const MONGO_URI = "mongodb://127.0.0.1:27017/project_momentum";

const MessageSchema = new mongoose.Schema({
    sender: String,
    text: String,
    email: String,
    timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);

async function checkMessages() {
    try {
        console.log("Connecting to:", MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log("Connected!");
        
        const count = await Message.countDocuments();
        console.log("Total Messages:", count);
        
        const lastMessages = await Message.find().sort({ timestamp: -1 }).limit(5);
        console.log("Last 5 Messages:", JSON.stringify(lastMessages, null, 2));
        
        process.exit(0);
    } catch (err) {
        console.error("DB Error:", err);
        process.exit(1);
    }
}

checkMessages();
