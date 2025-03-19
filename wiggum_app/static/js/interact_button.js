// Global variable
var level3_state;

const interactiveLevelButton = (selection, props) => {
	const {
		levelLabels,
		leftIdentityLabels,
		rightIdentityLabels,
		levelG,
		level,
		charts,
		width,
		height,
		addWidthArray,
		addHeightArray,
		treeHeight,
		matrix_data,
		trendType
	} = props;

	var selectedChart;
	var newViewHeight;

	var levelButtonGroups= selection.selectAll("g." + level + ".button")
						.data(levelLabels)
						.enter()
						.append("g")
						.attr("class", level + " button")
						.style("cursor","pointer")
						.on("click",function(d, i) {

							updateButtonColors(d3.select(this), d3.select(this.parentNode));

							selectedChart = charts[i];

							// Visual Techniques
							for (var k = 0; k < charts.length; k++){
								d3.selectAll('.'+level+'.' + charts[k])
									.transition()
									.style('visibility', i == k ? 'visible' : 'hidden');
							}

							// Hide all virtual layer
							for (var k = 0; k < charts.length; k++){
								d3.selectAll('.'+level+'.' + charts[k]+'.virtuallayer')
									.transition()
									.style('visibility', 'hidden');
							}

							// reset VL width 
							firstLevelParentVLWidth = 0;
							firstLevelChildrenVLWidth = 0;

							// Reset left rect
							d3.selectAll('.'+ level +'.list.cell')
								.attr("y", -10)
								.attr("height", 20);

							// Reset right rect
							d3.selectAll('.'+ level +'.initialvirtuallayer.children.rect')
								.attr("y", -10)
								.attr("height", 20);

							d3.selectAll('.'+level + '.children.text')
								.attr("y", 0);	

							// Level 1 keep both view and identity
							if (level == "level1") {
								// set default position for list text
								// TODO list text alignment
								if (i == 3 || i == 4) {
									d3.selectAll('.'+level + '.list.text')
										.transition()
										.attr("x", "-10px")			
										.style("text-anchor", "start");					
								} else {
									d3.selectAll('.'+level + '.list.text')
										.transition()
										.attr("x", 0)	
										.style("text-anchor", "middle");
								}										

								if ([2, 3, 4, 5, 6, 7, 8].includes(i)) {
									d3.selectAll('.'+level+'.list')
										.transition()
										.style('visibility', 'visible');

									d3.selectAll('.'+level + '.list.text')
										.transition()
										.style('visibility', 'hidden');

									if (i == 2) {
										d3.selectAll('.'+level + '.heatmap')
										.transition()
										.style('visibility', 'visible');											
									} 
										
									var addWidth = 0;

									if (i == 2) {
										addWidth = addWidthArray[0];
									} else if (selectedChart == 'coloredbarchart' ) {
										addWidth = addWidthArray[1] + 70;
									} else if (selectedChart == 'scatterplot') {
										// Scatterplot
										addWidth = addWidthArray[1] + 110;
									} else if (selectedChart == 'genericheatmap' ) {
										addWidth = addWidthArray[1] + 70;
									} else if (selectedChart == 'smscatterplot_industry' ) {
										addWidth = addWidthArray[1] + 260;
								 	} else if (selectedChart == 'scatterplot_industry') {
										addWidth = addWidthArray[1] + 310;
									} else if (selectedChart == 'scatterplot_industry_bounded') {
											addWidth = addWidthArray[1] + 280;
									} else if (i == 5 || i == 6) {
										addWidth = addWidthArray[1];
									}

									var newWidth = width + addWidth + secondLevelWidth + thirdLevelParentVLWidth;
									
									// Change the global variable firstLevelWidth
									firstLevelWidth = addWidth;

									// Change SVG size
									d3.select('#node_link_tree svg')
										.attr('width', newWidth)
										.attr('height', treeHeight);	

									// Adjust level 1 nodes x postion
									//d3.selectAll('.level1.list')
									//	.transition()
									//	.attr("transform", function() { 
									//		return "translate(" + firstLevelWidth + "," + 0 + ")"; });		

									// Adjust level 1 nodes x postion
									d3.selectAll('.node.level-1')
										.transition()
										.attr("transform", function(d,i) { 
											return "translate(" + d.y + "," + d.x + ")"; });	

									// Adjust level 1 nodes x postion
									d3.selectAll('.level1.list')
										.transition()
										.attr("transform", "translate(0, 0)");

									var addHeight = 0;
									if (selectedChart == 'coloredbarchart') {
										addHeight = addHeightArray[0];
									} else if (selectedChart == 'scatterplot') {
										addHeight = addHeightArray[1];
									} else if (selectedChart == 'genericheatmap') {
										addHeight = addHeightArray[0];
									} else if (selectedChart == 'smscatterplot_industry') {
										addHeight = addHeightArray[2];
									} else if (selectedChart == 'scatterplot_industry_bounded') {
										addHeight = addHeightArray[1];
									}

									newViewHeight = height + addHeight;

									// Adjust level 1 children rect x postion
									// TODO may simplify
									d3.selectAll('.level1.initialvirtuallayer.children.rect')
										//.transition()
										.attr('transform', `translate(${-50},${newViewHeight/2})`);

									if (selectedChart == 'smscatterplot_industry' ) {
										d3.selectAll('.'+level + '.children.text')
											.attr("y", addHeight/2 + 20);	
									}

									// Adjust level 2 nodes x postion
									d3.selectAll('.node.level-2')
										.transition()
										.attr("transform", function(d,i) { 
											var postion_x = d.y + firstLevelWidth;
											return "translate(" + postion_x + "," + d.x + ")"; });	
									
									// Adjust level 3 nodes x postion
									d3.selectAll('.node.level-3')
										.transition()
										.attr("transform", function(d,i) { 
											var postion_x = d.y + firstLevelWidth 
														+ secondLevelWidth + thirdLevelParentVLWidth;
											return "translate(" + postion_x + "," + d.x + ")"; });	

									// Adjust level 2 button x postion
									d3.selectAll('.button.level2')
										.each(function () {
											d3.select(this)
												.attr("transform",  "translate(" + firstLevelWidth + ", 0)")
										});	
									
									// Adjust level 3 button x postion
									d3.selectAll('.button.level3')
										.each(function () {
											d3.select(this)
												.attr("transform",  
												"translate(" + (firstLevelWidth 
														+ secondLevelWidth) + ", 0)")
										});	

									// Move level 1 paths
									d3.selectAll('.path.level1')
										.each(function (d) {
											d3.select(this)
												.attr("transform",  "translate(" + firstLevelWidth + ", 0)")
										});	

									// Move level 2 paths
									d3.selectAll('.path.level2')
										.each(function (d) {
											d3.select(this)
												.attr("transform",  
												"translate(" + (firstLevelWidth + secondLevelWidth) + ", 0)")
									});											
								} else {
									// Reset first level width
									firstLevelWidth = 0;

									// Change SVG size
									d3.select('#node_link_tree svg')
									.attr('width', width + secondLevelWidth)
									.attr('height', treeHeight);

									// Adjust level 1 nodes x postion
									d3.selectAll('.level1.list')
										.transition()
										.attr("transform", "translate(0, 0)");

									// Adjust level 2 nodes x postion
									d3.selectAll('.node.level-2')
										.transition()
										.attr("transform", function(d) { 
											return "translate(" + d.y + "," + d.x + ")"; });											

									// Adjust level 3 nodes x postion
									d3.selectAll('.node.level-3')
										.transition()
										.attr("transform", function(d) { 
											return "translate(" + (d.y + secondLevelWidth 
												+ thirdLevelParentVLWidth) + "," + d.x + ")"; });											

									// Adjust level 2 button x postion
									d3.selectAll('.button.level2')
										.each(function () {
											d3.select(this)
												.attr("transform",  "translate(0, 0)")
										});	
									
									// Adjust level 3 button x postion
									d3.selectAll('.button.level3')
										.each(function () {
											d3.select(this)
												.attr("transform",  "translate(" + secondLevelWidth + ", 0)")
										});	

									// Move level 1 paths
									d3.selectAll('.path.level1')
										.each(function () {
											d3.select(this)
											.attr("transform",  "translate(0, 0)")
										});

									// Move level 2 paths
									d3.selectAll('.path.level2')
										.each(function () {
											d3.select(this)
											.attr("transform",  "translate(" + secondLevelWidth + ", 0)")
										});										
								}
							}

							// TODO redesign for different interactions for visual alternative
							// and visual detail view  
							if (level == "level3") {
								level3_state = selectedChart;
								
								thirdLevelParentVLWidth = 0;

								d3.selectAll('.'+level + '.rect')
									.transition()
									.style('visibility', 'visible');	
								d3.selectAll('.'+level + '.singlecountrymap')
										.transition()
										.style('visibility', 'hidden');	
								
								d3.selectAll('.node.level-3')
									.transition()
									.attr("transform", function(d,i) { 
										var postion_x = d.y + firstLevelWidth 
										+ secondLevelWidth + thirdLevelParentVLWidth;

										return "translate(" + postion_x + "," + d.x + ")"; });		

								d3.selectAll('.' + level + '.list.rect, ' + '.' + level + '.list.text')
									.attr("transform", function(d,i) { 
									return "translate(" + 0 + "," + 0 + ")"; });									

								// Remove all interactive charts from leaf nodes
								d3.selectAll('.level-3.interact').remove();
								d3.selectAll(".level3.list.rect")
									.style("stroke-opacity", 0.3);

								/*if (selectedChart == 'countrymap') {	
									// TODO hardcode
									d3.selectAll('.'+level + '.rect' + '.splitby_importer'
										+',.'+level + '.rect' + '.splitby_exporter')
										.transition()
										.style('visibility', 'hidden');	
									d3.selectAll('.'+level + '.singlecountrymap')
										.transition()
										.style('visibility', 'hidden');	
								}*/

								if (selectedChart == 'countrymap' 
										|| selectedChart == 'barchart'
										|| selectedChart == 'genericheatmap' 
										|| selectedChart == 'smscatterplot_year'
										|| selectedChart == 'smscatterplot_industry'
										|| selectedChart == 'smscatterplot_industry_all'
										|| selectedChart == 'smscatterplot_industry_all_bounded') {
									d3.selectAll('.'+level + '.text')
										.transition()
										.style('visibility', 'visible');	
								}
							}

							// Path
							if (level == "level1") {
								// Hide all path for level 0 and level 1
								d3.selectAll('.path.level0')
										.transition()
										.style('visibility', 'hidden');
								d3.selectAll('.path.level1')
										.transition()
										.style('visibility', 'hidden');

								// Level 0 path
								d3.selectAll('.path.list.level0')
									.transition()
									.style('visibility', [0, 3, 4, 5, 6, 7, 8].includes(i) ? 'visible' : 'hidden');								
								d3.selectAll('.path.heatmap.level0')
									.transition()
									.style('visibility', (i == 1 || i == 2) ? 'visible' : 'hidden');	
								// Level 1 path
								// Check Level 2's visual technique
								if ((d3.select('.level2.scatterplot1d').style("visibility") == 'hidden')
									&& (d3.select('.level2.scatterplot2d').style("visibility") == 'hidden')) {
									// Level 1: list/heatmap; 
									/* Fix Later TODO trend type condition
									if (d3.select('.level2.barchart').style("visibility") == 'hidden') {*/
									// Level 2: list
									d3.selectAll('.path.list.node.level1')
										.transition()
										.style('visibility', [0, 3, 4, 5, 6, 7, 8].includes(i) ? 'visible' : 'hidden');
									d3.selectAll('.path.heatmap.node.level1')
										.transition()
										.style('visibility', (i == 1 || i == 2) ? 'visible' : 'hidden');	
									/*
									} else {
										// Level 2: barchart
										d3.selectAll('.path.list.barchart.level1')
											.transition()
											.style('visibility', (i == 0 || i == 3 || i == 4) ? 'visible' : 'hidden');
										d3.selectAll('.path.heatmap.barchart.level1')
											.transition()
											.style('visibility', (i == 1 || i == 2) ? 'visible' : 'hidden');	
									}*/

								} else {
									// Level 1: list/heatmap; level 2: scatterplot1d/scatterplot2d
									d3.selectAll('.path.list.scatterplot1d.level1')
										.transition()
										.style('visibility', (i == 0 || i == 3 || i == 4 || i == 5) ? 'visible' : 'hidden');
									d3.selectAll('.path.heatmap.scatterplot1d.level1')
										.transition()
										.style('visibility', (i == 1 || i == 2) ? 'visible' : 'hidden');	
								}

								if (i == 2) {
									// View and identity
									d3.selectAll('.path.list.level0')
										.transition()
										.style('visibility', 'hidden');									
									d3.selectAll('.path.heatmap.level0')
										.transition()
										.style('visibility', 'hidden');		
										
									if ((d3.select('.level2.scatterplot1d').style("visibility") == 'hidden')
										&& (d3.select('.level2.scatterplot2d').style("visibility") == 'hidden')) {
										// Level 1: list/heatmap; 
										// Level 2: list
										d3.selectAll('.path.list.node.level1')
											.transition()
											.style('visibility', 'visible');
										d3.selectAll('.path.heatmap.node.level1')
											.transition()
											.style('visibility', 'hidden');	
										
										// Todo fix later for level2 charts
										/*if (d3.select('.level2.barchart').style("visibility") == 'hidden') {
											// Level 2: list
											d3.selectAll('.path.list.node.level1')
												.transition()
												.style('visibility', 'visible');
											d3.selectAll('.path.heatmap.node.level1')
												.transition()
												.style('visibility', 'hidden');	
										} else {
											// Level 2: barchart
											d3.selectAll('.path.list.barchart.level1')
												.transition()
												.style('visibility', 'visible');
											d3.selectAll('.path.heatmap.barchart.level1')
												.transition()
												.style('visibility', 'hidden');	
										}*/

									} else {
										// Level 1: list/heatmap; level 2: scatterplot1d/scatterplot2d
										d3.selectAll('.path.list.scatterplot1d.level1')
											.transition()
											.style('visibility', 'visible');	
										d3.selectAll('.path.heatmap.scatterplot1d.level1')
											.transition()
											.style('visibility', 'hidden');	
									}	
								}

							} else if (level == "level2") {
								if (i == 2 || i ==3) {
									// Scatterplot2d
									secondLevelWidth = 
										Math.max.apply(Math, addWidthArray.map(function(o) { 
											return o.value; }))

									var newWidth = width + secondLevelWidth + firstLevelWidth;

									// TODO not sure how tree layout will be affected
									//treeLayout.size(newWidth, height);
									
									// Change SVG size
									d3.select('#node_link_tree svg')
										.attr('width', newWidth)
										.attr('height', treeHeight);

									// Adjust level 3 nodes x postion
									d3.selectAll('.node.level-3')
										.transition()
										.attr("transform", function(d,i) { 
											var parentKey = d.parent.parent.data.key;
											addWidth = addWidthArray.find( ({ key }) => key === parentKey );

											var postion_x = d.y + addWidth.value + firstLevelWidth;
											return "translate(" + postion_x + "," + d.x + ")"; });											

									// Adjust level 3 button x postion
									d3.selectAll('.button.level3')
										.each(function () {
											d3.select(this)
												.attr("transform",  "translate(" + (addWidth.value + firstLevelWidth) + ", 0)")
										});												

									// Move level 2 paths
									d3.selectAll('.path.level2')
										.each(function (d) {
											var parentKey = d.source.parent.data.key;
											addWidth = addWidthArray.find( ({ key }) => key === parentKey );

											d3.select(this)
												.attr("transform",  "translate(" + (addWidth.value + firstLevelWidth) + ", 0)")
										});
								} else {
									// list and scatterplot1d 
									// reset second level width
									secondLevelWidth = 0;

									// Check Level 2's visual technique
									if (d3.select('.level2.scatterplot2d').style("visibility") == 'visible'
										|| d3.select('.level2.barchart').style("visibility") == 'visible') {
										// reset position for level3 nodes and level2 path
										
										// TODO not sure how tree layout will be affected
										//treeLayout.size(newWidth, height);
										
										// Change SVG size
										d3.select('#node_link_tree svg')
											.attr('width', width + firstLevelWidth)
											.attr('height', treeHeight);
	
										// Adjust level 3 nodes x postion
										d3.selectAll('.node.level-3')
											.transition()
											.attr("transform", function(d) { 
												return "translate(" + (d.y + firstLevelWidth) + "," + d.x + ")"; });											
									
										// Adjust level 3 button x postion
										d3.selectAll('.button.level3')
											.each(function () {
												d3.select(this)
													.attr("transform",  "translate(" + firstLevelWidth + ", 0)")
											});	

										// Move level 2 paths
										d3.selectAll('.path.level2')
											.each(function () {
												d3.select(this)
												.attr("transform",  "translate(" + firstLevelWidth + ", 0)")
											});									
									}
								}

								// Hide all path for level 1 and level 2
								d3.selectAll('.path.level1')
										.transition()
										.style('visibility', 'hidden');
								d3.selectAll('.path.level2')
										.transition()
										.style('visibility', 'hidden');

								// Level 1 path
								// Check Level 1's visual technique
								if (d3.select('.level1.heatmap').style("visibility") == 'hidden') {
									// Level 1: list; 
									// level 2: list/scatterplot1d/scatterplot2d/barchart
									d3.selectAll('.path.list.node.level1')
										.transition()
										.style('visibility', i == 0 ? 'visible' : 'hidden');
									d3.selectAll('.path.list.scatterplot1d.level1')
										.transition()
										.style('visibility', (i == 1 || i == 2) ? 'visible' : 'hidden');
									d3.selectAll('.path.list.barchart.level1')
											.transition()
											.style('visibility', i == 3 ? 'visible' : 'hidden');												
								} else {
									// Level 1: heatmap; 
									// level 2: list/scatterplot1d/scatterplot2d/barchart
									d3.selectAll('.path.heatmap.node.level1')
										.transition()
										.style('visibility', i == 0 ? 'visible' : 'hidden');	
									d3.selectAll('.path.heatmap.scatterplot1d.level1')
										.transition()
										.style('visibility', (i == 1 || i == 2) ? 'visible' : 'hidden');
									d3.selectAll('.path.heatmap.barchart.level1')
										.transition()
										.style('visibility', i == 3 ? 'visible' : 'hidden');

									if (d3.select('.level1.list').style("visibility") == 'visible') {
										d3.selectAll('.path.heatmap.scatterplot1d.level1')
											.transition()
											.style('visibility', 'hidden');	

										d3.selectAll('.path.heatmap.node.level1')
											.transition()         
											.style('visibility', 'hidden');												

										d3.selectAll('.path.list.node.level1')
											.transition()
											.style('visibility', i==0 ? 'visible' : 'hidden');											
										
										d3.selectAll('.path.list.scatterplot1d.level1')
											.transition()
											.style('visibility', (i == 1 || i == 2) ? 'visible' : 'hidden');										
										
										d3.selectAll('.path.list.barchart.level1')
											.transition()
											.style('visibility', i == 3 ? 'visible' : 'hidden');
											
										d3.selectAll('.path.heatmap.barchart.level1')
											.transition()
											.style('visibility', 'hidden');
									}		
								}
								// Level 2 path
								d3.selectAll('.path.list.node.level2')
									.transition()
									.style('visibility', i == 0 ? 'visible' : 'hidden');									
								d3.selectAll('.path.scatterplot1d.level2')
									.transition()
									.style('visibility', (i == 1 || i == 2 )? 'visible' : 'hidden');	
								d3.selectAll('.path.barchart.level2')
									.transition()
									.style('visibility', i == 3 ? 'visible' : 'hidden');
							}
						});

	var bWidth= 35; //button width
	var bHeight= 22; //button height
	var bSpace= 5; //space between buttons
	var x0= 0; //x offset
	var y0= 0; //y offset

	//adding a rect to each toggle button group
	//rx and ry give the rect rounded corner
	levelButtonGroups.append("rect")
				.attr("class","buttonRect")
				.attr("transform", "translate(" + 0 + "," + 3 + ")")
				.attr("width",bWidth)
				.attr("height",bHeight)
				//.attr("x",function(d,i) {return x0+(bWidth+bSpace)*i;})
				//.attr("y",y0)				
				.attr("x",function(d,i) {var col = i%3; return x0+(bWidth+bSpace)*col;})
				.attr("y",function(d,i) {var row = Math.floor(i/3); return y0 + (bHeight+bSpace)*row })
				.attr("rx",5) //rx and ry give the buttons rounded corners
				.attr("ry",5)
				.attr("fill","#797979")

    //adding text to each toggle button group, centered 
    //within the toggle button rect
    levelButtonGroups.append("text")
                .attr("class","buttonText")
                .attr("font-family","FontAwesome")
				.attr("transform", "translate(" + 0 + "," + 3 + ")")
                .attr("x",function(d,i) {
					//return x0 + (bWidth+bSpace)*i + bWidth/2;
					var index = i%3;
                    return x0 + (bWidth+bSpace)*index + bWidth/2;
                })
				//.attr("y",y0+bHeight/2)
                .attr("y",function(d,i) {
					var row = Math.floor(i/3);
					return y0+bHeight/2 + (bHeight+bSpace)*row;
				})
                .attr("text-anchor","middle")
                .attr("dominant-baseline","central")
                .attr("fill","white")
                .text(function(d) {return d;})

	// Left Identity Button
	bWidth= 22; 

	var leftIdentityButtonGroups = 
		selection.selectAll("g." + level + ".left.identity.button")
				.data(leftIdentityLabels)
				.enter()
				.append("g")
				.attr("class", level + " left identity button")
				.style("cursor","pointer")
				.on("click",function(d, i) {

					updateButtonColors(d3.select(this), d3.select(this.parentNode));

					// Reset
					firstLevelParentVLWidth = 0;

					d3.selectAll('.'+ level +'.list.cell')
						.transition().style('visibility', "visible");

					// Reset left rect
					d3.selectAll('.'+ level +'.list.cell')
						.attr("y", -10)
						.attr("height", 20);

					// Remove existing virtual layer
					d3.selectAll('.parent.virtuallayer').remove();

					// Adjust first level width
					adjustWidth({
						firstLevelWidth: firstLevelWidth, 
						addWidth: 0, 
						level: 'level1'});
					
					// Reset third level
					thirdLevelParentVLWidth = 0;
					d3.selectAll('.'+ level +'.list.rect')
						.transition().style('visibility', "visible");

					d3.selectAll('.'+level + '.singlecountrymap')
						.transition()
						.style('visibility', 'hidden');	

					d3.selectAll('.' + level + '.list.rect, ' + '.' + level + '.list.text')
						.attr("transform", function(d,i) { 
						return "translate(" + 0 + "," + 0 + ")"; });

					if (i == 0) {
						var addWidth4Lable = 0;

						if (trendType == "pearson_corr") {
							if (d3.select('.level1.heatmapdensity').style("visibility") == 'visible') {
								addWidth4Lable = 30;
								firstLevelParentVLWidth = addWidth4Lable;

								var addTotalWidthVL = firstLevelParentVLWidth + firstLevelChildrenVLWidth;

								// Adjust Total Space
								adjustTotalWidth({
									firstLevelWidth: firstLevelWidth, 
									firstLevelParentVLWidth: firstLevelParentVLWidth,
									addTotalWidthVL: addTotalWidthVL,
									resetFlag: true
								})

								//adjustWidth({
								//	firstLevelWidth: firstLevelWidth, 
								//	addWidth: firstLevelParentVLWidth + firstLevelChildrenVLWidth, 
								//	level: 'level1'});
							}
						} else if (trendType == 'rank_trend') {
							adjustWidth({
								firstLevelWidth: firstLevelWidth, 
								addWidth: firstLevelChildrenVLWidth, 
								level: 'level2'});

							if (level == "level1") {
								if (d3.select('.level1.genericheatmap').style("visibility") == 'visible') {
									d3.selectAll('.'+level + '.genericheatmap.children.text')
										.transition()
										.style('visibility', 'visible');
								}
							}

							if (level == "level3") {

								if (d3.select('.level3.countrymap').style("visibility") == 'visible') {

									d3.selectAll('.'+level + '.rect')
										.transition()
										.style('visibility', 'visible');	

									d3.selectAll('.'+level + '.singlecountrymap')
										.transition()
										.style('visibility', 'hidden');	
								}
							}
						}

						d3.selectAll('.'+ level +'.list.cell')
							.transition()
							.attr('transform', `translate(${0 - addWidth4Lable},${0})`);
							//.attr("x", 30);
					}

					if (i == 1) {
						if (trendType == 'pearson_corr') {
							if (d3.select('.level1.doublehistogram').style("visibility") == 'visible'
							|| d3.select('.level1.scatterplot').style("visibility") == 'visible') {

								adjustWidth({
									firstLevelWidth: firstLevelWidth, 
									addWidth: firstLevelChildrenVLWidth, 
									level: 'level2'});

								d3.selectAll('.'+ level +'.list.cell')
									.transition()
									.attr("y", 0)
									.attr("height", height)
									.attr('transform', `translate(${0},${-height/2})`);

							} else if (d3.select('.level1.heatmapdensity').style("visibility") == 'visible') {

								addWidth4Lable = 30;
								firstLevelParentVLWidth = addWidth4Lable;
								
								var addTotalWidthVL = firstLevelParentVLWidth + firstLevelChildrenVLWidth;

								// Adjust Total Space
								adjustTotalWidth({
									firstLevelWidth: firstLevelWidth, 
									firstLevelParentVLWidth: firstLevelParentVLWidth,
									addTotalWidthVL: addTotalWidthVL,
									resetFlag: true
								})

								d3.selectAll('.'+ level +'.list.cell')
									.transition()
									.attr("y", 0)
									.attr("height", height)
									.attr('transform', `translate(${-addWidth4Lable},${-height/2})`);
							}

							if (d3.select('.level1.histogram').style("visibility") == 'visible') {
								firstLevelParentVLWidth = 60;
								var addTotalWidthVL = firstLevelParentVLWidth + firstLevelChildrenVLWidth;
								// Adjust Total Space
								adjustTotalWidth({
									firstLevelWidth: firstLevelWidth, 
									firstLevelParentVLWidth: firstLevelParentVLWidth,
									addTotalWidthVL: addTotalWidthVL,
									resetFlag: true
								})

								// Call Virtual Layer
								levelG.call(small_multiples_virtual_layer, {
									width: firstLevelWidth,
									height: 30,
									offset_x: -10,
									offset_y: 35,
									virtualLayerWidth: firstLevelParentVLWidth,
									rectWidth: 20,
									rectHeight: 20,
									matrix_data: matrix_data,
									side: 'parent',
									level: 'level1'
								});	

							}
						} else if (trendType == 'rank_trend') {


							if (level == "level3") {
								if (d3.select('.level3.countrymap').style("visibility") == 'visible') {
									// TODO hardcode issue for exporter and importer
									d3.selectAll('.'+level + '.rect' + '.splitby_importer'
										+',.'+level + '.rect' + '.splitby_exporter')
										.transition()
										.style('visibility', 'hidden');	

									d3.selectAll('.'+level + '.singlecountrymap')
										.transition()
										.style('visibility', 'visible');	
								}
							}
						}
					}

					if (i == 2) {

						if (trendType == 'pearson_corr') {
							if (d3.select('.level1.doublehistogram').style("visibility") == 'visible'
									|| d3.select('.level1.histogram').style("visibility") == 'visible') {
								firstLevelParentVLWidth = 40;
							} 

							if (d3.select('.level1.heatmapdensity').style("visibility") == 'visible') {
								addWidth4Lable = 30;
								firstLevelParentVLWidth = addWidth4Lable;
							} 
						} 



						if (trendType == 'pearson_corr') {
							if (d3.select('.level1.doublehistogram').style("visibility") == 'visible') {
								// Call Virtual Layer
								levelG.call(doubleHistogram_virtual_layer, {
									width: firstLevelWidth,
									height: height,
									parentVLWidth: firstLevelParentVLWidth,
									axis_x_position: 15,
									side: 'parent',
									aux_flag: false,
									level: 'level1'
								});	
							}

							if (d3.select('.level1.histogram').style("visibility") == 'visible') {
								// Call Virtual Layer
								levelG.call(histogram_virtual_layer, {
									width: firstLevelWidth,
									height: 30,
									source_offset_y: 0,
									offset_y: -35,
									virtualLayerWidth: firstLevelParentVLWidth,
									axis_x_position: 15,
									side: 'parent',
									multi_no: 'h1',
									aux_flag: false,
									level: 'level1'
								});	
	
								levelG.call(histogram_virtual_layer, {
									width: firstLevelWidth,
									height: 30,
									source_offset_y: 0,
									offset_y: 35,
									virtualLayerWidth: firstLevelParentVLWidth,
									axis_x_position: 15,
									side: 'parent',
									multi_no: 'h2',
									aux_flag: false,
									level: 'level1'
								});	

								if (d3.select('.level1.scatterplot').style("visibility") == 'visible') {
									// Call Virtual Layer
									levelG.call(scatterplot_virtual_layer, {
										width: firstLevelWidth,
										height: height,
										parentVLWidth: firstLevelParentVLWidth,
										axis_x_position: 15,
										side: 'parent',
										level: 'level1'
									});	
								}
							}

							if (d3.select('.level1.heatmapdensity').style("visibility") == 'visible') {
								// Hide node
								d3.selectAll('.'+ level +'.list.cell')
									.transition().style('visibility', "hidden");
	
								levelG.call(heatmapDensity_virtual_layer, {
									x_position: 0,
									height: 100,
									chart_data: csvData,
									offset_flag: false,
									side: 'parent',
									parentVLWidth: firstLevelParentVLWidth,
									level: 'level1'
								});	
							}
						}
					}

					if (i == 3) {
						if (trendType == 'pearson_corr') {
							if (d3.select('.level1.heatmapdensity').style("visibility") == 'visible') {

								var addWidth4Lable = 30;
								firstLevelParentVLWidth = addWidth4Lable + 25;
								var addTotalWidthVL = firstLevelParentVLWidth + firstLevelChildrenVLWidth;
								// Adjust Total Space
								adjustTotalWidth({
									firstLevelWidth: firstLevelWidth, 
									firstLevelParentVLWidth: firstLevelParentVLWidth,
									addTotalWidthVL: addTotalWidthVL,
									resetFlag: false
								})

								d3.selectAll('.'+ level +'.list.cell')
									.transition()
									//.attr("x", -firstLevelParentVLWidth - 10)
									.attr("y", 0)
									.attr("height", height)
									.attr('transform', `translate(${-firstLevelParentVLWidth},${-height/2})`);

								levelG.call(heatmapDensity_virtual_layer, {
										x_position: 0,
										height: 100,
										chart_data: csvData,
										offset_flag: false,
										side: 'parent',
										parentVLWidth: addWidth4Lable,
										level: 'level1'
									});	
							}

							if (d3.select('.level1.histogram').style("visibility") == 'visible') {
								firstLevelParentVLWidth = 60;
								var addTotalWidthVL = firstLevelParentVLWidth + firstLevelChildrenVLWidth;
								// Adjust Total Space
								adjustTotalWidth({
									firstLevelWidth: firstLevelWidth, 
									firstLevelParentVLWidth: firstLevelParentVLWidth,
									addTotalWidthVL: addTotalWidthVL,
									resetFlag: true
								})

								// Call Virtual Layer
								levelG.call(small_multiples_virtual_layer, {
									width: firstLevelWidth,
									height: 30,
									offset_x: -10,
									offset_y: 35,
									virtualLayerWidth: firstLevelParentVLWidth,
									rectWidth: 20,
									rectHeight: 20,
									matrix_data: matrix_data,
									side: 'parent',
									level: 'level1'
								});	

								firstLevelParentVLWidth = 100;
								addTotalWidthVL = firstLevelParentVLWidth + firstLevelChildrenVLWidth;

								// Adjust Total Space
								adjustTotalWidth({
									firstLevelWidth: firstLevelWidth, 
									firstLevelParentVLWidth: firstLevelParentVLWidth,
									addTotalWidthVL: addTotalWidthVL,
									resetFlag: true
								})

								// Reset the x position for first virtual layer
								d3.selectAll('.' + level + '.smallmultiple.g')
									.transition()
									.attr("transform", function(d,i) { 
										return "translate(" + (-40) + "," + 0 + ")"; });	

								// Call Histogram Virtual Layer
								levelG.call(histogram_virtual_layer, {
									width: firstLevelWidth,
									height: 30,
									source_offset_y: -35,
									offset_y: -35,
									virtualLayerWidth: 40,
									axis_x_position: 15,
									side: 'parent',
									multi_no: 'h1',
									aux_flag: false,
									level: 'level1'
								});	

								levelG.call(histogram_virtual_layer, {
									width: firstLevelWidth,
									height: 30,
									source_offset_y: 35,
									offset_y: 35,
									virtualLayerWidth: 40,
									axis_x_position: 15,
									side: 'parent',
									multi_no: 'h2',
									aux_flag: false,
									level: 'level1'
								});	
							}
						}
					}

					// Start to use selectedChart=================================>
					// Common VL option for all charts
					if (i == 0) {
						d3.selectAll('.'+ level +'.' + selectedChart + '.children.text')
							.transition()
							.attr("x", -firstLevelParentVLWidth)
					}

					if (i == 1) {
						d3.selectAll('.'+ level +'.' + selectedChart + '.children.text')
						.transition()
						.attr("x", -25);

						adjustWidth({
							firstLevelWidth: firstLevelWidth, 
							addWidth: firstLevelChildrenVLWidth, 
							level: 'level2'});

						d3.selectAll('.'+ level +'.list.cell')
							.transition()
							.attr("y", 0)
							.attr("height", newViewHeight)
							.attr('transform', `translate(${0},${-newViewHeight/2})`);
					}

					if (selectedChart == 'scatterplot') {

						if (i == 2 || i == 3 || i == 4 || i == 6) {
							firstLevelParentVLWidth = 40;
						} else if (i == 5) {
							firstLevelParentVLWidth = 60;
						}

						if (i == 2) {

							d3.selectAll('.'+ level +'.scatterplot.children.text')
								.transition()
								.attr("x", -firstLevelParentVLWidth)

							// Call Virtual Layer
							levelG.call(agg_scatterplot_virtual_layer, {
										width: firstLevelWidth,
										height: newViewHeight,
										parentVLWidth: firstLevelParentVLWidth,
										axis_x_position: 15,
										side: 'parent',
										level: 'level1'
							});	
							
						}

						if (i == 3) {
							levelG.call(scatterplot_virtual_layer, {
								width: firstLevelWidth,
								height: newViewHeight,
								parentVLWidth: firstLevelParentVLWidth,
								axis_x_position: 15,
								link_opacity: 0.3,
								side: 'parent',
								level: 'level1'
							});	
						}

						if (i == 4) {
							d3.selectAll('.'+ level +'.scatterplot.children.text')
								.transition()
								.attr("x", -firstLevelParentVLWidth)

							// Call Virtual Layer
							levelG.call(agg_scatterplot_swath_virtual_layer, {
										width: firstLevelWidth,
										height: newViewHeight,
										parentVLWidth: firstLevelParentVLWidth,
										axis_x_position: 15,
										link_opacity: 0.6,
										side: 'parent',
										level: 'level1'
							});								
						}

						if (i == 5) {
							d3.selectAll('.'+ level +'.scatterplot.children.text')
								.transition()
								.attr("x", -firstLevelParentVLWidth)

							// Call Virtual Layer
							levelG.call(agg_scatterplot_swath_control_virtual_layer, {
										width: firstLevelWidth,
										height: newViewHeight,
										parentVLWidth: firstLevelParentVLWidth,
										axis_x_position: 15,
										link_opacity: 0.6,
										side: 'parent',
										level: 'level1'
							});								
						}

						if (i == 6) {
							d3.selectAll('.'+ level +'.scatterplot.children.text')
								.transition()
								.attr("x", -firstLevelParentVLWidth)

							// Call Virtual Layer
							levelG.call(scatterplot_scented_swath_virtual_layer, {
										width: firstLevelWidth,
										height: newViewHeight,
										parentVLWidth: firstLevelParentVLWidth,
										axis_x_position: 15,
										link_opacity: 0.6,
										side: 'parent',
										level: 'level1'
							});								
						}
					}

					if (selectedChart == 'genericheatmap') {

						if (i == 2) {
							addWidth4Lable = 30;
							firstLevelParentVLWidth = addWidth4Lable;

							// Hide node
							d3.selectAll('.'+ level +'.list.cell')
								.transition().style('visibility', "hidden");

							d3.selectAll('.'+ level +'.genericheatmap.children.text')
								.transition().style('visibility', "hidden");

							levelG.call(generic_heatmap_virtual_layer, {
								x_position: 0,
								height: newViewHeight,
								chart_data: csvData,
								offset_flag: false,
								parentVLWidth: firstLevelParentVLWidth,
								side: 'parent',
								level: 'level1'
							});	
						}
					}

					if (selectedChart == 'countrymap') {
						if (i == 2) {
							// Call Virtual Layer
							levelG.call(country_map_virtual_layer, {
								side: 'parent',
								level: 'level3'
							});								
						}

						if (i == 3) {
							// Adjust level 3 nodes x postion
							thirdLevelParentVLWidth = 100;
							d3.selectAll('.node.level-3')
								.transition()
								.attr("transform", function(d,i) { 
									var postion_x = d.y + firstLevelWidth 
													+ secondLevelWidth + thirdLevelParentVLWidth;
									return "translate(" + postion_x + "," + d.x + ")"; });	

							d3.selectAll('.' + level + '.list.rect,' + '.' + level + '.list.text')
								.transition()
								.attr("transform", function(d,i) { 
								return "translate(" + (-thirdLevelParentVLWidth) + "," + 0 + ")"; });	

							// Call Virtual Layer
							levelG.call(country_map_projection_virtual_layer, {
								side: 'parent',
								thirdLevelParentVLWidth: thirdLevelParentVLWidth,
								level: 'level3'
							});	
						}

						if (i == 4) {
							// Adjust level 3 nodes x postion
							thirdLevelParentVLWidth = 100;
							d3.selectAll('.node.level-3')
								.transition()
								.attr("transform", function(d,i) { 
									var postion_x = d.y + firstLevelWidth 
													+ secondLevelWidth + thirdLevelParentVLWidth;
									return "translate(" + postion_x + "," + d.x + ")"; });	

							d3.selectAll('.' + level + '.list.rect,' + '.' + level + '.list.text')
								.transition()
								.attr("transform", function(d,i) { 
								return "translate(" + (-thirdLevelParentVLWidth) + "," + 0 + ")"; });	

							// Call Virtual Layer
							levelG.call(country_map_projection_center_virtual_layer, {
								side: 'parent',
								thirdLevelParentVLWidth: thirdLevelParentVLWidth,
								level: 'level3'
							});	
						}
					}

					// Common code
					if (level == "level1") {
						if (i == 2 || i == 3 || i == 4 || i == 5 || i == 6) {
							var addTotalWidthVL = firstLevelParentVLWidth + firstLevelChildrenVLWidth;

							// Adjust Total Space
							adjustTotalWidth({
								firstLevelWidth: firstLevelWidth, 
								firstLevelParentVLWidth: firstLevelParentVLWidth,
								addTotalWidthVL: addTotalWidthVL,
								resetFlag: true
							})
						}
					}
				});

	leftIdentityButtonGroups.call(button_vertical_list, {
			bWidth: bWidth,
			bHeight: bHeight,
			bSpace: bSpace,
			x0: 0,
			y0: 0,
			transform_x: (-bWidth - bSpace), // TODO hardcode
			side: 'parent'
		});		

	// Right Identity Button
	var rightIdentityButtonGroups = 
		selection.selectAll("g." + level + ".right.identity.button")
				.data(rightIdentityLabels)
				.enter()
				.append("g")
				.attr("class", level + " right identity button")
				.style("cursor","pointer")
				.on("click",function(d, i) {
					updateButtonColors(d3.select(this), d3.select(this.parentNode));

					// Reset
					firstLevelChildrenVLWidth = 0;

					d3.selectAll('.' + level + '.' + selectedChart + '.initialvirtuallayer.children.rect')
						.transition().style('visibility', "visible");

					// Reset right rect
					d3.selectAll('.'+ level +'.initialvirtuallayer.children.rect')
						.attr("y", -10)
						.attr("height", 20);

					// Remove existing virtual layer
					d3.selectAll('.children.virtuallayer').remove();
					d3.selectAll('.aux.virtuallayer').remove();

					// Adjust first level width
					adjustWidth({
						firstLevelWidth: firstLevelWidth, 
						addWidth: 0, 
						level: 'level2'});


					if (i == 0) {
						adjustWidth({
							firstLevelWidth: firstLevelWidth, 
							addWidth: firstLevelParentVLWidth, 
							level: 'level1'});

						adjust_position = -50;

						d3.selectAll('.'+ level +'.initialvirtuallayer.children.rect')
							.transition()
							.attr("height", 20)
							.attr('transform', `translate(${adjust_position},${newViewHeight/2})`);
					}

					if (i == 1) {
						if (trendType == 'pearson_corr') {
							if (d3.select('.level1.doublehistogram').style("visibility") == 'visible'
							|| d3.select('.level1.scatterplot').style("visibility") == 'visible'
							|| d3.select('.level1.heatmapdensity').style("visibility") == 'visible') {
								adjustWidth({
									firstLevelWidth: firstLevelWidth, 
									addWidth: firstLevelParentVLWidth, 
									level: 'level1'});

								d3.selectAll('.'+ level +'.initialvirtuallayer.children.rect')
								.transition()
								.attr("y", 0)
								.attr("height", height)
								.attr('transform', `translate(${-40},${0})`);
							}

							if (d3.select('.level1.histogram').style("visibility") == 'visible') {
								firstLevelChildrenVLWidth = 60 + 20;
								var addTotalWidthVL = firstLevelParentVLWidth + firstLevelChildrenVLWidth;
								// Adjust Total Space
								adjustTotalWidth({
									firstLevelWidth: firstLevelWidth, 
									firstLevelParentVLWidth: firstLevelParentVLWidth,
									addTotalWidthVL: addTotalWidthVL,
									resetFlag: true
								})

								// Reset the x position for child nodes in level 1 Virtual Layer
								d3.selectAll('.' + level + '.initialvirtuallayer.children.rect')
									.transition()
									.attr("transform", function(d,i) { 
										return "translate(" + 40 + "," + height/2 + ")"; });	

								// TODO merge same code for duplicate y axis
								levelG.each(function (d) {
									var selectionLevelG = d3.select(this);

									var keyArray = d.data.key.split(",");
									var histrogram_data = [];
									csvData.forEach(function (item) {
										var singleObj_var = {};
										singleObj_var['type'] = keyArray[0];
										singleObj_var['value'] = item[keyArray[0]];
										histrogram_data.push(singleObj_var);

									});

									// Duplicate y axis
									selectionLevelG.call(axisHistogram, {
										chart_data: histrogram_data,
										width: firstLevelWidth,
										height: 30,
										offset_y: -35,
										level: 'level1'
									})

									// Second chart
									var histrogram_data = [];
									csvData.forEach(function (item) {
										var singleObj_var = {};
										singleObj_var['type'] = keyArray[1];
										singleObj_var['value'] = item[keyArray[1]];
										histrogram_data.push(singleObj_var);
									});

									// Duplicate y axis
									selectionLevelG.call(axisHistogram, {
										chart_data: histrogram_data,
										width: firstLevelWidth,
										height: 30,
										offset_y: 35,
										level: 'level1'
									})
								})	

								// Call Virtual Layer
								levelG.call(small_multiples_virtual_layer, {
									width: firstLevelWidth,
									height: 30,
									offset_x: 10 + firstLevelWidth,
									offset_y: 35,
									virtualLayerWidth: firstLevelChildrenVLWidth,
									rectWidth: 20,
									rectHeight: 20,
									matrix_data: matrix_data,
									side: 'children',
									level: 'level1'
								});	
							}
						}
					}

					if (i == 2 && trendType == "pearson_corr") {

						if (trendType == 'pearson_corr') {
							if (d3.select('.level1.doublehistogram').style("visibility") == 'visible'
								|| d3.select('.level1.histogram').style("visibility") == 'visible'
								|| d3.select('.level1.scatterplot').style("visibility") == 'visible') {
								//var addRightWidth = 40 + 60;
								if (d3.select('.level1.scatterplot').style("visibility") == 'visible') {
									firstLevelChildrenVLWidth = 70;
								} else {
									firstLevelChildrenVLWidth = 60;
								}

								var addTotalWidthVL = firstLevelParentVLWidth + firstLevelChildrenVLWidth;
		
								adjustWidth({
									firstLevelWidth: firstLevelWidth, 
									addWidth: addTotalWidthVL, 
									level: 'level2'});
							} 
						} 

						// TODO not sure what the purpose is
						// Reset the x position for child nodes in level 1 Virtual Layer
						//if (d3.select('.level1.scatterplot').style("visibility") == 'visible') {
						//	child_x_position = 30;
						//} else {
						//	child_x_position = 20;
						//}

						child_x_position = 20;

						d3.selectAll('.' + level + '.initialvirtuallayer.children.rect')
							.transition()
							.attr("transform", function(d,i) { 
								return "translate(" + child_x_position + "," + newViewHeight/2 + ")"; });	
	
						if (trendType == 'pearson_corr') {
							if (d3.select('.level1.doublehistogram').style("visibility") == 'visible'
								|| d3.select('.level1.histogram').style("visibility") == 'visible') {
							
								if (d3.select('.level1.doublehistogram').style("visibility") == 'visible') {
									levelG.each(function (d) {
										var selectionLevelG = d3.select(this);
				
										// Duplicate y axis
										// Prepare data TODO duplicate issue
										var keyArray = d.data.key.split(",");
										var histrogram_data = [];
										csvData.forEach(function (item) {
											var singleObj_var1 = {};
											singleObj_var1['type'] = keyArray[0];
											singleObj_var1['value'] = item[keyArray[0]];
											histrogram_data.push(singleObj_var1);
				
											var singleObj_var2 = {};
											singleObj_var2['type'] = keyArray[1];
											singleObj_var2['value'] = item[keyArray[1]];
											histrogram_data.push(singleObj_var2);
										});
				
										// TODO Duplicate code issue
										var min_domain = d3.min(histrogram_data, function(d) { return +d.value });
										var max_domain = d3.max(histrogram_data, function(d) { return +d.value });
									
										// X axis: scale and draw:
										var x = d3.scaleLinear()
													.domain([min_domain, max_domain])
													.range([0, width]);
				
										var histogram = d3.histogram()
														.value(function(d) { return +d.value; })   
														.domain(x.domain())  
														.thresholds(x.ticks(10)); 
				
										var bins1 = histogram(histrogram_data.filter( function(d){return d.type === keyArray[0]} ));
										var bins2 = histogram(histrogram_data.filter( function(d){return d.type === keyArray[1]} ));
									
										// Y axis: 
										var y_max = Math.max(d3.max(bins1, function(d) { return d.length; }), 
															d3.max(bins2, function(d) { return d.length; }));
				
										var y = d3.scaleLinear()
												.domain([0, y_max])    
												.range([100, 0]);
				
										selectionLevelG.append("g")
											.attr("class", level + " doublehistogram virtuallayer y axis children")
											.attr("transform", "translate(" + 140 + ","+ (-100/2)+")")
											.call(d3.axisRight(y));
									});	

									// Call Virtual Layer
									levelG.call(doubleHistogram_virtual_layer, {
										width: firstLevelWidth,
										height: height,
										parentVLWidth: firstLevelParentVLWidth,
										axis_x_position: 140 + 25,
										side: 'children',
										aux_flag: false,
										level: 'level1'
									});	
								}

								if (d3.select('.level1.histogram').style("visibility") == 'visible') {
									levelG.each(function (d) {
										var selectionLevelG = d3.select(this);

										var keyArray = d.data.key.split(",");
										var histrogram_data = [];
										csvData.forEach(function (item) {
											var singleObj_var = {};
											singleObj_var['type'] = keyArray[0];
											singleObj_var['value'] = item[keyArray[0]];
											histrogram_data.push(singleObj_var);

										});

										// Duplicate y axis
										selectionLevelG.call(axisHistogram, {
											chart_data: histrogram_data,
											width: firstLevelWidth,
											height: 30,
											offset_y: -35,
											level: 'level1'
										})

										// Second chart
										var histrogram_data = [];
										csvData.forEach(function (item) {
											var singleObj_var = {};
											singleObj_var['type'] = keyArray[1];
											singleObj_var['value'] = item[keyArray[1]];
											histrogram_data.push(singleObj_var);
										});

										// Duplicate y axis
										selectionLevelG.call(axisHistogram, {
											chart_data: histrogram_data,
											width: firstLevelWidth,
											height: 30,
											offset_y: 35,
											level: 'level1'
										})
									})	

									// Call Virtual Layer
									levelG.call(histogram_virtual_layer, {
										width: firstLevelWidth,
										height: 30,
										source_offset_y: 0,
										offset_y: -35,
										virtualLayerWidth: firstLevelChildrenVLWidth,
										axis_x_position: 140 + 25,
										side: 'children',
										multi_no: 'h1',
										aux_flag: false,
										level: 'level1'
									});	
		
									levelG.call(histogram_virtual_layer, {
										width: firstLevelWidth,
										height: 30,
										source_offset_y: 0,
										offset_y: 35,
										virtualLayerWidth: firstLevelChildrenVLWidth,
										axis_x_position: 140 + 25,
										side: 'children',
										multi_no: 'h2',
										aux_flag: false,
										level: 'level1'
									});	
								}
							}

							if (d3.select('.level1.heatmapdensity').style("visibility") == 'visible') {

								firstLevelChildrenVLWidth = 0;
								var addTotalWidthVL = firstLevelParentVLWidth + firstLevelChildrenVLWidth;
		
								adjustWidth({
									firstLevelWidth: firstLevelWidth, 
									addWidth: addTotalWidthVL, 
									level: 'level2'});

								// Hide node
								d3.selectAll('.' + level + '.initialvirtuallayer.children.rect')
									.transition().style('visibility', "hidden");

								levelG.call(heatmapDensity_virtual_layer, {
									x_position: firstLevelWidth,
									height: 100,
									chart_data: csvData,
									offset_flag: true,
									side: 'children',
									level: 'level1'
								});	
							}
						}
					}
					
					if (i == 3 && trendType == "pearson_corr") {
						if (d3.select('.level1.heatmapdensity').style("visibility") == 'visible') {

							firstLevelChildrenVLWidth = 25;
							var addTotalWidthVL = firstLevelParentVLWidth + firstLevelChildrenVLWidth;
							// Adjust Total Space
							adjustTotalWidth({
								firstLevelWidth: firstLevelWidth, 
								firstLevelParentVLWidth: firstLevelParentVLWidth,
								addTotalWidthVL: addTotalWidthVL,
								resetFlag: false
							})

							d3.selectAll('.'+ level +'.initialvirtuallayer.children.rect')
								.transition()
								.attr("y", 0)
								.attr("height", height)
								.attr('transform', `translate(${-14},${0})`);

							levelG.call(heatmapDensity_virtual_layer, {
								x_position: firstLevelWidth,
								height: 100,
								chart_data: csvData,
								offset_flag: true,
								side: 'children',
								level: 'level1'
							});	
						}							

						if (d3.select('.level1.histogram').style("visibility") == 'visible') {
							firstLevelChildrenVLWidth = 60 + 60;
							var addTotalWidthVL = firstLevelParentVLWidth + firstLevelChildrenVLWidth;
	
							adjustWidth({
								firstLevelWidth: firstLevelWidth, 
								addWidth: addTotalWidthVL, 
								level: 'level2'});
		
							// Reset the x position for child nodes in level 1 Virtual Layer
							d3.selectAll('.' + level + '.initialvirtuallayer.children.rect')
								.transition()
								.attr("transform", function(d,i) { 
									return "translate(" + (20 + 60) + "," + height/2 + ")"; });	

							// Call Virtual Layer
							levelG.call(small_multiples_virtual_layer, {
								width: firstLevelWidth,
								height: 30,
								offset_x: 10 + firstLevelWidth + 40,
								offset_y: 35,
								virtualLayerWidth: firstLevelChildrenVLWidth,
								rectWidth: 20,
								rectHeight: 20,
								matrix_data: matrix_data,
								side: 'children',
								level: 'level1'
							});										

							levelG.each(function (d) {
								var selectionLevelG = d3.select(this);

								var keyArray = d.data.key.split(",");
								var histrogram_data = [];
								csvData.forEach(function (item) {
									var singleObj_var = {};
									singleObj_var['type'] = keyArray[0];
									singleObj_var['value'] = item[keyArray[0]];
									histrogram_data.push(singleObj_var);

								});

								// Duplicate y axis
								selectionLevelG.call(axisHistogram, {
									chart_data: histrogram_data,
									width: firstLevelWidth,
									height: 30,
									offset_y: -35,
									level: 'level1'
								})

								// Second chart
								var histrogram_data = [];
								csvData.forEach(function (item) {
									var singleObj_var = {};
									singleObj_var['type'] = keyArray[1];
									singleObj_var['value'] = item[keyArray[1]];
									histrogram_data.push(singleObj_var);
								});

								// Duplicate y axis
								selectionLevelG.call(axisHistogram, {
									chart_data: histrogram_data,
									width: firstLevelWidth,
									height: 30,
									offset_y: 35,
									level: 'level1'
								})
							})	

							// Call Virtual Layer
							levelG.call(histogram_virtual_layer, {
								width: firstLevelWidth,
								height: 30,
								source_offset_y: -35,
								offset_y: -35,
								virtualLayerWidth: firstLevelChildrenVLWidth,
								axis_x_position: 140 + 25,
								side: 'children',
								multi_no: 'h1',
								aux_flag: false,
								level: 'level1'
							});	

							levelG.call(histogram_virtual_layer, {
								width: firstLevelWidth,
								height: 30,
								source_offset_y: 35,
								offset_y: 35,
								virtualLayerWidth: firstLevelChildrenVLWidth,
								axis_x_position: 140 + 25,
								side: 'children',
								multi_no: 'h2',
								aux_flag: false,
								level: 'level1'
							});	
						}
					}

					// Start to use selectedChart=================================>
					// Common VL option for all charts
					if (i == 1) {
						adjustWidth({
							firstLevelWidth: firstLevelWidth, 
							addWidth: firstLevelParentVLWidth, 
							level: 'level1'});

						d3.selectAll('.'+ level +'.initialvirtuallayer.children.rect')
							.transition()
							.attr("y", 0)
							.attr("height", newViewHeight)
							.attr('transform', `translate(${-50},${0})`);
					}

					if (selectedChart == 'scatterplot') {

						if (i == 2 || i == 3 || i == 4 || i == 5 || i == 6) {

							firstLevelChildrenVLWidth = 70;

							if (i == 5) {
								firstLevelChildrenVLWidth = 90;
							}

							var addTotalWidthVL = firstLevelParentVLWidth + firstLevelChildrenVLWidth;
	
							adjustWidth({
								firstLevelWidth: firstLevelWidth, 
								addWidth: addTotalWidthVL, 
								level: 'level2'});							

							// Reset the x position for child nodes in level 1 Virtual Layer
							child_x_position = 20;

							if (i == 5) {
								child_x_position = 40;
							}

							d3.selectAll('.' + level + '.initialvirtuallayer.children.rect')
								.transition()
								.attr("transform", function(d,i) { 
									return "translate(" + child_x_position + "," + newViewHeight/2 + ")"; });	

							// Charts in both trends
							levelG.each(function (d) {				
								var selectionLevelG = d3.select(this);

								yLable = selectionLevelG.select(".scatterplot.y.label").text();
								xLable = selectionLevelG.select(".scatterplot.x.label").text();
								var keyArray = d.data.key.split(",");

								var chart_data;
								if (trendType == 'pearson_corr') {
									chart_data = csvData;
								} else if (trendType == 'rank_trend') {

									// Aggregate data
									var aggResultArray = d3.nest()
										.key(function(d) {return d[keyArray[1]]})
										.key(function(d) {return d[xLable]})
										.sortKeys(d3.ascending)
										.rollup(function(v) {
											return {
												sum: d3.sum(v, function(d) {return d[keyArray[0]]})
											}
										})
										.entries(csvData);

									// Flattern the nested data
									chart_data = []
									aggResultArray.forEach(function(row) {
										row.values.forEach(function(cell) {
										var singleObj = {};
										singleObj[keyArray[1]] = row.key;
										singleObj[xLable] = Number(cell.key);
										singleObj[keyArray[0]] = cell.value.sum;

										chart_data.push(singleObj);
										});
									});
								}

								// Duplicate y axis
								// TODO Move to axis.js
								const yScale = d3.scaleLinear();
								// Insert padding so that points do not overlap with y or x axis
								yScale.domain(padLinear(d3.extent(chart_data, d => d[yLable]), 0.05));
								yScale.range([newViewHeight, 0]);
								yScale.nice();

								const yAxis = d3.axisRight(yScale).ticks(5);
								yAxis.tickFormat(d3.format(".2s"));
		
								selectionLevelG.append("g")
									.attr("class", level + " scatterplot virtuallayer y axis children")
									.attr("transform", "translate(" + 250 + ","+ (-newViewHeight/2)+")")
									.call(yAxis);
							});	

							// Call Virtual Layer
							if (i == 2) {
								if (trendType == 'pearson_corr') {

									levelG.call(scatterplot_virtual_layer, {
										width: firstLevelWidth,
										height: newViewHeight,
										parentVLWidth: firstLevelParentVLWidth,
										axis_x_position: 250 + 35,
										side: 'children',
										aux_flag: false,
										level: 'level1'
									});	
								} 
							}

							if (i == 2) {
								levelG.call(agg_scatterplot_virtual_layer, {
									width: firstLevelWidth,
									height: newViewHeight,
									parentVLWidth: firstLevelParentVLWidth,
									axis_x_position: 250 + 35,
									side: 'children',
									aux_flag: false,
									level: 'level1'
								});	
							}

							if (i == 3) {
								levelG.call(scatterplot_virtual_layer, {
									width: firstLevelWidth,
									height: newViewHeight,
									parentVLWidth: firstLevelParentVLWidth,
									axis_x_position: 250 + 35,
									aux_flag: false,
									link_opacity: 0.3,
									side: 'children',
									level: 'level1'
								});	
							}
						}

						if (i == 4) {
							// Call Virtual Layer
							levelG.call(agg_scatterplot_swath_virtual_layer, {
										width: firstLevelWidth,
										height: newViewHeight,
										parentVLWidth: firstLevelParentVLWidth,
										axis_x_position: 250 + 35,
										aux_flag: false,
										link_opacity: 0.6,
										side: 'children',
										level: 'level1'
							});						
						}

						if (i == 5) {
							// Call Virtual Layer
							levelG.call(agg_scatterplot_swath_control_virtual_layer, {
										width: firstLevelWidth,
										height: newViewHeight,
										parentVLWidth: firstLevelParentVLWidth,
										axis_x_position: 250 + 35,
										aux_flag: false,
										link_opacity: 0.6,
										side: 'children',
										level: 'level1'
							});								
						}

						if (i == 6) {
							// Call Virtual Layer
							levelG.call(scatterplot_scented_swath_virtual_layer, {
										width: firstLevelWidth,
										height: newViewHeight,
										parentVLWidth: firstLevelParentVLWidth,
										axis_x_position: 250 + 35,
										link_opacity: 0.6,
										side: 'children',
										level: 'level1'
							});								
						}

						// Common part

					}

					if (selectedChart == 'genericheatmap') {
						if (i == 2) {
							firstLevelChildrenVLWidth = 40 + 20;
							var addTotalWidthVL = firstLevelParentVLWidth + firstLevelChildrenVLWidth;

							adjustWidth({
								firstLevelWidth: firstLevelWidth, 
								addWidth: addTotalWidthVL,  
								level: 'level2'});

							// Hide node
							d3.selectAll('.' + level + '.initialvirtuallayer.children.rect')
								.transition().style('visibility', "hidden");

							levelG.call(generic_heatmap_virtual_layer, {
								x_position: firstLevelWidth + firstLevelChildrenVLWidth,
								height: newViewHeight,
								chart_data: csvData,
								offset_flag: true,
								parentVLWidth: firstLevelParentVLWidth,
								childrenVLWidth: firstLevelChildrenVLWidth,
								side: 'children',
								level: 'level1'
							});	
						}
					}
				});

	rightIdentityButtonGroups.call(button_vertical_list, {
		bWidth: bWidth,
        bHeight: bHeight,
        bSpace: bSpace,
		x0: 0,
		y0: 0,
		transform_x: (40 * 3), // TODO hardcode
		side: 'children'
	});	

}

function updateButtonColors(button, parent) {

	var defaultColor= "#797979";
	var pressedColor= "#0076BA";

	parent.selectAll("rect")
			.attr("fill",defaultColor)

	button.select("rect")
			.attr("fill",pressedColor)
}