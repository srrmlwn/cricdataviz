// global configs
var animate = true;
var animIntervalSecs = 1500;
var arcPadding = 0.01;
var margin = {top: 30, right: 25, bottom: 20, left: 25},
    width = 650 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom,
    innerRadius = Math.min(width, height) * .39,
    outerRadius = innerRadius * 1.04;
var lowOpacity = 0.1;
var defaultOpacity = 0.8;

d3.chart = d3.chart || {};
d3.chart.dependencyWheel = function (options) {
    function chart(selection) {
        var matrix = data.matrix;
        var matches = data.matches;
        var teams = data.teams;
        var uniqueTeams = data.uniqueTeams;

        var svg = d3.select("#chart").append("svg:svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("svg:g")
            .attr("transform", "translate(" + (margin.left + width / 2) + "," + (margin.top + height / 2) + ")");

        selection.each(function (data) {
            var chord = d3.layout.chord()
                .matrix(matrix)
                .padding(arcPadding)
                .sortSubgroups(d3.descending);

            var rootGroup = chord.groups()[0];
            var rotation = -(rootGroup.endAngle - rootGroup.startAngle) / 2 * (180 / Math.PI);
            //create a group for each team, and combine all matches (chords) played by them under the same team (arc).
            var arcGroups = createGroups(chord);
            var g = svg.selectAll("g.group")
                .data(arcGroups)
                .enter().append("svg:g")
                .attr("class", "group")
                .attr("transform", function (d) {
                    return "rotate(" + rotation + ")";
                })
                .style("opacity", defaultOpacity);

            var fill = function (d) {
                return colours[uniqueTeams[d.index]];
            };
            var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius);
            g.append("svg:path")
                .style("fill", fill)
                .style("stroke", fill)
                .attr("d", arc);
            //append names to each arc
            g.append("svg:text")
                .each(function (d) {
                    d.angle = (d.startAngle + d.endAngle) / 2;
                })
                .attr("dy", ".45em")
                .attr("text-anchor", function (d) {
                    return d.angle > Math.PI ? "end" : null;
                })
                .attr("transform", function (d) {
                    return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
                        "translate(" + (innerRadius * 1.05) + ")" +
                        (d.angle > Math.PI ? "rotate(180)" : "");
                })
                .text(function (d) {
                    return uniqueTeams[d.index];
                });
            //append the chords
            svg.selectAll("path.chord")
                .data(chord.chords)
                .enter().append("svg:path")
                .attr("class", "chord")
                .style("stroke", function (d) {
                    return d3.rgb(colours[teams[d.source.index]]).darker();
                })
                .style("fill", function (d) {
                    return colours[teams[d.source.index]];
                })
                .attr("d", d3.svg.chord().radius(innerRadius))
                .attr("transform", function (d) {
                    return "rotate(" + rotation + ")";
                })
                .style("opacity", lowOpacity);
        });

        function createGroups(chord) {
            var arcGroups = [];
            var index = 0;
            var startAngle = chord.groups()[0].startAngle;
            var groupSize = chord.groups().length;
            for (var i = 1; i < groupSize; i++) {
                if (teams[i - 1] === teams[i]) continue;
                var endAngle = chord.groups()[i - 1].endAngle;
                arcGroups.push({index: index++, startAngle: startAngle, endAngle: endAngle});
                startAngle = chord.groups()[i].startAngle;
            }
            arcGroups.push({index: index++, startAngle: startAngle, endAngle: chord.groups()[groupSize - 1].endAngle});
            return arcGroups;
        }

        if (animate) {
            launchAnimations(svg, matches);
        } else {
            svg.selectAll(".chord").style("opacity", defaultOpacity);
        }


    }

    function launchAnimations(svg, matches) {
        var allMatches = data.allMatches;

        function fade(i) {
            var match = allMatches[i];
            svg.selectAll(".chord")
                .filter(function (d) {
                    var expectedSourceIndex = matches.indexOf(match.team1 + match.team1Index);
                    var expectedTargetIndex = matches.indexOf(match.team2 + match.team2Index);
                    var show1 = d.source.index === expectedSourceIndex
                        && d.target.index === expectedTargetIndex;
                    var show2 = d.source.index === expectedTargetIndex
                        && d.target.index === expectedSourceIndex;
                    var show = show1 || show2;
                    if (show) {
                        console.log(d);
                        console.log("Highlighting - " + expectedSourceIndex + ", " + expectedTargetIndex);

                    }
                    return show;
                })
                .transition()
                .style("opacity", defaultOpacity);
        }

        (function animate(i) {
            setTimeout(function () {
                console.log(allMatches[i]);
                fade(i);
                i++;
                if (i < allMatches.length) animate(i);
            }, animIntervalSecs)
        })(0);
    }

    return chart;
};