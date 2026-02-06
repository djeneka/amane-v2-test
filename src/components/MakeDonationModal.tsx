'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Eye, EyeOff, CheckCircle, Heart, Check } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface MakeDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance?: number;
  initialAmount?: number; // Montant initial à pré-remplir
  // Textes personnalisables
  title?: string; // Titre principal (ex: "Faire un don")
  subtitle?: string; // Sous-titre (ex: "Montant du don")
  description?: string; // Description sous le titre (ex: "Veuillez saisir le montant du don.")
  amountSectionTitle?: string; // Titre de la section montant (ex: "Montant du dépôt")
  successTitle?: string; // Titre de succès (ex: "Merci pour votre don !")
  successMessage?: string; // Message secondaire de succès (ex: "Un sourire vient d'éclore grâce à vous.")
  historyButtonText?: string; // Texte du bouton historique (ex: "Consulter l'historique")
  historyButtonLink?: string; // Lien du bouton historique (ex: "/transactions")
  confirmationTitle?: string; // Titre de la page de confirmation (ex: "Confirmation")
  confirmationDescription?: string; // Description de la page de confirmation
  recapTitle?: string; // Titre du récapitulatif (ex: "Vous allez faire un don de:")
  recapMessage?: string; // Message du récapitulatif (ex: "Amane+ s'engage à utiliser votre don...")
}

const STEPS = [
  { id: 1, label: 'Montant' },
  { id: 2, label: 'Confirmation' },
];

