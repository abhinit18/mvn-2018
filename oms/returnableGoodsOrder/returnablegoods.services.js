/**
 * Project Name Maven
 * Created by Prakhar Srivastava on 30-11-2017.
 */
angular.module('OMSApp.returnableGoodsService', []).
factory('returnableGoodsOrderNumberService', ['$q', '$http','MavenAppConfig', function($q, $http,MavenAppConfig) {

   var returnableGoodsOrderNumberService={};
    returnableGoodsOrderNumberService.getreturnableGoods= function(orderNo,systemOrderNo) {
        if(orderNo){
            var deferred = $q.defer();
            var checkOrderNo = MavenAppConfig.baseUrlSource + "/omsservices/webapi/returnablegoodsorder/clientordernumber?clientordernumber=" + orderNo;

            if(systemOrderNo)
            {
                checkOrderNo +="&systemordernumber=" + systemOrderNo;
            }

            $http.get(checkOrderNo).
            then(function(response) { //
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
    return returnableGoodsOrderNumberService;
}]);