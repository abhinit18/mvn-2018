angular.module('OMSApp.mastersService', [])
    .factory('mastersService', ['httpService','MavenAppConfig', '$q' , function (httpService,MavenAppConfig, $q) {
        var mastersService = {};
        var sku = {};
        var customers = [];
        var baseUrl = MavenAppConfig.baseUrlSource;
        mastersService.fetchSkus = function (baseUrl,callback) {

            var q = $q.defer();

            httpService.getRequest(baseUrl + '/omsservices/webapi/masters/skus?onlySku=false&start=0&size=10', function (responseData) {

                sku = responseData;
                callback(sku);
            })


        }

        mastersService.fetchSkusNext = function (baseUrl, start, size, callback) {

            var q = $q.defer();

            httpService.getRequest(baseUrl + '/omsservices/webapi/masters/skus?onlySku=false&start=' + start + '&size=' + size, function (data) {

                sku = data;
                callback(sku);
            });

        }

        mastersService.fetchCustomersNext = function (baseUrl, start, size, callback) {

            var q = $q.defer();

            httpService.getRequest(baseUrl + '/omsservices/webapi/masters/customers?start=' + start + '&size=' + size, function (data) {

                customers = data;
                callback(customers);
            });

        }

        var vendorSku;
        mastersService.fetchVendorSkus = function (baseUrl, vendorid, callback) {
            //var q = $q.defer();
            httpService.getRequest(baseUrl + "/omsservices/webapi/vendors/" + vendorid + "/skumap/skus?start=0&size=10", function (data) {

                vendorSku = data;
                callback(data);
            });
        }

        mastersService.fetchVendorSkusNext = function (baseUrl, vendorid, start, size, callback) {
            //  var q = $q.defer();
            httpService.getRequest(baseUrl + "/omsservices/webapi/vendors/" + vendorid + "/skumap/skus?start=" + start + "&size=" + size, function (data) {

                vendorSku = data;
                callback(vendorSku);
            });
        }


        mastersService.fetchOnlySkus = function (baseUrl, callback) {
            // var q = $q.defer();
            httpService.getRequest(baseUrl + '/omsservices/webapi/masters/skus?onlySku=true&start=0&size=10', function (data) {
                sku = data;

                callback(sku);

            });
        }

        mastersService.fetchOnlySkusNext = function (baseUrl, start, size, callback) {
            //   var q = $q.defer();
            httpService.getRequest(baseUrl + '/omsservices/webapi/masters/skus?onlySku=true&start=' + start + '&size=' + size, function (data) {

                sku = data;

                callback(sku);
            });
        }

        var vendor = '';
        mastersService.fetchVendors = function (baseUrl, callback) {

            //  var q = $q.defer();

            httpService.getRequest(baseUrl + '/omsservices/webapi/masters/vendors?size=-1', function (data) {
                vendor = data;
                callback(vendor);

            });
        }
        var customers='';
        mastersService.fetchCustomers = function (baseUrl, callback) {

            // var q = $q.defer();

            httpService.getRequest(baseUrl + '/omsservices/webapi/masters/customers',function (data) {

                customers=data;
                callback(data);
            });
        }

        return mastersService;
    }]);


