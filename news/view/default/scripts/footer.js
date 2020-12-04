//- relocate from footer.html, 21:13 2020-12-04

// TODO add service worker code here
if (false && 'serviceWorker' in navigator && 'PushManager' in window) {
	navigator.serviceWorker
	 .register(viewdir+'/scripts/service-worker.js')
	 .then(function() { console.log('Service Worker Registered'); })
	 .catch(function(error) { console.error('Service Worker Error', error);});
}
apiready = function(){
	console.log(msg=(new Date())+" apiready: viewdir:"+viewdir+", devid:"+api.deviceId);
	//window.alert("msg:"+msg);
}

//-
function openLocalWin(myUrl, myTitle){
	if(true && typeof api != 'undefined'){
		//window.alert("api:"+api+" url:"+myUrl+" marginH:"+marginH);
		api.openWin({
			name: 'readWindowServer',
			//url: 'fs://./index3.html?url='+myUrl+'&tit='+myTitle,
			url: myUrl, 
			scrollEnabled: true,
			vScrollBarEnabled: true,
			reload: true,
			/*
			rect: { 
				marginTop: 35, 
				marginBottom: 0, 
				w: 'auto', 
				h: 'auto'
				},
			*/
			});
	}
	else{
		var timeToWait = window.setTimeout(function(){
				var isMObj = document.getElementById('isMobile');
				var isMObjVal = 0;
				if(isMObj){ isMObjVal = isMObj.innerText; }
				if(isMObjVal==1){
					document.location.href = myUrl;
				}
				else{
					window.open(myUrl, '_blank');
				}
			}, 10); //- 0.01 sec
		//console.log("news open by click.....myUrl:"+myUrl);
	}
	event.preventDefault();
	return false;
}

