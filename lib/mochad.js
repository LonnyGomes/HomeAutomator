/*jslint node: true */
var mocha_host = "localhost",
    mocha_port = 1099,
    mocha_type = "rf",
    net = require("net");

function connect(host, port, callback) {
    "use strict";

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
}

function send(houseCode, deviceCode, state, callback) {
    "use strict";

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
}

exports.sendOn = function (houseCode, deviceCode, callback) {
    "use strict";
    send(houseCode, deviceCode, "on", callback);
};

exports.sendOff = function (houseCode, deviceCode, callback) {
    "use strict";
    send(houseCode, deviceCode, "off", callback);
};

