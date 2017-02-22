$(function () {
    /* ajax sending form to search flights */
    $('#searchForm').validator().on('submit', function (e) {

        if (!e.isDefaultPrevented()) {
            e.preventDefault();
            var $this = $(this);
            var formData = $this.serialize();
            var btn = $this.find('[type="submit"]');
            //add loading to submit button to show loading intro
            btn.button('loading');
            $('#resultsTabs').hide(500);
            $.get('/search',formData,'json').done(function(response) {
                //alert( "second success" );
                btn.button('reset');

                var dates = operateWithDates(response); //parse dates to quick generate result table
                generateResultGrid(dates, $this); // results table generation

            }).fail(function() {
                btn.button('reset');
                alert( "Some error on request! Please try yet one time." );
            });
        }
    });

    /* autocompleter for cities name inputs */
    $('input[name="fromLocation"], input[name="toLocation"]').typeahead({
        onSelect: function(item) {
            console.log(item);
        },
        ajax: {
            url: "/airports",
            timeout: 500,
            triggerLength: 1,
            method: "get",
            loadingClass: "loading-circle",
            preDispatch: function (query) {
                return {
                    search: query
                }
            },
            preProcess: function (data) {
                return data;
            }
        }
    })

    /* initialize datetimepicker */
    $('#datetimepicker1').datetimepicker({
        format: 'YYYY-MM-DD'
    });
});

function generateResultGrid(dates, form){
    /* Generate tabs with results */
    var tabs = $('#resultsTabs');
    var tabsUl = tabs.find('ul');
    var tabsLi = tabsUl.find('li');

    var tabContent = tabs.find('.tab-content');
    /* clear old panel to show new data */
    tabContent.find('.tab-pane').remove();
    tabsLi.remove();
    $('#resultsTabs').show(500);

    for (date in dates){
        // draw content on tab container in table data

        tabsUl.append('<li ' +
            (date === form.find('input[name="travelDate"]').val() ? 'class="active"' : '') +
            '><a  href="#tab' + date + '" data-toggle="tab">' + date + '</a></li>'
        );

        var tabContentHTML = '';
        for(airlines in dates[date]){
            if(dates[date][airlines].length) {
                tabContentHTML += '<h3>' + dates[date][airlines][0].airline.name + '(' + airlines + ')' + '</h3><hr />';
                tabContentHTML += '<table width="100%" class="table-hover" cellpadding="5" cellspacing="5">';
                tabContentHTML += '<thead><tr><th>From/To</th><th>Flight Num</th><th>Plane</th><th>Duration</th><th>Start Time</th><th>Finish Time</th><th>Price</th></tr></thead><tbody>';

                var tiketsCount = dates[date][airlines].length;
                for (var i = 0; i < tiketsCount; i++) {
                    tabContentHTML += '<tr><td >' + dates[date][airlines][i].start.cityName + ' (' +
                        dates[date][airlines][i].start.airportName + ')/<br />' +
                        dates[date][airlines][i].finish.cityName + ' (' +
                        dates[date][airlines][i].finish.airportName + ')' +

                    '</td>' +
                    '<td>' + dates[date][airlines][i].flightNum + '</td>' +
                    '<td>' + dates[date][airlines][i].plane.fullName + '</td>' +
                    '<td>' + (dates[date][airlines][i].durationMin / 60).toFixed(2) + '</td>' +
                    '<td>' + moment(dates[date][airlines][i].start.dateTime).format('hh:mm') + '</td>' +
                    '<td>' + moment(dates[date][airlines][i].finish.dateTime).format('hh:mm') + '</td>' +
                    '<td>$' + dates[date][airlines][i].price + '</td></tr>';
                }

                tabContentHTML += '</tbody></table>';
            }


        }


        tabContent.append('<div class="tab-pane ' +
            (date === form.find('input[name="travelDate"]').val() ? 'active' : '') +
            '" id="tab' + date + '">' +
            tabContentHTML +
            '</div>');
    }

}

function operateWithDates(dates){
    /*/!*
     manipulating with result data to create more frendly structure on JSON to quick print on front-end
     like DATE->AIRLINE->FLIGHT
     ->AITLINE1->FLIGHT
     DATE1->AIRLINE->FLIGHT
     ->AITLINE1->FLIGHT
     *!/
     */
    var resultsWithDates = {};

    for(var i = 0, lengthI = dates.length; i < lengthI; i++){
        if((dates[i] instanceof  Array) && dates[i].length) {
            var date = dates[i][0];

            if (typeof(resultsWithDates[date]) === 'undefined') {
                resultsWithDates[date] = {};
            }

            var flights = dates[i][1];

            for (var j = 0, lengthJ = flights.length; j < lengthJ; j++) {
                if (typeof(resultsWithDates[date][flights[j]['airline']['code']]) === 'undefined') {
                    resultsWithDates[date][flights[j]['airline']['code']] = [];
                }
                resultsWithDates[date][flights[j]['airline']['code']].push(flights[j]);
            }
        }
    }

    return resultsWithDates;
}