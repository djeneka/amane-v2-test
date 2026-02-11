'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, TrendingUp, Users, Target, Calendar, MapPin, 
  Star, Eye, Share2, Bookmark, Globe, Zap,
  ChevronDown, ChevronUp, ArrowRight, Play, Pause, Shield, Calculator,
  Building, Leaf, CheckCircle, BarChart3, X, Apple
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getInvestmentProducts, getMyInvestments, mapInvestmentToDisplay, API_CATEGORY_LABELS, API_CATEGORY_TO_SLUG, type InvestmentProductDisplay, type InvestmentCategorySlug, type MyInvestment } from '@/services/investments';
import MakeInvestmentModal from '@/components/MakeInvestmentModal';
import { useAuth } from '@/contexts/AuthContext';

export default function InvestirPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<InvestmentProductDisplay | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
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

  useEffect(() => {
    let cancelled = false;
    getInvestmentProducts()
      .then((list) => {
        if (!cancelled) setProducts(list.map(mapInvestmentToDisplay));
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? 'Erreur lors du chargement des produits');
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
          setInvestmentsError(err?.message ?? 'Erreur chargement des investissements');
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
      { id: 'all', name: 'Toutes', icon: Globe, color: 'bg-gray-500' },
      ...allOrdered.map((apiCat) => {
        const slug = API_CATEGORY_TO_SLUG[apiCat] ?? 'immobilier';
        return {
          id: apiCat,
          name: API_CATEGORY_LABELS[apiCat] ?? apiCat.replace(/_/g, ' '),
          icon: categoryIcons[slug],
          color: categoryColors[slug],
        };
      }),
    ];
  }, [products]);

  const sortOptions = [
    { id: 'popular', name: 'Plus populaires' },
    { id: 'recent', name: 'Plus récents' },
    { id: 'return', name: 'Rendement élevé' },
    { id: 'risk', name: 'Risque faible' },
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
      setToastMessage('Veuillez vous connecter pour investir.');
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    setSelectedProductForModal(product);
    setShowInvestmentModal(true);
  };

  const stats = [
    { label: 'Investisseurs actifs', value: '10K+', icon: Users },
    { label: 'Rendement moyen', value: '8.5%', icon: TrendingUp },
    { label: 'Produits disponibles', value: '12+', icon: Target },
    { label: 'Années d\'expérience', value: '15+', icon: Star },
  ];

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
      const title = product?.title ?? 'Investissement';
      const returnVal = parseFloat(product?.estimatedReturn ?? '0') || 0;
      return {
        id: inv.id,
        icon: getInvestmentIcon(title),
        name: title,
        shortName: title,
        category: getInvestmentCategory(title),
        amount: formatAmount(inv.amount),
        amountValue: inv.amount,
        status: inv.status === 'ACTIVE' ? 'Actif' : inv.status,
        returnRate: `${returnVal}%`,
        returnRateValue: returnVal,
        startDate: formatInvestmentDate(inv.investmentDate),
        startDateValue: new Date(inv.investmentDate),
        description: `Investissement de ${formatAmount(inv.amount)} — Durée ${product?.duration ?? '–'} mois.`,
        benefits: [`Rendement estimé ${returnVal}%`, `Durée ${product?.duration ?? '–'} mois`],
        raw: inv,
      };
    });
  }, [investments]);

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
            <h3 className="text-white text-xl font-bold mb-2">Investir</h3>
            <nav className="text-sm mb-2">
              <Link href="/">
                <span className="text-gray-300 font-bold">Accueil</span>
              </Link>
              <span className="text-gray-300 mx-2">/</span>
              <span className="text-green-400">Investir</span>
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
              <div className="bg-[#00644d] rounded-full flex items-center justify-center shadow-2xl">
                <Image src="/images/Image(8).png" alt="Investir" width={100} height={100} />
              </div>
            </motion.div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              Produits d'<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00644d] to-green-600">Investissement</span>
            </h1>
            <p className="text-xl text-white mb-12 max-w-3xl mx-auto leading-relaxed">
              Découvrez nos solutions d'investissement conformes aux principes islamiques. Placez votre argent de manière éthique et rentable.
            </p>

            {/* Onglets Produits d'investissement / Mes investissements */}
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
                Produits d'investissement
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
                Mes investissements
              </motion.button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
              <motion.div
                whileHover={{ y: -5, rotate: 5 }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ 
                  rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  y: { duration: 0.2 }
                }}
                className="bg-[#00644d]/20 rounded-2xl p-6 shadow-lg"
              >
                <div className="text-center">
                  <motion.div 
                    className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Target size={24} className="text-green-600" />
                  </motion.div>
                  <p className="text-2xl font-bold text-white">{products.length}</p>
                  <p className="text-sm text-white">Produits disponibles</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5, rotate: -5 }}
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ 
                  rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  y: { duration: 0.2 }
                }}
                className="bg-[#00644d]/20 rounded-2xl p-6 shadow-lg"
              >
                <div className="text-center">
                  <motion.div 
                    className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"
                    animate={{ rotate: [0, -360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Users size={24} className="text-green-600" />
                  </motion.div>
                  <p className="text-2xl font-bold text-white">10K+</p>
                  <p className="text-sm text-white">Investisseurs</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5, rotate: 5 }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ 
                  rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  y: { duration: 0.2 }
                }}
                className="bg-[#00644d]/20 rounded-2xl p-6 shadow-lg"
              >
                <div className="text-center">
                  <motion.div 
                    className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <TrendingUp size={24} className="text-green-600" />
                  </motion.div>
                  <p className="text-2xl font-bold text-white">8.5%</p>
                  <p className="text-sm text-white">Rendement moyen</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5, rotate: -5 }}
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ 
                  rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  y: { duration: 0.2 }
                }}
                className="bg-[#00644d]/20 rounded-2xl p-6 shadow-lg"
              >
                <div className="text-center">
                  <motion.div 
                    className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3"
                    animate={{ rotate: [0, -360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Star size={24} className="text-orange-600" />
                  </motion.div>
                  <p className="text-2xl font-bold text-white">15+</p>
                  <p className="text-sm text-white">Années d'expérience</p>
                </div>
              </motion.div>
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
          className="bg-[#101919]/20 rounded-3xl shadow-xl p-6 mb-8"
        >
          <div className="space-y-6">
            {/* Search */}
            <div className="w-full">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/20" />
                <input
                  type="text"
                  placeholder={activeTab === 'products' ? "Rechercher un produit d'investissement..." : "Rechercher un investissement..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-green-400 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200 text-white placeholder-white/80 bg-transparent"
                  title={activeTab === 'products' ? "Rechercher un produit d'investissement" : "Rechercher un investissement"}
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
                  title={activeTab === 'products' ? "Trier les produits" : "Trier les investissements"}
                  aria-label={activeTab === 'products' ? "Trier les produits" : "Trier les investissements"}
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
                              title="Voir les détails du produit"
                            >
                              <Eye size={16} />
                            </motion.button>
                          </Link>
                        </div>
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                            categoryColors[product.category]
                          }`}>
                            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                          </span>
                        </div>
                        <div className="absolute top-4 right-12">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                            riskColors[product.riskLevel]
                          }`}>
                            Risque {product.riskLevel}
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
                              <span className="text-white/80">Rendement attendu</span>
                              <span className="font-semibold text-white">
                                {product.expectedReturn}%
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/80">Investissement min.</span>
                              <span className="font-semibold text-white truncate">
                                {formatCompactAmount(product.minInvestment)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/80">Durée</span>
                              <span className="font-semibold text-white">
                                {product.duration}
                              </span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h4 className="font-bold text-white mb-3">Avantages inclus :</h4>
                            <ul className="space-y-2">
                              {(product.benefits?.length ? product.benefits : ['Conforme aux principes islamiques', 'Transparence totale', 'Gestion professionnelle']).map((benefit, i) => (
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
                              Investir
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
                                title="Voir les détails du produit"
                              >
                                <Eye size={12} />
                              </motion.button>
                            </Link>
                          </div>
                          <div className="absolute top-2 left-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${
                              categoryColors[product.category]
                            }`}>
                              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                            </span>
                          </div>
                          <div className="absolute top-2 right-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${
                              riskColors[product.riskLevel]
                            }`}>
                              Risque {product.riskLevel}
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
                              <span>Rendement: {product.expectedReturn}%</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar size={16} />
                              <span>Durée: {product.duration}</span>
                            </div>
                          </div>

                            <div className="space-y-3">
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 mb-3">Avantages :</h4>
                              <ul className="space-y-2">
                                {(product.benefits?.length ? product.benefits : ['Conforme aux principes islamiques', 'Transparence totale', 'Gestion professionnelle']).map((benefit, i) => (
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
                                <span>Investir</span>
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
                <h3 className="text-xl font-semibold text-white mb-2">Connectez-vous</h3>
                <p className="text-white/80">Connectez-vous pour voir vos investissements.</p>
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
                  {searchTerm ? 'Aucun investissement trouvé' : 'Aucun investissement'}
                </h3>
                <p className="text-white/80">
                  {searchTerm 
                    ? 'Essayez de modifier vos critères de recherche'
                    : 'Vous n\'avez pas encore d\'investissement actif'}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

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
              Pourquoi investir halal ?
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Découvrez les avantages de l'investissement éthique islamique
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
                Éthique et Responsable
              </h3>
              <p className="text-white/80 leading-relaxed">
                Nos investissements excluent les secteurs non conformes aux principes islamiques 
                et privilégient les projets à impact positif.
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
                Performance Éprouvée
              </h3>
              <p className="text-white/80 leading-relaxed">
                Des rendements compétitifs avec une gestion de risque rigoureuse 
                et une transparence totale sur les investissements.
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
                Diversification Optimale
              </h3>
              <p className="text-white/80 leading-relaxed">
                Portefeuille diversifié dans des secteurs variés pour optimiser 
                les rendements tout en minimisant les risques.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

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
                Retrouvez toutes les fonctionnalités d'Amane+ dans une seule application. Faites vos dons, suivez vos rendements, automatisez votre Zakat et participez à des actions solidaires, où que vous soyez.
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
            style={{ background: 'linear-gradient(90deg, #8DD17F 0%, #37C2B4 100%)' }}
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