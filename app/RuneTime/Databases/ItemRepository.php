<?php
namespace App\RuneTime\Databases;

use App\RuneTime\Core\EloquentRepository;

class ItemRepository extends EloquentRepository
{
	/**
	 * @param Item $model
	 */
	public function __construct(Item $model)
	{
		$this->model = $model;
	}

	/**
	 * @param $membership
	 * @param $tradable
	 * @param $questItem
	 *
	 * @return mixed
	 */
	public function getByOptions($membership, $tradable, $questItem)
	{
		if($membership == 'none') $membership = '';
		if($tradable == 'none')   $tradable = '';
		if($questItem == 'none')  $questItem = '';
		$query = $this->model;
		if(!empty($membership)) {
			$query = $query->where('membership', '=', $membership == 'yes' ? true : false);
		}
		if(!empty($tradable)) {
			$query = $query->where('tradable', '=', $tradable == 'yes' ? true : false);
		}
		if(!empty($questItem)) {
			$query = $query->where('quest_item', '=', $questItem == 'yes' ? true : false);
		}
		return $query->get();
	}
}