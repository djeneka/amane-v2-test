'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, TrendingUp, Star, Calendar, 
  CheckCircle, Building, Leaf, Zap,
  Eye, Apple, Play
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { investmentProducts } from '@/data/mockData';
import MakeDonationModal from '@/components/MakeDonationModal';

export default function InvestirDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);

  // Trouver le produit par ID
  const product = investmentProducts.find(p => p.id === params.id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to left, #101919, #00644D)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Produit non trouvé</h1>
          <Link href="/investir" className="text-white hover:text-green-200">
            Retour aux produits
          </Link>
        </div>
      </div>
    );
  }

  const categoryIcons = {
    immobilier: Building,
    agriculture: Leaf,
    technologie: Zap,
    energie: Zap,
  };

  const categoryColors = {
    immobilier: 'bg-green-500',
    agriculture: 'bg-blue-500',
    technologie: 'bg-purple-500',
    energie: 'bg-orange-500',
  };

  const riskColors = {
    faible: 'bg-green-500',
    modere: 'bg-yellow-500',
    eleve: 'bg-red-500',
  };

  // Images pour chaque catégorie
  const categoryImages = {
    immobilier: [
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop'
    ],
    agriculture: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1574943320219-553eb213f72f?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=400&h=300&fit=crop'
    ],
    technologie: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
    ],
    energie: [
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop'
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

  const handleInvest = () => {
    setShowInvestmentModal(true);
  };

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

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4 mb-8"
        >
          <Link href="/investir">
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
              <div className="w-full h-[550px] relative overflow-hidden rounded-3xl">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={images[currentImageIndex] || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop'}
                    alt={`${product.name} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover absolute inset-0"
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop';
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
            className="bg-[#101919]/40 backdrop-blur-sm rounded-3xl p-8 space-y-8 flex flex-col"
          >
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${
                  categoryColors[product.category]
                }`}>
                  {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${
                  riskColors[product.riskLevel]
                }`}>
                  Risque {product.riskLevel}
                </span>
                <div className="flex items-center space-x-2 text-yellow-500">
                  <Star size={16} />
                  <Star size={16} />
                  <Star size={16} />
                  <Star size={16} />
                  <Star size={16} />
                  <span className="text-white text-sm ml-1">(4.9)</span>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-white">{product.name}</h1>
              <p className="text-xl text-white/80 leading-relaxed">{product.description}</p>
            </div>

            {/* Investment Details */}
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-bold text-white">
                  {product.expectedReturn}%
                </p>
                <p className="text-white/80">Rendement attendu</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <TrendingUp size={16} className="text-green-400" />
                  <span className="text-white/80">Investissement min:</span>
                  <span className="font-semibold text-white">{formatCompactAmount(product.minInvestment)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-green-400" />
                  <span className="text-white/80">Durée:</span>
                  <span className="font-semibold text-white">{product.duration}</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Avantages inclus</h3>
              <div className="space-y-3">
                {[
                  'Conforme aux principes islamiques',
                  'Transparence totale',
                  'Gestion professionnelle',
                  'Suivi en temps réel'
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle size={20} className="text-green-400" />
                    <span className="text-white/90">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Informations supplémentaires</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Type d'investissement</span>
                  <span className="font-semibold text-white">Halal (Conforme islam)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Liquidité</span>
                  <span className="font-semibold text-green-400">Flexible</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Frais de gestion</span>
                  <span className="font-semibold text-white">1.5% annuel</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Support client</span>
                  <span className="font-semibold text-white">24/7</span>
                </div>
              </div>
            </div>

            {/* Button at the bottom */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleInvest}
              className="mt-auto bg-gradient-to-r from-[#8FC99E] to-[#20B6B3] text-white px-8 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-2 w-full"
            >
              <TrendingUp size={20} />
              <span>Souscrire maintenant</span>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Investment Modal */}
      <MakeDonationModal
        isOpen={showInvestmentModal}
        onClose={() => setShowInvestmentModal(false)}
        title="Investissement"
        subtitle="Montant de l'investissement"
        description="Veuillez saisir le montant de l'investissement."
        amountSectionTitle="Montant de l'investissement"
        confirmationTitle="Veuillez confirmer votre transaction"
        confirmationDescription="Vérifiez les informations avant de confirmer votre investissement."
        recapTitle="Vous allez investir la somme de"
        recapMessage="Amane+ s'engage à utiliser votre argent, identifiés par nos partenaires de confiance."
        successTitle="Investissement confirmé !"
        successMessage="Votre investissement a été effectué avec succès."
        historyButtonText="Consulter l'historique"
        historyButtonLink="/transactions"
      />

            {/* Section "Emportez Amane+ partout avec vous" */}
      <section className="py-20" style={{ background: 'linear-gradient(to top, #d6fcf6, #229693)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
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
                Retrouvez toutes les fonctionnalités d'Amane+ dans une seule application. Faites vos dons, suivez vos rendements, automatisez votre Zakat et participez à des actions solidaires, où que vous soyez.
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
    </div>
  );
} 