'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Eye, EyeOff, Heart, Wallet as WalletIcon, Megaphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/components/LocaleProvider';
import MakeDepositModal from './MakeDepositModal';

interface WalletProps {
  balance: number;
  title?: string;
  depositLink?: string;
  sadaqahScore?: number;
  /** Label du rang (ex. Argent, Platine) */
  rank?: string;
  /** URL du badge du rang (ex. /badges/argent.png) */
  rankBadge?: string;
  donationsCount?: number;
  spentAmount?: number;
  campaignsCount?: number;
  seeAllLink?: string;
}

export default function Wallet({ 
  balance, 
  title, 
  depositLink = '/portefeuille',
  sadaqahScore = 320,
  rank = 'Argent',
  rankBadge,
  donationsCount = 12,
  spentAmount = 125000,
  campaignsCount = 15,
  seeAllLink = '/profil/scores'
}: WalletProps) {
  const t = useTranslations('home.wallet');
  const { locale } = useLocale();
  const localeCode = locale === 'en' ? 'en-GB' : 'fr-FR';
  const displayTitle = title ?? t('mainAccount');
  const [showBalance, setShowBalance] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  const publicPrefix = '';
  const defaultBadge = '/icons/Group 1000003179.png';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="rounded-3xl p-6 space-y-6 bg-gradient-to-r from-[#8FC99E] to-[#20B6B3]"
    >
      {/* Compte principal */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <img 
            src="/icons/wallet-card(1).png" 
            alt="Wallet" 
            className="w-10 h-10 object-contain rounded-3xl p-2"
            style={{ backgroundColor: 'rgba(16, 25, 25, 0.2)' }}
          />
          <h3 className="text-white font-semibold">{displayTitle}</h3>
        </div>
        <div className="flex items-center space-x-2 mb-4 ml-5">
          <span className="text-4xl font-bold text-white">
            {showBalance ? `${balance.toLocaleString(localeCode)} F CFA` : '* * * * * *'}
          </span>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="text-white/80 hover:text-white transition-colors"
          >
            {showBalance ? <EyeOff size={24} /> : <Eye size={24} />}
          </button>
        </div>
        
        {/* Bouton Déposer de l'argent */}
        <motion.button
          onClick={() => setShowDepositModal(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-white text-[#00644D] px-4 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 mb-6"
        >
          <img 
            src="/icons/wallet-send-vertical(1).png" 
            alt={t('depositAlt')} 
            className="w-5 h-5 object-contain"
          />
          <span>{t('deposit')}</span>
        </motion.button>
      </div>

      {/* Mes sadaka scores */}
      <h4 className="text-[#101919] font-bold mb-3">{t('mySadaqahScores')}</h4>
      <div className="border-t border-white/20 pt-6 flex justify-between">
        <div className="flex items-center space-x-2 mb-3">
          <img 
            src="/icons/medal-star.png" 
            alt="Score actuel" 
            className="w-10 h-10 object-contain mr-2 rounded-3xl p-2"
            style={{ backgroundColor: 'rgba(16, 25, 25, 0.2)' }}
          />
          <div>
            <p className="text-white/80 text-sm">{t('currentScore')}</p>
            <p className="text-2xl font-bold text-white">{sadaqahScore} {t('points')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-white/20 rounded-2xl px-3 py-2">
          <img 
            src={rankBadge ? `${publicPrefix}${rankBadge}` : defaultBadge} 
            alt={rank} 
            className="w-12 h-12 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).src = defaultBadge; }}
          />
          <div className="rounded-lg px-3 py-2">
            <p className="text-[#101919] text-xs">{t('rank')}</p>
            <p className="text-[#101919] font-semibold">{rank}</p>
          </div>
        </div>
      </div>

      {/* Impact de vos dons */}
      <div className="border-t border-white/20 pt-6">
        <h4 className="text-[#101919] font-bold mb-4">{t('impactTitle')}</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-[#00644D]/20 rounded-2xl px-3 py-2">
            <div className="flex items-center space-x-2">
              <Heart size={18} className="text-white" />
              <span className="text-[#101919]">{t('donations')}</span>
            </div>
            <span className="text-white font-semibold">{donationsCount}</span>
          </div>
          <div className="flex items-center justify-between bg-[#00644D]/20 rounded-2xl px-3 py-2">
            <div className="flex items-center space-x-2">
              <WalletIcon size={18} className="text-white" />
              <span className="text-[#101919]">{t('spent')}</span>
            </div>
            <span className="text-white font-semibold">{spentAmount.toLocaleString(localeCode)}</span>
          </div>
          <div className="flex items-center justify-between bg-[#00644D]/20 rounded-2xl px-3 py-2">
            <div className="flex items-center space-x-2">
              <Megaphone size={18} className="text-white" />
              <span className="text-[#101919]">{t('campaigns')}</span>
            </div>
            <span className="text-white font-semibold">{campaignsCount}</span>
          </div>
        </div>
      </div>

      {/* Bouton Voir tout */}
      <div className="flex justify-center">
        <Link href={seeAllLink}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white text-[#101919] px-4 py-2 rounded-2xl font-medium text-sm w-fit"
          >
            {t('seeAll')}
          </motion.button>
        </Link>
      </div>

      {/* Modal de dépôt */}
      <MakeDepositModal 
        isOpen={showDepositModal} 
        onClose={() => setShowDepositModal(false)} 
      />
    </motion.div>
  );
}
