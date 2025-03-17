
const scatterplot_virtual_layer = (selection, props) => {
	const {
	  width,
	  height,
	  parentVLWidth,
	  axis_x_position,
	  link_opacity,
	  side,
	  level
	} = props;

	var rowIndex = 0;

	selection.each(function (d) {
		var selectionLevelG = d3.select(this);

		var y = d3.scaleLinear()
					.range([height, 0]);

		var vl_axis = selectionLevelG.append("g")
			.attr("class", level + " " + side + " scatterplot virtuallayer y axis")
			.attr("transform", "translate(" + axis_x_position + "," + (-height/2) + ")")
			.call(d3.axisRight(y).tickSizeOuter(0));

		vl_axis.select(".domain")
			.attr("stroke","black")
			.attr("stroke-width","1")
			.attr("stroke-opacity", 0.5);
		vl_axis.selectAll("text").remove();
		vl_axis.selectAll(".tick").remove();
		
		// Add links
		var linkData = [];

		selectionLevelG.selectAll("." + level + ".scatterplot.middle.circle")
			.each(function () {

				var circleX = d3.select(this).attr("cx");
				var circleY = d3.select(this).attr("cy");
				var y_position = circleY - height/2;

				var object = {};

				if (side == "parent" ) {
					object['source'] = [0, -parentVLWidth];
					object['target'] = [y_position, axis_x_position];
				} else {
					object['source'] = [y_position, axis_x_position];
					object['target'] = [0, 280 + 60];
				}

				// add color
				object['color'] = this.style.fill;

				// add opacity
				object['opacity'] = link_opacity;
				
				// add id for coordiate
				object['id'] = d3.select(this).attr("id");

				linkData.push(object);
		})

		selectionLevelG.call(link, {
				data: linkData,
				side: side,
				rowIndex: 'row' + rowIndex,
				chartType: 'scatterplot',
				level: level
		});		

		rowIndex = rowIndex + 1;
	});

}

