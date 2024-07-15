<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('prices', function (Blueprint $table) {
            $table->id('priceId');
            $table->unsignedBigInteger('recordId');
            $table->foreign('recordId')->references('recordId')->on('records');
            $table->string('cropName', 255);
            $table->double('price');
            $table->string('season', 255);
            $table->string('type', 255);
            $table->string('monthYear', 255);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prices');
    }
};
