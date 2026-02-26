'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Heart, Users, Target, Calendar, MapPin, 
  TrendingUp, Star, Eye, Share2, Bookmark, Globe, Zap,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ArrowRight, Play, Pause, Apple
} from 'lucide-react';
import Link from 'next/link';
import CampaignCard from '@/components/CampaignCard';
import type { Campaign } from '@/data/mockData';
import Image from 'next/image';
import MakeDonationModal from '@/components/MakeDonationModal';
import type { PendingDonationState } from '@/components/MakeDonationModal';
import MakeDepositModal from '@/components/MakeDepositModal';
import { getActiveCampaigns } from '@/services/campaigns';
import { getDonationsStatistics } from '@/services/statistics';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { useCampaignTranslations } from '@/contexts/CampaignTranslationsContext';
import { isHtmlContent, getHtmlForRender } from '@/lib/campaign-html';

const COUNTRY_LABELS: Record<string, string> = {
  ci: "côte d'ivoire",
  sn: 'sénégal',
  ml: 'mali',
};
const CITY_LABELS: Record<string, string> = {
  abidjan: 'abidjan',
  dakar: 'dakar',
  bamako: 'bamako',
};

const CATEGORY_KEYS: Record<string, string> = {
  all: 'categoryAll',
  urgence: 'categoryUrgence',
  education: 'categoryEducation',
  sante: 'categorySante',
  developpement: 'categoryDeveloppement',
  refugies: 'categoryRefugies',
  'special-ramadan': 'categorySpecialRamadan',
  'special-tabaski': 'categorySpecialTabaski',
  autres: 'categoryOther',
};

const SORT_KEYS: Record<string, string> = {
  recent: 'sortRecent',
  popular: 'sortPopular',
  ending: 'sortEnding',
  amount: 'sortAmount',
};

const TOAST_DURATION_MS = 4000;

