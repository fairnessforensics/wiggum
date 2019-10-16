/**
 * Update distance heatmap container
 *
 * @param dataAll - distance heatmap dictionary.
 * @returns none.
 */
function updateDistanceHeatmapContainer(dataAll) {

	d3.select("#container").selectAll('svg').remove();
	var createScatterPlotFlag = true;

	for (var key in dataAll){
		data = dataAll[key];
		heatmapMatrix = jsonto2darray(data.heatmap);

		if (data.trend_type == 'lin_reg') {
			groupInfo = {'groupby': data.group_feat, 'value': data.subgroup}
			
			var labels = [];
			for (var rowkey in data.heatmap) {
				labels.push(rowkey);
			}

			matrix_data = UpdateMatrixFormat(heatmapMatrix, labels, groupInfo, data.trend_type);

			rowLabels = labels;
			colLabels = labels;

			if (createScatterPlotFlag) {
				// Scatter plot
				catAttrs = data.group_feat;
				conAttrs = labels;
				createScatterplot(csvData, labels);
				createScatterPlotFlag = false;
			}

		} else if (data.trend_type == 'rank_trend') {
			var pushFlag = true;
			var rowLabels = [];
			var colLabels = [];
			var preData = data.heatmap;

			for (var rowkey in preData) {
				row = preData[rowkey];
				for (var colKey in row) {
					if (pushFlag) {
						colLabels.push(colKey);
						pushFlag =  false;
					}
				}
		
				rowLabels.push(rowkey);
			}

			matrix_data = UpdateRateMatrixFormat(heatmapMatrix, 


												rateColKeys, 
												rateRowVars[i], 
												explanaryAttrs_current[index_explanary], 
												rateMatrixIndex, 
												protectedAttr_current, 
												weightingAttr, 
												targetAttr, 
												target_var_type, 
												rateColLabels[i], 


												data.trend_type, 


												slopeKey);
		}

		distanceMatrixHeatmap({
			container : '#container',
			data	  : matrix_data,
			rowLabels : rowLabels,
			colLabels : colLabels,			
			subLabel  : data.group_feat + ' : ' + data.subgroup
		});
	}

	// Cell Click Event
	d3.select(container).selectAll(".cell")
		.on("click", clickHeatmapMatrixCell);	
}

var clickHeatmapMatrixCell = function() {
	var allsvg = d3.select(container);

	allsvg.selectAll(".cell").classed("clicked", false);

	var clickFlg = d3.select(this).classed("clicked", true);

	if (clickFlg) { clickFlg.call(updateDetailView); }
};

function updateDetailView() {
	var d = this.datum();

	if (d.trend_type == 'lin_reg') {
		updateScatter(d);
	} else if (d.trend_type == 'rank_trend') {
		prepareDetail(d);
	}
}

/**
 * Draw distance heatmap
 *
 * @param options - Data containing matrix information.
 * @returns none.
 */
