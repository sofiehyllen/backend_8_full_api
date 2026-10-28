// Task 1 - the data access module for departments.
//
// Write it the way data/instructors.ts is written: parameters as $1,
// columns renamed for TypeScript, the numeric budget cast to float8, and
// nothing about HTTP.

import { PoolClient } from 'pg';
import { pool } from '../db.js';

export interface Department {
  deptName: string;
  building: string;
  budget: number;
}

/** Every department, ordered by name. */
export async function list(): Promise<Department[]> {
  const { rows } = await pool.query<Department>(
    `SELECT dept_name AS "deptName",
            building,
            budget::float8
    FROM department
    ORDER BY dept_name`);
    return rows;
}

/** One department, or undefined when there is no such name. */
export async function find(deptName: string): Promise<Department | undefined> {
  // TODO
  throw new Error('not implemented');
}

/**
 * Takes an amount off a department's budget and returns what is left. It
 * runs on the client it is given, not on the pool, because it is one step of
 * a transaction: see services/hiring.ts.
 */
export async function reduceBudgetOn(
  client: PoolClient, deptName: string, amount: number): Promise<number> {
  // TODO
  throw new Error('not implemented');
}