export default function CampagnesPage() {
  const t = useTranslations('campagnes');
  const { getTranslatedCampaign } = useCampaignTranslations();
  const { user, accessToken, isAuthenticated } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [pendingDonationState, setPendingDonationState] = useState<PendingDonationState | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  /** Nombre de donateurs par campaignId (API statistics) */
  const [donorCountByCampaignId, setDonorCountByCampaignId] = useState<Record<string, number>>({});
  /** Index du slide pour Programmes en vedette (quand > 3 éléments) */
  const [featuredSlideIndex, setFeaturedSlideIndex] = useState(0);
  /** Programmes ponctuels (duration = PONCTUAL), chargés via getActiveCampaigns avec filtre */
  const [ponctualCampaigns, setPonctualCampaigns] = useState<Campaign[]>([]);
  /** Index du slide pour Programmes ponctuels */
  const [ponctualSlideIndex, setPonctualSlideIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getActiveCampaigns()
      .then((list) => { if (!cancelled) setCampaigns(list); })
      .catch((err) => { if (!cancelled) setError(err?.message ?? t('loadError')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getActiveCampaigns({ duration: 'PONCTUAL' })
      .then((list) => { if (!cancelled) setPonctualCampaigns(list); })
      .catch(() => { if (!cancelled) setPonctualCampaigns([]); });
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
      .catch(() => { /* ignore: on garde le fallback bénéficiaires */ });
    return () => { cancelled = true; };
  }, []);

  const walletBalance = user?.wallet?.balance ?? 0;

  const categories = [
    { id: 'all', nameKey: 'categoryAllLabel', icon: Globe, color: 'bg-gray-500' },
    { id: 'urgence', nameKey: 'categoryUrgence', icon: Zap, color: 'bg-red-500' },
    { id: 'education', nameKey: 'categoryEducation', icon: Bookmark, color: 'bg-green-500' },
    { id: 'sante', nameKey: 'categorySante', icon: Heart, color: 'bg-green-600' },
    { id: 'developpement', nameKey: 'categoryDeveloppement', icon: TrendingUp, color: 'bg-green-700' },
    { id: 'refugies', nameKey: 'categoryRefugies', icon: Users, color: 'bg-orange-500' },
    { id: 'special-ramadan', nameKey: 'categorySpecialRamadan', iconSrc: '/icons/moon-w.png', color: 'bg-amber-600' },
    { id: 'special-tabaski', nameKey: 'categorySpecialTabaski', iconSrc: '/icons/moon-w.png', color: 'bg-amber-600' },
    { id: 'autres', nameKey: 'categoryOther', icon: Star, color: 'bg-gray-500' },
  ];

  const categoryLabels: Record<string, string> = Object.fromEntries(
    Object.entries(CATEGORY_KEYS).map(([k, key]) => [k, t(key)])
  );

  const typeLabels: Record<string, string> = {
    ZAKAT: t('typeZakat'),
    SADAQAH: t('typeSadaqah'),
  };

  const sortOptions = [
    { id: 'recent', nameKey: 'sortRecent' },
    { id: 'popular', nameKey: 'sortPopular' },
    { id: 'ending', nameKey: 'sortEnding' },
    { id: 'amount', nameKey: 'sortAmount' },
  ];

  const filteredCampaigns = campaigns
    .filter((campaign) => {
      const tc = getTranslatedCampaign(campaign);
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        tc.title.toLowerCase().includes(term) ||
        tc.description.toLowerCase().includes(term);
      const matchesCategory = selectedCategory === 'all' || campaign.category === selectedCategory;
      const endTime = campaign.endDate && !Number.isNaN(new Date(campaign.endDate).getTime())
        ? new Date(campaign.endDate).getTime()
        : null;
      const matchesDate =
        (!dateRange.start && !dateRange.end) ||
        (endTime != null && dateRange.start && dateRange.end && endTime >= new Date(dateRange.start).getTime() && endTime <= new Date(dateRange.end).getTime()) ||
        (endTime != null && dateRange.start && !dateRange.end && endTime >= new Date(dateRange.start).getTime()) ||
        (endTime != null && !dateRange.start && dateRange.end && endTime <= new Date(dateRange.end).getTime());
      const loc = (tc.location || '').toLowerCase();
      const matchesCountry = !selectedCountry || loc.includes(COUNTRY_LABELS[selectedCountry] ?? selectedCountry);
      const matchesCity = !selectedCity || loc.includes(CITY_LABELS[selectedCity] ?? selectedCity);
      return matchesSearch && matchesCategory && matchesDate && matchesCountry && matchesCity;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (donorCountByCampaignId[b.id] ?? 0) - (donorCountByCampaignId[a.id] ?? 0);
        case 'ending':
          return (a.endDate ? new Date(a.endDate).getTime() : 0) - (b.endDate ? new Date(b.endDate).getTime() : 0);
        case 'amount':
          return b.targetAmount - a.targetAmount;
        case 'recent':
        default:
          return (b.endDate ? new Date(b.endDate).getTime() : 0) - (a.endDate ? new Date(a.endDate).getTime() : 0);
      }
    });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressPercentage = (current: number, target: number) => {
    if (!target || target <= 0) return 0;
    return Math.min(100, (current / target) * 100);
  };

  const featuredCampaigns = campaigns.filter((c) => c.featured);
  const featuredSlideMax = Math.max(0, Math.ceil(featuredCampaigns.length / 3) - 1);
  const effectiveFeaturedSlideIndex = Math.min(featuredSlideIndex, featuredSlideMax);
  const ponctualSlideMax = Math.max(0, Math.ceil(ponctualCampaigns.length / 3) - 1);
  const effectivePonctualSlideIndex = Math.min(ponctualSlideIndex, ponctualSlideMax);
  const totalDonors = campaigns.reduce((sum, c) => sum + (donorCountByCampaignId[c.id] ?? 0), 0);
  const statsCards = [
    { icon: '/icons/volume-high.png', value: campaigns.length, labelKey: 'statsActiveCampaigns', rotateDirection: 1, cardRotate: 5 },
    { icon: '/icons/people.png', value: totalDonors.toLocaleString(), labelKey: 'statsDonors', rotateDirection: -1, cardRotate: -5 },
    { icon: '/icons/hand-coin(2).png', value: formatAmount(campaigns.reduce((sum, c) => sum + c.currentAmount, 0)), labelKey: 'statsCollected', rotateDirection: 1, cardRotate: 5 },
    { icon: '/icons/global.png', value: new Set(campaigns.map((c) => c.location).filter(Boolean)).size || 0, labelKey: 'statsCountries', rotateDirection: -1, cardRotate: -5 },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to left, #101919, #00644D)' }}>
      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-20 w-32 h-32 bg-green-200/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, -80, 0],
            y: [0, 100, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-40 right-32 w-24 h-24 bg-indigo-200/20 rounded-full blur-xl"
        />
      </div>

      {/* Header Section */}
      <section className="relative pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Titre et fil d'Ariane en haut à droite */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start mb-8"
          >
            {/* Fil d'Ariane */}
            <h3 className="text-white text-xl font-bold mb-2">{t('breadcrumbDonations')}</h3>
            <nav className="text-sm mb-2">
              <Link href="/">
                <span className="text-gray-300 font-bold">{t('breadcrumbHome')}</span>
              </Link>
              <span className="text-gray-300 mx-2">/</span>
              <span className="text-green-400">{t('breadcrumbDonations')}</span>
            </nav>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="inline-block mb-8"
            >
              <div className="rounded-full flex items-center justify-center overflow-hidden">
                <Image src="/images/Image(5).png" alt="Solidarité" width={100} height={100} className="object-contain rounded-full" />
              </div>
            </motion.div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              {t('title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00644d] to-[#00644d]/80">{t('titleSolidarity')}</span>
            </h1>
            <p className="text-xl text-white mb-12 max-w-3xl mx-auto leading-relaxed">
              {t('discoverText')}
            </p>

            {/* Bouton Offrir Sans Choisir */}
            <div className="flex justify-center mb-12">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (!isAuthenticated || !user) {
                    setToastMessage(t('loginToDonate'));
                    setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
                    return;
                  }
                  setShowDonationModal(true);
                }}
                className="px-6 py-2 rounded-3xl font-semibold text-white flex items-center space-x-4 transition-all duration-200"
                style={{ 
                  background: 'linear-gradient(to right, #3AE1B4, #13A98B)',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
              >
                <div 
                  className="w-[60px] h-[60px] rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <Image 
                    src="/icons/hand-coin(2).png" 
                    alt="Offrir" 
                    width={38} 
                    height={38} 
                    className="object-contain"
                  />
                </div>
                <span>{t('letAmaneChoose')}</span>
              </motion.button>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/20 text-white text-center">
                {error}
              </div>
            )}
            {loading && (
              <div className="mb-6 text-white/80 text-center py-4">{t('loading')}</div>
            )}
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
              {statsCards.map((stat, index) => {
                return (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5, rotate: stat.cardRotate }}
                    animate={{ rotate: [0, stat.cardRotate, -stat.cardRotate, 0] }}
                    transition={{ 
                      rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                      y: { duration: 0.2 }
                    }}
                    className="bg-[#00644d]/10 rounded-2xl p-6 shadow-lg"
                  >
                    <div className="text-center">
                      <motion.div 
                        className="w-12 h-12 bg-[#00644d] rounded-full flex items-center justify-center mx-auto mb-3"
                        animate={{ rotate: [0, stat.rotateDirection * 360] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      >
                        <Image src={stat.icon} alt={t(stat.labelKey)} width={26} height={26} className="object-contain" />
                      </motion.div>
                      <p className="text-2xl font-bold text-white">{stat?.value}</p>
                      <p className="text-sm text-white">{t(stat.labelKey)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl shadow-xl p-6 mb-8 border border-white/10"
          
        >
          <div className="flex flex-col gap-6">
            {/* First Row: Search, Period (2 cols), Country, City, Apply Button */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-1">
                <label className="block text-white text-sm font-medium mb-2">{t('search')}</label>
                <div className="relative">
                  <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400" />
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-green-400 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200 text-white placeholder-gray-400 bg-transparent"
                    title={t('searchTitle')}
                  />
                </div>
              </div>

              {/* Period - Du / Au (2 colonnes pour bien séparer de Pays) */}
              <div className="lg:col-span-2 min-w-0">
                <label className="block text-white text-sm font-medium mb-2">{t('period')}</label>
                <div className="flex gap-2">
                  <div className="relative flex-1 min-w-0">
                    <Calendar size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/70 z-10 pointer-events-none" />
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                      className="w-full pl-9 pr-2 py-3 rounded-xl text-white bg-gray-800/50 border border-gray-700 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200 [color-scheme:dark]"
                      title="Date de début"
                    />
                  </div>
                  <span className="self-center text-white/70 flex-shrink-0">→</span>
                  <div className="relative flex-1 min-w-0">
                    <Calendar size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/70 z-10 pointer-events-none" />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                      className="w-full pl-9 pr-2 py-3 rounded-xl text-white bg-gray-800/50 border border-gray-700 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200 [color-scheme:dark]"
                      title="Date de fin"
                    />
                  </div>
                </div>
              </div>

              {/* Country */}
              <div className="lg:col-span-1">
                <label className="block text-white text-sm font-medium mb-2">{t('country')}</label>
                <div className="relative">
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    title={t('selectCountry')}
                    aria-label={t('selectCountry')}
                    className="w-full pl-4 pr-10 py-3 rounded-xl text-white bg-gray-800/50 border border-gray-700 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200 appearance-none"
                  >
                    <option value="" className="bg-gray-800">{t('selectCountry')}</option>
                    <option value="ci" className="bg-gray-800">{t('countryCI')}</option>
                    <option value="sn" className="bg-gray-800">{t('countrySN')}</option>
                    <option value="ml" className="bg-gray-800">{t('countryML')}</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 pointer-events-none" />
                </div>
              </div>

              {/* City */}
              <div className="lg:col-span-1">
                <label className="block text-white text-sm font-medium mb-2">{t('city')}</label>
                <div className="relative">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    title={t('selectCity')}
                    aria-label={t('selectCity')}
                    className="w-full pl-4 pr-10 py-3 rounded-xl text-white bg-gray-800/50 border border-gray-700 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200 appearance-none"
                  >
                    <option value="" className="bg-gray-800">{t('selectCity')}</option>
                    <option value="abidjan" className="bg-gray-800">{t('cityAbidjan')}</option>
                    <option value="dakar" className="bg-gray-800">{t('cityDakar')}</option>
                    <option value="bamako" className="bg-gray-800">{t('cityBamako')}</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 pointer-events-none" />
                </div>
              </div>

              {/* Apply Button */}
              <div className="lg:col-span-1 flex items-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    // Logique d'application des filtres
                  }}
                  className="w-full py-3 rounded-3xl font-semibold text-white transition-all duration-200"
                  style={{ background: 'linear-gradient(to right, #5AB678, #20B6B3)' }}
                >
                  {t('apply')}
                </motion.button>
              </div>
            </div>

            {/* Second Row: Category Filters & View Toggle */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 flex-1">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-3xl font-medium transition-all duration-200 border border-white/10 ${
                      selectedCategory === category.id
                        ? 'bg-black text-white'
                        : 'bg-[#00644d]/10 text-white'
                    }`}
                  >
                    {selectedCategory === category.id && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                    {'iconSrc' in category && category.iconSrc ? (
                      <Image src={category.iconSrc} alt="" width={16} height={16} className="object-contain" />
                    ) : (
                      'icon' in category && category.icon && <category.icon size={16} className={selectedCategory === category.id ? 'text-white' : 'text-[#00644D]'} />
                    )}
                    <span>{category.id === 'all' ? t('categoryAll') : t(category.nameKey)}</span>
                  </motion.button>
                ))}
              </div>

              {/* View Toggle */}
              <div className="flex bg-gray-800/50 rounded-xl p-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-[#5AB678]' 
                      : 'text-white/70'
                  }`}
                >
                  <div className={`grid grid-cols-2 gap-1 w-5 h-5 ${viewMode === 'grid' ? 'text-white' : 'text-white'}`}>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-[#5AB678]' 
                      : 'text-white/70'
                  }`}
                >
                  <div className={`space-y-1 w-5 h-5 ${viewMode === 'list' ? 'text-white' : 'text-white'}`}>
                    <div className="bg-current rounded-sm h-1"></div>
                    <div className="bg-current rounded-sm h-1"></div>
                    <div className="bg-current rounded-sm h-1"></div>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section Programmes en vedette (featured) */}
        {featuredCampaigns.length > 0 && (
          <section className="mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-white text-left">
                {t('featuredPrograms')}
              </h2>
              <Link
                href="#programmes"
                className="text-[#5AB678] hover:text-[#5AB678]/80 font-semibold inline-flex items-center gap-1"
              >
                {t('seeMore')}
                <ArrowRight size={18} className="inline" />
              </Link>
            </div>

            {featuredCampaigns.length <= 3 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCampaigns.map((campaign, index) => {
                  const tc = getTranslatedCampaign(campaign);
                  const categoryConfig = categories.find((c) => c.id === campaign.category);
                  return (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                    >
                      <Link href={`/campagnes/${campaign.id}`}>
                        <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[16/9] min-h-[180px] group">
                          <img
                            src={campaign.image || '/images/no-picture.png'}
                            alt={tc.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                          <div className="absolute inset-0 flex flex-col justify-end p-5">
                            <div className="absolute top-4 left-4">
                              <span className="inline-flex items-center gap-1.5 bg-[#5AB678] text-white px-3 py-1.5 rounded-full text-xs font-bold">
                                {categoryConfig && 'iconSrc' in categoryConfig && categoryConfig.iconSrc ? (
                                  <Image src={categoryConfig.iconSrc} alt="" width={14} height={14} className="object-contain" />
                                ) : (categoryConfig && 'icon' in categoryConfig && categoryConfig.icon) ? (
                                  <categoryConfig.icon size={14} className="text-white" />
                                ) : (
                                  <Star size={14} className="text-white" />
                                )}
                                {categoryLabels[campaign.category] ?? campaign.category}
                              </span>
                            </div>
                            <div className="relative">
                              <h3 className="text-xl font-bold text-white leading-tight">
                                {tc.title}
                              </h3>
                              {/* {campaign.description?.trim() && (
                                campaign.description.includes('<') ? (
                                  <div
                                    className="text-base font-normal text-white/90 mt-1 line-clamp-2 [&_div]:my-0.5 [&_div]:leading-snug [&_div:first-child]:mt-0 [&_div:last-child]:mb-0"
                                    dangerouslySetInnerHTML={{ __html: getHtmlForRender(campaign.description) }}
                                  />
                                ) : (
                                  <p className="text-base font-normal text-white/90 mt-1 line-clamp-2">
                                    ({campaign.description})
                                  </p>
                                )
                              )} */}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="relative">
                <div className="overflow-hidden">
                  <motion.div
                    className="flex"
                    style={{ width: `${Math.ceil(featuredCampaigns.length / 3) * 100}%` }}
                    animate={{ x: `-${effectiveFeaturedSlideIndex * (100 / Math.ceil(featuredCampaigns.length / 3))}%` }}
                    transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
                  >
                    {Array.from({ length: Math.ceil(featuredCampaigns.length / 3) }).map((_, pageIndex) => (
                      <div
                        key={pageIndex}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-shrink-0 px-1"
                        style={{ width: `${100 / Math.ceil(featuredCampaigns.length / 3)}%` }}
                      >
                        {featuredCampaigns.slice(pageIndex * 3, pageIndex * 3 + 3).map((campaign, index) => {
                          const tc = getTranslatedCampaign(campaign);
                          const categoryConfig = categories.find((c) => c.id === campaign.category);
                          return (
                            <Link key={campaign.id} href={`/campagnes/${campaign.id}`}>
                              <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[16/9] min-h-[180px] group">
                                <img
                                  src={campaign.image || '/images/no-picture.png'}
                                  alt={tc.title}
                                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                                <div className="absolute inset-0 flex flex-col justify-end p-5">
                                  <div className="absolute top-4 left-4">
                                    <span className="inline-flex items-center gap-1.5 bg-[#5AB678] text-white px-3 py-1.5 rounded-full text-xs font-bold">
                                      {categoryConfig && 'iconSrc' in categoryConfig && categoryConfig.iconSrc ? (
                                        <Image src={categoryConfig.iconSrc} alt="" width={14} height={14} className="object-contain" />
                                      ) : (categoryConfig && 'icon' in categoryConfig && categoryConfig.icon) ? (
                                        <categoryConfig.icon size={14} className="text-white" />
                                      ) : (
                                        <Star size={14} className="text-white" />
                                      )}
                                      {categoryLabels[campaign.category] ?? campaign.category}
                                    </span>
                                  </div>
                                  <div className="relative">
                                    <h3 className="text-xl font-bold text-white leading-tight">
                                      {tc.title}
                                    </h3>
                                    {/* {campaign.description?.trim() && (
                                      campaign.description.includes('<') ? (
                                        <div
                                          className="text-base font-normal text-white/90 mt-1 line-clamp-2 [&_div]:my-0.5 [&_div]:leading-snug [&_div:first-child]:mt-0 [&_div:last-child]:mb-0"
                                          dangerouslySetInnerHTML={{ __html: getHtmlForRender(campaign.description) }}
                                        />
                                      ) : (
                                        <p className="text-base font-normal text-white/90 mt-1 line-clamp-2">
                                          ({campaign.description})
                                        </p>
                                      )
                                    )} */}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ))}
                  </motion.div>
                </div>
                <button
                  type="button"
                  onClick={() => setFeaturedSlideIndex((i) => Math.max(0, i - 1))}
                  disabled={effectiveFeaturedSlideIndex === 0}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 lg:-translate-x-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#00644D] shadow-lg flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition-all"
                  aria-label={t('ariaFeaturedPrev')}
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={() => setFeaturedSlideIndex((i) => Math.min(featuredSlideMax, i + 1))}
                  disabled={effectiveFeaturedSlideIndex >= featuredSlideMax}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 lg:translate-x-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#00644D] shadow-lg flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition-all"
                  aria-label={t('ariaFeaturedNext')}
                >
                  <ChevronRight size={24} />
                </button>
                <div className="flex justify-center gap-2 mt-4">
                  {Array.from({ length: Math.ceil(featuredCampaigns.length / 3) }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFeaturedSlideIndex(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        i === effectiveFeaturedSlideIndex ? 'bg-[#5AB678] scale-110' : 'bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Page ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Section Programmes ponctuels (duration = PONCTUAL) */}
        {ponctualCampaigns.length > 0 && (
          <section className="mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-white text-left">
                {t('ponctualPrograms')}
              </h2>
              <Link
                href="#programmes"
                className="text-[#5AB678] hover:text-[#5AB678]/80 font-semibold inline-flex items-center gap-1"
              >
                {t('seeMore')}
                <ArrowRight size={18} className="inline" />
              </Link>
            </div>

            {ponctualCampaigns.length <= 3 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ponctualCampaigns.map((campaign, index) => {
                  const tc = getTranslatedCampaign(campaign);
                  const categoryConfig = categories.find((c) => c.id === campaign.category);
                  return (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                    >
                      <Link href={`/campagnes/${campaign.id}`}>
                        <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[16/9] min-h-[180px] group">
                          <img
                            src={campaign.image || '/images/no-picture.png'}
                            alt={tc.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                          <div className="absolute inset-0 flex flex-col justify-end p-5">
                            <div className="absolute top-4 left-4">
                              <span className="inline-flex items-center gap-1.5 bg-[#5AB678] text-white px-3 py-1.5 rounded-full text-xs font-bold">
                                {categoryConfig && 'iconSrc' in categoryConfig && categoryConfig.iconSrc ? (
                                  <Image src={categoryConfig.iconSrc} alt="" width={14} height={14} className="object-contain" />
                                ) : (categoryConfig && 'icon' in categoryConfig && categoryConfig.icon) ? (
                                  <categoryConfig.icon size={14} className="text-white" />
                                ) : (
                                  <Star size={14} className="text-white" />
                                )}
                                {categoryLabels[campaign.category] ?? campaign.category}
                              </span>
                            </div>
                            <div className="relative">
                              <h3 className="text-xl font-bold text-white leading-tight">
                                {tc.title}
                              </h3>
                              {/* {campaign.description?.trim() && (
                                campaign.description.includes('<') ? (
                                  <div
                                    className="text-base font-normal text-white/90 mt-1 line-clamp-2 [&_div]:my-0.5 [&_div]:leading-snug [&_div:first-child]:mt-0 [&_div:last-child]:mb-0"
                                    dangerouslySetInnerHTML={{ __html: getHtmlForRender(campaign.description) }}
                                  />
                                ) : (
                                  <p className="text-base font-normal text-white/90 mt-1 line-clamp-2">
                                    ({campaign.description})
                                  </p>
                                )
                              )} */}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="relative">
                <div className="overflow-hidden">
                  <motion.div
                    className="flex"
                    style={{ width: `${Math.ceil(ponctualCampaigns.length / 3) * 100}%` }}
                    animate={{ x: `-${effectivePonctualSlideIndex * (100 / Math.ceil(ponctualCampaigns.length / 3))}%` }}
                    transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
                  >
                    {Array.from({ length: Math.ceil(ponctualCampaigns.length / 3) }).map((_, pageIndex) => (
                      <div
                        key={pageIndex}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-shrink-0 px-1"
                        style={{ width: `${100 / Math.ceil(ponctualCampaigns.length / 3)}%` }}
                      >
                        {ponctualCampaigns.slice(pageIndex * 3, pageIndex * 3 + 3).map((campaign, index) => {
                          const tc = getTranslatedCampaign(campaign);
                          const categoryConfig = categories.find((c) => c.id === campaign.category);
                          return (
                            <Link key={campaign.id} href={`/campagnes/${campaign.id}`}>
                              <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[16/9] min-h-[180px] group">
                                <img
                                  src={campaign.image || '/images/no-picture.png'}
                                  alt={tc.title}
                                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                                <div className="absolute inset-0 flex flex-col justify-end p-5">
                                  <div className="absolute top-4 left-4">
                                    <span className="inline-flex items-center gap-1.5 bg-[#5AB678] text-white px-3 py-1.5 rounded-full text-xs font-bold">
                                      {categoryConfig && 'iconSrc' in categoryConfig && categoryConfig.iconSrc ? (
                                        <Image src={categoryConfig.iconSrc} alt="" width={14} height={14} className="object-contain" />
                                      ) : (categoryConfig && 'icon' in categoryConfig && categoryConfig.icon) ? (
                                        <categoryConfig.icon size={14} className="text-white" />
                                      ) : (
                                        <Star size={14} className="text-white" />
                                      )}
                                      {categoryLabels[campaign.category] ?? campaign.category}
                                    </span>
                                  </div>
                                  <div className="relative">
                                    <h3 className="text-xl font-bold text-white leading-tight">
                                      {tc.title}
                                    </h3>
                                    {/* {campaign.description?.trim() && (
                                      campaign.description.includes('<') ? (
                                        <div
                                          className="text-base font-normal text-white/90 mt-1 line-clamp-2 [&_div]:my-0.5 [&_div]:leading-snug [&_div:first-child]:mt-0 [&_div:last-child]:mb-0"
                                          dangerouslySetInnerHTML={{ __html: getHtmlForRender(campaign.description) }}
                                        />
                                      ) : (
                                        <p className="text-base font-normal text-white/90 mt-1 line-clamp-2">
                                          ({campaign.description})
                                        </p>
                                      )
                                    )} */}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ))}
                  </motion.div>
                </div>
                <button
                  type="button"
                  onClick={() => setPonctualSlideIndex((i) => Math.max(0, i - 1))}
                  disabled={effectivePonctualSlideIndex === 0}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 lg:-translate-x-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#00644D] shadow-lg flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition-all"
                  aria-label={t('ariaPonctualPrev')}
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={() => setPonctualSlideIndex((i) => Math.min(ponctualSlideMax, i + 1))}
                  disabled={effectivePonctualSlideIndex >= ponctualSlideMax}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 lg:translate-x-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#00644D] shadow-lg flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition-all"
                  aria-label={t('ariaPonctualNext')}
                >
                  <ChevronRight size={24} />
                </button>
                <div className="flex justify-center gap-2 mt-4">
                  {Array.from({ length: Math.ceil(ponctualCampaigns.length / 3) }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPonctualSlideIndex(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        i === effectivePonctualSlideIndex ? 'bg-[#5AB678] scale-110' : 'bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Page ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        <h2 id="programmes" className="text-xl lg:text-2xl font-bold text-white mb-6 text-left scroll-mt-6">
          {t('allPrograms')}
        </h2>

        {/* Campaigns Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="text-center py-12 text-white/80">{t('loading')}</div>
          ) : viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
            >
              {filteredCampaigns.map((campaign, index) => {
                const tc = getTranslatedCampaign(campaign);
                const donorCount = donorCountByCampaignId[campaign.id] ?? 0;
                const amountSpent = campaign.amountSpent ?? 0;
                const currentAmount = campaign.currentAmount;
                const targetAmount = campaign.targetAmount ?? 0;
                /** Un seul affichage : objectif (collecté/cible) si targetAmount > 0, sinon déboursé/collecté */
                const useTargetBar = targetAmount > 0;
                const barPercent = useTargetBar
                  ? Math.min(100, (currentAmount / targetAmount) * 100)
                  : (Math.max(currentAmount, amountSpent, 1) > 0 ? (amountSpent / Math.max(currentAmount, amountSpent, 1)) * 100 : 0);
                const categoryConfig = categories.find((c) => c.id === campaign.category);
                const typeLabel = typeLabels[campaign.type?.toUpperCase?.() ?? ''] ?? campaign.type ?? 'Sadaqah';
                return (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Link href={`/campagnes/${campaign.id}`}>
                      <div className="relative rounded-2xl overflow-hidden shadow-lg min-h-[480px] sm:min-h-[520px] flex flex-col">
                        {/* Image de fond avec overlay */}
                        <div className="absolute inset-0">
                          <img
                            src={campaign.image || '/images/no-picture.png'}
                            alt={tc.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
                        </div>

                        {/* Contenu superposé */}
                        <div className="relative flex flex-col flex-1 p-5 sm:p-6">
                          {/* Ligne des tags: catégorie (gauche) + type (droite) */}
                          <div className="flex justify-between items-start gap-2 mb-3">
                            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/20 text-white px-3 py-1.5 rounded-full text-xs font-medium">
                              {categoryConfig && 'iconSrc' in categoryConfig && categoryConfig.iconSrc ? (
                                <Image src={categoryConfig.iconSrc} alt="" width={14} height={14} className="object-contain" />
                              ) : (categoryConfig && 'icon' in categoryConfig && categoryConfig.icon) ? (
                                <categoryConfig.icon size={14} className="text-white" />
                              ) : (
                                <Star size={14} className="text-white" />
                              )}
                              {categoryLabels[campaign.category] ?? campaign.category}
                            </span>
                            <span className="inline-flex items-center gap-1.5 bg-[#ffffff] border border-[#00644D] text-[#5ab678] px-3 py-1.5 rounded-full text-xs font-bold">
                              {typeLabel}
                            </span>
                          </div>

                          <div className="flex-1 min-h-[2rem]" />

                          {/* Donateurs (vert) + Titre (blanc) — juste au-dessus de la barre */}
                          <p className="text-[#5AB678] font-semibold text-base sm:text-lg mb-1">
                            {donorCount.toLocaleString('fr-FR')} {t('donors')}
                          </p>
                          <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 line-clamp-2">
                            {tc.title}
                          </h3>

                          {/* Toujours une barre : si targetAmount > 0 → collecté/cible, sinon → déboursé/collecté par défaut */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center gap-2 text-sm">
                              {useTargetBar ? (
                                <>
                                  <span className="text-white font-medium">
                                    {formatAmount(currentAmount)} {t('collected')}
                                  </span>
                                  <span className="text-[#5AB678] font-semibold">
                                    {formatAmount(targetAmount)} {t('target')}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="text-[#5AB678] font-semibold">
                                    {formatAmount(amountSpent)} {t('disbursed')}
                                  </span>
                                  <span className="text-white font-medium">
                                    {formatAmount(currentAmount)} {t('collected')}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="w-full h-2 bg-white rounded-full overflow-hidden flex">
                              <div
                                className="h-full rounded-l-full bg-[#5AB678] transition-all duration-300"
                                style={{ width: `${Math.min(100, barPercent)}%` }}
                              />
                              <div
                                className="h-full flex-1 bg-white/40"
                                style={{ width: `${Math.max(0, 100 - barPercent)}%` }}
                              />
                            </div>
                          </div>

                          {/* Bouton CTA */}
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
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {filteredCampaigns.map((campaign, index) => {
                const tc = getTranslatedCampaign(campaign);
                return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="group"
                >
                  <Link href={`/campagnes/${campaign.id}`}>
                    <div className="bg-[#101919]/50 rounded-2xl shadow-lg border border-white/10 p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                        <div className="relative w-full sm:w-32 h-48 sm:h-32 flex-shrink-0">
                          <img
                            src={campaign.image || '/images/no-picture.png'}
                            alt={tc.title}
                            className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${
                              campaign.category === 'urgence' ? 'bg-red-500' :
                              campaign.category === 'education' ? 'bg-blue-500' :
                              campaign.category === 'sante' ? 'bg-green-500' :
                              campaign.category === 'developpement' ? 'bg-purple-500' :
                              campaign.category === 'refugies' ? 'bg-orange-500' :
                              campaign.category === 'special-ramadan' || campaign.category === 'special-tabaski' ? 'bg-amber-600' :
                              'bg-gray-500'
                            }`}>
                              {categoryLabels[campaign.category] ?? campaign.category}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-semibold text-white bg-[#00644D]">
                              {typeLabels[campaign.type?.toUpperCase?.() ?? ''] ?? campaign.type ?? 'Sadaqah'}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 w-full min-w-0">
                          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-[#5AB678] transition-colors break-words">
                            {tc.title}
                          </h3>
                          {isHtmlContent(tc.description) ? (
                            <div
                              className="text-white/70 mb-4 text-sm sm:text-base line-clamp-2 [&_div]:my-0.5 [&_div]:leading-snug [&_div:first-child]:mt-0 [&_div:last-child]:mb-0"
                              dangerouslySetInnerHTML={{ __html: getHtmlForRender(tc.description ?? '') }}
                            />
                          ) : (
                            <p className="text-white/70 mb-4 text-sm sm:text-base line-clamp-2">
                              {tc.description}
                            </p>
                          )}

                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-white/70 mb-4">
                            <div className="flex items-center space-x-1">
                              <Users size={14} className="sm:w-4 sm:h-4" />
                              <span>{(donorCountByCampaignId[campaign.id] ?? 0).toLocaleString()} {t('donors')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin size={14} className="sm:w-4 sm:h-4" />
                              <span className="truncate">{tc.location || '—'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar size={14} className="sm:w-4 sm:h-4" />
                              <span className="truncate">
                                {campaign.endDate && !Number.isNaN(new Date(campaign.endDate).getTime())
                                  ? `${t('endsOn')} ${new Date(campaign.endDate).toLocaleDateString('fr-FR')}`
                                  : t('na')}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {/* Toujours une barre : si targetAmount > 0 → collecté/cible, sinon → déboursé/collecté par défaut */}
                            {((campaign.targetAmount ?? 0) > 0) ? (
                              <>
                                <div className="flex justify-between text-sm gap-4">
                                  <span className="text-white font-medium">
                                    {formatAmount(campaign.currentAmount)} {t('collected')}
                                  </span>
                                  <span className="text-[#5AB678] font-semibold">
                                    {formatAmount(campaign.targetAmount ?? 0)} {t('target')}
                                  </span>
                                </div>
                                <div className="w-full bg-white rounded-full h-2 sm:h-3 overflow-hidden flex">
                                  <div
                                    className="h-full bg-[#5AB678]"
                                    style={{ width: `${Math.min(100, ((campaign.targetAmount ?? 0) > 0 ? (campaign.currentAmount / (campaign.targetAmount ?? 1)) * 100 : 0))}%` }}
                                  />
                                  <div className="h-full flex-1 bg-white/40" />
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex justify-between text-sm gap-4">
                                  <span className="text-[#5AB678] font-semibold">
                                    {formatAmount(campaign.amountSpent ?? 0)} {t('disbursed')}
                                  </span>
                                  <span className="text-white font-medium">
                                    {formatAmount(campaign.currentAmount)} {t('collected')}
                                  </span>
                                </div>
                                <div className="w-full bg-white rounded-full h-2 sm:h-3 overflow-hidden flex">
                                  <div
                                    className="h-full bg-[#5AB678]"
                                    style={{ width: `${Math.min(100, ((campaign.amountSpent ?? 0) / Math.max(campaign.currentAmount, campaign.amountSpent ?? 0, 1)) * 100)}%` }}
                                  />
                                  <div className="h-full flex-1 bg-white/40" />
                                </div>
                              </>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div />
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                                style={{ background: 'linear-gradient(to right, #5AB678, #20B6B3)' }}
                              >
                                <span>{t('support')}</span>
                                <ArrowRight size={14} className="sm:w-4 sm:h-4" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Results */}
        {!loading && filteredCampaigns.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {t('noCampaignsFound')}
            </h3>
            <p className="text-white/70">
              {campaigns.length === 0 ? t('noCampaignsActive') : t('tryFilters')}
            </p>
          </motion.div>
        )}
      </div>

      {/* Section "Emportez Amane+ partout avec vous" */}
      <section className="py-20" style={{ background: 'linear-gradient(to top, #d6fcf6, #229693)' }}>
        <div className="px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
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
                  {t('takeAmaneEverywhere')}
                </h2>
                <p className="text-lg text-white/80 mb-8 leading-relaxed">
                {t('takeAmaneDescription')}
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

      {/* Modal de don général (Offrir Sans Choisir) : pas de campaignId → POST /api/donations/general */}
      <MakeDonationModal
        isOpen={showDonationModal}
        onClose={() => {
          setShowDonationModal(false);
          setPendingDonationState(null);
        }}
        balance={walletBalance}
        campaignId={null}
        accessToken={accessToken ?? null}
        donorName={user?.name ?? null}
        onSuccess={() => setShowDonationModal(false)}
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