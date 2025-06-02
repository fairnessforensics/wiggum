const adjustTotalWidth = (props) => {
	const {
        firstLevelWidth, 
		firstLevelParentVLWidth,
        addTotalWidthVL,
        thirdLevelParentVLWidth,
        resetFlag
	} = props;

    adjustWidth({
        firstLevelWidth: firstLevelWidth, 
        addWidth: firstLevelParentVLWidth, 
        thirdLevelParentVLWidth: thirdLevelParentVLWidth,
        level: 'level1'}); 

    adjustWidth({
        firstLevelWidth: firstLevelWidth, 
        addWidth: addTotalWidthVL, 
        thirdLevelParentVLWidth: thirdLevelParentVLWidth,
        level: 'level2'}); 

    // Reset the x position for tree node in level 1
    if (resetFlag == true) {
        d3.selectAll('.' + level + '.list.cell')
            .transition()
            .attr("transform", function(d,i) { 
                return "translate(" + (-firstLevelParentVLWidth) + "," + 0 + ")"; });	
    }
}

const adjustWidth = (props) => {
	const {
        firstLevelWidth, 
		addWidth,
        thirdLevelParentVLWidth,
        level
	} = props;

    if (level == 'level1') {
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
                var postion_x = d.y + firstLevelWidth + addWidth + thirdLevelParentVLWidth;
                return "translate(" + postion_x + "," + d.x + ")"; });
    }

    // Move level 1 paths
    d3.selectAll('.level1.path')
    .each(function (d) {
        d3.select(this)
            .attr("transform",  "translate(" + (firstLevelWidth + addWidth) + ", 0)")
    });	

    // Move level 2 paths
    d3.selectAll('.level2.path')
        .each(function (d) {
            d3.select(this)
                .attr("transform",  
                "translate(" + (firstLevelWidth + addWidth) + ", 0)")
    });	
}