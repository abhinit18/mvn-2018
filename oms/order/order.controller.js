angular.module('OMSApp.order', ['customerbaseController' ]).config(function config($stateProvider) {
    $stateProvider.state('/order/', {
        name: '/order/',
        url: '/order/',
        views: {
            "main": {
                controller: 'orderController',
                templateUrl: 'order/order.view.html'
            },
            "header": {
                controller: 'headerCtrl',
                templateUrl: '../shared/templates/header.html'
            }
        },
        data: {pageTitle: 'Order'}
    })

}).controller('orderController',  ['$rootScope' , '$stateParams', '$controller' , '$scope' ,'$http', '$location', '$filter', 'MavenAppConfig', '$sce', '$window', 'Upload', 'pagerService', '$q', '$cookies','$timeout', 'mastersService',

function orderController($rootScope , $stateParams,  $controller, $scope, $http, $location, $filter, MavenAppConfig, $sce, $window, Upload, pagerService, $q, $cookies, $timeout,  mastersService) {

    $controller('customerbaseCtrl', { $scope: $scope });
    $scope.addDeliveryClicked = false;
    $scope.singleorderData = {};
    $scope.singleorderData.billingAddressSameAsShipping = false;
    $scope.bulkOrderSettingData = {};
    $scope.billingAddrClicked = false;
    $scope.warehouseError = {};
    $scope.notApplicableCounter = 1;
    $scope.filter = {};
    $scope.bulkUploadTabShow = true;
    $scope.disableQuickShipBox = [];
    $scope.editQuickShipBoxHideAndShow = [];
    $scope.submitActionButton = '';
    $scope.shipping = {};
    $scope.uploadedFile={};
    $scope.recordsPerPage = [5,10,15];
    $scope.start = 0;
    $scope.orderSize = $scope.recordsPerPage[0];
    if ($cookies.get('Dashdata')) {
        $scope.defaultTab = $cookies.get('Dashdata');
    }
    else {
        var currentUrl,UrlName;
        currentUrl = $scope.currentUrl;
        if($scope.currentUrl === "")
        {
            currentUrl = window.location.href;
        }
        UrlName = currentUrl.search('order');
        console.log(UrlName);
        if(UrlName == -1){
            $scope.defaultTab = "new";
        }else{
            $scope.defaultTab = "all";
        }
    }

    $scope.products = [];

    $scope.shippingDetails = '';
    $scope.Packing = '';
    $scope.tableSalesOrderSkuQuantityDetails = [];
    $scope.quickShipDataTable = [];

    $scope.orderLevelAction = {};
    $scope.array = [];
    $scope.singleOrderTab = true;
    $scope.singleOrderMode = "add";
    $scope.bulkOrderTab = false;
    $scope.incrVar = false;
    $scope.decrVar = false;
    $scope.arrayHeaderList = [];
    $scope.arrayList = [];
    $scope.myList = [];
    $scope.bulkUploadSettingMode = "add";
    $scope.bulkUploadOrderFielsClicked = false;
    $scope.bulkUploadMapElemClicked = true;
    $scope.baseSkuUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/search?search=';
    $scope.baseCustomerUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/search?search=';
    $scope.baseBulkUploadSettingsUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/bulkuploadsettings?search=';
    $scope.downloadOrderTemplateUrl = MavenAppConfig.baseUrlSource+MavenAppConfig.downloadOrderTemplateUrl;
    $scope.csvTrue = false;
    $scope.baseSchedulePickUpUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/orders/schedulepickup";
    $scope.salesChannelSelected = false;
    $scope.deliveryAddressSelected = false;
    $scope.orderNumberEntered = false;
    $scope.isProductSelected = false;
    $scope.isPriceEntered = false;
    $scope.isQuantityEntered = false;
    // $scope.singleorderData.submitted = false;

    $scope.sortType = "tableSaleOrderSystemOrderNo";
    $scope.directionType = "desc";
    $scope.sortReverse = false; // set the default sort order

    $scope.bulkSelectChannel = false;
    $scope.bulkSelectFile = false;

    $scope.otherReasonNotFiled = false;
    $scope.reasonData = null ;

    $scope.isshippingdetailsrequired = true;

    $scope.clientProfile = {};

    $scope.clearStartDate = function() {
        $scope.filter.startDate = "";
        $scope.filter.start1Date = null;
        if($scope.filter.end1Date == null) {
            $scope.startmaxDate = new Date();
        }
        else
        {
            $scope.sendEndDate($scope.filter.end1Date);
        }
        $scope.endminDate = null;
    }

    $scope.customerIsChanged = function(){
        $scope.singleorderData.productObject = {};
        $scope.singleorderData.quantityNo = null;
    }

    /*$scope.productIsChanged = function(){
        $scope.singleorderData.quantityNo = null;
    }*/

    $scope.$watch('singleorderData.productObject',function(){
        $scope.getProuctPrice();
    });
    
    $scope.getProuctPrice = function() {
        var value = $scope.singleorderData.quantityNo;
        var saleChannelId = ($scope.singleorderData.channelObject && $scope.singleorderData.channelObject.idtableSalesChannelValueInfoId)?$scope.singleorderData.channelObject.idtableSalesChannelValueInfoId:null;
        var customerId = ($scope.singleorderData.customerObj && $scope.singleorderData.customerObj.idtableCustomerId)?$scope.singleorderData.customerObj.idtableCustomerId:null;
        var skuId = ($scope.singleorderData.productObject && $scope.singleorderData.productObject.idtableSkuId)?$scope.singleorderData.productObject.idtableSkuId:null;
        var pro_quantity = $scope.singleorderData.quantityNo?$scope.singleorderData.quantityNo:null;
        var addressId = ($scope.singleorderData.deliveryAddressName && $scope.singleorderData.deliveryAddressName.idtableAddressId)?$scope.singleorderData.deliveryAddressName.idtableAddressId:null;
        if(value && saleChannelId && customerId && skuId && pro_quantity && addressId){
            // $scope.singleorderData.priceProd = 100;
            console.log($scope.singleorderData);
            
            var skuPriceUrl = MavenAppConfig.baseUrlSource+'/omsservices/webapi/orders/getpriceforsku?salesChannel='+saleChannelId+'&customerid='+customerId+'&skuid='+skuId+'&skuquantity='+pro_quantity+'&custaddressid='+addressId;
            $http.get(skuPriceUrl).success(function(response) {
                console.log(response);
                if(response.data){
                    $scope.singleorderData.priceProd = response.data;
                }else{
                    $scope.singleorderData.priceProd = null;
                    $scope.notify(response.message);
                }
            }).error(function(error,status){
                console.log(error);
                if(status == 400){
                    $scope.singleorderData.priceProd = null;
                   $scope.notify(error.message);
                }else{
                   $scope.notify("Something went wrong. Please try again!");
                }
            });
        }
    };

    $scope.clearEndDate = function() {
        $scope.filter.endDate = "";
        $scope.filter.end1Date = null;
        $scope.startmaxDate = new Date();
        $scope.endmaxDate = new Date();
        if($scope.filter.start1Date == null)
        {
            $scope.endminDate = null;
        }
        else
        {
            $scope.sendStartDate($scope.filter.start1Date);
        }
    }

    //=============================================== ends here =================================== //



    $scope.onPageInitialize = function () {
            var customerId = $stateParams.customerId;
            if (customerId != null) {
                $scope.customerid = customerId;
                $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/' + customerId).success(function (data) {
                    $scope.customerString = data.tableCustomerFirstName;
                    if (data.tableCustomerLastName && data.tableCustomerLastName != null && data.tableCustomerLastName != null) {
                        $scope.customerString += " " + data.tableCustomerLastName;
                    }
                }).error(function (error, status) {
                    console.log(error);
                    console.log(status);

                });
            }


        $scope.listOfChannels();
        $scope.listOfPayments();
        $scope.dateFormatsBulkUpload();
        $scope.regionsStatesData();
        $scope.SelectVehicleType();
        $scope.LengthMeasureUnitDropDown();
        $scope.generateHeaders();
        $scope.getClientProfile();

        if($cookies.get('orderid') != null){
            $scope.filter.orderid = $cookies.get('orderid');
            $cookies.remove('orderid')
        }

        if($rootScope.defaultTab != null)
        {
            $scope.defaultTab = $rootScope.defaultTab;
            $rootScope.defaultTab = null;

        }
        if($rootScope.saleOrderFilterObj != null)
        {
            $scope.filter = $rootScope.saleOrderFilterObj;
            $rootScope.saleOrderFilterObj = null;
        }

        $scope.listOfStatesCount($scope.defaultTab);
    }

    $scope.initDateLimits = function () {

        $scope.minDateSc = null;
        $scope.maxDateSc = new Date();

        $scope.minDateShipping = new Date();
        $scope.maxDateShipping = null;

        $scope.minDateDelivery = new Date();
        $scope.maxDateDelivery = null;

    }

    $scope.initDateLimits();



    $scope.onShippingDateChange = function () {

        //Should be greater than equal to today's date and if delivery date is available then should be less than delivery date
        $scope.minDateShipping = new Date();

        if($scope.singleorderData.tableSaleOrderLatestDeliveryDate)
        {
            $scope.deliveryDateData = new Date($scope.singleorderData.tableSaleOrderLatestDeliveryDate);
            $scope.maxDateShipping = new Date(
                $scope.deliveryDateData.getFullYear(),
                $scope.deliveryDateData.getMonth(),
                $scope.deliveryDateData.getDate());
        }

        //Delivery date should be greater than equal to shipping date

        if($scope.singleorderData.tableSaleOrderLatestShippngDate)
        {
            $scope.shippingDateData = new Date($scope.singleorderData.tableSaleOrderLatestShippngDate);
            $scope.minDateDelivery = new Date(
                $scope.shippingDateData.getFullYear(),
                $scope.shippingDateData.getMonth(),
                $scope.shippingDateData.getDate());
        }
    }

    $scope.onDeliveryDateChange = function ()
    {
        //should be greater than equal to today's date and if shipping date is there then should be greater than shipping date

        $scope.minDateDelivery = new Date();

        if($scope.singleorderData.tableSaleOrderLatestShippngDate)
        {
            $scope.shippingDateData = new Date($scope.singleorderData.tableSaleOrderLatestShippngDate);
            $scope.minDateDelivery = new Date(
                $scope.shippingDateData.getFullYear(),
                $scope.shippingDateData.getMonth(),
                $scope.shippingDateData.getDate());
        }

        if($scope.singleorderData.tableSaleOrderLatestDeliveryDate)
        {
            $scope.deliveryDateData = new Date($scope.singleorderData.tableSaleOrderLatestDeliveryDate);
            $scope.maxDateShipping = new Date(
                $scope.deliveryDateData.getFullYear(),
                $scope.deliveryDateData.getMonth(),
                $scope.deliveryDateData.getDate());
        }

    }


    $scope.uploadBulkOrderMapFile = function(bulkOrderMapFile) {
        file = bulkOrderMapFile;
        if (file) {
            if (!file.$error) {
                var reader = new FileReader();
                reader.readAsText(file);
                reader.onload = $scope.loadHandler;
                $scope.digesttimeout();
            }
        }
    };

    $scope.loadHandler = function(event) {
        $scope.contents = event.target.result;
        var data = {
            csv: null,
            separator: ','
        };
        // Get the contents of the reader
        var contents = $scope.contents;

        // Set our contents to our data model
        data.csv = contents;

        var results = data;
        results = results.csv.split("\n");
        $scope.createHeaderList(results);
    };



    $scope.ViewDownloadBtn = 'success';
    $scope.downloadLink = function(value) {
        console.log(value);
        $scope.ViewDownloadBtn = value;
    }
    $scope.disableBulkUpload = false;
    $scope.uploadBulkOrderFile = function(bulkOrderUploadfile, bulkOrderSettingData,form) {
        file = bulkOrderUploadfile;
        $scope.disableBulkUpload = true;
        $scope.uploadProgress = null;
        $scope.notify("Upload is being processed in the background",'info');
        if (!file.$error) {
            var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/saleschannels/' + bulkOrderSettingData.channelId + '/uploadbulkorders';

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
                $cookies.put('BulkUploadData','orders');
                $cookies.put('ActiveTab','orders');
              $scope.notify("File has been uploaded successfully.It may take a few minutes to reflect the changes.<br><a href='#/bulkuploads/' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View bulk upload reports.</a>",'success','','',0);
                $scope.uploadedFile={};
                file = null;
                $scope.closebulkOrderUploadCsv(form);
                $scope.disableBulkUpload = false;
            }, function(resp) {
                $scope.uploadedFile={};
                file = null;
                $scope.closebulkOrderUploadCsv(form);
               $scope.notify(resp.data.errorMessage);
                $scope.disableBulkUpload = false;
            }, function(evt) {
                $scope.uploadProgress = 'progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :' + file.name;
                console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :' + file.name);
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
        $scope.allCount = 0;
        $scope.newCount = 0;
        $scope.processCount = 0;
        $scope.holdCount = 0;
        $scope.returnCount = 0;
        $scope.cancelledCount = 0;
        $scope.shippingCount = 0;
        $scope.returnCount = 0;
        $scope.deliveredCount = 0;
        $scope.draftCount = 0;

        var countURL = MavenAppConfig.baseUrlSource + "/omsservices/webapi/orders/filtercount?";

        countURL += "&uipagename="+$scope.pagename;

        if (!$scope.filter.saleChannel)
        {
            countURL += "&salesChannel=0";
        }
        else
        {
            countURL += "&salesChannel=" + $scope.filter.saleChannel.idtableSalesChannelValueInfoId;
        }
        if ($scope.skuId)
        {
            countURL += "&skuid=" + $scope.skuId;
        }
        if ($scope.customerid) {
            countURL += "&customerid=" + $scope.customerid;
        }
        if ($scope.filter.startDate) {
            countURL += "&startDate=" + $scope.filter.startDate;
        }
        if ($scope.filter.endDate)
        {
            countURL += "&endDate=" + $scope.filter.endDate;
        }
        if ($scope.filter.orderid) {
            countURL += "&orderid=" + $scope.filter.orderid;
        }
        if ($scope.filter.refid) {
            countURL += "&refid=" + $scope.filter.refid;
        }

        var newCountUrl = countURL + "&state=new";
        var processCountUrl = countURL + "&state=process";
        var holdCountUrl = countURL + "&state=hold";
        var returnCountUrl = countURL + "&state=return";
        var cancelledCountUrl = countURL + "&state=cancelled";
        var shippingCountUrl = countURL + "&state=shipping";
        var deliveredCountUrl = countURL + "&state=delivered";
        var draftCountUrl = countURL + "&state=draft";
        var allCountUrl = countURL;
        var promises = [
            $http.get(allCountUrl),
            $http.get(newCountUrl),
            $http.get(processCountUrl),
            $http.get(holdCountUrl),
            $http.get(returnCountUrl),
            $http.get(cancelledCountUrl),
            $http.get(shippingCountUrl),
            $http.get(deliveredCountUrl),
            $http.get(draftCountUrl)
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
                    // $scope.orderSize = $scope.start + $scope.orderSize;


                    // get current page of items
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
                $scope.shippingCount = response[6].data;
                $scope.deliveredCount = response[7].data;
                $scope.draftCount = response[8].data;
                var vm = this;
                vm.pager = {};
                if (tabsValue == 'all') {
                    vm.dummyItems = _.range(0, $scope.allCount);
                }
                else if(tabsValue == 'new'){
                    vm.dummyItems = _.range(0, $scope.newCount);
                }
                else if(tabsValue == 'process'){
                    vm.dummyItems = _.range(0, $scope.processCount);
                }
                else if(tabsValue == 'hold'){
                    vm.dummyItems = _.range(0, $scope.holdCount);
                }
                else if(tabsValue == 'return'){
                    vm.dummyItems = _.range(0, $scope.returnCount);
                }
                else if(tabsValue == 'cancelled'){
                    vm.dummyItems = _.range(0, $scope.cancelledCount);
                }
                else if(tabsValue == 'shipping'){
                    vm.dummyItems = _.range(0, $scope.shippingCount);
                }
                else if(tabsValue == 'delivered'){
                    vm.dummyItems = _.range(0, $scope.deliveredCount);
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

            });




    }


    // getting all list of orders (all the orders)
    $scope.listOfOrders = function(tabsValue, start, action) {
        if (tabsValue == 'draft') {
            $scope.DeleteAndConfimData = true;
            $scope.reEdit = false;
        } else {
            $scope.DeleteAndConfimData = false;
            $scope.reEdit = true;
        }
        $scope.defaultTab = tabsValue;

        var orderListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/orders";
        if ($scope.defaultTab == 'all')
            orderListUrl += "?start=" + start + "&size="+$scope.orderSize+"&sort=" + $scope.sortType + "&direction=" + $scope.directionType;
        if ($scope.defaultTab != 'all')
            orderListUrl += "?start=" + start + "&size="+$scope.orderSize+"&sort=" + $scope.sortType + "&direction=" + $scope.directionType + "&state=" + tabsValue;
        orderListUrl += "&uipagename="+$scope.pagename;
        if (!$scope.filter.saleChannel) {
            orderListUrl += "&salesChannel=0";
        } else {
            orderListUrl += "&salesChannel=" + $scope.filter.saleChannel.idtableSalesChannelValueInfoId;
        }
        if ($scope.skuId) {
            orderListUrl += "&skuid=" + $scope.skuId;
        }
        if ($scope.customerid) {
            orderListUrl += "&customerid=" + $scope.customerid;
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
        if ($scope.filter.refid) {
            orderListUrl += "&refid=" + $scope.filter.refid;
        }
        $http.get(orderListUrl).success(function(data) {
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
            $scope.showLoader = false;
        }).error(function(error, status) {

        });
    };

    $scope.hideeditbutton = function(orderdata){
        for(var j=0; j< orderdata.tableSaleOrderSkuses.length ; j += 1){
            var ordersku = orderdata.tableSaleOrderSkuses[j];
            if(ordersku.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 1 || ordersku.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 2
                || ordersku.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 4 || ordersku.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 7
                || ordersku.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 8 || ordersku.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 9
                || ordersku.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 10 || ordersku.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 33){
                return false;
            }
        }
        return true;
    }


    $scope.listOfChannels = function() {
        $scope.channelNamesData = [];
        var channelListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/saleschannels?uipagename="+$scope.pagename;
        // console.log(channelListUrl);
        $http.get(channelListUrl).success(function(data) {
            console.log(data);
            $scope.channelLists = data;

            for (var i = 0; i < $scope.channelLists.length; i++) {
                if ($scope.channelLists[i].tableSalesChannelMetaInfo.tableSalesChannelType.idtableSalesChannelTypeId == 2 ||
                    $scope.channelLists[i].tableSalesChannelMetaInfo.tableSalesChannelType.idtableSalesChannelTypeId == 3) {
                    $scope.channelNamesData.push($scope.channelLists[i]);
                }
            }

        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };

    $scope.listOfPayments = function() {
        $scope.paymentNamesData = [];
        var paymentListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/saleorderpaymenttypes";
        // console.log(paymentListUrl);
        $http.get(paymentListUrl).success(function(data) {
            // console.log(data);
            $scope.paymentLists = data;

            for (var i = 0; i < $scope.paymentLists.length; i++) {
                $scope.paymentNamesData.push($scope.paymentLists[i]);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };
    $scope.searchSaleOrders = function(){
        $scope.submitAction();
    }
    $scope.submitAction = function()
    {
        $scope.directionType = "desc";
        $scope.sortReverse = false;
        $scope.exportFile = true;

        if ($scope.filter.start1Date != undefined) {
            $scope.filter.startDate = moment.utc($scope.filter.start1Date).format();
        }
        if ($scope.filter.end1Date != undefined) {
            $scope.filter.endDate = moment.utc($scope.filter.end1Date).format();
        }

        $scope.listOfStatesCount($scope.defaultTab, 1);
    };
    if ($window.localStorage.getItem("saleOrderFilter") !== null) {
        var saleOrderField = JSON.parse($window.localStorage.getItem("saleOrderFilter"));
        $scope.filter.orderid = saleOrderField.orderid;
        $scope.filter.refid = saleOrderField.refid;
        $scope.filter.saleChannel = saleOrderField.saleChannel;
        $scope.filter.start1Date = saleOrderField.startDate;
        $scope.filter.end1Date = saleOrderField.endDate;
        $scope.selectedSku = saleOrderField.sku;
        $scope.selectedCustomer = saleOrderField.customer;
        $scope.skuid = saleOrderField.sku ? saleOrderField.sku.idtableSkuId : null;
        $scope.customerid = saleOrderField.customer ? saleOrderField.customer.idtableCustomerId : null;
        $scope.submitAction();

    }

    //clear filter for clearing applied filters
    $scope.clearAction = function(saleChannelId, skuId, startDate, endDate, customerid,orderid) {
        $scope.sortType = "tableSaleOrderSystemOrderNo";
        $scope.directionType = "desc";
        $scope.sortReverse = false;
        $scope.filter = {};
        $scope.skuId = null;
        $scope.selectedCustomer = {};
        $scope.selectedSku = {};
        $scope.customerid = null;
        $scope.$broadcast('angucomplete-alt:clearInput', 'productsfilter');
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        $scope.$broadcast('angucomplete-alt:clearInput', 'customersfilter');
        $scope.listOfStatesCount($scope.defaultTab, 1, 'clearAction');
        $window.localStorage.removeItem('saleOrderFilter');
        $window.localStorage.removeItem('outboundTab');
    }
    $scope.newTab = function(){
        if(Object.keys($scope.filter).length || $scope.selectedSku || $scope.selectedCustomer){
            var saleOrderField = {
                sku : $scope.selectedSku,
                customer : $scope.selectedCustomer,
                orderid:$scope.filter.orderid,
                refid:$scope.filter.refid,
                saleChannel:$scope.filter.saleChannel,
                startDate:$scope.filter.start1Date,
                endDate:$scope.filter.end1Date
            }
            $window.localStorage.setItem('saleOrderFilter',JSON.stringify(saleOrderField))
        }
        $window.open($location.absUrl(), "_blank");
    }
    $scope.searchedProductForFilter = function(selected) {
        if (selected != undefined && selected != null) {
            $scope.selectedSku = selected.originalObject;
            $scope.skuId = selected.originalObject.idtableSkuId;
        }
        else{
            $scope.skuId = undefined;
        }
    };

    $scope.searchedCustomer = function(selected) {
        if (selected != null && selected != undefined) {
            $scope.selectedCustomer = selected.originalObject;
            $scope.customerid = selected.originalObject.idtableCustomerId;
        }else{
            $scope.customerid = undefined;
        }
    }

    $scope.exportOrderDataFile = function(){
        $('#exportFile').modal('show');
    };

    $scope.downloadInvoices = function(){
        var orderListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/saleinvoice/Invoices?";

        orderListUrl += "&state=" + 'shipping';

        orderListUrl += "&uipagename="+$scope.pagename;

        if (!$scope.filter.saleChannel) {
            orderListUrl += "&salesChannel=0";
        } else {
            orderListUrl += "&salesChannel=" + $scope.filter.saleChannel.idtableSalesChannelValueInfoId;
        }
        if ($scope.skuId) {
            orderListUrl += "&skuid=" + $scope.skuId;
        }
        if ($scope.customerid) {
            orderListUrl += "&customerid=" + $scope.customerid;
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
        if ($scope.filter.refid) {
            orderListUrl += "&refid=" + $scope.filter.refid;
        }





        $http({
            method: 'GET',
            url: orderListUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            responseType:'arraybuffer'

        })
            .success(function (data, status) {
                console.log(data);
                if(status == '204'){
                   $scope.notify("Invoices are not available for current filter values.");
                }else{
                    var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                    var downloadUrl = URL.createObjectURL(blob);
                    var a = document.createElement("a");
                    a.href = downloadUrl;
                    a.download = "Invoices.xls";
                    document.body.appendChild(a);
                    a.click();
                };

            }).error(function(error,status){
            if(status == 400){
               $scope.notify(data.errorMessage);
            }
            else{
               $scope.notify("Order Export request failed");
            }

        });
    }

    $scope.DownloadOrderFileExport = function()
    {
        if ($scope.filter.start1Date != undefined) {
            $scope.filter.startDate = moment.utc($scope.filter.start1Date).format();
        }
        if ($scope.filter.end1Date != undefined) {
            $scope.filter.endDate = moment.utc($scope.filter.end1Date).format();
        }

        var exportUrl = MavenAppConfig.baseUrlSource+'/omsservices/webapi/orders/export?';

        exportUrl += "&uipagename="+$scope.pagename;

        if (!$scope.filter.saleChannel) {
            exportUrl += "&salesChannel=0";
        } else {
            exportUrl += "&salesChannel=" + $scope.filter.saleChannel.idtableSalesChannelValueInfoId;
        }
        if ($scope.skuId) {
            exportUrl += "&skuid=" + $scope.skuId;
        }
        if ($scope.customerid) {
            exportUrl += "&customerid=" + $scope.customerid;
        }
        if ($scope.filter.startDate) {
            exportUrl += "&startDate=" + $scope.filter.startDate;
        }
        if ($scope.filter.endDate) {
            exportUrl += "&endDate=" + $scope.filter.endDate;
        }
        if ($scope.filter.orderid) {
            exportUrl += "&orderid=" + $scope.filter.orderid;
        }
        if ($scope.filter.refid) {
            exportUrl += "&refid=" + $scope.filter.refid;
        }
        $http.get(exportUrl).success(function(response, status) {
            console.log(response);
            $cookies.put('DownloadExportData','orders');
            console.log($cookies.get('DownloadExportData'));
            $cookies.put('ActiveTab','Orders');

            if(status == 204){
               $scope.notify("No Records Available.");
            }else{
                $scope.notify("Order Export requested successfully.<br><a href='#/export/' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View files</a>",'success');
            }

            $('#exportFile').modal('hide');
        }).error(function(error,status){
            if(status == 400){
               $scope.notify(data.errorMessage);
            }
            else{
               $scope.notify("Order Export request failed");
            }

        });
    };
    $scope.DownloadOrderItemFileExport = function()
    {

        if ($scope.filter.start1Date != undefined) {
            $scope.filter.startDate = moment.utc($scope.filter.start1Date).format();
        }
        if ($scope.filter.end1Date != undefined) {
            $scope.filter.endDate = moment.utc($scope.filter.end1Date).format();
        }

        var exportUrl = MavenAppConfig.baseUrlSource+'/omsservices/webapi/orders/orderitem/export?';

        exportUrl += "&uipagename="+$scope.pagename;

        if (!$scope.filter.saleChannel) {
            exportUrl += "&salesChannel=0";
        } else {
            exportUrl += "&salesChannel=" + $scope.filter.saleChannel.idtableSalesChannelValueInfoId;
        }
        if ($scope.skuId) {
            exportUrl += "&skuid=" + $scope.skuId;
        }
        if ($scope.customerid) {
            exportUrl += "&customerid=" + $scope.customerid;
        }
        if ($scope.filter.startDate) {
            exportUrl += "&startDate=" + $scope.filter.startDate;
        }
        if ($scope.filter.endDate) {
            exportUrl += "&endDate=" + $scope.filter.endDate;
        }
        if ($scope.filter.orderid) {
            exportUrl += "&orderid=" + $scope.filter.orderid;
        }
        if ($scope.filter.refid) {
            exportUrl += "&refid=" + $scope.filter.refid;
        }
        $http.get(exportUrl).success(function(response, status) {
            $cookies.put('DownloadExportData','orderitems');
            $cookies.put('ActiveTab','orderitems');
            if(status == 204){
               $scope.notify("No Records Available.");
            }else{
               $scope.notify("Order Export requested successfully.<br><a href='#/export/' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View files</a>",'success','','',0);
            }

            $('#exportFile').modal('hide');

        }).error(function(error,status){
            console.log(error);
            if(status == 400){
               $scope.notify(error.errorMessage);
            }else{
               $scope.notify("Order Item request failed");
            }
        });
    };

    $scope.totalQuantity = function(allSkus){
        var total = 0;
        for (var i = 0; i < allSkus.length; i++) {
            var quantity = allSkus[i].tableSaleOrderSkusSkuQuantity;
            total += quantity;
        }
        return total;
    }

    $scope.totalCostAmount = function(allSkus) {
        // console.log(allSkus);
        var totalCostAmount = 0;
        var totalCostAll = [];
        for (var i = 0; i < allSkus.length; i++) {
            totalCostAmount += allSkus[i].netGrandTotal;
            totalCostAll.push(totalCostAmount);
            total = 0;
        }
        return totalCostAmount;
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

    $scope.getAllocatedWarehouses = function (index)
    {
        var q = $q.defer();
        $scope.skuWarehouses = [];
        $scope.skuWarehousesObjs = [];

        var topPromises = [];
        $scope.orderLists[index].tableSaleOrderSkuses.forEach(function(value,key)
        {
            var subPromises = [$scope.getAllocatedWarehouse($scope.orderLists[index], value,key)];
            var p = $q.all(subPromises).then(function (res)
            {
                console.log($scope.skuWarehousesObjs);
                return res[1];
            });
            topPromises.push(p);
        });

        var finalDataPromise = $q.all(topPromises);
        return finalDataPromise;
    }

    $scope.closeTableRow = function(index){
        $scope.dayDataCollapse[index] = false;
        $scope.skuWarehouses = [];
        $scope.skuWarehousesObjs = [];
    }

    $scope.selectTableRow = function(index, storeId)
    {
        /*$scope.skuWarehouses = [];
        $scope.skuWarehousesObjs = [];

        var topPromises = [];
        $scope.orderLists[index].tableSaleOrderSkuses.forEach(function(value,key)
        {
            var subPromises = [$scope.getAllocatedWarehouse($scope.orderLists[index], value,key)]
            var p = $q.all(subPromises).then(function (res)
            {
                //return for chaining
                return res[1];
            });
            topPromises.push(p);
        });

        var finalDataPromise = $q.all(topPromises);*/

        $scope.getAllocatedWarehouses(index).then(function ()
        {
            $scope.orderLevelActionRow( $scope.orderLists[index].tableSaleOrderSkuses, $scope.orderLists[index].tableSalesChannelValueInfo,$scope.orderLists[index]);
            $scope.genericData.skuArray = $scope.orderLists[index].tableSaleOrderSkuses;
            $scope.genericData.SplitOrderButton = $scope.getSplitLabelButton($scope.orderLists[index].tableSalesChannelValueInfo);
            $scope.setOrderLevelActionRow();
        })

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

    $scope.printpackingLabel = function(value){
        console.log(value);
        $scope.previewTemp = MavenAppConfig.baseUrlSource+'/omsservices/webapi/orders/'+value.idtableSaleOrderId+'/packingslip';
        console.log($scope.previewTemp);
        $http.get($scope.previewTemp).success(function(response) {
            $scope.printPreview(response);
        }).error(function(error,status){
            console.log(error);
            if(status == 400){
               $scope.notify(error.errorMessage);
            }else{
               $scope.notify("Failed to download packing slip");
            }
        });
    };



    //====================================== ends here ============================== //


    //===================================== get packing and shipping numbers ========================== //

    $scope.orderValueID = "";
    $scope.getPackingAndShippingNumbers = function(value,screen){
        console.log(value);
        $scope.orderValueID = value.idtableSaleOrderId;
        var packingNshipping = MavenAppConfig.baseUrlSource+'/omsservices/webapi/orders/'+value.idtableSaleOrderId+'/shipmentnumbers';
        $http.get(packingNshipping).success(function(response) {
            console.log(response);
            $scope.shippingNumberList = response;
            if(screen == 'packing'){
                $('#packingNumber').modal('show');
            }else{
                $('#shippingNumber').modal('show');
            }

        }).error(function(error,status){
            console.log(error);
            if(status == 400){
               $scope.notify(error.errorMessage);
            }
            else{
               $scope.notify("Getting old shipment details failed");
            }
        });
    };

    $scope.DownloadShippingNumberLabel = function(value){
        console.log(value);
        var downloadShippingNumberLabel = MavenAppConfig.baseUrlSource+'/omsservices/webapi/orders/'+$scope.orderValueID+'/shippinglabel?shipmentno='+value.shipmentNumber;
        $http.get(downloadShippingNumberLabel).success(function(response) {
            console.log(response);
            $scope.printPreview(response);
        }).error(function(error,status){
            console.log(error);
            if(status == 400){
               $scope.notify(error.errorMessage);
            }else{
               $scope.notify("Failed to download shipping label");
            }
        });
    };

    $scope.DownloadPackingNumberLabel = function(value){
        console.log(value);
        var downloadPackingNumberLabel = MavenAppConfig.baseUrlSource+'/omsservices/webapi/orders/'+$scope.orderValueID+'/packingslip?shipmentno='+value.shipmentNumber;
        $http.get(downloadPackingNumberLabel).success(function(response) {
            console.log(response);
            $scope.printPreview(response);
        }).error(function(error,status){
            console.log(error);
            if(status == 400){
               $scope.notify(error.errorMessage);
            }else{
               $scope.notify("Failed to download packing slip");
            }
        });
    };

    $scope.cancelshippingNumberDialog = function(){
        $('#shippingNumber').modal('show');
        $('#packingNumber').modal('hide');
    };

    //=============================== Print shipping Lables ================================== //

    //== will be view after wharehouse allocated and wharehouse informed, wh_picked.. id= 8 , 9 , 11

    $scope.printshippingLabel = function(value,SkuValue){
        console.log(value);
        $scope.previewTemp = MavenAppConfig.baseUrlSource+'/omsservices/webapi/orders/'+value.idtableSaleOrderId+'/shippinglabel';
        $http.get($scope.previewTemp).success(function(response)
        {
            $scope.printPreview(response);
        }).error(function(error,status){
            console.log(error);
            if(status == 400){
               $scope.notify(error.errorMessage);
            }
            else{
               $scope.notify("Failed to download shipping label");
            }
        });
    };


    //====================================== ends here ============================== //


    //=============================== Print invoice slip Lables ================================== //

    //== will be view after packed and shipping allocated.. id= 13 , 14 , 15
    $scope.printinvoiceLabel = function(value){
        console.log(value);
        $scope.previewTemp = MavenAppConfig.baseUrlSource+'/omsservices/webapi/orders/'+value.idtableSaleOrderId+'/invoiceslip';
        $http.get($scope.previewTemp).success(function(response) {
            $scope.printPreview(response);
        }).error(function(error,status){
            console.log(error);
            if(status == 400){
                $scope.invoiceError = error.errorMessage;
                $('#InvoiceErrorModal').modal('show');
            }
            else{
               $scope.notify("Failed to download invoice");
            }
        });
    };

    $scope.validateForInvoiceAndQuickShip = function(value){

        var defered = $q.defer();

        console.log(value);
        $scope.previewTemp = MavenAppConfig.baseUrlSource+'/omsservices/webapi/orders/'+value.idtableSaleOrderId+'/validateforinvoiceandquickship';
        $http.get($scope.previewTemp).success(function(response) {
            //$scope.printPreview(response);
            defered.resolve();
        }).error(function(error,status){
            console.log(error);
            if(status == 400){
                defered.reject(error.errorMessage);
            }
            else{
                defered.reject("Failed to download invoice");
               $scope.notify("Failed to download invoice");
            }
        });

        return defered.promise;
    };


    //====================================== ends here ============================== //



    //=============================== Print manifest Lables ================================== //

    //== will be view after packed and shipping allocated.. id= 13 , 14 , 15

    $scope.printmanifestLabel = function(value){
        console.log(value);
        $scope.previewTemp = MavenAppConfig.baseUrlSource+'/omsservices/webapi/orders/'+value.idtableSaleOrderId+'/skus/'+value.tableSaleOrderSkuses[0].idtableSaleOrderSkusId+'/manifestslip';
        $http.get($scope.previewTemp
            ,{responseType: 'arraybuffer'}).success(function(response) {
            $('#printLabels').modal('show');
            var file = new Blob([(response)], {
                type: 'application/pdf'
            });
            var fileURL = URL.createObjectURL(file);
            $scope.content = $sce.trustAsResourceUrl(fileURL);
        }).error(function(error,status){
            console.log(error);
            if(status == 400){
               $scope.notify(error.errorMessage);
            }
            else{
               $scope.notify("Failed to download manifest file");
            }
        });

    };


    //====================================== ends here ============================== //



    $scope.addDeliveryAddressMode = function() {
        $scope.addDeliveryClicked = true;
    };

    $scope.chooseDeliveryAddressMode = function() {
        $scope.addDeliveryClicked = false;
    };

    $scope.customerObj = function(selected) {
        var q = $q.defer();
        if (selected != null)
        {
            $scope.isCustomerSelected = false;
            $scope.singleorderData.customerObj = selected.originalObject;

            $scope.deliveryAddresses(selected.originalObject.idtableCustomerId).then(
                function(v)
                {
                    $scope.billingAddresses(selected.originalObject.idtableCustomerId);
                    q.resolve(true);
                },
                function(err) {
                    q.reject(false);
                }
            );
        }
        else
        {
            $scope.isCustomerSelected = true;
        }
        return q.promise;
    }


    $scope.productObject = function(selected)
    {
        if (selected != null) {
            console.log(selected);
            $scope.isProductSelected = false;
            $scope.singleorderData.productObject = selected.originalObject;
            if ($scope.filter.saleChannel != undefined) {
                $scope.getPriceOfProduct(selected.originalObject.idtableSkuId, $scope.filter.saleChannel.idtableSalesChannelValueInfoId);
            }
        } else {
            $scope.isProductSelected = true;
        }
    }

    $scope.customerChanged = function(str) {
        $scope.singleorderData.deliveryAddressName = null;
        $scope.singleorderData.billingAddress = null;
        $scope.singleorderData.productObject = null;
        $scope.singleorderData.quantityNo = null;
        console.log(str);
        if (str == '') {
            $scope.custName = null;
            $scope.deliveryAddressArray = null;
        }
    }


    $scope.showAddOrderModal = function(ev) {

        $scope.singleOrderTab = true;
        $scope.bulkOrderTab = false;
        $scope.singleorderData = {};
        $scope.singleorderData.channelObject = $scope.channelNamesData[0];
        $scope.singleorderData.paymentObject = $scope.paymentNamesData[0];
        $scope.singleorderData.billingAddressSameAsShipping = false;
        $scope.bulkUploadTabShow = true;
        $scope.salesChannelSelected = false;
        $scope.deliveryAddressSelected = false;
        $scope.orderNumberEntered = false;
        $scope.disableOrderButton = false;
        $scope.initDateLimits();

        $('#addOrderDialog').on('show.bs.modal' , function (e){
            $( "#ordertabs a:first"  ).tab('show');
        });


        $('#addOrderDialog').modal('show');

    };

    $scope.toggleDeliveryAddressSubmittedValue = function() {
        /*if($scope.singleorderData.deliveryAddressName && $scope.singleorderDataCopy.deliveryAddressName && $scope.singleorderData.deliveryAddressName.idtableAddressId != $scope.singleorderDataCopy.deliveryAddressName.idtableAddressId){
            $scope.singleorderData.tableSaleOrderMinorUpdate = true;
        }*/
        $scope.singleorderData.tableSaleOrderMajorUpdate = true;
        if ($scope.singleorderData.deliveryAddressName) {
            $scope.deliveryAddressSelected = false;
        } else {
            $scope.deliveryAddressSelected = true;
        }
    };

    $scope.toggleBillingAddressSubmittedValue = function() {
        if($scope.billingAddressCopy && $scope.singleorderData.billingAddress && $scope.billingAddressCopy.idtableAddressId != $scope.singleorderData.billingAddress.idtableAddressId){
            $scope.singleorderData.tableSaleOrderMajorUpdate = true;
        }
        // $scope.singleorderData.tableSaleOrderMajorUpdate = true;
        if ($scope.singleorderData.billingAddress) {
            $scope.billingAddressSelected = false;
        } else {
            $scope.billingAddressSelected = true;
        }
        if(JSON.stringify($scope.singleorderData.deliveryAddressName) == JSON.stringify($scope.singleorderData.billingAddress)){
            $scope.singleorderData.billingAddressSameAsShipping = true;
        }
        else{
            $scope.singleorderData.billingAddressSameAsShipping = false;
        }
    };

    $scope.togglePaymentTypeSubmittedValue = function(paymentType) {
        /*if($scope.singleorderData.paymentObject && $scope.singleorderDataCopy.paymentObject &&$scope.singleorderData.paymentObject != $scope.singleorderDataCopy.paymentObject){
            $scope.singleorderData.tableSaleOrderMinorUpdate = true;
        }*/
        $scope.singleorderData.tableSaleOrderMinorUpdate = true;
        if (paymentType) {
            $scope.paymentTypeSelected = false;
        } else {
            $scope.paymentTypeSelected = true;
        }
    };
    $scope.setFormButtonValue =  function (value) {
        $scope.submitActionButton = value;
    }
    $scope.submitAddOrderForm =  function (form)
    {
        $scope.disableOrderButton = true;
        if(($scope.singleOrderMode == 'add' || $scope.singleOrderMode == 'copy') && $scope.OrderMode == '' && $scope.submitActionButton == 'singleOrder'){
            $scope.saveSingleOrder(form);
        }
        else if($scope.singleOrderMode == 'edit' && $scope.OrderMode != 'EditDraft'  && $scope.submitActionButton == 'updateOrder'){
            $scope.updateSingleOrder(form);
        }
        else if($scope.singleOrderMode != 'edit' && $scope.bulkOrderTab !=true  && $scope.submitActionButton == 'saveDraft'){
            $scope.Drafted($scope.OrderMode,form);
        }
        else if($scope.OrderMode == 'EditDraft'  && $scope.submitActionButton == 'sendDraft'){
            $scope.SendDraft(form);
        }
        else{

        }

    }

    $scope.saveSingleOrder = function(form) {
        if($scope.singleorderData.billingAddressSameAsShipping == true){
            $scope.singleorderData.billingAddress = $scope.singleorderData.deliveryAddressName;
        }
        var shipmentDate = null;
        var deliveryDate = null;
        if($scope.singleorderData.tableSaleOrderLatestShippngDate != null && $scope.singleorderData.tableSaleOrderLatestShippngDate != undefined)
        {
            shipmentDate = moment.utc($scope.singleorderData.tableSaleOrderLatestShippngDate).format();
        }
        if($scope.singleorderData.tableSaleOrderLatestDeliveryDate != null && $scope.singleorderData.tableSaleOrderLatestDeliveryDate != undefined){
            deliveryDate = moment.utc($scope.singleorderData.tableSaleOrderLatestDeliveryDate).format();
        }

        var postData = {
            "idtableSaleOrderId": 1,
            "tableSaleOrderClientOrderNo": $scope.singleorderData.orderNo,
            "tableSalesChannelValueInfo": $scope.singleorderData.channelObject,
            "tableAddressByTableSaleOrderShipToAddressId": $scope.singleorderData.deliveryAddressName,
            "tableAddressByTableSaleOrderBillToAddressId" : $scope.singleorderData.billingAddress,
            "tableCustomer": $scope.singleorderData.customerObj,
            "tableSaleOrderPaymentType": $scope.singleorderData.paymentObject,
            "tableSaleOrderSkuses": $scope.products,
            "tableSaleOrderRemarks":$scope.singleorderData.tableSaleOrderRemarks,
            "tableSaleOrderScDateTime": moment.utc($scope.singleorderData.tableSaleOrderScDateTime).format(),
            "tableSaleOrderLatestDeliveryDate":deliveryDate,
            "tableSaleOrderLatestShippngDate": shipmentDate
        }
        console.log(postData);
        $http({
            method: 'POST',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders',
            data: postData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {

            console.log(res);
            if (res) {
                $scope.singleOrderMsg = 'Submitted successfully';
                $scope.orderNo = '';
                $scope.product = '';
                $scope.deliveryAddress = '';
                $scope.customer = '';
                $scope.popupChannel = '';
                $scope.payment = '';
                $scope.singleorderData = {};
                postData = null;
                $scope.products = [];
                // $scope.listOfOrders($scope.defaultTab, 0);
                $scope.cancelSingleOrder(form);
                $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                if ($scope.singleOrderMode == "add") {
                    $scope.notify("Order Added Successfully",'success');
                } else if ($scope.singleOrderMode == "copy") {
                    $scope.notify("Order Copied Successfully",'success');
                }

            }
        }).error(function(error, status)
        {
            $scope.disableOrderButton = false;
            if(status == 400){
               $scope.notify(error.errorMessage);
            }
            else{
               $scope.notify("Order cannot be added");
            }
        });
    };

    $scope.updateSingleOrder = function(form)
    {
        $scope.addOrderForm = form;
        if(!$scope.singleorderData.tableSaleOrderMajorUpdate){
            $scope.updateSingleOrderConfirmed();
        }else{
            $('#confirmEditOrder').modal('show');
        }
        
    };

    $scope.updateSingleOrderConfirmed = function() {
        if($scope.singleorderData.billingAddressSameAsShipping == true){
            $scope.singleorderData.billingAddress = $scope.singleorderData.deliveryAddressName;
        }
        var shipmentDate = null;
        var deliveryDate = null;
        if($scope.singleorderData.tableSaleOrderLatestShippngDate != null && $scope.singleorderData.tableSaleOrderLatestShippngDate != undefined){
            shipmentDate = moment.utc($scope.singleorderData.tableSaleOrderLatestShippngDate).format();
        }
        if($scope.singleorderData.tableSaleOrderLatestDeliveryDate != null && $scope.singleorderData.tableSaleOrderLatestDeliveryDate != undefined){
            deliveryDate = moment.utc($scope.singleorderData.tableSaleOrderLatestDeliveryDate).format();
        }
        var postData = {
            "idtableSaleOrderId": $scope.updateOrderId,
            "tableSaleOrderClientOrderNo": $scope.singleorderData.orderNo,
            "tableSalesChannelValueInfo": $scope.singleorderData.channelObject,
            "tableAddressByTableSaleOrderShipToAddressId": $scope.singleorderData.deliveryAddressName,
            "tableAddressByTableSaleOrderBillToAddressId" : $scope.singleorderData.billingAddress,
            "tableCustomer": $scope.singleorderData.customerObj,
            "tableSaleOrderPaymentType": $scope.singleorderData.paymentObject,
            "tableSaleOrderSkuses": $scope.products,
            "tableSaleOrderRemarks":$scope.singleorderData.tableSaleOrderRemarks,
            "tableSaleOrderScDateTime":moment.utc($scope.singleorderData.tableSaleOrderScDateTime).format(),
            "tableSaleOrderLatestDeliveryDate":deliveryDate,
            "tableSaleOrderLatestShippngDate": shipmentDate,
            "tableSaleOrderMajorUpdate": $scope.singleorderData.tableSaleOrderMajorUpdate,
            "tableSaleOrderMinorUpdate": $scope.singleorderData.tableSaleOrderMinorUpdate
        }
        if($scope.singleorderData.tableSaleOrderRemarks){
            postData.tableSaleOrderMinorUpdate = true;
        }
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
                $scope.singleOrderMsg = 'Submitted successfully';
                $scope.orderNo = '';
                $scope.product = '';
                $scope.deliveryAddress = '';
                $scope.customer = '';
                $scope.popupChannel = '';
                $scope.payment = '';
                $scope.singleorderData = null;
                postData = null;
                $scope.products = [];
                // $scope.listOfOrders($scope.defaultTab, 0);
                $scope.cancelSingleOrder($scope.addOrderForm);
                $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                $scope.notify("Order Updated Successfully",'success');            }
        }).error(function(error, status)
        {
            $scope.disableOrderButton = false;
            if(status == 400){
               $scope.notify(error.errorMessage);
            }
            else{
               $scope.notify("Order Cant be Added");
            }

        });
    };

    //cancel single order
    $scope.cancelSingleOrder = function(form) {
        $scope.$broadcast("angucomplete-alt:clearInput", "customers");
        $scope.$broadcast("angucomplete-alt:clearInput", "products");
        $scope.disableQuickShipBox = [];
        $scope.editQuickShipBoxHideAndShow = [];
        $scope.singleorderData = {};
        $scope.OrderMode = "";
        $scope.products = [];
        $scope.custName = null;
        $scope.salesChannelSelected = false;
        $scope.deliveryAddressSelected = false;
        $scope.billingAddressSelected = false;
        $scope.orderNumberEntered = false;
        $scope.isProductSelected = false;
        $scope.isCustomerSelected = false;
        $scope.isPriceEntered = false;
        $scope.isQuantityEntered = false;
        $scope.singleOrderMode = "add";
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#addOrderDialog').modal('hide');
        $('#confirmEditOrder').modal('hide');
        $scope.disableOrderButton = false;
    };


    $scope.createHeaderList = function(headers) {
        console.log(headers);
        $scope.notApplicableCounter = 1;
        $scope.arrayHeaderList = headers[0].split(',');
        var extras = $scope.arrayList.length - $scope.arrayHeaderList.length;
        for(var i=0;i<extras;i++){
            $scope.arrayHeaderList.push('Not Applicable' + (i+1));
        }
        $scope.notApplicableCounter = i+1;
        $scope.list1 = $scope.arrayHeaderList;

        // angular.forEach(a, function(value, key) {
        //     console.log(key);
        //     $scope.arrayHeaderList.push(key);
        //     $scope.list1 = $scope.arrayHeaderList;
        // });
        //
        // if($scope.arrayHeaderList.length < $scope.arrayList.length )
        // {
        //     var extra = $scope.arrayList.length - $scope.arrayHeaderList.length;
        //
        //     for(var counter = 1; counter <= extra;counter++ ) {
        //         $scope.arrayHeaderList.push('Not Applicable' + counter);
        //         $scope.list1 = $scope.arrayHeaderList;
        //     }
        //     $scope.notApplicableCounter = counter;
        // }
    }

    $scope.generateHeaders = function() {
        $scope.arrayList = [];
        var omsColUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/bulkuploadomscol';

        $http.get(omsColUrl).success(function(data) {
            console.log(data);
            for (var i = 0; i < data.length; i++) {
                $scope.arrayList.push(data[i].tableSalesChannelBulkUploadOmsColString);
            }
            $scope.defaultArrayList = angular.copy($scope.arrayList);
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    $scope.getClientProfile = function() {
        var clientProfileUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/clientprofiles";
        $http.get(clientProfileUrl).success(function(data)
        {
            if(data.length > 0)
            {
                $scope.clientInvoice = data[0].tableClientProfileEnableInvoice;
                $scope.clientProfile = data[0];
                $scope.clients_Profile = angular.copy(data[0]);
            }
            else{
                $scope.clientInvoice = false;
            }
        }).error(function(error, status) {
            $scope.clientInvoice = false;
            if(status == 400){
               $scope.notify(error.errorMessage);
            }
            else{
               $scope.notify("Failed to load client profile");
            }
        });
    }
    $scope.changeIndex = function(index) {
        console.log(index);
    }

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
            var trials = saleordskus[i].tableSaleOrderSkuStateTrails;
            $scope.trialsLength.push(trials.length);
            console.log(trials);
            console.log($scope.trialsLength);
            if (trials.length < 4) {
                for (var j = 0; j < trials.length; j++) {
                    $scope.trialsDataArray.push(trials[j].tableSaleOrderSkuStateType.tableSaleOrderSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId);
                }
            }

            if (trials.length == 4) {
                for (var j = 0; j < trials.length; j++) {
                    console.log(trials[j].tableSaleOrderSkuStateType.tableSaleOrderSkuStateTypeString);
                    $scope.trialsDataArray.push(trials[j].tableSaleOrderSkuStateType.tableSaleOrderSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId);
                }
            }

            if (trials.length > 4) {
                console.log(trials.length - 4);
                var totalLength = trials.length - 4;
                for (var j = totalLength; j < trials.length; j++) {
                    console.log(trials[j].tableSaleOrderSkuStateType.tableSaleOrderSkuStateTypeString);
                    $scope.trialsDataArray.push(trials[j].tableSaleOrderSkuStateType.tableSaleOrderSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId);
                }
            }


            $scope.fullTrialsArray.push($scope.trialsDataArray);
            $scope.fullIdArray.push($scope.trialIdArray);

            $scope.trialsDataArray = [];
            $scope.trialIdArray = [];

            console.log($scope.fullTrialsArray);
        }
    };

    $scope.priceEntered = function(price) {
        if (price) {
            $scope.isPriceEntered = false;
        } else {
            $scope.isPriceEntered = true;
        }

        var str = price.toString().replace(',', "").split('.');
        if (str[0].length >= 5) {
            str[0] = str[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        }
        if (str[1] && str[1].length >= 5) {
            str[1] = str[1].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ');
        }

        $scope.singleorderData.priceProd = str.join('.');
    };





    //=======================================================================================//
    //======================================   Draft Order      ========================================//
    //=======================================================================================//

    //================== DeleteDraft order ==================== //

    $scope.getAllocatedWarehouse = function (order, sku,key)
    {
        var q = $q.defer();
        var orderId = order.idtableSaleOrderId;
        var skuId = sku.idtableSaleOrderSkusId;

        var url = MavenAppConfig.baseUrlSource + "/omsservices/webapi/orders/" + orderId + "/skus/" + skuId;

        var allocatedwarehouse = "Not Available";

        $http({
            method: 'GET',
            url: url
        }).success(function (res)
        {
            if (res)
            {
                allocatedwarehouse = res.tableWarehouseDetailsLongname;
                $scope.skuWarehousesObjs[key] = res;
                $scope.skuWarehouses[key] = allocatedwarehouse;
                q.resolve(true);
            }
            else
            {
                $scope.skuWarehousesObjs[key] = "Not Available";
                $scope.skuWarehouses[key] = "Not Available";
                q.resolve(false);
            }
        }).error(function (error, status) {
            allocatedwarehouse = "Not Available";
            q.resolve(false);
        });

        return q.promise;

        //return allocatedwarehouse;
    }

    $scope.Drafted = function (value,form) {

        var shipmentDate = null;
        var deliveryDate = null;
        if ($scope.singleorderData.tableSaleOrderLatestShippngDate != null && $scope.singleorderData.tableSaleOrderLatestShippngDate != undefined) {
            shipmentDate = moment.utc($scope.singleorderData.tableSaleOrderLatestShippngDate).format();
        }
        if ($scope.singleorderData.tableSaleOrderLatestDeliveryDate != null && $scope.singleorderData.tableSaleOrderLatestDeliveryDate != undefined)
        {
            deliveryDate = moment.utc($scope.singleorderData.tableSaleOrderLatestDeliveryDate).format();
        }
        var OrderPost = {
            "idtableSaleOrderId": 1,
            "tableSaleOrderClientOrderNo": $scope.singleorderData.orderNo,
            "tableSalesChannelValueInfo": $scope.singleorderData.channelObject,
            "tableAddressByTableSaleOrderShipToAddressId": $scope.singleorderData.deliveryAddressName,
            "tableAddressByTableSaleOrderBillToAddressId" : $scope.singleorderData.billingAddress,
            "tableCustomer": $scope.singleorderData.customerObj,
            "tableSaleOrderPaymentType": $scope.singleorderData.paymentObject,
            "tableSaleOrderSkuses": $scope.products,
            "tableSaleOrderRemarks": $scope.singleorderData.tableSaleOrderRemarks,
            "tableSaleOrderScDateTime": moment.utc($scope.singleorderData.tableSaleOrderScDateTime).format(),
            "tableSaleOrderLatestDeliveryDate": deliveryDate,
            "tableSaleOrderLatestShippngDate": shipmentDate
        };
        var PostDataUrl,requestMethod;
        if (value == 'EditDraft')
        {
            PostDataUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/' + $scope.DraftOrderID.OrderedId + '/editdraft';
            requestMethod = 'PUT';

        }
        else
        {
            PostDataUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/draft';
            requestMethod = 'POST';
        }
        $http({
            method: requestMethod,
            url: PostDataUrl,
            data: OrderPost,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (res) {
            console.log(res);
            if (res) {
                $scope.cancelSingleOrder(form);
                OrderPost = null;
                $scope.listOfStatesCount($scope.defaultTab);
                $scope.notify("Draft updated successfully",'success');
                $('#addOrderDialog').modal('hide');
            }
        }).error(function (error, status)
        {
            $scope.disableOrderButton = false;
            if (status == 400) {
                $scope.showBackEndStatusMessage(error);
                return;
            }
            else{
               $scope.notify("Failed to edit draft");
            }

        });
    };

    $scope.showBackEndStatusMessage = function(errorMessage){ // Show Backend Error Messages.....
       $scope.notify(errorMessage.errorMessage);
    }




    $scope.SendDraft = function(form){
        var shipmentDate = null;
        var deliveryDate = null;
        if ($scope.singleorderData.tableSaleOrderLatestShippngDate != null && $scope.singleorderData.tableSaleOrderLatestShippngDate != undefined) {
            shipmentDate = moment.utc($scope.singleorderData.tableSaleOrderLatestShippngDate).format();
        }
        if ($scope.singleorderData.tableSaleOrderLatestDeliveryDate != null && $scope.singleorderData.tableSaleOrderLatestDeliveryDate != undefined) {
            deliveryDate = moment.utc($scope.singleorderData.tableSaleOrderLatestDeliveryDate).format();
        }
        var OrderPost = {
            "idtableSaleOrderId": 1,
            "tableSaleOrderClientOrderNo": $scope.singleorderData.orderNo,
            "tableSalesChannelValueInfo": $scope.singleorderData.channelObject,
            "tableAddressByTableSaleOrderShipToAddressId": $scope.singleorderData.deliveryAddressName,
            "tableAddressByTableSaleOrderBillToAddressId" : $scope.singleorderData.billingAddress,
            "tableCustomer": $scope.singleorderData.customerObj,
            "tableSaleOrderPaymentType": $scope.singleorderData.paymentObject,
            "tableSaleOrderSkuses": $scope.products,
            "tableSaleOrderRemarks": $scope.singleorderData.tableSaleOrderRemarks,
            "tableSaleOrderScDateTime": moment.utc($scope.singleorderData.tableSaleOrderScDateTime).format(),
            "tableSaleOrderLatestDeliveryDate": deliveryDate,
            "tableSaleOrderLatestShippngDate": shipmentDate
        };

        console.log(OrderPost);
        var PostDataUrl;
        PostDataUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/'+$scope.DraftOrderID.OrderedId+'/confirmdraft';

        $http({
            method: 'POST',
            url: PostDataUrl,
            data: OrderPost,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (res) {
            console.log(res);
            if (res) {
                $scope.cancelSingleOrder(form);
                OrderPost = null;
                $scope.listOfStatesCount($scope.defaultTab);
                $scope.notify("Order Added Successfully",'success');

                $('#addOrderDialog').modal('hide');
                console.log($scope.products);
            }
        }).error(function (error, status)
        {
            $scope.disableOrderButton = false;
            if (status == 400) {
                $scope.showBackEndStatusMessage(error);
                return;
            }
           $scope.notify("Order Cant be Added");
        });
    }

    $scope.openDeleteDraftDialog = function (deletedDraft) {
        $scope.deletedDraft = deletedDraft;
        $('#masterDeleteDialogue').modal('show');
    }
    $scope.DeleteDraft = function(data){  //..... Deleting Drafted Order
        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/' + data.idtableSaleOrderId + '/deletedraft'
        }).success(function (data) {
            $scope.deletedDraft = null;
            $scope.notify('Draft Order deleted successfully.','success');
            $scope.listOfStatesCount($scope.defaultTab);
        }).error(function (data) {
            $scope.deletedDraft = null;
            console.log(data);
        });
    };




    //=======================================================================================//
    //======================================   Ends Here    ========================================//
    //=======================================================================================//


    // adding the product in table one by one
    $scope.addProduct = function( tableSaleOrderSkusSkuQuantity, id, price) {

        if($scope.singleorderData.productObject) {
            if ($scope.singleorderData.productObject.tableSkuStatusType.idtableSkuStatusTypeId == 2 ||$scope.singleorderData.productObject.tableSkuStatusType.idtableSkuStatusTypeId == 3)
            {
               $scope.notify("Selected product is either inactive or in deleted state!");
                $scope.isProductSelected = true;
                $scope.singleorderData.productObject = null;
                $scope.$broadcast('angucomplete-alt:clearInput', 'products');
                return;
            }
        }
        if (!$scope.singleorderData.productObject) {
           $scope.notify("Please select a Product first!");
            $scope.isProductSelected = true;
            return;
        } else if (!price) {
           $scope.notify("Please enter the Product's Price!");
            $scope.isPriceEntered = true;
            return;
        } else if (price < 1) {
           $scope.notify("Please enter a valid Product's Price!");
            $scope.isPriceEntered = true;
            return;
        } else if (!tableSaleOrderSkusSkuQuantity) {
           $scope.notify("Please enter the Product's Quantity!");
            $scope.isQuantityEntered = true;
            return;
        } else if (tableSaleOrderSkusSkuQuantity < 1) {
           $scope.notify("Please enter a valid Product's Quantity!");
            $scope.isQuantityEntered = true;
            return;
        } else {
            console.log(tableSaleOrderSkusSkuQuantity);
            tableSku = $scope.singleorderData.productObject;

            var tempObject = {
                tableSku: $scope.singleorderData.productObject,
                tableSaleOrderSkusSkuQuantity: tableSaleOrderSkusSkuQuantity,
                tableSaleOrderSkusCharges: {
                    "tableSaleOrderSkusChargesItemPrice": price
                }
            };

            var dirty = false;

            for (var i = 0; i < $scope.products.length; i++) {
                if ($scope.products[i].tableSku.idtableSkuId == tableSku.idtableSkuId) {
                    dirty = true;
                }
            }


            if (dirty) {
               $scope.notify("The selected SKU is already part of the current order. Delete the existing item first to add updated quantity.");
                $scope.isProductSelected = true;
                return;
            } else {
                $scope.singleorderData.tableSaleOrderMajorUpdate = true;
                $scope.products.push(tempObject);
                console.log($scope.products);
                $scope.$broadcast('angucomplete-alt:clearInput', 'products');
                tableSku = null;
                tableSaleOrderSkusSkuQuantity = null;
                $scope.singleorderData.productObj = null;
                $scope.singleorderData.quantityNo = null;
                $scope.singleorderData.priceProd = null;
                $scope.isProductSelected = false;
                $scope.isPriceEntered = false;
                $scope.isQuantityEntered = false;
                $scope.singleorderData.productObject = undefined;
            }
        }
    };

    $scope.majorUpgrade = function(){
        $scope.singleorderData.tableSaleOrderMajorUpdate = true;
    }

    //remove the product
    $scope.removeProduct = function(index) {
        $scope.singleorderData.tableSaleOrderMajorUpdate = true;
        $scope.genericData.deleteItemIndex = index;
        $('#masterDeleteDialogue').modal('show');
    };
    $scope.deleteSelectedItem = function(){
        if($scope.deletedDraft){
            $scope.DeleteDraft($scope.deletedDraft);
            $scope.cancelmasterDeleteDialog();
        }
        else{
            $scope.products.splice($scope.genericData.deleteItemIndex, 1);
            $scope.cancelmasterDeleteDialog();
            $scope.notify('Item deleted successfully.','success');
        }
    };
    $scope.cancelmasterDeleteDialog = function(){
        $scope.deletedDraft = null;
        $('#masterDeleteDialogue').modal('hide');
    };
    //load the warehouses from backenf for select warehouse in timeline feature.
    $scope.loadWareHouses = function(orderId, tableSaleOrderId) {
        var q = $q.defer();
        console.log(orderId);
        console.log(tableSaleOrderId);
        var wareHousesUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/' + orderId + '/orderskus/' + tableSaleOrderId + '/warehouses';
        $http.get(wareHousesUrl).success(function(data)
        {
            $scope.wareHousesArray = [];
            for (var i = 0; i < data.length; i++) {
                $scope.wareHousesArray.push(data[i]);
                console.log($scope.wareHousesArray);
                q.resolve(true);
            }
        }).error(function(error, status) {
            q.resolve(false);
            console.log(error);
            $scope.warehouseError = error;
            $('#helpWRModal').modal('show');
            console.log(status);

        });
        return q.promise;
    }

    $scope.clearHelpDialog = function(){
        $('#helpWRModal').modal('hide');
    }

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
    }

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

    $scope.redirectToFileUploadUrl = function() {
        $window.open('https://sellercentral.amazon.in/gp/transactions/uploadSchedulePickup.html', '_blank');
    };
    // $scope.redirectToFileUploadUrl();

    $scope.loadCancelReasons = function() {
        var cancelReasonsUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/saleordercancelreasons';
        $http.get(cancelReasonsUrl).success(function(data) {
            console.log(data);
            $scope.cancelReasonArray = data;
            console.log($scope.cancelReasonArray);
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

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
        console.log(orderId);
        console.log(tableSaleOrderId);
        console.log(wareHouseObject);
        if (wareHouseObject == undefined) {
           $scope.notify("Warehouse Cannot Be Allocated");
            return;
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
                console.log(error);
                console.log(status);
                if(status == 400){
                   $scope.notify(error.errorMessage);
                }
                else{
                   $scope.notify("Warehouse Cannot Be Allocated");
                }
            });
            $('#dialog1').modal('hide');
        }
    }

    //action after selecting shipping carrier in the timeline feature(active state)
    $scope.selectShippingCarrierAction = function(orderId, tableSaleOrderId, shippingObject) {
        console.log(orderId);
        console.log(tableSaleOrderId);
        console.log(shippingObject);
        if (shippingObject == undefined) {
           $scope.notify("Shipping Carrier cannot be allocated");
            return;
        }
        if (shippingObject != undefined) {
            var shippingAllocateUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/' + orderId + '/shipping/' + tableSaleOrderId;
            $http.put(shippingAllocateUrl, shippingObject).success(function(data) {
                console.log(data);
                if (data) {
                    $scope.notify("Shipping Carrier Allocated Successfully",'success');
                    // $scope.listOfOrders($scope.defaultTab, 0);
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
                }
                else{
                   $scope.notify("Shipping Carrier cannot be allocated");
                }
            });
            $('#dialog2').modal('hide');
        }
    }

    $scope.LoadNewRason = {};

    //action after cancel warehouse in the timeline feature(active state)
    $scope.selectCancelAction = function(orderId, tableSaleOrderId, remarks,otherReasonRemarks) {
        if (!remarks)
        {
           $scope.notify("Please select a reason for cancellation");
            return;
        }
        else
        {
            console.log(orderId);
            console.log(tableSaleOrderId);
            console.log(remarks);
            console.log(otherReasonRemarks)
            if (remarks != undefined && remarks=='other') {
                if(!otherReasonRemarks)
                {
                    $scope.otherReasonNotFiled = true;
                   $scope.notify("Please enter the reason!")
                    return;
                }
                else if(otherReasonRemarks.length>128)
                {
                    $scope.otherReasonNotFiled = true;
                   $scope.notify("Entered Reason should be less than or equal to 128 characters.")
                    return;
                }
                else
                {
                    if(remarks == 'other'){
                        //var UserRemarks = otherReasonRemarks;
                        if($scope.LoadNewRason.ReasonCheckBox == true){
                            console.log($scope.LoadNewRason.reasonData);
                            var postDataReason;
                            postDataReason = {
                                "tableSaleOrderCancelReasonString": $scope.LoadNewRason.reasonData
                            };
                            $http({
                                method: 'POST',
                                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/saleordercancelreasons',
                                data: postDataReason,
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }).success(function(data)
                            {
                                console.log(data);
                                $scope.loadCancelReasons();
                                $scope.notify('Cancel reason added successfully','success');
                            }).error(function(data){
                                console.log(data);
                            });
                        }
                    }
                    var cancelUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/' + orderId + '/orderskus/' + tableSaleOrderId + '/cancel/?remarks=' + otherReasonRemarks;
                    var putdata = '';
                    $http.put(cancelUrl,putdata).success(function(data) {
                        console.log(data);
                        $('#cancelOrder').modal('hide');
                        if (data) {
                            $scope.notify("Order Cancelled Successfully",'success');
                            // $scope.listOfOrders($scope.defaultTab, 0);
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
                        }

                        else{
                           $scope.notify("Order Cannot Be Cancelled");
                        }
                    });
                }
            }
            if (remarks != undefined && remarks!='other') {
                var cancelUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/' + orderId + '/orderskus/' + tableSaleOrderId + '/cancel/?remarks=' + remarks;
                var putdata = '';
                $http.put(cancelUrl,putdata).success(function(data) {
                    console.log(data);
                    $('#cancelOrder').modal('hide');
                    if (data) {
                        $scope.notify("Order Cancelled Successfully",'success');
                        // $scope.listOfOrders($scope.defaultTab, 0);
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
                    }
                    else{
                       $scope.notify("Order Cannot Be Cancelled");
                    }
                });
            }
        }
    }


    //Bulk Upload Functionality Starts

    //getting date formats from bulk uploads settings backend
    $scope.dateFormatsBulkUpload = function() {
        $scope.dateFormatsArray = [];
        var dateFormatsUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/dateformat';
        $http.get(dateFormatsUrl).success(function(data)
        {
            $scope.dateFormatsArray = data;
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }
    //getting date format ends here
    
    $scope.onDateFormatSelected = function () {
        $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsDateFormat = $scope.bulkOrderSettingData.dateFormat.tableSalesChannelDateFormatString;
    }

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
            }
            else{
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
            }
            else{
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
    $scope.savebulkUploadSettingChannelWise = function(bulkOrderchannelId,form) {
        console.log($scope.arrayHeaderList);
        console.log($scope.bulkOrderchannelId);
        console.log($scope.dateFormat);
        console.log($scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName);

        var channelId = bulkOrderchannelId;
        // delete $scope.bulkOrderSettingData.channelId;
        var mappingCols = [];
        // console.log($scope.bulkOrderSettingData);
        console.log(channelId);
        if($scope.AddBulkOrderMapFormValidationMsg($scope.bulkOrderSettingData.channelId,$scope.bulkOrderSettingData.dateFormat,$scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName) == false){
            return;
        }

        $http.get(MavenAppConfig.baseUrlSource + "/omsservices/webapi/saleschannels/" + $scope.bulkOrderSettingData.channelId).success(function(data) {
            // console.log(data);

            // console.log($scope.arrayHeaderList.length);
            $scope.HeaderArray = [];
            $scope.HeaderArray = angular.copy($scope.arrayHeaderList);
            for (var i = 0; i < $scope.HeaderArray.length; i++) {

                if ($scope.HeaderArray[i].indexOf("Not Applicable") >= 0)
                {
                    $scope.HeaderArray[i] = null;
                    continue;
                }
                mappingCols.push({
                    tableSalesChannelBulkUploadMapOmsCol: $scope.arrayList[i],
                    tableSalesChannelBulkUploadMapScCol: $scope.HeaderArray[i]
                });
            }
            var putData = {
                "idtableSalesChannelBulkUploadSettingsId": $scope.bulkUploadSettingId,
                "tableSalesChannelBulkUploadSettingsName": $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName,
                "tableSalesChannelBulkUploadSettingsDateFormat": $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsDateFormat,
                "tableSalesChannelBulkUploadMapCols": mappingCols
            }
            if ($scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName != null) {
                data.tableSalesChannelBulkUploadSettings = putData;
            }
            if ($scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName == null) {
                data.tableSalesChannelBulkUploadSettings = null;
            }
            $http({
                method: 'PUT',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/saleschannels/' + channelId,
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                console.log(res);
                // $scope.arrayList = [];
                $scope.bulkOrderMapFile = null;
                $scope.arrayHeaderList = [];
                $scope.HeaderArray = [];
                $scope.bulkOrderSettingData = {};
                $scope.bulkUploadMapElemClicked = false;
                $scope.arrayHeaderList = [];
                $scope.closebulkOrderMapSettings(form);
                $scope.singleOrderTab = false;
                $scope.bulkOrderTab = true;
                $('#myModal2').modal('hide');
                $scope.notify("Bulk upload mapping saved Successfully",'success');
            }).error(function(error, status) {
                console.log(error);
                console.log(status);
                $scope.closebulkOrderMapSettings(form)
                if(status == 400){
                   $scope.notify(error.errorMessage);
                }
                else{
                   $scope.notify("Error in saving bulk upload mapping !!");
                }
                $scope.arrayHeaderList = [];
                $scope.bulkOrderSettingData = {};
                $scope.dateFormat = $scope.dateFormatsArray[0];
                $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsDateFormat = "";
                $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName = "";
                $scope.bulkUploadMapElemClicked = false;
                $scope.arrayHeaderList = [];

            });
        });


    };

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
                // $scope.listOfOrders($scope.defaultTab, 0);
                $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                $scope.notify("Bulk Order Uploaded successfully",'success');
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            $scope.bulkOrderSettingData = "";
            angular.element("input[type='file']").val(null);
            if (status == 400) {
               $scope.notify(error.errorMessage);
            }
            else {
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
        // console.log(radio);
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
        $scope.genericData.splitCost = false;
        $scope.genericData.quantity = null;
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
        $('#exportFile').modal('hide');
        $('#dialog2').modal('hide');
        $('#dialog1').modal('hide');
        $('#splitOrderSku').modal('hide');
        $scope.remarks = null;
        $scope.LoadNewRason.reasonData = null;

    }

    $scope.onvalue1 = function(radio1) {
        console.log(radio1);
        $scope.shippingObject = JSON.parse(radio1);
        console.log($scope.shippingObject);
    }

    //dialog box to open cancel order dialog box is commented for now
    /*$scope.cancelSaleOrderBox = function(ev, orderId, tableSaleOrderId, orderNo) {
        $scope.orderId = orderId;
        $scope.tableSaleOrderId = tableSaleOrderId;
        $scope.orderNo = orderNo;
        $scope.LoadNewRason = {};
        $scope.loadCancelReasons();
        $('#cancelOrder').modal('show');
    }*/

    var cancelableStates = [1,3,7,8,9,10,14,15];
    var cancelableStatesWithWhId = [11,13,35];

    $scope.showCancelBtn = function(skus){
        console.log($scope.skuWarehousesObjs);
        if(!$scope.skuWarehousesObjs.includes(undefined) && $scope.skuWarehousesObjs.length === skus.length){
            for(var i=0;i<skus.length;i++){
                if(
                    (
                        $scope.skuWarehousesObjs[i] && $scope.skuWarehousesObjs[i].idtableWarehouseDetailsId
                        && (
                            cancelableStates.includes(skus[i].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId)
                            || cancelableStatesWithWhId.includes(skus[i].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId)
                        )
                    )
                    || (
                        $scope.skuWarehousesObjs[i] && !$scope.skuWarehousesObjs[i].idtableWarehouseDetailsId
                        && cancelableStates.includes(skus[i].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId)
                    )
                )return true;
            }
        }
    }

    $scope.cancelOrders = function(order) {
        $scope.isSubmit = false;
        $scope.selectObj.selectAll = false;
        $scope.saleOrderId = order.idtableSaleOrderId;
        $scope.orderListing = [];
        var skus = [];
        skus = order.tableSaleOrderSkuses;
        $scope.cancellationRemarks = "";
        for(var i=0;i<skus.length;i++){
            if(
                (
                    $scope.skuWarehousesObjs[i]
                    && $scope.skuWarehousesObjs[i].idtableWarehouseDetailsId
                    && (
                        cancelableStates.includes(skus[i].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId)
                        || cancelableStatesWithWhId.includes(skus[i].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId)
                    )
                )
                || (
                    $scope.skuWarehousesObjs[i] && !$scope.skuWarehousesObjs[i].idtableWarehouseDetailsId
                    && cancelableStates.includes(skus[i].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId)
                )
            ){
                skus[i].saleOrderSkuQuantity = null;
                skus[i].selected = false;
                $scope.orderListing.push(skus[i]);
            }
        }
        if($scope.orderListing.length){
            $scope.loadCancelReasons();
            $('#cancelOrderDlog').modal('show');
        }else{
            $scope.notify("No item found to be cancelled!");
        }
        
        // $('#cancelOrder').modal('show');
    }

    $scope.checkMaxQnt = function(qnt, index){
        if(qnt < $scope.orderListing[index].saleOrderSkuQuantity){
            $scope.orderListing[index].saleOrderSkuQuantity = qnt;
        }
    }

    $scope.checkMaxQntForSplit = function(max, entered, index){
        if(entered >= max){
            $scope.skusListForOrderSplit[index].quantityToBeSplited = max;
        }
    }

    $scope.SelectedWithMaxQnt = function(selected, index){
        if(selected){
            $scope.orderListing[index].saleOrderSkuQuantity = $scope.orderListing[index].tableSaleOrderSkusSkuQuantity;
        }else{
            $scope.orderListing[index].saleOrderSkuQuantity = null;
        }
        var isAllNotSelected = false;
        for(var i=0;i<$scope.orderListing.length;i++){
            if(!$scope.orderListing[i].selected){
                isAllNotSelected = true;
            }
        }
        $scope.selectObj.selectAll = isAllNotSelected?false:true;
    }

    // $scope.cancellationRemarks = false;
    $scope.cancelOrderRemarks = "";
    $scope.customeRemarks = "";
    $scope.selectObj = {};
    $scope.selectObj.selectAll = false;

    $scope.addCustomeRemarks = function(value){
        $scope.customeRemarks = value;
    }

    $scope.selectAllOrderToCancel = function(all){
        if(all){
            for(var i=0;i<$scope.orderListing.length;i++){
                $scope.orderListing[i].selected = true;
                $scope.orderListing[i].saleOrderSkuQuantity = $scope.orderListing[i].tableSaleOrderSkusSkuQuantity;
            }
        }else if(!all){
            for(var i=0;i<$scope.orderListing.length;i++){
                $scope.orderListing[i].selected = false;
                $scope.orderListing[i].saleOrderSkuQuantity = null;
            }
        }
        
    }

    $scope.selectAllOrderToSplit = function(all){
        if(all){
            for(var i=0;i<$scope.skusListForOrderSplit.length;i++){
                $scope.skusListForOrderSplit[i].selected = true;
            }
        }else if(!all){
            for(var i=0;i<$scope.skusListForOrderSplit.length;i++){
                $scope.skusListForOrderSplit[i].selected = false;
            }
        }
        
    }

    $scope.isButtonDisable = false;

    $scope.splitOrderConfirm = function(){
        $scope.isButtonDisable = true;
        var allowSplit = false;

        for(var z=0;z<$scope.skusListForOrderSplit.length;z++){
            if(!($scope.skusListForOrderSplit[z].tableSaleOrderSkusSkuQuantity == $scope.skusListForOrderSplit[z].quantityToBeSplited && $scope.skusListForOrderSplit[z].selected)){
                allowSplit = true;
            }
        }
        if(!allowSplit){
            $scope.notify("You are not allowed to split all the skus with their max quantity!");
            $scope.isButtonDisable = false;
            return;
        }

        var temp_data = [];
        var data = {}

        var quantityForEach = false;

        for(var i=0;i<$scope.skusListForOrderSplit.length;i++){
            if($scope.skusListForOrderSplit[i].selected){
                if($scope.skusListForOrderSplit[i].quantityToBeSplited){
                    var temp = {};
                    temp.saleOrderSkuId = $scope.skusListForOrderSplit[i].idtableSaleOrderSkusId;
                    temp.saleOrderSkuQuantity = $scope.skusListForOrderSplit[i].quantityToBeSplited;
                    temp_data.push(temp);
                }else{
                    quantityForEach = true;
                }
                
            }
        }
        if(quantityForEach){
            $scope.notify("Please enter quantity for each selected order!");
            $scope.isButtonDisable = false;
            return;
        }

        if(!temp_data.length){
            $scope.notify("Please select atleast a order to split");
            $scope.isButtonDisable = false;
            return;
        }
        
        data.cancelledOrSplittedSkus = temp_data;
        data.isSplitCost = $scope.genericData.splitCost;

        console.log($scope.skusListForOrderSplit);
        
        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/splitorder?saleorderid='+$scope.genericData.orderId,
            data: data,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            $('#splitOrderSku').modal('hide');
            $scope.genericData.orderId = null;
            $scope.selectObj.selectAll = false;
            $scope.genericData.splitCost = false;
            $scope.isButtonDisable = false;
            $scope.notify("Order split successful",'success');
            $scope.listOfStatesCount($scope.defaultTab);
            // $scope.singleorderData.priceProd = res;
        }).error(function(error, status) {
            $scope.isButtonDisable = false;
            // $scope.singleorderData.priceProd = 0;
            console.log(status);

        });
    }

    $scope.isSubmit = false;

    $scope.cancelOrderConfirm = function(remrk){
        $scope.isSubmit = true;
        if((remrk == "other" && $scope.customeRemarks == "") || remrk == ""){
            $scope.notify("Please add a reason!");
            $scope.isSubmit = false;
            return;
        }

        var temp_data = [];
        var data = {}

        data.cancellationRemarks = remrk == "other"?$scope.customeRemarks:remrk;
        var quantityForEach = false;

        for(var i=0;i<$scope.orderListing.length;i++){
            if($scope.orderListing[i].selected){
                if($scope.orderListing[i].saleOrderSkuQuantity){
                    var temp = {};
                    temp.saleOrderSkuId = $scope.orderListing[i].idtableSaleOrderSkusId;
                    temp.saleOrderSkuQuantity = $scope.orderListing[i].saleOrderSkuQuantity;
                    temp_data.push(temp);
                }else{
                    quantityForEach = true;
                }
                
            }
        }
        if(quantityForEach){
            $scope.notify("Please enter quantity for each selected order!");
            $scope.isSubmit = false;
            return;
        }

        if(!temp_data.length){
            $scope.notify("Please select atleast a order to cancel");
            $scope.isSubmit = false;
            return;
        }
        
        data.cancelledOrSplittedSkus = temp_data;
        
        console.log($scope.orderListing);
        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/cancelorder?saleorderid='+$scope.saleOrderId,
            data: data,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            $('#cancelOrderDlog').modal('hide');
            $scope.customeRemarks = "";
            $scope.selectObj.selectAll = false;
            $scope.isSubmit = false;
            $scope.notify("Requested order is canceled successfully",'success');
            $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
            // $scope.singleorderData.priceProd = res;
        }).error(function(error, status) {
            // $scope.singleorderData.priceProd = 0;
            if(error.errorCode == 409){
                $scope.notify("Requested order is already cancelled");
                $('#cancelOrderDlog').modal('hide');
            }
            $scope.isSubmit = false;
            console.log(status);

        });
    }

    //info box to show full state trials for the order
    $scope.openInfoBox = function(ev, stateTrials) {
        $scope.steps = [];
        console.log(stateTrials);
        for (var i = 0; i < stateTrials.length; i++) {
            var a = stateTrials.length - 1;
            var fulldate = $filter('utcToLocalOrHyphen')(stateTrials[i].tableSaleOrderSkuStateTrailTimestamp);
            if (i < a) {
                $scope.steps.push({
                    title: stateTrials[i].tableSaleOrderSkuStateType.tableSaleOrderSkuStateTypeString,
                    active: true,
                    orderState: "Successful",
                    remarks: stateTrials[i].tableSaleOrderSkuStateTrailRemarks,
                    fulldate: fulldate
                });
            }
            if (i == a) {
                $scope.steps.push({
                    title: stateTrials[i].tableSaleOrderSkuStateType.tableSaleOrderSkuStateTypeString,
                    orderState: "In Process",
                    remarks: stateTrials[i].tableSaleOrderSkuStateTrailRemarks,
                    fulldate: fulldate
                });
            }
        }
        console.log($scope.steps);
        $('#infoDialog').modal('show');
    }

    $scope.cancelInfoBox = function() {
        $('#infoDialog').modal('hide');
    }
    $scope.testObj = function(selected) {
        if (selected != undefined || selected != null) {
            $scope.bulkUploadSettingMode = "edit";
            console.log(selected);
            console.log(selected.originalObject.tableSalesChannelBulkUploadMapCols);
            var uploadMapcols = selected.originalObject.tableSalesChannelBulkUploadMapCols;
            $scope.dateFormat = selected.originalObject.tableSalesChannelBulkUploadSettingsDateFormat;
            $scope.bulkUploadSettingId = selected.originalObject.idtableSalesChannelBulkUploadSettingsId;
            $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName = selected.originalObject.tableSalesChannelBulkUploadSettingsName;
            console.log($scope.dateFormat);
            $scope.notApplicableCounter = 1;
            for (var i = 0; i < $scope.arrayList.length; i++) {
                var found = false;
                for(var j=0; j< uploadMapcols.length; j++) {
                    if(arrayList[i] === uploadMapcols[j].tableSalesChannelBulkUploadMapOmsCol) {
                        $scope.arrayHeaderList.push(uploadMapcols[j].tableSalesChannelBulkUploadMapScCol);
                        $scope.list1 = $scope.arrayHeaderList;
                        found = true;
                        break;
                    }
                }
                if(found == false)
                {
                    $scope.arrayHeaderList.push('Not Applicable' + $scope.notApplicableCounter);
                    $scope.list1 = $scope.arrayHeaderList;
                    $scope.notApplicableCounter++ ;
                }
            }

            if($scope.arrayHeaderList.length < $scope.arrayList.length )
            {
                var extra = $scope.arrayList.length - $scope.arrayHeaderList.length;
                for(var counter = 1; counter <= extra;counter++ ) {
                    $scope.arrayHeaderList.push('Not Applicable' + counter);
                    $scope.list1 = $scope.arrayHeaderList;
                }
                $scope.notApplicableCounter = counter;
            }
        }
    };

    $scope.inputChanged = function(str) {
        $scope.console10 = str;
        console.log($scope.console10);
        $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName = $scope.console10;
        console.log($scope.bulkOrderSettingData);
        if ($scope.console10.length < 4) {
            $scope.bulkOrderSettingData = {};
            $scope.dateFormat = "";
            $scope.arrayHeaderList = [];
            $scope.list1 = $scope.arrayHeaderList;
            $scope.bulkUploadSettingMode = "add";
        }
    }

    //getting price of Product
    $scope.getPriceOfProduct = function(skuId, saleChannelId) {
        $http({
            method: 'GET',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/' + skuId + '/saleschannel/' + saleChannelId + '/price',
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
    }

    $scope.getChannelId = function()
    {
        $scope.singleorderData.tableSaleOrderMajorUpdate = true;
        $scope.singleorderData.deliveryAddressName = null;
        $scope.singleorderData.productObject = null;
        $scope.singleorderData.quantityNo = null;
        $scope.singleorderData.productObject = null;
        if (!$scope.singleorderData.channelObject) {
            $scope.salesChannelSelected = true;
        }
        else
        {
            console.log($scope.singleorderData.productObject);
            if ($scope.singleorderData.productObject != undefined && $scope.singleorderData.channelObject != undefined) {
                $scope.getPriceOfProduct($scope.singleorderData.productObject.idtableSkuId, $scope.singleorderData.channelObject.idtableSalesChannelValueInfoId);
            }
            $scope.salesChannelSelected = false;
        }
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

    $scope.checkbulkMappingSettingsAvailable = function(channelId) {
        console.log(channelId);
        $http.get(MavenAppConfig.baseUrlSource + "/omsservices/webapi/saleschannels/" + channelId).success(function(data) {
            console.log(data.tableSalesChannelBulkUploadSettings);
            if (data.tableSalesChannelBulkUploadSettings == null) {
                $scope.csvTrue = false;
            }
            if (data.tableSalesChannelBulkUploadSettings != null && data.tableSalesChannelBulkUploadSettings.tableSalesChannelBulkUploadMapCols.length > 0) {
                $scope.csvTrue = true;
            }
        });
    };

    $scope.digesttimeout = function(){
        $timeout(function(){
            $scope.$digest();
        },0);
        $timeout(function(){
            $scope.$digest();
        },1000);
        $timeout(function(){
            $scope.$digest();
        },2000);
        $timeout(function(){
            $scope.$digest();
        },3000);
    }

    $scope.setMappingName = function(channelId) {
        // $scope.arrayList = [];
        $scope.arrayHeaderList = [];
        $scope.arrayList = $scope.defaultArrayList;
        // $scope.generateHeaders();



        console.log(channelId);
        $http.get(MavenAppConfig.baseUrlSource + "/omsservices/webapi/saleschannels/" + channelId).success(function(data) {

            var settings = data.tableSalesChannelBulkUploadSettings;
            if(settings != null)
            {
                var mapCols = settings.tableSalesChannelBulkUploadMapCols;
                if (mapCols != null && mapCols.length > 0) {
                    console.log(data.tableSalesChannelBulkUploadSettings);
                    $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName = settings.tableSalesChannelBulkUploadSettingsName;
                    $scope.bulkOrderSettingData.idtableSalesChannelBulkUploadSettingsId = settings.idtableSalesChannelBulkUploadSettingsId;
                    $scope.bulkUploadSettingId = settings.idtableSalesChannelBulkUploadSettingsId;


                    $scope.dateFormat = settings.tableSalesChannelBulkUploadSettingsDateFormat;

                    for(var counter = 0; counter < $scope.dateFormatsArray.length;counter++)
                    {
                        if($scope.dateFormatsArray[counter].tableSalesChannelDateFormatString == settings.tableSalesChannelBulkUploadSettingsDateFormat)
                        {
                            $scope.bulkOrderSettingData.dateFormat = $scope.dateFormatsArray[counter];
                            $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsDateFormat = $scope.bulkOrderSettingData.dateFormat.tableSalesChannelDateFormatString;
                        }
                    }

                    $scope.notApplicableCounter = 1;
                    for (var i = 0; i < $scope.arrayList.length; i++)
                    {
                        var found = false;
                        for(var j=0; j< mapCols.length; j++)
                        {
                            if($scope.arrayList[i] === mapCols[j].tableSalesChannelBulkUploadMapOmsCol)
                            {
                                $scope.arrayHeaderList.push(mapCols[j].tableSalesChannelBulkUploadMapScCol);
                                $scope.list1 = $scope.arrayHeaderList;
                                found = true;
                                break;
                            }
                        }
                        if(found == false)
                        {
                            $scope.arrayHeaderList.push('Not Applicable' + $scope.notApplicableCounter);
                            $scope.list1 = $scope.arrayHeaderList;
                            $scope.notApplicableCounter++ ;
                        }
                    }

                    $scope.arrayList = $scope.arrayList;

                    if ($scope.arrayHeaderList.length < $scope.arrayList.length) {
                        var extra = $scope.arrayList.length - $scope.arrayHeaderList.length;
                        for(var counter = 1; counter <= extra;counter++ ) {
                            $scope.arrayHeaderList.push('Not Applicable' + counter);
                            $scope.list1 = $scope.arrayHeaderList;
                        }
                        $scope.notApplicableCounter = counter;
                    }
                }
            }
            else
            {
                $scope.arrayHeaderList = [];
                $scope.notApplicableCounter = 1;
                $scope.dateFormat = null;
                $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName = null;
                $scope.bulkOrderSettingData.idtableSalesChannelBulkUploadSettingsId = null;
            }
        });
    };

    function setFocus() {
        document.getElementById("settingName").focus();
    }

    function setBlur() {
        document.getElementById("settingName").blur();
    }
    $scope.closebulkOrderUploadCsv = function(form) {
        $scope.uploadProgress = null;
        $scope.csvTrue = false;
        $scope.bulkSelectChannel = false;
        $scope.bulkSelectFile = false;
        $scope.uploadedFile={};
        $scope.bulkOrderSettingData={};
        if(form){
            var controlNames = Object.keys(form).filter(function(key){
                return key.indexOf('$') !== 0;
            });
            for (var i =0;i<controlNames.length;i++) {
                var control = form[controlNames[i]];
                control.$setPristine();
                control.$setUntouched();
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#bulkOrder').modal('hide');
        $('#addOrderDialog').modal('hide');
    }

    $scope.closebulkOrderMapSettings = function(form) {
        $scope.bulkOrderMapFile = null;
        $scope.bulkOrderSettingData = {};
        $scope.arrayHeaderList = [];
        // $scope.arrayList = [];
        $scope.bulkUploadMapElemClicked = false;
        $scope.notApplicableCounter = 1;
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#myModal2').modal('hide');
        $('#addOrderDialog').modal('show');

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

    $scope.cancelSingleOrders = function(form){

        $scope.shippingDetails.SkuType = 'Parcel';
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
        $scope.skuModel ={};
        $scope.skuModel.tableSkusSkuQuantity = null;
        $scope.isshippingdetailsrequired = true;
        $scope.tableSalesOrderSkuQuantityDetails = [];
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#printLabels').modal('hide');
        $('#SOquickOperation').modal('hide');
    };

    //Start Date and End Date Validations Starts Here
    $scope.startmaxDate = new Date();
    $scope.endmaxDate = new Date();
    $scope.filter.start1Date = null;
    $scope.filter.end1Date = null;

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

    $scope.getFileType = function(file)
    {
        console.log(file);
    }
    $scope.DraftOrderID = {};
    $scope.OrderMode = "";
    $scope.editOrder = function(orderId,mode, ev) {
        $scope.singleOrderTab = true;
        $scope.bulkOrderTab = false;
        $scope.OrderMode = mode;
        $scope.singleOrderMode = mode;
        $scope.updateOrderId = orderId;
        $scope.DraftOrderID.OrderedId = orderId;
        $scope.bulkUploadTabShow = false;
        $scope.disableOrderButton = false;

        $scope.fetchOrderDataForEdit(orderId).then(
            function () {
                $('#addOrderDialog').modal('show');
            },
            function () {
               $scope.notify("There is some issue in fetching order data. Please try after sometime.")
            }
        )

    };


    $scope.fetchOrderDataForEdit = function(orderId){

        var q = $q.defer();

        var editOrderUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/' + orderId;
        $http({
            method: 'GET',
            url: editOrderUrl
        }).success(function(res) {
            if (res)
            {
                $scope.signleorderDataCopy = angular.copy(res);
                $scope.billingAddressCopy = angular.copy(res.tableAddressByTableSaleOrderBillToAddressId);
                console.log(res);
                if(JSON.stringify(res.tableAddressByTableSaleOrderShipToAddressId) == JSON.stringify(res.tableAddressByTableSaleOrderBillToAddressId)){
                    $scope.singleorderData.billingAddressSameAsShipping = true;
                }
                else{
                    $scope.singleorderData.billingAddressSameAsShipping = false;
                }
                $scope.singleorderData.tableSaleOrderRemarks = res.tableSaleOrderRemarks;
                $scope.singleorderData.orderNo = res.tableSaleOrderClientOrderNo;
                $scope.singleorderData.channelObject = initializeDropdowns($scope.channelNamesData, 'idtableSalesChannelValueInfoId', res.tableSalesChannelValueInfo.idtableSalesChannelValueInfoId);
                $scope.singleorderData.paymentObject = initializeDropdowns($scope.paymentNamesData, 'idtableSaleOrderPaymentTypeId', res.tableSaleOrderPaymentType.idtableSaleOrderPaymentTypeId);
                $scope.singleorderData.systemOrderNo = res.tableSaleOrderSystemOrderNo;
                $scope.custDataObj = {};
                if(res.tableSaleOrderLatestDeliveryDate!=null)
                {
                    $scope.singleorderData.tableSaleOrderLatestDeliveryDate = new Date(res.tableSaleOrderLatestDeliveryDate);
                }

                if(res.tableSaleOrderLatestShippngDate!=null)
                {
                    $scope.singleorderData.tableSaleOrderLatestShippngDate = new Date(res.tableSaleOrderLatestShippngDate);
                }
                if(res.tableSaleOrderScDateTime!=null)
                {
                    $scope.singleorderData.tableSaleOrderScDateTime = new Date(res.tableSaleOrderScDateTime);
                }

                $scope.singleorderData.tableSaleOrderMajorUpdate = res.tableSaleOrderMajorUpdate;
                $scope.singleorderData.tableSaleOrderMinorUpdate = res.tableSaleOrderMinorUpdate;
                $scope.singleorderData.tableSaleOrderRemarkses = res.tableSaleOrderRemarkses;
                
                $scope.custDataObj = {};
                $scope.custDataObj.originalObject = res.tableCustomer;
                $scope.customerObj($scope.custDataObj).then(
                    function(v) {
                        console.log(res.tableSaleOrderSkuses);
                        $scope.products = res.tableSaleOrderSkuses;
                        if(JSON.stringify(res.tableAddressByTableSaleOrderShipToAddressId) == JSON.stringify(res.tableAddressByTableSaleOrderBillToAddressId)){
                            $scope.singleorderData.billingAddressSameAsShipping = true;
                        }
                        else{
                            $scope.singleorderData.billingAddressSameAsShipping = false;
                        }
                        $scope.singleorderData.customerObj = angular.copy(res.tableCustomer);
                        $scope.$broadcast("angucomplete-alt:changeInput", "customers" , $scope.singleorderData.customerObj);

                            $scope.singleorderData.deliveryAddressName = res.tableAddressByTableSaleOrderShipToAddressId;
                            $scope.singleorderData.billingAddress = res.tableAddressByTableSaleOrderBillToAddressId;
                            $timeout(function(){
                                $scope.singleorderData.billingAddress = res.tableAddressByTableSaleOrderBillToAddressId;
                                if(JSON.stringify($scope.singleorderData.deliveryAddressName) == JSON.stringify($scope.singleorderData.billingAddress)){
                                    $scope.singleorderData.billingAddressSameAsShipping = true;
                                }
                            },2000)
                        // $scope.singleorderData.tableSaleOrderRemarkses = [];
                    },
                    function(err) {}

                );

                for (var i = 0; i < res.tableSaleOrderSkuses.length; i++) {
                    $scope.products.push({
                        tableSku: res.tableSaleOrderSkuses[i].tableSku,
                        tableSaleOrderSkusSkuQuantity: res.tableSaleOrderSkuses[i].tableSaleOrderSkusSkuQuantity,
                        tableSaleOrderSkusCharges: {
                            "tableSaleOrderSkusChargesItemPrice": res.tableSaleOrderSkuses[i].tableSaleOrderSkusCharges ? res.tableSaleOrderSkuses[i].tableSaleOrderSkusCharges.tableSaleOrderSkusChargesItemPrice : null
                        }
                    });
                }
                q.resolve(res);

            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            q.reject();

            if(status == 400){
               $scope.notify(error.errorMessage);
            }
            else{
               $scope.notify("There is some error in fetching order Data.");
            }
        });

        return q.promise;
    }


    $scope.copyOrder = function(orderId, ev) {
        $scope.singleOrderMode = "copy";
        $scope.updateOrderId = orderId;
        $scope.bulkUploadTabShow = false;
        var copyOrderUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/' + orderId;
        $http({
            method: 'GET',
            url: copyOrderUrl
        }).success(function(res) {
            if (res) {
                console.log(res);
                $scope.singleorderData.channelObject = initializeDropdowns($scope.channelNamesData, 'idtableSalesChannelValueInfoId', res.tableSalesChannelValueInfo.idtableSalesChannelValueInfoId);
                $scope.singleorderData.paymentObject = initializeDropdowns($scope.paymentNamesData, 'idtableSaleOrderPaymentTypeId', res.tableSaleOrderPaymentType.idtableSaleOrderPaymentTypeId);
                $scope.custDataObj = {};
                $scope.custDataObj.originalObject = res.tableCustomer;
                $scope.customerObj($scope.custDataObj).then(
                    function(v) {
                        console.log(res.tableSaleOrderSkuses);
                        $scope.products = res.tableSaleOrderSkuses;
                        if(JSON.stringify(res.tableAddressByTableSaleOrderShipToAddressId) == JSON.stringify(res.tableAddressByTableSaleOrderBillToAddressId)){
                            $scope.singleorderData.billingAddressSameAsShipping = true;
                        }
                        else{
                            $scope.singleorderData.billingAddressSameAsShipping = false;
                        }
                        $scope.singleorderData.customerObj = angular.copy(res.tableCustomer);
                        $scope.$broadcast("angucomplete-alt:changeInput", "customers" , $scope.singleorderData.customerObj);

                            $scope.singleorderData.deliveryAddressName = res.tableAddressByTableSaleOrderShipToAddressId;
                            $scope.singleorderData.billingAddress = res.tableAddressByTableSaleOrderBillToAddressId;
                            $scope.singleorderData.tableSaleOrderRemarkses = [];
                            $timeout(function(){
                                $scope.singleorderData.billingAddress = res.tableAddressByTableSaleOrderBillToAddressId;
                                if(JSON.stringify($scope.singleorderData.deliveryAddressName) == JSON.stringify($scope.singleorderData.billingAddress)){
                                    $scope.singleorderData.billingAddressSameAsShipping = true;
                                }
                            },2000)
                        
                    },
                    function(err) {}

                );
                $scope.disableOrderButton = false;
                $('#addOrderDialog').modal('show');
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            if(status == 400){
               $scope.notify(error.errorMessage);
            }
            else{
               $scope.notify("Order Cannot Be Copied");
            }
        })
    };

    $scope.concatenateAddresses = function(addr1, addr2, addr3) {
        return addr1 + ", " + addr2 + ", " + addr3;
    };

    function initializeDropdowns(lists, prop, code) {
        lists = lists || [];
        for (var i = 0; i < lists.length; i++) {
            var list = lists[i];
            if (list[prop] === code) {
                return list;
            }
        };
        return null;
    }

    $scope.orderNumberChanged = function(orderNo) {
        if (orderNo) {
            $scope.orderNumberEntered = false;
        } else {
            $scope.orderNumberEntered = true;
        }
    };

    //check Order Number
    $scope.checkOrderNumber = function(orderNo,value)
    {
        var q = $q.defer();
        if(value && value == 'EditDraft')
        {
            q.resolve(true);
        }
        else
        {
            console.log(orderNo);
            if (orderNo == undefined || orderNo == null || orderNo == "") {
                q.resolve(true);
            }
            else {
                var checkOrderNo = MavenAppConfig.baseUrlSource + "/omsservices/webapi/orders/clientordernumber?clientorderno=" + orderNo;
                $http.get(checkOrderNo).success(function (data) {
                    console.log(data);
                    if (data != "") {
                       $scope.notify("Order ref. no. already exists");
                        $('#ordernumberId').val('');
                        $scope.isOrderNoValid = true;
                        $scope.orderNumberEntered = true;
                        q.resolve(false);
                    }

                    if (data == "") {
                        $scope.isOrderNoValid = false;
                        $scope.orderNumberEntered = false;
                        q.resolve(true);
                    }
                });

            }
        }
        return q.promise;
    }

    // dialog box to add new invoice template
    $scope.uploadFileBulkOrder = function(ev) {
        $('#addOrderDialog').modal('hide');
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
    $scope.quickShipDataDialog = function(ev,data){

        $scope.validateForInvoiceAndQuickShip(data).then(function (value) {
            $scope.disableQuickShip = false;
            $('#SOquickOperation').modal('show');
            $scope.quickShipDataTable = [];
            angular.forEach(data.tableSaleOrderSkuses, function(value)
            {
                if(value.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 8 || value.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 9
                    || value.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 11 || value.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 13){
                    value.tableSaleOrderSkusAvailableSkuQuantity = value.tableSaleOrderSkusSkuQuantity;
                    $scope.quickShipDataTable.push(value);
                }
            });
            if(data.tableSalesChannelValueInfo.tableSalesChannelMetaInfo.idtableSalesChannelMetaInfoId == 1
                || data.tableSalesChannelValueInfo.tableSalesChannelMetaInfo.idtableSalesChannelMetaInfoId == 4)
            {
                $scope.isshippingdetailsrequired = false;
                $scope.blurred = false;
            }
            $scope.quickShipDataTable.orderID = data.idtableSaleOrderId;
        }, function(reason) {
           $scope.notify(reason);
        });

    }

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

    $scope.shippingDetails = {};
    $scope.resetAllQuickShipFields = function () {
        $scope.shippingDetails.VehicleType = null;
        $scope.shippingDetails.DriverName = null;
        $scope.shippingDetails.DriverNumber = null;
        $scope.shippingDetails.VehicleNumber = null;
        $scope.shippingDetails.tableSaleOrderShippingDetailsMasterAwb = null;

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
            if(value.VehicleNumber == '' || value.VehicleNumber == undefined){
               $scope.notify('Vehicle number is required.');
                return false;
            }
            if($scope.validateAlpha(value.DriverName) == false){
                return false;
            }
            if($scope.validateAlphaNum(value.VehicleNumber) == false){
                return false;
            }
            if(value.DriverNumber != null  && value.DriverNumber != undefined && value.DriverNumber != ''  && $scope.validateNumber(value.DriverNumber) == false){
                return false;
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
        var wrongQuantity = false;

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

        if(dimensions.Weight == null || dimensions.Weight == undefined)
        {
           $scope.notify('Enter weight');
            return;
        }

        if(dimensions.LengthUnit == null || dimensions.LengthUnit == undefined)
        {
           $scope.notify('Enter dimension unit');
            return;
        }

        if(dimensions.WeightUnit == null || dimensions.WeightUnit == undefined)
        {
           $scope.notify('Enter weight unit');
            return;
        }

        if(shippedDetails.SkuType == 'Parcel' && !$scope.shipping.awbnumber && $scope.isshippingdetailsrequired == true)
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
            if(source.tableSkusSkuQuantity && source.tableSaleOrderSkusAvailableSkuQuantity == 0){
                return;
            }
            else if(source.tableSkusSkuQuantity && (source.tableSaleOrderSkusAvailableSkuQuantity < source.tableSkusSkuQuantity)){
               $scope.notify('Quantity cannot be greater than available quantity');
                wrongQuantity = true;
                return;
            }
            else if(source.tableSkusSkuQuantity)
            {
                quantity += source.tableSkusSkuQuantity;
                source.tableSaleOrderSkusAvailableSkuQuantity -= source.tableSkusSkuQuantity;
                source.tableSaleOrderShippingDetailsShippingAwb = $scope.shipping.awbnumber;
                tableSkus.push(source);
            }
            else
            {
                source.tableSkusSkuQuantity = 0;
            }
        });
        if(quantity == 0){
            if(!wrongQuantity){
               $scope.notify('Please Enter Quantity');
            }
            return;
        }
        dimensions.tableSaleOrderSkus = tableSkus;
        dimensions.SKUcarrierDetails = shippedDetails;
        dimensions.SalesorderID = value.orderID;

        $scope.tableSalesOrderSkuQuantityDetails.push(angular.copy(dimensions));

        angular.forEach($scope.quickShipDataTable, function (res) {
            res.tableSaleOrderShippingDetailsShippingAwb = null;
            res.tableSkusSkuQuantity = null;
        });
        $scope.shipping = {};

        console.log($scope.tableSalesOrderSkuQuantityDetails);
        angular.forEach($scope.tableSalesOrderSkuQuantityDetails,function(source){
            $scope.TotalInputQuantity = $scope.sum(source.tableSaleOrderSkus,'tableSkusSkuQuantity');

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
    $scope.AddPacckingDetails = function(data,form)
    {
        $scope.disableQuickShip = true;
        $scope.boxSequenceNo = 1;
        var QuickShipTable = [];

        var SKUDto, SKuQuanity, newSkupackingData;
        if($scope.tableSalesOrderSkuQuantityDetails == ""){
           $scope.notify("You need to add package to list");
            $scope.disableQuickShip = false;
            return;
        }else{
            angular.forEach(data, function (value)
            {
                var SKUcarrierValue = null;
                var SkuDriverName = null;
                var SkuDriverNumber = null;
                var SkuVehicleNumber = null;
                var SkuVehicleType = null;
                SalesOrderSkuID = value.SalesorderID;

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
                    console.log(response);
                    delete response.tableSaleOrderSkusAvailableSkuQuantity;
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
                            'tableSaleOrderSkus': SKUDto,
                            'skuQuantity': SKuQuanity,
                            'tableSaleOrderPackingDetails': {
                                'tableSaleOrderPackingDetailsLength': value.Length,
                                'tableSaleOrderPackingDetailsWidth': value.Breadth,
                                'tableSaleOrderPackingDetailsHeight': value.Height,
                                'tableSaleOrderPackingDetailsWeight': value.Weight,
                                "tableSkuUodmType": value.LengthUnit,
                                "tableSkuUowmType": value.WeightUnit
                            },
                            "boxSequenceNo": $scope.boxSequenceNo
                        };
                        if($scope.isshippingdetailsrequired == true)
                        {
                            newSkupackingData.tableSaleOrderPackingDetails.tableSaleOrderShippingDetails = {
                                "tableSaleOrderShippingDetailsMasterAwb": SKUcarrierValue,
                                "tableSaleOrderShippingDetailsShippingAwb": response.tableSaleOrderShippingDetailsShippingAwb,
                                "tableClientShippingCarrierVehicleDriverMap": vehicleDriverMap
                            };
                        }

                        QuickShipTable.push(newSkupackingData);
                    }
                });
                $scope.boxSequenceNo++;

            });
            $http({
                method: 'PUT',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/' + SalesOrderSkuID + '/packinginfo',
                data: QuickShipTable,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (data) {
                console.log(data);

                $scope.shippingDetails.SkuType = 'Parcel';
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

                $scope.disableQuickShipBox = [];
                $scope.editQuickShipBoxHideAndShow = [];
                $('#SOquickOperation').modal('hide');
                $scope.notify('Quick ship success','success');
                $scope.cancelSingleOrders(form);
                $scope.listOfStatesCount($scope.defaultTab);
            }).error(function (data)
            {   $scope.shippingDetails.SkuType = 'Parcel';
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

                $scope.disableQuickShipBox = [];
                $scope.editQuickShipBoxHideAndShow = [];
                $('#SOquickOperation').modal('hide');
                $scope.disableQuickShip = false;
               $scope.notify(data.errorMessage);
                $scope.cancelSingleOrders(form);
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
        $scope.tableSalesOrderSkuQuantityDetails.splice(index, 1);
        console.log($scope.tableSalesOrderSkuQuantityDetails);
    };


    $scope.shippingDetails  = {};

    $scope.closeBulkUploadDialog = function(){
        $('#addOrderDialog').modal('hide');
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
        $scope.editRemarkModalOrderId = order.idtableSaleOrderId;
        $scope.modalRemarks = null;
        if(order.tableSaleOrderRemarkses == null || order.tableSaleOrderRemarkses == undefined){
            $scope.modalRemarks = null;
        }
        else{
            if(order.tableSaleOrderRemarkses.length>0){
                $scope.modalRemarks = order.tableSaleOrderRemarkses;
            }
        }
        $scope.orderIndex = index;
        $('#editRemarkModal').modal('show');
    };

    $scope.cancelEditRemarksModal = function(form){
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $scope.editRemarkModalOrderId = null;
        $scope.genericData.newModalRemarks = null;
        $scope.modalRemarks = null;
        $scope.orderIndex = null;
        $('#editRemarkModal').modal('hide');
    };

    $scope.updateRemarks = function(newRemarks,form){
        var remarks = newRemarks;
        var index = $scope.orderIndex;
        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/' + $scope.editRemarkModalOrderId +'/editremarks',
            data: remarks
        }).success(function(data) {
            var checkUpdatedRemarksDataUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/orders/"+orderDataForReplacingData.idtableSaleOrderId;
            $http({
                method: 'GET',
                url: checkUpdatedRemarksDataUrl
            }).success(function(response){
                var dataIndex = $scope.orderLists.indexOf(orderDataForReplacingData);
                $scope.orderLists[dataIndex] = response;
                $scope.notify("Remarks updated successfully",'success');
                $scope.cancelEditRemarksModal(form);
            }).error(function(err){
                $scope.cancelEditRemarksModal(form);
                console.log(err);
            });
            $scope.orderLists[index].tableSaleOrderRemarks = data;

        }).error(function(error, status) {
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
    //$scope.shippingDetails.SkuType = 'Parcel';


//    =============================== show order level action ========================== //

    $scope.showOrderLevelAction = function(value){
        console.log(value);
    }
    $scope.getShippingLabelButton = function(data){
        var b = false;
        angular.forEach(data.tableSaleOrderSkuses,function(resp)
        {
            if(b == false && (resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 15) && data.tableSalesChannelValueInfo.tableSalesChannelMetaInfo.idtableSalesChannelMetaInfoId == 4) {
                b = true;
            }
        });
        return b;
    }

    $scope.getPackingLabelButton = function(data){
        var b = false;
        angular.forEach(data,function(resp){
            if(b == false && (resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 16)){
                b = true;
            }
        });
        return b;
    };
    $scope.getmanifestLabelButton = function(data,orderskus){
        var b = false;
        if(data && data.tableSalesChannelValueInfo.tableSalesChannelMetaInfo.idtableSalesChannelMetaInfoId == 4 ){
            angular.forEach(orderskus,function(resp){
                if(b == false && (resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 15)){
                    b = true;
                }
            });
        }
        return b;
    };
    var invoiceOrChallan=false;
    $scope.getInvoiceOrChallanLabelButton = function(tableSaleOrderSkuses)
    {

        for(var i=0;i<tableSaleOrderSkuses.length;i++)
        {
            if(invoiceOrChallan == false &&  (tableSaleOrderSkuses[i].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 16))
            {
                invoiceOrChallan=true;
                break;
            }
        }

        return invoiceOrChallan;
    };
   // The below method shall be able to generate the Challan for a particular Sale Order Skus.
   // Challan of only those SKUs shall be created that are shipped.
    $scope.printSOChallan=function(tableSaleOrderSkuses)
    {
        var saleOrderSkuses = [];
        for (var i = 0; i < tableSaleOrderSkuses.length; i++)
        {
            if (invoiceOrChallan == true && $scope.clientInvoice==false)
            {
                saleOrderSkuses.push(tableSaleOrderSkuses[i].idtableSaleOrderSkusId);
            }
        }

        $http(

            {
            method: 'POST',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/challanslip',
            data: saleOrderSkuses,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (res)
        {
            $scope.printPreview(res);
        }).error(function (error, status)
        {
            if(status == 400){
                $scope.notify("Failed to download Challan");
            }
            else if(status==500){
                $scope.notify("Error Occured!Please Contact Admin");
            }


        });
    };
    $scope.getQuickShipLabelButton = function(data)
    {
        var b = false;
        for(var itemIndexCounter = 0; itemIndexCounter <  data.length ; itemIndexCounter++)
        {
            if(b == false && (data[itemIndexCounter].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 8
                            || data[itemIndexCounter].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 9
                            || data[itemIndexCounter].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 11)
                && ( ($scope.skuWarehousesObjs[itemIndexCounter].tableWarehouseType.idtableWarehouseTypeId == 1
                && $scope.skuWarehousesObjs[itemIndexCounter].tableWarehouseDetailsWmsId == null)
                || $scope.skuWarehousesObjs[itemIndexCounter].tableWarehouseType.idtableWarehouseTypeId == 2
                || $scope.skuWarehousesObjs[itemIndexCounter].tableWarehouseType.idtableWarehouseTypeId == 4
                || $scope.skuWarehousesObjs[itemIndexCounter].tableWarehouseType.idtableWarehouseTypeId == 5))
            {

                if(data[itemIndexCounter].tableSaleOrderSkusDispatchAfterDateTime)
                {
                    if(new Date(data[itemIndexCounter].tableSaleOrderSkusDispatchAfterDateTime) <= new Date())
                    {
                        b = true;
                    }
                }
                else
                {
                    b = true;
                }
            }
        }
        return b;
    };

    $scope.genericData = {};
    $scope.genericData.skuSelectedArray = [];
    $scope.genericData.quantity = 0;
    var unSplitableStates = [11,13,15,16,17,18];
    //updated code By UV - start
    $scope.getSplitLabelButton = function(data){
        var b = false;
        //alert("Value is :"+ data.tableSalesChannelMetaInfo);

        if(data.tableSalesChannelValueInfoSkuLevelSplitAllowed == true){
            b = true;
        }else if(data.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoSkuLevelSplitAllowed == true){
            b = true;
        }

        var check = 0;
        for(var i = 0; i < $scope.genericData.skuArray.length ; i++){
            if(unSplitableStates.includes($scope.genericData.skuArray[i].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId)){
                check++;
            }
        }

        if(check == $scope.genericData.skuArray.length){
            return false;
        }

        return b;
    };

    $scope.getSplitLabelButtonForQuantity = function(data, sku){
        var b = false;
        //alert("Value is :"+ data.tableSalesChannelMetaInfo);

        if(data.tableSalesChannelValueInfoSkuQuantityLevelSplitAllowed == true){
            b = true;
        }else if(data.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoSkuQuantityLevelSplitAllowed == true){
            b = true;

        }

        if(sku.tableSaleOrderSkusSkuQuantity < 2){
            return false;
        }

        if(sku.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId > 12){
            return false;
        }

        return b;
    }
    $scope.setOrderLevelActionRow = function () {
        if($scope.genericData.shippingLabelButn == true || $scope.genericData.packingLabelButton == true || $scope.genericData.manifestLabelButton == true || $scope.genericData.invoiceOrChallanLabelButton == true || $scope.genericData.quickShipButton == true || $scope.genericData.SplitOrderButton == true){
            $scope.genericData.showOrderLevelActionRow  = true;
        }else{
            $scope.genericData.showOrderLevelActionRow  = false;
        }
    }

    $scope.orderLevelActionRow = function(data, data2,order){

        $scope.genericData.skuArray = data;
        $scope.genericData.shippingLabelButn = $scope.getShippingLabelButton(data);
        $scope.genericData.packingLabelButton = $scope.getPackingLabelButton(data);
        $scope.genericData.manifestLabelButton = $scope.getmanifestLabelButton(order,data);
        $scope.genericData.invoiceOrChallanLabelButton = $scope.getInvoiceOrChallanLabelButton(data);
        $scope.genericData.quickShipButton = $scope.getQuickShipLabelButton(data);
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
        mastersService.fetchSkus(MavenAppConfig.baseUrlSource,function (data) {
            $scope.genericData.skusListFiltered = data;
            $timeout(function () {

                $('#dialogmastersku').modal('show');
                $scope.skuLoadBusy = false;
                $scope.stopSkuLoad = false;
            }, 500);
        })

        $scope.genericData.check = check;

    }

    $scope.masterCustomerDialog = function(ev, check){
        mastersService.fetchCustomers(MavenAppConfig.baseUrlSource,function (data) {


            $scope.genericData.customerListFiltered = data;

            $timeout(function () {

                $('#dialogmastercustomer').modal('show');

            }, 500);

        })

        $scope.genericData.check = check;
    }

    $scope.selectSku = function(id, ev){
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

        $scope.cancelmastersDialog(ev);


    }

    $scope.selectCustomer = function(id, ev){

        $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/'+id).success(function(data) {
            console.log(data);
            $scope.singleorderData.tableSaleOrderMajorUpdate = true;
            $scope.singleorderData.deliveryAddressName = null;
            $scope.singleorderData.billingAddress = null;
            $scope.singleorderData.productObject = null;
            $scope.singleorderData.quantityNo = null;
            $scope.singleorderData.priceProd = null;
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
    }

    $scope.checkForAll = function(){
        var isAllNotSelected = false;
        for(var i=0;i<$scope.skusListForOrderSplit.length;i++){
            if(!$scope.skusListForOrderSplit[i].selected){
                isAllNotSelected = true;
            }
        }
        $scope.selectObj.selectAll = isAllNotSelected?false:true;
    }

    $scope.splitOrderBySkuDialog = function(ev, data, orderid){
        $scope.isButtonDisable = false;
        $scope.selectObj.selectAll = false;
        $scope.skusListForOrderSplit = [];
        for(var i=0;i<data.length;i++){
            if(!unSplitableStates.includes(data[i].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId)){
                data[i].quantityToBeSplited = null;
                data[i].selected = false;
                $scope.skusListForOrderSplit.push(data[i]);
            }
        }
        $scope.genericData.orderId = orderid;
        $scope.genericData.skuSelectedArray = [];
        $('#splitOrderSku').modal('show');

    }

    $scope.genericData.splitCost = false;

    $scope.splitOrderBySkuByQuantityDialog = function(ev, data, orderid,skuquantity){
        $scope.genericData.skuid = data;
        $scope.genericData.orderId = orderid;
        $scope.genericData.skuquantity =skuquantity;
        $('#splitOrderSkubyquantity').modal('show');

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
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/' + $scope.genericData.orderId +'/splitorder?splitCost='+$scope.genericData.splitCost,
            data: arr
        }).success(function(data) {
            //$scope.orderLists[index].tableSaleOrderRemarks = remarks;
            $scope.notify("Order split successful",'success');
            $scope.genericData.skuSelectedArray = [];
            $('#splitOrderSku').modal('hide');
            $scope.listOfStatesCount($scope.defaultTab);
        }).error(function(error, status) {
            $('#splitOrderSku').modal('hide');
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

    $scope.splitOrderBySkusByQuantity = function(){
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
            headers: {
                'Content-Type': 'text/plain'
            },
            data: '',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/' + $scope.genericData.orderId +'/splitorderwithskuquantity/'+ $scope.genericData.skuid + '?skuquantity='+$scope.genericData.quantity+'&splitCost='+$scope.genericData.splitCost,

        }).success(function(data)
        {
            $scope.notify("Order splitted successfully",'success');
            $('#splitOrderSkubyquantity').modal('hide');
            $('#splitOrderSkubyquantity').modal('hide');
            $scope.listOfStatesCount($scope.defaultTab);
        }).error(function(error, status)
        {
            $('#splitOrderSkubyquantity').modal('hide');
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

    $scope.changeReturnType = function(){
        if($scope.genericData.returnType == 'quantitybased')
        {
            $scope.customersData.tableCustomerReturnValue = null;
        }
        if($scope.genericData.returnType == 'valuebased')
        {
            $scope.customersData.tableCustomerReturnQuantity = null;
        }
    }

    $scope.checkNumber = checkNumber;

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

    $scope.downloadOrdertemplate = function(){
        $http({
            method: 'GET',
            url: $scope.downloadOrderTemplateUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            responseType:'arraybuffer'
        }).success(function (data) {
            console.log(data);
            var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
            var downloadUrl = URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = downloadUrl;
            a.download = "Glaucus_Order_Upload_Template.xls";
            document.body.appendChild(a);
            a.click();
        }).error(function(data){
            console.log(data);
        });
    };

    $scope.shipAll = function(){
        if($scope.shipping.shipallchecked){
            angular.forEach($scope.quickShipDataTable, function (response)
            {
                response.tableSkusSkuQuantity = response.tableSaleOrderSkusSkuQuantity;
            })
        }
        else{
            angular.forEach($scope.quickShipDataTable, function (response)
            {
                response.tableSkusSkuQuantity = undefined;
            })
        }
    }

    /**
     * The below method will split all the orders that have SKUs on HOLD Warehouse
     * Allocated state at once.
     *
     * New Orders will be created that contains only HOLD SKUs.
     *
     */
    $scope.splitHoldSkuInOrders=function()
    {
        $http
        ({
            method:'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/splitholdorders',
            data:null
        }).
        success(function(apiResponse)
            {

               $('#confirmHoldSkuProcess').modal('hide');
               $scope.notify("Successfully splitted orders")

            }
            ).
        error(function(apiResponse)
            {

            }
             )
    }
    $scope.genericData.splitOrAllocate=false;

    /**
     * The below method opens the dialog box i.e D:\Code\maven\oms\order\confirmHoldOrderSkuProcessing.html
     * if Split Orders request is placed after clicking Split Orders
     * button in Sale Order screen.
     *
     *
     * When the endpoint successfully executes the dialog box closes.
     */

    $scope.holdOrdersSplitConform=function()
    {
        $('#confirmHoldSkuProcess').modal('show');
    }
    /**
     * The below method opens the dialog box i.e D:\Code\maven\oms\order\confirmHoldOrderSkuProcessing.html
     * if Allocating Warehouse request is placed after clicking Allocate Warehouse
     * button in Sale Order screen.
     *
     */

    $scope.holdOrdersAllocateConform=function()
    {
        $scope.genericData.splitOrAllocate=true;
        $('#confirmHoldSkuProcess').modal('show');
    }

    /**
     * Orders that have only Hold SKUs will be
     * processed in the below method.
     * Warehouse will be allocated to Hold SKUs
     * if Inventory will be available.
     *
     * When the endpoint successfully executes the dialog box closes.
     *
     */
    $scope.allocateWhToSplitOrders=function()
    {
        $http
        ({
            method:'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/allocatewhtoholdsku',
            data:''
        }).
        success(function(apiResponse)
            {
                //$('#confirmHoldSkuProcess').modal('hide');
                $scope.notify("Successfully allocated warehouse.")
            }

        ). error(function(apiResponse)

            {

            }
        )
    }
    /**
     * The below method will check whether Allocate Wh button at Order Level
     * needs to be displayed or not.
     *
     * The button is displayed only if atleast one SKU in Sale Order
     * is in New or HoldWarehouseNotAllocatedState.
     *
     *
     * @param tableSaleOrderSkuses
     * @returns {boolean}
     *
     * @author AMAN AHUJA
     */
    $scope.saleOrderIsAllocateWhButton = function (tableSaleOrderSkuses)
    {
        /*if($scope.clientProfile.tableClientProfileAutoAllocateWh == null || $scope.clientProfile.tableClientProfileAutoAllocateWh == false) {
            for (var counter = 0; counter < tableSaleOrderSkuses.length; counter++) {
                if (tableSaleOrderSkuses[counter].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 1
                    || tableSaleOrderSkuses[counter].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 7) {
                    return true;
                }
                return false;
            }
        }*/

        for(var i=0;i<tableSaleOrderSkuses.length;i++){
            if((tableSaleOrderSkuses[i].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 1 && !$scope.clientProfile.tableClientProfileAutoAllocateWh) || (tableSaleOrderSkuses[i].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 7 && !$scope.clientProfile.tableClientProfileAutoAllocateWhHoldNotAllocated) || (tableSaleOrderSkuses[i].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 3 && !$scope.clientProfile.tableClientProfileAutoAllocateWhHoldNotAllocated) || (tableSaleOrderSkuses[i].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 10 && !$scope.clientProfile.tableClientProfileAutoAllocateWhHoldNotAvailable) )return true;
            }
    };

    $scope.allocateWhButton = function(stateTypeId){
        if(stateTypeId == 10 && $scope.clientProfile.tableClientProfileAutoAllocateWhHoldNotAvailable) return false;
        else return true;
    }

    /**
     * The below method will be called when Allocate Wh button at Order Level
     * is clicked by the User.
     *
     * The method will inturn call the endpoint
     * which in turn processes the selected order that contains atleast one SKU in New or HoldWarehouseNotAllocated
     * State.
     *
     *
     * @param idtableSaleOrderId
     * @returns {boolean}
     *
     * @author AMAN AHUJA
     */
    $scope.allocateWhToSOSku = function (idtableSaleOrderId) {

        $http
        ({
            method: 'GET',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/allocatewhtoorder?orderid=' + idtableSaleOrderId,
        }).success(function (apiResponse) {

                $scope.notify("Order is in Process for Warehouse Allocation.", "success")
            }
        ).error(function (apiResponse) {
                $scope.notify("Please connect with System Administrator.");
            }
        )
    };

    $scope.getGstTypes();

    $scope.bulkMapFile = function () {
        $scope.bulkOrderSettingData = {};
        $('#addOrderDialog').modal('hide');
        $('#myModal2').modal('show');
    }

    $scope.$on('$destroy', function () {
        $window.localStorage.removeItem('saleOrderFilter');
        $window.localStorage.removeItem('outboundTab');
        $("#dialogmastersku").remove();
        $('.modal-backdrop').remove();
    });

    $scope.$watch('singleorderData.tableSaleOrderScDateTime', function(newVal, oldVal){
        if(!($scope.signleorderDataCopy && $scope.signleorderDataCopy.tableSaleOrderScDateTime) && newVal != undefined){
            $scope.singleorderData.tableSaleOrderMajorUpdate = true;
        }
        else if(oldVal && newVal){
            $scope.singleorderData.tableSaleOrderMajorUpdate = true;
        }
    })
    $scope.$watch('singleorderData.tableSaleOrderLatestShippngDate', function(newVal, oldVal){
        if(!($scope.signleorderDataCopy && $scope.signleorderDataCopy.tableSaleOrderLatestShippngDate) && newVal != undefined){
            $scope.singleorderData.tableSaleOrderMinorUpdate = true;
        }
        else if(oldVal && newVal){
            $scope.singleorderData.tableSaleOrderMinorUpdate = true;
        }
    })
    $scope.$watch('singleorderData.tableSaleOrderLatestDeliveryDate', function(newVal, oldVal){
        if(!($scope.signleorderDataCopy && $scope.signleorderDataCopy.tableSaleOrderLatestDeliveryDate) && newVal != undefined){
            $scope.singleorderData.tableSaleOrderMinorUpdate = true;
        }
        else if(oldVal && newVal){
            $scope.singleorderData.tableSaleOrderMinorUpdate = true;
        }   
    })

    $scope.minorUpdate = function(){
        $scope.singleorderData.tableSaleOrderMinorUpdate = true;
    }

    $scope.enableButtons = function(){
        $scope.disableOrderButton = false;
    }
}]);

