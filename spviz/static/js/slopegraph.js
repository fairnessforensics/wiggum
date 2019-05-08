function DrawSlopeGraph(options) {

    var data = options.data;
    var keyStart = options.keyStart;
    var keyEnd = options.keyEnd;
    var keyName = options.keyName;
    var protectedAttr = options.protectedAttr;

    //Title
    d3.select('#slopeLabel').select("text").remove();

    d3.select('#slopeLabel').append("text")
        .attr("x", 20)             
        .attr("y", 90)
        .style("font-size", "16px") 
        .text("Positive " + targetAttr + " Rate by " + protectedAttr +  " and " + keyName)
        .attr("text-anchor", "middle")          
        .attr("transform", "translate(200, 0)");   

    // when it's the binary and  set it to "<stat> <variable> by <groupby> and <explanatory>" 
    // in the case where it's liek the gender pay gap example

    var slopegraph = d3.my.slopegraph()
        //.margin({top: 20, bottom: 20, left: 100, right:100})
        .strokeColour('#130C0E')
        .keyName(keyName)
            .keyValueStart(keyStart)
            .keyValueEnd(keyEnd)
            .keyProtectedAttr(protectedAttr)
            .h(360);

	d3.select('#slopegraph')
	.datum(data)
	.call(slopegraph);

}

function highlightLine(i) {
    d3.selectAll('.elm').transition().style('opacity', 0.2);
    d3.selectAll('.sel-' + i).transition().style('opacity', 1);
    
    // All always showing
    d3.selectAll('.sel-' + '0').transition().style('opacity', 1);
    d3.selectAll('.s-line.sel-' + '0').style('stroke', '#130C0E');
}