import ProjectAssistant from "@/components/assistant/ProjectAssistant";

export default async function AssistantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProjectAssistant workspaceId={id} />;
}
