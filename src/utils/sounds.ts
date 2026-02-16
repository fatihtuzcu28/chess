/**
 * Web Audio API ile programatik ses efektleri.
 * Harici dosya gerektirmez.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

/** Kısa ton çal */
function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

/** Normal hamle sesi */
export function playMoveSound() {
  playTone(600, 0.08, 'sine', 0.12);
  setTimeout(() => playTone(800, 0.06, 'sine', 0.08), 30);
}

/** Taş alma sesi */
export function playCaptureSound() {
  playTone(300, 0.12, 'square', 0.1);
  setTimeout(() => playTone(500, 0.08, 'sine', 0.12), 40);
  setTimeout(() => playTone(700, 0.06, 'sine', 0.08), 80);
}

/** Şah çekme sesi */
export function playCheckSound() {
  playTone(880, 0.1, 'sawtooth', 0.08);
  setTimeout(() => playTone(1100, 0.15, 'sine', 0.1), 60);
}

/** Mat / oyun sonu sesi */
export function playGameOverSound() {
  playTone(440, 0.2, 'sine', 0.12);
  setTimeout(() => playTone(350, 0.2, 'sine', 0.1), 150);
  setTimeout(() => playTone(260, 0.4, 'sine', 0.08), 300);
}

/** Rok sesi */
export function playCastleSound() {
  playTone(500, 0.07, 'sine', 0.1);
  setTimeout(() => playTone(600, 0.07, 'sine', 0.1), 60);
  setTimeout(() => playTone(700, 0.07, 'sine', 0.1), 120);
}

/** Terfi sesi */
export function playPromoteSound() {
  playTone(523, 0.1, 'sine', 0.12);
  setTimeout(() => playTone(659, 0.1, 'sine', 0.12), 80);
  setTimeout(() => playTone(784, 0.1, 'sine', 0.12), 160);
  setTimeout(() => playTone(1047, 0.15, 'sine', 0.1), 240);
}
