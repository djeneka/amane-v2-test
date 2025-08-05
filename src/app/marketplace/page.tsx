'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Clock, Heart, Star, Sparkles } from 'lucide-react';

export default function MarketplacePage() {
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

      {/* Main Content */}
      <div className="relative pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Icon */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="inline-block mb-8"
            >
              <div className="w-32 h-32 bg-gradient-to-br from-green-800 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
                <ShoppingBag size={64} className="text-white" />
              </div>
            </motion.div>

            {/* Title */}
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Marketplace <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-800 to-green-600">Halal</span>
            </h1>

            {/* Coming Soon Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-semibold mb-8 shadow-lg"
            >
              <Clock size={20} />
              <span>Bientôt disponible</span>
            </motion.div>

            {/* Description */}
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Découvrez bientôt notre marketplace dédiée aux produits et services halal. 
              Une sélection rigoureuse d'articles conformes aux principes islamiques.
            </p>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart size={24} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Produits Halal</h3>
                <p className="text-gray-600 text-sm">
                  Une sélection rigoureuse de produits conformes aux principes islamiques
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star size={24} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Qualité Garantie</h3>
                <p className="text-gray-600 text-sm">
                  Tous nos produits sont vérifiés et certifiés par des experts
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={24} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Expérience Unique</h3>
                <p className="text-gray-600 text-sm">
                  Une plateforme moderne et intuitive pour vos achats en ligne
                </p>
              </motion.div>
            </div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Soyez informé en premier !
              </h2>
              <p className="text-gray-600 mb-6">
                Inscrivez-vous à notre liste d'attente pour être notifié dès le lancement
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-green-800 to-green-600 text-white rounded-lg font-semibold hover:from-green-900 hover:to-green-700 transition-all duration-200">
                  S'inscrire
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 