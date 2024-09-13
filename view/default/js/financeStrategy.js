//-
//- Finance Policy/Strategy, backtesting
//- xenxin@ufqi, 15:27 2024-01-12
//- temp pause for in-line scripts. 21:52 2024-02-12

//- finance strategies backtest, 2nd stage, 18:15 2024-01-12
//- xenxin@ufqi
function strategyCatX(dateType, thePriceData, btType, btEntry){
	//console.log("strategyCatX btType: "+btType+" btEntry:"+btEntry);
	//- loops on strategyCat with various days and buy-types
	var results = ""; var maxWinPt = -10000; //- lowest: win:-100, cagr:-100
	var maxDayCt = 0; var maxTestType = '';
	var dynamicSellThreshold = 6; //- at least for free of trans fee, one week, 7 days
	var unitBgn = 6; unitCtLimit = 15; //- 6˜15 trading days, 21 calendar days
	if(dateType == 'weekly'){ 
		unitBgn = 1;  unitCtLimit = 7; //- 7 weeks for trading, 49 calendar days
		dynamicSellThreshold = 1; //- at least for free of trans fee, one week
	}
	var isFixedSell = false;
	if(btType == '' || btType == 'fixed'){ isFixedSell = true; } //- sell type
	if(isFixedSell){
		for(var dayc=unitBgn; dayc<=unitCtLimit; dayc++){
			$backtestType = ''; //- buy type
			var tmpWinPt = strategyCat(dateType, thePriceData, dayc, btType, btEntry, $backtestType, 0);
			if(tmpWinPt > maxWinPt){
				maxWinPt = tmpWinPt; maxDayCt = dayc; maxTestType = $backtestType;
			}
			tmpWinPt = strategyCat(dateType, thePriceData, dayc, btType, btEntry, $backtestType, 1);
			if(tmpWinPt > maxWinPt){
				maxWinPt = tmpWinPt; maxDayCt = dayc; maxTestType = $backtestType;
			}
			$backtestType = 'buyUp';
			tmpWinPt = strategyCat(dateType, thePriceData, dayc, btType, btEntry, $backtestType, 0);
			if(tmpWinPt > maxWinPt){
				maxWinPt = tmpWinPt; maxDayCt = dayc; maxTestType = $backtestType;
			}
			tmpWinPt = strategyCat(dateType, thePriceData, dayc, btType, btEntry, $backtestType, 1);
			if(tmpWinPt > maxWinPt){
				maxWinPt = tmpWinPt; maxDayCt = dayc; maxTestType = $backtestType;
			}
			$backtestType = 'buyDown';
			tmpWinPt = strategyCat(dateType, thePriceData, dayc, btType, btEntry, $backtestType, 0);
			if(tmpWinPt > maxWinPt){
				maxWinPt = tmpWinPt; maxDayCt = dayc; maxTestType = $backtestType;
			}
			tmpWinPt = strategyCat(dateType, thePriceData, dayc, btType, btEntry, $backtestType, 1);
			if(tmpWinPt > maxWinPt){
				maxWinPt = tmpWinPt; maxDayCt = dayc; maxTestType = $backtestType;
			}
		}
	}
	else{
		$backtestType = '';
		var tmpWinPt = strategyCat(dateType, thePriceData, dynamicSellThreshold, btType, btEntry, $backtestType, 0);
		if(tmpWinPt > maxWinPt){
			maxWinPt = tmpWinPt; maxDayCt = dynamicSellThreshold; maxTestType = $backtestType;
		}
		tmpWinPt = strategyCat(dateType, thePriceData, dynamicSellThreshold, btType, btEntry, $backtestType, 1);
		if(tmpWinPt > maxWinPt){
			maxWinPt = tmpWinPt; maxDayCt = dynamicSellThreshold; maxTestType = $backtestType;
		}
		$backtestType = 'buyUp';
		tmpWinPt = strategyCat(dateType, thePriceData, dynamicSellThreshold, btType, btEntry, $backtestType, 0);
		if(tmpWinPt > maxWinPt){
			maxWinPt = tmpWinPt; maxDayCt = dynamicSellThreshold; maxTestType = $backtestType;
		}
		tmpWinPt = strategyCat(dateType, thePriceData, dynamicSellThreshold, btType, btEntry, $backtestType, 1);
		if(tmpWinPt > maxWinPt){
			maxWinPt = tmpWinPt; maxDayCt = dynamicSellThreshold; maxTestType = $backtestType;
		}
		$backtestType = 'buyDown';
		tmpWinPt = strategyCat(dateType, thePriceData, dynamicSellThreshold, btType, btEntry, $backtestType, 0);
		if(tmpWinPt > maxWinPt){
			maxWinPt = tmpWinPt; maxDayCt = dynamicSellThreshold; maxTestType = $backtestType;
		}
		tmpWinPt = strategyCat(dateType, thePriceData, dynamicSellThreshold, btType, btEntry, $backtestType, 1);
		if(tmpWinPt > maxWinPt){
			maxWinPt = tmpWinPt; maxDayCt = dynamicSellThreshold; maxTestType = $backtestType;
		}
	}
	var testType = maxTestType=='' ? 'buyAny' : maxTestType;
	var entryType = btEntry=='' ? '10' : btEntry;
	if(dateType == 'weekly'){ entryType+='w'; }else{ entryType+='d'; }
	var sellType = btType=='' ? 'fixed' : btType;
	return ({maxPt:maxWinPt, maxCt:maxDayCt, maxBuyType:testType, 
		maxBtEntry:entryType, maxSellType:sellType});
}
//-
var strategyCatAAA = function(dateType, thePriceData){
	var bgnOffset = 30;
	var dataCount = 1100 + bgnOffset; // days of x years + 30 days
	if(dateType=='weekly'){
		dataCount = 160 + bgnOffset; // weeks of x years + 30 weeks
	}
	var priceList = thePriceData.priceData;
	var wma10Price = thePriceData.wma10Data;
	var wma30Price = thePriceData.wma30Data;
	var priceCount = priceList.length;
	var bgni=0;
	if(priceCount > dataCount){ bgni = priceCount - dataCount; }
	var curPrice, curWma10, curWma30;
	for(var i=bgni; i<priceCount; i++){
		curPrice = priceList[i][3];
		curWma10 = wma10Price[i-9];
		curWma30 = wma30Price[i-29];
		console.log("js/FinancePolicy: 1619 strategyCat: bgni:"+bgni+" i:"+i+" curPrice:"+curPrice+" wma10:"+curWma10+" wma30:"+curWma30);
	}
};

