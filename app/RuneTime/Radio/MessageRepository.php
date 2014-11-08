<?php
namespace App\RuneTime\Radio;
use App\Runis\Core\EloquentRepository;
/**
 * Class MessageRepository
 * @package App\RuneTime\Radio
 */
class MessageRepository extends EloquentRepository {
	/**
	 * @param Message $model
	 */
	public function __construct(Message $model) {
		$this->model = $model;
	}
}