// draw scatter plot
var margin = {top: 30, right: 30, bottom: 30, left: 60},
	width = 360,
	height = 360;	

var scatterplot;

/**
 * Draw frame
 *
 * @param none.
 * @returns none.
 */
var drawFrame = function() {
	scatterplot.append("rect")
			.attr("class","frame")
			.attr("height", height)
			.attr("width", width)
			.attr("fill", "#ffffff")
            .attr("stroke", "black")
            .attr("stroke-width", 2)
			.attr("pointer-events", "none")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

};	

var x = d3.scale.linear()
	.range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
	.orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
	.orient("left");


/**
 * Update Scatterplot
 *
 * @param data - data for drawing dots.
 * @param vars - variables containing scatterplot elements information.
 * @returns none.
 */
var updateScatterplot = function(data, vars) {

	d3.select("#scatterplot").style("display", "inline-block");
	d3.select("#rankchart").style("display", "none");
	d3.select("#groupedbarchart").style("display", "none");

	d3.select("#slopegraph").selectAll('svg').remove();
    d3.select('#slopeLabel').select("text").remove();

	d3.selectAll('.axis').remove();

	// Zoom out
	var xMax = d3.max(data, function(d) { return d[vars.x]; }),
		xMin = d3.min(data, function(d) { return d[vars.x]; }),
		xDiff = xMax - xMin,
		xMin = xMin - 0.1 * xDiff,
		xMax = xMax + 0.1 * xDiff,
		yMax = d3.max(data, function(d) { return d[vars.y]; }),
		yMin = d3.min(data, function(d) { return d[vars.y]; }),
		yDiff = yMax - yMin,
		yMin = yMin - 0.1 * yDiff,
		yMax = yMax + 0.1 * yDiff;

	// Set the axes squarely
	var tempMax, tempMin;
	if (xMax > yMax) {
		tempMax = xMax;
	} else {
		tempMax = yMax;
	}
	if (xMin > yMin) {
		tempMin = yMin;
	} else {
		tempMin = xMin;
	}	

	if(d3.select("#samerange").property("checked")){
		x.domain([tempMin, tempMax]);
		y.domain([tempMin, tempMax]);
	}else {
		x.domain([xMin, xMax]);
		y.domain([yMin, yMax]);
	}

	var getX = function(d) {return x(d[vars.x]) ; };
	var getY = function(d) {return y(d[vars.y]) ; };
	
	// Reset color 
	color = d3.scale.category10();
	
	// Update colors for dots
	scatterplot.selectAll(".dot")
		.style("fill", function(d) {
			   return color(d[vars.categoryAttr]); 
		});

	// Update the data points
	scatterplot.selectAll(".dot")
			.transition()
			.duration(300)
			.ease("linear")
			.attr("cx", getX)
			.attr("cy", getY)
			.attr("visibility", "visible")
			.style("opacity", 0.1)
			.filter(function(d){
				if (vars.category != "all") {
					return d[vars.categoryAttr] == vars.category;
				} else 
				{
					return d;
				}
			})
			.style("opacity", 0.6);

	// Regression line for all
	scatterplot.selectAll("line").remove();	
	var lgAll = calcLinear(data, vars.x, vars.y, 
		d3.min(data, function(d){ return d[vars.x]}), 
		d3.max(data, function(d){ return d[vars.x]}));

	scatterplot.append("line")
		.transition()
		.duration(300)
		.ease("linear")	
		.attr("class", "regression")
		.attr("x1", x(lgAll.ptA.x))
		.attr("y1", y(lgAll.ptA.y))
		.attr("x2", x(lgAll.ptB.x))
		.attr("y2", y(lgAll.ptB.y))
		.attr("stroke", "black")
		.attr("stroke-dasharray", "5,5")
		.attr("stroke-width", 2)
		.attr("transform", "translate("+margin.left+"," + margin.top + ")");

	// Regression line for group
	if (vars.category != "all") {
		var lgGroup_nest = d3.nest()
					.key(function(d){
						return d[vars.categoryAttr];
					})
					.rollup(function(leaves){
						var lgGroup = calcLinear(leaves, vars.x, vars.y, 
							d3.min(leaves, function(d){ return d[vars.x]}), 
							d3.max(leaves, function(d){ return d[vars.x]}))
							return lgGroup;})
					.entries(data)

		var lines = scatterplot.selectAll('.line')
						.data(lgGroup_nest);

		lines.enter().append('line')
						.attr({
							class: function (d) { 
								return 's-line elm ' + 'sel-' + d.key;} 
						})			
						.attr("x1", function(d) { return x(d.values.ptA.x); })
						.attr("y1", function(d) { return y(d.values.ptA.y); })
						.attr("x2", function(d) { return x(d.values.ptB.x); })
						.attr("y2", function(d) { return y(d.values.ptB.y); })		
						.attr("stroke", function(d) { return color(d.key); })																		
						.attr("stroke-width", 2)
						.attr("transform", "translate("+margin.left+"," + margin.top + ")");
	}

	// Update legend
	scatterplot.selectAll(".legend").remove();
	var legend = scatterplot.selectAll(".legend")
		  .data(color.domain())
		.enter().append("g")
		  .attr("class", "legend")
		  .attr("transform", function(d, i) { return "translate("+margin.left+" ," + (margin.top+ i * 20) + ")"; });

	  legend.append("rect")
		  .attr("x", width - 18)
		  .attr("width", 18)
		  .attr("height", 18)
		  .style("opacity", 0.6)
		  .style("fill", color)
		  .on("click", function(d){
				clickedSubgroup = d;
				currentDots = d3.selectAll(".dot")
									.filter(function(d){
										return d[vars.categoryAttr] == clickedSubgroup;
									});

				currentOpacity = d3.selectAll(".dot")
									.filter(function(d){
										return d[vars.categoryAttr] == clickedSubgroup;
									}).style("opacity");
	
				// Rounding to 1 decimal
				currentOpacity = Math.round( currentOpacity * 10 ) / 10;
				// Change the opacity: from 0.1 to 0.6 or from 0.6 to 0.1
				currentDots.transition().style("opacity", currentOpacity == 0.6 ? 0.1:0.6);

				// Regression Line
				currentOpacity = d3.selectAll('.sel-' + clickedSubgroup).style("opacity");

				// Change the opacity: from 0.2 to 1 or from 1 to 0.2
				d3.selectAll('.sel-' + clickedSubgroup)
					.transition().style("opacity", currentOpacity == 1 ? 0.2:1)
		  });

	legend.append("text")
		  .attr("x", width - 24)
		  .attr("y", 9)
		  .attr("dy", ".35em")
		  .style("text-anchor", "end")
		  .text(function(d) { return d; });	

	// Update the axis
	scatterplot.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate("+margin.left+"," + (height + margin.top) + ")")
			.call(xAxis)
			.append("text")
			.attr("id", "xTitle")
			.attr("class", "label")
			.attr("x", width)
			.attr("y", -6)
			.style("text-anchor", "end")
			.text(vars.x);
		
		scatterplot.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate("+margin.left+"," + margin.top + ")")		  
			.call(yAxis)
			.append("text")
			.attr("id", "yTitle")
			.attr("class", "label")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text(vars.y);
}

