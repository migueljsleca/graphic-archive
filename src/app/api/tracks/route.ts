import { readdir } from "node:fs/promises";
import path from "node:path";

type LocalTrack = {
  id: string;
  title: string;
  src: string;
  artist: string;
};

function parseTrackDetails(fileName: string) {
  const baseName = fileName.replace(/\.[^/.]+$/, "").trim();
  const [titlePart, artistPart] = baseName.split(/\s+-\s+/, 2);

  if (artistPart) {
    return {
      artist: artistPart.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim(),
      title: titlePart.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim(),
    };
  }

  return {
    artist: "Unknown artist",
    title: baseName.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim(),
  };
}

export async function GET() {
  const audioDirectory = path.join(process.cwd(), "public", "audio");

  try {
    const entries = await readdir(audioDirectory, { withFileTypes: true });
    const mp3Files = entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".mp3"))
      .sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true }));

    const tracks: LocalTrack[] = await Promise.all(
      mp3Files.map(async (file) => {
        const details = parseTrackDetails(file.name);

        return {
          id: file.name,
          artist: details.artist,
          title: details.title,
          src: `/audio/${encodeURIComponent(file.name)}`,
        };
      }),
    );

    return Response.json({ tracks });
  } catch {
    return Response.json({ tracks: [] });
  }
}
