'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone, Search, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AskForHelpFormModal from './AskForHelpFormModal';

interface AskForHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  { id: 1, text: 'Remplissez le formulaire (5 min)' },
  { id: 2, text: 'Votre dossier est étudié' },
  { id: 3, text: 'Vous recevez une réponse claire' },
  { id: 4, text: 'Une aide est mise en place si validée' },
];

export default function AskForHelpModal({ isOpen, onClose }: AskForHelpModalProps) {
  const router = useRouter();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

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

  const handleStart = () => {
    // Fermer le modal actuel et ouvrir le formulaire
    onClose();
    setIsFormModalOpen(true);
  };

  const handleFormClose = () => {
    setIsFormModalOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
                className="relative bg-[#101919] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Bouton de fermeture */}
                <button
                  onClick={onClose}
                  aria-label="Fermer la modale"
                  className="absolute top-4 right-4 w-10 h-10 bg-[#2F855A] rounded-full flex items-center justify-center hover:bg-[#276749] transition-colors z-10"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                {/* Contenu */}
                <div className="p-6 md:p-8 space-y-6">
                  {/* En-tête avec icône */}
                  <div className="flex items-start gap-4 pt-4">
                    {/* Icône mégaphone */}
                    <div className="relative flex-shrink-0">
                      {/* Cercle extérieur vert */}
                      <div className="bg-[#101919] rounded-full flex items-center justify-center">
                        {/* Cercle intérieur vert clair */}
                        <div className="w-12 h-12 rounded-full flex items-center justify-center">
                          <Image src="/images/Image(11).png" alt="Megaphone" width={100} height={100} />
                        </div>
                      </div>
                    </div>

                    {/* Titre */}
                    <h2 className="text-2xl md:text-3xl font-bold text-white flex-1 pt-2">
                      Besoin d'aide ? Nous sommes là !
                    </h2>
                  </div>

                {/* Texte descriptif */}
                <p className="text-base md:text-lg text-[#A0AEC0] leading-relaxed">
                  Si vous traversez une situation difficile, Amane+ vous permet de faire une demande d'aide en toute confidentialité. Chaque demande est étudiée avec sérieux, respect et transparence.
                </p>

                {/* Section "Comment ça se passe ?" */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-white" />
                    <h3 className="text-lg md:text-xl font-semibold text-white">
                      Comment ça se passe ?
                    </h3>
                  </div>

                  {/* Liste des étapes */}
                  <div className="space-y-3">
                    {STEPS.map((step, index) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-[#00644d]/30 rounded-3xl p-4 flex items-center gap-3"
                      >
                        {/* Icône de coche */}
                        <div className="flex-shrink-0 w-8 h-8 bg-[#00644d]/30 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <span className="text-white text-base md:text-lg">
                          {step.text}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Section "En toute confiance" */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-white" />
                    <h3 className="text-lg md:text-xl font-semibold text-white">
                      En toute confiance
                    </h3>
                  </div>
                  <p className="text-base text-[#A0AEC0] leading-relaxed">
                    Vos informations sont protégées et utilisées uniquement pour le traitement de votre demande.
                  </p>
                </div>

                {/* Bouton "Commencer" */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStart}
                  className="w-full bg-gradient-to-r from-[#48BB78] to-[#38B2AC] text-white font-bold py-4 px-6 rounded-3xl flex items-center justify-center gap-2 hover:from-[#38A169] hover:to-[#319795] transition-all"
                >
                  <span className="text-lg">Commencer</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>

    {/* Modal du formulaire en 6 étapes */}
    <AskForHelpFormModal 
      isOpen={isFormModalOpen} 
      onClose={handleFormClose} 
    />
  </>
  );
}
