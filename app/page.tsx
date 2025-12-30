import TaskList from "@/components/TaskList";

export default function Page() {
  return (
    <div className="space-y-8">
      <section className="card">
        <h2 className="text-heading-3 text-brand-text">Inbox</h2>
        <p className="mt-2 text-sm font-rubik text-brand-text/70 font-light">
          Tasks captured by voice + API should show up here.
        </p>
      </section>

      <TaskList />
    </div>
  );
}

