'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, MapPin, Calendar, ArrowRight, Play, Share2, Download, Eye, Target } from 'lucide-react';

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
              <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
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
    </div>
  );
} 