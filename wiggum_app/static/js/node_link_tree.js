// continous color for overview
//var heatmapConColors = ['#ffffe0', '#caefdf','#abdad9','#93c4d2', '#7daeca','#6997c2', '#5681b9','#426cb0', '#2b57a7','#00429d'];
// Option 2: Green
//var heatmapConColors = ['#eaf7e6', '#d8f0d2', '#c1e6ba', '#a4da9e', '#84cc83', '#62bb6d', '#3fa85b', '#289049', '#107a37', '#006227'];
// Option 3: Yellow Green
var heatmapConColors = ['#f9fdc5', '#eaf7af', '#d2eda0', '#b1df90', '#8bce81', '#64bc6f', '#3fa85b', '#288a47', '#10743c', '#005e33'];

// continous color scale for overview
var heatmapColorScale = d3.scaleQuantize()
						.domain([0, 1])
						.range(heatmapConColors);

// Specify the color for two parties
var twoPartyColor = d3.scaleOrdinal()
						.domain(["Dem", "Rep"])
//						.range(["#145fa8", "#c91919"]);
						.range(["#6494c4", "#ff6868"]);

// initiate the first and second level width
var firstLevelWidth = 0;
var secondLevelWidth = 0;

/**
 * Draw node link tree
 * 
 * @param data - result table.
 * @returns none.
*/
function drawNodeLinkTree(data) {

    var result_table = JSON.parse(data.result_df);

	// TODO width for big state
	//var width = 1150;
	var width = 2500;
	var height = 2600;
	// TODO width for big state
	//var margin = {top: 50, right: 420, bottom: 10, left: 60};
	var margin = {top: 50, right: 1800, bottom: 10, left: 60};

	var innerWidth = width - margin.left - margin.right;
	//var innerHeight = height - margin.top - margin.bottom;

	// calculate the number of leaf nodes 
	const num_leaf_nodes = result_table.length;

	var treeHeight = 50 * num_leaf_nodes + margin.top;

	var treeLayout = d3.tree()
					.size([treeHeight, innerWidth]);
					//.nodeSize([25, innerWidtjs h/4]);

	var nested_data = d3.nest()
						.key(d => [d.dependent, d.independent])
						.sortKeys(d3.ascending)
						.key(d => d.splitby)
						.entries(result_table);

	// Add root
	nested_data = {key: 'root', values: nested_data};

	var root = d3.hierarchy(nested_data, d => d.values);

	var links = treeLayout(root).links();

	var svg = d3.select('#node_link_tree')
				.append('svg');
	var zoomG =	svg.attr('width', width)
				.attr('height', treeHeight + margin.top + margin.bottom)
				.append('g')
	var g = zoomG.append('g')
				.attr('transform', `translate(${margin.left},${margin.top})`);

	svg.call(d3.zoom().on('zoom', () => {
		zoomG.attr('transform', d3.event.transform);
	}));


	var node = g.selectAll('g.node')
				.data(root.descendants());

	var nodeEnter = node.enter()
						.append('g')
						.attr("class", function(d) {
							if (d.depth == 2) {
								// splitby level
								var keyArray = d.parent.data.key.split(",");
								return 'node level-' + d.depth + ' ' + keyArray[0] + ' ' + keyArray[1];
							} else if (d.depth == 3) {
								// subgroup level
								return 'node level-' + d.depth + ' ' + d.data.dependent + ' ' 
											+ d.data.independent + ' splitby_' + d.data.splitby
											+ ' subgroup_' + d.data.subgroup;								
							}
							return 'node level-' + d.depth;
						})
						.attr("transform", function(d) { 
							return "translate(" + d.y + "," + d.x + ")"; });

	rootG = g.select('.level-0');
	
	//for (var key in distance_heatmap_dict){
	// Now only regression trend, loop only once. TODO multiple trend types
	//data = distance_heatmap_dict[key];
	//}
	agg_distance_heatmap_dict = data.agg_distance_heatmap_dict;
	agg_data = agg_distance_heatmap_dict[0];
	heatmapMatrix = jsonto2darray(agg_data.heatmap);

	if (agg_data.detail_view_type === 'scatter' || agg_data.detail_view_type == 'rank') {	
		
		rowLabels = [];
		colLabels = [];

		// get rows' labels
		for (var rowkey in agg_data.heatmap) {
			rowLabels.push(rowkey);
		}

		// get columns' lables
		var first_row = agg_data.heatmap[Object.keys(agg_data.heatmap)[0]];
		for (var colkey in first_row) {
			colLabels.push(colkey);
		}

		matrix_data = UpdateMatrixFormat(heatmapMatrix, rowLabels, 
			colLabels);
	}

	var matrixHeight = 90;

	drawHeatmap({
		container : rootG,
		data	  : matrix_data,
		rowLabels : rowLabels,
		colLabels : colLabels,		
		height: matrixHeight,	
		subLabel  : 'Pattern',
		level: 'level0'
	});

	// First level - aggregate pattern
	// Generate interactive buttons
	//var levelLabels= ['\uf03a','\uf009','\uf00a', '\uf080'];
	//var chartList = ['list', 'heatmap', 'heatmaplist', 'barchart'];
	var levelLabels= ['\uf03a','\uf009','\uf00a'];
	var chartList = ['list', 'heatmap', 'heatmaplist'];
	if (agg_data.trend_type == 'pearson_corr') {
		levelLabels.push('SP2');
		chartList.push('scatterplot')

		levelLabels.push('\uf080');
		chartList.push('doublehistogram')

		levelLabels.push('HM');
		chartList.push('heatmap4count')
	}

	var firstLevelG1 = g.select('.level-1');

	const firstLevelG1_position = firstLevelG1.attr('transform').split(/[\s,()]+/);
	const firstLevelG1_x = parseFloat(firstLevelG1_position[1]);

	//container for all buttons
	var button_offset_x = 37;
	var firstLevelButtons= g.append("g")
						.attr("id","firstLevelButtons")
						.attr("transform",  "translate(" + (firstLevelG1_x-button_offset_x) + ", " + (-margin.top) + ")");

	// TODO sovle hard code addWidthArray
	firstLevelButtons.call(interactiveLevelButton, {
		levelLabels,
		level: 'level1',
		charts: chartList,
		width: width,
		addWidthArray: [120, 160],
		treeHeight: treeHeight + margin.top + margin.bottom
	});

	// First level drawing
	var firstLevelG = g.selectAll('.level-1');
	// Visual Tech 1: Tree nodes	
	var rectWidth = 20;
	var rectHeight = 20;
	firstLevelG.append('rect')
		.attr("class", "level1 list cell")
	    .attr("x", -10)
	    .attr("y", -10)		
		.attr("width", rectWidth)
	    .attr("height", rectHeight)
		.style("fill", function(d, i) {
			var keyArray = d.data.key.split(",");

			var value = getMatrixValue(matrix_data, keyArray[0], keyArray[1]);
			if (value == 99) {
				return '#808080';
			} else {
				heatmapColorScale(value);
				return heatmapColorScale(value);
			}
		})
		.style("stroke", "black")
	    .style("stroke-width", "2px")
		.style("visibility", "hidden")
		.append('title')
		.text(function(d) {
			var keyArray = d.data.key.split(",");
			var value = getMatrixValue(matrix_data, keyArray[0], keyArray[1]);
			return `The mean distance is ${d3.format(".3f")(value)}.`
		});

	// Visual Alternatives
	firstLevelG.each(function (d) {

		var keyArray = d.data.key.split(",");

		// Visual Tech 2: Heatmap
		var container = d3.select(this);

		drawHeatmap({
			container : container,
			data	  : matrix_data,
			rowLabels : rowLabels,
			colLabels : colLabels,			
			subLabel  : '',
			selDep: keyArray[0],
			selIndep: keyArray[1],
			height: matrixHeight,	
			level: 'level1'
		});

		if (agg_data.trend_type == 'rank_trend') {
			// Visual Tech 3: colored bar chart
			var detail_dict = data.rank_trend_detail_dict.find(obj => {
				return obj.dependent === keyArray[0]
						&& obj.independent === keyArray[1]
			});
			var detail_dict = JSON.parse(detail_dict.detail_df);
			
			var chart_data = [];

			for (const [key1, value1] of Object.entries(detail_dict)) {
				var agg_object = {};
				agg_object['name'] = key1;
				agg_object['value'] = value1.aggregate;
				chart_data.push(agg_object);	
			}

			var single_object = {};
			var identity_data = [];
			single_object['dependent'] = keyArray[0];
			single_object['independent'] = keyArray[1];
			single_object['value'] = getMatrixValue(matrix_data, keyArray[0], keyArray[1]);
			identity_data.push(single_object);

			// TODO width is using addWidthArray
			// how to merge the chart width and the interactive width adjustment.
			container.call(coloredBarChart, {
				chart_data: chart_data,
				width: 120,
				height: 200,
				parentIdentityFlag: true,
				rectWidth: rectWidth,
				rectHeight: rectHeight,
				identity_data: identity_data,
				yAxisLabel: 'Vote Share',		
				level: 'level1',
				myColor: twoPartyColor
			});
		}

	
		if (agg_data.trend_type == 'pearson_corr') {
			// Visual Tech 1 for Pearson Corr: Scatterplot
			csvData = JSON.parse(data.df.replace(/\bNaN\b/g, "null"));
			var single_object = {};
			var identity_data = [];
			single_object['dependent'] = keyArray[0];
			single_object['independent'] = keyArray[1];
			single_object['value'] = getMatrixValue(matrix_data, keyArray[0], keyArray[1]);
			identity_data.push(single_object);

			container.call(scatterPlot, {
				xValue: d => d[keyArray[1]],
				xAxisLabel: keyArray[1],
				yValue: d => d[keyArray[0]],
				yAxisLabel: keyArray[0],
				circleRadius: 3,
				margin: { left: 40, top: 0, right: 0, bottom: 0 },
				width: 100,
				height: 100,
				parentIdentityFlag: true,
				rectWidth: rectWidth,
				rectHeight: rectHeight,
				identity_data: identity_data,
				chart_data: csvData,
				level: 'level1'
			});

			// Visual Tech 2 for Pearson Corr: double histogram
			// Prepare data
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

			container.call(doubleHistogram, {
				margin: { left: 40, top: 0, right: 0, bottom: 0 },
				width: 100,
				height: 100,
				var1: keyArray[0],
				var2: keyArray[1],
				parentIdentityFlag: true,
				rectWidth: rectWidth,
				rectHeight: rectHeight,
				identity_data: identity_data,
				chart_data: histrogram_data,
				level: 'level1'
			});	
		}

	})
		
	// Second level - splitby
	// Generate interactive buttons
	levelLabels= ['\uf03a', 'SP1', 'SP2', '\uf080' ];
	var secondLevelG1 = g.select('.level-2');

	const secondLevelG1_position = secondLevelG1.attr('transform').split(/[\s,()]+/);
	const secondLevelG1_x = parseFloat(secondLevelG1_position[1]);

	//container for all buttons
	var secondLevelButtons= g.append("g")
						.attr("id","secondLevelButtons")
						.attr("transform",  "translate(" + (secondLevelG1_x-button_offset_x) + ", " + (-margin.top) + ")");

	// Compute extended width
	// TODO now only consider same numbers of splitby vars in each branch, take the first branch
	// In the future need to design if the numbers of splity vars are different.
	//var height = root.children[0].children[root.children[0].children.length - 1].x 
	//	- root.children[0].children[0].x;
	var maxHeight = 300;
	var height_array = new Array();
	root.children.forEach(function(item, i) {
		var height = item.children[item.children.length - 1].x 
						- item.children[0].x;
		// set max height
		if (height > maxHeight) {
			height = maxHeight;
		}
		var singleObj = {};
		singleObj['key'] = item.data.key
		singleObj['value'] = height;
		height_array.push(singleObj);
	});

	// TODO add width varies for bar chart
	secondLevelButtons.call(interactiveLevelButton, {
		levelLabels,
		level: 'level2',
		charts: ['list', 'scatterplot1d', 'scatterplot2d', 'barchart'],
		width: width,
		addWidthArray: height_array,
		treeHeight: treeHeight + margin.top + margin.bottom
	});

	// Second level data
	var agg_splitby_table_dict = data.agg_splitby_table_dict;
	var splitby_data = agg_splitby_table_dict[0];
	var splitby_table = JSON.parse(splitby_data.splitby_table);
	var competitive_table = JSON.parse(splitby_data.competitive_table);

	// Second level drawing
	// Visual Tech 1: Tree nodes	
	var secondLevelCircleRadius = 10;
	var secondLevelG = g.selectAll('.level-2');
	secondLevelG.append('circle')
		.attr("class", "level2 list circle")
		.attr('r', secondLevelCircleRadius)	
		.style("fill", function(d) {
			var row = splitby_table.find(obj => {
				return obj.dependent === d.data.values[0].dependent 
						&& obj.independent === d.data.values[0].independent
						&& obj.splitby === d.data.key
			  })

			return heatmapColorScale(row.mean_distance);
		})
		.style('stroke', 'black')
		.style('stroke-width', '2px')
		.style("fill-opacity", 1)
		.style("pointer-events", function(d) {
			return !d.depth ? "none" : "all";
		})
		.append('title')
		.text(function(d) {
			var row = splitby_table.find(obj => {
				return obj.dependent === d.data.values[0].dependent 
						&& obj.independent === d.data.values[0].independent
						&& obj.splitby === d.data.key
			  })
			return `The mean distance is ${d3.format(".3f")(row.mean_distance)}.`
		}); 			

	// Visual Alternatives
	root.children.forEach(function (d) {
		var yColumn = 'mean_distance';

		var keyArray = d.data.key.split(",");
		var chart_data = splitby_table.filter(obj => {
			return obj.dependent === keyArray[0]
					&& obj.independent === keyArray[1]
		  })

		keyArray[0] = keyArray[0].replace(/\s+/g, '.');
		keyArray[1] = keyArray[1].replace(/\s+/g, '.');
		var secondLevelG1 = g.select('.level-2' + '.' + keyArray[0] + '.' + keyArray[1]);

		var secondLevelG1_position = secondLevelG1.attr('transform').split(/[\s,()]+/);
		var secondLevelG1_x = parseFloat(secondLevelG1_position[1]);
		var secondLevelG1_y = parseFloat(secondLevelG1_position[2]);

		var height = d.children[d.children.length - 1].x - d.children[0].x;
		var offset_y;

		if (height > maxHeight) {
			offset_y = height/2 - maxHeight/2;
			// set max height
			height = maxHeight;
			secondLevelG1_y = secondLevelG1_y + offset_y;

		}

		var secondLevelG1_visual_alter = secondLevelG1.append("g")
			.attr("class", 'level-2' + ' ' + keyArray[0] + ' ' + keyArray[1] + ' va')
			.attr("transform", "translate(0,0)");
			//.attr("transform", "translate(" + secondLevelG1_x + "," + secondLevelG1_y + ")");

		// Visual Tech 2: 1d scatter plot	
		secondLevelG1_visual_alter.call(oneDimensionalScatterPlot, {
			yValue: d => d[yColumn],
			yAxisLabel: yColumn,
			circleRadius: secondLevelCircleRadius,
			height,
			chart_data,
			level: 'level2'
		});		

		// Visual Tech 3: 2d scatter plot	
		var xColumn = 'mean_subgroup_trend_strength';

		secondLevelG1_visual_alter.call(oneDimensionalScatterPlot, {
			xValue: d => d[xColumn],
			xAxisLabel: 'The Mean of Winning Margins',
			yValue: d => d[yColumn],
			yAxisLabel: 'The Mean of Distances',
			circleRadius: secondLevelCircleRadius,
			margin: { top: 10, right: 40, bottom: 88, left: 150 },
			width: height,
			height,
			chart_data,
			level: 'level2'
		});

		if (agg_data.trend_type == 'rank_trend') {
			// Visual Tech 4: grouped bar chart
			var competitive_chart_data = competitive_table.filter(obj => {
				return obj.dependent === keyArray[0]
						&& obj.independent === keyArray[1]
			})

			var competitive_bar_chart_data = [];

			d.data.values.forEach(function (item) {
				var singleObj = {};
				singleObj['subgroup'] = item.key;
				for (var i = 0; i < competitive_chart_data.length; i++){
					if (item.key == competitive_chart_data[i].splitby) {
						var key = competitive_chart_data[i].winning_margin;
						singleObj[key] = competitive_chart_data[i].count;
					}
				}
				competitive_bar_chart_data.push(singleObj);
			});

			const xValue = competitive_table => competitive_table['count'];
			var xDomain = [0, d3.max(competitive_table, xValue)];
			var competitive_color = d3.scaleOrdinal()
										//.range(["#a6cee3", "#fb9a99", "#cab2d6"]);
										//.range(["#80b1d3", "#fb8072", "#bc80bd"]);
										.range(["#8dd3c7", "#fdb462", "#bc80bd"]);

			secondLevelG1_visual_alter.call(barChart, {
				chart_data: competitive_bar_chart_data,
				width: height,
				height: height,
				xDomain: xDomain,
				level: 'level2',
				largerFlag: false,
				keys: ['[0, 10%]', '(10%, 20%]', '(20%, 100%]'],
				percentageFlag: false,
				parentIdentityFlag: true,
				childrenIdentityFlag: true,
				circleRadius: secondLevelCircleRadius,
				identity_data: chart_data,
				x_axis_label: 'Number of Districts',
				legend_title: 'Winning Margin',
				myColor: competitive_color,
				tooltipValueFormatFlag: false
			});	
		}

	});

	// Third level: subgroups
	// Generate interactive buttons
	var levelLabels= ['\uf03a', '\uf0c9', '\uf279', '\uf080', 'SP1'];
	var thirdLevelG1 = g.select('.level-3');

	const thirdLevelG1_position = thirdLevelG1.attr('transform').split(/[\s,()]+/);
	const thirdLevelG1_x = parseFloat(thirdLevelG1_position[1]);

	//container for all buttons
	var thirdLevelButtons= g.append("g")
						.attr("id","thirdLevelButtons")
						.attr("transform",  "translate(" + (thirdLevelG1_x-button_offset_x) + ", " + (-margin.top) + ")");

	thirdLevelButtons.call(interactiveLevelButton, {
		levelLabels,
		level: 'level3',
		charts: ['list', 'stripplot', 'districtmap', 'barchart', 'scatterplot']
	});

	// Third level drawing
	// Visual Tech 1: Tree nodes
	thirdLevelG = g.selectAll('.level-3');
	thirdLevelG.append('rect')
		.attr("class", function(d) {
			return "level3 list rect " + d.data.dependent 
					+ " " + d.data.independent + " splitby_" + d.data.splitby
					+ " subgroup_" + d.data.subgroup;})
		.attr("x", -rectWidth/2)
		.attr("y", -rectHeight/2)		
		.attr("width", rectWidth)
		.attr("height", rectHeight)
		.style("fill", function(d) {
			return heatmapColorScale(d.data.distance);
		})
		.style("stroke", "black")
		.style("stroke-width", "2px")
		.append('title')
		.text(function(d) {
			return `The distance is ${d.data.distance}.`
		}); 			

	// Node Text Background color
	var correspondColor = d3.scaleOrdinal()
						.range(["#1f77b4","#ff7f0e","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#17becf"]);
						
	d3.selectAll('.node.level-3')
		.append('rect')
		.attr('class', 'level-3 background')
		.attr("x", ".9em")
		.attr("y", -rectHeight/2)	
		.style('fill', function(d) {
			return correspondColor(d.data.subgroup);
		})
		.style('opacity', 1)
		.style("stroke", "grey")
		.style("stroke-width", "1px");

	nodeEnter.append('text')
		.attr('dx', d => d.children ? '0em' : '1em')
		.attr('dy', d => d.children ? '1.5em' : '0.32em')
		.attr('class', d => 'level'+d.depth + ' list text')
		.attr('text-anchor', d => d.children ? 'middle' : 'start')
		.attr('pointer-events', 'none')
		.text(function(d) {
			if (d.depth > 0) {
				return d.height ? d.data.key : d.data.subgroup
			}
		})
		.style("visibility", function(d, i) {
			return d.depth > 1 ? "visible" : "hidden";
		})
		.style("pointer-events", function(d, i) {
			return !d.depth ? "none" : "all";
		});

    // Save the dimensions of the text elements
    nodeEnter.selectAll("text")
          .each(function(d) { d.bbox = this.getBBox(); });

	const xMargin = 2
	const yMargin = 2
	svg.selectAll(".level-3.background")
		.attr("width", d => d.bbox.width + 2 * xMargin)
		.attr("height", d => d.bbox.height + 2 * yMargin);

		
	// TODO rank trend has va
	if (agg_data.detail_view_type == 'rank') {	
		// Prepare the transition position
		// Calculate the distance between the first node and the last node
		//var tree_height = (root.x - margin.top) * 2;
		var actual_tree_height = treeHeight - margin.top;

		// Calculate the number of charts
		var num_charts = 0;
		root.children.forEach(function (pattern) {
			pattern.children.forEach(function (d) {
				num_charts = num_charts + 1;
			})
		});

		// TODO input by user 
		var chart_height = treeHeight / num_charts;
		//var chart_height = 150;
		var total_height = chart_height * num_charts;	
		var diff_height = actual_tree_height - total_height;

		var used_height = 0;
		var relative_translate_y = 0;
		var absolute_translate_y = 0;

		// Visual Alternatives
		root.children.forEach(function (pattern) {
			pattern.children.forEach(function (d) {
				var dependent = d.data.values[0].dependent;
				var independent = d.data.values[0].independent;
				var splitby = d.data.values[0].splitby;
				var thirdLevelG1 = g.select('.level-3' + '.' + dependent 
										+ '.' + independent + '.splitby_' + splitby);

				var detail_dict = data.rank_trend_detail_dict.find(obj => {
					return obj.dependent === dependent
							&& obj.independent === independent
							&& obj.splitby === splitby
				});
				var detail_dict = JSON.parse(detail_dict.detail_df);

				var chart_data = [];
				var agg_chart_data = [];

				for (const [key1, value1] of Object.entries(detail_dict)) {
					var agg_value = value1.aggregate;
					for (const [key2, value2] of Object.entries(value1)) {
						if (key2 != 'aggregate') {
							var object = {};
							object['name'] = key1;
							object['subgroup'] = key2;		
							object['value'] = value2;	
							chart_data.push(object);	

							var agg_object = {};
							agg_object['name'] = key1;
							agg_object['subgroup'] = key2;		
							agg_object['value'] = agg_value;	
							agg_chart_data.push(agg_object);	
						} 
					}
				}

				//var thirdLevelG1_position = thirdLevelG1.attr('transform').split(/[\s,()]+/);
				//var thirdLevelG1_x = parseFloat(thirdLevelG1_position[1]);
				//var thirdLevelG1_y = parseFloat(thirdLevelG1_position[2]);
		
				var height = d.children[d.children.length - 1].x - d.children[0].x;
			
				var thirdLevelG1_visual_alter = thirdLevelG1.append("g")
					.attr("class", 'level-3' + ' ' + dependent 
					+ ' ' + independent + ' splitby_' + splitby + ' va')
					.attr("transform", "translate(" + (rectWidth + 5) + "," + 0 + ")");

				// Visual Tech 2: strip plot
				thirdLevelG1_visual_alter.call(stripPlot, {
					chart_data,
					agg_chart_data,
					width: 300,
					height: height,
					level: 'level3',
					x_axis_label: 'Vote Share',
					myColor: twoPartyColor
				});	

				// Visual Tech 3: map
				var thirdLevelG1_visual_alter_map = thirdLevelG1.append("g")
					.attr("class", 'level-3' + ' ' + dependent 
					+ ' ' + independent + ' splitby_' + splitby + ' va map')
					.attr("transform", "translate(" + (rectWidth + 5) + ", 0)");
					//.attr("transform", "translate(" + (rectWidth + 5) + "," + (-rectHeight) + ")");

				// extract leaf nodes
				var leaf_node_links = links.filter(obj => {
					return obj.target.data.dependent === dependent
							&& obj.target.data.independent === independent
							&& obj.target.data.splitby === splitby
				})

				var thirdLevelG1_position = thirdLevelG1.attr('transform').split(/[\s,()]+/);
				var thirdLevelG1_x = parseFloat(thirdLevelG1_position[1]);
				var thirdLevelG1_y = parseFloat(thirdLevelG1_position[2]);

				// get state name from df
				var df_data = JSON.parse(data.df.replace(/\bNaN\b/g, "null"));
				
				// TODO temporarily using state to check
				if (df_data[0].state != undefined) {
					var state_name = df_data[0].state;

					var map_data = result_table.filter(obj => {
						return obj.dependent === dependent
								&& obj.independent === independent
								&& obj.splitby === splitby
					});

					thirdLevelG1_visual_alter_map.call(districtStateMap, {
						chart_data: map_data,
						state_name,
						leaf_node_links,
						//width: 1.5 * height + rectHeight,
						width: height + rectHeight,
						height: height + rectHeight,
						offset_y: thirdLevelG1_y,
						level: 'level3',
						splitby
					});	

				}

				// Visual Tech 4: grouped bar chart

				// if chart height is higher than the branch heght
				var largerFlag = false;
				if (chart_height > (treeHeight / num_charts)) {
					largerFlag = true;
					var first_node_y = d.children[0].x;

					if (used_height == 0) {
						relative_translate_y = diff_height / 2;
					} else {
						relative_translate_y = absolute_translate_y + chart_height - first_node_y;
					}

					used_height = used_height + chart_height;
					absolute_translate_y = thirdLevelG1_y + relative_translate_y;
				} else {
					// if chart height is same as the branch height
					relative_translate_y = diff_height / 2;
					chart_height = height + rectHeight;
				}

				var thirdLevelG1_visual_alter_barchart = thirdLevelG1.append("g")
					.attr("class", 'level-3' + ' ' + dependent 
					+ ' ' + independent + ' splitby_' + splitby + ' va barchart')
					.attr("transform", "translate(" + (rectWidth + 10) + ", " + relative_translate_y +")");

				var bar_chart_data = [];

				d.data.values.forEach(function (item) {
					var singleObj = {};
					singleObj['subgroup'] = item.subgroup;
					for (var i = 0; i < chart_data.length; i++){
						if (item.subgroup == chart_data[i].subgroup) {
							var key = chart_data[i].name;
							singleObj[key] = chart_data[i].value;
						}
					}
					bar_chart_data.push(singleObj);
				});

				const xValue = chart_data => chart_data['value'];
				var xDomain = [0, d3.max(chart_data, xValue)];

				thirdLevelG1_visual_alter_barchart.call(barChart, {
					chart_data: bar_chart_data,
					width: 300,
					height: chart_height,
					xDomain: xDomain,
					level: 'level3',
					largerFlag: largerFlag,
					percentageFlag: true,
					x_axis_label: 'Vote Share',
					myColor: twoPartyColor,
					tooltipValueFormatFlag: true
				});	

				/*thirdLevelG1_visual_alter_barchart
					.append("rect")
					.attr("width", 20)
					.attr("height",20)
					.attr("x",0)
					.attr("y",0)
					.attr("fill","red")
				*/

			})
		})
	} else if (agg_data.detail_view_type == 'scatter') {	
		// Visual Alternatives
		root.children.forEach(function (pattern) {
			pattern.children.forEach(function (d) {
				var dependent = d.data.values[0].dependent;
				var independent = d.data.values[0].independent;
				var splitby = d.data.values[0].splitby;
				var thirdLevelG1 = g.select('.level-3' + '.' + dependent 
					+ '.' + independent + '.splitby_' + splitby);

				// Visual Tech 5: scatterplot
				var thirdLevelG1_visual_alter_scatterplot = thirdLevelG1.append("g")
					.attr("class", 'level-3' + ' ' + dependent 
					+ ' ' + independent + ' splitby_' + splitby + ' va scatterplot')
					.attr("transform", "translate(" + (rectWidth + 5) + ", 0)");


				thirdLevelG1_visual_alter_scatterplot.call(scatterPlot, {
						xValue: d => d[independent],
						xAxisLabel: independent,
						yValue: d => d[dependent],
						yAxisLabel: dependent,
						splitby: splitby,
						circleRadius: 3,
						margin: { left: 120, top: 40, right: 0, bottom: 0 },
						width: 100,
						height: 100,
						parentIdentityFlag: false,
						chart_data: csvData,
						level: 'level3',
						myColor: correspondColor
				});		
			})
		})
	}

	// Generate links
	var numrows = matrix_data.length;
	var numcols = matrix_data[0].length;
	var width = 90,
	height = 90;

	var x = d3.scaleBand()
	    .domain(d3.range(numcols))
	    .range([0, width]);

	var y = d3.scaleBand()
	    .domain(d3.range(numrows))
	    .range([0, height]);

	var linkPathGenerator 
			= d3.linkHorizontal()
				.source(function(d) {
					if (d.source.depth == 1) {
						return [d.source.y + rectWidth / 2, d.source.x];
					} else if (d.source.depth == 2) { 
						return [d.source.y + secondLevelCircleRadius, d.source.x];
					}else {}
				}).target(function(d) {
					if (d.source.depth == 1) {
						return [d.target.y - secondLevelCircleRadius, d.target.x];
					} else if (d.source.depth == 2) { 
						return [d.target.y - rectWidth / 2, d.target.x];
					}else {}
				});	

	var matrixLinkPathGenerator 
			= d3.linkHorizontal()
				.source(function(d, i, type, matrixHeight) {

					if (d.source.depth == 0) {
						var keyArray = d.target.data.key.split(",");
						var {r, c} = getMatrixIndex(matrix_data, keyArray[0], keyArray[1]);
						return [d.source.y + x(c) + x.bandwidth()/2, d.source.x + y(r)+y.bandwidth()/2 - matrixHeight/2];
					} else {
						var keyArray = d.source.data.key.split(",");
						var {r, c} = getMatrixIndex(matrix_data, keyArray[0], keyArray[1]);
						return [d.source.y + x(c) + x.bandwidth()-3, d.source.x + y(r)+y.bandwidth()/2 - matrixHeight/2];
					}
				}).target(function(d, i, type, matrixHeight) {
					if (d.source.depth == 0) {
						// Level 1
						if (type === 'list') {
							return [d.target.y  - rectWidth/2, d.target.x];
						}
						var keyArray = d.target.data.key.split(",");
						var {r, c} = getMatrixIndex(matrix_data, keyArray[0], keyArray[1]);
						return [d.target.y + x(c) + x.bandwidth()/2, d.target.x + y(r)+y.bandwidth()/2 - matrixHeight/2];
					} else {
						// Level 2
						return [d.target.y - secondLevelCircleRadius, d.target.x];
					}
				});

	var scatterplot1dLinkPathGenerator 
			= d3.linkHorizontal()
				.source(function(d, i, type, matrixHeight) {
					if (d.source.depth == 1) {
						if (type === 'heatmap') {
							var keyArray = d.source.data.key.split(",");
							var {r, c} = getMatrixIndex(matrix_data, keyArray[0], keyArray[1]);
							return [d.source.y + x(c) + x.bandwidth()-3, d.source.x + y(r)+y.bandwidth()/2 - matrixHeight/2];
						}
						return [d.source.y + rectWidth / 2, d.source.x];
					} else if (d.source.depth == 2) { 

						var dependent = d.target.data.dependent;
						var independent = d.target.data.independent;
						var splitby = d.target.data.splitby;
						// Fixed-TODO dep and independent also need to fix the space in class
						splitby = splitby.replace(/\s+/g, '.');
						dependent = dependent.replace(/\s+/g, '.');
						independent = independent.replace(/\s+/g, '.');
						var selectClass = '.level2.scatterplot1d.circle' + '.' + dependent
											+ '.' + independent + '.splitby_' + splitby;																						
						var y_position = parseFloat(d3.select(selectClass).attr('cy'));
						var secondLevelG1 = g.select('.level-2' + '.' + dependent + '.' + independent);

						const secondLevelG1_position = secondLevelG1.attr('transform').split(/[\s,()]+/);
						const secondLevelG1_y = parseFloat(secondLevelG1_position[2]);

						return [d.source.y + secondLevelCircleRadius, secondLevelG1_y + y_position];
					}else {}
				}).target(function(d, i) {
					if (d.source.depth == 1) {
						var keyArray = d.source.data.key.split(",");
						var splitby = d.target.data.key;
						// Fixed-TODO dep and independent also need to fix the space in class
						splitby = splitby.replace(/\s+/g, '.');
						keyArray[0] = keyArray[0].replace(/\s+/g, '.');
						keyArray[1] = keyArray[1].replace(/\s+/g, '.');

						var selectClass = '.level2.scatterplot1d.circle' + '.' + keyArray[0]
											+ '.' + keyArray[1] + '.splitby_' + splitby;

						var y_position = parseFloat(d3.select(selectClass).attr('cy'));
						var secondLevelG1 = g.select('.level-2' + '.' + keyArray[0] + '.' + keyArray[1]);

						const secondLevelG1_position = secondLevelG1.attr('transform').split(/[\s,()]+/);
						const secondLevelG1_y = parseFloat(secondLevelG1_position[2]);

						return [d.target.y - secondLevelCircleRadius, secondLevelG1_y + y_position];
					} else if (d.source.depth == 2) { 
						return [d.target.y - rectWidth / 2, d.target.x];
					}else {}
				});	

	var barchartLinkPathGenerator 
		= d3.linkHorizontal()
			.source(function(d, i, type, matrixHeight) {
				if (d.source.depth == 1) {
					if (type === 'heatmap') {
						var keyArray = d.source.data.key.split(",");
						var {r, c} = getMatrixIndex(matrix_data, keyArray[0], keyArray[1]);
						return [d.source.y + x(c) + x.bandwidth()-3, d.source.x + y(r)+y.bandwidth()/2 - matrixHeight/2];
					}
					return [d.source.y + rectWidth / 2, d.source.x];
				} else if (d.source.depth == 2) { 

					var dependent = d.target.data.dependent;
					var independent = d.target.data.independent;
					var splitby = d.target.data.splitby;
					// Fixed-TODO dep and independent also need to fix the space in class
					splitby = splitby.replace(/\s+/g, '.');
					dependent = dependent.replace(/\s+/g, '.');
					independent = independent.replace(/\s+/g, '.');
					var selectClass = '.level2.barchart.circle' + '.' + dependent
										+ '.' + independent + '.splitby_' + splitby;	

					var circle_position = d3.select(selectClass).attr('transform').split(/[\s,()]+/);
					y_position = parseFloat(circle_position[2]);

					var secondLevelG1 = g.select('.level-2' + '.' + dependent + '.' + independent);
					const secondLevelG1_position = secondLevelG1.attr('transform').split(/[\s,()]+/);
					const secondLevelG1_y = parseFloat(secondLevelG1_position[2]);

					return [d.source.y + secondLevelCircleRadius, secondLevelG1_y + y_position + secondLevelCircleRadius - 2];
				}else {}
			}).target(function(d, i) {
				if (d.source.depth == 1) {
					var keyArray = d.source.data.key.split(",");
					var splitby = d.target.data.key;
					// Fixed-TODO dep and independent also need to fix the space in class
					splitby = splitby.replace(/\s+/g, '.');
					keyArray[0] = keyArray[0].replace(/\s+/g, '.');
					keyArray[1] = keyArray[1].replace(/\s+/g, '.');

					var selectClass = '.level2.barchart.circle' + '.' + keyArray[0]
										+ '.' + keyArray[1] + '.splitby_' + splitby;

					var circle_position = d3.select(selectClass).attr('transform').split(/[\s,()]+/);
					y_position = parseFloat(circle_position[2]);

					var secondLevelG1 = g.select('.level-2' + '.' + keyArray[0] + '.' + keyArray[1]);

					const secondLevelG1_position = secondLevelG1.attr('transform').split(/[\s,()]+/);
					const secondLevelG1_y = parseFloat(secondLevelG1_position[2]);

					return [d.target.y - secondLevelCircleRadius, secondLevelG1_y + y_position + secondLevelCircleRadius - 2];
				} else if (d.source.depth == 2) { 
					return [d.target.y - rectWidth / 2, d.target.x];
				}else {}
			});	
	

	// Path for heatmap
	g.selectAll('.path heatmap node').data(links)
		.enter().append('path')
		.attr('d', function(d, i) {
			if (d.source.depth < 2) {
				return matrixLinkPathGenerator(d, i, 'heatmap', matrixHeight);
			}
			//return d.source.depth < 2 ? matrixLinkPathGenerator(d, i) : linkPathGenerator(d);
		})
		.attr("class", d => "path heatmap node level" + d.source.depth)
		.attr('fill', 'none')
		.attr('stroke', 'black')
		.style("stroke-width", "1px")
		.style("pointer-events", function(d, i) {
			return !d.source.depth ? "none" : "all";
		});

	// Path for 1d scatter plot
	g.selectAll('.path list scatterplot1d').data(links)
		.enter().append('path')
		.attr('d', function(d, i) {
			if (d.source.depth == 1 || d.source.depth == 2) {
				return scatterplot1dLinkPathGenerator(d, i);
			}
		})
		.attr("class", d =>"path list scatterplot1d level" + d.source.depth)
		.attr('fill', 'none')
		.attr('stroke', 'black')
		.style("stroke-width", "1px")
		.style("pointer-events", function(d, i) {
			return !d.source.depth ? "none" : "all";
		});		

	// Path for 1d scatter plot
	g.selectAll('.path heatmap scatterplot1d').data(links)
		.enter().append('path')
		.attr('d', function(d, i) {
			if (d.source.depth == 1) {
				return scatterplot1dLinkPathGenerator(d, i, 'heatmap', matrixHeight);
			}
		})
		.attr("class", d =>"path heatmap scatterplot1d level" + d.source.depth)
		.attr('fill', 'none')
		.attr('stroke', 'black')
		.style("stroke-width", "1px")
		.style("pointer-events", function(d, i) {
			return !d.source.depth ? "none" : "all";
		});			

	g.selectAll('.path list node').data(links)
		.enter().append('path')
		.attr('d', function(d, i) {
			return d.source.depth < 1 ? matrixLinkPathGenerator(d, i, 'list', matrixHeight) : linkPathGenerator(d);
		})
		.attr("class", d => "path list node level" + d.source.depth)
		.attr('fill', 'none')
		.attr('stroke', 'black')
		.style("stroke-width", "1px")
		.style("pointer-events", function(d, i) {
			return !d.source.depth ? "none" : "all";
		})
		.style("visibility", "hidden");

	if (agg_data.trend_type == 'rank_trend') {	
		// Path for barchart
		// list to barchart
		g.selectAll('.path list barchart').data(links)
			.enter().append('path')
			.attr('d', function(d, i) {
				if (d.source.depth == 1 || d.source.depth == 2) {
					return barchartLinkPathGenerator(d, i);
				}
			})
			.attr("class", d =>"path list barchart level" + d.source.depth)
			.attr('fill', 'none')
			.attr('stroke', 'black')
			.style("stroke-width", "1px")
			.style("pointer-events", function(d, i) {
				return !d.source.depth ? "none" : "all";
			});		

		// heatmap to barchart
		g.selectAll('.path heatmap barchart').data(links)
			.enter().append('path')
			.attr('d', function(d, i) {
				if (d.source.depth == 1) {
					return barchartLinkPathGenerator(d, i, 'heatmap', matrixHeight);
				}
			})
			.attr("class", d =>"path heatmap barchart level" + d.source.depth)
			.attr('fill', 'none')
			.attr('stroke', 'black')
			.style("stroke-width", "1px")
			.style("pointer-events", function(d, i) {
				return !d.source.depth ? "none" : "all";
			});					
	}

	initVisibility();

	// Draw node link tree legend
	drawNodeLinkLegend();
}

