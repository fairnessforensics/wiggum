const horizontal_grouped_bar_chart_virtual_layer = (selection, props) => {
	const {
	  height,
	  parentVLWidth,
	  margin,
	  side,
	  level
	} = props;

	var rowIndex = 0;

	selection.each(function (d) {
		var selectionLevelG_x = d.y;
		var level2_x = d.children[0].y;
		var level2_y = d.children[0].x;

		var keyArray = d.data.key.split(",");
		keyArray[0] = keyArray[0].replace(/\s+/g, '.');
		keyArray[1] = keyArray[1].replace(/\s+/g, '.');

		var secondLevelG1 = d3.select('.level-2' + '.' + keyArray[0] + '.' + keyArray[1]);
		var secondLevelG = d3.selectAll('.level-2' + '.' + keyArray[0] + '.' + keyArray[1]);

		var groups = d.data.values.map(itemn => itemn.key);

		var identity_data = globalSplitbyTable.filter(obj => {
			return obj.dependent === keyArray[0]
					&& obj.independent === keyArray[1]
		})

		var yScale = d3.scaleBand()
						.domain(groups)
						.range([0, height])
						.paddingInner(0.3)
						.paddingOuter(0.1);
		
		secondLevelG1.selectAll(".virtuallayer.parent.circle")
			.data(identity_data)
			.enter().append("circle")	    
			.attr("class", d => level + " horizontablgroupedbarchart virtuallayer parent circle " 
						+ d.dependent + " " + d.independent + " splitby_" + d.splitby)	  
			.attr("transform", function(d) {
				var y_position = margin.top + yScale(d.splitby) + yScale.bandwidth()/2;
				return "translate(" + 0 +"," + y_position + ")";
			})
			.attr('r', globalCircleRadius)	
			.style('stroke', 'black')
			.style('stroke-width', '2px')
			.attr("stroke-opacity", 0.3)
			.style("fill-opacity", 1) 
			.style("fill", d => heatmapColorScale(d.mean_distance))
			.append('title')
			.text(function(d) {
				return `The mean distance is ${d3.format(".3f")(d.mean_distance)}.`
			});
		
		// Text for identity portion
		secondLevelG1.selectAll(".virtualLayer.parent.text")		
			.data(identity_data)
			.enter().append("text")	   
			.attr("class", d => level + " horizontablgroupedbarchart virtuallayer parent text " 
					+ d.dependent + " " + d.independent + " splitby_" + d.splitby)	
			.attr("transform", function(d, i) {
					var y_position = margin.top + yScale(d.splitby) + yScale.bandwidth()/2;
					return "translate(" + 0 +"," + y_position + ")";
				})
			.attr("dx", globalCircleRadius)			  
			.attr("dy", 2*globalCircleRadius + 5)			
			.style("text-anchor", "end")
			.text(d => d.splitby);	

		// Add links
		var linkData = [];

		secondLevelG.each(function (d) {
			var object = {};
			
			if (side == 'parent') {
				var y_position = margin.top + yScale(d.data.key) + yScale.bandwidth()/2;

				object['source'] = [height/2, -level2_x + selectionLevelG_x + 10];
				object['target'] = [y_position, -parentVLWidth - 10];

				// add color
				object['color'] = '#000000';

				// add opacity
				object['opacity'] = 1;
				
				// TODO(not working) add id for coordiate
				object['id'] = d3.select(this).attr("id");

				linkData.push(object);
			} 
				
		});

		secondLevelG1.call(link, {
				data: linkData,
				side: side,
				rowIndex: 'row' + rowIndex,
				chartType: 'horizontablgroupedbarchart',
				level: level
		});		

		rowIndex = rowIndex + 1;

	});
}
