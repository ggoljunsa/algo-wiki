<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-28 | Updated: 2026-09-28 -->

# anims

## Purpose
"움직이는 그림": self-playing animated diagrams built as SVG with SMIL, inserted with `[[anim:name|캡션]]`. Where a sim shows variable values step by step, an anim shows the mechanism as a looping 8–14 s cartoon. Added 2026-09-28. The catalogue with target articles is the table at the end of `CONTRACT.md` §7.

## Key Files
| File | Description |
|------|-------------|
| `_anim_engine.js` | AnimEngine: renders header/stage/controls (재생/정지, 처음부터, 0.5×/1×/2×, scrubber, clock), drives the SVG timeline with `svg.setCurrentTime(t)` via `requestAnimationFrame`, loops, pauses when scrolled out of view (IntersectionObserver), honours `window.ANIM_FREEZE_AT` for screenshots. |
| `_reference_ctx_switch.js.txt` | Reference implementation copied from 운체위키 (not built). Copy its helpers (`show()`, `esc()`) and 자막–그림–요점 layout. |
| `two_questions.js` … `mom_grid.js` (10) | L1–L4: two questions, insertion card, loop invariant flow, Big-O graph, divide&conquer flow, mergesort split/merge, recursion tree levels, master struggle, pivot partition, median-of-medians grid. |
| `decision_tree_leaves.js` … `universal_hash_pick.js` (10) | L5–L7: decision tree leaves, counting sort flow, radix LSD, stable sort, expected vs worst, quicksort random pivot, harmonic sum, majority random pick, hash pigeonhole, universal hash pick. Full list in `../CONTRACT.md` §7. |
| other `*.js` | One animation per file, `ANIMS["name"]` with `name == filename`. |

## For AI Agents

### Working In This Directory
- `build()` returns a pure `<svg viewBox="0 0 760 H">` string; timeline only via SMIL (`<animate>`, `<animateTransform>`, `<animateMotion>`, `<set>`). No CSS animations, no timers, no DOM.
- `begin + dur ≤ duration` for every animation element; `fill="freeze"` to hold end states; `repeatCount="indefinite"` requires `dur`.
- Escape `<`, `>`, `&` in text; prefix every `id` with the anim name; keep under 60 KB.
- Layout: top line = phase caption (changes over time), middle = diagram, bottom line = takeaway. Palette in CONTRACT §7.

### Testing Requirements
```sh
node src/test_anims.js
python3 build.py            # 0 missing / 0 unused anims
./shot.sh <name> <sec> out.png   # 3 times per anim, then Read the PNGs
```

### Common Patterns
- `show(from, to, D)` opacity helper for "visible only between from and to seconds".
- Moving packets: `<rect>` + `<animateMotion path=… begin dur fill="freeze">` plus an opacity window.

## Dependencies

### Internal
- `renderer.js` mounts `.anim[data-anim]` after each article render and passes `data-caption`.
- CSS for `.anim*` lives in `src/head.html`.

<!-- MANUAL: -->
