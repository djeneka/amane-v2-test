'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  Calendar,
  Loader2,
  AlertCircle,
  ChevronRight,
  X,
  User,
  MapPin,
  Building2,
  FileText,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyAidRequests, type AidRequest } from '@/services/help-requests';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/components/LocaleProvider';

const ITEMS_PER_PAGE = 5;

const CATEGORY_KEYS: Record<string, string> = {
  HEALTH: 'categoryHealth',
  EDUCATION: 'categoryEducation',
  WIDOW_SUPPORT: 'categoryWidow',
  HABITATION: 'categoryHabitation',
  OTHER: 'categoryOther',
};

const STATUS_KEYS: Record<string, string> = {
  PENDING: 'statusPending',
  APPROVED: 'statusApproved',
  REJECTED: 'statusRejected',
};

const URGENCY_KEYS: Record<string, string> = {
  LOW: 'urgencyLow',
  MEDIUM: 'urgencyMedium',
  HIGH: 'urgencyHigh',
};

const TRANSMITTER_KEYS: Record<string, string> = {
  SELF: 'transmitterSelf',
  PARTNER: 'transmitterPartner',
};

function formatDate(iso: string, locale: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function DemandeDetailModal({
  demande,
  onClose,
}: {
  demande: AidRequest;
  onClose: () => void;
}) {
  const t = useTranslations('profil');
  const { locale } = useLocale();
  const beneficiary = demande.beneficiaryDetails;
  const transmitter = demande.transmitterDetails;
  const categoryLabel = t(CATEGORY_KEYS[demande.campaignCategory] ?? 'categoryOther');
  const statusLabel = t(STATUS_KEYS[demande.aidRequestStatus] ?? 'statusPending');
  const urgencyLabel = t(URGENCY_KEYS[demande.urgency] ?? 'urgencyMedium');
  const transmitterLabel = t(TRANSMITTER_KEYS[demande.transmitter] ?? 'transmitterSelf');

  const transmitterName =
    transmitter?.transmitterCompanyName ||
    [transmitter?.transmitterFirstName, transmitter?.tansmitterLastName].filter(Boolean).join(' ') ||
    '—';
  const beneficiaryName = beneficiary
    ? `${beneficiary.beneficiaryFirstName || ''} ${beneficiary.beneficiaryLastName || ''}`.trim() || '—'
    : '—';

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#101919] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
          <h3 id="detail-modal-title" className="text-lg font-bold text-white">{t('demandeDetailTitle')}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            aria-label={t('closeAria')}
          >
            <X size={24} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
          {/* Statut et catégorie */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-sm bg-[#00644D]/40 text-[#00D9A5]">
              {statusLabel}
            </span>
            <span className="px-3 py-1 rounded-full text-sm bg-white/10 text-white/90">
              {categoryLabel}
            </span>
            <span className="px-3 py-1 rounded-full text-xs bg-white/10 text-white/70">
              {t('urgencyLabel')} {urgencyLabel}
            </span>
            <span className="px-3 py-1 rounded-full text-xs bg-white/10 text-white/70">
              {transmitterLabel}
            </span>
          </div>

          {/* Émetteur */}
          <div>
            <h4 className="text-sm font-semibold text-white/90 mb-2 flex items-center gap-2">
              <Building2 size={16} />
              {t('transmitter')}
            </h4>
            <p className="text-white/80 text-sm">{transmitterName}</p>
          </div>

          {/* Bénéficiaire */}
          <div>
            <h4 className="text-sm font-semibold text-white/90 mb-2 flex items-center gap-2">
              <User size={16} />
              {t('beneficiary')}
            </h4>
            <div className="bg-[#0d1515] rounded-xl p-4 space-y-2 text-sm">
              <p className="text-white font-medium">{beneficiaryName}</p>
              {beneficiary?.beneficiaryLocation && (
                <p className="text-white/70 flex items-center gap-1">
                  <MapPin size={14} />
                  {beneficiary.beneficiaryLocation}
                </p>
              )}
              {beneficiary?.beneficiaryActivity && (
                <p className="text-white/70">{t('activity')} {beneficiary.beneficiaryActivity}</p>
              )}
              {beneficiary?.beneficiaryMarialStatus && (
                <p className="text-white/70">{t('situation')} {beneficiary.beneficiaryMarialStatus}</p>
              )}
              {beneficiary?.numberOfBeneficiaries != null && (
                <p className="text-white/70">{t('beneficiariesCount')} {beneficiary.numberOfBeneficiaries}</p>
              )}
              {beneficiary?.monthlyIncomeOfBeneficiary != null && (
                <p className="text-white/70">
                  {t('monthlyIncome')} {beneficiary.monthlyIncomeOfBeneficiary.toLocaleString()} F CFA
                </p>
              )}
            </div>
          </div>

          {/* Détails spécifiques selon la catégorie */}
          {demande.healthDetails && (
            <div>
              <h4 className="text-sm font-semibold text-white/90 mb-2 flex items-center gap-2">
                <FileText size={16} />
                {t('healthDetails')}
              </h4>
              <div className="bg-[#0d1515] rounded-xl p-4 text-sm text-white/80 space-y-1">
                {demande.healthDetails.establishmentName && (
                  <p>{t('establishment')} {demande.healthDetails.establishmentName}</p>
                )}
                {demande.healthDetails.totalQuote != null && demande.healthDetails.totalQuote > 0 && (
                  <p>{t('totalQuote')} {demande.healthDetails.totalQuote.toLocaleString()} F CFA</p>
                )}
                {demande.healthDetails.lifeThreateningEmergency && (
                  <p>{t('lifeThreatening')}</p>
                )}
              </div>
            </div>
          )}
          {demande.educationDetails && (
            <div>
              <h4 className="text-sm font-semibold text-white/90 mb-2 flex items-center gap-2">
                <FileText size={16} />
                {t('educationDetails')}
              </h4>
              <div className="bg-[#0d1515] rounded-xl p-4 text-sm text-white/80 space-y-1">
                {demande.educationDetails.typeOfNeed && (
                  <p>{t('needType')} {demande.educationDetails.typeOfNeed}</p>
                )}
                {demande.educationDetails.outstandingAmount != null &&
                  demande.educationDetails.outstandingAmount > 0 && (
                    <p>{t('outstandingAmount')} {demande.educationDetails.outstandingAmount.toLocaleString()} F CFA</p>
                  )}
              </div>
            </div>
          )}
          {demande.widowSupportDetails && (
            <div>
              <h4 className="text-sm font-semibold text-white/90 mb-2">{t('widowSupport')}</h4>
              <div className="bg-[#0d1515] rounded-xl p-4 text-sm text-white/80 space-y-1">
                {demande.widowSupportDetails.whereSheLives && (
                  <p>{t('whereSheLives')} {demande.widowSupportDetails.whereSheLives}</p>
                )}
                {demande.widowSupportDetails.kindOfSupport && (
                  <p>{t('kindOfSupport')} {demande.widowSupportDetails.kindOfSupport}</p>
                )}
              </div>
            </div>
          )}
          {demande.habitationDetails && (
            <div>
              <h4 className="text-sm font-semibold text-white/90 mb-2">{t('habitation')}</h4>
              <div className="bg-[#0d1515] rounded-xl p-4 text-sm text-white/80 space-y-1">
                {demande.habitationDetails.kindOfInsfrastructure && (
                  <p>{t('type')} {demande.habitationDetails.kindOfInsfrastructure}</p>
                )}
                {demande.habitationDetails.whatIsTheQuote != null &&
                  demande.habitationDetails.whatIsTheQuote > 0 && (
                    <p>{t('quote')} {demande.habitationDetails.whatIsTheQuote.toLocaleString()} F CFA</p>
                  )}
              </div>
            </div>
          )}

          {/* Pièces jointes */}
          {demande.attachments && demande.attachments.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white/90 mb-2">{t('attachments')}</h4>
              <ul className="space-y-2">
                {demande.attachments.map((att) => (
                  <li key={att.id}>
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-[#00D9A5] hover:underline"
                    >
                      <FileText size={14} />
                      {att.label || att.type}
                      <ExternalLink size={12} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dates */}
          <div className="text-white/50 text-xs border-t border-white/10 pt-4">
            <p>{t('createdOn')} {formatDate(demande.createdAt, locale)}</p>
            {demande.updatedAt !== demande.createdAt && (
              <p>{t('modifiedOn')} {formatDate(demande.updatedAt, locale)}</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function MesDemandesPage() {
  const t = useTranslations('profil');
  const { locale } = useLocale();
  const { accessToken } = useAuth();
  const [demandes, setDemandes] = useState<AidRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailDemande, setDetailDemande] = useState<AidRequest | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getMyAidRequests(accessToken)
      .then(setDemandes)
      .catch((err) => setError(err instanceof Error ? err.message : t('loadError')))
      .finally(() => setLoading(false));
  }, [accessToken, t]);

  const totalPages = Math.max(1, Math.ceil(demandes.length / ITEMS_PER_PAGE));
  const paginatedDemandes = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return demandes.slice(start, start + ITEMS_PER_PAGE);
  }, [demandes, page]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(totalPages);
  }, [page, totalPages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 size={32} className="text-[#00D9A5] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-t-2xl p-6">
          <h2 className="text-xl font-bold text-white">{t('demandesTitle')}</h2>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-center gap-3 text-red-200">
          <AlertCircle size={24} className="flex-shrink-0" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-t-2xl p-6">
        <h2 className="text-xl font-bold text-white">
          {t('demandesTitle')}
        </h2>
        <p className="text-white/70 mt-1 text-sm">
          {t('demandesSubtitle')}
        </p>
      </div>

      <div className="bg-[#101919] rounded-2xl border border-white/10 overflow-hidden">
        {demandes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#00644D]/30 flex items-center justify-center mb-4">
              <ClipboardList size={32} className="text-[#00D9A5]" />
            </div>
            <p className="text-white font-medium mb-1">{t('demandesEmpty')}</p>
            <p className="text-white/60 text-sm max-w-sm">
              {t('demandesEmptyHint')}
            </p>
          </motion.div>
        ) : (
          <>
            <ul className="divide-y divide-white/10">
              {paginatedDemandes.map((demande, index) => {
                const beneficiary = demande.beneficiaryDetails;
                const subject = beneficiary
                  ? `${beneficiary.beneficiaryFirstName || ''} ${beneficiary.beneficiaryLastName || ''}`.trim() || t('helpRequestSubject')
                  : t('helpRequestSubject');
                const categoryLabel = t(CATEGORY_KEYS[demande.campaignCategory] ?? 'categoryOther');
                const statusLabel = t(STATUS_KEYS[demande.aidRequestStatus] ?? 'statusPending');
                return (
                  <li key={demande.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-[#00644D]/30 flex items-center justify-center flex-shrink-0">
                          <ClipboardList size={20} className="text-[#00D9A5]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium">{subject}</p>
                          <p className="text-white/60 text-sm mt-0.5 line-clamp-2">
                            {categoryLabel}
                            {beneficiary?.beneficiaryLocation ? ` · ${beneficiary.beneficiaryLocation}` : ''}
                          </p>
                          <p className="text-white/50 text-xs flex items-center gap-1 mt-1">
                            <Calendar size={12} />
                            {formatDate(demande.createdAt, locale)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:flex-shrink-0">
                        <span className="text-white/60 text-sm">{statusLabel}</span>
                        <button
                          type="button"
                          onClick={() => setDetailDemande(demande)}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#00644D]/40 text-[#00D9A5] hover:bg-[#00644D]/60 transition-colors text-sm font-medium"
                        >
                          {t('viewDetails')}
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </motion.div>
                  </li>
                );
              })}
            </ul>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-white/10 bg-[#0d1515]/50">
                <p className="text-white/60 text-sm">
                  {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, demandes.length)} sur {demandes.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-lg text-white/80 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label={t('prevPageAria')}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-white/80 text-sm min-w-[4rem] text-center">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-2 rounded-lg text-white/80 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label={t('nextPageAria')}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {detailDemande && (
          <DemandeDetailModal
            demande={detailDemande}
            onClose={() => setDetailDemande(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
