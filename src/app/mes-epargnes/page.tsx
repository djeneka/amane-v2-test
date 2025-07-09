'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, Plus, ArrowLeft, Target, TrendingUp, Calendar, 
  PiggyBank, Trash2, CheckCircle, ChevronLeft, ChevronRight,
  Users, MapPin, Eye, EyeOff, X
} from 'lucide-react';
import Link from 'next/link';

interface Transaction {
  id: string;
  epargneId: string;
  epargneName: string;
  type: 'creation' | 'contribution' | 'withdrawal' | 'completion';
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

interface Epargne {
  id: string;
  name: string;
  description: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  startDate: string;
  targetDate: string;
  status: 'active' | 'completed' | 'paused';
  color: string;
  icon: any | null;
}

export default function MesEpargnesPage() {
  const [epargnes, setEpargnes] = useState<Epargne[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Charger les épargnes depuis localStorage
    const savedEpargnes = localStorage.getItem('userEpargnes');
    if (savedEpargnes) {
      setEpargnes(JSON.parse(savedEpargnes));
    }
    
    // Charger les transactions depuis localStorage
    const savedTransactions = localStorage.getItem('userTransactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sauvegarder les épargnes dans localStorage quand elles changent
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('userEpargnes', JSON.stringify(epargnes));
    }
  }, [epargnes, mounted]);

