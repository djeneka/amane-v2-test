'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Heart, Users, MapPin, Calendar, ArrowRight, Play, Target,
  Droplets, BookOpen, UtensilsCrossed, CheckCircle2, Apple, HandCoins,
  ChevronDown, CircleHelp, Leaf, Eye, X, ChevronLeft, ChevronRight,
  FileText, BarChart3
} from 'lucide-react';
import MakeDonationModal from '@/components/MakeDonationModal';
import type { PendingDonationState } from '@/components/MakeDonationModal';
import MakeDepositModal from '@/components/MakeDepositModal';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { useTranslatedCampaign } from '@/contexts/CampaignTranslationsContext';
import type { Campaign, CampaignActivity } from '@/data/mockData';

const TOAST_DURATION_MS = 4000;

interface CampaignDetailClientProps {
  campaign: Campaign;
  /** Nombre de donateurs (API statistics). Par défaut 0. */
  donorCount?: number;
}

export default function CampaignDetailClient({ campaign, donorCount = 0 }: CampaignDetailClientProps) {
  const t = useTranslations('campagnes');
  const tc = useTranslatedCampaign(campaign);
  const { user, accessToken, isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [pendingDonationState, setPendingDonationState] = useState<PendingDonationState | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<CampaignActivity | null>(null);
  const [activitySlideIndex, setActivitySlideIndex] = useState(0);
  const [impactCardsSlideIndex, setImpactCardsSlideIndex] = useState(0);

  // Réinitialiser le slide à l'ouverture du modal
  useEffect(() => {
    if (selectedActivity) setActivitySlideIndex(0);
  }, [selectedActivity]);

  // Réinitialiser le slider des cartes impact au changement de campagne
  useEffect(() => {
    setImpactCardsSlideIndex(0);
  }, [campaign.id]);

  const walletBalance = user?.wallet?.balance ?? 0;
  const progress = campaign.targetAmount > 0 ? (campaign.currentAmount / campaign.targetAmount) * 100 : 0;
  /** Pour la barre au bas de l’image : part déboursée / collectée */
  const spentRatio =
    campaign.currentAmount > 0
      ? Math.min(100, ((campaign.amountSpent ?? 0) / campaign.currentAmount) * 100)
      : 0;

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
      setToastMessage(t('loginToDonate'));
      setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
      return;
    }
    setShowDonationModal(true);
  };

  const categoryLabels: Record<string, string> = {
    'urgence': t('categoryUrgence'),
    'education': t('categoryEducation'),
    'sante': t('categorySante'),
    'developpement': t('categoryDeveloppement'),
    'refugies': t('categoryRefugies'),
    'nourriture': t('categoryOther'),
    'special-ramadan': t('categorySpecialRamadan'),
    'special-tabaski': t('categorySpecialTabaski'),
    'autres': t('categoryOther'),
  };

  const getCategoryLabel = (category: string) => {
    return categoryLabels[category.toLowerCase()] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  const typeLabels: Record<string, string> = {
    ZAKAT: t('typeZakat'),
    SADAQAH: t('typeSadaqah'),
  };
  const typeLabel = typeLabels[campaign.type?.toUpperCase?.() ?? ''] ?? campaign.type ?? t('typeSadaqah');

  const impactStats = [
    { icon: Users, value: donorCount.toLocaleString('fr-FR'), labelKey: 'donors' },
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
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">{t('breadcrumbDonations')}</h1>
          <nav className="text-sm">
            <Link href="/">
              <span className="text-gray-300 hover:text-white transition-colors">{t('breadcrumbHome')}</span>
            </Link>
            <span className="text-gray-300 mx-2">/</span>
            <Link href="/campagnes">
              <span className="text-gray-300 hover:text-white transition-colors">{t('breadcrumbDonations')}</span>
            </Link>
            <span className="text-gray-300 mx-2">/</span>
            <span className="text-green-400">{t('breadcrumbDetails')}</span>
          </nav>
        </motion.div>

        {/* Layout principal : Image pleine largeur, puis section détails en dessous */}
        <div className="flex flex-col gap-8 lg:gap-12">
          {/* Bloc image – pleine largeur */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative w-full"
          >
            {/* Bloc image campagne – design Figma : flou, overlay sombre, badges */}
            <div className="relative h-[500px] lg:h-[600px] rounded-3xl overflow-hidden">
              {showVideo && campaign.video ? (
                <video
                  src={campaign.video}
                  className="w-full h-full object-cover"
                  controls
                  autoPlay
                />
              ) : (
                <>
                  {/* Image avec flou artistique + scale pour éviter les bords blancs */}
                  <div className="absolute inset-0">
                    <img
                      src={campaign.images?.[selectedImage] || campaign.image || '/images/no-picture.png'}
                      alt={tc.title}
                      className="w-full h-full object-cover scale-105"
                    />
                  </div>
                  {/* Overlay sombre pour contraste et lisibilité des badges */}
                  <div
                    className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/35 to-black/55"
                    aria-hidden
                  />
                </>
              )}

              {/* Badge catégorie – en haut à gauche (fond sombre, icône cœur + libellé) */}
              <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-black/75 backdrop-blur-sm px-3 py-2 text-white">
                <Heart size={16} className="flex-shrink-0" strokeWidth={2} />
                <span className="text-sm font-medium">{getCategoryLabel(campaign.category)}</span>
              </div>

              {/* Badge type + bouton vidéo – en haut à droite */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {/* Bouton lecture vidéo désactivé
                {campaign.video && !showVideo && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white transition-colors"
                    title="Lire la vidéo"
                  >
                    <Play size={24} className="text-gray-700" />
                  </button>
                )}
                */}
                <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-emerald-800">
                  <HandCoins size={16} className="flex-shrink-0" />
                  <span className="text-sm font-bold">{typeLabel}</span>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Bande infos – sous l'image, marge top, fond #101919 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-2 rounded-3xl bg-[#101919] px-6 lg:px-8 py-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 mb-1">
                  {t('categoryLabel')} : <span className="text-green-400 font-semibold">{getCategoryLabel(campaign.category)}</span>
                </p>
                <h2 className="text-xl lg:text-2xl font-bold text-white uppercase leading-tight mb-3">
                  {tc.title}
                </h2>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-[#43b48f] font-bold">
                    {formatAmount(campaign.amountSpent ?? 0)} {t('disbursed')}
                  </p>
                  <p className="text-sm text-gray-300 font-bold">
                    {formatAmount(campaign.currentAmount)} {t('collected')}
                  </p>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${spentRatio}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-full rounded-full bg-[#43b48f]"
                  />
                </div>
                {campaign.duration === 'PONCTUAL' && (
                  <p className="text-sm text-white/70 mt-2 flex items-center gap-1.5">
                    <Calendar size={14} className="shrink-0 text-[#43b48f]" aria-hidden />
                    {t('endDateLabel')} : <span className="font-semibold text-white/90">{campaign.endDate ? formatDate(campaign.endDate) : t('na')}</span>
                  </p>
                )}
              </div>
              <div className="flex flex-col items-stretch lg:items-end gap-3 shrink-0">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDonateClick}
                  className="w-full px-8 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-3 transition-all duration-200"
                  style={{ background: 'linear-gradient(to right, #3AE1B4, #13A98B)' }}
                >
                  <span>{t('donate')}</span>
                  <Image
                    src="/icons/hand-coin(2).png"
                    alt=""
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </motion.button>
                <div className="rounded-2xl bg-black/30 px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#20b6b3] rounded-full flex items-center justify-center flex-shrink-0">
                      <Image src="/icons/shield-tick.png" alt="Target" width={20} height={20} className="object-contain" />
                  </div>
                  <p className="text-white text-sm">
                    {t('donationsTraceable')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section détails – en dessous */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-6 w-full"
          >
            {/* Bloc principal des détails (catégorie, titre, barre et Donner sont en bas de l’image) */}
            <div className="bg-[#00644d]/10 backdrop-blur-sm rounded-3xl p-4 lg:p-8">

              {/* Description : HTML uniquement si la chaîne contient des balises, sinon texte brut */}
              {tc.description?.includes('<') ? (
                <div
                  className="text-white/90 mb-6 leading-relaxed [&_div]:mt-2 [&_div:first-child]:mt-0 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6"
                  dangerouslySetInnerHTML={{ __html: tc.description }}
                />
              ) : (
                <p className="text-white/90 mb-6 leading-relaxed">{tc.description ?? ''}</p>
              )}
              <h3 className="text-white font-bold mb-4 text-xl">{t('ourObjective')}</h3>
              {tc.impact?.includes('<') ? (
                <div
                  className="text-white/90 mb-6 leading-relaxed [&_div]:mt-2 [&_div:first-child]:mt-0 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6"
                  dangerouslySetInnerHTML={{ __html: tc.impact }}
                />
              ) : (
                <p className="text-white/90 mb-6 leading-relaxed">{tc.impact ?? ''}</p>
              )}

              {/* Liste déroulante  */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                {[
                  {
                    id: 'beneficiaires',
                    icon: Users,
                    titleKey: 'beneficiariesTitle',
                  },
                  {
                    id: 'contribution',
                    icon: CircleHelp,
                    titleKey: 'contributionTitle',
                  },
                  {
                    id: 'decaissement',
                    iconImage: '/icons/CashOut.png',
                    titleKey: 'disbursementTitle',
                  },
                ].map((item) => {
                  const { id, titleKey } = item;
                  const isOpen = openAccordionId === id;
                  const IconComponent = 'icon' in item ? item.icon : null;
                  return (
                    <div
                      key={id}
                      className="rounded-2xl border-t-2 border-b-2 border-[#43b48f] bg-[#101919] overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenAccordionId(isOpen ? null : id)}
                        className="w-full flex items-center gap-3 px-4 py-4 text-left"
                      >
                        {IconComponent ? (
                          <IconComponent size={22} className="text-[#43b48f] shrink-0" />
                        ) : 'iconImage' in item && item.iconImage ? (
                          <Image
                            src={item.iconImage}
                            alt=""
                            width={22}
                            height={22}
                            className="shrink-0 object-contain"
                          />
                        ) : null}
                        <span className="flex-1 text-white font-medium text-sm leading-tight">
                          {t(titleKey)}
                        </span>
                        <ChevronDown
                          size={20}
                          className={`text-[#43b48f] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-0 text-white/80 text-sm border-t border-white/10">
                              {id === 'beneficiaires' ? (
                                (() => {
                                  const list = tc.beneficiariesList;
                                  return list.length > 0 ? (
                                    <ul className="space-y-2 mt-3">
                                      {list.map((label, index) => (
                                        <li key={index}>
                                          <span className="block w-full rounded-xl bg-[#1C4F40] px-4 py-3 text-white text-left">
                                            {label}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-white/70 mt-3">{t('noBeneficiaries')}</p>
                                  );
                                })()
                              ) : id === 'contribution' ? (
                                <div className="mt-3 space-y-4">
                                  <p className="text-white/80 text-sm leading-relaxed">
                                    {t('contributionText')}
                                  </p>
                                  <div className="flex flex-col gap-3">
                                    {campaign.provisionalBudget ? (
                                      <a
                                        href={campaign.provisionalBudget}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 w-full rounded-xl border-2 border-dashed border-[#43b48f] bg-[#43b48f]/5 px-4 py-3 text-[#43b48f] font-medium text-sm hover:bg-[#43b48f]/10 transition-colors"
                                      >
                                        <FileText size={22} className="shrink-0" />
                                        <span>{t('provisionalBudget')}</span>
                                      </a>
                                    ) : (
                                      <div className="flex items-center gap-3 w-full rounded-xl border-2 border-dashed border-white/20 bg-white/5 px-4 py-3 text-white/50 text-sm">
                                        <FileText size={22} className="shrink-0" />
                                        <span>{t('provisionalBudget')}</span>
                                        <span className="text-xs">{t('notAvailable')}</span>
                                      </div>
                                    )}
                                    {campaign.financialStatement ? (
                                      <a
                                        href={campaign.financialStatement}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 w-full rounded-xl border-2 border-dashed border-[#43b48f] bg-[#43b48f]/5 px-4 py-3 text-[#43b48f] font-medium text-sm hover:bg-[#43b48f]/10 transition-colors"
                                      >
                                        <BarChart3 size={22} className="shrink-0" />
                                        <span>{t('financialStatement')}</span>
                                      </a>
                                    ) : (
                                      <div className="flex items-center gap-3 w-full rounded-xl border-2 border-dashed border-white/20 bg-white/5 px-4 py-3 text-white/50 text-sm">
                                        <BarChart3 size={22} className="shrink-0" />
                                        <span>{t('financialStatement')}</span>
                                        <span className="text-xs">{t('notAvailable')}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : id === 'decaissement' ? (
                                tc.process?.trim() ? (
                                  <div
                                    className="mt-3 text-white/90 text-sm leading-relaxed [&_b]:font-semibold [&_div]:mt-2"
                                    dangerouslySetInnerHTML={{ __html: tc.process }}
                                  />
                                ) : (
                                  <p className="text-white/70 mt-3">{t('noProcess')}</p>
                                )
                              ) : (
                                <p className="text-white/70">{t('contentComing')}</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

            </div>
          </motion.div>
        </div>
      </div>

      {/* Section "L'impact de votre générosité en temps réel" */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2 mb-12"
          >
            <Leaf className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 text-[#4DE676]" aria-hidden />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center">
              {t('impactTitle')} <span className="text-red-500">❤️</span>
            </h2>
          </motion.div>

          {/* Première rangée : cartes d'activités ou message si pas encore d'impact */}
          {(() => {
            const activities = campaign.activities ?? [];
            const hasActivities = activities.length > 0;

            // Pas encore d'activités : message + icône
            if (!hasActivities) {
              return (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center justify-center py-12 px-6 rounded-2xl bg-[#1A1A1A] border border-white/10 mb-8"
                >
                  <Target className="w-14 h-14 text-white/40 mb-4" aria-hidden />
                  <p className="text-white/70 text-center text-lg font-medium">
                    {t('noImpactYet')}
                  </p>
                  <p className="text-white/50 text-center text-sm mt-1">
                    {t('impactWillAppear')}
                  </p>
                </motion.div>
              );
            }

            const renderActivityCard = (activity: CampaignActivity, i: number) => {
              const ta = tc.activities[i];
              const lines: (string | React.ReactNode)[] = [];
              if (ta?.description?.trim()) lines.push(ta.description.trim());
              if (typeof activity.amountSpent === 'number' && activity.amountSpent > 0) {
                lines.push(formatAmount(activity.amountSpent) + ' ' + t('disbursed'));
              }
              if (ta?.result?.trim()) lines.push(ta.result.trim());
              const mediaUrl =
                activity.videos?.length && activity.videos[0]
                  ? activity.videos[0]
                  : activity.images?.length && activity.images[0]
                    ? activity.images[0]
                    : campaign.images?.[i] ?? campaign.image;
              const title = ta?.title?.trim() || tc.title;
              return (
                <motion.div
                  key={activity.id ?? i}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedActivity(activity)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedActivity(activity)}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.06 * (i % 4) }}
                  className="rounded-2xl bg-[#1A1A1A] overflow-hidden flex flex-col cursor-pointer hover:ring-2 hover:ring-[#4DE676]/50 transition-shadow w-full max-w-sm mx-auto"
                >
                  <div className="p-4 flex-1">
                    <h3 className="text-white font-bold text-sm sm:text-base mb-2">{title}</h3>
                    {lines.length > 0 ? (
                      <ul className="space-y-1 text-sm text-white/90">
                        {lines.map((line, j) => (
                          <li key={j}>
                            {typeof line === 'string' && line.includes(t('disbursed')) ? (
                              <span className="text-[#4DE676]">{line}</span>
                            ) : (
                              line
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-white/70 text-sm">{t('noDetails')}</p>
                    )}
                  </div>
                  <div className="h-32 sm:h-36 relative bg-[#2a2a2a]">
                    {mediaUrl ? (
                      activity.videos?.length && activity.videos[0] === mediaUrl ? (
                        <video
                          src={mediaUrl}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          autoPlay
                          loop
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src={mediaUrl}
                          alt={title}
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
                        {t('noMedia')}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            };

            // 1 à 4 activités : cartes centrées en grille
            if (activities.length <= 4) {
              return (
                <div className="flex flex-wrap justify-center gap-4 lg:gap-5 mb-8">
                  {activities.map((activity, i) => (
                    <div key={activity.id ?? i} className="w-full sm:max-w-[280px] lg:max-w-xs flex justify-center">
                      {renderActivityCard(activity, i)}
                    </div>
                  ))}
                </div>
              );
            }

            // Plus de 4 activités : slider
            const currentIndex = Math.min(impactCardsSlideIndex, activities.length - 1);
            const currentActivity = activities[currentIndex];
            return (
              <div className="mb-8">
                <div className="relative flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setImpactCardsSlideIndex((i) => (i <= 0 ? activities.length - 1 : i - 1))}
                    className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
                    aria-label={t('activityPrevAria')}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex-1 flex justify-center min-w-0 max-w-md">
                    {currentActivity && renderActivityCard(currentActivity, currentIndex)}
                  </div>
                  <button
                    type="button"
                    onClick={() => setImpactCardsSlideIndex((i) => (i >= activities.length - 1 ? 0 : i + 1))}
                    className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
                    aria-label={t('activityNextAria')}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex justify-center gap-1.5 mt-4">
                  {activities.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImpactCardsSlideIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        idx === currentIndex ? 'bg-[#4DE676]' : 'bg-white/40 hover:bg-white/60'
                      }`}
                      aria-label={`Activité ${idx + 1}`}
                    />
                  ))}
                </div>
                <p className="text-center text-white/50 text-sm mt-2">
                  {currentIndex + 1} / {activities.length}
                </p>
              </div>
            );
          })()}

          {/* Deuxième rangée : 3 cartes avec icônes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: 'eye',
                titleKey: 'transparencyTitle',
                textKey: 'transparencyText',
                bgIcon: '#4DC6E6',
              },
              {
                icon: 'moon',
                titleKey: 'complianceTitle',
                textKey: 'complianceText',
                bgIcon: '#4DE676',
              },
              {
                icon: 'shield',
                titleKey: 'securityTitle',
                textKey: 'securityText',
                bgIcon: '#4DE676',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                className="rounded-2xl bg-[#1A1A1A] p-6 flex flex-col"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 bg-[#20b6b3] rounded-full flex items-center justify-center shrink-0"
                    
                  >
                    {item.icon === 'eye' ? (
                      <Eye className="w-6 h-6 text-white" />
                    ) : item.icon === 'moon' ? (
                      <img src="/icons/moon-w.png" alt="" className="w-6 h-6 object-contain" />
                    ) : (
                      <img src="/icons/shield-tick.png" alt="" className="w-6 h-6 object-contain" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-bold text-lg mb-2">{t(item.titleKey)}</h3>
                    <p className="text-white/90 text-sm leading-relaxed">{t(item.textKey)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Citation */}
          <motion.blockquote
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-10"
          >
            <p className="text-white/95 text-lg sm:text-xl">
              <span className="text-[#5AB678] not-italic">{t('hadithIntro')}</span>{' '}
              <span className="italic text-[#5AB678]">{t('hadithQuote')}</span>{' '}
              <span className="text-[#5AB678] not-italic">{t('hadithSource')}</span>
            </p>
          </motion.blockquote>

          {/* Bouton Donner */}
          <div className="flex justify-center">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDonateClick}
              className="w-1/3 px-8 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-3 transition-all duration-200"
              style={{ background: 'linear-gradient(to right, #3AE1B4, #13A98B)' }}
            >
              <span>{t('donate')}</span>
              <Image
                src="/icons/hand-coin(2).png"
                alt=""
                width={24}
                height={24}
                className="object-contain"
              />
            </motion.button>
          </div>
        </div>
      </section>

      {/* Section "Emportez Amane+ partout avec vous" */}
      <section className="pt-20 pb-12" style={{ background: 'linear-gradient(to top, #101919, #00644d)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <div className="h-full min-h-[280px] flex flex-col justify-end -mb-12">
              <img
                src="/images/mockup.png"
                alt="App Mobile"
                className="rounded-t-2xl w-full h-full min-h-[320px] object-cover object-top"
              />
            </div>
            <div className="text-center pb-8 lg:pb-12">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="flex flex-col items-center"
              >
                <h2 className="text-3xl lg:text-6xl font-extrabold mb-6 text-[#ffffff]">
                  {t('takeAmaneEverywhere')}
                </h2>
                <p className="text-lg text-white/80 mb-8 leading-relaxed max-w-xl">
                {t('takeAmaneDescription')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-black text-white px-6 py-4 rounded-xl font-semibold hover:bg-gray-900 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Apple size={24} />
                    <span>{t('appStore')}</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-black text-white px-6 py-4 rounded-xl font-semibold hover:bg-gray-900 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Play size={24} />
                    <span>{t('googlePlay')}</span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal détail d'activité */}
      <AnimatePresence>
        {selectedActivity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70"
            onClick={() => setSelectedActivity(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="bg-[#1A1A1A] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const selectedIndex = campaign.activities?.findIndex((a) => a === selectedActivity) ?? -1;
                const selectedTa = selectedIndex >= 0 ? tc.activities[selectedIndex] : null;
                const modalTitle = selectedTa?.title?.trim() || selectedActivity.title?.trim() || tc.title;
                return (
                  <>
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-xl font-bold text-white">
                  {modalTitle}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedActivity(null)}
                  className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label={t('closeAria')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1">
                {/* Média : slide si plusieurs éléments (vidéos + images), sinon un seul */}
                {(() => {
                  const videoUrls = selectedActivity.videos?.filter(Boolean) ?? [];
                  const imageUrls = selectedActivity.images?.filter(Boolean) ?? [];
                  type MediaItem = { type: 'video'; url: string } | { type: 'image'; url: string };
                  const mediaItems: MediaItem[] = [
                    ...videoUrls.map((url): MediaItem => ({ type: 'video', url })),
                    ...imageUrls.map((url): MediaItem => ({ type: 'image', url })),
                  ];
                  if (mediaItems.length === 0) return null;
                  const current = mediaItems[activitySlideIndex];
                  const hasMultiple = mediaItems.length > 1;
                  return (
                    <div className="relative w-full aspect-video bg-[#2a2a2a]">
                      {/* Slide actuel */}
                      {current && (
                        <div className="absolute inset-0">
                          {current.type === 'video' ? (
                            <video
                              key={current.url + activitySlideIndex}
                              src={current.url}
                              className="w-full h-full object-contain"
                              controls
                              autoPlay
                              muted={false}
                              playsInline
                            />
                          ) : (
                            <img
                              src={current.url}
                              alt=""
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>
                      )}
                      {/* Flèches si plusieurs éléments */}
                      {hasMultiple && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivitySlideIndex((i) => (i <= 0 ? mediaItems.length - 1 : i - 1));
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center z-10 transition-colors"
                            aria-label={t('previousAria')}
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivitySlideIndex((i) => (i >= mediaItems.length - 1 ? 0 : i + 1));
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center z-10 transition-colors"
                            aria-label={t('nextAria')}
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                          {/* Points indicateurs */}
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                            {mediaItems.map((_, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActivitySlideIndex(idx);
                                }}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  idx === activitySlideIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/70'
                                }`}
                                aria-label={`Slide ${idx + 1}`}
                              />
                            ))}
                          </div>
                          <span className="absolute bottom-2 right-2 text-white/80 text-xs z-10">
                            {activitySlideIndex + 1} / {mediaItems.length}
                          </span>
                        </>
                      )}
                    </div>
                  );
                })()}
                <div className="p-6 space-y-4">
                  {selectedTa?.description?.trim() && (
                    <p className="text-white/90 leading-relaxed">{selectedTa.description.trim()}</p>
                  )}
                  {typeof selectedActivity.amountSpent === 'number' && selectedActivity.amountSpent > 0 && (
                    <p className="text-[#4DE676] font-semibold">
                      {formatAmount(selectedActivity.amountSpent)} {t('disbursed')}
                    </p>
                  )}
                  {selectedTa?.result?.trim() && (
                    <p className="text-white/80 leading-relaxed">{selectedTa.result.trim()}</p>
                  )}
                </div>
              </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
        onClose={() => {
          setShowDonationModal(false);
          setPendingDonationState(null);
        }}
        balance={walletBalance}
        campaignId={campaign.id}
        accessToken={accessToken ?? undefined}
        donorName={user?.name ?? null}
        onRequestRecharge={(state) => {
          setPendingDonationState(state);
          setShowDonationModal(false);
          setShowDepositModal(true);
        }}
        initialDonationState={pendingDonationState}
      />
      <MakeDepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onSuccess={() => {
          setShowDepositModal(false);
          setShowDonationModal(true);
        }}
      />
    </div>
  );
} 