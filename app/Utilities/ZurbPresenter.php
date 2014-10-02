<?php
namespace App\Utilities;
use Illuminate\Pagination\Presenter;
class ZurbPresenter extends Presenter{
	private $baseURL;
	public function url($url){
		$this->baseURL=$url;
	}
    public function getActivePageWrapper($text)
    {
        return "<li class='active'><a>".$text."</a></li>";
    }

    public function getDisabledTextWrapper($text)
    {
        return "<li class='disabled'><a>".$text."</a></li>";
    }

    public function getPageLinkWrapper($url, $page, $rel = null)
    {
        return "<li><a href='".$this->baseURL."/page=".$page."'>".$page."</a></li>";
    }

}