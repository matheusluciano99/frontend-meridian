import { api } from '@/lib/api';

export interface ClaimBackend {
  id: string;
  claim_number: string;
  policy_id: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid';
  claim_type: string;
  description: string;
  incident_date: string;
  claim_amount: number;
  approved_amount?: number | null;
  documents?: any; // futuro
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClaimUI {
  id: string;
  claimNumber: string;
  policyId: string;
  status: ClaimBackend['status'];
  claimType: string;
  description: string;
  incidentDate: Date;
  claimAmount: number;
  approvedAmount?: number;
  documents: any[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

function mapClaim(c: ClaimBackend): ClaimUI {
  return {
    id: c.id,
    claimNumber: c.claim_number,
    policyId: c.policy_id,
    status: c.status,
    claimType: c.claim_type,
    description: c.description,
    incidentDate: new Date(c.incident_date),
    claimAmount: Number(c.claim_amount),
    approvedAmount: c.approved_amount ? Number(c.approved_amount) : undefined,
    documents: [],
    notes: c.notes || undefined,
    createdAt: new Date(c.created_at),
    updatedAt: new Date(c.updated_at),
  };
}

export class ClaimsService {
  static async list(userId: string): Promise<ClaimUI[]> {
    const data = await api.claims.getAll(userId);
    return data.map(mapClaim);
  }

  static async create(userId: string, input: { policyId: string; claimType: string; description: string; incidentDate: string; claimAmount: number; }) {
    const payload = {
      userId,
      policyId: input.policyId,
      claimType: input.claimType,
      description: input.description,
      incidentDate: input.incidentDate,
      claimAmount: input.claimAmount,
    };
    const created = await api.claims.create(payload);
    return mapClaim(created);
  }
}
