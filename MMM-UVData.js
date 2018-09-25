/* UV Data Module */

/* Magic Mirror
 * Module: UV Data
 *
 * By Nick Wootton
 * based on SwissTransport module by Benjamin Angst http://www.beny.ch
 * MIT Licensed.
 */

Module.register('MMM-UVData', {

    // Define module defaults
    defaults: {
        updateInterval: 15 * 60 * 1000, // Update every 15 minutes.
        animationSpeed: 2000,
        fade: true,
        fadePoint: 0.25, // Start on 1/4th of the list.
        initialLoadDelay: 0, // start delay seconds.

        apiBase: 'https://api.openuv.io/api/v1/uv',

        lat:        '',     // Lat
        lng:        '',     // Lng
        api_key:    '',     // OpenUV API Key
        alt:        '',     // Altitude
        header:     'UV Index',

        showOzone:  true,   //DIsplay Ozone measurements in Dobson Units (du)

        debug: false
    },

    // Define required scripts.
    getStyles: function() {
        return ['uvdata.css', 'font-awesome.css'];
    },

    // Define required scripts.
    getScripts: function() {
        return ['moment.js', this.file('titleCase.js')];
    },

    //Define header for module.
    getHeader: function() {
        if (this.config.showOzone) {
            this.config.header = this.translate('HEADER_PLUS');
        }
        else {
            this.translate('HEADER');
        }

        return this.config.header;
    },

    //Get translations
    getTranslations: function() {
        return {
            en: 'translations/en.json',
            de: 'translations/de.json'
        };
    },

    // Define start sequence.
    start: function() {
        Log.info('Starting module: ' + this.name);

        // Set locale.
        moment.locale(config.language);

        this.UVData = {};
        this.loaded = false;
        this.scheduleUpdate(this.config.initialLoadDelay);

        this.updateTimer = null;

        this.url = encodeURI(this.config.apiBase + this.getParams());
        this.api_key = this.config.api_key;

        if (this.config.debug) {
            Log.warn('URL Request is: ' + this.url);
        }

        this.updateUVInfo(this);
    },

    // updateUVInfo
    updateUVInfo: function(self) {
        if (this.hidden != true) {
            self.sendSocketNotification('GET_UVINFO', { 'url': this.url, 'api_key': this.api_key });
        }
    },

    //format date output
    formatDate: function(formatDate, formatString) {
        if(formatDate instanceof Date) {
            var months = new Array('Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec');
            var yyyy = formatDate.getFullYear();
            var yy = yyyy.toString().substring(2);
            var m = formatDate.getMonth();
            var mm = m < 10 ? '0' + m : m;
            var mmm = months[m];
            var d = formatDate.getDate();
            var dd = d < 10 ? '0' + d : d;
            
            var h = formatDate.getHours();
            var hh = h < 10 ? '0' + h : h;
            var n = formatDate.getMinutes();
            var nn = n < 10 ? '0' + n : n;
            var s = formatDate.getSeconds();
            var ss = s < 10 ? '0' + s : s;
            formatString = formatString.replace(/yyyy/i, yyyy);
            formatString = formatString.replace(/yy/i, yy);
            formatString = formatString.replace(/mmm/i, mmm);
            formatString = formatString.replace(/mm/i, mm);
            formatString = formatString.replace(/m/i, m);
            formatString = formatString.replace(/dd/i, dd);
            formatString = formatString.replace(/d/i, d);
            formatString = formatString.replace(/hh/i, hh);
            formatString = formatString.replace(/h/i, h);
            formatString = formatString.replace(/nn/i, nn);
            formatString = formatString.replace(/n/i, n);
            formatString = formatString.replace(/ss/i, ss);
            formatString = formatString.replace(/s/i, s);
            return formatString;
        } else {
            return '';
        }
    },

    // Override dom generator.
    getDom: function() {
        var wrapper = document.createElement('div');

        if (this.config.lat === '') {
            wrapper.innerHTML = this.translate('SET_LAT') + ': ' + this.lat + '.';
            wrapper.className = 'dimmed light small';
            return wrapper;
        }

        if (this.config.lng === '') {
            wrapper.innerHTML = this.translate('SET_LON') + ': ' + this.lng + '.';
            wrapper.className = 'dimmed light small';
            return wrapper;
        }

        if (this.config.api_key === '') {
            wrapper.innerHTML = this.translate('SET_KEY') + ': ' + this.api_key + '.';
            wrapper.className = 'dimmed light small';
            return wrapper;
        }

        if (!this.loaded) {
            wrapper.innerHTML = this.translate('LOAD_MSG');
            wrapper.className = 'dimmed light small';
            return wrapper;
        }

        // *** Start Building Table
        var table = document.createElement('table');
        table.className = 'small';

        //With data returned
        if (typeof this.UVData.result !== 'undefined' && this.UVData.result !== null) {
            var myUV = this.UVData.result;

            //Create row for Current UV
            var uvrow = document.createElement('tr');
            table.appendChild(uvrow);

            //UV cell
            var UVCurrentCell = document.createElement('td');
            UVCurrentCell.innerHTML = myUV.uv_current;

            if ((myUV.uv_current >=0) && (myUV.uv_current <=3)) {
                UVCurrentCell.className = 'bright status low';
            }
            else if ((myUV.uv_current >=3) && (myUV.uv_current <=6)) {
                UVCurrentCell.className = 'bright status moderate';
            }
            else if ((myUV.uv_current >=6) && (myUV.uv_current <=8)) {
                UVCurrentCell.className = 'bright status high';
            }
            else if ((myUV.uv_current >=8) && (myUV.uv_current <=11)) {
                UVCurrentCell.className = 'bright status veryhigh';
            }
            else if (myUV.uv_current >=11) {
                UVCurrentCell.className = 'bright status extreme';
            }
            else {
                UVCurrentCell.className = 'bright ';
            }
            uvrow.appendChild(UVCurrentCell);

            //Time reported
            var UVTimeCell = document.createElement('td');
            var oUVDate = new Date (Date.parse(myUV.uv_time));


            UVTimeCell.innerHTML = this.translate('CURRENT_UV') + ' ' + this.formatDate(oUVDate, 'hh:nn');
            UVTimeCell.className = 'time';
            uvrow.appendChild(UVTimeCell);


            //Create row for Max UV
            var maxrow = document.createElement('tr');
            table.appendChild(maxrow);

            //UV Max Values cell
            var UVMaxCell = document.createElement('td');
            UVMaxCell.innerHTML = myUV.uv_max;

            if ((myUV.uv_max >=0) && (myUV.uv_max <=3)) {
                UVMaxCell.className = 'bright status low';
            }
            else if ((myUV.uv_max >=3) && (myUV.uv_max <=6)) {
                UVMaxCell.className = 'bright status moderate';
            }
            else if ((myUV.uv_max >=6) && (myUV.uv_max <=8)) {
                UVMaxCell.className = 'bright status high';
            }
            else if ((myUV.uv_max >=8) && (myUV.uv_max <=11)) {
                UVMaxCell.className = 'bright status veryhigh';
            }
            else if (myUV.uv_max >=11) {
                UVMaxCell.className = 'bright status extreme';
            }
            else {
                UVMaxCell.className = 'bright';
            }
            maxrow.appendChild(UVMaxCell);


            //Time Max UV reported
            var UVMaxTimeCell = document.createElement('td');
            var oUVMaxDate = new Date (Date.parse(myUV.uv_max_time));
            UVMaxTimeCell.innerHTML = this.translate('MAX_UV') + ' ' + this.formatDate(oUVMaxDate, 'hh:nn');
            UVMaxTimeCell.className = 'time';
            maxrow.appendChild(UVMaxTimeCell);


            //If required, show ozone levels
            if (this.config.showOzone) {
                //Create row for Ozone
                var ozonerow = document.createElement('tr');
                table.appendChild(ozonerow);

                //Ozone Values cell
                var OzoneCell = document.createElement('td');
                OzoneCell.innerHTML = myUV.ozone + ' du';
                OzoneCell.className = 'bright status';
                ozonerow.appendChild(OzoneCell);

                //Time Ozone reported
                var OzoneTimeCell = document.createElement('td');
                var oOzoneDate = new Date (Date.parse(myUV.ozone_time));
                OzoneTimeCell.innerHTML = this.translate('OZONE') + ' ' + this.formatDate(oOzoneDate, 'hh:nn');
                OzoneTimeCell.className = 'time';
                ozonerow.appendChild(OzoneTimeCell);

            }

        } else {
            var row1 = document.createElement('tr');
            table.appendChild(row1);

            var messageCell = document.createElement('td');
            messageCell.innerHTML = ' ' + this.UVData.message + ' ';
            messageCell.className = 'bright';
            row1.appendChild(messageCell);

            var row2 = document.createElement('tr');
            table.appendChild(row2);

            var timeCell = document.createElement('td');
            timeCell.innerHTML = ' ' + this.UVData.timestamp + ' ';
            timeCell.className = 'bright';
            row2.appendChild(timeCell);
        }

        wrapper.appendChild(table);
        // *** End building results table

        return wrapper;
    },

    /* processUVData(data)
     * Uses the received data to set the various values.
     *
     * argument data object - Weather information received form openweather.org.
     */
    processUVData: function(data) {

        //Dump UV data
        if (this.config.debug) {
            Log.info(data);
        }

        //Check we have data back from API
        if (typeof data !== 'undefined' && data !== null) {

            //define object to hold UV info
            this.UVData = {};
            //Define object for UV data
            this.UVData.result = {};
            //Define message holder
            this.UVData.message = null;
            //Timestamp
            this.UVData.timestamp = new Date();

            //Check we have UV info
            if (typeof data.result !== 'undefined' && data.result !== null) {

                if (this.config.debug) {
                    Log.info(data.result);
                }

                //.. and actual value
                if (typeof data.result.uv !== 'undefined' && data.result.uv !== null) {

                    this.UVData.result.uv_current = data.result.uv;
                    this.UVData.result.uv_time = data.result.uv_time;
                    this.UVData.result.uv_max = data.result.uv_max;
                    this.UVData.result.uv_max_time = data.result.uv_max_time;
                    this.UVData.result.ozone = data.result.ozone;
                    this.UVData.result.ozone_time = data.result.ozone_time;

                } else {
                    //No uv info returned - set message
                    this.UVData.message = 'No UV info found';
                    if (this.config.debug) {
                        Log.error('=======LEVEL 3=========');
                        Log.error(this.UVData);
                        Log.error('^^^^^^^^^^^^^^^^^^^^^^^');
                    }
                }

            } else {
                //No info returned - set message
                this.UVData.message = 'No info about the UV levels returned';
                if (this.config.debug) {
                    Log.error('=======LEVEL 2=========');
                    Log.error(this.UVData);
                    Log.error('^^^^^^^^^^^^^^^^^^^^^^^');
                }
            }

        } else {
            //No data returned - set message
            this.UVData.message = 'No data returned';
            if (this.config.debug) {
                Log.error('=======LEVEL 1=========');
                Log.error(this.UVData);
                Log.error('^^^^^^^^^^^^^^^^^^^^^^^');
            }
        }

        this.loaded = true;
        this.updateDom(this.config.animationSpeed);
    },


    /* getParams(compliments)
     * Generates an url with api parameters based on the config.
     *
     * return String - URL params.
     */
    getParams: function() {
        var params = '?';
        params += 'lat=' + this.config.lat;
        params += '&lng=' + this.config.lng;
        params += '&altlat=' + this.config.alt;

        if (this.config.debug) {
            Log.warn(params);
        }

        return params;
    },

    /* scheduleUpdate()
     * Schedule next update.
     *
     * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
     */
    scheduleUpdate: function(delay) {
        var nextLoad = this.config.updateInterval;
        if (typeof delay !== 'undefined' && delay >= 0) {
            nextLoad = delay;
        }

        var self = this;
        clearTimeout(this.updateTimer);
        this.updateTimer = setTimeout(function() {
            self.updateUVInfo(self);
        }, nextLoad);
    },


    // Process data returned
    socketNotificationReceived: function(notification, payload) {

        if (notification === 'UV_DATA' && payload.url === this.url) {
            this.processUVData(payload.data);
            this.scheduleUpdate(this.config.updateInterval);
        }
    }

});
