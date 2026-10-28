// One error handler for the whole application. Given to you.
//
// A service that finds something wrong throws NotFound or Conflict, and this
// is the one place that turns them into 404 and 409. Anything else is a
// failure nobody expected: the detail goes to the server's log, and the
// client learns only that it failed.

import { Request, Response, NextFunction } from 'express';

/** Thrown by a service when something it needs does not exist. */
export class NotFound extends Error {}

/** Thrown by a service when the request conflicts with what is stored. */
export class Conflict extends Error {}

export function errorHandler(
  err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof NotFound) {
    res.status(404).json({ error: err.message });
    return;
  }
  if (err instanceof Conflict) {
    res.status(409).json({ error: err.message });
    return;
  }
  // A body that is not valid JSON: express.json() marks it with status 400.
  if (err.status === 400) {
    res.status(400).json({ error: 'the request body is not valid JSON' });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'internal error' });
}
