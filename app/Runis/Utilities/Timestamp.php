<?php
class Timestamp{
	/**
	 * @param $i
	 *
	 * @return bool|string
	 */
	public static function createFromUnix($i) {
		return date('Y-m-d H:i:s', $i);
	}

	/**
	 * @return bool|string
	 */
	public static function fromNow() {
		return date('Y-m-d H:i:s');
	}
}