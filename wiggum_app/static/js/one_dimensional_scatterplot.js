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
						+ d.dependent + " " + d.independent + " splitby_" + d.splitby)	  
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
						+ d.dependent + " " + d.independent + " splitby_" + d.splitby)	  
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
			if (xValue) {
				// Add splitby_ for differenctiate the varible in both
				// the dependent var and splitby var case
				return level + " scatterplot2d middle circle " 
					+ d.dependent + " " + d.independent + " splitby_" + d.splitby;
			  }

			  return level + " scatterplot1d middle circle " 
		  			+ d.dependent + " " + d.independent + " splitby_" + d.splitby;
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
		  .style("fill", d => heatmapColorScale(d.mean_distance))
		  .append('title')
		  .text(function(d) {
			if (xValue) {
				return `(${d3.format(".3f")(xValue(d))}, ${d3.format(".3f")(yValue(d))})`;
			} else {
				return `${d3.format(".3f")(yValue(d))}`;
			}});
	  
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

  const scatterPlot = (selection, props) => {
	const {
	  xValue,
	  xAxisLabel,
	  yValue,
	  yAxisLabel,
	  splitby,
	  circleRadius,
	  margin,
	  width,
	  height,
	  parentIdentityFlag,
	  rectWidth,
	  rectHeight,
	  identity_data,
	  chart_data,
	  level,
	  myColor
	} = props;

	const g = selection.append('g')
	  .attr('transform', `translate(${margin.left},${-height/2 + margin.top})`);

	const yScale = d3.scaleLinear();
	yScale.domain(d3.extent(chart_data, yValue));
	yScale.range([height, 0]);
	yScale.nice();

	const yAxis = d3.axisLeft(yScale).ticks(5);
	
	const xScale = d3.scaleLinear();
	xScale.domain(d3.extent(chart_data, xValue));
	xScale.range([0, width]);
	xScale.nice();

	const xAxis = d3.axisBottom(xScale).ticks(5);

	// setup fill color
	var cValue = function(d) { return d[splitby];};

	var color;
	if (myColor == undefined) {
		color = d3.scaleOrdinal(d3.schemeCategory10);
	} else {
		color = myColor;
	}

	g.append("g")
		.attr("class", level + " scatterplot x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)
	.append("text")
		.attr("class", level + " scatterplot label")
		.attr('fill', 'black')
		.attr("x", width/2)
		.attr("y", 26)
		.text(xAxisLabel);	

	g.append("g")
		  .attr("class", function(d) {
				return level + " scatterplot y left axis";
			})	  
		  .call(yAxis)
		.append("text")
		  .attr("class", function(d) {
				return level + " scatterplot label";
			})	  
			.attr("x", 0)
			.attr("y", -8)
			.attr("text-anchor", "middle")
		  .attr('fill', 'black')
		  .text(yAxisLabel);

	g.selectAll(".scatterplot.circle.middle")
		  .data(chart_data)
		  .enter().append("circle")	    
		  .attr("class", function(d) {

			return level + " scatterplot middle circle " 
				+ d.dependent + " " + d.independent + " splitby_" + d.splitby;

			})	  
		  .attr("r", circleRadius)
		  .attr("cx", function(d) {
				return xScale(xValue(d));
		  })
		  .attr("cy", d => yScale(yValue(d)))
		  .attr("stroke", "black")
		  .attr("stroke-width", 1)	  
		  .style("fill", function(d) { 
			if (level == "level3") {
				return color(cValue(d));}
			return "#bebebe";
			})
		  .append('title');
	  
	// Parent Identity
	if (parentIdentityFlag) {
		g.selectAll(".rect")
			.data(identity_data)
			.enter()    
			.append("rect")	
			.attr("class", d => level + " scatterplot left rect " 
						+ d.dependent + " " + d.independent)	  
			.attr("transform", function(d) {
				var y_position = height/2;
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

		// Text for identity portion  
		/*g.selectAll(".text")
			.data(identity_data)
			.enter()    		
			.append("text")	   
			.attr("class", d => level + " scatterplot left text " 
						+ d.dependent + " " + d.independent)	
			.attr("transform", function(d) {
				var y_position = height/2;
				return "translate(" + (-margin.left) +"," + y_position + ")";
			})		
			.attr("dx", '.6em')			  
			//.attr("dy", rectHeight + 5)	
			.attr('dy', '1.5em')																
			.style("text-anchor", "end")
			.text(d => d.dependent + "," + d.independent);*/
	}

  };