// ======= ======= ======= makeTimeline ======= ======= =======
function makeTimeline(moduleData) {
    console.log("\n ***** makeTimeline *****");
    console.dir(moduleData);

    // ======= variables =======
    var activityTotal, activityCount, unitActivityTotal, unitActivityCount;
    var rectElement, rectColor;
    var modCount = Object.keys(moduleData).length
    var modLabelArray = [];
    var modNamesArray = [];
    var modTitlesArray = [];
    var modTicksArray = [];
    var moduleArray = [];
    var activityTotal = 0;
    var totalModDur = 0;

    // ======= formatting =======
    var colors = ['#6666ff','#9999ff','#00ace6','#4dd2ff','#3385ff','#66a3ff','#99c2ff','#66cc99','#00cccc','#ff9966'];
    var colorsLt = ['#b3b3ff','#ccccff','#ccf2ff','#ccf2ff','#cce0ff','#cce0ff','#cce0ff','#d9f2e6','#ccffff','#ffddcc'];
    var margin = {top: 20, right: 100, bottom: 80, left: 100};
    var width = 500;
    var height = 300;

    // ======= date parsing =======
    var modStartDate = new Date("May 2, 2016");
    var modStartMls = modStartDate.getTime();

    function makeModTicks(module) {
        console.log("makeModTicks");
        var modStart = module.modStart;
        var newDate = new Date(modStartMls + (modStart * 86400000));
        var modStartDate = newDate.toISOString().split('T')[0];
        return modStartDate;
    }

    // ======= parse module data =======
    $.each(moduleData, function(index, module) {
        console.log("\nmodule.modName: ", module.modName);
        modNamesArray.push(module.modName);
        modTitlesArray.push(module.modTitle);
        modTicksArray.push(module.modStart);
        modLabelArray.push(makeModTicks(module));
        moduleArray.push(module);
    });
    modNamesArray.push("");
    modTitlesArray.push("");
    console.log("modTicksArray:", modTicksArray);

    // ======= minMax =======
    var dayMin = d3.min(moduleArray, function(d) {
        return (0);
    });
    var dayMax = d3.max(moduleArray, function(d) {
        totalModDur += d.modDur
        return (totalModDur);
    });
    console.log("dayMin: ", dayMin);
    console.log("dayMax: ", dayMax);

    // ======= scales =======
    var xScale = d3.scaleLinear()
        .domain([dayMin, dayMax])
        .range([0, width]);
    var xScaleForAxis = d3.scaleOrdinal()
        .domain(modTicksArray)
        .range([0, width]);
    var yScale = d3.scaleBand()
        .domain(modTitlesArray)
        .rangeRound([0, height])
        .paddingInner(0.8);
    var colorScale = d3.scaleQuantize()
        .domain([0, moduleArray.length])
        .range(colors);

    // ======= elements =======
    var chartEl = document.getElementById("content");
    var svgEl = d3.select(chartEl)
        .append("svg")
            .attr("id", "svgEl")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

    // ======= x axis =======
    console.log("width: ", width);
    svgEl.append("g")
        .attr("class", "axis axis-x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale)
            .tickValues(modTicksArray)
            .tickFormat(function(d,i){
                return modLabelArray[i];
            }))
        .selectAll("text")
              .attr("y", 10)
              .attr("x", 9)
              .attr("dy", ".35em")
              .attr("transform", "rotate(45)")
              .style("text-anchor", "start");

    // ======= y axis =======
    console.log("height: ", height);
    svgEl.append("g")
        .attr("class", "axis axis-y")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
            //   .attr("y", 10)
            //   .attr("x", 9)
            //   .attr("dy", ".35em")
            //   .attr("transform", "rotate(45)")
              .style("font-size", "14px")
              .style("fill", "red");


    // == module area rects
    var modAreas = svgEl.append('g')
        .attr('id', 'modAreas')
        .selectAll('rect')
        .data(moduleArray)
            .enter()
            .append("rect")
                .attr("class", "modAreas")
                .attr("id", function(d, i) {
                    return d.modName;
                })
                .attr("y", function(d, i) {
                    return yScale(d.modTitle);
                })
                .attr("height", function(d, i) {
                    return (height - yScale(d.modTitle));
                })
                .attr("x", function(d) {
                    return xScale(d.modStart);
                })
                .attr("width", function(d) {
                    return xScale(d.modDur);
                })
                .style("color", "red")
                .style("fill", function(d, i) {
                    if (i % 2 > 0) {
                        var color = "#eee"
                    } else {
                        var color = "#ddd"
                    }
                    return color;
                });

    // ======= module bands =======
    var moduleBands = svgEl.selectAll("bar")
        .data(moduleArray)
        .enter()
            .append("rect")
            .attr("class", "moduleBand")
            .attr("pointer-events", "none")
            .style("fill", function(d, i) {
                // return colors[i];
                return "LightSteelBlue ";
            })
            .attr("y", function(d, i) {
                var unitBands = getUnitBands(d, i);
                return yScale(d.modTitle);
            })
            .attr("height", yScale.bandwidth())
            .attr("x", function(d) {
                return xScale(d.modStart);
            })
            .attr("width", function(d) {
                return xScale(d.modDur);
            });

    // ======= getUnitBands =======
    function getUnitBands(mod, index) {
        console.log("getUnitBands");

        var unitNameArray = [];
        var unitArray = [];

        $.each(mod.units, function(i, unit) {
            unitNameArray.push(unit.unitName);
            unitArray.push(unit);
        });

        var xUnitScale = d3.scaleLinear()
            .domain([mod.modStart, mod.modEnd])
            .range([xScale(mod.modStart), xScale(mod.modEnd)]);
        var yUnitScale = d3.scaleBand()
            .domain(unitNameArray)
            .rangeRound([yScale(mod.modTitle) + 8, yScale(mod.modTitle) + height/8 - 4])
            .paddingInner(0.2);

        svgEl.selectAll("bar")
            .data(unitArray)
            .enter()
                .append("rect")
                .style("fill", colors[index])
                .attr("pointer-events", "none")
                .attr("y", function(d) {
                    // var actBands = getActBands();
                    return yUnitScale(d.unitName);
                })
                .attr("height", yUnitScale.bandwidth())
                .attr("x", function(d) {
                    return xUnitScale(d.unitStart);
                })
                .attr("width", function(d) {
                    return xUnitScale(d.unitDur);
                });
    }

    // ======= makeInfoHtml =======
    function makeInfoHtml(modName) {
        console.log("makeInfoHtml");
        var modData = moduleData[modName];
        var modIndex = modNamesArray.indexOf(modName);

        var infoHtml = "<div id='infoHead' style='background-color:" + colors[modIndex] + "'><h3 class='box-label'>" + modData.modTitle + "</h3></div>";
        infoHtml += "<table id='info-table'><tr><th class='unit-col'></th><th class='act-col'></th></tr>";
        var unitIndex = -1;

        // == make unit column
        $.each(modData.units, function(unitKey, unit) {
            unitIndex++;
            infoHtml += "<tr><td id='" + unit.unitName + "' class='unit-label' ";

            // == styles for tds
            infoHtml += "style='background-color:" + colorsLt[modIndex] + "; border-top:solid 2px gray; text-align: right;'>";
            infoHtml += unit.unitTitle + "</td>";
            var actIndex = -1;

            // == make activity column
            $.each(unit.acts, function(actKey, act) {
                actIndex++;
                if (actIndex == 0) {
                    infoHtml += "<td id='" + act.actName + "' class='act-label'";
                    infoHtml += "style='border-top:solid 2px gray'>";
                    infoHtml += act.actTitle + "</td></tr>";
                } else {
                    infoHtml += "<tr><td class='unit-label' ";
                    infoHtml += "style='background-color:" + colorsLt[modIndex] + ";'>&nbsp;</td>";
                    infoHtml += "<td id='" + act.actName + "' class='act-label'>" + act.actTitle + "</td></tr>";
                }
            });
        })
        infoHtml += "</table>";
        infoHtml += "<div id='infoHead' style='background-color:" + colors[modIndex] + "'><button id='close-info'>Close</button></div>";
        return infoHtml;
    }

    // ======= displayLabelBox =======
    function displayLabelBox(whichInfo, whichInfoBox, rectX, rectY, showHide) {
        // console.log("displayLabelBox");
        if (showHide == "show") {
            $(whichInfo).css("visibility", "visible");
            $(whichInfo).css("position", "absolute");
            $(whichInfo).css("z-index", 9);
            $(whichInfo).css("left", rectX + "px");
            $(whichInfo).css("top", rectY + "px");
            $(whichInfo).css("color", "red");
            $(whichInfo).css("padding", "10px");
            $(whichInfo).css("border", "solid 1px black");
            $(whichInfo).css("background", "rgba(255, 255, 255, 0.7)");
            $(whichInfo).html(whichInfoBox);
        } else {
            $(whichInfo).css("visibility", "invisible");
            $(whichInfo).css("background", "");
            $(whichInfo).css("border", "");
            $(whichInfo).html("");
        }
    }

    // ======= activate elements =======
    $(".modAreas").on('mousedown', function(e) {
        console.log("mousedown");
        var infoBoxText = makeInfoHtml(d3.select(this).attr('id'));
        $("#info-box").html(infoBoxText);
        $('#info-box').css('display', 'block');

        // == info-box
        $('#close-info').on('click', function(e) {
            e.stopPropagation();
            $('#info-box').css('display', 'none');
            $('#info-box').html('');
        });

    });
    $(".modAreas").on('mouseenter', function(e) {
        // console.log("mouseenter");

        // == svg page location
        var svgY = $("#svgEl").offset().top;
        var svgX = $("#svgEl").offset().left;

        // == start properties stored for return-to-normal state
        rectElement = d3.select(this);
        rectColor = d3.select(this).style("fill");

        // == position data for tootips
        var rectX = parseInt(d3.select(this).attr("x")) + svgX + 120;
        var rectY = parseInt(d3.select(this).attr("y")) + svgY - 30;

        // == build tooltip string
        var infoBoxId = d3.select(this).attr('id');
        var infoBoxText = moduleData[infoBoxId].modTitle;
        var nextInfoBox = "<div id='infoBoxText'>" + infoBoxText +  "</div>";
        displayLabelBox("#tooltips", nextInfoBox, rectX, rectY, "show");
        d3.select(this).style('fill', "gray");

        // == click mouse tooltip
        if ($("#info-box").html() == "") {
            $("#info-box").html("<p class='info-text'> click for details</p>");
        }

    })
    $(".modAreas").on('mouseleave', function(e) {
        // console.log("mouseleave");
        d3.select(this).style('fill', rectColor);
        displayLabelBox("#tooltips", "", null, null, "hide");
    })

}
