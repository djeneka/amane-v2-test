'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, Users, MapPin, Calendar, ArrowRight, Play } from 'lucide-react';
import { Campaign } from '@/data/mockData';

interface CampaignCardProps {
  campaign: Campaign;
  showVideo?: boolean;
  /** Nombre de donateurs (API statistics). Si fourni, affiché à la place des bénéficiaires. */
  donorCount?: number;
}

export default function CampaignCard({ campaign, showVideo = false, donorCount }: CampaignCardProps) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        {showVideo && campaign.video ? (
          <div className="relative w-full h-full">
            <video
              src={campaign.video}
              className="w-full h-full object-cover"
              controls
              poster={campaign.image}
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        ) : (
          <div className="relative w-full h-full">
            <img
              src={campaign.image}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
            {campaign.video && (
              <div className="absolute top-4 right-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                  <Play size={16} className="text-gray-700" />
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[campaign.category]}`}>
            {campaign.category.charAt(0).toUpperCase() + campaign.category.slice(1)}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {campaign.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            {campaign.description}
          </p>
        </div>

        {/* Location and Date */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <MapPin size={14} />
            <span>{campaign.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar size={14} />
            <span>Fin: {formatDate(campaign.endDate)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {formatAmount(campaign.currentAmount)} / {formatAmount(campaign.targetAmount)}
            </span>
            <span className="text-sm text-gray-500">
              {progress.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-green-600 h-2 rounded-full"
            />
          </div>
        </div>

        {/* Impact et nombre de donateurs (ou bénéficiaires en fallback) */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Users size={14} />
            <span>
              {(donorCount !== undefined ? donorCount : campaign.beneficiaries).toLocaleString()}{' '}
              {donorCount !== undefined ? 'donateurs' : 'bénéficiaires'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{campaign.impact}</span>
          </div>
        </div>

        {/* Action Button */}
        <Link href={`/campagnes/${campaign.id}`}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Heart size={16} />
            <span>Soutenir cette campagne</span>
            <ArrowRight size={16} />
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
} 