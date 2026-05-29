import { redirect } from "next/navigation";

import AuthForm from "@/app/auth-form";
import { getCurrentUser } from "@/lib/current-user";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  return (
    <main className="aurora-bg relative flex w-full flex-1 items-center px-4 py-10 md:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-[1.2fr_1fr]">
        <section className="glass-card rounded-2xl border border-white/70 p-7 shadow-lg">
          <p className="mb-4 inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            New Account
          </p>
          <h2 className="text-4xl font-bold leading-tight text-slate-900">
            Start Your
            <span className="block bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              Mentor Journey
            </span>
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Create your secure account to manage learner interventions, prioritize risks, and keep
            every action traceable by role.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-3">
              <p className="text-xs font-semibold text-indigo-700">Fast Setup</p>
              <p className="mt-1 text-sm text-slate-700">Create account in seconds</p>
            </div>
            <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
              <p className="text-xs font-semibold text-cyan-700">Protected Data</p>
              <p className="mt-1 text-sm text-slate-700">Only owners/admin can manage</p>
            </div>
          </div>
        </section>
        <AuthForm mode="register" />
      </div>
    </main>
  );
}
