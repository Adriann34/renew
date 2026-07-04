import sharp from "sharp";

const MAX_DIMENSION = 1920;
const TARGET_BYTES = 200 * 1024;
const MIN_QUALITY = 20;

export async function compressImage(input: Buffer): Promise<Buffer> {
  const pipeline = sharp(input)
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    });

  let quality = 80;
  let output = await pipeline.clone().webp({ quality }).toBuffer();

  while (output.length > TARGET_BYTES && quality > MIN_QUALITY) {
    quality -= 10;
    output = await pipeline.clone().webp({ quality }).toBuffer();
  }

  return output;
}
