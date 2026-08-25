import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Building2,
    Calculator,
    CircleDollarSign,
    FolderKanban,
    LayoutGrid,
    Shield,
    UserRound,
    UsersRound,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Project Owners',
        href: '/project-owners',
        icon: UserRound,
    },
    {
        title: 'Projects',
        href: '/projects',
        icon: FolderKanban,
    },
    {
        title: 'Payments',
        href: '/payments',
        icon: CircleDollarSign,
    },
];

const administrationNavItems: NavItem[] = [
    {
        title: 'Users',
        href: '/users',
        icon: UsersRound,
    },
    {
        title: 'User Groups',
        href: '/usergroups',
        icon: Shield,
    },
    {
        title: 'Companies',
        href: '/companies',
        icon: Building2,
    },
];

const toolsNavItems: NavItem[] = [
    {
        title: 'IdeaBook',
        href: '/ideabook',
        icon: BookOpen,
    },
    {
        title: 'Price Calculator',
        href: '/price-calculator',
        icon: Calculator,
        children: [
            {
                title: 'Calculator',
                href: '/price-calculator',
            },
            {
                title: 'Saved Calculations',
                href: '/price-calculator/saved',
            },
            {
                title: 'Settings',
                href: '/price-calculator/settings',
            },
        ],
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                <NavMain items={toolsNavItems} label="Tool" />
                <NavMain
                    items={administrationNavItems}
                    label="Administration"
                />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
