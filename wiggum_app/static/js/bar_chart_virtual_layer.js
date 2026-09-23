const horizontal_grouped_bar_chart_virtual_layer = (selection, props) => {
	const {
	  width,
	  height,
	  parentVLWidth,
	  margin,
	  axis_x_position,
	  side,
	  level
	} = props;

	var rowIndex = 0;

	selection.each(function (d) {
		var selectionLevelG_x = d.y;
		var level2_x = d.children[0].y;
		var level2_y = d.children[0].x;

		var keyArray = d.data.key.split(",");
		var dependent = keyArray[0].replace(/\s+/g, '.');
		var independent = keyArray[1].replace(/\s+/g, '.');

		var secondLevelG1 = d3.select('.level-2' + '.' + dependent + '.' + independent);
		var secondLevelG = d3.selectAll('.level-2' + '.' + dependent + '.' + independent);
		var groups = d.data.values.map(itemn => itemn.key);

		var identity_data = globalSplitbyTable.filter(obj => {
			return obj.dependent === dependent
					&& obj.independent === independent
		})

		var yScale = d3.scaleBand()
						.domain(groups)
						.range([0, height])
						.paddingInner(0.3)
						.paddingOuter(0.1);
		
		if (side == 'parent') {
			secondLevelG1.selectAll(".virtuallayer." + side + ".circle")
				.data(identity_data)
				.enter().append("circle")	    
				.attr("class", d => level + " horizontablgroupedbarchart virtuallayer " + side + " circle " 
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
			secondLevelG1.selectAll(".virtualLayer." + side + ".text")		
				.data(identity_data)
				.enter().append("text")	   
				.attr("class", d => level + " horizontablgroupedbarchart virtuallayer " + side + " text " 
						+ d.dependent + " " + d.independent + " splitby_" + d.splitby)	
				.attr("transform", function(d, i) {
						var y_position = margin.top + yScale(d.splitby) + yScale.bandwidth()/2;
						return "translate(" + 0 +"," + y_position + ")";
					})
				.attr("dx", globalCircleRadius)			  
				.attr("dy", 2*globalCircleRadius + 5)			
				.style("text-anchor", "end")
				.text(d => d.splitby);	
		} else {
			secondLevelG1.selectAll(".virtuallayer." + side + ".circle")
				.each(function(d) {
					if (d.originalTransform == undefined) {
						d.originalTransform = d3.select(this).attr("transform");
					}
		
					var y_position = margin.top + yScale(d.splitby) + yScale.bandwidth() / 2;

					d3.select(this)
						.attr("transform",
							"translate(" + (width - margin.right) + "," + y_position + ")"
						);
				});

			// Legend
			secondLevelG1.selectAll("." + level + ".horizontalgroupedbarchart.legend")
				.each(function() {
					if (this.legendMoved !== true) {
						var selection = d3.select(this);
						var currentTransform = selection.attr("transform");

						// Store on the DOM element
						this.originalTransform = currentTransform;
						
						var match = currentTransform.match(/translate\(([^,]+),([^)]+)\)/);

						var x = +match[1];
						var y = +match[2];

						selection.attr("transform", "translate(" + x + "," + (y - 30) + ")");

						this.legendMoved = true;
					}
				});
		}

		// Add links
		var linkData = [];

		secondLevelG.each(function (d) {
			var object = {};
			var splitby = d.data.key;
			var y_position = margin.top + yScale(splitby) + yScale.bandwidth()/2;
			
			if (side == 'parent') {

				object['source'] = [height/2, -level2_x + selectionLevelG_x + 10];
				object['target'] = [y_position, -parentVLWidth - 10];

				// add color
				object['color'] = '#000000';

				// add opacity
				object['opacity'] = 1;
				
				// TODO(not working) add id for coordiate
				object['id'] = d3.select(this).attr("id");

				linkData.push(object);
			} else {
				var thirdLevelG = d3.selectAll('.node.level-3' + '.' + dependent + '.' 
												+ independent + '.splitby_' + splitby);

				thirdLevelG.each(function(dd) {
					object = {};

					object['source'] = [y_position, width + 10];
					object['target'] = [dd.x - level2_y, dd.y - width];
					
					// add color
					object['color'] = '#000000';

					// add opacity
					object['opacity'] = 1;
				
					// TODO(not working) add id for coordiate
					object['id'] = d3.select(this).attr("id");

					linkData.push(object);
				})
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
