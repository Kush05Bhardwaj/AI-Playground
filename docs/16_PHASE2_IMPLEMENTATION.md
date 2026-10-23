# Phase 2 implementation record

## Delivered

- Dataset points can be dragged with pointer or touch input. Movement is previewed while dragging, then committed as one validated dataset edit on release. Cancellation and loading a preset discard an active preview. Keyboard arrows and inspector buttons offer non-pointer movement.
- Dataset history stores validated snapshots (maximum 50) and supports undo/redo for point changes, clear, preset changes, and restore. A new edit after undo clears the redo branch. Undo/redo use `Ctrl+Z`, `Ctrl+Shift+Z`, and `Ctrl+Y` (`Cmd` on macOS).
- Local save/restore/clear uses a versioned local-storage schema. Only configuration, point data, and activity progress are saved; results are not. A restored experiment must be trained again.
- Six guided activities use the current k-NN engine. Completion conditions are run/inspection/edit/comparison actions. The overfitting activity compares `k=1` and `k=15` and labels the training score as in-sample and potentially optimistic; a complicated boundary alone is not called proof of overfitting.
- Training and held-out scores are both calculated from real predictions. The held-out metrics and model boundary remain hidden while experiment inputs differ from the last run, including a moved-point preview. Results can become current again when undo returns exactly to the trained data and configuration.

## Data validation and privacy

History and persistence reject invalid labels, duplicate IDs, non-finite or out-of-range coordinates, oversized datasets, unsupported presets, invalid `k`, unknown activities, and malformed activity progress. Local storage exceptions and quota errors are handled. No personal fields, prediction cache, cloud sync, or remote model service is included.

## Verification

The verification commands and results are recorded in the project README after the current implementation pass. Automated tests cover the pure history, storage and activity rules, plus key workspace interactions. Physical touch hardware and screen-reader behavior have not been manually reviewed.

## Remaining limits

Only k-NN, two features, and two labels are available. Activity F depends on the deterministic noisy data producing at least one test mistake. Activities are short guided experiments, not teacher-reviewed lesson plans. Local save progress is updated when the learner explicitly saves.
