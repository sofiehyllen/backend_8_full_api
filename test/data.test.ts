// Task 4 - the second kind of test: data access against the real database.
//
// Test reduceBudgetOn from src/data/departments.ts. Run every test inside a
// transaction on one client, and roll it back afterwards, so that the second
// run gives the same result as the first.

import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { PoolClient } from 'pg';
import { pool } from '../src/db.js';
import * as departments from '../src/data/departments.js';

describe('reduceBudgetOn', () => {
  // TODO: replace with tests
  it.todo('takes the amount off the budget and returns what is left');
});
