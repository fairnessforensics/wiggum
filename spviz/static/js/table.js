function tabulate(data, columns) {	
	
	// remove existing table
	d3.select("#table").selectAll('table').remove();
	d3.select("#table").style("display", "inline-block");
	var table = d3.select("div#table").append('table');
	var thead = table.append('thead');
	var sortAscending = true;

	// append the header row
	var thead = table.append('thead').append('tr')
	  .selectAll('th')
	  .data(columns).enter()
	  .append('th')
	  .style("font-size", "9px")
		.text(function (column) { return column; })
		.on('click', function (d) {
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

	var	tbody = table.append('tbody');
	// create a row for each object in the data
	var rows = tbody.selectAll('tr')
	  .data(data)
	  .enter()
		.append('tr')
		.attr("row", function(d) { return d.feat1+"_"+d.feat2+"_"+d.group_feat+"_"+d.subgroup; })
		.attr("class", "tablerow")
		.on("click", function(d, i) {
			var vars = {x: d.feat1, y: d.feat2, categoryAttr: d.group_feat, category: d.subgroup};
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

function updateTabulate(vars) {	

	d3.selectAll(".tablerow").classed("highlighted", false);
	var cell_id = vars.x + "_" + vars.y + "_" + vars.categoryAttr + "_" + vars.category;
	d3.select("tr[row='" + cell_id + "']").classed("highlighted", true);
	
}

function interactBivariateMatrix(vars) {

	updateScatterplot(csvData, vars);

	// update bivariate matrix
	var allsvg = d3.select(container);
	allsvg.selectAll(".cell").classed("clicked", false);

	var cell_id = vars.x + "_" + vars.y + "_" + vars.categoryAttr + "_" + vars.category;

	d3.select("rect[id='"+cell_id+"']").classed("clicked", true);
	updateTabulate(vars);
};

function roleTable(data, var_types, samples, possibleRoles, isCounts, roles) {

		var myArray = [];
		var my_var_types = {};
		var my_sample = {};
		var my_isCounts = {};
		var my_roles = {};		
		data.forEach(function(d,i) {
			myArray.push({"name": d, "type_dropdown": d, "role_dropdown":d, "isCount_dropdown":d, "sample": d});
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
				// set default isCount to 'N'
				my_roles[d] = '';
			}			
		});

		var columns = ["name", "type_dropdown", "role_dropdown", "isCount_dropdown", "sample"];
		
		var roleTable = d3.select("#roleSelection")
							.append("table")
							.attr("id", "roleTable")							
							.style("border", "none")
							.style("box-shadow", "none")
							.style("margin-left", "20px");			

		// append the header row
		var META_COLUMNS = ['name','var_type','role','isCount', 'sample']
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
							if(i==4){
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
						})
											
}

function roleTable_bak(data) {

	var myArray = [];
	data.forEach(function(d,i) {
		myArray.push({"name": d, "dropdown": d});

	});

	var columns = ["name", "dropdown"];
	
	var roleTable = d3.select("#roleSelection")
										.append("table")
										.style("border", "none")
										.style("box-shadow", "none")
										.style("margin-left", "20px");			

	var rows = roleTable.selectAll("tr")
											.data(myArray).enter()
											.append("tr");
											
	var cells = rows.selectAll("td")
									.data(function(d) {
											return d;
									})
									.enter()
									.append("td")
									.style("font-size", "12px")			
									.style("text-align", "left")	
									.style("border", "none")																		
									.text(function(d,i) { 
										if(i!=2){
											return d;
										} 
									})
									.each(function(d,i) {
										if (i==2) {
											d3.select(this).append('select');
											var options = select.selectAll('option')
																					.data(optionData).enter()
																					.append('option')
																					.text(function(d){return d;})
										}
									})
										
}