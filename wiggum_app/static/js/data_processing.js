const aggregate = (props) => {
	const {
		data,
		groupby_keys,
		agg_var
	} = props;

	var aggResultArray = d3.nest()
							.key(function(d) {return d[groupby_keys[0]]})
							.key(function(d) {return d[groupby_keys[1]]})
							.sortKeys(d3.ascending)
							.rollup(function(v) {
								return {
									sum: d3.sum(v, function(d) {return d[agg_var]})
								}
							})
							.entries(data);

	// Flattern the nested data
	var result = []
	aggResultArray.forEach(function(row) {
		row.values.forEach(function(cell) {
			var singleObj = {};
			singleObj[groupby_keys[0]] = row.key;
			singleObj[groupby_keys[1]] = Number(cell.key);
			singleObj[agg_var] = cell.value.sum;

			result.push(singleObj);
		});
	});

	return result;
}

