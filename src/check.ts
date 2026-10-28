// The check script. Given to you.
//
//     npm run build
//     npm run check
//
// It starts your API on a spare port and makes real HTTP requests to it,
// then checks the status code and the body of each one. That is how a client
// will use your API, so it is how this checks it. It puts the database back
// as it found it.
//
// Nothing is graded and nothing is sent anywhere.

import { app } from './app.js';
import { pool } from './db.js';

let passed = 0, failed = 0;
const PORT = 3999;
const base = `http://localhost:${PORT}`;

interface Result {
  status: number;
  location: string | null;
  body: unknown;
}

async function call(path: string, init?: RequestInit): Promise<Result> {
  const r = await fetch(base + path, init);
  const text = await r.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: r.status, location: r.headers.get('location'), body };
}

/** A request with a method, an optional JSON body, and an optional token. */
function send(method: string, body?: unknown, token?: string): RequestInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return { method, headers, body: body === undefined ? undefined : JSON.stringify(body) };
}

function ok(name: string, condition: boolean, detail?: string): void {
  if (condition) {
    console.log(`  ok   ${name}`);
    passed++;
  } else {
    console.log(`  FAIL ${name}${detail ? '\n       ' + detail : ''}`);
    failed++;
  }
}

function status(name: string, r: Result, expected: number): void {
  ok(name, r.status === expected,
     `expected status ${expected}, got ${r.status}, body ${JSON.stringify(r.body)}`);
}

function field(body: unknown, name: string): unknown {
  return body !== null && typeof body === 'object'
    ? (body as Record<string, unknown>)[name]
    : undefined;
}

async function login(username: string, password: string): Promise<string | undefined> {
  const r = await call('/auth/login', send('POST', { username, password }));
  const token = field(r.body, 'token');
  return r.status === 200 && typeof token === 'string' ? token : undefined;
}

async function reset(): Promise<void> {
  await pool.query("DELETE FROM instructor WHERE id IN ('90100', '90200')");
  await pool.query("UPDATE department SET budget = 80000 WHERE dept_name = 'Music'");
  await pool.query("UPDATE instructor SET salary = 95000 WHERE id = '22222'");
}

async function task1(admin: string | undefined): Promise<void> {
  console.log('\nTask 1. GET /instructors');
  const all = await call('/instructors');
  status('returns 200', all, 200);
  const items = field(all.body, 'items');
  ok('answers with { total, limit, offset, items }',
     Array.isArray(items) && typeof field(all.body, 'total') === 'number',
     `got ${JSON.stringify(all.body).slice(0, 120)}`);
  ok('items are DTOs, without the salary',
     Array.isArray(items) && items.length > 0 &&
     'department' in (items[0] as object) && !('salary' in (items[0] as object)),
     'expected { id, name, department }');
  const limited = await call('/instructors?limit=5');
  ok('total is the whole collection, not the page',
     field(limited.body, 'total') === 12 &&
     (field(limited.body, 'items') as unknown[] | undefined)?.length === 5);
  const one = await call('/instructors/22222');
  ok('one instructor is a DTO', field(one.body, 'department') === 'Physics' &&
     field(one.body, 'salary') === undefined, `got ${JSON.stringify(one.body)}`);

  console.log('\nTask 1. GET /departments');
  const depts = await call('/departments');
  status('returns 200', depts, 200);
  ok('seven departments, without budgets',
     Array.isArray(depts.body) && depts.body.length === 7 &&
     field(depts.body[0], 'department') === 'Biology' &&
     !('budget' in (depts.body[0] as object)),
     `got ${JSON.stringify(depts.body).slice(0, 120)}`);
  status('one department', await call('/departments/Physics'), 200);
  status('an unknown department gives 404', await call('/departments/Nursing'), 404);

  console.log('\nTask 1. POST /departments/:name/instructors  (the service)');
  const hired = await call('/departments/Music/instructors',
    send('POST', { id: '90100', name: 'Novice', salary: 30000 }, admin));
  status('hiring returns 201', hired, 201);
  ok('Location points at the new instructor',
     hired.location === '/instructors/90100', `got ${hired.location}`);
  ok('answers with the instructor and the budget left',
     field(field(hired.body, 'instructor'), 'name') === 'Novice' &&
     field(hired.body, 'budgetLeft') === 50000,
     `got ${JSON.stringify(hired.body)}`);
  status('the same id twice gives 409',
    await call('/departments/Music/instructors',
      send('POST', { id: '90100', name: 'Novice', salary: 30000 }, admin)), 409);
  status('an unknown department gives 404',
    await call('/departments/Nursing/instructors',
      send('POST', { id: '90200', name: 'Nobody', salary: 30000 }, admin)), 404);
  status('a salary larger than the budget gives 409',
    await call('/departments/Music/instructors',
      send('POST', { id: '90200', name: 'Expensive', salary: 999999 }, admin)), 409);
  status('a bad body gives 400',
    await call('/departments/Music/instructors', send('POST', { name: 'Nameless' }, admin)), 400);
  const budget = await pool.query<{ budget: string }>(
    "SELECT budget FROM department WHERE dept_name = 'Music'");
  ok('the budget went down once, and only once',
     Number(budget.rows[0].budget) === 50000, `budget is ${budget.rows[0].budget}`);
  status('the new instructor can be deleted', await call('/instructors/90100',
    send('DELETE', undefined, admin)), 204);
}

