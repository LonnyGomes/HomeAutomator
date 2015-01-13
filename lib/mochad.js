/*jslint node: true */
module.exports = function (config) {
    'use strict';

    var net = require('net'),
        mocha_host = config.mochad_host,
        mocha_port = config.mochad_port,
        mocha_type = config.mochad_type,
        connect = function (host, port, callback) {
            var c = net.connect({
                host: mocha_host,
                port: mocha_port
            }, function (err) {
                if (err) {
                    console.error('Failed when connecting to mochad:' + err);
                }
                callback(err, c);
            });

            c.on("error", function (err) {
                console.log("Mochad connection failure:" + err);
                callback(err);
            });

            c.on("end", function () {
                console.log("mochad connection closed");
            });

            return c;
        },
        send = function (houseCode, deviceCode, state, callback) {
            connect(mocha_host, mocha_port, function (err, c) {
                var cmd = mocha_type + " " + houseCode +
                          deviceCode + " " + state + "\r\n";

                if (err) {
                    callback(err);
                } else {
                    console.log("sent:" + cmd);
                    c.on("data", function (data) {
                        console.log("received:" + data.toString());
                        c.end();
                        callback();
                    });

                    c.write(cmd);
                }
            });
        };

    return {
        sendOn: function (houseCode, deviceCode, callback) {
            send(houseCode, deviceCode, "on", callback);
        },
        sendOff: function (houseCode, deviceCode, callback) {
            send(houseCode, deviceCode, "off", callback);
        }
    };
};

