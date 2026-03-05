export interface ProposalProject {
  id: string;
  slug: string;
  customerName: string;
  productDescription: string;
  mvaSize: number | null;
  deliveryDate: string | null;
  deliveryRequirement: string | null;
  location: string;
  zipCode: string;
}

export interface ProposalQuote {
  name: string;
  shortName: string;
  supplierShort: string;
  country: string;
  quotedPrice: number | null;
  ddp: number | null;
  totalPrice: number | null;
  prodLT: number | null;
  shipLT: number | null;
  adLT: number | null;
  totalWeeks: number | null;
  status: string;
  bidSource: string;
  recommended: boolean;
  customerSourced: boolean;
  description: string;
}

export interface ProposalStats {
  totalContacted: number;
  countries: number;
  quotesReceived: number;
  inProcess: number;
  declined: number;
}

export interface CustomerProject {
  id: string;
  slug: string;
  customerName: string;
  productDescription: string;
  mvaSize: number | null;
  deliveryDate: string | null;
  deliveryRequirement: string | null;
  location: string;
  zipCode: string;
  status: string;
}

export interface ProposalData {
  project: ProposalProject;
  quotes: ProposalQuote[];
  stats: ProposalStats;
}
