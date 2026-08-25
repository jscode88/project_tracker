import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            flash: {
                ai_title_generation: {
                    failed: boolean;
                    operation: 'create' | 'update' | null;
                    entry_type: 'idea' | 'problem' | null;
                };
            };
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
