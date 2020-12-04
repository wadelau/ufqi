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