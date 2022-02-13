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

	if (data.detail_view_type == 'scatter') {	
		
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
		subLabel  : 'Pattern'
	});

	firstLevelG = g.selectAll('.level-1');

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
			selIndep: keyArray[1]
		});
	})
					
	/*firstLevelG.append('rect')
		.attr("class", "cell")
	    .attr("x", -10)
	    .attr("y", -10)		
		.attr("width", 20)
	    .attr("height", 20)
		.style('fill', '#fff')
		.style("stroke", "black")
	    .style("stroke-width", "2px");
		*/

	secondLevelG = g.selectAll('.level-2');
	secondLevelG.append('circle')
		.attr('r', 10)	
		.style('fill', '#fff')
		.style('stroke', 'steelblue')
		.style('stroke-width', '2px')
		.style("opacity", function(d, i) {
			return !d.depth ? 0 : 1;
		})
		.style("pointer-events", function(d, i) {
			return !d.depth ? "none" : "all";
		}); 			

	thirdLevelG = g.selectAll('.level-3');
	thirdLevelG.append('rect')
		.attr("class", "cell")
		.attr("x", -10)
		.attr("y", -10)		
		.attr("width", 20)
		.attr("height", 20)
		.style('fill', '#fff')
		.style("stroke", "black")
		.style("stroke-width", "2px");

	nodeEnter.append('text')
		.attr('dx', d => d.children ? '0em' : '1em')
		.attr('dy', d => d.children ? '1.5em' : '0.32em')
		.attr('text-anchor', d => d.children ? 'middle' : 'start')
		.attr('pointer-events', 'none')
		.text(function(d) {
			if (d.depth > 1) {
				return d.height ? d.data.key : d.data.subgroup
			}
		})
		.style("opacity", function(d, i) {
			return !d.depth ? 0 : 1;
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

	var linkPathGenerator = d3.linkHorizontal()
								.x(d => d.y)
								.y(d => d.x);

	var matrixLinkPathGenerator 
			= d3.linkHorizontal()
				.source(function(d, i) {
					
					if (d.source.depth == 0) {
						var keyArray = d.target.data.key.split(",");
						var {r, c} = matrixIndexed(matrix_data, keyArray[0], keyArray[1]);
						return [d.source.y + x(c) + x.bandwidth()/2, d.source.x + y(r)+y.bandwidth()/2];
					} else {
						var keyArray = d.source.data.key.split(",");
						var {r, c} = matrixIndexed(matrix_data, keyArray[0], keyArray[1]);
						return [d.source.y + x(c) + x.bandwidth()-3, d.source.x + y(r)+y.bandwidth()/2];
					}
				}).target(function(d, i) {
					if (d.source.depth == 0) {
						var keyArray = d.target.data.key.split(",");
						var {r, c} = matrixIndexed(matrix_data, keyArray[0], keyArray[1]);
						return [d.target.y + x(c) + x.bandwidth()/2, d.target.x + y(r)+y.bandwidth()/2];
					} else {
						return [d.target.y, d.target.x];
					}
				})

	g.selectAll('path').data(links)
		.enter().append('path')
		.attr('d', function(d, i) {
			return d.source.depth < 2 ? matrixLinkPathGenerator(d, i) : linkPathGenerator(d);
		})
		.attr('fill', 'none')
		.attr('stroke', 'black')
		.style("stroke-width", "1px")
		.style("pointer-events", function(d, i) {
			return !d.source.depth ? "none" : "all";
		});
}

function matrixIndexed(details, dep, indep) {
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

	// continous color for overview
	var heatmapConColors = ['#ffffe0', '#caefdf','#abdad9','#93c4d2', '#7daeca','#6997c2', '#5681b9','#426cb0', '#2b57a7','#00429d'];
	// continous color scale for overview
	var heatmapColorScale = d3.scaleQuantize()
							.domain([0, 1])
							.range(heatmapConColors);

	var margin = {top: 93, right: 20, bottom: 30, left: 133},
	    width = 90,
	    height = 90,
	    data = options.data,
	    container = options.container,
		subLabel = options.subLabel;

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
		.attr("class", "cell")
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
					return "cell clicked";
				}
			}
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
		.style("stroke", "black")
	    .style("stroke-width", "1px")
	    .attr("x1", x.bandwidth() / 2)
	    .attr("x2", x.bandwidth() / 2)
	    .attr("y1", 0)
		.attr("y2", -5);

	columnLabels.append("text")
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
		.style("stroke", "black")
	    .style("stroke-width", "1px")
	    .attr("x1", 0)
	    .attr("x2", -5)
	    .attr("y1", y.bandwidth() / 2)
	    .attr("y2", y.bandwidth() / 2);

	rowLabels.append("text")
	    .attr("x", -8)
	    .attr("y", y.bandwidth() / 2)
	    .attr("dy", ".32em")
	    .attr("text-anchor", "end")
		.text(function(d, i) { return d; })
		.style("font-size", "10px");	
}
