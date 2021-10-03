/*
 * header.js for global functions and tools
 * since 13:58 2021-01-29
 */

//- get objects
function _getElement(idName){
	var obj = document.getElementById(idName);
	var myObj = new Object();
	if(obj != null && typeof obj != 'undefined'){
		myObj = obj;
	}
	else{
		var objs = document.getElementsByName(idName);
		if(objs != null && typeof objs != 'undefined'){
			if(objs[0] != null && typeof objs[0] != 'undefined'){
				myObj = objs[0];
			}
		}
	}
	//console.log("comm/ido: _g idName:"+idName+" myObj:"+JSON.stringify(myObj));
	return myObj;
} 
 
//- imgs and advs
var lastRandImgi = 0; var maxdefimgi = 7;
//-	
function getRandImgI(myMax){
	if(typeof myMax == 'undefined' || typeof myMax == undefined){
		myMax = maxdefimgi + 1;
	}
	var randimgi = Math.floor(Math.random() * Math.floor(myMax));
	var lastRandImgi = window.lastRandImgi;
	if(randimgi == lastRandImgi){ 
		randimgi = Math.floor(Math.random() * Math.floor(myMax)); 
	}
	window.lastRandImgi = randimgi;
	return randimgi;
}
//-
if(typeof existAdvList == 'undefined' || typeof existAdvList == undefined){ window.existAdvList = {}; }
function matchAdv(advList, keyList){
	var tgtAdv = {}; var hasMatched = false;
	var advLength = advList.length; var tmpTit = ''; var tmpId = 0;
	var keyLen = keyList.length; var tmpKey = '';
	for(var i2=0; i2<advLength; i2++){
		tmpTit = advList[i2]['iname']; tmpId = advList[i2]['id'];
		for(var i3=0; i3<keyLen; i3++){
			tmpKey = keyList[i3];
			if(tmpTit.indexOf(tmpKey) > -1){
				if(!existAdvList.hasOwnProperty(tmpId)){
					hasMatched = true;
					existAdvList[tmpId] = 1;
					break;
				}
			}
		}
		if(hasMatched){
			tgtAdv = advList[i2];
			console.log("found matched: i2:"+i2+"/"+tmpTit+" i3:"+i3+"/"+tmpKey);
			break;
		}
	}
	return tgtAdv;
}
//-
if(typeof lastRandImgi == 'undefined' || typeof lastRandImgi == undefined){ window.lastRandImgi = 0; }
function getRandAdv($advList){
	var advListLen = $advList.length;
	var tmpRandi = Math.floor(Math.random() * Math.floor(advListLen));
	var lastRandImgi = window.lastRandImgi;
	if(tmpRandi == lastRandImgi){
		tmpRandi = Math.floor(Math.random() * Math.floor(advListLen));
	}
	window.lastRandImgi = tmpRandi;
	return $advList[tmpRandi];
}
//- visual gradient for adv.
function tinyGradient(myObj){
	var sizeChange = 1; //- min value: 1px
	var gradientStep = 0.15; var myMax = 100; 
	var mySizeMin = 110; var mySizeMax = 178; //- same as css
	if(myObj){
		var mySize = myObj.height;
		var tmpRandi = Math.floor(Math.random() * Math.floor(myMax));
		var lastRandImgi = window.lastRandImgi;
		if(tmpRandi == lastRandImgi){
			tmpRandi = Math.floor(Math.random() * Math.floor(myMax));
		}
		if((tmpRandi % 2) == 1){ mySize = mySize - sizeChange; }
		else{ mySize = mySize + (sizeChange*2); }
		if(mySize <= mySizeMin){ mySize = mySizeMin*3/2; }
		else if(mySize >= mySizeMax){ mySize = mySizeMax*2/3; }
		
		var oldV = myObj.style.opacity;
		oldV = (oldV=='') ? (Math.random()) : oldV;
		oldV = parseFloat(oldV);
		if(typeof oldV == 'undefined' || typeof oldV == undefined || isNaN(oldV)){
			oldV = 0.1;
		}
		else if(oldV >= 1.4){
			if(tmpRandi % 3 != 0){ oldV = 0.1; }else{ oldV = Math.random(); }
		}
		else{ oldV += gradientStep; }
		window.lastRandImgi = tmpRandi;
		
		//console.log('tmpRandi:'+tmpRandi+' mySize:'+mySize+' oldV:'+oldV+' 109');
		myObj.height = mySize;
		myObj.style.opacity = oldV;
	}
}
