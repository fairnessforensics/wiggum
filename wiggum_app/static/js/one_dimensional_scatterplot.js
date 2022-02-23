const oneDimensionalScatterPlot = (selection, props) => {
	const {
	  xValue,
	  xAxisLabel,
	  yValue,
	  yAxisLabel,
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
			.attr("class", level + " scatterplot2d x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
		.append("text")
			.attr("class", level + " scatterplot2d label")
			.attr('fill', 'black')
			.attr("x", width/2)
			.attr("y", 26)
			.text(xAxisLabel);	

		// add right y axis
		const yAxisRight = d3.axisRight(yScale);
		selection.append("g")
			.attr("class", level + " scatterplot2d y right axis")
			.attr("transform", "translate(" + width + ",0)")
			.call(yAxisRight)
		.append("text")
			.attr("class", level + " scatterplot2d label")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em");
		
		// Left dots
		selection.selectAll(".path")
			.data(chart_data)
			.enter().append("path")	    
			.attr("class", d => level + " scatterplot2d left circle " 
						+ d.dependent + " " + d.independent + " " + d.splitby)	  
			.attr("d", d3.arc()
						.innerRadius( 0 )
						.outerRadius( 10 )
						.startAngle( 3.14 ) 
						.endAngle( 6.28 ) 
			)
			.attr("transform", d => "translate(0 ," + yScale(yValue(d)) +")")
			.attr("stroke", "black")
			.attr("stroke-width", 2)	  
			.style("fill", d => heatmapColorScale(d.mean_distance));

		// Right dots
		selection.selectAll(".path")
			.data(chart_data)
			.enter().append("path")	    
			.attr("class", d => level + " scatterplot2d right circle " 
						+ d.dependent + " " + d.independent + " " + d.splitby)	  
			.attr("d", d3.arc()
						.innerRadius( 0 )
						.outerRadius( 10 )
						.startAngle( 0 ) 
						.endAngle( 3.14 ) 
			)
			.attr("transform", d => "translate(" + (width + 1) +"," + yScale(yValue(d)) +")")			
			.attr("stroke", "black")
			.attr("stroke-width", 2)	  
			.style("fill", d => heatmapColorScale(d.mean_distance));			
	}

	selection.append("g")
		  .attr("class", function(d) {
			if (xValue) {
				return level + " scatterplot2d y left axis";
			  }
			  return level + " scatterplot1d y left axis";
			})	  
		  .call(yAxis)
		.append("text")
		  .attr("class", function(d) {
			if (xValue) {
				return level + " scatterplot2d label";
			  }
			  return level + " scatterplot1d label";
			})	  
			.attr("x", 0)
			.attr("y", -10)
			.attr("text-anchor", "middle")
		  //.attr("transform", "rotate(-90)")
		  //.attr("y", 6)
		  //.attr("dy", ".71em")
		  .attr('fill', 'black')
		  .text(yAxisLabel);

	selection.selectAll(xValue ? ".scatterplot2d.circle.middle" : ".scatterplot1d.circle.middle")
		  .data(chart_data)
		  .enter().append("circle")	    
		  .attr("class", function(d) {
			console.log('test');
			console.log(xValue);
			if (xValue) {
				return level + " scatterplot2d middle circle " 
					+ d.dependent + " " + d.independent + " " + d.splitby;
			  }
			  return level + " scatterplot1d middle circle " 
		  			+ d.dependent + " " + d.independent + " " + d.splitby;
			})	  
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
	  
	selection.selectAll(xValue ? ".scatterplot2d.text" : ".scatterplot1d.text")		
		.data(chart_data)
		.enter().append("text")	   
		.attr("class", function(d) {
			if (xValue) {
				return level + " scatterplot2d text";
			  }
			  return level + " scatterplot1d text";
			})	  			
		  .attr("dx", 15)
		  .attr("dy", "0.32em")
		  .attr("x", function(d) {
			if (xValue) {
			  return xScale(xValue(d));
			}
			return 0;
		})
		  .attr("y", d => yScale(yValue(d)))
		  .text(d => d.splitby);
  };