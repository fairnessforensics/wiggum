const interact_children_button = (selection, props) => {
	const {
		childrenIdentityLabels,
		levelG,
        level
	} = props;

	// Children Identity Button
	var childrenIdentityButtonGroups = selection.selectAll("g." + level + ".children.identity.button")
											.data(childrenIdentityLabels)
											.enter()
											.append("g")
											.attr("class", function(d, i) {
												return level + " children identity button index" + i;
											})
											.style("cursor","pointer")
											.on("click",function(d, i) {

		updateButtonColors(d3.select(this), d3.select(this.parentNode));

		// Reset
		if (level == 'level1') {
			// Initialize children virtual layer width
			globalFirstLevelWidth = globalFirstLevelWidth - globalFirstLevelChildrenVLWidth;
			globalFirstLevelChildrenVLWidth = 20;
			selectedChart = globalFirstLevelView;
		} else if (level == 'level2') {
			selectedChart = globalSecondLevelView;
		} else if (level == 'level3') {
			selectedChart = globalThirdLevelView;
		}

		d3.selectAll('.' + level + '.' + selectedChart + '.virtuallayer.children.rect')
			.transition().style('visibility', "visible");

		// Reset children rect
		d3.selectAll('.'+ level +'.virtuallayer.children.rect')
			.attr("y", -10)
			.attr("height", 20);

		// Remove existing virtual layer except rect
		d3.selectAll("." + level + ".children.virtuallayer:not([class*='rect'])")
			.remove();
		
		d3.selectAll('.aux.virtuallayer').remove();

		/*
		if (i == 1) {
			if (trendType == 'pearson_corr') {
				if (d3.select('.level1.doublehistogram').style("visibility") == 'visible'
				|| d3.select('.level1.scatterplot').style("visibility") == 'visible'
				|| d3.select('.level1.heatmapdensity').style("visibility") == 'visible') {
					adjustWidth({
						firstLevelWidth: firstLevelWidth, 
						addWidth: firstLevelParentVLWidth, 
						level: 'level1'});

					d3.selectAll('.'+ level +'.initialvirtuallayer.children.rect')
					.transition()
					.attr("y", 0)
					.attr("height", height)
					.attr('transform', `translate(${-40},${0})`);
				}

				if (d3.select('.level1.histogram').style("visibility") == 'visible') {
					firstLevelChildrenVLWidth = 60 + 20;
					var addTotalWidthVL = firstLevelParentVLWidth + firstLevelChildrenVLWidth;
					// Adjust Total Space
					adjustTotalWidth({
						firstLevelWidth: firstLevelWidth, 
						firstLevelParentVLWidth: firstLevelParentVLWidth,
						addTotalWidthVL: addTotalWidthVL,
						resetFlag: true
					})

					// Reset the x position for child nodes in level 1 Virtual Layer
					d3.selectAll('.' + level + '.initialvirtuallayer.children.rect')
						.transition()
						.attr("transform", function(d,i) { 
							return "translate(" + 40 + "," + height/2 + ")"; });	

					// TODO merge same code for duplicate y axis
					levelG.each(function (d) {
						var selectionLevelG = d3.select(this);

						var keyArray = d.data.key.split(",");
						var histrogram_data = [];
						csvData.forEach(function (item) {
							var singleObj_var = {};
							singleObj_var['type'] = keyArray[0];
							singleObj_var['value'] = item[keyArray[0]];
							histrogram_data.push(singleObj_var);

						});

						// Duplicate y axis
						selectionLevelG.call(axisHistogram, {
							chart_data: histrogram_data,
							width: firstLevelWidth,
							height: 30,
							offset_y: -35,
							level: 'level1'
						})

						// Second chart
						var histrogram_data = [];
						csvData.forEach(function (item) {
							var singleObj_var = {};
							singleObj_var['type'] = keyArray[1];
							singleObj_var['value'] = item[keyArray[1]];
							histrogram_data.push(singleObj_var);
						});

						// Duplicate y axis
						selectionLevelG.call(axisHistogram, {
							chart_data: histrogram_data,
							width: firstLevelWidth,
							height: 30,
							offset_y: 35,
							level: 'level1'
						})
					})	

					// Call Virtual Layer
					levelG.call(small_multiples_virtual_layer, {
						width: firstLevelWidth,
						height: 30,
						offset_x: 10 + firstLevelWidth,
						offset_y: 35,
						virtualLayerWidth: firstLevelChildrenVLWidth,
						rectWidth: 20,
						rectHeight: 20,
						matrix_data: matrix_data,
						side: 'children',
						level: 'level1'
					});	
				}
			}
		}

		if (i == 2 && trendType == "pearson_corr") {

			if (trendType == 'pearson_corr') {
				if (d3.select('.level1.doublehistogram').style("visibility") == 'visible'
					|| d3.select('.level1.histogram').style("visibility") == 'visible'
					|| d3.select('.level1.scatterplot').style("visibility") == 'visible') {
					//var addRightWidth = 40 + 60;
					if (d3.select('.level1.scatterplot').style("visibility") == 'visible') {
						firstLevelChildrenVLWidth = 70;
					} else {
						firstLevelChildrenVLWidth = 60;
					}

					var addTotalWidthVL = firstLevelParentVLWidth + firstLevelChildrenVLWidth;

					adjustWidth({
						firstLevelWidth: firstLevelWidth, 
						addWidth: addTotalWidthVL, 
						level: 'level2'});
				} 
			} 

			// TODO not sure what the purpose is
			// Reset the x position for child nodes in level 1 Virtual Layer
			//if (d3.select('.level1.scatterplot').style("visibility") == 'visible') {
			//	child_x_position = 30;
			//} else {
			//	child_x_position = 20;
			//}

			child_x_position = 20;

			d3.selectAll('.' + level + '.initialvirtuallayer.children.rect')
				.transition()
				.attr("transform", function(d,i) { 
					return "translate(" + child_x_position + "," + newViewHeight/2 + ")"; });	

			if (trendType == 'pearson_corr') {
				if (d3.select('.level1.doublehistogram').style("visibility") == 'visible'
					|| d3.select('.level1.histogram').style("visibility") == 'visible') {
				
					if (d3.select('.level1.doublehistogram').style("visibility") == 'visible') {
						levelG.each(function (d) {
							var selectionLevelG = d3.select(this);
	
							// Duplicate y axis
							// Prepare data TODO duplicate issue
							var keyArray = d.data.key.split(",");
							var histrogram_data = [];
							csvData.forEach(function (item) {
								var singleObj_var1 = {};
								singleObj_var1['type'] = keyArray[0];
								singleObj_var1['value'] = item[keyArray[0]];
								histrogram_data.push(singleObj_var1);
	
								var singleObj_var2 = {};
								singleObj_var2['type'] = keyArray[1];
								singleObj_var2['value'] = item[keyArray[1]];
								histrogram_data.push(singleObj_var2);
							});
	
							// TODO Duplicate code issue
							var min_domain = d3.min(histrogram_data, function(d) { return +d.value });
							var max_domain = d3.max(histrogram_data, function(d) { return +d.value });
						
							// X axis: scale and draw:
							var x = d3.scaleLinear()
										.domain([min_domain, max_domain])
										.range([0, width]);
	
							var histogram = d3.histogram()
											.value(function(d) { return +d.value; })   
											.domain(x.domain())  
											.thresholds(x.ticks(10)); 
	
							var bins1 = histogram(histrogram_data.filter( function(d){return d.type === keyArray[0]} ));
							var bins2 = histogram(histrogram_data.filter( function(d){return d.type === keyArray[1]} ));
						
							// Y axis: 
							var y_max = Math.max(d3.max(bins1, function(d) { return d.length; }), 
												d3.max(bins2, function(d) { return d.length; }));
	
							var y = d3.scaleLinear()
									.domain([0, y_max])    
									.range([100, 0]);
	
							selectionLevelG.append("g")
								.attr("class", level + " doublehistogram virtuallayer y axis children")
								.attr("transform", "translate(" + 140 + ","+ (-100/2)+")")
								.call(d3.axisRight(y));
						});	

						// Call Virtual Layer
						levelG.call(doubleHistogram_virtual_layer, {
							width: firstLevelWidth,
							height: height,
							parentVLWidth: firstLevelParentVLWidth,
							axis_x_position: 140 + 25,
							side: 'children',
							aux_flag: false,
							level: 'level1'
						});	
					}

					if (d3.select('.level1.histogram').style("visibility") == 'visible') {
						levelG.each(function (d) {
							var selectionLevelG = d3.select(this);

							var keyArray = d.data.key.split(",");
							var histrogram_data = [];
							csvData.forEach(function (item) {
								var singleObj_var = {};
								singleObj_var['type'] = keyArray[0];
								singleObj_var['value'] = item[keyArray[0]];
								histrogram_data.push(singleObj_var);

							});

							// Duplicate y axis
							selectionLevelG.call(axisHistogram, {
								chart_data: histrogram_data,
								width: firstLevelWidth,
								height: 30,
								offset_y: -35,
								level: 'level1'
							})

							// Second chart
							var histrogram_data = [];
							csvData.forEach(function (item) {
								var singleObj_var = {};
								singleObj_var['type'] = keyArray[1];
								singleObj_var['value'] = item[keyArray[1]];
								histrogram_data.push(singleObj_var);
							});

							// Duplicate y axis
							selectionLevelG.call(axisHistogram, {
								chart_data: histrogram_data,
								width: firstLevelWidth,
								height: 30,
								offset_y: 35,
								level: 'level1'
							})
						})	

						// Call Virtual Layer
						levelG.call(histogram_virtual_layer, {
							width: firstLevelWidth,
							height: 30,
							source_offset_y: 0,
							offset_y: -35,
							virtualLayerWidth: firstLevelChildrenVLWidth,
							axis_x_position: 140 + 25,
							side: 'children',
							multi_no: 'h1',
							aux_flag: false,
							level: 'level1'
						});	

						levelG.call(histogram_virtual_layer, {
							width: firstLevelWidth,
							height: 30,
							source_offset_y: 0,
							offset_y: 35,
							virtualLayerWidth: firstLevelChildrenVLWidth,
							axis_x_position: 140 + 25,
							side: 'children',
							multi_no: 'h2',
							aux_flag: false,
							level: 'level1'
						});	
					}
				}

				if (d3.select('.level1.heatmapdensity').style("visibility") == 'visible') {

					firstLevelChildrenVLWidth = 0;
					var addTotalWidthVL = firstLevelParentVLWidth + firstLevelChildrenVLWidth;

					adjustWidth({
						firstLevelWidth: firstLevelWidth, 
						addWidth: addTotalWidthVL, 
						level: 'level2'});

					// Hide node
					d3.selectAll('.' + level + '.initialvirtuallayer.children.rect')
						.transition().style('visibility', "hidden");

					levelG.call(heatmapDensity_virtual_layer, {
						x_position: firstLevelWidth,
						height: 100,
						chart_data: csvData,
						offset_flag: true,
						side: 'children',
						level: 'level1'
					});	
				}
			}
		}
		
		if (i == 3 && trendType == "pearson_corr") {
			if (d3.select('.level1.heatmapdensity').style("visibility") == 'visible') {

				firstLevelChildrenVLWidth = 25;
				var addTotalWidthVL = firstLevelParentVLWidth + firstLevelChildrenVLWidth;
				// Adjust Total Space
				adjustTotalWidth({
					firstLevelWidth: firstLevelWidth, 
					firstLevelParentVLWidth: firstLevelParentVLWidth,
					addTotalWidthVL: addTotalWidthVL,
					resetFlag: false
				})

				d3.selectAll('.'+ level +'.initialvirtuallayer.children.rect')
					.transition()
					.attr("y", 0)
					.attr("height", height)
					.attr('transform', `translate(${-14},${0})`);

				levelG.call(heatmapDensity_virtual_layer, {
					x_position: firstLevelWidth,
					height: 100,
					chart_data: csvData,
					offset_flag: true,
					side: 'children',
					level: 'level1'
				});	
			}							

			if (d3.select('.level1.histogram').style("visibility") == 'visible') {
				firstLevelChildrenVLWidth = 60 + 60;
				var addTotalWidthVL = firstLevelParentVLWidth + firstLevelChildrenVLWidth;

				adjustWidth({
					firstLevelWidth: firstLevelWidth, 
					addWidth: addTotalWidthVL, 
					level: 'level2'});

				// Reset the x position for child nodes in level 1 Virtual Layer
				d3.selectAll('.' + level + '.initialvirtuallayer.children.rect')
					.transition()
					.attr("transform", function(d,i) { 
						return "translate(" + (20 + 60) + "," + height/2 + ")"; });	

				// Call Virtual Layer
				levelG.call(small_multiples_virtual_layer, {
					width: firstLevelWidth,
					height: 30,
					offset_x: 10 + firstLevelWidth + 40,
					offset_y: 35,
					virtualLayerWidth: firstLevelChildrenVLWidth,
					rectWidth: 20,
					rectHeight: 20,
					matrix_data: matrix_data,
					side: 'children',
					level: 'level1'
				});										

				levelG.each(function (d) {
					var selectionLevelG = d3.select(this);

					var keyArray = d.data.key.split(",");
					var histrogram_data = [];
					csvData.forEach(function (item) {
						var singleObj_var = {};
						singleObj_var['type'] = keyArray[0];
						singleObj_var['value'] = item[keyArray[0]];
						histrogram_data.push(singleObj_var);

					});

					// Duplicate y axis
					selectionLevelG.call(axisHistogram, {
						chart_data: histrogram_data,
						width: firstLevelWidth,
						height: 30,
						offset_y: -35,
						level: 'level1'
					})

					// Second chart
					var histrogram_data = [];
					csvData.forEach(function (item) {
						var singleObj_var = {};
						singleObj_var['type'] = keyArray[1];
						singleObj_var['value'] = item[keyArray[1]];
						histrogram_data.push(singleObj_var);
					});

					// Duplicate y axis
					selectionLevelG.call(axisHistogram, {
						chart_data: histrogram_data,
						width: firstLevelWidth,
						height: 30,
						offset_y: 35,
						level: 'level1'
					})
				})	

				// Call Virtual Layer
				levelG.call(histogram_virtual_layer, {
					width: firstLevelWidth,
					height: 30,
					source_offset_y: -35,
					offset_y: -35,
					virtualLayerWidth: firstLevelChildrenVLWidth,
					axis_x_position: 140 + 25,
					side: 'children',
					multi_no: 'h1',
					aux_flag: false,
					level: 'level1'
				});	

				levelG.call(histogram_virtual_layer, {
					width: firstLevelWidth,
					height: 30,
					source_offset_y: 35,
					offset_y: 35,
					virtualLayerWidth: firstLevelChildrenVLWidth,
					axis_x_position: 140 + 25,
					side: 'children',
					multi_no: 'h2',
					aux_flag: false,
					level: 'level1'
				});	
			}
		}
		*/

		// Start to use selectedChart=================================>
		// Common VL option for all charts
		/*if (i == 0) {
			adjust_position = -50;

			d3.selectAll('.'+ level +'.virtuallayer.children.rect')
				.transition()
				.attr("height", 20)
				.attr('transform', `translate(${adjust_position},${globalFirstLevelViewVLHeight/2})`);
		}*/

		if (i == 1) {
			adjustWidth({
				firstLevelWidth: globalFirstLevelWidth, 
				secondLevelWidth: globalSecondLevelWidth,
				addWidth: globalFirstLevelParentVLWidth, 
				thirdLevelParentVLWidth: globalThirdLevelParentVLWidth,
				level: 'level1'});

			d3.selectAll('.'+ level +'.virtuallayer.children.rect')
				.transition()
				.attr("y", 0)
				.attr("height", globalFirstLevelViewVLHeight)
				.attr('transform', `translate(${-50},${0})`);
		}

		if (selectedChart == 'scatterplot') {

			if (i == 2 || i == 3 || i == 4 || i == 5 || i == 6) {

				globalFirstLevelChildrenVLWidth = 90;

				if (i == 5) {
					globalFirstLevelChildrenVLWidth = 110;
				}	

				// Charts in both trends
				levelG.each(function (d) {				
					var selectionLevelG = d3.select(this);

					yLable = selectionLevelG.select(".scatterplot.y.label").text();
					xLable = selectionLevelG.select(".scatterplot.x.label").text();
					var keyArray = d.data.key.split(",");

					var chart_data;
					
					// Aggregate data
					var aggResultArray = d3.nest()
						.key(function(d) {return d[keyArray[1]]})
						.key(function(d) {return d[xLable]})
						.sortKeys(d3.ascending)
						.rollup(function(v) {
							return {
								sum: d3.sum(v, function(d) {return d[keyArray[0]]})
							}
						})
						.entries(csvData);

					// Flattern the nested data
					chart_data = []
					aggResultArray.forEach(function(row) {
						row.values.forEach(function(cell) {
						var singleObj = {};
						singleObj[keyArray[1]] = row.key;
						singleObj[xLable] = Number(cell.key);
						singleObj[keyArray[0]] = cell.value.sum;

						chart_data.push(singleObj);
						});
					});

					// Duplicate y axis
					// TODO Move to axis.js
					//const yScale = d3.scaleLinear();
					// Insert padding so that points do not overlap with y or x axis
					//yScale.domain(padLinear(d3.extent(chart_data, d => d[yLable]), 0.05));
					yScale = d3.scaleLog()
						.domain(d3.extent(chart_data, d => d[yLable])); 
					
					yScale.range([globalFirstLevelViewVLHeight, 0]);
					yScale.nice();

					// TODO hardcode
					//const yAxis = d3.axisRight(yScale).ticks(5);
					//yAxis.tickFormat(d3.format(".2s"));
					const yAxis = d3.axisRight(yScale).ticks(3);
					yAxis.tickFormat(d3.format(".0e"));

					selectionLevelG.append("g")
						.attr("class", level + " scatterplot virtuallayer y axis children")
						.attr("transform", "translate(" + 250 + ","+ (-globalFirstLevelViewVLHeight/2)+")")
						.call(yAxis);
				});	
			}

			// Call Virtual Layer
			/* Reconsider drawing scatterplot VL by trend type
			if (i == 2) {
				if (trendType == 'pearson_corr') {

					levelG.call(scatterplot_virtual_layer, {
						width: globalFirstLevelWidth,
						height: newViewHeight,
						parentVLWidth: firstLevelParentVLWidth,
						axis_x_position: 250 + 35,
						side: 'children',
						aux_flag: false,
						level: 'level1'
					});	
				} 
			} 
			*/

			if (i == 2) {
				levelG.call(agg_scatterplot_virtual_layer, {
					width: globalFirstLevelWidth,
					height: globalFirstLevelViewVLHeight,
					parentVLWidth: globalFirstLevelParentVLWidth,
					axis_x_position: 250 + 35,
					side: 'children',
					aux_flag: false,
					level: 'level1'
				});	
			}

			if (i == 3) {
				levelG.call(scatterplot_virtual_layer, {
					width: globalFirstLevelWidth,
					height: globalFirstLevelViewVLHeight,
					parentVLWidth: globalFirstLevelParentVLWidth,
					axis_x_position: 250 + 35,
					aux_flag: false,
					link_opacity: 0.3,
					side: 'children',
					level: 'level1'
				});	
			}
			

			if (i == 4) {
				// Call Virtual Layer
				levelG.call(agg_scatterplot_swath_virtual_layer, {
							width: globalFirstLevelWidth,
							height: globalFirstLevelViewVLHeight,
							parentVLWidth: globalFirstLevelParentVLWidth,
							axis_x_position: 250 + 35,
							aux_flag: false,
							link_opacity: 0.6,
							side: 'children',
							level: 'level1'
				});						
			}

			if (i == 5) {
				// Call Virtual Layer
				levelG.call(agg_scatterplot_swath_control_virtual_layer, {
							width: globalFirstLevelWidth,
							height: globalFirstLevelViewVLHeight,
							parentVLWidth: globalFirstLevelParentVLWidth,
							axis_x_position: 250 + 35,
							aux_flag: false,
							link_opacity: 0.6,
							side: 'children',
							level: 'level1'
				});								
			}

			if (i == 6) {
				// Call Virtual Layer
				levelG.call(scatterplot_scented_swath_virtual_layer, {
							width: globalFirstLevelWidth,
							height: globalFirstLevelViewVLHeight,
							parentVLWidth: globalFirstLevelParentVLWidth,
							axis_x_position: 250 + 35,
							link_opacity: 0.6,
							side: 'children',
							level: 'level1'
				});								
			}

			// Common part

		}

		if (selectedChart == 'interactheatmap') {
			if (i == 2) {
				globalFirstLevelChildrenVLWidth = 80;

				// Hide node
				d3.selectAll('.' + level + '.virtuallayer.children.rect')
					.transition().style('visibility', "hidden");

				levelG.call(generic_heatmap_virtual_layer, {
					x_position: globalFirstLevelWidth - globalFirstLevelParentVLWidth + globalFirstLevelChildrenVLWidth,
					height: globalFirstLevelViewVLHeight,
					chart_data: csvData,
					offset_flag: true,
					parentVLWidth: globalFirstLevelParentVLWidth,
					childrenVLWidth: globalFirstLevelChildrenVLWidth,
					side: 'children',
					level: 'level1'
				});	
			}
		}

		// Common code
		if (level == 'level1') {
			if (i == 0 || i == 2 || i == 3 || i == 4 || i == 5 || i == 6) {
				// Adjust Total Space
				adjustWidth({
					firstLevelWidth: globalFirstLevelWidth, 
					secondLevelWidth: globalSecondLevelWidth,
					addWidth: globalFirstLevelChildrenVLWidth,
					thirdLevelParentVLWidth: globalThirdLevelParentVLWidth,
					level: 'level2'
				})
				globalFirstLevelWidth += globalFirstLevelChildrenVLWidth;	

				// Reset the x position for child nodes in level 1 Virtual Layer
				d3.selectAll('.' + level + '.virtuallayer.children.rect')
					.transition()
					.attr("transform", function(d,i) { 
						var position_x = globalFirstLevelWidth - globalFirstLevelParentVLWidth - 20;
						return "translate(" + (position_x) + "," + 0 + ")"; });
			}
		}
	});

	// Parent Identity Button
	var bWidth= 22; 
	var bHeight = 22;
	var bSpace= 5; //space between buttons

	childrenIdentityButtonGroups.call(button_vertical_list, {
		bWidth: bWidth,
        bHeight: bHeight,
        bSpace: bSpace,
		x0: 0,
		y0: 0,
		transform_x: (40 * 3), // TODO hardcode
		side: 'children'
	});	

	// Set button invisible at the beginning
	d3.selectAll('.' + level + '.children.identity.button')
		.selectAll('rect, text')
		.style('visibility', 'hidden');
}