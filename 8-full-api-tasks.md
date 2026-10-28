# Exercises: the complete Web API

Complex IT Systems – Theory E2026 (40417)
Section 2 - backend development

Lessons: Developing advanced applications, and Authentication and
authorization.

This project is the instructors API from the structured API exercises,
complete and working, with the salary rule in its service. It now sends
DTOs, and its collection is paged with a total. You build the rest of the
backend you designed there: departments, and hiring an instructor into a
department. Then you replace the fixed token with a real login, decide who
may do what, and test it all.

---

## Before you start

The same database as before. Copy `.env.example` to `.env` and fill in your
password. Keep `API_TOKEN`: the API needs it until Task 2.

Then create the users of the API. In pgAdmin, open the Query Tool on the
`university` database, open `users.sql` from this folder, and run it. Then
check:

```sql
select username, role from app_user;   -- admin, einstein, katz
```

```
npm install
npm run build
npm start          # the API
npm run check      # start it and make real requests to it
npm test           # your own tests, Task 4
```

`npm run check` starts your API on port 3999 and calls it over HTTP, the way
a client would. It prints one line per check, and puts the database back as
it found it. Run it after every task: the checks for the tasks you have not
done yet fail, and that is expected.

---

## What is given to you

| File | Why |
|---|---|
| `src/data/instructors.ts` | A complete data access module. Yours should look like it |
| `src/routes/instructors.ts` | The instructors controller, sending DTOs. Tasks 2 and 3 change it |
| `src/services/salaries.ts` | The salary rule from the structured API exercises |
| `src/validation.ts` | Checking a body, now also the body of a hire |
| `src/middleware/errors.ts` | The error handler, which turns `NotFound` and `Conflict` into 404 and 409 |
| `src/auth/crypto.ts` | The four security functions, as placeholders until the security lectures |
| `src/data/users.ts` | `findUserByName`, which reads the table from `users.sql` |
| `src/check.ts` | The checks |

## The layers, and the rule for each

```
  request → routes/      controllers: read the request, send the response
            services/    the rules; knows nothing about HTTP
            data/        SQL; knows nothing about HTTP either
            db.ts        the pool
```

- A **controller** may not contain SQL.
- A **service** may not contain `req`, `res` or a status code.
- A **data module** may not know why it is being called.

---

## Task 1 – The complete backend

Write the four files that make departments and hiring work.

**`src/data/departments.ts`**: `list()` returns every department, ordered by
name. `find(deptName)` returns one department, or `undefined`.
`reduceBudgetOn(client, deptName, amount)` takes the amount off the budget
and returns what is left. It runs on the client it is given, not on the
pool.

**`src/routes/dto.ts`**: `toInstructorDto` returns `{ id, name, department }`
and `toDepartmentDto` returns `{ department, building }`. Neither the salary
nor the budget is ever sent.

**`src/services/hiring.ts`**: `hireInstructor(deptName, input)` hires an
instructor into a department. The input is `{ id, name, salary }`.

- When the department does not exist, it throws `NotFound`.
- When the id is already taken, it throws `Conflict`.
- When the salary is not less than the budget, it throws `Conflict`.
- Otherwise it stores the instructor, takes the salary off the budget, and
  returns `{ instructor, budgetLeft }`.

Storing the instructor and reducing the budget must both happen, or neither.

**`src/routes/departments.ts`**:

| Endpoint | Answers |
|---|---|
| `GET /departments` | 200 and every department |
| `GET /departments/:name` | 200 and the department, or 404 |
| `POST /departments/:name/instructors` with `{ id, name, salary }` | 201, a `Location` header pointing at the new instructor, and `{ instructor, budgetLeft }`. 400 for a bad body. 404 and 409 come from the service |

Example: hiring Novice with salary 30000 into Music returns Novice and
`budgetLeft: 50000`. Hiring someone into Music with a salary of 999999 gives
409, and nothing is stored.

---

## Task 2 – Logging in

The fixed token from `.env` lets in anyone who knows it, and the API never
learns who they are. Replace it with a login.

