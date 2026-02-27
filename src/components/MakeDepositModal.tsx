'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Smartphone, Building2, CreditCard, User, Check, CheckCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { initiatePayment, checkPaymentStatus, confirmTopUp } from '@/services/payments';

interface MakeDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Si fourni, appelé après succès du dépôt (au lieu de router.push('/')) */
  onSuccess?: () => void;
}

type PaymentMethod = 'mobile-money' | 'bank-transfer' | 'card-wallet' | null;
type Operator = 'orange' | 'wave' | 'mtn' | 'moov' | null;

/** serviceCode envoyé à l'API pour chaque opérateur mobile money */
const OPERATOR_SERVICE_CODE: Record<Exclude<Operator, null>, string> = {
  orange: 'om',
  wave: 'wave',
  mtn: 'mtn',
  moov: 'moov',
};

const STEPS = [
  { id: 1, labelKey: 'step1Label' as const, icon: "/icons/image 33(1).png" },
  { id: 2, labelKey: 'step2Label' as const, icon: "/icons/image 34.png" },
  { id: 3, labelKey: 'step3Label' as const, icon: "/icons/image 35(1).png" },
  { id: 4, labelKey: 'step4Label' as const, icon: "/icons/image 36.png" },
  { id: 5, labelKey: 'step5Label' as const, icon: null },
];

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 180000; // 3 min

/** Détection iOS (client-side) : permet d’ouvrir Wave dans le navigateur au lieu de l’iframe */
function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

