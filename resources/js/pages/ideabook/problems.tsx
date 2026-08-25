import { Head } from '@inertiajs/react';

type ProblemEntry = {
    id: number;
    idea_id: number | null;
    idea_title: string | null;
    entry_type: 'problem' | 'enquiry';
    status: string;
    project_owner_name: string | null;
    project_name: string | null;
    customer_name: string | null;
    title: string;
    content: string;
    validation_content: string | null;
    created_at: string;
    updated_at: string;
};

function formatStatus(status: ProblemEntry['status']) {
    return status
        .replaceAll('_', ' ')
        .replace(/^./, (letter) => letter.toUpperCase());
}

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}

function summarizeContent(content: string) {
    const normalized = content.replace(/\s+/g, ' ').trim();

    if (normalized.length <= 96) {
        return normalized;
    }

    return `${normalized.slice(0, 93)}...`;
}

export default function ProblemsIndex({
    problems,
}: {
    problems: ProblemEntry[];
}) {
    return (
        <>
            <Head title="Saved Entries" />

            <div className="flex h-full flex-1 flex-col overflow-hidden px-4 py-4 sm:px-6 sm:py-6">
                <div className="border-b border-border pb-4">
                    <p className="text-sm font-medium text-muted-foreground">
                        IdeaBook
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Saved Entries
                    </h1>
                </div>

                <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border">
                    <div className="min-h-0 flex-1 overflow-auto">
                        <table className="w-full min-w-[1120px] border-collapse text-sm">
                            <thead className="sticky top-0 z-10 bg-muted/40">
                                <tr className="border-b border-border">
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                        Title
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                        Type
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                        Customer
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                        Details
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                        Solution
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                        Created
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                        Updated
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {problems.map((problem) => (
                                    <tr
                                        key={problem.id}
                                        className="border-b border-border align-top"
                                    >
                                        <td className="px-4 py-3 font-medium">
                                            {problem.title}
                                        </td>
                                        <td className="max-w-[420px] px-4 py-3 text-muted-foreground">
                                            {problem.entry_type === 'enquiry'
                                                ? 'Customer enquiry'
                                                : 'Problem'}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            <div>
                                                {problem.customer_name ??
                                                    problem.project_owner_name ??
                                                    '-'}
                                            </div>
                                            {problem.project_name && (
                                                <div className="mt-1 text-xs">
                                                    Project:{' '}
                                                    {problem.project_name}
                                                </div>
                                            )}
                                        </td>
                                        <td className="max-w-[420px] px-4 py-3 text-muted-foreground">
                                            {summarizeContent(problem.content)}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {formatStatus(problem.status)}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {problem.idea_title ?? 'Not linked'}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {formatDateTime(problem.created_at)}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {formatDateTime(problem.updated_at)}
                                        </td>
                                    </tr>
                                ))}
                                {problems.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-4 py-10 text-center text-muted-foreground"
                                        >
                                            No saved entries yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

ProblemsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Saved Entries',
            href: '/ideabook/problems',
        },
    ],
};
