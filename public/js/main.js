/*global angular, $ */
(function () {
    'use strict';
    var app = angular.module("App", ['ngRoute']);

    //routes
    app.config([ '$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/scenes', {
                templateUrl: 'templates/scenes.html',
                controller: 'ScenesController'
            })
            .when('/config', {
                templateUrl: 'templates/config.html',
                controller: 'ConfigController'
            })
            .otherwise({
                templateUrl: 'templates/devices.html',
                controller: 'DevicesController'
            });
    }]);

    // controllers
    app.controller("DevicesController", function ($scope, $http) {
        $scope.devices = [
            {
                "home_id": "a",
                "device_id": "3",
                "device_type": "appliance",
                "device_name": "Kitchen"
            },
            {
                "home_id": "a",
                "device_id": "4",
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
                        $('#status-modal .modal-header h4').text('Success');
                        $('#status-modal-content').text(d.device_name + " was turned " + state);
                        $('#status-modal').modal();
                    } else {
                        $('#status-modal .modal-header h4').text('Failed!');
                        $('#status-modal-content').text("FAILED to turn " + d.device_name + " " + state);
                        $('#status-modal').modal();
                    }
                }).
                error(function (data, status, headers, config) {
                    $('#status-modal .modal-header h4').text('Failed!');
                    $('#status-modal-content').text("FAILED to update " + d.device_name);
                    $('#status-modal').modal();
                });
        }

        $scope.turnOnDevice = function (d) {
            updateDevice(d, "on");
        };

        $scope.turnOffDevice = function (d) {
            updateDevice(d, "off");
        };


    });

    app.controller('ScenesController', function ($scope) {

    });

    app.controller('ConfigController', function ($scope) {

    });
}());
