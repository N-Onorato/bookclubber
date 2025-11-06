import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth check for all dashboard routes
  // Throws if not authenticated or not approved
  await requireAuth();

  return children;
}
