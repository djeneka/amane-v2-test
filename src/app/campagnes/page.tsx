'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Heart, Users, Target, Calendar, MapPin, 
  TrendingUp, Star, Eye, Share2, Bookmark, Globe, Zap,
  ChevronDown, ChevronUp, ArrowRight, Play, Pause, Apple
} from 'lucide-react';
import Link from 'next/link';
import CampaignCard from '@/components/CampaignCard';
import { campaigns } from '@/data/mockData';
import Image from 'next/image';
import MakeDonationModal from '@/components/MakeDonationModal';

export default function CampagnesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [showDonationModal, setShowDonationModal] = useState(false);
  
  // Solde de l'utilisateur (à récupérer depuis le contexte ou l'API)
  const walletBalance = 610473;

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

  const statsCards = [
    {
      icon: '/icons/volume-high.png',
      value: campaigns.length,
      label: 'Campagnes actives',
      rotateDirection: 1,
      cardRotate: 5,
    },
    {
      icon: '/icons/people.png',
      value: campaigns.reduce((sum, c) => sum + c.beneficiaries, 0).toLocaleString(),
      label: 'Bénéficiaires',
      rotateDirection: -1,
      cardRotate: -5,
    },
    {
      icon: '/icons/hand-coin(2).png',
      value: formatAmount(campaigns.reduce((sum, c) => sum + c.currentAmount, 0)),
      label: 'Collecté',
      rotateDirection: 1,
      cardRotate: 5,
    },
    {
      icon: '/icons/global.png',
      value: new Set(campaigns.map(c => c.location)).size,
      label: 'Pays',
      rotateDirection: -1,
      cardRotate: -5,
    },
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
            <h3 className="text-white text-xl font-bold mb-2">Dons</h3>
            <nav className="text-sm mb-2">
              <Link href="/">
                <span className="text-gray-300 font-bold">Accueil</span>
              </Link>
              <span className="text-gray-300 mx-2">/</span>
              <span className="text-green-400">Dons</span>
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
              Campagnes de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00644d] to-[#00644d]/80">Solidarité</span>
            </h1>
            <p className="text-xl text-white mb-12 max-w-3xl mx-auto leading-relaxed">
              Découvrez et soutenez des causes importantes. Chaque don compte pour construire un monde meilleur.
            </p>

            {/* Bouton Offrir Sans Choisir */}
            <div className="flex justify-center mb-12">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDonationModal(true)}
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
                <span>Offrir Sans Choisir</span>
              </motion.button>
            </div>

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
                        <Image src={stat.icon} alt={stat.label} width={26} height={26} className="object-contain" />
                      </motion.div>
                      <p className="text-2xl font-bold text-white">{stat?.value}</p>
                      <p className="text-sm text-white">{stat.label}</p>
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
            {/* First Row: Search, Period, Country, City, Apply Button */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-1">
                <label className="block text-white text-sm font-medium mb-2">Recherche</label>
                <div className="relative">
                  <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une campagne ici..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-green-400 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200 text-white placeholder-gray-400 bg-transparent"
                    title="Rechercher une campagne"
                  />
                </div>
              </div>

              {/* Period */}
              <div className="lg:col-span-1">
                <label className="block text-white text-sm font-medium mb-2">Période</label>
                <div className="relative flex items-center">
                  <Calendar size={18} className="absolute left-3 text-white/70 z-10" />
                  <input
                    type="text"
                    placeholder="09/09/2024 - 09/09/2025"
                    value={dateRange.start && dateRange.end 
                      ? `${new Date(dateRange.start).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} - ${new Date(dateRange.end).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
                      : dateRange.start || dateRange.end
                      ? dateRange.start 
                        ? new Date(dateRange.start).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                        : new Date(dateRange.end).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                      : ''
                    }
                    readOnly
                    onClick={() => {
                      // Ouvrir un date picker ou modal pour sélectionner la période
                    }}
                    className="w-full pl-10 pr-10 py-3 rounded-xl text-white bg-gray-800/50 border border-gray-700 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200 cursor-pointer placeholder-gray-400"
                  />
                  <Calendar size={18} className="absolute right-3 text-white/70 z-10" />
                </div>
              </div>

              {/* Country */}
              <div className="lg:col-span-1">
                <label className="block text-white text-sm font-medium mb-2">Pays</label>
                <div className="relative">
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    title="Sélectionner un pays"
                    aria-label="Sélectionner un pays"
                    className="w-full pl-4 pr-10 py-3 rounded-xl text-white bg-gray-800/50 border border-gray-700 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200 appearance-none"
                  >
                    <option value="" className="bg-gray-800">Sélectionner un pays</option>
                    <option value="ci" className="bg-gray-800">Côte d'Ivoire</option>
                    <option value="sn" className="bg-gray-800">Sénégal</option>
                    <option value="ml" className="bg-gray-800">Mali</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 pointer-events-none" />
                </div>
              </div>

              {/* City */}
              <div className="lg:col-span-1">
                <label className="block text-white text-sm font-medium mb-2">Ville</label>
                <div className="relative">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    title="Sélectionner une ville"
                    aria-label="Sélectionner une ville"
                    className="w-full pl-4 pr-10 py-3 rounded-xl text-white bg-gray-800/50 border border-gray-700 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200 appearance-none"
                  >
                    <option value="" className="bg-gray-800">Sélectionner une ville</option>
                    <option value="abidjan" className="bg-gray-800">Abidjan</option>
                    <option value="dakar" className="bg-gray-800">Dakar</option>
                    <option value="bamako" className="bg-gray-800">Bamako</option>
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
                  Appliquer
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
                    <category.icon size={16} className={selectedCategory === category.id ? 'text-white' : 'text-[#00644D]'} />
                    <span>{category.name === 'Toutes' ? 'Tout' : category.name}</span>
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
              {filteredCampaigns.map((campaign, index) => {
                const percentage = Math.min((campaign.currentAmount / campaign.targetAmount) * 100, 100);
                const endDate = new Date(campaign.endDate);
                const formattedDate = endDate.toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                });
                
                const categoryLabels: Record<string, string> = {
                  'urgence': 'Urgence',
                  'education': 'Éducation',
                  'sante': 'Santé',
                  'developpement': 'Développement',
                  'refugies': 'Réfugiés'
                };
                
                return (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="bg-[#101919] rounded-2xl overflow-hidden shadow-lg">
                      <div className="relative">
                        <img
                          src={campaign.image}
                          alt={campaign.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-4 left-4 bg-[#10191983] text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {categoryLabels[campaign.category] || campaign.category}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl lg:text-2xl font-bold text-white mb-3">
                          {campaign.title}
                        </h3>
                        <p className="text-white/70 text-sm mb-2 leading-relaxed">
                          {campaign.description}
                        </p>
                        <p className="text-white/70 text-sm mb-4 leading-relaxed">
                          {campaign.impact}
                        </p>
                        
                        {/* Location and Deadline */}
                        <div className="flex justify-between items-center mb-4 text-sm text-white/70">
                          <div className="flex items-center space-x-2">
                            <MapPin size={16} className="text-green-800" />
                            <span>{campaign.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar size={16} className="text-green-800" />
                            <span>Fin: {formattedDate}</span>
                          </div>
                        </div>

                        {/* Funding Progress */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-bold">
                              {campaign.currentAmount.toLocaleString('fr-FR')} F CFA / {campaign.targetAmount.toLocaleString('fr-FR')} F CFA
                            </span>
                            <span className="text-white">{percentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${percentage}%`,
                                background: 'linear-gradient(to right, #5AB678, #20B6B3)'
                              }}
                            />
                          </div>
                        </div>

                        {/* Beneficiaries */}
                        <div className="flex items-center space-x-2 mb-6 text-sm text-white/70">
                          <Users size={16} className="text-green-800" />
                          <span>{campaign.beneficiaries.toLocaleString('fr-FR')} bénéficiaires</span>
                        </div>

                        {/* CTA Button */}
                        <Link href={`/campagnes/${campaign.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full text-white py-3 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                            style={{ background: 'linear-gradient(to right, #5AB678, #20B6B3)' }}
                          >
                            <Heart size={18} className="fill-white" />
                            <span>Soutenir cette campagne</span>
                            <ArrowRight size={18} />
                          </motion.button>
                        </Link>
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
                    <div className="bg-[#101919]/50 rounded-2xl shadow-lg border border-white/10 p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                        <div className="relative w-full sm:w-32 h-48 sm:h-32 flex-shrink-0">
                          <img
                            src={campaign.image}
                            alt={campaign.title}
                            className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
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

                        <div className="flex-1 w-full min-w-0">
                          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-blue-600 transition-colors break-words">
                            {campaign.title}
                          </h3>
                          <p className="text-white/70 mb-4 text-sm sm:text-base line-clamp-2">
                            {campaign.description}
                          </p>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-white/70 mb-4">
                            <div className="flex items-center space-x-1">
                              <MapPin size={14} className="sm:w-4 sm:h-4" />
                              <span className="truncate">{campaign.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users size={14} className="sm:w-4 sm:h-4" />
                              <span>{campaign.beneficiaries.toLocaleString()} bénéficiaires</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar size={14} className="sm:w-4 sm:h-4" />
                              <span className="truncate">Se termine le {new Date(campaign.endDate).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-xs sm:text-sm mb-1">
                                <span className="text-white/70">Progression</span>
                                <span className="font-semibold text-white">
                                  {getProgressPercentage(campaign.currentAmount, campaign.targetAmount).toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-white/20 rounded-full h-2 sm:h-3">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${getProgressPercentage(campaign.currentAmount, campaign.targetAmount)}%` }}
                                  transition={{ duration: 1, delay: index * 0.1 }}
                                  className={`h-2 sm:h-3 rounded-full ${
                                    getProgressPercentage(campaign.currentAmount, campaign.targetAmount) > 80 ? 'bg-green-500' :
                                    getProgressPercentage(campaign.currentAmount, campaign.targetAmount) > 50 ? 'bg-[#00a63e]' :
                                    'bg-blue-500'
                                  }`}
                                />
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div>
                                <p className="text-lg sm:text-2xl font-bold text-white">
                                  {formatAmount(campaign.currentAmount)}
                                </p>
                                <p className="text-xs sm:text-sm text-white/70">
                                  collecté sur {formatAmount(campaign.targetAmount)}
                                </p>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-[#00644d]/40 text-white rounded-xl font-semibold hover:bg-[#00644d]/20 transition-all duration-200 flex items-center justify-center space-x-2"
                              >
                                <span>Soutenir</span>
                                <ArrowRight size={14} className="sm:w-4 sm:h-4" />
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
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucune campagne trouvée
            </h3>
            <p className="text-white/70">
              Essayez de modifier vos critères de recherche
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
                  Emportez Amane+ partout avec vous
                </h2>
                <p className="text-lg text-white/80 mb-8 leading-relaxed">
                Retrouvez toutes les fonctionnalités d’Amane+ dans une seule application. Faites vos dons, suivez vos rendements, automatisez votre Zakat et participez à des actions solidaires, où que vous soyez.
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

      {/* Modal de don */}
      <MakeDonationModal 
        isOpen={showDonationModal} 
        onClose={() => setShowDonationModal(false)}
        balance={walletBalance}
      />
    </div>
  );
} 