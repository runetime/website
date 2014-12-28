<?php

use Illuminate\Database\Seeder;

class SubforumsTableSeeder extends Seeder
{
	/**
	 *
	 */
	public function run()
	{
		DB::table('forum_subforums')->delete();
		DB::table('forum_subforums')->
			insert([
				[
					'name'          => 'Official',
					'description'   => 'The official forums for RuneTime Information',
					'roles'         => json_encode([]),
					'posts_enabled' => false,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 0,
					'parent'        => -1,
				],
				[
					'name'          => 'RuneTime Community',
					'description'   => '',
					'roles'         => json_encode([]),
					'posts_enabled' => false,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 0,
					'parent'        => -1,
				],
				[
					'name'          => 'RuneScape',
					'description'   => '',
					'roles'         => json_encode([]),
					'posts_enabled' => false,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 0,
					'parent'        => -1,
				],
				[
					'name'          => 'Old-School RuneScape',
					'description'   => '',
					'roles'         => json_encode([]),
					'posts_enabled' => false,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 0,
					'parent'        => -1,
				],
				[
					'name'          => 'Team Leader',
					'description'   => '',
					'roles'         => json_encode([1, 2, 4, 6, 8, 10, 12]),
					'posts_enabled' => false,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 0,
					'parent'        => -1,
				],
				[
					'name'          => 'Staff Only',
					'description'   => '',
					'roles'         => json_encode(
						[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
					),
					'posts_enabled' => false,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 0,
					'parent'        => -1,
				],
				[
					'name'          => 'RuneTime News & Updates',
					'description'   => 'Visit here to check out all the News and Updates happening on RuneTime!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 0,
					'parent'        => 1,
				],
				[
					'name'          => 'Website Discussion & Feedback',
					'description'   => 'Come here to discuss all your feedback towards RuneTime\'s website!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 0,
					'parent'        => 1,
				],
				[
					'name'          => 'How Did You Find Us?',
					'description'   => 'Let us know how you found our fansite! Friend? YouTube? Jagex?',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 0,
					'parent'        => 1,
				],
				[
					'name'          => 'RuneTime Finances',
					'description'   => 'So everyone know where donations and money is being spent!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 0,
					'parent'        => 1,
				],
				[
					'name'          => 'Official Events',
					'description'   => 'All official RuneTime events are posted in here!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 0,
					'parent'        => 1,
				],
				[
					'name'          => 'Introductions',
					'description'   => 'If you\'re new to RuneTime, introduce yourself here!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 1,
					'parent'        => 2,
				],
				[
					'name'          => 'Support',
					'description'   => 'If you need support please post in here, or use a ticket or even pm us!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 2,
					'parent'        => 2,
				],
				[
					'name'          => 'Games & Entertainment',
					'description'   => 'Slightly bored at the minute? Come visit this forum for some text/forum based games and you\'ll never be bored again! You will not receive post count posting in here.',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => false,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 3,
					'parent'        => 2,
				],
				[
					'name'          => 'Hobbies & Interests',
					'description'   => 'Discuss all your non-related hobbies & interests here!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 4,
					'parent'        => 2,
				],
				[
					'name'          => 'Off-Topic',
					'description'   => 'No topics on our forums which tie into your topic? If not, post it here!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 5,
					'parent'        => 2,
				],
				[
					'name'          => 'Pictures and Graphics',
					'description'   => 'Drawing pictures? Opening a graphics store? If so, post them all here!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 6,
					'parent'        => 2,
				],
				[
					'name'          => 'Music & Videos',
					'description'   => 'Share with us all your favourite music and videos!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 7,
					'parent'        => 2,
				],
				[
					'name'          => 'Member Events',
					'description'   => 'Having a 99 Party? 120 Party? All RuneTime community events can be posted in here.',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 8,
					'parent'        => 2,
				],
				[
					'name'          => 'User Guides',
					'description'   => 'Post your guides in here!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 9,
					'parent'        => 2,
				],
				[
					'name'          => 'RuneScape News & Updates',
					'description'   => 'Find out about all the latest news and updates to do with RuneScape here!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 1,
					'parent'        => 3,
				],
				[
					'name'          => 'General Discussion',
					'description'   => 'Got something to say relating RuneScape but not fitting in to any other forum? Post it here!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 2,
					'parent'        => 3,
				],
				[
					'name'          => 'Personal Goals & Achievements',
					'description'   => 'Share your current goal with us here! Did you finally reach that goal? share it here!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 3,
					'parent'        => 3,
				],
				[
					'name'          => 'PvP & PvM Discussion',
					'description'   => 'If you\'re interested in PvP or PvM, or even both, this is the forum for you!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 4,
					'parent'        => 3,
				],
				[
					'name'          => 'Market',
					'description'   => 'Cannot buy something at the Grand Exchange? Or maybe you\'ve reached your daily peak limits. Purchase and sell your RuneScape goods here!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 5,
					'parent'        => 3,
				],
				[
					'name'          => 'Quests & Trails',
					'description'   => 'Anything and everything to do with Quests and Treasure Trails are posted here!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 6,
					'parent'        => 3,
				],
				[
					'name'          => 'Other Great Fansites',
					'description'   => 'Check here to see what other fansites we recommend you check out!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 7,
					'parent'        => 3,
				],
				[
					'name'          => 'Clan System',
					'description'   => 'Interested in joining our RuneTime Clan? Wanting some clan-information? Or looking to do something with a different Clan? This is the place to be!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 8,
					'parent'        => 3,
				],
				[
					'name'          => 'Old-School News & Updates',
					'description'   => 'Are you a fan of the 2007 days? Well, check here and we\'ll keep you posted on all the updates to do with Old-School RuneScape!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 1,
					'parent'        => 4,
				],
				[
					'name'          => 'General Discussion',
					'description'   => 'Got something to say relating Old-School RuneScape but not fitting in to any other forum? Post it here!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 2,
					'parent'        => 4,
				],
				[
					'name'          => 'Personal Goals & Achievements',
					'description'   => 'Finally got that 99 you so desperately wanted? Oh wait, you got that Dragon dagger? POST HERE!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 3,
					'parent'        => 4,
				],
				[
					'name'          => 'PvP & PvM Discussion',
					'description'   => 'If you\'re interested in Old-School PvP or PvM, or even both, this is the forum for you!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 4,
					'parent'        => 4,
				],
				[
					'name'          => 'Market',
					'description'   => 'No Grand Exchange? So what! Purchase and sell your Old-School goods here!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 5,
					'parent'        => 4,
				],
				[
					'name'          => 'Quests & Trails',
					'description'   => 'Congratulations! Completing quests and trails on Old-School are difficult! Wait, you\'re experiencing problems with them? If you\'re proud, or in desperate need of help, post here!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 6,
					'parent'        => 4,
				],
				[
					'name'          => 'General Chat',
					'description'   => 'Anything that can only be discussed between team leaders and admins can be posted in here.',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 1,
					'parent'        => 5,
				],
				[
					'name'          => 'Staff Trouble',
					'description'   => 'If you\'re having problems with a staff member in your team please post it in here.',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 2,
					'parent'        => 5,
				],
				[
					'name'          => 'Admin Help',
					'description'   => 'If you require assistance off an administrator post in here.',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 3,
					'parent'        => 5,
				],
				[
					'name'          => 'Promotions',
					'description'   => 'If you would like to promote a staff member in your team you can do so in here.',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 4,
					'parent'        => 5,
				],
				[
					'name'          => 'Suggestions',
					'description'   => 'If you have a suggestion that you wish to only share with the admins and team leaders post it in here.',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 5,
					'parent'        => 5,
				],
				[
					'name'          => 'Important Details',
					'description'   => 'Look here constantly to make sure details for specific utilities have not been changed!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 1,
					'parent'        => 6,
				],
				[
					'name'          => 'Discussions & Announcements',
					'description'   => 'Discuss all the new updates to RuneTime with you friends and colleagues!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 2,
					'parent'        => 6,
				],
				[
					'name'          => 'Site Suggestions',
					'description'   => 'Suggest ideas to be inserted into RuneTime\'s website here!',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 3,
					'parent'        => 6,
				],
				[
					'name'          => 'Staff Lounge',
					'description'   => 'Come here to chill with your staff members, and play a game or two. Or maybe just discuss about that movie you saw last night without any other member seeing.',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 4,
					'parent'        => 6,
				],
				[
					'name'          => 'Away From Website Notice',
					'description'   => 'Post in here if you are going to be off the website for a while.',
					'roles'         => json_encode([]),
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 5,
					'parent'        => 6,
				],
				[
					'name'          => 'DJ Message',
					'description'   => 'Most recent TOPIC TITLE gets copied to the radio page... (The actual forum posting is ignored, just the TOPIC TITLE is used. Replying to a topic also makes it the most recent, so you can re-use postings by simply replying. Remember to turn an AutoDJ Message on when you finish DJing)',
					'posts_enabled' => true,
					'posts_active'  => true,
					'thread_count'  => 0,
					'post_count'    => 0,
					'last_post'     => -1,
					'position'      => 6,
					'parent'        => 6,
					'roles'         => json_encode([1, 2, 3]),
				],
			]);
	}
}