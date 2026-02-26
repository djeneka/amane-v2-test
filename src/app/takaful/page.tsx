'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Shield, Users, Target, Calendar, MapPin,
  Star, Eye, Share2, Globe, Zap,
  ChevronDown, ChevronUp, ArrowRight, Play, Pause, Calculator,
  Heart, Car, Home, User, CheckCircle, X, Apple, Mail, Phone
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import MakeTakafulModal from '@/components/MakeTakafulModal';
import { useAuth } from '@/contexts/AuthContext';
import { getTakafulPlans, getMyTakafulSubscriptions, type TakafulPlan, type MyTakafulSubscription } from '@/services/takaful-plans';
import { subscribeNewsletter } from '@/services/newsletter';
import { takafulProducts, type TakafulProduct } from '@/data/mockData';

const DEFAULT_TAKAFUL_IMAGE = '/images/no-picture.png';

/** Convertit un TakafulProduct (mockData) en TakafulPlan pour réutilisation du même UI */
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

/** Catégorie affichée à partir des categories API (HEALTH, FAMILY, HOME, etc.) */
function getDisplayCategory(plan: TakafulPlan): 'sante' | 'automobile' | 'habitation' | 'vie' | 'autres' {
  const c = plan.categories || [];
  if (c.some((x) => x === 'HEALTH')) return 'sante';
  if (c.some((x) => x === 'HOME')) return 'habitation';
  if (c.some((x) => x === 'FAMILY')) return 'vie';
  if (c.some((x) => x === 'AUTO' || x === 'AUTOMOBILE')) return 'automobile';
  return 'autres';
}

/** Catégorie affichée à partir du titre du plan (pour filtrage souscriptions) */
function getDisplayCategoryFromTitle(title: string): 'sante' | 'automobile' | 'habitation' | 'vie' | 'autres' {
  const t = title.toLowerCase();
  if (t.includes('santé') || t.includes('sante') || t.includes('health')) return 'sante';
  if (t.includes('habitation') || t.includes('home')) return 'habitation';
  if (t.includes('vie') || t.includes('life')) return 'vie';
  if (t.includes('auto') || t.includes('moto')) return 'automobile';
  return 'autres';
}

/** Icône selon le titre du plan (Santé, Habitation, etc.) */
function getSubscriptionIcon(title: string) {
  const t = (title || '').toLowerCase();
  if (t.includes('santé') || t.includes('sante') || t.includes('health')) return Heart;
  if (t.includes('habitation') || t.includes('home')) return Home;
  if (t.includes('vie') || t.includes('life')) return User;
  if (t.includes('auto') || t.includes('moto')) return Car;
  return Shield;
}

function formatSubscriptionDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

