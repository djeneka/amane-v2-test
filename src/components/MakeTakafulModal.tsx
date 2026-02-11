'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Eye, EyeOff, Loader2, Calendar } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  addTakaful,
  makeTakafulSubscriptions,
  type TakafulPlan,
  type MyTakafulSubscription,
} from '@/services/takaful-plans';
import { getCurrentUser } from '@/services/user';

const API_MESSAGE_TRANSLATIONS: Record<string, string> = {
  'You already have an active subscription to this plan':
    'Vous avez déjà une souscription active à ce plan',
};

function parseApiErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  let extracted = msg;
  try {
    const parsed = JSON.parse(msg) as { message?: string | string[] };
    const m = parsed?.message;
    if (Array.isArray(m)) extracted = m[0] ?? msg;
    else if (typeof m === 'string') extracted = m;
  } catch {
    // pas du JSON
  }
  return API_MESSAGE_TRANSLATIONS[extracted] ?? (extracted || 'Une erreur est survenue.');
}

const DEFAULT_AMOUNTS = [10000, 50000, 100000];

/** Mode nouvelle souscription : plan fourni, pas encore de subscriptionId */
export interface MakeTakafulNewSubscriptionProps {
  mode: 'new';
  takafulPlanId: string;
  takafulPlan: TakafulPlan;
  subscription?: never;
}

/** Mode paiement : souscription existante fournie */
export interface MakeTakafulPaymentProps {
  mode: 'payment';
  subscription: MyTakafulSubscription;
  takafulPlanId?: never;
  takafulPlan?: never;
}

export type MakeTakafulModalProps = {
  isOpen: boolean;
  onClose: () => void;
  balance?: number;
  accessToken?: string | null;
  onSuccess?: () => void;
  onToast?: (message: string, type?: 'success' | 'error') => void;
  successTitle?: string;
  successMessage?: string;
  historyButtonText?: string;
  historyButtonLink?: string;
} & (MakeTakafulNewSubscriptionProps | MakeTakafulPaymentProps);

/** Étapes pour nouvelle souscription : 1=Ajouter takaful, 2=Montant, 3=Confirmation, 4=Code */
const STEPS_NEW = [
  { id: 1, label: 'Ajouter le takaful' },
  { id: 2, label: 'Montant' },
  { id: 3, label: 'Confirmation' },
  { id: 4, label: 'Code de sécurité' },
];

