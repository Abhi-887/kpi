<?php

namespace App\Enums;

enum ChargeType: string
{
    case Fixed = 'fixed';
    case Variable = 'variable';
    case WeightBased = 'weight_based';

    public function label(): string
    {
        return match ($this) {
            self::Fixed => 'Fixed',
            self::Variable => 'Variable',
            self::WeightBased => 'Weight-Based',
        };
    }
}
