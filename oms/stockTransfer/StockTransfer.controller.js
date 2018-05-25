angular.module('OMSApp.stockTransfer', [ ]).config(function config($stateProvider) {
    $stateProvider.state('/stocktransfer/', {
        name: '/stocktransfer/',
        url: '/stocktransfer/',
        views: {
            "main": {
                controller: 'stockTransfer',
                templateUrl: 'stockTransfer/stockTransfer.html'
            },
            "header": {
                controller: 'headerCtrl',
                templateUrl: '../shared/templates/header.html'
            }
        },
        data: {pageTitle: 'stockTransfer'}
    })

}).controller('stockTransfer',  ['$rootScope','$scope', '$http' ,'$window', '$location','$filter', '$mdDialog', 'MavenAppConfig', '$sce', 'pagerService', '$q', '$cookies','$timeout','Upload', 'mastersService',

function stockTransfer($rootScope, $scope, $http,$window,  $location,$filter, $mdDialog, MavenAppConfig, $sce, pagerService, $q, $cookies,$timeout,Upload , mastersService) {

    $scope.genericData = {};
    $scope.baseSkuUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/search?search=';
    $scope.genericData  = {};
    $scope.genericData.orderDialogMode = "addnew";

    $scope.filterObj = {};
    $scope.filterObj.fromWarehouse = null;
    $scope.filterObj.toWarehouse = null;
    $scope.filterObj.systemOrderNo = "";
    $scope.filterObj.stRefNo = "";
    $scope.filterObj.start1Date = null;
    $scope.filterObj.end1Date = null;

    $scope.products = [];
    $scope.shippingDetails = '';
    $scope.Packing = '';
    $scope.tableSalesOrderSkuQuantityDetails = [];
    $scope.quickShipDataTable = [];
    $scope.quantityTypes = [
        'Good',
        'Bad'
    ]
    $scope.downloadSTOTemplateUrl =MavenAppConfig.baseUrlSource+ MavenAppConfig.downloadSTOTemplateUrl;
    $scope.ClientOrderNo = '';
    $scope.start = 0;
    $scope.recordsPerPage = [5,10,15];
    $scope.orderSize = $scope.recordsPerPage[0];
    $scope.defaultTab = 'all';
    $scope.singleOrderTab = true;
    $scope.bulkOrderTab = false;
    $scope.singleOrderMode = "add";
    $scope.baseCustomerUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/vendors/search?search=';

    $scope.sortType = "tableStockXferOrderSystemOrderNo";
    $scope.directionType = "desc";
    $scope.sortReverse = false; // set the default sort order

    $scope.disableQuickShipBox = [];
    $scope.editQuickShipBoxHideAndShow = [];
    $scope.shipping = {};
    $scope.genericData.isAdmin = localStorage.getItem('isadmin');

    var currentUrl,UrlName;
    currentUrl = $scope.currentUrl;
    if($scope.currentUrl === "")
    {
        currentUrl = window.location.href;
    }
    UrlName = currentUrl.split('/');
    if(UrlName.indexOf('stocktransfer') == -1){
        $scope.defaultTab = "new";
    }else{
        $scope.defaultTab = "all";
    }

    $scope.stockTrUploadFile = function(){
        $( "#upload_file_bulk" ).click();
    }


    $scope.onPageInitialize = function () {
        if($cookies.get('orderid') != null){
            $scope.filterObj.systemOrderNo = $cookies.get('orderid');
            $cookies.remove('orderid')
        }
        $scope.listOfStatesCount($scope.defaultTab);
        $scope.listOfWareHouses();
        $scope.getToWarehouses();
        $scope.listOfShippingOwners();
        $scope.listOfShippingCarriers();
        $scope.getClientProfile();
    }

    $scope.tableRowExpanded = false;
    $scope.tableRowIndexExpandedCurr = "";
    $scope.tableRowIndexExpandedPrev = "";
    $scope.storeIdExpanded = "";

    $scope.barcode = {};




    //    ====================================== single and bulk order tab ================== //

    //singleOrder Tab Mode
    $scope.singleOrderTabMode = function() {
        $scope.singleOrderTab = true;
        $scope.bulkOrderTab = false;
    }

    //bulkOrder Tab Mode
    $scope.bulkOrderTabMode = function() {
        $scope.singleOrderTab = false;
        $scope.bulkOrderTab = true;
    }

    $scope.cancelBulkUpload = function(form){
        $scope.singleorderData = {};
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
        $('#stockTransferDialog').modal('hide');


    }
    $scope.closeBulkUploadDialog = function(){
        $mdDialog.hide();
        $cookies.put('BulkUploadData','stocktransfer');
        $cookies.put('ActiveTab','stocktransfer');
        $timeout(function() {
            $location.path('/bulkuploads');
        }, 1000);

        $scope.genericData.check = null;

    };

    $scope.downloadSTOtemplate = function(){
        $http({
            method: 'GET',
            url: MavenAppConfig.baseUrlSource+ MavenAppConfig.downloadSTOTemplateUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            responseType:'arraybuffer'
        }).success(function (data) {
            var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
            var downloadUrl = URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = downloadUrl;
            a.download = "Glaucus_StockTransfer_Order_Bulk_Upload_Template.xls";
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
    };

    //=================================== edit remarks ============================= //
    var orderDataForReplacingData;
    $scope.openEditRemarkModal = function(order,index){
        orderDataForReplacingData = order;
        $scope.editRemarkModalOrderId = order.idtableStockXferOrderId;
        $scope.modalRemarks = null;
        if(order.tableStockXferOrderRemarkses == null || order.tableStockXferOrderRemarkses == undefined){
            $scope.modalRemarks = null;
        }
        else
        {
            if(order.tableStockXferOrderRemarkses.length > 0) {
                $scope.modalRemarks = order.tableStockXferOrderRemarkses;
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
        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/stock/transfer/' + $scope.editRemarkModalOrderId +'/editremarks',
            data: remarks
        }).success(function(data) {
            var checkUpdatedRemarksDataUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/stock/transfer/"+orderDataForReplacingData.idtableStockXferOrderId;
            $http({
                method: 'GET',
                url: checkUpdatedRemarksDataUrl
            }).success(function(response){
                var dataIndex = $scope.orderLists.indexOf(orderDataForReplacingData);
                $scope.orderLists[dataIndex] = response;
                $scope.cancelEditRemarksModal(form);
                $scope.notify("Remarks updated successfully",'success');
            }).error(function(err){
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


    //============================================================================== //

    $scope.uploadBulkOrderFile = function(bulkOrderUploadfile, bulkOrderSettingData) {
        file = bulkOrderUploadfile;
        $scope.fileName = file.name;

    };

    $scope.disableBulkUpload = false;
    $scope.uploadPoBulkUpload = function(bulkOrderUploadfile,form){
        file = bulkOrderUploadfile;
        $scope.disableBulkUpload = true;
        if (file) {
            if (!file.$error) {
                console.dir(file);
                var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/stock/transfer/stbulkupload';

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
                    $cookies.put('BulkUploadData','stocktransfer');
                    $cookies.put('ActiveTab','stocktransfer');
                 $scope.notify("File has been uploaded successfully.It may take a few minutes to reflect the changes.<br><a href='#/bulkuploads/' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View bulk upload reports.</a>",'success','','',0);
                    //$scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                    $scope.cancelBulkUpload(form);
                    $scope.disableBulkUpload = false;

                }, function(resp) {
                    $scope.cancelBulkUpload(form);
                   $scope.notify(resp.data.errorMessage);
                    $scope.disableBulkUpload = false;
                }, function(evt) {
                    // progress notify
                });
            }
        }
    };
    $scope.isSkuSearchEnable = false;


    // getting all list of orders (all the orders)
    $scope.listOfOrders = function (tabsValue, start, action) {
        $scope.defaultTab = tabsValue;
        if (tabsValue == 'draft')
        {
            $scope.DeleteAndConfimData = true;
        }
        else
        {
            $scope.DeleteAndConfimData = false;
        }

        var orderListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/stock/transfer";

        if ($scope.defaultTab == 'all')
            orderListUrl += "?start=" + start + "&size="+$scope.orderSize +"&sort=" + $scope.sortType + "&direction=" + $scope.directionType;

        if ($scope.defaultTab != 'all')
            orderListUrl += "?start=" + start + "&size="+$scope.orderSize +"&sort=" + $scope.sortType + "&direction=" + $scope.directionType + "&state=" + tabsValue;

        orderListUrl +="&uipagename="+$scope.pagename;

        if ($scope.skuId) {
            orderListUrl += "&skuid=" + $scope.skuId;
        }
        if ($scope.filterObj.stRefNo) {
            orderListUrl += "&clientorderid=" + $scope.filterObj.stRefNo;
        }
        if ($scope.filterObj.systemOrderNo) {
            orderListUrl += "&orderid=" + $scope.filterObj.systemOrderNo;
        }
        if ($scope.filterObj.fromWarehouse) {
            orderListUrl += "&fromwarehouseid=" + $scope.filterObj.fromWarehouse.idtableWarehouseDetailsId;
        }
        if ($scope.filterObj.toWarehouse) {
            orderListUrl += "&towarehouseid=" + $scope.filterObj.toWarehouse.idtableWarehouseDetailsId;
        }
        if ($scope.filterObj.startDate) {
            orderListUrl += "&startdate=" + $scope.filterObj.startDate;
        }
        if ($scope.filterObj.endDate) {
            orderListUrl += "&enddate=" + $scope.filterObj.endDate;
        }
        $http.get(orderListUrl).success(function (data) {
            $scope.orderLists = data;
            $scope.tableRowExpanded = false;
            $scope.tableRowIndexExpandedCurr = "";
            $scope.tableRowIndexExpandedPrev = "";
            $scope.storeIdExpanded = "";
            $scope.end = $scope.start + data.length;
            $scope.dayDataCollapse = [];

            for (var i = 0; i < $scope.orderLists.length; i += 1) {
                $scope.dayDataCollapse.push($scope.isSkuSearchEnable);
            }
            $scope.showLoader = false;
        }).error(function (error, status) {
            $scope.showLoader = false;
        });
    }


    $scope.listOfWareHouses = function () {
        $scope.wareHousesData = [];
        var wareHousesListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/warehouses/activewarehouses?size=-1&option=from&uipagename="+$scope.pagename;
        $http.get(wareHousesListUrl).success(function (data)
        {
            $scope.wareHousesData = data;
        }).error(function (error, status) {

        });
    };

    $scope.tableSorting = function(sortType, sortReverse, defaultTab) {
        $scope.sortType = sortType;
        if (sortReverse == true) {
            $scope.directionType = 'desc';
        }
        if (sortReverse == false) {
            $scope.directionType = 'asc';
        }
        $scope.sortReverse = !sortReverse;

        var page = undefined;
        $scope.listOfStatesCount(defaultTab, page);
    }

    $scope.getToWarehouses = function ()
    {
        $scope.toWarehouses = [];
        var wareHousesListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/warehouses/activewarehouses?size=-1&option=to&uipagename="+$scope.pagename;
        $http.get(wareHousesListUrl).success(function (data) {
            $scope.toWarehouses = data;
        }).error(function (error, status) {

        });
    };


    $scope.WareHouseList = function () {
        var warehouse = MavenAppConfig.baseUrlSource + '/omsservices/webapi/warehouses?size=-1&uipagename='+$scope.pagename;
        $http.get(warehouse).success(function (data) {
            $scope.wareHousesData = data;

        }).error(function (data) {
        });
    }


    $scope.listOfShippingOwners = function () {
        $scope.shippingOwnersData = []
        var shippingOwnersUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/shippingowner";
        $http.get(shippingOwnersUrl).success(function (data) {
            $scope.shippingOwnersLists = data;
            for (var i = 0; i < $scope.shippingOwnersLists.length; i++) {
                $scope.shippingOwnersData.push($scope.shippingOwnersLists[i]);
            }
        }).error(function (error, status) {

        });
    }

    $scope.listOfShippingCarriers = function () {
        $scope.shippingCarriersData = [];
        var shippingCarriersUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/carrierservices";
        $http.get(shippingCarriersUrl).success(function (data) {
            $scope.shippingCarriersLists = data;
            for (var i = 0; i < $scope.shippingCarriersLists.length; i++) {
                $scope.shippingCarriersData.push($scope.shippingCarriersLists[i]);
            }
        }).error(function (error, status) {

        });
    };

    $scope.singleorderData = {};
    var producted = [];
    // adding the product in table one by one
    $scope.addProduct = function (tableStockXferOrderSkusSkuQuantity, id, price) {
        if($scope.singleorderData.AvailableData < $scope.singleorderData.quantityNo){
             $scope.notify("Required quantity cannot be greater than available quantity.");
            return;
        }
        if($scope.tableSku == null || $scope.tableSku == undefined)
        {
           $scope.notify("Please provide product details");
            return;
        }

        if (tableStockXferOrderSkusSkuQuantity == undefined)
        {
           $scope.notify("Please give proper quantity.");
            return;
        }
        if($scope.singleorderData.FromwareHousesData == "" || $scope.singleorderData.FromwareHousesData == undefined)
        {
           $scope.notify('Please select source warehouse');
            return;
        }
        if (tableStockXferOrderSkusSkuQuantity > 0)
        {
            var tableSku = $scope.tableSku;
            var keepGoing = true;
            angular.forEach(producted, function(product)
            {
                if(keepGoing)
                {
                    if(product.tableSku.idtableSkuId == tableSku.idtableSkuId)
                    {
                        keepGoing = false;
                    }
                }
            });
            if(keepGoing)
            {
                producted.push({
                    tableSku: tableSku,
                    tableStockXferOrderSkusSkuQuantity: tableStockXferOrderSkusSkuQuantity,
                    "tableStockXferOrderSkuStateTrails": []
                });
            }
            else
            {
               $scope.notify("The selected product is already added. Delete the existing product first to update quantity.");
            }

            $scope.products = producted;
            $scope.$broadcast('angucomplete-alt:clearInput', 'products');
            $scope.tableSku = null;
            tableStockXferOrderSkusSkuQuantity = null;
            $scope.singleorderData.productObj = null;
            $scope.singleorderData.quantityNo = null;
            $scope.singleorderData.priceProd = null;
            $scope.singleorderData.productObject = undefined;
            $scope.singleorderData.AvailableData = "";
        }
    };

    $scope.clearProductList = function () {
        $scope.products = [];
    }

    $scope.WareHouseCheck = function () {
        if ($scope.singleorderData.TowareHousesData != undefined && $scope.singleorderData.FromwareHousesData != undefined) {
            if ($scope.singleorderData.TowareHousesData.idtableWarehouseDetailsId == $scope.singleorderData.FromwareHousesData.idtableWarehouseDetailsId) {
                $scope.WareHouseMatch = true;
            } else {
                $scope.WareHouseMatch = false;
            }
        }
    };

    $scope.HideError = function () {
        $scope.WareHouseMatch = false;
    };
    //remove the product
    $scope.removeProduct = function(index) {
        $scope.genericData.deleteItemIndex = index;
        if($scope.genericData.orderDialogMode == 'edit')
        {
            var sku = $scope.products[index].tableSku;
            if($scope.tableSku && (sku.idtableSkuId == $scope.tableSku.idtableSkuId))
            {
                $scope.singleorderData.AvailableData = "";
                $scope.$broadcast('angucomplete-alt:clearInput', 'products');
            }
        }
        $('#masterDeleteDialogue').modal('show');
    };
    $scope.deleteSelectedItem = function(){
        $scope.products.splice($scope.genericData.deleteItemIndex, 1);
        $scope.cancelmasterDeleteDialog();
        $scope.notify('Item deleted successfully.','success');
    };
    $scope.cancelmasterDeleteDialog = function(){
        $('#masterDeleteDialogue').modal('hide');
    };
    $scope.validateFormData = function() {

        if($scope.singleorderData.FromwareHousesData == null || $scope.singleorderData.FromwareHousesData == undefined)
        {
           $scope.notify('Select the "From Warehouse"');
            return false;
        }

        if($scope.singleorderData.TowareHousesData == null || $scope.singleorderData.TowareHousesData == undefined)
        {
           $scope.notify('Select the "To Warehouse"');
            return false;
        }

        if($scope.singleorderData.quantityType == null || $scope.singleorderData.quantityType == undefined)
        {
           $scope.notify('Select quantity type');
            return false;
        }

        if($scope.products == null || $scope.products == undefined || $scope.products.length == 0)
        {
           $scope.notify('Add SKUs in the list');
            return false;
        }

        return true;

    }

    //check Order Number
    $scope.checkOrderNumber = function(orderNo,systemOrderNo)
    {
        var q = $q.defer();
        if(orderNo == undefined || orderNo == "" || orderNo == null){
            q.resolve(false);
        }
        else
        {
            var checkOrderNo = MavenAppConfig.baseUrlSource + "/omsservices/webapi/stock/transfer/clientordernumber?clientordernumber=" + orderNo;
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
    $scope.setFormButtonValue = function (value) {
        $scope.submitActionButton = value;
    }
    $scope.submitAddOrderForm =  function (form)
    {
        $scope.disableOrderButton = true;
        if($scope.genericData.orderDialogMode == 'addnew' && $scope.submitActionButton == 'singleOrder'){
            $scope.saveSingleOrder(form);
        }
        else if($scope.genericData.orderDialogMode == 'edit'  && $scope.submitActionButton == 'updateOrder'){
            $scope.EditOrdered(form);
        }
        else if(($scope.genericData.orderDialogMode == 'addnew' || $scope.genericData.orderDialogMode == 'editdraft') && $scope.submitActionButton == 'saveDraft') {
            $scope.Drafted(form);
        }
        else if($scope.genericData.orderDialogMode == 'editdraft'  && $scope.submitActionButton == 'sendDraft'){
            $scope.SendDraft(form);
        }

    }
    $scope.saveSingleOrder = function (form) {

        $scope.checkOrderNumber($scope.singleorderData.orderNo).then(function (retval) {
            if (retval == true) {
                return;
            }
            else
            {
                if ($scope.validateFormData() == false) {
                    return;
                }
                var startDate, endDate;
                if ($scope.singleorderData.pickUpDate == null || $scope.singleorderData.pickUpDate == undefined) {
                    startDate = null;
                }
                else {
                    startDate = moment.utc($scope.singleorderData.pickUpDate).format();
                }

                if ($scope.singleorderData.dropDate == null || $scope.singleorderData.dropDate == undefined) {
                    endDate = null;
                }
                else {
                    endDate = moment.utc($scope.singleorderData.dropDate).format();
                }


                if ($scope.products.length == 0) {
                   $scope.notify('you need to add product and its quantity also')
                } else {
                    var StoPost = {
                        //"tableShippingCarrierServices": $scope.singleorderData.shipService,
                        //"tableShippingOwnership": $scope.singleorderData.shipOwner,
                        "tableWarehouseDetailsByTableStockXferOrderFromLocation": $scope.singleorderData.FromwareHousesData,
                        "tableWarehouseDetailsByTableStockXferOrderToLocation": $scope.singleorderData.TowareHousesData,
                        "tableStockXferOrderClientOrderNo": $scope.singleorderData.orderNo,
                        "tableStockXferOrderDate": null,
                        "tableStockXferOrderRemarks": $scope.singleorderData.Remarks,
                        "tableStockXferOrderShippingCharges": 0,
                        "tableStockXferOrderShippingTax": 0,
                        "tableStockXferOrderHasParent": null,
                        "tableStockXferOrderHasChildren": null,
                        "tableStockXferOrderPickupDatetime": startDate,
                        "tableStockXferOrderDropDatetime": endDate,
                        "tableStockXferOrderTags": [],
                        "tableStockXferOrderQuantityType": $scope.singleorderData.quantityType,
                        "tableStockXferOrderSkuses": $scope.products,

                        "tableStockXferOrder": null,
                        "tableStockXferOrders": []
                    };

                    $http({
                        method: 'POST',
                        url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/stock/transfer',
                        data: StoPost,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).success(function (res) {
                        if (res) {

                            $scope.cancelSingleOrder(form);
                            postData = null;
                            $scope.listOfStatesCount($scope.defaultTab);
                            $scope.notify("Order Added Successfully",'success');
                            $('#stockTransferDialog').modal('hide');
                        }
                    }).error(function (error, status)
                    {
                        $scope.disableOrderButton = false;
                        $scope.cancelSingleOrder(form);
                        if (status == 400) {
                            $scope.showBackEndStatusMessage(error);
                            return;
                        }
                       $scope.notify("Order Cant be Added");
                    });
                }
            }
        })
    };

    $scope.showBackEndStatusMessage = function(errorMessage){
       $scope.notify(errorMessage.errorMessage);
    }



    $scope.clearAction = function ()
    {
        $scope.filterObj = {};
        $scope.skuId = null;
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        $scope.$broadcast('angucomplete-alt:clearInput', 'productsfilter');
        $scope.listOfStatesCount($scope.defaultTab, 1, 'clearAction');
        $window.localStorage.removeItem('stockTransferFilter');
        $window.localStorage.removeItem('inboundTab');
        $window.localStorage.removeItem('outboundTab');
    };

    $scope.newTab = function(){
        if(Object.keys($scope.filterObj).length){
            var stockTransferField = {
                fromWarehouse : $scope.filterObj.fromWarehouse,
                toWarehouse : $scope.filterObj.toWarehouse,
                sku : $scope.filterObj.tableSku,
                orderid:$scope.filterObj.systemOrderNo,
                startDate:$scope.filterObj.start1Date,
                endDate:$scope.filterObj.end1Date
            }
            $window.localStorage.setItem('stockTransferFilter',JSON.stringify(stockTransferField))
        }
        $window.open($location.absUrl(), "_blank");
    }

    $scope.tableSku = null;
    $scope.searchedProduct = function (selected)
    {
        if (selected != null) {
            $scope.tableSku = selected.originalObject;
            $scope.getPriceOfProduct();
        }
    };

    $scope.searchedProductForFilter = function (selected)
    {
        if (selected != null && selected != undefined) {
            $scope.filterObj.tableSku = selected.originalObject;
            $scope.skuId = selected.originalObject.idtableSkuId;
            $scope.getPriceOfProduct();
        }else{
            $scope.skuId = undefined;
        }
    };

    $scope.checkQuantityType = function () {
        $scope.products = [];
        $scope.getPriceOfProduct();
    }
    $scope.getPriceOfProduct = function () {

        if($scope.tableSku == null || $scope.tableSku == undefined)
        {
            //No sufficient information to fetch quantity
            return;
        }

        if($scope.singleorderData != null)
        {
            if ($scope.singleorderData.FromwareHousesData == null || $scope.singleorderData.FromwareHousesData == undefined)
            {
                //No sufficient information to fetch quantity
                return;
            }
        }
        if($scope.singleorderData.quantityType == null || $scope.singleorderData.quantityType == undefined)
        {
            //No sufficient information to fetch quantity
            return;
        }

        if($scope.singleorderData.quantityType == "Good") {
            $http({
                method: 'GET',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/inventory/' + $scope.tableSku.idtableSkuId + '/inventoriescount?fromwarehouseid='
                + $scope.singleorderData.FromwareHousesData.idtableWarehouseDetailsId + '&towarehouseid='
                + $scope.singleorderData.TowareHousesData.idtableWarehouseDetailsId ,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (res) {
                $scope.singleorderData.AvailableData = res.totalInventory + res.contextualBlocked;
                $scope.updateQuantity();
            }).error(function (error, status) {
                $scope.singleorderData.AvailableData = 0;
                $scope.updateQuantity();
            });
        }
        if($scope.singleorderData.quantityType == "Bad") {
            $http({
                method: 'GET',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/inventory/sku/' + $scope.tableSku.idtableSkuId + '/warehouse/' + $scope.singleorderData.FromwareHousesData.idtableWarehouseDetailsId + '/badcount',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (res)
            {
                $scope.singleorderData.AvailableData = res;
                $scope.updateQuantity();
            }).error(function (error, status)
            {
                $scope.singleorderData.AvailableData = 0;
                $scope.updateQuantity();
            });
        }
    };


    $scope.updateQuantity = function()
    {
        if($scope.genericData.orderDialogMode == 'edit')
        {
            var update = true;
            for(var j =0 ;j < $scope.products.length ; j++)
            {
                if($scope.products[j].tableSku.idtableSkuId == $scope.tableSku.idtableSkuId)
                {
                    update = false;
                    break;
                }
            }
            for(var i=0;i<$scope.singleorderData.tableStockXferOrderSkuses.length && update == true;i++)
            {
                if($scope.tableSku.idtableSkuId  == $scope.singleorderData.tableStockXferOrderSkuses[0].tableSku.idtableSkuId)
                {
                    $scope.singleorderData.AvailableData += $scope.singleorderData.tableStockXferOrderSkuses[0].tableStockXferOrderSkusSkuQuantity;
                }
            }
        }
    }
//    ====================================== Quantity alert if greater than available value ========= //

    $scope.getQuantityProduct = function(available,InsertedQty){
        if(available < InsertedQty){
           $scope.notify('Required quantity cannot be greater than available quantity.')
        }
    };

//    =============================== deleting values from modal ======================== //

    $scope.cancelSingleOrder = function (form) {
        producted = [];
        $scope.disableQuickShipBox = [];
        $scope.editQuickShipBoxHideAndShow = [];
        $scope.OrderMode = "";
        $scope.singleorderData.wareHouses = null;
        $scope.products = [];
        $scope.BlockSkuAdd = false;
        $scope.pickupAddressName = null;
        $scope.singleorderData.orderNo = '';
        $scope.singleorderData.systemOrderNo = '';
        $scope.singleorderData.payment = null;
        $scope.singleorderData.FromwareHousesData = null;
        $scope.singleorderData.TowareHousesData = null;
        $scope.singleorderData.pickUpDate = null;
        $scope.singleorderData.dropDate = null;
        $scope.singleorderData.Remarks = null;
        $scope.singleorderData.quantityType = null;
        $scope.AwareMsg = false;
        $scope.fileName = "";
        $scope.skuId = null;
        $scope.tableSku = null;
        $scope.singleorderData.AvailableData = "";
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#stockTransferDialog').modal('hide');
        $scope.disableOrderButton = false;

    };

    $scope.cancelSingleOrders = function(form){
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
        $scope.skuId = null;
        $scope.tableSku = null;
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#stockTransferquickOperation').modal('hide');
    };

    $scope.cancelWarehouseSelection = function(form){
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#splitStockTransferbyquantity').modal('hide');
        $('#cancelStockTransferOrder').modal('hide');
        $('#splitStockTransferSku').modal('hide');
    }

    $scope.openEditAndReorderModal = function (order, screen, ev)
    {
        $scope.singleOrderMode = screen;
        var OutDate,InDate,DropDate=null,PickupDate=null;

        if($scope.genericData.orderDialogMode == 'editdraft' || $scope.genericData.orderDialogMode == 'edit')
        {
            $scope.singleorderData.orderNo = order.tableStockXferOrderClientOrderNo;
            $scope.singleorderData.systemOrderNo = order.tableStockXferOrderSystemOrderNo;
        }

        if(order.tableStockXferOrderPickupDatetime != null && order.tableStockXferOrderPickupDatetime != undefined)
        {
            $scope.singleorderData.pickUpDate = new Date(order.tableStockXferOrderPickupDatetime);
            $scope.sendAddStartDate($scope.singleorderData.pickUpDate);
        }
        else
        {
            $scope.startaddminDate = new Date();
            $scope.singleorderData.pickUpDate = null;
        }

        if(order.tableStockXferOrderDropDatetime != null && order.tableStockXferOrderDropDatetime != undefined)
        {
            $scope.singleorderData.dropDate = new Date(order.tableStockXferOrderDropDatetime);
            $scope.sendAddEndDate($scope.singleorderData.dropDate);
        }
        else
        {
            $scope.endaddminDate = new Date();
            $scope.singleorderData.dropDate = null;

        }

        $scope.singleorderData.Remarks = order.tableStockXferOrderRemarks;
        $scope.singleorderData.FromwareHousesData = order.tableWarehouseDetailsByTableStockXferOrderFromLocation;
        $scope.singleorderData.TowareHousesData = order.tableWarehouseDetailsByTableStockXferOrderToLocation;
        $scope.singleorderData.quantityType = order.tableStockXferOrderQuantityType;
        $scope.singleorderData.tableStockXferOrderRemarkses = order.tableStockXferOrderRemarkses;
        $scope.singleorderData.tableStockXferOrderSkuses = order.tableStockXferOrderSkuses;
        $scope.products = [];
        producted = [];
        $scope.disableOrderButton = false;
        angular.forEach(order.tableStockXferOrderSkuses, function (data)
        {
            $scope.products.push(data);
            producted.push(data);
        });

        $('#stockTransferDialog').modal('show');

    };

    $scope.initAddOrderModal = function (ev)
    {
        $scope.singleOrderTab = true;
        $scope.bulkOrderTab = false;
        $scope.singleOrderMode = "add";
        $scope.genericData.orderDialogMode = 'addnew';
        $scope.singleorderData.AvailableData = "";
        $scope.singleorderData.pickUpDate = null;
        $scope.singleorderData.dropDate = null;
        $scope.singleorderData = {};
        $scope.disableOrderButton = false;

        $('#stockTransferDialog').on('show.bs.modal' , function (e){
            $( "#ordertabs a:first"  ).tab('show');
        });
        $('#stockTransferDialog').modal('show');
    };

    //    ==================================== edit ST ================================= //
    $scope.EditOrder = function (order, ev)
    {
        $scope.singleOrderTab = true;
        $scope.bulkOrderTab = false;
        $scope.genericData.orderDialogMode = 'edit';
        for(var stSkuCounter = 0; stSkuCounter < order.tableStockXferOrderSkuses.length ; stSkuCounter++)
        {
            if(order.tableStockXferOrderSkuses[stSkuCounter].tableStockXferOrderSkuStateType.idtableStockXferOrderSkuStateTypeId == 16)
            {
                $scope.genericData.orderDialogMode = 'editdraft';
            }
        }

        $scope.singleorderData.StID = order.idtableStockXferOrderId;
        $scope.openEditAndReorderModal(order, $scope.genericData.orderDialogMode, ev);

    };

    $scope.EditOrdered = function (form)
    {
        $scope.checkOrderNumber($scope.singleorderData.orderNo,$scope.singleorderData.systemOrderNo).then(function (retval)
        {
            if (retval == true) {
                $scope.disableOrderButton = false;
                return;
            }
            else
            {
                if ($scope.validateFormData() == false) {
                    $scope.disableOrderButton = false;
                    return;
                }

                var startDate, endDate;

                if ($scope.singleorderData.pickUpDate == null || $scope.singleorderData.pickUpDate == undefined) {
                    startDate = null;
                }
                else {
                    startDate = moment.utc($scope.singleorderData.pickUpDate).format();
                }

                if ($scope.singleorderData.dropDate == null || $scope.singleorderData.dropDate == undefined) {
                    endDate = null;
                }
                else {
                    endDate = moment.utc($scope.singleorderData.dropDate).format();
                }

                var postData = {
                    "tableWarehouseDetailsByTableStockXferOrderFromLocation": $scope.singleorderData.FromwareHousesData,
                    "tableWarehouseDetailsByTableStockXferOrderToLocation": $scope.singleorderData.TowareHousesData,
                    "tableStockXferOrderQuantityType": $scope.singleorderData.quantityType,
                    "tableStockXferOrderClientOrderNo": $scope.singleorderData.orderNo,
                    "tableStockXferOrderDate": null,
                    "tableStockXferOrderRemarks": $scope.singleorderData.Remarks,
                    "tableStockXferOrderShippingCharges": 0,
                    "tableStockXferOrderShippingTax": 0,
                    "tableStockXferOrderHasParent": null,
                    "tableStockXferOrderHasChildren": null,
                    "tableStockXferOrderPickupDatetime": startDate,
                    "tableStockXferOrderDropDatetime": endDate,
                    "tableStockXferOrderTags": [],
                    "tableStockXferOrderSkuses": $scope.products,
                    "tableStockXferOrder": null,
                    "tableStockXferOrders": []
                };
                $http({
                    method: 'PUT',
                    url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/stock/transfer/' + $scope.singleorderData.StID + '/update',
                    data: postData,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function (res) {
                    if (res) {

                        $scope.cancelSingleOrder(form);
                        postData = null;
                        $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                        $scope.notify("Order updated successfully",'success');
                        $('#stockTransferDialog').modal('hide');
                    }
                }).error(function (error, status)
                {
                    $scope.disableOrderButton = false;
                    $scope.cancelSingleOrder(form);
                    $('#stockTransferDialog').modal('hide');
                    if (status == 400) {
                        $scope.showBackEndStatusMessage(error);
                        return;
                    }
                   $scope.notify("Failed to update order !!");
                });
            }
        })
    };

    $scope.dayDataCollapseFn = function () {
        $scope.dayDataCollapse = [];
        for (var i = 0; i < $scope.orderLists.length; i += 1) {
            $scope.dayDataCollapse.push(false);
        }
    }
//    ================================== table row expnsion ================================= //

    $scope.selectTableRow = function (index, storeId) {

        if (typeof $scope.dayDataCollapse === 'undefined') {
            $scope.dayDataCollapseFn();
        }

        if ($scope.tableRowExpanded === false && $scope.tableRowIndexExpandedCurr === "" && $scope.storeIdExpanded === "") {
            $scope.tableRowIndexExpandedPrev = "";
            $scope.tableRowExpanded = true;
            $scope.tableRowIndexExpandedCurr = index;
            $scope.storeIdExpanded = storeId;
            $scope.dayDataCollapse[index] = true;
        } else if ($scope.tableRowExpanded === true) {
            if ($scope.tableRowIndexExpandedCurr === index && $scope.storeIdExpanded === storeId) {
                $scope.tableRowExpanded = false;
                $scope.tableRowIndexExpandedCurr = "";
                $scope.storeIdExpanded = "";
                $scope.dayDataCollapse[index] = false;
            } else {
                $scope.tableRowIndexExpandedPrev = $scope.tableRowIndexExpandedCurr;
                $scope.tableRowIndexExpandedCurr = index;
                $scope.storeIdExpanded = storeId;
                $scope.dayDataCollapse[$scope.tableRowIndexExpandedPrev] = false;
                $scope.dayDataCollapse[$scope.tableRowIndexExpandedCurr] = true;
            }
        }

    };

    $scope.stateTrials = function (saleordskus) {
        $scope.trialsDataArray = [];
        $scope.trialIdArray = [];
        $scope.trialsLength = [];
        $scope.fullTrialsArray = [];
        $scope.fullIdArray = [];
        $scope.StateArray = [];
        for (var i = 0; i < saleordskus.length; i++) {
            $scope.StateArray.push(saleordskus[i].tableStockXferOrderSkuStateType.tableStockXferOrderSkuStateTypeString);
            var trials = saleordskus[i].tableStockXferOrderSkuStateTrails;
            $scope.trialsLength.push(trials.length);
            if (trials.length < 4) {
                for (var j = 0; j < trials.length; j++) {
                    $scope.trialsDataArray.push(trials[j].tableStockXferOrderSkuStateType.tableStockXferOrderSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tableStockXferOrderSkuStateType.idtableStockXferOrderSkuStateTypeId);
                }
            }

            if (trials.length == 4) {
                for (var j = 0; j < trials.length; j++) {
                    $scope.trialsDataArray.push(trials[j].tableStockXferOrderSkuStateType.tableStockXferOrderSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tableStockXferOrderSkuStateType.idtableStockXferOrderSkuStateTypeId);
                }
            }

            if (trials.length > 4) {
                var totalLength = trials.length - 4;
                for (var j = totalLength; j < trials.length; j++) {
                    $scope.trialsDataArray.push(trials[j].tableStockXferOrderSkuStateType.tableStockXferOrderSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tableStockXferOrderSkuStateType.idtableStockXferOrderSkuStateTypeId);
                }
            }


            $scope.fullTrialsArray.push($scope.trialsDataArray);
            $scope.fullIdArray.push($scope.trialIdArray);

            $scope.trialsDataArray = [];
            $scope.trialIdArray = [];

        }
    }


    $scope.openInfoBox = function (ev, stateTrials) {
        $scope.steps = [];
        for (var i = 0; i < stateTrials.length; i++) {
            var a = stateTrials.length - 1;
            var fulldate = $filter('utcToLocalOrHyphen')(stateTrials[i].tableStockXferOrderSkuStateTrailTimestamp);
            if (i < a) {
                $scope.steps.push({
                    title: stateTrials[i].tableStockXferOrderSkuStateType.tableStockXferOrderSkuStateTypeString,
                    active: true,
                    orderState: "Successful",
                    remarks: stateTrials[i].tableStockXferOrderSkuStateTrailRemarks,
                    fulldate: fulldate
                });
            }
            if (i == a) {
                $scope.steps.push({
                    title: stateTrials[i].tableStockXferOrderSkuStateType.tableStockXferOrderSkuStateTypeString,
                    orderState: "In Process",
                    remarks: stateTrials[i].tableStockXferOrderSkuStateTrailRemarks,
                    fulldate: fulldate
                });
            }
        }
        $('#infoDialog').modal('show');
    }


    $scope.cancelInfoBox = function () {
        $('#infoDialog').modal('hide');
    };

    $scope.cancelSaleOrderBox = function (ev, orderId, tableSaleOrderId, orderNo) {
        $scope.orderId = orderId;
        $scope.tableSaleOrderId = tableSaleOrderId;
        $scope.orderNo = orderNo;
        $scope.LoadNewRason = {};
        $scope.loadCancelReasons();
        $('#cancelStockTransferOrder').modal('show');
    }

    $scope.loadCancelReasons = function () {
        var headers = {
            'Content-Type': 'application/json'
        }
        var cancelReasonsUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/stockxfercancelreasons';
        $http.get(cancelReasonsUrl,headers).success(function (data) {
            $scope.cancelReasonArray = data;
        }).error(function (error, status) {

        });
    };

    $scope.selectCancelAction = function(orderId, tableSaleOrderId, remarks,otherReasonRemarks,form) {
        if (remarks != undefined && remarks=='other') {
            if (remarks == 'other') {
                //var UserRemarks = otherReasonRemarks;
                if ($scope.LoadNewRason.ReasonCheckBox == true) {
                    var postDataReason;
                    postDataReason = {
                        "tableStockXferCancelReasonString": $scope.LoadNewRason.reasonData
                    };
                    $http({
                        method: 'POST',
                        url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/stockxfercancelreasons',
                        data: postDataReason,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).success(function (data) {
                        $scope.loadCancelReasons();
                        $scope.notify('Cancel reason added successfully','success');
                    }).error(function (data) {
                    });
                }
            }
            var cancelUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/stock/transfer/skus/' + tableSaleOrderId + '/cancel/?remarks=' + otherReasonRemarks;
            var putdata = '';
            var headers = {
                'Content-Type': 'application/json'
            }
            $http.put(cancelUrl,headers,putdata).success(function (data)
            {
                $('#cancelStockTransferOrder').modal('hide');
                $scope.cancelWarehouseSelection(form);
                if (data) {
                    $scope.notify("Order cancelled",'success');
                    $scope.listOfStatesCount($scope.defaultTab);
                    for (var i = 0; i < $scope.orderLists.length; i += 1) {
                        $scope.dayDataCollapse[i] = false;
                    }
                }
            }).error(function (error, status) {
                $scope.cancelWarehouseSelection(form);
               $scope.notify("Order cannot be cancelled");
            });
        }
        else if (remarks != undefined && remarks!='other') {
            var putdata = '';
            var cancelUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/stock/transfer/skus/' + tableSaleOrderId + '/cancel/?remarks=' + remarks;
            $http.put(cancelUrl,putdata).success(function(data) {
                $scope.cancelWarehouseSelection(form);
                $('#cancelStockTransferOrder').modal('hide');
                if (data) {
                    $scope.notify("Order cancelled",'success');
                    $scope.listOfStatesCount($scope.defaultTab);
                    for (var i = 0; i < $scope.orderLists.length; i += 1) {
                        $scope.dayDataCollapse[i] = false;
                    }
                }
            }).error(function (error, status) {
                $scope.cancelWarehouseSelection(form);

               $scope.notify("Order cannot be cancelled");
            });
        }

    }


    $scope.totalCostAmount = function (allSkus) {
        var totalCost = 0;
        var totalCostAmount = 0;
        //var totalCostAll = [];
        for (var i = 0; i < allSkus.length; i++) {
            for (var j = 0; j < allSkus[i].tableStockXferOrderSkuInventoryMaps.length; j++) {
                var inventoryMap = allSkus[i].tableStockXferOrderSkuInventoryMaps[j];
                var count = 0;
                if(inventoryMap.tableStockXferOrderSkuInventoryMapQuantity == null){
                    if(inventoryMap.tableStockXferOrderSkuBadInwardQuantity != null){
                        count +=inventoryMap.tableStockXferOrderSkuBadInwardQuantity;
                    }
                    if(inventoryMap.tableStockXferOrderSkuBadOutwardQuantity != null){
                        count += inventoryMap.tableStockXferOrderSkuBadOutwardQuantity;
                    }
                }
                else{
                    count += inventoryMap.tableStockXferOrderSkuInventoryMapQuantity;
                }
                totalCostAmount += (inventoryMap.tableSkuInventoryByTableStockXferOrderSkuInventoryMapFromInventory.tableSkuInventoryMaxRetailPrice * count);
            }
            //totalCostAll.push(totalCostAmount);
        }
        return parseFloat(totalCostAmount).toFixed(2);
    };

//=============================================== Searching po ========================== //
    $scope.onRecordsPerPageChange = function (orderSize) {
        $scope.start = 0;
        $scope.orderSize = orderSize;
        $scope.end = 0;
        $scope.orderLists = [];
        $scope.listOfStatesCount($scope.defaultTab, 1);
    }
    var toWareHouse;
    $scope.listOfStatesCount = function (tabsValue, page, action) {

        $scope.defaultTab = tabsValue;
        $scope.allCount = 0;
        $scope.newCount = 0;
        $scope.processCount = 0;
        $scope.holdCount = 0;
        $scope.cancelledCount = 0;
        $scope.shippingCount = 0;

        var newCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/stock/transfer/filtercount?state=new&uipagename="+$scope.pagename;
        var processCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/stock/transfer/filtercount?state=process&uipagename="+$scope.pagename;
        var intransitCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/stock/transfer/filtercount?state=intransit&uipagename="+$scope.pagename;
        var grnCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/stock/transfer/filtercount?state=grn&uipagename="+$scope.pagename;
        var cancelledCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/stock/transfer/filtercount?state=cancelled&uipagename="+$scope.pagename;
        var draftCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/stock/transfer/filtercount?state=draft&uipagename="+$scope.pagename;
        var allCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/stock/transfer/filtercount?uipagename="+$scope.pagename;

        if ($scope.filterObj.fromWarehouse != undefined || $scope.filterObj.fromWarehouse != null) {


            newCountUrl += "&fromwarehouseid=" + $scope.filterObj.fromWarehouse.idtableWarehouseDetailsId;
            processCountUrl += "&fromwarehouseid=" + $scope.filterObj.fromWarehouse.idtableWarehouseDetailsId;
            intransitCountUrl += "&fromwarehouseid=" + $scope.filterObj.fromWarehouse.idtableWarehouseDetailsId;
            grnCountUrl += "&fromwarehouseid=" + $scope.filterObj.fromWarehouse.idtableWarehouseDetailsId;
            cancelledCountUrl += "&fromwarehouseid=" + $scope.filterObj.fromWarehouse.idtableWarehouseDetailsId;
            allCountUrl += "&fromwarehouseid=" + $scope.filterObj.fromWarehouse.idtableWarehouseDetailsId;
            draftCountUrl += "&fromwarehouseid=" + $scope.filterObj.fromWarehouse.idtableWarehouseDetailsId;
        }
        if ($scope.skuId) {
            newCountUrl += "&skuid=" + $scope.skuId;
            processCountUrl += "&skuid=" + $scope.skuId;
            intransitCountUrl += "&skuid=" + $scope.skuId;
            grnCountUrl += "&skuid=" + $scope.skuId;
            cancelledCountUrl += "&skuid=" + $scope.skuId;
            allCountUrl += "&skuid=" + $scope.skuId;
            draftCountUrl += "&skuid=" + $scope.skuId;
        }
        if ($scope.filterObj.toWarehouse) {
            newCountUrl += "&towarehouseid=" + $scope.filterObj.toWarehouse.idtableWarehouseDetailsId;
            processCountUrl += "&towarehouseid=" + $scope.filterObj.toWarehouse.idtableWarehouseDetailsId;
            intransitCountUrl += "&towarehouseid=" + $scope.filterObj.toWarehouse.idtableWarehouseDetailsId;
            grnCountUrl += "&towarehouseid=" + $scope.filterObj.toWarehouse.idtableWarehouseDetailsId;
            cancelledCountUrl += "&towarehouseid=" + $scope.filterObj.toWarehouse.idtableWarehouseDetailsId;
            allCountUrl += "&towarehouseid=" + $scope.filterObj.toWarehouse.idtableWarehouseDetailsId;
            draftCountUrl += "&towarehouseid=" + $scope.filterObj.toWarehouse.idtableWarehouseDetailsId;
        }
        if ($scope.filterObj.systemOrderNo) {
            newCountUrl += "&orderid=" + $scope.filterObj.systemOrderNo;
            processCountUrl += "&orderid=" + $scope.filterObj.systemOrderNo;
            intransitCountUrl += "&orderid=" + $scope.filterObj.systemOrderNo;
            grnCountUrl += "&orderid=" + $scope.filterObj.systemOrderNo;
            cancelledCountUrl += "&orderid=" + $scope.filterObj.systemOrderNo;
            allCountUrl += "&orderid=" + $scope.filterObj.systemOrderNo;
            draftCountUrl += "&orderid=" + $scope.filterObj.systemOrderNo;
        }
        if ($scope.filterObj.stRefNo) {
            newCountUrl += "&clientorderid=" + $scope.filterObj.stRefNo;
            processCountUrl += "&clientorderid=" + $scope.filterObj.stRefNo;
            intransitCountUrl += "&clientorderid=" + $scope.filterObj.stRefNo;
            grnCountUrl += "&clientorderid=" + $scope.filterObj.stRefNo;
            cancelledCountUrl += "&clientorderid=" + $scope.filterObj.stRefNo;
            allCountUrl += "&clientorderid=" + $scope.filterObj.stRefNo;
            draftCountUrl += "&clientorderid=" + $scope.filterObj.stRefNo;
        }
        if ($scope.filterObj.startDate) {
            newCountUrl += "&startdate=" + $scope.filterObj.startDate;
            processCountUrl += "&startdate=" + $scope.filterObj.startDate;
            intransitCountUrl += "&startdate=" + $scope.filterObj.startDate;
            grnCountUrl += "&startdate=" + $scope.filterObj.startDate;
            cancelledCountUrl += "&startdate=" + $scope.filterObj.startDate;
            allCountUrl += "&startdate=" + $scope.filterObj.startDate;
            draftCountUrl += "&startDate=" + $scope.filterObj.startDate;
        }
        if ($scope.filterObj.endDate) {
            newCountUrl += "&enddate=" + $scope.filterObj.endDate;
            processCountUrl += "&enddate=" + $scope.filterObj.endDate;
            intransitCountUrl += "&enddate=" + $scope.filterObj.endDate;
            grnCountUrl += "&enddate=" + $scope.filterObj.endDate;
            cancelledCountUrl += "&enddate=" + $scope.filterObj.endDate;
            allCountUrl += "&enddate=" + $scope.filterObj.endDate;
            draftCountUrl += "&endDate=" + $scope.filterObj.endDate;
        }
        var promises = [
            $http.get(allCountUrl),
            $http.get(newCountUrl),
            $http.get(processCountUrl),
            $http.get(intransitCountUrl),
            $http.get(grnCountUrl),
            $http.get(cancelledCountUrl),
            $http.get(draftCountUrl)
        ];
        $q.all(promises)
            .then(function (response) {
                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }
                    vm.pager = pagerService.GetPager(vm.dummyItems.length, page,$scope.orderSize);
                    $scope.vmPager = vm.pager;

                    $scope.start = (vm.pager.currentPage - 1) * $scope.orderSize;

                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;

                    if (action == 'clearAction') {
                        $scope.listOfOrders(tabsValue, $scope.start, 'clearAction');
                    } else {
                        $scope.listOfOrders(tabsValue, $scope.start);
                    }
                }
                $scope.orderLists = [];
                $scope.showLoader = true;
                $scope.allCount = response[0].data;
                $scope.newCount = response[1].data;
                $scope.processCount = response[2].data;
                $scope.intransitCount = response[3].data;
                $scope.grnCount = response[4].data;
                $scope.cancelledCount = response[5].data;
                $scope.DraftCount = response[6].data;
                var vm = this;
                vm.pager = {};
                if (tabsValue == 'all')  {
                    vm.dummyItems = _.range(0, $scope.allCount);
                }
                else if (tabsValue == 'new'){
                    vm.dummyItems = _.range(0, $scope.newCount);
                }
                else if (tabsValue == 'process'){
                    vm.dummyItems = _.range(0, $scope.processCount);
                }
                else if (tabsValue == 'intransit'){
                    vm.dummyItems = _.range(0, $scope.intransitCount);
                }
                else if (tabsValue == 'grn'){
                    vm.dummyItems = _.range(0, $scope.grnCount);
                }
                else if (tabsValue == 'cancelled') {
                    vm.dummyItems = _.range(0, $scope.cancelledCount);
                }
                else if (tabsValue == 'draft'){
                    vm.dummyItems = _.range(0, $scope.DraftCount);
                }
                if (page == undefined) {
                    setPage(1);
                }
                if (page != undefined) {
                    setPage(page);
                }

            })
            .catch(function (error) {

            });

    };
    $scope.submitAction = function () {



        if ($scope.filterObj.start1Date != undefined)
        {
            $scope.filterObj.startDate = moment.utc($scope.filterObj.start1Date).format();
        }
        if ($scope.filterObj.end1Date != undefined)
        {
            $scope.filterObj.endDate = moment.utc($scope.filterObj.end1Date).format();
        }

        $scope.listOfStatesCount($scope.defaultTab, 1);
    }

    if ($window.localStorage.getItem("stockTransferFilter") !== null) {
        var stockTransferField = JSON.parse($window.localStorage.getItem("stockTransferFilter"));
        $scope.filterObj.systemOrderNo = stockTransferField.orderid;
        $scope.filterObj.toWarehouse = stockTransferField.toWarehouse;
        $scope.filterObj.fromWarehouse = stockTransferField.fromWarehouse;
        $scope.filterObj.start1Date = stockTransferField.startDate;
        $scope.filterObj.end1Date = stockTransferField.endDate;
        $scope.filterObj.tableSku = stockTransferField.sku;
        $scope.skuId = stockTransferField.sku ? stockTransferField.sku.idtableSkuId : null;
        $scope.submitAction();

    }

    //=========================================== Print Labels ====================================== //


    $scope.submitPrintBarcodeForm = function(form){

        if($scope.barcode.warehousetype && $scope.barcode.warehousetype == 3)
        {
            $scope.previewTemp = MavenAppConfig.baseUrlSource+'/omsservices/webapi/skus/'+$scope.barcode.skuid+'/printskubarcode?fnsku=true&barcodetype='+$scope.barcode.type + '&quantity=' + $scope.barcode.quantity;
        }
        else
        {
            $scope.previewTemp = MavenAppConfig.baseUrlSource+'/omsservices/webapi/skus/'+$scope.barcode.skuid+'/printskubarcode?barcodetype='+$scope.barcode.type + '&quantity=' + $scope.barcode.quantity;
        }

        window.open($scope.previewTemp);
        $http.get($scope.previewTemp, {
            responseType: 'arraybuffer'
        })
            .success(function(response) {
                var file = new Blob([(response)], {
                    type: 'application/pdf'
                });
                var fileURL = URL.createObjectURL(file);
                $scope.content = $sce.trustAsResourceUrl(fileURL);
                $('#barcodeprinting').modal('hide');
                $scope.barcode = {};
            }).error(function(data){
        });

    };


    $scope.printLabel = function(value,warehousetype){
        $scope.barcode.skuid = value.tableSku.idtableSkuId;
        $scope.barcode.type = 'Standard';
        $scope.barcode.warehousetype = warehousetype;
        $('#barcodeprinting').modal('show');
    };

    $scope.cancelPrintLabelModal = function(form)
    {
        $scope.barcode = {};
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#barcodeprinting').modal('hide');
    }


    $scope.printPackageLabel = function(value){
        $scope.packagelabelurl = MavenAppConfig.baseUrlSource+'/omsservices/webapi/stock/transfer/'+value.idtableStockXferOrderId+'/packagelabels';
        window.open($scope.packagelabelurl);
        $http.get($scope.packagelabelurl, {
            responseType: 'arraybuffer'
        }).success(function(response) {
            var file = new Blob([(response)], {
                type: 'octet/stream'
            });
            var fileURL = URL.createObjectURL(file);
            $scope.content = $sce.trustAsResourceUrl(fileURL);
        }).error(function(data){
        });
    };

    $scope.intransitStOrderModal = function(value)
    {
        $scope.intransitstOrder = value;
        $("#stIntransitModalDialog").modal('show');
    }

    $scope.intransitStOrder = function()
    {
        $scope.intransiturl = MavenAppConfig.baseUrlSource+'/omsservices/webapi/stock/transfer/'+$scope.intransitstOrder.idtableStockXferOrderId+'/intransit';

        $http({
            method: 'PUT',
            url: $scope.intransiturl,
            data : ''
        }).success(function (data) {
            $scope.notify("updated successfully",'success');
            $scope.cancelIntransitModal();
            $scope.listOfStatesCount('process',1);
        }).error(function(error,status){
           $scope.notify("Failed to update order to intransit");
            $scope.cancelIntransitModal();
        });
    }

    $scope.cancelIntransitModal = function()
    {
        $scope.intransitstOrder = {};
        $("#stIntransitModalDialog").modal('hide');
    }

    $scope.printPalletLabelModal = function(value)
    {
        $scope.intransitstOrder = value;
        $("#fbaPalletLabelModalDialog").modal('show');
    }

    $scope.cancelFbaPalletLabelModal = function()
    {
        $scope.intransitstOrder = {};
        $("#fbaPalletLabelModalDialog").modal('hide');
    }

    $scope.printPalletLabel = function(numberofpallet)
    {
        $scope.palletlabelurl = MavenAppConfig.baseUrlSource+'/omsservices/webapi/stock/transfer/'+$scope.intransitstOrder.idtableStockXferOrderId+'/palletlabel?numberofpallet='+numberofpallet;
        window.open($scope.palletlabelurl);
        $http.get($scope.palletlabelurl, {
            responseType: 'arraybuffer'
        }).success(function(response) {
            var file = new Blob([(response)], {
                type: 'octet/stream'
            });
            var fileURL = URL.createObjectURL(file);
            $scope.content = $sce.trustAsResourceUrl(fileURL);
            $scope.cancelFbaPalletLabelModal();
        }).error(function(data){
           $scope.notify("Failed to print label")
        });
    }

    $scope.fbaorder = {};

    $scope.FBAprepInstruction = function(orderskuid)
    {
        var url = MavenAppConfig.baseUrlSource+'/omsservices/webapi/stock/transfer/skus/'+orderskuid+'/prepinstruction';
        $http.get(url).success(function (data) {
            $scope.fbaorder.prepinstruction = data;
            $("#fbaPrepInstructionModalDialog").modal('show');
        }).error(function(error,status){
           $scope.notify("Failed to get FBA Instruction");
        });
    }

    $scope.cancelfbaPrepInstructionModal = function()
    {
        $scope.fbaorder = {};
        $("#fbaPrepInstructionModalDialog").modal('hide');
    }

    //========================================== Ends Here ======================================== //


    $scope.Drafted = function (form)
    {
        $scope.checkOrderNumber($scope.singleorderData.orderNo, $scope.singleorderData.systemOrderNo).then(function (retval) {
            if (retval == true) {
                $scope.disableOrderButton = false;
                return;
            }
            else {

                if ($scope.validateFormData() == false) {
                    $scope.disableOrderButton = false;
                    return;
                }
                var startDate, endDate;

                if ($scope.singleorderData.pickUpDate == null || $scope.singleorderData.pickUpDate == undefined) {
                    startDate = null;
                }
                else {
                    startDate = moment.utc($scope.singleorderData.pickUpDate).format();
                }

                if ($scope.singleorderData.dropDate == null || $scope.singleorderData.dropDate == undefined) {
                    endDate = null;
                }
                else {
                    endDate = moment.utc($scope.singleorderData.dropDate).format();
                }

                var StoPost = {
                    "tableWarehouseDetailsByTableStockXferOrderFromLocation": $scope.singleorderData.FromwareHousesData,
                    "tableWarehouseDetailsByTableStockXferOrderToLocation": $scope.singleorderData.TowareHousesData,
                    "tableStockXferOrderQuantityType": $scope.singleorderData.quantityType,
                    "tableStockXferOrderClientOrderNo": $scope.singleorderData.orderNo,
                    "tableStockXferOrderDate": null,
                    "tableStockXferOrderRemarks": $scope.singleorderData.Remarks,
                    "tableStockXferOrderShippingCharges": 0,
                    "tableStockXferOrderShippingTax": 0,
                    "tableStockXferOrderHasParent": null,
                    "tableStockXferOrderHasChildren": null,
                    "tableStockXferOrderPickupDatetime": startDate,
                    "tableStockXferOrderDropDatetime": endDate,
                    "tableStockXferOrderTags": [],
                    "tableStockXferOrderSkuses": $scope.products,
                    "tableStockXferOrder": null,
                    "tableStockXferOrders": []
                };
                var PostDataUrl, requestMethod, successMessage, failedMessage;
                if ($scope.genericData.orderDialogMode == 'editdraft') {
                    successMessage = 'Draft updated successfully';
                    failedMessage = 'Failed to update draft';
                    PostDataUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/stock/transfer/' + $scope.singleorderData.StID + '/editdraft';
                    requestMethod = 'PUT';
                }
                if ($scope.genericData.orderDialogMode == 'addnew') {
                    successMessage = 'Draft created successfully';
                    failedMessage = 'Failed to create draft';
                    PostDataUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/stock/transfer/draft';
                    requestMethod = 'POST';
                }
                $http({
                    method: requestMethod,
                    url: PostDataUrl,
                    data: StoPost,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function (res) {
                    if (res) {
                        $scope.cancelSingleOrder(form);
                        postData = null;
                        $scope.listOfStatesCount($scope.defaultTab);
                        $scope.notify(successMessage,'success');
                        $mdDialog.hide();
                    }
                }).error(function (error, status)
                {
                    $scope.disableOrderButton = false;
                    $scope.cancelSingleOrder(form);
                    if (status == 400) {
                        $scope.showBackEndStatusMessage(error);
                    }
                    else {
                       $scope.notify(failedMessage);
                    }
                });
            }
        })
    };

    //================== DeleteDraft order ==================== //

    $scope.DeleteDraft = function(data)
    {
        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/stock/transfer/' + data.idtableStockXferOrderId + '/deletedraft'
        }).success(function (data)
        {
            $scope.listOfStatesCount($scope.defaultTab);

        }).error(function (error, status)
        {
            if(status == 400)
            {
                $scope.showBackEndStatusMessage(error);
            }
            else
            {
               $scope.notify('Failed to delete draft');
            }
        });
    };

    $scope.SendDraft = function(form)
    {
        $scope.checkOrderNumber($scope.singleorderData.orderNo,$scope.singleorderData.systemOrderNo).then(function (retval) {
            if (retval == true) {
                $scope.disableOrderButton = false;
                return;
            }
            else
            {
                if ($scope.validateFormData() == false) {
                    $scope.disableOrderButton = false;
                    return;
                }
                var startDate, endDate;

                if ($scope.singleorderData.pickUpDate == null || $scope.singleorderData.pickUpDate == undefined) {
                    startDate = null;
                }
                else {
                    startDate = moment.utc($scope.singleorderData.pickUpDate).format();
                }

                if ($scope.singleorderData.dropDate == null || $scope.singleorderData.dropDate == undefined) {
                    endDate = null;
                }
                else {
                    endDate = moment.utc($scope.singleorderData.dropDate).format();
                }
                var StartOrderDate = moment(startDate);
                var EndOrderDate = moment(endDate);
                var CurrentOrderDate = moment().subtract(1, 'days');

                if (CurrentOrderDate > StartOrderDate) {
                   $scope.notify("Order date can't be older than today. ");
                }
                else {
                    var StoPost = {
                        "tableWarehouseDetailsByTableStockXferOrderFromLocation": $scope.singleorderData.FromwareHousesData,
                        "tableWarehouseDetailsByTableStockXferOrderToLocation": $scope.singleorderData.TowareHousesData,
                        "tableStockXferOrderQuantityType": $scope.singleorderData.quantityType,
                        "tableStockXferOrderClientOrderNo": $scope.singleorderData.orderNo,
                        "tableStockXferOrderDate": null,
                        "tableStockXferOrderRemarks": $scope.singleorderData.Remarks,
                        "tableStockXferOrderShippingCharges": 0,
                        "tableStockXferOrderShippingTax": 0,
                        "tableStockXferOrderHasParent": null,
                        "tableStockXferOrderHasChildren": null,
                        "tableStockXferOrderPickupDatetime": startDate,
                        "tableStockXferOrderDropDatetime": endDate,
                        "tableStockXferOrderTags": [],
                        "tableStockXferOrderSkuses": $scope.products,

                        "tableStockXferOrder": null,
                        "tableStockXferOrders": []
                    };
                    $http({
                        method: 'POST',
                        url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/stock/transfer/' + $scope.singleorderData.StID + '/confirmdraft',
                        data: StoPost,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).success(function (res) {
                        if (res) {

                            $scope.cancelSingleOrder(form);
                            StoPost = null;
                            $scope.listOfStatesCount($scope.defaultTab);
                            $scope.notify("Order Added Successfully",'success');
                            $('#stockTransferDialog').modal('hide');
                        }
                    }).error(function (error, status)
                    {
                        $scope.disableOrderButton = false;
                        $scope.cancelSingleOrder(form);
                        $('#stockTransferDialog').modal('hide');
                        if (status == 400) {
                            $scope.showBackEndStatusMessage(error);
                            return;
                        }
                       $scope.notify("Failed to confirm draft");
                    });
                }
            }
        })
    }

//    ============================================== ADd GRN ====================================== //

    $scope.quickGRNSkuDetails = {};

    $scope.getDateFormat = function (date) {
        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();
        return day + "-" + monthIndex + "-"+year;
    }

    $scope.showGRNDialog = function (ev, orderSkusList,data)
    {
        var arraySku = [];
        if(orderSkusList){
            arraySku.push(orderSkusList);

        }
        else{
            angular.forEach(data,function (sku,idx) {
                if(sku.tableStockXferOrderSkuStateType.tableStockXferOrderSkuStateTypeString != 'GRN Generated'){
                    arraySku.push(sku);
                }
            })
        }


        $scope.disableSubmitGrn = false;
        $scope.quickGRNSkuDetails.tableSkuInventoryRecords = [];

        $scope.quickGRNSkuDetails.GRnData = arraySku;

        for(var orderSkuCounter = 0; orderSkuCounter < arraySku.length ; orderSkuCounter++)
        {
            var orderSku;
            orderSku = arraySku[orderSkuCounter];
            $scope.SkuDisabled = true;
            for(var skuInventoryRecordsCount = 0; skuInventoryRecordsCount < orderSku.tableStockXferOrderSkuInventoryMaps.length; skuInventoryRecordsCount++)
            {
                orderSku.tableStockXferOrderSkuInventoryMaps[skuInventoryRecordsCount].tableSku = orderSku.tableSku;

            }
            if($scope.quickGRNSkuDetails.tableSkuInventoryRecords == null || $scope.quickGRNSkuDetails.tableSkuInventoryRecords == undefined )
            {
                $scope.quickGRNSkuDetails.tableSkuInventoryRecords = orderSku.tableStockXferOrderSkuInventoryMaps;
            }
            else
            {
                $scope.quickGRNSkuDetails.tableSkuInventoryRecords = $scope.quickGRNSkuDetails.tableSkuInventoryRecords.concat(orderSku.tableStockXferOrderSkuInventoryMaps);
            }
        }
        $scope.totalGRNQuantity = 0;
        $scope.genericData.selectAllSTGrnItems=false;
        $('#stgrnallitemsid').modal('show');

    };
    // This method will check all the Checkboxes at once in Stock Transfer In Grn Dialog Box
    $scope.onSelectAllSTGrnItemsClicked=function()
    {

        if($scope.genericData.selectAllSTGrnItems)
        {

            for(var counter=0;counter<$scope.quickGRNSkuDetails.tableSkuInventoryRecords.length;counter++)
            {
                $scope.quickGRNSkuDetails.tableSkuInventoryRecords[counter].selected = true;
            }
        }
        else
        {

            for(var counter=0;counter<$scope.quickGRNSkuDetails.tableSkuInventoryRecords.length;counter++)
            {
                $scope.quickGRNSkuDetails.tableSkuInventoryRecords[counter].selected = false;
            }
        }
    }
    // This method will check the particular checkbox in Stock Transfer In Grn Dialog Box
    $scope.onSelectSTGrnItemClicked=function()
    {
        for(var counter = 0; counter<$scope.quickGRNSkuDetails.tableSkuInventoryRecords.length;counter++)
        {
            if (!$scope.quickGRNSkuDetails.tableSkuInventoryRecords[counter].selected || $scope.quickGRNSkuDetails.tableSkuInventoryRecords[counter].selected==null)
            {
                $scope.genericData.selectAllSTGrnItems = false;
                break;
            }
            else
            {
                $scope.genericData.selectAllSTGrnItems = true;
            }
        }
    }
    // This method will reset the Actual Quantity,Good Quantity and Bad Quantity in the Stock Transfer In Dialog Box
    $scope.cancelQuickGRN = function()
    {
        for(var counter = 0; counter<$scope.quickGRNSkuDetails.tableSkuInventoryRecords.length;counter++)
        {
            $scope.quickGRNSkuDetails.tableSkuInventoryRecords[counter].selected=false;
            $scope.quickGRNSkuDetails.tableSkuInventoryRecords[counter].tableSkuInventoryByTableStockXferOrderSkuInventoryMapToInventory.tableSkuInventoryActualInwardCount=null;
            $scope.quickGRNSkuDetails.tableSkuInventoryRecords[counter].tableSkuInventoryByTableStockXferOrderSkuInventoryMapToInventory.tableSkuInventoryAvailableCount=null;
            $scope.quickGRNSkuDetails.tableSkuInventoryRecords[counter].tableSkuInventoryByTableStockXferOrderSkuInventoryMapToInventory.tableSkuInventoryInwardQcFailedCount=null;
        }
        $scope.genericData.selectAllSTGrnItems=false;
        $('#stgrnallitemsid').modal('hide');

    }

    $scope.postGRN = function(orderskuid, grndata)
    {
        var deferred = $q.defer();

        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/stock/transfer/skus/' + orderskuid + '/quickgrn',
            data: grndata,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (data) {
            $scope.notify('Quick GRN successful','success');
            $scope.listOfStatesCount($scope.defaultTab);

            for (var i = 0; i < $scope.orderLists.length; i += 1) {
                $scope.dayDataCollapse[i] = false;
            }

            deferred.resolve(data);
            $('#stgrnallitemsid').modal('hide');
        }).error(function (data)
        {
            $scope.disableSubmitGrn = false;
            if (status == 400) {
                $scope.showBackEndStatusMessage(error);
                return;
            }

           $scope.notify(data.errorMessage);
            $('#stgrnallitemsid').modal('hide');

        });

        return deferred.promise;
    }
    $scope.postGRNAll = function(grndata)
    {
        var deferred = $q.defer();

        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/stock/transfer/skus/quickgrn/bulkupload',
            data: grndata,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (data) {
            $scope.notify('Quick GRN successful','success');
            $scope.listOfStatesCount($scope.defaultTab);

            for (var i = 0; i < $scope.orderLists.length; i += 1) {
                $scope.dayDataCollapse[i] = false;
            }

            deferred.resolve(data);
            $('#stgrnallitemsid').modal('hide');
        }).error(function (data)
        {
            $scope.disableSubmitGrn = false;
            if (status == 400) {
                $scope.showBackEndStatusMessage(error);
                return;
            }

           $scope.notify(data.errorMessage);
            $('#stgrnallitemsid').modal('hide');

        });

        return deferred.promise;
    }

    $scope.onActualInwardEntered = function ()
    {
        $scope.totalGRNQuantity = 0;
        for(var stskucounter = 0; stskucounter < $scope.quickGRNSkuDetails.GRnData.length;stskucounter++) {
            var data = $scope.quickGRNSkuDetails.GRnData[stskucounter];
            for(var inventoryMapCounter = 0; inventoryMapCounter < data.tableStockXferOrderSkuInventoryMaps.length;inventoryMapCounter++) {
                if (data.tableStockXferOrderSkuInventoryMaps[inventoryMapCounter].tableSkuInventoryByTableStockXferOrderSkuInventoryMapToInventory.tableSkuInventoryActualInwardCount != null) {
                    $scope.totalGRNQuantity += data.tableStockXferOrderSkuInventoryMaps[inventoryMapCounter].tableSkuInventoryByTableStockXferOrderSkuInventoryMapToInventory.tableSkuInventoryActualInwardCount;
                }
            }
        }
    }
    // The below method is called in Stock Transfer In Grn Dialog Box.
    // After being visible this method will alert the user when quantity entered in the checkbox is greater
    // than actual quantity.
    $scope.isQcPassChecksPass = function (qcPassed,actualQty)
    {
        if (qcPassed > actualQty)
        {
            $scope.notify("Good Qty can not be greater than Actual Qty");
        }
                return true;



    }

    // The below method is called in Stock Transfer In Grn Dialog Box and
    // and will alert the user when qty is entered in the given textbox is greater than expected qty.
    $scope.isActualQtyGreaterThanSTQty=function(actualQty,expectedQty)
    {
        if(actualQty>expectedQty)
        {
            $scope.notify("Actual Qty can not be greater than Expected Qty");

        }
        return false;
    }

    $scope.SubmitGrn = function (data1)
    {
        var data = angular.copy(data1);
        var isChecked=0;
        for(var inventoryMapCounter = 0; inventoryMapCounter < data.length;inventoryMapCounter++)
        {
            if(data[inventoryMapCounter].selected)
            {
                isChecked+=1;
            }
        }
        if(isChecked==0)
        {
            $scope.notify('Select at least one checkbox');
            return;
        }

        for (var inventoryMapCounter = 0; inventoryMapCounter < data.length; inventoryMapCounter++) {
            if (data[inventoryMapCounter].selected) {

                if (data[inventoryMapCounter].tableSkuInventoryByTableStockXferOrderSkuInventoryMapToInventory.tableSkuInventoryActualInwardCount == null) {
                    $scope.notify('Enter a valid value in Actual Quantity');
                    return;
                }
                if (data[inventoryMapCounter].tableSkuInventoryByTableStockXferOrderSkuInventoryMapToInventory.tableSkuInventoryActualInwardCount
                    >
                    data[inventoryMapCounter].tableSkuInventoryByTableStockXferOrderSkuInventoryMapToInventory.tableSkuInventoryExpectedInwardCount) {
                    $scope.notify("Actual Quantity can not be greater than Expected Quantity");
                    return;
                }
                if (data[inventoryMapCounter].tableSkuInventoryByTableStockXferOrderSkuInventoryMapToInventory.tableSkuInventoryAvailableCount == null) {
                    $scope.notify('Enter a valid value in Good Quantity');
                    return;
                }
                if (data[inventoryMapCounter].tableSkuInventoryByTableStockXferOrderSkuInventoryMapToInventory.tableSkuInventoryInwardQcFailedCount == null) {
                    $scope.notify('Enter a valid value in Bad Quantity');
                    return;
                }

                if ((data[inventoryMapCounter].tableSkuInventoryByTableStockXferOrderSkuInventoryMapToInventory.tableSkuInventoryAvailableCount
                        + data[inventoryMapCounter].tableSkuInventoryByTableStockXferOrderSkuInventoryMapToInventory.tableSkuInventoryInwardQcFailedCount) !=
                    data[inventoryMapCounter].tableSkuInventoryByTableStockXferOrderSkuInventoryMapToInventory.tableSkuInventoryActualInwardCount) {
                    $scope.notify("Sum of Good Quantity and Bad Quantity should not be greater than Actual Quantity");
                    return;
                }
            }
        }

        var skuInventoryMap = [];
        for (var orderSKUCounter = 0; orderSKUCounter < $scope.quickGRNSkuDetails.GRnData.length; orderSKUCounter++) {

            for (var inventoryMapCounter = 0; inventoryMapCounter < data.length; inventoryMapCounter++) {
                if (data[inventoryMapCounter].selected && data[inventoryMapCounter].tableSku != null && data[inventoryMapCounter].tableSku != undefined) {
                    if ($scope.quickGRNSkuDetails.GRnData[orderSKUCounter].tableSku.idtableSkuId == data[inventoryMapCounter].tableSku.idtableSkuId) {
                        delete(data[inventoryMapCounter]["tableSku"]);
                        delete(data[inventoryMapCounter]["selected"])
                        skuInventoryMap.push({
                            'orderskuid': $scope.quickGRNSkuDetails.GRnData[orderSKUCounter].idtableStockXferOrderSkusId,
                            'inventories': [data[inventoryMapCounter]]
                        });
                    }
                }
            }


        }
        $scope.postGRNAll(skuInventoryMap);
    };

    $scope.checkEditButton = function (Stdata)
    {
        var v = true;
        angular.forEach(Stdata.tableStockXferOrderSkuses, function (item) {
            var value = item.tableStockXferOrderSkuStateType.idtableStockXferOrderSkuStateTypeId;
            if (value != 1 && value != 2 && value != 3 && value != 4 && value != 5 && value != 6 && value != 7) {
                v = false;
            }
        });
        return v;
    };

    $scope.startmaxDate = new Date();
    $scope.endmaxDate = new Date();

    $scope.clearStartDate = function() {
        $scope.filterObj.startDate = "";
        $scope.filterObj.start1Date = null;
        if($scope.filterObj.end1Date == null) {
            $scope.startmaxDate = new Date();
        }
        else
        {
            $scope.sendEndDate($scope.filterObj.end1Date);
        }
        $scope.endminDate = null;
    }

    $scope.clearEndDate = function() {
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

    $scope.sendStartDate = function(date) {
        $scope.startDateData = new Date(date);
        $scope.endminDate = new Date(
            $scope.startDateData.getFullYear(),
            $scope.startDateData.getMonth(),
            $scope.startDateData.getDate());
    }

    //================= for adding startDate in add dialog ======================= //


    $scope.sendEndDate = function(date)
    {
        $scope.endDateData = new Date(date);
        $scope.startmaxDate = new Date(
            $scope.endDateData.getFullYear(),
            $scope.endDateData.getMonth(),
            $scope.endDateData.getDate());

    }

    $scope.startaddminDate = new Date();
    $scope.endaddminDate = new Date();

    $scope.sendAddStartDate = function(date) {
        $scope.startDateData = new Date(date);
        $scope.endaddminDate = new Date(
            $scope.startDateData.getFullYear(),
            $scope.startDateData.getMonth(),
            $scope.startDateData.getDate());

        $scope.endaddmaxDate = "";
    }

    //================= for adding startDate in add dialog ======================= //


    $scope.sendAddEndDate = function(date)
    {
        $scope.endDateData = new Date(date);
        $scope.startaddmaxDate = new Date(
            $scope.endDateData.getFullYear(),
            $scope.endDateData.getMonth(),
            $scope.endDateData.getDate());
        $scope.startaddminDate = new Date();
    }



    //    ======================================= quick ship ================================== //

    $scope.Packing = {};
    $scope.Packing.containerQuantity = [];
    $scope.tableSalesOrderSkuQuantityDetails = [];
    $scope.quickShipData = function (data, skuadata)
    {
        $('#QuickShipDialog').modal('show');
        var arrayOfSkus = [];
        arrayOfSkus.push(skusdata);
        $scope.quickShipDataTable = arrayOfSkus;
        $scope.quickShipDataTable.orderID = data.idtableStockXferOrderId;
    };
    $scope.quickShipDataDialog = function (ev,data, skusdata)
    {
        $scope.disableQuickShip = false;
        $scope.blurred = true;
        $('#stockTransferquickOperation').modal('show');
        var arrayOfSkus = [];
        if(skusdata){
            arrayOfSkus.push(skusdata);
        }
        else{
            angular.forEach(data.tableStockXferOrderSkuses,function (sku,idx) {
                if(sku.tableStockXferOrderSkuStateType.tableStockXferOrderSkuStateTypeString !== "In Transit"
                    && sku.tableStockXferOrderSkuStateType.tableStockXferOrderSkuStateTypeString !== "GRN Generated"
                    && sku.tableStockXferOrderSkuStateType.tableStockXferOrderSkuStateTypeString !== "Cancelled"){
                    arrayOfSkus.push(sku);
                }

            });
        }

        $scope.quickShipDataTable = arrayOfSkus;
        $scope.quickShipDataTable.orderID = data.idtableStockXferOrderId;
    };

    $scope.validateAlphaNum = function (val)
    {

        var letterNumber = /^[0-9a-zA-Z]+$/;
        if(val.match(letterNumber))
        {
        }
        else
        {
           $scope.notify("Only alphabets and numbers are allowed");
            return false;
        }
    }

    $scope.validateAlpha = function (val) {

        var letters = /^[A-Za-z ]+$/;
        if(val.match(letters))
        {
        }
        else
        {
           $scope.notify("Only alphabets are allowed");
            return false;
        }
    }

    $scope.validateNumber = function (val)
    {
        if(isNaN(val)){
           $scope.notify("Only numbers are allowed");
            return false;
        }
    }

    $scope.ShippingDetailsBtn = function (value)
    {
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

        }
        else if (value.SkuType == 'Parcel')
        {
            if (value.tableSaleOrderShippingDetailsMasterAwb == '' || value.tableSaleOrderShippingDetailsMasterAwb == undefined)

            {
               $scope.notify('AWB number is required.');
                return false;
            }
        }
    };


    $scope.SelectVehicleType = function ()
    {
        var vehicletypeUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/vehicletypes';
        $http.get(vehicletypeUrl).success(function (data) {
            $scope.SKUvehicleType = data;
        }).error(function (error, status)
        {
            if(status == 400)
            {
                $scope.showBackEndStatusMessage(error);
                return;
            }
           $scope.notify("Failed to get vehicle types");
        });
    };
    $scope.SelectVehicleType();

    $scope.sum = function (items, prop) {
        return items.reduce(function (a, b) {
            return parseInt(a) + parseInt(b[prop]);
        }, 0);
    };


    $scope.PackingContainerNumber = function (value, dimensions, shippedDetails) {

        if(dimensions.Length == null || dimensions.Length == undefined)
        {
           $scope.notify('Enter length');
            return;
        }

        if(dimensions.Breadth == null || dimensions.Breadth == undefined)
        {
           $scope.notify('Enter breadth');
            return;
        }

        if(dimensions.Height == null || dimensions.Height == undefined)
        {
           $scope.notify('Enter height');
            return;
        }

        if(dimensions.LengthUnit == null || dimensions.LengthUnit == undefined)
        {
           $scope.notify('Enter dimension unit');
            return;
        }

        if(dimensions.Weight == null || dimensions.Weight == undefined)
        {
           $scope.notify('Enter weight');
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

        var quantity = 0;
        angular.forEach(value,function(source){
            if(source.tableSkusSkuQuantity)
            {
                quantity += source.tableSkusSkuQuantity;
                source.tableSaleOrderShippingDetailsShippingAwb = $scope.shipping.awbnumber;
            }
            else
            {
                source.tableSkusSkuQuantity = 0;
            }
        });

        if(quantity == 0){
           $scope.notify('Enter Quantity');
            return;
        }

        dimensions.tableSaleOrderSkus = value;
        dimensions.SKUcarrierDetails = shippedDetails;
        dimensions.SalesorderID = value.orderID;

        $scope.tableSalesOrderSkuQuantityDetails.push(angular.copy(dimensions));

        angular.forEach($scope.quickShipDataTable, function (res) {
            res.tableSaleOrderShippingDetailsShippingAwb = null;
            res.tableSkusSkuQuantity = null;
        });
        $scope.shipping = {};
        angular.forEach($scope.tableSalesOrderSkuQuantityDetails, function (source) {
            $scope.TotalInputQuantity = $scope.sum(source.tableSaleOrderSkus, 'tableSkusSkuQuantity');
        });
    };

    $scope.LengthMeasureUnitDropDown = function () {
        var UnitUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skuuodmtypes';
        var WeightUnitUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skuuowmtypes';
        $http.get(UnitUrl).success(function (data) {
            $scope.lengthUnitDropdown = data;
        }).error(function (error, status)
        {
            if(status == 400)
            {
                $scope.showBackEndStatusMessage(error);
                return;
            }
           $scope.notify("Failed to get dimension types");
        });
        $http.get(WeightUnitUrl).success(function (data) {
            $scope.weightUnitDropdown = data;
        }).error(function (error, status)
        {
            if(status == 400)
            {
                $scope.showBackEndStatusMessage(error);
                return;
            }
           $scope.notify("Failed to get weight units");
        });
    };

    $scope.LengthMeasureUnitDropDown();
    var StockOrderSkuID;
    $scope.AddPacckingDetails = function (form)
    {
        $scope.disableQuickShip = true;
        var data = $scope.tableSalesOrderSkuQuantityDetails;
        $scope.boxSequenceNo = 1;
        var QuickShipTable = [];

        var SKUDto, SKuQuanity, newSkupackingData;
        if($scope.tableSalesOrderSkuQuantityDetails == "")
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
                StockOrderSkuID = value.SalesorderID;
                if (value.SKUcarrierDetails.tableSaleOrderShippingDetailsMasterAwb == null || value.SKUcarrierDetails.tableSaleOrderShippingDetailsMasterAwb == undefined)
                {
                    SKUcarrierValue = null;
                }
                else
                {
                    SKUcarrierValue = value.SKUcarrierDetails.tableSaleOrderShippingDetailsMasterAwb;
                }
                if (value.SKUcarrierDetails.DriverName == null || value.SKUcarrierDetails.DriverName == undefined)
                {
                    SkuDriverName = null;
                }
                else
                {
                    SkuDriverName = value.SKUcarrierDetails.DriverName
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
                angular.forEach(value.tableSaleOrderSkus, function (response)
                {
                    SKUDto = _.omit(response, 'tableSkusSkuQuantity', 'tableSaleOrderShippingDetailsShippingAwb', 'SalesorderID');
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
                            'tableStockXferOrderSkus': SKUDto,
                            'skuQuantity': SKuQuanity,
                            'tableStockXferOrderPackingDetails': {
                                'tableStockXferOrderPackingDetailsLength': value.Length,
                                'tableStockXferOrderPackingDetailsWidth': value.Breadth,
                                'tableStockXferOrderPackingDetailsHeight': value.Height,
                                'tableStockXferOrderPackingDetailsWeight': value.Weight,
                                "tableSkuUodmType": value.LengthUnit,
                                "tableSkuUowmType": value.WeightUnit,
                                "tablePackingType": null,
                                "tableStockXferOrderShippingDetails": {
                                    "tableStockXferOrderShippingDetailsMasterAwb": SKUcarrierValue,
                                    "tableStockXferOrderShippingDetailsShippingAwb": response.tableSaleOrderShippingDetailsShippingAwb,
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
            $http({
                method: 'PUT',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/stock/transfer/' + StockOrderSkuID + '/packinginfo',
                data: QuickShipTable,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (data) {

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
                $scope.tableSalesOrderSkuQuantityDetails = [];

                $scope.notify("Quick ship successful",'success');
                $mdDialog.hide();
                $scope.disableQuickShipBox = [];
                $scope.editQuickShipBoxHideAndShow = [];
                $scope.cancelSingleOrders(form);
                $scope.shippingDetails.tableSaleOrderShippingDetailsMasterAwb = "";
                $scope.listOfStatesCount($scope.defaultTab);
            }).error(function (error, status)
            {
                $scope.disableQuickShip = false;
                if(status == 400)
                {
                    $scope.showBackEndStatusMessage(error);
                    return;
                }
                $scope.cancelSingleOrders(form);
               $scope.notify("Quick Ship failed");
            });
        }

    };

    $scope.blurred = true;
    $scope.skuPackingDisable = function (shippingDetails)
    {
        if($scope.ShippingDetailsBtn(shippingDetails)==false)
        {
            return;
        }
        $scope.blurred = false;
    };

    $scope.RemoveContainerPackage = function (index) {
        $scope.disableQuickShipBox[index] = false;
        $scope.editQuickShipBoxHideAndShow[index] = false;
        $scope.tableSalesOrderSkuQuantityDetails.splice(index, 1);
    };

    $scope.editContainerPackage = function (index) {
        $scope.disableQuickShipBox[index] = true;
        $scope.editQuickShipBoxHideAndShow[index] = true;
    };

    $scope.disableContainerPackage = function (index) {
        $scope.disableQuickShipBox[index] = false;
        $scope.editQuickShipBoxHideAndShow[index] = false;
    };

    $scope.totalQuantity = function(allSkus){
        var total = 0;
        for (var i = 0; i < allSkus.length; i++) {
            var quantity = allSkus[i].tableStockXferOrderSkusSkuQuantity;
            total += quantity;
        }
        return total;
    }

    $scope.shippingDetails = {};
    $scope.resetAllQuickShipFields = function () {
        $scope.shippingDetails.VehicleType = null;
        $scope.shippingDetails.DriverName = null;
        $scope.shippingDetails.DriverNumber = null;
        $scope.shippingDetails.VehicleNumber = null;
        $scope.shippingDetails.tableSaleOrderShippingDetailsMasterAwb = null;

    }

    var skuStart=0,size=10;
    $scope.skuLoadBusy = false
    $scope.stopSkuLoad = false;
    $scope.skuPagingFunction = function () {
        if($scope.stopSkuLoad){
            return;
        }
        $scope.skuLoadBusy = true;
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

    //Updated By UV
    $scope.masterSkuDialog = function(ev, check){

        $scope.genericData.check = check;
        if(check == true){
            // $('#stockTransferDialog').modal('hide');
        }

        mastersService.fetchOnlySkus(MavenAppConfig.baseUrlSource,function(data){
            $scope.genericData.skusListFiltered = data;
            $timeout(function () {
                $('#dialogmastersku').modal('show');
                $scope.skuLoadBusy = false;
                $scope.stopSkuLoad = false;
            }, 500);

        });
    }

    $scope.cancelmastersDialog = function(ev){
        skuStart=0;
        size=10;
        $scope.genericData.skusListFiltered = [];
        $scope.skuLoadBusy = true;
        $scope.stopSkuLoad = true;
        $('#dialogmastersku').modal('hide');
        if($scope.genericData.check == true){
        }
    }

    $scope.selectSku = function(id, ev){
        $scope.stopSkuLoad = true;
        $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/'+id).success(function(data) {
            $scope.skuId = data.idtableSkuId;
            $scope.tableSku = data;
            if($scope.genericData.check == true){
                $scope.getPriceOfProduct();}
            if($scope.genericData.check == true){
                $scope.$broadcast("angucomplete-alt:changeInput", "products", data);
            }else{
                $scope.$broadcast("angucomplete-alt:changeInput", "productsfilter", data);
            }
        }).error(function (error, status)
        {
            if(status == 400)
            {
                $scope.showBackEndStatusMessage(error);
                return;
            }
           $scope.notify("Failed to get skus");
        });

        $scope.cancelmastersDialog(ev);
    }

    $scope.shipAll = function(){
        if($scope.shipping.shipallchecked){
            angular.forEach($scope.quickShipDataTable, function (response)
            {
                response.tableSkusSkuQuantity = response.tableStockXferOrderSkusSkuQuantity;
            })
        }
        else{
            angular.forEach($scope.quickShipDataTable, function (response)
            {
                response.tableSkusSkuQuantity = undefined;
            })
        }
    }

    $scope.splitOrderBySkuDialog = function(ev, data, orderid){
        $scope.skusListForOrderSplit = data;
        $scope.genericData.orderId = orderid;

        $('#splitStockTransferSku').modal('show');

    }
    $scope.genericData.skuSelectedArray = [];
    $scope.updateSkuArray = function(data){

        var idx = $scope.genericData.skuSelectedArray.indexOf(data);
        // is currently selected
        if (idx > -1) {
            $scope.genericData.skuSelectedArray.splice(idx, 1);
        }

        // is newly selected
        else {
            $scope.genericData.skuSelectedArray.push(data);
        }
    }

    $scope.genericData.splitCost = false;

    $scope.splitOrderBySkuByQuantityDialog = function(ev, data, orderid,skuquantity){
        $scope.genericData.skuid = data;
        $scope.genericData.orderId = orderid;
        $scope.genericData.skuquantity =skuquantity;

        $('#splitStockTransferbyquantity').modal('show');

    }

    $scope.splitOrderBySkus = function(){
        var arr = $scope.genericData.skuSelectedArray;
        var skuArrayLength = arr.length;
        var totalSkusLength = $scope.skusListForOrderSplit.length;
        if(skuArrayLength >= totalSkusLength){
           $scope.notify("You cannot select all the SKUs.");
            return;
        }

        if(skuArrayLength == 0){
           $scope.notify("Please select at least one SKU.");
            return;
        }

        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/stock/transfer/' + $scope.genericData.orderId +'/splitorder?splitCost='+$scope.genericData.splitCost,
            data: arr
        }).success(function() {
            //$scope.orderLists[index].tableSaleOrderRemarks = remarks;
            $scope.genericData.skuSelectedArray = [];
            $scope.notify("Order split successful",'success');
            $scope.listOfStatesCount($scope.defaultTab);
            $('#splitStockTransferSku').modal('hide');

        }).error(function(error, status) {
            $scope.genericData.skuSelectedArray = [];
            if(status == 400)
            {
               $scope.notify(error.errorMessage);
            }
            else
            {
               $scope.notify("Order split failed.");
            }


        });


    }

    $scope.splitOrderBySkusByQuantity = function()
    {
        if($scope.genericData.quantity == undefined || $scope.genericData.quantity == null){
           $scope.notify("Enter quantity first");
            return;
        }
        if($scope.genericData.quantity <=0 || $scope.genericData.quantity >= $scope.genericData.skuquantity){
           $scope.notify("quantity can not be zero or greater than or equal to ordered sku quantity");
            return;
        }
        $http({
            method: 'PUT',
            data : '',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/stock/transfer/' + $scope.genericData.orderId +'/splitxferorderwithskuquantity/'+ $scope.genericData.skuid + '?skuquantity='+$scope.genericData.quantity+'&splitCost='+$scope.genericData.splitCost,

        }).success(function()
        {
            $scope.notify("Order splitted successfully",'success');
            $scope.listOfStatesCount($scope.defaultTab);
            $scope.genericData.quantity = null;
            $('#splitStockTransferbyquantity').modal('hide');

        }).error(function(error, status)
        {
            $('#splitStockTransferbyquantity').modal('hide');
            if(status == 400)
            {
               $scope.notify(error.errorMessage);
            }
            else
            {
               $scope.notify("Order split has failed.");
            }


        });


    }

    //Check if orderLevelActionRow to be shown or not.
    $scope.orderLevelActionRow = function(data,stockTransfer)
    {
        $scope.genericData.skuArray = data;
        var SplitOrderButton = $scope.getSplitLabelButton();
        var enableInvoiceOrChallan = $scope.printInvoiceEnabled(stockTransfer    );

        var disableQuickShip = $scope.getStockXferBulkQuickShipLabelButton(data);

        if(enableInvoiceOrChallan!= null || SplitOrderButton == true || disableQuickShip == false)
        {
            return true;
        }
        else
        {
            return false;
        }
    };
    $scope.orderLevelActionRowForGRN = function(storder , data){

        $scope.genericData.skuArray = data;

        if(storder.tableWarehouseDetailsByTableStockXferOrderToLocation.tableWarehouseDetailsWmsId != null
        && storder.tableWarehouseDetailsByTableStockXferOrderToLocation.tableWarehouseDetailsWmsId > 0)
        {
            return false;
        }

        if($scope.genericData.skuArray.length == 1){
            return false;
        }

        var check = 0;
        for(var i = 0; i < $scope.genericData.skuArray.length ; i++){
            if($scope.genericData.skuArray[i].tableStockXferOrderSkuStateType.idtableStockXferOrderSkuStateTypeId == 9){
                check++;
            }
        }
        if(check > 1){
            return true;
        }
        else{
            return false;
        }

    };

    $scope.genericData.skuArray = [];
    $scope.getSplitLabelButton = function(){
        var b = true;

        if($scope.genericData.skuArray.length == 1){
            b = false;
        }

        var check = 0;
        for(var i = 0; i < $scope.genericData.skuArray.length ; i++){
            if($scope.genericData.skuArray[i].tableStockXferOrderSkuStateType.idtableStockXferOrderSkuStateTypeId > 7){
                check++;
            }
        }

        if(check == $scope.genericData.skuArray.length){
            return false;
        }

        return b;
    };

    $scope.getSplitLabelButtonForQuantity = function(sku){
        var b = true;

        if(sku.tableStockXferOrderSkuStateType.idtableStockXferOrderSkuStateTypeId > 7){
            return false;
        }

        if(sku.tableStockXferOrderSkusSkuQuantity < 2){
            return false;
        }

        return b;
    };

    $scope.getClientProfile = function() {
        var clientProfileUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/clientprofiles";
        $http.get(clientProfileUrl).success(function(data)
        {
            $scope.tableClientProfile = data[0];
        })
    }

    //Check if printInvoice button is to be enabled or not
    $scope.printInvoiceEnabled =  function (stockTransfer)
    {
        $scope.enableInvoice = null;
        var shipStatus=false;
        for(var i=0;i<stockTransfer.tableStockXferOrderSkuses.length;i++)
        {
            // if any of the SKU is Quick ship then "Print Invoice" button will appear
            if(stockTransfer.tableStockXferOrderSkuses[i].tableStockXferOrderSkuStateType!=null && stockTransfer.tableStockXferOrderSkuses[i].tableStockXferOrderSkuStateType.idtableStockXferOrderSkuStateTypeId!=null
                &&  stockTransfer.tableStockXferOrderSkuses[i].tableStockXferOrderSkuStateType.idtableStockXferOrderSkuStateTypeId==9)
            {
                shipStatus=true;
                break;
            }
        }

        if(shipStatus)
        {
            //If from warehouse is source location then return null. No challan or inovice is required.
            if (stockTransfer.tableWarehouseDetailsByTableStockXferOrderFromLocation.tableWarehouseType.idtableWarehouseTypeId == 4)
            {
	    	    $scope.enableInvoice = false;
                return $scope.enableInvoice;
            }

            //Check if invoice is enabled in client profile
            if ($scope.tableClientProfile.tableClientProfileEnableInvoice == true)
            {

                //Check if warehouse type is not FBA . If Glaucus then it is not managed by WMS
                if (((stockTransfer.tableWarehouseDetailsByTableStockXferOrderFromLocation.tableWarehouseType.idtableWarehouseTypeId == 1 && stockTransfer.tableWarehouseDetailsByTableStockXferOrderFromLocation.tableWarehouseDetailsWmsId == null)
                    || stockTransfer.tableWarehouseDetailsByTableStockXferOrderFromLocation.tableWarehouseType.idtableWarehouseTypeId == 2
                    || stockTransfer.tableWarehouseDetailsByTableStockXferOrderFromLocation.tableWarehouseType.idtableWarehouseTypeId == 5)
                    && ((stockTransfer.tableWarehouseDetailsByTableStockXferOrderToLocation.tableWarehouseType.idtableWarehouseTypeId == 1 && stockTransfer.tableWarehouseDetailsByTableStockXferOrderFromLocation.tableWarehouseDetailsWmsId == null)
                    || stockTransfer.tableWarehouseDetailsByTableStockXferOrderToLocation.tableWarehouseType.idtableWarehouseTypeId == 2
                    || stockTransfer.tableWarehouseDetailsByTableStockXferOrderToLocation.tableWarehouseType.idtableWarehouseTypeId == 3
                    || stockTransfer.tableWarehouseDetailsByTableStockXferOrderToLocation.tableWarehouseType.idtableWarehouseTypeId == 5))
                {
                    $scope.enableInvoice = true;
                }
            }
            else
            {
                //Check if any challan can be printed
                $scope.enableInvoice = false;
            }
        }
        return $scope.enableInvoice;
    }

    $scope.printPreview = function(response)
    {
        $http.get(MavenAppConfig.baseUrlSource+MavenAppConfig.commonPathUrl+response.previewLink
            ,{responseType: 'arraybuffer'}
        ).success(function(data)
        {
            $('#printLabels').modal('show');
            var file = new Blob([(data)], {
                type: 'application/pdf'
            });
            var fileURL = URL.createObjectURL(file);
            $scope.content = $sce.trustAsResourceUrl(fileURL);
        }).error(function(error)
        {
        });
    };

    $scope.printInvoice =  function (stockTransfer)
    {
        var invoiceURL  = MavenAppConfig.baseUrlSource + '/omsservices/webapi/stock/transfer/' + stockTransfer.idtableStockXferOrderId + '/invoiceslip';
        $http.get(invoiceURL).success(function(response)
        {
            $scope.printPreview(response);
        }).error(function(error,status)
        {
            if(status == 400){
                $scope.notify(error.errorMessage);
            }else{
                $scope.notify("Failed to print invoice");
            }
        });
    }

    $scope.printChallan =  function (stockTransfer)
    {
        var challanURL  = MavenAppConfig.baseUrlSource + '/omsservices/webapi/stock/transfer/' + stockTransfer.idtableStockXferOrderId + '/challanslip';
        $http.get(challanURL).success(function(response)
        {
            $scope.printPreview(response);
        }).error(function(error,status)
        {
            if(status == 400){
                $scope.notify(error.errorMessage);
            }else{
                $scope.notify("Failed to print challan");
            }
        });

    }
    $scope.getStockXferBulkQuickShipLabelButton=function(stockXferOrderSkus){
        var shipStatus = true;
        for(var i=0;i<stockXferOrderSkus.length;i++)
        {
           // If any of the SKU is in New State that means it is not Quick Ship so Order Level "Quick Ship"
           // Button will appear
           if(stockXferOrderSkus[i].tableStockXferOrderSkuStateType!=null && stockXferOrderSkus[i].tableStockXferOrderSkuStateType.idtableStockXferOrderSkuStateTypeId!=null
              &&  stockXferOrderSkus[i].tableStockXferOrderSkuStateType.idtableStockXferOrderSkuStateTypeId==1)
            {
               shipStatus=false;
                break;
            }
        }

        return shipStatus;
    };
    /**
     * The below method exports the Grn Details of Stock Transfer
     * Order based on the filters provided in the filterObj object.
     * If no filters are provided then Grn Details of all the
     * Stock Transfer Orders of a client will be exported.
     *
     * The export takes place in an Excel file.
     *
     *
     * @author AMAN AHUJA 29 Jan 2018
     */


    $scope.getGrnDump=function()
    {
        var apiUrl=MavenAppConfig.baseUrlSource + '/omsservices/webapi/stock/transfer/getgrndump?';
        if($scope.filterObj.systemOrderNo!=null && $scope.filterObj.systemOrderNo!='')
        {
            apiUrl+='orderid='+$scope.filterObj.systemOrderNo;
        }
        if($scope.filterObj.fromWarehouse!=null && $scope.filterObj.fromWarehouse!='')
        {
            apiUrl+='&fromwarehouseid='+$scope.filterObj.fromWarehouse.idtableWarehouseDetailsId;
        }
        if($scope.filterObj.toWarehouse!=null && $scope.filterObj.toWarehouse!='')
        {
            apiUrl+='&towarehouseid='+$scope.filterObj.toWarehouse.idtableWarehouseDetailsId;
        }
        if($scope.filterObj.tableSku!=null && $scope.filterObj.tableSku!='')
        {
            apiUrl+='&skuid='+$scope.filterObj.tableSku.idtableSkuId;
        }
        if($scope.filterObj.start1Date!=null && $scope.filterObj.start1Date!='')
        {

            apiUrl+='&startdate='+moment.utc($scope.filterObj.start1Date).format();
        }
        if($scope.filterObj.end1Date!=null && $scope.filterObj.end1Date!='')
        {
            apiUrl+='&enddate='+moment.utc($scope.filterObj.end1Date).format()+'&uipagename='+$scope.pagename;
        }
        $http
        (
            {
                method: 'GET',
                url:apiUrl
            }

        ).success
        (function(response)
            {
                $cookies.put('DownloadExportData','Grn');
                $cookies.put('ActiveTab','Grn');

                if(response.errorCode === 200)
                {
                    $scope.notify("Grn Export requested successfully.<br><a href='#/export/' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View files</a>",'success');
                }
            }
        ).error
        (function(response)
        {
            $scope.notify("Grn Export request failed");
        })
    };


    $scope.$on('$destroy', function () {
        $window.localStorage.removeItem('stockTransferFilter');
        $window.localStorage.removeItem('inboundTab');
        $window.localStorage.removeItem('outboundTab');
        $("#dialogmastersku").remove();
        $('.modal-backdrop').remove();
    });

}]);