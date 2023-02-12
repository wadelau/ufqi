var isMobile = false;
if(true){
	var ua = navigator.userAgent.toLowerCase();
	if(ua.indexOf('mobile') > 0){ isMobile=true; }
}
//- _isDefined
//- @param: $var, to be tested; global_or_local: 'global|local', optional
//- return true | false
//- usage: test whether a global variable($var): _isDefined("$var") , _isDefined($var) 
//- test a variable($var) declared nearby/locally: _isDefined($var) , _isDefined("$var", "local")
function _isDefined($var, global_or_local){
	var isDef = false;
	if($var != null){
		var myTp = typeof $var;
		if(myTp == 'string'){
			if(window.hasOwnProperty($var)){
				isDef = true;
			}
			else if(global_or_local != null && global_or_local == 'local'){
				isDef = true;
			}
			else{
				/*
				var tmpFunc = new Function($var, 'try{console.log(this.'+$var+');return (typeof this.'+$var+');}catch(e07121512){return null;}');
				var tmpVar = tmpFunc.call(this);
				var callerx = (new Error()).stack.split("\n")[2].trim().split(" ")[1];
				var callerFunc = window[callerx];
				console.log("_isDefined: var:["+$var+"] tmpFunc:"+tmpFunc+" tmpVar:"+tmpVar+" typeof:"+(typeof tmpVar)+" caller:"+callerx+" type:"+(typeof callerFunc)+" window-has:"+window.hasOwnProperty(callerx)+" func-has:"+callerFunc.hasOwnProperty($var)+" func-has2:"+callerFunc[$var]);
				Object.getOwnPropertyNames(callerFunc).forEach(
				  function (val, idx, array) {
					console.log(val + ' -> ' + callerFunc[val]);
				  }
				);
				 */
				if(myTp != 'undefined' && myTp != 'null'){
					isDef = true;
				}
				else{
					console.log("isDef: trapped? var:"+$var+" isDef:"+isDef);
				}
			}
		}
		else if(myTp != undefined && myTp != null){
			isDef = true;
		}
	}
	return isDef;
}
//-
function _getElement(idName){
	var obj = document.getElementById(idName);
	var myObj = new Object();
	if(_isDefined(obj)){
		myObj = obj;
	}
	else{
		var objs = document.getElementsByName(idName);
		if(_isDefined(objs)){
			if(_isDefined(objs[0])){
				myObj = objs[0];
			}
		}
	}
	//console.log("comm/ido: _g idName:"+idName+" myObj:"+JSON.stringify(myObj));
	return myObj;
}
//-
function numFormat(myNum){
	if (myNum == null || typeof myNum == 'undefined' 
		|| isNaN(myNum)){
        myNum = 0.00;
    }
	myNum = '' + myNum;
	myNum = myNum.trim();
	if(myNum != ''){
		var dotPos = myNum.indexOf('.');
		if(dotPos > -1){ 
			if(dotPos == myNum.length-1 ){
				myNum = myNum + '0'; 
			}
			else{
				myNum = myNum.substring(0, dotPos+3); 
			}
		}
		else{
			myNum += '.00';
		}
	}
	else{
		myNum = '0.00';	
	}
	//return parseFloat(myNum).toFixed(1);
	myNum = myNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); //- seperate , each thousand
	var myNumLen = myNum.length;
	myNum = myNum.substring(0, myNumLen-2) + '<sup>'+myNum.substring(myNumLen-2, myNumLen-1)+'</sup>';
	return myNum;
}
//-
function showAddress(codeList, addrCode){
    var s = '';
    var codeLen = addrCode.length; var myName = '';
    for(var i=2; i<=codeLen; i+=2){
		myName = codeList[addrCode.substring(0, i)];
		if(typeof myName == 'undefined'){ myName = '其他'; }
        s += myName + (i==codeLen?'':' - ');
    }
    return s;
}
//-
function showAddressLink(codeList, addrCode, codeName, linkPrefix){
    var s = '';
    var codeLen = addrCode.length; var myName = '';
    for(var i=2; i<=codeLen; i+=2){
		myName = codeList[addrCode.substring(0, i)];
		if(typeof myName == 'undefined'){ myName = '其他'; }
        s += myName + '<a href="'+linkPrefix+'&pnsk'+codeName+'='+addrCode.substring(0,i-2)+'&oppnsk'+codeName+'=startswith"><sup>X</sup></a>'+(i==codeLen?'':' - ');
		
    }
	s = s=='' ? '全球Glb' : s;
    return s;
}
//-
var StaticClientStorage = function(saveKey){
	var hasLocalStorage = false;
	var maxUserKwCount = 14; // ten
	var clientStorageKey = saveKey;
	if(typeof clientStorageKey == 'undefined'){ clientStorageKey = 'userClientKey'; }
	if(window.localStorage){
		hasLocalStorage = true;
	}
	this.set = function($key, $val){
		if(hasLocalStorage){
			if(typeof $key == 'undefined'){ $key = this.clientStorageKey; }
			if($key){
				var $oldv = this.get($key); // $oldv = '';
				var tmpjson = {};
				var $oldc = 0; var hasMinus = false;
				if($val.indexOf('-') > -1){ $val = $val.substring(1); hasMinus=true; }
				if(typeof $oldv != 'undefined' && $oldv != null && $oldv != ''){
					tmpjson = JSON.parse($oldv);
					var sortedArr = []; var $tmpi=0;
					for(var $k in tmpjson){
						sortedArr.push(tmpjson[$k]);	
					}
					sortedArr.sort(function(a, b){ return b - a; });
					var tmpjson2 = {}; var dispCount = 0;
					if(!hasMinus && tmpjson[$val]){ tmpjson2[$val] = tmpjson[$val]; }
					var tmpMaxUserKwCount = maxUserKwCount + 2;
					for(var $k in sortedArr){
						for(var $j in tmpjson){
							if(tmpjson[$j] == sortedArr[$k]){
								tmpjson2[$j] = tmpjson[$j]; dispCount++;
								delete tmpjson[$j]; break;
							}
						}
						if(dispCount > tmpMaxUserKwCount){ //- 2 more
							break;	
						}
						//console.log("dispc:"+dispCount+" k:"+$k);	
					}
					//console.log("tmpjson:"+$oldv+" to tmpjson2:"+JSON.stringify(tmpjson2));
					tmpjson = tmpjson2;
				}
				if(tmpjson[$val]){ $oldc = tmpjson[$val]; }
				if(hasMinus){ $oldc--; }else{ $oldc++; }
				tmpjson[$val] = $oldc;
				var $finalval = JSON.stringify(tmpjson);
			}
			
			try{
				window.localStorage.setItem($key, $finalval);
				//console.log("localstorage set-succ: key:"+$key+" val:"+$val+" fval:"+$finalval+".");
			}
			catch(e202201151544){
				//- detect large unused Object for localStorage quotes
				var tmpk = '';
				for ( var i = 0, len = localStorage.length; i < len; ++i ) {
				  tmpk = localStorage.key(i);
				  console.log( "\trmvd-i:"+i+" k:["+tmpk+"] v:"+ localStorage.getItem(tmpk));
				  if(tmpk != null && tmpk.indexOf('st_shares') > -1){ window.localStorage.removeItem(tmpk); }
				}
				console.log("localstorage set-fail: key:"+$key+" val:"+$val+" fval:"+$finalval+".");
			}
			//console.log("localstorage get: key:"+$key+" val:"+window.localStorage.getItem($key)+".");
		}
		else{
			console.log("no localstorage found for set.");	
		}
	};
	this.get = function($key){
		var $val = '';
		if(typeof $key == 'undefined'){ $key = this.clientStorageKey; }
		if(hasLocalStorage){
			$val = window.localStorage.getItem($key);
			if($val == null || typeof $val == 'undefined' || $val == 'undefined' || $val == ''){ $val = '{}';}
			//console.log("localstorage get: key:"+$key+" val:"+$val+".");	
		}
		else{
			console.log("no localstorage found for get.");	
		}
		return $val;
	};
	//- remove an item inside an array, added 16:02 2022-03-25
	this.remove = function($key, $childKey){
		var $val = '';
		if(typeof $key == 'undefined'){ $key = this.clientStorageKey; }
		if(hasLocalStorage){
			$val = window.localStorage.getItem($key);
			if($val == null || typeof $val == 'undefined' || $val == 'undefined' || $val == ''){ $val = '{}';}
			//console.log("localstorage get: key:"+$key+" val:"+$val+".");
			var tmpjson = {}; var tmpjson2 = {};
			tmpjson = JSON.parse($val);
			var tmpKeyArr = $childKey.split('|');
			var $childKeyCode = tmpKeyArr[1]; //- remedy for updts names from 3-rd party. 10:48 2022-07-04
			for(var $k in tmpjson){
				if($k != $childKey && ($k.indexOf($childKeyCode) < 0)){
					tmpjson2[$k] = tmpjson[$k]; 
				}	
			}
			tmpjson = tmpjson2;
			var $finalval = JSON.stringify(tmpjson);
			try{
				window.localStorage.setItem($key, $finalval);
				//console.log("localstorage set-succ: key:"+$key+" val:"+$val+" fval:"+$finalval+".");
			}
			catch(e202203251616){
				//-
			}
			console.log("StaticClientStorage: key:"+$key+" childKey:"+$childKey+" removed.");
		}
		else{
			console.log("no localstorage found for get.");	
		}
		return true;
	}
	this.maxUserKwCount = maxUserKwCount;
}
//var SCS = new StaticClientStorage();
