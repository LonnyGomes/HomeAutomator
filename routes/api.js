/*global require, exports */
var config = require("../public/config.json"),
    mochad = require("../lib/mochad")(config);

function send(req, res, state) {
    "use strict";

    var houseCode = req.params.house,
        deviceCode = req.params.device,
        sendFunc = (state === "on" ? mochad.sendOn : mochad.sendOff);

    sendFunc(houseCode, deviceCode, function (err, data) {
        var obj = {status: 'success'};

        if (err) {
            obj.status = 'fail';
            obj.message = err;
            res.jsonp(obj);
        } else {
            res.jsonp(obj);
        }
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
