/* Live Station Info */

/* Magic Mirror
 * Module: UV Data
 * By Nick Wootton
 * MIT Licensed.
 */

var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({
    start: function () {
        //console.log('MMM-UVData helper started ...');
    },


    /* getUVData()
	 * Requests new data from OpenUV.io
	 * Sends data back via socket on succesfull response.
	 */
    getUVData: function(url,api_key) {
        var self = this;

        var options = {
            url: url,
            headers: {
                'x-access-token': api_key
            },
            method: 'GET'
        };

        request(options, function(error, response, body) {
            if(!error && response.statusCode == 200) {
                self.sendSocketNotification('UV_DATA', {'data': JSON.parse(body), 'url': url});
            }
        });
    },

    //Subclass socketNotificationReceived received.
    socketNotificationReceived: function(notification, payload) {
        if (notification === 'GET_UVINFO') {
            this.getUVData(payload.url,payload.api_key);
        }
    }

});