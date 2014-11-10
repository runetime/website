<?php
use Illuminate\Database\Seeder;
class BBCodeTableSeeder extends Seeder{
	public function run(){
		DB::table('bbcode')->delete();
		DB::table('bbcode')->
			insert([
				[
					'name'      =>'Bold',
					'example'   =>'This is an [b]example[/b] of bolded text.',
					'parsed'    =>'This is an <b>example</b> of bolded text.',
					'parse_from'=>'/\[b\](.*?)\[\/b\]/',
					'parse_to'  =>"<b>$1</b>",
				],
				[
					'name'      =>'Italics',
					'example'   =>'This is an [i]example[/i] of italicized text.',
					'parsed'    =>'This is an <em>example</em> of italicized text.',
					'parse_from'=>'/\[i\](.*?)\[\/i\]/',
					'parse_to'  =>"<em>$2</em>",
				],
				[
					'name'      =>'Underline',
					'example'   =>'This is an [u]example[/u] of underlined text.',
					'parsed'    =>'This is an <u>example</u> of underlined text.',
					'parse_from'=>'/\[u\](.*?)\[\/u\]/',
					'parse_to'  =>"<u>$1</u>",
				],
				[
					'name'      =>'Color',
					'example'   =>'This is an [color=#ff0000] of red text[/color].',
					'parsed'    =>'This is an <span style=\'color:#ff0000;\'>example of red text</span>.',
					'parse_from'=>'/\[color=(.*?)\](.*?)\[\/color\]/',
					'parse_to'  =>"<a href='$1'>$2</a>",
				],
				[
					'name'      =>'Superscript',
					'example'   =>'A basic example of a parabola is y=x[sup]2[/sup].',
					'parsed'    =>"A basic example of a parabola is y=x<sup>2</sup>.",
					'parse_from'=>'/\[sup\](.*?)\[\/sup\]/',
					'parse_to'  =>"<sup>$2</sup>",
				],
				[
					'name'      =>'Subscript',
					'example'   =>'Carbon Dioxide\'s chemical composition is CO[sub]2[/sub].',
					'parsed'    =>"Carbon Dioxide's chemical composition is CO<sub>2</sub>.",
					'parse_from'=>'/\[sub\](.*?)\[\/sub\]/',
					'parse_to'  =>"<sub>$1</sub>",
				],
				[
					'name'      =>'Topic',
					'example'   =>'Check out [thread=1]this thread![/thread]',
					'parsed'    =>"Check out <a href='/forum/thread/1-from-chatbox'>this thread!</a>",
					'parse_from'=>'/\[thread=(.*?)\](.*?)\[\/thread\]/',
					'parse_to'  =>"<a href='/forum/topic/$1-from-chatbox'>$2</a>",
				],
				[
					'name'      =>'URL',
					'example'   =>'Check out [url=http://google.com/]this URL![/url]',
					'parsed'    =>"Check out <a href='http://google.com/'>this URL!</a>",
					'parse_from'=>'~\[url(?|=[\'"]?+([^]"\']++)[\'"]?+]([^[]++)|](([^[]++)))\[/url]~',
					'parse_to'  =>"<a href='$1' target='_blank'>$2</a>",
				],
				[
					'name'      =>'Quote',
					'example'   =>'[quote name="John Green" post="-1" timestamp="1"]"My thoughts are stars I cannot fathom into constellations."[/quote]',
					'parsed'    =>"<blockquote><p>\"My thoughts are stars I cannot fathom into constellations.\"</p><footer>John Green</footer></blockquote>",
					'parse_from'=>'/\[quote name="(.*?)" post="(.*?)" timestamp="(.*?)"\](.+?)\[\/quote\]/',
					'parse_to'  =>"<blockquote><p>$4</p><footer>$1</footer></blockquote>",
				],
			]);
	}
}