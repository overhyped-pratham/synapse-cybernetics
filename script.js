/* --- SCI-FI WEB AUDIO SYNTHESIZER --- */
class SciFiAudio {
  constructor() {
    this.ctx = null;
    this.muted = true; // Start muted to comply with browser policies
    this.ambientNodes = [];
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    this.init();
    
    if (this.muted) {
      this.stopAmbient();
    } else {
      this.startAmbient();
    }
    return this.muted;
  }

  startAmbient() {
    if (this.muted) return;
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.ambientNodes.length > 0) return; // Already running

    try {
      const t = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(65.41, t); // C2
      osc1.detune.setValueAtTime(-8, t); // detune for chorus

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(130.81, t); // C3
      osc2.detune.setValueAtTime(8, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, t);
      filter.Q.setValueAtTime(2, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.06, t + 2.0); // Smooth fade-in

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(t);
      osc2.start(t);

      this.ambientNodes = [osc1, osc2, gain];
    } catch (e) {
      console.warn('[SYSTEM WARN]: Failed to generate Web Audio ambient drone.', e);
    }
  }

  stopAmbient() {
    if (this.ambientNodes.length === 0) return;
    try {
      const t = this.ctx.currentTime;
      const [osc1, osc2, gain] = this.ambientNodes;
      gain.gain.setValueAtTime(gain.gain.value, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.5); // Fade out

      setTimeout(() => {
        try {
          osc1.stop();
          osc2.stop();
        } catch (err) {}
        this.ambientNodes = [];
      }, 600);
    } catch (e) {
      this.ambientNodes = [];
    }
  }

  play(type) {
    if (this.muted) return;
    this.init();
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    
    switch (type) {
      case 'hover': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1100, t);
        osc.frequency.exponentialRampToValueAtTime(700, t + 0.06);
        gain.gain.setValueAtTime(0.015, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.06);
        break;
      }
      case 'click': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(500, t);
        osc.frequency.setValueAtTime(120, t + 0.03);
        gain.gain.setValueAtTime(0.04, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.04);
        break;
      }
      case 'success': {
        const playNote = (freq, start, duration) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.03, start);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(start);
          osc.stop(start + duration);
        };
        playNote(493.88, t, 0.12); // B4
        playNote(659.25, t + 0.08, 0.15); // E5
        playNote(987.77, t + 0.16, 0.22); // B5
        break;
      }
      case 'scan': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(1600, t + 0.3);
        gain.gain.setValueAtTime(0.012, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, t);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(t);
        osc.stop(t + 0.3);
        break;
      }
      case 'error': {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(110, t);
        osc2.frequency.setValueAtTime(112, t); // detune
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.linearRampToValueAtTime(0.0001, t + 0.35);
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(250, t);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 0.35);
        osc2.stop(t + 0.35);
        break;
      }
    }
  }
}

// Instantiate Sound Controller
const sfx = new SciFiAudio();

/* --- CUSTOM HIGH-TECH CURSOR --- */
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const cursorDot = document.getElementById('custom-cursor-dot');
  
  if (!cursor || !cursorDot) return;

  // Track coordinates
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Dot sits strictly at cursor position
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  });

  // Smooth lagging ring for cyber feel
  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;

    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Attach hover events to all interactive elements
  const updateHoverables = () => {
    const interactive = document.querySelectorAll('a, button, input, select, textarea, .faq-question, .color-chip, .tech-slider');
    interactive.forEach(el => {
      // Avoid duplicate attachments
      if (el.getAttribute('data-cursor-bound')) return;
      el.setAttribute('data-cursor-bound', 'true');

      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
        sfx.play('hover');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
      });
      el.addEventListener('click', () => {
        sfx.play('click');
      });
    });
  };

  updateHoverables();
  
  // Re-run periodically to capture dynamic content
  setInterval(updateHoverables, 1000);
}

