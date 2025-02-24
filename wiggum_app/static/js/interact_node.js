const interact_node_click = (selection, props) => {
	const {
		element,
		rectWidth,
		myColor
	} = props;

	var num_small_multiples = 4;
	var first_candidate = "industry";
	var dependent = element.data.dependent;
	var independent = element.data.independent;
	var splitby = element.data.splitby;
	var subgroup = element.data.subgroup;

	// Filter data
	var filter_csvData = csvData.filter(
		function(d){ return d[splitby] === subgroup} );

	// Aggregate data
	var agg_result = aggregate({data: filter_csvData,
								groupby_keys: [independent, first_candidate],
								agg_var: dependent});

	// Find position
	var height = element.parent.children[element.parent.children.length - 1].x 
					- element.parent.children[0].x;
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
