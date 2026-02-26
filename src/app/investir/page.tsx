'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, TrendingUp, Users, Target, Calendar, MapPin,
  Star, Eye, Share2, Bookmark, Globe, Zap,
  ChevronDown, ChevronUp, ArrowRight, Play, Pause, Shield, Calculator,
  Building, Leaf, CheckCircle, BarChart3, X, Apple, Mail, Phone, User
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getInvestmentProducts, getMyInvestments, mapInvestmentToDisplay, API_CATEGORY_TO_SLUG, type InvestmentProductDisplay, type InvestmentCategorySlug, type MyInvestment } from '@/services/investments';
import MakeInvestmentModal from '@/components/MakeInvestmentModal';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeNewsletter } from '@/services/newsletter';

/** Formulaire liste d'attente (affiché quand displayPromoteContent) */
function WaitlistForm({ onToast }: { onToast?: (message: string, type?: 'success' | 'error') => void }) {
  const t = useTranslations('investir');
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

export default function InvestirPage() {
  const t = useTranslations('investir');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<InvestmentProductDisplay | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | null>(null);
  const { accessToken, user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});
  const [activeTab, setActiveTab] = useState<'products' | 'investments'>('products');
  const [showInvestmentDetails, setShowInvestmentDetails] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const [products, setProducts] = useState<InvestmentProductDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [investments, setInvestments] = useState<MyInvestment[]>([]);
  const [investmentsLoading, setInvestmentsLoading] = useState(false);
  const [investmentsError, setInvestmentsError] = useState<string | null>(null);

  /** Affiche le design "promote" (hero, principes, opportunités) au lieu des onglets + filtres + listes */
  const displayPromoteContent = process.env.NEXT_PUBLIC_INVESTIR_DISPLAY_PROMOTE === 'true';

  useEffect(() => {
    let cancelled = false;
    getInvestmentProducts()
      .then((list) => {
        if (!cancelled) setProducts(list.map(mapInvestmentToDisplay));
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? t('errorLoadProducts'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (activeTab !== 'investments' || !accessToken) {
      if (!accessToken) setInvestments([]);
      return;
    }
    let cancelled = false;
    setInvestmentsLoading(true);
    setInvestmentsError(null);
    getMyInvestments(accessToken)
      .then((list) => { if (!cancelled) setInvestments(list); })
      .catch((err) => {
        if (!cancelled) {
          setInvestmentsError(err?.message ?? t('errorLoadInvestments'));
          setInvestments([]);
        }
      })
      .finally(() => { if (!cancelled) setInvestmentsLoading(false); });
    return () => { cancelled = true; };
  }, [activeTab, accessToken]);

  const categoryIcons: Record<InvestmentCategorySlug, React.ComponentType<{ size?: number; className?: string }>> = {
    immobilier: Building,
    agriculture: Leaf,
    technologie: Zap,
    energie: Zap,
  };

  const categoryColors: Record<InvestmentCategorySlug, string> = {
    immobilier: 'bg-green-500',
    agriculture: 'bg-blue-500',
    technologie: 'bg-purple-500',
    energie: 'bg-orange-500',
  };

  /** Ordre d’affichage des catégories API dans le filtre */
  const API_CATEGORY_ORDER = ['REAL_ESTATE', 'ETHICAL', 'AGRICULTURE', 'TECHNOLOGY', 'TECH', 'ENERGY'];

  const riskColors = {
    faible: 'bg-green-500',
    modere: 'bg-yellow-500',
    eleve: 'bg-red-500',
  };

  // Images pour chaque catégorie
  const categoryImages = {
    immobilier: [
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop'
    ],
    agriculture: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1574943320219-553eb213f72f?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=400&h=300&fit=crop'
    ],
    technologie: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
    ],
    energie: [
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop'
    ]
  };

  // Fonction pour changer d'image
  const nextImage = (productId: string, category: string) => {
    const images = categoryImages[category as keyof typeof categoryImages] || [];
    const currentIndex = currentImageIndex[productId] || 0;
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: nextIndex
    }));
  };

  const DEFAULT_PRODUCT_IMAGE = '/images/no-picture.png';

  const getProductImage = (product: InvestmentProductDisplay) =>
    product.picture || DEFAULT_PRODUCT_IMAGE;

  const hasMultipleImages = (_product: InvestmentProductDisplay) => false;

  /** Filtres : "Toutes" + catégories API des investissements, dédupliquées et ordonnées */
  const getApiCategoryName = (apiCat: string) => {
    const key: Record<string, string> = {
      REAL_ESTATE: 'categoryRealEstate',
      AGRICULTURE: 'categoryAgriculture',
      ETHICAL: 'categoryEthical',
      TECHNOLOGY: 'categoryTechnology',
      TECH: 'categoryTechnology',
      ENERGY: 'categoryEnergy',
    };
    return key[apiCat] ? t(key[apiCat] as 'categoryRealEstate' | 'categoryAgriculture' | 'categoryEthical' | 'categoryTechnology' | 'categoryEnergy') : apiCat.replace(/_/g, ' ');
  };
  const categories = useMemo(() => {
    const uniqueApiCategories = Array.from(
      new Set(products.flatMap((p) => p.categories).filter(Boolean))
    );
    const ordered = API_CATEGORY_ORDER.filter((apiCat) =>
      uniqueApiCategories.includes(apiCat)
    );
    const rest = uniqueApiCategories.filter((apiCat) => !API_CATEGORY_ORDER.includes(apiCat)).sort();
    const allOrdered = [...ordered, ...rest];
    return [
      { id: 'all', name: t('filterAll'), icon: Globe, color: 'bg-gray-500' },
      ...allOrdered.map((apiCat) => {
        const slug = API_CATEGORY_TO_SLUG[apiCat] ?? 'immobilier';
        return {
          id: apiCat,
          name: getApiCategoryName(apiCat),
          icon: categoryIcons[slug],
          color: categoryColors[slug],
        };
      }),
    ];
  }, [products, t]);

  const sortOptions = [
    { id: 'popular', name: t('sortPopular') },
    { id: 'recent', name: t('sortRecent') },
    { id: 'return', name: t('sortReturn') },
    { id: 'risk', name: t('sortRisk') },
  ];

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || product.categories.includes(selectedCategory);
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.expectedReturn - a.expectedReturn;
        case 'recent':
          return (b.createdAt ?? '').localeCompare(a.createdAt ?? '');
        case 'return':
          return b.expectedReturn - a.expectedReturn;
        case 'risk':
          return a.riskLevel.localeCompare(b.riskLevel);
        default:
          return 0;
      }
    });

  // Effet pour le défilement automatique du carrousel (uniquement produits sans image API)
  useEffect(() => {
    const interval = setInterval(() => {
      filteredProducts.forEach((product) => {
        if (!hasMultipleImages(product)) return;
        const images = categoryImages[product.category as keyof typeof categoryImages] || [];
        if (images.length > 1) {
          const currentIndex = currentImageIndex[product.id] || 0;
          const nextIndex = (currentIndex + 1) % images.length;
          setCurrentImageIndex(prev => ({
            ...prev,
            [product.id]: nextIndex
          }));
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [filteredProducts, currentImageIndex, categoryImages]);

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

  const handleInvest = (product: InvestmentProductDisplay) => {
    if (!accessToken) {
      setToastMessage(t('connectToInvest'));
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    setSelectedProductForModal(product);
    setShowInvestmentModal(true);
  };

  const stats = [
    { label: t('activeInvestors'), value: '10K+', icon: Users },
    { label: t('avgReturn'), value: '8.5%', icon: TrendingUp },
    { label: t('productsAvailable'), value: '12+', icon: Target },
    { label: t('yearsExperience'), value: '15+', icon: Star },
  ];

  /** Libellé de catégorie produit pour affichage (badge) */
  const getProductCategoryLabel = (slug: InvestmentCategorySlug) => {
    const key: Record<InvestmentCategorySlug, string> = {
      immobilier: 'categoryRealEstate',
      agriculture: 'categoryAgriculture',
      technologie: 'categoryTechnology',
      energie: 'categoryEnergy',
    };
    return t(key[slug] as 'categoryRealEstate' | 'categoryAgriculture' | 'categoryTechnology' | 'categoryEnergy');
  };

  /** Icône par mot-clé dans le titre du produit */
  const getInvestmentIcon = (title: string) => {
    const t = (title || '').toLowerCase();
    if (t.includes('immobilier') || t.includes('immo')) return Building;
    if (t.includes('agriculture') || t.includes('agri')) return Leaf;
    if (t.includes('tech') || t.includes('innovation')) return Zap;
    if (t.includes('énergie') || t.includes('energie') || t.includes('auto')) return Zap;
    return TrendingUp;
  };

  /** Catégorie pour le filtre à partir du titre */
  const getInvestmentCategory = (title: string): InvestmentCategorySlug => {
    const t = (title || '').toLowerCase();
    if (t.includes('immobilier') || t.includes('immo')) return 'immobilier';
    if (t.includes('agriculture') || t.includes('agri')) return 'agriculture';
    if (t.includes('tech') || t.includes('innovation')) return 'technologie';
    if (t.includes('énergie') || t.includes('energie') || t.includes('auto')) return 'energie';
    return 'immobilier';
  };

  const formatInvestmentDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  /** Investissements mappés pour l'affichage */
  const myInvestmentsDisplay = useMemo(() => {
    return investments.map((inv) => {
      const product = inv.investmentSubscription?.investmentProduct;
      const title = product?.title ?? t('defaultProductTitle');
      const returnVal = parseFloat(product?.estimatedReturn ?? '0') || 0;
      return {
        id: inv.id,
        icon: getInvestmentIcon(title),
        name: title,
        shortName: title,
        category: getInvestmentCategory(title),
        amount: formatAmount(inv.amount),
        amountValue: inv.amount,
        status: inv.status === 'ACTIVE' ? t('statusActive') : inv.status,
        returnRate: `${returnVal}%`,
        returnRateValue: returnVal,
        startDate: formatInvestmentDate(inv.investmentDate),
        startDateValue: new Date(inv.investmentDate),
        description: t('investmentOfDesc', { amount: formatAmount(inv.amount), duration: product?.duration ?? '–' }),
        benefits: [t('estimatedReturnLabel') + ' ' + returnVal + '%', t('durationLabel') + ' ' + (product?.duration ?? '–') + ' ' + t('durationMonths')],
        raw: inv,
      };
    });
  }, [investments, t]);

  // Filtrer et trier les investissements
  const filteredInvestments = myInvestmentsDisplay
    .filter(investment => {
      const matchesSearch = investment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           investment.amount.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           investment.status.toLowerCase().includes(searchTerm.toLowerCase());
      const categorySlug = API_CATEGORY_TO_SLUG[selectedCategory] ?? selectedCategory;
      const matchesCategory = selectedCategory === 'all' || investment.category === categorySlug;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.amountValue - a.amountValue;
        case 'return':
          return b.returnRateValue - a.returnRateValue;
        case 'recent':
          return b.startDateValue.getTime() - a.startDateValue.getTime();
        case 'risk':
          return a.amountValue - b.amountValue;
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
            <h3 className="text-white text-xl font-bold mb-2">{t('investir')}</h3>
            <nav className="text-sm mb-2">
              <Link href="/">
                <span className="text-gray-300 font-bold">{t('home')}</span>
              </Link>
              <span className="text-gray-300 mx-2">/</span>
              <span className="text-green-400">{t('investir')}</span>
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
                    <Image src="/images/Image(8).png" alt={t('investir')} width={100} height={100} />
                  </div>
                </motion.div>
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
                  {t('heroProductsTitle')}
                </h1>
                <p className="text-xl text-white mb-12 max-w-3xl mx-auto leading-relaxed">
                  {t('discoverSubtitle')}
                </p>
              </motion.div>

              <div className="relative w-full min-h-[400px] rounded-2xl overflow-hidden mb-16 bg-[#0d1414]">
                <Image
                  src="/images/invest-bg.png"
                  alt={t('altEthicalInvestment')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-[#101919]/40 rounded-2xl p-6 border border-white/10"
                >
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                    <p>🚫</p>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{t('cardNoRibaTitle')}</h3>
                  <p className="text-white/80 leading-relaxed">
                    {t('cardNoRibaDesc')}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-[#101919]/40 rounded-2xl p-6 border border-white/10"
                >
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                    <BarChart3 size={24} className="text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{t('cardRealEconomyTitle')}</h3>
                  <p className="text-white/80 leading-relaxed">
                    {t('cardRealEconomyDesc')}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-[#101919]/40 rounded-2xl p-6 border border-white/10"
                >
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                    <p>✅</p>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{t('cardShariaTitle')}</h3>
                  <p className="text-white/80 leading-relaxed">
                    {t('cardShariaDesc')}
                  </p>
                </motion.div>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-white text-center mb-10">
                {t('opportunitiesComingTitle')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
                {[
                  { titleKey: 'opportunityImmo' as const, descKey: 'opportunityImmoDesc' as const, image: '/images/invest-immo.png' },
                  { titleKey: 'opportunitySukuk' as const, descKey: 'opportunitySukukDesc' as const, image: '/images/sukuk.png' },
                  { titleKey: 'opportunityMudaraba' as const, descKey: 'opportunityMudarabaDesc' as const, image: '/images/mudaraba.png' },
                ].map((card, index) => (
                  <motion.div
                    key={card.titleKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="group relative rounded-2xl overflow-hidden shadow-xl"
                  >
                    <div className="relative w-full aspect-[4/5]">
                      <Image
                        src={card.image}
                        alt={t(card.titleKey)}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className="text-xl font-bold mb-2">{t(card.titleKey)}</h3>
                        <p className="text-white/90 text-sm">{t(card.descKey)}</p>
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
                  <div className="bg-[#00644d] rounded-full flex items-center justify-center shadow-2xl">
                    <Image src="/images/Image(8).png" alt={t('investir')} width={100} height={100} />
                  </div>
                </motion.div>
                
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
                  {t('heroProductsTitle')}
                </h1>
                <p className="text-xl text-white mb-12 max-w-3xl mx-auto leading-relaxed">
                  {t('discoverSubtitle')}
                </p>

                <div className="flex justify-center gap-4 mb-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('products')}
                    className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
                      activeTab === 'products'
                        ? 'bg-[#192D2D] text-[#5FB678]'
                        : 'text-[#D9D9D9]'
                    }`}
                  >
                    {t('tabProducts')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('investments')}
                    className={`px-6 py-3 rounded-full font-bold transition-all duration-200 ${
                      activeTab === 'investments'
                        ? 'bg-[#192D2D] text-[#5FB678]'
                        : 'text-[#D9D9D9]'
                    }`}
                  >
                    {t('tabMyInvestments')}
                  </motion.button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
                  <motion.div
                    whileHover={{ y: -5, rotate: 5 }}
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }, y: { duration: 0.2 } }}
                    className="bg-[#00644d]/20 rounded-2xl p-6 shadow-lg"
                  >
                    <div className="text-center">
                      <motion.div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3" animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
                        <Target size={24} className="text-green-600" />
                      </motion.div>
                      <p className="text-2xl font-bold text-white">{products.length}</p>
                      <p className="text-sm text-white">{t('productsAvailable')}</p>
                    </div>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -5, rotate: -5 }}
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{ rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }, y: { duration: 0.2 } }}
                    className="bg-[#00644d]/20 rounded-2xl p-6 shadow-lg"
                  >
                    <div className="text-center">
                      <motion.div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3" animate={{ rotate: [0, -360] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
                        <Users size={24} className="text-green-600" />
                      </motion.div>
                      <p className="text-2xl font-bold text-white">10K+</p>
                      <p className="text-sm text-white">{t('activeInvestors')}</p>
                    </div>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -5, rotate: 5 }}
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }, y: { duration: 0.2 } }}
                    className="bg-[#00644d]/20 rounded-2xl p-6 shadow-lg"
                  >
                    <div className="text-center">
                      <motion.div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3" animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
                        <TrendingUp size={24} className="text-green-600" />
                      </motion.div>
                      <p className="text-2xl font-bold text-white">8.5%</p>
                      <p className="text-sm text-white">{t('avgReturn')}</p>
                    </div>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -5, rotate: -5 }}
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{ rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }, y: { duration: 0.2 } }}
                    className="bg-[#00644d]/20 rounded-2xl p-6 shadow-lg"
                  >
                    <div className="text-center">
                      <motion.div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3" animate={{ rotate: [0, -360] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
                        <Star size={24} className="text-orange-600" />
                      </motion.div>
                      <p className="text-2xl font-bold text-white">15+</p>
                      <p className="text-sm text-white">{t('yearsExperience')}</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {!displayPromoteContent && (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Filters Section */}
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
                  placeholder={activeTab === 'products' ? t('searchPlaceholder') : t('searchMyPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-green-400 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200 text-white placeholder-white/80 bg-transparent"
                  title={activeTab === 'products' ? t('searchPlaceholder') : t('searchMyPlaceholder')}
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
                  title={activeTab === 'products' ? t('sortBy') : t('sortMyBy')}
                  aria-label={activeTab === 'products' ? t('sortBy') : t('sortMyBy')}
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
        {activeTab === 'products' ? (
          <>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-white"
          >
            {error}
          </motion.div>
        )}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-12 h-12 border-4 border-[#5FB678] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-white/80">Chargement des produits...</p>
          </motion.div>
        ) : (
          <>
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
              {filteredProducts.map((product, index) => {
                const IconComponent = categoryIcons[product.category];
                
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="group"
                  >
                    <div className="bg-[#101919] rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
                      <div className="relative">
                        <div className="w-full h-48 relative overflow-hidden">
                          <AnimatePresence mode="wait">
                            <motion.img
                              key={hasMultipleImages(product) ? `${product.id}-${currentImageIndex[product.id] || 0}` : product.id}
                              src={getProductImage(product)}
                              alt={product.name}
                              className="w-full h-full object-cover absolute inset-0"
                              initial={{ x: 300, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              exit={{ x: -300, opacity: 0 }}
                              transition={{ duration: 0.5, ease: "easeInOut" }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = DEFAULT_PRODUCT_IMAGE;
                              }}
                            />
                          </AnimatePresence>
                          <div className="absolute inset-0 bg-black/20"></div>
                          
                          {hasMultipleImages(product) && (
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                              {categoryImages[product.category as keyof typeof categoryImages]?.map((_, index) => (
                                <div
                                  key={index}
                                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                    (currentImageIndex[product.id] || 0) === index
                                      ? 'bg-white'
                                      : 'bg-white/50'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                          
                          {/* Bouton pour voir les détails */}
                          <Link href={`/investir/${product.id}`}>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-green-500 transition-colors z-10"
                              title={t('viewDetailsProduct')}
                            >
                              <Eye size={16} />
                            </motion.button>
                          </Link>
                        </div>
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                            categoryColors[product.category]
                          }`}>
                            {getProductCategoryLabel(product.category)}
                          </span>
                        </div>
                        <div className="absolute top-4 right-12">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                              riskColors[product.riskLevel]
                            }`}>
                              {t('riskLabel')} {product.riskLevel === 'faible' ? t('riskLow') : product.riskLevel === 'modere' ? t('riskModerate') : t('riskHigh')}
                            </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-white/80 mb-4 line-clamp-2">
                          {product.description}
                        </p>

                          <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-white/80">{t('expectedReturnLabel')}</span>
                              <span className="font-semibold text-white">
                                {product.expectedReturn}%
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/80">{t('minInvestmentLabel')}</span>
                              <span className="font-semibold text-white truncate">
                                {formatCompactAmount(product.minInvestment)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/80">{t('durationLabel')}</span>
                              <span className="font-semibold text-white">
                                {product.duration}
                              </span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h4 className="font-bold text-white mb-3">{t('benefitsIncludedLabel')}</h4>
                            <ul className="space-y-2">
                              {(product.benefits?.length ? product.benefits : [t('benefit1'), t('benefit2'), t('benefit3')]).map((benefit, i) => (
                                <li key={i} className="flex items-center space-x-2 text-sm text-white/80">
                                  <CheckCircle size={16} className="text-green-500" />
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex items-center justify-center">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleInvest(product)}
                              className="w-full px-3 py-2 bg-gradient-to-r from-[#5AB678] to-[#20B6B3] text-white rounded-2xl font-semibold hover:from-[#20b6b3] hover:to-[#00644d] transition-all duration-200 text-sm flex-shrink-0 ml-2"
                            >
                              {t('invest')}
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
              {filteredProducts.map((product, index) => {
                const IconComponent = categoryIcons[product.category];
                
                return (
                  <motion.div
                    key={product.id}
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
                            <AnimatePresence mode="wait">
                              <motion.img
                                key={hasMultipleImages(product) ? `${product.id}-list-${currentImageIndex[product.id] || 0}` : product.id}
                                src={getProductImage(product)}
                                alt={product.name}
                                className="w-full h-full object-cover absolute inset-0"
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -100, opacity: 0 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = DEFAULT_PRODUCT_IMAGE;
                                }}
                              />
                            </AnimatePresence>
                            <div className="absolute inset-0 bg-black/20"></div>
                            
                            {hasMultipleImages(product) && (
                              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                                {categoryImages[product.category as keyof typeof categoryImages]?.map((_, index) => (
                                  <div
                                    key={index}
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                                      (currentImageIndex[product.id] || 0) === index
                                        ? 'bg-white'
                                        : 'bg-white/50'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                            
                            {/* Bouton pour voir les détails */}
                            <Link href={`/investir/${product.id}`}>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="absolute top-1 right-1 w-6 h-6 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-green-500 transition-colors z-10"
                                title={t('viewDetailsProduct')}
                              >
                                <Eye size={12} />
                              </motion.button>
                            </Link>
                          </div>
                          <div className="absolute top-2 left-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${
                              categoryColors[product.category]
                            }`}>
                              {getProductCategoryLabel(product.category)}
                            </span>
                          </div>
                          <div className="absolute top-2 right-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${
                              riskColors[product.riskLevel]
                            }`}>
                              {t('riskLabel')} {product.riskLevel === 'faible' ? t('riskLow') : product.riskLevel === 'modere' ? t('riskModerate') : t('riskHigh')}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {product.description}
                          </p>

                          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                            <div className="flex items-center space-x-1">
                              <TrendingUp size={16} />
                              <span>{t('returnLabel')}: {product.expectedReturn}%</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar size={16} />
                              <span>{t('durationLabel')}: {product.duration}</span>
                            </div>
                          </div>

                            <div className="space-y-3">
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 mb-3">Avantages :</h4>
                              <ul className="space-y-2">
                                {(product.benefits?.length ? product.benefits : [t('benefit1'), t('benefit2'), t('benefit3')]).map((benefit, i) => (
                                  <li key={i} className="flex items-center space-x-2 text-sm text-gray-600">
                                    <CheckCircle size={16} className="text-green-500" />
                                    <span>{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-lg font-bold text-gray-900 truncate">
                                  {formatCompactAmount(product.minInvestment)}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                  investissement minimum
                                </p>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleInvest(product)}
                                className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center space-x-2 flex-shrink-0 ml-3"
                              >
                                <span>{t('invest')}</span>
                                <ArrowRight size={16} />
                              </motion.button>
                            </div>
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

        {/* No Results */}
        {!loading && filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucun produit trouvé
            </h3>
            <p className="text-white/80">
              Essayez de modifier vos critères de recherche
            </p>
          </motion.div>
        )}
          </>
        )}
          </>
        ) : (
          /* Section Mes investissements */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {investmentsLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-2 border-[#5FB678] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : investmentsError ? (
              <div className="rounded-2xl p-6 bg-red-500/10 border border-red-500/30 text-red-200 text-center">
                <p>{investmentsError}</p>
              </div>
            ) : !accessToken ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
                <div className="w-24 h-24 bg-[#2C3E3E] rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp size={32} className="text-[#5FB678]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{t('signIn')}</h3>
                <p className="text-white/80">{t('signInToInvestments')}</p>
              </motion.div>
            ) : filteredInvestments.length > 0 ? (
              filteredInvestments.map((investment, index) => {
                const IconComponent = investment.icon;
                return (
                  <motion.div
                    key={investment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                    onClick={() => {
                      setSelectedInvestment(investment);
                      setShowInvestmentDetails(true);
                    }}
                    className="bg-[#1A2A2A] rounded-3xl p-6 border border-[#5FB678] shadow-lg cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      {/* Section gauche : Icône et informations */}
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-12 h-12 bg-[#2C3E3E] rounded-xl flex items-center justify-center flex-shrink-0">
                          <IconComponent size={24} className="text-[#5FB678]" />
                        </div>
                        <div className="flex flex-col">
                          <h3 className="text-xl font-semibold text-white mb-1">
                            {investment.name}
                          </h3>
                          <p className="text-white/80 text-sm">
                            {investment.amount} • {investment.returnRate} de rendement
                          </p>
                        </div>
                      </div>

                      {/* Section droite : Statut et date */}
                      <div className="flex flex-col items-end">
                        <span className="text-[#5FB678] font-semibold mb-1">
                          {investment.status}
                        </span>
                        <p className="text-white/80 text-sm">
                          {investment.startDate}
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
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchTerm ? t('noInvestmentFound') : t('noInvestment')}
                </h3>
                <p className="text-white/80">
                  {searchTerm 
                    ? t('tryCriteria')
                    : t('noInvestmentYet')}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
      )}

      {/* Why Halal Investment Section */}
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
              {t('whyInvestHalalTitle')}
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              {t('whyInvestHalalSubtitle')}
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
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {t('whyEthicalTitle')}
              </h3>
              <p className="text-white/80 leading-relaxed">
                {t('whyEthicalDesc')}
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
                <BarChart3 size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {t('whyPerformanceTitle')}
              </h3>
              <p className="text-white/80 leading-relaxed">
                {t('whyPerformanceDesc')}
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
                <Target size={32} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {t('whyDiversificationTitle')}
              </h3>
              <p className="text-white/80 leading-relaxed">
                {t('whyDiversificationDesc')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {displayPromoteContent && (
      <section className="py-20 bg-[#121212]">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-10 leading-tight">
              Soyez averti en priorité dès le lancement des premières opportunités.
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


      {/* Investment Modal */}
      {selectedProductForModal && (
        <MakeInvestmentModal
          isOpen={showInvestmentModal}
          onClose={() => {
            setShowInvestmentModal(false);
            setSelectedProductForModal(null);
          }}
          balance={user?.wallet?.balance ?? 0}
          accessToken={accessToken ?? null}
          investmentProductId={selectedProductForModal.id}
          investmentProduct={selectedProductForModal}
          onSuccess={() => {
            setShowInvestmentModal(false);
            setSelectedProductForModal(null);
            if (activeTab === 'investments' && accessToken) {
              getMyInvestments(accessToken)
                .then(setInvestments)
                .catch(() => {});
            }
          }}
          onToast={(msg) => {
            setToastMessage(msg);
            setTimeout(() => setToastMessage(null), 4000);
          }}
          successTitle="Investissement confirmé !"
          successMessage="Votre investissement a été effectué avec succès."
          historyButtonText="Consulter l'historique"
          historyButtonLink="/transactions"
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

      {/* Investment Details Modal */}
      <AnimatePresence>
        {showInvestmentDetails && selectedInvestment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowInvestmentDetails(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0B1212] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-[#0B1212] rounded-t-3xl p-6 border-b border-[#1A2A2A] flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Détails de l'investissement</h3>
                <button 
                  onClick={() => setShowInvestmentDetails(false)} 
                  className="w-10 h-10 bg-[#5FB678] rounded-full flex items-center justify-center text-white hover:bg-[#4FA568] transition-colors"
                  title="Fermer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Investment Type Section */}
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-[#2C3E3E] rounded-full flex items-center justify-center flex-shrink-0">
                    <selectedInvestment.icon size={32} className="text-[#5FB678]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-white mb-2">
                      {selectedInvestment.shortName}
                    </h4>
                    <p className="text-white/80">
                      {selectedInvestment.description}
                    </p>
                  </div>
                </div>

                {/* Status and Date */}
                <div className="flex flex-col space-y-2">
                  <span className="text-[#5FB678] font-semibold text-lg">
                    {selectedInvestment.status}
                  </span>
                  <p className="text-white/80">
                    Début: {selectedInvestment.startDate}
                  </p>
                </div>

                {/* Main Benefits Section */}
                <div className="space-y-4">
                  <h5 className="text-xl font-bold text-white">Avantages principaux</h5>
                  <ul className="space-y-3">
                    {(selectedInvestment.benefits ?? []).map((benefit: string, index: number) => (
                      <li key={index} className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-[#5FB678] rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle size={16} className="text-white" />
                        </div>
                        <span className="text-white/80">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Additional Info */}
                <div className="pt-4 border-t border-[#1A2A2A] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Montant investi</span>
                    <span className="text-white font-semibold">{selectedInvestment.amount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Rendement</span>
                    <span className="text-white font-semibold">{selectedInvestment.returnRate}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 