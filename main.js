/**
 * Spider-Man "Let's Connect" CTA Experience Controller
 * Production-Ready
 * 
 * Features:
 * - Unified Pointer Events (works flawlessly on Mouse, Trackpad, Touchscreen, and Stylus)
 * - Orbit/revolve detection with multi-strand biological web shooting
 * - Spring-mass elastic pull physics with button recoil
 * - Full Accessibility (Keyboard Enter/Space trigger, Escape modal close, focus management)
 */

(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const canvas = document.getElementById('web-canvas');
    const ctaButton = document.getElementById('spidey-cta');
    const ctaWrapper = document.getElementById('cta-wrapper');
    const spiderSense = document.getElementById('spider-sense');
    const reticle = document.getElementById('spidey-reticle');
    const tensionFill = document.getElementById('tension-fill');
    const tensionText = document.getElementById('tension-text');
    const soundToggleBtn = document.getElementById('sound-toggle');
    const modalBackdrop = document.getElementById('connect-modal');
    const modalCloseBtn = document.getElementById('modal-close');

    if (!canvas || !ctaButton || !ctaWrapper) return;

    // Initialize Web Physics Engine
    const engine = new SpideyWebEngine(canvas);

    // State Variables
    let buttonCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let recoilX = 0;
    let recoilY = 0;
    let webTension = 0;
    let spiderSenseTriggered = false;
    let lastFrameTime = performance.now();
    let fireCooldown = false;

    const pointer = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2,
      inProximity: false,
      lastAngle: 0,
      angularDistanceTraveled: 0,
      hasFiredForThisPass: false
    };

    // Calculate button center coordinates
    function updateButtonBounds() {
      const rect = ctaWrapper.getBoundingClientRect();
      buttonCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }
    updateButtonBounds();
    window.addEventListener('resize', updateButtonBounds, { passive: true });
    window.addEventListener('scroll', updateButtonBounds, { passive: true });

    // Dynamic Emitter Resolver across the entire button surface
    function resolveEmitterPos(emitterKey) {
      const cx = buttonCenter.x + recoilX;
      const cy = buttonCenter.y + recoilY;
      const hw = 134; // Half-width of button
      const hh = 33;  // Half-height of button

      if (emitterKey === 'center') {
        return { x: cx, y: cy };
      }

      if (typeof emitterKey === 'number') {
        const cos = Math.cos(emitterKey);
        const sin = Math.sin(emitterKey);
        const r = (hw * hh) / Math.sqrt((hh * cos) ** 2 + (hw * sin) ** 2);
        return { x: cx + cos * r, y: cy + sin * r };
      }

      if (emitterKey === 'top') return { x: cx, y: cy - hh };
      if (emitterKey === 'bottom') return { x: cx, y: cy + hh };
      if (emitterKey === 'left') return { x: cx - hw, y: cy };
      if (emitterKey === 'right') return { x: cx + hw, y: cy };
      if (emitterKey === 'topLeft') return { x: cx - hw * 0.7, y: cy - hh };
      if (emitterKey === 'topRight') return { x: cx + hw * 0.7, y: cy - hh };
      if (emitterKey === 'bottomLeft') return { x: cx - hw * 0.7, y: cy + hh };
      if (emitterKey === 'bottomRight') return { x: cx + hw * 0.7, y: cy + hh };

      return { x: cx, y: cy };
    }

    // Unified Pointer Event Handler (Mouse & Touch)
    function onPointerMove(clientX, clientY) {
      pointer.x = clientX;
      pointer.y = clientY;

      const dx = pointer.x - buttonCenter.x;
      const dy = pointer.y - buttonCenter.y;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      // Proximity threshold (~380px radius around CTA)
      const proximityRadius = 380;

      if (dist < proximityRadius) {
        if (!pointer.inProximity) {
          pointer.inProximity = true;
          if (spiderSense) spiderSense.classList.add('active');
          if (reticle) reticle.classList.add('active');

          if (!spiderSenseTriggered && window.spideyAudio) {
            window.spideyAudio.playSpiderSense();
            spiderSenseTriggered = true;
          }
        }

        // Track angular distance for revolving/orbiting motion
        let diffAngle = angle - pointer.lastAngle;
        if (diffAngle > Math.PI) diffAngle -= Math.PI * 2;
        if (diffAngle < -Math.PI) diffAngle += Math.PI * 2;

        pointer.angularDistanceTraveled += Math.abs(diffAngle);
        pointer.lastAngle = angle;

        // Fire web volley on entry or when revolving around CTA
        if (!pointer.hasFiredForThisPass || pointer.angularDistanceTraveled > 0.38) {
          fireWebAtCursor();
          pointer.angularDistanceTraveled = 0;
        }
      } else {
        if (pointer.inProximity) {
          pointer.inProximity = false;
          if (spiderSense) spiderSense.classList.remove('active');
          if (reticle) reticle.classList.remove('active');
          ctaButton.classList.remove('firing-web');
          pointer.hasFiredForThisPass = false;
          spiderSenseTriggered = false;

          // Release web when cursor escapes proximity radius
          engine.releaseAll();
        }
      }
    }

    window.addEventListener('pointermove', (e) => onPointerMove(e.clientX, e.clientY), { passive: true });

    // Touch event fallbacks for older devices
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    // Shoot Web Volley from across the entire CTA button
    function fireWebAtCursor(burstAll = false) {
      if (fireCooldown && !burstAll) return;

      const dx = pointer.x - buttonCenter.x;
      const dy = pointer.y - buttonCenter.y;
      const currentAngle = Math.atan2(dy, dx);

      // Visual bio-web flare across entire button
      ctaButton.classList.add('firing-web');
      setTimeout(() => ctaButton.classList.remove('firing-web'), 350);

      if (burstAll) {
        // 360-degree celebration web blast
        const angles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, -(3 * Math.PI) / 4, -Math.PI / 2, -Math.PI / 4];
        angles.forEach((ang) => {
          const start = resolveEmitterPos(ang);
          const target = {
            x: buttonCenter.x + Math.cos(ang) * 320,
            y: buttonCenter.y + Math.sin(ang) * 320
          };
          engine.shootWeb(ang, start, target);
        });
        const centerPos = resolveEmitterPos('center');
        engine.shootWeb('center', centerPos, { x: pointer.targetX, y: pointer.targetY });
        return;
      }

      // Dynamic Multi-Strand Web Net from across button:
      // 1. Primary center Spider Emblem strand
      const centerPos = resolveEmitterPos('center');
      engine.shootWeb('center', centerPos, { x: pointer.targetX, y: pointer.targetY });

      // 2. Direct perimeter strand facing cursor
      const perimeterPos = resolveEmitterPos(currentAngle);
      engine.shootWeb(currentAngle, perimeterPos, { x: pointer.targetX, y: pointer.targetY });

      // 3. Triangulating lateral perimeter strands
      const leftSpreadAngle = currentAngle - 0.45;
      const rightSpreadAngle = currentAngle + 0.45;
      engine.shootWeb(leftSpreadAngle, resolveEmitterPos(leftSpreadAngle), { x: pointer.targetX, y: pointer.targetY });
      engine.shootWeb(rightSpreadAngle, resolveEmitterPos(rightSpreadAngle), { x: pointer.targetX, y: pointer.targetY });

      pointer.hasFiredForThisPass = true;
      fireCooldown = true;
      setTimeout(() => { fireCooldown = false; }, 80);
    }

    // Main 60/120fps Animation Loop
    function animate(timestamp) {
      const dt = Math.min((timestamp - lastFrameTime) / 1000, 0.05);
      lastFrameTime = timestamp;

      // 1. Web physics update
      const physicsResult = engine.update(
        resolveEmitterPos,
        { x: pointer.targetX, y: pointer.targetY },
        dt
      );

      webTension = physicsResult.tension;

      // 2. The PULL effect:
      if (physicsResult.activeWebs > 0) {
        const pullDirX = buttonCenter.x - pointer.targetX;
        const pullDirY = buttonCenter.y - pointer.targetY;
        const pullDist = Math.hypot(pullDirX, pullDirY) || 1;

        // Elastic spring pull reels the cursor toward the button center
        const elasticSpring = (0.05 + webTension * 0.09) * engine.pullStrength;
        pointer.targetX += (pointer.x - pointer.targetX) * 0.2 + (pullDirX / pullDist) * Math.min(pullDist, 22 * elasticSpring);
        pointer.targetY += (pointer.y - pointer.targetY) * 0.2 + (pullDirY / pullDist) * Math.min(pullDist, 22 * elasticSpring);

        // Button recoil reaction
        const recoilTargetX = (pullDirX / pullDist) * -12 * webTension;
        const recoilTargetY = (pullDirY / pullDist) * -12 * webTension;
        recoilX += (recoilTargetX - recoilX) * 0.25;
        recoilY += (recoilTargetY - recoilY) * 0.25;

        // Update Tension Meter UI
        if (tensionFill && tensionText) {
          const tensionPercent = Math.min(100, Math.round(webTension * 50));
          tensionFill.style.width = `${tensionPercent}%`;
          tensionText.textContent = tensionPercent > 60 ? 'Tension: High (Pulling!)' : 'Webs Attached: Catching';
        }
      } else {
        pointer.targetX += (pointer.x - pointer.targetX) * 0.35;
        pointer.targetY += (pointer.y - pointer.targetY) * 0.35;
        recoilX *= 0.9;
        recoilY *= 0.9;
        if (tensionFill && tensionText) {
          tensionFill.style.width = '0%';
          tensionText.textContent = 'Web Radar Active';
        }
      }

      // 3. Update Reticle Coordinates
      if (reticle) {
        reticle.style.left = `${pointer.targetX}px`;
        reticle.style.top = `${pointer.targetY}px`;
      }

      // 4. Update Button 3D Tilt & Recoil
      if (pointer.inProximity) {
        const tiltX = (pointer.targetY - buttonCenter.y) * -0.06;
        const tiltY = (pointer.targetX - buttonCenter.x) * 0.06;
        ctaWrapper.style.transform = `translate3d(${recoilX}px, ${recoilY}px, 0) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${1 + webTension * 0.04})`;
      } else {
        ctaWrapper.style.transform = `translate3d(${recoilX}px, ${recoilY}px, 0) rotateX(0deg) rotateY(0deg) scale(1)`;
      }

      // 5. Render Canvas Webs
      engine.render();

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    // Modal Opening & Focus Management
    function openConnectModal() {
      if (window.spideyAudio) {
        window.spideyAudio.playConnectSuccess();
      }
      fireWebAtCursor(true);

      setTimeout(() => {
        if (modalBackdrop) {
          modalBackdrop.classList.add('open');
          if (modalCloseBtn) modalCloseBtn.focus();
        }
      }, 250);
    }

    function closeConnectModal() {
      if (modalBackdrop) {
        modalBackdrop.classList.remove('open');
        ctaButton.focus();
      }
    }

    // CTA Click Event
    ctaButton.addEventListener('click', (e) => {
      e.stopPropagation();
      openConnectModal();
    });

    // Keyboard Trigger (Space or Enter on button)
    ctaButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openConnectModal();
      }
    });

    // Modal Close Events
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeConnectModal);
    }

    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
          closeConnectModal();
        }
      });
    }

    // Keyboard Escape to close modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalBackdrop && modalBackdrop.classList.contains('open')) {
        closeConnectModal();
      }
    });

    // Audio Toggle Handler
    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', () => {
        if (!window.spideyAudio) return;
        const isMuted = window.spideyAudio.toggleMute();
        soundToggleBtn.classList.toggle('active', !isMuted);
        const soundLabel = soundToggleBtn.querySelector('.sound-label');
        if (soundLabel) {
          soundLabel.textContent = isMuted ? 'Muted' : 'Sound ON';
        }
      });
    }
  });
})();
