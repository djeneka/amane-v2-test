'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Settings, Heart, CreditCard, Shield, TrendingUp, Edit, Save, 
  Bell, Globe, Lock, Camera, Award, Calendar, MapPin, Phone, Mail,
  ChevronRight, Star, Zap, Target, Users, Coins, Activity
} from 'lucide-react';
import { currentUser, transactions } from '@/data/mockData';
import { PieChart as MinimalPieChart } from 'react-minimal-pie-chart';

export default function ProfilPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: '+225 07 12 34 56 78',
    location: 'Abidjan, Côte d\'Ivoire',
    notifications: currentUser.preferences.notifications,
    newsletter: currentUser.preferences.newsletter,
    language: currentUser.preferences.language,
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'activity', label: 'Activité', icon: Activity },
    { id: 'rewards', label: 'Récompenses', icon: Award },
    { id: 'impact', label: 'Impact', icon: Target }, // Ajout de l'onglet Impact
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  const achievements = [
    { name: 'Premier Don', icon: Heart, color: 'bg-green-500', unlocked: true },
    { name: 'Zakat Complète', icon: Coins, color: 'bg-green-500', unlocked: true },
    { name: 'Investisseur', icon: TrendingUp, color: 'bg-green-500', unlocked: true },
    { name: 'Protégé', icon: Shield, color: 'bg-green-500', unlocked: false },
    { name: 'Ambassadeur', icon: Users, color: 'bg-green-500', unlocked: false },
  ];

  const recentActivity = transactions.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-50 to-green-50">
      {/* Floating Background Elements */}
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
          className="absolute top-40 right-32 w-24 h-24 bg-green-200/20 rounded-full blur-xl"
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
              whileHover={{ scale: 1.05 }}
              className="relative inline-block mb-8"
            >
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-2xl"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute bottom-2 right-2 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg"
                >
                  <Camera size={20} />
                </motion.button>
              </div>
            </motion.div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              {currentUser.name}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Membre depuis {formatDate(currentUser.joinDate)}
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Points gagnés</p>
                    <p className="text-2xl font-bold text-green-600">{currentUser.points}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Star size={24} className="text-green-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total des dons</p>
                    <p className="text-2xl font-bold text-green-600">{formatAmount(currentUser.totalDonations)}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Heart size={24} className="text-green-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Niveau</p>
                    <p className="text-2xl font-bold text-green-600">Or</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Award size={24} className="text-green-600" />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={20} />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid lg:grid-cols-2 gap-8"
            >
              {/* Personal Information */}
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Informations personnelles</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {isEditing ? <Save size={16} /> : <Edit size={16} />}
                    <span>{isEditing ? 'Sauvegarder' : 'Modifier'}</span>
                  </motion.button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                    <User size={20} className="text-gray-600" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Nom complet</p>
                                             <input
                         type="text"
                         value={userData.name}
                         onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                         disabled={!isEditing}
                         className="w-full bg-transparent border-none text-lg font-semibold text-gray-900 focus:outline-none disabled:opacity-100"
                         title="Nom complet"
                         placeholder="Votre nom complet"
                       />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                    <Mail size={20} className="text-gray-600" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Email</p>
                                             <input
                         type="email"
                         value={userData.email}
                         onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                         disabled={!isEditing}
                         className="w-full bg-transparent border-none text-lg font-semibold text-gray-900 focus:outline-none disabled:opacity-100"
                         title="Adresse email"
                         placeholder="votre@email.com"
                       />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                    <Phone size={20} className="text-gray-600" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Téléphone</p>
                                             <input
                         type="tel"
                         value={userData.phone}
                         onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                         disabled={!isEditing}
                         className="w-full bg-transparent border-none text-lg font-semibold text-gray-900 focus:outline-none disabled:opacity-100"
                         title="Numéro de téléphone"
                         placeholder="+225 07 12 34 56 78"
                       />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                    <MapPin size={20} className="text-gray-600" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Localisation</p>
                                             <input
                         type="text"
                         value={userData.location}
                         onChange={(e) => setUserData({ ...userData, location: e.target.value })}
                         disabled={!isEditing}
                         className="w-full bg-transparent border-none text-lg font-semibold text-gray-900 focus:outline-none disabled:opacity-100"
                         title="Localisation"
                         placeholder="Votre ville, pays"
                       />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Achievements */}
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Réalisations</h3>
                <div className="grid grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl border-2 ${
                        achievement.unlocked 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-gray-50 opacity-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${achievement.color}`}>
                          <achievement.icon size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{achievement.name}</p>
                          <p className="text-sm text-gray-600">
                            {achievement.unlocked ? 'Débloqué' : 'À débloquer'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Activité récente</h3>
                <div className="space-y-4">
                  {recentActivity.map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Heart size={20} className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-600">{formatDate(transaction.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatAmount(transaction.amount)}</p>
                        <p className="text-xs text-gray-500 capitalize">{transaction.type}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'rewards' && (
            <motion.div
              key="rewards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid lg:grid-cols-2 gap-8"
            >
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Points et récompenses</h3>
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap size={32} className="text-white" />
                  </div>
                  <p className="text-4xl font-bold text-gray-900 mb-2">{currentUser.points}</p>
                  <p className="text-gray-600">Points disponibles</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="font-semibold">Niveau actuel</span>
                    <span className="text-green-600 font-bold">Or</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="font-semibold">Prochain niveau</span>
                    <span className="text-gray-600">Platine (2000 pts)</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Récompenses disponibles</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Don gratuit', points: 100, available: true },
                    { name: 'Réduction 10%', points: 250, available: true },
                    { name: 'Consultation gratuite', points: 500, available: false },
                    { name: 'Voyage de solidarité', points: 1000, available: false },
                  ].map((reward, index) => (
                    <motion.div
                      key={reward.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl border-2 ${
                        reward.available 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-gray-50 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{reward.name}</p>
                          <p className="text-sm text-gray-600">{reward.points} points</p>
                        </div>
                        {reward.available && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Échanger
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'impact' && (
            <motion.div
              key="impact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden"
            >
              {(() => {
                // Récupérer les campagnes et transactions
                // @ts-ignore
                const { campaigns } = require('@/data/mockData');
                // @ts-ignore
                const userDonations = transactions.filter((t: any) => t.type === 'donation');
                // Campagnes auxquelles l'utilisateur a donné
                const donatedCampaigns = campaigns.filter((c: any) => userDonations.some((t: any) => t.campaignId === c.id));
                // Nombre total de bénéficiaires
                const totalBeneficiaries = donatedCampaigns.reduce((sum: number, c: any) => sum + (c.beneficiaries || 0), 0);
                // Pays touchés (distincts)
                const countries = Array.from(new Set(donatedCampaigns.flatMap((c: any) => c.location.split(',').map((l: string) => l.trim()))));
                // Total des dons
                const totalDon = userDonations.reduce((sum: number, t: any) => sum + t.amount, 0);
                
                // Calculer les pourcentages pour les cercles
                const total = totalBeneficiaries + countries.length * 100 + totalDon;
                const beneficiariesPercent = total > 0 ? (totalBeneficiaries / total) * 100 : 33;
                const countriesPercent = total > 0 ? ((countries.length * 100) / total) * 100 : 33;
                const donationsPercent = total > 0 ? (totalDon / total) * 100 : 34;

                return (
                  <div className="relative w-full max-w-2xl">
                    {/* Particules flottantes */}
                    <motion.div
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                        scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                      }}
                      className="absolute inset-0 pointer-events-none"
                    >
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            x: [0, Math.sin(i * 45) * 100],
                            y: [0, Math.cos(i * 45) * 100],
                            opacity: [0.3, 0.8, 0.3]
                          }}
                          transition={{
                            duration: 4 + i * 0.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="absolute w-2 h-2 bg-green-400 rounded-full"
                          style={{
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)'
                          }}
                        />
                      ))}
                    </motion.div>

                    {/* Cercle principal avec animation */}
                    <div className="relative flex items-center justify-center">
                      {/* Cercle extérieur - Bénéficiaires */}
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="absolute w-80 h-80 rounded-full border-8 border-green-500/30"
                        style={{
                          background: `conic-gradient(from 0deg, #22c55e ${beneficiariesPercent * 3.6}deg, transparent ${beneficiariesPercent * 3.6}deg)`
                        }}
                      />
                      
                      {/* Cercle moyen - Pays */}
                      <motion.div
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="absolute w-64 h-64 rounded-full border-8 border-blue-500/30"
                        style={{
                          background: `conic-gradient(from 0deg, #3b82f6 ${countriesPercent * 3.6}deg, transparent ${countriesPercent * 3.6}deg)`
                        }}
                      />
                      
                      {/* Cercle intérieur - Dons */}
                      <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="absolute w-48 h-48 rounded-full border-8 border-pink-500/30"
                        style={{
                          background: `conic-gradient(from 0deg, #ec4899 ${donationsPercent * 3.6}deg, transparent ${donationsPercent * 3.6}deg)`
                        }}
                      />

                      {/* Centre avec icône et valeur principale */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="relative w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white"
                      >
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 rounded-full border-2 border-white/20"
                        />
                        <div className="text-center z-10">
                          <Users size={32} className="text-white mb-1" />
                          <p className="text-lg font-bold text-white">{totalBeneficiaries}</p>
                        </div>
                      </motion.div>
                    </div>

                    {/* Indicateurs latéraux animés */}
                    <div className="grid grid-cols-3 gap-6 mt-12">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1 }}
                        className="text-center group"
                      >
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
                        >
                          <Users size={24} className="text-white" />
                        </motion.div>
                        <p className="text-2xl font-bold text-green-600 mb-1">{totalBeneficiaries}</p>
                        <p className="text-sm text-gray-600">Bénéficiaires</p>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${beneficiariesPercent}%` }}
                          transition={{ duration: 1, delay: 1.2 }}
                          className="h-1 bg-green-500 rounded-full mt-2"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.2 }}
                        className="text-center group"
                      >
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: -5 }}
                          className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
                        >
                          <Globe size={24} className="text-white" />
                        </motion.div>
                        <p className="text-2xl font-bold text-blue-600 mb-1">{countries.length}</p>
                        <p className="text-sm text-gray-600">Pays touchés</p>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${countriesPercent}%` }}
                          transition={{ duration: 1, delay: 1.4 }}
                          className="h-1 bg-blue-500 rounded-full mt-2"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.4 }}
                        className="text-center group"
                      >
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
                        >
                          <Heart size={24} className="text-white" />
                        </motion.div>
                        <p className="text-2xl font-bold text-pink-600 mb-1">{formatAmount(totalDon)}</p>
                        <p className="text-sm text-gray-600">Total dons</p>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${donationsPercent}%` }}
                          transition={{ duration: 1, delay: 1.6 }}
                          className="h-1 bg-pink-500 rounded-full mt-2"
                        />
                      </motion.div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Paramètres</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Bell size={20} className="text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Notifications</p>
                        <p className="text-sm text-gray-600">Recevoir les alertes</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userData.notifications}
                        onChange={(e) => setUserData({ ...userData, notifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Mail size={20} className="text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Newsletter</p>
                        <p className="text-sm text-gray-600">Recevoir les actualités</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userData.newsletter}
                        onChange={(e) => setUserData({ ...userData, newsletter: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Globe size={20} className="text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Langue</p>
                        <p className="text-sm text-gray-600">Préférence linguistique</p>
                      </div>
                    </div>
                                         <select
                       value={userData.language}
                       onChange={(e) => setUserData({ ...userData, language: e.target.value as 'fr' | 'en' | 'ar' })}
                       className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       title="Sélectionner la langue"
                       aria-label="Sélectionner la langue"
                     >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Lock size={20} className="text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Sécurité</p>
                        <p className="text-sm text-gray-600">Changer le mot de passe</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Modifier
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 