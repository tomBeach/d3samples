
// ======= ======= ======= initScatterGraphs ======= ======= =======
function initScatterGraphs() {
    console.log("initScatterGraphs");

    // ======= data granularity =======
    var barOuterPad = .2;       // space before/after x labels
    var barPad = .1;            // space between x labels
    var colors = ['red','green','gray','blue','olive','lawngreen','purple','while','tomato','yellow'];
    var tooltips = ['red','green','gray','blue','olive','lawngreen','purple','while','tomato','yellow'];

    // ======= chart formatting =======
    var margin = {top: 20, right: 20, bottom: 30, left: 60},
        width = 720 - margin.left - margin.right,       // outer width of chart
        height = 500 - margin.top - margin.bottom;      // outer height of chart

    // ======= scale mapping (data to display) =======
    var label = d3.scale.ordinal()              // function that sorts data alphabetically
        .rangeRoundBands([0, width], barPad, barOuterPad);
    var x = d3.scale.linear()               // function that maps data domain (below) to output range
        .range([0, width]);                 // fits max data value into max chart width
    var y = d3.scale.linear()               // function that maps data domain (below) to output range
        .range([height, 0]);                // fits max data value into max chart height
    var colorScale = d3.scale.quantize()
                    .domain([0, colors.length])
                    .range(colors);

    // ======= scale label formating =======
    var labelAxis = d3.svg.axis()   // existing x scale function is bound to xAxis
        .scale(label)               // x scale becomes scale function of xAxis object
        .orient("bottom");      // specifies location of axis (top/bottom/left/right)
    var xAxis = d3.svg.axis()   // existing x scale function is bound to xAxis
        .scale(x)               // x scale becomes scale function of xAxis object
        .orient("bottom");      // specifies location of axis (top/bottom/left/right)
    var yAxis = d3.svg.axis()
        .scale(y)               // existing y scale function is bound to yAxis as yAxis function
        .orient("left")         // specifies location of axis (top/bottom/left/right)
        .ticks(5);              // number of ticks (axis labels)

    // ======= build svg objects =======
    var svg = d3.select("#scatterGraphs")                      // create and append svg element to container
        .attr("width", width + margin.left + margin.right)      // offset chart top/left/right/bottom by margin dimensions
        .attr("height", height + margin.top + margin.bottom)
        .append("g")                                            // position g element (parent svg object)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // ======= get remote data file =======
    d3.tsv("data3.tsv", stringToInt, function(error, dataSet) {
        if (error) throw error;

        var rectColor, rectX, rectY, rectW, rectH, whichRect;

        // ======= get x/y domains (input), bind to ranges (output scale objects) =======
        x.domain([0, d3.max(dataSet, function(d) {
            return d.cx + 10;            // get x location from data object
        })])
        y.domain([0, d3.max(dataSet, function(d) {
            return d.cy + 10;            // get y location from data object
        })])

        // ======= X scale =======
        svg.append("g")                 // new "g" element contains scale produced by xAxis object methods
            .attr("class", "x axis")    // "x" and "axis" classes for general and specific styles
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);               // calls xAxis methods to create scale

        // ======= Y scale (with title) =======
        svg.append("g")                 // new "g" element contains scale produced by yAxis object methods
            .attr("class", "y axis")    // "y" and "axis" classes for general and specific styles
            .call(yAxis)                // calls yAxis methods to create scale
            .append("text")                         // append "Frequency" scale label to scale
                .attr("transform", "rotate(-90)")   // rotate label to fit
                .attr("x", -180)                      // x location of label (moves on y axis due to rotation)
                .attr("y", -50)                      // y location of label (moves on x axis due to rotation)
                .attr("dy", ".71em")                // location tweak
                .style("text-anchor", "end")        // position based on end of text string (vs start of text)
                .text("animals")                 // text content ("Frequency")
                .attr("font-size", "18px")
                .attr("fill", "steelblue");

        // ======= drop shadows =======
        var defs = svg.append("defs");          // filters go in defs element
        var filterA = defs.append("filter")      // create filter with id #drop-shadow
            .attr("id", "drop-shadowA")
            .attr("width", "200%")              // > 100% prevents clipping
            .attr("height", "130%");            // > 100% prevents clipping
        filterA.append("feGaussianBlur")
            .attr("in", "SourceAlpha")          // opacity of filterA targert element (rect)
            .attr("stdDeviation", 2)            // amount of blur
            .attr("result", "blur");            // calculations stored in blur attribute
        filterA.append("feOffset")               // translate blur output to right and down
            .attr("in", "blur")
            .attr("dx", 3)
            .attr("dy", 3)
            .attr("result", "offsetBlur");      // calculations stored in offsetBlur attribute
        var feMergeA = filterA.append("feMerge"); // SourceGraphic overlaid on blur
        feMergeA.append("feMergeNode")
            .attr("in", "offsetBlur")
        feMergeA.append("feMergeNode")
            .attr("in", "SourceGraphic");       // SourceGraphic appended last (top layer)

        var filterB = defs.append("filter")      // create filter with id #drop-shadow
            .attr("id", "drop-shadowB")
            .attr("width", "200%")              // > 100% prevents clipping
            .attr("height", "130%");            // > 100% prevents clipping
        filterB.append("feGaussianBlur")
            .attr("in", "SourceAlpha")          // opacity of filterB targert element (rect)
            .attr("stdDeviation", 1)            // amount of blur
            .attr("result", "blur");            // calculations stored in blur attribute
        filterB.append("feOffset")               // translate blur output to right and down
            .attr("in", "blur")
            .attr("dx", 1)
            .attr("dy", 1)
            .attr("result", "offsetBlur");      // calculations stored in offsetBlur attribute
        var feMergeB = filterB.append("feMerge"); // SourceGraphic overlaid on blur

        feMergeB.append("feMergeNode")
            .attr("in", "offsetBlur")
        feMergeB.append("feMergeNode")
            .attr("in", "SourceGraphic");       // SourceGraphic appended last (top layer)

        // ======= add bars for each data point =======
        var rectGroup = svg.selectAll("rect")
           .data(dataSet)
           .enter()
                .append("rect")
                .attr("class", "3Dbar")
                .attr("width", 10)
                .attr("height", function(d) {
                    return d.cr * 4;
                })
                .attr("x", function(d) {
                    console.log("  d.cx: " + d.cx);
                    return d.cx + 20;
                })
                .attr("y", function(d) {
                    return height - y(d.cy)/1.2 - 40;
                })
                .attr("stroke-width", 2)
                .style("filter", "url(#drop-shadowA)")
                .style('fill', function(d,i){ return colorScale(i); });

        // ======= item labels =======
        svg.selectAll(".text")
            .data(dataSet)
            .enter()
                .append("text")
                    .text(function(d) {
                        console.log("  d.animal: " + d.animal);
                        return d.animal;
                    })
                    .attr("x", function(d) {
                        console.log("  d.cx: " + d.cx);
                        return d.cx + 28;
                    })
                    .attr("y", function(d) {
                        return height - y(d.cy)/1.2 - 44;
                    })
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "14px")
                    .attr("fill", "steelblue");

        // ======= interactivity =======
        rectGroup.on("mouseover", function() {
            console.log("mouseover");
            rectColor = d3.select(this).style("fill");
            rectX = parseInt(d3.select(this).attr("x"));
            rectY = parseInt(d3.select(this).attr("y"));
            rectXstyle = rectX + 220;
            rectYstyle = rectY + 170;
            rectXstyle = rectXstyle + "px";
            rectYstyle = rectYstyle + "px";
            rectH = d3.select(this).attr("height");
            whichRect = d3.select(this);
            nextTooltip = "<div id='tooltipText'>Some appended text</div>";
            displayTooltips(nextTooltip, rectXstyle, rectYstyle, "show");
            d3.select(this).style('fill', "black");
        })
        rectGroup.on("mouseout", function() {
            console.log("mouseout");
            d3.select(this).style('fill', rectColor);
            d3.select(this).style("filter", "url(#drop-shadowA)");
            displayTooltips("", null, null, "hide");
        })
        rectGroup.on("mousedown", function() {
            console.log("mousedown");
            d3.select(this).style('fill', "red");
            d3.select(this).style("filter", "url(#drop-shadowB)")
            d3.select(this).transition()
                .attr("height", 200)        // will make it bigger
                .attr("y", 0)
                .duration(400);
        })
        document.addEventListener("mouseup", myFunction);
        function myFunction() {
            console.log("mouseup");
            if (whichRect) {
                whichRect.style('fill', rectColor);
                whichRect.style("filter", "url(#drop-shadowA)")
                whichRect.text("");
                whichRect.transition()
                    .attr("height", rectH)        // will make it bigger
                    .attr("y", rectY)
                    .duration(400);
            }
        }

    });

    // ======= displayTooltips =======
    function displayTooltips(whichTooltip, rectX, rectY, showHide) {
        // console.log("displayTooltips");
        if (showHide == "show") {
            $("#tooltips").css("visibility", "visible");
            $("#tooltips").css("position", "absolute");
            $("#tooltips").css("z-index", 9);
            $("#tooltips").css("left", rectX);
            $("#tooltips").css("top", rectY);
            $("#tooltips").css("color", "red");
            $("#tooltips").css("padding", "10px");
            $("#tooltips").css("border", "solid 1px black");
            $("#tooltips").css("background", "rgba(255, 255, 255, 0.5)");
            $("#tooltips").html(whichTooltip);
        } else {
            $("#tooltips").css("visibility", "invisible");
            $("#tooltips").css("background", "");
            $("#tooltips").css("border", "");
            $("#tooltips").html("");
        }
    }

    // ======= stringToInt =======
    function stringToInt(d) {
        // console.log("stringToInt");
        d.cx = +d.cx;
        d.cy = +d.cy;
        return d;
    }
}

