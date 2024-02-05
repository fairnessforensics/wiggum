const adjustWidth = (props) => {
	const {
        firstLevelWidth, 
		addWidth,
        level
	} = props;

    if (level == 'level1') {
        //d3.selectAll('.level1')
        //    .transition()
        //    .attr("transform", function() { 
        //        return "translate(" + addWidth + "," + 0 + ")"; });	
        
        // Adjust level 1 nodes x postion
        d3.selectAll('.node.level-1')
            .transition()
            .attr("transform", function(d,i) { 
                var postion_x = d.y + addWidth;
                return "translate(" + postion_x + "," + d.x + ")"; });	
    }

    if (level == 'level1' || level == 'level2') {    
        // Adjust level 2 nodes x postion
        d3.selectAll('.node.level-2')
            .transition()
            .attr("transform", function(d,i) { 
                var postion_x = d.y + firstLevelWidth + addWidth;
                return "translate(" + postion_x + "," + d.x + ")"; });	

        // Adjust level 3 nodes x postion
        d3.selectAll('.node.level-3')
            .transition()
            .attr("transform", function(d,i) { 
                var postion_x = d.y + firstLevelWidth + addWidth;
                return "translate(" + postion_x + "," + d.x + ")"; });


    }

    // Move level 1 paths
    d3.selectAll('.path.level1')
    .each(function (d) {
        d3.select(this)
            .attr("transform",  "translate(" + (firstLevelWidth + addWidth) + ", 0)")
    });	

    // Move level 2 paths
    d3.selectAll('.path.level2')
        .each(function (d) {
            d3.select(this)
                .attr("transform",  
                "translate(" + (firstLevelWidth + addWidth) + ", 0)")
    });	
}