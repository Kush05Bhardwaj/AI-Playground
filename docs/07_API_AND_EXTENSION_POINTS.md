# API and Extension Points

## MVP: no remote API

Core learning activities run in the browser. The application does not call an external LLM or transmit experiment points to a service. This is deliberate: the first project is a hands-on ML demo, not an AI wrapper.

## Optional future API

Only implement a service when an advanced model or classroom management needs it. Example endpoints:

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/v1/activities` | Fetch curated activity definitions |
| GET | `/api/v1/activities/{id}` | Fetch one activity version |
| POST | `/api/v1/experiments/validate` | Validate a bounded experiment payload (optional) |
| POST | `/api/v1/models/train` | Train only supported model types with limits (advanced phase) |
| GET | `/api/v1/health` | Service health check |

## Future model service contract

Request should contain dataset shape, feature/label declaration, deterministic split configuration, selected algorithm, bounded hyperparameters, and a request ID. Response should include algorithm/version, predictions on the declared evaluation split, metrics, train/test counts, warnings, and a reproducibility seed. Do not accept arbitrary Python, pickles, shell commands, or user-provided model files.

## Service safeguards

- Maximum payload sizes and row/column counts.
- Allowlist of algorithm IDs and parameter ranges.
- Per-request CPU/memory/time limits.
- Rate limiting and request-size validation.
- No logging of raw dataset rows by default.
- Authentication and authorization if classroom accounts are introduced.
- Do not persist student data without a documented need and review.

## AI explanation extension (not MVP)

An optional language model may explain a rule or metric, but computed predictions and metrics must remain the source of truth. Pass only bounded, non-identifying facts such as a decision path or confusion counts. The model must not invent performance values. Display the deterministic explanation even if an LLM is unavailable, and label generated explanations as assistance rather than authoritative grading.
