export const queryKeys = {
  user: ['user'] as const,
  subscription: ['subscription'] as const,
  trainers: {
    all: ['trainers'] as const,
    detail: (id: string) => ['trainers', id] as const,
  },
  exercises: {
    detail: (id: number, type?: string) => ['exercises', id, type] as const,
  },
  invoices: {
    all: ['invoices'] as const,
    types: ['invoices', 'types'] as const,
  },
  events: {
    types: ['events', 'types'] as const,
  },
};
