'use client';

import { motion } from 'framer-motion';
import { ArrowLeftRight } from 'lucide-react';

interface ScoreWalletProps {
  totalScore?: number;
  rank?: string;
  nextLevel?: string;
  progressToNextLevel?: number;
  pointsNeeded?: number;
  conversionRate?: number; // 1 point = X F CFA
}

export default function ScoreWallet({ 
  totalScore = 320,
  rank = 'Argent',
  nextLevel = 'Platine',
  progressToNextLevel = 320,
  pointsNeeded = 180,
  conversionRate = 1
}: ScoreWalletProps) {
  const maxPointsForNextLevel = progressToNextLevel + pointsNeeded;
  const progressPercentage = (progressToNextLevel / maxPointsForNextLevel) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="rounded-3xl p-6 space-y-6 bg-gradient-to-r from-[#7CD0BA] to-[#2EB9B1]"
    >
      {/* Section Supérieure - Score actuel et Rang */}
      <div className="flex items-start justify-between">
        {/* Score actuel - Gauche */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-[#101919]/20 flex items-center justify-center">
            <img 
              src="/icons/medal-star.png" 
              alt="Score actuel" 
              className="w-7 h-7 object-contain"
            />
          </div>
          <div>
            <p className="text-white text-sm font-medium">Score actuel</p>
            <p className="text-white text-2xl font-bold">{totalScore.toLocaleString('fr-FR')} points</p>
          </div>
        </div>

        {/* Rang - Droite */}
        <div className="flex items-center space-x-2 bg-white/30 rounded-2xl px-4 py-3">
          <div>
            <p className="text-[#101919]/70 text-xl">Rang</p>
            <p className="text-[#00644D] text-lg font-bold">{rank}</p>
          </div>
          <img 
            src="/icons/Group 1000003179.png" 
            alt="Rang" 
            className="w-10 h-10 object-contain"
          />
        </div>
      </div>

      {/* Section Centrale - Conversion des points */}
      <div className="flex items-center justify-between gap-4">
        {/* Bouton Convertir mes points */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center space-x-2 bg-white text-[#101919] px-4 py-3 rounded-2xl font-medium text-sm whitespace-nowrap"
        >
          <ArrowLeftRight size={18} className="text-[#101919]" />
          <span>Convertir mes points</span>
        </motion.button>

        {/* Taux de conversion */}
        <div className="text-left">
          <p className="text-[#101919]/70 text-sm">1 point</p>
          <p className="text-[#101919] text-base font-bold">1 F CFA de don</p>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="space-y-2">
        <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full bg-[#00644D] rounded-full"
          />
        </div>
      </div>

      {/* Section Inférieure - Objectif */}
      <div className="text-center">
        <p className="text-[#101919] text-sm font-medium">
          Encore {pointsNeeded.toLocaleString('fr-FR')} points pour atteindre le rang {nextLevel} !
        </p>
      </div>
    </motion.div>
  );
}
