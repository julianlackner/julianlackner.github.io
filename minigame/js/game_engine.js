import { LOCATIONS } from "./locations.js";
import { saveSave, loadSave } from "./storage.js";

export function startGame(app) {
  // =========================
  // Config (World-Koordinaten)
  // =========================
  const CANVAS_W = 1100;
  const CANVAS_H = 620;

  // Sprite tuning
  const AVATAR_SCALE = 0.45;
  const FOOT_Y_OFFSET = 8;   // sprite draw correction (render)
  const FOOT_HIT_OFFSET = 8; // foot point for collisions/hotspots (logic)
  const SHADOW_W = 18;
  const SHADOW_H = 7;

  // =========================
  // Device detection + Landscape requirement
  // =========================
  const isMobile =
    window.matchMedia?.("(pointer: coarse)")?.matches ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  document.body.dataset.device = isMobile ? "mobile" : "desktop";

  const rotateOverlay = document.getElementById("rotateOverlay");

  function updateRotateOverlay() {
    if (!rotateOverlay) return;
    if (!isMobile) {
      rotateOverlay.classList.remove("show");
      rotateOverlay.setAttribute("aria-hidden", "true");
      return;
    }
    const isLandscape = window.matchMedia?.("(orientation: landscape)")?.matches;
    const show = !isLandscape;
    rotateOverlay.classList.toggle("show", show);
    rotateOverlay.setAttribute("aria-hidden", show ? "false" : "true");
  }

  updateRotateOverlay();
  window.addEventListener("resize", updateRotateOverlay);
  window.addEventListener("orientationchange", updateRotateOverlay);

  // =========================
  // Helpers
  // =========================
  function dirFromVector(dx, dy) {
    const a = Math.atan2(dy, dx); // -PI .. +PI
    if (a >= -Math.PI / 4 && a < Math.PI / 4) return 1;            // right
    if (a >= Math.PI / 4 && a < (3 * Math.PI) / 4) return 0;       // down
    if (a >= (-3 * Math.PI) / 4 && a < -Math.PI / 4) return 2;     // up
    return 3;                                                      // left
  }

  function pointInRect(px, py, r) {
    return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
  }

  // Pointer/Maus/Touch -> World coords (1100x620)
  function getPointerPos(cv, e) {
    const r = cv.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches ? e.touches[0].clientX : 0);
    const clientY = e.clientY ?? (e.touches ? e.touches[0].clientY : 0);

    return {
      x: (clientX - r.left) * (CANVAS_W / r.width),
      y: (clientY - r.top) * (CANVAS_H / r.height),
    };
  }

  function normRect(a, b) {
    const x1 = Math.min(a.x, b.x);
    const y1 = Math.min(a.y, b.y);
    const x2 = Math.max(a.x, b.x);
    const y2 = Math.max(a.y, b.y);
    return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
  }
  function logRectOnly(r) {
    console.log(`{ x: ${Math.round(r.x)}, y: ${Math.round(r.y)}, w: ${Math.round(r.w)}, h: ${Math.round(r.h)} },`);
  }
  function fmtRect(r) {
    const x = Math.round(r.x);
    const y = Math.round(r.y);
    const w = Math.round(r.w);
    const h = Math.round(r.h);
    return `{ x: ${x}, y: ${y}, w: ${w}, h: ${h} }`;
  }

  // =========================
  // Save + Location
  // =========================
  const save = loadSave();
  const player = save.player;

  const locId = save.location || "jungscharhaus";
  const loc = LOCATIONS[locId];

  if (!loc) {
    console.error("Unknown location:", locId);
    save.location = "jungscharhaus";
    saveSave(save);
    return startGame(app);
  }

  // =========================
  // Collision: Blocks (Sperrzone)
  // Rule: block only "outside -> inside", so you can always leave a block.
  // =========================
  function isBlockedFoot(x, y) {
    const blocks = loc.blocks || [];
    const footX = x;
    const footY = y + FOOT_HIT_OFFSET;
    return blocks.some((b) => pointInRect(footX, footY, b));
  }

  // =========================
  // Spawn selection (spawnFrom -> spawn -> fallback)
  // =========================
  const fromId = save.from;
  const spawn =
    (fromId && loc.spawnFrom && loc.spawnFrom[fromId]) ||
    loc.spawn ||
    { x: 520, y: 460 };

  // =========================
  // UI
  // =========================
  app.innerHTML = `
    <div class="sceneWrap">
      <div class="hud">
        <div class="pill">
          <div class="thumb small" style="background-image:url('assets/avatars/${player.avatarId}/sheet.png')"></div>
          <div>
            <b>${player.name}</b>
            <div class="small">${loc.name}</div>
          </div>
        </div>
      </div>
      <canvas id="cv" width="${CANVAS_W}" height="${CANVAS_H}"></canvas>
      <div class="actionBack" id="actionBack">
    <div class="actionModal">
      <div class="actionHeader">
        <b id="actionTitle">Info</b>
        <button class="actionClose" id="actionClose" type="button">✕</button>
      </div>

      <div class="actionBody">
        <!-- Mobile arrows -->
        <div class="actionArrow left"  id="actionArrowLeft"  aria-label="Zurück"></div>
        <div class="actionArrow right" id="actionArrowRight" aria-label="Weiter"></div>

        <img id="actionImg" class="actionSlide" src="" alt="info" />

        <!-- Mobile done button -->
        <button class="actionDone" id="actionDone" type="button">Fertig</button>
      </div>

      <!-- Desktop footer buttons bleiben -->
      <div class="actionFooter">
        <button class="actionBtn" id="actionPrev" type="button">Zurück</button>
        <button class="actionBtn primary" id="actionNext" type="button">Weiter</button>
      </div>
    </div>
  </div>


    </div>
  `;

  const cv = app.querySelector("#cv");
  const ctx = cv.getContext("2d");
  // =========================
  // Actions (Modal / Slides)
  // =========================
  const actionBack  = app.querySelector("#actionBack");
  const actionClose = app.querySelector("#actionClose");
  const actionNext  = app.querySelector("#actionNext");
  const actionPrev  = app.querySelector("#actionPrev");
  const actionImg   = app.querySelector("#actionImg");
  const actionTitle = app.querySelector("#actionTitle");
  const actionArrowLeft  = app.querySelector("#actionArrowLeft");
  const actionArrowRight = app.querySelector("#actionArrowRight");
  const actionDone       = app.querySelector("#actionDone");

  let actionOpen = false;
  let activeAction = null;
  let slideIndex = 0;

  // optional: einmalig ausgelöste Actions merken (im Save)
  save.doneActions = save.doneActions || {};

  function closeAction(){
    actionBack.classList.remove("show");
    actionOpen = false;

    // ✅ Canvas wieder aktivieren
    cv.style.pointerEvents = "auto";

    if (activeAction?.once && activeAction?.id) {
      save.doneActions[activeAction.id] = true;
      saveSave(save);
    }

    activeAction = null;
  }
