'use client';

import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-[#0B302F]">
      <section
        className="relative text-white overflow-hidden py-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/contact/confi.png)' }}
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
              <Shield size={48} className="text-white/90" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Politique de confidentialité
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Comment Amane+ collecte, utilise et protège vos données personnelles
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
              <h2 className="text-xl font-semibold text-white mb-3">1. Données collectées</h2>
              <p>
                Nous collectons les informations que vous nous fournissez lors de l&apos;inscription et de l&apos;utilisation de nos services : identité, coordonnées, données de transaction et d&apos;investissement, dans le respect des finalités du service et de la réglementation en vigueur.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">2. Utilisation des données</h2>
              <p>
                Vos données sont utilisées pour gérer votre compte, exécuter vos opérations (dons, Zakat, Takaful, investissements), vous envoyer les informations nécessaires au service, améliorer notre plateforme et respecter nos obligations légales et réglementaires.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">3. Protection et sécurité</h2>
              <p>
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou altération, conformément aux bonnes pratiques et à la réglementation applicable.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">4. Vos droits</h2>
              <p>
                Vous disposez d&apos;un droit d&apos;accès, de rectification, de limitation du traitement et, dans les cas prévus par la loi, d&apos;opposition et de suppression de vos données. Vous pouvez exercer ces droits en nous contactant ou via votre espace profil.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">5. Contact</h2>
              <p>
                Pour toute question relative à cette politique ou à vos données personnelles, contactez-nous à : contact@amane-plus.com ou via la page <Link href="/contact" className="text-[#5AB678] hover:underline">Contact</Link>.
              </p>
            </div>

            <p className="text-sm text-white/60 pt-4">
              Dernière mise à jour : février 2025. Amane+ se réserve le droit d&apos;adapter cette politique ; les changements significatifs vous seront communiqués.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