/* --- DYNAMIC TECHFEST TERMINAL LOGS --- */
const terminalLines = [
  { text: 'SYS: CONNECTING TO TECHFEST_NET_NODE...', type: 'info' },
  { text: 'SYS: INTEGRATING THREE_JS CORE MODULES...', type: 'info' },
  { text: 'LINK: WEBGL RENDER BUFFER NOMINAL [60 FPS]', type: 'success' },
  { text: 'ARENA: ROBOWARS SEED BLUEPRINTS VERIFIED.', type: 'success' },
  { text: 'CODE: HACKATHON PROTOCOLS LIVE ON NODE_32', type: 'info' },
  { text: 'AERO: WIND COEFFICIENT ESTIMATION CALIBRATED', type: 'success' },
  { text: 'SYS: 10,240 CORE PARTICLE SHEETS DRIFTING', type: 'success' },
  { text: 'ALERT: Electromagnetic interference detected in Arena B. Adjusting filters.', type: 'error' },
  { text: 'NET: MATCHMAKING SHIELD SYSTEM INITIATED.', type: 'success' },
  { text: 'SYS: TIMELINE SYNCHRONIZATION LOCKED.', type: 'info' },
  { text: 'WARNING: Pilot memory loads peaking at 84%. Cooling fans running.', type: 'error' }
];

function initTerminal() {
  const body = document.getElementById('terminal-body');
  if (!body) return;

  let index = 0;

  function addTerminalLine() {
    if (body.children.length > 5) {
      body.removeChild(body.firstElementChild);
    }

    const log = terminalLines[index];
    const p = document.createElement('p');
    p.className = 'terminal-line';
    
    if (log.type === 'error') p.classList.add('error');
    if (log.type === 'success') p.classList.add('success');
    
    p.innerHTML = `<span class="mono">></span> ${log.text}`;
    body.appendChild(p);
    
    body.scrollTop = body.scrollHeight;

    sfx.play('hover');

    index = (index + 1) % terminalLines.length;
    
    setTimeout(addTerminalLine, Math.random() * 2000 + 1500);
  }

  addTerminalLine();
}

