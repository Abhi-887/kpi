<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->canManageUsers();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->route('user')?->id ?? $this->route('user');

        return [
            'name' => 'required|string|max:255',
            'email' => "required|email|max:255|unique:users,email,{$userId}",
            'password' => ['nullable', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'roles' => 'required|array|min:1',
            'roles.*' => 'integer|exists:roles,id',
            'is_active' => 'boolean',
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
            'email.unique' => 'A user with this email already exists.',
            'roles.required' => 'Please assign at least one role to the user.',
            'roles.min' => 'Please assign at least one role to the user.',
            'roles.*.exists' => 'One or more selected roles do not exist.',
            'password.confirmed' => 'The password confirmation does not match.',
        ];
    }
}
