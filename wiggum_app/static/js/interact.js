
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
    var vars = { x: indep_vars[0], y: dep_vars[0], 
		categoryAttr: splitby_vars[0], category: "all"};
    //updateScatterplot(csvData, vars); 

    drawScatterplot(csvData, indep_vars[0],dep_vars[0], splitby_vars[0])
 }