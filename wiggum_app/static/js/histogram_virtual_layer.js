const doubleHistogram_virtual_layer = (selection, props) => {
	const {
	  width,
	  height,
	  parentVLWidth,
	  level
	} = props;

	var rowIndex = 0;

	selection.each(function (d) {
		var selectionLevelG = d3.select(this);

		var y = d3.scaleLinear()
					.range([height, 0]);

		var vl_axis = selectionLevelG.append("g")
			.attr("class", level + " parent virtuallayer y axis")
			.attr("transform", "translate(15," + (-height/2) + ")")
			.call(d3.axisRight(y).tickSizeOuter(0));

		vl_axis.select(".domain")
			.attr("stroke","black")
			.attr("stroke-width","3");
		vl_axis.selectAll("text").remove();
		vl_axis.selectAll(".tick").remove();
		

		// Add links
		var linkData = [];

		selectionLevelG.selectAll(".doublehistogram.bar.var1,.doublehistogram.bar.var2")
			.each(function () {
				var bbox = this.getBBox();
				var object = {};

				if (bbox.height != 0) {
					object['source'] = [0, -parentVLWidth];
					// TODO height hard code
					y_position = 100/2 - bbox.height;
					object['target'] = [y_position, 15];
					// add color
					object['color'] = this.style.fill;
					// add id for coordiate
					object['id'] = this.id;

					linkData.push(object);
				}
		})


		selectionLevelG.call(link, {
				data: linkData,
				side: 'parent',
				rowIndex: 'row' + rowIndex,
				level: level
		});		
		
		rowIndex = rowIndex + 1;
	});

}