/* --- COUNTDOWN TIMER --- */
function initCountdown() {
  const countdownDays = document.getElementById('countdown-days');
  const countdownHours = document.getElementById('countdown-hours');
  const countdownMins = document.getElementById('countdown-mins');
  const countdownSecs = document.getElementById('countdown-secs');

  if (!countdownDays) return;

  // Launch date: exactly 60 days in the future relative to page view
  const launchDate = new Date();
  launchDate.setDate(launchDate.getDate() + 60);

  function updateClock() {
    const now = new Date();
    const diff = launchDate.getTime() - now.getTime();

    if (diff <= 0) {
      clearInterval(clockInterval);
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    countdownDays.innerText = d.toString().padStart(2, '0');
    countdownHours.innerText = h.toString().padStart(2, '0');
    countdownMins.innerText = m.toString().padStart(2, '0');
    countdownSecs.innerText = s.toString().padStart(2, '0');
  }

  updateClock();
  const clockInterval = setInterval(updateClock, 1000);
}

/* --- THREE.JS 3D WEBGL GRAPHICS CONTROLLER --- */
class WebGLUniverse {
  constructor() {
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.clock = null;

    // Lights
    this.ambientLight = null;
    this.coreLight = null;

    // Objects
    this.particleGeometry = null;
    this.particleMaterial = null;
    this.particles = null;
    this.coreGroup = null;
    
    // Core subcomponents
    this.innerMesh = null;
    this.outerMesh = null;
    this.orbitRing1 = null;
    this.orbitRing2 = null;

    // Customizer State
    this.activeGeom = 'sphere';
    this.spinSpeedMult = 1.5;
    this.particleDensity = 4000;
    this.currentColor = 'cyan';
    
    // Color schemes mapping
    this.colors = {
      cyan: { hex: 0x00f3ff, rgb: [0, 243, 255] },
      magenta: { hex: 0xff0055, rgb: [255, 0, 85] },
      green: { hex: 0x39ff14, rgb: [57, 255, 20] },
      yellow: { hex: 0xffb700, rgb: [255, 183, 0] }
    };

    // Interpolation Targets for scroll animations
    this.targetX = 1.8;
    this.targetY = 0.3;
    this.targetZ = 0.0;
    this.targetScale = 1.0;
    
    this.currentX = 1.8;
    this.currentY = 0.3;
    this.currentZ = 0.0;
    this.currentScale = 1.0;
    
    this.warpSpeedTarget = 0.004;
    this.warpSpeedCurrent = 0.004;

    // Mouse interactive rotations
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotX = 0;
    this.targetRotY = 0;

    // Scroll checkpoints
    this.stages = [
      { scroll: 0.0, x: 1.8, y: 0.3, z: 0.0, scale: 1.0 },       // Hero Section
      { scroll: 0.22, x: 0.0, y: -0.2, z: -1.8, scale: 0.8 },     // Stats
      { scroll: 0.45, x: -1.6, y: 0.0, z: 0.0, scale: 1.25 },     // Customizer Area
      { scroll: 0.72, x: 0.0, y: 0.1, z: 1.4, scale: 1.3 },       // Tracks (Zoom in)
      { scroll: 1.0, x: 1.4, y: -0.4, z: -0.6, scale: 0.75 }     // Timeline/FAQ/Footer
    ];

    // Scroll tracking
    this.lastScrollY = window.scrollY;
  }

  init() {
    this.canvas = document.getElementById('webgl-canvas');
    if (!this.canvas) return;

    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    // Camera setup
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);
    this.camera.position.z = 5;

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    this.ambientLight = new THREE.AmbientLight(0x0e0e22, 1.5);
    this.scene.add(this.ambientLight);

    this.coreLight = new THREE.PointLight(this.colors[this.currentColor].hex, 4.0, 15);
    this.coreLight.position.set(0, 0, 0);
    this.scene.add(this.coreLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(2, 5, 2);
    this.scene.add(dirLight);

    // Objects Build
    this.buildCore();
    this.buildParticles();

    // Event binding
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('scroll', () => this.onScroll());
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));

    // Initial positioning
    this.onScroll();
    
    // Animation kick-off
    this.animate();
  }

  buildCore() {
    this.coreGroup = new THREE.Group();

    // Material definitions
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: this.colors[this.currentColor].hex,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });

    const glowCoreMat = new THREE.MeshBasicMaterial({
      color: this.colors[this.currentColor].hex,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });

    // Inner geometry (active select phase)
    let innerGeom;
    if (this.activeGeom === 'sphere') {
      innerGeom = new THREE.SphereGeometry(0.5, 16, 16);
    } else if (this.activeGeom === 'torus') {
      innerGeom = new THREE.TorusGeometry(0.45, 0.15, 8, 24);
    } else {
      innerGeom = new THREE.OctahedronGeometry(0.55, 0);
    }
    
    this.innerMesh = new THREE.Mesh(innerGeom, glowCoreMat);
    this.coreGroup.add(this.innerMesh);

    // Outer geometric shield (always complex rotating cage)
    const outerGeom = new THREE.IcosahedronGeometry(0.9, 1);
    this.outerMesh = new THREE.Mesh(outerGeom, wireframeMat);
    this.coreGroup.add(this.outerMesh);

    // Quantum orbital rings
    const ringGeom = new THREE.TorusGeometry(1.2, 0.015, 6, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: this.colors[this.currentColor].hex,
      transparent: true,
      opacity: 0.25
    });

    this.orbitRing1 = new THREE.Mesh(ringGeom, ringMat);
    this.orbitRing1.rotation.x = Math.PI / 2;
    this.coreGroup.add(this.orbitRing1);

    this.orbitRing2 = new THREE.Mesh(ringGeom, ringMat);
    this.orbitRing2.rotation.y = Math.PI / 4;
    this.coreGroup.add(this.orbitRing2);

    this.scene.add(this.coreGroup);
  }

  buildParticles() {
    // Generate particle positions
    const count = 8000; // Generate maximum, display range regulated
    const positions = new Float32Array(count * 3);
    const randomSpeeds = new Float32Array(count);

    for (let i = 0; i < count * 3; i += 3) {
      // Cylinder distribution along Z-axis (camera path tunnel)
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.0 + Math.random() * 6.0;
      
      positions[i] = Math.cos(angle) * radius;
      positions[i + 1] = Math.sin(angle) * radius;
      positions[i + 2] = -15 + Math.random() * 20; // range from z=-15 to z=5

      randomSpeeds[i / 3] = 0.5 + Math.random() * 1.5;
    }

    this.particleGeometry = new THREE.BufferGeometry();
    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Store speed details in custom property
    this.particleGeometry.userData = { speeds: randomSpeeds };

    // Simple custom circular point texture to avoid missing asset dependencies
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    const pointTex = new THREE.CanvasTexture(canvas);

    this.particleMaterial = new THREE.PointsMaterial({
      size: 0.045,
      map: pointTex,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: this.colors[this.currentColor].hex
    });

    this.particles = new THREE.Points(this.particleGeometry, this.particleMaterial);
    
    // Limit starting drawing buffer range based on starting settings
    this.updateParticleDensityRange();

    this.scene.add(this.particles);
  }

  updateParticleDensityRange() {
    if (this.particles) {
      this.particleGeometry.setDrawRange(0, parseInt(this.particleDensity));
    }
  }

  updateCoreMaterials() {
    const hex = this.colors[this.currentColor].hex;
    
    if (this.coreLight) this.coreLight.color.setHex(hex);
    if (this.innerMesh) this.innerMesh.material.color.setHex(hex);
    if (this.outerMesh) this.outerMesh.material.color.setHex(hex);
    if (this.orbitRing1) this.orbitRing1.material.color.setHex(hex);
    if (this.orbitRing2) this.orbitRing2.material.color.setHex(hex);
    if (this.particleMaterial) this.particleMaterial.color.setHex(hex);
  }

  updateCoreGeometry() {
    if (!this.innerMesh) return;

    this.coreGroup.remove(this.innerMesh);
    
    let geom;
    if (this.activeGeom === 'sphere') {
      geom = new THREE.SphereGeometry(0.5, 16, 16);
    } else if (this.activeGeom === 'torus') {
      geom = new THREE.TorusGeometry(0.4, 0.15, 8, 24);
    } else {
      geom = new THREE.OctahedronGeometry(0.55, 0);
    }

    this.innerMesh.geometry.dispose();
    this.innerMesh.geometry = geom;
    this.coreGroup.add(this.innerMesh);
  }

  onResize() {
    if (!this.renderer || !this.camera) return;

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  onMouseMove(e) {
    // Normalise pointer coordinates -1 to +1
    this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

    // Target rotation based on pointer coordinates
    this.targetRotY = this.mouseX * Math.PI * 0.15;
    this.targetRotX = -this.mouseY * Math.PI * 0.15;
  }

  onScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 1;
    const scrollFraction = window.scrollY / maxScroll;

    // Detect scroll speed to accelerate particle vortex (warp speed jump!)
    const currentScrollY = window.scrollY;
    const scrollDelta = Math.abs(currentScrollY - this.lastScrollY);
    this.lastScrollY = currentScrollY;

    // Warp speed increases when scrolling quickly
    this.warpSpeedTarget = 0.004 + (scrollDelta * 0.0012);
    
    // Find matching stage brackets for coordinates interpolation
    let lower = this.stages[0];
    let upper = this.stages[this.stages.length - 1];

    for (let i = 0; i < this.stages.length - 1; i++) {
      if (scrollFraction >= this.stages[i].scroll && scrollFraction <= this.stages[i + 1].scroll) {
        lower = this.stages[i];
        upper = this.stages[i + 1];
        break;
      }
    }

    const range = upper.scroll - lower.scroll;
    const fraction = range > 0 ? (scrollFraction - lower.scroll) / range : 0;

    // Interpolation targets
    this.targetX = this.lerp(lower.x, upper.x, fraction);
    this.targetY = this.lerp(lower.y, upper.y, fraction);
    this.targetZ = this.lerp(lower.z, upper.z, fraction);
    this.targetScale = this.lerp(lower.scale, upper.scale, fraction);

    // Adjustment for responsive mobile viewports (center core)
    if (window.innerWidth <= 1100) {
      if (scrollFraction < 0.22) {
        // Hero: centered, lower down
        this.targetX = 0;
        this.targetY = -0.5;
        this.targetScale = 0.8;
      } else if (scrollFraction >= 0.35 && scrollFraction < 0.6) {
        // Customizer: centered, pushed up
        this.targetX = 0;
        this.targetY = 0.8;
        this.targetScale = 0.9;
      }
    }
  }

  lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Position & Scale lerping
    this.currentX = this.lerp(this.currentX, this.targetX, 0.08);
    this.currentY = this.lerp(this.currentY, this.targetY, 0.08);
    this.currentZ = this.lerp(this.currentZ, this.targetZ, 0.08);
    this.currentScale = this.lerp(this.currentScale, this.targetScale, 0.08);

    if (this.coreGroup) {
      this.coreGroup.position.set(this.currentX, this.currentY, this.currentZ);
      this.coreGroup.scale.set(this.currentScale, this.currentScale, this.currentScale);

      // 2. Slow base spin + speed modifier
      const baseRotation = delta * 0.15 * this.spinSpeedMult;
      this.coreGroup.rotation.y += baseRotation;
      
      if (this.outerMesh) {
        this.outerMesh.rotation.x -= baseRotation * 0.5;
        this.outerMesh.rotation.z += baseRotation * 0.3;
      }

      if (this.orbitRing1 && this.orbitRing2) {
        this.orbitRing1.rotation.z += baseRotation * 1.5;
        this.orbitRing2.rotation.z -= baseRotation * 1.2;
      }

      // 3. Pointer interactive displacement
      this.coreGroup.rotation.y += (this.targetRotY - this.coreGroup.rotation.y) * 0.05;
      this.coreGroup.rotation.x += (this.targetRotX - this.coreGroup.rotation.x) * 0.05;

      // 4. Subtle hover breathing pulse
      const pulseFactor = Math.sin(elapsedTime * 2.0) * 0.04;
      this.coreGroup.scale.addScalar(pulseFactor * delta);
    }

    // 5. Warp Speed Particle Tunnel Simulation
    this.warpSpeedCurrent = this.lerp(this.warpSpeedCurrent, this.warpSpeedTarget, 0.05);
    
    // Slow drift when scroll stops
    this.warpSpeedTarget = this.lerp(this.warpSpeedTarget, 0.004, 0.08);

    if (this.particles) {
      const positions = this.particleGeometry.attributes.position.array;
      const speeds = this.particleGeometry.userData.speeds;
      
      for (let i = 2; i < positions.length; i += 3) {
        const idx = Math.floor(i / 3);
        const zStep = this.warpSpeedCurrent * speeds[idx] * 80;
        
        positions[i] += zStep;

        // If particles pass camera, recycle back into the distance
        if (positions[i] > 4) {
          positions[i] = -16;
        }
      }
      this.particleGeometry.attributes.position.needsUpdate = true;
      this.particles.rotation.z += delta * 0.02; // slow space spin
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

// Instantiate Global WebGL universe
const spaceWebGL = new WebGLUniverse();

/* --- INTERACTIVE HUD CUSTOMIZER EVENTS --- */
function initHUDCustomizer() {
  const geomButtons = document.querySelectorAll('.tech-btn');
  const spinSlider = document.getElementById('spin-slider');
  const spinDisplay = document.getElementById('spin-display');
  const densitySlider = document.getElementById('density-slider');
  const densityDisplay = document.getElementById('density-display');
  const colorChips = document.querySelectorAll('.color-chip');

  // Geometry selector buttons
  geomButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      geomButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const geomType = btn.getAttribute('data-geometry');
      spaceWebGL.activeGeom = geomType;
      spaceWebGL.updateCoreGeometry();
      
      sfx.play('click');
      updateHUDReadout();
    });
  });

  // Spin speed slider
  if (spinSlider && spinDisplay) {
    spinSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      spinDisplay.innerText = `${val.toFixed(1)}x`;
      spaceWebGL.spinSpeedMult = val;
    });
    spinSlider.addEventListener('change', () => {
      sfx.play('click');
      updateHUDReadout();
    });
  }

  // Particle density slider
  if (densitySlider && densityDisplay) {
    densitySlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      densityDisplay.innerText = val.toLocaleString();
      spaceWebGL.particleDensity = val;
      spaceWebGL.updateParticleDensityRange();
    });
    densitySlider.addEventListener('change', () => {
      sfx.play('click');
      updateHUDReadout();
    });
  }

  // Color palette chips
  colorChips.forEach(chip => {
    chip.addEventListener('click', () => {
      colorChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      
      const colorKey = chip.getAttribute('data-color');
      spaceWebGL.currentColor = colorKey;
      spaceWebGL.updateCoreMaterials();
      
      // Sync cursor colors
      const cursor = document.getElementById('custom-cursor');
      if (cursor) {
        if (colorKey === 'magenta') {
          cursor.style.borderColor = 'var(--neon-magenta)';
        } else if (colorKey === 'green') {
          cursor.style.borderColor = 'var(--neon-green)';
        } else if (colorKey === 'yellow') {
          cursor.style.borderColor = 'var(--neon-yellow)';
        } else {
          cursor.style.borderColor = 'var(--neon-cyan)';
        }
      }
      
      sfx.play('scan');
      updateHUDReadout();
    });
  });

  function updateHUDReadout() {
    const textTag = document.getElementById('core-state-tag');
    if (textTag) {
      const modeName = spaceWebGL.activeGeom.toUpperCase();
      const speedName = spaceWebGL.spinSpeedMult.toFixed(1);
      const colorName = spaceWebGL.currentColor.toUpperCase();
      textTag.innerText = `STATUS: NOMINAL // GEOM:${modeName} // SPIN:${speedName}x // EMISSION:${colorName}`;
    }
  }
}

