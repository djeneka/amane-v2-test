'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Calendar,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Building2,
  FileText,
  ExternalLink,
  Gift,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyDonations, type Donation } from '@/services/donations';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/components/LocaleProvider';

const ITEMS_PER_PAGE = 5;

const DEDICATION_KEYS: Record<string, string> = {
  LIVING: 'dedicationLiving',
  IN_MEMORY: 'dedicationInMemory',
  IN_HONOR_OF: 'dedicationInHonor',
};

const CERTIFICATE_KEYS: Record<string, string> = {
  SELF: 'certificateSelf',
  HONOREE: 'certificateHonoree',
  SELF_AND_HONOREE: 'certificateSelfAndHonoree',
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

function DonDetailModal({ don, onClose }: { don: Donation; onClose: () => void }) {
  const t = useTranslations('profil');
  const { locale } = useLocale();
  const title = don.campaign?.title ?? t('generalDonation');
  const dedicationLabel =
    don.actor === 'THIRD_PARTY' && don.thirdParty
      ? `${t(DEDICATION_KEYS[don.thirdParty.dedicationType] ?? 'forMyself')} · ${don.thirdParty.firstName} ${don.thirdParty.lastName}`
      : t('forMyself');

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="don-detail-modal-title"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#101919] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
          <h3 id="don-detail-modal-title" className="text-lg font-bold text-white">
            {t('donDetailTitle')}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            aria-label={t('closeAria')}
          >
            <X size={24} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-white/90 mb-2 flex items-center gap-2">
              <Gift size={16} />
              {t('campaign')}
            </h4>
            <p className="text-white font-medium">{title}</p>
            {don.campaign && (
              <p className="text-white/60 text-sm mt-1">
                {t('objective')} : {don.campaign.currentAmount.toLocaleString()} / {don.campaign.targetAmount ? don.campaign.targetAmount.toLocaleString() : '—'} F CFA · {don.campaign.status}
              </p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white/90 mb-2 flex items-center gap-2">
              <User size={16} />
              {t('dedication')}
            </h4>
            <p className="text-white/80 text-sm">{dedicationLabel}</p>
            {don.actor === 'THIRD_PARTY' && don.thirdParty && (
              <div className="bg-[#0d1515] rounded-xl p-4 mt-3 space-y-2 text-sm">
                <p className="text-white/80">
                  {t('link')} : {don.thirdParty.relationshipType}
                </p>
                {don.thirdParty.personalMessage && (
                  <p className="text-white/70 italic">« {don.thirdParty.personalMessage} »</p>
                )}
                <p className="text-white/60 text-xs">
                  {t('certificate')} : {t(CERTIFICATE_KEYS[don.thirdParty.certificateRecipient] ?? 'certificateSelf')}
                  {don.thirdParty.showMyNameOnCertificate ? ` · ${t('myNameOnCertificate')}` : ''}
                </p>
                {don.thirdParty.certificatUrl && (
                  <a
                    href={don.thirdParty.certificatUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#00D9A5] hover:underline text-sm mt-2"
                  >
                    <FileText size={14} />
                    {t('viewCertificate')}
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white/90 mb-2 flex items-center gap-2">
              <Building2 size={16} />
              {t('account')}
            </h4>
            <p className="text-white/80 text-sm">{don.user.name}</p>
            <p className="text-white/60 text-xs">{don.user.email}</p>
          </div>

          <div className="text-white/50 text-xs border-t border-white/10 pt-4 space-y-1">
            <p>{t('doneOn')} {formatDate(don.createdAt, locale)}</p>
            <p className="text-white/40">{t('transaction')} : {don.transactionId}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function MesDonsPage() {
  const t = useTranslations('profil');
  const { locale } = useLocale();
  const { accessToken } = useAuth();
  const [dons, setDons] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [detailDon, setDetailDon] = useState<Donation | null>(null);

  const totalPages = Math.max(1, Math.ceil(dons.length / ITEMS_PER_PAGE));
  const paginatedDons = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return dons.slice(start, start + ITEMS_PER_PAGE);
  }, [dons, page]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getMyDonations(accessToken)
      .then(setDons)
      .catch((err) => setError(err instanceof Error ? err.message : t('loadError')))
      .finally(() => setLoading(false));
  }, [accessToken]);

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
          <h2 className="text-xl font-bold text-white">{t('donsTitle')}</h2>
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
          {t('donsTitle')}
        </h2>
        <p className="text-white/70 mt-1 text-sm">
          {t('donsSubtitle')}
        </p>
      </div>

      <div className="bg-[#101919] rounded-2xl border border-white/10 overflow-hidden">
        {dons.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#00644D]/30 flex items-center justify-center mb-4">
              <Heart size={32} className="text-[#00D9A5]" />
            </div>
            <p className="text-white font-medium mb-1">{t('donsEmpty')}</p>
            <p className="text-white/60 text-sm max-w-sm">
              {t('donsEmptyHint')}
            </p>
          </motion.div>
        ) : (
          <>
            <ul className="divide-y divide-white/10">
              {paginatedDons.map((don, index) => {
              const title = don.campaign?.title ?? t('generalDonation');
              const dedication =
                don.actor === 'THIRD_PARTY' && don.thirdParty
                  ? `${t('onBehalfOf')} ${don.thirdParty.firstName} ${don.thirdParty.lastName}`
                  : t('forMyself');
              return (
                <li key={don.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-[#00644D]/30 flex items-center justify-center flex-shrink-0">
                        <Heart size={20} className="text-[#00D9A5]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium">{title}</p>
                        <p className="text-white/60 text-sm mt-0.5">{dedication}</p>
                        <p className="text-white/50 text-xs flex items-center gap-1 mt-1">
                          <Calendar size={12} />
                          {formatDate(don.createdAt, locale)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDetailDon(don)}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#00644D]/40 text-[#00D9A5] hover:bg-[#00644D]/60 transition-colors text-sm font-medium sm:flex-shrink-0"
                    >
                      {t('viewDetails')}
                      <ChevronRight size={16} />
                    </button>
                  </motion.div>
                </li>
              );
              })}
            </ul>

            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-white/10 bg-[#0d1515]/50">
                <p className="text-white/60 text-sm">
                  {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, dons.length)} sur {dons.length}
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
        {detailDon && (
          <DonDetailModal don={detailDon} onClose={() => setDetailDon(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