/** Étapes pour paiement existant : 1=Montant, 2=Confirmation, 3=Code */
const STEPS_PAYMENT = [
  { id: 1, label: 'Montant' },
  { id: 2, label: 'Confirmation' },
  { id: 3, label: 'Code de sécurité' },
];

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function MakeTakafulModal(props: MakeTakafulModalProps): React.ReactElement {
  const {
    isOpen,
    onClose,
    balance = 0,
    accessToken = null,
    onSuccess,
    onToast,
    successTitle = 'Souscription confirmée !',
    successMessage = 'Votre souscription a été effectuée avec succès.',
    historyButtonText = "Consulter l'historique",
    historyButtonLink = '/transactions',
  } = props;

  const isNewSubscription = props.mode === 'new';
  const takafulPlan = props.mode === 'new' ? props.takafulPlan : props.subscription.takafulPlan;
  const subscriptionId = props.mode === 'payment' ? props.subscription.id : null;

  const steps = isNewSubscription ? STEPS_NEW : STEPS_PAYMENT;
  const maxStep = steps.length;

  const [currentStep, setCurrentStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [walletBalanceFromApi, setWalletBalanceFromApi] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const securityCodeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Pour nouvelle souscription : subscriptionId obtenu après addTakaful
  const [createdSubscriptionId, setCreatedSubscriptionId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isAddingTakaful, setIsAddingTakaful] = useState(false);
  const [addTakafulError, setAddTakafulError] = useState<string | null>(null);

  const effectiveSubscriptionId = isNewSubscription ? createdSubscriptionId : subscriptionId;
  const effectiveBalance = walletBalanceFromApi ?? balance;

  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const today = new Date();
      const defaultEnd = new Date(today);
      defaultEnd.setFullYear(defaultEnd.getFullYear() + 1);
      if (isNewSubscription && !startDate) {
        setStartDate(toISODate(today));
        setEndDate(toISODate(defaultEnd));
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isNewSubscription]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setAmount('');
      setSecurityCode('');
      setIsSuccess(false);
      setShowBalance(true);
      setIsSubmitting(false);
      setSubmitError(null);
      setWalletBalanceFromApi(null);
      setCreatedSubscriptionId(null);
      setStartDate('');
      setEndDate('');
      setIsAddingTakaful(false);
      setAddTakafulError(null);
    } else if (isNewSubscription && !startDate) {
      const today = new Date();
      const defaultEnd = new Date(today);
      defaultEnd.setFullYear(defaultEnd.getFullYear() + 1);
      setStartDate(toISODate(today));
      setEndDate(toISODate(defaultEnd));
    }
  }, [isOpen]);

  // Montant par défaut = cotisation mensuelle du plan
  useEffect(() => {
    if (isOpen && takafulPlan?.monthlyContribution != null && !amount) {
      setAmount(takafulPlan.monthlyContribution.toString());
    }
  }, [isOpen, takafulPlan?.monthlyContribution]);

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
        if (!cancelled) setWalletBalanceFromApi(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingBalance(false);
      });
    return () => { cancelled = true; };
  }, [isOpen, accessToken]);

  const handleAddTakaful = async () => {
    if (!accessToken || props.mode !== 'new') return;
    const plan = props.takafulPlan;
    if (!startDate || !endDate) {
      setAddTakafulError('Veuillez sélectionner les dates de prise en compte et de fin.');
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      setAddTakafulError('La date de fin doit être postérieure à la date de prise en compte.');
      return;
    }
    setAddTakafulError(null);
    setIsAddingTakaful(true);
    try {
      const result = await addTakaful(accessToken, {
        takafulPlanId: props.takafulPlanId,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
      setCreatedSubscriptionId(result.id);
      onToast?.('Takaful ajouté avec succès.', 'success');
      setCurrentStep(2);
    } catch (err) {
      setAddTakafulError(parseApiErrorMessage(err));
      onToast?.(parseApiErrorMessage(err), 'error');
    } finally {
      setIsAddingTakaful(false);
    }
  };

  const handleNext = () => {
    if (currentStep < maxStep && canGoNext()) {
      setSubmitError(null);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setSubmitError(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canGoNext = () => {
    const isAmountStep = isNewSubscription ? currentStep === 2 : currentStep === 1;
    if (isAmountStep) {
      const num = parseFloat(amount);
      return !!amount && num > 0 && num <= effectiveBalance;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!accessToken || !effectiveSubscriptionId) {
      setSubmitError('Session expirée ou souscription introuvable. Veuillez réessayer.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      setSubmitError('Montant invalide.');
      return;
    }
    if (numAmount > effectiveBalance) {
      setSubmitError('Le montant ne peut pas dépasser le solde de votre portefeuille.');
      return;
    }
    if (securityCode.length !== 4) {
      setSubmitError('Veuillez saisir le code à 4 chiffres de votre portefeuille.');
      return;
    }
    const now = new Date();
    const paymentDate = now.toISOString();
    const nextPaymentDate = now.toISOString();

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await makeTakafulSubscriptions(accessToken, {
        walletCode: securityCode,
        subscriptionId: effectiveSubscriptionId,
        amount: numAmount,
        paymentDate,
        nextPaymentDate,
      });
      setIsSuccess(true);
    } catch (err) {
      setSubmitError(parseApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSuccess) {
      onSuccess?.();
      setIsSuccess(false);
      setCurrentStep(1);
      setAmount('');
      setCreatedSubscriptionId(null);
    }
    onClose();
  };

  const handleViewHistory = () => {
    onSuccess?.();
    setIsSuccess(false);
    setCurrentStep(1);
    setAmount('');
    setCreatedSubscriptionId(null);
    onClose();
    router.push(historyButtonLink);
  };

  const renderStepContent = () => {
    if (isSuccess) {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
          <div className="rounded-full bg-[#3AE1B4]/20 flex items-center justify-center">
            <Image src="/icons/valid-circle.png" alt="Succès" width={48} height={48} className="object-contain" />
          </div>
          <h2 className="text-white text-2xl font-bold text-center">{successTitle}</h2>
          <p className="text-white text-lg text-center max-w-md">{successMessage}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleViewHistory}
            className="rounded-3xl px-8 py-4 font-semibold text-white hover:opacity-90 transition-opacity mt-4"
            style={{ background: 'linear-gradient(to right, #3AE1B4, #13A98B)' }}
          >
            {historyButtonText}
          </motion.button>
        </div>
      );
    }

    // Step 1 : Nouvelle souscription = formulaire dates + valider
    if (isNewSubscription && currentStep === 1) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-white text-2xl font-bold mb-2">Ajouter le takaful</h2>
            <p className="text-white/60 text-sm">
              {takafulPlan?.title} - {takafulPlan?.monthlyContribution?.toLocaleString('fr-FR')} F / mois
            </p>
          </div>
          <div className="space-y-4 mx-0 sm:mx-12">
            <div>
              <label htmlFor="takaful-start-date" className="text-white/90 text-sm font-medium block mb-1.5">
                Date de prise en compte
              </label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" aria-hidden />
                <input
                  id="takaful-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  title="Date de prise en compte"
                  className="w-full bg-[#101919] text-white rounded-lg p-3 pl-10 border border-white/10 focus:border-[#5AB678] focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label htmlFor="takaful-end-date" className="text-white/90 text-sm font-medium block mb-1.5">
                Date de fin
              </label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" aria-hidden />
                <input
                  id="takaful-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  title="Date de fin"
                  className="w-full bg-[#101919] text-white rounded-lg p-3 pl-10 border border-white/10 focus:border-[#5AB678] focus:outline-none"
                />
              </div>
            </div>
            {addTakafulError && (
              <div className="rounded-xl bg-red-500/20 border border-red-400/40 p-3">
                <p className="text-red-300 text-sm">{addTakafulError}</p>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddTakaful}
              disabled={isAddingTakaful || !startDate || !endDate}
              className="w-full bg-[#3AE1B4] text-[#101919] rounded-3xl p-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 flex items-center justify-center gap-2"
            >
              {isAddingTakaful && <Loader2 size={20} className="animate-spin" />}
              {isAddingTakaful ? 'Ajout en cours...' : 'Valider'}
            </motion.button>
          </div>
        </div>
      );
    }

    const isAmountStep = isNewSubscription ? currentStep === 2 : currentStep === 1;
    if (isAmountStep) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-white text-2xl font-bold mb-2">Takaful</h2>
            <h3 className="text-white text-lg mb-2">Montant du produit takaful</h3>
            <p className="text-white/60 text-sm">Veuillez saisir le montant du produit takaful.</p>
          </div>
          <div
            className="rounded-3xl p-4 flex items-center justify-between mx-0 sm:mx-12"
            style={{ background: 'linear-gradient(to right, #3AE1B4, #13A98B)' }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Image src="/icons/wallet-card(1).png" alt="Solde" width={24} height={24} className="object-contain" />
              </div>
              <div className="flex space-x-2">
                <p className="text-white text-xl font-bold">Votre Solde</p>
                <p className="text-white font-bold text-xl">
                  {loadingBalance
                    ? 'Chargement...'
                    : showBalance
                      ? `${effectiveBalance.toLocaleString('fr-FR').replace(/\s/g, ' ')} F`
                      : '* * * * * *'}
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
          <div className="bg-[#0F1F1F] rounded-xl p-6 mx-0 sm:mx-12">
            <h3 className="text-white text-xl font-bold mb-4 text-center">Montant du produit takaful</h3>
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
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="Saisissez le montant"
                className="w-full bg-[#101919] text-white text-base font-normal placeholder-white/40 focus:outline-none border border-white/10 rounded-lg p-3 focus:border-[#5AB678] transition-colors"
              />
            </div>
            <p className="text-white/60 text-sm mb-4 text-center">Ou choisissez un montant par défaut</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {DEFAULT_AMOUNTS.map((a) => (
                <motion.button
                  key={a}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAmount(a.toString())}
                  className={`rounded-2xl px-4 py-2 text-lg font-semibold transition-colors ${
                    amount === a.toString()
                      ? 'bg-[#00644d] text-white'
                      : 'bg-[#101919] text-white border border-white/10 hover:border-[#5AB678]/50'
                  }`}
                >
                  {a.toLocaleString('fr-FR')}
                </motion.button>
              ))}
            </div>
            {amount && parseFloat(amount) > effectiveBalance && (
              <p className="text-red-400 text-sm text-center mt-4">
                Le montant ne peut pas dépasser votre solde ({effectiveBalance.toLocaleString('fr-FR')} F).
              </p>
            )}
          </div>
          <div className="flex space-x-3 pt-4 mx-0 sm:mx-12">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBack}
              className="flex-1 bg-[#0F1F1F] text-[#3AE1B4] rounded-3xl p-4 font-semibold hover:bg-[#0F1F1F]/80 border border-white/10 flex items-center justify-center space-x-2"
            >
              <ChevronLeft size={20} />
              <span>Précédent</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > effectiveBalance}
              className="flex-1 bg-[#3AE1B4] text-[#101919] rounded-3xl p-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 flex items-center justify-center space-x-2"
            >
              <span>Suivant</span>
              <ChevronRight size={20} />
            </motion.button>
          </div>
        </div>
      );
    }

    const isConfirmationStep = isNewSubscription ? currentStep === 3 : currentStep === 2;
    if (isConfirmationStep) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-white text-lg mb-2 font-bold">Confirmation</h3>
            <p className="text-white/60 text-sm">
              Vérifiez les informations avant de confirmer votre souscription.
            </p>
          </div>
          <div className="bg-[#0F1F1F] rounded-3xl p-6 space-y-4 mx-0 sm:mx-12">
            <div className="flex flex-col justify-center items-center space-y-2">
              <span className="text-white text-xl font-bold">Vous allez payer la somme de</span>
              <span className="text-[#5ab678] font-bold text-3xl">
                {parseFloat(amount).toLocaleString('fr-FR')} F CFA
              </span>
              <span className="text-white text-sm font-medium text-center">
                Sur Amane+ souscrivez à des produits takaful halal.
              </span>
            </div>
          </div>
          <div className="flex space-x-3 pt-4 mx-0 sm:mx-12">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBack}
              className="flex-1 bg-[#0F1F1F] text-[#3AE1B4] rounded-3xl p-4 font-semibold hover:bg-[#0F1F1F]/80 border border-white/10 flex items-center justify-center space-x-2"
            >
              <ChevronLeft size={20} />
              <span>Précédent</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="flex-1 bg-[#3AE1B4] text-[#101919] rounded-3xl p-4 font-semibold hover:opacity-90 flex items-center justify-center space-x-2"
            >
              <span>Suivant</span>
              <ChevronRight size={20} />
            </motion.button>
          </div>
        </div>
      );
    }

    const isCodeStep = isNewSubscription ? currentStep === 4 : currentStep === 3;
    if (isCodeStep) {
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
        securityCodeInputRefs.current[Math.min(pasted.length, 3)]?.focus();
      };
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-white text-lg mb-2 font-bold">Code de sécurité</h3>
            <p className="text-white/60 text-sm">
              Saisissez le code à 4 chiffres de votre portefeuille pour valider le paiement.
            </p>
          </div>
          <div className="mx-0 sm:mx-12 space-y-2">
            <label className="text-white text-sm font-medium block">Code de sécurité (4 chiffres)</label>
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  ref={(el) => {
                    securityCodeInputRefs.current[index] = el;
                  }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digits[index]}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(index, e)}
                  onPaste={index === 0 ? handleCodePaste : undefined}
                  aria-label={`Chiffre ${index + 1} du code`}
                  className="w-14 h-14 bg-[#0F1F1F] text-white text-center text-xl font-mono font-bold rounded-xl border border-white/10 focus:outline-none focus:border-[#5AB678]"
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
          <div className="flex space-x-3 pt-4 mx-0 sm:mx-12">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex-1 bg-[#0F1F1F] text-[#3AE1B4] rounded-3xl p-4 font-semibold hover:bg-[#0F1F1F]/80 border border-white/10 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <ChevronLeft size={20} />
              <span>Précédent</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={
                securityCode.length < 4 ||
                isSubmitting ||
                (!!accessToken && parseFloat(amount) > effectiveBalance)
              }
              className="flex-1 bg-[#3AE1B4] text-[#101919] rounded-3xl p-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 size={20} className="animate-spin flex-shrink-0" />}
              {isSubmitting ? 'Envoi en cours...' : 'Confirmer'}
            </motion.button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#101919] rounded-none md:rounded-2xl w-full h-full max-w-4xl md:max-h-[90vh] overflow-hidden relative border-0 md:border border-white/10 flex flex-col"
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 md:w-10 md:h-10 bg-[#5ab678] rounded-full flex items-center justify-center hover:bg-[#3AE1B4]/80 transition-colors z-10"
                aria-label="Fermer"
              >
                <X size={16} className="md:w-5 md:h-5 text-[#101919]" />
              </button>

              <div className="flex-1 flex flex-col md:flex-row min-h-0">
                <div className="hidden md:flex w-64 bg-[#0A1515] p-8 border-r border-white/10">
                  <div className="space-y-6">
                    {steps.map((step, index) => {
                      const isActive = currentStep === step.id;
                      const isCompleted = currentStep > step.id;
                      const isLast = index === steps.length - 1;
                      return (
                        <div key={step.id} className="flex items-start">
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
                                  <svg className="h-full w-0.5" viewBox="0 0 2 48" preserveAspectRatio="none">
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
                          <div className="flex-1 pt-2">
                            <p
                              className={`text-sm font-medium transition-colors ${
                                isActive ? 'text-[#3AE1B4]' : isCompleted ? 'text-white/80' : 'text-white/40'
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

                <div className="md:hidden bg-[#0A1515] p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                      const isActive = currentStep === step.id;
                      const isCompleted = currentStep > step.id;
                      const isLast = index === steps.length - 1;
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
                                isActive ? 'text-[#3AE1B4]' : isCompleted ? 'text-white/80' : 'text-white/40'
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
                                <svg className="w-full h-0.5" viewBox="0 0 32 2" preserveAspectRatio="none">
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

                <div className="flex-1 flex flex-col min-h-0 p-4 md:p-8 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      className="flex-1 flex flex-col min-h-0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex-1 min-h-0 flex flex-col">{renderStepContent()}</div>
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
