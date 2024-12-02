const link = (selection, props) => {
	const {
		data,
		side,
		rowIndex,
		chartType,
		multi_no,
	  	level
	} = props;

	selection.selectAll('.vpath list node').data(data)
		.enter().append('path')
		.attr("d", linkHorizontal)
		.attr("id", d => d.id + "_" + side + "_vpath")
		.attr("class", function(d) {
			if (multi_no != null) {
				return level + " " + rowIndex + " " + multi_no + " " 
						+ chartType + " vpath " + side + " virtuallayer";
			} else {
				return level + " " + rowIndex + " " + chartType 
						+ " vpath " + side + " virtuallayer";
			}
		})
		.attr('fill', 'none')
		.attr('stroke', d => d.color)
		.style("opacity", 0.6)
		.style("stroke-width", "1px")
		.on("mouseover", function(d) {
			if (side != "aux")
				onMouseOver(this, level, rowIndex, side, multi_no, chartType);
		})
		.on("mouseout", function(d) {
			if (side != "aux")
				onMouseOut(level, rowIndex, multi_no, chartType)});

}

function onMouseOver(element, level, rowIndex, side, multi_no, chartType) {
	//var opacityValue = 1;
	//if (chartType == "doublehistogram") {
	//	opacityValue = 0.6;
	//}

	// reset first
	/*d3.selectAll("." + level +  ".virtuallayer")
		.style("opacity", 1);
	d3.selectAll("." + level + "."+ chartType + ".bar")
		.style("opacity", opacityValue);
	d3.selectAll("." + level + "."+ chartType + ".vpath")
		.style("opacity", opacityValue);
*/
	if (chartType == 'histogram') {
		if (multi_no != null) {
			d3.selectAll("." + level +"." + rowIndex + "." + multi_no + "."+ chartType + ".bar")
				.style("opacity", 0.1);
		} else {
			d3.selectAll("." + level + "." + rowIndex + "."+ chartType + ".bar")
				.style("opacity", 0.1);	
		}
	} else if (chartType == 'scatterplot') {
		d3.selectAll("." + level + "." + rowIndex + "."+ chartType + ".circle")
			.style("opacity", 0.1);	
	}

	// Virtual layer
	d3.selectAll("." + level +"." + rowIndex +  ".virtuallayer")
		.style("opacity", 0.1);
	// Aux lines
	d3.selectAll("." + level +"." + rowIndex +  ".auxpath")
		.style("opacity", 0.1);
	d3.select(element).style("opacity", 1);
	var loc = element.id.lastIndexOf(side);
	var view_elementId = element.id.substring(0, loc-1);

	if (side == "parent") {
		d3.select("#" + element.id.replace("parent", "children")).style("opacity", 1);
		d3.select("#" + element.id.replace("parent", "aux")).style("opacity", 1);
	} else if (side == "children") {
		d3.select("#" + element.id.replace("children", "parent")).style("opacity", 1);
		d3.select("#" + element.id.replace("children", "aux")).style("opacity", 1);
	} else {
		//console.log(element.id);
		//d3.select("#" + element.id.replace("children", "parent")).style("opacity", 1);
	}


	// Coordiate view element
	d3.select("#" + view_elementId).style("opacity", 1);
}

function onMouseOut(level, rowIndex, multi_no, chartType) {
	var opacityValue = 1;
	if (chartType == "doublehistogram") {
		opacityValue = 0.6;
	}

	d3.selectAll("." + level +"." + rowIndex + "."+ chartType + ".bar")
		.style("opacity", opacityValue);
	d3.selectAll("." + level +"." + rowIndex + "."+ chartType + ".vpath")
		.style("opacity", opacityValue);

	// Aux lines
	d3.selectAll("." + level +"." + rowIndex +  ".auxpath")
		.style("opacity", 0.1);
}

// Horizontal link generator
var linkHorizontal = d3.linkHorizontal()
		.source(function(d) {
			return [d.source[1], d.source[0]];
		})
		.target(function(d) {
			return [d.target[1], d.target[0]];
		});