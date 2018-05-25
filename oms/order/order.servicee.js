/**
 * Project Name Maven
 * Created by Prakhar Srivastava on 28-11-2017.
 */
angular.module('OMSApp.ordernumberservice', []).
factory('orderNumberService', ['$q', '$http','MavenAppConfig' , function($q, $http,MavenAppConfig) {
    var orderNumberService={};
    orderNumberService.getUniqueOrder= function(orderNo,systemOrderNo) {
        if(orderNo){
            var deferred = $q.defer();
            var checkOrderNo =     MavenAppConfig.baseUrlSource + "/omsservices/webapi/orders/clientordernumber?clientorderno=" + orderNo;
            if(systemOrderNo)
            {
                checkOrderNo +="&systemordernumber=" + systemOrderNo;
            }
            $http.get(checkOrderNo)
                .then(function(response) { //
                    // Found the user, therefore not unique.
                    if(response.data){
                        deferred.reject();
                    }
                    else{
                        deferred.resolve();
                    }

                }, function() {
                    deferred.resolve();
                });

            return deferred.promise;
        }
        else{
            return $q.resolve();
        }
    }
    return orderNumberService;
}]);
