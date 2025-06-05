(() => {
  const vm = window.vm;
  if (!vm) return alert("TurboWarp VM not found. Are you running this in TurboWarp?");

  // ================================================================================
  // 1) CAPTURE ORIGINAL PROJECT STATE (for the “Reload Project” button)
  // ================================================================================
  let originalProjectJSON;
  try {
    originalProjectJSON = vm.toJSON();
  } catch (e) {
    if (vm.runtime && vm.runtime._hats) {
      originalProjectJSON = vm.runtime.toJSON();
    } else {
      console.warn("Could not capture project JSON. Reload may not work perfectly.");
      originalProjectJSON = null;
    }
  }

  // ================================================================================
  // 2) BUILD THE DRAGGABLE, SCROLLABLE, MINIMIZABLE CORRUPTOR UI
  //    (Backgrounds: #2D3D4E / #1F252C / #1A242F; Text: #FF6A00; Buttons: #DD571C)
  // ================================================================================
  const panel = document.createElement("div");
  panel.id = "corruptorPanel";
  panel.style.cssText = `
    position: fixed;
    top: 10px;
    left: 10px;
    width: 300px;
    max-height: 80vh;
    background: #2D3D4E;
    color: #FF6A00;
    padding: 0;
    font-family: Arial, sans-serif;
    font-size: 13px;
    border: 1px solid #444;
    border-radius: 6px;
    z-index: 99999;
    user-select: none;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `;

  // Header (drag handle) + minimize/close buttons
  const header = document.createElement("div");
  header.style.cssText = `
    cursor: grab;
    background: #1F252C;
    padding: 6px 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #444;
  `;
  header.innerHTML = `
    <span style="font-size:14px; font-weight:bold; color:#FFFFFF;">
      jsRTC for Turbowarp
    </span>
    <span style="display:flex; gap:4px;">
      <button id="minimizeBtn" title="Minimize" style="
        background: transparent;
        color: #DD571C;
        border: none;
        font-size: 14px;
        cursor: pointer;
        padding: 0 5px;
      ">_</button>
      <button id="closePanel" title="Close UI" style="
        background: transparent;
        color: #DD571C;
        border: none;
        font-size: 16px;
        cursor: pointer;
        padding: 0 5px;
      ">✕</button>
    </span>
  `;
  panel.appendChild(header);

  // Content area (scrollable)
  const content = document.createElement("div");
  content.style.cssText = `
    flex: 1;
    overflow-y: auto;
    padding: 6px 8px;
    background: #2D3D4E;
  `;

  // Containers for Complex vs. Simple mode
  const complexContainer = document.createElement("div");
  complexContainer.id = "complexContainer";
  const simpleContainer = document.createElement("div");
  simpleContainer.id = "simpleContainer";
  simpleContainer.style.display = "none";

  // “Simple Mode” toggle HTML
  const simpleModeHtml = `
    <label style="
      display: block;
      margin-bottom: 8px;
      background: #1A242F;
      padding: 4px 6px;
      border-radius: 4px;
      color: #FF6A00;
      font-size: 13px;
    ">
      <input type="checkbox" id="simpleMode"> Simple Mode
    </label>
    <div style="font-size:10px; margin-left:18px; margin-bottom:8px; color:#FF6A00;">
      When checked, show only one Auto‑Corrupt slider + SVG toggle.
    </div>
  `;
  content.insertAdjacentHTML("beforeend", simpleModeHtml);

  // --------- Simple Container HTML ---------
  simpleContainer.innerHTML = `
    <!-- Auto‑Corrupt ON/OFF -->
    <label style="
      display: block;
      margin-top: 10px;
      background: #1A242F;
      padding: 4px 6px;
      border-radius: 4px;
      color: #FF6A00;
      font-size: 13px;
    ">
      <input type="checkbox" id="simpleCorruptEnable"> Auto‑Corrupt (ON/OFF)
    </label>
    <div style="font-size:10px; margin-left:18px; margin-bottom:6px; color:#FF6A00;">
      When ON, all remaining corruption categories run each tick at Intensity.
    </div>
    <label style="
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: 18px;
      margin-bottom: 12px;
      background: #1A242F;
      padding: 4px 6px;
      border-radius: 4px;
      color: #FF6A00;
      font-size: 13px;
    ">
      Intensity&nbsp;
      <input id="simpleRate" type="range" min="0" max="100" value="0" style="
        width: 180px;
        accent-color: #DD571C;
        background: #1A242F;
        border-radius: 4px;
      ">
    </label>
    <div style="font-size:10px; margin-left:36px; margin-bottom:12px; color:#FF6A00;">
      Chance (%) every 100 ms to run all enabled categories.
    </div>

    <!-- SVG Distortion ON/OFF -->
    <label style="
      display: block;
      margin-top: 6px;
      background: #1A242F;
      padding: 4px 6px;
      border-radius: 4px;
      color: #FF6A00;
      font-size: 13px;
    ">
      <input type="checkbox" id="simpleSVGEnable"> SVG Distortion
    </label>
    <div style="font-size:10px; margin-left:18px; margin-bottom:12px; color:#FF6A00;">
      If checked, run SVG Distortion (One‑Time + embedded PNG mosh) at next tick (intensity = simpleRate).
    </div>
  `;

  // --------- Complex Container HTML (remaining corruption options) ---------
  complexContainer.innerHTML = `
    <!-- Corrupt ON/OFF -->
    <label style="
      display: block;
      margin-bottom: 6px;
      background: #1A242F;
      padding: 4px 6px;
      border-radius: 4px;
      color: #FF6A00;
      font-size: 13px;
    ">
      <input id="corrupt" type="checkbox"> Corrupt (ON/OFF)
    </label>
    <div style="font-size:10px; margin-left:18px; margin-bottom:8px; color:#FF6A00;">
      When checked, all enabled corruption categories run every 100 ms.
    </div>

    <!-- 1) Burst (Block) Chaos -->
    <label style="
      display: block;
      margin-top: 6px;
      background: #1A242F;
      padding: 4px 6px;
      border-radius: 4px;
      color: #FF6A00;
      font-size: 13px;
    ">
      <input type="checkbox" id="burstEnable"> Burst (Block) Chaos
    </label>
    <div style="font-size:10px; margin-left:18px; color:#FF6A00;">
      Runs random blocks from any sprite out of sequence.
    </div>
    <label style="
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: 18px;
      margin-bottom: 8px;
      background: #1A242F;
      padding: 4px 6px;
      border-radius: 4px;
      color: #FF6A00;
      font-size: 13px;
    ">
      Intensity&nbsp;
      <input id="burst" type="range" min="0" max="30" value="0" style="
        width: 180px;
        accent-color: #DD571C;
        background: #1A242F;
        border-radius: 4px;
      ">
    </label>
    <div style="font-size:10px; margin-left:36px; margin-bottom:8px; color:#FF6A00;">
      Number of random blocks to trigger each 100 ms.
    </div>

    <!-- 2) SVG Distortion (One‑Time + embedded PNG mosh) -->
    <label style="
      display: block;
      margin-top: 6px;
      background: #1A242F;
      padding: 4px 6px;
      border-radius: 4px;
      color: #FF6A00;
      font-size: 13px;
    ">
      <input type="checkbox" id="svgOnceEnable"> Run SVG Distortion (One‑Time)
    </label>
    <div style="font-size:10px; margin-left:18px; color:#FF6A00;">
      Warp vector shapes, scramble text, and heavily mosh embedded PNGs (row/byte swaps & duplications).
    </div>
    <label style="
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: 18px;
      margin-bottom: 8px;
      background: #1A242F;
      padding: 4px 6px;
      border-radius: 4px;
      color: #FF6A00;
      font-size: 13px;
    ">
      Intensity&nbsp;
      <input id="svgIntensity" type="number" min="0" max="200" value="0" style="
        width: 60px;
        background: #1A242F;
        color: #FF6A00;
        border: 1px solid #444;
        border-radius: 3px;
        padding: 2px;
      ">
    </label>
    <div style="font-size:10px; margin-left:36px; margin-bottom:8px; color:#FF6A00;">
      Max translation per SVG vector (0 = off, 200 = extreme), plus embedded‑PNG byte/row‑swap & duplication mosh.
    </div>

    <!-- 3) Control Flow Corruption -->
    <label style="
      display: block;
      margin-top: 6px;
      background: #1A242F;
      padding: 4px 6px;
      border-radius: 4px;
      color: #FF6A00;
      font-size: 13px;
    ">
      <input type="checkbox" id="controlEnable"> Control Flow Corruption
    </label>
    <div style="font-size:10px; margin-left:18px; color:#FF6A00;">
      Randomly break loops, trap scripts in infinite loops, or inject waits.
    </div>
    <label style="
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: 18px;
      margin-bottom: 8px;
      background: #1A242F;
      padding: 4px 6px;
      border-radius: 4px;
      color: #FF6A00;
      font-size: 13px;
    ">
      Intensity&nbsp;
      <input id="controlrate" type="range" min="0" max="100" value="0" style="
        width: 180px;
        accent-color: #DD571C;
        background: #1A242F;
        border-radius: 4px;
      ">
    </label>
    <div style="font-size:10px; margin-left:36px; margin-bottom:8px; color:#FF6A00;">
      Chance (%) per 100 ms to corrupt control flow.
    </div>

    <!-- 4) Visual Corruption -->
    <label style="
      display: block;
      margin-top: 6px;
      background: #1A242F;
      padding: 4px 6px;
      border-radius: 4px;
      color: #FF6A00;
      font-size: 13px;
    ">
      <input type="checkbox" id="visualEnable"> Visual Corruption
    </label>
    <div style="font-size:10px; margin-left:18px; color:#FF6A00;">
      Ghost effects, size overflow, layer swaps, or costume spam.
    </div>
    <label style="
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: 18px;
      margin-bottom: 8px;
      background: #1A242F;
      padding: 4px 6px;
      border-radius: 4px;
      color: #FF6A00;
      font-size: 13px;
    ">
      Intensity&nbsp;
      <input id="visualrate" type="range" min="0" max="100" value="0" style="
        width: 180px;
        accent-color: #DD571C;
        background: #1A242F;
        border-radius: 4px;
      ">
    </label>
    <div style="font-size:10px; margin-left:36px; margin-bottom:8px; color:#FF6A00;">
      Chance (%) per sprite per 100 ms to apply a visual glitch.
    </div>

    <!-- 5) Sprite & Clone Chaos -->
    <label style="
      display: block;
      margin-top: 6px;
      background: #1A242F;
      padding: 4px 6px;
      border-radius: 4px;
      color: #FF6A00;
      font-size: 13px;
    ">
      <input type="checkbox" id="spriteEnable"> Sprite & Clone Chaos
    </label>
    <div style="font-size:10px; margin-left:18px; color:#FF6A00;">
      Spawns/deletes clones, toggles visibility, warps position/scale/rotation, etc.
    </div>
    <label style="
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: 18px;
      margin-bottom: 8px;
      background: #1A242F;
      padding: 4px 6px;
      border-radius: 4px;
      color: #FF6A00;
      font-size: 13px;
    ">
      Intensity&nbsp;
      <input id="spriterate" type="range" min="0" max="100" value="0" style="
        width: 180px;
        accent-color: #DD571C;
        background: #1A242F;
        border-radius: 4px;
      ">
    </label>
    <div style="font-size:10px; margin-left:36px; margin-bottom:8px; color:#FF6A00;">
      Chance (%) per sprite per 100 ms to apply a sprite‑chaos action.
    </div>

    <!-- 6) Block Replacement -->
    <label style="
      display: block;
      margin-top: 6px;
      background: #1A242F;
      padding: 4px 6px;
      border-radius: 4px;
      color: #FF6A00;
      font-size: 13px;
    ">
      <input type="checkbox" id="replaceEnable"> Block Replacement
    </label>
    <div style="font-size:10px; margin-left:18px; color:#FF6A00;">
      Randomly swaps any block’s opcode with another (destroys inputs/fields) and runs it once.
    </div>
    <label style="
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: 18px;
      margin-bottom: 8px;
      background: #1A242F;
      padding: 4px 6px;
      border-radius: 4px;
      color: #FF6A00;
      font-size: 13px;
    ">
      Intensity&nbsp;
      <input id="replacerate" type="range" min="0" max="100" value="0" style="
        width: 180px;
        accent-color: #DD571C;
        background: #1A242F;
        border-radius: 4px;
      ">
    </label>
    <div style="font-size:10px; margin-left:36px; margin-bottom:8px; color:#FF6A00;">
      Chance (%) each 100 ms to pick one block, replace its opcode, and run it.
    </div>

    <!-- 7) Script Mutation -->
    <label style="
      display: block;
      margin-top: 6px;
      background: #1A242F;
      padding: 4px 6px;
      border-radius: 4px;
      color: #FF6A00;
      font-size: 13px;
    ">
      <input type="checkbox" id="scriptEnable"> Script Mutation
    </label>
    <div style="font-size:10px; margin-left:18px; color:#FF6A00;">
      Mid‑script jumps, block linking, and repeat‑until insertion.
    </div>
    <label style="
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: 18px;
      margin-bottom: 8px;
      background: #1A242F;
      padding: 4px 6px;
      border-radius: 4px;
      color: #FF6A00;
      font-size: 13px;
    ">
      Intensity&nbsp;
      <input id="scriptrate" type="range" min="0" max="100" value="0" style="
        width: 180px;
        accent-color: #DD571C;
        background: #1A242F;
        border-radius: 4px;
      ">
    </label>
    <div style="font-size:10px; margin-left:36px; margin-bottom:8px; color:#FF6A00;">
      Chance (%) each 100 ms to warp script flow.
    </div>

    <!-- 8) Asset Table Chaos -->
    <label style="
      display: block;
      margin-top: 6px;
      background: #1A242F;
      padding: 4px 6px;
      border-radius: 4px;
      color: #FF6A00;
      font-size: 13px;
    ">
      <input type="checkbox" id="assetEnable"> Asset Table Chaos
    </label>
    <div style="font-size:10px; margin-left:18px; color:#FF6A00;">
      Randomly rename/swap any costume, sound, or backdrop’s asset ID across all sprites, 
      and shuffle asset entries so references break.
    </div>
    <label style="
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: 18px;
      margin-bottom: 8px;
      background: #1A242F;
      padding: 4px 6px;
      border-radius: 4px;
      color: #FF6A00;
      font-size: 13px;
    ">
      Intensity&nbsp;
      <input id="assetRate" type="range" min="0" max="100" value="0" style="
        width: 180px;
        accent-color: #DD571C;
        background: #1A242F;
        border-radius: 4px;
      ">
    </label>
    <div style="font-size:10px; margin-left:36px; margin-bottom:8px; color:#FF6A00;">
      Chance (%) per 100 ms to perform a random asset ID shuffle/rename.
    </div>

    <!-- Reload Project Button -->
    <button id="reloadProject" style="
      background: #1F252C;
      color: #FF6A00;
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 8px;
      width: 100%;
      font-size: 14px;
    ">🔄 Reload Project</button>
  `;

  content.appendChild(simpleContainer);
  content.appendChild(complexContainer);
  panel.appendChild(content);
  document.body.appendChild(panel);

  // ================================================================================
  // 3) MAKE THE PANEL DRAGGABLE (HEADER = handle)
  // ================================================================================
  (function makeDraggable(handleEl, dragEl) {
    let offsetX = 0, offsetY = 0;
    let isDragging = false;

    handleEl.addEventListener("mousedown", e => {
      isDragging = true;
      handleEl.style.cursor = "grabbing";
      const rect = dragEl.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      e.preventDefault();
    });

    document.addEventListener("mousemove", e => {
      if (!isDragging) return;
      const newX = e.clientX - offsetX;
      const newY = e.clientY - offsetY;
      dragEl.style.left = `${newX}px`;
      dragEl.style.top = `${newY}px`;
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        handleEl.style.cursor = "grab";
      }
    });
  })(header, panel);

  // ================================================================================
  // 4) MINIMIZE / RESTORE FUNCTIONALITY
  // ================================================================================
  const minimizeBtn = panel.querySelector("#minimizeBtn");
  let isMinimized = false;
  minimizeBtn.addEventListener("click", () => {
    if (!isMinimized) {
      content.style.display = "none";
      panel.style.height = null;
      panel.style.maxHeight = "fit-content";
      minimizeBtn.textContent = "▢";
      minimizeBtn.title = "Restore";
      isMinimized = true;
    } else {
      content.style.display = "block";
      panel.style.maxHeight = "80vh";
      minimizeBtn.textContent = "_";
      minimizeBtn.title = "Minimize";
      isMinimized = false;
    }
  });

  // ================================================================================
  // 5) SIMPLE MODE TOGGLE (show/hide containers)
  // ================================================================================
  const simpleModeCheckbox = panel.querySelector("#simpleMode");
  simpleModeCheckbox.addEventListener("change", () => {
    if (simpleModeCheckbox.checked) {
      complexContainer.style.display = "none";
      simpleContainer.style.display = "block";
    } else {
      simpleContainer.style.display = "none";
      complexContainer.style.display = "block";
    }
  });

  // ================================================================================
  // 6) GRAB UI ELEMENT REFERENCES
  // ================================================================================
  const corruptToggle       = panel.querySelector("#corrupt");
  const burstEnable         = panel.querySelector("#burstEnable");
  const burstSlider         = panel.querySelector("#burst");
  const svgOnceEnable       = panel.querySelector("#svgOnceEnable");
  const svgIntensityIn      = panel.querySelector("#svgIntensity");
  const controlEnable       = panel.querySelector("#controlEnable");
  const controlSlider       = panel.querySelector("#controlrate");
  const visualEnable        = panel.querySelector("#visualEnable");
  const visualSlider        = panel.querySelector("#visualrate");
  const spriteEnable        = panel.querySelector("#spriteEnable");
  const spriteSlider        = panel.querySelector("#spriterate");
  const replaceEnable       = panel.querySelector("#replaceEnable");
  const replaceSlider       = panel.querySelector("#replacerate");
  const scriptEnable        = panel.querySelector("#scriptEnable");
  const scriptSlider        = panel.querySelector("#scriptrate");
  const assetEnable         = panel.querySelector("#assetEnable");
  const assetSlider         = panel.querySelector("#assetRate");

  const reloadBtn           = panel.querySelector("#reloadProject");
  const closePanelBtn       = panel.querySelector("#closePanel");

  // Simple‑mode references
  const simpleCorruptEnable = panel.querySelector("#simpleCorruptEnable");
  const simpleRate          = panel.querySelector("#simpleRate");
  const simpleSVGEnable     = panel.querySelector("#simpleSVGEnable");

  // ================================================================================
  // 7) HELPER FUNCTIONS FOR CORRUPTION BEHAVIORS
  //    (All methods except the removed ones)
  // ================================================================================

  // -- Block Corruption Helpers --
  function getAllBlocksDeep() {
    const all = [];
    for (const target of vm.runtime.targets) {
      const blockMap = target.blocks?._blocks;
      if (!blockMap) continue;
      for (const [id, block] of Object.entries(blockMap)) {
        if (block.opcode === "event_whenflagclicked") continue;
        all.push({ target, id, block });
      }
    }
    return all;
  }
  function forceRunBlock(blockInfo) {
    try {
      vm.runtime._pushThread(blockInfo.id, blockInfo.target);
    } catch (e) { /* suppress */ }
  }

  // -- SVG Distortion + Embedded PNG Mosh (using mashPNG) --
  async function mashPNG(base64, intensity) {
    return new Promise(resolve => {
      const img = new Image();
      img.src = "data:image/png;base64," + base64;
      img.onload = () => {
        try {
          const w = img.naturalWidth;
          const h = img.naturalHeight;
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, w, h);
          const data = imageData.data;
          const totalBytes = data.length;     // = w * h * 4

          // 1) Row swaps: ~(intensity/100) * (h/2) row pairs
          const rowSwapCount = Math.max(1, Math.floor((intensity / 100) * (h / 2)));
          for (let i = 0; i < rowSwapCount; i++) {
            const rowA = Math.floor(Math.random() * h);
            let rowB = Math.floor(Math.random() * h);
            if (rowB === rowA) rowB = (rowB + 1) % h;
            const rowAStart = rowA * w * 4;
            const rowBStart = rowB * w * 4;
            const tempRow = new Uint8ClampedArray(w * 4);
            for (let b = 0; b < w * 4; b++) tempRow[b] = data[rowAStart + b];
            for (let b = 0; b < w * 4; b++) data[rowAStart + b] = data[rowBStart + b];
            for (let b = 0; b < w * 4; b++) data[rowBStart + b] = tempRow[b];
          }

          // 2) Byte swaps: ~(intensity/100) * (1% of total bytes) random pair swaps
          const byteSwapCount = Math.max(1, Math.floor((intensity / 100) * (totalBytes * 0.01)));
          for (let i = 0; i < byteSwapCount; i++) {
            const idxA = Math.floor(Math.random() * totalBytes);
            let idxB = Math.floor(Math.random() * totalBytes);
            // Force different rows: row = floor(idx/(4*w))
            const rowA = Math.floor(idxA / (4 * w));
            let rowBVal = Math.floor(idxB / (4 * w));
            if (rowA === rowBVal) {
              rowBVal = (rowBVal + 1) % h;
              idxB = rowBVal * w * 4 + Math.floor(Math.random() * (w * 4));
            }
            const tmp = data[idxA];
            data[idxA] = data[idxB];
            data[idxB] = tmp;
          }

          // 3) Byte duplications: ~(intensity/100) * (0.5% of total bytes) copied to 4 random destinations
          const byteDupCount = Math.max(1, Math.floor((intensity / 100) * (totalBytes * 0.005)));
          for (let i = 0; i < byteDupCount; i++) {
            const srcIdx = Math.floor(Math.random() * totalBytes);
            for (let c = 0; c < 4; c++) {
              const dstIdx = Math.floor(Math.random() * totalBytes);
              data[dstIdx] = data[srcIdx];
            }
          }

          ctx.putImageData(imageData, 0, 0);
          const newDataURL = canvas.toDataURL("image/png");
          const newBase64 = newDataURL.split(",")[1];
          resolve(newBase64);
        } catch (err) {
          console.warn("mashPNG error:", err);
          resolve(base64);
        }
      };
      img.onerror = () => {
        console.warn("mashPNG: failed to load image");
        resolve(base64);
      };
    });
  }
  async function distortSVGOnce(intensity) {
    for (const target of vm.runtime.targets) {
      for (const costume of target.sprite.costumes) {
        if (!costume.asset) continue;
        const format = costume.asset.dataFormat;
        if (!format.includes("svg")) continue;

        try {
          const rawText = await costume.asset.decodeText();
          const parser = new DOMParser();
          const doc = parser.parseFromString(rawText, "image/svg+xml");

          const allEls = doc.querySelectorAll("*");
          for (const el of allEls) {
            if (["path","polygon","polyline","rect","ellipse","circle"].includes(el.tagName)) {
              const tx = (Math.random() - 0.5) * intensity;
              const ty = (Math.random() - 0.5) * intensity;
              const prev = el.getAttribute("transform") || "";
              el.setAttribute("transform", `${prev} translate(${tx},${ty})`);
            }
            if (el.tagName === "text") {
              const oldTxt = el.textContent || "";
              let scrambled = "";
              for (const ch of oldTxt) {
                if (Math.random() < 0.3) scrambled += String.fromCharCode(33 + Math.floor(Math.random() * 94));
                else scrambled += ch;
              }
              el.textContent = scrambled;
              if (Math.random() < 0.5) {
                el.setAttribute("font-size", 8 + Math.random() * 60);
              }
              const dx = (Math.random() - 0.5) * intensity;
              const dy = (Math.random() - 0.5) * intensity;
              const oldX = parseFloat(el.getAttribute("x") || 0);
              const oldY = parseFloat(el.getAttribute("y") || 0);
              el.setAttribute("x", oldX + dx);
              el.setAttribute("y", oldY + dy);
            }
            if (el.tagName === "image") {
              const hrefAttr = el.getAttribute("xlink:href") || el.getAttribute("href");
              if (hrefAttr && hrefAttr.startsWith("data:image/png;base64,")) {
                const base64 = hrefAttr.split(",")[1];
                const newBase64 = await mashPNG(base64, intensity);
                const newHref = `data:image/png;base64,${newBase64}`;
                el.setAttribute("xlink:href", newHref);
                el.setAttribute("href", newHref);
              }
            }
          }

          const serializer = new XMLSerializer();
          const newSVG = serializer.serializeToString(doc);
          const newAsset = vm.runtime.storage.createAsset(
            "ImageVector",
            "svg",
            newSVG,
            null,
            true
          );
          costume.assetId = newAsset.assetId;
          costume.asset   = newAsset;
          const newSkinId = vm.renderer.createSVGSkin(newAsset.data);
          target.renderer.updateDrawableSkinId(target.drawableID, newSkinId);
          costume.skinId = newSkinId;
        } catch (err) {
          console.warn("SVG distortion + embedded PNG mosh error:", err);
        }
      }
    }
    if (!simpleModeCheckbox.checked) {
      svgOnceEnable.checked = false;
    }
  }

  // -- Control Flow Corruption Helpers --
  function pickRandomBlockByOpcode(opcode) {
    const all = getAllBlocksDeep();
    const filtered = all.filter(b => b.block.opcode === opcode);
    if (!filtered.length) return null;
    return filtered[Math.floor(Math.random() * filtered.length)];
  }
  function corruptControlFlow(intensity) {
    if (Math.random() * 100 > intensity) return;
    const actions = ["injectWait", "forceInfiniteLoop", "randomStop"];
    const choice = actions[Math.floor(Math.random() * actions.length)];
    switch (choice) {
      case "injectWait": {
        const wb = pickRandomBlockByOpcode("control_wait");
        if (wb) {
          const prim = vm.runtime._primitives["control_wait"];
          try { prim.call(wb.target, { DURATION: Math.random() * 0.5 }); }
          catch {}
        }
        break;
      }
      case "forceInfiniteLoop": {
        let loopBlock = pickRandomBlockByOpcode("control_forever");
        if (!loopBlock) loopBlock = pickRandomBlockByOpcode("control_repeat");
        if (loopBlock) forceRunBlock(loopBlock);
        break;
      }
      case "randomStop": {
        let stopBlock = pickRandomBlockByOpcode("control_stop");
        if (!stopBlock) stopBlock = pickRandomBlockByOpcode("control_stop_all");
        if (stopBlock) forceRunBlock(stopBlock);
        break;
      }
    }
  }

  // -- Visual Corruption Helpers --
  function corruptVisuals(intensity) {
    for (const target of vm.runtime.targets) {
      if (target.isStage) continue;
      if (Math.random() * 100 > intensity) continue;
      const actions = ["ghostEffect", "sizeOverflow", "layerSwap", "costumeSpam"];
      const choice = actions[Math.floor(Math.random() * actions.length)];
      switch (choice) {
        case "ghostEffect": {
          const prim = vm.runtime._primitives["looks_seteffectto"];
          if (prim) {
            try { prim.call(target, { EFFECT: "ghost", VALUE: Math.random() * 100 }); }
            catch {}
          }
          break;
        }
        case "sizeOverflow": {
          const prim = vm.runtime._primitives["looks_setsizeto"];
          if (prim) {
            try {
              const val = -200 + Math.random() * 700;
              prim.call(target, { SIZE: val });
            } catch {}
          }
          break;
        }
        case "layerSwap": {
          try {
            const newLayer = Math.floor(Math.random() * 200);
            target.setLayerOrder(newLayer);
          } catch {}
          break;
        }
        case "costumeSpam": {
          const cList = target.sprite.costumes;
          if (cList.length) {
            try {
              const idx = Math.floor(Math.random() * cList.length);
              target.setCostume(idx);
            } catch {}
          }
          break;
        }
      }
    }
  }

  // -- Sprite & Clone Chaos Helper --
  function corruptSprites(rate) {
    for (const target of vm.runtime.targets) {
      if (target.isStage) continue;
      if (Math.random() * 100 > rate) continue;
      const actions = [
        "toggleVisibility",
        "warpPosition",
        "warpScale",
        "warpRotation",
        "changeCostume",
        "shuffleLayer",
        "spawnOrDeleteClone"
      ];
      const choice = actions[Math.floor(Math.random() * actions.length)];
      switch (choice) {
        case "toggleVisibility":
          try { target.setVisible(!target.isVisible); } catch {}
          break;
        case "warpPosition":
          try {
            const dx = (Math.random() - 0.5) * 200;
            const dy = (Math.random() - 0.5) * 200;
            target.setXY(target.x + dx, target.y + dy);
          } catch {}
          break;
        case "warpScale":
          try {
            const newScale = 0.5 + Math.random();
            target.setScale(newScale);
          } catch {}
          break;
        case "warpRotation":
          try {
            const angle = Math.random() * 360;
            target.setDirection(angle);
          } catch {}
          break;
        case "changeCostume":
          try {
            const cList = target.sprite.costumes;
            if (!cList.length) break;
            const idx = Math.floor(Math.random() * cList.length);
            target.setCostume(idx);
          } catch {}
          break;
        case "shuffleLayer":
          try {
            const newLayer = Math.floor(Math.random() * 100);
            target.setLayerOrder(newLayer);
          } catch {}
          break;
        case "spawnOrDeleteClone":
          try {
            if (target.isClone) {
              target.deleteThisClone();
            } else {
              vm.runtime.instantiateTarget(
                target.cloneContext ? target.cloneContext : target
              );
            }
          } catch {}
          break;
      }
    }
  }

  // -- Block Replacement Helper --
  const allOpcodes = Object.keys(vm.runtime._primitives);
  function replaceRandomBlock(rate) {
    if (Math.random() * 100 > rate) return;
    const allBlocks = getAllBlocksDeep();
    if (!allBlocks.length) return;
    const blockInfo = allBlocks[Math.floor(Math.random() * allBlocks.length)];
    const { target, id, block } = blockInfo;
    let newOpcode = block.opcode;
    while (newOpcode === block.opcode) {
      newOpcode = allOpcodes[Math.floor(Math.random() * allOpcodes.length)];
    }
    block.opcode = newOpcode;
    block.inputs = {};
    block.fields = {};
    forceRunBlock(blockInfo);
  }

  // -- SCRIPT MUTATION Helper --
  function corruptScriptMutation(rate) {
    if (Math.random() * 100 > rate) return;

    const allBlocks = getAllBlocksDeep();
    if (!allBlocks.length) return;
    const randomBlockInfo = allBlocks[Math.floor(Math.random() * allBlocks.length)];
    forceRunBlock(randomBlockInfo);

    const blkA = allBlocks[Math.floor(Math.random() * allBlocks.length)];
    const blkB = allBlocks[Math.floor(Math.random() * allBlocks.length)];
    try { blkA.block.next = blkB.id; } catch {}

    const refRepeat = pickRandomBlockByOpcode("control_repeat_until");
    if (refRepeat) {
      const target = refRepeat.target;
      const oldBlock = target.blocks._blocks[refRepeat.id];
      if (oldBlock) {
        const newId = Math.random().toString(36).substr(2, 10);
        const newBlock = {
          opcode: oldBlock.opcode,
          next: oldBlock.next,
          parent: oldBlock.parent,
          inputs: JSON.parse(JSON.stringify(oldBlock.inputs)),
          fields: JSON.parse(JSON.stringify(oldBlock.fields)),
          shadow: oldBlock.shadow,
          topLevel: oldBlock.topLevel,
        };
        target.blocks._blocks[newId] = newBlock;
        const parentId = oldBlock.parent;
        if (parentId && target.blocks._blocks[parentId]) {
          try {
            target.blocks._blocks[parentId].next = newId;
            newBlock.next = oldBlock.id;
            newBlock.parent = parentId;
            oldBlock.parent = newId;
          } catch {}
        }
      }
    }
  }

  // -- ASSET TABLE CHAOS Helper --
  function corruptAssetTable(rate) {
    if (Math.random() * 100 > rate) return;

    // 1) Collect every costume across all targets (including stage)
    const allCostumeEntries = [];
    for (const target of vm.runtime.targets) {
      const costumes = target.sprite.costumes;
      for (let i = 0; i < costumes.length; i++) {
        allCostumeEntries.push({
          target,
          index: i,
          costume: costumes[i]
        });
      }
    }

    // 2) Shuffle the costume entries array
    const shuffledCostumeEntries = allCostumeEntries.slice();
    for (let i = shuffledCostumeEntries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledCostumeEntries[i], shuffledCostumeEntries[j]] =
        [shuffledCostumeEntries[j], shuffledCostumeEntries[i]];
    }

    // 3) Reassign each costume’s assetId and asset from the shuffled list
    for (let i = 0; i < allCostumeEntries.length; i++) {
      const destEntry = allCostumeEntries[i];
      const srcEntry = shuffledCostumeEntries[i];
      destEntry.costume.assetId = srcEntry.costume.assetId;
      destEntry.costume.asset = srcEntry.costume.asset;
      try {
        const fmt = destEntry.costume.asset.dataFormat;
        let newSkinId;
        if (fmt.includes("svg")) {
          newSkinId = vm.renderer.createSVGSkin(destEntry.costume.asset.data);
        } else {
          newSkinId = vm.renderer.createBitmapSkin(
            destEntry.costume.asset.data,
            destEntry.costume.asset.dataFormat
          );
        }
        destEntry.target.renderer.updateDrawableSkinId(
          destEntry.target.drawableID,
          newSkinId
        );
        destEntry.costume.skinId = newSkinId;
      } catch (e) {
        console.warn("Asset chaos skin update error:", e);
      }
    }

    // 4) Shuffle costume names among stage/backdrops
    const stage = vm.runtime.targets.find(t => t.isStage);
    if (stage) {
      const stageCostumes = stage.sprite.costumes;
      const names = stageCostumes.map(c => c.name);
      for (let i = names.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [names[i], names[j]] = [names[j], names[i]];
      }
      for (let i = 0; i < stageCostumes.length; i++) {
        stageCostumes[i].name = names[i];
      }
    }

    // 5) Collect every sound across all targets
    const allSoundEntries = [];
    for (const target of vm.runtime.targets) {
      const sounds = target.sprite.sounds;
      for (let i = 0; i < sounds.length; i++) {
        allSoundEntries.push({
          target,
          index: i,
          sound: sounds[i]
        });
      }
    }

    // 6) Shuffle the sound entries
    const shuffledSoundEntries = allSoundEntries.slice();
    for (let i = shuffledSoundEntries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledSoundEntries[i], shuffledSoundEntries[j]] =
        [shuffledSoundEntries[j], shuffledSoundEntries[i]];
    }

    // 7) Reassign each sound’s assetId and asset from the shuffled list
    for (let i = 0; i < allSoundEntries.length; i++) {
      const destEntry = allSoundEntries[i];
      const srcEntry = shuffledSoundEntries[i];
      destEntry.sound.assetId = srcEntry.sound.assetId;
      destEntry.sound.asset = srcEntry.sound.asset;
    }

    // 8) Randomize the order of costumes arrays within each target
    for (const target of vm.runtime.targets) {
      const costumes = target.sprite.costumes;
      if (costumes.length <= 1) continue;
      for (let i = costumes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [costumes[i], costumes[j]] = [costumes[j], costumes[i]];
      }
      let newIndex = target.currentCostume ? target.currentCostume : 0;
      if (newIndex >= costumes.length) newIndex = 0;
      try {
        target.setCostume(newIndex);
      } catch {}
    }

    // 9) Randomize the order of sounds arrays within each target
    for (const target of vm.runtime.targets) {
      const sounds = target.sprite.sounds;
      if (sounds.length <= 1) continue;
      for (let i = sounds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sounds[i], sounds[j]] = [sounds[j], sounds[i]];
      }
    }
  }

  // ================================================================================
  // 8) MAIN CORRUPTION LOOP (every 100 ms)
  // ================================================================================
  const masterInterval = setInterval(() => {
    // SIMPLE MODE
    if (simpleModeCheckbox.checked) {
      if (!simpleCorruptEnable.checked) return;
      const prob = parseInt(simpleRate.value);

      // 1) Burst (Block) Chaos
      if (prob > 0 && burstEnable.checked) {
        const count = Math.floor((prob / 100) * 5);
        const allBlocks = getAllBlocksDeep();
        for (let i = 0; i < count; i++) {
          if (!allBlocks.length) break;
          const blk = allBlocks[Math.floor(Math.random() * allBlocks.length)];
          forceRunBlock(blk);
        }
      }
      // 2) SVG Distortion (embedded PNG mosh)
      if (simpleSVGEnable.checked && prob > 0) distortSVGOnce(prob);
      // 3) Control Flow
      if (controlEnable.checked) corruptControlFlow(prob);
      // 4) Visual
      if (visualEnable.checked) corruptVisuals(prob);
      // 5) Sprite & Clone
      if (spriteEnable.checked) corruptSprites(prob);
      // 6) Block Replacement
      if (replaceEnable.checked) {
        const rProb = parseInt(replaceSlider.value);
        replaceRandomBlock(rProb);
      }
      // 7) Script Mutation
      if (scriptEnable.checked) {
        const sProb = parseInt(scriptSlider.value);
        corruptScriptMutation(sProb);
      }
      // 8) Asset Table Chaos
      if (assetEnable.checked) {
        const aProb = parseInt(assetSlider.value);
        corruptAssetTable(aProb);
      }

    // COMPLEX MODE
    } else {
      if (!corruptToggle.checked) return;

      // 1) Burst (Block) Chaos
      if (burstEnable.checked) {
        const count = parseInt(burstSlider.value);
        const allBlocks = getAllBlocksDeep();
        for (let i = 0; i < count; i++) {
          if (!allBlocks.length) break;
          const blk = allBlocks[Math.floor(Math.random() * allBlocks.length)];
          forceRunBlock(blk);
        }
      }
      // 2) SVG Distortion (One‑Time + embedded PNG mosh)
      if (svgOnceEnable.checked) {
        const intensity = parseInt(svgIntensityIn.value) || 0;
        if (intensity > 0) distortSVGOnce(intensity);
        svgOnceEnable.checked = false;
        svgIntensityIn.value = "0";
      }
      // 3) Control Flow
      if (controlEnable.checked) {
        const cProb = parseInt(controlSlider.value);
        corruptControlFlow(cProb);
      }
      // 4) Visual
      if (visualEnable.checked) {
        const vProb = parseInt(visualSlider.value);
        corruptVisuals(vProb);
      }
      // 5) Sprite & Clone
      if (spriteEnable.checked) {
        const sProb = parseInt(spriteSlider.value);
        corruptSprites(sProb);
      }
      // 6) Block Replacement
      if (replaceEnable.checked) {
        const rProb = parseInt(replaceSlider.value);
        replaceRandomBlock(rProb);
      }
      // 7) Script Mutation
      if (scriptEnable.checked) {
        const sProb = parseInt(scriptSlider.value);
        corruptScriptMutation(sProb);
      }
      // 8) Asset Table Chaos
      if (assetEnable.checked) {
        const aProb = parseInt(assetSlider.value);
        corruptAssetTable(aProb);
      }
    }
  }, 100);

  // ================================================================================
  // 9) CLOSE UI (“✕” BUTTON)
  // ================================================================================
  closePanelBtn.onclick = () => {
    clearInterval(masterInterval);
    panel.remove();
  };

  // ================================================================================
  // 10) RELOAD PROJECT BUTTON
  // ================================================================================
  reloadBtn.onclick = () => {
    if (!originalProjectJSON) {
      alert("Original project data not available. Cannot reload.");
      return;
    }
    try {
      vm.loadProject(originalProjectJSON);
    } catch (e) {
      console.error("Failed to reload project:", e);
      alert("Failed to reload project. See console for details.");
    }
  };
})();