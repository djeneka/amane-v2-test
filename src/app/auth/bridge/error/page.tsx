import Link from 'next/link';

export const dynamic = 'force-dynamic';

const MESSAGES: Record<string, string> = {
  missing_st:
    'Lien incomplet ou session introuvable. Utilisez le bouton dans l’application Amane pour ouvrir le portail.',
  expired:
    'Ce lien a expiré ou a déjà été utilisé. Rouvrez le portail depuis l’application.',
  config: 'Le portail web n’est pas correctement configuré. Contactez le support.',
  server: 'Une erreur technique est survenue. Réessayez plus tard ou depuis l’application.',
};

export default async function PortalBridgeErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const key = reason && MESSAGES[reason] ? reason : 'server';
  const text = MESSAGES[key];

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-lg font-semibold text-neutral-900">Connexion au portail</h1>
      <p className="text-sm text-neutral-700">{text}</p>
      <div className="flex flex-wrap justify-center gap-4 text-sm">
        <Link href="/connexion" className="text-emerald-700 underline underline-offset-2">
          Se connecter sur le web
        </Link>
        <Link href="/" className="text-neutral-600 underline underline-offset-2">
          Accueil
        </Link>
      </div>
    </div>
  );
}
