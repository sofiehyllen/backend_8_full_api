// Task 1 - the departments controller, including hiring.
//
// A controller reads the request, calls one thing, and answers. No SQL here,
// and no rules: those are in the data layer and in the service. Every error
// goes to next(err).

import { Router } from 'express';
import * as departments from '../data/departments.js';
import { hireInstructor } from '../services/hiring.js';
import { validateHire } from '../validation.js';
import { requireToken } from '../middleware/auth.js';
import { toDepartmentDto, toInstructorDto } from './dto.js';

export const departmentsRouter = Router();

// GET /departments  ->  200 and every department, as DTOs
departmentsRouter.get('/', async (_req, res, next) => {
  try {
    const rows = await departments.list();
    res.json(rows.map(toDepartmentDto));
  } catch (err) {
    next(err);
  }
});

// GET /departments/:name  ->  200 and the department as a DTO, or 404
//
// TODO
departmentsRouter.get('/:name', async (req, res, next) => {
  try {
    const row = await departments.find(req.params.name);
    if (row === undefined) {
      res.status(404).json({ error: `undefined` });
      return;
    }
    res.json(toDepartmentDto(row));
  } catch (err) {
    next(err);
  }
});

// POST /departments/:name/instructors with { id, name, salary }
//   ->  201, a Location header pointing at the new instructor, and
//       { instructor: InstructorDto, budgetLeft: number }
//   ->  400 when validateHire says the body is not valid
//   ->  404 and 409 come from the service: do not catch them
//
// TODO
departmentsRouter.post('/:name/instructors', requireToken, async (req, res, next) => {
  res.status(501).json({ error: 'not implemented' });
});
