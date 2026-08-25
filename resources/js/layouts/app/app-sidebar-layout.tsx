import { usePage } from '@inertiajs/react';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    const isIdeaBookCalendar = usePage().url.split('?')[0] === '/ideabook';

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent
                variant="sidebar"
                className={
                    isIdeaBookCalendar
                        ? 'h-svh min-h-0 overflow-hidden'
                        : 'overflow-x-hidden'
                }
            >
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {isIdeaBookCalendar ? (
                    <div className="flex h-0 min-h-0 flex-1 flex-col overflow-hidden">
                        {children}
                    </div>
                ) : (
                    children
                )}
            </AppContent>
        </AppShell>
    );
}
