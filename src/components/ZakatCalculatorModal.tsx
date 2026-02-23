'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Info, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/components/LocaleProvider';
import { createZakat, PENDING_ZAKAT_STORAGE_KEY, type CreateZakatBody } from '@/services/zakat';
import { getNissabByCountry } from '@/services/nissab';

type AccordionKey = 'argent' | 'or' | 'argent_metal' | 'pierres';
type AccordionKeyStep2 = 'investissements' | 'immobilier' | 'autres_actifs';
type AccordionKeyStep3 = 'betail' | 'agriculture';
type AccordionKeyStep4 = 'prets_accordes';
type AccordionKeyStep5 = 'dettes_personnelles' | 'prets_long_termes' | 'professionnel';

interface ZakatCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  /** JWT pour créer la zakat via l’API (si fourni, on appelle createZakat au lieu du localStorage) */
  accessToken?: string | null;
  /** Appelé après création réussie via l’API (toast + redirection côté page) */
  onSuccess?: () => void;
  /** Appelé quand l'utilisateur clique sur Sauvegarder sans être connecté : le calcul est stocké en sessionStorage, la page peut rediriger vers connexion/inscription */
  onRequestAuth?: () => void;
}

export interface SavedZakat {
  id: string;
  date: string;
  totalAssets: number;
  zakatAmount: number;
  remainingToPay: number;
}

const STEPS_IDS = [
  { id: 1, key: 'step1' },
  { id: 2, key: 'step2' },
  { id: 3, key: 'step3' },
  { id: 4, key: 'step4' },
  { id: 5, key: 'step5' },
  { id: 6, key: 'step6' },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => currentYear - i);

/** Textes d’information affichés au clic sur l’icône Info (par étape). */
type StepInfoBase = { title: string };
type StepInfoWithItems = StepInfoBase & { items: string[] };
type StepInfoWithSections = StepInfoBase & { sections: { subtitle: string; text: string }[] };
type StepInfo = StepInfoWithItems | StepInfoWithSections;

function isStepInfoWithSections(info: StepInfo): info is StepInfoWithSections {
  return 'sections' in info && Array.isArray((info as StepInfoWithSections).sections);
}

function buildStepInfo(t: (key: string) => string): Record<number, StepInfo> {
  return {
    1: { title: t('stepInfo1Title'), items: [t('stepInfo1Item1'), t('stepInfo1Item2'), t('stepInfo1Item3'), t('stepInfo1Item4')] },
    2: {
      title: t('stepInfo2Title'),
      sections: [
        { subtitle: t('stepInfo2InvestSubtitle'), text: t('stepInfo2InvestText') },
        { subtitle: t('stepInfo2ImmoSubtitle'), text: t('stepInfo2ImmoText') },
        { subtitle: t('stepInfo2OthersSubtitle'), text: t('stepInfo2OthersText') },
      ],
    },
    3: {
      title: t('stepInfo3Title'),
      sections: [
        { subtitle: t('stepInfo3AgriSubtitle'), text: t('stepInfo3AgriText') },
        { subtitle: t('stepInfo3BetailSubtitle'), text: t('stepInfo3BetailText') },
      ],
    },
    4: { title: t('stepInfo4Title'), sections: [{ subtitle: t('stepInfo4Subtitle'), text: t('stepInfo4Text') }] },
    5: { title: t('stepInfo5Title'), sections: [{ subtitle: t('stepInfo5Subtitle'), text: t('stepInfo5Text') }] },
  };
}

const stepInfo: Record<number, StepInfo> = {
  1: {
    title: 'Liquidités & Valeurs',
    items: [
      'La Zakat est due à hauteur de 2,5% sur vos espèces en liquide et en banque détenues pendant une année complète.',
      'Or : 2,5% de la valeur marchande à la date de la valorisation.',
      'Argent (métal) : 2,5% sur tous les biens en argent pur (bijoux, couverts, etc.).',
      'Pierres précieuses : si valeur marchande, elles entrent dans l’assiette de la Zakat.',
    ],
  },
  2: {
    title: 'Placements & Immobilier (Le Patrimoine)',
    sections: [
      {
        subtitle: 'Investissements',
        text: "La Zakat doit être payée soit directement par l'entreprise ou individuellement par chacun de ses propriétaires à hauteur de sa part dans le capital de la société au moment du dernier bilan comptable. L'individu devra alors estimer sa part de bénéfice au moment du calcul de la Zakat.",
      },
      {
        subtitle: 'Immobilier',
        text: "La Zakat n'est pas due sur les biens immobiliers vous servant de résidence principale ou secondaire. La Zakat n'est pas non plus due sur la valeur de vos biens immobiliers mis en location mais uniquement sur le revenu locatif que vous en tirez, après en avoir déduit vos frais d'entretien. Si votre investissement immobilier est cependant destiné à une future revente dans le but d'en tirer un profit, la Zakat est alors due sur la valeur de marché du bien immobilier en question.",
      },
      {
        subtitle: 'Autres',
        text: "Vous devez payer la Zakat sur le montant des prêts que vous avez accordés à autrui au même titre que les espèces. Vous pouvez déduire les prêts dont vous bénéficiez et que vous n'avez pas encore remboursés. La Zakat n'est cependant pas due sur les créances douteuses (les prêts dont vous n'êtes pas sûrs qu'ils vous seront remboursés), auquel cas la Zakat sera due lorsque l'argent vous est remboursé.",
      },
    ],
  },
  3: {
    title: 'Activités Rurales (Bétail & Agriculture)',
    sections: [
      {
        subtitle: 'Agriculture',
        text: "La Zakat est due sur toutes les productions agricoles (fruits, légumes, fleurs, céréales, etc.) produites dans un but commercial et ce au moment de la récolte d'une quantité totale d'au moins 653kg. La durée de possession minimum d'un an ne s'applique pas aux productions agricoles et la Zakat doit être payée autant de fois qu'il n'y a de récolte. Le consensus adopte la formule suivante : 10 % pour les récoltes issues de champs non irrigués (eau de pluie uniquement) ; 5 % pour les champs irrigués ne bénéficiant pas de l'eau de pluie ; et 7,5 % pour les situations mixtes.",
      },
      {
        subtitle: 'Bétail',
        text: "Pour tous les animaux de pâturage (chèvres, moutons, chameaux, vaches, etc.) le consensus veut que la Zakat à payer équivaille à un animal pour 40. Il vous est cependant possible de payer en argent et nous vous invitons à consulter votre imam ou les savants pour plus d'information sur cette possibilité.",
      },
    ],
  },
  4: {
    title: 'Créances (Argent qu\'on vous doit)',
    sections: [
      {
        subtitle: 'Prêts / Dettes',
        text: "Si vous avez des impôts à payer au gouvernement, à la date du calcul de la zakat, vous pouvez les déduire de vos calculs avant d'arriver à la valeur nette. Si vous avez contracté un prêt auprès d'une personne ou d'une institution, et si vous n'avez pas encore déduit la même chose dans l'une des sections ci-dessus, vous pouvez déduire vos dettes ici. Soyez honnête, car la zakat est un moyen sûr de protéger sa richesse si elle a été payée régulièrement et intégralement. Les prêts contractés uniquement pour la richesse zakatable doivent être déduits. Les voitures, les maisons, etc. ne sont pas des biens soumis à la zakat (biens zakatables). Par conséquent, tout prêt ou prêt hypothécaire contracté à ces fins ne doit pas être déduit.",
      },
    ],
  },
  5: {
    title: 'Passif & Dettes (À déduire)',
    sections: [
      {
        subtitle: 'Prêts / Dettes',
        text: "Si vous avez des impôts à payer au gouvernement, à la date du calcul de la zakat, vous pouvez les déduire de vos calculs avant d'arriver à la valeur nette. Si vous avez contracté un prêt auprès d'une personne ou d'une institution, et si vous n'avez pas encore déduit la même chose dans l'une des sections ci-dessus, vous pouvez déduire vos dettes ici. Soyez honnête, car la zakat est un moyen sûr de protéger sa richesse si elle a été payée régulièrement et intégralement. Les prêts contractés uniquement pour la richesse zakatable doivent être déduits. Les voitures, les maisons, etc. ne sont pas des biens soumis à la zakat (biens zakatables). Par conséquent, tout prêt ou prêt hypothécaire contracté à ces fins ne doit pas être déduit.",
      },
    ],
  },
};

