const stripPlot = (selection, props) => {
	const {
		chart_data,
		agg_chart_data,
		width,
		height,
		level,
		x_axis_label
	} = props;
	var margin = ({top: 10, right: 0, bottom: 0, left: 0});

	var total_data = chart_data.concat(agg_chart_data);

	const xScale = d3.scaleLinear()
					.domain(d3.extent(total_data, d => d.value))
					.rangeRound([0, width])
					.nice();
	
	const yScale = d3.scalePoint()
					.domain(chart_data.map(d => d.subgroup))
					.rangeRound([0, height]);	
					
	const color = d3.scaleOrdinal(d3.schemeCategory10);

	var interval = yScale.step();

	// x axis
	const xAxis = d3.axisTop(xScale).ticks(5, "%");
	selection.append("g")
		.attr("class", level + " stripplot x axis")
		.attr("transform", "translate(0," + (-margin.top) + ")")
		.call(xAxis)
		.call(selection => selection.selectAll(".tick line").clone()
					.attr("class", level + " stripplot tick line")
					.attr("stroke-opacity", 0.1)
					.attr("y2", height + margin.top + interval/2))
		.call(selection => selection.selectAll(".domain").remove());

	// x-axis label
	selection.select(".tick:last-of-type text").clone()
		.attr("x", 15)
		.attr("text-anchor", "start")
		.attr("font-weight", "bold")
		.text(x_axis_label);

	// y axis
	const yAxis = d3.axisRight(yScale);

	// TODO it is a bug that data have .0
	yAxis.tickFormat(d3.format("d"));

	selection.append("g")
		.attr("transform", "translate(" + width +", 0)")
		.call(yAxis)
		.call(selection => selection.selectAll(".tick")
									.attr("class", level + " stripplot tick")
									.style("font", "16px times"))
		.call(selection => selection.selectAll(".tick line").clone()
									.attr("class", level + " stripplot tick sline")
									.attr("stroke-opacity", 1)
									.attr("x2", -width))
		.call(selection => selection.selectAll(".domain").remove());

	// Add a top line
	selection.append('line')
		.attr("class", level + " stripplot topline")
		.style("stroke", "black")
		.attr("stroke-opacity", 1)
		.attr("x1", 0)
		.attr("y1", -interval/2 + 1)
		.attr("x2", width)
		.attr("y2", -interval/2 + 1);

	// Shift the separating line by half interval
	selection.selectAll(".sline")
		.attr("transform", "translate(0, " + interval/2 +")");

	selection.append("g")
		.selectAll(".circle.subgroup")
		.data(chart_data)
		.enter().append("circle")	
		.attr("class", level + " stripplot subgroup circle")      
		.attr("r", 3.5)
		.attr("cx", d => xScale(d.value))
		.attr("cy", d => yScale(d.subgroup))
		.attr("fill", d => color(d.name))
		.attr("pointer-events", "all");

	// aggregate
	var symbol_diamond = d3.symbol()
            .type(d3.symbolDiamond).size(50);
	selection.append("g")
		.selectAll(".diamond.agg")
		.data(agg_chart_data)
		.enter().append("path")	  
		.attr("class", level + " stripplot agg diamond")  
		.attr("d", symbol_diamond)
		.attr("transform", d => "translate(" + xScale(d.value) + "," + yScale(d.subgroup) +")")
		.attr("fill", d => color(d.name))
		.style("opacity", "0.3")
		.attr("pointer-events", "all");

	// Legend       
	var legend = selection.selectAll(".legend")
					.data(color.domain())
					.enter().append("g")
					.attr("class", level + " stripplot legend")
					.attr("transform", function(d, i) { return "translate("+ (width + 30) +"," + (i * 15) + ")"; });

	legend.append("circle")
		.attr("r", 3.5)
		.attr("cx", 0)
		.attr("cy", 0)
		.style("fill", color);

	legend.append("text")
		.attr("x", 10)
		.attr("y", 3)
		//.attr("dy", ".35em")
		.style("font-size", "12px")                     
		.style("text-anchor", "start")
		.text(function(d) { return d; });
  };