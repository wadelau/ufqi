//- relocate from footer.html, 11:14 2020-12-04

//- comments, 10:18 2021-02-24
function call2Comment(winTag, sId){
	if(typeof sId == 'undefined'){ sId = ''; }
	var cmtListAreaId = 'commentArea'; var myDataAct = 'data-act';
	var pubAreaId = 'commentArea4Publish'; var pubIframeId = 'callComment';
	winTag = winTag=='' ? 0 : winTag; winTag = parseInt(winTag);
	if(winTag == 0 || winTag == 3){
		//- open to make a new comment or reply
		var comment4Pub = document.getElementById(pubAreaId);
		if(comment4Pub){
			comment4Pub.style.display = 'inline-block';
			comment4Pub.style.height = '260px';
			var tmpIframe = document.getElementById(pubIframeId);
			if(tmpIframe){
				tmpIframe.style.height = '255px';
				var thisHref = document.getElementById(sId);
				if(thisHref){
					tmpIframe.src = thisHref.getAttribute(myDataAct);
				}
			}
			var commentList = document.getElementById(cmtListAreaId);
			if(commentList){
				commentList.style.display = 'none';
				commentList.style.height = 0;
				commentList.style.opacity = 0;
			}
		}
	}
	else if(winTag == 1){
		//- close and return
		var comment4Pub = document.getElementById(pubAreaId);
		if(comment4Pub){
			comment4Pub.style.display = 'none';
			comment4Pub.style.height = 0;
			var tmpIframe = document.getElementById(pubIframeId);
			if(tmpIframe){
				tmpIframe.style.height = 0;
			}
		}
		var commentList = document.getElementById(cmtListAreaId);
		if(commentList){
			commentList.style.display = 'inline-block';
			commentList.style.height = 'auto';
			commentList.style.opacity = 1.0;
		}
	}
	else if(winTag == 2 || winTag == -1){
		//- upvote or downvote
		var thisHref = document.getElementById(sId);
		if(thisHref){
			var actStr = thisHref.getAttribute(myDataAct);
			var tmpIframe = document.getElementById(pubIframeId);
			if(tmpIframe){
				tmpIframe.src = actStr;
				var tmpTag = winTag>0 ? '👍' : '	👎';
				window.alert((new Date())+':\n'+tmpTag+'感谢评议!');
			}
		}
	}
	else{
		console.log("call2Comment: winTag:"+winTag+" not found. "+(new Date()));
	}
	return true;
}

//-
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
		//console.log("ulong open by click.....myUrl:"+myUrl);
	}
	event.preventDefault();
	return false;
}

//-
var clientStoreKw = 'userkwulong';
var StaticClientStorage = function(clientStoreKw){
	var hasLocalStorage = false;
	var maxUserKwCount = 6; // seven
	if(window.localStorage){
		hasLocalStorage = true;	
	}
	this.set = function($key, $val){
		if(hasLocalStorage){
			if($key == clientStoreKw){
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
					tmpjson = tmpjson2;
				}
				if(tmpjson[$val]){ $oldc = tmpjson[$val]; }
				if(hasMinus){ $oldc--; }else{ $oldc++; }
				tmpjson[$val] = $oldc;
				var $finalval = JSON.stringify(tmpjson);
			}
			window.localStorage.setItem($key, $finalval);	
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

//var clientStorage = new StaticClientStorage(clientStoreKw);
var CS = new StaticClientStorage(clientStoreKw);
if(true){
	var selfkw = document.getElementById('topkw_self_div');
	if(selfkw){
		var $val = CS.get(clientStoreKw);
		//console.log("read clientStorage.ulong:"+$val);
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
						selfList += '<a href="'+theUrl+'&mod=ulong&pnskwordid='+wordId+','+tmpArr[1]+'" '
							+' onclick="CS.set(\'userkwulong\', \''+$j+'\');"'
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
	var xurl = "https://ufqi.com/news/?mod=ulong&sid=bookmark";
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
		window.location.href = theUrl+"&mod=rdr&act=add2desktop";
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

//-
window.onload = function(){
	//- @todo
};

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
				//console.log(xpos + ' × ' + ypos+' resized to 768px.');
				document.body.style.width =  '768px' ;
				var myelm = document.createElement("div");
				myelm.setAttribute('id', 'ufqinews_qrcode');
				var qrcodecont = '<br/>&nbsp;<img src="'+viewdir+'/images/ufqilong-qrcode.202002.gif"'
					+' alt="ufqinews qrcode"/><br/>&nbsp;<span style="font-size:11px;">扫码到手机看</span><br/><p>&nbsp;</p>';
				myelm.innerHTML = qrcodecont;
				document.getElementById('maindiv').appendChild(myelm);
			}
			else{
				//console.log(xpos + ' × ' + ypos+' is less than 768px.');
			}
		}
	}, 1*1000);
}
if('{$mod}'!='intro' && '{$ref}'!='introiframe'){
	if(window.addEventListener){
		//window.addEventListener('load', resizeWindow); // in case of load failed....
		window.addEventListener('load', function(){ resizeWindow(); });
		//console.log("resize attached. ulong");
	}
	else{
		resizeWindow();	
		//console.log("resize launched.");
	}
}