export default function MakeDonationModal({ 
  isOpen, 
  onClose,
  balance = 610473,
  initialAmount,
  // Textes personnalisables avec valeurs par défaut pour les campagnes
  title = "Faire un don",
  subtitle = "Montant du don",
  description = "Veuillez saisir le montant du don.",
  amountSectionTitle = "Montant du dépôt",
  successTitle = "Merci pour votre don !",
  successMessage = "Un sourire vient d'éclore grâce à vous.",
  historyButtonText = "Consulter l'historique",
  historyButtonLink = "/transactions",
  confirmationTitle = "Confirmation",
  confirmationDescription = "Vérifiez les informations avant de confirmer votre don.",
  recapTitle = "Vous allez faire un don de:",
  recapMessage = "Amane+ s'engage à utiliser votre don selon les besoins prioritaires du moment, identifiés par nos partenaires de confiance."
}: MakeDonationModalProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  // Montants prédéfinis
  const defaultAmounts = [10000, 50000, 100000];

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

  // Réinitialiser le formulaire quand le modal se ferme
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setAmount('');
      setIsSuccess(false);
      setShowBalance(true);
    } else if (initialAmount) {
      // Pré-remplir le montant si initialAmount est fourni
      setAmount(initialAmount.toString());
    }
  }, [isOpen, initialAmount]);

  const handleNext = () => {
    if (currentStep < STEPS.length && amount && parseFloat(amount) > 0) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Logique de soumission du don
    console.log('Don:', {
      amount: parseFloat(amount),
    });
    // Afficher l'écran de succès
    setIsSuccess(true);
  };

  const handleClose = () => {
    if (isSuccess) {
      // Réinitialiser et fermer
      setIsSuccess(false);
      setCurrentStep(1);
      setAmount('');
    }
    onClose();
  };

  const handleViewHistory = () => {
    // Réinitialiser et fermer, puis rediriger vers l'historique
    setIsSuccess(false);
    setCurrentStep(1);
    setAmount('');
    onClose();

    router.push(historyButtonLink);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-white text-2xl font-bold mb-2">{title}</h2>
              <h3 className="text-white text-lg mb-2">{subtitle}</h3>
              <p className="text-white/60 text-sm">{description}</p>
            </div>

            {/* Affichage du solde */}
            <div 
              className="rounded-3xl p-4 flex items-center justify-between mx-12"
              style={{ 
                background: 'linear-gradient(to right, #3AE1B4, #13A98B)' 
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Image 
                    src="/icons/wallet-card(1).png" 
                    alt="Solde" 
                    width={24} 
                    height={24}
                    className="object-contain"
                  />
                </div>
                <div className="flex space-x-2">
                  <p className="text-white text-xl font-bold">Votre Solde</p>
                  <p className="text-white font-bold text-xl">
                    {showBalance 
                      ? `${balance.toLocaleString('fr-FR').replace(/\s/g, ' ')} F`
                      : '* * * * * *'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-white/80 hover:text-white transition-colors"
                aria-label={showBalance ? 'Masquer le solde' : 'Afficher le solde'}
              >
                {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Section Montant du dépôt */}
            <div className="bg-[#0F1F1F] rounded-xl p-6 mx-12">
              <h3 className="text-white text-xl font-bold mb-4 text-center">{amountSectionTitle}</h3>
              
              {/* Champ de saisie du montant */}
              <div className="mb-4 relative">
                <div className="text-white text-4xl font-bold min-h-[56px] flex items-center justify-center mb-2">
                  {amount ? (
                    <span>{parseFloat(amount).toLocaleString('fr-FR')} F CFA</span>
                  ) : (
                    <span className="text-white/40">0 F CFA</span>
                  )}
                </div>
                <input
                  type="tel"
                  value={amount}
                  onChange={(e) => {
                    // Extraire uniquement les chiffres
                    const numericValue = e.target.value.replace(/\D/g, '');
                    setAmount(numericValue);
                  }}
                  placeholder="Saisissez le montant"
                  className="w-full bg-[#101919] text-white text-base font-normal placeholder-white/40 focus:outline-none border border-white/10 rounded-lg p-3 focus:border-[#5AB678] transition-colors"
                />
              </div>

              {/* Texte "Ou choisissez un montant par défaut" */}
              <p className="text-white/60 text-sm mb-4 text-center">
                Ou choisissez un montant par défaut
              </p>

              {/* Boutons de montants prédéfinis */}
              <div className="flex space-x-3 justify-center">
                {defaultAmounts.map((defaultAmount) => (
                  <motion.button
                    key={defaultAmount}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAmount(defaultAmount.toString())}
                    className={`w-fit rounded-2xl px-4 py-2 text-lg font-semibold transition-colors ${
                      amount === defaultAmount.toString()
                        ? 'bg-[#00644d] text-[#101919]'
                        : 'bg-[#101919] text-white border border-white/10 hover:border-[#5AB678]/50'
                    }`}
                  >
                    {defaultAmount.toLocaleString('fr-FR')}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Boutons de navigation */}
            <div className="flex space-x-3 pt-4 mx-12">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex-1 bg-[#0F1F1F] text-[#3AE1B4] rounded-3xl p-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0F1F1F]/80 transition-colors border border-white/10 flex items-center justify-center space-x-2"
              >
                <ChevronLeft size={20} />
                <span>Précédent</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                disabled={!amount || parseFloat(amount) <= 0}
                className="flex-1 bg-[#3AE1B4] text-[#101919] rounded-3xl p-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
              >
                <span>Suivant</span>
                <ChevronRight size={20} />
              </motion.button>
            </div>
          </div>
        );

      case 2:
        // Afficher l'écran de succès si la confirmation a été effectuée
        if (isSuccess) {
          return (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              {/* Icône de succès */}
              <div className=" rounded-full bg-[#3AE1B4]/20 flex items-center justify-center">
                <Image src="/icons/valid-circle.png" alt="Succès" width={48} height={48} className="object-contain" />
              </div>

              {/* Titre avec icône de cœur */}
              <div className="flex items-center justify-center space-x-2">
                <Heart size={24} className="text-white fill-[#101919]" />
                <h2 className="text-white text-2xl font-bold text-center">
                  {successTitle}
                </h2>
              </div>

              {/* Message secondaire */}
              <p className="text-white text-lg text-center max-w-md">
                {successMessage}
              </p>

              {/* Bouton Consulter l'historique */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleViewHistory}
                className="rounded-3xl px-8 py-4 font-semibold text-white hover:opacity-90 transition-opacity mt-4"
                style={{ 
                  background: 'linear-gradient(to right, #3AE1B4, #13A98B)'
                }}
              >
                {historyButtonText}
              </motion.button>
            </div>
          );
        }

        // Sinon, afficher le formulaire de confirmation
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-white text-lg mb-2 font-bold">{confirmationTitle}</h3>
              <p className="text-white/60 text-sm">
                {confirmationDescription}
              </p>
            </div>
            
            {/* Récapitulatif */}
            <div className="bg-[#0F1F1F] rounded-3xl p-6 space-y-4 mx-12">
              <div className="flex flex-col justify-center items-center space-y-2">
                <span className="text-white text-xl font-bold">{recapTitle}</span>
                <span className="text-[#5ab678] font-bold text-3xl">
                  {parseFloat(amount).toLocaleString('fr-FR')} F CFA
                </span>
                <span className="text-white text-sm font-medium text-center">{recapMessage}</span>
              </div>
            </div>

            {/* Boutons de navigation */}
            <div className="flex space-x-3 pt-4 mx-12">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                className="flex-1 bg-[#0F1F1F] text-[#3AE1B4] rounded-3xl p-4 font-semibold hover:bg-[#0F1F1F]/80 transition-colors border border-white/10 flex items-center justify-center space-x-2"
              >
                <ChevronLeft size={20} />
                <span>Précédent</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={parseFloat(amount) > balance}
                className="flex-1 bg-[#3AE1B4] text-[#101919] rounded-3xl p-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
              >
                <span>Confirmer</span>
                <ChevronRight size={20} />
              </motion.button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#101919] rounded-none md:rounded-2xl w-full h-full md:h-auto max-w-4xl md:max-h-[90vh] overflow-hidden relative border-0 md:border border-white/10"
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 md:w-10 md:h-10 bg-[#5ab678] rounded-full flex items-center justify-center hover:bg-[#3AE1B4]/80 transition-colors z-10"
                aria-label="Fermer"
              >
                <X size={16} className="md:w-5 md:h-5 text-[#101919]" />
              </button>

              <div className="flex flex-col md:flex-row h-full">
                {/* Stepper - Left Side */}
                <div className="hidden md:flex w-64 bg-[#0A1515] p-8 border-r border-white/10">
                  <div className="space-y-6">
                    {STEPS.map((step, index) => {
                      const isActive = currentStep === step.id;
                      const isCompleted = currentStep > step.id;
                      const isLast = index === STEPS.length - 1;

                      return (
                        <div key={step.id} className="flex items-start">
                          {/* Step Circle and Line */}
                          <div className="flex flex-col items-center mr-4">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold transition-colors ${
                                isActive
                                  ? 'bg-[#5ab678] text-[#101919]'
                                  : isCompleted
                                  ? 'bg-[#5ab678]/30 text-[#5ab678] border-2 border-[#5ab678]'
                                  : 'bg-[#101919] text-white/60 border-2 border-[#5ab678]'
                              }`}
                            >
                              {step.id}
                            </div>
                            {!isLast && (
                              <div className="relative mt-2 h-12 flex items-center justify-center">
                                {isCompleted ? (
                                  <div className="w-0.5 h-full bg-[#3AE1B4]" />
                                ) : (
                                  <svg
                                    className="h-full w-0.5"
                                    viewBox="0 0 2 48"
                                    preserveAspectRatio="none"
                                  >
                                    <line
                                      x1="1"
                                      y1="0"
                                      x2="1"
                                      y2="48"
                                      stroke="#3AE1B4"
                                      strokeWidth="2"
                                      strokeDasharray="4 4"
                                      opacity="0.3"
                                    />
                                  </svg>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Step Label */}
                          <div className="flex-1 pt-2">
                            <p
                              className={`text-sm font-medium transition-colors ${
                                isActive
                                  ? 'text-[#3AE1B4]'
                                  : isCompleted
                                  ? 'text-white/80'
                                  : 'text-white/40'
                              }`}
                            >
                              {step.label}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stepper Horizontal - Mobile */}
                <div className="md:hidden bg-[#0A1515] p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    {STEPS.map((step, index) => {
                      const isActive = currentStep === step.id;
                      const isCompleted = currentStep > step.id;
                      const isLast = index === STEPS.length - 1;

                      return (
                        <div key={step.id} className="flex items-center">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-xs transition-colors ${
                                isActive
                                  ? 'bg-[#3AE1B4] text-[#101919]'
                                  : isCompleted
                                  ? 'bg-[#3AE1B4]/30 text-[#3AE1B4] border-2 border-[#3AE1B4]'
                                  : 'bg-[#101919] text-white/60 border-2 border-[#3AE1B4]'
                              }`}
                            >
                              {step.id}
                            </div>
                            <p
                              className={`text-xs font-medium mt-1 text-center max-w-[80px] transition-colors ${
                                isActive
                                  ? 'text-[#3AE1B4]'
                                  : isCompleted
                                  ? 'text-white/80'
                                  : 'text-white/40'
                              }`}
                            >
                              {step.label}
                            </p>
                          </div>
                          {!isLast && (
                            <div className="mx-2 w-8 h-0.5 flex items-center justify-center">
                              {isCompleted ? (
                                <div className="w-full h-0.5 bg-[#3AE1B4]" />
                              ) : (
                                <svg
                                  className="w-full h-0.5"
                                  viewBox="0 0 32 2"
                                  preserveAspectRatio="none"
                                >
                                  <line
                                    x1="0"
                                    y1="1"
                                    x2="32"
                                    y2="1"
                                    stroke="#3AE1B4"
                                    strokeWidth="2"
                                    strokeDasharray="4 4"
                                    opacity="0.3"
                                  />
                                </svg>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Content - Right Side */}
                <div className="flex-1 p-4 md:p-8 overflow-y-auto">
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
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
