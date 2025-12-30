import Dashboard from "@/components/Dashboard";

export default function Page() {
  return (
    <div className="space-y-6">
      <section className="card card-elevated">
        <h2 className="text-heading-3 text-brand-text mb-2">Dashboard</h2>
        <p className="text-sm font-rubik text-brand-text/70 font-light">
          View and manage tasks by different filters and views.
        </p>
      </section>

      <Dashboard />
    </div>
  );
}

