/**
 * Generate reuslt table
 *
 * @param data - result table from server side.
 * @param action - User action.
 * @returns result table.
 */
function tabulate(data, action) {	
	
	// remove existing table
	d3.select("#table").selectAll('table').remove();
	d3.select("#table").style("display", "inline-block");

	var table = d3.select("div#table").append('table');
	var thead = table.append('thead');
	var sortAscending = true;

	var columns = Object.keys(data[0]);

	if (action == 'detect') {
		d3.select("#agg_type_selector").remove();		
		// add rank option
		var optionData = ['mean', 'min', 'max', 'sum'];
		var select = d3.select("#ranking").append('select')
									.attr('id','agg_type_selector');
		var options = select.selectAll('option')
							.data(optionData).enter()
							.append('option')
							.text(function(d){return d;});

		d3.select("#view_score_selector").remove();			
		// view option
		var optionData = ['distance', 'SP'];
		var select = d3.select("#ranking").append('select')
									.attr('id','view_score_selector');
		var options = select.selectAll('option')
							.data(optionData).enter()
							.append('option')
							.text(function(d){return d;});
	
		d3.select("#rank-btn").remove();	
		// rank button
		d3.select("#ranking").append("button")
							.attr("id", "rank-btn")
							.attr("type", "button")
							.attr("value", "rank")
							.text("Rank")
							.attr("onclick", "rank_button()"); 	
	}


	// append the header row
	var thead = table.append('thead').append('tr')
	  .selectAll('th')
	  .data(columns).enter()
	  .append('th')
	  .style("font-size", "9px")
		.text(function (column) { return column; })
		.on('click', function (d, i) {
			// Remove sorting for 'view distance score'
				thead.attr('class', 'th');
				if (sortAscending) {
					rows.sort(function(a, b) {return d3.ascending(b[d], a[d]);  });
					sortAscending = false;
					this.className = 'aes';
					} 
			else {
					rows.sort(function(a, b) { return d3.descending(b[d], a[d]); });
					sortAscending = true;
					this.className = 'des';
					}
	});

	// append the header row for filtering
	var thead = table.append('thead').append('tr')
	  .selectAll('th')
	  .data(columns).enter()
	  .append('th')
	  .attr("class", "filterrow")
  	  .each(function(d,i) {
			// feat1
			if (i==0) {
				if (action == 'page_load') {
					feat1_options = d3.map(data, function(d){return d.feat1;}).keys();
				} 
	
				var select = d3.select(this).append('select')
											.attr('id','feat1_selector')					
											.attr('multiple', 'multiple')
											.style('height', '44px');
														
				var options = select.selectAll('option')
									.data(feat1_options).enter()
									.append('option')
									.attr("value", function(d) { return d; })
									.text(function(d){return d;})
									.property("selected", 
									function(d){ return feat1_selected.includes(d); });
			}	
			// feat2
			if (i==1) {
				if (action == 'page_load') {
					feat2_options = d3.map(data, function(d){return d.feat2;}).keys();
				} 			

				var select = d3.select(this).append('select')
											.attr('id','feat2_selector')					
											.attr('multiple', 'multiple')
											.style('height', '44px');
														
				var options = select.selectAll('option')
									.data(feat2_options).enter()
									.append('option')
									.attr("value", function(d) { return d; })
									.text(function(d){return d;})
									.property("selected", 
									function(d){ return feat2_selected.includes(d); });
			}	
			// group_feat
			if (i==2) {
				if (action == 'page_load') {
					group_feat_options = d3.map(data, function(d){return d.group_feat;}).keys();
				} 

				var select = d3.select(this).append('select')
											.attr('id','group_feat_selector')				
											.attr('multiple', 'multiple')
											.style('height', '44px');
														
				var options = select.selectAll('option')
									.data(group_feat_options).enter()
									.append('option')
									.attr("value", function(d) { return d; })
									.text(function(d){return d;})
									.property("selected", 
									function(d){ return group_feat_selected.includes(d); });
			}	
			// subgroup
			if (i==3) {
				if (action == 'page_load') {
					subgroup_options = d3.map(data, function(d){return d.subgroup;}).keys();
				} 				

				var select = d3.select(this).append('select')
											.attr('id','subgroup_selector')
											.attr('multiple', 'multiple')
											.style('height', '44px');
														
				var options = select.selectAll('option')
									.data(subgroup_options).enter()
									.append('option')
									.attr("value", function(d) { return d; })
									.text(function(d){return d;})
									.property("selected", 
									function(d){ return subgroup_selected.includes(d); });
			}	
			// subgroup_trend_strength
			if (i==5) {
				d3.select(this).append("text")
					.attr('id', 'subgroup_trend_strength_label')
					.style("font-size", "10px")
					.style("color", "black")
					.text(subgroup_trend_strength);
				d3.select(this).append('br');
				d3.select(this).append('input')
								.attr('type', 'range')
								.attr('id', 'subgroup_trend_strength_slider')
								.style('width', '100px')
								.attr('min', '0')
								.attr('max', '1')
								.attr('step', '0.01')
								.attr('value', subgroup_trend_strength)
								.on("input", function() {
									updateLabel(this.value, '#subgroup_trend_strength_label');
								});
			}	
			// trend_type
			if (i==6) {
				if (action == 'page_load') {
					trend_type_options = d3.map(data, function(d){return d.trend_type;}).keys();
				} 					

				var select = d3.select(this).append('select')
											.attr('id','trend_type_selector')
											.attr('multiple', 'multiple')
											.style('height', '44px');
														
				var options = select.selectAll('option')
									.data(trend_type_options).enter()
									.append('option')
									.attr("value", function(d) { return d; })
									.text(function(d){return d;})
									.property("selected", 
									function(d){ return trend_type_selected.includes(d); });
			}	
			// agg_trend_strength
			if (i==8) {
				d3.select(this).append("text")
					.attr('id', 'agg_trend_strength_label')
					.style("font-size", "10px")
					.style("color", "black")
					.text(agg_trend_strength);
				d3.select(this).append('br');
				d3.select(this).append('input')
								.attr('type', 'range')
								.attr('id', 'agg_trend_strength_slider')
								.style('width', '100px')
								.attr('min', '0')
								.attr('max', '1')
								.attr('step', '0.01')
								.attr('value', agg_trend_strength)
								.on("input", function() {
									updateLabel(this.value, '#agg_trend_strength_label');
								});
			}	
			
			// distance
			if (i==10) {
				d3.select(this).append("text")
					.attr('id', 'distance_label')
					.style("font-size", "10px")
					.style("color", "black")
					.text(distance);
				d3.select(this).append('br');
				d3.select(this).append('input')
								.attr('type', 'range')
								.attr('id', 'distance_slider')
								.style('width', '100px')
								.attr('min', '0')
								.attr('max', '1')
								.attr('step', '0.01')
								.attr('value', distance)
								.on("input", function() {
									updateLabel(this.value, '#distance_label');
								});
			}				
	})
	;

	var	tbody = table.append('tbody');
	// create a row for each object in the data
	var rows = tbody.selectAll('tr')
	  .data(data)
	  .enter()
		.append('tr')
		.attr("row", function(d) { return d.trend_type + "_"+ d.feat1+"_"+d.feat2+"_"+d.group_feat+"_"+d.subgroup; })
		.attr("class", "tablerow")
		.on("click", function(d, i) {
			var vars = {x: d.feat1, y: d.feat2, categoryAttr: d.group_feat, category: d.subgroup, trend_type: d.trend_type};
			return interactBivariateMatrix(vars, i); });

	// create a cell in each row for each column
	var cells = rows.selectAll('td')
	  .data(function (row) {
		return columns.map(function (column) {
		  return {column: column, value: row[column]};
		});
	  })
	  .enter()
	  .append('td')
	  .style("font-size", "9px")
		.text(function (d) { return d.value; });

  return table;
}

