/*global angular */
(function () {
    'use strict';
    var app = angular.module("App", []);

    // controllers
    app.controller("DevicesController", function ($scope, $http) {
        $scope.devices = [
            {
                "home_id": "a",
                "device_id": "3",
                "device_type": "appliance",
                "device_name": "Christmas Lights"
            },
            {
                "home_id": "a",
                "device_id": "5",
                "device_type": "appliance",
                "device_name": "Fan"
            },
            {
                "home_id": "a",
                "device_id": "7",
                "device_type": "dimmer",
                "device_name": "Bedroom"
            },
            {
                "home_id": "a",
                "device_id": "8",
                "device_type": "appliance",
                "device_name": "Office"
            }

        ];

        function updateDevice(d, state) {
            var url = "/api/" + state + "/" + d.home_id + "/" + d.device_id;
            $http.get(url).
                success(function (data, status, headers, config) {
                    if (data.status === "success") {
                        alert(d.device_name + " was turned " + state);
                    } else {
                        alert("FAILED to turn " + d.device_name + " " + state);
                    }
                }).
                error(function (data, status, headers, config) {
                    alert("FAILED to update " + d.device_name);
                });
        }

        $scope.turnOnDevice = function (d) {
            updateDevice(d, "on");
        };

        $scope.turnOffDevice = function (d) {
            updateDevice(d, "off");
        };


    });
}());
