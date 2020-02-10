var colorMap;
var selectValue;
var correlationMatrix;
var correlationMatrixSubgroup = [];
var conAttrs;
var catAttrs;
var categoryValuesList;
var labels;
var csvData;
var legendValue;
var selectTypeValue;
var targetAttr;
var target_var_type;
var groupingAttrs;
var rateRowLabels;
var rateColLabels;
var arraySlopeGraph = [];
var rateRowVars;
var rateMatrixIndex;
var rateColKeys;
// Default, change by user input in TODO work
var legendAdjustValue = 0.05;
var autoDetectFlag = 0;
var autoDetectResult;
// for ratio
var rateTrendMatrixAll;
var rateTrendMatrixSub = [];
var protectedAttrs;
var explanaryAttrs;
var rateAllSlopeGraph = [];
var rateAllKeySlopeGraph = [];
var rateSubSlopeGraph = [];
var rateSubKeySlopeGraph = [];
var tableRecords;
var ranking = {};
var tableColumns = [];
var updateVars;
var weightingAttr;
var threshold;
var agg_type;
var server_data;

// For table components
var feat1_options = [];
var feat2_options = [];
var group_feat_options = [];
var subgroup_options = [];
var trend_type_options = [];
var feat1_selected = [];
var feat2_selected = [];
var group_feat_selected = [];
var subgroup_selected = [];
var trend_type_selected = [];
var subgroup_trend_strength = 0;
var agg_trend_strength = 0;
var distance = 0;
var subgroup_trend_strength_default = 0;
var agg_trend_strength_default = 0;
var distance_default = 0;
var rankTrendLegendFlg = true;

var selectData = ["Sequential 3x3", "Diverging 3x3", "Diverging 5x5"];
var selectLegendTypeData = ["pearson_corr", "rank_trend"];

var selectLegendType = d3.select("#legendTypeSelector")
					.append('select')
					.attr('class','select')
					.on('change',onlegendtypechange);
	
var optionsType = selectLegendType.selectAll('option')
					.data(selectLegendTypeData).enter()
					.append('option')
					.text(function (d) { return d; });	

var select = d3.select("#selectors")
				.append('select')
				.attr('class','select')
				.on('change',onchange);

var options = select.selectAll('option')
					.data(selectData).enter()
					.append('option')
					.text(function (d) { return d; });	


					
d3.select("#controlbuttons").append("button")
							.attr("id", "filter-btn")
							.attr("type", "button")
							.attr("value", "filter")
							.text("Filter")
							.attr("onclick", "filter_button()"); 	
d3.select("#controlbuttons").append("button")
							.attr("id", "detect-btn")
							.attr("type", "button")
							.attr("value", "detect")
							.text("Detect")
							.attr("onclick", "detect_button()"); 																		
//d3.select("#controlbuttons").append('br');
d3.select("#controlbuttons").append("button")
							.attr("id", "reset-btn")
							.attr("type", "button")
							.attr("value", "reset")
							.text("Reset")
							.attr("onclick", "reset_button()");		

// agg type selector	
// add options
var optionData = ['mean', 'min', 'max', 'sum'];
var select = d3.select("#ranking").append('select')
							.attr('id','agg_type_selector');
var options = select.selectAll('option')
					.data(optionData).enter()
					.append('option')
					.text(function(d){return d;});

// View Score Selector	
// view options
//var optionData = ['distance', 'SP'];
var optionData = ['distance'];
var select = d3.select("#ranking").append('select')
							.attr('id','view_score_selector');
var options = select.selectAll('option')
					.data(optionData).enter()
					.append('option')
					.text(function(d){return d;});

// rank button
d3.select("#ranking").append("button")
					.attr("id", "rank-btn")
					.attr("type", "button")
					.attr("value", "rank")
					.text("Rank")
					.attr("onclick", "rank_button()"); 	

d3.select("#controlbuttons").append('br');
d3.select("#controlbuttons").append('br');			
d3.select("#controlbuttons").append('br');		
d3.select("#controlbuttons").append('input')
		.attr('type','text')
		.attr('id','projectName')
		.attr('placeholder', 'Project Name');
d3.select("#controlbuttons").append("button")
							.attr("id", "save-btn")
							.attr("type", "button")
							.attr("value", "save")
							.text("Save")
							.attr("onclick", "save_button()"); 	
d3.select("#controlbuttons").append("text")			
														.attr("id", "save-label")

function setSelectedOptions() {
	var feat1_selector = document.getElementById("feat1_selector");
	var feat2_selector = document.getElementById("feat2_selector");
	var group_feat_selector = document.getElementById("group_feat_selector");
	var subgroup_selector = document.getElementById("subgroup_selector");    
	var trend_type_selector = document.getElementById("trend_type_selector");   

	feat1_selected = getSelectValues(feat1_selector);
	feat2_selected = getSelectValues(feat2_selector);
	group_feat_selected = getSelectValues(group_feat_selector);
	subgroup_selected = getSelectValues(subgroup_selector);
	trend_type_selected = getSelectValues(trend_type_selector);    
}

