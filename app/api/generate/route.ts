import { NextResponse } from "next/server";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png"];

const SAMPLE_IMAGES = [
  { url: "/samples/sample-1.svg", filename: "aihair-1.svg" },
  { url: "/samples/sample-2.svg", filename: "aihair-2.svg" },
  { url: "/samples/sample-3.svg", filename: "aihair-3.svg" },
];

export async function POST(request: Request) {
  const formData = await request.formData();
  const face = formData.get("face");
  const hair = formData.get("hair");

  if (!(face instanceof File) || !(hair instanceof File)) {
    return NextResponse.json(
      { message: "画像が不足しています。" },
      { status: 400 }
    );
  }

  for (const file of [face, hair]) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: "JPGまたはPNGのみ対応しています。" },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { message: "画像サイズは10MB以下にしてください。" },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ images: SAMPLE_IMAGES });
}
