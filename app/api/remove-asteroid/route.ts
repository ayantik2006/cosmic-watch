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

    const { asteroidId } = await req.json();
    if (!asteroidId) {
      return NextResponse.json({ error: "Asteroid ID required" }, { status: 400 });
    }

    await connectMongoDb();
    
    await User.updateOne(
      { email: userEmail },
      { $pull: { savedAsteroids: { id: asteroidId } } }
    );

    return NextResponse.json({ message: "Asteroid removed from catalog", asteroidId });
  } catch (error: any) {
    console.error("Remove Asteroid Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
