//- relocate from finance-fund-chart.html, 09:27 2024-03-13

var getWeekNo = function(myDateStrOrMilliSecond){
	var currentdate = new Date(myDateStrOrMilliSecond);
	var oneJan = new Date(currentdate.getFullYear(),0,1);
	var numberOfDays = Math.floor((currentdate - oneJan) / (24 * 60 * 60 * 1000));
	var resultNo = Math.ceil((1 + numberOfDays) / 7);
	//console.log("timestamp:["+myDateStrOrMilliSecond+"] currentdate:["+currentdate+"] day:["+currentdate.getDay()+"] numberOfDays:["+numberOfDays+"] ceil resultNo:["+resultNo+"]");
	return [currentdate.getFullYear(), resultNo];
};
//- append marker for trade, 11:50 2022-11-27
var appendMark = function(myItem, isWeekView){
	var theItem = myItem;
	var tmpDate = null; var tmpTime = 0; var tradeInfo = {}; 
	var hasSold = false; var tmpTimeSell = 0;
	var weekNo1=0, weekNo2=0, weekNo3=0, hasMark=0; 
	for(var ti in $fundTradeList){
		tradeInfo = $fundTradeList[ti];
		if(typeof tradeInfo != 'undefined'){
			if(typeof tradeInfo['hasMark'] != 'undefined'){ 
				hasMark = tradeInfo['hasMark'];
				if(hasMark > 1){ continue; }
			}
			else{ hasMark = 0; }
			if(tradeInfo['sell_date'].indexOf('1000') > -1){ hasSold = false; }else{ hasSold = true; }
			if(hasSold){ 
				tmpDate = new Date(tradeInfo['sell_date']); 
				tmpTimeSell = tmpDate.getTime();
				tmpDate = new Date(tradeInfo['idate']);
			}
			else{ 
				tmpDate = new Date(tradeInfo['idate']);
				tmpTimeSell = 0;
			} 
			tmpTime = tmpDate.getTime();
			//console.log("appendMark: tmpDate:"+tmpDate+" tmpTime:"+tmpTime+"/theTime:"+theItem[0]+" timeZoneShift:"+timeZoneShift+" balance:"+(tmpTime-theItem[0])+". theItem:"+theItem);
			if(theItem[0] == tmpTime+1000){ //- 1 second more, see timeZoneShift
				theItem.push(1); hasMark++; //- buy-in
			}
			else if(theItem[0] == tmpTimeSell+1000){ //- 1 second more, see timeZoneShift
				theItem.push(-1); hasMark++; //- sell-out
			}
			else if(isWeekView){
				weekNo1 = getWeekNo(theItem[0]); weekNo2 = getWeekNo(tmpTime);
				weekNo3 = getWeekNo(tmpTimeSell);
				if(weekNo1[0] == weekNo2[0] && weekNo1[1] == weekNo2[1]){
					theItem.push(1); hasMark++; //- buy-in
				}
				else if(weekNo1[0] == weekNo3[0] && weekNo1[1] == weekNo3[1]){
					theItem.push(-1); hasMark++; //- sell-out
				}
			}
			tradeInfo['hasMark'] = hasMark; $fundTradeList[ti] = tradeInfo; //- marked only once
		}		
	}
	return theItem;
};

//-
function changePriceSwitch(itype){
	var priceObj = _getElement('appendprice');
	var priceObjPerc = _getElement('appendpricepercent');
	if(itype == 0){
		priceObj.value = (priceObj.value * (1 + priceObjPerc.value/100)).toFixed(4);
	}
	else if(true){
		priceObjPerc.value = (((priceObj.value - itype ) / itype) * 100).toFixed(4);	
	}
	return 0;
}

