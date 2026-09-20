import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return NextResponse.json({ error: "Cloudinary is not configured yet." }, { status: 503 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Image file is required." }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "Image must be 8MB or smaller." }, { status: 400 });
  const timestamp = Math.floor(Date.now() / 1000);
  const signatureBase = "timestamp=" + timestamp + apiSecret;
  const signature = createHash("sha1").update(signatureBase).digest("hex");
  const upload = new FormData();
  upload.append("file", file); upload.append("api_key", apiKey); upload.append("timestamp", String(timestamp)); upload.append("signature", signature);
  const response = await fetch("https://api.cloudinary.com/v1_1/" + cloudName + "/image/upload", { method: "POST", body: upload });
  const data = await response.json();
  if (!response.ok) return NextResponse.json({ error: data.error?.message || "Cloudinary upload failed." }, { status: 502 });
  return NextResponse.json({ url: data.secure_url, publicId: data.public_id });
}