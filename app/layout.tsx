import "./globals.css";

export const metadata = {
  title: "Family PA Task Tracker",
  description: "Simple UI for capturing and tracking family tasks."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-brand-background">
          <header className="border-b border-brand-button-light bg-white">
            <div className="mx-auto max-w-3xl px-4 py-6">
              <h1 className="text-heading-2 text-brand-text">Family PA Task Tracker</h1>
              <p className="mt-2 text-sm font-rubik text-brand-text/70 font-light">
                Add tasks, see what's open, and keep life admin moving.
              </p>
            </div>
          </header>

          <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>

          <footer className="mx-auto max-w-3xl px-4 py-8 bg-white border-t border-brand-button-light">
            <p className="text-xs font-rubik text-brand-text/60 font-light">
              Backend writes should happen via your secured API route (not directly from GPT).
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}

