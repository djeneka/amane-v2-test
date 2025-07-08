"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Users, Heart } from "lucide-react";
import Link from "next/link";

export default function ConnexionPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simuler une connexion
    setTimeout(() => {
      setIsLoading(false);
      // Ici vous ajouteriez votre logique de connexion réelle
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-4rem)]">
            
            {/* Section de gauche - Formulaire */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-24 h-24 mx-auto mb-6 flex items-center justify-center"
                >
                  <img 
                    src="/AMANE UP-10.png" 
                    alt="Amane+ Logo" 
                    className="w-full h-full object-contain"
                  />
                </motion.div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Bienvenue sur Amane+
                </h1>
                <p className="text-gray-600">
                  Connectez-vous à votre espace personnel
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-400 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-400 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Votre mot de passe"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
                  </label>
                  <Link
                    href="/mot-de-passe-oublie"
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
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
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 focus:ring-4 focus:ring-emerald-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8 text-center"
              >
                <p className="text-gray-600">
                  Pas encore de compte ?{" "}
                  <Link
                    href="/inscription"
                    className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    Créer un compte
                  </Link>
                </p>
              </motion.div>
            </motion.div>

            {/* Section de droite - Informations */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="space-y-8">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Finance Islamique{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
                      Éthique
                    </span>
                  </h2>
                  <p className="text-xl text-gray-600 leading-relaxed">
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
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Heart className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Dons & Zakat
                      </h3>
                      <p className="text-gray-600">
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
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Protection Takaful
                      </h3>
                      <p className="text-gray-600">
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
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Investissements Halal
                      </h3>
                      <p className="text-gray-600">
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
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white"
                >
                  <h3 className="text-xl font-semibold mb-2">
                    Rejoignez notre communauté
                  </h3>
                  <p className="text-emerald-100">
                    Plus de 10,000 membres font confiance à Amane+ pour leurs 
                    besoins financiers éthiques.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 