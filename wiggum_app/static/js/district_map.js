const districtStateMap = (selection, props) => {
	const {
		chart_data,
		width,
		height,
		level,
		splitby
	} = props;

	var mapG = selection.append("g")
				.attr("class", level + " districtmap")
				.attr("width", width)
				.attr("height", height);

	const projection = d3.geoMercator();	
	const path = d3.geoPath().projection(projection);
	const map_file = "../static/map_data/ok_" + splitby + ".json";

	// TODO Async issue for d3.json----------------->
	for (var i = 0; i < chart_data.length; i++){
		var node_data = chart_data[i];

		var nodeG = d3.select('.level-3'+ '.' + node_data.dependent 
		+ '.' + node_data.independent + '.splitby_' + node_data.splitby
		+ '.subgroup_' + node_data.subgroup);

		nodeG.append("g")
			.attr("class", level + " singledistrictmap"
					+ " " + node_data.dependent + " " + node_data.independent
					+ " splitby_" + node_data.splitby + " subgroup_" + node_data.subgroup)
			.attr("width", 20)
			.attr("height", 20)
			.attr("transform", "translate(-10, -10)");
	}
	// Async issue for d3.json<-----------------

	/*d3.queue()
		//.defer(d3.json, "../static/map_data/ok_district2010_test.json")
		//.defer(d3.json, "../static/map_data/tx_2020.json")
		.defer(d3.json, map_file)
		.await(ready);

	function ready(error, state_districts) {
		if (error) throw error;
*/
/*const test_func = async () => {
	const geoData = await d3.json(map_file);
  
	var testG = selection
	  .append('g')
	  .attr('class', level + ' districtmap')
	  .attr('width', width)
	  .attr('height', height);
	testG.append('g').attr('class', 'test');
  
  };
  
  await test_func();
  var test = d3.selectAll('.test');
  console.log(test);*/

	d3.json(map_file).then(function(state_districts) {
		
		// For solving winding order issus
		var features = state_districts.features;

		var districts_fixed = features.map(function(f) {
			return turf.rewind(f,{reverse:true});
		})
		// Draw nodes by district shapes
		drawNodebyShape(chart_data, districts_fixed, level);

		// Draw view portion map
		projection.fitSize([width,height],
			{"type": "FeatureCollection","features":districts_fixed})

		mapG.append("g")
			.attr("class", "districtmap districts")
			.selectAll("path")
			.data(districts_fixed)
			.enter().append("path")
			.attr("d", path)
			.style("fill", function(d) {
				var district_id = d.properties.District;
				var row = chart_data.find(obj => {
					return obj.subgroup == district_id
				  })

				if (row != null) {
					return heatmapColorScale(row.distance);
				} else {
					return '#fff';
				} 
			})
			.attr("stroke", "black");
	});
	
	function drawNodebyShape(chart_data, districts_data, level) {
		selection.append('g').attr('class', 'test');
		for (var i = 0; i < chart_data.length; i++){
			var node_data = chart_data[i];
			// TODO Async issue for d3.json----------------->
			/*
			var nodeG = d3.select('.level-3'+ '.' + node_data.dependent 
			+ '.' + node_data.independent + '.splitby_' + node_data.splitby
			+ '.subgroup_' + node_data.subgroup);

			var districtMapG = nodeG.append("g")
				.attr("class", level + " singledistrictmap"
						+ " " + node_data.dependent + " " + node_data.independent
						+ " splitby_" + node_data.splitby + " subgroup_" + node_data.subgroup)
				.attr("width", 20)
				.attr("height", 20)
				.attr("transform", "translate(-10, -10)");
			*/
			// TODO Async issue for d3.json<-----------------

			var districtMapG = d3.select('.' + level + '.singledistrictmap.'
					 + node_data.dependent + '.' + node_data.independent 
					 + '.splitby_' + node_data.splitby + '.subgroup_' + node_data.subgroup);
			
			 // Draw identity portion map
			var single_district = districts_data[i];
			var single_district = districts_data.filter(obj => {
				return obj.properties.District == node_data.subgroup
			  })

			projection.fitSize([20, 20],
				{"type": "FeatureCollection","features":single_district})

			districtMapG.append("g")
				.attr("class", "districtnode")
				.selectAll("path")
				.data(single_district)
				.enter()
				.append("path")
				.attr("d", path)
				.style("fill", '#fff')
				.style("fill", function(d) {
					var district_id = d.properties.District;
					var row = chart_data.find(obj => {
						return obj.subgroup == district_id
					  })
	
					if (row != null) {
						return heatmapColorScale(row.distance);
					} else {
						return '#fff';
					} 
				})				
				.attr("stroke", "black");				
		}

	}

};

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
				//console.log(chart_data);
				//console.log(d);
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