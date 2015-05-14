<?php
namespace App\RuneTime\Calculators;

use App\RuneTime\Core\Entity;

/**
 * Class Calculator
 */
class Calculator extends Entity
{
    protected $table = 'calculators';
    protected $fillable = [];
    protected $dates = [];
    protected $softDelete = true;
    const STATUS_HIDDEN = 0;
    const STATUS_PUBLISHED = 1;
}
