'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Smartphone, Building2, CreditCard, User, Check, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface MakeDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMethod = 'mobile-money' | 'bank-transfer' | 'card-wallet' | null;
type Operator = 'orange' | 'wave' | 'moov' | null;

const STEPS = [
  { id: 1, label: "Informations de base", icon: "/icons/image 33(1).png" },
  { id: 2, label: "Choix de l'opérateur", icon: "/icons/image 34.png" },
  { id: 3, label: "Numéro de dépôt", icon: "/icons/image 35(1).png" },
  { id: 4, label: "Montant", icon: "/icons/image 36.png" },
  { id: 5, label: "Confirmation", icon: null },
];

export default function MakeDepositModal({ isOpen, onClose }: MakeDepositModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(null);
  const [selectedOperator, setSelectedOperator] = useState<Operator>(null);
  const [depositNumber, setDepositNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [useMyNumber, setUseMyNumber] = useState(false);
  const [payFees, setPayFees] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Numéro par défaut de l'utilisateur
  const userPhoneNumber = user?.phone || '+225 01 23 45 67 89';
  
  // Montants prédéfinis
  const defaultAmounts = [10000, 50000, 100000];
  
  // Calcul des frais (1%)
  const transactionFee = amount ? Math.round(parseFloat(amount) * 0.01) : 0;
  const totalAmount = amount ? (payFees ? parseFloat(amount) + transactionFee : parseFloat(amount)) : 0;

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
    }
  }, [isOpen]);

  // Mettre à jour le numéro quand on sélectionne "Mon numéro"
  useEffect(() => {
    if (useMyNumber) {
      setDepositNumber(userPhoneNumber.replace(/\s/g, '').replace('+225', ''));
    }
  }, [useMyNumber, userPhoneNumber]);

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
    setTimeout(() => setCurrentStep(3), 300);
  };

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

  const handleSubmit = () => {
    // Logique de soumission
    console.log('Dépôt:', {
      paymentMethod: selectedPaymentMethod,
      operator: selectedOperator,
      depositNumber,
      amount,
    });
    // Afficher l'écran de succès
    setIsSuccess(true);
  };

  const handleViewHistory = () => {
    // Rediriger vers l'historique des transactions
    // Pour l'instant, on ferme juste le modal
    onClose();
    // TODO: Rediriger vers la page d'historique
    router.push('/transactions');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-white text-2xl font-bold mb-8 text-left">Déposer de l'argent</h2>
              <h3 className="text-white text-lg mb-2">Mode de paiement</h3>
              <p className="text-white/60 text-sm">Veuillez sélectionner un mode de paiement.</p>
            </div>
            
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
                    {/* <Smartphone className="text-[#5AB678]" size={24} /> */}
                    <Image src="/icons/mobile-coin(1).png" alt="Mobile money" width={24} height={24} />
                  </div>
                  <span className="text-white font-medium">Mobile money</span>
                </div>
                <ChevronRight className="text-[#5AB678]" size={20} />
              </motion.button>

              {/* Virement bancaire */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePaymentMethodSelect('bank-transfer')}
                className="w-full bg-[#101919] hover:bg-[#101919]/80 rounded-xl p-4 flex items-center justify-between transition-colors border border-transparent hover:border-[#5AB678]/30"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-[#0F1F1F] flex items-center justify-center">
                    {/* <Building2 className="text-[#5AB678]" size={24} /> */}
                    <Image src="/icons/bank.png" alt="Virement bancaire" width={24} height={24} />
                  </div>
                  <span className="text-white font-medium">Virement bancaire</span>
                </div>
                <ChevronRight className="text-[#5AB678]" size={20} />
              </motion.button>

              {/* Carte de débit ou wallet */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePaymentMethodSelect('card-wallet')}
                className="w-full bg-[#101919] hover:bg-[#101919]/80 rounded-xl p-4 flex items-center justify-between transition-colors border border-transparent hover:border-[#5AB678]/30"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-[#0F1F1F] flex items-center justify-center">
                    {/* <CreditCard className="text-[#5AB678]" size={24} /> */}
                    <Image src="/icons/credit-card-g.png" alt="Carte de débit ou wallet" width={24} height={24} />
                  </div>
                  <span className="text-white font-medium">Carte de débit ou wallet</span>
                </div>
                <ChevronRight className="text-[#5AB678]" size={20} />
              </motion.button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-white text-lg mb-2">Choix de l'opérateur</h3>
              <p className="text-white/60 text-sm">Sélectionnez votre opérateur mobile money.</p>
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

            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                className="flex-1 bg-[#101919] text-white rounded-xl p-3 md:p-4 font-semibold hover:bg-[#101919]/80 transition-colors border border-white/10 text-sm md:text-base"
              >
                Précédent
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
          : selectedOperator === 'moov'
          ? { name: 'Moov', icon: '/icons/image 36.png' }
          : { name: '', icon: '' };

        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-white text-lg mb-2">Numéro de dépôt</h3>
              <p className="text-white/60 text-sm">Veuillez saisir le numéro de dépôt</p>
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
                  <span className="text-white font-medium">Mon numéro</span>
                  <span className="text-white/60 text-sm">{userPhoneNumber}</span>
                </div>
              </div>
              <ChevronRight className="text-[#5AB678]" size={20} />
            </motion.button>

            {/* Séparateur */}
            <div className="flex items-center justify-center my-4">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="px-4 text-white/60 text-sm">Ou saisir un autre numéro</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            {/* Champ de saisie */}
            <div>
              <label className="block text-white/60 text-sm mb-2">Numéro {operatorInfo.name}</label>
              <div className="relative">
                <div className="flex items-center bg-[#101919] border border-white/10 rounded-xl p-4 focus-within:border-[#5AB678] transition-colors">
                  <Image 
                    src="/images/civ.png" 
                    alt="Côte d'Ivoire" 
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
                    placeholder="Ex: 0123456789"
                    className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Boutons de navigation */}
            <div className="flex space-x-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                className="flex-1 bg-[#101919] text-white rounded-xl p-4 font-semibold hover:bg-[#1A2A2A]/80 transition-colors border border-white/10 flex items-center justify-center space-x-2"
              >
                <ChevronLeft size={20} />
                <span>Précédent</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                disabled={!depositNumber.trim()}
                className="flex-1 bg-gradient-to-r from-[#8fc99e] to-[#20b6b3] text-white rounded-xl p-3 md:p-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 text-sm md:text-base"
              >
                <span>Suivant</span>
                <ChevronRight size={18} className="md:w-5 md:h-5" />
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
          : selectedOperator === 'moov'
          ? { name: 'Moov', icon: '/icons/image 36.png' }
          : { name: '', icon: '' };

        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-white text-lg mb-2">Montant</h3>
              <p className="text-white/60 text-sm">Entrez le montant que vous souhaitez déposer.</p>
            </div>
            {/* En-tête de l'opérateur */}
            {selectedOperator && (
              <div className="flex flex-col items-center py-4 mx-4 md:mx-8">
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
            <div className="bg-gradient-to-r from-[#101919] to-[#0F1F1F] rounded-xl p-4 md:p-6 mx-4 md:mx-12">
              <h3 className="text-white text-lg mb-4 text-center">Montant du dépôt</h3>
              
              {/* Champ de saisie du montant */}
              <div className="mb-4 relative">
                <div className="text-white text-2xl md:text-4xl font-bold min-h-[48px] flex items-center justify-center mb-2">
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
                  className="w-full bg-[#0F1F1F] text-white text-base font-normal placeholder-white/40 focus:outline-none border border-white/10 rounded-lg p-3 focus:border-[#5AB678] transition-colors"
                />
              </div>

              {/* Texte "Ou choisissez un montant par défaut" */}
              <p className="text-white/60 text-sm mb-4 text-center">Ou choisissez un montant par défaut</p>

              {/* Boutons de montants prédéfinis */}
              <div className="flex space-x-3 justify-center">
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
            <div className="bg-[#101919] rounded-xl p-4 md:p-6 mx-4 md:mx-12">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Frais d'opération (1%):</span>
                <span className="text-white font-semibold">
                  {transactionFee > 0 ? `${transactionFee.toLocaleString('fr-FR')} FCFA` : '0 FCFA'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Montant total :</span>
                <span className="text-white font-semibold">
                  {totalAmount > 0 ? `${totalAmount.toLocaleString('fr-FR')} FCFA` : '0 FCFA'}
                </span>
              </div>
              
              {/* Toggle "Payer les frais" */}
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <span className="text-white">Payer les frais</span>
                <button
                  onClick={() => setPayFees(!payFees)}
                  aria-label={payFees ? 'Désactiver le paiement des frais' : 'Activer le paiement des frais'}
                  title={payFees ? 'Désactiver le paiement des frais' : 'Activer le paiement des frais'}
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

            {/* Boutons de navigation */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                className="flex-1 bg-[#101919] text-white rounded-xl p-3 md:p-4 font-semibold hover:bg-[#101919]/80 transition-colors border border-white/10 flex items-center justify-center space-x-2 text-sm md:text-base"
              >
                <ChevronLeft size={18} className="md:w-5 md:h-5" />
                <span>Précédent</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                disabled={!amount || parseFloat(amount) <= 0}
                className="flex-1 bg-gradient-to-r from-[#8fc99e] to-[#20b6b3] text-white rounded-xl p-3 md:p-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 text-sm md:text-base"
              >
                <span>Suivant</span>
                <ChevronRight size={18} className="md:w-5 md:h-5" />
              </motion.button>
            </div>
          </div>
        );

      case 5:
        // Afficher l'écran de succès si la confirmation a été effectuée
        if (isSuccess) {
          return (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              {/* Icône de succès */}
              <div className="rounded-full bg-[#5AB678] border-2 border-[#5AB678]/80 flex items-center justify-center">
                <Image src="/icons/valid-circle.png" alt="Succès" width={48} height={48} className="object-contain" />
              </div>

              {/* Titre */}
              <h2 className="text-white text-3xl font-bold text-center">Succès</h2>

              {/* Message de confirmation */}
              <p className="text-white text-center text-lg">
                Votre dépôt a été créé avec succès.
              </p>

              {/* Instruction */}
              <p className="text-white/60 text-center text-sm max-w-md">
                Veuillez cliquer sur le bouton ci-dessous pour consulter l'historique.
              </p>

              {/* Bouton Consulter l'historique */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleViewHistory}
                className="bg-gradient-to-r from-[#8fc99e] to-[#20b6b3] text-white rounded-2xl px-8 py-4 font-semibold hover:opacity-90 transition-opacity mt-4"
              >
                Consulter l'historique
              </motion.button>
            </div>
          );
        }

        // Sinon, afficher le formulaire de confirmation
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-white text-lg mb-2">Confirmation</h3>
              <p className="text-white/60 text-sm">Vérifiez les informations avant de confirmer.</p>
            </div>
            
            <div className="bg-[#00644d]/10 rounded-xl p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-white/60">Mode de paiement:</span>
                <span className="text-white font-medium">
                  {selectedPaymentMethod === 'mobile-money' && 'Mobile money'}
                  {selectedPaymentMethod === 'bank-transfer' && 'Virement bancaire'}
                  {selectedPaymentMethod === 'card-wallet' && 'Carte de débit ou wallet'}
                </span>
              </div>
              {selectedOperator && (
                <div className="flex justify-between">
                  <span className="text-white/60">Opérateur:</span>
                  <span className="text-white font-medium capitalize">{selectedOperator}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-white/60">Numéro:</span>
                <span className="text-white font-medium">{depositNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Montant:</span>
                <span className="text-white font-medium">{parseFloat(amount).toLocaleString('fr-FR')} F CFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Frais d'opération (1%):</span>
                <span className="text-white font-semibold">
                  {transactionFee > 0 ? `${transactionFee.toLocaleString('fr-FR')} FCFA` : '0 FCFA'}
                </span>
              </div>
            </div>
            <div className="bg-[#00644d]/10 rounded-xl p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-white/60">Montant total:</span>
                <span className="text-white font-semibold">
                  {totalAmount > 0 ? `${totalAmount.toLocaleString('fr-FR')} FCFA` : '0 FCFA'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                className="flex-1 bg-[#101919] text-white rounded-xl p-3 md:p-4 font-semibold hover:bg-[#1a2a2a]/80 transition-colors border border-white/10 flex items-center justify-center space-x-2 text-sm md:text-base"
              >
                <ChevronLeft size={18} className="md:w-5 md:h-5" />
                <span>Précédent</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-[#8fc99e] to-[#20b6b3] text-white rounded-xl p-3 md:p-4 font-semibold hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 text-sm md:text-base"
              >
                <span>Confirmer</span>
                <ChevronRight size={18} className="md:w-5 md:h-5" />
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
                aria-label="Fermer"
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
                            {step.label.split(' ')[0]}
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
                              {step.label}
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
        </>
      )}
    </AnimatePresence>
  );
}
