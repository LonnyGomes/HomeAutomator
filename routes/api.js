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

function parseLog(actionType, msg) {
    "use strict";

    // add a Foo object, { foo: 'bar' }
    parseApp.insert('Log', { action: actionType, message: msg }, function (err, response) {
        if (err) {
            console.error(err);
        } else {
            console.log(response);
        }
    });
}


function send(req, res, state) {
    "use strict";

    var houseCode = req.params.house,
        deviceCode = req.params.device,
        sendFunc = (state === "on" ? mochad.sendOn : mochad.sendOff);

    sendFunc(houseCode, deviceCode, function (err) {
        var obj = {status: 'success'};

        if (err) {
            parseLog('error', err);
            obj.status = 'fail';
            obj.message = err;
            res.jsonp(obj);
        } else {
            parseLog(state, 'Turned ' + state + ' ' + houseCode + deviceCode);
            res.jsonp(obj);
        }
    });
    //res.send("respond:" + req.params.house);
}

function list(req, res) {
    "use strict";
    parseLog("list", 'Listing all devices');
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
