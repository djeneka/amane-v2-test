'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Shield, Users, Star, CheckCircle, Heart, Car, Home, User,
  FileText, Apple, Play
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import MakeDonationModal from '@/components/MakeDonationModal';
import { getTakafulPlanById, type TakafulPlan } from '@/services/takaful-plans';

const DEFAULT_TAKAFUL_IMAGE = '/images/no-picture.png';

function getDisplayCategory(plan: TakafulPlan): string {
  const c = plan.categories || [];
  if (c.some((x) => x === 'HEALTH')) return 'Santé';
  if (c.some((x) => x === 'HOME')) return 'Habitation';
  if (c.some((x) => x === 'FAMILY')) return 'Vie';
  if (c.some((x) => x === 'AUTO' || x === 'AUTOMOBILE')) return 'Automobile';
  return 'Autre';
}

const categoryColors: Record<string, string> = {
  Santé: 'bg-green-500',
  Automobile: 'bg-blue-500',
  Habitation: 'bg-purple-500',
  Vie: 'bg-orange-500',
  Autre: 'bg-gray-500',
};

export default function TakafulDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] ?? '' : (typeof params?.id === 'string' ? params.id : '');
  const [plan, setPlan] = useState<TakafulPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTakafulModal, setShowTakafulModal] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setPlan(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getTakafulPlanById(id)
      .then((p) => {
        if (!cancelled) {
          setPlan(p ?? null);
          if (!p) setError('Produit non trouvé');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message ?? 'Erreur lors du chargement');
          setPlan(null);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactAmount = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M F CFA`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K F CFA`;
    return formatAmount(amount);
  };

  const handleSubscribe = () => setShowTakafulModal(true);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to left, #101919, #00644D)' }}>
        <div className="text-white/80">Chargement du produit...</div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to left, #101919, #00644D)' }}>
        <div className="text-center text-white px-4">
          <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
          <p className="text-white/80 mb-6">Le produit que vous recherchez n'existe pas ou a été supprimé.</p>
          <Link href="/takaful" className="text-green-400 hover:text-green-300 font-medium underline">
            Retour aux produits
          </Link>
        </div>
      </div>
    );
  }

  const displayCategory = getDisplayCategory(plan);
  const planImage = plan.picture && plan.picture.trim() ? plan.picture : DEFAULT_TAKAFUL_IMAGE;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to left, #101919, #00644D)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-20 left-20 w-32 h-32 bg-green-200/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ x: [0, -80, 0], y: [0, 100, 0], rotate: [360, 180, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute top-40 right-32 w-24 h-24 bg-indigo-200/20 rounded-full blur-xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center space-x-4 mb-8">
          <Link href="/takaful">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 text-white hover:text-green-200 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Retour aux produits</span>
            </motion.button>
          </Link>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="w-full h-[550px] relative overflow-hidden rounded-3xl">
              <img
                src={planImage}
                alt={plan.title}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_TAKAFUL_IMAGE; }}
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          </motion.div>

          {/* Détails */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#101919]/40 backdrop-blur-sm rounded-3xl p-8 space-y-8 flex flex-col"
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${categoryColors[displayCategory] ?? categoryColors.Autre}`}>
                  {displayCategory}
                </span>
                <div className="flex items-center space-x-2 text-yellow-500">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} />
                  <span className="text-white text-sm ml-1">(4.8)</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-white">{plan.title}</h1>
              <p className="text-xl text-white/80 leading-relaxed">{plan.description}</p>
            </div>

            {/* Cotisation mensuelle */}
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-bold text-white">
                  {formatCompactAmount(plan.monthlyContribution ?? 0)}
                </p>
                <p className="text-white/80">cotisation mensuelle</p>
              </div>
              {plan._count?.subscriptions != null && (
                <div className="flex items-center space-x-2 text-sm">
                  <Users size={16} className="text-green-400" />
                  <span className="text-white/80">Souscriptions:</span>
                  <span className="font-semibold text-white">{plan._count.subscriptions}</span>
                </div>
              )}
            </div>

            {/* Avantages (benefits) */}
            {(plan.benefits?.length ?? 0) > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Avantages inclus</h3>
                <div className="space-y-3">
                  {plan.benefits!.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center space-x-3"
                    >
                      <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                      <span className="text-white/90">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Garanties */}
            {(plan.guarantees?.length ?? 0) > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Garanties</h3>
                <ul className="space-y-2">
                  {plan.guarantees!.map((g, index) => (
                    <li key={index} className="flex items-center space-x-3 text-white/90">
                      <Shield size={18} className="text-green-400 flex-shrink-0" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Documents requis */}
            {(plan.requiredDocuments?.length ?? 0) > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Documents requis</h3>
                <ul className="space-y-2">
                  {plan.requiredDocuments!.map((doc, index) => (
                    <li key={index} className="flex items-center space-x-3 text-white/90">
                      <FileText size={18} className="text-green-400 flex-shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Infos complémentaires */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Informations</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Type</span>
                  <span className="font-semibold text-white">Takaful (Mutualité islamique)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Conformité</span>
                  <span className="font-semibold text-green-400">100% Halal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Support client</span>
                  <span className="font-semibold text-white">24/7</span>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubscribe}
              className="mt-auto bg-gradient-to-r from-[#8FC99E] to-[#20B6B3] text-white px-8 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-2 w-full"
            >
              <Shield size={20} />
              <span>Souscrire maintenant</span>
            </motion.button>
          </motion.div>
        </div>
      </div>

      <MakeDonationModal
        isOpen={showTakafulModal}
        onClose={() => setShowTakafulModal(false)}
        title="Takaful"
        subtitle="Montant du produit takaful"
        description="Veuillez saisir le montant du produit takaful."
        amountSectionTitle="Montant du produits takaful"
        confirmationTitle="Veuillez confirmer votre transaction"
        confirmationDescription="Vérifiez les informations avant de confirmer votre souscription."
        recapTitle="Vous allez payer la somme de"
        recapMessage="Sur amane+ souscrivez a des produits takafuls halal."
        successTitle="Souscription confirmée !"
        successMessage="Votre souscription a été effectuée avec succès."
        historyButtonText="Consulter l'historique"
        historyButtonLink="/transactions"
      />

      <section className="py-20 relative z-10" style={{ background: 'linear-gradient(to top, #d6fcf6, #229693)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img src="/images/phone.png" alt="App Mobile" className="rounded-2xl w-full h-full object-cover" />
            </div>
            <div>
              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
                <h2 className="text-3xl lg:text-6xl font-extrabold mb-6 text-[#00644d]">
                  Emportez Amane+ partout avec vous
                </h2>
                <p className="text-lg text-white/80 mb-8 leading-relaxed">
                  Retrouvez toutes les fonctionnalités d'Amane+ dans une seule application.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-black text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center space-x-2">
                    <Apple size={24} />
                    <span>App Store</span>
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-black text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center space-x-2">
                    <Play size={24} />
                    <span>Google Play</span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
