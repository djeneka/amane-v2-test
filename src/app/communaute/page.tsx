'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, Heart, Users, MapPin, Calendar, ArrowLeft, ChevronDown,
  Apple, Play, TrendingUp, Bookmark, Star, Clock
} from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { getTakafulPlans, type TakafulPlan } from '@/services/takaful-plans';
import { takafulProducts, type Campaign, type TakafulProduct } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { getActiveCampaigns } from '@/services/campaigns';
import { getDonationsStatistics } from '@/services/statistics';
import { getActivities, type Activity } from '@/services/activities';

const DEFAULT_ACTIVITY_IMAGE = '/images/no-picture.png';
const DEFAULT_TAKAFUL_IMAGE = '/images/no-picture.png';

/** Convertit un TakafulProduct (mockData) en TakafulPlan pour affichage (si NEXT_PUBLIC_TAKAFUL_DISPLAY_PROMOTE=true) */
function mockTakafulProductToPlan(p: TakafulProduct): TakafulPlan {
  const categoryToApi: Record<string, string[]> = {
    sante: ['HEALTH'],
    automobile: ['AUTO'],
    habitation: ['HOME'],
    vie: ['FAMILY'],
  };
  return {
    id: p.id,
    title: p.name,
    picture: p.image || null,
    description: p.description,
    monthlyContribution: p.monthlyPremium,
    categories: categoryToApi[p.category] ?? [],
    benefits: p.features ?? [],
    guarantees: [],
    requiredDocuments: [],
    whyChooseThis: '',
    status: 'ACTIVE',
    startDate: '',
    endDate: '',
    createdById: '',
    createdAt: '',
    updatedAt: '',
    createdBy: { id: '', name: '', email: '' },
    _count: { subscriptions: 0 },
  };
}

