/**
 * Draw map
 * 
 * @param data - result table.
 * @returns none.
*/
function drawMap(data) {
	var width = 300,
		height = 300;

	var svg = d3.select('#map')
				.append('svg')
				.attr("width", width)
				.attr("height", height);

	const projection = d3.geoMercator();		
	//const projection = d3.geoAlbersUsa();				
	//const projection = d3.geoAlbersUsa().scale(1280)
    //						.translate([width / 2, height / 2]);
	const path = d3.geoPath().projection(projection);



	d3.queue()
		.defer(d3.json, "../static/map_data/us.json")
		.defer(d3.json, "../static/map_data/us-congress-113.json")
		.await(ready);

	function ready(error, us, congress) {
		if (error) throw error;

		const state_id = 12;
		const states = topojson.feature(us, us.objects.states);
		const state = states.features.filter(function(d) { return d.id === state_id; })[0];
		//console.log(us);
		projection.scale(1)
				.translate([0, 0]);
		var b = path.bounds(state),
		s = 0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
		t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
	 
	  	projection.scale(s)
			.translate(t);

		const districts = topojson.feature(congress, congress.objects.districts);
		const state_districts = districts.features.filter(function(d) { return checkprefix(d.id, state_id) ; });

		svg.append("g").append("path")
			.attr("id", "state")
			.datum(state)
			.attr("d", path)
			.attr("fill", "lightgreen");

		svg.append("g")
			.attr("class", "districts")
			.selectAll("path")
			.data(state_districts)
			.enter().append("path")
			.attr("d", path)
			.attr("fill", "yellow")
			.attr("stroke", "black");			
	  
//		svg.append("g")
//			.attr("class", "districts")
//		  	.selectAll("path")
//			  .datum(state_districts)
//			  .attr("d", path);
//		  	.data(state_districts)
//			.data(topojson.feature(congress, congress.objects.districts).features)
//		  .enter().append("path")
//			.attr("d", path);
	  
//		svg.append("path")
//			.attr("class", "district-boundaries")
//			.datum(topojson.mesh(state_districts, state_districts, function(a, b) { return a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0); }))
//			.attr("d", path);
 
//		svg.append("path")
//			.attr("class", "state-boundaries")
//			.datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
//			.attr("d", path);
	  }
	  
}


/**
 * Check Prefix
 * 
 * @param a - a number.
 * @param b - a number.* 
 * @returns true/false.
*/
function checkprefix(a, b)
{     
    var s1 = a.toString();
    var s2 = b.toString();
     
    var n1 = s1.length;
    var n2 = s2.length;

    if (n2 != (n1-2))
    {
        return false;
    }
   
    for(var i = 0; i < n2; i++)
    {
        if (s1[i] != s2[i])
        {
            return false;
        }
    }
    return true;
}
   

/**
 * Draw map
 * 
 * @param data - result table.
 * @returns none.
*/
function drawMap1(data) {
	
	var svg = d3.select('#map')
				.append('svg')
				.attr("width", 960)
				.attr("height", 500);

	const projection = d3.geoAlbersUsa().scale(1000);
	const pathGenerator = d3.geoPath().projection(projection);

	d3.json("../static/map_data/precincts-with-results.geojson", function(json_data){
		console.log(json_data);
//		const counties = topojson.feature(json_data, json_data.objects.counties);

//		const states = topojson.feature(json_data, json_data.objects.states);
//		const state = states.features.filter(function(d) { return d.id === '40'; });

		svg.selectAll("path")
//		.data(state)
		.data(json_data.features)
		.enter()
		.append("path")
		.attr('class', 'country')
		.attr("d", pathGenerator);


//		svg.selectAll('path')
//			.data(counties.features)
//			.enter().append('path')
//			.attr('class', 'country')
//			.attr('d', pathGenerator);

	});
}

/**
 * Draw map
 * 
 * @param data - result table.
 * @returns none.
*/
function drawMapState(data) {

	var svg = d3.select('#map')
				.append('svg')
				.attr("width", 960)
				.attr("height", 500);

	//const projection = d3.geoAlbersUsa().scale(1500);
	const projection = d3.geoAlbersUsa();
	const pathGenerator = d3.geoPath().projection(projection);

	//d3.json("../static/map_data/ok_2010_congress_2011-05-10_2021-12-31.json", function(json_data){
	d3.json("../static/map_data/OKLAHOMA_district2010.json", function(json_data){
	//d3.json("../static/map_data/tx_2010_congress_2011-07-18_2012-02-28.json", function(json_data){
	//d3.json("../static/map_data/tx_2020_congress_2021-10-25_2031-06-30.json", function(json_data){

//		const counties = topojson.feature(json_data, json_data.objects.counties);

//		const states = topojson.feature(json_data, json_data.objects.states);
//		const state = states.features.filter(function(d) { return d.id === '40'; });
		/*var width = 200;
		var height = 100;
		projection.scale(1)
				.translate([0, 0]);
		var b = pathGenerator.bounds(json_data),
		s = 0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
		t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
	    
	  	projection.scale(s)
			.translate(t);
*/
		svg.selectAll("path")
//		.data(state)
		.data(json_data.features)
		.enter()
		.append("path")
		.attr("d", pathGenerator)
		.attr("fill", "none")
		.attr("stroke", "black");
		//.attr("stroke-width", "1px");


//		svg.selectAll('path')
//			.data(counties.features)
//			.enter().append('path')
//			.attr('class', 'country')
//			.attr('d', pathGenerator);

	});
}