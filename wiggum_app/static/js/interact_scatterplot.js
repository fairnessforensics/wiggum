function drawScatterplot(data, indep_var, dep_var, splitby_var) {
	$('svg').remove();
	var margin = {top: 10, right: 20, bottom: 20, left: 20},
		width = 500 - margin.left - margin.right,
		height = 490 - margin.top - margin.bottom;

	// setup x 
	var xValue = function(d) { return d[indep_var];}, 
		xScale = d3.scale.linear().range([0, width]), 
		xMap = function(d) { return xScale(xValue(d));}, 
		xAxis = d3.svg.axis().scale(xScale).orient("bottom");

	// setup y
	var yValue = function(d) { return d[dep_var];}, 
		yScale = d3.scale.linear().range([height, 0]), 
		yMap = function(d) { return yScale(yValue(d));}, 
		yAxis = d3.svg.axis().scale(yScale).orient("left");

	// setup fill color
	var cValue = function(d) { return d[splitby_var];};
	var color = d3.scale.category10();
	
	// add the graph canvas to the body of the webpage
	var svg = d3.select("#interact_scatterplot").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	  .append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	  // change string (from CSV) into number format
	  data.forEach(function(d) {
		d[dep_var] = +d[dep_var];
		d[indep_var] = +d[indep_var];
	  });

	  xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
	  yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

	  // x-axis
	  svg.append("g")
		  .attr("class", "x axis")
		  .attr("transform", "translate(0," + height + ")")
		  .call(xAxis)
		.append("text")
		  .attr("class", "label")
		  .attr("x", width)
		  .attr("y", -6);
//		  .style("text-anchor", "end")
//		  .text(indep_var);

	  // y-axis
	  svg.append("g")
		  .attr("class", "y axis")
		  .call(yAxis)
		.append("text")
		  .attr("class", "label")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 6)
		  .attr("dy", ".71em");
//		  .style("text-anchor", "end")
//		  .text(dep_var);

	  // draw dots
	  svg.selectAll(".dot")
		  .data(data)
		  .enter().append("circle")	
		  .attr("class", "dot")
		  .transition()
		  .duration(300)
		  .ease("linear")		  
		  .attr("r", 4)
		  .attr("cx", xMap)
		  .attr("cy", yMap)
//		  .style("opacity", 0.9)
		  .attr("stroke", "black")
		  .attr("stroke-width", 1)			  
		  .style("fill", function(d) { return color(cValue(d));});

	  // draw legend
	  var legend = svg.selectAll(".legend")
		  .data(color.domain())
		.enter().append("g")
		  .attr("class", "legend")
		  .attr("transform", function(d, i) { return "translate(10," + i * 20 + ")"; });

	  // draw legend colored rectangles
	  legend.append("rect")
		  .attr("x", width - 18)
		  .attr("width", 18)
		  .attr("height", 18)
//		  .style("opacity", 0.9)
		  .style("fill", color);

	  // draw legend text
	  legend.append("text")
		  .attr("x", width - 24)
		  .attr("y", 9)
		  .attr("dy", ".35em")
		  .style("text-anchor", "end")
		  .text(function(d) { return d;})
}