// ======= ======= ======= initScatterPlot ======= ======= =======
function initScatterPlot() {
    console.log("initScatterPlot");

    // ======= data granularity =======
    var barOuterPad = .2;       // space before/after x labels
    var barPad = .1;            // space between x labels
    var colors = ['#0000b4','#0094ff','#0d4bcf','#0066AE','#285964','#405F83','#0283AF','#79BCBF','#99C19E','#99C16E'];

    // ======= chart formatting =======
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 720 - margin.left - margin.right,       // outer width of chart
        height = 300 - margin.top - margin.bottom;      // outer height of chart

    // ======= scale mapping (data to display) =======
    var label = d3.scale.ordinal()              // function that sorts data alphabetically
        .rangeRoundBands([0, width], barPad, barOuterPad);
    var x = d3.scale.linear()               // function that maps data domain (below) to output range
        .range([0, width]);                 // fits max data value into max chart width
    var y = d3.scale.linear()               // function that maps data domain (below) to output range
        .range([height, 0]);                // fits max data value into max chart height
    var colorScale = d3.scale.quantize()
                    .domain([0, colors.length])
                    .range(colors);

    // ======= scale label formating =======
    var labelAxis = d3.svg.axis()   // existing x scale function is bound to xAxis
        .scale(label)               // x scale becomes scale function of xAxis object
        .orient("bottom");      // specifies location of axis (top/bottom/left/right)
    var xAxis = d3.svg.axis()   // existing x scale function is bound to xAxis
        .scale(x)               // x scale becomes scale function of xAxis object
        .orient("bottom");      // specifies location of axis (top/bottom/left/right)
    var yAxis = d3.svg.axis()
        .scale(y)               // existing y scale function is bound to yAxis as yAxis function
        .orient("left")         // specifies location of axis (top/bottom/left/right)
        .ticks(5);              // number of ticks (axis labels)

    // ======= build svg objects =======
    var svg = d3.select("#scatterPlot").append("svg")       // create and append svg element to container
        .attr("width", width + margin.left + margin.right)      // offset chart top/left/right/bottom by margin dimensions
        .attr("height", height + margin.top + margin.bottom)
        .append("g")                                            // position g element (parent svg object)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // ======= get remote data file =======
    d3.tsv("data3.tsv", stringToInt, function(error, dataSet) {
        if (error) throw error;

        // ======= get x/y domains (input), bind to ranges (output scale objects) =======
        x.domain([0, d3.max(dataSet, function(d) {
            return d.cx + 10;            // get x location from data object
        })])
        y.domain([0, d3.max(dataSet, function(d) {
            return d.cy + 10;            // get y location from data object
        })])

        // ======= X scale =======
        svg.append("g")                 // new "g" element contains scale produced by xAxis object methods
            .attr("class", "x axis")    // "x" and "axis" classes for general and specific styles
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);               // calls xAxis methods to create scale

        // ======= Y scale (with title) =======
        svg.append("g")                 // new "g" element contains scale produced by yAxis object methods
            .attr("class", "y axis")    // "y" and "axis" classes for general and specific styles
            .call(yAxis)                // calls yAxis methods to create scale
            .append("text")                         // append "Frequency" scale label to scale
                .attr("transform", "rotate(-90)")   // rotate label to fit
                .attr("x", -80)                      // x location of label (moves on y axis due to rotation)
                .attr("y", 10)                      // y location of label (moves on x axis due to rotation)
                .attr("dy", ".71em")                // location tweak
                .style("text-anchor", "end")        // position based on end of text string (vs start of text)
                .text("animals");                 // text content ("Frequency")

        // ======= add circles for each data point =======
        svg.selectAll("circle")
            .data(dataSet)
            .enter()
                .append("circle")
                .attr("cx", function(d) {
                    return d.cx + 10;
                })
                .attr("cy", function(d) {
                    return height - y(d.cy);
                })
                .attr("r", function(d) {
                    return d.cr / 2;
                })
                .style('fill', function(d,i){ return colorScale(i); });

        svg.selectAll(".text")
            .data(dataSet)
            .enter()
                .append("text")
                    .text(function(d) {
                        console.log("  d.animal: " + d.animal);
                        return d.animal;
                    })
                    .attr("x", function(d) {
                        console.log("  d.cx: " + d.cx);
                        return d.cx + 20;
                    })
                    .attr("y", function(d) {
                        return height - y(d.cy) - 20;
                    })
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "14px")
                    .attr("fill", "red");

        // svg.selectAll("rect")
        //    .data(dataSet)
        //    .enter()
        //         .append("rect")
        //         .attr("width", 10)
        //         .attr("height", 10)
        //         .attr("x", function(d) {
        //             console.log("  d.cx: " + d.cx);
        //             return d.cx + 20;
        //         })
        //         .attr("y", function(d) {
        //             return height - y(d.cy) + 20;
        //         });

    });

    // ======= stringToInt =======
    function stringToInt(d) {
        // console.log("stringToInt");
        d.cx = +d.cx;
        d.cy = +d.cy;
        return d;
    }
}

