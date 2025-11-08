<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVendorRateHeaderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vendor_id' => 'sometimes|exists:suppliers,id',
            'mode' => 'sometimes|in:AIR,SEA,ROAD,RAIL,MULTIMODAL',
            'movement' => 'sometimes|in:IMPORT,EXPORT,DOMESTIC,INTER_MODAL',
            'origin_port_id' => 'sometimes|exists:locations,id|different:destination_port_id',
            'destination_port_id' => 'sometimes|exists:locations,id|different:origin_port_id',
            'terms' => 'sometimes|in:EXW,FCA,CPT,CIP,DAP,DDP,FOB,CFR,CIF',
            'valid_from' => 'sometimes|date|before:valid_upto',
            'valid_upto' => 'sometimes|date|after:valid_from',
            'is_active' => 'sometimes|boolean',
            'notes' => 'nullable|string|max:1000',
            'lines' => 'sometimes|array',
            'lines.*.id' => 'sometimes|exists:vendor_rate_lines,id',
            'lines.*.charge_id' => 'sometimes|exists:charges,id',
            'lines.*.uom_id' => 'sometimes|exists:unit_of_measures,id',
            'lines.*.currency_code' => 'sometimes|string|size:3',
            'lines.*.slab_min' => 'sometimes|numeric|min:0',
            'lines.*.slab_max' => 'sometimes|numeric|gt:lines.*.slab_min',
            'lines.*.cost_rate' => 'sometimes|numeric|min:0',
            'lines.*.is_fixed_rate' => 'sometimes|boolean',
            'lines.*.sequence' => 'sometimes|integer|min:0',
            'lines.*.notes' => 'nullable|string|max:500',
        ];
    }
}
