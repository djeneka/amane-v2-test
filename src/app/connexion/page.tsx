"use client";

import { Suspense } from "react";
import ConnexionContent from "./ConnexionContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ConnexionContent />
    </Suspense>
  );
}
