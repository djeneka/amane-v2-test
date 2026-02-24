import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Ne pas utiliser EXPO_PUBLIC_* ou NEXT_PUBLIC_* pour les secrets (exposés au client).
const bucket = process.env.S3_BUCKET_NAME;
const region = process.env.S3_REGION ?? 'eu-north-1';
const directory = process.env.S3_DIRECTORY_NAME ?? 'uploads';
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

function getS3Client(): S3Client | null {
  if (!bucket || !region || !accessKeyId || !secretAccessKey) return null;
  return new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
}

/** Taille max d'un fichier uploadé (10 Mo) */
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** Magic bytes pour valider le type réel du fichier. Retourne l'extension autorisée ou null. */
function getAllowedExtensionFromMagicBytes(buffer: Buffer): string | null {
  if (buffer.length < 4) return null;
  const jpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (jpeg) return 'jpg';
  const png =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;
  if (png) return 'png';
  const gif =
    buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38;
  if (gif) return 'gif';
  const webp =
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50;
  if (webp) return 'webp';
  const pdf =
    buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
  if (pdf) return 'pdf';
  return null;
}

/**
 * POST /api/upload
 * Requiert : header Authorization: Bearer <accessToken> (utilisateur connecté).
 * Body: FormData with field "file" (image or PDF).
 * Taille max : 10 Mo. Types acceptés : JPG, PNG, GIF, WebP, PDF (validés par magic bytes).
 * Uploads to S3 and returns { url } for storing in DB.
 */
async function isAuthenticated(authHeader: string | null): Promise<boolean> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7).trim();
  if (!token) return false;
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');
  if (!baseUrl) return false;
  try {
    const res = await fetch(`${baseUrl}/api/users/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!(await isAuthenticated(authHeader))) {
    return NextResponse.json(
      { error: 'Non autorisé. Connexion requise.' },
      { status: 401 }
    );
  }

  const s3 = getS3Client();
  if (!s3) {
    return NextResponse.json(
      { error: 'Configuration S3 manquante (bucket, region, credentials)' },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Fichier manquant (field "file")' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `Fichier trop volumineux (max ${MAX_FILE_SIZE_BYTES / 1024 / 1024} Mo)` },
        { status: 400 }
      );
    }

    const body = Buffer.from(await file.arrayBuffer());
    const detectedExt = getAllowedExtensionFromMagicBytes(body);
    if (!detectedExt) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé (images JPG, PNG, GIF, WebP ou PDF uniquement)' },
        { status: 400 }
      );
    }

    const folder = (formData.get('folder') as string)?.trim();
    const subdir = folder || (detectedExt === 'pdf' ? 'certificates' : 'profil');
    const key = `${directory}/${subdir}/${Date.now()}-${Math.random().toString(36).slice(2)}.${detectedExt}`;
    const contentType =
      detectedExt === 'pdf'
        ? 'application/pdf'
        : file.type || `image/${detectedExt}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );

    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    return NextResponse.json({ url });
  } catch (err) {
    console.error('Upload S3 error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur upload' },
      { status: 500 }
    );
  }
}
