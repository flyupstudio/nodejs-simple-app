var express = require('express');
var router = express.Router();
var moment = require('moment');
var rp = require('request-promise');
var Promise = require('bluebird');
var request = Promise.promisifyAll(require("request"), {multiArgs: true});

/* Constants to create urls to API */
const DOMAIN = 'http://node.locomote.com/code-task/';
const AIRLINES = DOMAIN + 'airlines';
const AIRPORTS = DOMAIN + 'airports';
const FLIGHT_SEARCH = DOMAIN + 'flight_search/';
const DATE_FORMAT = 'YYYY-MM-DD';
var arrayOfDates = [-2, -1, 0, 1, 2];


router.get('/', function(req, res, next) {

    var airlines = null;
    var airportsA = null;
    var airportsB = null;

    var options = {
        uri: AIRLINES,
        json: true
    };

    var optionsA = {
        uri: AIRPORTS,
        json: true,
        qs: {
            q: req.query.fromLocation
        }
    };

    var optionsB = {
        uri: AIRPORTS,
        json: true,
        qs: {
            q: req.query.toLocation
        }
    };
    // built array of dates;
    var dates = [];
    arrayOfDates.map(function(el, pos, arrayOfDates){
        dates.push(moment(req.query.travelDate).add(el, 'days').format(DATE_FORMAT));
    });

    // make all requests to API throught Promise functionality
    rp(options)
        .then(function(response) {
            return Promise.all([rp(optionsA), rp(optionsB), response]);
        }).then(function(arrayOfData){
            var requests = [];
            dates.map(function (date) {
                return arrayOfData[2].map(function(airline){
                    return arrayOfData[0].map(function(fromCode){
                        return arrayOfData[1].map(function(toCode){
                            //generate url to get flights from API
                            if(airline.code){
                                requests.push([FLIGHT_SEARCH
                                    + airline.code
                                    + '?date=' + date
                                    + '&from=' + fromCode.airportCode
                                    + '&to=' + toCode.airportCode,
                                        date]
                                );
                            }
                        });
                    });
                });
            });
            return Promise.map(requests, function(url) {
                return request.getAsync(url[0]).spread(function(response,body) {
                    if(response.statusCode === 200) {
                        // return structural array of date, tickets information, url that parsed
                        return [url[1], JSON.parse(body), url[0]];
                    }
                });
            });
        }).then(function(result){
            res.json(result);

        });
});

module.exports = router;
