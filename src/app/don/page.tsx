'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, CreditCard, Shield, Users, Target, ArrowRight, CheckCircle,
  Star, Gift, Zap, Globe, TrendingUp, Award, Calendar, MapPin,
  ChevronDown, ChevronUp, Minus, Plus, Lock, Eye, EyeOff, Wallet
} from 'lucide-react';

export default function DonPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [donationAmount, setDonationAmount] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('');
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
    { id: 1, title: 'Montant', icon: Target },
    { id: 2, title: 'Campagne', icon: Heart },
    { id: 3, title: 'Informations', icon: Users },
    { id: 4, title: 'Paiement', icon: CreditCard },
    { id: 5, title: 'Confirmation', icon: CheckCircle },
  ];

  const campaigns = [
    {
      id: '1',
      title: 'Aide d\'urgence pour les réfugiés syriens',
      description: 'Soutien vital pour les familles déplacées',
      image: 'https://images.unsplash.com/photo-1724349620843-99aba60eab8d?q=80&w=1470&auto=format&fit=crop',
      progress: 65,
      target: 50000,
      current: 32450,
    },
    {
      id: '2',
      title: 'Construction d\'une école au Mali',
      description: 'Bâtir l\'avenir avec une école primaire moderne',
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=600&fit=crop',
      progress: 61,
      target: 75000,
      current: 45600,
    },
    {
      id: '3',
      title: 'Centre médical mobile au Bangladesh',
      description: 'Soins de santé primaires pour les communautés rurales',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
      progress: 63,
      target: 30000,
      current: 18900,
    },
  ];

  const quickAmounts = [1000, 2500, 5000, 10000, 25000, 50000];

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAmountSelect = (amount: number) => {
    setDonationAmount(amount.toString());
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
                <Heart size={40} className="text-white" />
              </div>
            </motion.div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Faire un <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-800 to-green-600">Don</span>
            </h1>
            <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
              Soutenez des causes importantes et faites une différence dans la vie des autres. 
              Chaque don compte pour construire un monde meilleur.
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
                      currentStep >= step.id 
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">Choisissez le montant</h2>
                      <p className="text-gray-700">Sélectionnez le montant que vous souhaitez donner</p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-3">
                          Montant en XOF
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={donationAmount}
                            onChange={(e) => setDonationAmount(e.target.value)}
                            placeholder="0"
                            className="w-full px-6 py-4 text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                            title="Montant du don"
                          />
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                            XOF
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-800 mb-3">Montants rapides</p>
                        <div className="grid grid-cols-3 gap-3">
                          {quickAmounts.map((amount) => (
                            <motion.button
                              key={amount}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAmountSelect(amount)}
                              className={`p-4 rounded-xl border-2 font-semibold transition-all duration-200 ${
                                donationAmount === amount.toString()
                                  ? 'border-green-500 bg-green-50 text-green-600'
                                  : 'border-gray-300 hover:border-green-300 hover:bg-green-50 text-gray-700'
                              }`}
                            >
                              {formatAmount(amount)}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">Choisissez une campagne</h2>
                      <p className="text-gray-700">Sélectionnez la cause que vous souhaitez soutenir</p>
                    </div>

                    <div className="space-y-4">
                      {campaigns.map((campaign, index) => (
                        <motion.div
                          key={campaign.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -2 }}
                          className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                            selectedCampaign === campaign.id
                              ? 'border-green-500 bg-green-50 shadow-lg'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                          onClick={() => setSelectedCampaign(campaign.id)}
                        >
                          <div className="flex items-center space-x-4">
                            <img
                              src={campaign.image}
                              alt={campaign.title}
                              className="w-16 h-16 object-cover rounded-xl"
                            />
                            <div className="flex-1">
                                                      <h3 className="font-bold text-gray-900 mb-1">{campaign.title}</h3>
                        <p className="text-sm text-gray-700 mb-2">{campaign.description}</p>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-700">Progression</span>
                                  <span className="font-semibold">{campaign.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${campaign.progress}%` }}
                                    transition={{ duration: 1, delay: index * 0.1 }}
                                    className="h-2 rounded-full bg-gradient-to-r from-green-800 to-green-600"
                                  />
                                </div>
                                <div className="flex justify-between text-xs text-gray-600">
                                  <span>{formatAmount(campaign.current)} collecté</span>
                                  <span>Objectif: {formatAmount(campaign.target)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">Vos informations</h2>
                      <p className="text-gray-700">Remplissez vos informations personnelles</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prénom
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200"
                          title="Prénom"
                          placeholder="Votre prénom"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200"
                          title="Nom"
                          placeholder="Votre nom"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                                              <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200"
                          title="Adresse email"
                          placeholder="votre@email.com"
                        />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                                              <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200"
                          title="Numéro de téléphone"
                          placeholder="+225 07 12 34 56 78"
                        />
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={formData.anonymous}
                        onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
                        className="w-5 h-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="anonymous" className="text-sm text-gray-700">
                        Faire un don anonyme
                      </label>
                    </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">Méthode de paiement</h2>
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
                        className="space-y-4"
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
                              >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {paymentMethod === 'amane' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
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
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {currentStep === 5 && (
                  <motion.div
                    key="step5"
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
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">Don confirmé !</h2>
                      <p className="text-gray-700 mb-6">
                        Merci pour votre générosité. Votre don de {formatAmount(parseInt(donationAmount) || 0)} 
                        a été traité avec succès.
                      </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                      <h3 className="font-semibold text-green-900 mb-2">Récapitulatif</h3>
                      <div className="space-y-2 text-sm text-green-800">
                        <div className="flex justify-between">
                          <span>Montant:</span>
                          <span className="font-semibold">{formatAmount(parseInt(donationAmount) || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Campagne:</span>
                          <span className="font-semibold">Aide d'urgence pour les réfugiés syriens</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Méthode:</span>
                          <span className="font-semibold">Carte bancaire</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              {currentStep < 5 && (
                <div className="flex justify-between mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePrev}
                    disabled={currentStep === 1}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Précédent
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    className="px-8 py-3 bg-gradient-to-r from-green-800 to-green-600 text-white rounded-xl font-semibold hover:from-green-900 hover:to-green-700 transition-all duration-200 flex items-center space-x-2"
                  >
                    <span>{currentStep === 4 ? 'Confirmer le don' : 'Suivant'}</span>
                    <ArrowRight size={20} />
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Donation Summary */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Résumé du don</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                                          <span className="text-gray-700">Montant:</span>
                  <span className="font-bold text-gray-900">
                    {donationAmount ? formatAmount(parseInt(donationAmount)) : '0 XOF'}
                  </span>
                </div>
                <div className="flex justify-between">
                                          <span className="text-gray-700">Frais:</span>
                  <span className="font-bold text-gray-900">0 XOF</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="font-bold text-xl text-green-600">
                      {donationAmount ? formatAmount(parseInt(donationAmount)) : '0 XOF'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center space-x-3 mb-4">
                <Shield size={24} className="text-green-600" />
                <h3 className="font-semibold text-gray-900">Paiement sécurisé</h3>
              </div>
                                      <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <Lock size={16} className="text-green-500" />
                  <span>Chiffrement SSL 256-bit</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield size={16} className="text-green-500" />
                  <span>Protection des données</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Certification PCI DSS</span>
                </div>
              </div>
            </div>

            {/* Impact Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Votre impact</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users size={24} className="text-green-600" />
                  </div>
                                          <p className="text-2xl font-bold text-gray-900">25K+</p>
                        <p className="text-sm text-gray-700">Bénéficiaires aidés</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Globe size={24} className="text-green-600" />
                  </div>
                                          <p className="text-2xl font-bold text-gray-900">15+</p>
                        <p className="text-sm text-gray-700">Pays touchés</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 