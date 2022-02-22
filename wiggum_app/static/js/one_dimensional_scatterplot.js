const oneDimensionalScatterPlot = (selection, props) => {
	const {
	  xValue,
	  yValue,
	  circleRadius,
	  width,
	  height,
	  chart_data,
	  level
	} = props;
	


	const yScale = d3.scaleLinear();
	//yScale.domain(d3.extent(chart_data, yValue));
	yScale.domain([0, 1]);
	yScale.range([height, 0]);
	yScale.nice();


	const yAxis = d3.axisLeft(yScale);
	
	const xScale = d3.scaleLinear();
	if (xValue) {
		xScale.domain([0, 1]);
		xScale.range([0, width]);
		xScale.nice();

		const xAxis = d3.axisBottom(xScale);
		selection.append("g")
		.attr("class", level + " scatterplot1d x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)
	  .append("text")
		.attr("class", level + " scatterplot1d label")
		.attr("x", width)
		.attr("y", -6);	
	}

	selection.append("g")
		  .attr("class", level + " scatterplot1d y axis")
		  .call(yAxis)
		.append("text")
		  .attr("class", level + " scatterplot1d label")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 6)
		  .attr("dy", ".71em");

	selection.selectAll(".dot")
		  .data(chart_data)
		  .enter().append("circle")	    
		  .attr("class", d => level + " scatterplot1d circle " 
		  			+ d.dependent + " " + d.independent + " " + d.splitby)	  
		  .attr("r", circleRadius)
		  .attr("cx", function(d) {
			  if (xValue) {
				return xScale(xValue(d));
			  }
			  return 0;
		  })
		  .attr("cy", d => yScale(yValue(d)))
		  .attr("stroke", "black")
		  .attr("stroke-width", 2)	  
		  .style("fill", d => heatmapColorScale(d.mean_distance));

	selection.selectAll(".text")
		.data(chart_data)
		.enter().append("text")	   
		.attr("class", level + " scatterplot1d text")			
		  .attr("dx", 15)
		  .attr("dy", "0.32em")
		  .attr("x", 0)
		  .attr("y", d => yScale(yValue(d)))
		  .text(d => d.splitby);
  };