// ======= ======= ======= initHorizontalChart ======= ======= =======
function initHorizontalChart() {
    console.log("initHorizontalChart");

    // ordinal.rangeRoundBands(interval, padding, outerPadding)
    //      computes range values so as to divide the chart area into evenly-spaced, evenly-sized bands
    //      assures integers for pixel; values (avoids aliasing)
    //      padding: space between bars
    //      outerpadding: space before and after bars collection

    // ======= data granularity =======
    var vowels = ["A", "E", "I", "O", "U"];

    // ======= chart formatting =======
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 720 - margin.left - margin.right,       // outer width of chart
        height = 500 - margin.top - margin.bottom;      // outer height of chart

    // ======= scale mapping (data to display) =======
    var x = d3.scale.ordinal()              // function that sorts data alphabetically
        .rangeRoundBands([0, width], .1);   // .1 specifies space between bars

    var y = d3.scale.linear()               // function that maps data domain (below) to output range
        .range([height, 0]);                // fits max data value into max chart height

    // ======= scale label formating =======
    var xAxis = d3.svg.axis()   // existing x scale function is bound to xAxis
        .scale(x)               // x scale becomes scale function of xAxis object
        .orient("bottom");      // specifies location of axis (top/bottom/left/right)

    var yAxis = d3.svg.axis()
        .scale(y)               // existing y scale function is bound to yAxis as yAxis function
        .orient("left")         // specifies location of axis (top/bottom/left/right)
        .ticks(10, "%");        // spacing (10px) and format (%) for ticks

    // ======= build svg objects =======
    var svg = d3.select("#chartHorizontal").append("svg")       // create and append svg element to container
        .attr("width", width + margin.left + margin.right)      // offset chart top/left/right/bottom by margin dimensions
        .attr("height", height + margin.top + margin.bottom)
        .append("g")                                            // g element is parent svg object
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // ======= get remote data file =======
    d3.tsv("data2.tsv", stringToInt, function(error, dataSet) {
        if (error) throw error;

        // ======= get x/y domains (input), bind to ranges (output scale objects) =======
        x.domain(dataSet.map(function(d) { return d.letter; }));                // get letter value from data object
        y.domain([0, d3.max(dataSet, function(d) { return d.frequency; })]);    // get frequency value from data object

        // ======= X scale =======
        svg.append("g")                 // new "g" element contains scale produced by xAxis object methods
            .attr("class", "x axis")    // "x" and "axis" classes for general and specific styles
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);               // calls xAxis methods to create scale

        // ======= Y scale (with title) =======
        svg.append("g")                 // new "g" element contains scale produced by yAxis object methods
            .attr("class", "y axis")    // "y" and "axis" classes for general and specific styles
            .call(yAxis)                // calls yAxis methods to create scale
            .append("text")                         // append "Frequency" scale label to scale
                .attr("transform", "rotate(-90)")   // rotate label to fit
                .attr("y", 10)                      // y location of label (moves on x axis due to rotation)
                .attr("dy", ".71em")                // location tweak
                .style("text-anchor", "end")        // position based on end of text string (vs start of text)
                .text("Frequency");                 // text content ("Frequency")

        // ======= rects for bar graph =======
        svg.selectAll(".bar")            // new "g" element containers to hold rect and text elements
            .data(dataSet)
            .enter().append("rect")
                .attr("class", "bar")   // enable styling of rects via class name
                .attr("x", function(d) { return x(d.letter); })     // x scale function maps range location ("x") to domain
                .attr("width", x.rangeBand())                       // rangeBand function spaces bars and inserts padding
                .attr("y", function(d) { return y(d.frequency); })  // y scale function maps range location ("y") to domain
                .attr("height", function(d) { return height - y(d.frequency); })    // calculated from height - value
                .style({'fill': function(d, i) {            // toggle bar colors (index even/odd)
                        var vowelCheck = $.inArray(d.letter, vowels);
                        if (vowelCheck > -1) {
                            whichColor = 'rebeccapurple';
                        } else {
                            whichColor = (i % 2 == 0) ? "#556B2F":"#808000";
                        }
                        return whichColor;
                    }
                });
    });

    // ======= stringToInt =======
    function stringToInt(d) {
        // console.log("stringToInt");
        d.frequency = +d.frequency;
        return d;
    }
}

