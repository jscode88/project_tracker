import { CrudActions, DataTable, PageBody, PageHeader, Pagination, SearchBar } from '@/components/resource';
import type { Company, Paginated } from '@/types';

export default function CompaniesIndex({ companies, filters }: { companies: Paginated<Company>; filters: { search?: string } }) {
    return (
        <>
            <PageHeader title="Companies" description="Company records for access mapping and administration." actionHref="/companies/create" actionLabel="Company" />
            <PageBody>
                <SearchBar action="/companies" defaultValue={filters.search ?? ''} />
                <DataTable>
                    <thead className="bg-muted/50 text-left"><tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Name</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
                    <tbody>
                        {companies.data.map((company) => (
                            <tr key={company.id} className="border-t">
                                <td className="px-4 py-3 font-medium">{company.code}</td>
                                <td className="px-4 py-3">{company.name}</td>
                                <td className="px-4 py-3"><CrudActions editHref={`/companies/${company.id}/edit`} deleteHref={`/companies/${company.id}`} /></td>
                            </tr>
                        ))}
                    </tbody>
                </DataTable>
                <Pagination page={companies} />
            </PageBody>
        </>
    );
}