//- relocate from footer.html, 10:36 2020-12-04
var StaticClientStorage = function(){
	var hasLocalStorage = false;
	var maxUserKwCount = 6; // seven
	if(window.localStorage){
		hasLocalStorage = true;	
	}
	this.set = function($key, $val){
		if(hasLocalStorage){
			if($key == 'userkw'){
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
			window.localStorage.setItem($key, $finalval);
			//console.log("localstorage set: key:"+$key+" val:"+$val+" fval:"+$finalval+".");	
		}
		else{
			console.log("no localstorage found for set.");	
		}
	};
	this.get = function($key){
		var $val = '';
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
	this.maxUserKwCount = maxUserKwCount;
}
//var clientStorage = new StaticClientStorage();
var CS = new StaticClientStorage();
if(true){
	var selfkw = document.getElementById('topkw_self_div');
	if(typeof selfkw != 'undefined' &&  selfkw != undefined && selfkw){
		var $val = CS.get('userkw');
		//console.log("read clientStorage:"+$val);
		var tmpjson = JSON.parse($val);
		var sortedArr = []; var $tmpi=0;
		for(var $k in tmpjson){
			//console.log("tmpjson key:"+$k+" val:"+tmpjson[$k]+" tmpi:"+$tmpi);	
			sortedArr.push(tmpjson[$k]);	
		}
		sortedArr.sort(function(a, b){ return b - a; });
		var selfList = ''; var tmpArr = []; var dispCount = 0;
		for(var $k in sortedArr){
			//console.log("sortedArr key:"+$k+" val:"+sortedArr[$k]);	
			for(var $j in tmpjson){
				if(tmpjson[$j] == sortedArr[$k]){
					tmpArr = $j.split('|');
					if("{$wordId}".indexOf(tmpArr[1]) > -1){
						//- same kw
					}
					else{
						if(tmpArr[0].length > 2){
						tmpArr[0] = tmpArr[0].substring(0, 2);
						}
						selfList += '<a href="'+theUrl+'&pnskwordid='+wordId+','+tmpArr[1]+'" '
							+' onclick="CS.set(\'userkw\', \''+$j+'\');"'
							+' class="bdkw">+'+tmpArr[0]+'</a> '; 
						dispCount++;
					}
					delete tmpjson[$j]; break;
				}
			}
			//console.log("dispc:"+dispCount+" usermax:"+clientStorage.maxUserKwCount);
			if(dispCount > CS.maxUserKwCount){
				break;	
			}
		}
		selfkw.innerHTML = selfList;
	}
	else{
		//window.alert("no userkw div?");	
	}
}

//-
function addBookMark() {
	var xtitle = "UfqiNews";
	var xurl = "https://ufqi.com/news/?sid=bookmark";
	if(document.all) { // ie
		window.external.AddFavorite(xurl, xtitle);
	}
	else if(window.sidebar) { // firefox
		window.sidebar.addPanel(xtitle, xurl, "");
	}
	else if(window.opera && window.print) { // opera
		var elem = document.createElement('a');
		elem.setAttribute('href', xurl);
		elem.setAttribute('title', xtitle);
		elem.setAttribute('rel','sidebar');
		elem.click(); // this.title=document.title;
	}
	else{
		console.log("unsupported terminal? "+navigator.userAgent.toLowerCase());		
		window.location.href = theUrl+'&mod=rdr&act=add2desktop';
	}
}

//- auto scroll into next page
if(typeof autoScrollDivObj != 'undefined'){
	autoScrollDivObj.onscroll = runOnScroll;	
	autoScrollDivObj.addEventListener("scroll", runOnScroll);	
	autoScrollDivObj.addEventListener("onscroll", runOnScroll);	
	autoScrollDivObj.addEventListener("touchend", runOnScroll, false);	
	autoScrollDivObj.addEventListener("dragleave", runOnScroll, false);	
	autoScrollDivObj.addEventListener("dragend", runOnScroll, false);	
	autoScrollDivObj.addEventListener("drop", runOnScroll);	
	autoScrollDivObj.ondrop = runOnScroll
	//autoScrollDivObj.addEventListener("mouseup", runOnScroll);	
	//autoScrollDivObj.addEventListener("keyup", runOnScroll);	
	autoScrollDivObj.onwheel = runOnScroll;
	autoScrollDivObj.addEventListener("wheel", runOnScroll);	
	autoScrollDivObj.addEventListener("onwheel", runOnScroll, false);	
}

//- manully append preload (not in head) with script with firefox
if(true){
	var ua = navigator.userAgent.toLowerCase();	
	var nextPgObj = document.getElementById('nextpagegroup');
	if(nextPgObj == null || typeof nextPgObj == 'undefined'){
		nextPgObj = document.getElementById('nextpage');	
	}
	if(ua.indexOf('firefox') > -1 
		&& nextPgObj != null && typeof nextPgObj != 'undefined'){
		var preloadLink = document.createElement("link");
		preloadLink.href = nextPgObj.value;
		preloadLink.rel = "preload";
		preloadLink.as = "document";
		document.head.appendChild(preloadLink);
		console.log((new Date())+" append preload for firefox:"+preloadLink.href);
	}
}

//-- filled the full window, wadelau@ufqi.com, Fri Mar  8 01:59:12 UTC 2019
function resizeWindow(){
	var resizeWindowTimer = window.setTimeout(function(){
		if(true){ 
			var win = window,
				doc = document,
				elm = doc.documentElement,
				gbo = doc.getElementsByTagName('body')[0],
				xpos = win.innerWidth || elm.clientWidth || gbo.clientWidth,
				ypos = win.innerHeight|| elm.clientHeight|| gbo.clientHeight;
			//document.getElementById('maindiv').style.height = (ypos-56) +'px';
			if(xpos > 768){ // - desktop
				console.log(xpos + ' × ' + ypos+' resized to 768px.');
				document.body.style.width =  '768px' ;
				var myelm = document.createElement("div");
				myelm.setAttribute('id', 'ufqinews_qrcode');
				var qrcodecont = '&nbsp;<img src="'+viewdir+'/images/ufqinews-qrcode.201903.png"'
					+' alt="ufqinews qrcode"/><br/>&nbsp;<span style="font-size:11px;">扫码到手机看</span><br/><p>&nbsp;</p>';
				myelm.innerHTML = qrcodecont;
				document.getElementById('maindiv').appendChild(myelm);
			}
			else{
				console.log(xpos + ' × ' + ypos+' is less than 768px.'); 
			}
		}
	}, 1*1000);
}
if('{$mod}'!='intro' && '{$ref}'!='introiframe'){
	/*
	window.onload = function(){
		resizeWindow();
	};
	*/
	if(window.addEventListener){
		window.addEventListener('load', function(){ resizeWindow(); });
		console.log("resize attached.");
	}
	else{
		resizeWindow();	
		console.log("resize launched.");
	}
}