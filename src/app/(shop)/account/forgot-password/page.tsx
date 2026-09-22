import ForgotPasswordForm from "@/components/account/ForgotPasswordForm";

type Props = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AccountForgotPasswordPage({
  searchParams,
}: Props) {
  const params = await searchParams;
  const initialErrorKey =
    params.error === "recovery" ? "accountAuthRecoveryLinkFailed" : null;

  return (
    <main className="flex min-h-[70vh] items-center px-4 py-10 sm:px-6">
      <ForgotPasswordForm initialErrorKey={initialErrorKey} />
    </main>
  );
}
