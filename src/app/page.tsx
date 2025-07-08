'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Heart, Calculator, Shield, TrendingUp, ArrowRight, Sparkles, 
  Users, Target, Award, Globe, Wallet, Bookmark, CheckCircle,
  BarChart3, Star, Zap, Building, Leaf, Car, Home as HomeIcon, User
} from 'lucide-react';
import CampaignCard from '@/components/CampaignCard';
import { campaigns } from '@/data/mockData';

export default function Home() {
  const featuredCampaigns = campaigns.slice(0, 3);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const backgroundImages = [
    'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&h=600&fit=crop'
  ];

  // Auto-play carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const services = [
    {
      icon: Heart,
      title: 'Dons en ligne',
      description: 'Faites des dons sécurisés pour soutenir des causes importantes',
      href: '/don',
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      stats: '2.5M XOF collectés'
    },
    {
      icon: Calculator,
      title: 'Calculateur de Zakat',
      description: 'Calculez facilement votre zakat annuelle',
      href: '/zakat',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      stats: '15K utilisateurs'
    },
    {
      icon: Shield,
      title: 'Protection Takaful',
      description: 'Assurance islamique pour vous et votre famille',
      href: '/takaful',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      stats: '50K+ clients protégés'
    },
    {
      icon: TrendingUp,
      title: 'Investissements Halal',
      description: 'Placez votre argent de manière éthique et rentable',
      href: '/investir',
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      stats: '8.5% rendement moyen'
    },
    {
      icon: Wallet,
      title: 'Épargne Islamique',
      description: 'Épargnez selon les principes islamiques',
      href: '/epargne',
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      stats: '2.6Mds F CFA épargnés'
    },
    {
      icon: Bookmark,
      title: 'Campagnes',
      description: 'Découvrez et soutenez des projets importants',
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
      role: 'Donatrice régulière',
      content: 'Amane+ m\'a permis de faire des dons en toute confiance. La transparence est remarquable.',
      avatar: 'FD'
    },
    {
      name: 'Ahmed K.',
      role: 'Investisseur',
      content: 'Les investissements halal d\'Amane+ respectent mes valeurs tout en offrant de bons rendements.',
      avatar: 'AK'
    },
    {
      name: 'Mariam S.',
      role: 'Cliente Takaful',
      content: 'La protection Takaful d\'Amane+ me donne une vraie tranquillité d\'esprit.',
      avatar: 'MS'
    }
  ];

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
                src={backgroundImages[currentImageIndex]}
                alt="Background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-green-800/40 via-green-700/30 to-green-600/40" />
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
                <span className="text-sm font-medium">Finance Islamique Éthique</span>
              </motion.div>
              
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Construisons ensemble un{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-emerald-200">avenir meilleur</span>
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-green-100 leading-relaxed max-w-4xl mx-auto">
                Votre plateforme de confiance pour les dons, la zakat, les investissements halal et la protection takaful.
              </p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col items-center space-y-6"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/don"
                    className="bg-white text-green-800 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    <Heart size={20} />
                    <span>Faire un don</span>
                    <ArrowRight size={20} />
                  </Link>
                </motion.div>
                
                {/* Carousel Indicators */}
                <div className="flex space-x-2">
                  {backgroundImages.map((_, index) => (
                    <motion.button
                      key={index}
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

      {/* Stats Section */}
      <section className="py-16 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-all duration-300"
                >
                  <stat.icon size={24} className={stat.color} />
                </motion.div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
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
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Nos Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez nos solutions complètes de finance islamique éthique
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

      {/* Features Section */}
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
              Pourquoi choisir Amane+ ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Notre engagement envers l'excellence et l'éthique
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
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
              Découvrez les témoignages de notre communauté
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
