import { Head } from '@inertiajs/react';

type IdeaEntry = {
    id: number;
    title: string;
    content: string;
    is_validated: boolean;
    validation_content: string | null;
    created_at: string;
    updated_at: string;
};

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

export default function IdeasIndex({ ideas }: { ideas: IdeaEntry[] }) {
    return (
        <>
            <Head title="Saved Solutions" />

            <div className="flex h-full flex-1 flex-col overflow-hidden px-4 py-4 sm:px-6 sm:py-6">
                <div className="border-b border-border pb-4">
                    <p className="text-sm font-medium text-muted-foreground">
                        IdeaBook
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Saved Solutions
                    </h1>
                </div>

                <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border">
                    <div className="min-h-0 flex-1 overflow-auto">
                        <table className="w-full min-w-[900px] border-collapse text-sm">
                            <thead className="sticky top-0 z-10 bg-muted/40">
                                <tr className="border-b border-border">
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                        Title
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                        Content
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                        Accepted
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
                                {ideas.map((idea) => (
                                    <tr
                                        key={idea.id}
                                        className="border-b border-border align-top"
                                    >
                                        <td className="px-4 py-3 font-medium">
                                            {idea.title}
                                        </td>
                                        <td className="max-w-[420px] px-4 py-3 text-muted-foreground">
                                            {summarizeContent(idea.content)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {idea.is_validated ? 'Yes' : 'No'}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {formatDateTime(idea.created_at)}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {formatDateTime(idea.updated_at)}
                                        </td>
                                    </tr>
                                ))}
                                {ideas.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-4 py-10 text-center text-muted-foreground"
                                        >
                                            No saved solutions yet.
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

IdeasIndex.layout = {
    breadcrumbs: [
        {
            title: 'Saved Solutions',
            href: '/ideabook/ideas',
        },
    ],
};
