const small_multiples_virtual_layer = (selection, props) => {
	const {
	  width,
	  height,
	  offset_x,
	  offset_y,
	  virtualLayerWidth,
	  rectWidth,
	  rectHeight,
	  matrix_data,
	  side,
	  level
	} = props;

	selection.each(function (d) {
		var selectionLevelG = d3.select(this);

		var keyArray = d.data.key.split(",");
		var single_object = {};
		var identity_data = [];
		single_object['dependent'] = keyArray[0];
		single_object['independent'] = keyArray[1];
		single_object['value'] = getMatrixValue(matrix_data, keyArray[0], keyArray[1]);
		identity_data.push(single_object);

		var g = selectionLevelG.append("g")
					.attr("class", level + ' ' + side + ' smallmultiple g');

		g.selectAll(".smallmultiple.rect" + "." + keyArray[0])
			.data(identity_data)
			.enter()    
			.append("rect")	
			.attr("class", d => level + " " + side + " virtuallayer smallmultiple rect " 
						+ d.dependent)	  
			.attr("transform", function(d) {
				var y_position = -offset_y - rectHeight/2;
				return "translate(" + offset_x +"," + y_position + ")";
			})						
			.attr("x", 0)
			.attr("y", 0)						
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

		g.selectAll(".smallmultiple.rect" + "." + keyArray[1])
			.data(identity_data)
			.enter()    
			.append("rect")	
			.attr("class", d => level + " " + side + " virtuallayer smallmultiple rect " 
						+ d.independent)	  
			.attr("transform", function(d) {
				var y_position = offset_y - rectHeight/2;
				return "translate(" + offset_x +"," + y_position + ")";
			})						
			.attr("x", 0)
			.attr("y", 0)						
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
			
		// Add links
		var linkData = [];
		var link_object1 = {};

		if (side == 'parent') {
			source_y = -virtualLayerWidth + rectWidth/2;
			target_y = -rectWidth/2;
		} else if (side == 'children') {
			source_y = virtualLayerWidth - rectWidth/2 + width;
			target_y = rectWidth + offset_x;
		}

		link_object1['source'] = [0, source_y];
		link_object1['target'] = [-offset_y, target_y];
		link_object1['color'] = "black";

		var link_object2 = {};
		link_object2['source'] = [0, source_y];
		link_object2['target'] = [offset_y, target_y];
		link_object2['color'] = "black";
		linkData.push(link_object1);
		linkData.push(link_object2);

		g.selectAll('.vpath.smallmultiples').data(linkData)
			.enter().append('path')
			.attr("d", linkHorizontal)
			.attr("class", level + " smallmultiples vpath " + side + " virtuallayer")
			.attr('fill', 'none')
			.attr('stroke', d => d.color)
			.style("opacity", 1)
			.style("stroke-width", "1px")
	})
}