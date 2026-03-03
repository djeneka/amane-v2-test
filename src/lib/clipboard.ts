/**
 * Copie une URL dans le presse-papier. Utilise writeText en priorité (meilleur support
 * iOS/Safari), puis repli avec execCommand pour les contextes restreints.
 */
export async function copyLinkToClipboard(url: string, _linkText?: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // 1) Priorité à writeText (fiable sur iOS, Safari, et contextes sécurisés)
  if (typeof navigator?.clipboard?.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      // continuer vers le repli
    }
  }

  // 2) Repli : textarea + execCommand (fonctionne en HTTP, iframes, anciens navigateurs)
  try {
    const textarea = document.createElement('textarea');
    textarea.value = url;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, url.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
