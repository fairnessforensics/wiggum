function getRateMatrixAll(data, groupAttr1, groupAttr2) {

	var result = [];
	var tempLabels = [];

	var resultArray = d3.nest()
				.key(function(d) {return d[groupAttr1]})
				.rollup(function(v) {
					return {
						mean: d3.mean(v, function(d){return d[targetAttr]})
					};
				})
				.entries(data);

	// Construct Slope Graph array --------->
	arraySlopeGraph[rateMatrixIndex] = [];
	var singleObj = {};
	for (var i = 0; i < resultArray.length; i++){
		singleObj[resultArray[i].key] = precisionRound(resultArray[i].values.mean, 3);
	}
	singleObj[groupAttr2] = 'ALL';
	arraySlopeGraph[rateMatrixIndex].push(singleObj);
	// <-------------------------------------

	for(var key in resultArray) {
			var value = resultArray[key];
			tempLabels.push(value.key);
	}

	rateRowLabels = [];
	rateRowVars = [];
	var index = 0;
	for (var i = 0; i < tempLabels.length; i++){
		for (var j=i+1; j< tempLabels.length; j++) {
				rateRowLabels[index] = tempLabels[i] +" / "+ tempLabels[j];
				rateRowVars[index] = [];
				rateRowVars[index][0] = tempLabels[i];
				rateRowVars[index][1] = tempLabels[j];
				index = index + 1;
		}
	}

	for (var i = 0; i < resultArray.length; i++){
		result[i] = resultArray[i].values.mean;
	}	

	return result;
}

function getRateTrendMatrixAll(data) {

  var result = [];
	var index = 0;
	for (var i = 0; i < data.length; i++){
		for (var j=i+1; j< data.length; j++) {
				result[index] = data[i] / data[j];
				index = index + 1;
		}
	}	
	return result;
}

function getRateTrendMatrixSub(data) {

  var result = [];
	var index;
	for (var i = 0; i < data[0].length; i++){
		index = 0;
		for (var j=0; j< data.length; j++) {
			for (var k=j+1; k<data.length; k++) {
//				if (j!=k){
					// initial when first column
					if (i == 0) {
						result[index] = [];
					}
					result[index][i] = data[j][i] / data[k][i];
					index = index + 1;
//				}
			}
		}
	}	
	return result;
}

function getRateMatrixSub(data, groupAttr1, groupAttr2) {

	var result = [];
	  
	  var resultArray = d3.nest()
				  .key(function(d) {return d[groupAttr1]})
				  .key(function(d) {return d[groupAttr2]})
				  .rollup(function(v) {
					  return {
						  mean: d3.mean(v, function(d){return d[targetAttr]})
					  };
				  })
		  .entries(data);
  
		  // Get all values in explanatory grouping variable
		  var explanatoryGroupValues = d3.nest()
			  .key(function(d) {return d[groupAttr2];})
			  .entries(data);
  
		  var expalanatoryValues = [];
		  explanatoryGroupValues.forEach(function(value) {
			  expalanatoryValues.push(value.key);
		  })
  
	  // Construct an object array for slope graph
	  for (var i = 0; i < expalanatoryValues.length; i++){
		  var singleObj = {};

		for (var j = 0; j < resultArray.length; j++){
			if (i==0) {
				result[j] = [];	
			}

			var foundFlg = false;
			for (var k = 0; k < resultArray[j].values.length; k++){
				if (expalanatoryValues[i] == resultArray[j].values[k].key) {
					// resultArray[j].values[k] may have undefined, check it later
					singleObj[resultArray[j].key] = precisionRound(resultArray[j].values[k].values.mean, 3);
					result[j][i] = resultArray[j].values[k].values.mean;
					foundFlg = true;
					break;
				}
			}
			if (foundFlg == false){
				singleObj[resultArray[j].key] = 0;
				result[j][i] = 0;
			}
		}

		singleObj[groupAttr2] = expalanatoryValues[i];
		arraySlopeGraph[rateMatrixIndex].push(singleObj);
	  }	
 
	  rateColKeys = [];
	  for (var i=0; i < expalanatoryValues.length;i++) {
		rateColKeys.push(i);
	  }
	  
	  rateColLabels = expalanatoryValues;

	  return result;
  }

function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

function rateBivariateMatrix(rateMatrix, rateMatrixSubgroup) {
	var result;

	if (selectValue == 'Sequential 3x3'){
		result = rateBivariateMatrixSequential3(rateMatrix, rateMatrixSubgroup);
	} else if (selectValue == 'Diverging 3x3'){
			result = rateBivariateMatrixDiverging3(rateMatrix, rateMatrixSubgroup);
	} else if(selectValue == 'Diverging 5x5') {	
		result = rateBivariateMatrixDiverging5(rateMatrix, rateMatrixSubgroup);
	}
	return result;
}

