// Global variable
var csvData;

/**
 * Initialize interact page
 *
 * @param data.
 * @returns none.
 */
 function init(data){	

    // Draw node link tree
    var result_table = JSON.parse(data.result_df);
    drawNodeLinkTree(data);
    //drawNodeLinkTree(result_table, data.agg_distance_heatmap_dict);
    drawMapState(result_table);

    if (data.agg_distance_heatmap_dict[0].detail_view_type === 'scatter') {
        // dependent vars list
        var dep_vars = data.dep_vars
        d3.select("#dep_sel_button")
            .selectAll('myOptions')
            .data(dep_vars)
            .enter()
            .append('option')
            .text(function (d) { return d; }) 
            .attr("value", function (d) { return d; })
        
        d3.select("#dep_sel_button").on("change", function(d) {
                drawScatterplot(csvData, $('#indep_sel_button').val(), 
                    $('#dep_sel_button').val(), $('#splitby_sel_button').val())            
        })

        // independent vars list
        var indep_vars = data.indep_vars
        d3.select("#indep_sel_button")
            .selectAll('myOptions')
            .data(indep_vars)
            .enter()
            .append('option')
            .text(function (d) { return d; }) 
            .attr("value", function (d) { return d; })

        d3.select("#indep_sel_button").on("change", function(d) {
            drawScatterplot(csvData, $('#indep_sel_button').val(), 
                $('#dep_sel_button').val(), $('#splitby_sel_button').val())            
        })

        // splitby vars list
        var splitby_vars = data.splitby_vars
        d3.select("#splitby_sel_button")
            .selectAll('myOptions')
            .data(splitby_vars)
            .enter()
            .append('option')
            .text(function (d) { return d; }) 
            .attr("value", function (d) { return d; })

        d3.select("#splitby_sel_button").on("change", function(d) {
            drawScatterplot(csvData, $('#indep_sel_button').val(), 
                $('#dep_sel_button').val(), $('#splitby_sel_button').val())            
        })

        // create initial scatterplot
        csvData = JSON.parse(data.df.replace(/\bNaN\b/g, "null"));
        
        // TODO---------date column----------->
        var dateFlg = Object.keys(csvData[0]).includes("date");
        if (dateFlg) {
            csvData.forEach(function(d) {
                d['date'] = d3.timeParse("%Y-%m-%d")(d['date']);
            });
        }
        // TODO<-------------------

        drawScatterplot(csvData, indep_vars[0],dep_vars[0], splitby_vars[0]);

        addAggSlider();
    } else {
        // hide all button for interactive scatterplot
        d3.select("#dep_sel_button")
            .style("visibility", "hidden");

        d3.select("#indep_sel_button")
            .style("visibility", "hidden");
            
        d3.select("#splitby_sel_button")
            .style("visibility", "hidden");    

        // adjust the postion for node link tree
        d3.select("#node_link_tree")
            .style("margin-left", "10%");
    }
}

 
/**
 * Add Slider for aggregate correlation
 *
 * @param none.
 * @returns none.
 */ 
 function addAggSlider() {    

    var sliderRange = d3.sliderBottom()
                        .domain([0,1])
                        .width(120)
                        .tickFormat(d3.format('.2'))
                        .ticks(5)
                        .default([0.1, 0.9])
                        .fill('#2196f3')
                        .on('onchange', val => {
                            d3.select('#agg_slider_lable').text('aggregate correlation');
                        });

    d3.select('div#agg_slider')
        .append('svg')
        .attr('width', 200)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)')
        .call(sliderRange);

 }

 
/**
 * Add RadioButton for selections
 *
 * @param none.
 * @returns none.
 */ 
 function addRadioButton() {
    var w= 300;
    var h= 50;

    var svg= d3.select("#radio_button")
                .append("svg")
                .attr("width",w)
                .attr("height",h)

//container for all buttons
var allButtons= svg.append("g")
                    .attr("id","allButtons") 

//fontawesome button labels
var labels= ['\uf0c8 Rect','\uf0d0 Lasso','\uf00a Grid'];

//colors for different button states 
var defaultColor= "#797979"
var hoverColor= "#56C1FF"
var pressedColor= "#0076BA"

//groups for each button (which will hold a rect and text)
var buttonGroups= allButtons.selectAll("g.button")
    .data(labels)
    .enter()
    .append("g")
    .attr("class","button")
    .style("cursor","pointer")
    .on("click",function(d,i) {

        // Clear all selected points 
        d3.selectAll('circle.selected').classed( "selected", false);

        updateButtonColors(d3.select(this), d3.select(this.parentNode));

        var svg = d3.select("#interact_scatterplot").select("svg");
        var margin = {top: 20, right: 20, bottom: 20, left: 60};

        if (i == 0) {
            svg.on(".drag", null);   
            // remove all grids' rows
            svg.selectAll('.row').remove();

            addRectSel(svg, margin);
        } else if (i == 1) {
            svg.on("mousedown", null);
            svg.on("mousemove", null);
            svg.on("mouseup", null);    
            // remove all grids' rows
            svg.selectAll('.row').remove();

            addLasso(svg);         
        }  else {
            svg.on("mousedown", null);
            svg.on("mousemove", null);
            svg.on("mouseup", null); 
            svg.on(".drag", null);                   

            addGrid(svg, margin);
        }
    })
    .on("mouseover", function() {
        if (d3.select(this).select("rect").attr("fill") != pressedColor) {
            d3.select(this)
                .select("rect")
                .attr("fill",hoverColor);
        }
    })
    .on("mouseout", function() {
        if (d3.select(this).select("rect").attr("fill") != pressedColor) {
            d3.select(this)
                .select("rect")
                .attr("fill",defaultColor);
        }
    })

    var bWidth= 75; //button width
    var bHeight= 22; //button height
    var bSpace= 5; //space between buttons
    var x0= 20; //x offset
    var y0= 0; //y offset

    //adding a rect to each toggle button group
    //rx and ry give the rect rounded corner
    buttonGroups.append("rect")
                .attr("class","buttonRect")
                .attr("width",bWidth)
                .attr("height",bHeight)
                .attr("x",function(d,i) {return x0+(bWidth+bSpace)*i;})
                .attr("y",y0)
                .attr("rx",5) //rx and ry give the buttons rounded corners
                .attr("ry",5)
                .attr("fill",defaultColor)

    //adding text to each toggle button group, centered 
    //within the toggle button rect
    buttonGroups.append("text")
                .attr("class","buttonText")
                .attr("font-family","FontAwesome")
                .attr("x",function(d,i) {
                    return x0 + (bWidth+bSpace)*i + bWidth/2;
                })
                .attr("y",y0+bHeight/2)
                .attr("text-anchor","middle")
                .attr("dominant-baseline","central")
                .attr("fill","white")
                .text(function(d) {return d;})

    function updateButtonColors(button, parent) {
        parent.selectAll("rect")
                .attr("fill",defaultColor)

        button.select("rect")
                .attr("fill",pressedColor)
    }
 }

