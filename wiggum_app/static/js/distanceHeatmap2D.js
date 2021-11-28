/**
 * Draw distance 2D heatmap
 *
 * @param data - distance heatmap.
 * @param action - action.
 * @returns none.
 */
function drawDistanceHeatmap2D(dataAll, action) {
	d3.select("#distance_matrix_2d").selectAll('svg').remove();
	d3.select("#distance_matrix_2d").selectAll('div').remove();

	for (var key in dataAll){
		// Now only regression trend, loop only once. TODO multiple trend types
		data = dataAll[key];
		heatmapMatrix = jsonto2darray(data.heatmap);

		//if (data.detail_view_type == 'scatter') {	
			rowLabels = [];
			colLabels = [];
	
			// get rows' labels
			for (var rowkey in data.heatmap) {
				row = data.heatmap[rowkey];
				rowLabels.push(rowkey);
			}

			// get columns' lables
			var first_row = data.heatmap[Object.keys(data.heatmap)[0]];
			for (var colkey in first_row) {
				colLabels.push(colkey);
			}

			matrix_data = UpdateLRMatrixFormat(heatmapMatrix, rowLabels, 
												colLabels, data.trend_type,
												data.detail_view_type);
		//}

		distanceHeatmap({
			container : '#distance_matrix_2d',
			data	  : matrix_data,
			rowLabels : rowLabels,
			colLabels : colLabels
		});
	}

	// Cell Click Event
	d3.select("#distance_matrix_2d").selectAll(".cell")
		.on("click", clickHeatmapCell);	

}

/**
 * Click heatmap matrix cell event
 *
 * @param none.
 * @returns none.
 */
 var clickHeatmapCell = function() {
	var allsvg = d3.select("#distance_matrix_2d");

	allsvg.selectAll(".cell").classed("clicked", false);

	var clickFlg = d3.select(this).classed("clicked", true);

	if (clickFlg) { 

		var datum = d3.select(this).datum();

		updateScatterPlot.call(this, datum); 

		// Call server for subgroups' distances
		datum = JSON.stringify(datum);

		$.ajax({
			type: 'POST',
			url: "/explore",
			data: {'action':'distance_heatmap_click', 'datum': datum},
			success: function(data) {
				// Draw Subgroup Distance for explaining
				drawSubgroupDistance(data, datum);
			}
		}); 

	}

};

/**
 * Update scatterplot
 *
 * @param none.
 * @returns none.
 */
 function updateScatterPlot(datum) {

    drawScatterplot(csvData, datum.independent,datum.dependent, datum.splitby);

	// Change dropdowns' selected values
	var dep_options = d3.select("#dep_sel_button").selectAll('option');
	dep_options.property("selected", function(d) {
		return d === datum.dependent
	});

	var indep_options = d3.select("#indep_sel_button").selectAll('option');
	indep_options.property("selected", function(d) {
		return d === datum.independent
	});

	var splitby_options = d3.select("#splitby_sel_button").selectAll('option');
	splitby_options.property("selected", function(d) {
		return d === datum.splitby
	});

}

/**
 * Prepare linear regression trend matrix information for interaction with scatterplot
 *
 * @param matrix - distance matrix.
 * @param rowLabels - independent used for row labels.
 * @param colLabels - dependent used for columns labels.
 * @param trend_type - trend type.
 * @param detail_view_type - detail view type.
 * @returns matrix - containing information for cells.
 */
 var UpdateLRMatrixFormat = function(matrix, rowLabels, colLabels, trend_type, detail_view_type) {

	matrix.forEach(function(row, i) {
		row.forEach(function(cell, j) {
			rowLabelArray = rowLabels[i].split(" : ");

			matrix[i][j] = {
					dependent: rowLabelArray[0],
					independent: rowLabelArray[1],
					value: cell,
					splitby: colLabels[j],
					trend_type: trend_type,
					detail_view_type: detail_view_type
				};
		});
	});

	return matrix;
};


