"use client";

import { ReactLenis } from "@studio-freight/react-lenis";

export default function SmoothScroll({ children }) {
  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 1.2, smoothWheel: true, wheelMultiplier: 1.0, touchMultiplier: 2.0 }}>
      {children}
    </ReactLenis>
  );
}
