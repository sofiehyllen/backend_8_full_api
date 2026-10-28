// Task 4 - the third kind of test: the API over HTTP, with supertest.
//
// Four tests at least: a read, a write, a paged listing, and a request that
// is refused. The app comes from src/app.ts, with no server and no port.

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('the instructors API', () => {
  // TODO: replace with tests
  it.todo('reads one instructor, as a DTO');
});