// ======= ======= ======= initRemoteChart ======= ======= =======
function initRemoteChart() {
    console.log("initRemoteChart");

    var width = 420;
    var barHeight = 20;

    var chart = d3.select("#chartRemote")   // sets width of chart based on width value
        .attr("width", width);

    // ======= ======= ======= callbackFunction ======= ======= =======
    d3.tsv("data.tsv", stringToInt, function(error, dataSet) {
        console.log("callbackFunction");

        var barWidths = d3.scale.linear()               // function that returns range values mapped to domain values
            .domain([0, d3.max(dataSet, function(d) { return d.value; })])  // function used to extract values from dataSet objects
            .range([0, width]);

        chart.attr("height", barHeight * dataSet.length);

        var bars = chart.selectAll("g")                 // array of "g" elements (svg graphics containers used to group child elements)
            .data(dataSet)
            .enter().append("g")                        // appends g elements to chart object
                .attr("transform", function(d, i) {     // builds translate string for positioning bars vertically
                    return "translate(0," + i * barHeight + ")";
                });

        bars.append("rect")                             // append rect svg element for each data value
            .attr("width", function(d) {                // set width of rect returned from barWidths mapping
                return barWidths(d.value);
            })
            .attr("height", barHeight - 2)              // reduce height by 2px to create spacing between bars
            .style({'fill': function(d, i) {            // toggle bar colors (index even/odd)
                    whichColor = (i % 2 == 0) ? "#9966ff":"#7733ff";
                    return whichColor;
                }
            });

        bars.append("text")
            .attr("x", function(d) { return barWidths(d.value) - 20; }) // x location of text (20px from end of bar)
            .attr("y", barHeight / 2)                                   // y location of text
            .attr("dy", ".35em")                                        // tweaked y location
            .text(function(d) { return d.value; })                      // set text property to data value
            .style({'fill':'red', 'font-size':'10px'});                 // styles for text
    });

    function stringToInt(d) {               // all columns in TSV and CSV files are strings
        // console.log("stringToInt");
        d.value = +d.value;                     // coerce to number
        return d;
    }
}

