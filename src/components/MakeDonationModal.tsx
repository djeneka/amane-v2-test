'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, ChevronDown, Eye, EyeOff, Heart, HandCoins, User, FileDown, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  createDonation,
  makeGeneralDonation,
  type CreateDonationThirdPartyInput,
  type CreateDonationBody,
  type CreateGeneralDonationBody,
} from '@/services/donations';
import { getCurrentUser } from '@/services/user';
import { generateCertificatePdf, generateCertificatePdfAsBlob } from '@/lib/certificatePdf';
import { uploadCertificatePdf } from '@/lib/upload';

export type DonationTypeChoice = 'SELF' | 'THIRD_PARTY';

interface MakeDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance?: number;
  initialAmount?: number;
  /** ID de la campagne (requis pour appeler l’API don) */
  campaignId?: string | null;
  /** JWT (requis pour appeler l’API don) */
  accessToken?: string | null;
  /** Callback après don réussi */
  onSuccess?: () => void;
  /** Nom du donateur (pour le certificat PDF). Si non fourni, le certificat utilisera une valeur par défaut. */
  donorName?: string | null;
  // Textes personnalisables
  title?: string;
  subtitle?: string;
  description?: string;
  amountSectionTitle?: string;
  successTitle?: string;
  successMessage?: string;
  historyButtonText?: string;
  historyButtonLink?: string;
  confirmationTitle?: string;
  confirmationDescription?: string;
  recapTitle?: string;
  recapMessage?: string;
}

/** Étapes quand don à son nom */
const STEPS_SELF = [
  { id: 1, label: 'Type de don' },
  { id: 2, label: 'Montant' },
  { id: 3, label: 'Confirmation' },
  { id: 4, label: 'Code de sécurité' },
];

/** Étapes quand don au nom d'un tiers */
const STEPS_THIRD_PARTY = [
  { id: 1, label: 'Type de don' },
  { id: 2, label: 'Bénéficiaire' },
  { id: 3, label: 'Montant' },
  { id: 4, label: 'Confirmation' },
  { id: 5, label: 'Code de sécurité' },
];

function parseApiErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  try {
    const parsed = JSON.parse(msg) as { message?: string | string[] };
    const m = parsed?.message;
    if (Array.isArray(m)) return m[0] ?? msg;
    if (typeof m === 'string') return m;
  } catch {
    // pas du JSON
  }
  return msg || 'Une erreur est survenue.';
}

const DEFAULT_AMOUNTS = [10000, 50000, 100000];

const RELATIONSHIP_OPTIONS = [
  { value: '', label: 'Sélectionner' },
  { value: 'Ami(e)', label: 'Ami(e)' },
  { value: 'Famille', label: 'Famille' },
  { value: 'Collègue', label: 'Collègue' },
  { value: 'En mémoire de', label: 'En mémoire de' },
  { value: 'Autre', label: 'Autre' },
];

