import * as THREE from 'three';
import { BoxerModel } from './BoxerModel';
import { boxingAudio } from './audio';

export interface CombatStats {
  playerHealth: number;
  playerStamina: number;
  aiHealth: number;
  aiStamina: number;
  round: number;
  roundTimeRemaining: number;
  playerScore: number;
  aiScore: number;
  playerKnockdowns: number;
  aiKnockdowns: number;
  comboCount: number;
  lastHitText: string;
}

export class CombatEngine {
  public player: BoxerModel;
  public ai: BoxerModel;
  public stats: CombatStats;

  // Ring boundary limits (inner square of ropes)
  private readonly RING_LIMIT = 2.8;

  // AI timing & decision timers
  private aiDecisionTimer: number = 0;
  private aiCircleDir: number = 1;
  private aiIsTelegraphing: boolean = false;
  private aiTelegraphTimer: number = 0;

  // Hitstop & Camera Trauma
  public hitstopTimer: number = 0;
  public cameraShakeTrauma: number = 0;

  // Sound cues state tracking
  private hasTriggeredTenSecWarning: boolean = false;
  private hasTriggeredRoundEndBell: boolean = false;

  // Particle sparks system
  public particleSystem: THREE.Points;
  private particlePositions: Float32Array;
  private particleVelocities: Float32Array;
  private particleLifetimes: Float32Array;
  private readonly MAX_PARTICLES = 60;

  constructor(playerNationality: string = 'Uzbekistan', aiNationality: string = 'USA') {
    this.player = new BoxerModel(true, playerNationality);
    this.ai = new BoxerModel(false, aiNationality);

    // Initial positions (Red Corner vs Blue Corner)
    this.player.group.position.set(0, 0.82, -1.3);
    this.player.group.rotation.y = 0; // Facing positive Z

    this.ai.group.position.set(0, 0.82, 1.3);
    this.ai.group.rotation.y = Math.PI; // Facing negative Z

    this.stats = {
      playerHealth: 100,
      playerStamina: 100,
      aiHealth: 100,
      aiStamina: 100,
      round: 1,
      roundTimeRemaining: 60,
      playerScore: 0,
      aiScore: 0,
      playerKnockdowns: 0,
      aiKnockdowns: 0,
      comboCount: 0,
      lastHitText: '',
    };

    // Initialize 3D Particle Sparks System
    const pGeo = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(this.MAX_PARTICLES * 3);
    this.particleVelocities = new Float32Array(this.MAX_PARTICLES * 3);
    this.particleLifetimes = new Float32Array(this.MAX_PARTICLES);

    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      this.particleLifetimes[i] = -1; // Inactive
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.12,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    this.particleSystem = new THREE.Points(pGeo, pMat);
  }

  public emitHitSparks(pos: THREE.Vector3, count: number = 12) {
    let spawned = 0;
    for (let i = 0; i < this.MAX_PARTICLES && spawned < count; i++) {
      if (this.particleLifetimes[i] <= 0) {
        this.particlePositions[i * 3] = pos.x;
        this.particlePositions[i * 3 + 1] = pos.y;
        this.particlePositions[i * 3 + 2] = pos.z;

        this.particleVelocities[i * 3] = (Math.random() - 0.5) * 4;
        this.particleVelocities[i * 3 + 1] = Math.random() * 3 + 1;
        this.particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 4;

        this.particleLifetimes[i] = 0.35 + Math.random() * 0.2;
        spawned++;
      }
    }
    this.particleSystem.geometry.attributes.position.needsUpdate = true;
  }

