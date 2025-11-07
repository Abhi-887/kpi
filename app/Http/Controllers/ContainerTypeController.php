<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContainerTypeRequest;
use App\Http\Requests\UpdateContainerTypeRequest;
use App\Models\ContainerType;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class ContainerTypeController extends Controller
{
    public function index(): Response
    {
        $containerTypes = ContainerType::query()
            ->orderBy('container_code')
            ->get();

        return Inertia::render('ContainerTypes/Index', [
            'containerTypes' => $containerTypes,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('ContainerTypes/Create');
    }

    public function store(StoreContainerTypeRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $containerType = ContainerType::create($validated);

        return response()->json([
            'success' => true,
            'data' => $containerType,
            'message' => 'Container type created successfully',
        ], 201);
    }

    public function edit(ContainerType $containerType): Response
    {
        return Inertia::render('ContainerTypes/Edit', [
            'containerType' => $containerType,
        ]);
    }

    public function update(UpdateContainerTypeRequest $request, ContainerType $containerType): JsonResponse
    {
        $validated = $request->validated();

        $containerType->update($validated);

        return response()->json([
            'success' => true,
            'data' => $containerType,
            'message' => 'Container type updated successfully',
        ]);
    }

    public function destroy(ContainerType $containerType): JsonResponse
    {
        $containerType->delete();

        return response()->json([
            'success' => true,
            'message' => 'Container type deleted successfully',
        ]);
    }
}
