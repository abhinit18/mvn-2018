angular.module('OMSApp.tally',[]).config(function config($stateProvider) {
    $stateProvider.state('/tallyintegration/', {
        name: '/tallyintegration/',
        url: '/tallyintegration/',
        views: {
            "main": {
                controller: 'tallyCtrl',
                templateUrl: 'tally/tally.view.html'
            },
            "header": {
                controller: 'headerCtrl',
                templateUrl: '../shared/templates/header.html'
            }
        },
        data: {pageTitle: 'tally'}
    })

}).controller('tallyCtrl', ['$rootScope' , '$scope' ,'$http', '$location', '$filter', 'MavenAppConfig', '$mdDialog','$sce', '$window', '$q' ,'$timeout',

function tallyController($rootScope , $scope, $http, $location, $filter, MavenAppConfig, $mdDialog,$sce, $window, $q , $timeout) {

    $scope.tallyToMaven =true;
    $scope.mavenToTally =true;

    //$scope.tallyUrl = $sce.trustAsResourceUrl("http://localhost/tally");

    $scope.tallyUrl = "http://localhost/tally";
    //$scope.tallyUrl ='https://ma1.in/tally';

    $scope.tallyIntegration = {};
    $scope.clientprofile = {};

    $scope.genericData = {};
    $scope.genericData.masterType = null;
    $scope.genericData.markFetched = false;
    
    $scope.markEntityAsFetched = function ()
    {
        if($scope.genericData.markFetched != null && $scope.genericData.markFetched == true)
        {
            var tallyIntegrationUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/tallyintegration/markasfetched?masterType=" + $scope.genericData.masterType;

            $http({
                method: 'PUT',
                url: tallyIntegrationUrl,
                data: "",
                 headers: {
                'Content-Type': 'application/json'
                 }
            }).success(function (data) {
                $scope.getTallyIntegrationData();
                $scope.notify($scope.genericData.masterType + 'marked fetched successfully','success');
                $('#noDataFoundDialog').modal('hide');
            }).error(function(error, status)
            {
                if(status == 400)
                {
                   $scope.notify(error.errorMessage);
                }
                else
                {
                   $scope.notify('Failed to mark ' + $scope.genericData.masterType + ' as fetched');
                }
            })
        }
        else
        {
            $scope.genericData.masterType = null;
            $('#noDataFoundDialog').modal('hide');
        }
    }

    $scope.getClientProfile = function()
    {
        var clientProfileUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/clientprofiles";
        $http.get(clientProfileUrl).success(function(data)
        {
            if (data.length > 0)
            {
                $scope.clientprofile = data[0];
            }
        })
    }

    $scope.getClientProfile();

    $scope.getTallyIntegrationData = function()
    {
        $scope.tallyIntegration = {};
        $scope.tallyIntegration.tableTallyIntegrationLastSkuUpdateFromTally = new Date();
        $scope.tallyIntegration.tableTallyIntegrationLastCustUpdateFromTally = new Date();
        $scope.tallyIntegration.tableTallyIntegrationLastVendorUpdateFromTally = new Date();
        var tallyIntegrationUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/tallyintegration/1";
        $http.get(tallyIntegrationUrl).success(function(data) {
            if (data)
            {
                $scope.tallyIntegration = data;
            }
        }).error(function(error, status)
        {
            if(status == 400){
               $scope.notify(error.errorMessage);
            }
            else{
               $scope.notify("Failed to get tally integration data");
            }
        });

    }
    $scope.getTallyIntegrationData();

    $scope.updateLedgerAddress = function () {

        var tallyIntegrationUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/tallyintegration/updateledgertype?enable=" + $scope.tallyIntegration.tableTallyIntegrationTallyLedgerAddressType;
        $http({
            method: 'PUT',
            url: tallyIntegrationUrl,
            data: '',
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (data) {
            $scope.getTallyIntegrationData();
        })
    }

    $scope.onFetchSkuFromTallyClicked = function ()
    {
        $scope.checkTally().then(function (retval) {
            if (retval == true)
            {
                //Get skus from Tally
                var tallyURL = $scope.tallyUrl;
                var postdata = '<?xml version="1.0" encoding="UTF-8"?> <ENVELOPE> <HEADER> <TALLYREQUEST>Export Data</TALLYREQUEST> </HEADER> <BODY> <EXPORTDATA> <REQUESTDESC> <REPORTNAME>ODBC Report</REPORTNAME> <SQLREQUEST Type="General" Method="SQLExecute">Select $Guid,$Name,$Description,$Parent,$Category,$HasMfgDate,$IsBatchWiseOn,$IsCostTrackingOn,$ActiveFrom,$ActiveTo,$AllowUseofExpiredItems,$Alterid from StockItem</SQLREQUEST> <STATICVARIABLES> <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT> <SVCURRENTCOMPANY>' + $scope.clientprofile.tableClientProfileCompanyName + '</SVCURRENTCOMPANY> </STATICVARIABLES> </REQUESTDESC> <REQUESTDATA /> </EXPORTDATA> </BODY> </ENVELOPE>';
                $http
                (
                    {
                        method: 'POST',
                        url: tallyURL,
                        data: postdata,
                        headers: {
                            'Content-Type': 'text/xml; charset=utf-8'
                        }
                    }
                ).success(function(res)
                {
                    var tallyIntegrationUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/tallyintegration/pullSkusFromTally";
                    $http({
                        method: 'POST',
                        url: tallyIntegrationUrl,
                        data: res,
                        headers: {
                            'Content-Type': 'application/xml'
                        }
                    }).success(function(data)
                    {
                        $scope.getTallyIntegrationData();
                        $scope.notify("SKUs fetched successfully",'success');
                        console.log(data);
                    }).error(function(error, status)
                    {
                        if(status == 400)
                        {
                            $scope.genericData.masterType = 'Sku';
                            $('#noDataFoundDialog').modal('show');
                        }
                        else
                        {
                           $scope.notify("Failed to get tally integration data");
                        }
                    });
                })

            }
        })

    }

    $scope.onFetchCustomerFromTallyClicked = function ()
    {
        $scope.checkTally().then(function (retval)
        {
            if (retval == true)
            {
                //Get customers from Tally

                var tallyURL = $scope.tallyUrl;
                var postdata = '<ENVELOPE> <HEADER> <VERSION>1</VERSION> <TALLYREQUEST>Export</TALLYREQUEST> <TYPE>Collection</TYPE> <ID>All Items under Ledger</ID> </HEADER> <BODY> <DESC> <STATICVARIABLES> <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT> <SVCURRENTCOMPANY>' + $scope.clientprofile.tableClientProfileCompanyName + '</SVCURRENTCOMPANY> </STATICVARIABLES> <TDL> <TDLMESSAGE> <COLLECTION NAME="All Items under Ledger" ISMODIFY="No"> <TYPE>LEDGER</TYPE> <FETCH>GUID</FETCH> <FETCH>MAILINGNAME</FETCH> <FETCH>PARENT</FETCH> <FETCH>LEDGERMOBILE</FETCH> <FETCH>LEDGERPHONE</FETCH> <FETCH>LEDGERCONTACT</FETCH> <FETCH>EMAIL</FETCH> <FETCH>GSTTYPE</FETCH> <FETCH>GSTREGISTRATIONTYPE</FETCH> <FETCH>PARTYGSTIN</FETCH> <FETCH>ADDRESS.LIST</FETCH> <FETCH>LEDSTATENAME</FETCH> <FETCH>PINCODE</FETCH> <FETCH>COUNTRYNAME</FETCH> <FETCH>LEDMULTIADDRESSLIST.LIST</FETCH> </COLLECTION> </TDLMESSAGE> </TDL> </DESC> </BODY> </ENVELOPE>';
                $http
                (
                    {
                        method: 'POST',
                        url: tallyURL,
                        data: postdata,
                        headers: {
                            'Content-Type': 'text/xml; charset=utf-8'
                        }
                    }
                ).success(function(res)
                {
                    var tallyIntegrationUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/tallyintegration/pullCustomersFromTally";
                    $http({
                        method: 'POST',
                        url: tallyIntegrationUrl,
                        data: res,
                        headers: {
                            'Content-Type': 'application/xml'
                        }
                    }).success(function(data)
                    {
                        $scope.getTallyIntegrationData();
                        $scope.notify("Customers fetched successfully",'success');
                        console.log(data);
                    }).error(function(error, status)
                    {
                        if(status == 400)
                        {
                            $scope.genericData.masterType = 'Customer';
                            $('#noDataFoundDialog').modal('show');
                        }
                        else
                        {
                           $scope.notify("Failed to get tally integration data");
                        }
                    });
                })
            }
        })
    }

    $scope.onFetchVendorFromTallyClicked = function ()
    {
        $scope.checkTally().then(function (retval) {
            if (retval == true) {
                //Get vendors from Tally

                var tallyURL = $scope.tallyUrl;
                var postdata = '<ENVELOPE> <HEADER> <VERSION>1</VERSION> <TALLYREQUEST>Export</TALLYREQUEST> <TYPE>Collection</TYPE> <ID>All Items under Ledger</ID> </HEADER> <BODY> <DESC> <STATICVARIABLES> <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT> <SVCURRENTCOMPANY>' + $scope.clientprofile.tableClientProfileCompanyName + '</SVCURRENTCOMPANY> </STATICVARIABLES> <TDL> <TDLMESSAGE> <COLLECTION NAME="All Items under Ledger" ISMODIFY="No"> <TYPE>LEDGER</TYPE> <FETCH>GUID</FETCH> <FETCH>MAILINGNAME</FETCH> <FETCH>PARENT</FETCH> <FETCH>LEDGERMOBILE</FETCH> <FETCH>LEDGERPHONE</FETCH> <FETCH>LEDGERCONTACT</FETCH> <FETCH>EMAIL</FETCH> <FETCH>GSTTYPE</FETCH> <FETCH>GSTREGISTRATIONTYPE</FETCH> <FETCH>PARTYGSTIN</FETCH> <FETCH>ADDRESS.LIST</FETCH> <FETCH>LEDSTATENAME</FETCH> <FETCH>PINCODE</FETCH> <FETCH>COUNTRYNAME</FETCH> <FETCH>LEDMULTIADDRESSLIST.LIST</FETCH> </COLLECTION> </TDLMESSAGE> </TDL> </DESC> </BODY> </ENVELOPE>';

                $http
                (
                    {
                        method: 'POST',
                        url: tallyURL,
                        data: postdata,
                        headers: {
                            'Content-Type': 'text/xml; charset=utf-8'
                        }
                    }
                ).success(function (res) {
                    var tallyIntegrationUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/tallyintegration/pullVendorsFromTally";
                    $http({
                        method: 'POST',
                        url: tallyIntegrationUrl,
                        data: res,
                        headers: {
                            'Content-Type': 'application/xml'
                        }
                    }).success(function (data) {
                        $scope.getTallyIntegrationData();
                        $scope.notify("Vendors fetched successfully",'success');
                        console.log(data);
                    }).error(function (error, status) {
                        if (status == 400)
                        {
                            $scope.genericData.masterType = 'Vendor';
                            $('#noDataFoundDialog').modal('show');
                        }
                        else
                        {
                           $scope.notify("Failed to get tally integration data");
                        }
                    });
                })
            }
        })
    }

    //Start of function
    $scope.sendDataToTally = function(masterType) {


        if ($scope.counter < $scope.dataFromMavenToTally.length) {
            $scope.slept = 0;
            $scope.counterincremeted = false;

            //Call tally url in loop and for each record call the following url to update GSC Maven about state of each request with batch id
            //After push to tally operation complete
            $scope.sendRecordToTally($scope.dataFromMavenToTally[$scope.counter]).then(function (value) {
                $scope.counter++;
                $scope.counterincremeted = true;

                if (value != null) {
                    var tallyIntegrationUpdateURL = MavenAppConfig.baseUrlSource + "/omsservices/webapi/tallyintegration/exportTallyMasterPushStatus?masterType=" + masterType;

                    var tallyPushRequestWrapper = {};
                    tallyPushRequestWrapper.tableUpdateMasterId = $scope.dataFromMavenToTally[$scope.counter-1].idtableTallyIntegrationUpdateMasterId;
                    tallyPushRequestWrapper.tallyRequestXml = $scope.dataFromMavenToTally[$scope.counter-1].tableTallyIntegrationUpdateMasterData;
                    tallyPushRequestWrapper.tallyResponseXml = value;
                    $http({
                        method: 'PUT',
                        url: tallyIntegrationUpdateURL,
                        data: tallyPushRequestWrapper,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).success(function (data) {
                        $scope.getTallyIntegrationData();
                    })
                }
            })
        }
    }
    $scope.waitForTallyToRespond = function () {

        $timeout(function ()
        {
            if($scope.counterincremeted == false)
            {
                //if tally has not responded yet then check if slept for enough time (15s) else sleep for 500ms
                if($scope.slept > 500 * 30)
                {
                    //slept enough let's breakout
                   $scope.notify("Tally not responded for 15 seconds");
                }
                else
                {
                    $scope.slept += 500;
                    $scope.waitForTallyToRespond();
                }
            }
            else
            {
                if($scope.counter < $scope.dataFromMavenToTally.length)
                {
                    $scope.sendDataToTally();
                    $scope.waitForTallyToRespond();
                }
                else
                {
                    $scope.notify("Synchronization complete",'success');
                }
            }

        },500)
    }

    $scope.onSyncToTallyClicked = function (masterType)
    {
        $scope.checkTally().then(function (retval)
        {
            if (retval == true)
            {
                var tallyIntegrationUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/tallyintegration/pushMastersToTally?masterType=" + masterType;
                //Get the data and store the batch id locally

                $http.get(tallyIntegrationUrl).success(function (data)
                {
                    $scope.dataFromMavenToTally = data;
                    $scope.counter = 0;
                    $scope.sendDataToTally(masterType);
                    $scope.waitForTallyToRespond();
                }).error(function (error, status) {

                    if (status == 400) {
                       $scope.notify(error.errorMessage);
                    }
                    else {
                       $scope.notify("Failed to get data from Maven");
                    }
                });
            }
        })
    }

    $scope.sendRecordToTally = function (tallyrecord)
    {
        var q = $q.defer();
        var tallyURL = $scope.tallyUrl;
        var postdata = tallyrecord.tableTallyIntegrationUpdateMasterData;
        $http
        (
            {
                method: 'POST',
                url: tallyURL,
                data: postdata,
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8'
                }
            }
        ).success(function(res)
        {
            if(res)
            {
                q.resolve(res);
            }
        }).error(function(err)
        {
            q.resolve(null);
        })

        return q.promise;

    }

    $scope.checkTally = function ()
    {

        var q = $q.defer();
        $scope.checkTallyRunning().then(function (tallyRunningResp)
        {
            if(tallyRunningResp != null)
            {
                $scope.checkTallyServerRunning().then(function(tallyServerRunningResp)
                {
                    if(tallyServerRunningResp==true)
                    {
                        $scope.checkCompanyOpen().then(function (companyOpenResp) {
                            if (companyOpenResp != null) {
                                //parse companyOpenResp

                                var companyOpen = false;
                                if (companyOpenResp.indexOf('LINEERROR') != -1)
                                {
                                    if (companyOpenResp.indexOf('Could not set') != -1 && companyOpenResp.indexOf('SVCurrentCompany') != -1)
                                    {
                                        companyOpen = false;
                                    }
                                }
                                else if (companyOpenResp.indexOf('EXPORTDATARESPONSE') != -1)
                                {
                                    companyOpen = true;
                                }
                                if (companyOpen == true) {
                                    $scope.checkMultipleCompanyOpen().then(function (multiplecompanyopen) {
                                        if (multiplecompanyopen != null) {
                                            //parse multiple company open resp
                                            var multipleCompanyOpen = false;
                                            var companyCount=multiplecompanyopen.match(/COMPANYNAME/gi).length;
                                            console.log(companyCount);

                                            if(companyCount>4)
                                            {
                                                multipleCompanyOpen=true;
                                            }
                                            else
                                            {
                                                multipleCompanyOpen=false;
                                            }
                                            if (multipleCompanyOpen == true)
                                            {
                                               $scope.notify("Multiple companies are open. Maven recommends to close the other companies.");
                                                q.resolve(false);
                                            }
                                            else
                                            {
                                                q.resolve(true);
                                            }
                                        }
                                        else {
                                           $scope.notify("Maven Tally or Tally.ERP9 does not seem to be running");
                                            q.resolve(false);
                                        }
                                    })
                                }
                                else {
                                   $scope.notify("Current company is not open in tally");
                                    q.resolve(false);
                                }
                            }
                            else {
                               $scope.notify("Maven Tally or Tally.ERP9 does not seem to be running");
                                q.resolve(false);
                            }
                        })
                    }
                    else
                    {
                       $scope.notify("Maven Tally or Tally.ERP9 does not seem to be running");
                        q.resolve(false);
                    }
                })
            }
            else
            {
               $scope.notify("Maven Tally or Tally.ERP9 does not seem to be running");
                q.resolve(false);
            }

        })
        return q.promise;
    }

    $scope.checkTallyServerRunning=function(){
        var q = $q.defer();
        var tallyURL = $scope.tallyUrl;
        $http
        (
            {
                method: 'POST',
                url: tallyURL,
                data: "",
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8'
                }
            }
        ).success(function(res)
        {
            if(res.indexOf('RESPONSE')>=0){
                if(res.indexOf('Tally.ERP 9')>=0){
                    q.resolve(true);
                }
            }

        }).error(function(err)
        {
            q.resolve(false);
        })
        return q.promise;
    }

    $scope.checkTallyRunning = function () {

        var q = $q.defer();
        var tallyURL = $scope.tallyUrl;
        $http
        (
            {
                method: 'POST',
                url: tallyURL,
                data: "",
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8'
                }
            }
        ).success(function(res)
        {
            if(res)
            {
                q.resolve(res);
            }
        }).error(function(err)
        {
            q.resolve(null);
        })
        return q.promise;
    }

    $scope.checkCompanyOpen = function () {

        var q = $q.defer();
        var tallyURL = $scope.tallyUrl;
        var postdata = '<?xml version="1.0" encoding="UTF-8"?> <ENVELOPE> <HEADER> <TALLYREQUEST>Export Data</TALLYREQUEST> </HEADER> <BODY> <EXPORTDATA> <REQUESTDESC> <REPORTNAME>ODBC Report</REPORTNAME> <STATICVARIABLES> <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT> <SVCURRENTCOMPANY>' + $scope.clientprofile.tableClientProfileCompanyName + '</SVCURRENTCOMPANY> </STATICVARIABLES> </REQUESTDESC> <REQUESTDATA /> </EXPORTDATA> </BODY> </ENVELOPE>';
        $http
        (
            {
                method: 'POST',
                url: tallyURL,
                data: postdata,
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8'
                }
            }
        ).success(function(res)
        {
            if(res)
            {
                q.resolve(res);
            }
        }).error(function(err)
        {
            q.resolve(null);
        })

        return q.promise;

    }

    $scope.checkMultipleCompanyOpen = function ()
    {
        var q = $q.defer();
        var tallyURL = $scope.tallyUrl;
        var postData = '<ENVELOPE><HEADER><TALLYREQUEST>Export Data</TALLYREQUEST> </HEADER> <BODY> <EXPORTDATA> <REQUESTDESC> <REPORTNAME>List of Companies</REPORTNAME> <STATICVARIABLES> <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT> </STATICVARIABLES> </REQUESTDESC> </EXPORTDATA> </BODY> </ENVELOPE>';
        $http
        (
            {
                method: 'POST',
                url: tallyURL,
                data: postData,
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8'
                }
            }
        ).success(function(res)
        {
            if(res)
            {
                q.resolve(res);
            }
        }).error(function(err)
        {
            q.resolve(null);
        })

        return q.promise;
    }

    /*$scope.onFetchSkuFromMavenClicked = function () {

     }*/

    /*$scope.onFetchCustFromMavenClicked = function () {

     }*/

    /*$scope.onFetchVendorFromMavenClicked = function () {

    }*/
}]);
