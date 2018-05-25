/**
 * Project Name Maven
 * Created by Prakhar Srivastava on 01-12-2017.
 */


angular.module('MavenApp.filter', [ ]).config(function config($mdDateLocaleProvider) {
    $mdDateLocaleProvider.formatDate = function(date) {
        if(date) {
            var formatteddate = new Date(moment(date)).format("dd/mm/yyyy");
            return formatteddate;
        }
        else {
            return null;
        }
    };


}).filter('utcToLocal' , function utcToLocal($filter,$cookies) {
    return function (utcDateString, format) {
        if (!utcDateString) {
            return;
        }

        utcDateString = moment.utc(utcDateString).format();
        //utcDateString = utcDateString.toUTCString();

        // append 'Z' to the date string to indicate UTC time if the timezone isn't already specified
        if (utcDateString.indexOf('Z') === -1 && utcDateString.indexOf('+') === -1) {
            utcDateString += 'Z';
        }

        var timezone = 'Asia/Calcutta';
        if($cookies.get('timezone'))
        {
            timezone = $cookies.get('timezone');
        }

        return $filter('date')(utcDateString, "dd/MM/yyyy", timezone );
    };
})

.filter('utcToLocalOrHyphen' , function utcToLocal($filter,$cookies) {
    return function (utcDateString, format) {
        if (!utcDateString) {
            return "-";
        }

        utcDateString = moment.utc(utcDateString).format();
        //utcDateString = utcDateString.toUTCString();

        // append 'Z' to the date string to indicate UTC time if the timezone isn't already specified
        if (utcDateString.indexOf('Z') === -1 && utcDateString.indexOf('+') === -1) {
            utcDateString += 'Z';
        }

        var timezone = 'Asia/Calcutta';
        if($cookies.get('timezone'))
        {
            timezone = $cookies.get('timezone');
        }

        return $filter('date')(utcDateString, "dd/MM/yyyy", timezone );
    };
})

.filter('utcToLocalTimeOrHyphen' , function utcToLocal($filter,$cookies) {
    return function (utcDateString, format) {
        if (!utcDateString) {
            return "-";
        }

        utcDateString = moment.utc(utcDateString).format();

        // append 'Z' to the date string to indicate UTC time if the timezone isn't already specified
        if (utcDateString.indexOf('Z') === -1 && utcDateString.indexOf('+') === -1) {
            utcDateString += 'Z';
        }

        var timezone = 'Asia/Calcutta';
        if($cookies.get('timezone'))
        {
            timezone = $cookies.get('timezone');
        }

        return $filter('date')(utcDateString, "dd/MM/yyyy hh:mm:ss a", timezone );
    };
})
.filter('bulkUploadType' , function () {
    return function (type) {
        var returnType;
        switch ((type.toLowerCase())) {
            case 'sku':returnType='SKU';break;
            case 'skuspullfromtally':returnType='TallySKU';break;
            case 'orders':returnType='Orders';break;
            case 'po':returnType='PO';break;
            case 'customer':returnType='Customer';break;
            case 'customerspullfromtally':returnType='TallyCustomer';break;
            case 'vendor':returnType='Vendor';break;
            case 'vendorspullfromtally':returnType='TallyVendor';break;
            case 'master':returnType='Master';break;
            case 'cancelsaleorders':returnType='Cancel Sale Orders';break;
            case 'stocktransfer':returnType='Stock Transfer';break;
            case 'inventory':returnType='Inventory';break;
            case 'salereturn':returnType='Sale Return';break;
            case 'purchasereturnwithid':returnType='Purchase Return with Id';break;
            case 'purchasereturnwitoutid':returnType='Purchase Return Witout Id';break;
            case 'salereturnwithoutorderid':returnType='Sale Return without Order Id';break;
            case 'skusaleschannelmap':returnType='SKU Sales Channel Map';break;
            case 'vendorskumap':returnType='Vendor SKU Map';break;
            case 'returnablegoodsorder':returnType='Returnable Goods Order';break;
            case 'cancelstocktransfer':returnType='Cancel Stock Transfer';break;
            case 'rates':returnType='Rates';break;
        }

        return returnType;
    };
})