// ======= ======= ======= initSvgChart ======= ======= =======
function initSvgChart() {
    console.log("initSvgChart");

    // SVG elements must be absolutely positioned with hard-coded translations relative to the origin
    // geometry (e.g. width) specified with attributes, aesthetics (e.g. color) specified as styles
    // text position must be offset via pixels from end of bar; dy offset is used to center the text vertically

    var dataSet = [4, 8, 12, 16, 23, 42, 65];
    var colorSet = ["#ccb3ff", "#bb99ff", "#aa80ff", "#9966ff", "#884dff", "#7733ff", "red"];
    var width = 420;                                    // width of svg element (height depends on number of data points)
    var barHeight = 20;

    var colors = d3.scale.quantize()                    // maps color set to data set into an array
        .domain([0, dataSet.length])                    // input items from dataSet (each data value mapped to single output value)
        .range(colorSet);                               // output values discretely mapped to each input item

    var barWidths = d3.scale.linear()                   // maps date values to chart size (linearly) into an array
        .domain([0, d3.max(dataSet)])                   // d3.max returns max value in array
        .range([0, width]);                             // range generates array of values from start (0) to stop (width) for display

    var chart = d3.select("#chartSvg")                  // selects chartSvg element, then assigns width/height attributes
        .attr("width", width)                           // set chart width directly
        .attr("height", barHeight * dataSet.length);    // compute height based on the size of the dataset (data.length)

    var bars = chart.selectAll("g")         // array of bar objects (each bar is a "g" element containing rect and text elements)
        .data(dataSet)                      // join data to the selection
        .enter().append("g")                // create a g element for each data point
            .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; }) // translate g element vertically
            .style('fill', function(d, i){ return colors(i); });    // add unique color to each bar (via colorScale/colors array)

    bars.append("rect")                     // append rect element to g (inherit data from parent g element)
        .attr("width", barWidths)
        .attr("height", barHeight - 1);

    bars.append("text")                     // append text element to g
            .attr("x", function(d) { return barWidths(d) - 20; })   // text elements offset to left by 20px
        .attr("y", barHeight / 2)                               // places text in middle of bar
        .attr("dy", ".35em")                                    // tweaks text location
        .text(function(d) { return d; })                        // sets text attribute for each bar (to data value from dataSet)
        .style({'fill':'white', 'font-size':'10px'});           // styles for text
}

