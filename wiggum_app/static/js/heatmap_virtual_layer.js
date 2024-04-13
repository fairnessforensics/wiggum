const heatmapDensity_virtual_layer = (selection, props) => {
	const {
	  height,
	  chart_data,
	  side,
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

		// Build color scale
		//var color = d3.scaleLinear()
		//				.range(["white", "black"])
		//				.domain([0, max_count]);

		var color_range = ['#f7f7f7', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696',
							'#737373', '#525252', '#252525', '#000000'];
		// Blue to Red
		//var color_range = ['#053061', '#2166ac', '#4393c3', '#92c5de', '#d1e5f0',
		//					'#fddbc7', '#f4a582', '#d6604d', '#b2182b', '#67001f'];
		// Grey to Red
		//var color_range = ['#1a1a1a', '#4d4d4d', '#878787', '#bababa', '#e0e0e0',
		//					'#fddbc7', '#f4a582', '#d6604d', '#b2182b', '#67001f'];

		var color = d3.scaleQuantize()
						.domain([0, max_count])
						.range(color_range);

		g.selectAll()
			.data(count_data)
			.enter()
			.append("rect")
			.attr("class", level + " heatmapdensity virtuallayer cell")
			.attr("x", function(d) { return x(d[xLable]) })
			.attr("y", function(d) { return y(d[yLable]) })
			.attr("width", x.bandwidth() )
			.attr("height", y.bandwidth() )
			.style("fill", function(d) { return color(d.value)} )
			.style("stroke", "grey")
			.style("stroke-width", "1px")
			.append('title')
			.text(d => `The count is ${d.value}.`);	
	})
}

function countByTwoRanges(data, var1, var2, var1_range, var2_range) {
	var counts = [];

	for (var i = 0; i < var1_range.length - 1; i++) {
		var var1_lowerBound = var1_range[i];
		var var1_upperBound = var1_range[i + 1];
		
		for (var j = 0; j < var2_range.length - 1; j++) {	
			var single_object = {};
			var var2_lowerBound = var2_range[j];
			var var2_upperBound = var2_range[j + 1];

	  		var filteredData = data.filter(d => d[var1] >= var1_lowerBound 
											&& d[var1] < var1_upperBound
											&& d[var2] >= var2_lowerBound
											&& d[var2] < var2_upperBound);
	  
			single_object[var1] = `${var1_lowerBound}-${var1_upperBound}`;
			single_object[var2] = `${var2_lowerBound}-${var2_upperBound}`;
			single_object['value'] = filteredData.length;
			counts.push(single_object);								
						
		}
	}

	return counts;
  }