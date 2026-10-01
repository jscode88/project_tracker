import { router } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import {
    CrudActions,
    DataTable,
    money,
    PageBody,
    PageHeader,
    Pagination,
} from '@/components/resource';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Paginated, Payment, Project } from '@/types';

interface SummaryRow {
    project_id: number;
    project?: Project;
    currency: string;
    amount: number;
}

interface TotalRow {
    currency: string;
    amount: number;
}

interface MonthlySummaryRow {
    project_id: number;
    currency: string;
    year: number;
    month: number;
    amount: number;
}

export default function PaymentsIndex({
    payments,
    summary,
    monthlySummary,
    grandTotal,
    project,
    years,
    selectedYear,
}: {
    payments: Paginated<Payment>;
    summary: SummaryRow[];
    monthlySummary: MonthlySummaryRow[];
    grandTotal: TotalRow[];
    project?: Project | null;
    years: number[];
    selectedYear: number | 'all';
}) {
    const createHref = project
        ? `/payments/create?project_id=${project.id}`
        : '/payments/create';
    const filterHref = project
        ? `/projects/${project.id}/payments`
        : '/payments';

    function changeYear(year: string) {
        router.get(filterHref, year === 'all' ? { year: 'all' } : { year }, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    }

    return (
        <>
            <PageHeader
                title={project ? `${project.name} Payments` : 'Payments'}
                description="Income, expenses, and project totals."
                actionHref={createHref}
                actionLabel="Payment"
            />
            <PageBody>
                <div className="flex max-w-xs flex-col gap-2">
                    <label
                        className="text-sm font-medium"
                        htmlFor="payment-year"
                    >
                        Year
                    </label>
                    <Select
                        value={String(selectedYear)}
                        onValueChange={changeYear}
                    >
                        <SelectTrigger id="payment-year" className="w-full">
                            <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All years</SelectItem>
                            {years.map((year) => (
                                <SelectItem key={year} value={String(year)}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <div className="min-h-10 text-sm leading-5 text-muted-foreground">
                        Total Payments{' '}
                        {selectedYear === 'all'
                            ? 'for all years'
                            : `in ${selectedYear}`}
                    </div>
                    {grandTotal.length ? (
                        grandTotal.map((row) => (
                            <div
                                key={row.currency}
                                className={
                                    row.amount < 0
                                        ? 'mt-2 text-xl font-semibold text-destructive'
                                        : 'mt-2 text-xl font-semibold'
                                }
                            >
                                {money(row.amount, row.currency)}
                            </div>
                        ))
                    ) : (
                        <div className="mt-2 text-xl font-semibold">
                            {money(0)}
                        </div>
                    )}
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                    {summary.map((row) => (
                        <div
                            key={`${row.project_id}-${row.currency}`}
                            className="rounded-lg border bg-card p-4"
                        >
                            <div className="min-h-10 text-sm leading-5 text-muted-foreground">
                                {row.project?.name ?? 'Project'}
                            </div>
                            <div className="mt-2 text-xl font-semibold">
                                {money(row.amount, row.currency)}
                            </div>
                            <Collapsible className="mt-3 border-t pt-3">
                                <CollapsibleTrigger asChild>
                                    <Button type="button" variant="ghost" size="sm" className="w-full justify-between px-2">
                                        Monthly totals
                                        <ChevronDown className="size-4" />
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="mt-2 space-y-2 text-sm">
                                        {monthlySummary
                                            .filter((month) => month.project_id === row.project_id && month.currency === row.currency)
                                            .map((month) => (
                                                <div key={`${month.year}-${month.month}`} className="flex justify-between gap-3">
                                                    <span className="text-muted-foreground">
                                                        {new Intl.DateTimeFormat(undefined, { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(month.year, month.month - 1, 1)))} {month.year}
                                                    </span>
                                                    <span className={month.amount < 0 ? 'text-destructive' : ''}>
                                                        {money(month.amount, month.currency)}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </div>
                    ))}
                </div>
                <DataTable>
                    <thead className="bg-muted/50 text-left">
                        <tr>
                            <th className="px-4 py-3">Project</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Notes</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.data.map((payment) => (
                            <tr key={payment.id} className="border-t">
                                <td className="px-4 py-3 font-medium">
                                    {payment.project?.name ?? '-'}
                                </td>
                                <td className="px-4 py-3">{payment.date}</td>
                                <td className="px-4 py-3">
                                    {payment.notes ?? '-'}
                                </td>
                                <td
                                    className={
                                        payment.amount < 0
                                            ? 'px-4 py-3 text-right text-destructive'
                                            : 'px-4 py-3 text-right'
                                    }
                                >
                                    {money(payment.amount, payment.currency)}
                                </td>
                                <td className="px-4 py-3">
                                    <CrudActions
                                        editHref={`/payments/${payment.id}/edit`}
                                        deleteHref={`/payments/${payment.id}`}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </DataTable>
                <Pagination page={payments} />
            </PageBody>
        </>
    );
}
