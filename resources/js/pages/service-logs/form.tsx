import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { DatePicker, Field, FormActions, FormShell, Textarea } from '@/components/resource';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Project, ServiceLog } from '@/types';

export default function ServiceLogForm({ serviceLog, projects, selectedProject }: { serviceLog: ServiceLog | null; projects: Project[]; selectedProject: number | null }) {
    const form = useForm({
        project_id: String(serviceLog?.project_id ?? selectedProject ?? projects[0]?.id ?? ''),
        date: serviceLog?.date ?? new Date().toISOString().slice(0, 10),
        notes: serviceLog?.notes ?? '',
    });

    function submit(event: FormEvent) {
        event.preventDefault();

        if (serviceLog) {
            form.put(`/service-logs/${serviceLog.id}`);
        } else {
            form.post('/service-logs');
        }
    }

    return (
        <FormShell title={serviceLog ? 'Edit Service Log' : 'New Service Log'}>
            <form onSubmit={submit} className="grid gap-4">
                <Field label="Project" error={form.errors.project_id}>
                    <Select value={form.data.project_id} onValueChange={(value) => form.setData('project_id', value)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                            {projects.map((project) => (
                                <SelectItem key={project.id} value={String(project.id)}>
                                    {project.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
                <Field label="Date" error={form.errors.date}>
                    <DatePicker value={form.data.date} onChange={(value) => form.setData('date', value)} />
                </Field>
                <Field label="Notes" error={form.errors.notes}>
                    <Textarea value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} />
                </Field>
                <FormActions cancelHref={form.data.project_id ? `/projects/${form.data.project_id}/services` : '/projects'} processing={form.processing} />
            </form>
        </FormShell>
    );
}
