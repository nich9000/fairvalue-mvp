import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../db/supabase';
import { AuthTokenPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = '7d';
const SALT_ROUNDS = 10;

if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET in environment');
}

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET as string) as AuthTokenPayload;
}

// Verifies the token AND that its user still exists and is active — a valid signature
// alone isn't enough if the account was since deleted or deactivated.
export async function resolveUser(token: string): Promise<AuthTokenPayload | null> {
  let payload: AuthTokenPayload;
  try {
    payload = verifyToken(token);
  } catch {
    return null;
  }

  const { data: user } = await supabase.from('users').select('id, email, is_active').eq('id', payload.user_id).maybeSingle();
  if (!user || !user.is_active) return null;

  return { user_id: user.id, email: user.email };
}

export async function signup(email: string, password: string) {
  const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
  if (existing) {
    throw new Error('An account with this email already exists');
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const { data, error } = await supabase
    .from('users')
    .insert({ email, password_hash })
    .select('id, email')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to create account');

  const token = signToken({ user_id: data.id, email: data.email });
  return { user_id: data.id, token };
}

export async function login(email: string, password: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, password_hash, is_active')
    .eq('email', email)
    .maybeSingle();

  if (error || !user || !user.is_active) {
    throw new Error('Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  const token = signToken({ user_id: user.id, email: user.email });
  return { user_id: user.id, token };
}
