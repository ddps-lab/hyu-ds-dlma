/* Copyright 2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use 
this file except in compliance with the License. A copy of the License is 
located at

http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an 
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or 
implied. See the License for the specific language governing permissions and 
limitations under the License. */

var apiGatewayUrl = 'https://1234567890.execute-api.us-west-2.amazonaws.com/prod/vote'; // Replace with your API Gateway Invoke URL

/* Create the context for applying the chart to the HTML canvas */
var ctx = $("#graph").get(0).getContext("2d");

/* Set the options for our chart */
var options = { segmentShowStroke : false,
								animateScale: true,
								percentageInnerCutout : 50,
                showToolTips: true,
                tooltipEvents: ["mousemove", "touchstart", "touchmove"],
                tooltipFontColor: "#fff",
								animationEasing : 'easeOutCirc'
              }

/* Set the initial data */
var init = [
  {
      value: 1,
      color: "#e74c3c",
      highlight: "#c0392b",
      label: "Red"
  },
  {
      value: 1,
      color: "#2ecc71",
      highlight: "#27ae60",
      label: "Green"
  },
  {
      value: 1,
      color: "#3498db",
      highlight: "#2980b9",
      label: "Blue"
  }
];

graph = new Chart(ctx).Doughnut(init, options);

$(function() {
  getData();
  $.ajaxSetup({ cache: false });
  /* Get the data every 3 seconds */
  setInterval(getData, 3000);
});

/* Makes a call to API Gateway to get data for the chart */
function getData() {
  $.ajax({
    url: apiGatewayUrl,
    type: 'GET',
    success: function(data) {
      var voteCounts = JSON.parse(data.body);

      var redCount = voteCounts.RED || 0;
      var greenCount = voteCounts.GREEN || 0;
      var blueCount = voteCounts.BLUE || 0;

      var chartData = [
        {
            value: redCount,
            color:"#e74c3c",
            highlight: "#c0392b",
            label: "Red"
        },
        {
            value: greenCount,
            color: "#2ecc71",
            highlight: "#27ae60",
            label: "Green"
        },
        {
            value: blueCount,
            color: "#3498db",
            highlight: "#2980b9",
            label: "Blue"
        }
      ];

      /* Only update if we have new values (preserves tooltips) */
      if (  graph.segments[0].value != chartData[0].value ||
            graph.segments[1].value != chartData[1].value ||
            graph.segments[2].value != chartData[2].value
         )
      {
        graph.segments[0].value = chartData[0].value;
        graph.segments[1].value = chartData[1].value;
        graph.segments[2].value = chartData[2].value;
        graph.update();
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("Error fetching data from API Gateway: ", textStatus, errorThrown);
      console.log(jqXHR.responseText);
    }
  });
}
