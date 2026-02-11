import { apiGet, apiPost } from '@/lib/api';

const AID_REQUESTS_URL = '/api/aid-requests';

/** Détails émetteur (typos API conservées) */
export interface AidRequestTransmitterDetails {
  transmitterFirstName?: string;
  tansmitterLastName?: string;
  transmitterCompanyName?: string;
  transamitterCodeId?: string;
}

/** Détails bénéficiaire (typos API conservées) */
export interface AidRequestBeneficiaryDetails {
  beneficiaryFirstName: string;
  beneficiaryLastName: string;
  beneficiaryGender?: string;
  beneficiaryLocation?: string;
  beneficiaryMarialStatus?: string;
  beneficiaryIsMuslim?: boolean;
  numberOfBeneficiaries?: number;
  beneficiaryActivity?: string;
  monthlyIncomeOfBeneficiary?: number;
  beneficiaryShariahEligibity?: string;
  beneficiaryAcceptPicture?: boolean;
}

/** Détails santé */
export interface AidRequestHealthDetails {
  lifeThreateningEmergency?: boolean;
  patientHaveCmuCard?: boolean;
  percentageOfCmuCard?: number;
  quoteIsFromApprovedEstablishment?: boolean;
  establishmentName?: string;
  patientTotalityUnableToPay?: boolean;
  whatPercentage?: number;
  totalQuote?: number;
}

/** Détails éducation */
export interface AidRequestEducationDetails {
  typeOfNeed?: string;
  isStudentRegistered?: boolean;
  riskOfExclusion?: boolean;
  outstandingAmount?: number;
}

/** Détails accompagnement veuves */
export interface AidRequestWidowSupportDetails {
  haveMinorChildren?: boolean;
  numberOfMinorChildren?: number;
  stableAccomodation?: boolean;
  whereSheLives?: string;
  kindOfSupport?: string;
  isDessertIncluded?: boolean;
}

/** Détails habitation / infrastructures (typo API kindOfInsfrastructure) */
export interface AidRequestHabitationDetails {
  kindOfInsfrastructure?: string;
  isCommunityInfrastructure?: boolean;
  landHaveTitleDeedOrAuthorisation?: string;
  isThereManagementCommitteeForFutureMaintenance?: boolean;
  areThereAtLeastTwoConflictingQuotesFromServiceProviders?: boolean;
  whatIsTheQuote?: number;
}

/** Pièce jointe */
export interface AidRequestAttachmentInput {
  type: string;
  url: string;
  label?: string;
}

/** Body pour créer une demande d'aide. POST /api/aid-requests */
export interface CreateAidRequestBody {
  transmitter?: string;
  campaignId?: string;
  campaignCategory?: string;
  urgency?: string;
  transmitterDetails?: AidRequestTransmitterDetails;
  beneficiaryDetails: AidRequestBeneficiaryDetails;
  healthDetails?: AidRequestHealthDetails;
  educationDetails?: AidRequestEducationDetails;
  widowSupportDetails?: AidRequestWidowSupportDetails;
  habitationDetails?: AidRequestHabitationDetails;
  attachments?: AidRequestAttachmentInput[];
}

/** Pièce jointe dans la réponse */
export interface AidRequestAttachment {
  id: string;
  aidRequestId: string;
  type: string;
  url: string;
  label?: string;
  createdAt: string;
}

/** Utilisateur dans la réponse */
export interface AidRequestUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

/** Demande d'aide telle que renvoyée par l'API après création */
export interface AidRequest {
  id: string;
  transmitter: string;
  campaignCategory: string;
  aidRequestStatus: string;
  urgency: string;
  userId: string;
  reviewedById: string | null;
  createdAt: string;
  updatedAt: string;
  transmitterDetails: AidRequestTransmitterDetails & { id: string; aidRequestId: string; createdAt: string; updatedAt: string };
  beneficiaryDetails: AidRequestBeneficiaryDetails & { id: string; aidRequestId: string; createdAt: string; updatedAt: string };
  healthDetails?: (AidRequestHealthDetails & { id: string; aidRequestId: string; createdAt: string; updatedAt: string });
  educationDetails?: (AidRequestEducationDetails & { id: string; aidRequestId: string; createdAt: string; updatedAt: string });
  widowSupportDetails?: (AidRequestWidowSupportDetails & { id: string; aidRequestId: string; createdAt: string; updatedAt: string });
  habitationDetails?: (AidRequestHabitationDetails & { id: string; aidRequestId: string; createdAt: string; updatedAt: string });
  attachments: AidRequestAttachment[];
  user: AidRequestUser;
  reviewedBy: unknown | null;
}

/**
 * Récupère les demandes d'aide du user connecté.
 * GET /api/aid-requests/my
 * @param accessToken - JWT (Bearer)
 * @returns Liste des demandes d'aide de l'utilisateur
 */
export async function getMyAidRequests(accessToken: string): Promise<AidRequest[]> {
  return apiGet<AidRequest[]>(`${AID_REQUESTS_URL}/my`, { token: accessToken });
}

/**
 * Crée une demande d'aide.
 * POST /api/aid-requests
 * @param accessToken - JWT (Bearer)
 * @param body - Données de la demande (transmitter, campaignCategory, urgency, transmitterDetails, beneficiaryDetails, sections optionnelles, attachments)
 * @returns La demande d'aide créée
 */
export async function createAidRequest(
  accessToken: string,
  body: CreateAidRequestBody
): Promise<AidRequest> {
  return apiPost<AidRequest>(AID_REQUESTS_URL, body, { token: accessToken });
}
