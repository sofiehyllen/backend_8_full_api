// The data access module for the users of the API, from users.sql.
// Given to you.

import { pool } from '../db.js';

export interface User {
  id: string;
  username: string;
  hash: string;     // what hashPassword made, never the password itself
  role: string;
}

/** One user, or undefined when there is no such username. */
export async function findUserByName(username: string): Promise<User | undefined> {
  const { rows } = await pool.query<User>(
    'SELECT id, username, hash, role FROM app_user WHERE username = $1', [username]);
  return rows[0];
}
