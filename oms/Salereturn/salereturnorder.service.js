/**
 * Project Name Maven
 * Created by Prakhar Srivastava on 30-11-2017.
 */

angular.module('OMSApp.saleReturnOrderNumberService', []).factory('saleReturnOrderNumberService', ['$q', '$http','MavenAppConfig' , function($q, $http,MavenAppConfig) {
    var saleReturnOrderNumberService={};
    saleReturnOrderNumberService. getSaleReturnOrder=function(orderNo,systemOrderNo) {
        if(orderNo){
            var deferred = $q.defer();
            var checkOrderNo = MavenAppConfig.baseUrlSource + "/omsservices/webapi/salereturn/clientordernumber?clientordernumber=" + orderNo;
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
    return saleReturnOrderNumberService;
}]);
