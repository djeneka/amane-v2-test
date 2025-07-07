'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Heart, Users, Target, Calendar, MapPin, 
  TrendingUp, Star, Eye, Share2, Bookmark, Globe, Zap,
  ChevronDown, ChevronUp, ArrowRight, Play, Pause
} from 'lucide-react';
import Link from 'next/link';
import CampaignCard from '@/components/CampaignCard';
import { campaigns } from '@/data/mockData';

export default function CampagnesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedFilters, setExpandedFilters] = useState(false);

  const categories = [
    { id: 'all', name: 'Toutes', icon: Globe, color: 'bg-gray-500' },
    { id: 'urgence', name: 'Urgence', icon: Zap, color: 'bg-red-500' },
    { id: 'education', name: 'Éducation', icon: Bookmark, color: 'bg-green-500' },
    { id: 'sante', name: 'Santé', icon: Heart, color: 'bg-green-600' },
    { id: 'developpement', name: 'Développement', icon: TrendingUp, color: 'bg-green-700' },
    { id: 'refugies', name: 'Réfugiés', icon: Users, color: 'bg-orange-500' },
  ];

  const sortOptions = [
    { id: 'recent', name: 'Plus récentes' },
    { id: 'popular', name: 'Plus populaires' },
    { id: 'ending', name: 'Se terminant bientôt' },
    { id: 'amount', name: 'Montant élevé' },
  ];

  const filteredCampaigns = campaigns
    .filter(campaign => {
      const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || campaign.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.beneficiaries - a.beneficiaries;
        case 'ending':
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case 'amount':
          return b.targetAmount - a.targetAmount;
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
                <Heart size={40} className="text-white" />
              </div>
            </motion.div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Campagnes de <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-800 to-green-600">Solidarité</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Découvrez et soutenez des causes importantes. Chaque don compte pour construire un monde meilleur.
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
                  <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
                  <p className="text-sm text-gray-600">Campagnes actives</p>
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
                    {campaigns.reduce((sum, c) => sum + c.beneficiaries, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Bénéficiaires</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart size={24} className="text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatAmount(campaigns.reduce((sum, c) => sum + c.currentAmount, 0))}
                  </p>
                  <p className="text-sm text-gray-600">Collecté</p>
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
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(campaigns.map(c => c.location)).size}
                  </p>
                  <p className="text-sm text-gray-600">Pays</p>
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
                  placeholder="Rechercher une campagne..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200"
                  title="Rechercher une campagne"
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
                title="Trier les campagnes"
                aria-label="Trier les campagnes"
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

        {/* Campaigns Grid */}
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
              {filteredCampaigns.map((campaign, index) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Link href={`/campagnes/${campaign.id}`}>
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300">
                      <div className="relative">
                        <img
                          src={campaign.image}
                          alt={campaign.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                            campaign.category === 'urgence' ? 'bg-red-500' :
                            campaign.category === 'education' ? 'bg-blue-500' :
                            campaign.category === 'sante' ? 'bg-green-500' :
                            campaign.category === 'developpement' ? 'bg-purple-500' :
                            'bg-orange-500'
                          }`}>
                            {campaign.category.charAt(0).toUpperCase() + campaign.category.slice(1)}
                          </span>
                        </div>
                        <div className="absolute top-4 right-4">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors"
                          >
                            <Heart size={16} />
                          </motion.button>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {campaign.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {campaign.description}
                        </p>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Progression</span>
                              <span className="font-semibold text-gray-900">
                                {getProgressPercentage(campaign.currentAmount, campaign.targetAmount).toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${getProgressPercentage(campaign.currentAmount, campaign.targetAmount)}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                                className={`h-2 rounded-full ${
                                  getProgressPercentage(campaign.currentAmount, campaign.targetAmount) > 80 ? 'bg-green-500' :
                                  getProgressPercentage(campaign.currentAmount, campaign.targetAmount) > 50 ? 'bg-yellow-500' :
                                  'bg-blue-500'
                                }`}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <MapPin size={14} />
                              <span>{campaign.location}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Users size={14} />
                              <span>{campaign.beneficiaries.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-bold text-gray-900">
                                {formatAmount(campaign.currentAmount)}
                              </p>
                              <p className="text-xs text-gray-500">
                                sur {formatAmount(campaign.targetAmount)}
                              </p>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                            >
                              Soutenir
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
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
              {filteredCampaigns.map((campaign, index) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="group"
                >
                  <Link href={`/campagnes/${campaign.id}`}>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          <img
                            src={campaign.image}
                            alt={campaign.title}
                            className="w-32 h-32 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${
                              campaign.category === 'urgence' ? 'bg-red-500' :
                              campaign.category === 'education' ? 'bg-blue-500' :
                              campaign.category === 'sante' ? 'bg-green-500' :
                              campaign.category === 'developpement' ? 'bg-purple-500' :
                              'bg-orange-500'
                            }`}>
                              {campaign.category.charAt(0).toUpperCase() + campaign.category.slice(1)}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {campaign.title}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {campaign.description}
                          </p>

                          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                            <div className="flex items-center space-x-1">
                              <MapPin size={16} />
                              <span>{campaign.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users size={16} />
                              <span>{campaign.beneficiaries.toLocaleString()} bénéficiaires</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar size={16} />
                              <span>Se termine le {new Date(campaign.endDate).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Progression</span>
                                <span className="font-semibold text-gray-900">
                                  {getProgressPercentage(campaign.currentAmount, campaign.targetAmount).toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${getProgressPercentage(campaign.currentAmount, campaign.targetAmount)}%` }}
                                  transition={{ duration: 1, delay: index * 0.1 }}
                                  className={`h-3 rounded-full ${
                                    getProgressPercentage(campaign.currentAmount, campaign.targetAmount) > 80 ? 'bg-green-500' :
                                    getProgressPercentage(campaign.currentAmount, campaign.targetAmount) > 50 ? 'bg-yellow-500' :
                                    'bg-blue-500'
                                  }`}
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-2xl font-bold text-gray-900">
                                  {formatAmount(campaign.currentAmount)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  collecté sur {formatAmount(campaign.targetAmount)}
                                </p>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center space-x-2"
                              >
                                <span>Soutenir</span>
                                <ArrowRight size={16} />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Results */}
        {filteredCampaigns.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune campagne trouvée
            </h3>
            <p className="text-gray-600">
              Essayez de modifier vos critères de recherche
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
} 