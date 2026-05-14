import { v2 as cloudinary } from "cloudinary";
import { auth } from "@clerk/nextjs/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    // ✅ Check if user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Get image from request
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // ✅ Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: "sensai/profile-images",   // organized folder in Cloudinary
      public_id: `user_${userId}`,        // unique per user
      overwrite: true,                    // replace if user uploads again
      transformation: [
        { width: 200, height: 200, crop: "fill", gravity: "face" }, // ✅ auto crop to face
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    // ✅ Return the secure Cloudinary URL
    return new Response(
      JSON.stringify({
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Image upload error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to upload image" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}