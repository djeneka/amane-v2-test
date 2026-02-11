'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, CheckCircle, User, Building, Hash, Infinity, Heart, ChevronDown, FileText, Upload, Paperclip, Handshake, Pen, Clock, Home, MapPin, Users, Briefcase, DollarSign, GraduationCap, Building2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getActiveCampaignsRaw, type ApiCampaign } from '@/services/campaigns';
import { createAidRequest } from '@/services/help-requests';
import { uploadFile } from '@/lib/upload';

/** Catégories de campagne alignées sur l’API */
export type CampaignCategory = 'HEALTH' | 'EDUCATION' | 'WIDOW_SUPPORT' | 'HABITATION';

const API_CATEGORY_TO_SECTION: Record<string, CampaignCategory> = {
  HEALTH: 'HEALTH',
  EDUCATION: 'EDUCATION',
  HOUSING: 'HABITATION',
  UTILITIES: 'WIDOW_SUPPORT',
};

function apiCategoryToSection(apiCategory: string): CampaignCategory | null {
  return API_CATEGORY_TO_SECTION[apiCategory?.toUpperCase()] ?? null;
}

const SECTION_LABELS: Record<CampaignCategory, string> = {
  HEALTH: 'Soutien Santé',
  EDUCATION: 'Éducation / Scolarisation',
  WIDOW_SUPPORT: 'Accompagnement des Veuves',
  HABITATION: 'Réhabilitation / Infrastructures',
};

/** Options type de besoin (Éducation) — design Figma */
const EDUCATION_TYPE_NEED_OPTIONS = [
  { value: "Arriérés d'écolage", label: "Arriérés d'écolage" },
  { value: 'Fournitures/Kits', label: 'Fournitures/Kits' },
  { value: 'Transport', label: 'Transport' },
] as const;

/** Options habitation (Veuves) — design Figma */
const WIDOW_WHERE_SHE_LIVES_OPTIONS = [
  { value: 'Location', label: 'Location' },
  { value: 'Familiale', label: 'Familiale' },
  { value: 'Hébergement', label: 'Hébergement' },
] as const;

/** Options genre de soutien (Veuves) — design Figma */
const WIDOW_KIND_OF_SUPPORT_OPTIONS = [
  { value: 'AGR', label: "Pour une Activité Génératrice de Revenu (AGR)" },
  { value: 'VIVRES', label: 'Des vivres' },
  { value: 'DETTES', label: 'Payement de ses dettes' },
  { value: 'FACTURES_LOYERS', label: 'Pour le payement des factures/loyers' },
  { value: 'SCOLARISATION', label: 'Scolarisation des enfants' },
] as const;

/** Options type d'infrastructure — design Figma */
const HABITATION_KIND_OPTIONS = [
  { value: 'Mosquée', label: 'Mosquée' },
  { value: 'École', label: 'École' },
  { value: "Centre d'apprentissage", label: "Centre d'apprentissage" },
  { value: 'Autres', label: 'Autres' },
] as const;

interface AskForHelpFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  { id: 1, label: 'Informations sur l\'émetteur' },
  { id: 2, label: 'Identification du bénéficiaire' },
  { id: 3, label: 'Documents à fournir' },
  { id: 4, label: 'Engagement' },
  { id: 5, label: 'Signature' },
];

type EmitterType = 'myself' | 'third-party' | 'partner' | 'volunteer' | null;

/** Valeurs API pour l'émetteur (transmitter) */
const TRANSMITTER_API: Record<NonNullable<EmitterType>, string> = {
  myself: 'SELF',
  'third-party': 'THIRD_PARTY',
  partner: 'PARTNER',
  volunteer: 'VOLUNTEER_AMANE',
};

/** Éligibilité Charia — catégories Asnaf (3 options) */
/** Valeurs API (typo backend : AL_GHARIMOIN) */
export type ShariahEligibilityValue = 'AL_FOUQARA' | 'AL_MASAKIN' | 'AL_GHARIMOIN';

const SHARIAH_ELIGIBILITY_OPTIONS: { value: ShariahEligibilityValue; label: string }[] = [
  { value: 'AL_FOUQARA', label: 'Al fouqara (pauvre : aucun revenu)' },
  { value: 'AL_MASAKIN', label: 'Al Masakin (Nécessiteux : revenu insuffisant pour les besoins de base)' },
  { value: 'AL_GHARIMOIN', label: 'Al Gharimin (Endetté : dettes de santé ou de survie uniquement)' },
];

/** Urgence — valeurs API */
export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH';

const URGENCY_OPTIONS: { value: UrgencyLevel; label: string }[] = [
  { value: 'LOW', label: 'Faible' },
  { value: 'MEDIUM', label: 'Moyenne' },
  { value: 'HIGH', label: 'Haute' },
];

/** Types d'attachment acceptés par l'API (valeurs exactes) */
const ATTACHMENT_TYPES = [
  'ID_CARD',
  'SITUATION_JUSTIFICATION',
  'PROOF_OF_INCOME_OR_INDIGENCY_ATTESTATION',
  'QUOTE_DETAILS',
  'CASE_PHOTO',
  'SIGNATURE',
  'OTHER',
] as const;

/** Mapping des clés documents → type d'attachment API */
const ATTACHMENT_TYPE_MAP: Record<string, (typeof ATTACHMENT_TYPES)[number]> = {
  identity: 'ID_CARD',
  situation: 'SITUATION_JUSTIFICATION',
  income: 'PROOF_OF_INCOME_OR_INDIGENCY_ATTESTATION',
  quote: 'QUOTE_DETAILS',
  income2: 'PROOF_OF_INCOME_OR_INDIGENCY_ATTESTATION',
};

/** Dérive prénom et nom depuis user.name (format "Nom Prénom" ou "Prénom Nom") */
function nameToFirstLast(name: string): { firstName: string; lastName: string } {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { lastName: parts[0], firstName: parts.slice(1).join(' ') };
}

