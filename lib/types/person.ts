// Person Data Model
// Separate Person model for linking to tasks

export type PersonGroup = 
  | 'adult'              // Adult family member
  | 'child'              // Child family member
  | 'pet'                // Family pet
  | 'emergency_contact';  // Emergency contact

export interface Person {
  id: string;                    // UUID
  family_id: string;              // Family this person belongs to
  name: string;                   // Required
  group: PersonGroup;            // Type of person
  notes?: string;                // Optional notes
  createdAt: string;            // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}

// Helper type for creating a new person (omits auto-generated fields)
export type CreatePersonInput = Omit<Person, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;  // Optional, will be generated if not provided
};

// Helper type for updating a person (all fields optional except id)
export type UpdatePersonInput = Partial<Omit<Person, 'id' | 'createdAt' | 'family_id'>> & {
  id: string;
};