/**
 * Draw node-linked diagram legend
 *
 * @param none.
 * @returns none.
 */
 function drawNodeLinkLegend() {

	var margin = {top: 30, right: 50, bottom: 120, left: 30};

	var svg = d3.select("#node_link_tree_legend")
				.append("svg")		
				.attr("width", 250)
				.attr("height", 500)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");	

	var colorLegend = d3.legendColor()
						.labelFormat(d3.format(".1f"))
						.scale(heatmapColorScale)
						.shapePadding(3)
						.shapeWidth(20)
						.shapeHeight(20)
						.labelOffset(10)
						.ascending(true);
		
	svg.append("g")
		.attr("transform", "translate(-20, 0)")
		.call(colorLegend);

	svg.append("text")
		.attr("x", 55)
		.attr("y", -10)
		.attr("text-anchor", "middle")  
		.style("font-size", "15px") 
		.text("Distance / Mean Distance");	

	svg.append("text")
		.attr("x", -margin.left)
		.attr("y", 265)
		.attr("dy", "0em")
		.attr("text-anchor", "start")  
		.style("font-size", "15px") 
		.text("If same pattern, distance = 0.");	
		
	svg.append("text")
		.attr("x", -margin.left)
		.attr("y", 265)
		.attr("dy", "1.2em")
		.attr("text-anchor", "start")  
		.style("font-size", "15px") 
		.text("If reverse pattern, distance = 1.");	
		
	svg.append("text")
		.attr("x", -margin.left)
		.attr("y", 265)
		.attr("dy", "2.4em")
		.attr("text-anchor", "start")  
		.style("font-size", "15px") 
		.text("The distances encoded in the");
	
	svg.append("text")
		.attr("x", -margin.left)
		.attr("y", 265)
		.attr("dy", "3.4em")
		.attr("text-anchor", "start")  
		.style("font-size", "15px") 		
		.text("leaf nodes are {0, 1}.");	
		
	svg.append("text")
		.attr("x", -margin.left)
		.attr("y", 265)
		.attr("dy", "4.4em")
		.attr("text-anchor", "start")  
		.style("font-size", "15px") 
		.text("The mean distances encoded");	
		
	svg.append("text")
		.attr("x", -margin.left)
		.attr("y", 265)
		.attr("dy", "5.4em")
		.attr("text-anchor", "start")  
		.style("font-size", "15px") 		
		.text("in the non-leaf nodes are");	
		
	svg.append("text")
		.attr("x", -margin.left)
		.attr("y", 265)
		.attr("dy", "6.4em")
		.attr("text-anchor", "start")  
		.style("font-size", "15px") 		
		.text("in the range of [0, 1].");			
}

