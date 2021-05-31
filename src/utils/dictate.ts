import Recorder from "@/recorder/recorder";

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
  private recorder?: Recorder;
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
      this.recorder.startRecording();
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
      const data: WSResponse = JSON.parse(e.data);
      if (data.status === 0) {
        if (data.result) {
          if (data.segment == 0) {
            return;
          }
          if (data.result.hypotheses[0]["word-alignment"]) {
            if (
              data.result.hypotheses[0]["word-alignment"].filter(
                (w) => data["segment-start"] + w.start! + w.length! > 0.019
              ).length == 0
            ) {
              return;
            }
          }
        }

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
        audio: true,
      });

      this.recorder = new Recorder(stream, {
        timeSlice: this.interval,
        desiredSampRate: 16000,
        ondataavailable: (data) => {
          this.ws?.send(data);
        },
      });
    } catch (e) {
      console.log(e);
    }
  }
  public async startListening(port: number) {
    this.port = port;

    if (this.recorder) {
      this.recorder.stopRecording();
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
      const url = URL.createObjectURL(await this.recorder?.stopRecording());

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

    this.recorder.stopRecording();
    this.recorder = undefined;
  }

  public get recording(): boolean {
    return this.recorder?.recording ?? false;
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
  token?: string;
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
