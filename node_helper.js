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
    console.log('MMM-UVData helper started ...');
  },


	/* getTimetable()
	 * Requests new data from OpenUV.io
	 * Sends data back via socket on succesfull response.
	 */
  getTimetable: function(url) {
  		var self = this;
  		var retry = true;

      request({url:url, method: 'GET'}, function(error, response, body) {
        if(!error && response.statusCode == 200) {
          self.sendSocketNotification('TRAIN_DATA', {'data': JSON.parse(body), 'url': url});
        }
      });
  	},

  //Subclass socketNotificationReceived received.
  socketNotificationReceived: function(notification, payload) {
    if (notification === 'GET_TRAININFO') {
      this.getTimetable(payload.url);
    }
  }

});
