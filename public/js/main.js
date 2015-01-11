/*global angular, $ */
(function () {
    'use strict';
    var deviceModule = angular.module('DeviceModule', []),
        app = angular.module('App', ['ngRoute', 'DeviceModule']);

    //
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

    //
    // services
    deviceModule.factory('deviceFactory', [ '$http', '$q', '$timeout', function ($http, $q, $timeout) {
        var devices = [
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

        ], updateDeviceDelayed = function (home_id, device_id, state, delay) {
            var defer = $q.defer(),
                url = "/api/" + state + "/" + home_id + "/" + device_id +
                      "?callback=JSON_CALLBACK";

            $timeout(function () {
                $http.jsonp(url).
                    success(function (data, status, headers, config) {
                        if (data.status === "success") {
                            defer.resolve(data);
                        } else {
                            defer.reject("FAILED to turn " + device_id + " " + state);
                        }
                    }).
                    error(function (data, status, headers, config) {
                        defer.reject("FAILED to receive a response for " + device_id);
                    });
            }, delay);

            return defer.promise;
        }, updateDevice = function (home_id, device_id, state) {
            return updateDeviceDelayed(home_id, device_id, state, 0);
        };

        return {
            getDevices: function () {
                return devices;
            },
            updateDevice: updateDevice,
            updateDeviceDelayed: updateDeviceDelayed
        };
    }]);


    app.factory('messageFactory', [ function () {
        return {
            alert: function (title, msg) {
                $('#status-modal .modal-header h4').text(title);
                $('#status-modal-content').text(msg);
                $('#status-modal').modal();
            }
        };
    }]);

    //
    // directives
    app.directive('lgTab', ['$location', function ($location) {
        return {
            restrict: 'A',
            link: function link(scope, element, attrs) {
                var linkName = element.find('a').attr('href').substring(1);
                scope.$on('$routeChangeSuccess', function () {
                    var curLink = $location.path().substring(1);
                    if (linkName === curLink) {
                        element.addClass('active');
                    } else {
                        element.removeClass('active');
                    }
                });
            }
        };
    }]);

    //
    // controllers
    app.controller("DevicesController", function ($scope, $http, deviceFactory, messageFactory) {
        $scope.devices = deviceFactory.getDevices();

        function updateDevice(d, state) {
            deviceFactory.updateDevice(d.home_id, d.device_id, state).
                then(function (data) {
                    messageFactory.alert('Success', d.device_name + " was turned " + state);
                }, function (err) {
                    messageFactory.alert('Failure', 'FAILED to update ' + d.device_name);
                });
        }

        $scope.turnOnDevice = function (d) {
            updateDevice(d, "on");
        };

        $scope.turnOffDevice = function (d) {
            updateDevice(d, "off");
        };
    });

    app.controller('ScenesController', [ '$scope', 'deviceFactory', 'messageFactory', function ($scope, deviceFactory, messageFactory) {
        $scope.allOffClicked = function () {
            var p = null,
                firstDevice,
                devices = deviceFactory.getDevices();

            //if any devices were returned lets get the first one
            //and loop through each other device sequentially
            if (devices.length > 0) {
                firstDevice = devices.shift();

                //since updateDevice returns a promise, lets use reduce to
                //build a sequential chain of updateDevice calls
                p = devices.reduce(function (promise, d) {
                    return promise.then(function () {
                        //invoke a delayed call as not to flood the server
                        return deviceFactory.updateDeviceDelayed(d.home_id, d.device_id, "off", 2000);
                    });
                }, deviceFactory.updateDevice(firstDevice.home_id, firstDevice.device_id, "off"));

                if (p) {
                    p.then(function (data) {
                        messageFactory.alert('Success', 'All devices were shut off');
                    }, function (err) {
                        messageFactory.alert('Failure', 'Failed to turn off all devices: ' + err);
                    });
                }
            }
        };
    }]);

    app.controller('ConfigController', function ($scope) {

    });
}());
