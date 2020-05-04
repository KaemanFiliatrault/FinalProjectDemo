var votePromise = d3.csv("demoData.csv");

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
    
    
    var screen = {width:500, height:400};
    
    var margins = {top:15, bottom:40, left:70, right:15};
    var graph =
    {
        width:screen.width-margins.left-margins.right,
        height:screen.height-margins.top-margins.bottom,
    }
    
    //set the screen size
    d3.select(target)
        .attr("width",screen.width)
        .attr("height",screen.height)
    
    var g = d3.select(target)
        .append("g")
        .classed("graph",true)
        .attr("transform", "translate(" +margins.left +","+ margins.top +")");    
    
    //build scales
    
     var xScale = d3.scaleBand()
                .domain(people.map(person => person.age))
                .range([0,graph.width]);
    var yScale = d3.scaleBand()
                .domain([1,2,3,4,5])
                .range([graph.height,0])
    
    var colorScale = d3.scaleLinear()
        .range(["white", "blue"])
        .domain([0,2])
    
    
    createLabels(screen,margins,graph,target);
    createAxes(screen,margins,graph,target,xScale,yScale);
    DrawHeatMap(people, graph, target, xScale, yScale, colorScale);
    
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
var DrawHeatMap = function(people, graph, target, xScale, yScale, colorScale)
{
    var heatMap = d3.select(target)
    .select(".graph")
    .selectAll("g")
    .data(people)
    .enter()
    .append("rect")
        .attr("x", function(person){return xScale(person.age) })
        .attr("y", function(person){return yScale(person.interest)})
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .style("fill",function(person){return colorScale(person.population)})
      
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
               if(people[i].age == NewObjectList[j].age  && NewObjectList[j].interest == people[i].interest)
                {
                    NewObjectList[j].population +=1
                    if(people[i].pid == "Independent"){NewObjectList[j].IndependentPop +=1}
                    if(people[i].sex == "Male"){NewObjectList[j].malePop +=1}
                    if(people[i].race == "Non-White"){NewObjectList[j].minorityPop +=1}
                    inList = true;
                    console.log("updated")
                }

        }
        if(inList == false)
        {
            NewObjectList.push({age: people[i].age, interest: people[i].interest, population:1, IndependentPop: 0, minorityPop: 0, malePop: 0})
            if(people[i].pid == "Independent"){NewObjectList[NewObjectList.length-1].IndependentPop +=1}
            if(people[i].sex == "Male"){NewObjectList[NewObjectList.length-1].malePop +=1}
            if(people[i].race == "Non-White"){NewObjectList[NewObjectList.length-1].minorityPop +=1}
            inList = true
        }
    }
    
    console.log(NewObjectList)
    return NewObjectList
}