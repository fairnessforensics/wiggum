function updateParallelCoordinates(data, vars) {

	// Remove previous chart
	d3.select("#rankchart").selectAll('svg').remove();
	
	// Draw parallel coordinates
	DrawParallelCoordinates(data, vars);

}

/**
 * Draw Rank Chart
 *
 * @param data - .
 * @returns none.
 */
function DrawParallelCoordinates(data, vars) {
	var margin = {top: 80, right: 90, bottom: 10, left: 30},
		width = 480 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom;
  
	//Redraw for zoom
	function redraw() {
		svg.attr("transform",
			"translate(" + d3.event.translate + ")"
			+ " scale(" + d3.event.scale + ")");	
	}

	var svg = d3.select("#rankchart")
				.append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.call(zm = d3.behavior.zoom().scaleExtent([0.1,3]).on("zoom", redraw))
				.append("g")
				.attr("transform","translate(" + margin.left + "," + margin.top + ")");

  
	var color = d3.scale.category10();					
  
	var dimensions = ["aggregate", vars.category.toString()];

	for (var key in data[0]) {
		if (key!= "aggregate" && key!= vars.protectedAttr
				&& key!=vars.category.toString()) {
			dimensions.push(key);
		}
	}

	var y = {}

	// Get all values to set y-axe's sacle
	var all_values = function(array, names){
		var res = [];
		array.forEach(function(item){
		   names.forEach(function(name){
			  res = res.concat(item[name]);
		   });
		});
		return(res);
	}(data, dimensions)

	for (i in dimensions) {
		name = dimensions[i]

		// y-axe's scale
		y[name] = d3.scale.linear()
					//.domain(d3.extent(data, function(d) { return +d[name]; }))
					.domain(d3.extent(all_values))
					.range([height, 0])
	}
  
	x = d3.scale.ordinal()
				.domain(dimensions)
	  			.rangePoints([0, width]);
  
	// Highlight
	var highlight = function(d){
  
		selected_group = d[vars.protectedAttr]

		d3.selectAll(".line")
			.transition().duration(200)
			.style("stroke", "#cdcdcd")
			.style("opacity", "0.2")

		d3.selectAll("." + selected_group)
			.transition().duration(200)
			.style("stroke", color(selected_group))
			.style("opacity", "0.9")
	}
  
	// Unhighlight
	var doNotHighlight = function(d){
		d3.selectAll(".line")
			.transition().duration(200).delay(1000)
			.style("stroke", function(d){ return( color(d[vars.protectedAttr]))} )
			.style("opacity", "0.9")
	}
  
	function path(d) {
		return d3.svg.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
	}
  
	// Draw the lines
	svg.selectAll("myPath")
		.data(data)
		.enter()
		.append("path")
		.attr("class", function (d) { return "line " + d[vars.protectedAttr] } ) 
		.attr("d",  path)
		.style("fill", "none" )
		.style("stroke", function(d){ return( color(d[vars.protectedAttr]))} )
		.style("opacity", 0.9)
		.attr("stroke-width", 3)
		.on("mouseover", highlight)
		.on("mouseleave", doNotHighlight );
  
	// Draw the axis
	svg.selectAll("myAxis")
		.data(dimensions).enter()
		.append("g")
		.attr("class", "axis")
		.attr("transform", function(d) { return "translate(" + x(d) + ")"; })
		.each(function(d) { d3.select(this).call(d3.svg.axis().scale(y[d]).ticks(5).orient("left")); })
		.append("text")
		.style("text-anchor", "middle")
		.attr("y", -9)
		.text(function(d) { return d; })
		.style("fill", "black");

	// Legend              
	var legend = svg.selectAll(".legend")
					.data(color.domain())
					.enter().append("g")
					.attr("class", "legend")
					.attr("transform", function(d, i) { return "translate("+(width + 20)+"," + (i * 15 +15) + ")"; });

	legend.append("rect")
		.attr("x", 0)
		.attr("width", 10)
		.attr("height", 10)
		.style("fill", color);

	legend.append("text")
		.attr("x", 15)
		.attr("y", 4)
		.attr("dy", ".35em")
		.style("font-size", "12px")                     
		.style("text-anchor", "start")
		.text(function(d) { return d; });

	// Legend Title
	svg.append("text")
		.attr("x", width+20)
		.attr("y", 4)
		.attr("dy", ".35em")
		.style("font-size", "12px")                     
		.style("text-anchor", "start")
		.text(vars.protectedAttr);

}