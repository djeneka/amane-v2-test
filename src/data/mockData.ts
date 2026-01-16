export interface Campaign {
  id: string;
  title: string;
  description: string;
  image: string;
  images?: string[];
  video?: string;
  targetAmount: number;
  currentAmount: number;
  category: 'urgence' | 'education' | 'sante' | 'developpement' | 'refugies';
  location: string;
  endDate: string;
  impact: string;
  beneficiaries: number;
  status: 'active' | 'completed' | 'upcoming';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  points: number;
  totalDonations: number;
  joinDate: string;
  preferences: {
    notifications: boolean;
    newsletter: boolean;
    language: 'fr' | 'en' | 'ar';
  };
}

export interface Transaction {
  id: string;
  type: 'donation' | 'zakat' | 'investment' | 'takaful' | 'deposit';
  amount: number;
  campaignId?: string;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'in_progress';
  fees: number;
  reference: string;
}

export interface TakafulProduct {
  id: string;
  name: string;
  description: string;
  monthlyPremium: number;
  coverage: string;
  features: string[];
  category: 'sante' | 'automobile' | 'habitation' | 'vie';
  image: string;
}

export interface InvestmentProduct {
  id: string;
  name: string;
  description: string;
  expectedReturn: number;
  riskLevel: 'faible' | 'modere' | 'eleve';
  minInvestment: number;
  duration: string;
  category: 'immobilier' | 'agriculture' | 'technologie' | 'energie';
}

export interface SavingsProduct {
  id: string;
  name: string;
  description: string;
  interestRate: number;
  minAmount: number;
  targetAmount: number;
  currentAmount: number;
  duration: string;
  category: 'traditionnel' | 'islamique' | 'objectif' | 'flexible';
  location: string;
  beneficiaries: number;
}

export interface Donation {
  id: string;
  title: string;
  description: string;
  image: string;
  targetAmount: number;
  currentAmount: number;
  category: 'urgence' | 'education' | 'sante' | 'developpement' | 'refugies';
  location: string;
  endDate: string;
  impact: string;
  beneficiaries: number;
  status: 'active' | 'completed' | 'upcoming';
}

// Données fictives
export const campaigns: Campaign[] = [
  {
    id: '1',
    title: 'Aide d\'urgence pour les réfugiés syriens',
    description: 'Soutien vital pour les familles déplacées en Turquie et au Liban',
    image: 'https://images.unsplash.com/photo-1724349620843-99aba60eab8d?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    images: [
      'https://images.unsplash.com/photo-1724349620843-99aba60eab8d?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop'
    ],
    video: 'https://youtu.be/31XuSE4QOl8?si=nEritLEIM3b5rqUj',
    targetAmount: 50000,
    currentAmount: 32450,
    category: 'refugies',
    location: 'Turquie, Liban',
    endDate: '2024-12-31',
    impact: 'Aide alimentaire et médicale pour 500 familles',
    beneficiaries: 2500,
    status: 'active'
  },
  {
    id: '2',
    title: 'Construction d\'une école au Mali',
    description: 'Bâtir l\'avenir avec une école primaire moderne',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=600&fit=crop',
    targetAmount: 75000,
    currentAmount: 45600,
    category: 'education',
    location: 'Mali',
    endDate: '2025-11-30',
    impact: 'Éducation pour 200 enfants',
    beneficiaries: 200,
    status: 'active'
  },
  {
    id: '3',
    title: 'Centre médical mobile au Bangladesh',
    description: 'Soins de santé primaires pour les communautés rurales',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
    targetAmount: 30000,
    currentAmount: 18900,
    category: 'sante',
    location: 'Bangladesh',
    endDate: '2024-10-15',
    impact: 'Soins pour 1000 patients',
    beneficiaries: 1000,
    status: 'active'
  },
  {
    id: '4',
    title: 'Microcrédits pour entrepreneurs',
    description: 'Soutenir les petites entreprises locales',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop',
    targetAmount: 100000,
    currentAmount: 67800,
    category: 'developpement',
    location: 'Sénégal',
    endDate: '2024-12-15',
    impact: 'Soutien à 50 entrepreneurs',
    beneficiaries: 50,
    status: 'active'
  }
];

export const currentUser: User = {
  id: '1',
  name: 'Vadjeneka Meite',
  email: 'vadjeneka.meite@email.com',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  points: 1250,
  totalDonations: 850,
  joinDate: '2023-03-15',
  preferences: {
    notifications: true,
    newsletter: true,
    language: 'fr'
  }
};

export const transactions: Transaction[] = [
  {
    id: '1',
    type: 'donation',
    amount: 100,
    campaignId: '1',
    description: 'Don pour les réfugiés syriens',
    date: '2024-01-15',
    status: 'completed',
    fees: 10,
    reference: '1234567890'
  },
  {
    id: '2',
    type: 'zakat',
    amount: 250,
    description: 'Zakat annuelle',
    date: '2024-01-10',
    status: 'completed',
    fees: 25,
    reference: '1234567890'
  },
  {
    id: '3',
    type: 'investment',
    amount: 500,
    description: 'Investissement immobilier halal',
    date: '2024-01-05',
    status: 'in_progress',
    fees: 50,
    reference: '1234567890'
  },
  {
    id: '4',
    type: 'deposit',
    amount: 500000,
    description: 'Dépôt de 500000 XOF',
    date: '2024-01-05',
    status: 'completed',
    fees: 50,
    reference: '1234567891'
  }
];

