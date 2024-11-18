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