function onchange() {

	selectValue = d3.select(this).property('value');

	legendValue = -1;
	d3.select("#legend").selectAll('svg').remove();

	DrawLegend();

	drawGraph(server_data);

};

function onlegendtypechange() {

	selectTypeValue = d3.select(this).property('value');

	d3.select("#legend").selectAll('svg').remove();
	DrawLegend();
};

function updateTextInput(id, val) {
	document.getElementById(id+'_label').innerText=val + "%"; 
}

function updateNumberInput(id, val) {
	if (selectTypeValue == "pearson_corr") {
		document.getElementById(id+'_number').value=val;

		var event = new Event('change');
		document.getElementById(id+'_number').dispatchEvent(event);
	} else {
		document.getElementById(id+'_number_rate').value=val;

		var event = new Event('change');
		document.getElementById(id+'_number_rate').dispatchEvent(event);
	}
}

function getSelectValues(select) {
	var result = [];
	var options = select && select.options;
	var opt;

	for (var i=0, iLen=options.length; i<iLen; i++) {
	opt = options[i];

	if (opt.selected) {
		result.push(opt.text);
	}
	}
	return result;
}

function getBinaryAttrs(data, attrs){
	var binaryAttrs = [];
	var groupAttrs = [];
	var flag;

	attrs.forEach(function(name) {
		flag = true;
		for (var i=0; i < data.length; i++) {
			if (data[i][name] == 0 || data[i][name] == 1) {
				flag = true;
			}
			else {
				flag = false;
				break;
			}
		}

		if (flag == true){
			binaryAttrs.push(name);
		} else {
			groupAttrs.push(name);
		}
	});
	return [binaryAttrs, groupAttrs];
}

function updateContainer() {
	if (correlationMatrixSubgroup.length == 0) {
		return;
	}

	d3.select("#container").selectAll('svg').remove();

	for (var i = 0; i < correlationMatrixSubgroup.length; i++){
		var bivariateMatrix = BivariateMatrix(correlationMatrix, correlationMatrixSubgroup[i]);
		var subgroupLabel = categoryValuesList[i].groupby +": "+ categoryValuesList[i].value;

		Matrix({
			container : '#container',
			data      : UpdateMatrixFormat(bivariateMatrix, labels, categoryValuesList[i], 'pearson_corr'),
			labels    : labels,
			subLabel  : subgroupLabel
		});
	}

	d3.select("#tree").selectAll('svg').remove();
	DrawTree(
		{
			data         : csvData,
			matrixAll    : correlationMatrix,
			matrixGroups : correlationMatrixSubgroup,
			catAttrs     : catAttrs,
			cateAttrInfo : categoryValuesList,
			labels       : labels
		}
	);

	// Cell Click Event
	d3.select(container).selectAll(".cell")
	.on("click", clickMatrixCell);	

	// Cell Click Event
	d3.select(container).selectAll(".cell")
		.on("dblclick", doubleClickMatrixCell);		
}

function doubleClickMatrixCell(){	
	d3.select("#container").selectAll('.cell').classed("clicked", false);
	d3.selectAll('.elm').transition().style('opacity', 1);
	d3.selectAll('.dot').transition().style('opacity', 0.6);
};

function updateRateSPContainer(slopeKey) {

	//d3.select("#container").selectAll('svg').remove();

	arraySlopeGraph[slopeKey] = [];

	rateMatrixIndex = 0;

	var temp = rateTrendMatrixSub.length/rateAllSlopeGraph.length;

	var index = 0;
	var index_explanary = 0;
	var protectedAttr_current, explanaryAttrs_current;
	for (var i = 0; i < rateTrendMatrixSub.length; i++){
		// Prepare for Slope Graph
		arraySlopeGraph[slopeKey][rateMatrixIndex] = [];
		// Construct Slope Graph array for ALL--------->
		arraySlopeGraph[slopeKey][rateMatrixIndex] = [];
		var singleObj = {};

		index = Math.floor(i/temp);

		protectedAttr_current = protectedAttrs[index];
		explanaryAttrs_current = explanaryAttrs.filter(item => item !== protectedAttr_current)
		for (var j = 0; j < rateAllSlopeGraph[index].length; j++){
			singleObj[rateAllKeySlopeGraph[index][j]] = precisionRound(rateAllSlopeGraph[index][j], 3);
		}
		index_explanary = i%temp;
		singleObj[explanaryAttrs_current[index_explanary]] = 'ALL';
		arraySlopeGraph[slopeKey][rateMatrixIndex].push(singleObj);
		// <-------------------------------------

		// Construct Slope Graph array for subgroups--------->
		rateColKeys = [];

		for (var j = 0; j < rateColLabels[i].length; j++){
			var singleObj = {};
			var keyObj = rateColLabels[i][j]

		  	for (var k = 0; k < rateSubSlopeGraph[i].length; k++){
				singleObj[rateSubKeySlopeGraph[i][k]] = precisionRound(rateSubSlopeGraph[i][k][keyObj], 3);
		  	}
  
		  	singleObj[explanaryAttrs_current[index_explanary]] = rateColLabels[i][j];
			arraySlopeGraph[slopeKey][rateMatrixIndex].push(singleObj);
			  
			rateColKeys.push(j);
		}	

		// <-------------------------------------

		var bivariateMatrix = rateBivariateMatrix(rateTrendMatrixAll[index], rateTrendMatrixSub[i]);

		var subgroupLabel = protectedAttr_current + ' - ' + explanaryAttrs_current[index_explanary];

		rateSPMatrix({
			container : '#container',
			data      : UpdateRateMatrixFormat(bivariateMatrix, rateColKeys, 
							rateRowVars[i], explanaryAttrs_current[index_explanary], rateMatrixIndex, 
							protectedAttr_current, weightingAttr, targetAttr, target_var_type, rateColLabels[i], "rank_trend", slopeKey),
			rowLabels : rateRowLabels[i],
			colLabels : rateColLabels[i],
			subLabel  : subgroupLabel
		});

		rateMatrixIndex =  rateMatrixIndex + 1;

	}

	// Cell Click Event
	d3.select(container).selectAll(".ratecell")
		.on("click", clickRateMatrixCell);	

	// Double click event: Reset
	d3.select(container).selectAll(".ratecell")
		.on("dblclick", doubleClickRateMatrixCell);		
}

