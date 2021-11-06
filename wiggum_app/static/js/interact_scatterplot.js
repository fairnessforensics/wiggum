function drawScatterplot(data, indep_var, dep_var, splitby_var) {

	d3.select("#interact_scatterplot").selectAll('svg').remove();
	d3.select("#radio_button").selectAll('svg').remove();	

	var margin = {top: 20, right: 20, bottom: 20, left: 60},
		width = 540 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

	var x = d3.scaleLinear()
		.range([0, width]);

    // TODO---------date column----------->		
	if (indep_var == 'date') {
		x = d3.scaleTime()
				.range([0, width]);
	}		
	// TODO<-------------------
	
	var y = d3.scaleLinear()
		.range([height, 0]);
	
	var xAxis = d3.axisBottom(x);
	var yAxis = d3.axisLeft(y);

	// setup fill color
	var cValue = function(d) { return d[splitby_var];};
	var color = d3.scaleOrdinal(d3.schemeCategory10);
	
	// add the graph canvas to the body of the webpage
	var svg = d3.select("#interact_scatterplot").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	    .append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	x.domain(d3.extent(data, function(d) { return d[indep_var]; })).nice();
	y.domain(d3.extent(data, function(d) { return d[dep_var]; })).nice();

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
		  .attr("r", 4)
		  .attr("cx", function(d) { return x(d[indep_var]);})
		  .attr("cy", function(d) { return y(d[dep_var]);})
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

	addRadioButton();

}
