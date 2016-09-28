
// ======= ======= ======= initScatterGraphs ======= ======= =======
function initScatterGraphs() {
    console.log("initScatterGraphs");

    // ======= data granularity =======
    var barOuterPad = .2;
    var barPad = .1;
    var colors = ['red','green','gray','blue','olive','lawngreen','purple','cornflowerblue','orange'];
    var tooltips = ['canine','feline','feline','feline','feline','canine','canine','reptile','primate'];

    // ======= chart formatting =======
    var chartPadding = {top: 20, right: 20, bottom: 30, left: 60},
        width = 720 - chartPadding.left - chartPadding.right,
        height = 500 - chartPadding.top - chartPadding.bottom;
    var messageLoc = $("#messageArea").offset();

    // ======= scale mapping (data to display) =======
    var xScale = d3.scale.linear()
        .range([0, width]);
    var yScale = d3.scale.linear()
        .range([height, 0]);
    var labelScale = d3.scale.ordinal()
        .rangeRoundBands([0, width], barPad, barOuterPad);
    var colorScale = d3.scale.quantize()
        .domain([0, colors.length])
        .range(colors);

    // ======= axis formating =======
    var labelAxis = d3.svg.axis()
        .scale(labelScale)
        .orient("bottom");
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(5);

    // ======= build svg objects =======
    var svg = d3.select("#scatterGraphs")
        .attr("width", width + chartPadding.left + chartPadding.right)
        .attr("height", height + chartPadding.top + chartPadding.bottom)
        .append("g")
            .attr("transform", "translate(" + chartPadding.left + "," + chartPadding.top + ")");

    // ======= get remote data file =======
    d3.tsv("data3.tsv", stringToInt, function(error, dataSet) {
        if (error) throw error;

        var rectColor, rectElement, rectX, rectY, rectXstyle, rectYstyle, rectW, rectH;
        var tooltipIndex, nextTooltip;

        // ======= get x/y domains, bind to ranges =======
        xScale.domain([0, d3.max(dataSet, function(d) {
            return d.cx + 10;
        })])
        yScale.domain([0, d3.max(dataSet, function(d) {
            return d.cy + 10;
        })])

        // ======= X scale =======
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // ======= Y scale (with title) =======
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", -180)
                .attr("y", -50)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("animals")
                .attr("font-size", "18px")
                .attr("fill", "steelblue");

        // ======= heavy drop shadow (filterA) =======
        var defs = svg.append("defs");
        var filterA = defs.append("filter")
            .attr("id", "drop-shadowA")
            .attr("width", "200%")
            .attr("height", "130%");
        filterA.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 2)
            .attr("result", "blur");
        filterA.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 3)
            .attr("dy", 3)
            .attr("result", "offsetBlur");
        var feMergeA = filterA.append("feMerge");
        feMergeA.append("feMergeNode")
            .attr("in", "offsetBlur")
        feMergeA.append("feMergeNode")
            .attr("in", "SourceGraphic");

        // ======= light drop shadow (filterB) =======
        var filterB = defs.append("filter")
            .attr("id", "drop-shadowB")
            .attr("width", "200%")
            .attr("height", "130%");
        filterB.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 1)
            .attr("result", "blur");
        filterB.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 1)
            .attr("dy", 1)
            .attr("result", "offsetBlur");
        var feMergeB = filterB.append("feMerge");

        feMergeB.append("feMergeNode")
            .attr("in", "offsetBlur")
        feMergeB.append("feMergeNode")
            .attr("in", "SourceGraphic");

        // ======= add bars for each data point =======
        var rectGroup = svg.selectAll("rect")
           .data(dataSet)
           .enter()
                .append("rect")
                .attr("id", function(d, i) {
                    return d.animal + "_" + i;
                })
                .attr("class", "3Dbar")
                .attr("width", 30)
                .attr("height", function(d) {
                    return d.cr * 4;
                })
                .attr("x", function(d) {
                    return d.cx + 20;
                })
                .attr("y", function(d) {
                    return height - yScale(d.cy)/1.2 - 40;
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
                        // console.log("  d.animal: " + d.animal);
                        return d.animal;
                    })
                    .attr("x", function(d) {
                        // console.log("  d.cx: " + d.cx);
                        return d.cx + 30;
                    })
                    .attr("y", function(d) {
                        return height - yScale(d.cy)/1.2 - 46;
                    })
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "14px")
                    .attr("fill", "steelblue");

        // ======= interactivity =======
        $("#scatterGraphs").on("mouseover", function() {
            // console.log("mouseover_graph");
            locX = parseInt(messageLoc.left + 20);
            locY = parseInt(messageLoc.top + 8);
            displayTooltips("#message", "click and hold over bar to animate", locX + "px", locY + "px", "show");
        })
        $("#scatterGraphs").on("mouseout", function() {
            // console.log("mouseout_graph");
            displayTooltips("#message", "", null, null, "hide");
        })

        rectGroup.on("mouseover", function() {
            // console.log("mouseover_rect");

            // == start properties stored for return-to-normal state
            rectColor = d3.select(this).style("fill");
            rectElement = d3.select(this);
            rectH = d3.select(this).attr("height");

            // == position data for tootips
            rectX = parseInt(d3.select(this).attr("x"));
            rectY = parseInt(d3.select(this).attr("y"));
            rectXstyle = rectX + 266;
            rectYstyle = rectY + 220;
            rectXstyle = rectXstyle + "px";
            rectYstyle = rectYstyle + "px";

            // == build tooltip string
            tooltipText = d3.select(this).attr('id').split("_")[0];
            tooltipIndex = (d3.select(this).attr('id')).charAt(d3.select(this).attr('id').length - 1);
            nextTooltip = "<div id='tooltipText'>" + tooltipText +  "'s order is " + tooltips[tooltipIndex] + "</div>";
            displayTooltips("#tooltips", nextTooltip, rectXstyle, rectYstyle, "show");
            d3.select(this).style('fill', "black");
        })
        rectGroup.on("mouseout", function() {
            // console.log("mouseout");
            d3.select(this).style('fill', rectColor);
            d3.select(this).style("filter", "url(#drop-shadowA)");
            displayTooltips("#tooltips", "", null, null, "hide");
        })
        rectGroup.on("mousedown", function() {
            // console.log("mousedown");
            d3.select(this).style('fill', "white");
            d3.select(this).style("filter", "url(#drop-shadowB)")
            d3.select(this).transition()
                .attr("height", 200)        // will make it bigger
                .attr("y", 0)
                .duration(200);
        })
        document.addEventListener("mouseup", myFunction);
        function myFunction() {
            // console.log("mouseup");
            if (rectElement) {
                rectElement.style('fill', rectColor);
                rectElement.style("filter", "url(#drop-shadowA)")
                rectElement.text("");
                rectElement.transition()
                    .attr("height", rectH)        // will make it bigger
                    .attr("y", rectY)
                    .duration(400);
            }
        }

    });

    // ======= displayTooltips =======
    function displayTooltips(whichInfo, whichTooltip, rectX, rectY, showHide) {
        // console.log("displayTooltips");
        if (showHide == "show") {
            $(whichInfo).css("visibility", "visible");
            $(whichInfo).css("position", "absolute");
            $(whichInfo).css("z-index", 9);
            $(whichInfo).css("left", rectX);
            $(whichInfo).css("top", rectY);
            $(whichInfo).css("color", "red");
            $(whichInfo).css("padding", "10px");
            $(whichInfo).css("border", "solid 1px black");
            $(whichInfo).css("background", "rgba(255, 255, 255, 0.7)");
            $(whichInfo).html(whichTooltip);
        } else {
            $(whichInfo).css("visibility", "invisible");
            $(whichInfo).css("background", "");
            $(whichInfo).css("border", "");
            $(whichInfo).html("");
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

// ======= ======= ======= initSkillsChart ======= ======= =======
function initSkillsChart() {
    console.log("initSkillsChart");

    // == data, labels, colors (10 data items)
    var experience = [22,20,22,10,16,15,13,10,8,12];
    var skills = ['','javascript  ','jquery  ','html/css  ','bootstrap  ','rails  ','ruby  ','postgres  ','node/express  ','sequelize  ','d3'];
    var colors = ['#6666ff','#9999ff','#00ace6','#4dd2ff','#3385ff','#66a3ff','#99c2ff','#66cc99','#00cccc','#ff9966'];

    // == set position of vertical grid lines
    var grid = d3.range(6).map(function(i){
        return {'x1':0, 'y1':30, 'x2':400, 'y2':300};
    });

    // == X scale numbers (1 * 5 = every 5th number)
    var tickVals = grid.map(function(d,i){
        if ((i > 0) && (i < 25)) {
            return i * 5;
        } else if(i === 0){
            return "0";
        }
    });

    // == axis and color scales
    var xScale = d3.scale.linear()
        .domain([0, 25])
        .range([0, 400]);
    var yScale = d3.scale.linear()
        .domain([0, skills.length])
        .range([50, 300]);
    var colorScale = d3.scale.quantize()
        .domain([0, skills.length])
        .range(colors);

    // ======= build svg object =======
    var barChart = d3.select('#skillsGraph')
        .append('svg')
        .attr({'width':500, 'height':400});

    // == make vertical grid lines
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
            .scale(xScale)
            .tickValues(tickVals);

    // == y axis labels
    var	yAxis = d3.svg.axis();
        yAxis
            .orient('left')
            .scale(yScale)
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
    var chart = barChart.append('g')
        .attr("transform", "translate(100, 0)")
        .attr('class','bars')
        .selectAll('rect')
        .data(experience)
        .enter()
        .append('rect')
            .attr('height', 20)
            .attr('x', 5)
            .attr('y', function(d, i) { return yScale(i) + 15; })
            .attr('width', function(d) {
                return xScale(d);
            })
            .style('fill', function(d, i) { return colorScale(i); });

    // == text labels for each bar
    var transitext = d3.select('.bars')
        .attr("transform", "translate(100, 0)")
        .selectAll('text')
        .data(experience)
        .enter()
        .append('text')
            .attr('x', function(d) { return xScale(d) + 10; })   // x location offset for labels
            .attr('y', function(d,i) { return yScale(i) + 30; })    // y location offset for labels
            .text(function(d){ return d; }).style({'fill':'red', 'font-size':'14px'});  // label text

    // == animate bar growth (500ms transition)
    var transit = d3.select("svg").selectAll("rect")
        .data(experience)
        .transition()
        .duration(1000)
        .attr("width", function(d) {return xScale(d); });

}

// ======= ======= ======= initLineGraph2 ======= ======= =======
function initLineGraph2() {
    console.log("initLineGraph2");

    var dataSet = [
        {"sale": "202", "year": "2000"},
        {"sale": "215", "year": "2002"},
        {"sale": "179", "year": "2004"},
        {"sale": "199", "year": "2006"},
        {"sale": "134", "year": "2008"},
        {"sale": "176", "year": "2010"}];

    // ======= chart formatting =======
    var chartPadding = {top: 10, right: 60, bottom: 60, left: 60};
    var width = 720;
    var height = 500;

    // ======= scales =======
    var xScale = d3.scale.linear()
        .domain([
            d3.min(dataSet, function(d) {
                return d.year;
            }),
            d3.max(dataSet, function(d) {
                return d.year;
            })])
        .range([0, width - (chartPadding.left + chartPadding.right)]);

    var yScale = d3.scale.linear()
        .domain([
            d3.min(dataSet, function(d) {
                return d.sale;
            }),
            d3.max(dataSet, function(d) {
                return d.sale;
            })])
        .range([height - (chartPadding.top + chartPadding.bottom), 0]);

    // ======= svg canvas =======
    var svgCanvas = d3.select("#lineGraph2")
        .attr("width", width)
        .attr("height", height)
        .append("g")
            .attr("transform", "translate(" + chartPadding.left + "," + chartPadding.top + ")");


    // ======= axes =======
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(10);
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(6);

    // ======= X scale =======
    svgCanvas.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + parseInt(height - chartPadding.bottom) + ")")
        .call(xAxis);

    // ======= Y scale (with title) =======
    svgCanvas.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(0, 10)")
        .call(yAxis)
        .append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -180)
            .attr("y", -50)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("sales")
            .attr("font-size", "18px")
            .attr("fill", "steelblue");

    var lineGen = d3.svg.line()
        .x(function(d) {
            // console.log("  d.year: " + d.year);
            return xScale(d.year);
        })
        .y(function(d) {
            // console.log("  d.sale: " + d.sale);
            return yScale(d.sale);
        })
        .interpolate("basis");

    svgCanvas.append('svg:path')
        .attr('d', lineGen(dataSet))
        .attr('stroke', 'green')
        .attr('stroke-width', 2)
        .attr('fill', 'none');
}

