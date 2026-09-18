"use client";

const MAX_EDGE = 1600;
const TARGET_BYTES = 650_000;

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image."));
    };
    image.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not compress this image."));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

async function drawToJpeg(
  image: HTMLImageElement,
  edge: number,
  quality: number,
) {
  const scale = Math.min(1, edge / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not compress this image.");
  ctx.drawImage(image, 0, 0, width, height);
  return canvasToBlob(canvas, "image/jpeg", quality);
}

/** Shrink photos so nginx's 1 MB default never returns HTTP 413. */
export async function prepareOrbitUpload(file: File) {
  if (/\.(heic|heif)$/i.test(file.name) || /heic|heif/i.test(file.type)) {
    throw new Error(
      "HEIC/HEIF photos are not supported. Convert to JPG or PNG and try again.",
    );
  }
  const looksImage =
    file.type.startsWith("image/") ||
    /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(file.name);
  if (
    !looksImage ||
    file.type === "image/svg+xml" ||
    file.type === "image/gif"
  ) {
    if (file.size > TARGET_BYTES) {
      throw new Error(
        "This file is too large to upload. Use a JPG or PNG under 1 MB.",
      );
    }
    return file;
  }

  const image = await loadImage(file);
  let edge = MAX_EDGE;
  let quality = 0.82;
  let blob = await drawToJpeg(image, edge, quality);
  while (blob.size > TARGET_BYTES && (edge > 720 || quality > 0.5)) {
    if (quality > 0.55) quality -= 0.1;
    else edge = Math.round(edge * 0.82);
    blob = await drawToJpeg(image, edge, quality);
  }
  if (blob.size > TARGET_BYTES) {
    throw new Error(
      "This image is still too large after compression. Try a smaller crop or JPG.",
    );
  }
  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}
