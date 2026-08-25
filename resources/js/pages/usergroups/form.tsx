import { useForm } from '@inertiajs/react';
import { CheckCheck, X } from 'lucide-react';
import type { FormEvent } from 'react';
import {
    Field,
    FormActions,
    PageBody,
    PageHeader,
} from '@/components/resource';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import type { UserGroup } from '@/types';

const permissionGroups = [
    {
        title: 'Workspace access',
        description: 'Control access to day-to-day project operations.',
        permissions: [
            {
                value: 'projects',
                label: 'Projects',
                description: 'View and manage project records.',
            },
            {
                value: 'project_owners',
                label: 'Project owners',
                description: 'View and manage customers and project owners.',
            },
            {
                value: 'payments',
                label: 'Payments',
                description: 'View and manage project payment records.',
            },
            {
                value: 'services',
                label: 'Services',
                description: 'View and manage project services and logs.',
            },
        ],
    },
    {
        title: 'Administration access',
        description: 'Control access to account and organization settings.',
        permissions: [
            {
                value: 'users',
                label: 'Users',
                description: 'Create and manage user accounts.',
            },
            {
                value: 'usergroups',
                label: 'User groups',
                description: 'Create and manage permission groups.',
            },
            {
                value: 'companies',
                label: 'Companies',
                description: 'View and manage company records.',
            },
        ],
    },
] as const;

const permissions = permissionGroups.flatMap((group) =>
    group.permissions.map((permission) => permission.value),
);

export default function UserGroupForm({
    usergroup,
}: {
    usergroup: UserGroup | null;
}) {
    const form = useForm({
        name: usergroup?.name ?? '',
        permissions: usergroup?.permissions ?? [],
    });

    function toggle(permission: string, checked: boolean) {
        form.setData(
            'permissions',
            checked
                ? [...new Set([...form.data.permissions, permission])]
                : form.data.permissions.filter((item) => item !== permission),
        );
    }

    function submit(event: FormEvent) {
        event.preventDefault();

        if (usergroup) {
            form.put(`/usergroups/${usergroup.id}`);
        } else {
            form.post('/usergroups');
        }
    }

    const selectedCount = form.data.permissions.length;
    const title = usergroup ? 'Edit User Group' : 'New User Group';

    return (
        <>
            <PageHeader
                title={title}
                description="Define the group name and the areas its users can access."
            />
            <PageBody>
                <form
                    onSubmit={submit}
                    className="mx-auto flex w-full max-w-5xl flex-col"
                >
                    <section className="grid gap-5 border-b pb-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                        <div>
                            <h2 className="font-semibold">Group details</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Use a name that describes the role assigned to
                                this group.
                            </p>
                        </div>
                        <div className="max-w-xl">
                            <Field label="Name" error={form.errors.name}>
                                <Input
                                    value={form.data.name}
                                    placeholder="e.g. Project administrator"
                                    autoFocus
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                />
                            </Field>
                        </div>
                    </section>

                    <section className="grid gap-5 py-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                        <div>
                            <h2 className="font-semibold">Permissions</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {selectedCount} of {permissions.length} access
                                areas selected.
                            </p>
                        </div>

                        <div className="min-w-0 space-y-6">
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={
                                        selectedCount === permissions.length
                                    }
                                    onClick={() =>
                                        form.setData('permissions', [
                                            ...permissions,
                                        ])
                                    }
                                >
                                    <CheckCheck className="size-4" />
                                    Select all
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    disabled={selectedCount === 0}
                                    onClick={() =>
                                        form.setData('permissions', [])
                                    }
                                >
                                    <X className="size-4" />
                                    Clear
                                </Button>
                            </div>

                            <div className="grid gap-6 xl:grid-cols-2">
                                {permissionGroups.map((group) => (
                                    <div key={group.title} className="min-w-0">
                                        <div className="border-b pb-3">
                                            <h3 className="text-sm font-semibold">
                                                {group.title}
                                            </h3>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {group.description}
                                            </p>
                                        </div>
                                        <div>
                                            {group.permissions.map(
                                                (permission) => (
                                                    <label
                                                        key={permission.value}
                                                        className="flex cursor-pointer items-start gap-3 border-b py-4 last:border-b-0"
                                                    >
                                                        <Checkbox
                                                            className="mt-0.5"
                                                            checked={form.data.permissions.includes(
                                                                permission.value,
                                                            )}
                                                            onCheckedChange={(
                                                                value,
                                                            ) =>
                                                                toggle(
                                                                    permission.value,
                                                                    value ===
                                                                        true,
                                                                )
                                                            }
                                                        />
                                                        <span className="min-w-0">
                                                            <span className="block text-sm font-medium">
                                                                {
                                                                    permission.label
                                                                }
                                                            </span>
                                                            <span className="mt-1 block text-sm text-muted-foreground">
                                                                {
                                                                    permission.description
                                                                }
                                                            </span>
                                                        </span>
                                                    </label>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {form.errors.permissions ? (
                                <p className="text-sm text-destructive">
                                    {form.errors.permissions}
                                </p>
                            ) : null}
                        </div>
                    </section>

                    <div className="border-t pt-4">
                        <FormActions
                            cancelHref="/usergroups"
                            processing={form.processing}
                        />
                    </div>
                </form>
            </PageBody>
        </>
    );
}
