<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApproveQuotationRequest extends FormRequest
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
            'approval_status' => 'required|in:approved,rejected',
            'approver_comments' => 'nullable|string|max:1000',
            'rejection_reason' => 'required_if:approval_status,rejected|nullable|string|max:1000',
        ];
    }

    /**
     * Get custom validation messages
     */
    public function messages(): array
    {
        return [
            'approval_status.required' => 'Approval status is required',
            'approval_status.in' => 'Invalid approval status',
            'rejection_reason.required_if' => 'Rejection reason is required when rejecting',
        ];
    }
}