export default function CommunautePage() {
  const { isAuthenticated } = useAuth();
  const t = useTranslations('communaute');
  const [currentTakafulSlide, setCurrentTakafulSlide] = useState(0);
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campaignsError, setCampaignsError] = useState<string | null>(null);
  const [donorCountByCampaignId, setDonorCountByCampaignId] = useState<Record<string, number>>({});
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentCagnotteSlide, setCurrentCagnotteSlide] = useState(0);
  const [takafulPlans, setTakafulPlans] = useState<TakafulPlan[]>([]);
  const [takafulLoading, setTakafulLoading] = useState(true);

  const takafulDisplayPromote = process.env.NEXT_PUBLIC_TAKAFUL_DISPLAY_PROMOTE === 'true';

  useEffect(() => {
    let cancelled = false;
    setCampaignsLoading(true);
    setCampaignsError(null);
    getActiveCampaigns()
      .then((list) => { if (!cancelled) setAllCampaigns(list); })
      .catch((err) => { if (!cancelled) setCampaignsError(err?.message ?? 'Erreur chargement des campagnes'); })
      .finally(() => { if (!cancelled) setCampaignsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (takafulDisplayPromote) {
      setTakafulPlans(takafulProducts.map(mockTakafulProductToPlan).slice(0, 3));
      setTakafulLoading(false);
      return;
    }
    let cancelled = false;
    setTakafulLoading(true);
    getTakafulPlans()
      .then((list) => { if (!cancelled) setTakafulPlans(list.slice(0, 3)); })
      .catch(() => { if (!cancelled) setTakafulPlans([]); })
      .finally(() => { if (!cancelled) setTakafulLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getDonationsStatistics()
      .then((stats) => {
        if (cancelled) return;
        const byId: Record<string, number> = {};
        for (const row of stats.byCampaign) {
          byId[row.campaignId] = row.count;
        }
        setDonorCountByCampaignId(byId);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setActivitiesLoading(true);
    setActivitiesError(null);
    getActivities()
      .then((result) => {
        if (cancelled) return;
        if (result.success) {
          setActivities(result.data);
          setCurrentSlide((prev) => (prev >= result.data.length ? Math.max(0, result.data.length - 1) : prev));
        } else {
          setActivitiesError(result.error);
        }
      })
      .finally(() => { if (!cancelled) setActivitiesLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const currentActivity = activities[currentSlide];
  const slideImage = currentActivity?.images?.[0] || DEFAULT_ACTIVITY_IMAGE;

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);

  const categories = [
    { id: 'urgence', name: 'Urgence', icon: Star },
    { id: 'education', name: 'Éducation', icon: Bookmark },
    { id: 'sante', name: 'Santé', icon: Heart },
    { id: 'developpement', name: 'Développement', icon: TrendingUp },
    { id: 'refugies', name: 'Réfugiés', icon: Users },
    { id: 'special-ramadan', name: 'Spécial Ramadan', iconSrc: '/icons/moon-w.png' },
    { id: 'special-tabaski', name: 'Spécial Tabaski', iconSrc: '/icons/moon-w.png' },
    { id: 'autres', name: 'Autre', icon: Star },
  ] as const;
  const categoryLabels: Record<string, string> = {
    urgence: 'Urgence', education: 'Éducation', sante: 'Santé',
    developpement: 'Développement', refugies: 'Réfugiés',
    'special-ramadan': 'Spécial Ramadan', 'special-tabaski': 'Spécial Tabaski',
    autres: 'Autre', HEALTH: 'Santé', EDUCATION: 'Éducation', FOOD: 'Alimentation', OTHER: 'Autre',
  };
  const typeLabels: Record<string, string> = { ZAKAT: 'Zakat', SADAQAH: 'Sadaqah' };

  const latestCampaigns = allCampaigns.slice(0, 3);
  const popularCampaigns = [...allCampaigns]
    .sort((a, b) => (donorCountByCampaignId[b.id] ?? 0) - (donorCountByCampaignId[a.id] ?? 0))
    .slice(0, 6);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0B302F]">
      {/* Section "Dons" - affichée uniquement s'il y a au moins 1 activité */}
      {activities.length > 0 && (
      <section className="py-32 text-white relative overflow-hidden" style={{ background: 'linear-gradient(to right, #0B302F, #101919)' }}>
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/bg.png"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#101919]/70" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Gauche : titre, description, résultat */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="mb-4">
                  <img src="/icons/Vector(2).png" alt="Star" className="h-6 w-6 text-[#5AB678]" />
                </div>
                {activitiesLoading && (
                  <div className="text-white/80 py-8">Chargement des activités...</div>
                )}
                {!activitiesLoading && activitiesError && (
                  <div className="text-white/90 py-4">{activitiesError}</div>
                )}
                {!activitiesLoading && !activitiesError && currentActivity && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        {currentActivity.title}
                      </h2>
                      <p className="text-lg text-white/80 mb-6 leading-relaxed">
                        {currentActivity.description}
                      </p>
                      <p className="text-lg text-[#5AB678] font-bold mb-6 leading-relaxed">
                        {currentActivity.result}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                )}
                {!activitiesLoading && !activitiesError && activities.length === 0 && (
                  <p className="text-white/80">{t('noActivity')}</p>
                )}
              </motion.div>
            </div>
            {/* Image à droite (mobile : en dessous) */}
            <div className="lg:hidden mt-8 -mr-4 sm:-mr-6 relative">
              {currentActivity && (
                <div
                  className="relative z-0 w-full"
                  style={{
                    aspectRatio: '868/579',
                    borderRadius: '289.5px 0 0 289.5px',
                    border: '3px solid #5AB678',
                    overflow: 'hidden',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0"
                    >
                      <img
                        src={slideImage}
                        alt={currentActivity.title}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Image à droite pour desktop */}
        {currentActivity && (
          <div className="hidden lg:flex absolute left-[50%] -right-2 top-12 bottom-12 items-center justify-end pr-0 z-10">
            <div
              className="relative z-0 w-full max-w-[688px]"
              style={{
                aspectRatio: '868/579',
                borderRadius: '289.5px 0 0 289.5px',
                border: '3px solid #5AB678',
                overflow: 'hidden',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <img
                    src={slideImage}
                    alt={currentActivity.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>
              <button
                onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
                disabled={currentSlide === 0}
                aria-label="Slide précédent"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-[#5AB678] disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-3 z-10 transition-colors"
              >
                <ArrowLeft size={24} className="text-white" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => Math.min(activities.length - 1, prev + 1))}
                disabled={currentSlide === activities.length - 1}
                aria-label="Slide suivant"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-[#5AB678] disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-3 z-10 transition-colors"
              >
                <ArrowRight size={24} className="text-white" />
              </button>
            </div>
          </div>
        )}
        {/* Navigation dots */}
        {activities.length > 0 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {activities.map((_, index) => (
              <button
                key={activities[index].id}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-3 h-3 bg-white rounded-full'
                    : 'w-3 h-3 border-2 border-white rounded-full hover:bg-white/50'
                }`}
                aria-label={`Aller au slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>
      )}

        {/* Section Nos Donations */}
        <section className="py-20 text-white relative overflow-hidden" style={{ background: 'linear-gradient(to left, #226c3a, #5ab678)' }}>
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
            {/* Left Side - Title and Description */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center lg:text-start max-w-2xl lg:ml-16"
            >
                <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {t('latestTitle')} <br />
                 <span className="text-[#226c3a]">{t('latestCagnottes')}</span>
                </h2>
                <p className="text-lg text-white/90 leading-relaxed mb-8">
                    {t('latestDesc')}
                </p>
            </motion.div>

            {/* Right Side - Slider des 3 dernières campagnes */}
            <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
            >
                <div className="relative overflow-hidden">
                <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentCagnotteSlide * 100}%)` }}
                >
                    {latestCampaigns.map((campaign) => (
                    <div key={campaign.id} className="min-w-full px-2">
                        <div className="bg-white rounded-3xl overflow-hidden relative" style={{ height: '600px' }}>
                        <div className="absolute inset-0">
                            <img 
                            src={campaign.image || '/images/no-picture.png'} 
                            alt={campaign.title} 
                            className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-6">
                            <h3 className="text-white text-2xl font-bold mb-2">{campaign.title}</h3>
                            {campaign.description?.includes('<') ? (
                            <div
                              className="text-white/90 text-sm mb-4 line-clamp-3 [&_div]:my-0.5 [&_div]:leading-snug [&_div:first-child]:mt-0 [&_div:last-child]:mb-0"
                              dangerouslySetInnerHTML={{ __html: campaign.description ?? '' }}
                            />
                            ) : (
                            <p className="text-white/90 text-sm mb-4 line-clamp-3">
                              {campaign.description}
                            </p>
                            )}
                            <Link href={`/campagnes/${campaign.id}`}>
                            <button className="border-2 border-white text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-white/10 transition-colors">
                                {t('learnMore')}
                            </button>
                            </Link>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
                </div>

                {/* Navigation Buttons */}
                {latestCampaigns.length > 0 && (
                <>
                <button
                onClick={() => setCurrentCagnotteSlide((prev) => Math.max(0, prev - 1))}
                disabled={currentCagnotteSlide === 0}
                aria-label={t('prevCard')}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-[#00644D] disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-3 z-10 transition-colors"
                >
                <ArrowLeft size={28} className="text-white" />
                </button>
                <button
                onClick={() => setCurrentCagnotteSlide((prev) => Math.min(latestCampaigns.length - 1, prev + 1))}
                disabled={currentCagnotteSlide === latestCampaigns.length - 1}
                aria-label={t('nextCard')}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-3 z-10 transition-colors"
                >
                <ArrowRight size={28} className="text-white" />
                </button>

                {/* Pagination Dots */}
                <div className="flex justify-center gap-2 mt-6">
                {latestCampaigns.map((campaign, index) => (
                    <button
                    key={campaign.id}
                    onClick={() => setCurrentCagnotteSlide(index)}
                    aria-label={`Aller à la campagne ${index + 1}`}
                    title={`Aller à la campagne ${index + 1}`}
                    className={`w-2 h-2 rounded-full transition-all ${
                        currentCagnotteSlide === index 
                        ? 'bg-white w-8' 
                        : 'bg-white/30'
                    }`}
                    />
                ))}
                </div>
                </>
                )}
            </motion.div>
            </div>

            {/* Bouton Voir toutes les campagnes */}
            <div className="text-center mt-12">
            <Link href="/campagnes">
                <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-1 border-white text-white px-6 py-3 rounded-3xl font-semibold flex items-center gap-2 w-fit mx-auto hover:bg-white/10 transition-colors"
                >
                {t('viewAllCampaigns')}
                <ArrowRight size={20} />
                </motion.button>
            </Link>
            </div>
        </div>
        </section>

      {/* Section "Campagnes populaires" - Affichée en premier quand connecté */}
      <section className="py-20 text-white" style={{ background: 'linear-gradient(to left, #8FC99E, #20B6B3)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              {t('campaignsTitle')}
            </h2>
            <p className="text-lg text-white max-w-3xl mx-auto">
              {t('campaignsSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {campaignsLoading && (
              <div className="col-span-full text-center text-white/80 py-8">{t('campaignsLoading')}</div>
            )}
            {!campaignsLoading && campaignsError && (
              <div className="col-span-full text-center text-white/90 py-4">{campaignsError}</div>
            )}
            {!campaignsLoading && !campaignsError && popularCampaigns.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-white/90">
                <Clock size={48} className="mb-4 opacity-90" aria-hidden />
                <p className="text-lg font-medium">{t('noCampaigns')}</p>
              </div>
            )}
            {!campaignsLoading && !campaignsError && popularCampaigns.map((campaign, index) => {
              const donorCount = donorCountByCampaignId[campaign.id] ?? 0;
              const amountSpent = campaign.amountSpent ?? 0;
              const currentAmount = campaign.currentAmount;
              const totalForBar = Math.max(currentAmount, amountSpent, 1);
              const spentPercent = totalForBar > 0 ? (amountSpent / totalForBar) * 100 : 0;
              const categoryConfig = categories.find((c) => c.id === campaign.category);
              const typeLabel = typeLabels[campaign.type?.toUpperCase?.() ?? ''] ?? campaign.type ?? 'Sadaqah';
              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/campagnes/${campaign.id}`}>
                    <div className="relative rounded-2xl overflow-hidden shadow-lg min-h-[480px] sm:min-h-[520px] flex flex-col">
                      <div className="absolute inset-0">
                        <img
                          src={campaign.image || '/images/no-picture.png'}
                          alt={campaign.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
                      </div>
                      <div className="relative flex flex-col flex-1 p-5 sm:p-6">
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/20 text-white px-3 py-1.5 rounded-full text-xs font-medium">
                            {categoryConfig && 'iconSrc' in categoryConfig && categoryConfig.iconSrc ? (
                              <Image src={categoryConfig.iconSrc} alt="" width={14} height={14} className="object-contain" />
                            ) : categoryConfig && 'icon' in categoryConfig && categoryConfig.icon ? (
                              <categoryConfig.icon size={14} className="text-white" />
                            ) : (
                              <Star size={14} className="text-white" />
                            )}
                            {categoryLabels[campaign.category] ?? campaign.category}
                          </span>
                          <span className="inline-flex items-center gap-1.5 bg-white border border-[#00644D] text-[#5ab678] px-3 py-1.5 rounded-full text-xs font-bold">
                            {typeLabel}
                          </span>
                        </div>
                        <div className="flex-1 min-h-[2rem]" />
                        <p className="text-[#5AB678] font-semibold text-base sm:text-lg mb-1">
                          {donorCount.toLocaleString('fr-FR')} {t('donors')}
                        </p>
                        <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 line-clamp-2">
                          {campaign.title}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center gap-2 text-sm">
                            <span className="text-[#5AB678] font-semibold">
                              {formatAmount(amountSpent)} {t('spent')}
                            </span>
                            <span className="text-white font-medium">
                              {formatAmount(currentAmount)} {t('collected')}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden flex">
                            <div
                              className="h-full rounded-l-full bg-[#5AB678] transition-all duration-300"
                              style={{ width: `${Math.min(100, spentPercent)}%` }}
                            />
                            <div
                              className="h-full flex-1 bg-white/40"
                              style={{ width: `${Math.max(0, 100 - spentPercent)}%` }}
                            />
                          </div>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="mt-4 w-full py-3 rounded-2xl font-semibold text-white flex items-center justify-center gap-2"
                          style={{ background: 'linear-gradient(to right, #5AB678, #20B6B3)' }}
                        >
                          <Heart size={18} className="fill-white" />
                          <span>{t('supportCampaign')}</span>
                          <ArrowRight size={18} />
                        </motion.div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center">
            <Link href="/campagnes">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className=" text-white px-8 py-4 rounded-4xl font-semibold hover:bg-green-500 transition-all duration-200 shadow-lg"
                style={{ background: 'linear-gradient(to bottom, #00644D, #101919)' }}
              >
                {t('viewMore')}
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

        {/* Section "Actualités" */}
        <section className="py-20 bg-[#101919] text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-[#5AB678]">
                {t('newsTitle')}
                </h2>
                <p className="text-lg text-white/80 mb-4 leading-relaxed">
                {t('newsSubtitle1')}
                </p>
                <p className="text-lg text-white/80 mb-8 leading-relaxed">
                {t('newsSubtitle2')}
                </p>
                <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                className="flex justify-center"
                >
                <ChevronDown size={32} className="text-[#5AB678]" />
                </motion.div>
            </motion.div>
            </div>
        </section>

        {/* Section activités (même slider que la première section) */}
        {activities.length > 0 && (
        <section className="relative text-white overflow-hidden min-h-[680px] flex items-center m-6">
            <AnimatePresence mode="wait">
            <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
            >
                <img
                src={slideImage}
                alt={currentActivity?.title ?? 'Activité'}
                className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60" />
            </motion.div>
            </AnimatePresence>
            
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 w-full z-10">
            <AnimatePresence mode="wait">
                <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                >
                <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-white">
                    {currentActivity?.title}
                </h2>
                <p className="text-lg text-white mb-8 leading-relaxed max-w-2xl mx-auto">
                    {currentActivity?.description}
                </p>
                <Link href="/don">
                    <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-white px-8 py-4 rounded-4xl font-semibold transition-all duration-200 shadow-lg"
                    style={{ background: 'linear-gradient(to right, #8FC99E, #20B6B3)' }}
                    >
                    {t('learnMore')}
                    </motion.button>
                </Link>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-center mt-8 space-x-2">
                {activities.map((activity, index) => (
                <button
                    key={activity.id}
                    onClick={() => setCurrentSlide(index)}
                    className={`transition-all duration-300 ${
                    index === currentSlide
                        ? 'w-2 h-2 bg-white rounded-full'
                        : 'w-2 h-2 border border-white rounded-full hover:bg-white/50'
                    }`}
                    aria-label={`Aller au slide ${index + 1}`}
                />
                ))}
            </div>
            </div>
        </section>
        )}

        {/* Section Nos produits Takafuls */}
        <section className="py-20 text-white relative overflow-hidden" style={{ background: 'linear-gradient(to left, #101919, #00644D)' }}>
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
            {/* Left Side - Title and Description */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center lg:text-start max-w-2xl lg:ml-16"
            >
                <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {t('takafulTitle')} <br />
                Produits <span className="text-[#20B6B3]">{t('takafulTitleHighlight')}</span>
                </h2>
                <p className="text-lg text-white/90 leading-relaxed mb-8">
                {t('takafulDesc')}
                </p>
            </motion.div>

            {/* Right Side - Slider des 3 derniers plans Takaful */}
            <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
            >
                {takafulLoading && (
                <div className="text-white/80 py-12 text-center min-h-[200px] flex items-center justify-center">
                    {t('takafulLoading')}
                </div>
                )}
                {!takafulLoading && takafulPlans.length === 0 && (
                <div className="text-white/90 py-12 text-center min-h-[200px] flex items-center justify-center rounded-2xl bg-white/5">
                    {t('takafulEmpty')}
                </div>
                )}
                {!takafulLoading && takafulPlans.length > 0 && (
                <>
                <div className="relative overflow-hidden">
                <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentTakafulSlide * 100}%)` }}
                >
                    {takafulPlans.map((plan) => (
                    <div key={plan.id} className="min-w-full px-2">
                        <div className="bg-white rounded-3xl overflow-hidden relative" style={{ height: '600px' }}>
                        <div className="absolute inset-0">
                            <img 
                            src={plan.picture && plan.picture.trim() ? plan.picture : DEFAULT_TAKAFUL_IMAGE} 
                            alt={plan.title} 
                            className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-6">
                            <h3 className="text-white text-2xl font-bold mb-2">{plan.title}</h3>
                            <p className="text-white/90 text-sm mb-4 line-clamp-3">
                            {plan.description}
                            </p>
                            <Link href={takafulDisplayPromote ? '/takaful' : `/takaful/${plan.id}`}>
                            <button className="border-2 border-white text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-white/10 transition-colors">
                                {t('learnMore')}
                            </button>
                            </Link>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
                </div>

                {/* Navigation Buttons */}
                <button
                onClick={() => setCurrentTakafulSlide((prev) => Math.max(0, prev - 1))}
                disabled={currentTakafulSlide === 0}
                aria-label="Carte précédente"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-[#00644D] disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-3 z-10 transition-colors"
                >
                <ArrowLeft size={28} className="text-white" />
                </button>
                <button
                onClick={() => setCurrentTakafulSlide((prev) => Math.min(takafulPlans.length - 1, prev + 1))}
                disabled={currentTakafulSlide === takafulPlans.length - 1}
                aria-label="Carte suivante"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-3 z-10 transition-colors"
                >
                <ArrowRight size={28} className="text-white" />
                </button>

                {/* Pagination Dots */}
                <div className="flex justify-center gap-2 mt-6">
                {takafulPlans.map((plan, index) => (
                    <button
                    key={plan.id}
                    onClick={() => setCurrentTakafulSlide(index)}
                    aria-label={`Aller au produit ${index + 1}`}
                    title={`Aller au produit ${index + 1}`}
                    className={`w-2 h-2 rounded-full transition-all ${
                        currentTakafulSlide === index 
                        ? 'bg-white w-8' 
                        : 'bg-white/30'
                    }`}
                    />
                ))}
                </div>
                </>
                )}
            </motion.div>
            </div>

            {/* Bouton Voir tous les produits */}
            <div className="text-center mt-12">
            <Link href="/takaful">
                <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-1 border-white text-white px-6 py-3 rounded-3xl font-semibold flex items-center gap-2 w-fit mx-auto hover:bg-white/10 transition-colors"
                >
                {t('viewAllProducts')}
                <ArrowRight size={20} />
                </motion.button>
            </Link>
            </div>
        </div>
        </section>

        {/* Section "L'impact d'Amane+ en chiffres" */}
        
        <section className="py-20 text-white" style={{ background: 'linear-gradient(193deg, #00644D -74.99%, #101919 119.08%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
            >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                <span className="text-white">{t('impactTitle')}</span>
                <span className="text-[#5AB678]">Amane+</span>
                <span className="text-white"> {t('impactTitleSuffix')}</span>
            </h2>
            <p className="text-lg text-white/90 max-w-3xl mx-auto mt-4">
                {t('impactSubtitle')}
            </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
                { 
                value: '15,247', 
                label: t('activeDonors'), 
                icon: Users, 
                iconBg: 'bg-[#5AB678]',
                iconColor: 'text-[#5AB678]',
                cardBg: 'bg-[#152A2A]'
                },
                { 
                value: '8.5%', 
                label: t('avgReturn'), 
                icon: TrendingUp, 
                iconBg: 'bg-[#5AB678]',
                iconColor: 'text-[#5AB678]',
                cardBg: 'bg-[#152A2A]'
                },
                { 
                value: '50+', 
                label: t('activeCampaigns'), 
                icon: Heart, 
                iconBg: 'bg-pink-500',
                iconColor: 'text-pink-500',
                cardBg: 'bg-[#152A2A]'
                },
                { 
                value: '200+', 
                label: t('halalProducts'), 
                icon: Bookmark, 
                iconBg: 'bg-purple-500',
                iconColor: 'text-purple-500',
                cardBg: 'bg-[#152A2A]'
                }
            ].map((stat, index) => (
                <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`${stat.cardBg} rounded-3xl p-6 text-center shadow-lg border border-white/10`}
                >
                <div className={`${stat.iconBg} rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
                    <stat.icon size={32} className="text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    {stat.value}
                </div>
                <p className="text-white/80 text-sm font-medium">{stat.label}</p>
                </motion.div>
            ))}
            </div>
        </div>
        </section>

    {/* Section "Emportez Amane+ partout avec vous" */}
    <section className="py-20" style={{ background: 'linear-gradient(to bottom, #D6FCF6, #229693)' }}>
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
                  {t('takeWithYouTitle')}
                </h2>
                <p className="text-lg text-white/80 mb-8 leading-relaxed">
                {t('takeWithYouDesc')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
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

      {/* Section "Ils nous font confiance" */}
      <section className="py-20 bg-[#043232] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-12">
              {t('trustTitle')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center justify-items-center">
              {[
                { src: '/logo/partenaire/LOGO IAT 3.png', alt: 'IAT' },
                { src: '/logo/partenaire/Logo Infinity Africa Group paysage.png', alt: 'Infinity Africa Group' },
                { src: '/logo/partenaire/Logo Infinity Africa Ventures_fond_noir.png', alt: 'Infinity Africa Ventures' },
                { src: '/logo/partenaire/Logo Leadway.png', alt: 'Leadway' },
                { src: '/logo/partenaire/Maconi Horizontal PNG.png', alt: 'Maconi' },
              ].map((logo) => (
                <div key={logo.alt} className="relative h-16 w-full max-w-[180px] bg-white/20 rounded-lg flex items-center justify-center p-3">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
