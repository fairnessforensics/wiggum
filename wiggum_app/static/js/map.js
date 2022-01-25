/**
 * Draw map
 * 
 * @param data - result table.
 * @returns none.
*/
function drawMap(data) {
	
	var svg = d3.select('#map')
				.append('svg')
				.attr("width", 960)
				.attr("height", 500);

	const projection = d3.geoMercator();
	const pathGenerator = d3.geoPath().projection(projection);

	d3.json("https://unpkg.com/world-atlas@1.1.4/world/110m.json", function(json_data){
		const contries = topojson.feature(json_data, json_data.objects.countries);

		svg.selectAll('path')
			.data(contries.features)
			.enter().append('path')
			.attr('class', 'country')
			.attr('d', pathGenerator);
	});
}