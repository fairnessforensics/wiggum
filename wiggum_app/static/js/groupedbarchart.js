function DrawGroupedStackedBarChart(options) {
    
    var csvdata = options.data;
    var protectedAttr = options.protectedAttr;
    var explanatoryAttr = options.explanatoryAttr;
    var keyStart = options.keyStart;
    var keyEnd = options.keyEnd;

    var index = 0;

    var resultArray = d3.nest()
        .key(function(d) {return d[explanatoryAttr]})
        .key(function(d) {return d[protectedAttr]})
        .rollup(function(v) {
            return {
                count: v.length
            };
        })
        .entries(csvdata);

    var data = [];
    
    for (var i = 0; i < resultArray.length; i++){
        var singleObj = {};
        singleObj[explanatoryAttr] = resultArray[i].key;

        for (var j = 0; j < resultArray[i].values.length; j++){
            if (keyStart == resultArray[i].values[j].key) {
                singleObj[keyStart] = resultArray[i].values[j].values.count;
            }else if (keyEnd == resultArray[i].values[j].key) {
                singleObj[keyEnd] = resultArray[i].values[j].values.count;
            }
        }

        data.push(singleObj);
    }

    // Target Data
    var targetPreData = csvdata.filter(function(d) {
        return d.decision == 1;
    });

    var targetResultArray = d3.nest()
        .key(function(d) {return d[explanatoryAttr]})
        .key(function(d) {return d[protectedAttr]})
        .rollup(function(v) {
            return {
                count: v.length
            };
        })
        .entries(targetPreData);

    var targetData = [];
    
    for (var i = 0; i < targetResultArray.length; i++){
        var singleObj = {};
        singleObj[explanatoryAttr] = targetResultArray[i].key;

        for (var j = 0; j < targetResultArray[i].values.length; j++){
            if (keyStart == targetResultArray[i].values[j].key) {
                singleObj[keyStart] = targetResultArray[i].values[j].values.count;
            }else if (keyEnd == targetResultArray[i].values[j].key) {
                singleObj[keyEnd] = targetResultArray[i].values[j].values.count;
            }
        }

        targetData.push(singleObj);
    }

    var targetPreDataZero = csvdata.filter(function(d) {
        return d.decision == 0;
    });

    var targetZeroResultArray = d3.nest()
        .key(function(d) {return d[explanatoryAttr]})
        .key(function(d) {return d[protectedAttr]})
        .rollup(function(v) {
            return {
                count: v.length
            };
        })
        .entries(targetPreDataZero);

    var targetZeroData = [];
    
    for (var i = 0; i < targetZeroResultArray.length; i++){
        var singleObj = {};
        singleObj[explanatoryAttr] = targetZeroResultArray[i].key;

        for (var j = 0; j < targetZeroResultArray[i].values.length; j++){
            if (keyStart == targetZeroResultArray[i].values[j].key) {
                singleObj[keyStart] = targetZeroResultArray[i].values[j].values.count;
            }else if (keyEnd == targetZeroResultArray[i].values[j].key) {
                singleObj[keyEnd] = targetZeroResultArray[i].values[j].values.count;
            }
        }

        targetZeroData.push(singleObj);
    }

    // Clean data in order to have the same order for plotting
    data = sortByKey(data, explanatoryAttr);
    targetData = sortByKey(targetData, explanatoryAttr);
    targetZeroData = sortByKey(targetZeroData, explanatoryAttr);

    var margin = {top: 20, right: 60, bottom: 20, left: 30},
    width = 450 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

    var x0 = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var x1 = d3.scale.ordinal();

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.ordinal()
        .range(["#f1b6da", "#b8e186"]);
    var color4target = d3.scale.ordinal()
        .range(["#d01c8b", "#4dac26"]);

    var color4Legend = d3.scale.ordinal()
                         .range(["#b8e186", "#4dac26", "#f1b6da", "#d01c8b"]);

    var xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(".2s"));

    var svg = d3.select("#groupedbarchart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var protectedNames = d3.keys(data[0]).filter(function(key) { return key !== explanatoryAttr; });

    data.forEach(function(d) {
        d[protectedAttr] = protectedNames.map(function(name) { return {name: name, value: +d[name]}; });
    });

    targetZeroData.forEach(function(d) {
        d[protectedAttr] = protectedNames.map(function(name) { return {name: name, value: +d[name]}; });
    });
    x0.domain(targetZeroData.map(function(d) { return d[explanatoryAttr]; }));
    x1.domain(protectedNames).rangeRoundBands([0, x0.rangeBand()]);
    y.domain([0, d3.max(data, function(d) { return d3.max(d[protectedAttr], function(d) { return d.value; }); })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 3)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Population");

    var state = svg.selectAll(".state")
        .data(targetZeroData)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform", function(d) { return "translate(" + x0(d[explanatoryAttr]) + ",0)"; });

    state.selectAll("rect")
        .data(function(d) { 
            for (var i = 0; i < d[protectedAttr].length; i++){
                d[protectedAttr][i][explanatoryAttr] = d[explanatoryAttr];
            }
            return d[protectedAttr]})
        .enter().append("rect")
        .attr("width", x1.rangeBand())
        .attr("x", function(d) {return x1(d.name); })
        .attr("y", 
            function(d) { 
                
                var explanatoryValue = d[explanatoryAttr];
                var object = data.filter(function(d) {
                    return d[explanatoryAttr] == explanatoryValue;
                });
                return y(object[0][d.name]); 
            })
        .attr("height", function(d) { return height - y(d.value); })
        .style("fill", function(d) { return color(d.name); })
        .attr({
            class: function (d) { 
                index = index+1;
                return 'g-bar gbc ' + 'pic-' + index;
            }
        });

    // Stack bar
    targetData.forEach(function(d) {
        d[protectedAttr] = protectedNames.map(function(name) { return {name: name, value: +d[name]}; });
    });

    x0.domain(targetData.map(function(d) { return d[explanatoryAttr]; }));
    x1.domain(protectedNames).rangeRoundBands([0, x0.rangeBand()]);
    y.domain([0, d3.max(data, function(d) { return d3.max(d[protectedAttr], function(d) { return d.value; }); })]);

    var stateTarget = svg.selectAll(".stateTarget")
        .data(targetData)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform", function(d) { return "translate(" + x0(d[explanatoryAttr]) + ",0)"; });
    
    // reset index
    index = 0;
    stateTarget.selectAll("rect")
        .data(function(d) {return d[protectedAttr] })
        .enter().append("rect")
        .attr("width", x1.rangeBand())
        .attr("x", function(d) { return x1(d.name); })
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .style("fill", function(d) { return color4target(d.name); })
        .attr({
            class: function (d) { 
                index = index+1;
                return 'g-bar gbc ' + 'pic-' + index;
            }
        });

    var legendNames = [];

    for (var i=0; i < protectedNames.length; i++) {
        legendNames.push(protectedNames[i]+"-1");   
        legendNames.push(protectedNames[i]+"-0");
    }
  
    var legend = svg.selectAll(".legend")
        .data(legendNames.slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width + 30)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color4Legend);
//        .style("opacity", ".8");

    legend.append("text")
        .attr("x", width + 26)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });

}

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function DrawGroupedBarChart(options) {
    
    var csvdata = options.data;
    var protectedAttr = options.protectedAttr;
    var explanatoryAttr = options.explanatoryAttr;
    var keyStart = options.keyStart;
    var keyEnd = options.keyEnd;

    var index = 0;

    var resultArray = d3.nest()
        .key(function(d) {return d[explanatoryAttr]})
        .key(function(d) {return d[protectedAttr]})
        .rollup(function(v) {
            return {
                count: v.length
            };
        })
        .entries(csvdata);

    var data = [];
    
    for (var i = 0; i < resultArray.length; i++){
        var singleObj = {};
        singleObj[explanatoryAttr] = resultArray[i].key;

        for (var j = 0; j < resultArray[i].values.length; j++){
            if (keyStart == resultArray[i].values[j].key) {
                singleObj[keyStart] = resultArray[i].values[j].values.count;
            }else if (keyEnd == resultArray[i].values[j].key) {
                singleObj[keyEnd] = resultArray[i].values[j].values.count;
            }
        }

        data.push(singleObj);
    }

    var margin = {top: 20, right: 30, bottom: 20, left: 30},
    width = 420 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

    var x0 = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var x1 = d3.scale.ordinal();

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.ordinal()
        .range(["#d7191c", "#1a9641"]);

    var xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(".2s"));

    var svg = d3.select("#groupedbarchart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var protectedNames = d3.keys(data[0]).filter(function(key) { return key !== explanatoryAttr; });

    data.forEach(function(d) {
        d[protectedAttr] = protectedNames.map(function(name) { return {name: name, value: +d[name]}; });
    });

    x0.domain(data.map(function(d) { return d[explanatoryAttr]; }));
    x1.domain(protectedNames).rangeRoundBands([0, x0.rangeBand()]);
    y.domain([0, d3.max(data, function(d) { return d3.max(d[protectedAttr], function(d) { return d.value; }); })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 3)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Population");
  
    var state = svg.selectAll(".state")
        .data(data)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform", function(d) { return "translate(" + x0(d[explanatoryAttr]) + ",0)"; });

    state.selectAll("rect")
        .data(function(d) {return d[protectedAttr] })
        .enter().append("rect")
        .attr("width", x1.rangeBand())
        .attr("x", function(d) { return x1(d.name); })
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .style("fill", function(d) { return color(d.name); })
//        .style("opacity", ".8")
        .attr({
            class: function (d) { 
                index = index+1;
                return 'g-bar gbc ' + 'pic-' + index;
            }
        });

    var legend = svg.selectAll(".legend")
        .data(protectedNames.slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width + 10)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);
//        .style("opacity", ".8");

    legend.append("text")
        .attr("x", width + 6)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });

}

function highlightBar(i) {
    d3.selectAll('.gbc').transition().style('opacity', 0.2);
    d3.selectAll('.pic-' + (i*2+1)).transition().style('opacity', 1);
    d3.selectAll('.pic-' + (i*2+2)).transition().style('opacity', 1);
}