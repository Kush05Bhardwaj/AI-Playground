# Phase 5 implementation: onboarding and learning journeys

## First-use onboarding

The dismissible introduction explains the purpose of the lab, feature map, model settings, prediction explanations, and evaluation. It appears on first visit, dismisses with Escape, the close button, the final action, or clicking the backdrop, and can be reopened with **How to use AI Playground**. The dialog labels its steps, returns focus on close, and keeps Tab navigation within the dialog. A separate local-storage key records dismissal; it does not modify experiments.

## Learning journeys and persistence

Seven action-based activities are grouped into foundations, model behavior, and evaluation/reflection journeys. The page shows starter/developing difficulty, each activity objective and challenge, completion totals, and the next unfinished activity. Starting an activity shows steps, success criteria, an optional hint, and an explanation. The tree depth activity completes after runs at two distinct depths.

Existing saved activity completion and progress continue to load. Phase 4 version 2 snapshots that predate tree-depth progress are normalized with an empty depth history; version 1 snapshots keep their existing k-NN migration path. On app startup, valid saved progress hydrates the Learn page. Dismissing onboarding is separate from experiment save/restore.

## Prediction challenge and feedback

Before training, students can guess the predicted group for a held-out point, with its coordinates and current model setting shown. The answer is recorded against the current dataset and model configuration. The model's prediction is revealed only after a subsequent successful train. If data or settings change, the old guess is no longer eligible and the challenge asks for a new one. The response compares the guess with both model output and the example's actual label without grading or changing the dataset. Repeating the challenge changes no undo/redo history.

The main metrics explain in-sample training accuracy and held-out test accuracy. Existing k-NN and tree parameter descriptions remain next to the controls. Dataset counts, preset descriptions, and a complete selectable text list under the canvas help students explore overlap, noisy labels, group imbalance, sample size, and train/test roles.

## Accessibility and responsive review

Canvas point controls remain keyboard-focusable buttons with group, coordinate, and train/test labels. The SVG is exposed as a labeled group (rather than an image that could hide interactive descendants). Group identity uses both color and distinct circle/diamond shapes. The complete point list offers a text equivalent for every plotted example. Interactive controls have visible focus outlines, and the introduction supports Escape and focus containment/restoration. Touch dragging remains enabled for points.

The stylesheet stacks experiment panels and journey cards below 760 px and tightens the header/workspace at 480 px; the narrow layout supports widths down to 320 px. A headless Edge visual spot-check was made at 390 px and 1280 px. The unit/UI tests exercise rendered content and interactions, but do not calculate layout; 320/768 px visual checks, physical touch target comfort, and screen-reader announcements still need a manual browser and assistive-technology pass.

The main synchronous cost is training's 32-by-24 decision-region grid: 768 predictions are made on each training run. At the supported maximum of 1,000 examples, k-NN also ranks the training set per grid point. The complete text list can render up to 1,000 selectable rows when opened. These paths are bounded by current dataset limits, but should be profiled before increasing those limits.

## Verification

Run `npm run typecheck`, `npm test -- --maxWorkers=1`, `npm run lint`, and `npm run build`. App tests cover first-use dismissal/reopen, prediction-before-run reveal, journey grouping, keyboard map interaction, and persistence; persistence unit tests cover version 1 migration and older Phase 4 version 2 snapshots.