/**
 * Add lasso selection interaction
 *
 * @param svg.
 * @returns none.
 */ 
 function addLasso(svg) {
// Lasso functions
    var lasso_start = function() {
        lasso.items()
            .attr("r",4) // reset size
            .classed("not_possible",true)
            .classed("selected",false);
    };

    var lasso_draw = function() {

        // Style the possible dots
        lasso.possibleItems()
            .classed("not_possible",false)
            .classed("possible",true);

        // Style the not possible dot
        lasso.notPossibleItems()
            .classed("not_possible",true)
            .classed("possible",false);
    };

    var lasso_end = function() {
        // Reset the color of all dots
        lasso.items()
            .classed("not_possible",false)
            .classed("possible",false);

        // Style the selected dots
        lasso.selectedItems()
            .classed("selected",true)
            .attr("r",4);

        // Reset the style of the not selected dots
        lasso.notSelectedItems()
            .attr("r",4);

        processSelectedData();

    };

    var lasso = d3.lasso()
                    .closePathSelect(true)
                    .closePathDistance(100)
                    .items(svg.selectAll(".dot"))
                    .targetArea(svg)
                    .on("start",lasso_start)
                    .on("draw",lasso_draw)
                    .on("end",lasso_end);

    svg.call(lasso);    
      
 }

/**
 * Add rectangel selection interaction
 *
 * @param svg.
 * @returns none.
 */ 
function addRectSel(svg, margin) {
    var d;
	svg.on("mousedown", function() {
		var p = d3.mouse(this);

		svg.append("rect")            
            .attrs({
                rx      : 6,
                ry      : 6,
                class   : "selection",
                x       : p[0] - margin.left,
                y       : p[1] - margin.top,
                width   : 0,
                height  : 0
            })
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	})
	.on("mousemove", function() {
		var s = svg.select( "rect.selection");            

		if( !s.empty()) {
			var p = d3.mouse(this);
			d = {
					x       : parseFloat(s.attr("x")),
					y       : parseFloat(s.attr("y")),
					width   : parseFloat(s.attr("width")),
					height  : parseFloat(s.attr("height"))
				};
			var move = {
					x : p[0] - d.x - margin.left,
					y : p[1] - d.y - margin.top
				}
			;

			if( move.x < 1) {
				d.x = p[0] - margin.left;
				d.width -= move.x;
			} else {
				d.width = move.x;       
			}

			if( move.y < 1) {
				d.y = p[1] - margin.top;
				d.height -= move.y;
			} else {
				d.height = move.y;       
			}
			s.attrs(d);         
		}
	})
	.on("mouseup", function() {
        d3.selectAll('circle.selected').classed( "selected", false);

        radius=1;  

        d3.selectAll('circle').each( function(circle_data, i) {  
            thisCircle = d3.select(this);
  
            if(!d3.select(this).classed("selected") && 
                    // inner circle inside selection frame
                    parseFloat(thisCircle.attr('cx'))-radius>=d.x && 
                    parseFloat(thisCircle.attr('cx'))+radius<=d.x+d.width &&
                    parseFloat(thisCircle.attr('cy'))-radius>=d.y && 
                    parseFloat(thisCircle.attr('cy'))+radius<=d.y+d.height
            ) { 
                d3.select(this)                            
                    .classed("selected",true);
            }
         });

	  // remove selection frame
	  svg.selectAll("rect.selection").remove();
      
      // call backend
      processSelectedData();
    })    
}


/**
 * Process selected data
 *
 * @param none.
 * @returns none.
 */ 
 function processSelectedData() {
      // all data selected
      var selected_data = d3.selectAll(".selected").data();
      
      if (selected_data.length > 0) {
        selected_data = JSON.stringify(selected_data);

        // call server
        $.ajax({
            type: 'POST',
            url: "/explore",
            data: {'action':'rect_select', 'selected_data': selected_data},
            success: function(data) {
                // TODO
                
            }
        }); 
      }
}

