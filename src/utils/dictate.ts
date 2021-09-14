import Recorder from "@/recorder/recorder";
import {useMainResultStore} from "@/store/modules/mainResultStore";
import {Candidate} from "@/utils/candidates";
import {useAudioPlayerStore} from "@/store/modules/audioPlayerStore";

class Dictate {
  constructor(config?: DictateConfig) {
    this.referenceHandler = config?.referenceHandler ?? this.referenceHandler;
    this.contentType = config?.contentType ?? this.contentType;
    this.interval = config?.interval ?? this.interval;
    this.monitorServerStatus();
    this.init();
  }

  private asrKind = "formospeech_me_1";

  private get server(): string {
    return `wss://asrvm.iis.sinica.edu.tw:8080/websocket/${this.asrKind}/speech`;
  }

  private get serverStatus(): string {
    return `wss://asrvm.iis.sinica.edu.tw:8080/websocket/${this.asrKind}/status`;
  }

  private readonly referenceHandler: string =
    "https://140.109.16.218:8888/client/dynamic/reference";
  private readonly contentType: string = `content-type=audio/x-raw,+layout=(string)interleaved,+rate=(int)16000,+format=(string)S16LE,+channels=(int)1`;
  private readonly interval: number = 100;
  private ws?: WebSocket;
  private wsServerStatus?: WebSocket;
  private recorder?: Recorder;

  public async init(): Promise<void> {
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

  public async startListening(asrKind: string): Promise<void> {
    this.asrKind = asrKind;

    if (this.recorder) {
      await this.recorder.stopRecording();
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

  private cancel() {
    if (this.recorder) {
      this.recorder.startRecording();
    }
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
  }

  private monitorServerStatus() {
    if (this.wsServerStatus) {
      this.wsServerStatus.close();
    }
    this.wsServerStatus = new WebSocket(this.serverStatus, "optionalProtocol");
    this.wsServerStatus.onmessage = (evt: MessageEvent) => {
      console.log(evt.data);
    };
  }

  public async stopListening(): Promise<void> {
    try {
      const url = URL.createObjectURL(await this.recorder?.stopRecording());
      useAudioPlayerStore().setAudioURL(url)

      this.ws?.send("EOS");
    } catch (e) {
      console.log("stopListening error: " + e);
    }
  }

  private onResult = (res: WSResponse): void => {
    if (res.result?.final) {
      useMainResultStore().appendFromDictate(res)
    } else {
      useMainResultStore().setTempText((res.result?.hypotheses[0].transcript ?? "").replace(" ", ""))
    }

    if (res.adaptation_state) {
      if (this.recording) {
        useMainResultStore().endReadTimeRecognition();
      }
    }
  };

  private setWebSocket() {
    const url = this.server + "?" + this.contentType;
    this.ws = new WebSocket(url, "optionalProtocol");
    this.ws.onmessage = async (e: MessageEvent) => {
      const data: WSResponse = JSON.parse(e.data);
      if (data.status === 0) {
        if (data.result) {
          // if (data.segment == 0) {
          //   return;
          // }
          if (data.result.hypotheses[0]["word-alignment"]) {
            if (
              data.result.hypotheses[0]["word-alignment"].filter(
                (w) => data["segment-start"] + w.start + w.length > 0.019
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
        await useMainResultStore().endReadTimeRecognition();
        console.log(`ws error: ${data}`);
      }
    };
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
}

export interface WSResponse {
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
  start: number;
  length: number;
  word: string;
  confidence: number;
  candidates: Candidate[]
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


export default Dictate;
