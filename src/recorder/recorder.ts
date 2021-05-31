import { ModuleThread, spawn, Thread, Worker } from "threads";
import { Record } from "@/recorder/worker";
export default class Recorder {
  constructor(
    stream: MediaStream,
    option?: {
      timeSlice?: number;
      desiredSampRate?: number;
      ondataavailable?: (blob: Blob) => void;
    }
  ) {
    this.option = { ...this.option, ...option };
    this.source = new AudioContext().createMediaStreamSource(stream);
    this.node = this.source.context.createScriptProcessor(4096, 1, 1);
    this.node.onaudioprocess = (e) => {
      if (this._recording === false || !this.worker) {
        return;
      }
      const data = new Float32Array(4096);
      e.inputBuffer.copyFromChannel(data, 0);
      console.log(data);
      this.worker.record([e.inputBuffer.getChannelData(0)]);
    };
    this.source.connect(this.node);
    this.node.connect(this.source.context.destination);
  }
  private worker?: ModuleThread<Record>;
  private option: {
    timeSlice: number;
    desiredSampRate: number;
    ondataavailable: (blob: Blob) => void;
  } = {
    timeSlice: 100,
    desiredSampRate: 16000,
    ondataavailable: () => undefined,
  };
  private _recording = false;
  private source: MediaStreamAudioSourceNode;
  private node: ScriptProcessorNode;
  private intervalId?: number;

  public async startRecording() {
    if (this._recording) {
      return;
    }
    if (!this.worker) {
      this.worker = await spawn<Record>(new Worker("@/recorder/worker"));
    }
    await this.worker.init({ sampleRate: this.source.context.sampleRate });
    this._recording = true;
    this.intervalId = setInterval(
      () =>
        setTimeout(() => {
          this.onTimeSlice();
        }, this.option.timeSlice),
      this.option.timeSlice
    );
  }

  public async stopRecording() {
    if (!this._recording || !this.worker) {
      return;
    }
    this._recording = false;
    await this.onTimeSlice();
    const audioBlob = await this.worker.exportBuffer(
      this.option.desiredSampRate
    );

    clearInterval(this.intervalId);
    this.intervalId = undefined;
    await this.worker.clear();
    await Thread.terminate(this.worker);
    this.worker = undefined;

    return audioBlob;
  }

  private async onTimeSlice() {
    if (!this._recording || !this.worker) {
      return;
    }
    this.option.ondataavailable(await this.worker.exportIntervalBuffer());
  }

  public get recording() {
    return this._recording;
  }
}
