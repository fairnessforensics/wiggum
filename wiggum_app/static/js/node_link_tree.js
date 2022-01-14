/**
 * Draw node link tree
 * 
 * @param data - result table.
 * @returns none.
*/
function drawNodeLinkTree(data) {
	var width = 600;
	var height = 2600;
	var margin = {top: 0, right: 50, bottom: 0, left: 50};
	var innerWidth = width - margin.left - margin.right;
	var innerHeight = height - margin.top - margin.bottom;

	var treeLayout = d3.tree().size([innerHeight, innerWidth]);

	var nested_data = d3.nest()
						.key(d => [d.dependent, d.independent])
						.key(d => d.splitby)
						.entries(data);
/*
	var test = {
		"data": {
		  "id": "World"
		},
		"children": [
		  {
			"data": {
			  "id": "Asia"
			},
		},
		{
		  "data": {
			"id": "Europe"
		  },
		}
		]
	};
*/
	// Add root
	nested_data = {key: 'root', values: nested_data};
	
	var root = d3.hierarchy(nested_data, d => d.values);
	//var root = d3.hierarchy(test, d => d.children);
	var links = treeLayout(root).links();
	var linkPathGenerator = d3.linkHorizontal()
		.x(d => d.y)
		.y(d => d.x);

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

	g.selectAll('path').data(links)
			.enter().append('path')
			.attr('d', linkPathGenerator)
			.attr('fill', 'none')
			.attr('stroke', '#57bdc3')
			.style("opacity", function(d, i) {
				return !d.source.depth ? 0 : 1;
			})
			.style("pointer-events", function(d, i) {
				return !d.source.depth ? "none" : "all";
			});

	g.selectAll('circle').data(root.descendants())
		.enter().append('circle')
		.attr('r', 6)
		.attr('cx', d => d.y)
		.attr('cy', d => d.x)		
		.style('fill', '#fff')
		.style('stroke', 'steelblue')
		.style('stroke-width', '2px')
		.style("opacity", function(d, i) {
			return !d.depth ? 0 : 1;
		})
		.style("pointer-events", function(d, i) {
			return !d.depth ? "none" : "all";
		}); 	

	g.selectAll('text').data(root.descendants())
		.enter().append('text')
		.attr('x', d => d.children ? d.y - 10 : d.y + 10)
		.attr('y', d => d.x)
		.attr('dy', '0.32em')
		.attr('text-anchor', d => d.children ? 'end' : 'start')
//		.attr('font-size', d => 3 - d.depth + 'em')
		.attr('pointer-events', 'none')
		.text(d => d.height ? d.data.key : d.data.subgroup)
		.style("opacity", function(d, i) {
			return !d.depth ? 0 : 1;
		})
		.style("pointer-events", function(d, i) {
			return !d.depth ? "none" : "all";
		}); 
		//.text(d => d.data.data.id);

}