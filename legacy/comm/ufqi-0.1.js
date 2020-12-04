
//-- -NatureDNS init.
//-- added by wadelau@ufqi.com on Thu Oct 24 11:35:21 CST 2013
(function(win){
    var url = '';
    var ipos = 0;
    var preurl = 'https://ufqi.com/naturedns/search?q=';
    var ndnstag = '#-'; //- tag userd in <a href="#-r/abbc">
    for(var i=0, l=document.links.length; i<l; i++){
        url = document.links[i].href;
        ipos = url.indexOf(ndnstag); 
        if(ipos > 0){
            url = url.substring(ipos+1);
            document.links[i].href = preurl + url;
        }
    }
    if(typeof win.console == 'undefined'){
        win.console = {log:function(s){ return 0;}};
    }
    win.console.log('-NatureDNS initiated.');
})(window);


//- remedy by wadelau, on Fri Dec 11 16:24:00 CST 2015
function actByKey(el){
    var keyValue = event.keyCode;
    var linkObj = document.getElementById('goto');
    if(!el.value.startsWith('-')){
        el.value = '-' + el.value;
    }
    if(false && el.value.endsWith('-')){
        el.value = el.value.substring(0, el.value.length - 1);
    }
    if(linkObj){
        linkObj.href = '/naturedns/search?q='+el.value;
    }
    //console.log('keyValue:'+keyValue+', link:'+linkObj.href);
    if(keyValue == 10 || keyValue == 13){
       //linkObj.onclick();    
       //window.location = linkObj.href;
       linkObj.target = '_blank';
       //window.open(linkObj, 'NewWindow', '_blank');
       openPage(linkObj, 'NewWindow', '_blank');
    }
}


function setFocus(sId){
    document.getElementById(sId).blur();
    document.getElementById(sId).focus();
}


function openPage(sURL) {
    var p = document.createElement("a");
    p.setAttribute("href", sURL);
    p.setAttribute("target", "_blank");
    p.setAttribute("id", "newPage_"+(new Date()));
    document.body.appendChild(p);
    p.click();
}

if(typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
        return this.slice(0, str.length) == str;
    };
}

if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function (str){
        return this.slice(-str.length) == str;
    };
}
