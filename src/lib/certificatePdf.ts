/**
 * Génération du PDF "Khatma de don" selon le design Figma (node 76983-18412).
 * Image certificat en fond + texte dynamique : donateur, bénéficiaire, montant,
 * numéro de certificat et QR code "Scanne moi - Et vois l'impact de ton don".
 */

import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

const CERTIFICATE_IMAGE_URL = '/images/Certificat.png';

/** Dimensions A4 en mm (portrait) */
const A4_WIDTH = 210;
const A4_HEIGHT = 297;

/** Résolution cible pour l'image de fond (150 DPI = bon compromis qualité/taille) */
const BG_IMAGE_MAX_WIDTH = 1240;
const BG_IMAGE_MAX_HEIGHT = 1754;
const BG_JPEG_QUALITY = 0.85;

/** Layout Figma : positions en mm (origine haut-gauche), polices et couleurs */
const LAYOUT = {
  donorName: { x: 115, y: 62, fontSize: 16, align: 'center' as const },
  donorUnderline: { x1: 55, y1: 101, x2: 155, y2: 101 },
  recipientName: { x: 115, y: 86, fontSize: 16, align: 'center' as const },
  recipientUnderline: { x1: 55, y1: 131, x2: 155, y2: 131 },
  amount: { x: 117, y: 118, fontSize: 20, align: 'center' as const },
  certNumber: { x: 115, y: 152, fontSize: 10, align: 'center' as const },
  qr: { x: 40, y: 149, sizeMm: 22 },
  /** Centre horizontal du bloc QR pour texte centré */
  qrCenterX: 42,
  scanMeY: 260,
  scanMeFontSize: 8,
  impactTextY: 268,
  impactTextFontSize: 7,
};

const COLORS = {
  white: [255, 255, 255] as [number, number, number],
  /** #EAE7B1 : donateur, bénéficiaire, n° certificat */
  gold: [234, 231, 177] as [number, number, number],
  darkGreen: [0, 60, 45] as [number, number, number], // soulignement type Figma
};

/**
 * Charge l'image de fond, la redimensionne et la convertit en JPEG pour réduire la taille du PDF.
 */
async function loadBackgroundAsJpegDataUrl(url: string): Promise<string> {
  const blob = await fetch(url).then((res) => {
    if (!res.ok) throw new Error('Image certificat introuvable');
    return res.blob();
  });

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      const scale = Math.min(
        BG_IMAGE_MAX_WIDTH / img.width,
        BG_IMAGE_MAX_HEIGHT / img.height,
        1
      );
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas non disponible'));
        return;
      }
      ctx.fillStyle = '#0a1515';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', BG_JPEG_QUALITY);
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Échec chargement image certificat'));
    };
    img.src = objectUrl;
  });
}

