'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Users, Star, Calendar, MapPin, 
  CheckCircle, TrendingUp, Shield, Globe,
  Eye, Share2, Bookmark, ChevronRight, CreditCard, Lock, EyeOff, X, Wallet
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { savingsProducts } from '@/data/mockData';

export default function EpargneDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
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

  // Unwrap params using React.use()
  const { id } = use(params);
  
  // Trouver le produit par ID
  const product = savingsProducts.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-50 to-green-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center bg-white rounded-3xl p-8 shadow-2xl border border-gray-200 max-w-md mx-4"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield size={40} className="text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Produit non trouvé</h1>
          <p className="text-gray-600 mb-8 text-lg">
            Le produit que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Link href="/epargne">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-2 mx-auto"
            >
              <ArrowLeft size={20} />
              <span>Retour aux produits</span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const categoryIcons = {
    traditionnel: Shield,
    islamique: Shield,
    objectif: TrendingUp,
    flexible: Globe,
  };

  const categoryColors = {
    traditionnel: 'bg-green-500',
    islamique: 'bg-blue-500',
    objectif: 'bg-purple-500',
    flexible: 'bg-orange-500',
  };

  // Images pour chaque catégorie
  const categoryImages = {
    traditionnel: [
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop'
    ],
    islamique: [
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop'
    ],
    objectif: [
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop'
    ],
    flexible: [
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop'
    ]
  };

  const images = categoryImages[product.category as keyof typeof categoryImages] || [];

  // Effet pour le défilement automatique du carrousel
  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [images.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactAmount = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}Mds F CFA`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M F CFA`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K F CFA`;
    } else {
      return formatAmount(amount);
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const handleStartSaving = () => {
    setShowPaymentPopup(true);
    setCurrentStep(1);
  };

  const handleClosePopup = () => {
    setShowPaymentPopup(false);
    setCurrentStep(1);
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const steps = [
    { id: 1, title: 'Paiement', icon: CreditCard },
    { id: 2, title: 'Confirmation', icon: CheckCircle },
  ];

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

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4 mb-8"
        >
          <Link href="/epargne">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 text-white hover:text-green-200 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Retour aux produits</span>
            </motion.button>
          </Link>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="relative">
              <div className="w-full h-96 relative overflow-hidden rounded-3xl">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={images[currentImageIndex] || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop'}
                    alt={`${product.name} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover absolute inset-0"
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop';
                    }}
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-black/20"></div>
                
                {/* Indicateurs d'images */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${
                          currentImageIndex === index
                            ? 'bg-white'
                            : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
                
                {/* Bouton pour changer d'image manuellement */}
                {images.length > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={nextImage}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-green-500 transition-colors"
                    title="Changer d'image"
                  >
                    <Eye size={20} />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex space-x-4">
                {images.map((image, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      currentImageIndex === index
                        ? 'border-green-500'
                        : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${
                  categoryColors[product.category]
                }`}>
                  {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </span>
                <div className="flex items-center space-x-2 text-yellow-500">
                  <Star size={16} />
                  <Star size={16} />
                  <Star size={16} />
                  <Star size={16} />
                  <Star size={16} />
                  <span className="text-gray-700 text-sm ml-1">(4.7)</span>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-xl text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Savings Details */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-700">Taux d'intérêt</p>
                  <p className="text-3xl font-bold text-green-600">{product.interestRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Épargne minimum</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCompactAmount(product.minAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Objectif</p>
                  <p className="text-xl font-semibold text-gray-900">{formatCompactAmount(product.targetAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Durée</p>
                  <p className="text-xl font-semibold text-gray-900">{product.duration}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progression</span>
                  <span>{getProgressPercentage(product.currentAmount, product.targetAmount).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgressPercentage(product.currentAmount, product.targetAmount)}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{formatCompactAmount(product.currentAmount)}</span>
                  <span>{formatCompactAmount(product.targetAmount)}</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartSaving}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Commencer à épargner</span>
              </motion.button>
            </div>

            {/* Features */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Avantages de l'épargne</h3>
              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <CheckCircle size={20} className="text-green-500" />
                  <span className="text-gray-800">Intérêts garantis</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-3"
                >
                  <CheckCircle size={20} className="text-green-500" />
                  <span className="text-gray-800">Retrait flexible</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center space-x-3"
                >
                  <CheckCircle size={20} className="text-green-500" />
                  <span className="text-gray-800">Sécurité maximale</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center space-x-3"
                >
                  <CheckCircle size={20} className="text-green-500" />
                  <span className="text-gray-800">Suivi en temps réel</span>
                </motion.div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Informations supplémentaires</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Type d'épargne</span>
                  <span className="font-semibold capitalize">{product.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Frais de gestion</span>
                  <span className="font-semibold text-green-600">0%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Capital garanti</span>
                  <span className="font-semibold text-green-600">Oui</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Support client</span>
                  <span className="font-semibold">24/7</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Payment Popup */}
      <AnimatePresence>
        {showPaymentPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white rounded-t-3xl p-6 border-b border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Paiement sécurisé</h3>
                    <p className="text-gray-600">Ouverture compte épargne {product.name}</p>
                  </div>
                  <button 
                    onClick={handleClosePopup} 
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Fermer"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-center">
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
                            : 'bg-gray-100 text-gray-600'
                        } shadow-lg`}
                      >
                        <step.icon size={20} />
                        <span className="font-medium">{step.title}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-8">
                        <h4 className="text-2xl font-bold text-gray-900 mb-2">Méthode de paiement</h4>
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
                              <Wallet size={24} className="text-green-600" />
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
                              <PiggyBank size={24} className="text-green-600" />
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
                          className="space-y-4 mt-6"
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
                                  title={showPassword ? "Masquer" : "Afficher"}
                                >
                                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {paymentMethod === 'mobile' && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4 mt-6"
                        >
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Numéro de téléphone
                            </label>
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200"
                              placeholder="+225 07 12 34 56 78"
                              title="Numéro de téléphone"
                            />
                          </div>
                        </motion.div>
                      )}

                      {paymentMethod === 'amane' && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4 mt-6"
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
                                title={showPassword ? "Masquer" : "Afficher"}
                              >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
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
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Compte épargne ouvert !</h2>
                        <p className="text-gray-700 mb-6">
                          Votre compte épargne {product.name} a été créé avec succès. Vous pouvez maintenant commencer à épargner.
                        </p>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                        <h3 className="font-semibold text-green-900 mb-2">Récapitulatif</h3>
                        <div className="space-y-2 text-sm text-green-800">
                          <div className="flex justify-between">
                            <span>Produit:</span>
                            <span className="font-semibold">{product.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Taux d'intérêt:</span>
                            <span className="font-semibold">{product.interestRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Méthode:</span>
                            <span className="font-semibold">
                              {paymentMethod === 'card' ? 'Carte bancaire' : 
                               paymentMethod === 'mobile' ? 'Paiement mobile' : 'Compte Amane'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                {currentStep < 2 && (
                  <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClosePopup}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-all duration-200"
                    >
                      Annuler
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNext}
                      className="px-8 py-3 bg-gradient-to-r from-green-800 to-green-600 text-white rounded-xl font-semibold hover:from-green-900 hover:to-green-700 transition-all duration-200 flex items-center space-x-2"
                    >
                      <span>Confirmer l'ouverture</span>
                      <ChevronRight size={20} />
                    </motion.button>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="flex justify-center mt-8 pt-6 border-t border-gray-100">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClosePopup}
                      className="px-8 py-3 bg-gradient-to-r from-green-800 to-green-600 text-white rounded-xl font-semibold hover:from-green-900 hover:to-green-700 transition-all duration-200"
                    >
                      Fermer
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 