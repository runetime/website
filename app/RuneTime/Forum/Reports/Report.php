<?php
namespace App\RuneTime\Forum\Reports;
use App\Runis\Core\Entity;
class Report extends Entity {
	protected $table = 'forum_reports';
	protected $with = [];
	protected $fillable = ['author_id', 'reported_id', 'type_id', 'status_id', 'contents', 'contents_parsed'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_OPEN = 0;
	const STATUS_CLOSED = 1;
	const TYPE_POST = 0;
	const TYPE_THREAD = 1;
	const TYPE_USER = 2;

	/**
	 * @param $statusId
	 *
	 * @return string
	 */
	public function getStatus() {
		switch($this->status_id) {
			case 0:
				return 'open';
				break;
			case 1:
				return 'closed';
				break;
			default:
				\Log::info('Report :: unknown status type ' . $this->status_id);
				return 'unknown';
				break;
		}
	}
}