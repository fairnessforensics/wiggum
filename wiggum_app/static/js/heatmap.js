const heatmapDensity = (selection, props) => {
	const {
	  margin,
	  width,
	  height,
	  xValue,
	  yValue,
	  var1,
	  var2,
	  parentIdentityFlag,
	  childrenIdentityFlag,
	  rectWidth,
	  rectHeight,
	  identity_data,
	  chart_data,
	  myColor,
	  level
	} = props;
	
	var xScale = d3.scaleLinear()
					.domain(d3.extent(chart_data, xValue));
	var xSequence = xScale.nice().ticks(5);

	var yScale = d3.scaleLinear()
					.domain(d3.extent(chart_data, yValue));
	var ySequence = yScale.nice().ticks(5);

	var count_data = countByTwoRanges(chart_data, var1, var2, ySequence, xSequence);

	// prepare for color considering aggregate heatmap in the virtual layer
	//var max_count = d3.max(count_data, function(d) { return +d.value });
	var min = Math.floor(d3.min(chart_data, function (d) { return d[var2]; } ));
	var max = Math.ceil(d3.max(chart_data, function (d) { return d[var2]; } ));
	var xSequence_vl = [min, max];
	var count_data_vl = countByTwoRanges(chart_data, var1, var2, ySequence, xSequence_vl);
	var max_count = d3.max(count_data_vl, function(d) { return +d.value });

	// Label
	var var1_label = d3.map(count_data, function(d){return d[var1];}).keys();
    var var2_label = d3.map(count_data, function(d){return d[var2];}).keys();

	const g = selection.append('g')
	  .attr('transform', `translate(${margin.left},${-height/2 + margin.top})`);

	// Build X scales and axis:
	var x = d3.scaleBand()
				.range([ 0, width ])
				.domain(var2_label)
				.padding(0.1);

	var xAxis = g.append("g")
		.attr("class", level + " heatmapdensity x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x).tickSize(0)
		.tickFormat(function(d,i) {
			var range = d.split('-')
			var lowerBound = d3.format(".2s")(range[0]);
			var upperBound = d3.format(".2s")(range[1]); 

			return "[" + lowerBound + ", " + upperBound + ")"
		}));
		
		xAxis.select(".domain").remove();
		
		xAxis.selectAll("text")
			.attr("transform", "rotate(-60)")
			.attr("dx", "-.3em")
			.attr("dy", ".2em")
			.style("text-anchor", "end");


	// Add x axis label
	g.select('.' + level + '.heatmapdensity.x.axis')
		.append("text")
		.attr("class", level + " heatmapdensity x label")
		.attr('fill', 'black')
		.attr("x", width - 10)
		.attr("y", 40)
		.style("text-anchor", "start")
		.text(var2);	

	// Build Y scales and axis:
	var y = d3.scaleBand()
				.range([ height, 0 ])
				.domain(var1_label)
				.padding(0.1);

	g.append("g")
		.attr("class", level + " heatmapdensity y axis")
		.call(d3.axisLeft(y)
				.tickSize(0)
				.tickFormat(function(d,i) {
					var range = d.split('-')
					var lowerBound = d3.format(".2s")(range[0]);
					var upperBound = d3.format(".2s")(range[1]); 
		
					return "[" + lowerBound + ", " + upperBound + ")"
				}))
		.select(".domain").remove()

	// Add y axis label
	g.select('.' + level + '.heatmapdensity.y.axis')
		.append("text")
		.attr("class", level + " heatmapdensity y label")
		.attr("x", 0)
		.attr("y", -1)
		.attr("text-anchor", "middle")
		.attr('fill', 'black')
	  	.text(var1);

	// Build color scale
	//var color = d3.scaleLinear()
	//				.range(["white", "black"])
	//				.domain([0, max_count]);

	// Grey
	//var color_range = ['#f7f7f7', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696',
	//					'#737373', '#525252', '#252525', '#000000'];
	// Blue to Red
	//var color_range = ['#053061', '#2166ac', '#4393c3', '#92c5de', '#d1e5f0',
	//					'#fddbc7', '#f4a582', '#d6604d', '#b2182b', '#67001f'];
	// Grey to Red
	//var color_range = ['#1a1a1a', '#4d4d4d', '#878787', '#bababa', '#e0e0e0',
	//					'#fddbc7', '#f4a582', '#d6604d', '#b2182b', '#67001f'];
	//var color_range = ['#ffffff', '#e0e0e0', '#c0c0c0', '#a0a0a0', '#808080',
	//					'#606060','#404040', '#000000'];

	// Use 7 levels of purple
	var color_range = ["#f2f0f7","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486"];
	var heatmapDensityColor;

	if (max_count <= 100) {
		heatmapDensityColor = d3.scaleSequential()
					.domain([0, max_count])
					.interpolator(d3.interpolate("#f2f0f7", "#4a1486"));
	} else {
		// Use 7 levels based on the log number
		// Calculate the log base by max count
		// Log b(a) = ln a / ln b, ln b = ln a / c
		// b = exp(ln a / c)
		var base = Math.floor(Math.exp(Math.log(max_count)/5));
		// TODO find the log number based on data max
		//var color = d3.scaleThreshold()
		//				.domain([1, 2, 4, 8, 16, 32, 64])
		//				.range(color_range);

		heatmapDensityColor = d3.scaleThreshold()
						.domain([1, Math.pow(base, 1), Math.pow(base, 2), Math.pow(base, 3), 
									Math.pow(base, 4), Math.pow(base, 5)])
						.range(color_range);
	}

	g.selectAll()
		.data(count_data)
		.enter()
		.append("rect")
		.attr("class", level + " heatmapdensity cell")
		.attr("x", function(d) { return x(d[var2]) })
		.attr("y", function(d) { return y(d[var1]) })
		.attr("width", x.bandwidth() )
		.attr("height", y.bandwidth() )
		.style("fill", function(d) { return heatmapDensityColor(d.value)} )
		.style("stroke", "grey")
		.style("stroke-width", "1px")
		.append('title')
		.text(d => `The count is ${d.value}.`);	

	// Parent Identity
	// TODO merge all identity code to a class
	if (childrenIdentityFlag) {
		g.selectAll(".rect")
			.data(identity_data)
			.enter()    
			.append("rect")	
			.attr("class", d => level + " heatmapdensity initialvirtuallayer children rect " 
						+ d.dependent + " " + d.independent)	  
			.attr("transform", function(d) {
				var y_position = height/2;
				return "translate(" + (-margin.left) +"," + y_position + ")";
			})						
			//.attr("x", -10)
			.attr("x", width + rectWidth + 30)
			.attr("y", -10)						
			.attr("width", rectWidth)
			.attr("height", rectHeight)
			.style("stroke", "black")
			.style("stroke-width", "2px")
			.style("fill-opacity", 1)
			.style("fill", d => heatmapColorScale(d.value))
			.append('title')
			.text(function(d) {
				return `The mean distance is ${d3.format(".3f")(d.value)}.`
			});
	}

}


