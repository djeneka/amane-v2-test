"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Users, Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";

export default function ConnexionPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const success = await login(email, password);
      if (success) {
        router.push('/');
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } catch (error) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
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
              className="flex items-center justify-center p-8 lg:p-12 min-h-screen relative"
              style={{
                backgroundImage: 'url(/images/bg-s.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Overlay noir avec opacité réduite */}
              <div className="absolute inset-0 bg-black/60"></div>
              
              <div className="w-full max-w-lg px-4 relative z-10">
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
                    Votre intention est noble, vos actions trouveront bénédiction.
                  </p>
                  <p className="text-white text-lg">
                    Connectez-vous.
                  </p>
                </motion.div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 z-10" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-0 rounded-2xl focus:ring-2 focus:ring-white/50 focus:bg-white/90 transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Votre Email / Numéro de téléphone"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 z-10" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-white/80 backdrop-blur-sm border-0 rounded-2xl focus:ring-2 focus:ring-white/50 focus:bg-white/90 transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Mot de passe"
                      required
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
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-between"
                >
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-green-800 border-gray-400 rounded focus:ring-green-500 bg-white/80"
                    />
                    <span className="ml-2 text-sm text-white">Se souvenir de moi</span>
                  </label>
                  <Link
                    href="/mot-de-passe-oublie"
                    className="text-sm text-green-300 hover:text-green-200 font-medium transition-colors underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
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
                      Se connecter
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Séparateur */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center my-6"
              >
                <div className="flex-1 h-px bg-white/30"></div>
                <span className="px-4 text-sm text-white/80">Ou se connecter avec</span>
                <div className="flex-1 h-px bg-white/30"></div>
              </motion.div>

              {/* Boutons de connexion sociale */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="grid grid-cols-2 gap-4 mb-6"
              >
                <button
                  type="button"
                  onClick={() => {
                    // Mock: Simuler la connexion Google
                    console.log('Connexion Google');
                    // Ici vous pouvez ajouter la logique de connexion Google
                  }}
                  className="flex items-center justify-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl py-4 px-4 hover:bg-white/90 transition-all duration-200"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-gray-900 font-medium">Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Mock: Simuler la connexion Facebook
                    console.log('Connexion Facebook');
                    // Ici vous pouvez ajouter la logique de connexion Facebook
                  }}
                  className="flex items-center justify-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl py-4 px-4 hover:bg-white/90 transition-all duration-200"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-gray-900 font-medium">Facebook</span>
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-center"
              >
                <p className="text-white">
                  Vous n'avez pas encore de compte ?{" "}
                  <Link
                    href="/inscription"
                    className="text-green-300 hover:text-green-200 font-medium transition-colors underline"
                  >
                    S'inscrire
                  </Link>
                </p>
              </motion.div>
              </div>
            </motion.div>
        </div>
      </div>
    </AuthGuard>
  );
} 