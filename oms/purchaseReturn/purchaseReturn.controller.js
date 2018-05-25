angular.module('OMSApp.purchaseReturn', []).config(function config($stateProvider) {
    $stateProvider.state('/purchaseReturn/', {
        name: '/purchaseReturn/',
        url: '/purchaseReturn/',
        views: {
            "main": {
                controller: 'purchaseReturnController',
                templateUrl: 'purchaseReturn/purchaseReturn.view.html'
            },
            "header": {
                controller: 'headerCtrl',
                templateUrl: '../shared/templates/header.html'
            }
        },
        data: {pageTitle: 'Purchase Return'}
    })

}).controller('purchaseReturnController', ['$rootScope','$scope', '$http', '$location', '$filter', 'MavenAppConfig', '$mdDialog','$sce',  '$window', 'Upload', 'pagerService', '$q', '$cookies','$timeout', 'mastersService',

function purchaseReturnController($rootScope ,$scope, $http, $location, $filter, MavenAppConfig, $mdDialog, $sce, $window, Upload, pagerService, $q, $cookies,$timeout, mastersService)
{

    //================================= global variables ========================== //
    $scope.baseSkuUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/search?search=';
    $scope.baseVendorUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/vendors/search?search=';
    $scope.bulkPurchaseReturnWithIdUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchasereturn/templateforpurchasereturnuploadwithpo';
    $scope.bulkPurchaseReturnWithoutIdUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchasereturn/templateforpurchasereturnuploadwithoutpo';
    $scope.genericData = {};
    $scope.genericData.singlePurchaseOrderReturnMode = "add";
    $scope.genericData.selectedOrderForEditRemarks = {};
    $scope.singleorderReturnData = {};
    $scope.sortType = "tablePurchaseReturnSystemOrderNo";
    $scope.directionType = "desc";

    $scope.filterObj = {};
    $scope.filterObj.tableWarehouseDetails = null;
    $scope.filterObj.tablePurchaseReturnRefNo = null;
    $scope.filterObj.tablePurchaseReturnSystemOrderNo = null;
    $scope.filterObj.tableSku = null;
    $scope.filterObj.tableVendor = null;
    $scope.filterObj.start1Date = null;
    $scope.filterObj.end1Date = null;

    $scope.bulkPurchaseOrderReturnTab = false;
    $scope.PurchaseOrderReturnTab = true;
    $scope.defaultTab = 'all';
    $scope.recordsPerPage = [5,10,15];
    $scope.orderSize = $scope.recordsPerPage[0];
    $scope.start = 0;
    $scope.PurchaseOrderReturnData = {};

    $scope.boxDetails = [];
    $scope.shippingDetails = {};
    $scope.Packing = {};
    $scope.shipping = {};
    $scope.disableQuickShipBox = [];
    $scope.editQuickShipBoxHideAndShow = [];
    $scope.quickShipDataTable = [];
    $scope.Packing.containerQuantity = [];

    $scope.quantityTypes = [
        'Good',
        'Bad'
    ]

    if($cookies.get('orderid') != null){
        $scope.filterObj.tablePurchaseReturnSystemOrderNo = $cookies.get('orderid');
        $cookies.remove('orderid')
    }

    var currentUrl,UrlName;
    currentUrl = $scope.currentUrl;
    if($scope.currentUrl === "")
    {
        currentUrl = window.location.href;
    }
    UrlName = currentUrl.split('/');
    console.log(UrlName);
    if(UrlName.indexOf('purchaseReturn') == -1)
    {
        $scope.defaultTab = "new";
    }
    else
    {
        $scope.defaultTab = "all";
    }

    $scope.genericData = {};

    $scope.initSingleOrderReturnData = function ()
    {
        $scope.genericData = {};
        $scope.genericData.returnQuantity = "";
        $scope.genericData.poRefNo = "";
        $scope.singleorderReturnData = {};
        $scope.singleorderReturnData.tablePurchaseReturnRefNo = "";
        $scope.singleorderReturnData.tablePurchaseReturnSkus = [];
        $scope.singleorderReturnData.tableShippingOwnership = null;
        $scope.singleorderReturnData.tableVendor = null;
        $scope.singleorderReturnData.tableWarehouseDetails = null;
        $scope.singleorderReturnData.tablePurchaseReturnQuantityType = "";
        $scope.singleorderReturnData.tablePurchaseReturnRemarks = "";
        $scope.singleorderReturnData.tablePurchaseReturnPickupDate = "";
        $scope.singleorderReturnData.tablePurchaseReturnDropDate = "";
        $scope.singleorderReturnData.tablePurchaseOrder = null;
        $scope.singleorderReturnData.tableAddress = null;
        $scope.fileName = null;
        $scope.genericData.bulkOrderUploadfile = null;
    }

    //============================ datepicker action change =============================== //


    $scope.startmaxDate = new Date();
    $scope.endmaxDate = new Date();

    $scope.sendStartDate = function(date)
    {
        $scope.startDateData = new Date(date);
        $scope.endminDate = new Date(
            $scope.startDateData.getFullYear(),
            $scope.startDateData.getMonth(),
            $scope.startDateData.getDate());
    }

    $scope.sendEndDate = function(date)
    {
        console.log(date);
        $scope.endDateData = new Date(date);
        $scope.startmaxDate = new Date(
            $scope.endDateData.getFullYear(),
            $scope.endDateData.getMonth(),
            $scope.endDateData.getDate());
    }



    $scope.initDateLimits = function () {
        $scope.minDateShipping = new Date();
        $scope.maxDateShipping = null;

        $scope.minDateDelivery = new Date();
        $scope.maxDateDelivery = null;

    };

    $scope.initDateLimits();



    $scope.onPickUpDateChange = function () {

        //Should be greater than equal to today's date and if delivery date is available then should be less than delivery date
        $scope.minDateShipping = new Date();

        if($scope.singleorderReturnData.tablePurchaseReturnDropDate)
        {
            $scope.deliveryDateData = new Date($scope.singleorderReturnData.tablePurchaseReturnDropDate);
            $scope.maxDateShipping = new Date(
                $scope.deliveryDateData.getFullYear(),
                $scope.deliveryDateData.getMonth(),
                $scope.deliveryDateData.getDate());
        }

        //Delivery date should be greater than equal to shipping date

        if($scope.singleorderReturnData.tablePurchaseReturnPickupDate)
        {
            $scope.shippingDateData = new Date($scope.singleorderReturnData.tablePurchaseReturnPickupDate);
            $scope.minDateDelivery = new Date(
                $scope.shippingDateData.getFullYear(),
                $scope.shippingDateData.getMonth(),
                $scope.shippingDateData.getDate());
        }
    };

    $scope.onDropDateChange = function ()
    {
        //should be greater than equal to today's date and if shipping date is there then should be greater than shipping date

        $scope.minDateDelivery = new Date();

        if($scope.singleorderReturnData.tablePurchaseReturnPickupDate)
        {
            $scope.shippingDateData = new Date($scope.singleorderReturnData.tablePurchaseReturnPickupDate);
            $scope.minDateDelivery = new Date(
                $scope.shippingDateData.getFullYear(),
                $scope.shippingDateData.getMonth(),
                $scope.shippingDateData.getDate());
        }

        if($scope.singleorderReturnData.tablePurchaseReturnDropDate)
        {
            $scope.deliveryDateData = new Date($scope.singleorderReturnData.tablePurchaseReturnDropDate);
            $scope.maxDateShipping = new Date(
                $scope.deliveryDateData.getFullYear(),
                $scope.deliveryDateData.getMonth(),
                $scope.deliveryDateData.getDate());
        }

    };


    $scope.clearStartDate = function()
    {
        $scope.filterObj.startDate = "";
        $scope.filterObj.start1Date = null;
        if($scope.filterObj.end1Date == null)
        {
            $scope.startmaxDate = new Date();
        }
        else
        {
            $scope.sendEndDate($scope.filterObj.end1Date);
        }
        $scope.endminDate = null;
    }

    $scope.clearEndDate = function()
    {
        $scope.filterObj.endDate = "";
        $scope.filterObj.end1Date = null;
        $scope.startmaxDate = new Date();
        $scope.endmaxDate = new Date();
        if($scope.filterObj.start1Date == null)
        {
            $scope.endminDate = null;
        }
        else
        {
            $scope.sendStartDate($scope.filterObj.start1Date);
        }
    }

    $scope.sendPickDate = function(date) {

    };

    $scope.sendDropDate = function(date) {

    };

    $scope.tableRowExpanded = false;
    $scope.tableRowIndexExpandedCurr = "";
    $scope.tableRowIndexExpandedPrev = "";
    $scope.storeIdExpanded = "";

    $scope.dayDataCollapseFn = function() {
        $scope.dayDataCollapse = [];

        for (var i = 0; i < $scope.orderLists.length; i += 1) {
            $scope.dayDataCollapse.push(false);
        }
    };

    $scope.cancelEditRemarksModal = function (form)
    {
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#editRemarkModal').modal('hide');
        $scope.genericData.selectedOrderForEditRemarks = {};
	    $scope.genericData.newRemarks = null;

    };

    $scope.openEditRemarkModal = function(order)
    {
        $scope.genericData.selectedOrderForEditRemarks = order ;
        $scope.modalRemarks = null;
        if(order.tablePurchaseReturnRemarkses == null || order.tablePurchaseReturnRemarkses == undefined){
            $scope.modalRemarks = null;
        }
        else
        {
            if(order.tablePurchaseReturnRemarkses.length > 0) {
                $scope.modalRemarks = order.tablePurchaseReturnRemarkses;
            }
        }
        $('#editRemarkModal').modal('show');
    };

    $scope.updateRemarks = function (form)
    {

        var orderData = $scope.genericData.selectedOrderForEditRemarks;
        var newRemarks = $scope.genericData.newRemarks;
        var updateRemarksURL = MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchasereturn/' +  $scope.genericData.selectedOrderForEditRemarks.idtablePurchaseReturnId +'/editremarks';
        $http({
            method: 'PUT',
            url: updateRemarksURL,
            data: newRemarks
        }).success(function(data)
        {
            var checkUpdatedRemarksDataUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/purchasereturn/"+orderData.idtablePurchaseReturnId;
            $http({
                method: 'GET',
                url: checkUpdatedRemarksDataUrl
            }).success(function(response){
                var dataIndex = $scope.PurchaseOrderReturnDataLists.indexOf(orderData);
                $scope.PurchaseOrderReturnDataLists[dataIndex] = response;
                $scope.cancelEditRemarksModal(form);
                $scope.notify("Remarks updated successfully",'success');

            }).error(function(err){
                $scope.cancelEditRemarksModal(form);
                console.log(err);
            });



        }).error(function(error, status)
        {
            if(status == 400)
            {
                $scope.notify(error.errorMessage);
            }
            else
            {
                $scope.notify("Failed to update remarks");
            }
        });
        $scope.cancelEditRemarksModal(form);
        
    }
    
    $scope.showCancelPurchaseOrderItem = function (tablePurchaseReturn, tablePurchaseReturnSku)
    {
        $scope.genericData.cancelPurchaseReturnRef = tablePurchaseReturn;
        $scope.genericData.cancelPurchaseReturnSkuRef = tablePurchaseReturnSku;
        $scope.genericData.selectedCancelReason = null;
        $('#cancelPurchaseReturnItem').modal('show');
    }

    $scope.hideCancelOrderItemDialog = function (form) {
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#cancelPurchaseReturnItem').modal('hide');
        $('#cancelPurchaseReturnItem').modal('hide');
    }

    $scope.cancelPurchaseReturnItem = function (form)
    {
        var cancelReason = '';
        if($scope.genericData.selectedCancelReason.tablePurchaseReturnCancelReasonString == 'Other')
        {
            if($scope.genericData.newCancelReason){
                if($scope.genericData.newCancelReason.tablePurchaseReturnCancelReasonString!=null) {
                    cancelReason = $scope.genericData.newCancelReason.tablePurchaseReturnCancelReasonString;
                }
            }
        }
        else
        {
            cancelReason = $scope.genericData.selectedCancelReason.tablePurchaseReturnCancelReasonString;
        }
        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchasereturn/'  + $scope.genericData.cancelPurchaseReturnRef.idtablePurchaseReturnId + '/purchasereturnsku/' + $scope.genericData.cancelPurchaseReturnSkuRef.idtablePurchaseReturnSkuId + '/cancel?remarks=' + cancelReason,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(data)
        {
            $scope.notify('Purchase return cancelled','success');
            $scope.hideCancelOrderItemDialog(form);
            $scope.listOfPurchaseReturnStatesCount($scope.defaultTab, 1);


        }).error(function(data)
        {
            $scope.hideCancelOrderItemDialog();

        });



        if($scope.genericData.addCancelReasonToList == true)
        {
            $http({
                method: 'POST',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchasereturncancelreason',
                data: $scope.genericData.newCancelReason,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(data)
            {
                $scope.notify('Cancel reason added to the list','success');
                $scope.loadCancelReasons();

            }).error(function(data)
            {
                console.log(data);
            });
        }
    }

    $scope.loadCancelReasons = function() {
        var cancelReasonsUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchasereturncancelreason';
        $http.get(cancelReasonsUrl).success(function(data)
        {
            console.log(data);
            $scope.cancelReasonArray = data;
            console.log($scope.cancelReasonArray);
        }).error(function(error, status)
        {
            console.log(error);
            console.log(status);

        });
    }

    $scope.loadCancelReasons();

    $scope.getPurchaseOrderInfo = function ()
    {
        if(!$scope.genericData.poRefNo || $scope.genericData.poRefNo == "")
        {
            $scope.notify("Enter PO Ref No.");
            return;
        }
        var poUrl = MavenAppConfig.baseUrlSource+'/omsservices/webapi/purchase/order/systemorderno?systemorderno=' + $scope.genericData.poRefNo;
        $http.get(poUrl).success(function(response)
        {
            if(response != null && response != undefined && response != "")
            {
                var grnfound = false;
                var purchaseOrderSkuses = response.tablePurchaseOrderSkuses;
                for(var skuindex=0; skuindex < purchaseOrderSkuses.length;skuindex++)
                {
                    if(response.tablePurchaseOrderSkuses[skuindex].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId == 7
                        || response.tablePurchaseOrderSkuses[skuindex].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId == 8
                        || response.tablePurchaseOrderSkuses[skuindex].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId == 9
                        || response.tablePurchaseOrderSkuses[skuindex].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId == 10)
                    {
                        grnfound = true;
                    }
                    else
                    {
                        response.tablePurchaseOrderSkuses.splice(skuindex,1);
                    }
                }
                if(grnfound == false)
                {
                    $scope.notify("There are no items in this order that are in grn state");
                    return;
                }
                $scope.populateReturnOrderFromPurchaseOrder(response);
            }
            else
            {
                $scope.notify("Can't find PO with this reference !!");
            }

        }).error(function(error, status)
        {
            if(status == 400){
                $scope.notify(error.errorMessage);
            }
            else{
                $scope.notify("Failed to get order");
            }
        });
    }

    $scope.populateReturnOrderFromPurchaseOrder = function (response)
    {
        $scope.genericData.availableQuantitys = [];
        $scope.genericData.OrderedQuantitys = [];
        $scope.genericData.skuInventories = [];
        $scope.getVendorAddress(response.tableVendor,response.tableAddress);

        //populate data here
        $scope.singleorderReturnData.tableVendor = response.tableVendor ;
        $scope.singleorderReturnData.tablePurchaseOrder = response ;
        $scope.singleorderReturnData.tableWarehouseDetails = response.tableWarehouseDetails ;
        if($scope.singlePurchaseOrderReturnMode == "add") {
            $scope.singleorderReturnData.tablePurchaseReturnSkus = [];
        }
        $scope.singleorderReturnData.tablePurchaseReturnQuantityType = $scope.quantityTypes[0];

        for (var orderSkuCounter = 0; orderSkuCounter < response.tablePurchaseOrderSkuses.length; orderSkuCounter++)
        {
            var grned = false;
            if(response.tablePurchaseOrderSkuses[orderSkuCounter].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId == 9)
            {
                grned = true;
                $scope.genericData.foundReturnable = true;
            }

            if(grned == true)
            {
                $scope.getPOSkuInventory(response,orderSkuCounter);
            }
        }
        if($scope.genericData.foundReturnable == false && $scope.singlePurchaseOrderReturnMode != "edit")
        {
            $scope.notify('There is no SKU found in this order that can be returned. Provide another reference');
            $scope.initSingleOrderReturnData();
        }
    }

    $scope.getPOSkuInventory = function(response,orderSkuCounter)
    {
        var availableQuantityOfPOurl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchase/order/' + response.idtablePurchaseOrderId + "/orderskus/" + response.tablePurchaseOrderSkuses[orderSkuCounter].idtablePurchaseOrderSkusId + "/inventory";
        $http.get(availableQuantityOfPOurl).success(function (data) {

            var tableSku = response.tablePurchaseOrderSkuses[orderSkuCounter].tableSku;

            $scope.genericData.OrderedQuantitys.push(
                {
                    "tableSku": tableSku,
                    "tablePurchaseReturnSkuQuantity": response.tablePurchaseOrderSkuses[orderSkuCounter].tablePurchaseOrderSkusSkuQuantity
                }
            )


            $scope.genericData.skuInventories.push(data);
            $scope.genericData.availableQuantitys.push(
                {
                    "tableSku": tableSku,
                    "tablePurchaseReturnSkuQuantity": data.tableSkuInventoryAvailableCount
                }
            )
            if($scope.genericData.singlePurchaseOrderReturnMode == "add")
            {
                $scope.singleorderReturnData.tablePurchaseReturnSkus.push(
                    {
                        "tableSku": tableSku,
                        "tablePurchaseReturnSkuQuantity": 0
                    }
                )
            }

        }).error(function (error, status) {

        });
    }

    $scope.getAvailableQuantitys = function ()
    {
        for(var orderSkuCounter = 0; orderSkuCounter < $scope.genericData.availableQuantitys.length ; orderSkuCounter++)
        {
            if($scope.singleorderReturnData.tablePurchaseReturnQuantityType == "Good") {
                $scope.genericData.availableQuantitys[orderSkuCounter].tablePurchaseReturnSkuQuantity = $scope.genericData.skuInventories[orderSkuCounter].tableSkuInventoryAvailableCount;
                $scope.singleorderReturnData.tablePurchaseReturnSkus[orderSkuCounter].tablePurchaseReturnSkuQuantity = $scope.genericData.skuInventories[orderSkuCounter].tableSkuInventoryAvailableCount;
            }
            if($scope.singleorderReturnData.tablePurchaseReturnQuantityType == "Bad") {
                var badcount = 0;
                if($scope.genericData.skuInventories[orderSkuCounter].tableSkuInventoryInwardQcFailedCount)
                {
                    badcount += $scope.genericData.skuInventories[orderSkuCounter].tableSkuInventoryInwardQcFailedCount;
                }
                if($scope.genericData.skuInventories[orderSkuCounter].tableSkuInventoryOutwardQcFailedCount)
                {
                    badcount += $scope.genericData.skuInventories[orderSkuCounter].tableSkuInventoryOutwardQcFailedCount;
                }
                $scope.genericData.availableQuantitys[orderSkuCounter].tablePurchaseReturnSkuQuantity = badcount;
                $scope.singleorderReturnData.tablePurchaseReturnSkus[orderSkuCounter].tablePurchaseReturnSkuQuantity = badcount;
            }
        }
    }

    $scope.getAvailableQuantity = function (tableSku)
    {
        if(tableSku == null || tableSku == undefined)
        {
            //No sufficient information to fetch quantity
            return;
        }

        if ($scope.singleorderReturnData.tableWarehouseDetails == null || $scope.singleorderReturnData.tableWarehouseDetails == undefined)
        {
            //No sufficient information to fetch quantity
            return;
        }

        if($scope.singleorderReturnData.tablePurchaseReturnQuantityType == null || $scope.singleorderReturnData.tablePurchaseReturnQuantityType == undefined)
        {
            //No sufficient information to fetch quantity
            return;
        }


        if($scope.singleorderReturnData.tablePurchaseReturnQuantityType == "Good") {
            $http({
                method: 'GET',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/inventory/' + tableSku.idtableSkuId + '/inventoriescount?fromwarehouseid='
                + $scope.singleorderReturnData.tableWarehouseDetails.idtableWarehouseDetailsId ,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (res)
            {
                for(var orderSkuCounter = 0; orderSkuCounter < $scope.genericData.availableQuantitys.length ; orderSkuCounter++)
                {
                    if($scope.genericData.availableQuantitys[orderSkuCounter].tableSku === tableSku )
                    {
                        $scope.genericData.availableQuantitys[orderSkuCounter].tablePurchaseReturnSkuQuantity = res.totalInventory-res.totalBlockedInventory;
                    }
                }
            }).error(function (error, status)
            {

            });
        }
        if($scope.singleorderReturnData.tablePurchaseReturnQuantityType == "Bad") {
            $http({
                method: 'GET',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/inventory/sku/' + tableSku.idtableSkuId + '/warehouse/' + $scope.singleorderReturnData.tableWarehouseDetails.idtableWarehouseDetailsId + '/badcount',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (res)
            {
                for(var orderSkuCounter = 0; orderSkuCounter < $scope.genericData.availableQuantitys.length ; orderSkuCounter++)
                {
                    if($scope.genericData.availableQuantitys[orderSkuCounter].tableSku === tableSku )
                    {
                        $scope.genericData.availableQuantitys[orderSkuCounter].tablePurchaseReturnSkuQuantity = res;
                    }
                }
            }).error(function (error, status) {

            });
        }
    };


    $scope.loadReturnReasons = function() {
        $scope.returnReasonArray = [];
        var returnReasonsUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchasereturnreason';
        $http.get(returnReasonsUrl).success(function(data)
        {
            $scope.returnReasonArray = data;
        }).error(function(error, status)
        {
            console.log(error);
            console.log(status);

        });
    }

    $scope.loadReturnReasons();

    $scope.onPOReferenceNumberOptionChanged = function (porefknown)
    {
        $scope.initSingleOrderReturnData();
        $scope.initDateLimits();
        $scope.genericData.singlePurchaseOrderReturnMode = "add";
        $scope.genericData.poRefKnown = porefknown;
        if($scope.genericData.poRefKnown == true)
        {
            $('#addPurchaseOrderReturnModal').modal('show');
        }
        if($scope.genericData.poRefKnown == false)
        {
            $('#addPurchaseOrderReturnModalRefUnknown').modal('show');
        }
        $('#askPurchaseRefKnownModal').modal('hide');
    }

    $scope.showaAskPurchaseRefKnownModal = function () {
        $('#askPurchaseRefKnownModal').modal('show');

    }

//    ====================================== add quick ship details ======================================== //



    $scope.quickShipDataDialog = function (ev, data) {
        $scope.disableQuickShip = false;
        $('#PurchaseReturnquickOperation').modal('show');
        $scope.quickShipDataTable = data.tablePurchaseReturnSkus;

        $scope.quickShipDataTable.orderID = data.idtablePurchaseReturnId;
        $scope.SelectVehicleType();
        $scope.LengthMeasureUnitDropDown();
    };

    $scope.cancelQuickShipModal = function(form){

        $scope.blurred = true;
        $scope.boxDetails = [];
        $scope.shippingDetails = {};
        $scope.Packing = {};
        $scope.quickShipDataTable = [];
        $scope.shippingDetails.SkuType = 'Parcel';
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }

        $('#PurchaseReturnquickOperation').modal('hide');
    };

    $scope.validateAlphaNum = function (val) {

        var letterNumber = /^[0-9a-zA-Z]+$/;
        if(val.match(letterNumber))
        {
        }
        else
        {
            $scope.notify("Only alphabets and numbers are allowed")
        }
    }

    $scope.validateAlpha = function (val) {

        var letters = /^[A-Za-z ]+$/;
        if(val.match(letters))
        {
        }
        else
        {
            $scope.notify("Only alphabets are allowed")
        }
    }

    $scope.shippingDetails = {};
    $scope.resetAllQuickShipFields = function () {
        $scope.shippingDetails.VehicleType = null;
        $scope.shippingDetails.DriverName = null;
        $scope.shippingDetails.DriverNumber = null;
        $scope.shippingDetails.VehicleNumber = null;
        $scope.shippingDetails.tablePurchaseReturnShippingDetailsMasterAwb = null;

    }


    $scope.validateNumber = function (val)
    {
        if(isNaN(val)){
            $scope.notify("Only numbers are allowed");
        }
    }

    $scope.ShippingDetailsBtn = function(value){
        if (value.SkuType == 'Heavy') {

            if(value.VehicleType == '' || value.VehicleType == undefined){
                $scope.notify('Vehicle type is required.');
                return false;
            }
            if (value.DriverName == '' || value.DriverName == undefined){
                $scope.notify('Driver name is required.');
                return false;
            }
            if($scope.validateAlpha(value.DriverName) == false){
                return false;
            }
            if($scope.validateAlphaNum(value.VehicleNumber) == false){
                return false;
            }
            if($scope.validateNumber(value.DriverNumber) == false){
                return false;
            }
            if(value.VehicleNumber == '' || value.VehicleNumber == undefined){
                $scope.notify('Vehicle number is required.');
                return false;
            }
            else {
            }
        }
        else if (value.SkuType == 'Parcel') {
            if (value.tablePurchaseReturnShippingDetailsMasterAwb == '' || value.tablePurchaseReturnShippingDetailsMasterAwb == undefined) {
                $scope.notify('AWB number is required.');
                return false;
            }
        }
    };



    $scope.SelectVehicleType = function(){
        var vehicletypeUrl = MavenAppConfig.baseUrlSource+'/omsservices/webapi/vehicletypes';
        $http.get(vehicletypeUrl).success(function(data) {
            $scope.SKUvehicleType = data;
        }).error(function(data){
            console.log(data);
        });
    };

    $scope.sum = function(items, prop){
        console.log(items);
        return items.reduce( function(a, b){
            return parseInt(a) + parseInt(b[prop]);
        }, 0);
    };

    $scope.PackingContainerNumber = function(value,dimensions,shippedDetails,IndexValue)
    {

        if(dimensions.Length == null || dimensions.Length == undefined)
        {
            $scope.notify('Enter length');
            return;
        }

        if(dimensions.Breadth == null || dimensions.Breadth == undefined)
        {
            $scope.notify('Enter Width');
            return;
        }

        if(dimensions.Height == null || dimensions.Height == undefined)
        {
            $scope.notify('Enter height');
            return;
        }

        if (dimensions.Weight == null || dimensions.Weight == undefined) {
            $scope.notify('Enter weight');
            return;
        }

        if (dimensions.LengthUnit == null || dimensions.LengthUnit == undefined) {
            $scope.notify('Enter dimension unit');
            return;
        }

        if(dimensions.WeightUnit == null || dimensions.WeightUnit == undefined)
        {
            $scope.notify('Enter weight unit');
            return;
        }

        if(shippedDetails.SkuType == 'Parcel' && !$scope.shipping.awbnumber)
        {
            $scope.notify('Enter AWB No');
            return;
        }

        if(value == null || value == undefined || value.length == 0 )
        {
            $scope.notify('Add package to the list');
            return;
        }


        console.log('array value:',value);
        console.log('array value:',shippedDetails);
        console.log('array value:',IndexValue);
        console.log('dimensions:',dimensions);
        var tableSkus =[];
        var quantity = 0;
        var awbno = true;
        angular.forEach(value,function(source){
            if(source.tableSkusSkuQuantity)
            {
                quantity += source.tableSkusSkuQuantity;
                source.tablePurchaseReturnShippingDetailsShippingAwb = $scope.shipping.awbnumber;
                tableSkus.push(source);
            }
            else
            {
                source.tableSkusSkuQuantity = 0;
            }
        });
        if(quantity == 0){
            $scope.notify('Please Enter Quantity');
            return;
        }
        dimensions.tablePurchaseReturnSkus = tableSkus;
        dimensions.SKUcarrierDetails = shippedDetails;
        dimensions.SalesorderID = value.orderID;

        $scope.boxDetails.push(angular.copy(dimensions));

        angular.forEach($scope.quickShipDataTable, function (res) {
            res.tablePurchaseReturnShippingDetailsShippingAwb = null;
            res.tableSkusSkuQuantity = null;
        });
        $scope.shipping = {};


        console.log($scope.boxDetails);
        angular.forEach($scope.boxDetails, function (source) {
            $scope.TotalInputQuantity = $scope.sum(source.tablePurchaseReturnSkus, 'tableSkusSkuQuantity');

        });
        console.log(typeof $scope.TotalInputQuantity);
        console.log($scope.TotalInputQuantity);
    };

    $scope.LengthMeasureUnitDropDown = function(){
        var UnitUrl = MavenAppConfig.baseUrlSource+'/omsservices/webapi/skuuodmtypes';
        var WeightUnitUrl = MavenAppConfig.baseUrlSource+'/omsservices/webapi/skuuowmtypes';
        $http.get(UnitUrl).success(function(data) {
            console.log(data);
            $scope.lengthUnitDropdown = data;
        }).error(function(data){
            console.log(data);
        });
        $http.get(WeightUnitUrl).success(function(data) {
            console.log(data);
            $scope.weightUnitDropdown = data;
        }).error(function(data){
            console.log(data);
        });
    };

    var SalesOrderSkuID;
    $scope.AddPacckingDetails = function (form)
    {
        $scope.disableQuickShip = true;
        var data = $scope.boxDetails;
        $scope.boxSequenceNo = 1;
        var QuickShipTable = [];

        var SKUDto, SKuQuanity, newSkupackingData;
        if (data == "")
        {
            $scope.notify("You need to add package to list");
            $scope.disableQuickShip = false;
            return;
        }
        else
        {
            angular.forEach(data, function (value)
            {
                var SKUcarrierValue = null;
                var SkuDriverName = null;
                var SkuDriverNumber = null;
                var SkuVehicleNumber = null;
                var SkuVehicleType = null;

                    SalesOrderSkuID = value.SalesorderID;
                if (value.SKUcarrierDetails.tablePurchaseReturnShippingDetailsMasterAwb == null || value.SKUcarrierDetails.tablePurchaseReturnShippingDetailsMasterAwb == undefined)
                {
                    SKUcarrierValue = null;
                }
                else
                {
                    SKUcarrierValue = value.SKUcarrierDetails.tablePurchaseReturnShippingDetailsMasterAwb;
                }
                if (value.SKUcarrierDetails.DriverName == null || value.SKUcarrierDetails.DriverName == undefined)
                {
                    SkuDriverName = null;
                }
                else
                {
                    SkuDriverName = value.SKUcarrierDetails.DriverName;
                }
                if (value.SKUcarrierDetails.DriverNumber == null || value.SKUcarrierDetails.DriverNumber == undefined)
                {
                    SkuDriverNumber = null;
                }
                else
                {
                    SkuDriverNumber = value.SKUcarrierDetails.DriverNumber;
                }
                if (value.SKUcarrierDetails.VehicleNumber)
                {
                    SkuVehicleNumber = value.SKUcarrierDetails.VehicleNumber;
                }
                else
                {
                    SkuVehicleNumber = null;
                }

                if (value.SKUcarrierDetails.VehicleType)
                {
                    SkuVehicleType = value.SKUcarrierDetails.VehicleType;
                }
                else
                {
                    SkuVehicleType = null;
                }

                angular.forEach(value.tablePurchaseReturnSkus, function (response)
                {
                    SKUDto = _.omit(response, 'tableSkusSkuQuantity', 'tablePurchaseReturnShippingDetailsShippingAwb', 'SalesorderID');
                    SKuQuanity = response.tableSkusSkuQuantity;
                    if(SKuQuanity && SKuQuanity != 0) {
                        if (SKUcarrierValue == 'undefined' || SKUcarrierValue == null) {
                            var vehicleDriverMap = {
                                "tableClientShippingCarrierDriverDetails": {
                                    "tableClientShippingCarrierDriverDetailsName": SkuDriverName,
                                    "tableClientShippingCarrierDriverDetailsPhoneNo": SkuDriverNumber
                                },
                                "tableClientShippingCarrierVehicle": {
                                    "tableClientShippingCarrierVehicleRegNo": SkuVehicleNumber,
                                    "tableClientShippingCarrierVehicleType": SkuVehicleType
                                }
                            };
                        }
                        newSkupackingData = {
                            'tablePurchaseReturnSku': SKUDto,
                            'skuQuantity': SKuQuanity,
                            'tablePurchaseReturnPackingDetails': {
                                'tablePurchaseReturnPackingDetailsLength': value.Length,
                                'tablePurchaseReturnPackingDetailsWidth': value.Breadth,
                                'tablePurchaseReturnPackingDetailsHeight': value.Height,
                                'tablePurchaseReturnPackingDetailsWeight': value.Weight,
                                "tableSkuUodmType": value.LengthUnit,
                                "tableSkuUowmType": value.WeightUnit,
                                "tablePurchaseReturnShippingDetails": {
                                    "tablePurchaseReturnShippingDetailsMasterAwb": SKUcarrierValue,
                                    "tablePurchaseReturnShippingDetailsShippingAwb": response.tablePurchaseReturnShippingDetailsShippingAwb,
                                    "tableClientShippingCarrierVehicleDriverMap": vehicleDriverMap
                                }
                            },
                            "boxSequenceNo": $scope.boxSequenceNo
                        };
                        QuickShipTable.push(newSkupackingData);
                    }
                });
                $scope.boxSequenceNo++;

            });
            console.log(QuickShipTable);

            $http({
                method: 'PUT',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchasereturn/' + SalesOrderSkuID + '/packinginfo',
                data: QuickShipTable,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (data) {
                console.log(data);


                $('#PurchaseReturnquickOperation').modal('hide');
                $scope.notify('Quick ship success','success');
                $scope.shippingDetails.SkuType = 'Parcel';
                $scope.cancelQuickShipModal(form);
                $scope.listOfPurchaseReturnStatesCount($scope.defaultTab);
            }).error(function (error,status)
            {
                $scope.disableQuickShip = false;
                $scope.shippingDetails.SkuType = 'Parcel';
                $scope.cancelQuickShipModal(form);
                $('#PurchaseReturnquickOperation').modal('hide');
                console.log(error);
                if(status == 400){
                    $scope.notify(error.errorMessage);
                }
                else {
                    $scope.notify("Failed to quick ship");
                }
            })
        }
    };


    $scope.blurred = true;
    $scope.skuPackingDisable =function(shippingDetailsType)
    {
        if($scope.ShippingDetailsBtn(shippingDetailsType)==false)
        {
            return;
        }
        $scope.blurred = false;
    };

    $scope.RemoveContainerPackage = function(index){
        console.log(index);
        $scope.disableQuickShipBox[index] = false;
        $scope.editQuickShipBoxHideAndShow[index] = false;
        $scope.boxDetails.splice(index, 1);
    };


    $scope.shippingDetails  = {};



//    ====================================== add purchase order return dialog box ========================== /

    $scope.showAddPurchaseOrderReturnModal = function(){
        $('#addPurchaseOrderReturnModal').modal('show');
    };

    //============================= close purchase order return dialog ===================== //

    $scope.cancelSinglePurchaseOrderReturn = function(form){
        if($scope.genericData.poRefKnown == true)
        {
            $('#addPurchaseOrderReturnModal').modal('hide');
        }
        if($scope.genericData.poRefKnown == false)
        {
            $('#addPurchaseOrderReturnModalRefUnknown').modal('hide');
        }
        $scope.initSingleOrderReturnData();
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
    };

    //============================= PurchaseOrderReturn Tab Mode ============================ //
    $scope.singlePurchaseOrderReturnTabMode = function() {
        $scope.PurchaseOrderReturnTab = true;
        $scope.bulkPurchaseOrderReturnTab = false;
    };

    //bulkOrder Tab Mode
    $scope.bulkPurchaseOrderReturnTabMode = function() {
        $scope.PurchaseOrderReturnTab = false;
        $scope.bulkPurchaseOrderReturnTab = true;
    };

    $('#addPurchaseOrderReturnModal').on('show.bs.modal' , function (e){
        $( "#ordertabs a:first"  ).tab('show');
    });

    $('#addPurchaseOrderReturnModalRefUnknown').on('show.bs.modal' , function (e){
        $( "#ordertabswithoutref a:first"  ).tab('show');
    });



    $scope.selectTableRow = function(index) {
        if (typeof $scope.dayDataCollapse === 'undefined') {
            $scope.dayDataCollapseFn();
        }
        if ($scope.tableRowExpanded === false && $scope.tableRowIndexExpandedCurr === "" ) {
            $scope.tableRowIndexExpandedPrev = "";
            $scope.tableRowExpanded = true;
            $scope.tableRowIndexExpandedCurr = index;
            $scope.dayDataCollapse[index] = true;
        } else if ($scope.tableRowExpanded === true) {
            if ($scope.tableRowIndexExpandedCurr === index ) {
                $scope.tableRowExpanded = false;
                $scope.tableRowIndexExpandedCurr = "";
                $scope.dayDataCollapse[index] = false;
            } else {
                $scope.tableRowIndexExpandedPrev = $scope.tableRowIndexExpandedCurr;
                $scope.tableRowIndexExpandedCurr = index;
                $scope.dayDataCollapse[$scope.tableRowIndexExpandedPrev] = false;
                $scope.dayDataCollapse[$scope.tableRowIndexExpandedCurr] = true;
            }
        }

    };

    $scope.stateTrials = function(purchasereturnskus) {
        console.log(purchasereturnskus);
        console.log(purchasereturnskus.length);
        $scope.trialsDataArray = [];
        $scope.trialIdArray = [];
        $scope.trialsLength = [];
        $scope.fullTrialsArray = [];
        $scope.fullIdArray = [];
        for (var i = 0; i < purchasereturnskus.length; i++) {
            console.log(i);
            console.log(purchasereturnskus[i]);
            var trials = purchasereturnskus[i].tablePurchaseReturnSkuStateTrails;
            $scope.trialsLength.push(trials.length);
            console.log(trials);
            console.log($scope.trialsLength);
            if (trials.length < 4) {
                for (var j = 0; j < trials.length; j++) {
                    $scope.trialsDataArray.push(trials[j].tablePurchaseReturnSkuStateType.tablePurchaseReturnSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tablePurchaseReturnSkuStateType.idtablePurchaseReturnSkuStateTypeId);
                }
            }

            if (trials.length == 4) {
                for (var j = 0; j < trials.length; j++) {
                    console.log(trials[j].tablePurchaseReturnSkuStateType.tablePurchaseReturnSkuStateTypeString);
                    $scope.trialsDataArray.push(trials[j].tablePurchaseReturnSkuStateType.tablePurchaseReturnSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tablePurchaseReturnSkuStateType.idtablePurchaseReturnSkuStateTypeId);
                }
            }

            if (trials.length > 4) {
                console.log(trials.length - 4);
                var totalLength = trials.length - 4;
                for (var j = totalLength; j < trials.length; j++) {
                    console.log(trials[j].tablePurchaseReturnSkuStateType.tablePurchaseReturnSkuStateTypeString);
                    $scope.trialsDataArray.push(trials[j].tablePurchaseReturnSkuStateType.tablePurchaseReturnSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tablePurchaseReturnSkuStateType.idtablePurchaseReturnSkuStateTypeId);
                }
            }


            $scope.fullTrialsArray.push($scope.trialsDataArray);
            $scope.fullIdArray.push($scope.trialIdArray);

            $scope.trialsDataArray = [];
            $scope.trialIdArray = [];

            console.log($scope.fullTrialsArray);
        }
    };


    //============================ vendor result object ==================================== //

    $scope.searchedProduct = function(selected) {
        if (selected != null)
        {
            $scope.searchedSku = selected.originalObject;
            $scope.getInventoryByVendorAndSKUAndWarehouse(selected);
        }
    };


    $scope.getInventoryByVendorAndSKUAndWarehouse = function(selected) {

        if(selected)
        {
            if(!$scope.singleorderReturnData.tableWarehouseDetails.idtableWarehouseDetailsId)
            {
                $scope.notify("Select Warehouse");
                return;
            }
            if(!$scope.singleorderReturnData.tableVendor.idtableVendorId)
            {
                $scope.notify("Select Vendor");
                return;
            }

            var wareHousesListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/inventory/warehouseinventory?skuid="+selected.originalObject.idtableSkuId
                +"&warehouseid="+$scope.singleorderReturnData.tableWarehouseDetails.idtableWarehouseDetailsId+"&vendorid="+$scope.singleorderReturnData.tableVendor.idtableVendorId;
            $http.get(wareHousesListUrl).success(function(data) {
                if(data.length > 0)
                {
                    if($scope.singleorderReturnData.tablePurchaseReturnQuantityType =="Bad")
                    {
                        $scope.availableQuantityOfSkuAndVendor = data[0].bad;
                    }
                    else
                    {
                        $scope.availableQuantityOfSkuAndVendor = data[0].available;
                    }
                }
                else
                {
                    $scope.availableQuantityOfSkuAndVendor = 0;
                }
            }).error(function(error, status)
            {
                console.log(error);
                console.log(status);

            });
        }
    }

    $scope.clearProductList = function()
    {
        $scope.availableQuantityOfSkuAndVendor = null;
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
    }

    //============================ vendor result object ==================================== //

    $scope.searchedProductForFilter = function(selected) {
        if (selected != null && selected != undefined)
        {
            $scope.filterObj.tableSku = selected.originalObject;
        }else{
            $scope.filterObj.tableSku = undefined;
        }
    };

    $scope.searchedVendor = function(selected) {
        console.log(selected);
        if(selected!=null && selected != undefined)
        {
            $scope.filterObj.tableVendor = selected.originalObject;
        }else{
            $scope.filterObj.tableVendor = undefined;
        }
    };


//    -=============================== list of warehouse =========================== //

    $scope.listOfWareHouses = function() {
        $scope.wareHousesData = [];
        var wareHousesListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/warehouses?size=-1&option=towithoutfba&uipagename="+$scope.pagename;
        $http.get(wareHousesListUrl).success(function(data) {
            console.log(data);
            $scope.wareHousesData = data;
        }).error(function(error, status)
        {
            console.log(error);
            console.log(status);

        });
    };

    $scope.listOfWareHouses();

//    ========================================= llist of vendors ===================== //

    $scope.listOfVendors = function() {
        $scope.vendorsData = [];
        var vendorsListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/vendors";
        $http.get(vendorsListUrl).success(function(data)
        {
            console.log(data);
            $scope.vendorsData = data;
        }).error(function(error, status)
        {
            console.log(error);
            console.log(status);
        });
    };
    $scope.listOfVendors();

//===================================================== list of shipping owners ========================== //

    $scope.listOfShippingOwners = function(){
        $scope.shippingOwnersData = []
        var shippingOwnersUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/shippingowner";
        $http.get(shippingOwnersUrl).success(function(data) {
            $scope.shippingOwnersLists = data;
            for (var i = 0; i < $scope.shippingOwnersLists.length; i++) {
                $scope.shippingOwnersData.push($scope.shippingOwnersLists[i]);
            }
            console.log($scope.shippingOwnersData);
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };

    $scope.listOfShippingOwners();
//    ============================================ on change of vendor list =============================== //
    var producted = [];
    $scope.getVendorAddressesAndSkus = function(vendorData){
        console.log(vendorData);
        $scope.PurchaseOrderReturnData.quantityNo = "";
        $scope.PurchaseOrderReturnData.priceProd = "";
        $scope.products = [];
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        var vendor;
        if(typeof vendorData == 'string'){
            vendor = JSON.parse(vendorData);

        }else{
            vendor = vendorData;

        }
        console.log(vendor);
        $scope.vendorId = vendor.idtableVendorId;
       
        var vendorAddress = MavenAppConfig.baseUrlSource +"/omsservices/webapi/vendors/"+$scope.vendorId+"/address";
        $http({
            method:'GET',
            url:vendorAddress
        }).success(function(data){
            console.log(data);
            $scope.deliveryAddressArray = [];
            $scope.vendoraddresses = data; // get data from json
            var giter = _.filter(data,function (value) {
                return value!==null;
            });
            console.log(giter);
            angular.forEach($scope.vendoraddresses, function(item){
                console.log(item.tableAddress);
                $scope.deliveryAddressArray.push(item.tableAddress);
            });
            //$scope.$apply();
        }).error(function(data){
            console.log(data);
        });
        console.log($scope.vendorId);
    };

//    ============================================= filter search submit action =============================== //

    $scope.getVendorAddress = function (tableVendor)
    {
        var vendorAddress = MavenAppConfig.baseUrlSource +"/omsservices/webapi/vendors/"+tableVendor.idtableVendorId+"/address";
        $http({
            method:'GET',
            url:vendorAddress
        }).success(function(data)
        {
            console.log(data);
            $scope.deliveryAddressArray = [];
            $scope.vendoraddresses = data; // get data from json
            angular.forEach($scope.vendoraddresses, function(item)
            {
                $scope.deliveryAddressArray.push(item.tableAddress);
            });

        }).error(function(data)
        {
            console.log(data);
        });

    }
    $scope.searchPurchaseReturnOrders = function(){
        $scope.submitAction();
    }
    $scope.submitAction = function()
    {

        console.log($scope.filterObj);

        if ($scope.filterObj.start1Date != undefined) {
            $scope.filterObj.startDate = moment.utc($scope.filterObj.start1Date).format();


        }
        if ($scope.filterObj.end1Date != undefined) {
            $scope.filterObj.endDate = moment.utc($scope.filterObj.end1Date).format();
        }
        $scope.listOfPurchaseReturnStatesCount($scope.defaultTab, 1);

    }

    $scope.addProduct = function()
    {
        if (!$scope.searchedSku)
        {
            $scope.notify("Please search and select a product first!");
            return;
        }

        if (!$scope.genericData.returnQuantity)
        {
            $scope.notify("Please enter the product quantity!");
            return
        }

        if ($scope.genericData.returnQuantity < 1)
        {
            $scope.notify("Please enter return quantity greater than 0!");
            return;
        }
        else
        {
            for (var i = 0; i < $scope.singleorderReturnData.tablePurchaseReturnSkus.length; i++)
            {
                if ($scope.singleorderReturnData.tablePurchaseReturnSkus[i].tableSku.idtableSkuId == $scope.searchedSku.idtableSkuId)
                {
                    $scope.notify("The selected SKU is already part of the current order. Delete the existing item first to add updated quantity.");
                    return;
                }
            }
            var tempObject = {
                tableSku : $scope.searchedSku,
                tablePurchaseReturnSkuQuantity: $scope.genericData.returnQuantity
            };

            $scope.singleorderReturnData.tablePurchaseReturnSkus.push(tempObject);
            $scope.$broadcast('angucomplete-alt:clearInput', 'products');
            $scope.genericData.returnQuantity = "";
            $scope.searchedSku = null;
            $scope.availableQuantityOfSkuAndVendor = null;
        }
    };

    //remove the product
    $scope.removeProduct = function(index) {
        $scope.genericData.deleteItemIndex = index;
        $('#masterDeleteDialogue').modal('show');
    };
    $scope.deleteSelectedItem = function(){
        $scope.singleorderReturnData.tablePurchaseReturnSkus.splice($scope.genericData.deleteItemIndex, 1);
        $scope.cancelmasterDeleteDialog();
        $scope.notify('Item deleted successfully.','success');
    };
    $scope.cancelmasterDeleteDialog = function(){
        $('#masterDeleteDialogue').modal('hide');
    };
    $scope.totalQuantity = function(allSkus){
        var total = 0;
        for (var i = 0; i < allSkus.length; i++) {
            var quantity = allSkus[i].tablePurchaseReturnSkuQuantity;
            total += quantity;
        }
        return total;
    }

    $scope.totalCostAmount = function(allSkus) {
        var total = 0;
        var totalCost = 0;
        var totalCostAmount = 0;
        var totalCostAll = [];
        for (var i = 0; i < allSkus.length; i++)
        {
            if(allSkus[i].tablePurchaseReturnSkuInventoryMaps != null && allSkus[i].tablePurchaseReturnSkuInventoryMaps != undefined)
            {
                for (var j = 0; j < allSkus[i].tablePurchaseReturnSkuInventoryMaps.length; j++)
                {
                    var product = allSkus[i].tablePurchaseReturnSkuInventoryMaps[j].tableSkuInventory.tableSkuInventoryRateTotal;
                    total += product;
                }
                totalCostAmount += total * allSkus[i].tablePurchaseReturnSkuQuantity;
                totalCostAll.push(totalCostAmount);
                total = 0;
            }
        }
        return totalCostAmount;
    }


//    ============================================== api for purchase order list counts ====================== //

    $scope.onRecordsPerPageChange = function (orderSize) {
        $scope.start = 0;
        $scope.orderSize = orderSize;
        $scope.end = 0;
        $scope.PurchaseOrderReturnDataLists = [];
        $scope.listOfPurchaseReturnStatesCount($scope.defaultTab, 1);
    }
    $scope.listOfPurchaseReturnStatesCount = function(tabsValue, page, action)
    {

        $scope.defaultTab = tabsValue;
        $scope.PurchaseOrderReturnDataLists = [];
        $scope.showLoader = true;
        $scope.allCount = 0;
        $scope.newCount = 0;
        $scope.inProcessCount = 0;
        $scope.cancelledCount = 0;
        $scope.shippedCount = 0;

        var allCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/purchasereturn/filtercount?state=all&uipagename="+$scope.pagename;
        var newCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/purchasereturn/filtercount?state=new&uipagename="+$scope.pagename;
        var inProcessCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/purchasereturn/filtercount?state=inprocess&uipagename="+$scope.pagename;
        var shippedCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/purchasereturn/filtercount?state=shipped&uipagename="+$scope.pagename;
        var cancelledCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/purchasereturn/filtercount?state=cancelled&uipagename="+$scope.pagename;

        if( $scope.filterObj.tableWarehouseDetails!=null)
        {
            allCountUrl += "&warehouseid=" + $scope.filterObj.tableWarehouseDetails.idtableWarehouseDetailsId;
            newCountUrl += "&warehouseid=" + $scope.filterObj.tableWarehouseDetails.idtableWarehouseDetailsId;
            inProcessCountUrl += "&warehouseid=" + $scope.filterObj.tableWarehouseDetails.idtableWarehouseDetailsId;
            shippedCountUrl += "&warehouseid=" + $scope.filterObj.tableWarehouseDetails.idtableWarehouseDetailsId;
            cancelledCountUrl += "&warehouseid=" + $scope.filterObj.tableWarehouseDetails.idtableWarehouseDetailsId;
        }
        if ($scope.filterObj.tableSku != null)
        {
            allCountUrl += "&skuid=" + $scope.filterObj.tableSku.idtableSkuId;
            newCountUrl += "&skuid=" + $scope.filterObj.tableSku.idtableSkuId;
            inProcessCountUrl += "&skuid=" + $scope.filterObj.tableSku.idtableSkuId;
            shippedCountUrl += "&skuid=" + $scope.filterObj.tableSku.idtableSkuId;
            cancelledCountUrl += "&skuid=" + $scope.filterObj.tableSku.idtableSkuId;
        }
        if ($scope.filterObj.tableVendor != null)
        {
            allCountUrl += "&vendorid=" + $scope.filterObj.tableVendor.idtableVendorId;
            newCountUrl += "&vendorid=" + $scope.filterObj.tableVendor.idtableVendorId;
            inProcessCountUrl += "&vendorid=" + $scope.filterObj.tableVendor.idtableVendorId;
            shippedCountUrl += "&vendorid=" + $scope.filterObj.tableVendor.idtableVendorId;
            cancelledCountUrl += "&vendorid=" + $scope.filterObj.tableVendor.idtableVendorId;

        }
        if ($scope.filterObj.tablePurchaseReturnRefNo)
        {
            allCountUrl += "&prid=" + $scope.filterObj.tablePurchaseReturnRefNo;
            newCountUrl += "&prid=" + $scope.filterObj.tablePurchaseReturnRefNo;
            inProcessCountUrl += "&prid=" + $scope.filterObj.tablePurchaseReturnRefNo;
            shippedCountUrl += "&prid=" + $scope.filterObj.tablePurchaseReturnRefNo;
            cancelledCountUrl += "&prid=" + $scope.filterObj.tablePurchaseReturnRefNo;

        }
        if ($scope.filterObj.tablePurchaseReturnSystemOrderNo)
        {
            allCountUrl += "&systemorderno=" + $scope.filterObj.tablePurchaseReturnSystemOrderNo;
            newCountUrl += "&systemorderno=" + $scope.filterObj.tablePurchaseReturnSystemOrderNo;
            inProcessCountUrl += "&systemorderno=" + $scope.filterObj.tablePurchaseReturnSystemOrderNo;
            shippedCountUrl += "&systemorderno=" + $scope.filterObj.tablePurchaseReturnSystemOrderNo;
            cancelledCountUrl += "&systemorderno=" + $scope.filterObj.tablePurchaseReturnSystemOrderNo;

        }
        if ($scope.filterObj.startDate)
        {
            allCountUrl += "&startDate=" + $scope.filterObj.startDate;
            newCountUrl += "&startDate=" + $scope.filterObj.startDate;
            inProcessCountUrl += "&startDate=" + $scope.filterObj.startDate;
            shippedCountUrl += "&startDate=" + $scope.filterObj.startDate;
            cancelledCountUrl += "&startDate=" + $scope.filterObj.startDate;

        }
        if ($scope.filterObj.endDate)
        {
            allCountUrl += "&endDate=" + $scope.filterObj.endDate;
            newCountUrl += "&endDate=" + $scope.filterObj.endDate;
            inProcessCountUrl += "&endDate=" + $scope.filterObj.endDate;
            shippedCountUrl += "&endDate=" + $scope.filterObj.endDate;
            cancelledCountUrl += "&endDate=" + $scope.filterObj.endDate;

        }

        var promises = [
            $http.get(allCountUrl),
            $http.get(newCountUrl),
            $http.get(inProcessCountUrl),
            $http.get(shippedCountUrl),
            $http.get(cancelledCountUrl)
        ]

        $q.all(promises)
            .then(function (response) {

                function setPage(page){
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = pagerService.GetPager(vm.dummyItems.length, page,$scope.orderSize);
                    $scope.vmPager = vm.pager;
                    //
                    $scope.start = (vm.pager.currentPage - 1) * $scope.orderSize;
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    if (action == 'clearAction') {
                        $scope.ListOfPurchaseReturnOrders(tabsValue, $scope.start, 'clearAction');
                    } else {
                        $scope.ListOfPurchaseReturnOrders(tabsValue, $scope.start);
                    }
                }

                $scope.allCount = response[0].data;
                $scope.newCount = response[1].data;
                $scope.inProcessCount = response[2].data;
                $scope.shippedCount = response[3].data;
                $scope.cancelledCount = response[4].data;

                var vm = this;
                vm.pager = {};

                if (tabsValue == 'all') {
                    vm.dummyItems = _.range(0, $scope.allCount);
                }
                else if(tabsValue == 'new'){
                    vm.dummyItems = _.range(0, $scope.newCount);
                }
                else if(tabsValue == 'inprocess'){
                    vm.dummyItems = _.range(0, $scope.inProcessCount);
                }
                else if(tabsValue == 'shipped'){
                    vm.dummyItems = _.range(0, $scope.shippedCount);
                }
                else if(tabsValue == 'cancelled'){
                    vm.dummyItems = _.range(0, $scope.cancelledCount);
                }
                if (page == undefined) {
                    setPage(1);
                }
                if (page != undefined) {
                    setPage(page);
                }
            })
            .catch(function (response) {

            });

    };

    $scope.hideeditbutton = function(orderdata){
        for(var j=0; j< orderdata.tablePurchaseReturnSkus.length ; j += 1){
            var ordersku = orderdata.tablePurchaseReturnSkus[j];
            if(ordersku.tablePurchaseReturnSkuStateType.idtablePurchaseReturnSkuStateTypeId == 1 || ordersku.tablePurchaseReturnSkuStateType.idtablePurchaseReturnSkuStateTypeId == 2){
                return false;
            }
        }
        return true;
    }

    $scope.editOrder = function(orderData,mode)
    {
        $scope.genericData.singlePurchaseOrderReturnMode = mode;
        $scope.singleorderReturnData = angular.copy(orderData);
        $scope.singleorderReturnData.tablePurchaseReturnSystemOrderNo = orderData.tablePurchaseReturnSystemOrderNo;

        if($scope.singleorderReturnData.tablePurchaseReturnPickupDate != null && $scope.singleorderReturnData.tablePurchaseReturnPickupDate != undefined)
        {
            $scope.singleorderReturnData.tablePurchaseReturnPickupDate = new Date($scope.singleorderReturnData.tablePurchaseReturnPickupDate);
        }
        if($scope.singleorderReturnData.tablePurchaseReturnDropDate != null && $scope.singleorderReturnData.tablePurchaseReturnDropDate != undefined)
        {
            $scope.singleorderReturnData.tablePurchaseReturnDropDate = new Date($scope.singleorderReturnData.tablePurchaseReturnDropDate);
        }

        $scope.getVendorAddress($scope.singleorderReturnData.tableVendor);

        if (orderData.tablePurchaseOrder == null)
        {
            $scope.genericData.poRefKnown = false;
            $('#addPurchaseOrderReturnModalRefUnknown').modal('show');
        }
        else
        {
            $scope.populateReturnOrderFromPurchaseOrder(orderData.tablePurchaseOrder);
            $scope.genericData.poRefKnown = true;
            $('#addPurchaseOrderReturnModal').modal('show');
        }
    }

    $scope.getTotal = function(tableSkuData)
    {
        var total = 0;
        var totalCost = 0;
        var totalCostAmount = 0;
        var totalCostAll = [];
        if(tableSkuData.tablePurchaseReturnSkuInventoryMaps != null && tableSkuData.tablePurchaseReturnSkuInventoryMaps != undefined)
        {
            for (var j = 0; j < tableSkuData.tablePurchaseReturnSkuInventoryMaps.length; j++)
            {
                var product = tableSkuData.tablePurchaseReturnSkuInventoryMaps[j].tableSkuInventory.tableSkuInventoryRateTotal;
                total += product;
            }
            totalCostAmount += total * tableSkuData.tablePurchaseReturnSkuQuantity;
            totalCostAll.push(totalCostAmount);
            total = 0;
        }
        return totalCostAmount;
    };

    //============================ get total cost per Product ================== //

    $scope.totalCostPerProduct = function(tableSkuData)
    {
        var total = 0;
        var totalCost = 0;
        var totalCostAmount = 0;
        var totalCostAll = [];
        if(tableSkuData.tablePurchaseReturnSkuInventoryMaps != null && tableSkuData.tablePurchaseReturnSkuInventoryMaps != undefined)
        {
            for (var j = 0; j < tableSkuData.tablePurchaseReturnSkuInventoryMaps.length; j++)
            {
                var product = tableSkuData.tablePurchaseReturnSkuInventoryMaps[j].tableSkuInventory.tableSkuInventoryRateTotal;
                total += product;
            }
            totalCostAmount += total * tableSkuData.tablePurchaseReturnSkuQuantity;
            totalCostAll.push(totalCostAmount);
            total = 0;
        }
        return totalCostAmount/tableSkuData.tablePurchaseReturnSkuQuantity;
    }


    $scope.cancelInfoBox = function() {
        $('#infoDialogPurchaseReturn').modal('hide');
    }


    $scope.openInfoBox = function(ev, stateTrials) {
        $scope.steps = [];
        console.log(stateTrials);
        for (var i = 0; i < stateTrials.length; i++) {
            var a = stateTrials.length - 1;
            console.log(a);
            var fulldate = $filter('utcToLocalOrHyphen')(stateTrials[i].tablePurchaseReturnSkuStateTrailDateTime);
            if (i < a) {
                $scope.steps.push({
                    title: stateTrials[i].tablePurchaseReturnSkuStateType.tablePurchaseReturnSkuStateTypeString,
                    active: true,
                    orderState: "Successful",
                    remarks: stateTrials[i].tablePurchaseReturnSkuStateTrailRemarks,
                    fulldate: fulldate
                });
            }
            if (i == a) {
                $scope.steps.push({
                    title: stateTrials[i].tablePurchaseReturnSkuStateType.tablePurchaseReturnSkuStateTypeString,
                    orderState: "In Process",
                    remarks: stateTrials[i].tablePurchaseReturnSkuStateTrailRemarks,
                    fulldate: fulldate
                });
            }
        }
        console.log($scope.steps);
        $('#infoDialogPurchaseReturn').modal('show');
    }

    $scope.copyOrder = function(orderData)
    {
        $scope.genericData.singlePurchaseOrderReturnMode = 'copy';
        $scope.singleorderReturnData = {};

        $scope.singleorderReturnDataCopy = angular.copy(orderData);
        $scope.singleorderReturnData = angular.copy($scope.singleorderReturnDataCopy);
        $scope.singleorderReturnData.tablePurchaseReturnSkus = [];
        $scope.singleorderReturnData.tablePurchaseReturnRemarkses = [];
        $scope.singleorderReturnData.tablePurchaseReturnRefNo = null;
        $scope.singleorderReturnData.tablePurchaseReturnSystemOrderNo = null;

        for(var skuCounter = 0 ; skuCounter < $scope.singleorderReturnDataCopy.tablePurchaseReturnSkus.length ; skuCounter++)
        {
            $scope.singleorderReturnData.tablePurchaseReturnSkus.push(
                {
                    "tableSku" : $scope.singleorderReturnDataCopy.tablePurchaseReturnSkus[skuCounter].tableSku,
                    "tablePurchaseReturnSkuQuantity" : $scope.singleorderReturnDataCopy.tablePurchaseReturnSkus[skuCounter].tablePurchaseReturnSkuQuantity
                }
            )
        }

        $scope.singleorderReturnData.tablePurchaseReturnPickupDate = null;
        $scope.singleorderReturnData.tablePurchaseReturnDropDate = null;

        $scope.initDateLimits();

        $scope.getVendorAddress($scope.singleorderReturnData.tableVendor);

        if (orderData.tablePurchaseOrder == null)
        {
            $scope.genericData.poRefKnown = false;
            $('#addPurchaseOrderReturnModalRefUnknown').modal('show');
        }
        else
        {
            $scope.genericData.poRefKnown = true;
            $('#addPurchaseOrderReturnModal').modal('show');
        }
    }

    if ($window.localStorage.getItem("purchaseReturnFilter") !== null) {
        var purchaseReturnField = JSON.parse($window.localStorage.getItem("purchaseReturnFilter"));
        $scope.filterObj.tablePurchaseReturnSystemOrderNo = purchaseReturnField.orderid;
        $scope.filterObj.tableWarehouseDetails = purchaseReturnField.warehouse;
        $scope.filterObj.start1Date = purchaseReturnField.startDate;
        $scope.filterObj.end1Date = purchaseReturnField.endDate;
        $scope.filterObj.tableSku = purchaseReturnField.sku;
        $scope.filterObj.tableVendor = purchaseReturnField.vendor;
        $scope.submitAction();

    }

    //clear filter for clearing applied filters
    $scope.clearAction = function() {
        $scope.sortType = "tablePurchaseReturnSystemOrderNo";
        $scope.directionType = "desc";
        $scope.sortReverse = false;

        $scope.filterObj = {};
        $scope.filterObj.tableWarehouseDetails = null;
        $scope.filterObj.tablePurchaseReturnRefNo = null;
        $scope.filterObj.tablePurchaseReturnSystemOrderNo = null;
        $scope.filterObj.tableSku = null;
        $scope.filterObj.tableVendor = null;
        $scope.filterObj.start1Date = null;
        $scope.filterObj.end1Date = null;

        $scope.$broadcast('angucomplete-alt:clearInput', 'productsfilter');
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        $scope.$broadcast('angucomplete-alt:clearInput', 'vendorsMain');
        $scope.listOfPurchaseReturnStatesCount($scope.defaultTab, 1, 'clearAction');
        $window.localStorage.removeItem('purchaseReturnFilter');
        $window.localStorage.removeItem('outboundTab');
    }
    $scope.newTab = function(){
        if(Object.keys($scope.filterObj).length){
            var purchaseReturnField = {
                warehouse : $scope.filterObj.tableWarehouseDetails,
                sku : $scope.filterObj.tableSku,
                vendor : $scope.filterObj.tableVendor,
                orderid:$scope.filterObj.tablePurchaseReturnSystemOrderNo,
                startDate:$scope.filterObj.start1Date,
                endDate:$scope.filterObj.end1Date
            }
            $window.localStorage.setItem('purchaseReturnFilter',JSON.stringify(purchaseReturnField))
        }
        $window.open($location.absUrl(), "_blank");
    }

    $scope.setFormButtonValue = function (value) {
        $scope.submitActionButton = value;
    }
    $scope.submitAddPurchaseReturnOrderForm = function (form) {
        if($scope.genericData.singlePurchaseOrderReturnMode != 'edit' && $scope.submitActionButton == 'save'){
            $scope.saveSingleOrderReturn(form);
        }
        else if($scope.genericData.singlePurchaseOrderReturnMode == 'edit'  && $scope.submitActionButton == 'update'){
            $scope.updateSingleOrderReturn(form);
        }
    }
    $scope.saveSingleOrderReturn = function(form){
        $scope.singleorderReturnDataCopy = angular.copy($scope.singleorderReturnData);
        if ($scope.singleorderReturnData.tablePurchaseReturnPickupDate != null && $scope.singleorderReturnData.tablePurchaseReturnPickupDate != "" && $scope.singleorderReturnData.tablePurchaseReturnPickupDate != undefined){
            $scope.singleorderReturnDataCopy.tablePurchaseReturnPickupDate = moment.utc($scope.singleorderReturnData.tablePurchaseReturnPickupDate).format();
        }
        if ($scope.singleorderReturnData.tablePurchaseReturnDropDate != null && $scope.singleorderReturnData.tablePurchaseReturnDropDate != "" && $scope.singleorderReturnData.tablePurchaseReturnDropDate != undefined){
            $scope.singleorderReturnDataCopy.tablePurchaseReturnDropDate = moment.utc($scope.singleorderReturnData.tablePurchaseReturnDropDate).format();
        }
        $http({
            method: 'POST',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchasereturn',
            data: $scope.singleorderReturnDataCopy,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res){
            console.log(res);
            if (res){
                if ($scope.genericData.singlePurchaseOrderReturnMode == "add") {
                    $scope.notify("Order added successfully",'success');
                }
                else if ($scope.genericData.singlePurchaseOrderReturnMode == "copy") {
                    $scope.notify("Order copied successfully",'success');
                }
                $scope.cancelSinglePurchaseOrderReturn(form);
                $scope.listOfPurchaseReturnStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
            }
        }).error(function(error, status) {
            if(status == 400){
                $scope.notify(error.errorMessage ? error.errorMessage : "Failed to add purchase return");
            }
            else{
                $scope.notify("Failed to add purchase return.");
            }
        });

    };

    //check Order Number
    $scope.checkOrderNumber = function(orderNo,systemOrderNo)
    {
        var q = $q.defer();
        if(orderNo == undefined || orderNo == "" || orderNo == null){
            q.resolve(false);
        }
        else
	{
        var checkOrderNo = MavenAppConfig.baseUrlSource + "/omsservices/webapi/purchasereturn/clientordernumber?clientordernumber=" + orderNo;
        if(systemOrderNo != null )
        {
            checkOrderNo +="&systemordernumber=" + systemOrderNo;
        }
        $http.get(checkOrderNo).success(function(data)
        {
            if (data == true)
            {
                $scope.notify("Order ref. no. already exists");
                q.resolve(true);
            }
            if (data == false)
            {
                q.resolve(false);
            }
        });
        }
        return q.promise;
    }

    $scope.tableSorting = function(sortType, sortReverse, defaultTab) {
        console.log(sortType);
        console.log(sortReverse);
        $scope.sortType = sortType;
        console.log($scope.directionType);
        if (sortReverse == true) {
            $scope.directionType = 'desc';
        }
        if (sortReverse == false) {
            $scope.directionType = 'asc';
        }
        console.log($scope.directionType);
        $scope.sortReverse = !sortReverse;

        var page = undefined;
        $scope.listOfPurchaseReturnStatesCount(defaultTab, page);
    }

    $scope.listOfPurchaseReturnStatesCount($scope.defaultTab,1);

    //============================================= list of purchase return order ======================================= //
    //  ===== have to use this for listing data ========= //
    $scope.ListOfPurchaseReturnOrders = function(tabsValue, start, action)
    {
        if (tabsValue == 'draft')
        {
            $scope.DeleteAndConfimData = true;
            $scope.reEdit = false;
        }
        else
        {
            $scope.DeleteAndConfimData = false;
            $scope.reEdit = true;
        }

        $scope.defaultTab = tabsValue;

        var PurchaseOrderReturnListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/purchasereturn";

        if ($scope.defaultTab == 'all')
            PurchaseOrderReturnListUrl += "?start=" + start + "&size=5&sort=" + $scope.sortType + "&direction=" + $scope.directionType;

        if ($scope.defaultTab != 'all')
            PurchaseOrderReturnListUrl += "?start=" + start + "&size=5&sort=" + $scope.sortType + "&direction=" + $scope.directionType + "&state=" + tabsValue;

        PurchaseOrderReturnListUrl += "&uipagename="+$scope.pagename;

        if ($scope.filterObj.tableWarehouseDetails != null) {
            PurchaseOrderReturnListUrl += "&warehouseid=" + $scope.filterObj.tableWarehouseDetails.idtableWarehouseDetailsId;
        }
        if ($scope.filterObj.tableSku != null)
        {
            PurchaseOrderReturnListUrl += "&skuid=" + $scope.filterObj.tableSku.idtableSkuId;
        }
        if ($scope.filterObj.tableVendor != null) {
            PurchaseOrderReturnListUrl += "&vendorid=" + $scope.filterObj.tableVendor.idtableVendorId;
        }
        if ($scope.filterObj.tablePurchaseReturnRefNo) {
            PurchaseOrderReturnListUrl += "&prid=" + $scope.filterObj.tablePurchaseReturnRefNo;
        }

        if ($scope.filterObj.startDate) {
            PurchaseOrderReturnListUrl += "&startDate=" + $scope.filterObj.startDate;
        }
        if ($scope.filterObj.endDate) {
            PurchaseOrderReturnListUrl += "&endDate=" + $scope.filterObj.endDate;
        }
        if ($scope.filterObj.tablePurchaseReturnSystemOrderNo) {
            PurchaseOrderReturnListUrl += "&systemorderno=" + $scope.filterObj.tablePurchaseReturnSystemOrderNo;
        }
        $http.get(PurchaseOrderReturnListUrl).success(function(data)
        {
            $scope.PurchaseOrderReturnDataLists = data;
            $scope.tableRowExpanded = false;
            $scope.tableRowIndexExpandedCurr = "";
            $scope.tableRowIndexExpandedPrev = "";
            $scope.storeIdExpanded = "";
            $scope.end = $scope.start + data.length;
            $scope.dayDataCollapse = [];

            for (var i = 0; i < $scope.PurchaseOrderReturnDataLists.length; i += 1) {
                $scope.dayDataCollapse.push(false);
            }
            $scope.showLoader = false;
        }).error(function(error, status)
        {
            $scope.showLoader = false;

        });
    }

    var skuStart=0,size=10;
    $scope.skuLoadBusy = false;
    $scope.stopSkuLoad = false;
    $scope.skuPagingFunction = function () {
        $scope.skuLoadBusy = true;
        if($scope.stopSkuLoad){
            return;
        }
        if($scope.skuPaginateCheck == false){
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
        else{
            mastersService.fetchVendorSkusNext(MavenAppConfig.baseUrlSource, $scope.selectedVendorId,skuStart,size,function (data) {
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


    }

	$scope.showCommonMasterSkuDialog = function (check)
    {
        var selectedVendor = null;
        if(check == true)
        {
            if ($scope.singleorderReturnData.tableVendor == null)
            {
                $scope.notify("Please select vendor first.");
                return;
            }
            else
            {
                selectedVendor = $scope.singleorderReturnData.tableVendor;
            }
        }

        if(check == false)
        {
            if($scope.filterObj.tableVendor == null)
            {

            }
            else
            {
                selectedVendor = $scope.filterObj.tableVendor;
            }
        }

        if(selectedVendor!=null) {
            $scope.skuPaginateCheck = true;
            $scope.selectedVendorId = selectedVendor.idtableVendorId;
            mastersService.fetchVendorSkus(MavenAppConfig.baseUrlSource, selectedVendor.idtableVendorId,function (data) {
                $scope.genericData.skusListFiltered = data;

                $timeout(function () {
                    $("#dialogmastersku").modal('show');
                    $scope.skuLoadBusy = false;
                    $scope.stopSkuLoad = false;
                }, 500);

            });
        }
        else
        {
            $scope.skuPaginateCheck = false;
            mastersService.fetchSkus(MavenAppConfig.baseUrlSource,function (data)
            {
                $scope.genericData.skusListFiltered = data;

                $timeout(function ()
                {
                    $("#dialogmastersku").modal('show');
                    $scope.skuLoadBusy = false;
                    $scope.stopSkuLoad = false;
                }, 500);

            });
        }

        $scope.genericData.check = check;


    }

    $scope.selectSku = function(id){
        $scope.stopSkuLoad = true;
        $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/'+id).success(function(data) {
            console.log(data);

            if($scope.genericData.check == false){
                $scope.$broadcast("angucomplete-alt:changeInput", "productsfilter", data);
            }else{
                $scope.$broadcast("angucomplete-alt:changeInput", "products", data);
            }

        }).error(function(error, status) {
            console.log(error);

        });

        $scope.cancelmastersDialog();
    }
	
	$scope.masterVendorDialog = function(ev){		
		
		mastersService.fetchVendors(MavenAppConfig.baseUrlSource,function(data){
			$scope.genericData.vendorsListFiltered = data;
		})

        $timeout(function () {
            $("#dialogmastervendor").modal('show');
        }, 500);
		
	}
	
	$scope.cancelmastersDialog = function(){
        skuStart=0;
        size=10;
        $scope.genericData.skusListFiltered = [];
        $scope.skuLoadBusy = true;
        $scope.stopSkuLoad = true;
        $("#dialogmastersku").modal('hide');
        $("#dialogmastervendor").modal('hide');
	}
	

	
	$scope.selectVendor = function(id){
		
		 $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/vendors/'+id).success(function(data) {
         console.log(data);
		 $scope.filterObj.tableVendor = data;
		 $scope.$broadcast("angucomplete-alt:changeInput", "vendorsMain", data);
        }).error(function(error, status) {
            console.log(error);

        });

        $scope.cancelmastersDialog();
    }

    $scope.orderLevelActionRow = function (orderSkus) {

        var shippingLabelButn = $scope.getShippingLabelButton(orderSkus);
        if (shippingLabelButn == true) {
            return true;
        } else {
            return false;
        }

    };

    $scope.getShippingLabelButton = function (orderSkus) {
        var b = false;
        angular.forEach(orderSkus, function (resp) {
            if (b == false && (resp.tablePurchaseReturnSkuStateType.idtablePurchaseReturnSkuStateTypeId == 1)) {
                b = true;
            }
        });
        return b;
    };

    $scope.updateSingleOrderReturn = function(form){
        $scope.singleorderReturnDataCopy = angular.copy($scope.singleorderReturnData);
        if ($scope.singleorderReturnData.tablePurchaseReturnPickupDate != null && $scope.singleorderReturnData.tablePurchaseReturnPickupDate != "" && $scope.singleorderReturnData.tablePurchaseReturnPickupDate != undefined) {
            $scope.singleorderReturnDataCopy.tablePurchaseReturnPickupDate = moment.utc($scope.singleorderReturnData.tablePurchaseReturnPickupDate).format();
        }
        if ($scope.singleorderReturnData.tablePurchaseReturnDropDate != null && $scope.singleorderReturnData.tablePurchaseReturnDropDate != "" && $scope.singleorderReturnData.tablePurchaseReturnDropDate != undefined) {
            $scope.singleorderReturnDataCopy.tablePurchaseReturnDropDate = moment.utc($scope.singleorderReturnData.tablePurchaseReturnDropDate).format();
        }
        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchasereturn/' + $scope.singleorderReturnData.idtablePurchaseReturnId,
            data: $scope.singleorderReturnDataCopy,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (res) {
            console.log(res);
            if (res) {
                if ($scope.genericData.singlePurchaseOrderReturnMode == "edit") {
                    $scope.notify("Order updated successfully",'success');
                }
                else if ($scope.genericData.singlePurchaseOrderReturnMode == "copy") {
                    $scope.notify("Order copied successfully",'success');
                }
                $scope.cancelSinglePurchaseOrderReturn(form);
                $scope.listOfPurchaseReturnStatesCount($scope.defaultTab, $scope.vmPager.currentPage);

            }
        }).error(function (error, status) {
            if (status == 400) {
                $scope.notify(error.errorMessage);
            }
            else {
                $scope.notify("Failed to add purchase return.");
            }
        });

    };

    $scope.downloadPurchaseReturnTemplateWithID = function () {

        if ($scope.genericData.poRefKnown == true) {

            var tempDownloadPurchaseReturnTemplateUrl = $scope.bulkPurchaseReturnWithIdUrl;

            $http({
                method: 'GET',
                url: tempDownloadPurchaseReturnTemplateUrl,
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }).success(function (data) {
                console.log(data);
                var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                var downloadUrl = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = downloadUrl;
                a.download = "Glaucus_Purchase_Return_Bulk_Upload_Template.xls";
                document.body.appendChild(a);
                a.click();
            }).error(function(error,status)
            {
                if (error.errorCode == 400) {
                    $scope.notify(error.errorMessage);
                }
                else {
                    $scope.notify("There is some error in downloading template. Please try after some time.");
                }
            })
        }
        if ($scope.genericData.poRefKnown == false) {

            var tempDownloadSaleReturnTemplateUrl = $scope.bulkPurchaseReturnWithoutIdUrl;

            $http({
                method: 'GET',
                url: tempDownloadSaleReturnTemplateUrl,
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }).success(function (data) {
                console.log(data);
                var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                var downloadUrl = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = downloadUrl;
                a.download = "Glaucus_Purchase_Return_Bulk_Upload_Template.xls";
                document.body.appendChild(a);
                a.click();
            }).error(function(error,status)
            {
                if (error.errorCode == 400)
                {
                    $scope.notify(error.errorMessage);
                }
                else {
                    $scope.notify("There is some error in downloading template. Please try after some time.");
                }
            })
        }
    };
    $scope.cancelBulkUpload = function(form){
        $scope.fileName = null;
        $scope.progressOfUpload = null;
        $scope.genericData = {};
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#addPurchaseOrderReturnModalRefUnknown').modal('hide');
        $('#addPurchaseOrderReturnModal').modal('hide');

    }
    $scope.uploadBulkPurchaseReturnFile = function(bulkOrderUploadfile, bulkOrderSettingData) {
        console.log(bulkOrderUploadfile);
        var file = bulkOrderUploadfile;
        if(file){
            $scope.fileName = file.name;
        }
    };

    $scope.disableBulkUpload = false;
    $scope.uploadPurchaseReturnBulkUpload = function (form) {
        var uploadUrl;
        if($scope.genericData.poRefKnown == true)
        {
            uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchasereturn/uploadpurchasereturnwithsaleorder';

        }
        else{
            uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchasereturn/uploadpurchasereturnwithoutpurchaseorder';
        }
        console.log($scope.genericData.bulkOrderUploadfile);
        file = $scope.genericData.bulkOrderUploadfile;
        $scope.disableBulkUpload = true;
        if (file) {
            if (!file.$error)
            {

                var fd = new FormData();
                fd.append('uploadFile', file);
                var upload = Upload.http({
                    url: uploadUrl,
                    method: 'POST',
                    data: fd,
                    headers: {
                        'Content-Type': undefined
                    }
                });
                upload.then(function(resp) {
                    // file is uploaded successfully
                    console.log(resp);
                    console.log('file ' + file.name + 'is uploaded successfully. Response: ' + resp.data);
                    if($scope.genericData.poRefKnown == true) {
                        $cookies.put('BulkUploadData', 'purchasereturnwithid');
                    }
                    else{
                        $cookies.put('BulkUploadData', 'purchasereturnwitoutid');
                    }

                   $scope.notify("File has been uploaded successfully.It may take a few minutes to reflect the changes.<br><a href='#/bulkuploads/' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View bulk upload reports.</a>",'success','','',0);
                    $scope.listOfPurchaseReturnStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                    $scope.genericData = {};
                    $scope.cancelBulkUpload(form);
                    //$('#addOrderModal').modal('hide');
                    $scope.disableBulkUpload = false;
                }, function(resp) {
                    $scope.genericData = {};
                    $scope.cancelBulkUpload(form);
                    console.log(resp);
                    $scope.notify(resp.data.errorMessage);
                    $scope.disableBulkUpload = false;
                }, function(evt) {
                    // progress notify
                    $scope.progressOfUpload = parseInt(100.0 * evt.loaded / evt.total) + '%';
                    console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :' + file.name);
                });
            }
        }
        else{
            $scope.notify('Please upload the file');
        }
    }

    $scope.shipAll = function(){
        if($scope.shipping.shipallchecked){
            angular.forEach($scope.quickShipDataTable, function (response)
            {
                response.tableSkusSkuQuantity = response.tablePurchaseReturnSkuQuantity;
            })
        }
        else{
            angular.forEach($scope.quickShipDataTable, function (response)
            {
                response.tableSkusSkuQuantity = undefined;
            })
        }
    }

    $scope.editContainerPackage = function (index) {
        console.log(index);
        $scope.disableQuickShipBox[index] = true;
        $scope.editQuickShipBoxHideAndShow[index] = true;
    };

    $scope.disableContainerPackage = function (index) {
        console.log(index);
        $scope.disableQuickShipBox[index] = false;
        $scope.editQuickShipBoxHideAndShow[index] = false;
    };
    $scope.$on('$destroy', function () {
        $window.localStorage.removeItem('purchaseReturnFilter');
        $window.localStorage.removeItem('outboundTab');
        $("#dialogmastersku").remove();
        $('.modal-backdrop').remove();
    });

    $scope.closeBulkUploadDialogWithId = function(){

        $('#addPodialog').modal('hide');
        $cookies.put('BulkUploadData','purchasereturnwithid');
        $cookies.put('ActiveTab','purchasereturnwithid');
        $timeout(function() {
            $location.path('/bulkuploads');
            console.log('update with timeout fired')
        }, 1000);
    }

    $scope.closeBulkUploadDialogWithoutId = function(){

        $('#addPodialog').modal('hide');
        $cookies.put('BulkUploadData','purchasereturnwithid');
        $cookies.put('ActiveTab','purchasereturnwithid');
        $timeout(function() {
            $location.path('/bulkuploads');
            console.log('update with timeout fired')
        }, 1000);
    }
}]);
