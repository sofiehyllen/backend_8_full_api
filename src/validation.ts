// Validation in one place, from the structured API exercises. Given to you.

import { HireInput } from './services/hiring.js';

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

/** The salary from a body { "salary": ... }, or undefined when it is not valid. */
export function validateSalary(body: unknown): number | undefined {
  if (body === null || typeof body !== 'object') {
    return undefined;
  }
  const salary = (body as Record<string, unknown>).salary;
  return typeof salary === 'number' && salary > 0 ? salary : undefined;
}

/** The body of a hire { id, name, salary }, or undefined when it is not valid. */
export function validateHire(body: unknown): HireInput | undefined {
  if (body === null || typeof body !== 'object') {
    return undefined;
  }
  const b = body as Record<string, unknown>;
  if (!nonEmpty(b.id) || !nonEmpty(b.name)) {
    return undefined;
  }
  if (typeof b.salary !== 'number' || !(b.salary > 0)) {
    return undefined;
  }
  return { id: b.id, name: b.name, salary: b.salary };
}
