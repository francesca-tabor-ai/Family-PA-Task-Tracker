import "./globals.css";

export const metadata = {
  title: "Family PA Task Tracker",
  description: "Simple UI for capturing and tracking family tasks."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-neutral-50 text-neutral-900">
          <header className="border-b bg-white">
            <div className="mx-auto max-w-3xl px-4 py-4">
              <h1 className="text-xl font-semibold">Family PA Task Tracker</h1>
              <p className="text-sm text-neutral-600">
                Add tasks, see what's open, and keep life admin moving.
              </p>
            </div>
          </header>

          <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>

          <footer className="mx-auto max-w-3xl px-4 py-8 text-xs text-neutral-500">
            Backend writes should happen via your secured API route (not directly from GPT).
          </footer>
        </div>
      </body>
    </html>
  );
}

