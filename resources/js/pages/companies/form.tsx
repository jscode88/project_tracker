import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Field, FormActions, FormShell } from '@/components/resource';
import { Input } from '@/components/ui/input';
import type { Company } from '@/types';

export default function CompanyForm({ company }: { company: Company | null }) {
    const form = useForm({ code: company?.code ?? '', name: company?.name ?? '' });

    function submit(event: FormEvent) {
        event.preventDefault();

        if (company) {
            form.put(`/companies/${company.id}`);
        } else {
            form.post('/companies');
        }
    }

    return (
        <FormShell title={company ? 'Edit Company' : 'New Company'}>
            <form onSubmit={submit} className="grid gap-4">
                <Field label="Code" error={form.errors.code}><Input value={form.data.code} onChange={(event) => form.setData('code', event.target.value)} /></Field>
                <Field label="Name" error={form.errors.name}><Input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} /></Field>
                <FormActions cancelHref="/companies" processing={form.processing} />
            </form>
        </FormShell>
    );
}
