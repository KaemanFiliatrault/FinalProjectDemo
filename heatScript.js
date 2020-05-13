var votePromise = d3.csv("finalLabData.csv");

votePromise.then(function(people)
{
    console.log("data",people); 
    people = manipulateCsv(people);
    initGraph(people,"#HeatMap");
},
function(err)
{
   console.log("Error Loading data:",err);
});

var initGraph = function(people, target)
{
    people = people.sort((a,b)=> (a.age > b.age)? 1: -1);
    
    var screen = {width:560, height:400};
    
    var margins = {top:15, bottom:40, left:70, right:75};
    var graph =
    {
        width:screen.width-margins.left-margins.right,
        height:screen.height-margins.top-margins.bottom,
    }
    
     var lengths = {
        screen:screen,
        margins:margins,
        graph:graph
    }
    
    //set the screen size
    d3.select(target)
        .attr("width",screen.width)
        .attr("height",screen.height)
    
    var g = d3.select(target)
        .append("g")
        .classed("graph",true)
        .attr("transform", "translate(" +margins.left +","+ margins.top +")"); 
    
    //Addition
    var legend = d3.select(target)
        .append("g")
        .classed("legend", true)
    var svg = legend.append("svg")
        .attr("id", "legendSvg")
    console.log(svg)

    
    //build scales
    
     var xScale = d3.scaleBand()
                .domain(people.map(person => person.age))
                .range([0,graph.width]);
    var yScale = d3.scaleBand()
                .domain([1,2,3,4,5])
                .range([graph.height,0])
    var legendScale = d3.scaleLinear()
                .domain([0,getMaxPop(people)])
                .range([0,screen.height/3])
    
    var colorScale = d3.scaleLinear()
        .range(["white", "teal"])
        .domain([0,getMaxPop(people)])
    var labelTitle = "Population by Color"
    
    
    
    
    //calls for legend
   
    createLegendAxes(legendScale,margins,screen,"#legendSvg")
    createLegendLabel("#legendSvg","Population by Color",margins, screen)
    createGradiant("#legendSvg","white","teal")
    createLegend(screen, margins, screen, "#legendSvg","white", "teal", legendScale, labelTitle)
    
    //calls for actual graph
    createLabels(screen,margins,graph,target);
    createAxes(screen,margins,graph,target,xScale,yScale);
    DrawHeatMap(people, graph, target, xScale, yScale, colorScale, function(person){return person.population},function(person){return person.population},"white","teal");
    initButtons(people, target, xScale, yScale, lengths);
    
}
var createLabels = function(screen, margins, graph, target)
{
    var labels = d3.select(target)
        .append("g")
        .classed("labels",true)
    
    labels.append("text")
        .text("Political Interest Across Age Groups")
        .classed("title",true)
        .attr("text-anchor","middle")
        .attr("x",margins.left+(graph.width/2))
        .attr("y",margins.top -5)
    
    labels.append("text")
         .text("Age")
        .classed("label",true)
        .attr("text-anchor","middle")
        .attr("x",margins.left+(graph.width/2))
        .attr("y",screen.height - 5)
    
    labels.append("g")
        .attr("transform","translate(20,"+ 
              (margins.top+(graph.height/2))+")")
        .append("text")
        .text("Interest Level")
        .classed("label",true)
        .attr("text-anchor","middle")
        .attr("transform","rotate(90)")
 
    
}
var createLegend = function(screen, margins, graph, target,startColor, endColor,legendScale,labelTitle)
{
   
    updateLegendAxes(legendScale,target)
    updateLegendLabel("#legendText",labelTitle)
    updateGradiant(startColor,endColor)

    svg = d3.select(target)
    svg.append("rect")
            .attr("id", "labelRect")
            .attr("width", "10")
            .attr("height", screen.height/3)
            .attr("x", screen.width - margins.right + 35)
            .attr("y", margins.top + 15)
            .attr("fill", "url(#linearGradient)")
            .attr("stroke", "black")
          
}
var createGradiant= function(target,startColor,endColor)
{
    var svg = d3.select(target)
    
    var def = svg.append("defs")
    var linearGradient = def.append("linearGradient")
            .attr("id", "linearGradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%")
            .attr("spreadMethod", "pad")
    //Set the color for the start (0%)
    linearGradient.append("stop")
        .attr("id","startColor")
        .attr("offset", "0%")
        .attr("stop-color", startColor);

    //Set the color for the end (100%)
    linearGradient.append("stop")
        .attr("id","endColor")
        .attr("offset", "100%")
        .attr("stop-color", endColor); //dark blue
}
var updateGradiant= function(startColor,endColor)
{
    d3.select("#startColor")
        .transition()
        .attr("stop-color", startColor)
    
    d3.select("#endColor")
        .transition()
        .attr("stop-color", endColor)
}
var createLegendLabel = function(target,labelTitle, margins, screen)
{
    console.log(screen.width)
    d3.select(target).append("g")
            .attr("transform","translate("+(screen.width + 10)+","+(- screen.height - margins.bottom +5)+")")
            .append("text")
            .attr("id", "legendText")
            .text(labelTitle)
                .style("font-size","14")
                .attr("x",screen.width - margins.right +45)
                .attr("y", margins.top +15)
                .attr("text-anchor","middle")
                .attr("transform","rotate(90)")
}
var updateLegendLabel = function(target,labelTitle)
{
    d3.select(target)
        .text(labelTitle)
}
var createLegendAxes = function(legendScale, margins, screen, target)
{
    console.log(screen.width)
    var legendAxis = d3.axisLeft(legendScale)
            .ticks(5);
    var lAxis = d3.select(target)
            .append("g")
            .classed("lAxis", "true")
            .attr("transform","translate("+(screen.width - margins.right +35) +","+(margins.top +15)+")")
            .call(legendAxis)
    
    
    
}
var updateLegendAxes = function(legendScale,target)
{
    var legendAxis = d3.axisLeft(legendScale)
            .ticks(5);
    
    d3.select(".lAxis")
        .transition()
        .duration(500)
        .call(legendAxis)
}
var createAxes = function(screen,margins,graph,
                           target,xScale,yScale)
{
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);
    
    var axes = d3.select(target)
        .append("g")
    axes.append("g")
        .attr("transform","translate("+margins.left+","
             +(margins.top+graph.height)+")")
        .call(xAxis)
    axes.append("g")
        .attr("transform","translate("+margins.left+","
             +(margins.top)+")")
        .call(yAxis)
}
var initButtons = function(people,target, xScale, yScale, lengths)
{
    
    d3.select("#default")
    .on("click",function()
    {
        //clear old stuff
        
        //clearLegend(".legend");
        
        // redefineScales
        var colorScale = d3.scaleLinear()
            .range(["white", "teal"])
            .domain([0,getMaxPop(people)])
        var legendScale = d3.scaleLinear()
                .domain([0,getMaxPop(people)])
                .range([0,lengths.screen.height/3])
        
        //draw map and legend
        DrawHeatMap(people, lengths.graph, target, xScale, yScale, colorScale,function(person){return person.population},function(person){return person.population},"white","teal");
        createLegend(lengths.screen, lengths.margins, lengths.graph, "#legendSvg", "white", "teal",legendScale,"Population by Color")
    })
    
    
    d3.select("#mvf")
    .on("click",function()
    {
        //clearLegend(".legend");
        
        var colorScale = d3.scaleLinear()
            .range(["white", "pink"])
            .domain([0,getFemalePercentage(people)])
        
        var legendScale = d3.scaleLinear()
                .domain([0,getFemalePercentage(people)])
                .range([0,lengths.screen.height/3])
        
        
        DrawHeatMap(people, lengths.graph, target, xScale, yScale, colorScale,function(person){return (person.population - person.malePop)/person.population*100},function(person){return person.population - person.malePop},"white","pink");
        
        createLegend(lengths.screen, lengths.margins, lengths.graph, "#legendSvg", "white", "pink",legendScale,"Female Percentage")
    })
     d3.select("#wvm")
    .on("click",function()
    {
        //clearLegend(".legend");
        
        var colorScale = d3.scaleLinear()
            .range(["white", "orange"])
            .domain([0,getMinorityPercentage(people)])
        
        var legendScale = d3.scaleLinear()
                .domain([0,getMinorityPercentage(people)])
                .range([0,lengths.screen.height/3])
        
        
        DrawHeatMap(people, lengths.graph, target, xScale, yScale, colorScale,function(person){return (person.minorityPop)/person.population*100},function(person){return person.minorityPop},"white","orange");
        createLegend(lengths.screen, lengths.margins, lengths.graph, "#legendSvg", "white", "orange",legendScale,"Minority Percentage")
    })
     d3.select("#ivp")
    .on("click",function()
    {
        //clearLegend(".legend");
        
        var colorScale = d3.scaleLinear()
            .range(["white", "red"])
            .domain([0,getIndependentPercentage(people)])
            console.log(getIndependentPercentage(people))
        
        var legendScale = d3.scaleLinear()
                .domain([0,getIndependentPercentage(people)])
                .range([0,lengths.screen.height/3])
        
        
        DrawHeatMap(people, lengths.graph, target, xScale, yScale, colorScale,function(person){return (person.IndependentPop)/person.population*100},function(person){return person.IndependentPop},"white","red");
        createLegend(lengths.screen, lengths.margins, lengths.graph, "#legendSvg", "white", "red",legendScale,"Independent Percentage")
    })
    
}
    
