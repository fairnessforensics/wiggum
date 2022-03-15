const districtMap = (selection, props) => {
	const {
		chart_data,
		state_name,
		leaf_node_links,
		width,
		height,
		offset_y,
		level
	} = props;

	var mapG = selection.append("g")
				.attr("class", level + " districtmap")
				.attr("width", width)
				.attr("height", height);

	const projection = d3.geoMercator();		
	const path = d3.geoPath().projection(projection);

	d3.queue()
		.defer(d3.json, "../static/map_data/us.json")
		.defer(d3.json, "../static/map_data/us-congress-113.json")
		.defer(d3.tsv, "../static/map_data/us-state-names.tsv")
		.await(ready);

	function ready(error, us, congress, state_names) {
		if (error) throw error;

		// extract state id by name
		var state_id;
		state_names.forEach(function(d){
			if (d.name.toLowerCase() == state_name.toLowerCase()) {
				state_id = parseInt(d.id);
			}
		});

		const states = topojson.feature(us, us.objects.states);

		const state = states.features.filter(function(d) { return d.id === state_id; })[0];

		projection.scale(1)
				.translate([0, 0]);
		var b = path.bounds(state),
		s = 0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
		t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
	 
	  	projection.scale(s)
			.translate(t);

		const districts = topojson.feature(congress, congress.objects.districts);
		const state_districts = districts.features.filter(function(d) { return checkprefix(d.id, state_id) ; });

		mapG.append("g").append("path")
			.attr("id", "state")
			.attr("class", "districtmap state")
			.datum(state)
			.attr("d", path)
			.attr("fill", "lightgreen");

		mapG.append("g")
			.attr("class", "districtmap districts")
			.selectAll("path")
			.data(state_districts)
			.enter().append("path")
			.attr("d", path)
			//.attr("fill", "#fff")
			.style("fill", function(d) {
				console.log(chart_data);
				console.log(d);
				var district_id = d.id % 100;
				var row = chart_data.find(obj => {
					return obj.subgroup === district_id
				  })

				if (row != null) {
					return heatmapColorScale(row.distance);
				} else {
					return '#fff';
				} 
			})
			.attr("stroke", "black");
			
		mapG.selectAll('circle')
			.data(state_districts)
			.enter()
			.append('circle')
			.attr('class', 'districtmap district')
			.attr('cx', d => path.centroid(d)[0])
			.attr('cy', d => path.centroid(d)[1])
			.attr('r', 3);

		// Links to the leaf nodes
		const mapLinkPathGenerator 
				= d3.linkHorizontal()
					.source(function(d) {
						var district_id = d.id % 100;
						var link = leaf_node_links.find(obj => {
							return obj.target.data.subgroup === district_id
						  })
						if (link == null) {
							// e.g., Florida case, missing district 25
							return [path.centroid(d)[0], path.centroid(d)[1]];
						}
						return [0, link.target.x - offset_y];
					}).target(function(d) {
						return [path.centroid(d)[0], path.centroid(d)[1]];
					});	
		
		mapG.selectAll('.path maplink').data(state_districts)
			.enter().append('path')
			.attr('d', d => mapLinkPathGenerator(d))
			.attr("class", d => "path districtmap maplink " + level)
			.attr('fill', 'none')
			.attr('stroke', 'black')
			.style("stroke-width", "1px")
			.attr("stroke-opacity", 0.3);

	  }

  };