/**
 * Constructs a bivariate matrix.
 *
 *  Parameters
 *  options: contain, data, labels, subLabel 
 * 
 */
function Matrix(options) {

	var margin = {top: 63, right: 30, bottom: 30, left: 63},
	    width = 90,
	    height = 90,
	    data = options.data,
	    container = options.container,
		labelsData = options.labels,
		subLabel = options.subLabel;

	if(!data){
		throw new Error('Please pass data');
	}

	if(!Array.isArray(data) || !data.length || !Array.isArray(data[0])){
		throw new Error('It should be a 2-D array');
	}

    var maxValue = d3.max(data, function(layer) { return d3.max(layer, function(d) { return d; }); });
    var minValue = d3.min(data, function(layer) { return d3.min(layer, function(d) { return d; }); });

	var numrows = data.length;
	var numcols = data[0].length;

	var svg = d3.select(container).append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);

	var corrPlot = svg.append("g")
		.attr("id", "corrPlot")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var x = d3.scale.ordinal()
	    .domain(d3.range(numcols))
	    .rangeBands([0, width]);

	var y = d3.scale.ordinal()
	    .domain(d3.range(numrows))
	    .rangeBands([0, height]);

	var row = corrPlot.selectAll(".row")
	    .data(data)
		.enter().append("g")
	    .attr("class", "row")
	    .attr("transform", function(d, i) { return "translate(0," + y(i) + ")"; });

	var cells = row.selectAll(".cell")
	    .data(function(d) { return d; })
		.enter()
		.append("rect")	
		.attr("class", "cell")
		.attr("id", function(d) {return d.colVar + "_" + d.rowVar + "_" + d.categoryAttr + "_" + d.category})
	    .attr("transform", function(d, i) { return "translate(" + x(i) + ", 0)"; });

	cells.attr("width", x.rangeBand()-1)
	    .attr("height", y.rangeBand()-1)
	    .style("stroke-width", "1px")
//		.style("opacity", 1e-6)
    	.transition()
