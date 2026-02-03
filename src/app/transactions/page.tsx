'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, Heart, Users, Star, MapPin, Calendar,
  Smartphone, Apple, Play, ChevronDown, ChevronLeft, ChevronRight,
  Info, Wallet as WalletIcon, HandCoins, TrendingUp, Circle, X, Share2
} from 'lucide-react';
import CampaignCard from '@/components/CampaignCard';
import Wallet from '@/components/Wallet';
import { transactions as mockTransactions } from '@/data/mockData';
import type { Campaign } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction } from '@/data/mockData';
import { getActiveCampaigns } from '@/services/campaigns';
import { getDonationsStatistics } from '@/services/statistics';

export default function TransactionsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('tout');
  const [selectedStatus, setSelectedStatus] = useState('tout');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<ReturnType<typeof formatTransaction> | null>(null);
  const [featuredCampaigns, setFeaturedCampaigns] = useState<Campaign[]>([]);
  const [donorCountByCampaignId, setDonorCountByCampaignId] = useState<Record<string, number>>({});
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campaignsError, setCampaignsError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/connexion');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    let cancelled = false;
    setCampaignsLoading(true);
    setCampaignsError(null);
    getActiveCampaigns()
      .then((list) => { if (!cancelled) setFeaturedCampaigns(list.slice(0, 3)); })
      .catch((err) => { if (!cancelled) setCampaignsError(err?.message ?? 'Erreur chargement des campagnes'); })
      .finally(() => { if (!cancelled) setCampaignsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getDonationsStatistics()
      .then((stats) => {
        if (cancelled) return;
        const byId: Record<string, number> = {};
        for (const row of stats.byCampaign) {
          byId[row.campaignId] = row.count;
        }
        setDonorCountByCampaignId(byId);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Fonction pour transformer les transactions de mockData en format d'affichage
  const formatTransaction = (transaction: Transaction) => {
    // Mapper les types
    const typeMap: Record<string, string> = {
      'donation': 'Don',
      'zakat': 'Zakat',
      'investment': 'Investissement',
      'takaful': 'Takaful'
    };

    // Mapper les statuts
    const statusMap: Record<string, { label: string; color: string }> = {
      'completed': { label: 'Effectué', color: '#1fcb4f' },
      'pending': { label: 'En attente', color: '#ffbd2e' },
      'failed': { label: 'Annulé', color: '#e14640' },
      'in_progress': { label: 'En cours', color: '#ffbd2e' }
    };

    // Formater la date (format: "11 Sep, 2025, à 11:56")
    const dateObj = new Date(transaction.date);
    const day = dateObj.getDate();
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const month = monthNames[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const formattedDate = `${day} ${month}, ${year}, à ${hours}:${minutes}`;

    const statusInfo = statusMap[transaction.status] || statusMap['pending'];
    const total = transaction.amount + transaction.fees;

    // Formater la référence (si c'est un nombre, le transformer en format AMN)
    let formattedReference = transaction.reference;
    if (/^\d+$/.test(transaction.reference)) {
      // Si c'est juste des chiffres, créer un format AMN
      formattedReference = `AMN${transaction.reference.slice(-6).padStart(6, '0')}`;
    }

    return {
      id: transaction.id,
      reference: formattedReference,
      date: formattedDate,
      type: typeMap[transaction.type] || transaction.type,
      amount: transaction.amount,
      fees: transaction.fees,
      total: total,
      status: statusInfo.label,
      statusColor: statusInfo.color,
      originalType: transaction.type,
      originalStatus: transaction.status
    };
  };

  // Transformer toutes les transactions
  const allTransactions = mockTransactions.map(formatTransaction);

  // Fonction de filtrage
  const getFilteredTransactions = () => {
    let filtered = [...allTransactions];

    // Filtrer par type
    if (selectedFilter !== 'tout') {
      const filterMap: Record<string, string> = {
        'depots': 'depot', // Pas dans les données actuelles, on peut l'ignorer ou ajouter
        'dons': 'donation',
        'zakats': 'zakat',
        'investissements': 'investment',
        'takaful': 'takaful'
      };

      const filterType = filterMap[selectedFilter];
      if (filterType) {
        filtered = filtered.filter(t => t.originalType === filterType);
      }
    }

    // Filtrer par statut
    if (selectedStatus !== 'tout') {
      const statusMap: Record<string, string> = {
        'effectue': 'completed',
        'en_attente': 'pending',
        'en_cours': 'in_progress',
        'annule': 'failed'
      };

      const filterStatus = statusMap[selectedStatus];
      if (filterStatus) {
        filtered = filtered.filter(t => t.originalStatus === filterStatus);
      }
    }

    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  // Pagination : 5 transactions par page
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Réinitialiser la page si elle dépasse le nombre total de pages ou si les filtres changent
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Réinitialiser à la page 1 quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, selectedStatus]);

  if (!isAuthenticated) {
    return null; // Ou un loader/spinner pendant la redirection
  }

  const filters = [
    { id: 'tout', label: 'Tout', icon: Circle },
    { id: 'depots', label: 'Dépôts', icon: WalletIcon },
    { id: 'dons', label: 'Dons', icon: HandCoins },
    { id: 'zakats', label: 'Zakats', icon: WalletIcon },
    { id: 'investissements', label: 'Investissements', icon: TrendingUp },
    { id: 'takaful', label: 'Takaful', icon: Heart }
  ];

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

  // Mock data for dashboard
  const walletBalance = 125000;
  const sadaqahScore = 320;
  const donationsCount = 12;
  const spentAmount = 125000;
  const campaignsCount = 15;

  return (
    <>
      {/* Modal Popup avec blur background */}
      {selectedTransaction && (
        <>
          {/* Backdrop avec blur */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setSelectedTransaction(null)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#101919] rounded-[24px] p-7 w-full max-w-[554px] relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-[42px]">
                <h3 className="text-[20px] font-medium text-white">
                  Détails de la transaction
                </h3>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="bg-[#5AB678] rounded-full w-8 h-8 flex items-center justify-center hover:bg-[#5AB678]/80 transition-colors"
                  aria-label="Fermer"
                >
                  <X size={16} className="text-[#1C1D22]" />
                </button>
              </div>

              {/* Détails de la transaction */}
              <div className="flex items-start justify-between mb-[42px]">
                {/* Colonne gauche - Labels */}
                <div className="flex flex-col gap-2 text-base font-normal text-white">
                  <p>Référence</p>
                  <p>Date et heure</p>
                  <p>Type</p>
                  <p>Montant</p>
                  <p>Frais</p>
                  <p>Montant total</p>
                  <p>Statut</p>
                </div>

                {/* Colonne droite - Valeurs */}
                <div className="flex flex-col gap-2 text-base font-medium text-white text-right">
                  <p>{selectedTransaction.reference}</p>
                  <p>{selectedTransaction.date}</p>
                  <p>{selectedTransaction.type}</p>
                  <p>{selectedTransaction.amount.toLocaleString('fr-FR')} F CFA</p>
                  <p>{selectedTransaction.fees.toLocaleString('fr-FR')} F CFA</p>
                  <p>{selectedTransaction.total.toLocaleString('fr-FR')} F CFA</p>
                  <div className="flex justify-end">
                    <div
                      className="px-2 py-2 rounded-xl"
                      style={{
                        backgroundColor: selectedTransaction.statusColor === '#1fcb4f' ? 'rgba(31,203,79,0.12)' :
                                        selectedTransaction.statusColor === '#ffbd2e' ? 'rgba(255,189,46,0.12)' :
                                        'rgba(225,70,64,0.12)'
                      }}
                    >
                      <p
                        className="text-base font-medium"
                        style={{ color: selectedTransaction.statusColor }}
                      >
                        {selectedTransaction.status}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bouton Partager */}
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-[#5AB678] h-12 px-[38px] rounded-full flex items-center justify-center gap-2.5 hover:bg-[#5AB678]/80 transition-colors"
                >
                  <Share2 size={22} className="text-white" />
                  <span className="text-sm font-semibold text-white">Partager</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}

    <div className={`min-h-screen bg-[#0B302F] ${selectedTransaction ? 'overflow-hidden' : ''}`}>
      {/* Hero Section avec Wallet et Historique */}
      {isAuthenticated && (
      <section className="py-12 text-white" style={{ background: 'linear-gradient(to right left, #101919, #00644D)' }}>
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[380px_1fr] gap-8">
            {/* Colonne de gauche - Wallet */}
            <div className="flex justify-center lg:justify-start w-full">
              <div className="w-full max-w-[380px]">
                <Wallet 
                  balance={walletBalance}
                  sadaqahScore={sadaqahScore}
                  rank="Argent"
                  donationsCount={donationsCount}
                  spentAmount={spentAmount}
                  campaignsCount={campaignsCount}
                />
              </div>
            </div>

            {/* Colonne de droite - Historique des transactions */}
            <div className="flex flex-col gap-6 min-w-0 overflow-hidden">
              {/* Titre */}
              <h2 className="text-[28px] font-semibold text-white leading-[1.36]">
                Historique des transactions
              </h2>

              {/* Sélecteur de date */}
              <div className="bg-[rgba(250,250,250,0.1)] w-fit flex gap-2 h-12 items-center justify-between px-4 py-2.5 rounded-[20px]">
                <p className="text-base text-white">
                  09 Septembre, 2024 <span className="text-white/70">-</span> 09 Septembre, 2025
                </p>
                <Calendar size={24} className="text-white" />
              </div>

              {/* Filtres */}
              <div className="flex gap-3 items-center flex-wrap">
                {filters.map((filter) => {
                  const Icon = filter.icon;
                  const isSelected = selectedFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedFilter(filter.id)}
                      className={`flex gap-2 items-center justify-center px-3 py-2 rounded-2xl text-sm font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#101919] text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <Icon size={24} className={isSelected ? 'text-white' : 'text-white'} />
                      <span>{filter.label}</span>
                    </button>
                  );
                })}
                
                {/* Dropdown Statut */}
                <div className="ml-auto">
                  <div className="relative">
                    <button
                      onClick={() => {
                        const statuses = ['tout', 'effectue', 'en_attente', 'en_cours', 'annule'];
                        const currentIndex = statuses.indexOf(selectedStatus);
                        const nextIndex = (currentIndex + 1) % statuses.length;
                        setSelectedStatus(statuses[nextIndex]);
                      }}
                      className="bg-white/10 flex gap-2 h-10 items-center justify-center px-3 py-2 rounded-2xl text-base font-medium text-white hover:bg-white/20 transition-all"
                    >
                      <span>
                        Statuts : {
                          selectedStatus === 'tout' ? 'Tout' :
                          selectedStatus === 'effectue' ? 'Effectué' :
                          selectedStatus === 'en_attente' ? 'En attente' :
                          selectedStatus === 'en_cours' ? 'En cours' :
                          selectedStatus === 'annule' ? 'Annulé' : 'Tout'
                        }
                      </span>
                      <ChevronDown size={16} className="text-[#5AB678]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tableau */}
              <div className="bg-black/10 rounded-[32px] overflow-hidden">
                <div className="overflow-x-auto">
                  {/* En-tête du tableau */}
                  <div className="bg-[#fafafa]/10 grid grid-cols-[98px_155px_98px_125px_98px_164px_98px_61px] gap-[52px] items-center px-6 py-6 rounded-t-[32px] min-w-[1000px]">
                    <p className="text-base font-medium text-white">Référence</p>
                    <p className="text-base font-medium text-white">Date de transaction</p>
                    <p className="text-base font-medium text-white">Type</p>
                    <p className="text-base font-medium text-white">Montant (F CFA)</p>
                    <p className="text-base font-medium text-white">Frais (1%)</p>
                    <p className="text-base font-medium text-white">Montant total (F CFA)</p>
                    <p className="text-base font-medium text-white">Statut</p>
                    <p className="text-base font-medium text-white">Actions</p>
                  </div>

                {/* Corps du tableau */}
                {filteredTransactions.length === 0 ? (
                  <div className="min-w-[1000px] px-6 py-12 text-center">
                    <p className="text-white/70 text-base">Aucune transaction trouvée avec les filtres sélectionnés</p>
                  </div>
                ) : (
                <div className="relative min-w-[1000px]">
                  {/* Lignes de séparation */}
                  {paginatedTransactions.map((_, index) => (
                    <div
                      key={index}
                      className="absolute left-0 right-0 h-px bg-white/20"
                      style={{ top: `${67 + index * 83}px` }}
                    />
                  ))}

                  {/* Données du tableau */}
                  <div className="grid grid-cols-[98px_155px_98px_125px_98px_164px_98px_61px] gap-[52px] items-start px-6 py-6">
                    {/* Référence */}
                    <div className="flex flex-col" style={{ gap: '56px' }}>
                      {paginatedTransactions.map((transaction) => (
                        <p key={transaction.id} className="text-base font-medium text-white">
                          {transaction.reference}
                        </p>
                      ))}
                    </div>

                    {/* Date */}
                    <div className="flex flex-col" style={{ gap: '64px' }}>
                      {paginatedTransactions.map((transaction) => (
                        <p key={transaction.id} className="text-base font-medium text-white">
                          {transaction.date}
                        </p>
                      ))}
                    </div>

                    {/* Type */}
                    <div className="flex flex-col" style={{ gap: '64px' }}>
                      {paginatedTransactions.map((transaction) => (
                        <p key={transaction.id} className="text-base font-medium text-white">
                          {transaction.type}
                        </p>
                      ))}
                    </div>

                    {/* Montant */}
                    <div className="flex flex-col" style={{ gap: '64px' }}>
                      {paginatedTransactions.map((transaction, index) => (
                        <p key={transaction.id} className={`text-base ${index === 0 ? 'font-semibold' : 'font-medium'} text-white`}>
                          {transaction.amount.toLocaleString('fr-FR')}
                        </p>
                      ))}
                    </div>

                    {/* Frais */}
                    <div className="flex flex-col" style={{ gap: '64px' }}>
                      {paginatedTransactions.map((transaction) => (
                        <p key={transaction.id} className="text-base font-medium text-white">
                          {transaction.fees}
                        </p>
                      ))}
                    </div>

                    {/* Montant total */}
                    <div className="flex flex-col" style={{ gap: '64px' }}>
                      {paginatedTransactions.map((transaction, index) => (
                        <p key={transaction.id} className={`text-base ${index === 0 ? 'font-semibold' : 'font-medium'} text-white`}>
                          {transaction.total.toLocaleString('fr-FR')}
                        </p>
                      ))}
                    </div>

                    {/* Statut */}
                    <div className="flex flex-col" style={{ gap: '48px' }}>
                      {paginatedTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-center px-2 py-2 rounded"
                          style={{
                            backgroundColor: transaction.statusColor === '#1fcb4f' ? 'rgba(31,203,79,0.04)' :
                                            transaction.statusColor === '#ffbd2e' ? 'rgba(255,189,46,0.04)' :
                                            'rgba(225,70,64,0.04)'
                          }}
                        >
                          <p
                            className="text-base font-medium"
                            style={{ color: transaction.statusColor }}
                          >
                            {transaction.status}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-center" style={{ gap: '59px' }}>
                      {paginatedTransactions.map((transaction) => (
                        <button
                          key={transaction.id}
                          onClick={() => setSelectedTransaction(transaction)}
                          className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
                          aria-label={`Voir les détails de la transaction ${transaction.reference}`}
                          title={`Voir les détails de la transaction ${transaction.reference}`}
                        >
                          <Info size={24} className="text-white" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                )}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 0 && (
              <div className="flex items-center justify-end gap-3">
                <p className="text-base font-medium text-white">Page</p>
                <div className="flex gap-3 items-center">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="bg-[rgba(0,100,77,0.3)] flex items-center justify-center p-2.5 rounded-[18px] w-9 h-9 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[rgba(0,100,77,0.5)] transition-colors"
                    aria-label="Page précédente"
                    title="Page précédente"
                  >
                    <ChevronLeft size={15} className="text-white" />
                  </button>
                  {(() => {
                    // Afficher les numéros de page intelligemment
                    const pages: (number | string)[] = [];
                    const maxVisiblePages = 5;
                    
                    if (totalPages <= maxVisiblePages) {
                      // Si moins de 5 pages, afficher toutes
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Logique pour afficher les pages avec ellipsis
                      if (currentPage <= 3) {
                        // Début : 1, 2, 3, 4, ..., last
                        for (let i = 1; i <= 4; i++) {
                          pages.push(i);
                        }
                        pages.push('...');
                        pages.push(totalPages);
                      } else if (currentPage >= totalPages - 2) {
                        // Fin : 1, ..., n-3, n-2, n-1, n
                        pages.push(1);
                        pages.push('...');
                        for (let i = totalPages - 3; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        // Milieu : 1, ..., current-1, current, current+1, ..., last
                        pages.push(1);
                        pages.push('...');
                        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                          pages.push(i);
                        }
                        pages.push('...');
                        pages.push(totalPages);
                      }
                    }

                    return pages.map((page, index) => {
                      if (page === '...') {
                        return (
                          <span key={`ellipsis-${index}`} className="text-base font-medium text-white px-3">
                            ...
                          </span>
                        );
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page as number)}
                          className={`flex items-center justify-center px-3 py-2 rounded-[18px] w-9 h-9 text-base font-medium transition-all ${
                            currentPage === page
                              ? 'bg-[#5AB678] text-white'
                              : 'text-white hover:bg-white/10'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    });
                  })()}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="bg-[rgba(0,100,77,0.3)] border border-[#00644d] flex items-center justify-center p-2.5 rounded-[198px] w-9 h-9 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[rgba(0,100,77,0.5)] transition-colors"
                    aria-label="Page suivante"
                    title="Page suivante"
                  >
                    <ChevronRight size={15} className="text-white" />
                  </button>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Section "Campagnes populaires" */}
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
            {campaignsLoading && (
              <div className="col-span-full text-center text-white/80 py-8">Chargement des campagnes...</div>
            )}
            {!campaignsLoading && campaignsError && (
              <div className="col-span-full text-center text-white/90 py-4">{campaignsError}</div>
            )}
            {!campaignsLoading && !campaignsError && featuredCampaigns.map((campaign, index) => {
              const hasTarget = campaign.targetAmount > 0;
              const progressPercent = hasTarget
                ? Math.min(100, (campaign.currentAmount / campaign.targetAmount) * 100)
                : 0;
              const hasEndDate = campaign.endDate && !Number.isNaN(new Date(campaign.endDate).getTime());
              const formattedDate = hasEndDate
                ? new Date(campaign.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                : 'En cours';
              const categoryLabels: Record<string, string> = {
                'urgence': 'Urgence', 'education': 'Éducation', 'sante': 'Santé',
                'developpement': 'Développement', 'refugies': 'Réfugiés',
                HEALTH: 'Santé', EDUCATION: 'Éducation', FOOD: 'Alimentation', OTHER: 'Autre'
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
                      <div className="flex justify-between items-center mb-4 text-sm text-white/70">
                        <div className="flex items-center space-x-2">
                          <MapPin size={16} className="text-green-800" />
                          <span>{campaign.location || '—'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar size={16} className="text-green-800" />
                          <span>Fin: {formattedDate}</span>
                        </div>
                      </div>
                      {hasTarget && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-bold">
                              {campaign.currentAmount.toLocaleString('fr-FR')} F CFA / {campaign.targetAmount.toLocaleString('fr-FR')} F CFA
                            </span>
                            <span className="text-white">{progressPercent.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${progressPercent}%`,
                                background: 'linear-gradient(to right, #5AB678, #20B6B3)'
                              }}
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 mb-6 text-sm text-white/70">
                        <Users size={16} className="text-green-800" />
                        <span>{(donorCountByCampaignId[campaign.id] ?? 0).toLocaleString('fr-FR')} donateurs</span>
                      </div>
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
                Retrouvez toutes les fonctionnalités d'Amane+ dans une seule application. Faites vos dons, suivez vos rendements, automatisez votre Zakat et participez à des actions solidaires, où que vous soyez.
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
    </>
  );
}