/**
 * Draw distance heatmap
 *
 * @param options - Data containing matrix information.
 * @returns none.
 */
 function distanceHeatmap(options) {

	var data = options.data,
	    container = options.container;

	var numrows = data.length;
	var numcols = data[0].length;

	// Set margin left based on longest row label
	var rowLabels_temp = options.rowLabels;
	var longest_row_label = rowLabels_temp.reduce(
		function (a, b) {
			return a.length > b.length ? a : b;
		}
	);
	var left_margin = longest_row_label.length*10;

	// Set margin top based on longest column label
	var colLabels_temp = options.colLabels;	
	var longest_col_label = colLabels_temp.reduce(
		function (a, b) {
			return a.length > b.length ? a : b;
		}
	);
	var top_margin = longest_col_label.length*10;

	var margin = {top: top_margin, right: 10, bottom: 10, left: left_margin},
	    width = numcols * 33 + margin.left + margin.right,
	    height = numrows * 33 + margin.top + margin.bottom;

	if(!data){
		throw new Error('Please pass data');
	}

    var rw = 30,
    rh = 30;

	// continous color for overview
	var heatmapColors = ['#ffffe0', '#caefdf','#abdad9','#93c4d2', '#7daeca','#6997c2', '#5681b9','#426cb0', '#2b57a7','#00429d'];
	// continous color scale for overview
	var heatmapColorScale = d3.scaleQuantize()
							.domain([0, 1])
							.range(heatmapColors);


	// Adjust size for div
	if (width < 500) {
		d3.select(container)
			.style("width", width + 30 + 'px');
	} 
	if (height < 500) {
		d3.select(container)
			.style("height", height + 30 + 'px');
	}

	var svg = d3.select(container)
				.append("svg")
				.attr('width', width)
				.attr('height', height)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var row = svg.selectAll(".row")
	    .data(data)
		.enter().append("g")
	    .attr("class", "row")
	    .attr("transform", function(d, i) { return "translate(0," + 33 * i + ")"; });

	var cells = row.selectAll(".cell")
	    .data(function(d) { return d; })
		.enter()
		.append("rect")	
		.attr("class", "cell")
		.attr("id", function(d) {
			return d.trend_type + "_" + d.independent + "_" + d.dependent + "_" + d.splitby
		})
		.datum(function (d) { return d; })	
	    .attr("transform", function(d, i) { return "translate(" + 33 * i + ", 0)"; });

	cells.attr("width", rw)
	    .attr("height", rh)
	    .style("stroke-width", "1px")
		.style("stroke", "black")
    	.transition()
		.style("fill", function(d, i) {
			return heatmapColorScale(d.value);
		});

	var labels = svg.append('g')
		.attr('class', "labels");

	var columnLabels = labels.selectAll(".column-label")
	    .data(options.colLabels)
	    .enter().append("g")
	    .attr("class", "column-label")
	    .attr("transform", function(d, i) { return "translate(" + 33 * i + "," + 0 + ")"; });

	columnLabels.append("text")
		.attr("x", 8)
		.attr("y", 2)
		.attr("dy", ".82em")
	    .attr("text-anchor", "start")
	    .attr("transform", "rotate(-90)")
		.text(function(d, i) { return d; })
		.style("font-size", "20px");

	var rowLabels = labels.selectAll(".row-label")
	    .data(options.rowLabels)
	  .enter().append("g")
	    .attr("class", "row-label")
	    .attr("transform", function(d, i) { return "translate(" + 0 + "," + 33 * i + ")"; });

	rowLabels.append("text")
	    .attr("x", -8)
	    .attr("y", 8)
	    .attr("dy", ".62em")
	    .attr("text-anchor", "end")
		.text(function(d, i) { return d; })
		.style("font-size", "20px");	
}

/**
 * Draw heatmap legend
 *
 * @param overviewLegendTypes - Legend types for overview distance matrices. 
 * 		It is generated by extracting the unique trend types
 * 		from all distance matrix heatmaps.
 * 		Overview legend type can be binary or continuous or both.
 * @returns none.
 */
function DrawHeatmapLegend(overviewLegendTypes) {
	// remove previous legends
	d3.select("#legend").selectAll('svg').remove();

	// draw new legends
	for (var i in overviewLegendTypes) {
		DrawLegend(overviewLegendTypes[i]);
	}
}

/**
 * Draw heatmap legend
 *
 * @param legendType - legend type.
 * @returns none.
 */
function DrawLegend(legendType) {

	var margin = {top: 30, right: 50, bottom: 120, left: 90},
		width = 100,
		height = 200;

	var svg = d3.select("#legend")
				.append("svg")
				.attr("preserveAspectRatio", "xMinYMin meet")
				.attr("viewBox", function(d){
					if (legendType == "binary") {
						return "0 0 300 110";
					} else 
					{
						return "0 0 300 310";
					}
				})			
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");	

	var heatmapColorScale;
	if (legendType == "binary") {
		heatmapColorScale = heatmapBinColorScale;
	} else {
		heatmapColorScale = heatmapConColorScale;
	}

	var colorLegend = d3.legend.color()
								.labelFormat(d3.format(".1f"))
								.scale(heatmapColorScale)
								.shapePadding(5)
								.shapeWidth(50)
								.shapeHeight(20)
								.labelOffset(12)
								.ascending(true);
		
	svg.append("g")
		.attr("transform", "translate(-20, 0)")
		.call(colorLegend);

	// Append N/A cell for legend
	svg.append("rect")
		.attr("x", 0)
		.attr("y", function(d){
			if (legendType == "binary") {
				return 50;
			} else 
			{
				return 250;
			}
		})
		.attr("width", 50)
		.attr("height", 20)
		.style("fill", '#808080')
		.attr("transform", "translate(-20, 0)");

	svg.append("text")
		.attr("x", 55)
		.attr("y", function(d){
			if (legendType == "binary") {
				return 65;
			} else 
			{
				return 265;
			}
		})
		.attr("text-anchor", "middle")  
		.style("font-size", "15px") 
		.text("N/A");

}