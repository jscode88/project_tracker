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
    received: number;
    expenses: number;
    net: number;
}

interface TotalRow {
    currency: string;
    received: number;
    expenses: number;
    net: number;
}

interface MonthlySummaryRow {
    project_id?: number;
    currency: string;
    year: number;
    month: number;
    received: number;
    expenses: number;
    net: number;
}

function TotalsTable({ received, expenses, net, currency }: {
    received: number;
    expenses: number;
    net: number;
    currency: string;
}) {
    return (
        <table className="w-full table-fixed text-xs sm:text-sm">
            <thead>
                <tr className="text-left text-muted-foreground">
                    <th className="pb-1 pr-1 font-medium">Received</th>
                    <th className="px-1 pb-1 text-right font-medium">Expenses</th>
                    <th className="pb-1 pl-1 text-right font-medium">Net</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="pr-1 font-semibold">{money(received, currency)}</td>
                    <td className="px-1 text-right font-semibold text-destructive">{money(expenses, currency)}</td>
                    <td className="pl-1 text-right font-semibold">{money(net, currency)}</td>
                </tr>
            </tbody>
        </table>
    );
}

export default function PaymentsIndex({
    payments,
    summary,
    monthlySummary,
    monthlyGrandTotal,
    grandTotal,
    project,
    years,
    selectedYear,
}: {
    payments: Paginated<Payment>;
    summary: SummaryRow[];
    monthlySummary: MonthlySummaryRow[];
    monthlyGrandTotal: MonthlySummaryRow[];
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
                    <div className="mt-3 space-y-4">
                        {grandTotal.map((row) => (
                            <div key={row.currency}>
                                <div className="mb-2 text-xs font-medium text-muted-foreground">{row.currency}</div>
                                <TotalsTable received={row.received} expenses={row.expenses} net={row.net} currency={row.currency} />
                            </div>
                        ))}
                    </div>
                    <Collapsible className="mt-3 border-t pt-3">
                        <CollapsibleTrigger asChild>
                            <Button type="button" variant="ghost" size="sm" className="group w-full justify-between px-2">
                                Monthly totals
                                <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="mt-3">
                                <table className="w-full table-fixed text-xs sm:text-sm">
                                    <thead><tr className="border-b text-left text-muted-foreground"><th className="w-[27%] py-2 pr-1 font-medium">Month</th><th className="w-[25%] px-1 py-2 text-right font-medium">Received</th><th className="w-[25%] px-1 py-2 text-right font-medium">Expenses</th><th className="w-[23%] py-2 pl-1 text-right font-medium">Net</th></tr></thead>
                                    <tbody>{monthlyGrandTotal.map((month) => (
                                        <tr key={`${month.currency}-${month.year}-${month.month}`} className="border-b last:border-0">
                                            <td className="py-2 pr-1 font-medium leading-tight">{new Intl.DateTimeFormat(undefined, { month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(month.year, month.month - 1, 1)))} {month.year}<span className="block text-muted-foreground">{month.currency}</span></td>
                                            <td className="px-1 py-2 text-right">{money(month.received, month.currency)}</td>
                                            <td className="px-1 py-2 text-right text-destructive">{money(month.expenses, month.currency)}</td>
                                            <td className="py-2 pl-1 text-right">{money(month.net, month.currency)}</td>
                                        </tr>
                                    ))}</tbody>
                                </table>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
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
                            <div className="mt-2"><TotalsTable received={row.received} expenses={row.expenses} net={row.net} currency={row.currency} /></div>
                            <Collapsible className="mt-3 border-t pt-3">
                                <CollapsibleTrigger asChild>
                                    <Button type="button" variant="ghost" size="sm" className="group w-full justify-between px-2">
                                        Monthly totals
                                        <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="mt-2">
                                        <table className="w-full table-fixed text-xs sm:text-sm">
                                            <thead><tr className="border-b text-left text-muted-foreground"><th className="w-[27%] py-2 pr-1 font-medium">Month</th><th className="w-[25%] px-1 py-2 text-right font-medium">Received</th><th className="w-[25%] px-1 py-2 text-right font-medium">Expenses</th><th className="w-[23%] py-2 pl-1 text-right font-medium">Net</th></tr></thead>
                                            <tbody>{monthlySummary
                                                .filter((month) => month.project_id === row.project_id && month.currency === row.currency)
                                                .map((month) => (
                                                    <tr key={`${month.year}-${month.month}`} className="border-b last:border-0">
                                                        <td className="py-2 pr-1 font-medium">{new Intl.DateTimeFormat(undefined, { month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(month.year, month.month - 1, 1)))} {month.year}</td>
                                                        <td className="px-1 py-2 text-right">{money(month.received, month.currency)}</td>
                                                        <td className="px-1 py-2 text-right text-destructive">{money(month.expenses, month.currency)}</td>
                                                        <td className="py-2 pl-1 text-right">{money(month.net, month.currency)}</td>
                                                    </tr>
                                                ))}</tbody>
                                        </table>
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
