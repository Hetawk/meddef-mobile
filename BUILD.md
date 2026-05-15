# Building MedDef for Android (EAS)

The default Play Store artifact is an **AAB** (Android App Bundle). For sideloading or hosting an installable file, use an **APK** by setting `android.buildType` to `"apk"` in [`eas.json`](./eas.json) (see [Build APKs for devices](https://docs.expo.dev/build-reference/apk/)).

## One-time setup

```bash
cd meddef_mobile
npm install
npx eas-cli login
npx eas-cli build:configure
```

Linking `build:configure` adds an EAS project id to `app.json` / `app.config` (safe to commit; not a secret).

## Cloud build (recommended)

Needs an Expo account. For CI or unattended runs, set **`EXPO_TOKEN`** (create at [expo.dev/accounts/[account]/settings/access-tokens](https://expo.dev)).

```bash
cd meddef_mobile
npx eas-cli build -p android --profile preview --non-interactive
```

Artifacts appear on the Expo dashboard; download the **.apk** and place it where your site expects it (e.g. `next-meddef/public/downloads/meddef.apk`). Default EAS output is not under `meddef_mobile/dist` unless you add a custom post-build step.

## Local build (`--local`)

Requires Docker and a working Android build toolchain. On this machine, **local EAS was not attempted** because Docker/`eas` were not available globally—use cloud build above or install [Docker](https://docs.docker.com/get-docker/) and run:

```bash
npx eas-cli build -p android --profile preview --non-interactive --local
```

## Large APKs in Git

If the APK is **over ~50 MB**, avoid committing it: use **GitHub Releases** (or similar), then point the site download button to that release URL instead of `public/downloads/meddef.apk`.
