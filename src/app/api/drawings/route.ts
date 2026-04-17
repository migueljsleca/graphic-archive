import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DRAWINGS_DIR = path.join(process.cwd(), "public", "images", "drawings");
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

type DrawingAsset = {
  name: string;
  src: string;
  width: number;
  height: number;
};

const ensureDrawingsDirectory = async () => {
  await mkdir(DRAWINGS_DIR, { recursive: true });
};

export async function GET() {
  await ensureDrawingsDirectory();

  const entries = await readdir(DRAWINGS_DIR, { withFileTypes: true });

  const names = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => ALLOWED_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((left, right) => right.localeCompare(left));

  const posters: DrawingAsset[] = await Promise.all(
    names.map(async (name) => {
      const drawingPath = path.join(DRAWINGS_DIR, name);
      const metadata = await sharp(drawingPath, { animated: true }).metadata();

      return {
        name,
        src: `/images/drawings/${encodeURIComponent(name)}`,
        width: metadata.width ?? 1,
        height: metadata.height ?? 1,
      };
    }),
  );

  return Response.json({ posters });
}

export async function POST(request: Request) {
  await ensureDrawingsDirectory();

  const body = (await request.json()) as { imageData?: string };
  const imageData = body.imageData;

  if (!imageData?.startsWith("data:image/png;base64,")) {
    return Response.json(
      { error: "Invalid image payload." },
      { status: 400 },
    );
  }

  const base64Data = imageData.replace("data:image/png;base64,", "");
  const buffer = Buffer.from(base64Data, "base64");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `drawing-${timestamp}.png`;

  await writeFile(path.join(DRAWINGS_DIR, fileName), buffer);

  return Response.json({
    name: fileName,
    src: `/images/drawings/${encodeURIComponent(fileName)}`,
  });
}
