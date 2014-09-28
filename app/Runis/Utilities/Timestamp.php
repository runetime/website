<?php
class Timestamp{
	public static function createFromUnix($i){
		return date('Y-m-d H:i:s',$i);
	}
	public static function fromNow(){
		return date('Y-m-d H:i:s');
	}
}