/**
 * Check the value if it is float or not
 *
 * @param x - the value.
 * @returns {boolean} is float or not.
 */
function isFloat(x){
	var value = parseFloat(x);

	if (!isNaN(parseFloat(value))) {
		if (!Number.isInteger(value)) {
			return true;
		}		
	}
	return false;
}

/**
 * Create Scatterplot
 *
 * @param data - the data for drawing the dots.
 * @returns none.
 */
function createScatterplot(data) {

	d3.select("#scatterplot").selectAll('svg').remove();
	d3.select("#scatterplot").style("display", "none");
	
	scatterplot = d3.select("div#scatterplot")
					.append("svg")
					.attr("preserveAspectRatio", "xMinYMin meet")
					.attr("viewBox", "0 0 480 450")								
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// axis range selection
	updateVars = { x: conAttrs[0], y: conAttrs[1],  
		categoryAttr: catAttrs[0], category: "all"};
	var controls = scatterplot.append("foreignObject")
							.attr("width", 630)
							.attr("height", 30)
							.append("xhtml:body")
							.html("<form><input type=checkbox id=samerange checked /></form>")
							.on("click", function(){
								updateScatterplot(csvData, updateVars);
								highlightSubgroup(updateVars.category);
							});
	controls.append("text")
			.style("font-size", "13px")
			.text("Same Axis Range (Warning: angles are not preserved when unchecked!)");	

	// Default: first two continous attributes
	// Zoom out
	var xMax = d3.max(data, function(d) { return d[conAttrs[0]]; }),
		xMin = d3.min(data, function(d) { return d[conAttrs[0]]; }),
		xDiff = xMax - xMin,
		xMin = xMin - 0.1 * xDiff,
		xMax = xMax + 0.1 * xDiff,
		yMax = d3.max(data, function(d) { return d[conAttrs[1]]; }),
		yMin = d3.min(data, function(d) { return d[conAttrs[1]]; }),
		yDiff = yMax - yMin,
		yMin = yMin - 0.1 * yDiff,
		yMax = yMax + 0.1 * yDiff;

	// Set the axes squarely
	var tempMax, tempMin;
	if (xMax > yMax) {
		tempMax = xMax;
	} else {
		tempMax = yMax;
	}
	if (xMin > yMin) {
		tempMin = yMin;
	} else {
		tempMin = xMin;
	}	

	x.domain([tempMin, tempMax]);
	y.domain([tempMin, tempMax]);	
	//x.domain([xMin, xMax]);
	//y.domain([yMin, yMax]);	

	scatterplot.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate("+margin.left+"," + (height + margin.top) + ")")
		.call(xAxis)
		.append("text")
		.attr("id", "xTitle")
		.attr("class", "label")
		.attr("x", width)
		.attr("y", -6)
		.style("text-anchor", "end")
		.text(conAttrs[0]);

	scatterplot.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate("+margin.left+"," + margin.top + ")")		  
		.call(yAxis)
		.append("text")
		.attr("id", "yTitle")
		.attr("class", "label")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text(conAttrs[1]);

	scatterplot.selectAll(".dot")
		.data(data)
		.enter().append("circle")
		.attr("class", "dot")
		.attr("r", 5)
		.attr("cx", function(d) { return x(d[conAttrs[0]]); })
		.attr("cy", function(d) { return y(d[conAttrs[1]]); })
		.style("opacity", 0.6)
		.attr("stroke", "black")
		.attr("stroke-width", 1)		  
		.style("fill", function(d) { return color(d[catAttrs[0]]); })
		.attr("transform", "translate("+margin.left+"," + margin.top + ")");

	// Regression line for all
	var lg = calcLinear(data, conAttrs[0], conAttrs[1], 
		d3.min(data, function(d){ return d[conAttrs[0]]}), 
		d3.max(data, function(d){ return d[conAttrs[0]]}));

	scatterplot.append("line")
		.attr("class", "regression")
		.attr("x1", x(lg.ptA.x))
		.attr("y1", y(lg.ptA.y))
		.attr("x2", x(lg.ptB.x))
		.attr("y2", y(lg.ptB.y))
		.attr("stroke", "black")
		.attr("stroke-dasharray", "5,5")
		.attr("stroke-width", 2)
		.attr("transform", "translate("+margin.left+"," + margin.top + ")");

	// Regression line for group
	var lgGroup_nest = d3.nest()
				.key(function(d){
					return d[catAttrs[0]];
				})
				.rollup(function(leaves){
					var lgGroup = calcLinear(leaves, conAttrs[0], conAttrs[1], 
						d3.min(leaves, function(d){ return d[conAttrs[0]]}), 
						d3.max(leaves, function(d){ return d[conAttrs[0]]}))
						return lgGroup;})
				.entries(data)

	var lines = scatterplot.selectAll('.line')
					.data(lgGroup_nest);

	lines.enter().append('line')
					.transition()
					.duration(300)
					.ease("linear")
					.attr("class", "regression")
					.attr("x1", function(d) { return x(d.values.ptA.x); })
					.attr("y1", function(d) { return y(d.values.ptA.y); })
					.attr("x2", function(d) { return x(d.values.ptB.x); })
					.attr("y2", function(d) { return y(d.values.ptB.y); })		
					.attr("stroke", function(d) { return color(d.key); })																		
					.attr("stroke-width", 2)
					.attr("transform", "translate("+margin.left+"," + margin.top + ")");

	// Legend
	var legend = scatterplot.selectAll(".legend")
		.data(color.domain())
		.enter().append("g")
		.attr("class", "legend")
		.attr("transform", function(d, i) { return "translate("+margin.left+" ," + (margin.top+ i * 20) + ")"; });

	legend.append("rect")
		.attr("x", width - 18)
		.attr("width", 18)
		.attr("height", 18)
		.style("opacity", 0.6)
		.style("fill", color);

	legend.append("text")
		.attr("x", width - 24)
		.attr("y", 9)
		.attr("dy", ".35em")
		.style("text-anchor", "end")
		.text(function(d) { return d; });	

}

