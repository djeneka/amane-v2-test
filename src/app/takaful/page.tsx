'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Shield, Users, Target, Calendar, MapPin, 
  Star, Eye, Share2, Bookmark, Globe, Zap,
  ChevronDown, ChevronUp, ArrowRight, Play, Pause, Calculator,
  Heart, Car, Home, User, CheckCircle, CreditCard, Lock, EyeOff, X, Wallet
} from 'lucide-react';
import Link from 'next/link';
import { takafulProducts } from '@/data/mockData';

export default function TakafulPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [showPassword, setShowPassword] = useState(false);
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
    sante: Heart,
    automobile: Car,
    habitation: Home,
    vie: User,
  };

  const categoryColors = {
    sante: 'bg-green-500',
    automobile: 'bg-blue-500',
    habitation: 'bg-purple-500',
    vie: 'bg-orange-500',
  };

  const categories = [
    { id: 'all', name: 'Toutes', icon: Globe, color: 'bg-gray-500' },
    { id: 'sante', name: 'Santé', icon: Heart, color: 'bg-green-500' },
    { id: 'automobile', name: 'Automobile', icon: Car, color: 'bg-blue-500' },
    { id: 'habitation', name: 'Habitation', icon: Home, color: 'bg-purple-500' },
    { id: 'vie', name: 'Vie', icon: User, color: 'bg-orange-500' },
  ];

  const sortOptions = [
    { id: 'popular', name: 'Plus populaires' },
    { id: 'recent', name: 'Plus récents' },
    { id: 'price', name: 'Prix bas' },
    { id: 'coverage', name: 'Couverture élevée' },
  ];

  const filteredProducts = takafulProducts
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.monthlyPremium - a.monthlyPremium;
        case 'price':
          return a.monthlyPremium - b.monthlyPremium;
        case 'coverage':
          return b.monthlyPremium - a.monthlyPremium;
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

  const handleSubscribe = () => {
    setShowPaymentPopup(true);
    setCurrentStep(1);
  };

  const handleClosePopup = () => {
    setShowPaymentPopup(false);
    setCurrentStep(1);
  };

  const stats = [
    { label: 'Clients protégés', value: '50K+', icon: Users },
    { label: 'Produits disponibles', value: '8+', icon: Shield },
    { label: 'Taux de satisfaction', value: '98%', icon: Star },
    { label: 'Pays couverts', value: '15+', icon: Shield },
  ];

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
                <Shield size={40} className="text-white" />
              </div>
            </motion.div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Produits de <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-800 to-green-600">Protection</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Découvrez nos solutions d'assurance islamique éthique. Protégez-vous et votre famille selon les principes de la mutualité islamique.
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
                  <p className="text-2xl font-bold text-gray-900">{takafulProducts.length}</p>
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
                  <p className="text-2xl font-bold text-gray-900">50K+</p>
                  <p className="text-sm text-gray-600">Clients protégés</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star size={24} className="text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">98%</p>
                  <p className="text-sm text-gray-600">Satisfaction</p>
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
                  <p className="text-2xl font-bold text-gray-900">15+</p>
                  <p className="text-sm text-gray-600">Pays couverts</p>
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
                  placeholder="Rechercher un produit de protection..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-400 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                  title="Rechercher un produit de protection"
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
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300">
                      <div className="relative">
                        <div className="w-full h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                          <IconComponent size={64} className="text-green-600" />
                        </div>
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                            categoryColors[product.category]
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
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Prime mensuelle</span>
                              <span className="font-semibold text-gray-900 truncate">
                                {formatCompactAmount(product.monthlyPremium)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Couverture</span>
                              <span className="font-semibold text-gray-900">
                                {product.coverage}
                              </span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-3">Avantages inclus :</h4>
                            <ul className="space-y-2">
                              {product.features.slice(0, 3).map((feature, featureIndex) => (
                                <li key={featureIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                                  <CheckCircle size={16} className="text-green-500" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">
                                {formatCompactAmount(product.monthlyPremium)}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                prime mensuelle
                              </p>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleSubscribe}
                              className="px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 text-sm flex-shrink-0 ml-2"
                            >
                              Souscrire
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
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                            <IconComponent size={48} className="text-green-600" />
                          </div>
                          <div className="absolute top-2 left-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${
                              categoryColors[product.category]
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
                              <Shield size={16} />
                              <span>Couverture: {product.coverage}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar size={16} />
                              <span>Prime: {formatCompactAmount(product.monthlyPremium)}/mois</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 mb-3">Avantages inclus :</h4>
                              <ul className="space-y-2">
                                {product.features.map((feature, featureIndex) => (
                                  <li key={featureIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                                    <CheckCircle size={16} className="text-green-500" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-lg font-bold text-gray-900 truncate">
                                  {formatCompactAmount(product.monthlyPremium)}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                  prime mensuelle
                                </p>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSubscribe}
                                className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center space-x-2 flex-shrink-0 ml-3"
                              >
                                <span>Souscrire</span>
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

      {/* Why Takaful Section */}
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
              Pourquoi choisir le Takaful ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez les avantages de l'assurance islamique éthique
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
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Principe de Mutualité
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Les participants contribuent ensemble pour aider ceux qui en ont besoin, 
                selon les principes de solidarité islamique.
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
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Transparence Totale
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Aucun intérêt, aucune spéculation. Tous les fonds sont utilisés 
                exclusivement pour la protection des participants.
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
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Excellence Éthique
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Nos produits respectent strictement les principes islamiques 
                et offrent une protection complète et éthique.
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
              Prêt à vous protéger ?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers de personnes qui ont choisi la protection Takaful. 
              Commencez dès aujourd'hui.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubscribe}
              className="bg-white text-green-800 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto"
            >
              <Shield size={20} />
              <span>Commencer maintenant</span>
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
                    <p className="text-gray-600">Souscription Takaful</p>
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
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Souscription confirmée !</h2>
                        <p className="text-gray-700 mb-6">
                          Votre souscription Takaful a été effectuée avec succès. Vous êtes maintenant protégé.
                        </p>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                        <h3 className="font-semibold text-green-900 mb-2">Récapitulatif</h3>
                        <div className="space-y-2 text-sm text-green-800">
                          <div className="flex justify-between">
                            <span>Service:</span>
                            <span className="font-semibold">Souscription Takaful</span>
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