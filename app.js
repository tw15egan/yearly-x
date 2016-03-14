var express = require('express');
var request = require('request');
var https = require('https');
var cfenv = require('cfenv');
var moment = require('moment');



// create a new express ser ver
var app = express();
var http = require('http')
var server = http.Server(app);
var io = require('socket.io')(server);

server.listen(process.env.PORT || 3000)


// Handlebars initialization
var handlebars = require('express-handlebars').create( { defaultLayout: 'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();


// Default route
app.get('/', function(req, res) {
    res.render('home');
});

io.on('connection', function (socket) {
    console.log('User connected!');

    socket.on('weatherSearch', function(query) {
        var url = 'https://autocomplete.wunderground.com/aq?query=' + query;
        var searchOutput = getWeatherQuery(url, function(results) {
            var searchOutput = handleResults(results);
            io.emit('weatherSearch', searchOutput)
        })
    })

    socket.on('weatherClick', function(query) {
	var weatherArray = []
	var nowMoment = moment()
	var nowDate = new Date()
	var now = moment(nowDate)
	for (var i = 0; i < 10; i++) {
		var date = now.subtract(i, 'days')
		date = date.format('YYYYMMDD')
		var url = 'http://api.wunderground.com/api/30fd7a559cd49cb5/history_' + date + query + '.json'
	        var weatherOutput = getWeather(url, function(results) {
	            var almanac = handleWeather(results);
		    weatherArray.push(almanac)
		    
	    })
    	}
	setTimeout(function() {
		io.emit('weatherClick', weatherArray)
	}, 1000)
    })
})

function weatherGuess(url, callback) {

}

function handleResults(results) {
    var output = '<ul class="search-results__list">'

    for( var i = 0; i < results.length; i++) {
        output += '<li><a href="" data-attr="' +
        results[i].l +
        '" class="search__result">' +
        results[i].name +
        '</a></li>'
    }
    output += '</ul>'
    return output
}

function getWeatherQuery(url, callback) {
    var options = {
        url: url,
        method : 'GET'
    };
    var res = '';
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res = JSON.parse(body).RESULTS;
        }
        else {
            res = 'Not Found';
        }
        callback(res);
    });
}

function getWeather(url, callback) {
    var options = {
        url: url,
        method : 'GET'
    };
    var res = '';
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res = JSON.parse(body).history.dailysummary;
        }
        else {
            res = 'Not Found';
        }
        callback(res);
    });
}

function handleWeather(results) {
    var max = results[0].maxtempi
    var min = results[0].mintempi
    var arr = [];

    arr.push(max, min);
    return arr;
}



module.exports = app
