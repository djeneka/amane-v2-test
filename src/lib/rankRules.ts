/** Règle de rang : palier de points et badge associé */
export interface RankRule {
  id: string;
  label: string;
  minPoints: number;
  badge: string;
}

/** Rangs par palier de points (badges dans public/badges/) */
export const RANK_RULES: RankRule[] = [
  { id: 'argent', label: 'Argent', minPoints: 0, badge: '/badges/argent.png' },
  { id: 'platine', label: 'Platine', minPoints: 501, badge: '/badges/platine.png' },
  { id: 'emeraude', label: 'Émeraude', minPoints: 1500, badge: '/badges/emeraude.png' },
  { id: 'gold', label: 'Gold', minPoints: 2001, badge: '/badges/gold.png' },
];

/**
 * Retourne le rang correspondant au score (le plus élevé dont minPoints <= score).
 */
export function getRankForScore(score: number): RankRule {
  const sorted = [...RANK_RULES].sort((a, b) => b.minPoints - a.minPoints);
  return sorted.find((r) => r.minPoints <= score) ?? RANK_RULES[0];
}
