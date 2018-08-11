function rankingListbox(rankingArray) {

	var label_array = rankingArray.map(obj =>{ 
		var rObj = obj.label;
		return rObj;
	});

	var menu = d3.selectAll("#ranking");

	menu.selectAll("option")
		.data(label_array)
		.enter()
		.append("option")
		.attr("value", function(d) { return d; })
		.text(function(d) { return d; }); 

	var select_values = [];
	var selections = [];
	menu.on("change",function(event) {
		selections = d3.select(this)
						.selectAll("option")
						.filter(function (d, i) { 
							return this.selected;
						});
		//console.log(selections);	
		select_values = [];

		for (var i = 0; i < selections[0].length; i++) {
			var optionText = selections[0][i].value;
			select_values.push(optionText);
		}

		console.log(select_values);		
		
		if (selectTypeValue == "Regression") {
			updateContainerForRanking(select_values);
		} else {
			updateRateSPContainerForRanking(select_values);
		}				
	});	
}

function getAverageWeight(matrix) {

	var rowLength = matrix.length;
	var colLength = matrix[0].length;
	var totalWeight = 0;
	var num = 0;
	var averageWeight;

	for (var i = 0; i < rowLength; i++){
		for (var j = 0; j < colLength; j++){
			if (selectValue == 'Sequential 3x3'||selectValue == 'Diverging 3x3'){
				if (matrix[i][j] == 2 || matrix[i][j] == 6) {
					totalWeight += 1;
				} else if(matrix[i][j] == 0 || matrix[i][j]==8) {
					totalWeight += 0;
				} else {
					totalWeight += 0.3;
				}
			} else if(selectValue == 'Diverging 5x5') {	
				if (matrix[i][j] == 4 || matrix[i][j] == 20) {
					totalWeight += 1;
				} else if(matrix[i][j] == 3 || matrix[i][j]==8 || matrix[i][j]==9
							|| matrix[i][j] == 15 || matrix[i][j]==16 || matrix[i][j]==21) {
					totalWeight += 0.3;
				} else if(matrix[i][j] == 2 || matrix[i][j]==7 || matrix[i][j]==12
						|| matrix[i][j] == 13 || matrix[i][j]==14 
						|| matrix[i][j]==10 || matrix[i][j]==11
						|| matrix[i][j]==17 || matrix[i][j]==22) {
					totalWeight += 0.1;					
				} else {
					totalWeight += 0;
				}
			}
			
			num++;
		}
	}

	averageWeight = totalWeight / num;

	return averageWeight;
}

function updateRateSPContainerForRanking(selections) {

	d3.select("#container").selectAll('svg').remove();

	arraySlopeGraph = [];
	rateMatrixIndex = 0;

	for (var i = 0; i < groupingAttrs.length; i++){
		for (var j = 0; j < groupingAttrs.length; j++){
			//for (var i = 0; i < 1; i++){
			//	for (var j = 0; j < 2; j++){			
			if (groupingAttrs[i] != groupingAttrs[j]) {
				arraySlopeGraph[rateMatrixIndex] = [];
				// rate SP matrix for all
				var rateMatrix = getRateMatrixAll(csvData, groupingAttrs[i], groupingAttrs[j]);
				var rateTrendMatrixAll = getRateTrendMatrixAll(rateMatrix);
				// rate SP matrix for subgroups
				var rateMatrixGroups = getRateMatrixSub(csvData, groupingAttrs[i], groupingAttrs[j]);
				var rateTrendMatrixSub = getRateTrendMatrixSub(rateMatrixGroups);

				var bivariateMatrix = rateBivariateMatrix(rateTrendMatrixAll, rateTrendMatrixSub);

				var subgroupLabel = groupingAttrs[i] + ' - ' + groupingAttrs[j];
				for (var k=0; k<selections.length; k++){
					if (subgroupLabel == selections[k]) {
						rateSPMatrix({
							container : '#container',
							data      : UpdateRateMatrixFormat(bivariateMatrix, rateColKeys, rateRowVars, groupingAttrs[j], rateMatrixIndex, groupingAttrs[i]),
							rowLabels : rateRowLabels,
							colLabels : rateColLabels,
							subLabel  : subgroupLabel
						});

						rateMatrixIndex =  rateMatrixIndex + 1;
					}					
				}
			}
		}
	}
	// Cell Click Event
	d3.select(container).selectAll(".cell")
		.on("click", clickRateMatrixCell);	

	// Double click event: Reset
	d3.select(container).selectAll(".cell")
		.on("dblclick", doubleClickRateMatrixCell);	
}


function updateContainerForRanking(selections) {
	if (correlationMatrixSubgroup.length == 0) {
		return;
	}

	d3.select("#container").selectAll('svg').remove();

	for (var i = 0; i < correlationMatrixSubgroup.length; i++){
		var bivariateMatrix = BivariateMatrix(correlationMatrix, correlationMatrixSubgroup[i]);
		var subgroupLabel = categoryValuesList[i].groupby +": "+ categoryValuesList[i].value;

		for (var k=0; k<selections.length; k++){
			if (subgroupLabel == selections[k]) {
				Matrix({
					container : '#container',
					data      : UpdateMatrixFormat(bivariateMatrix, labels, categoryValuesList[i]),
					labels    : labels,
					subLabel  : subgroupLabel
				});
			}
		}
	}

	d3.select("#tree").selectAll('svg').remove();
	DrawTree(
		{
			data         : csvData,
			matrixAll    : correlationMatrix,
			matrixGroups : correlationMatrixSubgroup,
			catAttrs     : catAttrs,
			cateAttrInfo : categoryValuesList,
			labels       : labels
		}
	);

	// Cell Click Event
	d3.select(container).selectAll(".cell")
	.on("click", clickMatrixCell);	
}