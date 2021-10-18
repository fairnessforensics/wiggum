/**
 * Add grid interaction
 *
 * @param svg.
 * @param margin.
 * @returns none.
 */ 
function addGrid(svg, margin) {

    var width = svg.attr("width") - margin.left - margin.right,
        height = svg.attr("height") - margin.top - margin.bottom,
        transform = svg.attr("transform");

	//var grid = d3.select("#grid")
	//				.append("svg")
///					.attr("width", width)
	//				.attr("height", height)
      //              .attr("transform", transform);

    // grid dimension
    var d = 9;
    var gridData = initGridData(width, height, d);
    console.log(gridData);

	var row = svg.select("g")
                    .selectAll(".row")
					.data(gridData)
					.enter().append("g")
					.attr("class", "row");
	
	var column = row.selectAll(".square")
					.data(function(d) { return d; })
					.enter().append("rect")
					.attr("class","square")
					.attr("x", function(d) { return d.x; })
					.attr("y", function(d) { return d.y; })
					.attr("width", function(d) { return d.width; })
					.attr("height", function(d) { return d.height; })                
					.style("fill", "none")
                    .style("pointer-events","visible")                    
                    .style("stroke", "#222")
                    .style("stroke-opacity", 0.2)                   
					.on("click", function(d, i) {
                        d3.selectAll('circle.selected').classed( "selected", false);
                        
                        var grid_selected = d3.select(this);
                        var grid = {
                            x       : parseFloat(grid_selected.attr("x")),
                            y       : parseFloat(grid_selected.attr("y")),
                            width   : parseFloat(grid_selected.attr("width")),
                            height  : parseFloat(grid_selected.attr("height"))
                        };

                        d3.selectAll('circle').each( function() {  
                            thisCircle = d3.select(this);
                  
                            if(!d3.select(this).classed("selected") && 
                                    // inner circle inside selected grid
                                    parseFloat(thisCircle.attr('cx'))>grid.x && 
                                    parseFloat(thisCircle.attr('cx'))<=grid.x+grid.width &&
                                    parseFloat(thisCircle.attr('cy'))>grid.y && 
                                    parseFloat(thisCircle.attr('cy'))<=grid.y+grid.height
                            ) { 
                                d3.select(this)                            
                                    .classed("selected",true);
                            }
                         });
					});

}

/**
 * Initiate grid
 *
 * @param width.
 * @param height.
 * @param d.  
 * @returns none.
 */ 
function initGridData(width, height, d) {
	var data = new Array();
	var xpos = 1;
	var ypos = 1;
	var g_width = width/d;
	var g_height = height/d;
	
	for (var row = 0; row < d; row++) {
		data.push( new Array() );
		
		for (var column = 0; column < d; column++) {
			data[row].push({
				x: xpos,
				y: ypos,
				width: g_width,
				height: g_height
			})
			xpos += g_width;
		}

		xpos = 1;

		ypos += g_height;	
	}
	return data;
}
