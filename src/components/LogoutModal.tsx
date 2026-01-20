'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
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
              className="bg-[#1A1A1A] rounded-3xl p-8 max-w-md w-full relative border border-white/10"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-[#48C9A8] rounded-full flex items-center justify-center hover:bg-[#48C9A8]/80 transition-colors z-10 shadow-lg"
                aria-label="Fermer"
              >
                <X size={20} className="text-white" />
              </button>

              {/* Icon Header */}
              <div className="flex flex-col items-center mb-6 mt-4">
                <div className="relative mb-6">
                  {/* Cercle extérieur avec bordure dégradée rose/rouge */}
                  <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-[#ff2d5388] to-[#ff2d55] flex items-center justify-center">
                    {/* Cercle intérieur blanc */}
                    <div className="w-full h-full rounded-full bg-[#ff2d55] flex items-center justify-center">
                      {/* Icône de déconnexion */}
                      <LogOut size={32} className="text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Titre */}
                <h2 className="text-2xl font-bold text-white mb-3">Déconnexion</h2>
                
                {/* Message de confirmation */}
                <p className="text-white text-center text-base">
                  Êtes-vous sûr de vouloir vous déconnecter ?
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 mt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  className="flex-1 px-6 py-3 bg-white text-[#48C9A8] rounded-2xl font-semibold hover:bg-white/90 transition-colors"
                >
                  Se déconnecter
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#48C9A8] to-[#2EDBB4] text-white rounded-2xl font-semibold hover:opacity-90 transition-opacity"
                >
                  Annuler
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
