<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContainerTypeRequest;
use App\Http\Requests\UpdateContainerTypeRequest;
use App\Models\ContainerType;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
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
            'csrf_token' => csrf_token(),
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
        try {
            $code = $containerType->container_code;
            $containerType->delete();

            return response()->json([
                'success' => true,
                'message' => "Container type {$code} deleted successfully",
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting container type', [
                'id' => $containerType->container_type_id,
                'exception' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete container type: '.$e->getMessage(),
            ], 400);
        }
    }

    public function toggleStatus(ContainerType $containerType): JsonResponse
    {
        try {
            $containerType->update([
                'is_active' => !$containerType->is_active,
            ]);

            return response()->json([
                'success' => true,
                'data' => $containerType,
                'message' => "Container type {$containerType->container_code} is now " . ($containerType->is_active ? 'active' : 'inactive'),
            ]);
        } catch (\Exception $e) {
            Log::error('Error toggling container type status', [
                'id' => $containerType->container_type_id,
                'exception' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle container type status: '.$e->getMessage(),
            ], 400);
        }
    }
}
