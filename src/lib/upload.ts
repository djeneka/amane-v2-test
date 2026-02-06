/**
 * Envoie un fichier image vers l'API d'upload (S3) et retourne l'URL publique.
 */
export async function uploadProfileImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.set('file', file);
  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || 'Échec upload');
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

/**
 * Convertit une data URL (ex: preview après FileReader) en File.
 */
export function dataUrlToFile(dataUrl: string, fileName = 'avatar.jpg'): File {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new File([arr], fileName, { type: mime });
}
