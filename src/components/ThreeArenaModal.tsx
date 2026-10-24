import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { X, RotateCcw, Eye, Lightbulb, Compass, Sparkles } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface ThreeArenaModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const ThreeArenaModal: React.FC<ThreeArenaModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const t = translations[lang];
  const containerRef = useRef<HTMLDivElement>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [spotlightIntensity, setSpotlightIntensity] = useState(1.5);
  const [cameraAngle, setCameraAngle] = useState<'overhead' | 'ringside' | 'corner'>('ringside');

  // Three.js scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const reqIdRef = useRef<number | null>(null);
  const lightsRef = useRef<THREE.SpotLight[]>([]);

  useEffect(() => {
    if (!isOpen || useFallback) return;
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setUseFallback(true);
        return;
      }
    } catch {
      setUseFallback(true);
      return;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060709);
    scene.fog = new THREE.FogExp2(0x060709, 0.035);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 5, 11);
    camera.lookAt(0, 1.2, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0x222630, 0.8);
    scene.add(ambientLight);

    // Spotlights over the 4 corners of the ring
    const spot1 = new THREE.SpotLight(0xfff1dc, 3.5);
    spot1.position.set(0, 10, 0);
    spot1.angle = Math.PI / 4;
    spot1.penumbra = 0.4;
    spot1.castShadow = true;
    scene.add(spot1);

    const cornerSpotRed = new THREE.SpotLight(0xdc2626, 2.0);
    cornerSpotRed.position.set(-5, 7, -5);
    cornerSpotRed.target.position.set(-3, 1, -3);
    scene.add(cornerSpotRed);
    scene.add(cornerSpotRed.target);

    const cornerSpotBlue = new THREE.SpotLight(0x2563eb, 2.0);
    cornerSpotBlue.position.set(5, 7, 5);
    cornerSpotBlue.target.position.set(3, 1, 3);
    scene.add(cornerSpotBlue);
    scene.add(cornerSpotBlue.target);

    lightsRef.current = [spot1, cornerSpotRed, cornerSpotBlue];

    // 5. Build Boxing Ring Geometry
    const ringGroup = new THREE.Group();

    // Canvas Mat Platform
    const platformGeo = new THREE.BoxGeometry(7, 0.8, 7);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x181a20,
      roughness: 0.85,
      metalness: 0.1,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = 0.4;
    platform.receiveShadow = true;
    ringGroup.add(platform);

    // Mat Canvas Top Surface (Cream White Canvas)
    const canvasTopGeo = new THREE.PlaneGeometry(6.6, 6.6);
    const canvasTopMat = new THREE.MeshStandardMaterial({
      color: 0xdde0e6,
      roughness: 0.9,
      metalness: 0.05,
    });
    const canvasTop = new THREE.Mesh(canvasTopGeo, canvasTopMat);
    canvasTop.rotation.x = -Math.PI / 2;
    canvasTop.position.y = 0.81;
    canvasTop.receiveShadow = true;
    ringGroup.add(canvasTop);

    // Center Ring Emblem Circle
    const circleGeo = new THREE.RingGeometry(0.8, 1.3, 32);
    const circleMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      side: THREE.DoubleSide,
    });
    const centerCircle = new THREE.Mesh(circleGeo, circleMat);
    centerCircle.rotation.x = -Math.PI / 2;
    centerCircle.position.y = 0.815;
    ringGroup.add(centerCircle);

    // Corner Posts (Red, Blue, White corners)
    const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.8, 16);
    const postMatRed = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.4, roughness: 0.3 });
    const postMatBlue = new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.4, roughness: 0.3 });
    const postMatWhite = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.4, roughness: 0.3 });

    const cornerCoords = [
      { x: -3.3, z: -3.3, mat: postMatRed }, // Red corner
      { x: 3.3, z: 3.3, mat: postMatBlue }, // Blue corner
      { x: -3.3, z: 3.3, mat: postMatWhite }, // Neutral corner
      { x: 3.3, z: -3.3, mat: postMatWhite }, // Neutral corner
    ];

    cornerCoords.forEach((c) => {
      const post = new THREE.Mesh(postGeo, c.mat);
      post.position.set(c.x, 1.8, c.z);
      post.castShadow = true;
      ringGroup.add(post);

      // Corner pad
      const padGeo = new THREE.BoxGeometry(0.35, 1.8, 0.35);
      const pad = new THREE.Mesh(padGeo, c.mat);
      pad.position.set(c.x * 0.94, 1.9, c.z * 0.94);
      ringGroup.add(pad);
    });

    // 4 Ropes on each side
    const ropeHeights = [1.2, 1.6, 2.0, 2.4];
    ropeHeights.forEach((rh, idx) => {
      const ropeMat = new THREE.MeshStandardMaterial({
        color: idx % 2 === 0 ? 0xdc2626 : 0xf8fafc,
        roughness: 0.6,
      });

      // Side 1 (Z: -3.2)
      const r1 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 6.4, 8), ropeMat);
      r1.rotation.z = Math.PI / 2;
      r1.position.set(0, rh, -3.2);
      ringGroup.add(r1);

      // Side 2 (Z: 3.2)
      const r2 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 6.4, 8), ropeMat);
      r2.rotation.z = Math.PI / 2;
      r2.position.set(0, rh, 3.2);
      ringGroup.add(r2);

      // Side 3 (X: -3.2)
      const r3 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 6.4, 8), ropeMat);
      r3.rotation.x = Math.PI / 2;
      r3.position.set(-3.2, rh, 0);
      ringGroup.add(r3);

      // Side 4 (X: 3.2)
      const r4 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 6.4, 8), ropeMat);
      r4.rotation.x = Math.PI / 2;
      r4.position.set(3.2, rh, 0);
      ringGroup.add(r4);
    });

    // Overhead Lighting Truss Frame
    const trussMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });
    const trussGeo = new THREE.TorusGeometry(3.8, 0.08, 8, 4);
    const truss = new THREE.Mesh(trussGeo, trussMat);
    truss.rotation.x = Math.PI / 2;
    truss.rotation.z = Math.PI / 4;
    truss.position.y = 6.5;
    ringGroup.add(truss);

    // Floor of the arena
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x07080a, roughness: 0.95 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    ringGroup.add(floor);

    scene.add(ringGroup);

    // Interaction handlers
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotationAngle = 0;
    let elevationAngle = 0.35;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      rotationAngle -= dx * 0.008;
      elevationAngle = Math.max(0.1, Math.min(1.2, elevationAngle + dy * 0.005));

      const radius = 11;
      camera.position.x = radius * Math.sin(rotationAngle) * Math.cos(elevationAngle);
      camera.position.y = radius * Math.sin(elevationAngle) + 1.5;
      camera.position.z = radius * Math.cos(rotationAngle) * Math.cos(elevationAngle);
      camera.lookAt(0, 1.2, 0);
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Render loop
    let clock = new THREE.Clock();
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (autoRotate && !isDragging) {
        rotationAngle += delta * 0.25;
        const radius = 11;
        camera.position.x = radius * Math.sin(rotationAngle) * Math.cos(elevationAngle);
        camera.position.y = radius * Math.sin(elevationAngle) + 1.5;
        camera.position.z = radius * Math.cos(rotationAngle) * Math.cos(elevationAngle);
        camera.lookAt(0, 1.2, 0);
      }

      renderer.render(scene, camera);
    };
    animate();

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
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [isOpen, useFallback, autoRotate]);

  if (!isOpen) return null;

  const handleAngleChange = (angle: 'overhead' | 'ringside' | 'corner') => {
    setCameraAngle(angle);
    if (!cameraRef.current) return;
    const camera = cameraRef.current;
    if (angle === 'overhead') {
      camera.position.set(0, 11, 0.1);
      camera.lookAt(0, 0.8, 0);
    } else if (angle === 'corner') {
      camera.position.set(-5, 2.5, -5);
      camera.lookAt(0, 1.5, 0);
    } else {
      camera.position.set(0, 4.5, 11);
      camera.lookAt(0, 1.2, 0);
    }
  };

  const handleReset = () => {
    setAutoRotate(true);
    setCameraAngle('ringside');
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 4.5, 11);
      cameraRef.current.lookAt(0, 1.2, 0);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-[#0D0F14] border border-[#252830] rounded-xl overflow-hidden shadow-2xl flex flex-col h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E222A] bg-[#11141B]">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
            <h2 className="text-xl font-bold tracking-wider uppercase font-display text-white">
              RING LEGACY 3D ARENA EXPERIENCE
            </h2>
            <span className="text-xs text-[#8E95A5] hidden sm:inline">
              · Interactive WebGL Championship Ring
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseFallback(!useFallback)}
              className="px-2.5 py-1 text-xs text-[#A1A7B5] bg-[#1A1E26] hover:text-white rounded border border-[#2B303C] transition-colors"
              title="Toggle between 3D WebGL and Cinematic Photography"
            >
              {useFallback ? 'WebGL Mode' : 'Photo Mode'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#8E95A5] hover:text-white hover:bg-[#1E222A] rounded-lg transition-colors"
              aria-label={t.close}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
          {useFallback ? (
            <div className="relative w-full h-full">
              <img
                src="/src/assets/images/hero_boxing_arena_1792817255999.jpg"
                alt="Championship Boxing Ring Arena Fallback"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex items-end p-8">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                    Photographic Arena Mode
                  </span>
                  <h3 className="text-2xl font-bold font-display text-white mt-1">
                    Championship Canvas & Arena Spotlights
                  </h3>
                  <p className="text-sm text-[#A1A7B5] max-w-lg mt-1">
                    Rendering realistic 35mm sports documentary imagery of the world title ring.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div
                ref={containerRef}
                className="w-full h-full cursor-grab active:cursor-grabbing"
              />

              {/* Instructions badge */}
              <div className="absolute top-4 left-4 pointer-events-none bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border border-white/10 text-xs text-[#C5CAD5] flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Drag to Orbit · Click and drag to inspect angles</span>
              </div>
            </>
          )}
        </div>

        {/* Interactive Controls Bar */}
        <div className="px-6 py-3 border-t border-[#1E222A] bg-[#0E1015] flex flex-wrap items-center justify-between gap-4 text-xs text-[#A1A7B5]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Camera View:</span>
            <button
              onClick={() => handleAngleChange('ringside')}
              className={`px-3 py-1 rounded transition-colors ${
                cameraAngle === 'ringside'
                  ? 'bg-[#D4AF37] text-black font-semibold'
                  : 'bg-[#181B22] text-[#C5CAD5] hover:bg-[#252A35]'
              }`}
            >
              Ringside
            </button>
            <button
              onClick={() => handleAngleChange('corner')}
              className={`px-3 py-1 rounded transition-colors ${
                cameraAngle === 'corner'
                  ? 'bg-[#D4AF37] text-black font-semibold'
                  : 'bg-[#181B22] text-[#C5CAD5] hover:bg-[#252A35]'
              }`}
            >
              Red Corner
            </button>
            <button
              onClick={() => handleAngleChange('overhead')}
              className={`px-3 py-1 rounded transition-colors ${
                cameraAngle === 'overhead'
                  ? 'bg-[#D4AF37] text-black font-semibold'
                  : 'bg-[#181B22] text-[#C5CAD5] hover:bg-[#252A35]'
              }`}
            >
              Bird's Eye
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`px-3 py-1 rounded border transition-colors ${
                autoRotate
                  ? 'border-[#D4AF37]/50 text-[#D4AF37] bg-[#D4AF37]/10'
                  : 'border-[#2B303C] text-[#8E95A5] hover:text-white'
              }`}
            >
              Auto-Rotate: {autoRotate ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#181B22] hover:bg-[#252A35] text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
