import TaskList from "@/components/TaskList";

export default function Page() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Inbox</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Tasks captured by voice + API should show up here.
        </p>
      </section>

      <TaskList />
    </div>
  );
}

