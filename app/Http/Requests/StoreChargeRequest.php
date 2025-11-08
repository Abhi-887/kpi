<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreChargeRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'charge_id' => 'required|string|unique:charges,charge_id',
            'charge_code' => 'required|string|unique:charges,charge_code',
            'charge_name' => 'required|string|max:255',
            'default_uom_id' => 'required|integer|exists:unit_of_measures,id',
            'default_tax_id' => 'required|integer|exists:tax_codes,id',
            'default_fixed_rate_inr' => 'nullable|numeric|min:0',
            'charge_type' => 'required|string|in:fixed,variable,weight_based',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'charge_id.unique' => 'The charge ID has already been taken.',
            'charge_code.unique' => 'The charge code has already been taken.',
            'default_uom_id.exists' => 'The selected unit of measure does not exist.',
            'default_tax_id.exists' => 'The selected tax code does not exist.',
            'charge_type.in' => 'The charge type must be one of: fixed, variable, weight_based.',
        ];
    }
}
