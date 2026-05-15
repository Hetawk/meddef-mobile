# MedDef Mobile

Cross-platform (iOS + Android) client for **[next-meddef](../next-meddef)**. Same information architecture as the web app: **Overview**, **Inference** (`/api/infer`), **LLMShield** (`/api/infer-text`), **Datasets**, **Models**, **Results** (`/api/evaluations`).

Built with **Expo (React Native)** + **TypeScript**. Image preprocessing (224² tensor, dataset mean/std) matches the Next.js inference page so ONNX requests are compatible.

## Setup

```bash
cd meddef_mobile
npm install
npx expo start
```

Then open in **Expo Go** (scan QR) or run `i` / `a` for simulator.

## API

Default origin is **https://meddef.ekddigital.com** (`src/config/api.ts`). Optional dev overrides persist in AsyncStorage (`STORAGE_KEY_API_BASE` in `src/config/app.ts`).

Inference and LLMShield need the API reachable from the device; ONNX is not bundled on the phone.

**React Native (Expo)** over Flutter here: the UI is a thin shell over existing **HTTP + JSON** APIs, matches your **React/Next** stack, and uses one **JS/TS** toolchain with Node already in the repo. Flutter would be equally fine if you prefer Dart widgets—the architecture (tabs + API client + shared constants) stays the same.
