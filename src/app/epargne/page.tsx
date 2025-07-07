'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Wallet, Users, Target, Calendar, MapPin, 
  TrendingUp, Star, Eye, Share2, Bookmark, Globe, Zap,
  ChevronDown, ChevronUp, ArrowRight, Play, Pause, Shield, Calculator, Heart
} from 'lucide-react';
import Link from 'next/link';

export default function EpargnePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedFilters, setExpandedFilters] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-50 to-green-50">
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
                    {savingsProducts.reduce((sum, p) => sum + p.beneficiaries, 0).toLocaleString()}
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
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un produit d'épargne..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200"
                  title="Rechercher un produit d'épargne"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
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
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200"
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
                            <span>{product.beneficiaries.toLocaleString()}</span>
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
                            <span>{product.beneficiaries.toLocaleString()} épargnants</span>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Épargne mensuelle
                  </label>
                  <input
                    type="number"
                    placeholder="25000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée (années)
                  </label>
                  <input
                    type="number"
                    placeholder="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taux d'intérêt (%)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
      <section className="py-20 bg-gradient-to-br from-green-800 to-green-600 text-white">
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
    </div>
  );
} 