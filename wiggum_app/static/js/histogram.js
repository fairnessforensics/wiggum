// TODO Issue with the last value with the upper threshold
// TODO last bin issue with Iris data, 
// only 4.4 for sepal_width, cause width -1
// One option: add nice(), and bins = bins.slice(0, bins.length-1);
// Current and temporary fix: Math.max(0, )
// REF: https://github.com/d3/d3-array/issues/54
// https://dev.to/kevinlien/d3-histograms-and-fixing-the-bin-problem-4ac5
// https://stackoverflow.com/questions/63828458/last-bin-in-histogram-has-smaller-width-than-others
const histogram = (selection, props) => {
	const {
	  margin,
	  width,
	  height,
	  offset_y,
	  xAxisLabel,
	  parentIdentityFlag,
	  rectWidth,
	  rectHeight,
	  identity_data,
	  chart_data,
	  myColor,
	  level
	} = props;

	const g = selection.append("g")
			.attr('transform', `translate(${margin.left},${-height/2 + offset_y + margin.top})`);

	// X axis:
	min_domain = d3.min(chart_data, function(d) { return +d.value });
	max_domain = d3.max(chart_data, function(d) { return +d.value });

	// X axis: scale and draw:
	var x = d3.scaleLinear()
				.domain([min_domain, max_domain])
				.range([0, width]);

	g.append("g")
		.attr("class", level + " histogram x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x))
		.append("text")
		.attr("class", level + " histogram label")
		.attr('fill', 'black')
		.attr("x", width/2)
		.attr("y", 26)
		.text(xAxisLabel);

	var histogram = d3.histogram()
					.value(function(d) { return +d.value; })   
					.domain(x.domain())  
					.thresholds(x.ticks(10)); 

	var bins = histogram(chart_data);

	// Y axis: scale and draw:
	var y = d3.scaleLinear()
				.range([height, 0]);
	y.domain([0, d3.max(bins, function(d) { return d.length; })]);  

	g.append("g")
		.attr("class", level + " histogram y axis")
		.call(d3.axisLeft(y))
		.append("text")
		.attr("class", function(d) {
			  return level + " histogram label";
		  })	  
		  .attr("x", 0)
		  .attr("y", -5)
		  .attr("text-anchor", "middle")
		.attr('fill', 'black')
		.text('count');

	g.selectAll("rect")
		.data(bins)
		.enter()
		.append("rect")
		.attr("class", level + " histogram bar")
		.attr("x", 1)
		.attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
		.attr("width", d=> Math.max(0, (x(d.x1) - x(d.x0) - 1) ))
		.attr("height", function(d) { return height - y(d.length); })
		.attr("stroke", "black")
		.attr("stroke-width", 1)	 
		.style("fill", function(d) { 
			if (level == "level3") {
				return color(cValue(d));}
			if (myColor == undefined) {
				return "#bebebe";
				//return "#69b3a2";
			} else { 
				return myColor;}
			});

	// Parent Identity
	if (parentIdentityFlag) {
		g.selectAll(".rect")
			.data(identity_data)
			.enter()    
			.append("rect")	
			.attr("class", d => level + " histogram left rect " 
						+ d.dependent + " " + d.independent)	  
			.attr("transform", function(d) {
				var y_position = height/2 - offset_y;
				return "translate(" + (-margin.left) +"," + y_position + ")";
			})						
			.attr("x", -10)
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

const doubleHistogram = (selection, props) => {
	const {
	  margin,
	  width,
	  height,
	  var1,
	  var2,
	  parentIdentityFlag,
	  rectWidth,
	  rectHeight,
	  level,
	  identity_data,
	  chart_data,
	  myColor
	} = props;

	const g = selection.append("g")
			.attr('transform', `translate(${margin.left},${-height/2 + margin.top})`);

	// X axis:
	min_domain = d3.min(chart_data, function(d) { return +d.value });
	max_domain = d3.max(chart_data, function(d) { return +d.value });

	var x = d3.scaleLinear()
		.domain([min_domain, max_domain])     
		.range([0, width]);
	g.append("g")
		.attr("class", level + " doublehistogram x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x));

	// set the parameters for the histogram
	var histogram = d3.histogram()
		.value(function(d) { return +d.value; })   
		.domain(x.domain())  
		.thresholds(x.ticks(10)); 

	// And apply twice this function to data to get the bins.
	var bins1 = histogram(chart_data.filter( function(d){return d.type === var1} ));
	var bins2 = histogram(chart_data.filter( function(d){return d.type === var2} ));

	// Y axis: 
	var y_max = Math.max(d3.max(bins1, function(d) { return d.length; }), 
						d3.max(bins2, function(d) { return d.length; }));
	var y = d3.scaleLinear()
		.range([height, 0]);
		y.domain([0, y_max]);   
	g.append("g")
		.attr("class", level + " doublehistogram y axis")
		.call(d3.axisLeft(y))
		.append("text")
		.attr("class", function(d) {
			  return level + " doublehistogram label";
		  })	  
		  .attr("x", 0)
		  .attr("y", -8)
		  .attr("text-anchor", "end")
		.attr('fill', 'black')
		.text('count');

	// append the bars for var 1
	g.selectAll("rect")
		.data(bins1)
		.enter()
		.append("rect")
		.attr("class", level + " doublehistogram bar var1")
			.attr("x", 1)
			.attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
			.attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
			.attr("height", function(d) { return height - y(d.length); })
			.style("fill", "#69b3a2")
			.style("opacity", 0.6)

	// append the bars for var 2
	g.selectAll("rect2")
		.data(bins2)
		.enter()
		.append("rect")
		.attr("class", level + " doublehistogram bar var2")		
			.attr("x", 1)
			.attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
			.attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
			.attr("height", function(d) { return height - y(d.length); })
			.style("fill", "#404080")
			.style("opacity", 0.6)

	// Handmade legend
	//g.append("circle").attr("cx",width).attr("cy",0).attr("r", 6).style("fill", "#69b3a2")
	//g.append("circle").attr("cx",width).attr("cy",15).attr("r", 6).style("fill", "#404080")						

	g.append("text")
		.attr("class", level + " doublehistogram legend text var1")		
		.attr("x", width/2 + 10)
		.attr("y", -30)
		.text(var1)
		.style("font-size", "15px")
		.attr('text-anchor',  'middle')
		.attr("alignment-baseline","middle");

	g.append("text")
		.attr("class", level + " doublehistogram legend text var2")		
		.attr("x", width/2+ 10)
		.attr("y", 15-30)
		.text(var2)
		.style("font-size", "15px")
		.attr('text-anchor',  'middle')
		.attr("alignment-baseline","middle");

	g.selectAll("text")
		.each(function(d) { d.bbox = this.getBBox(); });

	g.append('rect')
	  .attr("class", level + " doublehistogram legend var1")		
	  .attr("x", d => width/2-2-d.bbox.width/2)
	  .attr("y", -3-30)	
	  .attr("width", 10)
	  .attr("height", 10)
	  .style('fill', "#69b3a2")
	  .style('opacity', 0.6);

	g.append('rect')
		.attr("class", level + " doublehistogram legend var2")		
		.attr("x", d => width/2-2 -d.bbox.width/2)
		.attr("y", 12-30)	
		.attr("width", 10)
		.attr("height", 10)
		.style('fill', "#404080")
		.style('opacity', 0.6);  

	// Children Identity
	if (parentIdentityFlag) {
		g.selectAll(".rect")
			.data(identity_data)
			.enter()    
			.append("rect")	
			.attr("class", d => level + " doublehistogram virtuallayer right rect " 
						+ d.dependent + " " + d.independent)	  
			.attr("transform", function(d) {
				var y_position = height/2;
				return "translate(" + (-margin.left) +"," + y_position + ")";
			})						
			// TODO hardcode +30
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