function rateBivariateMatrixSequential3(rateMatrix, rateMatrixSubgroup) {
	// Initial a n*m array
	var rowNum = rateMatrixSubgroup.length;
	var colNum = rateMatrixSubgroup[0].length;
	var bivariateMatrix = new Array(rowNum);
	for (var i = 0; i < rowNum; i++) {
		bivariateMatrix[i] = new Array(colNum);
	}

    for (var i = 0; i < rowNum; i++){
      for (var j=0; j<colNum;j++){
        // Set rateMatrixSubgroup to bivariateMatrix
        if (rateMatrixSubgroup[i][j] > (1+legendAdjustValue)) {
          bivariateMatrix[i][j] = 2;
		} else if ((rateMatrixSubgroup[i][j] >= (1-legendAdjustValue)) 
						&& (rateMatrixSubgroup[i][j] <= (1+legendAdjustValue))){
          bivariateMatrix[i][j] = 1;
        } else {
          bivariateMatrix[i][j] = 0;
        }    

        // Set rateMatrix to bivariateMatrix
        if (rateMatrix[i] > (1+legendAdjustValue)) {
          bivariateMatrix[i][j] += 6;
		} else if ((rateMatrix[i] >= (1-legendAdjustValue)) 
						&& (rateMatrix[i] <= (1+legendAdjustValue))){
          bivariateMatrix[i][j] += 3;
        } else {
          bivariateMatrix[i][j] += 0;
        }                 
      }
	}

	return bivariateMatrix;
}

function rateBivariateMatrixDiverging3(rateMatrix, rateMatrixSubgroup) {
	// Initial a n*m array
	var rowNum = rateMatrixSubgroup.length;
	var colNum = rateMatrixSubgroup[0].length;
	var bivariateMatrix = new Array(rowNum);
	for (var i = 0; i < rowNum; i++) {
		bivariateMatrix[i] = new Array(colNum);
	}

    for (var i = 0; i < rowNum; i++){
      for (var j=0; j<colNum;j++){
        // Set rateMatrixSubgroup to bivariateMatrix
        if (rateMatrixSubgroup[i][j] > (1+legendAdjustValue)) {
          bivariateMatrix[i][j] = 2;
		} else if ((rateMatrixSubgroup[i][j] <= (1+legendAdjustValue)) 
						&& (rateMatrixSubgroup[i][j] >= (1-legendAdjustValue))){
			bivariateMatrix[i][j] = 1;
        } else {
          bivariateMatrix[i][j] = 0;
        }    

        // Set rateMatrix to bivariateMatrix
        if (rateMatrix[i] > (1+legendAdjustValue)) {
          bivariateMatrix[i][j] += 6;
		} else if ((rateMatrix[i] <= (1+legendAdjustValue)) 
					&& (rateMatrix[i] >= (1-legendAdjustValue))){
			bivariateMatrix[i][j] += 3;
        } else {
          bivariateMatrix[i][j] += 0;
        }                 
      }
	}

	return bivariateMatrix;
}

