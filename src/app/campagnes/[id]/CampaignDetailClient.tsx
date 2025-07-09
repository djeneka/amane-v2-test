'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Users, MapPin, Calendar, ArrowRight, Play, Share2, Download, Eye, Target,
  CreditCard, Shield, CheckCircle, Zap, Lock, EyeOff, X, Wallet
} from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  endDate: string;
  beneficiaries: number;
  impact: string;
  currentAmount: number;
  targetAmount: number;
  image: string;
  images?: string[];
  video?: string;
}

interface CampaignDetailClientProps {
  campaign: Campaign;
}

export default function CampaignDetailClient({ campaign }: CampaignDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
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

  const steps = [
    { id: 1, title: 'Paiement', icon: CreditCard },
    { id: 2, title: 'Confirmation', icon: CheckCircle },
  ];

  const progress = (campaign.currentAmount / campaign.targetAmount) * 100;
  
  const categoryColors = {
    urgence: 'bg-red-100 text-red-800',
    education: 'bg-blue-100 text-blue-800',
    sante: 'bg-green-100 text-green-800',
    developpement: 'bg-purple-100 text-purple-800',
    refugies: 'bg-orange-100 text-orange-800',
  };

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

  const presetAmounts = [1000, 2500, 5000, 10000, 25000, 50000];

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDonateClick = () => {
    if (donationAmount && parseInt(donationAmount) > 0) {
      setShowPaymentPopup(true);
      setCurrentStep(1);
    }
  };

  const handleClosePopup = () => {
    setShowPaymentPopup(false);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-800 to-green-600 text-white py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={32} />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              {campaign.title}
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              {campaign.description}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative h-96">
                {showVideo && campaign.video ? (
                  <video
                    src={campaign.video}
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                  />
                ) : (
                  <img
                    src={campaign.images?.[selectedImage] || campaign.image}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                )}
                
                {campaign.video && !showVideo && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white transition-colors"
                    title="Lire la vidéo"
                  >
                    <Play size={24} className="text-gray-700" />
                  </button>
                )}
              </div>

              {campaign.images && campaign.images.length > 1 && (
                <div className="p-4 flex space-x-2 overflow-x-auto">
                  {campaign.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                        selectedImage === index ? 'ring-2 ring-green-500' : ''
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${campaign.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Campaign Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[campaign.category as keyof typeof categoryColors]}`}>
                  {campaign.category.charAt(0).toUpperCase() + campaign.category.slice(1)}
                </span>
                <div className="flex items-center space-x-2">
                  <button 
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    title="Partager la campagne"
                  >
                    <Share2 size={20} className="text-gray-600" />
                  </button>
                  <button 
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    title="Télécharger les informations"
                  >
                    <Download size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                À propos de cette campagne
              </h2>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                {campaign.description}
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-center space-x-3">
                  <MapPin size={20} className="text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Localisation</p>
                    <p className="font-medium text-gray-900">{campaign.location}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar size={20} className="text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Date de fin</p>
                    <p className="font-medium text-gray-900">{formatDate(campaign.endDate)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Users size={20} className="text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Bénéficiaires</p>
                    <p className="font-medium text-gray-900">{campaign.beneficiaries.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Target size={20} className="text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Impact</p>
                    <p className="font-medium text-gray-900">{campaign.impact}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Donation Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Faire un don</h3>
              
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-700 mb-2">
                  <span>Progression</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-700 mt-2">
                  <span>{formatAmount(campaign.currentAmount)}</span>
                  <span>{formatAmount(campaign.targetAmount)}</span>
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Montant du don (XOF)
                </label>
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="Entrez le montant"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                />
              </div>

              {/* Preset Amounts */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setDonationAmount(amount.toString())}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-gray-700"
                  >
                    {formatAmount(amount)}
                  </button>
                ))}
              </div>

              {/* Donate Button */}
              <button 
                onClick={handleDonateClick}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Heart size={20} />
                <span>Faire un don</span>
              </button>
            </div>

            {/* Campaign Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Statistiques</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Jours restants</span>
                  <span className="font-medium text-gray-900">
                    {Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Donateurs</span>
                  <span className="font-medium text-gray-900">1,247</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Partages</span>
                  <span className="font-medium text-gray-900">892</span>
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
                     <p className="text-gray-600">Montant: {formatAmount(parseInt(donationAmount) || 0)}</p>
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
                             <span className="font-semibold">{campaign.title}</span>
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
                       <span>Confirmer le paiement</span>
                       <ArrowRight size={20} />
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