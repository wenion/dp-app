import VersionEditor from "../version-editor";
export default async function ExtensionVersionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VersionEditor id={id}/>;
}
