/**
 * Draw bipartite graph
 * 
 * @param data - distance heatmap.
 * @returns none.
 */
 function drawBipartiteGraph(dataAll) {

	var dataList = prepareGraphData(dataAll);
	var data = dataList[0];
	var node_list_len = dataList[1];
	var rowLabels = dataList[2];

	// Set margin left based on longest row label
	var longest_row_label = rowLabels.reduce(
		function (a, b) {
			return a.length > b.length ? a : b;
		}
	);

	var left_margin = longest_row_label.length*5;

	var margin = {top: 10, right: 150, bottom: 10, left: left_margin};
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
		.data(data.links)
		.enter()
		.append("line")
		.attr("class", "link")
		.attr("x1", function(l) {
			var sourceNode = data.nodes.filter(function(d, i) {
				return i == l.source
			})[0];
			d3.select(this).attr("y1", sourceNode.y);
			return sourceNode.x
		})
		.attr("x2", function(l) {
			var targetNode = data.nodes.filter(function(d, i) {
				return i == l.target
			})[0];
			d3.select(this).attr("y2", targetNode.y);
			return targetNode.x
		})
		.attr("fill", "none")
		.attr("stroke", "white");
	
	var nodes = svg.selectAll(".node")
		.data(data.nodes)
		.enter().append("g")
		.attr("class", "node");
	
	nodes.append("circle")
		.attr("cx", function(d) {
			return d.x
		})
		.attr("cy", function(d) {
			return d.y
		})
		.attr("r", 10)
		.attr("fill", '#000')

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
	   // .attr("text-anchor", "end")
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
				singleObj['x'] = targetX;
				singleObj['y'] = (i * rowLabels.length + j) * targetY_interval;
				node_list.push(singleObj);
			});
		});		
		console.log(node_list);
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
		console.log(link_list);

		var data = {
			nodes: node_list,
			links: link_list
		};
	}

	return [data, maxListLen, rowLabels];
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