.directive('timezonedDate', function ($cookies)
{
    return {
        require: 'ngModel',
        restrict: 'A',
        priority: 1,
        link: function (scope, elem, attrs, ngModel)
        {

            attrs.timezone = $cookies.get('timezone');
            if(!attrs.timezone)
            {
                attrs.timezone = 'Asia/Calcutta';
            }

            var toView = function (val)
            {
                if(val) {
                    var offset = moment(val).utcOffset();
                    var date = new Date(moment(val).subtract(offset, 'm'));
                    var newOffset = moment.tz.zone(attrs.timezone).offset(date);
                    return new Date(moment(date).subtract(newOffset, 'm').unix() * 1000);
                }
                else
                {
                    return null;
                }
            };

            var toModel = function (val)
            {
                if(val) {
                    var m = moment(val);
                    m.set({hour: 0, minute: 0, second: 0, millisecond: 0});
                    var offset = m.utcOffset();
                    var date = new Date(m.add(offset, 'm'));
                    var timeZone = moment.tz.zone(attrs.timezone);
                    var newOffset = timeZone.offset(date);
                    return moment(date).add(newOffset, 'm').unix() * 1000;
                }
                else {
                    return null;
                }
            };

            ngModel.$formatters.push(toView);
            ngModel.$parsers.push(toModel);
        }
    };

})