const scatterplot_scented_swath_virtual_layer = (selection, props) => {
	const {
	  width,
	  height,
	  parentVLWidth,
	  axis_x_position,
	  link_opacity,
	  side,
	  level
	} = props;

	var rowIndex = 0;

	selection.each(function (d) {

		var selectionLevelG = d3.select(this);

		var keyArray = d.data.key.split(",");
		var dependent = keyArray[0];
		var independent = keyArray[1];

		var y = d3.scaleLinear()
					.range([height, 0]);

		var vl_axis = selectionLevelG.append("g")
			.attr("class", level + " " + side + " scatterplot virtuallayer y axis")
			.attr("transform", "translate(" + axis_x_position + "," + (-height/2) + ")")
			.call(d3.axisRight(y).tickSizeOuter(0));

		vl_axis.select(".domain")
			.attr("stroke","black")
			.attr("stroke-width","1")
			.attr("stroke-opacity", 0.5);
		vl_axis.selectAll("text").remove();
		vl_axis.selectAll(".tick").remove();

		// Add swath
		var swathData = [];

		var num_subgroup = 0;
		var subgroup_list = [];
		selectionLevelG.selectAll("." + level + ".scatterplot.middle.circle")
			.filter(function(d, i) {

				var lastElement = this.id.split("_").pop();
				if (side == "parent" ) {
    				return lastElement === "0";
				} else {
					return lastElement === "last";
				}
			})
			.each(function (d) {
				num_subgroup++;
				subgroup_list.push(d[independent]);
		});

		var height_interval = 20 / num_subgroup;
		var node_y = -10;

		subgroup_list.forEach(subgroup => {

			let filteredNodes = selectionLevelG.selectAll("." + level + ".scatterplot.middle.circle")
										.filter(d => d[independent] === subgroup) 
										.nodes();
	
			let [minCY, maxCY] = d3.extent(filteredNodes, d => +d.getAttribute("cy")); 
		
			let fillColor = filteredNodes.length > 0 ? filteredNodes[0].style.fill : "none";
	
			let firstID = filteredNodes.length > 0 ? d3.select(filteredNodes[0]).attr("id") : "none";

			var object = {};

			if (side == "parent" ) {
				object['start1'] = [-parentVLWidth + 10, node_y];
				// Calculate next control point y position by interval
				node_y = node_y + height_interval;
				object['start2'] = [-parentVLWidth + 10, node_y];
				object['end1'] = [axis_x_position, minCY - height/2];
				object['end2'] = [axis_x_position, maxCY - height/2];
			} else {
				object['start1'] = [axis_x_position, minCY - height/2];
				object['start2'] = [axis_x_position, maxCY - height/2];
				object['end1'] = [280 + 50, node_y];
				// Calculate next control point y position by interval
				node_y = node_y + height_interval;
				object['end2'] = [280 + 50, node_y];
			}

			// add color
			object['color'] = fillColor;

			// add opacity
			object['opacity'] = link_opacity;

			// add id for coordiate
			object['id'] = firstID;

			swathData.push(object);

		});

		selectionLevelG.call(swath, {
			data: swathData,
			side: side,
			rowIndex: 'row' + rowIndex,
			chartType: 'scatterplot',
			level: level,
			group_select_flag: true
		});		

		rowIndex = rowIndex + 1;

		// Add checkbox
		let foreignObject = selectionLevelG.append("foreignObject")
				.attr("x", -parentVLWidth - 50) 
				.attr("y", -height/2)
				.attr("width", 100)
				.attr("height", 10)
				.style("overflow", "visible");

		let checkbox = foreignObject.append("xhtml:input")
					.attr("type", "checkbox")
					.attr("class", level + " " + side + " scatterplot virtuallayer checkbox")
					.on("change", function () {
						if (this.checked) {
							var pointData = [];
							selectionLevelG.selectAll("." + level + ".scatterplot.middle.circle")
								.each(function () {
				
								var circleX = 0;
								var circleY = d3.select(this).attr("cy");
				
								var object = {};
								object['cx'] = circleX;
								object['cy'] = circleY;
				
								// add color
								object['color'] = this.style.fill;
				
								// add opacity
								object['opacity'] = link_opacity;
								
								// add id for coordiate
								object['id'] = d3.select(this).attr("id");
				
								pointData.push(object);
							})

							vl_axis.selectAll(".circle")
								.data(pointData)
								.enter().append("circle")	    
								.attr("class", "test")
								.attr("r", 3)
								.attr("cx", d => d.cx)
								.attr("cy", d => d.cy)
								.attr("stroke", "black")
								.attr("stroke-width", 1)	  
								.attr("stroke-opacity", 0.25)
								.style("fill", d => d.color)
								.style("fill-opacity", d => d.opacity);
							vl_axis.raise();
						} else {
							vl_axis.selectAll("circle").remove();
						}
					});
			
		foreignObject.append("xhtml:label")
			.attr("class", level + " " + side + " scatterplot virtuallayer label")
			.style("font-size", "12px") 
			.style("margin-left", "3px") 
			.text("Points");
	});

}

