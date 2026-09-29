<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-28 | Updated: 2026-09-29 -->

# sims

## Purpose
Step-through simulators — "a C debugger for the slide's pseudocode": code panels with a current-line marker, a variable table that highlights diffs, a description per step, optional SVG per step. 18 sims, inserted into articles with `[[sim:name]]`; the catalogue with target articles and expected final values is `../CONTRACT.md` §6.

## Key Files
| File | Description |
|------|-------------|
| `_engine.js` | SimEngine: options → `build(opts)` → steps; controls (⏮ ◀ ▶ ⏭, autoplay, slider, ← → keys); mounts on `.sim[data-sim]`. |
| `_reference_ticket_lock.js.txt` | Reference implementation copied from 운체위키 (not built). Shows the file shape; its OS content is irrelevant here. |
| `insertion_sort_trace.js`, `loop_invariant_check.js` | L1: insertion sort on [4,3,1,5,2] line by line; loop invariant checked each iteration (귀납법 4요소, L1 p.46–52). |
| `bigo_witness.js` | L2: find witnesses c, n₀ for a Big-O claim (L2 p.17–26). |
| `mergesort_tree.js`, `merge_step.js`, `recursion_tree_sum.js`, `master_method.js`, `substitution_method.js` | L3: mergesort call tree on [8,4,1,5,3,2,6,7]; two-pointer merge incl. HW1 #5 inversion count; recursion-tree level sums; master method case decider (L3 p.90–91); substitution with C=10 / max{7,10d} / 8. |
| `select_partition.js`, `median_of_medians.js` | L4: select on a 10-element array with partition; median of medians on 23 elements (L4 p.80, p.85–93). |
| `counting_sort.js`, `bucket_sort.js`, `radix_sort.js` | L5: slide examples (counting_sort L5 p.17, bucket_sort p.35 / get_bucket p.44, radix_sort p.47 / make_pairs p.52). |
| `randomized_quicksort.js`, `geometric_expectation.js`, `majority_dc.js` | L6: quicksort comparison counts and X_{a,b}; geometric expectation E=1/p (bogosort, 랜덤 majority); divide-and-conquer majority_element (L6 p.66 with the `mid` fix). |
| `hash_chaining.js`, `universal_hash_check.js` | L7: chaining INSERT/SEARCH/DELETE (L7 p.26/28/34/57/70); universal-family check of h_{a,b} with p=5, n=3. |

## For AI Agents

### Working In This Directory
- A sim is `SIMS["name"] = { title, desc, options, build(opts) }` returning `{ panels, vars, steps }`; `name` equals the filename; every step carries a full `vars` snapshot (the engine diffs consecutive steps).
- No DOM access inside a sim file — `test_sims.js` runs them under node without `document`.
- `pc` values are 1-based line numbers into the panel's `lines`; `null` means idle.
- After adding a sim: register it in `../CONTRACT.md` §6 with its expected final values, reference it from an article with `[[sim:name]]`, rebuild (`build.py` reports missing sims).

### Testing Requirements
`node src/test_sims.js` from the wiki root (all option combinations must build, `steps.length > 0`, `pc` in range). Then `python3 build.py` and step through it in the browser.

### Common Patterns
- Keep the slide's pseudocode verbatim in the code panel (Python-style `def …:`), with the slide page in the panel title, so the student recognises it during the exam.
- `note:` on a step for the red warning box where a slide typo or edge case matters (e.g. the `mid` fix in `majority_dc.js`).
- Where 해설 and slide values differ, the sim uses the slide value (errata list in `../CONTRACT.md` §1).

## Dependencies

### Internal
- `../renderer.js` `inlineFormat` for `[[링크]]` inside step descriptions; CSS for `.sim*` in `../head.html`.

<!-- MANUAL: -->
