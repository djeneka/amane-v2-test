'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowRight, Heart, Users, MapPin, Calendar, ArrowLeft, ChevronDown,
  Apple, Play, TrendingUp, Bookmark
} from 'lucide-react';
import { campaigns, takafulProducts, donations } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

export default function CommunautePage() {
  const { isAuthenticated } = useAuth();
  const [currentTakafulSlide, setCurrentTakafulSlide] = useState(0);
  const featuredCampaigns = campaigns.slice(0, 3);

  const slides = [
    {
      image: '/images/hope.png',
      title: 'Distribution Alimentaire Pendant Le Ramadan',
      description: 'Grâce à la générosité des fidèles, des vivres essentiels ont été distribués aux familles les plus modestes durant le Ramadan, apportant espoir et bénédiction à leurs tables.',
      impact: '+ 2500 repas distribués'

    },
    {
      image: '/images/skemoo.png',
      title: 'Distribution Alimentaire Pendant Le Ramadan',
      description: 'Grâce à la générosité des fidèles, des vivres essentiels ont été distribués aux familles les plus modestes durant le Ramadan, apportant espoir et bénédiction à leurs tables.',
      impact: '+ 1500 repas distribués'
    }
  ];
  const [currentSlide, setCurrentSlide] = useState(0);


  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0B302F]">
      {/* Section "Dons" */}
      <section className="py-32 text-white relative overflow-hidden" style={{ background: 'linear-gradient(to right, #0B302F, #101919)' }}>
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/bg.png"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#101919]/70" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                {/* Étoile décorative */}
                <div className="mb-4">
                  <img src="/icons/Vector(2).png" alt="Star" className="h-6 w-6 text-[#5AB678]" />
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                      {slides[currentSlide].title}
                    </h2>
                    <p className="text-lg text-white/80 mb-6 leading-relaxed">
                      {slides[currentSlide].description}
                    </p>
                    <p className="text-lg text-[#5AB678] font-bold mb-6 leading-relaxed">
                      {slides[currentSlide].impact}
                    </p>
                  </motion.div>
                </AnimatePresence>
                {/* <Link href="/campagnes" className="inline-flex items-center space-x-2 text-[#5AB678] hover:text-[#5AB678]/80 font-semibold">
                  <span>En savoir plus</span>
                  <ArrowRight size={20} />
                </Link> */}
              </motion.div>
            </div>
            {/* Image slider pour mobile - visible uniquement sur mobile */}
            <div className="lg:hidden mt-8 -mr-4 sm:-mr-6 relative">
              <div 
                className="relative z-0 w-full"
                style={{
                  aspectRatio: '868/579',
                  borderRadius: '289.5px 0 0 289.5px',
                  border: '3px solid #5AB678',
                  overflow: 'hidden',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    <img
                      src={slides[currentSlide].image}
                      alt="Distribution Alimentaire"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
        {/* Image slider alignée à droite pour desktop - cachée sur mobile */}
        <div className="hidden lg:flex absolute left-[50%] -right-2 top-12 bottom-12 items-center justify-end pr-0 z-10">
          <div 
            className="relative z-0 w-full max-w-[688px]"
            style={{
              aspectRatio: '868/579',
              borderRadius: '289.5px 0 0 289.5px',
              border: '3px solid #5AB678',
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <img
                  src={slides[currentSlide].image}
                  alt="Distribution Alimentaire"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimatePresence>
            {/* Navigation buttons pour desktop */}
            <button
              onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
              disabled={currentSlide === 0}
              aria-label="Slide précédent"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-[#5AB678] disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-3 z-10 transition-colors"
            >
              <ArrowLeft size={24} className="text-white" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))}
              disabled={currentSlide === slides.length - 1}
              aria-label="Slide suivant"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-[#5AB678] disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-3 z-10 transition-colors"
            >
              <ArrowRight size={24} className="text-white" />
            </button>
          </div>
        </div>
        {/* Navigation dots - Centré en bas de la section */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 ${
                index === currentSlide
                  ? 'w-3 h-3 bg-white rounded-full'
                  : 'w-3 h-3 border-2 border-white rounded-full hover:bg-white/50'
              }`}
              aria-label={`Aller au slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

        {/* Section Nos Donations */}
        <section className="py-20 text-white relative overflow-hidden" style={{ background: 'linear-gradient(to left, #226c3a, #5ab678)' }}>
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
            {/* Left Side - Title and Description */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center lg:text-start max-w-2xl lg:ml-16"
            >
                <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Dernières <br />
                 <span className="text-[#226c3a]">Cagnottes / Dons</span> Créés
                </h2>
                <p className="text-lg text-white/90 leading-relaxed mb-8">
                    Rejoignez la dynamique collective 
                    Le <span className="text-[#20B6B3] font-semibold">d’Amane+.</span> Contribuez aux projets en cours et aidez à transformer de belles intentions en actions concrètes.
                </p>
            </motion.div>

            {/* Right Side - Product Cards Slider */}
            <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
            >
                <div className="relative overflow-hidden">
                <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentTakafulSlide * 100}%)` }}
                >
                    {donations.map((product) => (
                    <div key={product.id} className="min-w-full px-2">
                        <div className="bg-white rounded-3xl overflow-hidden relative" style={{ height: '600px' }}>
                        <div className="absolute inset-0">
                            <img 
                            src={product.image} 
                            alt={product.title} 
                            className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-6">
                            <h3 className="text-white text-2xl font-bold mb-2">{product.title}</h3>
                            <p className="text-white/90 text-sm mb-4 line-clamp-3">
                            {product.description}
                            </p>
                            <Link href={`/campagnes/${product.id}`}>
                            <button className="border-2 border-white text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-white/10 transition-colors">
                                En savoir plus
                            </button>
                            </Link>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
                </div>

                {/* Navigation Buttons */}
                <button
                onClick={() => setCurrentTakafulSlide((prev) => Math.max(0, prev - 1))}
                disabled={currentTakafulSlide === 0}
                aria-label="Carte précédente"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-[#00644D] disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-3 z-10 transition-colors"
                >
                <ArrowLeft size={28} className="text-white" />
                </button>
                <button
                onClick={() => setCurrentTakafulSlide((prev) => Math.min(takafulProducts.length - 1, prev + 1))}
                disabled={currentTakafulSlide === takafulProducts.length - 1}
                aria-label="Carte suivante"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-3 z-10 transition-colors"
                >
                <ArrowRight size={28} className="text-white" />
                </button>

                {/* Pagination Dots */}
                <div className="flex justify-center gap-2 mt-6">
                {takafulProducts.map((_, index) => (
                    <button
                    key={index}
                    onClick={() => setCurrentTakafulSlide(index)}
                    aria-label={`Aller au produit ${index + 1}`}
                    title={`Aller au produit ${index + 1}`}
                    className={`w-2 h-2 rounded-full transition-all ${
                        currentTakafulSlide === index 
                        ? 'bg-white w-8' 
                        : 'bg-white/30'
                    }`}
                    />
                ))}
                </div>
            </motion.div>
            </div>

            {/* Bouton Voir tous les produits - En dehors de la grid */}
            <div className="text-center mt-12">
            <Link href="/takaful">
                <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-1 border-white text-white px-6 py-3 rounded-3xl font-semibold flex items-center gap-2 w-fit mx-auto hover:bg-white/10 transition-colors"
                >
                Voir tous les produits
                <ArrowRight size={20} />
                </motion.button>
            </Link>
            </div>
        </div>
        </section>

      {/* Section "Campagnes populaires" - Affichée en premier quand connecté */}
      <section className="py-20 text-white" style={{ background: 'linear-gradient(to left, #8FC99E, #20B6B3)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Campagnes populaires
            </h2>
            <p className="text-lg text-white max-w-3xl mx-auto">
              Découvrez nos campagnes les plus populaires et soutenez des causes importantes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {featuredCampaigns.map((campaign, index) => {
              const percentage = Math.min((campaign.currentAmount / campaign.targetAmount) * 100, 100);
              const endDate = new Date(campaign.endDate);
              const formattedDate = endDate.toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              });
              
              const categoryLabels: Record<string, string> = {
                'urgence': 'Urgence',
                'education': 'Éducation',
                'sante': 'Santé',
                'developpement': 'Développement',
                'refugies': 'Réfugiés'
              };
              
              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-[#101919] rounded-2xl overflow-hidden shadow-lg">
                    <div className="relative">
                      <img
                        src={campaign.image}
                        alt={campaign.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-[#10191983] text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {categoryLabels[campaign.category] || campaign.category}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl lg:text-2xl font-bold text-white mb-3">
                        {campaign.title}
                      </h3>
                    <p className="text-white/70 text-sm mb-2 leading-relaxed">
                      {campaign.description}
                    </p>
                    <p className="text-white/70 text-sm mb-4 leading-relaxed">
                      {campaign.impact}
                    </p>
                    
                    {/* Location and Deadline */}
                    <div className="flex justify-between items-center mb-4 text-sm text-white/70">
                      <div className="flex items-center space-x-2">
                        <MapPin size={16} className="text-green-800" />
                        <span>{campaign.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-green-800" />
                        <span>Fin: {formattedDate}</span>
                      </div>
                    </div>

                    {/* Funding Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-bold">
                          {campaign.currentAmount.toLocaleString('fr-FR')} F CFA / {campaign.targetAmount.toLocaleString('fr-FR')} F CFA
                        </span>
                        <span className="text-white">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${percentage}%`,
                            background: 'linear-gradient(to right, #5AB678, #20B6B3)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Beneficiaries */}
                    <div className="flex items-center space-x-2 mb-6 text-sm text-white/70">
                      <Users size={16} className="text-green-800" />
                      <span>{campaign.beneficiaries.toLocaleString('fr-FR')} bénéficiaires</span>
                    </div>

                    {/* CTA Button */}
                    <Link href={`/campagnes/${campaign.id}`}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full text-white py-3 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                        style={{ background: 'linear-gradient(to right, #5AB678, #20B6B3)' }}
                      >
                        <Heart size={18} className="fill-white" />
                        <span>Soutenir cette campagne</span>
                        <ArrowRight size={18} />
                      </motion.button>
                    </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center">
            <Link href="/campagnes">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className=" text-white px-8 py-4 rounded-4xl font-semibold hover:bg-green-500 transition-all duration-200 shadow-lg"
                style={{ background: 'linear-gradient(to bottom, #00644D, #101919)' }}
              >
                Voir toutes les campagnes
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

        {/* Section "Actualités" */}
        <section className="py-20 bg-[#101919] text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-[#5AB678]">
                Actualités
                </h2>
                <p className="text-lg text-white/80 mb-4 leading-relaxed">
                Découvrez les dernières initiatives, événements et moments forts d'<span className="text-[#5AB678]">Amane+</span>.
                </p>
                <p className="text-lg text-white/80 mb-8 leading-relaxed">
                Plongez au cœur de nos actions et suivez l'impact de notre communauté en images.
                </p>
                <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                className="flex justify-center"
                >
                <ChevronDown size={32} className="text-[#5AB678]" />
                </motion.div>
            </motion.div>
            </div>
        </section>

        {/* Section "Distribution Alimentaire Pendant Le Ramadan" */}
        <section className="relative text-white overflow-hidden min-h-[680px] flex items-center m-6">
            <AnimatePresence mode="wait">
            <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
            >
                <img
                src={slides[currentSlide].image}
                alt="Distribution Alimentaire"
                className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60" />
            </motion.div>
            </AnimatePresence>
            
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 w-full z-10">
            <AnimatePresence mode="wait">
                <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                >
                <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-white">
                    <span className="block">Distribution Alimentaire Pendant</span>
                    <span className="block">Le Ramadan</span>
                </h2>
                <p className="text-lg text-white mb-8 leading-relaxed max-w-2xl mx-auto">
                    {slides[currentSlide].description}
                </p>
                <Link href="/don">
                    <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-white px-8 py-4 rounded-4xl font-semibold transition-all duration-200 shadow-lg"
                    style={{ background: 'linear-gradient(to right, #8FC99E, #20B6B3)' }}
                    >
                    En savoir plus
                    </motion.button>
                </Link>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-center mt-8 space-x-2">
                {slides.map((_, index) => (
                <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`transition-all duration-300 ${
                    index === currentSlide
                        ? 'w-2 h-2 bg-white rounded-full'
                        : 'w-2 h-2 border border-white rounded-full hover:bg-white/50'
                    }`}
                    aria-label={`Aller au slide ${index + 1}`}
                />
                ))}
            </div>
            </div>
        </section>

        {/* Section Nos produits Takafuls */}
        <section className="py-20 text-white relative overflow-hidden" style={{ background: 'linear-gradient(to left, #101919, #00644D)' }}>
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
            {/* Left Side - Title and Description */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center lg:text-start max-w-2xl lg:ml-16"
            >
                <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Découvrez nos <br />
                Produits <span className="text-[#20B6B3]">Takaful</span>
                </h2>
                <p className="text-lg text-white/90 leading-relaxed mb-8">
                Protégez-vous et vos proches grâce à des solutions d'assurance conformes aux principes islamiques. 
                Le <span className="text-[#20B6B3] font-semibold">Takaful d'Amane+</span> repose sur la solidarité et le partage, 
                pour un avenir plus sûr et équitable.
                </p>
            </motion.div>

            {/* Right Side - Product Cards Slider */}
            <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
            >
                <div className="relative overflow-hidden">
                <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentTakafulSlide * 100}%)` }}
                >
                    {takafulProducts.map((product) => (
                    <div key={product.id} className="min-w-full px-2">
                        <div className="bg-white rounded-3xl overflow-hidden relative" style={{ height: '600px' }}>
                        <div className="absolute inset-0">
                            <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-6">
                            <h3 className="text-white text-2xl font-bold mb-2">{product.name}</h3>
                            <p className="text-white/90 text-sm mb-4 line-clamp-3">
                            {product.description}
                            </p>
                            <Link href={`/takaful/${product.id}`}>
                            <button className="border-2 border-white text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-white/10 transition-colors">
                                En savoir plus
                            </button>
                            </Link>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
                </div>

                {/* Navigation Buttons */}
                <button
                onClick={() => setCurrentTakafulSlide((prev) => Math.max(0, prev - 1))}
                disabled={currentTakafulSlide === 0}
                aria-label="Carte précédente"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-[#00644D] disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-3 z-10 transition-colors"
                >
                <ArrowLeft size={28} className="text-white" />
                </button>
                <button
                onClick={() => setCurrentTakafulSlide((prev) => Math.min(takafulProducts.length - 1, prev + 1))}
                disabled={currentTakafulSlide === takafulProducts.length - 1}
                aria-label="Carte suivante"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-3 z-10 transition-colors"
                >
                <ArrowRight size={28} className="text-white" />
                </button>

                {/* Pagination Dots */}
                <div className="flex justify-center gap-2 mt-6">
                {takafulProducts.map((_, index) => (
                    <button
                    key={index}
                    onClick={() => setCurrentTakafulSlide(index)}
                    aria-label={`Aller au produit ${index + 1}`}
                    title={`Aller au produit ${index + 1}`}
                    className={`w-2 h-2 rounded-full transition-all ${
                        currentTakafulSlide === index 
                        ? 'bg-white w-8' 
                        : 'bg-white/30'
                    }`}
                    />
                ))}
                </div>
            </motion.div>
            </div>

            {/* Bouton Voir tous les produits - En dehors de la grid */}
            <div className="text-center mt-12">
            <Link href="/takaful">
                <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-1 border-white text-white px-6 py-3 rounded-3xl font-semibold flex items-center gap-2 w-fit mx-auto hover:bg-white/10 transition-colors"
                >
                Voir tous les produits
                <ArrowRight size={20} />
                </motion.button>
            </Link>
            </div>
        </div>
        </section>

        {/* Section "L'impact d'Amane+ en chiffres" */}
        
        <section className="py-20 text-white" style={{ background: 'linear-gradient(193deg, #00644D -74.99%, #101919 119.08%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
            >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                <span className="text-white">L'impact d'</span>
                <span className="text-[#5AB678]">Amane+</span>
                <span className="text-white"> en chiffres</span>
            </h2>
            <p className="text-lg text-white/90 max-w-3xl mx-auto mt-4">
                Découvrez comment la foi, la solidarité et la transparence se traduisent en actions réelles.
            </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
                { 
                value: '15,247', 
                label: 'Donateurs actifs', 
                icon: Users, 
                iconBg: 'bg-[#5AB678]',
                iconColor: 'text-[#5AB678]',
                cardBg: 'bg-[#152A2A]'
                },
                { 
                value: '8.5%', 
                label: 'Rendement moyen', 
                icon: TrendingUp, 
                iconBg: 'bg-[#5AB678]',
                iconColor: 'text-[#5AB678]',
                cardBg: 'bg-[#152A2A]'
                },
                { 
                value: '50+', 
                label: 'Campagnes actives', 
                icon: Heart, 
                iconBg: 'bg-pink-500',
                iconColor: 'text-pink-500',
                cardBg: 'bg-[#152A2A]'
                },
                { 
                value: '200+', 
                label: 'Produits halal', 
                icon: Bookmark, 
                iconBg: 'bg-purple-500',
                iconColor: 'text-purple-500',
                cardBg: 'bg-[#152A2A]'
                }
            ].map((stat, index) => (
                <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`${stat.cardBg} rounded-3xl p-6 text-center shadow-lg border border-white/10`}
                >
                <div className={`${stat.iconBg} rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
                    <stat.icon size={32} className="text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    {stat.value}
                </div>
                <p className="text-white/80 text-sm font-medium">{stat.label}</p>
                </motion.div>
            ))}
            </div>
        </div>
        </section>

    {/* Section "Emportez Amane+ partout avec vous" */}
    <section className="py-20" style={{ background: 'linear-gradient(to bottom, #D6FCF6, #229693)' }}>
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
                Retrouvez toutes les fonctionnalités d’Amane+ dans une seule application. Faites vos dons, suivez vos rendements, automatisez votre Zakat et participez à des actions solidaires, où que vous soyez.
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

      {/* Section "Ils nous font confiance" */}
      <section className="py-20 bg-[#043232] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-12">
              Ils nous font confiance
            </h2>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-8 opacity-60">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white/20 rounded-lg h-16 flex items-center justify-center">
                  <span className="text-white/50 text-sm">Logo {i}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