const agg_scatterplot_virtual_layer = (selection, props) => {
	const {
	  width,
	  height,
	  parentVLWidth,
	  axis_x_position,
	  link_opacity,
	  side,
	  level
	} = props;

	var rowIndex = 0;

	selection.each(function (d) {
		var selectionLevelG = d3.select(this);

		var y = d3.scaleLinear()
					.range([height, 0]);

		var vl_axis = selectionLevelG.append("g")
			.attr("class", level + " " + side + " scatterplot virtuallayer y axis")
			.attr("transform", "translate(" + axis_x_position + "," + (-height/2) + ")")
			.call(d3.axisRight(y).tickSizeOuter(0));

		vl_axis.select(".domain")
			.attr("stroke","black")
			.attr("stroke-width","1")
			.attr("stroke-opacity", 0.5);

		vl_axis.selectAll("text").remove();
		vl_axis.selectAll(".tick").remove();
		
		// Add links
		var linkData = [];

		selectionLevelG.selectAll("." + level + ".scatterplot.middle.circle")
			.filter(function(d, i) {
				var lastElement = this.id.split("_").pop();
				if (side == "parent" ) {
    				return lastElement === "0";
				} else {
					return lastElement === "last";
				}
			})
			.each(function () {

				var circleX = d3.select(this).attr("cx");
				var circleY = d3.select(this).attr("cy");
				var y_position = circleY - height/2;

				var object = {};

				if (side == "parent" ) {
					object['source'] = [0, -parentVLWidth];
					object['target'] = [y_position, axis_x_position];
				} else {
					object['source'] = [y_position, axis_x_position];
					object['target'] = [0, 280 + 60];
				}

				// add color
				object['color'] = this.style.fill;

				// add opacity
				object['opacity'] = link_opacity;

				// add id for coordiate
				object['id'] = d3.select(this).attr("id");

				linkData.push(object);
		})

		selectionLevelG.call(link, {
				data: linkData,
				side: side,
				rowIndex: 'row' + rowIndex,
				chartType: 'scatterplot',
				level: level,
				group_select_flag: true
		});		

		// Connect dots
		if (side == "parent" ) {
			var lineData = [];
			var newlineData = [];
	
			selectionLevelG.selectAll("." + level + ".scatterplot.middle.circle")
				.each(function (d, i) {

					var lastElement = this.id.split("_").pop();
					if (lastElement == "0" ) {
						newlineData = [];
					}
	
					var circleX = parseFloat(d3.select(this).attr("cx"));
					var circleY = parseFloat(d3.select(this).attr("cy"));

					var parent_transform = d3.select(this.parentNode).attr('transform').split(/[\s,()]+/);
					var parent_transform_x = parseFloat(parent_transform[1]);
					var parent_transform_y = parseFloat(parent_transform[2]);

					var position_x = circleX + parent_transform_x;
					var position_y = circleY + parent_transform_y;

					var object = {};
					object['x'] = position_x;
					object['y'] = position_y;
					object['fill'] = this.style.fill;
					object['id'] = this.id;
	
					newlineData.push(object);
	
					if (lastElement == "last" ) {
						lineData.push(newlineData);
					}
				})

			selectionLevelG.selectAll(".linepath")
				.data(lineData)
				.enter()
				.append("path")
				.attr("id", function(d) {
					let lastIndex = d[0].id.lastIndexOf("_");
					let id = d[0].id.slice(0, lastIndex);

					return id + "_linepath" + "_vpath";
				})
				.attr('class', level + " " + side + " row" + rowIndex 
							+ ' scatterplot linepath virtuallayer')
				.attr("fill", "none")
				.attr("stroke", d=>d[0].fill)
				.attr("stroke-width", 1)
				.attr("d", function(d){
					return d3.line()
					  .x(function(d) { return d.x; })
					  .y(function(d) { return d.y; })
					  (d)
				  })
		}

		rowIndex = rowIndex + 1;
	});

}

