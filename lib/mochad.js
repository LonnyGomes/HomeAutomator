/*global require, exports */
var mocha_host = "localhost",
    mocha_port = 1099,
    mocha_type = "rf",
    net = require("net");

function connect(host, port, callback) {
    "use strict";

    var c = net.connect({
        host: mocha_host,
        port: mocha_port
    }, function () {
        callback(c);
    });

    c.on("end", function () {
        console.log("DONE!");
    });

    return c;
}

function send(houseCode, deviceCode, callback, state) {
    "use strict";

    connect(mocha_host, mocha_port, function (c) {
        var cmd = mocha_type + " " + houseCode +
                  deviceCode + " " + state + "\r\n";

        console.log("seding:" + cmd);
        c.on("data", function (data) {
            console.log("TRYING ... data " + data + "," + c);
            callback();
            console.log("Got back:" + data.toString());
            c.end();
        });

        c.write(cmd);
    });
}

exports.sendOn = function (houseCode, deviceCode, callback) {
    "use strict";
    send(houseCode, deviceCode, callback, "on");
};

exports.sendOff = function (houseCode, deviceCode, callback) {
    "use strict";

    send(houseCode, deviceCode, callback, "off");
};

