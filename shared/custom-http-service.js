/*** @author Prakhar */
angular.module('MavenApp.httpService', []).factory(
    'httpService', ['$http','$log', 'MavenAppConfig',

        function ($http,$log ,config) {

            var httpService = {};

            httpService.postRequest = function (urlSuffix, data, callback) {

                httpService.postRequestWithoutLoadingMessage(urlSuffix, data, callback);

            }
            httpService.postRequestWithoutLoadingMessage = function (urlSuffix, data, callback) {

                $http.post(urlSuffix, $.param(data)).then(function (responseData) {
                    var data = responseData.data;
                    if (data) {
                        callback(data);
                    } else {

                        $.notify({icon:'glyphicons glyphicons-exclamation-sign', message: 'Something went wrong..!'}, {type: 'danger', placement: {align: 'center'}});
                        /*$.notify(errorMessage
                         ,{position:"top center" , className: 'error'});*/
                    }

                }, function (response) {
                    $log.error(response);
                    callback(response);
                });
            }

            httpService.postRequestFileUpload= function (urlSuffix, data, callback) {

                var upload = $http({
                    url: urlSuffix,
                    method: 'POST',
                    data: data,
                    headers: {
                        'Content-Type': undefined
                    }
                });


                upload.then(function (responseData)
                {
                    var data = responseData.data;
                    if (data) {
                        callback(data);
                    } else {

                        $.notify({
                            icon: 'glyphicons glyphicons-exclamation-sign',
                            message: 'Something went wrong..!'
                        }, {type: 'danger', placement: {align: 'center'}});
                        /*$.notify(errorMessage
                         ,{position:"top center" , className: 'error'});*/
                    }

                }, function (response) {
                    $log.error(response);
                    callback(response);
                });
            }
            httpService.getRequest = function (urlSuffix, callback) {

                $http.get(urlSuffix).then(function (responseData) {
                    var data = responseData.data;
                    if (data) {
                        callback(data);
                    } else {

                        $.notify({icon:'glyphicons glyphicons-exclamation-sign', message: 'Something went wrong..!'}, {type: 'danger', placement: {align: 'center'}});

                    }

                }, function (response) {
                    $log.error(response);
                    callback(response);
                });
            }

            return httpService;
        }]);
