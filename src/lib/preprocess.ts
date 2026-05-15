import { fromByteArray } from "base64-js";
import { decode as decodeJpeg } from "jpeg-js";

/**
 * Matches `next-meddef` inference page `preprocessImage` (canvas 224×224, CHW float32).
 */
export function preprocessJpegBytes(
  jpegBytes: Uint8Array,
  mean: [number, number, number],
  std: [number, number, number],
): Float32Array {
  const decoded = decodeJpeg(jpegBytes, { useTArray: true }) as {
    width: number;
    height: number;
    data: Uint8Array;
  };

  const { width, height, data } = decoded;
  if (width !== 224 || height !== 224) {
    throw new Error(`Image must be 224×224 after resize (got ${width}×${height})`);
  }

  const tensor = new Float32Array(3 * 224 * 224);
  const pxCount = width * height;
  const stride = data.length / pxCount;

  if (stride !== 3 && stride !== 4) {
    throw new Error(`Unexpected JPEG channel count (stride ${stride})`);
  }

  for (let i = 0; i < pxCount; i++) {
    const o = i * stride;
    const r = data[o]! / 255;
    const g = data[o + 1]! / 255;
    const b = data[o + 2]! / 255;
    tensor[0 * 224 * 224 + i] = (r - mean[0]) / std[0];
    tensor[1 * 224 * 224 + i] = (g - mean[1]) / std[1];
    tensor[2 * 224 * 224 + i] = (b - mean[2]) / std[2];
  }

  return tensor;
}

export function floatTensorToTensorB64(tensor: Float32Array): string {
  const bytes = new Uint8Array(tensor.buffer, tensor.byteOffset, tensor.byteLength);
  return fromByteArray(bytes);
}
