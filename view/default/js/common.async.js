//- script after page load

//-
function dispStateSelect(myState){
	var myUrl = $url+"&mod="+$mod+"&act="+$act;
	if(_isDefined("$pnskitype") && $pnskitype != ''){ myUrl += "&pnskitype="+$pnskitype; }
	if(myState!='all'){
		myUrl += "&pnskistate="+myState;
	}
	/*
	var a;
	console.log("dispStateSelect: a:"+_isDefined(a));
	var b = null;
	console.log("dispStateSelect: b:"+_isDefined(b));
	var c = 0;
	console.log("dispStateSelect: c:"+_isDefined(c));
	console.log("dispStateSelect: global-c:"+_isDefined("c"));
	var dd = "d_string";
	console.log("dispStateSelect: local-dd:"+_isDefined(dd, 'local'));
	console.log("dispStateSelect: global-dd:"+_isDefined(dd));
	console.log("dispStateSelect: global-dd:"+_isDefined("dd"));
	console.log("dispStateSelect: local-dd:"+_isDefined("dd", 'local'));
	*/
	if(true){
		window.location.href = myUrl;
	}
}
//-
function dispTypeSelect(myType){
	var myUrl = $url+"&mod="+$mod+"&act="+$act;
	if(_isDefined("$pnskistate") && $pnskistate != ''){ myUrl += "&pnskistate="+$pnskistate; }
	if(myType!='all'){
		myUrl += "&pnskitype="+myType;
	}
	if(true){
		window.location.href = myUrl;
	}
}