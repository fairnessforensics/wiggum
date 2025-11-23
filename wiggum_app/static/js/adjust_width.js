const adjustTotalWidth = (props) => {
	const {
        firstLevelWidth, 
        addWidth,
        thirdLevelParentVLWidth,
        resetFlag
	} = props;

    adjustWidth({
        firstLevelWidth: firstLevelWidth, 
        addWidth: addWidth, 
        thirdLevelParentVLWidth: thirdLevelParentVLWidth,
        level: 'level1'}); 

    adjustWidth({
        firstLevelWidth: firstLevelWidth, 
        addWidth: addWidth, 
        thirdLevelParentVLWidth: thirdLevelParentVLWidth,
        level: 'level2'}); 

    // Reset the x position for tree node in level 1
    if (resetFlag == true) {
        d3.selectAll('.level1.list.cell')
            .transition()
            .attr("transform", function(d,i) { 
                return "translate(" + (-globalFirstLevelParentVLWidth) + "," + 0 + ")"; });	
    }
}

const adjustWidth = (props) => {
	const {
        firstLevelWidth, 
        secondLevelWidth,
		addWidth,
        thirdLevelParentVLWidth,
        resetFlag,
        layerType,
        level
	} = props;

    if (level === 'level1' && ['parent', 'view'].includes(layerType)) {
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
    }

    if (level == 'level1' || level == 'level2') {   
        // Adjust level 3 nodes x postion
        d3.selectAll('.node.level-3')
            .transition()
            .attr("transform", function(d,i) { 
                var postion_x = d.y + firstLevelWidth + secondLevelWidth + addWidth + thirdLevelParentVLWidth;
                return "translate(" + postion_x + "," + d.x + ")"; });
    }

    if (level == 'level1') {
        // Move level 1 paths
        d3.selectAll('.level1.path')
            .each(function (d) {
                d3.select(this)
                    .attr("transform",  "translate(" + (firstLevelWidth + addWidth) + ", 0)")
        });	
    }

    if (level == 'level1' || level == 'level2') {
        // Move level 2 paths
        d3.selectAll('.level2.path')
            .each(function (d) {
                d3.select(this)
                    .attr("transform",  
                    "translate(" + (firstLevelWidth + secondLevelWidth + addWidth) + ", 0)")
        });	
    }

   
    if (resetFlag == true) {
        // Reset the x position for tree node in level 1
       // d3.selectAll('.level1.list.cell, .level1.list.text')
         d3.selectAll('.' + level + '.list')
             .transition()
            .attr("transform", function(d,i) { 
                return "translate(" + (-addWidth) + "," + 0 + ")"; });	
    }
}