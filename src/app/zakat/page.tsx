'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, Info, AlertCircle, CheckCircle, ArrowRight, Coins, Scale, Heart,
  TrendingUp, Shield, Users, Globe, Star, Zap, Target, BookOpen, Lightbulb,
  ChevronDown, ChevronUp, Minus, Plus
} from 'lucide-react';
import { zakatCategories } from '@/data/mockData';

export default function ZakatPage() {
  const [formData, setFormData] = useState({
    gold: 0,
    silver: 0,
    savings: 0,
    investments: 0,
    rentalIncome: 0,
    business: 0,
  });

  const [totalZakat, setTotalZakat] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);

  const calculateZakat = () => {
    const total = Object.values(formData).reduce((sum, value) => sum + value, 0);
    const zakatAmount = total * 0.025; // 2.5%
    setTotalZakat(zakatAmount);
    setShowResult(true);
  };

  const handleInputChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const steps = [
    { id: 0, title: 'Or & Argent', icon: Coins },
    { id: 1, title: 'Épargne', icon: Shield },
    { id: 2, title: 'Investissements', icon: TrendingUp },
    { id: 3, title: 'Revenus', icon: Users },
  ];

  const infoCards = [
    {
      id: 'what-is-zakat',
      title: 'Qu\'est-ce que la Zakat ?',
      icon: BookOpen,
      color: 'bg-blue-500',
      content: 'La Zakat est le troisième pilier de l\'Islam. C\'est une aumône obligatoire de 2.5% sur les biens qui dépassent le seuil minimum (Nisab) depuis une année lunaire.'
    },
    {
      id: 'nisab',
      title: 'Seuil Nisab',
      icon: Scale,
      color: 'bg-green-500',
      content: 'Le Nisab est le seuil minimum de richesse requis pour être redevable de la Zakat. Il équivaut à 85g d\'or ou 595g d\'argent.'
    },
    {
      id: 'beneficiaries',
      title: 'Bénéficiaires',
      icon: Heart,
      color: 'bg-purple-500',
      content: 'La Zakat peut être versée aux pauvres, aux nécessiteux, aux nouveaux convertis, aux voyageurs en difficulté, et pour la cause d\'Allah.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-50 to-green-50">
      {/* Floating Particles */}
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
        <motion.div
          animate={{ 
            x: [0, 60, 0],
            y: [0, -80, 0],
            rotate: [0, 360, 0]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-1/2 w-16 h-16 bg-green-200/20 rounded-full blur-xl"
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
                <Calculator size={40} className="text-white" />
              </div>
            </motion.div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Calculateur de <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-800 to-green-600">Zakat</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Calculez facilement votre zakat annuelle selon les principes islamiques. 
              Purifiez vos biens et aidez les nécessiteux.
            </p>

            {/* Progress Steps */}
            <div className="flex justify-center mb-12">
              <div className="flex space-x-4">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                      activeStep >= step.id 
                        ? 'bg-gradient-to-r from-green-800 to-green-600 text-white' 
                        : 'bg-white/80 text-gray-600'
                    } shadow-lg`}
                  >
                    <step.icon size={20} />
                    <span className="font-medium">{step.title}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calculator Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                  <Calculator size={32} className="text-green-800" />
                  <span>Calculer votre Zakat</span>
                </h2>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                    disabled={activeStep === 0}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    <ChevronUp size={20} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveStep(Math.min(3, activeStep + 1))}
                    disabled={activeStep === 3}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    <ChevronDown size={20} />
                  </motion.button>
                </div>
              </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {zakatCategories.map((category, index) => (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        index < 2 
                          ? 'border-gray-200 bg-gray-50'
                          : activeStep === Math.floor(index / 2)
                            ? 'border-green-300 bg-green-50 shadow-lg'
                            : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold text-gray-800">{category.name}</h3>
                        <div className="flex items-center space-x-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              const currentValue = formData[category.name.toLowerCase().replace(/\s+/g, '') as keyof typeof formData] || 0;
                              handleInputChange(
                                category.name.toLowerCase().replace(/\s+/g, ''),
                                Math.max(0, currentValue - 1000)
                              );
                            }}
                            className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 text-gray-700"
                          >
                            <Minus size={12} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              const currentValue = formData[category.name.toLowerCase().replace(/\s+/g, '') as keyof typeof formData] || 0;
                              handleInputChange(
                                category.name.toLowerCase().replace(/\s+/g, ''),
                                currentValue + 1000
                              );
                            }}
                            className="w-6 h-6 bg-green-300 rounded-full flex items-center justify-center hover:bg-green-400 text-green-700"
                          >
                            <Plus size={12} />
                          </motion.button>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <input
                          type="number"
                          className="w-full px-4 py-3 text-sm font-bold border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200 text-gray-800 placeholder-gray-500"
                          value={formData[category.name.toLowerCase().replace(/\s+/g, '') as keyof typeof formData] || ''}
                          onChange={(e) => handleInputChange(
                            category.name.toLowerCase().replace(/\s+/g, ''),
                            parseFloat(e.target.value) || 0
                          )}
                          title={`Montant en ${category.name}`}
                          placeholder={`Montant en ${category.name}`}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-bold text-sm">
                          XOF
                        </div>
                      </div>
                      <p className="text-xs text-gray-700 mt-2 font-medium">{category.description}</p>
                    </motion.div>
                  ))}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={calculateZakat}
                  className="w-full bg-gradient-to-r from-green-800 to-green-600 hover:from-green-900 hover:to-green-700 text-white font-bold py-6 px-8 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg"
                >
                  <Calculator size={24} />
                  <span>Calculer la Zakat</span>
                  <ArrowRight size={24} />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Result & Info Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Result Card */}
            {showResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 text-white shadow-2xl"
              >
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle size={40} />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-2">
                    Votre Zakat Calculée
                  </h3>
                  <div className="text-4xl font-bold mb-4">
                    {formatAmount(totalZakat)}
                  </div>
                  <p className="text-green-100">
                    Montant à verser pour purifier vos biens
                  </p>
                </div>

                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-white text-green-600 font-bold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Heart size={20} />
                    <span>Verser ma Zakat</span>
                    <ArrowRight size={20} />
                  </motion.button>
                  
                  <button className="w-full border-2 border-white/30 text-white font-medium py-4 px-6 rounded-xl hover:bg-white/10 transition-colors duration-200">
                    Sauvegarder le calcul
                  </button>
                </div>
              </motion.div>
            )}

            {/* Info Cards */}
            <div className="space-y-4">
              {infoCards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 cursor-pointer"
                  onClick={() => setExpandedInfo(expandedInfo === card.id ? null : card.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${card.color}`}>
                        <card.icon size={24} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{card.title}</h4>
                        <p className="text-sm text-gray-700 font-medium">Cliquez pour en savoir plus</p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedInfo === card.id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown size={20} className="text-gray-600" />
                    </motion.div>
                  </div>
                  
                  <AnimatePresence>
                    {expandedInfo === card.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-gray-300"
                      >
                        <p className="text-gray-800 leading-relaxed font-medium">{card.content}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 