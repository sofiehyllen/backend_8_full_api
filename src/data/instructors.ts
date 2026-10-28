// The data access module for instructors. Given to you, and worth reading:
// data/departments.ts, which you write in Task 1, should look like it.
//
// Nothing here knows about HTTP. No status codes, no req, no res.

import { PoolClient } from 'pg';
import { pool } from '../db.js';

export interface Instructor {
  id: string;
  name: string;
  deptName: string;
  salary: number;
}

const SELECT = `
  SELECT id, name, dept_name AS "deptName", salary::float8 AS salary
  FROM instructor`;

/** A page of instructors, optionally of one department only. */
export async function list(
  deptName: string | undefined, limit: number, offset: number): Promise<Instructor[]> {
  if (deptName === undefined) {
    const { rows } = await pool.query<Instructor>(
      `${SELECT} ORDER BY id LIMIT $1 OFFSET $2`, [limit, offset]);
    return rows;
  }
  const { rows } = await pool.query<Instructor>(
    `${SELECT} WHERE dept_name = $1 ORDER BY id LIMIT $2 OFFSET $3`,
    [deptName, limit, offset]);
  return rows;
}

/** How many there are in all, for the total in a paged answer. */
export async function count(deptName: string | undefined): Promise<number> {
  if (deptName === undefined) {
    const { rows } = await pool.query<{ total: number }>(
      'SELECT count(*)::int AS total FROM instructor');
    return rows[0].total;
  }
  const { rows } = await pool.query<{ total: number }>(
    'SELECT count(*)::int AS total FROM instructor WHERE dept_name = $1', [deptName]);
  return rows[0].total;
}

/** One instructor, or undefined when there is no such id. */
export async function find(id: string): Promise<Instructor | undefined> {
  const { rows } = await pool.query<Instructor>(`${SELECT} WHERE id = $1`, [id]);
  return rows[0];
}

/** Updates the salary and returns the new row, or undefined when missing. */
export async function updateSalary(id: string, salary: number): Promise<Instructor | undefined> {
  const { rows } = await pool.query<Instructor>(`
    UPDATE instructor SET salary = $2 WHERE id = $1
    RETURNING id, name, dept_name AS "deptName", salary::float8 AS salary`,
    [id, salary]);
  return rows[0];
}

/** True when a row was deleted. */
export async function remove(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM instructor WHERE id = $1', [id]);
  return result.rowCount === 1;
}

/**
 * Stores a new instructor. It runs on the client it is given, not on the
 * pool, so that it can be one step of a transaction: see services/hiring.ts.
 */
export async function insertOn(client: PoolClient, instructor: Instructor): Promise<Instructor> {
  const { rows } = await client.query<Instructor>(`
    INSERT INTO instructor (id, name, dept_name, salary)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, dept_name AS "deptName", salary::float8 AS salary`,
    [instructor.id, instructor.name, instructor.deptName, instructor.salary]);
  return rows[0];
}
