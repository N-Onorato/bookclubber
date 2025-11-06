'use client';

import Link from 'next/link';
import CyclesManagement from './components/CyclesManagement';
import UserManagement from './components/UserManagement';
import MembersManagement from './components/MembersManagement';

export default function AdminPage() {
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