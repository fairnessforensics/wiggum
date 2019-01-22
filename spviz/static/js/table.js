function tabulate(data, columns) {	
	
	var table = d3.select("div#table").append('table')
	var thead = table.append('thead')
	var	tbody = table.append('tbody');

	// append the header row
	thead.append('tr')
	  .selectAll('th')
	  .data(columns).enter()
	  .append('th')
	  .style("font-size", "9px")
		.text(function (column) { return column; });

	// create a row for each object in the data
	var rows = tbody.selectAll('tr')
	  .data(data)
	  .enter()
	  .append('tr');

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
	
	d3.selectAll("tr").style("background-color", function(d, i){
		// skip the first title row
		if (i>0) {
			if(tableRecords[i-1].feat1 == vars.x && tableRecords[i-1].feat2 == vars.y
					&& tableRecords[i-1].group_feat == vars.categoryAttr 
					&& tableRecords[i-1].subgroup == vars.category) {
				return "#D8D8D8";
			} else {
				return "#FFFFFF";
			}
		}
	})

}