'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, CheckCircle, User, Building, Hash, Infinity, Heart, ChevronDown, FileText, Upload, Paperclip, Handshake, Pen, Clock, Home } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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

export default function AskForHelpFormModal({ isOpen, onClose }: AskForHelpFormModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEmitter, setSelectedEmitter] = useState<EmitterType>(null);
  
  // États pour les champs de l'étape 2
  const [requesterLastName, setRequesterLastName] = useState('');
  const [requesterFirstName, setRequesterFirstName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [volunteerIdCode, setVolunteerIdCode] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [age, setAge] = useState('');
  const [supportCategory, setSupportCategory] = useState('Soutien Santé');
  const [isVitalEmergency, setIsVitalEmergency] = useState(false);
  const [hasInsurance, setHasInsurance] = useState<boolean | null>(null);
  const [insurancePercentage, setInsurancePercentage] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const [isCertified, setIsCertified] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSignatureApplied, setIsSignatureApplied] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();
  
  // États pour les documents
  const [documents, setDocuments] = useState<{ [key: string]: File | null }>({
    identity: null,
    situation: null,
    income: null,
    quote: null,
    income2: null,
  });
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
      setRequesterLastName('');
      setRequesterFirstName('');
      setOrganizationName('');
      setVolunteerIdCode('');
      setGender(null);
      setAge('');
      setSupportCategory('Soutien Santé');
      setIsVitalEmergency(false);
      setHasInsurance(null);
      setInsurancePercentage('');
      setIsCategoryDropdownOpen(false);
      setIsCertified(false);
      setSignature(null);
      setIsDrawing(false);
      setIsSignatureApplied(false);
      setShowSuccessModal(false);
      setDocuments({
        identity: null,
        situation: null,
        income: null,
        quote: null,
        income2: null,
      });
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

  // Fonction pour simuler l'envoi au serveur (mock)
  const mockSubmitToServer = async () => {
    // Préparer les données du formulaire
    const formData = {
      // Étape 1 : Informations sur l'émetteur
      emitterType: selectedEmitter,
      
      // Étape 2 : Identification du bénéficiaire
      ...(selectedEmitter === 'partner' && {
        organizationName: organizationName,
      }),
      ...(selectedEmitter === 'volunteer' && {
        volunteerIdCode: volunteerIdCode,
      }),
      ...((selectedEmitter === 'myself' || selectedEmitter === 'third-party') && {
        requesterLastName: requesterLastName,
        requesterFirstName: requesterFirstName,
        gender: gender,
        age: age,
        supportCategory: supportCategory,
        isVitalEmergency: isVitalEmergency,
        hasInsurance: hasInsurance,
        ...(hasInsurance === true && {
          insurancePercentage: insurancePercentage,
        }),
      }),
      
      // Étape 3 : Documents
      documents: {
        identity: documents.identity ? {
          name: documents.identity.name,
          size: documents.identity.size,
          type: documents.identity.type,
        } : null,
        situation: documents.situation ? {
          name: documents.situation.name,
          size: documents.situation.size,
          type: documents.situation.type,
        } : null,
        income: documents.income ? {
          name: documents.income.name,
          size: documents.income.size,
          type: documents.income.type,
        } : null,
        quote: documents.quote ? {
          name: documents.quote.name,
          size: documents.quote.size,
          type: documents.quote.type,
        } : null,
        income2: documents.income2 ? {
          name: documents.income2.name,
          size: documents.income2.size,
          type: documents.income2.type,
        } : null,
      },
      
      // Étape 4 : Engagement
      isCertified: isCertified,
      
      // Étape 5 : Signature
      signature: signature, // Base64 de la signature
      
      // Métadonnées
      submittedAt: new Date().toISOString(),
    };

    // Simuler un appel API avec un délai
    console.log('📤 Envoi des données au serveur (MOCK):', formData);
    
    try {
      // Simuler un délai de requête
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simuler une réponse réussie
      const mockResponse = {
        success: true,
        message: 'Votre demande d\'aide a été envoyée avec succès',
        requestId: `REQ-${Date.now()}`,
        data: formData,
      };
      
      console.log('✅ Réponse du serveur (MOCK):', mockResponse);
      
      // Ici, vous pouvez ajouter une notification de succès ou rediriger
      // Par exemple : toast.success('Demande envoyée avec succès !');
      
      return mockResponse;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi (MOCK):', error);
      throw error;
    }
  };

  const handleNext = () => {
    // Validation avant de passer à l'étape suivante
    if (currentStep === 1 && !selectedEmitter) {
      return; // Ne pas avancer si aucune option n'est sélectionnée
    }
    
    // Validation pour l'étape 2
    if (currentStep === 2) {
      if (selectedEmitter === 'partner' && !organizationName.trim()) {
        return; // Ne pas avancer si partenaire et nom d'organisation vide
      }
      if (selectedEmitter === 'volunteer' && !volunteerIdCode.trim()) {
        return; // Ne pas avancer si bénévole et ID Code vide
      }
      if ((selectedEmitter === 'myself' || selectedEmitter === 'third-party') && 
          (!requesterLastName.trim() || !requesterFirstName.trim() || !gender || !age.trim())) {
        return; // Ne pas avancer si nom, prénom, genre ou âge vide pour moi-même ou tierce personne
      }
      // Validation pour le pourcentage d'assurance si "Oui" est sélectionné
      if ((selectedEmitter === 'myself' || selectedEmitter === 'third-party') && 
          hasInsurance === true && !insurancePercentage.trim()) {
        return; // Ne pas avancer si assurance = Oui mais pourcentage non renseigné
      }
    }
    
    // Validation pour l'étape 4 (certification)
    if (currentStep === 4 && !isCertified) {
      return; // Ne pas avancer si la certification n'est pas acceptée
    }
    
    // Si on est à l'étape 5, on ne fait rien ici (géré par le bouton "Appliquer")
    if (currentStep === 5) {
      return; // Le bouton "Appliquer" gère le téléchargement
    }
    
    // Pour les autres étapes, passer à l'étape suivante
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
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
    
    console.log('🚀 Début de l\'envoi au serveur...');
    
    // Simuler l'envoi au serveur
    mockSubmitToServer()
      .then(() => {
        console.log('✅ Envoi réussi, affichage du modal de succès...');
        // Afficher le modal de succès
        setShowSuccessModal(true);
      })
      .catch((error) => {
        console.error('❌ Erreur lors de l\'envoi:', error);
        // Ici, vous pouvez afficher un message d'erreur à l'utilisateur
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
                  onClick={() => setSelectedEmitter(option.value as EmitterType)}
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
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-2">
              Identification du bénéficiaire
            </h3>
            <p className="text-[#A0AEC0] mb-6">
              Veuillez remplir les informations du bénéficiaire
            </p>
            
            {/* Champs conditionnels selon le type d'émetteur */}
            {selectedEmitter === 'partner' ? (
              // Un seul champ pour Partenaire
              <div className="space-y-4">
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#48BB78] w-5 h-5 z-10" />
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#1E2726] border-1 border-[#48BB78] rounded-2xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50 transition-all"
                    placeholder="nom de l'organisation"
                  />
                </div>
              </div>
            ) : selectedEmitter === 'volunteer' ? (
              // Un seul champ pour Bénévole
              <div className="space-y-4">
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#48BB78] w-5 h-5 z-10" />
                  <input
                    type="text"
                    value={volunteerIdCode}
                    onChange={(e) => setVolunteerIdCode(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#1E2726] border-1 border-[#48BB78] rounded-2xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50 transition-all"
                    placeholder="ID Code"
                  />
                </div>
              </div>
            ) : (
              // Formulaire complet pour Moi-même ou Tierce personne
              <div className="space-y-8">
                {/* Section Identité */}
                <div className="space-y-4 bg-[#00644d]/10 rounded-3xl p-4">
                  <h4 className="text-lg font-semibold text-white">Identité</h4>
                  <div className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#48BB78] w-5 h-5 z-10" />
                      <input
                        type="text"
                        value={requesterLastName}
                        onChange={(e) => setRequesterLastName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-[#1E2726] border-1 border-[#48BB78] rounded-3xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50 transition-all"
                        placeholder="Nom"
                      />
                    </div>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#48BB78] w-5 h-5 z-10" />
                      <input
                        type="text"
                        value={requesterFirstName}
                        onChange={(e) => setRequesterFirstName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-[#1E2726] border-1 border-[#48BB78] rounded-3xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50 transition-all"
                        placeholder="Prénoms"
                      />
                    </div>
                  </div>
                </div>

                {/* Section Genre */}
                <div className="space-y-4 bg-[#00644d]/10 rounded-3xl p-4">
                  <h4 className="text-lg font-semibold text-white">Genre</h4>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setGender('male')}
                      className={`w-fit rounded-3xl p-2 flex items-center gap-3 transition-all ${
                        gender === 'male'
                          ? 'bg-[#43B48F] text-white'
                          : 'bg-[#1E2726] text-white hover:bg-[#2A3534]'
                      }`}
                    >
                      {gender === 'male' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                      <span className="font-medium">Homme</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setGender('female')}
                      className={`w-fit rounded-3xl p-2 flex items-center gap-3 transition-all ${
                        gender === 'female'
                          ? 'bg-[#43B48F] text-white'
                          : 'bg-[#1E2726] text-white hover:bg-[#2A3534]'
                      }`}
                    >
                      {gender === 'female' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                      <span className="font-medium">Femme</span>
                    </motion.button>
                  </div>
                </div>

                {/* Section Âge */}
                <div className="space-y-4 bg-[#00644d]/10 rounded-3xl p-4">
                  <h4 className="text-lg font-semibold text-white">Âge</h4>
                  <div className="relative">
                    <label htmlFor="age-input" className="sr-only">Âge</label>
                    <Infinity className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#A0AEC0] w-5 h-5 z-10" />
                    <input
                      id="age-input"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      aria-label="Âge en années"
                      className="w-full pl-12 pr-16 py-4 bg-[#1E2726] border-1 border-[#48BB78] rounded-3xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50 transition-all"
                      placeholder=""
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#A0AEC0] pointer-events-none">
                      ans
                    </span>
                  </div>
                </div>

                {/* Section Catégorie de soutien */}
                <div className="space-y-4 ">
                  <div className="relative " ref={categoryDropdownRef}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                      className="w-full pl-12 pr-12 py-4 bg-[#1E2726] border-1 border-[#48BB78] rounded-3xl text-white flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Heart className="w-5 h-5 text-[#48BB78]" />
                        <span>{supportCategory}</span>
                      </div>
                      <motion.div
                        animate={{ rotate: isCategoryDropdownOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-[#48BB78]" />
                      </motion.div>
                    </motion.button>
                    <AnimatePresence>
                      {isCategoryDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-20 w-full mt-2 bg-[#1E2726] border-1 border-[#101919] rounded-3xl overflow-hidden"
                        >
                          {['Soutien Santé', 'Soutien Éducation', 'Soutien Alimentaire', 'Soutien Logement'].map((category) => (
                            <button
                              key={category}
                              onClick={() => {
                                setSupportCategory(category);
                                setIsCategoryDropdownOpen(false);
                              }}
                              className="w-full px-4 py-3 text-left text-white hover:bg-[#2A3534] transition-colors flex items-center gap-3"
                            >
                              <Heart className="w-5 h-5 text-[#48BB78]" />
                              <span>{category}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Section Urgence vitale */}
                <div className="space-y-4 ">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsVitalEmergency(!isVitalEmergency)}
                    className="w-full flex items-center gap-3 text-left"
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      isVitalEmergency
                        ? 'bg-[#48BB78] border-[#48BB78]'
                        : 'bg-transparent border-[#48BB78]'
                    }`}>
                      {isVitalEmergency && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-white text-sm">
                      S'agit-il d'une urgence vitale (pronostic engagé sous 24h-48h) ?
                    </span>
                  </motion.button>
                </div>

                {/* Section Couverture d'assurance */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">
                    Le patient a-t-il une couverture d'assurance (Mutuelle/CMU) ?
                  </h4>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setHasInsurance(true)}
                      className={`w-fit rounded-3xl p-2 flex items-center gap-3 transition-all ${
                        hasInsurance === true
                          ? 'bg-[#43B48F] text-white'
                          : 'bg-[#1E2726] text-white hover:bg-[#2A3534]'
                      }`}
                    >
                      {hasInsurance === true && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                      <span className="font-medium">Oui</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setHasInsurance(false)}
                      className={`w-fit rounded-3xl p-2 flex items-center gap-3 transition-all ${
                        hasInsurance === false
                          ? 'bg-[#43B48F] text-white'
                          : 'bg-[#1E2726] text-white hover:bg-[#2A3534]'
                      }`}
                    >
                      {hasInsurance === false && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                      <span className="font-medium">Non</span>
                    </motion.button>
                  </div>
                </div>

                {/* Section Pourcentage d'assurance */}
                {hasInsurance === true && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">À combien de % ?</h4>
                    <div className="relative">
                      <input
                        type="number"
                        value={insurancePercentage}
                        onChange={(e) => setInsurancePercentage(e.target.value)}
                        min="0"
                        max="100"
                        aria-label="Pourcentage de couverture d'assurance"
                        className="w-full pl-4 pr-16 py-4 bg-[#1E2726] border-1 border-[#48BB78] rounded-3xl text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#48BB78]/50 transition-all"
                        placeholder=""
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#A0AEC0] pointer-events-none">
                        %
                      </span>
                    </div>
                  </div>
                )}
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
                          (currentStep === 2 && (
                            (selectedEmitter === 'partner' && !organizationName.trim()) ||
                            (selectedEmitter === 'volunteer' && !volunteerIdCode.trim()) ||
                            ((selectedEmitter === 'myself' || selectedEmitter === 'third-party') && 
                             (!requesterLastName.trim() || !requesterFirstName.trim() || !gender || !age.trim() ||
                              (hasInsurance === true && !insurancePercentage.trim())))
                          )) ||
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
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleFinish}
                        className="px-6 py-3 bg-gradient-to-r from-[#48BB78] to-[#38B2AC] text-white font-bold rounded-3xl flex items-center gap-2 hover:from-[#38A169] hover:to-[#319795] transition-all"
                      >
                        <span>Terminer</span>
                        <CheckCircle className="w-5 h-5" />
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
