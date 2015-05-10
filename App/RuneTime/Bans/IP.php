<?php
namespace App\RuneTime\Bans;

use App\RuneTime\Core\Entity;

/**
 * Class IP
 */
class IP extends Entity
{
    protected $table = 'bans_ip';
    protected $fillable = [
        'author_id',
        'ip',
        'reason',
        'status',
    ];
    protected $dates = [];
    protected $softDelete = true;
    const STATUS_DISABLED = 0;
    const STATUS_ACTIVE = 1;

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function author()
    {
        return $this->belongsTo('App\RuneTime\Accounts\User', 'author_id');
    }
}
