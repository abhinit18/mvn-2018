angular.module('OMSApp.returnableGoods', [ ]).config(function config($stateProvider) {
    $stateProvider.state('/returnableGoodsOrder/', {
        name: '/returnableGoodsOrder/',
        url: '/returnableGoodsOrder/',
        views: {
            "main": {
                controller: 'returnableGoodsOrderController',
                templateUrl: 'returnableGoodsOrder/returnableGoodsOrder.view.html'
            },
            "header": {
                controller: 'headerCtrl',
                templateUrl: '../shared/templates/header.html'
            }
        },
        data: {pageTitle: 'returnable Goods Order'}
    })

}).controller('returnableGoodsOrderController',['$scope', '$http', '$location', '$filter', 'MavenAppConfig', '$mdDialog','$sce', '$window', 'Upload', 'pagerService', '$q', '$cookies','$timeout', 'mastersService', '$rootScope',

function returnableGoodsOrderController($scope, $http, $location, $filter, MavenAppConfig, $mdDialog,$sce, $window, Upload, pagerService, $q, $cookies,$timeout, mastersService, $rootScope)
{
    //================================= global variables ========================== //
    $scope.baseSkuUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/search?search=';
    $scope.baseVendorUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/vendors/search?search=';
    $scope.genericData = {};
    $scope.genericData.singleReturnableGoodsOrderMode = "add";
    $scope.genericData.selectedOrderForEditRemarks = {};

    $scope.quickGRNSkuDetails = {};
    $scope.ReturnableGoodsOrderGrnInventory = {};
    $scope.singleorderReturnData = {};
    $scope.sortType = "tableReturnableGoodsOrderSystemOrderNo";
    $scope.directionType = "desc";

    $scope.filterObj = {};
    $scope.filterObj.tableWarehouseDetails = {};
    $scope.filterObj.tableReturnableGoodsOrderRefNo = null;
    $scope.filterObj.tableReturnableGoodsOrderSystemOrderNo = null;
    $scope.filterObj.tableSku = {};
    $scope.filterObj.tableVendor = {};
    $scope.filterObj.start1Date = null;
    $scope.filterObj.end1Date = null;

    $scope.bulkReturnableGoodsOrderTab = false;
    $scope.ReturnableGoodsOrderTab = true;
    $scope.defaultTab = 'all';
    $scope.recordsPerPage = [5,10,15];
    $scope.orderSize = $scope.recordsPerPage[0];
    $scope.start = 0;
    $scope.ReturnableGoodsOrderData = {};

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

    var currentUrl,UrlName;
    currentUrl = $scope.currentUrl;
    if($scope.currentUrl === "")
    {
        currentUrl = window.location.href;
    }
    UrlName = currentUrl.split('/');
    console.log(UrlName);
    if(UrlName.indexOf('returnableGoodsOrder') == -1){
        $scope.defaultTab = "new";
    }else{
        $scope.defaultTab = "all";
    }


    if($cookies.get('orderid') != null){
        $scope.filterObj.tableReturnableGoodsOrderSystemOrderNo = $cookies.get('orderid');
        $cookies.remove('orderid')
    }

    $scope.genericData = {};

    $scope.initSingleOrderReturnData = function ()
    {
        $scope.minDateShipping = new Date();
        $scope.minDateDelivery = new Date();
        $scope.genericData = {};
        $scope.genericData.returnQuantity = "";
        $scope.genericData.poRefNo = "";
        $scope.singleorderReturnData = {};
        $scope.singleorderReturnData.tableReturnableGoodsOrderRefNo = "";
        $scope.singleorderReturnData.tableReturnableGoodsOrderSkus = [];
        $scope.singleorderReturnData.tableShippingOwnership = null;
        $scope.singleorderReturnData.tableVendor = null;
        $scope.singleorderReturnData.tableWarehouseDetails = null;
        $scope.singleorderReturnData.tableReturnableGoodsOrderQuantityType = "";
        $scope.singleorderReturnData.tableReturnableGoodsOrderRemarks = "";
        $scope.singleorderReturnData.tableReturnableGoodsOrderPickupDate = "";
        $scope.singleorderReturnData.tableReturnableGoodsOrderDropDate = "";
        $scope.singleorderReturnData.tableAddress = null;
    }

    //============================ datepicker action change =============================== //


    $scope.startmaxDate = new Date();
    $scope.endmaxDate = new Date();
    $scope.minDateShipping = new Date();
    $scope.minDateDelivery = new Date();

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

    $scope.onPickUpDateChange = function () {

        //Should be greater than equal to today's date and if delivery date is available then should be less than delivery date
        $scope.minDateShipping = new Date();

        if($scope.singleorderReturnData.tableReturnableGoodsOrderDropDate)
        {
            $scope.deliveryDateData = new Date($scope.singleorderReturnData.tableReturnableGoodsOrderDropDate);
            $scope.maxDateShipping = new Date(
                $scope.deliveryDateData.getFullYear(),
                $scope.deliveryDateData.getMonth(),
                $scope.deliveryDateData.getDate());
        }

        //Delivery date should be greater than equal to shipping date

        if($scope.singleorderReturnData.tableReturnableGoodsOrderPickupDate)
        {
            $scope.shippingDateData = new Date($scope.singleorderReturnData.tableReturnableGoodsOrderPickupDate);
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

        if($scope.singleorderReturnData.tableReturnableGoodsOrderPickupDate)
        {
            $scope.shippingDateData = new Date($scope.singleorderReturnData.tableReturnableGoodsOrderPickupDate);
            $scope.minDateDelivery = new Date(
                $scope.shippingDateData.getFullYear(),
                $scope.shippingDateData.getMonth(),
                $scope.shippingDateData.getDate());
        }

        if($scope.singleorderReturnData.tableReturnableGoodsOrderDropDate)
        {
            $scope.deliveryDateData = new Date($scope.singleorderReturnData.tableReturnableGoodsOrderDropDate);
            $scope.maxDateShipping = new Date(
                $scope.deliveryDateData.getFullYear(),
                $scope.deliveryDateData.getMonth(),
                $scope.deliveryDateData.getDate());
        }

    };

    $scope.tableRowExpanded = false;
    $scope.tableRowIndexExpandedCurr = "";
    $scope.tableRowIndexExpandedPrev = "";
    $scope.storeIdExpanded = "";

    $scope.dayDataCollapseFn = function() {
        $scope.dayDataCollapse = [];

        for (var i = 0; i < $scope.ReturnableGoodsOrderDataLists.length; i += 1) {
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
        if(order.tableReturnableGoodsOrderRemarkses == null || order.tableReturnableGoodsOrderRemarkses == undefined){
            $scope.modalRemarks = null;
        }
        else
        {
            if(order.tableReturnableGoodsOrderRemarkses.length > 0) {
                $scope.modalRemarks = order.tableReturnableGoodsOrderRemarkses;
            }
        }
        $('#editRemarkModal').modal('show');
    };
    
    $scope.updateRemarks = function (form)
    {
        var orderData = $scope.genericData.selectedOrderForEditRemarks;
        var newRemarks = $scope.genericData.newRemarks;
        var updateRemarksURL = MavenAppConfig.baseUrlSource + '/omsservices/webapi/returnablegoodsorder/' +  $scope.genericData.selectedOrderForEditRemarks.idtableReturnableGoodsOrderId +'/editremarks';
        $http({
            method: 'PUT',
            url: updateRemarksURL,
            data: newRemarks
        }).success(function(data)
        {
            var checkUpdatedRemarksDataUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/returnablegoodsorder/"+orderData.idtableReturnableGoodsOrderId;
            $http({
                method: 'GET',
                url: checkUpdatedRemarksDataUrl
            }).success(function(response){
                $scope.cancelEditRemarksModal(form);
                var dataIndex = $scope.ReturnableGoodsOrderDataLists.indexOf(orderData);
                $scope.ReturnableGoodsOrderDataLists[dataIndex] = response;
                $scope.notify("Remarks updated successfully",'success');
            }).error(function(err){
                $scope.cancelEditRemarksModal(form);
                console.log(err);
            });

        }).error(function(error, status)
        {
            $scope.cancelEditRemarksModal(form);
            if(status == 400)
            {
               $scope.notify(error.errorMessage);
            }
            else
            {
               $scope.notify("Failed to update remarks");
            }
        });

        
    }
    
    $scope.showCancelReturnableGoodsOrderItem = function (tableReturnableGoodsOrder, tableReturnableGoodsOrderSku)
    {
        $scope.genericData.cancelReturnableGoodsOrderRef = tableReturnableGoodsOrder;
        $scope.genericData.cancelReturnableGoodsOrderSkuRef = tableReturnableGoodsOrderSku;
        $('#cancelReturnableGoodsOrderItem').modal('show');
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
        $('#cancelReturnableGoodsOrderItem').modal('hide');
    }

    $scope.cancelReturnableGoodsOrderItem = function (form)
    {
        if(!$scope.genericData.selectedCancelReason){
           $scope.notify('Please select a reason from the list');
            return ;
        }
        var cancelReason = '';
        if($scope.genericData.selectedCancelReason.tableReturnableGoodsOrderCancelReasonString == 'Other')
        {
            //cancelReason = $scope.genericData.newCancelReason.tableReturnableGoodsOrderCancelReasonString;
            if($scope.genericData.newCancelReason){
                if($scope.genericData.newCancelReason.tableReturnableGoodsOrderCancelReasonString!=null) {
                    cancelReason = $scope.genericData.newCancelReason.tableReturnableGoodsOrderCancelReasonString;
                }
                else
                {
                   $scope.notify("Provide a cancel reason in text area");
                    return;
                }
            }
            else{
               $scope.notify("Provide a cancel reason in text area");
                return;
            }
        }
        else
        {
            cancelReason = $scope.genericData.selectedCancelReason.tableReturnableGoodsOrderCancelReasonString;
        }
        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/returnablegoodsorder/'  + $scope.genericData.cancelReturnableGoodsOrderRef.idtableReturnableGoodsOrderId + '/returnablegoodsordersku/' + $scope.genericData.cancelReturnableGoodsOrderSkuRef.idtableReturnableGoodsOrderSkuId + '/cancel?remarks=' + cancelReason,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(data)
        {
            $scope.notify('Returnable goods order cancelled','success');
            $scope.hideCancelOrderItemDialog(form);
            $scope.listOfReturnableGoodsOrderStatesCount($scope.defaultTab, 1);


        }).error(function(data)
        {
            $scope.hideCancelOrderItemDialog(form);
            $('#cancelReturnableGoodsOrderItem').modal('hide');
        });



        if($scope.genericData.addCancelReasonToList == true)
        {
            $http({
                method: 'POST',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/returnablegoodsordercancelreason',
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
        var cancelReasonsUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/returnablegoodsordercancelreason';
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





    $scope.getAvailableQuantitys = function ()
    {
        for(var orderSkuCounter = 0; orderSkuCounter < $scope.genericData.availableQuantitys.length ; orderSkuCounter++)
        {
            $scope.getAvailableQuantity($scope.genericData.availableQuantitys[orderSkuCounter].tableSku);
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

        if($scope.singleorderReturnData.tableReturnableGoodsOrderQuantityType == null || $scope.singleorderReturnData.tableReturnableGoodsOrderQuantityType == undefined)
        {
            //No sufficient information to fetch quantity
            return;
        }


        if($scope.singleorderReturnData.tableReturnableGoodsOrderQuantityType == "Good") {
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
                        $scope.genericData.availableQuantitys[orderSkuCounter].tableReturnableGoodsOrderSkuQuantity = res.totalInventory-res.totalBlockedInventory;
                    }
                }
            }).error(function (error, status)
            {

            });
        }
        if($scope.singleorderReturnData.tableReturnableGoodsOrderQuantityType == "Bad") {
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
                        $scope.genericData.availableQuantitys[orderSkuCounter].tableReturnableGoodsOrderSkuQuantity = res;
                    }
                }
            }).error(function (error, status) {

            });
        }
    };


    $scope.loadReturnReasons = function() {
        $scope.returnReasonArray = [];
        var returnReasonsUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/returnablegoodsorderreason';
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


    $scope.showReturnableGoodsOrderModal = function () {
        $scope.initSingleOrderReturnData();
        $scope.genericData.singleReturnableGoodsOrderMode = "add";
        $('#addReturnableGoodsOrderDialog').on('show.bs.modal' , function (e){
            $( "#ordertabs a:first"  ).tab('show');
        });
        $('#addReturnableGoodsOrderDialog').modal('show');

    }

//    ====================================== add quick ship details ======================================== //



    $scope.quickShipDataDialog = function (ev, data) {
        $scope.disableQuickShip = false;
        $('#returnableGoodsOrderQuickShipOperation').modal('show');
        $scope.quickShipDataTable = data.tableReturnableGoodsOrderSkus;

        $scope.quickShipDataTable.orderID = data.idtableReturnableGoodsOrderId;
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


        $('#returnableGoodsOrderQuickShipOperation').modal('hide');
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
        $scope.shippingDetails.tableReturnableGoodsOrderShippingDetailsMasterAwb = null;

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
            if (value.tableReturnableGoodsOrderShippingDetailsMasterAwb == '' || value.tableReturnableGoodsOrderShippingDetailsMasterAwb == undefined) {
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
        angular.forEach(value,function(source){
            if(source.tableSkusSkuQuantity)
            {
                quantity += source.tableSkusSkuQuantity;
                tableSkus.push(source);
                source.tableReturnableGoodsOrderShippingDetailsAwb = $scope.shipping.awbnumber;
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
        dimensions.tableReturnableGoodsOrderSkus = tableSkus;
        dimensions.SKUcarrierDetails = shippedDetails;
        dimensions.returnableGoodsOrderSkuId = value.orderID;

        $scope.boxDetails.push(angular.copy(dimensions));
        angular.forEach($scope.quickShipDataTable, function (res) {
            res.tableReturnableGoodsOrderShippingDetailsAwb = null;
            res.tableSkusSkuQuantity = null;
        });
        $scope.shipping = {};

        console.log($scope.boxDetails);
        angular.forEach($scope.boxDetails, function (source) {
            $scope.TotalInputQuantity = $scope.sum(source.tableReturnableGoodsOrderSkus, 'tableSkusSkuQuantity');

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

    var returnableGoodsOrderSkuId;
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
                returnableGoodsOrderSkuId = value.returnableGoodsOrderSkuId;
                if (value.SKUcarrierDetails.tableReturnableGoodsOrderShippingDetailsMasterAwb == null || value.SKUcarrierDetails.tableReturnableGoodsOrderShippingDetailsMasterAwb == undefined)
                {
                    SKUcarrierValue = null;
                }
                else
                {
                    SKUcarrierValue = value.SKUcarrierDetails.tableReturnableGoodsOrderShippingDetailsMasterAwb;
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
                    SkuDriverNumber = value.SKUcarrierDetails.DriverNumber
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

                angular.forEach(value.tableReturnableGoodsOrderSkus, function (response)
                {
                    console.log(response);
                    SKUDto = _.omit(response, 'tableSkusSkuQuantity', 'tableReturnableGoodsOrderShippingDetailsAwb', 'returnableGoodsOrderSkuId');
                    SKuQuanity = response.tableSkusSkuQuantity;
                    if(SKuQuanity && SKuQuanity != 0)
                    {
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
                            'tableReturnableGoodsOrderSku': SKUDto,
                            'skuQuantity': SKuQuanity,
                            'tableReturnableGoodsOrderPackingDetails': {
                                'tableReturnableGoodsOrderPackingDetailsLength': value.Length,
                                'tableReturnableGoodsOrderPackingDetailsWidth': value.Breadth,
                                'tableReturnableGoodsOrderPackingDetailsHeight': value.Height,
                                'tableReturnableGoodsOrderPackingDetailsWeight': value.Weight,
                                "tableSkuUodmType": value.LengthUnit,
                                "tableSkuUowmType": value.WeightUnit,
                                "tableReturnableGoodsOrderShippingDetails": {
                                    "tableReturnableGoodsOrderShippingDetailsMasterAwb": SKUcarrierValue,
                                    "tableReturnableGoodsOrderShippingDetailsAwb": response.tableReturnableGoodsOrderShippingDetailsAwb,
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
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/returnablegoodsorder/' + returnableGoodsOrderSkuId + '/packinginfo',
                data: QuickShipTable,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (data) {
                $('#returnableGoodsOrderQuickShipOperation').modal('hide');
                $scope.notify('Quick ship success','success');
                $scope.cancelQuickShipModal(form);
                $scope.listOfReturnableGoodsOrderStatesCount($scope.defaultTab, 1);
            }).error(function (error,status)
            {
                $scope.cancelQuickShipModal(form);
                $scope.disableQuickShip = false;
                $('#returnableGoodsOrderQuickShipOperation').modal('hide');
                if(status == 400){
                   $scope.notify(error.errorMessage);
                }
                else {
                   $scope.notify("Failed to quick ship");
                }
            })
        }
    };

    $scope.cancelGrnDialog = function(form){
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#returnableGoodsOrderGrnDialog').modal('hide');
    };

    $scope.cancelReturnableGoodsOrderClaimDialog = function(){
        $('#returnableGoodsOrderClaimDialog').modal('hide');
    };

    $scope.cancelReturnableGoodsOrderAskClaimDialog = function(){
        $('#askClaimReturnableGoodsAtGrnDialog').modal('hide');
    };

    $scope.showRaiseClaimDialog = function (tableReturnableGoodsOrderSku , mode)
    {
        $scope.genericData.skuForClaim = tableReturnableGoodsOrderSku;
        $scope.genericData.claimMode = mode;
        $scope.SkuDetails.GRnData = {};
        $scope.SkuDetails.GRnData   = tableReturnableGoodsOrderSku;
        $scope.ReturnableGoodsOrderGrnInventory = tableReturnableGoodsOrderSku.tableSkuInventory;
        if(mode == 'edit')
        {
            $scope.claimObj = tableReturnableGoodsOrderSku.tableReturnableGoodsOrderClaims[0];
        }
        $('#returnableGoodsOrderClaimDialog').modal('show');
    }

    $scope.getDateFormat = function (date) {
        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();
        return day + "-" + monthIndex + "-"+year;
    }

    $scope.showReturnableGoodsOrderGrnDialog = function (ev, orderSkusList)
    {

        var skusArray =[];
        skusArray.push(orderSkusList);

        $scope.disableSubmitGrn = false;
        console.log(skusArray);
        $scope.quickGRNSkuDetails.orderSkusList = skusArray;

        $scope.quickGRNSkuDetails.tableSkuInventoryRecords = [];

        for(var orderSkuCounter = 0; orderSkuCounter < skusArray.length ; orderSkuCounter++)
        {
            orderSku = skusArray[orderSkuCounter];

            $scope.SkuDisabled = true;

            for(var skuInventoryRecordsCount = 0; skuInventoryRecordsCount < orderSku.tableReturnableGoodsOrderSkuInventoryMaps.length; skuInventoryRecordsCount++)
            {
                orderSku.tableReturnableGoodsOrderSkuInventoryMaps[skuInventoryRecordsCount].tableSku = orderSku.tableSku;
                orderSku.tableReturnableGoodsOrderSkuInventoryMaps[skuInventoryRecordsCount].tableSkuInventory.tableSkuInventoryInwardQcFailedCount = undefined;
            }

            if($scope.quickGRNSkuDetails.tableSkuInventoryRecords == null || $scope.quickGRNSkuDetails.tableSkuInventoryRecords == undefined )
            {
                $scope.quickGRNSkuDetails.tableSkuInventoryRecords = orderSku.tableReturnableGoodsOrderSkuInventoryMaps;
            }
            else
            {
                $scope.quickGRNSkuDetails.tableSkuInventoryRecords = $scope.quickGRNSkuDetails.tableSkuInventoryRecords.concat(orderSku.tableReturnableGoodsOrderSkuInventoryMaps);
            }
        }
        $('#returnableGoodsOrderGrnDialog').modal('show');

    };

    //========================== claim for bad quantity grn ======================================== //

    $scope.claimConfirmationAction = function(confirmationValue)
    {

        if(confirmationValue == true)
        {
            $scope.genericData.claimMode = 'add';
            $('#returnableGoodsOrderClaimDialog').modal('show');
        }
        else
        {
            $('#askClaimReturnableGoodsAtGrnDialog').modal('hide');
        }
    };

    $scope.postGRN = function(orderskuid, grndata)
    {
        var deferred = $q.defer();

        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/returnablegoodsordersku/' + orderskuid + '/quickgrn',
            data: grndata,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (data) {
            console.log(data);
            deferred.resolve(data);

        }).error(function (error, status)
        {
            $scope.disableSubmitGrn = false;

            if (status == 400)
            {
               $scope.notify(error.errorMessage);
                return;
            }

           $scope.notify('Quick GRN failed');

        });

        return deferred.promise;
    }

    $scope.ClaimSku = function()
    {
        var claimSkuUrl,Postdata,method;

        for(var claimCounter = 0; claimCounter < $scope.orderSkusForClaim.length ; claimCounter++)
        {
            if($scope.orderSkusForClaim[claimCounter].claimObj.tableReturnableGoodsOrderClaimQuantity > 0 )
            {
                Postdata = $scope.orderSkusForClaim[claimCounter].claimObj;

                if($scope.genericData.claimMode == 'add')
                {
                    claimSkuUrl = MavenAppConfig.baseUrlSource+"/omsservices/webapi/returnablegoodsordersku/" + $scope.orderSkusForClaim[claimCounter].orderSku.idtableReturnableGoodsOrderSkuId + "/returnablegoodsorderclaim";
                    $http({
                        method: 'POST',
                        url: claimSkuUrl,
                        data: Postdata,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).success(function(data)
                    {
                        $scope.notify('Claim raised successfully','success');
                        $('#returnableGoodsOrderClaimDialog').modal('hide');
                        $('#askClaimReturnableGoodsAtGrnDialog').modal('hide');
                        $scope.listOfReturnableGoodsOrderStatesCount($scope.defaultTab,1);
                    }).error(function(error, status)
                    {
                        $('#returnableGoodsOrderClaimDialog').modal('hide');
                        if(status == 400)
                        {
                           $scope.notify(error.errorMessage);
                        }
                        else
                        {
                           $scope.notify('Failed to raise claim');
                        }
                    });
                }
                if($scope.genericData.claimMode == 'edit')
                {
                    claimSkuUrl = MavenAppConfig.baseUrlSource+"/omsservices/webapi/returnablegoodsordersku/" + skuDetails.idtableReturnableGoodsOrderSkuId + "/returnablegoodsorderclaim/" + $scope.claimObj.idtableReturnableGoodsOrderClaimId;
                    $http({
                        method: 'PUT',
                        url: claimSkuUrl,
                        data: Postdata,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).success(function(data)
                    {
                        $scope.notify('Claim updated successfully','success');
                        $('#returnableGoodsOrderClaimDialog').modal('hide');
                        $scope.listOfReturnableGoodsOrderStatesCount($scope.defaultTab,1);
                    }).error(function(error, status)
                    {
                        $('#returnableGoodsOrderClaimDialog').modal('hide');
                        if(status == 400)
                        {
                           $scope.notify(error.errorMessage);
                        }
                        else
                        {
                           $scope.notify('Failed to update claim');
                        }
                    });
                }
            }
        }
    };

    $scope.SubmitGrn = function (data,form)
    {
        $scope.disableSubmitGrn = true;
        console.log(data);
        var askClaim = false;
        $scope.orderSkusForClaim = [];
        for(var orderSKUCounter = 0; orderSKUCounter < $scope.quickGRNSkuDetails.orderSkusList.length;orderSKUCounter++)
        {
            console.log($scope.quickGRNSkuDetails.orderSkusList[orderSKUCounter].idtableReturnableGoodsOrderSkuId);
            var skuInventoryMap = [];

            for(var inventoryMapCounter = 0; inventoryMapCounter < data.length; inventoryMapCounter++)
            {
                inventoryMapCopy = angular.copy(data[inventoryMapCounter]);

                if(inventoryMapCopy.tableSkuInventory.tableSkuInventoryInwardQcFailedCount > 0)
                {
                    askClaim = true;

                    $scope.orderSkusForClaim.push(
                        {
                            "orderSku": $scope.quickGRNSkuDetails.orderSkusList[orderSKUCounter],
                            "skuInventory": inventoryMapCopy.tableSkuInventory
                        }

                    );

                }

                if(inventoryMapCopy.tableSku != null && inventoryMapCopy.tableSku != undefined)
                {
                    if ($scope.quickGRNSkuDetails.orderSkusList[orderSKUCounter].tableSku.idtableSkuId == inventoryMapCopy.tableSku.idtableSkuId)
                    {
                        delete(inventoryMapCopy["tableSku"]);
                        skuInventoryMap.push(inventoryMapCopy);
                    }
                }


            }
            var Postdata = skuInventoryMap;
            $scope.postGRN($scope.quickGRNSkuDetails.orderSkusList[orderSKUCounter].idtableReturnableGoodsOrderSkuId, skuInventoryMap).then(function (data)
            {
                if(data != null)
                {
                    // $('#returnableGoodsOrderGrnDialog').modal('hide');
                    $scope.cancelGrnDialog(form);
                    $scope.notify('GRN successful','success');
                    $scope.listOfReturnableGoodsOrderStatesCount($scope.defaultTab, 1);

                    for (var i = 0; i < $scope.ReturnableGoodsOrderDataLists.length; i += 1) {
                        $scope.dayDataCollapse[i] = false;
                    }
                   //Ask for claim
                    if(askClaim == true)
                    {
                        $('#askClaimReturnableGoodsAtGrnDialog').modal('show');
                    }
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

    $scope.showAddReturnableGoodsOrderModal = function(){
        $('#addReturnableGoodsOrderDialog').modal('show');
    };

    //============================= close purchase order return dialog ===================== //

    $scope.cancelSingleReturnableGoodsOrder = function(form){
        $('#addReturnableGoodsOrderDialog').modal('hide');
        $scope.initSingleOrderReturnData();
        $scope.genericData = {};
        $scope.fileName = null;
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

    //============================= ReturnableGoodsOrder Tab Mode ============================ //
    $scope.singleReturnableGoodsOrderTabMode = function() {
        $scope.ReturnableGoodsOrderTab = true;
        $scope.bulkReturnableGoodsOrderTab = false;
    };

    //bulkOrder Tab Mode
    $scope.bulkReturnableGoodsOrderTabMode = function() {
        $scope.ReturnableGoodsOrderTab = false;
        $scope.bulkReturnableGoodsOrderTab = true;
    };

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

    $scope.stateTrials = function(returnablegoodsorderskus) {
        console.log(returnablegoodsorderskus);
        console.log(returnablegoodsorderskus.length);
        $scope.trialsDataArray = [];
        $scope.trialIdArray = [];
        $scope.trialsLength = [];
        $scope.fullTrialsArray = [];
        $scope.fullIdArray = [];
        for (var i = 0; i < returnablegoodsorderskus.length; i++) {
            console.log(i);
            console.log(returnablegoodsorderskus[i]);
            var trials = returnablegoodsorderskus[i].tableReturnableGoodsOrderSkuStateTrails;
            $scope.trialsLength.push(trials.length);
            console.log(trials);
            console.log($scope.trialsLength);
            if (trials.length < 4) {
                for (var j = 0; j < trials.length; j++) {
                    $scope.trialsDataArray.push(trials[j].tableReturnableGoodsOrderSkuStateType.tableReturnableGoodsOrderSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tableReturnableGoodsOrderSkuStateType.idtableReturnableGoodsOrderSkuStateTypeId);
                }
            }

            if (trials.length == 4) {
                for (var j = 0; j < trials.length; j++) {
                    console.log(trials[j].tableReturnableGoodsOrderSkuStateType.tableReturnableGoodsOrderSkuStateTypeString);
                    $scope.trialsDataArray.push(trials[j].tableReturnableGoodsOrderSkuStateType.tableReturnableGoodsOrderSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tableReturnableGoodsOrderSkuStateType.idtableReturnableGoodsOrderSkuStateTypeId);
                }
            }

            if (trials.length > 4) {
                console.log(trials.length - 4);
                var totalLength = trials.length - 4;
                for (var j = totalLength; j < trials.length; j++) {
                    console.log(trials[j].tableReturnableGoodsOrderSkuStateType.tableReturnableGoodsOrderSkuStateTypeString);
                    $scope.trialsDataArray.push(trials[j].tableReturnableGoodsOrderSkuStateType.tableReturnableGoodsOrderSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tableReturnableGoodsOrderSkuStateType.idtableReturnableGoodsOrderSkuStateTypeId);
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
        console.log(selected );
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
        var wareHousesListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/warehouses/activewarehouses?size=-1&uipagename="+$scope.pagename;
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
        $scope.ReturnableGoodsOrderData.quantityNo = "";
        $scope.ReturnableGoodsOrderData.priceProd = "";
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
        if($scope.vendorId > 0)
        {
            var vendorSkusUrl = MavenAppConfig.baseUrlSource +"/omsservices/webapi/vendors/"+$scope.vendorId+"/skumap/skus";
            $http({
                method:'GET',
                url:vendorSkusUrl
            }).success(function(data,status){
                if(data.length > 0) {
                    $scope.vendorSkus = data;
                }
            }).error(function(data){
                console.log(data);
            });
        }
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
            var giter = _.filter(data,function (value) {
                return value!==null;
            });
            console.log(giter);
            angular.forEach($scope.vendoraddresses, function(item){
                console.log(item.tableAddress);
                $scope.deliveryAddressArray.push(item.tableAddress);
            });
            //$scope.$apply();
        }).error(function(data)
        {
            console.log(data);
        });

    }

    $scope.searchReturnableGoodsOrders = function(){
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
        $scope.listOfReturnableGoodsOrderStatesCount($scope.defaultTab, 1);

    }

    $scope.addProduct = function()
    {
        if (!$scope.searchedSku)
        {
           $scope.notify("Please search and select a product first!");
        }
        else if (!$scope.genericData.returnQuantity)
        {
           $scope.notify("Please enter the product quantity!");
        }
        else if ($scope.genericData.returnQuantity < 1)
        {
           $scope.notify("Please enter return quantity greater than 0!");
        }
        else
        {
            for (var i = 0; i < $scope.singleorderReturnData.tableReturnableGoodsOrderSkus.length; i++)
            {
                if ($scope.singleorderReturnData.tableReturnableGoodsOrderSkus[i].tableSku.idtableSkuId == $scope.searchedSku.idtableSkuId)
                {
                   $scope.notify("The selected SKU is already part of the current order. Delete the existing item first to add updated quantity.");
                    return;
                }
            }
            var tempObject = {
                tableSku : $scope.searchedSku,
                tableReturnableGoodsOrderSkuQuantity: $scope.genericData.returnQuantity
            };

            $scope.singleorderReturnData.tableReturnableGoodsOrderSkus.push(tempObject);
            $scope.$broadcast('angucomplete-alt:clearInput', 'products');
            $scope.genericData.returnQuantity = "";
            $scope.searchedSku = null;
        }
    };

    //remove the product
    $scope.removeProduct = function(index) {
        $scope.genericData.deleteItemIndex = index;
        $('#masterDeleteDialogue').modal('show');
    };
    $scope.deleteSelectedItem = function(){
        $scope.singleorderReturnData.tableReturnableGoodsOrderSkus.splice($scope.genericData.deleteItemIndex, 1);
        $scope.cancelmasterDeleteDialog();
        $scope.notify('Item deleted successfully.','success');
    };
    $scope.cancelmasterDeleteDialog = function(){
        $('#masterDeleteDialogue').modal('hide');
    };
    $scope.totalQuantity = function(allSkus){
        var total = 0;
        for (var i = 0; i < allSkus.length; i++) {
            var quantity = allSkus[i].tableReturnableGoodsOrderSkuQuantity;
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
            if(allSkus[i].tableReturnableGoodsOrderSkuInventoryMaps != null && allSkus[i].tableReturnableGoodsOrderSkuInventoryMaps != undefined)
            {
                for (var j = 0; j < allSkus[i].tableReturnableGoodsOrderSkuInventoryMaps.length; j++)
                {
                    var product = allSkus[i].tableReturnableGoodsOrderSkuInventoryMaps[j].tableSkuInventory.tableSkuInventoryRateTotal;
                    total += product;
                }
                totalCostAmount += total * allSkus[i].tableReturnableGoodsOrderSkuQuantity;
                totalCostAll.push(totalCostAmount);
                total = 0;
            }
        }
        return (totalCostAmount ? totalCostAmount.toFixed(2) : totalCostAmount ) ;
    }


//    ============================================== api for purchase order list counts ====================== //
    $scope.onRecordsPerPageChange = function (orderSize) {
        $scope.start = 0;
        $scope.orderSize = orderSize;
        $scope.end = 0;
        $scope.ReturnableGoodsOrderDataLists = [];
        $scope.listOfReturnableGoodsOrderStatesCount($scope.defaultTab, 1);
    }

    $scope.listOfReturnableGoodsOrderStatesCount = function(tabsValue, page, action)
    {
        $scope.defaultTab = tabsValue;
        $scope.ReturnableGoodsOrderDataLists = [];
        $scope.showLoader = true;
        $scope.allCount = 0;
        $scope.newCount = 0;
        $scope.outProcessCount = 0;
        $scope.inProcessCount = 0;
        $scope.cancelledCount = 0;
        $scope.shippedCount = 0;
        $scope.grnCount = 0;

        var countURL = MavenAppConfig.baseUrlSource + "/omsservices/webapi/returnablegoodsorder/filtercount?uipagename="+$scope.pagename;

        var allCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/returnablegoodsorder/filtercount?state=all&uipagename="+$scope.pagename;
        var newCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/returnablegoodsorder/filtercount?state=new&uipagename="+$scope.pagename;
        var inProcessCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/returnablegoodsorder/filtercount?state=inprocess&uipagename="+$scope.pagename;
        var outProcessCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/returnablegoodsorder/filtercount?state=outprocess&uipagename="+$scope.pagename;
        var shippedCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/returnablegoodsorder/filtercount?state=shipped&uipagename="+$scope.pagename;
        var cancelledCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/returnablegoodsorder/filtercount?state=cancelled&uipagename="+$scope.pagename;
        var grnCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/returnablegoodsorder/filtercount?state=grn&uipagename="+$scope.pagename;

        if( $scope.filterObj.tableWarehouseDetails.idtableWarehouseDetailsId)
        {
            countURL += "&warehouseid=" + $scope.filterObj.tableWarehouseDetails.idtableWarehouseDetailsId;
            allCountUrl += "&warehouseid=" + $scope.filterObj.tableWarehouseDetails.idtableWarehouseDetailsId;
            newCountUrl += "&warehouseid=" + $scope.filterObj.tableWarehouseDetails.idtableWarehouseDetailsId;
            inProcessCountUrl += "&warehouseid=" + $scope.filterObj.tableWarehouseDetails.idtableWarehouseDetailsId;
            outProcessCountUrl += "&warehouseid=" + $scope.filterObj.tableWarehouseDetails.idtableWarehouseDetailsId;
            shippedCountUrl += "&warehouseid=" + $scope.filterObj.tableWarehouseDetails.idtableWarehouseDetailsId;
            cancelledCountUrl += "&warehouseid=" + $scope.filterObj.tableWarehouseDetails.idtableWarehouseDetailsId;
            grnCountUrl += "&warehouseid=" + $scope.filterObj.tableWarehouseDetails.idtableWarehouseDetailsId;
        }
        if ($scope.filterObj.tableSku && $scope.filterObj.tableSku.idtableSkuId)
        {
            allCountUrl += "&skuid=" + $scope.filterObj.tableSku.idtableSkuId;
            newCountUrl += "&skuid=" + $scope.filterObj.tableSku.idtableSkuId;
            inProcessCountUrl += "&skuid=" + $scope.filterObj.tableSku.idtableSkuId;
            shippedCountUrl += "&skuid=" + $scope.filterObj.tableSku.idtableSkuId;
            cancelledCountUrl += "&skuid=" + $scope.filterObj.tableSku.idtableSkuId;
            grnCountUrl += "&skuid=" + $scope.filterObj.tableSku.idtableSkuId;
        }
        if ($scope.filterObj.tableVendor && $scope.filterObj.tableVendor.idtableVendorId)
        {
            allCountUrl += "&vendorid=" + $scope.filterObj.tableVendor.idtableVendorId;
            newCountUrl += "&vendorid=" + $scope.filterObj.tableVendor.idtableVendorId;
            inProcessCountUrl += "&vendorid=" + $scope.filterObj.tableVendor.idtableVendorId;
            shippedCountUrl += "&vendorid=" + $scope.filterObj.tableVendor.idtableVendorId;
            cancelledCountUrl += "&vendorid=" + $scope.filterObj.tableVendor.idtableVendorId;
            grnCountUrl += "&vendorid=" + $scope.filterObj.tableVendor.idtableVendorId;

        }
        if ($scope.filterObj.tableReturnableGoodsOrderRefNo)
        {
            allCountUrl += "&prid=" + $scope.filterObj.tableReturnableGoodsOrderRefNo;
            newCountUrl += "&prid=" + $scope.filterObj.tableReturnableGoodsOrderRefNo;
            inProcessCountUrl += "&prid=" + $scope.filterObj.tableReturnableGoodsOrderRefNo;
            shippedCountUrl += "&prid=" + $scope.filterObj.tableReturnableGoodsOrderRefNo;
            cancelledCountUrl += "&prid=" + $scope.filterObj.tableReturnableGoodsOrderRefNo;
            grnCountUrl += "&prid=" + $scope.filterObj.tableReturnableGoodsOrderRefNo;

        }
        if ($scope.filterObj.tableReturnableGoodsOrderSystemOrderNo)
        {
            allCountUrl += "&orderid=" + $scope.filterObj.tableReturnableGoodsOrderSystemOrderNo;
            newCountUrl += "&orderid=" + $scope.filterObj.tableReturnableGoodsOrderSystemOrderNo;
            inProcessCountUrl += "&orderid=" + $scope.filterObj.tableReturnableGoodsOrderSystemOrderNo;
            shippedCountUrl += "&orderid=" + $scope.filterObj.tableReturnableGoodsOrderSystemOrderNo;
            cancelledCountUrl += "&orderid=" + $scope.filterObj.tableReturnableGoodsOrderSystemOrderNo;
            grnCountUrl += "&orderid=" + $scope.filterObj.tableReturnableGoodsOrderSystemOrderNo;

        }
        if ($scope.filterObj.startDate)
        {
            allCountUrl += "&startdate=" + $scope.filterObj.startDate;
            newCountUrl += "&startdate=" + $scope.filterObj.startDate;
            inProcessCountUrl += "&startdate=" + $scope.filterObj.startDate;
            shippedCountUrl += "&startdate=" + $scope.filterObj.startDate;
            cancelledCountUrl += "&startdate=" + $scope.filterObj.startDate;
            grnCountUrl += "&startdate=" + $scope.filterObj.startDate;

        }
        if ($scope.filterObj.endDate)
        {
            allCountUrl += "&enddate=" + $scope.filterObj.endDate;
            newCountUrl += "&enddate=" + $scope.filterObj.endDate;
            inProcessCountUrl += "&enddate=" + $scope.filterObj.endDate;
            shippedCountUrl += "&enddate=" + $scope.filterObj.endDate;
            cancelledCountUrl += "&enddate=" + $scope.filterObj.endDate;
            grnCountUrl += "&enddate=" + $scope.filterObj.endDate;

        }

        

        var promises = [
            $http.get(allCountUrl),
            $http.get(newCountUrl),
            $http.get(inProcessCountUrl),
            $http.get(outProcessCountUrl),
            $http.get(shippedCountUrl),
            $http.get(cancelledCountUrl),
            $http.get(grnCountUrl)
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
                        $scope.ListOfReturnableGoodsOrderOrders(tabsValue, $scope.start, 'clearAction');
                    } else {
                        $scope.ListOfReturnableGoodsOrderOrders(tabsValue, $scope.start);
                    }
                }

                $scope.allCount  = response[0].data;
                $scope.newCount = response[1].data;
                $scope.inProcessCount = response[2].data;
                $scope.outProcessCount = response[3].data;
                $scope.shippedCount = response[4].data;
                $scope.cancelledCount = response[5].data;
                $scope.grnCount = response[6].data;

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
                else if(tabsValue == 'outprocess'){
                    vm.dummyItems = _.range(0, $scope.outProcessCount);
                }
                else if(tabsValue == 'shipped'){
                    vm.dummyItems = _.range(0, $scope.shippedCount);
                }
                else if(tabsValue == 'cancelled'){
                    vm.dummyItems = _.range(0, $scope.cancelledCount);
                }
                else if(tabsValue == 'grn'){
                    vm.dummyItems = _.range(0, $scope.grnCount);
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
        for(var j=0; j< orderdata.tableReturnableGoodsOrderSkus.length ; j += 1){
            var ordersku = orderdata.tableReturnableGoodsOrderSkus[j];
            if(ordersku.tableReturnableGoodsOrderSkuStateType.idtableReturnableGoodsOrderSkuStateTypeId == 1 || ordersku.tableReturnableGoodsOrderSkuStateType.idtableReturnableGoodsOrderSkuStateTypeId == 2){
                return false;
            }
        }
        return true;
    }

    $scope.editOrder = function(orderData,mode)
    {
        $scope.genericData.singleReturnableGoodsOrderMode = mode;
        $scope.singleorderReturnData = angular.copy(orderData);
        $scope.singleorderReturnData.tableReturnableGoodsOrderSystemOrderNo = orderData.tableReturnableGoodsOrderSystemOrderNo;
        if($scope.singleorderReturnData.tableReturnableGoodsOrderPickupDate){
            $scope.singleorderReturnData.tableReturnableGoodsOrderPickupDate = new Date($scope.singleorderReturnData.tableReturnableGoodsOrderPickupDate);
        }
        if($scope.singleorderReturnData.tableReturnableGoodsOrderDropDate){
            $scope.singleorderReturnData.tableReturnableGoodsOrderDropDate = new Date($scope.singleorderReturnData.tableReturnableGoodsOrderDropDate);
        }

        $scope.getVendorAddress($scope.singleorderReturnData.tableVendor);

        $('#addReturnableGoodsOrderDialog').modal('show');
    }


    //============================ get total cost per Product ================== //

    $scope.cancelInfoBox = function() {
        $('#infoDialogReturnableGoodsOrder').modal('hide');
    }


    $scope.openInfoBox = function(ev, stateTrials) {
        $scope.steps = [];
        console.log(stateTrials);
        for (var i = 0; i < stateTrials.length; i++) {
            var a = stateTrials.length - 1;
            console.log(a);
            var fulldate = $filter('utcToLocalOrHyphen')(stateTrials[i].tableReturnableGoodsOrderSkuStateTrailDateTime);
            if (i < a) {
                $scope.steps.push({
                    title: stateTrials[i].tableReturnableGoodsOrderSkuStateType.tableReturnableGoodsOrderSkuStateTypeString,
                    active: true,
                    orderState: "Successful",
                    remarks: stateTrials[i].tableReturnableGoodsOrderSkuStateTrailRemarks,
                    fulldate: fulldate
                });
            }
            if (i == a) {
                $scope.steps.push({
                    title: stateTrials[i].tableReturnableGoodsOrderSkuStateType.tableReturnableGoodsOrderSkuStateTypeString,
                    orderState: "In Process",
                    remarks: stateTrials[i].tableReturnableGoodsOrderSkuStateTrailRemarks,
                    fulldate: fulldate
                });
            }
        }
        console.log($scope.steps);
        $('#infoDialogReturnableGoodsOrder').modal('show');
    }

    $scope.copyOrder = function(orderData)
    {
        $scope.genericData.singleReturnableGoodsOrderMode = 'copy';
        $scope.singleorderReturnData = {};

        $scope.singleorderReturnDataCopy = angular.copy(orderData);
        $scope.singleorderReturnData = angular.copy($scope.singleorderReturnDataCopy);
        $scope.singleorderReturnData.tableReturnableGoodsOrderSkus = [];
        $scope.singleorderReturnData.tableReturnableGoodsOrderRemarkses = [];
        $scope.singleorderReturnData.tableReturnableGoodsOrderRefNo = null;
        $scope.singleorderReturnData.tableReturnableGoodsOrderSystemOrderNo = null;

        for(var skuCounter = 0 ; skuCounter < $scope.singleorderReturnDataCopy.tableReturnableGoodsOrderSkus.length ; skuCounter++)
        {
            $scope.singleorderReturnData.tableReturnableGoodsOrderSkus.push(
                {
                    "tableSku" : $scope.singleorderReturnDataCopy.tableReturnableGoodsOrderSkus[skuCounter].tableSku,
                    "tableReturnableGoodsOrderSkuQuantity" : $scope.singleorderReturnDataCopy.tableReturnableGoodsOrderSkus[skuCounter].tableReturnableGoodsOrderSkuQuantity
                }
            )
        }

        if($scope.singleorderReturnDataCopy.tableReturnableGoodsOrderPickupDate != null) {
            $scope.singleorderReturnData.tableReturnableGoodsOrderPickupDate = new Date($scope.singleorderReturnDataCopy.tableReturnableGoodsOrderPickupDate);
        }
        else
        {
            $scope.singleorderReturnData.tableReturnableGoodsOrderPickupDate = null;
        }
        if($scope.singleorderReturnDataCopy.tableReturnableGoodsOrderDropDate) {
            $scope.singleorderReturnData.tableReturnableGoodsOrderDropDate = new Date($scope.singleorderReturnDataCopy.tableReturnableGoodsOrderDropDate);
        }
        else {
            $scope.singleorderReturnDataCopy.tableReturnableGoodsOrderDropDate = null;
        }

        $scope.getVendorAddress($scope.singleorderReturnData.tableVendor);
        $('#addReturnableGoodsOrderDialog').modal('show');
    }

    if ($window.localStorage.getItem("returnableGoodsFilter") !== null) {
        var returnableGoodsField = JSON.parse($window.localStorage.getItem("returnableGoodsFilter"));
        $scope.filterObj.tableReturnableGoodsOrderSystemOrderNo = returnableGoodsField.orderid;
        $scope.filterObj.tableWarehouseDetails = returnableGoodsField.warehouse;
        $scope.filterObj.start1Date = returnableGoodsField.startDate;
        $scope.filterObj.end1Date = returnableGoodsField.endDate;
        $scope.filterObj.tableSku = returnableGoodsField.sku;
        $scope.filterObj.tableVendor = returnableGoodsField.vendor;
        $scope.submitAction();

    }

    //clear filter for clearing applied filters
    $scope.clearAction = function() {
        $scope.sortType = "tableReturnableGoodsOrderSystemOrderNo";
        $scope.directionType = "desc";
        $scope.sortReverse = false;

        $scope.filterObj = {};
        $scope.filterObj.tableWarehouseDetails = {};
        $scope.filterObj.tableReturnableGoodsOrderRefNo = null;
        $scope.filterObj.tableReturnableGoodsOrderSystemOrderNo = null;
        $scope.filterObj.tableSku = {};
        $scope.filterObj.tableVendor = {};
        $scope.filterObj.start1Date = null;
        $scope.filterObj.end1Date = null;

        $scope.$broadcast('angucomplete-alt:clearInput', 'productsfilter');
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        $scope.$broadcast('angucomplete-alt:clearInput', 'vendorsMain');
        $scope.listOfReturnableGoodsOrderStatesCount($scope.defaultTab, 1, 'clearAction');
        $window.localStorage.removeItem('returnableGoodsFilter');
        $window.localStorage.removeItem('inboundTab');
        $window.localStorage.removeItem('outboundTab');
    }

    $scope.newTab = function(){
        if(Object.keys($scope.filterObj).length){
            var returnableGoodsField = {
                warehouse : $scope.filterObj.tableWarehouseDetails,
                sku : $scope.filterObj.tableSku,
                vendor : $scope.filterObj.tableVendor,
                orderid:$scope.filterObj.tableReturnableGoodsOrderSystemOrderNo,
                startDate:$scope.filterObj.start1Date,
                endDate:$scope.filterObj.end1Date
            }
            $window.localStorage.setItem('returnableGoodsFilter',JSON.stringify(returnableGoodsField))
        }
        $window.open($location.absUrl(), "_blank");
    }

    $scope.setFormButtonValue = function (value) {
        $scope.submitActionButton = value;
    }
    $scope.submitAddReturnableGoodsOrderForm = function (form) {
        if($scope.genericData.singleReturnableGoodsOrderMode != 'edit' && $scope.submitActionButton == 'save'){
            $scope.saveSingleOrderReturn(form);
        }
        else if($scope.genericData.singleReturnableGoodsOrderMode == 'edit'  && $scope.submitActionButton == 'update'){
            $scope.updateSingleOrderReturn(form);
        }
    }
    $scope.saveSingleOrderReturn = function(form)
    {
        console.log($scope.singleorderReturnData);
        $scope.checkOrderNumber($scope.singleorderReturnData.tableReturnableGoodsOrderRefNo).then(function (retval) {
            if (retval == false) {
                if ($scope.singleorderReturnData.tableWarehouseDetails == null
                    || $scope.singleorderReturnData.tableWarehouseDetails == undefined)
                {
                   $scope.notify("Select warehouse!");
                    return;
                }
                if ($scope.singleorderReturnData.tableVendor == null
                    || $scope.singleorderReturnData.tableVendor == undefined)
                {
                   $scope.notify("Select vendor!");
                    return;
                }
                if ($scope.singleorderReturnData.tableReturnableGoodsOrderQuantityType == null
                    || $scope.singleorderReturnData.tableReturnableGoodsOrderQuantityType == undefined
                    || $scope.singleorderReturnData.tableReturnableGoodsOrderQuantityType == '')
                {
                   $scope.notify("Select quantity type!");
                    return;
                }
                if ($scope.singleorderReturnData.tableReturnableGoodsOrderSkus.length < 1)
                {
                   $scope.notify("Please add at least one product!");
                    return;
                }
                if ($scope.singleorderReturnData.tableShippingOwnership == null || $scope.singleorderReturnData.tableShippingOwnership == undefined)
                {
                   $scope.notify("Select shipping ownership!");
                    return;
                }
                $scope.singleorderReturnDataCopy = angular.copy($scope.singleorderReturnData);

                //if warehouse is glaucus and shipping owner is sender
                if($scope.singleorderReturnData.tableWarehouseDetails.tableWarehouseType.idtableWarehouseTypeId == 1 && $scope.singleorderReturnData.tableShippingOwnership.idtableShippingOwnershipId == 1) //if shipping owner is glaucus
                {
                    if ($scope.singleorderReturnData.tableAddress == null || $scope.singleorderReturnData.tableAddress == undefined) {
                       $scope.notify("Please choose a drop address!");
                        return;
                    }
                }
                //if warehouse is glaucus and shipping owner is receiver
                if($scope.singleorderReturnData.tableWarehouseDetails.tableWarehouseType.idtableWarehouseTypeId == 1 && $scope.singleorderReturnData.tableShippingOwnership.idtableShippingOwnershipId == 2)
                {
                    if ($scope.singleorderReturnData.tableReturnableGoodsOrderPickupDate == null || $scope.singleorderReturnData.tableReturnableGoodsOrderPickupDate == undefined)
                    {
                       $scope.notify("Please choose a pick up date!");
                        return;
                    }
                }
                //if warehouse is glaucus and shipping owner is sender
                if($scope.singleorderReturnData.tableWarehouseDetails.tableWarehouseType.idtableWarehouseTypeId == 1 && $scope.singleorderReturnData.tableShippingOwnership.idtableShippingOwnershipId == 1) //if shipping owner is glaucus
                {
                    if ($scope.singleorderReturnData.tableReturnableGoodsOrderDropDate == null || $scope.singleorderReturnData.tableReturnableGoodsOrderDropDate == undefined)
                    {
                       $scope.notify("Please choose a drop date!");
                        return;
                    }
                }

                if ($scope.singleorderReturnData.tableReturnableGoodsOrderReason == null || $scope.singleorderReturnData.tableReturnableGoodsOrderReason == undefined)
                {
                   $scope.notify("Please choose a reason!");
                    return;
                }

                if ($scope.singleorderReturnData.tableReturnableGoodsOrderPickupDate != null && $scope.singleorderReturnData.tableReturnableGoodsOrderPickupDate != "" && $scope.singleorderReturnData.tableReturnableGoodsOrderPickupDate != undefined) {
                    $scope.singleorderReturnDataCopy.tableReturnableGoodsOrderPickupDate = moment.utc($scope.singleorderReturnData.tableReturnableGoodsOrderPickupDate).format();
                }
                if ($scope.singleorderReturnData.tableReturnableGoodsOrderDropDate != null && $scope.singleorderReturnData.tableReturnableGoodsOrderDropDate != "" && $scope.singleorderReturnData.tableReturnableGoodsOrderDropDate != undefined) {
                    $scope.singleorderReturnDataCopy.tableReturnableGoodsOrderDropDate = moment.utc($scope.singleorderReturnData.tableReturnableGoodsOrderDropDate).format();
                }


                console.log($scope.singleorderReturnDataCopy);
                $http({
                    method: 'POST',
                    url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/returnablegoodsorder',
                    data: $scope.singleorderReturnDataCopy,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function(res)
                {
                    console.log(res);
                    if (res)
                    {
                        if ($scope.genericData.singleReturnableGoodsOrderMode == "add") {
                            $scope.notify("Order added successfully",'success');
                        }
                        else if ($scope.genericData.singleReturnableGoodsOrderMode == "copy") {
                            $scope.notify("Order copied successfully",'success');
                        }
                        $scope.cancelSingleReturnableGoodsOrder(form);
                        $scope.listOfReturnableGoodsOrderStatesCount($scope.defaultTab, 1);

                    }
                }).error(function(error, status) {
                    if(status == 400)
                    {
                       $scope.notify(error.errorMessage);
                    }
                    else
                    {
                       $scope.notify("Failed to add returnable goods order.");
                    }
                });

            }
            else
            {
                $scope.singleorderReturnData.tableReturnableGoodsOrderRefNo = "";
            }
        })

    };

    $scope.updateSingleOrderReturn = function()
    {
        $scope.checkOrderNumber($scope.singleorderReturnData.tableReturnableGoodsOrderRefNo,$scope.singleorderReturnData.tableReturnableGoodsOrderSystemOrderNo).then(function (retval) {
            if (retval == false) {


                console.log($scope.singleorderReturnData);
                if ($scope.singleorderReturnData.tableWarehouseDetails == null
                    || $scope.singleorderReturnData.tableWarehouseDetails == undefined) {
                   $scope.notify("Select warehouse!");
                    return;
                }
                if ($scope.singleorderReturnData.tableVendor == null
                    || $scope.singleorderReturnData.tableVendor == undefined) {
                   $scope.notify("Select vendor!");
                    return;
                }
                if ($scope.singleorderReturnData.tableReturnableGoodsOrderQuantityType == null
                    || $scope.singleorderReturnData.tableReturnableGoodsOrderQuantityType == undefined
                    || $scope.singleorderReturnData.tableReturnableGoodsOrderQuantityType == '') {
                   $scope.notify("Select quantity type!");
                    return;
                }
                if ($scope.singleorderReturnData.tableReturnableGoodsOrderSkus.length < 1) {
                   $scope.notify("Please add at least one product!");
                    return;
                }
                if ($scope.singleorderReturnData.tableShippingOwnership == null || $scope.singleorderReturnData.tableShippingOwnership == undefined) {
                   $scope.notify("Select shipping ownership!");
                    return;
                }
                $scope.singleorderReturnDataCopy = angular.copy($scope.singleorderReturnData);

                //if warehouse is glaucus and shipping owner is sender
                if ($scope.singleorderReturnData.tableWarehouseDetails.tableWarehouseType.idtableWarehouseTypeId == 1 && $scope.singleorderReturnData.tableShippingOwnership.idtableShippingOwnershipId == 1) //if shipping owner is glaucus
                {
                    if ($scope.singleorderReturnData.tableAddress == null || $scope.singleorderReturnData.tableAddress == undefined) {
                       $scope.notify("Please choose a drop address!");
                        return;
                    }
                }
                //if warehouse is glaucus and shipping owner is receiver
                if ($scope.singleorderReturnData.tableWarehouseDetails.tableWarehouseType.idtableWarehouseTypeId == 1 && $scope.singleorderReturnData.tableShippingOwnership.idtableShippingOwnershipId == 2) {
                    if ($scope.singleorderReturnData.tableReturnableGoodsOrderPickupDate == null || $scope.singleorderReturnData.tableReturnableGoodsOrderPickupDate == undefined) {
                       $scope.notify("Please choose a pick up date!");
                        return;
                    }
                }
                //if warehouse is glaucus and shipping owner is sender
                if ($scope.singleorderReturnData.tableWarehouseDetails.tableWarehouseType.idtableWarehouseTypeId == 1 && $scope.singleorderReturnData.tableShippingOwnership.idtableShippingOwnershipId == 1) //if shipping owner is glaucus
                {
                    if ($scope.singleorderReturnData.tableReturnableGoodsOrderDropDate == null || $scope.singleorderReturnData.tableReturnableGoodsOrderDropDate == undefined) {
                       $scope.notify("Please choose a drop date!");
                        return;
                    }
                }

                if ($scope.singleorderReturnData.tableReturnableGoodsOrderPickupDate != null && $scope.singleorderReturnData.tableReturnableGoodsOrderPickupDate != "" && $scope.singleorderReturnData.tableReturnableGoodsOrderPickupDate != undefined) {
                    $scope.singleorderReturnDataCopy.tableReturnableGoodsOrderPickupDate = moment.utc($scope.singleorderReturnData.tableReturnableGoodsOrderPickupDate).format();
                }
                if ($scope.singleorderReturnData.tableReturnableGoodsOrderDropDate != null && $scope.singleorderReturnData.tableReturnableGoodsOrderDropDate != "" && $scope.singleorderReturnData.tableReturnableGoodsOrderDropDate != undefined) {
                    $scope.singleorderReturnDataCopy.tableReturnableGoodsOrderDropDate = moment.utc($scope.singleorderReturnData.tableReturnableGoodsOrderDropDate).format();
                }


                console.log($scope.singleorderReturnDataCopy);
                $http({
                    method: 'PUT',
                    url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/returnablegoodsorder/' + $scope.singleorderReturnDataCopy.idtableReturnableGoodsOrderId,
                    data: $scope.singleorderReturnDataCopy,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function (res) {
                    console.log(res);
                    if (res) {
                        if ($scope.genericData.singleReturnableGoodsOrderMode == "add") {
                            $scope.notify("Order added successfully",'success');
                        }
                        else if ($scope.genericData.singleReturnableGoodsOrderMode == "copy") {
                            $scope.notify("Order copied successfully",'success');
                        }
                        else if ($scope.genericData.singleReturnableGoodsOrderMode == "edit") {
                            $scope.notify("Order updated successfully",'success');
                        }
                        $scope.cancelSingleReturnableGoodsOrder();
                        $scope.listOfReturnableGoodsOrderStatesCount($scope.defaultTab, $scope.vmPager.currentPage);

                    }
                }).error(function (error, status) {
                    if (status == 400) {
                       $scope.notify(error.errorMessage);
                    }
                    else {
                       $scope.notify("Failed to update returnable goods order.");
                    }
                });
            }
        })
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
        var checkOrderNo = MavenAppConfig.baseUrlSource + "/omsservices/webapi/returnablegoodsorder/clientordernumber?clientordernumber=" + orderNo;

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
        $scope.listOfReturnableGoodsOrderStatesCount(defaultTab, page);
    }

    $scope.listOfReturnableGoodsOrderStatesCount($scope.defaultTab,1);

    //============================================= list of purchase return order ======================================= //
    //  ===== have to use this for listing data ========= //
    $scope.ListOfReturnableGoodsOrderOrders = function(tabsValue, start, action)
    {
        $scope.defaultTab = tabsValue;
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

        var ReturnableGoodsOrderListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/returnablegoodsorder";

        if ($scope.defaultTab == 'all')
            ReturnableGoodsOrderListUrl += "?start=" + start + "&size=5&sort=" + $scope.sortType + "&direction=" + $scope.directionType;

        if ($scope.defaultTab != 'all')
            ReturnableGoodsOrderListUrl += "?start=" + start + "&size=5&sort=" + $scope.sortType + "&direction=" + $scope.directionType + "&state=" + tabsValue;

        ReturnableGoodsOrderListUrl += "&uipagename="+$scope.pagename;
        if ($scope.filterObj.tableWarehouseDetails && $scope.filterObj.tableWarehouseDetails.idtableWarehouseDetailsId) {
            ReturnableGoodsOrderListUrl += "&warehouseid=" + $scope.filterObj.tableWarehouseDetails.idtableWarehouseDetailsId;
        }
        if ($scope.filterObj.tableSku && $scope.filterObj.tableSku.idtableSkuId)
        {
            ReturnableGoodsOrderListUrl += "&skuid=" + $scope.filterObj.tableSku.idtableSkuId;
        }
        if ($scope.filterObj.tableVendor && $scope.filterObj.tableVendor.idtableVendorId) {
            ReturnableGoodsOrderListUrl += "&vendorid=" + $scope.filterObj.tableVendor.idtableVendorId;
        }
        if ($scope.filterObj.tableReturnableGoodsOrderRefNo) {
            ReturnableGoodsOrderListUrl += "&prid=" + $scope.filterObj.tableReturnableGoodsOrderRefNo;
        }

        if ($scope.filterObj.startDate) {
            ReturnableGoodsOrderListUrl += "&startdate=" + $scope.filterObj.startDate;
        }
        if ($scope.filterObj.endDate) {
            ReturnableGoodsOrderListUrl += "&enddate=" + $scope.filterObj.endDate;
        }
        if ($scope.filterObj.tableReturnableGoodsOrderSystemOrderNo) {
            ReturnableGoodsOrderListUrl += "&orderid=" + $scope.filterObj.tableReturnableGoodsOrderSystemOrderNo;
        }
        $http.get(ReturnableGoodsOrderListUrl).success(function(data)
        {
            console.log(data);
            $scope.ReturnableGoodsOrderDataLists = data;
            $scope.tableRowExpanded = false;
            $scope.tableRowIndexExpandedCurr = "";
            $scope.tableRowIndexExpandedPrev = "";
            $scope.storeIdExpanded = "";
            $scope.end = $scope.start + data.length;
            $scope.dayDataCollapse = [];

            for (var i = 0; i < $scope.ReturnableGoodsOrderDataLists.length; i += 1) {
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
        if($scope.stopSkuLoad){
            return;
        }
        $scope.skuLoadBusy = true;
        if($scope.skuPaginateCheck == false){
            mastersService.fetchOnlySkusNext(MavenAppConfig.baseUrlSource,skuStart,size,function(data){
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
            mastersService.fetchVendorSkusNext(MavenAppConfig.baseUrlSource,$scope.singleorderReturnData.tableVendor.idtableVendorId,skuStart,size,function (data) {
                if(data.length > 0){
                    $scope.genericData.skusListFiltered = $scope.genericData.skusListFiltered.concat(data);
                    skuStart += size;
                    $scope.skuLoadBusy = false;
                }
                else{
                    $scope.skuLoadBusy = true;
                }
            })
        }


    }
	
	$scope.masterSkuDialog = function(ev, check)
    {
        $scope.skuPaginateCheck = check;
		if(check == false)
		{
            mastersService.fetchOnlySkus(MavenAppConfig.baseUrlSource,function (data) {
                $scope.genericData.skusListFiltered = data;
            })
        }
        else
        {
            if($scope.singleorderReturnData.tableVendor == null)
            {
               $scope.notify("Select a vendor first");
            }
            else
            {
                mastersService.fetchVendorSkus(MavenAppConfig.baseUrlSource,$scope.singleorderReturnData.tableVendor.idtableVendorId,function (data) {
                    $scope.genericData.skusListFiltered = data;
                })
            }
        }
		
        $('#dialogmastersku').modal('show');
        $scope.skuLoadBusy = false;
        $scope.stopSkuLoad = false;
        $scope.genericData.check = check;

        if(check == true)
        {
            // $('#addReturnableGoodsOrderDialog').modal('hide');
        }
		
	}
	
	$scope.masterVendorDialog = function(ev,check){
		
		mastersService.fetchVendors(MavenAppConfig.baseUrlSource,function(data){
			$scope.genericData.vendorsListFiltered = data;
		})
		
        $('#dialogmastervendor').modal('show');
		
	}
	
	$scope.cancelmastersDialog = function(ev)
    {
        skuStart=0;
        size=10;
        $scope.genericData.skusListFiltered = [];
        $scope.skuLoadBusy = true;
        $scope.stopSkuLoad = true;
        $('#dialogmastersku').modal('hide');

        $('#dialogmastervendor').modal('hide');

        if($scope.genericData.check == true){
            // $scope.showAddOrderModalWithValues(ev);
        }

    }

    $scope.showAddOrderModalWithValues = function(ev)
    {
        $('#addReturnableGoodsOrderDialog').modal('show');
    }

	
	$scope.selectSku = function(id,ev){
        $scope.stopSkuLoad = true;
		$http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/'+id).success(function(data) {
        console.log(data);
		 
        if($scope.genericData.check == false)
        {
            $scope.filterObj.tableSku = data;
            $scope.cancelmastersDialog(ev);
            $scope.$broadcast("angucomplete-alt:changeInput", "productsfilter", data);
        }
        else
        {
            $scope.searchedSku = data;
            $scope.cancelmastersDialog(ev);
            $scope.$broadcast("angucomplete-alt:changeInput", "products", data);
        }
        }).error(function(error, status) {
            console.log(error);
			
        });	
		

	}
	
	$scope.selectVendor = function(id,ev){
		
		 $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/vendors/'+id).success(function(data) {
         console.log(data);
		 $scope.filterObj.tableVendor = data;
		 $scope.$broadcast("angucomplete-alt:changeInput", "vendorsMain", data.tableVendorName);
        }).error(function(error, status) {
            console.log(error);

        });

        $scope.cancelmastersDialog(ev);
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
            if (b == false && (resp.tableReturnableGoodsOrderSkuStateType.idtableReturnableGoodsOrderSkuStateTypeId == 1)) {
                b = true;
            }
        });
        return b;
    };


    $scope.shipAll = function(){
        if($scope.shipping.shipallchecked){
            angular.forEach($scope.quickShipDataTable, function (response)
            {
                response.tableSkusSkuQuantity = response.tableReturnableGoodsOrderSkuQuantity;
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

    $scope.downloadReturnableGoodsOrderTemplate = function () {

        var url = MavenAppConfig.baseUrlSource + "/omsservices/webapi/returnablegoodsorder/bulkuploadtemplate";

        $http({
            method: 'GET',
            url: url,
            headers: {
                'Content-Type': 'application/json'
            },
            responseType:'arraybuffer'

        })
            .success(function (data) {
                console.log(data);
                var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                var downloadUrl = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = downloadUrl;
                a.download = "Glaucus_Returnable_Goods_Bulk_Upload_Template.xls";
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

    };

    $scope.uploadBulkOrderFile = function(bulkOrderUploadfile) {
        console.log(bulkOrderUploadfile);
        file = bulkOrderUploadfile;
        console.log(file);
        console.log(file.name);
        $scope.fileName = file.name;

    };

    $scope.disableBulkUpload = false;
    $scope.uploadReturableGoods = function(bulkOrderUploadfile,form){
        console.log(bulkOrderUploadfile);
        file = bulkOrderUploadfile;
        $scope.disableBulkUpload = true;
        if (file) {
            if (!file.$error) {
                console.log('file is ');
                console.dir(file);
                var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/returnablegoodsorder/bulkupload';

                var fd = new FormData();
                fd.append('uploadFile', file);
                console.log(uploadUrl);
                console.log('uploadFile' + file);
                console.log('fd' + fd);
                var upload = Upload.http({
                    url: uploadUrl,
                    method: 'POST',
                    data: fd,
                    headers: {
                        'Content-Type': undefined
                    }
                });
                upload.then(function(resp)
                {
                    // file is uploaded successfully
                    console.log(resp);
                    console.log('file ' + file.name + 'is uploaded successfully. Response: ' + resp.data);
                    $cookies.put('BulkUploadData','returnablegoodsorder');
                    $cookies.put('ActiveTab','returnablegoodsorder');
                   $scope.notify("File has been uploaded successfully.It may take a few minutes to reflect the changes.<br><a href='#/bulkuploads/' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View bulk upload reports.</a>",'success','','',0);
                    $scope.genericData = {};
                    $scope.fileName = null;
                    if(form){
                        var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
                        for (var name in controlNames) {
                            var control = form[name];
                            control.$setViewValue(undefined);
                        }
                        form.$setPristine();
                        form.$setUntouched();
                    }
                    $('#addReturnableGoodsOrderDialog').modal('hide');
                    $scope.disableBulkUpload = false;
                }, function(error)
                {
                    $scope.genericData = {};
                    $scope.fileName = null;
                    if(form){
                        var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
                        for (var name in controlNames) {
                            var control = form[name];
                            control.$setViewValue(undefined);
                        }
                        form.$setPristine();
                        form.$setUntouched();
                    }
                    $('#addReturnableGoodsOrderDialog').modal('hide');
                    $scope.cancelBulkUpload();
                    if(error.status == 400)
                    {
                       $scope.notify(error.data.errorMessage);
                    }
                    else
                    {
                       $scope.notify("Failed to upload file.");
                    }
                    $scope.disableBulkUpload = false;
                }, function(evt) {
                    // progress notify
                    console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :' + file.name);
                });
            }
        }
    };

    $scope.cancelBulkUpload = function(){
        $scope.fileName = null;
        $scope.progressOfUpload = null;
        $('#addReturnableGoodsOrderDialog').modal('hide');
    }
    $scope.$on('$destroy', function () {
        $window.localStorage.removeItem('returnableGoodsFilter');
        $window.localStorage.removeItem('inboundTab');
        $window.localStorage.removeItem('outboundTab');
        $("#dialogmastersku").remove();
        $('.modal-backdrop').remove();
    });

    $scope.resetSelectedModalValuesAfterWarehouseChanged = function ()
    {
        $scope.singleorderReturnData.tableReturnableGoodsOrderSkus = [];
        $scope.singleorderReturnData.tableVendor = [];
        $scope.deliveryAddressArray = [];
    }


    $scope.resetSelectedModalValuesAfterVendorChanged = function ()
    {
        $scope.singleorderReturnData.tableReturnableGoodsOrderSkus = [];
    }

    $scope.closeBulkUploadDialog = function(){

        $('#addPodialog').modal('hide');
        $cookies.put('BulkUploadData','returnablegoodsorder');
        $cookies.put('ActiveTab','returnablegoodsorder');
        $timeout(function() {
            $location.path('/bulkuploads');
            console.log('update with timeout fired')
        }, 1000);
    }
}]);