const agg_scatterplot_swath_virtual_layer = (selection, props) => {
	const {
	  width,
	  height,
	  parentVLWidth,
	  axis_x_position,
	  link_opacity,
	  side,
	  level
	} = props;

	var rowIndex = 0;

	selection.each(function (d) {
		var selectionLevelG = d3.select(this);

		var y = d3.scaleLinear()
					.range([height, 0]);

		var vl_axis = selectionLevelG.append("g")
			.attr("class", level + " " + side + " scatterplot virtuallayer y axis")
			.attr("transform", "translate(" + axis_x_position + "," + (-height/2) + ")")
			.call(d3.axisRight(y).tickSizeOuter(0));

		vl_axis.select(".domain")
			.attr("stroke","black")
			.attr("stroke-width","1")
			.attr("stroke-opacity", 0.5);

		vl_axis.selectAll("text").remove();
		vl_axis.selectAll(".tick").remove();
		
		// Add links
		var linkData = [];

		var num_subgroup = 0;
		selectionLevelG.selectAll("." + level + ".scatterplot.middle.circle")
			.filter(function(d, i) {
				var lastElement = this.id.split("_").pop();
				if (side == "parent" ) {
    				return lastElement === "0";
				} else {
					return lastElement === "last";
				}
			})
			.each(function () {
				num_subgroup++;
		});

		var height_interval = 20 / num_subgroup;
		var node_y = -10;
		selectionLevelG.selectAll("." + level + ".scatterplot.middle.circle")
			.filter(function(d, i) {
				var lastElement = this.id.split("_").pop();
				if (side == "parent" ) {
    				return lastElement === "0";
				} else {
					return lastElement === "last";
				}
			})
			.each(function (d, i) {

				var circleX = d3.select(this).attr("cx");
				var circleY = d3.select(this).attr("cy");
				var y_position = circleY - height/2;

				var object = {};

				if (side == "parent" ) {
					object['start1'] = [-parentVLWidth + 10, node_y];
					// Calculate next control point y position by interval
					node_y = node_y + height_interval;
					object['start2'] = [-parentVLWidth + 10, node_y];
					object['end1'] = [axis_x_position, y_position];
					object['end2'] = [axis_x_position, y_position];
				} else {
					object['start1'] = [axis_x_position, y_position];
					object['start2'] = [axis_x_position, y_position];
					object['end1'] = [280 + 50, node_y];
					// Calculate next control point y position by interval
					node_y = node_y + height_interval;
					object['end2'] = [280 + 50, node_y];
				}

				// add color
				object['color'] = this.style.fill;

				// add opacity
				object['opacity'] = link_opacity;

				// add id for coordiate
				object['id'] = d3.select(this).attr("id");

				linkData.push(object);
		})

		selectionLevelG.call(swath, {
				data: linkData,
				side: side,
				rowIndex: 'row' + rowIndex,
				chartType: 'scatterplot',
				level: level,
				group_select_flag: true
		});		

		// Connect dots
		if (side == "parent" ) {
			var lineData = [];
			var newlineData = [];
	
			selectionLevelG.selectAll("." + level + ".scatterplot.middle.circle")
				.each(function (d, i) {

					var lastElement = this.id.split("_").pop();
					if (lastElement == "0" ) {
						newlineData = [];
					}
	
					var circleX = parseFloat(d3.select(this).attr("cx"));
					var circleY = parseFloat(d3.select(this).attr("cy"));

					var parent_transform = d3.select(this.parentNode).attr('transform').split(/[\s,()]+/);
					var parent_transform_x = parseFloat(parent_transform[1]);
					var parent_transform_y = parseFloat(parent_transform[2]);

					var position_x = circleX + parent_transform_x;
					var position_y = circleY + parent_transform_y;

					var object = {};
					object['x'] = position_x;
					object['y'] = position_y;
					object['fill'] = this.style.fill;
					object['id'] = this.id;
	
					newlineData.push(object);
	
					if (lastElement == "last" ) {
						lineData.push(newlineData);
					}
				})

			selectionLevelG.selectAll(".linepath")
				.data(lineData)
				.enter()
				.append("path")
				.attr("id", function(d) {
					let lastIndex = d[0].id.lastIndexOf("_");
					let id = d[0].id.slice(0, lastIndex);

					return id + "_linepath" + "_vpath";
				})
				.attr('class', level + " " + side + " row" + rowIndex 
							+ ' scatterplot linepath virtuallayer')
				.attr("fill", "none")
				.attr("stroke", d=>d[0].fill)
				.attr("stroke-width", 1)
				.attr("d", function(d){
					return d3.line()
					  .x(function(d) { return d.x; })
					  .y(function(d) { return d.y; })
					  (d)
				  })
		}

		rowIndex = rowIndex + 1;
	});

}

