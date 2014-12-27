<?php

use Illuminate\Database\Seeder;

class ForumRanksTableSeeder extends Seeder
{
	/**
	 *
	 */
	public function run()
	{
		DB::table('forum_ranks')->delete();
		DB::table('forum_ranks')->
		insert([
				[
					'name'           => 'Novice Member',
					'posts_required' => 0,
				],
				[
					'name'           => 'Opal Member',
					'posts_required' => 1,
				],
				[
					'name'           => 'Jade Member',
					'posts_required' => 10,
				],
				[
					'name'           => 'Topaz Member',
					'posts_required' => 50,
				],
				[
					'name'           => 'Sapphire Member',
					'posts_required' => 100,
				],
				[
					'name'           => 'Emerald Member',
					'posts_required' => 250,
				],
				[
					'name'           => 'Ruby Member',
					'posts_required' => 500,
				],
				[
					'name'           => 'Diamond Member',
					'posts_required' => 1000,
				],
				[
					'name'           => 'DragonStone Member',
					'posts_required' => 2500,
				],
				[
					'name'           => 'Onyx Member',
					'posts_required' => 5000,
				],
			]);
	}
}