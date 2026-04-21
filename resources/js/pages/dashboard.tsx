import { Head, Link } from '@inertiajs/react';
import { CircleDollarSign, FolderKanban, UserRound, Wrench } from 'lucide-react';
import { money } from '@/components/resource';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';

export default function Dashboard({ stats }: { stats: { owners: number; projects: number; activeServices: number; balance: number } }) {
    const cards = [
        { label: 'Owners', value: stats.owners, href: '/project-owners', icon: UserRound },
        { label: 'Projects', value: stats.projects, href: '/projects', icon: FolderKanban },
        { label: 'Active Services', value: stats.activeServices, href: '/projects', icon: Wrench },
        { label: 'Balance', value: money(stats.balance), href: '/payments', icon: CircleDollarSign },
    ];

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="border-b pb-4">
                    <h1 className="text-2xl font-semibold tracking-normal">Project Tracker</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Track client projects, recurring services, payments, and work logs.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                    {cards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <Link key={card.label} href={card.href} className="rounded-lg border bg-card p-4 hover:bg-muted/40">
                                <Icon className="size-5 text-muted-foreground" />
                                <div className="mt-4 text-2xl font-semibold">{card.value}</div>
                                <div className="text-sm text-muted-foreground">{card.label}</div>
                            </Link>
                        );
                    })}
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                    <Button asChild><Link href="/projects/create">Create Project</Link></Button>
                    <Button asChild variant="secondary"><Link href="/payments/create">Record Payment</Link></Button>
                    <Button asChild variant="outline"><Link href="/service-logs/create">Add Service Log</Link></Button>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
