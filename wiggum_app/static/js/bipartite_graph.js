var graph_data;

/**
 * Draw bipartite graph
 * 
 * @param data - distance heatmap.
 * @returns none.
 */
 function drawBipartiteGraph(dataAll) {

	var dataList = prepareGraphData(dataAll);
	graph_data = dataList[0];
	var node_list_len = dataList[1];
	var rowLabels = dataList[2];

	// Set margin left based on longest row label
	var longest_row_label = rowLabels.reduce(
		function (a, b) {
			return a.length > b.length ? a : b;
		}
	);

	var left_margin = longest_row_label.length*5;

	var margin = {top: 20, right: 150, bottom: 10, left: left_margin};
	var width = 300 + margin.left + margin.right;
	var height = margin.top + node_list_len * 30;

	var c10 = d3.scaleOrdinal(d3.schemeCategory10);
	var svg = d3.select("#bipartite_graph")
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var links = svg.selectAll("link")
		.data(graph_data.links)
		.enter()
		.append("line")
		.attr("class", "link")
		.attr("id", function(l) {
			return 'link_' + l.source + '_' + l.target})
		.attr("x1", function(l) {
			var sourceNode = graph_data.nodes.filter(function(d, i) {
				return i == l.source
			})[0];
			d3.select(this).attr("y1", sourceNode.y);
			return sourceNode.x
		})
		.attr("x2", function(l) {
			var targetNode = graph_data.nodes.filter(function(d, i) {
				return i == l.target
			})[0];

			d3.select(this).attr("y2", targetNode.y);
			return targetNode.x
		})
		.attr("fill", "none")
		.attr("stroke", "white");
	
	// continous color for overview
	var heatmapColors = ['#ffffe0', '#caefdf','#abdad9','#93c4d2', '#7daeca','#6997c2', '#5681b9','#426cb0', '#2b57a7','#00429d'];
	// continous color scale for overview
	var heatmapColorScale = d3.scaleQuantize()
							.domain([0, 1])
							.range(heatmapColors);

	var nodes = svg.selectAll(".node")
		.data(graph_data.nodes)
		.enter().append("g")
//		.attr("class", "node");
		.attr("class", function(d) {
			if (d.type == 'source') {
				return "source_node";
			} else {
				return "target_node";
			}
		});
	
	nodes.append("circle")
//		.attr("class", function(d) {
//			if (d.type == 'source') {
//				return "source_node";
//			} else {
//				return "target_node";
//			}
//		})	
//		.attr("cx", function(d) {
//			return d.x
//		})
//		.attr("cy", function(d) {
//			return d.y
//		})
		.attr("r", 10)
		.style("stroke-width", "1px")
		.style("stroke", "black")
		.style("fill", function(d, i) {
			return heatmapColorScale(d.value);
		})
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

	nodes.append("text")
		.attr("x", function(d) {return d.x})
		.attr("y", function(d) {return d.y})
		.attr("dx", function(d) {
			if (d.type == "source") {
				return "-.62em";
			} else {
				return ".62em";
			}
		})		
		.attr("dy", ".28em")
		.attr("text-anchor", function(d) {
			if (d.type == "source") {
				return 'end';
			} else {
				return 'start';
			}
		})
		.text(function(d, i) { return d.name; })
		.style("font-size", "20px");
}

/**
 * Format data
 * 
 * @param data - distance heatmap.
 * @returns data.
 * @returns max list length.
 */
 function prepareGraphData(dataAll) {
	var g_data;

	for (var key in dataAll){
		// Now only regression trend, loop only once. TODO multiple trend types
		data = dataAll[key];
		heatmapMatrix = jsonto2darray(data.heatmap);

		rowLabels = [];
		colLabels = [];

		// get rows' labels
		for (var rowkey in data.heatmap) {
			row = data.heatmap[rowkey];
			rowLabels.push(rowkey);
		}

		// get columns' lables
		var first_row = data.heatmap[Object.keys(data.heatmap)[0]];
		for (var colkey in first_row) {
			colLabels.push(colkey);
		}

		//var maxListLen = Math.max(rowLabels.length ,colLabels.length);
		var maxListLen = rowLabels.length * colLabels.length;

		var sourceX = 100, targetX = 300;

		var targetY_interval = 30;	
		var sourceY_interval = targetY_interval * colLabels.length;

		// Create node list
		var node_list = [];

		// Add source nodes
		rowLabels.forEach(function(value, i) {
			var singleObj = {};
			singleObj['name'] = value;
			singleObj['type'] = 'source';
			singleObj['x'] = sourceX;
			singleObj['y'] = i * sourceY_interval;
			node_list.push(singleObj);
		});		

		// Add target nodes		
		colLabels.forEach(function(value, i) {
			rowLabels.forEach(function(rowValue, j) {
				var singleObj = {};
				singleObj['name'] = value;
				singleObj['type'] = 'target';
				singleObj['source'] = rowValue;	
				singleObj['source_id'] = j;		
				singleObj['target_id'] = (i+1) * rowLabels.length + j;								
				singleObj['value'] = heatmapMatrix[j][i];			
				singleObj['x'] = targetX;
				singleObj['y'] = (i * rowLabels.length + j) * targetY_interval;
				node_list.push(singleObj);
			});
		});		

		// Create link list
		var link_list = [];
		colLabels.forEach(function(value, i) {
			rowLabels.forEach(function(value, j) {
				var singleObj = {};
				singleObj['source'] = j;
				singleObj['target'] = rowLabels.length + rowLabels.length * i + j;
				link_list.push(singleObj);
			});		
		});	

		g_data = {
			nodes: node_list,
			links: link_list
		};
	}

	return [g_data, maxListLen, rowLabels];
}

