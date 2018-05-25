/**
 * Project Name Maven
 * Created by Prakhar Srivastava on 30-11-2017.
 */

angular.module('OMSApp.purchaseReturnOrderDirective', []).directive('uniquepr',['purchaseReturnOrderNumberService', function(purchaseReturnOrderNumberService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            ngModel.$asyncValidators.uniquepr = function(){
                return  purchaseReturnOrderNumberService.getPurchasereturn(ngModel.$viewValue, scope.singleorderReturnData.tablePurchaseReturnSystemOrderNo);
            };
        }
    };
}]);