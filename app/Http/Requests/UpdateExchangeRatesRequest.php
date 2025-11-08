<?php

namespace App\Http\Requests;

use App\Services\ExchangeRateEngine;
use Illuminate\Foundation\Http\FormRequest;

class UpdateExchangeRatesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only admins/finance roles can update exchange rates
        return auth()->user()?->can('update exchange rates') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'rates' => 'required|array|min:1',
            'rates.*' => 'required|numeric|gt:0|max:999999.999999',
            'effective_date' => 'nullable|date_format:Y-m-d|before_or_equal:today',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'rates.required' => 'At least one exchange rate must be provided',
            'rates.min' => 'At least one exchange rate must be provided',
            'rates.*.required' => 'Exchange rate value is required',
            'rates.*.numeric' => 'Exchange rate must be a valid number',
            'rates.*.gt' => 'Exchange rate must be greater than 0',
            'effective_date.date_format' => 'Effective date must be in Y-m-d format',
            'effective_date.before_or_equal' => 'Effective date cannot be in the future',
        ];
    }

    /**
     * Perform additional validation.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $engine = app(ExchangeRateEngine::class);
            $validation = $engine->validateRates($this->input('rates'), 'INR');

            if (!$validation['valid']) {
                foreach ($validation['errors'] as $error) {
                    $validator->errors()->add('rates', $error);
                }
            }
        });
    }

    /**
     * Get the validated input as an array with rate keys normalized
     */
    public function validated($key = null, $default = null)
    {
        $data = parent::validated($key, $default);

        // Normalize currency codes to uppercase
        if (isset($data['rates'])) {
            $normalizedRates = [];
            foreach ($data['rates'] as $currency => $rate) {
                $normalizedRates[strtoupper($currency)] = $rate;
            }
            $data['rates'] = $normalizedRates;
        }

        return $data;
    }
}
