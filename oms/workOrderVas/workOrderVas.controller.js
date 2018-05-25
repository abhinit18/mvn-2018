angular.module('OMSApp.vas', [ ]).config(function config($stateProvider) {
    $stateProvider.state('/vas/', {
        name: '/vas/',
        url: '/vas/',
        views: {
            "main": {
                controller: 'workOrderVasController',
                templateUrl: 'workOrderVas/workOrderTabs.view2.html'
            },
            "header": {
                controller: 'headerCtrl',
                templateUrl: '../shared/templates/header.html'
            }
        },
        data: {pageTitle: 'Customer'}
    })

}).controller('workOrderVasController', ['$scope', '$http', '$location', '$mdDialog', 'MavenAppConfig', 'pagerService','$controller',

function workOrderVasController($scope, $http, $location, $mdDialog,  MavenAppConfig, pagerService,$controller) {

    // Initialize the super class and extend it.
    $.extend(this, $controller('templatesController', {$scope: $scope}));
    // Initialize the super class and extend it.
    $.extend(this, $controller('skuController', {$scope: $scope}));
    $scope.sortType = "tableSku.tableSkuClientSkuCode"; // set the default sort type
    $scope.sortReverse = true; // set the default sort order
    $scope.searchItem = ""; // set the default search/filter term

    $scope.searchInventoryClicked = false;
    $scope.searchWorkOrderClicked = false;
    $scope.searchWorkOrderKitClicked = false;
    $scope.searchWorkOrderSplitClicked = false;
    $scope.searchWorkOrderMailerClicked = false;
    $scope.searchWorkOrderQcClicked = false;
    $scope.searchWorkOrderStockClicked = false;
    $scope.searchWorkOrderStickerClicked = false;
    $scope.inventoryData = "";
    $scope.kitData = "";
    $scope.splitData = "";
    $scope.freeMailerData = "";
    $scope.qcData = "";
    $scope.stockData = "";
    $scope.stickerData = "";
    $scope.wIdSticker = "";
    $scope.mode = "add";
    $scope.start = 0;
    $scope.inventorySize = 5;
    $scope.allworkOrderStart = 0;
    $scope.allworkOrderSize = 5;
    $scope.allworkOrderKitStart = 0;
    $scope.allworkOrderKitSize = 5;
    $scope.allworkOrderSplitStart = 0;
    $scope.allworkOrderSplitSize = 5;
    $scope.allworkOrderMailerStart = 0;
    $scope.allworkOrderMailerSize = 5;
    $scope.allworkOrderQcStart = 0;
    $scope.allworkOrderQcSize = 5;
    $scope.allworkOrderStockStart = 0;
    $scope.allworkOrderStockSize = 5;
    $scope.allworkOrderStickerStart = 0;
    $scope.allworkOrderStickerSize = 5;
    // $scope.optionsList = [];
    $scope.products = [];
    $scope.invMRPMSP = false;
    $scope.baseSkuUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/search?search=';
    $scope.baseCustomerUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/search?search=';

    //Inv No
    $scope.firstInvNo = 1;
    $scope.secInvNo = 2;
    $scope.thirdInvNo = 3;
    $scope.fourthInvNo = 4;
    $scope.fifthInvNo = 5;

    //Work Ord No
    $scope.firstWrkOrdNo = 1;
    $scope.secWrkOrdNo = 2;
    $scope.thirdWrkOrdNo = 3;
    $scope.fourthWrkOrdNo = 4;
    $scope.fifthWrkOrdNo = 5;

    //Work Order Kit No
    $scope.firstWrkOrdKitNo = 1;
    $scope.secWrkOrdKitNo = 2;
    $scope.thirdWrkOrdKitNo = 3;
    $scope.fourthWrkOrdKitNo = 4;
    $scope.fifthWrkOrdKitNo = 5;

    //Work Order Split No
    $scope.firstWrkOrdSplitNo = 1;
    $scope.secWrkOrdSplitNo = 2;
    $scope.thirdWrkOrdSplitNo = 3;
    $scope.fourthWrkOrdSplitNo = 4;
    $scope.fifthWrkOrdSplitNo = 5;

    //Work Order Mailer No
    $scope.firstWrkOrdMailerNo = 1;
    $scope.secWrkOrdMailerNo = 2;
    $scope.thirdWrkOrdMailerNo = 3;
    $scope.fourthWrkOrdMailerNo = 4;
    $scope.fifthWrkOrdMailerNo = 5;

    //Work Order Qc No
    $scope.firstWrkOrdQcNo = 1;
    $scope.secWrkOrdQcNo = 2;
    $scope.thirdWrkOrdQcNo = 3;
    $scope.fourthWrkOrdQcNo = 4;
    $scope.fifthWrkOrdQcNo = 5;

    //Work Order Stock No
    $scope.firstWrkOrdStockNo = 1;
    $scope.secWrkOrdStockNo = 2;
    $scope.thirdWrkOrdStockNo = 3;
    $scope.fourthWrkOrdStockNo = 4;
    $scope.fifthWrkOrdStockNo = 5;

    //Work Order Stock No
    $scope.firstWrkOrdStickerNo = 1;
    $scope.secWrkOrdStickerNo = 2;
    $scope.thirdWrkOrdStickerNo = 3;
    $scope.fourthWrkOrdStickerNo = 4;
    $scope.fifthWrkOrdStickerNo = 5;

    //dialog bog variable
    $scope.dialogBoxKit = 'add';
    $scope.dialogBoxSplit = 'add';
    $scope.dialogBoxFreeMailer = 'add';
    $scope.dialogBoxQC = 'add';
    $scope.dialogBoxStock = 'add';
    $scope.dialogBoxSticker = 'add';

    $scope.validAvblQty = false;

    $scope.selectedTab1 = 0;
    $scope.mdSelectedTab = 0;

    $scope.isSubmitDisabledInv = true;
    $scope.isResetDisabledInv = true;

    $scope.isSubmitDisabledListWo = true;
    $scope.isResetDisabledListWo = true;

    $scope.isSubmitDisabledKit = true;
    $scope.isResetDisabledKit = true;

    $scope.isSubmitDisabledSplit = true;
    $scope.isResetDisabledSplit = true;

    $scope.isSubmitDisabledMailer = true;
    $scope.isResetDisabledMailer = true;

    $scope.isSubmitDisabledQc = true;
    $scope.isResetDisabledQc = true;

    $scope.isSubmitDisabledStock = true;
    $scope.isResetDisabledStock = true; 

    $scope.isSubmitDisabledSticker = true;
    $scope.isResetDisabledSticker = true;

    $scope.defaultTab = "all";
    $scope.defaultTabKit = "all";
    $scope.defaultTabSplit = "all"; 
    $scope.defaultTabMailer = "all";
    $scope.defaultTabQc = "all"; 
    $scope.defaultTabStock = "all"; 
    $scope.defaultTabSticker = "all"; 

    $scope.stickermode = "add";
    $scope.openStickeMode = function()
    {
        $scope.stickerTotalMode = "new";
    }

    $scope.openAddSkuKitMode = function($event,kitData)
    {
        console.log(kitData);
        $scope.kitData = kitData;
        $mdDialog.hide();
        $scope.skuKitTotalMode = "new";
        $scope.showkitAddBox($event);
    }

    $scope.onLoad= function() {
        $scope.listOfWorkOrderCount($scope.defaultTab);
        // $scope.listOfWorkOrderKitCount($scope.defaultTabKit);
        // $scope.listOfWorkOrderSplitCount($scope.defaultTabSplit);
        // $scope.listOfWorkOrderMailerCount($scope.defaultTabMailer);
        // $scope.listOfWorkOrderQcCount($scope.defaultTabQc);
        // $scope.listOfWorkOrderStockCount($scope.defaultTabStock);
        // $scope.listOfWorkOrderStickerCount($scope.defaultTabSticker);
        $scope.getWarehouses();
        $scope.getVendors();
        $scope.qcTrueLists();
        $scope.loadStickerTemplates();
        $scope.loadCancelReasons();
    };

    //expansion and collapsing of vendor rows data
    $scope.tableRowExpanded = false;
    $scope.tableRowIndexExpandedCurr = "";
    $scope.tableRowIndexExpandedPrev = "";
    $scope.storeIdExpanded = "";

    $scope.dayDataCollapseFn = function() {
        $scope.dayDataCollapse = [];

        for (var i = 0; i < $scope.workOrderLists.length; i += 1) {
            $scope.dayDataCollapse.push(false);
        }
    };

    $scope.selectTableRow = function(index, storeId) {
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

    $scope.checkValidAvblQty = function(val) {
        if (val && val > 0) {
            $scope.validAvblQty = false;
        }
    };

    $scope.callDisabled = function(){
        $scope.isSubmitDisabledInv = false;
    }

    $scope.callDisabledListWo = function(){
        $scope.isSubmitDisabledListWo = false;
    }

    $scope.callDisabledKit = function(){
        $scope.isSubmitDisabledKit = false;
    }

    $scope.callDisabledSplit = function(){
        $scope.isSubmitDisabledSplit = false;
    }

    $scope.callDisabledMailer = function(){
        $scope.isSubmitDisabledMailer = false;
    }

    $scope.callDisabledQc = function(){
        $scope.isSubmitDisabledQc = false;
    }

    $scope.callDisabledStock = function(){
        $scope.isSubmitDisabledStock = false;
    }

    $scope.callDisabledSticker = function(){
        $scope.isSubmitDisabledSticker = false;
    }                

    $scope.searchedProduct = function(selected) {
            $scope.skuid = selected.originalObject.idtableSkuId;
            $scope.callDisabled();
        }
        //fetching list of inventories count
    $scope.listOfInventoriesCount = function(page) {
            var inventoryCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/inventory/filtercount?sort=tableSkuInventoryCreationDate&direction=desc";
            if ($scope.warehouseid) {
                inventoryCountUrl += "&warehouseid=" + $scope.warehouseid;
            }
            if ($scope.skuid) {
                inventoryCountUrl += "&skuid=" + $scope.skuid;
            }
            if ($scope.startDate) {
                inventoryCountUrl += "&startDate=" + $scope.startDate;
            }
            if ($scope.endDate) {
                inventoryCountUrl += "&endDate=" + $scope.endDate;
            }


            $http.get(inventoryCountUrl).success(function(data) {
                $scope.invCount = data;
                if (data != null) {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.invCount); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPager = vm.pager;

                        $scope.start = (vm.pager.currentPage - 1) * 5;
                        $scope.inventorySize = $scope.start + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfInventories($scope.start);
                    }
                }
            }).error(function(error, status) {
    
    

            });
        }
        //fetchng list of inv count ends here

    //fetching list of workorder count
    $scope.listOfWorkOrderCount = function(tabsValue,page) {

        $scope.defaultTab = tabsValue;
        $scope.allCount = 0;
        $scope.newCount = 0;
        $scope.processCount = 0;
        $scope.holdCount = 0;
        $scope.closedCount = 0;
        $scope.cancelledCount = 0;

        var allCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workorderstatus=0";       
        var newCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workorderstatus=1";
        var processCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workorderstatus=2";
        var holdCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workorderstatus=3";
        var closedCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workorderstatus=4";
        var cancelledCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workorderstatus=5";        
        
        if ($scope.warehouseid) {
            allCountUrl += "&warehouse=" + $scope.warehouseid;
            newCountUrl += "&warehouse=" + $scope.warehouseid;
            processCountUrl += "&warehouse=" + $scope.warehouseid;
            holdCountUrl += "&warehouse=" + $scope.warehouseid;
            closedCountUrl += "&warehouse=" + $scope.warehouseid;
            cancelledCountUrl += "&warehouse=" + $scope.warehouseid; 
        }
        if ($scope.startDate) {
            allCountUrl += "&startDate=" + $scope.startDate;
            newCountUrl += "&startDate=" + $scope.startDate;
            processCountUrl += "&startDate=" + $scope.startDate;
            holdCountUrl += "&startDate=" + $scope.startDate;
            closedCountUrl += "&startDate=" + $scope.startDate;
            cancelledCountUrl += "&startDate=" + $scope.startDate;             
        }
        if ($scope.endDate) {
            allCountUrl += "&endDate=" + $scope.endDate;
            newCountUrl += "&endDate=" + $scope.endDate;
            processCountUrl += "&endDate=" + $scope.endDate;
            holdCountUrl += "&endDate=" + $scope.endDate;
            closedCountUrl += "&endDate=" + $scope.endDate;
            cancelledCountUrl += "&endDate=" + $scope.endDate;            
        }

        console.log("ALL COUNT URL");
        console.log(allCountUrl);
        console.log("NEW COUNT URL");
        console.log(newCountUrl);
        console.log("PROCESS COUNT URL");
        console.log(processCountUrl);
        console.log("HOLD COUNT URL");
        console.log(holdCountUrl);
        console.log("ClOSED COUNT URL");
        console.log(closedCountUrl);
        console.log("CANCELLED COUNT URL");
        console.log(cancelledCountUrl);


        // {{url}}/omsservices/webapi/workorder/filtercount?warehouse=2&workordertype=2&startDate=2016-07-01&endDate=2016-07-29&workorderstatus=1
        $http.get(allCountUrl).success(function(data) {
            $scope.allCount = data;
            if (data != null) {
                if (tabsValue == 'all') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.allCount); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);

                        $scope.vmPagerWoStart = vm.pager;

                        $scope.allworkOrderStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderSize = $scope.allworkOrderStart + 5;


                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrders(0,$scope.allworkOrderStart);
                    }
                }
            }
         }).error(function(error, status) {



        });

        $http.get(newCountUrl).success(function(data) {
            $scope.newCount = data;
            if (data != null) {
                if (tabsValue == 'new') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.newCount); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);

                        $scope.vmPagerWoStart = vm.pager;

                        $scope.allworkOrderStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderSize = $scope.allworkOrderStart + 5;


                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrders(1,$scope.allworkOrderStart);
                    }
                }
            }
         }).error(function(error, status) {



        });

        $http.get(processCountUrl).success(function(data) {
            $scope.processCount = data;
            if (data != null) {
                if (tabsValue == 'process') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.processCount); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);

                        $scope.vmPagerWoStart = vm.pager;

                        $scope.allworkOrderStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderSize = $scope.allworkOrderStart + 5;


                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrders(2,$scope.allworkOrderStart);
                    }
                }
            }
         }).error(function(error, status) {



        });

        $http.get(holdCountUrl).success(function(data) {
            $scope.holdCount = data;
            if (data != null) {
                if (tabsValue == 'hodl') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.holdCount); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);

                        $scope.vmPagerWoStart = vm.pager;

                        $scope.allworkOrderStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderSize = $scope.allworkOrderStart + 5;


                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrders(3,$scope.allworkOrderStart);
                    }
                }
            }
         }).error(function(error, status) {



        });

        $http.get(closedCountUrl).success(function(data) {
            $scope.closedCount = data;
            if (data != null) {
                if (tabsValue == 'closed') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.closedCount); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);

                        $scope.vmPagerWoStart = vm.pager;

                        $scope.allworkOrderStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderSize = $scope.allworkOrderStart + 5;


                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrders(4,$scope.allworkOrderStart);
                    }
                }
            }
         }).error(function(error, status) {



        });

        $http.get(cancelledCountUrl).success(function(data) {
            $scope.cancelledCount = data;
            if (data != null) {
                if (tabsValue == 'cancelled') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.cancelledCount); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);

                        $scope.vmPagerWoStart = vm.pager;

                        $scope.allworkOrderStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderSize = $scope.allworkOrderStart + 5;


                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrders(5,$scope.allworkOrderStart);
                    }
                }
            }
         }).error(function(error, status) {



        });                                         
    }

    //fetching list of workorder kit count
    $scope.listOfWorkOrderKitCount = function(tabsValue,page) {


            $scope.defaultTabKit = tabsValue;
            $scope.allCountKit = 0;
            $scope.newCountKit = 0;
            $scope.processCountKit = 0;
            $scope.holdCountKit = 0;
            $scope.closedCountKit = 0;
            $scope.cancelledCountKit = 0;

            var allCountKitUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=1&workorderstatus=0";       
            var newCountKitUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=1&workorderstatus=1";
            var processCountKitUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=1&workorderstatus=2";
            var holdCountKitUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=1&workorderstatus=3";
            var closedCountKitUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=1&workorderstatus=4";
            var cancelledCountKitUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=1&workorderstatus=5";        
            
            if ($scope.warehouseid) {
                allCountKitUrl += "&warehouse=" + $scope.warehouseid;
                newCountKitUrl += "&warehouse=" + $scope.warehouseid;
                processCountKitUrl += "&warehouse=" + $scope.warehouseid;
                holdCountKitUrl += "&warehouse=" + $scope.warehouseid;
                closedCountKitUrl += "&warehouse=" + $scope.warehouseid;
                cancelledCountKitUrl += "&warehouse=" + $scope.warehouseid; 
            }
            if ($scope.startDate) {
                allCountKitUrl += "&startDate=" + $scope.startDate;
                newCountKitUrl += "&startDate=" + $scope.startDate;
                processCountKitUrl += "&startDate=" + $scope.startDate;
                holdCountKitUrl += "&startDate=" + $scope.startDate;
                closedCountKitUrl += "&startDate=" + $scope.startDate;
                cancelledCountKitUrl += "&startDate=" + $scope.startDate;             
            }
            if ($scope.endDate) {
                allCountKitUrl += "&endDate=" + $scope.endDate;
                newCountKitUrl += "&endDate=" + $scope.endDate;
                processCountKitUrl += "&endDate=" + $scope.endDate;
                holdCountKitUrl += "&endDate=" + $scope.endDate;
                closedCountKitUrl += "&endDate=" + $scope.endDate;
                cancelledCountKitUrl += "&endDate=" + $scope.endDate;            
            }

            console.log("ALL COUNT URL");
            console.log(allCountKitUrl);
            console.log("NEW COUNT URL");
            console.log(newCountKitUrl);
            console.log("PROCESS COUNT URL");
            console.log(processCountKitUrl);
            console.log("HOLD COUNT URL");
            console.log(holdCountKitUrl);
            console.log("ClOSED COUNT URL");
            console.log(closedCountKitUrl);
            console.log("CANCELLED COUNT URL");
            console.log(cancelledCountKitUrl);


            console.log(tabsValue);
            $http.get(allCountKitUrl).success(function(data) {
                $scope.allCountKit = data;
                if (data != null) {
                    if (tabsValue == 'all') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.allCountKit); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoKitStart = vm.pager;

                        $scope.allworkOrderKitStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderKitSize = $scope.allworkOrderKitStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedKit(0,$scope.allworkOrderKitStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });

            $http.get(newCountKitUrl).success(function(data) {
                $scope.newCountKit = data;
                if (data != null) {
                    if (tabsValue == 'new') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.newCountKit); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoKitStart = vm.pager;

                        $scope.allworkOrderKitStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderKitSize = $scope.allworkOrderKitStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedKit(1,$scope.allworkOrderKitStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });

            $http.get(processCountKitUrl).success(function(data) {
                console.log(data);
                $scope.processCountKit = data;
                if (data != null) {
                    if (tabsValue == 'process') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.processCountKit); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoKitStart = vm.pager;

                        $scope.allworkOrderKitStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderKitSize = $scope.allworkOrderKitStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedKit(2,$scope.allworkOrderKitStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });

            $http.get(holdCountKitUrl).success(function(data) {
                $scope.holdCountKit = data;
                if (data != null) {
                    if (tabsValue == 'hold') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.holdCountKit); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoKitStart = vm.pager;

                        $scope.allworkOrderKitStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderKitSize = $scope.allworkOrderKitStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedKit(3,$scope.allworkOrderKitStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });


            $http.get(closedCountKitUrl).success(function(data) {
                $scope.closedCountKit = data;
                if (data != null) {
                    if (tabsValue == 'closed') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.closedCountKit); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoKitStart = vm.pager;

                        $scope.allworkOrderKitStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderKitSize = $scope.allworkOrderKitStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedKit(4,$scope.allworkOrderKitStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });


            $http.get(cancelledCountKitUrl).success(function(data) {
                $scope.cancelledCountKit = data;
                if (data != null) {
                    if (tabsValue == 'cancelled') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.cancelledCountKit); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoKitStart = vm.pager;

                        $scope.allworkOrderKitStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderKitSize = $scope.allworkOrderKitStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedKit(5,$scope.allworkOrderKitStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });
        }

        //fetching list of workorder kit count
    $scope.listOfWorkOrderSplitCount = function(tabsValue,page) {


            $scope.defaultTabSplit = tabsValue;
            $scope.allCountSplit = 0;
            $scope.newCountSplit = 0;
            $scope.processCountSplit = 0;
            $scope.holdCountSplit = 0;
            $scope.closedCountSplit = 0;
            $scope.cancelledCountSplit = 0;

            var allCountSplitUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=2&workorderstatus=0";       
            var newCountSplitUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=2&workorderstatus=1";
            var processCountSplitUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=2&workorderstatus=2";
            var holdCountSplitUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=2&workorderstatus=3";
            var closedCountSplitUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=2&workorderstatus=4";
            var cancelledCountSplitUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=2&workorderstatus=5";        
            
            if ($scope.warehouseid) {
                allCountSplitUrl += "&warehouse=" + $scope.warehouseid;
                newCountSplitUrl += "&warehouse=" + $scope.warehouseid;
                processCountSplitUrl += "&warehouse=" + $scope.warehouseid;
                holdCountSplitUrl += "&warehouse=" + $scope.warehouseid;
                closedCountSplitUrl += "&warehouse=" + $scope.warehouseid;
                cancelledCountSplitUrl += "&warehouse=" + $scope.warehouseid; 
            }
            if ($scope.startDate) {
                allCountSplitUrl += "&startDate=" + $scope.startDate;
                newCountSplitUrl += "&startDate=" + $scope.startDate;
                processCountSplitUrl += "&startDate=" + $scope.startDate;
                holdCountSplitUrl += "&startDate=" + $scope.startDate;
                closedCountSplitUrl += "&startDate=" + $scope.startDate;
                cancelledCountSplitUrl += "&startDate=" + $scope.startDate;             
            }
            if ($scope.endDate) {
                allCountSplitUrl += "&endDate=" + $scope.endDate;
                newCountSplitUrl += "&endDate=" + $scope.endDate;
                processCountSplitUrl += "&endDate=" + $scope.endDate;
                holdCountSplitUrl += "&endDate=" + $scope.endDate;
                closedCountSplitUrl += "&endDate=" + $scope.endDate;
                cancelledCountSplitUrl += "&endDate=" + $scope.endDate;            
            }

            console.log("ALL COUNT URL");
            console.log(allCountSplitUrl);
            console.log("NEW COUNT URL");
            console.log(newCountSplitUrl);
            console.log("PROCESS COUNT URL");
            console.log(processCountSplitUrl);
            console.log("HOLD COUNT URL");
            console.log(holdCountSplitUrl);
            console.log("ClOSED COUNT URL");
            console.log(closedCountSplitUrl);
            console.log("CANCELLED COUNT URL");
            console.log(cancelledCountSplitUrl);


            console.log(tabsValue);
            $http.get(allCountSplitUrl).success(function(data) {
                $scope.allCountSplit = data;
                if (data != null) {
                    if (tabsValue == 'all') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.allCountSplit); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoSplitStart = vm.pager;

                        $scope.allworkOrderSplitStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderSplitSize = $scope.allworkOrderSplitStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedSplit(0,$scope.allworkOrderSplitStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });

            $http.get(newCountSplitUrl).success(function(data) {
                $scope.newCountSplit = data;
                if (data != null) {
                    if (tabsValue == 'new') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.newCountSplit); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoSplitStart = vm.pager;

                        $scope.allworkOrderSplitStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderSplitSize = $scope.allworkOrderSplitStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedSplit(1,$scope.allworkOrderSplitStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });

            $http.get(processCountSplitUrl).success(function(data) {
                console.log(data);
                $scope.processCountSplit = data;
                if (data != null) {
                    if (tabsValue == 'process') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.processCountSplit); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoSplitStart = vm.pager;

                        $scope.allworkOrderSplitStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderSplitSize = $scope.allworkOrderSplitStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedSplit(2,$scope.allworkOrderSplitStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });

            $http.get(holdCountSplitUrl).success(function(data) {
                $scope.holdCountSplit = data;
                if (data != null) {
                    if (tabsValue == 'hold') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.holdCountSplit); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoSplitStart = vm.pager;

                        $scope.allworkOrderSplitStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderSplitSize = $scope.allworkOrderSplitStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedSplit(3,$scope.allworkOrderSplitStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });


            $http.get(closedCountSplitUrl).success(function(data) {
                $scope.closedCountSplit = data;
                if (data != null) {
                    if (tabsValue == 'closed') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.closedCountSplit); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoSplitStart = vm.pager;

                        $scope.allworkOrderSplitStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderSplitSize = $scope.allworkOrderSplitStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedSplit(4,$scope.allworkOrderSplitStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });


            $http.get(cancelledCountSplitUrl).success(function(data) {
                $scope.cancelledCountSplit = data;
                if (data != null) {
                    if (tabsValue == 'cancelled') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.cancelledCountSplit); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoSplitStart = vm.pager;

                        $scope.allworkOrderSplitStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderSplitSize = $scope.allworkOrderSplitStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedSplit(5,$scope.allworkOrderSplitStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });
        }        
        //fetching list of workorder split count ends here


    //fetching list of workorder mailer count
    $scope.listOfWorkOrderMailerCount = function(tabsValue,page) {


            $scope.defaultTabMailer = tabsValue;
            $scope.allCountMailer = 0;
            $scope.newCountMailer = 0;
            $scope.processCountMailer = 0;
            $scope.holdCountMailer = 0;
            $scope.closedCountMailer = 0;
            $scope.cancelledCountMailer = 0;

            var allCountMailerUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=4&workorderstatus=0";       
            var newCountMailerUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=4&workorderstatus=1";
            var processCountMailerUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=4&workorderstatus=2";
            var holdCountMailerUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=4&workorderstatus=3";
            var closedCountMailerUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=4&workorderstatus=4";
            var cancelledCountMailerUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=4&workorderstatus=5";        
            
            if ($scope.warehouseid) {
                allCountMailerUrl += "&warehouse=" + $scope.warehouseid;
                newCountMailerUrl += "&warehouse=" + $scope.warehouseid;
                processCountMailerUrl += "&warehouse=" + $scope.warehouseid;
                holdCountMailerUrl += "&warehouse=" + $scope.warehouseid;
                closedCountMailerUrl += "&warehouse=" + $scope.warehouseid;
                cancelledCountMailerUrl += "&warehouse=" + $scope.warehouseid; 
            }
            if ($scope.startDate) {
                allCountMailerUrl += "&startDate=" + $scope.startDate;
                newCountMailerUrl += "&startDate=" + $scope.startDate;
                processCountMailerUrl += "&startDate=" + $scope.startDate;
                holdCountMailerUrl += "&startDate=" + $scope.startDate;
                closedCountMailerUrl += "&startDate=" + $scope.startDate;
                cancelledCountMailerUrl += "&startDate=" + $scope.startDate;             
            }
            if ($scope.endDate) {
                allCountMailerUrl += "&endDate=" + $scope.endDate;
                newCountMailerUrl += "&endDate=" + $scope.endDate;
                processCountMailerUrl += "&endDate=" + $scope.endDate;
                holdCountMailerUrl += "&endDate=" + $scope.endDate;
                closedCountMailerUrl += "&endDate=" + $scope.endDate;
                cancelledCountMailerUrl += "&endDate=" + $scope.endDate;            
            }

            console.log("ALL COUNT URL");
            console.log(allCountMailerUrl);
            console.log("NEW COUNT URL");
            console.log(newCountMailerUrl);
            console.log("PROCESS COUNT URL");
            console.log(processCountMailerUrl);
            console.log("HOLD COUNT URL");
            console.log(holdCountMailerUrl);
            console.log("ClOSED COUNT URL");
            console.log(closedCountMailerUrl);
            console.log("CANCELLED COUNT URL");
            console.log(cancelledCountMailerUrl);


            console.log(tabsValue);
            $http.get(allCountMailerUrl).success(function(data) {
                $scope.allCountMailer = data;
                if (data != null) {
                    if (tabsValue == 'all') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.allCountMailer); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoMailerStart = vm.pager;

                        $scope.allworkOrderMailerStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderMailerSize = $scope.allworkOrderMailerStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedMailer(0,$scope.allworkOrderMailerStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });

            $http.get(newCountMailerUrl).success(function(data) {
                $scope.newCountMailer = data;
                if (data != null) {
                    if (tabsValue == 'new') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.newCountMailer); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoMailerStart = vm.pager;

                        $scope.allworkOrderMailerStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderMailerSize = $scope.allworkOrderMailerStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedMailer(1,$scope.allworkOrderMailerStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });

            $http.get(processCountMailerUrl).success(function(data) {
                console.log(data);
                $scope.processCountMailer = data;
                if (data != null) {
                    if (tabsValue == 'process') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.processCountMailer); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoMailerStart = vm.pager;

                        $scope.allworkOrderMailerStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderMailerSize = $scope.allworkOrderMailerStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedMailer(2,$scope.allworkOrderMailerStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });

            $http.get(holdCountMailerUrl).success(function(data) {
                $scope.holdCountMailer = data;
                if (data != null) {
                    if (tabsValue == 'hold') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.holdCountMailer); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoMailerStart = vm.pager;

                        $scope.allworkOrderMailerStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderMailerSize = $scope.allworkOrderMailerStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedMailer(3,$scope.allworkOrderMailerStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });


            $http.get(closedCountMailerUrl).success(function(data) {
                $scope.closedCountMailer = data;
                if (data != null) {
                    if (tabsValue == 'closed') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.closedCountMailer); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoMailerStart = vm.pager;

                        $scope.allworkOrderMailerStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderMailerSize = $scope.allworkOrderMailerStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedMailer(4,$scope.allworkOrderMailerStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });


            $http.get(cancelledCountMailerUrl).success(function(data) {
                $scope.cancelledCountMailer = data;
                if (data != null) {
                    if (tabsValue == 'cancelled') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.cancelledCountMailer); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoMailerStart = vm.pager;

                        $scope.allworkOrderMailerStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderMailerSize = $scope.allworkOrderMailerStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedMailer(5,$scope.allworkOrderMailerStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });
        }
        //fetching list of workorder mailer count ends here


    //fetching list of workorder qc count
    $scope.listOfWorkOrderQcCount = function(tabsValue,page) {


            $scope.defaultTabQc = tabsValue;
            $scope.allCountQc = 0;
            $scope.newCountQc = 0;
            $scope.processCountQc = 0;
            $scope.holdCountQc = 0;
            $scope.closedCountQc = 0;
            $scope.cancelledCountQc = 0;

            var allCountQcUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=6&workorderstatus=0";       
            var newCountQcUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=6&workorderstatus=1";
            var processCountQcUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=6&workorderstatus=2";
            var holdCountQcUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=6&workorderstatus=3";
            var closedCountQcUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=6&workorderstatus=4";
            var cancelledCountQcUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=6&workorderstatus=5";        
            
            if ($scope.warehouseid) {
                allCountQcUrl += "&warehouse=" + $scope.warehouseid;
                newCountQcUrl += "&warehouse=" + $scope.warehouseid;
                processCountQcUrl += "&warehouse=" + $scope.warehouseid;
                holdCountQcUrl += "&warehouse=" + $scope.warehouseid;
                closedCountQcUrl += "&warehouse=" + $scope.warehouseid;
                cancelledCountQcUrl += "&warehouse=" + $scope.warehouseid; 
            }
            if ($scope.startDate) {
                allCountQcUrl += "&startDate=" + $scope.startDate;
                newCountQcUrl += "&startDate=" + $scope.startDate;
                processCountQcUrl += "&startDate=" + $scope.startDate;
                holdCountQcUrl += "&startDate=" + $scope.startDate;
                closedCountQcUrl += "&startDate=" + $scope.startDate;
                cancelledCountQcUrl += "&startDate=" + $scope.startDate;             
            }
            if ($scope.endDate) {
                allCountQcUrl += "&endDate=" + $scope.endDate;
                newCountQcUrl += "&endDate=" + $scope.endDate;
                processCountQcUrl += "&endDate=" + $scope.endDate;
                holdCountQcUrl += "&endDate=" + $scope.endDate;
                closedCountQcUrl += "&endDate=" + $scope.endDate;
                cancelledCountQcUrl += "&endDate=" + $scope.endDate;            
            }

            console.log("ALL COUNT URL");
            console.log(allCountQcUrl);
            console.log("NEW COUNT URL");
            console.log(newCountQcUrl);
            console.log("PROCESS COUNT URL");
            console.log(processCountQcUrl);
            console.log("HOLD COUNT URL");
            console.log(holdCountQcUrl);
            console.log("ClOSED COUNT URL");
            console.log(closedCountQcUrl);
            console.log("CANCELLED COUNT URL");
            console.log(cancelledCountQcUrl);


            console.log(tabsValue);
            $http.get(allCountQcUrl).success(function(data) {
                $scope.allCountQc = data;
                if (data != null) {
                    if (tabsValue == 'all') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.allCountQc); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoQcStart = vm.pager;

                        $scope.allworkOrderQcStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderQcSize = $scope.allworkOrderQcStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedQc(0,$scope.allworkOrderQcStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });

            $http.get(newCountQcUrl).success(function(data) {
                $scope.newCountQc = data;
                if (data != null) {
                    if (tabsValue == 'new') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.newCountQc); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoQcStart = vm.pager;

                        $scope.allworkOrderQcStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderQcSize = $scope.allworkOrderQcStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedQc(1,$scope.allworkOrderQcStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });

            $http.get(processCountQcUrl).success(function(data) {
                console.log(data);
                $scope.processCountQc = data;
                if (data != null) {
                    if (tabsValue == 'process') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.processCountQc); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoQcStart = vm.pager;

                        $scope.allworkOrderQcStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderQcSize = $scope.allworkOrderQcStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedQc(2,$scope.allworkOrderQcStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });

            $http.get(holdCountQcUrl).success(function(data) {
                $scope.holdCountQc = data;
                if (data != null) {
                    if (tabsValue == 'hold') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.holdCountQc); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoQcStart = vm.pager;

                        $scope.allworkOrderQcStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderQcSize = $scope.allworkOrderQcStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedQc(3,$scope.allworkOrderQcStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });


            $http.get(closedCountQcUrl).success(function(data) {
                $scope.closedCountQc = data;
                if (data != null) {
                    if (tabsValue == 'closed') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.closedCountQc); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoQcStart = vm.pager;

                        $scope.allworkOrderQcStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderQcSize = $scope.allworkOrderQcStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedQc(4,$scope.allworkOrderQcStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });


            $http.get(cancelledCountQcUrl).success(function(data) {
                $scope.cancelledCountQc = data;
                if (data != null) {
                    if (tabsValue == 'cancelled') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.cancelledCountQc); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoQcStart = vm.pager;

                        $scope.allworkOrderQcStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderQcSize = $scope.allworkOrderQcStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedQc(5,$scope.allworkOrderQcStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });
        }
        //fetching list of workorder qc count ends here

    //fetching list of workorder stock count
    $scope.listOfWorkOrderStockCount = function(tabsValue,page) {


            $scope.defaultTabStock = tabsValue;
            $scope.allCountStock = 0;
            $scope.newCountStock = 0;
            $scope.processCountStock = 0;
            $scope.holdCountStock = 0;
            $scope.closedCountStock = 0;
            $scope.cancelledCountStock = 0;

            var allCountStockUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=7&workorderstatus=0";       
            var newCountStockUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=7&workorderstatus=1";
            var processCountStockUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=7&workorderstatus=2";
            var holdCountStockUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=7&workorderstatus=3";
            var closedCountStockUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=7&workorderstatus=4";
            var cancelledCountStockUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=7&workorderstatus=5";        
            
            if ($scope.warehouseid) {
                allCountStockUrl += "&warehouse=" + $scope.warehouseid;
                newCountStockUrl += "&warehouse=" + $scope.warehouseid;
                processCountStockUrl += "&warehouse=" + $scope.warehouseid;
                holdCountStockUrl += "&warehouse=" + $scope.warehouseid;
                closedCountStockUrl += "&warehouse=" + $scope.warehouseid;
                cancelledCountStockUrl += "&warehouse=" + $scope.warehouseid; 
            }
            if ($scope.startDate) {
                allCountStockUrl += "&startDate=" + $scope.startDate;
                newCountStockUrl += "&startDate=" + $scope.startDate;
                processCountStockUrl += "&startDate=" + $scope.startDate;
                holdCountStockUrl += "&startDate=" + $scope.startDate;
                closedCountStockUrl += "&startDate=" + $scope.startDate;
                cancelledCountStockUrl += "&startDate=" + $scope.startDate;             
            }
            if ($scope.endDate) {
                allCountStockUrl += "&endDate=" + $scope.endDate;
                newCountStockUrl += "&endDate=" + $scope.endDate;
                processCountStockUrl += "&endDate=" + $scope.endDate;
                holdCountStockUrl += "&endDate=" + $scope.endDate;
                closedCountStockUrl += "&endDate=" + $scope.endDate;
                cancelledCountStockUrl += "&endDate=" + $scope.endDate;            
            }

            console.log("ALL COUNT URL");
            console.log(allCountStockUrl);
            console.log("NEW COUNT URL");
            console.log(newCountStockUrl);
            console.log("PROCESS COUNT URL");
            console.log(processCountStockUrl);
            console.log("HOLD COUNT URL");
            console.log(holdCountStockUrl);
            console.log("ClOSED COUNT URL");
            console.log(closedCountStockUrl);
            console.log("CANCELLED COUNT URL");
            console.log(cancelledCountStockUrl);


            console.log(tabsValue);
            $http.get(allCountStockUrl).success(function(data) {
                $scope.allCountStock = data;
                if (data != null) {
                    if (tabsValue == 'all') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.allCountStock); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoStockStart = vm.pager;

                        $scope.allworkOrderStockStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderStockSize = $scope.allworkOrderStockStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedStock(0,$scope.allworkOrderStockStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });

            $http.get(newCountStockUrl).success(function(data) {
                $scope.newCountStock = data;
                if (data != null) {
                    if (tabsValue == 'new') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.newCountStock); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoStockStart = vm.pager;

                        $scope.allworkOrderStockStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderStockSize = $scope.allworkOrderStockStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedStock(1,$scope.allworkOrderStockStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });

            $http.get(processCountStockUrl).success(function(data) {
                console.log(data);
                $scope.processCountStock = data;
                if (data != null) {
                    if (tabsValue == 'process') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.processCountStock); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoStockStart = vm.pager;

                        $scope.allworkOrderStockStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderStockSize = $scope.allworkOrderStockStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedStock(2,$scope.allworkOrderStockStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });

            $http.get(holdCountStockUrl).success(function(data) {
                $scope.holdCountStock = data;
                if (data != null) {
                    if (tabsValue == 'hold') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.holdCountStock); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoStockStart = vm.pager;

                        $scope.allworkOrderStockStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderStockSize = $scope.allworkOrderStockStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedStock(3,$scope.allworkOrderStockStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });


            $http.get(closedCountStockUrl).success(function(data) {
                $scope.closedCountStock = data;
                if (data != null) {
                    if (tabsValue == 'closed') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.closedCountStock); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoStockStart = vm.pager;

                        $scope.allworkOrderStockStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderStockSize = $scope.allworkOrderStockStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedStock(4,$scope.allworkOrderStockStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });


            $http.get(cancelledCountStockUrl).success(function(data) {
                $scope.cancelledCountStock = data;
                if (data != null) {
                    if (tabsValue == 'cancelled') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.cancelledCountStock); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoStockStart = vm.pager;

                        $scope.allworkOrderStockStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderStockSize = $scope.allworkOrderStockStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedStock(5,$scope.allworkOrderStockStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });
        }
        //fetching list of workorder stock count ends here

    //fetching list of workorder sticker count
    $scope.listOfWorkOrderStickerCount = function(tabsValue,page) {


            $scope.defaultTabSticker = tabsValue;
            $scope.allCountSticker = 0;
            $scope.newCountSticker = 0;
            $scope.processCountSticker = 0;
            $scope.holdCountSticker = 0;
            $scope.closedCountSticker = 0;
            $scope.cancelledCountSticker = 0;

            var allCountStickerUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=8&workorderstatus=0";       
            var newCountStickerUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=8&workorderstatus=1";
            var processCountStickerUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=8&workorderstatus=2";
            var holdCountStickerUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=8&workorderstatus=3";
            var closedCountStickerUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=8&workorderstatus=4";
            var cancelledCountStickerUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder/filtercount?workordertype=8&workorderstatus=5";        
            
            if ($scope.warehouseid) {
                allCountStickerUrl += "&warehouse=" + $scope.warehouseid;
                newCountStickerUrl += "&warehouse=" + $scope.warehouseid;
                processCountStickerUrl += "&warehouse=" + $scope.warehouseid;
                holdCountStickerUrl += "&warehouse=" + $scope.warehouseid;
                closedCountStickerUrl += "&warehouse=" + $scope.warehouseid;
                cancelledCountStickerUrl += "&warehouse=" + $scope.warehouseid; 
            }
            if ($scope.startDate) {
                allCountStickerUrl += "&startDate=" + $scope.startDate;
                newCountStickerUrl += "&startDate=" + $scope.startDate;
                processCountStickerUrl += "&startDate=" + $scope.startDate;
                holdCountStickerUrl += "&startDate=" + $scope.startDate;
                closedCountStickerUrl += "&startDate=" + $scope.startDate;
                cancelledCountStickerUrl += "&startDate=" + $scope.startDate;             
            }
            if ($scope.endDate) {
                allCountStickerUrl += "&endDate=" + $scope.endDate;
                newCountStickerUrl += "&endDate=" + $scope.endDate;
                processCountStickerUrl += "&endDate=" + $scope.endDate;
                holdCountStickerUrl += "&endDate=" + $scope.endDate;
                closedCountStickerUrl += "&endDate=" + $scope.endDate;
                cancelledCountStickerUrl += "&endDate=" + $scope.endDate;            
            }

            console.log("ALL COUNT URL");
            console.log(allCountStickerUrl);
            console.log("NEW COUNT URL");
            console.log(newCountStickerUrl);
            console.log("PROCESS COUNT URL");
            console.log(processCountStickerUrl);
            console.log("HOLD COUNT URL");
            console.log(holdCountStickerUrl);
            console.log("ClOSED COUNT URL");
            console.log(closedCountStickerUrl);
            console.log("CANCELLED COUNT URL");
            console.log(cancelledCountStickerUrl);


            console.log(tabsValue);
            $http.get(allCountStickerUrl).success(function(data) {
                $scope.allCountSticker = data;
                if (data != null) {
                    if (tabsValue == 'all') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.allCountSticker); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoStickerStart = vm.pager;

                        $scope.allworkOrderStickerStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderStickerSize = $scope.allworkOrderStickerStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedSticker(0,$scope.allworkOrderStickerStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });

            $http.get(newCountStickerUrl).success(function(data) {
                $scope.newCountSticker = data;
                if (data != null) {
                    if (tabsValue == 'new') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.newCountSticker); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoStickerStart = vm.pager;

                        $scope.allworkOrderStickerStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderStickerSize = $scope.allworkOrderStickerStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedSticker(1,$scope.allworkOrderStickerStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });

            $http.get(processCountStickerUrl).success(function(data) {
                console.log(data);
                $scope.processCountSticker = data;
                if (data != null) {
                    if (tabsValue == 'process') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.processCountSticker); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoStickerStart = vm.pager;

                        $scope.allworkOrderStickerStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderStickerSize = $scope.allworkOrderStickerStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedSticker(2,$scope.allworkOrderStickerStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });

            $http.get(holdCountStickerUrl).success(function(data) {
                $scope.holdCountSticker = data;
                if (data != null) {
                    if (tabsValue == 'hold') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.holdCountSticker); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoStickerStart = vm.pager;

                        $scope.allworkOrderStickerStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderStickerSize = $scope.allworkOrderStickerStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedSticker(3,$scope.allworkOrderStickerStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });


            $http.get(closedCountStickerUrl).success(function(data) {
                $scope.closedCountSticker = data;
                if (data != null) {
                    if (tabsValue == 'closed') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.closedCountSticker); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoStickerStart = vm.pager;

                        $scope.allworkOrderStickerStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderStickerSize = $scope.allworkOrderStickerStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedSticker(4,$scope.allworkOrderStickerStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });


            $http.get(cancelledCountStickerUrl).success(function(data) {
                $scope.cancelledCountSticker = data;
                if (data != null) {
                    if (tabsValue == 'cancelled') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.cancelledCountSticker); // dummy array of items to be paged
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
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPagerWoStickerStart = vm.pager;

                        $scope.allworkOrderStickerStart = (vm.pager.currentPage - 1) * 5;
                        $scope.allworkOrderStickerSize = $scope.allworkOrderStickerStart + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfWorkOrdersCreatedSticker(5,$scope.allworkOrderStickerStart);
                    }
                }
                }
            }).error(function(error, status) {
    
    

            });
        }
        //fetching list of workorder sticker count ends here

    // fetching list of inventories from RestAPI OMS
    $scope.listOfInventories = function(start) {
            var inventoryListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/inventory";
            inventoryListUrl += "?start=" + start + '&size=5&sort=tableSkuInventoryCreationDate&direction=desc';
            if ($scope.warehouseid) {
                inventoryListUrl += "&warehouseid=" + $scope.warehouseid;
            }
            if ($scope.skuid) {
                inventoryListUrl += "&skuid=" + $scope.skuid;
            }
            if ($scope.startDate) {
                inventoryListUrl += "&startDate=" + $scope.startDate;
            }
            if ($scope.endDate) {
                inventoryListUrl += "&endDate=" + $scope.endDate;
            }
            $http.get(inventoryListUrl).success(function(data) {
                $scope.inventoryLists = data;
            }).error(function(error, status) {
    
    

            });
        }
        //inventory code ends here


    //Different Submit Actions for Inventories,Work Order Types..
    //submit Action for Inventory screen when clicking on submit button in main inventory screen
    $scope.submitInventoryAction = function(wid, skuid, startDate, endDate) {
        if (wid != undefined) {
            $scope.warehouseid = wid;
        }
        if (skuid != undefined) {
            $scope.skuid = skuid;
        }
        if (startDate != undefined) {
            $scope.startDate = moment.utc(startDate).format();
        }
        if (endDate != undefined) {
            $scope.endDate = moment.utc(endDate).format();
        }
        $scope.start = 0;
        // $scope.listOfInventories();
        var page = undefined;
        $scope.isSubmitDisabledInv = true;
        $scope.isResetDisabledInv = false;
        $scope.listOfInventoriesCount(page);
    }

    $scope.clearActionInv = function() {
        $scope.warehouseid = undefined;
        $scope.skuid = "";
        $scope.startDate = "";
        $scope.endDate = "";
        $scope.start1Date = undefined;
        $scope.end1Date = undefined;
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        $scope.start = 0;
        var page = undefined;
        $scope.isSubmitDisabledInv = true;
        $scope.isResetDisabledInv = false;        
        $scope.listOfInventoriesCount(page);
    }
    $scope.submitListWorkOrderAction = function(wid, startDate, endDate) {
        if (wid != undefined) {
            $scope.warehouseid = wid;
        }
        if (startDate != undefined) {
            $scope.startDate = moment.utc(startDate).format();
        }
        if (endDate != undefined) {
            $scope.endDate = moment.utc(endDate).format();
        }
        $scope.allworkOrderStart = 0;
        // $scope.listOfWorkOrders();
        var page = undefined;
        $scope.isSubmitDisabledListWo = true;
        $scope.isResetDisabledListWo = false;
        $scope.listOfWorkOrderCount(page);
    }

    //clear filter after applying
    $scope.clearAction = function() {
        $scope.warehouseid = undefined;
        $scope.startDate = "";
        $scope.endDate = "";
        $scope.start1Date = undefined;
        $scope.end1Date = undefined;
        $scope.allworkOrderStart = 0;
        // $scope.listOfWorkOrders();
        var page = undefined;
        $scope.listOfWorkOrderCount(page);
    }

    $scope.submitWorkOrderKitAction = function(wid, startDate, endDate) {
        if (wid != undefined) {
            $scope.warehouseid = wid;
        }
        if (startDate != undefined) {
            $scope.startDate = moment.utc(startDate).format();
        }
        if (endDate != undefined) {
            $scope.endDate = moment.utc(endDate).format();
        }
        $scope.allworkOrderKitStart = 0;
        // $scope.listOfWorkOrdersCreatedKit();
        $scope.isSubmitDisabledKit = true;
        $scope.isResetDisabledKit = false;
        var page = undefined;
        $scope.listOfWorkOrderKitCount($scope.defaultTabKit,page);
    }

    //clear filter after applying
    $scope.clearAction1 = function() {
        $scope.warehouseid = undefined;
        $scope.startDate = "";
        $scope.endDate = "";
        $scope.start1Date = undefined;
        $scope.end1Date = undefined;
        $scope.allworkOrderKitStart = 0;
        // $scope.listOfWorkOrdersCreatedKit();
        $scope.isSubmitDisabledKit = true;
        $scope.isResetDisabledKit = false;        
        var page = undefined;
        $scope.listOfWorkOrderKitCount($scope.defaultTabKit,page);
    }

    $scope.submitWorkOrderSplitAction = function(wid, startDate, endDate) {
        if (wid != undefined) {
            $scope.warehouseid = wid;
        }
        if (startDate != undefined) {
            $scope.startDate = moment.utc(startDate).format();
        }
        if (endDate != undefined) {
            $scope.endDate = moment.utc(endDate).format();
        }
        $scope.allworkOrderSplitStart = 0;
        // $scope.listOfWorkOrdersCreatedSplit();
        $scope.isSubmitDisabledSplit = true;
        $scope.isResetDisabledSplit = false;        
        var page = undefined;
        $scope.listOfWorkOrderSplitCount($scope.defaultTabSplit,page);
    }

    //clear filter after applying
    $scope.clearAction2 = function() {
        $scope.warehouseid = undefined;
        $scope.startDate = "";
        $scope.endDate = "";
        $scope.start1Date = undefined;
        $scope.end1Date = undefined;
        $scope.allworkOrderSplitStart = 0;
        // $scope.listOfWorkOrdersCreatedSplit();
        $scope.isSubmitDisabledSplit = true;
        $scope.isResetDisabledSplit = false;        
        var page = undefined;
        $scope.listOfWorkOrderSplitCount($scope.defaultTabSplit,page);
    }

    $scope.submitWorkOrderMailerAction = function(wid, startDate, endDate) {
        if (wid != undefined) {
            $scope.warehouseid = wid;
        }
        if (startDate != undefined) {
            $scope.startDate = moment.utc(startDate).format();
        }
        if (endDate != undefined) {
            $scope.endDate = moment.utc(endDate).format();
        }
        $scope.allworkOrderMailerStart = 0;
        // $scope.listOfWorkOrdersCreatedMailer();
        $scope.isSubmitDisabledMailer = true;
        $scope.isResetDisabledMailer = false;        
        var page = undefined;
        $scope.listOfWorkOrderMailerCount($scope.defaultTabMailer,page);
    }

    //clear filter after applying
    $scope.clearAction3 = function() {
        $scope.warehouseid = undefined;
        $scope.startDate = "";
        $scope.endDate = "";
        $scope.start1Date = undefined;
        $scope.end1Date = undefined;
        $scope.allworkOrderMailerStart = 0;
        // $scope.listOfWorkOrdersCreatedMailer();
        $scope.isSubmitDisabledMailer = true;
        $scope.isResetDisabledMailer = false;        
        var page = undefined;
        $scope.listOfWorkOrderMailerCount($scope.defaultTabMailer,page);
    }

    $scope.submitWorkOrderQcAction = function(wid, startDate, endDate) {
        if (wid != undefined) {
            $scope.warehouseid = wid;
        }
        if (startDate != undefined) {
            $scope.startDate = moment.utc(startDate).format();
        }
        if (endDate != undefined) {
            $scope.endDate = moment.utc(endDate).format();
        }
        $scope.allworkOrderQcStart = 0;
        // $scope.listOfWorkOrdersCreatedQc();
        $scope.isSubmitDisabledQc = true;
        $scope.isResetDisabledQc = false;        
        var page = undefined;
        $scope.listOfWorkOrderQcCount($scope.defaultTabQc,page);
    }

    //clear filter after applying
    $scope.clearAction4 = function() {
        $scope.warehouseid = undefined;
        $scope.startDate = "";
        $scope.endDate = "";
        $scope.start1Date = undefined;
        $scope.end1Date = undefined;
        $scope.allworkOrderQcStart = 0;
        // $scope.listOfWorkOrdersCreatedQc();
        $scope.isSubmitDisabledQc = true;
        $scope.isResetDisabledQc = false;        
        var page = undefined;
        $scope.listOfWorkOrderQcCount($scope.defaultTabQc,page);
    }

    $scope.submitWorkOrderStockAction = function(wid, startDate, endDate) {
        if (wid != undefined) {
            $scope.warehouseid = wid;
        }
        if (startDate != undefined) {
            $scope.startDate = moment.utc(startDate).format();
        }
        if (endDate != undefined) {
            $scope.endDate = moment.utc(endDate).format();
        }
        $scope.allworkOrderStockStart = 0;
        // $scope.listOfWorkOrdersCreatedStock();
        $scope.isSubmitDisabledStock = true;
        $scope.isResetDisabledStock = false;        
        var page = undefined;
        $scope.listOfWorkOrderStockCount($scope.defaultTabStock,page);
    }

    //clear filter after applying
    $scope.clearAction5 = function() {
        $scope.warehouseid = undefined;
        $scope.startDate = "";
        $scope.endDate = "";
        $scope.start1Date = undefined;
        $scope.end1Date = undefined;
        $scope.allworkOrderStockStart = 0;
        // $scope.listOfWorkOrdersCreatedStock();
        $scope.isSubmitDisabledStock = true;
        $scope.isResetDisabledStock = false;        
        var page = undefined;
        $scope.listOfWorkOrderStockCount($scope.defaultTabStock,page);
    }

    $scope.submitWorkOrderStickerAction = function(wid, startDate, endDate) {
        if (wid != undefined) {
            $scope.warehouseid = wid;
        }
        if (startDate != undefined) {
            $scope.startDate = moment.utc(startDate).format();
        }
        if (endDate != undefined) {
            $scope.endDate = moment.utc(endDate).format();
        }
        $scope.allworkOrderStickerStart = 0;
        // $scope.listOfWorkOrdersCreatedSticker();
        $scope.isSubmitDisabledSticker = true;
        $scope.isResetDisabledSticker = false;        
        var page = undefined;
        $scope.listOfWorkOrderStickerCount($scope.defaultTabSticker,page);
    }

    //clear filter after applying
    $scope.clearAction6 = function() {
        $scope.warehouseid = undefined;
        $scope.startDate = "";
        $scope.endDate = "";
        $scope.start1Date = undefined;
        $scope.end1Date = undefined;
        $scope.allworkOrderStickerStart = 0;
        // $scope.listOfWorkOrdersCreatedSticker();
        $scope.isSubmitDisabledSticker = true;
        $scope.isResetDisabledSticker = false;        
        var page = undefined;
        $scope.listOfWorkOrderStickerCount($scope.defaultTabSticker,page);
    }

    // fetching list of all work orders from RestAPI OMS
    $scope.listOfWorkOrders = function(workOrderStatus,start) {
            console.log(workOrderStatus)
            var workOrdersListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder";
            workOrdersListUrl += "?start=" + start + '&size=5&sort=tableWorkOrderDatetime&direction=desc&workorderstatus='+workOrderStatus;

            if ($scope.warehouseid) {
                workOrdersListUrl += "&warehouse=" + $scope.warehouseid;
            }
            if ($scope.startDate) {
                workOrdersListUrl += "&startDate=" + $scope.startDate;
            }
            if ($scope.endDate) {
                workOrdersListUrl += "&endDate=" + $scope.endDate;
            }

            if (workOrderStatus == 0) {
            $scope.tabsColor = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColor1 = {};
            $scope.tabsColor2 = {};
            $scope.tabsColor3 = {};
            $scope.tabsColor4 = {};
            $scope.tabsColor5 = {};
            $scope.tabsColor6 = {};            
        }
        if (workOrderStatus == 1) {
            $scope.tabsColor1 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColor = {}
            $scope.tabsColor2 = {}
            $scope.tabsColor3 = {}
            $scope.tabsColor4 = {}
            $scope.tabsColor5 = {}
            $scope.tabsColor6 = {}            
        }
        if (workOrderStatus == 2) {
            $scope.tabsColor2 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColor = {}
            $scope.tabsColor1 = {}
            $scope.tabsColor3 = {}
            $scope.tabsColor4 = {}
            $scope.tabsColor5 = {}
            $scope.tabsColor6 = {}            
        }


        if (workOrderStatus == 3) {
            $scope.tabsColor3 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColor = {}
            $scope.tabsColor1 = {}
            $scope.tabsColor2 = {}
            $scope.tabsColor3 = {}
            $scope.tabsColor4 = {}
            $scope.tabsColor6 = {}            
        }

        if (workOrderStatus == 4) {
            $scope.tabsColor4 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColor = {}
            $scope.tabsColor1 = {}
            $scope.tabsColor2 = {}
            $scope.tabsColor3 = {}
            $scope.tabsColor4 = {}
            $scope.tabsColor6 = {}            
        }
        if (workOrderStatus == 5) {
            $scope.tabsColor5 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColor = {}
            $scope.tabsColor1 = {}
            $scope.tabsColor2 = {}
            $scope.tabsColor3 = {}
            $scope.tabsColor4 = {}
            $scope.tabsColor5 = {}            
        }

            $http.get(workOrdersListUrl).success(function(data) {
                $scope.workOrderLists = data;
                $scope.dayDataCollapse = [];

                for (var i = 0; i < $scope.workOrderLists.length; i += 1) {
                    $scope.dayDataCollapse.push(false);
                }                
            }).error(function(error, status) {
    
    

            });
        }
        // list of all work orders code ends here


    //expansion and collapsing of kit rows data
    $scope.tableRowExpandedKit = false;
    $scope.tableRowIndexExpandedCurrKit = "";
    $scope.tableRowIndexExpandedPrevKit = "";
    $scope.storeIdExpandedKit = "";

    $scope.dayDataCollapseFnKit = function() {
        $scope.dayDataCollapseKit = [];

        for (var i = 0; i < $scope.workOrderkitLists.length; i += 1) {
            $scope.dayDataCollapseKit.push(false);
        }
    };

    $scope.selectTableRowKit = function(indexKit, storeIdKit) {
        console.log(storeIdKit);
        if (typeof $scope.dayDataCollapseKit === 'undefined') {
            $scope.dayDataCollapseFnKit();
        }

        if ($scope.tableRowExpandedKit === false && $scope.tableRowIndexExpandedCurrKit === "" && $scope.storeIdExpandedKit === "") {
            $scope.tableRowIndexExpandedPrevKit = "";
            $scope.tableRowExpandedKit = true;
            $scope.tableRowIndexExpandedCurrKit = indexKit;
            $scope.storeIdExpandedKit = storeIdKit;
            $scope.dayDataCollapseKit[indexKit] = true;
        } else if ($scope.tableRowExpandedKit === true) {
            if ($scope.tableRowIndexExpandedCurrKit === indexKit && $scope.storeIdExpandedKit === storeIdKit) {
                $scope.tableRowExpandedKit = false;
                $scope.tableRowIndexExpandedCurrKit = "";
                $scope.storeIdExpandedKit = "";
                $scope.dayDataCollapseKit[indexKit] = false;
            } else {
                $scope.tableRowIndexExpandedPrevKit = $scope.tableRowIndexExpandedCurrKit;
                $scope.tableRowIndexExpandedCurrKit = indexKit;
                $scope.storeIdExpandedKit = storeIdKit;
                $scope.dayDataCollapseKit[$scope.tableRowIndexExpandedPrevKit] = false;
                $scope.dayDataCollapseKit[$scope.tableRowIndexExpandedCurrKit] = true;
            }
        }
    };

    // fetching list of work orders - created kit from RestAPI OMS
    $scope.listOfWorkOrdersCreatedKit = function(workOrderStatus,start) {
            var workOrderskitListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder?workordertype=1&workorderstatus="+workOrderStatus;
            workOrderskitListUrl += "&start=" + start + '&size=5&sort=tableWorkOrderDatetime&direction=desc';

            if ($scope.warehouseid) {
                workOrderskitListUrl += "&warehouse=" + $scope.warehouseid;
            }
            if ($scope.startDate) {
                workOrderskitListUrl += "&startDate=" + $scope.startDate;
            }
            if ($scope.endDate) {
                workOrderskitListUrl += "&endDate=" + $scope.endDate;
            }

        if (workOrderStatus == 0) {
            $scope.tabsColorKit = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorKit1 = {};
            $scope.tabsColorKit2 = {};
            $scope.tabsColorKit3 = {};
            $scope.tabsColorKit4 = {};
            $scope.tabsColorKit5 = {};
            $scope.tabsColorKit6 = {};
        }
        if (workOrderStatus == 1) {
            $scope.tabsColorKit1 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorKit = {}
            $scope.tabsColorKit2 = {}
            $scope.tabsColorKit3 = {}
            $scope.tabsColorKit4 = {}
            $scope.tabsColorKit5 = {}
            $scope.tabsColorKit6 = {}            
        }
        if (workOrderStatus == 2) {
            $scope.tabsColorKit2 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorKit = {}
            $scope.tabsColorKit1 = {}
            $scope.tabsColorKit3 = {}
            $scope.tabsColorKit4 = {}
            $scope.tabsColorKit5 = {}
            $scope.tabsColorKit6 = {}            
        }


        if (workOrderStatus == 3) {
            $scope.tabsColorKit3 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorKit = {}
            $scope.tabsColorKit1 = {}
            $scope.tabsColorKit2 = {}
            $scope.tabsColorKit3 = {}
            $scope.tabsColorKit4 = {}
            $scope.tabsColorKit6 = {}            
        }

        if (workOrderStatus == 4) {
            $scope.tabsColorKit4 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorKit = {}
            $scope.tabsColorKit1 = {}
            $scope.tabsColorKit2 = {}
            $scope.tabsColorKit3 = {}
            $scope.tabsColorKit4 = {}
            $scope.tabsColorKit6 = {}            
        }
        if (workOrderStatus == 5) {
            $scope.tabsColorKit5 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorKit = {}
            $scope.tabsColorKit1 = {}
            $scope.tabsColorKit2 = {}
            $scope.tabsColorKit3 = {}
            $scope.tabsColorKit4 = {}
            $scope.tabsColorKit5 = {}            
        }


            console.log(workOrderskitListUrl);
            $http.get(workOrderskitListUrl).success(function(data) {
                console.log(data);
                $scope.workOrderkitLists = data;
                $scope.dayDataCollapseKit = [];

                for (var i = 0; i < $scope.workOrderkitLists.length; i += 1) {
                    $scope.dayDataCollapseKit.push(false);
                }          
            }).error(function(error, status) {
    
    

            });
        }
        // list of work orders create kit code ends here

    //expansion and collapsing of split rows data
    $scope.tableRowExpandedSplit = false;
    $scope.tableRowIndexExpandedCurrSplit = "";
    $scope.tableRowIndexExpandedPrevSplit = "";
    $scope.storeIdExpandedSplit = "";

    $scope.dayDataCollapseFnSplit = function() {
        $scope.dayDataCollapseSplit = [];

        for (var i = 0; i < $scope.workOrdersplitLists.length; i += 1) {
            $scope.dayDataCollapseSplit.push(false);
        }
    };

    $scope.selectTableRowSplit = function(indexSplit, storeIdSplit) {
        console.log(storeIdSplit);
        if (typeof $scope.dayDataCollapseSplit === 'undefined') {
            $scope.dayDataCollapseFnSplit();
        }

        if ($scope.tableRowExpandedSplit === false && $scope.tableRowIndexExpandedCurrSplit === "" && $scope.storeIdExpandedSplit === "") {
            $scope.tableRowIndexExpandedPrevSplit = "";
            $scope.tableRowExpandedSplit = true;
            $scope.tableRowIndexExpandedCurrSplit = indexSplit;
            $scope.storeIdExpandedSplit = storeIdSplit;
            $scope.dayDataCollapseSplit[indexSplit] = true;
        } else if ($scope.tableRowExpandedSplit === true) {
            if ($scope.tableRowIndexExpandedCurrSplit === indexSplit && $scope.storeIdExpandedSplit === storeIdSplit) {
                $scope.tableRowExpandedSplit = false;
                $scope.tableRowIndexExpandedCurrSplit = "";
                $scope.storeIdExpandedSplit = "";
                $scope.dayDataCollapseSplit[indexSplit] = false;
            } else {
                $scope.tableRowIndexExpandedPrevSplit = $scope.tableRowIndexExpandedCurrSplit;
                $scope.tableRowIndexExpandedCurrSplit = indexSplit;
                $scope.storeIdExpandedSplit = storeIdSplit;
                $scope.dayDataCollapseSplit[$scope.tableRowIndexExpandedPrevSplit] = false;
                $scope.dayDataCollapseSplit[$scope.tableRowIndexExpandedCurrSplit] = true;
            }
        }
    };

    // fetching list of work orders - created split from RestAPI OMS
    $scope.listOfWorkOrdersCreatedSplit = function(workOrderStatus,start) {
            var workOrderssplitListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder?workordertype=2&workorderstatus="+workOrderStatus;

            workOrderssplitListUrl += "&start=" + start + '&size=5&sort=tableWorkOrderDatetime&direction=desc';

            if ($scope.warehouseid) {
                workOrderssplitListUrl += "&warehouse=" + $scope.warehouseid;
            }
            if ($scope.startDate) {
                workOrderssplitListUrl += "&startDate=" + $scope.startDate;
            }
            if ($scope.endDate) {
                workOrderssplitListUrl += "&endDate=" + $scope.endDate;
            }

        if (workOrderStatus == 0) {
            $scope.tabsColorSplit = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorSplit1 = {};
            $scope.tabsColorSplit2 = {};
            $scope.tabsColorSplit3 = {};
            $scope.tabsColorSplit4 = {};
            $scope.tabsColorSplit5 = {};
            $scope.tabsColorSplit6 = {};
        }
        if (workOrderStatus == 1) {
            $scope.tabsColorSplit1 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorSplit = {}
            $scope.tabsColorSplit2 = {}
            $scope.tabsColorSplit3 = {}
            $scope.tabsColorSplit4 = {}
            $scope.tabsColorSplit5 = {}
            $scope.tabsColorSplit6 = {}            
        }
        if (workOrderStatus == 2) {
            $scope.tabsColorSplit2 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorSplit = {}
            $scope.tabsColorSplit1 = {}
            $scope.tabsColorSplit3 = {}
            $scope.tabsColorSplit4 = {}
            $scope.tabsColorSplit5 = {}
            $scope.tabsColorSplit6 = {}            
        }


        if (workOrderStatus == 3) {
            $scope.tabsColorSplit3 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorSplit = {}
            $scope.tabsColorSplit1 = {}
            $scope.tabsColorSplit2 = {}
            $scope.tabsColorSplit3 = {}
            $scope.tabsColorSplit4 = {}
            $scope.tabsColorSplit6 = {}            
        }

        if (workOrderStatus == 4) {
            $scope.tabsColorSplit4 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorSplit = {}
            $scope.tabsColorSplit1 = {}
            $scope.tabsColorSplit2 = {}
            $scope.tabsColorSplit3 = {}
            $scope.tabsColorSplit4 = {}
            $scope.tabsColorSplit6 = {}            
        }
        if (workOrderStatus == 5) {
            $scope.tabsColorSplit5 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorSplit = {}
            $scope.tabsColorSplit1 = {}
            $scope.tabsColorSplit2 = {}
            $scope.tabsColorSplit3 = {}
            $scope.tabsColorSplit4 = {}
            $scope.tabsColorSplit5 = {}            
        }

            $http.get(workOrderssplitListUrl).success(function(data) {
                $scope.workOrdersplitLists = data;
                $scope.dayDataCollapseSplit = [];

                for (var i = 0; i < $scope.workOrdersplitLists.length; i += 1) {
                    $scope.dayDataCollapseSplit.push(false);
                }
            }).error(function(error, status) {
    
    

            });
        }
        // list of work orders create split code ends here

    //expansion and collapsing of mailer rows data
    $scope.tableRowExpandedMailer = false;
    $scope.tableRowIndexExpandedCurrMailer = "";
    $scope.tableRowIndexExpandedPrevMailer = "";
    $scope.storeIdExpandedMailer = "";

    $scope.dayDataCollapseFnMailer = function() {
        $scope.dayDataCollapseMailer = [];

        for (var i = 0; i < $scope.workOrdermailerLists.length; i += 1) {
            $scope.dayDataCollapseMailer.push(false);
        }
    };

    $scope.selectTableRowMailer = function(indexMailer, storeIdMailer) {
        console.log(storeIdMailer);
        if (typeof $scope.dayDataCollapseMailer === 'undefined') {
            $scope.dayDataCollapseFnMailer();
        }

        if ($scope.tableRowExpandedMailer === false && $scope.tableRowIndexExpandedCurrMailer === "" && $scope.storeIdExpandedMailer === "") {
            $scope.tableRowIndexExpandedPrevMailer = "";
            $scope.tableRowExpandedMailer = true;
            $scope.tableRowIndexExpandedCurrMailer = indexMailer;
            $scope.storeIdExpandedMailer = storeIdMailer;
            $scope.dayDataCollapseMailer[indexMailer] = true;
        } else if ($scope.tableRowExpandedMailer === true) {
            if ($scope.tableRowIndexExpandedCurrMailer === indexMailer && $scope.storeIdExpandedMailer === storeIdMailer) {
                $scope.tableRowExpandedMailer = false;
                $scope.tableRowIndexExpandedCurrMailer = "";
                $scope.storeIdExpandedMailer = "";
                $scope.dayDataCollapseMailer[indexMailer] = false;
            } else {
                $scope.tableRowIndexExpandedPrevMailer = $scope.tableRowIndexExpandedCurrMailer;
                $scope.tableRowIndexExpandedCurrMailer = indexMailer;
                $scope.storeIdExpandedMailer = storeIdMailer;
                $scope.dayDataCollapseMailer[$scope.tableRowIndexExpandedPrevMailer] = false;
                $scope.dayDataCollapseMailer[$scope.tableRowIndexExpandedCurrMailer] = true;
            }
        }
    };


    // fetching list of work orders - created free mailer sample from RestAPI OMS
    $scope.listOfWorkOrdersCreatedMailer = function(workOrderStatus,start) {
            var workOrdersmailerListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder?workordertype=4&workorderstatus="+workOrderStatus;

            workOrdersmailerListUrl += "&start=" + start + '&size=5&sort=tableWorkOrderDatetime&direction=desc';

            if ($scope.warehouseid) {
                workOrdersmailerListUrl += "&warehouse=" + $scope.warehouseid;
            }
            if ($scope.startDate) {
                workOrdersmailerListUrl += "&startDate=" + $scope.startDate;
            }
            if ($scope.endDate) {
                workOrdersmailerListUrl += "&endDate=" + $scope.endDate;
            }

        if (workOrderStatus == 0) {
            $scope.tabsColorMailer = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorMailer1 = {};
            $scope.tabsColorMailer2 = {};
            $scope.tabsColorMailer3 = {};
            $scope.tabsColorMailer4 = {};
            $scope.tabsColorMailer5 = {};
            $scope.tabsColorMailer6 = {};
        }
        if (workOrderStatus == 1) {
            $scope.tabsColorMailer1 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorMailer = {}
            $scope.tabsColorMailer2 = {}
            $scope.tabsColorMailer3 = {}
            $scope.tabsColorMailer4 = {}
            $scope.tabsColorMailer5 = {}
            $scope.tabsColorMailer6 = {}            
        }
        if (workOrderStatus == 2) {
            $scope.tabsColorMailer2 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorMailer = {}
            $scope.tabsColorMailer1 = {}
            $scope.tabsColorMailer3 = {}
            $scope.tabsColorMailer4 = {}
            $scope.tabsColorMailer5 = {}
            $scope.tabsColorMailer6 = {}            
        }


        if (workOrderStatus == 3) {
            $scope.tabsColorMailer3 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorMailer = {}
            $scope.tabsColorMailer1 = {}
            $scope.tabsColorMailer2 = {}
            $scope.tabsColorMailer3 = {}
            $scope.tabsColorMailer4 = {}
            $scope.tabsColorMailer6 = {}            
        }

        if (workOrderStatus == 4) {
            $scope.tabsColorMailer4 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorMailer = {}
            $scope.tabsColorMailer1 = {}
            $scope.tabsColorMailer2 = {}
            $scope.tabsColorMailer3 = {}
            $scope.tabsColorMailer4 = {}
            $scope.tabsColorMailer6 = {}            
        }
        if (workOrderStatus == 5) {
            $scope.tabsColorMailer5 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorMailer = {}
            $scope.tabsColorMailer1 = {}
            $scope.tabsColorMailer2 = {}
            $scope.tabsColorMailer3 = {}
            $scope.tabsColorMailer4 = {}
            $scope.tabsColorMailer5 = {}            
        }            

            $http.get(workOrdersmailerListUrl).success(function(data) {
                $scope.workOrdermailerLists = data;
                $scope.dayDataCollapseMailer = [];

                for (var i = 0; i < $scope.workOrdermailerLists.length; i += 1) {
                    $scope.dayDataCollapseMailer.push(false);
                }                
            }).error(function(error, status) {
    
    

            });
        }
        // list of work orders create free mailer sample code ends here


    //expansion and collapsing of qc rows data
    $scope.tableRowExpandedQc = false;
    $scope.tableRowIndexExpandedCurrQc = "";
    $scope.tableRowIndexExpandedPrevQc = "";
    $scope.storeIdExpandedQc = "";

    $scope.dayDataCollapseFnQc = function() {
        $scope.dayDataCollapseQc = [];

        for (var i = 0; i < $scope.workOrderqcLists.length; i += 1) {
            $scope.dayDataCollapseQc.push(false);
        }
    };

    $scope.selectTableRowQc = function(indexQc, storeIdQc) {
        console.log(storeIdQc);
        if (typeof $scope.dayDataCollapseQc === 'undefined') {
            $scope.dayDataCollapseFnQc();
        }

        if ($scope.tableRowExpandedQc === false && $scope.tableRowIndexExpandedCurrQc === "" && $scope.storeIdExpandedQc === "") {
            $scope.tableRowIndexExpandedPrevQc = "";
            $scope.tableRowExpandedQc = true;
            $scope.tableRowIndexExpandedCurrQc = indexQc;
            $scope.storeIdExpandedQc = storeIdQc;
            $scope.dayDataCollapseQc[indexQc] = true;
        } else if ($scope.tableRowExpandedQc === true) {
            if ($scope.tableRowIndexExpandedCurrQc === indexQc && $scope.storeIdExpandedQc === storeIdQc) {
                $scope.tableRowExpandedQc = false;
                $scope.tableRowIndexExpandedCurrQc = "";
                $scope.storeIdExpandedQc = "";
                $scope.dayDataCollapseQc[indexQc] = false;
            } else {
                $scope.tableRowIndexExpandedPrevQc = $scope.tableRowIndexExpandedCurrQc;
                $scope.tableRowIndexExpandedCurrQc = indexQc;
                $scope.storeIdExpandedQc = storeIdQc;
                $scope.dayDataCollapseQc[$scope.tableRowIndexExpandedPrevQc] = false;
                $scope.dayDataCollapseQc[$scope.tableRowIndexExpandedCurrQc] = true;
            }
        }
    };
    // fetching list of work orders - created qc from RestAPI OMS
    $scope.listOfWorkOrdersCreatedQc = function(workOrderStatus,start) {
            var workOrdersqcListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder?workordertype=6&workorderstatus="+workOrderStatus;

            workOrdersqcListUrl += "&start=" + start + '&size=5&sort=tableWorkOrderDatetime&direction=desc';

            if ($scope.warehouseid) {
                workOrdersqcListUrl += "&warehouse=" + $scope.warehouseid;
            }
            if ($scope.startDate) {
                workOrdersqcListUrl += "&startDate=" + $scope.startDate;
            }
            if ($scope.endDate) {
                workOrdersqcListUrl += "&endDate=" + $scope.endDate;
            }

        if (workOrderStatus == 0) {
            $scope.tabsColorQc = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorQc1 = {};
            $scope.tabsColorQc2 = {};
            $scope.tabsColorQc3 = {};
            $scope.tabsColorQc4 = {};
            $scope.tabsColorQc5 = {};
            $scope.tabsColorQc6 = {};
        }
        if (workOrderStatus == 1) {
            $scope.tabsColorQc1 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorQc = {}
            $scope.tabsColorQc2 = {}
            $scope.tabsColorQc3 = {}
            $scope.tabsColorQc4 = {}
            $scope.tabsColorQc5 = {}
            $scope.tabsColorQc6 = {}            
        }
        if (workOrderStatus == 2) {
            $scope.tabsColorQc2 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorQc = {}
            $scope.tabsColorQc1 = {}
            $scope.tabsColorQc3 = {}
            $scope.tabsColorQc4 = {}
            $scope.tabsColorQc5 = {}
            $scope.tabsColorQc6 = {}            
        }


        if (workOrderStatus == 3) {
            $scope.tabsColorQc3 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorQc = {}
            $scope.tabsColorQc1 = {}
            $scope.tabsColorQc2 = {}
            $scope.tabsColorQc3 = {}
            $scope.tabsColorQc4 = {}
            $scope.tabsColorQc6 = {}            
        }

        if (workOrderStatus == 4) {
            $scope.tabsColorQc4 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorQc = {}
            $scope.tabsColorQc1 = {}
            $scope.tabsColorQc2 = {}
            $scope.tabsColorQc3 = {}
            $scope.tabsColorQc4 = {}
            $scope.tabsColorQc6 = {}            
        }
        if (workOrderStatus == 5) {
            $scope.tabsColorQc5 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorQc = {}
            $scope.tabsColorQc1 = {}
            $scope.tabsColorQc2 = {}
            $scope.tabsColorQc3 = {}
            $scope.tabsColorQc4 = {}
            $scope.tabsColorQc5 = {}            
        }   

            $http.get(workOrdersqcListUrl).success(function(data) {
                $scope.workOrderqcLists = data;
                $scope.dayDataCollapseQc = [];

                for (var i = 0; i < $scope.workOrderqcLists.length; i += 1) {
                    $scope.dayDataCollapseQc.push(false);
                }                
            }).error(function(error, status) {
    
    

            });
        }
        // list of work orders create qc sample code ends here

    //expansion and collapsing of stock rows data
    $scope.tableRowExpandedStock = false;
    $scope.tableRowIndexExpandedCurrStock = "";
    $scope.tableRowIndexExpandedPrevStock = "";
    $scope.storeIdExpandedStock = "";

    $scope.dayDataCollapseFnStock = function() {
        $scope.dayDataCollapseStock = [];

        for (var i = 0; i < $scope.workOrderstockLists.length; i += 1) {
            $scope.dayDataCollapseStock.push(false);
        }
    };

    $scope.selectTableRowStock = function(indexStock, storeIdStock) {
        console.log(storeIdStock);
        if (typeof $scope.dayDataCollapseStock === 'undefined') {
            $scope.dayDataCollapseFnStock();
        }

        if ($scope.tableRowExpandedStock === false && $scope.tableRowIndexExpandedCurrStock === "" && $scope.storeIdExpandedStock === "") {
            $scope.tableRowIndexExpandedPrevStock = "";
            $scope.tableRowExpandedStock = true;
            $scope.tableRowIndexExpandedCurrStock = indexStock;
            $scope.storeIdExpandedStock = storeIdStock;
            $scope.dayDataCollapseStock[indexStock] = true;
        } else if ($scope.tableRowExpandedStock === true) {
            if ($scope.tableRowIndexExpandedCurrStock === indexStock && $scope.storeIdExpandedStock === storeIdStock) {
                $scope.tableRowExpandedStock = false;
                $scope.tableRowIndexExpandedCurrStock = "";
                $scope.storeIdExpandedStock = "";
                $scope.dayDataCollapseStock[indexStock] = false;
            } else {
                $scope.tableRowIndexExpandedPrevStock = $scope.tableRowIndexExpandedCurrStock;
                $scope.tableRowIndexExpandedCurrStock = indexStock;
                $scope.storeIdExpandedStock = storeIdStock;
                $scope.dayDataCollapseStock[$scope.tableRowIndexExpandedPrevStock] = false;
                $scope.dayDataCollapseStock[$scope.tableRowIndexExpandedCurrStock] = true;
            }
        }
    };    
    // fetching list of work orders - created stock from RestAPI OMS
    $scope.listOfWorkOrdersCreatedStock = function(workOrderStatus,start) {
            var workOrdersstockListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder?workordertype=7&workorderstatus="+workOrderStatus;

            workOrdersstockListUrl += "&start=" + start + '&size=5&sort=tableWorkOrderDatetime&direction=desc';

            if ($scope.warehouseid) {
                workOrdersstockListUrl += "&warehouse=" + $scope.warehouseid;
            }
            if ($scope.startDate) {
                workOrdersstockListUrl += "&startDate=" + $scope.startDate;
            }
            if ($scope.endDate) {
                workOrdersstockListUrl += "&endDate=" + $scope.endDate;
            }

        if (workOrderStatus == 0) {
            $scope.tabsColorStock = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorStock1 = {};
            $scope.tabsColorStock2 = {};
            $scope.tabsColorStock3 = {};
            $scope.tabsColorStock4 = {};
            $scope.tabsColorStock5 = {};
            $scope.tabsColorStock6 = {};
        }
        if (workOrderStatus == 1) {
            $scope.tabsColorStock1 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorStock = {}
            $scope.tabsColorStock2 = {}
            $scope.tabsColorStock3 = {}
            $scope.tabsColorStock4 = {}
            $scope.tabsColorStock5 = {}
            $scope.tabsColorStock6 = {}            
        }
        if (workOrderStatus == 2) {
            $scope.tabsColorStock2 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorStock = {}
            $scope.tabsColorStock1 = {}
            $scope.tabsColorStock3 = {}
            $scope.tabsColorStock4 = {}
            $scope.tabsColorStock5 = {}
            $scope.tabsColorStock6 = {}            
        }


        if (workOrderStatus == 3) {
            $scope.tabsColorStock3 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorStock = {}
            $scope.tabsColorStock1 = {}
            $scope.tabsColorStock2 = {}
            $scope.tabsColorStock3 = {}
            $scope.tabsColorStock4 = {}
            $scope.tabsColorStock6 = {}            
        }

        if (workOrderStatus == 4) {
            $scope.tabsColorStock4 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorStock = {}
            $scope.tabsColorStock1 = {}
            $scope.tabsColorStock2 = {}
            $scope.tabsColorStock3 = {}
            $scope.tabsColorStock4 = {}
            $scope.tabsColorStock6 = {}            
        }
        if (workOrderStatus == 5) {
            $scope.tabsColorStock5 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorStock = {}
            $scope.tabsColorStock1 = {}
            $scope.tabsColorStock2 = {}
            $scope.tabsColorStock3 = {}
            $scope.tabsColorStock4 = {}
            $scope.tabsColorStock5 = {}            
        }   


            $http.get(workOrdersstockListUrl).success(function(data) {
                $scope.workOrderstockLists = data;
                $scope.dayDataCollapseStock = [];

                for (var i = 0; i < $scope.workOrderstockLists.length; i += 1) {
                    $scope.dayDataCollapseStock.push(false);
                }                
            }).error(function(error, status) {
    
    

            });
        }
        // list of work orders create stock sample code ends here

    //expansion and collapsing of sticker rows data
    $scope.tableRowExpandedSticker = false;
    $scope.tableRowIndexExpandedCurrSticker = "";
    $scope.tableRowIndexExpandedPrevSticker = "";
    $scope.storeIdExpandedSticker = "";

    $scope.dayDataCollapseFnSticker = function() {
        $scope.dayDataCollapseSticker = [];

        for (var i = 0; i < $scope.workOrderstickerLists.length; i += 1) {
            $scope.dayDataCollapseSticker.push(false);
        }
    };

    $scope.selectTableRowSticker = function(indexSticker, storeIdSticker) {
        console.log(storeIdSticker);
        if (typeof $scope.dayDataCollapseSticker === 'undefined') {
            $scope.dayDataCollapseFnSticker();
        }

        if ($scope.tableRowExpandedSticker === false && $scope.tableRowIndexExpandedCurrSticker === "" && $scope.storeIdExpandedSticker === "") {
            $scope.tableRowIndexExpandedPrevSticker = "";
            $scope.tableRowExpandedSticker = true;
            $scope.tableRowIndexExpandedCurrSticker = indexSticker;
            $scope.storeIdExpandedSticker = storeIdSticker;
            $scope.dayDataCollapseSticker[indexSticker] = true;
        } else if ($scope.tableRowExpandedSticker === true) {
            if ($scope.tableRowIndexExpandedCurrSticker === indexSticker && $scope.storeIdExpandedSticker === storeIdSticker) {
                $scope.tableRowExpandedSticker = false;
                $scope.tableRowIndexExpandedCurrSticker = "";
                $scope.storeIdExpandedSticker = "";
                $scope.dayDataCollapseSticker[indexSticker] = false;
            } else {
                $scope.tableRowIndexExpandedPrevSticker = $scope.tableRowIndexExpandedCurrSticker;
                $scope.tableRowIndexExpandedCurrSticker = indexSticker;
                $scope.storeIdExpandedSticker = storeIdSticker;
                $scope.dayDataCollapseSticker[$scope.tableRowIndexExpandedPrevSticker] = false;
                $scope.dayDataCollapseSticker[$scope.tableRowIndexExpandedCurrSticker] = true;
            }
        }
    };   

    // fetching list of work orders - created sticker from RestAPI OMS
    $scope.listOfWorkOrdersCreatedSticker = function(workOrderStatus,start) {
            var workOrdersstickerListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workorder?workordertype=8&workorderstatus="+workOrderStatus;

            workOrdersstickerListUrl += "&start=" + start + '&size=5&sort=tableWorkOrderDatetime&direction=desc';

            if ($scope.warehouseid) {
                workOrdersstickerListUrl += "&warehouse=" + $scope.warehouseid;
            }
            if ($scope.startDate) {
                workOrdersstickerListUrl += "&startDate=" + $scope.startDate;
            }
            if ($scope.endDate) {
                workOrdersstickerListUrl += "&endDate=" + $scope.endDate;
            }

            if (workOrderStatus == 0) {
            $scope.tabsColorSticker = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorSticker1 = {};
            $scope.tabsColorSticker2 = {};
            $scope.tabsColorSticker3 = {};
            $scope.tabsColorSticker4 = {};
            $scope.tabsColorSticker5 = {};
            $scope.tabsColorSticker6 = {};
        }
        if (workOrderStatus == 1) {
            $scope.tabsColorSticker1 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorSticker = {}
            $scope.tabsColorSticker2 = {}
            $scope.tabsColorSticker3 = {}
            $scope.tabsColorSticker4 = {}
            $scope.tabsColorSticker5 = {}
            $scope.tabsColorSticker6 = {}            
        }
        if (workOrderStatus == 2) {
            $scope.tabsColorSticker2 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorSticker = {}
            $scope.tabsColorSticker1 = {}
            $scope.tabsColorSticker3 = {}
            $scope.tabsColorSticker4 = {}
            $scope.tabsColorSticker5 = {}
            $scope.tabsColorSticker6 = {}            
        }


        if (workOrderStatus == 3) {
            $scope.tabsColorSticker3 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorSticker = {}
            $scope.tabsColorSticker1 = {}
            $scope.tabsColorSticker2 = {}
            $scope.tabsColorSticker3 = {}
            $scope.tabsColorSticker4 = {}
            $scope.tabsColorSticker6 = {}            
        }

        if (workOrderStatus == 4) {
            $scope.tabsColorSticker4 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorSticker = {}
            $scope.tabsColorSticker1 = {}
            $scope.tabsColorSticker2 = {}
            $scope.tabsColorSticker3 = {}
            $scope.tabsColorSticker4 = {}
            $scope.tabsColorSticker6 = {}            
        }
        if (workOrderStatus == 5) {
            $scope.tabsColorSticker5 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColorSticker = {}
            $scope.tabsColorSticker1 = {}
            $scope.tabsColorSticker2 = {}
            $scope.tabsColorSticker3 = {}
            $scope.tabsColorSticker4 = {}
            $scope.tabsColorSticker5 = {}            
        }   


            $http.get(workOrdersstickerListUrl).success(function(data) {
                $scope.workOrderstickerLists = data;
                $scope.dayDataCollapseSticker = [];

                for (var i = 0; i < $scope.workOrderstickerLists.length; i += 1) {
                    $scope.dayDataCollapseSticker.push(false);
                }                
            }).error(function(error, status) {
    
    

            });
        }
        // list of work orders create stock sample code ends here


    // dialog box to add new inventory
    $scope.showAdvanced = function(ev) {
        $scope.callMainMinStartMaxStart();
        $mdDialog.show({
            templateUrl: 'dialog1.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        })
        $scope.validAvblQty = false;
    };

    // dialog box to add new stock transfer
    $scope.showStockTransferDialog = function(ev) {
        $mdDialog.show({
                templateUrl: 'addEditStockTransfer.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                scope: $scope.$new()
            })
    };

    //dialog box to show work order types
    $scope.showWorkOrderTypes = function(ev) {
        $scope.radio = "";
        var workOrderTypeUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/workordertypes";
        $http.get(workOrderTypeUrl).success(function(data) {
            $scope.workOrdersTypes = data;

        }).error(function(error, status) {



        });

        $mdDialog.show({
                templateUrl: 'dialog10.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                scope: $scope.$new()
            })
    };

    $scope.onvalue = function(radio) {
        $scope.radio = JSON.parse(radio);
    };

    $scope.selectWorkOrderTypeAction = function(radio, ev) {
        $mdDialog.hide();
        if (radio == 1) {
            $scope.showAddKitDialog(ev);
        }
        if (radio == 2) {
            $scope.showAddSplitDialog(ev);
        }
        if (radio == 4) {
            $scope.showAddFreeMailerDialog(ev);
        }
        if (radio == 6) {
            $scope.showAddQcDialog(ev);
        }
        if (radio == 7) {
            $scope.showAddStockDialog(ev);
        }
        if (radio == 8) {
            $scope.showAddStickerDialog(ev);
        }
    };

    $scope.cancelWorkOrderType = function() {
        $mdDialog.hide();
    };
    // dialog box to add new kit
    $scope.showAddKitDialog = function(ev) {
        $scope.callMinStartMaxStart();
        $scope.startmaxDate = "";
        $mdDialog.show({
                templateUrl: 'dialog3.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                scope: $scope.$new()
            })
    };

    // dialog box to add new split
    $scope.showAddSplitDialog = function(ev) {
        $scope.callMinStartMaxStart();
        $scope.startmaxDate = "";
        $mdDialog.show({
                templateUrl: 'dialog4.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                scope: $scope.$new()
            })
    };

    // dialog box to add new free mailer
    $scope.showAddFreeMailerDialog = function(ev) {
        $scope.callMinStartMaxStart();
        $scope.startmaxDate = "";
        $mdDialog.show({
                templateUrl: 'dialog5.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                scope: $scope.$new()
            })
    };

    // dialog box to add new QC
    $scope.showAddQcDialog = function(ev) {
        $scope.callMinStartMaxStart();
        $scope.startmaxDate = "";
        $mdDialog.show({
                templateUrl: 'dialog6.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                scope: $scope.$new(),
                escapeToClose: false
            })
    };

    // dialog box to add new Stock Audit
    $scope.showAddStockDialog = function(ev) {
        $scope.callMinStartMaxStart();
        $scope.startmaxDate = "";
        $mdDialog.show({
                templateUrl: 'dialog7.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                scope: $scope.$new()
            })
    };

    $scope.showAddStickerDialog = function(ev) {
        $scope.callMinStartMaxStart();
        $scope.loadStickerTemplates();
        $scope.startmaxDate = "";
        $mdDialog.show({
                templateUrl: 'dialog8.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                scope: $scope.$new()
            })
    };

    //add inventory dialog box code ends here

    $scope.hide = function() {
        $mdDialog.hide();
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };

    $scope.toggleInvSearchRow = function() {
        $scope.searchInventoryClicked = !$scope.searchInventoryClicked;
    };

    $scope.toggleWOSearchRow = function() {
        $scope.searchWorkOrderClicked = !$scope.searchWorkOrderClicked;
    };

    $scope.togglKitSearchRow = function() {
        $scope.searchWorkOrderKitClicked = !$scope.searchWorkOrderKitClicked;
    };

    $scope.toggleSplitSearchRow = function() {
        $scope.searchWorkOrderSplitClicked = !$scope.searchWorkOrderSplitClicked;
    };

    $scope.toggleMailerSearchRow = function() {
        $scope.searchWorkOrderMailerClicked = !$scope.searchWorkOrderMailerClicked;
    };

    $scope.toggleQcSearchRow = function() {
        $scope.searchWorkOrderQcClicked = !$scope.searchWorkOrderQcClicked;
    };

    $scope.toggleStockSearchRow = function() {
        $scope.searchWorkOrderStockClicked = !$scope.searchWorkOrderStockClicked;
    };

    $scope.toggleStickerSearchRow = function() {
        $scope.searchWorkOrderStickerClicked = !$scope.searchWorkOrderStickerClicked;
    };

    // getting the list of warehouses from backend
    $scope.getWarehouses = function() {
        $scope.wareHousesData = [];
        var warehouseUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/warehouses?size=-1";
        $http.get(warehouseUrl).success(function(data) {
            for (var i = 0; i < data.length; i++) {
                $scope.wareHousesData.push(data[i]);
            }
        }).error(function(error, status) {



        });
    };
    //getting warehouses list ends here

    // getting the list of vendors from backend
    $scope.getVendors = function() {
        $scope.vendorsData = [];
        var vendorsUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/vendors";
        $http.get(vendorsUrl).success(function(data) {
            for (var i = 0; i < data.length; i++) {
                $scope.vendorsData.push(data[i]);
            }
        }).error(function(error, status) {



        });
    };
    //getting warehouses list ends here

    // add inventory code using restOMS Api of inventory
    $scope.addInventory = function(inventoryData) {
        if (!inventoryData.tableSkuInventoryAvailableCount || inventoryData.tableSkuInventoryAvailableCount == 0) {
            $scope.validAvblQty = true;
           $scope.notify("Please enter a valid available quantity");
        } else {
            var mfgDate = "";
            var expDate = "";
            if (inventoryData.tableSkuInventoryMfgDate != null) {
                mfgDate = dateFormat(new Date(inventoryData.tableSkuInventoryMfgDate), 'yyyy-mm-dd');
            }
            if (inventoryData.tableSkuInventoryExpiryDate != null) {
                expDate = dateFormat(new Date(inventoryData.tableSkuInventoryExpiryDate), 'yyyy-mm-dd');
            }

            var postInventoryData = {
                "idtableSkuInventoryId": 1,
                "tableSkuInventoryMaxRetailPrice": parseInt(inventoryData.tableSkuInventoryMaxRetailPrice),
                "tableSkuInventoryBatchNo": inventoryData.tableSkuInventoryBatchNo,
                "tableSkuInventoryMfgDate": mfgDate,
                "tableSkuInventoryExpiryDate": expDate,
                "tableSkuInventoryShelfLifeInDays": parseInt(inventoryData.tableSkuInventoryShelfLifeInDays),
                "tableSkuInventoryMinSalePrice": parseInt(inventoryData.tableSkuInventoryMinSalePrice),
                "tableSkuInventoryAvailableCount": parseInt(inventoryData.tableSkuInventoryAvailableCount),
                "tableSkuInventoryInwardQcFailedCount": parseInt(inventoryData.tableSkuInventoryInwardQcFailedCount),
                "tableSku": inventoryData.tableSku,
                "tableWarehouseDetails": JSON.parse(inventoryData.tableWarehouseDetails),
                "tableWorkOrders": [],
                "tableSaleOrderSkuInventoryMaps": []
            }
            if (inventoryData.tableVendor != undefined) {
                postInventoryData.tableVendor = JSON.parse(inventoryData.tableVendor);
            }

            $http({
                method: 'POST',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/inventory',
                data: postInventoryData,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                if (res) {
                    $scope.notify("Inventory Added Successfully",'success');
                    $scope.inventoryData = null;
                    postInventoryData = null;
                    $scope.listOfInventoriesCount($scope.vmPager.currentPage);
                    $scope.mode = 'add';
                    $mdDialog.hide();
                }
            }).error(function(error, status) {
                if(status == 400){
                   $scope.notify(error.errorMessage);
                }else {
                   $scope.notify("Inventory Cannot be Added");
                }
            });
        }
    };

    //cancel - closing inventory Dialog
    $scope.cancelInventory = function() {
        $scope.availableQuantityMode = false;
        $scope.wData = null;
        $scope.inventoryData = "";
        $scope.kitData = "";
        $scope.splitData = "";
        $scope.freeMailerData = "";
        $scope.qcData = "";
        $scope.stockData = "";
        $scope.stickerData = "";
        $scope.initialSelected = "";
        $scope.freeMailertableWorkOrderSkuQuantity = "";
        $scope.initialSelected1 = "";
        $scope.selectedList = "";
        $scope.invStickerLists = "";
        $scope.radio = "";
        $scope.skuId = "";
        $scope.mode = 'add';
        $scope.dialogBoxKit = 'add';
        $scope.dialogBoxSplit = 'add';
        $scope.dialogBoxFreeMailer = 'add';
        $scope.dialogBoxQC = 'add';
        $scope.dialogBoxStock = 'add';
        $scope.dialogBoxSticker = 'add';
        $scope.products = [];
        $mdDialog.hide();
    };

    // add kit - work order code using restOMS Api of work order
    $scope.addKitData = function(kitData) {
        var tableWorkOrderSkus = [];
        tableWorkOrderSkus.push({
            tableSku: $scope.productObj
        });
        var yearStart = dateFormat(new Date(kitData.tableWorkOrderScheduledDatetime), 'yyyy');
        var monthStart = dateFormat(new Date(kitData.tableWorkOrderScheduledDatetime), 'mm');
        var dateStart = dateFormat(new Date(kitData.tableWorkOrderScheduledDatetime), 'dd');
        var hoursStart = dateFormat(new Date(), 'HH');
        var minStart = dateFormat(new Date(), 'MM');
        var secStart = dateFormat(new Date(), 'ss');

        var yearEnd = dateFormat(new Date(kitData.tableWorkOrderScheduledEndDatetime), 'yyyy');
        var monthEnd = dateFormat(new Date(kitData.tableWorkOrderScheduledEndDatetime), 'mm');
        var dateEnd = dateFormat(new Date(kitData.tableWorkOrderScheduledEndDatetime), 'dd');
        var hoursEnd = dateFormat(new Date(), 'HH');
        var minEnd = dateFormat(new Date(), 'MM');
        var secEnd = dateFormat(new Date(), 'ss');

        var postKitData = {
            "tableWorkOrderSkuQuantity": kitData.tableWorkOrderSkuQuantity,
            "tableWarehouseDetails": kitData.tableWarehouseDetails,
            "tableWorkOrderSkus": tableWorkOrderSkus,
            "tableWorkOrderType": {
                "idtableWorkOrderTypeId": 1,
                "tableWorkOrderTypeString": "Kit"
            },
            "tableWorkOrderStatusType": {
                "idtableWorkOrderStatusTypeId": 1,
                "tableWorkOrderStatusTypeString": "New"
            },
            "tableWorkOrderStateTrails": []
        }

        postKitData.tableWorkOrderScheduledDatetime = [
            parseInt(yearStart),
            parseInt(monthStart),
            parseInt(dateStart),
            parseInt(hoursStart),
            parseInt(minStart),
            parseInt(secStart)
        ]

        postKitData.tableWorkOrderScheduledEndDatetime = [
            parseInt(yearEnd),
            parseInt(monthEnd),
            parseInt(dateEnd),
            parseInt(hoursEnd),
            parseInt(minEnd),
            parseInt(secEnd)
        ]

        $http({
            method: 'POST',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/workorder',
            data: postKitData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            if (res) {
                $scope.notify("Work Order - Kit Created Successfully",'success');
                $scope.kitData = null;
                postKitData = null;
                $scope.skuId = null;
                $scope.availableQuantityMode = false;
                // $scope.listOfWorkOrdersCreatedKit();
                $scope.listOfWorkOrderKitCount($scope.defaultTabKit,$scope.vmPagerWoKitStart.currentPage);
                // $scope.listOfWorkOrders();
                $scope.listOfWorkOrderCount($scope.defaultTab,$scope.vmPagerWoStart.currentPage);
                $scope.dialogBoxKit = 'add';
                $mdDialog.hide();
            }
        }).error(function(error, status) {
            if(status == 400){
               $scope.notify(error.errorMessage);
            }else {
               $scope.notify("Work Order - Kit cannot be added");
            }
        });
    };

    $scope.updateSingleKit = function(kitData,kitId,mode,selectedList){
        $scope.kitData = kitData;
        $scope.kitId = kitId;
        if(mode=='kit')
        {
            $scope.editWorkOrderMode = "kit";
        }
        if(mode=='split')
        {
            $scope.editWorkOrderMode = "split";
        }
        if(mode=='mailer')
        {
            $scope.editWorkOrderMode = "mailer";
            $scope.selectedList = selectedList;
        }
        if(mode=='qc')
        {
            $scope.editWorkOrderMode = "qc";
            $scope.selectedList = selectedList;
        }
        if(mode=='stock')
        {
            $scope.editWorkOrderMode = "stock";
        }
        if(mode=='sticker')
        {
            $scope.editWorkOrderMode = "sticker";
            $scope.selectedList = selectedList;
        }
        $('#confirmEditWorkOrder').modal('show');
    }
    // edit kit code using restOMS Api of inventory
    $scope.updateKitData = function(kitData, kitId) {
        var tableWorkOrderSkus = [];
        tableWorkOrderSkus.push({
            idtableWorkOrderSkuId: $scope.idtableWorkOrderSkuId,
            tableSku: $scope.productObj
        });
        var yearStart = dateFormat(new Date(kitData.tableWorkOrderScheduledDatetime), 'yyyy');
        var monthStart = dateFormat(new Date(kitData.tableWorkOrderScheduledDatetime), 'mm');
        var dateStart = dateFormat(new Date(kitData.tableWorkOrderScheduledDatetime), 'dd');
        var hoursStart = dateFormat(new Date(), 'HH');
        var minStart = dateFormat(new Date(), 'MM');
        var secStart = dateFormat(new Date(), 'ss');

        var yearEnd = dateFormat(new Date(kitData.tableWorkOrderScheduledEndDatetime), 'yyyy');
        var monthEnd = dateFormat(new Date(kitData.tableWorkOrderScheduledEndDatetime), 'mm');
        var dateEnd = dateFormat(new Date(kitData.tableWorkOrderScheduledEndDatetime), 'dd');
        var hoursEnd = dateFormat(new Date(), 'HH');
        var minEnd = dateFormat(new Date(), 'MM');
        var secEnd = dateFormat(new Date(), 'ss');

        var putKitData = kitData;
        putKitData.tableWorkOrderSkus = tableWorkOrderSkus;
        putKitData.tableWorkOrderScheduledDatetime = [
            parseInt(yearStart),
            parseInt(monthStart),
            parseInt(dateStart),
            parseInt(hoursStart),
            parseInt(minStart),
            parseInt(secStart)
        ]

        putKitData.tableWorkOrderScheduledEndDatetime = [
            parseInt(yearEnd),
            parseInt(monthEnd),
            parseInt(dateEnd),
            parseInt(hoursEnd),
            parseInt(minEnd),
            parseInt(secEnd)
        ]

        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/workorder/' + kitId,
            data: putKitData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            if (res) {

                $scope.notify("Work Order - Kit Updated Successfully",'success');
                $scope.kitData = "";
                postKitData = null;
                $scope.skuId = null;
                // $scope.listOfWorkOrdersCreatedKit();
                $scope.availableQuantityMode = false;
                $scope.listOfWorkOrderKitCount($scope.defaultTabKit,$scope.vmPagerWoKitStart.currentPage);
                // $scope.listOfWorkOrders();
                $scope.listOfWorkOrderCount($scope.defaultTab,$scope.vmPagerWoStart.currentPage);
                $scope.dialogBoxKit = 'add';
                 $('#confirmEditWorkOrder').modal('hide');
                $mdDialog.hide();
            }
        }).error(function(error, status) {



            $scope.dialogBoxSplit = 'add';
            if(status == 400){
               $scope.notify(error.errorMessage);
            }else {
               $scope.notify("Work Order - Kit cannot be updated");
            }
            $mdDialog.hide();
        });
    };

    // add split - work order code using restOMS Api of work order
    $scope.addSplitData = function(splitData) {
        var tableWorkOrderSkus = [];
        tableWorkOrderSkus.push({
            tableSku: $scope.productObj
        });
        var yearStart = dateFormat(new Date(splitData.tableWorkOrderScheduledDatetime), 'yyyy');
        var monthStart = dateFormat(new Date(splitData.tableWorkOrderScheduledDatetime), 'mm');
        var dateStart = dateFormat(new Date(splitData.tableWorkOrderScheduledDatetime), 'dd');
        var hoursStart = dateFormat(new Date(), 'HH');
        var minStart = dateFormat(new Date(), 'MM');
        var secStart = dateFormat(new Date(), 'ss');

        var yearEnd = dateFormat(new Date(splitData.tableWorkOrderScheduledEndDatetime), 'yyyy');
        var monthEnd = dateFormat(new Date(splitData.tableWorkOrderScheduledEndDatetime), 'mm');
        var dateEnd = dateFormat(new Date(splitData.tableWorkOrderScheduledEndDatetime), 'dd');
        var hoursEnd = dateFormat(new Date(), 'HH');
        var minEnd = dateFormat(new Date(), 'MM');
        var secEnd = dateFormat(new Date(), 'ss');

        var postSplitData = {
            "tableWorkOrderSkuQuantity": splitData.tableWorkOrderSkuQuantity,
            "tableWarehouseDetails": splitData.tableWarehouseDetails,
            "tableWorkOrderSkus": tableWorkOrderSkus,
            "tableWorkOrderType": {
                "idtableWorkOrderTypeId": 2,
                "tableWorkOrderTypeString": "Split"
            },
            "tableWorkOrderStatusType": {
                "idtableWorkOrderStatusTypeId": 1,
                "tableWorkOrderStatusTypeString": "New"
            },
            "tableWorkOrderStateTrails": []
        }

        postSplitData.tableWorkOrderScheduledDatetime = [
            parseInt(yearStart),
            parseInt(monthStart),
            parseInt(dateStart),
            parseInt(hoursStart),
            parseInt(minStart),
            parseInt(secStart)
        ]

        postSplitData.tableWorkOrderScheduledEndDatetime = [
            parseInt(yearEnd),
            parseInt(monthEnd),
            parseInt(dateEnd),
            parseInt(hoursEnd),
            parseInt(minEnd),
            parseInt(secEnd)
        ]
        $http({
            method: 'POST',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/workorder',
            data: postSplitData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            if (res) {
                $scope.notify("Work Order - Split Created Successfully",'success');
                $scope.splitData = null;
                postSplitData = null;
                $scope.skuId = null;
                $scope.availableQuantityMode = false;
                // $scope.listOfWorkOrdersCreatedSplit();
                $scope.listOfWorkOrderSplitCount($scope.defaultTabSplit,$scope.vmPagerWoSplitStart.currentPage);
                // $scope.listOfWorkOrders();
                $scope.listOfWorkOrderCount($scope.defaultTab,$scope.vmPagerWoStart.currentPage);
                $scope.mode = 'add';
                $mdDialog.hide();
            }
        }).error(function(error, status) {



           $scope.notify("Work Order - Kit cannot be added");
        });
    };

    // edit split code using restOMS Api of inventory
    $scope.updateSplitData = function(splitData, splitId) {
        var tableWorkOrderSkus = [];
        tableWorkOrderSkus.push({
            idtableWorkOrderSkuId: $scope.idtableWorkOrderSkuId,
            tableSku: $scope.productObj
        });
        var yearStart = dateFormat(new Date(splitData.tableWorkOrderScheduledDatetime), 'yyyy');
        var monthStart = dateFormat(new Date(splitData.tableWorkOrderScheduledDatetime), 'mm');
        var dateStart = dateFormat(new Date(splitData.tableWorkOrderScheduledDatetime), 'dd');
        var hoursStart = dateFormat(new Date(), 'HH');
        var minStart = dateFormat(new Date(), 'MM');
        var secStart = dateFormat(new Date(), 'ss');

        var yearEnd = dateFormat(new Date(splitData.tableWorkOrderScheduledEndDatetime), 'yyyy');
        var monthEnd = dateFormat(new Date(splitData.tableWorkOrderScheduledEndDatetime), 'mm');
        var dateEnd = dateFormat(new Date(splitData.tableWorkOrderScheduledEndDatetime), 'dd');
        var hoursEnd = dateFormat(new Date(), 'HH');
        var minEnd = dateFormat(new Date(), 'MM');
        var secEnd = dateFormat(new Date(), 'ss');

        var putSplitData = splitData;
        putSplitData.tableWorkOrderSkus = tableWorkOrderSkus;
        putSplitData.tableWorkOrderScheduledDatetime = [
            parseInt(yearStart),
            parseInt(monthStart),
            parseInt(dateStart),
            parseInt(hoursStart),
            parseInt(minStart),
            parseInt(secStart)
        ]

        putSplitData.tableWorkOrderScheduledEndDatetime = [
            parseInt(yearEnd),
            parseInt(monthEnd),
            parseInt(dateEnd),
            parseInt(hoursEnd),
            parseInt(minEnd),
            parseInt(secEnd)
        ]

        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/workorder/' + splitId,
            data: putSplitData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            if (res) {

                $scope.notify("Work Order - Split Updated Successfully",'success');
                $scope.splitData = "";
                postSplitData = null;
                $scope.skuId = null;
                $scope.availableQuantityMode = false;
                // $scope.listOfWorkOrdersCreatedSplit();
                $scope.listOfWorkOrderSplitCount($scope.defaultTabSplit,$scope.vmPagerWoSplitStart.currentPage);
                // $scope.listOfWorkOrders();
                $scope.listOfWorkOrderCount($scope.defaultTab,$scope.vmPagerWoStart.currentPage);
                $scope.dialogBoxSplit = 'add';
                 $('#confirmEditWorkOrder').modal('hide');
                $mdDialog.hide();
            }
        }).error(function(error, status) {



            $scope.dialogBoxSplit = 'add';
           $scope.notify("Work Order - Split cannot be updated");
            $mdDialog.hide();
        });
    };

    //Available Quantity Function to get data base on sku id and warehouse id
    $scope.availableQuantity = function(wareHousesData, skuid) {
        if (wareHousesData != null && skuid != null) {
            var wData = wareHousesData;

            $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/warehouses/' + wData.idtableWarehouseDetailsId + '/skus/' + skuid + '/inventory/inventorycount').success(function(response) {
    
                if (response != null) {
                    $scope.availableQuantityMode = true;
                    $scope.freeMailertableWorkOrderSkuQuantity = response;
                }
                if (response == null || response == '') {
                    $scope.availableQuantityMode = false;
                }
            });
        }
    };


    $scope.checkQuantityAvail = function(quantity, availableQuantity) {
        if (quantity > availableQuantity) {
           $scope.notify("Please Enter Quantity which is less than or equal to Available Quantity");
            $scope.isDisabled = true;
        }
        if (quantity <= availableQuantity) {
            $scope.isDisabled = false;
        }
    }

    $scope.nullQuantity = function() {
        $scope.freeMailertableWorkOrderSkuQuantity = null;
    };

    // add split - work order code using restOMS Api of work order
    $scope.addfreeMailerData = function(freeMailerData, freeMailerQuantity) {
        var tableWorkOrderSkus = [];
        tableWorkOrderSkus.push({
            tableSku: $scope.productObj
        });
        tableWorkOrderSkus.push({
            tableSku: $scope.mailerObj
        });
        var yearStart = dateFormat(new Date(freeMailerData.tableWorkOrderScheduledDatetime), 'yyyy');
        var monthStart = dateFormat(new Date(freeMailerData.tableWorkOrderScheduledDatetime), 'mm');
        var dateStart = dateFormat(new Date(freeMailerData.tableWorkOrderScheduledDatetime), 'dd');
        var hoursStart = dateFormat(new Date(), 'HH');
        var minStart = dateFormat(new Date(), 'MM');
        var secStart = dateFormat(new Date(), 'ss');

        var yearEnd = dateFormat(new Date(freeMailerData.tableWorkOrderScheduledEndDatetime), 'yyyy');
        var monthEnd = dateFormat(new Date(freeMailerData.tableWorkOrderScheduledEndDatetime), 'mm');
        var dateEnd = dateFormat(new Date(freeMailerData.tableWorkOrderScheduledEndDatetime), 'dd');
        var hoursEnd = dateFormat(new Date(), 'HH');
        var minEnd = dateFormat(new Date(), 'MM');
        var secEnd = dateFormat(new Date(), 'ss');

        var postfreeMailerData = {
            "tableWorkOrderSkuQuantity": parseInt(freeMailerQuantity),
            "tableWarehouseDetails": freeMailerData.tableWarehouseDetails,
            "tableWorkOrderSkus": tableWorkOrderSkus,
            "tableSkuInventory": null,
            "tableWorkOrderStatusType": {
                "idtableWorkOrderStatusTypeId": 1,
                "tableWorkOrderStatusTypeString": "New"
            },
            "tableWorkOrderType": {
                "idtableWorkOrderTypeId": 4,
                "tableWorkOrderTypeString": "Free Mailers"
            },
            "tableWorkOrderStateTrails": []
        }

        postfreeMailerData.tableWorkOrderScheduledDatetime = [
            parseInt(yearStart),
            parseInt(monthStart),
            parseInt(dateStart),
            parseInt(hoursStart),
            parseInt(minStart),
            parseInt(secStart)
        ]

        postfreeMailerData.tableWorkOrderScheduledEndDatetime = [
            parseInt(yearEnd),
            parseInt(monthEnd),
            parseInt(dateEnd),
            parseInt(hoursEnd),
            parseInt(minEnd),
            parseInt(secEnd)
        ]

        $http({
            method: 'POST',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/workorder',
            data: postfreeMailerData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            if (res) {
                $scope.notify("Work Order - Free Mailer Created Successfully",'success');
                $scope.freeMailerData = null;
                freeMailerData = null;
                $scope.skuId = null;
                // $scope.listOfWorkOrdersCreatedMailer();
                $scope.listOfWorkOrderMailerCount($scope.defaultTabMailer,$scope.vmPagerWoMailerStart.currentPage);
                // $scope.listOfWorkOrders();
                $scope.listOfWorkOrderCount($scope.defaultTab,$scope.vmPagerWoStart.currentPage);
                $scope.mode = 'add';
                $mdDialog.hide();
            }
        }).error(function(error, status) {



           $scope.notify("Work Order - Free Mailer cannot be added");
        });
    };

    // edit mailer code using restOMS Api of inventory
    $scope.updatefreeMailerData = function(freeMailerData, freeMailerQuantity, freeMailerId) {
        var tableWorkOrderSkus = [];
        tableWorkOrderSkus.push({
            idtableWorkOrderSkuId: $scope.idtableWorkOrderSkuId,
            tableSku: $scope.productObj
        });
        tableWorkOrderSkus.push({
            idtableWorkOrderSkuId: $scope.idtableWorkOrderSkuId1,
            tableSku: $scope.mailerObj
        });
        var yearStart = dateFormat(new Date(freeMailerData.tableWorkOrderScheduledDatetime), 'yyyy');
        var monthStart = dateFormat(new Date(freeMailerData.tableWorkOrderScheduledDatetime), 'mm');
        var dateStart = dateFormat(new Date(freeMailerData.tableWorkOrderScheduledDatetime), 'dd');
        var hoursStart = dateFormat(new Date(), 'HH');
        var minStart = dateFormat(new Date(), 'MM');
        var secStart = dateFormat(new Date(), 'ss');

        var yearEnd = dateFormat(new Date(freeMailerData.tableWorkOrderScheduledEndDatetime), 'yyyy');
        var monthEnd = dateFormat(new Date(freeMailerData.tableWorkOrderScheduledEndDatetime), 'mm');
        var dateEnd = dateFormat(new Date(freeMailerData.tableWorkOrderScheduledEndDatetime), 'dd');
        var hoursEnd = dateFormat(new Date(), 'HH');
        var minEnd = dateFormat(new Date(), 'MM');
        var secEnd = dateFormat(new Date(), 'ss');

        var putMailerData = freeMailerData;

        putMailerData.tableWorkOrderSkus = tableWorkOrderSkus;
        putMailerData.tableWorkOrderScheduledDatetime = [
            parseInt(yearStart),
            parseInt(monthStart),
            parseInt(dateStart),
            parseInt(hoursStart),
            parseInt(minStart),
            parseInt(secStart)
        ]

        putMailerData.tableWorkOrderScheduledEndDatetime = [
            parseInt(yearEnd),
            parseInt(monthEnd),
            parseInt(dateEnd),
            parseInt(hoursEnd),
            parseInt(minEnd),
            parseInt(secEnd)
        ]

        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/workorder/' + freeMailerId,
            data: putMailerData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            if (res) {

                $scope.notify("Work Order - Free Mailer Updated Successfully",'success');
                $scope.freeMailerData = "";
                putMailerData = null;
                $scope.skuId = null;
                // $scope.listOfWorkOrdersCreatedMailer();
                $scope.listOfWorkOrderMailerCount($scope.defaultTabMailer,$scope.vmPagerWoMailerStart.currentPage);
                // $scope.listOfWorkOrders();
                $scope.listOfWorkOrderCount($scope.defaultTab,$scope.vmPagerWoStart.currentPage);
                $scope.dialogBoxFreeMailer = 'add';
                 $('#confirmEditWorkOrder').modal('hide');
                $mdDialog.hide();
            }
        }).error(function(error, status) {



            $scope.dialogBoxFreeMailer = 'add';
           $scope.notify("Work Order - Free Mailer cannot be updated");
            $mdDialog.hide();
        });
    };

    $scope.qcTrueLists = function() {
        $scope.optionsList = [];
        $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/skuqctypes').success(function(response) {
            for (var i = 0; i < response.length; i++) {
                if (response[i].tableSkuQcParameterTypeIsAdditional == true) {
                    $scope.optionsList.push(response[i].tableSkuQcParameterTypeString);
                }
            }
        });
    };

    $scope.addQcData = function(qcData, selectList) {
        var arr = [];
        for (var i = 0; i < selectList.length; i++) {
            arr.push(selectList[i])
        }

        var a = arr.join("|");


        var tableWorkOrderSkus = [];
        tableWorkOrderSkus.push({
            tableSku: $scope.productObj
        });
        var yearStart = dateFormat(new Date(qcData.tableWorkOrderScheduledDatetime), 'yyyy');
        var monthStart = dateFormat(new Date(qcData.tableWorkOrderScheduledDatetime), 'mm');
        var dateStart = dateFormat(new Date(qcData.tableWorkOrderScheduledDatetime), 'dd');
        var hoursStart = dateFormat(new Date(), 'HH');
        var minStart = dateFormat(new Date(), 'MM');
        var secStart = dateFormat(new Date(), 'ss');

        var yearEnd = dateFormat(new Date(qcData.tableWorkOrderScheduledEndDatetime), 'yyyy');
        var monthEnd = dateFormat(new Date(qcData.tableWorkOrderScheduledEndDatetime), 'mm');
        var dateEnd = dateFormat(new Date(qcData.tableWorkOrderScheduledEndDatetime), 'dd');
        var hoursEnd = dateFormat(new Date(), 'HH');
        var minEnd = dateFormat(new Date(), 'MM');
        var secEnd = dateFormat(new Date(), 'ss');

        var postqcData = {
            "tableWorkOrderSkuQuantity": qcData.tableWorkOrderSkuQuantity,
            "tableWorkOrderSkus": tableWorkOrderSkus,
            "tableSkuInventory": null,
            "tableWorkOrderStatusType": {
                "idtableWorkOrderStatusTypeId": 1,
                "tableWorkOrderStatusTypeString": "New"
            },
            "tableWorkOrderAdditionalQc": a,
            "tableWorkOrderType": {
                "idtableWorkOrderTypeId": 6,
                "tableWorkOrderTypeString": "QC"
            },
            "tableWorkOrderStateTrails": []
        }

        postqcData.tableWorkOrderScheduledDatetime = [
            parseInt(yearStart),
            parseInt(monthStart),
            parseInt(dateStart),
            parseInt(hoursStart),
            parseInt(minStart),
            parseInt(secStart)
        ]

        postqcData.tableWorkOrderScheduledEndDatetime = [
            parseInt(yearEnd),
            parseInt(monthEnd),
            parseInt(dateEnd),
            parseInt(hoursEnd),
            parseInt(minEnd),
            parseInt(secEnd)
        ]

        $http({
            method: 'POST',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/workorder',
            data: postqcData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            if (res) {
                $scope.notify("Work Order - QC Created Successfully",'success');
                $scope.qcData = null;
                qcData = null;
                $scope.skuId = null;
                // $scope.listOfWorkOrdersCreatedQc();
                $scope.listOfWorkOrderQcCount($scope.defaultTabQc,$scope.vmPagerWoQcStart.currentPage);
                // $scope.listOfWorkOrders();
                $scope.listOfWorkOrderCount($scope.defaultTab,$scope.vmPagerWoStart.currentPage);
                $scope.mode = 'add';
                $mdDialog.hide();
            }
        }).error(function(error, status) {



           $scope.notify("Work Order - QC cannot be created");
        });
    };

    //update qc data back to oms
    $scope.updateQcData = function(qcData, selectList, qcId) {
        var arr = [];
        for (var i = 0; i < selectList.length; i++) {
            arr.push(selectList[i])
        }

        var a = arr.join("|");


        var tableWorkOrderSkus = [];
        tableWorkOrderSkus.push({
            idtableWorkOrderSkuId: $scope.idtableWorkOrderSkuId,
            tableSku: $scope.productObj
        });
        var yearStart = dateFormat(new Date(qcData.tableWorkOrderScheduledDatetime), 'yyyy');
        var monthStart = dateFormat(new Date(qcData.tableWorkOrderScheduledDatetime), 'mm');
        var dateStart = dateFormat(new Date(qcData.tableWorkOrderScheduledDatetime), 'dd');
        var hoursStart = dateFormat(new Date(), 'HH');
        var minStart = dateFormat(new Date(), 'MM');
        var secStart = dateFormat(new Date(), 'ss');

        var yearEnd = dateFormat(new Date(qcData.tableWorkOrderScheduledEndDatetime), 'yyyy');
        var monthEnd = dateFormat(new Date(qcData.tableWorkOrderScheduledEndDatetime), 'mm');
        var dateEnd = dateFormat(new Date(qcData.tableWorkOrderScheduledEndDatetime), 'dd');
        var hoursEnd = dateFormat(new Date(), 'HH');
        var minEnd = dateFormat(new Date(), 'MM');
        var secEnd = dateFormat(new Date(), 'ss');

        var putqcData = qcData;
        putqcData.tableWorkOrderAdditionalQc = a;
        putqcData.tableWorkOrderScheduledDatetime = [
            parseInt(yearStart),
            parseInt(monthStart),
            parseInt(dateStart),
            parseInt(hoursStart),
            parseInt(minStart),
            parseInt(secStart)
        ]

        putqcData.tableWorkOrderScheduledEndDatetime = [
            parseInt(yearEnd),
            parseInt(monthEnd),
            parseInt(dateEnd),
            parseInt(hoursEnd),
            parseInt(minEnd),
            parseInt(secEnd)
        ]

        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/workorder/' + qcId,
            data: putqcData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            if (res) {
                $scope.notify("Work Order - QC Updated Successfully",'success');
                $scope.qcData = null;
                qcData = null;
                $scope.skuId = null;
                // $scope.listOfWorkOrdersCreatedQc();
                $scope.listOfWorkOrderQcCount($scope.defaultTabQc,$scope.vmPagerWoQcStart.currentPage);
                // $scope.listOfWorkOrders();
                $scope.listOfWorkOrderCount($scope.defaultTab,$scope.vmPagerWoStart.currentPage);
                $scope.dialogBoxQC = 'add';
                 $('#confirmEditWorkOrder').modal('hide');
                $mdDialog.hide();
            }
        }).error(function(error, status) {



            $scope.dialogBoxQC = 'add';
           $scope.notify("Work Order - QC cannot be updated");
        });
    };

    //adding list of product for stock audit
    $scope.addProduct = function(tableSku) {

        $scope.products.push({
            tableSku: tableSku.originalObject
        });

        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
    };

    // add stock audit data to oms backend
    $scope.addStockData = function(stockData) {
        var yearStart = dateFormat(new Date(stockData.tableWorkOrderScheduledDatetime), 'yyyy');
        var monthStart = dateFormat(new Date(stockData.tableWorkOrderScheduledDatetime), 'mm');
        var dateStart = dateFormat(new Date(stockData.tableWorkOrderScheduledDatetime), 'dd');
        var hoursStart = dateFormat(new Date(), 'HH');
        var minStart = dateFormat(new Date(), 'MM');
        var secStart = dateFormat(new Date(), 'ss');

        var yearEnd = dateFormat(new Date(stockData.tableWorkOrderScheduledEndDatetime), 'yyyy');
        var monthEnd = dateFormat(new Date(stockData.tableWorkOrderScheduledEndDatetime), 'mm');
        var dateEnd = dateFormat(new Date(stockData.tableWorkOrderScheduledEndDatetime), 'dd');
        var hoursEnd = dateFormat(new Date(), 'HH');
        var minEnd = dateFormat(new Date(), 'MM');
        var secEnd = dateFormat(new Date(), 'ss');

        var postStockData = {
            "tableWorkOrderSkus": $scope.products,
            "tableWarehouseDetails": stockData.tableWarehouseDetails,
            "tableSkuInventory": null,
            "tableWorkOrderStatusType": {
                "idtableWorkOrderStatusTypeId": 1,
                "tableWorkOrderStatusTypeString": "New"
            },
            "tableWorkOrderType": {
                "idtableWorkOrderTypeId": 7,
                "tableWorkOrderTypeString": "Stock Audit"
            },
            "tableWorkOrderStateTrails": []
        }

        postStockData.tableWorkOrderScheduledDatetime = [
            parseInt(yearStart),
            parseInt(monthStart),
            parseInt(dateStart),
            parseInt(hoursStart),
            parseInt(minStart),
            parseInt(secStart)
        ]

        postStockData.tableWorkOrderScheduledEndDatetime = [
            parseInt(yearEnd),
            parseInt(monthEnd),
            parseInt(dateEnd),
            parseInt(hoursEnd),
            parseInt(minEnd),
            parseInt(secEnd)
        ]

        $http({
            method: 'POST',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/workorder',
            data: postStockData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            if (res) {
                $scope.notify("Work Order - Stock Created Successfully",'success');
                $scope.stockData = null;
                stockData = null;
                $scope.products = [];
                $scope.skuId = null;
                // $scope.listOfWorkOrdersCreatedStock();
                $scope.listOfWorkOrderStockCount($scope.defaultTabStock,$scope.vmPagerWoStockStart.currentPage);
                // $scope.listOfWorkOrders();
                $scope.listOfWorkOrderCount($scope.defaultTab,$scope.vmPagerWoStart.currentPage);
                $scope.dialogBoxStock = 'add';
                $mdDialog.hide();
            }
        }).error(function(error, status) {



            $scope.dialogBoxStock = 'add';
           $scope.notify("Work Order - Stock Cannot be Added");
        });
    };

    // update stock audit data to oms backend
    $scope.updateStockData = function(stockData, stockId) {
        var yearStart = dateFormat(new Date(stockData.tableWorkOrderScheduledDatetime), 'yyyy');
        var monthStart = dateFormat(new Date(stockData.tableWorkOrderScheduledDatetime), 'mm');
        var dateStart = dateFormat(new Date(stockData.tableWorkOrderScheduledDatetime), 'dd');
        var hoursStart = dateFormat(new Date(), 'HH');
        var minStart = dateFormat(new Date(), 'MM');
        var secStart = dateFormat(new Date(), 'ss');

        var yearEnd = dateFormat(new Date(stockData.tableWorkOrderScheduledEndDatetime), 'yyyy');
        var monthEnd = dateFormat(new Date(stockData.tableWorkOrderScheduledEndDatetime), 'mm');
        var dateEnd = dateFormat(new Date(stockData.tableWorkOrderScheduledEndDatetime), 'dd');
        var hoursEnd = dateFormat(new Date(), 'HH');
        var minEnd = dateFormat(new Date(), 'MM');
        var secEnd = dateFormat(new Date(), 'ss');

        var putStockData = stockData;
        putStockData.tableWorkOrderSkus = $scope.products;

        putStockData.tableWorkOrderScheduledDatetime = [
            parseInt(yearStart),
            parseInt(monthStart),
            parseInt(dateStart),
            parseInt(hoursStart),
            parseInt(minStart),
            parseInt(secStart)
        ]

        putStockData.tableWorkOrderScheduledEndDatetime = [
            parseInt(yearEnd),
            parseInt(monthEnd),
            parseInt(dateEnd),
            parseInt(hoursEnd),
            parseInt(minEnd),
            parseInt(secEnd)
        ]


        delete putStockData.productObj;

        console.log(putStockData);
        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/workorder/' + stockId,
            data: putStockData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            if (res) {

                $scope.notify("Work Order - Stock Updated Successfully",'success');
                $scope.stockData = null;
                stockData = null;
                $scope.products = [];
                $scope.skuId = null;
                // $scope.listOfWorkOrdersCreatedStock();
                $scope.listOfWorkOrderStockCount($scope.defaultTabStock,$scope.vmPagerWoStockStart.currentPage);
                // $scope.listOfWorkOrders();
                $scope.listOfWorkOrderCount($scope.defaultTab,$scope.vmPagerWoStart.currentPage);
                $scope.dialogBoxStock = 'add';
                 $('#confirmEditWorkOrder').modal('hide');
                $mdDialog.hide();
            }
        }).error(function(error, status) {



            $scope.dialogBoxStock = 'add';
           $scope.notify("Work Order - Stock Cannot be Updated");
        });
    };

    // add sticker data to oms backend
    $scope.addStickerData = function(stickerData, inventory) {
        var yearStart = dateFormat(new Date(stickerData.tableWorkOrderScheduledDatetime), 'yyyy');
        var monthStart = dateFormat(new Date(stickerData.tableWorkOrderScheduledDatetime), 'mm');
        var dateStart = dateFormat(new Date(stickerData.tableWorkOrderScheduledDatetime), 'dd');
        var hoursStart = dateFormat(new Date(), 'HH');
        var minStart = dateFormat(new Date(), 'MM');
        var secStart = dateFormat(new Date(), 'ss');

        var yearEnd = dateFormat(new Date(stickerData.tableWorkOrderScheduledEndDatetime), 'yyyy');
        var monthEnd = dateFormat(new Date(stickerData.tableWorkOrderScheduledEndDatetime), 'mm');
        var dateEnd = dateFormat(new Date(stickerData.tableWorkOrderScheduledEndDatetime), 'dd');
        var hoursEnd = dateFormat(new Date(), 'HH');
        var minEnd = dateFormat(new Date(), 'MM');
        var secEnd = dateFormat(new Date(), 'ss');

        var tableWorkOrderSkus = [];
        tableWorkOrderSkus.push({
            tableSku: $scope.skuProduct
        });

        var postStickerData = {
            "tableWorkOrderSkus": tableWorkOrderSkus,
            "tableWarehouseDetails": stickerData.tableWarehouseDetails,
            "tableSkuInventory": inventory,
            "tableStickerTemplate": stickerData.tableStickerTemplate,
            "tableWorkOrderStatusType": {
                "idtableWorkOrderStatusTypeId": 1,
                "tableWorkOrderStatusTypeString": "New"
            },
            "tableWorkOrderType": {
                "idtableWorkOrderTypeId": 8,
                "tableWorkOrderTypeString": "Stickers"
            },
            "tableWorkOrderStateTrails": []
        }

        postStickerData.tableWorkOrderScheduledDatetime = [
            parseInt(yearStart),
            parseInt(monthStart),
            parseInt(dateStart),
            parseInt(hoursStart),
            parseInt(minStart),
            parseInt(secStart)
        ]

        postStickerData.tableWorkOrderScheduledEndDatetime = [
            parseInt(yearEnd),
            parseInt(monthEnd),
            parseInt(dateEnd),
            parseInt(hoursEnd),
            parseInt(minEnd),
            parseInt(secEnd)
        ]

        $http({
            method: 'POST',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/workorder',
            data: postStickerData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            if (res) {
                $scope.notify("Work Order - Sticker Created Successfully",'success');
                $scope.stickerData = null;
                stickerData = null;
                $scope.$broadcast('angucomplete-alt:clearInput', 'products');
                $scope.skuId = null;
                // $scope.listOfWorkOrdersCreatedSticker();
                $scope.listOfWorkOrderStickerCount($scope.defaultTabSticker,$scope.vmPagerWoStickerStart.currentPage);
                // $scope.listOfWorkOrders();
                $scope.listOfWorkOrderCount($scope.defaultTab,$scope.vmPagerWoStart.currentPage);
                $scope.mode = 'add';
                $mdDialog.hide();
            }
        }).error(function(error, status) {



           $scope.notify("Work Order - Sticker Cannot be Added");
        });
    };

    // update sticker data to oms backend
    $scope.updateStickerData = function(stickerData, inventory, stickerId) {
        var yearStart = dateFormat(new Date(stickerData.tableWorkOrderScheduledDatetime), 'yyyy');
        var monthStart = dateFormat(new Date(stickerData.tableWorkOrderScheduledDatetime), 'mm');
        var dateStart = dateFormat(new Date(stickerData.tableWorkOrderScheduledDatetime), 'dd');
        var hoursStart = dateFormat(new Date(), 'HH');
        var minStart = dateFormat(new Date(), 'MM');
        var secStart = dateFormat(new Date(), 'ss');

        var yearEnd = dateFormat(new Date(stickerData.tableWorkOrderScheduledEndDatetime), 'yyyy');
        var monthEnd = dateFormat(new Date(stickerData.tableWorkOrderScheduledEndDatetime), 'mm');
        var dateEnd = dateFormat(new Date(stickerData.tableWorkOrderScheduledEndDatetime), 'dd');
        var hoursEnd = dateFormat(new Date(), 'HH');
        var minEnd = dateFormat(new Date(), 'MM');
        var secEnd = dateFormat(new Date(), 'ss');

        var tableWorkOrderSkus = [];
        tableWorkOrderSkus.push({
            idtableWorkOrderSkuId: $scope.idtableWorkOrderSkuId,
            tableSku: $scope.skuProduct
        });

        var putStickerData = stickerData;
        putStickerData.tableWorkOrderSkus = tableWorkOrderSkus;
        putStickerData.tableSkuInventory = inventory;

        putStickerData.tableWorkOrderScheduledDatetime = [
            parseInt(yearStart),
            parseInt(monthStart),
            parseInt(dateStart),
            parseInt(hoursStart),
            parseInt(minStart),
            parseInt(secStart)
        ]

        putStickerData.tableWorkOrderScheduledEndDatetime = [
            parseInt(yearEnd),
            parseInt(monthEnd),
            parseInt(dateEnd),
            parseInt(hoursEnd),
            parseInt(minEnd),
            parseInt(secEnd)
        ]

        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/workorder/' + stickerId,
            data: putStickerData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            if (res) {
                $scope.notify("Work Order - Sticker Updated Successfully",'success');
                $scope.stickerData = null;
                stickerData = null;
                $scope.$broadcast('angucomplete-alt:clearInput', 'products');

                $scope.invStickerLists = "";
                $scope.radio = "";
                $scope.skuId = null;
                // $scope.listOfWorkOrdersCreatedSticker();
                $scope.listOfWorkOrderStickerCount($scope.defaultTabSticker,$scope.vmPagerWoStickerStart.currentPage);
                // $scope.listOfWorkOrders();
                $scope.listOfWorkOrderCount($scope.defaultTab,$scope.vmPagerWoStart.currentPage);
                $scope.dialogBoxSticker = 'add';
                 $('#confirmEditWorkOrder').modal('hide');
                $mdDialog.hide();
            }
        }).error(function(error, status) {



            $scope.dialogBoxSticker = 'add';
            $scope.stickerData = null;
            stickerData = null;
            $scope.$broadcast('angucomplete-alt:clearInput', 'products');
            $scope.invStickerLists = "";
           $scope.notify("Work Order - Sticker Cannot be Updated");
        });
    };

    //Start Date and End Date Validations Starts Here for Individual Work Orders
    $scope.callMinStartMaxStart = function() {
        $scope.todayDate = new Date();
        $scope.startminDate = new Date(
            $scope.todayDate.getFullYear(),
            $scope.todayDate.getMonth(),
            $scope.todayDate.getDate());

        $scope.endminDate = new Date(
            $scope.todayDate.getFullYear(),
            $scope.todayDate.getMonth(),
            $scope.todayDate.getDate());
    }
    $scope.callMinStartMaxStart();
    $scope.sendStartDate = function(date) {
        $scope.startDateData = new Date(date);
        $scope.endminDate = new Date(
            $scope.startDateData.getFullYear(),
            $scope.startDateData.getMonth(),
            $scope.startDateData.getDate() + 1);
    }

    $scope.sendEndDate = function(date) {
        $scope.endDateData = new Date(date);
        $scope.startmaxDate = new Date(
            $scope.endDateData.getFullYear(),
            $scope.endDateData.getMonth(),
            $scope.endDateData.getDate() - 1);
    };
    //Start Date and End Date Validations Ends Here

    //Start Date and End Date Validations Starts Here for Main Inventory and Work Orders Screen Starts Here
    $scope.callMainMinStartMaxStart = function() {
        $scope.warehouseid = undefined;
        $scope.startDate = "";
        $scope.endDate = "";
        $scope.start1Date = undefined;
        $scope.end1Date = undefined;
        $scope.todayDate = new Date();
        $scope.mainstartmaxDate = new Date(
            $scope.todayDate.getFullYear(),
            $scope.todayDate.getMonth(),
            $scope.todayDate.getDate());

        $scope.mainendmaxDate = new Date(
            $scope.todayDate.getFullYear(),
            $scope.todayDate.getMonth(),
            $scope.todayDate.getDate());

        $scope.invMinDate = new Date(
            $scope.todayDate.getFullYear(),
            $scope.todayDate.getMonth(),
            $scope.todayDate.getDate() + 1);
    };

    $scope.callMainMinStartMaxStart();

    $scope.mainsendStartDate = function(date) {
        $scope.mainstartDateData = new Date(date);
        $scope.mainendminDate = new Date(
            $scope.mainstartDateData.getFullYear(),
            $scope.mainstartDateData.getMonth(),
            $scope.mainstartDateData.getDate());
    };

    $scope.mainsendEndDate = function(date) {
        $scope.mainendDateData = new Date(date);
        $scope.mainstartmaxDate = new Date(
            $scope.mainendDateData.getFullYear(),
            $scope.mainendDateData.getMonth(),
            $scope.mainendDateData.getDate());
    };
    //Start Date and End Date Validations Starts Here for Main Inventory and Work Orders Screen Ends Here

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

    //MSP MRP Validation
    $scope.checkMspGrtMrp = function(mrp, msp) {
        if (msp > mrp) {
           $scope.notify("MSP Must Be Less than MRP")
            $scope.inventoryData.tableSkuInventoryMinSalePrice = "";
            $scope.invMRPMSP = true;
        } else {
            $scope.invMRPMSP = false;
        }
    };

    $scope.validateAvBl = function(block, available) {
        if (block > available) {
           $scope.notify("“\Blocked Count”\ Must be less than equal to “\Available Count”\.");
            $scope.inventoryData.tableSkuInventoryBlockedCount = "";
            $scope.invMRPMSP = true;
        } else {
            $scope.invMRPMSP = false;
        }
    };

    //selecting and calling api
    $scope.stickerProductObj = function(selected) {
        if ((selected != undefined || selected != null) && $scope.wIdSticker != "") {

            var skuIdSticker = selected.originalObject.idtableSkuId;
            $scope.skuProduct = selected.originalObject;
            $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/warehouses/' + $scope.wIdSticker + '/skus/' + skuIdSticker + '/inventory').success(function(response) {
                $scope.invStickerLists = response;
    
            });
        }
    };

    $scope.allWHouse = function(warehouse) {
        var warehouse = warehouse;
        $scope.wIdSticker = warehouse.idtableWarehouseDetailsId;
    };

    // dialog box to add new kit
    $scope.cancelWorkOrder = function(workOrderId, workOrderData, ev) {
        $scope.workOrderId = workOrderId;
        $scope.workOrderData = workOrderData;
        $mdDialog.show({
                templateUrl: 'dialog333.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                scope: $scope.$new()
            })
    };

    //cancel work order action
    $scope.cancelWorkOrderApi = function(workOrderId, workOrderData, remarks) {
        workOrderData.tableWorkOrderStatusType = {
            "idtableWorkOrderStatusTypeId": 5,
            "tableWorkOrderStatusTypeString": "Cancelled"
        }

        workOrderData.tableWorkOrderRemark = remarks;

        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/workorder/' + workOrderId + '/cancel',
            data: workOrderData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            if (res) {
                $scope.notify("Work Order Cancelled Successfully",'success');
                $scope.availableQuantityMode = false;
                $scope.wData = null;
                $scope.inventoryData = "";
                $scope.kitData = "";
                $scope.splitData = "";
                $scope.freeMailerData = "";
                $scope.qcData = "";
                $scope.stockData = "";
                $scope.stickerData = "";
                $scope.initialSelected = "";
                $scope.freeMailertableWorkOrderSkuQuantity = "";
                $scope.initialSelected1 = "";
                $scope.selectedList = "";
                $scope.invStickerLists = "";
                $scope.radio = "";
                $scope.skuId = "";
                $scope.mode = 'add';
                $scope.dialogBoxKit = 'add';
                $scope.dialogBoxSplit = 'add';
                $scope.dialogBoxFreeMailer = 'add';
                $scope.dialogBoxQC = 'add';
                $scope.dialogBoxStock = 'add';
                $scope.dialogBoxSticker = 'add';
                $scope.products = [];
                // $scope.listOfWorkOrders();
                $scope.listOfWorkOrderCount($scope.defaultTab,$scope.vmPagerWoStart.currentPage);
                $mdDialog.hide();
            }
        }).error(function(error, status) {



           $scope.notify("Work Order Cannot be Cancelled");
        });
    };

    $scope.loadCancelReasons = function() {
        var cancelReasonsUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/workordercancelreasons';
        $http.get(cancelReasonsUrl).success(function(data) {

            $scope.cancelReasonArray = data;

        }).error(function(error, status) {



        });
    }

    //load sticker templates
    $scope.loadStickerTemplates = function() {
        var stickerTemplateUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/stickertemplates";

        $http.get(stickerTemplateUrl).success(function(data) {
            $scope.stickertemplatesArray = data;
        });
    };

    //edit mode for work orders
    $scope.editWorkOrders = function(ev, workOrderId, workOrderType) {

        //Kit
        if (workOrderType == 1) {
            $scope.dialogBoxKit = 'edit';
            $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/workorder/' + workOrderId).success(function(response) {
    
                $scope.kitData = response;
                $scope.initialSelected = response.tableWorkOrderSkus[0].tableSku.tableSkuName;
                $scope.productObj = response.tableWorkOrderSkus[0].tableSku;
                $scope.idtableWorkOrderSkuId = response.tableWorkOrderSkus[0].idtableWorkOrderSkuId;
    
                $scope.skuId = response.tableWorkOrderSkus[0].tableSku.tableSkuClientSkuCode;
                $scope.kitData.tableWarehouseDetails = initializeDropdowns($scope.wareHousesData, 'idtableWarehouseDetailsId', response.tableWarehouseDetails.idtableWarehouseDetailsId);
                $scope.kitData.tableWorkOrderScheduledDatetime = new Date(response.tableWorkOrderScheduledDatetime);
                $scope.kitData.tableWorkOrderScheduledEndDatetime = new Date(response.tableWorkOrderScheduledEndDatetime);
                if ($scope.kitData != null) {
                    $scope.showAddKitDialog(ev);
                }
            }).error(function(error, status) {
    
    

                $scope.dialogBoxKit = "add";
               $scope.notify("Error In Loading Work Order");
            });
        }

        //Split
        if (workOrderType == 2) {
            $scope.dialogBoxSplit = 'edit';
            $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/workorder/' + workOrderId).success(function(response) {
    
                $scope.splitData = response;
                $scope.initialSelected = response.tableWorkOrderSkus[0].tableSku.tableSkuName;
                $scope.productObj = response.tableWorkOrderSkus[0].tableSku;
                $scope.idtableWorkOrderSkuId = response.tableWorkOrderSkus[0].idtableWorkOrderSkuId;
    
                $scope.skuId = response.tableWorkOrderSkus[0].tableSku.tableSkuClientSkuCode;
                $scope.splitData.tableWarehouseDetails = initializeDropdowns($scope.wareHousesData, 'idtableWarehouseDetailsId', response.tableWarehouseDetails.idtableWarehouseDetailsId);
                $scope.splitData.tableWorkOrderScheduledDatetime = new Date(response.tableWorkOrderScheduledDatetime);
                $scope.splitData.tableWorkOrderScheduledEndDatetime = new Date(response.tableWorkOrderScheduledEndDatetime);
                if ($scope.splitData != null) {
                    $scope.showAddSplitDialog(ev);
                }
            }).error(function(error, status) {
    
    

                $scope.dialogBoxSplit = "add";
               $scope.notify("Error In Loading Work Order");
            });
        }

        //FreeMailer
        if (workOrderType == 4) {
            $scope.dialogBoxFreeMailer = 'edit';
            $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/workorder/' + workOrderId).success(function(response) {
    
                $scope.freeMailerData = response;
                $scope.freeMailertableWorkOrderSkuQuantity = response.tableWorkOrderSkuQuantity;
                $scope.initialSelected = response.tableWorkOrderSkus[0].tableSku.tableSkuName;
                $scope.initialSelected1 = response.tableWorkOrderSkus[1].tableSku.tableSkuName;
                $scope.productObj = response.tableWorkOrderSkus[0].tableSku;
                $scope.idtableWorkOrderSkuId = response.tableWorkOrderSkus[0].idtableWorkOrderSkuId;
                $scope.mailerObj = response.tableWorkOrderSkus[1].tableSku;
                $scope.idtableWorkOrderSkuId1 = response.tableWorkOrderSkus[1].idtableWorkOrderSkuId;
                $scope.freeMailerData.tableWarehouseDetails = initializeDropdowns($scope.wareHousesData, 'idtableWarehouseDetailsId', response.tableWarehouseDetails.idtableWarehouseDetailsId);
                $scope.wData = initializeDropdowns($scope.wareHousesData, 'idtableWarehouseDetailsId', response.tableWarehouseDetails.idtableWarehouseDetailsId);
                $scope.freeMailerData.tableWorkOrderScheduledDatetime = new Date(response.tableWorkOrderScheduledDatetime);
                $scope.freeMailerData.tableWorkOrderScheduledEndDatetime = new Date(response.tableWorkOrderScheduledEndDatetime);


                if ($scope.freeMailerData != null) {
                    $scope.showAddFreeMailerDialog(ev);
                }
            }).error(function(error, status) {
    
    

                $scope.dialogBoxFreeMailer = "add";
               $scope.notify("Error In Loading Work Order");
            });
        }

        //QC
        if (workOrderType == 6) {
            $scope.dialogBoxQC = 'edit';
            $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/workorder/' + workOrderId).success(function(response) {
    
                $scope.qcData = response;
                $scope.selectedList = [];
                $scope.initialSelected = response.tableWorkOrderSkus[0].tableSku.tableSkuName;
                $scope.productObj = response.tableWorkOrderSkus[0].tableSku;
                $scope.idtableWorkOrderSkuId = response.tableWorkOrderSkus[0].idtableWorkOrderSkuId;
                $scope.qcData.tableWorkOrderScheduledDatetime = new Date(response.tableWorkOrderScheduledDatetime);
                $scope.qcData.tableWorkOrderScheduledEndDatetime = new Date(response.tableWorkOrderScheduledEndDatetime);


                var strVale = response.tableWorkOrderAdditionalQc;
                var arr = strVale.split('|');
    
                for (i = 0; i < arr.length; i++) {
                    $scope.selectedList.push(arr[i]);
                }
                if ($scope.qcData != null) {
                    $scope.showAddQcDialog(ev);
                }
            }).error(function(error, status) {
    
    

                $scope.dialogBoxQC = "add";
               $scope.notify("Error In Loading Work Order");
            });
        }

        //Stock Audit
        if (workOrderType == 7) {
            $scope.dialogBoxStock = 'edit';
            $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/workorder/' + workOrderId).success(function(response) {
    
                $scope.stockData = response;
                $scope.stockData.tableWarehouseDetails = initializeDropdowns($scope.wareHousesData, 'idtableWarehouseDetailsId', response.tableWarehouseDetails.idtableWarehouseDetailsId);
                $scope.stockData.tableWorkOrderScheduledDatetime = new Date(response.tableWorkOrderScheduledDatetime);
                $scope.stockData.tableWorkOrderScheduledEndDatetime = new Date(response.tableWorkOrderScheduledEndDatetime);


                for (var i = 0; i < response.tableWorkOrderSkus.length; i++) {
                    $scope.products.push({
                        idtableWorkOrderSkuId: response.tableWorkOrderSkus[i].idtableWorkOrderSkuId,
                        tableSku: response.tableWorkOrderSkus[i].tableSku
                    });
                }

                if ($scope.stockData != null) {
                    $scope.showAddStockDialog(ev);
                }
            }).error(function(error, status) {
    
    

                $scope.dialogBoxStock = "add";
               $scope.notify("Error In Loading Work Order");
            });
        }

        //Sticker
        if (workOrderType == 8) {
            $scope.dialogBoxSticker = 'edit';
            $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/workorder/' + workOrderId).success(function(response) {
    
                $scope.stickerData = response;
                $scope.stickerData.tableWarehouseDetails = initializeDropdowns($scope.wareHousesData, 'idtableWarehouseDetailsId', response.tableWarehouseDetails.idtableWarehouseDetailsId);
                $scope.stickerData.tableStickerTemplate = initializeDropdowns($scope.stickertemplatesArray, 'idtableStickerTemplateId', response.tableStickerTemplate.idtableStickerTemplateId);

                $scope.initialSelected = response.tableWorkOrderSkus[0].tableSku.tableSkuName;
                $scope.skuProduct = response.tableWorkOrderSkus[0].tableSku;
                $scope.idtableWorkOrderSkuId = response.tableWorkOrderSkus[0].idtableWorkOrderSkuId;
    
    
                $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/warehouses/' + response.tableWarehouseDetails.idtableWarehouseDetailsId + '/skus/' + $scope.skuProduct.idtableSkuId + '/inventory').success(function(data) {
        
                    $scope.invStickerLists = data;
        
                    $scope.radio = response.tableSkuInventory;
        
                });
                $scope.stickerData.tableWorkOrderScheduledDatetime = new Date(response.tableWorkOrderScheduledDatetime);
                $scope.stickerData.tableWorkOrderScheduledEndDatetime = new Date(response.tableWorkOrderScheduledEndDatetime);

                if ($scope.stickerData != null) {
                    $scope.showAddStickerDialog(ev);
                }
            }).error(function(error, status) {
    
    

                $scope.dialogBoxSticker = "add";
               $scope.notify("Error In Loading Work Order");
            });
        }
    };

    $scope.fullproductObj = function(selected) {
        if (selected != null) {
            $scope.skuId = selected.originalObject.tableSkuClientSkuCode;
            $scope.skuFullId = selected.originalObject.idtableSkuId;
            $scope.productObj = selected.originalObject;
            if ($scope.wData != null) {
                $scope.availableQuantityMode = true;
                $scope.availableQuantity($scope.wData, selected.originalObject.idtableSkuId);
            }
        }
    };

    $scope.fullmailerObj = function(selected) {
        $scope.skuFullId = selected.originalObject.idtableSkuId;
        if (selected != null) {
            $scope.mailerObj = selected.originalObject;
            if ($scope.wData != null) {
                $scope.availableQuantity($scope.wData, selected.originalObject.idtableSkuId);
            }
        }
    };

    $scope.loadWareHousesData = function(wData) {
        $scope.wData = wData;
        if ($scope.skuFullId != null) {
            $scope.availableQuantityMode = true;
            $scope.availableQuantity($scope.wData, $scope.skuFullId);
        }
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
    };

    //add new qc code
    $scope.addQc = function(qcName) {
        var postNewQcData = {
            "tableSkuQcParameterTypeString": qcName,
            "tableSkuQcParameterTypeIsAdditional": true
        }

        $http({
            method: 'POST',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/skuqctypes',
            data: postNewQcData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            if (res) {
                $scope.notify("New QC Type Added Successfully",'success');
                $scope.qcName = null;
                qcName = null;
                $scope.qcTrueLists();
            }
        }).error(function(error, status) {



           $scope.notify("New QC Type Cannot be Added");
        });
    };


    $scope.callInitialTabDisabled = function(){
        $scope.isSubmitDisabledInv = true;
        $scope.isResetDisabledInv = true;
    }

    $scope.stateTrials = function(stateTrials) {
        console.log(stateTrials);
        console.log(stateTrials.length);
        $scope.trialsLength = stateTrials.length;
        $scope.trialsDataArray = [];
        $scope.trialIdArray = [];
        $scope.trialsLength = [];
        $scope.fullTrialsArray = [];
        $scope.fullIdArray = [];
        for (var i = 0; i < stateTrials.length; i++) {
            console.log(i);
            console.log(stateTrials[i]);
            var trials = stateTrials[i];
            // $scope.trialsLength.push(trials.length);
            // console.log(trials);
            // console.log($scope.trialsLength);
            if (stateTrials.length < 4) {
                $scope.trialsDataArray.push(stateTrials[i].tableWorkOrderStatusType.tableWorkOrderStatusTypeString);
                $scope.trialIdArray.push(stateTrials[i].tableWorkOrderStatusType.idtableWorkOrderStatusTypeId);
            }

            if (stateTrials.length == 4) {
                $scope.trialsDataArray.push(stateTrials[i].tableWorkOrderStatusType.tableWorkOrderStatusTypeString);
                $scope.trialIdArray.push(stateTrials[i].tableWorkOrderStatusType.idtableWorkOrderStatusTypeId);
            }

            if (stateTrials.length > 4) {

                console.log(stateTrials.length - 4);
                var totalLength = stateTrials.length - 4;
                for (var j = totalLength; j < stateTrials.length; j++) {
                    $scope.trialsDataArray.push(stateTrials[j].tableWorkOrderStatusType.tableWorkOrderStatusTypeString);
                    $scope.trialIdArray.push(stateTrials[j].tableWorkOrderStatusType.idtableWorkOrderStatusTypeId);
                }
          }
        }


        $scope.fullTrialsArray = $scope.trialsDataArray;
        $scope.fullIdArray = $scope.trialIdArray;

        $scope.trialsDataArray = [];
        $scope.trialIdArray = [];

        console.log($scope.fullTrialsArray);
    };
}]);

