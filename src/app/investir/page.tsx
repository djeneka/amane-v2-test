'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, TrendingUp, Users, Target, Calendar, MapPin, 
  Star, Eye, Share2, Bookmark, Globe, Zap,
  ChevronDown, ChevronUp, ArrowRight, Play, Pause, Shield, Calculator,
  Building, Leaf, CheckCircle, BarChart3, CreditCard, Lock, EyeOff, X, Wallet
} from 'lucide-react';
import Link from 'next/link';
import { investmentProducts } from '@/data/mockData';

export default function InvestirPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    anonymous: false,
    amaneEmail: '',
    amanePassword: '',
  });

  const steps = [
    { id: 1, title: 'Paiement', icon: CreditCard },
    { id: 2, title: 'Confirmation', icon: CheckCircle },
  ];

  const categoryIcons = {
    immobilier: Building,
    agriculture: Leaf,
    technologie: Zap,
    energie: Zap,
  };

  const categoryColors = {
    immobilier: 'bg-green-500',
    agriculture: 'bg-blue-500',
    technologie: 'bg-purple-500',
    energie: 'bg-orange-500',
  };

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

  // Fonction pour obtenir l'image actuelle
  const getCurrentImage = (productId: string, category: string) => {
    const images = categoryImages[category as keyof typeof categoryImages] || [];
    const currentIndex = currentImageIndex[productId] || 0;
    return images[currentIndex] || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop';
  };

  const categories = [
    { id: 'all', name: 'Toutes', icon: Globe, color: 'bg-gray-500' },
    { id: 'immobilier', name: 'Immobilier', icon: Building, color: 'bg-green-500' },
    { id: 'agriculture', name: 'Agriculture', icon: Leaf, color: 'bg-blue-500' },
    { id: 'technologie', name: 'Technologie', icon: Zap, color: 'bg-purple-500' },
    { id: 'energie', name: 'Énergie', icon: Zap, color: 'bg-orange-500' },
  ];

  const sortOptions = [
    { id: 'popular', name: 'Plus populaires' },
    { id: 'recent', name: 'Plus récents' },
    { id: 'return', name: 'Rendement élevé' },
    { id: 'risk', name: 'Risque faible' },
  ];

  const filteredProducts = investmentProducts
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.expectedReturn - a.expectedReturn;
        case 'return':
          return b.expectedReturn - a.expectedReturn;
        case 'risk':
          return a.riskLevel.localeCompare(b.riskLevel);
        default:
          return 0;
      }
    });

  // Effet pour le défilement automatique du carrousel
  useEffect(() => {
    const interval = setInterval(() => {
      filteredProducts.forEach((product) => {
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
    }, 3000); // Change d'image toutes les 3 secondes

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

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInvest = () => {
    setShowPaymentPopup(true);
    setCurrentStep(1);
  };

  const handleClosePopup = () => {
    setShowPaymentPopup(false);
    setCurrentStep(1);
  };

  const stats = [
    { label: 'Investisseurs actifs', value: '10K+', icon: Users },
    { label: 'Rendement moyen', value: '8.5%', icon: TrendingUp },
    { label: 'Produits disponibles', value: '12+', icon: Target },
    { label: 'Années d\'expérience', value: '15+', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-50 to-green-800">
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
              <div className="w-24 h-24 bg-gradient-to-br from-green-800 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
                <TrendingUp size={40} className="text-white" />
              </div>
            </motion.div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Produits d'<span className="text-transparent bg-clip-text bg-gradient-to-r from-green-800 to-green-600">Investissement</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Découvrez nos solutions d'investissement conformes aux principes islamiques. Placez votre argent de manière éthique et rentable.
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
              <motion.div
                whileHover={{ y: -5, rotate: 5 }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ 
                  rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  y: { duration: 0.2 }
                }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
              >
                <div className="text-center">
                  <motion.div 
                    className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Target size={24} className="text-green-600" />
                  </motion.div>
                  <p className="text-2xl font-bold text-gray-900">{investmentProducts.length}</p>
                  <p className="text-sm text-gray-600">Produits disponibles</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5, rotate: -5 }}
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ 
                  rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  y: { duration: 0.2 }
                }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
              >
                <div className="text-center">
                  <motion.div 
                    className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"
                    animate={{ rotate: [0, -360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Users size={24} className="text-green-600" />
                  </motion.div>
                  <p className="text-2xl font-bold text-gray-900">10K+</p>
                  <p className="text-sm text-gray-600">Investisseurs</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5, rotate: 5 }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ 
                  rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  y: { duration: 0.2 }
                }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
              >
                <div className="text-center">
                  <motion.div 
                    className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <TrendingUp size={24} className="text-green-600" />
                  </motion.div>
                  <p className="text-2xl font-bold text-gray-900">8.5%</p>
                  <p className="text-sm text-gray-600">Rendement moyen</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5, rotate: -5 }}
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ 
                  rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  y: { duration: 0.2 }
                }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
              >
                <div className="text-center">
                  <motion.div 
                    className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3"
                    animate={{ rotate: [0, -360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Star size={24} className="text-orange-600" />
                  </motion.div>
                  <p className="text-2xl font-bold text-gray-900">15+</p>
                  <p className="text-sm text-gray-600">Années d'expérience</p>
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
          className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 mb-8"
        >
          <div className="space-y-6">
            {/* Search */}
            <div className="w-full">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un produit d'investissement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-400 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                  title="Rechercher un produit d'investissement"
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
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-green-800 to-green-600 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
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
                  className="px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200 text-gray-900"
                  title="Trier les produits"
                  aria-label="Trier les produits"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>

                <div className="flex bg-gray-100 rounded-xl p-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'grid' ? 'bg-white shadow-md' : 'text-gray-600'
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
                      viewMode === 'list' ? 'bg-white shadow-md' : 'text-gray-600'
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

        {/* Products Grid */}
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
                    <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300">
                      <div className="relative">
                        <div className="w-full h-48 relative overflow-hidden">
                          <AnimatePresence mode="wait">
                            <motion.img
                              key={`${product.id}-${currentImageIndex[product.id] || 0}`}
                              src={getCurrentImage(product.id, product.category)}
                              alt={`${product.name} - Image ${(currentImageIndex[product.id] || 0) + 1}`}
                              className="w-full h-full object-cover absolute inset-0"
                              initial={{ x: 300, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              exit={{ x: -300, opacity: 0 }}
                              transition={{ duration: 0.5, ease: "easeInOut" }}
                              onError={(e) => {
                                // Fallback vers une image par défaut si l'image ne charge pas
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop';
                              }}
                            />
                          </AnimatePresence>
                          <div className="absolute inset-0 bg-black/20"></div>
                          
                          {/* Indicateurs d'images */}
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
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Rendement attendu</span>
                              <span className="font-semibold text-green-600">
                                {product.expectedReturn}%
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Investissement min.</span>
                              <span className="font-semibold text-gray-900 truncate">
                                {formatCompactAmount(product.minInvestment)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Durée</span>
                              <span className="font-semibold text-gray-900">
                                {product.duration}
                              </span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-3">Avantages :</h4>
                            <ul className="space-y-2">
                              <li className="flex items-center space-x-2 text-sm text-gray-600">
                                <CheckCircle size={16} className="text-green-500" />
                                <span>Conforme aux principes islamiques</span>
                              </li>
                              <li className="flex items-center space-x-2 text-sm text-gray-600">
                                <CheckCircle size={16} className="text-green-500" />
                                <span>Transparence totale</span>
                              </li>
                              <li className="flex items-center space-x-2 text-sm text-gray-600">
                                <CheckCircle size={16} className="text-green-500" />
                                <span>Gestion professionnelle</span>
                              </li>
                            </ul>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">
                                {formatCompactAmount(product.minInvestment)}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                investissement minimum
                              </p>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleInvest}
                              className="px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 text-sm flex-shrink-0 ml-2"
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
                                key={`${product.id}-list-${currentImageIndex[product.id] || 0}`}
                                src={getCurrentImage(product.id, product.category)}
                                alt={`${product.name} - Image ${(currentImageIndex[product.id] || 0) + 1}`}
                                className="w-full h-full object-cover absolute inset-0"
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -100, opacity: 0 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                onError={(e) => {
                                  // Fallback vers une image par défaut si l'image ne charge pas
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop';
                                }}
                              />
                            </AnimatePresence>
                            <div className="absolute inset-0 bg-black/20"></div>
                            
                            {/* Indicateurs d'images */}
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
                                <li className="flex items-center space-x-2 text-sm text-gray-600">
                                  <CheckCircle size={16} className="text-green-500" />
                                  <span>Conforme aux principes islamiques</span>
                                </li>
                                <li className="flex items-center space-x-2 text-sm text-gray-600">
                                  <CheckCircle size={16} className="text-green-500" />
                                  <span>Transparence totale</span>
                                </li>
                                <li className="flex items-center space-x-2 text-sm text-gray-600">
                                  <CheckCircle size={16} className="text-green-500" />
                                  <span>Gestion professionnelle</span>
                                </li>
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
                                onClick={handleInvest}
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
        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun produit trouvé
            </h3>
            <p className="text-gray-600">
              Essayez de modifier vos critères de recherche
            </p>
          </motion.div>
        )}
      </div>

      {/* Why Halal Investment Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi investir halal ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Éthique et Responsable
              </h3>
              <p className="text-gray-600 leading-relaxed">
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
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Performance Éprouvée
              </h3>
              <p className="text-gray-600 leading-relaxed">
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
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Diversification Optimale
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Portefeuille diversifié dans des secteurs variés pour optimiser 
                les rendements tout en minimisant les risques.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Investment Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Comment investir ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Un processus simple et transparent en 4 étapes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Créer un compte', description: 'Inscrivez-vous en quelques minutes' },
              { step: 2, title: 'Choisir un produit', description: 'Sélectionnez l\'investissement qui vous convient' },
              { step: 3, title: 'Investir', description: 'Effectuez votre investissement en toute sécurité' },
              { step: 4, title: 'Suivre', description: 'Suivez vos performances en temps réel' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-800 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Prêt à investir éthiquement ?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers d'investisseurs qui ont choisi la finance islamique. 
              Commencez dès aujourd'hui.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleInvest}
              className="bg-white text-green-800 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto"
            >
              <TrendingUp size={20} />
              <span>Commencer à investir</span>
              <ArrowRight size={20} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Payment Popup */}
      <AnimatePresence>
        {showPaymentPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white rounded-t-3xl p-6 border-b border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Paiement sécurisé</h3>
                    <p className="text-gray-600">Investissement éthique</p>
                  </div>
                  <button 
                    onClick={handleClosePopup} 
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Fermer"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-center">
                  <div className="flex space-x-4">
                    {steps.map((step, index) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                          currentStep >= step.id 
                            ? 'bg-gradient-to-r from-green-800 to-green-600 text-white' 
                            : 'bg-gray-100 text-gray-600'
                        } shadow-lg`}
                      >
                        <step.icon size={20} />
                        <span className="font-medium">{step.title}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-8">
                        <h4 className="text-2xl font-bold text-gray-900 mb-2">Méthode de paiement</h4>
                        <p className="text-gray-700">Choisissez votre méthode de paiement sécurisée</p>
                      </div>

                      <div className="space-y-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setPaymentMethod('card')}
                          className={`w-full p-6 rounded-2xl border-2 transition-all duration-200 ${
                            paymentMethod === 'card'
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <CreditCard size={24} className="text-green-600" />
                            </div>
                            <div className="flex-1 text-left">
                              <h3 className="font-semibold text-gray-900">Carte bancaire</h3>
                              <p className="text-sm text-gray-700">Paiement sécurisé par carte</p>
                            </div>
                          </div>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setPaymentMethod('mobile')}
                          className={`w-full p-6 rounded-2xl border-2 transition-all duration-200 ${
                            paymentMethod === 'mobile'
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <Zap size={24} className="text-green-600" />
                            </div>
                            <div className="flex-1 text-left">
                              <h3 className="font-semibold text-gray-900">Paiement mobile</h3>
                              <p className="text-sm text-gray-700">Orange Money, MTN Mobile Money</p>
                            </div>
                          </div>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setPaymentMethod('amane')}
                          className={`w-full p-6 rounded-2xl border-2 transition-all duration-200 ${
                            paymentMethod === 'amane'
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <Wallet size={24} className="text-green-600" />
                            </div>
                            <div className="flex-1 text-left">
                              <h3 className="font-semibold text-gray-900">Compte Amane</h3>
                              <p className="text-sm text-gray-700">Paiement depuis votre compte Amane</p>
                            </div>
                          </div>
                        </motion.button>
                      </div>

                      {paymentMethod === 'card' && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4 mt-6"
                        >
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Numéro de carte
                            </label>
                            <input
                              type="text"
                              value={formData.cardNumber}
                              onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200"
                              placeholder="1234 5678 9012 3456"
                              title="Numéro de carte"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date d'expiration
                              </label>
                              <input
                                type="text"
                                value={formData.expiryDate}
                                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200"
                                placeholder="MM/AA"
                                title="Date d'expiration"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                CVV
                              </label>
                              <div className="relative">
                                <input
                                  type={showPassword ? "text" : "password"}
                                  value={formData.cvv}
                                  onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200"
                                  placeholder="123"
                                  title="Code de sécurité"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                  title={showPassword ? "Masquer" : "Afficher"}
                                >
                                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                                              {paymentMethod === 'mobile' && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4 mt-6"
                          >
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Numéro de téléphone
                              </label>
                              <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200"
                                placeholder="+225 07 12 34 56 78"
                                title="Numéro de téléphone"
                              />
                            </div>
                          </motion.div>
                        )}

                        {paymentMethod === 'amane' && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4 mt-6"
                          >
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Amane
                              </label>
                              <input
                                type="email"
                                value={formData.amaneEmail}
                                onChange={(e) => setFormData({ ...formData, amaneEmail: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200"
                                placeholder="votre@email.com"
                                title="Email de votre compte Amane"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mot de passe Amane
                              </label>
                              <div className="relative">
                                <input
                                  type={showPassword ? "text" : "password"}
                                  value={formData.amanePassword}
                                  onChange={(e) => setFormData({ ...formData, amanePassword: e.target.value })}
                                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200"
                                  placeholder="Votre mot de passe"
                                  title="Mot de passe de votre compte Amane"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                  title={showPassword ? "Masquer" : "Afficher"}
                                >
                                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="text-center space-y-8"
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto"
                      >
                        <CheckCircle size={48} className="text-white" />
                      </motion.div>

                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Investissement confirmé !</h2>
                        <p className="text-gray-700 mb-6">
                          Votre investissement a été effectué avec succès. Vous pouvez maintenant suivre vos performances.
                        </p>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                        <h3 className="font-semibold text-green-900 mb-2">Récapitulatif</h3>
                        <div className="space-y-2 text-sm text-green-800">
                          <div className="flex justify-between">
                            <span>Service:</span>
                            <span className="font-semibold">Investissement éthique</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Méthode:</span>
                            <span className="font-semibold">
                              {paymentMethod === 'card' ? 'Carte bancaire' : 'Paiement mobile'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                {currentStep < 2 && (
                  <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClosePopup}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-all duration-200"
                    >
                      Annuler
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNext}
                      className="px-8 py-3 bg-gradient-to-r from-green-800 to-green-600 text-white rounded-xl font-semibold hover:from-green-900 hover:to-green-700 transition-all duration-200 flex items-center space-x-2"
                    >
                      <span>Confirmer le paiement</span>
                      <ArrowRight size={20} />
                    </motion.button>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="flex justify-center mt-8 pt-6 border-t border-gray-100">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClosePopup}
                      className="px-8 py-3 bg-gradient-to-r from-green-800 to-green-600 text-white rounded-xl font-semibold hover:from-green-900 hover:to-green-700 transition-all duration-200"
                    >
                      Fermer
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 