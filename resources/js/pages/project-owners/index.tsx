import { Link } from '@inertiajs/react';
import { FolderKanban } from 'lucide-react';
import { CrudActions, DataTable, money, PageBody, PageHeader, Pagination, SearchBar } from '@/components/resource';
import { Button } from '@/components/ui/button';
import type { Paginated, ProjectOwner } from '@/types';

export default function ProjectOwnersIndex({ owners, filters }: { owners: Paginated<ProjectOwner>; filters: { search?: string } }) {
    return (
        <>
            <PageHeader title="Project Owners" description="Clients and owners grouped by revenue and project count." actionHref="/project-owners/create" actionLabel="Owner" />
            <PageBody>
                <SearchBar action="/project-owners" defaultValue={filters.search ?? ''} />
                <DataTable>
                    <thead className="bg-muted/50 text-left">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Country</th>
                            <th className="px-4 py-3">Contact</th>
                            <th className="px-4 py-3 text-right">Projects</th>
                            <th className="px-4 py-3 text-right">Total</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {owners.data.map((owner) => (
                            <tr key={owner.id} className="border-t">
                                <td className="px-4 py-3 font-medium">{owner.name}</td>
                                <td className="px-4 py-3">{owner.country}</td>
                                <td className="px-4 py-3">{owner.contact_number ?? '-'}</td>
                                <td className="px-4 py-3 text-right">{owner.total_projects ?? 0}</td>
                                <td className="px-4 py-3 text-right">{money(owner.total_payment)}</td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <Button asChild size="icon" variant="outline" title="Projects">
                                            <Link href={`/project-owners/${owner.id}/projects`}>
                                                <FolderKanban className="size-4" />
                                            </Link>
                                        </Button>
                                        <CrudActions editHref={`/project-owners/${owner.id}/edit`} deleteHref={`/project-owners/${owner.id}`} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </DataTable>
                <Pagination page={owners} />
            </PageBody>
        </>
    );
}
