const link = (selection, props) => {
	const {
		data,
		side,
		rowIndex,
		chartType,
		multi_no,
	  	level,
		group_select_flag
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
		//.style("opacity", 0.6)
		.style("opacity", d => d.opacity)
		.style("stroke-width", "1px")
		.on("mouseover", function(d) {
			if (side != "aux")
				onMouseOver(selection, this, level, rowIndex, side, multi_no, chartType, group_select_flag);
		})
		.on("mouseout", function(d) {
			if (side != "aux")
				onMouseOut(d, level, rowIndex, multi_no, chartType)});

}

const swath = (selection, props) => {
	const {
		data,
		side,
		rowIndex,
		chartType,
		multi_no,
	  	level,
		group_select_flag
	} = props;

	selection.selectAll('.vpath list node').data(data)
		.enter().append('path')
		.attr("d", d => `
			M${d.start1[0]},${d.start1[1]}
			C${(d.start1[0] + d.end1[0]) / 2},${d.start1[1]} 
			 ${(d.start1[0] + d.end1[0]) / 2},${d.end1[1]} 
			 ${d.end1[0]},${d.end1[1]}
			L${d.end2[0]},${d.end2[1]}
			C${(d.start2[0] + d.end2[0]) / 2},${d.end2[1]} 
			 ${(d.start2[0] + d.end2[0]) / 2},${d.start2[1]} 
			 ${d.start2[0]},${d.start2[1]}
			Z
		`)
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
		.attr('fill', d => d.color)
		.attr('stroke', d => d.color)
		//.style("opacity", 0.6)
		.style("opacity", d => d.opacity)
		.style("stroke-width", "1px")
		.on("mouseover", function(d) {
			if (side != "aux")
				onMouseOver(selection, this, level, rowIndex, side, multi_no, chartType, group_select_flag);
		})
		.on("mouseout", function(d) {
			if (side != "aux")
				onMouseOut(d, level, rowIndex, multi_no, chartType)});

}

const swath_control = (selection, props) => {
	const {
		data,
		side,
		rowIndex,
		chartType,
		multi_no,
	  	level,
		group_select_flag
	} = props;

	selection.selectAll('.vpath list node').data(data)
		.enter().append('path')
		.attr("d", d => `
			M${d.start1[0]},${d.start1[1]}
			L${d.start1_right[0]},${d.start1_right[1]}
			C${(d.start1_right[0] + d.end1_left[0]) / 2},${d.start1_right[1]} 
			 ${(d.start1_right[0] + d.end1_left[0]) / 2},${d.end1_left[1]} 
			 ${d.end1_left[0]},${d.end1_left[1]}	
			L${d.end1[0]},${d.end1[1]}		
			L${d.end2[0]},${d.end2[1]}	
			L${d.end2_left[0]},${d.end2_left[1]}			 
			C${(d.start2_right[0] + d.end2_left[0]) / 2},${d.end2_left[1]} 
			 ${(d.start2_right[0] + d.end2_left[0]) / 2},${d.start2_right[1]} 
			 ${d.start2_right[0]},${d.start2_right[1]}
			L${d.start2[0]},${d.start2[1]}	
			Z
		`)
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
		.attr('fill', d => d.color)
		.attr('stroke', d => d.color)
		.style("opacity", d => d.opacity)
		.style("stroke-width", "1px")
		.on("mouseover", function(d) {
			if (side != "aux")
				onMouseOver(selection, this, level, rowIndex, side, multi_no, chartType, group_select_flag);
		})
		.on("mouseout", function(d) {
			if (side != "aux")
				onMouseOut(d, level, rowIndex, multi_no, chartType)});

}


function onMouseOver(selection, element, level, rowIndex, side, multi_no, chartType, group_select_flag) {
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
	} else if (chartType == 'scatterplot' || chartType == 'scatterplot_level2') {
		d3.selectAll("." + level + "." + rowIndex + "."+ chartType + ".circle")
			.style("opacity", 0.1);	
	}

	// Virtual layer
	d3.selectAll("." + level +"." + rowIndex +  ".virtuallayer")
		.style("opacity", 0.1);
	// Aux lines
	d3.selectAll("." + level +"." + rowIndex +  ".auxpath")
		.style("opacity", 0.1);
	// Connecting lines in scatterplot
	d3.selectAll("." + level +"." + rowIndex +  ".linepath")
		.style("opacity", 0.1);

	d3.select(element).style("opacity", 1);

	var loc = element.id.lastIndexOf(side);
	var view_elementId = element.id.substring(0, loc-1);

	function getSecondLastPart(str) {
		let parts = str.split("_");
		return parts.length > 1 ? parts[parts.length - 2] : null; 
	}
	if (group_select_flag == true) {
		var selected_subgroup = getSecondLastPart(view_elementId);

		selection.selectAll(".scatterplot.subgroup_" + selected_subgroup)
				.style("opacity", 1)
				.raise();

		let parts = element.id.split("_");

		let new_part = parts.slice();
		// splice is in place
		new_part.splice(parts.length - 3, 1);
		let result = new_part.join("_");

		d3.select("#" + result.replace(side, "linepath")).style("opacity", 1);

		new_part = parts.slice();

		if (side == "parent") {
			new_part.splice(new_part.length - 3, 1, "last");
			result = new_part.join("_");

			d3.select("#" + result.replace("parent", "children")).style("opacity", 1);
		} else if (side == "children") {
			new_part.splice(new_part.length - 3, 1, "0");
			result = new_part.join("_");

			d3.select("#" + result.replace("children", "parent")).style("opacity", 1);
		} else {}
	}

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

function onMouseOut(d, level, rowIndex, multi_no, chartType) {
	var opacityValue = 1;
	if (chartType == "doublehistogram") {
		opacityValue = 0.6;
	}

	d3.selectAll("." + level +"." + rowIndex + "."+ chartType + ".bar")
		.style("opacity", opacityValue);
	d3.selectAll("." + level +"." + rowIndex + "."+ chartType + ".circle")
		.style("opacity", opacityValue);
	d3.selectAll("." + level +"." + rowIndex + "."+ chartType + ".vpath")
		.style("opacity", d.opacity);

	// Aux lines
	d3.selectAll("." + level +"." + rowIndex +  ".auxpath")
		.style("opacity", 0.1);

	d3.selectAll("." + level +"." + rowIndex +  ".linepath")
		.style("opacity", 1);
}

// Horizontal link generator
var linkHorizontal = d3.linkHorizontal()
		.source(function(d) {
			return [d.source[1], d.source[0]];
		})
		.target(function(d) {
			return [d.target[1], d.target[0]];
		});