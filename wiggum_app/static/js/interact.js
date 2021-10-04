
/**
 * Initialize interact page
 *
 * @param data.
 * @returns none.
 */
 function init(data){	

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
    var csvData = JSON.parse(data.df.replace(/\bNaN\b/g, "null"));

    drawScatterplot(csvData, indep_vars[0],dep_vars[0], splitby_vars[0]);

    // add rectangel selection interaction
    var svg = d3.select("#interact_scatterplot").select("svg");
    var margin = {top: 20, right: 20, bottom: 20, left: 20}
    addRectSel(svg, margin);
 }


/**
 * Add rectangel selection interaction
 *
 * @param svg.
 * @returns none.
 */ 
function addRectSel(svg, margin) {
    var d;
	svg.on( "mousedown", function() {
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
	.on( "mousemove", function() {
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
	.on( "mouseup", function() {
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
    
	});        
}