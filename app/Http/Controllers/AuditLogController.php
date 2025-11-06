<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::with('user');

        // Filter by action
        if ($request->has('action') && $request->action !== 'all') {
            $query->where('action', $request->action);
        }

        // Filter by model type
        if ($request->has('model_type') && $request->model_type !== 'all') {
            $query->where('model_type', $request->model_type);
        }

        // Filter by user
        if ($request->has('user_id') && $request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by date range
        if ($request->has('from_date') && $request->from_date) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date') && $request->to_date) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $logs = $query->latest()->paginate(50);

        return Inertia::render('AuditLogs/Index', [
            'logs' => $logs,
            'filters' => $request->only(['action', 'model_type', 'user_id', 'from_date', 'to_date']),
        ]);
    }

    public function show(AuditLog $auditLog)
    {
        return Inertia::render('AuditLogs/Show', [
            'log' => $auditLog->load('user'),
        ]);
    }

    public function export(Request $request)
    {
        $query = AuditLog::with('user');

        if ($request->action !== 'all') {
            $query->where('action', $request->action);
        }

        if ($request->model_type !== 'all') {
            $query->where('model_type', $request->model_type);
        }

        $logs = $query->latest()->get();

        $csv = "User,Action,Model,Model ID,Description,IP Address,Date\n";

        foreach ($logs as $log) {
            $csv .= sprintf(
                "\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                $log->user?->email ?? 'System',
                $log->action,
                $log->model_type,
                $log->model_id ?? '-',
                $log->description ?? '-',
                $log->ip_address ?? '-',
                $log->created_at->format('Y-m-d H:i:s')
            );
        }

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=audit-logs-' . now()->format('Y-m-d') . '.csv',
        ]);
    }
}
