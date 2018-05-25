angular.module('OMSApp.analytics', []).config(function config($stateProvider) {
    $stateProvider.state('/analytics', {
        name: '/analytics',
        url: '/analytics',
        views: {
            "main": {
                controller: 'analyticsCtrl',
                templateUrl: 'analytics/analytics.view.html'
            },
            "header": {
                controller: 'headerCtrl',
                templateUrl: '../shared/templates/header.html'
            }
        },
        data: {pageTitle: 'Analytics'}
    })

}).controller('analyticsCtrl',['$scope', '$http', '$location', 'MavenAppConfig','$rootScope',
function analyticsCtrl($scope, $http, $location, MavenAppConfig,$rootScope) {
    $scope.activeTab = 0;
    $scope.showOrdersLoader = true;
    $scope.showInventoryLoader = true;
    $scope.showInventory = false;
    $scope.showOrders = false;
    // Order filter handles
    $scope.orderValue = {};
    $scope.orderDate = {};
    $scope.perUnitPrice = {};
    //Inventory filter handles
    $scope.inventoryItemCost = {};
    $scope.inventoryDate = {};

    $scope.allFilters = {};
    $scope.interval = {};
    $scope.intervals = [
        {name : "Days",interval : d3.time.day , unit:d3.time.days},
        {name : "Weeks",interval : d3.time.week ,unit:d3.time.weeks},
        {name : "Months",interval : d3.time.month ,unit:d3.time.months},
        {name : "Years",interval : d3.time.year ,unit:d3.time.years}
        ];
    $scope.interval.current = $scope.intervals[0];

    //Function to detect tab change
    $scope.onTabChanges = function (number) {
        $scope.interval.current = $scope.intervals[0];
        if (number == 0) {
            if($scope.showInventory){

                // deregisterChart([
                //     { chart:$scope.warehouse , group:$scope.warehouseGroup},
                //     { chart:$scope.sku , group:$scope.skuGroup},
                //     { chart:$scope.daysOfInventory , group:$scope.daysOfInventoryGroup},
                //     { chart:$scope.sellthroughvol , group:$scope.sellThroughVolumeGroup},
                //     { chart:$scope.sellthroughval , group:$scope.sellThroughValueGroup}
                // ]);
                //disposeDim([$scope.skuCodeDim,$scope.skuCostDim,$scope.skuDaysDim,$scope.skuDim,$scope.warehouseDim]);
                dc.chartRegistry.clear(null);
                $scope.inventoryCf.remove();
                d3.selectAll("svg").remove();
            }
            if ($scope.showOrders) {

                $scope.showOrdersChart({}, {}, {});
            }

        }
        else if (number == 1) {
            if($scope.showOrders){
                // deregisterChart([
                //     { chart:$scope.volume , group:$scope.dailyVolumeGroup},
                //     { chart:$scope.value , group:$scope.dailyValueGroup},
                //     { chart:$scope.channel , group:$scope.channelGroup},
                //     { chart:$scope.state , group:$scope.stateGroup},
                //     { chart:$scope.category , group:$scope.categoryGroup},
                //     { chart:$scope.item , group:$scope.itemGroup},
                //     { chart:$scope.customer , group:$scope.customerGroup},
                //     { chart:$scope.totalOrderCount , group:$scope.orderIdGroup},
                //     { chart:$scope.totalOrderCountPercent , group:$scope.orderIdGroup},
                //     { chart:$scope.totalOrderCost , group:$scope.orderIdGroup},
                //     { chart:$scope.totalOrderCostPercent , group:$scope.orderIdGroup}
                // ]);
                //disposeDim([$scope.orderIdDim,$scope.totalOrderDim,$scope.valueDim,$scope.perUnitPriceDim,$scope.daysDim,$scope.channelDim,$scope.stateDim,$scope.categoryDim,$scope.itemDim,$scope.customerDim]);
                dc.chartRegistry.clear(null);
                d3.selectAll("svg").remove();
                $scope.ordersCf.remove();
            }
            if ($scope.showInventory) {
                $scope.showInventoryChart();
            }
        }
    }
    // HTTP request to get Orders and Inventory Data
    $http({method: 'GET', url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/orderreports/orderscsv'})
        .then(function (response) {
            if (response.status == 200 && response.data.length) {
                $scope.orders = d3.csv.parse(response.data);
                if ($scope.orders.length) {
                    $scope.showOrders = true;
                    $scope.showOrdersChart();
                }
                $scope.showOrdersLoader = false;

            }

            return $http({method: 'GET', url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/inventoryreports/inventorycsv'})
        })
        .then(function (response) {
            if (response.status == 200 && response.data.length) {
                $scope.inventory = d3.csv.parse(response.data);
                if ($scope.inventory.length) {
                    $scope.showInventory = true;
                    if($scope.activeTab == 1){
                        $scope.showInventoryChart();
                    }

                }
                $scope.showInventoryLoader = false;
            }
        })
        .catch(function (data, status, headers, config) {
            $scope.showOrdersLoader = false;
            $scope.showInventoryLoader = false;

        });



    //Function to create all Orders charts
    $scope.showOrdersChart = function (range, filteredDate, filtererUnitPrice) {

        var pieWidth = angular.element(document.querySelector(".pieChart"))[0].clientWidth;
        var barWidth = angular.element(document.querySelector(".barChart"))[0].clientWidth;
        if (!( range && Object.keys(range).length )) {

            //Creating charts and number displays
            $scope.volume = dc.barChart("#volume");
            $scope.value = dc.barChart("#value");
            $scope.channel = dc.pieChart('#channelName');
            $scope.state = dc.pieChart('#state');
            $scope.category = dc.pieChart('#category');
            $scope.item = dc.pieChart('#skuName');
            $scope.customer = dc.pieChart('#customer');
            $scope.totalOrderCount = dc.numberDisplay('#totalOrders');
            $scope.totalOrderCountPercent = dc.numberDisplay('#totalOrdersPercent');
            $scope.totalOrderCost = dc.numberDisplay('#totalOrderValue');
            $scope.totalOrderCostPercent = dc.numberDisplay('#totalOrderValuePercent');

            $scope.ordersCf = crossfilter($scope.orders);
            $scope.allOrders = $scope.ordersCf.groupAll();

            //Grouping all orders data to calculate the totals
            $scope.totalOrdersGroup = $scope.allOrders.reduce(
                function (p, v) {
                    if (v.orderid in p.orderids) {
                        p.orderids[v.orderid]++;
                    }
                    else {
                        p.orderids[v.orderid] = 1;
                        p.oderCount++;
                    }
                    p.orderValue += Number(v.value);
                    return p;
                },
                function (p, v) {
                    p.orderids[v.orderid]--;
                    p.orderValue -= Number(v.value);
                    if (p.orderids[v.orderid] === 0) {
                        delete p.orderids[v.orderid];
                        p.oderCount--;

                    }
                    return p;
                },
                function (p, v) {
                    return {oderCount: 0, orderids: {}, orderValue: 0};

                }
            );

            //Total of all orders cost for percentage calculation
            $scope.totalCostOfAllOrders = angular.copy(Math.round($scope.totalOrdersGroup.value().orderValue));
            //Total of orders for percentage calculation
            $scope.totalCountOfAllOrders = angular.copy($scope.totalOrdersGroup.value().oderCount);

            //Dimension by total order value
            $scope.totalOrderDim = $scope.ordersCf.dimension(function (d) {
                return d.totalvalue = +d.totalvalue;
            });

            //Dimension by order value
            $scope.valueDim = $scope.ordersCf.dimension(function (d) {
                return d.value = +d.value;
            });
            //Dimension by orderid for number display
            $scope.orderIdDim = $scope.ordersCf.dimension(function (d) {
                return d.orderid;
            });
            //Grouping By OrderID for number display
            $scope.orderIdGroup = $scope.orderIdDim.groupAll().reduce(
                function (p, v) { //add
                    if (p[v.orderid]) {
                        p[v.orderid] += v.value;
                    } else {
                        p[v.orderid] = v.value;
                    }
                    return p;
                },
                function (p, v) { //remove
                    p[v.orderid] -= v.value;
                    if (p[v.orderid] === 0) {
                        delete p[v.orderid];
                    }
                    return p;
                },
                function () { //init
                    //initial p - only one since using groupAll
                    return {};
                }
            );
            //Dimension by per unit price
            $scope.perUnitPriceDim = $scope.ordersCf.dimension(function (d) {
                return +d.perunitprice;
            });
            //Dimension by days
            $scope.daysDim = $scope.ordersCf.dimension(function (d) {
                return  $scope.interval.current.interval(new Date(d.orderdate));
            });
            //Grouping by volume daily
            $scope.dailyVolumeGroup = $scope.daysDim.group().reduceSum(function (d) {
                return d.volume = +d.volume;
            });
            //Grouping by value daily
            $scope.dailyValueGroup = $scope.daysDim.group().reduceSum(function (d) {
                return d.value = +d.value;
            });
            //Dimension by channel name
            $scope.channelDim = $scope.ordersCf.dimension(function (d) {
                return d.channelname;
            });
            //Grouping by channel name
            $scope.channelGroup = $scope.channelDim.group().reduce(reduceAdd, reduceRemove, reduceInitial);
            //Dimension by state
            $scope.stateDim = $scope.ordersCf.dimension(function (d) {
                return d.state;
            });
            //Grouping by state
            $scope.stateGroup = $scope.stateDim.group().reduce(reduceAdd, reduceRemove, reduceInitial);
            //Dimension by category
            $scope.categoryDim = $scope.ordersCf.dimension(function (d) {
                return d.categoryname;
            });
            //Grouping by category
            $scope.categoryGroup = $scope.categoryDim.group().reduce(reduceAdd, reduceRemove, reduceInitial);
            //Dimension by skuname
            $scope.itemDim = $scope.ordersCf.dimension(function (d) {
                return d.skuname;
            });
            //Grouping by skuname
            $scope.itemGroup = $scope.itemDim.group().reduce(reduceAdd, reduceRemove, reduceInitial);
            //Dimension by customer
            $scope.customerDim = $scope.ordersCf.dimension(function (d) {
                return d.custname;
            });
            // Grouping by customer
            $scope.customerGroup = $scope.customerDim.group().reduce(reduceAdd, reduceRemove, reduceInitial);

        }
        //Filtering when the Order Value slider is changed (if part runs first time only.Filtering is done in else part)
        if (!( range && Object.keys(range).length )) {
            if ($scope.totalOrderDim.top(Infinity).length) {
                var minOrderValue = $scope.totalOrderDim.bottom(1)[0].value;
                var maxOrderValue = $scope.totalOrderDim.top(1)[0].value;
                $scope.orderValue.maxValue = maxOrderValue;
                $scope.orderValue.value = minOrderValue;
                $scope.orderValue.options = {
                    floor: parseInt(Number(minOrderValue)),
                    ceil: parseInt(Number(maxOrderValue)),
                    minRange: parseInt(Number(minOrderValue)),
                    onEnd: $scope.onOrderValueFilter,
                    translate: function(value) {
                        return d3.format(',')(value);
                    }
                }
            }

        }
        else {
            $scope.totalOrderDim.filterFunction(function (d) {
                return d >= range.value && d <= range.maxValue;
            });
        }
        //Filtering when the Order date slider is changed (if part runs first time only.Filtering is done in else part)
        if (!( filteredDate && Object.keys(filteredDate).length )) {
            if ($scope.daysDim.top(Infinity).length) {
                var minOrderDate = $scope.interval.current.interval(new Date($scope.daysDim.bottom(1)[0].orderdate)).getTime();
                var maxOrderDate = $scope.interval.current.interval(new Date($scope.daysDim.top(1)[0].orderdate)).getTime();
                $scope.orderDate.maxValue = maxOrderDate;
                $scope.orderDate.value = minOrderDate !== maxOrderDate ? minOrderDate : $scope.interval.current.interval.offset(minOrderDate , -2).getTime();
                $scope.orderDate.options = {
                    floor: $scope.interval.current.interval.offset(minOrderDate , -2).getTime(),
                    ceil: $scope.interval.current.interval.offset(maxOrderDate , 2).getTime(),
                    minRange: d3.time.day.range($scope.interval.current.interval.offset(minOrderDate , 1), $scope.interval.current.interval.offset(minOrderDate , 2), 1).length * 86400000,
                    step: d3.time.day.range($scope.interval.current.interval.offset(minOrderDate , 1), $scope.interval.current.interval.offset(minOrderDate , 2), 1).length * 86400000,
                    translate: function (value) {
                        return moment(value).format('DD/MM/YYYY');
                    },
                    onEnd: $scope.onOrderDateFilter

                }
                $scope.startDate = $scope.interval.current.interval(new Date($scope.daysDim.bottom(1)[0].orderdate));
                $scope.endDate = $scope.interval.current.interval(new Date($scope.daysDim.top(1)[0].orderdate));
            }
        }
        else {
            $scope.daysDim.filterFunction(function (d) {
                return ($scope.interval.current.interval(new Date(d)) >= new Date(filteredDate.value) && $scope.interval.current.interval(new Date(d)) <= new Date(filteredDate.maxValue));
            });
            if ($scope.daysDim.top(Infinity).length) {
                $scope.startDate = $scope.interval.current.interval(new Date($scope.daysDim.bottom(1)[0].orderdate));
                $scope.endDate = $scope.interval.current.interval(new Date($scope.daysDim.top(1)[0].orderdate));
                $scope.dailyVolumeGroup = $scope.daysDim.group().reduceSum(function (d) {
                    return d.volume = +d.volume;
                });
                $scope.dailyValueGroup = $scope.daysDim.group().reduceSum(function (d) {
                    return d.value = +d.value;
                });

            }
            else {
                $scope.startDate = $scope.orderDate.value;
                $scope.endDate = $scope.orderDate.maxValue;
            }
            //$scope.dailyVolumeGroup = remove_empty_bins1($scope.dailyVolumeGroup, $scope.startDate, $scope.endDate);
            //$scope.dailyValueGroup = remove_empty_bins1($scope.dailyValueGroup, $scope.startDate, $scope.endDate);

        }


        //Filtering when the unit price slider is changed (if part runs first time only.Filtering is done in else part)
        if (!( filtererUnitPrice && Object.keys(filtererUnitPrice).length )) {
            if ($scope.perUnitPriceDim.top(Infinity).length) {
                var minUnitPrice = $scope.perUnitPriceDim.bottom(1)[0].perunitprice;
                var maxUnitPrice = $scope.perUnitPriceDim.top(1)[0].perunitprice;
                $scope.perUnitPrice.maxValue = Number(maxUnitPrice);
                $scope.perUnitPrice.value = Number(minUnitPrice);
                $scope.perUnitPrice.options = {
                    floor: parseInt(Number(minUnitPrice)),
                    ceil: parseInt(Number(maxUnitPrice)),
                    minRange: parseInt(Number(minUnitPrice)),
                    onEnd: $scope.onPerUnitPriceFilter,
                    translate: function(value) {
                        return d3.format(',')(value);
                    }

                }
            }

        }
        else {
            $scope.perUnitPriceDim.filterFunction(function (d) {
                return d >= filtererUnitPrice.value && d <= filtererUnitPrice.maxValue;
            });
        }
        //Filtering channel dimension when a channel is searched
        if (typeof $scope.allFilters.channelSelected !== 'undefined' && $scope.allFilters.channelSelected && $scope.allFilters.channelSelected.length > 0) {
            $scope.channelDim.filterFunction(function (d) {
                return $scope.allFilters.channelSelected.indexOf(d) !== -1;
            });
            $scope.channelGroup = $scope.channelDim.group().reduce(reduceAdd, reduceRemove, reduceInitial);
            //$scope.channelGroup = remove_empty_bins_custom($scope.channelGroup, $scope.allFilters.channelSelected);
        }
        else if(typeof $scope.allFilters.channelSelected){
            $scope.channelGroup = $scope.channelDim.group().reduce(reduceAdd, reduceRemove, reduceInitial);
        }

        //Filtering state dimension when a state is selected
        if (typeof $scope.allFilters.stateSelected !== 'undefined' && $scope.allFilters.stateSelected && $scope.allFilters.stateSelected.length > 0) {
            $scope.stateDim.filterFunction(function (d) {
                return $scope.allFilters.stateSelected.indexOf(d) !== -1;
            });
            $scope.stateGroup = $scope.stateDim.group().reduce(reduceAdd, reduceRemove, reduceInitial);
            //$scope.stateGroup = remove_empty_bins_custom($scope.stateGroup, $scope.allFilters.stateSelected);
        }
        else if($scope.allFilters.stateSelected){
            $scope.stateGroup = $scope.stateDim.group().reduce(reduceAdd, reduceRemove, reduceInitial);

        }

        //Filtering category dimension when a category is selected
        if (typeof $scope.allFilters.categorySelected !== 'undefined' && $scope.allFilters.categorySelected && $scope.allFilters.categorySelected.length > 0) {
            $scope.categoryDim.filterFunction(function (d) {
                return $scope.allFilters.categorySelected.indexOf(d) !== -1;
            });
            $scope.categoryGroup = $scope.categoryDim.group().reduce(reduceAdd, reduceRemove, reduceInitial);
            //$scope.categoryGroup = remove_empty_bins_custom($scope.categoryGroup, $scope.allFilters.categorySelected);
        }
        else if($scope.allFilters.categorySelected){
            $scope.categoryGroup = $scope.categoryDim.group().reduce(reduceAdd, reduceRemove, reduceInitial);
        }


        //Filtering item dimension when an item is selected
        if (typeof $scope.allFilters.itemSelected !== 'undefined' && $scope.allFilters.itemSelected && $scope.allFilters.itemSelected.length > 0) {
            $scope.itemDim.filterFunction(function (d) {
                return $scope.allFilters.itemSelected.indexOf(d) !== -1;
            });
            $scope.itemGroup = $scope.itemDim.group().reduce(reduceAdd, reduceRemove, reduceInitial);
            //$scope.itemGroup = remove_empty_bins_custom($scope.itemGroup, $scope.allFilters.itemSelected);
        }
        else if($scope.allFilters.itemSelected){
            $scope.itemGroup = $scope.itemDim.group().reduce(reduceAdd, reduceRemove, reduceInitial);
        }


        //Filtering customer dimension when a customer is selected
        if (typeof $scope.allFilters.customerSelected !== 'undefined' && $scope.allFilters.customerSelected && $scope.allFilters.customerSelected.length > 0) {
            $scope.customerDim.filterFunction(function (d) {
                return $scope.allFilters.customerSelected.indexOf(d) !== -1;
            });
            $scope.customerGroup = $scope.customerDim.group().reduce(reduceAdd, reduceRemove, reduceInitial);
            $scope.customerGroup = remove_empty_bins_custom($scope.customerGroup, $scope.allFilters.customerSelected);
        }
        else if($scope.allFilters.customerSelected){
            $scope.customerGroup = $scope.customerDim.group().reduce(reduceAdd, reduceRemove, reduceInitial);
        }

        //Generating All the charts and Number Displays
        $scope.volume = $scope.generateBarChart($scope.volume, $scope.daysDim, remove_empty_bins1($scope.dailyVolumeGroup, $scope.startDate, $scope.endDate), barWidth, pieWidth, new Date($scope.orderDate.options.floor), new Date($scope.orderDate.options.ceil), 'volume');
        $scope.value = $scope.generateBarChart($scope.value, $scope.daysDim, remove_empty_bins1($scope.dailyValueGroup, $scope.startDate, $scope.endDate), barWidth, pieWidth, new Date($scope.orderDate.options.floor), new Date($scope.orderDate.options.ceil), 'value');
        $scope.channel = $scope.generatePieChart($scope.channel, $scope.channelDim, remove_empty_bins_custom($scope.channelGroup, $scope.allFilters.channelSelected), pieWidth, 'channel',$scope.totalCostOfAllOrders);
        $scope.state = $scope.generatePieChart($scope.state, $scope.stateDim, remove_empty_bins_custom($scope.stateGroup, $scope.allFilters.stateSelected), pieWidth, 'state',$scope.totalCostOfAllOrders);
        $scope.category = $scope.generatePieChart($scope.category, $scope.categoryDim, remove_empty_bins_custom($scope.categoryGroup, $scope.allFilters.categorySelected), pieWidth, 'category',$scope.totalCostOfAllOrders);
        $scope.item = $scope.generatePieChart($scope.item, $scope.itemDim, remove_empty_bins_custom($scope.itemGroup, $scope.allFilters.itemSelected), pieWidth, 'item',$scope.totalCostOfAllOrders);
        $scope.customer = $scope.generatePieChart($scope.customer, $scope.customerDim, remove_empty_bins_custom($scope.customerGroup, $scope.allFilters.customerSelected), pieWidth, 'customer',$scope.totalCostOfAllOrders);
        $scope.totalOrderCount = $scope.generateDataCount($scope.totalOrderCount, $scope.orderIdGroup, '#totalOrders');
        $scope.totalOrderCountPercent = $scope.generateDataCount($scope.totalOrderCountPercent, $scope.orderIdGroup, '#totalOrdersPercent', $scope.totalCountOfAllOrders);
        $scope.totalOrderCost = $scope.generateDataCount($scope.totalOrderCost, $scope.orderIdGroup, '#totalOrderValue');
        $scope.totalOrderCostPercent = $scope.generateDataCount($scope.totalOrderCostPercent, $scope.orderIdGroup, '#totalOrderValuePercent', $scope.totalCostOfAllOrders);

        if (( range && Object.keys(range).length ) || ( filteredDate && Object.keys(filteredDate).length ) || ( filtererUnitPrice && Object.keys(filtererUnitPrice).length )) {
            if($scope.activeTab == 0) {
                dc.redrawAll();
            }
        }
        else {
            if($scope.activeTab == 0){
                dc.renderAll();
            }
        }
    }
    //Eventlistener for Order Value slide change
    $scope.onOrderValueFilter = function () {
        $scope.totalOrderDim.filterAll();
        $scope.showOrdersChart($scope.orderValue, $scope.orderDate, $scope.perUnitPrice);
    }
    //Eventlistener for Order Date slide change
    $scope.onOrderDateFilter = function () {
        $scope.daysDim.filterAll();
        $scope.showOrdersChart($scope.orderValue, $scope.orderDate, $scope.perUnitPrice);
    }
    //Eventlistener for Per Unit Price slide change
    $scope.onPerUnitPriceFilter = function () {
        $scope.perUnitPriceDim.filterAll();
        $scope.showOrdersChart($scope.orderValue, $scope.orderDate, $scope.perUnitPrice);
    }
    //Function to filter charts based on search for Orders Charts
    $scope.checkOrdersChartSearchFilter = function (chartFor, dimension) {
        $scope[dimension].filterAll();
        //dc.chartRegistry.clear(null);
        $scope.showOrdersChart($scope.orderValue, $scope.orderDate, $scope.perUnitPrice);
    }

    //Dimension reduce add function
    function reduceAdd(p, v) {
        if (v.orderid in p.orderids) {
            p.orderids[v.orderid]++;
        }
        else {
            p.orderids[v.orderid] = 1;
            p.oderCount++;
        }
        p.orderValue += Number(v.value);
        return p;
    }

    //Dimension reduce remove function
    function reduceRemove(p, v) {
        p.orderids[v.orderid]--;
        p.orderValue -= Number(v.value);
        if (p.orderids[v.orderid] === 0) {
            delete p.orderids[v.orderid];
            p.oderCount--;

        }
        return p;
    }

    //Dimension reduce inital function
    function reduceInitial(p, v) {
        return {oderCount: 0, orderids: {}, orderValue: 0};

    }

    //Function to create all Inventory charts
    $scope.showInventoryChart = function (itemCost, filteredDate) {
        var pieWidth = angular.element(document.querySelector(".pieChart"))[0].clientWidth;
        var barWidth = angular.element(document.querySelector(".barChart"))[0].clientWidth;
        var lineWidth = angular.element(document.querySelector(".lineChart"))[0].clientWidth;

        if(!( itemCost && Object.keys(itemCost).length )){

            //Creating all charts and number displays
            $scope.warehouse = dc.pieChart('#warehouse');
            $scope.sku = dc.pieChart('#sku');
            $scope.categoryName = dc.pieChart('#categoryName');
            $scope.totalSkuCount = dc.numberDisplay('#totalSku');
            $scope.totalSkuCountPercentage = dc.numberDisplay('#totalSkuPercentage');
            $scope.totalSkuCost = dc.numberDisplay('#totalSkuCost');
            $scope.totalSkuCostPercentage = dc.numberDisplay('#totalSkuCostPercentage');
            $scope.daysOfInventory = dc.lineChart('#daysOfInventory');
            $scope.sellthroughvol = dc.barChart('#sellthroughvol');
            $scope.sellthroughval = dc.barChart('#sellthroughval');

            $scope.inventoryCf = crossfilter($scope.inventory);
            $scope.allInventory = $scope.inventoryCf.groupAll();
            var lastDate = d3.max($scope.inventory, function(d) { return d.date; });
            // console.log(d3.min($scope.inventory, function(d) { return d.date; }));
            // console.log(d3.max($scope.inventory, function(d) { return d.date; }));
            //Grouping all inventory data to calculate the totals
            $scope.totalSkuGroup = $scope.allInventory.reduce(
                function (p, v) { //add
                    if (v.skusystemcode in p.skuCodes) {
                        p.skuCodes[v.skusystemcode]++;
                    }
                    else {
                        p.skuCodes[v.skusystemcode] = 1;
                        p.skuCount++;
                    }
                    p.skuTotalCost += Number(v.cost);
                    if(v.date == lastDate){
                        p.skuCost += Number(v.cost);

                    }
                    else{
                        p.skuCost += 0;
                    }
                    return p;
                },
                function (p, v) { //remove
                    p.skuCodes[v.skusystemcode]--;
                    p.skuTotalCost -= Number(v.cost);
                    if(v.date == lastDate){
                        p.skuCost -= Number(v.cost);
                    }
                    if (p.skuCodes[v.skusystemcode] === 0) {
                        delete p.skuCodes[v.skusystemcode];
                        p.skuCount--;

                    }
                    return p;

                },
                function () { //init
                    return {skuCount: 0, skuCodes: {}, skuCost: 0 , skuTotalCost:0};
                }
            );
            console.log($scope.totalSkuGroup.value());

            //Total of all skus cost for percentage calculation
            $scope.totalCostOfAllSku = angular.copy($scope.totalSkuGroup.value().skuCost);
            console.log($scope.totalSkuGroup.value().skuTotalCost);
            $scope.totalCostOfSku = $scope.totalSkuGroup.value().skuTotalCost;

            //Total of sku for percentage calculation
            $scope.totalCountOfAllSku = angular.copy(($scope.totalSkuGroup.value().skuCount));
            //Dimension by sku code
            $scope.skuCodeDim = $scope.inventoryCf.dimension(function (d) {
                return d.skusystemcode;
            });
            //Grouping By skuCode for Number Display
            $scope.skuCodeGroup = $scope.skuCodeDim.groupAll().reduce(
                function (p, v) { //add
                    if (v.skusystemcode in p.skuCodes) {
                        p.skuCodes[v.skusystemcode]++;
                    }
                    else {
                        p.skuCodes[v.skusystemcode] = 1;
                        p.skuCount++;
                    }
                    if(v.date == lastDate){
                        p.skuCost += Number(v.cost);
                    }
                    else{
                        p.skuCost += 0;
                    }
                    return p;
                },
                function (p, v) { //remove
                    p.skuCodes[v.skusystemcode]--;
                    if(v.date == lastDate){
                        p.skuCost -= Number(v.cost);
                    }
                    if (p.skuCodes[v.skusystemcode] === 0) {
                        delete p.skuCodes[v.skusystemcode];
                        p.skuCount--;

                    }
                    return p;

                },
                function () { //init
                    return {skuCount: 0, skuCodes: {}, skuCost: 0};
                }
            );

            //Dimension by sku cost
            $scope.skuCostDim = $scope.inventoryCf.dimension(function (d) {
                return d.cost = +d.cost;
            });
            //Dimension by day
            $scope.skuDaysDim = $scope.inventoryCf.dimension(function (d) {
                return $scope.interval.current.interval(new Date(d.date));
            });
            //Grouping by days of inventory
            $scope.daysOfInventoryGroup = $scope.skuDaysDim.group().reduce(reduceAdd1, reduceRemove1, reduceInitial1);

            //Grouping days by sellthrough value
            $scope.sellThroughValueGroup = $scope.skuDaysDim.group().reduceSum(function (d) {
                return d.sellthroughval = +d.sellthroughval;
            });

            //Grouping days by sellthrough volume
            $scope.sellThroughVolumeGroup = $scope.skuDaysDim.group().reduceSum(function (d) {
                return d.sellthroughvol = +d.sellthroughvol;
            });
            //Dimension by sku
            $scope.skuDim = $scope.inventoryCf.dimension(function (d) {
                return d.skuname;
            });
            //Grouping sku by sku cost
            $scope.skuGroup = $scope.skuDim.group().reduceSum(function (d) {
                return d.cost = +d.cost;
            });
            //Dimension by warehouse
            $scope.warehouseDim = $scope.inventoryCf.dimension(function (d) {
                return d.warehouseshortname;
            });
            //Grouping warehouse by sku cost
            $scope.warehouseGroup = $scope.warehouseDim.group().reduceSum(function (d) {
                return d.cost = +d.cost;
            });
            //Dimension by category Name
            $scope.categoryNameDim = $scope.inventoryCf.dimension(function (d) {
                return d.categoryname;
            });
            //Grouping category Name by sku cost
            $scope.categoryNameGroup = $scope.categoryNameDim.group().reduceSum(function (d) {
                return d.cost = +d.cost;
            });

        }

        //Filtering by SKU Cost when SKU Cost slider is changed (if part runs first time only.Filtering is done in else part)
        if (!( itemCost && Object.keys(itemCost).length )) {
            if ($scope.skuCostDim.top(Infinity).length) {
                var minOrderValue = $scope.skuCostDim.bottom(1)[0].cost;
                var maxOrderValue = $scope.skuCostDim.top(1)[0].cost;
                $scope.inventoryItemCost.maxValue = maxOrderValue;
                $scope.inventoryItemCost.value = minOrderValue !== maxOrderValue ? minOrderValue : 0;
                $scope.inventoryItemCost.options = {
                    floor: minOrderValue !== maxOrderValue ? Number(minOrderValue) : 0,
                    ceil: Number(maxOrderValue),
                    minRange: Number(minOrderValue),
                    onEnd: $scope.onInventoryItemCostFilter,
                    translate: function(value) {
                        return d3.format(',')(value);
                    }
                }
            }

        }
        else {
            $scope.skuCostDim.filterFunction(function (d) {
                return d >= itemCost.value && d <= itemCost.maxValue;
            });
        }

        //Filtering by SKU date when SKU Date slider is changed (if part runs first time only.Filtering is done in else part)
        if (!( filteredDate && Object.keys(filteredDate).length )) {
            if ($scope.skuDaysDim.top(Infinity).length) {
                var minSkuDate = $scope.interval.current.interval(new Date($scope.skuDaysDim.bottom(1)[0].date)).getTime();
                var maxSkuDate = $scope.interval.current.interval(new Date($scope.skuDaysDim.top(1)[0].date)).getTime();
                $scope.inventoryDate.maxValue = maxSkuDate;
                $scope.inventoryDate.value = minSkuDate !== maxSkuDate ? minSkuDate : $scope.interval.current.interval.offset(minSkuDate , -2);
                $scope.inventoryDate.options = {
                    floor: $scope.interval.current.interval.offset(minSkuDate , -2).getTime(),
                    ceil: $scope.interval.current.interval.offset(maxSkuDate , 2).getTime(),
                    minRange: d3.time.day.range($scope.interval.current.interval.offset(minSkuDate , 1), $scope.interval.current.interval.offset(minSkuDate , 2), 1).length * 86400000,
                    step: d3.time.day.range($scope.interval.current.interval.offset(minSkuDate , 1), $scope.interval.current.interval.offset(minSkuDate , 2), 1).length * 86400000,
                    translate: function (value) {
                        return moment(value).format('DD/MM/YYYY');
                    },
                    onEnd: $scope.onInventoryDateFilter

                }
                $scope.skuStartDate = $scope.interval.current.interval(new Date($scope.skuDaysDim.bottom(1)[0].date));
                $scope.skuEndDate = $scope.interval.current.interval(new Date($scope.skuDaysDim.top(1)[0].date));
            }


        }
        else {
            $scope.skuDaysDim.filterFunction(function (d) {
                return ($scope.interval.current.interval(new Date(d)) >= new Date(filteredDate.value) && $scope.interval.current.interval(new Date(d)) <= new Date(filteredDate.maxValue));
            });
            if ($scope.skuDaysDim.top(Infinity).length) {
                $scope.skuStartDate = $scope.interval.current.interval(new Date($scope.skuDaysDim.bottom(1)[0].date));
                $scope.skuEndDate = $scope.interval.current.interval(new Date($scope.skuDaysDim.top(1)[0].date));
                $scope.daysOfInventoryGroup = $scope.skuDaysDim.group().reduce(reduceAdd1, reduceRemove1, reduceInitial1);
                $scope.sellThroughValueGroup = $scope.skuDaysDim.group().reduceSum(function (d) {
                    return d.sellthroughval = +d.sellthroughval;
                });
                $scope.sellThroughVolumeGroup = $scope.skuDaysDim.group().reduceSum(function (d) {
                    return d.sellthroughvol = +d.sellthroughvol;
                });

            }
            else {
                $scope.skuStartDate = $scope.inventoryDate.value;
                $scope.skuEndDate = $scope.inventoryDate.maxValue;
            }

            // $scope.daysOfInventoryGroup = remove_empty_bins1($scope.daysOfInventoryGroup, $scope.skuStartDate, $scope.skuEndDate);
            // $scope.sellThroughValueGroup = remove_empty_bins1($scope.sellThroughValueGroup, $scope.skuStartDate, $scope.skuEndDate);
            // $scope.sellThroughVolumeGroup = remove_empty_bins1($scope.sellThroughVolumeGroup, $scope.skuStartDate, $scope.skuEndDate);
        }
        console.log($scope.skuStartDate);
        console.log($scope.skuEndDate);

        //Filtering by sku when a sku is searched
        if (typeof $scope.allFilters.skuSelected !== 'undefined' && $scope.allFilters.skuSelected.length > 0) {
            $scope.skuDim.filterFunction(function (d) {
                return $scope.allFilters.skuSelected.indexOf(d) !== -1;
            });
            $scope.skuGroup = $scope.skuDim.group().reduceSum(function (d) {
                return d.cost = +d.cost;
            });
            //$scope.skuGroup = remove_empty_bins_custom($scope.skuGroup, $scope.allFilters.skuSelected);
        }
        else if($scope.allFilters.skuSelected){
            $scope.skuGroup = $scope.skuDim.group().reduceSum(function (d) {
                return d.cost = +d.cost;
            });
        }

        //Filtering by warehouse when a warehouse is searched
        if (typeof $scope.allFilters.warehouseSelected !== 'undefined' && $scope.allFilters.warehouseSelected.length > 0) {
            $scope.warehouseDim.filterFunction(function (d) {
                return $scope.allFilters.warehouseSelected.indexOf(d) !== -1;
            });
            $scope.warehouseGroup = $scope.warehouseDim.group().reduceSum(function (d) {
                return d.cost = +d.cost;
            });
            //$scope.warehouseGroup = remove_empty_bins_custom($scope.warehouseGroup, $scope.allFilters.warehouseSelected);
        }
        else if($scope.allFilters.warehouseSelected){
            $scope.warehouseGroup = $scope.warehouseDim.group().reduceSum(function (d) {
                return d.cost = +d.cost;
            });

        }
        //Filtering by category Name when a category is searched
        if (typeof $scope.allFilters.categoryNameSelected !== 'undefined' && $scope.allFilters.categoryNameSelected.length > 0) {
            $scope.categoryNameDim.filterFunction(function (d) {
                return $scope.allFilters.categoryNameSelected.indexOf(d) !== -1;
            });
            $scope.categoryNameGroup = $scope.categoryNameDim.group().reduceSum(function (d) {
                return d.cost = +d.cost;
            });
            // $scope.categoryNameGroup = remove_empty_bins_custom($scope.categoryNameGroup, $scope.allFilters.categoryNameSelected);
        }
        else if($scope.allFilters.categoryNameSelected){
            $scope.categoryNameGroup = $scope.categoryNameDim.group().reduceSum(function (d) {
                return d.cost = +d.cost;
            });

        }

        //Generating All the charts and Number Displays
        $scope.warehouse = $scope.generatePieChart($scope.warehouse, $scope.warehouseDim, remove_empty_bins_custom($scope.warehouseGroup, $scope.allFilters.warehouseSelected), pieWidth, 'warehouse',$scope.totalCostOfSku);
        $scope.sku = $scope.generatePieChart($scope.sku, $scope.skuDim, remove_empty_bins_custom($scope.skuGroup, $scope.allFilters.skuSelected), pieWidth, 'sku',$scope.totalCostOfSku);
        $scope.categoryName = $scope.generatePieChart($scope.categoryName, $scope.categoryNameDim, remove_empty_bins_custom($scope.categoryNameGroup, $scope.allFilters.categoryNameSelected), pieWidth, 'categoryName',$scope.totalCostOfSku);
        $scope.daysOfInventory = $scope.generateLineChart($scope.daysOfInventory, $scope.skuDaysDim, remove_empty_bins1($scope.daysOfInventoryGroup, $scope.skuStartDate, $scope.skuEndDate), lineWidth, pieWidth, new Date($scope.inventoryDate.options.floor), new Date($scope.inventoryDate.options.ceil), 'daysOfInventory');
        $scope.sellthroughval = $scope.generateBarChart($scope.sellthroughval, $scope.skuDaysDim, remove_empty_bins1($scope.sellThroughValueGroup, $scope.skuStartDate, $scope.skuEndDate), barWidth, pieWidth, new Date($scope.inventoryDate.options.floor), new Date($scope.inventoryDate.options.ceil), 'sellthroughval');
        $scope.sellthroughvol = $scope.generateBarChart($scope.sellthroughvol, $scope.skuDaysDim, remove_empty_bins1($scope.sellThroughVolumeGroup, $scope.skuStartDate, $scope.skuEndDate), barWidth, pieWidth, new Date($scope.inventoryDate.options.floor), new Date($scope.inventoryDate.options.ceil), 'sellthroughvol');
        $scope.totalSkuCount = $scope.generateDataCount($scope.totalSkuCount, $scope.skuCodeGroup, '#totalSku');
        $scope.totalSkuCost = $scope.generateDataCount($scope.totalSkuCost, $scope.skuCodeGroup, '#totalSkuCost');
        $scope.totalSkuCostPercentage = $scope.generateDataCount($scope.totalSkuCostPercentage, $scope.skuCodeGroup, '#totalSkuCostPercentage', $scope.totalCostOfAllSku);
        $scope.totalSkuCountPercentage = $scope.generateDataCount($scope.totalSkuCountPercentage, $scope.skuCodeGroup, '#totalSkuPercentage', $scope.totalCountOfAllSku);

        if (( itemCost && Object.keys(itemCost).length ) || ( filteredDate && Object.keys(filteredDate).length )) {
            if($scope.activeTab == 1){
                dc.redrawAll();
            }
        }
        else {
            if($scope.activeTab == 1){
                dc.renderAll();
            }
        }
    }
    //Eventlistener for Inventory Item Cost slide change
    $scope.onInventoryItemCostFilter = function () {
        $scope.skuCostDim.filterAll();
        $scope.showInventoryChart($scope.inventoryItemCost, $scope.inventoryDate, $scope.perUnitPrice);
    }
    //Eventlistener for Inventory Date slide change
    $scope.onInventoryDateFilter = function () {
        $scope.skuDaysDim.filterAll();
        $scope.showInventoryChart($scope.inventoryItemCost, $scope.inventoryDate, $scope.perUnitPrice);
    }
    //Function to filter charts based on search for Inventory Charts
    $scope.checkInventoryChartSearchFilter = function (chartFor, dimension) {
        $scope[dimension].filterAll();
        $scope.showInventoryChart($scope.inventoryItemCost, $scope.inventoryDate, $scope.perUnitPrice);
    }

    //Dimension reduce add function
    function reduceAdd1(p, v) {
        if (v.skusystemcode in p.skuCodes) {
            p.skuCodes[v.skusystemcode]++;
        }
        else {
            p.skuCodes[v.skusystemcode] = 1;
            p.skuCount++;
        }
        p.skuDays += Number(v.days * v.good);
        p.skuGoodSum += Number(v.good);
        return p;
    }

    //Dimension reduce remove function
    function reduceRemove1(p, v) {
        p.skuCodes[v.skusystemcode]--;
        p.skuDays -= Number(v.days * v.good);
        p.skuGoodSum -= Number(v.good);
        if (p.skuCodes[v.skusystemcode] === 0) {
            delete p.skuCodes[v.skusystemcode];
            p.skuCount--;

        }
        return p;
    }

    //Dimension reduce inital function
    function reduceInitial1(p, v) {
        return {skuCount: 0, skuCodes: {}, skuDays: 0, skuGoodSum: 0};
    }


    //Function to generate Pie Charts
    $scope.generatePieChart = function (pieChart, dimension, group, chartWidth, chartFor,total) {
        var titleAccessor, labelAccessor, valueAccessor, ordering;
        console.log(total);
        if (chartFor == 'channel' || chartFor == 'state' || chartFor == 'category' || chartFor == 'item' || chartFor == 'customer') {
            titleAccessor = function (d) {
                if(d.key !== "empty"){
                    return d.key + "(Rs." + Math.round(d.value.orderValue ? d.value.orderValue : d.value) + ")" + ":" + d.value.oderCount;
                }
                else{
                    return d.key ;
                }
            }
            labelAccessor = function (d) {
                if(d.key !== "empty"){
                    // return d.key + "(Rs." + ((Math.round(d.value.orderValue ? d.value.orderValue : d.value) <= 0) ? 0 : Math.round(d.value.orderValue ? d.value.orderValue : d.value)) + ")";
                    return ((Math.round(d.value.orderValue ? d.value.orderValue : d.value) <= 0) ? 0 : Math.round(d.value.orderValue ? ((d.value.orderValue * 100)/total ) : (d.value * 100)/total).toFixed(1)) + '%';
                    // return d.key + ' ' + Math.round((d.endAngle - d.startAngle) / Math.PI * 50) + '%';
                }
                else{
                    return d.key ;
                }
            }
            valueAccessor = function (d) {
                return d.value.orderValue;
            }
            ordering = function (d) {
                return -d.value.orderValue;
            }
            $scope[chartFor].cappedValueAccessor = function (d, i) {
                if (d.others) {
                    return d.value.orderValue;
                }
                return $scope[chartFor].valueAccessor()(d, i);
            };
            $scope[chartFor].othersGrouper(function (topItems, restItems) {
                var restItemsSum = d3.sum(restItems, $scope[chartFor].valueAccessor()),
                    restKeys = restItems.map($scope[chartFor].keyAccessor()),
                    restItemsCount = d3.sum(restItems, function (d) {
                        return d.value.oderCount;
                    });
                if (restItemsSum > 0) {
                    topItems = topItems.concat([{
                        others: restKeys,
                        key: $scope[chartFor].othersLabel(),
                        // value:restItemsSum,
                        value: {
                            orderValue: restItemsSum,
                            oderCount: restItemsCount

                        }
                    }]);
                }
                return topItems;
            })
        }
        else if (chartFor == 'warehouse' || chartFor == 'sku' || 'categoryName') {
            titleAccessor = function (d) {
                if(d.key !== "empty"){
                    return d.key + "(Rs." + Math.round(d.value);
                }
                else{
                    return d.key ;
                }

            }
            labelAccessor = function (d) {
                if(d.key !== "empty"){
                    // return d.key + "(Rs." + ((Math.round(d.value) <= 0) ? 0 : Math.round(d.value)) + ")";
                    // return "Rs." + ((Math.round(d.value) <= 0) ? 0 : Math.round(d.value));
                    return ((Math.round(d.value) <= 0) ? 0 : (d.value * 100/total).toFixed(1)) + '%';
                }
                else{
                    return d.key ;
                }
            }
            valueAccessor = function (d) {
                return d.value;
            }
            ordering = function (d) {
                return -d.value;
            }
        }
        pieChart
            .width(chartWidth - 10)
            .height(chartWidth - (chartWidth / 2))
            .radius((((chartWidth) / 3) - 60 ))
            .innerRadius(((chartWidth) / 4.5) - 60 )

            // .colors(d3.scale.category20c())
            // .colors(d3.scale.linear().domain([4, 1]).range(colorbrewer.BuGn[4]))
            .colors(d3.scale.quantize().domain([0, 5]).range(["#44c1e9", "#48cfad", "#fc6e51", "#9fd467", "#ac92ec"]))
            .colorAccessor(function (d, i) {
                return i;
            })
            .dimension(dimension)
            .group(group)
            .label(labelAccessor)
            .title(titleAccessor)
            .ordering(ordering)
            .renderLabel(true)
            .valueAccessor(valueAccessor)
            .legend(dc.legend()
                      .legendWidth(10)
                      .legendText(function(d, i) {
                            console.log(d);
                            if(d.name.length > 15) d.nameAlias =  d.name.substr(0,15)+'...';
                            return i+1+ '. ' + (d.nameAlias ? d.nameAlias : d.name );
                        })
                      .itemHeight(10)
                      .x(5)
                      .y(5)
                      .gap(5))
            .cap(4)
            // .on('renderlet', function(chart) {
            //     chart.selectAll('text.pie-slice.pie-label')
            //         .attr('transform', function(d) {
            //             var translate = d3.select(this).attr('transform');
            //             // var ang = ((d.startAngle + d.endAngle) / 2 * 180 / Math.PI)%360;
            //             var ang = d.endAngle * (180/Math.PI) - d.startAngle * (180/Math.PI);
            //             if(ang > 90) return translate;
            //             return translate ? translate : ' '  + ' rotate(' + -ang/2 + ')';
            //         })
            //         .text('')
            //         .append('tspan')
            //         .text(function(d){
            //             var ang = d.endAngle * (180/Math.PI) - d.startAngle * (180/Math.PI);
            //             if (ang < 30) return ;
            //             // if(d.data.key.split(' ').length > 2) {
            //             //     var
            //             //     return d.data.key
            //             // }
            //             return d.data.key ;
            //         });
            //     chart.selectAll('text.pie-slice.pie-label')
            //         .append('tspan')
            //         .text(function(d){
            //             var ang = d.endAngle * (180/Math.PI) - d.startAngle * (180/Math.PI);
            //             if (ang < 30) return ;
            //             return "(Rs." + ((Math.round(d.data.value.orderValue ? d.data.value.orderValue : d.data.value) <= 0) ? 0 : Math.round(d.data.value.orderValue ? d.data.value.orderValue : d.data.value)) + ")";
            //
            //         })
            //         .attr('dy',11)
            //         .attr('x',0);
            // })
            .on('renderlet', function (chart) {
                chart.selectAll('g.dc-legend-item').append('title').text(function(d) {
                    return d.name;
                });
                switch (chartFor) {
                    case 'channel' :
                        if (typeof $scope.allFilters.channelSelected === 'undefined') {
                            $scope.allFilters.channel = [];
                            chart.data().forEach(function (d) {
                                if (d.key === "Others") {
                                    $scope.allFilters.channel = $scope.allFilters.channel.concat(d.others);
                                }
                                else {
                                    $scope.allFilters.channel.push(d.key);
                                }

                            });
                        }
                        break;
                    case 'state' :
                        if (typeof $scope.allFilters.stateSelected === 'undefined') {
                            $scope.allFilters.state = [];
                            chart.data().forEach(function (d) {
                                if (d.key === "Others") {
                                    $scope.allFilters.state = $scope.allFilters.state.concat(d.others);
                                }
                                else {
                                    $scope.allFilters.state.push(d.key);
                                }

                            });

                        }
                        break;
                    case 'category' :
                        if (typeof $scope.allFilters.categorySelected === 'undefined') {
                            $scope.allFilters.category = [];
                            chart.data().forEach(function (d) {
                                if (d.key === "Others") {
                                    $scope.allFilters.category = $scope.allFilters.category.concat(d.others);
                                }
                                else {
                                    $scope.allFilters.category.push(d.key);
                                }
                            });

                        }
                        break;
                    case 'item' :
                        if (typeof $scope.allFilters.itemSelected === 'undefined') {
                            $scope.allFilters.item = [];
                            chart.data().forEach(function (d) {
                                if (d.key === "Others") {
                                    $scope.allFilters.item = $scope.allFilters.item.concat(d.others);
                                }
                                else {
                                    $scope.allFilters.item.push(d.key);
                                }
                            });

                        }
                        break;
                    case 'customer' :
                        if (typeof $scope.allFilters.customerSelected === 'undefined') {
                            $scope.allFilters.customer = [];
                            chart.data().forEach(function (d) {
                                if (d.key === "Others") {
                                    $scope.allFilters.customer = $scope.allFilters.customer.concat(d.others);
                                }
                                else {
                                    $scope.allFilters.customer.push(d.key);
                                }
                            });

                        }
                        break;
                    case 'warehouse' :
                        if (typeof $scope.allFilters.warehouseSelected === 'undefined') {
                            $scope.allFilters.warehouse = [];
                            chart.data().forEach(function (d) {
                                if (d.key === "Others") {
                                    $scope.allFilters.warehouse = $scope.allFilters.warehouse.concat(d.others);
                                }
                                else {
                                    $scope.allFilters.warehouse.push(d.key);
                                }
                            });

                        }
                        break;
                    case 'sku' :
                        if (typeof $scope.allFilters.skuSelected === 'undefined') {
                            $scope.allFilters.sku = [];
                            chart.data().forEach(function (d) {
                                if (d.key === "Others") {
                                    $scope.allFilters.sku = $scope.allFilters.sku.concat(d.others);
                                }
                                else {
                                    $scope.allFilters.sku.push(d.key);
                                }
                            });

                        }
                        break;
                    case 'categoryName' :
                        if (typeof $scope.allFilters.categoryNameSelected === 'undefined') {
                            $scope.allFilters.categoryName = [];
                            chart.data().forEach(function (d) {
                                if (d.key === "Others") {
                                    $scope.allFilters.categoryName = $scope.allFilters.categoryName.concat(d.others);
                                }
                                else {
                                    $scope.allFilters.categoryName.push(d.key);
                                }
                            });

                        }
                        break;
                    default :
                        break;
                }
            });
        // .on('filtered.monitor', function(chart, filter) {
        //     // console.log(filter);
        //     // if(chartFor == 'state'){
        //     //     if($scope.allFilters.state){
        //     //         $scope.allFilters.stateSelected = filter;
        //     //         $scope.filterBySearchedState();
        //     //
        //     //     }
        //     // }
        // });
        return pieChart;
    }

    $scope.onIntervalChange = function () {
        if($scope.activeTab == 0){
            $scope.daysDim.dispose();
            $scope.dailyVolumeGroup.dispose();
            $scope.dailyValueGroup.dispose();
            $scope.daysDim = $scope.ordersCf.dimension(function (d) {
                return  $scope.interval.current.interval(new Date(d.orderdate));
            });
            var minOrderDate = $scope.interval.current.interval(new Date($scope.daysDim.bottom(1)[0].orderdate)).getTime();
            var maxOrderDate = $scope.interval.current.interval(new Date($scope.daysDim.top(1)[0].orderdate)).getTime();
            $scope.orderDate.maxValue = maxOrderDate;
            $scope.orderDate.value = minOrderDate !== maxOrderDate ? minOrderDate : $scope.interval.current.interval.offset(minOrderDate , -2).getTime();
            $scope.orderDate.options = {
                floor: $scope.interval.current.interval.offset(minOrderDate , -2).getTime(),
                ceil: $scope.interval.current.interval.offset(maxOrderDate , 2).getTime(),
                minRange: d3.time.day.range($scope.interval.current.interval.offset(minOrderDate , 1), $scope.interval.current.interval.offset(minOrderDate , 2), 1).length * 86400000,
                step: d3.time.day.range($scope.interval.current.interval.offset(minOrderDate , 1), $scope.interval.current.interval.offset(minOrderDate , 2), 1).length * 86400000,
                translate: function (value) {
                    return moment(value).format('DD/MM/YYYY');
                },
                onEnd: $scope.onOrderDateFilter

            }
            $scope.startDate = $scope.interval.current.interval(new Date($scope.daysDim.bottom(1)[0].orderdate));
            $scope.endDate = $scope.interval.current.interval(new Date($scope.daysDim.top(1)[0].orderdate));
            $scope.showOrdersChart($scope.orderValue, $scope.orderDate, $scope.perUnitPrice);
        }
        else if($scope.activeTab == 1){
            $scope.skuDaysDim.dispose();
            $scope.daysOfInventoryGroup.dispose();
            $scope.sellThroughValueGroup.dispose();
            $scope.sellThroughVolumeGroup.dispose();
            $scope.skuDaysDim = $scope.inventoryCf.dimension(function (d) {
                return $scope.interval.current.interval(new Date(d.date));
            });
            var minSkuDate = $scope.interval.current.interval(new Date($scope.skuDaysDim.bottom(1)[0].date)).getTime();
            var maxSkuDate = $scope.interval.current.interval(new Date($scope.skuDaysDim.top(1)[0].date)).getTime();
            $scope.inventoryDate.maxValue = maxSkuDate;
            $scope.inventoryDate.value = minSkuDate !== maxSkuDate ? minSkuDate : $scope.interval.current.interval.offset(minSkuDate , -2);
            $scope.inventoryDate.options = {
                floor: $scope.interval.current.interval.offset(minSkuDate , -2).getTime(),
                ceil: $scope.interval.current.interval.offset(maxSkuDate , 2).getTime(),
                minRange: d3.time.day.range($scope.interval.current.interval.offset(minSkuDate , 1), $scope.interval.current.interval.offset(minSkuDate , 2), 1).length * 86400000,
                step: d3.time.day.range($scope.interval.current.interval.offset(minSkuDate , 1), $scope.interval.current.interval.offset(minSkuDate , 2), 1).length * 86400000,
                translate: function (value) {
                    return moment(value).format('DD/MM/YYYY');
                },
                onEnd: $scope.onInventoryDateFilter

            }
            $scope.skuStartDate = $scope.interval.current.interval(new Date($scope.skuDaysDim.bottom(1)[0].date));
            $scope.skuEndDate = $scope.interval.current.interval(new Date($scope.skuDaysDim.top(1)[0].date));
            $scope.showInventoryChart($scope.inventoryItemCost, $scope.inventoryDate, $scope.perUnitPrice);
        }
    };
    
    function calc_domain(chart) {
        var min = d3.min(chart.group().all(), function(kv) { return kv.key; }),
            max = d3.max(chart.group().all(), function(kv) { return kv.key; });
        min = $scope.interval.current.interval.offset(min, -1);
        max = $scope.interval.current.interval.offset(max, 1);
        chart.x().domain([min, max]);
        chart.xAxis().ticks(5);
        if($scope.interval.current.name == "Days"){
            chart.xAxis().tickFormat(d3.time.format('%d/%m'));
        }
        else if($scope.interval.current.name == "Weeks"){
            chart.xAxis().tickFormat(d3.time.format('%d/%m'));
        }
        else if($scope.interval.current.name == "Months"){
            chart.xAxis().tickFormat(d3.time.format('%B'));
        }
        else if($scope.interval.current.name == "Years"){
            chart.xAxis().tickFormat(d3.time.format('%Y'));
        }
        else{
            chart.xAxis().tickFormat(null);
        }
    }
    //Function to generate Bar Charts
    $scope.generateBarChart = function (barChart, dimension, group, chartWidth, chartHeight, startDate, endDate, chartFor) {
        var titleAccessor, label;
        barChart.xUnits($scope.interval.current.interval.range);
        switch (chartFor) {
            case 'volume':
                label = 'Volume';
                titleAccessor = function (d) {
                    return moment(d.key).format('Do MMM') + ":" + Math.round(d.value);
                }
                break;
            case 'value' :
                label = 'Value';
                titleAccessor = function (d) {
                    return moment(d.key).format('Do MMM') + ":Rs." + Math.round(d.value);
                }
                break;
            case 'sellthroughval' :
                label = 'Value';
                titleAccessor = function (d) {
                    return moment(d.key).format('Do MMM') + ":Rs." + Math.round(d.value);
                }
                break;
            case 'sellthroughvol' :
                label = 'Volume';
                titleAccessor = function (d) {
                    return moment(d.key).format('Do MMM') + ":" + Math.round(d.value);
                }
                break;

        }
        barChart
            .width(chartWidth - 10)
            .height(chartHeight - (chartHeight / 3))
            // .x(d3.time.scale().domain([d3.time.day.offset(startDate, -2), d3.time.day.offset(endDate, 2)]))
            // .xUnits(d3.time.days)
            .x(d3.time.scale())
            .xUnits($scope.interval.current.unit)
            .brushOn(false)
            .yAxisLabel(label)
            // .xAxisLabel($scope.interval.current.name)
            .elasticY(true)
            .elasticX(true)
            .xAxisPadding(1)
            .alwaysUseRounding(true)
            .colors(d3.scale.quantize().domain([0, 1]).range(["#44c1e9"]))
            .colorAccessor(function (d, i) {
                return i;
            })
            .centerBar(true)
            .dimension(dimension)
            .title(titleAccessor)
            .group(group)
            .renderLabel(false)
            .on('renderlet', function (chart) {
                chart.selectAll(".y-axis-label.y-label")
                    .attr('dy', '5');
                if (!chart.data()[0].values.length) {
                    if ((chart.select('g #extra-label')[0][0])) {
                        chart.select('g #extra-label').remove();
                        chart.select('g #extra-line').remove();

                    }
                    return;
                }
                var total = 0;
                chart.data()[0].values.forEach(function (v) {
                    total += v.data.value;
                });

                if (chartFor == 'volume' || chartFor == 'value') {
                    var startDay = moment($scope.orderDate.value);
                    var endDay = moment($scope.orderDate.maxValue);
                }
                else {
                    var startDay = moment($scope.inventoryDate.value);
                    var endDay = moment($scope.inventoryDate.maxValue);
                }
                var totalLength = endDay.diff(startDay, 'days');
                // var average = total/chart.data()[0].values.length;
                if (totalLength == 0) {
                    var average = total;
                }
                else {
                    var average = total / totalLength;
                }

                var left_y = average, right_y = average;
                var extra_data = [{x: chart.x().range()[0], y: chart.y()(left_y)}, {
                    x: chart.x().range()[1],
                    y: chart.y()(right_y)
                }];
                console.log('Height of Average bar',extra_data);
                var line = d3.svg.line()
                    .x(function (d) {
                        return d.x;
                    })
                    .y(function (d) {
                        return d.y;
                    })
                    .interpolate('linear');
                var chartBody = chart.select('g.chart-body');
                var path = chartBody.selectAll('path.extra').data([extra_data]);
                path.enter().append('path').attr({
                    class: 'extra',
                    stroke: '#f0592b',
                    id: 'extra-line'
                });
                path.attr('d', line);

                if (!(chart.select('g #extra-label')[0][0])) {
                    var text = chartBody.selectAll('text.extra-label').data([0]);
                    text.enter().append('text')
                        .attr({
                            'id': 'extra-label',
                            'xlink:href': '#extra-line',
                            startOffset: '50%',
                            'text-anchor': 'middle',
                            'color':'#333',
                            'x': (extra_data[1].x - extra_data[0].x) / 2,
                            'x': (extra_data[1].x - (extra_data[1].x)/5),
                            'y': extra_data[1].y < 200 ? extra_data[1].y-3 : extra_data[1].y + 10
                        })
                        .text('Average : ' + Math.round(average));
                }
                else {
                    console.log(extra_data[1].x);
                    chart.select('g #extra-label')
                        .attr({
                            // 'x': (extra_data[1].x - extra_data[0].x) / 2,
                            'x': (extra_data[1].x - (extra_data[1].x)/5),
                            'y': extra_data[1].y < 200 ? extra_data[1].y-3 : extra_data[1].y + 10
                        })
                        .text('Average : ' + Math.round(average));
                }

            });
            // .xAxis()
            // .tickFormat(d3.time.format("%m/%d"));
            // .tickFormat(function (d) {
            //     return moment(d).format('Do MMM')
            // });
        barChart.margins().left = 100;
        barChart.margins().top = 40;
        // barChart.clipPadding(10);
        barChart.xAxis().ticks(5);
        // barChart.round(d3.time.month.round);
        barChart.on('preRender', calc_domain);
        barChart.on('preRedraw', calc_domain);
        return barChart;
    }
    //Function to generate Data Count
    $scope.generateDataCount = function (count, numGroup, id, total) {
        var formatter;
        if (total) {
            formatter = d3.format("%");
        }
        else {
            formatter = d3.format(",f");
        }
        count
            .group(numGroup)
            .formatNumber(formatter)
            .valueAccessor(
                function (d) {
                    switch (id) {
                        case '#totalOrders' :
                            var returnValue = Object.keys(d).length;
                            break;
                        case '#totalOrderValue' :
                            var returnValue = sumOfOrderValue(d);
                            break;
                        case '#totalOrderValuePercent' :
                            var returnValue = sumOfOrderValue(d) / total;
                            break;
                        case '#totalOrdersPercent' :
                            var returnValue = Object.keys(d).length / total;
                            break;

                        case '#totalSku' :
                            var returnValue = (d.skuCount);
                            //var returnValue = d;
                            break;
                        case '#totalSkuCost':
                            var returnValue = d.skuCost;
                            break;
                        case '#totalSkuCostPercentage':
                            var returnValue = d.skuCost / total;
                            break;
                        case '#totalSkuPercentage':
                            var returnValue = (d.skuCount) / total;
                            break;

                        default :
                            break;
                    }
                    return isNaN(returnValue) ? 0 : returnValue;
                }
            );
        return count;
    }
    //Function to generate line chart
    $scope.generateLineChart = function (lineChart, dimension, group, chartWidth, chartHeight, startDate, endDate, chartFor) {
        lineChart
            .width(chartWidth - 10)
            .height(chartHeight - (chartHeight / 3))
            // .x(d3.time.scale().domain([d3.time.day.offset(startDate, -2), d3.time.day.offset(endDate, 2)]))
            // .xUnits(d3.time.days)
            .x(d3.time.scale())
            .xUnits($scope.interval.current.unit)
            .renderArea(true)
            .brushOn(false)
            .elasticY(true)
            .renderDataPoints(true)
            .clipPadding(10)
            .yAxisLabel("Days of Inventory")
            .xAxisLabel("Days")
            .dimension(dimension)
            .group(group)
            .valueAccessor(function (d) {
                return Math.round(d.value.skuDays / d.value.skuGoodSum);
            })
            .title(function (d) {
                return moment(d.key).format('Do MMM') + ":" + Math.round(d.value.skuDays / d.value.skuGoodSum);
            })
            .on('renderlet', function (chart) {
                chart.selectAll(".y-axis-label.y-label")
                    .attr('dy', '5');
            });
        lineChart.margins().left = 70;
        lineChart.on('preRender', calc_domain);
        lineChart.on('preRedraw', calc_domain);
        return lineChart;
    }

    //Function to filter all charts (pass array of charts to be filtered)
    $scope.filterAllCharts = function (charts) {
        charts.forEach(function (chart) {
            chart.filterAll();
        });
    }
    //Function to reset chart
    $scope.resetChart = function (chart) {
        $scope[chart].filterAll();
        dc.redrawAll();
    }
    //Function to reset All charts
    $scope.resetAllChart = function (chartsFor) {
        $scope.$broadcast('rzSliderForceRender');
        if (chartsFor == 'orders') {
            $scope.orderDate = {};
            $scope.orderValue = {};
            $scope.perUnitPrice = {};
            $scope.allFilters = {}
            $scope.filterAllCharts([$scope.channel, $scope.state, $scope.category, $scope.item, $scope.volume, $scope.value]);
            $scope.ordersCf.remove();
            $scope.showOrdersChart({}, {}, {});
        }
        else if (chartsFor == 'inventory') {
            $scope.inventoryItemCost = {};
            $scope.inventoryDate = {};
            $scope.allFilters = {}
            $scope.filterAllCharts([$scope.sku, $scope.warehouse,$scope.daysOfInventory,$scope.sellthroughvol,$scope.sellthroughval]);
            $scope.inventoryCf.remove();
            $scope.showInventoryChart({}, {}, {});
        }

    }
    var csvHeaders;
    function capitaliseFirstLetter (string){
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    //Function to download the filtered data
    $scope.downloadData = function (chartsFor) {
        if (chartsFor == 'orders') {
            $scope.cityDim = $scope.ordersCf.dimension(function (d) {
                return d.city;
            });
            var result = $scope.cityDim.top(1).map(function (d) {
                        csvHeaders = [];
                        Object.keys(d).forEach(function (data) {
                            csvHeaders.push(capitaliseFirstLetter(data));
                        });
                return d;
            });
            var lines = d3.csv.format($scope.cityDim.top(Infinity)).split('\n');
            lines.shift();
            var blob = new Blob([csvHeaders.join(',') +"\n"+lines.join('\n')], {type: "text/csv;charset=utf-8"});
            saveAs(blob, 'orders_'+ new Date().format('dd/MM/yy')+'.csv');
            $scope.cityDim.dispose();
        }
        else if (chartsFor == 'inventory') {
            $scope.warehouseNameDim = $scope.inventoryCf.dimension(function (d) {
                return d.warehousename;
            });
            var result = $scope.warehouseNameDim.top(1).map(function (d) {
                csvHeaders = [];
                Object.keys(d).forEach(function (data) {
                    csvHeaders.push(capitaliseFirstLetter(data));
                });
                return d;
            });
            var lines = d3.csv.format($scope.warehouseNameDim.top(Infinity)).split('\n');
            lines.shift();
            var blob = new Blob([csvHeaders.join(',') +"\n"+lines.join('\n')], {type: "text/csv;charset=utf-8"});
            saveAs(blob, 'inventory_'+ new Date().format('dd/MM/yy')+'.csv');
            $scope.warehouseNameDim.dispose();
        }

    }
    //Function to get the sum of order value
    function sumOfOrderValue(obj) {
        var sum = 0;
        for (var el in obj) {
            if (obj.hasOwnProperty(el)) {
                sum += parseFloat(obj[el]);
            }
        }
        return sum;
    }
    //Function to get the sum of order count
    function sumOfOrderCount(obj) {
        var sum = 0;
        for (var el in obj) {
            if (obj.hasOwnProperty(el)) {
                sum += parseFloat(obj[el].value.oderCount);
            }
        }
        return sum;
    }
    //Function to remove empty bins of groups based on their keys
    function remove_empty_bins(source_group) {
        return {
            all: function () {
                return source_group.all().filter(function (d) {
                    return d.value != 0;
                });
            }
        };
    }
    //Function to remove empty bins of groups based on their keys for date group
    function remove_empty_bins1(source_group, startDate, endDate) {
        return {
            all: function () {
                return source_group.all().filter(function (d) {
                    return ((new Date(d.key) >= new Date(startDate)) && (new Date(d.key) <= new Date(endDate)));

                });
            }
        };
    }
    //Function to remove empty bins of custom groups
    function remove_empty_bins_custom(source_group, filterArray) {
        if(typeof filterArray != "undefined" && filterArray.length){
            return {
                all: function () {
                    return source_group.all().filter(function (d) {
                        return filterArray.indexOf(d.key) != -1;
                    });
                }
            };
        }
        else{
            return source_group;
        }

    }
    //Function to Dispose Dimensions
    function disposeDim (dimensions){
        dimensions.forEach(function(dim){
            dim.dispose();
        })
    }
    //Function to deregister charts
    function deregisterChart(charts) {
        charts.forEach(function (chart) {
            //dc.deregisterChart(chart.chart, chart.group);
            dc.chartRegistry.deregister(chart.chart, chart.group);
            dc.chartRegistry.clear(chart.group);
        });
    }
    //Function to redraw all charts
    function redrawChart(charts) {
        charts.forEach(function (chart) {
            chart.redraw();
        });
    }

    $rootScope.$on('$routeChangeStart', function (event, next, prev) {
        dc.chartRegistry.clear(null);
        d3.selectAll("svg").remove();
        if($scope.orders) $scope.ordersCf.remove();
        if($scope.inventory) $scope.inventoryCf.remove();
    })
}]);
