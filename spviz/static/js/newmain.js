function drawGraph(data) {

	// Bivariate color scheme selection
	selectValue = d3.select("#selectors").select('select').property('value');
	selectTypeValue = d3.select("#typeSelector").select('select').property('value');

	// Draw Slider
	DrawSlider();

	// Draw Legend
	d3.select("#legend").selectAll('svg').remove();
	DrawLegend();

	// Initial legend click value
	legendValue = -1;

	if (selectTypeValue == "Regression") {

		// Correlation for all
		correlationMatrix = jsonto2darray(JSON.parse(data.corrAll));
		csvData = JSON.parse(data.csv_data);

		catAttrs = data.categoricalVars;
		conAttrs = data.continousVars;

		// Correlation for subgroup
		correlationMatrixSubgroup = [];
		// Parse from JSON to JS array
		var corrSubs = data.corrSubs;
		for (var i = 0; i < corrSubs.length; i++){
			correlationMatrixSubgroup.push(jsonto2darray(JSON.parse(corrSubs[i])))
		}

		categoryValuesList = data.groupby_info;

		labels = data.continousVars;
		
		updateContainer();

		// Scatter plot
		createScatterplot(csvData, labels);

	} else if (selectTypeValue == "Rate") {
		csvData = JSON.parse(data.csv_data);
		rateTrendMatrixAll = data.ratioRateAll;

		// Construct Slope Graph array for ALL--------->
		var rateAll = data.rateAll;
		for (var i = 0; i < rateAll.length; i++){
			values = Object.values(JSON.parse(rateAll[i]))
			rateAllSlopeGraph.push(values);

			keys = Object.keys(JSON.parse(rateAll[i]));
			rateAllKeySlopeGraph.push(keys);
		}
		// <-------------------------------------

		// Construct Slope Graph array for Subgroups--------->
		var rateSubs = data.rateSubs;
		for (var i = 0; i < rateSubs.length; i++){
			values = Object.values(JSON.parse(rateSubs[i]))
			rateSubSlopeGraph.push(values);

			keys = Object.keys(JSON.parse(rateSubs[i]));

			rateSubKeySlopeGraph.push(keys)
		}
		// <-------------------------------------

		protectedAttrs = data.protectedVars;
		explanaryAttrs = data.explanaryVars;
		targetAttr = data.targetAttr;
		
		var ratioSubs = data.ratioSubs;


		for (var i = 0; i < ratioSubs.length; i++){
			rateTrendMatrixSub.push(jsonto2darray(JSON.parse(ratioSubs[i])))
		}

		rateRowVars = [];
		rateRowLabels = [];
		for (var i = 0; i < ratioSubs.length; i++){
			rateRowVars[i] = [];
			rateRowLabels[i] = [];
			keys = Object.keys(JSON.parse(ratioSubs[i]));
			for (var j = 0; j < keys.length; j++) {
				rateRowVars[i][j] = [];
				var afterSplit = keys[j].split("/");
				rateRowVars[i][j][0] = afterSplit[0];
				rateRowVars[i][j][1] = afterSplit[1];

				rateRowLabels[i][j] = keys[j];
			}
		}
		
		rateColLabels = [];
		for (var i = 0; i < ratioSubs.length; i++){
			rateColLabels[i] = [];

			items = JSON.parse(ratioSubs[i]);
			keys = Object.keys(items);

			first_key = keys[0]
			for(var key in items[first_key]){
				rateColLabels[i].push(key)	
			}
		}

		updateRateSPContainer();
	}
}

function jsonto2darray(items) {
	var result = [];

	for(var i in items){
		result.push([])

		for(var j in items[i]){
			result[result.length-1].push(items[i][j])	
		}
	}
	return result;
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}