const MAX_SIDE = 1568; // larger images are downscaled by the AI service anyway
const MAX_BYTES = 4 * 1024 * 1024;
const PASS_THROUGH = ["image/jpeg", "image/png", "image/webp"];

/** Shrinks big phone photos before upload: faster, cheaper, and under the AI service's 5 MB image limit. */
export async function prepareImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));

    if (scale === 1 && file.size <= MAX_BYTES && PASS_THROUGH.includes(file.type)) {
      bitmap.close();
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.fillStyle = "#fff"; // transparent PNG areas would turn black in a JPEG
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
    return blob ? new File([blob], "photo.jpg", { type: "image/jpeg" }) : file;
  } catch {
    return file; // unreadable in the browser (for example HEIC): let the server decide
  }
}
