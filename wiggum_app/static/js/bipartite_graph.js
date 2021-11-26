/**
 * Draw bipartite graph
 *
 * @returns none.
 */
 function drawBipartiteGraph() {

	var data = {
		nodes: [
			{ name: "A", x: 100, y: 100 }, 
			{ name: "B", x: 100, y: 300}, 
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
	
	var c10 = d3.scaleOrdinal(d3.schemeCategory10);
	var svg = d3.select("#bipartite_graph")
		.append("svg")
		.attr("width", 500)
		.attr("height", 500);

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
	
	var nodes = svg.selectAll("node")
		.data(data.nodes)
		.enter()
		.append("circle")
		.attr("class", "node")
		.attr("cx", function(d) {
		return d.x
		})
		.attr("cy", function(d) {
		return d.y
		})
		.attr("r", 15)
		.attr("fill", function(d, i) {
		return c10(i);
		});
}

