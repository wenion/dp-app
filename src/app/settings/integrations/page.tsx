import IntegrationsClient from "./IntegrationsClient";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const from =
    typeof params.from === "string" ? params.from : null;

  const extId =
    typeof params.ext === "string"
      ? params.ext
      : process.env.NEXT_PUBLIC_EXTENSION_ID ?? "";

  return (
    <IntegrationsClient
      from={from}
      extId={extId}
    />
  );
}
