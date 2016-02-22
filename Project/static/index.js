$(document).ready(function() {
    var currentValues = [];
    var currentRadioValueControl = "additive";
    var currentRadioValueThreat = "passive";
    var currentRadioIntVal = 1;
    var currentSliderBudgetValue = $("#budget-range-slider").val();
    var currentSliderGainValue = $("#relativegain-range-slider").val();

    var data = {
        labels: ["0", "10", "20", "30", "40", "50", "60", "70", "80", "90"],
		datasets: [
		    {
		        label: "Dataset",
				fillColor: "rgba(220,220,220,0)",
				strokeColor: "rgba(0,0,0,1)",
				pointColor: "rgba(0,0,0,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(220,220,220,1)",
				data: currentValues
	    	}
		]
    };

    var ctx = document.getElementById("pareto-optimal-chart").getContext("2d");
    var paretoChart = new Chart(ctx).Line(data);
    updateTable(currentValues);
    updateSolutionPerfTextArea();
    updateOptiStatTextArea();	

    function updateValues(currentValues) {
		convertRadioToIntValue(currentRadioValueControl, currentRadioValueThreat);
		for(var i = 0; i < currentValues.length; i++) {
		    if(currentRadioIntVal <= 3) {
		        currentValues[i] = (currentSliderBudgetValue / 7) * Math.pow(initValues[i], currentRadioIntVal) + (currentSliderGainValue * 2);
		    } else if(currentRadioIntVal > 3 && currentRadioIntVal <= 6) {
	            currentValues[i] = ((currentSliderBudgetValue / 7) * Math.sin(initValues[i]) + (currentSliderGainValue * 2) * currentRadioIntVal);
		    } else {
	            currentValues[i] = currentRadioIntVal / ((currentSliderBudgetValue / 7) * Math.log(initValues[i]) + (currentSliderGainValue * 2));
		    }
		}
    };

    function updateChart(datasetA, datasetB, chart) {
    	$('#pareto-optimal-chart').remove(); // this is my <canvas> element
  		$('#chart-area').append('<canvas id="pareto-optimal-chart" width="500" height="300"></canvas>');
  		var ctx = document.getElementById("pareto-optimal-chart").getContext("2d");

        var currdata = {
            labels: datasetB,
		    datasets: [
		        {
		            label: "Dataset",
		            fillColor: "rgba(220,220,220,0)",
				    strokeColor: "rgba(0,0,0,1)",
				    pointColor: "rgba(0,0,0,1)",
				    pointStrokeColor: "#fff",
				    pointHighlightFill: "#fff",
				    pointHighlightStroke: "rgba(220,220,220,1)",
				    data: datasetA
	            }
		    ]
        };

        chart = new Chart(ctx).Line(currdata);
    }

    function updateTable(dataset) {
    	var html = "";

    	for(var i = 0; i < dataset.length; i++) {
            var data = dataset[i].split(',')
    		html += "<tr><td>" + data[0] + "</td><td>" + data[1] + "</td><td>" + data[2] + "</td><td>" + data[3] + "</td></tr>"
    	}
    	$("#optimal-portfolio-table-body").html(html);
    }

    function updateSolutionPerfTextArea() {
    	$("#solution-performance-textarea").text("In last calculation mode of: " + currentRadioValueControl + " and " + currentRadioValueThreat + "\n Calculated: " + currentValues[0]);
    }

    function updateOptiStatTextArea() {
    	$("#optimisation-stat-textarea").text( "Optimisation value: " + currentValues[0]/2);
    }

    function updateModeStatusDisplay(currentControlValue, currentThreatValue) {
    	var newModeStatus = "Mode: " + currentControlValue + " and " + currentThreatValue;
    	$("#mode-text-paragraph").text(newModeStatus); 
    }

    function convertRadioToIntValue(currentControlValue, currentThreatValue) {
		if(currentControlValue == "additive") {
		    if(currentThreatValue == "passive") {
				currentRadioIntVal = 1;
		    } else if (currentThreatValue == "reactive") {
	        	currentRadioIntVal = 2;
		    } else {
		    	currentRadioIntVal = 3;
		    }
		} else if(currentControlValue == "multiplicative") {
		    if(currentThreatValue == "passive") {
				currentRadioIntVal = 4;
		    } else if (currentThreatValue == "reactive") {
	            currentRadioIntVal = 5;
		    } else {
		        currentRadioIntVal = 6;
		    }
		} else {
	        if(currentThreatValue == "passive") {
				currentRadioIntVal = 7;
		    } else if (currentThreatValue == "reactive") {
	            currentRadioIntVal = 8;
		    } else {
		        currentRadioIntVal = 9;
		    }
		}
    }

    $("input:radio[name='cyber-sec-control']").click(function() {
        currentRadioValueControl = $(this).val();
        console.log(currentRadioValueControl);
        updateModeStatusDisplay(currentRadioValueControl, currentRadioValueThreat);
    });

    $("input:radio[name='cyber-threat-control']").click(function() {
        currentRadioValueThreat = $(this).val();
   		console.log(currentRadioValueThreat);
        updateModeStatusDisplay(currentRadioValueControl, currentRadioValueThreat);
    });

    $("#budget-range-slider").click(function() {
        currentSliderBudgetValue = $(this).val();
        console.log(currentSliderBudgetValue);
    });

    $("#relativegain-range-slider").click(function() {
        currentSliderGainValue = $(this).val();
        console.log(currentSliderGainValue);
    });

    $("#pareto-btn").click(function() {
        var budgetVal = Number(currentSliderBudgetValue).toFixed(1);
        var gainVal = Number(currentSliderGainValue).toFixed(1);
        $.ajax({
            type: 'POST',
            url: '/',
            data: {
                threatvalue: currentRadioValueThreat, 
                controlvalue: currentRadioValueControl, 
                budget: budgetVal, 
                relativegain: gainVal 
            },
            success: function(data) {
                console.log(data);
                var data = JSON.parse(data);
                console.log(data);
                var x = 0;
                var len = data[1].length
                while(x < len){ 
                    data[1][x] = data[1][x].toFixed(1); 
                    x++
                }
                updateChart(data[0], data[1], paretoChart);
                updateTable(data[2]);
            }
        });

		/*updateValues(currentValues);		
		updateChart(currentValues, paretoChart); 
		updateTable(currentValues);
		updateOptiStatTextArea();
		updateSolutionPerfTextArea();*/
    });
});
