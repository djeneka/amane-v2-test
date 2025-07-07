'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, Info, AlertCircle, CheckCircle, ArrowRight, Coins, Scale, Heart,
  TrendingUp, Shield, Users, Globe, Star, Zap, Target, BookOpen, Lightbulb,
  ChevronDown, ChevronUp, Minus, Plus, ArrowLeft, ArrowRight as ArrowRightIcon,
  Building, Home, Store
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

  const [checkedFields, setCheckedFields] = useState({
    gold: false,
    silver: false,
    savings: false,
    investments: false,
    rentalIncome: false,
    business: false,
  });

  const [totalZakat, setTotalZakat] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
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

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setCheckedFields(prev => ({
      ...prev,
      [field]: checked
    }));
    
    // Si on décoche, on remet la valeur à 0
    if (!checked) {
      setFormData(prev => ({
        ...prev,
        [field]: 0
      }));
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Mapping des icônes pour les catégories de zakat
  const categoryIcons: { [key: string]: any } = {
    'or et argent': Coins,
    'épargnes bancaires': Shield,
    'actions et investissements': TrendingUp,
    'revenus locatifs': Home,
    'commerce': Store
  };

  // Configuration des étapes avec les champs correspondants
  const steps = [
    { 
      id: 0, 
      title: 'Or & Argent', 
      icon: Coins,
      description: 'Valeur de votre or et argent',
      fields: [
        { key: 'gold', label: 'Or', description: 'Valeur de votre or en grammes ou en valeur monétaire' },
        { key: 'silver', label: 'Argent', description: 'Valeur de votre argent en grammes ou en valeur monétaire' }
      ]
    },
    { 
      id: 1, 
      title: 'Épargne & Investissements', 
      icon: Shield,
      description: 'Vos épargnes et placements',
      fields: [
        { key: 'savings', label: 'Épargnes bancaires', description: 'Solde de vos comptes d\'épargne' },
        { key: 'investments', label: 'Investissements', description: 'Valeur de vos placements et actions' }
      ]
    },
    { 
      id: 2, 
      title: 'Revenus & Business', 
      icon: TrendingUp,
      description: 'Revenus locatifs et activités commerciales',
      fields: [
        { key: 'rentalIncome', label: 'Revenus locatifs', description: 'Revenus de location de biens immobiliers' },
        { key: 'business', label: 'Commerce', description: 'Valeur des stocks et activités commerciales' }
      ]
    },
    { 
      id: 3, 
      title: 'Résumé & Calcul', 
      icon: Calculator,
      description: 'Vérification et calcul final',
      fields: []
    }
  ];

  const getCategoryData = (categoryKey: string) => {
    const category = zakatCategories.find(cat => 
      cat.name.toLowerCase().replace(/\s+/g, '') === categoryKey
    );
    
    if (category) {
      const iconKey = category.name.toLowerCase();
      return {
        ...category,
        icon: categoryIcons[iconKey] || Coins
      };
    }
    return null;
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    const currentStepData = steps[currentStep];
    if (currentStepData.fields.length === 0) return true;
    
    // Permettre de continuer même si aucun montant n'est saisi
    return true;
  };

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

  const renderStepContent = () => {
    const currentStepData = steps[currentStep];
    
    if (currentStep === 3) {
      // Résumé et calcul final
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-3">
              <Calculator size={28} className="text-green-800" />
              <span>Résumé de vos biens</span>
            </h3>
            
            <div className="space-y-4">
              {Object.entries(formData).map(([key, value]) => {
                const stepField = steps.flatMap(step => step.fields).find(field => field.key === key);
                if (!stepField || value === 0) return null;
                
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Coins size={20} className="text-green-800" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{stepField.label}</p>
                        <p className="text-sm text-gray-600">{stepField.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatAmount(value)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            <div className="mt-6 p-4 bg-green-100 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">Total des biens :</span>
                <span className="text-2xl font-bold text-green-800">
                  {formatAmount(Object.values(formData).reduce((sum, value) => sum + value, 0))}
                </span>
              </div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={calculateZakat}
            className="w-full bg-gradient-to-r from-green-800 to-green-600 hover:from-green-900 hover:to-green-700 text-white font-bold py-6 px-8 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg"
          >
            <Calculator size={24} />
            <span>Calculer ma Zakat</span>
            <ArrowRight size={24} />
          </motion.button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentStepData.title}</h3>
          <p className="text-gray-600">{currentStepData.description}</p>
          
          {/* Message informatif */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <Info size={20} className="text-blue-600" />
              <p className="text-sm text-blue-800 font-medium">
                Appuyez sur "Suivant" si vous n'avez pas de zakat pour ces types de biens
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {currentStepData.fields.map((field, index) => (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
            >
              {/* Checkbox */}
              <div className="flex items-center space-x-4 mb-4">
                <input
                  type="checkbox"
                  id={field.key}
                  checked={checkedFields[field.key as keyof typeof checkedFields]}
                  onChange={(e) => handleCheckboxChange(field.key, e.target.checked)}
                  className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                />
                <label htmlFor={field.key} className="text-lg font-bold text-gray-800 cursor-pointer">
                  {field.label}
                </label>
              </div>
              
              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">{field.description}</p>
              
              {/* Input field - only show if checkbox is checked */}
              <AnimatePresence>
                {checkedFields[field.key as keyof typeof checkedFields] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Valeur</label>
                      <div className="relative">
                        <input
                          type="number"
                          className="w-full px-4 py-4 text-lg font-bold border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200 text-gray-800 placeholder-gray-500"
                          value={formData[field.key as keyof typeof formData] || ''}
                          onChange={(e) => handleInputChange(
                            field.key,
                            parseFloat(e.target.value) || 0
                          )}
                          placeholder={`Montant en ${field.label}`}
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-bold">
                          XOF
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

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
              <div className="flex space-x-2">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                      currentStep >= step.id 
                        ? 'bg-gradient-to-r from-green-800 to-green-600 text-white shadow-lg' 
                        : 'bg-white/80 text-gray-600 shadow-md'
                    }`}
                  >
                    <step.icon size={20} />
                    <span className="font-medium hidden sm:inline">{step.title}</span>
                    <span className="font-medium sm:hidden">{step.id + 1}</span>
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
              {/* Step Navigation */}
              <div className="flex items-center justify-between mb-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-black"
                >
                  <ArrowLeft size={20} />
                  <span className="hidden sm:inline">Précédent</span>
                </motion.button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">Étape {currentStep + 1} sur {steps.length}</p>
                  <p className="font-semibold text-gray-800">{steps[currentStep].title}</p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextStep}
                  disabled={currentStep === steps.length - 1}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all duration-200"
                >
                  <span className="hidden sm:inline">Suivant</span>
                  <ArrowRightIcon size={20} />
                </motion.button>
              </div>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
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