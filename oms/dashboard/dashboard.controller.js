angular.module('OMSApp.dashboard', []).config(function config($stateProvider,$urlRouterProvider) {
   // $urlRouterProvider.otherwise('oms/dashboard');
      $stateProvider.state('/Dashboard/', {
     name: '/Dashboard/',
     url: '/Dashboard/',
     views: {
     "main": {
     controller: 'dashboardCtrl',
     templateUrl: 'dashboard/dashboard.newview.html'
     },
     "header": {
     controller: 'headerCtrl',
     templateUrl: '../shared/templates/header.html'
     }
     },
     data: {pageTitle: 'Login'}
     })

}).controller('dashboardCtrl', ['$scope','$state','$http','$q','$location','$cookies','$window','MavenAppConfig',
function dashboardNewController($scope,$state, $http,$q, $location,$cookies, $window,MavenAppConfig) {

 /*   $scope.goTo=function(path){
$state.go(path);
    }*/
    var ofs = 0, pag = 5;
    $scope.activeInterval = 'month';
    $scope.options = {};
    $scope.endpoints = {
        day:'/omsservices/webapi/orderreports/dashboardorderscsv?range=day',
        week:'/omsservices/webapi/orderreports/dashboardorderscsv?range=week',
        month:'/omsservices/webapi/orderreports/dashboardorderscsv?range=month',
        quarter:'/omsservices/webapi/orderreports/dashboardorderscsv?range=quarter',
        year:'/omsservices/webapi/orderreports/dashboardorderscsv?range=year'
    }
    $scope.allFilters = {};
    $scope.noInventoryData = true;
    $scope.getCsvData = function (interval) {
        $scope.mainHeading = 'saleOrder';
        $scope.allFilters = {};
        $scope.activeInterval = interval;
        var intervalUrl = $scope.endpoints[interval];
        var promises = [
            // $http({method: 'GET', url: '/omscss/angular-inventory/warehouse.csv'}),
            // $http({method: 'GET', url: '/omscss/angular-inventory/orders.csv'}),
            $http({method: 'GET', url: MavenAppConfig.baseUrlSource + intervalUrl})
        ]

        $q.all(promises)
            .then(function (response) {
                // $scope.warehouseData = d3.csv.parse(response[0].data);
                $scope.csvData = d3.csv.parse(response[0].data);
                dc.chartRegistry.clear();
                d3.selectAll("svg").remove();
                $scope.resetPage();
                $scope.noWarehouseData = true;
                $scope.noChannelData = true;
                $scope.noCategoryData = true;
                $scope.noSkuData = true;
                $scope.noCustomerData = true;
                $scope.noGeolocationData = true;
                $scope.totals = {
                    value : 0,
                    volume : 0,
                    trend : 0
                }
                $scope.showTotalCharts();
                if(!$scope.skuOpen){
                    $scope.showSkuCharts();
                }
                else if(!$scope.warehouseOpen){
                    $scope.showWarehouseCharts();
                }
                else if(!$scope.customerOpen){
                    $scope.showCustomerCharts();
                }
                else if(!$scope.channelOpen){
                    $scope.showChannelCharts();
                }
                else if(!$scope.categoryOpen){
                    $scope.showCategoryCharts();
                }
                else if(!$scope.geolocationOpen){
                    $scope.showGeolocationCharts();
                }


            })
            .catch(function(error){
                console.log(error);
            })
        if($scope.activeInterval == 'day'){
            $scope.tableLabel1= 'Today';
            $scope.tableLabel2= 'Yesterday';
        }
        else if($scope.activeInterval == 'week'){
            $scope.tableLabel1= 'This Week';
            $scope.tableLabel2= 'Last Week';
        }
        else if($scope.activeInterval == 'month'){
            $scope.tableLabel1= 'This Month';
            $scope.tableLabel2= 'Last Month';
        }
        else if($scope.activeInterval == 'quarter'){
            $scope.tableLabel1= 'This Quarter';
            $scope.tableLabel2= 'Last Quarter';
        }
        else if($scope.activeInterval == 'year'){
            $scope.tableLabel1= 'This Year';
            $scope.tableLabel2= 'Last Year';
        }
    }

    $scope.getInventoryCsvData = function(){
        $scope.mainHeading = 'inventory';
        $scope.allFilters = {};
        $http({method: 'GET', url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/inventoryreports/inventoryskucsv'})
            .success(function (data) {
                if(data){
                    $scope.inventoryCsvData = d3.csv.parse(data);
                    dc.chartRegistry.clear();
                    d3.selectAll("svg").remove();
                    $scope.resetPage();
                    $scope.noInventoryData = true;
                    $scope.showInventoryCharts();
                }
            })
            .error(function (error) {

            });
    }

    $scope.showOrHideCharts = function (item) {
        dc.chartRegistry.clear();
        d3.selectAll("svg").remove();
        $scope.resetPage();
        $scope.currentPannel = item;
        switch ($scope.currentPannel){
            case 'sku': $scope.channelOpen = true;
                        $scope.categoryOpen = true;
                        $scope.customerOpen = true;
                        $scope.geolocationOpen = true;
                        $scope.warehouseOpen = true;
                        if($scope.skuOpen){
                            $scope[item+'Cf'].remove();
                        }
                        else{
                            $scope.showSkuCharts();
                        }
                        break;
            case 'warehouse':   $scope.channelOpen = true;
                                $scope.categoryOpen = true;
                                $scope.customerOpen = true;
                                $scope.geolocationOpen = true;
                                $scope.skuOpen = true;
                                if($scope.warehouseOpen){
                                    $scope[item+'Cf'].remove();
                                }
                                else{
                                    $scope.showWarehouseCharts();
                                }
                                break;
            case 'channel': $scope.skuOpen = true;
                            $scope.categoryOpen = true;
                            $scope.customerOpen = true;
                            $scope.geolocationOpen = true;
                            $scope.warehouseOpen = true;
                            if($scope.channelOpen) {
                                $scope[item+'Cf'].remove();
                            }
                            else{
                                $scope.showChannelCharts();
                            }
                            break;
            case 'category': $scope.channelOpen = true;
                             $scope.skuOpen = true;
                             $scope.customerOpen = true;
                             $scope.geolocationOpen = true;
                             $scope.warehouseOpen = true;
                             if($scope.categoryOpen){
                                $scope[item+'Cf'].remove();
                             }
                             else{
                                $scope.showCategoryCharts();
                             }
                             break;
            case 'customer': $scope.channelOpen = true;
                             $scope.categoryOpen = true;
                             $scope.skuOpen = true;
                             $scope.geolocationOpen = true;
                             $scope.warehouseOpen = true;
                             if($scope.customerOpen) {
                                $scope[item+'Cf'].remove();
                             }
                             else{
                                $scope.showCustomerCharts();
                             }
                             break;
            case 'geolocation': $scope.channelOpen = true;
                                $scope.categoryOpen = true;
                                $scope.skuOpen = true;
                                $scope.customerOpen = true;
                                $scope.warehouseOpen = true;
                                if($scope.geolocationOpen) {
                                    $scope[item+'Cf'].remove();
                                }
                                else{
                                    $scope.showGeolocationCharts();
                                }
                                break;

        }
    }
    //Function to remove empty bins
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
    //total charts
    $scope.showTotalCharts = function () {
        $scope.totalCf = crossfilter(angular.copy($scope.csvData));
        $scope.totalValue = $scope.totalCf.groupAll();
        $scope.totalValueGroup = $scope.totalValue.reduce(
            function (p, v) {
                if (v.skusystemcode in p.skuCodes) {
                    p.skuCodes[v.skusystemcode]++;
                }
                else {
                    p.skuCodes[v.skusystemcode] = 1;
                    p.skuCount++;
                }
                p.skuValue += Number(v.totalvalue);
                p.skuYValue += Number(v.ytotalvalue);
                p.skuVolume += Number(v.volume);
                return p;
            },

            //Dimension reduce remove function
            function (p, v) {
                p.skuCodes[v.skusystemcode]--;
                p.skuValue -= Number(v.totalvalue);
                p.skuYValue -= Number(v.ytotalvalue);
                p.skuVolume -= Number(v.volume);
                if (p.skuCodes[v.skusystemcode] === 0) {
                    delete p.skuCodes[v.skusystemcode];
                    p.skuCount--;

                }
                return p;
            },

            //Dimension reduce inital function
            function (p, v) {
                return {skuCount: 0,skuVolume:0, skuCodes: {}, skuValue: 0,skuYValue: 0};
            }
        );
        console.log('total');
        console.log($scope.totalValueGroup.value());
        $scope.totals = {
            value : d3.format(",f")($scope.totalValueGroup.value().skuValue),
            volume : d3.format(",f")($scope.totalValueGroup.value().skuVolume),
            trend : $scope.totalValueGroup.value().skuValue <=0 ? 0 : (($scope.totalValueGroup.value().skuValue - $scope.totalValueGroup.value().skuYValue)/$scope.totalValueGroup.value().skuValue)*100
        }
    }
    //Warehouse charts
    $scope.showWarehouseCharts = function(){
        var pieWidth = angular.element(document.querySelector(".pieChart"))[0].clientWidth;
        angular.element(document.querySelector(".pieChart"))[0].dataset.height = angular.element(document.querySelector(".pieChart"))[0].dataset.height || pieWidth;
        if(pieWidth == 0){
            pieWidth = angular.element(document.querySelector(".pieChart"))[0].dataset.height;
        }
        $scope.warehouse = dc.pieChart('#warehouseChart');
        $scope.warehouseGainOrLoss = dc.pieChart('#warehouseGainOrLossChart');
        $scope.warehouseTable = dc.dataTable('.warehouseTable');
        var meltData = cast(angular.copy($scope.csvData),["warehouseid","warehousename",],cast.sum,["totalvalue","ytotalvalue"]);
        console.log('meltData');
        console.log(meltData);
        if(meltData.length == 0){
            console.log('no data');
            $scope.noWarehouseData = true;
        }
        else{
            $scope.noWarehouseData = false;
        }
        $scope.warehouseCf = crossfilter(meltData);

        $scope.warehouseDim = $scope.warehouseCf.dimension(function (d) {
            return d.warehousename;
        });

        $scope.warehouseGainOrLossDim = $scope.warehouseCf.dimension(function (d) {
            if (+d.totalvalue > +d.ytotalvalue) {
                return d.status = 'Gain';
            }
            else if(+d.totalvalue < +d.ytotalvalue) {
                return d.status = 'Loss';
            }
            else {
                return d.status = 'No Change';
            }
        });

        $scope.warehouseGainOrLossGroup = $scope.warehouseGainOrLossDim.group().reduceCount();


        $scope.warehouseGroup = $scope.warehouseDim.group().reduceSum(function (d) {
            return +d.totalvalue;
        });
        if (typeof $scope.allFilters.warehouseSelected !== 'undefined' && $scope.allFilters.warehouseSelected && $scope.allFilters.warehouseSelected.length > 0) {
            $scope.warehouseDim.filterFunction(function (d) {
                return $scope.allFilters.warehouseSelected.indexOf(d) !== -1;
            });
            $scope.warehouseGroup = $scope.warehouseDim.group().reduceSum(function (d) {
                return +d.totalvalue;
            })
            $scope.warehouseGroup = remove_empty_bins_custom($scope.warehouseGroup, $scope.allFilters.warehouseSelected);
        }
        else if(typeof $scope.allFilters.warehouseSelected){
            $scope.warehouseGroup = $scope.warehouseDim.group().reduceSum(function (d) {
                return +d.totalvalue;
            })
        }

        $scope.warehouseTableDim = $scope.warehouseCf.dimension(function (d) {
            return d.warehouseid;
        });

        $scope.warehouseTableGroup = $scope.warehouseTableDim.group();

        $scope.warehouse
            .width(pieWidth - .25 * pieWidth)
            .height(pieWidth - .25 * pieWidth)
            .radius(.25 * pieWidth)
            .innerRadius(.125 * pieWidth)
            .colors(d3.scale.quantize().domain([0, 5]).range(["#44c1e9", "#48cfad", "#fc6e51", "#9fd467", "#ac92ec"]))// .colors(d3.scale.quantize().domain([0, 5]).range(["#44c1e9", "#48cfad", "#fc6e51", "#9fd467", "#ac92ec"]))
            // .colors(d3.scale.quantize().domain([0, 5]).range(["#f0592b", "#fd805a", "#ec9d85", "#f1c3b5", "#ead9d4"]))
            .colorAccessor(function (d, i) {
                return i;
            })
            .dimension($scope.warehouseDim)
            .group($scope.warehouseGroup)
            .title(function (d) {
                return d.key +' Rs.'+ d3.format(",f")(d.value);
            })
            // .title(titleAccessor)
            // .ordering(ordering)
            .renderLabel(false)
            // .valueAccessor(function (d) {
            //     return 'Rs.'+ d3.format(",f")(d.value);
            // })
            .legend(dc.legend()
                .legendWidth(10)
                .legendText(function(d, i) {
                    console.log(d);
                    if(d.name.length > 9) d.nameAlias =  d.name.substr(0,15)+'...';
                    return (d.nameAlias ? d.nameAlias : d.name );
                })
                .itemHeight(10)
                .x(5)
                .y(5)
                .gap(5))
            .on('filtered', function() {
                $scope.resetPage();
                $scope.tableSize = $scope.warehouseTableGroup.all().filter(function(d) { return d.value != 0; }).length;
                $scope.update($scope.warehouseTable,$scope.tableSize,'warehouse');
            })
            .on('renderlet', function (chart) {
                chart.selectAll('g.dc-legend-item').append('title').text(function(d) {
                    return d.name;
                });
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
            });

        $scope.warehouseGainOrLoss
            .width(pieWidth - .25 * pieWidth)
            .height(pieWidth - .25 * pieWidth)
            .radius(.25 * pieWidth)
            .innerRadius(.125 * pieWidth)
            .colors(d3.scale.quantize().domain([0, 5]).range(["#44c1e9", "#48cfad", "#fc6e51", "#9fd467", "#ac92ec"]))
            // .colors(d3.scale.quantize().domain([0, 5]).range(["#f0592b", "#fd805a", "#ec9d85", "#f1c3b5", "#ead9d4"]))
            .colorAccessor(function (d, i) {
                return i;
            })
            .dimension($scope.warehouseGainOrLossDim)
            .group($scope.warehouseGainOrLossGroup)
            // .label(labelAccessor)
            // .title(titleAccessor)
            // .ordering(ordering)
            .renderLabel(false)
            // .valueAccessor(function(d) { return Object.keys(d.value.warehouses).length ; })
            .legend(dc.legend().itemHeight(10).x(5).y(5).gap(5))
            .on('filtered', function() {
                $scope.resetPage();
                $scope.tableSize = $scope.warehouseTableGroup.all().filter(function(d) { return d.value != 0; }).length;
                $scope.update($scope.warehouseTable,$scope.tableSize,'warehouse');
            });

        $scope.warehouseTable
            .dimension($scope.warehouseTableDim)
            .group(function (d) {
                return d.totalvalue;
            })
            .showGroups(false)
            .columns(
                [
                    { label:'Warehouse',
                        format: function (d) { return d.warehousename; }
                    },
                    { label:$scope.tableLabel1+' (Rs.)',
                        format: function (d) { return d3.format(",f")(d.totalvalue); }
                    },
                    { label:$scope.tableLabel2+' (Rs.)',
                        format: function (d) { return d3.format(",f")(d.ytotalvalue) }
                    },
                    { label:'Status',
                        format: function (d) {
                            if (+d.totalvalue > +d.ytotalvalue) {
                                return '<span style="color: lightgreen" class="glyphicon glyphicon-arrow-up"></span>';
                            }
                            else if (+d.totalvalue < +d.ytotalvalue) {
                                return '<span style="color: red" class="glyphicon glyphicon-arrow-down"></span>';
                            }
                            else {
                                return '<span style="color: #dddddd" class="glyphicon glyphicon-resize-horizontal"></span>';
                            }
                        }
                    },
                    { label:'Change (%)',
                        format: function (d) {
                            if((+d.totalvalue) == 0 && (+d.ytotalvalue) == 0) return '0%';
                            else if((+d.totalvalue) == 0) return '-100%';
                            else if((+d.ytotalvalue) == 0) return '100%';
                            else return (((+d.totalvalue) - (+d.ytotalvalue))/(+d.ytotalvalue) * 100).toFixed(1) + '%';
                        }
                    }

                ]
            )
            .sortBy(function (d) { return d.totalvalue })
            .order(d3.descending);
        $scope.tableSize = $scope.warehouseTableGroup.all().filter(function(d) { return d.value != 0; }).length;
        $scope.update($scope.warehouseTable,$scope.tableSize,'warehouse');
        dc.renderAll();
        document.getElementsByClassName('warehouseTableContainer')[0].style.height = (pieWidth - .25 * pieWidth) + 40  +'px';
    }

    //SKU charts
    $scope.showSkuCharts = function () {
        var pieWidth = angular.element(document.querySelector(".pieChart"))[0].clientWidth;
        angular.element(document.querySelector(".pieChart"))[0].dataset.height = angular.element(document.querySelector(".pieChart"))[0].dataset.height || pieWidth;
        if(pieWidth == 0){
            pieWidth = angular.element(document.querySelector(".pieChart"))[0].dataset.height;
        }
        $scope.sku = dc.pieChart('#skuChart');
        $scope.skuGainOrLoss = dc.pieChart('#skuGainOrLossChart');
        $scope.skuTable = dc.dataTable('.skuTable');
        var meltData = cast(angular.copy($scope.csvData),["skusystemcode","skuname",],cast.sum,["totalvalue","ytotalvalue"]);
        if(meltData.length == 0){
            $scope.noSkuData = true;
        }
        else{
            $scope.noSkuData = false;
        }
        $scope.skuCf = crossfilter(meltData);
        $scope.allSku = $scope.skuCf.groupAll();
        $scope.skuDim = $scope.skuCf.dimension(function (d) {
            return d.skuname;
        });

        $scope.skuGainOrLossDim = $scope.skuCf.dimension(function (d) {
            if (+d.totalvalue > +d.ytotalvalue) {
                return d.status = 'Gain';
            }
            else if(+d.totalvalue < +d.ytotalvalue) {
                return d.status = 'Loss';
            }
            else {
                return d.status = 'No Change';
            }
        });
        $scope.skuGainOrLossGroup = $scope.skuGainOrLossDim.group().reduceCount();
        console.log($scope.skuGainOrLossGroup.all());

        $scope.skuGroup = $scope.skuDim.group().reduceSum(function (d) {
            return +d.totalvalue;
        });

        if (typeof $scope.allFilters.skuSelected !== 'undefined' && $scope.allFilters.skuSelected && $scope.allFilters.skuSelected.length > 0) {
            $scope.skuDim.filterFunction(function (d) {
                return $scope.allFilters.skuSelected.indexOf(d) !== -1;
            });
            $scope.skuGroup = $scope.skuDim.group().reduceSum(function (d) {
                return +d.totalvalue;
            });
            $scope.skuGroup = remove_empty_bins_custom($scope.skuGroup, $scope.allFilters.skuSelected);
        }
        else if(typeof $scope.allFilters.skuSelected) {
            $scope.skuGroup = $scope.skuDim.group().reduceSum(function (d) {
                return +d.totalvalue;
            });
        }

        $scope.skuTableDim = $scope.skuCf.dimension(function (d) {
            return d.skusystemcode;
        });
        $scope.skuTableGroup = $scope.skuTableDim.group();

        $scope.sku
            .width(pieWidth - .25 * pieWidth)
            .height(pieWidth - .25 * pieWidth)
            .radius(.25 * pieWidth)
            .innerRadius(.125 * pieWidth)
            .colors(d3.scale.quantize().domain([0, 5]).range(["#44c1e9", "#48cfad", "#fc6e51", "#9fd467", "#ac92ec"]))
            // .colors(d3.scale.quantize().domain([0, 5]).range(["#f0592b", "#fd805a", "#ec9d85", "#f1c3b5", "#ead9d4"]))
            .colorAccessor(function (d, i) {
                return i;
            })
            .dimension($scope.skuDim)
            .group($scope.skuGroup)
            // .label(labelAccessor)
            .title(function (d) {
                return d.key +' Rs.'+ d3.format(",f")(d.value);
            })
            // .ordering(ordering)
            .renderLabel(false)
            // .valueAccessor(function (d) {
            //     return d.value.skuValue;
            // })
            .legend(dc.legend()
                .legendWidth(10)
                .legendText(function(d, i) {
                    console.log(d);
                    if(d.name.length > 9) d.nameAlias =  d.name.substr(0,15)+'...';
                    return (d.nameAlias ? d.nameAlias : d.name );
                })
                .itemHeight(10)
                .x(5)
                .y(5)
                .gap(5))
            .cap(4)
            .on('filtered', function(chart, filter) {
                $scope.resetPage();
                $scope.tableSize = $scope.skuTableGroup.all().filter(function(d) { return d.value != 0; }).length;
                $scope.update($scope.skuTable,$scope.tableSize,'sku');
            })
            .on('renderlet', function (chart) {
                chart.selectAll('g.dc-legend-item').append('title').text(function(d) {
                    return d.name;
                });
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
            });

        $scope.skuGainOrLoss
            .width(pieWidth - .25 * pieWidth)
            .height(pieWidth - .25 * pieWidth)
            .radius(.25 * pieWidth)
            .innerRadius(.125 * pieWidth)
            .colors(d3.scale.quantize().domain([0, 5]).range(["#44c1e9", "#48cfad", "#fc6e51", "#9fd467", "#ac92ec"]))
            // .colors(d3.scale.quantize().domain([0, 5]).range(["#f0592b", "#fd805a", "#ec9d85", "#f1c3b5", "#ead9d4"]))
            .colorAccessor(function (d, i) {
                return i;
            })
            .dimension($scope.skuGainOrLossDim)
            .group($scope.skuGainOrLossGroup)
            // .label(labelAccessor)
            // .title(titleAccessor)
            // .ordering(ordering)
            .renderLabel(false)
            // .valueAccessor(function (d) {
            //     return d.value.count.exceptionCount;
            // })
            .legend(dc.legend().itemHeight(10).x(5).y(5).gap(5))
            .cap(4)
            .on('filtered', function() {
                $scope.resetPage();
                $scope.tableSize = $scope.skuTableGroup.all().filter(function(d) { return d.value != 0; }).length;
                $scope.update($scope.skuTable,$scope.tableSize,'sku');
            });




        $scope.skuTable
            .dimension($scope.skuTableDim)
            .group(function (d) {
                return d.totalvalue;
            })
            .showGroups(false)
            .columns(
                [
                    { label:'SKU',
                      // format: function (d) { return d.key }
                      format: function (d) { return d.skuname }
                    },
                    { label:$scope.tableLabel1+' (Rs.)',
                        format: function (d) { return d3.format(",f")(d.totalvalue); }
                    },
                    { label:$scope.tableLabel2+' (Rs.)',
                        format: function (d) { return d3.format(",f")(d.ytotalvalue) }
                    },
                    { label:'Status',
                        format: function (d) {
                            if (+d.totalvalue > +d.ytotalvalue) {
                                return '<span style="color: lightgreen" class="glyphicon glyphicon-arrow-up"></span>';
                            }
                            else if (+d.totalvalue < +d.ytotalvalue) {
                                return '<span style="color: red" class="glyphicon glyphicon-arrow-down"></span>';
                            }
                            else {
                                return '<span style="color: #dddddd" class="glyphicon glyphicon-resize-horizontal"></span>';
                            }
                        }
                    },
                    { label:'Change (%)',
                        format: function (d) {
                            if((+d.totalvalue) == 0 && (+d.ytotalvalue) == 0) return '0%';
                            else if((+d.totalvalue) == 0) return '-100%';
                            else if((+d.ytotalvalue) == 0) return '100%';
                            else return (((+d.totalvalue) - (+d.ytotalvalue))/(+d.ytotalvalue) * 100).toFixed(1) + '%';
                            }
                    }
                ]
            )
            .sortBy(function (d) { return d.totalvalue })
            .order(d3.descending);
        $scope.tableSize = $scope.skuTableGroup.all().filter(function(d) { return d.value != 0; }).length;
        $scope.update($scope.skuTable,$scope.tableSize,'sku');
        dc.renderAll();
        document.getElementsByClassName('skuTableContainer')[0].style.height = (pieWidth - .25 * pieWidth) + 40  +'px';
    }

    $scope.checkChartSearchFilter = function (chartFor, dimension) {
        $scope[dimension].filterAll();
        if(!$scope.skuOpen){
            $scope.showSkuCharts();
        }
        else if(!$scope.warehouseOpen){
            $scope.showWarehouseCharts();
        }
        else if(!$scope.customerOpen){
            $scope.showCustomerCharts();
        }
        else if(!$scope.channelOpen){
            $scope.showChannelCharts();
        }
        else if(!$scope.categoryOpen){
            $scope.showCategoryCharts();
        }
        else if(!$scope.geolocationOpen){
            $scope.showGeolocationCharts();
        }

    }

    //Channel charts
    $scope.showChannelCharts = function () {
        var pieWidth = angular.element(document.querySelector(".pieChart"))[0].clientWidth;
        angular.element(document.querySelector(".pieChart"))[0].dataset.height = angular.element(document.querySelector(".pieChart"))[0].dataset.height || pieWidth;
        if(pieWidth == 0){
            pieWidth = angular.element(document.querySelector(".pieChart"))[0].dataset.height;
        }
        $scope.channel = dc.pieChart('#channelChart');
        $scope.channelGainOrLoss = dc.pieChart('#channelGainOrLossChart');
        $scope.channelTable = dc.dataTable('.channelTable');
        var meltData = cast(angular.copy($scope.csvData),["channelid","channelname",],cast.sum,["totalvalue","ytotalvalue"]);
        if(meltData.length == 0){
            $scope.noChannelData = true;
        }
        else{
            $scope.noChannelData = false;
        }
        $scope.channelCf = crossfilter(meltData);

        $scope.channelDim = $scope.channelCf.dimension(function (d) {
            return d.channelname;
        });

        $scope.channelGainOrLossDim = $scope.channelCf.dimension(function (d) {
            if (+d.totalvalue > +d.ytotalvalue) {
                return 'Gain';
            } else {
                return 'Loss';
            }
        });
        $scope.channelGainOrLossGroup = $scope.channelGainOrLossDim.group().reduceCount();

        $scope.channelGroup = $scope.channelDim.group().reduceSum(function (d) {
            return +d.totalvalue;
        });

        //Filtering channel dimension when a channel is searched
        if (typeof $scope.allFilters.channelSelected !== 'undefined' && $scope.allFilters.channelSelected && $scope.allFilters.channelSelected.length > 0) {
            $scope.channelDim.filterFunction(function (d) {
                return $scope.allFilters.channelSelected.indexOf(d) !== -1;
            });
            $scope.channelGroup = $scope.channelDim.group().reduceSum(function (d) {
                return +d.totalvalue;
            });
            $scope.channelGroup = remove_empty_bins_custom($scope.channelGroup, $scope.allFilters.channelSelected);
        }
        else if(typeof $scope.allFilters.channelSelected){
            $scope.channelGroup = $scope.channelDim.group().reduceSum(function (d) {
                return +d.totalvalue;
            });
        };

        $scope.channelTableDim = $scope.channelCf.dimension(function (d) {
            return d.channelid;
        });
        $scope.channelTableGroup = $scope.channelTableDim.group();

        $scope.channel
            .width(pieWidth - .25 * pieWidth)
            .height(pieWidth - .25 * pieWidth)
            .radius(.25 * pieWidth)
            .innerRadius(.125 * pieWidth)
            .colors(d3.scale.quantize().domain([0, 5]).range(["#44c1e9", "#48cfad", "#fc6e51", "#9fd467", "#ac92ec"]))
            // .colors(d3.scale.quantize().domain([0, 5]).range(["#f0592b", "#fd805a", "#ec9d85", "#f1c3b5", "#ead9d4"]))
            .colorAccessor(function (d, i) {
                return i;
            })
            .dimension($scope.channelDim)
            .group($scope.channelGroup)
            // .label(labelAccessor)
            .title(function (d) {
                return d.key +' Rs.'+ d3.format(",f")(d.value);
            })
            // .ordering(ordering)
            .renderLabel(false)
            // .valueAccessor(function (d) {
            //     return d.value.channelValue;
            // })
            .cap(4)
            .legend(dc.legend()
                .legendWidth(10)
                .legendText(function(d, i) {
                    console.log(d);
                    if(d.name.length > 9) d.nameAlias =  d.name.substr(0,15)+'...';
                    return (d.nameAlias ? d.nameAlias : d.name );
                })
                .itemHeight(10)
                .x(5)
                .y(5)
                .gap(5))
            .on('filtered', function() {
                $scope.resetPage();
                $scope.tableSize = $scope.channelTableGroup.all().filter(function(d) { return d.value != 0; }).length;
                $scope.update($scope.channelTable,$scope.tableSize,'channel');
            })
            .on('renderlet', function (chart) {
                chart.selectAll('g.dc-legend-item').append('title').text(function(d) {
                    return d.name;
                });
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
            });

        $scope.channelGainOrLoss
            .width(pieWidth - .25 * pieWidth)
            .height(pieWidth - .25 * pieWidth)
            .radius(.25 * pieWidth)
            .innerRadius(.125 * pieWidth)
            .colors(d3.scale.quantize().domain([0, 5]).range(["#44c1e9", "#48cfad", "#fc6e51", "#9fd467", "#ac92ec"]))
            // .colors(d3.scale.quantize().domain([0, 5]).range(["#f0592b", "#fd805a", "#ec9d85", "#f1c3b5", "#ead9d4"]))
            .colorAccessor(function (d, i) {
                return i;
            })
            .dimension($scope.channelGainOrLossDim)
            .group($scope.channelGainOrLossGroup)
            // .label(labelAccessor)
            // .title(titleAccessor)
            // .ordering(ordering)
            .renderLabel(false)
            // .valueAccessor(valueAccessor)
            .legend(dc.legend().itemHeight(10).x(5).y(5).gap(5))
            .on('filtered', function() {
                $scope.resetPage();
                $scope.tableSize = $scope.channelTableGroup.all().filter(function(d) { return d.value != 0; }).length;
                $scope.update($scope.channelTable,$scope.tableSize,'channel');
            });

        $scope.channelTable
            .dimension($scope.channelTableDim)
            .group(function (d) {
                return +d.totalvalue;
            })
            .showGroups(false)
            .columns(
                [
                    { label:'Channel',
                        format: function (d) { return d.channelname; }
                    },
                    { label:$scope.tableLabel1+' (Rs.)',
                        format: function (d) { return d3.format(",f")(d.totalvalue); }
                    },
                    { label:$scope.tableLabel2+' (Rs.)',
                        format: function (d) { return d3.format(",f")(d.ytotalvalue) }
                    },
                    { label:'Status',
                        format: function (d) {
                            if (+d.totalvalue > +d.ytotalvalue) {
                                return '<span style="color: lightgreen" class="glyphicon glyphicon-arrow-up"></span>';
                            }
                            else if (+d.totalvalue < +d.ytotalvalue) {
                                return '<span style="color: red" class="glyphicon glyphicon-arrow-down"></span>';
                            }
                            else {
                                return '<span style="color: #dddddd" class="glyphicon glyphicon-resize-horizontal"></span>';
                            }
                        }
                    },
                    { label:'Change (%)',
                        format: function (d) {
                            if((+d.totalvalue) == 0 && (+d.ytotalvalue) == 0) return '0%';
                            else if((+d.totalvalue) == 0) return '-100%';
                            else if((+d.ytotalvalue) == 0) return '100%';
                            else return (((+d.totalvalue) - (+d.ytotalvalue))/(+d.ytotalvalue) * 100).toFixed(1) + '%';
                        }
                    }
                ]
            )
            .sortBy(function (d) { return d.totalvalue })
            .order(d3.descending);
        $scope.tableSize = $scope.channelTableGroup.all().filter(function(d) { return d.value != 0; }).length;
        $scope.update($scope.channelTable,$scope.tableSize,'channel');
        dc.renderAll();
        document.getElementsByClassName('channelTableContainer')[0].style.height = (pieWidth - .25 * pieWidth) + 40  +'px';
    }
    
    //Category charts
    $scope.showCategoryCharts = function () {
        var pieWidth = angular.element(document.querySelector(".pieChart"))[0].clientWidth;
        angular.element(document.querySelector(".pieChart"))[0].dataset.height = angular.element(document.querySelector(".pieChart"))[0].dataset.height || pieWidth;
        if(pieWidth == 0){
            pieWidth = angular.element(document.querySelector(".pieChart"))[0].dataset.height;
        }
        $scope.category = dc.pieChart('#categoryChart');
        $scope.categoryGainOrLoss = dc.pieChart('#categoryGainOrLossChart');
        $scope.categoryTable = dc.dataTable('.categoryTable');
        var meltData = cast(angular.copy($scope.csvData),["categoryid","categoryname",],cast.sum,["totalvalue","ytotalvalue"]);
        if(meltData.length == 0){
            $scope.noCategoryData = true;
        }
        else{
            $scope.noCategoryData = false;
        }
        $scope.categoryCf = crossfilter(meltData);
        $scope.allCategory = $scope.categoryCf.groupAll();

        $scope.categoryDim = $scope.categoryCf.dimension(function (d) {
            return d.categoryname;
        });

        $scope.categoryGainOrLossDim = $scope.categoryCf.dimension(function (d) {
            if (+d.totalvalue > +d.ytotalvalue) {
                return d.status = 'Gain';
            }
            else if(+d.totalvalue < +d.ytotalvalue) {
                return d.status = 'Loss';
            }
            else {
                return d.status = 'No Change';
            }
        });
        $scope.categoryGainOrLossGroup = $scope.categoryGainOrLossDim.group().reduceCount();

        $scope.categoryGroup = $scope.categoryDim.group().reduceSum(function (d) {
            return +d.totalvalue;
        });

        if (typeof $scope.allFilters.categorySelected !== 'undefined' && $scope.allFilters.categorySelected && $scope.allFilters.categorySelected.length > 0) {
            $scope.categoryDim.filterFunction(function (d) {
                return $scope.allFilters.categorySelected.indexOf(d) !== -1;
            });
            $scope.categoryGroup = $scope.categoryDim.group().reduceSum(function (d) {
                return +d.totalvalue;
            });
            $scope.categoryGroup = remove_empty_bins_custom($scope.categoryGroup, $scope.allFilters.categorySelected);
        }
        else if(typeof $scope.allFilters.categorySelected){
            $scope.categoryGroup = $scope.categoryDim.group().reduceSum(function (d) {
                return +d.totalvalue;
            });
        };

        $scope.categoryTableDim = $scope.categoryCf.dimension(function (d) {
            return d.categoryid;
        });
        $scope.categoryTableGroup = $scope.categoryTableDim.group();


        $scope.category
            .width(pieWidth - .25 * pieWidth)
            .height(pieWidth - .25 * pieWidth)
            .radius(.25 * pieWidth)
            .innerRadius(.125 * pieWidth)
            .colors(d3.scale.quantize().domain([0, 5]).range(["#44c1e9", "#48cfad", "#fc6e51", "#9fd467", "#ac92ec"]))
            // .colors(d3.scale.quantize().domain([0, 5]).range(["#f0592b", "#fd805a", "#ec9d85", "#f1c3b5", "#ead9d4"]))
            .colorAccessor(function (d, i) {
                return i;
            })
            .dimension($scope.categoryDim)
            .group($scope.categoryGroup)
            // .label(labelAccessor)
            .title(function (d) {
                return d.key +' Rs.'+ d3.format(",f")(d.value);
            })
            // .ordering(ordering)
            .renderLabel(false)
            // .valueAccessor(function (d) {
            //     return d.value.categoryValue;
            // })
            .legend(dc.legend()
                .legendWidth(10)
                .legendText(function(d, i) {
                    console.log(d);
                    if(d.name.length > 9) d.nameAlias =  d.name.substr(0,15)+'...';
                    return (d.nameAlias ? d.nameAlias : d.name );
                })
                .itemHeight(10)
                .x(5)
                .y(5)
                .gap(5))
            .cap(4)
            .on('filtered', function() {
                $scope.resetPage();
                $scope.tableSize = $scope.categoryTableGroup.all().filter(function(d) { return d.value != 0; }).length;
                $scope.update($scope.categoryTable,$scope.tableSize,'category');
            })
            .on('renderlet', function (chart) {
                chart.selectAll('g.dc-legend-item').append('title').text(function(d) {
                    return d.name;
                });
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
            });

        $scope.categoryGainOrLoss
            .width(pieWidth - .25 * pieWidth)
            .height(pieWidth - .25 * pieWidth)
            .radius(.25 * pieWidth)
            .innerRadius(.125 * pieWidth)
            .colors(d3.scale.quantize().domain([0, 5]).range(["#44c1e9", "#48cfad", "#fc6e51", "#9fd467", "#ac92ec"]))
            // .colors(d3.scale.quantize().domain([0, 5]).range(["#f0592b", "#fd805a", "#ec9d85", "#f1c3b5", "#ead9d4"]))
            .colorAccessor(function (d, i) {
                return i;
            })
            .dimension($scope.categoryGainOrLossDim)
            .group($scope.categoryGainOrLossGroup)
            // .label(labelAccessor)
            // .title(titleAccessor)
            // .ordering(ordering)
            .renderLabel(false)
            // .valueAccessor(valueAccessor)
            .legend(dc.legend().itemHeight(10).x(5).y(5).gap(5))
            .on('filtered', function() {
                $scope.resetPage();
                $scope.tableSize = $scope.categoryTableGroup.all().filter(function(d) { return d.value != 0; }).length;
                $scope.update($scope.categoryTable,$scope.tableSize,'category');
            });

        $scope.categoryTable
            .dimension($scope.categoryTableDim)
            .group(function (d) {
                return d.totalvalue;
            })
            .showGroups(false)
            .columns(
                [
                    { label:'Category',
                        format: function (d) { return d.categoryname }
                    },
                    { label:$scope.tableLabel1+' (Rs.)',
                        format: function (d) { return d3.format(",f")(d.totalvalue); }
                    },
                    { label:$scope.tableLabel2+' (Rs.)',
                        format: function (d) { return d3.format(",f")(d.ytotalvalue) }
                    },
                    { label:'Status',
                        format: function (d) {
                            if (+d.totalvalue > +d.ytotalvalue) {
                                return '<span style="color: lightgreen" class="glyphicon glyphicon-arrow-up"></span>';
                            }
                            else if (+d.totalvalue < +d.ytotalvalue) {
                                return '<span style="color: red" class="glyphicon glyphicon-arrow-down"></span>';
                            }
                            else {
                                return '<span style="color: #dddddd" class="glyphicon glyphicon-resize-horizontal"></span>';
                            }
                        }
                    },
                    { label:'Change (%)',
                        format: function (d) {
                            if((+d.totalvalue) == 0 && (+d.ytotalvalue) == 0) return '0%';
                            else if((+d.ytotalvalue) == 0) return '-100%';
                            else if((+d.ytotalvalue) == 0) return '100%';
                            else return (((+d.totalvalue) - (+d.ytotalvalue))/(+d.ytotalvalue) * 100).toFixed(1) + '%';
                        }
                    }
                ]
            )
            .sortBy(function (d) { return +d.totalvalue })
            .order(d3.descending);
        $scope.tableSize = $scope.categoryTableGroup.all().filter(function(d) { return d.value != 0; }).length;
        $scope.update($scope.categoryTable,$scope.tableSize,'category');
        dc.renderAll();
        document.getElementsByClassName('categoryTableContainer')[0].style.height = (pieWidth - .25 * pieWidth) + 40  +'px';
    }

    //Customer charts
    $scope.showCustomerCharts = function () {
        var pieWidth = angular.element(document.querySelector(".pieChart"))[0].clientWidth;
        angular.element(document.querySelector(".pieChart"))[0].dataset.height = angular.element(document.querySelector(".pieChart"))[0].dataset.height || pieWidth;
        if(pieWidth == 0){
            pieWidth = angular.element(document.querySelector(".pieChart"))[0].dataset.height;
        }
        $scope.customer = dc.pieChart('#customerChart');
        $scope.customerGainOrLoss = dc.pieChart('#customerGainOrLossChart');
        $scope.customerTable = dc.dataTable('.customerTable');
        var meltData = cast(angular.copy($scope.csvData),["custsysno","custname"],cast.sum,["totalvalue","ytotalvalue"]);
        if(meltData.length == 0){
            $scope.noCustomerData = true;
        }
        else{
            $scope.noCustomerData = false;
        }
        $scope.customerCf = crossfilter(meltData);
        $scope.customerDim = $scope.customerCf.dimension(function (d) {
            return d.custname;
        });

        $scope.customerGainOrLossDim = $scope.customerCf.dimension(function (d) {
            if (+d.totalvalue > +d.ytotalvalue) {
                return d.status = 'Gain';
            }
            else if(+d.totalvalue < +d.ytotalvalue) {
                return d.status = 'Loss';
            }
            else {
                return d.status = 'No Change';
            }
        });
        $scope.customerGainOrLossGroup = $scope.customerGainOrLossDim.group().reduceCount();

        $scope.customerGroup = $scope.customerDim.group().reduceSum(function (d) {
            return +d.totalvalue;
        });

        if (typeof $scope.allFilters.customerSelected !== 'undefined' && $scope.allFilters.customerSelected && $scope.allFilters.customerSelected.length > 0) {
            $scope.customerDim.filterFunction(function (d) {
                return $scope.allFilters.customerSelected.indexOf(d) !== -1;
            });
            $scope.customerGroup = $scope.customerDim.group().reduceSum(function (d) {
                return +d.totalvalue;
            });
            $scope.customerGroup = remove_empty_bins_custom($scope.customerGroup, $scope.allFilters.customerSelected);
        }
        else if(typeof $scope.allFilters.customerSelected) {
            $scope.customerGroup = $scope.customerDim.group().reduceSum(function (d) {
                return +d.totalvalue;
            });
        }

        $scope.customerTableDim = $scope.customerCf.dimension(function (d) {
            return d.custsysno;
        });
        $scope.customerTableGroup = $scope.customerTableDim.group();

        $scope.customer
            .width(pieWidth - .25 * pieWidth)
            .height(pieWidth - .25 * pieWidth)
            .radius(.25 * pieWidth)
            .innerRadius(.125 * pieWidth)
            .colors(d3.scale.quantize().domain([0, 5]).range(["#44c1e9", "#48cfad", "#fc6e51", "#9fd467", "#ac92ec"]))
            // .colors(d3.scale.quantize().domain([0, 5]).range(["#f0592b", "#fd805a", "#ec9d85", "#f1c3b5", "#ead9d4"]))
            .colorAccessor(function (d, i) {
                return i;
            })
            .dimension($scope.customerDim)
            .group($scope.customerGroup)
            // .label(labelAccessor)
            .title(function (d) {
                return d.key +' Rs.'+ d3.format(",f")(d.value);
            })
            // .ordering(ordering)
            .renderLabel(false)
            // .valueAccessor(function (d) {
            //     return d.value.customerValue;
            // })
            .legend(dc.legend()
                .legendWidth(10)
                .legendText(function(d, i) {
                    console.log(d);
                    if(d.name.length > 9) d.nameAlias =  d.name.substr(0,15)+'...';
                    return (d.nameAlias ? d.nameAlias : d.name );
                })
                .itemHeight(10)
                .x(5)
                .y(5)
                .gap(5))
            .cap(4)
            .on('filtered', function(chart, filter) {
                $scope.resetPage();
                $scope.tableSize = $scope.customerTableGroup.all().filter(function(d) { return d.value != 0; }).length;
                $scope.update($scope.customerTable,$scope.tableSize,'customer');
            })
            .on('renderlet', function (chart) {
                chart.selectAll('g.dc-legend-item').append('title').text(function(d) {
                    return d.name;
                });
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
            });

        $scope.customerGainOrLoss
            .width(pieWidth - .25 * pieWidth)
            .height(pieWidth - .25 * pieWidth)
            .radius(.25 * pieWidth)
            .innerRadius(.125 * pieWidth)
            .colors(d3.scale.quantize().domain([0, 5]).range(["#44c1e9", "#48cfad", "#fc6e51", "#9fd467", "#ac92ec"]))
            // .colors(d3.scale.quantize().domain([0, 5]).range(["#f0592b", "#fd805a", "#ec9d85", "#f1c3b5", "#ead9d4"]))
            .colorAccessor(function (d, i) {
                return i;
            })
            .dimension($scope.customerGainOrLossDim)
            .group($scope.customerGainOrLossGroup)
            // .label(labelAccessor)
            // .title(titleAccessor)
            // .ordering(ordering)
            .renderLabel(false)
            // .valueAccessor(valueAccessor)
            .legend(dc.legend().itemHeight(10).x(5).y(5).gap(5))
            .on('filtered', function() {
                $scope.resetPage();
                $scope.tableSize = $scope.customerTableGroup.all().filter(function(d) { return d.value != 0; }).length;
                $scope.update($scope.customerTable,$scope.tableSize,'customer');
            });

        $scope.customerTable
            .dimension($scope.customerTableDim)
            .group(function (d) {
                return +d.totalvalue;
            })
            .showGroups(false)
            .columns(
                [
                    { label:'Customer',
                        format: function (d) { return d.custname }
                    },
                    { label:$scope.tableLabel1+' (Rs.)',
                        format: function (d) { return d3.format(",f")(d.totalvalue); }
                    },
                    { label:$scope.tableLabel2+' (Rs.)',
                        format: function (d) { return d3.format(",f")(d.ytotalvalue) }
                    },
                    { label:'Status',
                        format: function (d) {
                            if (+d.totalvalue > +d.ytotalvalue) {
                                return '<span style="color: lightgreen" class="glyphicon glyphicon-arrow-up"></span>';
                            }
                            else if (+d.totalvalue < +d.ytotalvalue) {
                                return '<span style="color: red" class="glyphicon glyphicon-arrow-down"></span>';
                            }
                            else {
                                return '<span style="color: #dddddd" class="glyphicon glyphicon-resize-horizontal"></span>';
                            }
                        }
                    },
                    { label:'Change (%)',
                        format: function (d) {
                            if((+d.totalvalue) == 0 && (+d.ytotalvalue) == 0) return '0%';
                            else if((+d.totalvalue) == 0) return '-100%';
                            else if((+d.ytotalvalue) == 0) return '100%';
                            else return (((+d.totalvalue) - (+d.ytotalvalue))/(+d.ytotalvalue) * 100).toFixed(1) + '%';
                        }
                    }
                ]
            )
            .sortBy(function (d) { return d.totalvalue })
            .order(d3.descending);
        $scope.tableSize = $scope.customerTableGroup.all().filter(function(d) { return d.value != 0; }).length;
        $scope.update($scope.customerTable,$scope.tableSize,'customer');
        dc.renderAll();
        document.getElementsByClassName('customerTableContainer')[0].style.height = (pieWidth - .25 * pieWidth) + 40  +'px';
    }

    //Geolocation charts
    $scope.showGeolocationCharts = function () {
        var pieWidth = angular.element(document.querySelector(".pieChart"))[0].clientWidth;
        angular.element(document.querySelector(".pieChart"))[0].dataset.height = angular.element(document.querySelector(".pieChart"))[0].dataset.height || pieWidth;
        if(pieWidth == 0){
            pieWidth = angular.element(document.querySelector(".pieChart"))[0].dataset.height;
        }
        $scope.geolocation = dc.pieChart('#geolocationChart');
        $scope.geolocationGainOrLoss = dc.pieChart('#geolocationGainOrLossChart');
        $scope.geolocationTable = dc.dataTable('.geolocationTable');
        var meltData = cast(angular.copy($scope.csvData),["stateid","state"],cast.sum,["totalvalue","ytotalvalue"]);
        if(meltData.length == 0){
            $scope.noGeolocationData = true;
        }
        else{
            $scope.noGeolocationData = false;
        }
        $scope.geolocationCf = crossfilter(meltData);
        $scope.geolocationDim = $scope.geolocationCf.dimension(function (d) {
            return d.state;
        });

        $scope.geolocationGainOrLossDim = $scope.geolocationCf.dimension(function (d) {
            if (+d.totalvalue > +d.ytotalvalue) {
                return d.status = 'Gain';
            }
            else if(+d.totalvalue < +d.ytotalvalue) {
                return d.status = 'Loss';
            }
            else {
                return d.status = 'No Change';
            }
        });
        $scope.geolocationGainOrLossGroup = $scope.geolocationGainOrLossDim.group().reduceCount();

        $scope.geolocationGroup = $scope.geolocationDim.group().reduceSum(function (d) {
            return +d.totalvalue;
        });
        if (typeof $scope.allFilters.geolocationSelected !== 'undefined' && $scope.allFilters.geolocationSelected && $scope.allFilters.geolocationSelected.length > 0) {
            $scope.geolocationDim.filterFunction(function (d) {
                return $scope.allFilters.geolocationSelected.indexOf(d) !== -1;
            });
            $scope.geolocationGroup = $scope.geolocationDim.group().reduceSum(function (d) {
                return +d.totalvalue;
            });
            $scope.geolocationGroup = remove_empty_bins_custom($scope.geolocationGroup, $scope.allFilters.geolocationSelected);
        }
        else if(typeof $scope.allFilters.geolocationSelected) {
            $scope.geolocationGroup = $scope.geolocationDim.group().reduceSum(function (d) {
                return +d.totalvalue;
            });
        }

        $scope.geolocationTableDim = $scope.geolocationCf.dimension(function (d) {
            return d.stateid;
        });
        $scope.geolocationTableGroup = $scope.geolocationTableDim.group();

        $scope.geolocation
            .width(pieWidth - .25 * pieWidth)
            .height(pieWidth - .25 * pieWidth)
            .radius(.25 * pieWidth)
            .innerRadius(.125 * pieWidth)
            .colors(d3.scale.quantize().domain([0, 5]).range(["#44c1e9", "#48cfad", "#fc6e51", "#9fd467", "#ac92ec"]))
            // .colors(d3.scale.quantize().domain([0, 5]).range(["#f0592b", "#fd805a", "#ec9d85", "#f1c3b5", "#ead9d4"]))
            .colorAccessor(function (d, i) {
                return i;
            })
            .dimension($scope.geolocationDim)
            .group($scope.geolocationGroup)
            // .label(labelAccessor)
            .title(function (d) {
                return d.key +' Rs.'+ d3.format(",f")(d.value);
            })
            // .ordering(ordering)
            .renderLabel(false)
            // .valueAccessor(function (d) {
            //     return d.value.stateValue;
            // })
            .legend(dc.legend()
                .legendWidth(10)
                .legendText(function(d, i) {
                    console.log(d);
                    if(d.name.length > 9) d.nameAlias =  d.name.substr(0,15)+'...';
                    return (d.nameAlias ? d.nameAlias : d.name );
                })
                .itemHeight(10)
                .x(5)
                .y(5)
                .gap(5))
            .cap(4)
            .on('filtered', function(chart, filter) {
                $scope.resetPage();
                $scope.tableSize = $scope.geolocationTableGroup.all().filter(function(d) { return d.value != 0; }).length;
                $scope.update($scope.geolocationTable,$scope.tableSize,'geolocation');
            })
            .on('renderlet', function (chart) {
                chart.selectAll('g.dc-legend-item').append('title').text(function(d) {
                    return d.name;
                });
                if (typeof $scope.allFilters.geolocationSelected === 'undefined') {
                    $scope.allFilters.geolocation = [];
                    chart.data().forEach(function (d) {
                        if (d.key === "Others") {
                            $scope.allFilters.geolocation = $scope.allFilters.geolocation.concat(d.others);
                        }
                        else {
                            $scope.allFilters.geolocation.push(d.key);
                        }

                    });
                }
            });

        $scope.geolocationGainOrLoss
            .width(pieWidth - .25 * pieWidth)
            .height(pieWidth - .25 * pieWidth)
            .radius(.25 * pieWidth)
            .innerRadius(.125 * pieWidth)
            .colors(d3.scale.quantize().domain([0, 5]).range(["#44c1e9", "#48cfad", "#fc6e51", "#9fd467", "#ac92ec"]))
            // .colors(d3.scale.quantize().domain([0, 5]).range(["#f0592b", "#fd805a", "#ec9d85", "#f1c3b5", "#ead9d4"]))
            .colorAccessor(function (d, i) {
                return i;
            })
            .dimension($scope.geolocationGainOrLossDim)
            .group($scope.geolocationGainOrLossGroup)
            // .label(labelAccessor)
            // .title(titleAccessor)
            // .ordering(ordering)
            .renderLabel(false)
            // .valueAccessor(valueAccessor)
            .legend(dc.legend().itemHeight(10).x(5).y(5).gap(5))
            .on('filtered', function() {
                $scope.resetPage();
                $scope.tableSize = $scope.geolocationTableGroup.all().filter(function(d) { return d.value != 0; }).length;
                $scope.update($scope.geolocationTable,$scope.tableSize,'geolocation');
            });

        $scope.geolocationTable
            .dimension($scope.geolocationTableDim)
            .group(function (d) {
                return +d.totalvalue;
            })
            .showGroups(false)
            .columns(
                [
                    { label:'Location',
                        format: function (d) { return d.state }
                    },
                    { label:$scope.tableLabel1+' (Rs.)',
                        format: function (d) { return d3.format(",f")(d.totalvalue); }
                    },
                    { label:$scope.tableLabel2+' (Rs.)',
                        format: function (d) { return d3.format(",f")(d.ytotalvalue) }
                    },
                    { label:'Status',
                        format: function (d) {
                            if (+d.totalvalue > +d.ytotalvalue) {
                                return '<span style="color: lightgreen" class="glyphicon glyphicon-arrow-up"></span>';
                            }
                            else if (+d.totalvalue < +d.ytotalvalue) {
                                return '<span style="color: red" class="glyphicon glyphicon-arrow-down"></span>';
                            }
                            else {
                                return '<span style="color: #dddddd" class="glyphicon glyphicon-resize-horizontal"></span>';
                            }
                        }
                    },
                    { label:'Change (%)',
                        format: function (d) {
                            if((+d.totalvalue) == 0 && (+d.ytotalvalue) == 0) return '0%';
                            else if((+d.totalvalue) == 0) return '-100%';
                            else if((+d.ytotalvalue) == 0) return '100%';
                            else return (((+d.totalvalue) - (+d.ytotalvalue))/(+d.ytotalvalue) * 100).toFixed(1) + '%';
                        }
                    }
                ]
            )
            .sortBy(function (d) { return +d.totalvalue; })
            .order(d3.descending);
        $scope.tableSize = $scope.geolocationTableGroup.all().filter(function(d) { return d.value != 0; }).length;
        $scope.update($scope.geolocationTable,$scope.tableSize,'geolocation');
        dc.renderAll();
        document.getElementsByClassName('geolocationTableContainer')[0].style.height = (pieWidth - .25 * pieWidth) + 40  +'px';
    }

    //Inventory charts
    $scope.showInventoryCharts = function () {
        var pieWidth = angular.element(document.querySelector(".pieChartInventory"))[0].clientWidth;

        $scope.daysOfInventory = dc.pieChart("#daysOfInventory");
        $scope.inventorySales = dc.pieChart("#inventorySales");
        $scope.inventoryTable = dc.dataTable('.inventoryTable');
        $scope.inventoryCf = crossfilter(angular.copy($scope.inventoryCsvData));
        console.log('inventorydata');
        console.log($scope.inventoryCf.size());
        if($scope.inventoryCf.size() == 0){
            $scope.noInventoryData = true;
        }
        else{
            $scope.noInventoryData = false;
        }
        $scope.daysOfInventoryDim = $scope.inventoryCf.dimension(function(d) {
            if(+d.dateOfInventory < 15 || !(+d.dateOfInventory) ){
                return '<15';
            }
            else if(+d.dateOfInventory > 15 && +d.dateOfInventory < 30){
                return '15-30';
            }
            else if(+d.dateOfInventory >= 30 && +d.dateOfInventory < 60){
                return '30-60';
            }
            else if(+d.dateOfInventory >= 60 && +d.dateOfInventory < 90){
                return '60-90';
            }
            else if(+d.dateOfInventory >= 90){
                return '>90';
            }
        });
        $scope.daysOfInventoryGroup = $scope.daysOfInventoryDim.group().reduceCount();

        $scope.inventorySalesDim = $scope.inventoryCf.dimension(function(d) {
            if(+d.currentMonth < +d.previousMonth ){
                return 'Decrease';
            }
            else if(+d.currentMonth > +d.previousMonth ) {
                return 'Increase';
            }
            else {
                return 'No Change';
            }
        });
        $scope.inventorySalesGroup = $scope.inventorySalesDim.group().reduceCount();

        $scope.inventoryTableDim = $scope.inventoryCf.dimension(function (d) {
            return d.skuClientCode;
        });

        $scope.inventoryTableGroup = $scope.inventoryTableDim.group().reduceCount();

        $scope.daysOfInventory
            .width(pieWidth - .25 * pieWidth)
            .height(pieWidth - .25 * pieWidth)
            .radius(.25 * pieWidth)
            .innerRadius(.125 * pieWidth)
            .colors(d3.scale.quantize().domain([0, 5]).range(["#44c1e9", "#48cfad", "#fc6e51", "#9fd467", "#ac92ec"]))
            // .colors(d3.scale.quantize().domain([0, 5]).range(["#f0592b", "#fd805a", "#ec9d85", "#f1c3b5", "#ead9d4"]))
            .colorAccessor(function (d, i) {
                return i;
            })
            .dimension($scope.daysOfInventoryDim)
            .group($scope.daysOfInventoryGroup)
            // .label(labelAccessor)
            // .title(titleAccessor)
            // .ordering(ordering)
            .renderLabel(false)
            // .valueAccessor(valueAccessor)
            .legend(dc.legend().itemHeight(10).x(5).y(5).gap(5))
            .on('filtered', function() {
                $scope.resetPage();
                $scope.tableSize = $scope.inventoryTableGroup.all().filter(function(d) { return d.value != 0; }).length;
                $scope.update($scope.inventoryTable,$scope.tableSize,'inventory');
            });

        $scope.inventorySales
            .width(pieWidth - .25 * pieWidth)
            .height(pieWidth - .25 * pieWidth)
            .radius(.25 * pieWidth)
            .innerRadius(.125 * pieWidth)
            .colors(d3.scale.quantize().domain([0, 5]).range(["#44c1e9", "#48cfad", "#fc6e51", "#9fd467", "#ac92ec"]))
            // .colors(d3.scale.quantize().domain([0, 5]).range(["#f0592b", "#fd805a", "#ec9d85", "#f1c3b5", "#ead9d4"]))
            .colorAccessor(function (d, i) {
                return i;
            })
            .dimension($scope.inventorySalesDim)
            .group($scope.inventorySalesGroup)
            // .label(labelAccessor)
            // .title(titleAccessor)
            // .ordering(ordering)
            .renderLabel(false)
            // .valueAccessor(valueAccessor)
            .legend(dc.legend().itemHeight(10).x(5).y(5).gap(5))
            .on('filtered', function() {
                $scope.resetPage();
                $scope.tableSize = $scope.inventoryTableGroup.all().filter(function(d) { return d.value != 0; }).length;
                $scope.update($scope.inventoryTable,$scope.tableSize,'inventory');
            });

        $scope.inventoryTable
            .dimension($scope.inventoryTableDim)
            .group(function (d) {
                return d.skuId;
            })
            .showGroups(false)
            .columns(
                [
                    { label:'SKU System No.',
                        format: function (d) {
                            return '<span onclick="angular.element(this).scope().ViewSkuDataDetails('+ d.skuId +')" title="'+(d.primarySkuUpcEan ? d.primarySkuUpcEan : d.skuClientCode )+'">'+d.skuSystemNo+'</span>';
                        }
                    },
                    // { label:'SKU Image',
                    //     format: function (d) {
                    //         if(d.skuImageUrl){
                    //             return '<img src="'+d.skuImageUrl+'" width="30" height="30">';
                    //         }
                    //         else{
                    //             return 'No image';
                    //         }
                    //
                    //     }
                    // },
                    { label:'D.O.I',
                        format: function (d) { return d.dateOfInventory }
                    },
                    { label:'Shortest Lead Time',
                        format: function (d) { return d.minLeadTime }
                    },
                    { label:'Longest Lead Time',
                        format: function (d) { return d.maxLeadTime }
                    },
                    { label:'Weekly Sales Status',
                        format: function (d) {
                            if(+d.currentWeek > +d.previousWeek){
                                return '<span style="color: lightgreen" class="glyphicon glyphicon-arrow-up"></span> Gain';
                            }
                            else if(+d.currentWeek < +d.previousWeek){
                                return '<span style="color: red" class="glyphicon glyphicon-arrow-down"></span> Loss';
                            }
                            else{
                                return '<span style="color: #dddddd" class="glyphicon glyphicon-resize-horizontal"></span> No Change';
                            }
                        }
                    },
                    { label:'Monthly Sales Status',
                        format: function (d) {
                            if(+d.currentMonth > +d.previousMonth){
                                return '<span style="color: lightgreen" class="glyphicon glyphicon-arrow-up"></span> Gain';
                            }
                            else if(+d.currentMonth < +d.previousMonth){
                                return '<span style="color: red" class="glyphicon glyphicon-arrow-down"></span> Loss';
                            }
                            else{
                                return '<span style="color: #dddddd" class="glyphicon glyphicon-resize-horizontal"></span> No Change';
                            }
                        }
                    },
                    { label:'Quarterly Sales Status',
                        format: function (d) {
                            if(+d.currentQuarter > +d.previousQuarter){
                                return '<span style="color: lightgreen" class="glyphicon glyphicon-arrow-up"></span> Gain';
                            }
                            else if(+d.currentQuarter < +d.previousQuarter){
                                return '<span style="color: red" class="glyphicon glyphicon-arrow-down"></span> Loss';
                            }
                            else{
                                return '<span style="color: #dddddd" class="glyphicon glyphicon-resize-horizontal"></span> No Change';
                            }
                        }
                    }


                ]
            )
            .size(Infinity)
            .sortBy(function (d) { return +d.currentMonth })
            .order(d3.descending);
        $scope.tableSize = $scope.inventoryTableGroup.all().filter(function(d) { return d.value != 0; }).length;
        // $scope.tableSize = $scope.inventoryCf.size();
        $scope.update($scope.inventoryTable,$scope.tableSize,'inventory');


        // $scope.daysOfInventory.render();
        // $scope.inventorySales.render();
        // $scope.inventoryTable.render();
        dc.renderAll();
    }
    
    $scope.display = function(size,item) {
        console.log(size);
        d3.select('#'+item+'Begin')
            .text(ofs + 1);
        d3.select('#'+item+'End')
            .text(ofs+pag <= size ? ofs+pag : size);
        d3.select('#'+item+'Last')
            .attr('disabled', (ofs-pag<0) ? 'true' : null);
        d3.select('#'+item+'Next')
            .attr('disabled', (ofs+pag>=size) ? 'true' : 'false');
        d3.select('#'+item+'Size').text(size);
        console.log(size);
    }
    $scope.update = function(table,size,item) {
        table.beginSlice(ofs);
        table.endSlice(ofs+pag);
        $scope.display(size,item);
    }
    $scope.next = function(table,size,item){
        if(ofs+pag >= size){
            return false;
        }
        ofs += pag;
        $scope.update(table,size,item);
        table.redraw();
    }
    $scope.last = function(table,size,item){
        if(ofs <= 0){
           return false;
        }
        ofs -= pag;
        $scope.update(table,size,item);
        table.redraw();
    }
    $scope.resetChart = function (chart) {
        $scope[chart].filterAll();
        dc.redrawAll();
    }
    $scope.resetPage = function (){
        ofs = 0; pag = 5;
    }

    function ViewSkuDataDetails(d) {
        console.log(d);
    }
    $scope.SkuDataDetailedView = {};
    $scope.ViewSkuDataDetails = function(skuId){

        $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/' + skuId)
            .success(function(response)
            {
                $scope.SkuDataDetailedView = response;

                $scope.selected = [];

                $scope.getSkuImages(skuId);


                if (response.tableSkuIsPoisonous == true) {
                    $scope.selected.push("Poisonous");
                }

                if (response.tableSkuIsStackable == true) {
                    $scope.selected.push("Stackable");
                }

                if (response.tableSkuIsFragile == true) {
                    $scope.selected.push("Fragile");
                }

                if (response.tableSkuIsSaleable == true) {
                    $scope.selected.push("Saleable");
                }

                if (response.tableSkuIsUsnRequired == true) {
                    $scope.selected.push("USN required");
                }

                if (response.tableSkuIsConsumable == true) {
                    $scope.selected.push("Consumable");
                }

                if (response.tableSkuIsHazardous == true) {
                    $scope.selected.push("Hazardous");
                }

                if (response.tableSkuIsHighValue == true) {
                    $scope.selected.push("High value");
                }

                if (response.tableSkuIsQcRequired == true) {
                    $scope.selected.push("QC required");
                }

                if (response.tableSkuIsReturnable == true) {
                    $scope.selected.push("Returnable");
                }

                if (response.tableSkuIsTemperatureControlled == true) {
                    $scope.selected.push("Temperature controlled");
                }

                // $mdDialog.show({
                //     templateUrl: 'SkuDetailedView.tmpl.html',
                //     parent: angular.element(document.body),
                //     clickOutsideToClose: false,
                //     scope: $scope.$new()
                // });
                $('#SkuDetailedView').modal('show');

            }).error(function(error, status)
        {

        });

    };

    $scope.getSkuImages = function(id) {
        var q = $q.defer();

        $scope.skuImgUrl1 = "images/svg/add_image_active.svg"
        $scope.skuImgUrl2 = "images/svg/add_image_active.svg"
        $scope.skuImgUrl3 = "images/svg/add_image_active.svg"
        $scope.skuImgUrl4 = "images/svg/add_image_active.svg"

        $http.get(MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/" + id + "/images").success(function(responseImages) {
            if (responseImages != null) {
                if (responseImages[0] != null) {
                    $scope.skuImgUrl1 = responseImages[0].tableSkuImageUrl;
                    $scope.img1PresentId = responseImages[0].idtableSkuImageImageId;
                }
                if (responseImages[1] != null) {
                    $scope.skuImgUrl2 = responseImages[1].tableSkuImageUrl;
                    $scope.img2PresentId = responseImages[1].idtableSkuImageImageId;
                }
                if (responseImages[2] != null) {
                    $scope.skuImgUrl3 = responseImages[2].tableSkuImageUrl;
                    $scope.img3PresentId = responseImages[2].idtableSkuImageImageId;
                }
                if (responseImages[3] != null) {
                    $scope.skuImgUrl4 = responseImages[3].tableSkuImageUrl;
                    $scope.img4PresentId = responseImages[3].idtableSkuImageImageId;
                }
                q.resolve(true);
            }
        }).error(function(error) {
            q.reject(false);
        });
        return q.promise;
    };
    $scope.cancel = function(form) {
        $('#SkuDetailedView').modal('hide');
    };
}]);
