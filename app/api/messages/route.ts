import { NextRequest, NextResponse } from "next/server";
import { connectMongoDb } from "@/db/connectMongoDb";
import Message from "@/models/Message";
import getUserEmail from "@/utils/getUserEmail";
import User from "@/models/User";

export async function GET(req: NextRequest) {
    try {
        await connectMongoDb();
        const messages = await Message.find()
            .sort({ timestamp: 1 })
            .limit(100);
            
        return NextResponse.json({ messages });
    } catch (error) {
        console.error("Fetch Messages Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();
        const email = await getUserEmail();

        if (!email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!text || text.trim() === "") {
            return NextResponse.json({ error: "Invalid text" }, { status: 400 });
        }

        await connectMongoDb();
        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const newMessage = await Message.create({
            sender: user.name,
            text,
            email: user.email,
            avatar: user.photoURL,
        });

        return NextResponse.json({ message: newMessage });
    } catch (error) {
        console.error("Send Message Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
