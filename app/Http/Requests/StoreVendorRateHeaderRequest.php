<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVendorRateHeaderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vendor_id' => 'required|exists:suppliers,id',
            'mode' => 'required|in:AIR,SEA,ROAD,RAIL,MULTIMODAL',
            'movement' => 'required|in:IMPORT,EXPORT,DOMESTIC,INTER_MODAL',
            'origin_port_id' => 'required|exists:locations,id|different:destination_port_id',
            'destination_port_id' => 'required|exists:locations,id|different:origin_port_id',
            'terms' => 'required|in:EXW,FCA,CPT,CIP,DAP,DDP,FOB,CFR,CIF',
            'valid_from' => 'required|date|before:valid_upto',
            'valid_upto' => 'required|date|after:valid_from',
            'is_active' => 'sometimes|boolean',
            'notes' => 'nullable|string|max:1000',
            'lines' => 'required|array|min:1',
            'lines.*.charge_id' => 'required|exists:charges,id',
            'lines.*.uom_id' => 'required|exists:unit_of_measures,id',
            'lines.*.currency_code' => 'required|string|size:3',
            'lines.*.slab_min' => 'required|numeric|min:0',
            'lines.*.slab_max' => 'required|numeric|gt:lines.*.slab_min',
            'lines.*.cost_rate' => 'required|numeric|min:0',
            'lines.*.is_fixed_rate' => 'sometimes|boolean',
            'lines.*.sequence' => 'sometimes|integer|min:0',
            'lines.*.notes' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'origin_port_id.different' => 'Origin and Destination ports must be different.',
            'destination_port_id.different' => 'Origin and Destination ports must be different.',
            'valid_from.before' => 'Valid From date must be before Valid Upto date.',
            'valid_upto.after' => 'Valid Upto date must be after Valid From date.',
            'lines.required' => 'At least one charge line is required.',
            'lines.min' => 'At least one charge line is required.',
            'lines.*.slab_max.gt' => 'Slab Max must be greater than Slab Min.',
        ];
    }
}
