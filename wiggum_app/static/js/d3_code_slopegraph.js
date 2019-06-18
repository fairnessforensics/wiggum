(function() {
    
    d3.my.slopegraph = function module() {

        // input vars for getter setters
        var w = 120,
            h = 360,
            margin = {top: 50, bottom: 40, left: 0, right: 0},
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

                var c20 = d3.scale.category20().range(),
                    darkColor = c20.map(function(d, i, all) { return i<10 ? all[i*2] : null }).filter(Boolean),
                    lightColor = c20.map(function(d, i, all) { return i<10 ? null : all[(i-10)*2+1] }).filter(Boolean);

                var color4zero = d3.scale.ordinal()
                                    .range(lightColor);

                var color4target = d3.scale.ordinal()
                                    .range(darkColor);    

                var color4Line = d3.scale.ordinal()
                                    .range(darkColor);  

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
                        //stroke: strokeColour,
                        stroke: function(d, i){
                            if (d[keyName] != 'ALL') {
                                return color4Line(d[explanatoryAttr])
                            }},
                        'stroke-width': 2,
                        class: function (d, i) { 
							if (d[keyName] == 'ALL') {
								return 'slope-line4all';
							} else {
								return 's-line elm ' + 'sel-' + i;} }
                    })
                    .on('mouseover', dispatch._hover)
                    .attr("transform", "translate(" + width_vb + ",0)");
                
                // Vertical Axis
                var yAxisLeft = d3.svg.axis()
                                    .scale(yScale)
                                    .ticks(4)
                                    .orient("right");

                svg.append("g")
                    .attr("class", "y axis")
                    .attr("transform", "translate("+width_vb+",0)")		  
                    .call(yAxisLeft);
                    
                var yAxisRight = d3.svg.axis()
                                    .scale(yScale)
                                    .ticks(4)
                                    .orient("left");

                svg.append("g")
                    .attr("class", "y axis")
                    .attr("transform", "translate("+(width_vb+w)+",0)")		  
                    .call(yAxisRight);                        

                var circles = svg.selectAll('.circles')
                    .data(data.filter(function(d) {
                        return d[keyName] == 'ALL'}));

                // right circle for all                    
                var rightCircle = circles.enter().append('circle')
                    .attr({
                        cx: w - margin.right,
                        cy: function(d) { return yScale(d[keyValueEnd]); },
                    })
                    .attr('r', 5)
                    .on('mouseover', dispatch._hover)
                    .attr("transform", "translate(" + width_vb + ",0)");
             
                // left circle for all
                var leftCircle = circles.enter().append('circle')
                    .attr({
                        class: function (d, i) { return 'l-circles elm ' + 'sel-' + i; },
                        cx: margin.left,
                        cy: function(d) { return yScale(d[keyValueStart]); }
                    })
                    .attr('r', 5)
                    .on('mouseover', dispatch._hover)
                    .attr("transform", "translate(" + width_vb + ",0)");

                var leftTitle = svg.append('text')
                    .attr({
                        class: 's-title',
                        x: margin.left - 3,
                        y: margin.top/2
                    })
                    .text(keyProtectedAttr + ': ' + keyValueStart + ' ↓')
                    .style('text-anchor','end')
                    .style("font-size", "13px")                      
                    .attr("transform", "translate(" + width_vb + ",0)");

                var middleTitle = svg.append('text')
                    .attr({
                        class: 's-title',
                        x: margin.left + w/2,
                        y: margin.top/2
                    })
                    .text(keyTargetAttr + " mean")
                    .style('text-anchor','middle')
                    .style("font-size", "13px")                      
                    .attr("transform", "translate(" + width_vb + ",0)");

                /*var leftBottemTitle = svg.append('text')
                    .attr("x", -h+margin.bottom+15)
                    .attr("y", width_vb-8)
                    .text('Rate')
                    .style("font-size", "13px")                       
                    .style('text-anchor','start')                  
                    .attr("transform", "rotate(-90)");    */            

                var rightTitle = svg.append('text')
                    .attr({
                        class: 's-title',
                        x: w - margin.right + 3,
                        y: margin.top/2
                    })
                    .text('↓ ' + keyProtectedAttr + ': ' + keyValueEnd)
                    .style("font-size", "13px")                         
                    .style('text-anchor','start')
                    .attr("transform", "translate(" + width_vb + ",0)");

                /*var rightBottemTitle = svg.append('text') 
                    .attr("x", h-margin.bottom-15)
                    .attr("y", 0-width_vb-w-8)
                    .text('Rate')
                    .style("font-size", "13px")                       
                    .style('text-anchor','end')                  
                    .attr("transform", "rotate(90)");*/

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
                    return d[keyTargetAttr] == 1;
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
                    return d[keyTargetAttr] == 0;
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

                // Vertical bar axis Right
                var margin_bar = 0;
                var x_vb = d3.scale.linear()
                            .range([0, width_vb-margin_bar]);
                x_vb.domain([0, d3.max(data4bars, 
                    function(d) { 
                        return d3.max(d[protectedAttr], 
                            function(d) { return d.value; }); })]);
 
                var xAxis = d3.svg.axis()
                            .scale(x_vb)
                            .ticks(4)
                            .orient("bottom")
                            .tickFormat(d3.format(".2s"));
 
                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(" + (width_vb+w-margin_bar) +"," + (h-margin.bottom-10) + ")")                    
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
                            .ticks(4)
                            .orient("bottom")
                            .tickFormat(d3.format(".2s"));

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate("+ margin_bar +"," + (h-margin.bottom-10) + ")")                 
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

                var zeroBars = state.selectAll("rect")
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
                            return object[0][d.name] - 3; 
                        })
                    .attr("height", 6)
                    .style("fill", function(d) { return color4zero(d[explanatoryAttr]); })
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
                var targetBars = stateTarget.selectAll("rect")
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

                            return object[0][d.name] - 3; 
                        })
                    .attr("height", 6)
                    .style("fill", function(d) {return color4target(d[explanatoryAttr]); })
                    .attr({
                        class: function (d) { 
                            index = index+1;
                            return 'g-bar gbc ' + 'pic-' + index;
                        }
                    });
                
                // Legend              
                var legend = svg.selectAll(".legend")
                    .data(color4target.domain())
                    .enter().append("g")
                    .attr("class", "legend")
                    .attr("transform", function(d, i) { return "translate("+(w/2 + width_vb-60)+"," + (i * 15 +15) + ")"; });
            
                legend.append("rect")
                    .attr("x", width - 60)
                    .attr("width", 10)
                    .attr("height", 10)
                    .style("fill", color4target);

                legend.append("rect")
                    .attr("x", width - 50)
                    .attr("width", 10)
                    .attr("height", 10)
                    .style("fill", color4zero);
            
                legend.append("text")
                    .attr("x", width - 64)
                    .attr("y", 4)
                    .attr("dy", ".35em")
                    .style("font-size", "12px")                     
                    .style("text-anchor", "end")
                    .text(function(d) { return d; });
                
                // Legend Title
                svg.append("text")
                    .attr("x", width+ width_vb-40)
                    .attr("y", 4)
                    .attr("dy", ".35em")
                    .style("font-size", "12px")                     
                    .style("text-anchor", "end")
                    .text(explanatoryAttr);

                // Tooltip
                // Define the div for the tooltip
                var div = d3.select("#slopegraph").append("div")	
                            .attr("class", "tooltip")
                            .style("opacity", 0);

                leftCircle.on("mouseover", function(d) {	
                    var totalZero = 0;
                    targetZeroData.forEach(function(d) {
                        totalZero += d[keyValueStart];
                    }); 

                    var totalTarget = 0;
                    targetData.forEach(function(d) {
                        totalTarget += d[keyValueStart];
                    }); 

                    div.transition()		
                        .duration(200)		
                        .style("opacity", .9);		
                    div.html(protectedAttr+":&nbsp"+keyValueStart+"<br/>"
                                + explanatoryAttr+":&nbspALL<br/>"
                                +"rate:&nbsp"+d[keyValueStart]+"<br/>"+"0:&nbsp" 
                                + totalZero+ "<br/>" + "1:&nbsp" 
                                + totalTarget)	
                        .style("left", (event.pageX+30) + "px")		
                        .style("top", (event.pageY-120)+ "px");	
                    })					
                    .on("mouseout", function(d) {		
                        div.transition()		
                            .duration(500)		
                            .style("opacity", 0)});

                rightCircle.on("mouseover", function(d) {	
                    var totalZero = 0;
                    targetZeroData.forEach(function(d) {
                        totalZero += d[keyValueEnd];
                    }); 

                    var totalTarget = 0;
                    targetData.forEach(function(d) {
                        totalTarget += d[keyValueEnd];
                    }); 

                    div.transition()		
                        .duration(200)		
                        .style("opacity", .9);		
                    div.html(protectedAttr+":&nbsp"+keyValueEnd+"<br/>"
                                + explanatoryAttr+":&nbspALL<br/>"
                                +"rate:&nbsp"+d[keyValueEnd]+"<br/>"+"0:&nbsp" 
                                + totalZero+ "<br/>" + "1:&nbsp" 
                                + totalTarget)	
                        .style("left", (event.pageX+30) + "px")		
                        .style("top", (event.pageY-120)+ "px");	
                    })					
                    .on("mouseout", function(d) {		
                        div.transition()		
                            .duration(500)		
                            .style("opacity", 0)});

                // for target bars
                targetBars.on("mouseover", function(d) {	
                    var explanatory_Value = d[explanatoryAttr];
                    var targetZeroObject = targetZeroData.filter(function(d) {
                        return d[explanatoryAttr] == explanatory_Value;
                    });

                    var targetObject = targetData.filter(function(d) {
                        return d[explanatoryAttr] == explanatory_Value;
                    });

                    var rateObject = data.filter(function(d) {
                        return d[explanatoryAttr] == explanatory_Value;
                    });

                    div.transition()		
                        .duration(200)		
                        .style("opacity", .9);		

                    if (d.name == keyValueStart) {
                        // left side
                        div.html(protectedAttr+":&nbsp"+keyValueStart+"<br/>"
                                    + explanatoryAttr+":&nbsp"+explanatory_Value+"<br/>"
                                    +"rate:&nbsp"+rateObject[0][keyValueStart]+"<br/>"+"0:&nbsp" 
                                    + targetZeroObject[0][keyValueStart]+ "<br/>" + "1:&nbsp" 
                                    + targetObject[0][keyValueStart])	
                            .style("left", (event.pageX-130) + "px")		
                            .style("top", (event.pageY-130)+ "px");	
                    } else {
                        // right side
                        div.html(protectedAttr+":&nbsp"+keyValueEnd+"<br/>"
                                    + explanatoryAttr+":&nbsp"+explanatory_Value+"<br/>"
                                    +"rate:&nbsp"+rateObject[0][keyValueEnd]+"<br/>"+"0:&nbsp" 
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
                        
                // for zero bars
                zeroBars.on("mouseover", function(d) {	
                    var explanatory_Value = d[explanatoryAttr];
                    var targetZeroObject = targetZeroData.filter(function(d) {
                        return d[explanatoryAttr] == explanatory_Value;
                    });

                    var targetObject = targetData.filter(function(d) {
                        return d[explanatoryAttr] == explanatory_Value;
                    });

                    var rateObject = data.filter(function(d) {
                        return d[explanatoryAttr] == explanatory_Value;
                    });

                    div.transition()		
                        .duration(200)		
                        .style("opacity", .9);		

                    if (d.name == keyValueStart) {
                        // left side
                        div.html(protectedAttr+":&nbsp"+keyValueStart+"<br/>"
                                    + explanatoryAttr+":&nbsp"+explanatory_Value+"<br/>"
                                    +"rate:&nbsp"+rateObject[0][keyValueStart]+"<br/>"+"0:&nbsp" 
                                    + targetZeroObject[0][keyValueStart]+ "<br/>" + "1:&nbsp" 
                                    + targetObject[0][keyValueStart])	
                            .style("left", (event.pageX-130) + "px")		
                            .style("top", (event.pageY-130)+ "px");	
                    } else {
                        // right side
                        div.html(protectedAttr+":&nbsp"+keyValueEnd+"<br/>"
                                    + explanatoryAttr+":&nbsp"+explanatory_Value+"<br/>"
                                    +"rate:&nbsp"+rateObject[0][keyValueEnd]+"<br/>"+"0:&nbsp" 
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
        exports.keyTargetAttr = function(value) {
            if (!arguments.length) return keyTargetAttr;
            keyTargetAttr = value;
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

    d3.my.slopegraph4count = function module() {

        // input vars for getter setters
        var w = 120,
            h = 360,
            margin = {top: 50, bottom: 40, left: 0, right: 0},
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

                var c20 = d3.scale.category20().range(),
                    darkColor = c20.map(function(d, i, all) { return i<10 ? all[i*2] : null }).filter(Boolean);

                var color4target = d3.scale.ordinal()
                                    .range(darkColor);    

                var color4Line = d3.scale.ordinal()
                                    .range(darkColor);  

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
                        //stroke: strokeColour,
                        stroke: function(d, i){
                            if (d[keyName] != 'ALL') {
                                return color4Line(d[explanatoryAttr])
                            }},
                        'stroke-width': 2,
                        class: function (d, i) { 
							if (d[keyName] == 'ALL') {
								return 'slope-line4all';
							} else {
								return 's-line elm ' + 'sel-' + i;} }
                    })
                    .on('mouseover', dispatch._hover)
                    .attr("transform", "translate(" + width_vb + ",0)");
                
                // Vertical Axis
                var yAxisLeft = d3.svg.axis()
                                    .scale(yScale)
                                    .ticks(4)
                                    .orient("right");

                svg.append("g")
                    .attr("class", "y axis")
                    .attr("transform", "translate("+width_vb+",0)")		  
                    .call(yAxisLeft);
                    
                var yAxisRight = d3.svg.axis()
                                    .scale(yScale)
                                    .ticks(4)
                                    .orient("left");

                svg.append("g")
                    .attr("class", "y axis")
                    .attr("transform", "translate("+(width_vb+w)+",0)")		  
                    .call(yAxisRight);                        

                var circles = svg.selectAll('.circles')
                    .data(data.filter(function(d) {
                        return d[keyName] == 'ALL'}));

                // right circle for all                    
                var rightCircle = circles.enter().append('circle')
                    .attr({
                        cx: w - margin.right,
                        cy: function(d) { return yScale(d[keyValueEnd]); },
                    })
                    .attr('r', 5)
                    .on('mouseover', dispatch._hover)
                    .attr("transform", "translate(" + width_vb + ",0)");
             
                // left circle for all
                var leftCircle = circles.enter().append('circle')
                    .attr({
                        class: function (d, i) { return 'l-circles elm ' + 'sel-' + i; },
                        cx: margin.left,
                        cy: function(d) { return yScale(d[keyValueStart]); }
                    })
                    .attr('r', 5)
                    .on('mouseover', dispatch._hover)
                    .attr("transform", "translate(" + width_vb + ",0)");

                var leftTitle = svg.append('text')
                    .attr({
                        class: 's-title',
                        x: margin.left - 3,
                        y: margin.top/2
                    })
                    .text(keyProtectedAttr + ': ' + keyValueStart + ' ↓')
                    .style('text-anchor','end')
                    .style("font-size", "13px")                      
                    .attr("transform", "translate(" + width_vb + ",0)");

                var middleTitle = svg.append('text')
                    .attr({
                        class: 's-title',
                        x: margin.left + w/2,
                        y: margin.top/2
                    })
                    .text(keyTargetAttr)
                    .style('text-anchor','middle')
                    .style("font-size", "13px")                      
                    .attr("transform", "translate(" + width_vb + ",0)");       

                var rightTitle = svg.append('text')
                    .attr({
                        class: 's-title',
                        x: w - margin.right + 3,
                        y: margin.top/2
                    })
                    .text('↓ ' + keyProtectedAttr + ': ' + keyValueEnd)
                    .style("font-size", "13px")                         
                    .style('text-anchor','start')
                    .attr("transform", "translate(" + width_vb + ",0)");

                // Prepare data for vertical bar
                var protectedAttr = keyProtectedAttr;
                var resultArray = d3.nest()
                                .key(function(d) {return d[explanatoryAttr]})
                                .key(function(d) {return d[protectedAttr]})
                                .rollup(function(v) {
                                    return {
                                        count: v[0][keyWeightingAttr]
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

                // Vertical bar axis Right
                var margin_bar = 0;
                var x_vb = d3.scale.linear()
                            .range([0, width_vb-margin_bar]);
                x_vb.domain([0, d3.max(data4bars, 
                    function(d) { 
                        return d3.max(d[protectedAttr], 
                            function(d) { return d.value; }); })]);
 
                var xAxis = d3.svg.axis()
                            .scale(x_vb)
                            .orient("bottom")
                            .ticks(4)
                            .tickFormat(d3.format(".2s"));
 
                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(" + (width_vb+w-margin_bar) +"," + (h-margin.bottom-10) + ")")                    
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
                            .ticks(4)
                            .tickFormat(d3.format(".2s"));

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate("+ margin_bar +"," + (h-margin.bottom-10) + ")")                 
                    .call(xAxis_left)
                    .append("text")
                    .attr("transform", "translate(0, -10)")                    
                    .text("Count");     

                // Stack bar
                var stateTarget = svg.selectAll(".stateTarget")
                    .data(data4bars)
                    .enter().append("g")
                    .attr("class", "g");
                    
                // reset index
                index = 0;
                var targetBars = stateTarget.selectAll("rect")
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

                            return object[0][d.name] - 3; 
                        })
                    .attr("height", 6)
                    .style("fill", function(d) {return color4target(d[explanatoryAttr]); })
                    .attr({
                        class: function (d) { 
                            index = index+1;
                            return 'g-bar gbc ' + 'pic-' + index;
                        }
                    });
                
                // Legend              
                var legend = svg.selectAll(".legend")
                    .data(color4target.domain())
                    .enter().append("g")
                    .attr("class", "legend")
                    .attr("transform", function(d, i) { return "translate("+(w/2 + width_vb-60)+"," + (i * 15 +15) + ")"; });
            
                legend.append("rect")
                    .attr("x", width - 50)
                    .attr("width", 10)
                    .attr("height", 10)
                    .style("fill", color4target);
            
                legend.append("text")
                    .attr("x", width - 54)
                    .attr("y", 4)
                    .attr("dy", ".35em")
                    .style("font-size", "12px")                     
                    .style("text-anchor", "end")
                    .text(function(d) { return d; });
                
                // Legend Title
                svg.append("text")
                    .attr("x", width+ width_vb-40)
                    .attr("y", 4)
                    .attr("dy", ".35em")
                    .style("font-size", "12px")                     
                    .style("text-anchor", "end")
                    .text(explanatoryAttr);

                // Tooltip
                // Define the div for the tooltip
                var div = d3.select("#slopegraph").append("div")	
                            .attr("class", "tooltip")
                            .style("opacity", 0);

                leftCircle.on("mouseover", function(d) {	
                    var totalTarget = 0;
                    data4bars.forEach(function(d) {
                        totalTarget += d[keyValueStart];
                    }); 

                    div.transition()		
                        .duration(200)		
                        .style("opacity", .9);		
                    div.html(protectedAttr+":&nbsp"+keyValueStart+"<br/>"
                                + explanatoryAttr+":&nbspALL<br/>"
                                + keyTargetAttr + ":&nbsp"+d[keyValueStart]+"<br/>"
                                + "count:&nbsp" 
                                + totalTarget)	
                        .style("left", (event.pageX+30) + "px")		
                        .style("top", (event.pageY-120)+ "px");	
                    })					
                    .on("mouseout", function(d) {		
                        div.transition()		
                            .duration(500)		
                            .style("opacity", 0)});

                rightCircle.on("mouseover", function(d) {	
                    var totalTarget = 0;
                    data4bars.forEach(function(d) {
                        totalTarget += d[keyValueEnd];
                    }); 

                    div.transition()		
                        .duration(200)		
                        .style("opacity", .9);		
                    div.html(protectedAttr+":&nbsp"+keyValueEnd+"<br/>"
                                + explanatoryAttr+":&nbspALL<br/>"
                                + keyTargetAttr + ":&nbsp"+d[keyValueEnd]+"<br/>"
                                + "count:&nbsp" 
                                + totalTarget)	
                        .style("left", (event.pageX+30) + "px")		
                        .style("top", (event.pageY-120)+ "px");	
                    })					
                    .on("mouseout", function(d) {		
                        div.transition()		
                            .duration(500)		
                            .style("opacity", 0)});

                // for target bars
                targetBars.on("mouseover", function(d) {	
                    var explanatory_Value = d[explanatoryAttr];

                    var targetObject = data4bars.filter(function(d) {
                        return d[explanatoryAttr] == explanatory_Value;
                    });

                    var rateObject = data.filter(function(d) {
                        return d[explanatoryAttr] == explanatory_Value;
                    });

                    div.transition()		
                        .duration(200)		
                        .style("opacity", .9);		

                    if (d.name == keyValueStart) {
                        // left side
                        div.html(protectedAttr+":&nbsp"+keyValueStart+"<br/>"
                                    + explanatoryAttr+":&nbsp"+explanatory_Value+"<br/>"
                                    + keyTargetAttr + ":&nbsp"+rateObject[0][keyValueStart]+"<br/>"
                                    + "Count:&nbsp" 
                                    + targetObject[0][keyValueStart])	
                            .style("left", (event.pageX-130) + "px")		
                            .style("top", (event.pageY-130)+ "px");	
                    } else {
                        // right side
                        div.html(protectedAttr+":&nbsp"+keyValueEnd+"<br/>"
                                    + explanatoryAttr+":&nbsp"+explanatory_Value+"<br/>"
                                    + keyTargetAttr + ":&nbsp"+rateObject[0][keyValueEnd]+"<br/>"
                                    + "Count:&nbsp" 
                                    + targetObject[0][keyValueEnd])	
                            .style("left", (event.pageX+30) + "px")		
                            .style("top", (event.pageY-120)+ "px");	
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
        exports.keyWeightingAttr = function(value) {
            if (!arguments.length) return keyWeightingAttr;
            keyWeightingAttr = value;
            return this;
        };     
        exports.keyTargetAttr = function(value) {
            if (!arguments.length) return keyTargetAttr;
            keyTargetAttr = value;
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
