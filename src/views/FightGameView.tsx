import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import {
  Shield,
  Volume2,
  VolumeX,
  Volume1,
  RotateCcw,
  Play,
  Pause,
  Award,
  Zap,
  Flame,
  ArrowLeft,
  Swords,
  CheckCircle,
  SlidersHorizontal,
  X,
  Radio,
  Sparkles,
} from 'lucide-react';
import { CombatEngine } from '../game/CombatEngine';
import { boxingAudio, soundManager } from '../game/audio';
import { Fighter } from '../types';
import { Language, translations } from '../i18n/translations';

/**
 * Calculates a dynamic green-to-red color transition based on percentage.
 * 100% -> #22c55e (Vibrant Emerald Green)
 * 75%  -> #84cc16 (Lime Green)
 * 50%  -> #eab308 (Championship Gold / Yellow)
 * 25%  -> #f97316 (Warning Orange)
 * 0%   -> #ef4444 (Critical Crimson Red)
 */
export function getHealthColor(percentage: number) {
  const p = Math.max(0, Math.min(100, percentage));
  let r: number, g: number, b: number;
  if (p >= 50) {
    // 50% to 100%: Yellow (234, 179, 8) -> Green (34, 197, 94)
    const t = (p - 50) / 50;
    r = Math.round(234 - t * (234 - 34));
    g = Math.round(179 + t * (197 - 179));
    b = Math.round(8 + t * (94 - 8));
  } else {
    // 0% to 50%: Red (239, 68, 68) -> Yellow (234, 179, 8)
    const t = p / 50;
    r = Math.round(239 + t * (234 - 239));
    g = Math.round(68 + t * (179 - 68));
    b = Math.round(68 + t * (8 - 68));
  }
  const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  return {
    hex,
    rgb: `rgb(${r}, ${g}, ${b})`,
    border: `rgba(${r}, ${g}, ${b}, 0.65)`,
    glow: `0 0 10px rgba(${r}, ${g}, ${b}, 0.55)`,
  };
}

// Module-level reusable helper vector for zero-GC 60fps head tracking
const _projectVec = new THREE.Vector3();

interface FightGameViewProps {
  fighters: Fighter[];
  lang: Language;
  onExit: () => void;
}

type GamePhase = 'title' | 'playing' | 'paused' | 'gameover';

