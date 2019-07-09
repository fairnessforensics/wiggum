(function() {
    
    d3.my.slopegraph = function module() {

        // input vars for getter setters
        var w = 300,
            h = 360,
            margin = {top: 50, bottom: 40, left: 100, right: 100},
            strokeColour = 'black',
            // key data values start for left(axis) and end for right(axis)
            keyValueStart = '',
            keyValueEnd = '',
            // key value (used for ref/titles)
            keyName = '', 
            keyProtectedAttr = '', 
            format = d3.format('.3f');

        var dispatch = d3.dispatch('_hover');
        var width_vb =205;
        var index = 0;

        function exports(_selection) {
            _selection.each(function(data) {

                // format/clean data
                data.forEach(function(d) {
                    d[keyValueStart] = +d[keyValueStart];
                    d[keyValueEnd] = +d[keyValueEnd];
                }); 

                // get max value(s) for y scale
                var keyValueStartMax = d3.max(data, function (d) { return d[keyValueStart]; } );
                var keyValueEndMax = d3.max(data, function (d) { return d[keyValueEnd]; } );

                // use same scale for both sides
                var yScale = d3.scale.linear()
                    .domain([0, d3.max([keyValueStartMax, keyValueEndMax])])
                    .range([h - margin.top, margin.bottom]);

                var explanatoryAttr = keyName;    
                
                // Store postion for drawing bars
                var position4bars = [];

                data.forEach(function(d) {
                    var singleObj = {};
                    singleObj[explanatoryAttr] = d[explanatoryAttr];
                    singleObj[keyValueStart] = yScale(d[keyValueStart]);
                    singleObj[keyValueEnd] = yScale(d[keyValueEnd]);     
                    position4bars.push(singleObj);                                   
                }); 

                var svg = d3.select(this).append('svg')
                    .attr({
                        width: w + width_vb*2,
                        height: h 
                    });

                var lines = svg.selectAll('line')
                    .data(data);
                    
                lines.enter().append('line')
                    .attr({
                        x1: margin.left,
                        x2: w - margin.right,
                        y1: function(d) { return yScale(d[keyValueStart]); },
                        y2: function(d) { return yScale(d[keyValueEnd]); },
                        stroke: strokeColour,
                        'stroke-width': 2,
                        class: function (d, i) { 
							if (d[keyName] == 'ALL') {
								return 'slope-line4all';
							} else {
								return 's-line elm ' + 'sel-' + i;} }
                    })
                    .on('mouseover', dispatch._hover)
                    .attr("transform", "translate(" + width_vb + ",0)");

                var borderLines = svg.append("g");
                
                borderLines.append("line")
                    .attr("class", "border-lines")
                    .attr("x1", margin.left+width_vb).attr("y1", 30)
                    .attr("x2", margin.left+width_vb).attr("y2", h-20);

                borderLines.append("line")
                    .attr("class", "border-lines")
                    .attr("x1", width_vb + w - margin.right).attr("y1", 30)
                    .attr("x2", width_vb + w - margin.right).attr("y2", h-20);

                var rightLabels = svg.selectAll('.labels')
                    .data(data);
                    
                rightLabels.enter().append('text')
                    .attr({
                        class: function (d, i) { return 'r-labels elm ' + 'sel-' + i; },
                        x: w - margin.right + 3,
                        y: function(d) { return yScale(d[keyValueEnd]) + 4; },
                    })
                    .text(function (d) {
                        return format(d[keyValueEnd]) + '\u00A0\u00A0\u00A0' + d[keyName];
                    })
                    .style('text-anchor','start')
                    .on('mouseover', dispatch._hover)
                    .attr("transform", "translate(" + width_vb + ",0)");
                
                var leftLabels = svg.selectAll('.left-labels')
                    .data(data);
                    
                leftLabels.enter().append('text')
                    .attr({
                        class: function (d, i) { return 'l-labels elm ' + 'sel-' + i; },
                        x: margin.left - 3,
                        y: function(d) { return yScale(d[keyValueStart]) + 4; }
                    })
                    .text(function (d) {
                        return d[keyName] + '\u00A0\u00A0\u00A0' + format(d[keyValueStart]);
                    })
                    .style('text-anchor','end')
                    .on('mouseover', dispatch._hover)
                    .attr("transform", "translate(" + width_vb + ",0)");

                var leftTitle = svg.append('text')
                    .attr({
                        class: 's-title',
                        x: margin.left - 3,
                        y: margin.top/2
                    })
                    .text(keyValueStart + ' ↓')
                    .style('text-anchor','end')
                    .attr("transform", "translate(" + width_vb + ",0)");

                var leftBottemTitle = svg.append('text')
                    .attr({
                        class: 's-title',
                        x: margin.left + 10,
                        y: h - margin.top/2 + 20
                    })
                    .text('Rate')
                    .style('text-anchor','end')
                    .attr("transform", "translate(" + width_vb + ",0)");                    

                var rightTitle = svg.append('text')
                    .attr({
                        class: 's-title',
                        x: w - margin.right + 3,
                        y: margin.top/2
                    })
                    .text('↓ ' + keyValueEnd)
                    .style('text-anchor','start')
                    .attr("transform", "translate(" + width_vb + ",0)");

                var rightBottemTitle = svg.append('text')
                    .attr({
                        class: 's-title',
                        x: w - margin.right + 10,
                        y: h - margin.top/2 + 20
                    })
                    .text('Rate')
                    .style('text-anchor','end')
                    .attr("transform", "translate(" + width_vb + ",0)");    

                // Prepare data for vertical bar
                var protectedAttr = keyProtectedAttr;
                var resultArray = d3.nest()
                                .key(function(d) {return d[explanatoryAttr]})
                                .key(function(d) {return d[protectedAttr]})
                                .rollup(function(v) {
                                    return {
                                        count: v.length
                                    };
                                })
                .entries(csvData);
        
                var data4bars = [];
                
                for (var i = 0; i < resultArray.length; i++){
                    var singleObj = {};
                    singleObj[explanatoryAttr] = resultArray[i].key;
            
                    for (var j = 0; j < resultArray[i].values.length; j++){
                        if (keyValueStart == resultArray[i].values[j].key) {
                            singleObj[keyValueStart] = resultArray[i].values[j].values.count;
                        }else if (keyValueEnd == resultArray[i].values[j].key) {
                            singleObj[keyValueEnd] = resultArray[i].values[j].values.count;
                        }
                    }
            
                    data4bars.push(singleObj);
                }

                // Clean data in order to have the same order for plotting
                data4bars = sortByKey(data4bars, explanatoryAttr);

                var protectedNames = d3.keys(data4bars[0]).filter(function(key) { return key !== explanatoryAttr; });

                data4bars.forEach(function(d) {
                    d[protectedAttr] = protectedNames.map(function(name) { return {name: name, value: +d[name]}; });
                });

                // Target Data
                var targetPreData = csvData.filter(function(d) {
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
                        if (keyValueStart == targetResultArray[i].values[j].key) {
                            singleObj[keyValueStart] = targetResultArray[i].values[j].values.count;
                        }else if (keyValueEnd == targetResultArray[i].values[j].key) {
                            singleObj[keyValueEnd] = targetResultArray[i].values[j].values.count;
                        }
                    }

                    targetData.push(singleObj);
                }

                var targetPreDataZero = csvData.filter(function(d) {
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
                        if (keyValueStart == targetZeroResultArray[i].values[j].key) {
                            singleObj[keyValueStart] = targetZeroResultArray[i].values[j].values.count;
                        }else if (keyValueEnd == targetZeroResultArray[i].values[j].key) {
                            singleObj[keyValueEnd] = targetZeroResultArray[i].values[j].values.count;
                        }
                    }

                    targetZeroData.push(singleObj);
                }
                // Clean data in order to have the same order for plotting                
                targetData = sortByKey(targetData, explanatoryAttr);
                targetZeroData = sortByKey(targetZeroData, explanatoryAttr);

                targetData.forEach(function(d) {
                    d[protectedAttr] = protectedNames.map(function(name) { return {name: name, value: +d[name]}; });
                });

                var color4zero = d3.scale.ordinal()
                                .range(["#fdae61", "#abd9e9"]);
                var color4target = d3.scale.ordinal()
                                .range(["#d7191c", "#2c7bb6"]);
                var color4Legend = d3.scale.ordinal()
                                .range(["#abd9e9", "#2c7bb6", "#fdae61", "#d7191c"]);
                // Vertical bar axis Right
                var margin_bar = 5;
                var x_vb = d3.scale.linear()
                            .range([0, width_vb-margin_bar]);
                x_vb.domain([0, d3.max(data4bars, 
                    function(d) { 
                        return d3.max(d[protectedAttr], 
                            function(d) { return d.value; }); })]);
 
                var borderLines4Bars = svg.append("g");
    
                borderLines4Bars.append("line")
                    .attr("class", "border-lines")
                    .attr("x1", width_vb).attr("y1", 30)
                    .attr("x2", width_vb).attr("y2", h-20);

                borderLines4Bars.append("line")
                    .attr("class", "border-lines")
                    .attr("x1", width_vb + w - margin_bar).attr("y1", 30)
                    .attr("x2", width_vb + w - margin_bar).attr("y2", h-20);


                var xAxis = d3.svg.axis()
                            .scale(x_vb)
                            .orient("bottom")
                            .tickFormat(d3.format(".2s"));
 
                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(" + (width_vb+w-margin_bar) +"," + (h-20) + ")")                    
                    .call(xAxis)
                    .append("text")                
                    .style("text-anchor", "end")
                    .attr("transform", "translate(" + (width_vb-margin_bar) + ",-10)")                                    
                    .text("Count");

                // Vertical bar axis Left
                var x_vb_left = d3.scale.linear()
                            .range([width_vb-margin_bar, 0]);

                x_vb_left.domain([0, d3.max(data4bars, 
                    function(d) { 
                        return d3.max(d[protectedAttr], 
                            function(d) { return d.value; }); })]);

                var xAxis_left = d3.svg.axis()
                            .scale(x_vb_left)
                            .orient("bottom")
                            .tickFormat(d3.format(".2s"));

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate("+ margin_bar +"," + (h-20) + ")")                 
                    .call(xAxis_left)
                    .append("text")
                    .attr("transform", "translate(0, -10)")                    
                    .text("Count");     

                targetZeroData.forEach(function(d) {
                    d[protectedAttr] = protectedNames.map(function(name) { return {name: name, value: +d[name]}; });
                });

                // Vertical bars
                var state = svg.selectAll(".state")
                    .data(targetZeroData)
                    .enter().append("g")
                    .attr("class", "g");

                state.selectAll("rect")
                    .data(function(d) { 
                        for (var i = 0; i < d[protectedAttr].length; i++){
                            d[protectedAttr][i][explanatoryAttr] = d[explanatoryAttr];
                        }

                        return d[protectedAttr]})
                    .enter().append("rect")
                    .attr("width", function(d) { 
                        if (d.name == keyValueStart) {
                            // left side
                            return x_vb_left(0) - x_vb_left(d.value);
                        } else {
                            // right side
                            return x_vb(d.value);
                        }                        
                    })
                    .attr("x", 
                        function(d) {

                            if (d.name == keyValueStart) {
                                // left side
                                var explanatoryValue = d[explanatoryAttr];
                                var object = data4bars.filter(function(d) {
                                    return d[explanatoryAttr] == explanatoryValue;
                                });                                  
                                return x_vb_left(object[0][d.name]) + margin_bar;
                            } else {
                                // right side
                                var explanatoryValue = d[explanatoryAttr];
                                var object = targetData.filter(function(d) {
                                    return d[explanatoryAttr] == explanatoryValue;
                                });                                
                                return width_vb+w-margin_bar+ x_vb(object[0][d.name]);
                            }
                        })
                    .attr("y", 
                        function(d) { 
                            
                            var explanatoryValue = d[explanatoryAttr];
                            var object = position4bars.filter(function(d) {
                                return d[explanatoryAttr] == explanatoryValue;
                            });
                            return object[0][d.name] - 4; 
                        })
                    .attr("height", 6)
                    .style("fill", function(d) { return color4zero(d.name); })
                    .attr({
                        class: function (d) { 
                            index = index+1;
                            return 'g-bar gbc ' + 'pic-' + index;
                        }
                    });                

                // Stack bar
                var stateTarget = svg.selectAll(".stateTarget")
                    .data(targetData)
                    .enter().append("g")
                    .attr("class", "g");
                    
                // reset index
                index = 0;
                stateTarget.selectAll("rect")
                    .data(function(d) { 
                        for (var i = 0; i < d[protectedAttr].length; i++){
                            d[protectedAttr][i][explanatoryAttr] = d[explanatoryAttr];
                        }

                        return d[protectedAttr]})                    
                    .enter().append("rect")
                    .attr("width", function(d) { 
                        if (d.name == keyValueStart) {
                            // left side
                            return x_vb_left(0) - x_vb_left(d.value);
                        } else {
                            // right side
                            return x_vb(d.value);
                        }                        
                    })
                    .attr("x", function(d) { 
                        if (d.name == keyValueStart) {
                            // left side
                            return x_vb_left(d.value) + margin_bar;
                        } else {
                            // right side
                            return width_vb+w-margin_bar;
                        }   
                    })
                    .attr("y", 
                        function(d) {                             
                            var explanatoryValue = d[explanatoryAttr];
                            var object = position4bars.filter(function(d) {
                                return d[explanatoryAttr] == explanatoryValue;
                            });

                            return object[0][d.name] - 4; 
                        })
                    .attr("height", 6)
                    .style("fill", function(d) { return color4target(d.name); })
                    .attr({
                        class: function (d) { 
                            index = index+1;
                            return 'g-bar gbc ' + 'pic-' + index;
                        }
                    });
                
                // Legend
                var legendNames = [];

                for (var i=0; i < protectedNames.length; i++) {
                    legendNames.push(protectedNames[i]+"-1");   
                    legendNames.push(protectedNames[i]+"-0");
                }
              
                var legend = svg.selectAll(".legend")
                    .data(legendNames.slice().reverse())
                    .enter().append("g")
                    .attr("class", "legend")
                    .attr("transform", function(d, i) { return "translate("+(w/2 + width_vb-60)+"," + (i * 15 +5) + ")"; });
            
                legend.append("rect")
                    .attr("x", width + 30)
                    .attr("width", 10)
                    .attr("height", 10)
                    .style("fill", color4Legend);
            //        .style("opacity", ".8");
            
                legend.append("text")
                    .attr("x", width + 26)
                    .attr("y", 4)
                    .attr("dy", ".35em")
                    .style("font-size", "12px")                     
                    .style("text-anchor", "end")
                    .text(function(d) { return d; });

                // Tooltip
                // Define the div for the tooltip
                var div = d3.select("#slopegraph").append("div")	
                            .attr("class", "tooltip")
                            .style("opacity", 0);

                rightLabels.on("mouseover", function(d) {	
                        if (d[explanatoryAttr] != 'ALL') {
                            var explanatory_Value = d[explanatoryAttr];
                            var targetZeroObject = targetZeroData.filter(function(d) {
                                return d[explanatoryAttr] == explanatory_Value;
                            });

                            var targetObject = targetData.filter(function(d) {
                                return d[explanatoryAttr] == explanatory_Value;
                            });

                            div.transition()		
                                .duration(200)		
                                .style("opacity", .9);		
                            div.html(protectedAttr+":&nbsp"+keyValueEnd+"<br/>"
                                        + explanatoryAttr+":&nbsp"+explanatory_Value+"<br/>"
                                        +"rate:&nbsp"+d[keyValueEnd]+"<br/>"+"0:&nbsp" 
                                        + targetZeroObject[0][keyValueEnd]+ "<br/>" + "1:&nbsp" 
                                        + targetObject[0][keyValueEnd])	
                                .style("left", (event.pageX+30) + "px")		
                                .style("top", (event.pageY-120)+ "px");	
                        }
                        })					
                    .on("mouseout", function(d) {		
                        div.transition()		
                            .duration(500)		
                            .style("opacity", 0)});

                    leftLabels.on("mouseover", function(d) {	
                        if (d[explanatoryAttr] != 'ALL') {
                            var explanatory_Value = d[explanatoryAttr];
                            var targetZeroObject = targetZeroData.filter(function(d) {
                                return d[explanatoryAttr] == explanatory_Value;
                            });

                            var targetObject = targetData.filter(function(d) {
                                return d[explanatoryAttr] == explanatory_Value;
                            });

                            div.transition()		
                                .duration(200)		
                                .style("opacity", .9);		
                            div.html(protectedAttr+":&nbsp"+keyValueStart+"<br/>"
                                        + explanatoryAttr+":&nbsp"+explanatory_Value+"<br/>"
                                        +"rate:&nbsp"+d[keyValueStart]+"<br/>"+"0:&nbsp" 
                                        + targetZeroObject[0][keyValueStart]+ "<br/>" + "1:&nbsp" 
                                        + targetObject[0][keyValueStart])	
                                .style("left", (event.pageX-130) + "px")		
                                .style("top", (event.pageY-130)+ "px");	
                        }
                        })					
                    .on("mouseout", function(d) {		
                        div.transition()		
                            .duration(500)		
                            .style("opacity", 0)});                        

            });

        }

        // getter/setters for overrides 
        exports.w = function(value) {
            if (!arguments.length) return w;
            w = value;
            return this;
        };
        exports.h = function(value) {
            if (!arguments.length) return h;
            h = value;
            return this;
        };
        exports.margin = function(value) {
            if (!arguments.length) return margin;
            margin = value;
            return this;
        };
        exports.strokeColour = function(value) {
            if (!arguments.length) return strokeColour;
            strokeColour = value;
            return this;
        };
        exports.keyValueStart = function(value) {
            if (!arguments.length) return keyValueStart;
            keyValueStart = value;
            return this;
        };
        exports.keyValueEnd = function(value) {
            if (!arguments.length) return keyValueEnd;
            keyValueEnd = value;
            return this;
        };
        exports.keyName = function(value) {
            if (!arguments.length) return keyName;
            keyName = value;
            return this;
        };
        exports.keyProtectedAttr = function(value) {
            if (!arguments.length) return keyProtectedAttr;
            keyProtectedAttr = value;
            return this;
        };        
        exports.format = function(value) {
            if (!arguments.length) return format;
            format = value;
            return this;
        };

        d3.rebind(exports, dispatch, 'on');
        return exports;

    };

}());