//- added by xenxin@ufqi, 12:07 2022-09-17
function drawTable(myData){
	//console.log("drawTable:"); 
	var data = myData.xdata;
	var len = data.length; var last12 = 16; 
	var tmpData = null; var tmpDate = null; var tmpDataLast = null;
	var lastPrice = 0.0; var diff = 0.0; var diffPercent = 0.0;
	var tbl = '<table class="tbldata"><tr><td colspan="6"><strong>'+myData.iname+'-'
		+myData.icode+'-行情数据表</strong></td></tr>';
	tbl += '<tr><td><b>序号</b></td><td><b>日 &nbsp; 期</b></td><td><b>累计价格</b></td><td><b>浮动值</b></td>'
		+'<td><b>增减%</b></td><td><b>累计%</b></td></tr>';
	var initalVal = data[len-last12-1]; tmpDate = new Date(initalVal[0]);
	var firstVal = data[len-last12-1][1]; var firstDiff = 0.0; var firstDiffStr = ''; var tmpDateStr='';
	//console.log("firstVal-22:"+(new Date(data[len-last12-1][0])).format("YYYY-mm-dd")+" val:"+firstVal);
	var plusMark = ''; var plusCount = 0; var lastDiff = 0;
	for(var i=0; i<last12; i++){
		tmpData = data[len-i-1]; tmpDataLast = data[len-i-2];
		tmpDate = new Date(tmpData[0]);
		diff = tmpData[1] - tmpDataLast[1]; diffPercent = diff / tmpDataLast[1]; 
		diff = parseFloat(diff.toFixed(4)); diffPercent = (diffPercent*100).toFixed(1);
		firstDiff = (((tmpData[1]-firstVal)/firstVal)*100).toFixed(1);
		if(parseFloat(diffPercent) > 0){ 
			plusMark = '+'; 
			if(lastDiff > 0){ plusCount++; }else{ plusCount = 1;}
		}
		else{ 
			plusMark = '-'; 
			if(lastDiff <= 0){ plusCount++; }else{ plusCount = 1; } 
		}
		if(firstDiff > 0){
			firstDiffStr = '<span class="activegreen">+'+firstDiff;
		}
		else if(firstDiff < 0){
			firstDiffStr = '<span class="activered">'+firstDiff;
		}
		else{
			firstDiffStr = '<span>'+firstDiff;
		}
		if(i==0){ tmpDateStr=tmpDate.format('YYYY')+' <br/>'+tmpDate.format('mm-dd'); }
		else{ tmpDateStr=tmpDate.format('mm-dd'); }
		tbl += '<tr><td> '+(i+1)+'</td><td>'+tmpDateStr
			+'</td><td>'+tmpData[1].toFixed(2)+'</td><td> '+(diff>0?'+':'')+
			+diff.toFixed(3)+'</td><td>'+plusMark+plusCount
			+' &nbsp;'+diffPercent+(i==0?'%':'')+'</td><td>'+firstDiffStr+(i==0?'%':'')+'</span></td></tr>';
		lastPrice = tmpData[1]; lastDiff = parseFloat(diffPercent);
	}
	tmpDate = new Date(initalVal[0]);
	tbl += '<tr><td>'+(last12+1)+'</td><td>'+tmpDate.format("YYYY")+' <br/>'
		+tmpDate.format("mm-dd")+'</td><td>'+initalVal[1].toFixed(3)
		+'</td><td>-</td><td>-</td><td>-</td></tr>';
	var stableNums = calculateStableRank(); var weekWins = calculateWinNum();
	var periodTag = '周'; if($dataTimeType == 'daily'){ periodTag = '日'; }
	var otherStats = '<p>年化收益率: '+calculateAnnualRank()
		+' '+parseFloat($fundPriceStat['annualrate']).toFixed(1)+'% &nbsp;&nbsp; <span class="nobreakblock">稳定增長率: '+stableNums['rankStar']+' '
		+stableNums['stableNum']+'%</span> &nbsp;&nbsp; <span class="nobreakblock">每'+periodTag+'贏胜率: '+weekWins['rankStar']+' '+weekWins['winNum']+'%</span><p>';
	otherStats += '<p>策略回测 <span id="strategyTestOption">';
	if($dataTimeType=='daily'){
		if($fundPriceStat['latestprice']>=$fundPriceStat['wma10dprice']){ otherStats += ' &nearr;wma10d'; }
		else{ otherStats += ' &searr;wma10d'; }
		if($fundPriceStat['latestprice']>=$fundPriceStat['wma30dprice']){ otherStats += ' &nearr;30d'; }
		else{ otherStats += ' &searr;30d'; }
		if($fundPriceStat['latestprice']>=$fundPriceStat['wma10wprice']){ otherStats += ' &nearr;10w'; }
		else{ otherStats += ' &searr;10w'; }
		if($fundPriceStat['latestprice']>=$fundPriceStat['wma30wprice']){ otherStats += ' &nearr;30w'; }
		else{ otherStats += ' &searr;30w'; }
	}
	else if($dataTimeType=='weekly'){
		if($fundPriceStat['latestprice']>=$fundPriceStat['wma10dprice']){ otherStats += ' &nearr;wma10d'; }
		else{ otherStats += ' &searr;wma10d'; }
		if($fundPriceStat['latestprice']>=$fundPriceStat['wma30dprice']){ otherStats += ' &nearr;30d'; }
		else{ otherStats += ' &searr;30d'; }
		if($fundPriceStat['latestprice']>=$fundPriceStat['wma10wprice']){ otherStats += ' &nearr;10w'; }
		else{ otherStats += ' &searr;10w'; }
		if($fundPriceStat['latestprice']>=$fundPriceStat['wma30wprice']){ otherStats += ' &nearr;30w'; }
		else{ otherStats += ' &searr;30w'; }
	}
	otherStats += '</span> &nbsp; <span id="overWmaCt"></span></p>';
	otherStats += '<p><span id="strategyTestbuyAny"></span></p>';
	otherStats += '<p><span id="strategyTestbuyUp"></span></p>';
	otherStats += '<p><span id="strategyTestbuyDown"></span></p>';
	_getElement('tableData').innerHTML = otherStats + tbl + '</table>';
}
//- 07:49 2023-04-13
function calculateAnnualRank(){
	if(typeof $fundPriceStat['annualrate'] == 'undefined'){
		$fundPriceStat['annualrate'] = 0.0;
	}
	var annualrate = parseFloat($fundPriceStat['annualrate']);
	var rankStars = '';
	if(annualrate <= 0.0){
		rankStars = '❌';
	}
	else if(annualrate >0.0 && annualrate < 5.0){
		rankStars = '⭐☆☆☆☆';
	}
	else if(annualrate >=5.0 && annualrate < 10.0){
		rankStars = '⭐⭐☆☆☆';
	}
	else if(annualrate >=10.0 && annualrate < 15.0){
		rankStars = '⭐⭐⭐☆☆';
	}
	else if(annualrate >=15.0 && annualrate < 20.0){
		rankStars = '⭐⭐⭐⭐☆';
	}
	else{
		rankStars = '⭐⭐⭐⭐⭐';
	}
	return rankStars;
}
//- 
function calculateStableRank(){
	var stableNum = 0.0; var rankStep = 1/6; var stepLog = '';
	var rate1m = parseFloat($fundPriceStat['monthrate']);
	if( rate1m > 0){
		stableNum += rankStep*0.5;
	}
	var rate3m = parseFloat($fundPriceStat['month3rate']);
	if(rate3m > 0 && rate3m > rate1m){
		stableNum += rankStep*0.7;
	}
	else if(rate3m < 0){
		stableNum += -(rankStep*0.7);
	}
	var rate6m = parseFloat($fundPriceStat['month6rate']);
	if(rate6m > 0 && rate6m > rate3m){
		stableNum += rankStep*0.9;
	}
	else if(rate6m < 0){
		stableNum += -(rankStep*0.9);
	}
	var rate1y = parseFloat($fundPriceStat['yearrate']);
	if(rate1y > 0 && rate1y > rate6m){
		stableNum += rankStep*1.1;
	}
	else if(rate1y < 0){
		stableNum += -(rankStep*1.1);
	}
	var rate2y = parseFloat($fundPriceStat['year2rate']);
	if(rate2y > 0 && rate2y > rate1y){
		stableNum += rankStep*1.3;
	}
	else if(rate2y < 0){
		stableNum += -(rankStep*1.3);
	}
	var rate3y = parseFloat($fundPriceStat['year3rate']);
	if(rate3y > 0 && rate3y > rate2y){
		stableNum += rankStep*1.5;
	}
	else if(rate3y < 0){
		stableNum += -(rankStep*1.5);
	}
	var rankStars = '';
	if(stableNum < rankStep){
		rankStars = '❌';
	}
	else if(stableNum >= rankStep && stableNum < rankStep*2){
		rankStars = '⭐☆☆☆☆';
	}
	else if(stableNum >= rankStep*2 && stableNum < rankStep*3){
		rankStars = '⭐⭐☆☆☆';
	}
	else if(stableNum >= rankStep*3 && stableNum < rankStep*4){
		rankStars = '⭐⭐⭐☆☆';
	}
	else if(stableNum >= rankStep*4 && stableNum < rankStep*5){
		rankStars = '⭐⭐⭐⭐☆';
	}
	else{
		rankStars = '⭐⭐⭐⭐⭐';
	}
	//console.log("stableNum:"+stableNum+" rankStars:"+rankStars+" stepLog:"+stepLog);
	return {'stableNum':(stableNum*100).toFixed(1), 'rankStar':rankStars};
}
//-weekly or daily win/lose count and percent, 09:12 2023-04-24
function calculateWinNum(){
	var wi = 1; var wStartP = 0.0; var winNum = 0;
	var loseNum = 0; var wSum = 1;
	var realDataLen = Data_ACWorthTrend.length; 
	//- filter out less than one year, 52 weeks
	if(realDataLen > 50){
		//- using latest 3yrs data
		var year3agoTime = (new Date()).getTime() - 3 * 365 * 86400 * 1000;  
		for(var ai in Data_ACWorthTrend){ 
			item = Data_ACWorthTrend[ai];
			if(item[0] > year3agoTime){
				if(item[1] > wStartP){
					winNum += 1;
				}
				else{
					loseNum += 1;
				}
				wSum += 1;
				wStartP = item[1];
			}
			wi += 1;
		}
	}
	var winPert = parseFloat((winNum/wSum)*100).toFixed(1);
	//- 0.36 ~ 0.66, see srv22/tools/ufqifina/fundstat
	if(wSum < 50){ winPert = 0.0; }
	var rankStars = '';
	if(winPert < 50){ rankStars = '❌'; }
	else if(winPert >= 50 && winPert < 51){ rankStars = '⭐☆☆☆☆'; }
	else if(winPert >= 51 && winPert < 53){ rankStars = '⭐⭐☆☆☆'; }
	else if(winPert >= 53 && winPert < 55){ rankStars = '⭐⭐⭐☆☆'; }
	else if(winPert >= 55 && winPert < 57){ rankStars = '⭐⭐⭐⭐☆'; }
	else if(winPert >= 57){ rankStars = '⭐⭐⭐⭐⭐'; }
	//console.log("calculateWinNum: winNum:"+winNum+" wSum:"+wSum+" percent:"+winPert);
	return {'winNum':winPert, 'rankStar':rankStars};
}
//-
function makeAppendPrice(){
	var appendpriceUrl = $url+'&mod=financefund&act=fundChart&dataTimeType='+$dataTimeType+'&icode='+$icode+'&predictType='+$predictType;
	appendpriceUrl += '&appendpricedate=' + _getElement('appendpricedate').value;
	appendpriceUrl += '&appendprice=' + _getElement('appendprice').value;
	window.location.href = appendpriceUrl;
}
//-
function makeSearch(){
	var searType = _getElement('searchtype');
	var searId = _getElement('searchobjectid');
	if(searId){
		var idVal = searId.value;
		if(parseInt(idVal) > 0){
			var myUrl = $url;
			var searTypeVal = searType.options[searType.selectedIndex].value;
			if(searTypeVal == "demand"){
				myUrl += '&mod=item&act=detail&itemType=0&id='+idVal;
			}
			else if(searTypeVal == "supply"){
				myUrl += '&mod=item&act=detail&itemType=1&id='+idVal;
			}
			else if(searTypeVal == "order"){
				myUrl += '&mod=order&act=detail&id='+idVal;
			}
			else if(searTypeVal == "user"){
				myUrl += '&mod=user&act=checkinfo&openid='+idVal;
			}
			//- temp
			myUrl = $url + '&mod=financefund&act=fundChart&icode='+idVal;
			window.location.href = myUrl;
		}
		else if(idVal.length() > 2){
			var myUrl = $url;
			var searTypeVal = searType.options[searType.selectedIndex].value;
			if(searTypeVal == "demand"){
				myUrl += '&mod=item&act=detail&itemType=0&id='+idVal;
			}
			else if(searTypeVal == "supply"){
				myUrl += '&mod=item&act=detail&itemType=1&id='+idVal;
			}
			else if(searTypeVal == "order"){
				myUrl += '&mod=order&act=detail&id='+idVal;
			}
			else if(searTypeVal == "user"){
				myUrl += '&mod=user&act=checkinfo&openid='+idVal;
			}
			//- temp
			myUrl = $url + '&mod=financefund&act=list&oppnskiname=contains&pnskiname='+idVal;
			window.location.href = myUrl;
		}
		else{
			//-
			console.log("Unsupported searTypeVal: idVal:["+idVal+"]");
		}
	}
	else{
		//-
	}
}