// ======= ======= ======= initDivChart ======= ======= =======
function initDivChart() {
    console.log("initDivChart");

    var dataSet = [4, 8, 15, 16, 23, 42];
    var barH = 15;

    var xScale = d3.scale.linear()       // function: returns scaled display value in range for given data value in domain
        .domain([0, d3.max(dataSet)])       // domain: minimum (set to 0) and maximum data values (dataSet max)
        .range([0, 420]);                   // range: display space (width of chart)

    d3.select("#chartDiv")                  // select the chart container using id selector
        .selectAll("div")                   // initiate the data join (define selection to which we will join data)
        .data(dataSet)                         // join data to the selection using selection.data
        .enter().append("div")              // instantiate and append missinf elements to selection
            .style("width", function(d) { return xScale(d) + "px"; })       // set bar width as multiple of associated data value (d)
            .style("height", function(d) { return barH + "px"; })           // set bar height as multiple of associated data value (d)
            .text(function(d) { return d; })                                // set the text content of each bar (produces a label)
            .style({'color':'white', 'font-size':'10px'});                  // text color for labels ('color' for divs, 'fill' for svgs)

    // console.log("  d3.max(dataSet): " + d3.max(dataSet));
    // console.log("  xScale.domain: " + xScale.domain());
    // console.log("  xScale.range: " + xScale.range());

}




