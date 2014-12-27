<?php

use Illuminate\Database\Seeder;

class CalculatorsTableSeeder extends Seeder
{
	/**
	 *
	 */
	public function run()
	{
		DB::table('calculators')->delete();
		DB::table('calculators')->
			insert([
				[
					'name'      => 'Agility',
					'name_trim' => 'agility',
					'items'     => json_encode([
						'Burthorpe Agility Course',
						'Gnome Stronghold Agility Course',
						'Brimhaven Agility Arena',
						'Werewolf Skullball',
						'Penguin Agility Arena',
						'Agility Pyramid',
						'Barbarian Outpost',
						'Ape Atoll Agility Course',
						'Wilderness Agility Course',
						'Werewolf Agility Course',
						'Bandos Agility Course',
						'Ape Atoll Agility Course',
						'Dorgesh-Kaan Agility Course',
						'Advanced Gnome Stronghold Agility Course',
						'Advanced Barbarian Outpost Course'
					]),
					'levels_required' => json_encode([
						1,
						1,
						1,
						25,
						30,
						30,
						35,
						48,
						52,
						60,
						60,
						75,
						80,
						85,
						90,
					]),
					'xp' => json_encode([
						79.5,
						86.5,
						0,
						750,
						540,
						1014,
						139.5,
						580,
						571.5,
						540,
						380,
						580,
						2375,
						725,
						740.7
					]),
				],
				[
					'name'      => 'Construction',
					'name_trim' => 'construction',
					'items'     => json_encode([
						'Crude Wooden Chair',
						'Decorative Rock',
						'Wooden Chair',
						'Wooden Larder',
						'Pond',
						'Wood Table',
						'Rocking Chair',
						'Oak Chair',
						'Oak Armchair',
						'Runite Armor',
						'Mithril Armor',
						'CW Armor 1',
						'CW Armor 2',
						'CW Armor 3',
						'Adament Armor',
						'Long Bone',
						'Curved Bone',
						'Carved Oak Dining Bench',
						'Carved Oak Table',
						'Oak Table',
						'Oak Larder',
						'Stone Fireplace',
						'Teak Armchair',
						'Excalibur',
						'Darklight',
						'Silverlight',
						'Teak Larder',
						'Teak Table',
						'Mahogany Table',
						'Oak Door',
						'Steel Door',
						'Marble Door',
					]),
					'levels_required' => json_encode([
						1,
						5,
						8,
						9,
						10,
						12,
						14,
						19,
						26,
						28,
						28,
						28,
						28,
						28,
						28,
						30,
						30,
						31,
						31,
						32,
						33,
						33,
						35,
						42,
						42,
						42,
						43,
						52,
						52,
						74,
						84,
						94,
					]),
					'xp' => json_encode([
						66,
						100,
						96,
						228,
						100,
						87,
						87,
						120,
						180,
						165,
						135,
						165,
						150,
						150,
						135,
						1500,
						2250,
						220,
						360,
						180,
						480,
						40,
						180,
						194,
						202,
						187,
						750,
						360,
						840,
						600,
						800,
						2000,
					]),
				],
				[
					'name'      => 'Farming',
					'name_trim' => 'farming',
					'items'     => json_encode([
						'Potato Seed',
						'Onion Seed',
						'Cabbage Seed',
						'Tomato Seed',
						'Sweetcorn Seed',
						'Strawberry Seed',
						'Watermelon Seed',
						'Snape Grass Seed',
						'Sunchoke Seed',
						'Fly Trap Seed',
						'Marigold Seed',
						'Rosemary Seed',
						'Nasturtium Seed',
						'Woad Seed',
						'Limpwurt Seed',
						'White Lily Seed',
						'Butterfly Flower Seed',
						'Barley Seed',
						'Hammerstone Seed',
						'Asgarnian Seed',
						'Jute Seed',
						'Yanillian Seed',
						'Krandorian Seed',
						'Wildblood Seed',
						'Reed Seed',
						'Grapevine Seed',
						'Guam Seed',
						'Marrentill Seed',
						'Tarromin Seed',
						'Harralander Seed',
						'Gout tuber',
						'Ranarr Seed',
						'Spirit Weed Seed',
						'Toadflax Seed',
						'Irit Seed',
						'Wergali Seed',
						'Avantoe Seed',
						'Kwuarm Seed',
						'Snapdragon Seed',
						'Cadantine Seed',
						'Lantadyme Seed',
						'Dwarf Weed Seed',
						'Torstol Seed',
						'Fellstalk Seed',
						'Redberry Seed',
						'Cadavaberry Seed',
						'Dwellberry Seed',
						'Jangerberry Seed',
						'Whiteberry Seed',
						'Poison Ivy Seed',
						'Barberry Seed',
						'Whishing Well Seed',
						'Acorn',
						'Willow Seed',
						'Maple Seed',
						'Yew Seed',
						'Magic Seed',
						'Apple Tree Seed',
						'Banana Tree Seed',
						'Orange Tree Seed',
						'Curry Tree Seed',
						'Pineapple Tree Seed',
						'Papaya Tree Seed',
						'Palm Tree Seed',
						'Cactus Seed',
						'Prickly Pear Seed',
						'Potato Cactus Seed',
						'Evil Turnip Seed',
						'Bittercap Mushroom Spore',
						'Jade Vine Seed',
						'Belladonna Seed',
						'Calquat Tree Seed',
						'Morchella Mushroom Spore',
						'Spirit Seed',
						'Elder Seed',
						'Crystal Acorn',
					]),
					'levels_required' => json_encode([
						1,
						5,
						7,
						12,
						20,
						31,
						47,
						80,
						87,
						93,
						2,
						11,
						24,
						25,
						26,
						52,
						88,
						3,
						4,
						9,
						13,
						16,
						21,
						28,
						78,
						95,
						9,
						14,
						19,
						26,
						29,
						32,
						36,
						38,
						44,
						46,
						50,
						56,
						62,
						67,
						73,
						79,
						85,
						91,
						10,
						22,
						36,
						48,
						59,
						70,
						77,
						96,
						15,
						30,
						45,
						60,
						75,
						27,
						33,
						39,
						42,
						51,
						57,
						68,
						55,
						76,
						86,
						42,
						53,
						53,
						63,
						72,
						74,
						83,
						90,
						94,
					]),
					'xp' => json_encode([
						98,
						114.5,
						125,
						152.5,
						207,
						316,
						593.5,
						975,
						303,
						275,
						55.5,
						78.5,
						130.5,
						136,
						160,
						320,
						490,
						103.5,
						109,
						130.9,
						158,
						174.5,
						212.5,
						283,
						370,
						580,
						98.5,
						118.5,
						142,
						189.5,
						420,
						240.5,
						593.5,
						303.5,
						382.5,
						422.4,
						485,
						615,
						777,
						946.5,
						1195,
						1514.5,
						1771,
						2434.2,
						93.5,
						148.5,
						257,
						411,
						631.5,
						975,
						1825,
						2470,
						481.3,
						1481.5,
						3448.4,
						7150.9,
						13913.8,
						1272.5,
						1841.5,
						2586.7,
						3036.9,
						4791.7,
						6380.4,
						10509.6,
						515.5,
						2470,
						3184,
						87,
						407.7,
						1580,
						603,
						12516.5,
						859.3,
						19501.3,
						23473,
						65000,
					]),
				],
				[
					'name'      => 'Hunter',
					'name_trim' => 'hunter',
					'items'     => json_encode([
						'Polar Kebbit',
						'Common Kebbit',
						'Deldip Weasel',
						'Desert Devil',
						'Penguin',
						'Razor-backed Kebbit',
						'Shadow jadinko',
						'Diseased jadinko',
						'Camouflaged jadinko',
						'Crimson Swift',
						'Golden Warbler',
						'Copper Longtail',
						'Cerulean Twitch',
						'Tropical Wagtail',
						'Wimpy bird',
						'Ruby Harvest (netting)',
						'Sapphire Glacialis (netting)',
						'Snowy Knight (netting)',
						'Black Warlock (netting)',
						'Ruby Harvest (barehanded)',
						'Sapphire Glacialis (barehanded)',
						'Snowy Knight (barehanded)',
						'Black Warlock (barehanded)',
						'Baby impling (Puro-Puro)',
						'Young impling (Puro-Puro)',
						'Gourmet impling (Puro-Puro)',
						'Earth impling (Puro-Puro)',
						'Essence impling (Puro-Puro)',
						'Eclectic impling (Puro-Puro)',
						'Spirit impling (Puro-Puro)',
						'Nature impling (Puro-Puro)',
						'Magpie impling (Puro-Puro)',
						'Ninja impling (Puro-Puro)',
						'Pirate impling (Puro-Puro)',
						'Dragon impling (Puro-Puro)',
						'Zombie impling (Puro-Puro)',
						'Kingly impling (Puro-Puro)',
						'Baby impling (RuneScape)',
						'Young impling (RuneScape)',
						'Gourmet impling (RuneScape)',
						'Earth impling (RuneScape)',
						'Essence impling (RuneScape)',
						'Eclectic impling (RuneScape)',
						'Spirit impling (RuneScape)',
						'Nature impling (RuneScape)',
						'Magpie impling (RuneScape)',
						'Ninja impling (RuneScape)',
						'Pirate impling (RuneScape)',
						'Dragon impling (RuneScape)',
						'Zombie impling (RuneScape)',
						'Kingly impling (RuneScape)',
						'Wild kebbit (deadfall)',
						'Barb-tailed Kebbit (deadfall)',
						'Prickly Kebbit (deadfall)',
						'Diseased Kebbit (deadfall)',
						'Sabre-toothed Kebbit (deadfall)',
						'Penguin (deadfall)',
						'Ferret',
						'Gecko',
						'Raccoon',
						'Cobalt skillchompa',
						'Monkey',
						'Viridian skillchompa',
						'Platypus',
						'Chinchompa',
						'Penguin',
						'Carnivorous Chinchompa',
						'Pawya',
						'Azure skillchompa',
						'Grenwall',
						'Crimson skillchompa',
						'White Rabbit',
						'Swamp Lizard',
						'Baby Squirrel',
						'Orange Salamander',
						'Penguin',
						'Red Salamander',
						'Black Salamander',
						'Spined Larupia (pitfall)',
						'Horned Graahk (pitfall)',
						'Sabre-toothed Kyatt (pitfall)',
						'Spotted Kebbit (falconry)',
						'Dark Kebbit (falconry)',
						'Dashing Kebbit (falconry)',
					]),
					'levels_required' => json_encode([
						1,
						3,
						7,
						13,
						45,
						49,
						71,
						78,
						79,
						1,
						5,
						9,
						11,
						19,
						39,
						15,
						25,
						35,
						45,
						80,
						85,
						90,
						95,
						17,
						22,
						28,
						36,
						42,
						50,
						54,
						58,
						65,
						74,
						76,
						83,
						87,
						91,
						17,
						22,
						28,
						36,
						42,
						50,
						54,
						58,
						65,
						74,
						76,
						83,
						87,
						91,
						23,
						33,
						37,
						44,
						51,
						51,
						27,
						27,
						27,
						27,
						27,
						46,
						48,
						53,
						56,
						63,
						66,
						68,
						77,
						89,
						27,
						29,
						29,
						47,
						50,
						59,
						67,
						31,
						41,
						55,
						43,
						57,
						69,
					]),
					'xp' => json_encode([
						30,
						36,
						49,
						66,
						250,
						348,
						475,
						580.5,
						600,
						34,
						48,
						61,
						64.67,
						95.2,
						167,
						24,
						34,
						44,
						54,
						300,
						400,
						500,
						650,
						20,
						48,
						82,
						126,
						160,
						205,
						227,
						250,
						289,
						339,
						350,
						390,
						412,
						434,
						25,
						65,
						113,
						177,
						225,
						289,
						321,
						353,
						409,
						481,
						497,
						553,
						585,
						617,
						128,
						168,
						204,
						200,
						200,
						210,
						115,
						100,
						100,
						95,
						100,
						140,
						0,
						198,
						150,
						265,
						400,
						210,
						1100,
						450,
						144,
						152,
						152,
						224,
						250,
						272,
						304,
						180,
						240,
						300,
						104,
						132,
						156,
					]),
				],
				[
					'name'      => 'Prayer',
					'name_trim' => 'prayer',
					'items'     => json_encode([
						'Impious ashes',
						'Bones',
						'Wolf bones',
						'Burnt bones',
						'Monkey bones',
						'Monkey bones (zombie)',
						'Bat bones',
						'Accursed ashes',
						'Big bones',
						'Jogre bones',
						'Large monkey bones',
						'Zogre bones',
						'Shaikahan bones',
						'Babydragon bones',
						'Wyvern bones',
						'Infernal ashes',
						'Dragon bones',
						'Fayrg bones',
						'Raurg bones',
						'Dagannoth bones',
						'Airut bones',
						'Ourg bones',
						'Frost dragon bones',
						'Ancient bones',
					]),
					'levels_required' => json_encode([
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
					]),
					'xp' => json_encode([
						4,
						4.5,
						4.5,
						4.5,
						5,
						5,
						5.3,
						12.5,
						15,
						15,
						18,
						22.5,
						25,
						30,
						50,
						62.5,
						72,
						84,
						96,
						125,
						132.5,
						140,
						180,
						200,
					]),
				],
				[
					'name'      => 'Summoning',
					'name_trim' => 'summoning',
					'items'     => json_encode([
						'Spirit wolf',
						'Dreadfowl',
						'Spirit spider',
						'Thorny snail',
						'Granite crab',
						'Spirit mosquito',
						'Desert wyrm',
						'Spirit scorpion',
						'Spirit Tz-Kih',
						'Albino rat',
						'Spirit kalphite',
						'Compost mound',
						'Giant chinchompa',
						'Vampyre bat',
						'Honey badger',
						'Beaver',
						'Void ravager',
						'Void shifter',
						'Void spinner',
						'Void torcher',
						'Bronze minotaur',
						'Bull ant',
						'Macaw',
						'Evil turnip',
						'Spirit cockatrice',
						'Spirit guthatrice',
						'Spirit saratrice',
						'Spirit zamatrice',
						'Spirit pengatrice',
						'Spirit coraxatrice',
						'Spirit vulatrice',
						'Iron minotaur',
						'Pyrelord',
						'Magpie',
						'Bloated leech',
						'Spirit terrorbird',
						'Abyssal parasite',
						'Spirit jelly',
						'Ibis',
						'Steel minotaur',
						'Spirit graahk',
						'Spirit kyatt',
						'Spirit larupia',
						'Karamthulhu overlord',
						'Smoke devil',
						'Abyssal lurker',
						'Spirit cobra',
						'Stranger plant',
						'Barker toad',
						'Mithril minotaur',
						'War tortoise',
						'Bunyip',
						'Fruit bat',
						'Ravenous locust',
						'Arctic bear',
						'Phoenix',
						'Obsidian golem',
						'Granite lobster',
						'Praying mantis',
						'Forge regent',
						'Adamant minotaur',
						'Talon beast',
						'Giant ent',
						'Fire titan',
						'Ice titan',
						'Moss titan',
						'Hydra',
						'Spirit dagannoth',
						'Lava titan',
						'Swamp titan',
						'Rune minotaur',
						'Unicorn stallion',
						'Geyser titan',
						'Wolpertinger',
						'Abyssal titan',
						'Iron titan',
						'Pack yak',
						'Steel titan',
					]),
					'levels_required' => json_encode([
						1,
						4,
						10,
						13,
						16,
						17,
						18,
						19,
						22,
						23,
						25,
						28,
						29,
						31,
						32,
						33,
						34,
						34,
						34,
						34,
						36,
						40,
						41,
						42,
						43,
						43,
						43,
						43,
						43,
						43,
						43,
						46,
						46,
						47,
						49,
						52,
						54,
						55,
						56,
						56,
						57,
						57,
						57,
						58,
						61,
						62,
						63,
						64,
						66,
						66,
						67,
						68,
						69,
						70,
						71,
						72,
						73,
						74,
						75,
						76,
						76,
						77,
						78,
						79,
						79,
						79,
						80,
						83,
						83,
						85,
						86,
						88,
						89,
						92,
						93,
						95,
						96,
						99,
					]),
					'xp' => json_encode([
						4.8,
						9.3,
						12.6,
						12.6,
						21.6,
						46.5,
						31.2,
						83.2,
						96.8,
						202.4,
						220,
						49.8,
						255.2,
						136,
						140.8,
						57.6,
						59.6,
						59.6,
						59.6,
						59.6,
						316.8,
						52.8,
						72.4,
						184.8,
						75.2,
						75.2,
						75.2,
						75.2,
						75.2,
						75.2,
						75.2,
						404.8,
						202.4,
						83.2,
						215.2,
						68.4,
						94.8,
						484,
						98.8,
						492.8,
						501.6,
						501.6,
						501.6,
						510.4,
						268,
						109.6,
						276.8,
						281.6,
						87,
						580.8,
						58.6,
						119.2,
						121.2,
						132,
						93.2,
						301,
						642.4,
						325.6,
						329.6,
						134,
						668.8,
						1015.2,
						136.8,
						695.2,
						695.2,
						695.2,
						140.8,
						364.8,
						730.4,
						373.6,
						756.8,
						154.4,
						783.2,
						404.8,
						163.2,
						417.6,
						422.4,
						435.2,
					]),
				],
			]);
	}
}