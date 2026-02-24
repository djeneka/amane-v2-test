/**
 * Détection et normalisation du HTML pour l'affichage des champs campagne
 * (description, impact, process). Gère le HTML échappé (ex. &lt;div&gt;)
 * renvoyé par certaines APIs de traduction.
 * Sanitization via DOMPurify pour éviter les XSS.
 */

import DOMPurify from 'isomorphic-dompurify';

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

/** Balises autorisées pour le contenu campagne (liste blanche). */
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'span',
  'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4',
  'a', 'blockquote', 'div',
];

/** Attributs autorisés (ex. href pour les liens). */
const ALLOWED_ATTR = ['href', 'target', 'rel'];

/**
 * Déséchappe les entités HTML puis sanitize avec DOMPurify pour affichage via dangerouslySetInnerHTML.
 * Réduit le risque XSS tout en conservant la mise en forme légitime.
 */
export function getHtmlForRender(str: string | null | undefined): string {
  if (!str || typeof str !== 'string') return '';
  let out = str;
  for (const [re, replacement] of ENTITIES) {
    out = out.replace(re, replacement);
  }
  return DOMPurify.sanitize(out, { ALLOWED_TAGS, ALLOWED_ATTR });
}
