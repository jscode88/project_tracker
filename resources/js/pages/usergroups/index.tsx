import { CrudActions, DataTable, PageBody, PageHeader, Pagination, SearchBar } from '@/components/resource';
import type { Paginated, UserGroup } from '@/types';

export default function UserGroupsIndex({ usergroups, filters }: { usergroups: Paginated<UserGroup>; filters: { search?: string } }) {
    return (
        <>
            <PageHeader title="User Groups" description="Permission groups for administrative access." actionHref="/usergroups/create" actionLabel="Group" />
            <PageBody>
                <SearchBar action="/usergroups" defaultValue={filters.search ?? ''} />
                <DataTable>
                    <thead className="bg-muted/50 text-left"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Permissions</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
                    <tbody>
                        {usergroups.data.map((group) => (
                            <tr key={group.id} className="border-t">
                                <td className="px-4 py-3 font-medium">{group.name}</td>
                                <td className="px-4 py-3">{group.permissions?.join(', ') ?? '-'}</td>
                                <td className="px-4 py-3"><CrudActions editHref={`/usergroups/${group.id}/edit`} deleteHref={`/usergroups/${group.id}`} /></td>
                            </tr>
                        ))}
                    </tbody>
                </DataTable>
                <Pagination page={usergroups} />
            </PageBody>
        </>
    );
}