export const takafulProducts: TakafulProduct[] = [
  {
    id: '1',
    name: 'Takaful Santé Premium',
    description: 'Couverture santé complète pour toute la famille',
    monthlyPremium: 45,
    coverage: 'Jusqu\'à 50,000XOF par an',
    features: ['Consultations illimitées', 'Hospitalisation', 'Médicaments', 'Chirurgie'],
    category: 'sante',
    image: '/images/voile.png'
  },
  {
    id: '2',
    name: 'Takaful Automobile',
    description: 'Protection complète pour votre véhicule',
    monthlyPremium: 35,
    coverage: 'Valeur du véhicule',
    features: ['Accidents', 'Vol', 'Incendie', 'Assistance routière'],
    category: 'automobile',
    image: '/images/skemoo.png'
  },
  {
    id: '3',
    name: 'Takaful Habitation',
    description: 'Sécurisez votre logement',
    monthlyPremium: 25,
    coverage: 'Valeur du bien',
    features: ['Incendie', 'Vol', 'Dégâts des eaux', 'Responsabilité civile'],
    category: 'habitation',
    image: '/images/img.png'
  }
];

export const investmentProducts: InvestmentProduct[] = [
  {
    id: '1',
    name: 'Fonds Immobilier Éthique',
    description: 'Investissement dans des projets immobiliers halal',
    expectedReturn: 8.5,
    riskLevel: 'modere',
    minInvestment: 1000,
    duration: '5-10 ans',
    category: 'immobilier'
  },
  {
    id: '2',
    name: 'Agriculture Durable',
    description: 'Soutien aux projets agricoles éthiques',
    expectedReturn: 6.2,
    riskLevel: 'faible',
    minInvestment: 500,
    duration: '3-5 ans',
    category: 'agriculture'
  },
  {
    id: '3',
    name: 'Tech Verte',
    description: 'Investissement dans les technologies vertes',
    expectedReturn: 12.0,
    riskLevel: 'eleve',
    minInvestment: 2000,
    duration: '7-12 ans',
    category: 'technologie'
  }
];

export const savingsProducts: SavingsProduct[] = [
  {
    id: '1',
    name: 'Épargne Traditionnelle',
    description: 'Épargne pour l\'éducation et l\'investissement',
    interestRate: 3.5,
    minAmount: 100,
    targetAmount: 10000,
    currentAmount: 5000,
    duration: '5 ans',
    category: 'traditionnel',
    location: 'France',
    beneficiaries: 100,
  },
  {
    id: '2',
    name: 'Takaful Épargne',
    description: 'Épargne islamique avec couverture',
    interestRate: 4.0,
    minAmount: 50,
    targetAmount: 5000,
    currentAmount: 2000,
    duration: '3 ans',
    category: 'islamique',
    location: 'Maroc',
    beneficiaries: 50,
  },
  {
    id: '3',
    name: 'Épargne Objectif',
    description: 'Épargne pour un projet spécifique',
    interestRate: 5.0,
    minAmount: 1000,
    targetAmount: 100000,
    currentAmount: 20000,
    duration: '10 ans',
    category: 'objectif',
    location: 'Tunisie',
    beneficiaries: 10,
  }
];

export const donations: Donation[] = [
  {
    id: '1',
    title: 'Aide d\'urgence pour les réfugiés syriens',
    description: 'Soutien vital pour les familles déplacées en Turquie et au Liban',
    image: '/images/hope.png',
    targetAmount: 50000,
    currentAmount: 32450,
    category: 'refugies',
    location: 'Turquie, Liban',
    endDate: '2024-12-31',
    impact: 'Aide alimentaire et médicale pour 500 familles',
    beneficiaries: 2500,
    status: 'active'
  },
  {
    id: '2',
    title: 'Construction d\'une école au Mali',
    description: 'Bâtir l\'avenir avec une école primaire moderne',
    image: '/images/skemoo.png',
    targetAmount: 75000,
    currentAmount: 45600,
    category: 'education',
    location: 'Mali',
    endDate: '2025-11-30',
    impact: 'Éducation pour 200 enfants',
    beneficiaries: 200,
    status: 'active'
  },
  {
    id: '3',
    title: 'Centre médical mobile au Bangladesh',
    description: 'Soins de santé primaires pour les communautés rurales',
    image: '/images/img.png',
    targetAmount: 30000,
    currentAmount: 18900,
    category: 'sante',
    location: 'Bangladesh',
    endDate: '2024-10-15',
    impact: 'Soins pour 1000 patients',
    beneficiaries: 1000,
    status: 'active'
  },
  {
    id: '4',
    title: 'Microcrédits pour entrepreneurs',
    description: 'Soutenir les petites entreprises locales',
    image: '/images/voile.png',
    targetAmount: 100000,
    currentAmount: 67800,
    category: 'developpement',
    location: 'Sénégal',
    endDate: '2024-12-15',
    impact: 'Soutien à 50 entrepreneurs',
    beneficiaries: 50,
    status: 'active'
  },
  {
    id: '5',
    title: 'Microcrédits pour entrepreneurs',
    description: 'Soutenir les petites entreprises locales',
    image: '/images/skemoo.png',
    targetAmount: 100000,
    currentAmount: 67800,
    category: 'developpement',
    location: 'Sénégal',
    endDate: '2024-12-15',
    impact: 'Soutien à 50 entrepreneurs',
    beneficiaries: 50,
    status: 'active'
  }
];

export const zakatCategories = [
  { name: 'Or et argent', rate: 2.5, description: '2.5% de la valeur totale' },
  { name: 'Épargnes bancaires', rate: 2.5, description: '2.5% du solde' },
  { name: 'Actions et investissements', rate: 2.5, description: '2.5% de la valeur' },
  { name: 'Revenus locatifs', rate: 2.5, description: '2.5% des revenus' },
  { name: 'Commerce', rate: 2.5, description: '2.5% de la valeur des stocks' }
]; 