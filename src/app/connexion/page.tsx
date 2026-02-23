"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import ConnexionContent from "./ConnexionContent";

export default function Page() {
  const t = useTranslations('connexion');
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#101919] text-white">{t('loading')}</div>}>
      <ConnexionContent />
    </Suspense>
  );
}
