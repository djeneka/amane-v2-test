'use client';

import { motion } from 'framer-motion';
import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermesConditionsPage() {
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
              <FileText size={48} className="text-white/90" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Termes et conditions
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Conditions générales d&apos;utilisation de la plateforme Amane+
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
              <h2 className="text-xl font-semibold text-white mb-3">1. Objet et acceptation</h2>
              <p>
                Les présentes conditions générales d&apos;utilisation (CGU) régissent l&apos;accès et l&apos;utilisation de la plateforme Amane+, ses services (dons, Zakat, Takaful, investissements) et contenus. En créant un compte ou en utilisant nos services, vous acceptez sans réserve les présentes CGU.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">2. Services proposés</h2>
              <p>
                Amane+ propose des services de finance participative et éthique conformes aux principes de la finance islamique : collecte et versement de dons et Zakat, souscription à des produits Takaful, et participation à des projets d&apos;investissement halal. L&apos;accès à certains services peut être conditionné à une inscription et une vérification d&apos;identité.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">3. Compte utilisateur</h2>
              <p>
                Vous vous engagez à fournir des informations exactes et à maintenir la confidentialité de vos identifiants. Vous êtes responsable des activités réalisées depuis votre compte. Amane+ se réserve le droit de suspendre ou clôturer un compte en cas de manquement aux présentes CGU ou à la réglementation en vigueur.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">4. Engagements et responsabilités</h2>
              <p>
                Les opérations effectuées sur la plateforme (dons, versements, souscriptions, investissements) engagent votre responsabilité. Amane+ s&apos;efforce d&apos;assurer la disponibilité et la sécurité du service mais ne peut être tenu responsable des dommages indirects, des interruptions de service ou des actes de tiers. Les investissements comportent un risque de perte en capital.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">5. Propriété intellectuelle</h2>
              <p>
                L&apos;ensemble des éléments de la plateforme (textes, visuels, marques, logiciels) est protégé par le droit de la propriété intellectuelle. Toute reproduction ou utilisation non autorisée est interdite sans accord préalable d&apos;Amane+.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">6. Modifications et droit applicable</h2>
              <p>
                Amane+ peut modifier les présentes CGU. Les utilisateurs seront informés des changements significatifs ; la poursuite de l&apos;utilisation du service vaut acceptation des nouvelles conditions. Les CGU sont régies par le droit applicable au siège d&apos;Amane+ ; tout litige sera soumis aux tribunaux compétents.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">7. Contact</h2>
              <p>
                Pour toute question relative aux présentes conditions : contact@amane-plus.com ou via la page <Link href="/contact" className="text-[#5AB678] hover:underline">Contact</Link>.
              </p>
            </div>

            <p className="text-sm text-white/60 pt-4">
              Dernière mise à jour : février 2025.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
