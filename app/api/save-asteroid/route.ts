import { NextRequest, NextResponse } from "next/server";
import getUserEmail from "@/utils/getUserEmail";
import { connectMongoDb } from "@/db/connectMongoDb";
import User from "@/models/User";

/**
 * POST /api/save-asteroid
 * Saves a NeoWS asteroid object to the user's savedAsteroids array.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const userEmail = await getUserEmail();
    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in to save asteroids" },
        { status: 401 }
      );
    }

    // 2. Validate input
    const { asteroid } = await req.json();
    if (!asteroid || !asteroid.id || !asteroid.name) {
      return NextResponse.json(
        { error: "Invalid asteroid data: Name and ID are required" },
        { status: 400 }
      );
    }

    await connectMongoDb();

    // 3. Check for existing user and duplicate asteroid
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ error: "User account not detected" }, { status: 404 });
    }

    // Prevent duplicates in the savedAsteroids array
    const alreadySaved = user.savedAsteroids?.some((a: any) => a.id === asteroid.id);
    if (alreadySaved) {
      return NextResponse.json(
        { message: "Asteroid is already in your catalog", alreadySaved: true },
        { status: 200 }
      );
    }

    // 4. Update the user record
    await User.updateOne(
      { email: userEmail },
      { 
        $push: { 
          savedAsteroids: {
            ...asteroid,
            savedAt: new Date().toISOString()
          } 
        } 
      }
    );

    return NextResponse.json(
      { 
        message: "Celestial object successfully saved to catalog", 
        asteroidId: asteroid.id 
      }, 
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Critical Error in Save Asteroid API:", error);
    return NextResponse.json(
      { 
        error: "Failed to process orbital data save request", 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}
