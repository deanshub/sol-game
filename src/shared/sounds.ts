let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  gainValue = 0.3,
  startTime = 0,
) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(gainValue, c.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + startTime + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(c.currentTime + startTime);
  osc.stop(c.currentTime + startTime + duration);
}

export function playCorrect() {
  playTone(523, 0.15, "sine", 0.25, 0);
  playTone(659, 0.15, "sine", 0.25, 0.1);
}

export function playError() {
  playTone(200, 0.25, "square", 0.15, 0);
  playTone(160, 0.3, "square", 0.15, 0.15);
}

export function playRoundComplete() {
  playTone(523, 0.15, "sine", 0.25, 0);
  playTone(659, 0.15, "sine", 0.25, 0.12);
  playTone(784, 0.15, "sine", 0.25, 0.24);
  playTone(1047, 0.3, "sine", 0.3, 0.36);
}

export function playVictory() {
  const notes = [523, 659, 784, 1047, 784, 1047, 1319];
  notes.forEach((freq, i) => {
    playTone(freq, 0.2, "sine", 0.25, i * 0.12);
  });
  notes.forEach((freq, i) => {
    playTone(freq * 1.5, 0.15, "triangle", 0.1, i * 0.12 + 0.05);
  });
}

export function playSnap() {
  playTone(880, 0.08, "sine", 0.2, 0);
}
