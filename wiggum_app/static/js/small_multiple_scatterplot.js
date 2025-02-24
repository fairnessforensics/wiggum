const small_multiple_scatterplot = (selection, props) => {
	const {
	  num_small_multiples,
	  margin,
	  width,
	  height,
	  padding,
	  rectWidth,
	  rectHeight,
	  childrenIdentityFlag,
	  identity_data,
	  xAxisLabel,
	  yAxisLabel,
	  splitby,
	  chart_data,
	  myColor,
	  rowIndex,
	  level
	} = props;

	var small_multiple_height = height;
	var offset_y = num_small_multiples * (small_multiple_height + padding) / 2;
	var first_small_multiple_flag = true;
	var last_small_multiple_flag = false;

	var total_industry_id = 170;
	var start = 0;
	var end = total_industry_id;
	var size = 50;
	var small_multiple_position;
	var small_multiple_width;

	for (var i = 0; i < num_small_multiples; i++) {
		if (i == num_small_multiples - 1) {
			last_small_multiple_flag = true;
		}

		start = size * i + 1; 
		end = Math.min(start + size - 1, total_industry_id);

		var small_multiple_data = [];
		// Log scale cannot include zero, filter zero
		small_multiple_data = chart_data.filter(d => {
							return d[xAxisLabel] >= start 
										&& d[xAxisLabel] <= end
										&& d[yAxisLabel] > 0;
						});

		small_multiple_position = i * (small_multiple_height + padding) - offset_y;
				
		small_multiple_width = width * ((end - start + 1) / size);

		var temp_children_identity_flag;
		if (childrenIdentityFlag == true) {
			temp_children_identity_flag = first_small_multiple_flag;
		} else {
			temp_children_identity_flag = false;
		}

		selection.call(scatterPlot, {
			xValue: d => d[xAxisLabel],
			xAxisLabel: xAxisLabel,
			yValue: d => d[yAxisLabel],
			yAxisLabel: yAxisLabel,
			splitby: splitby,
			margin: margin,
			width: small_multiple_width,
			height: small_multiple_height,
			relative_translate_y: small_multiple_position,
			childrenIdentityFlag: temp_children_identity_flag,
			smallMultipleFlag: true,
			first_small_multiple_flag: first_small_multiple_flag,
			last_small_multiple_flag: last_small_multiple_flag,
			share_axis_flag: false,
			x_axis_scale: 'scaleLinear', 
			y_axis_scale: 'scaleLog', 
			rectWidth: rectWidth,
			rectHeight: rectHeight,
			identity_data: identity_data,
			chart_data: small_multiple_data,
			myColor: myColor,
			mark_shape: 'rectangle',
			mark_width: 6,
			mark_height: 3,
			rowIndex: 'row' + rowIndex,
			level: level
		});
		first_small_multiple_flag = false;
	}
};

