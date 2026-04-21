export interface PageLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    links: PageLink[];
    from: number | null;
    to: number | null;
    total: number;
}

export interface ProjectOwner {
    id: number;
    name: string;
    country: string;
    contact_number: string | null;
    total_projects?: number | null;
    total_payment?: number | null;
}

export interface Project {
    id: number;
    name: string;
    owner_id: number;
    owner?: ProjectOwner;
    url: string | null;
    referrer: string | null;
    commission_fee: string | number | null;
    is_active: boolean;
}

export interface Payment {
    id: number;
    project_id: number;
    project?: Project;
    date: string;
    amount: number;
    currency: string;
    notes: string | null;
}

export interface Service {
    id: number;
    project_id: number;
    type: string;
    start_date: string;
    end_date: string;
    amount: number;
    currency: string;
    notes: string | null;
    is_active: boolean;
}

export interface ServiceLog {
    id: number;
    project_id: number;
    project?: Project;
    date: string;
    notes: string | null;
}

export interface Company {
    id: number;
    name: string;
    code: string;
}

export interface UserGroup {
    id: number;
    name: string;
    permissions: string[] | null;
}

export interface ManagedUser {
    id: number;
    name: string;
    email: string;
    usergroup_id: number | null;
    usergroup?: UserGroup | null;
}
