// One shared background-music element for the gate and the nav toggle.
let audio: HTMLAudioElement | null = null;
const listeners = new Set<(on: boolean) => void>();

export function getAudio(src = "/music/music.mp3", volume = 0.35) {
  if (typeof window === "undefined") return null;
  if (!audio) {
    audio = new Audio(src);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = volume;
    const emit = () => listeners.forEach((l) => l(!audio!.paused));
    audio.addEventListener("play", emit);
    audio.addEventListener("pause", emit);
  }
  return audio;
}

export function onAudioChange(fn: (on: boolean) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
