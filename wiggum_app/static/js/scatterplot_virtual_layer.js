
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
					//console.log(d);
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
					return d[0].id + "_linepath" + "_vpath";
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