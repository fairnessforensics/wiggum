// draw scatter plot
var margin = {top: 30, right: 30, bottom: 30, left: 30},
	width = 360,
	height = 360;	

var scatterplot;
//var scatterplot = d3.select("div#scatterplot")
//	.append("svg")
//	.attr("width", width + margin.left + margin.right)
//	.attr("height", height + margin.top + margin.bottom)									
//	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// Draw frame
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

var updateScatterplot = function(data, vars) {

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

	x.domain([xMin, xMax]);
	y.domain([yMin, yMax]);

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
		var dataFiltered = data.filter(function(d){
								return d[vars.categoryAttr] == vars.category;
							});

		var lgGroup = calcLinear(dataFiltered, vars.x, vars.y, 
			d3.min(dataFiltered, function(d){ return d[vars.x]}), 
			d3.max(dataFiltered, function(d){ return d[vars.x]}));

		scatterplot.append("line")
				.transition()
				.duration(300)
				.ease("linear")
				.attr("class", "regression")
				.attr("x1", x(lgGroup.ptA.x))
				.attr("y1", y(lgGroup.ptA.y))
				.attr("x2", x(lgGroup.ptB.x))
				.attr("y2", y(lgGroup.ptB.y))
				.attr("stroke", color(vars.category))
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
		  .style("fill", color);

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

function isFloat(x){
	var value = parseFloat(x);

	if (!isNaN(parseFloat(value))) {
		if (!Number.isInteger(value)) {
			return true;
		}		
	}
	return false;
}

function getcontinousAttrs(data){
	var columnNames;
	var continousAttrs = [];

	data.forEach(function(d){
		columnNames = Object.keys(d);
	});

	columnNames.forEach(function(name) {
		if (isFloat(data[0][name])) {
			continousAttrs.push(name);
		}
	});
	return continousAttrs;
}

function getCategoricalAttrs(data){
	var columnNames;
	var categoricalAttrs = [];

	data.forEach(function(d){
		columnNames = Object.keys(d);
	});

	columnNames.forEach(function(name) {
		if (!isFloat(data[0][name])) {
			categoricalAttrs.push(name);
		}
	});
	return categoricalAttrs;
}


function createScatterplot(data) {

	scatterplot = d3.select("div#scatterplot")
					.append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)									
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


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

	x.domain([xMin, xMax]);
	y.domain([yMin, yMax]);		

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

	// Regression line
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


var reader = new FileReader();  
var file;

function loadFile() {      
	d3.selectAll("svg").remove();
	file = document.querySelector('input[type=file]').files[0];    

	openFile();

	reader.addEventListener("load", openFile, false);
	if (file) {
		reader.readAsText(file);
	}      
}

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

var UpdateMatrixFormat = function(matrix, vars, category) {


	if (autoDetectFlag == 0 || autoDetectResult == null) {
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
					var len = Object.keys(autoDetectResult.allCorr).length
					for (var k = 0; k < len; k++){
						if ((autoDetectResult.attr1[k] == vars[i] &&
							autoDetectResult.attr2[k] == vars[j] &&
							autoDetectResult.groupbyAttr[k] == category.groupby &&
							autoDetectResult.subgroup[k] == category.value) ||
							(autoDetectResult.attr1[k] == vars[j] &&
								autoDetectResult.attr2[k] == vars[i] &&
								autoDetectResult.groupbyAttr[k] == category.groupby &&
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

var clickMatrixCell = function() {
	var allsvg = d3.select(container);
	allsvg.selectAll(".cell").classed("clicked", false);
	var clickFlg = d3.select(this).classed("clicked", true);
	if (clickFlg) { clickFlg.call(updateScatter); }
};

function updateScatter() {
	var d = this.datum();
	var vars = { x: d.colVar, y: d.rowVar, z: d.value, 
		categoryAttr: d.categoryAttr, category: d.category};

	updateScatterplot(csvData, vars);
}

function openFile(){


	//d3.csv("iris.csv", function(error, data) {

	d3.csv("/static/data/syntheticdata.csv", function(error, data) {
	//d3.csv("/static/data/" + file.name, function(error, data) {
		if (error) throw error;	

		csvData = data;	
		//console.log(csvData);

		// Reset color after removed by loading new file
		color = d3.scale.category10();

		conAttrs = getcontinousAttrs(data);
		catAttrs = getCategoricalAttrs(data);


		// Categorical attributes' value list
		categoryValuesList = [];

		// Get all categorical attributes' values
		catAttrs.forEach(function(name) {
			var categoryValues = d3.nest()
				.key(function(d) {return d[name];})
				.entries(data);

			categoryValues.forEach(function(value) {
				var singleObj = {};
				singleObj['groupby'] = name;
				singleObj['value'] = value.key;
				categoryValuesList.push(singleObj);
			})
		});

		data.forEach(function(d) {
			conAttrs.forEach(function(name) {
				d[name] = +d[name];
			});
		});

		// Initial selectbox
		selectValue = d3.select("#selectors").select('select').property('value');
		selectTypeValue = d3.select("#typeSelector").select('select').property('value');
		// Initial legend click value
		legendValue = -1;

		// Draw Slider
		DrawSlider();

		// Draw Legend
		DrawLegend();

		// If then number of continuous Attributes >=2, assuming regression type SP 
		// prepare the visualization
		if (conAttrs.length>=2) {
			// Reset svg after removed by loading new file
			scatterplot = d3.select("div#scatterplot")
				.append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)									
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


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

			x.domain([xMin, xMax]);
			y.domain([yMin, yMax]);		

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

			// Regression line
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


			////////////////////////////////////////////////////
			///            DRAW Correlation Matrix
			////////////////////////////////////////////////////
			// Correlation for all
			correlationMatrix = [];
			correlationMatrix = getCorrelationMatrix(data, conAttrs);

			// Correlation for subgroup
			correlationMatrixSubgroup = [];
			for (var i = 0; i < categoryValuesList.length; i++) {

					var subgroupData = data.filter(function(d){
						return d[categoryValuesList[i].groupby] == categoryValuesList[i].value;
					});

					correlationMatrixSubgroup[i] = getCorrelationMatrix(subgroupData, conAttrs);
			}

			labels = [];
			for (var i=0; i< conAttrs.length; i++){
				labels.push(conAttrs[i]);
			}

			arrayRankingList = [];

			for (var i = 0; i < correlationMatrixSubgroup.length; i++){

				var bivariateMatrix = BivariateMatrix(correlationMatrix, correlationMatrixSubgroup[i]);
				var subgroupLabel = categoryValuesList[i].groupby +": "+ categoryValuesList[i].value;

				// Ranking the matrix
				var averageWeight = getAverageWeight(bivariateMatrix);
				var singleObj = {};

				singleObj["label"] = subgroupLabel;
				singleObj["weight"] = averageWeight;
				arrayRankingList.push(singleObj);				

				Matrix({
					container : '#container',
					data      : UpdateMatrixFormat(bivariateMatrix, labels, categoryValuesList[i]),
					labels    : labels,
					subLabel  : subgroupLabel
				});
			}

			arrayRankingList.sort(function(x, y){
				return d3.descending(x.weight, y.weight);
			})
			
			rankingListbox(arrayRankingList);

			// Draw Tree
			DrawTree(
				{
					data         : data,
					matrixAll    : correlationMatrix,
					matrixGroups : correlationMatrixSubgroup,
					catAttrs     : catAttrs,
					cateAttrInfo : categoryValuesList,
					labels       : labels
				}
			);
		
			d3.select(container).selectAll(".cell")
			.on("click", clickMatrixCell);	
		}		
	});

};
