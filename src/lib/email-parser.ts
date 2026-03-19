/**
 * Email parser for OEM reply detection.
 * Extracts status signals, contact info, and key data from email content.
 */

export type OEMResponseType =
  | "proposal"
  | "declined"
  | "question"
  | "interested"
  | "pricing"
  | "capabilities"
  | "unknown";

export interface ParsedOEMEmail {
  senderEmail: string;
  senderName: string;
  senderDomain: string;
  responseType: OEMResponseType;
  suggestedStatus: string;
  contactInfo: {
    name?: string;
    title?: string;
    email?: string;
    phone?: string;
  };
  extractedData: {
    price?: string;
    leadTime?: string;
    capabilities?: string;
    limitations?: string;
  };
  capacityData: {
    kvaMin?: number;
    kvaMax?: number;
    mvaMax?: number;
    voltageMax?: number;
    transformerTypes?: string[];
    limitations?: string[];
  };
  summary: string;
}

// Patterns that indicate a proposal or quote
const PROPOSAL_PATTERNS = [
  /attach(?:ed|ing)\s+(?:a\s+)?(?:our\s+)?(?:the\s+)?proposal/i,
  /(?:here|please find)\s+(?:is|are)\s+(?:our|the|my)\s+(?:proposal|quote|pricing|bid)/i,
  /proposal\s+(?:for|attached|enclosed)/i,
  /quote\s+(?:for|as\s+requested|attached|below)/i,
  /budgetary\s+(?:price|quote|estimate|pricing)/i,
  /unit\s+price/i,
  /(?:FOB|DDP|CIF)\s+price/i,
  /\$[\d,]+(?:\.\d{2})?/,
  /(?:USD|EUR)\s*[\d,]+/i,
];

