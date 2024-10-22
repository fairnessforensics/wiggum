var dep_list = [];
var indep_list = [];

/**
 * Draw wiggum 2
 * 
 * @param data - data from backend.
 * @returns none.
*/
function drawWiggum2(data) {

	var margin = {top: 50, right: 500, bottom: 30, left: 300}

	var width = 1200;
	var height = 500;

	var svg = d3.select("#wiggum2")
				.append("svg")
				.attr("width", width)
				.attr("height", height)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");	

	var y_scale_dep = d3.scaleBand()
				.domain(d3.range(data.dep_vars.length))
				.range([0, height]);
				
	var dep_var_list = svg.append("g")
							.attr("id", "depVarList")

	var dep_var_Labels = dep_var_list
							.selectAll(".dep_var_label")
							.data(data.dep_vars)
							.enter()
							.append("g")
							.attr("class", "dep_var_label")
							.attr("id", d =>  "dep_" + d)
							.attr("transform", function(d, i) { 
								return "translate(0," + y_scale_dep(i) + ")"; });
	    					

	dep_var_Labels.append("text")
		.attr("class", "text")
		.attr("x", 0)
		.attr("y", 0)
		.attr("text-anchor", "end")
		.text(function(d) { return d; })
		.style("font-size", "10px")
		.on("click", function(d){
			dep_list.push(d);
			onMouseClick();
		})
		.on("dblclick", function(d){
			dep_list = dep_list.filter(function (element) {
				return element !== d;
			});
			onMouseClick();
		});	

	var y_scale_indep = d3.scaleBand()
							.domain(d3.range(data.indep_vars.length))
							.range([0, height]);
			
	var indep_var_list = svg.append("g")
						.attr("id", "indepVarList")

	var indep_var_Labels = indep_var_list
						.selectAll(".indep_var_label")
						.data(data.indep_vars)
						.enter().append("g")
						.attr("class", "indep_var_label")
						.attr("id", d =>  "indep_" + d)
						.attr("transform", function(d, i) { 
							return "translate(" + (width - margin.right) + "," + y_scale_indep(i) + ")"; });

	indep_var_Labels.append("text")
		.attr("class", "text")
		.attr("x", 0)
		.attr("y", 0)
		.attr("text-anchor", "start")
		.text(d => d)
		.style("font-size", "10px")
		.on("click", function(d){
			indep_list.push(d);
			onMouseClick();
		})
		.on("dblclick", function(d){
			indep_list = indep_list.filter(function (element) {
				return element !== d;
			});
			onMouseClick();
		});	
			 	

	var result_table = JSON.parse(data.result_df);	
	var scatterplot = svg.append("g")
						.attr("class", "scatterplot");

	scatterplot.call(scatterPlot, {
		xValue: d => d['subgroup_trend_strength'],
		xAxisLabel: 'Strength',
		yValue: d => d['distance'],
		yAxisLabel: 'Distance',
		splitby: data.splitby_vars,
		circleRadius: 3,
		margin: { left: 220, top: 150, right: 0, bottom: 0 },
		width: 300,
		height: 300,
		childrenIdentityFlag: false,
		chart_data: result_table
	});

	var linkData = [];
	scatterplot.selectAll(".scatterplot.circle.middle")
		.each(function (d) {
			var bbox = this.getBBox();
			var object_dep = {};
			var object_indep = {};			

			if (bbox.height != 0) {
				var selectId = '#dep_' + d.dependent;	

				var position = d3.select(selectId).attr('transform').split(/[\s,()]+/);
				x_position = parseFloat(position[1]);
				y_position = parseFloat(position[2]);

				object_dep['source'] = [y_position, x_position];
				// TODO height hard code
				x_position = 220 + bbox.x;
				y_position = 3 + bbox.y;

				object_dep['target'] = [y_position, x_position];
				object_dep['class'] = "dep_" + d.dependent + " " + "indep_" + d.independent;

				linkData.push(object_dep);

				// Independent link
				selectId = '#indep_' + d.independent;	
				position = d3.select(selectId).attr('transform').split(/[\s,()]+/);

				x_position = parseFloat(position[1]);
				y_position = parseFloat(position[2]);

				object_indep['source'] = [y_position, x_position];
				// TODO height hard code
				x_position = 220 + 6 + bbox.x;
				y_position = 3 + bbox.y;

				object_indep['target'] = [y_position, x_position];
				object_indep['class'] = "dep_" + d.dependent + " " + "indep_" + d.independent;

				linkData.push(object_indep);

			}
		})

	scatterplot.selectAll('.path scatterplot')
		.data(linkData)
		.enter().append('path')
		.attr("d", linkHorizontal)
		.attr("class", d =>"path scatterplot " + d.class)
		.attr('fill', 'none')
		.attr('stroke', 'black')
		.style("opacity", 0.1)
		.style("stroke-width", "1px");		
		
}

function onMouseClick() {

	d3.selectAll(".path.scatterplot")
		.attr("stroke", "black")
		.style("opacity", 0.2);

	if (indep_list.length == 0) {
		for (var dep of dep_list) {
			d3.selectAll(".dep_" + dep)
				.attr("stroke", "#00c5ff")
				.style("opacity", 1);
		}
	}

	if (dep_list.length == 0) {
		for (var indep of indep_list) {
			d3.selectAll(".indep_" + indep)
				.attr("stroke", "#00c5ff")
				.style("opacity", 1);
		}
	}

	if (dep_list.length != 0 && indep_list.length != 0) {
		for (var dep of dep_list) {
			for (var indep of indep_list) {
				d3.selectAll(".dep_" + dep + ".indep_" + indep)
				.attr("stroke", "#00c5ff")
				.style("opacity", 1);
			}
		}	
	}
}