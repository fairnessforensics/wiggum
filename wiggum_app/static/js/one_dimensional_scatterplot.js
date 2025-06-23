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
	  relative_translate_y,
	  smallMultipleFlag,
	  first_small_multiple_flag,
	  last_small_multiple_flag,
	  share_axis_flag,
	  chart_name_suffix_flag,
	  chart_name_suffix,
	  x_axis_scale,
	  y_axis_scale,
	  y_axis_tick_num,
	  chart_data,
	  myColor,
	  mark_shape,
	  mark_width,
	  mark_height,
	  mark_opacity,
	  rowIndex,
	  level
	} = props;

	var chart_name;
	if (smallMultipleFlag == true) {
		if (chart_name_suffix != undefined) {
			chart_name = 'smscatterplot_' + xAxisLabel + "_" + chart_name_suffix;
		} else {
			chart_name = 'smscatterplot_' + xAxisLabel;
		}
	} else if (chart_name_suffix_flag == true) {
		if (chart_name_suffix != undefined) {
			chart_name = 'scatterplot_' + xAxisLabel + "_" + chart_name_suffix;
		} else {
			chart_name = 'scatterplot_' + xAxisLabel;
		}
	} else {
		chart_name = 'scatterplot';
	}

	const g = selection.append('g')
				.attr("class", level + " view virtuallayer " + chart_name)
	  			.attr('transform', `translate(${margin.left},${relative_translate_y})`);

	var innerWidth  = width  - margin.left - margin.right;
	var innerHeight = height - margin.bottom;

	var yScale;
	var yAxis;

	if (y_axis_scale == 'scaleLog') {
		// Log scale cannot include zero
		yScale = d3.scaleLog()
						.domain(d3.extent(chart_data, yValue)) 
						.range([innerHeight, 0]);
		
		yScale.nice();
		
		yAxis = d3.axisLeft(yScale)
					.ticks(y_axis_tick_num, ",.0e")  
					//.tickFormat(d3.format(".2s"));
					.tickFormat(d3.format(",.0e")); 
	} else {
		yScale = d3.scaleLinear();
		
		// Insert padding so that points do not overlap with y or x axis
		yScale.domain(padLinear(d3.extent(chart_data, yValue), 0.05));
		yScale.range([innerHeight, 0]);
		yScale.nice();

		if (smallMultipleFlag) {
			yAxis = d3.axisLeft(yScale).ticks(3);
		} else {
			yAxis = d3.axisLeft(yScale).ticks(5);
		}

		yAxis.tickFormat(d3.format(".2s"));
	}

	// TODO choose linear scale =====================================
	/*const xScale = d3.scaleLinear();
	// Insert padding so that points do not overlap with y or x axis
	xScale.domain(padLinear(d3.extent(chart_data, xValue), 0.1));
	xScale.range([0, width]);
	xScale.nice();
	
	const xAxis = d3.axisBottom(xScale).ticks(5);
	xAxis.tickFormat(d3.format(".2s"));
	===============================================================*/

	// TODO maybe check the data type by meta data
	var xScale;

	if (x_axis_scale == 'scaleTime') {
		xScale = d3.scaleTime();
	
	} else {
		xScale = d3.scaleLinear();
	}

	if (chart_name_suffix == "all" || chart_name_suffix == "all_bounded") {
		xScale.domain(d3.extent(csvData, xValue).map((num, index, array) => {
			if (index == 0 ) {
				return num - 1;
			} else if (index == array.length - 1) {
				return num + 1;
			}
		}));
	} else {
		// Add padding: eg. [2010, 2019] => [2009, 2020]
		xScale.domain(d3.extent(chart_data, xValue).map((num, index, array) => {
			if (index == 0 ) {
				return num - 1;
			} else if (index == array.length - 1) {
				return num + 1;
			}
		}));
	}

	xScale.range([0, innerWidth]);

	var xAxis = d3.axisBottom(xScale);

	if ((smallMultipleFlag && !share_axis_flag) || chart_name_suffix == 'bounded'
			|| chart_name_suffix == 'all_bounded') {
		// Used for industry id
		var dataRange;

		if (chart_name_suffix == 'all_bounded') {
			dataRange = d3.extent(csvData, xValue);
		} else {
			dataRange = d3.extent(chart_data, xValue);
		}

		var tickCount = Math.ceil((dataRange[1] - dataRange[0] + 1) / 5);

		xAxis.ticks(tickCount).tickFormat(d=> d % 5 === 0 ? d : ""); 
		
	// TODO Bug: Miss tick 80 for the code below
	//} else if (smallMultipleFlag && share_axis_flag) {
		// Used for industry id
	//	var tickValues = d3.range(0, 171, 10);
	//	xAxis.tickValues(tickValues).tickFormat(d3.format("d")); 
	}else {
		// Used for year
		xAxis.tickFormat(d3.format(".4"));
	}

	// setup fill color
	var cValue = function(d) { return d[splitby];};

	var color;
	if (myColor == undefined) {
		color = d3.scaleOrdinal(d3.schemeCategory10);
	} else {
		color = myColor;
	}

	var x_axis = g.append("g")
		.attr("class", level + " " + chart_name + " x axis")
		.attr("transform", "translate(0," + innerHeight + ")")
		.call(
			(smallMultipleFlag == false || last_small_multiple_flag == true
				|| share_axis_flag == false) ? xAxis : xAxis.tickSize(0)
		);

	if (xAxisLabel != 'industry') {
		// TODO  add rotate as input
		x_axis.selectAll("text")
			.attr("transform", "rotate(-60)")
			.attr("dx", "-.9em")
			.attr("dy", ".1em")
			.style("text-anchor", "end");
	}

	// Remove two end labels from x axis for time scale
	if ((!smallMultipleFlag || share_axis_flag) 
			&& chart_name_suffix != 'bounded' && chart_name_suffix != 'all_bounded') {
		// Small multiple for leaf level
		x_axis.selectAll(".tick")
			.filter(function(d, i) {
				return i === 0 || i === xScale.ticks().length - 1;
			})
			.remove();
	} else {
		// Small multiple for industry in the first level 
		x_axis.selectAll(".tick")
			.filter(function(d, i) {
				return i === 0;
			})
			.remove();
	}

	if (smallMultipleFlag) {
		if (!last_small_multiple_flag && share_axis_flag) {
			x_axis.selectAll('.tick').remove();
			x_axis.select(".domain")
					.attr("stroke", "black")
					.attr("stroke-width", 1)	  
					.attr("stroke-opacity", 0.3);
		}
	}

	if (smallMultipleFlag == false || last_small_multiple_flag == true) {
		x_axis.append("text")
			.attr("class", level + " " + chart_name + " x label")
			.attr('fill', 'black')
			//.attr("x", width/2)
			//.attr("y", 45)
			.attr("x", innerWidth + 5)
			.attr("y", (xAxisLabel == 'industry') ? 5 : 20)
			.attr("text-anchor", (xAxisLabel == 'industry') ? "start" : "middle")
			.text(xAxisLabel);	
	} 

	var y_axis = g.append("g")
		  .attr("class", function(d) {
				return level + " " + chart_name + " y left axis";
			})	  
		  .call(yAxis);

	if (smallMultipleFlag == false || first_small_multiple_flag == true) {
		y_axis.append("text")
			.attr("class", function(d) {
					return level + " " + chart_name + " y label";
				})	  
				.attr("x", 0)
				.attr("y", -8)
				.attr("text-anchor", "middle")
			.attr('fill', 'black')
			.text(yAxisLabel);
	}

	const subgroups = new Set(chart_data.map(obj => obj[xAxisLabel]));
	const num_subgroups = subgroups.size;

	if (mark_shape == 'rectangle') {
		
		g.selectAll("." + chart_name + ".circle.middle")
			.data(chart_data)
			.enter().append("rect")	    
			.attr("class", function(d) {
				return level + " " +rowIndex + " " + chart_name + " middle circle " 
					+ yAxisLabel + " " + xAxisLabel + " splitby_" + splitby + " subgroup_" + cValue(d);
				})	  
			.attr("id", function(d, i) {
					return level + "_" + rowIndex + "_" + chart_name + "_middle_circle_"
						+ yAxisLabel + "_" + xAxisLabel + "_splitby_" + splitby 
						+ "_subgroup_" + cValue(d);})
			.attr("x", d => xScale(xValue(d)) - mark_width/2)
			.attr("y", d => yScale(yValue(d)) - mark_height/2)
			.attr("width", mark_width) 
       		.attr("height", mark_height)
			.style("fill", d => color(cValue(d)))
			.attr("opacity", mark_opacity)
			.on("click", function(d) {
				// Add vertical line at clicked point
				const existingLine = g.select(`.v-line[id="${d.industry}"]`);
				if (!existingLine.empty()) {
					// If the line already exists, remove it
					existingLine.remove();
				} else {
					g.append("line")
						.attr("class", "v-line")
						.attr("id", d.industry)
						.attr("x1", xScale(xValue(d)))
						.attr("x2", xScale(xValue(d)))
						.attr("y1", 0)
						.attr("y2", innerHeight)
						.attr("stroke", "grey")
						.attr("stroke-width", mark_width)
						.attr("stroke-opacity", 0.2)
						.on("click", function() {
							d3.select(this).remove(); // Remove the line if clicked
						})
						.lower();
				}
			})
			.append('title')
			.text(function(d) {
				var industryInfo =  "[" + d.industry + ": " + getIndustryNameById(d.industry) + "]";
				return `The trade for ${industryInfo} is ${d3.format(".3f")(d.trade)}.`
			});

	} else {
		g.selectAll("." + chart_name + ".circle.middle")
			.data(chart_data)
			.enter().append("circle")	    
			.attr("class", function(d) {
				return level + " " +rowIndex + " " + chart_name + " middle circle " 
					+ yAxisLabel + " " + xAxisLabel + " splitby_" + splitby + " subgroup_" + cValue(d);
				})	  
			.attr("id", function(d, i) {
					var id;
					if ((i+1) % num_subgroups == 0) {
						id = 'last';
					} else {
						id = i % num_subgroups;
					}
					return level + "_" + rowIndex + "_" + chart_name + "_middle_circle_"
						+ yAxisLabel + "_" + xAxisLabel + "_splitby_" + splitby 
						+ "_subgroup_" + cValue(d) + "_" + id;})
			.attr("r", circleRadius)
			.attr("cx", function(d) {
					return xScale(xValue(d));
			})
			.attr("cy", d => yScale(yValue(d)))
			.attr("stroke", "black")
			.attr("stroke-width", 1)	  
			.attr("stroke-opacity", 0.25)
			.style("fill", function(d) { 
					if (level == "level3") {
						return color(cValue(d));}
					if (myColor == undefined) {
						return '#ffffff';
						//return "#bebebe";
					} else { 
						return color(cValue(d));
						//return myColor;}
					}})
			.on("mouseover", function(d) {
					highlight(d);
			})
			.on("mouseleave", function(d) {
					doNotHighlight(d);
			})
			.append('title');
		}

	// Draw legend
	var legend_g = g.append("g");
	if (smallMultipleFlag == false) {	  
		var num = color.domain().length;
		var row_num = num / 4;
		var legend;

		legend = legend_g.selectAll(".legend")
						.data(color.domain())
						.enter()
						.append("g")
						.attr("class", d => level + " " + chart_name + " legend " + d)
						.attr("transform", 
							function (d, i) {
								row = Math.floor(i / 4) + 1;
								y_offset = (row - row_num) * 12;
								x_offset = (i % 4) * 40;
								return `translate(${x_offset}, ${y_offset})`
							} )
						//.attr("transform", function(d, i) { return "translate(10," + i * 15 + ")"; });

		// draw legend colored rectangles
		if (mark_shape == "rectangle") {
			legend.append("rect")
				.attr("x", 4)
				.attr("y", 4)
				.attr("width", 10)
				.attr("height", 6)
				.style("fill", color);

			// draw legend text
			legend.append("text")
				.attr("x", 17)
				.attr("y", 11)
				.style("text-anchor", "start")
				.style("font-size", "10px") 
				.text(function(d) { return d;});
		} else {
			legend.append("circle")
				.attr("cx", 10)
				.attr("cy", 10)
				.attr("r", 5)
				.style("fill", color);

			// draw legend text
			legend.append("text")
				.attr("x", 17)
				.attr("y", 14)
				.style("text-anchor", "start")
				.style("font-size", "10px") 
				.text(function(d) { return d;});
		}



		var legendWidth = legend_g.node().getBBox().width;
		legend_g.attr("transform", `translate(${(innerWidth - legendWidth) / 2}, -20)`);

		// add legend label
		legend_g.append("text")
			.attr("class", level + " " + chart_name + " legend label")
			.attr("x", legendWidth / 2)
			.attr("y", -(row_num-1) * 12 - 3)
			.style("text-anchor", "middle")
			.style("font-size", "12px") 
			.text(splitby);
	}

	if (first_small_multiple_flag == true) {	     
		var legend = legend_g.selectAll(".legend")
						.data(color.domain())
						.enter().append("g")
						.attr("class", level + " " + chart_name + " legend")
						.attr("transform", function(d, i) { 
							return "translate("+ (innerWidth) 
								+"," + (i * 15 + 5) + ")"; });

		if (mark_shape == "rectangle") {
			legend.append("rect")
				.attr("x", 4)
				.attr("y", 4)
				.attr("width", 10)
				.attr("height", 6)
				.style("fill", color);
		} else {
			legend.append("circle")
				.attr("cx", 10)
				.attr("cy", 8)
				.attr("r", 5)
				.style("fill", color);
		}

		legend.append("text")
			.attr("x", 17)
			.attr("y", 11)
			.style("text-anchor", "start")
			.style("font-size", "10px") 
			.text(function(d) { return d;});

		legend_g.append("text")
			.attr("class", level + " " + chart_name + " legend title")		
			.attr("x", innerWidth + 5)
			.attr("y", 0)
			.style("font-size", "12px")                     
			.style("text-anchor", "start")
			.text(splitby);		
	}


	// Highlight the subgroup that is hovered
	var highlight = function(d){

		selected_subgroup = cValue(d);

		selection.selectAll(".subgroup_" + selected_subgroup)
			.attr("r", 4)
			.attr('stroke', 'black')
			.attr('stroke-width', 1)
			.attr("stroke-opacity", 1)
			.raise();

			var correspondingLeaf = d3.select('#level-3_background_' + yAxisLabel
										+ '_' + xAxisLabel
										+ '_' + splitby
										+ '_' + selected_subgroup);

			correspondingLeaf.style("stroke", "black");
	}

	// Highlight the subgroup that is hovered
	var doNotHighlight = function(d){

		selected_subgroup = cValue(d);

		selection.selectAll(".subgroup_" + selected_subgroup)
				.attr("r", 3)
				.attr("stroke", "black")
				.attr("stroke-width", 1)	  
				.attr("stroke-opacity", 0.25);

		var correspondingLeaf = d3.select('#level-3_background_' + yAxisLabel
									+ '_' + xAxisLabel
									+ '_' + splitby
									+ '_' + selected_subgroup);

		correspondingLeaf.style("stroke", "grey");
	}

  };

function padLinear([x0, x1], k) {
	const dx = (x1 - x0) * k / 2;
	return [x0 - dx, x1 + dx];
}