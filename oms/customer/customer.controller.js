angular.module('OMSApp.customer', ['customerbaseController' ]).config(function config($stateProvider) {
    $stateProvider.state('/customer/', {
        name: '/customer/',
        url: '/customer/',
        views: {
            "main": {
                controller: 'customerCtrl',
                templateUrl: 'customer/customer.view.html'
            },
            "header": {
                controller: 'headerCtrl',
                templateUrl: '../shared/templates/header.html'
            }
        },
        data: {pageTitle: 'Customer'}
    })

}).controller('customerCtrl',['$scope', '$controller' , '$http', '$location', 'MavenAppConfig', 'pagerService','$q', '$cookies','$timeout','$rootScope', 'mastersService',

function customerCtrl($scope, $controller, $http, $location, MavenAppConfig,pagerService, $q, $cookies,$timeout,$rootScope, mastersService)
{
    $controller('customerbaseCtrl', { $scope: $scope });

    $scope.genericData = {};
    $scope.genericData.enableSorting =  true;
    $scope.searchCustomerClicked = false;
    $scope.start = 0;
    $scope.recordsPerPage = [5,10,15];
    $scope.customerSize = $scope.recordsPerPage[0];
    $scope.baseSkuUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/search?search=';
    $scope.baseCustomerUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/search?search=';
   $scope.downloadCustomersTemplateUrl =MavenAppConfig.s3+ MavenAppConfig.downloadCustomersTemplateUrl;

    $scope.modeCustomer = "normal";

    $scope.sortType = "tableCustomerSystemNo";
    $scope.directionType = "desc";
    $scope.sortReverse = false; // set the default sort order

    $scope.isSubmitDisabledMutual = true;
    $scope.isResetDisabledMutual = true;

    $scope.isSubmitDisabledSku = true;
    $scope.isResetDisabledSku = true;

    $scope.searchSection = "customer";


    $scope.callDisabledMutual = function(text) {
        $scope.isSubmitDisabledMutual = false;
        !text?$scope.listOfCustomerCount():null;
    }

    $scope.callDisabledSku = function() {
        $scope.isSubmitDisabledSku = false;
    }

    $scope.onLoad=function () {
        $scope.listOfCustomerCount();
        $scope.regionsStatesData();
        $scope.getGstTypes();
    }

    $scope.newChanged = function(text){
        if(!text){
            $scope.skuFullId = null;
            $scope.listOfCustomerCount();
        }
    }

    //Submit Customer Action
    //submit Action for Customer screen when clicking on submit button in main customer screen
    $scope.submitCustomerAction = function(cityid, districtid, stateid) {

        console.log(cityid);
        console.log(districtid);
        console.log(stateid);
        $scope.cityid = cityid;
        $scope.districtid = districtid;
        $scope.stateid = stateid;
        $scope.start = 0;
        $scope.modeCustomer = "normal";
        var page = undefined;
        // $scope.listOfCustomers();
        $scope.listOfCustomerCount(page);
    };

    //clear action for vendor mutual search
    $scope.clearMutualcustomerAction = function() {
        $scope.genericData.enableSorting =  true;
        $scope.start = 0;
        $scope.modeCustomer = "normal";
        // $scope.listOfCustomers();
        $scope.isSubmitDisabledMutual = true;
        $scope.isResetDisabledMutual = false;
        var page = undefined;
        $scope.listOfCustomerCount(page);
    }

    $scope.clearMutualSkuAction = function() {
        $scope.genericData.enableSorting =  true;
        $scope.start = 0;
        $scope.modeCustomer = "normal";
        $scope.skuFullId = null;
        var page = undefined;
        $scope.listOfCustomerCount(page);
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        $scope.isSubmitDisabledSku = true;
        $scope.isResetDisabledSku = false;
    }

    $scope.clearStateDistCitycustomerAction = function() {
        $scope.start = 0;
        $scope.cityid = null;
        $scope.districtid = null;
        $scope.stateid = null;
        $scope.modeCustomer = "normal";
        var page = undefined;
        $scope.listOfCustomerCount(page);
    }

    $scope.searchedProduct = function(selected) {
        if (selected != null) {
            console.log(selected);
            $scope.skuFullId = selected.originalObject.idtableSkuId;
            $scope.callDisabledSku();
        }
    }

    //submit customer action mutual customer
    $scope.submitcustomerSearchAction = function(wordSearch) {
        if(wordSearch == null || wordSearch == undefined || wordSearch == '')
        {
            $scope.notify('At least 3 characters are required for search','warning');
            return;
        }
        if(wordSearch.length < 3)
        {
            $scope.notify('At least 3 characters are required for search','warning');
            return;
        }
        $scope.genericData.enableSorting =  false;
        $scope.sortType = "tableCustomerSystemNo";
        $scope.directionType = "desc";
        $scope.wordSearch = wordSearch;
        $scope.modeCustomer = "mutual";
        $scope.sortReverse = true;
        $scope.isSubmitDisabledMutual = true;
        $scope.isResetDisabledMutual = false;
        var page = undefined;
        $scope.listOfMutualCustomersCount(page);
    }

    //submit customer action sku wise
    $scope.submitSkuSearchAction = function() {
        if($scope.skuFullId == null || $scope.skuFullId == undefined)
        {
            $scope.notify('Select SKU first','warning');
            return;
        }
        $scope.genericData.enableSorting =  false;
        $scope.sortType = "tableCustomerSystemNo";
        $scope.directionType = "desc";
        $scope.modeCustomer = "skuFull";
        $scope.sortReverse = true;
        $scope.isSubmitDisabledSku = true;
        $scope.isResetDisabledSku = false;
        var page = undefined;
        $scope.listOfMutualSkuCount(page);
    }

    $scope.tableSorting = function(sortType, sortReverse) {
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

        if ($scope.modeCustomer == 'normal') {
            var page = undefined;
            $scope.listOfCustomerCount(page);
        }

        if ($scope.modeCustomer == 'mutual') {
            var page = undefined;
            $scope.listOfMutualCustomersCount(page);
        }

        if ($scope.modeCustomer == 'skuFull') {
            var page = undefined;
            $scope.listOfMutualSkuCount(page);
        }
    };

    $scope.showResult = function(result) {
        console.log(result);
        // $scope.searchLocation = null;
        if(result!=undefined)
        {
            $scope.searchLocation = {
                latitude: result.geometry.location.lat(),
                longitude: result.geometry.location.lng()
            }
            console.log($scope.searchLocation);
        }
        return true;
    };

    $scope.showResultForBilling = function(result) {
        console.log(result);
        // $scope.searchLocation = null;
        if(result!=undefined)
        {
            $scope.searchLocationBilling = {
                latitude: result.geometry.location.lat(),
                longitude: result.geometry.location.lng()
            }
            console.log($scope.searchLocationBilling);
        }
        return true;
    };

    //opening and closing search accordian
    $scope.toggleSearchRow = function() {
        console.log($scope.searchCustomerClicked);
        $scope.searchCustomerClicked = !$scope.searchCustomerClicked;
    };
    //opening and closing search accordian ends here


    // fetching list of customers from RestAPI OMS
    $scope.listOfCustomers = function(start) {

        var customersListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/customers";
        customersListUrl += "?start=" + start + '&size='+$scope.customerSize+'&sort=' + $scope.sortType + '&direction=' + $scope.directionType;
        if ($scope.cityid) {
            customersListUrl += "&city=" + $scope.cityid;
        }
        if ($scope.districtid) {
            customersListUrl += "&district=" + $scope.districtid;
        }
        if ($scope.stateid) {
            customersListUrl += "&state=" + $scope.stateid;
        }
        console.log(customersListUrl);
        $http.get(customersListUrl).success(function(data) {
            $scope.customersLists = data;
            $scope.tableRowExpanded = false;
            $scope.tableRowIndexExpandedCurr = "";
            $scope.tableRowIndexExpandedPrev = "";
            $scope.storeIdExpanded = "";
            $scope.end = $scope.start + data.length;
            $scope.dayDataCollapse = [];

            for (var i = 0; i < $scope.customersLists.length; i += 1) {
                $scope.dayDataCollapse.push(false);
            }
            $scope.showLoader = false;
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };

    $scope.onRecordsPerPageChange = function (orderSize) {
        $scope.start = 0;
        $scope.customerSize = orderSize;
        $scope.end = 0;
        $scope.customersLists = [];
        if ($scope.modeCustomer == 'normal')
        {
            $scope.listOfCustomerCount(1);
        }
        if ($scope.modeCustomer == 'mutual')
        {
            $scope.listOfMutualCustomersCount(1);
        }
        if ($scope.modeCustomer == 'skuFull')
        {
            $scope.listOfMutualSkuCount(1);
        }
    }

    //fetching list of customers count
    $scope.listOfCustomerCount = function(page) {
        var customerCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/customers/filtercount?sort=idtableCustomerId&direction=desc";
        if ($scope.cityid) {
            customerCountUrl += "&city=" + $scope.cityid;
        }
        if ($scope.districtid) {
            customerCountUrl += "&district=" + $scope.districtid;
        }
        if ($scope.stateid) {
            customerCountUrl += "&state=" + $scope.stateid;
        }
        $http.get(customerCountUrl).success(function(data) {
            $scope.customerCount = data;
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.customerCount); // dummy array of items to be paged
                vm.pager = {};
                $scope.customersLists=[];
                $scope.showLoader = true;
                // vm.setPage = setPage;
                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = pagerService.GetPager(vm.dummyItems.length, page,$scope.customerSize);
                    console.log(vm.pager);
                    $scope.vmPager = vm.pager;

                    $scope.start = (vm.pager.currentPage - 1) * $scope.customerSize;
                    console.log($scope.start);
                    console.log($scope.customerSize);
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfCustomers($scope.start);
                }
                if (page == undefined) {
                    setPage(1);
                }
                if (page != undefined) {
                    setPage(page);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };
    //fetchng list of customer count ends here

    //fetching list of mutual customers from mutually exlusive search string customers
    $scope.listOfMutualCustomers = function(start) {
        var customersListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/customers/search?search=" + $scope.wordSearch;
        customersListUrl += '&start=' + start + '&size='+$scope.customerSize+'&sort=' + $scope.sortType + '&direction=' + $scope.directionType;
        console.log(customersListUrl);
        $http.get(customersListUrl).success(function(data) {
            console.log(data);
            $scope.customersLists = data;
            $scope.dayDataCollapse = [];
            $scope.end = $scope.start + data.length;
            for (var i = 0; i < $scope.customersLists.length; i += 1) {
                $scope.dayDataCollapse.push(false);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    //fetching list of mutual customers count
    $scope.listOfMutualCustomersCount = function(page) {
        var customerCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/customers/searchcount?search=" + $scope.wordSearch;
        console.log("customers MAIN COUNT URL");
        console.log(customerCountUrl);
        $http.get(customerCountUrl).success(function(data) {
            $scope.customerCount = data;
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.customerCount); // dummy array of items to be paged
                vm.pager = {};
                vm.setPage = setPage;

                if (page == undefined) {
                    initController();

                    function initController() {
                        // initialize to page 1
                        vm.setPage(1);
                    }
                }

                if (page != undefined) {
                    vm.setPage(page);

                }

                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = pagerService.GetPager(vm.dummyItems.length, page,$scope.customerSize);
                    console.log(vm.pager);
                    $scope.vmPager = vm.pager;

                    $scope.start = (vm.pager.currentPage - 1) * $scope.customerSize;
                    console.log($scope.start);
                    console.log($scope.customerSize);
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfMutualCustomers($scope.start);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };

    //fetching list of mutual customers from mutually exlusive search string customers
    $scope.listOfSkuCustomers = function(start) {
        var skucustomersListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/customers/skus/" + $scope.skuFullId;
        skucustomersListUrl += "?start=" + start + '&size=5&sort=' + $scope.sortType + '&direction=' + $scope.directionType;
        console.log(skucustomersListUrl);
        $http.get(skucustomersListUrl).success(function(data) {
            console.log(data);
            $scope.customersLists = data;
            $scope.dayDataCollapse = [];
            $scope.end = $scope.start + data.length;
            for (var i = 0; i < $scope.customersLists.length; i += 1) {
                $scope.dayDataCollapse.push(false);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    //fetching list of mutual customers count
    $scope.listOfMutualSkuCount = function(page) {
        var skucustomerCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/customers/skuscount/" + $scope.skuFullId;
        console.log("sku customers MAIN COUNT URL");
        console.log(skucustomerCountUrl);
        $http.get(skucustomerCountUrl).success(function(data) {
            $scope.customerCount = data;
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.customerCount); // dummy array of items to be paged
                vm.pager = {};
                vm.setPage = setPage;

                if (page == undefined) {
                    initController();

                    function initController() {
                        // initialize to page 1
                        vm.setPage(1);
                    }
                }

                if (page != undefined) {
                    vm.setPage(page);

                }

                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = pagerService.GetPager(vm.dummyItems.length, page,$scope.customerSize);
                    console.log(vm.pager);
                    $scope.vmPager = vm.pager;

                    $scope.start = (vm.pager.currentPage - 1) * $scope.customerSize;
                    console.log($scope.start);
                    console.log($scope.customerSize);
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfSkuCustomers($scope.start);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };
    //fetchng list of vendors mutual count ends here


    //expansion and collapsing of customer rows data
    $scope.tableRowExpanded = false;
    $scope.tableRowIndexExpandedCurr = "";
    $scope.tableRowIndexExpandedPrev = "";
    $scope.storeIdExpanded = "";

    $scope.dayDataCollapseFn = function() {
        $scope.dayDataCollapse = [];

        for (var i = 0; i < $scope.customersLists.length; i += 1) {
            $scope.dayDataCollapse.push(false);
        }
    };


    $scope.selectTableRow = function(index, storeId) {

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

    //expansion and collapsing of customer rows data ends here

    $scope.customercreatedsuccessfully = function()
    {
        if ($scope.modeCustomer == 'normal')
        {
            $scope.listOfCustomerCount($scope.vmPager.currentPage);
        }
        if ($scope.modeCustomer == 'mutual')
        {
            $scope.listOfMutualCustomersCount($scope.vmPager.currentPage);
        }
        if ($scope.modeCustomer == 'skuFull')
        {
            $scope.listOfMutualSkuCount($scope.vmPager.currentPage);
        }
        $scope.cancelCustomerData();
    }

    //Blacklist customer
    $scope.blacklistCustomer = function(customersData) {
        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/' + customersData.idtableCustomerId + '/blacklist',
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                $scope.genericData.customerMode = "add";
                if ($scope.modeCustomer == 'normal') {
                    $scope.listOfCustomerCount($scope.vmPager.currentPage);
                }
                if ($scope.modeCustomer == 'mutual') {
                    $scope.listOfMutualCustomersCount($scope.vmPager.currentPage);
                }
                if ($scope.modeCustomer == 'skuFull') {
                    $scope.listOfMutualSkuCount($scope.vmPager.currentPage);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            if(status == 400)
            {
                $scope.notify(error.errorMessage,'danger');
            }
            else
            {
                $scope.notify("Error while updating blacklist",'danger');
            }
        });
    };

    $scope.whitelistCustomer = function(customersData) {
        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/' + customersData.idtableCustomerId + '/whitelist',
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                $scope.genericData.customerMode = "add";
                $scope.notify("Customer whitelisted successfully",'success');
                if ($scope.modeCustomer == 'normal') {
                    $scope.listOfCustomerCount($scope.vmPager.currentPage);
                }
                if ($scope.modeCustomer == 'mutual') {
                    $scope.listOfMutualCustomersCount($scope.vmPager.currentPage);
                }
                if ($scope.modeCustomer == 'skuFull') {
                    $scope.listOfMutualSkuCount($scope.vmPager.currentPage);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            if(status == 400)
            {
                $scope.notify(error.errorMessage,'danger');
            }
            else {
                $scope.notify("Error while updating whiltelist",'danger');
            }
        });
    };

    var skuStart=0,size=10;
    $scope.skuLoadBusy = false;
    $scope.stopSkuLoad = false;
    $scope.skuPagingFunction = function () {
        if($scope.stopSkuLoad){
            return;
        };
        $scope.skuLoadBusy = true;
        mastersService.fetchSkusNext(MavenAppConfig.baseUrlSource,skuStart,size).then(function(data){
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

    $scope.masterSkuDialog = function(ev) {

        mastersService.fetchSkus(MavenAppConfig.baseUrlSource,function(data) {
            $scope.genericData.skusListFiltered = data;
            $timeout(function() {
                $('#dialogmastersku').modal('show');
                $scope.skuLoadBusy = false;
                $scope.stopSkuLoad = false;
            }, 500);
        });

    }

    $scope.selectSku = function(id, ev){
        $scope.stopSkuLoad = true;
        $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/'+id).success(function(data) {
            console.log(data);

            $scope.$broadcast("angucomplete-alt:changeInput", "products", data);

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

    }

    $scope.checkNumber = checkNumber;

    $scope.exportCustomers = function () {

        var orderListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/customers/export";

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
                if(status == 200){
                    $cookies.put('DownloadExportData','customer');
                    $cookies.put('ActiveTab','Customer');
                    $scope.notify("Customers Export requested successfully.<br><a href='#/export/' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View files</a>",'success');
                }else{
                    $scope.notify("There is some error, please try again.",'danger');
                }

            }).error(function(error,status){
                console.log(status);
            if(status == 400){
                $scope.notify(error.errorMessage,'danger');
            }
            else{
                $scope.notify("There is some error in downloading template. Please try after some time.",'danger');
            }

        });

    }

    $scope.$on('$destroy', function () {
        $("#dialogmastersku").remove();
        $('.modal-backdrop').remove();
    });

}]);

