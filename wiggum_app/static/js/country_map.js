var countriesToFilter;
var westernHemisphere;

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

	// TODO hardcode to exit
	if (splitby != "importer" && splitby != "exporter") {
		return;
	}

	var mapG = selection.append("g")
				.attr("class", level + " countrymap " 
					+ dependent + " " + independent + " splitby_" + splitby)
				.attr("width", width)
				.attr("height", height);

	const projection = d3.geoEquirectangular()
	// const projection = d3.geoMercator()
		.center([-90, 0])
		.translate([width / 2, height / 2]);

	const path = d3.geoPath().projection(projection);

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
			westernHemisphere = geojson.features.filter(feature => {
				return countriesToFilter.includes(feature.properties.name)
			});

			// Adjust the size
			projection.fitSize([width*0.9, height*0.9],
					{type:"FeatureCollection","features":westernHemisphere});

			// Draw the map
			mapG.selectAll("path")
				.data(westernHemisphere)
				.enter()
				.append("path")
				.attr("d", path)
				.attr("class", d => "country " + d.id)
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

};