/**
 * Update label for slide
 *
 * @param value - label value.
 * @param id - label id.
 * @returns none.
 */
function updateLabel(value, id) {
	d3.select(id).text(value);

	if (id == '#agg_trend_strength_label') {
		agg_trend_strength = value;
	} else if (id == '#subgroup_trend_strength_label'){
		subgroup_trend_strength = value;
	} else {
		distance = value;
	}
}

/**
 * Change highlight row when table is interacted
 *
 * @param vars - variables' values.
 * @returns none.
 */
function updateTabulate(vars) {	

	d3.selectAll(".tablerow").classed("highlighted", false);
	var cell_id = vars.trend_type + "_" + vars.x + "_" + vars.y + "_" + vars.categoryAttr + "_" + vars.category;
	d3.select("tr[row='" + cell_id + "']").classed("highlighted", true);
}

/**
 * interact bivariate matrix with result talbe
 *
 * @param vars - variables' values.
 * @returns none.
 */
function interactBivariateMatrix(vars) {

	// update bivariate matrix
	var allsvg = d3.select(container);
	allsvg.selectAll(".cell").classed("clicked", false);
	allsvg.selectAll(".ratecell").classed("clicked", false);

	var cell_id = vars.x + "_" + vars.y + "_" + vars.categoryAttr + "_" + vars.category;

	d3.select("rect[id='"+cell_id+"']").classed("clicked", true);

	var evt = new MouseEvent("click");
  
	// The way to dispatch it with plain JS
	document.getElementById(cell_id).dispatchEvent(evt);

	updateTabulate(vars);
};

