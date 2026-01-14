'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowRight, Calculator, Shield, TrendingUp, Heart, Wallet, 
  Users, Star, CheckCircle, Smartphone, Apple, Play, 
  Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin,
  Eye, Zap, Building, Leaf, Gift, Bookmark, ChevronDown
} from 'lucide-react';
import CampaignCard from '@/components/CampaignCard';
import { campaigns } from '@/data/mockData';

export default function Home() {
  const featuredCampaigns = campaigns.slice(0, 3);

  const testimonials = [
    {
      name: 'Amina K.',
      role: 'Utilisatrice Amane+',
      location: 'Abidjan, Côte d\'Ivoire',
      content: 'Amane+ a transformé ma façon de gérer mes obligations religieuses. La simplicité et la transparence sont remarquables.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Omar D.',
      role: 'Investisseur Halal',
      location: 'Dakar, Sénégal',
      content: 'Grâce à Amane+, je peux investir en toute sérénité. La plateforme respecte mes principes islamiques tout en offrant de bons rendements.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Fatima M.',
      role: 'Cliente Takaful',
      location: 'Bamako, Mali',
      content: 'La protection Takaful d\'Amane+ me donne une vraie tranquillité d\'esprit. Une super app qui comprend mes besoins.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B302F]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-800 via-green-700 to-green-600 text-white overflow-hidden min-h-[600px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/Background.png"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="block">Transformez Votre <span className="text-[#5AB678]">Générosité</span></span>
              <span className="block">En Impact Réel Avec <span className="text-[#5AB678]">Amane+</span></span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-white text-center">
              La plateforme islamique tout-en-un pour vos dons, zakat, takaful et investissements halal.
            </p>
            <div className="flex justify-center">
              <Link href="/don">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/20 text-white px-8 py-4 rounded-4xl font-semibold hover:bg-white/30 transition-all duration-200 flex items-center space-x-2 shadow-lg border-1 border-white/20"
                >
                  <span>Découvrir Amane+</span>
                  <div className="bg-[#38B7B1] rounded-full p-2">
                    <ArrowRight size={20} />
                  </div>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section "Vivez la spiritualité à l'ère du digital" */}
      <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #8ECAAB, #38B7B1)' }}>
        {/* Image à gauche - masquée sur mobile */}
        <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 opacity-30">
          <img src="/icons/Vector(1).png" alt="Decoration" className="h-64 w-auto" />
        </div>
        
        {/* Image au centre - masquée sur mobile */}
        <div className="hidden md:block absolute left-24 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30">
          <img src="/icons/Vector(2).png" alt="Decoration" className="h-18 w-auto" />
        </div>

        {/* Image à droite (centre) - masquée sur mobile */}
        <div className="hidden md:block absolute right-6 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30">
          <img src="/icons/Vector(2).png" alt="Decoration" className="h-18 w-auto" />
        </div>
        
        {/* Image à droite - masquée sur mobile */}
        <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 opacity-30">
          <img src="/icons/Vector(3).png" alt="Decoration" className="h-64 w-auto" />
        </div>
        
        {/* Image unique pour mobile - centrée */}
        <div className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30">
          <img src="/icons/Vector(2).png" alt="Decoration" className="h-32 w-auto" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Vivez la spiritualité à l'ère du digital
            </h2>
            <p className="text-sm text-white/80 leading-relaxed">
              Amane+ est une solution technologique innovante qui vous permet de vivre pleinement vos valeurs religieuses dans le monde moderne. 
              Notre plateforme combine la tradition islamique avec les dernières innovations technologiques pour vous offrir une expérience financière 
              éthique, transparente et accessible. Que vous souhaitiez faire un don, calculer votre zakat, investir de manière halal ou vous protéger 
              avec le Takaful, Amane+ vous accompagne à chaque étape de votre parcours financier spirituel.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section "Un portefeuille éthique" */}
      <section className="py-20 bg-[#101919] text-white relative overflow-hidden">
        {/* Overlay avec couleur #43b48F et opacité réduite */}
        <div className="absolute inset-0 bg-[#43b48F] opacity-10 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 relative">
              <img
                src="/images/blur-bg.png"
                alt="Portefeuille éthique"
                className="rounded-2xl shadow-2xl opacity-90"
              />
              <img
                src="/images/wallet.png"
                alt="Wallet"
                className="absolute inset-0 w-full h-full object-contain rounded-2xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl lg:text-4xl font-bold text-[#5AB678] mb-6">
                  Un portefeuille éthique
                </h2>
                <p className="text-lg text-white/80 mb-6 leading-relaxed">
                  Gérez tous vos services financiers éthiques depuis une seule plateforme. Dons, zakat, investissements halal, 
                  épargne et protection Takaful - tout est accessible en quelques clics. Notre portefeuille éthique vous permet 
                  de suivre toutes vos transactions, de visualiser votre impact et de respecter vos obligations religieuses en toute simplicité.
                </p>
                <Link href="/portefeuille" className="inline-flex items-center space-x-2 text-[#5AB678] hover:text-green-200 font-semibold">
                  <span>En savoir plus</span>
                  <ArrowRight size={20} />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Section "Dons & Solidarité" */}
      <section className="py-32 bg-[#101919] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
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
                <h2 className="text-3xl lg:text-4xl font-bold text-[#5AB678] mb-6">
                  Dons & Solidarité
                </h2>
                <p className="text-lg text-white/80 mb-6 leading-relaxed">
                  Faites un don ponctuel ou récurrent à des campagnes vérifiées : santé, éducation, eau potable, aide alimentaire, orphelins, etc.
                </p>
                <p className="text-lg text-[#5AB678] mb-6 leading-relaxed italic">
                  Le Prophète ﷺ a dit : « La charité n'a jamais diminué une richesse. » (Mouslim)
                </p>
                <p className="text-lg text-white/80 mb-6 leading-relaxed">
                  Chaque geste est tracé jusqu'à l'impact final.
                </p>
                <Link href="/don" className="inline-flex items-center space-x-2 text-[#5AB678] hover:text-[#5AB678]/80 font-semibold">
                  <span>En savoir plus</span>
                  <ArrowRight size={20} />
                </Link>
              </motion.div>
            </div>
            {/* Image pour mobile - visible uniquement sur mobile */}
            <div className="lg:hidden mt-8 -mr-4 sm:-mr-6">
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
                <img
                  src="/images/plants.png"
                  alt="Dons & Solidarité"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Image alignée à droite pour desktop - cachée sur mobile */}
        <div className="hidden lg:flex absolute left-[50%] -right-2 top-12 bottom-12 items-center justify-end pr-0">
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
            <img
              src="/images/plants.png"
              alt="Dons & Solidarité"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Section "Zakat Automatisée" */}
      <section className="py-32 text-white relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #BFC99E, #20B6B3)' }}>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image pour mobile - visible uniquement sur mobile */}
            <div className="lg:hidden mt-8 -ml-4 sm:-ml-6 order-2 lg:order-1">
              <div 
                className="relative z-0 w-full"
                style={{
                  aspectRatio: '868/579',
                  borderRadius: '0 289.5px 289.5px 0',
                  border: '3px solid #fff',
                  overflow: 'hidden',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                }}
              >
                <img
                  src="/images/sadaq.png"
                  alt="Zakat"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="lg:col-start-2 order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl lg:text-4xl font-bold text-green-900 mb-6">
                  Zakat Automatisée
                </h2>
                <p className="text-lg text-green-800 mb-6 leading-relaxed">
                  Calculez et distribuez votre zakat en toute simplicité grâce à notre système automatisé. 
                  Notre calculateur intelligent respecte tous les principes islamiques et vous guide étape par étape. 
                  Vous pouvez ensuite distribuer votre zakat à des causes vérifiées et suivre l'impact de votre contribution.
                </p>
                <Link href="/zakat" className="inline-flex items-center space-x-2 text-green-800 hover:text-green-900 font-semibold">
                  <span>En savoir plus</span>
                  <ArrowRight size={20} />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
        {/* Image alignée à gauche pour desktop - cachée sur mobile */}
        <div className="hidden lg:flex absolute -left-16 right-[50%] top-20 bottom-20 items-center justify-start pl-3">
          <div 
            className="relative z-0 w-full max-w-[588px]"
            style={{
              aspectRatio: '868/579',
              borderRadius: '0 289.5px 289.5px 0',
              border: '3px solid #fff',
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
            }}
          >
            <img
              src="/images/sadaq.png"
              alt="Zakat"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Section "Takaful (Assurance Islamique)" */}
      <section className="py-32 text-white relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #0B302F, #229693)' }}>
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/bg.png"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0B302F]/40" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
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
                <h2 className="text-3xl lg:text-4xl font-bold text-[#5AB678] mb-6">
                  Takaful (Assurance Islamique)
                </h2>
                <p className="text-lg text-white/80 mb-6 leading-relaxed">
                Contribuez à un fonds d’entraide pour soutenir les membres en cas de coup dur — sans intérêt ni spéculation.
                </p>
                <p className="text-lg text-[#5AB678] mb-6 leading-relaxed italic">
                Le Prophète ﷺ a dit : « Les croyants, dans leur amour, leur miséricorde et leur compassion mutuels, sont comme un seul corps. » (Boukhari et Mouslim)
                </p>
                <p className="text-lg text-white/80 mb-6 leading-relaxed">
                Une communauté qui s’assure mutuellement, dans l’esprit du partage.
                </p>
                <Link href="/takaful" className="inline-flex items-center space-x-2 text-[#5AB678] hover:text-[#5AB678]/80 font-semibold">
                  <span>En savoir plus</span>
                  <ArrowRight size={20} />
                </Link>
              </motion.div>
            </div>
            {/* Image pour mobile - visible uniquement sur mobile */}
            <div className="lg:hidden mt-8 -mr-4 sm:-mr-6">
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
                <img
                  src="/images/voile.png"
                  alt="Takaful"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Image alignée à droite pour desktop - cachée sur mobile */}
        <div className="hidden lg:flex absolute left-[50%] -right-2 top-12 bottom-12 items-center justify-end pr-0">
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
            <img
              src="/images/voile.png"
              alt="Takaful"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Section "Investissements Halal" */}
      <section className="py-32 text-white relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #5AB678, #226C3A)' }}>
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/bg(2).png"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#226C3A]/40" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image pour mobile - visible uniquement sur mobile */}
            <div className="lg:hidden mt-8 -ml-4 sm:-ml-6 order-2 lg:order-1">
              <div 
                className="relative z-0 w-full"
                style={{
                  aspectRatio: '868/579',
                  borderRadius: '0 289.5px 289.5px 0',
                  border: '3px solid #fff',
                  overflow: 'hidden',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                }}
              >
                <img
                  src="/images/invest-w.png"
                  alt="Investissements Halal"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="lg:col-start-2 order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                  Investissements Halal
                </h2>
                <p className="text-lg text-white mb-6 leading-relaxed">
                Placez votre argent dans des projets conformes à la finance islamique, et faites fructifier vos revenus de manière éthique
                </p>
                <p className="text-lg text-[#07352A] mb-6 leading-relaxed italic">
                  Le Prophète ﷺ a dit : « Cherchez ce qui est licite, car Allah n’accepte que ce qui est licite. » (Tabarani)
                </p>
                <p className="text-lg text-white mb-6 leading-relaxed">
                Investissez sans compromis, selon vos valeurs.
                </p>
                <Link href="/investir" className="inline-flex items-center space-x-2 text-white hover:text-white/80 font-semibold">
                  <span>En savoir plus</span>
                  <ArrowRight size={20} />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
        {/* Image alignée à gauche pour desktop - cachée sur mobile */}
        <div className="hidden lg:flex absolute -left-16 right-[50%] top-20 bottom-20 items-center justify-start pl-3">
          <div 
            className="relative z-0 w-full max-w-[588px]"
            style={{
              aspectRatio: '868/579',
              borderRadius: '0 289.5px 289.5px 0',
              border: '3px solid #fff',
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
            }}
          >
            <img
              src="/images/invest-w.png"
              alt="Zakat"
              className="w-full h-full object-cover"
            />
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
        <div className="absolute inset-0">
          <img
            src="/images/hope.png"
            alt="Distribution Alimentaire"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-white">
              <span className="block">Distribution Alimentaire Pendant</span>
              <span className="block">Le Ramadan</span>
            </h2>
            <p className="text-lg text-white mb-8 leading-relaxed max-w-2xl mx-auto">
              Grâce à la générosité des fidèles, des vivres essentiels ont été distribués aux familles les plus modestes durant le Ramadan, apportant espoir et bénédiction à leurs tables.
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
            <div className="flex justify-center mt-8 space-x-2">
              <div className="w-2 h-2 bg-white rounded-full" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-2 h-2 border border-white rounded-full" />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section "Pourquoi choisir Amane+ ?" */}
      <section className="py-20 bg-green-800 text-white relative overflow-hidden">
        <div className="absolute left-0 top-0 w-96 h-96 bg-green-400/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Pourquoi choisir <span className="text-green-300">Amane+</span> ?
            </h2>
            <p className="text-lg text-green-100 max-w-3xl mx-auto">
              Une plateforme qui combine innovation technologique, conformité islamique et impact communautaire
            </p>
          </motion.div>

          {/* Three Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Eye,
                title: 'Transparence Totale',
                features: ['Rapports détaillés en temps réel', 'Traçabilité complète des fonds', 'Audit externe annuel']
              },
              {
                icon: Shield,
                title: 'Conformité à la Charia',
                features: ['Validation par des oulémas', 'Zéro intérêt (riba)', 'Investissements éthiques']
              },
              {
                icon: Zap,
                title: 'Innovation Technologique',
                features: ['Blockchain pour la traçabilité', 'IA pour l\'optimisation', 'Sécurité de niveau bancaire']
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-green-900/50 backdrop-blur-sm rounded-2xl p-8 border border-green-700"
              >
                <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mb-6">
                  <feature.icon size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-green-100">
                      <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Fiabilité', value: '99.99% Taux de Réussite', icon: Shield },
              { label: 'Sécurité', value: 'Certification ISO 27001', icon: Shield },
              { label: 'Réseau mondial', value: '15+ Pays', icon: Building },
              { label: 'Partenariats', value: '50+ Organisations', icon: Users }
            ].map((indicator, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-green-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-700 text-center"
              >
                <indicator.icon size={24} className="text-green-400 mx-auto mb-3" />
                <p className="text-sm text-green-300 mb-2">{indicator.label}</p>
                <p className="text-lg font-bold">{indicator.value}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/don">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-400 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-300 transition-all duration-200 shadow-lg"
              >
                Découvrir nos solutions
              </motion.button>
            </Link>
            <Link href="/marketplace">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-green-800 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-all duration-200 border-2 border-white"
              >
                Voir nos partenariats
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section "Ce que disent nos utilisateurs" */}
      <section className="py-20 bg-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-lg text-green-100 max-w-3xl mx-auto">
              Découvrez pourquoi des milliers d'utilisateurs font confiance à Amane+
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-green-900/50 backdrop-blur-sm rounded-2xl p-8 border border-green-700"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-green-300">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-green-100 mb-4 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-current" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section "Campagnes populaires" */}
      <section className="py-20 bg-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-green-900 mb-6">
              Campagnes populaires
            </h2>
            <p className="text-lg text-green-800 max-w-3xl mx-auto">
              Découvrez nos campagnes les plus populaires et soutenez des causes importantes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {featuredCampaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-green-900 mb-3">{campaign.title}</h3>
                    <p className="text-green-800 mb-4 text-sm">{campaign.description}</p>
                    <div className="mb-4">
                      <div className="w-full bg-green-100 rounded-full h-2 mb-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((campaign.currentAmount / campaign.targetAmount) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-green-800">
                        <span>{campaign.currentAmount.toLocaleString()} XOF</span>
                        <span>{campaign.targetAmount.toLocaleString()} XOF</span>
                      </div>
                    </div>
                    <Link href={`/campagnes/${campaign.id}`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-green-400 text-white py-3 rounded-xl font-semibold hover:bg-green-500 transition-all duration-200"
                      >
                        Faire un don
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/campagnes">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-400 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-500 transition-all duration-200 shadow-lg"
              >
                Voir plus
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section "Emportez Amane+ partout avec vous" */}
      <section className="py-20 text-white" style={{ background: 'linear-gradient(to bottom, #BFC99E, #20B6B3)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=600&h=800&fit=crop"
                alt="App Mobile"
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                  Emportez Amane+ partout avec vous
                </h2>
                <p className="text-lg text-green-100 mb-8 leading-relaxed">
                  Téléchargez notre application mobile et accédez à tous vos services financiers éthiques où que vous soyez. 
                  Gérez vos dons, calculez votre zakat, suivez vos investissements et bien plus encore, directement depuis votre smartphone.
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
      <section className="py-20 bg-green-800 text-white">
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

      {/* Section "Prêt à rejoindre notre communauté ou nous contacter ?" */}
      <section className="py-20 bg-green-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-green-900 mb-8">
              Prêt à rejoindre notre communauté ou nous contacter ?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/inscription">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-green-800 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-all duration-200 border-2 border-green-800 shadow-lg"
                >
                  Rejoindre la communauté
                </motion.button>
              </Link>
              <Link href="/connexion">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-green-800 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-900 transition-all duration-200 shadow-lg"
                >
                  Nous contacter
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
