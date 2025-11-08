<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContainerTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'container_code' => 'required|string|max:20|unique:container_types,container_code',
            'description' => 'required|string|max:255',
            'is_active' => 'sometimes|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'container_code.required' => 'Container code is required',
            'container_code.unique' => 'This container code already exists',
            'description.required' => 'Description is required',
        ];
    }
}
