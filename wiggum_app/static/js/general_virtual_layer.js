const initial_children_virtual_layer = (selection, props) => {
	const {
		chart_name,
		identity_data,
		position_x,
		position_y,
	  	level
	} = props;

	selection.selectAll(".rect")
		.data(identity_data)
		.enter()    
		.append("rect")	
		.attr("class", d => level + " " + chart_name + " virtuallayer children rect " 
					+ d.dependent + " " + d.independent)	  
		.attr("transform", "translate(" + position_x +"," + 0 + ")")						
		.attr("x", globalRectWidth/2)
		.attr("y", -globalRectHeight/2)						
		.attr("width", globalRectWidth)
		.attr("height", globalRectHeight)
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
	selection.selectAll(".text")
		.data(identity_data)
		.enter()    		
		.append("text")	   
		.attr("class", d => level + " " + chart_name + " children text " 
					+ d.dependent + " " + d.independent)	
		.attr("transform", "translate(" + position_x +"," + 0 + ")")		
		.attr("dx", '.6em')			  
		.attr('dy', '1.5em')																
		.style("text-anchor", "end")
		.text(d => d.dependent + "," + d.independent);
}