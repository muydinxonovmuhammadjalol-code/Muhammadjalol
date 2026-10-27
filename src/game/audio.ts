/**
 * Sound Management System for RING LEGACY Boxing
 * Advanced procedural Web Audio API architecture with multi-bus gain nodes,
 * dynamic crowd reactions, punch impact textures, referee cues, and round bells.
 */

export interface AudioSettings {
  masterVolume: number; // 0.0 to 1.0
  sfxVolume: number; // 0.0 to 1.0
  crowdVolume: number; // 0.0 to 1.0
  bellVolume: number; // 0.0 to 1.0
  isMuted: boolean;
}

class SoundManager {
  private ctx: AudioContext | null = null;

  // Audio Bus Gain Nodes
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private crowdGain: GainNode | null = null;
  private bellGain: GainNode | null = null;

  // Ambient crowd loop generator
  private ambientCrowdSource: AudioBufferSourceNode | null = null;
  private ambientCrowdFilter: BiquadFilterNode | null = null;
  private ambientCrowdGain: GainNode | null = null;
  private isAmbientRunning: boolean = false;

  // Settings
  public settings: AudioSettings = {
    masterVolume: 0.85,
    sfxVolume: 0.9,
    crowdVolume: 0.65,
    bellVolume: 0.85,
    isMuted: false,
  };