.directive('price', [function () {
    return {
        require: 'ngModel',
        priority: 1,
        link: function (scope, element, attrs, ngModel) {
            attrs.$set('ngTrim', "false");

            var formatter = function(str, isNum) {
                str = String( Number(str || 0) / (isNum?1:100) );
                str = (str=='0'?'0.0':str).split('.');
                str[1] = str[1] || '0';
                return str[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,') + '.' + (str[1].length==1?str[1]+'0':str[1]);
            }
            var updateView = function(val) {
                scope.$applyAsync(function () {
                    ngModel.$setViewValue(val || '');
                    ngModel.$render();
                });
            }
            var parseNumber = function(val)
            {
                if(val == null || val == undefined)
                {
                    return;
                }
                var modelString = formatter(ngModel.$modelValue, true);
                var sign = {
                    pos: /[+]/.test(val),
                    neg: /[-]/.test(val)
                }
                sign.has = sign.pos || sign.neg;
                sign.both = sign.pos && sign.neg;

                if (!val || sign.has && val.length==1 || ngModel.$modelValue && Number(val)===0) {
                    var newVal = (!val || ngModel.$modelValue && Number()===0?'':val);
                    if (ngModel.$modelValue !== newVal)
                        updateView(newVal);

                    return '';
                }
                else {
                    var valString = String(val || '');
                    var newSign = (sign.both && ngModel.$modelValue>=0 || !sign.both && sign.neg?'':'');
                    var newVal = valString.replace(/[^0-9]/g,'');
                    var viewVal = newSign + formatter(angular.copy(newVal));

                    if (modelString !== valString)
                        updateView(viewVal);

                    return (Number(newSign + newVal) / 100) || 0;
                }
            }
            var formatNumber = function(val) {
                if (val) {
                    var str = String(val).split('.');
                    str[1] = str[1] || '0';
                    val = str[0] + '.' + (str[1].length==1?str[1]+'0':str[1]);
                }
                else
                {
                    return;
                }
                return parseNumber(val);
            }

            ngModel.$parsers.push(parseNumber);
            ngModel.$formatters.push(formatNumber);
        }
    };
}])

.filter('priceOrHyphen' , function ()
{
    return function (price) {
        if (!price || isNaN(price) )
        {
            return "-";
        }

        var formatter = function(str, isNum) {
            str = String( Number(str || 0) / (isNum?1:100) );
            str = (str=='0'?'0.0':str).split('.');
            str[1] = str[1] || '0';
            return str[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,') + '.' + (str[1].length==1?str[1]+'0':str[1]);
        }


        var toView = function(val) {
            if (val)
            {
                var str = String(val).split('.');
                str[1] = str[1] || '0';
                val = str[0] + '.' + (str[1].length==1?str[1]+'0':str[1]);
            }
            return formatter(val, true);
        }

        return toView(price);


    };
}).directive('richtext', [function() {
    return {
        scope: {
            bodyText: '='
        },
        template: '<p ng-bind-html="teste"></p>',
        controller: function($scope,  $sce){

            $scope.$watch('bodyText', function(value)
            {
                if(value == null || value == undefined || value == '')
                {
                    $scope.teste = $sce.trustAsHtml('No remarks');
                }
                else
                {
                    $scope.teste = $sce.trustAsHtml(value);
                }
            })

        }
    };
}]).directive('richerrortext', [function() {
    return {
        scope: {
            bodyText: '='
        },
        template: '<p ng-bind-html="teste"></p>',
        controller: function($scope,  $sce){

            $scope.$watch('bodyText', function(value)
            {
                if(value == null || value == undefined || value == '')
                {
                    $scope.teste = $sce.trustAsHtml('');
                }
                else
                {
                    $scope.teste = $sce.trustAsHtml(value);
                }
            })

        }
    };
}]).directive('onlyInteger', function ()
{
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function (scope, elem, attrs, ngModel)
        {

            var updateView = function(val) {
                scope.$applyAsync(function () {
                    ngModel.$setViewValue(val || '');
                    ngModel.$render();
                });
            }

            var toModel = function (val)
            {
                if(val)
                {
                    val = val.replace(/[^0-9]/g, '');
                    updateView(val);
                    var newVal = parseInt(val);
                    return newVal;
                }
                else
                {
                    return null;
                }
            };

            ngModel.$parsers.push(toModel);
        }
    };

}).directive('alphaWithspace', function ()
{
    return {
        require: 'ngModel',
        restrict: 'A',
        priority:5,
        link: function (scope, elem, attrs, ngModel)
        {

            var updateView = function(val) {
                scope.$applyAsync(function () {
                    ngModel.$setViewValue(val || '');
                    ngModel.$render();
                });
            }

            var toModel = function (val)
            {
                if(val)
                {
                    val = val.replace(/[^A-Za-z ]/g, '');
                    updateView(val);
                    return val;
                }
                else
                {
                    return null;
                }
            };

            ngModel.$parsers.push(toModel);
        }
    };

})

.directive('alphanum', function ()
{
    return {
        require: 'ngModel',
        restrict: 'A',
        priority:5,
        link: function (scope, elem, attrs, ngModel)
        {

            var updateView = function(val) {
                scope.$applyAsync(function () {
                    ngModel.$setViewValue(val || '');
                    ngModel.$render();
                });
            }

            var toModel = function (val)
            {
                if(val)
                {
                    val = val.replace(/[^0-9a-zA-Z]/g, '');
                    updateView(val);
                    return val;
                }
                else
                {
                    return null;
                }
            };

            ngModel.$parsers.push(toModel);
        }
    };

})
.config(['$mdAriaProvider', function ($mdAriaProvider) {
    $mdAriaProvider.disableWarnings();
}]).directive('greaterThanOne', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {
                if (viewValue === "") {
                    ctrl.$setValidity('greater-than-one', false);
                    return viewValue;
                } else if (Number(viewValue)< 1) {
                    ctrl.$setValidity('greater-than-one', false);
                    return viewValue;
                } else {
                    ctrl.$setValidity('greater-than-one', true);
                    return viewValue;
                }
            });
        }
    };
}).directive('skufound', function($q, $http,MavenAppConfig) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            ngModel.$asyncValidators.skufound = function(vendor) {
                scope.getVendorAddressesAndSkus(vendor);
                if(vendor){
                    var deferred = $q.defer();
                    $http.get(MavenAppConfig.baseUrlSource +"/omsservices/webapi/vendors/"+vendor.idtableVendorId+"/skumap/skus")
                        .then(function(response) { //
                            // Found the skus
                            if(response.data.length){
                                scope.vendorSkus = response.data;
                                deferred.resolve(true);
                            }
                            else{
                                deferred.reject(false);
                            }

                        }, function() {
                            deferred.reject(false);
                        });

                    return deferred.promise;
                }
                else{
                    return $q.reject();
                }
            };
        }
    };
}).directive('accessibleForm', function () {
    return {
        restrict: 'A',
        link: function (scope, elem) {

            elem.on('submit', function () {

                // find the first invalid element
                var firstInvalid = elem[0].querySelector('.ng-invalid');

                // if we find one, set focus
                if (firstInvalid) {
                    firstInvalid.focus();
                }
            });
        }
    };
}).directive("gstinvalidator", [function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ctrl) {
            function gstinValidator(ngModelValue) {
                var stateData = (attr.gstinvalidator);
                var isRequired = (attr.required);
                if (stateData && ngModelValue.substr(0,2) == JSON.parse(stateData).tableStateCode) {
                    ctrl.$setValidity('gstin', true);
                } else {
                    if(!isRequired){
                        ctrl.$setValidity('gstin', true);
                    }
                    else{
                        ctrl.$setValidity('gstin', false);
                    }
                }
                return ngModelValue;
            }
            ctrl.$parsers.push(gstinValidator);

        }
    }
}]).directive("restrictTo", [function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ctrl) {
            function customValidator(ngModelValue) {
                var limit = parseInt(attr.restrictTo);
                if (ngModelValue <= limit) {
                    ctrl.$setValidity('maximumQuantity', true);
                } else {
                    ctrl.$setValidity('maximumQuantity', false);
                }
                return ngModelValue;
            }
            ctrl.$parsers.push(customValidator);

        }
    }
}]).directive('noSpecialChar', function() {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function(scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function(inputValue) {
                if (inputValue == null)
                    return ''
                cleanInputValue = inputValue.replace(/[^\w\s\][^ ]/gi, '');
                if (cleanInputValue != inputValue) {
                    modelCtrl.$setViewValue(cleanInputValue);
                    modelCtrl.$render();
                }
                return cleanInputValue;
            });
        }
    }
}).directive("verifyWarehouse", [function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ctrl) {
            function customValidator(ngModelValue) {
                var limit = attr.verifyWarehouse;
                if (JSON.stringify(ngModelValue) != limit) {
                    ctrl.$setValidity('sameWarehouse', true);
                } else {
                    ctrl.$setValidity('sameWarehouse', false);
                }
                var fromWarehouse = JSON.parse(limit);
                if(ngModelValue.tableWarehouseType.idtableWarehouseTypeId == 3 && fromWarehouse.tableWarehouseType.idtableWarehouseTypeId == 4)
                {
                    ctrl.$setValidity('fbaChecker', false);
                }
                else{
                    ctrl.$setValidity('fbaChecker', true);
                }


                return ngModelValue;
            }
            ctrl.$parsers.push(customValidator);

        }
    }
}])
    .directive("preventTypingLesser", function() {
    return {
        link: function(scope, element, attributes)
        {
            var oldVal = null;
            element.on("keydown keyup", function(e)
            {
                if(element.val() == null)
                {
                    return;
                }
                if (Number(element.val()) < Number(attributes.max) &&
                    e.keyCode != 46 // delete
                    &&
                    e.keyCode != 8 // backspace
                )
                {
                    e.preventDefault();
                    element.val(oldVal);
                }
                else
                {
                    oldVal = Number(element.val());
                }
            });
        }
    };
})

