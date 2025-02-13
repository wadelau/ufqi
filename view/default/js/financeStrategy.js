//-
//- Finance Policy/Strategy, backtesting
//- xenxin@ufqi, 15:27 2024-01-12
//- temp pause for in-line scripts. 21:52 2024-02-12
//- updt main func strategyCatX for stoping linkDrop=0, 15:53 2024-11-20

//- Backtest real algorithms, 3rd stage, 09:52 2024-03-13 
function strategyCat(dateType, thePriceData, holdingDays, btType, btEntry, buyType, linkDrop){
	var holdingUnits = 6; //- buy, holdingUnits, then sell, some trading days, 7
	var dynamicSellThreshold = 6; //- free of trans fee, one week, 7
	var bgnOffset = 30; var sharpChange = -0.05; var yearAgo = 5; //- years back track to
	var dataCount = 365*yearAgo - (52*2*yearAgo) + bgnOffset; // days of years, take out weekends, + 30 days
	var maxLossThreshold=-10.0, minAverageEarnp=1.1, minTradeCount=8, isWeek=false;
	if(holdingDays > 0){ holdingUnits = holdingDays; }
	if(dateType=='weekly'){
		isWeek=true; dataCount = 52*yearAgo + bgnOffset; // weeks of x years + 30 weeks
		minAverageEarnp=1.6; dynamicSellThreshold = 1; //- one week
	}
	if($fundInfo['itype'] == 6){ minAverageEarnp=0.3; } //- bonds
	var priceList = thePriceData.priceData;	var wma10Price = thePriceData.wma10Data; var wma30Price = thePriceData.wma30Data; 
	var predictCt=($isQdii ? 1 : 2); //- assume first predict as real when isQdii for its delay two-days in price, 14:41 2024-10-18
	var priceCount = priceList.length - predictCt; //- rm last two predicts
	var unitCount = priceCount; var bgni = 10; //- min wma as wma10, need ten units. 
	if(priceCount > dataCount){ bgni = priceCount - dataCount; unitCount = dataCount; }
	var curPrice, curWma10, curWma30, minPriceGap=finalPriceData.minPriceGap;
	var testTradeList = [];  var myTrade = {}; var trd; var firstp = -1;
	var tri = 0; var lastp = 1.0; var last2p=0,last3p=0,last4p=0; var isValid = true;
	var buyUp = false; var buyDown = false; var isHolding = false; var last2perct = 0;
	var continuousAboveCt = 0; //- continuous above a line, units count
	var wma10Slope,wma30Slope = 0.0; //- in angel in frontend, slope=0.25=>angel=15, 0.1:5, 0.5:30, 0.8:45, 14:58 2024-10-17
	var lastwma10,lastwma30 = 0.0; var needLatestUnit=false;
	if(buyType == 'buyUp'){ buyUp = true; }
	else if(buyType == 'buyDown'){ buyDown = true; }
	var isFixedSell = false, isBuyArea = false;;
	if(btType == '' || btType == 'fixed'){ isFixedSell = true; } //- selltype
	var needWma30 = false; if(btEntry == 30){ needWma30 = true; }
	var needLinkDrop = false; var bgnDn = 0; var cycleSold=false;
	var maxBgnCt = finalPriceData.buyEnd; //- 3w or 3d
	var maxBuyStop = finalPriceData.buyEnd; maxBuyStop=buyDown?(maxBuyStop+1):maxBuyStop; //- entend to more days for buyDown
	var overWma10Ct=0, overWma30Ct=0; //- after gold-cross, gldc
	var twoSharpDecline=false, threeLinkDrop=false, lastPriceCt=priceCount-1;
	if(linkDrop==1){ needLinkDrop=true; } //- see updt in strategyCatX, 15:51 2024-11-20
	//- main 2-layer loop
	for(bgnDn=1; bgnDn<maxBgnCt; bgnDn++){
		//- loop on each bgnDay=1,...3?
		continuousAboveCt=0; isHolding=false; cycleSold=false; overWma10Ct=0; overWma30Ct=0;
	for(var i=bgni; i<priceCount; i++){
		twoSharpDecline=false; threeLinkDrop=false;
		curPrice = priceList[i][3];	curPrice=curPrice==null?lastp:curPrice;
		if(i < 9){ curWma10 = 100; }else{ curWma10 = wma10Price[i-9]; }
		if(i < 29){ curWma30 = 100; }else{ curWma30 = wma30Price[i-29]; }
		wma10Slope = calculateSlope([0.1, lastwma10], [0.2, curWma10]); wma30Slope = calculateSlope([0.1, lastwma30], [0.2, curWma30]);
		isValid = true; isBuyArea = false;
		//- try to buy-in
		if(needWma30){ if(overWma30Ct>=bgnDn && overWma30Ct<maxBuyStop){ isBuyArea=true; } }
		else{ if(overWma10Ct>=bgnDn && overWma10Ct<maxBuyStop){ isBuyArea=true; } }
		if(isBuyArea && !cycleSold && !isHolding 
			&& (curPrice>=curWma10 || wma10Slope>0.0)){
			if(needWma30 && curWma10<curWma30){ isValid = false; } //- gold cross?
			if(isValid && buyUp){
				if(curPrice < lastp){ isValid = false; }
			}
			else if(isValid && buyDown){
				if(curPrice > lastp){ isValid = false; }
			}
			if(isValid && needLinkDrop){ 
				if(wma10Slope < 0.0){ isValid = false; }
				else if(curPrice<lastp && lastp<last2p){
					if(last2p < last3p){
						isValid = false; threeLinkDrop=true; //- three linked-downwards.
					}
					else{
						last2perct = (curPrice - last2p) / last2p;
						if(last2perct < sharpChange){
							isValid = false; twoSharpDecline=true; //- sharp two-declines over 5%.
						}
					}
				}
				if(!twoSharpDecline && curPrice<lastp && curPrice<last4p){
					isValid = false; twoSharpDecline=true; //- one sharp-decline below last three-ups, last4p as last3p'open 
				}
			}
			if(isValid){
				myTrade = {bgni:i, buyin:curPrice, endi:0, sellout:0, earning:0, 
					earningp:0, holding:0, bgnDay:bgnDn, byType:buyType,
					entryMa:btEntry};
				testTradeList[tri++] = myTrade; isHolding = true;
			}
		}
		if(isDebug && curPrice==debugPrice){
			if(myTrade.buyin==curPrice){ console.log(myTrade); }
			else{ 
				console.log("i:"+i+" curPrice:"+curPrice+" isValid:"+isValid+" isBuyArea:"+isBuyArea+" overWma10Ct:"+overWma10Ct+" overWma30Ct:"+overWma30Ct+" bgnDay:"+bgnDn+" enTryMa:"+btEntry+" buyType:"+buyType+" cycleSold:"+cycleSold+" isHolding:"+isHolding+" wma10Slope:"+wma10Slope+" not-buy.");
				if(isHolding){ console.log(myTrade); }
			}
		}
		//- test sell-out
		if(isHolding){
			var needSell = false; var unitPass = 0;
			for(var j in testTradeList){
				trd = testTradeList[j];
				if(trd.endi == 0){
					unitPass = i - trd.bgni;
					if(isFixedSell && (unitPass==holdingUnits || i==lastPriceCt)){
						needSell = true; //- consider sharp declines?
					}
					else if(!isFixedSell 
						&& (unitPass>=dynamicSellThreshold || i==lastPriceCt)){
						if(wma10Slope<0.0 || (curPrice<curWma10 && lastp<last2p)){
							if(!needWma30){ needSell=true; twoSharpDecline=true; }
							else if(needWma30 && curPrice<curWma30){ //- sharp decline?
								needSell=true; twoSharpDecline=true;
							}
						}					
						if(!needSell && needLinkDrop){
							if(wma10Slope < 0.0){ needSell = true; }						
							else if(curPrice<lastp && lastp<last2p){
								if(last2p < last3p){
									needSell = true; threeLinkDrop=true; //- three linked-downwards.
								}
								else{
									last2perct = (curPrice - last2p) / last2p;
									if(last2perct < sharpChange){
										needSell = true; twoSharpDecline=true; //- sharp two-declines over 5%.
									}
								}
							}
							if(!twoSharpDecline && curPrice<lastp && curPrice<last4p){
								needSell = true; twoSharpDecline=true; //- one sharp-decline below last three-ups 
							}
						}
						if(!needSell && i==lastPriceCt){ needSell=true; } //- latest price
					}
					if(needSell){
						trd.endi = i; trd.sellout = curPrice;
						if(trd.endi > trd.bgni){ trd.earning = curPrice - trd.buyin; }
						else if(trd.endi==trd.bgni){ trd.earning = 0.0; needLatestUnit=true; }
						else{ trd.earning = wma10Slope>0.0 ? 0.001 : -0.001; }
						trd.earningp = (trd.earning/trd.buyin)*100;
						trd.holding = unitPass; isHolding = false; 
						needSell = false; cycleSold=true;
						break;
					}
				}
			}
		}
		// last day or price
		if(i==lastPriceCt && !twoSharpDecline && !threeLinkDrop){
			if(wma10Slope<0.0 || (curPrice<curWma10 && lastp<last2p)){
				if(!needWma30){ twoSharpDecline=true; }
				else if(needWma30 && curPrice<curWma30){ //- sharp decline?
					twoSharpDecline=true;
				}
			}
			else if(curPrice<lastp && lastp<last2p){
				if(last2p < last3p){
					threeLinkDrop=true; //- three linked-downwards.
				}
				else{
					last2perct = (curPrice - last2p) / last2p;
					if(last2perct < sharpChange){
						twoSharpDecline=true; //- sharp two-declines over 5%.
					}
				}
			}
			if(!twoSharpDecline && curPrice<lastp && curPrice<last4p){
				needSell = true; twoSharpDecline=true; //- one sharp-decline below last three-ups 
			}
		}
		//- addup times for continuousAboveCt
		if(curPrice >= curWma10){ 
			continuousAboveCt++; overWma10Ct++; if(curWma10>=curWma30){ overWma30Ct++; }
		}
		else if(curPrice >= curWma30){ 
			continuousAboveCt=0; 
			if(wma10Slope>0.0){ overWma10Ct++; }
			else{ overWma10Ct=0; if(!needWma30){ cycleSold=false; } }
			if(((curWma10-curWma30)/curWma30)>minPriceGap){ overWma30Ct++; }
		}
		else if(curPrice < curWma30){
			continuousAboveCt=0; 
			if(wma10Slope>0.0){ overWma10Ct++; }else{ overWma10Ct=0; cycleSold=false; }
			if(((curWma10-curWma30)/curWma30)>minPriceGap){ overWma30Ct++; }else{ overWma30Ct=0; }
		}
		else{ console.log("What the hell is? Error! i:"+i+" curPrice:"+curPrice); }
		last4p=last3p; last3p=last2p; last2p=lastp; lastp=curPrice; lastwma10=curWma10; lastwma30=curWma30;
	}
		//- end of loop on bgnDay=0,...7?
	}
	//console.log(priceList);  console.log(testTradeList);
	finalPriceData.latestWma10Slope=wma10Slope; finalPriceData.latestOverWma10Ct=overWma10Ct; 
	finalPriceData.latestOverWma30Ct=overWma30Ct; finalPriceData.transCount=unitCount;
	finalPriceData.latestPriceChange=(lastp-last2p); finalPriceData.latestPrice=curPrice;
	finalPriceData.latestPriceWma30=curWma30; finalPriceData.twoSharpDecline=twoSharpDecline;
	finalPriceData.threeLinkDrop=threeLinkDrop; finalPriceData.latestWma30Slope=wma30Slope; 
	var tradePair=[], uniqueTestList=[], bgni=0, endi=0, hasPair=false, pairi=0, pairj=0; 
	var trdWin=0, maxEarn=0.0, minEarn=0.0, avgEarn=0.0, sumEarn=0;
	var maxEarnp=0.0, minEarnp=0.0, avgEarnp=0.0, sumEarnp=0, sumPass=0, avgPass=0;
	var sumEarnpp=0.0, sumEarnpm=0.0, avgEarnpp=0.0, avgEarnpm=0.0, trdLoss=0;
	for(var j in testTradeList){
		trd=testTradeList[j]; bgni=trd.bgni; endi=trd.endi; hasPair=false;
		for(var k in tradePair){
			if(bgni==tradePair[k][0] && endi==tradePair[k][1]){	hasPair=true; break; }
		}
		if(!hasPair){ tradePair[pairi++]=[bgni, endi]; uniqueTestList[pairj++]=trd; }
	}
	testTradeList=uniqueTestList; var trdCount = testTradeList.length; trdCount = trdCount==0?2:trdCount; 
	if(needLatestUnit){ trdCount -= 1; } // rm latest unit with bgni=endi and earning=0.0
	var tradeEarnList = [];
	for(var j in testTradeList){
		trd = testTradeList[j]; tradeEarnList.push(trd.earningp);
		if(trd.earningp > 0.0){ trdWin++; sumEarnpp+=trd.earningp; }else{ sumEarnpm+=trd.earningp; }
		if(j==0){ minEarn=maxEarn=trd.earning; minEarnp=maxEarnp=trd.earningp; }
		else if(trd.earningp > maxEarnp){ maxEarn=trd.earning; maxEarnp=trd.earningp; }
		else if(trd.earningp < minEarnp){ minEarn=trd.earning; minEarnp=trd.earningp; }
		sumEarn += trd.earning; sumEarnp += trd.earningp; sumPass += trd.holding;
	}
	avgEarn = sumEarn/trdCount; avgEarnp = sumEarnp/trdCount; avgPass = sumPass/trdCount;
	avgEarnpp = (sumEarnpp/trdWin)/100; trdLoss = trdCount-trdWin; trdLoss = (trdLoss==0?1:trdLoss);
	avgEarnpm = (sumEarnpm/trdLoss)/100; avgEarnpm = (avgEarnpm==0.0?-0.01:avgEarnpm);
	firstp = priceList[bgni][3]; if(firstp==null || firstp==-1){ firstp = 1.0; }
	var annualRate = calculateAnnualRate(firstp, sumEarn, (unitCount-bgnOffset));
	annualRate = (annualRate*100).toFixed(1);
	var trdStdDev = calculateStandardDeviation(tradeEarnList);
	var debtAnnualRate = $debtIndexPriceStat['annualrate']; //- same period of 3~4 yrs?
	var sharpr = (annualRate - debtAnnualRate) / trdStdDev;
	sharpr = sharpr>3.0 ? (3.0+Math.log10(sharpr-2.0)) : sharpr; //- aoid too higher cagr to higher sharpr
	var testType = buyType=='' ? 'buyAny' : buyType;
	var winPt = (trdWin/trdCount)*100; var trdPt=Math.round((trdCount/unitCount)*100);
	if(winPt == 100.0){  //- avoid two 100s
		winPt = 99.0; if(!isFixedSell){ winPt -= 1.0; } if(trdPt<5){ winPt-= 2.0; } 
	}
	if(testType!='buyAny'){ winPt -= 1.0; } if(needLinkDrop){ winPt -= 1.0; }
	var winPTag=finalPriceData.winPercentTag, avgEarnTag=finalPriceData.avgEarnTag, winPtOrig=winPt/100, shprTag=finalPriceData.shprTag;
	var results = " Tactic: "+testType
		+" &nbsp;"+winPTag+" "+winPt.toFixed(0)
		+" &nbsp;cagr% "+annualRate
		+" "+avgEarnTag+" "+avgEarnp.toFixed(1)
		+" avg+ "+(avgEarnpp*100).toFixed(1)
		+" avg- "+(avgEarnpm*100).toFixed(1)
		//+" priCt "+unitCount 
		//+" trdCt:"+trdCount +" trdWin:"+trdWin
		//+" trd% "+trdPt
		+" "+shprTag+" "+sharpr.toFixed(1);
	
	var avgEarnAnualized = 0.0;
	if(isFixedSell){
		var calDateCt=holdingUnits; if(!isWeek){ calDateCt=calDateCt+Math.floor(calDateCt/5)*2; }
		results +=  " &nbsp;hold "+calDateCt; 
		avgEarnAnualized = annualRateFromPeriod(avgEarnp/100, holdingUnits);
	}
	else{
		var calDateCt=avgPass; if(!isWeek){ calDateCt=calDateCt+Math.floor(calDateCt/5)*2; }
		results +=  " &nbsp;holds "+parseInt(calDateCt);
		avgEarnAnualized = annualRateFromPeriod(avgEarnp/100, avgPass);
	}
	/*
	var linkDropVal=linkDrop, linkDropTag=finalPriceData.linkDropTag;
	if(twoSharpDecline || threeLinkDrop){ linkDropVal += 's'; }
	results += ' '+linkDropTag+' '+linkDropVal;
	*/
	results += (isWeek ? 'w' : 'd');
	var postionPt = winPtOrig - (1-winPtOrig)/(avgEarnpp/Math.abs(avgEarnpm));
	//- (winPtOrig/100)/Math.abs(avgEarnpm) - (1-winPtOrig/100)/avgEarnpp;
	results += ' klp '+postionPt.toFixed(1); //- kelly position percent
	//- adjust weight for misbehaviors
	if(minEarnp<maxLossThreshold || Math.abs(minEarnp)>maxEarnp){
		winPt=winPt/9; if(annualRate>0.0){ annualRate=annualRate/9; }
	}
	else if(trdCount<minTradeCount || avgEarnp<minAverageEarnp || avgEarnpp<Math.abs(avgEarnpm)){
		//- avgEarnpp<Math.abs(avgEarnpm) : little ups and big drops! similar to RSI, 09:01 2025-02-12
		winPt=winPt/3; if(annualRate>0.0){ annualRate=annualRate/3; }
	}
	else if(annualRate>0){ annualRate += 10; }
	//- winPt: 0~99, 100 points, annualRate:-50~50, 100 points, sharpr: -3.0~3.0, 6 points
	//var winWeight=0.75, rateWeight=0.25, enlarge=10, rateEnlarge=20; // top-full 1000
	var winWeight=0.53, sharpRWgt=0.17, rateWeight=0.10, enlarge=10, sharpREnlarge=330, rateEnlarge=20; 
	// partA sum:80%, other 0.2 in computeScorePartB, 08:36 2024-04-24
	//var annualRateMin=-50, annualRateMax=80;
	//var normalRate = ((annualRate-annualRateMin)/(annualRateMax-annualRateMin))*100;
	var myScore = (winPt*enlarge)*winWeight + (annualRate*rateEnlarge)*rateWeight + (sharpr*sharpREnlarge)*sharpRWgt; 
	var trdPtWeight = calculateTradeWeight(unitCount, trdCount); var earningWeight = 0.0;
	if(minEarnp<0.0 && (minEarnp/maxEarnp)<-0.5){ earningWeight += -0.02; } //- deduce 2%
	if(avgEarnAnualized < 0.35){ earningWeight += -0.02; }
	else if(avgEarnAnualized > 0.65){ earningWeight += 0.02; }
	myScore = myScore * (1 + trdPtWeight + earningWeight);
	myScore = parseFloat(myScore.toFixed(2));
	if(isDebug && myScore>debugScore){
		console.log(testTradeList); console.log("myScore:"+myScore+" winPt:"+winPt.toFixed(2)+" trdPtWgt:"+trdPtWeight+" earnWgt:"+earningWeight
			+" avg+:"+(avgEarnpp*100).toFixed(2)+" avg-:"+(avgEarnpm*100).toFixed(2)
			+" debtRt:"+debtAnnualRate+" stdDev:"+trdStdDev.toFixed(2)+" > sharpr:"+sharpr.toFixed(2));
		//console.log("\tkelly positionPt:"+postionPt.toFixed(2)+" p:"+winPtOrig.toFixed(2)+" a:"+avgEarnpm.toFixed(2)+" q:"+(1-winPtOrig).toFixed(2)+" b:"+avgEarnpp.toFixed(2));
	}
	finalPriceData.candidateTactic['ct_'+testType+myScore+holdingUnits+btType] = results;
	finalPriceData.candidateWinPt['ct_'+testType+myScore+holdingUnits+btType] = winPtOrig;
	priceList=null; wma10Price=null; wma30Price=null; thePriceData=null;
	uniqueTestList=null; tradePair=null;
	return myScore;
};
//- finance strategies backtest, 2nd stage, 18:15 2024-01-12
//- xenxin@ufqi
function strategyCatX(dateType, thePriceData, btType, btEntry){
	//console.log("strategyCatX btType: "+btType+" btEntry:"+btEntry);
	//- loops on strategyCat with various days and buy-types
	var results = ""; var maxWinPt = -10000; //- lowest: win:-100, cagr:-100
	var maxDayCt = 0; var maxTestType = '';
	var dynamicSellThreshold = 6; //- at least for free of trans fee, one week, 7 days
	var unitBgn = 6; unitCtLimit = 20; //- 6˜20 trading days, 28 calendar days, 4 weeks
	if(dateType == 'weekly'){ 
		unitBgn = 1;  unitCtLimit = 7; //- 7 weeks for trading, 49 calendar days, 7 weeks
		dynamicSellThreshold = 1; //- at least for free of trans fee, one week
	}
	var isFixedSell = false; var tmpWinPt = 0.0;
	if(btType == '' || btType == 'fixed'){ isFixedSell = true; } //- sell type
	if(isFixedSell){
		for(var dayc=unitBgn; dayc<=unitCtLimit; dayc++){
			$backtestType = ''; //- buy type
			//- strictly execute stop-loss of alerts in postion page,
			//- so do not compute the score of linkDrop=0, 15:50 2024-11-20
			/*
			var tmpWinPt = strategyCat(dateType, thePriceData, dayc, btType, btEntry, $backtestType, 0);
			if(tmpWinPt > maxWinPt){
				maxWinPt = tmpWinPt; maxDayCt = dayc; maxTestType = $backtestType;
			}
			*/
			tmpWinPt = strategyCat(dateType, thePriceData, dayc, btType, btEntry, $backtestType, 1);
			if(tmpWinPt > maxWinPt){
				maxWinPt = tmpWinPt; maxDayCt = dayc; maxTestType = $backtestType;
			}
			$backtestType = 'buyUp';
			/*
			tmpWinPt = strategyCat(dateType, thePriceData, dayc, btType, btEntry, $backtestType, 0);
			if(tmpWinPt > maxWinPt){
				maxWinPt = tmpWinPt; maxDayCt = dayc; maxTestType = $backtestType;
			}
			*/
			tmpWinPt = strategyCat(dateType, thePriceData, dayc, btType, btEntry, $backtestType, 1);
			if(tmpWinPt > maxWinPt){
				maxWinPt = tmpWinPt; maxDayCt = dayc; maxTestType = $backtestType;
			}
			$backtestType = 'buyDown';
			/*
			tmpWinPt = strategyCat(dateType, thePriceData, dayc, btType, btEntry, $backtestType, 0);
			if(tmpWinPt > maxWinPt){
				maxWinPt = tmpWinPt; maxDayCt = dayc; maxTestType = $backtestType;
			}
			*/
			tmpWinPt = strategyCat(dateType, thePriceData, dayc, btType, btEntry, $backtestType, 1);
			if(tmpWinPt > maxWinPt){
				maxWinPt = tmpWinPt; maxDayCt = dayc; maxTestType = $backtestType;
			}
		}
	}
	else{
		$backtestType = ''; var dynSellDayc = dynamicSellThreshold;
		/*
		var tmpWinPt = strategyCat(dateType, thePriceData, dynSellDayc, btType, btEntry, $backtestType, 0);
		if(tmpWinPt > maxWinPt){
			maxWinPt = tmpWinPt; maxDayCt = dynamicSellThreshold; maxTestType = $backtestType;
		}
		*/
		tmpWinPt = strategyCat(dateType, thePriceData, dynSellDayc, btType, btEntry, $backtestType, 1);
		if(tmpWinPt > maxWinPt){
			maxWinPt = tmpWinPt; maxDayCt = dynamicSellThreshold; maxTestType = $backtestType;
		}
		$backtestType = 'buyUp';
		/*
		tmpWinPt = strategyCat(dateType, thePriceData, dynSellDayc, btType, btEntry, $backtestType, 0);
		if(tmpWinPt > maxWinPt){
			maxWinPt = tmpWinPt; maxDayCt = dynamicSellThreshold; maxTestType = $backtestType;
		}
		*/
		tmpWinPt = strategyCat(dateType, thePriceData, dynSellDayc, btType, btEntry, $backtestType, 1);
		if(tmpWinPt > maxWinPt){
			maxWinPt = tmpWinPt; maxDayCt = dynamicSellThreshold; maxTestType = $backtestType;
		}
		$backtestType = 'buyDown';
		/*
		tmpWinPt = strategyCat(dateType, thePriceData, dynSellDayc, btType, btEntry, $backtestType, 0);
		if(tmpWinPt > maxWinPt){
			maxWinPt = tmpWinPt; maxDayCt = dynamicSellThreshold; maxTestType = $backtestType;
		}
		*/
		tmpWinPt = strategyCat(dateType, thePriceData, dynSellDayc, btType, btEntry, $backtestType, 1);
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
//- slope=0.25=>angel=15, 0.1:5, 0.5:30, 0.8:45, 14:58 2024-10-17
//- in angel in frontend, but in slope degree in backend
function calculateSlope(pointA, pointB){
	var slp = 0.0;
	if(pointA[1]==0.0 || pointB[1]==0.0){ slp = 0.0; }
	else{
		slp = (pointB[1] - pointA[1]) / (pointB[0] - pointA[0]);
	}
	slp = (Math.atan(slp)*180)/Math.PI; //- turn it into angle
	return parseFloat(slp.toFixed(2));
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
	//- periodRate should be 0.0~1.0 or negative
	if(periodRate < -0.0){
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
		yr2WeeksBgn=83, yr2WeeksEnd=125, weightUnit=0.08, weightUnitDown=-0.18;
	if(dateType=='weekly'){
		if(unitCount < yr2WeeksBgn){ timeWeight = weightUnitDown*(yr2WeeksBgn/unitCount); }
		else if(unitCount >= yr2WeeksEnd){ timeWeight = weightUnit*(unitCount/yr2WeeksEnd); }
	}
	else{
		if(unitCount < yr2WorkingDaysBgn){ timeWeight = weightUnitDown*(yr2WorkingDaysBgn/unitCount); }
		else if(unitCount >= yr2WorkingDaysEnd){ timeWeight = weightUnit*(unitCount/yr2WorkingDaysEnd); }
	}
	//console.log("calculateTimeWeight: unitCount:"+unitCount+" timeWeight:"+timeWeight);
	return parseFloat(timeWeight.toFixed(2));
}
//- calculate trade count weight, 10:04 2024-04-12
//- 5%-, -0.06, 60 of 1000 as top; 5~10%, -0.03; 10~15%, 0.0; 15%+, 0.01
function calculateTradeWeight(unitCount, trdCount){
	var trdWeight=0.0;
	var trdPt = trdCount/unitCount;
	var offset=0.07, changeUnitUp=8, changeUnitDn=12; //- 0.07 as 7% for moderate
	var change = (trdPt - offset) / offset;
	if(change > 0.0){
		trdWeight = change / changeUnitUp;
	}
	else{
		trdWeight = change * changeUnitDn;
	}
	trdWeight = parseFloat((trdWeight / 100).toFixed(2));
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
	if(typeof realAnnualRate == 'undefined'){ realAnnualRate=0.0; }
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
		bollWgt = -0.05; //- even stronger, alert
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
	return parseFloat((bollWgt + rsiwgt).toFixed(2));
}
//- compute RSI (Relative Strength Index) weight, 09:37 2024-04-30
function computeRsiWeight(rsi10Data, curPrice){
	var rsiwgt = 0.0, curRsi=0.0, dataSize=0;
	dataSize = rsi10Data.length; curRsi = rsi10Data[dataSize-3]; //- rm predicts
	rsiTop = 66.5; // 70 * 0.95
	if(curRsi < 30){ rsiwgt = 0.06; }
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
	if(typeof lastp == 'undefined'){ lastp = 0.0; }
	if(typeof firstp == 'undefined'){ firstp = 0.1; }
	var myRs = ((lastp-firstp)/firstp) * 100;
	mktRsVal = mktRsVal==0.0 ? 0.1 : mktRsVal;
	var realRs = ((myRs-mktRsVal)/mktRsVal) * 100;
	if(myRs>mktRsVal && realRs<0.0){ realRs = -realRs; }
	else if(myRs<mktRsVal && realRs>0.0){ realRs = -realRs; }
	finalPriceData.rsValue = realRs;
	var upScale = 3.5, downScale = -3.0;
	//- set weight to different realRs
	if(realRs > 0.0){ 
		if(realRs < 1.0){
			rsWgt = upScale * (-Math.log10(realRs)); //- log2(0.x) yields negative value
		}
		else{
			rsWgt = upScale	* Math.log10(realRs);
		}
	}
	else if(realRs == 0.0){ rsWgt = 0.0; }
	else{ 
		if(realRs > -1.0){
			rsWgt = downScale * (-Math.log10(-realRs));  //- log2(0.x) yields negative value
		}
		else{
			rsWgt = downScale * Math.log10(-realRs);
		} 
	}
	rsWgt = parseFloat((rsWgt / 100).toFixed(2));
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
	var vwgt=0.0, vsize=volumeData.length, curVol=0.0, wmaVol=0.0, wd=0.0, minVol=0.01;
	var bgnOffset=3, endOffset=13; //- rm predicts
	var upScale=4.0, downScale=-3.0; //- 3.5 -> 5.5, 09:42 2024-11-29
	if(vsize > 10){
		var myArr=[], ldp=vsize-endOffset;
		for(var vd=vsize-bgnOffset; vd>ldp; vd--){
			if(volumeData[vd]==null){ volumeData[vd]=[1, 1]; }
			myArr.push(volumeData[vd][1]);
		}
		curVol = volumeData[vsize-bgnOffset][1]; //- consider QDII?
		wmaVol = computeWma(myArr);
		curVol = curVol==0.0 ? minVol : curVol;
		wmaVol = wmaVol==0.0 ? minVol : wmaVol;
		wd = ((curVol - wmaVol) / wmaVol) * 100;
		if(wd > 0.0){ 
			if(wd < 1.0){
				vwgt = upScale * (-Math.log2(wd)); //- log2(0.x) yields negative value 
			}
			else{
				vwgt = upScale * Math.log2(wd);
			}			
		}
		else if(wd == 0.0){ vwgt = minVol; }
		else{
			if(wd > -1.0){
				vwgt = downScale * (-Math.log2(-wd)); //- log2(0.x) yields negative value
			}
			else{
				vwgt = downScale * Math.log2(-wd);
			}
		}
		vwgt = parseFloat((vwgt / 100).toFixed(2));
	}
	//console.log(" computeVolumeWeight: curVol:"+curVol+" wmaVol:"+wmaVol+" wd:"+wd+" vwgt:"+vwgt+" myArr:"+myArr);
	return vwgt;
};
//- compute turnover rate weight, 14:51 2024-12-03
var computeTurnOverRateWeight = function(myPriceData){
	var tovwgt=0.0, upScale=4.0, downScale=-3.0;
	var dataSize=Object.keys(myPriceData).length, curPrice={}, tov=0.0;
	var stepC=1.0, stepA=2.0, stepB=8.0;
	//console.log("dataSize:"+dataSize+" curPrice:"+(myPriceData[dataSize-1]));
	curPrice = myPriceData[dataSize-1]; if(typeof curPrice == 'undefined'){ curPrice = {}; };
	tov = curPrice['turnover']; if(typeof tov == 'undefined'){ tov = 0.0; }
	if(tov < 0.0){ tov = 0.0; } // assume tov not negative
	if(tov < stepA){
		if(tov == 0.0){ tovwgt = tov; }
		else if(tov > 0.0 && tov < stepC){ 
			tovwgt = downScale * (-Math.log2(tov)); //- log2(0.x) yields negative value 
		}
		else{ 
			//- let it be.
		}
	}
	else if(tov >= stepA && tov < stepB){
		tovwgt = upScale * Math.log2(tov);
	}
	else{
		tovwgt = downScale * Math.log2(tov);
	}
	tovwgt = parseFloat((tovwgt / 100).toFixed(2));
	//console.log(" computeTurnOverRateWeight: tov:"+tov+" tovwgt:"+tovwgt);
	return tovwgt;
};
//- compute pcc, Pearson Correlation Coefficient, 15:14 2024-12-13
var computePearsonCC = function(myPriceStat, indexPriceStat){
	var cc = 0.0;
	if(myPriceStat['icode'] != indexPriceStat['icode']){
		var xarr=[], yarr=[];
		var annualrx = parseFloat(myPriceStat['annualrate']);
		var annualry = parseFloat(indexPriceStat['annualrate']);
		xarr.push(parseFloat(myPriceStat['slopedegreewma10d']), parseFloat(myPriceStat['weekrate']), parseFloat(myPriceStat['monthrate']), parseFloat(myPriceStat['month3rate']), parseFloat(myPriceStat['month6rate']));
		xarr.push(annualrx, parseFloat(myPriceStat['yearrate']));
		yarr.push(parseFloat(indexPriceStat['slopedegreewma10d']), parseFloat(indexPriceStat['weekrate']), parseFloat(indexPriceStat['monthrate']), parseFloat(indexPriceStat['month3rate']), parseFloat(indexPriceStat['month6rate']));
		yarr.push(annualry, parseFloat(indexPriceStat['yearrate']));
		var yr2r = parseFloat(myPriceStat['year2rate']);
		if(yr2r != 0.0){
			//- in case of no year2rate.
			xarr.push(yr2r); yarr.push(parseFloat(indexPriceStat['year2rate']));
		}
		var yr3r = parseFloat(myPriceStat['year3rate']);
		if(yr3r != 0.0){
			xarr.push(yr3r); yarr.push(parseFloat(indexPriceStat['year3rate']));
		}
		var n = xarr.length;
		var meanx = xarr.reduce((a, b) => a + b) / n; var meany = yarr.reduce((a, b) => a + b) / n;
		var deviationx = xarr.map(xi => xi - meanx); var deviationy = yarr.map(yi => yi - meany);
		var productionDeviation = deviationx.map((dx, i) => dx * deviationy[i]);
		var sumProductionDeviation = productionDeviation.reduce((a, b) => a + b);
		var sumSquaresx = deviationx.map(dx => dx * dx).reduce((a, b) => a + b);
		var sumSquaresy = deviationy.map(dy => dy * dy).reduce((a, b) => a + b);
		cc = sumProductionDeviation / Math.sqrt(sumSquaresx * sumSquaresy);
		cc = isNaN(cc) ? 0.0 : cc; cc = parseFloat(cc.toFixed(2));
	}
	//- convert original cc to ccWgt as percent change to overall score
	var stepDn=0.5, stepUp=-0.5, ccWgt=0.0, xscale=1.0, winindex=0, upscale=1.8, dnscale=0.7;
	if(annualry > 0.0 && annualrx < 0.0){ winindex = -1; } //- loss index
	else if(annualry < 0.0 && annualrx > 0.0){ winindex = 1; } //- win index
	if(cc >= stepDn){ 
		ccWgt = -cc; //- -0.5 ~ -0.99
		if(winindex > 0){ xscale = dnscale; }else if(winindex < 0){ xscale = upscale; }
	}
	else if(cc>=stepUp && cc<stepDn){
		//- weak, or standalone
		ccWgt = 0.5 - cc; //- 0.01 ~ 0.99
		if(winindex > 0){ xscale = upscale; }else if(winindex < 0){ xscale = dnscale; }
	}
	else{ 
		//- -0.5 ~ -1.0 , reversely
		ccWgt = -cc / 2; //- result to 0.25 ~ 0.5 , 10:52 2024-12-25
		if(winindex > 0){ xscale = dnscale; }else if(winindex < 0){ xscale = upscale; }
	}
	ccWgt = (ccWgt * xscale) / 10.0; //- to percent value, e.g. 0.5 -> 0.05 , 5%, range in -9.9% ~ +9.9%
	ccWgt = parseFloat(ccWgt.toFixed(2));
	//console.log("  computePearsonCC: cc:"+ccWgt+"/ccOrig:"+cc+" myPriceStat:"+JSON.stringify(xarr)+" indexPriceStat:"+JSON.stringify(yarr)+" indexCode:"+indexPriceStat['icode']+" icode:"+myPriceStat['icode']+" xscale:"+xscale);
	finalPriceData.pearsonCC = cc;
	return ccWgt;
};

//- compute month3Stage, 18:30 2025-01-04
var computeMonth3Stage = function(priceStat){
	var m3m6Bala=0.0, m3m6Wgt=0.0;
	var m3val=parseFloat(priceStat['month3rate']); var m6val=parseFloat(priceStat['month6rate']);
	var m1val=parseFloat(priceStat['monthrate']);
	if(typeof priceStat['month3rate'] == 'undefined'){ m3val=0.0; m6val=0.0; }
	var m6rateNormal=10.0, balanceMax=10.0, m3rateMin=-5.0, m1rateMin=-3.0; //- why these thresholds? 15:01 2025-01-21
	m3m6Bala = m6val - Math.abs(m3val);
	if(m6val > m6rateNormal && m3val > m3rateMin 
		&& m1val > m1rateMin && m3m6Bala > balanceMax){
		finalPriceData.m3m6BalanceDue = true;
	}
	if(m3m6Bala > balanceMax){
		m3m6Wgt = - ((Math.log10(m3m6Bala+1.0) - 1.0) / 10);
		m3m6Wgt = parseFloat(m3m6Wgt.toFixed(2));
	}
	else{
		m3m6Wgt = Math.log10(Math.abs(balanceMax-m3m6Bala)+1.0) / 20;
		m3m6Wgt = parseFloat(m3m6Wgt.toFixed(2));
	}
	//console.log("computeMonth3Stage: princeStat:"+JSON.stringify(priceStat)+" m3m6Bala:"+m3m6Bala+" m3m6Wgt:"+m3m6Wgt+" m3m6BalanceDue:"+finalPriceData.m3m6BalanceDue);
	return m3m6Wgt;
};

//- 08:09 2025-01-12
var calculateStandardDeviation = function(arr) {
	var stdDev=0.0; //- distances to the mean/average value, 0 means all elements identical, larger means much diff between elements.
	arrLen = arr.length;
	if(arrLen == 0){ return stdDev; }
	// Step 1: Calculate the mean (average)
	const mean = arr.reduce((sum, value) => sum + value, 0) / arrLen;
	// Step 2: Calculate the squared differences
	const squaredDiffs = arr.map(value => {
		const diff = value - mean;
		return diff * diff;
	});
	// Step 3: Find the average of the squared differences
	const avgSquaredDiff = squaredDiffs.reduce((sum, value) => sum + value, 0) / arrLen;
	// Step 4: Take the square root of the average squared difference
	stdDev = Math.sqrt(avgSquaredDiff);
	//console.log("\t calculateStandardDeviation: arrLen:"+arrLen+" stdDev:"+stdDev);
	return stdDev;
};

//- check pearsonCC of positions and icode, 10:07 2025-01-18
var sameMarketPosition = function(tradeInfoList, fundInfo){
	var isSameMkt = false;
	var tmpInfo = {}; var myCode=fundInfo['icode']; var myMkt = fundInfo['linkmarket'];
	for(var tmpc in tradeInfoList){
		tmpInfo = tradeInfoList[tmpc];
		if(tmpInfo['icode'] != myCode && tmpInfo['linkmarket'] == myMkt){
			isSameMkt = true; break;
		}
	}
	//console.log("\t sameMarketPosition: isSameMkt:"+isSameMkt+"  tradeInfoList:"+JSON.stringify(tradeInfoList)+" fundInfo:"+JSON.stringify(fundInfo));
	//- pearsonCC:"+finalPriceData.pearsonCC+"
	return isSameMkt;
};
//- round a number to another with x decimals, 15:34 2024-07-04
var round2Precision = function(number, precision){
	return (Math.round(number+"e"+precision) / Math.pow(10, precision));
};