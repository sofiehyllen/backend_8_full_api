// The salary rule, from the structured API exercises. Given to you.
// A new salary may be at most 10% above the current one.

import { Instructor, find, updateSalary } from '../data/instructors.js';

export type SalaryChange =
  | { ok: true; instructor: Instructor }
  | { ok: false; reason: 'not-found' | 'raise-too-large' };

const MAX_RAISE = 0.10;

export async function changeSalary(id: string, salary: number): Promise<SalaryChange> {
  const current = await find(id);
  if (current === undefined) {
    return { ok: false, reason: 'not-found' };
  }
  if (salary > current.salary * (1 + MAX_RAISE)) {
    return { ok: false, reason: 'raise-too-large' };
  }
  const updated = await updateSalary(id, salary);
  if (updated === undefined) {
    // deleted between the two calls
    return { ok: false, reason: 'not-found' };
  }
  return { ok: true, instructor: updated };
}
