import { NextRequest, NextResponse } from "next/server";
import getUserEmail from "@/utils/getUserEmail";
import { connectMongoDb } from "@/db/connectMongoDb";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const userEmail = await getUserEmail();
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDb();
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
      savedCount: user.savedAsteroids?.length || 0,
      joiningDate: user.joiningDate,
    });
  } catch (error: any) {
    console.error("User Profile Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
