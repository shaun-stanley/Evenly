// Non-iOS platforms: no blur header background (shim).
// This file is resolved on non-iOS platforms instead of HeaderBackground.ios.tsx
// We export a no-op component placeholder to satisfy imports.
// Intentionally using `any` to avoid JSX type references in non-React host.
const Shim: any = undefined;
export default Shim;
