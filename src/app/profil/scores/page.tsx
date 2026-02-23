'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ScoreWallet from '@/components/ScoreWallet';
import { Heart, Wallet, Megaphone, UserPlus, Gift, User, Trophy, BarChart3, Award, Package, Calendar, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { getMyDonations, type Donation } from '@/services/donations';
import { getMyTransactions, type Transaction } from '@/services/transactions';
import { getRankForScore, getNextRank } from '@/lib/rankRules';
import { mySadaqahHistory, getMyRank, type SadaqahHistoryEntry, type RankingEntry } from '@/services/statistics';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/components/LocaleProvider';

interface DonationHistoryItem {
  id: string;
  type: string;
  description: string;
  date: string;
  gain: number;
}

function formatHistoryDate(iso: string, locale: string): string {
  try {
    const d = new Date(iso);
    const localeTag = locale === 'en' ? 'en-GB' : 'fr-FR';
    const datePart = d.toLocaleDateString(localeTag, { day: 'numeric', month: 'short', year: 'numeric' });
    const timePart = d.toLocaleTimeString(localeTag, { hour: '2-digit', minute: '2-digit' });
    return locale === 'en' ? `${datePart}, ${timePart}` : `${datePart}, à ${timePart}`;
  } catch {
    return iso;
  }
}

function sadaqahEntryToHistoryItem(entry: SadaqahHistoryEntry, locale: string, generalDonLabel: string): DonationHistoryItem {
  const type = entry.description.includes(generalDonLabel) ? generalDonLabel : 'Don';
  return {
    id: entry.id,
    type,
    description: entry.description,
    date: formatHistoryDate(entry.createdAt, locale),
    gain: entry.score,
  };
}

export default function ScoresPage() {
  const t = useTranslations('profil');
  const { locale } = useLocale();
  const { isAuthenticated, accessToken, user } = useAuth();
  const [myDonations, setMyDonations] = useState<Donation[]>([]);
  const [myTransactions, setMyTransactions] = useState<Transaction[]>([]);
  const [sadaqahHistory, setSadaqahHistory] = useState<SadaqahHistoryEntry[]>([]);
  const [sadaqahHistoryLoading, setSadaqahHistoryLoading] = useState(true);
  const [sadaqahHistoryError, setSadaqahHistoryError] = useState<string | null>(null);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [rankingLoading, setRankingLoading] = useState(true);
  const [rankingError, setRankingError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Score et rang réels (comme sur la home)
  const sadaqahScore = user?.score?.score ?? 0;
  const rankInfo = getRankForScore(sadaqahScore);
  const nextRank = getNextRank(sadaqahScore);
  const pointsToNextLevel = nextRank ? Math.max(0, nextRank.minPoints - sadaqahScore) : 0;

  // Récupération des dons et transactions (comme sur la page home)
  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setMyDonations([]);
      setMyTransactions([]);
      return;
    }
    let cancelled = false;
    getMyDonations(accessToken)
      .then((list) => {
        if (!cancelled) setMyDonations(list);
      })
      .catch(() => {
        if (!cancelled) setMyDonations([]);
      });
    return () => { cancelled = true; };
  }, [isAuthenticated, accessToken]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setMyTransactions([]);
      return;
    }
    let cancelled = false;
    getMyTransactions(accessToken)
      .then((list) => {
        if (!cancelled) setMyTransactions(list);
      })
      .catch(() => {
        if (!cancelled) setMyTransactions([]);
      });
    return () => { cancelled = true; };
  }, [isAuthenticated, accessToken]);

  // Historique sadaqah (GET /api/sadaqah-history)
  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setSadaqahHistory([]);
      setSadaqahHistoryLoading(false);
      setSadaqahHistoryError(null);
      return;
    }
    setSadaqahHistoryLoading(true);
    setSadaqahHistoryError(null);
    let cancelled = false;
    mySadaqahHistory(accessToken)
      .then((list) => {
        if (!cancelled) setSadaqahHistory(list);
      })
      .catch((err) => {
        if (!cancelled) setSadaqahHistoryError(err?.message ?? t('loadError'));
      })
      .finally(() => {
        if (!cancelled) setSadaqahHistoryLoading(false);
      });
    return () => { cancelled = true; };
  }, [isAuthenticated, accessToken]);

  // Classement (GET /api/ranking)
  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setRanking([]);
      setRankingLoading(false);
      setRankingError(null);
      return;
    }
    setRankingLoading(true);
    setRankingError(null);
    let cancelled = false;
    getMyRank({ token: accessToken })
      .then((list) => {
        if (!cancelled) setRanking(list);
      })
      .catch((err) => {
        if (!cancelled) setRankingError(err?.message ?? t('loadError'));
      })
      .finally(() => {
        if (!cancelled) setRankingLoading(false);
      });
    return () => { cancelled = true; };
  }, [isAuthenticated, accessToken]);

  // Position du user dans le classement (userId du contexte = id user)
  const myRankEntry = user?.id ? ranking.find((e) => e.userId === user.id) : null;
  const myRankPosition = myRankEntry?.rank ?? null;
  const totalInRanking = ranking.length;

  // Indicateurs d'impact (alignés sur la page home)
  const donationsCount = myDonations.length;
  const spentAmount = myTransactions
    .filter((t) => t.purpose !== 'DEPOSIT')
    .reduce((sum, t) => sum + (t.amount ?? 0), 0);
  const campaignsCount = new Set(myDonations.map((d) => d.campaignId).filter(Boolean)).size;

  // Données pour l'historique des dons (depuis mySadaqahHistory)
  const generalDonLabel = t('scoresGeneralDon');
  const donationHistoryData: DonationHistoryItem[] = sadaqahHistory.map((e) => sadaqahEntryToHistoryItem(e, locale, generalDonLabel));

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
  // Données pour Impact de vos dons (données réelles comme sur la home)
  const impactData = [
    { icon: Heart, labelKey: 'scoresDonations', value: donationsCount, color: '#00D9A5', formatNumber: false },
    { icon: Wallet, labelKey: 'scoresSpent', value: spentAmount, color: '#00D9A5', formatNumber: true },
    { icon: Megaphone, labelKey: 'scoresCampaigns', value: campaignsCount, color: '#00D9A5', formatNumber: false },
  ];

  // Statistiques sadaka score depuis mySadaqahHistory
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const scoreThisMonth = sadaqahHistory
    .filter((e) => {
      const d = new Date(e.createdAt);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    })
    .reduce((sum, e) => sum + e.score, 0);
  const scoreThisYear = sadaqahHistory
    .filter((e) => new Date(e.createdAt).getFullYear() === currentYear)
    .reduce((sum, e) => sum + e.score, 0);
  const scoreRecord = sadaqahHistory.length > 0
    ? Math.max(...sadaqahHistory.map((e) => e.score))
    : 0;

  const statsData = [
    { labelKey: 'scoresThisMonth', value: scoreThisMonth, color: '#00D9A5' },
    { labelKey: 'scoresThisYear', value: scoreThisYear, color: '#00D9A5' },
    { labelKey: 'scoresRecord', value: scoreRecord, color: '#00D9A5' },
  ];

  // Données pour Comment gagner des points
  const earningPointsData = [
    { icon: UserPlus, labelKey: 'scoresInviteFriend', color: '#00D9A5' },
    { icon: Gift, labelKey: 'scoresJoinCampaign', color: '#00D9A5' },
    { icon: User, labelKey: 'scoresCompleteProfile', color: '#00D9A5' },
  ];

  // Badges débloqués : Solidaire (≥1 don), Donateur régulier (≥1 don dans chacun des 3 derniers mois), Parrain commenté
  const hasAtLeastOneDon = sadaqahHistory.length >= 1;
  const last3Months = [0, 1, 2].map((i) => {
    const d = new Date(currentYear, currentMonth - i, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const hasDonInMonth = (year: number, month: number) =>
    sadaqahHistory.some((e) => {
      const created = new Date(e.createdAt);
      return created.getFullYear() === year && created.getMonth() === month;
    });
  const hasDonateurRegulier = last3Months.every(({ year, month }) => hasDonInMonth(year, month));

  const badgesData: { icon: typeof Package; labelKey: string; descKey: string }[] = [];
  if (hasAtLeastOneDon) {
    badgesData.push({ icon: Package, labelKey: 'scoresBadgeSolidaire', descKey: 'scoresBadgeSolidaireDesc' });
  }
  if (hasDonateurRegulier) {
    badgesData.push({ icon: Calendar, labelKey: 'scoresBadgeDonateurRegulier', descKey: 'scoresBadgeDonateurRegulierDesc' });
  }

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-[380px_1fr] gap-8">
        {/* Colonne de gauche */}
        <div className="space-y-6">
        {/* ScoreWallet */}
        <div className="w-full">
          <ScoreWallet
            totalScore={sadaqahScore}
            rank={rankInfo.label}
            rankBadge={rankInfo.badge}
            nextLevel={nextRank?.label ?? rankInfo.label}
            progressToNextLevel={sadaqahScore}
            pointsNeeded={pointsToNextLevel}
            conversionRate={1}
          />
        </div>

        {/* Section Classement */}
        <div className="bg-[#101919]/50 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy size={24} className="text-[#00D9A5]" />
              <div>
                {rankingLoading ? (
                  <p className="text-white/70 font-medium text-sm">{t('scoresRankingLoading')}</p>
                ) : rankingError ? (
                  <p className="text-red-400/90 font-medium text-sm">{rankingError}</p>
                ) : myRankPosition != null && totalInRanking > 0 ? (
                  <p className="text-white font-medium text-sm">{t('scoresYouAre', { rank: myRankPosition, total: totalInRanking })}</p>
                ) : (
                  <p className="text-white font-medium text-sm">{t('scoresNotRanked')}</p>
                )}
              </div>
            </div>
            <Link href="/profil/classement">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#43b48f] text-white px-4 py-2 rounded-xl font-medium text-sm flex items-center space-x-2"
              >
                <Image src="/icons/ranking.png" alt={t('scoresViewRanking')} width={16} height={16} />
                <span className="font-bold">{t('scoresViewRanking')}</span>
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Section Badges débloqués */}
        <div className="space-y-4">
          <h2 className="text-white text-xl font-semibold">{t('scoresBadgesUnlocked')}</h2>
          <div className="space-y-3">
            {badgesData.length === 0 ? (
              <p className="text-white/60 text-sm">{t('scoresNoBadge')}</p>
            ) : badgesData.map((badge, index) => {
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
                    <p className="text-white font-semibold text-sm">{t(badge.labelKey)}</p>
                    <p className="text-white/70 text-sm">{t(badge.descKey)}</p>
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
          <h2 className="text-white text-xl font-semibold mb-4">{t('scoresImpactTitle')}</h2>
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
                    {item.formatNumber
                      ? item.value.toLocaleString(locale === 'en' ? 'en-GB' : 'fr-FR')
                      : item.value}
                  </p>
                  <p className="text-white text-sm">{t(item.labelKey)}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Statistiques sadaka score */}
        <div className="space-y-4">
          <h2 className="text-white text-xl font-semibold">{t('scoresStatsTitle')}</h2>
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
                  <p className="text-white text-sm">{t(item.labelKey)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section 3: Comment gagner des points ? */}
        <div className="space-y-4">
          <h2 className="text-white text-xl font-semibold">{t('scoresHowToEarnTitle')}</h2>
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
                    <p className="text-white text-sm leading-relaxed">{t(item.labelKey)}</p>
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
        <h2 className="text-white text-xl font-semibold">{t('scoresHistoryTitle')}</h2>
        <div className="bg-[#101919]/50 rounded-2xl border border-white/10 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 p-4 border-b border-white/10 bg-white/10">
            <div className="text-white font-semibold text-sm">{t('scoresHistoryType')}</div>
            <div className="text-white font-semibold text-sm">{t('scoresHistoryDescription')}</div>
            <div className="text-white font-semibold text-sm">{t('scoresHistoryDate')}</div>
            <div className="text-white font-semibold text-sm text-right">{t('scoresHistoryGain')}</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-white/10">
            {sadaqahHistoryLoading ? (
              <div className="p-8 text-center text-white/70 text-sm">{t('scoresHistoryLoading')}</div>
            ) : sadaqahHistoryError ? (
              <div className="p-8 text-center text-red-400 text-sm">{sadaqahHistoryError}</div>
            ) : currentData.length === 0 ? (
              <div className="p-8 text-center text-white/70 text-sm">{t('scoresHistoryEmpty')}</div>
            ) : (
              currentData.map((item) => (
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
              ))
            )}
          </div>

          {/* Pagination */}
          {donationHistoryData.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-white/10">
            <div className="text-white/70 text-sm">
              {t('scoresDisplaying', { start: startIndex + 1, end: Math.min(endIndex, donationHistoryData.length), total: donationHistoryData.length })}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                aria-label={t('prevPageAria')}
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
                aria-label={t('nextPageAria')}
                title={t('nextPageAria')}
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
          )}
        </div>
      </div>
    </div>
  );
}
