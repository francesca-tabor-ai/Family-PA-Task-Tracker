"use client";

import { useState } from "react";
import type { ViewType, ViewFilter } from "@/lib/utils/task-filters";
import type { Person } from "@/lib/types/person";

interface ViewSelectorProps {
  currentView: ViewFilter;
  onViewChange: (view: ViewFilter) => void;
  people?: Person[];
}

export default function ViewSelector({ currentView, onViewChange, people = [] }: ViewSelectorProps) {
  const [showPersonSelector, setShowPersonSelector] = useState(false);

  const viewTypes: { type: ViewType; label: string }[] = [
    { type: 'all', label: 'All' },
    { type: 'today', label: 'Today' },
    { type: 'upcoming', label: 'Upcoming' },
    { type: 'pending', label: 'Pending' },
    { type: 'high-risk', label: 'High Risk' },
    { type: 'expiring-soon', label: 'Expiring Soon' },
    { type: 'person', label: 'Per Person' },
  ];

  function handleViewTypeChange(type: ViewType) {
    if (type === 'person') {
      setShowPersonSelector(true);
      // If no person selected yet, select first person if available
      if (people.length > 0 && !currentView.personId) {
        onViewChange({ type: 'person', personId: people[0].id });
      } else if (currentView.personId) {
        onViewChange({ type: 'person', personId: currentView.personId });
      }
    } else {
      setShowPersonSelector(false);
      onViewChange({ type, daysAhead: type === 'upcoming' ? 7 : undefined });
    }
  }

  function handlePersonChange(personId: string) {
    onViewChange({ type: 'person', personId });
  }

  const selectedPerson = people.find(p => p.id === currentView.personId);

  return (
    <div className="space-y-4">
      {/* View Type Selector */}
      <div className="flex flex-wrap gap-2">
        {viewTypes.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => handleViewTypeChange(type)}
            className={`px-4 py-2 rounded-button text-sm font-rubik font-medium transition-all duration-200 ${
              currentView.type === type
                ? 'bg-brand-primary text-white shadow-md'
                : 'bg-brand-button-light text-brand-text hover:bg-brand-button-medium border border-brand-button-dark'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Person Selector (shown when "Per Person" is selected) */}
      {currentView.type === 'person' && people.length > 0 && (
        <div>
          <label className="block text-sm font-rubik font-medium text-brand-text mb-2">
            Select Person
          </label>
          <select
            value={currentView.personId || ''}
            onChange={(e) => handlePersonChange(e.target.value)}
            className="w-full sm:w-auto rounded-button border border-brand-button-dark bg-white px-4 py-2 text-sm font-rubik text-brand-text outline-none transition-all duration-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
          >
            <option value="">Select a person...</option>
            {people.map(person => (
              <option key={person.id} value={person.id}>
                {person.name} ({person.group})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Upcoming Days Selector */}
      {currentView.type === 'upcoming' && (
        <div>
          <label className="block text-sm font-rubik font-medium text-brand-text mb-2">
            Days Ahead
          </label>
          <select
            value={currentView.daysAhead || 7}
            onChange={(e) => onViewChange({ ...currentView, daysAhead: parseInt(e.target.value) })}
            className="w-full sm:w-auto rounded-button border border-brand-button-dark bg-white px-4 py-2 text-sm font-rubik text-brand-text outline-none transition-all duration-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
          >
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
        </div>
      )}
    </div>
  );
}

