import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { AmountInput, CheckField, DatePicker, Field, FormActions, FormShell, Textarea } from '@/components/resource';
import { Input } from '@/components/ui/input';
import type { Project, Service } from '@/types';

export default function ServiceForm({ project, service }: { project: Project; service: Service }) {
    const form = useForm({
        start_date: service.start_date,
        end_date: service.end_date,
        currency: service.currency,
        amount: String(service.amount),
        notes: service.notes ?? '',
        is_active: service.is_active,
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        form.put(`/services/${service.id}`);
    }

    return (
        <FormShell title={`Edit ${service.type} Service`}>
            <form onSubmit={submit} className="grid gap-4">
                <Field label="Project"><Input value={project.name} disabled /></Field>
                <Field label="Start Date" error={form.errors.start_date}><DatePicker value={form.data.start_date} onChange={(value) => form.setData('start_date', value)} /></Field>
                <Field label="End Date" error={form.errors.end_date}><DatePicker value={form.data.end_date} onChange={(value) => form.setData('end_date', value)} /></Field>
                <Field label="Amount" error={form.errors.amount}><AmountInput value={form.data.amount} onChange={(value) => form.setData('amount', value)} /></Field>
                <Field label="Currency" error={form.errors.currency}><Input value={form.data.currency} onChange={(event) => form.setData('currency', event.target.value)} /></Field>
                <CheckField label="Active" checked={form.data.is_active} onChange={(checked) => form.setData('is_active', checked)} />
                <Field label="Notes" error={form.errors.notes}><Textarea value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} /></Field>
                <FormActions cancelHref={`/projects/${project.id}/services`} processing={form.processing} />
            </form>
        </FormShell>
    );
}
