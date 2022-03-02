const stripPlot = (selection, props) => {
	const {
		chart_data,
		agg_chart_data,
		width,
		height,
		level
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

	// x axis
	const xAxis = d3.axisTop(xScale).ticks(5, "%");
	selection.append("g")
		.attr("class", level + " stripplot x axis")
		.attr("transform", "translate(0," + (-margin.top) + ")")
		.call(xAxis)
		.call(g => g.selectAll(".tick line").clone()
					.attr("stroke-opacity", 0.1)
					.attr("y2", height + margin.top))
		.call(selection => selection.selectAll(".domain").remove());

	// y axis
	const yAxis = d3.axisLeft(yScale);
	selection.append("g")
		.call(yAxis)
		.call(selection => selection.selectAll(".tick line").clone()
			.attr("stroke-opacity", 0.1).attr("x2", width))
		.call(selection => selection.selectAll(".domain").remove())

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

	/* circle
	selection.append("g")
		.selectAll(".circle.agg")
		.data(agg_chart_data)
		.enter().append("circle")	  
		.attr("class", level + " stripplot agg circle")  
		.attr("r", 3.5)
		.attr("cx", d => xScale(d.value))
		.attr("cy", d => yScale(d.subgroup))
		.attr("fill", d => color(d.name))
		.style("opacity", "0.3")
		.attr("pointer-events", "all");
	*/
  };