/* --- SCI-FI WEB AUDIO SYNTHESIZER --- */
class SciFiAudio {
  constructor() {
    this.ctx = null;
    this.muted = true; // Start muted to comply with browser policies
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    this.init();
    return this.muted;
  }

  play(type) {
    if (this.muted) return;
    this.init();
    
    // Resume context if suspended (common browser security rule)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    
    switch (type) {
      case 'hover': {
        // High-pitched short sci-fi blip
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.08);
        gain.gain.setValueAtTime(0.02, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.08);
        break;
      }
      case 'click': {
        // Short technical feedback click
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.setValueAtTime(150, t + 0.03);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.04);
        break;
      }
      case 'success': {
        // High-tech ascending positive double chime
        const playNote = (freq, start, duration) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.04, start);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(start);
          osc.stop(start + duration);
        };
        playNote(523.25, t, 0.12); // C5
        playNote(783.99, t + 0.08, 0.18); // G5
        playNote(1046.50, t + 0.16, 0.25); // C6
        break;
      }
      case 'scan': {
        // Cyber scan sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.exponentialRampToValueAtTime(1800, t + 0.35);
        gain.gain.setValueAtTime(0.015, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
        
        // Low pass filter to make it warmer
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, t);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(t);
        osc.stop(t + 0.35);
        break;
      }
      case 'error': {
        // Warning dual pitch low drone
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(120, t);
        osc2.frequency.setValueAtTime(123, t); // slight detune
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.linearRampToValueAtTime(0.0001, t + 0.3);
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, t);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 0.3);
        osc2.stop(t + 0.3);
        break;
      }
    }
  }
}

// Instantiate Sound Controller
const sfx = new SciFiAudio();

/* --- DYNAMIC DIAGNOSTIC TERMINAL LOGS --- */
const terminalLines = [
  { text: 'BOOTING NEURAL_LINK MODULE v8.12...', type: 'info' },
  { text: 'INITIALIZING COMPATIBILITY MATRIX SCAN...', type: 'info' },
  { text: 'SECURE LINK: STABLE [ENCRYPTION: SHIELD_X]', type: 'success' },
  { text: 'SYNAPSE OVERDRIVE DETECTED AT 1.25x CAPACITY', type: 'info' },
  { text: 'WARNING: Dermal micro-fever at 38.2°C. Core compensating.', type: 'error' },
  { text: 'OPTICAL MATRIX SYNC STATUS: 100% ONLINE', type: 'success' },
  { text: 'ALL SUB-DERMAL IMPLANTS VERIFIED.', type: 'success' },
  { text: 'SYNAPSE NETWORX CHIP IS READY FOR DIRECT LINK.', type: 'info' },
  { text: 'COGNITIVE BANDWIDTH INDEX: STABLE [4.5 TB/s]', type: 'success' },
  { text: 'NANO-HEART STABILITY: 99.98% OPTIMAL', type: 'success' },
  { text: 'ALERT: Cybernetic muscle hydraulic fluid at 94%. Optimal.', type: 'info' }
];

function initTerminal() {
  const body = document.getElementById('terminal-body');
  if (!body) return;

  let index = 0;

  function addTerminalLine() {
    // Keep terminal cleaner: remove oldest line if more than 6 lines
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
    
    // Auto-scroll
    body.scrollTop = body.scrollHeight;

    // Trigger audio beep for new log line
    sfx.play('hover');

    index = (index + 1) % terminalLines.length;
    
    // Schedule next lines with variable speed
    setTimeout(addTerminalLine, Math.random() * 2500 + 1500);
  }

  // Pre-load a line immediately, then kick off loop
  addTerminalLine();
}

