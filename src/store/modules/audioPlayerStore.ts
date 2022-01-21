import { defineStore } from "pinia";

interface audioPlayerState {
  audioURL: string;
  player: HTMLAudioElement | undefined;
  duration: number;
  currentTime: number; //second
  playing: boolean;
  timeout: number | undefined;
}

export const useAudioPlayerStore = defineStore({
  id: "audioPlayerStore",
  state: (): audioPlayerState => ({
    audioURL: "",
    player: undefined,
    duration: 0,
    currentTime: 0,
    playing: false,
    timeout: undefined,
  }),
  getters: {
    getDuration: (state) => state.duration,
    getCurrentTime: (state) => state.currentTime,
    getPlaying: (state) => state.playing,
  },
  actions: {
    setPlayer(newPlayer: HTMLAudioElement) {
      this.player = newPlayer;
      console.log(this.player);
    },
    setAudioURL(newURL: string) {
      this.audioURL = newURL;
    },
    setCurrentTime(newTime: number) {
      if (this.player) {
        this.player.currentTime = newTime;
      }
    },
    addCurrentTime(addition: number) {
      if (this.player) {
        this.player.currentTime += addition;
      }
    },
    play() {
      if (this.player && !this.playing) {
        this.player?.play();
        this.playing = true;
      }
    },
    pause() {
      if (this.player && this.playing) {
        this.player.pause();
        this.playing = false;
      }
    },
    ondurationchange() {
      if (this.player) {
        this.duration = this.player.duration;
      }
    },
    ontimeupdate() {
      if (this.player) {
        this.currentTime = this.player.currentTime;
      }
    },
    onended() {
      this.playing = false;
    },
    playWithLength(start: number, length: number) {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      this.setCurrentTime(start / 1000);
      this.play();

      this.timeout = window.setTimeout(() => {
        this.pause();
      }, length);
    },
    reset() {
      this.audioURL = "";
      this.player = undefined;
    },
  },
});