async function task2(): Promise<void> {
  console.log('\nTask 2. Logging in');
  const r = await call('/auth/login', send('POST', { username: 'admin', password: 'admin-pw' }));
  status('the right password gives 200', r, 200);
  ok('and a token', typeof field(r.body, 'token') === 'string', `got ${JSON.stringify(r.body)}`);
  const wrong = await call('/auth/login', send('POST', { username: 'admin', password: 'guess' }));
  status('a wrong password gives 401', wrong, 401);
  const nobody = await call('/auth/login', send('POST', { username: 'nobody', password: 'guess' }));
  status('an unknown user gives 401', nobody, 401);
  ok('with the same answer as a wrong password',
     JSON.stringify(nobody.body) === JSON.stringify(wrong.body));
  status('a missing password gives 400',
    await call('/auth/login', send('POST', { username: 'admin' })), 400);

  console.log('\nTask 2. The guard');
  status('PUT without a token gives 401',
    await call('/instructors/22222', send('PUT', { salary: 95000 })), 401);
  status('PUT with a token that is not ours gives 401',
    await call('/instructors/22222', send('PUT', { salary: 95000 }, 'guess')), 401);
  status('DELETE without a token gives 401',
    await call('/instructors/00000', send('DELETE')), 401);
  status('hiring without a token gives 401',
    await call('/departments/Music/instructors',
      send('POST', { id: '90200', name: 'Nobody', salary: 30000 })), 401);
  status('GET stays open', await call('/instructors/22222'), 200);
}

async function task3(admin: string | undefined): Promise<void> {
  const einstein = await login('einstein', 'einstein-pw');
  ok('einstein can log in', einstein !== undefined);

  console.log('\nTask 3. Only the admin may change things');
  status('einstein may not change a salary: 403',
    await call('/instructors/22222', send('PUT', { salary: 95000 }, einstein)), 403);
  // An id that does not exist, so that nothing is lost if the check fails.
  status('einstein may not delete: 403',
    await call('/instructors/00000', send('DELETE', undefined, einstein)), 403);
  status('einstein may not hire: 403',
    await call('/departments/Music/instructors',
      send('POST', { id: '90200', name: 'Nobody', salary: 30000 }, einstein)), 403);
  const put = await call('/instructors/22222', send('PUT', { salary: 95000 }, admin));
  status('the admin may change a salary', put, 200);
  ok('and gets a DTO back, without the salary', field(put.body, 'salary') === undefined &&
     field(put.body, 'department') === 'Physics', `got ${JSON.stringify(put.body)}`);
  status('a raise above 10% still gives 409',
    await call('/instructors/22222', send('PUT', { salary: 200000 }, admin)), 409);

  console.log('\nTask 3. GET /instructors/:id/salary');
  const own = await call('/instructors/22222/salary', send('GET', undefined, einstein));
  status('einstein may see his own salary', own, 200);
  ok('which is 95000', field(own.body, 'salary') === 95000, `got ${JSON.stringify(own.body)}`);
  status('but not Katz\'s: 403',
    await call('/instructors/45565/salary', send('GET', undefined, einstein)), 403);
  status('the admin may see Katz\'s',
    await call('/instructors/45565/salary', send('GET', undefined, admin)), 200);
  status('nobody without a token: 401', await call('/instructors/45565/salary'), 401);
  status('an unknown instructor gives 404 to the admin',
    await call('/instructors/00000/salary', send('GET', undefined, admin)), 404);
}

async function main(): Promise<void> {
  const server = app.listen(PORT);
  await new Promise(r => setTimeout(r, 200));
  try {
    await reset();
    // Before Task 2 the writes need API_TOKEN from .env. After it, the
    // admin logs in like any other client.
    const admin = await login('admin', 'admin-pw') ?? process.env.API_TOKEN;
    await task1(admin);
    await reset();
    await task2();
    await reset();
    await task3(admin);
  } finally {
    await reset();
    console.log(`\n${passed} passed, ${failed} failed\n`);
    server.close();
    await pool.end();
  }
}

main();