function distanceMatrixHeatmap(options) {

	var margin = {top: 93, right: 20, bottom: 30, left: 93},
	    width = 90,
	    height = 90,
	    data = options.data,
	    container = options.container,
		subLabel = options.subLabel;

	if(!data){
		throw new Error('Please pass data');
	}

	var data = [];
	var index = 0;
	var rowLabelsData = [];
	var colLabelsData = [];
/*
	for (var rowkey in preData) {
		row = preData[rowkey];
		data[index] = [];
		for (var colKey in row) {
			var singleObj = {};

			singleObj['rowKey'] = rowkey;
			singleObj['colKey'] = colKey;
			singleObj['value'] = row[colKey];
			data[index].push(singleObj);

			if (index == 0) {
				colLabelsData.push(colKey);
			}
		}

		rowLabelsData.push(rowkey);
		index++;
	}
*/
	//var heatmapColor = d3.scale.linear().domain([0, 1]).range(["beige", "red"]);
	var heatmapColors = ["#f7fcf0","#e0f3db","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#0868ac","#084081"];
	//var heatmapColors = ["#ccebc5","#a8ddb5","#7bccc4","#2b8cbe","#084081"];
	var heatmapColorScale = d3.scale.quantile()
							.domain([-2, 2])
							.range(heatmapColors);

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

	var distanceMatrixPlot = svg.append("g")
		.attr("id", "distanceMatrixPlot")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var x = d3.scale.ordinal()
	    .domain(d3.range(numcols))
	    .rangeBands([0, width]);

	var y = d3.scale.ordinal()
	    .domain(d3.range(numrows))
	    .rangeBands([0, height]);

	var row = distanceMatrixPlot.selectAll(".row")
	    .data(data)
		.enter().append("g")
	    .attr("class", "row")
	    .attr("transform", function(d, i) { return "translate(0," + y(i) + ")"; });

	var cells = row.selectAll(".cell")
	    .data(function(d) { return d; })
		.enter()
		.append("rect")	
		.attr("class", "cell")
//		.attr("id", function(d) {return targetAttr + "_" + d.protectedAttr + "_" + d.keyName + "_" + d.subgroups[d.colVar]})
	    .attr("transform", function(d, i) { return "translate(" + x(i) + ", 0)"; });

	cells.attr("width", x.rangeBand()-1)
	    .attr("height", y.rangeBand()-1)
	    .style("stroke-width", "1px")
    	.transition()
//		.style("fill", function(d, i) {return heatmapColor(d.value); });
		.style("fill", function(d, i) {
			if (d.value == 99) {
				return '#808080';
			} else {
				return heatmapColorScale(d.value);
			}
		});

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

	distanceMatrixPlot.append("text")
			.attr("x", (width / 2))             
			.attr("y", height + (margin.bottom / 2))
			.attr("text-anchor", "middle")  
			.style("font-size", "16px") 
			.style("text-decoration", "underline")  
			.text(subLabel);
		
	distanceMatrixPlot.append("text")
			.attr("x", (width / 2))             
			.attr("y", -60)
			.attr("text-anchor", "middle")  
			.style("font-size", "15px") 
			.text(targetAttr);	

	distanceMatrixPlot.append("text")
			.attr("x", -(width/2))             
			.attr("y", -(height)+15)
			.attr("text-anchor", "middle")  
			.attr("transform", "rotate(-90)")
			.style("font-size", "15px") 
			.text("feat1");	

	distanceMatrixPlot.append("text")
			.attr("x", (width / 2))             
			.attr("y", -60)
			.attr("text-anchor", "middle")  
			.style("font-size", "15px") 
			.text("feat2");	

	var labels = distanceMatrixPlot.append('g')
		.attr('class', "labels");

	var columnLabels = labels.selectAll(".column-label")
	    .data(options.colLabels)
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
	    .data(options.rowLabels)
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

/**
 * Draw heatmap legend
 *
 * @param none.
 * @returns none.
 */
function DrawHeatmapLegend() {

	var heatmapColors = ["#f7fcf0","#e0f3db","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#0868ac","#084081"];
	//var heatmapColors = ["#ccebc5","#a8ddb5","#7bccc4","#2b8cbe","#084081"];
	var heatmapColorScale = d3.scale.quantile()
							.domain([-2, 2])
							.range(heatmapColors);

	var margin = {top: 30, right: 50, bottom: 120, left: 90},
		width = 100,
		height = 200;

	var svg = d3.select("#legend")
				.append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");	

	var legend = svg.selectAll(".legend")
		.data([0].concat(heatmapColorScale.quantiles()), function(d) {return d;})
		.enter().append("g")
		.attr("class", "legend");
	
	legend.append("rect")
		.attr("x", 20)
		.attr("y", function(d, i){ return 30 * i;})
		.attr("width", 20)
		.attr("height", 30)
		.style("fill", function(d, i) {return heatmapColors[i]; });

	legend.append("text")
		.text(function(d) {return d.toString().substr(0,4);})
		.attr("x", 50)
		.attr("y", function(d, i){ return 30 *i + 5;});
}
