var countriesToFilter;

const countryMap = (selection, props) => {
	const {
		chart_data,
		width,
		height,
		dependent,
		independent,
		splitby,
		level
	} = props;

	var mapG = selection.append("g")
				.attr("class", level + " countrymap " 
					+ dependent + " " + independent + " " + splitby)
				.attr("width", width)
				.attr("height", height);

	const projection = d3.geoEquirectangular()
	// const projection = d3.geoMercator()
		.center([-90, 0])
		.translate([width / 2, height / 2]);

	const path = d3.geoPath().projection(projection);

	for (var i = 0; i < chart_data.length; i++){
		var node_data = chart_data[i];

		var nodeG = d3.select('.level-3'+ '.' + node_data.dependent 
		+ '.' + node_data.independent + '.splitby_' + node_data.splitby
		+ '.subgroup_' + node_data.subgroup);

		nodeG.append("g")
			.attr("class", level + " singlecountrymap"
					+ " " + node_data.dependent + " " + node_data.independent
					+ " splitby_" + node_data.splitby + " subgroup_" + node_data.subgroup)
			.attr("width", 20)
			.attr("height", 20)
			.attr("transform", "translate(-10, -10)");
	}

	//Some countries name may not match in geojson file.
	countriesToFilter = [
		"Canada", "Mexico", "USA", "Belize", "Costa Rica", "El Salvador", 
		"Guatemala", "Honduras", "Nicaragua", "Panama", "Antigua and Barbuda", 
		"Bahamas", "Barbados", "Cuba", "Dominica", "Dominican Republic", 
		"Grenada", "Haiti", "Jamaica", "Saint Kitts and Nevis", "Saint Lucia", 
		"Saint Vincent and the Grenadines", "Trinidad and Tobago","Argentina", 
		"Bolivia", "Brazil", "Chile", "Colombia", "Ecuador", "Guyana", "Paraguay", 
		"Peru", "Suriname", "Uruguay", "Venezuela"
	  ];

	  //const countriesToFilter = [
		//"Canada", "Mexico", "USA"
	  //];

	d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
		.then(geojson => {
			// Filter for the Western Hemisphere
			const westernHemisphere = geojson.features.filter(feature => {
				return countriesToFilter.includes(feature.properties.name)
			});

			// Draw nodes by country shapes
			drawNodebyShape(chart_data, westernHemisphere, level);

			// Adjust the size
			projection.fitSize([width*0.9, height*0.9],
					{type:"FeatureCollection","features":westernHemisphere});

			// Draw the map
			mapG.selectAll("path")
				.data(westernHemisphere)
				.enter()
				.append("path")
				.attr("d", path)
				.style("fill", function(d) {
					var country_id = d.id;
					var row = chart_data.find(obj => {
						return obj.subgroup == country_id
					  })
	
					if (row != null) {
						return heatmapColorScale(row.distance);
					} else {
						return '#fff';
					} 
				})
				.attr("stroke", "#929292");

		})
		.catch(error => {
			console.error("Error loading the GeoJSON data:", error);
		});


	function drawNodebyShape(chart_data, countries_data, level) {

		for (var i = 0; i < chart_data.length; i++){
			var node_data = chart_data[i];

			var countryMapG = d3.select('.' + level + '.singlecountrymap.'
					 + node_data.dependent + '.' + node_data.independent 
					 + '.splitby_' + node_data.splitby + '.subgroup_' + node_data.subgroup);
			
			 // Draw identity portion map
			var single_country = countries_data[i];
			var single_country = countries_data.filter(obj => {
				return obj.id == node_data.subgroup
			  })

			projection.fitSize([20, 20],
				{"type": "FeatureCollection","features":single_country})

			countryMapG.append("g")
				.attr("class", "countrynode")
				.selectAll("path")
				.data(single_country)
				.enter()
				.append("path")
				.attr("d", path)
				.style("fill", function(d) {
					var country_id = d.id;
					var row = chart_data.find(obj => {
						return obj.subgroup == country_id
					  })
	
					if (row != null) {
						return heatmapColorScale(row.distance);
					} else {
						return '#fff';
					} 
				})				
				.attr("stroke", "#929292")
				.append('title')
				.text(function(d) {
					var country_id = d.id;
					var row = chart_data.find(obj => {
						return obj.subgroup == country_id
					  })
					return `The distance is ${row.distance}.`
				});				
		}

	}

};

