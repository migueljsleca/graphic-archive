import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const POSTERS_DIR = path.join(process.cwd(), "public", "images", "posters");
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

type PosterAsset = {
  name: string;
  src: string;
  width: number;
  height: number;
};

export async function GET() {
  const entries = await readdir(POSTERS_DIR, { withFileTypes: true });

  const names = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => ALLOWED_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((left, right) => left.localeCompare(right));

  const posters: PosterAsset[] = await Promise.all(
    names.map(async (name) => {
      const posterPath = path.join(POSTERS_DIR, name);
      const metadata = await sharp(posterPath, { animated: true }).metadata();

      return {
        name,
        src: `/images/posters/${encodeURIComponent(name)}`,
        width: metadata.width ?? 1,
        height: metadata.height ?? 1,
      };
    }),
  );

  return Response.json({ posters });
}
