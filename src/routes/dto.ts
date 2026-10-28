// Task 1 - what the API sends.
//
// The DTO is a promise to the client. It is not the row you read: it may
// drop fields and rename them.

import { Instructor } from '../data/instructors.js';
import { Department } from '../data/departments.js';

export interface InstructorDto {
  id: string;
  name: string;
  department: string;
}

export interface DepartmentDto {
  department: string;
  building: string;
}

/** { id, name, department }. The salary is not sent. */
export function toInstructorDto(instructor: Instructor): InstructorDto {
  // TODO
  throw new Error('not implemented');
}

/** { department, building }. The budget is not sent. */
export function toDepartmentDto(department: Department): DepartmentDto {
  return { department: department.deptName, building: department.building };
}
