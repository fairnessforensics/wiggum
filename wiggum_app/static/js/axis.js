const axisHistogram = (selection, props) => {
	const {
		chart_data,
		width,
		height,
		offset_y,
	  	level
	} = props;

	var min_domain = d3.min(chart_data, function(d) { return +d.value });
	var max_domain = d3.max(chart_data, function(d) { return +d.value });

	var x = d3.scaleLinear()
				.domain([min_domain, max_domain])
				.range([0, width]);

	var histogram = d3.histogram()
						.value(function(d) { return +d.value; })   
						.domain(x.domain())  
						.thresholds(x.ticks(10)); 

	var bins = histogram(chart_data);

	// Y axis: scale and draw:
	var y = d3.scaleLinear()
				.range([height, 0]);
	y.domain([0, d3.max(bins, function(d) { return d.length; })]);  

	selection.append("g")
		.attr("class", level + " doublehistogram virtuallayer y axis children")
		.attr("transform", "translate(" + 140 + ","+ (-height/2 + offset_y)+")")
		.call(d3.axisRight(y));

}

