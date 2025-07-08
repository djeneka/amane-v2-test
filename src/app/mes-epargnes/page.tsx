'use client';

import { motion } from 'framer-motion';
import { Wallet, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MesEpargnesPage() {
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
              Mes <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-800 to-green-600">Épargnes</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Gérez vos produits d'épargne et suivez vos investissements
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-12 text-center"
        >
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Wallet size={64} className="text-gray-400" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Aucune épargne pour le moment
          </h2>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Vous n'avez pas encore souscrit à des produits d'épargne. 
            Commencez dès aujourd'hui pour sécuriser votre avenir financier.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Plus size={20} />
              <span>Commencer à épargner</span>
            </motion.button>
            
            <Link href="/epargne">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-green-800 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-all duration-200 flex items-center justify-center space-x-2 border-2 border-green-200"
              >
                <ArrowLeft size={20} />
                <span>Découvrir les produits</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 