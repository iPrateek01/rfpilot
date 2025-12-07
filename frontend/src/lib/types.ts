export type RFPStatus = 'DRAFT' | 'SENT' | 'RESPONSES_RECEIVED' | 'EVALUATED' | 'AWARDED' | 'CANCELLED';
export type ProposalStatus = 'RECEIVED' | 'PARSING' | 'PARSED' | 'EVALUATED' | 'ACCEPTED' | 'REJECTED';

export interface RFPItem {
  id: string;
  itemType: string;
  description?: string;
  quantity: number;
  specifications?: Record<string, any>;
  unitBudget?: number;
}

export interface RFP {
  id: string;
  title: string;
  description: string;
  rawRequirements: string;
  structuredData?: any;
  budget?: number;
  deadline?: string;
  deliveryDeadline?: string;
  paymentTerms?: string;
  warrantyRequirements?: string;
  additionalTerms?: string;
  status: RFPStatus;
  createdAt: string;
  updatedAt: string;
  items: RFPItem[];
  proposals?: Proposal[];
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  specializations: string[];
  rating?: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalItem {
  id: string;
  itemType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: Record<string, any>;
  notes?: string;
}

export interface Proposal {
  id: string;
  rfpId: string;
  vendorId: string;
  subject?: string;
  rawResponse: string;
  parsedData?: any;
  totalPrice?: number;
  deliveryTimeline?: string;
  paymentTerms?: string;
  warrantyOffered?: string;
  additionalNotes?: string;
  status: ProposalStatus;
  aiScore?: number;
  aiEvaluation?: string;
  complianceScore?: number;
  priceScore?: number;
  termsScore?: number;
  receivedAt: string;
  evaluatedAt?: string;
  vendor: Vendor;
  proposalItems: ProposalItem[];
}

export interface ComparisonData {
  proposals: Proposal[];
  summary: {
    totalProposals: number;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    priceRange: number;
  };
}

export interface Evaluation {
  evaluations: {
    vendorId: string;
    vendorName: string;
    overallScore: number;
    priceScore: number;
    complianceScore: number;
    termsScore: number;
    evaluation: string;
    pros: string[];
    cons: string[];
  }[];
  recommendation: {
    recommendedVendorId: string;
    reasoning: string;
  };
}