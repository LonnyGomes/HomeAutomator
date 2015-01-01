/*global require, exports */
var mochad = require("../lib/mochad");

function send(req, res, state) {
    "use strict";

    var houseCode = req.params.house,
        deviceCode = req.params.device,
        sendFunc = (state === "on" ? mochad.sendOn : mochad.sendOff);

    sendFunc(houseCode, deviceCode, function (err, data) {
        res.send("{status: success }");
    });
    //res.send("respond:" + req.params.house);
}

exports.on = function (req, res) {
    "use strict";
    send(req, res, "on");
};

exports.off = function (req, res) {
    "use strict";
    send(req, res, "off");
};
