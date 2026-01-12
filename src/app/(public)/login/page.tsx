import LoginClient from "./LoginClient";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const from =
    typeof params.from === "string" ? params.from : null;

  const ext =
    typeof params.ext === "string" ? params.ext : null;

  const next =
    from === "extension"
      ? `/settings/integrations?from=extension&ext=${encodeURIComponent(
          ext ?? process.env.NEXT_PUBLIC_EXTENSION_ID ?? ""
        )}`
      : "/";

  return <LoginClient next={next} />;
}
