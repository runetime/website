<?php
namespace App\Http\Controllers;
class GetController extends BaseController{
	public function getHiscore($rsn){
//		$url='http://services.runescape.com/m=hiscore/index_lite.ws?player='.$rsn;
//		$curl=curl_init($url);
//		curl_setopt($curl,CURLOPT_RETURNTRANSFER,true);
//		$results=curl_exec($curl);
//		curl_close($curl);
//		return json_encode($results);
		$results=<<<DOC

411996,1598,27881258
523144,75,1237847
661402,66,502352
788367,64,414028
695339,69,713063
744227,54,154546
499912,55,178534
642074,65,467900
556908,66,537428
138070,99,13095060
249230,84,3042572
292241,79,1850771
393225,73,1041914
373743,63,388488
213915,74,1098606
507438,63,400159
388614,54,153138
375765,59,260494
366165,58,231525
537669,47,77064
428652,42,47959
554652,47,82234
401859,57,203344
150623,76,1353903
359372,59,249606
441373,49,98723
-1,1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1

DOC;
		return json_encode($results);
	}
}