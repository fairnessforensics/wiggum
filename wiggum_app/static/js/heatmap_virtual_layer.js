const heatmapDensity_virtual_layer = (selection, props) => {
	const {
	  x_position,
	  height,
	  chart_data,
	  offset_flag,
	  side,
	  parentVLWidth,
	  level
	} = props;

	var width;
	var xLable;
	var yLable;

	selection.each(function (d) {
		var selectionLevelG = d3.select(this);
		selectionLevelG.select(".heatmapdensity.cell")
				.each(function () {
					var bbox = this.getBBox();
					width = bbox.width;
				});

		xLable = selectionLevelG.select(".heatmapdensity.x.label").text();
		yLable = selectionLevelG.select(".heatmapdensity.y.label").text();

		var min = Math.floor(d3.min(chart_data, function (d) { return d[xLable]; } ));
		var max = Math.ceil(d3.max(chart_data, function (d) { return d[xLable]; } ));

		var yScale = d3.scaleLinear()
			.domain(d3.extent(chart_data, d => d[yLable]));
		var ySequence = yScale.nice().ticks(5);

		var xSequence = [min, max];

		var count_data = countByTwoRanges(chart_data, yLable, xLable, ySequence, xSequence);

		var max_count = d3.max(count_data, function(d) { return +d.value });

		// Label
		var var1_label = d3.map(count_data, function(d){return d[yLable];}).keys();
		var var2_label = d3.map(count_data, function(d){return d[xLable];}).keys();

		const g = selectionLevelG.append('g')
				.attr('transform', `translate(${-10},${-height/2 })`);

		// Build X scales and axis:
		var x = d3.scaleBand()
					.range([ 0, width ])
					.domain(var2_label);

		// Build Y scales and axis:
		var y = d3.scaleBand()
					.range([ height, 0 ])
					.domain(var1_label)
					.padding(0.1);

		// TODO duplicated code issue, how to share the color from central view
		// Use 7 levels of purple
		var color_range = ["#f2f0f7","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486"];
		var heatmapDensityColor;
		if (max_count <= 100) {
			heatmapDensityColor = d3.scaleSequential()
						.domain([0, max_count])
						.interpolator(d3.interpolate("#f2f0f7", "#4a1486"));
		} else {

			// Calculate the log base by max count
			// Log b(a) = ln a / ln b, ln b = ln a / c
			// b = exp(ln a / c)
			var base = Math.floor(Math.exp(Math.log(max_count)/5));

			heatmapDensityColor = d3.scaleThreshold()
										.domain([1, Math.pow(base, 1), Math.pow(base, 2), Math.pow(base, 3), 
												Math.pow(base, 4), Math.pow(base, 5)])
										.range(color_range);
		}

		var offset_x = 0;
		if (offset_flag == true) {
			offset_x = 20 - x.bandwidth();
		} 

		g.selectAll()
			.data(count_data)
			.enter()
			.append("rect")
			.attr("class", level + " " + side + " heatmapdensity virtuallayer cell")
			.attr("transform", function() {
				if (side == "parent") {
					return "translate(" + (x_position + offset_x - parentVLWidth) + ","+ (0)+")";
				} else {
					return "translate(" + (x_position + offset_x) + ","+ (0)+")"	
				}
			})
			.attr("x", function(d) { return x(d[xLable]) })
			.attr("y", function(d) { return y(d[yLable]) })
			.attr("width", x.bandwidth() )
			.attr("height", y.bandwidth() )
			.style("fill", function(d) { return heatmapDensityColor(d.value)} )
			.style("stroke", "grey")
			.style("stroke-width", "1px")
			.append('title')
			.text(d => `The count is ${d.value}.`);	

	});
}

