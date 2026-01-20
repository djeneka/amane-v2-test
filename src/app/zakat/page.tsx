'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Info, Trash2, HandCoins, Apple, Play } from 'lucide-react';
import Image from 'next/image';
import ZakatCalculatorModal, { SavedZakat } from '@/components/ZakatCalculatorModal';
import MakeDonationModal from '@/components/MakeDonationModal';

// Composant pour l'icône personnalisée de la main tenant une bourse avec "2,5"
const ZakatIcon = () => {
  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main - forme simplifiée de main ouverte */}
      <path
        d="M18 18 L18 25 L16 28 L16 32 L18 35 L20 38 L24 40 L28 38 L30 35 L32 32 L32 28 L30 25 L30 18 L28 16 L24 16 L20 18 Z"
        fill="white"
      />
      {/* Doigts - forme simplifiée */}
      <ellipse
        cx="20"
        cy="15"
        rx="2"
        ry="3"
        fill="white"
      />
      <ellipse
        cx="24"
        cy="14"
        rx="2"
        ry="3"
        fill="white"
      />
      <ellipse
        cx="28"
        cy="15"
        rx="2"
        ry="3"
        fill="white"
      />
      {/* Bourse - forme de sac arrondi */}
      <ellipse
        cx="30"
        cy="42"
        rx="9"
        ry="11"
        fill="white"
      />
      {/* Ouverture du sac (ligne courbe en haut) */}
      <path
        d="M21 42 Q30 38 39 42"
        stroke="white"
        strokeWidth="2.5"
        fill="none"
      />
      {/* Texte "2,5" sur la bourse */}
      <text
        x="30"
        y="45"
        fontSize="11"
        fontWeight="bold"
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
      >
        2,5
      </text>
    </svg>
  );
};

