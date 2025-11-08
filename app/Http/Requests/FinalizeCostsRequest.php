<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FinalizeCostsRequest extends FormRequest
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
            'cost_lines' => 'required|array|min:1',
            'cost_lines.*.id' => 'required|exists:quotation_cost_lines,id',
            'cost_lines.*.selected_vendor_id' => 'nullable|integer',
            'cost_lines.*.unit_cost_rate' => 'required|numeric|min:0',
        ];
    }

    /**
     * Get custom validation messages
     */
    public function messages(): array
    {
        return [
            'cost_lines.required' => 'Cost lines are required',
            'cost_lines.*.unit_cost_rate.required' => 'Unit cost rate is required for all charges',
            'cost_lines.*.unit_cost_rate.numeric' => 'Unit cost rate must be numeric',
        ];
    }
}