const generic_heatmap_virtual_layer = (selection, props) => {
	const {
	  x_position,
	  height,
	  chart_data,
	  offset_flag,
	  parentVLWidth,
	  childrenVLWidth,
	  side,
	  level
	} = props;

	var width;

	selection.each(function (d) {
		var selectionLevelG = d3.select(this);
		selectionLevelG.select(".genericheatmap.cell, .interactheatmap.cell")
				.each(function () {
					var bbox = this.getBBox();
					width = bbox.width;
				});

		// Processing the data
		var keyArray = d.data.key.split(",");
		var dependent = keyArray[0];
		var independent = keyArray[1];

		var aggResultArray = d3.nest()
							.key(function(d) {return d[keyArray[1]]})
							.rollup(function(v) {
								return {
									sum: d3.sum(v, function(d) {return d[keyArray[0]]})
								}
							})
							.entries(csvData);

		// Flattern the nested data
		var chart_data = [];
		aggResultArray.forEach(function(obj) {

				var singleObj = {};
				singleObj[independent] = obj.key;
				singleObj[dependent] = obj.value.sum;

				chart_data.push(singleObj);
		});

		var maxValue = d3.max(chart_data, d => d[dependent]);

		// Label
		var var1_label = d3.map(chart_data, function(d){return d[independent];}).keys().reverse();

		const g = selectionLevelG.append('g')
				.attr('transform', `translate(${-10},${-height/2 })`);
	
		// Build Y scales and axis:
		var y = d3.scaleBand()
					.range([ height, 0 ])
					.domain(var1_label)
					.padding(0.1);
	
		// Use 7 levels of purple
		var color_range = ["#f2f0f7","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486"];
		var heatmapDensityColor;
	
		var base = Math.floor(Math.exp(Math.log(maxValue)/5));
	
		heatmapDensityColor = d3.scaleThreshold()
						.domain([1, Math.pow(base, 1), Math.pow(base, 2), Math.pow(base, 3), 
									Math.pow(base, 4), Math.pow(base, 5)])
						.range(color_range);
	
		var offset_x = 0;
		if (offset_flag == true) {
			offset_x = 20 - width;
		} 

		g.selectAll()
			.data(chart_data)
			.enter()
			.append("rect")
			.attr("class", level + " " + side + " genericheatmap virtuallayer cell")
			.attr("transform", function() {
				if (side == "parent") {
					return "translate(" + (x_position + offset_x - parentVLWidth) + ","+ (0)+")";
				} else {
					return "translate(" + (x_position + offset_x) + ","+ (0)+")"	
				}
			})
			.attr("x", 0)
			.attr("y", function(d) { return y(d[independent]) })
			.attr("width", width )
			.attr("height", y.bandwidth() )
			.style("fill", function(d) { return heatmapDensityColor(d[dependent])} )
			.style("stroke", "black")
			.style("stroke-width", "1px")
			.append('title')
			.text(d => `The ${dependent} is ${d3.format(".2s")(d[dependent])}.`);	


		if (side == "parent") {
			// draw legend colored rectangles
			g.append("rect")
				.attr("class", level + " " + side + " genericheatmap virtuallayer label rect")
				.attr("x", -30)
				.attr("y", -10)
				.attr("width", 10)
				.attr("height", 10)
				.style("fill", "#9e9ac8");

			// draw legend text
			g.append("text")
				.attr("class", level + " " + side + " genericheatmap virtuallayer label text")
				.attr("x", 14)
				.attr("y", 0)
				.style("text-anchor", "end")
				.text(dependent);
		}

		if (side == "children") {
			// Duplicate the axis labels
			g.append("g")
				.attr("class", level + " " + side + " genericheatmap virtuallayer y axis")
				.attr("transform", "translate(" + (x_position - childrenVLWidth + 10) + ","+ 0 +")")
				.call(d3.axisRight(y)
						.tickSize(0))
				.select(".domain").remove()
		}

	});
}

/**
 * Reset virtual layering
 * 
 * @param none.
 * @returns none.
*/
function resetVirtualLayering(level) {

	// Reset the left VL similar to left button
	firstLevelParentVLWidth = 0;

	d3.selectAll('.'+ level +'.list.cell')
		.transition().style('visibility', "visible");

	// Reset left rect
	d3.selectAll('.'+ level +'.list.cell')
		.attr("y", -10)
		.attr("height", 20);

	// Remove existing virtual layer
	d3.selectAll('.parent.virtuallayer').remove();

	// Adjust first level width
	adjustWidth({
		firstLevelWidth: firstLevelWidth, 
		addWidth: 0, 
		level: 'level1'});

	adjustWidth({
		firstLevelWidth: firstLevelWidth, 
		addWidth: 0, 
		level: 'level2'});

	// Reset the right VL similar to right button
	firstLevelChildrenVLWidth = 0;

	// Reset right rect
	d3.selectAll('.'+ level +'.virtuallayer.children.rect')
			.attr("y", -10)
			.attr("height", 20);

	// Remove existing virtual layer
	d3.selectAll('.children.virtuallayer').remove();

	// Adjust second level width
	adjustWidth({
		firstLevelWidth: firstLevelWidth, 
		addWidth: 0, 
		level: 'level2'});

	adjustWidth({
		firstLevelWidth: firstLevelWidth, 
		addWidth: 0, 
		level: 'level1'});

}