import { Link } from '@inertiajs/react';
import { CalendarPlus, CreditCard } from 'lucide-react';
import { CrudActions, DataTable, money, PageBody, PageHeader, Pagination } from '@/components/resource';
import { Button } from '@/components/ui/button';
import type { Paginated, Payment, Project, Service, ServiceLog } from '@/types';

export default function ServicesIndex({
    project,
    services,
    payments,
    expenses,
    logs,
}: {
    project: Project;
    services: Service[];
    payments: Paginated<Payment>;
    expenses: Paginated<Payment>;
    logs: Paginated<ServiceLog>;
}) {
    return (
        <>
            <PageHeader title={`${project.name} Services`} description={project.owner?.name} />
            <PageBody>
                <div className="flex flex-wrap gap-2">
                    <Button asChild>
                        <Link href={`/payments/create?project_id=${project.id}`}>
                            <CreditCard className="size-4" />
                            Payment
                        </Link>
                    </Button>
                    <Button asChild variant="secondary">
                        <Link href={`/service-logs/create?project_id=${project.id}`}>
                            <CalendarPlus className="size-4" />
                            Service Log
                        </Link>
                    </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-4">
                    {services.map((service) => (
                        <Link key={service.id} href={`/projects/${project.id}/services/${service.id}/edit`} className="rounded-lg border bg-card p-4 hover:bg-muted/40">
                            <div className="flex items-center justify-between">
                                <div className="font-medium">{service.type}</div>
                                <span className={service.is_active ? 'text-xs text-green-600' : 'text-xs text-muted-foreground'}>{service.is_active ? 'Active' : 'Inactive'}</span>
                            </div>
                            <div className="mt-2 text-sm text-muted-foreground">{service.start_date} to {service.end_date}</div>
                            <div className="mt-2 text-lg font-semibold">{money(service.amount, service.currency)}</div>
                        </Link>
                    ))}
                </div>
                <section className="grid gap-3 lg:grid-cols-2">
                    <h2 className="text-lg font-semibold">Payments</h2>
                    <h2 className="hidden text-lg font-semibold lg:block">Expenses</h2>
                    <PaymentTable page={payments} />
                    <h2 className="text-lg font-semibold lg:hidden">Expenses</h2>
                    <PaymentTable page={expenses} />
                </section>
                <section className="grid gap-3">
                    <h2 className="text-lg font-semibold">Service Logs</h2>
                    <DataTable>
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Notes</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.data.map((log) => (
                                <tr key={log.id} className="border-t">
                                    <td className="px-4 py-3">{log.date}</td>
                                    <td className="px-4 py-3">{log.notes ?? '-'}</td>
                                    <td className="px-4 py-3">
                                        <CrudActions editHref={`/service-logs/${log.id}/edit`} deleteHref={`/service-logs/${log.id}`} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </DataTable>
                    <Pagination page={logs} />
                </section>
            </PageBody>
        </>
    );
}

function PaymentTable({ page }: { page: Paginated<Payment> }) {
    return (
        <div className="min-w-0">
            <DataTable className="min-w-full table-fixed">
                <thead className="bg-muted/50 text-left">
                    <tr>
                        <th className="w-32 px-4 py-3">Date</th>
                        <th className="px-4 py-3">Notes</th>
                        <th className="w-36 px-4 py-3 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {page.data.map((payment) => (
                        <tr key={payment.id} className="border-t">
                            <td className="px-4 py-3">{payment.date}</td>
                            <td className="px-4 py-3 break-words">{payment.notes ?? '-'}</td>
                            <td className="px-4 py-3 text-right">{money(payment.amount, payment.currency)}</td>
                        </tr>
                    ))}
                </tbody>
            </DataTable>
        </div>
    );
}
