'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ScoreWallet from '@/components/ScoreWallet';
import { Heart, Wallet, Megaphone, UserPlus, Gift, User, Trophy, BarChart3, Award, Package, Calendar, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface DonationHistoryItem {
  id: number;
  type: string;
  description: string;
  date: string;
  gain: number;
}

export default function ScoresPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Données pour l'historique des dons
  const donationHistoryData: DonationHistoryItem[] = [
    { id: 1, type: 'Don', description: 'Campagne orphelins', date: '11 Sep, 2025, à 11:56', gain: 50 },
    { id: 2, type: 'Parrainage', description: 'Construction puits', date: '07 Sep, 2025, à 21:22', gain: 30 },
    { id: 3, type: 'Conversion en don', description: 'Lorem ipsum dolor sit', date: '08 Août, 2025, à 16:36', gain: -100 },
    { id: 4, type: 'Inscription', description: 'Création de compte sur Amane+', date: '29 Juin, 2025, à 09:48', gain: 20 },
    { id: 5, type: 'Conversion en don', description: 'Lorem ipsum dolor sit', date: '11 Juin, 2025, à 20:02', gain: -50 },
    { id: 6, type: 'Don', description: 'Aide aux sinistrés', date: '05 Juin, 2025, à 14:30', gain: 75 },
    { id: 7, type: 'Parrainage', description: 'Éducation enfants', date: '01 Juin, 2025, à 10:15', gain: 25 },
    { id: 8, type: 'Don', description: 'Santé communautaire', date: '28 Mai, 2025, à 18:45', gain: 100 },
    { id: 9, type: 'Conversion en don', description: 'Lorem ipsum dolor sit', date: '20 Mai, 2025, à 12:20', gain: -75 },
    { id: 10, type: 'Don', description: 'Construction école', date: '15 Mai, 2025, à 09:10', gain: 60 },
    { id: 11, type: 'Parrainage', description: 'Eau potable', date: '10 Mai, 2025, à 16:00', gain: 35 },
    { id: 12, type: 'Don', description: 'Aide alimentaire', date: '05 Mai, 2025, à 11:30', gain: 80 },
  ];

  // Calcul de la pagination
  const totalPages = Math.ceil(donationHistoryData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = donationHistoryData.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };
  // Données pour Impact de vos dons
  const impactData = [
    { icon: Heart, label: 'Dons', value: 12, color: '#00D9A5' },
    { icon: Wallet, label: 'Dépensé (F CFA)', value: 125000, color: '#00D9A5' },
    { icon: Megaphone, label: 'Campagnes', value: 15, color: '#00D9A5' },
  ];

  // Données pour Statistiques sadaka score
  const statsData = [
    { label: 'Ce mois', value: 70, color: '#00D9A5' },
    { label: 'Cette année', value: 320, color: '#00D9A5' },
    { label: 'Record', value: 512, color: '#00D9A5' },
  ];

  // Données pour Comment gagner des points
  const earningPointsData = [
    { icon: UserPlus, label: 'Parraine un ami', color: '#00D9A5' },
    { icon: Gift, label: 'Participe à une campagne', color: '#00D9A5' },
    { icon: User, label: 'Complète ton profil', color: '#00D9A5' },
  ];

  // Données pour les badges débloqués
  const badgesData = [
    { icon: Package, label: 'Solidaire', description: 'A fait un don' },
    { icon: UserPlus, label: 'Parrain', description: 'A parrainé un ami' },
    { icon: Calendar, label: 'Donateur régulier', description: 'A donné 3 mois de suite' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-[380px_1fr] gap-8">
        {/* Colonne de gauche */}
        <div className="space-y-6">
        {/* ScoreWallet */}
        <div className="w-full">
          <ScoreWallet
            totalScore={320}
            rank="Argent"
            nextLevel="Platine"
            progressToNextLevel={320}
            pointsNeeded={180}
            conversionRate={1}
          />
        </div>

        {/* Section Classement */}
        <div className="bg-[#101919]/50 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy size={24} className="text-[#00D9A5]" />
              <div>
                <p className="text-white font-medium text-sm">Tu es 12e sur 200</p>
              </div>
            </div>
            <Link href="/profil/scores/classement">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#43b48f] text-white px-4 py-2 rounded-xl font-medium text-sm flex items-center space-x-2"
              >
                <Image src="/icons/ranking.png" alt="Voir le classement" width={16} height={16} />
                <span className="font-bold">Voir le classement</span>
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Section Badges débloqués */}
        <div className="space-y-4">
          <h2 className="text-white text-xl font-semibold">Badges débloqués</h2>
          <div className="space-y-3">
            {badgesData.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#101919]/50 rounded-3xl p-2 border border-white/10 flex items-center space-x-3"
                >
                  <div className="w-12 h-12 rounded-full bg-[#00644D]/20 flex items-center justify-center flex-shrink-0">
                    <Icon size={24} className="text-[#00D9A5]" />
                  </div>
                  <div className='flex items-start justify-start space-x-3'>
                    <p className="text-white font-semibold text-sm">{badge.label}</p>
                    <p className="text-white/70 text-sm">{badge.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Colonne de droite */}
      <div className="space-y-8">
        {/* Section 1: Impact de vos dons */}
        <div>
          <h2 className="text-white text-xl font-semibold mb-4">Impact de vos dons</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {impactData.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center text-center space-y-3 bg-[#101919]/50 rounded-2xl p-2"
                >
                  <Icon size={32} className={item.color} style={{ color: item.color }} />
                  <p className="text-white text-3xl font-bold">
                    {item.label === 'Dépensé (F CFA)' 
                      ? item.value.toLocaleString('fr-FR')
                      : item.value}
                  </p>
                  <p className="text-white text-sm">{item.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Statistiques sadaka score */}
        <div className="space-y-4">
          <h2 className="text-white text-xl font-semibold">Statistiques sadaka score</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statsData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#101919]/50 rounded-2xl p-6 border border-white/10"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <p className="text-[#00D9A5] text-3xl font-bold">{item.value}</p>
                  <p className="text-white text-sm">{item.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section 3: Comment gagner des points ? */}
        <div className="space-y-4">
          <h2 className="text-white text-xl font-semibold">Comment gagner des points ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {earningPointsData.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#101919]/50 rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <Icon size={32} className={item.color} style={{ color: item.color }} />
                    <p className="text-white text-sm leading-relaxed">{item.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      </div>

      {/* Section Historique des dons */}
      <div className="space-y-4">
        <h2 className="text-white text-xl font-semibold">Historique des dons</h2>
        <div className="bg-[#101919]/50 rounded-2xl border border-white/10 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 p-4 border-b border-white/10 bg-white/10">
            <div className="text-white font-semibold text-sm">Type</div>
            <div className="text-white font-semibold text-sm">Description</div>
            <div className="text-white font-semibold text-sm">Date</div>
            <div className="text-white font-semibold text-sm text-right">Gain</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-white/10">
            {currentData.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-4 gap-4 p-4 hover:bg-[#101919]/70 transition-colors"
              >
                <div className="text-white text-sm">{item.type}</div>
                <div className="text-white text-sm">{item.description}</div>
                <div className="text-white/70 text-sm">{item.date}</div>
                <div className={`text-sm font-semibold text-right ${
                  item.gain >= 0 ? 'text-[#00D9A5]' : 'text-[#FF4D4D]'
                }`}>
                  {item.gain >= 0 ? '+' : ''}{item.gain}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-white/10">
            <div className="text-white/70 text-sm">
              Affichage {startIndex + 1} à {Math.min(endIndex, donationHistoryData.length)} sur {donationHistoryData.length}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                aria-label="Page précédente"
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === 1
                    ? 'bg-[#101919] text-white/30 cursor-not-allowed'
                    : 'bg-[#00644D] text-white hover:bg-[#005a3d]'
                }`}
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageClick(page)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-[#00644D] text-white'
                        : 'bg-[#101919] text-white/70 hover:bg-[#101919]/80'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                aria-label="Page suivante"
                title="Page suivante"
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? 'bg-[#101919] text-white/30 cursor-not-allowed'
                    : 'bg-[#00644D] text-white hover:bg-[#005a3d]'
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
