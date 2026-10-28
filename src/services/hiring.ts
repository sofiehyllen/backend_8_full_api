// Task 1 - hiring an instructor into a department.
//
// This is the layer between the controller and the data layer. It knows
// nothing about HTTP: no req, no res, no status codes. When something is
// wrong it throws NotFound or Conflict, and the error handler turns those
// into 404 and 409.

import { pool } from '../db.js';
import { NotFound, Conflict } from '../middleware/errors.js';
import * as instructors from '../data/instructors.js';
import * as departments from '../data/departments.js';

export interface HireInput {
  id: string;
  name: string;
  salary: number;
}

export interface HireResult {
  instructor: instructors.Instructor;
  budgetLeft: number;
}

/**
 * The rule, in order:
 *   the department must exist                 otherwise NotFound
 *   the id must not be taken                  otherwise Conflict
 *   the salary must be less than the budget   otherwise Conflict
 *   insert the instructor
 *   take the salary off the department's budget
 *
 * The last two steps must both happen, or neither. Take a client from the
 * pool, BEGIN, do both on that client, COMMIT, and ROLLBACK on any error.
 * Release the client in a finally block, or it never goes back to the pool.
 */
export async function hireInstructor(deptName: string, input: HireInput): Promise<HireResult> {
  // TODO
  throw new Error('not implemented');
}
