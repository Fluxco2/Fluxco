import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import {
  getProjectBySlug,
  getQuotesForProject,
  computeStats,
  getOEMQualityData,
} from "@/lib/notion";
import { ProposalClient } from "./ProposalClient";
import { PasswordGate } from "./PasswordGate";

export const revalidate = 60; // revalidate every 60 seconds

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProposalPage({ params }: Props) {
  const { slug } = await params;

  // Check password cookie
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(`proposal_auth_${slug}`);
  const isAuthenticated = authCookie?.value === "authenticated";

  if (!isAuthenticated) {
    return <PasswordGate slug={slug} />;
  }

  try {
    // Fetch project data from Notion
    const project = await getProjectBySlug(slug);
    if (!project) {
      notFound();
    }

    // Fetch quotes linked to this project
    const quotes = await getQuotesForProject(project.id);
    const stats = computeStats(quotes);

    const oemIds = quotes
      .filter(q => q.recommended && q.oemId)
      .map(q => q.oemId as string);
    const oemQualityData = await getOEMQualityData(oemIds);

    return <ProposalClient project={project} quotes={quotes} stats={stats} oemQualityData={oemQualityData} />;
  } catch (err) {
    console.error("[ProposalPage] Server error for slug:", slug, err);
    throw err;
  }
}