function getMatrixIndex(details, dep, indep) {
	var r;
	var c;

	for (r = 0; r < details.length; ++r) {
	   const nsDetails = details[r];
	   for (c = 0; c < nsDetails.length; ++c) {
		  const tempObject = nsDetails[c];
		  if ((tempObject.dependentVar === dep) && (tempObject.independentVar === indep)) {
			 return {r, c};
		  }
	   }
	}
	return {};
 }

 function getMatrixValue(details, dep, indep) {
	var r;
	var c;

	for (r = 0; r < details.length; ++r) {
	   const nsDetails = details[r];
	   for (c = 0; c < nsDetails.length; ++c) {
		  const tempObject = nsDetails[c];
		  if ((tempObject.dependentVar === dep) && (tempObject.independentVar === indep)) {
			 return tempObject.value;
		  }
	   }
	}
	return -1;
 }

/**
 * Prepare matrix information 
 *
 * @param matrix - matrix.
 * @param rowLabels - independent used for row labels.
 * @param colLabels - dependent used for columns labels.
 * @returns matrix - containing information for cells.
 */
 var UpdateMatrixFormat = function(matrix, rowLabels, colLabels) {

	matrix.forEach(function(row, i) {
		row.forEach(function(cell, j) {
		
			matrix[i][j] = {
					dependentVar: rowLabels[i],
					independentVar: colLabels[j],
					value: cell
				};
		});
	});

	return matrix;
};


