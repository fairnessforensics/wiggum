const barChart = (selection, props) => {
	const {
	  chart_data,
	  width,
	  height,
	  xDomain,
	  level
	} = props;

	var subgroups = Object.keys(chart_data[0]).filter(item => {
		return item != 'subgroup'
	  });

	var groups = d3.map(chart_data, function(d){return(d.subgroup)}).keys();

	const margin = { top: 10, right: 0, bottom: 20, left: 10 };
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;
	
	const xScale = d3.scaleLinear()
	  //.domain([0, d3.max(chart_data, xValue)])
	  //.domain([0, 1])
	  .domain(xDomain)
	  .range([0, innerWidth]);
	
	const yScale = d3.scaleBand()
	  .domain(groups)
	  .range([0, innerHeight])
	  .padding(0.3);
	
	var ySubgroup = d3.scaleBand()
	  .domain(subgroups)
	  .range([0, yScale.bandwidth()])
	  .padding([0.05])

	//var color = d3.scaleOrdinal()
	//  .domain(subgroups)
	//  .range(['#e41a1c','#377eb8','#4daf4a'])

	const color = d3.scaleOrdinal(d3.schemeCategory10);

	const g = selection.append('g')
	  .attr('transform', `translate(${margin.left},${margin.top})`);
	
	const xAxis = d3.axisBottom(xScale)
	  .tickSize(-innerHeight)
	  .ticks(5, "%");
	
	g.append('g')
	  .call(d3.axisLeft(yScale))
	  .call(selection => selection.selectAll(".tick")
		.attr("class", level + " barchart tick")
		.style("font", "16px times"))
	  .selectAll('.domain, .tick line')
		.remove();
	
	const xAxisG = g.append('g')
					.attr("class", level + " barchart x axis")
					.call(xAxis)
					.attr("stroke-opacity", 0.2)
					.attr('transform', `translate(0,${innerHeight})`);
	
	xAxisG.select('.domain').remove();
	
	/*
	g.selectAll('rect').data(chart_data)
	  .enter().append('rect')
		.attr('y', d => yScale(yValue(d)))
		.attr('width', d => xScale(xValue(d)))
		.attr('height', yScale.bandwidth());*/

	g.append("g")
	  	.selectAll("g")
		.data(chart_data)
		.enter()
		.append("g")
		  .attr("transform", function(d) { return "translate(0, " + yScale(d.subgroup) + ")"; })
		.selectAll("rect")
		.data(function(d) { 
			return subgroups.map(function(key) { return {key: key, value: d[key]}; }); })
		.enter().append("rect")
		  .attr("class", level + " barchart bar")   
		  .attr("y", function(d){ return ySubgroup(d.key); })
		  .attr("width", function(d) { return xScale(d.value); })
		  .attr("height", ySubgroup.bandwidth())
		  .attr("fill", function(d) { return color(d.key); });		

  };