  // Sauvegarder les transactions dans localStorage quand elles changent
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('userTransactions', JSON.stringify(transactions));
    }
  }, [transactions, mounted]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'classique',
    targetAmount: 0,
    monthlyContribution: 0,
    targetDate: ''
  });

  const categories = [
    { id: 'classique', name: 'Classique', color: 'bg-green-100 text-green-600', icon: Wallet },
    { id: 'hajj', name: 'Hajj', color: 'bg-blue-100 text-blue-600', icon: Target },
    { id: 'mariage', name: 'Mariage', color: 'bg-pink-100 text-pink-600', icon: Calendar },
    { id: 'education', name: 'Éducation', color: 'bg-purple-100 text-purple-600', icon: TrendingUp },
    { id: 'retraite', name: 'Retraite', color: 'bg-orange-100 text-orange-600', icon: PiggyBank },
    { id: 'business', name: 'Business', color: 'bg-indigo-100 text-indigo-600', icon: TrendingUp }
  ];

  const totalSaved = epargnes.reduce((sum, epargne) => sum + epargne.currentAmount, 0);
  const totalTarget = epargnes.reduce((sum, epargne) => sum + epargne.targetAmount, 0);
  const totalProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const formatAmount = (amount: number) => {
    if (!mounted) return amount.toString();
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactAmount = (amount: number) => {
    if (!mounted) return amount.toString();
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}Mds F CFA`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M F CFA`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K F CFA`;
    } else {
      return formatAmount(amount);
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const category = categories.find(c => c.id === formData.category);
    const newEpargne: Epargne = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      category: formData.category,
      targetAmount: formData.targetAmount,
      currentAmount: 0,
      monthlyContribution: formData.monthlyContribution,
      startDate: new Date().toISOString().split('T')[0],
      targetDate: formData.targetDate,
      status: 'active',
      color: category?.color || 'bg-green-100 text-green-600',
      icon: null // L'icône sera récupérée dynamiquement
    };
    
    setEpargnes([...epargnes, newEpargne]);
    
    // Ajouter une transaction de création
    const creationTransaction: Transaction = {
      id: Date.now().toString(),
      epargneId: newEpargne.id,
      epargneName: newEpargne.name,
      type: 'creation',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      description: `Création de l'épargne "${newEpargne.name}"`
    };
    setTransactions([creationTransaction, ...transactions]);
    
    setFormData({
      name: '',
      description: '',
      category: 'classique',
      targetAmount: 0,
      monthlyContribution: 0,
      targetDate: ''
    });
    setShowAddForm(false);
  };

  const deleteEpargne = (id: string) => {
    setEpargnes(epargnes.filter(epargne => epargne.id !== id));
  };

  const addContribution = (id: string, amount: number) => {
    const epargne = epargnes.find(e => e.id === id);
    if (!epargne) return;
    
    const newAmount = Math.min(epargne.currentAmount + amount, epargne.targetAmount);
    const actualContribution = newAmount - epargne.currentAmount;
    
    setEpargnes(epargnes.map(epargne => 
      epargne.id === id 
        ? { ...epargne, currentAmount: newAmount }
        : epargne
    ));
    
    // Ajouter une transaction de contribution
    if (actualContribution > 0) {
      const contributionTransaction: Transaction = {
        id: Date.now().toString(),
        epargneId: id,
        epargneName: epargne.name,
        type: 'contribution',
        amount: actualContribution,
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
        description: `Contribution de ${formatCompactAmount(actualContribution)}`
      };
      setTransactions([contributionTransaction, ...transactions]);
    }
  };

  const nextSlide = () => {
    const itemsPerPage = isMobile ? 1 : 3;
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(epargnes.length / itemsPerPage));
  };

  const prevSlide = () => {
    const itemsPerPage = isMobile ? 1 : 3;
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(epargnes.length / itemsPerPage)) % Math.ceil(epargnes.length / itemsPerPage));
  };

  const visibleEpargnes = epargnes.slice(currentSlide * (isMobile ? 1 : 3), (currentSlide + 1) * (isMobile ? 1 : 3));

  // Fonction pour récupérer l'icône basée sur la catégorie
  const getEpargneIcon = (category: string) => {
    const categoryData = categories.find(c => c.id === category);
    return categoryData?.icon || Wallet;
  };

  // Fonctions utilitaires pour les transactions
  const getTransactionTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'creation':
        return <Plus size={16} className="text-green-600" />;
      case 'contribution':
        return <TrendingUp size={16} className="text-blue-600" />;
      case 'withdrawal':
        return <ArrowLeft size={16} className="text-red-600" />;
      case 'completion':
        return <CheckCircle size={16} className="text-purple-600" />;
      default:
        return <Wallet size={16} className="text-gray-600" />;
    }
  };

  const getTransactionTypeLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'creation':
        return 'Création';
      case 'contribution':
        return 'Contribution';
      case 'withdrawal':
        return 'Retrait';
      case 'completion':
        return 'Complétion';
      default:
        return 'Transaction';
    }
  };

  const getTransactionStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const sortedTransactions = transactions.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-50 to-green-50 relative z-10">
      {/* Floating Elements - DISABLED FOR TESTING */}
      {/* <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
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
      </div> */}

      {/* Header Section */}
      <section className="relative pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="inline-block mb-8"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-green-800 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
                <Wallet size={40} className="text-white" />
              </div>
            </motion.div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Mes <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-800 to-green-600">Épargnes</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Gérez vos produits d'épargne et suivez vos investissements
            </p>

            {/* Stats Cards */}
            {epargnes.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Target size={24} className="text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{epargnes.length}</p>
                    <p className="text-sm text-gray-600">Épargnes actives</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Wallet size={24} className="text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCompactAmount(totalSaved)}
                    </p>
                    <p className="text-sm text-gray-600">Total épargné</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp size={24} className="text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalProgress.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Progression</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Calendar size={24} className="text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCompactAmount(epargnes.reduce((sum, e) => sum + e.monthlyContribution, 0))}
                    </p>
                    <p className="text-sm text-gray-600">Épargne mensuelle</p>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {epargnes.length === 0 ? (
          // Aucune épargne
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-12 text-center"
          >
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Wallet size={64} className="text-gray-400" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Aucune épargne pour le moment
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Vous n'avez pas encore souscrit à des produits d'épargne. 
              Commencez dès aujourd'hui pour sécuriser votre avenir financier.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Plus size={20} />
                <span>Commencer à épargner</span>
              </motion.button>
              
              <Link href="/epargne">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-green-800 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-all duration-200 flex items-center justify-center space-x-2 border-2 border-green-200"
                >
                  <ArrowLeft size={20} />
                  <span>Découvrir les produits</span>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        ) : (
          // Liste des épargnes
          <div className="space-y-8">
            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-between items-center"
            >
              <h2 className="text-2xl font-bold text-gray-900">
                Mes Épargnes ({epargnes.length})
              </h2>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowTransactions(true)}
                  className="bg-white text-green-800 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition-all duration-200 flex items-center space-x-2 border-2 border-green-200"
                >
                  <Calendar size={20} />
                  <span>Historique ({transactions.length})</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Nouvelle épargne</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Épargnes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {epargnes.map((epargne, index) => (
                <motion.div
                  key={epargne.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300">
                    <div className="relative">
                      <div className="w-full h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                        {(() => {
                          const IconComponent = getEpargneIcon(epargne.category);
                          return <IconComponent size={64} className="text-green-600" />;
                        })()}
                      </div>
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                          epargne.category === 'classique' ? 'bg-green-500' :
                          epargne.category === 'hajj' ? 'bg-blue-500' :
                          epargne.category === 'mariage' ? 'bg-pink-500' :
                          epargne.category === 'education' ? 'bg-purple-500' :
                          epargne.category === 'retraite' ? 'bg-orange-500' :
                          epargne.category === 'business' ? 'bg-indigo-500' :
                          'bg-gray-500'
                        }`}>
                          {epargne.category.charAt(0).toUpperCase() + epargne.category.slice(1)}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteEpargne(epargne.id)}
                          className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                        {epargne.name}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {epargne.description}
                      </p>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progression</span>
                            <span className="font-semibold text-gray-900">
                              {getProgressPercentage(epargne.currentAmount, epargne.targetAmount).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${getProgressPercentage(epargne.currentAmount, epargne.targetAmount)}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className={`h-2 rounded-full ${
                                getProgressPercentage(epargne.currentAmount, epargne.targetAmount) > 80 ? 'bg-green-500' :
                                getProgressPercentage(epargne.currentAmount, epargne.targetAmount) > 50 ? 'bg-yellow-500' :
                                'bg-blue-500'
                              }`}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Épargné</span>
                            <span className="font-semibold text-gray-900">
                              {formatCompactAmount(epargne.currentAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Objectif</span>
                            <span className="font-semibold text-gray-900">
                              {formatCompactAmount(epargne.targetAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Mensuel</span>
                            <span className="font-semibold text-gray-900">
                              {formatCompactAmount(epargne.monthlyContribution)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-500 truncate">
                              Début: {new Date(epargne.startDate).toLocaleDateString('fr-FR')}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              Fin: {new Date(epargne.targetDate).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => addContribution(epargne.id, epargne.monthlyContribution)}
                            className="px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 text-sm flex-shrink-0 ml-2"
                          >
                            Contribuer
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Epargne Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white rounded-t-3xl p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Nouvelle épargne</h3>
                    <p className="text-gray-600">Créez un nouvel objectif d'épargne</p>
                  </div>
                  <button 
                    onClick={() => setShowAddForm(false)} 
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Fermer"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'épargne
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200"
                      placeholder="Ex: Hajj 2025"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200"
                      placeholder="Description de votre objectif d'épargne"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie
                    </label>
                                         <select
                       value={formData.category}
                       onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                       className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200"
                       title="Sélectionner une catégorie"
                     >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Montant cible (XOF)
                      </label>
                      <input
                        type="number"
                        value={formData.targetAmount}
                        onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200"
                        placeholder="500000"
                        min="1000"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Épargne mensuelle (XOF)
                      </label>
                      <input
                        type="number"
                        value={formData.monthlyContribution}
                        onChange={(e) => setFormData({ ...formData, monthlyContribution: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200"
                        placeholder="25000"
                        min="1000"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date cible
                    </label>
                                         <input
                       type="date"
                       value={formData.targetDate}
                       onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                       className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200"
                       title="Sélectionner la date cible"
                       required
                     />
                  </div>

                  <div className="flex justify-between pt-6 border-t border-gray-100">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-all duration-200"
                    >
                      Annuler
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-green-800 to-green-600 text-white rounded-xl font-semibold hover:from-green-900 hover:to-green-700 transition-all duration-200"
                    >
                      Créer l'épargne
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
             </AnimatePresence>

       {/* Transactions History Modal */}
       <AnimatePresence>
         {showTransactions && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
           >
             <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
             >
               {/* Header */}
               <div className="sticky top-0 bg-white rounded-t-3xl p-6 border-b border-gray-100">
                 <div className="flex justify-between items-center">
                   <div>
                     <h3 className="text-2xl font-bold text-gray-900">Historique des transactions</h3>
                     <p className="text-gray-600">
                       {transactions.length} transaction{transactions.length > 1 ? 's' : ''} au total
                     </p>
                   </div>
                   <button 
                     onClick={() => setShowTransactions(false)} 
                     className="text-gray-400 hover:text-gray-600 transition-colors"
                     title="Fermer"
                   >
                     <X size={24} />
                   </button>
                 </div>
               </div>

               {/* Content */}
               <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                 {transactions.length === 0 ? (
                   <div className="text-center py-12">
                     <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                       <Calendar size={48} className="text-gray-400" />
                     </div>
                     <h4 className="text-xl font-semibold text-gray-900 mb-2">
                       Aucune transaction
                     </h4>
                     <p className="text-gray-600">
                       Les transactions apparaîtront ici lorsque vous créerez des épargnes ou ferez des contributions.
                     </p>
                   </div>
                 ) : (
                   <div className="space-y-4">
                     {sortedTransactions.map((transaction, index) => (
                       <motion.div
                         key={transaction.id}
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.3, delay: index * 0.05 }}
                         className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors"
                       >
                         <div className="flex items-center justify-between">
                           <div className="flex items-center space-x-4">
                             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                               {getTransactionTypeIcon(transaction.type)}
                             </div>
                             <div className="flex-1 min-w-0">
                               <div className="flex items-center space-x-2 mb-1">
                                 <span className="font-semibold text-gray-900">
                                   {getTransactionTypeLabel(transaction.type)}
                                 </span>
                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionStatusColor(transaction.status)}`}>
                                   {transaction.status === 'completed' ? 'Terminé' : 
                                    transaction.status === 'pending' ? 'En cours' : 'Échoué'}
                                 </span>
                               </div>
                               <p className="text-sm text-gray-600 mb-1">
                                 {transaction.epargneName}
                               </p>
                               <p className="text-xs text-gray-500">
                                 {transaction.description}
                               </p>
                             </div>
                           </div>
                           <div className="text-right">
                             <div className="font-semibold text-gray-900">
                               {transaction.type === 'creation' ? 'Création' : formatCompactAmount(transaction.amount)}
                             </div>
                             <div className="text-xs text-gray-500">
                               {new Date(transaction.date).toLocaleDateString('fr-FR', {
                                 year: 'numeric',
                                 month: 'short',
                                 day: 'numeric',
                                 hour: '2-digit',
                                 minute: '2-digit'
                               })}
                             </div>
                           </div>
                         </div>
                       </motion.div>
                     ))}
                   </div>
                 )}
               </div>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>
     </div>
   );
 } 