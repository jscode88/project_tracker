import { Link } from '@inertiajs/react';
import { CreditCard, Wrench } from 'lucide-react';
import { CrudActions, DataTable, PageBody, PageHeader, Pagination, SearchBar } from '@/components/resource';
import { Button } from '@/components/ui/button';
import type { Paginated, Project, ProjectOwner } from '@/types';

export default function ProjectsIndex({ projects, owner, filters }: { projects: Paginated<Project>; owner?: ProjectOwner | null; filters: { search?: string } }) {
    const action = owner ? `/project-owners/${owner.id}/projects` : '/projects';
    const createHref = owner ? `/projects/create?owner_id=${owner.id}` : '/projects/create';

    return (
        <>
            <PageHeader title={owner ? `${owner.name} Projects` : 'Projects'} description="Project portfolio with owners, referrers, services, and payment history." actionHref={createHref} actionLabel="Project" />
            <PageBody>
                <SearchBar action={action} defaultValue={filters.search ?? ''} />
                <DataTable>
                    <thead className="bg-muted/50 text-left">
                        <tr>
                            <th className="px-4 py-3">Project</th>
                            <th className="px-4 py-3">Owner</th>
                            <th className="px-4 py-3">URL</th>
                            <th className="px-4 py-3">Referrer</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.data.map((project) => (
                            <tr key={project.id} className="border-t">
                                <td className="px-4 py-3 font-medium">{project.name}</td>
                                <td className="px-4 py-3">{project.owner?.name ?? '-'}</td>
                                <td className="px-4 py-3">{project.url ? <a className="text-primary underline-offset-4 hover:underline" href={project.url}>{project.url}</a> : '-'}</td>
                                <td className="px-4 py-3">{project.referrer ?? '-'}</td>
                                <td className="px-4 py-3">{project.is_active ? 'Active' : 'Inactive'}</td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <Button asChild size="icon" variant="outline" title="Services">
                                            <Link href={`/projects/${project.id}/services`}>
                                                <Wrench className="size-4" />
                                            </Link>
                                        </Button>
                                        <Button asChild size="icon" variant="outline" title="Payments">
                                            <Link href={`/projects/${project.id}/payments`}>
                                                <CreditCard className="size-4" />
                                            </Link>
                                        </Button>
                                        <CrudActions editHref={`/projects/${project.id}/edit`} deleteHref={`/projects/${project.id}`} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </DataTable>
                <Pagination page={projects} />
            </PageBody>
        </>
    );
}