/**
 * Calculate linear regression line
 *
 * @param data - data for drawing dots.
 * @param x - the variable for x axis.
 * @param y - the variable for y axis.
 * @param minX - minimal value for X.
 * @param maxX - maximal value for X.
 * @returns {object} an object of two points,
 *                   each point is an object with an x and y coordinate.
 */
function calcLinear(data, x, y, minX, maxX){
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

	// return an object of two points
	// each point is an object with an x and y coordinate
	return {
	  ptA : {
		x: minX,
		y: m * minX + b
	  },
	  ptB : {
		x: maxX,
		y: m * maxX + b
	  }
	}
}

/**
 * Update matrix format
 *
 * @param matrix - matrix used for formatting.
 * @param vars - containing feat1, feat2 info.
 * @param category - groupby info.
 * @param trend_type - trend type.
 * @returns none.
 */
var UpdateMatrixFormat = function(matrix, vars, category, trend_type) {


	if (autoDetectFlag == 0 || autoDetectResult == null) {
		matrix.forEach(function(row, i) {
			row.forEach(function(cell, j) {
			
				matrix[i][j] = {
						rowVar: vars[i],
						colVar: vars[j],
						value: cell,
						categoryAttr: category.groupby,
						category: category.value,
						autoDetectFlg: 0,
						trend_type: trend_type
					};
			});
		});
	} else {
		matrix.forEach(function(row, i) {
			row.forEach(function(cell, j) {
				matrix[i][j] = {

					rowVar: vars[i],
					colVar: vars[j],
					value: cell,
					categoryAttr: category.groupby,

					category: category.value,
					autoDetectFlg: 0
				};

				if (!isEmpty(autoDetectResult)) {
					var len = Object.keys(autoDetectResult.agg_trend).length
					for (var k = 0; k < len; k++){
						if ((autoDetectResult.feat1[k] == vars[i] &&
							autoDetectResult.feat2[k] == vars[j] &&
							autoDetectResult.group_feat[k] == category.groupby &&
							autoDetectResult.subgroup[k] == category.value) ||
							(autoDetectResult.feat1[k] == vars[j] &&
								autoDetectResult.feat2[k] == vars[i] &&
								autoDetectResult.group_feat[k] == category.groupby &&
								autoDetectResult.subgroup[k] == category.value)
							) {
							matrix[i][j].autoDetectFlg = 1
							break;						
						}
					}
				}
			});
		});		
	}


	return matrix;
};

