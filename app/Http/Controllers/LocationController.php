<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LocationController extends Controller
{
    public function index()
    {
        $ports = Location::paginate(50);

        return Inertia::render('Ports/Index', [
            'ports' => $ports,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'port_code' => 'required|string|unique:locations,code|max:20',
            'port_name' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'country' => 'required|string|max:100',
            'port_type' => 'required|in:AIR,SEA',
        ], [
            'port_code.unique' => 'This port code already exists',
        ]);

        Location::create([
            'code' => $validated['port_code'],
            'name' => $validated['port_name'],
            'city' => $validated['city'],
            'country' => $validated['country'],
            'type' => $validated['port_type'],
            'is_active' => true,
        ]);

        return redirect()->route('locations.index');
    }

    public function update(Request $request, Location $location)
    {
        $validated = $request->validate([
            'port_code' => "required|string|unique:locations,code,{$location->id}|max:20",
            'port_name' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'country' => 'required|string|max:100',
            'port_type' => 'required|in:AIR,SEA',
        ], [
            'port_code.unique' => 'This port code already exists',
        ]);

        $location->update([
            'code' => $validated['port_code'],
            'name' => $validated['port_name'],
            'city' => $validated['city'],
            'country' => $validated['country'],
            'type' => $validated['port_type'],
        ]);

        return redirect()->route('locations.index');
    }

    public function destroy(Location $location)
    {
        $location->delete();

        return redirect()->route('locations.index');
    }

    public function bulkImport(Request $request)
    {
        $validated = $request->validate([
            'ports' => 'required|array',
            'ports.*.port_code' => 'required|string|max:20',
            'ports.*.port_name' => 'required|string|max:255',
            'ports.*.city' => 'required|string|max:100',
            'ports.*.country' => 'required|string|max:100',
            'ports.*.port_type' => 'required|in:AIR,SEA',
        ]);

        $imported = 0;
        $skipped = 0;
        $errors = [];

        foreach ($validated['ports'] as $index => $portData) {
            try {
                $exists = Location::where('code', $portData['port_code'])->exists();

                if ($exists) {
                    $skipped++;
                    continue;
                }

                Location::create([
                    'code' => $portData['port_code'],
                    'name' => $portData['port_name'],
                    'city' => $portData['city'],
                    'country' => $portData['country'],
                    'type' => $portData['port_type'],
                    'is_active' => true,
                ]);

                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Row " . ($index + 1) . ": {$e->getMessage()}";
            }
        }

        return response()->json([
            'imported' => $imported,
            'skipped' => $skipped,
            'errors' => $errors,
        ]);
    }
}
