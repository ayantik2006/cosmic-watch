import { NextRequest, NextResponse } from "next/server";
import getUserEmail from "@/utils/getUserEmail";
import { connectMongoDb } from "@/db/connectMongoDb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const userEmail = await getUserEmail();
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDb();
    const user = await User.findOne({ email: userEmail }, "savedAsteroids");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ savedAsteroids: user.savedAsteroids || [] });
  } catch (error: any) {
    console.error("Get Saved Asteroids Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
