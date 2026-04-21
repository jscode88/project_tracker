import { CrudActions, DataTable, PageBody, PageHeader, Pagination, SearchBar } from '@/components/resource';
import type { ManagedUser, Paginated } from '@/types';

export default function UsersIndex({ users, filters }: { users: Paginated<ManagedUser>; filters: { search?: string } }) {
    return (
        <>
            <PageHeader title="Users" description="Application users and assigned groups." actionHref="/users/create" actionLabel="User" />
            <PageBody>
                <SearchBar action="/users" defaultValue={filters.search ?? ''} />
                <DataTable>
                    <thead className="bg-muted/50 text-left"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Group</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
                    <tbody>
                        {users.data.map((user) => (
                            <tr key={user.id} className="border-t">
                                <td className="px-4 py-3 font-medium">{user.name}</td>
                                <td className="px-4 py-3">{user.email}</td>
                                <td className="px-4 py-3">{user.usergroup?.name ?? '-'}</td>
                                <td className="px-4 py-3"><CrudActions editHref={`/users/${user.id}/edit`} deleteHref={`/users/${user.id}`} /></td>
                            </tr>
                        ))}
                    </tbody>
                </DataTable>
                <Pagination page={users} />
            </PageBody>
        </>
    );
}
