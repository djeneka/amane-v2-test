/** Règle de rang : palier de points et badge associé */
export interface RankRule {
  id: string;
  label: string;
  minPoints: number;
  badge: string;
}

/**
 * Rangs par palier de points (badges dans public/badges/).
 * Fer 0–4, Bronze 5–19, Argent 20–49, Or 50–99, Platine 100+
 */
export const RANK_RULES: RankRule[] = [
  { id: 'fer', label: 'Fer', minPoints: 0, badge: '/badges/Fer.png' },
  { id: 'bronze', label: 'Bronze', minPoints: 5, badge: '/badges/Bronze.png' },
  { id: 'argent', label: 'Argent', minPoints: 20, badge: '/badges/argent.png' },
  { id: 'gold', label: 'Or', minPoints: 50, badge: '/badges/Or.png' },
  { id: 'platine', label: 'Platine', minPoints: 100, badge: '/badges/Platinum.png' },
];

/**
 * Retourne le rang correspondant au score (le plus élevé dont minPoints <= score).
 */
export function getRankForScore(score: number): RankRule {
  const sorted = [...RANK_RULES].sort((a, b) => b.minPoints - a.minPoints);
  return sorted.find((r) => r.minPoints <= score) ?? RANK_RULES[0];
}

/** Rangs triés par minPoints croissant (pour calcul du prochain palier) */
const RANKS_ASC = [...RANK_RULES].sort((a, b) => a.minPoints - b.minPoints);

/**
 * Retourne le rang suivant (palier au-dessus) ou null si déjà au max.
 */
export function getNextRank(score: number): RankRule | null {
  const current = getRankForScore(score);
  const currentIndex = RANKS_ASC.findIndex((r) => r.id === current.id);
  return RANKS_ASC[currentIndex + 1] ?? null;
}
