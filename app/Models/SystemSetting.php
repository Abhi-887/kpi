<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'category',
        'description',
        'type',
    ];

    public $timestamps = false;

    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = self::where('key', $key)->first();
        return $setting?->value ?? $default;
    }

    public static function set(string $key, mixed $value, string $category = 'general', string $type = 'string', string $description = ''): self
    {
        return self::updateOrCreate(
            ['key' => $key],
            [
                'value' => is_array($value) ? json_encode($value) : $value,
                'category' => $category,
                'type' => $type,
                'description' => $description,
            ]
        );
    }

    public static function getByCategory(string $category): array
    {
        return self::where('category', $category)
            ->pluck('value', 'key')
            ->toArray();
    }

    public function getValueAttribute($value)
    {
        return match ($this->type) {
            'boolean' => (bool) $value,
            'integer' => (int) $value,
            'json' => json_decode($value, true),
            default => $value,
        };
    }
}
