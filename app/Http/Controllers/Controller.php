<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

abstract class Controller
{
    protected function rememberFormOrigin(Request $request): void
    {
        $origin = $request->headers->get('referer');

        if (! $origin) {
            return;
        }

        $originPath = parse_url($origin, PHP_URL_PATH);

        if (! is_string($originPath) || str_ends_with($originPath, '/create') || str_ends_with($originPath, '/edit')) {
            return;
        }

        session(['form_origin' => $origin]);
    }

    protected function redirectToFormOrigin(string $fallback): RedirectResponse
    {
        return redirect()->to(session()->pull('form_origin', $fallback));
    }
}