  private updateParticles(dt: number) {
    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      if (this.particleLifetimes[i] > 0) {
        this.particleLifetimes[i] -= dt;
        this.particlePositions[i * 3] += this.particleVelocities[i * 3] * dt;
        this.particlePositions[i * 3 + 1] += this.particleVelocities[i * 3 + 1] * dt;
        this.particlePositions[i * 3 + 2] += this.particleVelocities[i * 3 + 2] * dt;
        this.particleVelocities[i * 3 + 1] -= 9.8 * dt; // Gravity
      } else {
        // Move far away when dead
        this.particlePositions[i * 3 + 1] = -100;
      }
    }
    this.particleSystem.geometry.attributes.position.needsUpdate = true;
  }

  // Player action triggers
  public playerAttack(type: 'jab' | 'cross' | 'uppercut') {
    if (this.player.state !== 'idle' && this.player.state !== 'block') return;
    if (this.stats.playerStamina < 10) return;

    const staminaCost = type === 'jab' ? 10 : type === 'cross' ? 18 : 22;
    this.stats.playerStamina = Math.max(0, this.stats.playerStamina - staminaCost);

    this.player.triggerAction(type);
    boxingAudio.playGrunt('punch');
    boxingAudio.playWhoosh(type === 'jab' ? 'light' : 'heavy');

    // Check hit collision
    setTimeout(() => {
      this.checkPlayerHit(type);
    }, type === 'jab' ? 80 : 130);
  }

  public playerBlock(isBlocking: boolean) {
    if (isBlocking) {
      if (this.player.state === 'idle') {
        this.player.triggerAction('block');
      }
    } else {
      if (this.player.state === 'block') {
        this.player.triggerAction('idle');
      }
    }
  }

  public playerSlip() {
    if (this.player.state === 'idle') {
      this.player.triggerAction('slip');
      boxingAudio.playWhoosh('light');
      boxingAudio.playCrowdGasp();
    }
  }

  private checkPlayerHit(punchType: 'jab' | 'cross' | 'uppercut') {
    const dist = this.player.group.position.distanceTo(this.ai.group.position);
    const inRange = dist < 2.05;

    if (!inRange) return;

    const contactPos = this.ai.getHeadWorldPos();

    // If AI is slipping
    if (this.ai.state === 'slip') {
      this.stats.lastHitText = 'SLIPPED!';
      boxingAudio.playCrowdGasp();
      return;
    }

    // If AI is blocking
    if (this.ai.state === 'block') {
      const baseDmg = punchType === 'jab' ? 4 : punchType === 'cross' ? 7 : 9;
      this.stats.aiHealth = Math.max(0, this.stats.aiHealth - baseDmg);
      this.stats.aiStamina = Math.max(0, this.stats.aiStamina - 15);
      this.emitHitSparks(contactPos, 4);
      boxingAudio.playPunchImpact('blocked');
      this.stats.lastHitText = 'BLOCKED!';
      return;
    }

    // Clean hit!
    let dmg = punchType === 'jab' ? 12 : punchType === 'cross' ? 24 : 30;
    const isCounter =
      this.ai.state === 'jab' || this.ai.state === 'cross' || this.ai.state === 'uppercut';

    if (isCounter) {
      dmg = Math.round(dmg * 1.5);
      this.stats.lastHitText = 'COUNTER PUNCH! +50% DMG';
      this.cameraShakeTrauma = 0.55;
      this.hitstopTimer = 0.06;
      boxingAudio.playPunchImpact('counter');
      boxingAudio.playGrunt('pain');
      boxingAudio.playCrowdCheer('heavy');
    } else {
      this.stats.lastHitText = `${punchType.toUpperCase()} HIT!`;
      this.cameraShakeTrauma = punchType === 'jab' ? 0.2 : 0.45;
      boxingAudio.playPunchImpact(punchType);
      boxingAudio.playGrunt('pain');
    }

    this.stats.aiHealth = Math.max(0, this.stats.aiHealth - dmg);
    this.stats.playerScore += dmg * 10;
    this.stats.comboCount++;

    // Crowd cheer escalates with combo streak
    if (!isCounter) {
      if (this.stats.comboCount >= 4) {
        boxingAudio.playCrowdCheer('heavy');
      } else if (this.stats.comboCount >= 2) {
        boxingAudio.playCrowdCheer('mild');
      }
    }

    this.emitHitSparks(contactPos, punchType === 'jab' ? 8 : 18);
    this.ai.triggerAction('hit');

    // Knockdown check
    if (this.stats.aiHealth <= 0) {
      this.ai.triggerAction('knockdown');
      this.stats.playerKnockdowns++;
      boxingAudio.playKnockdown();
      setTimeout(() => boxingAudio.playRefCounter(1), 600);
    }
  }

  // AI Logic
  private updateAI(dt: number) {
    if (this.ai.state === 'knockdown' || this.player.state === 'knockdown') return;

    this.aiDecisionTimer += dt;
    const dist = this.ai.group.position.distanceTo(this.player.group.position);

    // Keep facing player
    const lookAtPos = this.player.group.position.clone();
    lookAtPos.y = this.ai.group.position.y;
    this.ai.group.lookAt(lookAtPos);

    // Footwork & Distance management
    const optimalDist = 1.65;
    if (dist > optimalDist + 0.3) {
      // Step forward
      const dir = this.player.group.position.clone().sub(this.ai.group.position).normalize();
      this.ai.group.position.addScaledVector(dir, 1.4 * dt);
    } else if (dist < optimalDist - 0.25) {
      // Retreat step
      const dir = this.ai.group.position.clone().sub(this.player.group.position).normalize();
      this.ai.group.position.addScaledVector(dir, 1.2 * dt);
    } else {
      // Circle step around player
      const perp = new THREE.Vector3(
        -(this.player.group.position.z - this.ai.group.position.z),
        0,
        this.player.group.position.x - this.ai.group.position.x
      ).normalize();
      this.ai.group.position.addScaledVector(perp, 0.7 * this.aiCircleDir * dt);
    }

    // Clamp inside ring ropes
    this.ai.group.position.x = Math.max(-this.RING_LIMIT, Math.min(this.RING_LIMIT, this.ai.group.position.x));
    this.ai.group.position.z = Math.max(-this.RING_LIMIT, Math.min(this.RING_LIMIT, this.ai.group.position.z));

    // Decision trigger every 0.6 - 1.2s
    if (this.aiDecisionTimer > 0.9) {
      this.aiDecisionTimer = 0;
      if (Math.random() < 0.3) {
        this.aiCircleDir *= -1; // Switch circle direction
      }

      if (dist < 1.95 && this.ai.state === 'idle') {
        const rand = Math.random();
        if (rand < 0.45) {
          // AI Jab
          this.ai.triggerAction('jab');
          boxingAudio.playWhoosh();
          setTimeout(() => this.checkAiHit('jab'), 90);
        } else if (rand < 0.75) {
          // AI Cross
          this.ai.triggerAction('cross');
          boxingAudio.playWhoosh();
          setTimeout(() => this.checkAiHit('cross'), 140);
        } else if (rand < 0.9) {
          // AI High Block
          this.ai.triggerAction('block');
        } else {
          // AI Slip
          this.ai.triggerAction('slip');
        }
      }
    }
  }

  private checkAiHit(punchType: 'jab' | 'cross') {
    const dist = this.ai.group.position.distanceTo(this.player.group.position);
    if (dist > 2.05) return;

    const contactPos = this.player.getHeadWorldPos();

    if (this.player.state === 'slip') {
      this.stats.lastHitText = 'YOU SLIPPED OPPONENT!';
      boxingAudio.playCrowdGasp();
      return;
    }

    if (this.player.state === 'block') {
      const baseDmg = punchType === 'jab' ? 3 : 6;
      this.stats.playerHealth = Math.max(0, this.stats.playerHealth - baseDmg);
      this.stats.playerStamina = Math.max(0, this.stats.playerStamina - 12);
      this.emitHitSparks(contactPos, 4);
      boxingAudio.playPunchImpact('blocked');
      this.stats.lastHitText = 'ATTACK BLOCKED!';
      return;
    }

    const dmg = punchType === 'jab' ? 10 : 20;
    this.stats.playerHealth = Math.max(0, this.stats.playerHealth - dmg);
    this.stats.aiScore += dmg * 10;
    this.stats.comboCount = 0; // Combo reset on being hit

    this.emitHitSparks(contactPos, punchType === 'jab' ? 8 : 15);
    boxingAudio.playPunchImpact(punchType);
    boxingAudio.playGrunt('pain');
    this.player.triggerAction('hit');
    this.cameraShakeTrauma = punchType === 'jab' ? 0.3 : 0.6;

    if (this.stats.playerHealth <= 0) {
      this.player.triggerAction('knockdown');
      this.stats.aiKnockdowns++;
      boxingAudio.playKnockdown();
      setTimeout(() => boxingAudio.playRefCounter(1), 600);
    }
  }

  // Master Engine Update Loop (60fps simulation clamped)
  public update(rawDt: number, playerInputs: { forward: number; strafe: number }) {
    const dt = Math.min(rawDt, 0.05);

    // Hitstop freeze
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    // Camera shake decay
    if (this.cameraShakeTrauma > 0) {
      this.cameraShakeTrauma = Math.max(0, this.cameraShakeTrauma - dt * 2.2);
    }

    // Stamina Regeneration
    if (this.player.state !== 'block') {
      this.stats.playerStamina = Math.min(100, this.stats.playerStamina + dt * 15);
    }
    this.stats.aiStamina = Math.min(100, this.stats.aiStamina + dt * 12);

    // Round timer countdown
    if (this.player.state !== 'knockdown' && this.ai.state !== 'knockdown') {
      const prevTime = this.stats.roundTimeRemaining;
      this.stats.roundTimeRemaining = Math.max(0, this.stats.roundTimeRemaining - dt);

      // 10-Second Warning Woodblock Clapper Cue
      if (prevTime > 10 && this.stats.roundTimeRemaining <= 10 && !this.hasTriggeredTenSecWarning) {
        this.hasTriggeredTenSecWarning = true;
        boxingAudio.playTenSecondWarning();
      }

      // End of Round Triple Bell Cue
      if (prevTime > 0 && this.stats.roundTimeRemaining <= 0 && !this.hasTriggeredRoundEndBell) {
        this.hasTriggeredRoundEndBell = true;
        boxingAudio.playTripleBell();
        this.stats.lastHitText = 'ROUND OVER!';
      }
    }

    // Player Footwork Movement
    if (this.player.state === 'idle' || this.player.state === 'block') {
      const moveSpeed = this.player.state === 'block' ? 1.0 : 2.0;

      // Calculate direction facing opponent
      const forwardDir = this.ai.group.position.clone().sub(this.player.group.position).normalize();
      const strafeDir = new THREE.Vector3(-forwardDir.z, 0, forwardDir.x);

      this.player.group.position.addScaledVector(forwardDir, playerInputs.forward * moveSpeed * dt);
      this.player.group.position.addScaledVector(strafeDir, playerInputs.strafe * moveSpeed * dt);

      // Clamp inside ring ropes
      this.player.group.position.x = Math.max(-this.RING_LIMIT, Math.min(this.RING_LIMIT, this.player.group.position.x));
      this.player.group.position.z = Math.max(-this.RING_LIMIT, Math.min(this.RING_LIMIT, this.player.group.position.z));

      // Player faces opponent
      const lookAtPos = this.ai.group.position.clone();
      lookAtPos.y = this.player.group.position.y;
      this.player.group.lookAt(lookAtPos);
    }

    // Update AI
    this.updateAI(dt);

    // Update Boxer Skeletal Animations
    this.player.update(dt);
    this.ai.update(dt);

    // Update 3D Sparks Particles
    this.updateParticles(dt);
  }

  public resetRound() {
    this.stats.playerHealth = 100;
    this.stats.playerStamina = 100;
    this.stats.aiHealth = 100;
    this.stats.aiStamina = 100;
    this.stats.roundTimeRemaining = 60;
    this.stats.comboCount = 0;
    this.stats.lastHitText = '';
    this.hasTriggeredTenSecWarning = false;
    this.hasTriggeredRoundEndBell = false;

    this.player.state = 'idle';
    this.player.group.rotation.set(0, 0, 0);
    this.player.group.position.set(0, 0.82, -1.3);

    this.ai.state = 'idle';
    this.ai.group.rotation.set(0, Math.PI, 0);
    this.ai.group.position.set(0, 0.82, 1.3);

    boxingAudio.playTripleBell();
  }
}
