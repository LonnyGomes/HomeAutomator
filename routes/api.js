/*global require, exports */
var config = require("../public/config.json"),
    mochad = require("../lib/mochad")(config),
    Parse = require('node-parse-api').Parse,
    parseId = config.parse_app_id,
    parseKey = config.parse_api_key,
    parseApp = new Parse(parseId, parseKey);

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

function list(req, res) {
    "use strict";
    res.jsonp(config.devices);
}

exports.on = function (req, res) {
    "use strict";
    send(req, res, "on");
};

exports.off = function (req, res) {
    "use strict";
    send(req, res, "off");
};

exports.list = function (req, res) {
    "use strict";

    list(req, res);
};