function openAction(action){
  if (action.once && save.doneActions[action.id]) return;

  activeAction = action;
  slideIndex = 0;

  actionTitle.textContent = action.id || "Info";
  renderSlide();

  actionBack.classList.add("show");
  actionOpen = true;

  // ✅ WICHTIG: Canvas soll nichts mehr fangen
  cv.style.pointerEvents = "none";
}

  function renderSlide(){
    if (!activeAction) return;

    const slides = activeAction.slides || [];
    slideIndex = Math.max(0, Math.min(slideIndex, slides.length - 1));

    actionImg.src = slides[slideIndex] || "";

    // Desktop Buttons disable (optional)
    if (actionPrev) actionPrev.disabled = (slideIndex === 0);
    if (actionNext) actionNext.textContent = (slideIndex === slides.length - 1) ? "Fertig" : "Weiter";

    // Mobile arrows state
    if (actionArrowLeft)  actionArrowLeft.classList.toggle("disabled", slideIndex === 0);
    if (actionArrowRight) actionArrowRight.classList.toggle("disabled", slideIndex >= slides.length - 1);

    // Mobile done appears only on last slide
    if (actionDone) actionDone.classList.toggle("show", slides.length > 0 && slideIndex === slides.length - 1);
  }

  function hardClose(e){
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    closeAction();
  }

  // X schließen (robust: pointerdown + click)
  actionClose.addEventListener("pointerdown", hardClose, { passive: false });
  actionClose.addEventListener("click", hardClose);

  // Klick auf Backdrop schließt (nur wenn wirklich backdrop)
  actionBack.addEventListener("pointerdown", (e) => {
    if (e.target === actionBack) hardClose(e);
  }, { passive: false });

  function nextSlideOrDone(){
  if (!activeAction) return;
  const slides = activeAction.slides || [];
  if (!slides.length) return;

  if (slideIndex < slides.length - 1) {
    slideIndex++;
    renderSlide();
  } else {
    closeAction();
  }
}

