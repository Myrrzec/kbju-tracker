import { apiRequest } from "../apiClient";
import type { PhotoRecognitionResult } from "../../types";

export function recognizePhoto(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest<PhotoRecognitionResult>("/recognition/photo", {
    method: "POST",
    body: formData,
    isFormData: true,
  });
}
