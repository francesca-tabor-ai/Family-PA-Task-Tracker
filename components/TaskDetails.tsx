"use client";

import { useState, useEffect } from "react";
import type { Task, TaskStatus } from "@/lib/types/task";
import type { Person } from "@/lib/types/person";
import type { Category } from "@/lib/types/category";

interface TaskDetailsProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
}

export default function TaskDetails({ task, isOpen, onClose, onSave }: TaskDetailsProps) {
  const [formData, setFormData] = useState<Task | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [searchPeople, setSearchPeople] = useState("");
  const [searchCategories, setSearchCategories] = useState("");

  // Load people and categories on mount
  useEffect(() => {
    if (isOpen) {
      fetchPeople();
      fetchCategories();
    }
  }, [isOpen]);

  // Update form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({ ...task });
      setHasChanges(false);
    }
  }, [task]);

  async function fetchPeople() {
    try {
      const response = await fetch('/api/people');
      if (response.ok) {
        const data = await response.json();
        setPeople(data);
      }
    } catch (error) {
      console.error('Error fetching people:', error);
    }
  }

  async function fetchCategories() {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  async function handleSave() {
    if (!formData) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/tasks/${formData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          status: formData.status,
          people: formData.people,
          categories: formData.categories,
          dueDate: formData.dueDate,
          scheduledFor: formData.scheduledFor,
          highRisk: formData.highRisk,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save task');
      }

      const updatedTask: Task = await response.json();
      onSave(updatedTask);
      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleChange(field: keyof Task, value: unknown) {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
  }

  function togglePerson(personId: string) {
    if (!formData) return;
    const currentPeople = formData.people || [];
    const newPeople = currentPeople.includes(personId)
      ? currentPeople.filter(id => id !== personId)
      : [...currentPeople, personId];
    handleChange('people', newPeople);
  }

  function toggleCategory(categoryPath: string) {
    if (!formData) return;
    const currentCategories = formData.categories || [];
    const newCategories = currentCategories.includes(categoryPath)
      ? currentCategories.filter(path => path !== categoryPath)
      : [...currentCategories, categoryPath];
    handleChange('categories', newCategories);
  }

  function handleClose() {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Do you want to save before closing?')) {
        handleSave();
      } else {
        setHasChanges(false);
        onClose();
      }
    } else {
      onClose();
    }
  }

  if (!isOpen || !formData) return null;

  const filteredPeople = people.filter(p =>
    p.name.toLowerCase().includes(searchPeople.toLowerCase())
  );

  const filteredCategories = categories.filter(c =>
    c.path.toLowerCase().includes(searchCategories.toLowerCase())
  );

  const statusOptions: TaskStatus[] = ['inbox', 'waiting', 'scheduled', 'in_progress', 'completed', 'delegated'];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:max-w-2xl bg-white shadow-xl z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-button-light">
          <h2 className="text-heading-3 text-brand-text">Task Details</h2>
          <button
            onClick={handleClose}
            className="text-brand-text/60 hover:text-brand-text transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-rubik font-medium text-brand-text mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full rounded-button border border-brand-button-dark bg-white px-4 py-3 text-base font-rubik text-brand-text outline-none transition-all duration-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
              placeholder="Task title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-rubik font-medium text-brand-text mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full rounded-button border border-brand-button-dark bg-white px-4 py-3 text-base font-rubik text-brand-text outline-none transition-all duration-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary resize-none"
              placeholder="Add details, notes, or context..."
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-rubik font-medium text-brand-text mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value as TaskStatus)}
              className="w-full rounded-button border border-brand-button-dark bg-white px-4 py-3 text-base font-rubik text-brand-text outline-none transition-all duration-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* People */}
          <div>
            <label className="block text-sm font-rubik font-medium text-brand-text mb-2">
              People
            </label>
            
            {/* Selected People as Chips */}
            {formData.people && formData.people.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.people.map((personId) => {
                  const person = people.find(p => p.id === personId);
                  if (!person) return null;
                  return (
                    <span
                      key={personId}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-button-light border border-brand-button-dark text-sm font-rubik text-brand-text"
                    >
                      <span>{person.name}</span>
                      <span className="text-xs text-brand-text/50">({person.group})</span>
                      <button
                        type="button"
                        onClick={() => togglePerson(personId)}
                        className="text-brand-text/60 hover:text-brand-text transition-colors"
                        aria-label={`Remove ${person.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Search Input */}
            <input
              type="text"
              value={searchPeople}
              onChange={(e) => setSearchPeople(e.target.value)}
              placeholder="Search people..."
              className="w-full rounded-button border border-brand-button-dark bg-white px-4 py-3 text-sm font-rubik text-brand-text outline-none transition-all duration-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary mb-2"
            />
            
            {/* People List */}
            <div className="max-h-40 overflow-y-auto border border-brand-button-light rounded-button p-2 space-y-1">
              {filteredPeople.length === 0 ? (
                <p className="text-sm font-rubik text-brand-text/60 p-2">No people found</p>
              ) : (
                filteredPeople
                  .filter(person => !formData.people?.includes(person.id)) // Hide already selected
                  .map(person => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => togglePerson(person.id)}
                      className="w-full text-left flex items-center gap-2 p-2 rounded-button hover:bg-brand-button-light cursor-pointer transition-colors"
                    >
                      <svg 
                        className="w-4 h-4 text-brand-text/40" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="text-sm font-rubik text-brand-text">{person.name}</span>
                      <span className="text-xs font-rubik text-brand-text/50">({person.group})</span>
                    </button>
                  ))
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-rubik font-medium text-brand-text mb-2">
              Categories
            </label>
            
            {/* Selected Categories as Chips */}
            {formData.categories && formData.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.categories.map((categoryPath) => (
                  <span
                    key={categoryPath}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-button-light border border-brand-button-dark text-sm font-rubik text-brand-text"
                  >
                    <span>{categoryPath}</span>
                    <button
                      type="button"
                      onClick={() => toggleCategory(categoryPath)}
                      className="text-brand-text/60 hover:text-brand-text transition-colors"
                      aria-label={`Remove ${categoryPath}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search Input */}
            <input
              type="text"
              value={searchCategories}
              onChange={(e) => setSearchCategories(e.target.value)}
              placeholder="Search categories..."
              className="w-full rounded-button border border-brand-button-dark bg-white px-4 py-3 text-sm font-rubik text-brand-text outline-none transition-all duration-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary mb-2"
            />
            
            {/* Category List */}
            <div className="max-h-40 overflow-y-auto border border-brand-button-light rounded-button p-2 space-y-1">
              {filteredCategories.length === 0 ? (
                <p className="text-sm font-rubik text-brand-text/60 p-2">No categories found</p>
              ) : (
                filteredCategories
                  .filter(category => !formData.categories?.includes(category.path)) // Hide already selected
                  .map(category => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleCategory(category.path)}
                      className="w-full text-left flex items-center gap-2 p-2 rounded-button hover:bg-brand-button-light cursor-pointer transition-colors"
                    >
                      <svg 
                        className="w-4 h-4 text-brand-text/40" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="text-sm font-rubik text-brand-text">{category.path}</span>
                    </button>
                  ))
              )}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-rubik font-medium text-brand-text mb-2">
              Due Date
            </label>
            <input
              type="datetime-local"
              value={formData.dueDate ? new Date(formData.dueDate).toISOString().slice(0, 16) : ''}
              onChange={(e) => handleChange('dueDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
              className="w-full rounded-button border border-brand-button-dark bg-white px-4 py-3 text-base font-rubik text-brand-text outline-none transition-all duration-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>

          {/* Scheduled For */}
          <div>
            <label className="block text-sm font-rubik font-medium text-brand-text mb-2">
              Scheduled For
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledFor ? new Date(formData.scheduledFor).toISOString().slice(0, 16) : ''}
              onChange={(e) => handleChange('scheduledFor', e.target.value ? new Date(e.target.value).toISOString() : null)}
              className="w-full rounded-button border border-brand-button-dark bg-white px-4 py-3 text-base font-rubik text-brand-text outline-none transition-all duration-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>

          {/* High Risk Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="highRisk"
              checked={formData.highRisk}
              onChange={(e) => handleChange('highRisk', e.target.checked)}
              className="w-5 h-5 rounded border-brand-button-dark text-brand-primary focus:ring-brand-primary"
            />
            <label htmlFor="highRisk" className="text-sm font-rubik font-medium text-brand-text cursor-pointer">
              High Risk / Time-Sensitive
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-brand-button-light bg-white">
          <div className="text-xs font-rubik text-brand-text/60">
            {hasChanges && <span className="text-brand-text/80">Unsaved changes</span>}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="btn btn-ghost font-rubik"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="btn btn-primary-action font-rubik font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

