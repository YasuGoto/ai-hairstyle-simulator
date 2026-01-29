import { NextResponse } from "next/server";

const WAIT_MS = 1200;
const ACCEPTED_TYPES = ["image/jpeg", "image/png"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const selfImage = formData.get("selfImage");
    const styleImage = formData.get("styleImage");

    if (!selfImage || !(selfImage instanceof File)) {
      return NextResponse.json({ message: "自分の写真が見つかりません。" }, { status: 400 });
    }

    if (!styleImage || !(styleImage instanceof File)) {
      return NextResponse.json(
        { message: "参考の髪型画像が見つかりません。" },
        { status: 400 }
      );
    }

    if (!ACCEPTED_TYPES.includes(selfImage.type)) {
      return NextResponse.json(
        { message: "自分の写真はJPGまたはPNGのみ対応しています。" },
        { status: 400 }
      );
    }

    if (!ACCEPTED_TYPES.includes(styleImage.type)) {
      return NextResponse.json(
        { message: "参考画像はJPGまたはPNGのみ対応しています。" },
        { status: 400 }
      );
    }

    if (selfImage.size > MAX_SIZE_BYTES || styleImage.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { message: "画像サイズは10MB以下にしてください。" },
        { status: 400 }
      );
    }

    await new Promise((resolve) => setTimeout(resolve, WAIT_MS));

    const buffer = Buffer.from(await selfImage.arrayBuffer());
    const base64 = buffer.toString("base64");
    const resultUrl = `data:${selfImage.type};base64,${base64}`;

    return NextResponse.json({
      resultUrl,
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
