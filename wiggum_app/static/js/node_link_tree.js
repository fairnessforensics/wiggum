// continous color for overview
var heatmapConColors = ['#ffffe0', '#caefdf','#abdad9','#93c4d2', '#7daeca','#6997c2', '#5681b9','#426cb0', '#2b57a7','#00429d'];
// continous color scale for overview
var heatmapColorScale = d3.scaleQuantize()
						.domain([0, 1])
						.range(heatmapConColors);

/**
 * Draw node link tree
 * 
 * @param data - result table.
 * @returns none.
*/
function drawNodeLinkTree(data) {

    var result_table = JSON.parse(data.result_df);

	var width = 850;
	var height = 2600;
	var margin = {top: 0, right: 40, bottom: 0, left: 60};
	var innerWidth = width - margin.left - margin.right;
	var innerHeight = height - margin.top - margin.bottom;

	var treeLayout = d3.tree()
					.size([innerHeight, innerWidth]);
					//.nodeSize([25, innerWidth/4]);

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
				.attr('height', height)
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

	drawHeatmap({
		container : rootG,
		data	  : matrix_data,
		rowLabels : rowLabels,
		colLabels : colLabels,			
		subLabel  : 'Pattern',
		level: 'level0'
	});

	// First level - aggregate pattern
	// Generate interactive buttons
	var levelLabels= ['\uf03a','\uf00a'];
	var firstLevelG1 = g.select('.level-1');

	const firstLevelG1_position = firstLevelG1.attr('transform').split(/[\s,()]+/);
	const firstLevelG1_x = parseFloat(firstLevelG1_position[1]);

	//container for all buttons
	var firstLevelButtons= g.append("g")
						.attr("id","firstLevelButtons")
						.attr("transform",  "translate(" + firstLevelG1_x + ", 0)");

	firstLevelButtons.call(interactiveLevelButton, {
		levelLabels,
		level: 'level1',
		charts: ['list', 'heatmap']
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
		.style("visibility", "hidden");

	// Visual Tech 2: Heatmap
	firstLevelG.each(function (d) {

		var keyArray = d.data.key.split(",");

		var container = d3.select(this);

		drawHeatmap({
			container : container,
			data	  : matrix_data,
			rowLabels : rowLabels,
			colLabels : colLabels,			
			subLabel  : '',
			selDep: keyArray[0],
			selIndep: keyArray[1],
			level: 'level1'
		});
	})
		
	// Second level - splitby
	// Generate interactive buttons
	levelLabels= ['\uf03a', 'SP1', 'SP2'];
	var secondLevelG1 = g.select('.level-2');

	const secondLevelG1_position = secondLevelG1.attr('transform').split(/[\s,()]+/);
	const secondLevelG1_x = parseFloat(secondLevelG1_position[1]);

	//container for all buttons
	var secondLevelButtons= g.append("g")
						.attr("id","secondLevelButtons")
						.attr("transform",  "translate(" + secondLevelG1_x + ", 0)");

	secondLevelButtons.call(interactiveLevelButton, {
		levelLabels,
		level: 'level2',
		charts: ['list', 'scatterplot1d', 'scatterplot2d']
	});

	// Second level data
	var agg_splitby_table_dict = data.agg_splitby_table_dict;
	var splitby_data = agg_splitby_table_dict[0];
	var splitby_table = JSON.parse(splitby_data.splitby_table);

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
		}); 			

	// Visual Tech 2: 1d scatter plot
	root.children.forEach(function (d) {
		var yColumn = 'mean_distance';
		var height = d.children[d.children.length - 1].x - d.children[0].x;
		var keyArray = d.data.key.split(",");
		var chart_data = splitby_table.filter(obj => {
			return obj.dependent === keyArray[0]
					&& obj.independent === keyArray[1]
		  })
		var secondLevelG1 = g.select('.level-2' + '.' + keyArray[0] + '.' + keyArray[1]);
		/*secondLevelG1.call(oneDimensionalScatterPlot, {
			yValue: d => d[yColumn],
			circleRadius: secondLevelCircleRadius,
			height,
			chart_data,
			level: 'level2'
		});	*/	

		secondLevelG1.call(oneDimensionalScatterPlot, {
			xValue: d => d[yColumn],
			yValue: d => d[yColumn],
			circleRadius: secondLevelCircleRadius,
			margin: { top: 10, right: 40, bottom: 88, left: 150 },
			width: height,
			height,
			chart_data,
			level: 'level2'
		});

	});

	// Third level drawing
	// Visual Tech 1: Tree nodes
	thirdLevelG = g.selectAll('.level-3');
	thirdLevelG.append('rect')
		.attr("class", "cell")
		.attr("x", -rectWidth/2)
		.attr("y", -rectHeight/2)		
		.attr("width", rectWidth)
		.attr("height", rectHeight)
		.style("fill", function(d) {
			return heatmapColorScale(d.data.distance);
		})
		.style("stroke", "black")
		.style("stroke-width", "2px");

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
				.source(function(d, i) {
					
					if (d.source.depth == 0) {
						var keyArray = d.target.data.key.split(",");
						var {r, c} = getMatrixIndex(matrix_data, keyArray[0], keyArray[1]);
						return [d.source.y + x(c) + x.bandwidth()/2, d.source.x + y(r)+y.bandwidth()/2];
					} else {
						var keyArray = d.source.data.key.split(",");
						var {r, c} = getMatrixIndex(matrix_data, keyArray[0], keyArray[1]);
						return [d.source.y + x(c) + x.bandwidth()-3, d.source.x + y(r)+y.bandwidth()/2];
					}
				}).target(function(d, i, type) {
					if (d.source.depth == 0) {
						// Level 1
						if (type === 'list') {
							return [d.target.y  - rectWidth/2, d.target.x];
						}
						var keyArray = d.target.data.key.split(",");
						var {r, c} = getMatrixIndex(matrix_data, keyArray[0], keyArray[1]);
						return [d.target.y + x(c) + x.bandwidth()/2, d.target.x + y(r)+y.bandwidth()/2];
					} else {
						// Level 2
						return [d.target.y - secondLevelCircleRadius, d.target.x];
					}
				});

	var scatterplot1dLinkPathGenerator 
			= d3.linkHorizontal()
				.source(function(d, i, type) {
					if (d.source.depth == 1) {
						if (type === 'heatmap') {
							var keyArray = d.source.data.key.split(",");
							var {r, c} = getMatrixIndex(matrix_data, keyArray[0], keyArray[1]);
							return [d.source.y + x(c) + x.bandwidth()-3, d.source.x + y(r)+y.bandwidth()/2];
						}
						return [d.source.y + rectWidth / 2, d.source.x];
					} else if (d.source.depth == 2) { 

						var dependent = d.target.data.dependent;
						var independent = d.target.data.independent;
						var splitby = d.target.data.splitby;
						// TODO dep and independent also need to fix the space in class
						splitby = splitby.replace(/\s+/g, '.');
						var selectClass = '.level2.scatterplot1d.circle' + '.' + dependent
											+ '.' + independent + '.' + splitby;
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
						// TODO dep and independent also need to fix the space in class
						splitby = splitby.replace(/\s+/g, '.');
						var selectClass = '.level2.scatterplot1d.circle' + '.' + keyArray[0]
											+ '.' + keyArray[1] + '.' + splitby;
						var y_position = parseFloat(d3.select(selectClass).attr('cy'));
						var secondLevelG1 = g.select('.level-2' + '.' + keyArray[0] + '.' + keyArray[1]);
						const secondLevelG1_position = secondLevelG1.attr('transform').split(/[\s,()]+/);
						const secondLevelG1_y = parseFloat(secondLevelG1_position[2]);
						
						return [d.target.y - secondLevelCircleRadius, secondLevelG1_y + y_position];
					} else if (d.source.depth == 2) { 
						return [d.target.y - rectWidth / 2, d.target.x];
					}else {}
				});	

	// Path for heatmap
	g.selectAll('.path heatmap node').data(links)
		.enter().append('path')
		.attr('d', function(d, i) {
			if (d.source.depth < 2) {
				return matrixLinkPathGenerator(d, i);
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
				return scatterplot1dLinkPathGenerator(d, i, 'heatmap');
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
			return d.source.depth < 1 ? matrixLinkPathGenerator(d, i, 'list') : linkPathGenerator(d);
		})
		.attr("class", d => "path list node level" + d.source.depth)
		.attr('fill', 'none')
		.attr('stroke', 'black')
		.style("stroke-width", "1px")
		.style("pointer-events", function(d, i) {
			return !d.source.depth ? "none" : "all";
		})
		.style("visibility", "hidden");

		initVisibility();

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
	    height = 90,
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
		.attr("id", "distanceMatrixPlot");
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
    	.transition()
		.style("fill", function(d, i) {
			if (d.value == 99) {
				return '#808080';
			} else {
				return heatmapColorScale(d.value);
			}
		});

	//cells.style("opacity", 0.1)
	//	.filter(function(d){
	//		if (legendValue != -1) {
	//			return d.value == legendValue;
	//		} else 
	//		{
	//			return d;
	//		}			
	//	})
	//	.style("opacity", 1);

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
		charts
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
								.style('visibility', i ? 'hidden' : 'visible');
								
							d3.selectAll('.'+level + '.' + charts[1])
								.transition()
								.style('visibility', i ? 'visible' : 'hidden');

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
									.style('visibility', i ? 'hidden' : 'visible');									
								d3.selectAll('.path.heatmap.level0')
									.transition()
									.style('visibility', i ? 'visible' : 'hidden');	
								// Level 1 path
								// Check Level 2's visual technique
								if (d3.select('.level2.scatterplot1d').style("visibility") == 'hidden') {
									// Level 1: list/heatmap; level 2: list
									d3.selectAll('.path.list.node.level1')
										.transition()
										.style('visibility', i ? 'hidden' : 'visible');
									d3.selectAll('.path.heatmap.node.level1')
										.transition()
										.style('visibility', i ? 'visible' : 'hidden');	
								} else {
									// Level 1: list/heatmap; level 2: scatterplot1d
									d3.selectAll('.path.list.scatterplot1d.level1')
										.transition()
										.style('visibility', i ? 'hidden' : 'visible');	
									d3.selectAll('.path.heatmap.scatterplot1d.level1')
										.transition()
										.style('visibility', i ? 'visible' : 'hidden');	
								}

							} else if (level == "level2") {
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
									// Level 1: list; level 2: list/scatterplot1d
									d3.selectAll('.path.list.node.level1')
										.transition()
										.style('visibility', i ? 'hidden' : 'visible');
									d3.selectAll('.path.list.scatterplot1d.level1')
										.transition()
										.style('visibility', i ? 'visible' : 'hidden');	
								} else {
									// Level 1: heatmap; level 2: list/scatterplot1d
									d3.selectAll('.path.heatmap.node.level1')
										.transition()
										.style('visibility', i ? 'hidden' : 'visible');	
									d3.selectAll('.path.heatmap.scatterplot1d.level1')
										.transition()
										.style('visibility', i ? 'visible' : 'hidden');	
								}
								// Level 2 path
								d3.selectAll('.path.list.node.level2')
									.transition()
									.style('visibility', i ? 'hidden' : 'visible');									
								d3.selectAll('.path.scatterplot1d.level2')
									.transition()
									.style('visibility', i ? 'visible' : 'hidden');	

							}
							/*
							if (level == "level1") {
								// Check Level 2's visual technique
								if (d3.select('.level2.scatterplot1d').style("visibility") == 'hidden') {
									// Level 1: list/heatmap; level 2: list
									d3.selectAll('.path.list.level0')
										.transition()
										.style('visibility', i ? 'hidden' : 'visible');
									d3.selectAll('.path.list.level1')
										.transition()
										.style('visibility', i ? 'hidden' : 'visible');
									d3.selectAll('.path.heatmap')
										.transition()
										.style('visibility', i ? 'visible' : 'hidden');	
									d3.selectAll('.path.list.scatterplot1d')
										.transition()
										.style('visibility', 'hidden');	
									d3.selectAll('.path.heatmap.scatterplot1d')
										.transition()
										.style('visibility', 'hidden');	
								} else {
									// Level 1: list/heatmap; level 2: scatterplot1d
									d3.selectAll('.path.list.level0')
										.transition()
										.style('visibility', i ? 'hidden' : 'visible');
									d3.selectAll('.path.list.level1')
										.transition()
										.style('visibility', 'hidden');
									d3.selectAll('.path.heatmap.level0')
										.transition()
										.style('visibility', i ? 'visible' : 'hidden');	
									d3.selectAll('.path.heatmap.level1')
										.transition()
										.style('visibility', 'hidden');	
									d3.selectAll('.path.list.scatterplot1d')
										.transition()
										.style('visibility', i ? 'hidden' : 'visible');	
									d3.selectAll('.path.heatmap.scatterplot1d')
										.transition()
										.style('visibility', i ? 'visible' : 'hidden');										
								}
							} else if (level == "level2") {
								// Check Level 1's visual technique
								if (d3.select('.level1.heatmap').style("visibility") == 'hidden') {
									// Level 1: list; level 2: list/scatterplot1d
									d3.selectAll('.path.heatmap.level1')
										.transition()
										.style('visibility', 'hidden');	
									d3.selectAll('.path.list.level1')
										.transition()
										.style('visibility', i ? 'hidden' : 'visible');
									d3.selectAll('.path.list.scatterplot1d')
										.transition()
										.style('visibility', i ? 'visible' : 'hidden');	
									d3.selectAll('.path.heatmap.scatterplot1d')
										.transition()
										.style('visibility', 'hidden');		
								} else {
									// Level 1: heatmap; level 2: list/scatterplot1d
									d3.selectAll('.path.heatmap.level1')
										.transition()
										.style('visibility', i ? 'hidden' : 'visible');	
									d3.selectAll('.path.list.level1')
										.transition()
										.style('visibility', 'hidden');
									d3.selectAll('.path.list.scatterplot1d')
										.transition()
										.style('visibility', 'hidden');	
									d3.selectAll('.path.heatmap.scatterplot1d')
										.transition()
										.style('visibility', i ? 'visible' : 'hidden');			
								}
							}
							*/
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
				.attr("x",function(d,i) {return x0+(bWidth+bSpace)*i;})
				.attr("y",y0)
				.attr("rx",5) //rx and ry give the buttons rounded corners
				.attr("ry",5)
				.attr("fill","#797979")

    //adding text to each toggle button group, centered 
    //within the toggle button rect
    levelButtonGroups.append("text")
                .attr("class","buttonText")
                .attr("font-family","FontAwesome")
                .attr("x",function(d,i) {
                    return x0 + (bWidth+bSpace)*i + bWidth/2;
                })
                .attr("y",y0+bHeight/2)
                .attr("text-anchor","middle")
                .attr("dominant-baseline","central")
                .attr("fill","white")
                .text(function(d) {return d;})
}

function initVisibility() {
	d3.selectAll('.level1.list').transition().style('visibility', "visible");
	d3.selectAll('.level1.heatmap').transition().style('visibility', "hidden");	
	d3.selectAll('.path.list').transition().style('visibility', "visible");
	d3.selectAll('.path.heatmap').transition().style('visibility', "hidden");	

	// Splitby level
	d3.selectAll('.level2.list').transition().style('visibility', "visible");
	d3.selectAll('.level2.scatterplot1d').transition().style('visibility', "hidden");	
	d3.selectAll('.path.list.scatterplot1d').transition().style('visibility', "hidden");	
	
}