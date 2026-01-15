"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar, ArrowRight, Shield, CheckCircle, Heart, Users, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";

export default function InscriptionPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // États pour la vérification
  const [step, setStep] = useState<'inscription' | 'verification' | 'success'>('inscription');
  const [verificationCode, setVerificationCode] = useState<string[]>(['', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Le numéro de téléphone est requis";
    }

    if (!formData.birthDate) {
      newErrors.birthDate = "La date de naissance est requise";
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    if (!acceptTerms) {
      newErrors.terms = "Vous devez accepter les conditions d'utilisation";
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
    
    try {
      // Simuler l'inscription sans connecter l'utilisateur
      // Dans un vrai cas, vous feriez un appel API pour créer le compte
      // mais sans créer de session
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Stocker temporairement les données d'inscription
      // (dans un vrai cas, le backend enverrait le code de vérification)
      localStorage.setItem('pending-registration', JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      }));
      
      // Passer à l'étape de vérification
      setStep('verification');
    } catch (error) {
      setErrors({ general: 'Une erreur est survenue. Veuillez réessayer.' });
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
    if (value && index < 4) {
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
    
    if (code.length !== 5) {
      setVerificationError('Veuillez entrer le code complet');
      return;
    }

    setIsVerifying(true);
    setVerificationError('');

    try {
      // Simuler la vérification du code
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock: Le code doit être "11111"
      if (code !== '11111') {
        setVerificationError('Code incorrect. Veuillez réessayer.');
        setIsVerifying(false);
        return;
      }
      
      // Vérifier que les données d'inscription existent
      const pendingData = localStorage.getItem('pending-registration');
      
      if (!pendingData) {
        setVerificationError('Une erreur est survenue. Veuillez réessayer.');
        setIsVerifying(false);
        return;
      }
      
      // Code correct : afficher le popup de succès (sans connecter l'utilisateur)
      // La connexion se fera au clic sur le bouton du popup
      setStep('success');
    } catch (error) {
      setVerificationError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSuccessContinue = async () => {
    try {
      // Récupérer les données d'inscription temporaires
      const pendingData = localStorage.getItem('pending-registration');
      
      if (pendingData) {
        const userData = JSON.parse(pendingData);
        
        // Maintenant seulement, on enregistre et connecte l'utilisateur
        const success = await register({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          password: userData.password,
        });
        
        if (success) {
          // Nettoyer les données temporaires
          localStorage.removeItem('pending-registration');
          
          // Rediriger vers l'accueil
          router.push('/');
        } else {
          // En cas d'erreur, revenir à l'étape de vérification
          setStep('verification');
          setVerificationError('Une erreur est survenue lors de la création du compte.');
        }
      } else {
        // Si les données n'existent plus, revenir à l'inscription
        setStep('inscription');
      }
    } catch (error) {
      setStep('verification');
      setVerificationError('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const handleResendCode = () => {
    // Mock: Simuler le renvoi du code
    setVerificationCode(['', '', '', '', '']);
    setVerificationError('');
    // Dans un vrai cas, vous feriez un appel API pour renvoyer le code
    console.log('Code renvoyé');
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
                    Finance Islamique{" "}
                    <span className="text-[#00644D]">
                      Éthique
                    </span>
                  </h2>
                  <p className="text-xl text-white/90 leading-relaxed">
                    Rejoignez Amane+ pour accéder à des services financiers conformes 
                    aux principes islamiques. Dons, zakat, investissements halal et protection takaful.
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
                        Dons & Zakat
                      </h3>
                      <p className="text-white/80">
                        Faites des dons en toute transparence et calculez votre zakat 
                        avec nos outils spécialisés.
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
                        Protection Takaful
                      </h3>
                      <p className="text-white/80">
                        Protégez-vous et vos proches avec nos solutions d'assurance 
                        conformes aux principes islamiques.
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
                        Investissements Halal
                      </h3>
                      <p className="text-white/80">
                        Investissez dans des projets éthiques et durables qui respectent 
                        les valeurs islamiques.
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
                    Rejoignez notre communauté
                  </h3>
                  <p className="text-[#00644D]/80">
                    Plus de 10,000 membres font confiance à Amane+ pour leurs 
                    besoins financiers éthiques.
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
                          As-salamu Alaykum !
                        </h1>
                        <p className="text-white text-lg mb-2">
                          Votre intention est noble, vos actions trouveront bénédiction. Inscrivez-vous pour commencer.
                        </p>
                      </motion.div>
                    </div>

                <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 z-10" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={`w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-0 rounded-2xl focus:ring-2 focus:ring-white/50 focus:bg-white/90 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                        errors.firstName ? "ring-2 ring-red-500" : ""
                      }`}
                      placeholder="Prénom"
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
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 z-10" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={`w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-0 rounded-2xl focus:ring-2 focus:ring-white/50 focus:bg-white/90 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                        errors.lastName ? "ring-2 ring-red-500" : ""
                      }`}
                      placeholder="Nom"
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
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 z-10" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-0 rounded-2xl focus:ring-2 focus:ring-white/50 focus:bg-white/90 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                      errors.email ? "ring-2 ring-red-500" : ""
                    }`}
                    placeholder="Votre Email / Numéro de téléphone"
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
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 z-10" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={`w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-0 rounded-2xl focus:ring-2 focus:ring-white/50 focus:bg-white/90 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                        errors.phone ? "ring-2 ring-red-500" : ""
                      }`}
                      placeholder="Téléphone"
                    />
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
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 z-10" />
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange("birthDate", e.target.value)}
                      aria-label="Date de naissance"
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
                transition={{ delay: 0.8 }}
              >
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 z-10" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`w-full pl-12 pr-12 py-4 bg-white/80 backdrop-blur-sm border-0 rounded-2xl focus:ring-2 focus:ring-white/50 focus:bg-white/90 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                      errors.password ? "ring-2 ring-red-500" : ""
                    }`}
                    placeholder="Mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
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
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 z-10" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={`w-full pl-12 pr-12 py-4 bg-white/80 backdrop-blur-sm border-0 rounded-2xl focus:ring-2 focus:ring-white/50 focus:bg-white/90 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                      errors.confirmPassword ? "ring-2 ring-red-500" : ""
                    }`}
                    placeholder="Confirmer le mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label={showConfirmPassword ? "Masquer la confirmation du mot de passe" : "Afficher la confirmation du mot de passe"}
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
                    J'accepte les{" "}
                    <Link href="/conditions" className="text-[#5AB678] hover:text-green-200 font-medium underline">
                      conditions d'utilisation
                    </Link>{" "}
                    et la{" "}
                    <Link href="/politique-confidentialite" className="text-[#5AB678] hover:text-green-200 font-medium underline">
                      politique de confidentialité
                    </Link>{" "}
                    d'Amane+
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-red-300 text-sm">{errors.terms}</p>
                )}

                <div className="bg-[#101919]/80 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-[#5AB678] mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-white/90">
                      <p className="font-medium mb-1 text-[#5AB678]">Vos données sont protégées</p>
                      <p>Nous respectons les principes islamiques et les réglementations RGPD. Vos informations personnelles sont sécurisées et ne seront jamais partagées sans votre consentement.</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                type="submit"
                disabled={isLoading}
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
                    Créer mon compte
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Séparateur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center my-6"
            >
              <div className="flex-1 h-px bg-white/30"></div>
              <span className="px-4 text-sm text-white/80">Ou s'inscrire avec</span>
              <div className="flex-1 h-px bg-white/30"></div>
            </motion.div>

            {/* Boutons de connexion sociale */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="grid grid-cols-2 gap-4 mb-6"
            >
              <button
                type="button"
                onClick={() => {
                  // Mock: Simuler l'inscription Google
                  console.log('Inscription Google');
                  // Ici vous pouvez ajouter la logique d'inscription Google
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
                  // Mock: Simuler l'inscription Facebook
                  console.log('Inscription Facebook');
                  // Ici vous pouvez ajouter la logique d'inscription Facebook
                }}
                className="flex items-center justify-center gap-3 bg-transparent backdrop-blur-sm rounded-2xl py-4 px-4 hover:bg-white/90 transition-all duration-200 border border-white/30"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-white font-medium">Facebook</span>
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="mt-8 text-center"
            >
              <p className="text-white">
                Déjà un compte ?{" "}
                <Link
                  href="/connexion"
                  className="text-[#5AB678] hover:text-green-200 font-medium transition-colors underline"
                >
                  Se connecter
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
                      Code de vérification
                    </motion.h1>

                    {/* Texte d'instruction */}
                    <motion.p
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-white/90 mb-8"
                    >
                      Veuillez entrer le code que nous venons de vous envoyer sur votre e-mail enregistré.
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
                        'Vérifier'
                      )}
                    </motion.button>

                    {/* Lien Renvoyer */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-white/80 text-sm"
                    >
                      Vous n'avez pas reçu de code ?{" "}
                      <button
                        onClick={handleResendCode}
                        className="text-[#5AB678] hover:text-[#5AB678]/80 font-medium underline transition-colors"
                      >
                        Renvoyer
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
              Alhamdulillah 🎉
            </motion.h2>

            {/* Message de statut */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-white mb-4"
            >
              Inscription réussie.
            </motion.p>

            {/* Message motivationnel */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white/90 mb-8 leading-relaxed"
            >
              Votre intention sincère est le premier pas vers un avenir halal et béni 🌱
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
              Se connecter
            </motion.button>
          </motion.div>
        </div>
      )}
    </AuthGuard>
  );
} 