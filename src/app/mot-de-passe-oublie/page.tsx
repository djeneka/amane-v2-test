"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Phone } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { forgotPassword, resendOtp, type ForgotPasswordBody } from "@/services/auth";
import { COUNTRY_DIAL_CODES, getFlagEmoji } from "@/data/countryDialCodes";

function isEmail(value: string): boolean {
  return value.includes('@') && value.length > 3;
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export default function MotDePasseOubliePage() {
  const t = useTranslations('forgotPassword');
  const [loginValue, setLoginValue] = useState("");
  const [countryCode, setCountryCode] = useState("+225");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSuccessContent, setShowSuccessContent] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [resetBody, setResetBody] = useState<ForgotPasswordBody | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSubmitted) return;
    const t = setTimeout(() => setShowSuccessContent(true), 3000);
    return () => clearTimeout(t);
  }, [isSubmitted]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const isEmailMode = isEmail(loginValue);
  const placeholder = isEmailMode ? t('placeholderEmail') : t('placeholderPhone');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginValue.trim()) {
      setError(isEmailMode ? t('errorEmailRequired') : t('errorPhoneRequired'));
      return;
    }
    if (isEmailMode && !/\S+@\S+\.\S+/.test(loginValue)) {
      setError(t('errorEmailInvalid'));
      return;
    }
    if (!isEmailMode && digitsOnly(loginValue).length < 8) {
      setError(t('errorPhoneInvalid'));
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const body = isEmailMode
        ? { email: loginValue.trim() }
        : { phoneNumber: countryCode + digitsOnly(loginValue) };
      const displaySent = isEmailMode ? loginValue.trim() : countryCode + digitsOnly(loginValue);
      await forgotPassword(body);
      setSentTo(displaySent);
      setResetBody(body);
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorGeneric'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div
        className="min-h-screen relative flex items-center justify-center p-4"
        style={{
          backgroundImage: 'url(/images/bg-s.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex flex-col items-center justify-center">
          {!showSuccessContent ? (
            <>
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-6" />
              <p className="text-white text-lg font-medium">{t('sendingCode')}</p>
            </>
          ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-[#00644D]/10 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-white/20"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 mx-auto mb-6 flex items-center justify-center"
              >
                <img 
                  src="/logo/AMANE%201.svg" 
                  alt="Amane+ Logo" 
                  className="w-full h-full object-contain"
                />
              </motion.div>
              
              <h1 className="text-2xl font-bold text-white mb-4">
                {t('codeSentTitle')}
              </h1>
              
              <p className="text-white/90 mb-6">
                {t('codeSentMessage')}{" "}
                <span className="font-medium text-white">{sentTo}</span>
              </p>
              
              <div className="bg-white/15 rounded-xl p-4 mb-4 border border-white/20">
                <p className="text-sm text-white/90">
                  {t('checkInbox')}{" "}
                  <Link
                    href={resetBody ? `/reinitialiser-mot-de-passe?${"email" in resetBody ? "email=" + encodeURIComponent(resetBody.email) : "phoneNumber=" + encodeURIComponent(resetBody.phoneNumber)}` : "/reinitialiser-mot-de-passe"}
                    className="text-green-200 hover:text-white font-medium underline"
                  >
                    {t('resetPasswordLink')}
                  </Link>
                </p>
              </div>

              <p className="text-sm text-white/80 mb-6">
                {t('noCodeReceived')}{" "}
                <button
                  type="button"
                  onClick={async () => {
                    if (!resetBody || resendLoading || resendCooldown > 0) return;
                    setResendLoading(true);
                    try {
                      await resendOtp(resetBody);
                      setResendCooldown(60);
                    } catch {
                      // silent or toast
                    } finally {
                      setResendLoading(false);
                    }
                  }}
                  disabled={resendLoading || resendCooldown > 0}
                  className="text-green-200 hover:text-white font-medium underline disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                >
                  {resendLoading ? (
                    <>
                      <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      {t('sending')}
                    </>
                  ) : resendCooldown > 0 ? (
                    <>{t('resendIn', { seconds: resendCooldown })}</>
                  ) : (
                    t('resend')
                  )}
                </button>
              </p>
              
              <Link
                href="/connexion"
                className="inline-flex items-center text-green-200 hover:text-white font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('backToLogin')}
              </Link>
            </motion.div>
          </div>
        </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(/images/bg-s.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="container mx-auto px-4 py-8 relative z-10 w-full">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[#00644D]/10 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 mx-auto mb-6 flex items-center justify-center"
              >
                <img 
                  src="/amane-logo.png" 
                  alt="Amane+ Logo" 
                  className="w-full h-full object-contain"
                />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {t('title')}
              </h1>
              <p className="text-white/90">
                {t('subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-white/90 mb-2">
                  {t('labelEmailOrPhone')}
                </label>
                <div className="flex gap-2">
                  {!isEmailMode && (
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="pl-2 pr-1 py-3 bg-white/90 border border-white/30 rounded-xl focus:ring-2 focus:ring-[#00C48C] focus:border-transparent text-gray-900 appearance-none cursor-pointer w-[88px] flex-shrink-0 text-sm"
                      aria-label={t('countryCodeAria')}
                    >
                      {COUNTRY_DIAL_CODES.map((country) => (
                        <option key={`${country.iso2}-${country.dialCode}-${country.name}`} value={country.dialCode} title={country.name}>
                          {getFlagEmoji(country.iso2)} {country.dialCode}
                        </option>
                      ))}
                    </select>
                  )}
                  <div className="relative flex-1 min-w-0">
                    {isEmailMode ? (
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    ) : (
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    )}
                    <input
                      type={isEmailMode ? "email" : "tel"}
                      inputMode={isEmailMode ? "email" : "numeric"}
                      value={loginValue}
                      onChange={(e) => setLoginValue(e.target.value)}
                      className={`w-full min-w-0 pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#00C48C] focus:border-transparent transition-all duration-200 bg-white/90 text-gray-900 placeholder-gray-500 ${
                        error ? "border-red-400" : "border-white/30"
                      }`}
                      placeholder={placeholder}
                      required
                    />
                  </div>
                </div>
                {error && (
                  <p className="text-red-200 text-sm mt-1">{error}</p>
                )}
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#8FC99E] to-[#20B6B3] text-white py-3 px-6 rounded-xl font-medium hover:opacity-90 focus:ring-4 focus:ring-white/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  t('submitButton')
                )}
              </motion.button>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center"
            >
              <Link
                href="/connexion"
                className="inline-flex items-center text-green-200 hover:text-white font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('backToLogin')}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 