/* --- CYBORG BLUEPRINT CUSTOMIZER --- */
const augmentData = {
  neural: {
    title: "Synapse Cortex V4",
    id: "MOD_NRL_09X",
    desc: "Seamlessly integrates direct quantum-dot neuro-coprocessing into the prefrontal cortex, unlocking accelerated memory recall, quantum decryption capabilities, and an auxiliary digital mind matrix.",
    stats: { compatibility: 98, bandwidth: 94, efficiency: 97 },
    icon: "Ψ"
  },
  optical: {
    title: "Ares HUD Retinal Implants",
    id: "MOD_OPT_77B",
    desc: "Replaces organic lenses with dynamic liquid-crystal opto-arrays. Outfitted with real-time vector trajectory plotting, chemical analysis scan modes, tactical threats overlay, and night/thermal imaging.",
    stats: { compatibility: 91, bandwidth: 89, efficiency: 95 },
    icon: "👁"
  },
  core: {
    title: "Nano-Fusion Reactor Core",
    id: "MOD_COR_505",
    desc: "A sub-dermal thorium fusion cell embedded inside the thoracic cavity. Supplies constant, self-stabilized energy to all integrated cyberware modules without biological load, extending lifespan.",
    stats: { compatibility: 96, bandwidth: 97, efficiency: 99 },
    icon: "⚡"
  },
  arm: {
    title: "Carbon-Alloy Hydraulic Limb",
    id: "MOD_ARM_88D",
    desc: "Replaces skeletal arm structures with high-tensile carbon nanotubes and hydraulic actuators. Provides physical payload lifting power up to 5 metric tons and sub-millisecond reflex speed.",
    stats: { compatibility: 88, bandwidth: 85, efficiency: 92 },
    icon: "🦾"
  },
  legs: {
    title: "Kinetic Calf Dampeners",
    id: "MOD_LEG_21Y",
    desc: "Engineered calf modifications featuring magnetic shock absorbers and pneumatic thruster assemblies. Absorbs high-impact falls, allows 15-meter bounds, and provides near-silent auditory footprint.",
    stats: { compatibility: 93, bandwidth: 90, efficiency: 94 },
    icon: "🦵"
  }
};

function selectAugment(key) {
  const data = augmentData[key];
  if (!data) return;

  // Update text values
  document.getElementById('panel-title').innerText = data.title;
  document.getElementById('panel-id').innerText = `SPEC_ID // ${data.id}`;
  document.getElementById('panel-desc').innerText = data.desc;
  document.getElementById('panel-icon').innerText = data.icon;

  // Animate progress bars
  const statBars = {
    compatibility: document.getElementById('stat-bar-comp'),
    bandwidth: document.getElementById('stat-bar-band'),
    efficiency: document.getElementById('stat-bar-eff')
  };

  const statText = {
    compatibility: document.getElementById('stat-val-comp'),
    bandwidth: document.getElementById('stat-val-band'),
    efficiency: document.getElementById('stat-val-eff')
  };

  // Set widths
  Object.keys(statBars).forEach(statKey => {
    const val = data.stats[statKey];
    statBars[statKey].style.width = `${val}%`;
    statText[statKey].innerText = `${val}%`;
  });

  // Play scanning sound
  sfx.play('scan');
}

function initAugmentHotspots() {
  const hotspots = document.querySelectorAll('.hotspot');
  
  hotspots.forEach(spot => {
    spot.addEventListener('click', (e) => {
      // Deactivate all
      hotspots.forEach(s => s.classList.remove('active'));
      
      // Activate this
      spot.classList.add('active');
      
      const target = spot.getAttribute('data-target');
      selectAugment(target);
    });

    spot.addEventListener('mouseenter', () => {
      sfx.play('hover');
    });
  });

  // Default selection
  selectAugment('neural');
}

/* --- DYNAMIC CONFIGURATOR CALCULATOR --- */
const tierData = {
  initiate: {
    name: "Initiate Upgrade",
    basePrice: 14999,
    features: [
      "Synapse Link V1 basic integration",
      "Standard HUD Optical lens",
      "6-month biological tuneup check",
      "100W backup power cells"
    ]
  },
  pro: {
    name: "Augmented Pro Edition",
    basePrice: 49999,
    features: [
      "Quantum-Sync neuro-processing unit",
      "Full spectrum optical threat detection",
      "Integrated carbon-fiber limbs (x2)",
      "500W Thorium battery reserves"
    ]
  },
  apex: {
    name: "Apex Cyborg Transcendence",
    basePrice: 124999,
    features: [
      "Apex Core dual-brain digital backup",
      "Thermal, electromagnetic, vector retinals",
      "Full cybernetic musculoskeletal chassis",
      "Self-charging Nano-Fusion Engine Core"
    ]
  }
};

let activeTier = 'pro';
let neuralOverdrive = 1.8;

