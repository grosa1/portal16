'use strict';

var angular = require('angular'),
    d3 = require('d3');

angular
    .module('portal')
    .directive('literatureBarChartYearly', literatureBarChartYearly);

/** @ngInject */
function literatureBarChartYearly(LiteratureYearly) {
    return {
        restrict: 'E',
        replace: 'false',
        scope: {
            region: '='
        },
        link: function(scope, element, attrs) {

            var margin = {top: 40, right: 20, bottom: 50, left: 40},
                width = 600 - margin.left - margin.right,
                height = 250 - margin.top - margin.bottom;

            // set the ranges
            var x = d3.scaleBand().rangeRound([0, width], .05);

            var y = d3.scaleLinear().range([height, 0]);

            // define the axis
            var xAxis = d3.axisBottom()
                .scale(x);

            var yAxis = d3.axisLeft()
                .scale(y)
                .ticks(10);

            // add the SVG element
            var svg = d3.select(element[0]).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

            LiteratureYearly.get({'gbifRegion': scope.region}).$promise
                .then(function(response){

                    var data = response;

                    data.forEach(function(d) {
                        d.year = d.year;
                        d.literature_number = +d.literature_number;
                    });

                    // scale the range of the data
                    x.domain(data.map(function(d) { return d.year; }));
                    y.domain([0, d3.max(data, function(d) { return d.literature_number; })]);

                    // add axis
                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis)
                        .selectAll("text")
                        .style("text-anchor", "end")
                        .attr("class", "axis-text")
                        .attr("dx", "-.62em")
                        .attr("dy", "-.5em")
                        .attr("transform", "rotate(-90)" );

                    /*
                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                        .append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 5)
                        .attr("dy", ".71em")
                        .style("text-anchor", "end")
                        .text("Frequency");
                    */

                    // Add bar chart
                    svg.selectAll("bar")
                        .data(data)
                        .enter().append("rect")
                        .attr("class", "bar")
                        .attr("x", function(d) { return x(d.year) + 4; })
                        .attr("width", x.step() - 8)
                        .attr("y", function(d) { return y(d.literature_number); })
                        .attr("height", function(d) { return height - y(d.literature_number); });

                    svg.append("g")
                        .selectAll("text")
                        .data(data)
                        .enter().append("text")
                        .text(function(d){ return d.literature_number; })
                        .attr("x", function(d) { return x(d.year) + x.step() / 2; })
                        .attr("y", function(d) { return y(d.literature_number) -7; })
                        .attr("class", "text")
                        .attr("text-anchor", "middle");

                    svg.append("text")
                        .attr("x", 10)
                        .attr("y", 10)
                        .attr("text-anchor", "left")
                        .attr("class", "chart-title")
                        .text("Yearly trend of peer-reviewed publications");

                }, function(error){
                    return error;
                });
        }
    };

}

module.exports = literatureBarChartYearly;