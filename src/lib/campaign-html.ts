/**
 * Détection et normalisation du HTML pour l'affichage des champs campagne
 * (description, impact, process). Gère le HTML échappé (ex. &lt;div&gt;)
 * renvoyé par certaines APIs de traduction.
 */

/** Indique si la chaîne contient du HTML (balises ou entités échappées). */
export function isHtmlContent(str: string | null | undefined): boolean {
  if (!str || typeof str !== 'string') return false;
  const t = str.trim();
  return t.includes('<') || t.includes('&lt;') || t.includes('&gt;');
}

const ENTITIES: [RegExp, string][] = [
  [/&lt;/g, '<'],
  [/&gt;/g, '>'],
  [/&amp;/g, '&'],
  [/&quot;/g, '"'],
  [/&#39;/g, "'"],
  [/&#x27;/g, "'"],
];

/** Déséchappe les entités HTML courantes pour affichage via dangerouslySetInnerHTML. */
export function getHtmlForRender(str: string | null | undefined): string {
  if (!str || typeof str !== 'string') return '';
  let out = str;
  for (const [re, replacement] of ENTITIES) {
    out = out.replace(re, replacement);
  }
  return out;
}
