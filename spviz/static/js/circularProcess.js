function CircularProgress(element, settings){
	var duration = settings.duration || 500;
	var w = settings.width || 50;
	var h = settings.height || w;
	var outerRadius = settings.outerRadius || w/2;
	var innerRadius = settings.innerRadius || (w/2) * (80/100);
	var range = settings.range || {min: 0, max: 100};
	var fill = settings.fill || "#F20100";
	var formatText = d3.format(',%');

	var svg = d3.select(element)
		.append("svg")
			.attr("width", w)
			.attr("height", h);
	
	var arc = d3.svg.arc()
			.innerRadius(innerRadius)
			.outerRadius(outerRadius);
	
	var paths = function(numerators) {
		return numerators.map(function(numerator){
			var degrees = ((numerator - range.min) / (range.max - range.min)) * 360.0;
			var radians = degrees * (Math.PI / 180);
			var data = {value: numerator, startAngle: 0, endAngle: radians};
			return data;
		});
	}
	
	var g = svg.append('g').attr('transform', 'translate(' + w / 2 + ',' + h / 2 + ')');
	
	//initialise the control
	g.datum([0]).selectAll("path")
		.data(paths)
	.enter()
		.append("path")
		.attr("fill", fill)
		.attr("d", arc)
	.each(function(d){ this._current = d; });
	
	svg.datum([0]).selectAll("text")
		.data(paths)
	.enter()
		.append("text")
		.attr("transform", "translate(" + w/2 + ", " + h/1.7 + ")")
		.attr("text-anchor", "middle")
		.text(function(d){return d.value});
	
	this.update = function(percent) {
		g.datum(percent).selectAll("path").data(paths).transition().duration(duration).attrTween("d", arcTween);
		svg.datum(percent).selectAll("text").data(paths).text(function(d){return formatText(d.value/100);});
	};
	
	var arcTween = function(initial) {
		var interpolate = d3.interpolate(this._current, initial);
		this._current = interpolate(0);
		return function(t) {
			return arc(interpolate(t));
		};
	}
};