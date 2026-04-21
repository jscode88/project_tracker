import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { CheckField, Field, FormActions, FormShell } from '@/components/resource';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Project, ProjectOwner } from '@/types';

export default function ProjectForm({ project, owners, selectedOwner }: { project: Project | null; owners: ProjectOwner[]; selectedOwner: number | null }) {
    const form = useForm({
        name: project?.name ?? '',
        owner_id: String(project?.owner_id ?? selectedOwner ?? owners[0]?.id ?? ''),
        url: project?.url ?? '',
        referrer: project?.referrer ?? '',
        commission_fee: String(project?.commission_fee ?? ''),
        is_active: project?.is_active ?? true,
    });

    function submit(event: FormEvent) {
        event.preventDefault();

        if (project) {
            form.put(`/projects/${project.id}`);
        } else {
            form.post('/projects');
        }
    }

    return (
        <FormShell title={project ? 'Edit Project' : 'New Project'}>
            <form onSubmit={submit} className="grid gap-4">
                <Field label="Name" error={form.errors.name}>
                    <Input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} />
                </Field>
                <Field label="Owner" error={form.errors.owner_id}>
                    <Select value={form.data.owner_id} onValueChange={(value) => form.setData('owner_id', value)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select owner" />
                        </SelectTrigger>
                        <SelectContent>
                            {owners.map((owner) => (
                                <SelectItem key={owner.id} value={String(owner.id)}>
                                    {owner.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
                <Field label="URL" error={form.errors.url}>
                    <Input value={form.data.url} onChange={(event) => form.setData('url', event.target.value)} />
                </Field>
                <Field label="Referrer" error={form.errors.referrer}>
                    <Input value={form.data.referrer} onChange={(event) => form.setData('referrer', event.target.value)} />
                </Field>
                <Field label="Commission Fee" error={form.errors.commission_fee}>
                    <Input type="number" value={form.data.commission_fee} onChange={(event) => form.setData('commission_fee', event.target.value)} />
                </Field>
                <CheckField label="Active" checked={form.data.is_active} onChange={(checked) => form.setData('is_active', checked)} />
                <FormActions cancelHref="/projects" processing={form.processing} />
            </form>
        </FormShell>
    );
}
