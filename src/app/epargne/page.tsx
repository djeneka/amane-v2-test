'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Wallet, Users, Target, Calendar, MapPin, 
  TrendingUp, Star, Eye, Share2, Bookmark, Globe, Zap,
  ChevronDown, ChevronUp, ArrowRight, Play, Pause, Shield, Calculator, Heart,
  CreditCard, CheckCircle, Lock, EyeOff, X
} from 'lucide-react';
import Link from 'next/link';

export default function EpargnePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const steps = [
    { id: 1, title: 'Paiement', icon: CreditCard },
    { id: 2, title: 'Confirmation', icon: CheckCircle },
  ];

  const savingsProducts = [
    {
      id: 1,
      name: 'Épargne Classique',
      description: 'Épargnez en toute sécurité avec un rendement garanti',
      minAmount: 10000,
      maxAmount: 1000000,
      rate: 0,
      duration: 'Flexible',
      features: ['Retrait à tout moment', 'Intérêts mensuels', 'Garantie de capital'],
      category: 'classique',
      location: 'Tous pays',
      beneficiaries: 15000,
      currentAmount: 850000000,
      targetAmount: 1000000000,
      image: '/api/placeholder/400/300',
    },
    {
      id: 2,
      name: 'Épargne Hajj',
      description: 'Préparez votre pèlerinage avec une épargne dédiée',
      minAmount: 50000,
      maxAmount: 2000000,
      rate: 0,
      duration: '5-10 ans',
      features: ['Épargne dédiée', 'Rendement élevé', 'Accompagnement spécialisé'],
      category: 'hajj',
      location: 'Moyen-Orient',
      beneficiaries: 8500,
      currentAmount: 420000000,
      targetAmount: 500000000,
      image: '/api/placeholder/400/300',
    },
    {
      id: 3,
      name: 'Épargne Mariage',
      description: 'Épargnez pour le mariage de vos enfants',
      minAmount: 25000,
      maxAmount: 1500000,
      rate: 0,
      duration: '3-7 ans',
      features: ['Objectif personnalisé', 'Suivi régulier', 'Bonus de fin de période'],
      category: 'mariage',
      location: 'Tous pays',
      beneficiaries: 12000,
      currentAmount: 380000000,
      targetAmount: 450000000,
      image: '/api/placeholder/400/300',
    },
    {
      id: 4,
      name: 'Épargne Études',
      description: 'Préparez l\'avenir de vos enfants avec une épargne éducative',
      minAmount: 15000,
      maxAmount: 800000,
      rate: 0,
      duration: '10-15 ans',
      features: ['Épargne longue durée', 'Accompagnement éducatif', 'Flexibilité'],
      category: 'education',
      location: 'Tous pays',
      beneficiaries: 9500,
      currentAmount: 280000000,
      targetAmount: 350000000,
      image: '/api/placeholder/400/300',
    },
    {
      id: 5,
      name: 'Épargne Retraite',
      description: 'Sécurisez votre avenir avec une épargne retraite islamique',
      minAmount: 30000,
      maxAmount: 3000000,
      rate: 0,
      duration: '15-25 ans',
      features: ['Épargne longue durée', 'Sécurité maximale', 'Planification retraite'],
      category: 'retraite',
      location: 'Tous pays',
      beneficiaries: 6800,
      currentAmount: 520000000,
      targetAmount: 600000000,
      image: '/api/placeholder/400/300',
    },
    {
      id: 6,
      name: 'Épargne Business',
      description: 'Développez votre entreprise avec une épargne entrepreneuriale',
      minAmount: 100000,
      maxAmount: 5000000,
      rate: 0,
      duration: '5-8 ans',
      features: ['Accompagnement business', 'Réseau d\'entrepreneurs', 'Formation'],
      category: 'business',
      location: 'Afrique',
      beneficiaries: 4200,
      currentAmount: 180000000,
      targetAmount: 250000000,
      image: '/api/placeholder/400/300',
    },
  ];

  const categories = [
    { id: 'all', name: 'Toutes', icon: Globe, color: 'bg-gray-500' },
    { id: 'classique', name: 'Classique', icon: Wallet, color: 'bg-green-500' },
    { id: 'hajj', name: 'Hajj', icon: Bookmark, color: 'bg-blue-500' },
    { id: 'mariage', name: 'Mariage', icon: Heart, color: 'bg-pink-500' },
    { id: 'education', name: 'Études', icon: Bookmark, color: 'bg-purple-500' },
    { id: 'retraite', name: 'Retraite', icon: Shield, color: 'bg-orange-500' },
    { id: 'business', name: 'Business', icon: TrendingUp, color: 'bg-indigo-500' },
  ];

  const sortOptions = [
    { id: 'popular', name: 'Plus populaires' },
    { id: 'recent', name: 'Plus récentes' },
    { id: 'amount', name: 'Montant élevé' },
    { id: 'duration', name: 'Durée courte' },
  ];

  const filteredProducts = savingsProducts
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.beneficiaries - a.beneficiaries;
        case 'amount':
          return b.currentAmount - a.currentAmount;
        case 'duration':
          return a.duration.localeCompare(b.duration);
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
    if (!mounted) return amount.toString();
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

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
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

  const handleStartSaving = (product: any) => {
    console.log('handleStartSaving called for product:', product);
    setSelectedProduct(product);
    setShowPaymentPopup(true);
    setCurrentStep(1);
  };

  const handleClosePopup = () => {
    setShowPaymentPopup(false);
    setCurrentStep(1);
    setSelectedProduct(null);
  };

  const addEpargneToUser = () => {
    if (!selectedProduct) return;
    
    // Récupérer les épargnes existantes de l'utilisateur
    const existingEpargnes = JSON.parse(localStorage.getItem('userEpargnes') || '[]');
    
    // Créer une nouvelle épargne basée sur le produit sélectionné
    const newEpargne = {
      id: Date.now().toString(),
      name: selectedProduct.name,
      description: selectedProduct.description,
      category: selectedProduct.category,
      targetAmount: selectedProduct.maxAmount,
      currentAmount: selectedProduct.minAmount, // Montant initial
      monthlyContribution: selectedProduct.minAmount,
      startDate: new Date().toISOString().split('T')[0],
      targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 an
      status: 'active',
      color: selectedProduct.category === 'classique' ? 'bg-green-100 text-green-600' :
             selectedProduct.category === 'hajj' ? 'bg-blue-100 text-blue-600' :
             selectedProduct.category === 'mariage' ? 'bg-pink-100 text-pink-600' :
             selectedProduct.category === 'education' ? 'bg-purple-100 text-purple-600' :
             selectedProduct.category === 'retraite' ? 'bg-orange-100 text-orange-600' :
             selectedProduct.category === 'business' ? 'bg-indigo-100 text-indigo-600' :
             'bg-gray-100 text-gray-600',
      icon: null // L'icône sera récupérée dynamiquement
    };
    
    // Ajouter l'épargne à la liste
    const updatedEpargnes = [...existingEpargnes, newEpargne];
    localStorage.setItem('userEpargnes', JSON.stringify(updatedEpargnes));
    
    // Ajouter une transaction de création
    const creationTransaction = {
      id: Date.now().toString(),
      epargneId: newEpargne.id,
      epargneName: newEpargne.name,
      type: 'creation',
      amount: selectedProduct.minAmount,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      description: `Souscription à l'épargne "${selectedProduct.name}"`
    };
    
    const existingTransactions = JSON.parse(localStorage.getItem('userTransactions') || '[]');
    const updatedTransactions = [creationTransaction, ...existingTransactions];
    localStorage.setItem('userTransactions', JSON.stringify(updatedTransactions));
    
    // Passer à l'étape de confirmation
    setCurrentStep(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-50 to-green-50 relative z-10">
      {/* Floating Elements - DISABLED FOR TESTING */}
      {/* <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
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
      </div> */}

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
                <Wallet size={40} className="text-white" />
              </div>
            </motion.div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Produits d'<span className="text-transparent bg-clip-text bg-gradient-to-r from-green-800 to-green-600">Épargne</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Découvrez nos solutions d'épargne conformes aux principes islamiques. Sécurisez votre avenir financier.
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target size={24} className="text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{savingsProducts.length}</p>
                  <p className="text-sm text-gray-600">Produits disponibles</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users size={24} className="text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {mounted ? savingsProducts.reduce((sum, p) => sum + p.beneficiaries, 0).toLocaleString() : '0'}
                  </p>
                  <p className="text-sm text-gray-600">Épargnants</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Wallet size={24} className="text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCompactAmount(savingsProducts.reduce((sum, p) => sum + p.currentAmount, 0))}
                  </p>
                  <p className="text-sm text-gray-600">Épargné</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Globe size={24} className="text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">0%</p>
                  <p className="text-sm text-gray-600">Taux moyen</p>
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
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 mb-8"
        >
          <div className="space-y-6">
            {/* Search */}
            <div className="w-full">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un produit d'épargne..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-400 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                  title="Rechercher un produit d'épargne"
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
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300">
                    <div className="relative">
                      <div className="w-full h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                        <Wallet size={64} className="text-green-600" />
                      </div>
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                          product.category === 'classique' ? 'bg-green-500' :
                          product.category === 'hajj' ? 'bg-blue-500' :
                          product.category === 'mariage' ? 'bg-pink-500' :
                          product.category === 'education' ? 'bg-purple-500' :
                          product.category === 'retraite' ? 'bg-orange-500' :
                          product.category === 'business' ? 'bg-indigo-500' :
                          'bg-gray-500'
                        }`}>
                          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-green-500 transition-colors"
                        >
                          <Bookmark size={16} />
                        </motion.button>
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
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progression</span>
                            <span className="font-semibold text-gray-900">
                              {getProgressPercentage(product.currentAmount, product.targetAmount).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${getProgressPercentage(product.currentAmount, product.targetAmount)}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className={`h-2 rounded-full ${
                                getProgressPercentage(product.currentAmount, product.targetAmount) > 80 ? 'bg-green-500' :
                                getProgressPercentage(product.currentAmount, product.targetAmount) > 50 ? 'bg-yellow-500' :
                                'bg-blue-500'
                              }`}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <MapPin size={14} />
                            <span>{product.location}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Users size={14} />
                            <span>{mounted ? product.beneficiaries.toLocaleString() : product.beneficiaries.toString()}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Taux d'intérêt</span>
                            <span className="font-semibold text-gray-600">
                              {product.rate}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Montant min.</span>
                            <span className="font-semibold text-gray-900 truncate">
                              {formatCompactAmount(product.minAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Durée</span>
                            <span className="font-semibold text-gray-900">
                              {product.duration}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {formatCompactAmount(product.currentAmount)}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              épargné sur {formatCompactAmount(product.targetAmount)}
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              console.log('Product save button clicked!');
                              handleStartSaving(product);
                            }}
                            className="px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 text-sm flex-shrink-0 ml-2"
                          >
                            Épargner
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
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
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="group"
                >
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                          <Wallet size={48} className="text-green-600" />
                        </div>
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${
                            product.category === 'classique' ? 'bg-green-500' :
                            product.category === 'hajj' ? 'bg-blue-500' :
                            product.category === 'mariage' ? 'bg-pink-500' :
                            product.category === 'education' ? 'bg-purple-500' :
                            product.category === 'retraite' ? 'bg-orange-500' :
                            product.category === 'business' ? 'bg-indigo-500' :
                            'bg-gray-500'
                          }`}>
                            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
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
                            <MapPin size={16} />
                            <span>{product.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users size={16} />
                            <span>{mounted ? product.beneficiaries.toLocaleString() : product.beneficiaries.toString()} épargnants</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar size={16} />
                            <span>Durée: {product.duration}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Progression</span>
                              <span className="font-semibold text-gray-900">
                                {getProgressPercentage(product.currentAmount, product.targetAmount).toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${getProgressPercentage(product.currentAmount, product.targetAmount)}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                                className={`h-3 rounded-full ${
                                  getProgressPercentage(product.currentAmount, product.targetAmount) > 80 ? 'bg-green-500' :
                                  getProgressPercentage(product.currentAmount, product.targetAmount) > 50 ? 'bg-yellow-500' :
                                  'bg-blue-500'
                                }`}
                              />
                            </div>
                          </div>

                                                      <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-lg font-bold text-gray-900 truncate">
                                  {formatCompactAmount(product.currentAmount)}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                  épargné sur {formatCompactAmount(product.targetAmount)}
                                </p>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  console.log('Product save button clicked!');
                                  handleStartSaving(product);
                                }}
                                className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center space-x-2 flex-shrink-0 ml-3"
                              >
                                <span>Épargner</span>
                                <ArrowRight size={16} />
                              </motion.button>
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
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

      {/* Calculator Section */}
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
              Simulateur d'Épargne
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Calculez vos gains potentiels avec notre simulateur interactif
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-2xl p-8"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <Calculator size={24} />
                <span>Paramètres</span>
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant initial
                  </label>
                  <input
                    type="number"
                    placeholder="100000"
                    className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Épargne mensuelle
                  </label>
                  <input
                    type="number"
                    placeholder="25000"
                    className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée (années)
                  </label>
                  <input
                    type="number"
                    placeholder="5"
                    className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taux d'intérêt (%)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Résultats du calcul
              </h3>

              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="text-gray-700">Capital total</span>
                  <span className="font-semibold text-gray-600">1,500,000 XOF</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">Intérêts gagnés</span>
                  <span className="font-semibold text-gray-600">0 XOF</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                  <span className="text-gray-700">Montant final</span>
                  <span className="font-semibold text-gray-600">1,500,000 XOF</span>
                </div>

                <div className="mt-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Calculator size={20} />
                    <span>Recalculer</span>
                    <ArrowRight size={20} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Save Section */}
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
              Pourquoi épargner avec nous ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez les avantages de l'épargne islamique éthique
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
                <Shield size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Sécurité Totale
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Vos épargnes sont protégées et gérées selon les plus hauts standards 
                de sécurité et de conformité islamique.
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
                <TrendingUp size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Rendements Compétitifs
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Des produits d'épargne sécurisés qui vous permettent de 
                conserver votre capital de manière éthique.
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
                Objectifs Personnalisés
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Des produits adaptés à vos projets : mariage, hajj, études, 
                ou simplement épargne de sécurité.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-800 to-green-600 text-white relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Prêt à commencer à épargner ?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers d'épargnants qui ont choisi la finance islamique. 
              Commencez dès aujourd'hui.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-green-800 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto"
            >
              <Wallet size={20} />
              <span>Commencer à épargner</span>
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
                    <p className="text-gray-600">
                      {selectedProduct ? `Souscription à ${selectedProduct.name}` : 'Ouverture de compte épargne'}
                    </p>
                    {selectedProduct && (
                      <div className="mt-2 p-3 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">Montant initial:</span>
                          <span className="font-semibold text-green-800">
                            {formatCompactAmount(selectedProduct.minAmount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-gray-700">Durée:</span>
                          <span className="font-semibold text-green-800">{selectedProduct.duration}</span>
                        </div>
                      </div>
                    )}
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
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                          {selectedProduct ? `${selectedProduct.name} créé !` : 'Compte épargne créé !'}
                        </h2>
                        <p className="text-gray-700 mb-6">
                          {selectedProduct 
                            ? `Votre épargne "${selectedProduct.name}" a été créée avec succès. Vous pouvez maintenant suivre vos progrès dans la section "Mes Épargnes".`
                            : 'Votre compte épargne a été créé avec succès. Vous pouvez maintenant commencer à épargner.'
                          }
                        </p>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                        <h3 className="font-semibold text-green-900 mb-2">Récapitulatif</h3>
                        <div className="space-y-2 text-sm text-green-800">
                          <div className="flex justify-between">
                            <span>Service:</span>
                            <span className="font-semibold">
                              {selectedProduct ? selectedProduct.name : 'Ouverture compte épargne'}
                            </span>
                          </div>
                          {selectedProduct && (
                            <>
                              <div className="flex justify-between">
                                <span>Montant initial:</span>
                                <span className="font-semibold">
                                  {formatCompactAmount(selectedProduct.minAmount)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Durée:</span>
                                <span className="font-semibold">{selectedProduct.duration}</span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between">
                            <span>Méthode:</span>
                            <span className="font-semibold">
                              {paymentMethod === 'card' ? 'Carte bancaire' : 
                               paymentMethod === 'mobile' ? 'Paiement mobile' : 'Compte Amane'}
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
                      onClick={() => {
                        if (selectedProduct) {
                          addEpargneToUser();
                        } else {
                          handleNext();
                        }
                      }}
                      className="px-8 py-3 bg-gradient-to-r from-green-800 to-green-600 text-white rounded-xl font-semibold hover:from-green-900 hover:to-green-700 transition-all duration-200 flex items-center space-x-2"
                    >
                      <span>{selectedProduct ? 'Souscrire maintenant' : 'Confirmer le paiement'}</span>
                      <ArrowRight size={20} />
                    </motion.button>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="flex justify-center space-x-4 mt-8 pt-6 border-t border-gray-100">
                    {selectedProduct && (
                      <Link href="/mes-epargnes">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-3 bg-white text-green-800 rounded-xl font-semibold hover:bg-green-50 transition-all duration-200 border-2 border-green-200 flex items-center space-x-2"
                        >
                          <Wallet size={20} />
                          <span>Voir mes épargnes</span>
                        </motion.button>
                      </Link>
                    )}
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