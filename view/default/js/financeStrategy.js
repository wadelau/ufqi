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
		unitBgn = 1;  unitCtLimit = 6; //- 6 weeks for trading, 42 calendar days
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
	var dataCount = 1100 + bgnOffset; // days of three years + 30 days
	if(dateType=='weekly'){
		dataCount = 160 + bgnOffset; // weeks of three years + 30 weeks
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
	var periodRate = (earnings) / myPrime;
	if($dataTimeType == 'weekly'){ days = (days-1) * 7; }
	else{ days = days + Math.floor(days/5)*2; }
	if(periodRate < -1.0){
		rate = Math.pow((1 + (-periodRate)), (365/days)) - 1;
		rate = -rate;
	}
	else{
		rate = Math.pow((1 + periodRate), (365/days)) - 1;
	}
	//console.log("calculateAnnualRate: prime:"+myPrime+" earnings:"+earnings+" days:"+days+" annualRate:"+rate+" periodRate:"+periodRate);
	return rate;
}
//- calculateTimeWeight, 17:16 2024-02-07, updt 18:14 2024-02-22
function calculateTimeWeight(unitCount, dateType){
	//- full-range is 3yr, 2yrs as middle, less than then decrease, more than increase
	//- yr2WorkingDays=522, -20% as begin of 418, +20% as end of 626, keep same range, yr2Weeks=104
	//- timeWeight: 0.03, as 30 0f 1000 as top
	var timeWeight=0.0, yr2WorkingDaysBgn=418, yr2WorkingDaysEnd=626, 
		yr2WeeksBgn=83, yr2WeeksEnd=125, weightUnit=0.03, weightUnitDown=-0.06;
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
	var trdPt = trdCount/unitCount; var trdPtFix1Pos=0.05, trdPtFix2Pos=0.10, trdPtFix3Pos=0.15;
	var trdPtFix1Val=-0.08, trdPtFix2Val=-0.04, trdPtFix3Val=0.01;
	if(trdPt < trdPtFix1Pos){
		trdWeight = trdPtFix1Val;
	}
	else if(trdPt>=trdPtFix1Pos && trdPt<trdPtFix2Pos){
		trdWeight = trdPtFix2Val;
	}
	else if(trdPt >= trdPtFix3Pos){
		trdWeight = trdPtFix3Val;
	}
	//console.log("calculateTradeWeight: trdPt:"+trdPt+" weight:"+trdWeight);
	return trdWeight;
}