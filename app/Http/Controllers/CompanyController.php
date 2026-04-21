<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function index(Request $request)
    {
        $companies = Company::query()
            ->when($request->string('search')->toString(), function ($query, string $search) {
                $query->where('name', 'like', "%{$search}%")->orWhere('code', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('companies/index', [
            'companies' => $companies,
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        $this->rememberFormOrigin(request());

        return Inertia::render('companies/form', ['company' => null]);
    }

    public function store(Request $request)
    {
        Company::create($this->validated($request));

        return $this->redirectToFormOrigin(route('companies.index'));
    }

    public function edit(Company $company)
    {
        $this->rememberFormOrigin(request());

        return Inertia::render('companies/form', ['company' => $company]);
    }

    public function update(Request $request, Company $company)
    {
        $company->update($this->validated($request));

        return $this->redirectToFormOrigin(route('companies.index'));
    }

    public function destroy(Company $company)
    {
        $company->delete();

        return to_route('companies.index');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:255'],
        ]);
    }
}