//-added 12:02 2024-01-18
function calculateSlope(pointA, pointB){
	var slp = 0.0;
	if(pointA[1]==0.0 || pointB[1]==0.0){ slp = 0.0; }
	else{
		slp = (pointB[1] - pointA[1]) / (pointB[0] - pointA[0]);
	}
	slp = (Math.atan(slp)*180)/Math.PI; //- turn it into angle
	return slp;
}
//-
function calculateAnnualRate(myPrime, earnings, days){
	var rate = 0.0;
	myPrime = myPrime==0.0 ? 0.1 : myPrime;
	var periodRate = (earnings) / myPrime;
	rate = annualRateFromPeriod(periodRate, days);
	return rate;
}
//- annualRate from periodRate, 20:47 2024-05-09
function annualRateFromPeriod(periodRate, days){
	var irate = 0.0;
	if($dataTimeType == 'weekly'){
		days = (days) * 7; //- why days-1?
	}
	else{ 
		days = days + Math.floor(days/5)*2; 
	}
	if(periodRate < -1.0){
		irate = Math.pow((1 + (-periodRate)), (365/days)) - 1;
		irate = -irate;
	}
	else{
		irate = Math.pow((1 + periodRate), (365/days)) - 1;
	}
	//console.log("annualRateFromPeriod: days:"+days+" annualRate:"+irate+" periodRate:"+periodRate);
	return irate;
}
//- calculateTimeWeight, 17:16 2024-02-07, updt 18:14 2024-02-22
function calculateTimeWeight(unitCount, dateType){
	//- full-range is 3~4yr, 2yrs as middle, less than then decrease, more than increase
	//- yr2WorkingDays=522, -20% as begin of 418, +20% as end of 626, keep same range, yr2Weeks=104
	//- timeWeight: 0.05, as 50 0f 1000 as top
	var timeWeight=0.0, yr2WorkingDaysBgn=418, yr2WorkingDaysEnd=626, 
		yr2WeeksBgn=83, yr2WeeksEnd=125, weightUnit=0.15, weightUnitDown=-0.40;
	if(dateType=='weekly'){
		if(unitCount < yr2WeeksBgn){ timeWeight = weightUnitDown*(yr2WeeksBgn/unitCount); }
		else if(unitCount >= yr2WeeksEnd){ timeWeight = weightUnit*(unitCount/yr2WeeksEnd); }
	}
	else{
		if(unitCount < yr2WorkingDaysBgn){ timeWeight = weightUnitDown*(yr2WorkingDaysBgn/unitCount); }
		else if(unitCount >= yr2WorkingDaysEnd){ timeWeight = weightUnit*(unitCount/yr2WorkingDaysEnd); }
	}
	//console.log("calculateTimeWeight: unitCount:"+unitCount+" timeWeight:"+timeWeight);
	return timeWeight;
}
//- calculate trade count weight, 10:04 2024-04-12
//- 5%-, -0.06, 60 of 1000 as top; 5~10%, -0.03; 10~15%, 0.0; 15%+, 0.01
function calculateTradeWeight(unitCount, trdCount){
	var trdWeight=0.0;
	var trdPt = trdCount/unitCount;
	var offset=0.1, changeUnitUp=20, changeUnitDn=25;
	var change = (trdPt - offset) / offset;
	if(change > 0){
		trdWeight = change / changeUnitUp;
	}
	else{
		trdWeight = change * changeUnitDn;
	}
	trdWeight = trdWeight / 100;
	/*
	var trdPtFix0Pos=0.05, trdPtFix1Pos=0.08, trdPtFix2Pos=0.12, trdPtFix3Pos=0.15;
	var trdPtFix0Val=-0.12, trdPtFix1Val=-0.06, trdPtFix2Val=-0.02, trdPtFix3Val=0.02;
	if(trdPt < trdPtFix0Pos){
		trdWeight = trdPtFix0Val;
	}
	else if(trdPt>=trdPtFix0Pos && trdPt<trdPtFix1Pos){
		trdWeight = trdPtFix1Val;
	}
	else if(trdPt>=trdPtFix1Pos && trdPt<trdPtFix2Pos){
		trdWeight = trdPtFix2Val;
	}
	//-- 0.1~0.15, keep original
	else if(trdPt >= trdPtFix3Pos){
		trdWeight = trdPtFix3Val;
	}
	*/
	//console.log("calculateTradeWeight: trdPt:"+trdPt+" weight:"+trdWeight);
	return trdWeight;
}
//- compute score part B, with 20% in total, 08:37 2024-04-24
//- 10% for real annualRate:-50~50, 5% for stable percent:0~100, 5% for week win percent:(0~100)-50 -> -50~50
//- see strategyCat myScore
function computeScorePartB(realAnnualRate, stableNumList, weekWinList){
	var partB = 0.0;
	var realRateWeight=0.1, stableWeight=0.05, weekWinWeight=0.05; //- partB sum: 20% 
	var rateEnlarge=20, stableEnlarge=10, winEnlarge=20; //-top full 1000 for every single
	var realRatePart = realAnnualRate * rateEnlarge * realRateWeight;
	var stableNumPart = stableNumList['stableNum'] * stableEnlarge * stableWeight;
	var weekWinPart = (weekWinList['winNum']-50.0) * winEnlarge * weekWinWeight;
	partB = realRatePart + stableNumPart + weekWinPart;
	//console.log("js/financeStategy: realAnnualRate:"+realAnnualRate+" part:"+realRatePart+" stableNum:"+stableNumList['stableNum']+" part:"+stableNumPart+" weekWin:"+weekWinList['winNum']+" weekWinPart:"+weekWinPart+" partB-all:"+partB);
	return partB;
}
//- compute Bolls Band Weight, 14:58 2024-04-29
function computeBollWeight(bollData, curPrice, rsi10Data){
	var bollWgt=0.0, curBollData=[], dataSize=0;
	dataSize=bollData.length; curBollData=bollData[dataSize-3]; // rm predicts
	var bollTop=curBollData[0], bollMiddle=curBollData[1], bollBottom=curBollData[2];
	var bollGoodCeil = (bollTop - bollMiddle) * 0.2; //- offset, near top
	bollTop = bollTop - bollGoodCeil;
	finalPriceData.curBollTop = bollTop;
	if(curPrice >= bollTop){
		bollWgt = -0.08; //- even stronger, alert
	}
	else if(curPrice>=bollMiddle && curPrice<bollTop){
		bollWgt = 0.04; //- strong area, normal
	}
	else{
		bollWgt = 0.02; //- weak area, expected, maybe start of another cycle, 09:57 2024-09-11
	}
	//console.log('computeBollWeight: curPrice:'+curPrice+' curBollData:'+JSON.stringify(curBollData)+' weight:'+bollWgt);
	var rsiwgt = computeRsiWeight(rsi10Data, curPrice);
	//-
	bollData = null; rsi10Data = null;
	return (bollWgt + rsiwgt);
}
//- compute RSI (Relative Strength Index) weight, 09:37 2024-04-30
function computeRsiWeight(rsi10Data, curPrice){
	var rsiwgt = 0.0, curRsi=0.0, dataSize=0;
	dataSize = rsi10Data.length; curRsi = rsi10Data[dataSize-3]; //- rm predicts
	rsiTop = 66.5; // 70 * 0.95
	if(curRsi < 30){ rsiwgt = 0.6; }
	else if(curRsi>=30 && curRsi<=rsiTop){ rsiwgt = 0.0; }
	else{ rsiwgt = -0.07; }
	//console.log("computeRsiWeight: curRsi:"+curRsi+" weight:"+rsiwgt);
	rsi10Data = null;
	return rsiwgt;
}
//- RS: Relative Strength, vs. market overall main index, much differ with RSI: Relative Strength Index
//- 09:22 2024-05-16
function computeRSWeight(priceList, dayCount, mktRsVal){
	var rsWgt = 0.0;
	if(dayCount==null || dayCount==0){ dayCount=10; }
	var priceCt = priceList.length - 2;
	var lastp=priceList[priceCt-1][3], firstp=priceList[priceCt-dayCount][3];
	var myRs = ((lastp-firstp)/firstp) * 100;
	var realRs = ((myRs-mktRsVal)/mktRsVal) * 100;
	if(myRs>mktRsVal && realRs<0.0){ realRs = -realRs; }
	else if(myRs<mktRsVal && realRs>0.0){ realRs = -realRs; }
	finalPriceData.rsValue = realRs;
	//- set weight to different realRs
	if(realRs > 0.0){ rsWgt = 1.3 * Math.log2(realRs); }
	else if(realRs == 0.0){ rsWgt = 0.0; }
	else{ rsWgt = -2.0 * Math.log2(-realRs); }
	rsWgt = rsWgt / 100;
	/*
	if(realRs>=300){ rsWgt = 0.1; } //- double index performance
	else if(realRs>=100 && realRs<300){ rsWgt = 0.05; }
	else if(realRs>0.0 && realRs<100){ rsWgt = 0.02; }
	else if(realRs>=-100 && realRs<0.0){ rsWgt = -0.02; }
	else if(realRs>=-300 && realRs<-100){ rsWgt = -0.05; }
	else if(realRs<-300){ rsWgt = -0.1; } //- half index
	*/
	//console.log("computeRSWeight: firstp:"+firstp+" / lastp:"+lastp+" myRs:"+myRs+" mktRsVal:"+mktRsVal+" realRs:"+realRs+" rsWgt:"+rsWgt);
	priceList = null;
	return rsWgt;
}

