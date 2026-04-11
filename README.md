# Aniamemoria Project Rebuild & Standardization

## Project State
This repository is currently undergoing a phased architectural rebuild using the **Strangler Fig Pattern**. 
The original implementation consists of low-trust legacy code (huge monolithic script files, coupled state and DOM manipulation, forced reflows, etc.).

**Important Rule:** The legacy code is treated as low-trust and strictly as a reference for business requirements. We are NOT patching or maintaining the legacy architecture. We are rewriting subsystems cleanly from scratch, starting with the `app kernel` and `people.js` filters.

## Development Foundation

- **ESLint**: Configured to catch syntactical errors and enforce basic formatting rules on pristine code.
- **Playwright**: Included for essential E2E smoke tests. Protects core interactions such as initial URL filtering and layout preservation across Chrome, Safari, and Firefox.
- **GitHub Actions**: Configured to run Linting and Playwright test suites on every `push` or `pull_request` to `main`.

## Contribution Guidelines & Commit Message Policy

Per instructions from the project lead, the previous maintainer produced heavily bugged code, ignored deadlines by 90%, and caused severe death marches.