  constructor() {
    // Load persisted audio preferences if available
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ring_legacy_audio_settings');
        if (saved) {
          this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
      } catch (e) {
        // ignore storage parse errors
      }
    }
  }

  public init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.setupBuses();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private setupBuses() {
    if (!this.ctx) return;

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(
      this.settings.isMuted ? 0 : this.settings.masterVolume,
      this.ctx.currentTime
    );
    this.masterGain.connect(this.ctx.destination);

    // SFX bus (punches, whooshes, grunts)
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(this.settings.sfxVolume, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

    // Crowd bus
    this.crowdGain = this.ctx.createGain();
    this.crowdGain.gain.setValueAtTime(this.settings.crowdVolume, this.ctx.currentTime);
    this.crowdGain.connect(this.masterGain);

    // Bell bus
    this.bellGain = this.ctx.createGain();
    this.bellGain.gain.setValueAtTime(this.settings.bellVolume, this.ctx.currentTime);
    this.bellGain.connect(this.masterGain);
  }

  public saveSettings() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ring_legacy_audio_settings', JSON.stringify(this.settings));
    }
  }

  public setMasterVolume(val: number) {
    this.settings.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.settings.isMuted) {
      this.masterGain.gain.setValueAtTime(this.settings.masterVolume, this.ctx.currentTime);
    }
    this.saveSettings();
  }

  public setSfxVolume(val: number) {
    this.settings.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.settings.sfxVolume, this.ctx.currentTime);
    }
    this.saveSettings();
  }

  public setCrowdVolume(val: number) {
    this.settings.crowdVolume = Math.max(0, Math.min(1, val));
    if (this.crowdGain && this.ctx) {
      this.crowdGain.gain.setValueAtTime(this.settings.crowdVolume, this.ctx.currentTime);
    }
    this.saveSettings();
  }

  public setBellVolume(val: number) {
    this.settings.bellVolume = Math.max(0, Math.min(1, val));
    if (this.bellGain && this.ctx) {
      this.bellGain.gain.setValueAtTime(this.settings.bellVolume, this.ctx.currentTime);
    }
    this.saveSettings();
  }

  public setMuted(muted: boolean) {
    this.settings.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        muted ? 0 : this.settings.masterVolume,
        this.ctx.currentTime
      );
    }
    this.saveSettings();
  }

  public toggleMute(): boolean {
    this.setMuted(!this.settings.isMuted);
    return this.settings.isMuted;
  }

  // ==========================================
  // 1. ROUND BELL AUDIO CUES
  // ==========================================

  /**
   * Single Brass Championship Bell Strike
   */
  public playBell(pitch: number = 880, duration: number = 1.6) {
    if (this.settings.isMuted) return;
    this.init();
    if (!this.ctx || !this.bellGain) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();
    const hitGain = this.ctx.createGain();

    // Fundamental strike frequency (A5)
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(pitch, now);
    osc1.frequency.exponentialRampToValueAtTime(pitch * 0.995, now + duration);

    // Metallic overtone 1 (1.98x)
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(pitch * 1.98, now);
    osc2.frequency.exponentialRampToValueAtTime(pitch * 1.96, now + duration * 0.6);

    // Rim clang overtone 2 (3.12x)
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(pitch * 3.12, now);
    osc3.frequency.exponentialRampToValueAtTime(pitch * 3.08, now + 0.25);

    hitGain.gain.setValueAtTime(0.42, now);
    hitGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(hitGain);
    osc2.connect(hitGain);
    osc3.connect(hitGain);
    hitGain.connect(this.bellGain);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    osc1.stop(now + duration);
    osc2.stop(now + duration);
    osc3.stop(now + duration);
  }

  /**
   * Authentic Triple Bell Strike ("Ding! Ding! Ding!") for Round Start / End
   */
  public playTripleBell() {
    this.playBell(880, 1.4);
    setTimeout(() => this.playBell(880, 1.4), 220);
    setTimeout(() => this.playBell(880, 2.0), 440);
  }

  /**
   * 10-Second Warning Woodblock / Mallet Clapper
   */
  public playTenSecondWarning() {
    if (this.settings.isMuted) return;
    this.init();
    if (!this.ctx || !this.bellGain) return;

    const strikeClap = (delaySec: number) => {
      if (!this.ctx || !this.bellGain) return;
      const t = this.ctx.currentTime + delaySec;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.05);

      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      osc.connect(gain);
      gain.connect(this.bellGain);

      osc.start(t);
      osc.stop(t + 0.065);
    };

    // 3 rapid sharp woodblock claps
    strikeClap(0);
    strikeClap(0.14);
    strikeClap(0.28);
  }

  // ==========================================
  // 2. PUNCH AUDIO CUES
  // ==========================================

  /**
   * Glove Whoosh / Air Cut with subtle pitch variation
   */
  public playWhoosh(type: 'light' | 'heavy' = 'light') {
    if (this.settings.isMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const duration = type === 'heavy' ? 0.22 : 0.14;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';

    const startFreq = type === 'heavy' ? 320 : 480;
    const peakFreq = type === 'heavy' ? 780 : 1050;
    filter.frequency.setValueAtTime(startFreq, now);
    filter.frequency.exponentialRampToValueAtTime(peakFreq, now + duration * 0.45);
    filter.frequency.exponentialRampToValueAtTime(260, now + duration);
    filter.Q.value = type === 'heavy' ? 2.5 : 3.2;

    const gain = this.ctx.createGain();
    const maxGain = type === 'heavy' ? 0.38 : 0.25;
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.linearRampToValueAtTime(maxGain, now + duration * 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  /**
   * Detailed Layered Punch Impact Sound:
   * - Body thump (sine/triangle sweep)
   * - Leather snap (filtered noise burst)
   * - Punch resonance (cracking transient)
   */
  public playPunchImpact(
    type: 'jab' | 'cross' | 'uppercut' | 'blocked' | 'counter'
  ) {
    if (this.settings.isMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    // 1. Low Frequency Body Shock Thump
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();

    let startFreq = 140;
    let endFreq = 42;
    let subDuration = 0.16;
    let subVol = 0.35;

    if (type === 'cross') {
      startFreq = 110;
      endFreq = 36;
      subDuration = 0.24;
      subVol = 0.65;
    } else if (type === 'uppercut') {
      startFreq = 95;
      endFreq = 30;
      subDuration = 0.28;
      subVol = 0.75;
    } else if (type === 'counter') {
      startFreq = 135;
      endFreq = 32;
      subDuration = 0.26;
      subVol = 0.7;
    } else if (type === 'blocked') {
      startFreq = 160;
      endFreq = 65;
      subDuration = 0.12;
      subVol = 0.25;
    }

    subOsc.type = type === 'blocked' ? 'sine' : 'triangle';
    subOsc.frequency.setValueAtTime(startFreq, now);
    subOsc.frequency.exponentialRampToValueAtTime(endFreq, now + subDuration);

    subGain.gain.setValueAtTime(subVol, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + subDuration);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);

    subOsc.start(now);
    subOsc.stop(now + subDuration + 0.02);

    // 2. Leather Surface Snap (Glove Impact Transient)
    const snapLen = type === 'blocked' ? 0.06 : 0.09;
    const snapBuf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * snapLen), this.ctx.sampleRate);
    const snapData = snapBuf.getChannelData(0);
    for (let i = 0; i < snapData.length; i++) {
      snapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.015));
    }

    const snapSrc = this.ctx.createBufferSource();
    snapSrc.buffer = snapBuf;

    const snapFilter = this.ctx.createBiquadFilter();
    snapFilter.type = type === 'blocked' ? 'lowpass' : 'bandpass';
    snapFilter.frequency.setValueAtTime(type === 'blocked' ? 450 : 1600, now);
    snapFilter.Q.value = 2.2;

    const snapGain = this.ctx.createGain();
    const snapVol = type === 'counter' ? 0.65 : type === 'cross' || type === 'uppercut' ? 0.55 : 0.35;
    snapGain.gain.setValueAtTime(snapVol, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + snapLen);

    snapSrc.connect(snapFilter);
    snapFilter.connect(snapGain);
    snapGain.connect(this.sfxGain);

    snapSrc.start(now);

    // 3. Counter punch resonance / high sting
    if (type === 'counter') {
      const stingOsc = this.ctx.createOscillator();
      const stingGain = this.ctx.createGain();
      stingOsc.type = 'sawtooth';
      stingOsc.frequency.setValueAtTime(440, now);
      stingOsc.frequency.exponentialRampToValueAtTime(120, now + 0.18);

      stingGain.gain.setValueAtTime(0.3, now);
      stingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      stingOsc.connect(stingGain);
      stingGain.connect(this.sfxGain);

      stingOsc.start(now);
      stingOsc.stop(now + 0.22);
    }
  }

  /**
   * Fighter Vocal Exertion Grunt / Breath Sharp Exhale
   */
  public playGrunt(type: 'punch' | 'pain') {
    if (this.settings.isMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 'punch') {
      // Sharp breath / "Hup!"
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    } else {
      // Pain grunt / "Ugh!"
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.22);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    }

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // ==========================================
  // 3. CROWD & ARENA REACTION AUDIO CUES
  // ==========================================

  /**
   * Start Ambient Arena Crowd Murmur (subtle real arena background loop)
   */
  public startAmbientCrowd() {
    if (this.isAmbientRunning || !this.ctx || !this.crowdGain) return;
    if (this.settings.isMuted) return;

    try {
      // Create 4-second seamless looping pinkish noise buffer
      const duration = 4.0;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.05;
        b1 = 0.96300 * b1 + white * 0.11;
        b2 = 0.57000 * b2 + white * 0.22;
        data[i] = (b0 + b1 + b2) * 0.2;
      }

      this.ambientCrowdSource = this.ctx.createBufferSource();
      this.ambientCrowdSource.buffer = buffer;
      this.ambientCrowdSource.loop = true;

      this.ambientCrowdFilter = this.ctx.createBiquadFilter();
      this.ambientCrowdFilter.type = 'lowpass';
      this.ambientCrowdFilter.frequency.setValueAtTime(380, this.ctx.currentTime);

      this.ambientCrowdGain = this.ctx.createGain();
      this.ambientCrowdGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

      this.ambientCrowdSource.connect(this.ambientCrowdFilter);
      this.ambientCrowdFilter.connect(this.ambientCrowdGain);
      this.ambientCrowdGain.connect(this.crowdGain);

      this.ambientCrowdSource.start();
      this.isAmbientRunning = true;
    } catch (e) {
      // ambient loop fallback
    }
  }

  /**
   * Stop Ambient Arena Crowd
   */
  public stopAmbientCrowd() {
    if (this.ambientCrowdSource) {
      try {
        this.ambientCrowdSource.stop();
        this.ambientCrowdSource.disconnect();
      } catch (e) {}
      this.ambientCrowdSource = null;
    }
    this.isAmbientRunning = false;
  }

  /**
   * Crowd Gasp ("Oooooh!") when an opponent ducks / narrowly slips a punch
   */
  public playCrowdGasp() {
    if (this.settings.isMuted) return;
    this.init();
    if (!this.ctx || !this.crowdGain) return;

    const now = this.ctx.currentTime;
    const duration = 0.8;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(750, now + 0.25);
    filter.frequency.exponentialRampToValueAtTime(320, now + duration);
    filter.Q.value = 3.5;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.crowdGain);

    noise.start(now);
  }

  /**
   * Crowd Cheer & Arena Roar scaled by action intensity
   */
  public playCrowdCheer(intensity: 'mild' | 'heavy' | 'roar' = 'mild') {
    if (this.settings.isMuted) return;
    this.init();
    if (!this.ctx || !this.crowdGain) return;

    const now = this.ctx.currentTime;
    const duration = intensity === 'roar' ? 2.5 : intensity === 'heavy' ? 1.8 : 1.2;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';

    const startFreq = intensity === 'roar' ? 500 : 420;
    const peakFreq = intensity === 'roar' ? 1200 : 850;

    filter.frequency.setValueAtTime(startFreq, now);
    filter.frequency.linearRampToValueAtTime(peakFreq, now + duration * 0.35);
    filter.frequency.exponentialRampToValueAtTime(380, now + duration);
    filter.Q.value = 1.8;

    const gain = this.ctx.createGain();
    const peakVol = intensity === 'roar' ? 0.55 : intensity === 'heavy' ? 0.38 : 0.22;

    gain.gain.setValueAtTime(0.03, now);
    gain.gain.linearRampToValueAtTime(peakVol, now + duration * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.crowdGain);

    noise.start(now);
  }

  /**
   * Knockdown Heavy Impact + Arena Eruption
   */
  public playKnockdown() {
    if (this.settings.isMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    // Sub-bass heavy impact drop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(22, now + 0.65);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.75);

    // Trigger massive arena crowd roar
    setTimeout(() => {
      this.playCrowdCheer('roar');
    }, 120);
  }

  /**
   * Referee Count Vocal Cue ("ONE!", "TWO!", "TEN!")
   */
  public playRefCounter(countNumber: number) {
    if (this.settings.isMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    // Synthetic referee whistle / voice tone pulse
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const basePitch = 220 + countNumber * 15;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(basePitch, now);
    osc.frequency.linearRampToValueAtTime(basePitch * 1.25, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(basePitch * 0.8, now + 0.22);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * Victory Chime & Fanfare
   */
  public playVictoryFanfare() {
    if (this.settings.isMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((pitch, idx) => {
      setTimeout(() => {
        if (!this.ctx || !this.sfxGain) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch, now);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.65);
      }, idx * 140);
    });

    setTimeout(() => {
      this.playCrowdCheer('roar');
    }, 550);
  }
}

export const soundManager = new SoundManager();
// Alias for backward compatibility
export const boxingAudio = soundManager;