//Dialog Controller
function DialogController($scope, $mdDialog) {
    $scope.hide = function() {
        $mdDialog.hide();
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };

    $scope.answer = function(answer) {
        $mdDialog.hide(answer);
    };
}
/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function() {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function(val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };

    // Regexes and supporting functions are cached through closure
    return function(date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d: d,
                dd: pad(d),
                ddd: dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m: m + 1,
                mm: pad(m + 1),
                mmm: dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy: String(y).slice(2),
                yyyy: y,
                h: H % 12 || 12,
                hh: pad(H % 12 || 12),
                H: H,
                HH: pad(H),
                M: M,
                MM: pad(M),
                s: s,
                ss: pad(s),
                l: pad(L, 3),
                L: pad(L > 99 ? Math.round(L / 10) : L),
                t: H < 12 ? "a" : "p",
                tt: H < 12 ? "am" : "pm",
                T: H < 12 ? "A" : "P",
                TT: H < 12 ? "AM" : "PM",
                Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

// Some common format strings
dateFormat.masks = {
    "default": "ddd mmm dd yyyy HH:MM:ss",
    shortDate: "m/d/yy",
    mediumDate: "mmm d, yyyy",
    longDate: "mmmm d, yyyy",
    fullDate: "dddd, mmmm d, yyyy",
    shortTime: "h:MM TT",
    mediumTime: "h:MM:ss TT",
    longTime: "h:MM:ss TT Z",
    isoDate: "yyyy-mm-dd",
    isoTime: "HH:MM:ss",
    isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]
};

// For convenience...
Date.prototype.format = function(mask, utc) {
    return dateFormat(this, mask, utc);
};
