'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Eye, EyeOff, Heart, Calendar } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { payZakat } from '@/services/zakat';
import { getCurrentUser } from '@/services/user';

interface PayZakatModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance?: number;
  initialAmount?: number; // Montant initial à pré-remplir
  /** ID de la zakat à payer (obligatoire pour envoyer le paiement) */
  zakatId?: string | null;
  /** JWT pour l’API (obligatoire pour envoyer le paiement) */
  accessToken?: string | null;
  /** Appelé après un paiement réussi (ex. pour rafraîchir la liste des zakats) */
  onSuccess?: () => void;
}

const STEPS = [
  { id: 1, label: 'Montant' },
  { id: 2, label: 'Confirmation' },
  { id: 3, label: 'Code de sécurité' },
];

type PaymentFrequency = 'monthly' | 'bimonthly' | 'quarterly';

function parseApiErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  try {
    const parsed = JSON.parse(msg) as { message?: string };
    if (typeof parsed?.message === 'string') return parsed.message;
  } catch {
    // pas du JSON
  }
  return msg || 'Une erreur est survenue.';
}

export default function PayZakatModal({ 
  isOpen, 
  onClose,
  balance = 0,
  initialAmount,
  zakatId = null,
  accessToken = null,
  onSuccess,
}: PayZakatModalProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [isPaymentPlanned, setIsPaymentPlanned] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [frequency, setFrequency] = useState<PaymentFrequency>('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [walletBalanceFromApi, setWalletBalanceFromApi] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const securityCodeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /** Solde affiché : API si dispo, sinon prop balance */
  const effectiveBalance = walletBalanceFromApi ?? balance;

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
      setSecurityCode('');
      setIsSuccess(false);
      setShowBalance(true);
      setIsPaymentPlanned(false);
      setStartDate('');
      setFrequency('monthly');
      setSubmitError(null);
      setIsSubmitting(false);
      setWalletBalanceFromApi(null);
    } else if (initialAmount) {
      setAmount(initialAmount.toString());
    }
  }, [isOpen, initialAmount]);

  // Récupérer le solde du wallet à l'ouverture du modal
  useEffect(() => {
    if (!isOpen || !accessToken) return;
    let cancelled = false;
    setLoadingBalance(true);
    getCurrentUser(accessToken)
      .then((user) => {
        if (!cancelled) {
          setWalletBalanceFromApi(user?.wallet?.balance ?? 0);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setWalletBalanceFromApi(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingBalance(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, accessToken]);

  // Initialiser la date de début à aujourd'hui si vide
  useEffect(() => {
    if (isPaymentPlanned && !startDate) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setStartDate(`${year}-${month}-${day}`);
    }
  }, [isPaymentPlanned, startDate]);

  const handleNext = () => {
    if (currentStep < STEPS.length && amount && parseFloat(amount) > 0) {
      if (isPaymentPlanned && !startDate) return;
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setSubmitError(null);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!accessToken || !zakatId) {
      setSubmitError('Session expirée ou zakat non sélectionnée. Veuillez fermer et réessayer.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      setSubmitError('Montant invalide.');
      return;
    }
    if (securityCode.length !== 4) {
      setSubmitError('Veuillez saisir le code à 4 chiffres.');
      return;
    }
    // Montant à envoyer : paiement planifié → montant par échéance, sinon montant total
    const paymentPlan = calculatePaymentPlan();
    const amountToSend =
      isPaymentPlanned && paymentPlan
        ? Math.round(paymentPlan.amountPerPayment)
        : Math.round(numAmount);

    if (amountToSend <= 0) {
      setSubmitError('Montant invalide.');
      return;
    }
    setSubmitError(null);
    setIsSubmitting(true);
    const startTime = Date.now();
    try {
      await payZakat(accessToken, {
        walletCode: securityCode,
        zakatId,
        amount: amountToSend,
        paymentDate: new Date().toISOString(),
      });
      // Affichage du bouton "Envoi en cours..." au moins 2 secondes
      const elapsed = Date.now() - startTime;
      if (elapsed < 2000) {
        await new Promise((r) => setTimeout(r, 2000 - elapsed));
      }
      onSuccess?.();
      setIsSuccess(true);
    } catch (err) {
      setSubmitError(parseApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSuccess) {
      setIsSuccess(false);
      setCurrentStep(1);
      setAmount('');
      setSecurityCode('');
      setIsPaymentPlanned(false);
      setStartDate('');
      setFrequency('monthly');
    }
    onClose();
  };

  const handleViewHistory = () => {
    setIsSuccess(false);
    setCurrentStep(1);
    setAmount('');
    setSecurityCode('');
    setIsPaymentPlanned(false);
    setStartDate('');
    setFrequency('monthly');
    onClose();
    router.push('/zakat');
  };

  // Calculer les détails de la planification
  const calculatePaymentPlan = () => {
    if (!isPaymentPlanned || !startDate || !amount) return null;

    const totalAmount = parseFloat(amount);
    let monthsPerPayment = 1;
    if (frequency === 'bimonthly') monthsPerPayment = 2;
    if (frequency === 'quarterly') monthsPerPayment = 3;

    // Calculer le nombre de paiements (12 mois au total)
    const totalMonths = 12;
    const numberOfPayments = Math.ceil(totalMonths / monthsPerPayment);
    const amountPerPayment = totalAmount / numberOfPayments;

    // Calculer la date de fin (12 mois après la date de début)
    const start = new Date(startDate);
    const endDate = new Date(start);
    endDate.setMonth(endDate.getMonth() + totalMonths);
    
    // Ajuster au dernier jour du mois précédent (dernier jour du 12ème mois)
    endDate.setDate(0);

    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 
                    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    
    const startFormatted = `${start.getDate()} ${months[start.getMonth()]} ${start.getFullYear()}`;
    const endFormatted = `${endDate.getDate()} ${months[endDate.getMonth()]} ${endDate.getFullYear()}`;

    const frequencyText = frequency === 'monthly' ? 'mois' : 
                         frequency === 'bimonthly' ? '2 mois' : '3 mois';

    return {
      amountPerPayment,
      numberOfPayments,
      frequencyText,
      startFormatted,
      endFormatted,
      totalMonths,
    };
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const renderStepContent = () => {
    // Écran de succès (après validation du code de sécurité)
    if (isSuccess) {
      return (
        <div className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-6">
          <div className="rounded-full bg-[#3AE1B4]/20 flex items-center justify-center">
            <Image src="/icons/valid-circle.png" alt="Succès" width={48} height={48} className="object-contain" />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Heart size={24} className="text-white fill-[#101919]" />
            <h2 className="text-white text-xl sm:text-2xl font-bold text-center">
              Zakat versée avec succès !
            </h2>
          </div>
          <p className="text-white text-base sm:text-lg text-center max-w-md">
            Votre Zakat a été versée. Qu'Allah accepte votre aumône.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleViewHistory}
            className="rounded-3xl px-6 sm:px-8 py-3 sm:py-4 font-semibold text-white hover:opacity-90 transition-opacity mt-4 text-sm sm:text-base"
            style={{ background: 'linear-gradient(to right, #3AE1B4, #13A98B)' }}
          >
            Consulter l'historique
          </motion.button>
        </div>
      );
    }

    switch (currentStep) {
      case 1: {
        const paymentPlan = calculatePaymentPlan();
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-white text-xl sm:text-2xl font-bold mb-2">Zakat</h2>
              <h3 className="text-white text-base sm:text-lg mb-2">Montant</h3>
              <p className="text-white/60 text-sm">Veuillez saisir le montant de votre Zakat.</p>
            </div>

            {/* Affichage du solde */}
            <div 
              className="rounded-3xl p-3 sm:p-4 flex items-center justify-between mx-0 sm:mx-12"
              style={{ 
                background: 'linear-gradient(to right, #3AE1B4, #13A98B)' 
              }}
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Image 
                    src="/icons/wallet-card(1).png" 
                    alt="Solde" 
                    width={20} 
                    height={20}
                    className="sm:w-6 sm:h-6 object-contain"
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:space-x-2">
                  <p className="text-white text-sm sm:text-xl font-bold">Votre Solde</p>
                  <p className="text-white font-bold text-sm sm:text-xl">
                    {loadingBalance
                      ? 'Chargement...'
                      : showBalance
                        ? `${effectiveBalance.toLocaleString('fr-FR').replace(/\s/g, ' ')} F`
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
                {showBalance ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
              </button>
            </div>

            {/* Section Montant */}
            <div className="bg-[#0F1F1F] rounded-xl p-4 sm:p-6 mx-0 sm:mx-12">
              <h3 className="text-white text-lg sm:text-xl font-bold mb-4 text-center">Somme totale à verser</h3>
              
              {/* Champ de saisie du montant */}
              <div className="mb-4 relative">
                <div className="text-white text-2xl sm:text-4xl font-bold min-h-[40px] sm:min-h-[56px] flex items-center justify-center mb-2">
                  {amount ? (
                    <span>{formatAmount(parseFloat(amount))} F CFA</span>
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
                  className="w-full bg-[#101919] text-white text-sm sm:text-base font-normal placeholder-white/40 focus:outline-none border border-white/10 rounded-lg p-3 focus:border-[#5AB678] transition-colors"
                />
                {amount && (
                  <p className="text-white/60 text-xs sm:text-sm mt-2 text-center">Issus de votre calcul</p>
                )}
              </div>
            </div>

            {/* Checkbox Planifier le paiement */}
            <div className="mx-0 sm:mx-12">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPaymentPlanned}
                  onChange={(e) => setIsPaymentPlanned(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-[#43B48F] bg-transparent checked:bg-[#43B48F] checked:border-[#43B48F] focus:ring-2 focus:ring-[#5AB678] focus:ring-offset-2 focus:ring-offset-[#101919] cursor-pointer appearance-none relative"
                  style={{
                    backgroundImage: isPaymentPlanned ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23101919\' stroke-width=\'3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'20 6 9 17 4 12\'%3E%3C/polyline%3E%3C/svg%3E")' : 'none',
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
                <span className="text-white text-sm sm:text-base font-medium">Planifier le paiement</span>
              </label>
            </div>

            {/* Section Planification (affichée si checkbox cochée) */}
            <AnimatePresence mode="wait">
              {isPaymentPlanned && (
                <motion.div
                  key="payment-planning"
                  initial={{ opacity: 0, maxHeight: 0 }}
                  animate={{ opacity: 1, maxHeight: 1000 }}
                  exit={{ opacity: 0, maxHeight: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-4 mx-0 sm:mx-12 overflow-hidden"
                >
                  {/* Date de début */}
                  <div className="space-y-2">
                    <label htmlFor="start-date" className="text-white text-sm sm:text-base font-medium">Date de début</label>
                    <div className="relative">
                      <input
                        type="date"
                        id="start-date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        aria-label="Date de début du paiement planifié"
                        className="w-full bg-[#101919] text-white text-sm sm:text-base border border-white/10 rounded-lg p-3 pr-10 focus:outline-none focus:border-[#5AB678] transition-colors"
                      />
                      <Calendar 
                        size={20} 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 pointer-events-none" 
                      />
                    </div>
                  </div>

                  {/* Fréquence de paiement */}
                  <div className="space-y-2">
                    <label className="text-white text-sm sm:text-base font-medium mb-3">Fréquence de paiement</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setFrequency('monthly')}
                      className={`flex-1 py-2 px-2 rounded-2xl font-medium transition-all text-sm sm:text-base ${
                        frequency === 'monthly'
                          ? 'bg-[#43B48F] text-[#101919]'
                          : 'bg-[#101919] text-white border border-white/10 hover:border-[#43B48F]/50'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {frequency === 'monthly' && (
                          <div className="w-4 h-4 rounded-full bg-[#101919] flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-[#43B48F]"></div>
                          </div>
                        )}
                        <span>Chaque mois</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setFrequency('bimonthly')}
                      className={`flex-1 py-3 px-4 rounded-2xl font-medium transition-all text-sm sm:text-base ${
                        frequency === 'bimonthly'
                          ? 'bg-[#43B48F] text-[#101919]'
                          : 'bg-[#101919] text-white border border-white/10 hover:border-[#43B48F]/50'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {frequency === 'bimonthly' && (
                          <div className="w-4 h-4 rounded-full bg-[#101919] flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-[#43B48F]"></div>
                          </div>
                        )}
                        <span>Chaque 2 mois</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setFrequency('quarterly')}
                      className={`flex-1 py-3 px-4 rounded-2xl font-medium transition-all text-sm sm:text-base ${
                        frequency === 'quarterly'
                          ? 'bg-[#43B48F] text-[#101919]'
                          : 'bg-[#101919] text-white border border-white/10 hover:border-[#43B48F]/50'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {frequency === 'quarterly' && (
                          <div className="w-4 h-4 rounded-full bg-[#101919] flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-[#43B48F]"></div>
                          </div>
                        )}
                        <span>Chaque 3 mois</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Récapitulatif du versement planifié */}
                {paymentPlan && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-[#0F1F1F] rounded-xl p-4 sm:p-6"
                  >
                    <div className="flex flex-col justify-center items-center space-y-2">
                      <span className="text-white text-sm sm:text-base font-medium text-center">Vous allez verser la somme de</span>
                      <span className="text-[#5AB678] font-bold text-2xl sm:text-3xl">
                        {formatAmount(paymentPlan.amountPerPayment)} F CFA
                      </span>
                      <span className="text-white text-xs sm:text-sm font-medium text-center">
                        par {paymentPlan.frequencyText === 'mois' ? 'mois' : `mois (tous les ${paymentPlan.frequencyText})`} pendant {paymentPlan.totalMonths} mois à partir du {paymentPlan.startFormatted}. Date de fin : {paymentPlan.endFormatted}
                      </span>
                    </div>
                  </motion.div>
                )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Boutons de navigation */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 pb-2 mx-0 sm:mx-12">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex-1 bg-[#0F1F1F] text-white rounded-3xl p-3 sm:p-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0F1F1F]/80 transition-colors border border-white/10 flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
                <span>Précédent</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                disabled={!amount || parseFloat(amount) <= 0 || (isPaymentPlanned && !startDate)}
                className="flex-1 bg-gradient-to-r from-[#8FC99E] to-[#20B6B3] text-white rounded-3xl p-3 sm:p-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <span>Suivant</span>
                <ChevronRight size={18} className="sm:w-5 sm:h-5" />
              </motion.button>
            </div>
          </div>
        );
      }

      case 2: {
        const paymentPlan = calculatePaymentPlan();
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-white text-base sm:text-lg mb-2 font-bold">Confirmation</h3>
              <p className="text-white/60 text-xs sm:text-sm">
                Veuillez confirmer votre transaction
              </p>
            </div>
            
            {/* Somme totale à verser */}
            <div className="bg-[#0F1F1F] rounded-xl p-4 sm:p-6 mx-0 sm:mx-12">
              <div className="flex flex-col justify-center items-center space-y-2">
                <span className="text-white text-sm sm:text-base font-medium">Somme totale à verser</span>
                <span className="text-[#5AB678] font-bold text-2xl sm:text-3xl">
                  {formatAmount(parseFloat(amount))} F CFA
                </span>
                <span className="text-white/60 text-xs sm:text-sm">Issus de votre calcul</span>
              </div>
            </div>

            {/* Récapitulatif de la planification si activée */}
            {isPaymentPlanned && paymentPlan && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-[#0F1F1F] rounded-xl p-4 sm:p-6 mx-0 sm:mx-12 space-y-3"
              >
                <div className="flex flex-col justify-center items-center space-y-2">
                  <span className="text-white text-sm sm:text-base font-medium text-center">Vous allez verser la somme de</span>
                  <span className="text-[#5AB678] font-bold text-2xl sm:text-3xl">
                    {formatAmount(paymentPlan.amountPerPayment)} F CFA
                  </span>
                  <span className="text-white text-xs sm:text-sm font-medium text-center">
                    par {paymentPlan.frequencyText === 'mois' ? 'mois' : `mois (tous les ${paymentPlan.frequencyText})`} pendant {paymentPlan.totalMonths} mois à partir du {paymentPlan.startFormatted}. Date de fin : {paymentPlan.endFormatted}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Boutons de navigation */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 pb-2 mx-0 sm:mx-12">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                className="flex-1 bg-[#0F1F1F] text-[#3AE1B4] rounded-3xl p-3 sm:p-4 font-semibold hover:bg-[#0F1F1F]/80 transition-colors border border-white/10 flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
                <span>Précédent</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentStep(3)}
                disabled={parseFloat(amount) > effectiveBalance}
                className="flex-1 bg-[#3AE1B4] text-[#101919] rounded-3xl p-3 sm:p-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <span>Suivant</span>
                <ChevronRight size={18} className="sm:w-5 sm:h-5" />
              </motion.button>
            </div>
          </div>
        );
      }

      case 3: {
        const digits = securityCode.split('').concat(Array(4).fill('')).slice(0, 4);
        const handleCodeChange = (index: number, value: string) => {
          const digit = value.replace(/\D/g, '').slice(-1);
          const next = digits.map((d, i) => (i === index ? digit : d)).join('').slice(0, 4);
          setSecurityCode(next);
          if (digit && index < 3) securityCodeInputRefs.current[index + 1]?.focus();
        };
        const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Backspace' && !digits[index] && index > 0) {
            setSecurityCode((prev) => prev.slice(0, index));
            securityCodeInputRefs.current[index - 1]?.focus();
          }
        };
        const handleCodePaste = (e: React.ClipboardEvent) => {
          e.preventDefault();
          const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
          setSecurityCode(pasted);
          const nextIndex = Math.min(pasted.length, 3);
          securityCodeInputRefs.current[nextIndex]?.focus();
        };
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-white text-base sm:text-lg mb-2 font-bold">Code de sécurité</h3>
              <p className="text-white/60 text-xs sm:text-sm">
                Saisissez le code de sécurité à 4 chiffres de votre portefeuille.
              </p>
            </div>

            <div className="mx-0 sm:mx-12 space-y-2">
              <label className="text-white text-sm font-medium block mb-3">
                Code de sécurité
              </label>
              <div className="flex justify-center gap-2 sm:gap-3">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    ref={(el) => { securityCodeInputRefs.current[index] = el; }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digits[index]}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    onPaste={index === 0 ? handleCodePaste : undefined}
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    aria-label={`Chiffre ${index + 1} du code`}
                    className="w-14 h-14 sm:w-16 sm:h-16 bg-[#0F1F1F] text-white text-center text-xl sm:text-2xl font-mono font-bold rounded-xl border border-white/10 focus:outline-none focus:border-[#5AB678] transition-colors"
                  />
                ))}
              </div>
              <p className="text-white/50 text-xs text-center mt-2">Code à 4 chiffres</p>
            </div>

            {submitError && (
              <div className="mx-0 sm:mx-12 rounded-xl bg-red-500/20 border border-red-400/40 p-3">
                <p className="text-red-300 text-sm text-center">{submitError}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 pb-2 mx-0 sm:mx-12">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                disabled={isSubmitting}
                className="flex-1 bg-[#0F1F1F] text-[#3AE1B4] rounded-3xl p-3 sm:p-4 font-semibold hover:bg-[#0F1F1F]/80 transition-colors border border-white/10 flex items-center justify-center space-x-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
                <span>Précédent</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={securityCode.length < 4 || isSubmitting}
                className="flex-1 bg-[#3AE1B4] text-[#101919] rounded-3xl p-3 sm:p-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                {isSubmitting ? (
                  <span>Envoi en cours...</span>
                ) : (
                  <>
                    <span>Valider</span>
                    <ChevronRight size={18} className="sm:w-5 sm:h-5" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        );
      }

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
              className="bg-[#101919] rounded-none md:rounded-2xl w-full h-full md:min-h-0 md:max-h-[90vh] max-w-4xl overflow-hidden relative border-0 md:border border-white/10 flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 md:w-10 md:h-10 bg-[#5ab678] rounded-full flex items-center justify-center hover:bg-[#3AE1B4]/80 transition-colors z-10"
                aria-label="Fermer"
              >
                <X size={16} className="md:w-5 md:h-5 text-[#101919]" />
              </button>

              <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
                {/* Stepper - Left Side */}
                <div className="hidden md:flex w-64 bg-[#0A1515] p-8 border-r border-white/10 flex-shrink-0">
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
                <div className="md:hidden bg-[#0A1515] p-4 border-b border-white/10 flex-shrink-0">
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
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
                  <div 
                    className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 md:p-8 custom-scrollbar"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#43B48F #0A1515',
                    }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="pb-8"
                      >
                        {renderStepContent()}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <style>{`
                    .custom-scrollbar::-webkit-scrollbar {
                      width: 8px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                      background: #0A1515;
                      border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                      background: #43B48F;
                      border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                      background: #5AB678;
                    }
                  `}</style>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
