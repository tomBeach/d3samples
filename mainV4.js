"use strict";

// ======= ======= ======= display ======= ======= =======
var clientApp;
var defaultDisplay = {
    viewContainer: $("#viewContainer")
};

// ======= ======= ======= views ======= ======= =======
var defaultView  = {
    viewTitle: "test site",
    viewInfo: "work-in-progress",
    mainMenu: null,
    miniMenu: null,
    dataTable: null,
    dataChart: null
};
var organizer = {
    groups: { sold:null, own:null, watch:null },
    organizerMenu: { clear:null, all:null, byName:null, checkBoxes:null }
};

// ======= ======= ======= loading triggers ======= ======= =======
if ($(window).width() >= 1100) {
    console.log('******* window loaded *******');
    console.log('$(window).width(): ', $(window).width());
}
$(document).ready(function(){
    console.log('$(document).ready');
    var parseTime = d3.timeParse("%d-%b-%y");
    console.log("parseTime: ", parseTime);
});
$(window).on('load', function() {
    console.log('******* window loaded *******');
});


// ======= ======= ======= client app ======= ======= =======
clientApp = {
    view: defaultView,
    display: defaultDisplay,
    initInterval: null,
    stopInterval: null,
    currentData: null,
    historyData: null,
    activeUserHolding: null,

    // ======= initialize =======
    initialize: function() {
        console.log("initialize");
        clientApp.makeModuleData();
        clientApp.activateDragger();
    },

    // ======= updateHoverText =======
    updateHoverText: function(target, over) {
        // console.log("updateHoverText");
        if (over) {
            $('#hoverText > span').text($(target).attr('id'));
        } else {
            $('#hoverText > span').text(' ');
        }
    },

    // ======= makeModuleData =======
    makeModuleData: function() {
        console.log("makeModuleData");

        var actTitles = ["The Profession of Teaching", "Creativity in Teaching", "Innovative Teaching and Learning Practices", "Influence of National and International Organizations", "School Governance", "Laws and Policies that Affect Teaching", "Student Data Analysis", "Differentiated Instruction", "Special Education in Tomorrow's Learning World", "Special Education Referral Process", "Special Education Categories and Accommodations", "Cultures and Languages in Education", "Standards and Objectives of ELL Programs", "Planning for English Language Learners", "Students in the Digital Age", "Student-Centered Learning", "Student Case Study", "Strategies for Technology Enhanced Instruction", "Applications of 21st-century Skills", "Mobile Activity Design Experiment, Part I", "Personal Learning Goals", "Personal Learning Network", "Cognitive Flow and Learning", "Game Design for Learning", "Project-Based Learning", "Mobile Learning", "Clinical Activity Design Experiment, Part II", "Future Trends, Opportunities and Challenges in Digital Learning"];
        var modDurations = [2, 3, 3, 2, 5, 7, 3, 12];
        var modName, modStart, modDur, modEnd, modTitle;
        var unitCount, unitName, unitStart, unitDur, unitEnd, unitTrim, unitTitle;
        var actCount, actName, actStart, actDur, actEnd, actTrim, actTitle, actTitleIndex;
        var units, acts;
        modStart = 0;
        var modules = {};

        // == MODULES ======= ======= ======= ======= =======
        for (var i = 0; i < modDurations.length; i++) {
            modName = "module_" + (i + 1);
            modTitle = "Module  " + (i + 1);
            modDur = modDurations[i] * 7;
            modEnd = modStart + modDur;
            modules[modName] = { modName:modName, modStart:modStart, modDur:modDur, modEnd:modEnd, modTitle:modTitle };

            // == UNITS ======= ======= ======= ======= =======
            unitCount = Math.floor(Math.random() * 3) + 2;
            unitDur = Math.round((modDurations[i] * 7)/unitCount);
            unitTrim = modDur - (unitDur * unitCount)
            unitStart = modStart;
            units = {};

            for (var j = 0; j < unitCount; j++) {
                unitName = "unit_" + (j + 1);
                unitTitle = "Unit " + (j + 1);

                // == trim last unit if necessary
                if (j == (unitCount - 1)) {
                    unitDur = unitDur - unitTrim;
                }
                unitEnd = unitStart + unitDur;
                units[unitName] = { unitName:unitName, unitStart:unitStart, unitDur:unitDur, unitEnd:unitEnd, unitTitle:unitTitle };

                // == ACTIVITIES ======= ======= ======= ======= =======
                actCount = Math.floor(Math.random() * 3) + 1;
                actDur = Math.round(unitDur/actCount);
                actTrim = unitDur - (actDur * actCount)
                actStart = unitStart;
                acts = {};

                for (var k = 0; k < actCount; k++) {
                    actName = "act_" + (k + 1);

                    // == random activity title selection
                    actTitleIndex = Math.floor(Math.random() * actTitles.length);
                    actTitle = actTitles[actTitleIndex];

                    // == trim last act if necessary
                    if (k == (actCount - 1)) {
                        actDur = actDur - actTrim;
                    }
                    acts[actName] = { actName:actName, actStart:actStart, actDur:actDur, actEnd:actEnd, actTitle:actTitle };
                    actStart = actEnd;
                }
                units[unitName].acts = acts;
                unitStart = unitEnd;
            }
            modules[modName].units = units;
            modStart = modEnd;
        }
        console.dir(modules);
        makeTimeline(modules);
    },

    // ======= activateDragger =======
    activateDragger: function() {
        console.log("activateDragger");

        $('#info-box').on('mouseenter', function(e) {
            console.log("mouseenter");
        });

        // ======= menu drag functions =======
        var dragger, startLoc;
        $('#info-box').on('mousedown', function(e) {
            console.log("mousedown");
            dragger = $(e.currentTarget);
            e.preventDefault();
            initDrag(e);
        });

        function initDrag(e){
            var locXY = $(dragger).offset();
            $(dragger).css('position', 'absolute');
            startLoc = { x: 0, y: 0 };
            startLoc.x = e.clientX - locXY.left;
            startLoc.y = e.clientY - locXY.top;
            window.addEventListener('mousemove', draggerMove, true);
            window.addEventListener('mouseup', mouseUp, true);
        }
        function draggerMove(e){
            var top = e.clientY - startLoc.y;
            var left = e.clientX - startLoc.x;
            $(dragger).css('top', top + 'px');
            $(dragger).css('left', left + 'px');
        }
        function mouseUp() {
            window.removeEventListener('mousemove', draggerMove, true);
        }

        // ======= error box =======
        function activateErrorModal() {
            $('#error-box button').on('click', function(e) {
                $('#error-box').fadeOut(200);
            });
        }
    }
};

clientApp.initialize();



// ======= ======= =======
