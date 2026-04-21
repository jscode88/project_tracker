import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Field, FormActions, FormShell } from '@/components/resource';
import { Input } from '@/components/ui/input';
import type { ProjectOwner } from '@/types';

export default function ProjectOwnerForm({ owner }: { owner: ProjectOwner | null }) {
    const form = useForm({
        name: owner?.name ?? '',
        country: owner?.country ?? '',
        contact_number: owner?.contact_number ?? '',
    });

    function submit(event: FormEvent) {
        event.preventDefault();

        if (owner) {
            form.put(`/project-owners/${owner.id}`);
        } else {
            form.post('/project-owners');
        }
    }

    return (
        <FormShell title={owner ? 'Edit Project Owner' : 'New Project Owner'}>
            <form onSubmit={submit} className="grid gap-4">
                <Field label="Name" error={form.errors.name}>
                    <Input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} />
                </Field>
                <Field label="Country" error={form.errors.country}>
                    <Input value={form.data.country} onChange={(event) => form.setData('country', event.target.value)} />
                </Field>
                <Field label="Contact Number" error={form.errors.contact_number}>
                    <Input value={form.data.contact_number} onChange={(event) => form.setData('contact_number', event.target.value)} />
                </Field>
                <FormActions cancelHref="/project-owners" processing={form.processing} />
            </form>
        </FormShell>
    );
}
