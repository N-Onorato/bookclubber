'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Server action to logout the current user
 * Deletes the session cookie and redirects to home
 */
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('session_id');
  redirect('/');
}
