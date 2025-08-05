'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Heart, Calculator, Shield, TrendingUp, ArrowRight, Sparkles, 
  Users, Target, Award, Globe, Wallet, Bookmark, CheckCircle,
  BarChart3, Star, Zap, Building, Leaf, Car, Home as HomeIcon, User, Eye
} from 'lucide-react';
import CampaignCard from '@/components/CampaignCard';
import { campaigns } from '@/data/mockData';

export default function Home() {
  const featuredCampaigns = campaigns.slice(0, 3);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Slides du carousel avec contenu spécifique
  const carouselSlides = [
    {
      id: 0,
      title: "Votre Super App Financière Islamique",
      subtitle: "Tous vos services financiers éthiques en un seul endroit",
      description: "Dons, zakat, investissements halal, protection takaful et épargne islamique. Une plateforme complète qui respecte vos valeurs et vos principes religieux.",
      buttonText: "Découvrir nos services",
      buttonLink: "/don",
      buttonIcon: Heart,
      image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&h=600&fit=crop",
      gradient: "from-green-500/40 to-emerald-500/40",
      stats: "50K+ utilisateurs"
    },
    {
      id: 1,
      title: "Zakat Simplifiée et Automatisée",
      subtitle: "Respectez vos obligations religieuses en toute simplicité",
      description: "Notre calculateur intelligent détermine précisément votre zakat annuelle selon les principes islamiques. Paiement sécurisé et traçabilité complète.",
      buttonText: "Calculer ma Zakat",
      buttonLink: "/zakat",
      buttonIcon: Calculator,
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop",
      gradient: "from-green-500/40 to-emerald-500/40",
      stats: "15K utilisateurs"
    },
    {
      id: 2,
      title: "Protection Takaful Complète",
      subtitle: "Assurance islamique pour vous et votre famille",
      description: "Protégez-vous avec nos solutions d'assurance conformes aux principes islamiques. Santé, automobile, habitation et vie - tout en respectant vos valeurs.",
      buttonText: "Souscrire un Takaful",
      buttonLink: "/takaful",
      buttonIcon: Shield,
      image: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&h=600&fit=crop",
      gradient: "from-blue-500/40 to-cyan-500/40",
      stats: "50K+ clients protégés"
    },
    {
      id: 3,
      title: "Investissements Halal et Éthiques",
      subtitle: "Faites fructifier votre argent selon vos valeurs",
      description: "Placez votre argent dans des projets éthiques et durables qui respectent les principes de la finance islamique. Rendements conformes à vos convictions.",
      buttonText: "Investir Halal",
      buttonLink: "/investir",
      buttonIcon: TrendingUp,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
      gradient: "from-purple-500/40 to-violet-500/40",
      stats: "8.5% rendement moyen"
    }
  ];

  // Auto-play carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === carouselSlides.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [carouselSlides.length]);

  const services = [
    {
      icon: Heart,
      title: 'Dons & Solidarité',
      description: 'Faites des dons sécurisés pour soutenir des causes importantes et respecter vos valeurs de solidarité',
      href: '/don',
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      stats: '2.5M XOF collectés'
    },
    {
      icon: Calculator,
      title: 'Zakat Automatisée',
      description: 'Calculez et payez votre zakat annuelle en toute simplicité selon les principes islamiques',
      href: '/zakat',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      stats: '15K utilisateurs'
    },
    {
      icon: Shield,
      title: 'Protection Takaful',
      description: 'Assurance islamique complète pour protéger votre famille et vos biens',
      href: '/takaful',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      stats: '50K+ clients protégés'
    },
    {
      icon: TrendingUp,
      title: 'Investissements Halal',
      description: 'Placez votre argent de manière éthique et rentable selon vos convictions',
      href: '/investir',
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      stats: '8.5% rendement moyen'
    },
    {
      icon: Wallet,
      title: 'Épargne Islamique',
      description: 'Épargnez selon les principes islamiques avec des solutions éthiques',
      href: '/epargne',
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      stats: '2.6Mds F CFA épargnés'
    },
    {
      icon: Bookmark,
      title: 'Campagnes & Impact',
      description: 'Découvrez et soutenez des projets qui créent un impact positif',
      href: '/campagnes',
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      stats: '50+ campagnes actives'
    }
  ];

  const stats = [
    { number: '2.5M', label: 'XOF collectés', icon: Target, color: 'text-green-600' },
    { number: '15K', label: 'Donateurs', icon: Users, color: 'text-blue-600' },
    { number: '50+', label: 'Campagnes', icon: Heart, color: 'text-red-600' },
    { number: '25K', label: 'Bénéficiaires', icon: Award, color: 'text-purple-600' },
  ];

  const features = [
    {
      icon: Globe,
      title: 'Impact Mondial',
      description: 'Nos campagnes touchent des communautés dans le monde entier',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: 'Sécurité Totale',
      description: 'Vos dons sont protégés et utilisés de manière transparente',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Sparkles,
      title: 'Innovation Éthique',
      description: 'Technologies modernes au service de la finance islamique',
      color: 'from-purple-500 to-violet-500'
    }
  ];

  const testimonials = [
    {
      name: 'Fatima D.',
      role: 'Utilisatrice Amane+',
      content: 'Amane+ est ma super app financière préférée. Tout est réuni : dons, zakat, investissements. La transparence et le respect de mes valeurs me donnent confiance.',
      avatar: 'FD'
    },
    {
      name: 'Ahmed K.',
      role: 'Investisseur Halal',
      content: 'Grâce à Amane+, je peux investir en toute sérénité. La plateforme respecte mes principes islamiques tout en offrant de bons rendements.',
      avatar: 'AK'
    },
    {
      name: 'Mariam S.',
      role: 'Cliente Takaful',
      content: 'La protection Takaful d\'Amane+ me donne une vraie tranquillité d\'esprit. Une super app qui comprend mes besoins.',
      avatar: 'MS'
    }
  ];

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const videoSlides = [
    {
      id: 'dQw4w9WgXcQ', // Example YouTube video ID
      type: 'youtube'
    },
    {
      src: '/videos/video1.mp4', // Example local video
      type: 'video'
    },
    {
      src: '/videos/video2.mp4', // Example local video
      type: 'video'
    }
  ];

  const videoRefs = [
    useRef<HTMLVideoElement | null>(null),
    useRef<HTMLVideoElement | null>(null),
    useRef<HTMLVideoElement | null>(null),
    useRef<HTMLVideoElement | null>(null)
  ];
  const videoSources = [
    '/videos/vid1.mp4',
    '/videos/vid2.mp4',
    '/videos/vid3.mp4',
    '/videos/vid4.mp4',
  ];
  // État pour savoir quelle vidéo est en cours de lecture
  const [playingIndex, setPlayingIndex] = useState(0);
  // Effet pour lancer la première vidéo au chargement
  useEffect(() => {
    const video = videoRefs[playingIndex].current;
    if (video) {
      video.play();
    }
  }, [playingIndex]);
  // Handler pour passer à la vidéo suivante
  const handleVideoEnd = (idx: number) => {
    const nextIdx = (idx + 1) % videoSources.length;
    setPlayingIndex(nextIdx);
  };

  // Ajout d'un état pour le slider mobile
  const [mobileIndex, setMobileIndex] = useState(0);
  // Gestion du changement de slide mobile
  const handleMobilePrev = () => setMobileIndex((prev) => (prev === 0 ? videoSources.length - 1 : prev - 1));
  const handleMobileNext = () => setMobileIndex((prev) => (prev === videoSources.length - 1 ? 0 : prev + 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-50 to-green-50">
      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-20 w-32 h-32 bg-green-200/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, -80, 0],
            y: [0, 100, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-40 right-32 w-24 h-24 bg-indigo-200/20 rounded-full blur-xl"
        />
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-800 via-green-700 to-green-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 to-transparent" />
        
        {/* Background Images Carousel */}
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img
                src={carouselSlides[currentImageIndex].image}
                alt="Background"
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${carouselSlides[currentImageIndex].gradient}`} />
            </motion.div>
          </AnimatePresence>
          
          {/* Additional decorative elements */}
          <div className="absolute top-10 left-10 w-64 h-64 bg-green-200/10 rounded-full blur-3xl" />
          <div className="absolute top-20 right-20 w-48 h-48 bg-green-200/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/4 w-32 h-32 bg-green-200/10 rounded-full blur-2xl" />
          <div className="absolute bottom-10 right-1/3 w-40 h-40 bg-green-200/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6"
              >
                <Sparkles size={16} />
                <span className="text-sm font-medium">Super App Financière Islamique</span>
              </motion.div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8"
                >
                  <h1 className="text-4xl lg:text-6xl font-bold mb-4 leading-tight">
                    {carouselSlides[currentImageIndex].title}
              </h1>
                  <p className="text-xl lg:text-2xl mb-4 text-green-100 font-medium">
                    {carouselSlides[currentImageIndex].subtitle}
                  </p>
                  <p className="text-lg mb-6 text-green-100/90 leading-relaxed max-w-3xl mx-auto">
                    {carouselSlides[currentImageIndex].description}
                  </p>
                  <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                    <Target size={16} />
                    <span className="text-sm font-medium">{carouselSlides[currentImageIndex].stats}</span>
                  </div>
                </motion.div>
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col items-center space-y-6"
              >
                {(() => {
                  const currentSlide = carouselSlides[currentImageIndex];
                  const IconComponent = currentSlide.buttonIcon;
                  
                  return (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                        href={currentSlide.buttonLink}
                    className="bg-white text-green-800 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                        <IconComponent size={20} />
                        <span>{currentSlide.buttonText}</span>
                    <ArrowRight size={20} />
                  </Link>
                </motion.div>
                  );
                })()}
                
                {/* Carousel Indicators */}
                <div className="flex space-x-2">
                  {carouselSlides.map((slide, index) => (
                    <motion.button
                      key={slide.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'bg-white scale-125' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-800 to-emerald-300 mb-4">
              Tous vos services financiers en une seule app
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une plateforme complète qui respecte vos valeurs islamiques et vous accompagne dans tous vos besoins financiers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Link href={service.href} className="block">
                  <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 group-hover:scale-105 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${service.color}" />
                    <div className={`w-16 h-16 rounded-2xl ${service.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <service.icon size={32} className={service.iconColor} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {service.description}
                    </p>
                    <div className="text-sm font-medium text-gray-500">
                      {service.stats}
                </div>
                </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Propositions de Valeur Amane */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Pourquoi choisir <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Amane+</span> ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              La première super app financière islamique qui combine innovation technologique et respect des principes religieux pour tous vos besoins financiers.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Transparence Totale */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Eye size={32} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Transparence Totale</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Chaque transaction, chaque don, chaque investissement est tracé et visible. Nous croyons en la transparence absolue pour bâtir la confiance dans notre super app.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Rapports détaillés en temps réel</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Traçabilité complète des fonds</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Audit externe annuel</span>
                </li>
              </ul>
            </motion.div>

            {/* Conformité Islamique */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Shield size={32} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Conformité Islamique</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Tous nos produits et services respectent strictement les principes de la finance islamique, validés par des experts religieux. Une super app qui respecte vos convictions.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Validation par des oulémas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Zéro intérêt (riba)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Investissements éthiques</span>
                </li>
              </ul>
            </motion.div>

            {/* Innovation Technologique */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Sparkles size={32} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Innovation Technologique</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Nous utilisons les technologies les plus avancées pour offrir une expérience utilisateur exceptionnelle et sécurisée. Une super app moderne au service de vos valeurs.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Blockchain pour la traçabilité</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>IA pour l'optimisation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Sécurité de niveau bancaire</span>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Valeurs Fondamentales */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-16 bg-white rounded-3xl p-8 shadow-lg border border-green-100"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Nos Valeurs Fondamentales</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart size={24} className="text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Bienveillance</h4>
                <p className="text-sm text-gray-600">Agir avec compassion et empathie</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield size={24} className="text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Intégrité</h4>
                <p className="text-sm text-gray-600">Respecter nos engagements</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={24} className="text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Communauté</h4>
                <p className="text-sm text-gray-600">Servir l'intérêt collectif</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe size={24} className="text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Impact</h4>
                <p className="text-sm text-gray-600">Créer un impact positif</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Séparateur visuel */}
      <div className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200"></div>
        </div>
      </div>

      {/* Video Grid Section - Actualités en Vidéo */}
      <section className="w-full bg-white py-16 flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Actualités en Vidéo</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Découvrez les dernières initiatives, événements et moments forts d'Amane+ à travers notre sélection de vidéos. Plongez au cœur de nos actions et suivez l'impact de notre communauté en images.
          </p>
          </motion.div>
          <div className="block md:hidden w-full relative">
            <div className="flex items-center justify-center">
              <button
                onClick={handleMobilePrev}
                className="bg-white/80 hover:bg-white text-green-800 rounded-full p-2 shadow-lg mx-2"
                aria-label="Vidéo précédente"
              >
                <ArrowRight size={24} className="rotate-180" />
              </button>
              <div className="w-full max-w-xs mx-auto">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={mobileIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="relative h-64"
                  >
                    <video
                      ref={videoRefs[mobileIndex]}
                      src={videoSources[mobileIndex]}
                      controls
                      autoPlay={playingIndex === mobileIndex}
                      muted
                      onEnded={() => handleVideoEnd(mobileIndex)}
                      className={`absolute top-0 left-0 w-full h-full object-cover rounded-2xl shadow-2xl border-4 ${playingIndex === mobileIndex ? 'border-white' : 'border-green-600'}`}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
              <button
                onClick={handleMobileNext}
                className="bg-white/80 hover:bg-white text-green-800 rounded-full p-2 shadow-lg mx-2"
                aria-label="Vidéo suivante"
              >
                <ArrowRight size={24} />
              </button>
            </div>
            <div className="flex justify-center mt-4 space-x-2">
              {videoSources.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setMobileIndex(idx)}
                  className={`w-3 h-3 rounded-full ${idx === mobileIndex ? 'bg-green-500 scale-125' : 'bg-white/40 hover:bg-white/70'} transition-all duration-300`}
                  aria-label={`Aller à la vidéo ${idx + 1}`}
                />
              ))}
            </div>
          </div>
          <div className="hidden md:grid grid-cols-2 md:grid-cols-4 gap-8 relative">
            <motion.div
              className="relative md:row-span-2 md:h-[520px] h-80"
              animate={playingIndex === 0 ? { scale: 1.12, boxShadow: '0 8px 32px 0 rgba(22,101,52,0.45)' } : { scale: 1, boxShadow: '0 4px 16px 0 rgba(22,101,52,0.18)' }}
              whileHover={{ scale: 1.12, boxShadow: '0 8px 32px 0 rgba(22,101,52,0.45)' }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <video
                ref={videoRefs[0]}
                src={videoSources[0]}
                controls
                autoPlay={playingIndex === 0}
                muted
                onEnded={() => handleVideoEnd(0)}
                className={`absolute top-0 left-0 w-full h-full object-cover rounded-2xl shadow-2xl border-4 ${playingIndex === 0 ? 'border-white' : 'border-green-600'}`}
              />
            </motion.div>
            <motion.div
              className="relative md:mt-24 h-80"
              animate={playingIndex === 1 ? { scale: 1.12, boxShadow: '0 8px 32px 0 rgba(22,101,52,0.45)' } : { scale: 1, boxShadow: '0 4px 16px 0 rgba(22,101,52,0.18)' }}
              whileHover={{ scale: 1.12, boxShadow: '0 8px 32px 0 rgba(22,101,52,0.45)' }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <video
                ref={videoRefs[1]}
                src={videoSources[1]}
                controls
                autoPlay={playingIndex === 1}
                muted
                onEnded={() => handleVideoEnd(1)}
                className={`absolute top-0 left-0 w-full h-full object-cover rounded-2xl shadow-2xl border-4 ${playingIndex === 1 ? 'border-white' : 'border-green-600'}`}
              />
            </motion.div>
            <motion.div
              className="relative h-80"
              animate={playingIndex === 2 ? { scale: 1.12, boxShadow: '0 8px 32px 0 rgba(22,101,52,0.45)' } : { scale: 1, boxShadow: '0 4px 16px 0 rgba(22,101,52,0.18)' }}
              whileHover={{ scale: 1.12, boxShadow: '0 8px 32px 0 rgba(22,101,52,0.45)' }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <video
                ref={videoRefs[2]}
                src={videoSources[2]}
                controls
                autoPlay={playingIndex === 2}
                muted
                onEnded={() => handleVideoEnd(2)}
                className={`absolute top-0 left-0 w-full h-full object-cover rounded-2xl shadow-2xl border-4 ${playingIndex === 2 ? 'border-white' : 'border-green-600'}`}
              />
            </motion.div>
            <motion.div
              className="relative md:mt-8 md:h-[450px] h-80"
              animate={playingIndex === 3 ? { scale: 1.12, boxShadow: '0 8px 32px 0 rgba(22,101,52,0.45)' } : { scale: 1, boxShadow: '0 4px 16px 0 rgba(22,101,52,0.18)' }}
              whileHover={{ scale: 1.12, boxShadow: '0 8px 32px 0 rgba(22,101,52,0.45)' }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <video
                ref={videoRefs[3]}
                src={videoSources[3]}
                controls
                autoPlay={playingIndex === 3}
                muted
                onEnded={() => handleVideoEnd(3)}
                className={`absolute top-0 left-0 w-full h-full object-cover rounded-2xl shadow-2xl border-4 ${playingIndex === 3 ? 'border-white' : 'border-green-600'}`}
              />
            </motion.div>
          </div>
        </div>
      </section>
     

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez pourquoi des milliers d'utilisateurs font confiance à Amane+ pour tous leurs besoins financiers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-20 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Campagnes populaires
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez nos campagnes les plus populaires et soutenez des causes importantes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCampaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <CampaignCard campaign={campaign} />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/campagnes">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl"
              >
                <span>Voir toutes les campagnes</span>
                <ArrowRight size={20} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-800 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Prêt à commencer votre voyage ?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers d'utilisateurs qui ont choisi la finance islamique éthique. 
              Commencez dès aujourd'hui.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-green-800 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
              >
                <Heart size={20} />
                <span>Faire un don</span>
                <ArrowRight size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-green-800 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Shield size={20} />
                <span>Découvrir nos services</span>
                <ArrowRight size={20} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