var DrawHeatMap = function(people, graph, target, xScale, yScale, colorScale,colorFunction,pieFunction, pieColor1, pieColor2,pieText1)
{
    //Join
    var heatMap = d3.select(target)
    .select(".graph")
    .selectAll("g")
    .data(people)
    //Enter
    .enter()
    .append("rect")
    //Exit
    heatMap.exit()
        .remove();
    //update
    heatMap =d3.select(target)
        .select(".graph")
        .selectAll("rect")
        .attr("x", function(person){return xScale(person.age) })
        .attr("y", function(person){return yScale(person.interest)})
        .style("fill","white")
    heatMap.transition()
        .duration(1500)
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .style("fill",function(person){return colorScale(colorFunction(person))})
    heatMap.on("mouseover", function(person)
        {
            var person = person
            var xPosition = d3.event.PageX;
            var yPosition = d3.event.PageY;
            d3.select("#tooltip")
                .style("left", xPosition + "px")
                .style("top", yPosition + "px")
            d3.select("#pieChart")
            drawPieChart(person, "#pieChart", pieFunction, pieColor1, pieColor2)
            d3.select("#tooltip").classed("hidden",false)
                       
        })
        .on("mouseout", function(){
            d3.select("#tooltip svg").remove();
            d3.select("#tooltip")
                .classed("hidden", true)
                .append("svg")
                    .attr("id","pieChart")
            
        })
      
}
var drawPieChart = function(person, target, specificFunction, pieColor1, pieColor2)
{
    
    var datapoint1 = Math.round(specificFunction(person))
    var datapoint2 = person.population- datapoint1
    var color = d3.scaleOrdinal()
        .range([pieColor2,pieColor1]);
    
    var dataset = [datapoint1,datapoint2]
    var pie =d3.pie();
    var w = 300;
    var h = 300;
    var outerRadius = w/2;
    var innerRadius = 0;
    var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);
    var svg = d3.select(target)
        .attr("width", w)
        .attr("height", h);
    
    var arcs = svg.selectAll("g.arc")
        .data(pie(dataset))
        .enter()
        .append("g")
        .attr("class", "arc")
        .attr("transform", "translate("+outerRadius + "," + outerRadius +")");
    arcs.append("path")
        .attr("fill", function(d,i){return color(i)})
        .attr("stroke","black")
        .attr("d", arc)
    arcs.append("text")
        .attr("transform", function(d){
            return "translate("+arc.centroid(d) +")";
        })
        .attr("text-anchor", "middle")
        .text(function(d){if(d.value > 0){if(d.value == 1){return d.value + " Person"} else{return d.value + " People"}}});
 
}
// helper functions that dont draw anything, but make code more readable for people.

