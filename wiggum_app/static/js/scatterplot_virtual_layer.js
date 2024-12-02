
const scatterplot_virtual_layer = (selection, props) => {
	const {
	  width,
	  height,
	  parentVLWidth,
	  axis_x_position,
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
			.attr("stroke-width","3");
		vl_axis.selectAll("text").remove();
		vl_axis.selectAll(".tick").remove();
		
		// Add links
		var linkData = [];

		selectionLevelG.selectAll("." + level + ".scatterplot.middle.circle")
			.each(function () {

				var circleX = d3.select(this).attr("cx");
				var circleY = d3.select(this).attr("cy");
				var y_position = circleY - 100/2;

				var object = {};

				if (side == "parent" ) {
					object['source'] = [0, -parentVLWidth];
					object['target'] = [y_position, axis_x_position];
				} else {
					object['source'] = [y_position, axis_x_position];
					object['target'] = [0, 280 + 60];
				}

				// add color
				object['color'] = "black";
				
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