// ======= ======= ======= initSkillsChart ======= ======= =======
function initSkillsChart() {
    console.log("initSkillsChart");

    // == data, labels, colors (10 data items)
    var experience = [22,20,22,10,14,12,10,8,12,6];
    var skills = ['', 'javascript  ', 'jquery  ', 'html/css  ', 'bootstrap  ', 'rails  ', 'ruby  ', 'node/express  ', 'sequelize  ', 'postgres  ', 'd3'];
    var colors = ['#0000b4','#0094ff','#0d4bcf','#0066AE','#285964','#405F83','#0283AF','#79BCBF','#99C19E','#99C16E'];

    // == set position of vertical grid lines
    // x1: ???
    // x2: ???
    // y2: bottom of grid
    // y1: top of grid
    // d3.range(6): number of xScale values
    var grid = d3.range(6).map(function(i){
        return {'x1':0, 'y1':30, 'x2':400, 'y2':280};
    });

    // == X scale numbers (1 * 5 = every 5th number)
    var tickVals = grid.map(function(d,i){
        if ((i > 0) && (i < 25)) {
            return i * 5;
        } else if(i === 0){
            return "0";
        }
    });

    // == set size/location of graph container
    // domain: min/max data values (min, max)
    // range: xAxis size (start, end)
    var xscale = d3.scale.linear()
                    .domain([0, 25])
                    .range([0, 400]);

    var yscale = d3.scale.linear()
                    .domain([0, skills.length])
                    .range([50, 300]);

    // == draw colored data bars
    var colorScale = d3.scale.quantize()
                    .domain([0, skills.length])
                    .range(colors);

    // == add svg object to container
    var barChart = d3.select('#skillsGraph')
                    .append('svg')
                    .attr({'width':900, 'height':500});

    // == make vertical grid lines
    // translate(locX grid left, locY grid top):
    var grids = barChart.append('g')
                    .attr('id', 'grid')
                    .attr('transform', 'translate(100, 20)')        // translate from left, from top
                    .selectAll('line')
                    .data(grid)                                     // set of x axis labels (0 - 25)
                    .enter()
                    .append('line')
                    .attr({
                        'x1': function(d,i) { return i * 80; },     // tick line top spacing
                        'x2': function(d,i) { return i * 80; },     // tick line bottom spacing
                        'y1': function(d)   { return d.y1; },
                        'y2': function(d)   { return d.y2; },
                    })
                    .style({'stroke':'#adadad','stroke-width':'1px'});

    // == x axis labels
    var	xAxis = d3.svg.axis();
        xAxis
            .orient('bottom')
            .scale(xscale)
            .tickValues(tickVals);

    // == y axis labels
    var	yAxis = d3.svg.axis();
        yAxis
            .orient('left')
            .scale(yscale)
            .tickSize(2)
            .tickFormat(function(d,i){ return skills[i]; })
            .tickValues(d3.range(17));

    // positoining of Y_xis: translate(locX of Y_xis, locY top of Y_xis )
    var y_xis = barChart.append('g')
                      .attr("transform", "translate(100, 0)")
                      .attr('id','yaxis')
                      .call(yAxis);

    // positoining of X_xis: translate(locX of X_xis, locY top of X_xis )
    var x_xis = barChart.append('g')
                      .attr("transform", "translate(98, 300)")
                      .attr('id','xaxis')
                      .call(xAxis);

    // == color bars (colored rect graph elements)
    // translate: translate(locX bars left, locY bars top):
    // attr('height', 20): each bar 20px high
    var chart = barChart.append('g')
                        .attr("transform", "translate(100, 0)")
                        .attr('id','bars')
                        .selectAll('rect')
                        .data(experience)
                        .enter()
                        .append('rect')
                        .attr('height', 20)                 // bar height
                        .attr({
                            'x': 5,                         // tweak x bar start location
                            'y': function(d,i){
                                return yscale(i) + 15; }    // tweak y bar locations
                        })
                        .style('fill', function(d,i){ return colorScale(i); })
                        .attr('width', function(d){ return 0; });

    // == animate bar growth (500ms transition)
    var transit = d3.select("svg").selectAll("rect")
                        .data(experience)
                        .transition()
                        .duration(1000)
                        .attr("width", function(d) {return xscale(d); });

    // == text labels for each bar
    var transitext = d3.select('#bars')
                        .attr("transform", "translate(100, 0)")
                        .selectAll('text')
                        .data(experience)
                        .enter()
                        .append('text')
                        .attr({
                            'x':function(d){
                                return xscale(d) + 10; },   // x location offset for labels
                            'y':function(d,i){
                                return yscale(i) + 30; }    // y location offset for labels
                        })
                        .text(function(d){ return d; }).style({'fill':'red', 'font-size':'14px'});  // label text

}
