var express = require('express');
var router = express.Router();
var request = require('request');
var rp = require('request-promise');
const AIRPORTS = 'http://node.locomote.com/code-task/airports';


/* GET users listing. */
router.get('/', function(req, res, next) {
    if(req.query.search.length >= 2){


        var airports = null;
        var options = {
            uri: AIRPORTS,
            json: true,
            qs: {
                q: req.query.search
            }
        };

        rp(options)
            .then(function(response){

                airports = response.map(function(el,i,airPorts){
                    return el.cityName;
                });
                /* get unique city names if there more than 1 airpots */
                airportsUnique = airports.filter(function(elem, pos) {
                    return airports.indexOf(elem) == pos;
                });
                res.send(airportsUnique);
            });
    } else {
        res.send();
    }

});

module.exports = router;
