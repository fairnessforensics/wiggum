function DrawTree(options) {
	var margin = {top: 30, right: 30, bottom: 10, left: 230},
		width = 560,
		height = 500;

	var data = options.data,
		matrixAll = options.matrixAll,
		matrixGroups = options.matrixGroups,
		catAttrs = options.catAttrs,
		categoryValuesList = options.cateAttrInfo,
		labelsData = options.labels;

	var bivariateMatrix = BivariateMatrix(matrixAll, matrixAll);

	var i = 0;  

	var tree = d3.layout.tree()
	tree.nodeSize([150,150]);

	var diagonal = d3.svg.diagonal()
				.projection(function(d) { return [d.x, d.y]; });

	//Redraw for zoom
	function redraw() {
		svg.attr("transform",
			"translate(" + d3.event.translate + ")"
			+ " scale(" + d3.event.scale + ")");	
	}				

	var svg = d3.select("div#tree").append("svg")
				.attr("width", width)
				.attr("height", height + margin.top + margin.bottom)
				.call(zm = d3.behavior.zoom().scaleExtent([0.1,3]).on("zoom", redraw))
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	zm.translate([margin.left, margin.top]);

	var node = svg.selectAll(".node");
	var link = svg.selectAll(".link");

	var UpdateMatrixFormat = function(matrix, vars, category) {
		matrix.forEach(function(row, i) {
			row.forEach(function(cell, j) {
			
				matrix[i][j] = {
						rowVar: vars[i],
						colVar: vars[j],
						value: cell,
						categoryAttr: category.groupby,
						category: category.value 
					};
			});
		});
		return matrix;
	};

	var treeDataPre = [];
	// Top Parent
	var singleObj = {};
	singleObj['name'] = "all";
	var cateObj = {};
	cateObj['groupby'] = "all";
	cateObj['value'] = "all";
	singleObj['matrix'] = UpdateMatrixFormat(BivariateMatrix(matrixAll, matrixAll), 
										labelsData, cateObj);
	singleObj['parent'] = "null";
	treeDataPre.push(singleObj);

	// Second layer
	for (var i = 0; i < catAttrs.length; i++){
		var singleObj = {};
		singleObj['name'] = catAttrs[i];

		var cateObj = {};
		cateObj['groupby'] = catAttrs[i];
		cateObj['value'] = "all";

		singleObj['matrix'] = UpdateMatrixFormat(BivariateMatrix(matrixAll, matrixAll), 
										labelsData, cateObj);
		singleObj['parent'] = "all";
		treeDataPre.push(singleObj);		
	}

	for (var i = 0; i < matrixGroups.length; i++){
		var bivariateMatrix = BivariateMatrix(matrixAll, matrixGroups[i]);
		
		var singleObj = {};
		singleObj['name'] = categoryValuesList[i].value;
		singleObj['matrix'] = UpdateMatrixFormat(BivariateMatrix(matrixAll, matrixGroups[i]), 
												 labelsData, categoryValuesList[i]);
		singleObj['parent'] = categoryValuesList[i].groupby;
		treeDataPre.push(singleObj);
	}

	var dataMap = treeDataPre.reduce(function(map, node) {
		map[node.name] = node;
		return map;
	}, {});

	// create the tree array
	var treeData = [];
	treeDataPre.forEach(function(node) {
		// add to parent
		var parent = dataMap[node.parent];
		if (parent) {
			// create child array if it doesn't exist
			(parent.children || (parent.children = []))
				// add node to child array
				.push(node);
		} else {
			// parent is null or missing
			treeData.push(node);
		}
	});	

	var root = treeData[0];

	update(root);

	function update(source) {
		var nodes = tree.nodes(root).reverse();
		var links = tree.links(nodes);
		
		// Normalize for fixed-depth.
		nodes.forEach(function(d) { d.y = d.depth * 150; });

		var node = svg.selectAll(".node")
						.data(nodes, function(d) {
							return d.id || (d.id = ++i); });

		var nodeEnter = node.enter().append("g")
							.attr("class", node)
							.attr("transform", function(d) { 
								return "translate(" + (d.x - 65) + "," + (d.y - 65) + ")"; });

		nodeEnter.each(drawMatrix)

		// Add text for nodes
		nodeEnter.append("text")
        .attr("x",  function(d) { 
			return d.children || d._children ? 195 : 105; })
		.attr("y", function(d) { 
			return d.children || d._children ? 105 : 170; })
		.attr("dy", ".35em")
		.attr("text-anchor", "middle")
		.style("font-size", "16px") 
		.attr("fill", "red")
		.style("text-decoration", "underline")  	
		.text(function(d) { return d.name; })
		.style("fill-opacity", 1);

		// Declare the links…
		var link = svg.selectAll("path.link")
			.data(links, function(d) { return d.target.id; });

		link.enter().insert("path", "g")
			.attr("class", "link")
			.attr("d", function(d) {
				var source = {x: d.source.x + 45, y: d.source.y+90};
				var target = {x: d.target.x + 45, y: d.target.y};

				return diagonal({source: source, target: target});
			});						
	}

	function drawMatrix(d){
		var margin = {top: 63, right: 30, bottom: 30, left: 63},
			width = 90,
			height = 90;

		var data = d.matrix;

		var numrows = data.length;
		var numcols = data[0].length;

		var svg = d3.select(this)
			.append("svg")
			.attr("width", width+ margin.left + margin.right)
			.attr("height", height+ margin.top + margin.bottom);

		var corrPlot = svg.append("g")
			.attr("id", "corrPlot")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		var x = d3.scale.ordinal()
			.domain(d3.range(numcols))
			.rangeBands([0, width]);

		var y = d3.scale.ordinal()
			.domain(d3.range(numrows))
			.rangeBands([0, height]);

		var row = corrPlot.selectAll(".row")
			.data(data)
			.enter().append("g")
			.attr("class", "row")
			.attr("transform", function(d, i) { return "translate(0," + y(i) + ")"; });

		var cells = row.selectAll(".cell")
			.data(function(d) {return d; })
			.enter()
			.append("rect")	
			.attr("class", "cell")
			.attr("transform", function(d, i) { return "translate(" + x(i) + ", 0)"; });

		cells.attr("width", x.rangeBand()-1)
			.attr("height", y.rangeBand()-1)
			.style("stroke-width", "1px")
//			.style("opacity", 1e-6)
			.transition()
//			.style("opacity", 1)
			.style("fill", function(d, i) {return colorMap[d.value]; });	

		cells.style("opacity", 0.1)
			.filter(function(d){
				if (legendValue != -1) {
					return d.value == legendValue;
				} else 
				{
					return d;
				}			
			})
			.style("opacity", 1);

		var labels = corrPlot.append('g')
			.attr('class', "labels");
	
		var columnLabels = labels.selectAll(".column-label")
			.data(labelsData)
			.enter().append("g")
			.attr("class", "column-label")
			.attr("transform", function(d, i) { return "translate(" + x(i) + "," + 0 + ")"; });

		columnLabels.append("line")
			.style("stroke", "black")
			.style("stroke-width", "1px")
			.attr("x1", x.rangeBand() / 2)
			.attr("x2", x.rangeBand() / 2)
			.attr("y1", 0)
			.attr("y2", -5);
			
		var yAttr = x.rangeBand()/numcols/2 + 3;
		columnLabels.append("text")
			.attr("x", x.rangeBand() - 15)
			.attr("y", yAttr)
			.attr("dy", ".82em")
			.attr("text-anchor", "start")
			.attr("transform", "rotate(-90)")
			.text(function(d, i) { return d; })
			.style("font-size", "10px");
	
		var rowLabels = labels.selectAll(".row-label")
			.data(labelsData)
		  .enter().append("g")
			.attr("class", "row-label")
			.attr("transform", function(d, i) { return "translate(" + 0 + "," + y(i) + ")"; });
	
		rowLabels.append("line")
			.style("stroke", "black")
			.style("stroke-width", "1px")
			.attr("x1", 0)
			.attr("x2", -5)
			.attr("y1", y.rangeBand() / 2)
			.attr("y2", y.rangeBand() / 2);
	
		rowLabels.append("text")
			.attr("x", -8)
			.attr("y", y.rangeBand() / 2)
			.attr("dy", ".32em")
			.attr("text-anchor", "end")
			.text(function(d, i) { return d; })
			.style("font-size", "10px");				
	}

	// Cell Click Event
	var clickMatrixCell = function() {
		var treesvg = d3.select("#tree");

		treesvg.selectAll(".cell").classed("clicked", false);
		var clickFlg = d3.select(this).classed("clicked", true);
		if (clickFlg) { clickFlg.call(updateScatter); }
	};

	d3.select("#tree").selectAll(".cell")
		.on("click", clickMatrixCell);	

	function updateScatter() {
		var d = this.datum();

		var vars = { x: d.colVar, y: d.rowVar, z: d.value, 
			categoryAttr: d.categoryAttr, category: d.category};
		
		updateScatterplot(data, vars);
	}
}