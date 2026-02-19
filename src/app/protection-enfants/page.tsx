'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProtectionEnfantsPage() {
  return (
    <div className="min-h-screen bg-[#0B302F]">
      <section
        className="relative text-white overflow-hidden py-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/contact/terme.png)' }}
      >
        <div className="absolute inset-0 bg-[#0B302F]/80" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
              <ArrowLeft size={20} className="mr-2" />
              Retour à l&apos;accueil
            </Link>
            <div className="flex justify-center mb-4">
              <ShieldCheck size={48} className="text-white/90" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Normes de Protection des Enfants – AMANE+
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Date d&apos;entrée en vigueur : 01 février 2026 · AMANE+
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#101919] rounded-2xl border border-white/10 p-8 space-y-8 text-white/80 leading-relaxed"
          >

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">1. Engagement de AMANE+ en matière de protection des enfants</h2>
              <p className="mb-4">
                L&apos;application <strong>AMANE+</strong> applique une politique de tolérance zéro concernant toute forme d&apos;exploitation et d&apos;abus sexuels sur enfants (CSAE – <em>Child Sexual Abuse and Exploitation</em>).
              </p>
              <p className="mb-2">Nous interdisons strictement :</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Le matériel d&apos;abus sexuel sur mineurs (CSAM)</li>
                <li>Toute forme de sollicitation ou de grooming de mineurs</li>
                <li>L&apos;exploitation sexuelle d&apos;enfants</li>
                <li>La diffusion de contenus sexualisés impliquant des mineurs</li>
                <li>Tout comportement mettant en danger la sécurité d&apos;un enfant</li>
              </ul>
              <p className="mt-4">La protection des enfants constitue une priorité absolue pour AMANE+.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">2. Contenus et comportements interdits</h2>
              <p className="mb-2">Sur <strong>AMANE+</strong>, il est formellement interdit de :</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Publier, partager ou stocker du contenu impliquant l&apos;exploitation d&apos;un mineur</li>
                <li>Entrer en contact avec un mineur dans un but inapproprié</li>
                <li>Encourager ou faciliter des activités illégales impliquant des enfants</li>
                <li>Utiliser la plateforme pour harceler ou manipuler un mineur</li>
              </ul>
              <p className="mt-4">Toute violation entraîne des sanctions immédiates pouvant aller jusqu&apos;à la suppression définitive du compte.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">3. Mécanisme de signalement</h2>
              <p className="mb-4">
                AMANE+ met à disposition un système clair et accessible permettant de signaler :
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Un contenu suspect</li>
                <li>Un comportement inapproprié</li>
                <li>Une tentative d&apos;exploitation impliquant un mineur</li>
              </ul>
              <p className="mb-4">
                Les utilisateurs peuvent effectuer un signalement directement dans l&apos;application.
              </p>
              <p className="mb-2">
                Un signalement peut également être envoyé à notre équipe sécurité à l&apos;adresse suivante :
              </p>
              <p>
                <a href="mailto:infos@amane.ci" className="text-[#5AB678] hover:underline font-medium">infos@amane.ci</a>
              </p>
              <p className="mt-4">Chaque signalement est examiné avec sérieux et traité dans les meilleurs délais.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">4. Modération et mesures disciplinaires</h2>
              <p className="mb-2">AMANE+ met en place :</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Une surveillance active des contenus</li>
                <li>Une modération des contenus signalés</li>
                <li>La suspension immédiate des comptes en cas de violation</li>
                <li>L&apos;exclusion définitive en cas d&apos;infraction grave</li>
              </ul>
              <p className="mb-2">En cas d&apos;éléments crédibles liés à la CSAE, AMANE+ peut :</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Supprimer immédiatement le contenu concerné</li>
                <li>Suspendre ou supprimer le compte utilisateur</li>
                <li>Conserver les preuves conformément à la loi</li>
                <li>Signaler les faits aux autorités compétentes</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">5. Restrictions d&apos;âge</h2>
              <p>
                AMANE+ n&apos;est pas destiné aux enfants de moins de 13 ans (ou l&apos;âge minimum requis selon la législation locale).
              </p>
              <p className="mt-4">
                Si nous constatons qu&apos;un utilisateur ne respecte pas les conditions d&apos;âge, des mesures immédiates seront prises.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">6. Coopération avec les autorités</h2>
              <p>
                AMANE+ coopère pleinement avec les autorités compétentes et les organismes de protection de l&apos;enfance en cas de suspicion d&apos;abus ou d&apos;exploitation.
              </p>
              <p className="mt-4">
                Nous respectons l&apos;ensemble des lois et réglementations applicables en matière de protection des mineurs.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">7. Mise à jour des normes</h2>
              <p>
                Ces normes peuvent être mises à jour à tout moment afin de renforcer la sécurité des utilisateurs et garantir la conformité avec les exigences réglementaires et les standards de Google Play.
              </p>
            </div>

            <p className="text-sm text-white/60 pt-4">
              Date d&apos;entrée en vigueur : 19 février 2026.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