const agg_scatterplot_swath_control_virtual_layer = (selection, props) => {
	const {
	  width,
	  height,
	  parentVLWidth,
	  axis_x_position,
	  link_opacity,
	  side,
	  level
	} = props;

	var rowIndex = 0;

	selection.each(function (d) {
		var selectionLevelG = d3.select(this);

		var y = d3.scaleLinear()
					.range([height, 0]);

		var vl_axis = selectionLevelG.append("g")
			.attr("class", level + " " + side + " scatterplot virtuallayer y axis")
			.attr("transform", "translate(" + axis_x_position + "," + (-height/2) + ")")
			.call(d3.axisRight(y).tickSizeOuter(0));

		vl_axis.select(".domain")
			.attr("stroke","black")
			.attr("stroke-width","1")
			.attr("stroke-opacity", 0.5);

		vl_axis.selectAll("text").remove();
		vl_axis.selectAll(".tick").remove();
		
		// Add links
		var linkData = [];

		var num_subgroup = 0;
		selectionLevelG.selectAll("." + level + ".scatterplot.middle.circle")
			.filter(function(d, i) {
				var lastElement = this.id.split("_").pop();
				if (side == "parent" ) {
    				return lastElement === "0";
				} else {
					return lastElement === "last";
				}
			})
			.each(function () {
				num_subgroup++;
		});

		var height_interval = 20 / num_subgroup;
		var node_y = -10;
		selectionLevelG.selectAll("." + level + ".scatterplot.middle.circle")
			.filter(function(d, i) {
				var lastElement = this.id.split("_").pop();
				if (side == "parent" ) {
    				return lastElement === "0";
				} else {
					return lastElement === "last";
				}
			})
			.each(function (d, i) {

				var circleX = d3.select(this).attr("cx");
				var circleY = d3.select(this).attr("cy");
				var y_position = circleY - height/2;

				var object = {};

				// +- 0.5 to get a smooth curve, otherwise will see zigzag
				if (side == "parent" ) {
					object['start1'] = [-parentVLWidth + 10, node_y];
					object['start1_right'] = [-parentVLWidth + 10 + 10, node_y];
					// Calculate next control point y position by interval
					node_y = node_y + height_interval;
					object['start2'] = [-parentVLWidth + 10, node_y];
					object['start2_right'] = [-parentVLWidth + 10 + 10, node_y];
					object['end1'] = [axis_x_position, y_position - 0.5];
					object['end1_left'] = [axis_x_position - 10, y_position - 0.5];
					object['end2'] = [axis_x_position, y_position + 0.5];
					object['end2_left'] = [axis_x_position - 10, y_position + 0.5];
				} else {
					object['start1'] = [axis_x_position, y_position - 0.5];
					object['start1_right'] = [axis_x_position + 10, y_position - 0.5];
					object['start2'] = [axis_x_position, y_position + 0.5];
					object['start2_right'] = [axis_x_position + 10, y_position + 0.5];
					object['end1'] = [300 + 50, node_y];
					object['end1_left'] = [300 + 40, node_y];
					// Calculate next control point y position by interval
					node_y = node_y + height_interval;
					object['end2'] = [300 + 50, node_y];
					object['end2_left'] = [300 + 40, node_y];
				}

				// add color
				object['color'] = this.style.fill;

				// add opacity
				object['opacity'] = link_opacity;

				// add id for coordiate
				object['id'] = d3.select(this).attr("id");

				linkData.push(object);
		})

		selectionLevelG.call(swath_control, {
				data: linkData,
				side: side,
				rowIndex: 'row' + rowIndex,
				chartType: 'scatterplot',
				level: level,
				group_select_flag: true
		});		

		// Connect dots
		if (side == "parent" ) {
			var lineData = [];
			var newlineData = [];
	
			selectionLevelG.selectAll("." + level + ".scatterplot.middle.circle")
				.each(function (d, i) {

					var lastElement = this.id.split("_").pop();
					if (lastElement == "0" ) {
						newlineData = [];
					}
	
					var circleX = parseFloat(d3.select(this).attr("cx"));
					var circleY = parseFloat(d3.select(this).attr("cy"));

					var parent_transform = d3.select(this.parentNode).attr('transform').split(/[\s,()]+/);
					var parent_transform_x = parseFloat(parent_transform[1]);
					var parent_transform_y = parseFloat(parent_transform[2]);

					var position_x = circleX + parent_transform_x;
					var position_y = circleY + parent_transform_y;

					var object = {};
					object['x'] = position_x;
					object['y'] = position_y;
					object['fill'] = this.style.fill;
					object['id'] = this.id;
	
					newlineData.push(object);
	
					if (lastElement == "last" ) {
						lineData.push(newlineData);
					}
				})

			selectionLevelG.selectAll(".linepath")
				.data(lineData)
				.enter()
				.append("path")
				.attr("id", function(d) {
					let lastIndex = d[0].id.lastIndexOf("_");
					let id = d[0].id.slice(0, lastIndex);

					return id + "_linepath" + "_vpath";
				})
				.attr('class', level + " " + side + " row" + rowIndex 
							+ ' scatterplot linepath virtuallayer')
				.attr("fill", "none")
				.attr("stroke", d=>d[0].fill)
				.attr("stroke-width", 1)
				.attr("d", function(d){
					return d3.line()
					  .x(function(d) { return d.x; })
					  .y(function(d) { return d.y; })
					  (d)
				  })
		}

		rowIndex = rowIndex + 1;
	});

}