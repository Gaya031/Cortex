import WorkspaceShell from "@/components/editor/WorkspaceShell";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <WorkspaceShell workspaceId={id} />;
}
