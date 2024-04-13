const heatmapDensity = (selection, props) => {
	const {
	  margin,
	  width,
	  height,
	  xValue,
	  yValue,
	  var1,
	  var2,
	  parentIdentityFlag,
	  childrenIdentityFlag,
	  rectWidth,
	  rectHeight,
	  identity_data,
	  chart_data,
	  myColor,
	  level
	} = props;
	
	var xScale = d3.scaleLinear()
					.domain(d3.extent(chart_data, xValue));
	var xSequence = xScale.nice().ticks(5);

	var yScale = d3.scaleLinear()
					.domain(d3.extent(chart_data, yValue));
	var ySequence = yScale.nice().ticks(5);

	var count_data = countByTwoRanges(chart_data, var1, var2, ySequence, xSequence);


	// prepare for color considering aggregate heatmap in the virtual layer
	//var max_count = d3.max(count_data, function(d) { return +d.value });
	var min = Math.floor(d3.min(chart_data, function (d) { return d[var2]; } ));
	var max = Math.ceil(d3.max(chart_data, function (d) { return d[var2]; } ));
	var xSequence_vl = [min, max];
	var count_data_vl = countByTwoRanges(chart_data, var1, var2, ySequence, xSequence_vl);
	var max_count = d3.max(count_data_vl, function(d) { return +d.value });

	// Label
	var var1_label = d3.map(count_data, function(d){return d[var1];}).keys();
    var var2_label = d3.map(count_data, function(d){return d[var2];}).keys();

	const g = selection.append('g')
	  .attr('transform', `translate(${margin.left},${-height/2 + margin.top})`);

	// Build X scales and axis:
	var x = d3.scaleBand()
				.range([ 0, width ])
				.domain(var2_label)
				.padding(0.1);

	var xAxis = g.append("g")
		.attr("class", level + " heatmapdensity x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x).tickSize(0)
		.tickFormat((d,i) => "[" + d.replace("-", ", ") + ")")
		)
		
		xAxis.select(".domain").remove();
		
		xAxis.selectAll("text")
			.attr("transform", "rotate(-60)")
			.attr("dx", "-.3em")
			.attr("dy", ".2em")
			.style("text-anchor", "end");


	// Add x axis label
	g.select('.' + level + '.heatmapdensity.x.axis')
		.append("text")
		.attr("class", level + " heatmapdensity x label")
		.attr('fill', 'black')
		.attr("x", width/2)
		.attr("y", 45)
		.text(var2);	

	// Build Y scales and axis:
	var y = d3.scaleBand()
				.range([ height, 0 ])
				.domain(var1_label)
				.padding(0.1);

	g.append("g")
		.attr("class", level + " heatmapdensity y axis")
		.call(d3.axisLeft(y)
				.tickSize(0)
				.tickFormat((d,i) => "[" + d.replace("-", ", ") + ")"))
		.select(".domain").remove()

	// Add y axis label
	g.select('.' + level + '.heatmapdensity.y.axis')
		.append("text")
		.attr("class", level + " heatmapdensity y label")
		.attr("x", 0)
		.attr("y", -8)
		.attr("text-anchor", "middle")
		.attr('fill', 'black')
	  	.text(var1);

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
		.attr("class", level + " heatmapdensity cell")
		.attr("x", function(d) { return x(d[var2]) })
		.attr("y", function(d) { return y(d[var1]) })
		.attr("width", x.bandwidth() )
		.attr("height", y.bandwidth() )
		.style("fill", function(d) { return color(d.value)} )
		.style("stroke", "grey")
		.style("stroke-width", "1px")
		.append('title')
		.text(d => `The count is ${d.value}.`);	

	// Parent Identity
	// TODO merge all identity code to a class
	if (childrenIdentityFlag) {
		g.selectAll(".rect")
			.data(identity_data)
			.enter()    
			.append("rect")	
			.attr("class", d => level + " heatmapdensity initialvirtuallayer children rect " 
						+ d.dependent + " " + d.independent)	  
			.attr("transform", function(d) {
				var y_position = height/2;
				return "translate(" + (-margin.left) +"," + y_position + ")";
			})						
			//.attr("x", -10)
			.attr("x", width + rectWidth + 30)
			.attr("y", -10)						
			.attr("width", rectWidth)
			.attr("height", rectHeight)
			.style("stroke", "black")
			.style("stroke-width", "2px")
			.style("fill-opacity", 1)
			.style("fill", d => heatmapColorScale(d.value))
			.append('title')
			.text(function(d) {
				return `The mean distance is ${d3.format(".3f")(d.value)}.`
			});
	}

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