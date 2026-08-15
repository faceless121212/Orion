import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in · Orion" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-semibold text-blue-600">Welcome back</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Sign in to Orion</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Continue to your agents, missions, and company workspace.</p>
      </div>
      <LoginForm
        confirmationFailed={params.error === "confirmation-failed"}
        profileUnavailable={params.error === "profile-unavailable"}
      />
    </>
  );
}
