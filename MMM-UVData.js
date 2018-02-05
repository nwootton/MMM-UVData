/* UV Data Module */

/* Magic Mirror
 * Module: UV Data
 *
 * By Nick Wootton
 * based on SwissTransport module by Benjamin Angst http://www.beny.ch
 * MIT Licensed.
 */

Module.register("MMM-UVData", {

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

        debug: false
    },

    // Define required scripts.
    getStyles: function() {
        return ["uvdata.css", "font-awesome.css"];
    },

    // Define required scripts.
    getScripts: function() {
        return ["moment.js", this.file('titleCase.js')];
    },

    //Define header for module.
    getHeader: function() {
        return this.config.header;
    },

    // Define start sequence.
    start: function() {
        Log.info("Starting module: " + this.name);

        // Set locale.
        moment.locale(config.language);

        this.UVData = {};
        this.loaded = false;
        this.scheduleUpdate(this.config.initialLoadDelay);

        this.updateTimer = null;

        this.url = encodeURI(this.config.apiBase + this.getParams());

        if (this.config.debug) {
            Log.warn('URL Request is: ' + this.url);
        }

        this.updateUVInfo(this);
    },

    // updateUVInfo
    updateUVInfo: function(self) {
        self.sendSocketNotification('GET_UVINFO', { 'url': this.url });
    },

    // Override dom generator.
    getDom: function() {
        var wrapper = document.createElement("div");

        if (this.config.lat === "") {
            wrapper.innerHTML = "Please set the Latitude: " + this.lat + ".";
            wrapper.className = "dimmed light small";
            return wrapper;
        }

        if (this.config.lng === "") {
            wrapper.innerHTML = "Please set the Longditude: " + this.lng + ".";
            wrapper.className = "dimmed light small";
            return wrapper;
        }

        if (this.config.api_key === "") {
            wrapper.innerHTML = "Please set the API key: " + this.api_key + ".";
            wrapper.className = "dimmed light small";
            return wrapper;
        }

        if (!this.loaded) {
            wrapper.innerHTML = "Loading UV data ...";
            wrapper.className = "dimmed light small";
            return wrapper;
        }

        //Dump UV data
        if (this.config.debug) {
            Log.info(this.UVData);
        }

        // *** Start Building Table
        var table = document.createElement("table");
        table.className = "small";

        //With data returned
        if (this.UVData.data.length > 0) {
            var myUV = this.UVData.data;

            //Create row for Current UV
            var uvrow = document.createElement("tr");
            table.appendChild(uvrow);

            //UV cell
            var UVCurrentCell = document.createElement("td");
                UVCurrentCell.innerHTML = myUV.uv_current;

                if ((myUV.uv_current >=0) && (myUV.uv_current <=3)) {
                    UVCurrentCell.className = "bright low";
                }
                else if ((myUV.uv_current >=3) && (myUV.uv_current <=6)) {
                    UVCurrentCell.className = "bright moderate";
                }
                else if ((myUV.uv_current >=6) && (myUV.uv_current <=8)) {
                    UVCurrentCell.className = "bright high";
                }
                else if ((myUV.uv_current >=8) && (myUV.uv_current <=11)) {
                    UVCurrentCell.className = "bright veryhigh";
                }
                else if (myUV.uv_current >=11) {
                    UVCurrentCell.className = "bright extreme";
                }
                else {
                    UVCurrentCell.className = "bright ";
                }
                uvrow.appendChild(UVCurrentCell);

                //Time reported
                var UVTimeCell = document.createElement("td");
                UVTimeCell.innerHTML = myUV.uv_time;
                UVTimeCell.className = "time";
                uvrow.appendChild(UVTimeCell);

            //Create row for Current UV
            var uvrow = document.createElement("tr");
            table.appendChild(uvrow);

            //UV Max Values cell
            var UVMaxCell = document.createElement("td");
            UVMaxCell.innerHTML = myUV.uv_max;

                if ((myUV.uv_max >=0) && (myUV.uv_max <=3)) {
                    UVMaxCell.className = "bright low";
                }
                else if ((myUV.uv_max >=3) && (myUV.uv_max <=6)) {
                    UVMaxCell.className = "bright moderate";
                }
                else if ((myUV.uv_max >=6) && (myUV.uv_max <=8)) {
                    UVMaxCell.className = "bright high";
                }
                else if ((myUV.uv_max >=8) && (myUV.uv_max <=11)) {
                    UVMaxCell.className = "bright veryhigh";
                }
                else if (myUV.uv_max >=11) {
                    UVMaxCell.className = "bright extreme";
                }
                else {
                    UVMaxCell.className = "bright ";
                }
                uvrow.appendChild(UVMaxCell);


                //Time Max UV reported
                var UVMaxTimeCell = document.createElement("td");
                UVMaxTimeCell.innerHTML = myUV.uv_max_time;
                UVMaxTimeCell.className = "time";
                uvrow.appendChild(UVMaxTimeCell);


                if (this.config.fade && this.config.fadePoint < 1) {
                    if (this.config.fadePoint < 0) {
                        this.config.fadePoint = 0;
                    }
                    var startingPoint = this.UVData.length * this.config.fadePoint;
                    var steps = this.UVData.length - startingPoint;
                    if (t >= startingPoint) {
                        var currentStep = t - startingPoint;
                        row.style.opacity = 1 - (1 / steps * currentStep);
                    }
                }
        } else {
            var row1 = document.createElement("tr");
            table.appendChild(row1);

            var messageCell = document.createElement("td");
            messageCell.innerHTML = " " + this.UVData.message + " ";
            messageCell.className = "bright";
            row1.appendChild(messageCell);

            var row2 = document.createElement("tr");
            table.appendChild(row2);

            var timeCell = document.createElement("td");
            timeCell.innerHTML = " " + this.UVData.timestamp + " ";
            timeCell.className = "bright";
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

        //Check we have data back from API
        if (typeof data !== 'undefined' && data !== null) {

            //define object to hold UV info
            this.UVData = {};
            //Define array of UV data
            this.UVData.data = [];
            //Define message holder
            this.UVData.message = null;
            //Timestamp
            this.UVData.timestamp = new Date();

            //Check we have UV info
            if (typeof data.result !== 'undefined' && data.result !== null) {

                //.. and actual value
                if (data.result.length > 0) {

                    this.UVData.data.push({
                                uv_current: data.result.uv,
                                uv_time: data.result.uv_time,
                                uv_max: data.result.uv_max,
                                uv_max_time: data.result.uv_max_time,
                                ozone: data.result.ozone,
                                ozone_time: data.result.ozone_time
                            });
                } else {
                    //No uv info returned - set message
                    this.UVData.message = "No UV info found";
                    if (this.config.debug) {
                        Log.error("=======LEVEL 3=========");
                        Log.error(this.UVData);
                        Log.error("^^^^^^^^^^^^^^^^^^^^^^^");
                    }
                }

            } else {
                //No info returned - set message
                this.UVData.message = "No info about the UV levels returned";
                if (this.config.debug) {
                    Log.error("=======LEVEL 2=========");
                    Log.error(this.UVData);
                    Log.error("^^^^^^^^^^^^^^^^^^^^^^^");
                }
            }

        } else {
            //No data returned - set message
            this.UVData.message = "No data returned";
            if (this.config.debug) {
                Log.error("=======LEVEL 1=========");
                Log.error(this.UVData);
                Log.error("^^^^^^^^^^^^^^^^^^^^^^^");
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
        var params = "?";
        params += "lat=" + this.config.lat;
        params += "&lng=" + this.config.lng;
        params += "&altlat=" + this.config.alt;

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
        if (typeof delay !== "undefined" && delay >= 0) {
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
