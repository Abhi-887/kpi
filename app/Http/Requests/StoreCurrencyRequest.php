<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCurrencyRequest extends FormRequest
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
            'currency_code' => 'required|string|size:3|unique:currencies,currency_code|alpha',
            'currency_name' => 'required|string|max:100',
            'symbol' => 'nullable|string|max:10',
            'decimal_places' => 'required|integer|min:0|max:6',
            'is_base_currency' => 'boolean',
            'is_active' => 'boolean',
            'description' => 'nullable|string|max:500',
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
            'currency_code.unique' => 'This currency code already exists.',
            'currency_code.size' => 'Currency code must be exactly 3 characters (ISO 4217).',
            'currency_code.alpha' => 'Currency code must contain only letters.',
            'decimal_places.max' => 'Decimal places cannot exceed 6.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('currency_code')) {
            $this->merge([
                'currency_code' => strtoupper($this->currency_code),
            ]);
        }
    }
}