export default function MakeDepositModal({ isOpen, onClose, onSuccess }: MakeDepositModalProps) {
  const { user, accessToken, refreshUser } = useAuth();
  const router = useRouter();
  const t = useTranslations('makeDepositModal');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(null);
  const [selectedOperator, setSelectedOperator] = useState<Operator>(null);
  const [depositNumber, setDepositNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [useMyNumber, setUseMyNumber] = useState(false);
  const [payFees, setPayFees] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  /** OTP requis uniquement pour Orange (serviceCode "om") */
  const [otp, setOtp] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [unavailableToast, setUnavailableToast] = useState<string | null>(null);
  /** Après initiation sans payment_url : on poll le statut toutes les 2s pendant 3 min */
  const [waitingForPayment, setWaitingForPayment] = useState(false);
  const [pendingTransactionNumber, setPendingTransactionNumber] = useState<string | null>(null);
  const [pendingAmount, setPendingAmount] = useState<number>(0);
  /** Modal Wave : iframe avec l’URL de paiement (ouvert pour Wave uniquement) */
  const [wavePaymentModalOpen, setWavePaymentModalOpen] = useState(false);
  const [wavePaymentUrl, setWavePaymentUrl] = useState<string | null>(null);
  /** iOS : connu après hydratation pour afficher message + lien au lieu de l’iframe */
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingStartRef = useRef<number>(0);
  const pendingTxnRef = useRef<string | null>(null);
  const pendingAmountRef = useRef<number>(0);
  /** Montant à créditer pour l'écriture de la transaction : baseAmount si frais cochés, sinon totalAmount - 2,5 % */
  const pendingCreditAmountRef = useRef<number>(0);
  const accessTokenRef = useRef<string | null>(null);
  
  const userPhoneNumber = user?.phoneNumber || '+225 01 23 45 67 89';
  
  // Montants prédéfinis
  const defaultAmounts = [10000, 50000, 100000];
  
  // Montant et frais en entiers (pas de décimales) — frais à 2,5 %
  const FEE_RATE = 0.025;
  const baseAmount = amount ? Math.round(parseFloat(amount)) : 0;
  const transactionFee = amount ? Math.round(baseAmount * FEE_RATE) : 0;
  const totalAmount = payFees ? baseAmount + transactionFee : baseAmount;
  // Détection iOS côté client (évite hydratation incorrecte)
  useEffect(() => {
    setIsIOSDevice(isIOS());
  }, []);

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
      setSelectedPaymentMethod(null);
      setSelectedOperator(null);
      setDepositNumber('');
      setAmount('');
      setUseMyNumber(false);
      setPayFees(true);
      setIsSuccess(false);
      setOtp('');
      setPaymentError(null);
      setUnavailableToast(null);
      setWaitingForPayment(false);
      setPendingTransactionNumber(null);
      setPendingAmount(0);
      pendingCreditAmountRef.current = 0;
      setWavePaymentModalOpen(false);
      setWavePaymentUrl(null);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  }, [isOpen]);

  // Mettre à jour le numéro quand on sélectionne "Mon numéro"
  useEffect(() => {
    if (useMyNumber) {
      setDepositNumber(userPhoneNumber.replace(/\s/g, '').replace('+225', ''));
    }
  }, [useMyNumber, userPhoneNumber]);

  // Masquer le toast "Service indisponible" après 3 s
  useEffect(() => {
    if (!unavailableToast) return;
    const t = setTimeout(() => setUnavailableToast(null), 3000);
    return () => clearTimeout(t);
  }, [unavailableToast]);

  // Polling du statut de paiement toutes les 2s pendant 3 min (quand pas de redirection payment_url)
  useEffect(() => {
    if (!waitingForPayment || !pendingTransactionNumber || !accessToken) return;
    pendingTxnRef.current = pendingTransactionNumber;
    pendingAmountRef.current = pendingAmount;
    accessTokenRef.current = accessToken;
    pollingStartRef.current = Date.now();

    const tick = async () => {
      const txn = pendingTxnRef.current;
      const token = accessTokenRef.current;
      if (!txn || !token) return;
      if (Date.now() - pollingStartRef.current >= POLL_TIMEOUT_MS) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        setWavePaymentModalOpen(false);
        setWavePaymentUrl(null);
        setPaymentError(t('paymentFailed'));
        setWaitingForPayment(false);
        setPendingTransactionNumber(null);
        setPendingAmount(0);
        return;
      }
      try {
        const statusRes = await checkPaymentStatus({ transactionNumber: txn }, token);
        const amane = statusRes.data?.amane;
        const status = (amane?.data as { status?: string } | undefined)?.status ?? (amane as { status?: string } | undefined)?.status;
        if (status === 'SUCCEED' || status === 'SUCCESS' || status === 'SUCCESSFUL') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setWavePaymentModalOpen(false);
          setWavePaymentUrl(null);
          await confirmTopUp({ transactionNumber: txn, amount: pendingCreditAmountRef.current }, token);
          await refreshUser();
          setWaitingForPayment(false);
          setPendingTransactionNumber(null);
          setPendingAmount(0);
          setIsSuccess(true);
          setTimeout(() => {
            onClose();
            if (onSuccess) {
              onSuccess();
            } else {
              router.push('/');
            }
          }, 1500);
          return;
        }
        if (status === 'FAILED') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setWavePaymentModalOpen(false);
          setWavePaymentUrl(null);
          setPaymentError(t('paymentFailed'));
          setWaitingForPayment(false);
          setPendingTransactionNumber(null);
          setPendingAmount(0);
        }
      } catch {
        // PENDING ou erreur réseau : on continue à poller
      }
    };

    tick(); // premier check immédiat
    pollingIntervalRef.current = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [waitingForPayment, pendingTransactionNumber, pendingAmount, accessToken, refreshUser, onClose, onSuccess, router]);

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    // Si c'est mobile money, passer à l'étape 2, sinon passer directement à l'étape 3
    if (method === 'mobile-money') {
      setTimeout(() => setCurrentStep(2), 300);
    } else {
      setTimeout(() => setCurrentStep(3), 300);
    }
  };

  const handleOperatorSelect = (operator: Operator) => {
    setSelectedOperator(operator);
    if (operator !== 'orange') setOtp('');
    setTimeout(() => setCurrentStep(3), 300);
  };

  /** serviceCode pour l’API (om, wave, mtn, moov) */
  const serviceCode = selectedOperator ? OPERATOR_SERVICE_CODE[selectedOperator] : null;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setPaymentError(null);

    // Mobile money : appeler l'API de paiement direct (montant total = base + frais si "Payer les frais" coché)
    if (selectedPaymentMethod === 'mobile-money' && serviceCode && depositNumber.trim() && totalAmount > 0) {
      if (!accessToken) {
        setPaymentError(t('mustBeConnected'));
        return;
      }
      const phoneNumber = depositNumber.trim().startsWith('0') ? depositNumber.trim() : `0${depositNumber.trim()}`;
      const amountNum = totalAmount;
      /** Montant à créditer : base si frais cochés, sinon total - 2,5 % */
      const creditAmount = payFees ? baseAmount : Math.round(amountNum * (1 - FEE_RATE));
      setPaymentLoading(true);
      try {
        const res = await initiatePayment(
          {
            amount: amountNum,
            serviceCode,
            phoneNumber,
            otp: serviceCode === 'om' ? otp : '',
          },
          accessToken
        );
        const paymentUrl = res?.data?.data?.data?.payment_url;
        if (paymentUrl) {
          setWavePaymentUrl(paymentUrl);
          setWavePaymentModalOpen(true);
          if (isIOS()) {
            window.open(paymentUrl, '_blank', 'noopener,noreferrer');
          }
          pendingTxnRef.current = res.data.transactionNumber;
          pendingAmountRef.current = amountNum;
          pendingCreditAmountRef.current = creditAmount;
          setPendingTransactionNumber(res.data.transactionNumber);
          setPendingAmount(amountNum);
          setWaitingForPayment(true);
          return;
        }
        pendingTxnRef.current = res.data.transactionNumber;
        pendingAmountRef.current = amountNum;
        pendingCreditAmountRef.current = creditAmount;
        setPendingTransactionNumber(res.data.transactionNumber);
        setPendingAmount(amountNum);
        setWaitingForPayment(true);
      } catch (err) {
        const rawMessage = err instanceof Error ? err.message : t('errorInitiation');
        const isDirectPaymentCatch =
          rawMessage.includes('Direct payment initiated with catch error') ||
          rawMessage.includes('"statusCode":400');
        setPaymentError(isDirectPaymentCatch ? t('paymentFailedBalance') : rawMessage);
      } finally {
        setPaymentLoading(false);
      }
      return;
    }

    // Autres modes (virement, carte) : non connectés à l'API pour l'instant
    setIsSuccess(true);
  };

  const handleViewHistory = () => {
    onClose();
    router.push('/transactions');
  };

  const showUnavailableToast = () => setUnavailableToast(t('serviceUnavailable'));

  const handleCloseWaveModal = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setWavePaymentModalOpen(false);
    setWavePaymentUrl(null);
    setWaitingForPayment(false);
    setPendingTransactionNumber(null);
    setPendingAmount(0);
    pendingCreditAmountRef.current = 0;
    setPaymentError(t('paymentCancelled'));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-white text-2xl font-bold mb-8 text-left">{t('title')}</h2>
              <h3 className="text-white text-lg mb-2">{t('paymentMethodTitle')}</h3>
              <p className="text-white/60 text-sm">{t('paymentMethodHint')}</p>
            </div>

            {unavailableToast && (
              <div className="bg-amber-500/20 border border-amber-500/50 text-amber-200 text-sm text-center rounded-xl px-4 py-3">
                {unavailableToast}
              </div>
            )}
            
            <div className="space-y-3 bg-[#101919] rounded-xl p-4">
              {/* Mobile Money */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePaymentMethodSelect('mobile-money')}
                className="w-full bg-[#101919] hover:bg-[#101919]/80 rounded-xl p-4 flex items-center justify-between transition-colors border border-transparent hover:border-[#5AB678]/30"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-[#0F1F1F] flex items-center justify-center">
                    <Image src="/icons/mobile-coin(1).png" alt={t('altMobileMoney')} width={24} height={24} />
                  </div>
                  <span className="text-white font-medium">{t('mobileMoney')}</span>
                </div>
                <ChevronRight className="text-[#5AB678]" size={20} />
              </motion.button>

              {/* Virement bancaire - désactivé */}
              <button
                type="button"
                onClick={showUnavailableToast}
                className="w-full bg-[#101919]/60 rounded-xl p-4 flex items-center justify-between border border-white/10 opacity-60 cursor-not-allowed"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-[#0F1F1F] flex items-center justify-center opacity-80">
                    <Image src="/icons/bank.png" alt={t('altBankTransfer')} width={24} height={24} className="opacity-70" />
                  </div>
                  <span className="text-white/70 font-medium">{t('bankTransfer')}</span>
                </div>
                <ChevronRight className="text-white/40" size={20} />
              </button>

              {/* Carte de débit ou wallet - désactivé */}
              <button
                type="button"
                onClick={showUnavailableToast}
                className="w-full bg-[#101919]/60 rounded-xl p-4 flex items-center justify-between border border-white/10 opacity-60 cursor-not-allowed"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-[#0F1F1F] flex items-center justify-center opacity-80">
                    <Image src="/icons/credit-card-g.png" alt={t('altCardWallet')} width={24} height={24} className="opacity-70" />
                  </div>
                  <span className="text-white/70 font-medium">{t('cardWallet')}</span>
                </div>
                <ChevronRight className="text-white/40" size={20} />
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-white text-lg mb-2">{t('operatorTitle')}</h3>
              <p className="text-white/60 text-sm">{t('operatorHint')}</p>
            </div>
            
            <div className="space-y-3 bg-[#101919] rounded-xl p-4">
              {[
                { name: 'orange', icon: '/icons/image 33(1).png' },
                { name: 'wave', icon: '/icons/image 34.png' },
                { name: 'mtn', icon: '/icons/image 35(1).png' },
                { name: 'moov', icon: '/icons/image 36.png' }
              ].map((operator) => (
                <motion.button
                  key={operator.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOperatorSelect(operator.name as Operator)}
                  className={`w-full bg-[#101919] hover:bg-[#101919]/80 rounded-xl p-4 flex items-center justify-between transition-colors border ${
                    selectedOperator === operator.name ? 'border-[#5AB678]' : 'border-transparent hover:border-[#5AB678]/30'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-[#0F1F1F] flex items-center justify-center">
                      <Image 
                        src={operator.icon} 
                        alt={operator.name} 
                        width={24} 
                        height={24}
                        className="object-contain"
                      />
                    </div>
                    <span className="text-white font-medium capitalize">{operator.name}</span>
                  </div>
                  <ChevronRight className="text-[#5AB678]" size={20} />
                </motion.button>
              ))}
            </div>

            <div className="flex justify-center mx-auto pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                className="max-w-[120px] sm:max-w-none py-2.5 px-3 sm:p-4 bg-[#101919] text-white rounded-xl font-semibold hover:bg-[#101919]/80 transition-colors border border-white/10 text-xs sm:text-base"
              >
                {t('previous')}
              </motion.button>
            </div>
          </div>
        );

      case 3:
        // Obtenir l'icône et le nom de l'opérateur sélectionné
        const operatorInfo = selectedOperator === 'orange' 
          ? { name: 'Orange', icon: '/icons/image 33(1).png' }
          : selectedOperator === 'wave'
          ? { name: 'Wave', icon: '/icons/image 34.png' }
          : selectedOperator === 'mtn'
          ? { name: 'MTN', icon: '/icons/image 35(1).png' }
          : selectedOperator === 'moov'
          ? { name: 'Moov', icon: '/icons/image 36.png' }
          : { name: '', icon: '' };

        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-white text-lg mb-2">{t('depositNumberTitle')}</h3>
              <p className="text-white/60 text-sm">{t('depositNumberHint')}</p>
            </div>

            {/* Opérateur sélectionné */}
            {selectedOperator && (
              <div className="flex flex-col items-center py-4 mx-4 md:mx-0">
                <div className="w-16 h-16 rounded-full bg-[#0F1F1F] flex items-center justify-center mb-2">
                  <Image 
                    src={operatorInfo.icon} 
                    alt={operatorInfo.name} 
                    width={40} 
                    height={40}
                    className="object-contain"
                  />
                </div>
                <span className="text-white font-medium">{operatorInfo.name}</span>
              </div>
            )}

            {/* Bouton "Mon numéro" */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setUseMyNumber(true)}
              className={`w-full bg-[#101919] hover:bg-[#101919]/80 rounded-xl p-4 flex items-center justify-between transition-colors border ${
                useMyNumber ? 'border-[#5AB678]' : 'border-transparent hover:border-[#5AB678]/30'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-[#0F1F1F] flex items-center justify-center">
                  <User className="text-[#5AB678]" size={24} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-white font-medium">{t('myNumber')}</span>
                  <span className="text-white/60 text-sm">{userPhoneNumber}</span>
                </div>
              </div>
              <ChevronRight className="text-[#5AB678]" size={20} />
            </motion.button>

            {/* Séparateur */}
            <div className="flex items-center justify-center my-4">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="px-4 text-white/60 text-sm">{t('orEnterOther')}</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            {/* Champ de saisie */}
            <div>
              <label className="block text-white/60 text-sm mb-2">{t('numberLabel', { operator: operatorInfo.name })}</label>
              <div className="relative">
                <div className="flex items-center bg-[#101919] border border-white/10 rounded-xl p-4 focus-within:border-[#5AB678] transition-colors">
                  <Image 
                    src="/images/civ.png" 
                    alt={t('altCoteIvoire')} 
                    width={24} 
                    height={24}
                    className="object-contain mr-2"
                  />
                  <span className="text-white mr-2">+225</span>
                  {depositNumber && (
                    <Check className="text-[#5AB678] mr-2" size={18} />
                  )}
                  <input
                    type="tel"
                    value={depositNumber}
                    onChange={(e) => {
                      setDepositNumber(e.target.value);
                      setUseMyNumber(false);
                    }}
                    placeholder={t('numberPlaceholder')}
                    className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Champ OTP pour Orange uniquement */}
            {selectedOperator === 'orange' && (
              <div>
                <label className="block text-white/60 text-sm mb-2">
                  {t('otpHint')}
                </label>
                <div className="relative">
                  <div className="flex items-center bg-[#101919] border border-white/10 rounded-xl p-4 focus-within:border-[#5AB678] transition-colors">
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      placeholder={t('otpPlaceholder')}
                      className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Boutons de navigation */}
            <div className="flex flex-row justify-center items-center gap-2 sm:gap-3 pt-4 mx-auto w-full max-w-sm">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                className="flex-1 max-w-[120px] sm:max-w-none py-2.5 px-2 sm:p-4 bg-[#101919] text-white rounded-xl font-semibold hover:bg-[#1A2A2A]/80 transition-colors border border-white/10 flex items-center justify-center gap-1 sm:space-x-2 text-xs sm:text-base"
              >
                <ChevronLeft size={18} className="shrink-0 sm:w-5 sm:h-5" />
                <span>{t('previous')}</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                disabled={!depositNumber.trim() || (selectedOperator === 'orange' && !otp.trim())}
                className="flex-1 max-w-[120px] sm:max-w-none py-2.5 px-2 sm:p-4 bg-gradient-to-r from-[#8fc99e] to-[#20b6b3] text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center justify-center gap-1 sm:space-x-2 text-xs sm:text-base"
              >
                <span>{t('next')}</span>
                <ChevronRight size={18} className="shrink-0 sm:w-5 sm:h-5" />
              </motion.button>
            </div>
          </div>
        );

      case 4:
        // Obtenir l'icône et le nom de l'opérateur sélectionné
        const operatorInfoStep4 = selectedOperator === 'orange' 
          ? { name: 'Orange', icon: '/icons/image 33(1).png' }
          : selectedOperator === 'wave'
          ? { name: 'Wave', icon: '/icons/image 34.png' }
          : selectedOperator === 'mtn'
          ? { name: 'MTN', icon: '/icons/image 35(1).png' }
          : selectedOperator === 'moov'
          ? { name: 'Moov', icon: '/icons/image 36.png' }
          : { name: '', icon: '' };

        return (
          <div className="flex flex-col min-h-0">
            {/* Zone scrollable : hauteur augmentée pour voir plus d'éléments */}
            <div className="max-h-[65vh] sm:max-h-[70vh] overflow-y-auto overscroll-y-contain space-y-6 pr-1">
              <div>
                <h3 className="text-white text-lg mb-2">{t('amountTitle')}</h3>
                <p className="text-white/60 text-sm">{t('amountHint')}</p>
              </div>
              {/* En-tête de l'opérateur */}
              {selectedOperator && (
                <div className="flex flex-col items-center py-2 md:py-4 mx-2 md:mx-8">
                  <div className="w-16 h-16 rounded-full bg-[#0F1F1F] flex items-center justify-center mb-2">
                    <Image 
                      src={operatorInfoStep4.icon} 
                      alt={operatorInfoStep4.name} 
                      width={40} 
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-white font-medium mb-1">{operatorInfoStep4.name}</span>
                  <span className="text-white/60 text-sm">{depositNumber ? `+225 ${depositNumber}` : userPhoneNumber}</span>
                </div>
              )}

              {/* Section Montant du dépôt */}
              <div className="bg-gradient-to-r from-[#101919] to-[#0F1F1F] rounded-xl p-3 md:p-6 mx-2 md:mx-12">
                <h3 className="text-white text-lg mb-3 md:mb-4 text-center">{t('depositAmountTitle')}</h3>
                
                {/* Champ de saisie du montant */}
                <div className="mb-4 relative">
                  <div className="text-white text-2xl md:text-4xl font-bold min-h-[48px] flex items-center justify-center mb-2">
                    {amount ? (
                      <span>{baseAmount.toLocaleString('fr-FR')} F CFA</span>
                    ) : (
                      <span className="text-white/40">0 F CFA</span>
                    )}
                  </div>
                  <input
                    type="tel"
                    value={amount}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, '');
                      setAmount(numericValue);
                    }}
                    placeholder={t('amountPlaceholder')}
                    className="w-full bg-[#0F1F1F] text-white text-base font-normal placeholder-white/40 focus:outline-none border border-white/10 rounded-lg p-3 focus:border-[#5AB678] transition-colors"
                  />
                </div>

                {/* Texte "Ou choisissez un montant par défaut" */}
                <p className="text-white/60 text-sm mb-3 md:mb-4 text-center">{t('orChooseDefault')}</p>

                {/* Boutons de montants prédéfinis */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {defaultAmounts.map((defaultAmount) => (
                    <motion.button
                      key={defaultAmount}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setAmount(defaultAmount.toString())}
                      className={`w-fit rounded-2xl p-2 text-lg font-semibold transition-colors ${
                        amount === defaultAmount.toString()
                          ? 'bg-[#5AB678] text-white'
                          : 'bg-[#101919] text-white border border-white/10 hover:border-[#5AB678]/50'
                      }`}
                    >
                      {defaultAmount.toLocaleString('fr-FR')}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Résumé de la transaction */}
              <div className="bg-[#101919] rounded-xl p-3 md:p-6 mx-2 md:mx-12">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">{t('operationFees')}</span>
                  <span className="text-white font-semibold">
                    {transactionFee > 0 ? `${transactionFee.toLocaleString('fr-FR')} FCFA` : '0 FCFA'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">{t('totalAmount')}</span>
                  <span className="text-white font-semibold">
                    {totalAmount > 0 ? `${totalAmount.toLocaleString('fr-FR')} FCFA` : '0 FCFA'}
                  </span>
                </div>
                
                {/* Toggle "Payer les frais" */}
                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <span className="text-white">{t('payFees')}</span>
                  <button
                    onClick={() => setPayFees(!payFees)}
                    aria-label={payFees ? t('payFeesAriaOff') : t('payFeesAriaOn')}
                    title={payFees ? t('payFeesAriaOff') : t('payFeesAriaOn')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      payFees ? 'bg-[#5AB678]' : 'bg-[#101919] border border-white/20'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        payFees ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Boutons toujours visibles en bas (hors zone scroll), un peu descendus */}
            <div className="shrink-0 flex flex-row justify-center items-center gap-2 sm:gap-3 mx-auto w-full max-w-sm mt-4 pt-2 pb-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                className="flex-1 max-w-[115px] sm:max-w-none bg-[#101919] text-white rounded-xl py-2.5 px-2 sm:p-4 font-semibold hover:bg-[#101919]/80 transition-colors border border-white/10 flex items-center justify-center gap-1 sm:space-x-2 text-xs sm:text-sm"
              >
                <ChevronLeft size={16} className="shrink-0 sm:w-5 sm:h-5" />
                <span>{t('previous')}</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                disabled={!amount || baseAmount <= 0}
                className="flex-1 max-w-[115px] sm:max-w-none bg-gradient-to-r from-[#8fc99e] to-[#20b6b3] text-white rounded-xl py-2.5 px-2 sm:p-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center justify-center gap-1 sm:space-x-2 text-xs sm:text-sm"
              >
                <span>{t('next')}</span>
                <ChevronRight size={16} className="shrink-0 sm:w-5 sm:h-5" />
              </motion.button>
            </div>
          </div>
        );

      case 5:
        // Afficher l'écran de succès si la confirmation a été effectuée
        if (isSuccess) {
          return (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="rounded-full bg-[#5AB678] border-2 border-[#5AB678]/80 flex items-center justify-center">
                <Image src="/icons/valid-circle.png" alt={t('altSuccess')} width={48} height={48} className="object-contain" />
              </div>

              <h2 className="text-white text-3xl font-bold text-center">{t('successTitle')}</h2>

              <p className="text-white text-center text-lg">
                {t('successMessage')}
              </p>

              <p className="text-white/60 text-center text-sm max-w-md">
                {t('successHint')}
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleViewHistory}
                className="bg-gradient-to-r from-[#8fc99e] to-[#20b6b3] text-white rounded-2xl px-8 py-4 font-semibold hover:opacity-90 transition-opacity mt-4"
              >
                {t('viewHistory')}
              </motion.button>
            </div>
          );
        }

        // Sinon, afficher le formulaire de confirmation
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-white text-lg mb-2">{t('confirmationTitle')}</h3>
              <p className="text-white/60 text-sm">{t('confirmationHint')}</p>
            </div>
            
            <div className="bg-[#00644d]/10 rounded-xl p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-white/60">{t('paymentMethodLabel')}</span>
                <span className="text-white font-medium">
                  {selectedPaymentMethod === 'mobile-money' && t('mobileMoney')}
                  {selectedPaymentMethod === 'bank-transfer' && t('bankTransfer')}
                  {selectedPaymentMethod === 'card-wallet' && t('cardWallet')}
                </span>
              </div>
              {selectedOperator && (
                <div className="flex justify-between">
                  <span className="text-white/60">{t('operatorLabel')}</span>
                  <span className="text-white font-medium capitalize">{selectedOperator}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-white/60">{t('numberLabelShort')}</span>
                <span className="text-white font-medium">{depositNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">{t('amountLabel')}</span>
                <span className="text-white font-medium">{baseAmount.toLocaleString('fr-FR')} F CFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">{t('operationFees')}</span>
                <span className="text-white font-semibold">
                  {transactionFee > 0 ? `${transactionFee.toLocaleString('fr-FR')} FCFA` : '0 FCFA'}
                </span>
              </div>
            </div>
            <div className="bg-[#00644d]/10 rounded-xl p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-white/60">{t('totalAmountLabel')}</span>
                <span className="text-white font-semibold">
                  {totalAmount > 0 ? `${totalAmount.toLocaleString('fr-FR')} FCFA` : '0 FCFA'}
                </span>
              </div>
            </div>

            {paymentError && (
              <p className="text-red-400 text-sm text-center bg-red-400/10 rounded-xl p-3">
                {paymentError}
              </p>
            )}

            {waitingForPayment ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <Loader2 className="text-[#5AB678] w-10 h-10 animate-spin" />
                <p className="text-white text-center">{t('waitingPayment')}</p>
                <p className="text-white/60 text-sm text-center">{t('waitingPaymentHint')}</p>
              </div>
            ) : (
              <div className="flex flex-row justify-center items-center gap-2 sm:gap-3 mx-auto w-full max-w-sm">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBack}
                  disabled={paymentLoading}
                  className="flex-1 max-w-[140px] sm:max-w-none py-2.5 px-2 sm:p-4 bg-[#101919] text-white rounded-xl font-semibold hover:bg-[#1a2a2a]/80 transition-colors border border-white/10 flex items-center justify-center gap-1 sm:space-x-2 text-xs sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} className="shrink-0 sm:w-5 sm:h-5" />
                  <span>{t('previous')}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={paymentLoading}
                  className="flex-1 max-w-[140px] sm:max-w-none py-2.5 px-2 sm:p-4 bg-gradient-to-r from-[#8fc99e] to-[#20b6b3] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1 sm:space-x-2 text-xs sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{paymentLoading ? t('inProgress') : t('confirm')}</span>
                  {!paymentLoading && <ChevronRight size={16} className="shrink-0 sm:w-5 sm:h-5" />}
                </motion.button>
              </div>
            )}
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
            onClick={onClose}
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
                onClick={onClose}
                className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 md:w-10 md:h-10 bg-[#5AB678] rounded-full flex items-center justify-center hover:bg-[#5AB678]/80 transition-colors z-10"
                aria-label={t('closeAria')}
              >
                <X size={16} className="md:w-5 md:h-5 text-[#101919]" />
              </button>

              {/* Stepper Horizontal - Mobile */}
              <div className="md:hidden bg-[#0A1515] p-4 border-b border-white/10 overflow-x-auto">
                <div className="flex items-center justify-between min-w-max px-2">
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
                                ? 'bg-[#5AB678] text-[#101919]'
                                : isCompleted
                                ? 'bg-[#5AB678]/30 text-[#5AB678] border-2 border-[#5AB678]'
                                : 'bg-[#101919] text-white/60 border-2 border-[#101919]'
                            }`}
                          >
                            {step.id}
                          </div>
                          <p
                            className={`text-xs font-medium mt-1 text-center max-w-[60px] transition-colors ${
                              isActive
                                ? 'text-[#5AB678]'
                                : isCompleted
                                ? 'text-white/80'
                                : 'text-white/40'
                            }`}
                          >
                            {t(step.labelKey).split(' ')[0]}
                          </p>
                        </div>
                        {!isLast && (
                          <div className="mx-2 w-8 h-0.5 flex items-center justify-center">
                            {isCompleted ? (
                              <div className="w-full h-0.5 bg-[#5AB678]" />
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
                                  stroke="#5AB678"
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

              <div className="flex flex-col md:flex-row h-full">
                {/* Stepper - Left Side - Desktop */}
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
                                  ? 'bg-[#5AB678] text-[#101919]'
                                  : isCompleted
                                  ? 'bg-[#5AB678]/30 text-[#5AB678] border-2 border-[#5AB678]'
                                  : 'bg-[#101919] text-white/60 border-2 border-[#101919]'
                              }`}
                            >
                              {step.id}
                            </div>
                            {!isLast && (
                              <div className="relative mt-2 h-12 flex items-center justify-center">
                                {isCompleted ? (
                                  <div className="w-0.5 h-full bg-[#5AB678]" />
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
                                      stroke="#5AB678"
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
                                  ? 'text-[#5AB678]'
                                  : isCompleted
                                  ? 'text-white/80'
                                  : 'text-white/40'
                              }`}
                            >
                              {t(step.labelKey)}
                            </p>
                          </div>
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

          {/* Modal Wave : iframe de paiement (au-dessus du modal de dépôt) */}
          <AnimatePresence>
            {wavePaymentModalOpen && wavePaymentUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex flex-col bg-[#0A1515]"
              >
                <div className="flex items-center justify-between shrink-0 px-4 py-3 bg-[#101919] border-b border-white/10">
                  <h3 className="text-white font-semibold">{t('waveModalTitle')}</h3>
                  <button
                    type="button"
                    onClick={handleCloseWaveModal}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    aria-label={t('closeAria')}
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center p-6">
                  {isIOSDevice ? (
                    <>
                      <p className="text-white/80 text-center mb-6 max-w-sm">
                        {t('waveOpenInBrowser')}
                      </p>
                      <motion.a
                        href={wavePaymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(to right, #5AB678, #20B6B3)' }}
                      >
                        {t('waveOpenInBrowserButton')}
                      </motion.a>
                    </>
                  ) : (
                    <iframe
                      src={wavePaymentUrl}
                      title={t('wavePaymentTitle')}
                      className="w-full h-full border-0 min-h-0"
                      sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