/**
 * Prepare linear regression trend matrix information for interaction with scatterplot
 *
 * @param matrix - distance matrix.
 * @param rowLabels - feat1 used for row labels.
 * @param colLabels - feat2 used for columns labels.
 * @param category - groupfeat and subgroup.
 * @param trend_type - trend type.
 * @returns matrix - containing information for cells.
 */
var UpdateLinearRegressionMatrixFormat = function(matrix, rowLabels, colLabels, category, trend_type) {

	matrix.forEach(function(row, i) {
		row.forEach(function(cell, j) {
		
			matrix[i][j] = {
					rowVar: rowLabels[i],
					colVar: colLabels[j],
					value: cell,
					categoryAttr: category.groupby,
					category: category.value,
					trend_type: trend_type
				};
		});
	});

	return matrix;
};

var clickMatrixCell = function() {
	var allsvg = d3.select(container);

	allsvg.selectAll(".cell").classed("clicked", false);
	allsvg.selectAll(".ratecell").classed("clicked", false);

	var clickFlg = d3.select(this).classed("clicked", true);
	if (clickFlg) { clickFlg.call(updateScatter); }
};

/**
 * Update scatterplot
 *
 * @param none.
 * @returns none.
 */
function updateScatter(data) {
	var d;
	if (typeof data !== 'undefined') {
		d = data;
	} else {
		d = this.datum();
	}

	var vars = { x: d.colVar, y: d.rowVar, z: d.value, 
		categoryAttr: d.categoryAttr, category: d.category, trend_type: d.trend_type};

	// updateVars used for same axis range
	updateVars = vars;	

	updateScatterplot(csvData, vars);
	updateTabulate(vars);
	highlightSubgroup(vars.category);
}

/**
 * highlight the regression line in scatterplot
 *
 * @param subgroup - the group needed for highlight.
 * @returns none.
 */
function highlightSubgroup(subgroup) {
	d3.selectAll('.elm').transition().style('opacity', 0.2);
	d3.selectAll('.sel-' + subgroup).transition().style('opacity', 1);
}
