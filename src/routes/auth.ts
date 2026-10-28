// Task 2 - logging in.
//
// POST /auth/login with { username, password }
//   ->  200 and { token }, signed with signToken({ id, role }) from the user
//   ->  401 for a wrong username or password, with the same answer for both
//   ->  400 when the username or the password is missing

import { Router } from 'express';
import { findUserByName } from '../data/users.js';
import { signToken, verifyPassword } from '../auth/crypto.js';

export const authRouter = Router();

// TODO
authRouter.post('/login', async (req, res, next) => {
  res.status(501).json({ error: 'not implemented' });
});