function rateBivariateMatrixDiverging5(rateMatrix, rateMatrixSubgroup) {
	// Initial a n*m array
	var rowNum = rateMatrixSubgroup.length;
	var colNum = rateMatrixSubgroup[0].length;
	var bivariateMatrix = new Array(rowNum);
	for (var i = 0; i < rowNum; i++) {
		bivariateMatrix[i] = new Array(colNum);
	}

    for (var i = 0; i < rowNum; i++){
      for (var j=0; j<colNum;j++){
        // Set rateMatrixSubgroup to bivariateMatrix
        if (rateMatrixSubgroup[i][j] >= (1+2*legendAdjustValue)) {
			//[1+2x, infinite)
		  	bivariateMatrix[i][j] = 4;
		} else if ((rateMatrixSubgroup[i][j] >= (1+legendAdjustValue))
					&& (rateMatrixSubgroup[i][j] < (1+2*legendAdjustValue))) {
			// [1+x, 1+2x)
			bivariateMatrix[i][j] = 3;
		} else if (((rateMatrixSubgroup[i][j] < (1+legendAdjustValue))) 
					&& (rateMatrixSubgroup[i][j] >= (1-legendAdjustValue))){
			// [1-x, 1+x)
		  bivariateMatrix[i][j] = 2;
		} else if (((rateMatrixSubgroup[i][j] < (1-legendAdjustValue))) 
					&& (rateMatrixSubgroup[i][j] >= (1-2*legendAdjustValue))){
			// [1-2x, 1-x)
			bivariateMatrix[i][j] = 1;		  
        } else {
			// [0, 1-2x)
          bivariateMatrix[i][j] = 0;
		}    
		
        // Set rateMatrix to bivariateMatrix
        if (rateMatrix[i] >= (1+2*legendAdjustValue)) {
			//[1+2x, infinite)
		  	bivariateMatrix[i][j] += 20;
		} else if ((rateMatrix[i] >= (1+legendAdjustValue))
					&& (rateMatrix[i] < (1+2*legendAdjustValue))) {		
			// [1+x, 1+2x)	
			bivariateMatrix[i][j] += 15;
		} else if (((rateMatrix[i] < (1+legendAdjustValue))) 
					&& (rateMatrix[i] >= (1-legendAdjustValue))){	
			// [1-x, 1+x)		
		  	bivariateMatrix[i][j] += 10;
		} else if (((rateMatrix[i]< (1-legendAdjustValue))) 
					&& (rateMatrix[i] >= (1-2*legendAdjustValue))){
			// [1-2x, 1-x)
			bivariateMatrix[i][j] += 5;		  
        } else {
			// [0, 1-2x)
    	    bivariateMatrix[i][j] += 0;
		}               
      }
	}

	return bivariateMatrix;
}

var UpdateRateMatrixFormat = function(matrix, vars, rowVars, keyName, matrixIndex, protectedAttr, weightingAttr, targetAttr, subgroups) {

	matrix.forEach(function(row, i) {
		row.forEach(function(cell, j) {
		
			matrix[i][j] = {
					colVar: vars[j],
					start: rowVars[i][0],
					end: rowVars[i][1],
					value: cell,
					keyName: keyName,
					index: matrixIndex,
					protectedAttr: protectedAttr,
					weightingAttr: weightingAttr,
					targetAttr: targetAttr,					
					subgroups: subgroups
				};
		});
	});
	return matrix;
};