/** Montant sans slash : espaces comme séparateurs de milliers uniquement (ex. 5 000 F CFA). */
function formatAmount(amount: number): string {
  const n = Math.round(Number(amount));
  const s = String(n);
  const withSpaces = s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${withSpaces} F CFA`;
}

/** Génère un numéro de certificat unique (ex. CERT0123456789) */
function generateCertificateNumber(): string {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `CERT${datePart}${random}`;
}

/** Génère le QR code en data URL (PNG) - 120px suffisant pour 24mm sur A4 */
async function getQrDataUrl(text: string, sizePx: number = 120): Promise<string> {
  return QRCode.toDataURL(text, {
    width: sizePx,
    margin: 1,
    color: { dark: '#000000', light: '#ffffff' },
  });
}

export interface CertificateData {
  /** Nom de la personne qui a fait le don */
  donorName: string;
  /** Nom du tiers (bénéficiaire) */
  recipientName: string;
  /** Montant du don */
  amount: number;
  /** URL encodée dans le QR (impact du don). Si absent, utilise une URL par défaut. */
  impactUrl?: string;
}

/** Construit le document PDF du certificat et retourne le jsPDF (pour réutilisation). */
async function buildCertificateDoc(data: CertificateData): Promise<jsPDF> {
  const certNumber = generateCertificateNumber();
  const impactUrl =
    data.impactUrl ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/transactions`
      : 'https://amaneplus.net/transactions');

  const imageDataUrl = await loadBackgroundAsJpegDataUrl(CERTIFICATE_IMAGE_URL);
  const qrDataUrl = await getQrDataUrl(impactUrl);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  doc.addImage(imageDataUrl, 'JPEG', 0, 0, A4_WIDTH, A4_HEIGHT);
  doc.setFont('helvetica');

  doc.setTextColor(...COLORS.gold);
  doc.setFontSize(LAYOUT.donorName.fontSize);
  doc.setFont('helvetica', 'bold');
  const donorText = (data.donorName.trim() || '—').toUpperCase();
  doc.text(donorText, LAYOUT.donorName.x, LAYOUT.donorName.y, {
    align: LAYOUT.donorName.align,
  });
  doc.setDrawColor(...COLORS.darkGreen);
  doc.setLineWidth(0.4);
  doc.line(
    LAYOUT.donorUnderline.x1,
    LAYOUT.donorUnderline.y1,
    LAYOUT.donorUnderline.x2,
    LAYOUT.donorUnderline.y2
  );

  doc.setTextColor(...COLORS.gold);
  doc.setFontSize(LAYOUT.recipientName.fontSize);
  doc.setFont('helvetica', 'bold');
  const recipientText = (data.recipientName.trim() || '—').toUpperCase();
  doc.text(recipientText, LAYOUT.recipientName.x, LAYOUT.recipientName.y, {
    align: LAYOUT.recipientName.align,
  });
  doc.setDrawColor(...COLORS.darkGreen);
  doc.line(
    LAYOUT.recipientUnderline.x1,
    LAYOUT.recipientUnderline.y1,
    LAYOUT.recipientUnderline.x2,
    LAYOUT.recipientUnderline.y2
  );

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(LAYOUT.amount.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.text(formatAmount(data.amount), LAYOUT.amount.x, LAYOUT.amount.y, {
    align: LAYOUT.amount.align,
  });

  doc.setTextColor(...COLORS.gold);
  doc.setFontSize(LAYOUT.certNumber.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.text(`No certificat : ${certNumber}`, LAYOUT.certNumber.x, LAYOUT.certNumber.y, {
    align: LAYOUT.certNumber.align,
  });

  doc.addImage(
    qrDataUrl,
    'PNG',
    LAYOUT.qr.x,
    LAYOUT.qr.y,
    LAYOUT.qr.sizeMm,
    LAYOUT.qr.sizeMm
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(LAYOUT.scanMeFontSize);
  doc.setTextColor(...COLORS.white);
  // doc.text('SCANNE MOI', LAYOUT.qrCenterX, LAYOUT.scanMeY, { align: 'center' });
  doc.setFontSize(LAYOUT.impactTextFontSize);
  // doc.text("Et vois l'impact de ton don", LAYOUT.qrCenterX, LAYOUT.impactTextY, {
  //   align: 'center',
  // });

  return doc;
}

/**
 * Génère le PDF du certificat et retourne un Blob (pour upload S3, etc.).
 * @param data - Données du certificat
 */
export async function generateCertificatePdfAsBlob(
  data: CertificateData
): Promise<Blob> {
  const doc = await buildCertificateDoc(data);
  return doc.output('blob');
}

/**
 * Génère le PDF du certificat selon le design Figma et déclenche le téléchargement.
 * @param data - Données du certificat
 * @param fileName - Nom du fichier téléchargé (sans .pdf)
 */
export async function generateCertificatePdf(
  data: CertificateData,
  fileName: string = 'certificat-don'
): Promise<void> {
  const doc = await buildCertificateDoc(data);
  doc.save(`${fileName}.pdf`);
}
