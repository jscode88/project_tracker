<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::query()
            ->with('usergroup')
            ->when($request->string('search')->toString(), function ($query, string $search) {
                $query->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('users/index', [
            'users' => $users,
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        $this->rememberFormOrigin(request());

        return Inertia::render('users/form', [
            'managedUser' => null,
            'usergroups' => UserGroup::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request, true);
        $data['password'] = Hash::make($data['password']);
        User::create($data);

        return $this->redirectToFormOrigin(route('users.index'));
    }

    public function edit(User $user)
    {
        $this->rememberFormOrigin(request());

        return Inertia::render('users/form', [
            'managedUser' => $user,
            'usergroups' => UserGroup::orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $data = $this->validated($request, false);
        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return $this->redirectToFormOrigin(route('users.index'));
    }

    public function destroy(User $user)
    {
        abort_if($user->is(auth()->user()), 422, 'You cannot delete your own user.');
        $user->delete();

        return to_route('users.index');
    }

    private function validated(Request $request, bool $creating): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', $creating ? 'unique:users,email' : 'unique:users,email,'.$request->route('user')?->id],
            'password' => [$creating ? 'required' : 'nullable', 'string', 'min:8'],
            'usergroup_id' => ['nullable', 'exists:usergroups,id'],
        ]);
    }
}
