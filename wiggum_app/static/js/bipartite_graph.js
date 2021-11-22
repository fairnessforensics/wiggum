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

/**
 * Draw bipartite graph
 *
 * @returns none.
 */
 function drawBipartiteGraph1() {

	var width = 500,
	height = 500;

	var svg = d3.select("#bipartite_graph")
				.append("svg")
				.attr("width", width)
				.attr("height", height);

	var simulation = d3.forceSimulation()
						.force('charge', d3.forceManyBody()
											.strength(-2000)
											.distanceMax(300)
						)
						.force("link", d3.forceLink().id(function(d) { return d.id; }))
						.force("x", d3.forceX(width / 2))
						.force("y", d3.forceY(height / 2))
						.force("centerx", d3.forceX(width / 2).strength(1));


	const graph2 = {
	"nodes": [
		{"id": "1", "group": 0},
		{"id": "2", "group": 0},
		{"id": "3", "group": 0},
		{"id": "4", "group": 1},
		{"id": "5", "group": 1},
		{"id": "6", "group": 1},
		{"id": "7", "group": 1}
	],
	"links": [
		{"source": "1", "target": "4", "value": 1},
		{"source": "1", "target": "5", "value": 1},
		{"source": "1", "target": "6", "value": 1},
		{"source": "2", "target": "4", "value": 1},
		{"source": "2", "target": "5", "value": 1},
		{"source": "2", "target": "6", "value": 1},
		{"source": "3", "target": "4", "value": 1},
		{"source": "3", "target": "5", "value": 1},
		{"source": "3", "target": "6", "value": 1},		
		{"source": "1", "target": "7", "value": 1},	
		{"source": "2", "target": "7", "value": 1},	
		{"source": "3", "target": "7", "value": 1}			
	]
	}
	const graph = {
		"nodes": [
			{"id": "1", "group": 0},
			{"id": "2", "group": 0},
			{"id": "3", "group": 0},
			{"id": "4", "group": 0},
			{"id": "5", "group": 0},
			{"id": "6", "group": 0},
			{"id": "7", "group": 0},
			{"id": "8", "group": 1},
			{"id": "9", "group": 1},
			{"id": "10", "group": 1}
		],
		"links": [
			{"source": "1", "target": "8", "value": 1},
			{"source": "1", "target": "9", "value": 1},
			{"source": "1", "target": "10", "value": 1},
			{"source": "2", "target": "8", "value": 1},
			{"source": "2", "target": "9", "value": 1},
			{"source": "2", "target": "10", "value": 1},
			{"source": "3", "target": "8", "value": 1},
			{"source": "3", "target": "9", "value": 1},
			{"source": "3", "target": "10", "value": 1},		
			{"source": "4", "target": "8", "value": 1},	
			{"source": "4", "target": "9", "value": 1},	
			{"source": "4", "target": "10", "value": 1},
			{"source": "5", "target": "8", "value": 1},	
			{"source": "5", "target": "9", "value": 1},	
			{"source": "5", "target": "10", "value": 1}	,
			{"source": "6", "target": "8", "value": 1},	
			{"source": "6", "target": "9", "value": 1},	
			{"source": "6", "target": "10", "value": 1}	,
			{"source": "7", "target": "8", "value": 1},	
			{"source": "7", "target": "9", "value": 1},	
			{"source": "7", "target": "10", "value": 1}						
		]
		}
	positionNodes();

	function positionNodes() {

		var lastNodeId = graph.nodes.length;
		graph.nodes.forEach(function(d, i) {
		  d.y = (width / lastNodeId) * i;
		  if (i % 2 == 0) d.x = d.y;
		  else d.x = width - d.y;
		});
	  }

	var link = svg.append("g")
					.style("stroke", "#aaa")
					.selectAll("line")
					.data(graph.links)
					.enter().append("line");

	var node = svg.append("g")
					.attr("class", "nodes")
					.selectAll("circle")
					.data(graph.nodes)
					.enter().append("circle")
					.attr("r", 2);

	var label = svg.append("g")
					.attr("class", "labels")
					.selectAll("text")
					.data(graph.nodes)
					.enter().append("text")
					.attr("class", "label")
					.text(function(d) { return d.id; });
					

	simulation.nodes(graph.nodes)
		.on("tick", ticked);

	simulation.force("link")
		.links(graph.links);

	function ticked() {
		link.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });

		var k = this.alpha() * 0.3;

		var foci = [{x:-500,y:100},{x:500,y:100}];

		graph.nodes.forEach(function(n, i) {
			n.y += (foci[n.group]["y"] - n.y) * k;
			n.x += (foci[n.group]["x"] - n.x) * k;
		}); 

		node.attr("r", 16)
			.style("fill", "#efefef")
			.style("stroke", "#424242")
			.style("stroke-width", "1px")
			.attr("cx", function (d) { return d.x; })
			.attr("cy", function(d) { return d.y; });

		label.attr("x", function(d) { return d.x; })
			.attr("y", function (d) { return d.y; })
			.style("font-size", "10px").style("fill", "#333");
			}

}


