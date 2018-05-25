/**
 * Project Name Maven
 * Created by Prakhar Srivastava on 28-11-2017.
 */
angular.module('OMSApp.puchaseorderService', []).factory('PONumberService', ['$q', '$http','MavenAppConfig' , function($q, $http,MavenAppConfig)
    {
var PONumberService={};

PONumberService.getPurchaseOrder=function(orderNo,systemOrderNo) {
    if (orderNo) {
        var deferred = $q.defer();
        var checkOrderNo = MavenAppConfig.baseUrlSource + "/omsservices/webapi/purchase/order/clientordernumber?clientordernumber=" + orderNo;
        if (systemOrderNo) {
            checkOrderNo += "&systemordernumber=" + systemOrderNo;
        }
        $http.get(checkOrderNo)
            .then(function (response) { //
                // Found the user, therefore not unique.
                if (response.data) {
                    deferred.reject();
                }
                else {
                    deferred.resolve();
                }

            }, function () {
                deferred.resolve();
            });

        return deferred.promise;
    }
    else {
        return $q.resolve();
    }
    return PONumberService;
}

}]);