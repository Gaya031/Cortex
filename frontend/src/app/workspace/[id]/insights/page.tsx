import InsightsDashboard from "@/components/insights/InsightsDashboard";

export default async function InsightsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <InsightsDashboard workspaceId={id} />;
}