// Patterns that indicate a decline or no-bid
const DECLINE_PATTERNS = [
  /(?:regret|sorry|unfortunately|apolog)/i,
  /(?:cannot|can't|unable to)\s+(?:bid|quote|provide|build|manufacture|offer)/i,
  /(?:do(?:es)?\s+not|don't|doesn't)\s+(?:have the|manufacture|build|produce|make)/i,
  /no[\s-]?bid/i,
  /(?:decline|pass|not\s+(?:able|interested|capable))/i,
  /(?:outside|beyond|exceed)\s+(?:our|the)\s+(?:capability|capabilities|range|scope)/i,
  /not\s+(?:within|in)\s+our\s+(?:range|capability|scope)/i,
];

// Patterns that indicate interest/engagement
const INTEREST_PATTERNS = [
  /(?:happy|glad|pleased|would love)\s+to\s+(?:help|assist|work|quote|bid|provide)/i,
  /(?:interested|can\s+(?:do|handle|build|manufacture))\s+(?:this|that|it)/i,
  /(?:let's|let us)\s+(?:discuss|schedule|set up|arrange)\s+a?\s*(?:call|meeting)/i,
  /(?:schedule|set up|arrange)\s+a?\s*(?:call|meeting)/i,
  /(?:send|share|provide)\s+(?:us|me)\s+(?:the|more|additional)\s+(?:specs|details|information)/i,
];

// Patterns that indicate questions
const QUESTION_PATTERNS = [
  /\?\s*$/m,
  /(?:could you|can you|would you)\s+(?:clarify|confirm|provide|share|send)/i,
  /(?:what|which|how|when|where)\s+(?:is|are|would|should|do)/i,
  /(?:do you|does the)\s+(?:need|require|want|prefer)/i,
];

// Extract contact info from email signature
const PHONE_REGEX = /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
const TITLE_PATTERNS = [
  /(?:Sales|Business Development|Marketing|Engineering|Technical|Commercial|VP|Director|Manager|President|CEO|COO|CTO|General\s+Manager|Offer Marketing)\s*(?:Manager|Director|VP|Lead|Officer|Representative|Engineer|Specialist)?/i,
];

function detectResponseType(subject: string, body: string): OEMResponseType {
  const combined = `${subject}\n${body}`;

  // Check for proposal/pricing first (highest signal)
  const proposalScore = PROPOSAL_PATTERNS.filter((p) => p.test(combined)).length;
  // Subject containing "proposal" or "quote" is a strong signal
  const subjectHasProposal = /proposal|quote|pricing|bid/i.test(subject);
  const hasAttachment = /\.pdf|attached|attachment|enclosed/i.test(combined);

  if (proposalScore >= 2) return "proposal";
  if (subjectHasProposal && hasAttachment) return "proposal";
  if (subjectHasProposal) return "proposal";
  if (hasAttachment && proposalScore >= 1) return "proposal";

  // Check for decline
  const declineScore = DECLINE_PATTERNS.filter((p) => p.test(combined)).length;
  if (declineScore >= 2) return "declined";
  // Single strong decline signal in short emails
  if (declineScore >= 1 && body.length < 500) return "declined";

  // Check for pricing info (single price mention without proposal language)
  if (proposalScore >= 1) return "pricing";

  // Check for interest
  const interestScore = INTEREST_PATTERNS.filter((p) => p.test(combined)).length;
  if (interestScore >= 1) return "interested";

  // Check for questions
  const questionScore = QUESTION_PATTERNS.filter((p) => p.test(combined)).length;
  if (questionScore >= 2) return "question";

  return "unknown";
}

function mapResponseToStatus(responseType: OEMResponseType): string {
  switch (responseType) {
    case "proposal":
      return "Proposal Received";
    case "declined":
      return "Declined";
    case "interested":
      return "Responded. Coordinating";
    case "pricing":
      return "Responded. Coordinating";
    case "question":
      return "Responded";
    case "capabilities":
      return "Responded";
    case "unknown":
      return "Responded";
  }
}

function extractContactInfo(body: string): ParsedOEMEmail["contactInfo"] {
  const info: ParsedOEMEmail["contactInfo"] = {};

  // Extract phone numbers from signature area (last 20 lines)
  const lines = body.split("\n");
  const signatureArea = lines.slice(-20).join("\n");
  const phones = signatureArea.match(PHONE_REGEX);
  if (phones && phones.length > 0) {
    info.phone = phones[0].trim();
  }

  // Extract title
  for (const pattern of TITLE_PATTERNS) {
    const match = signatureArea.match(pattern);
    if (match) {
      info.title = match[0].trim();
      break;
    }
  }

  return info;
}

function extractData(body: string): ParsedOEMEmail["extractedData"] {
  const data: ParsedOEMEmail["extractedData"] = {};

  // Extract price mentions
  const priceMatch = body.match(/\$[\d,]+(?:\.\d{2})?(?:\s*(?:USD|per\s+unit|each|FOB|DDP))?/i);
  if (priceMatch) data.price = priceMatch[0];

  // Extract lead time
  const leadTimeMatch = body.match(
    /(?:lead\s+time|delivery|production)[\s:]*(?:is\s+)?(?:approximately\s+)?(\d+[-–]\d+|\d+)\s*(?:weeks?|months?|days?|years?)/i
  );
  if (leadTimeMatch) data.leadTime = leadTimeMatch[0];

  // Extract capability limitations
  const limitMatch = body.match(
    /(?:cannot|can't|unable|do not|don't)\s+(?:do|build|manufacture|handle|produce)[^.!?]*[.!?]/i
  );
  if (limitMatch) data.limitations = limitMatch[0].trim();

  // Extract capability statements
  const capMatch = body.match(
    /(?:we|our\s+(?:company|facility|plant))\s+(?:can|do|manufacture|build|produce|specialize)[^.!?]*[.!?]/i
  );
  if (capMatch) data.capabilities = capMatch[0].trim();

  return data;
}

function extractCapacityData(body: string): ParsedOEMEmail["capacityData"] {
  const data: ParsedOEMEmail["capacityData"] = {};
  const lower = body.toLowerCase();

  // Extract kVA ranges: "up to 5000 kVA", "max 2500kva", "500-5000 kVA", "750 kVA and above"
  const kvaPatterns = [
    /(?:up\s+to|max(?:imum)?(?:\s+is)?|max'?s?\s+(?:are|is))\s+(\d[\d,]*)\s*kva/gi,
    /(\d[\d,]*)\s*(?:to|-|–)\s*(\d[\d,]*)\s*kva/gi,
    /(\d[\d,]*)\s*kva\s+(?:max|maximum|and\s+above|and\s+below|or\s+less)/gi,
  ];

  for (const pattern of kvaPatterns) {
    const matches = [...body.matchAll(pattern)];
    for (const m of matches) {
      const v1 = parseInt(m[1]?.replace(/,/g, "") || "0");
      const v2 = m[2] ? parseInt(m[2].replace(/,/g, "")) : undefined;
      if (v2) {
        data.kvaMin = Math.min(v1, v2);
        data.kvaMax = Math.max(v1, v2);
      } else if (v1 > 0) {
        data.kvaMax = v1;
      }
    }
  }

  // Extract MVA: "up to 5MVA", "max 10 MVA", "5MVA"
  const mvaPatterns = [
    /(?:up\s+to|max(?:imum)?(?:\s+is)?|max'?s?\s+(?:are|is))\s+(\d+(?:\.\d+)?)\s*mva/gi,
    /(\d+(?:\.\d+)?)\s*mva/gi,
  ];
  for (const pattern of mvaPatterns) {
    const matches = [...body.matchAll(pattern)];
    for (const m of matches) {
      const v = parseFloat(m[1]);
      if (v > 0) {
        data.mvaMax = v;
        // Also set kVA if not already set
        if (!data.kvaMax) data.kvaMax = v * 1000;
      }
    }
  }

  // Extract voltage: "34.5kv", "up to 34.5 kV", "13.8kV primary"
  const voltagePatterns = [
    /(?:up\s+to|max(?:imum)?)\s+(\d+(?:\.\d+)?)\s*kv/gi,
    /(\d+(?:\.\d+)?)\s*kv(?:\s+(?:primary|secondary|class))?/gi,
  ];
  for (const pattern of voltagePatterns) {
    const matches = [...body.matchAll(pattern)];
    for (const m of matches) {
      const v = parseFloat(m[1]);
      if (v > 0 && (!data.voltageMax || v > data.voltageMax)) {
        data.voltageMax = v;
      }
    }
  }

  // Extract transformer types
  const types: Set<string> = new Set();
  if (/pad[\s-]?mount/i.test(lower)) types.add("Pad-mount");
  if (/dry[\s-]?type/i.test(lower)) types.add("Dry Type");
  if (/oil[\s-]?(?:filled|immersed)/i.test(lower)) types.add("Oil-Immersed");
  if (/liquid[\s-]?(?:filled|immersed)/i.test(lower)) types.add("Liquid-Immersed");
  if (/distribution/i.test(lower)) types.add("Distribution");
  if (/power\s+transformer/i.test(lower)) types.add("Power");
  if (/substation/i.test(lower)) types.add("Substation");
  if (/cast\s+resin/i.test(lower)) types.add("Cast Resin");
  if (/medium\s+voltage/i.test(lower)) types.add("Medium Voltage");
  if (types.size > 0) data.transformerTypes = [...types];

  // Extract limitations
  const limitations: string[] = [];
  const limitPatterns = [
    /too\s+big[^.!?]*[.!?]/i,
    /(?:cannot|can't|unable)\s+(?:do|build|handle|fit)[^.!?]*[.!?]/i,
    /(?:outside|beyond|exceed)\s+(?:our|the)\s+(?:capability|range|scope)[^.!?]*[.!?]/i,
  ];
  for (const p of limitPatterns) {
    const m = body.match(p);
    if (m) limitations.push(m[0].trim());
  }
  if (limitations.length > 0) data.limitations = limitations;

  return data;
}

function generateSummary(
  responseType: OEMResponseType,
  extractedData: ParsedOEMEmail["extractedData"],
  bodyPreview: string
): string {
  const parts: string[] = [];

  switch (responseType) {
    case "proposal":
      parts.push("Sent proposal/quote");
      break;
    case "declined":
      parts.push("Declined/No-bid");
      break;
    case "interested":
      parts.push("Expressed interest");
      break;
    case "pricing":
      parts.push("Shared pricing info");
      break;
    case "question":
      parts.push("Asked questions");
      break;
    default:
      parts.push("Responded");
  }

  if (extractedData.price) parts.push(`Price: ${extractedData.price}`);
  if (extractedData.leadTime) parts.push(`Lead time: ${extractedData.leadTime}`);
  if (extractedData.limitations) parts.push(`Limitation: ${extractedData.limitations.slice(0, 100)}`);

  return parts.join(". ") + ".";
}

export function parseOEMEmail(
  from: string,
  subject: string,
  body: string
): ParsedOEMEmail {
  // Parse sender
  const emailMatch = from.match(/<([^>]+)>/) || from.match(/([\w.+-]+@[\w.-]+\.\w+)/);
  const senderEmail = emailMatch ? emailMatch[1].toLowerCase() : from.toLowerCase();
  const senderName = from.replace(/<[^>]+>/, "").replace(/"/g, "").trim();
  const senderDomain = senderEmail.split("@")[1] || "";

  // Detect response type
  const responseType = detectResponseType(subject, body);
  const suggestedStatus = mapResponseToStatus(responseType);

  // Extract contact info
  const contactInfo = extractContactInfo(body);
  contactInfo.name = senderName || undefined;
  contactInfo.email = senderEmail;

  // Extract data points
  const extractedData = extractData(body);
  const capacityData = extractCapacityData(body);

  // Generate summary
  const summary = generateSummary(responseType, extractedData, body.slice(0, 200));

  return {
    senderEmail,
    senderName,
    senderDomain,
    responseType,
    suggestedStatus,
    contactInfo,
    extractedData,
    capacityData,
    summary,
  };
}
