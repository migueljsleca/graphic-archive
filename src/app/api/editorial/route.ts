import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const EDITORIAL_DIR = path.join(process.cwd(), "public", "images", "editorial");
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);
const EDITORIAL_ORDER = [
  "imagination",
  "raveolution-issue-1",
  "raveolution-issue-2",
  "faults-species-of-spaces",
  "curve",
];

type EditorialAsset = {
  name: string;
  src: string;
  width: number;
  height: number;
};

type EditorialSection = {
  id: string;
  title: string;
  items: EditorialAsset[];
};

const humanizeFolderName = (value: string) =>
  value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export async function GET() {
  const entries = await readdir(EDITORIAL_DIR, { withFileTypes: true });
  const directories = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .sort((left, right) => {
      const leftIndex = EDITORIAL_ORDER.indexOf(left.name);
      const rightIndex = EDITORIAL_ORDER.indexOf(right.name);

      if (leftIndex === -1 && rightIndex === -1) {
        return left.name.localeCompare(right.name);
      }

      if (leftIndex === -1) {
        return 1;
      }

      if (rightIndex === -1) {
        return -1;
      }

      return leftIndex - rightIndex;
    });

  const sections: EditorialSection[] = await Promise.all(
    directories.map(async (directory) => {
      const sectionDir = path.join(EDITORIAL_DIR, directory.name);
      const files = await readdir(sectionDir, { withFileTypes: true });
      const names = files
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .filter((name) => ALLOWED_EXTENSIONS.has(path.extname(name).toLowerCase()))
        .sort((left, right) => left.localeCompare(right));

      const items: EditorialAsset[] = await Promise.all(
        names.map(async (name) => {
          const imagePath = path.join(sectionDir, name);
          const metadata = await sharp(imagePath, { animated: true }).metadata();

          return {
            name,
            src: `/images/editorial/${encodeURIComponent(directory.name)}/${encodeURIComponent(name)}`,
            width: metadata.width ?? 1,
            height: metadata.height ?? 1,
          };
        }),
      );

      return {
        id: directory.name,
        title: humanizeFolderName(directory.name),
        items,
      };
    }),
  );

  return Response.json({ sections });
}
