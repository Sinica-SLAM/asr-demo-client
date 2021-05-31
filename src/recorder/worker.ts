import { expose } from "threads/worker";
let recLength = 0,
  recBuffer: Float32Array[] = [],
  recordSampleRate: number;

let intervalBuffer: Float32Array[] = [],
  intervalLength = 0;

function downsampleBuffer(buffer: Float32Array, exportSampleRate: number) {
  if (exportSampleRate === recordSampleRate) {
    return buffer;
  }
  const sampleRateRatio = recordSampleRate / exportSampleRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0,
      count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = accum / count;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

function mergeBuffers(bufferArray: Float32Array[], recLength: number) {
  const result = new Float32Array(recLength);
  let offset = 0;
  for (let i = 0; i < bufferArray.length; i++) {
    result.set(bufferArray[i], offset);
    offset += bufferArray[i].length;
  }
  return result;
}

function floatTo16BitPCM(
  output: DataView,
  offset: number,
  input: Float32Array
) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function encodeWAV(samples: Float32Array, exportSampleRate: number) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 32 + samples.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, exportSampleRate, true);
  view.setUint32(28, exportSampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);
  floatTo16BitPCM(view, 44, samples);

  return view;
}

function encodeRAW(samples: Float32Array) {
  const buffer = new ArrayBuffer(samples.length * 2);
  const view = new DataView(buffer);
  floatTo16BitPCM(view, 0, samples);
  return view;
}

const record = {
  init(config: { sampleRate: number }): void {
    recordSampleRate = config.sampleRate;
  },
  record(inputBuffer: Float32Array[]): void {
    recBuffer.push(inputBuffer[0]);
    recLength += inputBuffer[0].length;
    intervalBuffer.push(inputBuffer[0]);
    intervalLength += inputBuffer[0].length;
  },
  exportBuffer(exportSampleRate: number) {
    const mergedBuffers = mergeBuffers(recBuffer, recLength);
    const downsampledBuffer = downsampleBuffer(mergedBuffers, exportSampleRate);
    const encodedWav = encodeWAV(downsampledBuffer, exportSampleRate);
    const audioBlob = new Blob([encodedWav], {
      type: "audio/wav",
    });

    return audioBlob;
  },
  exportIntervalBuffer() {
    // export 16k raw
    const mergedBuffers = mergeBuffers(intervalBuffer, intervalLength);
    const downsampledBuffer = downsampleBuffer(mergedBuffers, 16000);
    const encodeRaw = encodeRAW(downsampledBuffer);
    const audioBlob = new Blob([encodeRaw], {
      type: "audio/x-raw",
    });
    intervalBuffer = [];
    intervalLength = 0;
    return audioBlob;
  },
  clear(): void {
    recLength = 0;
    recBuffer = [];
  },
};

export type Record = typeof record;

expose(record);
