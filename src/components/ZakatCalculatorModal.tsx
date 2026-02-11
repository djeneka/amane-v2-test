'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { createZakat } from '@/services/zakat';

interface ZakatCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  /** JWT pour créer la zakat via l’API (si fourni, on appelle createZakat au lieu du localStorage) */
  accessToken?: string | null;
  /** Appelé après création réussie via l’API (toast + redirection côté page) */
  onSuccess?: () => void;
}

export interface SavedZakat {
  id: string;
  date: string;
  totalAssets: number;
  zakatAmount: number;
  remainingToPay: number;
}

const STEPS = [
  { id: 1, label: 'Or / Argent' },
  { id: 2, label: 'Épargne' },
  { id: 3, label: 'Biens commerciaux' },
  { id: 4, label: 'Dettes' },
  { id: 5, label: 'Confirmation' },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => currentYear - i);

/** Garde uniquement les chiffres (0-9) pour les champs montants. */
function onlyDigits(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

export default function ZakatCalculatorModal({ isOpen, onClose, onSave, accessToken, onSuccess }: ZakatCalculatorModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [hasGoldSilver, setHasGoldSilver] = useState<boolean | null>(null);
  const [unit, setUnit] = useState<'monetary' | 'weight' | null>(null);
  const [value, setValue] = useState('');
  const [hasSavings, setHasSavings] = useState<boolean | null>(null);
  const [savingsValue, setSavingsValue] = useState('');
  const [hasCommercialGoods, setHasCommercialGoods] = useState<boolean | null>(null);
  const [commercialGoodsValue, setCommercialGoodsValue] = useState('');
  const [hasDebts, setHasDebts] = useState<boolean | null>(null);
  const [debtsValue, setDebtsValue] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      setSelectedYear(currentYear);
      setHasGoldSilver(null);
      setUnit(null);
      setValue('');
      setHasSavings(null);
      setSavingsValue('');
      setHasCommercialGoods(null);
      setCommercialGoodsValue('');
      setHasDebts(null);
      setDebtsValue('');
      setSubmitError(null);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    const totalAssets = calculateTotalAssets();
    const zakatAmount = calculateZakat();

    if (accessToken) {
      setSubmitLoading(true);
      setSubmitError(null);
      const calculationDate = new Date(selectedYear, 0, 1).toISOString();
      createZakat(accessToken, {
        calculationDate,
        year: selectedYear,
        totalAmount: Math.round(totalAssets),
      })
        .then(() => {
          onSuccess?.();
          onSave?.();
          handleClose();
        })
        .catch((err) => {
          setSubmitError(err?.message ?? 'Impossible de créer la zakat');
        })
        .finally(() => {
          setSubmitLoading(false);
        });
      return;
    }

    const now = new Date();
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const savedZakat: SavedZakat = {
      id: Date.now().toString(),
      date: `${now.getDate()} ${months[now.getMonth()]}, ${now.getFullYear()}`,
      totalAssets,
      zakatAmount,
      remainingToPay: zakatAmount,
    };
    const savedZakats = localStorage.getItem('savedZakats');
    const zakats: SavedZakat[] = savedZakats ? JSON.parse(savedZakats) : [];
    zakats.unshift(savedZakat);
    localStorage.setItem('savedZakats', JSON.stringify(zakats));
    if (onSave) onSave();
    handleClose();
  };

  // Fonction pour formater les montants en F CFA
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculer le montant total des biens (somme de tous les biens - dettes)
  const calculateTotalAssets = () => {
    let total = 0;

    // Ajouter l'or/argent si présent
    if (hasGoldSilver === true && value) {
      total += parseFloat(value) || 0;
    }

    // Ajouter l'épargne si présente
    if (hasSavings === true && savingsValue) {
      total += parseFloat(savingsValue) || 0;
    }

    // Ajouter les biens commerciaux si présents
    if (hasCommercialGoods === true && commercialGoodsValue) {
      total += parseFloat(commercialGoodsValue) || 0;
    }

    // Soustraire les dettes si présentes
    if (hasDebts === true && debtsValue) {
      total -= parseFloat(debtsValue) || 0;
    }

    return Math.max(0, total); // S'assurer que le total n'est pas négatif
  };

  // Calculer la zakat (2,5% du montant total)
  const calculateZakat = () => {
    const totalAssets = calculateTotalAssets();
    return totalAssets * 0.025; // 2,5%
  };

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <div className="space-y-4 sm:space-y-6">
          {/* Année de calcul */}
          <div className="space-y-2">
            <label htmlFor="zakat-year" className="text-white font-bold text-base sm:text-lg">
              Année de calcul
            </label>
            <select
              id="zakat-year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full py-3 sm:py-4 px-4 rounded-xl bg-[#0A1515] border-2 border-[#8DD17F] text-white focus:outline-none focus:ring-2 focus:ring-[#8DD17F] text-sm sm:text-base"
              aria-label="Année de calcul de la zakat"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y} className="bg-[#101919] text-white">
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Question 1: Avez-vous de l'or / argent ? */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-white font-bold text-base sm:text-lg">Avez-vous de l'or / argent ?</h3>
            <div className="flex gap-3 sm:gap-4">
              <button
                onClick={() => setHasGoldSilver(true)}
                className={`flex-1 sm:w-fit py-2.5 sm:py-2 px-4 sm:px-6 rounded-3xl font-medium transition-all text-sm sm:text-base ${
                  hasGoldSilver === true
                    ? 'bg-[#43B48F] text-white'
                    : 'bg-[#1F2A28] text-gray-400 hover:bg-[#2A3A38]'
                }`}
              >
                <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                  {hasGoldSilver === true && (
                    <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#8DD17F]"></div>
                    </div>
                  )}
                  <span>Oui</span>
                </div>
              </button>
              <button
                onClick={() => setHasGoldSilver(false)}
                className={`flex-1 sm:w-fit py-2.5 sm:py-2 px-4 sm:px-4 rounded-3xl font-medium transition-all text-sm sm:text-base ${
                  hasGoldSilver === false
                    ? 'bg-[#43B48F] text-white'
                    : 'bg-[#1F2A28] text-gray-400 hover:bg-[#2A3A38]'
                }`}
              >
                <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                  {hasGoldSilver === false && (
                    <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#8DD17F]"></div>
                    </div>
                  )}
                  <span>Non</span>
                </div>
              </button>
            </div>
          </div>

          {/* Question 2: Unité de mesure (seulement si Oui) */}
          {hasGoldSilver === true && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 sm:space-y-4"
            >
              <h3 className="text-white font-bold text-base sm:text-lg">Unité de mesure</h3>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => setUnit('monetary')}
                  className={`w-full sm:w-fit py-3 sm:py-4 px-4 sm:px-6 rounded-3xl font-medium transition-all text-sm sm:text-base ${
                    unit === 'monetary'
                      ? 'bg-[#43B48F] text-white'
                      : 'bg-[#1F2A28] text-gray-400 hover:bg-[#2A3A38]'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                    {unit === 'monetary' && (
                      <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#8DD17F]"></div>
                      </div>
                    )}
                    <span className="whitespace-nowrap">Valeur monétaire</span>
                  </div>
                </button>
                <button
                  onClick={() => setUnit('weight')}
                  className={`w-full sm:w-fit py-3 sm:py-4 px-4 sm:px-6 rounded-3xl font-medium transition-all text-sm sm:text-base ${
                    unit === 'weight'
                      ? 'bg-[#43B48F] text-white'
                      : 'bg-[#1F2A28] text-gray-400 hover:bg-[#2A3A38]'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                    {unit === 'weight' && (
                      <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#8DD17F]"></div>
                      </div>
                    )}
                    <span>Poids</span>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* Champ de saisie (seulement si Oui et unité sélectionnée) */}
          {hasGoldSilver === true && unit && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <label className="text-white font-bold text-base sm:text-lg">
                Valeur de l'argent / or
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="zakat-value-input"
                  value={value}
                  onChange={(e) => setValue(onlyDigits(e.target.value))}
                  className="w-full py-3 sm:py-4 px-4 rounded-xl bg-[#0A1515] border-2 border-[#8DD17F] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8DD17F] text-sm sm:text-base pr-20 sm:pr-20"
                  placeholder="0"
                  aria-label="Valeur de l'argent ou de l'or"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm">
                  F CFA
                </span>
              </div>
            </motion.div>
          )}
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="space-y-4 sm:space-y-6">
          {/* Question: Avez-vous de l'épargne ? */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-white font-bold text-base sm:text-lg">Avez-vous de l'épargne ?</h3>
            <div className="flex gap-3 sm:gap-4">
              <button
                onClick={() => setHasSavings(true)}
                className={`flex-1 sm:w-fit py-2.5 sm:py-2 px-4 sm:px-6 rounded-3xl font-medium transition-all text-sm sm:text-base ${
                  hasSavings === true
                    ? 'bg-[#43B48F] text-white'
                    : 'bg-[#1F2A28] text-gray-400 hover:bg-[#2A3A38]'
                }`}
              >
                <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                  {hasSavings === true && (
                    <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#8DD17F]"></div>
                    </div>
                  )}
                  <span>Oui</span>
                </div>
              </button>
              <button
                onClick={() => setHasSavings(false)}
                className={`flex-1 sm:w-fit py-2.5 sm:py-2 px-4 sm:px-4 rounded-3xl font-medium transition-all text-sm sm:text-base ${
                  hasSavings === false
                    ? 'bg-[#43B48F] text-white'
                    : 'bg-[#1F2A28] text-gray-400 hover:bg-[#2A3A38]'
                }`}
              >
                <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                  {hasSavings === false && (
                    <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#8DD17F]"></div>
                    </div>
                  )}
                  <span>Non</span>
                </div>
              </button>
            </div>
          </div>

          {/* Champ de saisie (seulement si Oui) */}
          {hasSavings === true && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <label className="text-white font-bold text-base sm:text-lg">
                Valeur de l'épargne
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="savings-value-input"
                  value={savingsValue}
                  onChange={(e) => setSavingsValue(onlyDigits(e.target.value))}
                  className="w-full py-3 sm:py-4 px-4 rounded-xl bg-[#0A1515] border-2 border-[#8DD17F] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8DD17F] text-sm sm:text-base pr-20 sm:pr-20"
                  placeholder="0"
                  aria-label="Valeur de l'épargne"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm">
                  F CFA
                </span>
              </div>
            </motion.div>
          )}
        </div>
      );
    }

    if (currentStep === 3) {
      return (
        <div className="space-y-4 sm:space-y-6">
          {/* Question: Avez-vous des biens commerciaux ? */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-white font-bold text-base sm:text-lg">Avez-vous des biens commerciaux ?</h3>
            <div className="flex gap-3 sm:gap-4">
              <button
                onClick={() => setHasCommercialGoods(true)}
                className={`flex-1 sm:w-fit py-2.5 sm:py-2 px-4 sm:px-6 rounded-3xl font-medium transition-all text-sm sm:text-base ${
                  hasCommercialGoods === true
                    ? 'bg-[#43B48F] text-white'
                    : 'bg-[#1F2A28] text-gray-400 hover:bg-[#2A3A38]'
                }`}
              >
                <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                  {hasCommercialGoods === true && (
                    <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#8DD17F]"></div>
                    </div>
                  )}
                  <span>Oui</span>
                </div>
              </button>
              <button
                onClick={() => setHasCommercialGoods(false)}
                className={`flex-1 sm:w-fit py-2.5 sm:py-2 px-4 sm:px-4 rounded-3xl font-medium transition-all text-sm sm:text-base ${
                  hasCommercialGoods === false
                    ? 'bg-[#43B48F] text-white'
                    : 'bg-[#1F2A28] text-gray-400 hover:bg-[#2A3A38]'
                }`}
              >
                <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                  {hasCommercialGoods === false && (
                    <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#8DD17F]"></div>
                    </div>
                  )}
                  <span>Non</span>
                </div>
              </button>
            </div>
          </div>

          {/* Champ de saisie (seulement si Oui) */}
          {hasCommercialGoods === true && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <label className="text-white font-bold text-base sm:text-lg">
                Valeur du stock
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="commercial-goods-value-input"
                  value={commercialGoodsValue}
                  onChange={(e) => setCommercialGoodsValue(onlyDigits(e.target.value))}
                  className="w-full py-3 sm:py-4 px-4 rounded-xl bg-[#0A1515] border-2 border-[#8DD17F] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8DD17F] text-sm sm:text-base pr-20 sm:pr-20"
                  placeholder="0"
                  aria-label="Valeur du stock"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm">
                  F CFA
                </span>
              </div>
            </motion.div>
          )}
        </div>
      );
    }

    if (currentStep === 4) {
      return (
        <div className="space-y-4 sm:space-y-6">
          {/* Question: Avez-vous des dettes ou obligations à soustraire ? */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-white font-bold text-base sm:text-lg">Avez-vous des dettes ou obligations à soustraire ?</h3>
            <div className="flex gap-3 sm:gap-4">
              <button
                onClick={() => setHasDebts(true)}
                className={`flex-1 sm:w-fit py-2.5 sm:py-2 px-4 sm:px-6 rounded-3xl font-medium transition-all text-sm sm:text-base ${
                  hasDebts === true
                    ? 'bg-[#43B48F] text-white'
                    : 'bg-[#1F2A28] text-gray-400 hover:bg-[#2A3A38]'
                }`}
              >
                <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                  {hasDebts === true && (
                    <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#8DD17F]"></div>
                    </div>
                  )}
                  <span>Oui</span>
                </div>
              </button>
              <button
                onClick={() => setHasDebts(false)}
                className={`flex-1 sm:w-fit py-2.5 sm:py-2 px-4 sm:px-4 rounded-3xl font-medium transition-all text-sm sm:text-base ${
                  hasDebts === false
                    ? 'bg-[#43B48F] text-white'
                    : 'bg-[#1F2A28] text-gray-400 hover:bg-[#2A3A38]'
                }`}
              >
                <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                  {hasDebts === false && (
                    <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#8DD17F]"></div>
                    </div>
                  )}
                  <span>Non</span>
                </div>
              </button>
            </div>
          </div>

          {/* Champ de saisie (seulement si Oui) */}
          {hasDebts === true && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <label className="text-white font-bold text-base sm:text-lg">
                Valeur des dettes
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="debts-value-input"
                  value={debtsValue}
                  onChange={(e) => setDebtsValue(onlyDigits(e.target.value))}
                  className="w-full py-3 sm:py-4 px-4 rounded-xl bg-[#0A1515] border-2 border-[#8DD17F] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8DD17F] text-sm sm:text-base pr-20 sm:pr-20"
                  placeholder="0"
                  aria-label="Valeur des dettes"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm">
                  F CFA
                </span>
              </div>
            </motion.div>
          )}
        </div>
      );
    }

    if (currentStep === 5) {
      const totalAssets = calculateTotalAssets();
      const zakatAmount = calculateZakat();

      return (
        <div className="space-y-3 sm:space-y-4">
          {submitError && (
            <p className="text-red-400 text-sm bg-red-400/10 rounded-lg p-3" role="alert">
              {submitError}
            </p>
          )}
          {/* Montant total des biens */}
          <div className="bg-[#101919] rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
              <span className="text-white font-medium text-sm sm:text-lg">
                Montant total des biens
              </span>
              <div className="text-left sm:text-right">
                <span className="text-white font-bold text-base sm:text-lg">
                  {formatAmount(totalAssets)}
                </span>
                <span className="text-white ml-2 text-sm sm:text-base">F CFA</span>
              </div>
            </div>
          </div>

          {/* Zakat à payer */}
          <div className="bg-[#101919] rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
              <span className="text-white font-medium text-sm sm:text-lg">
                Zakat à payer
              </span>
              <div className="text-left sm:text-right">
                <span 
                  className="font-bold text-base sm:text-lg"
                  style={{ color: '#8DD17F' }}
                >
                  {formatAmount(zakatAmount)}
                </span>
                <span className="text-white ml-2 text-sm sm:text-base">F CFA</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Pour les autres étapes (à implémenter plus tard)
    return (
      <div className="space-y-6">
        <h3 className="text-white font-bold text-lg">
          Étape {currentStep} - {STEPS[currentStep - 1].label}
        </h3>
        <p className="text-gray-400">Contenu à venir...</p>
      </div>
    );
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
            className="fixed inset-0 bg-[#101919]/20 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#101919] rounded-none sm:rounded-2xl w-full h-full sm:h-auto sm:max-w-5xl sm:max-h-[90vh] overflow-hidden relative border-0 sm:border border-white/10 flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 bg-[#8DD17F] rounded-full flex items-center justify-center hover:bg-[#7BC16F] transition-colors z-10"
                aria-label="Fermer"
              >
                <X size={18} className="sm:w-5 sm:h-5 text-[#101919]" />
              </button>

              <div className="flex flex-col sm:flex-row h-full">
                {/* Barre latérale gauche - Étapes (cachée sur mobile) */}
                <div className="hidden sm:block w-full sm:w-1/4 bg-[#0A1515] border-r border-white/10 p-4 sm:p-6">
                  <div className="space-y-6">
                    {STEPS.map((step, index) => {
                      const isActive = currentStep === step.id;
                      const isCompleted = currentStep > step.id;
                      
                      return (
                        <div key={step.id} className="relative">
                          {/* Ligne de connexion */}
                          {index < STEPS.length - 1 && (
                            <div
                              className="absolute left-4 top-12 h-12"
                              style={{
                                width: '2px',
                                borderLeft: `2px dashed ${isCompleted || isActive ? '#8DD17F' : '#4B5563'}`,
                              }}
                            />
                          )}
                          
                          {/* Cercle de l'étape */}
                          <div className={`flex items-start space-x-4 ${isActive ? 'bg-[#1A2A28] rounded-lg p-2 -mx-2' : ''}`}>
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                                isActive
                                  ? 'bg-[#8DD17F] text-[#101919]'
                                  : isCompleted
                                  ? 'bg-[#8DD17F] text-[#101919]'
                                  : 'bg-gray-600 text-gray-400'
                              }`}
                            >
                              {step.id}
                            </div>
                            <div className="flex-1">
                              <p
                                className={`font-medium text-sm sm:text-base ${
                                  isActive
                                    ? 'text-white font-bold'
                                    : isCompleted
                                    ? 'text-white'
                                    : 'text-gray-400'
                                }`}
                              >
                                {step.label}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section principale - Contenu */}
                <div className="flex-1 flex flex-col min-h-0">
                  {/* En-tête */}
                  <div className="p-4 sm:p-8 border-b border-white/10">
                    <h2 className="text-white font-bold text-xl sm:text-2xl mb-2">
                      Calculer ma Zakat
                    </h2>
                    <p className="text-white font-medium mb-1 text-sm sm:text-base">Mode de paiement</p>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      Calculez et archivez vos obligations annuelle
                    </p>
                    
                    {/* Indicateur d'étapes mobile */}
                    <div className="sm:hidden mt-4 flex items-center justify-between">
                      {STEPS.map((step, index) => {
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;
                        
                        return (
                          <div key={step.id} className="flex items-center flex-1">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                                isActive
                                  ? 'bg-[#8DD17F] text-[#101919]'
                                  : isCompleted
                                  ? 'bg-[#8DD17F] text-[#101919]'
                                  : 'bg-gray-600 text-gray-400'
                              }`}
                            >
                              {step.id}
                            </div>
                            {index < STEPS.length - 1 && (
                              <div
                                className="flex-1 h-0.5 mx-2"
                                style={{
                                  backgroundColor: isCompleted ? '#8DD17F' : '#4B5563',
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Contenu de l'étape */}
                  <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
                    <div className="bg-[#00644d]/10 rounded-xl sm:rounded-2xl p-4 sm:p-8">
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

                  {/* Boutons d'action */}
                  <div className="p-4 sm:p-8 border-t border-white/10 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:mx-6">
                    <button
                      onClick={handleClose}
                      className="w-full sm:flex-1 py-3 sm:py-4 px-6 rounded-3xl bg-[#1F2A28] text-white font-medium hover:bg-[#2A3A38] transition-colors text-sm sm:text-base"
                    >
                      Quitter
                    </button>
                    <button
                      onClick={currentStep === STEPS.length ? handleSave : handleNext}
                      disabled={
                        submitLoading ||
                        currentStep === 1 && (hasGoldSilver === null || (hasGoldSilver === true && (!unit || !value))) ||
                        currentStep === 2 && (hasSavings === null || (hasSavings === true && !savingsValue)) ||
                        currentStep === 3 && (hasCommercialGoods === null || (hasCommercialGoods === true && !commercialGoodsValue)) ||
                        currentStep === 4 && (hasDebts === null || (hasDebts === true && !debtsValue))
                      }
                      className="w-full sm:flex-1 py-3 sm:py-4 px-6 rounded-3xl text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                      style={{
                        background: 'linear-gradient(90deg, #8FC99E 0%, #20B6B3 100%)'
                      }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.background = 'linear-gradient(90deg, #7BC16F 0%, #1BA5A2 100%)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.background = 'linear-gradient(90deg, #8FC99E 0%, #20B6B3 100%)';
                        }
                      }}
                    >
                      <span>
                        {currentStep === STEPS.length
                          ? submitLoading
                            ? 'Création...'
                            : 'Sauvegarder'
                          : 'Suivant'}
                      </span>
                      {currentStep !== STEPS.length && <ChevronRight size={18} className="sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
