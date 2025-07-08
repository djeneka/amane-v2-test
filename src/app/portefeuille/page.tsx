'use client';

import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Coins, Shield, BarChart3, ArrowRight, Target, Users, Star } from 'lucide-react';
import { currentUser, transactions } from '@/data/mockData';

export default function PortefeuillePage() {
  const portfolioData = {
    totalValue: 2500000,
    monthlyGrowth: 4.2,
    totalInvestments: 5,
    totalSavings: 3,
  };

  const investments = [
    {
      id: 1,
      name: 'Fonds Immobilier Éthique',
      type: 'investment',
      amount: 500000,
      growth: 8.5,
      status: 'active',
    },
    {
      id: 2,
      name: 'Agriculture Durable',
      type: 'investment',
      amount: 300000,
      growth: 6.2,
      status: 'active',
    },
    {
      id: 3,
      name: 'Épargne Hajj',
      type: 'savings',
      amount: 750000,
      growth: 4.2,
      status: 'active',
    },
    {
      id: 4,
      name: 'Épargne Mariage',
      type: 'savings',
      amount: 450000,
      growth: 4.0,
      status: 'active',
    },
  ];

  const stats = [
    { label: 'Valeur totale', value: '2.5M XOF', icon: Wallet },
    { label: 'Croissance mensuelle', value: '4.2%', icon: TrendingUp },
    { label: 'Investissements actifs', value: '5', icon: Target },
    { label: 'Épargnes actives', value: '3', icon: Coins },
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-50 to-green-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-800 to-green-600 text-white py-20 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1920&h=600&fit=crop')`
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-green-800/60" />
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
            >
              <Wallet size={32} />
            </motion.div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Mon Portefeuille
            </h1>
            <p className="text-xl text-white max-w-3xl mx-auto leading-relaxed">
              Suivez vos investissements et épargnes en temps réel. 
              Gérez votre patrimoine financier de manière éthique.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.05 }}
                className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <stat.icon size={24} className="text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-700 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Portfolio Overview */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <BarChart3 size={24} />
                <span>Aperçu du portefeuille</span>
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-50/80 to-green-100/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Valeur totale</h3>
                    <TrendingUp size={24} className="text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatAmount(portfolioData.totalValue)}
                  </div>
                  <p className="text-sm text-gray-700">
                    +{portfolioData.monthlyGrowth}% ce mois
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50/80 to-green-100/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Répartition</h3>
                    <Coins size={24} className="text-green-600" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Investissements</span>
                      <span className="font-semibold text-gray-900">60%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Épargnes</span>
                      <span className="font-semibold text-gray-900">40%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {investments.map((investment, index) => (
                  <motion.div
                    key={investment.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -2, scale: 1.02 }}
                    className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-white/80 transition-all duration-200 border border-white/20 shadow-sm"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-lg ${
                        investment.type === 'investment' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {investment.type === 'investment' ? <TrendingUp size={24} /> : <Coins size={24} />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{investment.name}</h4>
                        <p className="text-sm text-gray-700">
                          {investment.type === 'investment' ? 'Investissement' : 'Épargne'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatAmount(investment.amount)}
                      </p>
                      <p className={`text-sm ${
                        investment.growth > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        +{investment.growth}%
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions rapides
              </h3>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-between p-3 bg-green-50/80 backdrop-blur-sm rounded-lg hover:bg-green-100/80 transition-all duration-200 border border-white/20"
                >
                  <div className="flex items-center space-x-3">
                    <TrendingUp size={20} className="text-green-600" />
                    <span className="font-medium text-gray-900">Nouvel investissement</span>
                  </div>
                  <ArrowRight size={20} className="text-green-600" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-between p-3 bg-blue-50/80 backdrop-blur-sm rounded-lg hover:bg-blue-100/80 transition-all duration-200 border border-white/20"
                >
                  <div className="flex items-center space-x-3">
                    <Coins size={20} className="text-blue-600" />
                    <span className="font-medium text-gray-900">Nouvelle épargne</span>
                  </div>
                  <ArrowRight size={20} className="text-blue-600" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-between p-3 bg-purple-50/80 backdrop-blur-sm rounded-lg hover:bg-purple-100/80 transition-all duration-200 border border-white/20"
                >
                  <div className="flex items-center space-x-3">
                    <BarChart3 size={20} className="text-purple-600" />
                    <span className="font-medium text-gray-900">Rapport détaillé</span>
                  </div>
                  <ArrowRight size={20} className="text-purple-600" />
                </motion.button>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Transactions récentes
              </h3>

              <div className="space-y-3">
                {transactions.slice(0, 3).map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20"
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{transaction.description}</p>
                      <p className="text-xs text-gray-700">{formatDate(transaction.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 text-sm">
                        {formatAmount(transaction.amount)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status === 'completed' ? 'Terminé' : 'En cours'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Performance
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/40 backdrop-blur-sm rounded-lg border border-white/20">
                  <span className="text-gray-700">Rendement total</span>
                  <span className="font-semibold text-green-600">+12.5%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/40 backdrop-blur-sm rounded-lg border border-white/20">
                  <span className="text-gray-700">Rendement mensuel</span>
                  <span className="font-semibold text-blue-600">+4.2%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/40 backdrop-blur-sm rounded-lg border border-white/20">
                  <span className="text-gray-700">Risque</span>
                  <span className="font-semibold text-yellow-600">Modéré</span>
                </div>
              </div>

              <div className="mt-6">
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-green-600 h-2 rounded-full"
                  />
                </div>
                <p className="text-xs text-gray-700 text-center">
                  Objectif atteint à 75%
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 