import { NextResponse } from "next/server";

export async function GET() {
  const styles = [
    {
      id: "short-001",
      tag: "short",
      imageUrl: "/samples/short-1.jpg",
    },
    {
      id: "bob-001",
      tag: "bob",
      imageUrl: "/samples/bob-1.jpg",
    },
    {
      id: "long-001",
      tag: "long",
      imageUrl: "/samples/long-1.jpg",
    },
  ];

  return NextResponse.json({ styles });
}
