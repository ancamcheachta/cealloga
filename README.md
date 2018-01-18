# cealloga
[![Build Status](https://travis-ci.org/ancamcheachta/cealloga.svg?branch=master)](https://travis-ci.org/ancamcheachta/cealloga)
[![Coverage Status](https://coveralls.io/repos/ancamcheachta/cealloga/badge.svg)](https://coveralls.io/r/ancamcheachta/cealloga)
[![npm version](https://badge.fury.io/js/cealloga.svg)](https://badge.fury.io/js/cealloga)
[![Documentation](https://doc.esdoc.org/github.com/ancamcheachta/cealloga/badge.svg)](https://doc.esdoc.org/github.com/ancamcheachta/cealloga)
[![Vulnerabilities](https://snyk.io/test/github/ancamcheachta/cealloga/badge.svg)](https://snyk.io/test/github/ancamcheachta/cealloga)

Ceallóga are simple ES6 arrow functions. Validate, test, and publish them as web
service endpoints, and do it all via an easy-to-use rest API.

## Requirements
* [Node 6.11+](https://nodejs.org/en/download/)
* [MongoDB 3.4+](https://docs.mongodb.com/manual/installation/)

## Install
`npm install -g cealloga`

## Run
`cealloga`

## Getting started
In this tutorial, we'll create a microservice that:
* takes information from a raw data source called `colours`
* sums the colours up and returns them as an object called `chartData`;
* something you might later consume in an UI component such as a bar chart, for
* example.

Before we begin, let's dissect the uncompressed source code we want to host as a
web service.
```javascript
(ceallog) => {
    let colours = ceallog.vars.colours, // A list of colours, POSTed by the user in the request body.
        coloursMap = {}, // A map of colours, where key will be colour name ('yellow') and value a total (`2`).
        chartData = {labels: [], series: []} // Chart data to build from incoming colours
    
    if (colours) { // Sum the colours...
        colours.forEach(c => coloursMap[c.name] = coloursMap[c.name] + 1 || 1);
    }
    
    for (var name in coloursMap) { // Push the `name` into labels and `total` into series in the same order.
        let total = coloursMap[name];
        
        chartData.labels.push(name);
        chartData.series.push(total);
    }
    
    return chartData;
}
```

### Validate
We create our code by first posting it to the `/code/validate` service. When we
do this, the request is validated, the code is compiled, it's added to the
database and cached on the server, and finally we receive a response with some
information about it.

1. Save the following file as `barchart.json`.
```json
{
   "name":"barchart",
   "label":"Colour Total Bar Chart",
   "body":"(ceallog)=>{let colours=ceallog.vars.colours,coloursMap={},chartData={labels:[],series:[]};if(colours){colours.forEach(c=>coloursMap[c.name]=coloursMap[c.name]+1||1)}for(var name in coloursMap){let total=coloursMap[name];chartData.labels.push(name);chartData.series.push(total)}return chartData;}"
}
```
2. In a terminal, run this curl command from the same directory as `barchart.json`:
```bash
curl -H "Content-Type: application/json" -X POST -d @barchart.json http://localhost:8080/code/validate
```

You should now have a response like the following. Copy the `"service"` value;
you'll need it in the next example!
```json
{
   "compiled":true,
   "id":"5a610660158ffae3135b7c7e",
   "created_date":"2018-01-18T20:41:04.849Z",
   "label":"Colour Total Bar Chart",
   "message":"Resource retrieved successfully.",
   "name":"barchart",
   "published":false,
   "service":"/cealloga/_test/5a610660158ffae3135b7c7e"
}
```

### Test
Now that the code has been validated and created, let's send it some colour data
and test the results.

1. Save the following file as `colours.json`.
```json
{"colours": [{"name": "blue"}, {"name": "yellow"}, {"name": "red"}, {"name": "yellow"}]}
```
2. In a terminal, run this curl command from the same directory as `colours.json`:
```bash
curl -H "Content-Type: application/json" -X POST -d @colours.json http://localhost:8080/cealloga/_test/5a610660158ffae3135b7c7e # <- replace with your _test endpoint from the validate example
```

If you're seeing the following, it worked!
```json
{
   "labels":[
      "blue",
      "yellow",
      "red"
   ],
   "series":[
      1,
      2,
      1
   ]
}
```

### Publish
Once we're happy with the test results, we can publish the function by name as
`/cealloga/barchart`.

Run the following curl command.
```bash
curl http://localhost:8080/code/publish/5a610660158ffae3135b7c7e # <- replace with the id from the validate example 
```

You should get a response like the following:
```json
{
   "body":"(ceallog)=>{let colours=ceallog.vars.colours,coloursMap={},chartData={labels:[],series:[]};if(colours){colours.forEach(c=>coloursMap[c.name]=coloursMap[c.name]+1||1)}for(var name in coloursMap){let total=coloursMap[name];chartData.labels.push(name);chartData.series.push(total)}return chartData;}",
   "compiled":true,
   "created_date":"2018-01-18T20:41:04.849Z",
   "id":"5a610660158ffae3135b7c7e",
   "label":"Colour Total Bar Chart",
   "name":"barchart",
   "published":true,
   "service":"/cealloga/barchart"
}
```

### Making a request to the published endpoint
The only thing left to day at this point is to check that `/cealloga/barchart`
is up and running.

In a terminal, run this curl command from the same directory as `colours.json`:
```bash
curl -H "Content-Type: application/json" -X POST -d @colours.json http://localhost:8080/cealloga/barchart
```

As in the test example above, if you're seeing the following, it worked again!
```json
{
   "labels":[
      "blue",
      "yellow",
      "red"
   ],
   "series":[
      1,
      2,
      1
   ]
}
```