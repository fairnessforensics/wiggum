const interact_view_button = (selection, props) => {
	const {
		viewLabels,
		charts,
		matrix_data,
		rowLabels,
		colLabels,	
		matrixHeight,
        level
	} = props;

	var levelButtonGroups= selection.selectAll("g." + level + ".button")
								.data(viewLabels)
								.enter()
								.append("g")
								.attr("class", level + " button")
								.style("cursor","pointer")
								.on("click",function(d, i) {

		updateButtonColors(d3.select(this), d3.select(this.parentNode));

		selectedChart = charts[i];

		if (level == 'level1') {
			globalFirstLevelView = selectedChart;
		} else if (level == 'level2') {
			globalSecondLevelView = selectedChart;
		} else if (level == 'level3') {
			globalThirdLevelView = selectedChart;
		} else {}

		// Remove existing view virtual layer
		d3.selectAll('.' + level + '.virtuallayer').remove();

		// Contextual variables
		var contextual_cat_vars = globalInitData.contextual_cat_vars;
		var contextual_ord_vars = globalInitData.contextual_ord_vars;

		// Splitby table for level 2
		var agg_splitby_table_dict = globalInitData.agg_splitby_table_dict;
		var splitby_data = agg_splitby_table_dict[0];
		var splitby_table = JSON.parse(splitby_data.splitby_table);

		// Reset global level size
		if (level == "level1") {
			// Reset first level size
			globalFirstLevelWidth = 0;
			globalFirstLevelHeight = 0;

			// Reset first level VL width 
			globalFirstLevelParentVLWidth = 0;
			globalFirstLevelChildrenVLWidth = 0;

		} else if (level == 'level2') {
			// Reset second level size
			globalSecondLevelWidth = 0;
			globalSecondLevelHeight = 0;

			// Reset second level VL width 
			globalSecondLevelParentVLWidth = 0;
			globalSecondLevelChildrenVLWidth = 0;

		} else if (level == 'level3') {

		}

		var rowIndex = 0;

		var firstLevelG = d3.select('#node_link_tree').selectAll('.node.level-1');

		// Reset list visible
		d3.selectAll('.'+level+'.list')
			.transition()
			.style('visibility', 'visible');

		if (level == "level1" || level == "level2") {
			d3.selectAll('.' + level + '.list.text')
				.transition()
				.attr('dx', () => selectedChart === 'list' ? '0em' : '.6em')
				.attr('dy', '1.5em')
				.attr('text-anchor', () => selectedChart === 'list' ? 'middle' : 'end');

			if (level == "level1") {
				// Reset path visible
				d3.select('#node_link_tree')
					.selectAll('.path.level0')
					.style('visibility', 'visible');
			} else if (level == "level2") {
				// Reset path visible
				d3.selectAll('.level1.path, .level2.path')
					.transition()
					.style('visibility', 'visible');
			}
		} 

		var viewVLWidth = 0;
		var viewVLHeight = 0;
		var childrenVLWidth = 0;
		var childrenVLHeight = 0;
		var secondLevelG1;

		firstLevelG.each(function (d) {

			var container = d3.select(this);

			var keyArray = d.data.key.split(",");
			var dependent = keyArray[0];
			var independent = keyArray[1];

			/* ==================== Data Space ==================== */
			// Chart data
			var first_candidate;
			var candidate_context_vars;
			var chart_data = [];

			if (selectedChart == 'coloredbarchart') {
				/* Visual Tech 3: colored bar chart */
				var detail_dict = globalInitData.rank_trend_detail_dict.find(obj => {
					return obj.dependent === dependent
							&& obj.independent === independent
				});

				var detail_list = JSON.parse(detail_dict.detail_df);
				
				for (const [key1, value1] of Object.entries(detail_list)) {
					var agg_object = {};
					agg_object['name'] = key1;
					agg_object['value'] = value1.aggregate;
					chart_data.push(agg_object);	
				}

			} else if (selectedChart == 'interactheatmap') {
				/* Visual Tech 4: a heatmap with an interactable dimension */
				// Merge contextual categorical vars and contextual ordinal vars
				candidate_context_vars = contextual_cat_vars.concat(contextual_ord_vars)

				// Filter the independent var from contextual_context_vars
				candidate_context_vars = candidate_context_vars.filter(function(item) {
					return item !== independent
				})

				first_candidate = candidate_context_vars[0];

			} else if (selectedChart == 'scatterplot') {
				/* Visual Tech 5: Scatterplot */
				// Filter the independent var from contextual_cat_vars
				candidate_context_vars = contextual_ord_vars.filter(function(item) {
					return item !== independent
				})

				first_candidate = candidate_context_vars[0];

			} else if (selectedChart == 'smscatterplot_industry' || 
						selectedChart == 'scatterplot_industry' || 
						selectedChart == 'scatterplot_industry_bounded') {
				/* 
					Visual Tech 6: Small Multiples of Scatterplot Specificly for Industry ID 
					Visual Tech 7: Scatterplot specificly for Industry ID 
					Visual Tech 8: Scatterplot specificly for Industry ID in a bounded space
				*/
				first_candidate = "industry";

			} else if (selectedChart == 'scatterplot1d' || selectedChart == 'scatterplot_level2') {
				
				chart_data = splitby_table.filter(obj => {
					return obj.dependent === dependent
							&& obj.independent === independent
				  })
			}

			// Analytical Abstraction - Aggregation
			if (selectedChart == 'scatterplot' || 
				selectedChart == 'smscatterplot_industry' ||
				selectedChart == 'scatterplot_industry' ||
				selectedChart == 'scatterplot_industry_bounded') {
				/* 
					Visual Tech 5: Scatterplot 
					Visual Tech 6: Small Multiples of Scatterplot Specificly for Industry ID
					Visual Tech 7: Scatterplot specificly for Industry ID
					Visual Tech 8: Scatterplot specificly for Industry ID in a bounded space
				*/
				chart_data = aggregate({data: csvData,
					groupby_keys: [independent, first_candidate],
					agg_var: dependent});

				if (selectedChart == 'scatterplot_industry' || 
					selectedChart == 'scatterplot_industry_bounded') {
					// Log scale cannot include zero, filter zero
					chart_data = chart_data.filter(d => {
						return d[dependent] > 0;
					});
				}
			}

			/* ==================== View Space ==================== */
			if (selectedChart == 'heatmap' || selectedChart == 'heatmaplist') {
				/* Visual Tech 1: heatmap 
				   Visual Tech 2: heatmap with children node */
				d3.selectAll('.' + level + '.list.cell, ' + '.' + level + '.list.text')
					.transition()
					.style('visibility', 'hidden');

				if (selectedChart == 'heatmaplist') {
					viewVLWidth = 100;
				} 

				drawHeatmap({
					container : container,
					data	  : matrix_data,
					rowLabels : rowLabels,
					colLabels : colLabels,			
					subLabel  : '',
					selDep: dependent,
					selIndep: independent,
					height: matrixHeight,	
					level: level
				});
			} else if (selectedChart == 'coloredbarchart') {
				/* Visual Tech 3: colored bar chart */
				viewVLWidth = 210;
				viewVLHeight = 160;
				
				container.call(coloredBarChart, {
					chart_data: chart_data,
					width: viewVLWidth,
					height: viewVLHeight,
					childrenIdentityFlag: false,
					margin: { left: 50, top: 0, right: 0, bottom: 0 },
					yAxisLabel: dependent,	
					y_axis_scale: 'scaleLog',	
					y_axis_tick_num: 5,
					level: level,
					myColor: countryColor
				});
			} else if (selectedChart == 'interactheatmap') {
				/* Visual Tech 4: a heatmap with an interactable dimension */
				viewVLWidth = 210;
				viewVLHeight = 160;

				container.call(interactHeatmap, {
					margin: { left: 50, top: 0, right: 0, bottom: 0 },
					width: viewVLWidth,
					height: viewVLHeight,
					xValue: d => d[first_candidate],
					yValue: d => d[independent],
					x_var: first_candidate,
					y_var: independent,
					z_var: dependent,
					contextaul_vars: candidate_context_vars,
					csvData: csvData,
					level: level
				});

			} else if (selectedChart == 'scatterplot') {
				/* Visual Tech 5: Scatterplot */
				viewVLWidth = 250;
				viewVLHeight = 200;

				container.call(scatterPlot, {
					xValue: d => d[first_candidate],
					xAxisLabel: first_candidate,
					yValue: d => d[dependent],
					yAxisLabel: dependent,
					splitby: independent,
					circleRadius: 3,
					margin: { left: 50, top: 0, right: 0, bottom: 0 },
					width: viewVLWidth,
					height: viewVLHeight,
					relative_translate_y: -100,
					smallMultipleFlag: false,
					y_axis_scale: 'scaleLog', 
					y_axis_tick_num: 3,			
					chart_data: chart_data,
					myColor: countryColor,
					mark_opacity: 0.9,
					rowIndex: 'row' + rowIndex,
					level: level
				});

			} else if (selectedChart == 'smscatterplot_industry') {
				/* Visual Tech 6: Small Multiples of Scatterplot Specificly for Industry ID */
				viewVLWidth = 350;
				viewVLHeight = 240;
				
				container.call(small_multiple_scatterplot, {
					num_small_multiples: 4,
					margin: { left: 50, top: 0, right: 0, bottom: 0 },
					width: viewVLWidth,
					height: viewVLHeight,
					padding: 20,
					xAxisLabel: first_candidate,
					yAxisLabel: dependent,
					splitby: independent,
					chart_data: chart_data,
					myColor: countryColor,
					rowIndex: rowIndex,
					level: level
				});

			} else if (selectedChart == 'scatterplot_industry') {
				/* Visual Tech 7: Scatterplot specificly for Industry ID */
				viewVLWidth = 400;
				viewVLHeight = 100;

				container.call(scatterPlot, {
					xValue: d => d[first_candidate],
					xAxisLabel: first_candidate,
					yValue: d => d[dependent],
					yAxisLabel: dependent,
					splitby: independent,
					margin: { left: 50, top: 0, right: 0, bottom: 0 },
					width: viewVLWidth,
					height: viewVLHeight,
					relative_translate_y: -50,
					smallMultipleFlag: false,
					chart_name_suffix_flag: true,
					x_axis_scale: 'scaleLinear', 
					y_axis_scale: 'scaleLog', 
					y_axis_tick_num: 5,
					chart_data: chart_data,
					myColor: countryColor,
					mark_shape: 'rectangle',
					mark_width: 2,
					mark_height: 2,
					mark_opacity: 0.9,
					rowIndex: 'row' + rowIndex,
					level: level
				});

			} else if (selectedChart == 'scatterplot_industry_bounded') {
				/* Visual Tech 8: Scatterplot specificly for Industry ID in a bounded space */
				var scatterplot_industry_g = container.append("g")
												.attr("class", level + ' ' + dependent + ' ' + independent 
													+ ' virtuallayer scatterplot_industry_bounded')
												.attr('transform', `translate(${20},${-100})`);

				viewVLWidth = 400;
				viewVLHeight = 200;

				var foreignObject = scatterplot_industry_g.append("foreignObject")
										.attr("width", viewVLWidth)  
										.attr("height", viewVLHeight)
										.append("xhtml:div") 
										.attr("class", level + " scatterplot_industry_bounded div")
										.style("width", "600px") 
										.style("height", "100%")
										.style("overflow-x", "auto") 
										.style("white-space", "nowrap")
										.style("display", "block")
										//.style("border", "1px solid #ccc")  
										.style("border-radius", "2px")
										//.style("box-shadow", "inset 0 0 5px rgba(0, 0, 0, 0.1)") 
										//.style("border", "1px solid black");

				var scatterplot_industry_svg = d3.select(foreignObject.node())
												.append("svg")
												.attr("width", 1900)
												.attr("height", viewVLHeight);

				scatterplot_industry_svg.call(scatterPlot, {
					xValue: d => d[first_candidate],
					xAxisLabel: first_candidate,
					yValue: d => d[dependent],
					yAxisLabel: dependent,
					splitby: independent,
					margin: { left: 35, top: 0, right: 0, bottom: 0 },
					width: 1600,
					height: 100,
					relative_translate_y: 50,
					smallMultipleFlag: false,
					chart_name_suffix_flag: true,
					chart_name_suffix: 'bounded',
					x_axis_scale: 'scaleLinear', 
					y_axis_scale: 'scaleLog', 
					y_axis_tick_num: 5,
					chart_data: chart_data,
					myColor: countryColor,
					mark_shape: 'rectangle',
					mark_width: 8,
					mark_height: 2,
					mark_opacity: 0.9,
					rowIndex: 'row' + rowIndex,
					level: level
				});
			} else if (selectedChart == 'scatterplot1d' || selectedChart == 'scatterplot_level2'	) {
				/* 
					Level 2 - Visual Tech 1: 1d scatter plot 			
							  Visual Tech 2: Scatterplot 
				*/
				var maxHeight = 300;
				viewVLHeight = d.children[d.children.length - 1].x - d.children[0].x;

				if (viewVLHeight > maxHeight) {
					viewVLHeight = maxHeight;
				}

				secondLevelG1 = d3.select('#node_link_tree')
									.select('.level-2' + '.' + dependent + '.' + independent);

				var yColumn = "mean_distance";
				var xColumn = 'max_distance';

				if (selectedChart == 'scatterplot1d') {
					secondLevelG1.call(oneDimensionalScatterPlot, {
										yValue: d => d[yColumn],
										yAxisLabel: 'The Mean of Distances',
										circleRadius: globalCircleRadius,
										margin: { top: 0, right: 0, bottom: 0, left: 0 },
										height: viewVLHeight,
										chart_data: chart_data,
										chart_name: selectedChart,
										level: level
									});		

					// Hide the list circle
					d3.selectAll('.' + level + '.list.circle, ' + '.' + level + '.list.text')
						.transition()
						.style('visibility', 'hidden');

				} else if (selectedChart == 'scatterplot_level2') {
					// Apply the same width and height, and padding 50 pixels
					viewVLWidth = viewVLHeight + 50;

					secondLevelG1.call(oneDimensionalScatterPlot, {
										xValue: d => d[xColumn],
										xAxisLabel: 'The Maximum Distance',
										yValue: d => d[yColumn],
										yAxisLabel: 'The Mean of Distances',
										circleRadius: globalCircleRadius,
										margin: { top: 0, right: 0, bottom: 0, left: 50 },
										width: viewVLWidth,
										height: viewVLHeight,
										chart_data: chart_data,
										chart_name: selectedChart,
										rowIndex: 'row' + rowIndex,
										level: level
									});		
									

				}

			} 

			// Update global view size
			if (level == 'level1') {
				globalFirstLevelViewVLWidth = viewVLWidth;
				globalFirstLevelViewVLHeight = viewVLHeight;
			} else if (level == 'level2') {
				globalSecondLevelViewVLWidth = viewVLWidth;
				globalSecondLevelViewVLHeight = viewVLHeight;
			}

			/* ==================== Initialize Children Virtual Layer ==================== */
			if (level == 'level1') {
				// Create a rectangle for children VL in Level 1
				if (selectedChart == 'heatmaplist' ||
					selectedChart == 'coloredbarchart' ||
					selectedChart == 'interactheatmap' ||
					selectedChart == 'scatterplot' ||
					selectedChart == 'smscatterplot_industry' ||
					selectedChart == 'scatterplot_industry' ||
					selectedChart == 'scatterplot_industry_bounded') {

					// Identity data
					var single_object = {};
					var identity_data = [];
					single_object['dependent'] = dependent;
					single_object['independent'] = independent;
					single_object['value'] = getMatrixValue(matrix_data, dependent, independent);
					identity_data.push(single_object);

					childrenVLWidth = 20;
					var position_x = viewVLWidth;
					var position_y = 0;

					if (selectedChart == 'scatterplot_industry_bounded') {
						var padding = 20;
						childrenVLWidth += padding;
						position_x = viewVLWidth + padding;
					}
					
					container.call(initial_children_virtual_layer, {
						chart_name: selectedChart,
						identity_data: identity_data,
						position_x: position_x,
						position_y: position_y,
						level: level
					});
				} 
			} else if (level == 'level2') {
				// Create cycles for children VL in Level 2
				if (selectedChart == 'scatterplot_level2') {

					childrenVLWidth = 50; 
					
					var position_x = viewVLWidth + childrenVLWidth;
					var position_y = 0;					

					secondLevelG1.call(initial_level2_children_virtual_layer, {
										chart_name: selectedChart,
										identity_data: chart_data,
										position_x: position_x,
										position_y: viewVLHeight,
										level: level
					});
				}
			}

			rowIndex = rowIndex + 1;
		});

		/* ==================== Node-link Diagram Adjustment ==================== */
		// Tree Size adjustment
		if (level == 'level1') {
			globalFirstLevelWidth = viewVLWidth + childrenVLWidth;
			globalFirstLevelChildrenVLWidth = childrenVLWidth;

			// Adjust first level width
			adjustWidth({
				firstLevelWidth: globalFirstLevelWidth, 
				seoncdLevelParentVLWidth: globalSecondLevelParentVLWidth,
				secondLevelWidth: globalSecondLevelWidth,
				addWidth: 0, 
				thirdLevelParentVLWidth: globalThirdLevelParentVLWidth,
				layerType: 'view',
				level: 'level1'});

			// Hide children text
			d3.selectAll('.'+level + '.children.text')
						.style('visibility', 'hidden');

		} else if (level == 'level2') {

			globalSecondLevelWidth = viewVLWidth + childrenVLWidth;
			globalSecondLevelChildrenVLWidth = childrenVLWidth;
			
			// Adjust second level width
			adjustWidth({
				firstLevelWidth: globalFirstLevelWidth, 
				seoncdLevelParentVLWidth: globalSecondLevelParentVLWidth,
				secondLevelWidth: globalSecondLevelWidth,
				addWidth: 0, 
				thirdLevelParentVLWidth: globalThirdLevelParentVLWidth,
				layerType: 'view',
				level: 'level2'});
		}

		// Tree path adjustment
		if (globalFirstLevelView == 'heatmap') {
			if (globalSecondLevelView == 'list') {
				// Update path for level 0 and level 1
				d3.select('#node_link_tree').selectAll('.path')
					.attr('d', function(d, i) {
						return d.source.depth < 2 ? globalMatrixLinkPathGenerator(d, i, 'heatmap', matrixHeight)
											: globalLinkPathGenerator(d)
					})			
			} else if (globalSecondLevelView == 'scatterplot1d') {
				d3.select('#node_link_tree').selectAll('.path')
					.attr('d', function(d, i) {
						return d.source.depth < 1 ? globalMatrixLinkPathGenerator(d, i, 'heatmap', matrixHeight)
							: globalScatterplot1dLinkPathGenerator(d, i, 'heatmap', matrixHeight);
					})
			}
		} else {
			if (globalSecondLevelView == 'list' || globalSecondLevelView == 'scatterplot_level2') {
				d3.select('#node_link_tree').selectAll('.path')
					.attr('d', function(d, i) {
						return d.source.depth < 1 ? globalMatrixLinkPathGenerator(d, i, 'list', matrixHeight) 
											: globalLinkPathGenerator(d);
					})	
			} else if (globalSecondLevelView == 'scatterplot1d') {
				d3.select('#node_link_tree').selectAll('.path')
					.attr('d', function(d, i) {
						return d.source.depth < 1 ? globalMatrixLinkPathGenerator(d, i, 'list', matrixHeight)
												: globalScatterplot1dLinkPathGenerator(d, i);
					})
			}
		} 
		
		if (globalFirstLevelView == 'heatmaplist') {
			// Hide path for level 0
			d3.select('#node_link_tree')
				.selectAll('.path.level0')
				.style('visibility', 'hidden');
		}

		// Hide all identity buttons (parent and children)
		d3.selectAll('.' + level + '.parent.identity.button, ' + '.' + level + '.children.identity.button')
			.selectAll('rect, text')
			.style('visibility', 'hidden');
		
		const identityButtonCounts = {
				"scatterplot": 7,
				"interactheatmap": 3,
				"scatterplot_level2": 2
		};

		// Show only the buttons relevant to the selected chart
		if (Object.keys(identityButtonCounts).includes(selectedChart)) {
			const count = identityButtonCounts[selectedChart];

			for (let i = 0; i < count; i++) {
				d3.selectAll('.' + level + '.parent.identity.button.index' + i)
					.selectAll('rect, text')
					.style('visibility', 'visible');

				d3.selectAll('.' + level + '.children.identity.button.index' + i)	
					.selectAll('rect, text')
					.style('visibility', 'visible');
			}
		}
	



/*===========WORKING====================>
							// Level 1 keep both view and identity
							if (level == "level1") {
								// Reset first level width
								firstLevelWidth = firstLevelWidth - firstLevelParentVLWidth
														- firstLevelChildrenVLWidth;

								// Adjust first level width
								adjustWidth({
									firstLevelWidth: firstLevelWidth, 
									addWidth: 0, 
									thirdLevelParentVLWidth: thirdLevelParentVLWidth,
									level: 'level1'});

								// reset first level VL width 
								firstLevelParentVLWidth = 0;
								firstLevelChildrenVLWidth = 0;

								// set default position for list text
								// TODO list text alignment
								if (i == 3 || i == 4) {
									d3.selectAll('.'+level + '.list.text')
										.transition()
										.attr("x", "-10px")			
										.style("text-anchor", "start");					
								} else {
									d3.selectAll('.'+level + '.list.text')
										.transition()
										.attr("x", 0)	
										.style("text-anchor", "middle");
								}										

								if ([2, 3, 4, 5, 6, 7, 8].includes(i)) {
									d3.selectAll('.'+level+'.list')
										.transition()
										.style('visibility', 'visible');

									d3.selectAll('.'+level + '.list.text')
										.transition()
										.style('visibility', 'hidden');

									if (i == 2) {
										d3.selectAll('.'+level + '.heatmap')
										.transition()
										.style('visibility', 'visible');											
									} 
										
									firstLevelViewVLWidth = 0;

									if (i == 2) {
										firstLevelViewVLWidth = addWidthArray[0];
									} else if (selectedChart == 'coloredbarchart' ) {
										firstLevelViewVLWidth = addWidthArray[1] + 70;
									} else if (selectedChart == 'scatterplot') {
										// Scatterplot
										firstLevelViewVLWidth = addWidthArray[1] + 110;
									} else if (selectedChart == 'genericheatmap' ) {
										firstLevelViewVLWidth = addWidthArray[1] + 70;
									} else if (selectedChart == 'smscatterplot_industry' ) {
										firstLevelViewVLWidth = addWidthArray[1] + 260;
								 	} else if (selectedChart == 'scatterplot_industry') {
										firstLevelViewVLWidth = addWidthArray[1] + 310;
									} else if (selectedChart == 'scatterplot_industry_bounded') {
										firstLevelViewVLWidth = addWidthArray[1] + 280;
									} else if (i == 5 || i == 6) {
										firstLevelViewVLWidth = addWidthArray[1];
									}

									var newWidth = width + firstLevelViewVLWidth
													 + secondLevelWidth + thirdLevelParentVLWidth;
									
									// Change the global variable firstLevelWidth
									firstLevelWidth = firstLevelViewVLWidth;

									// Change SVG size
									d3.select('#node_link_tree svg')
										.attr('width', newWidth)
										.attr('height', treeHeight);	

									// Adjust level 1 nodes x postion
									//d3.selectAll('.level1.list')
									//	.transition()
									//	.attr("transform", function() { 
									//		return "translate(" + firstLevelWidth + "," + 0 + ")"; });		

									// Adjust level 1 nodes x postion
									d3.selectAll('.node.level-1')
										.transition()
										.attr("transform", function(d,i) { 
											return "translate(" + d.y + "," + d.x + ")"; });	

									// Adjust level 1 nodes x postion
									d3.selectAll('.level1.list')
										.transition()
										.attr("transform", "translate(0, 0)");

									var addHeight = 0;
									if (selectedChart == 'coloredbarchart') {
										addHeight = addHeightArray[0];
									} else if (selectedChart == 'scatterplot') {
										addHeight = addHeightArray[1];
									} else if (selectedChart == 'genericheatmap') {
										addHeight = addHeightArray[0];
									} else if (selectedChart == 'smscatterplot_industry') {
										addHeight = addHeightArray[2];
									} else if (selectedChart == 'scatterplot_industry_bounded') {
										addHeight = addHeightArray[1];
									}

									newViewHeight = height + addHeight;

									// Adjust level 1 children rect x postion
									// TODO may simplify
									d3.selectAll('.level1.initialvirtuallayer.children.rect')
										//.transition()
										.attr('transform', `translate(${-50},${newViewHeight/2})`);

									if (selectedChart == 'smscatterplot_industry' ) {
										d3.selectAll('.'+level + '.children.text')
											.attr("y", addHeight/2 + 20);	
									}

									// Adjust level 2 nodes x postion
									d3.selectAll('.node.level-2')
										.transition()
										.attr("transform", function(d,i) { 
											var postion_x = d.y + firstLevelWidth;
											return "translate(" + postion_x + "," + d.x + ")"; });	
									
									// Adjust level 3 nodes x postion
									d3.selectAll('.node.level-3')
										.transition()
										.attr("transform", function(d,i) { 
											var postion_x = d.y + firstLevelWidth 
														+ secondLevelWidth + thirdLevelParentVLWidth;
											return "translate(" + postion_x + "," + d.x + ")"; });	

									// Adjust level 2 button x postion
									d3.selectAll('.button.level2')
										.each(function () {
											d3.select(this)
												.attr("transform",  "translate(" + firstLevelWidth + ", 0)")
										});	
									
									// Adjust level 3 button x postion
									d3.selectAll('.button.level3')
										.each(function () {
											d3.select(this)
												.attr("transform",  
												"translate(" + (firstLevelWidth 
														+ secondLevelWidth) + ", 0)")
										});	

									// Move level 1 paths
									d3.selectAll('.path.level1')
										.each(function (d) {
											d3.select(this)
												.attr("transform",  "translate(" + firstLevelWidth + ", 0)")
										});	

									// Move level 2 paths
									d3.selectAll('.path.level2')
										.each(function (d) {
											d3.select(this)
												.attr("transform",  
												"translate(" + (firstLevelWidth + secondLevelWidth) + ", 0)")
									});											
								} else {
									// Reset first level width
									firstLevelWidth = 0;

									// Change SVG size
									d3.select('#node_link_tree svg')
									.attr('width', width + secondLevelWidth)
									.attr('height', treeHeight);

									// Adjust level 1 nodes x postion
									d3.selectAll('.level1.list')
										.transition()
										.attr("transform", "translate(0, 0)");

									// Adjust level 2 nodes x postion
									d3.selectAll('.node.level-2')
										.transition()
										.attr("transform", function(d) { 
											return "translate(" + d.y + "," + d.x + ")"; });											

									// Adjust level 3 nodes x postion
									d3.selectAll('.node.level-3')
										.transition()
										.attr("transform", function(d) { 
											return "translate(" + (d.y + secondLevelWidth 
												+ thirdLevelParentVLWidth) + "," + d.x + ")"; });											

									// Adjust level 2 button x postion
									d3.selectAll('.button.level2')
										.each(function () {
											d3.select(this)
												.attr("transform",  "translate(0, 0)")
										});	
									
									// Adjust level 3 button x postion
									d3.selectAll('.button.level3')
										.each(function () {
											d3.select(this)
												.attr("transform",  "translate(" + secondLevelWidth + ", 0)")
										});	

									// Move level 1 paths
									d3.selectAll('.path.level1')
										.each(function () {
											d3.select(this)
											.attr("transform",  "translate(0, 0)")
										});

									// Move level 2 paths
									d3.selectAll('.path.level2')
										.each(function () {
											d3.select(this)
											.attr("transform",  "translate(" + secondLevelWidth + ", 0)")
										});										
								}
							}


							// TODO redesign for different interactions for visual alternative
							// and visual detail view  

							if (level == "level3") {
								level3_state = selectedChart;
								
								thirdLevelParentVLWidth = 0;

								d3.selectAll('.'+level + '.rect')
									.transition()
									.style('visibility', 'visible');	
								d3.selectAll('.'+level + '.singlecountrymap')
										.transition()
										.style('visibility', 'hidden');	
								
								d3.selectAll('.node.level-3')
									.transition()
									.attr("transform", function(d,i) { 
										var postion_x = d.y + firstLevelWidth 
										+ secondLevelWidth + thirdLevelParentVLWidth;

										return "translate(" + postion_x + "," + d.x + ")"; });		

								d3.selectAll('.' + level + '.list.rect, ' + '.' + level + '.list.text')
									.attr("transform", function(d,i) { 
									return "translate(" + 0 + "," + 0 + ")"; });									

								// Remove all interactive charts from leaf nodes
								d3.selectAll('.level-3.interact').remove();
								d3.selectAll(".level3.list.rect")
									.style("stroke-opacity", 0.3);

								if (selectedChart == 'countrymap' 
										|| selectedChart == 'barchart'
										|| selectedChart == 'genericheatmap' 
										|| selectedChart == 'smscatterplot_year'
										|| selectedChart == 'smscatterplot_industry'
										|| selectedChart == 'smscatterplot_industry_all'
										|| selectedChart == 'smscatterplot_industry_all_bounded') {
									d3.selectAll('.'+level + '.text')
										.transition()
										.style('visibility', 'visible');	
								}
							}
<===============WORKING=============*/
/*===============WORKING=============>
							// Path
							if (level == "level1") {
								// Hide all path for level 0 and level 1
								d3.selectAll('.path.level0')
										.transition()
										.style('visibility', 'hidden');
								d3.selectAll('.path.level1')
										.transition()
										.style('visibility', 'hidden');

								// Level 0 path
								d3.selectAll('.path.list.level0')
									.transition()
									.style('visibility', [0, 3, 4, 5, 6, 7, 8].includes(i) ? 'visible' : 'hidden');								
								d3.selectAll('.path.heatmap.level0')
									.transition()
									.style('visibility', (i == 1 || i == 2) ? 'visible' : 'hidden');	
								// Level 1 path
								// Check Level 2's visual technique
								if ((d3.select('.level2.scatterplot1d').style("visibility") == 'hidden')
									&& (d3.select('.level2.scatterplot2d').style("visibility") == 'hidden')) {
									// Level 1: list/heatmap; 

									// Level 2: list
									d3.selectAll('.path.list.node.level1')
										.transition()
										.style('visibility', [0, 3, 4, 5, 6, 7, 8].includes(i) ? 'visible' : 'hidden');
									d3.selectAll('.path.heatmap.node.level1')
										.transition()
										.style('visibility', (i == 1 || i == 2) ? 'visible' : 'hidden');	

								} else {
									// Level 1: list/heatmap; level 2: scatterplot1d/scatterplot2d
									d3.selectAll('.path.list.scatterplot1d.level1')
										.transition()
										.style('visibility', (i == 0 || i == 3 || i == 4 || i == 5) ? 'visible' : 'hidden');
									d3.selectAll('.path.heatmap.scatterplot1d.level1')
										.transition()
										.style('visibility', (i == 1 || i == 2) ? 'visible' : 'hidden');	
								}

								if (i == 2) {
									// View and identity
									d3.selectAll('.path.list.level0')
										.transition()
										.style('visibility', 'hidden');									
									d3.selectAll('.path.heatmap.level0')
										.transition()
										.style('visibility', 'hidden');		
										
									if ((d3.select('.level2.scatterplot1d').style("visibility") == 'hidden')
										&& (d3.select('.level2.scatterplot2d').style("visibility") == 'hidden')) {
										// Level 1: list/heatmap; 
										// Level 2: list
										d3.selectAll('.path.list.node.level1')
											.transition()
											.style('visibility', 'visible');
										d3.selectAll('.path.heatmap.node.level1')
											.transition()
											.style('visibility', 'hidden');	

									} else {
										// Level 1: list/heatmap; level 2: scatterplot1d/scatterplot2d
										d3.selectAll('.path.list.scatterplot1d.level1')
											.transition()
											.style('visibility', 'visible');	
										d3.selectAll('.path.heatmap.scatterplot1d.level1')
											.transition()
											.style('visibility', 'hidden');	
									}	
								}

							} else if (level == "level2") {
								if (i == 2 || i ==3) {
									// Scatterplot2d
									secondLevelWidth = 
										Math.max.apply(Math, addWidthArray.map(function(o) { 
											return o.value; }))

									var newWidth = width + secondLevelWidth + firstLevelWidth;

									// TODO not sure how tree layout will be affected
									//treeLayout.size(newWidth, height);
									
									// Change SVG size
									d3.select('#node_link_tree svg')
										.attr('width', newWidth)
										.attr('height', treeHeight);

									// Adjust level 3 nodes x postion
									d3.selectAll('.node.level-3')
										.transition()
										.attr("transform", function(d,i) { 
											var parentKey = d.parent.parent.data.key;
											var addWidth = addWidthArray.find( ({ key }) => key === parentKey );

											var postion_x = d.y + addWidth.value + firstLevelWidth;
											return "translate(" + postion_x + "," + d.x + ")"; });											

									// Adjust level 3 button x postion
									d3.selectAll('.button.level3')
										.each(function () {
											d3.select(this)
												.attr("transform",  "translate(" + (addWidth.value + firstLevelWidth) + ", 0)")
										});												

									// Move level 2 paths
									d3.selectAll('.path.level2')
										.each(function (d) {
											var parentKey = d.source.parent.data.key;
											var addWidth = addWidthArray.find( ({ key }) => key === parentKey );

											d3.select(this)
												.attr("transform",  "translate(" + (addWidth.value + firstLevelWidth) + ", 0)")
										});
								} else {
									// list and scatterplot1d 
									// reset second level width
									secondLevelWidth = 0;

									// Check Level 2's visual technique
									if (d3.select('.level2.scatterplot2d').style("visibility") == 'visible'
										|| d3.select('.level2.barchart').style("visibility") == 'visible') {
										// reset position for level3 nodes and level2 path
										
										// TODO not sure how tree layout will be affected
										//treeLayout.size(newWidth, height);
										
										// Change SVG size
										d3.select('#node_link_tree svg')
											.attr('width', width + firstLevelWidth)
											.attr('height', treeHeight);
	
										// Adjust level 3 nodes x postion
										d3.selectAll('.node.level-3')
											.transition()
											.attr("transform", function(d) { 
												return "translate(" + (d.y + firstLevelWidth) + "," + d.x + ")"; });											
									
										// Adjust level 3 button x postion
										d3.selectAll('.button.level3')
											.each(function () {
												d3.select(this)
													.attr("transform",  "translate(" + firstLevelWidth + ", 0)")
											});	

										// Move level 2 paths
										d3.selectAll('.path.level2')
											.each(function () {
												d3.select(this)
												.attr("transform",  "translate(" + firstLevelWidth + ", 0)")
											});									
									}
								}

								// Hide all path for level 1 and level 2
								d3.selectAll('.path.level1')
										.transition()
										.style('visibility', 'hidden');
								d3.selectAll('.path.level2')
										.transition()
										.style('visibility', 'hidden');

								// Level 1 path
								// Check Level 1's visual technique
								if (d3.select('.level1.heatmap').style("visibility") == 'hidden') {
									// Level 1: list; 
									// level 2: list/scatterplot1d/scatterplot2d/barchart
									d3.selectAll('.path.list.node.level1')
										.transition()
										.style('visibility', i == 0 ? 'visible' : 'hidden');
									d3.selectAll('.path.list.scatterplot1d.level1')
										.transition()
										.style('visibility', (i == 1 || i == 2) ? 'visible' : 'hidden');
									d3.selectAll('.path.list.barchart.level1')
											.transition()
											.style('visibility', i == 3 ? 'visible' : 'hidden');												
								} else {
									// Level 1: heatmap; 
									// level 2: list/scatterplot1d/scatterplot2d/barchart
									d3.selectAll('.path.heatmap.node.level1')
										.transition()
										.style('visibility', i == 0 ? 'visible' : 'hidden');	
									d3.selectAll('.path.heatmap.scatterplot1d.level1')
										.transition()
										.style('visibility', (i == 1 || i == 2) ? 'visible' : 'hidden');
									d3.selectAll('.path.heatmap.barchart.level1')
										.transition()
										.style('visibility', i == 3 ? 'visible' : 'hidden');

									if (d3.select('.level1.list').style("visibility") == 'visible') {
										d3.selectAll('.path.heatmap.scatterplot1d.level1')
											.transition()
											.style('visibility', 'hidden');	

										d3.selectAll('.path.heatmap.node.level1')
											.transition()         
											.style('visibility', 'hidden');												

										d3.selectAll('.path.list.node.level1')
											.transition()
											.style('visibility', i==0 ? 'visible' : 'hidden');											
										
										d3.selectAll('.path.list.scatterplot1d.level1')
											.transition()
											.style('visibility', (i == 1 || i == 2) ? 'visible' : 'hidden');										
										
										d3.selectAll('.path.list.barchart.level1')
											.transition()
											.style('visibility', i == 3 ? 'visible' : 'hidden');
											
										d3.selectAll('.path.heatmap.barchart.level1')
											.transition()
											.style('visibility', 'hidden');
									}		
								}
								// Level 2 path
								d3.selectAll('.path.list.node.level2')
									.transition()
									.style('visibility', i == 0 ? 'visible' : 'hidden');									
								d3.selectAll('.path.scatterplot1d.level2')
									.transition()
									.style('visibility', (i == 1 || i == 2 )? 'visible' : 'hidden');	
								d3.selectAll('.path.barchart.level2')
									.transition()
									.style('visibility', i == 3 ? 'visible' : 'hidden');
							}
<===============WORKING=============*/
	});


	var bWidth= 35; //button width
	var bHeight= 22; //button height
	var bSpace= 5; //space between buttons
	var x0= 0; //x offset
	var y0= 0; //y offset

	//adding a rect to each toggle button group
	//rx and ry give the rect rounded corner
	levelButtonGroups.append("rect")
				.attr("class","buttonRect")
				.attr("transform", "translate(" + 0 + "," + 3 + ")")
				.attr("width",bWidth)
				.attr("height",bHeight)
				//.attr("x",function(d,i) {return x0+(bWidth+bSpace)*i;})
				//.attr("y",y0)				
				.attr("x",function(d,i) {var col = i%3; return x0+(bWidth+bSpace)*col;})
				.attr("y",function(d,i) {var row = Math.floor(i/3); return y0 + (bHeight+bSpace)*row })
				.attr("rx",5) //rx and ry give the buttons rounded corners
				.attr("ry",5)
				.attr("fill","#797979")

    //adding text to each toggle button group, centered 
    //within the toggle button rect
    levelButtonGroups.append("text")
                .attr("class","buttonText")
                .attr("font-family","FontAwesome")
				.attr("transform", "translate(" + 0 + "," + 3 + ")")
                .attr("x",function(d,i) {
					//return x0 + (bWidth+bSpace)*i + bWidth/2;
					var index = i%3;
                    return x0 + (bWidth+bSpace)*index + bWidth/2;
                })
				//.attr("y",y0+bHeight/2)
                .attr("y",function(d,i) {
					var row = Math.floor(i/3);
					return y0+bHeight/2 + (bHeight+bSpace)*row;
				})
                .attr("text-anchor","middle")
                .attr("alignment-baseline", "middle")
				//.attr("dominant-baseline","central")
                .attr("fill","white")
                .text(function(d) {return d;})

}