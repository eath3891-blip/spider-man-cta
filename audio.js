/**
 * Spidey Audio Synthesizer (Web Audio API) - Production Ready
 * Synthesizes authentic web-shooting "THWIP!", elastic string twangs,
 * adhesive latch pops, and celebration chimes without external audio assets.
 */

class SpideyAudio {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.muted = false;
    this.initialized = false;

    // Auto-unlock on first user gesture
    this.setupUnlockListeners();
  }

  setupUnlockListeners() {
    const unlock = () => {
      this.ensureContext();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
        this.initialized = true;
      }
    } catch (e) {
      console.warn('Web Audio API not supported on this browser:', e);
    }
  }

  ensureContext() {
    if (!this.initialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(this.muted ? 0.0 : 0.85, now + 0.05);
    }
    return this.muted;
  }

  // Iconic Spider-Man "THWIP!" web shooter sound
  playThwip() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // 1. High-pressure compressed air blast (Filtered White Noise)
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.14);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3600, now);
    filter.frequency.exponentialRampToValueAtTime(650, now + 0.11);
    filter.Q.setValueAtTime(4.2, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.linearRampToValueAtTime(0.38, now + 0.015);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    // 2. High-tension web string filament zing (Chirp)
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(960, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);

    oscGain.gain.setValueAtTime(0.001, now);
    oscGain.gain.linearRampToValueAtTime(0.22, now + 0.02);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    whiteNoise.start(now);
    osc.start(now);
    whiteNoise.stop(now + 0.14);
    osc.stop(now + 0.14);

    // Cleanup node connections
    setTimeout(() => {
      try {
        whiteNoise.disconnect();
        filter.disconnect();
        noiseGain.disconnect();
        osc.disconnect();
        oscGain.disconnect();
      } catch (_) {}
    }, 200);
  }

  // Web string stretched taut (Elastic resonant twang)
  playTwang(tension = 1.0) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq = 260 + Math.min(tension * 160, 380);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.72, now + 0.2);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.21);

    setTimeout(() => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch (_) {}
    }, 250);
  }

  // Web latching / sticking onto target
  playLatch() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.07);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.08);

    setTimeout(() => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch (_) {}
    }, 120);
  }

  // Spider-Sense tingling chime
  playSpiderSense() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    [1046, 1318, 1567].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.04, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.16);

      setTimeout(() => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch (_) {}
      }, 300);
    });
  }

  // Celebration connected chord
  playConnectSuccess() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const chords = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    chords.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);

      gain.gain.setValueAtTime(0.15, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.05);
      osc.stop(now + 0.85);

      setTimeout(() => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch (_) {}
      }, 1000);
    });
  }
}

// Global instance
window.spideyAudio = new SpideyAudio();
