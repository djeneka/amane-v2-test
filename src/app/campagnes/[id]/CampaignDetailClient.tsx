'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Heart, Users, MapPin, Calendar, ArrowRight, Play, Target,
  Droplets, BookOpen, UtensilsCrossed, CheckCircle2, Apple
} from 'lucide-react';
import MakeDonationModal from '@/components/MakeDonationModal';
import { useAuth } from '@/contexts/AuthContext';
import type { Campaign } from '@/data/mockData';

const TOAST_DURATION_MS = 4000;

interface CampaignDetailClientProps {
  campaign: Campaign;
  /** Nombre de donateurs (API statistics). Par défaut 0. */
  donorCount?: number;
}

export default function CampaignDetailClient({ campaign, donorCount = 0 }: CampaignDetailClientProps) {
  const { user, accessToken, isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const walletBalance = user?.wallet?.balance ?? 610473;
  const progress = campaign.targetAmount > 0 ? (campaign.currentAmount / campaign.targetAmount) * 100 : 0;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const presetAmounts = [1000, 2500, 5000, 10000, 25000, 50000];

  const handleDonateClick = () => {
    if (!isAuthenticated || !user) {
      setToastMessage('Veuillez vous connecter pour faire un don.');
      setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
      return;
    }
    setShowDonationModal(true);
  };

  const categoryLabels: Record<string, string> = {
    'urgence': 'Urgence',
    'education': 'Éducation',
    'sante': 'Santé',
    'developpement': 'Développement',
    'refugies': 'Réfugiés',
    'nourriture': 'Nourriture',
  };

  const getCategoryLabel = (category: string) => {
    return categoryLabels[category.toLowerCase()] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  const impactStats = [
    { icon: Users, value: donorCount.toLocaleString('fr-FR'), label: 'Donateurs' },
    // { icon: UtensilsCrossed, value: '+12 000', label: 'Repas' },
    // { icon: Droplets, value: '+15', label: 'Puits' },
  ];


  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #0d4d3d, #001a14)' }}>
      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-20 w-32 h-32 bg-green-200/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, -80, 0],
            y: [0, 100, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-40 right-32 w-24 h-24 bg-indigo-200/10 rounded-full blur-xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* En-tête avec titre et fil d'Ariane */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">Dons</h1>
          <nav className="text-sm">
            <Link href="/">
              <span className="text-gray-300 hover:text-white transition-colors">Accueil</span>
            </Link>
            <span className="text-gray-300 mx-2">/</span>
            <Link href="/campagnes">
              <span className="text-gray-300 hover:text-white transition-colors">Dons</span>
            </Link>
            <span className="text-gray-300 mx-2">/</span>
            <span className="text-green-400">Détails</span>
          </nav>
        </motion.div>

        {/* Layout principal : Image à gauche, Détails à droite */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image de gauche */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative h-[500px] lg:h-[600px] rounded-3xl overflow-hidden">
              {showVideo && campaign.video ? (
                <video
                  src={campaign.video}
                  className="w-full h-full object-cover"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={campaign.images?.[selectedImage] || campaign.image || '/images/no-picture.png'}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
              )}
              
              {campaign.video && !showVideo && (
                <button
                  onClick={() => setShowVideo(true)}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white transition-colors"
                  title="Lire la vidéo"
                >
                  <Play size={24} className="text-gray-700" />
                </button>
              )}
            </div>

            {/* Note de traçabilité en bas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-6 bg-[#101919]/30 backdrop-blur-sm rounded-2xl p-4 flex items-center space-x-3"
            >
              <CheckCircle2 size={24} className="text-green-400 flex-shrink-0" />
              <p className="text-white text-sm">
                Vos dons sont 100% traçables et utilisés pour les bénéficiaires.
              </p>
            </motion.div>
          </motion.div>

          {/* Section détails à droite */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {/* Bloc principal des détails */}
            <div className="bg-[#00644d]/10 backdrop-blur-sm rounded-3xl p-6 lg:p-8">
              {/* Catégorie en haut à droite */}
              <div className="flex justify-start mb-4">
                <p className="text-white text-sm font-medium">
                  <span className="text-green-400 font-bold">Catégorie : </span>
                  {getCategoryLabel(campaign.category)}
                </p>
              </div>

              {/* Titre en majuscules */}
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4 uppercase leading-tight">
                {campaign.title}
              </h2>

              {/* Localisation */}
              <div className="flex items-center space-x-2 mb-6">
                <MapPin size={20} className="text-green-400" />
                <span className="text-white">{campaign.location}</span>
              </div>

              {/* Barre de progression */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white text-sm lg:text-base">
                    {formatAmount(campaign.currentAmount)} collectés / {formatAmount(campaign.targetAmount)}
                  </span>
                  <span className="text-green-400 text-sm font-medium">
                    {donorCount.toLocaleString('fr-FR')} donateurs
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600"
                  />
                </div>
              </div>

              {/* Description */}
              <p className="text-white/90 mb-6 leading-relaxed">
                {campaign.description}
              </p>

              {/* Section "Pourquoi donner?" */}
              <div className="mb-6">
                <div className="bg-[#101919]/50 rounded-2xl p-4 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#20b6b3] rounded-full flex items-center justify-center flex-shrink-0">
                    <Target size={20} className="text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-semibold mb-2">Pourquoi donner?</span>
                    <p className="text-white/80 text-sm leading-relaxed">
                      Parce qu'un petit geste peut changer une vie. Votre don a un impact direct et immédiat sur les bénéficiaires.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section "Impact de votre don" */}
              <div className="mb-6">
                <h3 className="text-white font-bold mb-4">Impact de votre don</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-white/90">10 000 F = 1 mois de repas pour un enfant</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Droplets size={16} className="text-blue-400 mt-1.5 flex-shrink-0" />
                    <span className="text-white/90">50 000 F = accès à l'eau potable pour 1 famille</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <BookOpen size={16} className="text-green-400 mt-1.5 flex-shrink-0" />
                    <span className="text-white/90">20 000 F = fournitures scolaires pour 5 enfants</span>
                  </li>
                </ul>
              </div>

              {/* Statistiques d'impact */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {impactStats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="bg-[#101919]/50 rounded-2xl p-4 text-center"
                  >
                    <stat.icon size={24} className="text-green-400 mx-auto mb-2" />
                    <p className="text-white font-bold text-lg mb-1">{stat.value}</p>
                    <p className="text-white/80 text-xs">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Bouton Donner */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDonateClick}
                className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center space-x-3 transition-all duration-200"
                style={{ background: 'linear-gradient(to right, #3AE1B4, #13A98B)' }}
              >
                <span>Donner</span>
                <Image 
                  src="/icons/hand-coin(2).png" 
                  alt="Donner" 
                  width={24} 
                  height={24} 
                  className="object-contain"
                />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
      {/* Section "Emportez Amane+ partout avec vous" */}
      <section className="py-20" style={{ background: 'linear-gradient(to top, #d6fcf6, #229693)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="/images/phone.png"
                alt="App Mobile"
                className="rounded-2xl w-full h-full object-cover"
              />
            </div>
            <div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl lg:text-6xl font-extrabold mb-6 text-[#00644d]">
                  Emportez Amane+ partout avec vous
                </h2>
                <p className="text-lg text-white/80 mb-8 leading-relaxed">
                Retrouvez toutes les fonctionnalités d’Amane+ dans une seule application. Faites vos dons, suivez vos rendements, automatisez votre Zakat et participez à des actions solidaires, où que vous soyez.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-black text-white px-6 py-4 rounded-xl font-semibold hover:bg-gray-900 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Apple size={24} />
                    <span>Disponible sur l'App Store</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-black text-white px-6 py-4 rounded-xl font-semibold hover:bg-gray-900 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Play size={24} />
                    <span>Télécharger sur Google Play</span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Toast : utilisateur non connecté */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl text-white font-medium shadow-lg"
            style={{ background: 'linear-gradient(90deg, #8DD17F 0%, #37C2B4 100%)' }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de don */}
      <MakeDonationModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        balance={walletBalance}
        campaignId={campaign.id}
        accessToken={accessToken ?? undefined}
        donorName={user?.name ?? null}
      />
    </div>
  );
} 