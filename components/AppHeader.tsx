"use client";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-button-light bg-white">
      <div className="mx-auto max-w-3xl px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-2 text-brand-text">Family PA Task Tracker</h1>
            <p className="mt-1 text-sm font-rubik text-brand-text/70 font-light">
              Add tasks, see what's open, and keep life admin moving.
            </p>
          </div>
          
          {/* WhatsApp Link - Top Right */}
          <a
            href="https://chat.whatsapp.com/HGu60zYZPYLG6bWGu0qNJ7"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e9f7ef] text-[#128c7e] hover:bg-[#d1f2e5] transition-colors duration-200 text-sm font-rubik font-medium"
            title="Send a voice note to create a task"
          >
            <span className="text-base">🎙️</span>
            <span className="hidden sm:inline">Add tasks via WhatsApp</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
        </div>
      </div>
    </header>
  );
}

