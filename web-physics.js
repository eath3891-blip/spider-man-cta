/**
 * Spider-Man Hyper-Realistic Web Physics & Multi-Fibril Silk Engine
 * Production-Ready
 * 
 * Features:
 * - Multi-fibril braided dragline silk (core cable + intertwined helical fibrils)
 * - Viscid adhesive glue pearls (wet glistening droplets with specular glints)
 * - Frayed gossamer wisps fluttering with aerodynamic turbulence
 * - Organic spiderweb net arborization (radial fingers + concentric cross-strands)
 * - Tangential aerodynamic drag & inertia (natural bowing during orbital revolution)
 * - Elastic Hookean spring-mass pull physics that reels the mouse cursor inward
 * - Multi-emitter support across the entire button surface and spider emblem
 * - High-DPI canvas rendering with automatic resize handling
 */

class WebParticle {
  constructor(x, y, vx = 0, vy = 0, life = 1, color = 'rgba(255,255,255,0.85)') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.size = Math.random() * 2 + 1;
  }

  update(dt) {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.94;
    this.vy *= 0.94;
    this.life -= dt;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.fillStyle = this.color.replace(/[\d\.]+\)$/, `${(alpha * 0.9).toFixed(2)})`);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class SpideyWebStrand {
  constructor(startPoint, targetPoint, emitterKey = 'center') {
    this.startPoint = { ...startPoint };
    this.targetPoint = { ...targetPoint };
    this.emitterKey = emitterKey;

    this.numSegments = 20; // High-fidelity rope nodes
    this.nodes = [];
    this.attached = false;
    this.firing = true;
    this.fireProgress = 0;
    this.fireSpeed = 9.5; // High projectile velocity

    this.tension = 0;
    this.vibrationFreq = 0;
    this.vibrationAmp = 0;
    this.vibrationDecay = 0.92;
    this.age = 0;

    // Specular light glint position along the strand (0 to 1)
    this.glintPos = Math.random();
    this.glintSpeed = 0.4 + Math.random() * 0.5;

    // Wispy frayed micro-filaments branching along the main cord
    this.wisps = [];
    const numWisps = 6;
    for (let w = 0; w < numWisps; w++) {
      this.wisps.push({
        segmentIndex: Math.floor(Math.random() * (this.numSegments - 4)) + 2,
        length: 12 + Math.random() * 18,
        angleOffset: (Math.random() - 0.5) * Math.PI * 0.8,
        phase: Math.random() * Math.PI * 2,
        speed: 4 + Math.random() * 6
      });
    }

    // Organic Spiderweb Net Arborization at the Cursor
    this.anchorFingers = [];
    const numFingers = 7;
    for (let f = 0; f < numFingers; f++) {
      const angle = (Math.PI * 2 * f) / numFingers + (Math.random() - 0.5) * 0.35;
      const length = 22 + Math.random() * 26;
      this.anchorFingers.push({
        angle: angle,
        length: length,
        flex: Math.random() * 0.3 + 0.7,
        tipSpread: (Math.random() - 0.5) * 12
      });
    }

    // Button Root Anchors (spreading where web leaves the button)
    this.buttonRoots = [
      { angleOffset: -0.4, length: 14 },
      { angleOffset: 0.4, length: 14 },
      { angleOffset: 0.0, length: 18 }
    ];

    this.particles = [];

    // Initialize nodes
    const dx = (targetPoint.x - startPoint.x) / (this.numSegments - 1);
    const dy = (targetPoint.y - startPoint.y) / (this.numSegments - 1);
    const curveOffset = (Math.random() - 0.5) * 20;

    for (let i = 0; i < this.numSegments; i++) {
      const norm = i / (this.numSegments - 1);
      const arc = Math.sin(norm * Math.PI) * curveOffset;
      const perpX = -(dy / (Math.hypot(dx, dy) || 1)) * arc;
      const perpY = (dx / (Math.hypot(dx, dy) || 1)) * arc;

      this.nodes.push({
        x: startPoint.x + dx * i + perpX,
        y: startPoint.y + dy * i + perpY,
        oldX: startPoint.x + dx * i + perpX,
        oldY: startPoint.y + dy * i + perpY,
        mass: i === 0 || i === this.numSegments - 1 ? 0 : 1
      });
    }
  }

  update(startPoint, targetPoint, dt, pullForceFactor = 1.0) {
    this.age += dt;
    this.startPoint = { ...startPoint };

    // Advance specular glint
    this.glintPos = (this.glintPos + this.glintSpeed * dt) % 1.0;

    // Projectile shooting phase
    if (this.firing) {
      this.fireProgress += this.fireSpeed * dt;
      if (this.fireProgress >= 1) {
        this.fireProgress = 1;
        this.firing = false;
        this.attached = true;
        if (window.spideyAudio) {
          window.spideyAudio.playLatch();
        }
        this.spawnBurst(targetPoint.x, targetPoint.y, 16);
      }
    }

    // Current tip location
    const currentTip = this.firing
      ? {
          x: this.startPoint.x + (targetPoint.x - this.startPoint.x) * this.fireProgress,
          y: this.startPoint.y + (targetPoint.y - this.startPoint.y) * this.fireProgress
        }
      : targetPoint;

    // Pin emitter and target tip
    this.nodes[0].x = this.startPoint.x;
    this.nodes[0].y = this.startPoint.y;
    this.nodes[0].oldX = this.startPoint.x;
    this.nodes[0].oldY = this.startPoint.y;

    const tipIdx = this.numSegments - 1;
    this.nodes[tipIdx].x = currentTip.x;
    this.nodes[tipIdx].y = currentTip.y;
    this.nodes[tipIdx].oldX = currentTip.x;
    this.nodes[tipIdx].oldY = currentTip.y;

    // Calculate total straight-line distance & tension
    const totalDist = Math.hypot(currentTip.x - this.startPoint.x, currentTip.y - this.startPoint.y);
    const restLength = 170;
    const stretch = Math.max(0, totalDist - restLength);
    this.tension = Math.min(2.8, stretch / 110);

    // Dynamic harmonic twangs when stretched taut
    if (this.tension > 0.7 && Math.random() < 0.3) {
      this.vibrationAmp = Math.min(14, this.tension * 9);
      this.vibrationFreq = 24 + Math.random() * 16;
      if (window.spideyAudio && Math.random() < 0.09) {
        window.spideyAudio.playTwang(this.tension);
      }
    }
    this.vibrationAmp *= this.vibrationDecay;

    // Verlet integration with Aerodynamic Drag & Gravity
    const gravity = Math.max(0.08, 0.45 - this.tension * 0.4);
    const airDrag = 0.93;

    for (let i = 1; i < tipIdx; i++) {
      const node = this.nodes[i];
      let vx = (node.x - node.oldX) * airDrag;
      let vy = (node.y - node.oldY) * airDrag;

      node.oldX = node.x;
      node.oldY = node.y;

      // Harmonic standing wave ripple under tension
      let ripple = 0;
      if (this.vibrationAmp > 0.08) {
        const norm = i / tipIdx;
        ripple = Math.sin(norm * Math.PI) * Math.sin(this.age * this.vibrationFreq) * this.vibrationAmp;
      }

      node.x += vx;
      node.y += vy + gravity + ripple * 0.12;
    }

    // Constraint solver passes
    const iterations = 10;
    const targetSegmentLength = totalDist / (this.numSegments - 1);
    for (let iter = 0; iter < iterations; iter++) {
      for (let i = 0; i < tipIdx; i++) {
        const n1 = this.nodes[i];
        const n2 = this.nodes[i + 1];

        const ndx = n2.x - n1.x;
        const ndy = n2.y - n1.y;
        const dist = Math.hypot(ndx, ndy) || 0.001;
        const diff = (dist - targetSegmentLength) / dist;

        const factor = 0.5;
        if (i > 0) {
          n1.x += ndx * factor * diff;
          n1.y += ndy * factor * diff;
        }
        if (i + 1 < tipIdx) {
          n2.x -= ndx * factor * diff;
          n2.y -= ndy * factor * diff;
        }
      }
    }

    // Update floating particles
    for (let p = this.particles.length - 1; p >= 0; p--) {
      this.particles[p].update(dt);
      if (this.particles[p].life <= 0) {
        this.particles.splice(p, 1);
      }
    }

    // Specular silk micro-droplet sparkles under tension
    if (this.tension > 0.75 && Math.random() < 0.4 && this.particles.length < 35) {
      const randNode = this.nodes[Math.floor(Math.random() * (tipIdx - 3)) + 1];
      this.particles.push(
        new WebParticle(
          randNode.x + (Math.random() - 0.5) * 6,
          randNode.y + (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          0.35 + Math.random() * 0.35,
          'rgba(255, 255, 255, 0.9)'
        )
      );
    }

    // Calculate Inward Pull Vector on Cursor
    const pullMagnitude = Math.min(2.4, (0.05 + this.tension * 0.09) * pullForceFactor);
    const pullDirX = (this.startPoint.x - currentTip.x) / (totalDist || 1);
    const pullDirY = (this.startPoint.y - currentTip.y) / (totalDist || 1);

    return {
      pullX: pullDirX * pullMagnitude * totalDist * 0.09,
      pullY: pullDirY * pullMagnitude * totalDist * 0.09,
      tension: this.tension
    };
  }

  spawnBurst(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1.5;
      this.particles.push(
        new WebParticle(
          x,
          y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          0.3 + Math.random() * 0.4,
          'rgba(255, 255, 255, 0.9)'
        )
      );
    }
  }

  /**
   * Hyper-Realistic Biological Silk Rendering
   */
  draw(ctx) {
    const tipIdx = this.numSegments - 1;
    const currentTip = this.nodes[tipIdx];

    ctx.save();

    const baseColor = '255, 255, 255';
    const glowColor = '190, 225, 255';
    const dropColor = '245, 250, 255';

    // 1. Button Silk Roots (Spreading anchor feet at the button)
    const startAngle = Math.atan2(this.nodes[1].y - this.nodes[0].y, this.nodes[1].x - this.nodes[0].x);
    this.buttonRoots.forEach((root) => {
      const rAng = startAngle + Math.PI + root.angleOffset;
      const rx = this.nodes[0].x + Math.cos(rAng) * root.length;
      const ry = this.nodes[0].y + Math.sin(rAng) * root.length;

      ctx.beginPath();
      ctx.moveTo(this.nodes[0].x, this.nodes[0].y);
      ctx.quadraticCurveTo(this.nodes[0].x + Math.cos(rAng) * 6, this.nodes[0].y + Math.sin(rAng) * 6, rx, ry);
      ctx.strokeStyle = `rgba(${baseColor}, 0.5)`;
      ctx.lineWidth = 1.0;
      ctx.stroke();
    });

    // 2. Translucent Glycoprotein Sheath (Soft Silk Halo)
    ctx.beginPath();
    ctx.moveTo(this.nodes[0].x, this.nodes[0].y);
    for (let i = 1; i < this.numSegments; i++) {
      const xc = (this.nodes[i].x + this.nodes[i - 1].x) / 2;
      const yc = (this.nodes[i].y + this.nodes[i - 1].y) / 2;
      ctx.quadraticCurveTo(this.nodes[i - 1].x, this.nodes[i - 1].y, xc, yc);
    }
    ctx.lineTo(currentTip.x, currentTip.y);
    ctx.strokeStyle = `rgba(${glowColor}, ${0.28 + this.tension * 0.12})`;
    ctx.lineWidth = Math.max(3.5, 6.5 - this.tension * 1.5);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // 3. Main Tensile Silk Core (Braided Dragline Silk)
    ctx.beginPath();
    ctx.moveTo(this.nodes[0].x, this.nodes[0].y);
    for (let i = 1; i < this.numSegments; i++) {
      const xc = (this.nodes[i].x + this.nodes[i - 1].x) / 2;
      const yc = (this.nodes[i].y + this.nodes[i - 1].y) / 2;
      ctx.quadraticCurveTo(this.nodes[i - 1].x, this.nodes[i - 1].y, xc, yc);
    }
    ctx.lineTo(currentTip.x, currentTip.y);
    ctx.strokeStyle = `rgba(${baseColor}, 0.95)`;
    ctx.lineWidth = Math.max(1.4, 2.6 - this.tension * 0.5);
    ctx.stroke();

    // 4. Helical Braided Fibrils
    ctx.beginPath();
    ctx.strokeStyle = `rgba(${baseColor}, 0.65)`;
    ctx.lineWidth = 0.9;
    for (let i = 0; i < this.numSegments - 1; i++) {
      const n = this.nodes[i];
      const next = this.nodes[i + 1];
      const spiralOffset = Math.sin(i * 1.6 + this.age * 9) * (1.8 + this.tension * 0.8);
      const perpX = -(next.y - n.y);
      const perpY = next.x - n.x;
      const len = Math.hypot(perpX, perpY) || 1;
      const sx = n.x + (perpX / len) * spiralOffset;
      const sy = n.y + (perpY / len) * spiralOffset;

      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // Counter-twisting second fibril
    ctx.beginPath();
    ctx.strokeStyle = `rgba(${dropColor}, 0.5)`;
    ctx.lineWidth = 0.7;
    for (let i = 0; i < this.numSegments - 1; i++) {
      const n = this.nodes[i];
      const next = this.nodes[i + 1];
      const spiralOffset = Math.cos(i * 1.6 + this.age * 9) * (1.8 + this.tension * 0.8);
      const perpX = -(next.y - n.y);
      const perpY = next.x - n.x;
      const len = Math.hypot(perpX, perpY) || 1;
      const sx = n.x + (perpX / len) * spiralOffset;
      const sy = n.y + (perpY / len) * spiralOffset;

      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // 5. Viscid Glue Pearls (Sticky Micro-Droplets on the Silk)
    for (let i = 2; i < tipIdx - 1; i += 2) {
      const node = this.nodes[i];
      const next = this.nodes[i + 1];
      const tangX = next.x - node.x;
      const tangY = next.y - node.y;
      const dropAngle = Math.atan2(tangY, tangX);

      ctx.save();
      ctx.translate(node.x, node.y);
      ctx.rotate(dropAngle);

      const dropRx = 2.4 + this.tension * 0.6;
      const dropRy = Math.max(1.0, 1.8 - this.tension * 0.3);

      ctx.beginPath();
      ctx.ellipse(0, 0, dropRx, dropRy, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${dropColor}, 0.85)`;
      ctx.fill();

      // Specular highlight pinpoint
      ctx.beginPath();
      ctx.arc(-dropRx * 0.3, -dropRy * 0.3, 0.7, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.restore();
    }

    // 6. Gossamer Wisps (Frayed Micro-Filaments)
    this.wisps.forEach((wisp) => {
      const baseNode = this.nodes[wisp.segmentIndex];
      const nextNode = this.nodes[wisp.segmentIndex + 1];
      const tangAngle = Math.atan2(nextNode.y - baseNode.y, nextNode.x - baseNode.x);
      const flutter = Math.sin(this.age * wisp.speed + wisp.phase) * 0.35;
      const wAngle = tangAngle + wisp.angleOffset + flutter;

      const wx = baseNode.x + Math.cos(wAngle) * wisp.length;
      const wy = baseNode.y + Math.sin(wAngle) * wisp.length;

      ctx.beginPath();
      ctx.moveTo(baseNode.x, baseNode.y);
      ctx.quadraticCurveTo(
        baseNode.x + Math.cos(wAngle - 0.2) * (wisp.length * 0.6),
        baseNode.y + Math.sin(wAngle - 0.2) * (wisp.length * 0.6),
        wx,
        wy
      );
      ctx.strokeStyle = `rgba(${baseColor}, 0.4)`;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    });

    // 7. Specular Light Glint
    const glintIndex = Math.min(tipIdx - 2, Math.floor(this.glintPos * (tipIdx - 1)));
    const gNode1 = this.nodes[glintIndex];
    const gNode2 = this.nodes[glintIndex + 1];
    const frac = (this.glintPos * (tipIdx - 1)) - glintIndex;
    const gx = gNode1.x + (gNode2.x - gNode1.x) * frac;
    const gy = gNode1.y + (gNode2.y - gNode1.y) * frac;

    ctx.beginPath();
    ctx.arc(gx, gy, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;

    // 8. Organic Spiderweb Net Arborization at Cursor
    if (this.attached || this.fireProgress > 0.85) {
      const approachAngle = Math.atan2(currentTip.y - this.startPoint.y, currentTip.x - this.startPoint.x);
      const tipPoints = [];

      this.anchorFingers.forEach((finger) => {
        const fingerAngle = approachAngle + finger.angle;
        const fingerLen = finger.length * (0.85 + this.tension * 0.4);
        const fx = currentTip.x + Math.cos(fingerAngle) * fingerLen;
        const fy = currentTip.y + Math.sin(fingerAngle) * fingerLen;

        tipPoints.push({ x: fx, y: fy });

        const cx = currentTip.x + Math.cos(fingerAngle - 0.18) * (fingerLen * 0.55);
        const cy = currentTip.y + Math.sin(fingerAngle - 0.18) * (fingerLen * 0.55);

        ctx.beginPath();
        ctx.moveTo(currentTip.x, currentTip.y);
        ctx.quadraticCurveTo(cx, cy, fx, fy);
        ctx.strokeStyle = `rgba(${baseColor}, 0.85)`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(fx, fy, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dropColor}, 0.95)`;
        ctx.fill();
      });

      // Transverse Web Arcs (mini web net)
      if (tipPoints.length >= 3) {
        ctx.beginPath();
        for (let i = 0; i < tipPoints.length; i++) {
          const p1 = tipPoints[i];
          const p2 = tipPoints[(i + 1) % tipPoints.length];

          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          const arcSagX = midX + (currentTip.x - midX) * 0.35;
          const arcSagY = midY + (currentTip.y - midY) * 0.35;

          if (i === 0) ctx.moveTo(p1.x, p1.y);
          ctx.quadraticCurveTo(arcSagX, arcSagY, p2.x, p2.y);
        }
        ctx.strokeStyle = `rgba(${baseColor}, 0.55)`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Central viscous silk hub at cursor anchor
      ctx.beginPath();
      ctx.arc(currentTip.x, currentTip.y, 4.5 + this.tension * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${baseColor}, 0.95)`;
      ctx.fill();
    }

    // 9. Silk particles
    this.particles.forEach((p) => p.draw(ctx));

    ctx.restore();
  }
}

class SpideyWebEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.strands = [];
    this.pullStrength = 1.0;
    this.resizeDebounceTimer = null;

    this.resize();
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeDebounceTimer);
      this.resizeDebounceTimer = setTimeout(() => this.resize(), 100);
    }, { passive: true });
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for optimal performance
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  shootWeb(emitterKey, startPoint, targetPoint) {
    // Keep up to 8 simultaneous active strands for rich web-net effect
    if (this.strands.length >= 8) {
      this.strands.shift();
    }
    const strand = new SpideyWebStrand(startPoint, targetPoint, emitterKey);
    this.strands.push(strand);

    if (window.spideyAudio) {
      window.spideyAudio.playThwip();
    }
    return strand;
  }

  releaseAll() {
    this.strands = [];
  }

  update(emitterResolver, targetPoint, dt) {
    let totalPullX = 0;
    let totalPullY = 0;
    let maxTension = 0;

    for (let i = this.strands.length - 1; i >= 0; i--) {
      const strand = this.strands[i];
      let shooterPos;

      if (typeof emitterResolver === 'function') {
        shooterPos = emitterResolver(strand.emitterKey);
      } else if (Array.isArray(emitterResolver)) {
        shooterPos = emitterResolver[strand.emitterKey % emitterResolver.length] || emitterResolver[0];
      } else if (emitterResolver && typeof emitterResolver === 'object') {
        shooterPos = emitterResolver[strand.emitterKey] || emitterResolver.center;
      }

      if (!shooterPos) {
        shooterPos = strand.startPoint;
      }

      const pullResult = strand.update(shooterPos, targetPoint, dt, this.pullStrength);

      // Web strands gradually expire if they get too old (> 4.0s) unless under high tension
      if (strand.age > 4.0 && this.strands.length > 3) {
        strand.spawnBurst(strand.nodes[strand.numSegments - 1].x, strand.nodes[strand.numSegments - 1].y, 6);
        this.strands.splice(i, 1);
        continue;
      }

      totalPullX += pullResult.pullX;
      totalPullY += pullResult.pullY;
      maxTension = Math.max(maxTension, pullResult.tension);
    }

    return {
      pullX: totalPullX,
      pullY: totalPullY,
      tension: maxTension,
      activeWebs: this.strands.length
    };
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (let i = 0; i < this.strands.length; i++) {
      this.strands[i].draw(this.ctx);
    }
  }
}

window.SpideyWebEngine = SpideyWebEngine;