/**
 * Draw heatmap
 *
 * @param options - Data containing matrix information.
 * @returns none.
 */
function drawHeatmap(options) {

	var margin = {top: 93, right: 20, bottom: 30, left: 133},
	    width = 90,
	    height = options.height,
	    data = options.data,
	    container = options.container,
		subLabel = options.subLabel
		level = options.level;

	if(!data){
		throw new Error('Please pass data');
	}

	var numrows = data.length;
	var numcols = data[0].length;

	//var distanceMatrixPlot = svg.append("g")
	var distanceMatrixPlot = container.append("g")
		.attr("id", "distanceMatrixPlot")
		.attr("class", level + " distanceMatrixPlot")
		.attr("transform", "translate(" + 0 + "," + (-width/2) + ")")
	    //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var x = d3.scaleBand()
	    .domain(d3.range(numcols))
	    .range([0, width]);

	var y = d3.scaleBand()
	    .domain(d3.range(numrows))
	    .range([0, height]);

	var row = distanceMatrixPlot.selectAll(".row")
	    .data(data)
		.enter().append("g")
	    .attr("class", "row")
	    .attr("transform", function(d, i) { return "translate(0," + y(i) + ")"; });

	var cells = row.selectAll(".cell")
	    .data(function(d) { return d; })
		.enter()
		.append("rect")	
		.attr("id", function(d) {
			return d.trend_type + "_" + d.independentVar + "_" + d.dependentVar + "_" + d.categoryAttr + "_" + d.category
		})
	    .attr("transform", function(d, i) { return "translate(" + x(i) + ", 0)"; });

	cells.attr("width", x.bandwidth()-3)
	    .attr("height", y.bandwidth()-3)
	    .style("stroke-width", "1px")
		.style("stroke", "black")
		.attr("class", function(d) {
			if (options.selDep) {
				if (d.dependentVar === options.selDep && d.independentVar === options.selIndep) {
					return level + " heatmap cell clicked";
				}
			}
			return level + " heatmap cell";
		})
		// Remove transition() for adding title
    	//.transition()
		.style("fill", function(d, i) {
			if (d.value == 99) {
				return '#808080';
			} else {
				return heatmapColorScale(d.value);
			}
		})
		.append('title')
		.text(function(d) {
			return `The mean distance is ${d3.format(".3f")(d.value)}.`;
		});

	
	if (level == "level1") {
		cells.style("opacity", function(d) {
			if (options.selDep) {
				if (d.dependentVar === options.selDep 
					&& d.independentVar === options.selIndep) {
					return 1;
				}
			}
			return 0.3;
		});
	}	

	distanceMatrixPlot.append("text")
			.attr("x", (width / 2))             
			.attr("y", height + (margin.bottom / 2))
			.attr("text-anchor", "middle")  
			.style("font-size", "16px") 
			.style("text-decoration", "underline")  
			.text(subLabel);

	/*distanceMatrixPlot.append("text")
			.attr("x", -(width/2))              			  
			.attr("y", -height-margin.bottom+5)
			.attr("text-anchor", "middle")  
			.attr("transform", "rotate(-90)")
			.style("font-size", "15px") 
			.text("dependent");	

	distanceMatrixPlot.append("text")
			.attr("x", (width / 2))             
			.attr("y", -margin.top+10)
			.attr("text-anchor", "middle")  
			.style("font-size", "15px") 
			.text("independent");	
	*/
	var labels = distanceMatrixPlot.append('g')
		.attr('class', "labels");

	var columnLabels = labels.selectAll(".column-label")
	    .data(options.colLabels)
	    .enter().append("g")
	    .attr("class", "column-label")
	    .attr("transform", function(d, i) { return "translate(" + x(i) + "," + 0 + ")"; });

	columnLabels.append("line")
		.attr("class", level + " heatmap line")
		.style("stroke", "black")
	    .style("stroke-width", "1px")
	    .attr("x1", x.bandwidth() / 2)
	    .attr("x2", x.bandwidth() / 2)
	    .attr("y1", 0)
		.attr("y2", -5);

	columnLabels.append("text")
		.attr("class", level + " heatmap text")
		.attr("x", 8)
		.attr("y", x.bandwidth()/2-6)
		.attr("dy", ".82em")
	    .attr("text-anchor", "start")
	    .attr("transform", "rotate(-90)")
		.text(function(d, i) { return d; })
		.style("font-size", "10px");

	var rowLabels = labels.selectAll(".row-label")
	    .data(options.rowLabels)
	  .enter().append("g")
	    .attr("class", "row-label")
	    .attr("transform", function(d, i) { return "translate(" + 0 + "," + y(i) + ")"; });

	rowLabels.append("line")
		.attr("class", level + " heatmap line")
		.style("stroke", "black")
	    .style("stroke-width", "1px")
	    .attr("x1", 0)
	    .attr("x2", -5)
	    .attr("y1", y.bandwidth() / 2)
	    .attr("y2", y.bandwidth() / 2);

	rowLabels.append("text")
		.attr("class", level + " heatmap text")
	    .attr("x", -8)
	    .attr("y", y.bandwidth() / 2)
	    .attr("dy", ".32em")
	    .attr("text-anchor", "end")
		.text(function(d, i) { return d; })
		.style("font-size", "10px");	
}

