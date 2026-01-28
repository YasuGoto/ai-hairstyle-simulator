import { NextResponse } from "next/server";

const WAIT_MS = 1200;
const ACCEPTED_TYPES = ["image/jpeg", "image/png"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");
    const style = String(formData.get("style") ?? "").trim();

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: "画像が見つかりません。" }, { status: 400 });
    }

    if (!style) {
      return NextResponse.json({ message: "スタイルを選択してください。" }, { status: 400 });
    }

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

    await new Promise((resolve) => setTimeout(resolve, WAIT_MS));

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const resultUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      resultUrl,
      style,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Transform error:", error);
    return NextResponse.json(
      { message: "変換処理に失敗しました。" },
      { status: 500 }
    );
  }
}
