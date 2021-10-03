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
			}
		}
		else if(myTp != 'undefined'){
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
		if(dotPos > -1){ myNum = myNum.substring(0, dotPos+3); }
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
