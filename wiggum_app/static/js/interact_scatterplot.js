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
		  .attr("class", function (d) { return "dot " + "sel-" + cValue(d) } )		    	  
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

	// draw regression line
	// Regression line for all
	var lgAll = calcLinear(data, indep_var, dep_var, 
		d3.min(x.domain()), 
		d3.max(x.domain()), 
		d3.min(y.domain()), 
		d3.max(y.domain())			
		);
	
	svg.append("line")
		.attr("class", "regression")
		.attr("x1", x(lgAll.ptA.x))
		.attr("y1", y(lgAll.ptA.y))
		.attr("x2", x(lgAll.ptB.x))
		.attr("y2", y(lgAll.ptB.y))
		.attr("stroke", "black")
		.attr("stroke-dasharray", "5,5")
		.attr("stroke-width", 2);
//		.attr("transform", "translate("+margin.left+"," + margin.top + ")");

	// Regression lines for subgroups
	var lgGroup_nest = d3.nest()
				.key(function(d){
					return d[splitby_var];
				})
				.rollup(function(leaves){
					var lgGroup = calcLinear(leaves, indep_var, dep_var, 
						d3.min(x.domain()), 
						d3.max(x.domain()),
						d3.min(y.domain()), 
						d3.max(y.domain())							
						)
						return lgGroup;})
				.entries(data)

	var lines = svg.selectAll('.line')
					.data(lgGroup_nest);

	// regular expression for checking invalid characters in the class name for a line
	var re_invalid_ch = /[~!@$%^&*()+=,.';:"?><{}`#\\/|\[\]]/g;

	lines.enter().append('line')
					.attr("class",function (d) { 
							return 's-line elm ' + 'sel-' 
							+ d.key.toString().replace(re_invalid_ch, '\$&').replace(/ /g, '_');
						} 
					)	
					.attr("x1", function(d) { return x(d.value.ptA.x); })
					.attr("y1", function(d) { return y(d.value.ptA.y); })
					.attr("x2", function(d) { return x(d.value.ptB.x); })
					.attr("y2", function(d) { return y(d.value.ptB.y); })		
					.attr("stroke", function(d) { return color(d.key); })																		
					.attr("stroke-width", 2);
//					.attr("transform", "translate("+margin.left+"," + margin.top + ")");


}
