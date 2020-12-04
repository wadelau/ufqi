//- copy from webroot/view/js/common.js
//- 17:06 2020-11-09
var isMobile = false;
if(true){
	var ua = navigator.userAgent.toLowerCase();
	if(ua.indexOf('mobile') > 0){ isMobile=true; }
}
//-
function numFormat(myNum){
	myNum = '' + myNum;
	var dotPos = myNum.indexOf('.');
	if(dotPos > -1){ myNum = myNum.substring(0, dotPos+3); }
	return parseFloat(myNum);
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
    return s;
}
//-
function _getElement(idName){
	var obj = document.getElementById(idName);
	if(obj){
		return obj;
	}
	else{
		var objs = document.getElementsByName(idName);
		if(objs){
			return objs[0];
		}
	}
}