const barChart = (selection, props) => {
	const {
	  chart_data,
	  width,
	  height,
	  xDomain,
	  level,
	  largerFlag,
	  keys,
	  percentageFlag,
	  parentIdentityFlag,
	  childrenIdentityFlag,
	  circleRadius,
	  identity_data,
	  x_axis_label,
	  legend_title,
	  myColor
	} = props;

	var subgroups;
	if (keys == undefined) {
		subgroups = Object.keys(chart_data[0]).filter(item => {
			return item != 'subgroup'
		});
	} else {
		subgroups = keys;
	}

	var groups = d3.map(chart_data, function(d){return(d.subgroup)}).keys();

	const margin = { top: 8, right: 0, bottom: 20, left: 10 };

	if (parentIdentityFlag) {
		margin.left = 20;
	}
	if (childrenIdentityFlag) {
		margin.right = 20;
	}

	const innerWidth = width - margin.left - margin.right;
	
	var innerHeight;
	if (!largerFlag) {
		innerHeight = height + 15;
	} else {
		innerHeight =  height - margin.top - margin.bottom;
	}

	const xScale = d3.scaleLinear()
	  //.domain([0, d3.max(chart_data, xValue)])
	  //.domain([0, 1])
	  .domain(xDomain).nice()
	  .range([0, innerWidth]);
	
	const yScale = d3.scaleBand()
	  .domain(groups)
	  .range([0, innerHeight])
	  .padding(0.3);
	
	var ySubgroup = d3.scaleBand()
	  .domain(subgroups)
	  .range([0, yScale.bandwidth()])
	  .padding([0.05]);

	//var color = d3.scaleOrdinal()
	//  .domain(subgroups)
	//  .range(['#e41a1c','#377eb8','#4daf4a'])

	var color;
	if (myColor == undefined) {
		color = d3.scaleOrdinal(d3.schemeCategory10);
	} else {
		color = myColor;
	}

	const g = selection.append('g')
	  .attr('transform', `translate(${margin.left},${margin.top})`);
	
	// background bars
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
		  .attr("class", level + " barchart backgroundbar")   
		  .attr("y", function(d){ return ySubgroup(d.key); })
		  .attr("width", function(d) { return innerWidth; })
		  .attr("height", ySubgroup.bandwidth())
		  .attr("fill", function(d) { return '#eee' ; });			

	var xAxis;
	if (percentageFlag) {
		xAxis = d3.axisBottom(xScale)
			.tickSize(-innerHeight)
			.ticks(5, "%");
	} else {
		xAxis = d3.axisBottom(xScale)
			.tickSize(-innerHeight)
			.ticks(5);
	}

	g.append('g')
	  .call(d3.axisLeft(yScale))
	  .call(selection => selection.selectAll(".tick")
		.attr("class", level + " barchart tick")
		.style("font", "16px times")
		.style("display",  "none"))
	  .selectAll('.domain, .tick line')
		.remove();
	
	const xAxisG = g.append('g')
					.attr("class", level + " barchart x axis")
					.call(xAxis)
					.attr("stroke-opacity", 0.2)
					.attr('transform', `translate(0,${innerHeight})`);
	
	xAxisG.select('.domain').remove();

	// Label for x-axis
	xAxisG.select(".tick:last-of-type text").clone()
		.attr("x", 28 - margin.left)
		.attr("text-anchor", "start")
		.attr("font-weight", "bold")
		.text(x_axis_label);

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

	// Identity Potion
	// Parent Identity
	if (parentIdentityFlag) {
		g.selectAll(".circle.left")
			.data(identity_data)
			.enter().append("circle")	    
			.attr("class", d => level + " barchart left circle " 
						+ d.dependent + " " + d.independent + " splitby_" + d.splitby)	  
			.attr("transform", function(d) {
				var y_position = yScale(d.splitby) + yScale.bandwidth()/2;
				return "translate(" + (-margin.left) +"," + y_position + ")";
			})
			.attr('r', circleRadius)	
			.style('stroke', 'black')
			.style('stroke-width', '2px')
			.style("fill-opacity", 1) 
			.style("fill", d => heatmapColorScale(d.mean_distance));

		// Text for identity portion  
		g.selectAll(".left.text")		
			.data(identity_data)
			.enter().append("text")	   
			.attr("class", function(d) {
				return level + " barchart left text";
			})	
			.attr("dx", circleRadius)			  
			.attr("dy", 2*circleRadius + 5)			
			.attr("transform", function(d) {
				var y_position = yScale(d.splitby) + yScale.bandwidth()/2;
				return "translate(" + (-margin.left) +"," + y_position + ")";
			})
			.style("text-anchor", "end")
			.text(d => d.splitby);
	}
	// Children Identity
	if (childrenIdentityFlag) {
		g.selectAll(".circle.right")
			.data(identity_data)
			.enter().append("circle")	    
			.attr("class", d => level + " barchart right circle " 
						+ d.dependent + " " + d.independent + " splitby_" + d.splitby)	  
			.attr("transform", function(d) {
				var y_position = yScale(d.splitby) + yScale.bandwidth()/2;
				return "translate(" + (width-margin.right) +"," + y_position + ")";
			})
			.attr('r', circleRadius)	
			.style('stroke', 'black')
			.style('stroke-width', '2px')
			.style("fill-opacity", 1) 
			.style("fill", d => heatmapColorScale(d.mean_distance));

		// Text for identity portion  
		g.selectAll(".right.text")		
			.data(identity_data)
			.enter().append("text")	   
			.attr("class", function(d) {
				return level + " barchart right text";
			})	
			.attr("dx", -circleRadius)			  
			.attr("dy", 2*circleRadius + 5)			
			.attr("transform", function(d) {
				var y_position = yScale(d.splitby) + yScale.bandwidth()/2;
				return "translate(" + (width-margin.right) +"," + y_position + ")";
			})
			.style("text-anchor", "start")
			.text(d => d.splitby);			
	}

	// Legend       
	var legend = g.selectAll(".legend")
					.data(subgroups)
					.enter().append("g")
					.attr("class", level + " barchart legend")
					.attr("transform", function(d, i) { return "translate("+ (width - margin.right - margin.left + 10) +"," + (i * 15 - 5) + ")"; });

	legend.append("rect")
		.attr("x", 0)
		.attr("width", 10)
		.attr("height", 10)
		.style("fill", d => color(d));

	legend.append("text")
		.attr("x", 15)
		.attr("y", 4)
		.attr("dy", ".35em")
		.style("font-size", "12px")                     
		.style("text-anchor", "start")
		.text(function(d) { return d; });

	g.append("text")
		.attr("class", level + " barchart legend title")		
		.attr("x", width - margin.left - margin.right + 10)
		.attr("y", -10)
		.style("font-size", "12px")                     
		.style("text-anchor", "start")
		.text(legend_title);	

  };