/* --- STATS COUNT-UP ANIMATION --- */
function animateStats() {
  const stats = document.querySelectorAll('.stat-val');
  
  const options = {
    threshold: 0.5,
    rootMargin: "0px"
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const endVal = parseFloat(target.getAttribute('data-value'));
        const prefix = target.getAttribute('data-prefix') || '';
        const suffix = target.getAttribute('data-suffix') || '';
        
        let current = 0;
        const duration = 2000; // ms
        const steps = 60;
        const increment = endVal / steps;
        const stepTime = duration / steps;

        const timer = setInterval(() => {
          current += increment;
          if (current >= endVal) {
            target.innerText = prefix + endVal.toLocaleString() + suffix;
            clearInterval(timer);
          } else {
            const formatted = Math.floor(current);
            target.innerText = prefix + formatted.toLocaleString() + suffix;
          }
        }, stepTime);

        sfx.play('success');
        obs.unobserve(target);
      }
    });
  }, options);

  stats.forEach(stat => observer.observe(stat));
}

/* --- FAQ ACCORDION --- */
function initAccordion() {
  const questions = document.querySelectorAll('.faq-question');
  
  questions.forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const isActive = item.classList.contains('active');
      
      // Close all items
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-answer').style.maxHeight = '0';
      });

      if (!isActive) {
        item.classList.add('active');
        const answer = item.querySelector('.faq-answer');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        sfx.play('click');
      }
    });
  });
}

