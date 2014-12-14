<?php
namespace App\RuneTime\News;
use App\Runis\Core\EloquentRepository;
class NewsRepository extends EloquentRepository
{
	/**
	 * @param News $model
	 */
	public function __construct(News $model)
	{
		$this->model = $model;
	}

	/**
	 * @param int $count
	 *
	 * @return mixed
	 */
	public function getRecentNews($count = 5)
	{
		return $this->model->
			where('status', '=', News::STATUS_PUBLISHED)->
			orderBy('created_at', 'desc')->
			take($count)->
			get();
	}
}