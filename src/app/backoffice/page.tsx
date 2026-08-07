import { requireStaffPage } from '@/lib/rbac';

// Placeholder for Phase 1 verification — Phase 2 builds the real role-specific dashboard.
export default async function BackofficeDashboardPage() {
  const user = await requireStaffPage();

  return (
    <main className="min-h-screen bg-canvas p-8">
      <h1 className="text-xl font-bold text-ink">Backoffice</h1>
      <p className="mt-2 text-ink-body">
        Signed in as {user.nameEn} — role: {user.role}
        {user.schoolId ? ` — school: ${user.schoolId}` : ''}
      </p>
    </main>
  );
}