function countByTwoRanges(data, var1, var2, var1_range, var2_range) {
	var counts = [];

	for (var i = 0; i < var1_range.length - 1; i++) {
		var var1_lowerBound = var1_range[i];
		var var1_upperBound = var1_range[i + 1];
		
		for (var j = 0; j < var2_range.length - 1; j++) {	
			var single_object = {};
			var var2_lowerBound = var2_range[j];
			var var2_upperBound = var2_range[j + 1];

	  		var filteredData = data.filter(d => d[var1] >= var1_lowerBound 
											&& d[var1] < var1_upperBound
											&& d[var2] >= var2_lowerBound
											&& d[var2] < var2_upperBound);
	  
			single_object[var1] = `${var1_lowerBound}-${var1_upperBound}`;
			single_object[var2] = `${var2_lowerBound}-${var2_upperBound}`;

			single_object['value'] = filteredData.length;
			counts.push(single_object);								
						
		}
	}

	return counts;
  }

const genericHeatmap = (selection, props) => {
	const {
	  margin,
	  width,
	  height,
	  xValue,
	  yValue,
	  x_var,
	  y_var,
	  z_var,
	  parentIdentityFlag,
	  childrenIdentityFlag,
	  rectWidth,
	  rectHeight,
	  identity_data,
	  chart_data,
	  myColor,
	  level
	} = props;

	var xScale = d3.scaleLinear()
					.domain(d3.extent(chart_data, xValue));
	var xSequence = xScale.nice().ticks(5);

	var yScale = d3.scaleLinear()
					.domain(d3.extent(chart_data, yValue));
	var ySequence = yScale.nice().ticks(5);

	// prepare for color considering aggregate heatmap in the virtual layer
	var min = Math.floor(d3.min(chart_data, function (d) { return d[x_var]; } ));
	var max = Math.ceil(d3.max(chart_data, function (d) { return d[x_var]; } ));

	var maxValue = d3.max(chart_data, d => d[z_var]);

	// Label
	var y_var_label = d3.map(chart_data, function(d){return d[y_var];}).keys().reverse();
    var x_var_label = d3.map(chart_data, function(d){return d[x_var];}).keys();

	const g = selection.append('g')
	  .attr('transform', `translate(${margin.left},${-height/2 + margin.top})`);

	// Build X scales and axis:
	var x = d3.scaleBand()
				.range([ 0, width ])
				.domain(x_var_label)
				.paddingInner(0.1)
				.paddingOuter(0);

	var xAxis = g.append("g")
		.attr("class", level + " genericheatmap x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x).tickSize(0));
		
		xAxis.select(".domain").remove();
		
		xAxis.selectAll("text")
			.attr("transform", "rotate(-60)")
			.attr("dx", "-.3em")
			.attr("dy", ".8em")
			.style("text-anchor", "end");

	// Add x axis label
	g.select('.' + level + '.genericheatmap.x.axis')
		.append("text")
		.attr("class", level + " genericheatmap x label")
		.attr('fill', 'black')
		.attr("x", width - 5)
		.attr("y", 20)
		.style("text-anchor", "start")
		.text(x_var);	

	// Build Y scales and axis:
	var y = d3.scaleBand()
				.range([ height, 0 ])
				.domain(y_var_label)
				.paddingInner(0.1)
				.paddingOuter(0);

	g.append("g")
		.attr("class", level + " genericheatmap y axis")
		.call(d3.axisLeft(y)
				.tickSize(0))
		.select(".domain").remove();

	if (parentIdentityFlag == true) {
		// Remove all tick labels
		g.selectAll(".y.axis .tick").remove();
	} else {
		// Add y axis label
		g.select('.' + level + '.genericheatmap.y.axis')
			.append("text")
			.attr("class", level + " genericheatmap y label")
			.attr("x", 0)
			.attr("y", -1)
			.attr("text-anchor", "middle")
			.attr('fill', 'black')
			.text(y_var);
	}

	// Use 7 levels of purple
	var color_range = ["#f2f0f7","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486"];
	var heatmapDensityColor;

	var base = Math.floor(Math.exp(Math.log(maxValue)/5));

	heatmapDensityColor = d3.scaleThreshold()
					.domain([1, Math.pow(base, 1), Math.pow(base, 2), Math.pow(base, 3), 
								Math.pow(base, 4), Math.pow(base, 5)])
					.range(color_range);

	g.selectAll()
		.data(chart_data)
		.enter()
		.append("rect")
		.attr("class", level + " genericheatmap cell")
		.attr("x", function(d) { return x(d[x_var]) })
		.attr("y", function(d) { return y(d[y_var]) })
		.attr("width", x.bandwidth() )
		.attr("height", y.bandwidth() )
		.style("fill", function(d) { return heatmapDensityColor(d[z_var])} )
		.style("stroke", "grey")
		.style("stroke-width", "1px")
		.append('title')
		.text(d => `The ${z_var} is ${d3.format(".2s")(d[z_var])}.`);	

	// Children Identity
	// TODO merge all identity code to a class
	if (childrenIdentityFlag) {
		g.selectAll(".rect")
			.data(identity_data)
			.enter()    
			.append("rect")	
			.attr("class", d => level + " genericheatmap initialvirtuallayer children rect " 
						+ d.dependent + " " + d.independent)	  
			.attr("transform", function(d) {
				var y_position = height/2;
				return "translate(" + (-margin.left) +"," + y_position + ")";
			})						
			//.attr("x", -10)
			.attr("x", width + rectWidth + 30)
			.attr("y", -10)						
			.attr("width", rectWidth)
			.attr("height", rectHeight)
			.style("stroke", "black")
			.style("stroke-width", "2px")
			.attr("stroke-opacity", 0.3)
			.style("fill-opacity", 1)
			.style("fill", d => heatmapColorScale(d.value))
			.append('title')
			.text(function(d) {
				return `The mean distance is ${d3.format(".3f")(d.value)}.`
			});
	}

}

const interactGenericHeatmap = (selection, props) => {
	const {
	  margin,
	  width,
	  height,
	  xValue,
	  yValue,
	  x_var,
	  y_var,
	  z_var,
	  contextaul_vars,
	  parentIdentityFlag,
	  childrenIdentityFlag,
	  rectWidth,
	  rectHeight,
	  identity_data,
	  csvData,
	  myColor,
	  level
	} = props;

	selection.selectAll('#' + level + "_" + y_var +  "_genericheatmap_g")
			 .remove();

	// Processing the data
	var aggResultArray = d3.nest()
						.key(function(d) {return d[y_var]})
						.key(function(d) {return d[x_var]})
						.sortKeys(d3.ascending)
						.rollup(function(v) {
							return {
								sum: d3.sum(v, function(d) {return d[z_var]})
							}
						})
						.entries(csvData);

	// Flattern the nested data
	var chart_data = []
	aggResultArray.forEach(function(row) {
		row.values.forEach(function(cell) {
			var singleObj = {};
			singleObj[y_var] = row.key;
			singleObj[x_var] = cell.key;
			singleObj[z_var] = cell.value.sum;

			chart_data.push(singleObj);
		});
	});


	var xScale = d3.scaleLinear()
					.domain(d3.extent(chart_data, xValue));
	var xSequence = xScale.nice().ticks(5);

	var yScale = d3.scaleLinear()
					.domain(d3.extent(chart_data, yValue));
	var ySequence = yScale.nice().ticks(5);

	// prepare for color considering aggregate heatmap in the virtual layer
	var min = Math.floor(d3.min(chart_data, function (d) { return d[x_var]; } ));
	var max = Math.ceil(d3.max(chart_data, function (d) { return d[x_var]; } ));

	var maxValue = d3.max(chart_data, d => d[z_var]);

	// Label
	var y_var_label = d3.map(chart_data, function(d){return d[y_var];}).keys().reverse();
    var x_var_label = d3.map(chart_data, function(d){return d[x_var];}).keys();

	const g = selection.append('g')
					.attr("id", level + "_" + y_var +  "_genericheatmap_g")
					.attr('transform', `translate(${margin.left},${-height/2 + margin.top})`);

	// Build X scales and axis:
	var x = d3.scaleBand()
				.range([ 0, width ])
				.domain(x_var_label)
				.padding(0.1);

	var xAxis = g.append("g")
		.attr("class", level + " genericheatmap x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x).tickSize(0));
		
		xAxis.select(".domain").remove();
		
		xAxis.selectAll("text")
			.attr("transform", "rotate(-60)")
			.attr("dx", "-.3em")
			.attr("dy", ".2em")
			.style("text-anchor", "end");

	var select = xAxis.append("foreignObject")
					.attr("width", 100)
					.attr("height", 100)
					.attr("x", width - 5)
					.attr("y", 5)
					.append('xhtml:select')
					.attr("class", level + " " + y_var + " genericheatmap x menu")
					.attr("id", level + "_" + y_var +  "_genericheatmap_x_menu")
					.on("mousedown", function() { d3.event.stopImmediatePropagation(); }) 
					.on('change', (event) => {

						// Reset VL
						resetVirtualLayering(level);

						var selected_option = $('#' + level + "_" + y_var +  "_genericheatmap_x_menu").val();
						selection.call(interactGenericHeatmap, {
							margin: margin,
							width: width,
							height: height,
							xValue: xValue,
							yValue: d => d[selected_option],
							x_var: selected_option,
							y_var: y_var,
							z_var: z_var,
							contextaul_vars: contextaul_vars,
							childrenIdentityFlag: childrenIdentityFlag,
							rectWidth: rectWidth,
							rectHeight: rectHeight,
							identity_data: identity_data,
							csvData: csvData,
							level: level
						});	
					});

	select.selectAll('option')
			.data(contextaul_vars).enter()
			.append('option')
			.attr('value', d => d)
			.text(function(d){return d;})
			.property("selected", 
				function(d){ 
					if (x_var.includes(d)) return d;});

	// Build Y scales and axis:
	var y = d3.scaleBand()
				.range([ height, 0 ])
				.domain(y_var_label)
				.padding(0.1);

	g.append("g")
		.attr("class", level + " genericheatmap y axis")
		.call(d3.axisLeft(y)
				.tickSize(0))
		.select(".domain").remove()

	// Add y axis label
	g.select('.' + level + '.genericheatmap.y.axis')
		.append("text")
		.attr("class", level + " genericheatmap y label")
		.attr("x", 0)
		.attr("y", -1)
		.attr("text-anchor", "middle")
		.attr('fill', 'black')
	  	.text(y_var);

	// Use 7 levels of purple
	var color_range = ["#f2f0f7","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486"];
	var heatmapDensityColor;

	var base = Math.floor(Math.exp(Math.log(maxValue)/5));

	heatmapDensityColor = d3.scaleThreshold()
					.domain([1, Math.pow(base, 1), Math.pow(base, 2), Math.pow(base, 3), 
								Math.pow(base, 4), Math.pow(base, 5)])
					.range(color_range);

	g.selectAll()
		.data(chart_data)
		.enter()
		.append("rect")
		.attr("class", level + " genericheatmap cell")
		.attr("x", function(d) { return x(d[x_var]) })
		.attr("y", function(d) { return y(d[y_var]) })
		.attr("width", x.bandwidth() )
		.attr("height", y.bandwidth() )
		.style("fill", function(d) { return heatmapDensityColor(d[z_var])} )
		.style("stroke", "grey")
		.style("stroke-width", "1px")
		.append('title')
		.text(d => `The ${z_var} is ${d3.format(".2s")(d[z_var])}.`);	

	// Children Identity
	// TODO merge all identity code to a class
	if (childrenIdentityFlag) {

		g.selectAll(".rect")
			.data(identity_data)
			.enter()    
			.append("rect")	
			.attr("class", d => level + " genericheatmap initialvirtuallayer children rect " 
						+ d.dependent + " " + d.independent)	  
			.attr("transform", function(d) {
				var y_position = height/2;
				return "translate(" + (-margin.left) +"," + y_position + ")";
			})						
			//.attr("x", -10)
			// Adjust for interactive menu
			//.attr("x", width + rectWidth + 30)
			.attr("x", width + rectWidth + 40)
			.attr("y", -10)						
			.attr("width", rectWidth)
			.attr("height", rectHeight)
			.style("stroke", "black")
			.style("stroke-width", "2px")
			.attr("stroke-opacity", 0.3)
			.style("fill-opacity", 1)
			.style("fill", d => heatmapColorScale(d.value))
			.append('title')
			.text(function(d) {
				return `The mean distance is ${d3.format(".3f")(d.value)}.`
			});

		// Text for identity portion  
		g.selectAll(".text")
			.data(identity_data)
			.enter()    		
			.append("text")	   
			.attr("class", d => level + " genericheatmap children text " 
						+ d.dependent + " " + d.independent)	
			.attr("transform", function(d) {
				var y_position = height/2;
				return "translate(" + (-margin.left) +"," + y_position + ")";
			})		
			.attr("dx", '.6em')			  
			.attr('dy', '1.5em')																
			.style("text-anchor", "end")
			.text(d => d.dependent + "," + d.independent);
	}
}