//- compute wma for an array, 11:46 2024-06-11
var computeWma = function(itemArray){
	var wma=0.0, arrWidth=itemArray.length;
	var d0=0.0, di=0, dw=0.0;
	var	weightSum = (arrWidth * (arrWidth+1)) / 2;
	for(var dd in itemArray){
		dw = (di + 1) / weightSum; //-  latest one with most weighted
		d0 = itemArray[dd] * dw; wma += d0; di++;
		//console.log(" computeWma-2: dd:"+dd+"/"+itemArray[dd]+" dw:"+dw+" d0:"+d0+" wma:"+wma);
	}
	return wma;
};
//- compute volume weight, using private volume data, 12:17 2024-06-11
var computeVolumeWeight = function(volumeData){
	var vwgt=0.0, vsize=volumeData.length, curVol=0.0, wmaVol=0.0, wd=0.0;
	var bgnOffset=3, endOffset=13; //- rm predicts
	var upScale=3.5, downScale=-2.5;
	if(vsize > 10){
		var myArr=[], ldp=vsize-endOffset;
		for(var vd=vsize-bgnOffset; vd>ldp; vd--){
			if(volumeData[vd]==null){ volumeData[vd]=[1, 1]; }
			myArr.push(volumeData[vd][1]);
		}
		curVol = volumeData[vsize-1][1];
		wmaVol = computeWma(myArr);
		curVol = curVol==0.0 ? 0.01 : curVol;
		wmaVol = wmaVol==0.0 ? curVol : wmaVol;
		wd = ((curVol - wmaVol) / wmaVol) * 100;
		
		if(wd > 0.0){ vwgt = upScale * Math.log2(wd); }
		else if(wd == 0.0){ vwgt = 0.0; }
		else{ vwgt = downScale * Math.log2(-wd); }
		vwgt = vwgt / 100;
	}
	//console.log(" computeVolumeWeight: curVol:"+curVol+" wmaVol:"+wmaVol+" wd:"+wd+" vwgt:"+vwgt+" myArr:"+myArr);
	return vwgt;
};

//- round a number to another with x decimals, 15:34 2024-07-04
var round2Precision = function(number, precision){
	return (Math.round(number+"e"+precision) / Math.pow(10, precision));
};