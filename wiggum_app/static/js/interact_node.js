const interact_node_click = (selection, props) => {
	const {
		element,
		d,
		rectWidth,
		myColor
	} = props;

	var dependent = d.data.dependent;
	var independent = d.data.independent;
	var splitby = d.data.splitby;
	var subgroup = d.data.subgroup;
	var first_candidate = "industry";

	if (level3_state == "smscatterplot_industry") {
		if (splitby == 'sector') {

			// Filter data
			var filter_csvData = csvData.filter(
				function(d){ return d[splitby] === subgroup && d[dependent] > 0} );
		
			// Aggregate data
			var agg_result = aggregate({data: filter_csvData,
										groupby_keys: [independent, first_candidate],
										agg_var: dependent});
		
			// Find position
			var height = d.parent.children[d.parent.children.length - 1].x 
							- d.parent.children[0].x;
			var relative_translate_y = 0;	
		
			var thirdLevelG1 = selection.select('.level-3' + '.' + dependent 
									+ '.' + independent + '.splitby_' + splitby);

			thirdLevelG1.selectAll('.smscatterplot_industry')
									.transition()
									.style('visibility', 'hidden');			
		
			var g = thirdLevelG1.append("g")
						.attr("class", 'level-3' + ' ' + dependent 
						+ ' ' + independent + ' splitby_' + splitby 
						+ ' subgroup_' + subgroup + ' va smscatterplot_industry interact')
						.attr("transform", "translate(" + (rectWidth + 10) + ", " + relative_translate_y +")");

			if (subgroup == 1) {
				mark_width = 6;
				mark_height= 4;
				width = 300;
			} else if(subgroup == 2) {
				mark_width = 12;
				mark_height= 6;
				width = 200;
			} else if(subgroup == 3) {
				mark_width = 3;
				mark_height= 2;
				width = 400;
			} else if(subgroup == 4) {
				mark_width = 8;
				mark_height= 4;
				width = 200;
			}

			g.call(scatterPlot, {
				xValue: d => d[first_candidate],
				xAxisLabel: first_candidate,
				yValue: d => d[dependent],
				yAxisLabel: dependent,
				splitby: independent,
				margin: { left: 60, top: 0, right: 0, bottom: 0 },
				width: width,
				height: height,
				relative_translate_y: relative_translate_y,
				childrenIdentityFlag: false,
				smallMultipleFlag: false,
				x_axis_scale: 'scaleLinear', 
				y_axis_scale: 'scaleLog', 
				chart_data: agg_result,
				myColor: myColor,
				mark_shape: 'rectangle',
				mark_width: mark_width,
				mark_height: mark_height,
				level: 'level3'
			});
		} else {
			const existing_virtual_chart = selection.select('.level-3' + '.' + dependent 
												+ '.' + independent + '.splitby_' + splitby 
												+ '.va.smscatterplot_industry');

			d3.selectAll(".level3.list.rect" + "." + dependent 
								+ "." + independent + ".splitby_" + splitby)
								.style("stroke-opacity", 0.3);

			const existing_selected_interact_chart = selection.select('.level-3' + '.' + dependent 
					+ '.' + independent + '.splitby_' + splitby 
					+ '.subgroup_' + subgroup + '.va.smscatterplot_industry.interact');

			if (!existing_selected_interact_chart.empty()) {
				element.style("stroke-opacity", 0.3);

				existing_selected_interact_chart.remove();
				existing_virtual_chart.selectAll('.smscatterplot_industry')
					.transition()
					.style('visibility', 'visible');
			} else {
				element.style("stroke-opacity", 1);
				const existing_interact_chart = selection.select('.level-3' + '.' + dependent
													+ '.' + independent + '.splitby_' + splitby 
													+ '.va.smscatterplot_industry.interact');

				existing_interact_chart.remove();

				existing_virtual_chart.selectAll('.smscatterplot_industry')
										.transition()
										.style('visibility', 'hidden');

				selection.call(interact_node_small_multiple_scatterplot, {
					d: d,
					rectWidth: rectWidth,
					myColor: myColor
				});
			}
		}
	}
}

const interact_node_small_multiple_scatterplot = (selection, props) => {
	const {
		d,
		rectWidth,
		myColor
	} = props;

	var num_small_multiples = 4;
	var first_candidate = "industry";
	var dependent = d.data.dependent;
	var independent = d.data.independent;
	var splitby = d.data.splitby;
	var subgroup = d.data.subgroup;

	// Filter data
	var filter_csvData = csvData.filter(
		function(d){ return d[splitby] === subgroup} );

	// Aggregate data
	var agg_result = aggregate({data: filter_csvData,
								groupby_keys: [independent, first_candidate],
								agg_var: dependent});

	// Find position
	var height = d.parent.children[d.parent.children.length - 1].x 
					- d.parent.children[0].x;
	var relative_translate_y = height / 2 + 10;	
	var small_multiple_height = height / num_small_multiples;	

	var thirdLevelG1 = selection.select('.level-3' + '.' + dependent 
							+ '.' + independent + '.splitby_' + splitby);

	var g = thirdLevelG1.append("g")
				.attr("class", 'level-3' + ' ' + dependent 
				+ ' ' + independent + ' splitby_' + splitby 
				+ ' subgroup_' + subgroup + ' va smscatterplot_industry interact')
				.attr("transform", "translate(" + (rectWidth + 10) + ", " + relative_translate_y +")");

	g.call(small_multiple_scatterplot, {
		num_small_multiples: num_small_multiples,
		margin: { left: 60, top: 0, right: 0, bottom: 0 },
		width: 350,
		height: small_multiple_height,
		padding: 20,
		xAxisLabel: first_candidate,
		yAxisLabel: dependent,
		splitby: independent,
		childrenIdentityFlag: false,
		chart_data: agg_result,
		myColor: myColor,
		level: 'level3'
	});

}
