import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SOCIAL_MEDIA_GRAPHICS_DIR = path.join(
  process.cwd(),
  "public",
  "images",
  "social-media-graphics",
);
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

type GraphicAsset = {
  name: string;
  src: string;
  width: number;
  height: number;
};

export async function GET() {
  const entries = await readdir(SOCIAL_MEDIA_GRAPHICS_DIR, {
    withFileTypes: true,
  });

  const names = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => ALLOWED_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((left, right) => left.localeCompare(right));

  const posters: GraphicAsset[] = await Promise.all(
    names.map(async (name) => {
      const graphicPath = path.join(SOCIAL_MEDIA_GRAPHICS_DIR, name);
      const metadata = await sharp(graphicPath, { animated: true }).metadata();

      return {
        name,
        src: `/images/social-media-graphics/${encodeURIComponent(name)}`,
        width: metadata.width ?? 1,
        height: metadata.height ?? 1,
      };
    }),
  );

  return Response.json({ posters });
}