function sortColorViewpoint() {
	var new_graph_data = sortData();
	
	sortLink(new_graph_data);
	// Not working since sortNodes() solves the link issue
	//sortNodes();
}

function sortLink(new_graph_data) {

	var svg = d3.select("#bipartite_graph").select('svg').select('g');

	d3.select("#bipartite_graph").selectAll('.link').remove();

	var links = svg.selectAll("link")
		.data(new_graph_data.links)
		.enter()
		.append("line")
		.attr("class", "link")
		.attr("x1", function(l) {
			var sourceNode = new_graph_data.nodes.filter(function(d, i) {			
				return i == l.source
			})[0];
			d3.select(this).attr("y1", sourceNode.y);
			return sourceNode.x
		})
		.attr("x2", function(l) {
			var targetNode = new_graph_data.nodes.filter(function(d, i) {
				return d.source_id == l.source && d.target_id == l.target
			})[0];

			d3.select(this).attr("y2", targetNode.y);
			return targetNode.x
		})
		.attr("fill", "none")
		.attr("stroke", "white");

	// Move the lines to back
	d3.selection.prototype.moveToBack = function() {  
			return this.each(function() { 
				var firstChild = this.parentNode.firstChild; 
				if (firstChild) { 
					this.parentNode.insertBefore(this, firstChild); 
				} 
			});
		};	
	svg.selectAll(".link").moveToBack();
}

function sortData() {
	var nodes = graph_data.nodes;

	// get target nodes
	var target_node_list = [];
	var source_node_list = [];
	nodes.forEach(function(obj, i) {
		if (obj.type == 'target'){
			target_node_list.push(obj);
		} else {
			source_node_list.push(obj);
		}
	});	

	target_node_list.sort(function (a, b) {
		return b.value - a.value;
	});

	// Change target node y position
	var targetY_interval = 30;	
	target_node_list.forEach(function(obj, i) {
		obj['y'] = i * targetY_interval;
	});	

	var link_list = [];
	target_node_list.forEach(function(node_obj, i) {
		var singleObj = {};
		singleObj['source'] = node_obj.source_id;
		singleObj['target'] = node_obj.target_id;
		link_list.push(singleObj);
	});		

	var graph_data_sorted = {
		nodes: source_node_list.concat(target_node_list),
		links: link_list
	};

	return graph_data_sorted;

}

function sortNodes() {
	var nodes = d3.select("#bipartite_graph")		
					.selectAll(".target_node")
					.sort((a,b) => d3.descending(a.value, b.value))
					.transition()
					.duration(1000);

	nodes.select("circle")
		.attr("y", 0)
		.attr("transform", function(d, i) { 
			var link_id = '#link_' +d.source_id + '_' + d.target_id;

			var link = d3.select("#bipartite_graph")
						.select(link_id)
						.transition()
						.duration(1000)										
						.attr("y2", 30 * i);

			return "translate(" + d.x + "," + 30 * i + ")"; });
	
	nodes.select("text")
		.attr("y", 0)
		.attr("transform", function(d, i) { return "translate(0," + 30 * i + ")"; });
}

/* JSON Example
	var data = {
		nodes: [
			{ name: "A", x: 100, y: 100 }, 
			{ name: "B", x: 100, y: 200}, 
			{ name: "C", x: 300, y: 100}, 
			{ name: "D", x: 300, y: 200},
			{ name: "E", x: 300, y: 300}			
		],
		links: [
			{source: 0,target: 2}, 
			{source: 0,target: 3},
		 	{source: 0,target: 4},
		 	{source: 1,target: 2},
		 	{source: 1,target: 3},
		 	{source: 1,target: 4}			  
		]
	};
*/