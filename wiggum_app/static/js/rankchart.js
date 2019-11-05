/**
 * Update Rank Chart
 *
 * @param data - .
 * @returns none.
 */
function updateRankChart(d) {

	// Result table
	var vars_table = 
		{ x: d.targetAttr, y: d.protectedAttr, categoryAttr: d.categoryAttr, 
			category: d.category, trend_type:d.trend_type };		
			
	updateTabulate(vars_table);

	// Rank chart
	// highlighted subgroup
	var filteredData = tableRecords.filter(function (e) {
		return e.trend_type == d.trend_type && 
				e.feat1 == d.targetAttr && 
				e.feat2 == d.protectedAttr &&  
				e.group_feat == d.categoryAttr &&
				e.subgroup == d.category;
	});

	var parsedData = [];

	// highlighted aggregate trend
	var agg_trend = filteredData[0]['agg_trend'];
	agg_trend.forEach(function(d, i){
		var singleObj = {};
		singleObj['protected_value'] = d;
		singleObj['subgroup'] = 'aggregate';
		singleObj['rank'] = i+1;
		parsedData.push(singleObj);  
	});

	// highlighted subgroup trend
	var subgroup_trend = filteredData[0]['subgroup_trend'];
	var highlight_subgroup = filteredData[0]['subgroup'];
	subgroup_trend.forEach(function(d, i){
		var singleObj = {};
		singleObj['protected_value'] = d;
		singleObj['subgroup'] = highlight_subgroup;
		singleObj['rank'] = i+1;
		parsedData.push(singleObj);  
	});

	// other subgroup trend
	var otherSubgroupData = tableRecords.filter(function (e) {
		return e.trend_type == d.trend_type && 
				e.feat1 == d.targetAttr && 
				e.feat2 == d.protectedAttr &&  
				e.group_feat == d.categoryAttr &&
				e.subgroup != d.category;
	});

	otherSubgroupData.forEach(function(d) {
		var subgroup_trend = d['subgroup_trend'];
		var subgroup = d['subgroup'];
		subgroup_trend.forEach(function(d, i){
			var singleObj = {};
			singleObj['protected_value'] = d;
			singleObj['subgroup'] = subgroup;
			singleObj['rank'] = i+1;
			parsedData.push(singleObj);  
		});
	});

	d3.select("#rankchart").selectAll('svg').remove();

	DrawRankChart(parsedData);

	// highlight aggregate
	d3.selectAll('.node-aggregate').transition().style('opacity', 0.9);
	// highlight subgroup, and replace spaces with '_' 
	d3.selectAll('.node-' + highlight_subgroup.toString().replace(/ /g, '_')).transition().style('opacity', 0.9);

}

/**
 * Draw Rank Chart
 *
 * @param data - .
 * @returns none.
 */
function DrawRankChart(data) {

	var margin = {top: 50, right: 10, bottom: 50, left: 10};
   
	var width = 460,
		height = 360;
	
	//Redraw for zoom
	function redraw() {
		svg.attr("transform",
			"translate(" + d3.event.translate + ")"
			+ " scale(" + d3.event.scale + ")");	
	}

	var svg = d3.select("div#rankchart").append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
					.call(zm = d3.behavior.zoom().scaleExtent([0.1,3]).on("zoom", redraw))
					.append("g");

	// Scales
	var x = d3.scale.ordinal()
				.domain(data.map(function(d) { return d['subgroup']; }))
				.rangeRoundBands([100, width - 60]);	 
	
	var y = d3.scale.linear()
				.domain([d3.min(data, function(d) { return d['rank'] }), d3.max(data, function(d) { return d['rank']; })])
				.range([20, height - 10]);

	// Axis
	var xAxis = d3.svg.axis()
					.scale(x)
					.tickSize(0)
					.orient("bottom");

	svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(-"+ x.rangeBand()/2.0 +"," + height + ")")
			.call(xAxis)
			.call(g => g.select(".domain").remove())
			.selectAll("text")	
			.style("text-anchor", "start")
			.attr("dx", ".8em")
			.attr("dy", ".15em")
			.attr("transform", "rotate(30)");

	// Labels
	var labels = svg.append("g")
					.attr("class", "labels")
					.selectAll("text")
					.data(data.filter(function(d) {
                        return d['subgroup'] == 'aggregate'}))
					.enter()
					.append("text")
					.attr("x", function(d) { return x(d['subgroup']); })
					.attr("y", function(d) { return y(d['rank']); })
					.attr("dx", "-.71em")
					.attr("dy", ".21em")
					.style("text-anchor", "end")
					.style("font-size", "12px")
					.text(function(d) { return d.protected_value; });	

	var color = d3.scale.category10();

	// Lines
	var protected_values = d3.map(data, function(d) {
								return d['protected_value'];
							}).keys();
	
	protected_values.forEach(function(protected_value) {
		var lineData = data.filter(function(d) {
			if(d['protected_value'] == protected_value) {
				return d;
			}
		});

		var line = d3.svg.line()
			.x(function(d) { return x(d['subgroup']); })
			.y(function(d) { return y(d['rank']); });

		// Highlight lines data containing the first two elements
		var highlight_line_data = lineData.slice(0, 2);
		svg.append("path")
			.datum(highlight_line_data)
			.attr("fill", "none")
			.attr("stroke", function(d) { return color(protected_value); })					
			.attr("d", function(d) { return line(d)})
			.attr("stroke-width", 3)
			.style("opacity", 0.9);

		// Other line data	
		var other_line_data = lineData.slice(1);			
		svg.append("path")
			.datum(other_line_data)
			.attr("fill", "none")
			.attr("stroke", function(d) { return color(protected_value); })					
			.attr("d", function(d) { return line(d)})
			.attr("stroke-width", 3)
			.style("opacity", 0.2);			
	});	

	// Nodes
	svg.append("g")
		.selectAll("circle")
		.data(data)
		.enter().append("circle")
		// replace spaces with '_'
		.attr("class", function(d) { return "node-" + d['subgroup'].toString().replace(/ /g, '_') })
		.attr("cx", function(d) { return x(d['subgroup']); })
		.attr("cy", function(d) { return y(d['rank']); })
		.attr("r", 6)
		.attr("fill", function(d) { return color(d['protected_value']); })			
		.style("opacity", 0.2);
			  
}

/**
 * Prepare rank trend matrix information for interaction with rank chart
 *
 * @param matrix - distance matrix.
 * @param rowLabels - feat1 used for row labels.
 * @param colLabels - feat2 used for columns labels.
 * @param category - groupfeat and subgroup.
 * @param trend_type - trend type.
 * @returns matrix - containing information for cells.
 */
var UpdateRankTrendMatrixFormat = function(matrix, rowLabels, colLabels, groupInfo, trend_type) {

	matrix.forEach(function(row, i) {
		row.forEach(function(cell, j) {
		
			matrix[i][j] = {
					value: cell,
					trend_type: trend_type,
					targetAttr: rowLabels[i],
					protectedAttr: colLabels[j],
					categoryAttr: groupInfo.groupby,
					category: groupInfo.value			
			};
		});
	});

	return matrix;
};