/* --- INTERACTIVE AUDIO CONTROL BUTTON --- */
function initAudioToggle() {
  const btn = document.getElementById('audio-toggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const isMuted = sfx.toggleMute();
    
    if (isMuted) {
      btn.classList.remove('active');
      btn.innerHTML = '<span></span> AUDIO: OFF';
    } else {
      btn.classList.add('active');
      btn.innerHTML = '<span></span> AUDIO: ACTIVE';
      sfx.play('success');
    }
  });
}

/* --- MOBILE BURGER MENU --- */
function initMobileMenu() {
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!burger) return;

  burger.addEventListener('click', () => {
    nav.classList.toggle('active');
    burger.classList.toggle('toggle');
    sfx.play('click');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('active');
      burger.classList.remove('toggle');
    });
  });
}

/* --- REGISTRATION FORM HANDLER --- */
function initRegistrationForm() {
  const form = document.getElementById('register-form');
  const submitBtn = document.getElementById('reg-submit-btn');

  if (!form || !submitBtn) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    sfx.play('success');
    
    const name = document.getElementById('reg-name').value;
    const track = document.getElementById('reg-track').value.toUpperCase();
    
    // Play transition feedback and show alert
    alert(`[TRANSMISSION SUCCESSFUL]\n\nNeural credentials registered for pilot "${name}" on track "${track}".\n\nWelcome to the Techfest 2026 arena. Synchronization key emitted.`);
    
    form.reset();
  });
}

/* --- ONLOAD BOOTSTRAP --- */
document.addEventListener('DOMContentLoaded', () => {
  // Start WebGL universe
  spaceWebGL.init();

  // Load interactive elements
  initCustomCursor();
  initMobileMenu();
  initAudioToggle();
  initTerminal();
  initCountdown();
  initHUDCustomizer();
  animateStats();
  initAccordion();
  initRegistrationForm();
});
