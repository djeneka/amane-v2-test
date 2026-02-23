"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar, ArrowRight, Shield, CheckCircle, Heart, Users, CheckCircle2, Wallet, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { register as apiRegister, verifyAccount, resendOtp, type RegisterGender } from "@/services/auth";
import AuthGuard from "@/components/AuthGuard";
import { COUNTRY_DIAL_CODES, getFlagEmoji } from "@/data/countryDialCodes";

export default function InscriptionPage() {
  const t = useTranslations('inscription');
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "" as RegisterGender | "",
    isMuslim: true,
    interests: [] as string[],
    monthlyMinIncome: "",
    monthlyMaxIncome: "",
    walletCode: "",
    password: "",
    confirmPassword: "",
  });
  /** Indicatif pays pour le téléphone (format international ex. +2250712345678) */
  const [phoneCountryCode, setPhoneCountryCode] = useState("+225");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showWalletCode, setShowWalletCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // États pour la vérification
  const [step, setStep] = useState<'inscription' | 'verification' | 'success'>('inscription');
  const [verificationCode, setVerificationCode] = useState<string[]>(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);
  /** Si l'utilisateur a des centres d'intérêt (affiche la liste des choix) */
  const [hasInterests, setHasInterests] = useState(false);
  /** Étape du formulaire d'inscription (1 = infos + centres d'intérêt, 2 = revenus + sécurité) */
  const [formStep, setFormStep] = useState<1 | 2>(1);

  /** Tranches de revenus prédéfinies pour encourager l'estimation (min, max en XOF) */
  const INCOME_PRESETS = [
    { label: t('incomePreset1'), min: 50000, max: 150000 },
    { label: t('incomePreset2'), min: 150000, max: 300000 },
    { label: t('incomePreset3'), min: 300000, max: 600000 },
    { label: t('incomePreset4'), min: 600000, max: 1000000 },
    { label: t('incomePreset5'), min: 1000000, max: 5000000 },
  ] as const;

  /** Options pour les centres d'intérêt (valeurs envoyées à l'API) */
  const INTERESTS_OPTIONS = [
    { value: "DONATION", labelKey: "interestDonation" as const },
    { value: "ZAKAT", labelKey: "interestZakat" as const },
    { value: "BENEVOLAT", labelKey: "interestBenevolat" as const },
    { value: "ORPHELINS", labelKey: "interestOrphelins" as const },
    { value: "EDUCATION", labelKey: "interestEducation" as const },
    { value: "SANTE", labelKey: "interestSante" as const },
    { value: "EAU_POTABLE", labelKey: "interestEau" as const },
    { value: "PAUVRETE", labelKey: "interestPauvrete" as const },
    { value: "SECOURS_URGENCE", labelKey: "interestSecours" as const },
    { value: "MOSQUEES", labelKey: "interestMosquees" as const },
    { value: "RAMADAN", labelKey: "interestRamadan" as const },
    { value: "AIDES_FAMILLES", labelKey: "interestAidesFamilles" as const },
    { value: "ENVIRONNEMENT", labelKey: "interestEnvironnement" as const },
    { value: "CULTURE_ISLAMIQUE", labelKey: "interestCulture" as const },
  ] as const;

  /** Étape 1 complète (infos personnelles + centres d'intérêt) — permet d'afficher "Suivant". Email et date de naissance optionnels. */
  const isStep1Complete =
    !!formData.firstName.trim() &&
    !!formData.lastName.trim() &&
    (formData.email.trim() === "" || /\S+@\S+\.\S+/.test(formData.email.trim())) &&
    !!formData.phone.trim() &&
    formData.phone.replace(/\D/g, "").length >= 8 &&
    (formData.gender === "MALE" || formData.gender === "FEMALE") &&
    (!hasInterests || formData.interests.length > 0);

  /** Le bouton "Créer mon compte" est actif seulement si tous les champs sont renseignés et les conditions cochées */
  const isFormComplete =
    isStep1Complete &&
    !!formData.monthlyMinIncome.trim() &&
    !!formData.monthlyMaxIncome.trim() &&
    formData.walletCode.replace(/\D/g, "").length === 4 &&
    formData.password.length >= 8 &&
    formData.password === formData.confirmPassword &&
    !!formData.confirmPassword &&
    acceptTerms;

  /** Retourne le numéro au format international (ex. +2250787274093), sans supprimer le 0 après l'indicatif */
  const toInternationalPhone = (localNumber: string): string => {
    const digitsOnly = localNumber.replace(/\D/g, "") || "";
    const code = phoneCountryCode.replace(/\D/g, "");
    return `+${code}${digitsOnly}`;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleInterestToggle = (value: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(value)
        ? prev.interests.filter((i) => i !== value)
        : [...prev.interests, value],
    }));
    if (errors.interests) setErrors(prev => ({ ...prev, interests: "" }));
  };

  const handleHasInterestsChange = (checked: boolean) => {
    setHasInterests(checked);
    if (!checked) setFormData(prev => ({ ...prev, interests: [] }));
    if (errors.interests) setErrors(prev => ({ ...prev, interests: "" }));
  };

  const setIncomePreset = (min: number, max: number) => {
    setFormData(prev => ({
      ...prev,
      monthlyMinIncome: String(min),
      monthlyMaxIncome: String(max),
    }));
    setErrors(prev => ({ ...prev, monthlyMinIncome: "", monthlyMaxIncome: "" }));
  };

  const formatXof = (value: string) => {
    const n = value.replace(/\D/g, "");
    if (!n) return "";
    return parseInt(n, 10).toLocaleString("fr-FR");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('errorFirstName');
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('errorLastName');
    }

    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = t('errorEmailInvalid');
    }

    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (!formData.phone.trim()) {
      newErrors.phone = t('errorPhoneRequired');
    } else if (phoneDigits.length < 8) {
      newErrors.phone = t('errorPhoneMinDigits');
    }

    if (formData.gender !== "MALE" && formData.gender !== "FEMALE") {
      newErrors.gender = t('errorGender');
    }

    if (hasInterests && formData.interests.length === 0) {
      newErrors.interests = t('errorInterests');
    }

    const minIncome = parseInt(formData.monthlyMinIncome.replace(/\D/g, ""), 10) || 0;
    const maxIncome = parseInt(formData.monthlyMaxIncome.replace(/\D/g, ""), 10) || 0;
    if (!formData.monthlyMinIncome.trim()) {
      newErrors.monthlyMinIncome = t('errorIncomeMin');
    }
    if (!formData.monthlyMaxIncome.trim()) {
      newErrors.monthlyMaxIncome = t('errorIncomeMax');
    } else if (maxIncome < minIncome) {
      newErrors.monthlyMaxIncome = t('errorIncomeMaxLower');
    }

    const walletDigits = formData.walletCode.replace(/\D/g, "");
    if (walletDigits.length !== 4) {
      newErrors.walletCode = t('errorWalletCode');
    }

    if (!formData.password) {
      newErrors.password = t('errorPasswordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('errorPasswordMin');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('errorPasswordMismatch');
    }

    if (!acceptTerms) {
      newErrors.terms = t('errorTerms');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, general: '' }));

    try {
      const minIncome = parseInt(formData.monthlyMinIncome.replace(/\D/g, ""), 10) || 0;
      const maxIncome = parseInt(formData.monthlyMaxIncome.replace(/\D/g, ""), 10) || 0;
      await apiRegister({
        email: formData.email.trim(),
        password: formData.password,
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        phoneNumber: toInternationalPhone(formData.phone.trim()),
        profilePicture: "",
        gender: formData.gender as RegisterGender,
        interests: formData.interests,
        socialCategory: {
          monthlyMinIncome: minIncome,
          monthlyMaxIncome: maxIncome,
        },
        wallet: {
          code: formData.walletCode.replace(/\D/g, ""),
        },
        isMuslim: formData.isMuslim,
      });

      // Stocker temporairement les données pour l'étape de vérification (et après succès)
      localStorage.setItem(
        'pending-registration',
        JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: toInternationalPhone(formData.phone.trim()),
          password: formData.password,
        })
      );

      setStep('verification');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : String(err);
      try {
        const data = JSON.parse(message) as { message?: string };
        setErrors((prev) => ({
          ...prev,
          general: data.message ?? t('errorGeneric'),
        }));
      } catch {
        setErrors((prev) => ({
          ...prev,
          general: message || t('errorGeneric'),
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    // Ne permettre que les chiffres
    if (value && !/^\d$/.test(value)) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    setVerificationError('');

    // Auto-focus sur le champ suivant
    if (value && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const code = verificationCode.join('');

    if (code.length !== 4) {
      setVerificationError(t('errorVerificationComplete'));
      return;
    }

    const pendingData = localStorage.getItem('pending-registration');
    if (!pendingData) {
      setVerificationError(t('errorVerificationGeneric'));
      return;
    }

    const userData = JSON.parse(pendingData) as { phone: string };
    if (!userData.phone) {
      setVerificationError(t('errorVerificationInvalidData'));
      return;
    }

    setIsVerifying(true);
    setVerificationError('');

    try {
      await verifyAccount({
        otp: code,
        phoneNumber: userData.phone,
      });
      setStep('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      try {
        const data = JSON.parse(message) as { message?: string };
        setVerificationError(data.message ?? t('errorVerificationWrongCode'));
      } catch {
        setVerificationError(message || t('errorVerificationWrongCode'));
      }
    } finally {
      setIsVerifying(false);
    }
  };

  /** Au clic sur "Se connecter" dans le popup : effacer le storage et rediriger vers la page connexion */
  const handleSuccessContinue = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pending-registration');
    }
    router.push('/connexion');
  };

  const handleResendCode = async () => {
    const pendingData = localStorage.getItem('pending-registration');
    if (!pendingData) {
      setVerificationError(t('errorResendNoData'));
      return;
    }
    const userData = JSON.parse(pendingData) as { phone: string };
    if (!userData.phone) {
      setVerificationError(t('errorResendNoPhone'));
      return;
    }
    setIsResending(true);
    setVerificationError('');
    setResendSuccess(false);
    try {
      await resendOtp({ phoneNumber: userData.phone });
      setVerificationCode(['', '', '', '']);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      try {
        const data = JSON.parse(message) as { message?: string };
        setVerificationError(data.message ?? t('errorResendFailed'));
      } catch {
        setVerificationError(message || t('errorResendFailed'));
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen flex">
        <div className="grid lg:grid-cols-2 w-full min-h-screen">
          {/* Section de gauche - Informations */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:flex items-center justify-center p-12 min-h-screen"
            style={{
              background: 'linear-gradient(135deg, #8FC99E 0%, #20B6B3 100%)'
            }}
          >
            <div className="space-y-8 max-w-lg">
                <div>
                  <h2 className="text-4xl font-bold text-white mb-4">
                    {t('leftTitle')}{" "}
                    <span className="text-[#00644D]">
                      {t('leftTitleHighlight')}
                    </span>
                  </h2>
                  <p className="text-xl text-white/90 leading-relaxed">
                    {t('leftIntro')}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="w-12 h-12 bg-[#DCFCE7] rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                      <Heart className="w-6 h-6 text-[#00644D]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#00644D] mb-2">
                        {t('cardDonZakat')}
                      </h3>
                      <p className="text-white/80">
                        {t('cardDonZakatDesc')}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="w-12 h-12 bg-[#DCFCE7] rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                      <Shield className="w-6 h-6 text-[#00644D]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#00644D] mb-2">
                        {t('cardTakaful')}
                      </h3>
                      <p className="text-white/80">
                        {t('cardTakafulDesc')}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="w-12 h-12 bg-[#DCFCE7] rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                      <Users className="w-6 h-6 text-[#00644D]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#00644D] mb-2">
                        {t('cardInvest')}
                      </h3>
                      <p className="text-white/80">
                        {t('cardInvestDesc')}
                      </p>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-[#DCFCE7] backdrop-blur-sm rounded-2xl p-6 text-white border border-white/30"
                >
                  <h3 className="text-xl font-semibold mb-2 text-[#00644D]">
                    {t('joinCommunityTitle')}
                  </h3>
                  <p className="text-[#00644D]/80">
                    {t('joinCommunityDesc')}
                  </p>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Section de droite - Formulaire */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className={`flex items-center justify-center p-8 lg:p-12 min-h-screen relative ${step === 'success' ? 'blur-sm' : ''}`}
              style={{
                backgroundImage: 'url(/images/bg-s.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Overlay noir avec opacité réduite */}
              <div className="absolute inset-0 bg-black/60"></div>
              
              <div className={`w-full max-w-lg px-4 relative z-10 ${step === 'success' ? 'pointer-events-none' : ''}`}>
                {step === 'inscription' && (
                  <>
                    <div className="text-center mb-8">
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-gray-100/10 rounded-2xl"
                      >
                        <img 
                          src="/amane-logo.png" 
                          alt="Amane+ Logo" 
                          className="w-full h-full object-contain shadow-2xl rounded-2xl"
                        />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h1 className="text-4xl font-bold text-white mb-3">
                          {t('greeting')}
                        </h1>
                        <p className="text-white text-lg mb-2">
                          {t('subtitle')}
                        </p>
                      </motion.div>
                    </div>

                    {/* Stepper : 2 étapes */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                          formStep >= 1 ? "bg-[#5AB678] text-white" : "bg-white/20 text-white/70"
                        }`}>1</span>
                        <span className="text-white/80 text-sm hidden sm:inline">{t('step1Label')}</span>
                      </div>
                      <div className="w-8 h-0.5 bg-white/30" />
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                          formStep >= 2 ? "bg-[#5AB678] text-white" : "bg-white/20 text-white/70"
                        }`}>2</span>
                        <span className="text-white/80 text-sm hidden sm:inline">{t('step2Label')}</span>
                      </div>
                    </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <AnimatePresence mode="wait">
                    {formStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-5"
                      >
              <div className="grid md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-xs font-medium text-white/90 mb-2">{t('firstName')}</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 z-10" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={`w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-0 rounded-2xl focus:ring-2 focus:ring-white/50 focus:bg-white/90 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                        errors.firstName ? "ring-2 ring-red-500" : ""
                      }`}
                      placeholder={t('firstName')}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-300 text-sm mt-1">{errors.firstName}</p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-xs font-medium text-white/90 mb-2">{t('lastName')}</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 z-10" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={`w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-0 rounded-2xl focus:ring-2 focus:ring-white/50 focus:bg-white/90 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                        errors.lastName ? "ring-2 ring-red-500" : ""
                      }`}
                      placeholder={t('lastName')}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-300 text-sm mt-1">{errors.lastName}</p>
                  )}
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-xs font-medium text-white/90 mb-2">{t('emailOptional')}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 z-10" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-0 rounded-2xl focus:ring-2 focus:ring-white/50 focus:bg-white/90 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                      errors.email ? "ring-2 ring-red-500" : ""
                    }`}
                    placeholder={t('emailPlaceholder')}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-300 text-sm mt-1">{errors.email}</p>
                )}
              </motion.div>

              <div className="grid md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-xs font-medium text-white/90 mb-2">{t('phone')}</label>

                  <div className="flex rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm border-0 focus-within:ring-2 focus-within:ring-white/50 focus-within:bg-white/90">
                    <select
                      value={phoneCountryCode}
                      onChange={(e) => setPhoneCountryCode(e.target.value)}
                      aria-label={t('countryCodeAria')}
                      className="pl-2 pr-1 py-4 bg-white/50 text-gray-700 font-medium border-0 focus:ring-0 focus:outline-none cursor-pointer w-[88px] flex-shrink-0 text-sm"
                    >
                      {COUNTRY_DIAL_CODES.map((country) => (
                        <option key={`${country.iso2}-${country.dialCode}-${country.name}`} value={country.dialCode} title={country.name}>
                          {getFlagEmoji(country.iso2)} {country.dialCode}
                        </option>
                      ))}
                    </select>
                    <div className="relative flex-1 min-w-0">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 z-10" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value.replace(/\D/g, ""))}
                        className={`w-full min-w-0 pl-10 pr-4 py-4 bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-500 ${
                          errors.phone ? "ring-2 ring-red-500 rounded-r-2xl" : ""
                        }`}
                        placeholder={t('phonePlaceholder')}
                      />
                    </div>
                  </div>
                  {errors.phone && (
                    <p className="text-red-300 text-sm mt-1">{errors.phone}</p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className="block text-xs font-medium text-white/90 mb-2">{t('birthDateOptional')}</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 z-10" />
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange("birthDate", e.target.value)}
                      aria-label={t('birthDateAria')}
                      className={`w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-0 rounded-2xl focus:ring-2 focus:ring-white/50 focus:bg-white/90 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                        errors.birthDate ? "ring-2 ring-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.birthDate && (
                    <p className="text-red-300 text-sm mt-1">{errors.birthDate}</p>
                  )}
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.72 }}
              >
                <label className="block text-sm font-medium text-white/90 mb-2">{t('gender')}</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value as RegisterGender | "")}
                  aria-label={t('gender')}
                  className={`w-full pl-4 pr-4 py-4 bg-white/80 backdrop-blur-sm border-0 rounded-2xl focus:ring-2 focus:ring-white/50 focus:bg-white/90 transition-all duration-200 text-gray-900 ${
                    errors.gender ? "ring-2 ring-red-500" : ""
                  }`}
                >
                  <option value="">{t('genderSelect')}</option>
                  <option value="MALE">{t('genderMale')}</option>
                  <option value="FEMALE">{t('genderFemale')}</option>
                </select>
                {errors.gender && (
                  <p className="text-red-300 text-sm mt-1">{errors.gender}</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.73 }}
                className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm overflow-hidden"
              >
                <label className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors rounded-2xl">
                  <input
                    type="checkbox"
                    checked={formData.isMuslim}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isMuslim: e.target.checked }))}
                    className="w-5 h-5 rounded border-2 border-white/40 text-[#5AB678] focus:ring-[#5AB678]/50 focus:ring-2 bg-white/10"
                  />
                  <span className="text-white font-medium">{t('isMuslim')}</span>
                </label>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.74 }}
                className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm overflow-hidden"
              >
                <label className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors rounded-2xl">
                  <input
                    type="checkbox"
                    checked={hasInterests}
                    onChange={(e) => handleHasInterestsChange(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-white/40 text-[#5AB678] focus:ring-[#5AB678]/50 focus:ring-2 bg-white/10"
                  />
                  <span className="text-white font-medium">{t('hasInterests')}</span>
                </label>
                {hasInterests && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-t border-white/10 px-4 pb-4 pt-2"
                  >
                    <p className="text-white/70 text-sm mb-3">{t('selectInterests')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                      {INTERESTS_OPTIONS.map((opt) => {
                        const isChecked = formData.interests.includes(opt.value);
                        return (
                          <label
                            key={opt.value}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-all duration-200 border ${
                              isChecked
                                ? "bg-[#5AB678]/20 border-[#5AB678] text-white"
                                : "bg-white/5 border-white/10 text-white/90 hover:bg-white/10 hover:border-white/20"
                            }`}
                          >
                            <span className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                              isChecked ? "border-[#5AB678] bg-[#5AB678]" : "border-white/40"
                            }`}>
                              {isChecked && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleInterestToggle(opt.value)}
                              className="sr-only"
                            />
                            <span className="text-sm font-medium">{t(opt.labelKey)}</span>
                          </label>
                        );
                      })}
                    </div>
                    {formData.interests.length > 0 && (
                      <p className="text-[#5AB678] text-xs mt-2">
                        {t('interestsSelected', { count: formData.interests.length })}
                      </p>
                    )}
                    {errors.interests && (
                      <p className="text-red-300 text-sm mt-2">{errors.interests}</p>
                    )}
                  </motion.div>
                )}
              </motion.div>

                        <button
                          type="button"
                          onClick={() => setFormStep(2)}
                          disabled={!isStep1Complete}
                          className="w-full text-white py-4 px-6 rounded-2xl font-medium hover:opacity-90 focus:ring-4 focus:ring-white/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          style={{ background: 'linear-gradient(to right, #8FC99E, #20B6B3)' }}
                        >
                          {t('next')}
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </button>
                      </motion.div>
                    )}

                    {formStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-5"
                      >
                        <button
                          type="button"
                          onClick={() => setFormStep(1)}
                          className="flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium transition-colors"
                        >
                          <ArrowRight className="w-4 h-4 rotate-180" />
                          {t('previous')}
                        </button>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.76 }}
                className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm overflow-hidden"
              >
                <div className="p-4 pb-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#5AB678]/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-[#5AB678]" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{t('monthlyIncome')}</h3>
                      <p className="text-white/70 text-sm mt-0.5">
                        {t('monthlyIncomeHint')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4 space-y-4">
                  <div>
                    <p className="text-white/80 text-xs font-medium mb-2">{t('chooseRangeOrCustom')}</p>
                    <div className="flex flex-wrap gap-2">
                      {INCOME_PRESETS.map((preset) => {
                        const isSelected =
                          formData.monthlyMinIncome === String(preset.min) &&
                          formData.monthlyMaxIncome === String(preset.max);
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setIncomePreset(preset.min, preset.max)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                              isSelected
                                ? "bg-[#5AB678] text-white shadow-lg shadow-[#5AB678]/25"
                                : "bg-white/10 text-white/90 border border-white/20 hover:bg-white/15 hover:border-white/30"
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <span>{t('orSpecify')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-white/70 text-xs mb-1.5">{t('minXOF')}</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.monthlyMinIncome}
                        onChange={(e) => handleInputChange("monthlyMinIncome", e.target.value.replace(/\D/g, ""))}
                        placeholder={t('incomePlaceholder')}
                        className={`w-full pl-3 pr-3 py-3 rounded-xl bg-white/90 text-gray-900 placeholder-gray-400 text-sm focus:ring-2 focus:ring-[#5AB678]/50 focus:outline-none border ${
                          errors.monthlyMinIncome ? "border-red-400" : "border-transparent"
                        }`}
                      />
                      {formData.monthlyMinIncome && (
                        <p className="text-[#5AB678] text-xs mt-1">{formatXof(formData.monthlyMinIncome)} XOF</p>
                      )}
                      {errors.monthlyMinIncome && (
                        <p className="text-red-300 text-xs mt-1">{errors.monthlyMinIncome}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-white/70 text-xs mb-1.5">{t('maxXOF')}</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.monthlyMaxIncome}
                        onChange={(e) => handleInputChange("monthlyMaxIncome", e.target.value.replace(/\D/g, ""))}
                        placeholder={t('incomePlaceholderMax')}
                        className={`w-full pl-3 pr-3 py-3 rounded-xl bg-white/90 text-gray-900 placeholder-gray-400 text-sm focus:ring-2 focus:ring-[#5AB678]/50 focus:outline-none border ${
                          errors.monthlyMaxIncome ? "border-red-400" : "border-transparent"
                        }`}
                      />
                      {formData.monthlyMaxIncome && (
                        <p className="text-[#5AB678] text-xs mt-1">{formatXof(formData.monthlyMaxIncome)} XOF</p>
                      )}
                      {errors.monthlyMaxIncome && (
                        <p className="text-red-300 text-xs mt-1">{errors.monthlyMaxIncome}</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Bloc dédié : code de sécurité pour les transactions (distinct du mot de passe) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.78 }}
                className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-4"
              >
                <label className="block text-sm font-medium text-white/90 mb-1">{t('walletCodeLabel')}</label>
                <p className="text-white/80 text-xs mb-3">
                  {t('walletCodeHint')}
                </p>
                <div className="relative">
                  <Wallet className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 z-10" />
                  <input
                    type={showWalletCode ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={4}
                    value={formData.walletCode}
                    onChange={(e) => handleInputChange("walletCode", e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className={`w-full pl-12 pr-12 py-4 bg-white/80 backdrop-blur-sm border-0 rounded-2xl focus:ring-2 focus:ring-white/50 focus:bg-white/90 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                      errors.walletCode ? "ring-2 ring-red-500" : ""
                    }`}
                    placeholder={t('walletCodePlaceholder')}
                    aria-label={t('walletCodeAria')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowWalletCode(!showWalletCode)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label={showWalletCode ? t('hideCode') : t('showCode')}
                  >
                    {showWalletCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.walletCode && (
                  <p className="text-red-300 text-sm mt-1">{errors.walletCode}</p>
                )}
              </motion.div>

              {/* Séparateur visuel : mot de passe de connexion */}
              <div className="border-t border-white/20 pt-2 mt-1">
                <p className="text-white/70 text-sm font-medium mb-3">{t('loginPasswordSection')}</p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <label htmlFor="inscription-password" className="block text-sm font-medium text-white/90 mb-2">{t('passwordLabel')}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 z-10" />
                  <input
                    id="inscription-password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`w-full pl-12 pr-12 py-4 bg-white/80 backdrop-blur-sm border-0 rounded-2xl focus:ring-2 focus:ring-white/50 focus:bg-white/90 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                      errors.password ? "ring-2 ring-red-500" : ""
                    }`}
                    placeholder={t('passwordPlaceholder')}
                    aria-label={t('passwordAria')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-300 text-sm mt-1">{errors.password}</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <label htmlFor="inscription-confirm-password" className="block text-sm font-medium text-white/90 mb-2">{t('confirmPassword')}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 z-10" />
                  <input
                    id="inscription-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={`w-full pl-12 pr-12 py-4 bg-white/80 backdrop-blur-sm border-0 rounded-2xl focus:ring-2 focus:ring-white/50 focus:bg-white/90 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                      errors.confirmPassword ? "ring-2 ring-red-500" : ""
                    }`}
                    placeholder={t('confirmPasswordPlaceholder')}
                    aria-label={t('confirmPasswordAria')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label={showConfirmPassword ? t('hideConfirmPassword') : t('showConfirmPassword')}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-300 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="space-y-4"
              >
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 text-green-800 border-gray-400 rounded focus:ring-green-500 mt-1 bg-white/80"
                  />
                  <span className="ml-3 text-sm text-white">
                    {t('acceptTerms')}{" "}
                    <Link href="/conditions" className="text-[#5AB678] hover:text-green-200 font-medium underline">
                      {t('termsLink')}
                    </Link>{" "}
                    {t('and')}{" "}
                    <Link href="/politique-confidentialite" className="text-[#5AB678] hover:text-green-200 font-medium underline">
                      {t('privacyLink')}
                    </Link>{" "}
                    {t('ofAmane')}
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-red-300 text-sm">{errors.terms}</p>
                )}

                <div className="bg-[#101919]/80 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-[#5AB678] mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-white/90">
                      <p className="font-medium mb-1 text-[#5AB678]">{t('dataProtected')}</p>
                      <p>{t('dataProtectedDesc')}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {errors.general && (
                <p className="text-red-300 text-sm text-center">{errors.general}</p>
              )}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                type="submit"
                disabled={isLoading || !isFormComplete}
                className="w-full text-white py-4 px-6 rounded-2xl font-medium hover:opacity-90 focus:ring-4 focus:ring-white/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                style={{ background: 'linear-gradient(to right, #8FC99E, #20B6B3)' }}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    {t('createAccount')}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
            </form>

            {/* Section "Ou s'inscrire avec" et boutons Google / Facebook — à réactiver plus tard */}
            {/* <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center my-6"
            >
              <div className="flex-1 h-px bg-white/30"></div>
              <span className="px-4 text-sm text-white/80">Ou s'inscrire avec</span>
              <div className="flex-1 h-px bg-white/30"></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="grid grid-cols-2 gap-4 mb-6"
            >
              <button
                type="button"
                onClick={() => {
                  console.log('Inscription Google');
                }}
                className="flex items-center justify-center gap-3 bg-transparent backdrop-blur-sm rounded-2xl py-4 px-4 hover:bg-white/90 transition-all duration-200 border border-white/30"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-white font-medium">Google</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log('Inscription Facebook');
                }}
                className="flex items-center justify-center gap-3 bg-transparent backdrop-blur-sm rounded-2xl py-4 px-4 hover:bg-white/90 transition-all duration-200 border border-white/30"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-white font-medium">Facebook</span>
              </button>
            </motion.div> */}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="mt-8 text-center"
            >
              <p className="text-white">
                {t('alreadyAccount')}{" "}
                <Link
                  href="/connexion"
                  className="text-[#5AB678] hover:text-green-200 font-medium transition-colors underline"
                >
                  {t('signIn')}
                </Link>
              </p>
            </motion.div>
                  </>
                )}

                {step === 'verification' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                  >
                    {/* Logo */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-gray-100/10 rounded-2xl"
                    >
                      <img 
                        src="/amane-logo.png" 
                        alt="Amane+ Logo" 
                        className="w-full h-full object-contain shadow-2xl rounded-2xl"
                      />
                    </motion.div>

                    {/* Titre */}
                    <motion.h1
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-3xl font-bold text-white mb-4"
                    >
                      {t('verificationTitle')}
                    </motion.h1>

                    {/* Texte d'instruction */}
                    <motion.p
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-white/90 mb-8"
                    >
                      {t('verificationInstruction')}
                    </motion.p>

                    {/* Champs de code */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex justify-center gap-3 mb-6"
                    >
                      {verificationCode.map((digit, index) => (
                        <input
                          key={index}
                          id={`code-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeChange(index, e.target.value)}
                          onKeyDown={(e) => handleCodeKeyDown(index, e)}
                          aria-label={t('digitAria', { n: index + 1 })}
                          className="w-14 h-14 bg-transparent border border-white/30 rounded-xl text-center text-white text-2xl font-semibold focus:border-[#5AB678] focus:ring-2 focus:ring-[#5AB678]/50 transition-all"
                        />
                      ))}
                    </motion.div>

                    {verificationError && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-300 text-sm mb-4"
                      >
                        {verificationError}
                      </motion.p>
                    )}

                    {/* Bouton Vérifier */}
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      onClick={handleVerifyCode}
                      disabled={isVerifying || verificationCode.some(d => !d)}
                      className="w-full text-white py-4 px-6 rounded-2xl font-medium hover:opacity-90 focus:ring-4 focus:ring-white/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-6"
                      style={{ background: 'linear-gradient(to right, #8FC99E, #20B6B3)' }}
                    >
                      {isVerifying ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        t('verify')
                      )}
                    </motion.button>

                    {/* Lien Renvoyer */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-white/80 text-sm"
                    >
                      {t('noCodeReceived')}{" "}
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={isResending}
                        className="text-[#5AB678] hover:text-[#5AB678]/80 font-medium underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isResending ? t('resending') : resendSuccess ? t('codeReverified') : t('resend')}
                      </button>
                    </motion.p>
                  </motion.div>
                )}

              </div>
            </motion.div>
        </div>
      </div>

      {/* Popup de félicitations */}
      {step === 'success' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-[#283234] rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
            style={{ borderRadius: '24px' }}
          >
            {/* Icône de succès avec cercles concentriques */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center"
            >
              {/* Cercle extérieur avec bordure claire */}
              <div className="absolute inset-0 rounded-full border-4 border-[#6CDAA2]/30"></div>
              {/* Cercle moyen vert foncé */}
              <div className="absolute inset-2 rounded-full border-4 border-[#2D8A70]"></div>
              {/* Cercle intérieur vert turquoise */}
              <div className="absolute inset-4 rounded-full bg-[#3DC39E] flex items-center justify-center">
                <img 
                  src="/icons/check.png" 
                  alt="Check" 
                  className="w-12 h-12 object-contain"
                />
              </div>
            </motion.div>

            {/* Titre principal */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              {t('successTitle')}
            </motion.h2>

            {/* Message de statut */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-white mb-4"
            >
              {t('successMessage')}
            </motion.p>

            {/* Message motivationnel */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white/90 mb-8 leading-relaxed"
            >
              {t('successSubtitle')}
            </motion.p>

            {/* Bouton Se connecter */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={handleSuccessContinue}
              className="w-full text-white py-4 px-6 rounded-full font-bold hover:opacity-90 focus:ring-4 focus:ring-white/30 transition-all duration-200 flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(to right, #80E3B3, #2FE0E7)',
                borderRadius: '9999px'
              }}
            >
              {t('signIn')}
            </motion.button>
          </motion.div>
        </div>
      )}
    </AuthGuard>
  );
} 