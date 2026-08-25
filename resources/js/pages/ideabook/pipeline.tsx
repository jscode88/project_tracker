import { Link } from '@inertiajs/react';
import { CalendarDays } from 'lucide-react';
import { PageBody, PageHeader } from '@/components/resource';
import { Button } from '@/components/ui/button';

type EnquiryStatus =
    | 'new_enquiry'
    | 'discovery'
    | 'proposal_drafted'
    | 'proposal_sent'
    | 'won'
    | 'lost';

type Enquiry = {
    id: number;
    title: string;
    content: string;
    status: EnquiryStatus;
    customer_name: string | null;
    project_owner_name: string | null;
    project_name: string | null;
    expected_budget: string | null;
    expected_budget_currency: string | null;
    follow_up_date: string | null;
    next_action: string | null;
};

const stages: Array<{ value: EnquiryStatus; label: string }> = [
    { value: 'new_enquiry', label: 'New enquiry' },
    { value: 'discovery', label: 'Discovery' },
    { value: 'proposal_drafted', label: 'Proposal drafted' },
    { value: 'proposal_sent', label: 'Proposal sent' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' },
];

function formatBudget(enquiry: Enquiry) {
    if (!enquiry.expected_budget) {
        return null;
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: enquiry.expected_budget_currency ?? 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(enquiry.expected_budget));
}

export default function EnquiryPipeline({
    enquiries,
}: {
    enquiries: Enquiry[];
}) {
    const today = new Date().toISOString().slice(0, 10);

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <PageHeader
                title="Enquiry Pipeline"
                description="Customer enquiries from discovery through project conversion."
            />
            <PageBody>
                <div className="flex shrink-0 justify-end">
                    <Button asChild variant="outline">
                        <Link href="/ideabook">
                            <CalendarDays className="size-4" />
                            Calendar
                        </Link>
                    </Button>
                </div>

                <div className="grid min-h-0 min-w-[1440px] flex-1 grid-cols-6 gap-3 overflow-x-auto">
                    {stages.map((stage) => {
                        const stageEnquiries = enquiries.filter(
                            (enquiry) => enquiry.status === stage.value,
                        );

                        return (
                            <section
                                key={stage.value}
                                className="flex min-h-0 flex-col border-t-2 border-border pt-3"
                            >
                                <div className="flex shrink-0 items-center justify-between px-1 pb-3">
                                    <h2 className="text-sm font-semibold">
                                        {stage.label}
                                    </h2>
                                    <span className="text-xs text-muted-foreground">
                                        {stageEnquiries.length}
                                    </span>
                                </div>
                                <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
                                    {stageEnquiries.map((enquiry) => {
                                        const budget = formatBudget(enquiry);
                                        const overdue =
                                            enquiry.follow_up_date !== null &&
                                            enquiry.follow_up_date < today &&
                                            !['won', 'lost'].includes(
                                                enquiry.status,
                                            );

                                        return (
                                            <Link
                                                key={enquiry.id}
                                                href={`/ideabook?entry=${enquiry.id}`}
                                                className="rounded-md border bg-card p-3 transition-colors hover:bg-muted/40"
                                            >
                                                <div className="text-sm font-medium">
                                                    {enquiry.title}
                                                </div>
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    {enquiry.customer_name ??
                                                        enquiry.project_owner_name ??
                                                        'Customer not set'}
                                                </div>
                                                {budget && (
                                                    <div className="mt-3 text-sm font-medium">
                                                        {budget}
                                                    </div>
                                                )}
                                                {enquiry.next_action && (
                                                    <div className="mt-3 text-xs text-muted-foreground">
                                                        Next:{' '}
                                                        {enquiry.next_action}
                                                    </div>
                                                )}
                                                {enquiry.follow_up_date && (
                                                    <div
                                                        className={
                                                            overdue
                                                                ? 'mt-2 text-xs font-medium text-destructive'
                                                                : 'mt-2 text-xs text-muted-foreground'
                                                        }
                                                    >
                                                        Follow up:{' '}
                                                        {enquiry.follow_up_date}
                                                    </div>
                                                )}
                                                {enquiry.project_name && (
                                                    <div className="mt-2 text-xs text-muted-foreground">
                                                        Project:{' '}
                                                        {enquiry.project_name}
                                                    </div>
                                                )}
                                            </Link>
                                        );
                                    })}
                                    {stageEnquiries.length === 0 && (
                                        <div className="border-t py-6 text-center text-xs text-muted-foreground">
                                            No enquiries
                                        </div>
                                    )}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </PageBody>
        </div>
    );
}

EnquiryPipeline.layout = {
    breadcrumbs: [
        {
            title: 'Enquiry Pipeline',
            href: '/ideabook/pipeline',
        },
    ],
};
