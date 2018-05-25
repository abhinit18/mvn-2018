/**
 * Upadated by Prakhar on 28-11-2017.
 */
angular.module('OMSApp.discount', []).config(function config($stateProvider) {
    $stateProvider.state('/discount/', {
        name: '/discount/',
        url: '/discount/',
        views: {
            "main": {
                controller: 'discountController',
                templateUrl: 'discount/Discount.view.html'
            },
            "header": {
                controller: 'headerCtrl',
                templateUrl: '../shared/templates/header.html'
            }
        },
        data: {pageTitle: 'Discount'}
    })

}).controller('discountController', ['$rootScope', '$scope', '$http', '$location', 'Upload', '$mdDialog','MavenAppConfig',  'pagerService', '$cookies', '$timeout', '$q',  'mastersService',

function discountController($rootScope, $scope, $http, $location, Upload, $mdDialog, MavenAppConfig,   pagerService,  $cookies, $timeout, $q, mastersService) {

//    ======================= global object ============================= //

    $scope.categorySearchUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skunode/search?search=";
    $scope.skuSearchUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/search?search=";
    $scope.downloadRatesTemplateUrl = MavenAppConfig.baseUrlSource+'/omsservices/webapi/fixedpricerule/gettemplateforratesupload';
    $scope.exportRatesUrl = MavenAppConfig.baseUrlSource+'/omsservices/webapi/fixedpricerule/exportrates?rateListName=';
    $scope.baseCustomerUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/search?search=';
    $scope.genericData = {};
    $scope.exportFilterData = {};
    $scope.exportFilterData.tableDiscountSalesChannelInclusions = [];
    $scope.exportFilterData.tableDiscountSkuInclusions = [];
    $scope.exportFilterData.tableDiscountSkuCategoryInclusions = [];
    $scope.genericData.salesChannelClicked = true;
    $scope.genericData.entityClicked = true;
    $scope.genericData.dialogMode = 'add';

    $scope.allDiscountRulesSizeStart = 0;
    $scope.discountRulesCount = 0;
    $scope.recordsPerPage = [5,10,15];
    $scope.allDiscountRulesPageSize = $scope.recordsPerPage[0];

    $scope.discountRules = [];

    $scope.initAddDiscountRuleModalData = function () {
        $scope.entitySearchUrl = $scope.categorySearchUrl;
        $scope.discountData = {};
        $scope.discountData.rateList={};
        $scope.genericData.selectedSalesChannel = "";
        $scope.discountData.tableDiscountRuleName = "";
        $scope.discountData.tableDiscountRuleSelectedEntity = null;
        $scope.discountData.tableDiscountRuleAllCategorySelected = false;
        $scope.discountData.tableDiscountSalesChannelExclusions = [];
        $scope.discountData.tableDiscountRuleCustomerInclusions = [];
        $scope.discountData.tableDiscountSkuExclusions = [];
        $scope.discountData.tableDiscountSkuCategoryExclusions = [];
        $scope.discountData.tableDiscountRuleAllScSelected = false;
        $scope.isRateListSelected = false;
        $scope.discountData.tableDiscountRuleAllSkuSelected = false;
        $scope.discountData.tableDiscountRuleAllCustomersSelected = false;
        $scope.discountData.tableDiscountRuleAllCategorySelected = false;
        $scope.discountData.tableDiscountRuleStartDate = null;
        $scope.discountData.tableDiscountRuleEndDate = null;
        $scope.discountData.tableDiscountRuleMinQuantity = 1;
        $scope.discountData.tableDiscountRuleDiscount = 0.01;
        $scope.discountData.tableDiscountRuleRemarks = "";
        $scope.discountData.tableDiscountRuleSalesChannelExclusion = false;
        $scope.discountData.tableDiscountRuleSkuCategoryExclusion = false;
        $scope.discountData.tableDiscountRuleSkuExclusion = false;
        $scope.angucompleteTitleField = "skuNodePathNameFormatted";
    };

    $scope.reInitAddDiscountRuleModalData = function () {
        $scope.entitySearchUrl = $scope.categorySearchUrl;

        $scope.genericData.selectedSalesChannel = "";
        $scope.discountData.tableDiscountRuleName = "";
        $scope.discountData.tableDiscountRuleSelectedEntity = 'Category';
        $scope.discountData.tableDiscountRuleAllCategorySelected = false;
        $scope.discountData.tableDiscountRuleCustomerInclusions = [];
        $scope.discountData.tableDiscountSalesChannelExclusions = [];
        $scope.discountData.tableDiscountSkuExclusions = [];
        $scope.discountData.tableDiscountSkuCategoryExclusions = [];
        $scope.discountData.tableDiscountRuleAllScSelected = false;
        $scope.discountData.tableDiscountRuleAllSkuSelected = false;
        $scope.discountData.tableDiscountRuleAllCustomersSelected = false;
        $scope.discountData.tableDiscountRuleAllCategorySelected = false;
        $scope.discountData.tableDiscountRuleStartDate = null;
        $scope.discountData.tableDiscountRuleEndDate = null;
        $scope.discountData.tableDiscountRuleMinQuantity = 1;
        $scope.discountData.tableDiscountRuleDiscount = 0.01;
        $scope.discountData.tableDiscountRuleRemarks = "";
        $scope.discountData.tableDiscountRuleSalesChannelExclusion = false;
        $scope.discountData.tableDiscountRuleSkuCategoryExclusion = false;
        $scope.discountData.tableDiscountRuleSkuExclusion = false;
        $scope.isRateListSelected = false;
        $scope.discountData = {};
        $scope.discountData.rateList={};
        $scope.angucompleteTitleField = "skuNodePathNameFormatted";
    };

    $scope.initAddDiscountRuleModalData();

    $scope.uploadDiscountFile = function(){
        $( "#file_upload_drop" ).click();
    } 

    $scope.dayDataCollapseFn = function () {
        $scope.dayDataCollapse = [];

        for (var i = 0; i < $scope.discountRules.length; i += 1) {
            $scope.dayDataCollapse.push(false);
        }
    };

    $scope.tableRowExpanded = false;
    $scope.tableRowIndexExpandedCurr = "";
    $scope.tableRowIndexExpandedPrev = "";
    $scope.storeIdExpanded = "";

    $scope.getDiscountRules = function (start) {

        $scope.discountRules = [];
        var discountRulesURL = MavenAppConfig.baseUrlSource + "/omsservices/webapi/discountrules?start=" + start + "&size=" + $scope.allDiscountRulesPageSize;
        $http.get(discountRulesURL).success(function (data) {
            console.log(data);
            $scope.discountRules = data;
            $scope.allDiscountRulesSizeEnd = $scope.allDiscountRulesSizeStart + data.length;
            $scope.showLoader=false;
        }).error(function (error, status) {
            console.log(error);
            console.log(status);

        });

    };
    $scope.onRecordsPerPageChange = function (allDiscountRulesPageSize) {
        $scope.allDiscountRulesSizeStart = 0;
        $scope.allDiscountRulesPageSize = allDiscountRulesPageSize;
        $scope.allDiscountRulesSizeEnd = 0;
        $scope.discountRules = [];
        $scope.getDiscountRulesCount(1);
    }
    $scope.getDiscountRulesCount = function (page) {

        $scope.discountRules = [];
        $scope.showLoader = true;
        var discountRulesCountURL = MavenAppConfig.baseUrlSource + "/omsservices/webapi/discountrules/count";
        $http.get(discountRulesCountURL).success(function (data) {
            console.log(data);
            $scope.discountRulesCount = data;
            function setPage(page) {
                if (page < 1 || page > vm.pager.totalPages) {
                    return;
                }

                // get pager object from service
                vm.pager = pagerService.GetPager(vm.dummyItems.length, page,$scope.allDiscountRulesPageSize);

                $scope.vmPager = vm.pager;

                $scope.allDiscountRulesSizeStart = (vm.pager.currentPage - 1) * $scope.allDiscountRulesPageSize;
                $scope.discountRulesSize = $scope.allDiscountRulesSizeStart + $scope.allDiscountRulesPageSize;


                // get current page of items
                vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                $scope.vmItems = vm.items;
                $scope.getDiscountRules($scope.allDiscountRulesSizeStart);
            }
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.discountRulesCount); // dummy array of items to be paged
                vm.pager = {};
                vm.setPage = setPage;



                if (page == undefined) {
                    setPage(1);
                }
                if (page != undefined) {
                    setPage(page);
                }
            }

        }).error(function (error, status) {
            console.log(error);
            console.log(status);

        });

    };

    $scope.getDiscountRules($scope.allDiscountRulesSizeStart);

    $scope.getDiscountRulesCount(1);

    $scope.getSalesChannels = function () {
        $scope.salesChannels = [];
        var channelListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/saleschannels";
        $http.get(channelListUrl).success(function (data) {
            console.log(data);
            $scope.salesChannels = data;
        }).error(function (error, status) {
            console.log(error);
            console.log(status);

        });
    };


    $scope.getSalesChannels();

    $scope.searchedEntitySelected = function (selected) {

        if ($scope.discountData.tableDiscountRuleSelectedEntity == 'Category' && selected != null) {
            $scope.searchedCategory = selected.originalObject;
            $scope.searchedSKU = null;
        }

        if ($scope.discountData.tableDiscountRuleSelectedEntity == 'SKU' && selected != null) {
            $scope.searchedSKU = selected.originalObject;
            $scope.searchedCategory = null;
        }
    };

    $scope.addEntityToDiscountRule = function () {

        if ($scope.discountData.tableDiscountRuleSelectedEntity == 'Category' && ($scope.genericData.searchedCategory == "" || $scope.genericData.searchedCategory == undefined || $scope.genericData.searchedCategory == null)) {
            $scope.notify('Search and select category first');
        }
        else {
            var b = true;
            if ($scope.discountData.tableDiscountRuleSelectedEntity == 'Category') {
                angular.forEach($scope.discountData.tableDiscountSkuCategoryExclusions,function(data){
                    if(data.tableSkuNode.idskuNodeId == $scope.genericData.searchedCategory.idskuNodeId){
                        b = false;
                    }
                });
                if(b == false){
                    $scope.notify('Category is already added in the list.');
                    return;
                }
                $scope.discountData.tableDiscountSkuCategoryExclusions.push(
                    {"tableSkuNode": $scope.genericData.searchedCategory}
                );
            }
        }
        if ($scope.discountData.tableDiscountRuleSelectedEntity == 'SKU' && ($scope.searchedSKU == undefined || $scope.searchedSKU == null)) {
            $scope.notify('Search and select SKU first');
        } else {
            var DuplicateSkuEntityCheck = true;
            if ($scope.discountData.tableDiscountRuleSelectedEntity == 'SKU') {
                angular.forEach($scope.discountData.tableDiscountSkuExclusions,function(dataSku){
                    if(dataSku.tableSku.idtableSkuId == $scope.searchedSKU.idtableSkuId){
                        DuplicateSkuEntityCheck = false;
                    }
                });
                if(DuplicateSkuEntityCheck == false){
                    $scope.notify('SKU is already added.');
                    return;
                }
                $scope.discountData.tableDiscountSkuExclusions.push(
                    {"tableSku": $scope.searchedSKU}
                );
            }
        }
    }

    $scope.removeEntityFromDiscountRule = function (removedEntity) {
        if ($scope.discountData.tableDiscountRuleSelectedEntity == 'Category') {
            $scope.discountData.tableDiscountSkuCategoryExclusions.splice(removedEntity, 1);
        }
        if ($scope.discountData.tableDiscountRuleSelectedEntity == 'SKU') {
            $scope.discountData.tableDiscountSkuExclusions.splice(removedEntity, 1);
        }
    }

    $scope.initDateLimits = function () {
        $scope.minDateShipping = new Date();
        $scope.maxDateShipping = null;

        $scope.minDateDelivery = new Date();
        $scope.maxDateDelivery = null;
    }

    $scope.initDateLimits();

    $scope.initDateLimitsForExport = function () {
        $scope.minDateShipping = null;
        $scope.maxDateShipping = null;

        $scope.minDateDelivery = null;
        $scope.maxDateDelivery = null;
    }

    $scope.initDateLimitsForExport();

    $scope.onShippingDateChangeForExport = function () {

        if($scope.exportFilterData.tableDiscountRuleEndDate)
        {
            $scope.deliveryDateData = new Date($scope.exportFilterData.tableDiscountRuleEndDate);
                $scope.maxDateShipping = new Date(
                $scope.deliveryDateData.getFullYear(),
                $scope.deliveryDateData.getMonth(),
                $scope.deliveryDateData.getDate());
        }

        //Delivery date should be greater than equal to shipping date

        if($scope.exportFilterData.tableDiscountRuleStartDate)
        {
            $scope.shippingDateData = new Date($scope.exportFilterData.tableDiscountRuleStartDate);
                $scope.minDateDelivery = new Date(
                $scope.shippingDateData.getFullYear(),
                $scope.shippingDateData.getMonth(),
                $scope.shippingDateData.getDate());
        }
    }

    $scope.onShippingDateChange = function () {

        //Should be greater than equal to today's date and if delivery date is available then should be less than delivery date
        $scope.minDateShipping = new Date();

        if($scope.discountData.tableDiscountRuleEndDate)
        {
            $scope.deliveryDateData = new Date($scope.discountData.tableDiscountRuleEndDate);
            $scope.maxDateShipping = new Date(
                $scope.deliveryDateData.getFullYear(),
                $scope.deliveryDateData.getMonth(),
                $scope.deliveryDateData.getDate());
        }

        //Delivery date should be greater than equal to shipping date

        if($scope.discountData.tableDiscountRuleStartDate)
        {
            $scope.shippingDateData = new Date($scope.discountData.tableDiscountRuleStartDate);
            $scope.minDateDelivery = new Date(
                $scope.shippingDateData.getFullYear(),
                $scope.shippingDateData.getMonth(),
                $scope.shippingDateData.getDate());
        }
    }

    $scope.onDeliveryDateChangeForExport = function ()
    {
        if($scope.exportFilterData.tableDiscountRuleStartDate)
        {
            $scope.shippingDateData = new Date($scope.exportFilterData.tableDiscountRuleStartDate);
                $scope.minDateDelivery = new Date(
                $scope.shippingDateData.getFullYear(),
                $scope.shippingDateData.getMonth(),
                $scope.shippingDateData.getDate());
        }

        if($scope.exportFilterData.tableDiscountRuleEndDate)
        {
            $scope.deliveryDateData = new Date($scope.exportFilterData.tableDiscountRuleEndDate);
            $scope.maxDateShipping = new Date(
                $scope.deliveryDateData.getFullYear(),
                $scope.deliveryDateData.getMonth(),
                $scope.deliveryDateData.getDate());
        }

    }

    $scope.onDeliveryDateChange = function ()
    {
        //should be greater than equal to today's date and if shipping date is there then should be greater than shipping date

        $scope.minDateDelivery = new Date();

        if($scope.discountData.tableDiscountRuleStartDate)
        {
            $scope.shippingDateData = new Date($scope.discountData.tableDiscountRuleStartDate);
            $scope.minDateDelivery = new Date(
                $scope.shippingDateData.getFullYear(),
                $scope.shippingDateData.getMonth(),
                $scope.shippingDateData.getDate());
        }

        if($scope.discountData.tableDiscountRuleEndDate)
        {
            $scope.deliveryDateData = new Date($scope.discountData.tableDiscountRuleEndDate);
            $scope.maxDateShipping = new Date(
                $scope.deliveryDateData.getFullYear(),
                $scope.deliveryDateData.getMonth(),
                $scope.deliveryDateData.getDate());
        }

    }

    $scope.allCategorySelectionChanged = function () {
        $scope.discountData.tableDiscountRuleSkuCategoryExclusion = false;
    }

    $scope.allSkuSelectionChanged = function () {
        $scope.discountData.tableDiscountRuleSkuExclusion = false;
    };

    $scope.clickChangeValue = function (data) {
        console.log(data);
        $scope.discountData.tableDiscountRuleSelectedEntity = data;
        if (data == "Category") {
            $scope.angucompleteTitleField = "skuNodePathNameFormatted";
            $scope.discountData.tableDiscountSkuExclusions = [];
            $scope.genericData.searchedCategory = "";
            $scope.discountData.tableDiscountRuleAllSkuSelected = null;
        }
        if (data == "SKU") {
            $scope.angucompleteTitleField = "tableSkuName";
            $scope.entitySearchUrl = $scope.skuSearchUrl;
            $scope.discountData.tableDiscountSkuCategoryExclusions = [];
            $scope.discountData.tableDiscountRuleAllCategorySelected = null;
        }
    };

//    ================================= Category array type ================================== //4

    $scope.categoryTypeArray = function() {
        var categoryTypeUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skunode?selected=true";
        $http.get(categoryTypeUrl).success(function(data) {
            $scope.categoryTypeLists = data;
        }).error(function(error, status) {

        });
    };

    $scope.categoryTypeArray();
//    ============================== Activate and deactivate rule ============================== //

    $scope.deactivateRule = function (discountDataObject, index)
    {
        $scope.conflictingRuleListIndex = (index.toString())?index:null;
        $scope.discountData.ruleID = discountDataObject.idtableDiscountRuleId;
        console.log(discountDataObject);
        $('#deactivateDialog').modal('show');
    }

    //    ============================== Activate and deactivate rule ============================== //

    $scope.openConflictingRuleDialog = function ()
    {
      $mdDialog.show({
            templateUrl: 'conflictingRule.tmpl.html',
            parent: angular.element(document.body),
            escapeToClose: false,
            clickOutsideToClose: false,
            scope: $scope.$new()
        }).then(function (answer)
        {
        },function ()
        {
        });
    }

    $scope.deactivateDiscountRule = function ()
    {
        var activateDiscountRuleURL = MavenAppConfig.baseUrlSource + "/omsservices/webapi/discountrules/" + $scope.discountData.ruleID + "/deactivate";
        $http({
            method: 'PUT',
            url: activateDiscountRuleURL,
            data : '',
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (res)
        {
            // $mdDialog.hide();
            $('#deactivateDialog').modal('hide');
            ($scope.genericData.conflictingRules && $scope.genericData.conflictingRules.length && $scope.conflictingRuleListIndex.toString())?$scope.genericData.conflictingRules.splice($scope.conflictingRuleListIndex,1):null;
            $scope.genericData.conflictingRules && !$scope.genericData.conflictingRules.length?$('#conflictingRule').modal('hide'):null;
            $scope.getDiscountRulesCount();
            $scope.notify('Discount rule deactivated successfully !','success')
        }).error(function (error, status) {
            console.log(error);
            console.log(status);

        });
    };

    $scope.activateRule = function (discountDataObject) {
        console.log(discountDataObject);
        $scope.checkConflictData = discountDataObject;
        $scope.discountData.ruleID = discountDataObject.idtableDiscountRuleId;
        $('#activateDialog').modal('show');
      /*$mdDialog.show({
            templateUrl: 'activateRule.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            escapeToClose: false,
            clickOutsideToClose: false,
            scope: $scope.$new()
        })*/
    }

    $scope.activateDiscountRule = function (ruleId) {
        var activateDiscountRuleURL = MavenAppConfig.baseUrlSource + "/omsservices/webapi/discountrules/" + ruleId + "/activate";
        $http({
            method: 'PUT',
            url: activateDiscountRuleURL,
            data : '',
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (res)
        {
           // $mdDialog.hide();
           $('#activateDialog').modal('hide');
            $scope.getDiscountRulesCount();
            $scope.notify('Discount rule activated successfully !','success')
        }).error(function (error, status) {
            console.log(error);
            console.log(status);

        });
    };

    $scope.cancelDiscountRuleData = function (action) {
        if(action == 'deactivate'){
            $('#deactivateDialog').modal('hide');
        }
        if(action == 'activate'){
            $('#activateDialog').modal('hide');
        }
    }

//    ==================== show discount rule modal ================================== //

    $scope.showAddDiscountRuleModal = function (ev) {
        $scope.initAddDiscountRuleModalData();
        $scope.genericData.dialogMode = 'add';
        $scope.initDateLimits();

        // $mdDialog.show({
			//  templateUrl: 'addDiscountDialog.tmpl.html',
		 // parent: angular.element(document.body),
        // targetEvent: ev,
        // clickOutsideToClose: false,
        // scope: $scope.$new()
        // });
        $scope.genericData.salesChannelClicked = true;
        $scope.genericData.entityClicked = true;
        $('#addDiscountDialog').modal('show');

    };

//    ============================= close discount dialog box =========================== //

    $scope.cancelDiscountRuleDialog = function (form) {
        $scope.reInitAddDiscountRuleModalData();

        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
            $scope.genericData.selectedRateList = "";
        }

       //  $mdDialog.hide({
		// 	 templateUrl: 'addDiscountDialog.tmpl.html'
       // });
        $('#addDiscountDialog').modal('hide');

        $scope.discountData = {};
    };

    $scope.setSelectedChannel = function (selectedSalesChannel) {
        $scope.genericData.selectedSalesChannel = selectedSalesChannel;
    }

    $scope.addSalesChannelToList = function () {

        console.log($scope.genericData.selectedSalesChannel);
        if ($scope.genericData.selectedSalesChannel == "" || $scope.genericData.selectedSalesChannel == undefined) {
            $scope.notify('Select a sales channel first');
        } else {
            var salesChannelListing = true;
            angular.forEach($scope.discountData.tableDiscountSalesChannelExclusions,function(value){
                console.log(value);
                if(value.tableSalesChannelValueInfo.idtableSalesChannelValueInfoId == $scope.genericData.selectedSalesChannel.idtableSalesChannelValueInfoId){
                    salesChannelListing = false;
                }
            });
            if(salesChannelListing == false){
                $scope.notify('Sales Channel is already added in the list.');
                return;
            }
            $scope.discountData.tableDiscountSalesChannelExclusions.push(
                {"tableSalesChannelValueInfo": $scope.genericData.selectedSalesChannel}
            );
        }
    }

    $scope.updateRateList=function(rateList){
        $scope.discountData.rateList = rateList;
    }

    $scope.removeSalesChannelFromList = function (removedSalesChannel) {

        $scope.discountData.tableDiscountSalesChannelExclusions.splice(removedSalesChannel, 1);

    }

    $scope.removeRateListFromList = function () {
        $scope.discountData.rateList={};
        $scope.isRateListSelected = false;
        $scope.genericData.selectedRateList = "";
    }

    $scope.validateDiscountData = function () {

        console.log($scope.discountData);

        if($scope.clientprofile.tableClientProfilePricingModel == 2) {
            if ($scope.discountData.tableDiscountRuleDiscount > 100.00 || $scope.discountData.tableDiscountRuleDiscount < 0.01) {
            $scope.notify("Discount percentage value shall be between 0.01 and 100.00");
                return false;
            }
        }
        if ($scope.discountData.tableDiscountRuleName == null || $scope.discountData.tableDiscountRuleName == undefined || $scope.discountData.tableDiscountRuleName == "") {
            $scope.notify("Rule name is mandatory");
            return false;
        }
        if ($scope.clientprofile.tableClientProfilePricingModel == 2) {
            if ($scope.discountData.tableDiscountRuleDiscount == null || $scope.discountData.tableDiscountRuleDiscount == undefined || $scope.discountData.tableDiscountRuleName == "0") {
            	$scope.notify("Discount percentage is mandatory and should be greater than 0");
                return false;
            }
        }
        if ($scope.discountData.tableDiscountRuleAllScSelected == false && $scope.discountData.tableDiscountSalesChannelExclusions.length == 0) {
            $scope.notify("Sales channel is required and at least one sales channel is required in list");
            return false;
        }
        if (!$scope.discountData.rateList.rateListName) {
            $scope.notify("Please select a rate list");
            return false;
        }
        if ($scope.clientprofile.tableClientProfilePricingModel == 2) {
            if ($scope.discountData.tableDiscountRuleSelectedEntity == null) {
            $scope.notify("Configure SKU/Categories for this rule");
            return false;
        }

        if ($scope.discountData.tableDiscountRuleAllCategorySelected == false && $scope.discountData.tableDiscountRuleSelectedEntity == 'Category' && $scope.discountData.tableDiscountSkuCategoryExclusions.length == 0) {
            $scope.notify("Category is required and at least one category is required in list ");
            return false;
        }
        if ($scope.discountData.tableDiscountRuleAllSkuSelected == false && $scope.discountData.tableDiscountRuleSelectedEntity == 'SKU' && $scope.discountData.tableDiscountSkuExclusions.length == 0) {
            $scope.notify('SKU is required and at least one SKU is required in the list');
            return false;
            }
        }

        if ($scope.clientprofile.tableClientProfilePricingModel == 2) {
            if ($scope.discountData.tableDiscountRuleAllCustomersSelected == false && $scope.discountData.tableDiscountRuleCustomerInclusions.length == 0) {
                $scope.notify("Please select customer(s)");
                return false;
            }
        }

        return true;
    };

//    ====================================== post discount data ================================= //
    $scope.setFormButtonValue = function (value, form) {

        console.log(form);
        $scope.submitActionButton = value;
    }
    $scope.submitAddOrderForm =  function (discountData,form) {
        if($scope.genericData.customerObj){
            $scope.notify("Please add selected customer to list");
            return;
        }
        if($scope.genericData.dialogMode == 'add' && $scope.submitActionButton == 'add'){
            $scope.AddDiscountRule(discountData,form);
        }
        else if($scope.genericData.dialogMode == 'edit'  && $scope.submitActionButton == 'edit'){
            $scope.updateDiscountRule(discountData,form);
        }
    }
    $scope.AddDiscountRule = function (discountData,form) {
        console.log($scope.discountData);


        if ($scope.validateDiscountData() == false) {
            return;
        }



        $scope.discountDataCopy = angular.copy($scope.discountData);
        if($scope.discountData.tableDiscountRuleStartDate != null && $scope.discountData.tableDiscountRuleStartDate != undefined)
        {
            $scope.discountDataCopy.tableDiscountRuleStartDate = moment.utc($scope.discountData.tableDiscountRuleStartDate).format();
        }
        if(!$scope.discountData.tableDiscountRuleStartDate)
        {
            var ruleStartDate = new Date();
            ruleStartDate.setDate(ruleStartDate.getDate()-1);
            ruleStartDate.setUTCHours(18, 30, 0, 0);
            ruleStartDate = ruleStartDate.getTime();
            $scope.discountDataCopy.tableDiscountRuleStartDate = moment.utc(ruleStartDate).format();
        }
        if($scope.discountData.tableDiscountRuleEndDate != null && $scope.discountData.tableDiscountRuleEndDate != undefined){
            $scope.discountDataCopy.tableDiscountRuleEndDate = moment.utc($scope.discountData.tableDiscountRuleEndDate).format();
        }

        var addDiscountRuleURL = MavenAppConfig.baseUrlSource + "/omsservices/webapi/discountrules";

        var checkConflictDiscountRuleURL = MavenAppConfig.baseUrlSource + "/omsservices/webapi/discountrules/checkpriceruleconflicts";

        if ($scope.discountDataCopy.tableDiscountRuleAllScSelected == false && $scope.discountDataCopy.tableDiscountRuleSalesChannelExclusion.length == 0) {
            $scope.discountDataCopy.tableDiscountRuleAllScSelected = null;
        }

        if ($scope.discountDataCopy.tableDiscountRuleAllCategorySelected == false && $scope.discountDataCopy.tableDiscountRuleSkuCategoryExclusion.length == 0) {
            $scope.discountDataCopy.tableDiscountRuleAllCategorySelected = null;
        }

        if ($scope.discountDataCopy.tableDiscountRuleAllSkuSelected == false && $scope.discountDataCopy.tableDiscountRuleSkuExclusion.length == 0) {
            $scope.discountDataCopy.tableDiscountRuleAllSkuSelected = null;
        }

        if($scope.clientprofile.tableClientProfilePricingModel == 1) {
            if ($scope.discountDataCopy.tableDiscountRuleAllCustomersSelected == false && $scope.discountDataCopy.tableDiscountRuleCustomerInclusions.length == 0) {
                $scope.discountDataCopy.tableDiscountRuleAllCustomersSelected = null;
            }
            $scope.discountDataCopy.tableDiscountRuleIsAsPriceRule = true;
        }

        if($scope.discountDataCopy.ruleID){
            delete $scope.discountDataCopy.ruleID;
        }

        $http({
            method: 'POST',
            url: checkConflictDiscountRuleURL,
            data: $scope.discountDataCopy,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (res)
        {
            if(res != null && res.length > 0 )
            {
                $scope.genericData.conflictingRules = [];
                $scope.genericData.conflictingRules =  res;
                $('#conflictingRule').modal('show');
                // $scope.openConflictingRuleDialog();
            }
            else
            {
                $http({
                    method: 'POST',
                    url: addDiscountRuleURL,
                    data: $scope.discountDataCopy,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function (res) {
                    $scope.discountRules.push(res);

                    // $mdDialog.hide({
           			//  templateUrl: 'addDiscountDialog.tmpl.html'
                    // });
                    $scope.cancelDiscountRuleDialog(form);
                    $scope.initAddDiscountRuleModalData();
                    $scope.getDiscountRulesCount();
                    $('#addDiscountDialog').modal('hide');
                    $scope.notify('Rule added successfully !','success');
                    /*if($scope.clientprofile.tableClientProfilePricingModel == 1) {
                        $scope.showRateListAssignDialog(res);
                    }*/
                }).error(function (error, status) {
                    $scope.cancelDiscountRuleDialog(form);
                });
            }


        }).error(function (error, status)
        {
            console.log(error);
            console.log(status);
        });


    };

    $scope.checkConflict = function(data, event){
        var rule = angular.copy(data);
        var checkConflictDiscountRuleURL = MavenAppConfig.baseUrlSource + "/omsservices/webapi/discountrules/checkpriceruleconflicts";
        delete rule.idtableDiscountRuleId;
        delete rule.tableDiscountRuleLastModifiedOn;
        delete rule.tableDiscountRuleIsActivated;
        delete rule.tableDiscountRuleCreatedOn;
        delete rule.tableDiscountRuleCreatedBy;

        $http({
            method: 'POST',
            url: checkConflictDiscountRuleURL,
            data: rule,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (res)
        {
            if(res != null && res.length > 0 )
            {
                $scope.genericData.conflictingRules = [];
                $scope.genericData.conflictingRules =  res;
                $('#conflictingRule').modal('show');
            }
            else if(event == "activate"){
                $scope.activateDiscountRule(data.idtableDiscountRuleId);
            }
            else if(event == "edit"){
                $scope.editDiscountRule(data);
            }
        }).error(function (error, status)
        {
            console.log(error);
            console.log(status);
        });
    }

    //    ====================================== PUT discount data ================================= //

    $scope.updateDiscountRule = function (data, form)
    {
        console.log($scope.discountData);


        if ($scope.validateDiscountData() == false) {
            return;
        }

        $scope.discountDataCopy = angular.copy($scope.discountData);

        if($scope.discountData.tableDiscountRuleStartDate != null && $scope.discountData.tableDiscountRuleStartDate != undefined)
        {
            $scope.discountDataCopy.tableDiscountRuleStartDate = moment.utc($scope.discountData.tableDiscountRuleStartDate).format();
        }
        if($scope.discountData.tableDiscountRuleEndDate != null && $scope.discountData.tableDiscountRuleEndDate != undefined)
        {
            $scope.discountDataCopy.tableDiscountRuleEndDate = moment.utc($scope.discountData.tableDiscountRuleEndDate).format();
        }

        var updateDiscountRuleURL = MavenAppConfig.baseUrlSource + "/omsservices/webapi/discountrules/" + $scope.discountDataCopy.idtableDiscountRuleId;

        var checkConflictDiscountRuleURL = MavenAppConfig.baseUrlSource + "/omsservices/webapi/discountrules/checkpriceruleconflicts";
        if($scope.clientprofile.tableClientProfilePricingModel == 1) {
            $scope.discountDataCopy.tableDiscountRuleIsAsPriceRule = true;
        }

        if($scope.discountDataCopy.ruleID){
            delete $scope.discountDataCopy.ruleID;
        }

        $http({
            method: 'POST',
            url: checkConflictDiscountRuleURL,
            data: $scope.discountDataCopy,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (res)
        {
            if(res != null && res.length > 0 )
            {
                $scope.genericData.conflictingRules = [];
                $scope.genericData.conflictingRules =  res;
                $('#conflictingRule').modal('show');
                // $scope.getDiscountRulesCount();
            }
            else
            {
                $http({
                    method: 'PUT',
                    url: updateDiscountRuleURL,
                    data: $scope.discountDataCopy,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function (res) {
                    $scope.discountRules.push(res);
                    // $mdDialog.hide({
              		// 	 templateUrl: 'addDiscountDialog.tmpl.html'
                    //    });
                    $scope.cancelDiscountRuleDialog(form);
                    $scope.initAddDiscountRuleModalData();
                    $scope.getDiscountRulesCount();
                    $scope.notify('Discount rule updated successfully !','success')
                }).error(function (error, status) {
                    $scope.cancelDiscountRuleDialog(form);

                });
            }


        }).error(function (error, status)
        {
            console.log(error);
            console.log(status);
        });


    };

    $scope.cancelConflictingRulesDialog = function () {
        $('#conflictingRule').modal('hide');
    }

    $scope.editDiscountRule = function (discountRule) {
        console.log(discountRule);
        if(!discountRule.tableDiscountRuleAllCustomersSelected)discountRule.tableDiscountRuleAllCustomersSelected = false;
        $scope.genericData.dialogMode = 'edit';
        $scope.discountData = angular.copy(discountRule);
        if($scope.discountData.rateList && $scope.discountData.rateList.rateListName){
            $scope.genericData.selectedRateList = $scope.discountData.rateList;
        }
        if (discountRule.tableDiscountRuleStartDate != null) {
            $scope.discountData.tableDiscountRuleStartDate = new Date(discountRule.tableDiscountRuleStartDate);
        }
        if (discountRule.tableDiscountRuleEndDate != null) {
            $scope.discountData.tableDiscountRuleEndDate = new Date(discountRule.tableDiscountRuleEndDate);
        }

        // $mdDialog.show({
        //     templateUrl: 'addDiscountDialog.tmpl.html',
        //     parent: angular.element(document.body),
        //     targetEvent: ev,
        //     clickOutsideToClose: false,
        //     scope: $scope.$new()
        // });
        $scope.genericData.salesChannelClicked = true;
        $scope.genericData.entityClicked = true;
        $('#addDiscountDialog').modal('show');

    }

    $scope.salesChannelClickedRow = function () {
        $scope.genericData.salesChannelClicked = !$scope.genericData.salesChannelClicked;
    }

    $scope.entityClickedRow = function () {
        $scope.genericData.entityClicked = !$scope.genericData.entityClicked;
    }

    //Updated Code By UV
    $scope.cancelmastersDialog = function(ev){
        skuStart=0;
        size=10;
        $scope.genericData.skusListFiltered = [];
        $scope.skuLoadBusy = true;
        $scope.stopSkuLoad = true;
        $('#dialogmastersku').modal('hide');

        $('#dialogmastervendor').modal('hide');

		if($scope.genericData.check == true){
			$scope.showAddOrderModalWithValues(ev);

		}

		if($scope.genericData.checker == true){
            $scope.showExportDiscountDialog(ev);
        }
	}

	$scope.selectSku = function(id, ev){

		$http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/'+id).success(function(data) {
        console.log(data);

			$scope.$broadcast("angucomplete-alt-long:changeInput", "category", data);

        }).error(function(error, status) {
            console.log(error);

        });

		$scope.cancelmastersDialog(ev);
	}


	$scope.showAddOrderModalWithValues = function(ev){

		// $mdDialog.show({
		// 	 templateUrl: 'addDiscountDialog.tmpl.html',
		//  parent: angular.element(document.body),
         // targetEvent: ev,
         // clickOutsideToClose: false,
         // scope: $scope.$new()
         // });
        $('#addDiscountDialog').modal('show');

	}

    var skuStart=0,size=10;
    $scope.skuLoadBusy = false;
    $scope.stopSkuLoad = false;
    $scope.skuPagingFunction = function () {
        if($scope.stopSkuLoad){
            return;
        }
        $scope.skuLoadBusy = true;
        mastersService.fetchSkusNext(MavenAppConfig.baseUrlSource,skuStart,size,function(data){
            if(data.length > 0){
                $scope.genericData.skusListFiltered = $scope.genericData.skusListFiltered.concat(data);
                skuStart += size;
                $scope.skuLoadBusy = false;
            }
            else{
                $scope.skuLoadBusy = true;
            }

        });

    }


    $scope.masterSkuDialog = function (ev, check) {

        mastersService.fetchSkus(MavenAppConfig.baseUrlSource,function (data) {
            $scope.genericData.skusListFiltered = data;
            $timeout(function () {
                $('#dialogmastersku').modal('show');
                $scope.skuLoadBusy = false;
                $scope.stopSkuLoad = false;
            }, 500);
        });

        $scope.genericData.check = check;

        if (check == true) {
            // $mdDialog.hide({
            //     //templateUrl: 'addDiscountDialog.tmpl.html'
            // });
            console.log($scope.singleorderData);
        }

    }

    $scope.masterSkuDialogForFilter = function (ev, check) {

        mastersService.fetchSkus(MavenAppConfig.baseUrlSource,function (data) {
            $scope.genericData.skusListFiltered = data;
            $timeout(function () {
                $('#dialogmastersku').modal('show');
                $scope.skuLoadBusy = false;
                $scope.stopSkuLoad = false;
            }, 500);
        });

        //$scope.genericData.check = check;
        $scope.genericData.checker = check;

        if (check == true) {
            $mdDialog.hide({
                //templateUrl: 'addDiscountDialog.tmpl.html'
            });
           // console.log($scope.singleorderData);
        }

    }

    $scope.selectSku = function(id, ev){
        $scope.stopSkuLoad = true;
        $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/'+id).success(function(data) {
            console.log(data);

            $scope.$broadcast("angucomplete-alt-long:changeInput", "category", data);

        }).error(function(error, status) {
            console.log(error);

        });

        $scope.cancelmastersDialog(ev);
    }





    $scope.showExportDiscountDialog = function (ev) {

        $scope.initDateLimitsForExport();

        $mdDialog.show({
            templateUrl: 'exportDiscountDialog.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        });
    }

    $scope.cancelDiscountExportDialog = function(){

	    $scope.exportFilterData = {};
        $scope.exportFilterData.tableDiscountRuleAllScSelected = false;
        $scope.exportFilterData.tableDiscountSalesChannelInclusions =[];
        $scope.exportFilterData.tableDiscountSkuInclusions = [];
        $scope.exportFilterData.tableDiscountSkuCategoryInclusions = [];

        $mdDialog.hide({
            templateUrl: 'exportDiscountDialog.tmpl.html'
        });
    }

    $scope.clearActionForExportFilter = function(saleChannelId, skuId, startDate, endDate, customerid,orderid) {
        $scope.exportFilterData.tableDiscountRuleStartDate = null;
        $scope.exportFilterData.tableDiscountRuleEndDate = null;
        $scope.exportFilterData.selectedSalesChannel = null;
        $scope.exportFilterData.tableDiscountRuleAllScSelected = false;
        $scope.exportFilterData.tableDiscountSalesChannelInclusions = [];
        $scope.exportFilterData.tableDiscountSkuCategoryInclusions = [];
        $scope.exportFilterData.tableDiscountSkuInclusions = [];
        $scope.exportFilterData.tableDiscountRuleSelectedEntity = null;
        $scope.exportFilterData.tableDiscountRuleAllSkuSelected = false;
        $scope.exportFilterData.tableDiscountRuleAllCategorySelected = false;
        $scope.$broadcast('angucomplete-alt-long:clearInput', 'category');
        $scope.initDateLimitsForExport();

    }


    $scope.exportFilterData.selectedSalesChannel = null;
    $scope.setSelectedChannelForFilter = function (selectedSalesChannel) {
        $scope.exportFilterData.selectedSalesChannel = selectedSalesChannel;
        //alert($scope.exportFilterData.selectedSalesChannel);
    }

    $scope.addSalesChannelToListForFilter = function () {

        console.log($scope.exportFilterData.selectedSalesChannel);
        if ($scope.exportFilterData.selectedSalesChannel == "" || $scope.exportFilterData.selectedSalesChannel == undefined) {
            $scope.notify('Select a sales channel first');
        } else {
            var salesChannelListing = true;
            angular.forEach($scope.exportFilterData.tableDiscountSalesChannelInclusions,function(value){
                console.log(value);
                if(value.tableSalesChannelValueInfo.idtableSalesChannelValueInfoId == $scope.exportFilterData.selectedSalesChannel.idtableSalesChannelValueInfoId){
                    salesChannelListing = false;
                }
            });
            if(salesChannelListing == false){
                $scope.notify('Sales Channel is already added in the list.');
                return;
            }
            $scope.exportFilterData.tableDiscountSalesChannelInclusions.push(
                {"tableSalesChannelValueInfo" : $scope.exportFilterData.selectedSalesChannel}
            );

        }
    }

    $scope.removeSalesChannelFromListForFilter = function (removedSalesChannel) {

        $scope.exportFilterData.tableDiscountSalesChannelInclusions.splice(removedSalesChannel, 1);

    }
    $scope.exportFilterData.tableDiscountRuleAllSkuSelected = true;

    $scope.clickChangeValueForFilter = function (data) {
        console.log(data);
        $scope.exportFilterData.tableDiscountRuleSelectedEntity = data;
        if (data == "Category") {
            $scope.angucompleteTitleField = "skuNodePathNameFormatted";
            $scope.exportFilterData.tableDiscountSkuInclusions = [];
            $scope.exportFilterData.searchedCategory = "";
            $scope.exportFilterData.tableDiscountRuleAllSkuSelected = false;
        }
        if (data == "SKU") {
            $scope.angucompleteTitleField = "tableSkuName";
            $scope.entitySearchUrl = $scope.skuSearchUrl;
            $scope.exportFilterData.tableDiscountSkuCategoryInclusions = [];
            $scope.exportFilterData.tableDiscountRuleAllCategorySelected = false;
        }
    };

    //$scope.exportFilterData.tableDiscountRuleSkuCategoryInclusion = true;
   /* $scope.allCategorySelectionChangedForFilter = function () {
        $scope.exportFilterData.tableDiscountRuleSkuCategoryInclusion = false;
        $scope.exportFilterData.tableDiscountSkuCategoryInclusions = [];
    }

    $scope.allSkuSelectionChangedForFilter = function () {
        $scope.exportFilterData.tableDiscountRuleSkuInclusion = false;
        $scope.exportFilterData.tableDiscountSkuInclusions = [];
    };*/
    $scope.exportFilterData.tableDiscountRuleAllScSelected = false;

    $scope.addEntityToDiscountRuleForFilter = function () {

        if ($scope.exportFilterData.tableDiscountRuleSelectedEntity == 'Category' && ($scope.exportFilterData.searchedCategory == undefined || $scope.exportFilterData.searchedCategory == null)) {
            $scope.notify('Search and select category first');
        }
        else {
            var b = true;
            if ($scope.exportFilterData.tableDiscountRuleSelectedEntity == 'Category') {
                angular.forEach($scope.exportFilterData.tableDiscountSkuCategoryInclusions,function(data){
                    if(data.tableSkuNode.idskuNodeId == $scope.exportFilterData.searchedCategory.idskuNodeId){
                        b = false;
                    }
                });
                if(b == false){
                    $scope.notify('Category is already added in the list.');
                    return;
                }
                $scope.exportFilterData.tableDiscountSkuCategoryInclusions.push(
                    {"tableSkuNode" : $scope.exportFilterData.searchedCategory}
                );
            }
        }
        if ($scope.exportFilterData.tableDiscountRuleSelectedEntity == 'SKU' && ($scope.searchedSKU == undefined || $scope.searchedSKU == null)) {
            $scope.notify('Search and select SKU first');
        } else {
            var DuplicateSkuEntityCheck = true;
            if ($scope.exportFilterData.tableDiscountRuleSelectedEntity == 'SKU') {
                angular.forEach($scope.exportFilterData.tableDiscountSkuInclusions,function(dataSku){
                    if(dataSku.tableSku.idtableSkuId == $scope.searchedSKU.idtableSkuId){
                        DuplicateSkuEntityCheck = false;
                    }
                });
                if(DuplicateSkuEntityCheck == false){
                    $scope.notify('SKU is already added.');
                    return;
                }
                $scope.exportFilterData.tableDiscountSkuInclusions.push(
                    {"tableSku": $scope.searchedSKU}
                );
            }
        }
    }

    $scope.removeEntityFromDiscountRuleForFilter = function (removedEntity) {
        if ($scope.exportFilterData.tableDiscountRuleSelectedEntity == 'Category') {
            $scope.exportFilterData.tableDiscountSkuCategoryInclusions.splice(removedEntity, 1);
        }
        if ($scope.exportFilterData.tableDiscountRuleSelectedEntity == 'SKU') {
            $scope.exportFilterData.tableDiscountSkuInclusions.splice(removedEntity, 1);
        }
    }

    $scope.removeEntityFromDiscountRuleForFilter = function (removedEntity) {
        if ($scope.exportFilterData.tableDiscountRuleSelectedEntity == 'Category') {
            $scope.exportFilterData.tableDiscountSkuCategoryInclusions.splice(removedEntity, 1);
        }
        if ($scope.exportFilterData.tableDiscountRuleSelectedEntity == 'SKU') {
            $scope.exportFilterData.tableDiscountSkuInclusions.splice(removedEntity, 1);
        }
    }

    $scope.searchedEntitySelectedForFilter = function (selected) {

        if ($scope.exportFilterData.tableDiscountRuleSelectedEntity == 'Category' && selected != null) {
            $scope.searchedCategory = selected.originalObject;
            $scope.searchedSKU = null;
        }

        if ($scope.exportFilterData.tableDiscountRuleSelectedEntity == 'SKU' && selected != null) {
            $scope.searchedSKU = selected.originalObject;
            $scope.searchedCategory = null;
        }
    };

    $scope.downloadDiscountRules = function () {

        var saleChannels = [];
        var categories = [];
        var skus = [];

        var check = false;

        if($scope.exportFilterData.tableDiscountRuleAllScSelected == false && $scope.exportFilterData.tableDiscountSalesChannelInclusions.length == 0){
            check = true;
            $scope.notify("Please fill required filters.");
        }

        if($scope.exportFilterData.tableDiscountRuleSelectedEntity == null){
            check = true;
            $scope.notify("Select category or SKU filters.");
        }

        if (!check) {
            if ($scope.exportFilterData.tableDiscountRuleAllScSelected == true) {
                saleChannels = [];
            } else {
                for (var i = 0; i < $scope.exportFilterData.tableDiscountSalesChannelInclusions.length; i++) {
                    saleChannels.push($scope.exportFilterData.tableDiscountSalesChannelInclusions[i].tableSalesChannelValueInfo.idtableSalesChannelValueInfoId);
                }
            }

            if ($scope.exportFilterData.tableDiscountRuleAllCategorySelected == true) {
                categories = [];
            } else {
                for (var i = 0; i < $scope.exportFilterData.tableDiscountSkuCategoryInclusions.length; i++) {
                    categories.push($scope.exportFilterData.tableDiscountSkuCategoryInclusions[i].tableSkuNode.idskuNodeId);
                }
            }

            if ($scope.exportFilterData.tableDiscountRuleAllSkuSelected == true) {
                skus = [];
            } else {
                for (var i = 0; i < $scope.exportFilterData.tableDiscountSkuInclusions.length; i++) {
                    skus.push($scope.exportFilterData.tableDiscountSkuInclusions[i].tableSku.idtableSkuId);
                }
            }

            var filterObject = {
                "startDate": $scope.exportFilterData.tableDiscountRuleStartDate,
                "endDate": $scope.exportFilterData.tableDiscountRuleEndDate,
                "saleChannelIds": saleChannels,
                "skuIds": skus,
                "categoryIds": categories
            }

            var orderListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/discountratematrixs/export";

            $http({
                method: 'POST',
                url: orderListUrl,
                data: filterObject,
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'

            })
                .success(function (data, status) {
                    console.log(data);
                    if (status == '204') {
                        $scope.notify("Discounts are not available for current filter values.");
                    } else {
                        var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                        var downloadUrl = URL.createObjectURL(blob);
                        var a = document.createElement("a");
                        a.href = downloadUrl;
                        a.download = "Glaucus_Discount_Rule_Matrix.xls";
                        document.body.appendChild(a);
                        a.click();
                        $scope.cancelDiscountExportDialog();
                    }
                    ;


                }).error(function (error, status) {
                if (status == 400) {
                    $scope.notify(data.errorMessage);
                }
                else {
                    $scope.notify("Discount Export request failed");
                }

            });
        }
    }
    $scope.$on('$destroy', function () {
        $("#dialogmastersku").remove();
        $('.modal-backdrop').remove();
    });

    $scope.clientprofile = {};

    $scope.isPriceModel = function(){
        var result = $scope.clientprofile.tableClientProfilePricingModel == 1?true:false;
        return result;
    }

    $scope.getClientProfile = function()
    {
        var clientProfileUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/clientprofiles";
        $http.get(clientProfileUrl).success(function(data)
        {
            if (data.length > 0)
            {
                $scope.clientprofile = data[0];
                $rootScope.clientprofile = data[0];
                $rootScope.$broadcast('menuChanged', true);
            }
        })
    }


    $scope.getClientProfile();

    $scope.rateListDataObject = {};

    $scope.showUploadRatesDialog = function (event) {
        $("#uploadRatesDialog").modal("show");
    }

    $scope.uploadBulkRatesFile = function(bulkRatesUploadfile) {
        if(bulkRatesUploadfile){
            console.log(bulkRatesUploadfile);
            file = bulkRatesUploadfile;
            console.log(file);
            console.log(file.name);
            $scope.fileName = file.name;
        }
        
    };

    $scope.ratesTemplateDownload = function () {

        $http({
            method: 'GET',
            url: $scope.downloadRatesTemplateUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
        })
            .success(function (data) {
                console.log(data);
                var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                var downloadUrl = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = downloadUrl;
                a.download = "Glaucus_Rates_Bulk_Upload_Template.xls";
                document.body.appendChild(a);
                a.click();
            }).error(function (data) {
            console.log(data);
        });

    };

    $scope.uploadTab = true;
    $scope.downloadTab = false;

    $scope.BulkUploadMode = function() {
        $scope.uploadTab = true;
        $scope.downloadTab = false;
    }

    $scope.BulkDownloadMode = function() {
        $scope.uploadTab = false;
        $scope.downloadTab = true;
    }


    $scope.processRatesBulkUpload = function (form, data) {

        if(!data.rateListName){
            $scope.notify("Please enter rate list name");
            return;
        }
        if(data.rateListName.length > 45){
            $scope.notify("Rate list name can not contain more than 45 characters");
            return;
        }
        if(!data.bulkRatesUploadfile){
            $scope.notify("Please upload a file");
            return;
        }

        file = data.bulkRatesUploadfile;
        $scope.disableBulkUpload = true;
        $scope.uploadProgress = null;
        $scope.notify("Upload is being processed in the background",'warning');
        if (!file.$error) {
            var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/fixedpricerule/ratesbulkupload';

            var fd = new FormData();
            fd.append('uploadFile', file);
            fd.append('name', data.rateListName);
            fd.append('description', data.rateListDescription);

            var upload = Upload.http({
                url: uploadUrl,
                method: 'POST',
                data: fd,
                headers: {
                    'Content-Type': undefined
                }
            });
            upload.then(function(resp) {
                $cookies.put('BulkUploadData','rates');
                $cookies.put('ActiveTab','rates');
                $scope.notify("File has been uploaded successfully.It may take a few minutes to reflect the changes.<br><a href='#/bulkuploads/' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View bulk upload reports.</a>",'success','','',0);
                file = null;
                $scope.cancelRatesUploadDialog(form);
                $scope.disableBulkUpload = false;
                $scope.getAllRateList();
            }, function(resp) {
                $scope.uploadedFile={};
                file = null;
                $scope.notify(resp.data.errorMessage);
                $scope.disableBulkUpload = false;
            }, function(evt) {
                $scope.uploadProgress = 'progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :' + file.name;
                console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :' + file.name);
            });
        }

    }

    $scope.cancelRatesUploadDialog = function(form, data) {
        // $scope.$broadcast("angucomplete-alt:clearInput", "products");
        // $scope.selectedSku = {};
        $scope.rateListDataObject.rateListName = null;
        $scope.rateListDataObject.rateListDescription = null;
        $scope.fileName = null;
        if(form){
            form.$setPristine();
            form.$setUntouched();
        }
        $('#uploadRatesDialog').modal('hide');
    };

    // $scope.selectedRateList = 'Select Rate List';

    $scope.rateList = [];

    $scope.getAllRateList = function () {
        var rateListURL = MavenAppConfig.baseUrlSource + "/omsservices/webapi/fixedpricerule/ratelist?size=" + 50;
        $http.get(rateListURL).success(function (data) {
            console.log(data);
            $scope.rateList = data;
            $scope.showLoader=false;
        }).error(function (error, status) {
            console.log(error);
            console.log(status);
        });
    };

    $scope.getAllRateList();

    $scope.showExportRatesDialog = function (event) {
        $("#exportRatesDialog").modal("show");
    }

    $scope.cancelRatesExportDialog = function (form, data) {
        $("#exportRatesDialog").modal("hide");
    }

    $scope.processRatesBulkExport = function (form, data) {

        if(!data){
            $scope.notify('Select a Rate List first');
            return;
        }

        $scope.selectedRateList = data;

        $http({
            method: 'GET',
            url: $scope.exportRatesUrl + $scope.selectedRateList.rateListName,
            headers: {
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
        })
            .success(function (data) {
                console.log(data);
                var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                var downloadUrl = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = downloadUrl;
                a.download = $scope.selectedRateList.rateListName + ".xls";
                document.body.appendChild(a);
                a.click();
            }).error(function (data) {
            console.log(data);
        });

    }

    $scope.masterCustomerDialog = function(ev, check){

        mastersService.fetchCustomers(MavenAppConfig.baseUrlSource,function(data){
            $scope.genericData.customerListFiltered = data;

            $timeout(function () {

                $('#dialogmastercustomer').modal('show');

            }, 500);

        })

        $scope.genericData.check = check;
    }

    $scope.customerObj = function(selected) {
        var q = $q.defer();
        if (selected != null)
        {
            $scope.isCustomerSelected = false;
            $scope.genericData.customerObj = selected.originalObject;

        }
        else
        {
            $scope.isCustomerSelected = true;
        }
        return q.promise;
    }

    $scope.selectCustomer = function(id, ev){

        $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/'+id).success(function(data) {
            console.log(data);

                $scope.$broadcast("angucomplete-alt:changeInput", "customers", data);



        }).error(function(error, status) {
            console.log(error);
        });

        $scope.cancelmastersDialog(ev);
    }

    $scope.cancelmastersDialog = function(ev){
        $('#dialogmastercustomer').modal('hide');
    }


    $scope.addCustomerToList = function(){

        if ($scope.genericData.customerObj == "" || $scope.genericData.customerObj == undefined) {
            $scope.notify('Select a customer first');
        } else {
            var customerListing = true;
            angular.forEach($scope.discountData.tableDiscountRuleCustomerInclusions,function(value){
                console.log(value);
                if(value.tableCustomer.idtableCustomerId == $scope.genericData.customerObj.idtableCustomerId){
                    customerListing = false;
                }
            });
            if(customerListing == false){
                $scope.notify('Customer is already added in the list.');
                return;
            }
            $scope.discountData.tableDiscountRuleCustomerInclusions.push(
                {"tableCustomer": $scope.genericData.customerObj}
            );
            $scope.genericData.customerObj = "";
            $('#customers_value').val('');
            $scope.$broadcast("angucomplete-alt:changeInput", "customers", "");
        }

    }

    $scope.removeCustomerFromList = function (removedCustomer) {

        $scope.discountData.tableDiscountRuleCustomerInclusions.splice(removedCustomer, 1);

    }

    $scope.assignedRateList = {};

    $scope.createdRule = {};

    $scope.showRateListAssignDialog = function(ruleObject){

        $scope.createdRule = ruleObject;

        $("#selectRateListDialog").modal("show");

    }

    $scope.assignRateList = function(rateList){

        $scope.createdRule.rateList = rateList;

        if($scope.createdRule.rateList == undefined || $scope.createdRule.rateList == ""){
            $scope.notify("Please select Rate list from dropdown");
            return;
        }
        var updateDiscountRuleURL = MavenAppConfig.baseUrlSource + "/omsservices/webapi/discountrules/" + $scope.createdRule.idtableDiscountRuleId;

                $http({
                    method: 'PUT',
                    url: updateDiscountRuleURL,
                    data: $scope.createdRule,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function (res) {
                    $scope.createdRule = null;
                    $scope.assignedRateList = null;
                    $scope.notify('Rate list assigned successfully !', 'success');
                    $("#selectRateListDialog").modal("hide");
                }).error(function (error, status) {
                    $scope.notify('There is some issue in assigning Rate List to discount rule.', 'error');
                });

    }

    $scope.selectionSaleChannel = function(check){
        if(check == 'select' && $scope.discountData.tableDiscountRuleAllScSelected){
            $scope.discountData.tableDiscountRuleSalesChannelExclusion = false;
        }
        else if(check == 'exclude' && $scope.discountData.tableDiscountRuleSalesChannelExclusion){
            $scope.discountData.tableDiscountRuleAllScSelected = false;
        }
        else if(check == 'include'){
            $scope.discountData.tableDiscountRuleSalesChannelExclusion = false;
            $scope.discountData.tableDiscountRuleAllScSelected = false;
        }
    }

}]);