**`src/routes/auth.ts`**: `POST /auth/login` with `{ username, password }`.
Find the user with `findUserByName`, and compare the password with
`verifyPassword`. When they match, answer 200 and `{ token }`, made with
`signToken({ id, role })` from the user. Otherwise answer 401, with the same
answer whether the username or the password was wrong. A missing username or
password gives 400. Mount the router on `/auth` in `src/app.ts`.

**`src/middleware/auth.ts`**: `requireAuth` reads the token from
`Authorization: Bearer <token>` and checks it with `verifyToken`. No token,
or one it does not accept: 401, and the handler never runs. Otherwise it puts
the claims on `res.locals.user` and calls `next()`.

Then use `requireAuth` wherever `requireToken` is used now, and delete
`requireToken` and `API_TOKEN`. Every `GET` stays open.

Example: `PUT /instructors/22222` without a token gives 401. With the token
from logging in as `admin`, it works as before.

---

## Task 3 – Who may do what

Logging in tells the API who is asking. Now decide what each of them may do.

**Only the admin changes things.** In `src/middleware/auth.ts`, write
`requireRole(role)`, which answers 403 unless `res.locals.user` has that
role. Put `requireRole('admin')` after `requireAuth` on `PUT` and `DELETE`
`/instructors/:id`, and on hiring.

**An instructor may see their own salary.** In `src/routes/instructors.ts`,
write `GET /instructors/:id/salary`, which answers 200 and `{ id, salary }`.
Only a logged-in user may ask, and only the instructor themself or the
admin gets the answer. Anyone else gets 403. An unknown id gives 404.

Example: logged in as `einstein`, `GET /instructors/22222/salary` gives
95000, but `GET /instructors/45565/salary` gives 403. As `admin`, both give
200.

One of these two checks is middleware and the other is in the handler. Why
could the second one not be middleware like `requireRole`?

---

## Task 4 – Testing

Write one test of each kind with Vitest, in the three files in `test/`, and
run them with `npm test`.

- **`test/dto.test.ts`**, logic that touches nothing: test `toInstructorDto`
  and `toDepartmentDto`, including that the salary and the budget are never
  sent.
- **`test/data.test.ts`**, data access against the real database: test
  `reduceBudgetOn`. Take one client from the pool, run every test inside
  `BEGIN` and `ROLLBACK` on it, and give that client to `reduceBudgetOn`.
  Then the second run gives the same result as the first.
- **`test/api.test.ts`**, the API over HTTP with supertest: at least a read,
  a write, a paged listing, and a request that must be refused. Choose a
  write that leaves the database as it was.

In `test/data.test.ts`, release the client in `afterAll`, when the tests are
done with it.

---

## Reference

The codes are those of the reading list, *Reading material for Backend
development*.

- **[EAA]** Martin Fowler, Catalog of Patterns of Enterprise Application
  Architecture:
  [Service Layer](https://martinfowler.com/eaaCatalog/serviceLayer.html),
  [Table Data Gateway](https://martinfowler.com/eaaCatalog/tableDataGateway.html),
  [Data Mapper](https://martinfowler.com/eaaCatalog/dataMapper.html),
  [Data Transfer Object](https://martinfowler.com/eaaCatalog/dataTransferObject.html)
- **[EXP]** Express documentation:
  [Using middleware](https://expressjs.com/en/guide/using-middleware/),
  [Writing middleware](https://expressjs.com/en/guide/writing-middleware.html),
  [Error handling](https://expressjs.com/en/guide/error-handling.html)
- **[PG]** node-postgres documentation:
  [Transactions](https://node-postgres.com/features/transactions),
  [Pooling](https://node-postgres.com/features/pooling)
- **[VT]** Vitest documentation:
  [Getting Started](https://vitest.dev/guide/),
  [Setup and Teardown](https://vitest.dev/api/#setup-and-teardown)
- **[ST]** supertest documentation:
  [the README](https://www.npmjs.com/package/supertest)
