import TaskList from "@/components/TaskList";

export default function Page() {
  return (
    <div className="space-y-6">
      <section className="card card-elevated">
        <h2 className="text-heading-3 text-brand-text mb-2">Inbox</h2>
        <p className="text-sm font-rubik text-brand-text/70 font-light">
          Tasks captured by voice + API will appear here.
        </p>
      </section>

      <TaskList />
    </div>
  );
}

