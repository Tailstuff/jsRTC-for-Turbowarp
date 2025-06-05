jsRTC for TurboWarp

jsRTC is a real-time “project corruptor” that injects a movable UI into your TurboWarp projects, letting you warp, glitch, and break sprites, scripts, and assets on the fly. This README covers how to inject it by copying the code directly into the browser console on turbowarp.org, plus a brief tutorial on using the panel.

⸻

⚠️ Important

- This only works on https://turbowarp.org/.
	•	It will not work on the official Scratch website or on any non‑TurboWarp/Scratch environment.
	•	Be sure you have a TurboWarp project open in your browser before proceeding.

⸻

1. Injecting jsRTC via the Browser Console
	1.	Open TurboWarp
Go to turbowarp.org and load (or create) the project you want to corrupt.
	2.	Open the Developer Console
	•	In Chrome/Edge: press Ctrl+Shift+J (Windows/Linux) or Cmd+Option+J (macOS).
	•	In Firefox: press Ctrl+Shift+K (Windows/Linux) or Cmd+Option+K (macOS).
	•	In Safari (macOS): enable the Develop menu in Preferences → Advanced, then press Cmd+Option+C.
	3.	Obtain jsRTCturbowarp.js
	•	Download jsRTCturbowarp.js directly from GitHub (click “Raw” → Save As),
	•	Or simply copy & paste the entire file text from this GitHub page

	4.	Paste into the Console → Press Enter
	•	In the console prompt, paste everything you copied from jsRTCturbowarp.js.
	•	Then press Enter.
	•	jsRTC will immediately inject the corruption UI panel in the top‑left corner of TurboWarp.
	5.	Verify
	•	You should see a dark, draggable panel labeled “jsRTC for TurboWarp”.
	•	If no panel appears, make sure you are on a TurboWarp page and that you pasted the entire file correctly.

⸻

2. How to Use the jsRTC UI

Once the UI is loaded, you’ll see:
	1.	Title Bar
	•	jsRTC for TurboWarp (white text)
	•	A minimize/restore button (_ / ▢)
	•	A close button (✕)
	2.	Simple vs. Complex Mode
At the top of the panel, there’s a “Simple Mode” checkbox:
	•	Unchecked (Complex Mode, default): You see individual corruption categories (Burst, SVG Distortion, Control Flow, Visual, Sprite & Clone, Block Replacement, Script Mutation, Asset Table Chaos).
	•	Checked (Simple Mode): Hides the granular controls and shows a single “Auto‑Corrupt” slider plus an “SVG Distortion” toggle.
	3.	Complex Mode Controls
Each category has:
	•	A checkbox (to enable/disable that corruption type).
	•	A slider (0–100%) to set the intensity or probability of that corruption per 100 ms tick.

Category	What It Does
Burst (Block) Chaos	Runs random blocks (excluding Green‑Flag hats) out of sequence.
SVG Distortion	One‑time transformation of every SVG costume: shifts vector paths, scrambles text, and moshes embedded PNGs.
Control Flow Corruption	Injects random waits, forces infinite loops, or runs stop blocks mid‑script.
Visual Corruption	Applies ghost effects, size overflows, layer swaps, or rapid costume changes to sprites.
Sprite & Clone Chaos	Spawns or deletes clones at will, warps sprite positions/rotations/scales, toggles visibility, or changes costumes randomly.
Block Replacement	Swaps any block’s opcode with another, wiping out its inputs/fields and executing it immediately.
Script Mutation	Jumps mid‑script to other blocks, links unrelated block chains, or inserts repeat until true loops.
Asset Table Chaos	Randomly renames or swaps costume and sound asset IDs across all sprites and shuffles asset order.

•	To corrupt, check the box, then move the slider to control how often (or how many) random actions happen each 100 ms.

	4.	Simple Mode Controls
In Simple Mode, you see:
	•	Auto‑Corrupt (ON/OFF): master toggle for all eight categories.
	•	Intensity (0–100): a single slider. At each 100 ms tick, there’s an Intensity% chance to run all enabled categories once.
	•	SVG Distortion (ON/OFF): If checked, runs one‑time SVG distortion at the current intensity.
	5.	Reload Project
	•	The bottom button labeled “🔄 Reload Project” resets TurboWarp to its original state (the moment before you injected jsRTC).
	•	It does NOT reload the web page—only reverts changes made in memory.
	•	All your corruption settings (checkboxes/sliders) remain, so you can re‑apply chaos immediately.
	6.	Close Panel
	•	Click the top‑right ✕ to stop all corruption and remove the jsRTC UI.
	•	After closing, your project will continue running normally (except for any corrupted assets or scripts that loaded earlier). To fully restore, use “🔄 Reload Project” first, then close.

⸻

3. Quick Example
	1.	Inject jsRTC (paste entire JS into console, press Enter).
	2.	The UI appears. By default, everything is off.
	3.	Enable Burst Chaos: check “Burst (Block) Chaos,” set slider to 10.
	•	Now every 100 ms, jsRTC will randomly pick 10 blocks to trigger out of sequence.
	4.	Enable Visual Corruption: check “Visual Corruption,” set slider to 30.
	•	On average, 30% of sprites get a ghost/size/layer/costume glitch per 100 ms.
	5.	Watch as your sprites break free of normal behavior.
	6.	Revert: click “🔄 Reload Project”. Everything goes back to how it was when you first injected jsRTC.

⸻

4. Tips & Troubleshooting
	•	Only on TurboWarp! Make sure you’re on turbowarp.org. The VM methods jsRTC relies on don’t exist on Scratch’s site.
	•	Paste the full file: If you accidentally miss a bracket or semicolon when copying, jsRTC will fail silently (no panel appears).
	•	Console Errors: If you see “vm not found” or similar, you are not on TurboWarp.
	•	Performance: High slider values (especially 80–100) can slow down your project or browser. Dial back intensity if things freeze.
	•	Reload vs. Page Refresh: Always use “🔄 Reload Project” first to restore the project state. If that fails, refresh the entire browser page and re‑inject.

⸻

5. License & Attribution

Feel free to fork, modify, and redistribute this script. Attribution appreciated but not required. Have fun breaking your TurboWarp projects!

⸻

Enjoy unleashing chaotic fun with jsRTC for TurboWarp!
