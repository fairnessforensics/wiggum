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

	var width = 650;
	var height = 2600;
	var margin = {top: 0, right: 50, bottom: 0, left: 100};
	var innerWidth = width - margin.left - margin.right;
	var innerHeight = height - margin.top - margin.bottom;

	var treeLayout = d3.tree().size([innerHeight, innerWidth]);

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
	data = agg_distance_heatmap_dict[0];
	heatmapMatrix = jsonto2darray(data.heatmap);

	if (data.detail_view_type === 'scatter' || data.detail_view_type == 'rank') {	
		
		rowLabels = [];
		colLabels = [];

		// get rows' labels
		for (var rowkey in data.heatmap) {
			rowLabels.push(rowkey);
		}

		// get columns' lables
		var first_row = data.heatmap[Object.keys(data.heatmap)[0]];
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
		levelLabels
	});

	// First level drawing
	var firstLevelG = g.selectAll('.level-1');

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
				return heatmapColorScale(value);
			}
		})
		.style("stroke", "black")
	    .style("stroke-width", "2px")
		.style("visibility", "hidden");

	// Second level - splitby
	// Generate interactive buttons
	levelLabels= ['\uf03a','SP'];
	var secondLevelG1 = g.select('.level-2');

	const secondLevelG1_position = secondLevelG1.attr('transform').split(/[\s,()]+/);
	const secondLevelG1_x = parseFloat(secondLevelG1_position[1]);

	//container for all buttons
	var secondLevelButtons= g.append("g")
						.attr("id","secondLevelButtons")
						.attr("transform",  "translate(" + secondLevelG1_x + ", 0)");

	secondLevelButtons.call(interactiveLevelButton, {
		levelLabels
	});

	// Second level drawing
	var secondLevelCircleRadius = 10;
	var secondLevelG = g.selectAll('.level-2');
	secondLevelG.append('circle')
		.attr('r', secondLevelCircleRadius)	
		.style('fill', '#fff')
		.style('stroke', 'black')
		.style('stroke-width', '2px')
		.style("fill-opacity", 1)
		.style("pointer-events", function(d) {
			return !d.depth ? "none" : "all";
		}); 			

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

	g.selectAll('.path heatmap').data(links)
		.enter().append('path')
		.attr('d', function(d, i) {
			return d.source.depth < 2 ? matrixLinkPathGenerator(d, i) : linkPathGenerator(d);
		})
		.attr("class", "path heatmap")
		.attr('fill', 'none')
		.attr('stroke', 'black')
		.style("stroke-width", "1px")
		.style("pointer-events", function(d, i) {
			return !d.source.depth ? "none" : "all";
		});

	g.selectAll('.path list').data(links)
		.enter().append('path')
		.attr('d', function(d, i) {
			return d.source.depth < 1 ? matrixLinkPathGenerator(d, i, 'list') : linkPathGenerator(d);
		})
		.attr("class", "path list")
		.attr('fill', 'none')
		.attr('stroke', 'black')
		.style("stroke-width", "1px")
		.style("pointer-events", function(d, i) {
			return !d.source.depth ? "none" : "all";
		})
		.style("visibility", "hidden");

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
		levelLabels
	} = props;

	var levelButtonGroups= selection.selectAll("g.button")
						.data(levelLabels)
						.enter()
						.append("g")
						.attr("class","button")
						.style("cursor","pointer")
						.on("click",function(d, i) {
							updateButtonColors(d3.select(this), d3.select(this.parentNode));
							if (i == 0) {
								// list
								d3.selectAll('.level1.list').transition().style('visibility', "visible");
								d3.selectAll('.level1.heatmap').transition().style('visibility', "hidden");	
								d3.selectAll('.path.list').transition().style('visibility', "visible");
								d3.selectAll('.path.heatmap').transition().style('visibility', "hidden");			
							} else {
								// heatmap
								d3.selectAll('.level1.list').transition().style('visibility', "hidden");
								d3.selectAll('.level1.heatmap').transition().style('visibility', "visible");
								d3.selectAll('.path.list').transition().style('visibility', "hidden");
								d3.selectAll('.path.heatmap').transition().style('visibility', "visible");								
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