// ======= ======= ======= initLineGraph ======= ======= =======
function initLineGraph() {
    console.log("initLineGraph");

    var w = 900;
    var h = 400;
    var nodes = [
        {x: 30, y: 50},
        {x: 50, y: 80},
        {x: 90, y: 120}];
    var links = [
        {source: nodes[0], target: nodes[1]},
        {source: nodes[2], target: nodes[1]}];

    var svg = d3.select("#lineGraph1")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    svg.selectAll("circle.nodes")
       .data(nodes)
       .enter()
            .append("svg:circle")
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("r", "2px")
            .attr("fill", "red");

    svg.selectAll(".line")
        .data(links)
        .enter()
            .append("line")
            .attr("x1", function(d) { return d.source.x })
            .attr("y1", function(d) { return d.source.y })
            .attr("x2", function(d) { return d.target.x })
            .attr("y2", function(d) { return d.target.y })
            .style("stroke", "rgb(6,120,155)");
}

// ======= ======= ======= initScatterPlot ======= ======= =======
function initScatterPlot() {
    console.log("initScatterPlot");

    // ======= data granularity =======
    var barOuterPad = .2;       // space before/after x labels
    var barPad = .1;            // space between x labels
    var colors = ['#0000b4','#0094ff','#0d4bcf','#0066AE','#285964','#405F83','#0283AF','#79BCBF','#99C19E','#99C16E'];

    // ======= chart formatting =======
    var chartPadding = {top: 20, right: 20, bottom: 30, left: 40},
        width = 720 - chartPadding.left - chartPadding.right,       // outer width of chart
        height = 300 - chartPadding.top - chartPadding.bottom;      // outer height of chart

    // ======= scale mapping (data to display) =======
    var labelScale = d3.scale.ordinal()              // function that sorts data alphabetically
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
        .scale(labelScale)          // x scale becomes scale function of xAxis object
        .orient("bottom");          // specifies location of axis (top/bottom/left/right)
    var xAxis = d3.svg.axis()       // existing x scale function is bound to xAxis
        .scale(x)                   // x scale becomes scale function of xAxis object
        .orient("bottom");          // specifies location of axis (top/bottom/left/right)
    var yAxis = d3.svg.axis()
        .scale(y)                   // existing y scale function is bound to yAxis as yAxis function
        .orient("left")             // specifies location of axis (top/bottom/left/right)
        .ticks(5);                  // number of ticks (axis labels)

    // ======= build svg objects =======
    var svg = d3.select("#scatterPlot").append("svg")       // create and append svg element to container
        .attr("width", width + chartPadding.left + chartPadding.right)      // offset chart top/left/right/bottom by chartPadding dimensions
        .attr("height", height + chartPadding.top + chartPadding.bottom)
        .append("g")                                            // position g element (parent svg object)
            .attr("transform", "translate(" + chartPadding.left + "," + chartPadding.top + ")");

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
                        return d.animal;
                    })
                    .attr("x", function(d) {
                        return d.cx + 20;
                    })
                    .attr("y", function(d) {
                        return height - y(d.cy) - 20;
                    })
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "14px")
                    .attr("fill", "red");

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
    var chartPadding = {top: 20, right: 20, bottom: 30, left: 40},
        width = 720 - chartPadding.left - chartPadding.right,       // outer width of chart
        height = 500 - chartPadding.top - chartPadding.bottom;      // outer height of chart

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
        .attr("width", width + chartPadding.left + chartPadding.right)      // offset chart top/left/right/bottom by chartPadding dimensions
        .attr("height", height + chartPadding.top + chartPadding.bottom)
        .append("g")                                            // g element is parent svg object
            .attr("transform", "translate(" + chartPadding.left + "," + chartPadding.top + ")");

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

        var barWidths = d3.scale.linear()
            .domain([0, d3.max(dataSet, function(d) { return d.value; })])
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

}
