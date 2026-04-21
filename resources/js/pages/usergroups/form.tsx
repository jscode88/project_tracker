import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Field, FormActions, FormShell } from '@/components/resource';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import type { UserGroup } from '@/types';

const permissions = ['projects', 'project_owners', 'payments', 'services', 'users', 'usergroups', 'companies'];

export default function UserGroupForm({ usergroup }: { usergroup: UserGroup | null }) {
    const form = useForm({
        name: usergroup?.name ?? '',
        permissions: usergroup?.permissions ?? [],
    });

    function toggle(permission: string, checked: boolean) {
        form.setData('permissions', checked ? [...form.data.permissions, permission] : form.data.permissions.filter((item) => item !== permission));
    }

    function submit(event: FormEvent) {
        event.preventDefault();

        if (usergroup) {
            form.put(`/usergroups/${usergroup.id}`);
        } else {
            form.post('/usergroups');
        }
    }

    return (
        <FormShell title={usergroup ? 'Edit User Group' : 'New User Group'}>
            <form onSubmit={submit} className="grid gap-4">
                <Field label="Name" error={form.errors.name}><Input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} /></Field>
                <div className="grid gap-3">
                    <div className="text-sm font-medium">Permissions</div>
                    <div className="grid gap-2 sm:grid-cols-2">
                        {permissions.map((permission) => (
                            <label key={permission} className="flex items-center gap-2 text-sm">
                                <Checkbox checked={form.data.permissions.includes(permission)} onCheckedChange={(value) => toggle(permission, value === true)} />
                                {permission.replace('_', ' ')}
                            </label>
                        ))}
                    </div>
                </div>
                <FormActions cancelHref="/usergroups" processing={form.processing} />
            </form>
        </FormShell>
    );
}
