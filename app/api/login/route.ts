import { NextRequest, NextResponse } from "next/server";
import admin from "@/utils/firebaseAdmin";
import { connectMongoDb } from "@/db/connectMongoDb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    const decoded = await admin.auth().verifyIdToken(idToken);
    const name = decoded.name;
    const email = decoded.email;
    const photoURL = decoded.picture;

    if (!email) {
      return NextResponse.json({ error: "Invalid ID Token" }, { status: 400 });
    }

    await connectMongoDb();

    // Use findOneAndUpdate with upsert to handle both creation and updates efficiently
    await User.findOneAndUpdate(
      { email },
      { name, email, photoURL },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const jwtToken = jwt.sign({ user: email }, String(process.env.JWT_SECRET), { expiresIn: "60d" });
    const res = NextResponse.json({ status: 200 });

    res.cookies.set("user", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 60,
    });

    return res;
  } catch (err: any) {
    console.error("Login Error:", err);
    return NextResponse.json({ error: "Internal Server Error", message: err.message }, { status: 500 });
  }
}