'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import Image from 'next/image';
import { currentUser } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  
  // Générer le lien de parrainage basé sur le nom de l'utilisateur
  const getUserName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName}${user.lastName}`;
    }
    // Fallback sur currentUser
    const name = currentUser.name.split(' ');
    return name.join('');
  };

  const referralLink = `Amaneplus.com/${getUserName()}`;
  const fullReferralLink = `https://${referralLink}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullReferralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoignez Amane+',
          text: 'Rejoignez-moi sur Amane+ et découvrez une nouvelle façon de faire le bien !',
          url: fullReferralLink,
        });
      } catch (error) {
        // L'utilisateur a annulé le partage
        console.log('Partage annulé');
      }
    } else {
      // Fallback : copier le lien
      handleCopy();
    }
  };

  // Empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#101919] rounded-2xl p-6 sm:p-8 max-w-md w-full relative border border-white/10"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-[#00644D] rounded-full flex items-center justify-center hover:bg-[#00644D]/80 transition-colors z-10"
                aria-label="Fermer"
              >
                <X size={20} className="text-white" />
              </button>

              {/* Icon Header */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full bg-[#00644D] flex items-center justify-center border-2 border-[#00D9A5]">
                    <Image
                      src="/icons/share.png"
                      alt="Partager"
                      width={40}
                      height={40}
                      className="brightness-0 invert"
                    />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Inviter des personnes</h2>
                <p className="text-white text-sm text-center">
                  Veuillez scanner le code ci-dessous
                </p>
              </div>

              {/* Separator */}
              <div className="flex items-center justify-center my-6">
                <div className="flex-1 h-px bg-white/20"></div>
                <span className="px-4 text-white text-sm">ou</span>
                <div className="flex-1 h-px bg-white/20"></div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-xl">
                  <QRCodeSVG
                    value={fullReferralLink}
                    size={200}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>

              {/* Referral Link */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Copy size={16} className="text-white/70" />
                  <p className="text-white text-sm">Lien de parrainage à partager :</p>
                </div>
                <div
                  onClick={handleCopy}
                  className="flex items-center justify-between p-3 bg-[#101919] border border-white/10 rounded-lg cursor-pointer hover:border-[#00D9A5]/50 transition-colors group"
                >
                  <span className="text-[#00D9A5] font-medium text-sm truncate flex-1 mr-2">
                    {referralLink}
                  </span>
                  {copied ? (
                    <Check size={18} className="text-[#00D9A5] flex-shrink-0" />
                  ) : (
                    <Copy size={18} className="text-white/50 group-hover:text-[#00D9A5] flex-shrink-0 transition-colors" />
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-white text-[#00644D] rounded-3xl font-semibold hover:bg-white/90 transition-colors"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShare}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#00644D] to-[#00D9A5] text-white rounded-3xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                >
                  <Share2 size={18} />
                  <span>Partager</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
