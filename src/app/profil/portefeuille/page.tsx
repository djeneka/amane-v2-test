'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Key, RefreshCw, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { changeWalletCode, requestResetWalletCode, resetWalletCode } from '@/services/wallet';
import { useTranslations } from 'next-intl';

type Screen = 'menu' | 'change-code' | 'request-reset' | 'reset-code';

function getApiErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  try {
    const data = JSON.parse(raw) as { message?: string; error?: string };
    return data.message ?? data.error ?? raw;
  } catch {
    return raw;
  }
}

export default function PortefeuillePage() {
  const t = useTranslations('profil');
  const { user, accessToken, refreshUser } = useAuth();
  const [walletLoading, setWalletLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Changer le code
  const [currentCode, setCurrentCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [showCurrentCode, setShowCurrentCode] = useState(false);
  const [showNewCode, setShowNewCode] = useState(false);
  const [showConfirmCode, setShowConfirmCode] = useState(false);
  const [changeLoading, setChangeLoading] = useState(false);

  // Demander réinitialisation
  const [requestResetLoading, setRequestResetLoading] = useState(false);

  // Réinitialiser le code (avec OTP/token)
  const [tokenOrOtp, setTokenOrOtp] = useState('');
  const [resetNewCode, setResetNewCode] = useState('');
  const [resetConfirmCode, setResetConfirmCode] = useState('');
  const [showResetNewCode, setShowResetNewCode] = useState(false);
  const [showResetConfirmCode, setShowResetConfirmCode] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    let cancelled = false;
    if (accessToken) {
      refreshUser()
        .then(() => { if (!cancelled) setWalletLoading(false); })
        .catch(() => { if (!cancelled) setWalletLoading(false); });
    } else {
      setWalletLoading(false);
    }
    return () => { cancelled = true; };
  }, [accessToken, refreshUser]);

  const handleChangeCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    if (newCode !== confirmCode) {
      showToast('error', t('portefeuilleCodesMismatch'));
      return;
    }
    if (newCode.length !== 4) {
      showToast('error', t('portefeuilleCodeLength'));
      return;
    }
    setChangeLoading(true);
    try {
      await changeWalletCode(accessToken, { oldCode: currentCode, newCode, confirmNewCode: confirmCode });
      await refreshUser();
      showToast('success', t('portefeuilleCodeSuccess'));
      setCurrentCode('');
      setNewCode('');
      setConfirmCode('');
      setCurrentScreen('menu');
    } catch (err) {
      showToast('error', getApiErrorMessage(err));
    } finally {
      setChangeLoading(false);
    }
  };

  const handleRequestReset = async () => {
    if (!accessToken) return;
    setRequestResetLoading(true);
    try {
      await requestResetWalletCode(accessToken);
      showToast('success', t('portefeuilleResetLinkSent'));
      setCurrentScreen('menu');
    } catch (err) {
      showToast('error', getApiErrorMessage(err));
    } finally {
      setRequestResetLoading(false);
    }
  };

  const handleResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    if (resetNewCode !== resetConfirmCode) {
      showToast('error', t('portefeuilleCodesMismatch'));
      return;
    }
    if (resetNewCode.length !== 4) {
      showToast('error', t('portefeuilleCodeLength'));
      return;
    }
    setResetLoading(true);
    try {
      await resetWalletCode(accessToken, { otp: tokenOrOtp, newCode: resetNewCode, confirmNewCode: resetConfirmCode });
      await refreshUser();
      showToast('success', t('portefeuilleResetSuccess'));
      setTokenOrOtp('');
      setResetNewCode('');
      setResetConfirmCode('');
      setCurrentScreen('menu');
    } catch (err) {
      showToast('error', getApiErrorMessage(err));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#00644D]/30 flex items-center justify-center">
          <Wallet size={24} className="text-[#00D9A5]" />
        </div>
        <div>
          <h1 className="text-white text-xl font-semibold">{t('portefeuilleTitle')}</h1>
          <p className="text-white/70 text-sm">{t('portefeuilleSubtitle')}</p>
        </div>
      </div>

      {/* Carte solde wallet (données du service / contexte) */}
      <div className="bg-[#101919] rounded-2xl border border-white/10 p-4 sm:p-5">
        <p className="text-white/60 text-sm mb-1">{t('portefeuilleCurrentBalance')}</p>
        {walletLoading ? (
          <div className="h-8 w-24 bg-white/10 rounded animate-pulse" />
        ) : (
          <p className="text-2xl font-bold text-[#00D9A5]">
            {user?.wallet != null
              ? `${Number(user.wallet.balance).toLocaleString('fr-FR')} ${user.wallet.currency}`
              : '—'}
          </p>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl px-4 py-3 flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-[#00D9A5]/20 text-[#00D9A5]' : 'bg-red-500/20 text-red-400'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </motion.div>
      )}

      {currentScreen === 'menu' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-[#101919] rounded-2xl border border-white/10 overflow-hidden">
            <button
              type="button"
              onClick={() => setCurrentScreen('change-code')}
              className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00644D]/20 flex items-center justify-center">
                  <Key size={20} className="text-[#00D9A5]" />
                </div>
                <div>
                  <p className="text-white font-medium">{t('portefeuilleChangeCode')}</p>
                  <p className="text-white/60 text-sm">{t('portefeuilleChangeCodeDesc')}</p>
                </div>
              </div>
              <span className="text-white/50">→</span>
            </button>
            <div className="h-px bg-white/10 mx-4" />
            <button
              type="button"
              onClick={() => setCurrentScreen('request-reset')}
              className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00644D]/20 flex items-center justify-center">
                  <RefreshCw size={20} className="text-[#00D9A5]" />
                </div>
                <div>
                  <p className="text-white font-medium">{t('portefeuilleRequestReset')}</p>
                  <p className="text-white/60 text-sm">{t('portefeuilleRequestResetDesc')}</p>
                </div>
              </div>
              <span className="text-white/50">→</span>
            </button>
            <div className="h-px bg-white/10 mx-4" />
            <button
              type="button"
              onClick={() => setCurrentScreen('reset-code')}
              className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00644D]/20 flex items-center justify-center">
                  <Key size={20} className="text-[#00D9A5]" />
                </div>
                <div>
                  <p className="text-white font-medium">{t('portefeuilleResetCode')}</p>
                  <p className="text-white/60 text-sm">{t('portefeuilleResetCodeDesc')}</p>
                </div>
              </div>
              <span className="text-white/50">→</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Écran : Changer le code */}
      {currentScreen === 'change-code' && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#101919] rounded-2xl border border-white/10 p-6"
        >
          <button
            type="button"
            onClick={() => setCurrentScreen('menu')}
            className="text-white/70 hover:text-white text-sm font-medium mb-6 flex items-center gap-1"
          >
            ← {t('portefeuilleBack')}
          </button>
          <h2 className="text-white font-semibold text-lg mb-4">{t('portefeuilleChangeCode')}</h2>
          <form onSubmit={handleChangeCode} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">{t('portefeuilleCurrentCode')}</label>
              <div className="relative">
                <input
                  type={showCurrentCode ? 'text' : 'password'}
                  value={currentCode}
                  onChange={(e) => setCurrentCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="w-full bg-[#0A1515] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 pr-12"
                  maxLength={4}
                  inputMode="numeric"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentCode(!showCurrentCode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  {showCurrentCode ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">{t('portefeuilleNewCode')}</label>
              <div className="relative">
                <input
                  type={showNewCode ? 'text' : 'password'}
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="w-full bg-[#0A1515] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 pr-12"
                  maxLength={4}
                  inputMode="numeric"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewCode(!showNewCode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  {showNewCode ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">{t('portefeuilleConfirmNewCode')}</label>
              <div className="relative">
                <input
                  type={showConfirmCode ? 'text' : 'password'}
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="w-full bg-[#0A1515] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 pr-12"
                  maxLength={4}
                  inputMode="numeric"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmCode(!showConfirmCode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  {showConfirmCode ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={changeLoading}
              className="w-full py-3 rounded-xl font-semibold bg-[#00D9A5] text-[#101919] hover:bg-[#00D9A5]/90 disabled:opacity-50"
            >
              {changeLoading ? t('portefeuilleInProgress') : t('portefeuilleSaveNewCode')}
            </button>
          </form>
        </motion.div>
      )}

      {/* Écran : Demander réinitialisation */}
      {currentScreen === 'request-reset' && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#101919] rounded-2xl border border-white/10 p-6"
        >
          <button
            type="button"
            onClick={() => setCurrentScreen('menu')}
            className="text-white/70 hover:text-white text-sm font-medium mb-6 flex items-center gap-1"
          >
            ← {t('portefeuilleBack')}
          </button>
          <h2 className="text-white font-semibold text-lg mb-2">{t('portefeuilleRequestResetTitle')}</h2>
          <p className="text-white/70 text-sm mb-6">
            {t('portefeuilleRequestResetHint')}
          </p>
          <button
            type="button"
            onClick={handleRequestReset}
            disabled={requestResetLoading}
            className="w-full py-3 rounded-xl font-semibold bg-[#00D9A5] text-[#101919] hover:bg-[#00D9A5]/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <RefreshCw size={20} />
            {requestResetLoading ? t('portefeuilleSending') : t('portefeuilleSendRequest')}
          </button>
        </motion.div>
      )}

      {/* Écran : Réinitialiser le code (avec OTP/token) */}
      {currentScreen === 'reset-code' && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#101919] rounded-2xl border border-white/10 p-6"
        >
          <button
            type="button"
            onClick={() => setCurrentScreen('menu')}
            className="text-white/70 hover:text-white text-sm font-medium mb-6 flex items-center gap-1"
          >
            ← {t('portefeuilleBack')}
          </button>
          <h2 className="text-white font-semibold text-lg mb-2">{t('portefeuilleResetCodeTitle')}</h2>
          <p className="text-white/70 text-sm mb-6">
            {t('portefeuilleResetCodeHint')}
          </p>
          <form onSubmit={handleResetCode} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">{t('portefeuilleCodeReceived')}</label>
              <input
                type="text"
                value={tokenOrOtp}
                onChange={(e) => setTokenOrOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder={t('portefeuilleCodePlaceholder')}
                maxLength={4}
                inputMode="numeric"
                className="w-full bg-[#0A1515] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30"
                required
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">{t('portefeuilleNewCode')}</label>
              <div className="relative">
                <input
                  type={showResetNewCode ? 'text' : 'password'}
                  value={resetNewCode}
                  onChange={(e) => setResetNewCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="w-full bg-[#0A1515] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 pr-12"
                  maxLength={4}
                  inputMode="numeric"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowResetNewCode(!showResetNewCode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  {showResetNewCode ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">{t('portefeuilleConfirmNewCode')}</label>
              <div className="relative">
                <input
                  type={showResetConfirmCode ? 'text' : 'password'}
                  value={resetConfirmCode}
                  onChange={(e) => setResetConfirmCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="w-full bg-[#0A1515] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 pr-12"
                  maxLength={4}
                  inputMode="numeric"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowResetConfirmCode(!showResetConfirmCode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  {showResetConfirmCode ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={resetLoading}
              className="w-full py-3 rounded-xl font-semibold bg-[#00D9A5] text-[#101919] hover:bg-[#00D9A5]/90 disabled:opacity-50"
            >
              {resetLoading ? t('portefeuilleInProgress') : t('portefeuilleResetButton')}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