function rateSPMatrix(options) {

	var margin = {top: 93, right: 20, bottom: 30, left: 93},
	    width = 90,
	    height = 90,
	    data = options.data,
	    container = options.container,
			rowLabelsData = options.rowLabels,
			colLabelsData = options.colLabels,
			subLabel = options.subLabel;

	if(!data){
		throw new Error('Please pass data');
	}

	if(!Array.isArray(data) || !data.length || !Array.isArray(data[0])){
		throw new Error('It should be a 2-D array');
	}

    var maxValue = d3.max(data, function(layer) { return d3.max(layer, function(d) { return d; }); });
    var minValue = d3.min(data, function(layer) { return d3.min(layer, function(d) { return d; }); });

	var numrows = data.length;
	var numcols = data[0].length;

	//Redraw for zoom
	function redraw() {
		svg.attr("transform",
			"translate(" + d3.event.translate + ")"
			+ " scale(" + d3.event.scale + ")");	
	}	

	var svg = d3.select(container).append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.call(zm = d3.behavior.zoom().scaleExtent([0.1,3]).on("zoom", redraw))
		.append("g");

	var corrPlot = svg.append("g")
		.attr("id", "corrPlot")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var x = d3.scale.ordinal()
	    .domain(d3.range(numcols))
	    .rangeBands([0, width]);

	var y = d3.scale.ordinal()
	    .domain(d3.range(numrows))
	    .rangeBands([0, height]);

	var row = corrPlot.selectAll(".row")
	    .data(data)
		.enter().append("g")
	    .attr("class", "row")
	    .attr("transform", function(d, i) { return "translate(0," + y(i) + ")"; });

	var cells = row.selectAll(".ratecell")
	    .data(function(d) { return d; })
		.enter()
		.append("rect")	
		.attr("class", "ratecell")
		.attr("id", function(d) {return targetAttr + "_" + d.protectedAttr + "_" + d.keyName + "_" + d.subgroups[d.colVar]})
	    .attr("transform", function(d, i) { return "translate(" + x(i) + ", 0)"; });

	cells.attr("width", x.rangeBand()-1)
	    .attr("height", y.rangeBand()-1)
	    .style("stroke-width", "1px")
//		.style("opacity", 1e-6)
    	.transition()
//		.style("opacity", 1)
		.style("fill", function(d, i) {return colorMap[d.value]; });

	cells.style("opacity", 0.1)
		.filter(function(d){
			if (legendValue != -1) {
				return d.value == legendValue;
			} else 
			{
				return d;
			}			
		})
		.style("opacity", 1);

	corrPlot.append("text")
        .attr("x", (width / 2))             
        .attr("y", height + (margin.bottom / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")  
		.text(subLabel);
		
	corrPlot.append("text")
	.attr("x", (width / 2))             
	.attr("y", -60)
	.attr("text-anchor", "middle")  
	.style("font-size", "15px") 
	.text("subgroup");	

	corrPlot.append("text")
	.attr("x", -(width/2))             
	.attr("y", -(height)+15)
	.attr("text-anchor", "middle")  
//	.attr("text-anchor", "start")
	.attr("transform", "rotate(-90)")
	.style("font-size", "15px") 
	.text("ratio");	

	var labels = corrPlot.append('g')
		.attr('class', "labels");

	var columnLabels = labels.selectAll(".column-label")
	    .data(colLabelsData)
	    .enter().append("g")
	    .attr("class", "column-label")
	    .attr("transform", function(d, i) { return "translate(" + x(i) + "," + 0 + ")"; });

	columnLabels.append("line")
		.style("stroke", "black")
	    .style("stroke-width", "1px")
	    .attr("x1", x.rangeBand() / 2)
	    .attr("x2", x.rangeBand() / 2)
	    .attr("y1", 0)
		.attr("y2", -5);

	columnLabels.append("text")
		.attr("x", 8)
		.attr("y", x.rangeBand()/2-6)
		.attr("dy", ".82em")
	    .attr("text-anchor", "start")
	    .attr("transform", "rotate(-90)")
		.text(function(d, i) { return d; })
		.style("font-size", "10px");

	var rowLabels = labels.selectAll(".row-label")
	    .data(rowLabelsData)
	  .enter().append("g")
	    .attr("class", "row-label")
	    .attr("transform", function(d, i) { return "translate(" + 0 + "," + y(i) + ")"; });

	rowLabels.append("line")
		.style("stroke", "black")
	    .style("stroke-width", "1px")
	    .attr("x1", 0)
	    .attr("x2", -5)
	    .attr("y1", y.rangeBand() / 2)
	    .attr("y2", y.rangeBand() / 2);

	rowLabels.append("text")
	    .attr("x", -8)
	    .attr("y", y.rangeBand() / 2)
	    .attr("dy", ".32em")
	    .attr("text-anchor", "end")
		.text(function(d, i) { return d; })
		.style("font-size", "10px");	
}

var clickRateMatrixCell = function() {
	var allsvg = d3.select(container);

	allsvg.selectAll(".cell").classed("clicked", false);
	allsvg.selectAll(".ratecell").classed("clicked", false);

	var clickFlg = d3.select(this).classed("clicked", true);
	if (clickFlg) { clickFlg.call(prepareDetail); }
};

// Reset when double click
var doubleClickRateMatrixCell = function() {

	d3.select("#container").selectAll('.ratecell').classed("clicked", false);

	d3.selectAll('.elm').transition().style('opacity', 1);
	d3.selectAll('.gbc').transition().style('opacity', 1);

};

function prepareDetail() {
	var d = this.datum();

	var vars = { x: d.colVar, left: d.start, right: d.end, keyName: d.keyName, 
				index: d.index, protectedAttr: d.protectedAttr, weightingAttr: d.weightingAttr, targetAttr: d.targetAttr};

	// find subgroup for vars_tables
	var subgroups = d.subgroups;
	var vars_table = { x: targetAttr, y: d.protectedAttr, categoryAttr: d.keyName, category: subgroups[d.colVar]};		

	updateTabulate(vars_table);
	updateSlopeGraph(vars);
	updateGroupedBar(csvData, vars);
}

var updateSlopeGraph = function(vars) {
	d3.select("#slopegraph").selectAll('svg').remove();
	d3.select("#scatterplot").style("display", "none");

	DrawSlopeGraph(
	{
		data        : arraySlopeGraph[vars.index],
		keyStart		: vars.left,
		keyEnd			: vars.right,
		keyName     : vars.keyName,
		protectedAttr: vars.protectedAttr,
		weightingAttr: vars.weightingAttr,
		targetAttr: vars.targetAttr
	});

	highlightLine(parseInt(vars.x)+1);
}

var updateGroupedBar = function(data, vars) {
	d3.select("#groupedbarchart").selectAll('svg').remove();
	/*
	DrawGroupedStackedBarChart(
	{
		data	: data,
		protectedAttr: vars.protectedAttr,
		explanatoryAttr: vars.keyName,
		keyStart		: vars.left,
		keyEnd			: vars.right
	});
*/
	highlightBar(parseInt(vars.x));
}