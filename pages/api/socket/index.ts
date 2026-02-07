import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIO } from "@/types/next";
import { connectMongoDb } from "@/db/connectMongoDb";
import Message from "@/models/Message";
import fs from "fs";
import path from "path";

const LOG_FILE = path.join(process.cwd(), "socket_debug.log");

function logToFile(message: string) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    logToFile("Initializing Socket.io server...");
    console.log("*First use, starting socket.io");

    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      logToFile(`New client connected: ${socket.id}`);
      console.log("DEBUG: New socket client connected", socket.id);

      socket.on("send-message", async (data) => {
        logToFile(`Received send-message: ${JSON.stringify(data)}`);
        try {
          await connectMongoDb();
          logToFile("Connected to MongoDB");

          const newMessage = await Message.create({
            sender: data.sender || "Unknown",
            text: data.text || "",
            email: data.email || "unknown@system.local",
            avatar: data.avatar || "",
          });
          logToFile(`Message saved! ID: ${newMessage._id}`);

          const broadcastMsg = {
            id: newMessage._id,
            sender: newMessage.sender,
            text: newMessage.text,
            timestamp: new Date(newMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            avatar: newMessage.avatar,
            email: newMessage.email,
          };

          io.emit("receive-message", broadcastMsg);
          logToFile("Broadcasted receive-message");
        } catch (error: any) {
          logToFile(`ERROR in send-message: ${error.message}`);
          console.error("DEBUG: Socket Message Error:", error);
        }
      });

      socket.on("disconnect", () => {
        logToFile(`Client disconnected: ${socket.id}`);
        console.log("DEBUG: Socket client disconnected", socket.id);
      });
    });
  } else {
    // logToFile("Socket.io server already running.");
  }

  res.end();
};

export default ioHandler;
