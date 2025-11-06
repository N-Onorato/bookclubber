import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import CyclesManagement from './components/CyclesManagement';
import UserManagement from './components/UserManagement';
import MembersManagement from './components/MembersManagement';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Admin Panel | The Book Club',
    description: 'Manage cycles, members, and club settings',
};

export default async function AdminPage() {
    // Server-side admin check - throws if not admin
    await requireAdmin();

    return (
        <div className="min-h-screen p-8">
            {/* Header */}
            <header className="max-w-6xl mx-auto mb-8">
                <div>
                    <Link href="/dashboard" className="text-accent hover:underline text-sm mb-2 block">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-4xl font-bold font-serif text-foreground mb-2">
                        Admin Panel
                    </h1>
                    <p className="text-foreground/60">
                        Manage cycles, members, and club settings
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto space-y-12">
                {/* User Management Section */}
                <section>
                    <UserManagement />
                </section>

                {/* Members Management Section */}
                <section>
                    <MembersManagement />
                </section>

                {/* Cycles Management Section */}
                <section>
                    <CyclesManagement />
                </section>

                {/* Placeholder for future sections */}
                {/*
                <section>
                    <ClubSettings />
                </section>
                */}
            </main>
        </div>
    );
}