const interact_parent_button = (selection, props) => {
	const {
		parentIdentityLabels,
		levelG,
        level
	} = props;

	var parentIdentityButtonGroups = selection.selectAll("g." + level + ".parent.identity.button")
										.data(parentIdentityLabels)
										.enter()
										.append("g")
										.attr("class", function(d, i) {
											return level + " parent identity button index" + i;
										})
										.style("cursor","pointer")
										.on("click",function(d, i) {

		updateButtonColors(d3.select(this), d3.select(this.parentNode));
	
		// Reset
		if (level == 'level1') {
			globalFirstLevelWidth = globalFirstLevelWidth - globalFirstLevelParentVLWidth;
			globalFirstLevelParentVLWidth = 0;

			selectedChart = globalFirstLevelView;
		} else if (level == 'level2') {
			globalSecondLevelWidth = globalSecondLevelWidth - globalSecondLevelParentVLWidth;
			globalSecondLevelParentVLWidth = 0;

			selectedChart = globalSecondLevelView;
		} else if (level == 'level3') {
			selectedChart = globalThirdLevelView;
		}

		d3.selectAll('.'+ level +'.list.cell')
			.transition().style('visibility', "visible");

		// Reset parent rect
		d3.selectAll('.'+ level +'.list.cell')
			.attr("y", -10)
			.attr("height", 20);

		// Remove existing virtual layer
		d3.selectAll('.' + level + '.parent.virtuallayer').remove();

		// Reset third level
		if (level == 'level3') {
			globalThirdLevelParentVLWidth = 0;

			// Adjust third level
			d3.selectAll('.node.level-3')
				.transition()
				.attr("transform", function(d,i) { 
					var postion_x = d.y + globalFirstLevelWidth 
									+ secondLevelWidth + globalThirdLevelParentVLWidth;
					return "translate(" + postion_x + "," + d.x + ")"; });	

			// Reset the position by overwriting
			d3.selectAll('.' + level + '.list.rect, ' + '.' + level + '.list.text')
					.attr("transform", function(d,i) { 
					return "translate(" + 0 + "," + 0 + ")"; });
		}

		d3.selectAll('.'+ level +'.list.rect')
			.transition().style('visibility', "visible");

		d3.selectAll('.'+level + '.singlecountrymap')
			.transition()
			.style('visibility', 'hidden');	

		/*d3.selectAll('.' + level + '.list.rect, ' + '.' + level + '.list.text')
			.attr("transform", function(d,i) { 
			return "translate(" + firstLevelWidth + "," + 0 + ")"; });
*/
		/*
		if (i == 0) {
			var addWidth4Lable = 0;

			if (trendType == "pearson_corr") {
				if (d3.select('.level1.heatmapdensity').style("visibility") == 'visible') {
					addWidth4Lable = 30;
					firstLevelParentVLWidth = addWidth4Lable;

					var addTotalWidthVL = firstLevelParentVLWidth + firstLevelChildrenVLWidth;

					// Adjust Total Space
					adjustTotalWidth({
						firstLevelWidth: firstLevelWidth, 
						firstLevelParentVLWidth: firstLevelParentVLWidth,
						addTotalWidthVL: addTotalWidthVL,
						resetFlag: true
					})

					//adjustWidth({
					//	firstLevelWidth: firstLevelWidth, 
					//	addWidth: firstLevelParentVLWidth + firstLevelChildrenVLWidth, 
					//	level: 'level1'});
				}
			} else if (trendType == 'rank_trend') {
				adjustWidth({
					firstLevelWidth: firstLevelWidth, 
					addWidth: firstLevelChildrenVLWidth, 
					level: 'level2'});

				if (level == "level1") {
					if (d3.select('.level1.genericheatmap').style("visibility") == 'visible') {
						d3.selectAll('.'+level + '.genericheatmap.children.text')
							.transition()
							.style('visibility', 'visible');
					}
				}

				if (level == "level3") {

					if (d3.select('.level3.countrymap').style("visibility") == 'visible') {

						d3.selectAll('.'+level + '.rect')
							.transition()
							.style('visibility', 'visible');	

						d3.selectAll('.'+level + '.singlecountrymap')
							.transition()
							.style('visibility', 'hidden');	
					}
				}
			}

			d3.selectAll('.'+ level +'.list.cell')
				.transition()
				.attr('transform', `translate(${0 - addWidth4Lable},${0})`);
				//.attr("x", 30);
		}
		
		if (i == 1) {
			if (trendType == 'pearson_corr') {
				if (d3.select('.level1.doublehistogram').style("visibility") == 'visible'
				|| d3.select('.level1.scatterplot').style("visibility") == 'visible') {

					adjustWidth({
						firstLevelWidth: firstLevelWidth, 
						addWidth: firstLevelChildrenVLWidth, 
						level: 'level2'});

					d3.selectAll('.'+ level +'.list.cell')
						.transition()
						.attr("y", 0)
						.attr("height", height)
						.attr('transform', `translate(${0},${-height/2})`);

				} else if (d3.select('.level1.heatmapdensity').style("visibility") == 'visible') {

					addWidth4Lable = 30;
					firstLevelParentVLWidth = addWidth4Lable;
					
					var addTotalWidthVL = firstLevelParentVLWidth + firstLevelChildrenVLWidth;

					// Adjust Total Space
					adjustTotalWidth({
						firstLevelWidth: firstLevelWidth, 
						firstLevelParentVLWidth: firstLevelParentVLWidth,
						addTotalWidthVL: addTotalWidthVL,
						resetFlag: true
					})

					d3.selectAll('.'+ level +'.list.cell')
						.transition()
						.attr("y", 0)
						.attr("height", height)
						.attr('transform', `translate(${-addWidth4Lable},${-height/2})`);
				}

				if (d3.select('.level1.histogram').style("visibility") == 'visible') {
					firstLevelParentVLWidth = 60;
					var addTotalWidthVL = firstLevelParentVLWidth + firstLevelChildrenVLWidth;
					// Adjust Total Space
					adjustTotalWidth({
						firstLevelWidth: firstLevelWidth, 
						firstLevelParentVLWidth: firstLevelParentVLWidth,
						addTotalWidthVL: addTotalWidthVL,
						resetFlag: true
					})

					// Call Virtual Layer
					levelG.call(small_multiples_virtual_layer, {
						width: firstLevelWidth,
						height: 30,
						offset_x: -10,
						offset_y: 35,
						virtualLayerWidth: firstLevelParentVLWidth,
						rectWidth: 20,
						rectHeight: 20,
						matrix_data: matrix_data,
						side: 'parent',
						level: 'level1'
					});	

				}
			} else if (trendType == 'rank_trend') {


				if (level == "level3") {
					if (d3.select('.level3.countrymap').style("visibility") == 'visible') {
						// TODO hardcode issue for exporter and importer
						d3.selectAll('.'+level + '.rect' + '.splitby_importer'
							+',.'+level + '.rect' + '.splitby_exporter')
							.transition()
							.style('visibility', 'hidden');	

						d3.selectAll('.'+level + '.singlecountrymap')
							.transition()
							.style('visibility', 'visible');	
					}
				}
			}
		}

		if (i == 2) {

			if (trendType == 'pearson_corr') {
				if (d3.select('.level1.doublehistogram').style("visibility") == 'visible'
						|| d3.select('.level1.histogram').style("visibility") == 'visible') {
					firstLevelParentVLWidth = 40;
				} 

				if (d3.select('.level1.heatmapdensity').style("visibility") == 'visible') {
					addWidth4Lable = 30;
					firstLevelParentVLWidth = addWidth4Lable;
				} 
			} 



			if (trendType == 'pearson_corr') {
				if (d3.select('.level1.doublehistogram').style("visibility") == 'visible') {
					// Call Virtual Layer
					levelG.call(doubleHistogram_virtual_layer, {
						width: firstLevelWidth,
						height: height,
						parentVLWidth: firstLevelParentVLWidth,
						axis_x_position: 15,
						side: 'parent',
						aux_flag: false,
						level: 'level1'
					});	
				}

				if (d3.select('.level1.histogram').style("visibility") == 'visible') {
					// Call Virtual Layer
					levelG.call(histogram_virtual_layer, {
						width: firstLevelWidth,
						height: 30,
						source_offset_y: 0,
						offset_y: -35,
						virtualLayerWidth: firstLevelParentVLWidth,
						axis_x_position: 15,
						side: 'parent',
						multi_no: 'h1',
						aux_flag: false,
						level: 'level1'
					});	

					levelG.call(histogram_virtual_layer, {
						width: firstLevelWidth,
						height: 30,
						source_offset_y: 0,
						offset_y: 35,
						virtualLayerWidth: firstLevelParentVLWidth,
						axis_x_position: 15,
						side: 'parent',
						multi_no: 'h2',
						aux_flag: false,
						level: 'level1'
					});	

					if (d3.select('.level1.scatterplot').style("visibility") == 'visible') {
						// Call Virtual Layer
						levelG.call(scatterplot_virtual_layer, {
							width: firstLevelWidth,
							height: height,
							parentVLWidth: firstLevelParentVLWidth,
							axis_x_position: 15,
							side: 'parent',
							level: 'level1'
						});	
					}
				}

				if (d3.select('.level1.heatmapdensity').style("visibility") == 'visible') {
					// Hide node
					d3.selectAll('.'+ level +'.list.cell')
						.transition().style('visibility', "hidden");

					levelG.call(heatmapDensity_virtual_layer, {
						x_position: 0,
						height: 100,
						chart_data: csvData,
						offset_flag: false,
						side: 'parent',
						parentVLWidth: firstLevelParentVLWidth,
						level: 'level1'
					});	
				}
			}
		}

		if (i == 3) {
			if (trendType == 'pearson_corr') {
				if (d3.select('.level1.heatmapdensity').style("visibility") == 'visible') {

					var addWidth4Lable = 30;
					firstLevelParentVLWidth = addWidth4Lable + 25;
					var addTotalWidthVL = firstLevelParentVLWidth + firstLevelChildrenVLWidth;
					// Adjust Total Space
					adjustTotalWidth({
						firstLevelWidth: firstLevelWidth, 
						firstLevelParentVLWidth: firstLevelParentVLWidth,
						addTotalWidthVL: addTotalWidthVL,
						resetFlag: false
					})

					d3.selectAll('.'+ level +'.list.cell')
						.transition()
						//.attr("x", -firstLevelParentVLWidth - 10)
						.attr("y", 0)
						.attr("height", height)
						.attr('transform', `translate(${-firstLevelParentVLWidth},${-height/2})`);

					levelG.call(heatmapDensity_virtual_layer, {
							x_position: 0,
							height: 100,
							chart_data: csvData,
							offset_flag: false,
							side: 'parent',
							parentVLWidth: addWidth4Lable,
							level: 'level1'
						});	
				}

				if (d3.select('.level1.histogram').style("visibility") == 'visible') {
					firstLevelParentVLWidth = 60;
					var addTotalWidthVL = firstLevelParentVLWidth + firstLevelChildrenVLWidth;
					// Adjust Total Space
					adjustTotalWidth({
						firstLevelWidth: firstLevelWidth, 
						firstLevelParentVLWidth: firstLevelParentVLWidth,
						addTotalWidthVL: addTotalWidthVL,
						resetFlag: true
					})

					// Call Virtual Layer
					levelG.call(small_multiples_virtual_layer, {
						width: firstLevelWidth,
						height: 30,
						offset_x: -10,
						offset_y: 35,
						virtualLayerWidth: firstLevelParentVLWidth,
						rectWidth: 20,
						rectHeight: 20,
						matrix_data: matrix_data,
						side: 'parent',
						level: 'level1'
					});	

					firstLevelParentVLWidth = 100;
					addTotalWidthVL = firstLevelParentVLWidth + firstLevelChildrenVLWidth;

					// Adjust Total Space
					adjustTotalWidth({
						firstLevelWidth: firstLevelWidth, 
						firstLevelParentVLWidth: firstLevelParentVLWidth,
						addTotalWidthVL: addTotalWidthVL,
						resetFlag: true
					})

					// Reset the x position for first virtual layer
					d3.selectAll('.' + level + '.smallmultiple.g')
						.transition()
						.attr("transform", function(d,i) { 
							return "translate(" + (-40) + "," + 0 + ")"; });	

					// Call Histogram Virtual Layer
					levelG.call(histogram_virtual_layer, {
						width: firstLevelWidth,
						height: 30,
						source_offset_y: -35,
						offset_y: -35,
						virtualLayerWidth: 40,
						axis_x_position: 15,
						side: 'parent',
						multi_no: 'h1',
						aux_flag: false,
						level: 'level1'
					});	

					levelG.call(histogram_virtual_layer, {
						width: firstLevelWidth,
						height: 30,
						source_offset_y: 35,
						offset_y: 35,
						virtualLayerWidth: 40,
						axis_x_position: 15,
						side: 'parent',
						multi_no: 'h2',
						aux_flag: false,
						level: 'level1'
					});	
				}
			}
		}
		*/

		// Start to use selectedChart=================================>
		// Common VL option for all charts
		if (i == 0) {
			if (level == "level1") {
				if (selectedChart == "genericheatmap") {
					d3.selectAll('.'+level + '.genericheatmap.children.text')
						.transition()
						.style('visibility', 'visible');

					d3.selectAll('.'+ level +'.list.cell')
						.transition()
						.attr('transform', `translate(${0},${0})`);
				}
			} else if (level == "level2") {
				// Show level 1 path
				d3.selectAll('.level1.path')
					.transition()
					.style('visibility', 'visible');

				// Show the list circle
				d3.selectAll('.' + level + '.list.circle, ' + '.' + level + '.list.text')
					.transition()
					.style('visibility', 'visible');	
			}

		}

		if (i == 1) {
			d3.selectAll('.'+ level +'.' + selectedChart + '.children.text')
			.transition()
			.attr("x", -25);

			adjustWidth({
				firstLevelWidth: globalFirstLevelWidth, 
				secondLevelWidth: globalSecondLevelWidth,
				addWidth: globalFirstLevelChildrenVLWidth, 
				thirdLevelParentVLWidth: globalThirdLevelParentVLWidth,
				layerType: 'parent',
				level: 'level2'});

			d3.selectAll('.'+ level +'.list.cell')
				.transition()
				.attr("y", 0)
				.attr("height", globalFirstLevelViewVLHeight)
				.attr('transform', `translate(${0},${-globalFirstLevelViewVLHeight/2})`);
		}

		if (selectedChart == 'scatterplot') {

			if (i == 2 || i == 3 || i == 4 || i == 6) {
				globalFirstLevelParentVLWidth = 40;
			} else if (i == 5) {
				globalFirstLevelParentVLWidth = 60;
			}

			if (i == 2) {
				// Call Virtual Layer
				levelG.call(agg_scatterplot_virtual_layer, {
							width: globalFirstLevelWidth,
							height: globalFirstLevelViewVLHeight,
							parentVLWidth: globalFirstLevelParentVLWidth,
							axis_x_position: 15,
							side: 'parent',
							level: 'level1'
				});	
				
			}

			if (i == 3) {
				levelG.call(scatterplot_virtual_layer, {
					width: globalFirstLevelWidth,
					height: globalFirstLevelViewVLHeight,
					parentVLWidth: globalFirstLevelParentVLWidth,
					axis_x_position: 15,
					link_opacity: 0.3,
					side: 'parent',
					level: 'level1'
				});	
			}

			if (i == 4) {
				// Call Virtual Layer
				levelG.call(agg_scatterplot_swath_virtual_layer, {
							width: globalFirstLevelWidth,
							height: globalFirstLevelViewVLHeight,
							parentVLWidth: globalFirstLevelParentVLWidth,
							axis_x_position: 15,
							link_opacity: 0.6,
							side: 'parent',
							level: 'level1'
				});								
			}

			if (i == 5) {
				// Call Virtual Layer
				levelG.call(agg_scatterplot_swath_control_virtual_layer, {
							width: globalFirstLevelWidth,
							height: globalFirstLevelViewVLHeight,
							parentVLWidth: globalFirstLevelParentVLWidth,
							axis_x_position: 15,
							link_opacity: 0.6,
							side: 'parent',
							level: 'level1'
				});								
			}

			if (i == 6) {
				// Call Virtual Layer
				levelG.call(scatterplot_scented_swath_virtual_layer, {
							width: globalFirstLevelWidth,
							height: globalFirstLevelViewVLHeight,
							parentVLWidth: globalFirstLevelParentVLWidth,
							axis_x_position: 15,
							link_opacity: 0.6,
							side: 'parent',
							level: 'level1'
				});								
			}
		}

		if (selectedChart == 'interactheatmap') {
			
			if (i == 2) {
				addWidth4Lable = 30;
				globalFirstLevelParentVLWidth = addWidth4Lable;

				// Hide node
				d3.selectAll('.'+ level +'.list.cell')
					.transition().style('visibility', "hidden");

				d3.selectAll('.'+ level +'.list.text')
					.transition().style('visibility', "hidden");

				levelG.call(generic_heatmap_virtual_layer, {
					x_position: 0,
					height: globalFirstLevelViewVLHeight,
					chart_data: csvData,
					offset_flag: false,
					parentVLWidth: globalFirstLevelParentVLWidth,
					side: 'parent',
					level: 'level1'
				});	
			}
		}

		if (selectedChart == 'countrymap') {
			if (i == 2) {
				// Call Virtual Layer
				levelG.call(country_map_virtual_layer, {
					side: 'parent',
					level: 'level3'
				});								
			}

			if (i == 3) {
				// Adjust level 3 nodes x postion
				globalThirdLevelParentVLWidth = 100;
				d3.selectAll('.node.level-3')
					.transition()
					.attr("transform", function(d,i) { 
						var postion_x = d.y + globalFirstLevelWidth 
										+ secondLevelWidth + globalThirdLevelParentVLWidth;
						return "translate(" + postion_x + "," + d.x + ")"; });	

				d3.selectAll('.' + level + '.list.rect,' + '.' + level + '.list.text')
					.transition()
					.attr("transform", function(d,i) { 
					return "translate(" + (-globalThirdLevelParentVLWidth) + "," + 0 + ")"; });	

				// Call Virtual Layer
				levelG.call(country_map_projection_virtual_layer, {
					side: 'parent',
					thirdLevelParentVLWidth: globalThirdLevelParentVLWidth,
					level: 'level3'
				});	
			}

			if (i == 4) {
				// Adjust level 3 nodes x postion
				globalThirdLevelParentVLWidth = 100;
				d3.selectAll('.node.level-3')
					.transition()
					.attr("transform", function(d,i) { 
						var postion_x = d.y + globalFirstLevelWidth 
										+ secondLevelWidth + globalThirdLevelParentVLWidth;
						return "translate(" + postion_x + "," + d.x + ")"; });	

				d3.selectAll('.' + level + '.list.rect,' + '.' + level + '.list.text')
					.transition()
					.attr("transform", function(d,i) { 
					return "translate(" + (-globalThirdLevelParentVLWidth) + "," + 0 + ")"; });	

				// Call Virtual Layer
				levelG.call(country_map_projection_center_virtual_layer, {
					side: 'parent',
					thirdLevelParentVLWidth: globalThirdLevelParentVLWidth,
					level: 'level3'
				});	
			}
		}

		if (selectedChart == 'scatterplot_level2') {
			if (i == 1) {
				// Pull the View VL back by 50 pixels, which corresponds to the left margin
				globalSecondLevelParentVLWidth = -50;

				levelG.call(scatterplot_level2_virtual_layer, {
					width: globalSecondLevelWidth,
					height: globalSecondLevelViewVLHeight,
					parentVLWidth: globalSecondLevelParentVLWidth,
					axis_x_position: 15,
					side: 'parent',
					level: 'level2'
				});	

				// Hide level 1 path
				d3.selectAll('.level1.path')
					.transition()
					.style('visibility', 'hidden');

				// Hide the list circle
				d3.selectAll('.' + level + '.list.circle, ' + '.' + level + '.list.text')
					.transition()
					.style('visibility', 'hidden');	
			}
		}

		// Common code
		if (level == "level1") {
			if (i == 0 || i == 2 || i == 3 || i == 4 || i == 5 || i == 6) {
				// Adjust Total Space
				adjustWidth({
					firstLevelWidth: globalFirstLevelWidth, 
					seoncdLevelParentVLWidth: globalSecondLevelParentVLWidth,
					secondLevelWidth: globalSecondLevelWidth,
					addWidth: globalFirstLevelParentVLWidth,
					thirdLevelParentVLWidth: globalThirdLevelParentVLWidth,
					resetFlag: true,
					layerType: 'parent',
					level: 'level1'
				})
			}

			globalFirstLevelWidth += globalFirstLevelParentVLWidth;

		} else if (level == "level2") {
			if (i == 0 || i == 1) {
				// Adjust Total Space
				adjustWidth({
					firstLevelWidth: globalFirstLevelWidth, 
					seoncdLevelParentVLWidth: 0,
					secondLevelWidth: globalSecondLevelWidth,
					addWidth: globalSecondLevelParentVLWidth,
					thirdLevelParentVLWidth: globalThirdLevelParentVLWidth,
					resetFlag: false,
					layerType: 'parent',
					level: 'level2'
				})
			}

			globalSecondLevelWidth += globalSecondLevelParentVLWidth;

		}
	});

	// Parent Identity Button
	var bWidth= 22; 
	var bHeight = 22;
	var bSpace= 5; //space between buttons

	parentIdentityButtonGroups.call(button_vertical_list, {
			bWidth: bWidth,
			bHeight: bHeight,
			bSpace: bSpace,
			x0: 0,
			y0: 0,
			transform_x: (-bWidth - bSpace), // TODO hardcode
			side: 'parent'
		});		

	// Set button invisible at the beginning
	d3.selectAll('.' + level + '.parent.identity.button')
		.selectAll('rect, text')
		.style('visibility', 'hidden');
}