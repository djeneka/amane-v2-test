'use client';

import { motion } from 'framer-motion';
import { Gift, Star, Users, Target, ArrowRight, Trophy, Award, Heart, ShoppingBag } from 'lucide-react';
import { currentUser } from '@/data/mockData';

export default function PointsPage() {
  const rewards = [
    {
      id: 1,
      name: 'Carte cadeau 10,000 XOF',
      points: 1000,
      image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=300&fit=crop',
      category: 'shopping',
      available: true,
    },
    {
      id: 2,
      name: 'Don à une campagne',
      points: 500,
      image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=300&fit=crop',
      category: 'donation',
      available: true,
    },
    {
      id: 3,
      name: 'Réduction 20% Takaful',
      points: 2000,
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
      category: 'takaful',
      available: true,
    },
    {
      id: 4,
      name: 'Formation finance islamique',
      points: 3000,
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=300&fit=crop',
      category: 'education',
      available: false,
    },
  ];

  const activities = [
    { action: 'Don effectué', points: 50, date: '2024-01-15' },
    { action: 'Zakat versée', points: 100, date: '2024-01-10' },
    { action: 'Campagne partagée', points: 25, date: '2024-01-08' },
    { action: 'Profil complété', points: 30, date: '2024-01-05' },
  ];

  const stats = [
    { label: 'Points actuels', value: currentUser.points, icon: Star },
    { label: 'Points gagnés', value: 1500, icon: Trophy },
    { label: 'Récompenses obtenues', value: 8, icon: Gift },
    { label: 'Niveau actuel', value: 'Or', icon: Award },
  ];

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
      <section className="bg-gradient-to-br from-green-800 to-green-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gift size={32} />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Points & Récompenses
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              Gagnez des points en utilisant nos services et échangez-les contre des récompenses exclusives
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon size={24} className="text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Rewards Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Gift size={24} />
                <span>Récompenses disponibles</span>
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {rewards.map((reward, index) => (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                    className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div className="relative">
                      <img
                        src={reward.image}
                        alt={reward.name}
                        className="w-full h-48 object-cover"
                      />
                      {!reward.available && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-semibold">Bientôt disponible</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {reward.name}
                      </h3>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Star size={16} className="text-yellow-500" />
                          <span className="text-sm text-gray-600">{reward.points} points</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reward.category === 'shopping' ? 'bg-green-100 text-green-800' :
                          reward.category === 'donation' ? 'bg-green-100 text-green-800' :
                          reward.category === 'takaful' ? 'bg-green-100 text-green-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {reward.category}
                        </span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!reward.available}
                        className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 ${
                          reward.available
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <Gift size={20} />
                        <span>{reward.available ? 'Échanger' : 'Indisponible'}</span>
                        <ArrowRight size={20} />
                      </motion.button>
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
            {/* Points Balance */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Star size={20} />
                <span>Solde de points</span>
              </h3>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {currentUser.points}
                </div>
                <p className="text-gray-600">points disponibles</p>
              </div>

              <div className="mt-6">
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentUser.points / 2000) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-green-600 h-2 rounded-full"
                  />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  {2000 - currentUser.points} points pour le niveau suivant
                </p>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Trophy size={20} />
                <span>Activités récentes</span>
              </h3>

              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{formatDate(activity.date)}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star size={16} className="text-yellow-500" />
                      <span className="font-semibold text-gray-900">+{activity.points}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* How to Earn */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Target size={20} />
                <span>Comment gagner des points</span>
              </h3>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Heart size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Faire un don</p>
                    <p className="text-sm text-gray-600">+50 points par don</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingBag size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Partager une campagne</p>
                    <p className="text-sm text-gray-600">+25 points par partage</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Inviter un ami</p>
                    <p className="text-sm text-gray-600">+100 points par invitation</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 