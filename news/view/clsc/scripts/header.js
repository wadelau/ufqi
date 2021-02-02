/*
 * header.js for global functions and tools
 * since 13:58 2021-01-29
 */
//- imgs and advs
var lastRandImgi = 0; var maxdefimgi = 7;
//-	
function getRandImgI(myMax){
	if(typeof myMax == 'undefined' || typeof myMax == undefined){
		myMax = maxdefimgi + 1;
	}
	var randimgi = Math.floor(Math.random() * Math.floor(myMax));
	if(randimgi == lastRandImgi){ 
		randimgi = Math.floor(Math.random() * Math.floor(myMax)); 
	}
	lastRandImgi = randimgi;
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
	if(tmpRandi == lastRandImgi){
		tmpRandi = Math.floor(Math.random() * Math.floor(advListLen));
		lastRandImgi = tmpRandi;
	}
	return $advList[tmpRandi];
}
//- visual gradient for adv.
function tinyGradient(myObj){
	var sizeChange = 1.5; var gradientStep = 0.15;
	var myMax = 100; var mySizeMin = 100; var mySizeMax = 175;
	if(myObj){
		var mySize = myObj.height;
		var tmpRandi = Math.floor(Math.random() * Math.floor(myMax));
		if(tmpRandi == lastRandImgi){
			tmpRandi = Math.floor(Math.random() * Math.floor(myMax));
		}
		if(tmpRandi % 2 == 0){ mySize = mySize + sizeChange; }
		else{ mySize = mySize - sizeChange; }
		if(mySize <= mySizeMin){ mySize = mySizeMin + (sizeChange * 3); }
		else if(mySize => mySizeMax){ mySize = mySizeMax - (sizeChange * 3); }
		
		var oldV = myObj.style.opacity;
		oldV = oldV=='' ? (Math.random()) : oldV;
		oldV = parseFloat(oldV);
		if(typeof oldV == 'undefined' || typeof oldV == undefined || isNaN(oldV)){
			oldV = 0.1;
		}
		else if(oldV >= 1.0){
			if(tmpRandi % 3 != 0){ oldV = 0.1; }else{ oldV = Math.random(); }
		}
		else{ oldV += gradientStep; }
		lastRandImgi = tmpRandi;
		
		//console.log('tmpRandi:'+tmpRandi+' mySize:'+mySize+' 22 oldV:'+oldV);
		myObj.height = mySize;
		myObj.style.opacity = oldV;
	}
}
