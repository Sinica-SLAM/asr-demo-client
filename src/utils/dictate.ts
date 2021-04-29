import RecordRTC, { StereoAudioRecorder } from "recordrtc";

class Dictate {
  constructor(config?: DictateConfig) {
    this.referenceHandler = config?.referenceHandler ?? this.referenceHandler;
    this.contentType = config?.contentType ?? this.contentType;
    this.interval = config?.interval ?? this.interval;
    this.onResult = config?.onResult ?? this.onResult;
    this.monitorServerStatus();
    this.init();
  }

  private port = 8888;
  private get server(): string {
    return `wss://140.109.16.218:${this.port}/client/ws/speech`;
  }
  private get serverStatus(): string {
    return `wss://140.109.16.218:${this.port}/client/ws/status`;
  }
  private referenceHandler =
    "https://140.109.16.218:8888/client/dynamic/reference";
  private contentType = `content-type=audio/x-raw,+layout=(string)interleaved,+rate=(int)16000,+format=(string)S16LE,+channels=(int)1`;
  private interval = 100;
  private ws?: WebSocket;
  private wsServerStatus?: WebSocket;
  private recorder?: RecordRTC;
  private onResult: (result: WSResponse) => Promise<void> = async () => {
    return;
  };

  private monitorServerStatus() {
    if (this.wsServerStatus) {
      this.wsServerStatus.close();
    }
    this.wsServerStatus = new WebSocket(this.serverStatus);
    this.wsServerStatus.onmessage = (evt: MessageEvent) => {
      console.log(evt.data);
    };
  }

  private cancel() {
    if (this.recorder) {
      this.recorder.reset();
    }
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
  }

  private setWebSocket() {
    const url = this.server + "?" + this.contentType;
    this.ws = new WebSocket(url);
    this.ws.onmessage = async (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      if (data.status === 0) {
        this.onResult(data);
        if (data.adaptation_state) {
          if (this.ws?.readyState !== WebSocket.CLOSED) {
            this.ws?.close();
          }
        }
      } else {
        this.stopListening();
        console.log(`ws error: ${data}`);
      }
    };
  }

  public async init() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });

      this.recorder = new RecordRTC(stream, {
        type: "audio",
        recorderType: StereoAudioRecorder,
        timeSlice: this.interval,
        desiredSampRate: 16000,
        numberOfAudioChannels: 1,
        bufferSize: 16384,
        mimeType: "audio/wav",
        ondataavailable: async (data) => {
          data
            .slice(44)
            .arrayBuffer()
            .then((arrayBuffer) => this.ws?.send(arrayBuffer));
        },
      });
    } catch (e) {
      console.log(e);
    }
  }
  public async startListening(port: number) {
    this.port = port;

    if (this.recorder) {
      this.recorder.reset();
    } else {
      await this.init();
    }

    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }

    try {
      this.setWebSocket();
      this.recorder?.startRecording();
    } catch (e) {
      console.log("No web socket support in this browser!");
    }
  }

  public async stopListening(): Promise<string> {
    try {
      const url = await new Promise((r: (v: string) => void) =>
        this.recorder?.stopRecording(() => {
          r(this.recorder?.toURL() as string);
        })
      );
      this.ws?.send("EOS");
      return url;
    } catch (e) {
      console.log("stopListening error: " + e);
      return "";
    }
  }

  public destroy(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
    if (!this.recorder) {
      return;
    }

    this.recorder.destroy();
    this.recorder = undefined;
  }

  public get recording(): boolean {
    return this.recorder?.getState() === "recording";
  }
}

interface DictateConfig {
  server?: string;
  serverStatus?: string;
  referenceHandler?: string;
  contentType?: string;
  interval?: number;
  onResult?: (result: WSResponse) => Promise<void>;
}

interface WSResponse {
  id: string;
  status: number;
  message?: string;
  result?: {
    hypotheses: Hypothesis[];
    final: boolean;
  };
  segment: number;
  "segment-length": number;
  "segment-start": number;
  "total-length": number;
  adaptation_state?: {
    id: string;
    time: string;
    type: string;
    value: string;
  };
}

export interface WordAlignment {
  start?: number;
  length?: number;
  word: string;
  confidence?: number;
}

export interface Hypothesis {
  transcript: string;
  likelihood: number;
  "word-alignment"?: WordAlignment[];
  "phone-alignment"?: PhoneAlignment[];
}

export interface PhoneAlignment {
  phone: string;
  length: number; //second
  confidence: number;
  start: number; //second
}

// enum DictateEvent {
//   MSG_WAITING_MICROPHONE = 1,
//   MSG_MEDIA_STREAM_CREATED,
//   MSG_INIT_RECORDER,
//   MSG_RECORDING,
//   MSG_SEND,
//   MSG_SEND_EMPTY,
//   MSG_SEND_EOS,
//   MSG_WEB_SOCKET,
//   MSG_WEB_SOCKET_OPEN,
//   MSG_WEB_SOCKET_CLOSE,
//   MSG_STOP,
//   MSG_SERVER_CHANGED,
//   MSG_AUDIOCONTEXT_RESUMED,
// }
// enum DictateError {
//   ERR_NETWORK = 2,
//   ERR_AUDIO,
//   ERR_SERVER,
//   ERR_CLIENT,
// }

export default Dictate;