const coloredBarChart = (selection, props) => {
	const {
	  chart_data,
	  width,
	  height,
	  parentIdentityFlag,
	  childrenIdentityFlag,	  
	  rectWidth,
	  rectHeight,
	  identity_data,
	  yAxisLabel,
	  level,
	  myColor
	} = props;

	var margin = { left: 50, top: 0, right: 0, bottom: 30 };
	var innerWidth  = width  - margin.left - margin.right;
	var innerHeight = height - margin.top  - margin.bottom;

	const g = selection.append('g')
	  .attr('transform', `translate(${margin.left},${-height/2})`);

	var xAxisG = g.append("g")
	  .attr("class", level + " coloredbarchart x axis")
	  .attr("transform", "translate(0," + innerHeight + ")");

	var yAxisG = g.append("g")
	  .attr("class", level + " coloredbarchart y axis");

	var xScale = d3.scaleBand()
					//.domain(groups)
					.range([0, innerWidth])
					.padding(0.3);

	var yScale = d3.scaleLinear()
					.range([innerHeight, 0]);

	var color;
	if (myColor == undefined) {
		color = d3.scaleOrdinal(d3.schemeCategory10);
		color.domain(chart_data.map(function (d){ return d.name; }));
	} else {
		color = myColor;
	}

	var xAxis = d3.axisBottom(xScale);

	var yAxis = d3.axisLeft(yScale)
	  				.ticks(5,"%");	

	xScale.domain(chart_data.map( function (d){ return d.name; }));
	yScale.domain([0, d3.max(chart_data, function (d){ return d.value; })]).nice();

	xAxisG.call(xAxis)
		.selectAll("text")  
		.attr("dx", "-0.1em")
		.attr("dy", "0.8em");

	yAxisG.call(yAxis)
		.append("text")
		.attr("class", level + " coloredbarchart y axis label")	  
		.attr("x", 0)
		.attr("y", -10)
		.attr("text-anchor", "end")
		.attr('fill', 'black')
		.text(yAxisLabel);

	g.selectAll(".bar.rect")
		.data(chart_data)
		.enter()
		.append("rect")
		.attr("class", level + " coloredbarchart bar")   
		.attr("width", xScale.bandwidth())
		.attr("x", function (d){ return xScale(d.name); })
		.attr("y", function (d){ return yScale(d.value); })
		.attr("height", function (d){ return innerHeight - yScale(d.value); })
		.attr("fill", function (d){ return color(d.name); });

	// Parent Identity
	if (parentIdentityFlag) {
		g.selectAll(".rect")
			.data(identity_data)
			.enter()    
			.append("rect")	
			.attr("class", d => level + " coloredbarchart left rect " 
						+ d.dependent + " " + d.independent)	  
			.attr("transform", function(d) {
				var y_position = height/2;
				return "translate(" + (-margin.left) +"," + y_position + ")";
			})						
			.attr("x", -10)
			.attr("y", -10)						
			.attr("width", rectWidth)
			.attr("height", rectHeight)
			.style("stroke", "black")
			.style("stroke-width", "2px")
			.style("fill-opacity", 1)
			.style("fill", d => heatmapColorScale(d.value));

		// Text for identity portion  
		g.selectAll(".text")
			.data(identity_data)
			.enter()    		
			.append("text")	   
			.attr("class", d => level + " coloredbarchart left text " 
						+ d.dependent + " " + d.independent)	
			.attr("transform", function(d) {
				var y_position = height/2;
				return "translate(" + (-margin.left) +"," + y_position + ")";
			})		
			.attr("dx", '.6em')			  
			//.attr("dy", rectHeight + 5)	
			.attr('dy', '1.5em')																
			.style("text-anchor", "end")
			.text(d => d.dependent + "," + d.independent);
	}

}