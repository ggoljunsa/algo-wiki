<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-28 | Updated: 2026-09-28 -->

# sims

## Purpose
Step-through simulators — "a C debugger for the slide's code": code panels with a current-line marker, a variable table that highlights diffs, a description per step, optional SVG per step. 16 sims; the catalogue with their target articles is in `CONTRACT.md` §6.

## Key Files
| File | Description |
|------|-------------|
| `_engine.js` | SimEngine: options → `build(opts)` → steps; controls (⏮ ◀ ▶ ⏭, autoplay, slider, ← → keys); mounts on `.sim[data-sim]`. |
| `insertion_sort_trace.js`, `loop_invariant_check.js`, `bigo_witness.js`, `mergesort_tree.js`, `merge_step.js`, `recursion_tree_sum.js`, `master_method.js`, `substitution_method.js`, `select_partition.js`, `median_of_medians.js` | L1–L4: insertion sort [4,3,1,5,2], loop invariant, Big-O witnesses (c, n₀), mergesort [8,4,1,5,3,2,6,7], merge/inversion count, recursion tree sums, master method cases, substitution C=10 / max{7,10d} / 8, select on 10-element array, median of medians (23 elements). |
| `counting_sort.js`, `bucket_sort.js`, `radix_sort.js`, `randomized_quicksort.js`, `geometric_expectation.js`, `majority_dc.js`, `hash_chaining.js`, `universal_hash_check.js` | L5–L7: counting/bucket/radix slide examples, quicksort comparison counts + X_{a,b}, geometric E=1/p (bogosort, majority), majority D&C, chaining p.28/34/57/70, universal check h_{a,b} p=5 n=3. Expected final values are listed in `../CONTRACT.md` §6. |
| `_reference_ticket_lock.js.txt` | Reference implementation copied from 운체위키 (not built). |
| `syscall_trap.js`, `context_switch.js`, `proc_states.js`, `fork_exec.js`, `thread_stack.js` | 3–4강 and 8강 mechanisms. |
| `sched_gantt.js`, `mlfq.js`, `stride_lottery.js`, `cfs_eevdf.js` | 5–6강 scheduling policies with editable inputs. |

## For AI Agents

### Working In This Directory
- A sim is `SIMS["name"] = { title, desc, options, build(opts) }` returning `{ panels, vars, steps }`; every step carries a full `vars` snapshot (the engine diffs consecutive steps).
- No DOM access inside a sim file — `test_sims.js` runs them without `document`.
- `pc` values are 1-based line numbers into the panel's `lines`; `null` means idle.

### Testing Requirements
`node src/test_sims.js` (all option combinations must build, `steps.length > 0`, `pc` in range).

### Common Patterns
- Use `status: { T1: "running", T2: "spinning" }` for badges; known badge classes: running, ready, spinning, blocked/parked/sleeping, done/finished.
- `note:` for the red warning box at the step where the bug/race manifests.

## Dependencies

### Internal
- `renderer.js` `inlineFormat` for `[[링크]]` inside step descriptions.

<!-- MANUAL: -->
