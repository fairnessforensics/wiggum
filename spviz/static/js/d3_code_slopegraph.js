(function() {
    'use strict';
    
    d3.eesur.slopegraph = function module() {

        // input vars for getter setters
        var w = 400,
            h = 300,
            margin = {top: 50, bottom: 40, left: 100, right: 100},
            strokeColour = 'black',
            // key data values start for left(axis) and end for right(axis)
            keyValueStart = '',
            keyValueEnd = '',
            // key value (used for ref/titles)
            keyName = '', 
            format = d3.format('');

        var dispatch = d3.dispatch('_hover');


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

                var svg = d3.select(this).append('svg')
                    .attr({
                        width: w,
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
                        'stroke-width': 1,
                        class: function (d, i) { 
							if (d[keyName] == 'ALL') {
								return 'slope-line4all';
							} else {
								return 's-line elm ' + 'sel-' + i;} }
                    })
                    .on('mouseover', dispatch._hover);

                var rightLabels = svg.selectAll('.labels')
                    .data(data);
                    
                rightLabels.enter().append('text')
                    .attr({
                        class: function (d, i) { return 'r-labels elm ' + 'sel-' + i; },
                        x: w - margin.right + 3,
                        y: function(d) { return yScale(d[keyValueEnd]) + 4; },
                    })
                    .text(function (d) {
                        return d[keyName] + ':   ' + format(d[keyValueEnd]);
                    })
                    .style('text-anchor','start')
                    .on('mouseover', dispatch._hover);
                
                var leftLabels = svg.selectAll('.left-labels')
                    .data(data);
                    
                leftLabels.enter().append('text')
                    .attr({
                        class: function (d, i) { return 'l-labels elm ' + 'sel-' + i; },
                        x: margin.left - 3,
                        y: function(d) { return yScale(d[keyValueStart]) + 4; }
                    })
                    .text(function (d) {
                        return d[keyName] + ':   ' + format(d[keyValueStart]);
                    })
                    .style('text-anchor','end')
                    .on('mouseover', dispatch._hover);

                var leftTitle = svg.append('text')
                    .attr({
                        class: 's-title',
                        x: margin.left - 3,
                        y: margin.top/2
                    })
                    .text(keyValueStart + ' ↓')
                    .style('text-anchor','end');

                var rightTitle = svg.append('text')
                    .attr({
                        class: 's-title',
                        x: w - margin.right + 3,
                        y: margin.top/2
                    })
                    .text('↓ ' + keyValueEnd)
                    .style('text-anchor','start');

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
        exports.format = function(value) {
            if (!arguments.length) return format;
            format = value;
            return this;
        };

        d3.rebind(exports, dispatch, 'on');
        return exports;

    };

}());
