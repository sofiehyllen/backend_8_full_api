// auth/crypto.ts   PLACEHOLDER, replaced after the security lectures (slide 17).
//
// The four functions that make this secure are left open on purpose. The
// bodies below work, so the rest of the application can be built and run,
// and they are obviously not security. Only this file changes later.

export interface Claims {
  id: string;
  role: string;
}

export async function hashPassword(p: string): Promise<string> {
  return 'PLAIN:' + p;
}

export async function verifyPassword(p: string, stored: string): Promise<boolean> {
  return stored === 'PLAIN:' + p;
}

export function signToken(claims: Claims): string {
  return 'PLAIN:' + JSON.stringify(claims);
}

export function verifyToken(t: string): Claims | undefined {
  if (!t.startsWith('PLAIN:')) return undefined;
  try {
    return JSON.parse(t.slice('PLAIN:'.length));
  } catch {
    return undefined;
  }
}
