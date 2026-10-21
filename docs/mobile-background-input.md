# Mobile background input fix

2026-10-21. The reported issue is movement of the background during scrolling, not low frame rate. Preserve the original shader, DPR cap of 2, colors, timing and existing page scale.

## Implementation

Touch capability (`maxTouchPoints` or a coarse pointer) disables the shader's pointer listener completely. Its mouse uniform stays at `(0.5, 0.5)`; only its autonomous time-driven animation advances. This also covers touch devices with an attached mouse. Page scrolling, taps and normal accessibility gestures remain enabled.

On touch devices, the fixed backdrop has a stable `100lvh` height (`100vh` fallback) rather than stretching between top and bottom as browser controls change the visible viewport. Dividing by the existing page zoom preserves screen coverage at the site's unchanged 90% content scale. A zero-offset compositor transform keeps the layer separate from scrolling content. Real surface size changes, including rotation, still update the buffer. Desktop layout and pointer behavior are preserved.

## Evidence

- `npm run check`: eight tests PASS, including unchanged shader-reference hash, original DPR, neutral mobile pointer, continued animation, no touch/scroll handlers, mouse interaction on non-touch desktops, height changes and pause/resume.
- `npm run build` and `git diff --check`: PASS.
- Actual Chromium sessions at 390, 768 and 1440px. Synthesized touch drags scrolled mobile pages by 385px. Both scrolling directions and a synthetic mouse pointer event on touch devices left the backdrop rectangle, buffer dimensions and mouse uniform unchanged; animation time advanced. Rotation updated the canvas. Pause/resume and reduced-motion startup passed. No runtime exceptions.
- At 390 × 844 with DPR 3, the buffer remains 866 × 1876, identical to the original. No performance-oriented resolution reduction is included.
- Browser evidence: `/tmp/silence-input-check.json`; screenshots `/tmp/silence-input-390.jpg`, `/tmp/silence-input-768.jpg`, `/tmp/silence-input-1440.jpg`. These are local QA artifacts, not shipped assets.
- No physical iPhone is connected. Safari toolbar animation and rubber-band scrolling remain to be checked on the user's device. Chromium touch emulation does not reproduce those behaviors fully.

## Required integrations and scoped delivery gate

Direction retained: ENERGY 3 / RHYTHM 3 / MOTION 2. The supplied animated scene remains the identity motif; this change removes gesture-driven displacement, not autonomous motion.

- Taste: existing direction retained, responsive browser inspection and screenshots reviewed at 390, 768 and 1440px; no horizontal overflow or broken images. Whole-page findings remain for existing `button-fx`, `hairline`, `outlined-box`, `covered-text` during scrolling beneath sticky navigation, and `gradient`; advisories remain for `glass`, `size-count`, `no-footage`, `name-only-title` and `off-centre`. These existing styles were preserved rather than redesigned as part of this input fix.
- Impeccable: harden and polish review applied; mechanical detector on the changed CSS and renderer returned `[]`.
- Anti-Slop hard gate PASS for this change: source-backed behavior, no added claims or dead controls, build and behavioral tests pass; actual iOS limitation disclosed.
- Anti-Slop purpose gate PASS: stable viewport sizing prevents stretching; the compositor layer isolates the background; a fixed neutral pointer removes mobile input response. No unrelated decoration added.
- Anti-Slop liveliness gate PASS: existing dials and autonomous animation preserved; user-controlled pause and reduced-motion startup remain.
- Anti-Slop craftsmanship gate PASS: narrow renderer/CSS fix with actual gesture and uniform checks; original shader quality retained.
- Gesso: exported `dist` HTML PASS on eight files, severity 0, zero gating findings. One or two linked external stylesheets per page mean CSS-dependent coverage is a lower bound.
- 21st: MCP component search attempted; first request timed out, retry returned HTTP 401 (missing authentication). No component retrieved.

| Gesso guard | Hits | Action | Reason |
| --- | --- | --- | --- |
| `overstuffed-row` (advisory) | 40 | Retained | Existing catalogue/documentation lists, outside this input fix. |

References: [viewport units](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length), [WebKit mobile viewport emulation limitation](https://bugs.webkit.org/show_bug.cgi?id=233329).