function prevSlide(){
  if (!activeAction) return;
  if (slideIndex > 0) {
    slideIndex--;
    renderSlide();
  }
}

actionNext?.addEventListener("click", nextSlideOrDone);
actionPrev?.addEventListener("click", prevSlide);

// Mobile arrows
actionArrowRight?.addEventListener("click", nextSlideOrDone);
actionArrowLeft?.addEventListener("click", prevSlide);

// Mobile done
actionDone?.addEventListener("click", closeAction);

  // =========================
  // HiDPI Canvas (crisp on mobile)
  // Draw stays in world coords (1100x620)
  // =========================
  function setupCanvasScale() {
    const dpr = window.devicePixelRatio || 1;
    cv.width = Math.round(CANVAS_W * dpr);
    cv.height = Math.round(CANVAS_H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  setupCanvasScale();
  window.addEventListener("resize", setupCanvasScale);

  // =========================
  // Assets
  // =========================
  const bg = new Image();
  bg.src = loc.img;

  const sheet = new Image();
  sheet.src = `assets/avatars/${player.avatarId}/sheet.png`;

  const sheet2 = new Image();
  sheet2.src = `assets/avatars/${player.avatarId}/sheet2.png`; // LEFT

  // =========================
  // Player state
  // =========================
  const p = {
    x: spawn.x,
    y: spawn.y,
    tx: spawn.x,
    ty: spawn.y,
    speed: 4.8,
    frame: 0,
    frameTick: 0,
    moveDir: 0,
    faceDir: 0,
  };

  // =========================
  // Input + Debug + Editor state
  // =========================
  const keys = new Set();

  // Visibility toggles
  let showHotspots = false; // H
  let showBlocks = false;   // B
  let showSpawns = false;   // N

  // Editor modes:
  // P = spawn edit toggle
  // M = spawn target toggle (spawn <-> spawnFrom)
  // U = cycle spawnFrom key
  // K = block edit (2 clicks rectangle)
  // G = go-to edit (2 clicks rectangle)
  let spawnEdit = false;
  let spawnEditTarget = "spawn"; // "spawn" | "spawnFrom"
  let spawnFromKey = Object.keys(loc.spawnFrom || {})[0] || "zeltplatz";

  let blockEdit = false;
  let gotoEdit  = false;

  // ✅ NEU: Action Editor
  let actionEdit = false;
  let actionTrigger = "enter"; // "enter" | "click"

  // Konfig in Konsole (wird von dir gesetzt)
  window.ACTION_ID = window.ACTION_ID || "action_1";
  window.ACTION_SLIDES = window.ACTION_SLIDES || ["assets/dialogs/demo1.png"];
  window.ACTION_ONCE = window.ACTION_ONCE ?? false;
  window.ACTION_AUTO_CLOSE = window.ACTION_AUTO_CLOSE ?? false;

  // Rect drawing
  let rectStart = null;
  let lastMouse = { x: 0, y: 0 };

  // Set target quickly in console:
  // window.GOTO_TO = "zeltplatz"
  window.GOTO_TO = window.GOTO_TO || "ziel_location_id";

  // mouse facing
  let mouseX = null;
  let mouseY = null;
  let mouseInside = false;

  // =========================
  // Keyboard (Desktop)
  // =========================
  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    keys.add(k);

    // Sichtbarkeit
    if (k === "h") showHotspots = !showHotspots;
    if (k === "b") showBlocks   = !showBlocks;
    if (k === "n") showSpawns   = !showSpawns;

    // ✅ Action Editor (Y an/aus)
    if (k === "y") {
      actionEdit = !actionEdit;

      if (actionEdit) {
        // andere Edit-Modi aus
        spawnEdit = false;
        blockEdit = false;
        gotoEdit  = false;
        rectStart = null;
      }

      console.log(
        "Action-Edit:",
        actionEdit
          ? `AN (2 Klicks = Rechteck) | trigger="${actionTrigger}" | id="${window.ACTION_ID}"`
          : "AUS"
      );

      if (actionEdit) {
        console.log(
          'Tipp: window.ACTION_ID="infotafel_1"; window.ACTION_SLIDES=["assets/dialogs/a.png","assets/dialogs/b.png"];'
        );
      }
    }

    // ✅ Action Trigger wechseln (T)
    if (k === "t") {
      actionTrigger = (actionTrigger === "enter") ? "click" : "enter";
      console.log("Action Trigger:", actionTrigger);
    }

    // Spawn Editor
    if (k === "p") {
      spawnEdit = !spawnEdit;
      if (spawnEdit) { blockEdit = false; gotoEdit = false; actionEdit = false; rectStart = null; }
      console.log("Spawn-Edit:", spawnEdit ? "AN" : "AUS");
    }

    if (k === "m") {
      spawnEditTarget = spawnEditTarget === "spawn" ? "spawnFrom" : "spawn";
      console.log(
        "Spawn-Ziel:",
        spawnEditTarget,
        spawnEditTarget === "spawnFrom" ? `(key=${spawnFromKey})` : ""
      );
    }

    if (k === "u") {
      const list = Object.keys(loc.spawnFrom || {});
      if (!list.length) return;
      const idx = list.indexOf(spawnFromKey);
      spawnFromKey = list[(idx + 1) % list.length];
      console.log("spawnFrom-Key:", spawnFromKey);
    }

    // Block Editor
    if (k === "k") {
      blockEdit = !blockEdit;
      if (blockEdit) { spawnEdit = false; gotoEdit = false; actionEdit = false; rectStart = null; }
      console.log("Block-Edit:", blockEdit ? "AN (2 Klicks = Rechteck)" : "AUS");
    }

    // Go-To Editor
    if (k === "g") {
      gotoEdit = !gotoEdit;
      if (gotoEdit) { spawnEdit = false; blockEdit = false; actionEdit = false; rectStart = null; }
      console.log("Go-To-Edit:", gotoEdit ? `AN | to="${window.GOTO_TO}"` : "AUS");
      if (gotoEdit) console.log('Tipp: window.GOTO_TO = "zeltplatz"');
    }

    // Abbruch Rechteck
    if (k === "escape") rectStart = null;
  });

  window.addEventListener("keyup", (e) => {
    keys.delete(e.key.toLowerCase());
  });

  // =========================
  // Pointer Events (Desktop + Mobile)
  // =========================
  cv.addEventListener("pointermove", (e) => {
    const m = getPointerPos(cv, e);
    mouseX = m.x;
    mouseY = m.y;
    mouseInside = true;
    lastMouse = { x: Math.round(m.x), y: Math.round(m.y) };
  });

  cv.addEventListener("pointerleave", () => {
    mouseInside = false;
  });

  function handleTap(x, y) {
    const rx = Math.round(x);
    const ry = Math.round(y);

    // Spawn editor
    if (spawnEdit) {
      if (spawnEditTarget === "spawn") {
        loc.spawn = { x: rx, y: ry };
        console.log(`spawn: { x: ${rx}, y: ${ry} },`);
      } else {
        loc.spawnFrom = loc.spawnFrom || {};
        loc.spawnFrom[spawnFromKey] = { x: rx, y: ry };
        console.log(`${spawnFromKey}: { x: ${rx}, y: ${ry} },`);
      }
      return;
    }
    // -------- Action editor (2-click rect) --------
    if (actionEdit) {
      if (!rectStart) {
        rectStart = { x: rx, y: ry };
        console.log("Action start:", rectStart, `trigger="${actionTrigger}"`, `id="${window.ACTION_ID}"`);
      } else {
        const r = normRect(rectStart, { x: rx, y: ry });
        rectStart = null;

        if (r.w < 2 || r.h < 2) return;

        loc.actions = loc.actions || [];

        const entry = {
          id: String(window.ACTION_ID || "action_1"),
          x: Math.round(r.x),
          y: Math.round(r.y),
          w: Math.round(r.w),
          h: Math.round(r.h),
          trigger: actionTrigger,
          slides: Array.isArray(window.ACTION_SLIDES) ? window.ACTION_SLIDES : [],
          once: !!window.ACTION_ONCE,
          autoCloseOnMove: !!window.ACTION_AUTO_CLOSE,
        };

        loc.actions.push(entry);

        // ✅ Print fertiger locations.js snippet
        console.log(
          `{ id: "${entry.id}", x: ${entry.x}, y: ${entry.y}, w: ${entry.w}, h: ${entry.h}, trigger: "${entry.trigger}", slides: ${JSON.stringify(entry.slides)}, once: ${entry.once}, autoCloseOnMove: ${entry.autoCloseOnMove} },`
        );
      }
      return;
    }
    // Block editor (2-click rect)
    if (blockEdit) {
      if (!rectStart) {
        rectStart = { x: rx, y: ry };
        console.log("Block start:", rectStart);
      } else {
        const r = normRect(rectStart, { x: rx, y: ry });
        rectStart = null;
        if (r.w < 2 || r.h < 2) return;
        loc.blocks = loc.blocks || [];
        loc.blocks.push(r);
        console.log(`${fmtRect(r)},`);
      }
      return;
    }

    // Go-To editor (2-click rect)
    if (gotoEdit) {
      if (!rectStart) {
        rectStart = { x: rx, y: ry };
        console.log("Go-To start:", rectStart, `to="${window.GOTO_TO}"`);
      } else {
        const r = normRect(rectStart, { x: rx, y: ry });
        rectStart = null;
        if (r.w < 2 || r.h < 2) return;

        const to = String(window.GOTO_TO || "ziel_location_id");
        loc.hotspots = loc.hotspots || [];
        loc.hotspots.push({ ...r, to });

        console.log(
          `{ x: ${Math.round(r.x)}, y: ${Math.round(r.y)}, w: ${Math.round(r.w)}, h: ${Math.round(r.h)}, to: "${to}" },`
        );
      }
      return;
    }

    // Normal move
    const nowInside = isBlockedFoot(p.x, p.y);
    const targetInside = isBlockedFoot(x, y);
    if (!nowInside && targetInside) return;
    // Wenn Modal offen: ignorier Movement-Klicks
    if (actionOpen) return;

    // ---- Action trigger on CLICK ----
    const actions = loc.actions || [];
    const clicked = actions.find(a => a.trigger === "click" && pointInRect(x, y, a));
    if (clicked) {
      openAction(clicked);
      return;
    }


    p.tx = x;
    p.ty = y;


  }

  cv.addEventListener("pointerdown", (e) => {
    // Mobile: kein Scroll/Zoom beim Spielen
    if (e.pointerType === "touch") e.preventDefault();

    const { x, y } = getPointerPos(cv, e);
    handleTap(x, y);
  }, { passive: false });

  // =========================
  // Hotspot transition
  // =========================
  let isTransitioning = false;

  function tryHotspotTransition(moving) {
    if (isTransitioning) return;
    if (moving) return;

    const footX = p.x;
    const footY = p.y + FOOT_HIT_OFFSET;

    const hs = (loc.hotspots || []).find((h) => h.to && pointInRect(footX, footY, h));
    if (!hs) return;

    isTransitioning = true;

    save.from = loc.id;
    save.location = hs.to;
    saveSave(save);

    startGame(app);
  }

  // =========================
  // Update
  // =========================
  let lastEnterActionId = null;
  function update() {
    // Wenn Mobile im Portrait -> Spiel kann weiterlaufen, aber Overlay blockt Sicht
    // (du könntest hier auch early-return machen, wenn du wirklich pausieren willst)

    let vx = 0, vy = 0;


    // WASD nur Desktop sinnvoll, aber schadet Mobile nicht
    if (keys.has("w") || keys.has("arrowup")) vy -= p.speed;
    if (keys.has("s") || keys.has("arrowdown")) vy += p.speed;
    if (keys.has("a") || keys.has("arrowleft")) vx -= p.speed;
    if (keys.has("d") || keys.has("arrowright")) vx += p.speed;
    if (actionOpen) {
      // optional: Blickrichtung weiter erlauben, aber keine Bewegung
      // p.tx = p.x; p.ty = p.y;  // falls Click-to-move stoppen soll
      return;
    }
    let moving = false;
    let dxMove = 0, dyMove = 0;

    // WASD
    if (vx || vy) {
      dxMove = vx;
      dyMove = vy;

      const nextX = p.x + vx;
      const nextY = p.y + vy;

      const nowInside = isBlockedFoot(p.x, p.y);
      const nextInside = isBlockedFoot(nextX, nextY);

      if (!(nextInside && !nowInside)) {
        p.x = nextX;
        p.y = nextY;
      }

      // WASD cancels click-to-move
      p.tx = p.x;
      p.ty = p.y;
      moving = true;
    } else {
      // Click/tap-to-move
      const dx = p.tx - p.x;
      const dy = p.ty - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= p.speed) {
        const nowInside = isBlockedFoot(p.x, p.y);
        const nextInside = isBlockedFoot(p.tx, p.ty);

        if (!(nextInside && !nowInside)) {
          p.x = p.tx;
          p.y = p.ty;
        }
        moving = false;
      } else if (dist > 1) {
        dxMove = (dx / dist) * p.speed;
        dyMove = (dy / dist) * p.speed;

        const nextX = p.x + dxMove;
        const nextY = p.y + dyMove;

        const nowInside = isBlockedFoot(p.x, p.y);
        const nextInside = isBlockedFoot(nextX, nextY);

        if (!(nextInside && !nowInside)) {
          p.x = nextX;
          p.y = nextY;
          moving = true;
        } else {
          p.tx = p.x;
          p.ty = p.y;
          moving = false;
        }
      }
    }

    if (moving) p.moveDir = dirFromVector(dxMove, dyMove);

    // Animation
    if (moving) {
      p.frameTick++;
      if (p.frameTick > 8) {
        p.frame = (p.frame + 1) % 3;
        p.frameTick = 0;
      }
    } else {
      p.frame = 0;
      p.frameTick = 0;
    }

    // Facing follows pointer
    if (mouseInside && mouseX !== null && mouseY !== null) {
      const dxF = mouseX - p.x;
      const dyF = mouseY - p.y;
      if (Math.hypot(dxF, dyF) > 25) {
        p.faceDir = dirFromVector(dxF, dyF);
      }
    } else {
      p.faceDir = p.moveDir;
    }
    // ---- Action trigger on ENTER (nur wenn kein Modal offen) ----
    if (!actionOpen) {
  const actions = loc.actions || [];
  const footX = p.x;
  const footY = p.y + FOOT_HIT_OFFSET;

  const hit = actions.find(a => a.trigger === "enter" && pointInRect(footX, footY, a));

  if (hit && !moving) {
    if (lastEnterActionId !== hit.id) {
      lastEnterActionId = hit.id;
      openAction(hit);
    }
  } else {
    lastEnterActionId = null;
  }
}
    tryHotspotTransition(moving);
  }

  // =========================
  // Debug drawing
  // =========================
  function drawBlocks() {
    if (!showBlocks) return;

    const blocks = loc.blocks || [];
    ctx.save();
    ctx.fillStyle = "rgba(0,0,255,0.25)";
    ctx.strokeStyle = "rgba(0,0,255,0.85)";
    ctx.lineWidth = 2;

    for (const b of blocks) {
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeRect(b.x, b.y, b.w, b.h);
    }

    if (blockEdit && rectStart) {
      const r = normRect(rectStart, lastMouse);
      ctx.fillStyle = "rgba(0,0,255,0.18)";
      ctx.strokeStyle = "rgba(0,0,255,1)";
      ctx.setLineDash([8, 6]);
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeRect(r.x, r.y, r.w, r.h);
      ctx.setLineDash([]);
    }

    ctx.restore();
  }
  function drawActions() {
    // Actions nur anzeigen wenn du willst:
    // - beim Editieren
    // - oder über showHotspots (optional)
    const show = actionEdit || showHotspots;
    if (!show) return;

    const actions = loc.actions || [];

    ctx.save();
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 6]);

    // bestehende Actions
    for (const a of actions) {
      const isEnter = a.trigger === "enter";

      ctx.strokeStyle = isEnter ? "rgba(0,255,255,0.95)" : "rgba(255,120,0,0.95)";
      ctx.fillStyle   = isEnter ? "rgba(0,255,255,0.10)" : "rgba(255,120,0,0.10)";

      ctx.fillRect(a.x, a.y, a.w, a.h);
      ctx.strokeRect(a.x, a.y, a.w, a.h);

      ctx.setLineDash([]);
      ctx.fillStyle = "black";
      ctx.font = "14px sans-serif";
      ctx.fillText(`action: ${a.id} (${a.trigger})`, a.x + 6, a.y - 8);
      ctx.setLineDash([10, 6]);
    }

    // Live Preview während Edit (2 Klicks)
    if (actionEdit && rectStart) {
      const r = normRect(rectStart, lastMouse);

      ctx.strokeStyle = "rgba(0,255,255,1)";
      ctx.fillStyle = "rgba(0,255,255,0.12)";
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeRect(r.x, r.y, r.w, r.h);

      ctx.setLineDash([]);
      ctx.fillStyle = "black";
      ctx.fillText(`NEW action (${actionTrigger}) id="${window.ACTION_ID}"`, r.x + 6, r.y - 8);
    }

    ctx.setLineDash([]);
    ctx.restore();
  }
  function drawHotspots() {
    if (!showHotspots) return;

    const hs = loc.hotspots || [];
    ctx.save();
    ctx.setLineDash([10, 6]);
    ctx.lineWidth = 3;

    for (const h of hs) {
      ctx.strokeStyle = "rgba(255,255,0,0.95)";
      ctx.fillStyle = "rgba(255,255,0,0.10)";
      ctx.fillRect(h.x, h.y, h.w, h.h);
      ctx.strokeRect(h.x, h.y, h.w, h.h);
    }

    if (gotoEdit && rectStart) {
      const r = normRect(rectStart, lastMouse);
      ctx.strokeStyle = "rgba(255,255,0,1)";
      ctx.fillStyle = "rgba(255,255,0,0.12)";
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeRect(r.x, r.y, r.w, r.h);
    }

    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawSpawns() {
    if (!showSpawns) return;

    ctx.save();
    ctx.font = "14px sans-serif";

    if (loc.spawn) {
      const s = loc.spawn;
      const size = 26;
      ctx.fillStyle = "rgba(0,255,0,0.25)";
      ctx.strokeStyle = "rgba(0,255,0,1)";
      ctx.lineWidth = 2;
      ctx.fillRect(s.x - size / 2, s.y - size / 2, size, size);
      ctx.strokeRect(s.x - size / 2, s.y - size / 2, size, size);
      ctx.fillStyle = "black";
      ctx.fillText("spawn", s.x - 18, s.y - 18);
    }

    if (loc.spawnFrom) {
      for (const key in loc.spawnFrom) {
        const s = loc.spawnFrom[key];
        const selected = key === spawnFromKey;

        const size = selected ? 28 : 22;
        ctx.fillStyle = selected ? "rgba(180,0,255,0.45)" : "rgba(180,0,255,0.25)";
        ctx.strokeStyle = selected ? "rgba(180,0,255,1)" : "rgba(180,0,255,0.8)";
        ctx.lineWidth = selected ? 3 : 2;

        ctx.fillRect(s.x - size / 2, s.y - size / 2, size, size);
        ctx.strokeRect(s.x - size / 2, s.y - size / 2, size, size);

        ctx.fillStyle = "black";
        ctx.fillText("from: " + key, s.x - 32, s.y - 18);
      }
    }

    // mini HUD, wenn Editor aktiv
    const anyEdit = spawnEdit || blockEdit || gotoEdit || actionEdit;
    if (anyEdit) {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(10, 560, 840, 45);
      ctx.fillStyle = "white";
      ctx.fillText(
        `H Hotspots:${showHotspots?"ON":"OFF"} | B Blocks:${showBlocks?"ON":"OFF"} | N Spawns:${showSpawns?"ON":"OFF"} | P SpawnEdit:${spawnEdit?"ON":"OFF"} | M Target:${spawnEditTarget}${spawnEditTarget==="spawnFrom"?`(${spawnFromKey})`:""} | U CycleKey | K BlockEdit:${blockEdit?"ON":"OFF"} | G GoToEdit:${gotoEdit?"ON":"OFF"} | Esc cancel`,
        18,
        588
      );
    }

    ctx.restore();
  }

  // =========================
  // Draw
  // =========================
  function draw() {
    // Wir zeichnen in World-Coords, daher clear mit CANVAS_W/H
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    if (bg.complete && bg.naturalWidth) {
      ctx.drawImage(bg, 0, 0, CANVAS_W, CANVAS_H);
    }

    // overlays
    drawBlocks();
    drawHotspots();
    drawActions();
    drawSpawns();

    // shadow
    ctx.fillStyle = "rgba(0,0,0,.22)";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 10, SHADOW_W, SHADOW_H, 0, 0, Math.PI * 2);
    ctx.fill();

    // sprite
    const useSheet2 = p.faceDir === 3; // left
    const img = useSheet2 ? sheet2 : sheet;

    if (img.complete && img.naturalWidth) {
      const FRAME_W = img.naturalWidth / 3;
      const FRAME_H = img.naturalHeight / 4;

      // down,right,up,left
      const rowForDir_sheet = [0, 3, 2, 1];
      const LEFT_ROW_IN_SHEET2 = 3;

      const row = useSheet2 ? LEFT_ROW_IN_SHEET2 : rowForDir_sheet[p.faceDir];
      const sx = p.frame * FRAME_W;
      const sy = row * FRAME_H;

      const dw = FRAME_W * AVATAR_SCALE;
      const dh = FRAME_H * AVATAR_SCALE;

      const dx = p.x - dw / 2;
      const dy = p.y - dh + FOOT_Y_OFFSET;

      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, sx, sy, FRAME_W, FRAME_H, dx, dy, dw, dh);
    }
  }

  // =========================
  // Loop
  // =========================
  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  // Start when images loaded
  let loaded = 0;
  const done = () => {
    loaded++;
    if (loaded >= 3) loop();
  };

  bg.onload = done; bg.onerror = done;
  sheet.onload = done; sheet.onerror = done;
  sheet2.onload = done; sheet2.onerror = done;
}
