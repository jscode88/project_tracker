import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import {
    CheckField,
    Field,
    FormActions,
    FormShell,
} from '@/components/resource';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { PriceCalculation, Project, ProjectOwner } from '@/types';

export default function ProjectForm({
    project,
    owners,
    priceCalculations,
    selectedOwner,
    conversionEntry,
}: {
    project: Project | null;
    owners: ProjectOwner[];
    priceCalculations: PriceCalculation[];
    selectedOwner?: number | null;
    conversionEntry?: {
        id: number;
        title: string;
        customer_name: string | null;
    } | null;
}) {
    const form = useForm({
        name: project?.name ?? conversionEntry?.title ?? '',
        owner_id: String(
            project?.owner_id ??
                selectedOwner ??
                (conversionEntry ? '' : (owners[0]?.id ?? '')),
        ),
        url: project?.url ?? '',
        referrer: project?.referrer ?? '',
        commission_fee: String(project?.commission_fee ?? ''),
        price_calculation_ids:
            project?.price_calculations?.map((calculation) =>
                String(calculation.id),
            ) ?? [],
        is_active: project?.is_active ?? true,
        ideabook_entry_id: conversionEntry ? String(conversionEntry.id) : null,
    });

    function togglePriceCalculation(id: number) {
        const value = String(id);
        const selected = form.data.price_calculation_ids.includes(value);

        form.setData(
            'price_calculation_ids',
            selected
                ? form.data.price_calculation_ids.filter(
                      (item) => item !== value,
                  )
                : [...form.data.price_calculation_ids, value],
        );
    }

    function submit(event: FormEvent) {
        event.preventDefault();

        if (project) {
            form.put(`/projects/${project.id}`);
        } else {
            form.post('/projects');
        }
    }

    return (
        <FormShell
            title={
                project
                    ? 'Edit Project'
                    : conversionEntry
                      ? 'Convert Enquiry to Project'
                      : 'New Project'
            }
        >
            <form onSubmit={submit} className="grid gap-4">
                {conversionEntry && (
                    <p className="border-b pb-4 text-sm text-muted-foreground">
                        Enquiry from{' '}
                        <span className="font-medium text-foreground">
                            {conversionEntry.customer_name ?? 'Customer'}
                        </span>
                    </p>
                )}
                <Field label="Name" error={form.errors.name}>
                    <Input
                        value={form.data.name}
                        onChange={(event) =>
                            form.setData('name', event.target.value)
                        }
                    />
                </Field>
                <Field label="Owner" error={form.errors.owner_id}>
                    <Select
                        value={form.data.owner_id}
                        onValueChange={(value) =>
                            form.setData('owner_id', value)
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select owner" />
                        </SelectTrigger>
                        <SelectContent>
                            {owners.map((owner) => (
                                <SelectItem
                                    key={owner.id}
                                    value={String(owner.id)}
                                >
                                    {owner.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
                <Field label="URL" error={form.errors.url}>
                    <Input
                        value={form.data.url}
                        onChange={(event) =>
                            form.setData('url', event.target.value)
                        }
                    />
                </Field>
                <Field label="Referrer" error={form.errors.referrer}>
                    <Input
                        value={form.data.referrer}
                        onChange={(event) =>
                            form.setData('referrer', event.target.value)
                        }
                    />
                </Field>
                <Field
                    label="Commission Fee"
                    error={form.errors.commission_fee}
                >
                    <Input
                        type="number"
                        value={form.data.commission_fee}
                        onChange={(event) =>
                            form.setData('commission_fee', event.target.value)
                        }
                    />
                </Field>
                <Field
                    label="Price Calculations"
                    error={form.errors.price_calculation_ids}
                >
                    <div className="grid gap-2 rounded-md border p-3">
                        {priceCalculations.length ? (
                            priceCalculations.map((calculation) => (
                                <label
                                    key={calculation.id}
                                    className="flex items-center gap-2 text-sm"
                                >
                                    <Checkbox
                                        checked={form.data.price_calculation_ids.includes(
                                            String(calculation.id),
                                        )}
                                        onCheckedChange={() =>
                                            togglePriceCalculation(
                                                calculation.id,
                                            )
                                        }
                                    />
                                    <span>
                                        #{calculation.id} - {calculation.name}
                                    </span>
                                </label>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No saved price calculations yet.
                            </p>
                        )}
                    </div>
                </Field>
                <CheckField
                    label="Active"
                    checked={form.data.is_active}
                    onChange={(checked) => form.setData('is_active', checked)}
                />
                <FormActions
                    cancelHref={
                        conversionEntry ? '/ideabook/pipeline' : '/projects'
                    }
                    processing={form.processing}
                />
            </form>
        </FormShell>
    );
}
