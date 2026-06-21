"use client";

import dynamic from "next/dynamic";

// Dynamic import with ssr:false MUST live in a Client Component
// (Server Components don't support ssr:false in next/dynamic)
const Galaxy = dynamic(() => import("@/components/Galaxy"), {
  ssr: false,
  loading: () => null,
});

export default function GalaxyBackground() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        overflow: "hidden",
      }}
    >
      <Galaxy />
    </div>
  );
}
