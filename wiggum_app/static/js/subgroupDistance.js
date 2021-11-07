/**
 * Subgroups' distances rectangles
 *
 * @param data.
 * @returns none.
 */ 
 function drawSubgroupDistance(data, datum) {  
     
    // Remove old subgroups' distances
    d3.select("#subgroup_distance").selectAll('svg').remove();

    var width = 279,
    height = 200,
    rw = 30,
    rh = 30;

    var margin = {top: 5, right: 120, bottom: 5, left: 60};

    var div = d3.select('#subgroup_distance');
    var svg = div.append('svg')
        .attr('width', width)
        .attr('height', height);

    var subgroupDistancePlot = svg.append("g")
		.attr("id", "subgroupDistancePlot")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");        

    // TODO Merge the color from distanceHeatmap2D.js
	// continous color for overview
	var heatmapColors = ['#ffffe0', '#caefdf','#abdad9','#93c4d2', '#7daeca','#6997c2', '#5681b9','#426cb0', '#2b57a7','#00429d'];
	// continous color scale for overview
	var heatmapColorScale = d3.scaleQuantize()
							.domain([0, 1])
							.range(heatmapColors);

    trend_rows = JSON.parse(data.trend_rows)

    visArray = [];
    while(trend_rows.length) visArray.push(trend_rows.splice(0,3));    

    var row = subgroupDistancePlot.selectAll('g')
        .data(visArray)
        .enter()
        .append('g')
        .attr('transform', function(d, i) {
            return 'translate(0, ' + 33 * i + ')';
            //return 'translate(' + margin.left + ',' + 33 * i + ')';
        });

    row.selectAll('rect')
        .data(function(d) { return d; })
        .enter()
        .append('rect')
        .attr('x', function(d, i) { return 33 * i; })
        .attr('width', rw)
        .attr('height', rh)
	    .style("stroke-width", "1px")
	    .style("stroke", "black")                
        .style("fill", function(d, i) {
			return heatmapColorScale(d.distance);
		});

    // Add 'avg() = ' lable
    var num_rows = visArray.length;

    // left label 'avg('
    subgroupDistancePlot.append("text")
        .attr("x", -30)              			  
        .attr("y", 33 * num_rows / 2 + 3)
        .attr("text-anchor", "middle")  
        .style("font-size", "26px") 
        .text("avg (");	

    // right label ') = '
    subgroupDistancePlot.append("text")
        .attr("x", 120)              			  
        .attr("y", 33 * num_rows / 2 + 3)
        .attr("text-anchor", "middle")  
        .style("font-size", "26px") 
        .text(") =");	   
        
    // result
    var datum = JSON.parse(datum);
    subgroupDistancePlot.append('rect')
        .attr('x', 140)
        .attr('y', 33 * num_rows / 2 - 18)
        .attr('width', rw)
        .attr('height', rh)
	    .style("stroke-width", "1px")
	    .style("stroke", "black")
        .style("fill", function(d, i) {
			return heatmapColorScale(datum.value);
		});

    subgroupDistancePlot.append("text")
        .attr("x", 175)              			  
        .attr("y", 33 * num_rows / 2 + 3)
        .attr("text-anchor", "start")  
        .style("font-size", "26px") 
        .text(Math.round(datum.value*100)/100);	     
}