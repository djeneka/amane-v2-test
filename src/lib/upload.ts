const uploadToS3 = async (
  file: File,
  folder?: string,
  accessToken?: string | null
): Promise<string> => {
  const formData = new FormData();
  formData.set('file', file);
  if (folder) formData.set('folder', folder);
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || 'Échec upload');
  }
  const data = (await res.json()) as { url: string };
  return data.url;
};

/**
 * Envoie un fichier vers l'API d'upload (S3) et retourne l'URL publique.
 * Requiert un utilisateur connecté (accessToken) : l'API /api/upload exige l'authentification.
 * @param file - Fichier à envoyer
 * @param folder - Sous-dossier S3 optionnel (ex: "aid-requests", "certificates", "profil")
 * @param accessToken - Token Bearer de l'utilisateur connecté
 */
export async function uploadFile(
  file: File,
  folder?: string,
  accessToken?: string | null
): Promise<string> {
  return uploadToS3(file, folder, accessToken);
}

/**
 * Envoie un fichier image vers l'API d'upload (S3) et retourne l'URL publique.
 */
export async function uploadProfileImage(
  file: File,
  accessToken?: string | null
): Promise<string> {
  return uploadToS3(file, 'profil', accessToken);
}

/**
 * Envoie un fichier PDF (certificat) vers l'API d'upload (S3) et retourne l'URL publique.
 */
export async function uploadCertificatePdf(
  file: File,
  accessToken?: string | null
): Promise<string> {
  return uploadToS3(file, 'certificates', accessToken);
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