/** Formulaire liste d'attente (design Figma - affiché quand displayPromoteContent) */
function WaitlistForm({ onToast }: { onToast?: (message: string, type?: 'success' | 'error') => void }) {
  const t = useTranslations('takaful');
  const [email, setEmail] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('+225');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fullPhone = `${phonePrefix}${phoneNumber.replace(/\s/g, '')}`;
      await subscribeNewsletter({ email, phoneNumber: fullPhone, name: fullName });
      onToast?.(t('waitlistSuccess'), 'success');
      setEmail('');
      setPhoneNumber('');
      setFullName('');
    } catch (err) {
      const message = err instanceof Error ? err.message : t('waitlistError');
      onToast?.(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="email"
          placeholder={t('emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#5AB678] focus:border-[#5AB678] outline-none transition-all"
          required
        />
      </div>

      <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white">
        <div className="flex items-center bg-gray-50 border-r border-gray-200 px-4">
          <select
            value={phonePrefix}
            onChange={(e) => setPhonePrefix(e.target.value)}
            className="bg-transparent text-gray-600 font-medium py-4 pr-2 focus:ring-0 focus:outline-none cursor-pointer appearance-none"
            aria-label={t('countryCodeLabel')}
          >
            <optgroup label={t('optgroupWestAfrica')}>
              <option value="+225">🇨🇮 +225</option>
              <option value="+221">🇸🇳 +221</option>
              <option value="+223">🇲🇱 +223</option>
              <option value="+226">🇧🇫 +226</option>
              <option value="+227">🇳🇪 +227</option>
              <option value="+228">🇹🇬 +228</option>
              <option value="+229">🇧🇯 +229</option>
              <option value="+233">🇬🇭 +233</option>
              <option value="+234">🇳🇬 +234</option>
              <option value="+224">🇬🇳 +224</option>
              <option value="+231">🇱🇷 +231</option>
              <option value="+232">🇸🇱 +232</option>
              <option value="+238">🇨🇻 +238</option>
            </optgroup>
            <optgroup label={t('optgroupEurope')}>
              <option value="+33">🇫🇷 +33</option>
              <option value="+32">🇧🇪 +32</option>
              <option value="+41">🇨🇭 +41</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+49">🇩🇪 +49</option>
              <option value="+34">🇪🇸 +34</option>
              <option value="+39">🇮🇹 +39</option>
              <option value="+31">🇳🇱 +31</option>
              <option value="+351">🇵🇹 +351</option>
              <option value="+48">🇵🇱 +48</option>
            </optgroup>
            <optgroup label={t('optgroupNorthAmerica')}>
              <option value="+1">🇺🇸 🇨🇦 +1</option>
            </optgroup>
          </select>
        </div>
        <div className="flex-1 flex items-center">
          <Phone size={20} className="ml-4 text-gray-400 flex-shrink-0" />
          <input
            type="tel"
            placeholder={t('phonePlaceholder')}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full pl-3 pr-4 py-4 bg-white text-gray-900 placeholder-gray-400 focus:ring-0 focus:outline-none border-0"
          />
        </div>
      </div>

      <div className="relative">
        <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={t('fullNamePlaceholder')}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#5AB678] focus:border-[#5AB678] outline-none transition-all"
          required
        />
      </div>

      <motion.button
        type="submit"
        disabled={submitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#5AB678] to-[#20B6B3] hover:from-[#20B6B3] hover:to-[#00644d] transition-all duration-200 disabled:opacity-70"
      >
        {submitting ? t('submitting') : t('waitlistSubmit')}
      </motion.button>
    </form>
  );
}

export default function TakafulPage() {
  const t = useTranslations('takaful');
  const getCategoryLabel = (displayCat: string) => {
    const key: Record<string, string> = { sante: 'categoryHealth', automobile: 'categoryAuto', habitation: 'categoryHome', vie: 'categoryLife', autres: 'categoryOther' };
    return key[displayCat] ? t(key[displayCat] as 'categoryHealth' | 'categoryAuto' | 'categoryHome' | 'categoryLife' | 'categoryOther') : displayCat;
  };
  const { accessToken, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [showTakafulModal, setShowTakafulModal] = useState(false);
  const [takafulModalConfig, setTakafulModalConfig] = useState<
    | { mode: 'new'; plan: TakafulPlan }
    | { mode: 'payment'; subscription: MyTakafulSubscription }
    | null
  >(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | null>(null);
  const [activeTab, setActiveTab] = useState<'solutions' | 'subscriptions'>('solutions');
  const [showSubscriptionDetails, setShowSubscriptionDetails] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<MyTakafulSubscription | null>(null);
  const [plans, setPlans] = useState<TakafulPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<MyTakafulSubscription[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [subscriptionsError, setSubscriptionsError] = useState<string | null>(null);

  /** Affiche le design "promote" (hero, principes, opportunités) au lieu des onglets + filtres + listes */
  const displayPromoteContent = process.env.NEXT_PUBLIC_TAKAFUL_DISPLAY_PROMOTE === 'true';

  useEffect(() => {
    const displayPromote = process.env.NEXT_PUBLIC_TAKAFUL_DISPLAY_PROMOTE === 'true';
    if (displayPromote) {
      setPlans(takafulProducts.map(mockTakafulProductToPlan));
      setPlansError(null);
      setPlansLoading(false);
      return;
    }
    let cancelled = false;
    setPlansLoading(true);
    setPlansError(null);
    getTakafulPlans()
      .then((list) => { if (!cancelled) setPlans(list); })
      .catch((err) => {
        if (!cancelled) {
          setPlansError(err?.message ?? t('errorLoadPlans'));
          setPlans([]);
        }
      })
      .finally(() => { if (!cancelled) setPlansLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (activeTab !== 'subscriptions' || !accessToken) {
      if (!accessToken) setSubscriptions([]);
      return;
    }
    let cancelled = false;
    setSubscriptionsLoading(true);
    setSubscriptionsError(null);
    getMyTakafulSubscriptions(accessToken)
      .then((list) => { if (!cancelled) setSubscriptions(list); })
      .catch((err) => {
        if (!cancelled) {
          setSubscriptionsError(err?.message ?? t('errorLoadSubscriptions'));
          setSubscriptions([]);
        }
      })
      .finally(() => { if (!cancelled) setSubscriptionsLoading(false); });
    return () => { cancelled = true; };
  }, [activeTab, accessToken]);

  const categoryIcons: Record<string, typeof Heart> = {
    sante: Heart,
    automobile: Car,
    habitation: Home,
    vie: User,
    autres: Shield,
  };

  const categoryColors: Record<string, string> = {
    sante: 'bg-green-500',
    automobile: 'bg-blue-500',
    habitation: 'bg-purple-500',
    vie: 'bg-orange-500',
    autres: 'bg-gray-500',
  };

  const categories = [
    { id: 'all', name: t('categoryAll'), icon: Globe, color: 'bg-gray-500' },
    { id: 'sante', name: t('categoryHealth'), icon: Heart, color: 'bg-green-500' },
    { id: 'automobile', name: t('categoryAuto'), icon: Car, color: 'bg-blue-500' },
    { id: 'habitation', name: t('categoryHome'), icon: Home, color: 'bg-purple-500' },
    { id: 'vie', name: t('categoryLife'), icon: User, color: 'bg-orange-500' },
    { id: 'autres', name: t('categoryOther'), icon: Shield, color: 'bg-gray-500' },
  ];

  const sortOptions = [
    { id: 'popular', name: t('sortPopular') },
    { id: 'recent', name: t('sortRecent') },
    { id: 'price', name: t('sortPrice') },
    { id: 'coverage', name: t('sortCoverage') },
  ];

  const filteredPlans = plans
    .filter((plan) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (plan.title && plan.title.toLowerCase().includes(term)) ||
        (plan.description && plan.description.toLowerCase().includes(term));
      const displayCat = getDisplayCategory(plan);
      const matchesCategory = selectedCategory === 'all' || displayCat === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.monthlyContribution ?? 0) - (a.monthlyContribution ?? 0);
        case 'price':
          return (a.monthlyContribution ?? 0) - (b.monthlyContribution ?? 0);
        case 'coverage':
          return (b.monthlyContribution ?? 0) - (a.monthlyContribution ?? 0);
        case 'recent':
          return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
        default:
          return 0;
      }
    });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactAmount = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}Mds F CFA`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M F CFA`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K F CFA`;
    } else {
      return formatAmount(amount);
    }
  };

  const handleSubscribe = (plan: TakafulPlan) => {
    if (!accessToken) {
      setToastMessage(t('connectToSubscribe'));
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    setTakafulModalConfig({ mode: 'new', plan });
    setShowTakafulModal(true);
  };

  const handlePay = (subscription: MyTakafulSubscription) => {
    if (!accessToken) {
      setToastMessage(t('connectToPay'));
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    setTakafulModalConfig({ mode: 'payment', subscription });
    setShowSubscriptionDetails(false);
    setShowTakafulModal(true);
  };

  const handleTakafulModalClose = () => {
    setShowTakafulModal(false);
    setTakafulModalConfig(null);
  };

  const handleTakafulSuccess = () => {
    handleTakafulModalClose();
    if (activeTab === 'subscriptions' && accessToken) {
      getMyTakafulSubscriptions(accessToken)
        .then((list) => setSubscriptions(list))
        .catch(() => {});
    }
  };

  const statsData = [
    { 
      label: t('productsAvailable'), 
      value: plans.length, 
      icon: Target,
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      rotateDirection: 1, // 1 pour rotation positive, -1 pour négative
      hoverRotate: 5
    },
    { 
      label: t('clientsProtected'), 
      value: '50K+', 
      icon: Users,
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      rotateDirection: -1,
      hoverRotate: -5
    },
    { 
      label: t('satisfaction'), 
      value: '98%', 
      icon: Star,
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      rotateDirection: 1,
      hoverRotate: 5
    },
    { 
      label: t('countriesCovered'), 
      value: '15+', 
      icon: Globe,
      iconBgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      rotateDirection: -1,
      hoverRotate: -5
    },
  ];

  // Filtrer et trier les souscriptions (données API getMyTakafulSubscriptions)
  const filteredSubscriptions = subscriptions
    .filter((sub) => {
      const plan = sub.takafulPlan;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (plan.title && plan.title.toLowerCase().includes(term)) ||
        (plan.monthlyContribution?.toString().includes(term)) ||
        sub.status.toLowerCase().includes(term);
      const displayCat = getDisplayCategoryFromTitle(plan?.title ?? '');
      const matchesCategory = selectedCategory === 'all' || displayCat === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const contribA = a.takafulPlan.monthlyContribution ?? 0;
      const contribB = b.takafulPlan.monthlyContribution ?? 0;
      const dateA = a.nextPaymentDate ? new Date(a.nextPaymentDate).getTime() : new Date(a.endDate).getTime();
      const dateB = b.nextPaymentDate ? new Date(b.nextPaymentDate).getTime() : new Date(b.endDate).getTime();
      switch (sortBy) {
        case 'popular':
          return contribB - contribA;
        case 'price':
          return contribA - contribB;
        case 'recent':
          return dateB - dateA;
        case 'coverage':
          return contribB - contribA;
        default:
          return 0;
      }
    });

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
          {/* Titre et fil d'Ariane en haut à gauche */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start mb-8"
          >
            {/* Fil d'Ariane */}
            <h3 className="text-white text-xl font-bold mb-2">Takaful</h3>
            <nav className="text-sm mb-2">
              <Link href="/">
                <span className="text-gray-300 font-bold">{t('home')}</span>
              </Link>
              <span className="text-gray-300 mx-2">/</span>
              <span className="text-green-400">Takaful</span>
            </nav>
          </motion.div>

          {displayPromoteContent ? (
            <>
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
                  <div className="bg-[#00644d] rounded-full flex items-center justify-center shadow-2xl">
                    <Image src="/images/Image(9).png" alt="Takaful" width={100} height={100} className="object-contain" />
                  </div>
                </motion.div>
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
                  {t('heroTitle')}
                </h1>
                <p className="text-xl text-white mb-12 max-w-3xl mx-auto leading-relaxed">
                  {t('heroSubtitle')}
                </p>
              </motion.div>


              <div className="relative w-full min-h-[400px] rounded-2xl overflow-hidden mb-16 bg-[#0d1414]">
                <Image
                  src="/images/tk-bg.png"
                  alt="Assurance islamique"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                />
              </div>

              {/* Principes Takaful */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-[#101919]/10 rounded-2xl p-6 border border-white/10"
                >
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4">
                    <p>🤝</p>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{t('solidarityTitle')}</h3>
                  <p className="text-white/80 leading-relaxed">
                    {t('solidarityDescLong')}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-[#101919]/10 rounded-2xl p-6 border border-white/10"
                >
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                    <p>🚫</p>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{t('zeroUncertaintyTitle')}</h3>
                  <p className="text-white/80 leading-relaxed">
                    {t('zeroUncertaintyDescLong')}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-[#101919]/10 rounded-2xl p-6 border border-white/10"
                >
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                    <p>💰</p>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{t('surplusSharingTitle')}</h3>
                  <p className="text-white/80 leading-relaxed">
                    {t('surplusSharingDescLong')}
                  </p>
                </motion.div>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-white text-center mb-10">
                {t('opportunitiesTitle')}
              </h2>

              {/* Cartes produits takaful (mockData lorsque NEXT_PUBLIC_TAKAFUL_DISPLAY_PROMOTE=true) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
                {plans.map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="group relative rounded-2xl overflow-hidden shadow-xl"
                  >
                    <div className="relative w-full aspect-[4/5]">
                      <Image
                        src={plan.picture && plan.picture.trim() ? plan.picture : DEFAULT_TAKAFUL_IMAGE}
                        alt={plan.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        onError={(e) => {
                          const t = e.target as HTMLImageElement;
                          t.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className="text-xl font-bold mb-2">{plan.title}</h3>
                        <p className="text-white/90 text-sm line-clamp-2">{plan.description}</p>
                        <p className="text-white/80 text-sm mt-2">
                          {plan.monthlyContribution != null && t('contributionPerMonthFormat', { amount: Number(plan.monthlyContribution).toLocaleString('fr-FR') })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <>
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
                  <div className=" bg-[#00644d] rounded-full flex items-center justify-center shadow-2xl">
                    <Image src="/images/Image(9).png" alt="Shield" width={100} height={100} className="object-contain" />
                  </div>
                </motion.div>
                
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
                  {t('heroProtectionTitle')}
                </h1>
                <p className="text-xl text-white mb-12 max-w-3xl mx-auto leading-relaxed">
                  {t('heroSubtitle')}
                </p>

                {/* Onglets Solutions takaful / Mes souscriptions */}
                <div className="flex justify-center gap-4 mb-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('solutions')}
                    className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
                      activeTab === 'solutions'
                        ? 'bg-[#192D2D] text-[#5FB678]'
                        : 'text-[#D9D9D9]'
                    }`}
                  >
                    {t('tabSolutions')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('subscriptions')}
                    className={`px-6 py-3 rounded-full font-bold transition-all duration-200 ${
                      activeTab === 'subscriptions'
                        ? 'bg-[#192D2D] text-[#5FB678]'
                        : 'text-[#D9D9D9]'
                    }`}
                  >
                    {t('tabMySubscriptions')}
                  </motion.button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
                  {statsData.map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                      <motion.div
                        key={index}
                        whileHover={{ y: -5, rotate: stat.hoverRotate }}
                        animate={{ rotate: [0, stat.hoverRotate, -stat.hoverRotate, 0] }}
                        transition={{ 
                          rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                          y: { duration: 0.2 }
                        }}
                        className="bg-[#00644d]/20 rounded-2xl p-6 shadow-lg"
                      >
                        <div className="text-center">
                          <motion.div 
                            className={`w-12 h-12 ${stat.iconBgColor} rounded-full flex items-center justify-center mx-auto mb-3`}
                            animate={{ rotate: [0, 360 * stat.rotateDirection] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                          >
                            <IconComponent size={24} className={stat.iconColor} />
                          </motion.div>
                          <p className="text-2xl font-bold text-white">{stat.value}</p>
                          <p className="text-sm text-white">{stat.label}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {!displayPromoteContent && (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Filters Section - Visible pour les deux onglets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#101919]/20 rounded-3xl shadow-xl p-6 mb-8"
        >
          <div className="space-y-6">
            {/* Search */}
            <div className="w-full">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/20" />
                <input
                  type="text"
                  placeholder={activeTab === 'solutions' ? t('searchPlaceholder') : t('searchMyPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-green-400 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200 text-white placeholder-white/80 bg-transparent"
                  title={activeTab === 'solutions' ? t('searchPlaceholder') : t('searchMyPlaceholder')}
                />
              </div>
            </div>

            {/* Filters and Controls Row */}
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 flex-1">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-3xl font-medium transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-[#101919] text-white shadow-lg'
                        : 'bg-[#101919]/20 text-white/80 hover:bg-[#101919]/50 border border-white/20'
                    }`}
                  >
                    <category.icon size={16} />
                    <span>{category.name}</span>
                  </motion.button>
                ))}
              </div>

              {/* Sort & View */}
              <div className="flex items-center space-x-4 flex-shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-4 focus:ring-[#00644d]/20 focus:border-[#00644d] transition-all duration-200 text-white"
                  title={activeTab === 'solutions' ? t('sortBy') : t('sortMyBy')}
                  aria-label={activeTab === 'solutions' ? t('sortBy') : t('sortMyBy')}
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>

                <div className="flex bg-[#00644d]/20 rounded-xl p-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'grid' ? 'bg-white/20 shadow-md' : 'text-gray-600'
                    }`}
                  >
                    <div className="grid grid-cols-2 gap-1 w-5 h-5">
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
                      viewMode === 'list' ? 'bg-[#101919] shadow-md' : 'text-gray-600'
                    }`}
                  >
                    <div className="space-y-1 w-5 h-5">
                      <div className="bg-current rounded-sm h-1"></div>
                      <div className="bg-current rounded-sm h-1"></div>
                      <div className="bg-current rounded-sm h-1"></div>
                    </div>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Affichage conditionnel selon l'onglet sélectionné */}
        {activeTab === 'solutions' ? (
          <>

        {/* Loading / Error */}
        {plansLoading && (
          <div className="text-center text-white/80 py-12">{t('loadingPlans')}</div>
        )}
        {!plansLoading && plansError && (
          <div className="text-center text-white/90 py-4">{plansError}</div>
        )}

        {/* Products Grid */}
        {!plansLoading && !plansError && (
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredPlans.map((plan, index) => {
                const displayCat = getDisplayCategory(plan);
                const planImage = plan.picture && plan.picture.trim() ? plan.picture : DEFAULT_TAKAFUL_IMAGE;
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="group"
                  >
                    <div className="bg-[#101919] rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
                      <div className="relative">
                        <div className="w-full h-48 relative overflow-hidden">
                          <img
                            src={planImage}
                            alt={plan.title}
                            className="w-full h-full object-cover absolute inset-0"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = DEFAULT_TAKAFUL_IMAGE;
                            }}
                          />
                          <div className="absolute inset-0 bg-black/20" />
                          <Link href={`/takaful/${plan.id}`}>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-green-500 transition-colors z-10"
                              title={t('viewProductDetails')}
                            >
                              <Eye size={16} />
                            </motion.button>
                          </Link>
                        </div>
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${categoryColors[displayCat] ?? categoryColors.autres}`}>
                            {getCategoryLabel(displayCat)}
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-600 transition-colors">
                          {plan.title}
                        </h3>
                        <p className="text-white/80 mb-4 line-clamp-2">
                          {plan.description}
                        </p>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-white/80">{t('monthlyContribution')}</span>
                              <span className="font-semibold text-white truncate">
                                {formatCompactAmount(plan.monthlyContribution ?? 0)}
                              </span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h4 className="font-bold text-white mb-3">{t('benefitsIncluded')}</h4>
                            <ul className="space-y-2">
                              {(plan.benefits ?? []).slice(0, 3).map((benefit, i) => (
                                <li key={i} className="flex items-center space-x-2 text-sm text-white/80">
                                  <CheckCircle size={16} className="text-green-500" />
                                  <span>{benefit}</span>
                                </li>
                              ))}
                              {(!plan.benefits || plan.benefits.length === 0) && (
                                <li className="text-sm text-white/60">—</li>
                              )}
                            </ul>
                          </div>

                          <div className="flex items-center justify-center">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleSubscribe(plan)}
                              className="w-full px-3 py-2 bg-gradient-to-r from-[#5AB678] to-[#20B6B3] text-white rounded-2xl font-semibold hover:from-[#20b6b3] hover:to-[#00644d] transition-all duration-200 text-sm flex-shrink-0 ml-2"
                            >
                              {t('subscribe')}
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
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
              {filteredPlans.map((plan, index) => {
                const displayCat = getDisplayCategory(plan);
                const planImage = plan.picture && plan.picture.trim() ? plan.picture : DEFAULT_TAKAFUL_IMAGE;
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                    className="group"
                  >
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          <div className="w-32 h-32 rounded-xl overflow-hidden relative">
                            <img
                              src={planImage}
                              alt={plan.title}
                              className="w-full h-full object-cover absolute inset-0"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = DEFAULT_TAKAFUL_IMAGE;
                              }}
                            />
                            <div className="absolute inset-0 bg-black/20" />
                            <Link href={`/takaful/${plan.id}`}>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="absolute top-1 right-1 w-6 h-6 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-green-500 transition-colors z-10"
                                title={t('viewProductDetails')}
                              >
                                <Eye size={12} />
                              </motion.button>
                            </Link>
                          </div>
                          <div className="absolute top-2 left-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${categoryColors[displayCat] ?? categoryColors.autres}`}>
                              {getCategoryLabel(displayCat)}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                            {plan.title}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {plan.description}
                          </p>

                          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                            <div className="flex items-center space-x-1">
                              <Calendar size={16} />
                              <span>{t('contributionPerMonthFormat', { amount: formatCompactAmount(plan.monthlyContribution ?? 0) })}</span>
                            </div>
                          </div>

                          <div className="mb-4">
                              <h4 className="font-medium text-gray-900 mb-3">{t('benefitsIncluded')}</h4>
                              <ul className="space-y-2">
                                {(plan.benefits ?? []).map((benefit, i) => (
                                  <li key={i} className="flex items-center space-x-2 text-sm text-gray-600">
                                    <CheckCircle size={16} className="text-green-500" />
                                    <span>{benefit}</span>
                                  </li>
                                ))}
                                {(!plan.benefits || plan.benefits.length === 0) && (
                                  <li className="text-sm text-gray-500">—</li>
                                )}
                              </ul>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-lg font-bold text-gray-900 truncate">
                                  {formatCompactAmount(plan.monthlyContribution ?? 0)}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                  {t('monthlyContributionLabel')}
                                </p>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSubscribe(plan)}
                                className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center space-x-2 flex-shrink-0 ml-3"
                              >
                                <span>{t('subscribe')}</span>
                                <ArrowRight size={16} />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
        )}

        {/* No Results */}
        {!plansLoading && !plansError && filteredPlans.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {t('noProductFound')}
            </h3>
            <p className="text-white/80">
              {t('tryCriteria')}
            </p>
          </motion.div>
        )}
          </>
        ) : (
          /* Section Mes souscriptions */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {subscriptionsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#5FB678] border-t-transparent" />
              </div>
            ) : subscriptionsError ? (
              <div className="rounded-2xl p-6 bg-red-500/10 border border-red-500/30 text-red-200 text-center">
                <p>{subscriptionsError}</p>
              </div>
            ) : !accessToken ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
                <div className="w-24 h-24 bg-[#2C3E3E] rounded-full flex items-center justify-center mx-auto mb-6">
                  <User size={32} className="text-[#5FB678]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{t('signIn')}</h3>
                <p className="text-white/80">{t('signInToSubscriptions')}</p>
              </motion.div>
            ) : filteredSubscriptions.length > 0 ? (
              filteredSubscriptions.map((subscription, index) => {
                const plan = subscription.takafulPlan;
                const IconComponent = getSubscriptionIcon(plan.title);
                const dueLabel = subscription.nextPaymentDate
                  ? `Prochain paiement : ${formatSubscriptionDate(subscription.nextPaymentDate)}`
                  : `Fin : ${formatSubscriptionDate(subscription.endDate)}`;
                return (
                  <motion.div
                    key={subscription.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                    onClick={() => {
                      setSelectedSubscription(subscription);
                      setShowSubscriptionDetails(true);
                    }}
                    className="bg-[#1A2A2A] rounded-3xl p-6 border border-[#5FB678] shadow-lg cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-12 h-12 bg-[#2C3E3E] rounded-xl flex items-center justify-center flex-shrink-0">
                          <IconComponent size={24} className="text-[#5FB678]" />
                        </div>
                        <div className="flex flex-col">
                          <h3 className="text-xl font-semibold text-white mb-1">
                            {plan.title}
                          </h3>
                          <p className="text-white/80 text-sm">
                            {formatAmount(plan.monthlyContribution)} / mois
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[#5FB678] font-semibold mb-1">
                          {subscription.status}
                        </span>
                        <p className="text-white/80 text-sm">
                          {dueLabel}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-[#2C3E3E] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={32} className="text-[#5FB678]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchTerm ? t('noSubscriptionFound') : t('noSubscription')}
                </h3>
                <p className="text-white/80">
                  {searchTerm
                    ? 'Essayez de modifier vos critères de recherche'
                    : "Vous n'avez pas encore de souscription active"}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
      )}

      {/* Why Takaful Section */}
      <section className="py-20 bg-[#101919]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              {t('whyTakafulTitle')}
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              {t('whyTakafulSubtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {t('whyMutualityTitle')}
              </h3>
              <p className="text-white/80 leading-relaxed">
                {t('whyMutualityDesc')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {t('whyTransparencyTitle')}
              </h3>
              <p className="text-white/80 leading-relaxed">
                {t('whyTransparencyDesc')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star size={32} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {t('whyExcellenceTitle')}
              </h3>
              <p className="text-white/80 leading-relaxed">
                {t('whyExcellenceDesc')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section liste d'attente - visible uniquement quand displayPromoteContent */}
      {displayPromoteContent && (
      <section className="py-20 bg-[#101919]">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-10 leading-tight">
              {t('waitlistCta')}
            </h2>

            <WaitlistForm
              onToast={(msg, type) => {
                setToastMessage(msg);
                setToastType(type ?? 'success');
                setTimeout(() => {
                  setToastMessage(null);
                  setToastType(null);
                }, 4000);
              }}
            />
          </motion.div>
        </div>
      </section>
      )}

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
                  <motion.a
                    href="https://play.google.com/store/apps/details?id=com.infinity.africa.technologies.amaneplus"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-black text-white px-6 py-4 rounded-xl font-semibold hover:bg-gray-900 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Play size={24} />
                    <span>{t('googlePlay')}</span>
                  </motion.a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Takaful Modal */}
      {takafulModalConfig && (
        <MakeTakafulModal
          isOpen={showTakafulModal}
          onClose={handleTakafulModalClose}
          balance={user?.wallet?.balance ?? 0}
          accessToken={accessToken ?? null}
          onSuccess={handleTakafulSuccess}
          onToast={(msg) => {
            setToastMessage(msg);
            setTimeout(() => setToastMessage(null), 4000);
          }}
          successTitle="Souscription confirmée !"
          successMessage="Votre souscription a été effectuée avec succès."
          historyButtonText="Consulter l'historique"
          historyButtonLink="/transactions"
          {...(takafulModalConfig.mode === 'new'
            ? { mode: 'new' as const, takafulPlanId: takafulModalConfig.plan.id, takafulPlan: takafulModalConfig.plan }
            : { mode: 'payment' as const, subscription: takafulModalConfig.subscription })}
        />
      )}

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl text-white font-medium shadow-lg"
            style={{
              background: toastType === 'error'
                ? 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)'
                : 'linear-gradient(90deg, #8DD17F 0%, #37C2B4 100%)',
            }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subscription Details Modal */}
      <AnimatePresence>
        {showSubscriptionDetails && selectedSubscription && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSubscriptionDetails(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0B1212] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-[#0B1212] rounded-t-3xl p-6 border-b border-[#1A2A2A] flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Détails de la souscription</h3>
                <button
                  onClick={() => setShowSubscriptionDetails(false)}
                  className="w-10 h-10 bg-[#5FB678] rounded-full flex items-center justify-center text-white hover:bg-[#4FA568] transition-colors"
                  title="Fermer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-[#2C3E3E] rounded-full flex items-center justify-center flex-shrink-0">
                    {(() => {
                      const IconComponent = getSubscriptionIcon(selectedSubscription.takafulPlan.title);
                      return <IconComponent size={32} className="text-[#5FB678]" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-white mb-2">
                      {selectedSubscription.takafulPlan.title}
                    </h4>
                    <p className="text-white/80">
                      Plan {selectedSubscription.takafulPlan.status}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <span className="text-[#5FB678] font-semibold text-lg">
                    {selectedSubscription.status}
                  </span>
                  <p className="text-white/80">
                    {selectedSubscription.nextPaymentDate
                      ? `Prochain paiement : ${formatSubscriptionDate(selectedSubscription.nextPaymentDate)}`
                      : `Fin : ${formatSubscriptionDate(selectedSubscription.endDate)}`}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Début</span>
                    <span className="text-white">{formatSubscriptionDate(selectedSubscription.startDate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Fin</span>
                    <span className="text-white">{formatSubscriptionDate(selectedSubscription.endDate)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#1A2A2A]">
                    <span className="text-white/80">{t('monthlyContribution')}</span>
                    <span className="text-white font-semibold">
                      {formatAmount(selectedSubscription.takafulPlan.monthlyContribution)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Contributions</span>
                    <span className="text-white">{selectedSubscription._count.contributions}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePay(selectedSubscription)}
                  className="w-full py-4 rounded-2xl font-semibold text-white transition-opacity"
                  style={{ background: 'linear-gradient(to right, #3AE1B4, #13A98B)' }}
                >
                  Payer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 