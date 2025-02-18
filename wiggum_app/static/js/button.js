const button = (selection, props) => {
	const {
		bWidth,
        bHeight,
        bSpace,
        x0,        //x offset
        y0,         //y offset
        transform_x
	} = props;
	

	selection.append("rect")
        .attr("class","buttonRect")
        .attr("transform", "translate(" + transform_x + "," + 3 + ")")
        .attr("width",bWidth)
        .attr("height",bHeight)			
        .attr("x",function(d,i) {var col = i%1; return x0+(bWidth+bSpace)*col;})
        .attr("y",function(d,i) {var row = Math.floor(i/1); return y0 + (bHeight+bSpace)*row })
        .attr("rx",5) 
        .attr("ry",5)
        .attr("fill","#797979");

    selection.append("text")
		.attr("class","buttonText")
		.attr("transform", "translate(" + transform_x + "," + 3 + ")")
		.attr("font-family","FontAwesome")
		.attr("x",function(d,i) {
			var index = i%1;
			return x0 + (bWidth+bSpace)*index + bWidth/2;
		})
		.attr("y",function(d,i) {
			var row = Math.floor(i/1);
			return y0+bHeight/2 + (bHeight+bSpace)*row;
		})
		.attr("text-anchor","middle")
		.attr("dominant-baseline","central")
		.attr("fill","white")
		.text(function(d) {return d;});

}

const button_vertical_list = (selection, props) => {
	const {
		bWidth,
        bHeight,
        bSpace,
        x0,        //x offset
        y0,         //y offset
        transform_x,
		side
	} = props;
	
	depth = 4;

	selection.append("rect")
        .attr("class","buttonRect")
        .attr("transform", "translate(" + transform_x + "," + 3 + ")")
        .attr("width",bWidth)
        .attr("height",bHeight)			
        .attr("x",function(d,i) {
			var col = Math.floor(i/depth); 
			if (side == 'parent') {
				return x0-(bWidth+bSpace)*col;
			} else {
				return x0+(bWidth+bSpace)*col;
			}})
        .attr("y",function(d,i) {
			var row = i%depth; return y0 + (bHeight+bSpace)*row })
        .attr("rx",5) 
        .attr("ry",5)
        .attr("fill","#797979");

    selection.append("text")
		.attr("class","buttonText")
		.attr("transform", "translate(" + transform_x + "," + 3 + ")")
		.attr("font-family","FontAwesome")
		.attr("x",function(d,i) {
			var index = Math.floor(i/depth);
			if (side == 'parent') {
				return x0 - (bWidth+bSpace)*index + bWidth/2;
			} else {
				return x0 + (bWidth+bSpace)*index + bWidth/2;
			}
		})
		.attr("y",function(d,i) {
			var row = i%depth;
			return y0+bHeight/2 + (bHeight+bSpace)*row;
		})
		.attr("text-anchor","middle")
		.attr("dominant-baseline","central")
		.attr("fill","white")
		.text(function(d) {return d;});

}