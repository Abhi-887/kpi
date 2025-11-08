<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreQuotationHeaderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'customer_id' => 'required|exists:customers,id',
            'mode' => 'required|in:AIR,SEA,ROAD,RAIL,MULTIMODAL',
            'movement' => 'required|in:IMPORT,EXPORT,DOMESTIC,INTER_MODAL',
            'terms' => 'required|in:EXW,FCA,CPT,CIP,DAP,DDP,FOB,CFR,CIF',
            'origin_port_id' => 'nullable|exists:locations,id',
            'destination_port_id' => 'nullable|exists:locations,id',
            'origin_location_id' => 'nullable|exists:locations,id',
            'destination_location_id' => 'nullable|exists:locations,id',
            'notes' => 'nullable|string|max:1000',
            'dimensions' => 'required|array|min:1',
            'dimensions.*.length_cm' => 'required|numeric|min:0.1',
            'dimensions.*.width_cm' => 'required|numeric|min:0.1',
            'dimensions.*.height_cm' => 'required|numeric|min:0.1',
            'dimensions.*.pieces' => 'required|integer|min:1',
            'dimensions.*.actual_weight_per_piece_kg' => 'required|numeric|min:0.1',
        ];
    }

    /**
     * Get custom validation messages
     */
    public function messages(): array
    {
        return [
            'customer_id.required' => 'Customer is required',
            'customer_id.exists' => 'Selected customer does not exist',
            'mode.required' => 'Transportation mode is required',
            'mode.in' => 'Invalid transportation mode',
            'movement.required' => 'Movement type is required',
            'terms.required' => 'Incoterms are required',
            'dimensions.required' => 'At least one dimension entry is required',
            'dimensions.*.length_cm.required' => 'Length is required for all items',
            'dimensions.*.width_cm.required' => 'Width is required for all items',
            'dimensions.*.height_cm.required' => 'Height is required for all items',
            'dimensions.*.pieces.required' => 'Pieces count is required',
            'dimensions.*.actual_weight_per_piece_kg.required' => 'Weight per piece is required',
        ];
    }
}
