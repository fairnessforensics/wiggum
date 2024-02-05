const link = (selection, props) => {
	const {
		data,
	  	level
	} = props;
	

	selection.selectAll('.path list node').data(data)
		.enter().append('path')
		.attr("d", linkHorizontal)
		.attr("class", d => "path left vl level" + level)
		.attr('fill', 'none')
		.attr('stroke', d => d.color)
		//.style("stroke", "black")
		.style("opacity", 0.6)
		.style("stroke-width", "1px");

}

// Horizontal link generator
var linkHorizontal = d3.linkHorizontal()
		.source(function(d) {
			return [d.source[1], d.source[0]];
		})
		.target(function(d) {
			return [d.target[1], d.target[0]];
		});