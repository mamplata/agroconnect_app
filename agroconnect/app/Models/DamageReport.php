<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DamageReport extends Model
{
    use HasFactory;

    protected $primaryKey = 'damageId';
    protected $fillable = [
        'barangay',
        'cropName',
        'variety',
        'numberOfFarmers',
        'areaAffected',
        'yieldLoss',
        'grandTotalValue',
    ];
}
