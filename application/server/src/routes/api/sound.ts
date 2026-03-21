import { promises as fs } from "fs";
import os from "os";
import path from "path";

import { Router } from "express";
import Ffmpeg from "fluent-ffmpeg";
import httpErrors from "http-errors";
import { v4 as uuidv4 } from "uuid";

import { UPLOAD_PATH } from "@web-speed-hackathon-2026/server/src/paths";
import { extractMetadataFromSound } from "@web-speed-hackathon-2026/server/src/utils/extract_metadata_from_sound";

const OUTPUT_EXTENSION = "mp3";

export const soundRouter = Router();

function convertToMp3(
  inputPath: string,
  outputPath: string,
  metadata: { artist: string; title: string },
): Promise<void> {
  return new Promise((resolve, reject) => {
    Ffmpeg(inputPath)
      .outputOptions([
        "-vn",
        "-metadata",
        `artist=${metadata.artist}`,
        "-metadata",
        `title=${metadata.title}`,
      ])
      .audioCodec("libmp3lame")
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", reject)
      .run();
  });
}

soundRouter.post("/sounds", async (req, res) => {
  if (req.session.userId === undefined) {
    throw new httpErrors.Unauthorized();
  }
  if (Buffer.isBuffer(req.body) === false) {
    throw new httpErrors.BadRequest();
  }

  const soundId = uuidv4();
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "sound-"));
  const tmpInput = path.join(tmpDir, "input");
  const outputPath = path.resolve(UPLOAD_PATH, `./sounds/${soundId}.${OUTPUT_EXTENSION}`);

  const { artist = "Unknown Artist", title = "Unknown Title" } = await extractMetadataFromSound(
    req.body,
  );

  try {
    await fs.writeFile(tmpInput, req.body);
    await fs.mkdir(path.resolve(UPLOAD_PATH, "sounds"), { recursive: true });
    await convertToMp3(tmpInput, outputPath, { artist, title });
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }

  return res.status(200).type("application/json").send({ artist, id: soundId, title });
});
