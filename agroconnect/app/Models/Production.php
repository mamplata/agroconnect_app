<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Production extends Model
{
    use HasFactory;

    protected $primaryKey = 'productionId'; // Specify the primary key field name
    protected $fillable = [
        'recordId',
        'barangay',
        'cropName',
        'variety',
        'areaPlanted',
        'productionCost',
        'volumeSold',
        'season',
        'type',
        'monthYear',
    ];

    // Define relationship with Record
    public function record()
    {
        return $this->belongsTo(Record::class, 'recordId', 'recordId');
    }
}
