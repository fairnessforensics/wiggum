const histogram_virtual_layer = (selection, props) => {
	const {
	  width,
	  height,
	  offset_y,
	  parentVLWidth,
	  axis_x_position,
	  side,
	  multi_no,
	  aux_flag,
	  level
	} = props;

	var rowIndex = 0;

	selection.each(function (d) {
		var selectionLevelG = d3.select(this);

		var y = d3.scaleLinear()
					.range([height, 0]);

		var vl_axis = selectionLevelG.append("g")
			.attr("class", level + " " + side + " histogram virtuallayer y axis")
			.attr("transform", "translate(" + axis_x_position + "," + (-height/2+ offset_y) + ")")
			.call(d3.axisRight(y).tickSizeOuter(0));

		vl_axis.select(".domain")
			.attr("stroke","black")
			.attr("stroke-width","3");
		vl_axis.selectAll("text").remove();
		vl_axis.selectAll(".tick").remove();
		

		// Add links
		var linkData = [];
		var auxLinkData = [];

		selectionLevelG.selectAll("." + multi_no + ".histogram.bar")
			.each(function () {
				var bbox = this.getBBox();
				var object = {};
				var aux_object = {};

				if (bbox.height != 0) {
					if (side == "parent" ) {
						object['source'] = [0, -parentVLWidth];
						// TODO height hard code
						y_position = (height/2 + offset_y) - bbox.height;
						object['target'] = [y_position, axis_x_position];
					} else {
						y_position = (height/2 + offset_y) - bbox.height;
						object['source'] = [y_position, axis_x_position];

						object['target'] = [0, 160 + 60];
					}

					if (aux_flag == true) {
						// Auxiliary line
						aux_object['source'] = [y_position, axis_x_position - 25];
						aux_object['target'] = [y_position, axis_x_position - width + 36];
						aux_object['color'] = "#949494";
						aux_object['id'] = this.id;
						auxLinkData.push(aux_object);
					}


					// add color
					object['color'] = "black";
					// add id for coordiate
					object['id'] = this.id;

					linkData.push(object);
				}
		})

		selectionLevelG.call(link, {
				data: linkData,
				side: side,
				rowIndex: 'row' + rowIndex,
				chartType: 'histogram',
				multi_no: multi_no,
				level: level
		});		

		if (aux_flag == true) {
			// Auxiliary line
			selectionLevelG.call(link, {
				data: auxLinkData,
				side: 'aux',
				rowIndex: 'row' + rowIndex,
				level: level
			});	
		}
		
		rowIndex = rowIndex + 1;
	});

}

const doubleHistogram_virtual_layer = (selection, props) => {
	const {
	  width,
	  height,
	  parentVLWidth,
	  axis_x_position,
	  side,
	  aux_flag,
	  level
	} = props;

	var rowIndex = 0;

	selection.each(function (d) {
		var selectionLevelG = d3.select(this);

		var y = d3.scaleLinear()
					.range([height, 0]);

		var vl_axis = selectionLevelG.append("g")
			.attr("class", level + " " + side + " doublehistogram virtuallayer y axis")
			.attr("transform", "translate(" + axis_x_position + "," + (-height/2) + ")")
			.call(d3.axisRight(y).tickSizeOuter(0));

		vl_axis.select(".domain")
			.attr("stroke","black")
			.attr("stroke-width","3");
		vl_axis.selectAll("text").remove();
		vl_axis.selectAll(".tick").remove();
		

		// Add links
		var linkData = [];
		var auxLinkData = [];

		selectionLevelG.selectAll(".doublehistogram.bar.var1,.doublehistogram.bar.var2")
			.each(function () {
				var bbox = this.getBBox();
				var object = {};
				var aux_object = {};

				if (bbox.height != 0) {
					if (side == "parent" ) {
						object['source'] = [0, -parentVLWidth];
						// TODO height hard code
						y_position = 100/2 - bbox.height;
						object['target'] = [y_position, axis_x_position];
					} else {
						y_position = 100/2 - bbox.height;
						object['source'] = [y_position, axis_x_position];

						object['target'] = [0, 160 + 60];
					}

					if (aux_flag == true) {
						// Auxiliary line
						aux_object['source'] = [y_position, axis_x_position - 25];
						aux_object['target'] = [y_position, axis_x_position - width + 36];
						aux_object['color'] = "#949494";
						aux_object['id'] = this.id;
						auxLinkData.push(aux_object);
					}

					// add color
					object['color'] = this.style.fill;
					// add id for coordiate
					object['id'] = this.id;

					linkData.push(object);
				}
		})

		selectionLevelG.call(link, {
				data: linkData,
				side: side,
				rowIndex: 'row' + rowIndex,
				chartType: 'doublehistogram',
				level: level
		});		
		
		if (aux_flag == true) {
			// Auxiliary line
			selectionLevelG.call(link, {
				data: auxLinkData,
				side: 'aux',
				rowIndex: 'row' + rowIndex,
				chartType: 'doublehistogram',
				level: level
			});	
		}

		rowIndex = rowIndex + 1;
	});

}