/**
 * Setting role table for data augmentation and data annotation
 *
 * @param data - variable name.
 * @param var_types - variable type.
 * @param samples - samples.
 * @param possibleRoles - possible roles.
 * @param isCounts - counts for weighting.
 * @param roles - variable role.
 * @param weighting_vars - weighting variable.
 * @param checked_vars - variable for quantiles.
 * @param intersection_vars - intersections of categorical variables.
 * @returns none.
 */
function roleTable(data, var_types, samples, possibleRoles, isCounts, roles, 
					weighting_vars, checked_vars, intersection_vars) {

		var myArray = [];
		var my_var_types = {};
		var my_sample = {};
		var my_isCounts = {};
		var my_roles = {};		
		var my_weighting_var = {};
		
		data.forEach(function(d,i) {
			myArray.push({"name": d, "type_dropdown": d, "role_dropdown":d, "isCount_dropdown":d, 
							"weighting_var_dropdown": d, "sample": d, "quantiles": d, "intersection": d});
			my_var_types[d] = var_types[i];
			my_sample[d] = samples[i];
			if (typeof isCounts !== 'undefined') {
				my_isCounts[d] = isCounts[i];
			} else {
				// set default isCount to 'N'
				my_isCounts[d] = 'N';
			}
			if (typeof roles !== 'undefined') {
				my_roles[d] = roles[i];
			} else {
				// set default role to ''
				my_roles[d] = '';
			}	
			if (typeof weighting_vars !== 'undefined') {
				my_weighting_var[d] = weighting_vars[i];
			} else {
				// set default weighting_var to ''
				my_weighting_var[d] = '';
			}	
			if (typeof checked_vars === 'undefined') {
				checked_vars = [];
			}	
			if (typeof intersection_vars === 'undefined') {
				intersection_vars = [];
			}										
		});

		var columns = ["name", "type_dropdown", "role_dropdown", "isCount_dropdown", 
						"weighting_var_dropdown", "sample", "quantiles", "intersection"];
		
		d3.select("#roleSelection").selectAll('table').remove();

		var roleTable = d3.select("#roleSelection")
							.append("table")
							.attr("id", "roleTable")							
							.style("border", "none")
							.style("box-shadow", "none")
							.style("margin-top", "30px")							
							.style("margin-left", "20px");			

		// append the header row
		var META_COLUMNS = ['name','var_type','role','isCount', 'weighting_var', 'sample', "quantiles", "intersection"]
		var thead = roleTable.append('thead').append('tr')
							.selectAll('th')
							.data(META_COLUMNS).enter()
							.append('th')
							.style("font-size", "12px")
							.style("border", "none")		
							.style("padding", "2px")	
							.style("background-color", "#ffffff")
							.style("color", "black")
							.text(function (column) { return column; });

		var	tbody = roleTable.append('tbody');
		var rows = tbody.selectAll("tr")
						.data(myArray).enter()
						.append("tr");

		var cells = rows.selectAll("td")
						.data(function(d) {
							return columns.map(function(column) {
								return {column:column, value: d[column]};
							});
						})
						.enter()
						.append("td")
						.style("font-size", "12px")			
						.style("text-align", "left")	
						.style("border", "none")		
						.style("padding", "10px")	
						.style("white-space", "nowrap")																						
						.text(function(d,i) { 
							if(i==0){
								return d.value;
							} 
							if(i==5){
								return my_sample[d.value];
							} 
						})
						.each(function(d,i) {
							if (i==1) {
								var var_type = my_var_types[d.value];
								var optionData = ['binary', 'ordinal', 'categorical', 'continuous'];
								var select = d3.select(this).append('select');
								var options = select.selectAll('option')
													.data(optionData).enter()
													.append('option')
													.text(function(d){return d;})
													.property("selected", 
													function(d){ return d === var_type; });
							}
							if (i==2) {
								var optionData = possibleRoles;
								var select = d3.select(this).append('select')
															.attr('multiple', 'multiple')
															.style('height', '44px');
								var roles = my_roles[d.value];;															
								var options = select.selectAll('option')
													.data(optionData).enter()
													.append('option')
													.text(function(d){return d;})
													.property("selected", 
													function(d){ 
														if (roles.includes(d)) return d;});													
							}	
							if (i==3) {
								var isCount = my_isCounts[d.value];
								var optionData = ["Y", "N"];
								var select = d3.select(this).append('select');
								var options = select.selectAll('option')
													.data(optionData).enter()
													.append('option')
													.text(function(d){return d;})
													.property("selected", 
													function(d){ return d === isCount;});
							}	
							if (i==4) {
								var weighting_var = my_weighting_var[d.value];
								var optionData = data.filter(item => item !== d.value)
								var na = 'N/A';
								optionData = [na].concat(optionData);

								var select = d3.select(this).append('select');
								var options = select.selectAll('option')
													.data(optionData).enter()
													.append('option')
													.text(function(d){return d;})
													.property("selected", 
													function(d){ return d === weighting_var; });
							}	
							if (i==6) {
								var select = d3.select(this).append('input')
															.attr('type', 'checkbox')
															.attr('name', 'quantiles_checkbox')
															.attr('value', d.value)
															.property('checked', 
															function(d){return checked_vars.includes(d.value)})
							}	
							if (i==7) {
								var var_type = my_var_types[d.value];
								
								if (var_type == 'continuous') {
									var select = d3.select(this).append('input')
									.attr('type', 'checkbox')
									.attr('name', 'intersection_checkbox')
									.property('disabled', true); 
								} else {
									var select = d3.select(this).append('input')
									.attr('type', 'checkbox')
									.attr('name', 'intersection_checkbox')
									.attr('value', d.value)
									.property('checked', 
									function(d){return intersection_vars.includes(d.value)});
								}
							}																																						
						})
											
}

