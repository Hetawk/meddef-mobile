meddef_mobile npm scripts (see package.json "scripts"):
  verify          — npm run lint (TypeScript check, no emit).
  android:install — npx expo run:android after native/Android prep; installs dev build on USB device or emulator.
  android         — expo start --android (Metro + launch; not a native install).
  lint            — tsc --noEmit.
