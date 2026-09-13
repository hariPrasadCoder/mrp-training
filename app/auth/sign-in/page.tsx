import { AuthScreen } from "@/components/auth-screen";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string; access?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthScreen
      resetToken={params.token ?? ""}
      resetError={params.error ?? ""}
      accessError={params.access === "denied"}
    />
  );
}
