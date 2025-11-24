// app/api/GET/Price_Oil/route.ts
import { NextResponse } from "next/server";
import * as cheerio from "cheerio"; // <-- แก้ตรงนี้

export async function GET() {
  try {
    const url = "http://gasprice.kapook.com/gasprice.php";
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch page. HTTP ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    const data: { name: string; price: string }[] = [];

    $("article.gasprice.ptt ul li").each((i, el) => {
      const name = $(el).find("span").text().trim();
      const price = $(el).find("em").text().trim();
      if (name && price) {
        data.push({ name, price });
      }
    });

    return NextResponse.json({ status: "ok", data });
  } catch (err) {
    console.error("Error fetching oil prices:", err);
    return NextResponse.json(
      { status: "error", message: (err as Error).message },
      { status: 500 }
    );
  }
}