.directive("preventTypingGreater", function() {
    return {
        link: function(scope, element, attributes) {
            var oldVal = null;
            element.on("keydown keyup", function(e)
            {
                if(element.val() == null)
                {
                    return;
                }
                if (Number(element.val()) > Number(attributes.max) &&
                    e.keyCode != 46 // delete
                    &&
                    e.keyCode != 8 // backspace
                ) {
                    e.preventDefault();
                    element.val(oldVal);
                } else {
                    oldVal = Number(element.val());
                }
            });
        }
    };
}).directive('floating', function ()
{
    return {
        require: 'ngModel',
        scope: {
            precision : '='
        },
        restrict: 'A',
        link: function (scope, elem, attrs, ngModel)
        {

            var updateView = function(val) {
                scope.$applyAsync(function () {
                    ngModel.$setViewValue(val || '');
                    ngModel.$render();
                });
            };

            var toModel = function (val)
            {
                if(val)
                {

                    origval = val
                    val = val.replace(/[^0-9.]/g, '');

                    if(origval == val)
                    {
                        var floatingRegEx = new RegExp("^\\d{0,9}(\\.\\d{0,"+scope.precision+"})?$");

                        var matchedValue = floatingRegEx.exec(val);
                        if(matchedValue == null)
                        {
                            val = val.substring(0, val.length - 1);
                        }

                    }

                    updateView(val);
                    var newVal = parseFloat(val);
                    return newVal;
                }
                else
                {
                    return null;
                }
            };

            ngModel.$parsers.push(toModel);
        }
    };

}).directive('floating2', function ()
{
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function (scope, elem, attrs, ngModel)
        {

            var updateView = function(val) {
                scope.$applyAsync(function () {
                    ngModel.$setViewValue(val || '');
                    ngModel.$render();
                });
            };

            var toModel = function (val)
            {
                if(val)
                {

                    origval = val
                    val = val.replace(/[^0-9.]/g, '');

                    if(origval == val)
                    {
                        var floatingRegEx = new RegExp("^\\d{0,9}(\\.\\d{0,2})?$");

                        var matchedValue = floatingRegEx.exec(val);
                        if(matchedValue == null)
                        {
                            val = val.substring(0, val.length - 1);
                        }

                    }

                    updateView(val);
                    var newVal = parseFloat(val);
                    return newVal;
                }
                else
                {
                    return null;
                }
            };

            ngModel.$parsers.push(toModel);
        }
    };

}).directive('capitalizeFirst', function ($parse) {
    return {
        restrict: 'A',
        require: 'ngModel',
        priority:1,
        link: function (scope, element, attrs, modelCtrl) {
            if (modelCtrl) {
                var capitalize = function (inputValue) {
                    if (inputValue == undefined) {
                        return '';
                    }
                    String(inputValue).trim();
                    var inputStringArray = String(inputValue).split(" ");
                    var arrlength = inputStringArray.length;
                    var capitalized = "";
                    for (var i=0; i<arrlength; i++) {
                        inputStringArray[i] = String(inputStringArray[i]).charAt(0).toUpperCase() +
                            String(inputStringArray[i]).substring(1);
                    }
                    capitalized = inputStringArray.join(" ");
                    if (capitalized !== inputValue) {
                        modelCtrl.$setViewValue(capitalized);
                        modelCtrl.$render();
                    }
                    return capitalized;
                };
                var model = $parse(attrs.ngModel);
                modelCtrl.$parsers.push(capitalize);
                capitalize(model(scope));
            }
        }
    };
}).directive('tolowercase', function ($parse) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            if (ngModel) {

                var lowerize = function (inputValue) {
                    if (!inputValue) {
                        return inputValue;
                    }
                    var lowerized = inputValue.toLowerCase();
                    if (lowerized !== inputValue) {
                        ngModel.$setViewValue(lowerized);
                        ngModel.$render();
                    }
                    return lowerized;
                };
                var model = $parse(attrs.ngModel);
                ngModel.$parsers.push(lowerize);
                lowerize(model(scope));
            }
        }
    };
}).directive('demoMap', function() {
    return {
        restrict: 'EA',
        require: '?ngModel',
        scope: {
            myModel: '=ngModel'
        },
        link: function(scope, element, attrs, ngModel) {

            var mapOptions;
            var googleMap;
            var searchMarker;
            var searchLatLng;

            ngModel.$render = function() {
                searchLatLng = new google.maps.LatLng(scope.myModel.latitude, scope.myModel.longitude);

                mapOptions = {
                    center: searchLatLng,
                    zoom: 12,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };

                googleMap = new google.maps.Map(element[0], mapOptions);
                searchMarker = new google.maps.Marker({
                    position: searchLatLng,
                    map: googleMap,
                    draggable: true
                });

                google.maps.event.addListener(searchMarker, 'idle', function() {
                    scope.$apply(function() {
                        scope.myModel.latitude = searchMarker.getPosition().lat();
                        scope.myModel.longitude = searchMarker.getPosition().lng();
                    });
                }.bind(this));

                $('#billingAddressModal').on('shown.bs.modal', function(e) {
                    var currentCenter = googleMap.getCenter(); // Get current center before resizing
                    google.maps.event.trigger(googleMap, "resize");
                    googleMap.setCenter(currentCenter); // Re-set previous center
                });
                $('#shippingAddressModal').on('shown.bs.modal', function(e) {
                    var currentCenter = googleMap.getCenter(); // Get current center before resizing
                    google.maps.event.trigger(googleMap, "resize");
                    googleMap.setCenter(currentCenter); // Re-set previous center
                });
                $('#orderShippingAddressModal').on('shown.bs.modal', function(e) {
                    var currentCenter = googleMap.getCenter(); // Get current center before resizing
                    google.maps.event.trigger(googleMap, "resize");
                    googleMap.setCenter(currentCenter); // Re-set previous center
                });
                $('#vendorAddressModal').on('shown.bs.modal', function(e) {
                    var currentCenter = googleMap.getCenter(); // Get current center before resizing
                    google.maps.event.trigger(googleMap, "resize");
                    googleMap.setCenter(currentCenter); // Re-set previous center
                });

            };

            scope.$watch('myModel', function(value) {
                var myPosition = new google.maps.LatLng(scope.myModel.latitude, scope.myModel.longitude);
                searchMarker.setPosition(myPosition);
            }, true);
        }
    }
});
// no need
/*
.directive('wrapOwlcarousel', function () {

    return {

        restrict: 'E',

        link: function (scope, element, attrs) {

            var options = scope.$eval($(element).attr('data-options'));

            $(element).owlCarousel(options);

        }

    };

});
*/
