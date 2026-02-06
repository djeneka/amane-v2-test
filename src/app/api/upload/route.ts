import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const bucket = process.env.EXPO_PUBLIC_S3_BUCKET_NAME ?? process.env.S3_BUCKET_NAME;
const region = process.env.EXPO_PUBLIC_S3_REGION ?? process.env.S3_REGION ?? 'eu-north-1';
const directory = process.env.EXPO_PUBLIC_S3_DIRECTORY_NAME ?? process.env.S3_DIRECTORY_NAME ?? 'uploads';
const accessKeyId = process.env.EXPO_PUBLIC_S3_ACCESS_KEY_ID ?? process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.EXPO_PUBLIC_S3_SECRET_ACCESS_KEY ?? process.env.S3_SECRET_ACCESS_KEY;

function getS3Client(): S3Client | null {
  if (!bucket || !region || !accessKeyId || !secretAccessKey) return null;
  return new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
}

/**
 * POST /api/upload
 * Body: FormData with field "file" (image file).
 * Uploads to S3 and returns { url } for storing in DB.
 */
export async function POST(request: NextRequest) {
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

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? ext : 'jpg';
    const key = `${directory}/profil/${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;
    const body = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || `image/${safeExt}`;

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