var getMaxPop = function(people)
{
    return d3.max(people.map(function(person){return person.population}))
}
var getFemalePercentage = function(people)
{
    return d3.max(people.map(function(person){return (person.population - person.malePop)/person.population *100}))
}
var getMinorityPercentage = function(people)
{
    return d3.max(people.map(function(person){return person.minorityPop/person.population *100}))
}
var getIndependentPercentage = function(people)
{
    return d3.max(people.map(function(person){return person.IndependentPop/person.population *100}))
}
// creates a new list of objects in order to give stats about population instead of individuals
var manipulateCsv = function(people)
{
    var NewObjectList = []
    NewObjectList.push({age: "130", interest: 1, population:0, IndependentPop: 0, minorityPop: 0, malePop: 0})
    var i;
    var j;
    for (i = 0; i < people.length; i++) 
    {
        var inList = false;
        for (j = 0; j <NewObjectList.length;j++)
        {
               if(Math.floor(people[i].age/10)*10 == NewObjectList[j].age  && NewObjectList[j].interest == people[i].interest)
                {
                    NewObjectList[j].population +=1
                    if(people[i].pid == "Independent"){NewObjectList[j].IndependentPop +=1}
                    if(people[i].sex == "Male"){NewObjectList[j].malePop +=1}
                    if(people[i].race == "Non-Whte"){NewObjectList[j].minorityPop +=1}
                    inList = true;
                    console.log("updated")
                }

        }
        if(inList == false)
        {
            NewObjectList.push({age: Math.floor(people[i].age/10)*10, interest: people[i].interest, population:1, IndependentPop: 0, minorityPop: 0, malePop: 0})
            if(people[i].pid == "Independent"){NewObjectList[NewObjectList.length-1].IndependentPop +=1}
            if(people[i].sex == "Male"){NewObjectList[NewObjectList.length-1].malePop +=1}
            if(people[i].race == "Non-Whte"){NewObjectList[NewObjectList.length-1].minorityPop +=1}
            inList = true
        }
    }
    console.log(NewObjectList)
    return NewObjectList
}