export const FightGameView: React.FC<FightGameViewProps> = ({
  fighters,
  lang,
  onExit,
}) => {
  const t = translations[lang];

  // Game Phases: 'title' | 'playing' | 'paused' | 'gameover'
  const [phase, setPhase] = useState<GamePhase>('title');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(fighters[0]?.id || 'fighter-001');
  const [selectedAiId, setSelectedAiId] = useState<string>(
    fighters.length > 1 ? fighters[1].id : fighters[0]?.id || 'fighter-002'
  );

  // HUD stats mirrored to React state for UI rendering
  const [playerHp, setPlayerHp] = useState(100);
  const [playerStamina, setPlayerStamina] = useState(100);
  const [aiHp, setAiHp] = useState(100);
  const [aiStamina, setAiStamina] = useState(100);
  const [roundTime, setRoundTime] = useState(60);
  const [combo, setCombo] = useState(0);
  const [hitFeedback, setHitFeedback] = useState('');
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);

  // Real-Time Overhead Health Bar Tracking State & Refs
  const playerOverheadRef = useRef<HTMLDivElement>(null);
  const aiOverheadRef = useRef<HTMLDivElement>(null);
  const [playerActionState, setPlayerActionState] = useState<string>('idle');
  const [aiActionState, setAiActionState] = useState<string>('idle');
  const [playerGhostHp, setPlayerGhostHp] = useState(100);
  const [aiGhostHp, setAiGhostHp] = useState(100);

  // Delayed trailing ghost health bar for punch impact feedback
  useEffect(() => {
    const timer = setTimeout(() => {
      setPlayerGhostHp(playerHp);
    }, 280);
    return () => clearTimeout(timer);
  }, [playerHp]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAiGhostHp(aiHp);
    }, 280);
    return () => clearTimeout(timer);
  }, [aiHp]);

  // Dynamic green-to-red color transition based on percentage
  const playerColor = getHealthColor(playerHp);
  const aiColor = getHealthColor(aiHp);

  // Sound Management State
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [audioSettings, setAudioSettings] = useState(() => ({
    master: Math.round(soundManager.settings.masterVolume * 100),
    sfx: Math.round(soundManager.settings.sfxVolume * 100),
    crowd: Math.round(soundManager.settings.crowdVolume * 100),
    bell: Math.round(soundManager.settings.bellVolume * 100),
    isMuted: soundManager.settings.isMuted,
  }));
  const [isMuted, setIsMuted] = useState(soundManager.settings.isMuted);

  // Canvas mount container
  const canvasMountRef = useRef<HTMLDivElement>(null);

  // Mutable Game Loop references (prevents React re-renders from breaking loop)
  const engineRef = useRef<CombatEngine | null>(null);
  const reqIdRef = useRef<number | null>(null);
  const keysHeld = useRef<{ [key: string]: boolean }>({});

  const playerFighter = fighters.find((f) => f.id === selectedPlayerId) || fighters[0];
  const aiFighter = fighters.find((f) => f.id === selectedAiId) || fighters[1] || fighters[0];

  // Initialize Three.js scene & Combat Engine once
  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07080a);
    scene.fog = new THREE.FogExp2(0x07080a, 0.032);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    camera.position.set(0, 4.2, -4.8); // Ringside perspective behind player
    camera.lookAt(0, 1.4, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x2a2e38, 0.9);
    scene.add(ambientLight);

    // Main overhead light truss
    const mainSpot = new THREE.SpotLight(0xfff3e0, 3.8);
    mainSpot.position.set(0, 9.5, 0);
    mainSpot.angle = Math.PI / 3.5;
    mainSpot.penumbra = 0.4;
    mainSpot.castShadow = true;
    scene.add(mainSpot);

    // Corner colored lights
    const redCornerLight = new THREE.SpotLight(0xdc2626, 2.5);
    redCornerLight.position.set(-4, 7, -4);
    redCornerLight.target.position.set(-2, 1, -2);
    scene.add(redCornerLight);
    scene.add(redCornerLight.target);

    const blueCornerLight = new THREE.SpotLight(0x2563eb, 2.5);
    blueCornerLight.position.set(4, 7, 4);
    blueCornerLight.target.position.set(2, 1, 2);
    scene.add(blueCornerLight);
    scene.add(blueCornerLight.target);

    // 4. Build 3D Boxing Ring
    const ringGroup = new THREE.Group();

    // Canvas Platform
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(7, 0.8, 7),
      new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: 0.85 })
    );
    platform.position.y = 0.4;
    platform.receiveShadow = true;
    ringGroup.add(platform);

    // Mat Canvas Top Surface
    const canvasTop = new THREE.Mesh(
      new THREE.PlaneGeometry(6.6, 6.6),
      new THREE.MeshStandardMaterial({ color: 0xd9dde5, roughness: 0.9 })
    );
    canvasTop.rotation.x = -Math.PI / 2;
    canvasTop.position.y = 0.81;
    canvasTop.receiveShadow = true;
    ringGroup.add(canvasTop);

    // Ring Center Championship Emblem
    const centerRing = new THREE.Mesh(
      new THREE.RingGeometry(0.8, 1.4, 32),
      new THREE.MeshBasicMaterial({ color: 0xd4af37, side: THREE.DoubleSide })
    );
    centerRing.rotation.x = -Math.PI / 2;
    centerRing.position.y = 0.815;
    ringGroup.add(centerRing);

    // Corner Posts & Pads
    const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.8, 16);
    const postMatRed = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.3 });
    const postMatBlue = new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.3 });
    const postMatWhite = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.3 });

    const posts = [
      { x: -3.3, z: -3.3, mat: postMatRed },
      { x: 3.3, z: 3.3, mat: postMatBlue },
      { x: -3.3, z: 3.3, mat: postMatWhite },
      { x: 3.3, z: -3.3, mat: postMatWhite },
    ];

    posts.forEach((p) => {
      const post = new THREE.Mesh(postGeo, p.mat);
      post.position.set(p.x, 1.8, p.z);
      ringGroup.add(post);

      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.8, 0.35), p.mat);
      pad.position.set(p.x * 0.94, 1.9, p.z * 0.94);
      ringGroup.add(pad);
    });

    // 4 Ropes
    const ropeHeights = [1.2, 1.6, 2.0, 2.4];
    ropeHeights.forEach((rh, idx) => {
      const ropeMat = new THREE.MeshStandardMaterial({
        color: idx % 2 === 0 ? 0xdc2626 : 0xf8fafc,
        roughness: 0.5,
      });

      const r1 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 6.4, 8), ropeMat);
      r1.rotation.z = Math.PI / 2;
      r1.position.set(0, rh, -3.2);
      ringGroup.add(r1);

      const r2 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 6.4, 8), ropeMat);
      r2.rotation.z = Math.PI / 2;
      r2.position.set(0, rh, 3.2);
      ringGroup.add(r2);

      const r3 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 6.4, 8), ropeMat);
      r3.rotation.x = Math.PI / 2;
      r3.position.set(-3.2, rh, 0);
      ringGroup.add(r3);

      const r4 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 6.4, 8), ropeMat);
      r4.rotation.x = Math.PI / 2;
      r4.position.set(3.2, rh, 0);
      ringGroup.add(r4);
    });

    scene.add(ringGroup);

    // 5. Initialize Combat Engine
    const combatEngine = new CombatEngine(playerFighter.nationality, aiFighter.nationality);
    scene.add(combatEngine.player.group);
    scene.add(combatEngine.ai.group);
    scene.add(combatEngine.particleSystem);
    engineRef.current = combatEngine;

    // 6. Responsive Keyboard Input Listeners
    const onKeyDown = (e: KeyboardEvent) => {
      keysHeld.current[e.key.toLowerCase()] = true;

      // Global hotkey: 'M' toggles mute
      if (e.key.toLowerCase() === 'm') {
        toggleMute();
      }

      // Start fight if on title screen
      if ((e.key === 'Enter' || e.key === ' ') && phase === 'title') {
        e.preventDefault();
        startGame();
        return;
      }

      // Edge-triggered actions during playing phase
      if (phase === 'playing' && engineRef.current) {
        if (e.key.toLowerCase() === 'j' || e.key.toLowerCase() === 'z') {
          engineRef.current.playerAttack('jab');
        } else if (e.key.toLowerCase() === 'k' || e.key.toLowerCase() === 'x') {
          engineRef.current.playerAttack('cross');
        } else if (e.key.toLowerCase() === 'l' || e.key.toLowerCase() === 'c') {
          engineRef.current.playerAttack('uppercut');
        } else if (e.key === ' ' || e.key === 'Shift') {
          e.preventDefault();
          engineRef.current.playerBlock(true);
        } else if (e.key.toLowerCase() === 'e' || e.key.toLowerCase() === 'q') {
          engineRef.current.playerSlip();
        } else if (e.key === 'Escape') {
          if (phase === 'playing') {
            pauseGame();
          } else if (phase === 'paused') {
            resumeGame();
          }
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysHeld.current[e.key.toLowerCase()] = false;
      if (phase === 'playing' && engineRef.current) {
        if (e.key === ' ' || e.key === 'Shift') {
          engineRef.current.playerBlock(false);
        }
      }
    };

    const onBlur = () => {
      keysHeld.current = {};
      if (engineRef.current) {
        engineRef.current.playerBlock(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    // 7. 60fps Game Loop
    let lastTime = performance.now();
    let hudUpdateCounter = 0;

    const animate = (currentTime: number) => {
      reqIdRef.current = requestAnimationFrame(animate);
      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const dt = Math.min(rawDt, 0.05);

      const engine = engineRef.current;
      if (!engine) return;

      if (phase === 'playing') {
        // Compute player inputs
        const k = keysHeld.current;
        let forward = 0;
        let strafe = 0;

        if (k['w'] || k['arrowup']) forward += 1;
        if (k['s'] || k['arrowdown']) forward -= 1;
        if (k['a'] || k['arrowleft']) strafe += 1;
        if (k['d'] || k['arrowright']) strafe -= 1;

        engine.update(dt, { forward, strafe });

        // Check Victory / Knockdown / Round Expiry
        if (engine.stats.aiHealth <= 0) {
          setWinner('player');
          setPhase('gameover');
          soundManager.stopAmbientCrowd();
          soundManager.playVictoryFanfare();
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        } else if (engine.stats.playerHealth <= 0) {
          setWinner('ai');
          setPhase('gameover');
          soundManager.stopAmbientCrowd();
        } else if (engine.stats.roundTimeRemaining <= 0) {
          const won = engine.stats.playerScore >= engine.stats.aiScore;
          setWinner(won ? 'player' : 'ai');
          setPhase('gameover');
          soundManager.stopAmbientCrowd();
          if (won) {
            soundManager.playVictoryFanfare();
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          }
        }

        // Camera smoothly tracks mid-point of fighters
        const midPoint = engine.player.group.position
          .clone()
          .add(engine.ai.group.position)
          .multiplyScalar(0.5);

        // Shake offset
        const shake = engine.cameraShakeTrauma;
        const shakeX = (Math.random() - 0.5) * shake * 0.4;
        const shakeY = (Math.random() - 0.5) * shake * 0.4;

        // Dynamic 3D cinematic over-the-shoulder follow camera
        const targetCamX = engine.player.group.position.x * 0.6 + shakeX;
        const targetCamY = 2.8 + shakeY;
        const targetCamZ = engine.player.group.position.z - 2.8;

        camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 6, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 6, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 6, dt);
        camera.lookAt(midPoint.x, 1.45, midPoint.z);

        // Real-Time 3D Projection of Overhead Health Bars
        if (container) {
          const w = container.clientWidth;
          const h = container.clientHeight;

          // 1. Player Overhead Health Bar Tracking
          if (playerOverheadRef.current && engine.player) {
            const pHead = engine.player.getHeadWorldPos();
            _projectVec.copy(pHead);
            _projectVec.y += 0.44; // Positioned cleanly above boxer's head
            _projectVec.project(camera);

            if (
              _projectVec.z < 1.0 &&
              _projectVec.x >= -1.2 &&
              _projectVec.x <= 1.2 &&
              _projectVec.y >= -1.2 &&
              _projectVec.y <= 1.2
            ) {
              const screenX = (_projectVec.x * 0.5 + 0.5) * w;
              const screenY = (-_projectVec.y * 0.5 + 0.5) * h;
              const dist = camera.position.distanceTo(pHead);
              const scale = THREE.MathUtils.clamp(1.12 - (dist - 2.8) * 0.1, 0.72, 1.15);

              playerOverheadRef.current.style.display = 'block';
              playerOverheadRef.current.style.transform = `translate3d(${screenX}px, ${screenY}px, 0) translate(-50%, -100%) scale(${scale})`;
            } else {
              playerOverheadRef.current.style.display = 'none';
            }
          }

          // 2. AI Overhead Health Bar Tracking
          if (aiOverheadRef.current && engine.ai) {
            const aiHead = engine.ai.getHeadWorldPos();
            _projectVec.copy(aiHead);
            _projectVec.y += 0.44; // Positioned cleanly above boxer's head
            _projectVec.project(camera);

            if (
              _projectVec.z < 1.0 &&
              _projectVec.x >= -1.2 &&
              _projectVec.x <= 1.2 &&
              _projectVec.y >= -1.2 &&
              _projectVec.y <= 1.2
            ) {
              const screenX = (_projectVec.x * 0.5 + 0.5) * w;
              const screenY = (-_projectVec.y * 0.5 + 0.5) * h;
              const dist = camera.position.distanceTo(aiHead);
              const scale = THREE.MathUtils.clamp(1.12 - (dist - 2.8) * 0.1, 0.72, 1.15);

              aiOverheadRef.current.style.display = 'block';
              aiOverheadRef.current.style.transform = `translate3d(${screenX}px, ${screenY}px, 0) translate(-50%, -100%) scale(${scale})`;
            } else {
              aiOverheadRef.current.style.display = 'none';
            }
          }
        }

        // Throttled HUD update for 60fps render smoothness
        hudUpdateCounter++;
        if (hudUpdateCounter % 2 === 0) {
          setPlayerHp(Math.round(engine.stats.playerHealth));
          setPlayerStamina(Math.round(engine.stats.playerStamina));
          setAiHp(Math.round(engine.stats.aiHealth));
          setAiStamina(Math.round(engine.stats.aiStamina));
          setRoundTime(Math.ceil(engine.stats.roundTimeRemaining));
          setCombo(engine.stats.comboCount);
          setHitFeedback(engine.stats.lastHitText);
          setPlayerActionState(engine.player.state);
          setAiActionState(engine.ai.state);
        }
      } else if (phase === 'title') {
        if (playerOverheadRef.current) playerOverheadRef.current.style.display = 'none';
        if (aiOverheadRef.current) aiOverheadRef.current.style.display = 'none';

        // Atmospheric live-world circular camera pan around the ring on Title Screen
        const time = currentTime * 0.0004;
        camera.position.x = Math.sin(time) * 6.5;
        camera.position.y = 3.6 + Math.cos(time * 0.7) * 0.5;
        camera.position.z = Math.cos(time) * 6.5;
        camera.lookAt(0, 1.4, 0);

        engine.player.update(dt);
        engine.ai.update(dt);
      }

      renderer.render(scene, camera);
    };

    reqIdRef.current = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      soundManager.stopAmbientCrowd();
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [phase, selectedPlayerId, selectedAiId]);

  const startGame = () => {
    soundManager.init();
    soundManager.playTripleBell();
    soundManager.startAmbientCrowd();
    if (engineRef.current) {
      engineRef.current.resetRound();
    }
    setWinner(null);
    setPhase('playing');
  };

  const pauseGame = () => {
    setPhase('paused');
    soundManager.stopAmbientCrowd();
  };

  const resumeGame = () => {
    setPhase('playing');
    soundManager.startAmbientCrowd();
  };

  const toggleMute = () => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
    setAudioSettings((prev) => ({ ...prev, isMuted: nextMuted }));
  };

  const updateMasterVolume = (val: number) => {
    soundManager.setMasterVolume(val / 100);
    setAudioSettings((prev) => ({ ...prev, master: val, isMuted: soundManager.settings.isMuted }));
    setIsMuted(soundManager.settings.isMuted);
  };

  const updateSfxVolume = (val: number) => {
    soundManager.setSfxVolume(val / 100);
    setAudioSettings((prev) => ({ ...prev, sfx: val }));
  };

  const updateCrowdVolume = (val: number) => {
    soundManager.setCrowdVolume(val / 100);
    setAudioSettings((prev) => ({ ...prev, crowd: val }));
  };

  const updateBellVolume = (val: number) => {
    soundManager.setBellVolume(val / 100);
    setAudioSettings((prev) => ({ ...prev, bell: val }));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black select-none">
      {/* 1. Isolated 3D Canvas Mount (Zero-Occlusion 85%+ viewport) */}
      <div ref={canvasMountRef} className="absolute inset-0 z-0" />

      {/* 2. TITLE SCREEN (Atmospheric Hero & Bespoke Lockup) */}
      {phase === 'title' && (
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-12 pointer-events-auto bg-gradient-to-t from-black/90 via-black/40 to-black/60">
          {/* Top Bar with Exit, Sound Settings, and Mute */}
          <div className="flex items-center justify-between">
            <button
              onClick={onExit}
              className="flex items-center gap-2 px-3.5 py-2 bg-black/60 hover:bg-black/90 text-white border border-[#2B303C] rounded-lg text-xs font-mono uppercase transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
              <span>Back to Ring Legacy</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAudioModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-black/60 hover:bg-black/90 text-[#D4AF37] border border-[#2B303C] rounded-lg text-xs font-mono transition-colors"
                title="Audio Management"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Audio Settings</span>
              </button>
              <button
                onClick={toggleMute}
                className="p-2.5 bg-black/60 hover:bg-black/90 text-[#D4AF37] border border-[#2B303C] rounded-lg transition-colors"
                title="Toggle Audio [M]"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Center Lockup: Title & Start CTA */}
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/60 border border-[#D4AF37]/40 rounded text-xs font-mono text-[#D4AF37] uppercase tracking-widest">
              <Swords className="w-4 h-4" />
              <span>Real-Time 3D Boxing Simulation</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black font-display uppercase tracking-tight text-white leading-none">
              {t.gameTitle}
            </h1>

            <p className="text-sm sm:text-base text-[#C5CAD5] leading-relaxed max-w-lg mx-auto">
              {t.gameSub}
            </p>

            {/* Fighter Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-2">
              <div className="text-left space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-red-400 font-bold block">
                  Red Corner (You)
                </label>
                <select
                  value={selectedPlayerId}
                  onChange={(e) => setSelectedPlayerId(e.target.value)}
                  className="w-full bg-[#11141B] border border-red-500/40 text-white text-xs rounded-lg px-3 py-2 focus:outline-none"
                >
                  {fighters.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.nationality})
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-left space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-blue-400 font-bold block">
                  Blue Corner (Opponent)
                </label>
                <select
                  value={selectedAiId}
                  onChange={(e) => setSelectedAiId(e.target.value)}
                  className="w-full bg-[#11141B] border border-blue-500/40 text-white text-xs rounded-lg px-3 py-2 focus:outline-none"
                >
                  {fighters.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.nationality})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Primary Start CTA */}
            <div className="pt-4">
              <button
                onClick={startGame}
                className="px-8 py-4 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-black text-sm uppercase tracking-wider font-display rounded-lg transition-transform hover:scale-105 shadow-xl shadow-[#D4AF37]/20"
              >
                {t.startFight}
              </button>
              <p className="text-[11px] text-[#8E95A5] mt-2 font-mono">
                {t.pressToStart}
              </p>
            </div>
          </div>

          {/* Control Hint Line */}
          <div className="text-center text-xs font-mono text-[#8E95A5] border-t border-white/10 pt-4">
            <span className="text-white font-bold">Controls:</span> WASD Move · J Jab · K Cross · L Uppercut · Space Block · E Slip
          </div>
        </div>
      )}

      {/* 2.5 REAL-TIME OVERHEAD HEALTH BARS (Floats right above fighters' heads in 3D projection) */}
      {(phase === 'playing' || phase === 'paused') && (
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden select-none">
          {/* Player Overhead Health Bar */}
          <div
            ref={playerOverheadRef}
            className="absolute top-0 left-0 transition-opacity duration-200 pointer-events-none will-change-transform z-20"
            style={{ display: 'none' }}
          >
            <div className="flex flex-col items-center w-36 sm:w-44 select-none">
              {/* Fighter Header & HP % */}
              <div className="flex items-center justify-between w-full px-1 mb-1 text-[10px] font-mono font-bold leading-tight drop-shadow-md">
                <span className="flex items-center gap-1.5 text-red-400 font-display uppercase tracking-wider truncate max-w-[105px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shadow-sm shadow-red-500" />
                  {playerFighter.name}
                </span>
                <span
                  className="font-mono-numbers font-black transition-colors duration-200"
                  style={{ color: playerColor.hex }}
                >
                  {playerHp}%
                </span>
              </div>

              {/* Health Bar Shell */}
              <div
                className="w-full h-2.5 sm:h-3 bg-[#0d1017]/95 rounded-full overflow-hidden p-0.5 border transition-all duration-300"
                style={{
                  borderColor: playerHp < 35 ? playerColor.border : 'rgba(255, 255, 255, 0.22)',
                  boxShadow: playerColor.glow,
                }}
              >
                <div className="relative w-full h-full rounded-full overflow-hidden bg-black/60">
                  {/* Trailing Ghost Damage Bar */}
                  <div
                    className="absolute top-0 left-0 h-full bg-amber-400/50 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${playerGhostHp}%` }}
                  />

                  {/* Dynamic Green-to-Red Depleting Health Fill */}
                  <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-150 ease-out"
                    style={{
                      width: `${playerHp}%`,
                      backgroundColor: playerColor.hex,
                      background: `linear-gradient(90deg, ${playerColor.hex}, ${playerColor.hex}dd)`,
                    }}
                  />
                </div>
              </div>

              {/* Action State Indicator Tag */}
              <div className="mt-1 flex items-center gap-1 min-h-[14px]">
                {playerActionState === 'block' && (
                  <span className="px-1.5 py-0.2 bg-blue-600/80 border border-blue-400 text-white rounded text-[8px] font-mono uppercase font-bold tracking-wider">
                    Shield Block
                  </span>
                )}
                {playerActionState === 'slip' && (
                  <span className="px-1.5 py-0.2 bg-emerald-600/80 border border-emerald-400 text-white rounded text-[8px] font-mono uppercase font-bold tracking-wider">
                    Slipped
                  </span>
                )}
                {playerActionState === 'hit' && (
                  <span className="px-1.5 py-0.2 bg-red-600/90 border border-red-400 text-white rounded text-[8px] font-mono uppercase font-black tracking-wider animate-bounce">
                    Impact!
                  </span>
                )}
                {playerActionState === 'knockdown' && (
                  <span className="px-1.5 py-0.2 bg-red-700 border border-red-500 text-white rounded text-[8px] font-mono uppercase font-black tracking-widest animate-pulse">
                    Down!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* AI Overhead Health Bar */}
          <div
            ref={aiOverheadRef}
            className="absolute top-0 left-0 transition-opacity duration-200 pointer-events-none will-change-transform z-20"
            style={{ display: 'none' }}
          >
            <div className="flex flex-col items-center w-36 sm:w-44 select-none">
              {/* Fighter Header & HP % */}
              <div className="flex items-center justify-between w-full px-1 mb-1 text-[10px] font-mono font-bold leading-tight drop-shadow-md">
                <span className="flex items-center gap-1.5 text-blue-400 font-display uppercase tracking-wider truncate max-w-[105px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block shadow-sm shadow-blue-500" />
                  {aiFighter.name}
                </span>
                <span
                  className="font-mono-numbers font-black transition-colors duration-200"
                  style={{ color: aiColor.hex }}
                >
                  {aiHp}%
                </span>
              </div>

              {/* Health Bar Shell */}
              <div
                className="w-full h-2.5 sm:h-3 bg-[#0d1017]/95 rounded-full overflow-hidden p-0.5 border transition-all duration-300"
                style={{
                  borderColor: aiHp < 35 ? aiColor.border : 'rgba(255, 255, 255, 0.22)',
                  boxShadow: aiColor.glow,
                }}
              >
                <div className="relative w-full h-full rounded-full overflow-hidden bg-black/60">
                  {/* Trailing Ghost Damage Bar */}
                  <div
                    className="absolute top-0 left-0 h-full bg-amber-400/50 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${aiGhostHp}%` }}
                  />

                  {/* Dynamic Green-to-Red Depleting Health Fill */}
                  <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-150 ease-out"
                    style={{
                      width: `${aiHp}%`,
                      backgroundColor: aiColor.hex,
                      background: `linear-gradient(90deg, ${aiColor.hex}, ${aiColor.hex}dd)`,
                    }}
                  />
                </div>
              </div>

              {/* Action State Indicator Tag */}
              <div className="mt-1 flex items-center gap-1 min-h-[14px]">
                {aiActionState === 'block' && (
                  <span className="px-1.5 py-0.2 bg-blue-600/80 border border-blue-400 text-white rounded text-[8px] font-mono uppercase font-bold tracking-wider">
                    Shield Block
                  </span>
                )}
                {aiActionState === 'slip' && (
                  <span className="px-1.5 py-0.2 bg-emerald-600/80 border border-emerald-400 text-white rounded text-[8px] font-mono uppercase font-bold tracking-wider">
                    Slipped
                  </span>
                )}
                {aiActionState === 'hit' && (
                  <span className="px-1.5 py-0.2 bg-red-600/90 border border-red-400 text-white rounded text-[8px] font-mono uppercase font-black tracking-wider animate-bounce">
                    Impact!
                  </span>
                )}
                {aiActionState === 'knockdown' && (
                  <span className="px-1.5 py-0.2 bg-red-700 border border-red-500 text-white rounded text-[8px] font-mono uppercase font-black tracking-widest animate-pulse">
                    Down!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. PLAYING HUD (World-Matched, Low-Occlusion UI) */}
      {(phase === 'playing' || phase === 'paused') && (
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 sm:p-6">
          {/* Top Status Clusters: Player vs AI Health Bars */}
          <div className="flex items-start justify-between gap-4">
            {/* Player Red Corner (Left) */}
            <div className="w-44 sm:w-64 space-y-1.5 pointer-events-auto">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-red-400 font-display uppercase tracking-wider truncate">
                  {playerFighter.name}
                </span>
                <span
                  className="font-mono-numbers font-black text-sm transition-colors duration-200"
                  style={{ color: playerColor.hex }}
                >
                  {playerHp}%
                </span>
              </div>
              {/* HP Bar */}
              <div className="w-full bg-[#1E232E] rounded-full h-3 overflow-hidden border border-white/20 relative">
                {/* Ghost Bar */}
                <div
                  className="absolute top-0 left-0 h-full bg-amber-400/40 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${playerGhostHp}%` }}
                />
                <div
                  className="h-full rounded-full transition-all duration-200 relative"
                  style={{
                    width: `${playerHp}%`,
                    backgroundColor: playerColor.hex,
                    boxShadow: playerColor.glow,
                  }}
                />
              </div>
              {/* Stamina Bar */}
              <div className="w-full bg-[#161922] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#D4AF37] h-full rounded-full transition-all duration-150"
                  style={{ width: `${playerStamina}%` }}
                />
              </div>
            </div>

            {/* Center Round Timer & Pause */}
            <div className="text-center pointer-events-auto space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] block font-bold">
                {t.round} 1
              </span>
              <div className="bg-black/75 backdrop-blur-md px-4 py-1.5 rounded-lg border border-[#2B303C] font-mono-numbers text-xl font-bold text-white">
                0:{roundTime < 10 ? `0${roundTime}` : roundTime}
              </div>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  onClick={() => {
                    if (phase === 'playing') pauseGame();
                    else resumeGame();
                  }}
                  className="p-1 text-[#8E95A5] hover:text-white"
                  title="Pause (ESC)"
                >
                  {phase === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
                <button
                  onClick={toggleMute}
                  className="p-1 text-[#8E95A5] hover:text-white"
                  title="Toggle Audio [M]"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#D4AF37]" />}
                </button>
                <button
                  onClick={() => {
                    pauseGame();
                    setIsAudioModalOpen(true);
                  }}
                  className="p-1 text-[#8E95A5] hover:text-[#D4AF37]"
                  title="Audio System Settings"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* AI Blue Corner (Right) */}
            <div className="w-44 sm:w-64 space-y-1.5 pointer-events-auto text-right">
              <div className="flex items-center justify-between text-xs">
                <span
                  className="font-mono-numbers font-black text-sm transition-colors duration-200"
                  style={{ color: aiColor.hex }}
                >
                  {aiHp}%
                </span>
                <span className="font-bold text-blue-400 font-display uppercase tracking-wider truncate">
                  {aiFighter.name}
                </span>
              </div>
              {/* HP Bar */}
              <div className="w-full bg-[#1E232E] rounded-full h-3 overflow-hidden border border-white/20 flex justify-end relative">
                {/* Ghost Bar */}
                <div
                  className="absolute top-0 right-0 h-full bg-amber-400/40 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${aiGhostHp}%` }}
                />
                <div
                  className="h-full rounded-full transition-all duration-200 relative"
                  style={{
                    width: `${aiHp}%`,
                    backgroundColor: aiColor.hex,
                    boxShadow: aiColor.glow,
                  }}
                />
              </div>
              {/* Stamina Bar */}
              <div className="w-full bg-[#161922] rounded-full h-1.5 overflow-hidden flex justify-end">
                <div
                  className="bg-blue-400 h-full rounded-full transition-all duration-150"
                  style={{ width: `${aiStamina}%` }}
                />
              </div>
            </div>
          </div>

          {/* Center Dynamic Hit Feedback Toast */}
          {hitFeedback && (
            <div className="text-center pointer-events-none animate-bounce">
              <span className="inline-block bg-black/80 px-4 py-1.5 rounded-lg border border-[#D4AF37]/50 text-sm font-black font-display uppercase tracking-wider text-[#D4AF37] shadow-lg">
                {hitFeedback} {combo > 1 && `(${combo}x COMBO!)`}
              </span>
            </div>
          )}

          {/* Bottom Controls Strip: Desktop Hints + Mobile Touch Buttons */}
          <div className="space-y-3 pointer-events-auto">
            {/* Mobile Touch Action Buttons */}
            <div className="flex items-center justify-between gap-2 max-w-lg mx-auto sm:hidden">
              <button
                onTouchStart={() => engineRef.current?.playerAttack('jab')}
                onClick={() => engineRef.current?.playerAttack('jab')}
                className="flex-1 py-3 bg-red-600/80 active:bg-red-500 text-white font-bold rounded-lg text-xs uppercase"
              >
                Jab
              </button>
              <button
                onTouchStart={() => engineRef.current?.playerAttack('cross')}
                onClick={() => engineRef.current?.playerAttack('cross')}
                className="flex-1 py-3 bg-red-700/80 active:bg-red-600 text-white font-bold rounded-lg text-xs uppercase"
              >
                Cross
              </button>
              <button
                onTouchStart={() => engineRef.current?.playerAttack('uppercut')}
                onClick={() => engineRef.current?.playerAttack('uppercut')}
                className="flex-1 py-3 bg-amber-600/80 active:bg-amber-500 text-white font-bold rounded-lg text-xs uppercase"
              >
                Upper
              </button>
              <button
                onTouchStart={() => engineRef.current?.playerBlock(true)}
                onTouchEnd={() => engineRef.current?.playerBlock(false)}
                className="flex-1 py-3 bg-[#2A3040] active:bg-[#3D455C] text-white font-bold rounded-lg text-xs uppercase"
              >
                Block
              </button>
            </div>

            {/* Desktop Key Helper Dock */}
            <div className="hidden sm:flex items-center justify-center gap-4 bg-black/60 px-4 py-2 rounded-full border border-white/10 text-xs font-mono text-[#A1A7B5] max-w-fit mx-auto">
              <span><strong className="text-white">WASD</strong> Move</span>
              <span>·</span>
              <span><strong className="text-[#D4AF37]">J</strong> Jab</span>
              <span>·</span>
              <span><strong className="text-[#D4AF37]">K</strong> Cross</span>
              <span>·</span>
              <span><strong className="text-[#D4AF37]">L</strong> Uppercut</span>
              <span>·</span>
              <span><strong className="text-white">SPACE</strong> Block</span>
              <span>·</span>
              <span><strong className="text-white">E</strong> Slip</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. PAUSE MODAL */}
      {phase === 'paused' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto">
          <div className="w-full max-w-sm bg-[#0E1016] border border-[#2B303C] rounded-xl p-6 text-center space-y-4 shadow-2xl">
            <h2 className="text-2xl font-black font-display uppercase tracking-wider text-white">
              {t.paused}
            </h2>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => setPhase('playing')}
                className="w-full py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold uppercase font-display rounded text-xs tracking-wider"
              >
                {t.resume}
              </button>
              <button
                onClick={startGame}
                className="w-full py-2.5 bg-[#171B24] hover:bg-[#202532] text-white border border-[#292F3E] font-semibold uppercase font-display rounded text-xs tracking-wider"
              >
                {t.restart}
              </button>
              <button
                onClick={() => setPhase('title')}
                className="w-full py-2 text-xs text-[#8E95A5] hover:text-white"
              >
                {t.exitToMenu}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. VICTORY / KNOCKOUT MODAL */}
      {phase === 'gameover' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md pointer-events-auto">
          <div className="w-full max-w-md bg-[#0E1016] border border-[#D4AF37]/50 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
            <Award className="w-16 h-16 text-[#D4AF37] mx-auto" />

            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-[#D4AF37] font-bold block">
                {t.knockout}
              </span>
              <h2 className="text-3xl font-black font-display uppercase tracking-wide text-white mt-1">
                {winner === 'player' ? t.youWin : t.youLose}
              </h2>
              <p className="text-xs text-[#8E95A5] mt-1">
                {winner === 'player'
                  ? `${playerFighter.name} defeated ${aiFighter.name} via Stoppage.`
                  : `${aiFighter.name} knocked out ${playerFighter.name}.`}
              </p>
            </div>

            {/* Scorecard Summary */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-[#141722] rounded-xl border border-[#232938] text-xs font-mono-numbers">
              <div>
                <span className="text-[#8E95A5] uppercase text-[10px] block">Your Score</span>
                <span className="text-lg font-bold text-white">
                  {engineRef.current?.stats.playerScore || 0}
                </span>
              </div>
              <div>
                <span className="text-[#8E95A5] uppercase text-[10px] block">Opponent Score</span>
                <span className="text-lg font-bold text-white">
                  {engineRef.current?.stats.aiScore || 0}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={startGame}
                className="flex-1 py-3 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-black text-xs uppercase tracking-wider font-display rounded-lg transition-transform hover:scale-105"
              >
                Rematch Bout
              </button>
              <button
                onClick={() => setPhase('title')}
                className="px-4 py-3 bg-[#171B24] hover:bg-[#202532] text-white border border-[#2B303C] font-semibold text-xs uppercase font-display rounded-lg"
              >
                Exit Ring
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. ADVANCED SOUND MANAGEMENT SYSTEM MODAL */}
      {isAudioModalOpen && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md pointer-events-auto">
          <div className="w-full max-w-lg bg-[#0E1016] border border-[#D4AF37]/40 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#232938] pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider">
                  <Radio className="w-3 h-3 animate-pulse text-red-500" />
                  <span>Real-Time Synthesizer (Web Audio API)</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-display uppercase tracking-wide text-white">
                  {t.soundSettingsTitle}
                </h3>
                <p className="text-xs text-[#8E95A5]">
                  {t.soundSettingsSub}
                </p>
              </div>
              <button
                onClick={() => setIsAudioModalOpen(false)}
                className="p-1.5 rounded-lg bg-[#181C26] hover:bg-[#232836] text-[#8E95A5] hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Mute Banner */}
            <div className="flex items-center justify-between p-3.5 bg-[#141722] rounded-xl border border-[#232938]">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-[#D4AF37]/20 text-[#D4AF37]'}`}>
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">
                    {isMuted ? t.audioMuted : t.audioActive}
                  </span>
                  <span className="text-[11px] text-[#8E95A5] font-mono">
                    Hotkey: Press <kbd className="px-1.5 py-0.5 bg-black/60 border border-white/20 rounded text-[10px] text-white">M</kbd> to toggle mute
                  </span>
                </div>
              </div>
              <button
                onClick={toggleMute}
                className={`px-4 py-2 rounded-lg font-mono text-xs uppercase font-bold transition-colors cursor-pointer ${
                  isMuted
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-[#1F2533] hover:bg-[#2A3245] text-white border border-[#333C4F]'
                }`}
              >
                {isMuted ? 'Unmute All' : 'Mute All'}
              </button>
            </div>

            {/* Multi-Bus Volume Sliders */}
            <div className="space-y-4">
              {/* 1. Master Volume */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-semibold uppercase flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {t.masterVolume}
                  </span>
                  <span className="font-bold text-[#D4AF37]">{audioSettings.master}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={audioSettings.master}
                  onChange={(e) => updateMasterVolume(Number(e.target.value))}
                  className="w-full h-2 bg-[#1C202C] rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                />
              </div>

              {/* 2. SFX / Punches */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-semibold uppercase flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-red-400" />
                    {t.sfxVolume}
                  </span>
                  <span className="font-bold text-red-400">{audioSettings.sfx}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={audioSettings.sfx}
                  onChange={(e) => updateSfxVolume(Number(e.target.value))}
                  className="w-full h-2 bg-[#1C202C] rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>

              {/* 3. Crowd Atmosphere */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-semibold uppercase flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-blue-400" />
                    {t.crowdVolume}
                  </span>
                  <span className="font-bold text-blue-400">{audioSettings.crowd}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={audioSettings.crowd}
                  onChange={(e) => updateCrowdVolume(Number(e.target.value))}
                  className="w-full h-2 bg-[#1C202C] rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* 4. Bell & Clapper */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-semibold uppercase flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {t.bellVolume}
                  </span>
                  <span className="font-bold text-amber-400">{audioSettings.bell}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={audioSettings.bell}
                  onChange={(e) => updateBellVolume(Number(e.target.value))}
                  className="w-full h-2 bg-[#1C202C] rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>

            {/* Audition Sound Cues Pad */}
            <div className="space-y-2 pt-2 border-t border-[#232938]">
              <span className="text-[11px] uppercase font-mono tracking-wider text-[#8E95A5] block font-bold">
                {t.testSoundCues}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => soundManager.playTripleBell()}
                  className="px-2.5 py-2 bg-[#181C26] hover:bg-[#232836] border border-[#2B3142] text-[11px] font-mono text-[#D4AF37] rounded-lg hover:border-[#D4AF37]/50 transition-colors text-left cursor-pointer"
                >
                  🔔 {t.testBell}
                </button>
                <button
                  type="button"
                  onClick={() => soundManager.playPunchImpact('jab')}
                  className="px-2.5 py-2 bg-[#181C26] hover:bg-[#232836] border border-[#2B3142] text-[11px] font-mono text-white rounded-lg hover:border-red-500/50 transition-colors text-left cursor-pointer"
                >
                  🥊 {t.testJab}
                </button>
                <button
                  type="button"
                  onClick={() => soundManager.playPunchImpact('cross')}
                  className="px-2.5 py-2 bg-[#181C26] hover:bg-[#232836] border border-[#2B3142] text-[11px] font-mono text-white rounded-lg hover:border-red-500/50 transition-colors text-left cursor-pointer"
                >
                  💥 {t.testCross}
                </button>
                <button
                  type="button"
                  onClick={() => soundManager.playPunchImpact('counter')}
                  className="px-2.5 py-2 bg-[#181C26] hover:bg-[#232836] border border-[#2B3142] text-[11px] font-mono text-[#D4AF37] rounded-lg hover:border-[#D4AF37]/50 transition-colors text-left cursor-pointer"
                >
                  ⚡ {t.testCounter}
                </button>
                <button
                  type="button"
                  onClick={() => soundManager.playCrowdGasp()}
                  className="px-2.5 py-2 bg-[#181C26] hover:bg-[#232836] border border-[#2B3142] text-[11px] font-mono text-blue-300 rounded-lg hover:border-blue-400/50 transition-colors text-left cursor-pointer"
                >
                  😮 {t.testGasp}
                </button>
                <button
                  type="button"
                  onClick={() => soundManager.playCrowdCheer('roar')}
                  className="px-2.5 py-2 bg-[#181C26] hover:bg-[#232836] border border-[#2B3142] text-[11px] font-mono text-blue-300 rounded-lg hover:border-blue-400/50 transition-colors text-left cursor-pointer"
                >
                  🏟️ {t.testCheer}
                </button>
                <button
                  type="button"
                  onClick={() => soundManager.playTenSecondWarning()}
                  className="px-2.5 py-2 bg-[#181C26] hover:bg-[#232836] border border-[#2B3142] text-[11px] font-mono text-amber-300 rounded-lg hover:border-amber-400/50 transition-colors text-left cursor-pointer"
                >
                  ⏱️ {t.testClapper}
                </button>
                <button
                  type="button"
                  onClick={() => soundManager.playRefCounter(10)}
                  className="px-2.5 py-2 bg-[#181C26] hover:bg-[#232836] border border-[#2B3142] text-[11px] font-mono text-emerald-400 rounded-lg hover:border-emerald-400/50 transition-colors text-left cursor-pointer"
                >
                  📢 {t.testRef}
                </button>
                <button
                  type="button"
                  onClick={() => soundManager.playVictoryFanfare()}
                  className="px-2.5 py-2 bg-[#181C26] hover:bg-[#232836] border border-[#2B3142] text-[11px] font-mono text-[#D4AF37] rounded-lg hover:border-[#D4AF37]/50 transition-colors text-left cursor-pointer"
                >
                  🎺 {t.testFanfare}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsAudioModalOpen(false)}
                className="w-full py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs uppercase font-display rounded-lg tracking-wider transition-colors cursor-pointer"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
