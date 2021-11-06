function drawGraph(dataAll) {

	// Remove old svg
	d3.select("#container").selectAll('svg').remove();
	d3.select("#scatterplot").selectAll('svg').remove();  

	// Bivariate color scheme selection
	selectValue = d3.select("#selectors").select('select').property('value');
	selectTypeValue = '';

	csvData = JSON.parse(dataAll[1].replace(/\bNaN\b/g, "null"))    

	for (var key in dataAll){
		if (key > 1) {
			data = dataAll[key];

			// LegendTypeSelector display
			if (selectTypeValue != '' && selectTypeValue != data.trend_type) {
				legendTypeSelector.style.display = "inline-block";
			}

			selectTypeValue = data.trend_type;
		}

		if (selectTypeValue == "pearson_corr") {
			// no need to redraw
			rankTrendLegendFlg = false;
			// Correlation for all
			correlationMatrix = jsonto2darray(JSON.parse(data.corrAll));
			//csvData = JSON.parse(data.csv_data.replace(/\bNaN\b/g, "null"));

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

		} else if (selectTypeValue == "rank_trend") {
			// initial
			rateTrendMatrixSub = [];
			rateAllSlopeGraph = [];
			rateAllKeySlopeGraph = [];
			rateSubSlopeGraph = [];
			rateSubKeySlopeGraph = [];
			var slopeKey = key;
			//csvData = JSON.parse(data.csv_data.replace(/\bNaN\b/g, "null"));

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
			weightingAttr = data.weighting_var;
			target_var_type = data.target_var_type;

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
			updateRateSPContainer(slopeKey);
		}
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

function drawGraphTable(data, action) {
	// Get data from controller return data
	drawGraph(data);

	// Display info table
	tableRecords = JSON.parse(data[0])    

	tabulate(tableRecords, action);

	// Avoid ctrl-click                                    
	$('option').mousedown(function(e) {
		e.preventDefault();
		var originalScrollTop = $(this).parent().scrollTop();
		$(this).prop('selected', $(this).prop('selected') ? false : true);
		var self = this;
		$(this).parent().focus();
		setTimeout(function() {
			$(self).parent().scrollTop(originalScrollTop);
		}, 0);
		
		return false;
	});                             
}

/**
 * Draw distance matrix heatmap
 *
 * @param data - distance heatmap matrices.
 * @param action - action.
 * @returns none.
 */
function drawDistanceMatrixHeatmap(data, action) {
	
	csvData = JSON.parse(data.df.replace(/\bNaN\b/g, "null"));

	updateDistanceHeatmapContainer(data.distance_heatmap_dict);

	// Diplay overview legend
	DrawHeatmapLegend(data.overview_legend_types)

	// Display info table
	tableRecords = JSON.parse(data.result_df)    
	tabulate(tableRecords, action);
}

/**
 * Unselect the menu selections
 *
 * @param id - id for menu selection.
 * @returns none.
 */
function clearSelected(id){
    var elements = document.getElementById(id).options;

    for(var i = 0; i < elements.length; i++){
      elements[i].selected = false;
    }
  }

/**
 * Calculate linear regression line
 *
 * @param data - data for drawing dots.
 * @param x - the variable for x axis.
 * @param y - the variable for y axis.
 * @param minX - minimal value for X.
 * @param maxX - maximal value for X.
 * @param minY - minimal value for Y.
 * @param maxY - maximal value for Y.
 * @returns {object} an object of two points,
 *                   each point is an object with an x and y coordinate.
 */
 function calcLinear(data, x, y, minX, maxX, minY, maxY){
	/////////
	//SLOPE//
	/////////

	// Let n = the number of data points
	var n = data.length;

	// Get just the points
	var pts = [];
	data.forEach(function(d,i){
	  var obj = {};
	  obj.x = d[x];
	  obj.y = d[y];
	  obj.mult = obj.x*obj.y;
	  pts.push(obj);
	});

	// Let a equal n times the summation of all x-values multiplied by their corresponding y-values
	// Let b equal the sum of all x-values times the sum of all y-values
	// Let c equal n times the sum of all squared x-values
	// Let d equal the squared sum of all x-values
	var sum = 0;
	var xSum = 0;
	var ySum = 0;
	var sumSq = 0;
	pts.forEach(function(pt){
	  sum = sum + pt.mult;
	  xSum = xSum + pt.x;
	  ySum = ySum + pt.y;
	  sumSq = sumSq + (pt.x * pt.x);
	});
	var a = sum * n;
	var b = xSum * ySum;
	var c = sumSq * n;
	var d = xSum * xSum;

	// Plug the values that you calculated for a, b, c, and d into the following equation to calculate the slope
	// slope = m = (a - b) / (c - d)
	var m = (a - b) / (c - d);

	/////////////
	//INTERCEPT//
	/////////////

	// Let e equal the sum of all y-values
	var e = ySum;

	// Let f equal the slope times the sum of all x-values
	var f = m * xSum;

	// Plug the values you have calculated for e and f into the following equation for the y-intercept
	// y-intercept = b = (e - f) / n
	var b = (e - f) / n;


	// check the point is inside the scatterplot
	var tempMinY = m * minX + b;
	var tempMaxY = m * maxX + b;

	// check if regression line is beyond the min value Y
	if (tempMinY < minY) {
		// set minimum X value based on minimun Y value
		minX = (minY - b) / m;
	} else {
		// set minimun Y based on the linear calculation
		minY = tempMinY;
	}

	// check if regression line is beyond the max value Y
	if (tempMaxY > maxY) {
		// set maximum X value based on maximun Y value
		maxX = (maxY - b) / m;
	} else {
		// set maximun Y based on the linear calculation
		maxY = tempMaxY;
	}

	// return an object of two points
	// each point is an object with an x and y coordinate
	return {
	  ptA : {
		x: minX,
		y: minY
	  },
	  ptB : {
		x: maxX,
		y: maxY
	  }
	}
}
