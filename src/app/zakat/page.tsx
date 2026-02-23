'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calculator, HandCoins, Apple, Play, Trash2, ChevronDown, ChevronUp, Info } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/components/LocaleProvider';
import ZakatCalculatorModal from '@/components/ZakatCalculatorModal';
import PayZakatModal from '@/components/PayZakatModal';
import { useAuth } from '@/contexts/AuthContext';
import { getMyZakats, deleteZakat, createZakat, PENDING_ZAKAT_STORAGE_KEY, type Zakat, type CreateZakatBody } from '@/services/zakat';

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
  const t = useTranslations('zakatPage');
  const { locale } = useLocale();
  const router = useRouter();
  const { accessToken } = useAuth();

  /** Citations et hadiths (traduits) */
  const ZAKAT_QUOTES: { text: string; source: string }[] = [
    { text: t('quote1Text'), source: t('quote1Source') },
    { text: t('quote2Text'), source: t('quote2Source') },
    { text: t('quote3Text'), source: t('quote3Source') },
    { text: t('quote4Text'), source: t('quote4Source') },
    { text: t('quote5Text'), source: t('quote5Source') },
    { text: t('quote6Text'), source: t('quote6Source') },
    { text: t('quote7Text'), source: t('quote7Source') },
  ];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myZakats, setMyZakats] = useState<Zakat[]>([]);
  const [zakatsLoading, setZakatsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [zakatAmountToPay, setZakatAmountToPay] = useState<number | undefined>(undefined);
  const [zakatIdToPay, setZakatIdToPay] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [zakatToDeleteId, setZakatToDeleteId] = useState<string | null>(null);
  const [expandedZakatIds, setExpandedZakatIds] = useState<Set<string>>(new Set());
  const [openQuoteIndex, setOpenQuoteIndex] = useState<number | null>(null);
  /** Positions aléatoires des bulles (pourcentages), générées une fois au montage */
  const [bubblePositions, setBubblePositions] = useState<{ top: number; left: number }[]>([]);

  useEffect(() => {
    const positions: { top: number; left: number }[] = [];
    const centerBand = { topMin: 18, topMax: 72, leftMin: 15, leftMax: 85 };
    for (let i = 0; i < ZAKAT_QUOTES.length; i++) {
      positions.push({
        top: centerBand.topMin + Math.random() * (centerBand.topMax - centerBand.topMin),
        left: centerBand.leftMin + Math.random() * (centerBand.leftMax - centerBand.leftMin),
      });
    }
    setBubblePositions(positions);
  }, []);

  const toggleZakatExpand = (id: string) => {
    setExpandedZakatIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!accessToken) {
      setMyZakats([]);
      setZakatsLoading(false);
      return;
    }
    let cancelled = false;
    setZakatsLoading(true);
    getMyZakats(accessToken)
      .then((list) => { if (!cancelled) setMyZakats(list); })
      .catch(() => { if (!cancelled) setMyZakats([]); })
      .finally(() => { if (!cancelled) setZakatsLoading(false); });
    return () => { cancelled = true; };
  }, [accessToken]);

  // Après connexion/inscription : sauvegarder la zakat en attente (calcul ouverte sans être connecté)
  useEffect(() => {
    if (!mounted || !accessToken) return;
    const raw = sessionStorage.getItem(PENDING_ZAKAT_STORAGE_KEY);
    if (!raw) return;
    sessionStorage.removeItem(PENDING_ZAKAT_STORAGE_KEY);
    let body: CreateZakatBody;
    try {
      body = JSON.parse(raw) as CreateZakatBody;
      if (typeof body?.year !== 'number' || typeof body?.totalAmount !== 'number' || !body?.calculationDate) return;
      if (typeof body?.remainingAmount !== 'number') return;
      if (typeof body?.zakatDue !== 'number') body.zakatDue = body.remainingAmount;
    } catch {
      return;
    }
    createZakat(accessToken, body)
      .then(() => {
        setToastVariant('success');
        setToastMessage(t('toastCreated'));
        getMyZakats(accessToken).then(setMyZakats).catch(() => {});
        setTimeout(() => setToastMessage(null), 3000);
      })
      .catch((err: unknown) => {
        setToastVariant('error');
        const raw = err instanceof Error ? err.message : '';
        let msg = t('toastCreateError');
        try {
          const data = JSON.parse(raw);
          if (data && typeof data.message === 'string') msg = data.message;
        } catch {
          if (raw) msg = raw;
        }
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 5000);
      });
  }, [mounted, accessToken]);

  const refetchZakats = () => {
    if (!accessToken) return;
    getMyZakats(accessToken).then(setMyZakats).catch(() => {});
  };

  const handleZakatCreated = () => {
    setToastVariant('success');
    setToastMessage(t('toastCreated'));
    refetchZakats();
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleConfirmDeleteZakat = async () => {
    if (!accessToken || !zakatToDeleteId) return;
    const id = zakatToDeleteId;
    setZakatToDeleteId(null);
    setDeletingId(id);
    try {
      await deleteZakat(accessToken, id);
      setToastVariant('success');
      setToastMessage(t('toastDeleted'));
      refetchZakats();
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: unknown) {
      setToastVariant('error');
      const raw = err instanceof Error ? err.message : '';
      let msg = t('toastDeleteError');
      try {
        const data = JSON.parse(raw);
        if (data && typeof data.message === 'string') msg = data.message;
      } catch {
        if (raw) msg = raw;
      }
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setDeletingId(null);
    }
  };

  const formatAmount = (amount: number) => {
    const localeCode = locale === 'en' ? 'en-GB' : 'fr-FR';
    return new Intl.NumberFormat(localeCode, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCalculationDate = (isoDate: string) => {
    const d = new Date(isoDate);
    const localeCode = locale === 'en' ? 'en-GB' : 'fr-FR';
    return d.toLocaleDateString(localeCode, { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <>
      <div 
        className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(to left, #101919, #00644D)' 
        }}
      >
        {/* Animation clignotement des bulles */}
        <style>{`
          @keyframes zakat-bubble-blink {
            0%, 100% { opacity: 0.75; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
          }
          .zakat-bubble-blink {
            animation: zakat-bubble-blink 2s ease-in-out infinite;
          }
        `}</style>

        {/* Bulles d'info flottantes */}
        {bubblePositions.length === ZAKAT_QUOTES.length && ZAKAT_QUOTES.map((quote, index) => (
          <div
            key={index}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{
              top: `${bubblePositions[index].top}%`,
              left: `${bubblePositions[index].left}%`,
            }}
          >
            <motion.button
              type="button"
              onClick={() => setOpenQuoteIndex((prev) => (prev === index ? null : index))}
              className="zakat-bubble-blink w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/25 hover:bg-white/40 border border-white/50 flex items-center justify-center transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-[#8DD17F]"
              style={{ animationPlayState: openQuoteIndex === index ? 'paused' : 'running' }}
              aria-label={t('quoteAria')}
            >
              <Info size={20} className="text-white" />
            </motion.button>
            {openQuoteIndex === index && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  aria-hidden
                  onClick={() => setOpenQuoteIndex(null)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute z-30 mt-2 left-1/2 -translate-x-1/2 w-72 sm:w-80 p-4 rounded-xl bg-[#0F1F1F] border border-white/20 shadow-xl text-left"
                >
                  <p className="text-white/95 text-sm leading-relaxed italic">&laquo;&nbsp;{quote.text}&nbsp;&raquo;</p>
                  <p className="text-[#8DD17F] text-xs mt-2 font-medium">{quote.source}</p>
                </motion.div>
              </>
            )}
          </div>
        ))}

        <div className="max-w-2xl w-full text-center space-y-8 relative z-0">
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
          {t('title')}{' '}
          <span style={{ color: '#8DD17F' }}>{t('titleHighlight')}</span>
        </motion.h1>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-2 text-white text-lg md:text-xl mb-8"
        >
          <p>{t('description1')}</p>
          <p>{t('description2')}</p>
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
          <span>{t('calculateButton')}</span>
        </motion.button>

        {/* Toast */}
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl text-white font-medium shadow-lg ${toastVariant === 'error' ? 'bg-red-600' : ''}`}
            style={toastVariant === 'success' ? { background: 'linear-gradient(90deg, #8DD17F 0%, #37C2B4 100%)' } : undefined}
          >
            {toastMessage}
          </motion.div>
        )}

        {/* Section Liste des zakat ou Aucune archive */}
        {mounted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 w-full max-w-2xl mx-auto"
          >
            {zakatsLoading ? (
              <p className="text-white/80 text-center py-8">{t('loadingZakats')}</p>
            ) : myZakats.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-6 text-white text-left">
                  {t('listTitle')}
                </h2>
                <div className="space-y-4">
                  {myZakats.map((zakat) => {
                    const zakatDue = zakat.zakatDue;
                    const isExpanded = expandedZakatIds.has(zakat.id);
                    return (
                      <motion.div
                        key={zakat.id}
                        className="bg-[#1A2A28] rounded-2xl overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => toggleZakatExpand(zakat.id)}
                          className="w-full flex items-center justify-between gap-3 p-6 text-left hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                              <Calculator size={20} className="text-gray-300" />
                            </div>
                            <span className="text-white font-medium">
                              {t('calculationOf', { date: formatCalculationDate(zakat.createdAt) })}
                            </span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp size={24} className="text-white/80 flex-shrink-0" />
                          ) : (
                            <ChevronDown size={24} className="text-white/80 flex-shrink-0" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-6 pb-6 pt-0 space-y-3 border-t border-white/10">
                            <p className="text-white/70 text-sm pt-4">
                              {t('zakatForYear', { year: zakat.year })}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-white">{t('totalAssets')}</span>
                              <span className="text-white font-bold">
                                {formatAmount(zakat.totalAmount)} F CFA
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-white">{t('zakatToPay')}</span>
                              <span className="font-bold" style={{ color: '#8DD17F' }}>
                                {formatAmount(zakatDue ?? 0)} F CFA
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-white">{t('remainingToPay')}</span>
                              <span className="font-bold" style={{ color: '#F59E0B' }}>
                                {formatAmount(zakat.remainingAmount)} F CFA
                              </span>
                            </div>
                            {zakat.remainingAmount > 0 && (
                              <div className="flex gap-4 pt-4">
                                <button
                                  onClick={() => setZakatToDeleteId(zakat.id)}
                                  disabled={deletingId === zakat.id}
                                  className="flex-1 py-3 px-6 rounded-3xl border-2 border-[#E74C3C] text-white font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                                  style={{ backgroundColor: 'transparent' }}
                                  onMouseEnter={(e) => {
                                    if (deletingId !== zakat.id) e.currentTarget.style.backgroundColor = '#E74C3C20';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <Trash2 size={20} style={{ color: '#E74C3C' }} />
                                  <span>{deletingId === zakat.id ? t('deleting') : t('deleteZakat')}</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setZakatIdToPay(zakat.id);
                                    setZakatAmountToPay(zakat.remainingAmount);
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
                                  <span>{t('payMyZakat')}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
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
                    {t('noArchive')}
                  </h2>

                  {/* Description */}
                  <div className="text-white text-center space-y-1">
                    <p>{t('noArchiveDesc1')}</p>
                    <p>{t('noArchiveDesc2')}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {zakatToDeleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1A2A28] rounded-2xl p-6 max-w-md w-full shadow-xl border border-white/10">
            <h3 className="text-white font-bold text-lg mb-2">{t('confirmDeleteTitle')}</h3>
            <p className="text-white/80 text-sm mb-6">
              {t('confirmDeleteMessage')}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setZakatToDeleteId(null)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#2A3A38] text-white font-medium hover:bg-[#3A4A48] transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteZakat}
                className="flex-1 py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(90deg, #E74C3C 0%, #C0392B 100%)',
                  color: 'white'
                }}
              >
                <Trash2 size={18} />
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

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
                  {t('takeWithYouTitle')}
                </h2>
                <p className="text-lg text-white/80 mb-8 leading-relaxed">
                  {t('takeWithYouDesc')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-black text-white px-6 py-4 rounded-xl font-semibold hover:bg-gray-900 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Apple size={24} />
                    <span>{t('appStore')}</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-black text-white px-6 py-4 rounded-xl font-semibold hover:bg-gray-900 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Play size={24} />
                    <span>{t('googlePlay')}</span>
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
        onSave={refetchZakats}
        accessToken={accessToken}
        onSuccess={handleZakatCreated}
        onRequestAuth={() => router.push('/connexion?redirect=' + encodeURIComponent('/zakat'))}
      />

      {/* Modal de versement de zakat */}
      <PayZakatModal
        isOpen={isDonationModalOpen}
        onClose={() => {
          setIsDonationModalOpen(false);
          setZakatAmountToPay(undefined);
          setZakatIdToPay(null);
        }}
        initialAmount={zakatAmountToPay}
        zakatId={zakatIdToPay}
        accessToken={accessToken ?? undefined}
        onSuccess={refetchZakats}
      />
    </>
  );
} 