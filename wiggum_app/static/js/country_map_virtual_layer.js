const country_map_virtual_layer = (selection, props) => {
	const {
	  side,
	  level
	} = props;

	d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
		.then(geojson => {

		var selectionLevelG1;
		var interval = 0;
		var poistion_y = 0;
		var splitby;
		var dependent;
		var independent;
		var subgroup;

		selection.each(function (d) {
			// Reset for a different branch
			if (dependent != d.data.dependent
					|| independent != d.data.independent
					|| splitby != d.data.splitby) {
				selectionLevelG1 = null;
				poistion_y = 0;
				interval = 0;
			}

			dependent = d.data.dependent;
			independent = d.data.independent;
			splitby = d.data.splitby;
			subgroup = d.data.subgroup;

			// TODO hardcode to exit
			if (splitby != "importer" && splitby != "exporter") {
				return;
			}

			if (selectionLevelG1 == null) {
				selectionLevelG1 = d3.select(this);
			}

			var mapG = d3.select("." + level + ".countrymap" 
							+ "." + dependent + "." + independent + "." + splitby);

			map_width = mapG.attr('width');
			map_height = mapG.attr('height');

			var projection = d3.geoEquirectangular()
			// const projection = d3.geoMercator()
				.center([-90, 0])
				.translate([map_width / 2, map_height / 2]);

			// Filter for the Western Hemisphere
			var country = geojson.features.filter(feature => {
				return feature.id === subgroup
			});

			// Adjust the size for Western Hemisphere
			// Filter for the Western Hemisphere
			const westernHemisphere = geojson.features.filter(feature => {
				return countriesToFilter.includes(feature.properties.name)
			});
			projection.fitSize([map_width*0.9, map_height*0.9],
				{type:"FeatureCollection","features":westernHemisphere});

			var coordinates = country[0].geometry.coordinates;

			//var contiguousUS;
			if (subgroup == 'USA') {
				coordinates = country[0].geometry.coordinates.filter(function(coords) {
					// Alaska and Hawaii are typically separate polygons in the U.S. feature
					// You can identify them by their bounding boxes or properties
					var bbox = d3.geoBounds({ type: "Polygon", coordinates: coords });
					var isAlaska = bbox[0][0] < -140 && bbox[0][1] > 50; // Rough bounding box for Alaska
					var isHawaii = bbox[0][0] < -140 && bbox[0][1] > 18; // Rough bounding box for Hawaii
					return !isAlaska && !isHawaii; // Exclude Alaska and Hawaii
				  });
			}

			function getArrayDepth(value) {
				return Array.isArray(value) ? 
					1 + Math.max(0, ...value.map(getArrayDepth)) :
					0;
			}

			// convert to 2d array
			var depth = getArrayDepth(coordinates);
			var coordinate_array = [];
			if (depth == 3) {
				// e.g., Mexico
				coordinate_array = coordinates[0];
			} else if(depth == 4) {
				// e.g., Canada, U.S.
				for (let i = 0; i < coordinates.length; i++) {
					for (let j = 0; j < coordinates[i].length; j++) {
						coordinate_array.push(...coordinates[i][j]); 
					}
				}
			}

			var hull = d3.polygonHull(coordinate_array);
			const path = d3.geoPath().projection(projection);

			const geoJSONTest = {
				"type": "Feature",
				"geometry": {
					"type": "Polygon",
					"coordinates": [hull] 
				},
				"properties": { "name": subgroup }
			};

			const leftTopPoint = findLeftTopPoint(geoJSONTest);
			const bottomRightPoint = findBottomRightPoint(geoJSONTest);

			var rectWidth = 20
			var rectHeight = 20;

			var virtual_layer_g = selectionLevelG1.append("g")
								.attr("class", level + " " + side + " countrymap virtuallayer " + subgroup)
								.attr("transform", "translate(" + (rectWidth + 50) + "," + (-rectHeight) + ")");

			virtual_layer_g.append("path")
				.attr("d", path(geoJSONTest))
				.style("stroke", "black")
				.style("fill", "none");

			var [leftTopPoint_x, leftTopPoint_y] = projection(leftTopPoint);

			// Draw Right-Bottom Corner Point
			virtual_layer_g.append("circle")
				.attr("cx", leftTopPoint_x)
				.attr("cy", leftTopPoint_y)
				.attr("r", 3)
				.attr("fill", "yellow")
				.style("stroke", "black");

			const [bottomRightPoint_x, bottomRightPoint_y] = projection(bottomRightPoint);

			// Draw Right-Bottom Corner Point
			virtual_layer_g.append("circle")
				.attr("cx", bottomRightPoint_x)
				.attr("cy", bottomRightPoint_y)
				.attr("r", 3)
				.attr("fill", "red")
				.style("stroke", "black");

			var selectionLevelG = d3.select(this);

			var transformMatrix = selectionLevelG.node().getCTM();
			
			if (interval != 0) {
				interval = transformMatrix.f - interval;
			}
			poistion_y += interval;

			// Draw curve area
			var curve_point = [
				{ start1: { x: -(rectWidth/2 + 50), y: 10 + poistion_y }, 
					start2: { x: -(rectWidth/2 + 50), y: 30 + poistion_y }, 
					end1: { x: leftTopPoint_x, y: leftTopPoint_y }, 
					end2: { x: bottomRightPoint_x, y: bottomRightPoint_y } }
			];

			interval = transformMatrix.f;

			// Bézier curve
			var area = virtual_layer_g.selectAll(".area")
							.append("g")
							.attr("class", level + " countrymap virtuallayer area " + subgroup)
							.data(curve_point)
							.enter()
							.append("path")
							.attr("d", d => `
								M${d.start1.x},${d.start1.y}
								C${(d.start1.x + d.end1.x) / 2},${d.start1.y} ${(d.start1.x + d.end1.x) / 2},${d.end1.y} ${d.end1.x},${d.end1.y}
								L${d.end2.x},${d.end2.y}
								C${(d.start2.x + d.end2.x) / 2},${d.end2.y} ${(d.start2.x + d.end2.x) / 2},${d.start2.y} ${d.start2.x},${d.start2.y}
								Z
							`)
							.attr("fill", "#8da0cb")
							.attr("opacity", 0.5);

			area.on("mouseover", function () {
					d3.select(this).attr("opacity", 0.8)
					.attr("fill", "#fdbf6f"); 
				})
				.on("mouseout", function () {
					d3.select(this).attr("opacity", 0.5)
					.attr("fill", "#8da0cb"); 
				});

			// Bring the first node text to front
			selectionLevelG1.select(".text")
				.raise();
			
		});
	})

}

function findLeftTopPoint(geojson) {
    let leftTop = null;

    geojson.geometry.coordinates[0].forEach(point => {

        if (
            !leftTop || 
            point[0] < leftTop[0] || 
            (point[0] === leftTop[0] && point[1] > leftTop[1])
        ) {
            leftTop = point;
        }
    });

    return leftTop;
}

function findBottomRightPoint(geojson) {
    let bottomRight = null;

    geojson.geometry.coordinates[0].forEach(point => {
        if (
            !bottomRight || 
            point[1] < bottomRight[1] || 
            (point[1] === bottomRight[1] && point[0] > bottomRight[0])
        ) {
            bottomRight = point;
        }
    });

    return bottomRight;
}

function findRightBottomPoint(geojson) {
    let rightBottom = null;

    geojson.geometry.coordinates[0].forEach(point => {
        if (
            !rightBottom || 
            point[0] > rightBottom[0] || 
            (point[0] === rightBottom[0] && point[1] < rightBottom[1])
        ) {
            rightBottom = point;
        }
    });

    return rightBottom;
}

