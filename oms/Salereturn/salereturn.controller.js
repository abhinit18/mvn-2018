/**
 * Upadted by Prakhar Srivastava on 30-11-2017.
 */

angular.module('OMSApp.salereturn', [ ]).config(function config($stateProvider) {
    $stateProvider.state('/salereturn/', {
        name: '/salereturn/',
        url: '/salereturn/',
        views: {
            "main": {
                controller: 'salereturnController',
                templateUrl: 'Salereturn/salereturn.view.html'
            },
            "header": {
                controller: 'headerCtrl',
                templateUrl: '../shared/templates/header.html'
            }
        },
        data: {pageTitle: 'Sale Return order'}
    })

}).controller('salereturnController',['$rootScope','$scope', '$http', '$location', '$filter', 'MavenAppConfig', '$mdDialog','$sce', '$window', 'Upload', 'pagerService', '$q', '$cookies','$timeout','$controller' , 'mastersService',

function salereturnController($rootScope,$scope, $http, $location, $filter , MavenAppConfig, $mdDialog,$sce, $window, Upload, pagerService, $q, $cookies,$timeout,$controller, mastersService) {

    // Initialize the super class and extend it.

    $scope.addDeliveryClicked = false;
    $scope.submitActionButton = '';
    $scope.genericData = {};
    $scope.claimObj = {};
    $scope.genericData.saleOrderRefNo = "";
    $scope.saleReturnFormData = {};
    $scope.singleorderReturnData = {};
    $scope.endminDateDelivery = new Date();

    $scope.cancelSingleOrdersReturnDialog = function(form){
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#SaleReturnGRNdata').modal('hide');
    };

    $scope.downloadSaleReturnTemplate = function () {

        if($scope.genericData.saleRefKnown == true) {

            var tempDownloadSaleReturnTemplateUrl = $scope.downloadSaleReturnTemplateUrl + 'templateforreturnuploadwithsaleorder';

            $http({
                method: 'GET',
                url: tempDownloadSaleReturnTemplateUrl,
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }).success(function (data)
            {
                console.log(data);
                var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                var downloadUrl = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = downloadUrl;
                a.download = "Glaucus_Sale_Return_Bulk_Upload_Template.xls";
                document.body.appendChild(a);
                a.click();
            }).error(function (data) {
                console.log(data);
            });
        }
        if($scope.genericData.saleRefKnown == false) {

            var tempDownloadSaleReturnTemplateUrl = $scope.downloadSaleReturnTemplateUrl + 'templateforreturnuploadwithoutsaleorder';

            $http({
                method: 'GET',
                url: tempDownloadSaleReturnTemplateUrl,
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }).success(function (data)
            {
                console.log(data);
                var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                var downloadUrl = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = downloadUrl;
                a.download = "Glaucus_Sale_Return_Bulk_Upload_Template.xls";
                document.body.appendChild(a);
                a.click();
            }).error(function (data) {
                console.log(data);
            });
        }
    };

    $scope.uploadBulkOrderReturnFile = function(bulkOrderUploadfile, bulkOrderSettingData) {
        console.log(bulkOrderUploadfile);
        file = bulkOrderUploadfile;
        console.log(file);
        console.log(file.name);
        $scope.fileName = file.name;

    };
    $scope.disableBulkUpload = false;
    $scope.uploadSaleReturnBulkUpload = function (form){
        var uploadUrl;
        $scope.disableBulkUpload = true;
        if($scope.genericData.saleRefKnown == true)
        {
            uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/salereturn/uploadsaleorderreturnwithsaleorder';

        }
        if($scope.genericData.saleRefKnown == false) {
            uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/salereturn/uploadsaleorderreturnwithoutsaleorder';
        }
        console.log($scope.genericData.bulkOrderUploadfile);
        file = $scope.genericData.bulkOrderUploadfile;
        if (file) {
            if (!file.$error)
            {

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
                upload.then(function(resp) {
                    // file is uploaded successfully
                    console.log(resp);
                    console.log('file ' + file.name + 'is uploaded successfully. Response: ' + resp.data);
                    if($scope.genericData.saleRefKnown == true)
                    {
                        $cookies.put('BulkUploadData','salereturn');
                        $cookies.put('ActiveTab','salereturn');
                    }
                    if($scope.genericData.saleRefKnown == false) {
                        $cookies.put('BulkUploadData','salereturnwithoutorderid');
                        $cookies.put('ActiveTab','salereturnwithoutorderid');
                    }
                    $scope.notify("File has been uploaded successfully.It may take a few minutes to reflect the changes.<br><a href='#/bulkuploads/' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View bulk upload reports.</a>",'success','','',0);
                    $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                    $scope.genericData= {};
                    $scope.cancelBulkUpload(form);
                    $('#addOrderModal').modal('hide');
                    $scope.disableBulkUpload = false;
                }, function(resp) {
                    $scope.genericData= {};
                    $scope.cancelBulkUpload(form);
                    console.log(resp);
                    $scope.notify(resp.data.errorMessage);
                    $scope.disableBulkUpload = false;
                }, function(evt) {
                    // progress notify
                    console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :' + file.name);
                });
            }
        }
        $('#addSaleReturnDialogRefUnknown').modal('hide');
        $('#addSaleReturnDialogRefKnown').modal('hide');
        
        
    }
    $scope.cancelBulkUpload = function(form){
        $scope.fileName = null;
        $scope.genericData= {};
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#addSaleReturnDialogRefUnknown').modal('hide');
        $('#addSaleReturnDialogRefKnown').modal('hide');

    };

    $scope.initSingleOrderReturnData = function ()
    {
        $scope.genericData = {};
        $scope.genericData.saleOrderRefNo = "";
        $scope.singleorderReturnData = {};
        $scope.singleorderReturnData.tableSaleReturnSkus = [];
        // $scope.singleorderReturnData.tableShippingOwnership = {};
        $scope.singleorderReturnData.tableCustomer = {};
        $scope.singleorderReturnData.tableSalesChannelValueInfo = null;
        $scope.singleorderReturnData.tableSaleReturnScRefNo = "";
        $scope.singleorderReturnData.tableSaleReturnRemarks = "";
        $scope.singleorderReturnData.tableSaleReturnRemarkses = [];
    }

    $scope.getSaleOrderInfo = function ()
    {
        if(!$scope.genericData.saleOrderRefNo || $scope.genericData.saleOrderRefNo == "")
        {
            $scope.notify("Enter Sale Order Ref No.");
            return;
        }
        var saleOrderUrl = MavenAppConfig.baseUrlSource+'/omsservices/webapi/orders/systemorderno?systemorderno=' + $scope.genericData.saleOrderRefNo;
        $http({
            method: 'GET',
            url: saleOrderUrl
        }).success(function(response)
        {
            if(response == "" || response == null){
                $scope.notify("No Order found");
            }
            else
            {
                //Check if the order contains at least one item that is in shipped state
                var shippedfound = false;
                for(var skuindex=0; skuindex < response.tableSaleOrderSkuses.length;skuindex++)
                {
                    if(response.tableSaleOrderSkuses[skuindex].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 16
                        || response.tableSaleOrderSkuses[skuindex].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 17
                        || response.tableSaleOrderSkuses[skuindex].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 18
                        || response.tableSaleOrderSkuses[skuindex].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 19)
                    {
                        shippedfound = true;
                    }
                }
                if(shippedfound == false)
                {
                    $scope.notify("There are no items in this order that are in shipped state");
                    return;
                }
                $scope.populateReturnOrderFromSaleOrder(response);
            }

        }).error(function(status, error)
        {
            if(status == 400){
                $scope.notify(error.errorMessage);
            }
            else{
                $scope.notify("Failed to get order");
            }
        });
    }

    $scope.hideeditbutton = function(orderdata){
        for(var j=0; j< orderdata.tableSaleReturnSkus.length ; j += 1){
            var ordersku = orderdata.tableSaleReturnSkus[j];
            if(ordersku.tableSaleReturnSkuStateType.idtableSaleReturnSkuStateTypeId == 1 || ordersku.tableSaleReturnSkuStateType.idtableSaleReturnSkuStateTypeId == 2){
                return false;
            }
        }
        return true;
    }

    $scope.populateReturnOrderFromSaleOrder = function (response)
    {
        //populate data here
        $scope.genericData.saleOrderSkus = response.tableSaleOrderSkuses;
        $scope.genericData.foundReturnable = false;
        $scope.singleorderReturnData.tableAddress = response.tableAddressByTableSaleOrderShipToAddressId;
        $scope.singleorderReturnData.tableCustomer = response.tableCustomer ;
        $scope.singleorderReturnData.tableSaleOrder = response ;
        $scope.singleorderReturnData.tableSalesChannelValueInfo = response.tableSalesChannelValueInfo ;
        if($scope.singleOrderReturnMode == "add")
        {
            $scope.singleorderReturnData.tableSaleReturnSkus = [];
        }

        $scope.genericData.returnedQuantity = [];

        var getReturnedSkus = MavenAppConfig.baseUrlSource + '/omsservices/webapi/salereturnsku?orderid=' + $scope.singleorderReturnData.tableSaleOrder.tableSaleOrderSystemOrderNo;
        $http({
            method: 'GET',
            url: getReturnedSkus
        }).success(function(tableSaleReturnSkus)
        {


            for(var orderSkuCounter = 0; orderSkuCounter < response.tableSaleOrderSkuses.length ; orderSkuCounter++)
            {


                var shipped = false;
                if(response.tableSaleOrderSkuses[orderSkuCounter].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 16
                    || response.tableSaleOrderSkuses[orderSkuCounter].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 17
                    || response.tableSaleOrderSkuses[orderSkuCounter].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 18
                    || response.tableSaleOrderSkuses[orderSkuCounter].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 19)
                {
                    shipped = true;
                }

                if(shipped == true)
                {
                    if($scope.singleOrderReturnMode == "add")
                    {
                        var returnedQuantity = 0;
                        //check if there is already some return quantity
                        if (tableSaleReturnSkus && tableSaleReturnSkus.length > 0)
                        {

                            for (var returnindex = 0; returnindex < tableSaleReturnSkus.length; returnindex++) {
                                if (tableSaleReturnSkus[returnindex].tableSku.idtableSkuId == response.tableSaleOrderSkuses[orderSkuCounter].tableSku.idtableSkuId) {
                                    returnedQuantity += tableSaleReturnSkus[returnindex].tableSaleReturnSkuQuantity;
                                }
                            }
                        }

                        $scope.genericData.returnedQuantity.push(returnedQuantity);
                        $scope.singleorderReturnData.tableSaleReturnSkus.push(
                            {
                                "tableSku": response.tableSaleOrderSkuses[orderSkuCounter].tableSku,
                                "tableSaleReturnSkuQuantity": response.tableSaleOrderSkuses[orderSkuCounter].tableSaleOrderSkusSkuQuantity - returnedQuantity
                            }
                        )
                    }
                    if($scope.singleOrderReturnMode == "edit")
                    {
                        //check if there is already some return quantity and shall not be the one already part of this sale return
                        if (tableSaleReturnSkus && tableSaleReturnSkus.length > 0)
                        {
                            var returnedQuantity = 0;
                            for (var returnindex = 0; returnindex < tableSaleReturnSkus.length; returnindex++)
                            {
                                if (tableSaleReturnSkus[returnindex].tableSku.idtableSkuId == response.tableSaleOrderSkuses[orderSkuCounter].tableSku.idtableSkuId)
                                {
                                    for(var editedOrderSkuCounter = 0; editedOrderSkuCounter < $scope.singleorderReturnData.tableSaleReturnSkus.length; editedOrderSkuCounter++)
                                    {
                                        if(($scope.singleorderReturnData.tableSaleReturnSkus[editedOrderSkuCounter].tableSku.idtableSkuId == tableSaleReturnSkus[returnindex].tableSku.idtableSkuId)
                                            && ($scope.singleorderReturnData.tableSaleReturnSkus[editedOrderSkuCounter].idtableSaleReturnSkuId != tableSaleReturnSkus[returnindex].idtableSaleReturnSkuId))
                                        {
                                            returnedQuantity += tableSaleReturnSkus[returnindex].tableSaleReturnSkuQuantity;
                                        }
                                    }
                                }
                            }
                        }

                        $scope.genericData.returnedQuantity.push(returnedQuantity);

                    }

                    if(response.tableSaleOrderSkuses[orderSkuCounter].tableSaleOrderSkusSkuQuantity - returnedQuantity > 0 && $scope.singleOrderReturnMode != "edit")
                    {
                        $scope.genericData.foundReturnable = true;
                    }
                    if($scope.singleOrderReturnMode == "edit")
                    {
                        $scope.genericData.foundReturnable = true;
                    }
                }
            }

            if($scope.genericData.foundReturnable == false && $scope.singleOrderReturnMode != "edit")
            {
                $scope.notify('There is no quantity left in this order that can be returned. Provide another reference');
                $scope.initSingleOrderReturnData();
            }

        }).error(function(error, status)
        {

        });



    }

    $scope.initSingleOrderReturnData();

    $scope.bulkOrderSettingData = "";
    $scope.defaultTab = "all";
    $scope.warehouseError = {};
    $scope.notApplicableCounter = 1;

    $scope.filter = {};
    $scope.filter.start1Date = null;
    $scope.filter.end1Date = null;
    $scope.recordsPerPage = [5,10,15];
    $scope.start = 0;
    $scope.orderSize = $scope.recordsPerPage[0];

    var currentUrl,UrlName;
    currentUrl = $scope.currentUrl;
    if($scope.currentUrl === "")
    {
        currentUrl = window.location.href;
    }
    UrlName = currentUrl.split('/');
    console.log(UrlName);
    if(UrlName.indexOf('salereturn') == -1){
        $scope.defaultTab = "new";
    }else{
        $scope.defaultTab = "all";
    }

    $scope.products = [];

    $scope.orderLevelAction = {};
    $scope.array = [];
    $scope.singleOrderReturnTab = true;
    $scope.singleOrderReturnMode = "add";
    $scope.bulkOrderReturnTab = false;
    $scope.incrVar = false;
    $scope.decrVar = false;
    $scope.arrayHeaderList = [];
    $scope.arrayList = [];
    $scope.myList = [];
    $scope.bulkUploadOrderFielsClicked = false;
    $scope.bulkUploadMapElemClicked = false;
    $scope.baseSkuUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/search?search=';
    $scope.baseCustomerUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/search?search=';
    $scope.downloadSaleReturnTemplateUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/salereturn/';
    $scope.baseSchedulePickUpUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/orders/schedulepickup";

    $scope.sortType = "tableSaleReturnSystemOrderNo";
    $scope.directionType = "desc";
    $scope.sortReverse = false; // set the default sort order

    $scope.bulkSelectChannel = false;
    $scope.bulkSelectFile = false;

    $scope.otherReasonNotFiled = false;
    $scope.reasonData = null ;

    //Start Date and End Date Validations Starts Here

    $scope.endmaxDate = new Date();

    $scope.startmaxDate = new Date();

    $scope.sendStartDate = function()
    {
        $scope.startDateData = new Date($scope.filter.start1Date);
        $scope.endminDate = new Date(
            $scope.startDateData.getFullYear(),
            $scope.startDateData.getMonth(),
            $scope.startDateData.getDate());
    }

    $scope.sendEndDate = function(date)
    {
        $scope.endDateData = new Date($scope.filter.end1Date);
        $scope.startmaxDate = new Date(
            $scope.endDateData.getFullYear(),
            $scope.endDateData.getMonth(),
            $scope.endDateData.getDate());
        if(date){
            $scope.endminDateDelivery = new Date(date);
        }

    }

    $scope.clearStartDate = function()
    {
        $scope.filter.startDate = null;
        $scope.filter.start1Date = null;
        if($scope.filter.end1Date == null)
        {
            $scope.startmaxDate = new Date();
        }
        else
        {
            $scope.sendEndDate();
        }
        $scope.endminDate = null;
    }

    $scope.clearEndDate = function()
    {
        $scope.filter.endDate = null;
        $scope.filter.end1Date = null;
        $scope.startmaxDate = new Date();
        $scope.endmaxDate = new Date();
        if($scope.filter.start1Date == null)
        {
            $scope.endminDate = null;
        }
        else
        {
            $scope.sendStartDate();
        }
    }

    $scope.openCustomerMode = function($event)
    {
        $('#addOrderModal').modal('hide');
        $scope.orderTotalMode = "new";
        $scope.addCustomer($event);
    };

    $scope.listOfChannels = function() {
        $scope.channelNamesData = [];
        var channelListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/saleschannels?uipagename="+$scope.pagename
        // console.log(channelListUrl);
        $http.get(channelListUrl).success(function(data) {
            console.log(data);
            $scope.channelLists = data;

            for (var i = 0; i < $scope.channelLists.length; i++) {
                if ($scope.channelLists[i].tableSalesChannelMetaInfo.tableSalesChannelType.idtableSalesChannelTypeId == 2) {
                    $scope.channelNamesData.push($scope.channelLists[i]);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };

    $scope.listOfChannels();


    if($cookies.get('orderid') != null){
        $scope.filter.orderid = $cookies.get('orderid');
        $cookies.remove('orderid')
    }

    //Start Date and End Date Validations Starts Here for Individual Work Orders
    $scope.callMinStartMaxStartDelivery = function() {
        $scope.todayDateDelivery = new Date();
        $scope.startminDateDelivery = new Date(
            $scope.todayDateDelivery.getFullYear(),
            $scope.todayDateDelivery.getMonth(),
            $scope.todayDateDelivery.getDate());
    };
    $scope.callMinStartMaxStartDelivery();

    $scope.validateEmail = function(emailCase) {
        if (emailCase == false) {
            $scope.notify("Please Enter Valid Email Id");
            document.myForm.custEmail.focus();
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

    $scope.listOfVendors = function() {
        $scope.vendorsData = [];
        var vendorsListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/vendors";
        // console.log(channelListUrl);
        $http.get(vendorsListUrl).success(function(data) {
            console.log(data);
            $scope.vendorsLists = data;
            for (var i = 0; i < $scope.vendorsLists.length; i++) {
                $scope.vendorsData.push($scope.vendorsLists[i]);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }
    $scope.listOfVendors();
    //============================================= GRN for sale return order ============================= //
    $scope.SkuDetails = {};
    $scope.SaleReturnGrnInventory = {};
    $scope.showSaleReturnGRNDialog = function(ev,file,soData)
    {
        $scope.disableSubmitGrn = false;
        $scope.SaleReturnGrnInventory = {};
        console.log(file);
        console.log(soData);
        $('#SaleReturnGRNdata').modal('show');

        $scope.SkuDetails.GRnData = file;
        $scope.SkuDisabled = true;
        $scope.SkuDetails.ProductModel = file.tableSku.tableSkuName;
        $scope.SkuDetails.skuClientCode = file.tableSku.tableSkuClientSkuCode;
        $scope.SaleReturnGrnInventory.tableSku = file.tableSku;
        $scope.SaleReturnGrnInventory.tableWarehouseDetails = soData.tableWarehouseDetails;
        //if(soData.tableVendor.tableVendorName != null){
        //    $scope.SaleReturnGrnInventory.tableVendor = soData.tableVendor;
        //}
        $scope.SaleReturnGrnInventory.tableSkuInventoryExpectedInwardCount = file.tableSaleReturnSkuQuantity;
        //console.log(file.tablePurchaseOrderSkusSkuQuantity);

        console.log($scope.SaleReturnGrnInventory);

    };

    $scope.checkMspGrtMrp = function(mrp, msp) {
        if (msp > mrp) {
            $scope.notify("MSP Must Be Less than MRP")
            $scope.SaleReturnGrnInventory.tableSkuInventoryMinSalePrice = null;
        }
    };

    $scope.calcQCFailed = function () {

        if($scope.SaleReturnGrnInventory.tableSkuInventoryActualInwardCount == null || $scope.SaleReturnGrnInventory.tableSkuInventoryActualInwardCount == undefined)
        {
            return;
        }

        if($scope.SaleReturnGrnInventory.tableSkuInventoryAvailableCount == null || $scope.SaleReturnGrnInventory.tableSkuInventoryAvailableCount == undefined)
        {
            return;
        }

        $scope.SaleReturnGrnInventory.tableSkuInventoryInwardQcFailedCount = $scope.SaleReturnGrnInventory.tableSkuInventoryActualInwardCount - $scope.SaleReturnGrnInventory.tableSkuInventoryAvailableCount ;
        if($scope.SaleReturnGrnInventory.tableSkuInventoryInwardQcFailedCount < 0 ) {
            $scope.notify('QC Passed quantity cannot be greater than received quantity');
            $scope.SaleReturnGrnInventory.tableSkuInventoryAvailableCount = null;
            $scope.SaleReturnGrnInventory.tableSkuInventoryInwardQcFailedCount = null;
        }
    }

    $scope.SubmitGrn = function()
    {
        $scope.disableSubmitGrn = true;

        if($scope.SaleReturnGrnInventory.tableSkuInventoryMaxRetailPrice == null || $scope.SaleReturnGrnInventory.tableSkuInventoryMaxRetailPrice == undefined)
        {
            $scope.notify('MRP is required');
            $scope.disableSubmitGrn = false;
            return;
        }

        if($scope.SaleReturnGrnInventory.tableSkuInventoryActualInwardCount == null || $scope.SaleReturnGrnInventory.tableSkuInventoryActualInwardCount == undefined)
        {
            $scope.notify('Actual quantity is required');
            $scope.disableSubmitGrn = false;
            return;
        }

        if($scope.SaleReturnGrnInventory.tableSkuInventoryAvailableCount == null || $scope.SaleReturnGrnInventory.tableSkuInventoryAvailableCount == undefined)
        {
            $scope.notify('QC Passed quantity is required');
            $scope.disableSubmitGrn = false;
            return;
        }
        if($scope.SaleReturnGrnInventory.tableWarehouseDetails == null || $scope.SaleReturnGrnInventory.tableWarehouseDetails == undefined)
        {
            $scope.notify('Warehouse is required');
            $scope.disableSubmitGrn = false;
            return;
        }
        else
        {
            if($scope.SaleReturnGrnInventory.tableSkuInventoryAvailableCount > $scope.SaleReturnGrnInventory.tableSkuInventoryActualInwardCount )
            {
                $scope.notify('QC Passed quantity cannot be greater than actual received quantity');
                $scope.disableSubmitGrn = false;
                return;
            }
            else
            {
                $scope.SaleReturnGrnInventory.tableSkuInventoryInwardQcFailedCount = $scope.SaleReturnGrnInventory.tableSkuInventoryActualInwardCount - $scope.SaleReturnGrnInventory.tableSkuInventoryAvailableCount;
            }
        }

        if($scope.SkuDetails.GRnData.tableSku.tableSkuShelfLifeType.idtableSkuShelfLifeTypeId == 1)
        {
            if($scope.SaleReturnGrnInventory.tableSkuInventoryMfgDate == null || $scope.SaleReturnGrnInventory.tableSkuInventoryMfgDate == undefined)
            {
                $scope.notify('Manufacturing date is required');
                $scope.disableSubmitGrn = false;
                return;
            }
            if($scope.SaleReturnGrnInventory.tableSkuInventoryShelfLifeInDays == null || $scope.SaleReturnGrnInventory.tableSkuInventoryShelfLifeInDays == undefined)
            {
                $scope.notify('Shelf life is required');
                $scope.disableSubmitGrn = false;
                return;
            }
        }

        if($scope.SkuDetails.GRnData.tableSku.tableSkuShelfLifeType.idtableSkuShelfLifeTypeId == 2) {
            if ($scope.SaleReturnGrnInventory.tableSkuInventoryExpiryDate == null || $scope.SaleReturnGrnInventory.tableSkuInventoryExpiryDate == undefined) {
                $scope.notify('Expiry date is required');
                $scope.disableSubmitGrn = false;
                return;
            }
        }

        $scope.SaleReturnGrnInventory.tableSkuInventoryMfgDate = moment($scope.SaleReturnGrnInventory.tableSkuInventoryMfgDate).format("YYYY-MM-DD");
        $scope.SaleReturnGrnInventory.tableSkuInventoryExpiryDate = moment($scope.SaleReturnGrnInventory.tableSkuInventoryExpiryDate).format("YYYY-MM-DD");

        var Postdata = $scope.SaleReturnGrnInventory;

        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/salereturnsku/'+$scope.SkuDetails.GRnData.idtableSaleReturnSkuId+'/quickgrn',
            data: Postdata,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(data){
            if($scope.SaleReturnGrnInventory.tableSkuInventoryInwardQcFailedCount > 0){
                $('#ConfirmClaimGrnDialog').modal('show');
            }else{
                $('#SaleReturnGRNdata').modal('hide');
                $scope.notify('GRN successful','success');
                $scope.SaleReturnGrnInventory ={};
                $scope.listOfStatesCount($scope.defaultTab);

                for (var i = 0; i < $scope.orderLists.length; i += 1) {
                    $scope.dayDataCollapse[i] = false;
                }
            }
        }).error(function(data){
            $scope.notify(data.documentation);
            $scope.disableSubmitGrn = true;
            console.log(data);
        });
    };

    $scope.showRaiseClaimDialog = function (tableSaleReturnSku , mode)
    {
        $scope.claimObj = {};
        $scope.genericData.skuForClaim = tableSaleReturnSku;
        $scope.genericData.claimMode = mode;
        $scope.SkuDetails.GRnData = {};
        $scope.SkuDetails.GRnData   = tableSaleReturnSku;
        $scope.SaleReturnGrnInventory = tableSaleReturnSku.tableSkuInventory;
        if(mode == 'edit')
        {
            $scope.claimObj = tableSaleReturnSku.tableSaleReturnClaims[0];
        }

        $('#ClaimGrnDataDialog').modal('show');
    }


    //========================== claim for bad quantity grn ======================================== //

    $scope.ClaimConformationAction = function(confirmationValue)
    {

        if(confirmationValue == true)
        {
            $scope.genericData.claimMode = 'add';
            $('#ClaimGrnDataDialog').modal('show');
        }
        else
        {
            $('#ConfirmClaimGrnDialog').modal('hide');
        }
    };

    //================================================= ends here =========================================== //

    $scope.cancelSingleOrdersReturnClaimDialog = function(){
        $scope.claimObj = {};
        $('#ConfirmClaimGrnDialog').modal('hide');
        $('#ClaimGrnDataDialog').modal('hide');
        $('#SaleReturnGRNdata').modal('hide');
    };

    $scope.ViewDownloadBtn = 'success';
    $scope.downloadLink = function(value) {
        console.log(value);
        $scope.ViewDownloadBtn = value;
    };


    $scope.ClaimSku = function(skuDetails,skuInventory,ClaimEntity)
    {
        var claimSkuUrl,Postdata,method;

        Postdata = $scope.claimObj;
        if($scope.genericData.claimMode == 'add')
        {
            claimSkuUrl = MavenAppConfig.baseUrlSource+"/omsservices/webapi/salereturnsku/" + skuDetails.idtableSaleReturnSkuId + "/salereturnclaim?claimfrom=" + ClaimEntity;
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
                $('#ClaimGrnDataDialog').modal('hide');
                $('#ConfirmClaimGrnDialog').modal('hide');
                $('#SaleReturnGRNdata').modal('hide');
                $scope.listOfStatesCount($scope.defaultTab);
            }).error(function(error, status)
            {
                if(status == 400)
                {
                    $scope.notify(error.errorMessage);
                }
                else
                {
                    $scope.notify('Failed to raise claim');
                }
                $('#ClaimGrnDataDialog').modal('hide');
                $('#ConfirmClaimGrnDialog').modal('hide');
                $('#SaleReturnGRNdata').modal('hide');
            });
        }
        if($scope.genericData.claimMode == 'edit')
        {
            claimSkuUrl = MavenAppConfig.baseUrlSource+"/omsservices/webapi/salereturnsku/" + skuDetails.idtableSaleReturnSkuId + "/salereturnclaim/" + $scope.claimObj.idtableSaleReturnClaimId + "?claimfrom="+ClaimEntity;
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
                $('#ClaimGrnDataDialog').modal('hide');
                $('#ConfirmClaimGrnDialog').modal('hide');
                $('#SaleReturnGRNdata').modal('hide');
                $scope.listOfStatesCount($scope.defaultTab);
            }).error(function(error, status)
            {
                if(status == 400)
                {
                    $scope.notify(error.errorMessage);
                }
                else
                {
                    $scope.notify('Failed to update claim');
                }
                $('#ClaimGrnDataDialog').modal('hide');
                $('#ConfirmClaimGrnDialog').modal('hide');
                $('#SaleReturnGRNdata').modal('hide');
            });
        }

    };

    $scope.onRecordsPerPageChange = function (orderSize) {
        $scope.start = 0;
        $scope.orderSize = orderSize;
        $scope.end = 0;
        $scope.orderLists = [];
        $scope.listOfStatesCount($scope.defaultTab, 1);
    }
    // fetching count details of states of different orders.
    $scope.listOfStatesCount = function(tabsValue, page, action) {
        $scope.defaultTab = tabsValue;
        $scope.orderLists = [];
        $scope.showLoader = true;
        $scope.allCount = 0;
        $scope.newCount = 0;
        $scope.processCount = 0;
        $scope.returnCount = 0;
        $scope.cancelledCount = 0;
        $scope.shippingCount = 0;
        $scope.returnCount = 0;

        var newCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/salereturn/filtercount?state=new&uipagename="+$scope.pagename;
        var qcCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/salereturn/filtercount?state=qccomplete&uipagename="+$scope.pagename;
        var grnCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/salereturn/filtercount?state=grn&uipagename="+$scope.pagename;
        var cancelledCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/salereturn/filtercount?state=cancelled&uipagename="+$scope.pagename;
        var allCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/salereturn/filtercount?uipagename="+$scope.pagename;

        if (!$scope.filter.saleChannel)
        {
            newCountUrl += "&saleschannelid=0";
            qcCountUrl += "&saleschannelid=0";
            grnCountUrl += "&saleschannelid=0";
            cancelledCountUrl += "&saleschannelid=0";
            allCountUrl += "saleschannelid=0";
        }
        else
        {
            var salechannelqueryparam = "&saleschannelid=" + $scope.filter.saleChannel.idtableSalesChannelValueInfoId;
            newCountUrl += salechannelqueryparam;
            qcCountUrl += salechannelqueryparam;
            grnCountUrl += salechannelqueryparam;
            cancelledCountUrl += salechannelqueryparam;
            allCountUrl += salechannelqueryparam;

        }
        if ($scope.filter.skuId)
        {
            var skuqueryparam = "&skuid=" + $scope.filter.skuId;
            newCountUrl += skuqueryparam;
            qcCountUrl += skuqueryparam;
            grnCountUrl += skuqueryparam;
            cancelledCountUrl += skuqueryparam;
            allCountUrl += skuqueryparam;

        }
        if ($scope.filter.customerid)
        {
            var customerqueryparam = "&customerid=" + $scope.filter.customerid;
            newCountUrl += customerqueryparam;
            qcCountUrl += customerqueryparam;
            grnCountUrl += customerqueryparam;
            cancelledCountUrl += customerqueryparam;
            allCountUrl += customerqueryparam;

        }
        if ($scope.filter.startDate)
        {
            var startdatequeryparam = "&startDate=" + $scope.filter.startDate;
            newCountUrl += startdatequeryparam;
            qcCountUrl += startdatequeryparam;
            grnCountUrl += startdatequeryparam;
            cancelledCountUrl += startdatequeryparam;
            allCountUrl += startdatequeryparam;

        }
        if ($scope.filter.endDate)
        {
            var enddatequeryparam = "&endDate=" + $scope.filter.endDate;
            newCountUrl += enddatequeryparam;
            qcCountUrl += enddatequeryparam;
            grnCountUrl += enddatequeryparam;
            cancelledCountUrl += enddatequeryparam;
            allCountUrl += enddatequeryparam;

        }
        if ($scope.filter.orderref)
        {
            var orderidqueryparam = "&orderref=" + $scope.filter.orderref;
            newCountUrl += orderidqueryparam;
            qcCountUrl += orderidqueryparam;
            grnCountUrl += orderidqueryparam;
            cancelledCountUrl += orderidqueryparam;
            allCountUrl += orderidqueryparam;

        }

        if ($scope.filter.orderid)
        {
            var orderidqueryparam = "&orderid=" + $scope.filter.orderid;
            newCountUrl += orderidqueryparam;
            qcCountUrl += orderidqueryparam;
            grnCountUrl += orderidqueryparam;
            cancelledCountUrl += orderidqueryparam;
            allCountUrl += orderidqueryparam;

        }

        var promises = [
            $http.get(allCountUrl),
            $http.get(newCountUrl),
            $http.get(qcCountUrl),
            $http.get(grnCountUrl),
            $http.get(cancelledCountUrl)
        ]
        $q.all(promises)
            .then(function (response) {

                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = pagerService.GetPager(vm.dummyItems.length, page,$scope.orderSize);
                    console.log(vm.pager);
                    $scope.vmPager = vm.pager;
                    $scope.start = (vm.pager.currentPage - 1) * $scope.orderSize;
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    if (action == 'clearAction') {
                        $scope.listOfOrderReturn(tabsValue, $scope.start, 'clearAction');
                    } else {
                        $scope.listOfOrderReturn(tabsValue, $scope.start);
                    }
                }
                $scope.allCount = response[0].data;
                $scope.newCount = response[1].data;
                $scope.QCCount = response[2].data;
                $scope.grnCount = response[3].data;
                $scope.cancelledCount = response[4].data;

                var vm = this;
                vm.pager = {};

                if (tabsValue == 'all') {
                    vm.dummyItems = _.range(0, $scope.allCount);
                }
                else if(tabsValue == 'new'){
                    vm.dummyItems = _.range(0, $scope.newCount);
                }
                else if(tabsValue == 'qccomplete'){
                    vm.dummyItems = _.range(0, $scope.QCCount);
                }
                else if(tabsValue == 'grn'){
                    vm.dummyItems = _.range(0, $scope.grnCount);
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
            .catch(function (error) {

            })

    };


    // getting all list of orders (all the orders)
    $scope.listOfOrderReturn = function(tabsValue, start, action) {
        $scope.defaultTab = tabsValue;
        var orderListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/salereturn?uipagename="+$scope.pagename;
        if ($scope.defaultTab == 'all')
            orderListUrl += "&start=" + start + "&size="+$scope.orderSize+"&sort=" + $scope.sortType + "&direction=" + $scope.directionType;
        if ($scope.defaultTab != 'all')
            orderListUrl += "&start=" + start + "&size="+$scope.orderSize+"&sort=" + $scope.sortType + "&direction=" + $scope.directionType + "&state=" + tabsValue;
        if (!$scope.filter.saleChannel) {
            orderListUrl += "&saleschannelid=0";
        } else {
            orderListUrl += "&saleschannelid=" + $scope.filter.saleChannel.idtableSalesChannelValueInfoId;
        }
        if ($scope.filter.skuId) {
            orderListUrl += "&skuid=" + $scope.filter.skuId;
        }
        if ($scope.filter.customerid) {
            orderListUrl += "&customerid=" + $scope.filter.customerid;
        }
        if ($scope.filter.startDate) {
            orderListUrl += "&startDate=" + $scope.filter.startDate;
        }
        if ($scope.filter.endDate) {
            orderListUrl += "&endDate=" + $scope.filter.endDate;
        }
        if ($scope.filter.orderid) {
            orderListUrl += "&orderid=" + $scope.filter.orderid;
        }
        if ($scope.filter.orderref) {
            orderListUrl += "&orderref=" + $scope.filter.orderref;
        }
        $http.get(orderListUrl).success(function(data)
        {
            $scope.orderLists = data;
            $scope.tableRowExpanded = false;
            $scope.tableRowIndexExpandedCurr = "";
            $scope.tableRowIndexExpandedPrev = "";
            $scope.storeIdExpanded = "";
            $scope.end = $scope.start + data.length;
            $scope.showOrderLevelAction(data);

            $scope.dayDataCollapse = [];

            for (var i = 0; i < $scope.orderLists.length; i += 1) {
                $scope.dayDataCollapse.push(false);
            }
            $scope.showLoader = false;
        }).error(function(error, status) {
            $scope.showLoader = false;

        });
    };

    $scope.listOfStatesCount($scope.defaultTab, 1);



    $scope.listOfChannels = function() {
        $scope.channelNamesData = [];
        var channelListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/saleschannels?uipagename="+$scope.pagename;
        // console.log(channelListUrl);
        $http.get(channelListUrl).success(function(data) {
            console.log(data);
            $scope.channelLists = data;

            for (var i = 0; i < $scope.channelLists.length; i++) {
                if ($scope.channelLists[i].tableSalesChannelMetaInfo.tableSalesChannelType.idtableSalesChannelTypeId == 2) {
                    $scope.channelNamesData.push($scope.channelLists[i]);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };
    $scope.searchSaleReturnOrders = function(){
        $scope.submitAction();
    }
    $scope.submitAction = function() {
        $scope.directionType = "desc";
        $scope.sortReverse = false;
        console.log($scope.filter);

        if ($scope.filter.start1Date != undefined) {
            $scope.filter.startDate = moment.utc($scope.filter.start1Date).format();
        }
        if ($scope.filter.end1Date != undefined) {
            $scope.filter.endDate = moment.utc($scope.filter.end1Date).format();
        }

        $scope.exportFile = true;
        $scope.isSubmitDisabled = true;
        $scope.isResetFilter = false;
        $scope.listOfStatesCount($scope.defaultTab, 1);
    };

    if ($window.localStorage.getItem("saleReturnFilter") !== null) {
        var saleReturnField = JSON.parse($window.localStorage.getItem("saleReturnFilter"));
        $scope.filter.orderid = saleReturnField.orderid;
        $scope.filter.saleChannel = saleReturnField.saleChannel;
        $scope.filter.start1Date = saleReturnField.startDate;
        $scope.filter.end1Date = saleReturnField.endDate;
        $scope.filter.sku = saleReturnField.sku;
        $scope.selectedCustomer = saleReturnField.customer;
        $scope.filter.skuId = saleReturnField.sku ? saleReturnField.sku.idtableSkuId : null;
        $scope.customerid = saleReturnField.customer ? saleReturnField.customer.idtableCustomerId : 0;
        $scope.submitAction();

    }

    //clear filter for clearing applied filters
    $scope.clearAction = function() {
        $scope.sortType = "tableSaleReturnSystemOrderNo";
        $scope.directionType = "desc";
        $scope.sortReverse = false;

        $scope.clearStartDate();
        $scope.clearEndDate();

        $scope.filter = {};
        $scope.selectedCustomer = {};
        $scope.skuId = null;
        $scope.customerid = null;
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        $scope.$broadcast('angucomplete-alt:clearInput', 'productsfilter');
        $scope.$broadcast('angucomplete-alt:clearInput', 'customersfilter');
        $scope.listOfStatesCount($scope.defaultTab, 1, 'clearAction');
        $window.localStorage.removeItem('saleReturnFilter');
        $window.localStorage.removeItem('inboundTab');
    }
    $scope.newTab = function(){
        if(Object.keys($scope.filter).length || $scope.filter.sku || $scope.selectedCustomer){
            var saleReturnField = {
                sku : $scope.filter.sku,
                customer : $scope.selectedCustomer,
                orderid:$scope.filter.orderid,
                saleChannel:$scope.filter.saleChannel,
                startDate:$scope.filter.start1Date,
                endDate:$scope.filter.end1Date
            }
            $window.localStorage.setItem('saleReturnFilter',JSON.stringify(saleReturnField))
        }
        $window.open($location.absUrl(), "_blank");
    }

    $scope.searchedProduct = function(selected) {
        if (selected != null) {
            $scope.skuId = selected.originalObject.idtableSkuId;
        }
    };

    $scope.searchedProductForFilter = function(selected) {
        if (selected != null && selected != undefined)
        {
            $scope.filter.sku = selected.originalObject;
            $scope.filter.skuId = selected.originalObject.idtableSkuId;
        }else{
            $scope.filter.skuId = undefined;
        }
    };

    $scope.searchedCustomer = function(selected) {
        if (selected != null && selected != undefined) {
            $scope.customerid = selected.originalObject.idtableCustomerId;
        }else{
            $scope.customerid = undefined;
        }
    };

    $scope.searchedCustomerForFilter = function(selected)
    {
        if (selected != null && selected != undefined) {
            $scope.selectedCustomer = selected.originalObject;
            $scope.filter.customerid = selected.originalObject.idtableCustomerId;
        }else{
            $scope.filter.customerid = undefined;
        }
    };

    $scope.exportOrderReturnDataFile = function(){
        $('#exportOrderReturnFile').modal('show');
    };


    $scope.totalQuantity = function(allSkus){
        var total = 0;
        for (var i = 0; i < allSkus.length; i++) {
            var quantity = allSkus[i].tableSaleReturnSkuQuantity;
            total += quantity;
        }
        return total;
    }

    $scope.totalCostAmount = function(allSkus) {
        var totalCostAmount = 0;
        var totalCostAll = [];
        for (var i = 0; i < allSkus.length; i++) {
            totalCostAmount += allSkus[i].netGrandTotal;
            totalCostAll.push(totalCostAmount);
        }
        return totalCostAmount ? totalCostAmount.toFixed(2) : 0;
    }

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


    $scope.selectTableRow = function(index) {
        if (typeof $scope.dayDataCollapse === 'undefined') {
            $scope.dayDataCollapseFn();
        }
        if ($scope.tableRowExpanded === false && $scope.tableRowIndexExpandedCurr === "") {
            $scope.tableRowIndexExpandedPrev = "";
            $scope.tableRowExpanded = true;
            $scope.tableRowIndexExpandedCurr = index;
            $scope.dayDataCollapse[index] = true;
        } else if ($scope.tableRowExpanded === true) {
            if ($scope.tableRowIndexExpandedCurr === index) {
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

    //=============================== Print packing Lables ================================== //
    //== will be view after wharehouse allocated and wharehouse informed, wh_picked.. id= 8 , 9 , 11

    $scope.printPreview = function(response){
        $http.get(MavenAppConfig.baseUrlSource+MavenAppConfig.commonPathUrl+response.previewLink
            ,{responseType: 'arraybuffer'}
        ).success(function(data) {
                $('#printLabels').modal('show');
                console.log(data);
                var file = new Blob([(data)], {
                    type: 'application/pdf'
                });
                var fileURL = URL.createObjectURL(file);
                $scope.content = $sce.trustAsResourceUrl(fileURL);
            }).error(function(error){
                console.log(error);
            });
    };

    $scope.cancelshippingNumberDialog = function(){
        // $mdDialog.hide();
        $('#shippingNumber').modal('hide');
    };


    $scope.addDeliveryAddressMode = function() {
        $scope.addDeliveryClicked = true;
    };

    $scope.chooseDeliveryAddressMode = function() {
        $scope.addDeliveryClicked = false;
    };

    $scope.customerObj = function(selected)
    {
        var q = $q.defer();
        if (selected != null) {
            console.log(selected);
            $scope.singleorderReturnData.tableCustomer = selected.originalObject;

            $scope.deliveryAddresses(selected.originalObject.idtableCustomerId).then(
                function(v) {
                    $scope.custName = selected.originalObject.tableCustomerFirstName;
                    if (selected.originalObject.tableCustomerLastName && selected.originalObject.tableCustomerLastName != null && selected.originalObject.tableCustomerLastName != null) {
                        $scope.custName += " " + selected.originalObject.tableCustomerLastName;
                    }
                    $scope.$broadcast("angucomplete-alt:changeInput", "customers", $scope.custName);
                    q.resolve(true);
                },
                function(err) {
                    q.reject(false);
                }
            );
        }
        return q.promise;
    }


    $scope.productObject = function(selected) {
        if (selected != null)
        {
            console.log(selected);
            $scope.isProductSelected = true;
            $scope.searchedSku = selected.originalObject;
        }
        else
        {
            $scope.isProductSelected = false;
        }
    };

    $scope.customerChanged = function(str) {
        console.log(str);
        if (str == '') {
            $scope.custName = null;
            $scope.deliveryAddressArray = null;
        }
    };
    $scope.showAddOrderReturnModal = function(ev) {

        $scope.salesChannelSelected = false;
        $scope.deliveryAddressSelected = false;
        $scope.orderNumberEntered = false;
        $scope.singleorderReturnData.tableSalesChannelValueInfo = null;
        $('#confirmSaleOrderReturnDialog').modal('show');
        
    };

    $('#addSaleReturnDialogRefUnknown').on('show.bs.modal' , function (e){
        $( "#ordertabs a:first"  ).tab('show');
    });

    $('#addSaleReturnDialogRefKnown').on('show.bs.modal' , function (e){
        $( "#ordertabswithoutref a:first"  ).tab('show');
    });


    $scope.togglePaymentTypeSubmittedValue = function(paymentType) {
        if (paymentType) {
            $scope.paymentTypeSelected = false;
        } else {
            $scope.paymentTypeSelected = true;
        }
    };

    $scope.setFormButtonValue = function (value) {
        $scope.submitActionButton = value;
    }
    $scope.submitAddSaleReturnOrderForm = function (form) {
        if($scope.singleOrderReturnMode != 'edit' && $scope.singleOrderReturnMode != 'copy' && $scope.submitActionButton == 'save'){
            $scope.saveSingleOrderReturn(form);
        }
        else if($scope.singleOrderReturnMode == 'edit'  && $scope.submitActionButton == 'update'){
            $scope.updateSingleOrderReturn(form);
        }
        else if($scope.singleOrderReturnMode == 'copy'  && $scope.submitActionButton == 'add'){
            $scope.updateSingleOrderReturn(form);
        }
    }

    $scope.saveSingleOrderReturn = function(form){

        $scope.singleorderReturnDataCopy = angular.copy($scope.singleorderReturnData);

        var totalReturnQty = 0;
        for(var index = 0; index < $scope.singleorderReturnDataCopy.tableSaleReturnSkus.length; index++)
        {
            totalReturnQty+= $scope.singleorderReturnDataCopy.tableSaleReturnSkus[index].tableSaleReturnSkuQuantity;
        }
        if(totalReturnQty <=0)
        {
            $scope.notify("Return quantity shall be greater than 0");
            return;
        }

        if($scope.singleorderReturnData.tableSaleReturnPickUpDateTime != null && $scope.singleorderReturnData.tableSaleReturnPickUpDateTime != undefined && $scope.singleorderReturnData.tableSaleReturnPickUpDateTime != ""){
            $scope.singleorderReturnDataCopy.tableSaleReturnPickUpDateTime = moment.utc($scope.singleorderReturnData.tableSaleReturnPickUpDateTime).format();
        }
        if($scope.singleorderReturnData.tableSaleReturnDropDateTime != null && $scope.singleorderReturnData.tableSaleReturnDropDateTime != undefined && $scope.singleorderReturnData.tableSaleReturnDropDateTime != ""){
            $scope.singleorderReturnDataCopy.tableSaleReturnDropDateTime = moment.utc($scope.singleorderReturnData.tableSaleReturnDropDateTime).format();
        }
        $http({
            method: 'POST',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/salereturn',
            data: $scope.singleorderReturnDataCopy,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res){
            if (res){
                $scope.singleOrderReturnMsg = 'Submitted successfully';
                $scope.listOfStatesCount($scope.defaultTab, 1);
                if ($scope.singleOrderReturnMode == "add") {
                    $scope.notify("Order Added Successfully",'success');
                } else if ($scope.singleOrderReturnMode == "copy") {
                    $scope.notify("Order Copied Successfully",'success');
                }
                $scope.cancelSingleOrderReturn(form);
            }
        }).error(function(error, status) {
            $scope.cancelSingleOrderReturn(form);
            if (status == 400) {
                $scope.notify(error.errorMessage ? error.errorMessage : "Failed to add return order");
            }
            else {
                $scope.notify("Failed to add return order");
            }
        });
        $('#addSaleReturnDialogRefUnknown').modal('hide');
        $('#addSaleReturnDialogRefKnown').modal('hide');

    };

    $scope.updateSingleOrderReturn = function(form)
    {
        var httpMethod,requestUrl;
        $scope.singleorderReturnDataCopy = angular.copy($scope.singleorderReturnData);
        if($scope.singleorderReturnData.tableSaleReturnPickUpDateTime != null && $scope.singleorderReturnData.tableSaleReturnPickUpDateTime != undefined)
        {
            $scope.singleorderReturnDataCopy.tableSaleReturnPickUpDateTime = moment.utc($scope.singleorderReturnData.tableSaleReturnPickUpDateTime).format();
        }
        if($scope.singleorderReturnData.tableSaleReturnDropDateTime != null && $scope.singleorderReturnData.tableSaleReturnDropDateTime != undefined)
        {
            $scope.singleorderReturnDataCopy.tableSaleReturnDropDateTime = moment.utc($scope.singleorderReturnData.tableSaleReturnDropDateTime).format();
        }

        if($scope.singleOrderReturnMode == 'edit'){
            httpMethod = 'PUT';
            requestUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/salereturn/'+$scope.singleorderReturnData.idtableSaleReturnId;
        }else{
            httpMethod = 'POST';
            requestUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/salereturn';
        }
        $http({
                method: httpMethod,
                url: requestUrl,
                data: $scope.singleorderReturnDataCopy,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res){
                if (res){
                    $scope.singleOrderReturnMsg = 'Submitted successfully';
                    $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                    if ($scope.singleOrderReturnMode == "add") {
                        $scope.notify("Order Added Successfully",'success');
                    } else if ($scope.singleOrderReturnMode == "copy") {
                        $scope.notify("Order Copied Successfully",'success');
                    }
                    if ($scope.singleOrderReturnMode == "edit") {
                        $scope.notifys("Order Updated Successfully",'success');
                    }
                    $scope.cancelSingleOrderReturn(form);
                }
            }).error(function(error, status) {
                $scope.cancelSingleOrderReturn(form);
                if (status == 400) {
                    $scope.notify(error.errorMessage);
                }
                else {
                    $scope.notify("Failed to add return order");
                }
            })
        
    };

    $scope.onSaleReferenceNumberOptionChanged = function (salerefknown, ev)
    {
        $scope.initDateLimits();
        $scope.genericData.saleRefKnown = salerefknown;
        if($scope.genericData.saleRefKnown == true)
        {
            $('#addSaleReturnDialogRefKnown').on('show.bs.modal' , function (e){
                $( "#ordertabs a:first"  ).tab('show');
            });

            $('#addSaleReturnDialogRefKnown').modal('show');
        }
        if($scope.genericData.saleRefKnown == false)
        {
            $scope.$broadcast('angucomplete-alt:clearInput', 'products');

            $('#addSaleReturnDialogRefUnknown').on('show.bs.modal' , function (e){
                $( "#ordertabswithoutref a:first"  ).tab('show');
            });

            $('#addSaleReturnDialogRefUnknown').modal('show');

        }
        $('#confirmSaleOrderReturnDialog').modal('hide');
    }

    $scope.updateSingleOrderReturnConfirmed = function() {
        var shipmentDate = null;
        var deliveryDate = null;
        if($scope.singleorderReturnData.tableSaleOrderLatestShippngDate != null && $scope.singleorderReturnData.tableSaleOrderLatestShippngDate != undefined){
            shipmentDate = moment.utc($scope.singleorderReturnData.tableSaleOrderLatestShippngDate).format();
        }
        if($scope.singleorderReturnData.tableSaleOrderLatestDeliveryDate != null && $scope.singleorderReturnData.tableSaleOrderLatestDeliveryDate != undefined){
            deliveryDate = moment.utc($scope.singleorderReturnData.tableSaleOrderLatestDeliveryDate).format();
        }
        var postData = {
            "idtableSaleOrderId": $scope.updateOrderId,
            "tableSaleOrderClientOrderNo": $scope.singleorderReturnData.orderNo,
            "tableSalesChannelValueInfo": $scope.singleorderReturnData.channelObject,
            "tableAddressByTableSaleOrderShipToAddressId": $scope.singleorderReturnData.deliveryAddress,
            "tableCustomer": $scope.singleorderReturnData.customerObj,
            "tableSaleOrderPaymentType": $scope.singleorderReturnData.paymentObject,
            "tableSaleOrderSkuses": $scope.products,
            "tableSaleOrderRemarks":$scope.singleorderReturnData.tableSaleOrderRemarks,
            "tableSaleOrderScDateTime":moment.utc($scope.singleorderReturnData.tableSaleOrderScDateTime).format(),
            "tableSaleOrderLatestDeliveryDate":deliveryDate,
            "tableSaleOrderLatestShippngDate": shipmentDate
        }
        console.log(postData);
        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/' + $scope.updateOrderId + '/update',
            data: postData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                $scope.singleOrderReturnMsg = 'Submitted successfully';
                $scope.orderNo = '';
                $scope.product = '';
                $scope.deliveryAddress = '';
                $scope.customer = '';
                $scope.popupChannel = '';
                $scope.payment = '';
                $scope.singleorderReturnData = {};
                postData = null;
                $scope.products = [];
                // $scope.listOfOrderReturn($scope.defaultTab, 0);
                $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                $scope.notify("Order Updated Successfully",'success');
                $scope.cancelSingleOrderReturn();
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            if(status == 400){
                $scope.notify(error.errorMessage);
            }else {
                $scope.notify("Order Cant be Added");
            }
        });
    };

    //cancel single order
    $scope.cancelSingleOrderReturn = function(form) {

        $('#addSaleReturnDialogRefUnknown').modal('hide');
        $('#addSaleReturnDialogRefKnown').modal('hide');
        $scope.$broadcast("angucomplete-alt:clearInput", "customers");


        $scope.initSingleOrderReturnData();
        $scope.deliveryAddressArray = [];
        $scope.custName = null;
        $scope.singleOrderReturnMode = "add";
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

    $scope.deliveryAddresses = function(customerId) {
        var q = $q.defer();

        console.log("Hello");
        $scope.deliveryAddressArray = [];
        var deliveryAddressUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/' + customerId + '/shippingaddress';
        $http.get(deliveryAddressUrl).success(function(data)
        {
            if(data != null)
            {
                for (var i = 0; i < data.length; i++) {
                    $scope.deliveryAddressArray.push(data[i].tableAddress);
                }
            }
            q.resolve(true);
        }).error(function(error, status) {
            q.reject(false);
            console.log(error);
            console.log(status);

        });
        return q.promise;
    };

    $scope.changeIndex = function(index) {
        console.log(index);
    };

    $scope.stateTrials = function(saleordskus) {
        console.log(saleordskus);
        console.log(saleordskus.length);
        $scope.trialsDataArray = [];
        $scope.trialIdArray = [];
        $scope.trialsLength = [];
        $scope.fullTrialsArray = [];
        $scope.fullIdArray = [];
        for (var i = 0; i < saleordskus.length; i++) {
            console.log(i);
            console.log(saleordskus[i]);
            var trials = saleordskus[i].tableSaleReturnSkuStateTrails;
            $scope.trialsLength.push(trials.length);
            console.log(trials);
            if (trials.length < 4) {
                for (var j = 0; j < trials.length; j++) {
                    $scope.trialsDataArray.push(trials[j].tableSaleReturnSkuStateType.tableSaleReturnSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tableSaleReturnSkuStateType.idtableSaleReturnSkuStateTypeId);
                }
            }

            if (trials.length == 4) {
                for (var j = 0; j < trials.length; j++) {
                    console.log(trials[j].tableSaleReturnSkuStateType.tableSaleReturnSkuStateTypeString);
                    $scope.trialsDataArray.push(trials[j].tableSaleReturnSkuStateType.tableSaleReturnSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tableSaleReturnSkuStateType.idtableSaleReturnSkuStateTypeId);
                }
            }

            if (trials.length > 4) {
                console.log(trials.length - 4);
                var totalLength = trials.length - 4;
                for (var j = totalLength; j < trials.length; j++) {
                    console.log(trials[j].tableSaleReturnSkuStateType.tableSaleReturnSkuStateTypeString);
                    $scope.trialsDataArray.push(trials[j].tableSaleReturnSkuStateType.tableSaleReturnSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tableSaleReturnSkuStateType.idtableSaleReturnSkuStateTypeId);
                }
            }


            $scope.fullTrialsArray.push($scope.trialsDataArray);
            $scope.fullIdArray.push($scope.trialIdArray);

            $scope.trialsDataArray = [];
            $scope.trialIdArray = [];

            console.log($scope.fullTrialsArray);
        }
    };


    // adding the product in table one by one
    $scope.addProduct = function(tableSku)
    {
        if (!$scope.searchedSku)
        {
            $scope.notify("Please search and select a product first!");
        }
        else if (!$scope.saleReturnFormData.returnQuantity)
        {
            $scope.notify("Please enter the product quantity!");
        }
        else if ($scope.saleReturnFormData.returnQuantity < 1)
        {
            $scope.notify("Please enter return quantity greater than 0!");
        }
        else
        {
            for (var i = 0; i < $scope.singleorderReturnData.tableSaleReturnSkus.length; i++)
            {
                if ($scope.singleorderReturnData.tableSaleReturnSkus[i].tableSku.idtableSkuId == tableSku.idtableSkuId)
                {
                    $scope.notify("The selected SKU is already part of the current order. Delete the existing item first to add updated quantity.");
                    return;
                }
            }
            var tempObject = {
                tableSku : $scope.searchedSku,
                tableSaleReturnSkuQuantity: $scope.saleReturnFormData.returnQuantity
            };

            $scope.singleorderReturnData.tableSaleReturnSkus.push(tempObject);
            $scope.$broadcast('angucomplete-alt:clearInput', 'products');
            $scope.saleReturnFormData.returnQuantity = null;
            $scope.searchedSku = null;

        }
    };

    //remove the product
    $scope.removeProduct = function(index) {
        $scope.genericData.deleteItemIndex = index;
        $('#masterDeleteDialogue').modal('show');
    };
    $scope.deleteSelectedItem = function(){
        $scope.singleorderReturnData.tableSaleReturnSkus.splice($scope.genericData.deleteItemIndex, 1);
        $scope.cancelmasterDeleteDialog();
        $scope.notify('Item deleted successfully.','success');
    };
    $scope.cancelmasterDeleteDialog = function(){
        $('#masterDeleteDialogue').modal('hide');
    };

    //load the return warehouses from backend for select return warehouse in timeline feature.
    $scope.loadReturnWareHouses = function(orderId, tableSaleOrderId) {
        var q = $q.defer();
        console.log(orderId);
        console.log(tableSaleOrderId);
        orderId = 1;
        tableSaleOrderId = 1;
        console.log("Hello");
        $scope.returnwareHousesArray = [];
        var returnwareHousesUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/' + orderId + '/orderskus/' + tableSaleOrderId + '/returnwarehouses';
        $http.get(returnwareHousesUrl).success(function(data) {
            for (var i = 0; i < data.length; i++) {
                $scope.returnwareHousesArray.push(data[i]);
            }
            q.resolve(true);
            console.log($scope.returnwareHousesArray);
        }).error(function(error, status) {
            q.reject(false);
            console.log(error);
            console.log(status);

        });
        return q.promise;
    };

    //load the shipping carriers from backend in timeline feature.
    $scope.loadShippingCarriers = function(orderId, tableSaleOrderId, tableSkuData, saleChannelId) {
        var q = $q.defer();
        console.log(orderId);
        console.log(tableSaleOrderId);
        if (saleChannelId != 1) {
            $scope.shippingCarrierArray = [];
            var shippingCarrierUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/' + orderId + '/shipping/' + tableSaleOrderId;
            $http.get(shippingCarrierUrl).success(function(data) {
                console.log(data);
                $scope.shippingCarrierArray = data.availableShippingServices;
                console.log($scope.shippingCarrierArray);
                q.resolve(true);
            }).error(function(error, status) {
                console.log(error);
                console.log(status);
                q.reject(false);

            });
            return q.promise;
        }

        if (saleChannelId == 1) {
            $scope.shippingCarrierArray = [];
            var shippingCarrierUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/schedulepickup/' + orderId + '/' + tableSaleOrderId;
            $http({
                method: 'GET',
                url: shippingCarrierUrl,
                headers: {
                    'Content-Type': 'application/octet-stream'
                }
            }).success(function(res) {
                console.log(res);
                $scope.redirectToFileUploadUrl = function() {
                    $window.open('https://www.google.com', '_blank');
                };
                $scope.redirectToFileUploadUrl();
            }).error(function(error, status) {
                console.log(error);
                console.log(status);

                $scope.redirectToFileUploadUrl = function() {
                    $window.open('https://www.google.com', '_blank');
                };
                $scope.redirectToFileUploadUrl();
            });
        }
    }


    $scope.loadCancelReasons = function() {
        var cancelReasonsUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/salereturncancelreason';
        $http.get(cancelReasonsUrl).success(function(data) {
            console.log(data);
            $scope.cancelReasonArray = data;
            console.log($scope.cancelReasonArray);
            $scope.LoadNewRason = {};
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            $scope.LoadNewRason = {};
        });
    }

    $scope.loadReturnReasons = function() {
        $scope.returnReasonArray = [];
        var returnReasonsUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/salereturnreason';
        $http.get(returnReasonsUrl).success(function(data) {
            console.log(data);
            $scope.returnReasonArray = data;
        }).error(function(error, status)
        {
            console.log(error);
            console.log(status);

        });
    }

    $scope.loadReturnReasons();

    $scope.list1 = $scope.arrayHeaderList;
    $scope.list = [];

    $scope.sortableOptions = {
        // placeholder: "app",
        // connectWith: ".apps-container",
        cursor: "move",
        update: function(e, ui) {
            fromIndex = ui.item.sortable.index;
            toIndex = ui.item.sortable.dropindex;
            console.log(fromIndex);
            console.log(toIndex);
            var a = $scope.arrayHeaderList;
            $scope.arrayHeaderList = arraymove(a, fromIndex, toIndex);
        }
    };

    $scope.ansortableOptions = {
        placeholder: "app",
        connectWith: ".apps-container"
    };

    $scope.deleteFunc = function(index) {
        console.log(index);
        $scope.arrayHeaderList.splice(index, 1);
        if($scope.arrayList.length > $scope.arrayHeaderList.length )
        {
            $scope.arrayHeaderList.push('Not Applicable' + $scope.notApplicableCounter);
            $scope.notApplicableCounter = $scope.notApplicableCounter + 1;
        }
    }

    function arraymove(arr, fromIndex, toIndex) {
        if (fromIndex <= arr.length && toIndex <= arr.length) {
            var element = arr[fromIndex];
            arr.splice(fromIndex, 1);
            arr.splice(toIndex, 0, element);
            console.log(arr);
            return arr;
        } else {
            console.log("No Choice");
            return arr;
        }
    }

    function htmlToPlaintext(text) {
        return text ? String(text).replace(/<[^>]+>/gm, '') : '';
    }
    //action after selecting warehouse in the timeline feature(active state)
    $scope.selectWareHouseAction = function(orderId, tableSaleOrderId, wareHouseObject) {
        if (wareHouseObject == undefined) {
            $scope.notify("Warehouse Cannot Be Allocated");
        }
        if (wareHouseObject != undefined) {
            var wareHousesUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/' + orderId + '/orderskus/' + tableSaleOrderId + '/warehouse';
            $http.put(wareHousesUrl, wareHouseObject).success(function(data) {
                console.log(data);
                if (data) {
                    $scope.notify("Warehouse Allocated Successfully",'success');
                    $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                    for (var i = 0; i < $scope.orderLists.length; i += 1) {
                        $scope.dayDataCollapse[i] = false;
                    }
                }
            }).error(function(error, status) {
                if(status == 400){
                    $scope.notify(error.errorMessage);
                }else {
                    $scope.notify("Warehouse Cannot Be Allocated");
                }
            });
            $('#dialog1').modal('hide');
        }
    }

    $scope.listOfShippingOwners = function(){
        $scope.shippingOwnersData = [];
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
    }

    $scope.listOfShippingOwners();

    //action after selecting shipping carrier in the timeline feature(active state)
    $scope.selectShippingCarrierAction = function(orderId, tableSaleOrderId, shippingObject) {
        console.log(orderId);
        console.log(tableSaleOrderId);
        console.log(shippingObject);
        if (shippingObject == undefined) {
            $scope.notify("Shipping Carrier cannot be allocated");
        }
        if (shippingObject != undefined) {
            var shippingAllocateUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/' + orderId + '/shipping/' + tableSaleOrderId;
            $http.put(shippingAllocateUrl, shippingObject).success(function(data) {
                console.log(data);
                if (data) {
                    $scope.notify("Shipping Carrier Allocated Successfully",'success');
                    // $scope.listOfOrderReturn($scope.defaultTab, 0);
                    $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                    for (var i = 0; i < $scope.orderLists.length; i += 1) {
                        $scope.dayDataCollapse[i] = false;
                    }
                }
            }).error(function(error, status) {
                console.log(error);
                console.log(status);
                if(status == 400){
                    $scope.notify(error.errorMessage);
                }else {
                    $scope.notify("Shipping Carrier cannot be allocated");
                }
            });
            $('#dialog2').modal('hide');
        }
    }

    $scope.LoadNewRason = {};

    //action after cancel warehouse in the timeline feature(active state)
    $scope.selectCancelAction = function(orderId, tableSaleOrderId, remarks,otherReasonRemarks,form) {
            if (remarks != undefined && remarks=='other') {
                if(remarks == 'other'){
                    //var UserRemarks = otherReasonRemarks;
                    if($scope.LoadNewRason.ReasonCheckBox == true){
                        var postDataReason;
                        postDataReason = {
                            "tableSaleReturnCancelReasonString": $scope.LoadNewRason.reasonData
                        };
                        $http({
                            method: 'POST',
                            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/salereturncancelreason',
                            data: postDataReason,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).success(function(data){
                            $scope.loadCancelReasons();
                        }).error(function(data){

                        });
                    }
                }
                //here tableSaleOrderId sale return order sku id
                var cancelUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/salereturnsku/cancel/' + tableSaleOrderId + '?remarks=' + otherReasonRemarks;
                var putdata = '';
                $http.put(cancelUrl,putdata).success(function(data) {

                    if (data) {
                        $scope.notify("Order Cancelled Successfully",'success');
                        $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                        for (var i = 0; i < $scope.orderLists.length; i += 1) {
                            $scope.dayDataCollapse[i] = false;
                        }
                    }
                }).error(function(error, status) {
                    if(status == 400){
                        $scope.notify(error.errorMessage);
                    }else {
                        $scope.notify("Order Cannot Be Cancelled");
                    }
                });
            }
            if (remarks != undefined && remarks!='other') {
                var cancelUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/salereturnsku/cancel/' + tableSaleOrderId + '?remarks=' + remarks;
                var putdata = '';
                $http.put(cancelUrl,putdata).success(function(data) {
                    console.log(data);
                    if (data) {
                        $scope.notify("Order Cancelled Successfully",'success');
                        $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                        for (var i = 0; i < $scope.orderLists.length; i += 1) {
                            $scope.dayDataCollapse[i] = false;
                        }
                    }
                }).error(function(error, status) {
                    if(status == 400){
                        $scope.notify(error.errorMessage);
                    }else {
                        $scope.notify("Order Cannot Be Cancelled");
                    }
                });
            }
            $scope.cancelWarehouseSelection(form);
            $('#cancelOrder').modal('hide');

    }

    //Bulk Upload Functionality Starts

    //saving bulk upload settings
    $scope.bulkUploadsSettingSave = function() {
        var mappingCols = [];
        console.log($scope.bulkOrderSettingData);
        console.log($scope.arrayHeaderList.length);
        for (var i = 0; i < $scope.arrayHeaderList.length; i++) {
            mappingCols.push({
                tableSalesChannelBulkUploadMapOmsCol: $scope.arrayList[i],
                tableSalesChannelBulkUploadMapScCol: $scope.arrayHeaderList[i]
            });
        }
        console.log(mappingCols);
        var postData = {
            "tableSalesChannelBulkUploadSettingsName": $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName,
            "tableSalesChannelBulkUploadSettingsDateFormat": $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsDateFormat,
            "tableSalesChannelBulkUploadMapCols": mappingCols
        }


        console.log(postData);
        var channelId = $scope.bulkOrderSettingData.channelId;
        delete $scope.bulkOrderSettingData.channelId;

        $http({
            method: 'POST',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/bulkuploadsettings',
            data: postData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                $scope.notify("Bulk Order Map Setting Added Successfully",'success');
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            if(status == 400){
                $scope.notify(error.errorMessage);
            }else {
                $scope.notify("Bulk Order Map Setting Cannot Be Added");
            }
        });
    }

    //editing bulk upload settings
    $scope.bulkUploadsSettingEdit = function() {
        console.log($scope.bulkUploadSettingId);
        var mappingCols = [];
        console.log($scope.bulkOrderSettingData);
        console.log($scope.arrayHeaderList.length);
        for (var i = 0; i < $scope.arrayHeaderList.length; i++) {
            mappingCols.push({
                tableSalesChannelBulkUploadMapOmsCol: $scope.arrayList[i],
                tableSalesChannelBulkUploadMapScCol: $scope.arrayHeaderList[i]
            });
        }
        console.log(mappingCols);
        var putData = {
            "idtableSalesChannelBulkUploadSettingsId": $scope.bulkUploadSettingId,
            "tableSalesChannelBulkUploadSettingsName": $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName,
            "tableSalesChannelBulkUploadSettingsDateFormat": $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsDateFormat,
            "tableSalesChannelBulkUploadMapCols": mappingCols
        }


        console.log(putData);

        $http({
            method: 'PUT',
            // url : MavenAppConfig.baseUrlSource+'/omsservices/webapi/saleschannels/'+channelId+'/bulkuploadsetting',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/bulkuploadsettings/' + $scope.bulkUploadSettingId,
            data: putData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                $scope.notify("Bulk Order Map Setting Edited Successfully",'success');
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            if(status == 400){
                $scope.notify(error.errorMessage);
            }else {
                $scope.notify("Bulk Order Map Setting Cannot Be Edited");
            }
        });
    }


    $scope.AddBulkOrderMapFormValidationMsg = function(BulkChanelId,Dateformat,mappingName){
        if(BulkChanelId == null || BulkChanelId == undefined)
        {
            $scope.notify('Sales Channel Name is a mandatory');
            return false;
        }
        if(mappingName == null || mappingName == undefined)
        {
            $scope.notify('Mapping Name is Required');
            return false;
        }
        if(Dateformat == null || Dateformat == undefined || Dateformat == "")
        {
            $scope.notify('Date Format is Required');
            return false;
        }
        return true;


    }


    //saving bulk upload settings channel wise
    $scope.savebulkUploadSettingChannelWise = function(bulkOrderchannelId) {
        console.log($scope.arrayHeaderList);
        console.log($scope.bulkOrderchannelId);
        console.log($scope.dateFormat);
        console.log($scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName);

        var channelId = bulkOrderchannelId;
        // delete $scope.bulkOrderSettingData.channelId;
        var mappingCols = [];
        // console.log($scope.bulkOrderSettingData);
        console.log(channelId);
        if($scope.AddBulkOrderMapFormValidationMsg($scope.bulkOrderchannelId,$scope.dateFormat,$scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName) == false){
            return;
        }

        $http.get(MavenAppConfig.baseUrlSource + "/omsservices/webapi/saleschannels/" + channelId).success(function(data) {
            // console.log(data);

            // console.log($scope.arrayHeaderList.length);
            for (var i = 0; i < $scope.arrayHeaderList.length; i++) {

                if ($scope.arrayHeaderList[i].indexOf("Not Applicable") >= 0)
                {
                    $scope.arrayHeaderList[i] = null;
                    continue;
                }
                mappingCols.push({
                    tableSalesChannelBulkUploadMapOmsCol: $scope.arrayList[i],
                    tableSalesChannelBulkUploadMapScCol: $scope.arrayHeaderList[i]
                });
            }
            // console.log(mappingCols);
            var putData = {
                "idtableSalesChannelBulkUploadSettingsId": $scope.bulkUploadSettingId,
                "tableSalesChannelBulkUploadSettingsName": $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName,
                "tableSalesChannelBulkUploadSettingsDateFormat": $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsDateFormat,
                "tableSalesChannelBulkUploadMapCols": mappingCols
            }


            // console.log(putData);
            if ($scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName != null) {
                data.tableSalesChannelBulkUploadSettings = putData;
            }
            if ($scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName == null) {
                data.tableSalesChannelBulkUploadSettings = null;
            }
            console.log(data);
            $http({
                method: 'PUT',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/saleschannels/' + channelId,
                // url : MavenAppConfig.baseUrlSource+ '/omsservices/webapi/bulkuploadsettings',
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                console.log(res);
                $scope.arrayList = [];
                $scope.bulkOrderMapFile = null;
                $scope.arrayHeaderList = [];
                $scope.bulkOrderSettingData = null;
                $scope.dateFormat = null;
                $scope.bulkOrderchannelId = null;
                $scope.bulkOrderSettingData = "";
                $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsDateFormat = "";
                $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName = "";
                $scope.bulkUploadMapElemClicked = false;
                $scope.arrayHeaderList = [];
                $scope.dateFormat = "";

                $('#myModal2').modal('hide');
                $scope.notify("Bulk upload mapping saved Successfully",'success');
            }).error(function(error, status) {
                console.log(error);
                console.log(status);
                $scope.arrayHeaderList = [];
                $scope.bulkOrderSettingData = null;
                $scope.dateFormat = null;
                $scope.bulkOrderchannelId = null;
                $scope.bulkOrderSettingData = "";
                $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsDateFormat = "";
                $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName = "";
                $scope.bulkUploadMapElemClicked = false;
                $scope.arrayHeaderList = [];
                $scope.dateFormat = "";
                if(status == 400){
                    $scope.notify(error.errorMessage);
                }else {
                    $scope.notify("Error in saving bulk upload mapping !!");
                }

            });
        });


    };

    //singleOrderReturn Tab Mode
    $scope.singleOrderReturnTabMode = function() {
        $scope.singleOrderReturnTab = true;
        $scope.bulkOrderReturnTab = false;
    };

    //bulkOrder Tab Mode
    $scope.bulkOrderReturnTabMode = function() {
        $scope.singleOrderReturnTab = false;
        $scope.bulkOrderReturnTab = true;
    };


    $scope.uploadFile = function() {
        console.log($scope.bulkOrderSettingData.channelId);
        var file = $scope.myFile;
        console.log('file is ');
        console.dir(file);
        var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/saleschannels/' + $scope.bulkOrderSettingData.channelId + '/uploadbulkorders';
        // fileUpload1.uploadFileToUrl(file,uploadUrl);

        var fd = new FormData();
        fd.append('uploadFile', file);
        console.log(uploadUrl);
        console.log('uploadFile' + file);
        console.log('fd' + fd);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                // $scope.listOfOrderReturn($scope.defaultTab, 0);
                $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                $scope.notify("Bulk Order Uploaded successfully",'success');
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            $scope.bulkOrderSettingData = "";
            angular.element("input[type='file']").val(null);
            if(status == 400){
                $scope.notify(error.errorMessage);
            }else {
                $scope.notify("Error in Uploading Bulk Order");
            }
        });
    }

    //dialog box to open warehouse selection dialog box
    $scope.openWareHouseBox = function(ev, orderId, tableSaleOrderId, orderNo) {
        $scope.orderId = orderId;
        $scope.tableSaleOrderId = tableSaleOrderId;
        $scope.loadWareHouses(orderId, tableSaleOrderId).then(
            function(v) {
                if(v){
                    $scope.orderNo = orderNo;
                    console.log($scope.wareHousesArray);
                    if($scope.wareHousesArray.length!=0){
                        $('#dialog1').modal('show');
                    }
                }
            });
    }

    $scope.onvalue = function(radio) {
        $scope.wareHouseObject = JSON.parse(radio);
    }

    //dialog box to open shipping selection dialog box
    $scope.openShippingCarrierBox = function(ev, orderId, tableSaleOrderId, tableSkuData, orderNo, saleChannelId) {
        $scope.orderId = orderId;
        $scope.tableSaleOrderId = tableSaleOrderId;
        console.log(tableSkuData);
        $scope.loadShippingCarriers(orderId, tableSaleOrderId, tableSkuData, saleChannelId).then(function(v){
            if(v){
                $scope.orderNo = orderNo;
                if (saleChannelId != 1) {
                    $('#dialog2').modal('show');
                }
            }
        })
    }

    $scope.cancelWarehouseSelection = function(form) {
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#cancelOrder').modal('hide');
        $('#dialog1').modal('hide');
        $('#dialog2').modal('hide');
        $('#exportOrderReturnFile').modal('hide');
    }

    $scope.onvalue1 = function(radio1) {
        console.log(radio1);
        $scope.shippingObject = JSON.parse(radio1);
        console.log($scope.shippingObject);
    }

    //dialog box to open cancel order dialog box
    $scope.cancelSaleOrderReturnBox = function(ev, orderId, tableSaleOrderId, orderNo) {
        $scope.orderId = orderId;
        $scope.tableSaleOrderId = tableSaleOrderId;
        $scope.orderNo = orderNo;
        $scope.loadCancelReasons();
        $('#cancelOrder').modal('show');
    }

    //info box to show full state trials for the order
    $scope.openInfoBox = function(ev, stateTrials) {
        $scope.steps = [];
        console.log(stateTrials);
        for (var i = 0; i < stateTrials.length; i++) {
            var a = stateTrials.length - 1;
            var fulldate = $filter('utcToLocalOrHyphen')(stateTrials[i].tableSaleReturnSkuStateTrailDateTime);
            if (i < a) {
                $scope.steps.push({
                    title: stateTrials[i].tableSaleReturnSkuStateType.tableSaleReturnSkuStateTypeString,
                    active: true,
                    orderState: "Successful",
                    remarks: stateTrials[i].tableSaleReturnSkuStateTrailRemarks,
                    fulldate: fulldate
                });
            }
            if (i == a) {
                $scope.steps.push({
                    title: stateTrials[i].tableSaleReturnSkuStateType.tableSaleReturnSkuStateTypeString,
                    orderState: "In Process",
                    remarks: stateTrials[i].tableSaleReturnSkuStateTrailRemarks,
                    fulldate: fulldate
                });
            }
        }
        $('#infoDialog').modal('show')
    }

    $scope.cancelInfoBox = function() {
        $('#infoDialog').modal('hide');
    };


    //opening and closing bulk upload order fields accordian
    $scope.selectinvRow = function() {
        console.log($scope.bulkUploadOrderFielsClicked);
        if ($scope.bulkUploadOrderFielsClicked == false) {
            $scope.bulkUploadOrderFielsClicked = true;
        }

    }

    $scope.selectotherRow = function() {
        if ($scope.bulkUploadOrderFielsClicked == true) {
            $scope.bulkUploadOrderFielsClicked = false;
        }
    }

    //opening and closing bulk upload map elem fields accordian
    $scope.selectmapElemRow = function() {
        console.log($scope.bulkUploadMapElemClicked);
        if ($scope.bulkUploadMapElemClicked == false) {
            $scope.bulkUploadMapElemClicked = true;
        }

    }

    $scope.selectothermapElemRow = function() {
        if ($scope.bulkUploadMapElemClicked == true) {
            $scope.bulkUploadMapElemClicked = false;
        }
    }




    function setFocus() {
        document.getElementById("settingName").focus();
    }

    function setBlur() {
        document.getElementById("settingName").blur();
    }




    //Number Validation not allowing -,+,e
    $scope.Num = function(event) {
        var keys = {
            '0': 48,
            '1': 49,
            '2': 50,
            '3': 51,
            '4': 52,
            '5': 53,
            '6': 54,
            '7': 55,
            '8': 56,
            '9': 57,
            '.': 46
        };
        for (var index in keys) {
            if (!keys.hasOwnProperty(index)) continue;
            if (event.charCode == keys[index] || event.keyCode == keys[index]) {
                return; //default event
            }
        }
        event.preventDefault();
    };

    //Number Validation not allowing -,+,e,.
    $scope.Num1 = function(event) {
        var keys = {
            '0': 48,
            '1': 49,
            '2': 50,
            '3': 51,
            '4': 52,
            '5': 53,
            '6': 54,
            '7': 55,
            '8': 56,
            '9': 57
        };
        for (var index in keys) {
            if (!keys.hasOwnProperty(index)) continue;
            if (event.charCode == keys[index] || event.keyCode == keys[index]) {
                return; //default event
            }
        }
        event.preventDefault();
    };

    $scope.cancelSingleOrders = function(){

        $scope.shippingDetails.SkuType = null;
        $scope.shippingDetails.VehicleType = null;
        $scope.shippingDetails.DriverName = null;
        $scope.shippingDetails.DriverNumber = null;
        $scope.shippingDetails.VehicleNumber = null;
        $scope.shippingDetails.tableSaleOrderShippingDetailsMasterAwb = null;
        $scope.Packing.Length = null;
        $scope.Packing.Breadth = null;
        $scope.Packing.Height = null;
        $scope.Packing.Weight = null;
        $scope.Packing.LengthUnit = null;
        $scope.Packing.WeightUnit = null;
        $scope.blurred = true;
        $scope.tableSalesOrderSkuQuantityDetails = [];


        $('#printLabels').modal('hide');
    };


    $scope.initDateLimits = function () {
        $scope.minDateShipping = new Date();
        $scope.maxDateShipping = null;

        $scope.minDateDelivery = new Date();
        $scope.maxDateDelivery = null;

    }

    $scope.initDateLimits();
    $scope.onPickUpDateChange = function () {

        //Should be greater than equal to today's date and if delivery date is available then should be less than delivery date
        $scope.minDateShipping = new Date();

        if($scope.singleorderReturnData.tableSaleReturnDropDateTime)
        {
            $scope.deliveryDateData = new Date($scope.singleorderReturnData.tableSaleReturnDropDateTime);
            $scope.maxDateShipping = new Date(
                $scope.deliveryDateData.getFullYear(),
                $scope.deliveryDateData.getMonth(),
                $scope.deliveryDateData.getDate());
        }

        //Delivery date should be greater than equal to shipping date

        if($scope.singleorderReturnData.tableSaleReturnPickUpDateTime)
        {
            $scope.shippingDateData = new Date($scope.singleorderReturnData.tableSaleReturnPickUpDateTime);
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

        if($scope.singleorderReturnData.tableSaleReturnPickUpDateTime)
        {
            $scope.shippingDateData = new Date($scope.singleorderReturnData.tableSaleReturnPickUpDateTime);
            $scope.minDateDelivery = new Date(
                $scope.shippingDateData.getFullYear(),
                $scope.shippingDateData.getMonth(),
                $scope.shippingDateData.getDate());
        }

        if($scope.singleorderReturnData.tableSaleReturnDropDateTime)
        {
            $scope.deliveryDateData = new Date($scope.singleorderReturnData.tableSaleReturnDropDateTime);
            $scope.maxDateShipping = new Date(
                $scope.deliveryDateData.getFullYear(),
                $scope.deliveryDateData.getMonth(),
                $scope.deliveryDateData.getDate());
        }

    };




    $scope.getFileType = function(file) {
        console.log(file);
    };
    $scope.DraftOrderID = {};
    $scope.editOrder = function(orderData,mode, ev) {


        $scope.singleOrderReturnMode = mode;
        if(orderData.tableSaleOrder == null)
        {
            console.log(orderData);
            $scope.singleorderReturnDataCopy = angular.copy(orderData);
            $scope.singleorderReturnData = $scope.singleorderReturnDataCopy;
            $scope.singleorderReturnData.tableSaleReturnSystemOrderNo = orderData.tableSaleReturnSystemOrderNo;

            if ($scope.singleorderReturnDataCopy.tableSaleReturnPickUpDateTime != null) {
                $scope.singleorderReturnData.tableSaleReturnPickUpDateTime = new Date($scope.singleorderReturnDataCopy.tableSaleReturnPickUpDateTime);
            }
            if ($scope.singleorderReturnDataCopy.tableSaleReturnDropDateTime != null) {
                $scope.singleorderReturnData.tableSaleReturnDropDateTime = new Date($scope.singleorderReturnDataCopy.tableSaleReturnDropDateTime);
            }

            if($scope.singleOrderReturnMode == 'copy')
            {
                $scope.singleorderReturnData.tableSaleReturnScRefNo = null;
                $scope.singleorderReturnData.tableSaleReturnRemarks = "";
                $scope.singleorderReturnData.tableSaleReturnRemarkses = [];
            }

            $scope.$broadcast("angucomplete-alt:changeInput", "customers", $scope.singleorderReturnData.tableCustomer);
            $('#addSaleReturnDialogRefUnknown').modal('show');

        }
        else
        {
            if($scope.singleOrderReturnMode == 'copy')
            {
                $scope.singleorderReturnData.tableSaleReturnRemarks = "";
                $scope.singleorderReturnData.tableSaleReturnRemarkses = [];
            }

            $scope.singleorderReturnData.tableSaleReturnScRefNo = orderData.tableSaleReturnScRefNo;
            $scope.singleorderReturnData.tableShippingOwnership = orderData.tableShippingOwnership;
            $scope.singleorderReturnData.tableSaleReturnPickUpDateTime = orderData.tableSaleReturnPickUpDateTime;
            $scope.singleorderReturnData.tableSaleReturnDropDateTime = orderData.tableSaleReturnDropDateTime;
            $scope.singleorderReturnData.tableSaleReturnReason = orderData.tableSaleReturnReason;
            $scope.singleorderReturnData.tableSaleReturnRemarkses = orderData.tableSaleReturnRemarkses;
            $scope.singleorderReturnData.idtableSaleReturnId = orderData.idtableSaleReturnId;
            $scope.singleorderReturnData.tableSaleReturnSystemOrderNo = orderData.tableSaleReturnSystemOrderNo;
            $scope.singleorderReturnData.tableSaleReturnSkus = orderData.tableSaleReturnSkus;

            $scope.populateReturnOrderFromSaleOrder(orderData.tableSaleOrder);
            $('#addSaleReturnDialogRefKnown').modal('show');
        }

    };

    $scope.copyOrder = function(orderId) {
        $scope.singleOrderReturnMode = "copy";
        $scope.updateOrderId = orderId;
        var copyOrderUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/salereturn/' + orderId;
        $http({
            method: 'GET',
            url: copyOrderUrl
        }).success(function(res)
        {
            if (res)
            {
                console.log(res);
                $scope.singleorderReturnData = res;
                $('#addOrderModal').modal('show');
            }
        }).error(function(error, status)
        {
            console.log(error);
            console.log(status);
            if(status == 400){
                $scope.notify(error.errorMessage);
            }else {
                $scope.notify("Order Cannot Be Copied");
            }
        })
    };

    $scope.concatenateAddresses = function(addr1, addr2, addr3) {
        return addr1 + ", " + addr2 + ", " + addr3;
    };

    function initializeAddressDropdowns(lists, prop, code) {
        lists = lists || [];
        for (var i = 0; i < lists.length; i++) {
            var list = lists[i];
            if (list.tableAddress[prop] === code) {
                return list;
            }
        };
        return null;
    }

    //check Order Number
    $scope.checkOrderNumber = function(orderNo)
    {
        var q = $q.defer();
        console.log(orderNo);
        var checkOrderNo = MavenAppConfig.baseUrlSource + "/omsservices/webapi/salereturn/clientordernumber?clientordernumber=" + orderNo;
        $http.get(checkOrderNo).success(function(data)
        {
            console.log(data);
            if (data == true)
            {
                $scope.notify("Order ref. no. already exists");
                $('#ordernumberId').val('');
                $scope.isOrderNoValid = true;
                $scope.orderNumberEntered = true;
                q.resolve(false);
                $scope.orderRefExists = true;
            }
            if (data == false)
            {
                $scope.isOrderNoValid = false;
                $scope.orderNumberEntered = false;
                q.resolve(true);
                $scope.orderRefExists = false;
            }
        });
        return q.promise;
    }


    // dialog box to add new invoice template
    $scope.uploadFileBulkOrder = function(ev) {
        $('#addOrderModal').modal('hide');
        $('#bulkOrder').modal('show');
    };

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
        $scope.listOfStatesCount(defaultTab, page);
    }
    //    ======================================= quick ship ================================== //

    $scope.Packing = {};
    $scope.Packing.containerQuantity = [];
    $scope.tableSalesOrderSkuQuantityDetails = [];
    $scope.quickShipData = function(data){
        console.log(data);
        $('#QuickShipDialog').modal('show');
        //$scope.Packing.containerQuantity
        $scope.quickShipDataTable = data.tableSaleOrderSkuses;
        $scope.quickShipDataTable.orderID = data.idtableSaleOrderId;
    };


    $scope.validateAlphaNum = function (val)
    {

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
        else if(value.SkuType == 'Parcel')
        {
            if (value.tableSaleOrderShippingDetailsMasterAwb == '' || value.tableSaleOrderShippingDetailsMasterAwb == undefined)
            {
                $scope.notify('AWB number is required.');
                return false;
            }
        }
    };




    $scope.blurred = true;
    $scope.skuPackingDisable =function()
    {
        if($scope.ShippingDetailsBtn()==false)
        {
            return;
        }
        $scope.blurred = false;
    };

    $scope.RemoveContainerPackage = function(index){
        console.log(index);
        $scope.tableSalesOrderSkuQuantityDetails.splice(index, 1);
        console.log($scope.tableSalesOrderSkuQuantityDetails);
    };


    $scope.shippingDetails  = {};

    $scope.closeBulkUploadDialog = function()
    {
        $('#addOrderModal').modal('hide');

        $('#addSaleReturnDialogRefUnknown').modal('hide');
        $('#addSaleReturnDialogRefKnown').modal('hide');

        
        $cookies.put('BulkUploadData','order');
        $cookies.put('ActiveTab','Orders');
        $timeout(function() {
            $location.path('/bulkuploads');
            console.log('update with timeout fired')
        }, 1000);
    };
    var orderDataForReplacingData;
    $scope.openEditRemarkModal = function(order,index){
        orderDataForReplacingData = order;
        console.log(order);
        $scope.modalRemarks = null;
        $scope.editRemarkModalOrderId = order.idtableSaleReturnId;
        if(order.tableSaleReturnRemarkses == null || order.tableSaleReturnRemarkses == undefined){
            $scope.modalRemarks = null;
        }
        else{
            if(order.tableSaleReturnRemarkses.length>0){
                $scope.modalRemarks = order.tableSaleReturnRemarkses;
            }
        }
        $scope.orderIndex = index;
        $('#editRemarkModal').modal('show');
    };

    $scope.cancelEditRemarksModal = function(form){
        $scope.editRemarkModalOrderId = null;
        $scope.genericData.newModalRemarks = null;
        $scope.modalRemarks = null;
        $scope.orderIndex = null;
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
    };

    $scope.updateRemarks = function(newRemarks,form){
        var remarks = newRemarks;
        var index = $scope.orderIndex;
        console.log(newRemarks,$scope.editRemarkModalOrderId);
        if(newRemarks == null || newRemarks == undefined || newRemarks == ""){
            $scope.notify("Please provide remarks");
            return;
        }
        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/salereturn/' + $scope.editRemarkModalOrderId +'/editremarks',
            data: remarks
        }).success(function(data) {
            var checkUpdatedRemarksDataUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/salereturn/"+orderDataForReplacingData.idtableSaleReturnId;
            $http({
                method: 'GET',
                url: checkUpdatedRemarksDataUrl
            }).success(function(response){
                var dataIndex = $scope.orderLists.indexOf(orderDataForReplacingData);
                $scope.orderLists[dataIndex] = response;
                $scope.cancelEditRemarksModal(form);
                $scope.notify("Remarks updated successfully",'success');
            }).error(function(err){
                $scope.cancelEditRemarksModal(form);
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
    };
    //$scope.shippingDetails.SkuType = 'Parcel';


//    =============================== show order level action ========================== //

    $scope.showOrderLevelAction = function(value){
        console.log(value);
    }
    $scope.getShippingLabelButton = function(data){
        var b = false;
        angular.forEach(data,function(resp){
            if(b == false && (resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 8 || resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 9 || resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 11)) {
                b = true;
            }
        });
        return b;
    }

    $scope.getPackingLabelButton = function(data){
        var b = false;
        angular.forEach(data,function(resp){
            if(b == false && (resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 8 || resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 9 || resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 11)){
                b = true;
            }
        });
        return b;
    };
    $scope.getmanifestLabelButton = function(data){
        var b = false;
        angular.forEach(data,function(resp){
            if(b == false && (resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 13 || resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 14 || resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 15)){
                b = true;
            }
        });
        return b;
    };
    $scope.getInvoiceLabelButton = function(data){
        var b = false;
        angular.forEach(data,function(resp){
            if(b == false && (resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 13 || resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 14 || resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 15)){
                b = true;
            }
        });
        return b;
    };
    $scope.getQuickShipLabelButton = function(data){
        var b = false;
        angular.forEach(data,function(resp){
            if(b == false && (resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 8 || resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 9 || resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 11)){
                b = true;
            }
        });
        return b;
    };

    $scope.orderLevelActionRow = function(data){

        var shippingLabelButn = $scope.getShippingLabelButton(data);
        var packingLabelButton = $scope.getPackingLabelButton(data);
        var manifestLabelButton = $scope.getmanifestLabelButton(data);
        var InvoiceLabelButton = $scope.getInvoiceLabelButton(data);
        var QuickShipButton = $scope.getQuickShipLabelButton(data);
        if(shippingLabelButn == true || packingLabelButton == true || manifestLabelButton == true || InvoiceLabelButton == true || QuickShipButton == true){
            return true;
        }else{
            return false;
        }

    };

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

    var customerStart=0,customersize=10;
    $scope.customerLoadBusy = false;
    $scope.stopCustomerLoad = false;
    $scope.customerPagingFunction = function () {
        if($scope.stopCustomerLoad){
            return;
        }
        $scope.customerLoadBusy = true;
        mastersService.fetchCustomersNext(MavenAppConfig.baseUrlSource,customerStart,customersize,function(data){
            if(data.length > 0)
            {
                $scope.genericData.customerListFiltered = $scope.genericData.customerListFiltered.concat(data);
                customerStart += customersize;
                $scope.customerLoadBusy = false;
            }
            else
            {
                $scope.customerLoadBusy = true;
            }

        });

    }
	
    $scope.masterSkuDialog = function(ev, check){		
		
		mastersService.fetchSkus(MavenAppConfig.baseUrlSource,function(data){
			$scope.genericData.skusListFiltered = data;

			$timeout(function () {
			    $('#dialogmastersku').modal('show');
                $scope.skuLoadBusy = false;
                $scope.stopSkuLoad = false;
			}, 200);
		});
		
		$scope.genericData.check = check;
		
		if(check == true){

			console.log($scope.singleorderData);
		}
				
        	
		
	}
	
	$scope.masterCustomerDialog = function(ev, check){		
		
		mastersService.fetchCustomers(MavenAppConfig.baseUrlSource,function(data){
			$scope.genericData.customerListFiltered = data;
			
			$timeout(function () {
				$('#dialogmastercustomer').modal('show');

			}, 200);
			
		});
		
		$scope.genericData.check = check;
		
		if(check == true){

		}       	
	}
	
	$scope.selectSku = function(id, ev){
        $scope.stopSkuLoad = true;
		 $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/'+id).success(function(data) {
         console.log(data);
         
         if($scope.genericData.check == false){
        	 $scope.$broadcast("angucomplete-alt:changeInput", "productsfilter", data);
		 }else{
             if(data.tableSkuIsReturnable == false){
                 $scope.notify("This SKU is not returnable.");
                 return;
             }
             $scope.$broadcast("angucomplete-alt:changeInput", "products", data);
		 }         
         
        }).error(function(error, status) {
            console.log(error);
			
        });
		
		$scope.cancelmastersDialog(ev);	
			
		
	}
	
	$scope.selectCustomer = function(id, ev){
		
		$scope.customerid = id;
		
		 $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/'+id).success(function(data) {
         console.log(data);
         
         if($scope.genericData.check == false){
        	 $scope.$broadcast("angucomplete-alt:changeInput", "customersfilter", data);        	 
         }else{
        	 $scope.$broadcast("angucomplete-alt:changeInput", "customers", data);
         }
         
		 
        }).error(function(error, status) {
            console.log(error);			
        });	
		
		$scope.cancelmastersDialog(ev);		
	}
	
	$scope.cancelmastersDialog = function(ev){
        skuStart=0;
        size=10;
        $scope.genericData.skusListFiltered = [];
        $scope.skuLoadBusy = true;
        $scope.stopSkuLoad = true;
        $('#dialogmastersku').modal('hide');
        $('#dialogmastercustomer').modal('hide');

		

		if($scope.genericData.check == true){						
			$scope.showAddOrderModalWithValues(ev);
		}
		
	}
	
	$scope.showAddOrderModalWithValues = function(ev){
		$('#addSaleReturnDialogRefUnknown').modal('show');

	}
    $scope.$on('$destroy', function () {
        $window.localStorage.removeItem('saleReturnFilter');
        $window.localStorage.removeItem('inboundTab');
        $("#dialogmastersku").remove();
        $('.modal-backdrop').remove();
    });

}]);
