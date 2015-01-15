/*global angular, $ */
(function () {
    'use strict';
    var deviceModule = angular.module('DeviceModule', []),
        configModule = angular.module('ConfigModule', []),
        app = angular.module('App', ['ngRoute', 'DeviceModule', 'ConfigModule']);

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
    configModule.factory('deviceConfig', [ '$http', '$q', function ($http, $q) {
        var configDefer = $q.defer(),
            devicesDefer = $q.defer();

        $http.get('/config.json').
            success(function (data, status, headers, config) {
                configDefer.resolve(data);
                devicesDefer.resolve(data.devices);
            }).
            error(function (data, status, headers, config) {
                configDefer.reject('Failed to load config!');
                devicesDefer.reject('Failed to load config!');
            });

        return {
            getDevice: function (home_id, device_id) {
                var defer = $q.defer();
                devicesDefer.promise.then(function (devices) {
                    var idx,
                        curDevice,
                        retVal = null;

                    for (idx = 0; idx < devices.length; idx += 1) {
                        curDevice = devices[idx];
                        if (curDevice.home_id === home_id && curDevice.device_id === device_id) {
                            retVal = curDevice;
                            break;
                        }
                    }

                    if (retVal) {
                        defer.resolve(retVal);
                    } else {
                        defer.reject('Failed to find device: ' + home_id + device_id);
                    }
                });

                return defer.promise;
            },
            getDevices: function () {
                return devicesDefer.promise;
            },
            getConfig: function () {
                return configDefer.promise;
            }
        };
    }]);

    deviceModule.factory('deviceFactory', [ '$http', '$q', '$timeout', 'deviceConfig', function ($http, $q, $timeout, deviceConfig) {
        var updateDeviceDelayed = function (home_id, device_id, state, delay) {
            var defer = $q.defer(),
                url = "/api/" + state + "/" + home_id + "/" + device_id +
                      "?callback=JSON_CALLBACK";

            $timeout(function () {
                $http.jsonp(url).
                    success(function (data, status, headers, config) {
                        if (data.status === "success") {
                            //we want to notify as well as resolve
                            defer.notify({
                                "home_id": home_id,
                                "device_id": device_id,
                                "state": device_id
                            });
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
            getDevicesTest: function () {
                var devices = [];
                deviceConfig.getDevices().then(function (d) {
                    devices = d;
                });
                return devices;
            },
            getDevices: function () {
                return deviceConfig.getDevices().then(function (devices) {
                    return devices;
                });
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
                $('#status-modal .modal-footer').show(0);
                $('#status-modal').modal();
            },
            progress: function (msg) {
                $('#status-modal .modal-header h4').text("Updating ...");
                $('#status-modal-content').text(msg);
                $('#status-modal .modal-footer').hide(0);
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
        $scope.devices = [];
        deviceFactory.getDevices().then(function (d) {
            $scope.devices = d;
        });

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

    app.controller('ScenesController', [ '$scope', 'deviceFactory', 'deviceConfig', 'messageFactory', function ($scope, deviceFactory, deviceConfig, messageFactory) {

        var shutOffAllDevices = function (orig_devices) {
            var p = null,
                devices = orig_devices.slice(0),
                isResolved = false,
                firstDevice;

            //if any devices were returned lets get the first one
            //and loop through each other device sequentially
            if (devices.length > 0) {
                firstDevice = devices.shift();

                messageFactory.progress('Initializing ...');
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
                        isResolved = true;
                        messageFactory.alert('Success', 'All devices were shut off');
                    }, function (err) {
                        messageFactory.alert('Failure', 'Failed to turn off all devices: ' + err);
                    }, function (notify_data) {
                        deviceConfig.getDevice(notify_data.home_id, notify_data.device_id).then(function (d) {
                            if (!isResolved) {
                                messageFactory.progress(d.device_name + ' was shut off ...');
                            }
                        });
                    });
                }
            }
        };

        $scope.allOffClicked = function () {
            //retrieve all devices and then pass them in to get shut off
            deviceFactory.getDevices().then(function (d) {
                shutOffAllDevices(d);
            });
        };
    }]);

    app.controller('ConfigController', function ($scope) {

    });
}());