/**
 * Get metadata
 *
 * @param none.
 * @returns meta data list.
 */
function getMetaList() {
	var table, tr, td, i;
	table = document.getElementById("roleTable");
	tr = table.getElementsByTagName("tr");

	var metaList = [];
	for(i = 1; i < tr.length; i++){
		// name
		var name_td = tr[i].getElementsByTagName("td")[0];
		var nameValue = name_td.innerText;                    
		// type
		var type_td = tr[i].getElementsByTagName("td")[1];
		var typeValue = type_td.getElementsByTagName("select")[0];
		// role
		var role_td = tr[i].getElementsByTagName("td")[2];
		var roleValue = role_td.getElementsByTagName("select")[0];                 
		// isCount
		var isCount_td = tr[i].getElementsByTagName("td")[3];
		var isCountValue = isCount_td.getElementsByTagName("select")[0];  
		// weighting_var
		var weighting_var_td = tr[i].getElementsByTagName("td")[4];
		var weighting_varValue = weighting_var_td.getElementsByTagName("select")[0];  

		var singleObject =            
						{   
							name: nameValue,
							var_type: typeValue.options[typeValue.selectedIndex].value, 
							role: getSelectValues(roleValue),
							isCount: isCountValue.options[isCountValue.selectedIndex].value,
							weighting_var: weighting_varValue.options[weighting_varValue.selectedIndex].value                                                               
						};

		metaList.push(singleObject);    
	}
	metaList = JSON.stringify(metaList);

	return metaList;
}