export default function MakeDonationModal({ 
  isOpen, 
  onClose,
  balance = 610473,
  initialAmount,
  campaignId = null,
  accessToken = null,
  onSuccess,
  donorName = null,
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
}: MakeDonationModalProps): React.ReactElement {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [donationType, setDonationType] = useState<DonationTypeChoice | null>(null);
  const [amount, setAmount] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [walletBalanceFromApi, setWalletBalanceFromApi] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);
  const [certificateError, setCertificateError] = useState<string | null>(null);
  const securityCodeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Formulaire tiers (pour actor = THIRD_PARTY)
  const [thirdParty, setThirdParty] = useState<CreateDonationThirdPartyInput>({
    dedicationType: 'LIVING',
    firstName: '',
    lastName: '',
    relationshipType: '',
    personalMessage: '',
    showMyNameOnCertificate: false,
    certificateRecipient: 'SELF',
  });

  const steps = donationType === 'THIRD_PARTY' ? STEPS_THIRD_PARTY : STEPS_SELF;
  const maxStep = steps.length;

  /** Solde affiché à l’étape montant : API si dispo, sinon prop balance */
  const effectiveBalance = walletBalanceFromApi ?? balance;

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

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setDonationType(null);
      setAmount('');
      setSecurityCode('');
      setIsSuccess(false);
      setShowBalance(true);
      setIsSubmitting(false);
      setSubmitError(null);
      setWalletBalanceFromApi(null);
      setThirdParty({
        dedicationType: 'LIVING',
        firstName: '',
        lastName: '',
        relationshipType: '',
        personalMessage: '',
        showMyNameOnCertificate: false,
        certificateRecipient: 'SELF',
      });
    } else if (initialAmount) {
      setAmount(initialAmount.toString());
    }
  }, [isOpen, initialAmount]);

  // Récupérer le solde du wallet du user connecté à l'ouverture du modal
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

  const handleChooseType = (type: DonationTypeChoice) => {
    setDonationType(type);
    setCurrentStep(2);
  };

  const handleNext = () => {
    if (currentStep < maxStep && canGoNext()) {
      setSubmitError(null);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setSubmitError(null);
    if (currentStep === 2 && donationType) {
      setDonationType(null);
      setCurrentStep(1);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canGoNext = () => {
    if (currentStep === 1) return !!donationType;
    if (donationType === 'SELF' && currentStep === 2) {
      const num = parseFloat(amount);
      return !!amount && num > 0 && num <= effectiveBalance;
    }
    if (donationType === 'THIRD_PARTY' && currentStep === 2) {
      return !!thirdParty.firstName?.trim() && !!thirdParty.lastName?.trim();
    }
    if (donationType === 'THIRD_PARTY' && currentStep === 3) {
      const num = parseFloat(amount);
      return !!amount && num > 0 && num <= effectiveBalance;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!accessToken) {
      setSubmitError('Session expirée. Veuillez vous connecter.');
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
    const recipientName = [thirdParty.firstName, thirdParty.lastName].filter(Boolean).join(' ') || '—';
    const displayDonorName = thirdParty.showMyNameOnCertificate
      ? (donorName?.trim() || 'Donateur')
      : 'Amane';

    const baseThirdPartyPayload: CreateDonationThirdPartyInput = {
      dedicationType: thirdParty.dedicationType,
      firstName: thirdParty.firstName.trim(),
      lastName: thirdParty.lastName.trim(),
      relationshipType: thirdParty.relationshipType || 'Ami(e)',
      personalMessage: thirdParty.personalMessage,
      showMyNameOnCertificate: thirdParty.showMyNameOnCertificate,
      certificateRecipient: thirdParty.certificateRecipient,
      ...(thirdParty.ribKey?.trim() ? { ribKey: thirdParty.ribKey.trim() } : {}),
    };

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      let thirdPartyPayload = baseThirdPartyPayload;
      if (donationType === 'THIRD_PARTY') {
        const blob = await generateCertificatePdfAsBlob({
          donorName: displayDonorName,
          recipientName,
          amount: numAmount,
          ...(campaignId && typeof window !== 'undefined'
            ? { impactUrl: `${window.location.origin}/campagnes/${campaignId}` }
            : {}),
        });
        const file = new File([blob], 'certificat-khatma-don.pdf', { type: 'application/pdf' });
        const certificatUrl = await uploadCertificatePdf(file);
        thirdPartyPayload = { ...baseThirdPartyPayload, certificatUrl };
      }
      if (campaignId) {
        const body: CreateDonationBody =
          donationType === 'SELF'
            ? {
                walletCode: securityCode,
                actor: 'SELF',
                campaignId,
                amount: numAmount,
                purpose: 'DONATION',
              }
            : {
                walletCode: securityCode,
                actor: 'THIRD_PARTY',
                thirdParty: thirdPartyPayload,
                campaignId,
                amount: numAmount,
                purpose: 'DONATION',
              };
        await createDonation(accessToken, body);
      } else {
        const body: CreateGeneralDonationBody =
          donationType === 'SELF'
            ? {
                walletCode: securityCode,
                actor: 'SELF',
                amount: numAmount,
                purpose: 'DONATION',
              }
            : {
                walletCode: securityCode,
                actor: 'THIRD_PARTY',
                thirdParty: thirdPartyPayload,
                amount: numAmount,
                purpose: 'DONATION',
              };
        await makeGeneralDonation(accessToken, body);
      }
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
    }
    onClose();
  };

  const handleViewHistory = () => {
    onSuccess?.();
    setIsSuccess(false);
    setCurrentStep(1);
    setAmount('');
    onClose();

    router.push(historyButtonLink);
  };

  const handleDownloadCertificate = async () => {
    const recipientName = [thirdParty.firstName, thirdParty.lastName].filter(Boolean).join(' ') || '—';
    const numAmount = parseFloat(amount);
    const amountValue = Number.isFinite(numAmount) ? numAmount : 0;
    const displayDonorName = thirdParty.showMyNameOnCertificate
      ? (donorName?.trim() || 'Donateur')
      : 'Amane';
    setCertificateError(null);
    setDownloadingCertificate(true);
    try {
      await generateCertificatePdf(
        {
          donorName: displayDonorName,
          recipientName,
          amount: amountValue,
          ...(campaignId && typeof window !== 'undefined'
            ? { impactUrl: `${window.location.origin}/campagnes/${campaignId}` }
            : {}),
        },
        'certificat-khatma-don'
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Impossible de générer le certificat.';
      setCertificateError(msg);
    } finally {
      setDownloadingCertificate(false);
    }
  };

  const renderStepContent = () => {
    if (isSuccess) {
      const isThirdPartySuccess = donationType === 'THIRD_PARTY';
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
          <div className="rounded-full bg-[#3AE1B4]/20 flex items-center justify-center">
            <Image src="/icons/valid-circle.png" alt="Succès" width={48} height={48} className="object-contain" />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Heart size={24} className="text-white fill-[#101919]" />
            <h2 className="text-white text-2xl font-bold text-center">{successTitle}</h2>
          </div>
          <p className="text-white text-lg text-center max-w-md">{successMessage}</p>

          {/* Don pour un tiers (campagne ou général) : bouton "Télécharger le certificat" */}
          {isThirdPartySuccess && (
            <>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadCertificate}
                disabled={downloadingCertificate}
                className="flex items-center justify-center gap-3 rounded-2xl px-8 py-4 font-semibold border-2 border-dashed transition-opacity min-w-[280px] bg-[#1a2e2a] border-[#66ff99] text-[#66ff99] hover:opacity-90 disabled:opacity-70"
              >
                <span>{downloadingCertificate ? 'Génération...' : 'Télécharger le certificat'}</span>
                <FileDown size={22} className="flex-shrink-0" strokeWidth={2} />
              </motion.button>
              {certificateError && (
                <p className="text-red-400 text-sm text-center max-w-xs">{certificateError}</p>
              )}
            </>
          )}

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

    if (currentStep === 1) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-white text-2xl font-bold mb-2">{title}</h2>
            <p className="text-white/60 text-sm">Choisissez le type de don.</p>
          </div>
          <div className="space-y-3 mx-0 sm:mx-12">
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleChooseType('SELF')}
              className="w-full rounded-3xl bg-[#00644D]/70 border border-white/10 hover:border-[#5AB678]/50 p-4 flex items-center gap-4 text-left transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-[#1a3d35] flex items-center justify-center flex-shrink-0">
                <Image src="/images/Image(5).png" alt="À mon nom" width={100} height={100} className="object-contain" />
              </div>
              <span className="text-white text-lg font-medium">À mon nom</span>
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleChooseType('THIRD_PARTY')}
              className="w-full rounded-3xl bg-[#00644D]/70 border border-white/10 hover:border-[#5AB678]/50 p-4 flex items-center gap-4 text-left transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-[#1a3d35] flex items-center justify-center flex-shrink-0">
                <Image src="/images/Image(5).png" alt="Pour un tiers" width={100} height={100} className="object-contain" />
              </div>
              <span className="text-white text-lg font-medium">Pour un tiers</span>
            </motion.button>
          </div>
        </div>
      );
    }

    const isAmountStep =
      (donationType === 'SELF' && currentStep === 2) ||
      (donationType === 'THIRD_PARTY' && currentStep === 3);
    if (isAmountStep) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-white text-2xl font-bold mb-2">{title}</h2>
            <h3 className="text-white text-lg mb-2">{subtitle}</h3>
            <p className="text-white/60 text-sm">{description}</p>
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
            <h3 className="text-white text-xl font-bold mb-4 text-center">{amountSectionTitle}</h3>
            <div className="mb-4 relative">
              <div className="text-white text-4xl font-bold min-h-[56px] flex items-center justify-center mb-2">
                {amount ? <span>{parseFloat(amount).toLocaleString('fr-FR')} F CFA</span> : <span className="text-white/40">0 F CFA</span>}
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
                    amount === a.toString() ? 'bg-[#00644d] text-white' : 'bg-[#101919] text-white border border-white/10 hover:border-[#5AB678]/50'
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

    if (donationType === 'THIRD_PARTY' && currentStep === 2) {
      const inputClass = 'w-full bg-[#101919] text-white rounded-lg p-3 border border-white/10 focus:border-[#5AB678] focus:outline-none';
      const labelClass = 'text-white/90 text-sm font-medium block mb-1.5';
      const showNameAriaChecked = thirdParty.showMyNameOnCertificate ? 'true' : 'false';
      return (
        <div className="flex flex-col min-h-0 flex-1">
          <div className="flex-1 overflow-y-auto space-y-6 pb-24">
          <div>
            <h2 className="text-white text-2xl font-bold mb-2">{title}</h2>
            <h3 className="text-white text-lg mb-1">Informations sur la personne honorée</h3>
            <p className="text-white/60 text-sm">Don pour un tiers</p>
          </div>
          <div className="mx-0 sm:mx-12 space-y-5">
            {/* Destinataires du certificat | Type de dédicace */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className={labelClass}>Destinataires du certificat</p>
                <div className="space-y-2">
                  {[
                    { value: 'SELF' as const, label: 'Moi uniquement' },
                    { value: 'HONOREE' as const, label: 'La personne honorée uniquement' },
                    { value: 'SELF_AND_HONOREE' as const, label: 'La personne honorée et moi' },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="certificateRecipient"
                        checked={thirdParty.certificateRecipient === opt.value}
                        onChange={() => setThirdParty((p) => ({ ...p, certificateRecipient: opt.value }))}
                        className="w-4 h-4 accent-[#5AB678] border-2 border-[#5AB678] bg-transparent text-[#5AB678] focus:ring-[#5AB678] focus:ring-offset-0"
                      />
                      <span className="text-white text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <p className={labelClass}>Type de dédicace</p>
                <div className="space-y-2">
                  {[
                    { value: 'LIVING' as const, label: 'Au nom de (pour une personne vivante)' },
                    { value: 'IN_MEMORY' as const, label: 'En mémoire de (pour un défunt)' },
                    { value: 'IN_HONOR_OF' as const, label: "En l'honneur de" },
                  ].map((opt) => (
                    <label key={opt.label} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="dedicationType"
                        checked={thirdParty.dedicationType === opt.value}
                        onChange={() => setThirdParty((p) => ({ ...p, dedicationType: opt.value }))}
                        className="w-4 h-4 accent-[#5AB678] border-2 border-[#5AB678] bg-transparent text-[#5AB678] focus:ring-[#5AB678] focus:ring-offset-0"
                      />
                      <span className="text-white text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <label className="block">
              <span className={labelClass}>Nom de la personne honorée</span>
              <input
                type="text"
                value={thirdParty.lastName}
                onChange={(e) => setThirdParty((p) => ({ ...p, lastName: e.target.value }))}
                className={inputClass}
                placeholder=""
              />
            </label>
            <label className="block">
              <span className={labelClass}>Prénoms de la personne honorée</span>
              <input
                type="text"
                value={thirdParty.firstName}
                onChange={(e) => setThirdParty((p) => ({ ...p, firstName: e.target.value }))}
                className={inputClass}
                placeholder="Exemple : Nadia Elise"
              />
            </label>
            <label className="block">
              <span className={labelClass}>Lien / relation <span className="text-white/50 font-normal">(Optionnel)</span></span>
              <div className="relative">
                <select
                  value={thirdParty.relationshipType}
                  onChange={(e) => setThirdParty((p) => ({ ...p, relationshipType: e.target.value }))}
                  className={`${inputClass} appearance-none pr-10`}
                >
                  {RELATIONSHIP_OPTIONS.map((opt) => (
                    <option key={opt.value || 'empty'} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
              </div>
            </label>
            <label className="block">
              <span className={labelClass}>Clé RIB</span>
              <input
                type="text"
                value={thirdParty.ribKey ?? ''}
                onChange={(e) => setThirdParty((p) => ({ ...p, ribKey: e.target.value || undefined }))}
                className={inputClass}
                placeholder="Exemple : 90"
              />
            </label>
            <label className="block">
              <span className={labelClass}>Message personnalisé <span className="text-white/50 font-normal">(Optionnel)</span></span>
              <textarea
                value={thirdParty.personalMessage}
                onChange={(e) => setThirdParty((p) => ({ ...p, personalMessage: e.target.value }))}
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder="Écrivez ici..."
              />
            </label>

            <div className="flex items-center justify-between pt-2">
              <span className="text-white/90 text-sm font-medium">Afficher mon nom sur le certificat</span>
              <button
                type="button"
                role="switch"
                aria-checked={showNameAriaChecked}
                aria-label="Afficher mon nom sur le certificat"
                title="Afficher mon nom sur le certificat"
                onClick={() => setThirdParty((p) => ({ ...p, showMyNameOnCertificate: !p.showMyNameOnCertificate }))}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[#5AB678] focus:ring-offset-2 focus:ring-offset-[#101919] ${
                  thirdParty.showMyNameOnCertificate ? 'bg-[#5AB678]' : 'bg-[#2a3a38]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                    thirdParty.showMyNameOnCertificate ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
          </div>
          <div className="flex-shrink-0 flex space-x-3 pt-4 mx-0 sm:mx-12 border-t border-white/10 mt-4">
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
              disabled={!thirdParty.firstName.trim() || !thirdParty.lastName.trim()}
              className="flex-1 bg-[#3AE1B4] text-[#101919] rounded-3xl p-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 flex items-center justify-center space-x-2"
            >
              <span>Suivant</span>
              <ChevronRight size={20} />
            </motion.button>
          </div>
        </div>
      );
    }

    const isConfirmationStep =
      (donationType === 'SELF' && currentStep === 3) || (donationType === 'THIRD_PARTY' && currentStep === 4);
    if (isConfirmationStep) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-white text-lg mb-2 font-bold">{confirmationTitle}</h3>
            <p className="text-white/60 text-sm">{confirmationDescription}</p>
          </div>
          <div className="bg-[#0F1F1F] rounded-3xl p-6 space-y-4 mx-0 sm:mx-12">
            <div className="flex flex-col justify-center items-center space-y-2">
              <span className="text-white text-xl font-bold">{recapTitle}</span>
              <span className="text-[#5ab678] font-bold text-3xl">
                {parseFloat(amount).toLocaleString('fr-FR')} F CFA
              </span>
              {donationType === 'THIRD_PARTY' && (
                <span className="text-white/80 text-sm">
                  Au nom de {thirdParty.firstName} {thirdParty.lastName}
                </span>
              )}
              <span className="text-white text-sm font-medium text-center">{recapMessage}</span>
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

    const isCodeStep =
      (donationType === 'SELF' && currentStep === 4) || (donationType === 'THIRD_PARTY' && currentStep === 5);
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
              Saisissez le code à 4 chiffres de votre portefeuille pour valider le don.
            </p>
          </div>
          <div className="mx-0 sm:mx-12 space-y-2">
            <label className="text-white text-sm font-medium block">Code de sécurité (4 chiffres)</label>
            <div className="flex justify-center gap-2">
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
              disabled={securityCode.length < 4 || isSubmitting || (!!accessToken && parseFloat(amount) > effectiveBalance)}
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
              className="bg-[#101919] rounded-none md:rounded-2xl w-full h-full max-w-4xl md:max-h-[90vh] overflow-hidden relative border-0 md:border border-white/10 flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 md:w-10 md:h-10 bg-[#5ab678] rounded-full flex items-center justify-center hover:bg-[#3AE1B4]/80 transition-colors z-10"
                aria-label="Fermer"
              >
                <X size={16} className="md:w-5 md:h-5 text-[#101919]" />
              </button>

              <div className="flex-1 flex flex-col md:flex-row min-h-0">
                {/* Stepper - Left Side */}
                <div className="hidden md:flex w-64 bg-[#0A1515] p-8 border-r border-white/10">
                  <div className="space-y-6">
                    {steps.map((step, index) => {
                      const isActive = currentStep === step.id;
                      const isCompleted = currentStep > step.id;
                      const isLast = index === steps.length - 1;

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
                      <div className="flex-1 min-h-0 flex flex-col">
                        {renderStepContent()}
                      </div>
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