//		.style("opacity", 1)
		.style("fill", function(d, i) {return colorMap[d.value]; });

	cells.style("opacity", 0.1)
		.filter(function(d){
			if (legendValue != -1) {
				if (autoDetectFlag != 0) {
					if (isEmpty(ranking)) {
						return d.value == legendValue && d.autoDetectFlg == 1; 
					} else {
						return d.value == legendValue && d.autoDetectFlg == 1 && d.colVar == ranking.feat1 && 
							d.rowVar == ranking.feat2 && d.categoryAttr == ranking.group_feat;
					}					
				} else if (!isEmpty(ranking)) {
					return d.value == legendValue && d.colVar == ranking.feat1 && 
						d.rowVar == ranking.feat2 && d.categoryAttr == ranking.group_feat;					
				} else {
					return d.value == legendValue;
				}
			} else if (autoDetectFlag != 0) {
				if (isEmpty(ranking)) {
					return d.autoDetectFlg == 1; 
				} else {
					return d.autoDetectFlg == 1 && d.colVar == ranking.feat1 && 
						d.rowVar == ranking.feat2 && d.categoryAttr == ranking.group_feat;; 
				}
			} else if (!isEmpty(ranking)) {
				return d.colVar == ranking.feat1 && d.rowVar == ranking.feat2 && d.categoryAttr == ranking.group_feat;
			} else 
			{
				return d;
			}					
		})
		.style("opacity", 1);

	corrPlot.append("text")
        .attr("x", (width / 2))             
        .attr("y", height + (margin.bottom / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")  
        .text(subLabel);

	var labels = corrPlot.append('g')
		.attr('class', "labels");

	var columnLabels = labels.selectAll(".column-label")
	    .data(labelsData)
	    .enter().append("g")
	    .attr("class", "column-label")
	    .attr("transform", function(d, i) { return "translate(" + x(i) + "," + 0 + ")"; });

	columnLabels.append("line")
		.style("stroke", "black")
	    .style("stroke-width", "1px")
	    .attr("x1", x.rangeBand() / 2)
	    .attr("x2", x.rangeBand() / 2)
	    .attr("y1", 0)
		.attr("y2", -5);
		
	var yAttr = x.rangeBand()/numcols/2 + 3;
	columnLabels.append("text")
	    .attr("x", x.rangeBand() - 15)
	    .attr("y", yAttr)
	    .attr("dy", ".82em")
	    .attr("text-anchor", "start")
	    .attr("transform", "rotate(-90)")
		.text(function(d, i) { return d; })
		.style("font-size", "10px");

	var rowLabels = labels.selectAll(".row-label")
	    .data(labelsData)
	  .enter().append("g")
	    .attr("class", "row-label")
	    .attr("transform", function(d, i) { return "translate(" + 0 + "," + y(i) + ")"; });

	rowLabels.append("line")
		.style("stroke", "black")
	    .style("stroke-width", "1px")
	    .attr("x1", 0)
	    .attr("x2", -5)
	    .attr("y1", y.rangeBand() / 2)
	    .attr("y2", y.rangeBand() / 2);

	rowLabels.append("text")
	    .attr("x", -8)
	    .attr("y", y.rangeBand() / 2)
	    .attr("dy", ".32em")
	    .attr("text-anchor", "end")
		.text(function(d, i) { return d; })
		.style("font-size", "10px");	
}

var UpdateLegendMatrixFormat = function(matrix, vars, category) {
	matrix.forEach(function(row, i) {
		row.forEach(function(cell, j) {
		
			matrix[i][j] = {
					color: cell,
					value: (matrix.length - i - 1) * matrix.length + j
				};
		});
	});
	return matrix;
};

/**
 * Draw slider for changing the range
 *
 * @param none.
 * @returns none.
 */
function DrawSlider(){		
	// Draw slider
	var sliderWidth = 120;
	var sliderHeight = 30;
	var slider_x = d3.scale.linear()
				.domain([0, 1])
				.range([0, sliderWidth])
				.clamp(true);

	var dispatch = d3.dispatch("sliderChange");

	var slider = d3.select(".slider")
		.style("width", sliderWidth + "px")
		.style("height", sliderHeight + "px");

	var sliderTray = slider.append("div")
		.attr("class", "slider-tray");

	var sliderHandle = slider.append("div")
		.attr("class", "slider-handle");

	sliderHandle.append("div")
		.attr("class", "slider-handle-icon")

	// Initial Slider Handle
	sliderHandle.style("left", slider_x(legendAdjustValue) + "px");

	slider.call(d3.behavior.drag()
		.on("dragstart", function() {
		dispatch.sliderChange(slider_x.invert(d3.mouse(sliderTray.node())[0]));
		d3.event.sourceEvent.preventDefault();
		})
		.on("drag", function() {
		dispatch.sliderChange(slider_x.invert(d3.mouse(sliderTray.node())[0]));
		}));	

	slider.append("text")
		.attr("class", "slider-text")
		.attr("id", "slidetext")
		.style("font-size", "12px")
		.text("0.05");

	dispatch.on("sliderChange.slider", function(value) {
		sliderHandle.style("left", slider_x(value) + "px");

		legendAdjustValue = value.toFixed(2);
		slider.select("#slidetext")
			.text(value.toFixed(2));
		
		// Redraw Legend
		legendValue = -1;
		d3.select("#legend").selectAll('svg').remove();
		DrawLegend();	

		drawGraph(server_data);

	});
}

/**
 * Draw bivariate matrix legend
 *
 * @param none.
 * @returns none.
 */
function DrawLegend() {

	var margin = {top: 63, right: 50, bottom: 120, left: 63},
	width = 120,
	height = 120;
	var colorMap4Legend;
	
	selectValue = d3.select("#selectors").select('select').property('value');

	if (selectValue == 'Sequential 3x3'){
		colorMap4Legend = [
			["#be64ac", "#8c62aa", "#3b4994"], 
			["#dfb0d6", "#a5add3", "#5698b9"], 
			["#e8e8e8", "#ace4e4", "#5ac8c8"]
			];
	} else if(selectValue == 'Diverging 3x3') {
		colorMap4Legend = [
			["#008d61", "#79bb4e", "#946a00"], 
			["#00c4f2", "#ffffff", "#ff8364"],
			["#007fff", "#c693ff", "#e80081"]
			];
	} else if(selectValue == 'Diverging 5x5') {
		colorMap4Legend = [
			["#008d61", "#00b264", "#79bb4e", "#9c9f00", "#946a00"], 
			["#00b6b4", "#64ebcd", "#dafac1", "#f7d081", "#dd831a"], 
			["#00c4f2", "#99ffff", "#ffffff", "#ffdeca", "#ff8364"],
			["#00acff", "#8cdcff", "#ffe5ff", "#ffb5de", "#ff597f"],
			["#007fff", "#4297ff", "#c693ff", "#ee65cc", "#e80081"]
			];
	}
	
  	// draw legend
	var numrowsLegend = colorMap4Legend.length;
	var numcolsLegend = colorMap4Legend[0].length;

	colorMap = [];
	for (var i=(numrowsLegend - 1); i>=0; i--) {
		for (var j=0; j<numcolsLegend; j++) {
			colorMap.push(colorMap4Legend[i][j]);
		}
	}

	var xLegend = d3.scale.ordinal()
	    .domain(d3.range(numcolsLegend))
	    .rangeBands([0, width]);

	var yLegend = d3.scale.ordinal()
	    .domain(d3.range(numrowsLegend))
	    .rangeBands([0, height]);

	var key = d3.select("#legend")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");					

	var legendRow = key.selectAll(".legendRow")	
		.data(UpdateLegendMatrixFormat(colorMap4Legend))
		.enter()
		.append("g")
		.attr("class", "legendRow")
		.attr("transform", function(d, i) { return "translate(0," + yLegend(i) + ")"; });

	var legendCell = legendRow.selectAll(".legendCell")
		.data(function(d) {return d;})
		.enter()
		.append("rect")
		.attr("class", "legendCell")
		.attr("transform", function(d, i) { return "translate(" + xLegend(i) + ", 0)"; });
		
  	// draw legend colored rectangles
	  legendCell.attr("width", xLegend.rangeBand()-1)
	  	.attr("height", yLegend.rangeBand()-1)
		.style("fill", function(d, i) {return d.color;});	 

	// label
	var xlegendLabelsData;
	var ylegendLabelsData;

	if (selectTypeValue == "pearson_corr") {
		if ((selectValue == 'Sequential 3x3') || (selectValue == 'Diverging 3x3')){
			xlegendLabelsData = [];
//			xlegendLabelsData.push("[-1, -0.05)");
//			xlegendLabelsData.push("[-0.05, 0.05]");
//			xlegendLabelsData.push("(0.05, 1]");
			xlegendLabelsData.push("[-1, -" + legendAdjustValue+")");
			xlegendLabelsData.push("[-"+legendAdjustValue+", "+legendAdjustValue+"]");
			xlegendLabelsData.push("("+legendAdjustValue+", 1]");			
	
			ylegendLabelsData = [];
//			ylegendLabelsData.push("(0.05, 1]");	
//			ylegendLabelsData.push("[-0.05, 0.05]");
//			ylegendLabelsData.push("[-1, -0.05)");		
			ylegendLabelsData.push("(" + legendAdjustValue + ", 1]");	
			ylegendLabelsData.push("[-" + legendAdjustValue +", " + legendAdjustValue +"]");
			ylegendLabelsData.push("[-1, -" + legendAdjustValue + ")");		
//		} else if (selectValue == 'Diverging 3x3'){
//			xlegendLabelsData = [];
	
//			xlegendLabelsData.push("[-1, -0.01)");
//			xlegendLabelsData.push("[-0.01, 0.01]");
//			xlegendLabelsData.push("(0.01, 1]");
	
//			ylegendLabelsData = [];
//			ylegendLabelsData.push("(0.01, 1]");
//			ylegendLabelsData.push("[-0.01, 0.01]");
//			ylegendLabelsData.push("[-1, -0.01)");		
		} else if(selectValue == 'Diverging 5x5') {	
			xlegendLabelsData = [];
//			xlegendLabelsData.push("[-1, -0.6)");
//			xlegendLabelsData.push("[-0.6, -0.01)");
//			xlegendLabelsData.push("[-0.01, 0.01]");	
//			xlegendLabelsData.push("(0.01, 0.6]");
//			xlegendLabelsData.push("(0.6, 1]");
			
			xlegendLabelsData.push("[-1, -"+2*legendAdjustValue+")");
			xlegendLabelsData.push("[-"+2*legendAdjustValue+", -"+legendAdjustValue+")");
			xlegendLabelsData.push("[-" + legendAdjustValue+", "+legendAdjustValue+"]");	
			xlegendLabelsData.push("("+legendAdjustValue+", "+2*legendAdjustValue+"]");
			xlegendLabelsData.push("("+2*legendAdjustValue+", 1]");

			ylegendLabelsData = [];
			ylegendLabelsData.push("("+2*legendAdjustValue+", 1]");
			ylegendLabelsData.push("("+legendAdjustValue+", "+2*legendAdjustValue+"]");
			ylegendLabelsData.push("[-"+legendAdjustValue+", "+legendAdjustValue+"]");	
			ylegendLabelsData.push("[-"+2*legendAdjustValue+", -"+legendAdjustValue+")");
			ylegendLabelsData.push("[-1, -"+2*legendAdjustValue+")");		
		}
	} else {
		// rate based
		legendAdjustValue = parseFloat(legendAdjustValue);
		if ((selectValue == 'Sequential 3x3') || (selectValue == 'Diverging 3x3')){
			xlegendLabelsData = [];
			xlegendLabelsData.push("[0, "+(1-legendAdjustValue).toFixed(2)+")");
			xlegendLabelsData.push("[" + (1-legendAdjustValue).toFixed(2)+", "+(1+legendAdjustValue).toFixed(2)+"]");
			xlegendLabelsData.push("("+ (1+legendAdjustValue).toFixed(2)+", infin)");
	
			ylegendLabelsData = [];
			ylegendLabelsData.push("(" + (1+legendAdjustValue).toFixed(2)+", infin)");
			ylegendLabelsData.push("[" + (1-legendAdjustValue).toFixed(2)+", "+(1+legendAdjustValue).toFixed(2)+"]");
			ylegendLabelsData.push("[0, "+(1-legendAdjustValue).toFixed(2)+")");		
		} else if(selectValue == 'Diverging 5x5') {	
			xlegendLabelsData = [];
			xlegendLabelsData.push("[0, "+(1-2*legendAdjustValue).toFixed(2)+")");
			xlegendLabelsData.push("[" + (1-2*legendAdjustValue).toFixed(2)+", "+(1-legendAdjustValue).toFixed(2)+")");
			xlegendLabelsData.push("[" + (1-legendAdjustValue).toFixed(2)+", "+(1+legendAdjustValue).toFixed(2)+")");
			xlegendLabelsData.push("[" + (1+legendAdjustValue).toFixed(2)+", "+(1+2*legendAdjustValue).toFixed(2)+")");
			xlegendLabelsData.push("[" + (1+2*legendAdjustValue).toFixed(2)+", infin)");
	
			ylegendLabelsData = [];
			ylegendLabelsData.push("["+(1+2*legendAdjustValue).toFixed(2)+", infin)");
			ylegendLabelsData.push("["+(1+legendAdjustValue).toFixed(2)+", "+(1+2*legendAdjustValue).toFixed(2)+")");
			ylegendLabelsData.push("["+(1-legendAdjustValue).toFixed(2)+", "+(1+legendAdjustValue).toFixed(2)+")");
			ylegendLabelsData.push("["+(1-2*legendAdjustValue).toFixed(2)+", "+(1-legendAdjustValue).toFixed(2)+")");
			ylegendLabelsData.push("[0, "+(1-2*legendAdjustValue).toFixed(2)+")");	
		}
	}

	var labels = key.append('g')
		.attr('class', "labels");

	var columnLabels = labels.selectAll(".column-label")
	    .data(xlegendLabelsData)
	    .enter().append("g")
	    .attr("class", "column-label")
	    .attr("transform", function(d, i) { return "translate(" + xLegend(i) + "," + 0 + ")"; });

	columnLabels.append("line")
		.style("stroke", "black")
	    .style("stroke-width", "1px")
	    .attr("x1", xLegend.rangeBand() / 2)
	    .attr("x2", xLegend.rangeBand() / 2)
	    .attr("y1", 0)
		.attr("y2", -5);

	var yAttr = xLegend.rangeBand()/numcolsLegend;
	columnLabels.append("text")
	    .attr("x", 10)
	    .attr("y", yAttr)
	    .attr("dy", ".82em")
	    .attr("text-anchor", "start")
	    .attr("transform", "rotate(-90)")
		.text(function(d, i) { return d; })
		.style("font-size", "10px");

	var rowLabels = labels.selectAll(".row-label")
	    .data(ylegendLabelsData)
	  .enter().append("g")
	    .attr("class", "row-label")
	    .attr("transform", function(d, i) { return "translate(" + 0 + "," + yLegend(i) + ")"; });

	rowLabels.append("line")
		.style("stroke", "black")
	    .style("stroke-width", "1px")
	    .attr("x1", 0)
	    .attr("x2", -5)
	    .attr("y1", yLegend.rangeBand() / 2)
	    .attr("y2", yLegend.rangeBand() / 2);

	rowLabels.append("text")
	    .attr("x", -8)
	    .attr("y", yLegend.rangeBand() / 2)
	    .attr("dy", ".32em")
	    .attr("text-anchor", "end")
		.text(function(d, i) { return d; })
		.style("font-size", "10px");

	// draw trend labels
	var nodes = [{x:130,y:105}, {x:130,y:15}, {x:15,y:135}, {x:105,y:135}];
	var nodes4label = [{x:150,y:100}, {x:150,y:10}, {x:10,y:150}, {x:100,y:150}];
	var links = [{s:0,t:1,label:"All"}, {s:2,t:3,label:"Subgroup"}]; 	
	var nodes4Text = [{x:125,y:110,label:"-"}, {x:125,y:10,label:"+"}, {x:10,y:140,label:"-"}, {x:110,y:140,label:"+"}];
	
	key.append("svg:defs").selectAll("marker")
    .data(["arrow"])
  	.enter().append("svg:marker")
    .attr("id", String)
	.attr("viewBox", "0 -5 10 10")
	.attr("refX", 10)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("svg:path")
	.attr("d", "M0,-5 L 10,0 L 0,5")
	.attr('fill', '#bbbbbb');

	key.selectAll("#line")
    .data(links)
  	.enter()
    .append("svg:line")
    .attr("x1", function(d) { return nodes[d.s].x; })
    .attr("y1", function(d) { return nodes[d.s].y; })
    .attr("x2", function(d) { return nodes[d.t].x; })
    .attr("y2", function(d) { return nodes[d.t].y; })
	.attr("class", "link arrow")
	.attr("stroke","#bbbbbb")  
	.attr("stroke-width",2)  
	.attr("marker-end", "url(#arrow)");

	key.selectAll("#text")
    .data(links)
  	.enter()
    .append("svg:g")
    .append("svg:text")
    .text(function(d) { return d.label; })
    .attr("class", "link-label")
    .attr("text-anchor", "middle")
    .attr("transform", function(d) {
        var dx = (nodes4label[d.t].x - nodes4label[d.s].x),
            dy = (nodes4label[d.t].y - nodes4label[d.s].y);
        var dr = Math.sqrt(dx * dx + dy * dy);
        var offset = (1 - (1 / dr)) / 2;
        var deg = 180 / Math.PI * Math.atan2(dy, dx);
        var x = (nodes4label[d.s].x + dx * offset);
        var y = (nodes4label[d.s].y + dy * offset);
        return "translate(" + x + ", " + y + ") rotate(" + deg + ")";
    });

	key.selectAll(".text")
    .data(nodes4Text)
  	.enter()
    .append("svg:g")
    .append("svg:text")
    .text(function(d) { return d.label; })
	.attr("class", "node-label")	
	.attr("text-anchor", "middle")
    .attr("transform", function(d) {
		var dx = d.x,
		dy = d.y;

		var deg = 0;
        if (d.x > d.y) {
			// Vetical
			deg = 90;
		}
        return "translate(" + dx + ", " + dy + ") rotate(" + deg + ")";
	});	

	// Add Notes
	key.append("text")
	.attr("x", (width / 2))             
	.attr("y", height + margin.bottom/3+30)
	.attr("text-anchor", "middle")  
	.style("font-size", "16px") 
//	.style("text-decoration", "underline")  
//	.text("click here to focus...");
	.text("Select a cell to focus on a ");

	key.append("text")
	.attr("x", (width / 2))             
	.attr("y", height + 2*(margin.bottom/3)+10)
	.attr("text-anchor", "middle")  
	.style("font-size", "16px") 
//	.style("text-decoration", "underline")  
//	.text("click here to focus...");
	.text("subgroup-aggregate trend");	

	key.append("text")
	.attr("x", (width / 2))             
	.attr("y", height + margin.bottom-10)
	.attr("text-anchor", "middle")  
	.style("font-size", "16px") 
//	.style("text-decoration", "underline")  
//	.text("click here to focus...");
	.text("relationship type");

	// Add click event
	key.selectAll(".legendCell")
		.on("click", clickLegendCell);

	// Double click event
	key.selectAll(".legendCell").on("dblclick",doubleClickLegend);	
}

/**
 * Double click legend cell event
 *
 * @param none.
 * @returns none.
 */
function doubleClickLegend(){	
	var legendsvg = d3.select("#legend");
	legendsvg.selectAll(".legendCell").classed("clicked", false);

	legendValue = -1;

	drawGraph(server_data);

};

/**
 * Click legend cell event
 *
 * @param none.
 * @returns none.
 */
function clickLegendCell(){	
	var legendsvg = d3.select("#legend");
	legendsvg.selectAll(".legendCell").classed("clicked", false);
	var clickFlg = d3.select(this).classed("clicked", true);
	if (clickFlg) { clickFlg.call(updateCorrelationMatrix); }
};

/**
 * Update correlation matrix
 *
 * @param none.
 * @returns none.
 */
function updateCorrelationMatrix() {
	var d = this.datum();
	legendValue = d.value;

	drawGraph(server_data);
}

function BivariateMatrix(correlationMatrix, correlationMatrixSubgroup) {
	var result;

	if (selectValue == 'Sequential 3x3'){
		result = BivariateMatrixSequential3(correlationMatrix, correlationMatrixSubgroup);
	} else if (selectValue == 'Diverging 3x3'){
			result = BivariateMatrixDiverging3(correlationMatrix, correlationMatrixSubgroup);
	} else if(selectValue == 'Diverging 5x5') {	
		result = BivariateMatrixDiverging5(correlationMatrix, correlationMatrixSubgroup);
	}
	return result;
}

function BivariateMatrixSequential3(correlationMatrix, correlationMatrixSubgroup) {
	// Initial a n*n array
	var length = correlationMatrix.length;
	var bivariateMatrix = new Array(length);
	for (var i = 0; i < length; i++) {
		bivariateMatrix[i] = new Array(length);
	}

    for (var i = 0; i < length; i++){
      for (var j=0; j<length;j++){
        // Set correlationMatrix to bivariateMatrix
        if (correlationMatrixSubgroup[i][j] > legendAdjustValue) {
          bivariateMatrix[i][j] = 2;
        } else if ((correlationMatrixSubgroup[i][j] <= legendAdjustValue) && (correlationMatrixSubgroup[i][j] >= -legendAdjustValue)){
          bivariateMatrix[i][j] = 1;
        } else {
          bivariateMatrix[i][j] = 0;
        }    

        // Set correlationMatrixSubgroup to bivariateMatrix
        if (correlationMatrix[i][j] > legendAdjustValue) {
          bivariateMatrix[i][j] += 6;
        } else if ((correlationMatrix[i][j] <= legendAdjustValue) && (correlationMatrix[i][j]>=-legendAdjustValue)){
          bivariateMatrix[i][j] += 3;
        } else {
          bivariateMatrix[i][j] += 0;
        }                 
      }
	}

	return bivariateMatrix;
}

function BivariateMatrixDiverging3(correlationMatrix, correlationMatrixSubgroup) {
	// Initial a n*n array
	var length = correlationMatrix.length;
	var bivariateMatrix = new Array(length);
	for (var i = 0; i < length; i++) {
		bivariateMatrix[i] = new Array(length);
	}

    for (var i = 0; i < length; i++){
      for (var j=0; j<length;j++){
        // Set correlationMatrix to bivariateMatrix
        if (correlationMatrixSubgroup[i][j] > legendAdjustValue) {
          bivariateMatrix[i][j] = 2;
        } else if ((correlationMatrixSubgroup[i][j] <= legendAdjustValue) && (correlationMatrixSubgroup[i][j] >= -legendAdjustValue)){
			bivariateMatrix[i][j] = 1;
        } else {
          bivariateMatrix[i][j] = 0;
        }    

        // Set correlationMatrixSubgroup to bivariateMatrix
        if (correlationMatrix[i][j] > legendAdjustValue) {
          bivariateMatrix[i][j] += 6;
        } else if ((correlationMatrix[i][j] <= legendAdjustValue) && (correlationMatrix[i][j] >= -legendAdjustValue)){
			bivariateMatrix[i][j] += 3;
        } else {
          bivariateMatrix[i][j] += 0;
        }                 
      }
	}

	return bivariateMatrix;
}

function BivariateMatrixDiverging5(correlationMatrix, correlationMatrixSubgroup) {
	// Initial a n*n array
	var length = correlationMatrix.length;
	var bivariateMatrix = new Array(length);
	for (var i = 0; i < length; i++) {
		bivariateMatrix[i] = new Array(length);
	}

    for (var i = 0; i < length; i++){
      for (var j=0; j<length;j++){
        // Set correlationMatrix to bivariateMatrix
        if (correlationMatrixSubgroup[i][j] > 2*legendAdjustValue) {
		  bivariateMatrix[i][j] = 4;
		} else if (correlationMatrixSubgroup[i][j] > legendAdjustValue) {
			bivariateMatrix[i][j] = 3;
        } else if ((correlationMatrixSubgroup[i][j] <= legendAdjustValue) && (correlationMatrixSubgroup[i][j] >= -legendAdjustValue)){
		  bivariateMatrix[i][j] = 2;
        } else if (correlationMatrixSubgroup[i][j] > -2*legendAdjustValue){
			bivariateMatrix[i][j] = 1;		  
        } else {
          bivariateMatrix[i][j] = 0;
		}    
		
        // Set correlationMatrixSubgroup to bivariateMatrix
        if (correlationMatrix[i][j] > 2*legendAdjustValue) {
		  bivariateMatrix[i][j] += 20;
		} else if (correlationMatrix[i][j] > legendAdjustValue) {
			bivariateMatrix[i][j] += 15;
        } else if ((correlationMatrix[i][j] <= legendAdjustValue) && (correlationMatrix[i][j] >= -legendAdjustValue)){
		  bivariateMatrix[i][j] += 10;
        } else if (correlationMatrix[i][j] > -2*legendAdjustValue){
			bivariateMatrix[i][j] += 5;		  
        } else {
          bivariateMatrix[i][j] += 0;
		}               
      }
	}

	return bivariateMatrix;
}
