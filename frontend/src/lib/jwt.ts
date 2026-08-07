// Decodes a JWT payload for display purposes only (e.g. showing initials).
// Never trust this client-side decode for authorization — the server verifies the signature.
export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function getUserInitials(): string {
  const token = localStorage.getItem('fairvalue_token');
  if (!token) return '';
  const payload = decodeJwtPayload<{ email?: string }>(token);
  const email = payload?.email;
  if (!email) return '';
  return email.slice(0, 2).toUpperCase();
}