/** Garde uniquement les chiffres (0-9) pour les champs montants. */
function onlyDigits(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

/** Garde chiffres et un séparateur décimal (point ou virgule) pour les champs poids. */
function onlyDigitsAndDecimal(value: string): string {
  const normalized = value.replace(',', '.');
  const parts = normalized.split('.');
  if (parts.length > 2) return value;
  const int = parts[0].replace(/[^0-9]/g, '');
  const dec = parts[1] ? parts[1].replace(/[^0-9]/g, '').slice(0, 4) : '';
  return dec ? `${int}.${dec}` : int;
}

export default function ZakatCalculatorModal({ isOpen, onClose, onSave, accessToken, onSuccess, onRequestAuth }: ZakatCalculatorModalProps) {
  const t = useTranslations('zakatCalculatorModal');
  const { locale } = useLocale();
  const STEPS = useMemo(() => STEPS_IDS.map((s) => ({ id: s.id, label: t(s.key) })), [t]);
  const stepInfo = useMemo(() => buildStepInfo(t), [t]);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  // Step 1 - Mes possessions (Liquidités & Valeurs)
  const [openAccordion, setOpenAccordion] = useState<AccordionKey | null>(null);
  const [argentEspeces, setArgentEspeces] = useState('');
  const [argentBanque, setArgentBanque] = useState('');
  const [orMode, setOrMode] = useState<'valeur' | 'poids'>('valeur');
  const [orPrixGramme, setOrPrixGramme] = useState('');
  const [or24Valeur, setOr24Valeur] = useState('');
  const [or22Valeur, setOr22Valeur] = useState('');
  const [or18Valeur, setOr18Valeur] = useState('');
  const [or24Poids, setOr24Poids] = useState('');
  const [or22Poids, setOr22Poids] = useState('');
  const [or18Poids, setOr18Poids] = useState('');
  const [orUnitePoids, setOrUnitePoids] = useState<'g' | 'kg'>('g');
  const [argentMetalMode, setArgentMetalMode] = useState<'valeur' | 'poids'>('valeur');
  const [argentMetalPrix, setArgentMetalPrix] = useState('');
  const [argentMetalPoids, setArgentMetalPoids] = useState('');
  const [argentMetalValeur, setArgentMetalValeur] = useState('');
  const [pierresValeur, setPierresValeur] = useState('');
  // Step 2 - Le patrimoine (Placements & Immobilier)
  const [openAccordionStep2, setOpenAccordionStep2] = useState<AccordionKeyStep2 | null>(null);
  const [actionsXof, setActionsXof] = useState('');
  const [autresInvestissementsXof, setAutresInvestissementsXof] = useState('');
  const [revenusLocatifs, setRevenusLocatifs] = useState('');
  const [immobilier, setImmobilier] = useState('');
  const [retraitesPensions, setRetraitesPensions] = useState('');
  const [pretsFamilleAutrui, setPretsFamilleAutrui] = useState('');
  const [autresActifsPossessions, setAutresActifsPossessions] = useState('');
  // Step 3 - Bétail & Agriculture (Activités Rurales)
  const [openAccordionStep3, setOpenAccordionStep3] = useState<AccordionKeyStep3 | null>(null);
  const [betailVache, setBetailVache] = useState('');
  const [betailChameau, setBetailChameau] = useState('');
  const [betailMouton, setBetailMouton] = useState('');
  const [agricultureEauPluie, setAgricultureEauPluie] = useState('');
  const [agricultureIrrigation, setAgricultureIrrigation] = useState('');
  const [agricultureIrrigationPluie, setAgricultureIrrigationPluie] = useState('');
  // Step 4 - Créances (Argent qu'on vous doit)
  const [openAccordionStep4, setOpenAccordionStep4] = useState<AccordionKeyStep4 | null>(null);
  const [pretsFamilleStep4, setPretsFamilleStep4] = useState('');
  const [pretsAutruiStep4, setPretsAutruiStep4] = useState('');
  // Step 5 - Passif & Dettes (à déduire)
  const [openAccordionStep5, setOpenAccordionStep5] = useState<AccordionKeyStep5 | null>(null);
  const [dettesCartesCredit, setDettesCartesCredit] = useState('');
  const [dettesFamille, setDettesFamille] = useState('');
  const [dettesAutrui, setDettesAutrui] = useState('');
  const [pretsImmo, setPretsImmo] = useState('');
  const [pretsAuto, setPretsAuto] = useState('');
  const [fraisPro, setFraisPro] = useState('');
  // Popover Information (icône Info à côté du titre de section)
  const [infoPopoverStep, setInfoPopoverStep] = useState<number | null>(null);
  const infoPopoverRef = useRef<HTMLDivElement>(null);
  // Info Nissab (étape Confirmation) — affiché au clic sur l’icône
  const [showNissabInfo, setShowNissabInfo] = useState(false);
  // Nissab : montant récupéré selon le pays (géolocalisation ou défaut Côte d'Ivoire)
  const [nissabAmount, setNissabAmount] = useState<number>(0);
  const [nissabLoading, setNissabLoading] = useState(false);

  // Legacy (unused)
  const [hasGoldSilver, setHasGoldSilver] = useState<boolean | null>(null);
  const [unit, setUnit] = useState<'monetary' | 'weight' | null>(null);
  const [value, setValue] = useState('');
  const [hasSavings, setHasSavings] = useState<boolean | null>(null);
  const [savingsValue, setSavingsValue] = useState('');
  const [hasCommercialGoods, setHasCommercialGoods] = useState<boolean | null>(null);
  const [commercialGoodsValue, setCommercialGoodsValue] = useState('');
  const [hasDebts, setHasDebts] = useState<boolean | null>(null);
  const [debtsValue, setDebtsValue] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Empêcher le scroll du body quand le modal est ouvert (y compris horizontal sur mobile)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.overflowX = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.body.style.overflowX = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.overflowX = '';
    };
  }, [isOpen]);

  // Fermer le popover Information au clic extérieur
  useEffect(() => {
    if (infoPopoverStep == null) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (infoPopoverRef.current && !infoPopoverRef.current.contains(e.target as Node)) {
        setInfoPopoverStep(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [infoPopoverStep]);

  const DEFAULT_NISSAB_COUNTRY = "côte d'ivoire";
  const DEFAULT_NISSAB_AMOUNT = 1065050;

  // Récupérer le nissab selon le pays : géolocalisation (avec demande d'autorisation si besoin) ou pays par défaut
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setNissabLoading(true);

    const fetchNissabForCountry = async (country: string) => {
      try {
        const nissab = await getNissabByCountry(country);
        const amount = nissab?.amount;
        if (!cancelled) setNissabAmount(amount != null && amount > 0 ? amount : DEFAULT_NISSAB_AMOUNT);
      } catch {
        if (!cancelled) setNissabAmount(DEFAULT_NISSAB_AMOUNT);
      } finally {
        if (!cancelled) setNissabLoading(false);
      }
    };

    const tryGeolocationThenNissab = () => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        fetchNissabForCountry(DEFAULT_NISSAB_COUNTRY);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
              { headers: { 'Accept-Language': 'fr' } }
            );
            const data = await res.json();
            const country = data.address?.country?.trim();
            const countryToUse = country || DEFAULT_NISSAB_COUNTRY;
            await fetchNissabForCountry(countryToUse);
          } catch {
            await fetchNissabForCountry(DEFAULT_NISSAB_COUNTRY);
          }
        },
        () => {
          // Refus, erreur ou indisponible : utiliser le pays par défaut
          fetchNissabForCountry(DEFAULT_NISSAB_COUNTRY);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    };

    tryGeolocationThenNissab();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // Réinitialiser le formulaire quand le modal se ferme
  useEffect(() => {
    if (!isOpen) {
      setInfoPopoverStep(null);
      setShowNissabInfo(false);
      setNissabAmount(0);
      setCurrentStep(1);
      setSelectedYear(currentYear);
      setOpenAccordion(null);
      setArgentEspeces('');
      setArgentBanque('');
      setOrMode('valeur');
      setOrPrixGramme('');
      setOr24Valeur('');
      setOr22Valeur('');
      setOr18Valeur('');
      setOr24Poids('');
      setOr22Poids('');
      setOr18Poids('');
      setOrUnitePoids('g');
      setArgentMetalMode('valeur');
      setArgentMetalPrix('');
      setArgentMetalPoids('');
      setArgentMetalValeur('');
      setPierresValeur('');
      setOpenAccordionStep2(null);
      setActionsXof('');
      setAutresInvestissementsXof('');
      setRevenusLocatifs('');
      setImmobilier('');
      setRetraitesPensions('');
      setPretsFamilleAutrui('');
      setAutresActifsPossessions('');
      setOpenAccordionStep3(null);
      setBetailVache('');
      setBetailChameau('');
      setBetailMouton('');
      setAgricultureEauPluie('');
      setAgricultureIrrigation('');
      setAgricultureIrrigationPluie('');
      setOpenAccordionStep4(null);
      setPretsFamilleStep4('');
      setPretsAutruiStep4('');
      setOpenAccordionStep5(null);
      setDettesCartesCredit('');
      setDettesFamille('');
      setDettesAutrui('');
      setPretsImmo('');
      setPretsAuto('');
      setFraisPro('');
      setHasGoldSilver(null);
      setUnit(null);
      setValue('');
      setHasSavings(null);
      setSavingsValue('');
      setHasCommercialGoods(null);
      setCommercialGoodsValue('');
      setHasDebts(null);
      setDebtsValue('');
      setSubmitError(null);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      handleClose();
    }
  };

  const handleSave = () => {
    const { totalAmount, remainingAmount } = getConfirmationValues();

    if (accessToken) {
      setSubmitLoading(true);
      setSubmitError(null);
      const calculationDate = new Date(selectedYear, 0, 1).toISOString();
      createZakat(accessToken, {
        calculationDate,
        year: selectedYear,
        totalAmount,
        zakatDue: remainingAmount,
        remainingAmount,
      })
        .then(() => {
          onSuccess?.();
          onSave?.();
          handleClose();
        })
        .catch((err) => {
          setSubmitError(t('submitErrorCreate'));
        })
        .finally(() => {
          setSubmitLoading(false);
        });
      return;
    }

    // Non connecté : enregistrer le calcul en sessionStorage et demander connexion/inscription
    const body: CreateZakatBody = {
      calculationDate: new Date(selectedYear, 0, 1).toISOString(),
      year: selectedYear,
      totalAmount,
      zakatDue: remainingAmount,
      remainingAmount,
    };
    try {
      sessionStorage.setItem(PENDING_ZAKAT_STORAGE_KEY, JSON.stringify(body));
    } catch {
      setSubmitError(t('submitErrorSave'));
      return;
    }
    onRequestAuth?.();
    handleClose();
  };

  // Fonction pour formater les montants en F CFA
  const formatAmount = (amount: number) => {
    const localeCode = locale === 'en' ? 'en-GB' : 'fr-FR';
    return new Intl.NumberFormat(localeCode, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculer le montant total des biens (somme de tous les biens - dettes)
  const calculateTotalAssets = () => {
    let total = 0;

    // Step 1 - Liquidités & Valeurs
    total += parseFloat(argentEspeces || '0') || 0;
    total += parseFloat(argentBanque || '0') || 0;
    if (orMode === 'valeur') {
      total += parseFloat(or24Valeur || '0') || 0;
      total += parseFloat(or22Valeur || '0') || 0;
      total += parseFloat(or18Valeur || '0') || 0;
    } else {
      const prixSaisi = parseFloat((orPrixGramme || '0').replace(',', '.')) || 0;
      const prixParGramme = orUnitePoids === 'kg' ? prixSaisi / 1000 : prixSaisi;
      const toGrammes = (s: string) => (parseFloat((s || '0').replace(',', '.')) || 0) * (orUnitePoids === 'kg' ? 1000 : 1);
      const p24g = toGrammes(or24Poids);
      const p22g = toGrammes(or22Poids);
      const p18g = toGrammes(or18Poids);
      const poidsPurTotal = p24g * (24 / 24) + p22g * (22 / 24) + p18g * (18 / 24);
      total += prixParGramme * poidsPurTotal;
    }
    if (argentMetalMode === 'valeur') {
      total += parseFloat(argentMetalValeur || '0') || 0;
    } else {
      const prix = parseFloat(argentMetalPrix || '0') || 0;
      const poids = parseFloat(argentMetalPoids || '0') || 0;
      total += prix * poids;
    }
    total += parseFloat(pierresValeur || '0') || 0;

    // Step 2 - Le patrimoine (Placements & Immobilier)
    total += parseFloat(actionsXof || '0') || 0;
    total += parseFloat(autresInvestissementsXof || '0') || 0;
    total += parseFloat(revenusLocatifs || '0') || 0;
    total += parseFloat(immobilier || '0') || 0;
    total += parseFloat(retraitesPensions || '0') || 0;
    total += parseFloat(pretsFamilleAutrui || '0') || 0;
    total += parseFloat(autresActifsPossessions || '0') || 0;

    // Step 3 - Bétail & Agriculture
    total += parseFloat(betailVache || '0') || 0;
    total += parseFloat(betailChameau || '0') || 0;
    total += parseFloat(betailMouton || '0') || 0;
    // Agriculture : montants bruts inclus dans le total des biens (mais pas soumis au 2,5%)
    total += parseFloat(agricultureEauPluie || '0') || 0;
    total += parseFloat(agricultureIrrigation || '0') || 0;
    total += parseFloat(agricultureIrrigationPluie || '0') || 0;

    // Step 4 - Créances (prêts accordés)
    total += parseFloat(pretsFamilleStep4 || '0') || 0;
    total += parseFloat(pretsAutruiStep4 || '0') || 0;

    // Step 5 - Passif & Dettes (à déduire)
    total -= parseFloat(dettesCartesCredit || '0') || 0;
    total -= parseFloat(dettesFamille || '0') || 0;
    total -= parseFloat(dettesAutrui || '0') || 0;
    total -= parseFloat(pretsImmo || '0') || 0;
    total -= parseFloat(pretsAuto || '0') || 0;
    total -= parseFloat(fraisPro || '0') || 0;

    return Math.max(0, total); // S'assurer que le total n'est pas négatif
  };

  /** Total des biens SANS les champs agriculture (utilisé pour le calcul du 2,5%). */
  const calculateTotalAssetsSansAgriculture = () => {
    const total = calculateTotalAssets();
    const agriculture =
      parseFloat(agricultureEauPluie || '0') +
      parseFloat(agricultureIrrigation || '0') +
      parseFloat(agricultureIrrigationPluie || '0');
    return Math.max(0, total - agriculture);
  };

  /** Zakat sur l'agriculture : 10% eau de pluie, 5% irrigation, 7,5% mixte (hors 2,5%). */
  const calculateZakatAgriculture = () => {
    const eauPluie = parseFloat(agricultureEauPluie || '0') || 0;
    const irrigation = parseFloat(agricultureIrrigation || '0') || 0;
    const mixte = parseFloat(agricultureIrrigationPluie || '0') || 0;
    return eauPluie * 0.1 + irrigation * 0.05 + mixte * 0.075;
  };

  /** Somme des valeurs agriculture (base pour le cas "agriculture seule"). */
  const calculateAgricultureTotal = () =>
    parseFloat(agricultureEauPluie || '0') +
    parseFloat(agricultureIrrigation || '0') +
    parseFloat(agricultureIrrigationPluie || '0');

  /** Cas spécial : total hors agriculture < nissab mais il y a de l'agriculture → seule la zakat agricole est enregistrable. */
  const isAgricultureOnlyCase = () => {
    const totalSansAgriculture = calculateTotalAssetsSansAgriculture();
    const zakatAgriculture = calculateZakatAgriculture();
    return !nissabLoading && totalSansAgriculture < nissabAmount && zakatAgriculture > 0;
  };

  // Conversion poids en grammes selon l'unité (g ou kg)
  const orPoidsEnGrammes = (poidsStr: string) => {
    const p = parseFloat((poidsStr || '0').replace(',', '.')) || 0;
    return orUnitePoids === 'kg' ? p * 1000 : p;
  };
  // Poids pur = poids réel × (carat/24) — en grammes pour chaque carat
  const orPoidsPur24 = orMode === 'poids' ? orPoidsEnGrammes(or24Poids) * (24 / 24) : 0;
  const orPoidsPur22 = orMode === 'poids' ? orPoidsEnGrammes(or22Poids) * (22 / 24) : 0;
  const orPoidsPur18 = orMode === 'poids' ? orPoidsEnGrammes(or18Poids) * (18 / 24) : 0;
  const orPoidsPurTotal = orPoidsPur24 + orPoidsPur22 + orPoidsPur18;
  // Résultat Or en mode poids : prix × poids pur (prix en XOF/g ou XOF/kg selon orUnitePoids)
  const orPrixParGramme = orUnitePoids === 'kg' ? (parseFloat(orPrixGramme || '0') || 0) / 1000 : (parseFloat(orPrixGramme || '0') || 0);
  const orResultatPoids = orMode === 'poids' ? orPrixParGramme * orPoidsPurTotal : 0;
  const argentMetalResultatPoids = argentMetalMode === 'poids' ? (parseFloat(argentMetalPrix || '0') || 0) * (parseFloat(argentMetalPoids || '0') || 0) : 0;

  // Calculer la zakat : 2,5% sur tous les biens SAUF agriculture + agriculture (10%/5%/7,5%)
  const calculateZakat = () => {
    const totalSansAgriculture = calculateTotalAssetsSansAgriculture();
    const zakatStandard = totalSansAgriculture * 0.025;
    const zakatAgriculture = calculateZakatAgriculture();
    return zakatStandard + zakatAgriculture;
  };

  /** Valeurs de confirmation (step 6) = valeurs envoyées à l'API (montant total + zakat à payer) */
  const getConfirmationValues = () => {
    const totalAssets = calculateTotalAssets();
    const zakatAgriculture = calculateZakatAgriculture();
    const isAgricultureOnly = isAgricultureOnlyCase();
    const zakatAmount = isAgricultureOnly ? zakatAgriculture : calculateZakat();
    return {
      totalAmount: Math.round(totalAssets),
      remainingAmount: Math.round(zakatAmount),
    };
  };

  const renderStepContent = () => {
    // Step 1 - Mes possessions (Liquidités & Valeurs) - design Figma
    if (currentStep === 1) {
      const toggleAccordion = (key: AccordionKey) => setOpenAccordion((prev) => (prev === key ? null : key));
      const inputBase = 'w-full bg-[#101919] text-white text-sm border border-white/10 rounded-lg p-3 focus:outline-none focus:border-[#43B48F] pr-16';
      const inputWrap = (s: string, set: (v: string) => void, label: string) => (
        <div className="space-y-1">
          <label className="text-white/80 text-xs sm:text-sm">{label}</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={s}
              onChange={(e) => set(onlyDigits(e.target.value))}
              className={inputBase}
              placeholder="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5ab678] font-bold text-xs">XOF</span>
          </div>
        </div>
      );
      const toggleBtn = (mode: 'valeur' | 'poids', current: 'valeur' | 'poids', set: (v: 'valeur' | 'poids') => void, label: string) => (
        <button
          type="button"
          onClick={() => set(mode)}
          className={`w-auto shrink-0 py-2 px-4 rounded-2xl font-medium text-sm transition-all ${
            current === mode ? 'bg-[#43B48F] text-[#101919]' : 'bg-[#101919] text-white border border-white/10'
          }`}
        >
          {label}
        </button>
      );
      const toggleUnitePoids = (unite: 'g' | 'kg') => (
        <button
          type="button"
          onClick={() => setOrUnitePoids(unite)}
          className={`w-auto shrink-0 py-2 px-4 rounded-2xl font-medium text-sm transition-all ${
            orUnitePoids === unite ? 'bg-[#43B48F] text-[#101919]' : 'bg-[#101919] text-white border border-white/10'
          }`}
        >
          {unite === 'g' ? 'g' : 'kg'}
        </button>
      );
      const inputWrapPoids = (s: string, set: (v: string) => void, label: string, resultatXof: number) => (
        <div className="space-y-1">
          <label className="text-white/80 text-xs sm:text-sm">{label}</label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={s}
              onChange={(e) => set(onlyDigitsAndDecimal(e.target.value))}
              className={inputBase}
              placeholder="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5ab678] font-bold text-xs">{orUnitePoids}</span>
          </div>
          <p className="text-[#5ab678] text-xs">{t('resultXof', { amount: formatAmount(resultatXof) })}</p>
        </div>
      );

      return (
        <div className="space-y-4 sm:space-y-6">
          {/* Année de calcul */}
          <div className="space-y-2">
            <label htmlFor="zakat-year-step1" className="text-white/80 text-sm font-medium">{t('yearLabel')}</label>
            <select
              id="zakat-year-step1"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full max-w-[140px] py-2 px-3 rounded-lg bg-[#0F1F1F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#43B48F]"
              aria-label={t('yearAria')}
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y} className="bg-[#101919] text-white">
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Barre de progression 20% */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">{t('progression')}</span>
              <span className="text-white font-medium">20%</span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(to right, #3AE1B4, #13A98B)' }}
                initial={{ width: 0 }}
                animate={{ width: '20%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Section Liquidités & Valeurs */}
          <div ref={infoPopoverRef} className="relative flex items-center gap-2">
            <h3 className="text-white font-bold text-base sm:text-lg">
              {t('section1Title')}
            </h3>
            <motion.button
              type="button"
              onClick={() => setInfoPopoverStep((prev) => (prev === 1 ? null : 1))}
              className="text-[#43B48F] hover:opacity-80 shrink-0"
              aria-label={t('showInfo')}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Info size={18} />
            </motion.button>
            <AnimatePresence>
              {infoPopoverStep === 1 && stepInfo[1] && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 z-20 w-[min(100%,320px)] rounded-xl border border-white/20 bg-[#0F1F1F] p-4 shadow-xl"
                >
                  <p className="text-[#5ab678] font-semibold text-sm mb-2">{stepInfo[1].title}</p>
                  <ul className="text-white/80 text-xs sm:text-sm space-y-2 list-disc list-inside">
                    {'items' in stepInfo[1] && stepInfo[1].items.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordéon Argent */}
          <div className="rounded-3xl border border-[#5ab678] overflow-hidden bg-[#101919]/80">
            <button
              type="button"
              onClick={() => toggleAccordion('argent')}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#101919]/80 flex items-center justify-center">
                  <Image src="/icons/coin.png" alt="" width={20} height={20} className="opacity-90" />
                </div>
                <span className="text-white font-medium">{t('argent')}</span>
              </div>
              {openAccordion === 'argent' ? <ChevronUp size={20} className="text-[#5ab678]" /> : <ChevronDown size={20} className="text-[#5ab678]" />}
            </button>
            <AnimatePresence>
              {openAccordion === 'argent' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 border-t border-white/10 pt-4 space-y-4">
                    <div className="rounded-lg bg-[#0F1F1F]/90 border border-white/10 p-3">
                      <div className="flex items-start gap-2">
                        <Info size={16} className="text-[#5ab678] flex-shrink-0 mt-0.5" />
                        <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                          {t('infoCash')}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {inputWrap(argentEspeces, setArgentEspeces, t('especes'))}
                      {inputWrap(argentBanque, setArgentBanque, t('especesBanque'))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordéon Or */}
          <div className="rounded-3xl border border-[#5ab678] overflow-hidden bg-[#101919]/80">
            <button
              type="button"
              onClick={() => toggleAccordion('or')}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#101919]/80 flex items-center justify-center">
                  <Image src="/icons/coin.png" alt="" width={20} height={20} className="opacity-90" />
                </div>
                <span className="text-white font-medium">{t('or')}</span>
              </div>
              {openAccordion === 'or' ? <ChevronUp size={20} className="text-[#5ab678]" /> : <ChevronDown size={20} className="text-[#5ab678]" />}
            </button>
            <AnimatePresence>
              {openAccordion === 'or' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 border-t border-white/10 pt-4 space-y-4">
                    <div className="rounded-lg bg-[#0F1F1F]/90 border border-white/10 p-3">
                      <div className="flex items-start gap-2">
                        <Info size={16} className="text-[#5ab678] flex-shrink-0 mt-0.5" />
                        <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                          {t('infoOr')}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 justify-start">
                      {toggleBtn('valeur', orMode, setOrMode, t('value'))}
                      {toggleBtn('poids', orMode, setOrMode, t('weight'))}
                    </div>
                    {orMode === 'valeur' && (
                      <>
                        {inputWrap(or24Valeur, setOr24Valeur, t('or24'))}
                        {inputWrap(or22Valeur, setOr22Valeur, t('or22'))}
                        {inputWrap(or18Valeur, setOr18Valeur, t('or18'))}
                      </>
                    )}
                    {orMode === 'poids' && (
                      <>
                        <div className="flex gap-2 items-end flex-wrap">
                          <div className="flex-1 min-w-[120px] space-y-1">
                            <label className="text-white/80 text-xs">{t('goldPrice')}</label>
                            <div className="relative">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={orPrixGramme}
                                onChange={(e) => setOrPrixGramme(onlyDigits(e.target.value))}
                                className={inputBase}
                                placeholder="0"
                              />
                              <span className="absolute right-10 top-1/2 -translate-y-1/2 text-[#5ab678] font-bold text-xs">XOF/{orUnitePoids}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setOrPrixGramme('');
                                  setOr24Poids('');
                                  setOr22Poids('');
                                  setOr18Poids('');
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-[#43B48F]"
                                aria-label={t('clearGoldFields')}
                              >
                                <RefreshCw size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="text-white/80 text-xs">{t('weightUnit')}</span>
                          {toggleUnitePoids('g')}
                          {toggleUnitePoids('kg')}
                        </div>
                        {inputWrapPoids(or24Poids, setOr24Poids, `${t('or24')} (${orUnitePoids})`, orPoidsPur24 * orPrixParGramme)}
                        {inputWrapPoids(or22Poids, setOr22Poids, `${t('or22')} (${orUnitePoids})`, orPoidsPur22 * orPrixParGramme)}
                        {inputWrapPoids(or18Poids, setOr18Poids, `${t('or18')} (${orUnitePoids})`, orPoidsPur18 * orPrixParGramme)}
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-white/80 text-sm">{t('result')}</span>
                          <span className="text-[#5ab678] font-bold">{formatAmount(orResultatPoids)} XOF</span>
                        </div>
                      </>
                    )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordéon Argent (métal) */}
          <div className="rounded-3xl border border-[#5ab678] overflow-hidden bg-[#101919]/80">
            <button
              type="button"
              onClick={() => toggleAccordion('argent_metal')}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#101919]/80 flex items-center justify-center">
                  <Image src="/icons/coin.png" alt="" width={20} height={20} className="opacity-90" />
                </div>
                <span className="text-white font-medium">{t('argentMetal')}</span>
              </div>
              {openAccordion === 'argent_metal' ? <ChevronUp size={20} className="text-[#5ab678]" /> : <ChevronDown size={20} className="text-[#5ab678]" />}
            </button>
            <AnimatePresence>
              {openAccordion === 'argent_metal' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 border-t border-white/10 pt-4 space-y-4">
                    <div className="rounded-lg bg-[#0F1F1F]/90 border border-white/10 p-3">
                      <div className="flex items-start gap-2">
                        <Info size={16} className="text-[#5ab678] flex-shrink-0 mt-0.5" />
                        <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                          {t('infoArgentMetal')}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 justify-start">
                      {toggleBtn('valeur', argentMetalMode, setArgentMetalMode, t('value'))}
                      {toggleBtn('poids', argentMetalMode, setArgentMetalMode, t('weight'))}
                    </div>
                    {argentMetalMode === 'valeur' && inputWrap(argentMetalValeur, setArgentMetalValeur, t('argentMetal'))}
                    {argentMetalMode === 'poids' && (
                      <>
                        <div className="flex gap-2 items-end flex-wrap">
                          <div className="flex-1 min-w-[120px] space-y-1">
                            <label className="text-white/80 text-xs">{t('silverPrice')}</label>
                            <div className="relative">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={argentMetalPrix}
                                onChange={(e) => setArgentMetalPrix(onlyDigits(e.target.value))}
                                className={inputBase}
                                placeholder="0"
                              />
                              <span className="absolute right-10 top-1/2 -translate-y-1/2 text-[#5ab678] font-bold text-xs">XOF</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setArgentMetalPrix('');
                                  setArgentMetalPoids('');
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-[#43B48F]"
                                aria-label={t('clearSilverFields')}
                              >
                                <RefreshCw size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="w-12 text-white/60 text-sm">g</div>
                        </div>
                        {inputWrap(argentMetalPoids, setArgentMetalPoids, t('argentMetalGrams'))}
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-white/80 text-sm">{t('result')}</span>
                          <span className="text-[#5ab678] font-bold">{formatAmount(argentMetalResultatPoids)} XOF</span>
                        </div>
                      </>
                    )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordéon Pierres précieuses */}
          <div className="rounded-3xl border border-[#5ab678] overflow-hidden bg-[#101919]/80">
            <button
              type="button"
              onClick={() => toggleAccordion('pierres')}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#101919]/80 flex items-center justify-center">
                  <Image src="/icons/coin.png" alt="" width={20} height={20} className="opacity-90" />
                </div>
                <span className="text-white font-medium">{t('pierres')}</span>
              </div>
              {openAccordion === 'pierres' ? <ChevronUp size={20} className="text-white/60" /> : <ChevronDown size={20} className="text-white/60" />}
            </button>
            <AnimatePresence>
              {openAccordion === 'pierres' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 border-t border-white/10 pt-4 space-y-4">
                    <div className="rounded-lg bg-[#0F1F1F]/90 border border-white/10 p-3">
                      <div className="flex items-start gap-2">
                        <Info size={16} className="text-[#5ab678] flex-shrink-0 mt-0.5" />
                        <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                          {t('infoPierres')}
                        </p>
                      </div>
                    </div>
                    {inputWrap(pierresValeur, setPierresValeur, t('pierres'))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      );
    }

    // Step 2 - Le patrimoine (Placements & Immobilier) - design Figma
    if (currentStep === 2) {
      const toggleAccordionStep2 = (key: AccordionKeyStep2) => setOpenAccordionStep2((prev) => (prev === key ? null : key));
      const inputBase = 'w-full bg-[#101919] text-white text-sm border border-white/10 rounded-lg p-3 focus:outline-none focus:border-[#43B48F] pr-16';
      const inputWrapStep2 = (s: string, set: (v: string) => void, label: string) => (
        <div className="space-y-1">
          <label className="text-white/80 text-xs sm:text-sm">{label}</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={s}
              onChange={(e) => set(onlyDigits(e.target.value))}
              className={inputBase}
              placeholder="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5ab678] font-bold text-xs">XOF</span>
          </div>
        </div>
      );

      return (
        <div className="space-y-4 sm:space-y-6">
          {/* Barre de progression 40% */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">{t('progression')}</span>
              <span className="text-white font-medium">40%</span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(to right, #3AE1B4, #13A98B)' }}
                initial={{ width: 0 }}
                animate={{ width: '40%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Section Placements & Immobilier (Le Patrimoine) */}
          <div ref={infoPopoverRef} className="relative flex items-center gap-2">
            <h3 className="text-white font-bold text-base sm:text-lg">
              {t('section2Title')}
            </h3>
            <motion.button
              type="button"
              onClick={() => setInfoPopoverStep((prev) => (prev === 2 ? null : 2))}
              className="text-[#43B48F] hover:opacity-80 shrink-0"
              aria-label={t('showInfo')}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Info size={18} />
            </motion.button>
            <AnimatePresence>
              {infoPopoverStep === 2 && stepInfo[2] && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 z-20 w-[min(100%,360px)] max-h-[70vh] overflow-y-auto rounded-xl border border-white/20 bg-[#0F1F1F] p-4 shadow-xl"
                >
                  <p className="text-[#5ab678] font-semibold text-sm mb-3">{stepInfo[2].title}</p>
                  {isStepInfoWithSections(stepInfo[2]) ? (
                    <div className="text-white/80 text-xs sm:text-sm space-y-4">
                      {stepInfo[2].sections.map((section, i) => (
                        <div key={i}>
                          <p className="font-semibold text-white/90 mb-1">{section.subtitle}</p>
                          <p className="leading-relaxed">{section.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="text-white/80 text-xs sm:text-sm space-y-2 list-disc list-inside">
                      {'items' in stepInfo[2] && stepInfo[2].items.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordéon 1 - Investissements */}
          <div className="rounded-3xl border border-[#5ab678] overflow-hidden bg-[#101919]/80">
            <button
              type="button"
              onClick={() => toggleAccordionStep2('investissements')}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#101919]/80 flex items-center justify-center">
                  <Image src="/icons/status-up.png" alt="" width={20} height={20}  />
                </div>
                <span className="text-white font-medium">{t('investissements')}</span>
              </div>
              {openAccordionStep2 === 'investissements' ? <ChevronUp size={20} className="text-[#5ab678]" /> : <ChevronDown size={20} className="text-[#5ab678]" />}
            </button>
            <AnimatePresence>
              {openAccordionStep2 === 'investissements' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-4">
                    {inputWrapStep2(actionsXof, setActionsXof, t('actionsXof'))}
                    {inputWrapStep2(autresInvestissementsXof, setAutresInvestissementsXof, t('autresInvestissementsXof'))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordéon 2 - Immobilier */}
          <div className="rounded-3xl border border-[#5ab678] overflow-hidden bg-[#101919]/80">
            <button
              type="button"
              onClick={() => toggleAccordionStep2('immobilier')}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#101919]/80 flex items-center justify-center">
                  <Image src="/icons/buliding.png" alt="" width={20} height={20} className="opacity-90" />
                </div>
                <span className="text-white font-medium">{t('immobilier')}</span>
              </div>
              {openAccordionStep2 === 'immobilier' ? <ChevronUp size={20} className="text-[#5ab678]" /> : <ChevronDown size={20} className="text-[#5ab678]" />}
            </button>
            <AnimatePresence>
              {openAccordionStep2 === 'immobilier' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-4">
                    {inputWrapStep2(revenusLocatifs, setRevenusLocatifs, t('revenusLocatifs'))}
                    {inputWrapStep2(immobilier, setImmobilier, t('immobilier'))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordéon 3 - Autres actifs */}
          <div className="rounded-3xl border border-[#5ab678] overflow-hidden bg-[#101919]/80">
            <button
              type="button"
              onClick={() => toggleAccordionStep2('autres_actifs')}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#101919]/80 flex items-center justify-center">
                  <Image src="/icons/more.png" alt="" width={20} height={20} className="opacity-90" />
                </div>
                <span className="text-white font-medium">{t('autresActifs')}</span>
              </div>
              {openAccordionStep2 === 'autres_actifs' ? <ChevronUp size={20} className="text-[#5ab678]" /> : <ChevronDown size={20} className="text-[#5ab678]" />}
            </button>
            <AnimatePresence>
              {openAccordionStep2 === 'autres_actifs' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-4">
                    {inputWrapStep2(retraitesPensions, setRetraitesPensions, t('retraitesPensions'))}
                    {inputWrapStep2(pretsFamilleAutrui, setPretsFamilleAutrui, t('pretsFamilleAutrui'))}
                    {inputWrapStep2(autresActifsPossessions, setAutresActifsPossessions, t('autresActifsPossessions'))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      );
    }

    // Step 3 - Bétail & Agriculture (Activités Rurales) - design Figma
    if (currentStep === 3) {
      const toggleAccordionStep3 = (key: AccordionKeyStep3) => setOpenAccordionStep3((prev) => (prev === key ? null : key));
      const inputBase = 'w-full bg-[#101919] text-white text-sm border border-white/10 rounded-lg p-3 focus:outline-none focus:border-[#43B48F] pr-16';
      const inputWrapStep3 = (s: string, set: (v: string) => void, label: string) => (
        <div className="space-y-1">
          <label className="text-white/80 text-xs sm:text-sm">{label}</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={s}
              onChange={(e) => set(onlyDigits(e.target.value))}
              className={inputBase}
              placeholder="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5ab678] font-bold text-xs">XOF</span>
          </div>
        </div>
      );
      /** Champ agriculture avec résultat en bas : 10% eau de pluie, 5% irrigation, 7,5% mixte. */
      const inputWrapStep3Agriculture = (s: string, set: (v: string) => void, label: string, taux: number) => {
        const montant = parseFloat(s || '0') || 0;
        const zakatChamp = montant * taux;
        const tauxLabel = taux === 0.1 ? '10%' : taux === 0.05 ? '5%' : '7,5%';
        return (
          <div className="space-y-1">
            <label className="text-white/80 text-xs sm:text-sm">{label}</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={s}
                onChange={(e) => set(onlyDigits(e.target.value))}
                className={inputBase}
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5ab678] font-bold text-xs">XOF</span>
            </div>
            <p className="text-[#5ab678] text-xs">
              {t('zakatRate', { rate: tauxLabel, amount: formatAmount(zakatChamp) })}
            </p>
          </div>
        );
      };

      return (
        <div className="space-y-4 sm:space-y-6">
          {/* Barre de progression 60% */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">{t('progression')}</span>
              <span className="text-white font-medium">60%</span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(to right, #3AE1B4, #13A98B)' }}
                initial={{ width: 0 }}
                animate={{ width: '60%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Section Activités Rurales (Bétail & Agriculture) */}
          <div ref={infoPopoverRef} className="relative flex items-center gap-2">
            <h3 className="text-white font-bold text-base sm:text-lg">
              {t('section3Title')}
            </h3>
            <motion.button
              type="button"
              onClick={() => setInfoPopoverStep((prev) => (prev === 3 ? null : 3))}
              className="text-[#43B48F] hover:opacity-80 shrink-0"
              aria-label={t('showInfo')}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Info size={18} />
            </motion.button>
            <AnimatePresence>
              {infoPopoverStep === 3 && stepInfo[3] && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 z-20 w-[min(100%,360px)] max-h-[70vh] overflow-y-auto rounded-xl border border-white/20 bg-[#0F1F1F] p-4 shadow-xl"
                >
                  <p className="text-[#5ab678] font-semibold text-sm mb-3">{stepInfo[3].title}</p>
                  {isStepInfoWithSections(stepInfo[3]) ? (
                    <div className="text-white/80 text-xs sm:text-sm space-y-4">
                      {stepInfo[3].sections.map((section, i) => (
                        <div key={i}>
                          <p className="font-semibold text-white/90 mb-1">{section.subtitle}</p>
                          <p className="leading-relaxed">{section.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="text-white/80 text-xs sm:text-sm space-y-2 list-disc list-inside">
                      {'items' in stepInfo[3] && stepInfo[3].items.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordéon 1 - Bétail */}
          <div className="rounded-3xl border border-[#5ab678] overflow-hidden bg-[#101919]/80">
            <button
              type="button"
              onClick={() => toggleAccordionStep3('betail')}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#101919]/80 flex items-center justify-center">
                  <Image src="/icons/betail.png" alt="" width={20} height={20} className="opacity-90" />
                </div>
                <span className="text-white font-medium">{t('betail')}</span>
              </div>
              {openAccordionStep3 === 'betail' ? <ChevronUp size={20} className="text-[#5ab678]" /> : <ChevronDown size={20} className="text-[#5ab678]" />}
            </button>
            <AnimatePresence>
              {openAccordionStep3 === 'betail' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-4">
                    {inputWrapStep3(betailVache, setBetailVache, t('vache'))}
                    {inputWrapStep3(betailChameau, setBetailChameau, t('chameau'))}
                    {inputWrapStep3(betailMouton, setBetailMouton, t('mouton'))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordéon 2 - Agriculture */}
          <div className="rounded-3xl border border-[#5ab678] overflow-hidden bg-[#101919]/80">
            <button
              type="button"
              onClick={() => toggleAccordionStep3('agriculture')}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#101919]/80 flex items-center justify-center">
                  <Image src="/icons/agri.png" alt="" width={20} height={20} className="opacity-90" />
                </div>
                <span className="text-white font-medium">{t('agriculture')}</span>
              </div>
              {openAccordionStep3 === 'agriculture' ? <ChevronUp size={20} className="text-[#5ab678]" /> : <ChevronDown size={20} className="text-[#5ab678]" />}
            </button>
            <AnimatePresence>
              {openAccordionStep3 === 'agriculture' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-4">
                    <p className="text-white/60 text-xs mb-2">
                      {t('agricultureNote')}
                    </p>
                    {inputWrapStep3Agriculture(agricultureEauPluie, setAgricultureEauPluie, t('agricultureEauPluie'), 0.1)}
                    {inputWrapStep3Agriculture(agricultureIrrigation, setAgricultureIrrigation, t('agricultureIrrigation'), 0.05)}
                    {inputWrapStep3Agriculture(agricultureIrrigationPluie, setAgricultureIrrigationPluie, t('agricultureMixte'), 0.075)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      );
    }

    // Step 4 - Créances (Argent qu'on vous doit) - design Figma
    if (currentStep === 4) {
      const toggleAccordionStep4 = (key: AccordionKeyStep4) => setOpenAccordionStep4((prev) => (prev === key ? null : key));
      const inputBase = 'w-full bg-[#101919] text-white text-sm border border-white/10 rounded-lg p-3 focus:outline-none focus:border-[#43B48F] pr-16';
      const inputWrapStep4 = (s: string, set: (v: string) => void, label: string) => (
        <div className="space-y-1">
          <label className="text-white/80 text-xs sm:text-sm">{label}</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={s}
              onChange={(e) => set(onlyDigits(e.target.value))}
              className={inputBase}
              placeholder="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5ab678] font-bold text-xs">XOF</span>
          </div>
        </div>
      );

      return (
        <div className="space-y-4 sm:space-y-6">
          {/* Barre de progression 80% */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">{t('progression')}</span>
              <span className="text-white font-medium">80%</span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(to right, #3AE1B4, #13A98B)' }}
                initial={{ width: 0 }}
                animate={{ width: '80%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Section Créances (Argent qu'on vous doit) */}
          <div ref={infoPopoverRef} className="relative flex items-center gap-2">
            <h3 className="text-white font-bold text-base sm:text-lg">
              {t('section4Title')}
            </h3>
            <motion.button
              type="button"
              onClick={() => setInfoPopoverStep((prev) => (prev === 4 ? null : 4))}
              className="text-[#43B48F] hover:opacity-80 shrink-0"
              aria-label={t('showInfo')}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Info size={18} />
            </motion.button>
            <AnimatePresence>
              {infoPopoverStep === 4 && stepInfo[4] && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 z-20 w-[min(100%,360px)] max-h-[70vh] overflow-y-auto rounded-xl border border-white/20 bg-[#0F1F1F] p-4 shadow-xl"
                >
                  <p className="text-[#5ab678] font-semibold text-sm mb-3">{stepInfo[4].title}</p>
                  {isStepInfoWithSections(stepInfo[4]) ? (
                    <div className="text-white/80 text-xs sm:text-sm space-y-4">
                      {stepInfo[4].sections.map((section, i) => (
                        <div key={i}>
                          <p className="font-semibold text-white/90 mb-1">{section.subtitle}</p>
                          <p className="leading-relaxed">{section.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="text-white/80 text-xs sm:text-sm space-y-2 list-disc list-inside">
                      {'items' in stepInfo[4] && stepInfo[4].items.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordéon - Prêts accordés */}
          <div className="rounded-3xl border border-[#5ab678] overflow-hidden bg-[#101919]/80">
            <button
              type="button"
              onClick={() => toggleAccordionStep4('prets_accordes')}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#101919]/80 flex items-center justify-center">
                  <Image src="/icons/coin.png" alt="" width={20} height={20} className="opacity-90" />
                </div>
                <span className="text-white font-medium">{t('pretsAccordes')}</span>
              </div>
              {openAccordionStep4 === 'prets_accordes' ? <ChevronUp size={20} className="text-[#5ab678]" /> : <ChevronDown size={20} className="text-[#5ab678]" />}
            </button>
            <AnimatePresence>
              {openAccordionStep4 === 'prets_accordes' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-4">
                    {inputWrapStep4(pretsFamilleStep4, setPretsFamilleStep4, t('pretsFamille'))}
                    {inputWrapStep4(pretsAutruiStep4, setPretsAutruiStep4, t('pretsAutrui'))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      );
    }

    // Step 5 - Passif & Dettes (À déduire) - design Figma
    if (currentStep === 5) {
      const toggleAccordionStep5 = (key: AccordionKeyStep5) => setOpenAccordionStep5((prev) => (prev === key ? null : key));
      const inputBase = 'w-full bg-[#101919] text-white text-sm border border-white/10 rounded-lg p-3 focus:outline-none focus:border-[#43B48F] pr-16';
      const inputWrapStep5 = (s: string, set: (v: string) => void, label: string) => (
        <div className="space-y-1">
          <label className="text-white/80 text-xs sm:text-sm">{label}</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={s}
              onChange={(e) => set(onlyDigits(e.target.value))}
              className={inputBase}
              placeholder="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5ab678] text-xs font-bold">XOF</span>
          </div>
        </div>
      );

      return (
        <div className="space-y-4 sm:space-y-6">
          {/* Barre de progression 100% */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">{t('progression')}</span>
              <span className="text-white font-medium">100%</span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(to right, #3AE1B4, #13A98B)' }}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Section Passif & Dettes (À déduire) */}
          <div ref={infoPopoverRef} className="relative flex items-center gap-2">
            <h3 className="text-white font-bold text-base sm:text-lg">
              {t('section5Title')}
            </h3>
            <motion.button
              type="button"
              onClick={() => setInfoPopoverStep((prev) => (prev === 5 ? null : 5))}
              className="text-[#43B48F] hover:opacity-80 shrink-0"
              aria-label={t('showInfo')}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Info size={18} />
            </motion.button>
            <AnimatePresence>
              {infoPopoverStep === 5 && stepInfo[5] && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 z-20 w-[min(100%,360px)] max-h-[70vh] overflow-y-auto rounded-xl border border-white/20 bg-[#0F1F1F] p-4 shadow-xl"
                >
                  <p className="text-[#5ab678] font-semibold text-sm mb-3">{stepInfo[5].title}</p>
                  {isStepInfoWithSections(stepInfo[5]) ? (
                    <div className="text-white/80 text-xs sm:text-sm space-y-4">
                      {stepInfo[5].sections.map((section, i) => (
                        <div key={i}>
                          <p className="font-semibold text-white/90 mb-1">{section.subtitle}</p>
                          <p className="leading-relaxed">{section.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="text-white/80 text-xs sm:text-sm space-y-2 list-disc list-inside">
                      {'items' in stepInfo[5] && stepInfo[5].items.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordéon 1 - Dettes personnelles */}
          <div className="rounded-3xl border border-[#5ab678] overflow-hidden bg-[#101919]/80">
            <button
              type="button"
              onClick={() => toggleAccordionStep5('dettes_personnelles')}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#101919]/80 flex items-center justify-center">
                  <Image src="/icons/status-up.png" alt="" width={20} height={20} className="opacity-90" />
                </div>
                <span className="text-white font-medium">{t('dettesPersonnelles')}</span>
              </div>
              {openAccordionStep5 === 'dettes_personnelles' ? <ChevronUp size={20} className="text-[#5ab678]" /> : <ChevronDown size={20} className="text-[#5ab678]" />}
            </button>
            <AnimatePresence>
              {openAccordionStep5 === 'dettes_personnelles' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-4">
                    {inputWrapStep5(dettesCartesCredit, setDettesCartesCredit, t('cartesCredit'))}
                    {inputWrapStep5(dettesFamille, setDettesFamille, t('dettesFamille'))}
                    {inputWrapStep5(dettesAutrui, setDettesAutrui, t('dettesAutrui'))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordéon 2 - Prêts longs termes */}
          <div className="rounded-3xl border border-[#5ab678] overflow-hidden bg-[#101919]/80">
            <button
              type="button"
              onClick={() => toggleAccordionStep5('prets_long_termes')}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#101919]/80 flex items-center justify-center">
                  <Image src="/icons/trend-up.png" alt="" width={20} height={20} className="opacity-90" />
                </div>
                <span className="text-white font-medium">{t('pretsLongTermes')}</span>
              </div>
              {openAccordionStep5 === 'prets_long_termes' ? <ChevronUp size={20} className="text-[#5ab678]" /> : <ChevronDown size={20} className="text-[#5ab678]" />}
            </button>
            <AnimatePresence>
              {openAccordionStep5 === 'prets_long_termes' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-4">
                    {inputWrapStep5(pretsImmo, setPretsImmo, t('pretsImmo'))}
                    {inputWrapStep5(pretsAuto, setPretsAuto, t('pretsAuto'))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordéon 3 - Professionnel */}
          <div className="rounded-3xl border border-[#5ab678] overflow-hidden bg-[#101919]/80">
            <button
              type="button"
              onClick={() => toggleAccordionStep5('professionnel')}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#101919]/80 flex items-center justify-center">
                  <Image src="/icons/hashtag.png" alt="" width={20} height={20} className="opacity-90" />
                </div>
                <span className="text-white font-medium">{t('professionnel')}</span>
              </div>
              {openAccordionStep5 === 'professionnel' ? <ChevronUp size={20} className="text-[#5ab678]" /> : <ChevronDown size={20} className="text-[#5ab678]" />}
            </button>
            <AnimatePresence>
              {openAccordionStep5 === 'professionnel' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 border-t border-white/10 pt-4">
                    {inputWrapStep5(fraisPro, setFraisPro, t('fraisPro'))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      );
    }

    // Step 6 - Confirmation (récap + Sauvegarder) — valeurs identiques à celles envoyées
    if (currentStep === 6) {
      const { totalAmount, remainingAmount } = getConfirmationValues();
      const totalSansAgriculture = calculateTotalAssetsSansAgriculture();
      const zakatAgriculture = calculateZakatAgriculture();
      const isAgricultureOnly = isAgricultureOnlyCase();

      return (
        <div className="space-y-3 sm:space-y-4">
          {submitError && (
            <p className="text-red-400 text-sm bg-red-400/10 rounded-lg p-3" role="alert">
              {submitError}
            </p>
          )}
          {/* Montant total des biens (valeur envoyée en totalAmount) */}
          <div className="bg-[#101919] rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
              <span className="text-white font-medium text-sm sm:text-lg">
                {t('totalAssets')}
              </span>
              <div className="text-left sm:text-right">
                <span className="text-white font-bold text-base sm:text-lg">
                  {formatAmount(totalAmount)}
                </span>
                <span className="text-white ml-2 text-sm sm:text-base">F CFA</span>
              </div>
            </div>
          </div>

          {/* Zakat à payer (valeur envoyée en remainingAmount) */}
          <div className="bg-[#101919] rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
              <span className="text-white font-medium text-sm sm:text-lg">
                {t('zakatToPay')}
              </span>
              <div className="text-left sm:text-right">
                <span 
                  className="font-bold text-base sm:text-lg"
                  style={{ color: '#8DD17F' }}
                >
                  {formatAmount(remainingAmount)}
                </span>
                <span className="text-white ml-2 text-sm sm:text-base">F CFA</span>
              </div>
            </div>
            {zakatAgriculture > 0 && !isAgricultureOnly && (
              <p className="text-white/60 text-xs mt-2">
                {t('includesAgriculture')}
              </p>
            )}
          </div>

          {/* Ligne Nissab (node-id=77672-20992) — la logique du montant sera accordée ultérieurement */}
          <div className="space-y-2">
            <div className="bg-[#1D3B39] rounded-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium text-sm sm:text-lg">{t('nissab')}</span>
                <motion.button
                  type="button"
                  onClick={() => setShowNissabInfo((prev) => !prev)}
                  className="text-[#43B48F] hover:opacity-80 shrink-0"
                  aria-label={t('nissabAria')}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Info size={18} />
                </motion.button>
              </div>
              <div className="text-left sm:text-right">
                {/* TODO: brancher le calcul du Nissab (seuil minimal d’assujettissement à la Zakat) */}
                {nissabLoading ? (
                  <span className="text-white/70 text-sm">{t('nissabLoading')}</span>
                ) : (
                  <>
                    <span className="text-white font-bold text-base sm:text-lg">{formatAmount(nissabAmount)}</span>
                    <span className="text-white ml-2 text-sm sm:text-base">F CFA</span>
                  </>
                )}
              </div>
            </div>
            </div>
            <AnimatePresence>
              {showNissabInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-lg bg-[#0F1F1F]/90 border border-white/10 p-3">
                    <div className="flex items-start gap-2">
                      <Info size={16} className="text-[#5ab678] flex-shrink-0 mt-0.5" />
                      <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                        {t('infoNissab')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cas agriculture seule : total hors agriculture < nissab mais zakat agricole enregistrable */}
          {isAgricultureOnly && (
            <div className="rounded-xl p-4 sm:p-6 bg-[#43B48F]/10 border border-[#43B48F]/30 space-y-3">
              <p className="text-[#8DD17F] text-sm sm:text-base">
                {t('agricultureOnlyMessage', { total: formatAmount(totalSansAgriculture), nissab: formatAmount(nissabAmount) })}
              </p>
              <p className="text-white/80 text-sm">
                {t('agricultureOnlyNote', { amount: formatAmount(remainingAmount) })}
              </p>
            </div>
          )}

          {/* Message si montant total < nissab et pas d'agriculture : pas zakatable, proposer sadaqah */}
          {!nissabLoading && calculateTotalAssets() < nissabAmount && !isAgricultureOnly && (
            <div className="rounded-xl p-4 sm:p-6 bg-amber-500/10 border border-amber-500/30 space-y-3">
              <p className="text-amber-200 text-sm sm:text-base">
                {t('belowNissabMessage')}
              </p>
              <p className="text-white/80 text-sm">
                {t('belowNissabSadaqahBefore')}
                <Link href="/campagnes" className="text-[#43B48F] font-bold underline-offset-2 underline" onClick={handleClose}>sadaqah</Link>
                {t('belowNissabSadaqahAfter')}
              </p>
            </div>
          )}
        </div>
      );
    }

    // Pour les autres étapes (à implémenter plus tard)
    return (
      <div className="space-y-6">
        <h3 className="text-white font-bold text-lg">
          {t('stepContentFallback', { step: currentStep, label: STEPS[currentStep - 1].label })}
        </h3>
        <p className="text-gray-400">{t('contentComing')}</p>
      </div>
    );
  };

  // Bloquer la sauvegarde si total < nissab, SAUF cas agriculture seule (où la zakat agricole est enregistrable)
  const isBelowNissab =
    currentStep === 6 &&
    !nissabLoading &&
    calculateTotalAssets() < nissabAmount &&
    !isAgricultureOnlyCase();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-[#101919]/20 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4 overflow-x-hidden overflow-y-auto"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#101919] rounded-none sm:rounded-2xl w-full max-w-full h-full sm:min-h-0 sm:max-h-[90vh] sm:max-w-5xl overflow-hidden relative border-0 sm:border border-white/10 flex flex-col min-w-0"
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 bg-[#8DD17F] rounded-full flex items-center justify-center hover:bg-[#7BC16F] transition-colors z-10"
                aria-label={t('close')}
              >
                <X size={18} className="sm:w-5 sm:h-5 text-[#101919]" />
              </button>

              <div className="flex flex-col sm:flex-row flex-1 min-h-0 min-w-0 overflow-hidden">
                {/* Barre latérale gauche - Étapes (cachée sur mobile) */}
                <div className="hidden sm:block w-full sm:w-1/4 bg-[#0A1515] border-r border-white/10 p-4 sm:p-6">
                  <div className="space-y-6">
                    {STEPS.map((step, index) => {
                      const isActive = currentStep === step.id;
                      const isCompleted = currentStep > step.id;
                      
                      return (
                        <div key={step.id} className="relative">
                          {/* Ligne de connexion */}
                          {index < STEPS.length - 1 && (
                            <div
                              className="absolute left-4 top-12 h-12"
                              style={{
                                width: '2px',
                                borderLeft: `2px dashed ${isCompleted || isActive ? '#8DD17F' : '#4B5563'}`,
                              }}
                            />
                          )}
                          
                          {/* Cercle de l'étape */}
                          <div className={`flex items-start space-x-4 ${isActive ? 'bg-[#1A2A28] rounded-lg p-2 -mx-2' : ''}`}>
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                                isActive
                                  ? 'bg-[#8DD17F] text-[#101919]'
                                  : isCompleted
                                  ? 'bg-[#8DD17F] text-[#101919]'
                                  : 'bg-gray-600 text-gray-400'
                              }`}
                            >
                              {step.id}
                            </div>
                            <div className="flex-1">
                              <p
                                className={`font-medium text-sm sm:text-base ${
                                  isActive
                                    ? 'text-white font-bold'
                                    : isCompleted
                                    ? 'text-white'
                                    : 'text-gray-400'
                                }`}
                              >
                                {step.label}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section principale - Contenu */}
                <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
                  {/* En-tête */}
                  <div className="flex-shrink-0 p-4 sm:p-8 border-b border-white/10">
                    <h2 className="text-white font-bold text-xl sm:text-2xl mb-2">
                      {t('title')}
                    </h2>
                    <p className="text-white font-medium mb-1 text-sm sm:text-base">
                      {currentStep === 1 ? t('step1') : STEPS[currentStep - 1]?.label ?? ''}
                    </p>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      {t('subtitle')}
                    </p>
                    
                    {/* Indicateur d'étapes mobile */}
                    <div className="sm:hidden mt-4 flex items-center justify-between">
                      {STEPS.map((step, index) => {
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;
                        
                        return (
                          <div key={step.id} className="flex items-center flex-1">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                                isActive
                                  ? 'bg-[#8DD17F] text-[#101919]'
                                  : isCompleted
                                  ? 'bg-[#8DD17F] text-[#101919]'
                                  : 'bg-gray-600 text-gray-400'
                              }`}
                            >
                              {step.id}
                            </div>
                            {index < STEPS.length - 1 && (
                              <div
                                className="flex-1 h-0.5 mx-2"
                                style={{
                                  backgroundColor: isCompleted ? '#8DD17F' : '#4B5563',
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Contenu de l'étape (scrollable) */}
                  <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden p-4 sm:p-8 custom-scrollbar">
                    <div className="bg-[#00644d]/10 rounded-xl sm:rounded-2xl p-4 sm:p-8">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentStep}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          {renderStepContent()}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                  <style>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: #0A1515; border-radius: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #43B48F; border-radius: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #5AB678; }
                  `}</style>

                  {/* Boutons d'action — sur mobile : remontés et plus compacts */}
                  <div className="flex-shrink-0 px-4 py-2 sm:p-8 border-t border-white/10 flex flex-col sm:flex-row gap-2 sm:gap-4 sm:mx-6">
                    <button
                      onClick={handleBack}
                      className="w-full sm:flex-1 py-2 px-4 sm:py-4 sm:px-6 rounded-2xl sm:rounded-3xl bg-[#1F2A28] text-white font-medium hover:bg-[#2A3A38] transition-colors text-xs sm:text-base flex items-center justify-center gap-1.5 sm:space-x-2"
                    >
                      <ChevronLeft size={16} className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                      <span>{t('previous')}</span>
                    </button>
                    <button
                      onClick={currentStep === STEPS.length ? handleSave : handleNext}
                      disabled={submitLoading || isBelowNissab}
                      className="w-full sm:flex-1 py-2 px-4 sm:py-4 sm:px-6 rounded-2xl sm:rounded-3xl text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:space-x-2 text-xs sm:text-base"
                      style={{
                        background: 'linear-gradient(90deg, #8FC99E 0%, #20B6B3 100%)'
                      }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.background = 'linear-gradient(90deg, #7BC16F 0%, #1BA5A2 100%)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.background = 'linear-gradient(90deg, #8FC99E 0%, #20B6B3 100%)';
                        }
                      }}
                    >
                      <span>
                        {currentStep === STEPS.length
                          ? submitLoading
                            ? t('creating')
                            : t('save')
                          : t('next')}
                      </span>
                      {currentStep !== STEPS.length && <ChevronRight size={16} className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
