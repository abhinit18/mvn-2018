angular.module('OMSApp.directinward', []).config(function config($stateProvider) {
    $stateProvider.state('/directinward/', {
        name: '/directinward/',
        url: '/directinward/',
        views: {
            "main": {
                controller: 'directinwardController',
                templateUrl: 'directinward/directinward.view.html'
            },
            "header": {
                controller: 'headerCtrl',
                templateUrl: '../shared/templates/header.html'
            }
        },
        data: {pageTitle: 'Directinward'}
    })

}).controller ('directinwardController', ['$rootScope','$scope', '$http','$mdDialog', '$location', '$filter', 'MavenAppConfig','$sce', '$window', 'Upload','pagerService', '$q' , '$cookies','$timeout' , 'mastersService',

function directinwardController($rootScope, $scope, $http,$mdDialog, $location, $filter, MavenAppConfig,$sce, $window, Upload,pagerService, $q, $cookies,$timeout, mastersService) {

    $scope.genericData = {};
    $scope.baseSkuUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/search?search=';
    $scope.baseCustomerUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/vendors/search?search=';
    $scope.genericData.skuSelectedArray = [];
    $scope.vendorSkus = [];
    $scope.ClientOrderNo = "";
    $scope.systemOrderNo = "";
    $scope.grnInventory = {};
    $scope.products = [];
    $scope.start = 0;
    $scope.singleOrderTab = true;
    $scope.singleOrderMode = "add";
    $scope.bulkOrderTab = false;
    $scope.downloadPurchaseOrderTemplateUrl = MavenAppConfig.baseUrlSource+"/omsservices/webapi/directinward/order/bulkuploadtemplate";
    $scope.bulkOrderSettingData = "";
    $scope.recordsPerPage = [5,10,15];
    $scope.orderSize = $scope.recordsPerPage[0];
    $scope.defaultTab = 'all';
    $scope.isSubmitDisabled = true;
    $scope.isResetFilter = true;
    $scope.baseCustomerUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/vendors/search?search=';
	
	$scope.sortType = "tablePurchaseOrderSystemOrderNo";
    $scope.directionType = "desc";
    $scope.sortReverse = false; // set the default sort order

    $scope.totalGross = 0.00;
    $scope.totalDiscount = 0.00;
    $scope.totalNet = 0.00;
    $scope.totalTax = 0.00;

    $scope.showinvoice = false;
    $scope.viewinvoice = false;

    $scope.barcode = {};

    $scope.intransit = {};


    $scope.isvendor = localStorage.getItem("isvendor");
    $scope.genericData.isAdmin = localStorage.getItem('isadmin');
	
    $scope.callDisabled = function(){
        $scope.isSubmitDisabled = false;
        $scope.isResetFilter = false;
    }

    var currentUrl,UrlName;
    currentUrl = $scope.currentUrl;
    if($scope.currentUrl === "")
    {
        currentUrl = window.location.href;
    }
    UrlName = currentUrl.split('/');
    console.log(UrlName);
    if(UrlName.indexOf('directinward') == -1){
        $scope.defaultTab = "new";
    }else{
        $scope.defaultTab = "all";
    }


    $scope.onPageInitialize =  function () {
        if($cookies.get('orderid') != null){
            $scope.systemOrderNo = $cookies.get('orderid');
            $cookies.remove('orderid')
        }

        //$scope.getPoData();
        $scope.listOfStatesCount($scope.defaultTab);
        $scope.listOfWareHouses();
        $scope.listOfVendors();
        $scope.listOfPayments();
        $scope.listOfShippingOwners();
        $scope.listOfShippingCarriers();
	$scope.getItemLevelAdditionalGrossTypes();
	$scope.getInvoiceLevelAdditionalGrossTypes();
    }



    $scope.tableRowExpanded = false;
    $scope.tableRowIndexExpandedCurr = "";
    $scope.tableRowIndexExpandedPrev = "";
    $scope.storeIdExpanded = "";

    // getting all list of orders (all the orders)
    $scope.listOfOrders = function(tabsValue, start, action)
    {
        if (tabsValue == 'draft')
        {
            $scope.DeleteAndConfimData = true;
            $scope.singleOrderMode = 'editdraft';
        }
        else
        {
            $scope.DeleteAndConfimData = false;
            $scope.singleOrderMode = 'edit';
        }

        $scope.defaultTab = tabsValue;

        var orderListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/directinward/order";

        if ($scope.defaultTab == 'all')
            orderListUrl += "?start=" + start + "&size="+$scope.orderSize+"&sort=" + $scope.sortType + "&direction=" + $scope.directionType;

        if ($scope.defaultTab != 'all')
            //orderListUrl += "?&state=" +  tabsValue;
            orderListUrl += "?start=" + start + "&size="+$scope.orderSize+"&sort=" + $scope.sortType + "&direction=" + $scope.directionType+"&state=" + tabsValue;

        orderListUrl += "&uipagename="+$scope.pagename;

        if ($scope.skuId) {
            orderListUrl += "&skuid=" + $scope.skuId;
        }
        if ($scope.vendorId) {
            orderListUrl += "&vendorid=" + $scope.vendorId;
        }
        if ($scope.ClientOrderNo) {
            orderListUrl += "&clientorderid=" + $scope.ClientOrderNo;
        }
        if ($scope.systemOrderNo) {
            orderListUrl += "&orderid=" + $scope.systemOrderNo;
        }
        if ($scope.channel) {
            orderListUrl += "&warehouseid=" + $scope.channel;
        }
        if ($scope.startDate) {
            orderListUrl += "&startdate=" + $scope.startDate;
        }
        if ($scope.endDate) {
            orderListUrl += "&enddate=" + $scope.endDate;
        }
        $http.get(orderListUrl).success(function(data) {
            console.log(data);
            $scope.orderLists = data;
            $scope.end = $scope.start + data.length;
            $scope.tableRowExpanded = false;
            $scope.tableRowIndexExpandedCurr = "";
            $scope.tableRowIndexExpandedPrev = "";
            $scope.storeIdExpanded = "";
            $scope.dayDataCollapse = [];

            for (var i = 0; i < $scope.orderLists.length; i += 1) {
                $scope.dayDataCollapse.push(false);
            }
            $scope.showLoader =false;
        }).error(function(error, status) {
            $scope.showLoader =false;
        });
    }
    $scope.getTotal = function(tableSkuData) {

        var total = 0;
        for (var i = 0; i < tableSkuData.tablePurchaseOrderSkusChargeses.length; i++) {
            var product = tableSkuData.tablePurchaseOrderSkusChargeses[i].tablePurchaseOrderSkusChargesValue;
            total += product;
        }
        return total;
    };
    
    $scope.totalCostPerProduct = function(tableSkuData) {
        // console.log(tableSkuData.tablePurchaseOrderSkusChargeses.length);
        var total = 0;
        var totalCost = 0;
        for (var i = 0; i < tableSkuData.tablePurchaseOrderSkusChargeses.length; i++) {
            var product = tableSkuData.tablePurchaseOrderSkusChargeses[i].tablePurchaseOrderSkusChargesValue;
            total += product;
        }

        var totalCost = total * tableSkuData.tablePurchaseOrderSkusSkuQuantity;

        return totalCost;
    }

    //======================================= Drafting Orders ================================= //

    //check Order Number
    $scope.checkOrderNumber = function(orderNo,systemOrderNo)
    {
        var q = $q.defer();
        if(orderNo == undefined || orderNo == "" || orderNo == null){
            q.resolve(false);
        }
        else
        {
            var checkOrderNo = MavenAppConfig.baseUrlSource + "/omsservices/webapi/purchase/order/clientordernumber?clientordernumber=" + orderNo;
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


    $scope.vendorskus = false;

    $scope.initAddOrderModal = function (ev)
    {
        $scope.vendorskus = true;
        $scope.singleOrderTab = true;
        $scope.bulkOrderTab = false;
        $scope.singleOrderMode = "add";
        $scope.initDateLimits();
        $scope.singleorderData = {};

        $('#addPodialog').on('show.bs.modal' , function (e){
            $( "#ordertabs a:first"  ).tab('show');
        });
        $('#addPodialog').modal('show');
    }


    $scope.DraftOrderID = {};
    $scope.editDraft = function(order){
        $scope.singleOrderMode = 'editdraft';
        $scope.openEditAndReorderModal(order,"editdraft");
        $scope.DraftOrderID.OrderId = order.idtablePurchaseOrderId;

    };



    $scope.disableBulkUpload = false;

    //=================================== edit remarks ============================= //
    var orderDataForReplacingData;
    $scope.openEditRemarkModal = function(order,index){
        orderDataForReplacingData = order;
        $scope.editRemarkModalOrderId = order.idtablePurchaseOrderId;
        $scope.modalRemarks = null;
        if(order.tablePurchaseOrderRemarkses == null || order.tablePurchaseOrderRemarkses == undefined)
        {
            $scope.modalRemarks = null;
        }
        else
        {   if(order.tablePurchaseOrderRemarkses.length > 0){
                $scope.modalRemarks =  order.tablePurchaseOrderRemarkses;
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
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchase/order/' + $scope.editRemarkModalOrderId +'/editremarks',
            data: remarks
        }).success(function(data) {
            var checkUpdatedRemarksDataUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/purchase/order/"+orderDataForReplacingData.idtablePurchaseOrderId;
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

    };


    //============================================================================== //

    $scope.getItemLevelAdditionalGrossTypes = function()
    {
        $scope.itemLevelAdditionalGrossTypes = [];
        var getURL = MavenAppConfig.baseUrlSource + "/omsservices/webapi/grosstype/itemgrosstypes";
        $http.get(getURL).success(function(data)
        {
            console.log(data);
            $scope.itemLevelAdditionalGrossTypes = data;
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };

    $scope.getInvoiceLevelAdditionalGrossTypes = function() {
        $scope.invoiceLevelAdditionalGrossTypes = [];
        var getURL = MavenAppConfig.baseUrlSource + "/omsservices/webapi/grosstype/invoicegrosstypes";
        $http.get(getURL).success(function(data)
        {
            console.log(data);
            $scope.invoiceLevelAdditionalGrossTypes = data;
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };

    $scope.listOfWareHouses = function() {
		$scope.wareHousesData = [];
		var wareHousesListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/warehouses/activewarehouses?size=-1&uipagename="+$scope.pagename;
        $http.get(wareHousesListUrl).success(function(data) {
        	console.log(data);
        	$scope.wareHousesLists = data;

        	for (var i = 0; i < $scope.wareHousesLists.length; i++) {
        		$scope.wareHousesData.push($scope.wareHousesLists[i]);
        	}
        }).error(function(error, status) {
        	console.log(error);
        	console.log(status);

        });
    };

    $scope.listOfVendors = function() {
    	$scope.vendorsData = [];
    	var vendorsListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/masters/vendors?size=-1";
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

    $scope.WareHouseList = function(){
        var warehouse =MavenAppConfig.baseUrlSource+ '/omsservices/webapi/warehouses?size=-1&uipagename='+$scope.pagename;
        $http.get(warehouse).success(function(data) {
            console.log(data);
            $scope.wareHousesData = data;

        }).error(function(data){
                console.log(data);
            });
    }

    $scope.listOfPayments = function() {
    	$scope.paymentNamesData = [];
    	var paymentListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/purchaseorderpaymenttypes";
        $http.get(paymentListUrl).success(function(data) {
            $scope.paymentLists = data;
            for (var i = 0; i < $scope.paymentLists.length; i++) {
            	$scope.paymentNamesData.push($scope.paymentLists[i]);
            }
        }).error(function(error, status) {
        	console.log(error);
        	console.log(status);

        });
    }

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
    }

    $scope.listOfShippingCarriers = function(){
    	$scope.shippingCarriersData = [];
    	var shippingCarriersUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/carrierservices";
    	$http.get(shippingCarriersUrl).success(function(data) {
    		$scope.shippingCarriersLists = data;
    		for (var i = 0; i < $scope.shippingCarriersLists.length; i++) {
    			$scope.shippingCarriersData.push($scope.shippingCarriersLists[i]);
    		}
            console.log($scope.shippingCarriersData);
    	}).error(function(error, status) {
    		console.log(error);
    		console.log(status);

    	});
    };



    $scope.getVendorId = function(vendorData){
        console.log(vendorData);
        $scope.singleorderData.quantityNo = "";
        $scope.singleorderData.priceProd = "";
        $scope.products = [];
         producted = [];
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
                else
                {
                    $scope.notify('The selected vendor does not have any SKUs mapped. Goto Vendors and create mapping first','info');
                }
                console.log(data);
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

    $scope.getVendorAddresses = function ()
    {
        var vendorAddress = MavenAppConfig.baseUrlSource +"/omsservices/webapi/vendors/"+$scope.singleorderData.tableVendor.idtableVendorId+"/address";
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
    }

    $scope.singleorderData = {};
    var producted = [];
    // adding the product in table one by one
    $scope.addProduct = function(tableSku, tablePurchaseOrderSkusSkuQuantity, id, price) {

        if(tableSku == null){
           $scope.notify('Please add product first.');
        }

        if (tablePurchaseOrderSkusSkuQuantity == undefined) {

           $scope.notify("Please give proper quantity.");
        }

        if (price == undefined || price <=0) {

           $scope.notify("Price should be greater than zero.");
        }

        if (price > 0 && tablePurchaseOrderSkusSkuQuantity > 0)
        {
            var tableSku = angular.copy(tableSku);
			var keepGoing = true;
			angular.forEach(producted, function(product){
				if(keepGoing) {
					if(product.tableSku.idtableSkuId == tableSku.idtableSkuId){
						keepGoing = false;
				}
			  }
			});
			if(keepGoing){
                producted.push({
                    tableSku: tableSku,
                    tablePurchaseOrderSkusSkuQuantity: tablePurchaseOrderSkusSkuQuantity,
                    tablePurchaseOrderSkusChargeses: [{
                        "tablePurchaseOrderSkusChargesValue": price,
                        "tablePurchaseOrderSkuChargesType": {
                            "idtablePurchaseOrderSkuChargesTypeId": 1,
                            "tablePurchaseOrderSkuChargesTypeString": "sku price"
                        }
                    }]
                });
			}
            else
            {
               $scope.notify("The selected product is already part of the current order. Delete the existing item first to add updated quantity.");
            }
            $scope.products = producted;

            console.log($scope.products);

            $scope.$broadcast('angucomplete-alt:clearInput', 'products');
            tableSku = null;
            tablePurchaseOrderSkusSkuQuantity = null;
            $scope.singleorderData.productObj = null;
            $scope.singleorderData.quantityNo = null;
            $scope.singleorderData.priceProd = null;
        }
    };

    //remove the product
    $scope.removeProduct = function(index) {
        $scope.genericData.deleteItemIndex = index;
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
    $scope.purchaseOrderData = {};

    $scope.setFormButtonValue =  function (value) {
        $scope.submitActionButton = value;
    }
    $scope.submitAddPOForm =  function (form) {
        if($scope.singleOrderMode == 'add' && $scope.submitActionButton == 'singleOrder'){
            $scope.saveSingleOrder(form);
        }
        else if($scope.singleOrderMode == 'edit' && $scope.submitActionButton == 'updateOrder'){
            $scope.EditOrdered(form);
        }
        else if(($scope.singleOrderMode == 'add' || $scope.singleOrderMode == 'editdraft')  && $scope.submitActionButton == 'saveDraft'){
            $scope.Drafted(form);
        }
        else if($scope.singleOrderMode == 'editdraft' && $scope.submitActionButton == 'sendDraft'){
            $scope.SendDraft(form);
        }
        else if($scope.singleOrderMode == 'reorder' && $scope.submitActionButton == 'reorder'){
            $scope.ReOrdered(form);
        }

    }

    $scope.submitAction = function(wareID,saleChannelId, skuId, startDate, endDate, vendorId,systemOrderNo) {
        //console.log(saleChannelId);
        if(saleChannelId != undefined && saleChannelId != ''){
            var wareID = JSON.parse(saleChannelId);
        }
        console.log(skuId);
        console.log(startDate);
        console.log(endDate);
        console.log(vendorId);
        console.log(systemOrderNo);
        if (wareID != undefined) {
            $scope.channel = wareID.idtableWarehouseDetailsId;
        }
		if(saleChannelId == ''){
			$scope.channel = null;
		}
        if (skuId != undefined) {
            $scope.singleorderData.skuId = skuId;
        }
        if (startDate != undefined) {
            $scope.startDate = moment.utc(startDate).format();
        }
        if (endDate != undefined) {
            $scope.endDate = moment.utc(endDate).format();
        }
        if (vendorId != undefined) {
            $scope.vendorId = vendorId;
        }
        if(systemOrderNo != undefined){
		    $scope.systemOrderNo = systemOrderNo;
        }
        $scope.isSubmitDisabled = true;
        $scope.isResetFilter = false;
        $scope.listOfStatesCount($scope.defaultTab, 1);

    }


    $scope.clearAction = function() {
        // $scope.listOfOrders($scope.defaultTab, 0);
		$scope.wareHouseId = null;
        $scope.channel = "";
        $scope.systemOrderNo = "";
        $scope.skuId = "";
        $scope.vendorId = "";
        $scope.saleChannelId = undefined;
        $scope.startDate = "";
        $scope.endDate = "";
        $scope.start1Date = null;
        $scope.end1Date = null;
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        $scope.$broadcast('angucomplete-alt:clearInput', 'productsfilter');
        $scope.$broadcast('angucomplete-alt:clearInput', 'vendorsfilter');
        $scope.isSubmitDisabled = true;
        $scope.isResetFilter = true;
        $scope.listOfStatesCount($scope.defaultTab, 1);
        $window.localStorage.removeItem('purchaseOrderFilter');
        $window.localStorage.removeItem('inboundTab');
    };

    $scope.newTab = function(){
        if($scope.channel || $scope.wareHouseId || $scope.systemOrderNo || $scope.skuId || $scope.vendorId || $scope.saleChannelId || $scope.startDate || $scope.endDate || $scope.start1Date || $scope.end1Date){
            var purchaseOrderField = {
                warehouse: $scope.wareHouseId,
                channel: $scope.channel,
                orderId : $scope.systemOrderNo,
                sku: $scope.selectedSku,
                vendor : $scope.selectedVendor,
                saleChannel :$scope.saleChannelId,
                startDate :$scope.startDate,
                endDate :$scope.endDate,
                start1Date : $scope.start1Date,
                end1Date: $scope.end1Date
            }
            $window.localStorage.setItem('purchaseOrderFilter',JSON.stringify(purchaseOrderField))
        }
        $window.open($location.absUrl(), "_blank");
    }

    $scope.singleorderData = {};
    $scope.searchedProduct = function(selected) {
        if(selected!=null)
        {
            $scope.selectedSku = selected.originalObject;
            $scope.singleorderData.productObj = selected.originalObject;
            $scope.singleorderData.skuId = selected.originalObject.idtableSkuId;
        }
    }

    $scope.searchedProductForFilter = function(selected) {
        if(selected!=null && selected != undefined)
        {
            $scope.selectedSku = selected.originalObject;
            $scope.skuId = selected.originalObject.idtableSkuId;
        }else{
            $scope.skuId = undefined;
        }
    }


    $scope.searchedVendor = function(selected) {
        console.log(selected);
        if(selected!=null && selected != undefined)
        {
            $scope.selectedVendor = selected.originalObject;
            $scope.vendorId = selected.originalObject.idtableVendorId;
        }else{
            $scope.vendorId = undefined;
        }
    }


    $scope.getPriceOfProduct = function(skuId, saleChannelId,quantity) {

        if(skuId == null || skuId == undefined)
        {
           $scope.notify("Select a product. System will fetch the price offered for this product by this vendor.");
            return;
        }

        if(quantity == null || quantity == undefined)
        {
           $scope.notify("Enter some quantity value. System will fetch the price offered for this product and quantity by this vendor.");
            return;
        }

        if(saleChannelId  == null || saleChannelId == undefined)
        {
           $scope.notify("Select a vendor first");
            return;
        }

        $http({
            method: 'GET',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/vendors/' + saleChannelId + '/skumap/sku/' + skuId + '/skuquantity/'+quantity+ '/price',
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            $scope.singleorderData.priceProd = res;
        }).error(function(error, status) {
            $scope.singleorderData.priceProd = 0;
            console.log(status);

        });
    };



//    =============================== deleting values from modal ======================== //

    $scope.cancelSingleOrder = function(form){

        producted = [];
        $scope.vendorskus = false;
        $scope.OrderMode = "";
        $scope.deliveryAddressArray = [];
        $scope.orderNo = null;
        $scope.singleorderData.systemOrderNo = null;
        $scope.singleorderData.wareHouses = null;
        $scope.singleorderData.vendorData = null;
        $scope.products = [];
        $scope.singleorderData.pickupAddressName = null;
	    $scope.singleorderData.payment = null;
        $scope.bulkSelectChannel = false;
        $scope.bulkSelectFile = false;
        $scope.fileName = "";
	    $scope.singleorderData.shipOwner = null;
	    $scope.singleorderData.shipService = null;
	    $scope.singleorderData.pickUpDate = null;
	    $scope.singleorderData.dropDate = null;
        $scope.editOrderDisable = false;
        $scope.singleorderData.orderNo = null;
        $scope.singleorderData.skuId = null;
        $scope.vendorId = null;
        $scope.genericData.check = null;
        $scope.singleorderData.productObj = null;
        $scope.skuId = null;
        $scope.singleorderData.skuId = null;
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        // $mdDialog.hide({
        //     templateUrl: 'addPodialog.tmpl.html'
        // });
        $('#addPodialog').modal('hide');

    };

    $scope.cancelSingleOrders = function(){
      $mdDialog.hide();
    };
    $scope.cancelPurchaseOrderGrnModal = function(){
        $scope.grnInventory = {};
      $mdDialog.hide();
    };
    $scope.vendorId = "";


    $scope.cancelBulkUpload = function(form){
        $scope.fileName = null;
        $scope.singleorderData = {};
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#addPodialog').modal('hide');

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
        $scope.listOfStatesCount(defaultTab, page);
    }

    $scope.dayDataCollapseFn = function() {
        $scope.dayDataCollapse = [];
        console.log($scope.orderLists);
        for (var i = 0; i < $scope.orderLists.length; i += 1) {
            $scope.dayDataCollapse.push(false);
            console.log(dayDatacollapse);
        }
    }

    $scope.setShowInvoiceFlag = function (index) {

        $scope.showinvoice = false;
	    var tablePurchaseOrderSkus = $scope.orderLists[index].tablePurchaseOrderSkuses;
	    if(tablePurchaseOrderSkus != null && tablePurchaseOrderSkus.length > 0)
        {
            for(var poskucounter=0; poskucounter<tablePurchaseOrderSkus.length;poskucounter++)
            {
                var tableSkuData = tablePurchaseOrderSkus[poskucounter];
                if(tableSkuData.tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId == 8 || tableSkuData.tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId == 7 || tableSkuData.tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId == 6 )
                {
                    $scope.showinvoice = true;
                }
            }
        }


    }
    $scope.setViewInvoiceFlag = function (index) {
        $scope.viewinvoice = false;
        if($scope.orderLists[index].tablePurchaseInvoices && $scope.orderLists[index].tablePurchaseInvoices.length > 0)
        {
            $scope.viewinvoice = true;
        }

    }

    $scope.checkifPOIvoiceExistsForSku = function (poId, skuId) {

        var q = $q.defer();
        var url = MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchase/order/' + poId + '/purchaseinvoice/isinvoiceexist/' + skuId;
        $http.get(url).success(function (data) {
            console.log(data);

            q.resolve(data);
        }).error(function (error, status) {
            console.log(error);
            console.log(status);
            if (status == 400) {
               $scope.notify(error.errorMessage);
            }
            else {
               $scope.notify("there is some error");
            }
            q.resolve(true);
        });

        return q.promise;
    }

//    ================================== table row expnsion ================================= //

    $scope.selectTableRow = function(index, storeId) {

	    $scope.setShowInvoiceFlag(index);
        $scope.setViewInvoiceFlag(index);
        console.log(index);
        console.log(storeId);
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

    $scope.stateTrials = function(saleordskus) {
        console.log(saleordskus);
        console.log(saleordskus.length);
        $scope.trialsDataArray = [];
        $scope.trialIdArray = [];
        $scope.trialsLength = [];
        $scope.fullTrialsArray = [];
        $scope.fullIdArray = [];
        $scope.StateArray = [];
        for (var i = 0; i < saleordskus.length; i++) {
            console.log(i);
            console.log(saleordskus[i]);
            $scope.StateArray.push(saleordskus[i].tablePurchaseOrderSkuStateType.tablePurchaseOrderSkuStateTypeString);
            console.log($scope.StateArray);
            console.log(saleordskus[i]);
            var trials = saleordskus[i].tablePurchaseOrderSkuStateTrails;
            $scope.trialsLength.push(trials.length);
            console.log(trials);
            console.log($scope.trialsLength);
            if (trials.length < 4) {
                for (var j = 0; j < trials.length; j++) {
                    console.log(trials[j].tablePurchaseOrderSkuStateType.tablePurchaseOrderSkuStateTypeString);
                    $scope.trialsDataArray.push(trials[j].tablePurchaseOrderSkuStateType.tablePurchaseOrderSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId);
                }
            }

            if (trials.length == 4) {
                for (var j = 0; j < trials.length; j++) {
                    console.log(trials[j].tablePurchaseOrderSkuStateType.tablePurchaseOrderSkuStateTypeString);
                    $scope.trialsDataArray.push(trials[j].tablePurchaseOrderSkuStateType.tablePurchaseOrderSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId);
                }
            }

            if (trials.length > 4) {
                console.log(trials.length - 4);
                var totalLength = trials.length - 4;
                for (var j = totalLength; j < trials.length; j++) {
                    console.log(trials[j].tablePurchaseOrderSkuStateType.tablePurchaseOrderSkuStateTypeString);
                    $scope.trialsDataArray.push(trials[j].tablePurchaseOrderSkuStateType.tablePurchaseOrderSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId);
                }
            }


            $scope.fullTrialsArray.push($scope.trialsDataArray);
            $scope.fullIdArray.push($scope.trialIdArray);

            $scope.trialsDataArray = [];
            $scope.trialIdArray = [];

            //console.log($scope.fullTrialsArray);
        }
    }


    $scope.openInfoBox = function(ev, stateTrials) {
        $scope.steps = [];
        console.log(stateTrials);
        for (var i = 0; i < stateTrials.length; i++) {
            var a = stateTrials.length - 1;
            console.log(a);
            var fulldate = $filter('utcToLocalOrHyphen')(stateTrials[i].tablePurchaseOrderSkuStateTrailTimestamp);
            if (i < a) {
                $scope.steps.push({
                    title: stateTrials[i].tablePurchaseOrderSkuStateType.tablePurchaseOrderSkuStateTypeString,
                    active: true,
                    orderState: "Successful",
                    remarks: stateTrials[i].tablePurchaseOrderSkuStateTrailRemarks,
                    fulldate: fulldate
                });
            }
            if (i == a) {
                $scope.steps.push({
                    title: stateTrials[i].tablePurchaseOrderSkuStateType.tablePurchaseOrderSkuStateTypeString,
                    orderState: "In Process",
                    remarks: stateTrials[i].tablePurchaseOrderSkuStateTrailRemarks,
                    fulldate: fulldate
                });
            }
        }
        console.log($scope.steps);
        $('#infoDialogPO').modal('show');
    }


    $scope.cancelInfoBox = function() {
        $('#infoDialogPO').modal('hide');
    }


    $scope.cancelSaleOrderBox = function(ev, orderId, tableSaleOrderId, orderNo) {
        $scope.orderId = orderId;
        $scope.tableSaleOrderId = tableSaleOrderId;
        $scope.orderNo = orderNo;
        $scope.LoadNewRason = {};
        $scope.loadCancelReasons();
        $('#cancelPODialog').modal('show');
    }

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
        $('#cancelPODialog').modal('hide');
    }

    $scope.loadCancelReasons = function() {
        var cancelReasonsUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchaseordercancelreasons';
        $http.get(cancelReasonsUrl).success(function(data) {
            console.log(data);
            $scope.cancelReasonArray = data;
            //$scope.getPoData();
            console.log($scope.cancelReasonArray);
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }


    $scope.selectCancelAction = function(orderId, tableSaleOrderId, remarks, otherReasonRemarks,form) {
        if (remarks != undefined && remarks == 'other'){

            if (remarks == 'other'){
                if ($scope.LoadNewRason.ReasonCheckBox == true)
                {
                    console.log($scope.LoadNewRason.reasonData);
                    var postDataReason;
                    postDataReason = {
                        "tablePurchaseOrderCancelReasonString": $scope.LoadNewRason.reasonData
                    };
                    $http({
                        method: 'POST',
                        url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchaseordercancelreasons',
                        data: postDataReason,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).success(function (data) {
                        $scope.loadCancelReasons();
                        $scope.notify('Cancel reason added successfully','success');
                    }).error(function (data) {
                        console.log(data);
                    });
                }
            }
            var cancelUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchase/order/' + orderId + '/orderskus/' + tableSaleOrderId + '/cancel/?remarks=' + otherReasonRemarks;
            var putdata = '';
            $http.put(cancelUrl,putdata).success(function (data) {
                console.log(data);
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
                console.log(error);
                console.log(status);
                if(status == 400){
                   $scope.notify(error.errorMessage);
                }
                else {
                   $scope.notify("Order cannot be cancelled");
                }
            });
        }
        else if (remarks != undefined && remarks != 'other') {

            var cancelUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchase/order/' + orderId + '/orderskus/' + tableSaleOrderId + '/cancel/?remarks=' + remarks;
            var putdata = '';
            $http.put(cancelUrl,putdata).success(function (data) {
                console.log(data);
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
                if(status == 400){
                   $scope.notify(error.errorMessage);
                }
                else {
                   $scope.notify("Order cannot be cancelled");
                }
            });
        }
    }

    $scope.totalCostAmount = function(allSkus) {
        var total = 0;
        var totalCost = 0;
        var totalCostAmount = 0;
        var totalCostAll = [];
        for (var i = 0; i < allSkus.length; i++) {
            //console.log(allSkus[i]);
            for (var j = 0; j < allSkus[i].tablePurchaseOrderSkusChargeses.length; j++) {
                var product = allSkus[i].tablePurchaseOrderSkusChargeses[j].tablePurchaseOrderSkusChargesValue;
                total += product;
            }
            totalCostAmount += total * allSkus[i].tablePurchaseOrderSkusSkuQuantity;
            totalCostAll.push(totalCostAmount);
            total = 0;
        }
        return parseFloat(totalCostAmount).toFixed(2);
    };


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


//=============================================== Searching po ========================== //
    $scope.onRecordsPerPageChange = function (orderSize) {
        $scope.start = 0;
        $scope.orderSize = orderSize;
        $scope.end = 0;
        $scope.orderLists = [];
        $scope.listOfStatesCount($scope.defaultTab, 1);
    }
    $scope.listOfStatesCount = function(tabsValue, page, action) {
        if(typeof $scope.channel == 'undefined' || $scope.channel == null || $scope.channel == ''){
            $scope.channels = "";
        }
        else{
            $scope.channels = JSON.parse($scope.channel);
        }
        $scope.defaultTab = tabsValue;
        $scope.allCount = 0;
        $scope.newCount = 0;
        $scope.processCount = 0;
        $scope.holdCount = 0;
        $scope.returnCount = 0;
        $scope.cancelledCount = 0;
        $scope.shippingCount = 0;
        $scope.returnCount = 0;
        $scope.draftCount = 0;

        var newCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/purchase/order/filtercount?state=new&uipagename="+$scope.pagename;
        var processCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/purchase/order/filtercount?state=inprocess&uipagename="+$scope.pagename;
        var holdCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/purchase/order/filtercount?state=intransit&uipagename="+$scope.pagename;
        var returnCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/purchase/order/filtercount?state=grn&uipagename="+$scope.pagename;
        var cancelledCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/purchase/order/filtercount?state=cancelled&uipagename="+$scope.pagename;
        var draftCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/purchase/order/filtercount?state=draft&uipagename="+$scope.pagename;
        var allCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/purchase/order/filtercount?uipagename="+$scope.pagename;

        if (typeof $scope.channel == "undefined" || $scope.channel == null || $scope.channel == "") {
            newCountUrl;
            processCountUrl;
            holdCountUrl;
            returnCountUrl;
            cancelledCountUrl;
            allCountUrl;
        }
        else {
            newCountUrl += "&warehouseid=" + $scope.channels;
            processCountUrl += "&warehouseid=" + $scope.channels;
            holdCountUrl += "&warehouseid=" + $scope.channels;
            returnCountUrl += "&warehouseid=" + $scope.channels;
            cancelledCountUrl += "&warehouseid=" + $scope.channels;
            allCountUrl += "&warehouseid=" + $scope.channels;
            draftCountUrl += "&warehouseid=" + $scope.channels;
        }
        if ($scope.skuId) {
            newCountUrl += "&skuid=" + $scope.skuId;
            processCountUrl += "&skuid=" + $scope.skuId;
            holdCountUrl += "&skuid=" + $scope.skuId;
            returnCountUrl += "&skuid=" + $scope.skuId;
            cancelledCountUrl += "&skuid=" + $scope.skuId;
            allCountUrl += "&skuid=" + $scope.skuId;
            draftCountUrl += "&skuid=" + $scope.skuId;
        }
        if ($scope.vendorId) {
            newCountUrl += "&vendorid=" + $scope.vendorId;
            processCountUrl += "&vendorid=" + $scope.vendorId;
            holdCountUrl += "&vendorid=" + $scope.vendorId;
            returnCountUrl += "&vendorid=" + $scope.vendorId;
            cancelledCountUrl += "&vendorid=" + $scope.vendorId;
            allCountUrl += "&vendorid=" + $scope.vendorId;
            draftCountUrl += "&vendorid=" + $scope.vendorId;
        }
        if ($scope.ClientOrderNo) {
            newCountUrl += "&clientorderid=" + $scope.ClientOrderNo;
            processCountUrl += "&clientorderid=" + $scope.ClientOrderNo;
            holdCountUrl += "&clientorderid=" + $scope.ClientOrderNo;
            returnCountUrl += "&clientorderid=" + $scope.ClientOrderNo;
            cancelledCountUrl += "&clientorderid=" + $scope.ClientOrderNo;
            allCountUrl += "&clientorderid=" + $scope.ClientOrderNo;
            draftCountUrl += "&clientorderid=" + $scope.ClientOrderNo;
        }
        if ($scope.systemOrderNo) {
            newCountUrl += "&orderid=" + $scope.systemOrderNo;
            processCountUrl += "&orderid=" + $scope.systemOrderNo;
            holdCountUrl += "&orderid=" + $scope.systemOrderNo;
            returnCountUrl += "&orderid=" + $scope.systemOrderNo;
            cancelledCountUrl += "&orderid=" + $scope.systemOrderNo;
            allCountUrl += "&orderid=" + $scope.systemOrderNo;
            draftCountUrl += "&orderid=" + $scope.systemOrderNo;
        }
        if ($scope.startDate) {
            newCountUrl += "&startdate=" + $scope.startDate;
            processCountUrl += "&startdate=" + $scope.startDate;
            holdCountUrl += "&startdate=" + $scope.startDate;
            returnCountUrl += "&startdate=" + $scope.startDate;
            cancelledCountUrl += "&startdate=" + $scope.startDate;
            allCountUrl += "&startdate=" + $scope.startDate;
            draftCountUrl += "&startdate=" + $scope.startDate;
        }
        if ($scope.endDate) {
            newCountUrl += "&enddate=" + $scope.endDate;
            processCountUrl += "&enddate=" + $scope.endDate;
            holdCountUrl += "&enddate=" + $scope.endDate;
            returnCountUrl += "&enddate=" + $scope.endDate;
            cancelledCountUrl += "&enddate=" + $scope.endDate;
            allCountUrl += "&enddate=" + $scope.endDate;
            draftCountUrl += "&enddate=" + $scope.endDate;
        }
        var promises = [
            $http.get(allCountUrl),
            $http.get(newCountUrl),
            $http.get(processCountUrl),
            $http.get(holdCountUrl),
            $http.get(returnCountUrl),
            $http.get(cancelledCountUrl),
            $http.get(draftCountUrl)
        ]

        $q.all(promises)
            .then(function (response) {
                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }


                    vm.pager = pagerService.GetPager(vm.dummyItems.length, page,$scope.orderSize);
                    console.log(vm.pager);
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
                $scope.holdCount = response[3].data;
                $scope.returnCount = response[4].data;
                $scope.cancelledCount = response[5].data;
                $scope.draftCount = response[6].data;
                var vm = this;
                vm.pager = {};
                if (tabsValue == 'all') {
                    vm.dummyItems = _.range(0, $scope.allCount);
                }
                else if(tabsValue == 'new'){
                    vm.dummyItems = _.range(0, $scope.newCount);
                }
                else if(tabsValue == 'inprocess'){
                    vm.dummyItems = _.range(0, $scope.processCount);
                }
                else if(tabsValue == 'intransit'){
                    vm.dummyItems = _.range(0, $scope.holdCount);
                }
                else if(tabsValue == 'grn'){
                    vm.dummyItems = _.range(0, $scope.returnCount);
                }
                else if(tabsValue == 'cancelled'){
                    vm.dummyItems = _.range(0, $scope.cancelledCount);
                }
                else if(tabsValue == 'draft'){
                    vm.dummyItems = _.range(0, $scope.draftCount);
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

    }

    $scope.cancelData = {};
    $scope.onCancelClicked = function(data, skuData)
    {
        $scope.loadCancelReasons();
        $scope.LoadNewRason = {};
        $scope.disableCancel = false;
        $scope.cancelData.orderID = data.idtablePurchaseOrderId;
        $scope.cancelData.systemOrderNo = data.tablePurchaseOrderSystemOrderNo;
        if(skuData)
        {
            $scope.cancelData.skuData = skuData;
            $scope.cancelData.isForSkus = true;
            $("#cancelPODialog").modal('show');
        }
        else
        {
            var purchaseOrderSkus = data.tablePurchaseOrderSkuses;
            $scope.skusForCancel = [];
            for(var skucounter=0; skucounter < purchaseOrderSkus.length; skucounter++)
            {
                if(purchaseOrderSkus[skucounter].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId != 6 && purchaseOrderSkus[skucounter].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId != 12 )
                {
                    $scope.skusForCancel.push(
                        {
                            "poskuid" : purchaseOrderSkus[skucounter].idtablePurchaseOrderSkusId,
                            "poskusystemcode" : purchaseOrderSkus[skucounter].tableSku.tableSkuSystemNo,
                            "posskuclientcode" : purchaseOrderSkus[skucounter].tableSku.tableSkuClientSkuCode,
                            "posskuname" : purchaseOrderSkus[skucounter].tableSku.tableSkuName,
                            "selected" :  false
                        }
                    )
                }
            }

            $("#selectskuforcancel").modal('show');
        }
    }

    $scope.cancelPo = function(remarks, otherReasonRemarks)
    {
        var cancelids = [];
        for(var cancelcounter =0; cancelcounter < $scope.skusForCancel.length ; cancelcounter++)
        {
            if($scope.skusForCancel[cancelcounter].selected == true)
            {
                cancelids.push($scope.skusForCancel[cancelcounter].poskuid);
            }
        }
        if(cancelids.length == 0)
        {
           $scope.notify("Select at least one SKU for cancel");
            return;
        }

        $scope.disableCancel = true;

        if (remarks != undefined && remarks == 'other') {

            if (remarks == 'other') {
                if ($scope.LoadNewRason.ReasonCheckBox == true) {
                    console.log($scope.LoadNewRason.NewReason);
                    var postDataReason;
                    postDataReason = {
                        "tablePurchaseOrderCancelReasonString": $scope.LoadNewRason.NewReason
                    };
                    $http({
                        method: 'POST',
                        url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchaseordercancelreasons',
                        data: postDataReason,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).success(function (data) {
                        $scope.loadCancelReasons();
                        $scope.notify('Cancel reason added successfully','success');
                    }).error(function (data) {
                        console.log(data);
                    });
                }
            }

            $http({
                method: 'PUT',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchase/order/' + $scope.cancelData.orderID + '/cancel?remarks=' + otherReasonRemarks,
                data: cancelids

            }).success(function (data) {
                $('#selectskuforcancel').modal('hide');
                $scope.notify('Successfully cancelled','success');
                $scope.listOfStatesCount($scope.defaultTab);
                $scope.intransit = {};
            }).error(function (data) {
                $scope.disableCancel = false;
            });
        }
        else if (remarks != undefined && remarks != 'other') {
            $http({
                method: 'PUT',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchase/order/' + $scope.cancelData.orderID + '/cancel?remarks=' + remarks,
                data: cancelids

            }).success(function (data) {
                $('#selectskuforcancel').modal('hide');
                $scope.notify('Successfully cancelled','success');
                $scope.listOfStatesCount($scope.defaultTab);
            }).error(function (data) {
                $scope.disableCancel = false;
            });
        }
    }

    $scope.transitData = {};
    $scope.onIntransitClicked = function(data, skuData)
    {
        $scope.disableInTransit = false;
        $scope.transitData.orderID = data.idtablePurchaseOrderId;
        if(skuData)
        {
            $scope.transitData.skuData = skuData;
            $scope.transitData.isForSkus = true;
            $("#intransitforsku").modal('show');
        }
        else
        {
            var purchaseOrderSkus = data.tablePurchaseOrderSkuses;
            $scope.skusForTransit = [];
            for(var skucounter=0; skucounter < purchaseOrderSkus.length; skucounter++)
            {
                if(purchaseOrderSkus[skucounter].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId != 6 && purchaseOrderSkus[skucounter].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId != 12 )
                {
                    $scope.skusForTransit.push(
                        {
                            "poskuid" : purchaseOrderSkus[skucounter].idtablePurchaseOrderSkusId,
                            "poskusystemcode" : purchaseOrderSkus[skucounter].tableSku.tableSkuSystemNo,
                            "posskuclientcode" : purchaseOrderSkus[skucounter].tableSku.tableSkuClientSkuCode,
                            "posskuname" : purchaseOrderSkus[skucounter].tableSku.tableSkuName,
                            "selected" :  false
                        }
                    )
                }
            }

            $("#intransit").modal('show');
        }
    }

    $scope.inTransitForSku = function()
    {
        $scope.disableInTransit = true;

        var url = MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchase/order/' + $scope.transitData.orderID + '/intransit';

        if ($scope.transitData.isForSkus == true) {
            url = MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchase/order/' + $scope.transitData.orderID + '/orderskus/' + $scope.transitData.skuData.idtablePurchaseOrderSkusId + '/intransit';
        }
        ///omsservices/webapi/purchase/order/1/orderskus/1/intransit
        $http({
            method: 'PUT',
            data : '',
            url: url
        }).success(function(data)
        {
            console.log(data);
            $('#intransitforsku').modal('hide');
            $scope.notify('Successfully moved to In-Transit','success');
           $mdDialog.hide();
            $scope.listOfStatesCount($scope.defaultTab);
        }).error(function(data)
        {  $scope.notify(data.documentation);
            $scope.disableInTransit = true;
            $('#intransitforsku').modal('hide');
            $mdDialog.hide();
        });
    }

    $scope.inTransit = function()
    {
        var intransitids = [];
        for(var intransitcounter =0; intransitcounter < $scope.skusForTransit.length ; intransitcounter++)
        {
            if($scope.skusForTransit[intransitcounter].selected == true)
            {
                intransitids.push($scope.skusForTransit[intransitcounter].poskuid);
            }
        }
        if(intransitids.length == 0)
        {
           $scope.notify("Select at least one SKU for marking in transit");
            return;
        }

        $scope.disableInTransit = true;

        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchase/order/'+$scope.transitData.orderID+'/intransit',
            data:intransitids

        }).success(function(data)
         {
            $('#intransit').modal('hide');
             $scope.notify('Successfully moved to In-Transit','success');
            $mdDialog.hide();
             $scope.intransit = {};
            $scope.listOfStatesCount($scope.defaultTab);
        }).error(function(data)
        {
            $scope.disableInTransit = false;
            console.log(data);
        });
    }


    //=============================== Print barcode Lables ================================== //

    $scope.printbarcodeLabel = function(value){
        console.log(value);
        $scope.barcode.skuid = value.tableSku.idtableSkuId;
        $scope.barcode.type = 'Standard';
        $('#barcodeprinting').modal('show');

    };

    $scope.submitPrintBarcodeForm = function(form){
        $scope.previewTemp = MavenAppConfig.baseUrlSource+'/omsservices/webapi/skus/'+$scope.barcode.skuid+'/printskubarcode?barcodetype='+$scope.barcode.type + '&quantity=' + $scope.barcode.quantity;
        window.open($scope.previewTemp);
        $http.get($scope.previewTemp, {
            responseType: 'arraybuffer'
        })
            .success(function(response) {
                console.log(response);
                var file = new Blob([(response)], {
                    type: 'application/pdf'
                });
                var fileURL = URL.createObjectURL(file);
                $scope.content = $sce.trustAsResourceUrl(fileURL);
                $('#barcodeprinting').modal('hide');
                $scope.barcode = {};
            }).error(function(data){
            console.log(data);
        });

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


    //====================================== ends here ============================== //

//    ============================================== ADd GRN ====================================== //

    $scope.SkuDetails = {};


    //=============================================== Show SKU Inventory operation data =================================//


    $scope.calcQCFailed = function () {

        if(($scope.grnInventory.tableSkuInventoryActualInwardCount == null || $scope.grnInventory.tableSkuInventoryActualInwardCount == undefined)&& ($scope.grnInventory.tableSkuInventoryInwardQcFailedCount == null || $scope.grnInventory.tableSkuInventoryInwardQcFailedCount == undefined))
        {
            return;
        }

        if(($scope.grnInventory.tableSkuInventoryAvailableCount == null || $scope.grnInventory.tableSkuInventoryAvailableCount == undefined)&&($scope.grnInventory.tableSkuInventoryInwardQcFailedCount==null || $scope.grnInventory.tableSkuInventoryInwardQcFailedCount == undefined))
        {
            return;
        }

        $scope.grnInventory.tableSkuInventoryInwardQcFailedCount = $scope.grnInventory.tableSkuInventoryActualInwardCount - $scope.grnInventory.tableSkuInventoryAvailableCount ;
        if($scope.grnInventory.tableSkuInventoryInwardQcFailedCount < 0 ) {
           $scope.notify('QC Passed quantity cannot be greater than received quantity');
            $scope.grnInventory.tableSkuInventoryAvailableCount = null;
            $scope.grnInventory.tableSkuInventoryInwardQcFailedCount = null;
        }
    }


	$scope.checkEditButton = function(podata) {
		var v = true;
        angular.forEach(podata.tablePurchaseOrderSkuses, function(item){
			var value = item.tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId;
                   if(value != 1 && value != 2 && value != 3){
					   v = false;
				   }

               });
			   return v;
    }

    $scope.startmaxDate = new Date();
    $scope.endmaxDate = new Date();
    $scope.endminDate = new Date();



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

        if($scope.singleorderData.dropDate)
        {
            $scope.deliveryDateData = new Date($scope.singleorderData.dropDate);
            $scope.maxDateShipping = new Date(
                $scope.deliveryDateData.getFullYear(),
                $scope.deliveryDateData.getMonth(),
                $scope.deliveryDateData.getDate());
        }

        //Delivery date should be greater than equal to shipping date

        if($scope.singleorderData.pickUpDate)
        {
            $scope.shippingDateData = new Date($scope.singleorderData.pickUpDate);
            $scope.minDateDelivery = new Date(
                $scope.shippingDateData.getFullYear(),
                $scope.shippingDateData.getMonth(),
                $scope.shippingDateData.getDate());
        }
    };

    $scope.onDeliveryDateChange = function ()
    {
        //should be greater than equal to today's date and if shipping date is there then should be greater than shipping date

        $scope.minDateDelivery = new Date();

        if($scope.singleorderData.pickUpDate)
        {
            $scope.shippingDateData = new Date($scope.singleorderData.pickUpDate);
            $scope.minDateDelivery = new Date(
                $scope.shippingDateData.getFullYear(),
                $scope.shippingDateData.getMonth(),
                $scope.shippingDateData.getDate());
        }

        if($scope.singleorderData.dropDate)
        {
            $scope.deliveryDateData = new Date($scope.singleorderData.dropDate);
            $scope.maxDateShipping = new Date(
                $scope.deliveryDateData.getFullYear(),
                $scope.deliveryDateData.getMonth(),
                $scope.deliveryDateData.getDate());
        }

    };


    $scope.clearStartDate = function()
    {
        $scope.startDate = "";
        $scope.start1Date = null;
        if($scope.end1Date == null)
        {
            $scope.startmaxDate = new Date();
        }
        else
        {
            $scope.sendEndDate($scope.end1Date);
        }
        $scope.endminDate = null;
    }

    $scope.clearEndDate = function()
    {
        $scope.endDate = "";
        $scope.end1Date = null;
        $scope.startmaxDate = new Date();
        $scope.endmaxDate = new Date();
        if($scope.start1Date == null)
        {
            $scope.endminDate = null;
        }
        else
        {
            $scope.sendStartDate($scope.start1Date);
        }
    }


    //===================================== Add Invoice =============================== //


    $scope.PurchaseOrderLevelActionRow = function(tableSkuData){

        var qualifiedskus = 0;

        for(var i = 0; i < tableSkuData.length; i++)
        {
            if(tableSkuData[i].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId == 1
            || tableSkuData[i].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId == 2
            || tableSkuData[i].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId == 3
            || tableSkuData[i].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId == 4
            || tableSkuData[i].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId == 5)
            {
                qualifiedskus++;
            }

        }

        if(qualifiedskus > 1)
        {
            return true;
        }
    };

    $scope.splitOrderBySkuDialog = function(ev, data, orderid){
        $scope.skusListForOrderSplit = data;
        $scope.genericData.orderId = orderid;

        $mdDialog.show({
            templateUrl: 'splitPOSku.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        });

    };

    $scope.splitOrderBySkus = function(){
        var arr = $scope.genericData.skuSelectedArray;

        if(arr.length <= 0)
        {
           $scope.notify("Please select one of the skus");
            return;
        }
        var skuArrayLength = arr.length;
        var totalSkusLength = $scope.skusListForOrderSplit.length;
        if(skuArrayLength >= totalSkusLength){
           $scope.notify("You cannot select all the SKUs.");
            return;
        }
        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchase/order/' + $scope.genericData.orderId +'/splitpurchaseorder',
            data: arr
        }).success(function() {
            $scope.genericData.skuSelectedArray = [];
            $scope.listOfStatesCount($scope.defaultTab);
            $scope.notify("Order split successful",'success');
           $mdDialog.hide();

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

    $scope.updateSkuArray = function(data){

        var idx = $scope.genericData.skuSelectedArray.indexOf(data);
        console.log(idx);
        // is currently selected
        if (idx > -1) {
            $scope.genericData.skuSelectedArray.splice(idx, 1);
        }

        // is newly selected
        else {
            $scope.genericData.skuSelectedArray.push(data);
        }
        console.log($scope.genericData.skuSelectedArray);
    }

    $scope.cancelSplitOrderBySkuDialog = function(){
        $mdDialog.hide({
            templateUrl: 'splitPOSku.tmpl.html'
        });
    }


    $scope.splitPOBySkuByQuantityDialog = function(ev, data, orderid, quantity){
        $scope.genericData.skuid = data;
        $scope.genericData.orderId = orderid;
        $scope.genericData.totalskusQuantity = quantity;
        $mdDialog.show({
            templateUrl: 'splitPOSkubyquantity.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        });
    }

    $scope.genericData.quantity = null;

    $scope.cancelPOSplitQuantityDialog = function(){

        $scope.genericData.quantity = null;
        $scope.genericData.totalskusQuantity = null;

        $mdDialog.hide({
            templateUrl: 'splitPOSkubyquantity.tmpl.html'
        });

    }

    $scope.splitPOBySkusByQuantity = function()
    {
        if($scope.genericData.quantity < 1){
           $scope.notify("Quantity can not be less than or equal to 1." );
            return;
        }

        if($scope.genericData.quantity >= $scope.genericData.totalskusQuantity){
           $scope.notify("Quantity can not be greater than or equal to "+ $scope.genericData.totalskusQuantity);
            return;
        }

        $http({
            method: 'PUT',
            data : '',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchase/order/' + $scope.genericData.orderId +'/splitpurchaseorderwithskuquantity/'+ $scope.genericData.skuid + '?skuquantity='+$scope.genericData.quantity

        }).success(function()
        {
            $scope.notify("Order splitted successfully",'success');
            $scope.listOfStatesCount($scope.defaultTab);
            $scope.genericData.quantity = null;
           $mdDialog.hide();

        }).error(function(error, status)
        {
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

    $scope.initInvoiceDataForAutoFill = function (selectedPo) {

        $scope.singleorderData = selectedPo;
        $scope.tableInvoiceLineItems = [];
        $scope.tableInvoiceLineItems[0] = {};

        $scope.invoielineitemindex = 0;
        $scope.$broadcast("angucomplete-alt:clearInput", "searchsku" + 0);

        $scope.tableInvoiceLineItemNets  = [];
        $scope.tableInvoiceLineItemNets[0] = [];
        $scope.tableInvoiceLineItemNets[0][0] = 0;

        $scope.addMoreLineItemGross(0);

        $scope.tableGrosses = [];
        $scope.tableGrosses[0] = {};

        $scope.netInvoiceLevelAmounts = [];
        $scope.netInvoiceLevelAmounts[0] = 0;

        $scope.imageInputValue = {};
        $scope.multipleImagesList = [];

        $scope.totalGross = 0.00;
        $scope.totalDiscount = 0.00;
        $scope.totalNet = 0.00;
        $scope.totalTax = 0.00;
    }


    $scope.initInvoiceData = function (selectedPo) {

        $scope.tablePurchaseInvoice = {};
        $scope.tablePurchaseInvoice.tablePurchaseInvoiceIsTaxInclusive = true;
        $scope.startmaxDate = new Date();
        $scope.$broadcast('angucomplete-alt:clearInput', 'searchsku');

        $scope.singleorderData = selectedPo;

        $scope.tableInvoiceLineItems = [];
        $scope.tableInvoiceLineItems[0] = {};

        $scope.tableInvoiceLineItemNets  = [];
        $scope.tableInvoiceLineItemNets[0] = [];
        $scope.tableInvoiceLineItemNets[0][0] = 0;

        $scope.addMoreLineItemGross(0);

        $scope.tableGrosses = [];
        $scope.tableGrosses[0] = {};

        $scope.netInvoiceLevelAmounts = [];
        $scope.netInvoiceLevelAmounts[0] = 0;

        $scope.imageInputValue = {};
        $scope.multipleImagesList = [];

        $scope.totalGross = 0.00;
        $scope.totalDiscount = 0.00;
        $scope.totalNet = 0.00;
        $scope.totalTax = 0.00;

    }
    $scope.OpenAddInvoiceDialog = function(selectedPO)
    {
        $scope.invoiceMode = 'add';
        $scope.genericData.autofill = false;
        $scope.initInvoiceData(selectedPO);
        $scope.getVendorAddresses();
        $('#addPoInvoice').modal('show');

    }

    $scope.onCancelViewInvoicesClicked = function () {
        $('#viewInvoices').modal('hide');
    }

    $scope.onViewInvoiceButtonClicked = function(po)
    {
        $scope.selectedPo =  po;
        $('#viewInvoices').modal('show');
    }

    $scope.setInvoiceData = function (tablePurchaseInvoice) {

        $scope.singleorderData = $scope.selectedPo;
        $scope.tableInvoiceLineItemNets = [];
        $scope.tableInvoiceLineItemNets[0] = [];

        $scope.netInvoiceLevelAmounts = [];
        $scope.netInvoiceLevelAmounts[0] = 0;

        $scope.tablePurchaseInvoice = tablePurchaseInvoice;
        $scope.tableInvoiceLineItems = $scope.tablePurchaseInvoice.tableInvoiceLineItems;
        $scope.tableGrosses = $scope.tablePurchaseInvoice.tableGrosses;

        for (var lineItemCounter = 0; lineItemCounter < $scope.tableInvoiceLineItems.length; lineItemCounter++)
        {
            $scope.tableInvoiceLineItemNets.push([0]);
            for (var lineitemgrosscounter = 0; lineitemgrosscounter < $scope.tableInvoiceLineItems[lineItemCounter].tableGrosses.length; lineitemgrosscounter++) {
                $scope.onLineItemDiscountChange(lineItemCounter, lineitemgrosscounter);
                $scope.onLineItemTaxChange(lineItemCounter, lineitemgrosscounter);
            }
        }

        for (var invoicegrosscounter = 0; invoicegrosscounter < $scope.tableGrosses.length; invoicegrosscounter++) {
            $scope.onInvoiceDiscountChange(invoicegrosscounter);
            $scope.onInvoiceTaxChange(invoicegrosscounter);
        }
    }

    $scope.onViewInvoiceLinkClicked = function (tablePurchaseInvoice)
    {

        $scope.setInvoiceData(tablePurchaseInvoice);
        $('#viewPurchaseInvoice').modal('show');

    }

    $scope.onCancelViewInvoiceClicked = function () {
        $('#viewPurchaseInvoice').modal('hide');
    }

    $scope.onViewInvoiceImageClicked = function () {

        var invoiceImageURL = MavenAppConfig.baseUrlSource + "/omsservices/webapi/purchase/order/invoice?path=" + $scope.tablePurchaseInvoice.tablePurchaseInvoiceImagePath ;

        $http({
            method: 'GET',
            url: invoiceImageURL,
            responseType:'arraybuffer',
            dataType:'blob'
        }).
        success(function(imgdata)
        {

            var file = new Blob([(imgdata)], {
                type: 'application/pdf'
            });

            var fileURL = URL.createObjectURL(file);
            $scope.content = $sce.trustAsResourceUrl(fileURL);
            $('#purchaseInvoicePdf').modal('show');

        }).error(function(error, status)
        {
            if(status == 400)
            {
               $scope.notify(error.errorMessage);
            }
            else
            {
               $scope.notify("Failed to get invoice image");
            }
        });

    }

    $scope.cancelPurchaseInvoice = function (ev) {
        $('#addPoInvoice').modal('hide');
    }

    $scope.invoielineitemindex = 0;
    $scope.selectedInvoiceLineItemIndex = function (invoielineitemindex) {
        $scope.invoielineitemindex = invoielineitemindex;
    }

    $scope.searchedProductForInvoice = function(selected)
    {
        if(selected != null && selected != undefined)
        {
            $scope.tableInvoiceLineItems[$scope.invoielineitemindex].tableSku = selected.originalObject;
        }
    }



    $scope.addPurchaseInvoiceLineElement = function()
    {
        $scope.tableInvoiceLineItems.push({});
        $scope.tableInvoiceLineItems[$scope.tableInvoiceLineItems.length -1].tableGrosses = [];
        $scope.tableInvoiceLineItems[$scope.tableInvoiceLineItems.length -1].tableGrosses[0] = {};
        $scope.tableInvoiceLineItemNets.push([0]);
        console.log($scope.tableInvoiceLineItems);
    };

    $scope.deleteLineItem = function(index)
    {
        console.log(index);
        $scope.tableInvoiceLineItems.splice(index,1);
        $scope.tableInvoiceLineItemNets.splice(index,1);
        $scope.calculateTotalValues();
        $timeout(function()
        {
            for(var licounter=0; licounter < $scope.tableInvoiceLineItems.length; licounter++)
            {
                $scope.invoielineitemindex = licounter;
                $scope.$broadcast("angucomplete-alt:changeInput", "searchsku" + licounter, $scope.tableInvoiceLineItems[licounter].tableSku);
            }
        });
    }

    $scope.deleteInvoiceChargesItem = function(index)
    {
        console.log(index);
        $scope.tableGrosses.splice(index,1);
        $scope.netInvoiceLevelAmounts.splice(index,1);
        $scope.calculateTotalValues();
    }

    $scope.addMoreLineItemGross = function(invoielineitemindex)
    {
        if($scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses == undefined)
        {
            $scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses = [];
        }
        $scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses.push({});
    };
    $scope.deleteLineItemGross = function(invoielineitemindex,grossindex)
    {
        $scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses.splice(grossindex,1);
        $scope.tableInvoiceLineItemNets[invoielineitemindex].splice(grossindex,1);
        $scope.calculateTotalValues();
    };

    $scope.addMoreDiscount = function(invoielineitemindex,lineitemgrossindex)
    {
        if($scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses[lineitemgrossindex].tableDiscounts == undefined)
        {
            $scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses[lineitemgrossindex].tableDiscounts = [];
        }
        $scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses[lineitemgrossindex].tableDiscounts.push({});
    };

    $scope.deleteDiscount = function(invoielineitemindex,lineitemgrossindex,discountindex)
    {
        $scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses[lineitemgrossindex].tableDiscounts.splice(discountindex,1);
        $scope.calculateTotalValues();
    };

    $scope.addMoreTax = function(invoielineitemindex,lineitemgrossindex)
    {
        if($scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses[lineitemgrossindex].tableTaxes == undefined)
        {
            $scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses[lineitemgrossindex].tableTaxes = [];
        }
        $scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses[lineitemgrossindex].tableTaxes.push({});
    };

    $scope.deleteTax = function(invoielineitemindex,lineitemgrossindex,taxindex)
    {
        $scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses[lineitemgrossindex].tableTaxes.splice(taxindex,1);
        $scope.calculateTotalValues();
    };

    $scope.calculateTotalValues = function ()
    {
        $scope.totalGross = 0.00;
        $scope.totalDiscount = 0.00;
        $scope.totalNet = 0.00;
        $scope.totalTax = 0.00;

        //totalGross
        for(var invoielineitemindex=0; invoielineitemindex<$scope.tableInvoiceLineItems.length;invoielineitemindex++)
        {
            var tableLineItemGrosses = $scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses;
            for(var lineitemgrossindex=0; lineitemgrossindex<tableLineItemGrosses.length;lineitemgrossindex++)
            {
                if(isNaN(tableLineItemGrosses[lineitemgrossindex].tableGrossAmount) == false)
                {
                    $scope.totalGross += Number(tableLineItemGrosses[lineitemgrossindex].tableGrossAmount);
                }


                var tableDiscounts = tableLineItemGrosses[lineitemgrossindex].tableDiscounts;
                if(tableDiscounts)
                {
                    for(var discountindex=0; discountindex<tableDiscounts.length;discountindex++)
                    {
                        if(isNaN(tableDiscounts[discountindex].tableDiscountAmount) == false)
                        {
                            $scope.totalDiscount += Number(tableDiscounts[discountindex].tableDiscountAmount);
                        }
                    }

                }

                var tableTaxes = tableLineItemGrosses[lineitemgrossindex].tableTaxes;
                if(tableTaxes)
                {
                    for(var taxindex=0; taxindex<tableTaxes.length;taxindex++)
                    {
                        if(isNaN(tableTaxes[taxindex].tableTaxAmount) == false)
                        {
                            $scope.totalTax += Number(tableTaxes[taxindex].tableTaxAmount);
                        }
                    }

                }
            }

            if ($scope.tableInvoiceLineItemNets && $scope.tableInvoiceLineItemNets.length > 0) {
                if (isNaN(arraySum($scope.tableInvoiceLineItemNets[invoielineitemindex])) == false) {
                    $scope.totalNet += Number(arraySum($scope.tableInvoiceLineItemNets[invoielineitemindex]));
                }
            }
        }

        //totalGross
        var tableInvoiceGrosses = $scope.tableGrosses;
        if(tableInvoiceGrosses)
        {
            for (var invoicegrossindex = 0; invoicegrossindex < tableInvoiceGrosses.length; invoicegrossindex++) {

                if(isNaN(tableInvoiceGrosses[invoicegrossindex].tableGrossAmount) == false)
                {
                    $scope.totalGross += Number(tableInvoiceGrosses[invoicegrossindex].tableGrossAmount);
                }

                var tableDiscounts = tableInvoiceGrosses[invoicegrossindex].tableDiscounts;
                if (tableDiscounts)
                {
                    for (var discountindex = 0; discountindex < tableDiscounts.length; discountindex++)
                    {
                        if(isNaN(tableDiscounts[discountindex].tableDiscountAmount) == false)
                        {
                            $scope.totalDiscount += Number(tableDiscounts[discountindex].tableDiscountAmount);
                        }
                    }

                }

                var tableTaxes = tableInvoiceGrosses[invoicegrossindex].tableTaxes;
                if (tableTaxes) {
                    for (var taxindex = 0; taxindex < tableTaxes.length; taxindex++)
                    {
                        if(isNaN(tableTaxes[taxindex].tableTaxAmount) == false)
                        {
                            $scope.totalTax += Number(tableTaxes[taxindex].tableTaxAmount);
                        }
                    }

                }

                if ($scope.tableInvoiceLineItemNets && $scope.tableInvoiceLineItemNets.length > 0) {
                    if (isNaN($scope.tableInvoiceLineItemNets[invoicegrossindex]) == false) {
                        $scope.totalNet += Number($scope.netInvoiceLevelAmounts[invoicegrossindex]);
                    }
                }
            }
        }

        $scope.totalGross = $scope.totalGross.toFixed(2);
        $scope.totalDiscount = $scope.totalDiscount.toFixed(2);
        $scope.totalNet = $scope.totalNet.toFixed(2);
        $scope.totalTax = $scope.totalTax.toFixed(2);

    }

    function arraySum(array) {
        if(!array){
            return ;
        }
        var sum = array.reduce(function (total, num) {
            return Number(total) + Number(num);
        });
        return sum;
    }

    $scope.onLineItemDiscountChange = function (invoielineitemindex,lineitemgrossindex) {

        var tableDiscounts = $scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses[lineitemgrossindex].tableDiscounts;
        var totalDiscount = 0;
        if (tableDiscounts && tableDiscounts.length > 0) {

            for (var index = 0; index < tableDiscounts.length; index++) {
                totalDiscount += tableDiscounts[index].tableDiscountAmount;
                if (isNaN(totalDiscount)) {
                    totalDiscount = 0;
                }
            }
            $scope.tableInvoiceLineItemNets[invoielineitemindex][lineitemgrossindex] = ($scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses[lineitemgrossindex].tableGrossAmount - totalDiscount).toFixed(2);
            $scope.calculateTotalValues();
        }
        else
        {
            $scope.tableInvoiceLineItemNets[invoielineitemindex][lineitemgrossindex] = $scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses[lineitemgrossindex].tableGrossAmount;
        }
        $scope.calculateTotalValues();

    }

    $scope.onLineItemTaxChange = function (invoielineitemindex,lineitemgrossindex) {
        $scope.calculateTotalValues();
    }

    $scope.onInvoiceDiscountChange = function (invoicegrossindex) {

        var tableDiscounts = $scope.tableGrosses[invoicegrossindex].tableDiscounts;
        var totalDiscount = 0;
        if (tableDiscounts && tableDiscounts.length > 0) {

            for (var index = 0; index < tableDiscounts.length; index++) {
                totalDiscount += tableDiscounts[index].tableDiscountAmount;
            }
            $scope.netInvoiceLevelAmounts[invoicegrossindex] = ($scope.tableGrosses[invoicegrossindex].tableGrossAmount - totalDiscount).toFixed(2);

        }
        else {
            $scope.netInvoiceLevelAmounts[invoicegrossindex] = $scope.tableGrosses[invoicegrossindex].tableGrossAmount;
        }
        $scope.calculateTotalValues();
    }

    $scope.onInvoiceTaxChange = function (invoielineitemindex,lineitemgrossindex) {
        $scope.calculateTotalValues();
    }

    $scope.validateTax = function(tableTax)
    {
        if(tableTax.tableTaxType == null || tableTax.tableTaxType == undefined || tableTax.tableTaxType == "")
            return false;
        if(tableTax.tableTaxRatePercentage == null || tableTax.tableTaxRatePercentage == undefined || tableTax.tableTaxType == "")
            return false;
        if(tableTax.tableTaxAmount == null || tableTax.tableTaxAmount == undefined || tableTax.tableTaxAmount == "")
            return false;

        return true;
    }

    $scope.validateDiscount = function(tableDiscount)
    {
        if(tableDiscount.tableDiscountAmount == null || tableDiscount.tableDiscountAmount == undefined || tableDiscount.tableDiscountAmount == "")
            return false;
        return true;
    }

    $scope.validateGross = function(tableGross)
    {
        if(tableGross.tableGrossAmount == null || tableGross.tableGrossAmount == undefined || tableGross.tableGrossAmount == "")
            return false;
        var tableDiscounts = tableGross.tableDiscounts;
        if(tableDiscounts)
        {
            for (var index = 0; index < tableDiscounts.length; index++)
            {
                if ($scope.validateDiscount(tableDiscounts[index]) == false)
                {
                    return false;
                }
            }
        }
        var tableTaxes = tableGross.tableTaxes;
        if(tableTaxes)
        {
            for (var index = 0; index < tableTaxes.length; index++)
            {
                if ($scope.validateTax(tableTaxes[index]) == false)
                {
                    return false;
                }
            }
        }

        return true;
    }

    $scope.validateLineItem = function(tableInvoiceLineItem)
    {
        if(tableInvoiceLineItem.tableSku == null || tableInvoiceLineItem.tableSku == undefined || tableInvoiceLineItem.tableSku == "")
            return false;
        if(tableInvoiceLineItem.tableInvoiceLineItemSkuQuantity == null || tableInvoiceLineItem.tableInvoiceLineItemSkuQuantity == undefined || tableInvoiceLineItem.tableInvoiceLineItemSkuQuantity == "")
            return false;

        var tableGrosses = tableInvoiceLineItem.tableGrosses;
        if(tableGrosses)
        {
            for (var index = 0; index < tableGrosses.length; index++)
            {
                if ($scope.validateGross(tableGrosses[index]) == false) {
                    return false;
                }
            }
        }
        return true;
    }

    $scope.validateInvoice = function (tablePurchaseInvoice)
    {
        var tableInvoiceLineItems = tablePurchaseInvoice.tableInvoiceLineItems;
        if(tableInvoiceLineItems) {
            for (var index = 0; index < tableInvoiceLineItems.length; index++)
            {
                if ($scope.validateLineItem(tableInvoiceLineItems[index]) == false) {
                    return false;
                }
            }
        }

        var tableGrosses = tablePurchaseInvoice.tableGrosses;
        if(tableGrosses) {
            for (var index = 0; index < tableGrosses.length; index++)
            {
                if ($scope.validateGross(tableGrosses[index]) == false) {
                    return false;
                }
            }
        }
    }



    $scope.addMoreInvoiceGross = function(){
        $scope.tableGrosses.push({});
        $scope.netInvoiceLevelAmounts.push("");
    };



    $scope.addMoreInvoiceDiscount = function(grossindex)
    {
        if($scope.tableGrosses[grossindex].tableDiscounts == undefined)
        {
            $scope.tableGrosses[grossindex].tableDiscounts = [];
        }
        $scope.tableGrosses[grossindex].tableDiscounts.push({});

    };

    $scope.deleteInvoiceDiscount = function(grossindex, invoicediscountindex)
    {
        $scope.tableGrosses[grossindex].tableDiscounts.splice(invoicediscountindex,1);
        $scope.calculateTotalValues();
    };

    $scope.addMoreInvoiceTax = function(grossindex)
    {
        if($scope.tableGrosses[grossindex].tableTaxes == undefined)
        {
            $scope.tableGrosses[grossindex].tableTaxes = [];
        }
        $scope.tableGrosses[grossindex].tableTaxes.push({});

    };

    $scope.deleteInvoiceTax = function(grossindex,invoicetaxindex)
    {
        $scope.tableGrosses[grossindex].tableTaxes.splice(invoicetaxindex,1);
        $scope.calculateTotalValues();

    };
    $scope.onSearchedProductForInvoiceIndexChanged = function (invoielineitemindex) {
        $scope.invoielineitemindex = invoielineitemindex;
    }

    $scope.onAutoFillChanged = function ()
    {
        if($scope.genericData.autofill == false)
        {
            $scope.initInvoiceDataForAutoFill($scope.singleorderData);
        }
        if($scope.genericData.autofill == true)
        {
            $scope.initInvoiceDataForAutoFill($scope.singleorderData);

            var tablePurchaseInvoiceSkus = $scope.singleorderData.tablePurchaseOrderSkuses;

            for(var skucounter=0; skucounter < tablePurchaseInvoiceSkus.length; skucounter++)
            {
                if(tablePurchaseInvoiceSkus[skucounter].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId == 3
                || tablePurchaseInvoiceSkus[skucounter].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId == 6)
                {
                    if($scope.tableInvoiceLineItems.length == skucounter)
                    {
                        $scope.tableInvoiceLineItems.push({});
                        $scope.tableInvoiceLineItemNets.push([0]);
                        $scope.tableInvoiceLineItems[skucounter].tableGrosses = [];
                        $scope.tableInvoiceLineItems[skucounter].tableGrosses[0] = {};
                    }
                    $scope.tableInvoiceLineItems[skucounter].tableInvoiceLineItemSkuQuantity = tablePurchaseInvoiceSkus[skucounter].tablePurchaseOrderSkusSkuQuantity;
                    $scope.tableInvoiceLineItems[skucounter].tableSku = tablePurchaseInvoiceSkus[skucounter].tableSku;

                }
            }
            $timeout(function()
            {
                for(var licounter=0; licounter < $scope.tableInvoiceLineItems.length; licounter++)
                {
                    $scope.invoielineitemindex = licounter;
                    $scope.$broadcast("angucomplete-alt:changeInput", "searchsku" + licounter, $scope.tableInvoiceLineItems[licounter].tableSku);
                }            
            }, 500);
        }

    }

    $scope.savePurchaseInvoice = function(data)
    {
        if($scope.tablePurchaseInvoice.tableAddressByTablePurchaseInvoiceVendorAddressId == null && $scope.singleorderData.tableAddress == null)
        {
           $scope.notify("Select a vendor address");
            return;
        }
        //Validate data
        if($scope.tablePurchaseInvoice.tablePurchaseInvoiceNumber == null || $scope.tablePurchaseInvoice.tablePurchaseInvoiceNumber == undefined)
        {
           $scope.notify("Invoice number is mandatory");
            return;
        }

        if($scope.tablePurchaseInvoice.tablePurchaseInvoiceDateTime == null || $scope.tablePurchaseInvoice.tablePurchaseInvoiceDateTime == undefined)
        {
           $scope.notify("Invoice date is mandatory");
            return;
        }

        $scope.tablePurchaseInvoice.tableInvoiceLineItems = $scope.tableInvoiceLineItems;

        if($scope.tablePurchaseInvoice.tableInvoiceLineItems == null || $scope.tablePurchaseInvoice.tableInvoiceLineItems == undefined)
        {
           $scope.notify("There should be at least one invoice line item");
            return;
        }
        else
        {
            if($scope.tablePurchaseInvoice.tableInvoiceLineItems.length == 0)
            {
               $scope.notify("There should be at least one invoice line item");
                return;
            }
        }

        $scope.tablePurchaseInvoice.tableGrosses = $scope.tableGrosses;

        if($scope.validateInvoice($scope.tablePurchaseInvoice) == false)
        {
           $scope.notify("Some input fields are found empty, either fill or delete these fields");
            return;
        }

        if($scope.invoiceMode == 'add')
        {
            if ($scope.multipleImagesList == null || $scope.multipleImagesList == undefined) {
               $scope.notify("Add at least one image of invoice");
                return;
            }
            else {
                if ($scope.multipleImagesList.length == 0) {
                   $scope.notify("Add at least one image of invoice");
                    return;
                }
            }
        }

        if($scope.multipleImagesList != null && $scope.multipleImagesList.length > 0)
        {
            var blobbedPdf = null;
            var doc = new jsPDF();
            var dimensions = [15, 40, 180, 160];
            var count = -250;
            angular.forEach($scope.multipleImagesList, function (imageUrl) {
                console.log(imageUrl);
                count += 250;
                if (count > 0) {
                    doc.addPage();
                }
                doc.addImage(imageUrl.imgSrc, 'JPEG', dimensions[0], dimensions[1], dimensions[2], dimensions[3]);
                blobbedPdf = doc.output('blob');
            });
        }


        console.log($scope.tablePurchaseInvoice);

        var PostDataUrl = MavenAppConfig.baseUrlSource+'/omsservices/webapi/purchase/order/'+$scope.singleorderData.idtablePurchaseOrderId+'/purchaseinvoice';

        var httpMethod = '';
        if($scope.invoiceMode == 'add')
        {
            httpMethod = 'POST';
        }
        if($scope.invoiceMode == 'edit')
        {
            httpMethod = 'PUT';
            PostDataUrl = PostDataUrl + "/" + $scope.tablePurchaseInvoice.idtablePurchaseInvoice;
        }
        $http({
            method: httpMethod,
            url: PostDataUrl,
            data: $scope.tablePurchaseInvoice,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (res)
        {
            if(blobbedPdf != null)
            {
                var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchase/order/' + $scope.singleorderData.idtablePurchaseOrderId + '/purchaseinvoice/uploadinvoice?invoicenumber=' + res.tablePurchaseInvoiceNumber;

                var fd = new FormData();
                fd.append('uploadFile', blobbedPdf);
                var upload = Upload.http({
                    url: uploadUrl,
                    method: 'PUT',
                    data: fd,
                    headers: {
                        'Content-Type': undefined
                    }
                });
                upload.then(function (resp) {
                    $scope.notify("Invoice has been uploaded successfully",'success');
                    $scope.cancelPurchaseInvoice();

                }, function (resp) {
                   $scope.notify(resp.data.errorMessage);

                }, function (evt) {
                    // progress notify
                    console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :' + blobbedPdf.name);
                });
            }
            else
            {
                $scope.notify("Invoice has been uploaded successfully",'success');
                $scope.cancelPurchaseInvoice();
            }
            $scope.listOfStatesCount($scope.defaultTab);
        });

    };

    $scope.closeBulkUploadDialog = function(){

        $('#addPodialog').modal('hide');
        $cookies.put('BulkUploadData','po');
        $cookies.put('ActiveTab','po');
        $timeout(function() {
            $location.path('/bulkuploads');
            console.log('update with timeout fired')
        }, 1000);
    }

    $scope.totalQuantity = function(allSkus){
        var total = 0;
        for (var i = 0; i < allSkus.length; i++) {
            var quantity = allSkus[i].tablePurchaseOrderSkusSkuQuantity;
            total += quantity;
        }
        return total;
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
            mastersService.fetchVendorSkusNext(MavenAppConfig.baseUrlSource, $scope.singleorderData.vendorData.idtableVendorId,skuStart,size,function(data) {
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

	$scope.masterSkuDialog = function(ev, check){

        if($scope.vendorskus == false) {
            $scope.skuPaginateCheck = false;
            mastersService.fetchOnlySkus(MavenAppConfig.baseUrlSource,function (data) {
                $scope.genericData.skusListFiltered = data;
                $timeout(function () {
                    $('#dialogmastersku').modal('show');
                    $scope.skuLoadBusy = false;
                    $scope.stopSkuLoad = false;
                }, 500);
            });
        }
        else{
            if($scope.singleorderData.vendorData == null)
            {
               $scope.notify("Select vendor First")
                return;
            }
            $scope.skuPaginateCheck = true;
            mastersService.fetchVendorSkus(MavenAppConfig.baseUrlSource, $scope.singleorderData.vendorData.idtableVendorId,function(data) {
                $scope.genericData.skusListFiltered = data;
                $timeout(function() {
                    $('#dialogmastersku').modal('show');
                    $scope.skuLoadBusy = false;
                    $scope.stopSkuLoad = false;
                }, 500);
            });

            $scope.genericData.check = check;
        }
	}

	$scope.masterVendorDialog = function(ev){

		mastersService.fetchVendors(MavenAppConfig.baseUrlSource,function(data){
			$scope.genericData.vendorsListFiltered = data;
		})

        $('#dialogmastervendor').modal('show');

	}

	$scope.cancelmastersDialog = function(ev){
        skuStart=0;
        size=10;
        $scope.genericData.skusListFiltered = [];
        $scope.skuLoadBusy = true;
        $scope.stopSkuLoad = true;
        $('#dialogmastersku').modal('hide');
        $('#dialogmastervendor').modal('hide');

	}

	$scope.selectSku = function(id, ev){
        $scope.stopSkuLoad = true;
		$http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/'+id).success(function(data) {
        console.log(data);

		if($scope.genericData.check == true && !$scope.addingNewVendor){

            $scope.singleorderData.productObj = data;
            $scope.singleorderData.skuId = data.idtableSkuId;
			$scope.$broadcast("angucomplete-alt:changeInput", "products", data);
		}
        else if($scope.addingNewVendor){
                $scope.$broadcast("angucomplete-alt:changeInput", "vendorsku", data);
        }
		else{
            $scope.skuId = data.idtableSkuId;
			$scope.$broadcast("angucomplete-alt:changeInput", "productsfilter", data);

		}

        }).error(function(error, status) {
            console.log(error);

        });

		$scope.cancelmastersDialog();
	}

	$scope.selectVendor = function(id, ev){

		$scope.vendorId = id;

		 $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/vendors/'+id).success(function(data) {
         console.log(data);
		 $scope.$broadcast("angucomplete-alt:changeInput", "vendorsfilter", data);
        }).error(function(error, status) {
            console.log(error);

        });

		$scope.cancelmastersDialog(ev);
	}

    $scope.checkNumber = checkNumber;

    $scope.imageInputValue = {};
    $scope.multipleImagesList = [];
    $scope.getImageValue = function(){
        if(($scope.multipleImagesList == '' || $scope.multipleImagesList == null)&&($scope.imageInputValue.imageValue == null || $scope.imageInputValue.imageValue == undefined)){
            return;
        }else{
            var keepGoing = true;
            angular.forEach($scope.multipleImagesList, function(product){
                if(keepGoing) {
                    if(product.imgSrc == $scope.imageInputValue.imageValue){
                        keepGoing = false;
                       $scope.notify('image is already added');
                    }
                }
            });
            if(keepGoing){
                $scope.multipleImagesList.push({
                    'imgSrc':$scope.imageInputValue.imageValue
                });
            }

            console.log($scope.multipleImagesList);
        }
    };
    $scope.removeImageItem = function(index){
        $scope.multipleImagesList.splice(index,1);
        console.log($scope.multipleImagesList);
    };
    $scope.uploadFileInput = function(input){
        console.log(input);
        var UrlAttr;
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $scope.imageInputValue.imageValue = e.target.result;
            };

            //Renders Image on Page
            reader.readAsDataURL(input.files[0]);
        }
        console.log(UrlAttr);
    }


    $scope.openSkuDialog = function() {
        $scope.selectedSku = null;
        $scope.skuPaginateCheck = false;
                mastersService.fetchOnlySkus(MavenAppConfig.baseUrlSource,function (data) {
                $scope.genericData.skusListFiltered = data;
                $timeout(function () {
                    $('#dialogmastersku').modal('show');
                    $scope.skuLoadBusy = false;
                }, 500);
            });

    }
    $scope.addPricingtier = function() {
        if (!$scope.PT) {
           $scope.notify("Please enter the Minimum Quantity");

        } else {
            var min = $scope.PT.tableVendorSkuPricingTiersQtyMin;
            var max = $scope.PT.tableVendorSkuPricingTiersQtyMax;
            var price = $scope.PT.tableVendorSkuPricingTiersPrice;

            if (!min) {
               $scope.notify("Please enter the Minimum Quantity");
            } else if (min < 1) {
               $scope.notify("Minimum Quantity should be greater than 0");
            }else if (max < min) {
               $scope.notify("Maximum Quantity should be greater than the Minimum Quantity");
            } else if (!price) {
               $scope.notify("Please enter the Price");
            } else if (price < 1) {
               $scope.notify("Price should be greater than 0");
            } else {
                $scope.pricingTiers.push({
                    "tableVendorSkuPricingTiersQtyMin": min,
                    "tableVendorSkuPricingTiersQtyMax": max,
                    "tableVendorSkuPricingTiersPrice": price
                });
                $scope.notify("Pricing Tier Added",'success');
                $scope.PT = {};
            }
        }
    };
    $scope.removePricingTier = function(index) {
        $scope.pricingTiers.splice(index, 1);
    };
    $scope.openAddNewVendorDialog = function() {
        $scope.addingNewVendor = true;
        $scope.vendorData = {};
        $scope.PT = {};
        $scope.pricingTiers=[];
        $scope.selectedSku = null;
        $scope.pricingtierDetailsClicked = false;
        $('#addVendorSku').modal('show');
    };
    $scope.pricingtierDetailRow = function() {
        $scope.pricingtierDetailsClicked = !$scope.pricingtierDetailsClicked;
    }
    $scope.cancelCleanData = function(form) {
        $scope.$broadcast('angucomplete-alt:clearInput', 'vendorsku');
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        $scope.addingNewVendor = false;
        $scope.vendorData = {};
        $scope.PT = {};
        $scope.pricingTiers=[];
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#addVendorSku').modal('hide');
    };
    $scope.saveNewVendor = function(form) {                // api request for vendor sku request
        $scope.addingNewVendor = false;
        if (!$scope.selectedSku) {
           $scope.notify("Please select a Product");
        }
        else if (!$scope.selectedSku) {
           $scope.notify("Please select a Product");
        }else {
            var data = $scope.vendorData;
            data.tableSku = $scope.selectedSku;
            $scope.oqmses = [];
            // console.log($scope.selectedList);
            // for (var i = 0; i < $scope.selectedList.length; i++) {
            //     $scope.oqmses.push({
            //         'tableSkuUoqmConfig': $scope.selectedList[i].oqmData
            //     });
            // }
            data.tableVendorSkuPricingTierses = $scope.pricingTiers;
            data.tableVendorSkuUoqmses = $scope.oqmses;
            console.log(data);
            //console.log($scope.inventoryData.tableVendor.idtableVendorId);
            $http({
                method: 'POST',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/vendors/' + $scope.vendorData.tableVendor.idtableVendorId+ '/skumap',
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                console.log(res);
                if (res != null) {
                    $scope.notify("New Vendor Sku Map Added Successfully",'success');
                    $scope.vendorData = {};

                }
                $scope.cancelCleanData(form);
            }).error(function(error,status){
                $scope.vendorData = {};
                $scope.cancelCleanData(form);
                if(status == 400){
                   $scope.notify(error.errorMessage);
                }else{
                   $scope.notify("Failed to update vendor sku map");
                }
            });

        }
    }
    if ($window.localStorage.getItem("purchaseOrderFilter") !== null) {
        var purchaseOrderField = JSON.parse($window.localStorage.getItem("purchaseOrderFilter"));
        $scope.wareHouseId = purchaseOrderField.warehouse;
        $scope.channel = purchaseOrderField.channel;
        $scope.systemOrderNo = purchaseOrderField.orderId;
        $scope.saleChannelId = purchaseOrderField.saleChannel;
        $scope.startDate = purchaseOrderField.startDate;
        $scope.endDate = purchaseOrderField.endDate;
        $scope.start1Date = purchaseOrderField.start1Date;
        $scope.end1Date = purchaseOrderField.end1Date;
        $scope.selectedSku = purchaseOrderField.sku;
        $scope.selectedVendor = purchaseOrderField.vendor;
        $scope.skuId = purchaseOrderField.sku ? purchaseOrderField.sku.idtableSkuId : null;
        $scope.vendorId = purchaseOrderField.vendor ? purchaseOrderField.vendor.idtableVendorId : null;
        $scope.submitAction($scope.wareHouseId,$scope.saleChannelId,$scope.skuId,$scope.start1Date,$scope.end1Date,$scope.customerid,$scope.systemOrderNo);

    }
    $scope.$on('onNewTab', function(event, obj) {
        console.log('found');
        $scope.newTab();

    });
    $scope.$on('$destroy', function () {
        $window.localStorage.removeItem('purchaseOrderFilter');
        $window.localStorage.removeItem('inboundTab');
        $("#dialogmastersku").remove();
        $('.modal-backdrop').remove();
    });

    $scope.selectAllSkus = function(value)
    {
        if(value == 'intransit')
        {
            var skus = $scope.skusForTransit;
            if($scope.intransit.selectall)
            {
                for(var i = 0; i<skus.length; i++)
                {
                    skus[i].selected = true;
                }
            }
            else {
                for(var i = 0; i<skus.length; i++)
                {
                    skus[i].selected = false;
                }
            }
        }
        else if(value == 'cancel')
        {
            var skus = $scope.skusForCancel;
            if($scope.intransit.selectall)
            {
                for(var i = 0; i<skus.length; i++)
                {
                    skus[i].selected = true;
                }
            }
            else {
                for(var i = 0; i<skus.length; i++)
                {
                    skus[i].selected = false;
                }
            }
        }
    }

    $scope.cancelSelectAllModal = function(value)
    {
        $scope.intransit = {};
        if(value == 'intransit')
        {
            $('#intransit').modal('hide');
        }
        else if(value == 'cancel')
        {
            $('#selectskuforcancel').modal('hide');
        }
    }
}]);
