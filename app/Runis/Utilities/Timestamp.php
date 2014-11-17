<?php
class Timestamp{
	/**
	 * @param $i
	 *
	 * @return string
	 */
	public static function createFromUnix($i) {
		return \Time::carbon($i)->format('Y-m-d H:i:s');
	}

	/**
	 * @return bool|string
	 */
	public static function fromNow() {
		return date('Y-m-d H:i:s');
	}
}