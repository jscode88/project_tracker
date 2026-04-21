import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Field, FormActions, FormShell } from '@/components/resource';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ManagedUser, UserGroup } from '@/types';

export default function UserForm({ managedUser, usergroups }: { managedUser: ManagedUser | null; usergroups: UserGroup[] }) {
    const form = useForm({
        name: managedUser?.name ?? '',
        email: managedUser?.email ?? '',
        password: '',
        usergroup_id: String(managedUser?.usergroup_id ?? ''),
    });

    function submit(event: FormEvent) {
        event.preventDefault();

        if (managedUser) {
            form.put(`/users/${managedUser.id}`);
        } else {
            form.post('/users');
        }
    }

    return (
        <FormShell title={managedUser ? 'Edit User' : 'New User'}>
            <form onSubmit={submit} className="grid gap-4">
                <Field label="Name" error={form.errors.name}><Input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} /></Field>
                <Field label="Email" error={form.errors.email}><Input type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} /></Field>
                <Field label={managedUser ? 'Password (optional)' : 'Password'} error={form.errors.password}><Input type="password" value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} /></Field>
                <Field label="User Group" error={form.errors.usergroup_id}>
                    <Select value={form.data.usergroup_id || 'none'} onValueChange={(value) => form.setData('usergroup_id', value === 'none' ? '' : value)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select user group" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">No group</SelectItem>
                            {usergroups.map((group) => (
                                <SelectItem key={group.id} value={String(group.id)}>
                                    {group.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
                <FormActions cancelHref="/users" processing={form.processing} />
            </form>
        </FormShell>
    );
}