export default function ZakatPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedZakats, setSavedZakats] = useState<SavedZakat[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [zakatAmountToPay, setZakatAmountToPay] = useState<number | undefined>(undefined);

  // Charger les zakat sauvegardées
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('savedZakats');
    if (saved) {
      try {
        setSavedZakats(JSON.parse(saved));
      } catch (error) {
        console.error('Erreur lors du chargement des zakat:', error);
      }
    }
  }, []);

  // Recharger les zakat après sauvegarde
  const handleZakatSaved = () => {
    const saved = localStorage.getItem('savedZakats');
    if (saved) {
      try {
        setSavedZakats(JSON.parse(saved));
      } catch (error) {
        console.error('Erreur lors du chargement des zakat:', error);
      }
    }
  };

  // Supprimer une zakat
  const handleDeleteZakat = (id: string) => {
    const updated = savedZakats.filter(z => z.id !== id);
    setSavedZakats(updated);
    localStorage.setItem('savedZakats', JSON.stringify(updated));
  };

  // Formater les montants
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <div 
        className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
        style={{ 
          background: 'linear-gradient(to left, #101919, #00644D)' 
        }}
      >
        <div className="max-w-2xl w-full text-center space-y-8">
        {/* Icône principale */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-6"
        >
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl"
            style={{ backgroundColor: '#8DD17F' }}
          >
            <Image src="/images/Image(10).png" alt="Zakat" width={100} height={100} />
          </div>
        </motion.div>

        {/* Titre */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
        >
          Calculateur de{' '}
          <span style={{ color: '#8DD17F' }}>Zakat</span>
        </motion.h1>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-2 text-white text-lg md:text-xl mb-8"
        >
          <p>Calculez facilement votre zakat annuelle selon les principes islamiques.</p>
          <p>Purifiez vos biens et aidez les nécessiteux.</p>
        </motion.div>

        {/* Bouton "Calculer Ma Zakat" */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="w-full max-w-md mx-auto py-4 px-8 rounded-2xl text-white font-bold text-lg md:text-xl flex items-center justify-center space-x-3 shadow-xl"
          style={{
            background: 'linear-gradient(90deg, #8DD17F 0%, #37C2B4 100%)'
          }}
        >
          <Calculator size={24} />
          <span>Calculer Ma Zakat</span>
        </motion.button>

        {/* Section Liste des zakat ou Aucune archive */}
        {mounted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 w-full max-w-2xl mx-auto"
          >
            {savedZakats.length > 0 ? (
              <div className="space-y-6">
                {/* Titre */}
                <h2 
                  className="text-xl font-bold mb-6 text-white text-left"
                >
                  Liste de mes calculs de zakat
                </h2>

                {/* Liste des zakat */}
                <div className="space-y-4">
                  {savedZakats.map((zakat) => (
                    <motion.div
                      key={zakat.id}
                      className="bg-[#1A2A28] rounded-2xl p-6 space-y-4"
                    >
                      {/* Header avec icône et date */}
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                          <Calculator size={20} className="text-gray-300" />
                        </div>
                        <span className="text-white font-medium">
                          Calcul du {zakat.date}
                        </span>
                      </div>

                      {/* Détails */}
                      <div className="space-y-3">
                        {/* Montant total des biens */}
                        <div className="flex justify-between items-center">
                          <span className="text-white">Montant total des biens :</span>
                          <span className="text-white font-bold">
                            {formatAmount(zakat.totalAssets)} F CFA
                          </span>
                        </div>

                        {/* Zakat à payer */}
                        <div className="flex justify-between items-center">
                          <span className="text-white">Zakat à payer :</span>
                          <span 
                            className="font-bold"
                            style={{ color: '#8DD17F' }}
                          >
                            {formatAmount(zakat.zakatAmount)} F CFA
                          </span>
                        </div>

                        {/* Reste à payer */}
                        <div className="flex justify-between items-center">
                          <span className="text-white">Reste à payer :</span>
                          <span 
                            className="font-bold"
                            style={{ color: '#F59E0B' }}
                          >
                            {formatAmount(zakat.remainingToPay)} F CFA
                          </span>
                        </div>
                      </div>

                      {/* Boutons d'action */}
                      <div className="flex gap-4 pt-4 border-t border-white/10">
                        <button
                          onClick={() => handleDeleteZakat(zakat.id)}
                          className="flex-1 py-3 px-6 rounded-3xl border-2 text-white font-medium transition-colors flex items-center justify-center space-x-2"
                          style={{ 
                            borderColor: '#E74C3C',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#E74C3C20';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <Trash2 size={20} style={{ color: '#E74C3C' }} />
                          <span>Supprimer</span>
                        </button>
                        <button
                          onClick={() => {
                            setZakatAmountToPay(zakat.zakatAmount);
                            setIsDonationModalOpen(true);
                          }}
                          className="flex-1 py-3 px-6 rounded-3xl text-white font-medium transition-colors flex items-center justify-center space-x-2"
                          style={{
                            background: 'linear-gradient(90deg, #8DD17F 0%, #37C2B4 100%)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(90deg, #7BC16F 0%, #2FB3A5 100%)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(90deg, #8DD17F 0%, #37C2B4 100%)';
                          }}
                        >
                          <HandCoins size={20} />
                          <span>Verser ma zakat</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              /* Section "Aucune archive" */
              <div className="rounded-2xl p-8 shadow-xl bg-[#101919]/40">
                <div className="flex flex-col items-center space-y-4">
                  {/* Icône d'information */}
                  <div 
                    className="rounded-full flex items-center justify-center bg-[#00644d]/20"
                  >
                    <Image src="/icons/information.png" alt="Info" width={48} height={48} className="object-contain" />
                  </div>

                  {/* Titre */}
                  <h2 className="text-2xl font-bold text-white">
                    Aucune archive
                  </h2>

                  {/* Description */}
                  <div className="text-white text-center space-y-1">
                    <p>Cliquez sur le bouton ci-dessus et calculez</p>
                    <p>votre première Zakat sur Amane+</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
        </div>
      </div>

      {/* Section "Emportez Amane+ partout avec vous" */}
      <section className="py-20 w-full" style={{ background: 'linear-gradient(to top, #d6fcf6, #229693)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="/images/phone.png"
                alt="App Mobile"
                className="rounded-2xl w-full h-full object-cover"
              />
            </div>
            <div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl lg:text-6xl font-extrabold mb-6 text-[#00644d]">
                  Emportez Amane+ partout avec vous
                </h2>
                <p className="text-lg text-white/80 mb-8 leading-relaxed">
                Retrouvez toutes les fonctionnalités d'Amane+ dans une seule application. Faites vos dons, suivez vos rendements, automatisez votre Zakat et participez à des actions solidaires, où que vous soyez.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-black text-white px-6 py-4 rounded-xl font-semibold hover:bg-gray-900 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Apple size={24} />
                    <span>Disponible sur l'App Store</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-black text-white px-6 py-4 rounded-xl font-semibold hover:bg-gray-900 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Play size={24} />
                    <span>Télécharger sur Google Play</span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Calculateur de Zakat */}
      <ZakatCalculatorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleZakatSaved}
      />

      {/* Modal de don pour verser la zakat */}
      <MakeDonationModal
        isOpen={isDonationModalOpen}
        onClose={() => {
          setIsDonationModalOpen(false);
          setZakatAmountToPay(undefined);
        }}
        initialAmount={zakatAmountToPay}
        title="Verser ma Zakat"
        subtitle="Montant de la Zakat"
        description="Confirmez le montant de votre Zakat à verser."
        amountSectionTitle="Montant de la Zakat"
        successTitle="Zakat versée avec succès !"
        successMessage="Votre Zakat a été versée. Qu'Allah accepte votre aumône."
        confirmationTitle="Confirmation du versement"
        confirmationDescription="Vérifiez les informations avant de confirmer le versement de votre Zakat."
        recapTitle="Vous allez verser une Zakat de:"
        recapMessage="Amane+ s'engage à distribuer votre Zakat selon les principes islamiques aux bénéficiaires éligibles."
        historyButtonLink="/zakat"
      />
    </>
  );
} 