function updateButtonColors(button, parent) {

	var defaultColor= "#797979";
	var pressedColor= "#0076BA";

	parent.selectAll("rect")
			.attr("fill",defaultColor)

	button.select("rect")
			.attr("fill",pressedColor)
}

const interactiveLevelButton = (selection, props) => {
	const {
		levelLabels,
		level,
		charts,
		width,
		addWidthArray,
		treeHeight
	} = props;

	var levelButtonGroups= selection.selectAll("g." + level + ".button")
						.data(levelLabels)
						.enter()
						.append("g")
						.attr("class", level + " button")
						.style("cursor","pointer")
						.on("click",function(d, i) {
							updateButtonColors(d3.select(this), d3.select(this.parentNode));

							// Visual Techniques
							d3.selectAll('.'+level+'.' + charts[0])
								.transition()
								.style('visibility', i == 0 ? 'visible' : 'hidden');
								
							d3.selectAll('.'+level + '.' + charts[1])
								.transition()
								.style('visibility', i == 1 ? 'visible' : 'hidden');

							d3.selectAll('.'+level + '.' + charts[2])
								.transition()
								.style('visibility', i == 2 ? 'visible' : 'hidden');								

							d3.selectAll('.'+level + '.' + charts[3])
								.transition()
								.style('visibility', i == 3 ? 'visible' : 'hidden');

							d3.selectAll('.'+level + '.' + charts[4])
								.transition()
								.style('visibility', i == 4 ? 'visible' : 'hidden');	

							// Level 1 keep both view and identity
							if (level == "level1") {
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

								if (i == 2 || i == 3 || i == 4) {
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
										
									var addWidth = 0;
									if (i == 2) {
										addWidth = addWidthArray[0];
									} else if (i == 3 || i == 4) {
										addWidth = addWidthArray[1];
									}

									var newWidth = width + addWidth + secondLevelWidth;
									
									// Change the global variable firstLevelWidth
									firstLevelWidth = addWidth;

									// Change SVG size
									d3.select('#node_link_tree svg')
										.attr('width', newWidth)
										.attr('height', treeHeight);	

									// Adjust level 1 nodes x postion
									d3.selectAll('.level1.list')
										.transition()
										.attr("transform", function() { 
											return "translate(" + firstLevelWidth + "," + 0 + ")"; });		
										
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
											var postion_x = d.y + firstLevelWidth + secondLevelWidth;
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
												"translate(" + (firstLevelWidth + secondLevelWidth) + ", 0)")
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
											return "translate(" + (d.y + secondLevelWidth) + "," + d.x + ")"; });											

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
								d3.selectAll('.'+level + '.rect')
									.transition()
									.style('visibility', 'visible');	
								d3.selectAll('.'+level + '.singledistrictmap')
										.transition()
										.style('visibility', 'hidden');	
								
								if (i == 2) {	
									d3.selectAll('.'+level + '.rect')
									.transition()
									.style('visibility', 'hidden');	
									d3.selectAll('.'+level + '.singledistrictmap')
										.transition()
										.style('visibility', 'visible');	
								}

								if (i == 2 || i == 3) {
									// Map button clicked
									d3.selectAll('.'+level + '.text')
									.transition()
									.style('visibility', 'visible');	
								}
							}

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
									.style('visibility', (i == 0 || i == 3 || i == 4) ? 'visible' : 'hidden');								
								d3.selectAll('.path.heatmap.level0')
									.transition()
									.style('visibility', (i == 1 || i == 2) ? 'visible' : 'hidden');	
								// Level 1 path
								// Check Level 2's visual technique
								if ((d3.select('.level2.scatterplot1d').style("visibility") == 'hidden')
									&& (d3.select('.level2.scatterplot2d').style("visibility") == 'hidden')) {
									// Level 1: list/heatmap; 
									/* Fix Later TODO trend type condition
									if (d3.select('.level2.barchart').style("visibility") == 'hidden') {*/
									// Level 2: list
									d3.selectAll('.path.list.node.level1')
										.transition()
										.style('visibility', (i == 0 || i == 3 || i == 4) ? 'visible' : 'hidden');
									d3.selectAll('.path.heatmap.node.level1')
										.transition()
										.style('visibility', (i == 1 || i == 2) ? 'visible' : 'hidden');	
									/*
									} else {
										// Level 2: barchart
										d3.selectAll('.path.list.barchart.level1')
											.transition()
											.style('visibility', (i == 0 || i == 3 || i == 4) ? 'visible' : 'hidden');
										d3.selectAll('.path.heatmap.barchart.level1')
											.transition()
											.style('visibility', (i == 1 || i == 2) ? 'visible' : 'hidden');	
									}*/

								} else {
									// Level 1: list/heatmap; level 2: scatterplot1d/scatterplot2d
									d3.selectAll('.path.list.scatterplot1d.level1')
										.transition()
										.style('visibility', (i == 0 || i == 3 || i == 4) ? 'visible' : 'hidden');
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
										
										// Todo fix later for level2 charts
										/*if (d3.select('.level2.barchart').style("visibility") == 'hidden') {
											// Level 2: list
											d3.selectAll('.path.list.node.level1')
												.transition()
												.style('visibility', 'visible');
											d3.selectAll('.path.heatmap.node.level1')
												.transition()
												.style('visibility', 'hidden');	
										} else {
											// Level 2: barchart
											d3.selectAll('.path.list.barchart.level1')
												.transition()
												.style('visibility', 'visible');
											d3.selectAll('.path.heatmap.barchart.level1')
												.transition()
												.style('visibility', 'hidden');	
										}*/

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
											addWidth = addWidthArray.find( ({ key }) => key === parentKey );

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
											addWidth = addWidthArray.find( ({ key }) => key === parentKey );

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
                .attr("dominant-baseline","central")
                .attr("fill","white")
                .text(function(d) {return d;})
}

function initVisibility() {
	// TODO condition by trend type
	// Aggregate level
	d3.selectAll('.level1.list').transition().style('visibility', "visible");
	d3.selectAll('.level1.heatmap').transition().style('visibility', "hidden");	
	d3.selectAll('.level1.coloredbarchart').transition().style('visibility', "hidden");	
	d3.selectAll('.level1.scatterplot').transition().style('visibility', "hidden");	
	d3.selectAll('.level1.doublehistogram').transition().style('visibility', "hidden");	
	d3.selectAll('.path.list').transition().style('visibility', "visible");
	d3.selectAll('.path.heatmap').transition().style('visibility', "hidden");	

	// Splitby level
	d3.selectAll('.level2.list').transition().style('visibility', "visible");
	d3.selectAll('.level2.scatterplot1d').transition().style('visibility', "hidden");	
	d3.selectAll('.path.list.scatterplot1d').transition().style('visibility', "hidden");	
	d3.selectAll('.level2.scatterplot2d').transition().style('visibility', "hidden");	
	d3.selectAll('.level2.barchart').transition().style('visibility', "hidden");	
	d3.selectAll('.path.list.barchart').transition().style('visibility', "hidden");	

	// Subgroup level
	d3.selectAll('.level3.list').transition().style('visibility', "visible");
	d3.selectAll('.level3.stripplot').transition().style('visibility', "hidden");	
	d3.selectAll('.level3.districtmap').transition().style('visibility', "hidden");	
	d3.selectAll('.level3.singledistrictmap').transition().style('visibility', "hidden");
	d3.selectAll('.level3.barchart').transition().style('visibility', "hidden");	
}