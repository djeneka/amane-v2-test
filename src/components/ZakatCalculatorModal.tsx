'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';

interface ZakatCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void; // Callback appelé après sauvegarde
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

export default function ZakatCalculatorModal({ isOpen, onClose, onSave }: ZakatCalculatorModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [hasGoldSilver, setHasGoldSilver] = useState<boolean | null>(null);
  const [unit, setUnit] = useState<'monetary' | 'weight' | null>(null);
  const [value, setValue] = useState('');
  const [hasSavings, setHasSavings] = useState<boolean | null>(null);
  const [savingsValue, setSavingsValue] = useState('');
  const [hasCommercialGoods, setHasCommercialGoods] = useState<boolean | null>(null);
  const [commercialGoodsValue, setCommercialGoodsValue] = useState('');
  const [hasDebts, setHasDebts] = useState<boolean | null>(null);
  const [debtsValue, setDebtsValue] = useState('');

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
      setHasGoldSilver(null);
      setUnit(null);
      setValue('');
      setHasSavings(null);
      setSavingsValue('');
      setHasCommercialGoods(null);
      setCommercialGoodsValue('');
      setHasDebts(null);
      setDebtsValue('');
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
    
    const now = new Date();
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    const savedZakat: SavedZakat = {
      id: Date.now().toString(),
      date: `${now.getDate()} ${months[now.getMonth()]}, ${now.getFullYear()}`,
      totalAssets,
      zakatAmount,
      remainingToPay: zakatAmount, // Par défaut, tout reste à payer
    };

    // Charger les zakat existantes
    const savedZakats = localStorage.getItem('savedZakats');
    const zakats: SavedZakat[] = savedZakats ? JSON.parse(savedZakats) : [];
    
    // Ajouter la nouvelle zakat
    zakats.unshift(savedZakat); // Ajouter au début
    
    // Sauvegarder dans localStorage
    localStorage.setItem('savedZakats', JSON.stringify(zakats));
    
    // Appeler le callback si fourni
    if (onSave) {
      onSave();
    }
    
    // Fermer le modal
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
        <div className="space-y-6">
          {/* Question 1: Avez-vous de l'or / argent ? */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg">Avez-vous de l'or / argent ?</h3>
            <div className="flex gap-4">
              <button
                onClick={() => setHasGoldSilver(true)}
                className={`w-fit py-2 px-6 rounded-3xl font-medium transition-all ${
                  hasGoldSilver === true
                    ? 'bg-[#43B48F] text-white'
                    : 'bg-[#1F2A28] text-gray-400 hover:bg-[#2A3A38]'
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
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
                className={`w-fit py-2 px-4 rounded-3xl font-medium transition-all ${
                  hasGoldSilver === false
                    ? 'bg-[#43B48F] text-white'
                    : 'bg-[#1F2A28] text-gray-400 hover:bg-[#2A3A38]'
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
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
              className="space-y-4"
            >
              <h3 className="text-white font-bold text-lg">Unité de mesure</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => setUnit('monetary')}
                  className={`w-fit py-4 px-6 rounded-3xl font-medium transition-all ${
                    unit === 'monetary'
                      ? 'bg-[#43B48F] text-white'
                      : 'bg-[#1F2A28] text-gray-400 hover:bg-[#2A3A38]'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-3">
                    {unit === 'monetary' && (
                      <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#8DD17F]"></div>
                      </div>
                    )}
                    <span>Valeur monétaire</span>
                  </div>
                </button>
                <button
                  onClick={() => setUnit('weight')}
                  className={`w-fit py-4 px-6 rounded-3xl font-medium transition-all ${
                    unit === 'weight'
                      ? 'bg-[#43B48F] text-white'
                      : 'bg-[#1F2A28] text-gray-400 hover:bg-[#2A3A38]'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-3">
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
              <label className="text-white font-bold text-lg">
                Valeur de l'argent / or
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="zakat-value-input"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full py-4 px-4 rounded-xl bg-[#0A1515] border-2 border-[#8DD17F] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8DD17F]"
                  placeholder="0"
                  aria-label="Valeur de l'argent ou de l'or"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
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
        <div className="space-y-6">
          {/* Question: Avez-vous de l'épargne ? */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg">Avez-vous de l'épargne ?</h3>
            <div className="flex gap-4">
              <button
                onClick={() => setHasSavings(true)}
                className={`w-fit py-2 px-6 rounded-3xl font-medium transition-all ${
                  hasSavings === true
                    ? 'bg-[#43B48F] text-white'
                    : 'bg-[#1F2A28] text-gray-400 hover:bg-[#2A3A38]'
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
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
                className={`w-fit py-2 px-4 rounded-3xl font-medium transition-all ${
                  hasSavings === false
                    ? 'bg-[#43B48F] text-white'
                    : 'bg-[#1F2A28] text-gray-400 hover:bg-[#2A3A38]'
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
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
              <label className="text-white font-bold text-lg">
                Valeur de l'épargne
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="savings-value-input"
                  value={savingsValue}
                  onChange={(e) => setSavingsValue(e.target.value)}
                  className="w-full py-4 px-4 rounded-xl bg-[#0A1515] border-2 border-[#8DD17F] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8DD17F]"
                  placeholder="0"
                  aria-label="Valeur de l'épargne"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
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
        <div className="space-y-6">
          {/* Question: Avez-vous des biens commerciaux ? */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg">Avez-vous des biens commerciaux ?</h3>
            <div className="flex gap-4">
              <button
                onClick={() => setHasCommercialGoods(true)}
                className={`w-fit py-2 px-6 rounded-3xl font-medium transition-all ${
                  hasCommercialGoods === true
                    ? 'bg-[#43B48F] text-white'
                    : 'bg-[#1F2A28] text-gray-400 hover:bg-[#2A3A38]'
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
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
                className={`w-fit py-2 px-4 rounded-3xl font-medium transition-all ${
                  hasCommercialGoods === false
                    ? 'bg-[#43B48F] text-white'
                    : 'bg-[#1F2A28] text-gray-400 hover:bg-[#2A3A38]'
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
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
              <label className="text-white font-bold text-lg">
                Valeur du stock
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="commercial-goods-value-input"
                  value={commercialGoodsValue}
                  onChange={(e) => setCommercialGoodsValue(e.target.value)}
                  className="w-full py-4 px-4 rounded-xl bg-[#0A1515] border-2 border-[#8DD17F] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8DD17F]"
                  placeholder="0"
                  aria-label="Valeur du stock"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
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
        <div className="space-y-6">
          {/* Question: Avez-vous des dettes ou obligations à soustraire ? */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg">Avez-vous des dettes ou obligations à soustraire ?</h3>
            <div className="flex gap-4">
              <button
                onClick={() => setHasDebts(true)}
                className={`w-fit py-2 px-6 rounded-3xl font-medium transition-all ${
                  hasDebts === true
                    ? 'bg-[#43B48F] text-white'
                    : 'bg-[#1F2A28] text-gray-400 hover:bg-[#2A3A38]'
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
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
                className={`w-fit py-2 px-4 rounded-3xl font-medium transition-all ${
                  hasDebts === false
                    ? 'bg-[#43B48F] text-white'
                    : 'bg-[#1F2A28] text-gray-400 hover:bg-[#2A3A38]'
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
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
              <label className="text-white font-bold text-lg">
                Valeur des dettes
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="debts-value-input"
                  value={debtsValue}
                  onChange={(e) => setDebtsValue(e.target.value)}
                  className="w-full py-4 px-4 rounded-xl bg-[#0A1515] border-2 border-[#8DD17F] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8DD17F]"
                  placeholder="0"
                  aria-label="Valeur des dettes"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
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
        <div className="space-y-4">
          {/* Montant total des biens */}
          <div className="bg-[#101919] rounded-xl p-6">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium text-lg">
                Montant total des biens
              </span>
              <div className="text-right">
                <span className="text-white font-bold text-lg">
                  {formatAmount(totalAssets)}
                </span>
                <span className="text-white ml-2">F CFA</span>
              </div>
            </div>
          </div>

          {/* Zakat à payer */}
          <div className="bg-[#101919] rounded-xl p-6">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium text-lg">
                Zakat à payer
              </span>
              <div className="text-right">
                <span 
                  className="font-bold text-lg"
                  style={{ color: '#8DD17F' }}
                >
                  {formatAmount(zakatAmount)}
                </span>
                <span className="text-white ml-2">F CFA</span>
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
            className="fixed inset-0 bg-[#101919]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#101919] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden relative border border-white/10"
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 w-10 h-10 bg-[#8DD17F] rounded-full flex items-center justify-center hover:bg-[#7BC16F] transition-colors z-10"
                aria-label="Fermer"
              >
                <X size={20} className="text-[#101919]" />
              </button>

              <div className="flex h-full">
                {/* Barre latérale gauche - Étapes */}
                <div className="w-1/4 bg-[#0A1515] border-r border-white/10 p-6">
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
                                className={`font-medium ${
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
                <div className="flex-1 flex flex-col">
                  {/* En-tête */}
                  <div className="p-8 border-b border-white/10">
                    <h2 className="text-white font-bold text-2xl mb-2">
                      Calculer ma Zakat
                    </h2>
                    <p className="text-white font-medium mb-1">Mode de paiement</p>
                    <p className="text-gray-400 text-sm">
                      Calculez et archivez vos obligations annuelle
                    </p>
                  </div>

                  {/* Contenu de l'étape */}
                  <div className="flex-1 p-8 overflow-y-auto">
                    <div className="bg-[#00644d]/10 rounded-2xl p-8">
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
                  <div className="p-8 border-t border-white/10 flex gap-4 mx-6">
                    <button
                      onClick={handleClose}
                      className="flex-1 py-4 px-6 rounded-3xl bg-[#1F2A28] text-white font-medium hover:bg-[#2A3A38] transition-colors"
                    >
                      Quitter
                    </button>
                    <button
                      onClick={currentStep === STEPS.length ? handleSave : handleNext}
                      disabled={
                        currentStep === 1 && (hasGoldSilver === null || (hasGoldSilver === true && (!unit || !value))) ||
                        currentStep === 2 && (hasSavings === null || (hasSavings === true && !savingsValue)) ||
                        currentStep === 3 && (hasCommercialGoods === null || (hasCommercialGoods === true && !commercialGoodsValue)) ||
                        currentStep === 4 && (hasDebts === null || (hasDebts === true && !debtsValue))
                      }
                      className="flex-1 py-4 px-6 rounded-3xl text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
                      <span>{currentStep === STEPS.length ? 'Sauvegarder' : 'Suivant'}</span>
                      {currentStep !== STEPS.length && <ChevronRight size={20} />}
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
