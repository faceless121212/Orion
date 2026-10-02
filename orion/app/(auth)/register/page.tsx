import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth/register-form";
import { isDemoMode } from "@/lib/demo/mode";

export const metadata: Metadata = { title: "Create account · Orion" };

export default function RegisterPage() {
  if (isDemoMode()) {
    redirect("/login");
  }

  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-semibold text-blue-600">Join your workspace</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Create your Orion account</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">New accounts start with employee access. An administrator can assign agents or promote workspace managers.</p>
      </div>
      <RegisterForm />
    </>
  );
}
