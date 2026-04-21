import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { AmountInput, CheckField, DatePicker, Field, FormActions, FormShell, Textarea } from '@/components/resource';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Payment, Project } from '@/types';

export default function PaymentForm({ payment, projects, selectedProject }: { payment: Payment | null; projects: Project[]; selectedProject: number | null }) {
    const form = useForm({
        project_id: String(payment?.project_id ?? selectedProject ?? projects[0]?.id ?? ''),
        date: payment?.date ?? new Date().toISOString().slice(0, 10),
        amount: String(Math.abs(payment?.amount ?? 0)),
        currency: payment?.currency ?? 'IDR',
        notes: payment?.notes ?? '',
        is_expense: (payment?.amount ?? 0) < 0,
    });

    function submit(event: FormEvent) {
        event.preventDefault();

        if (payment) {
            form.put(`/payments/${payment.id}`);
        } else {
            form.post('/payments');
        }
    }

    return (
        <FormShell title={payment ? 'Edit Payment' : 'New Payment'}>
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
                <Field label="Amount" error={form.errors.amount}>
                    <AmountInput value={form.data.amount} onChange={(value) => form.setData('amount', value)} />
                </Field>
                <Field label="Currency" error={form.errors.currency}>
                    <Input value={form.data.currency} onChange={(event) => form.setData('currency', event.target.value)} />
                </Field>
                <CheckField label="Expense" checked={form.data.is_expense} onChange={(checked) => form.setData('is_expense', checked)} />
                <Field label="Notes" error={form.errors.notes}>
                    <Textarea value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} />
                </Field>
                <FormActions cancelHref="/payments" processing={form.processing} />
            </form>
        </FormShell>
    );
}
