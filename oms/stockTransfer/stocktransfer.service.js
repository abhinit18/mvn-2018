/**
 * Project Name Maven
 * Created by Prakhar Srivastava on 30-11-2017.
 */
angular.module('OMSApp.STorderNumberService', []).factory('STorderNumberService', ['$q', '$http','MavenAppConfig' , function($q, $http,MavenAppConfig) {
   var STorderNumberService={};
    STorderNumberService.getStockTranferOrder= function(orderNo,systemOrderNo) {
        if(orderNo){
            var deferred = $q.defer();
            var checkOrderNo = MavenAppConfig.baseUrlSource + "/omsservices/webapi/stock/transfer/clientordernumber?clientordernumber=" + orderNo;
            if(systemOrderNo != null )
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
    return STorderNumberService;
}]);