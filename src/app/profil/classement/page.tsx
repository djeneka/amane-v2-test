'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Trophy, Medal } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyRank, passToAnonymous, type RankingEntry } from '@/services/statistics';

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/** Génère 1 chiffre + 1 lettre uniques et stables par userId */
function getAnonymousSuffix(userId: string): string {
  const hex = userId.replace(/-/g, '');
  if (hex.length < 4) return '0A';
  const digit = parseInt(hex.slice(0, 2), 16) % 10;
  const letterIndex = parseInt(hex.slice(2, 4), 16) % 26;
  const letter = String.fromCharCode(65 + letterIndex);
  return `${digit}${letter}`;
}

function getDisplayName(entry: RankingEntry): string {
  return entry.anonymous ? `Anonyme-${getAnonymousSuffix(entry.userId)}` : entry.name;
}

function getDisplayInitials(entry: RankingEntry): string {
  return entry.anonymous ? getAnonymousSuffix(entry.userId) : getInitials(entry.name);
}

export default function ClassementPage() {
  const { isAuthenticated, accessToken, user } = useAuth();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anonymizeLoading, setAnonymizeLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setRanking([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    let cancelled = false;
    getMyRank({ token: accessToken })
      .then((list) => {
        if (!cancelled) setRanking(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? 'Erreur lors du chargement du classement');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [isAuthenticated, accessToken]);

  const myEntry = user?.id ? ranking.find((e) => e.userId === user.id) : null;

  const handleToggleAnonymous = async () => {
    if (!user?.id || !accessToken) return;
    setAnonymizeLoading(true);
    setError(null);
    try {
      await passToAnonymous(user.id, {
        token: accessToken,
        anonymous: !myEntry?.anonymous,
      });
      const list = await getMyRank({ token: accessToken });
      setRanking(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du changement');
    } finally {
      setAnonymizeLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-[#00644D]/30 flex items-center justify-center">
          <Trophy size={24} className="text-[#00D9A5]" />
        </div>
        <div>
          <h1 className="text-white text-xl font-semibold">Classement</h1>
          <p className="text-white/70 text-sm">
            {myEntry
              ? `Tu es ${myEntry.rank}e sur ${ranking.length}`
              : ranking.length > 0
                ? 'Consulte le classement des contributeurs'
                : 'Aucun classement pour le moment'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-[#101919]/50 rounded-2xl border border-white/10 p-8 text-center text-white/70">
          Chargement du classement...
        </div>
      ) : error ? (
        <div className="bg-[#101919]/50 rounded-2xl border border-white/10 p-8 text-center text-red-400">
          {error}
        </div>
      ) : ranking.length === 0 ? (
        <div className="bg-[#101919]/50 rounded-2xl border border-white/10 p-8 text-center text-white/70">
          Aucun participant au classement pour le moment.
        </div>
      ) : (
        <div className="bg-[#101919]/50 rounded-2xl border border-white/10 overflow-hidden">
          <div className="divide-y divide-white/10">
            {ranking.map((entry, index) => {
              const isMe = entry.userId === user?.id;
              return (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`flex items-center gap-4 p-4 sm:p-5 ${
                    isMe ? 'bg-[#00644D]/20 border-l-4 border-[#00D9A5]' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex-shrink-0 w-10 text-center">
                    {entry.rank <= 3 ? (
                      <Medal
                        size={28}
                        className={`mx-auto ${
                          entry.rank === 1
                            ? 'text-amber-400'
                            : entry.rank === 2
                              ? 'text-slate-300'
                              : 'text-amber-700'
                        }`}
                      />
                    ) : (
                      <span className="text-white/80 font-bold text-lg">{entry.rank}</span>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {!entry.anonymous && entry.profilePicture ? (
                      <Image
                        src={entry.profilePicture}
                        alt={getDisplayName(entry)}
                        width={44}
                        height={44}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-[#00644D]/30 flex items-center justify-center text-white font-semibold text-sm">
                        {getDisplayInitials(entry)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isMe ? 'text-[#00D9A5]' : 'text-white'}`}>
                      {getDisplayName(entry)}
                      {isMe && (
                        <span className="ml-2 text-xs text-white/70 font-normal">(ma position)</span>
                      )}
                    </p>
                    <p className="text-white/60 text-sm">{entry.score.toLocaleString('fr-FR')} points</p>
                  </div>
                  {isMe && (
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <span className="text-white/60 text-xs whitespace-nowrap">Anonyme</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={myEntry?.anonymous ? 'true' : 'false'}
                        aria-label={myEntry?.anonymous ? 'Afficher mon nom' : 'Passer en anonyme'}
                        onClick={handleToggleAnonymous}
                        disabled={anonymizeLoading}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#00D9A5] focus:ring-offset-2 focus:ring-offset-[#101919] disabled:opacity-50 ${
                          myEntry?.anonymous ? 'bg-[#00D9A5]' : 'bg-white/20'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                            myEntry?.anonymous ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  )}
                  <div className="flex-shrink-0 text-right">
                    <span className="text-[#00D9A5] font-bold">{entry.score.toLocaleString('fr-FR')}</span>
                    <span className="text-white/60 text-sm ml-1">pts</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