export default function AskForHelpFormModal({ isOpen, onClose }: AskForHelpFormModalProps) {
  const { user: currentUser, accessToken } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEmitter, setSelectedEmitter] = useState<EmitterType>(null);

  // Transmitter (émetteur) — aligné API transmitterDetails
  const [transmitterFirstName, setTransmitterFirstName] = useState('');
  const [transmitterLastName, setTransmitterLastName] = useState('');
  const [transmitterCompanyName, setTransmitterCompanyName] = useState('');
  const [transmitterCodeId, setTransmitterCodeId] = useState('');

  // Bénéficiaire — aligné API beneficiaryDetails
  const [beneficiaryFirstName, setBeneficiaryFirstName] = useState('');
  const [beneficiaryLastName, setBeneficiaryLastName] = useState('');
  const [beneficiaryGender, setBeneficiaryGender] = useState<'male' | 'female' | null>(null);
  const [beneficiaryLocation, setBeneficiaryLocation] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [beneficiaryMaritalStatus, setBeneficiaryMaritalStatus] = useState('');
  const [beneficiaryIsMuslim, setBeneficiaryIsMuslim] = useState<boolean | null>(null);
  const [numberOfBeneficiaries, setNumberOfBeneficiaries] = useState('');
  const [beneficiaryActivity, setBeneficiaryActivity] = useState('');
  const [monthlyIncomeOfBeneficiary, setMonthlyIncomeOfBeneficiary] = useState('');
  const [beneficiaryShariahEligibility, setBeneficiaryShariahEligibility] = useState<ShariahEligibilityValue | ''>('');
  const [beneficiaryAcceptPicture, setBeneficiaryAcceptPicture] = useState<boolean | null>(null);
  const [beneficiaryAge, setBeneficiaryAge] = useState('');

  // Urgence (API)
  const [urgency, setUrgency] = useState<UrgencyLevel>('MEDIUM');

  // Campagnes actives (liste API) et sélection
  const [activeCampaigns, setActiveCampaigns] = useState<ApiCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<ApiCampaign | null>(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  // Section affichée selon la catégorie API (HEALTH, EDUCATION, HOUSING, UTILITIES ; autre = null)
  const campaignCategory = useMemo<CampaignCategory | null>(
    () => (selectedCampaign ? apiCategoryToSection(selectedCampaign.category) : null),
    [selectedCampaign]
  );

  // Health (affiché si campaignCategory === 'HEALTH')
  const [lifeThreateningEmergency, setLifeThreateningEmergency] = useState(false);
  const [patientHaveCmuCard, setPatientHaveCmuCard] = useState<boolean | null>(null);
  const [percentageOfCmuCard, setPercentageOfCmuCard] = useState('');
  const [quoteIsFromApprovedEstablishment, setQuoteIsFromApprovedEstablishment] = useState<boolean | null>(null);
  const [establishmentName, setEstablishmentName] = useState('');
  const [patientTotalityUnableToPay, setPatientTotalityUnableToPay] = useState<boolean | null>(null);
  const [whatPercentage, setWhatPercentage] = useState('');
  const [totalQuote, setTotalQuote] = useState('');

  // Education (affiché si campaignCategory === 'EDUCATION')
  const [typeOfNeed, setTypeOfNeed] = useState('');
  const [educationEstablishmentName, setEducationEstablishmentName] = useState('');
  const [isStudentRegistered, setIsStudentRegistered] = useState<boolean | null>(null);
  const [riskOfExclusion, setRiskOfExclusion] = useState<boolean | null>(null);
  const [outstandingAmount, setOutstandingAmount] = useState('');

  // Widow support (affiché si campaignCategory === 'WIDOW_SUPPORT')
  const [haveMinorChildren, setHaveMinorChildren] = useState<boolean | null>(null);
  const [numberOfMinorChildren, setNumberOfMinorChildren] = useState('');
  const [stableAccomodation, setStableAccomodation] = useState<boolean | null>(null);
  const [whereSheLives, setWhereSheLives] = useState('');
  const [kindOfSupport, setKindOfSupport] = useState('');
  const [isDessertIncluded, setIsDessertIncluded] = useState<boolean | null>(null);

  // Habitation (affiché si campaignCategory === 'HABITATION')
  const [kindOfInfrastructure, setKindOfInfrastructure] = useState('');
  const [kindOfInfrastructureOther, setKindOfInfrastructureOther] = useState('');
  const [isCommunityInfrastructure, setIsCommunityInfrastructure] = useState<boolean | null>(null);
  const [landHaveTitleDeedOrAuthorisation, setLandHaveTitleDeedOrAuthorisation] = useState<boolean | null>(null);
  const [isThereManagementCommitteeForFutureMaintenance, setIsThereManagementCommitteeForFutureMaintenance] = useState<boolean | null>(null);
  const [areThereAtLeastTwoConflictingQuotesFromServiceProviders, setAreThereAtLeastTwoConflictingQuotesFromServiceProviders] = useState<boolean | null>(null);
  const [whatIsTheQuote, setWhatIsTheQuote] = useState('');

  const [isCertified, setIsCertified] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSignatureApplied, setIsSignatureApplied] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const router = useRouter();

  // Attachments (type, url, label) — documents à fournir
  const [documents, setDocuments] = useState<{ [key: string]: File | null }>({
    identity: null,
    situation: null,
    income: null,
    quote: null,
    income2: null,
  });
  const [attachmentLabels, setAttachmentLabels] = useState<{ [key: string]: string }>({});
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const signatureContainerRef = useRef<HTMLDivElement>(null);

  // Empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Charger les campagnes actives à l'ouverture du modal
  useEffect(() => {
    if (isOpen) {
      getActiveCampaignsRaw().then(setActiveCampaigns).catch(() => setActiveCampaigns([]));
    }
  }, [isOpen]);

  // Masquer le toast d'erreur après 4 s
  useEffect(() => {
    if (!errorToast) return;
    const t = setTimeout(() => setErrorToast(null), 4000);
    return () => clearTimeout(t);
  }, [errorToast]);

  // Fermer le dropdown de catégorie quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    }

    if (isCategoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoryDropdownOpen]);

  // Réinitialiser le formulaire quand le modal se ferme
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setSelectedEmitter(null);
      setTransmitterFirstName('');
      setTransmitterLastName('');
      setTransmitterCompanyName('');
      setTransmitterCodeId('');
      setBeneficiaryFirstName('');
      setBeneficiaryLastName('');
      setBeneficiaryGender(null);
      setBeneficiaryLocation('');
      setIsGettingLocation(false);
      setLocationError(null);
      setBeneficiaryMaritalStatus('');
      setBeneficiaryIsMuslim(null);
      setNumberOfBeneficiaries('');
      setBeneficiaryActivity('');
      setMonthlyIncomeOfBeneficiary('');
      setBeneficiaryShariahEligibility('');
      setBeneficiaryAcceptPicture(null);
      setBeneficiaryAge('');
      setUrgency('MEDIUM');
      setSelectedCampaign(null);
      setIsCategoryDropdownOpen(false);
      setLifeThreateningEmergency(false);
      setPatientHaveCmuCard(null);
      setPercentageOfCmuCard('');
      setQuoteIsFromApprovedEstablishment(null);
      setEstablishmentName('');
      setPatientTotalityUnableToPay(null);
      setWhatPercentage('');
      setTotalQuote('');
      setTypeOfNeed('');
      setEducationEstablishmentName('');
      setIsStudentRegistered(null);
      setRiskOfExclusion(null);
      setOutstandingAmount('');
      setHaveMinorChildren(null);
      setNumberOfMinorChildren('');
      setStableAccomodation(null);
      setWhereSheLives('');
      setKindOfSupport('');
      setIsDessertIncluded(null);
      setKindOfInfrastructure('');
      setKindOfInfrastructureOther('');
      setIsCommunityInfrastructure(null);
      setLandHaveTitleDeedOrAuthorisation(null);
      setIsThereManagementCommitteeForFutureMaintenance(null);
      setAreThereAtLeastTwoConflictingQuotesFromServiceProviders(null);
      setWhatIsTheQuote('');
      setIsCertified(false);
      setSignature(null);
      setIsDrawing(false);
      setIsSignatureApplied(false);
      setShowSuccessModal(false);
      setIsSubmitting(false);
      setErrorToast(null);
      setDocuments({
        identity: null,
        situation: null,
        income: null,
        quote: null,
        income2: null,
      });
      setAttachmentLabels({});
    }
  }, [isOpen]);

  // Initialiser le canvas de signature
  useEffect(() => {
    if (currentStep === 5 && signatureCanvasRef.current && signatureContainerRef.current) {
      const canvas = signatureCanvasRef.current;
      const container = signatureContainerRef.current;
      
      // Définir la taille du canvas
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 256;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#48BB78';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [currentStep]);

  // Gestion du dessin de signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Sauvegarder la signature
    setSignature(canvas.toDataURL());
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
  };

  // Fonction pour récupérer la signature en image (base64)
  const getSignatureAsImage = (): string | null => {
    return signature; // Retourne la chaîne base64 de l'image
  };

  // Fonction pour récupérer la signature en Blob (pour upload)
  const getSignatureAsBlob = (): Blob | null => {
    if (!signature) return null;
    
    // Convertir base64 en Blob
    const byteString = atob(signature.split(',')[1]);
    const mimeString = signature.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: mimeString });
  };

  // Fonction pour télécharger la signature
  const downloadSignature = () => {
    if (!signature) return;
    
    const blob = getSignatureAsBlob();
    if (!blob) return;
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `signature-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Payload aligné sur l'API (clés et types exacts, dont typos côté API)
  const submitAidRequest = async () => {
    if (!accessToken) {
      throw new Error('Veuillez vous reconnecter pour envoyer une demande d\'aide.');
    }

    // Upload des pièces jointes vers S3 (dossier aid-requests) et récupération des URLs
    const documentEntries = Object.entries(documents).filter(([, file]) => file != null) as [string, File][];
    const uploadedUrls = await Promise.all(
      documentEntries.map(([, file]) => uploadFile(file, 'aid-requests'))
    );
    const attachments = documentEntries.map(([key], i) => ({
      type: ATTACHMENT_TYPE_MAP[key] ?? 'OTHER',
      url: uploadedUrls[i],
      label: attachmentLabels[key] ?? key,
    }));

    const formData = {
      transmitter: selectedEmitter ? TRANSMITTER_API[selectedEmitter] : undefined,
      campaignId: selectedCampaign?.id,
      campaignCategory: selectedCampaign ? selectedCampaign.category : undefined,
      urgency,
      transmitterDetails: {
        transmitterFirstName: transmitterFirstName || undefined,
        tansmitterLastName: transmitterLastName || undefined,
        transmitterCompanyName: transmitterCompanyName || undefined,
        transamitterCodeId: transmitterCodeId || undefined,
      },
      beneficiaryDetails: {
        beneficiaryFirstName,
        beneficiaryLastName,
        beneficiaryGender: beneficiaryGender ?? undefined,
        beneficiaryLocation,
        beneficiaryMarialStatus: beneficiaryMaritalStatus || undefined,
        beneficiaryIsMuslim: beneficiaryIsMuslim ?? undefined,
        numberOfBeneficiaries: numberOfBeneficiaries ? Number(numberOfBeneficiaries) : 0,
        beneficiaryActivity: beneficiaryActivity || undefined,
        monthlyIncomeOfBeneficiary: monthlyIncomeOfBeneficiary ? Number(monthlyIncomeOfBeneficiary) : 0,
        beneficiaryShariahEligibity: beneficiaryShariahEligibility || undefined,
        beneficiaryAcceptPicture: beneficiaryAcceptPicture ?? undefined,
      },
      ...(campaignCategory === 'HEALTH' && {
        healthDetails: {
          lifeThreateningEmergency,
          patientHaveCmuCard: patientHaveCmuCard ?? undefined,
          percentageOfCmuCard: patientHaveCmuCard === true && percentageOfCmuCard.trim() !== '',
          quoteIsFromApprovedEstablishment: quoteIsFromApprovedEstablishment ?? undefined,
          establishmentName: establishmentName || undefined,
          patientTotalityUnableToPay: patientTotalityUnableToPay ?? undefined,
          whatPercentage: whatPercentage ? Number(whatPercentage) : 0,
          totalQuote: totalQuote ? Number(totalQuote) : 0,
        },
      }),
      ...(campaignCategory === 'EDUCATION' && {
        educationDetails: {
          typeOfNeed: typeOfNeed || undefined,
          isStudentRegistered: isStudentRegistered ?? undefined,
          riskOfExclusion: riskOfExclusion ?? undefined,
          outstandingAmount: riskOfExclusion === true ? (outstandingAmount ? Number(outstandingAmount) : 0) : 0,
        },
      }),
      ...(campaignCategory === 'WIDOW_SUPPORT' && {
        widowSupportDetails: {
          haveMinorChildren: haveMinorChildren ?? undefined,
          numberOfMinorChildren: numberOfMinorChildren ? Number(numberOfMinorChildren) : 0,
          stableAccomodation: stableAccomodation ?? undefined,
          whereSheLives: whereSheLives || undefined,
          kindOfSupport: kindOfSupport || undefined,
          isDessertIncluded: isDessertIncluded ?? undefined,
        },
      }),
      ...(campaignCategory === 'HABITATION' && {
        habitationDetails: {
          kindOfInsfrastructure: kindOfInfrastructure || undefined,
          isCommunityInfrastructure: isCommunityInfrastructure ?? undefined,
          landHaveTitleDeedOrAuthorisation: landHaveTitleDeedOrAuthorisation != null ? String(landHaveTitleDeedOrAuthorisation) : undefined,
          isThereManagementCommitteeForFutureMaintenance: isThereManagementCommitteeForFutureMaintenance ?? undefined,
          areThereAtLeastTwoConflictingQuotesFromServiceProviders: areThereAtLeastTwoConflictingQuotesFromServiceProviders ?? undefined,
          whatIsTheQuote: whatIsTheQuote ? Number(whatIsTheQuote) : 0,
        },
      }),
      attachments,
    };

    return createAidRequest(accessToken, formData);
  };

  const handleNext = () => {
    if (currentStep === 1 && !selectedEmitter) return;
    if (currentStep === 1 && selectedEmitter === 'partner' && !transmitterCompanyName.trim()) return;
    if (currentStep === 1 && selectedEmitter === 'volunteer' && !transmitterCodeId.trim()) return;
    if (currentStep === 1 && (selectedEmitter === 'myself' || selectedEmitter === 'third-party') &&
        (!transmitterLastName.trim() || !transmitterFirstName.trim())) return;

    if (currentStep === 2) {
      if (!beneficiaryFirstName.trim() || !beneficiaryLastName.trim()) return;
      if (campaignCategory === 'HEALTH' && patientHaveCmuCard === true && !percentageOfCmuCard.trim()) return;
    }

    if (currentStep === 4 && !isCertified) return;
    if (currentStep === 5) return;

    if (currentStep < STEPS.length) setCurrentStep(currentStep + 1);
  };

  /** Récupère la position actuelle et remplit le lieu d'habitation (géolocalisation + géocodage inverse). */
  const handleGetCurrentPosition = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationError('La géolocalisation n\'est pas disponible sur ce navigateur.');
      return;
    }
    setLocationError(null);
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'fr' } }
          );
          const data = await res.json();
          const addr = data.address;
          const parts = [
            addr?.suburb ?? addr?.neighbourhood ?? addr?.quarter,
            addr?.village ?? addr?.town ?? addr?.city ?? addr?.municipality,
            addr?.state ?? addr?.county,
          ].filter(Boolean);
          const display = parts.length > 0 ? parts.join(', ') : data.display_name ?? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          setBeneficiaryLocation(display);
        } catch {
          setBeneficiaryLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        } finally {
          setIsGettingLocation(false);
        }
      },
      (err) => {
        setIsGettingLocation(false);
        if (err.code === 1) setLocationError('Autorisation refusée. Activez la localisation dans les paramètres.');
        else if (err.code === 2) setLocationError('Position indisponible.');
        else if (err.code === 3) setLocationError('Délai dépassé. Réessayez.');
        else setLocationError('Impossible de récupérer la position.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleQuit = () => {
    onClose();
  };

  // Fonction pour gérer le clic sur "Appliquer" (étape 5)
  const handleApplySignature = () => {
    if (!signature) {
      console.warn('⚠️ Signature manquante');
      return;
    }
    
    console.log('🖊️ Application de la signature...');
    
    // Télécharger la signature
    downloadSignature();
    console.log('📥 Signature téléchargée');
    
    // Désactiver le champ de signature
    setIsSignatureApplied(true);
    console.log('🔒 Champ de signature désactivé');
  };

  // Fonction pour gérer le clic sur "Terminer" (étape 5)
  const handleFinish = () => {
    if (!isSignatureApplied) {
      console.warn('⚠️ Veuillez d\'abord appliquer la signature');
      return;
    }
    setIsSubmitting(true);
    submitAidRequest()
      .then(() => {
        setShowSuccessModal(true);
      })
      .catch((error) => {
        console.error('Erreur lors de l\'envoi de la demande d\'aide:', error);
        setErrorToast(error instanceof Error ? error.message : 'Impossible d\'envoyer la demande. Réessayez plus tard.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  // Fonction pour aller à l'accueil
  const handleGoToHome = () => {
    setShowSuccessModal(false);
    onClose();
    router.push('/');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-2">
              Informations sur l'émetteur
            </h3>
            <p className="text-[#A0AEC0] mb-6">
              Veuillez choisir une option
            </p>
            
            <div className="space-y-3">
              {[
                { value: 'myself', label: 'Moi-même' },
                { value: 'third-party', label: 'Tierce personne (Proche, voisin...)' },
                { value: 'partner', label: 'Partenaire (ONG, Mosquée, Hôpital)' },
                { value: 'volunteer', label: 'Bénévole AMANE+ (Terrain Saisie)' },
              ].map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (option.value === 'myself' && currentUser?.name) {
                      const { firstName, lastName } = nameToFirstLast(currentUser.name);
                      setTransmitterFirstName(firstName);
                      setTransmitterLastName(lastName);
                    }
                    setSelectedEmitter(option.value as EmitterType);
                  }}
                  className={`w-full rounded-3xl p-4 text-left transition-all ${
                    selectedEmitter === option.value
                      ? 'bg-[#43B48F] text-white'
                      : 'bg-[#1E2726] text-white hover:bg-[#2A3534]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {selectedEmitter === option.value && (
                      <div className="w-2 h-2 bg-[#2F855A] rounded-full"></div>
                    )}
                    <span className="font-medium">{option.label}</span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Champs à remplir selon le type d'émetteur — puis on passe au step 2 */}
            {selectedEmitter === 'partner' && (
              <div className="mt-6 space-y-4">
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#48BB78] w-5 h-5 z-10" />
                  <input
                    type="text"
                    value={transmitterCompanyName}
                    onChange={(e) => setTransmitterCompanyName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#1E2726] border border-[#48BB78] rounded-2xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50 transition-all"
                    placeholder="Nom de l'organisation"
                  />
                </div>
              </div>
            )}

            {selectedEmitter === 'volunteer' && (
              <div className="mt-6 space-y-4">
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#48BB78] w-5 h-5 z-10" />
                  <input
                    type="text"
                    value={transmitterCodeId}
                    onChange={(e) => setTransmitterCodeId(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#1E2726] border border-[#48BB78] rounded-2xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50 transition-all"
                    placeholder="ID Code bénévole"
                  />
                </div>
              </div>
            )}

            {(selectedEmitter === 'myself' || selectedEmitter === 'third-party') && (
              <div className="mt-6 space-y-4 bg-[#00644d]/10 rounded-3xl p-4">
                <h4 className="text-lg font-semibold text-white">Identité de l'émetteur</h4>
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#48BB78] w-5 h-5 z-10" />
                    <input
                      type="text"
                      value={transmitterLastName}
                      onChange={(e) => setTransmitterLastName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-[#1E2726] border border-[#48BB78] rounded-3xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50 transition-all"
                      placeholder="Nom"
                    />
                  </div>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#48BB78] w-5 h-5 z-10" />
                    <input
                      type="text"
                      value={transmitterFirstName}
                      onChange={(e) => setTransmitterFirstName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-[#1E2726] border border-[#48BB78] rounded-3xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50 transition-all"
                      placeholder="Prénom"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-2">
              Identification du bénéficiaire
            </h3>
            <p className="text-[#A0AEC0] mb-6">
              Renseignez d'abord les informations du bénéficiaire, puis choisissez le type de campagne et les détails associés.
            </p>

            {/* ——— 1. Bénéficiaire — design mobile Figma (labels au-dessus, libellés exacts) ——— */}
            <div className="space-y-5 bg-[#00644d]/10 rounded-3xl p-4">
              <h4 className="text-lg font-semibold text-white">Informations bénéficiaire</h4>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Nom</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#48BB78] w-5 h-5 z-10" />
                  <input
                    type="text"
                    value={beneficiaryLastName}
                    onChange={(e) => setBeneficiaryLastName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#1E2726] border border-[#48BB78] rounded-2xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50"
                    placeholder="Nom"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Prénoms</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#48BB78] w-5 h-5 z-10" />
                  <input
                    type="text"
                    value={beneficiaryFirstName}
                    onChange={(e) => setBeneficiaryFirstName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#1E2726] border border-[#48BB78] rounded-2xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50"
                    placeholder="Prénoms"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Genre</label>
                <div className="flex gap-4">
                  {(['male', 'female'] as const).map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${beneficiaryGender === g ? 'bg-[#48BB78] border-[#48BB78]' : 'border-[#48BB78] bg-transparent'}`}>
                        {beneficiaryGender === g && <span className="w-2 h-2 rounded-full bg-[#101919]" />}
                      </span>
                      <input type="radio" name="beneficiaryGender" className="sr-only" checked={beneficiaryGender === g} onChange={() => setBeneficiaryGender(g)} />
                      <span className="text-white text-sm">{g === 'male' ? 'Homme' : 'Femme'}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Âge</label>
                <div className="relative">
                  <Infinity className="absolute left-4 top-1/2 -translate-y-1/2 text-[#48BB78] w-5 h-5 z-10" />
                  <input
                    type="number"
                    min={0}
                    value={beneficiaryAge}
                    onChange={(e) => setBeneficiaryAge(e.target.value)}
                    className="w-full pl-12 pr-14 py-4 bg-[#1E2726] border border-[#48BB78] rounded-2xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50"
                    placeholder="0"
                    aria-label="Âge du bénéficiaire en années"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0AEC0] text-sm">ans</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Lieu d&apos;habitation</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#48BB78] w-5 h-5 z-10" />
                  <input
                    type="text"
                    value={beneficiaryLocation}
                    onChange={(e) => setBeneficiaryLocation(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#1E2726] border border-[#48BB78] rounded-2xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50"
                    placeholder="Ville, commune, quartier"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleGetCurrentPosition}
                  disabled={isGettingLocation}
                  className="w-full mt-2 py-3 px-4 bg-[#1E2726] border border-[#48BB78] rounded-2xl text-[#48BB78] text-sm font-medium hover:bg-[#2A3534] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGettingLocation ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-[#48BB78] border-t-transparent rounded-full animate-spin" />
                      Récupération en cours...
                    </>
                  ) : (
                    'Choisir ma position actuelle'
                  )}
                </button>
                {locationError && (
                  <p className="mt-2 text-sm text-red-400" role="alert">
                    {locationError}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Situation matrimoniale</label>
                <input
                  type="text"
                  value={beneficiaryMaritalStatus}
                  onChange={(e) => setBeneficiaryMaritalStatus(e.target.value)}
                  className="w-full pl-4 py-4 bg-[#1E2726] border border-[#48BB78] rounded-2xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50"
                  placeholder="Célibataire, Marié(e), Veuf(ve)..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Musulman</label>
                <div className="flex gap-4">
                  {([true, false] as const).map((v) => (
                    <motion.button key={String(v)} type="button" whileTap={{ scale: 0.98 }} onClick={() => setBeneficiaryIsMuslim(v)} className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${beneficiaryIsMuslim === v ? 'bg-[#48BB78] border-[#48BB78]' : 'border-[#48BB78] bg-transparent'}`}>
                        {beneficiaryIsMuslim === v && <span className="w-2 h-2 rounded-full bg-[#101919]" />}
                      </span>
                      <span className="text-white text-sm">{v ? 'Oui' : 'Non'}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Nombre de personnes à charge</label>
                <div className="relative flex items-center">
                  <Users className="absolute left-4 text-[#48BB78] w-5 h-5 z-10" />
                  <input
                    type="number"
                    min={0}
                    value={numberOfBeneficiaries}
                    onChange={(e) => setNumberOfBeneficiaries(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#1E2726] border border-[#48BB78] rounded-2xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Votre activité/fonction</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-[#48BB78] w-5 h-5 z-10" />
                  <input
                    type="text"
                    value={beneficiaryActivity}
                    onChange={(e) => setBeneficiaryActivity(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#1E2726] border border-[#48BB78] rounded-2xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50"
                    placeholder="Ex: Commerçant, Enseignant..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Revenu mensuel</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[#48BB78] w-5 h-5 z-10" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={monthlyIncomeOfBeneficiary}
                    onChange={(e) => setMonthlyIncomeOfBeneficiary(e.target.value)}
                    className="w-full pl-12 pr-16 py-4 bg-[#1E2726] border border-[#48BB78] rounded-2xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50"
                    placeholder="0"
                    aria-label="Revenu mensuel en F CFA"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0AEC0] text-sm">F CFA</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Éligibilité Charia (Catégories Asnaf)</label>
                <div className="flex flex-col gap-2">
                  {SHARIAH_ELIGIBILITY_OPTIONS.map((opt) => (
                    <motion.button key={opt.value} type="button" whileTap={{ scale: 0.98 }} onClick={() => setBeneficiaryShariahEligibility(opt.value)} className="flex items-center gap-3 text-left w-full">
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${beneficiaryShariahEligibility === opt.value ? 'bg-[#48BB78] border-[#48BB78]' : 'border-[#48BB78] bg-transparent'}`}>
                        {beneficiaryShariahEligibility === opt.value && <span className="w-2 h-2 rounded-full bg-[#101919]" />}
                      </span>
                      <span className="text-white text-sm">{opt.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Pour la transparence le demandeur accepterait-il la prise de photo.</label>
                <div className="flex gap-4">
                  {([true, false] as const).map((v) => (
                    <motion.button key={String(v)} type="button" whileTap={{ scale: 0.98 }} onClick={() => setBeneficiaryAcceptPicture(v)} className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${beneficiaryAcceptPicture === v ? 'bg-[#48BB78] border-[#48BB78]' : 'border-[#48BB78] bg-transparent'}`}>
                        {beneficiaryAcceptPicture === v && <span className="w-2 h-2 rounded-full bg-[#101919]" />}
                      </span>
                      <span className="text-white text-sm">{v ? 'Oui' : 'Non'}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* ——— 2. Sélection de la campagne (liste getActiveCampaigns) ——— */}
            <div className="space-y-4 mt-8">
              <p className="text-[#A0AEC0] text-sm">Sélection de la campagne</p>
              <div className="relative" ref={categoryDropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="w-full pl-12 pr-12 py-4 bg-[#1E2726] border border-[#48BB78] rounded-3xl text-white flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    {campaignCategory === 'HEALTH' && <Heart className="w-5 h-5 text-[#48BB78]" />}
                    {campaignCategory === 'EDUCATION' && <GraduationCap className="w-5 h-5 text-[#48BB78]" />}
                    {campaignCategory === 'WIDOW_SUPPORT' && <Users className="w-5 h-5 text-[#48BB78]" />}
                    {campaignCategory === 'HABITATION' && <Building2 className="w-5 h-5 text-[#48BB78]" />}
                    {!campaignCategory && selectedCampaign && <Building className="w-5 h-5 text-[#48BB78]" />}
                    <span>
                      {selectedCampaign
                        ? (campaignCategory ? SECTION_LABELS[campaignCategory] : selectedCampaign.title)
                        : 'Choisir une campagne'}
                    </span>
                  </div>
                  <motion.div animate={{ rotate: isCategoryDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-5 h-5 text-[#48BB78]" />
                  </motion.div>
                </motion.button>
                <AnimatePresence>
                  {isCategoryDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-20 w-full mt-2 bg-[#1E2726] border border-[#101919] rounded-3xl overflow-hidden max-h-60 overflow-y-auto"
                    >
                      {activeCampaigns.length === 0 ? (
                        <div className="px-4 py-3 text-[#A0AEC0] text-sm">Aucune campagne active</div>
                      ) : (
                        activeCampaigns.map((campaign) => {
                          const section = apiCategoryToSection(campaign.category);
                          return (
                            <button
                              key={campaign.id}
                              type="button"
                              onClick={() => {
                                setSelectedCampaign(campaign);
                                setIsCategoryDropdownOpen(false);
                              }}
                              className="w-full px-4 py-3 text-left text-white hover:bg-[#2A3534] transition-colors flex items-center gap-3"
                            >
                              {section === 'HEALTH' && <Heart className="w-5 h-5 text-[#48BB78]" />}
                              {section === 'EDUCATION' && <GraduationCap className="w-5 h-5 text-[#48BB78]" />}
                              {section === 'WIDOW_SUPPORT' && <Users className="w-5 h-5 text-[#48BB78]" />}
                              {section === 'HABITATION' && <Building2 className="w-5 h-5 text-[#48BB78]" />}
                              {!section && <Building className="w-5 h-5 text-[#48BB78]" />}
                              <span>{campaign.title}</span>
                            </button>
                          );
                        })
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Urgence (API) */}
            <div className="space-y-4 mt-6">
              <h4 className="text-lg font-semibold text-white">Urgence</h4>
              <div className="flex flex-wrap gap-3">
                {URGENCY_OPTIONS.map((opt) => (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setUrgency(opt.value)}
                    className={`rounded-3xl px-4 py-2 transition-all ${
                      urgency === opt.value ? 'bg-[#43B48F] text-white' : 'bg-[#1E2726] text-white hover:bg-[#2A3534]'
                    }`}
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ——— Champs selon le type de campagne ——— */}
            {campaignCategory === 'HEALTH' && (
              <div className="space-y-6 mt-8 bg-[#00644d]/10 rounded-3xl p-4">
                <h4 className="text-lg font-semibold text-white">Détails santé</h4>
                <label className="flex items-center gap-3 cursor-pointer">
                  <span className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${lifeThreateningEmergency ? 'bg-[#48BB78] border-[#48BB78]' : 'border-[#48BB78] bg-transparent'}`}>
                    {lifeThreateningEmergency && <CheckCircle className="w-3.5 h-3.5 text-[#101919]" />}
                  </span>
                  <input type="checkbox" className="sr-only" checked={lifeThreateningEmergency} onChange={(e) => setLifeThreateningEmergency(e.target.checked)} />
                  <span className="text-white text-sm">S&apos;agit-il d&apos;une urgence vitale (pronostic engagé sous 24h-48h) ?</span>
                </label>
                <div className="flex gap-3 flex-wrap">
                  <span className="text-white text-sm font-medium w-full">Patient a une carte CMU ? (patientHaveCmuCard)</span>
                  {([true, false] as const).map((v) => (
                    <motion.button
                      key={String(v)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPatientHaveCmuCard(v)}
                      className={`rounded-3xl px-4 py-2 ${patientHaveCmuCard === v ? 'bg-[#43B48F] text-white' : 'bg-[#1E2726] text-white hover:bg-[#2A3534]'}`}
                    >
                      {v ? 'Oui' : 'Non'}
                    </motion.button>
                  ))}
                </div>
                {patientHaveCmuCard === true && (
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={percentageOfCmuCard}
                      onChange={(e) => setPercentageOfCmuCard(e.target.value)}
                      className="w-full pl-4 pr-10 py-4 bg-[#1E2726] border border-[#48BB78] rounded-2xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50"
                      placeholder="%"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0AEC0]">%</span>
                  </div>
                )}
                <div className="flex gap-3 flex-wrap">
                  <span className="text-white text-sm font-medium w-full">Devis d’un établissement agréé ? (quoteIsFromApprovedEstablishment)</span>
                  {([true, false] as const).map((v) => (
                    <motion.button
                      key={String(v)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setQuoteIsFromApprovedEstablishment(v)}
                      className={`rounded-3xl px-4 py-2 ${quoteIsFromApprovedEstablishment === v ? 'bg-[#43B48F] text-white' : 'bg-[#1E2726] text-white hover:bg-[#2A3534]'}`}
                    >
                      {v ? 'Oui' : 'Non'}
                    </motion.button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={establishmentName}
                    onChange={(e) => setEstablishmentName(e.target.value)}
                    className="w-full pl-4 py-4 bg-[#1E2726] border border-[#48BB78] rounded-2xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50"
                    placeholder="Nom de l'établissement"
                  />
                </div>
                <div className="flex gap-3 flex-wrap">
                  <span className="text-white text-sm font-medium w-full">Patient totalement dans l’incapacité de payer ? (patientTotalityUnableToPay)</span>
                  {([true, false] as const).map((v) => (
                    <motion.button
                      key={String(v)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPatientTotalityUnableToPay(v)}
                      className={`rounded-3xl px-4 py-2 ${patientTotalityUnableToPay === v ? 'bg-[#43B48F] text-white' : 'bg-[#1E2726] text-white hover:bg-[#2A3534]'}`}
                    >
                      {v ? 'Oui' : 'Non'}
                    </motion.button>
                  ))}
                </div>
                {patientTotalityUnableToPay === false && (
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={whatPercentage}
                      onChange={(e) => setWhatPercentage(e.target.value)}
                      className="w-full pl-4 pr-10 py-4 bg-[#1E2726] border border-[#48BB78] rounded-2xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50"
                      placeholder="%"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0AEC0]">%</span>
                  </div>
                )}
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={totalQuote}
                    onChange={(e) => setTotalQuote(e.target.value)}
                    className="w-full pl-4 py-4 bg-[#1E2726] border border-[#48BB78] rounded-2xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50"
                    placeholder="Montant (F CFA)"
                  />
                </div>
              </div>
            )}

            {campaignCategory === 'EDUCATION' && (
              <div className="space-y-6 mt-8 bg-[#00644d]/10 rounded-3xl p-4">
                <h4 className="text-lg font-semibold text-white">Éducation / Scolarisation</h4>
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium block">Type de besoin</label>
                  <div className="flex flex-col gap-2">
                    {EDUCATION_TYPE_NEED_OPTIONS.map((opt) => (
                      <motion.button key={opt.value} type="button" whileTap={{ scale: 0.98 }} onClick={() => setTypeOfNeed(opt.value)} className="flex items-center gap-2 text-left">
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${typeOfNeed === opt.value ? 'bg-[#48BB78] border-[#48BB78]' : 'border-[#48BB78] bg-transparent'}`}>
                          {typeOfNeed === opt.value && <span className="w-2 h-2 rounded-full bg-[#101919]" />}
                        </span>
                        <span className="text-white text-sm">{opt.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium block">L&apos;élève/étudiant est-il déjà inscrit dans un établissement ?</label>
                  {([true, false] as const).map((v) => (
                    <motion.button
                      key={String(v)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsStudentRegistered(v)}
                      className={`rounded-3xl px-4 py-2 ${isStudentRegistered === v ? 'bg-[#43B48F] text-white' : 'bg-[#1E2726] text-white hover:bg-[#2A3534]'}`}
                    >
                      {v ? 'Oui' : 'Non'}
                    </motion.button>
                  ))}
                </div>
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium block">S&apos;agit-il d&apos;un risque d&apos;exclusion pour les impayés ?</label>
                  <div className="flex gap-4">
                    {([true, false] as const).map((v) => (
                      <motion.button key={String(v)} type="button" whileTap={{ scale: 0.98 }} onClick={() => {
                        setRiskOfExclusion(v);
                        if (!v) setOutstandingAmount('');
                      }} className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${riskOfExclusion === v ? 'bg-[#48BB78] border-[#48BB78]' : 'border-[#48BB78] bg-transparent'}`}>
                          {riskOfExclusion === v && <span className="w-2 h-2 rounded-full bg-[#101919]" />}
                        </span>
                        <span className="text-white text-sm">{v ? 'Oui' : 'Non'}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
                {riskOfExclusion === true && (
                  <div className="space-y-2">
                    <label className="text-white text-sm font-medium block">À combien s&apos;élève les impayés ?</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={outstandingAmount}
                      onChange={(e) => setOutstandingAmount(e.target.value)}
                      className="w-full pl-4 py-4 bg-[#1E2726] border border-[#48BB78] rounded-2xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50"
                      placeholder="Montant (F CFA)"
                    />
                  </div>
                )}
              </div>
            )}

            {campaignCategory === 'WIDOW_SUPPORT' && (
              <div className="space-y-6 mt-8 bg-[#00644d]/10 rounded-3xl p-4">
                <h4 className="text-lg font-semibold text-white">Accompagnement des Veuves</h4>
                <div className="flex gap-3 flex-wrap">
                  <span className="text-white text-sm font-medium w-full">A des enfants mineurs ? (haveMinorChildren)</span>
                  {([true, false] as const).map((v) => (
                    <motion.button
                      key={String(v)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setHaveMinorChildren(v)}
                      className={`rounded-3xl px-4 py-2 ${haveMinorChildren === v ? 'bg-[#43B48F] text-white' : 'bg-[#1E2726] text-white hover:bg-[#2A3534]'}`}
                    >
                      {v ? 'Oui' : 'Non'}
                    </motion.button>
                  ))}
                </div>
                {haveMinorChildren === true && (
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={numberOfMinorChildren}
                      onChange={(e) => setNumberOfMinorChildren(e.target.value)}
                      className="w-full pl-4 py-4 bg-[#1E2726] border border-[#48BB78] rounded-2xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50"
                      placeholder="Nombre d’enfants mineurs (numberOfMinorChildren)"
                    />
                  </div>
                )}
                <div className="flex gap-3 flex-wrap">
                  <span className="text-white text-sm font-medium w-full">Hébergement stable ? (stableAccomodation)</span>
                  {([true, false] as const).map((v) => (
                    <motion.button
                      key={String(v)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStableAccomodation(v)}
                      className={`rounded-3xl px-4 py-2 ${stableAccomodation === v ? 'bg-[#43B48F] text-white' : 'bg-[#1E2726] text-white hover:bg-[#2A3534]'}`}
                    >
                      {v ? 'Oui' : 'Non'}
                    </motion.button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={whereSheLives}
                    onChange={(e) => setWhereSheLives(e.target.value)}
                    className="w-full pl-4 py-4 bg-[#1E2726] border border-[#48BB78] rounded-2xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50"
                    placeholder="Où vit-elle (whereSheLives)"
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={kindOfSupport}
                    onChange={(e) => setKindOfSupport(e.target.value)}
                    className="w-full pl-4 py-4 bg-[#1E2726] border border-[#48BB78] rounded-2xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50"
                    placeholder="Type de soutien (kindOfSupport)"
                  />
                </div>
                <div className="flex gap-3 flex-wrap">
                  <span className="text-white text-sm font-medium w-full">Désert inclus ? (isDessertIncluded)</span>
                  {([true, false] as const).map((v) => (
                    <motion.button
                      key={String(v)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsDessertIncluded(v)}
                      className={`rounded-3xl px-4 py-2 ${isDessertIncluded === v ? 'bg-[#43B48F] text-white' : 'bg-[#1E2726] text-white hover:bg-[#2A3534]'}`}
                    >
                      {v ? 'Oui' : 'Non'}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {campaignCategory === 'HABITATION' && (
              <div className="space-y-6 mt-8 bg-[#00644d]/10 rounded-3xl p-4">
                <h4 className="text-lg font-semibold text-white">Réhabilitation / Infrastructures</h4>
                <div className="relative">
                  <input
                    type="text"
                    value={kindOfInfrastructure}
                    onChange={(e) => setKindOfInfrastructure(e.target.value)}
                    className="w-full pl-4 py-4 bg-[#1E2726] border border-[#48BB78] rounded-2xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50"
                    placeholder="Type d’infrastructure (kindOfInfrastructure)"
                  />
                </div>
                <div className="flex gap-3 flex-wrap">
                  <span className="text-white text-sm font-medium w-full">Infrastructure communautaire ? (isCommunityInfrastructure)</span>
                  {([true, false] as const).map((v) => (
                    <motion.button
                      key={String(v)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsCommunityInfrastructure(v)}
                      className={`rounded-3xl px-4 py-2 ${isCommunityInfrastructure === v ? 'bg-[#43B48F] text-white' : 'bg-[#1E2726] text-white hover:bg-[#2A3534]'}`}
                    >
                      {v ? 'Oui' : 'Non'}
                    </motion.button>
                  ))}
                </div>
                <div className="flex gap-3 flex-wrap">
                  <span className="text-white text-sm font-medium w-full">Terrain avec titre de propriété ou autorisation ? (landHaveTitleDeedOrAuthorisation)</span>
                  {([true, false] as const).map((v) => (
                    <motion.button
                      key={String(v)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setLandHaveTitleDeedOrAuthorisation(v)}
                      className={`rounded-3xl px-4 py-2 ${landHaveTitleDeedOrAuthorisation === v ? 'bg-[#43B48F] text-white' : 'bg-[#1E2726] text-white hover:bg-[#2A3534]'}`}
                    >
                      {v ? 'Oui' : 'Non'}
                    </motion.button>
                  ))}
                </div>
                <div className="flex gap-3 flex-wrap">
                  <span className="text-white text-sm font-medium w-full">Comité de gestion pour maintenance future ? (isThereManagementCommitteeForFutureMaintenance)</span>
                  {([true, false] as const).map((v) => (
                    <motion.button
                      key={String(v)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsThereManagementCommitteeForFutureMaintenance(v)}
                      className={`rounded-3xl px-4 py-2 ${isThereManagementCommitteeForFutureMaintenance === v ? 'bg-[#43B48F] text-white' : 'bg-[#1E2726] text-white hover:bg-[#2A3534]'}`}
                    >
                      {v ? 'Oui' : 'Non'}
                    </motion.button>
                  ))}
                </div>
                <div className="flex gap-3 flex-wrap">
                  <span className="text-white text-sm font-medium w-full">Au moins 2 devis de prestataires ? (areThereAtLeastTwoConflictingQuotesFromServiceProviders)</span>
                  {([true, false] as const).map((v) => (
                    <motion.button
                      key={String(v)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setAreThereAtLeastTwoConflictingQuotesFromServiceProviders(v)}
                      className={`rounded-3xl px-4 py-2 ${areThereAtLeastTwoConflictingQuotesFromServiceProviders === v ? 'bg-[#43B48F] text-white' : 'bg-[#1E2726] text-white hover:bg-[#2A3534]'}`}
                    >
                      {v ? 'Oui' : 'Non'}
                    </motion.button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={whatIsTheQuote}
                    onChange={(e) => setWhatIsTheQuote(e.target.value)}
                    className="w-full pl-4 py-4 bg-[#1E2726] border border-[#48BB78] rounded-2xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50"
                    placeholder="Montant du devis (whatIsTheQuote)"
                  />
                </div>
              </div>
            )}
          </div>
        );
      
      case 3:
        const documentTypes = [
          {
            key: 'identity',
            label: 'Copie de la Pièce d\'Identité (CNI / Passeport)',
          },
          {
            key: 'situation',
            label: 'Justificatif de situation (Certificat médical / Scolarité / Acte de décès)',
          },
          {
            key: 'income',
            label: 'Preuve de revenus ou Attestation d\'indigence',
          },
          {
            key: 'quote',
            label: 'Devis détaillé (Santé / Scolarité / Travaux)',
          },
          {
            key: 'income2',
            label: 'Preuve de revenus ou Attestation d\'indigence',
          },
        ];

        const handleFileSelect = (key: string, file: File | null) => {
          setDocuments(prev => ({ ...prev, [key]: file }));
        };

        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-2">
              Documents à fournir
            </h3>
            <p className="text-[#A0AEC0] mb-6">
              Téléchargez les documents nécessaires
            </p>
            
            <div className="space-y-3">
              {documentTypes.map((docType) => (
                <div
                  key={docType.key}
                  className="bg-[#00644d]/10 rounded-3xl p-4 flex items-center gap-4"
                >
                  {/* Icône de document */}
                  <div className="flex-shrink-0">
                    <FileText className="w-6 h-6 text-[#48BB78]" />
                  </div>
                  
                  {/* Nom du document */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm leading-relaxed">
                      {docType.label}
                    </p>
                    {documents[docType.key] && (
                      <p className="text-[#48BB78] text-xs mt-1 truncate">
                        {documents[docType.key]?.name}
                      </p>
                    )}
                  </div>
                  
                  {/* Boutons Importer et Supprimer */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {documents[docType.key] ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileSelect(docType.key, null);
                          // Réinitialiser l'input file
                          const fileInput = fileInputRefs.current[docType.key];
                          if (fileInput) {
                            fileInput.value = '';
                          }
                        }}
                        className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        aria-label="Supprimer le fichier"
                      >
                        <X className="w-4 h-4 text-white" />
                      </motion.button>
                    ) : (
                      <>
                        <input
                          ref={(el) => {
                            fileInputRefs.current[docType.key] = el;
                          }}
                          type="file"
                          id={`file-${docType.key}`}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleFileSelect(docType.key, file);
                          }}
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          aria-label={`Importer ${docType.label}`}
                          title={`Importer ${docType.label}`}
                        />
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            const fileInput = fileInputRefs.current[docType.key];
                            if (fileInput) {
                              fileInput.click();
                            }
                          }}
                          className="px-4 py-2 rounded-2xl flex items-center gap-2 transition-all bg-[#5AB678]/10 text-white"
                        >
                          <span className="text-sm font-medium">Importer</span>
                          <Paperclip className="w-4 h-4" />
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-2">
              Engagement du demandeur
            </h3>
            <p className="text-[#A0AEC0] mb-6">
              Enagez-vous de l'exactitude des informations fournies.
            </p>
            
            {/* Section Engagement du demandeur */}
            <div className="bg-[#00644d]/10 rounded-3xl p-6 space-y-6">
              {/* En-tête avec icône */}
              <div className="flex items-start gap-4">
                {/* Icône de poignée de main avec document */}
                <div className="relative flex-shrink-0 bg-[#48BB78] rounded-4xl p-2 w-16 h-16">
                  <div className="relative">
                    <Image src="/images/accord-2 1.png" alt="Engagement" width={100} height={100} />
                  </div>
                </div>
                
                {/* Titre */}
                <h4 className="text-2xl font-bold text-white flex-1 pt-2">
                  Engagement du demandeur
                </h4>
              </div>
              
              {/* Texte de certification */}
              <p className="text-white text-base leading-relaxed">
                Je certifie sur l'honneur l'exactitude des informations fournies. Je comprends que toute fausse déclaration entraîne le rejet immédiat de la demande.
              </p>
              
              {/* Bouton de certification */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsCertified(!isCertified)}
                className={`w-full py-4 px-6 rounded-3xl flex items-center justify-center gap-3 transition-all ${
                  isCertified
                    ? 'bg-gradient-to-r from-[#48BB78] to-[#38B2AC] text-white'
                    : 'bg-gradient-to-r from-[#48BB78]/50 to-[#38B2AC]/50 text-white/70'
                }`}
              >
                <span className="text-lg font-bold">Je certifie</span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isCertified
                    ? 'bg-white border-white'
                    : 'bg-transparent border-white'
                }`}>
                  {isCertified && (
                    <CheckCircle className="w-4 h-4 text-[#48BB78]" />
                  )}
                </div>
              </motion.button>
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6">
            {/* En-tête avec icône */}
            <div className="flex items-start gap-4">
              {/* Icône */}
              <div className="relative flex-shrink-0 bg-[#48BB78] rounded-4xl p-2 w-16 h-16 flex items-center justify-center">
                <Image src="/images/accord-2 1.png" alt="Signature" width={48} height={48} className="object-contain" />
              </div>
              
              {/* Titre et texte */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Signature
                </h3>
                <p className="text-[#A0AEC0] text-base leading-relaxed">
                  Veuillez signer avec le doigt dans la case ci-dessous pour confirmer votre engagement.
                </p>
              </div>
            </div>
            
            {/* Zone de signature */}
            <div className="relative">
              <div
                ref={signatureContainerRef}
                className="w-full h-64 bg-[#101919] border-1 border-[#48BB78] rounded-3xl relative overflow-hidden"
              >
                <canvas
                  ref={signatureCanvasRef}
                  className={`absolute inset-0 w-full h-full ${
                    isSignatureApplied 
                      ? 'cursor-not-allowed opacity-50 pointer-events-none' 
                      : 'cursor-crosshair pointer-events-auto'
                  }`}
                  onMouseDown={isSignatureApplied ? undefined : startDrawing}
                  onMouseMove={isSignatureApplied ? undefined : draw}
                  onMouseUp={isSignatureApplied ? undefined : stopDrawing}
                  onMouseLeave={isSignatureApplied ? undefined : stopDrawing}
                  onTouchStart={isSignatureApplied ? undefined : (e) => {
                    e.preventDefault();
                    startDrawing(e);
                  }}
                  onTouchMove={isSignatureApplied ? undefined : (e) => {
                    e.preventDefault();
                    draw(e);
                  }}
                  onTouchEnd={isSignatureApplied ? undefined : (e) => {
                    e.preventDefault();
                    stopDrawing();
                  }}
                />
                
                {!signature && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="flex items-center gap-2 text-[#A0AEC0] mb-2">
                      <FileText className="w-6 h-6" />
                      <Pen className="w-5 h-5" />
                    </div>
                    <p className="text-[#A0AEC0] text-sm italic">
                      Veuillez dessiner votre signature ici
                    </p>
                  </div>
                )}
              </div>
              
              {/* Bouton pour effacer la signature */}
              {signature && !isSignatureApplied && (
                <button
                  onClick={clearSignature}
                  className="mt-3 text-[#48BB78] text-sm hover:text-[#38A169] transition-colors"
                >
                  Effacer
                </button>
              )}
              
              {/* Message de confirmation après application */}
              {isSignatureApplied && (
                <p className="mt-3 text-[#48BB78] text-sm font-medium">
                  ✓ Signature appliquée et téléchargée
                </p>
              )}
            </div>
            
            {/* Bouton Appliquer */}
            {!isSignatureApplied && (
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleApplySignature}
                  disabled={!signature}
                  className="w-fit py-4 px-6 bg-gradient-to-r from-[#48BB78] to-[#38B2AC] text-white font-bold rounded-3xl flex items-center justify-center gap-2 hover:from-[#38A169] hover:to-[#319795] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-lg">Appliquer</span>
                  <CheckCircle className="w-5 h-5" />
                </motion.button>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative bg-[#101919] rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Bouton de fermeture */}
              <button
                onClick={onClose}
                aria-label="Fermer la modale"
                className="absolute top-4 right-4 w-10 h-10 bg-[#2F855A] rounded-full flex items-center justify-center hover:bg-[#276749] transition-colors z-10"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Toast d'erreur (rouge) */}
              <AnimatePresence>
                {errorToast && (
                  <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-5 py-3 rounded-xl text-white text-sm font-medium shadow-lg bg-red-600 border border-red-500 max-w-[90%] text-center"
                  >
                    {errorToast}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Contenu principal */}
              <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* Stepper - Panneau de gauche */}
                <div className="hidden md:flex w-64 bg-[#0A1515] p-8 border-r border-white/10 flex-shrink-0 overflow-y-auto">
                  <div className="space-y-6">
                    {STEPS.map((step, index) => {
                      const isActive = currentStep === step.id;
                      const isCompleted = currentStep > step.id;
                      const isLast = index === STEPS.length - 1;

                      return (
                        <div key={step.id} className="flex items-start">
                          {/* Cercle de l'étape et ligne */}
                          <div className="flex flex-col items-center mr-4">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                                isActive
                                  ? 'bg-[#48BB78] text-[#101919]'
                                  : isCompleted
                                  ? 'bg-[#48BB78]/30 text-[#48BB78] border-2 border-[#48BB78]'
                                  : 'bg-transparent text-white/60 border-2 border-[#48BB78]'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-[#48BB78]" />
                              ) : (
                                step.id
                              )}
                            </div>
                            {!isLast && (
                              <div className="mt-2 h-12 flex items-center justify-center">
                                {isCompleted || isActive ? (
                                  <div className="w-0.5 h-full bg-[#48BB78]" />
                                ) : (
                                  <div className="w-0.5 h-full border-l-2 border-dashed border-[#48BB78]/50" />
                                )}
                              </div>
                            )}
                          </div>

                          {/* Label de l'étape */}
                          <div className="flex-1 pt-1">
                            <span
                              className={`text-sm font-medium ${
                                isActive
                                  ? 'text-white'
                                  : isCompleted
                                  ? 'text-white/80'
                                  : 'text-white/60'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Contenu de l'étape - Panneau de droite */}
                <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                  <div className="p-8 flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Demande d'aide
                    </h2>
                    
                    <div className="mt-6">
                      {renderStepContent()}
                    </div>
                  </div>

                  {/* Boutons d'action en bas */}
                  <div className="p-6 border-t border-white/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleQuit}
                        className="px-6 py-3 bg-[#1E2726] text-white font-medium rounded-3xl hover:bg-[#2A3534] transition-colors"
                      >
                        Quitter
                      </motion.button>
                      {currentStep > 1 && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleBack}
                          className="px-6 py-3 bg-[#1E2726] text-white font-medium rounded-3xl hover:bg-[#2A3534] transition-colors"
                        >
                          Précédent
                        </motion.button>
                      )}
                    </div>

                    {currentStep < STEPS.length && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNext}
                        disabled={
                          (currentStep === 1 && !selectedEmitter) ||
                          (currentStep === 1 && selectedEmitter === 'partner' && !transmitterCompanyName.trim()) ||
                          (currentStep === 1 && selectedEmitter === 'volunteer' && !transmitterCodeId.trim()) ||
                          (currentStep === 1 && (selectedEmitter === 'myself' || selectedEmitter === 'third-party') && (!transmitterLastName.trim() || !transmitterFirstName.trim())) ||
                          (currentStep === 2 && (!beneficiaryFirstName.trim() || !beneficiaryLastName.trim())) ||
                          (currentStep === 2 && campaignCategory === 'HEALTH' && patientHaveCmuCard === true && !percentageOfCmuCard.trim()) ||
                          (currentStep === 4 && !isCertified) ||
                          (currentStep === 5 && !signature)
                        }
                        className="px-6 py-3 bg-gradient-to-r from-[#48BB78] to-[#38B2AC] text-white font-bold rounded-3xl flex items-center gap-2 hover:from-[#38A169] hover:to-[#319795] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>Suivant</span>
                        <ArrowRight className="w-5 h-5" />
                      </motion.button>
                    )}

                    {/* Bouton Terminer pour l'étape 5 après application de la signature */}
                    {currentStep === 5 && isSignatureApplied && (
                      <motion.button
                        whileHover={!isSubmitting ? { scale: 1.02 } : undefined}
                        whileTap={!isSubmitting ? { scale: 0.98 } : undefined}
                        onClick={handleFinish}
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-gradient-to-r from-[#48BB78] to-[#38B2AC] text-white font-bold rounded-3xl flex items-center justify-center gap-2 hover:from-[#38A169] hover:to-[#319795] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                            <span>Envoi en cours...</span>
                          </>
                        ) : (
                          <>
                            <span>Terminer</span>
                            <CheckCircle className="w-5 h-5" />
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de succès */}
      <AnimatePresence>
      {showSuccessModal && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSuccessModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Modal de succès */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative bg-[#101919] rounded-2xl max-w-md w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Bouton de fermeture */}
              <button
                onClick={() => setShowSuccessModal(false)}
                aria-label="Fermer la modale"
                className="absolute top-4 right-4 w-10 h-10 bg-[#48BB78] rounded-full flex items-center justify-center hover:bg-[#38A169] transition-colors z-10"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Contenu */}
              <div className="flex flex-col items-center text-center space-y-6 pt-4">
                {/* Icône de succès */}
                <div className="relative">
                  {/* Cercle extérieur vert foncé */}
                  <div className="w-20 h-20 rounded-full border-4 border-[#2F855A] flex items-center justify-center">
                    {/* Cercle intérieur vert clair */}
                    <div className="w-16 h-16 rounded-full bg-[#48BB78] flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-white" strokeWidth={3} />
                    </div>
                  </div>
                </div>

                {/* Titre */}
                <h2 className="text-2xl font-bold text-white">
                  ❤ Votre demande a bien été envoyée !
                </h2>

                {/* Texte descriptif */}
                <div className="space-y-2 text-[#A0AEC0]">
                  <p>
                    Merci de nous avoir fait confiance.
                  </p>
                  <p>
                    Notre équipe va étudier votre situation avec attention et vous recontactera dans les plus brefs délais.
                  </p>
                </div>

                {/* Délai estimé */}
                <div className="flex items-center gap-2 text-[#48BB78] font-medium">
                  <Clock className="w-5 h-5" />
                  <span>Délai estimé : 48 à 72 heures</span>
                </div>

                {/* Bouton Aller à l'accueil */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoToHome}
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#48BB78] to-[#38B2AC] text-white font-bold rounded-3xl flex items-center justify-center gap-2 hover:from-[#38A169] hover:to-[#319795] transition-all"
                >
                  <Home className="w-5 h-5" />
                  <span>Aller à l'accueil</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  </>
  );
}
