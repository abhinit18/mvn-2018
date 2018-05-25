/**
 * Project Name Maven
 * Created by Prakhar Srivastava on 30-11-2017.
 */


angular.module('OMSApp.returnableGoodsDirective', []).directive('uniquerg', ['returnableGoodsOrderNumberService', function(returnableGoodsOrderNumberService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            ngModel.$asyncValidators.uniquerg = function(){
                return returnableGoodsOrderNumberService.getreturnableGoods(ngModel.$viewValue, scope.singleorderReturnData.tableReturnableGoodsOrderSystemOrderNo);
            };
        }
    };
}]);