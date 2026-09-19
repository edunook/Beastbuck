export class BattleAudio {
  constructor() {
    this.context = null;
    this.master = 0.55;
    this.sfx = 0.7;
    this.music = 0.18;
    this.muted = false;
    this.musicTimer = null;
    this.musicStep = 0;
  }

  unlock() {
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.context = new AudioContext();
    }
    if (this.context.state === 'suspended') this.context.resume().catch(() => {});
  }

  setMuted(value) {
    this.muted = Boolean(value);
  }

  setVolumes({ master, sfx, music }) {
    this.master = Math.max(0, Math.min(1, Number(master) || 0));
    this.sfx = Math.max(0, Math.min(1, Number(sfx) || 0));
    this.music = Math.max(0, Math.min(1, Number(music) || 0));
  }

  tone(frequency, duration, type = 'sine', volume = 0.08, slide = 0) {
    if (!this.context || this.muted) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const start = this.context.currentTime;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.linearRampToValueAtTime(Math.max(45, frequency + slide), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume * this.master * this.sfx, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  shoot() { this.tone(220, 0.07, 'square', 0.1, 180); }
  hit() { this.tone(130, 0.08, 'sawtooth', 0.08, -55); }
  jet() { this.tone(180, 0.06, 'triangle', 0.04, 70); }
  pickup() { this.tone(530, 0.12, 'sine', 0.08, 220); }
  countdown(step) { this.tone(step === 'GO' ? 720 : 430, step === 'GO' ? 0.2 : 0.12, 'square', 0.08, step === 'GO' ? 180 : 0); }

  startMusic() {
    if (!this.context || this.musicTimer) return;
    const notes = [147, 196, 220, 196, 165, 220, 247, 220];
    const playStep = () => {
      if (!this.context || this.muted || this.music <= 0) return;
      const note = notes[this.musicStep % notes.length];
      this.musicStep += 1;
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      const start = this.context.currentTime;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(note, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.045 * this.master * this.music, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.42);
      oscillator.connect(gain).connect(this.context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.45);
    };
    playStep();
    this.musicTimer = window.setInterval(playStep, 520);
  }

  stopMusic() {
    if (this.musicTimer) window.clearInterval(this.musicTimer);
    this.musicTimer = null;
  }

  destroy() {
    this.stopMusic();
    this.context?.close().catch(() => {});
  }
}
