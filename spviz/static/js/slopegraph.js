function DrawSlopeGraph(options) {

    var data = options.data;
    var keyStart = options.keyStart;
    var keyEnd = options.keyEnd;
    var keyName = options.keyName;

    //Title
    d3.select('#slopeLabel').select("text").remove();
    d3.select('#slopeLabel').append("text")
        .attr("x", 250)             
        .attr("y", 90)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .text("Rate by Per Subgroup and Protected Class");	

    var slopegraph = d3.eesur.slopegraph()
        //.margin({top: 20, bottom: 20, left: 100, right:100})
        .strokeColour('#130C0E')
        .keyName(keyName)
            .keyValueStart(keyStart)
            .keyValueEnd(keyEnd)
            .h(300);

	d3.select('#slopegraph')
	.datum(data)
	.call(slopegraph);

}

function highlightLine(i) {
    d3.selectAll('.elm').transition().style('opacity', 0.2);
    d3.selectAll('.sel-' + i).transition().style('opacity', 1);
    d3.selectAll('.s-line').style('stroke', '#FDBB30');
    d3.selectAll('.s-line.sel-' + i).style('stroke', '#130C0E');

    // All always showing
    d3.selectAll('.sel-' + '0').transition().style('opacity', 1);
    d3.selectAll('.s-line.sel-' + '0').style('stroke', '#130C0E');
}