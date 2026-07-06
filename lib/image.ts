import sharp from "sharp";

const MAX_DIMENSION = 1920;
const TARGET_BYTES = 200 * 1024;
const MIN_QUALITY = 20;

export async function compressImage(
  input: Buffer,
  options?: { maxDimension?: number; targetBytes?: number }
): Promise<Buffer> {
  const maxDimension = options?.maxDimension ?? MAX_DIMENSION;
  const targetBytes = options?.targetBytes ?? TARGET_BYTES;

  const pipeline = sharp(input)
    .rotate()
    .resize({
      width: maxDimension,
      height: maxDimension,
      fit: "inside",
      withoutEnlargement: true,
    });

  let quality = 80;
  let output = await pipeline.clone().webp({ quality }).toBuffer();

  while (output.length > targetBytes && quality > MIN_QUALITY) {
    quality -= 10;
    output = await pipeline.clone().webp({ quality }).toBuffer();
  }

  return output;
}
