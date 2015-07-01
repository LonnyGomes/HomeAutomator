/*global require, exports */
var config = require("../public/config.json"),
    mochad = require("../lib/mochad")(config),
    Parse = require('node-parse-api').Parse,
    parseId = config.parse_app_id,
    parseKey = config.parse_api_key,
    parseApp = new Parse({
        app_id: parseId,
        api_key: parseKey
    });

function send(req, res, state) {
    "use strict";

    var houseCode = req.params.house,
        deviceCode = req.params.device,
        sendFunc = (state === "on" ? mochad.sendOn : mochad.sendOff);

    sendFunc(houseCode, deviceCode, function (err, data) {
        var obj = {status: 'success'};

        if (err) {
            log('error', err);
            obj.status = 'fail';
            obj.message = err;
            res.jsonp(obj);
        } else {
            log(state, 'Turned ' + state + ' ' + houseCode + deviceCode);
            res.jsonp(obj);
        }
    });
    //res.send("respond:" + req.params.house);
}

function log(actionType, msg) {
    "use strict";

    // add a Foo object, { foo: 'bar' }
    parseApp.insert('Log', { action: actionType, message: msg }, function (err, response) {
        console.log(response);
    });
}

function list(req, res) {
    "use strict";
    log("list", 'Listing all devices');
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
