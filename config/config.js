/**
 * Project Name Maven
 * Created by Prakhar Srivastava on 21-11-2017.
 */

angular.module('MavenApp.config', [])
    .constant('MavenAppConfig', {
        'APP_NAME': 'Maven',
        'baseUrlSource': 'https://devbackend.gscmaven.com:8442/api/oms',
        's3': 'https://s3-us-west-2.amazonaws.com/glmetadata/',
        'apigatewayoms': 'https://devbackend.gscmaven.com:8442/api/oms',
        'apigatewayauth': 'https://devbackend.gscmaven.com:8442/api/auth',
        'downloadCustomersTemplateUrl': 'templates/Glaucus_Customer_Bulk_Upload_Template.xls',
        'downloadSkuSalesChannelMapTemplateUrl':'/omsservices/webapi/saleschannels/skusaleschannelmapuploadtemplate',
        'downloadSkuTemplateUrl': 'templates/Glaucus_SKU_Bulk_Upload_Template.xls',
        'downloadVendorsTemplateUrl': 'templates/Glaucus_Vendor_Bulk_Upload_Template.xls',
        'commonPathUrl': '/omsservices/webapi/common/file?path=',
        'downloadOrderTemplateUrl': '/omsservices/webapi/orders/bulkuploadtemplate',
        'downloadPOTemplateUrl': 'templates/Glaucus_PO_Bulk_Upload_Template.xls',
        'downloadSTOTemplateUrl': '/omsservices/webapi/stock/transfer/gettemplateforstocktransfer',
        'downloadMastersTemplateUrl': 'templates/Glaucus_Masters_SKU_Customer_Vendor_Bulk_Upload_Template.xls',
        'downloadBulkCancelTemplateUrl': 'templates/Glaucus_Sale_Order_Bulk_Cancel_Template.xls',
        'filePathUrl': '/omsservices/webapi/saleschannels/file?path=',
        'formsUrl': 'forms/',
        'downloadAWBTemplateUrl': 'templates/Glaucus_Awb_Bulk_Upload_Template.xls',
        'downloadRatesTemplateUrl':'templates/Glaucus_Rate_Matrix_Upload_Template.xls'
    });