function updateCheckoutConfig() {
  const tier = tierData[activeTier];
  const overdriveMultiplier = parseFloat(neuralOverdrive);
  
  // Calculate price dynamically
  // Base price + (Overdrive factor cost: extra multiplier * $8000)
  const overdriveCost = Math.round((overdriveMultiplier - 1.0) * 12500);
  const totalCost = tier.basePrice + overdriveCost;
  
  // Calculate dynamic Neural Compatibility Index
  // Higher overdrive drops compatibility
  let compFactor = 98 - Math.round((overdriveMultiplier - 1.0) * 15);
  if (activeTier === 'initiate') compFactor -= 5;
  if (activeTier === 'apex') compFactor += 4;
  compFactor = Math.min(Math.max(compFactor, 50), 99.9); // Cap between 50% and 99.9%

  // Compute cooling load (arbitrary cyber calculation)
  const coolingLoad = Math.round((overdriveMultiplier * 25) + (activeTier === 'apex' ? 30 : 10));

  // Render variables
  document.getElementById('check-tier-name').innerText = tier.name;
  document.getElementById('checkout-base-price').innerText = `$${tier.basePrice.toLocaleString()}`;
  document.getElementById('checkout-overdrive-cost').innerText = `$${overdriveCost.toLocaleString()}`;
  document.getElementById('checkout-comp-val').innerText = `${compFactor}%`;
  
  const compLabel = document.getElementById('checkout-comp-val');
  if (compFactor < 75) {
    compLabel.style.color = 'var(--neon-magenta)';
    compLabel.style.textShadow = 'var(--glow-magenta)';
  } else if (compFactor < 90) {
    compLabel.style.color = 'var(--neon-yellow)';
    compLabel.style.textShadow = 'var(--glow-yellow)';
  } else {
    compLabel.style.color = 'var(--neon-cyan)';
    compLabel.style.textShadow = 'var(--glow-cyan)';
  }

  document.getElementById('checkout-cooling-val').innerText = `${coolingLoad} °C`;
  document.getElementById('checkout-total-price').innerText = `$${totalCost.toLocaleString()}`;

  // Update dynamic features list
  const list = document.getElementById('checkout-features-list');
  if (list) {
    list.innerHTML = '';
    tier.features.forEach(feat => {
      const li = document.createElement('li');
      li.className = 'checkout-item';
      li.innerHTML = `<span class="checkout-item-label">${feat}</span> <span class="checkout-item-val" style="color:var(--neon-green)">ENABLED</span>`;
      list.appendChild(li);
    });
  }
}

function initConfigurator() {
  const tierButtons = document.querySelectorAll('.tier-btn');
  const slider = document.getElementById('overdrive-slider');
  const sliderVal = document.getElementById('slider-val-display');

  tierButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tierButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTier = btn.getAttribute('data-tier');
      sfx.play('click');
      updateCheckoutConfig();
    });

    btn.addEventListener('mouseenter', () => {
      sfx.play('hover');
    });
  });

  if (slider && sliderVal) {
    slider.addEventListener('input', (e) => {
      neuralOverdrive = parseFloat(e.target.value).toFixed(1);
      sliderVal.innerText = `${neuralOverdrive}x`;
      updateCheckoutConfig();
    });
    
    slider.addEventListener('change', () => {
      sfx.play('click');
    });
  }

  // Bind upgrade checkout button
  const orderBtn = document.getElementById('order-btn');
  if (orderBtn) {
    orderBtn.addEventListener('click', () => {
      sfx.play('success');
      alert(`[NEURAL_LINK DETECTED]\n\nInitialization sequence active for the ${tierData[activeTier].name} at ${neuralOverdrive}x overdrive stability!\n\nNeural sync credits updated. Preparing surgical capsule.`);
    });
  }

  // Initial calculation
  updateCheckoutConfig();
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
            // Check if floating point is needed
            const formatted = endVal % 1 === 0 ? Math.floor(current) : current.toFixed(2);
            target.innerText = prefix + parseFloat(formatted).toLocaleString() + suffix;
          }
        }, stepTime);

        // Play brief scan sound once on entry
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
      } else {
        sfx.play('hover');
      }
    });

    q.addEventListener('mouseenter', () => {
      sfx.play('hover');
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
      // Play instant chime to signal active audio
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
    
    link.addEventListener('mouseenter', () => {
      sfx.play('hover');
    });
  });
}

/* --- OTHER HOVER EFFECTS --- */
function initGeneralHovers() {
  const items = document.querySelectorAll('.btn-cyber, .social-icon, .newsletter-btn');
  items.forEach(item => {
    item.addEventListener('mouseenter', () => {
      sfx.play('hover');
    });
  });
}

/* --- ONLOAD BOOTSTRAP --- */
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initAudioToggle();
  initTerminal();
  initAugmentHotspots();
  initConfigurator();
  animateStats();
  initAccordion();
  initGeneralHovers();
});
