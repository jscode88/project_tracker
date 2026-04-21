<?php

namespace App\Http\Controllers;

use App\Models\UserGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserGroupController extends Controller
{
    public function index(Request $request)
    {
        $usergroups = UserGroup::query()
            ->when($request->string('search')->toString(), fn ($query, $search) => $query->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('usergroups/index', [
            'usergroups' => $usergroups,
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        $this->rememberFormOrigin(request());

        return Inertia::render('usergroups/form', ['usergroup' => null]);
    }

    public function store(Request $request)
    {
        UserGroup::create($this->validated($request));

        return $this->redirectToFormOrigin(route('usergroups.index'));
    }

    public function edit(UserGroup $usergroup)
    {
        $this->rememberFormOrigin(request());

        return Inertia::render('usergroups/form', ['usergroup' => $usergroup]);
    }

    public function update(Request $request, UserGroup $usergroup)
    {
        $usergroup->update($this->validated($request));

        return $this->redirectToFormOrigin(route('usergroups.index'));
    }

    public function destroy(UserGroup $usergroup)
    {
        $usergroup->delete();

        return to_route('usergroups.index');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'permissions' => ['nullable', 'array'],
        ]);
    }
}
