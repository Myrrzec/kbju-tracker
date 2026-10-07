import { apiRequest } from "../apiClient";
import { prepareImage } from "../image";
import type { DemoRecognitionResult, PhotoRecognitionResult } from "../../types";

async function photoForm(file: File): Promise<FormData> {
  const formData = new FormData();
  formData.append("file", await prepareImage(file));
  return formData;
}

export async function recognizePhoto(file: File) {
  return apiRequest<PhotoRecognitionResult>("/recognition/photo", {
    method: "POST",
    body: await photoForm(file),
    isFormData: true,
  });
}

/** Public try-out for visitors without an account. */
export async function recognizeDemo(file: File) {
  return apiRequest<DemoRecognitionResult>("/recognition/demo", {
    method: "POST",
    body: await photoForm(file),
    isFormData: true,
    skipAuth: true,
  });
}
