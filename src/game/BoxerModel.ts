import * as THREE from 'three';

export type ActionState =
  | 'idle'
  | 'jab'
  | 'cross'
  | 'uppercut'
  | 'block'
  | 'slip'
  | 'hit'
  | 'knockdown'
  | 'victory';

export class BoxerModel {
  public group: THREE.Group;
  public state: ActionState = 'idle';
  public actionTimer: number = 0;
  public isPlayer: boolean;
  public nationality: string;

  // Key joints
  private torsoGroup!: THREE.Group;
  private headMesh!: THREE.Mesh;
  private leftArmGroup!: THREE.Group;
  private rightArmGroup!: THREE.Group;
  private leftGloveMesh!: THREE.Mesh;
  private rightGloveMesh!: THREE.Mesh;
  private leftLegMesh!: THREE.Mesh;
  private rightLegMesh!: THREE.Mesh;

  // Stored base transforms
  private baseHeadY: number = 1.62;
  private bounceClock: number = 0;

  constructor(isPlayer: boolean, nationality: string = 'USA') {
    this.isPlayer = isPlayer;
    this.nationality = nationality;
    this.group = new THREE.Group();
    this.buildModel();
  }

  private buildModel() {
    const skinColor = this.isPlayer ? 0x935b3d : 0x7a4d33;
    const skinMat = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.7,
      metalness: 0.1,
    });

    const gloveColor = this.isPlayer ? 0xdc2626 : 0x2563eb; // Red player, Blue opponent
    const gloveMat = new THREE.MeshStandardMaterial({
      color: gloveColor,
      roughness: 0.35,
      metalness: 0.25,
    });

    const trunksColor = this.isPlayer ? 0x111319 : 0x1e2433;
    const trunksTrim = this.isPlayer ? 0xd4af37 : 0xe2e8f0;
    const trunksMat = new THREE.MeshStandardMaterial({
      color: trunksColor,
      roughness: 0.8,
    });
    const trunksTrimMat = new THREE.MeshStandardMaterial({
      color: trunksTrim,
      roughness: 0.6,
      metalness: 0.2,
    });

    const bootMat = new THREE.MeshStandardMaterial({
      color: 0x090a0d,
      roughness: 0.5,
    });

    // 1. Torso Group
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.set(0, 1.25, 0);

    // Muscular Upper Torso & Chest
    const chestGeo = new THREE.BoxGeometry(0.55, 0.45, 0.32);
    const chestMesh = new THREE.Mesh(chestGeo, skinMat);
    chestMesh.position.y = 0.15;
    chestMesh.castShadow = true;
    this.torsoGroup.add(chestMesh);

    // Abdomen / Lower Torso
    const absGeo = new THREE.BoxGeometry(0.44, 0.35, 0.28);
    const absMesh = new THREE.Mesh(absGeo, skinMat);
    absMesh.position.y = -0.15;
    absMesh.castShadow = true;
    this.torsoGroup.add(absMesh);

    // 2. Head with Jaw & Hair
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.45, 0.05);

    const headGeo = new THREE.SphereGeometry(0.18, 16, 16);
    this.headMesh = new THREE.Mesh(headGeo, skinMat);
    this.headMesh.scale.set(0.9, 1.1, 0.95);
    this.headMesh.castShadow = true;
    headGroup.add(this.headMesh);

    // Hair cap
    const hairGeo = new THREE.SphereGeometry(0.19, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.y = 0.02;
    headGroup.add(hairMesh);

    this.torsoGroup.add(headGroup);

    // 3. Left Arm Group (Lead hand for Orthodox)
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.35, 0.25, 0.05);

    // Left Bicep
    const leftArmUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.32, 8), skinMat);
    leftArmUpper.position.set(0, -0.12, 0.05);
    leftArmUpper.rotation.x = Math.PI / 4;
    leftArmUpper.castShadow = true;
    this.leftArmGroup.add(leftArmUpper);

    // Left Forearm
    const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.32, 8), skinMat);
    leftForearm.position.set(0.08, -0.18, 0.28);
    leftForearm.rotation.x = -Math.PI / 4;
    leftForearm.castShadow = true;
    this.leftArmGroup.add(leftForearm);

    // Left Glove
    const gloveGeo = new THREE.BoxGeometry(0.18, 0.2, 0.24);
    this.leftGloveMesh = new THREE.Mesh(gloveGeo, gloveMat);
    this.leftGloveMesh.position.set(0.1, -0.15, 0.48);
    this.leftGloveMesh.castShadow = true;
    this.leftArmGroup.add(this.leftGloveMesh);

    this.torsoGroup.add(this.leftArmGroup);

    // 4. Right Arm Group (Rear power hand for Orthodox)
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.35, 0.25, 0);

    // Right Bicep
    const rightArmUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.32, 8), skinMat);
    rightArmUpper.position.set(0, -0.12, 0);
    rightArmUpper.rotation.x = Math.PI / 3;
    rightArmUpper.castShadow = true;
    this.rightArmGroup.add(rightArmUpper);

    // Right Forearm
    const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.32, 8), skinMat);
    rightForearm.position.set(-0.05, -0.18, 0.22);
    rightForearm.rotation.x = -Math.PI / 3;
    rightForearm.castShadow = true;
    this.rightArmGroup.add(rightForearm);

    // Right Glove
    this.rightGloveMesh = new THREE.Mesh(gloveGeo, gloveMat);
    this.rightGloveMesh.position.set(-0.06, -0.15, 0.38);
    this.rightGloveMesh.castShadow = true;
    this.rightArmGroup.add(this.rightGloveMesh);

    this.torsoGroup.add(this.rightArmGroup);

    this.group.add(this.torsoGroup);

    // 5. Boxing Trunks
    const trunksGeo = new THREE.CylinderGeometry(0.26, 0.28, 0.38, 16);
    const trunksMesh = new THREE.Mesh(trunksGeo, trunksMat);
    trunksMesh.position.set(0, 0.88, 0);
    trunksMesh.castShadow = true;
    this.group.add(trunksMesh);

    // Trunks waistband belt
    const beltGeo = new THREE.CylinderGeometry(0.265, 0.265, 0.08, 16);
    const beltMesh = new THREE.Mesh(beltGeo, trunksTrimMat);
    beltMesh.position.set(0, 1.04, 0);
    this.group.add(beltMesh);

    // 6. Left and Right Legs
    const legGeo = new THREE.CylinderGeometry(0.09, 0.075, 0.72, 8);
    this.leftLegMesh = new THREE.Mesh(legGeo, skinMat);
    this.leftLegMesh.position.set(-0.16, 0.42, 0.08);
    this.leftLegMesh.castShadow = true;
    this.group.add(this.leftLegMesh);

    this.rightLegMesh = new THREE.Mesh(legGeo, skinMat);
    this.rightLegMesh.position.set(0.16, 0.42, -0.1);
    this.rightLegMesh.castShadow = true;
    this.group.add(this.rightLegMesh);

    // Boxing Boots
    const bootGeo = new THREE.BoxGeometry(0.14, 0.22, 0.26);
    const leftBoot = new THREE.Mesh(bootGeo, bootMat);
    leftBoot.position.set(-0.16, 0.12, 0.14);
    leftBoot.castShadow = true;
    this.group.add(leftBoot);

    const rightBoot = new THREE.Mesh(bootGeo, bootMat);
    rightBoot.position.set(0.16, 0.12, -0.04);
    rightBoot.castShadow = true;
    this.group.add(rightBoot);

    // Scale and anchor
    this.group.position.y = 0.82; // Flush on top of boxing ring canvas mat
  }

  public triggerAction(action: ActionState) {
    if (this.state === 'knockdown') return;
    this.state = action;
    this.actionTimer = 0;
  }

  public update(dt: number) {
    this.bounceClock += dt * 4.5;
    this.actionTimer += dt;

    // Reset base posture
    const idleBounce = Math.sin(this.bounceClock) * 0.03;

    if (this.state === 'idle') {
      this.torsoGroup.position.y = 1.25 + idleBounce;
      this.torsoGroup.rotation.y = THREE.MathUtils.damp(this.torsoGroup.rotation.y, 0, 10, dt);
      this.torsoGroup.rotation.x = THREE.MathUtils.damp(this.torsoGroup.rotation.x, 0.05, 10, dt);
      this.torsoGroup.rotation.z = THREE.MathUtils.damp(this.torsoGroup.rotation.z, 0, 10, dt);

      // Default high guard hands
      this.leftArmGroup.position.z = THREE.MathUtils.damp(this.leftArmGroup.position.z, 0.05, 12, dt);
      this.leftArmGroup.position.y = THREE.MathUtils.damp(this.leftArmGroup.position.y, 0.25, 12, dt);
      this.leftArmGroup.rotation.x = THREE.MathUtils.damp(this.leftArmGroup.rotation.x, 0, 12, dt);

      this.rightArmGroup.position.z = THREE.MathUtils.damp(this.rightArmGroup.position.z, 0, 12, dt);
      this.rightArmGroup.position.y = THREE.MathUtils.damp(this.rightArmGroup.position.y, 0.25, 12, dt);
      this.rightArmGroup.rotation.x = THREE.MathUtils.damp(this.rightArmGroup.rotation.x, 0, 12, dt);
    } else if (this.state === 'jab') {
      // Snappy lead jab extension forward
      const duration = 0.22;
      const progress = this.actionTimer / duration;

      if (progress < 0.45) {
        // Thrust forward
        this.leftArmGroup.position.z = THREE.MathUtils.lerp(0.05, 0.95, progress / 0.45);
        this.leftArmGroup.position.y = 0.32;
        this.torsoGroup.rotation.y = 0.2;
      } else if (progress < 1.0) {
        // Snap back
        const returnProg = (progress - 0.45) / 0.55;
        this.leftArmGroup.position.z = THREE.MathUtils.lerp(0.95, 0.05, returnProg);
        this.torsoGroup.rotation.y = THREE.MathUtils.lerp(0.2, 0, returnProg);
      } else {
        this.state = 'idle';
      }
    } else if (this.state === 'cross') {
      // Heavy rotational right cross
      const duration = 0.34;
      const progress = this.actionTimer / duration;

      if (progress < 0.4) {
        // Deep hip rotation & punch explosion
        this.rightArmGroup.position.z = THREE.MathUtils.lerp(0, 1.15, progress / 0.4);
        this.rightArmGroup.position.x = THREE.MathUtils.lerp(0.35, 0.12, progress / 0.4);
        this.torsoGroup.rotation.y = THREE.MathUtils.lerp(0, -0.45, progress / 0.4);
        this.torsoGroup.rotation.x = 0.12;
      } else if (progress < 1.0) {
        const returnProg = (progress - 0.4) / 0.6;
        this.rightArmGroup.position.z = THREE.MathUtils.lerp(1.15, 0, returnProg);
        this.rightArmGroup.position.x = THREE.MathUtils.lerp(0.12, 0.35, returnProg);
        this.torsoGroup.rotation.y = THREE.MathUtils.lerp(-0.45, 0, returnProg);
      } else {
        this.state = 'idle';
      }
    } else if (this.state === 'uppercut') {
      // Rising chin-breaker uppercut
      const duration = 0.32;
      const progress = this.actionTimer / duration;

      if (progress < 0.45) {
        this.rightArmGroup.position.z = THREE.MathUtils.lerp(0, 0.7, progress / 0.45);
        this.rightArmGroup.position.y = THREE.MathUtils.lerp(0.25, 0.68, progress / 0.45);
        this.torsoGroup.rotation.x = -0.15;
      } else if (progress < 1.0) {
        const returnProg = (progress - 0.45) / 0.55;
        this.rightArmGroup.position.z = THREE.MathUtils.lerp(0.7, 0, returnProg);
        this.rightArmGroup.position.y = THREE.MathUtils.lerp(0.68, 0.25, returnProg);
        this.torsoGroup.rotation.x = THREE.MathUtils.lerp(-0.15, 0, returnProg);
      } else {
        this.state = 'idle';
      }
    } else if (this.state === 'block') {
      // Tight peek-a-boo defensive shell
      this.leftArmGroup.position.set(-0.12, 0.42, 0.25);
      this.rightArmGroup.position.set(0.12, 0.42, 0.25);
      this.torsoGroup.rotation.x = 0.15;
      // Block persists until player releases button or actionTimer expires for AI
      if (this.actionTimer > 0.8 && !this.isPlayer) {
        this.state = 'idle';
      }
    } else if (this.state === 'slip') {
      // Duck and slip to the side
      this.torsoGroup.position.x = Math.sin(this.actionTimer * 12) * 0.35;
      this.torsoGroup.position.y = 1.05;
      this.torsoGroup.rotation.z = Math.sin(this.actionTimer * 12) * 0.3;
      if (this.actionTimer > 0.3) {
        this.torsoGroup.position.x = 0;
        this.state = 'idle';
      }
    } else if (this.state === 'hit') {
      // Recoil flinch
      this.torsoGroup.position.z = -0.18 * Math.sin(this.actionTimer * 18);
      this.headMesh.rotation.y = (this.isPlayer ? -1 : 1) * 0.4 * Math.sin(this.actionTimer * 20);
      if (this.actionTimer > 0.25) {
        this.headMesh.rotation.y = 0;
        this.state = 'idle';
      }
    } else if (this.state === 'knockdown') {
      // Collapse to canvas mat
      this.group.rotation.x = THREE.MathUtils.damp(this.group.rotation.x, Math.PI / 2, 6, dt);
      this.group.position.y = THREE.MathUtils.damp(this.group.position.y, 0.3, 6, dt);
      this.torsoGroup.position.y = 0.5;
    } else if (this.state === 'victory') {
      // Raise arms
      this.leftArmGroup.position.y = 0.75;
      this.rightArmGroup.position.y = 0.75;
      this.torsoGroup.rotation.y = Math.sin(this.actionTimer * 3) * 0.2;
    }
  }

  // Get current glove striking position in 3D world coords
  public getLeadGloveWorldPos(): THREE.Vector3 {
    const v = new THREE.Vector3();
    this.leftGloveMesh.getWorldPosition(v);
    return v;
  }

  public getRearGloveWorldPos(): THREE.Vector3 {
    const v = new THREE.Vector3();
    this.rightGloveMesh.getWorldPosition(v);
    return v;
  }

  public getHeadWorldPos(): THREE.Vector3 {
    const v = new THREE.Vector3();
    this.headMesh.getWorldPosition(v);
    return v;
  }
}
