"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type Intervention = {
  _id: string;
  ownerId?: string;
  learnerName: string;
  cohort: string;
  challenge: string;
  interventionPlan: string;
  priority: "low" | "medium" | "high";
  status: "planned" | "in_progress" | "resolved";
  nextReviewDate: string;
};

type FormState = Omit<Intervention, "_id" | "ownerId">;

const initialForm: FormState = {
  learnerName: "",
  cohort: "",
  challenge: "",
  interventionPlan: "",
  priority: "medium",
  status: "planned",
  nextReviewDate: "",
};

type CurrentUser = { userId: string; email: string; role: "mentor" | "admin" };

export default function InterventionsClient({
  initialItems,
  currentUser,
}: {
  initialItems: Intervention[];
  currentUser: CurrentUser;
}) {
  const router = useRouter();
  const [items, setItems] = useState<Intervention[]>(initialItems);
  const [form, setForm] = useState<FormState>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [toast, setToast] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  function showToast(text: string) {
    setToast(text);
    setTimeout(() => setToast(""), 2600);
  }

  function canManageIntervention(item: Intervention) {
    return currentUser.role === "admin" || item.ownerId === currentUser.userId;
  }

  async function refreshData() {
    const response = await fetch("/api/interventions", { cache: "no-store" });
    if (!response.ok) {
      if (response.status === 401) {
        router.push("/login?toast=logout");
        return;
      }
      const data = (await response.json()) as { message?: string };
      throw new Error(data.message ?? "Unable to load interventions.");
    }
    const data = (await response.json()) as Intervention[];
    setItems(data);
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    const endpoint = editingId ? `/api/interventions/${editingId}` : "/api/interventions";
    const method = editingId ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string };
        throw new Error(errorData.message ?? "Save failed.");
      }

      setMessage(editingId ? "Intervention updated." : "Intervention created.");
      showToast(editingId ? "Intervention updated successfully." : "Intervention added to list.");
      resetForm();
      await refreshData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unexpected error.");
    } finally {
      setIsLoading(false);
    }
  }

  function startEdit(item: Intervention) {
    if (!canManageIntervention(item)) {
      setMessage("You can edit only your own interventions.");
      return;
    }

    setEditingId(item._id);
    setForm({
      learnerName: item.learnerName,
      cohort: item.cohort,
      challenge: item.challenge,
      interventionPlan: item.interventionPlan,
      priority: item.priority,
      status: item.status,
      nextReviewDate: item.nextReviewDate,
    });
  }

  async function deleteItem(id: string) {
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/interventions/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message ?? "Delete failed.");
      }

      setMessage("Intervention deleted.");
      showToast("Intervention deleted.");
      if (editingId === id) {
        resetForm();
      }
      await refreshData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unexpected error.");
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login?toast=logout");
    router.refresh();
  }

  return (
    <main className="relative flex w-full flex-col gap-6 px-4 pb-8 pt-0 md:px-8 lg:pb-10">
      {toast ? (
        <div className="fixed right-6 top-6 z-50 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 shadow-lg">
          {toast}
        </div>
      ) : null}
      <div className="pointer-events-none absolute -left-10 top-6 h-32 w-32 rounded-full bg-indigo-300/40 blur-3xl" />
      <div className="pointer-events-none absolute right-8 top-20 h-40 w-40 rounded-full bg-cyan-300/30 blur-3xl" />

      <header className="relative -mx-4 overflow-hidden border-y border-slate-200 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-4 py-6 text-white shadow-md md:-mx-8 md:px-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wide">
            House of Edtech Assignment
          </p>
          <button
            type="button"
            onClick={logout}
            className="relative z-10 rounded-lg border border-white/60 bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/30"
          >
            Logout
          </button>
        </div>
        <h1 className="text-2xl font-bold md:text-3xl">Learner Intervention Tracker</h1>
        <p className="mt-2 max-w-3xl text-sm text-blue-100">
          Logged in as <span className="font-semibold text-white">{currentUser.email}</span> (
          {currentUser.role}). Mentors track at-risk learners, intervention plans, and review cycles.
        </p>
      </header>

      <section className="grid items-start gap-6 lg:grid-cols-[430px_1fr]">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          aria-label="Intervention form"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            {editingId ? "Edit intervention" : "Create intervention"}
          </h2>

          <label className="block text-sm font-medium text-slate-700" htmlFor="learnerName">
            Learner name
          </label>
          <input
            id="learnerName"
            required
            minLength={2}
            value={form.learnerName}
            onChange={(event) => updateField("learnerName", event.target.value)}
            className="w-full rounded-lg border px-3 py-2 outline-none ring-indigo-200 transition focus:ring-2"
          />

          <label className="block text-sm font-medium text-slate-700" htmlFor="cohort">
            Cohort
          </label>
          <input
            id="cohort"
            required
            minLength={2}
            value={form.cohort}
            onChange={(event) => updateField("cohort", event.target.value)}
            className="w-full rounded-lg border px-3 py-2 outline-none ring-indigo-200 transition focus:ring-2"
          />

          <label className="block text-sm font-medium text-slate-700" htmlFor="challenge">
            Learning challenge
          </label>
          <textarea
            id="challenge"
            required
            minLength={10}
            value={form.challenge}
            onChange={(event) => updateField("challenge", event.target.value)}
            className="min-h-24 w-full rounded-lg border px-3 py-2 outline-none ring-indigo-200 transition focus:ring-2"
          />

          <label className="block text-sm font-medium text-slate-700" htmlFor="interventionPlan">
            Intervention plan
          </label>
          <textarea
            id="interventionPlan"
            required
            minLength={10}
            value={form.interventionPlan}
            onChange={(event) => updateField("interventionPlan", event.target.value)}
            className="min-h-24 w-full rounded-lg border px-3 py-2 outline-none ring-indigo-200 transition focus:ring-2"
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="priority">
                Priority
              </label>
              <select
                id="priority"
                value={form.priority}
                onChange={(event) => updateField("priority", event.target.value as FormState["priority"])}
                className="w-full rounded-lg border px-3 py-2 outline-none ring-indigo-200 transition focus:ring-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                value={form.status}
                onChange={(event) => updateField("status", event.target.value as FormState["status"])}
                className="w-full rounded-lg border px-3 py-2 outline-none ring-indigo-200 transition focus:ring-2"
              >
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          <label className="block text-sm font-medium text-slate-700" htmlFor="nextReviewDate">
            Next review date
          </label>
          <input
            id="nextReviewDate"
            type="date"
            required
            value={form.nextReviewDate}
            onChange={(event) => updateField("nextReviewDate", event.target.value)}
            className="w-full rounded-lg border px-3 py-2 outline-none ring-indigo-200 transition focus:ring-2"
          />

          <div className="flex items-center gap-3">
            <button
              disabled={isLoading}
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {editingId ? "Update" : "Create"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
            ) : null}
          </div>
          {message ? <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{message}</p> : null}
        </form>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Interventions</h2>
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-cyan-50 p-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <p className="text-base font-semibold text-slate-800">No interventions yet</p>
              <p className="mt-1 text-sm text-slate-600">
                Create your first intervention from the form to start tracking learner progress.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item._id} className="rounded-xl border border-slate-200 p-4 shadow-sm transition hover:shadow-md">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{item.learnerName}</h3>
                      <p className="text-sm text-slate-600">Cohort: {item.cohort}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={!canManageIntervention(item)}
                        onClick={() => startEdit(item)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={!canManageIntervention(item)}
                        onClick={() => deleteItem(item._id)}
                        className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">
                    <span className="font-medium">Challenge:</span> {item.challenge}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    <span className="font-medium">Plan:</span> {item.interventionPlan}
                  </p>
                  <p className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    Priority: {item.priority} | Status: {item.status.replace("_", " ")} | Review: {item.nextReviewDate}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}
