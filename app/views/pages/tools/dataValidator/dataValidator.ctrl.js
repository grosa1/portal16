'use strict';
var _ = require('lodash'),
moment = require('moment'),
    fixedUtil = require('../../dataset/key/main/submenu');

require('../../../components/fileUpload/fileUpload.directive');


//only available on dev for now
var devApiUrl = '//api.gbif-dev.org/v1/';

angular
    .module('portal')
    .controller('dataValidatorCtrl', dataValidatorCtrl);

/** @ngInject */
function dataValidatorCtrl($http,  $state,  $sessionStorage) {
    var vm = this;
    vm.$state = $state;

    vm.resourceToValidate = {};



    vm.handleUploadFile = function(params) {
        var formData = new FormData();
        formData.append('file', params.files[0]);
        vm.jobStatus = "SUBMITTED";
        $http({
            url: devApiUrl + 'validator/jobserver/submit',
            method: "POST",
            data: formData,
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).success(function (data, status) {
            handleValidationSubmitResponse(data, status);
        }).error(function (data, status) {
            handleWSError(data, status);
        });
    };

    vm.handleFileUrl = function(params) {

        vm.jobStatus = "FETCHING";
        var url = devApiUrl + 'validator/jobserver/submiturl';
        $http({url: url, params: params, method : "POST"})
            .success(function (data, status) {
                handleValidationSubmitResponse(data, status);
            })
            .error(function (data, status, headers) {
                handleWSError(data, status);
            });
    };

    vm.getValidationResults = function(jobid) {

        $http.get(
            devApiUrl + 'validator/jobserver/status/' + jobid, {params: {nonse: Math.random()}}

        ).success(function (data) {
            vm.startTimestamp = moment(data.startTimestamp).subtract(moment().utcOffset(), 'minutes').fromNow();
            vm.generatedDate = moment(data.startTimestamp);
            handleValidationSubmitResponse(data);
        }).error(function (err, status, headers) { //data, status, headers, config

            if((err && err.statusCode === 404 )|| status === 404){
                handleValidationSubmitResponse(err)
            } else{

                handleWSError(err, status)

            }
        });
    };

if($sessionStorage.gbifRunningValidatonJob){

        $state.go('dataValidatorKey', {jobid: $sessionStorage.gbifRunningValidatonJob})
    }


    function handleValidationSubmitResponse(data) {

        vm.jobStatus = data.status;

        if((data.status !== "FAILED" ) && data.jobId){


            vm.jobId = data.jobId;

            $state.go("dataValidatorKey", {jobid: vm.jobId});

        } else if(data.status === "FAILED"){
            delete $sessionStorage.gbifRunningValidatonJob;
            handleFailedJob(data);
        }
    }




    vm.handleDrop = function (e) {
        vm.handleUploadFile(e.dataTransfer);
    };

    function handleWSError(data, status) {

        vm.hasError = true;
        switch(status) {
            case 413:
                vm.hasApi413Error = true;
                break;
            case 404:
                vm.hasApi404Error = true;
                break;
            case 400:
                vm.hasApi400Error = true;
                break;
            default:
                vm.hasApiCriticalError = true;
        }
        //vm.hasApiCriticalError = true;
      //  alert("error")
    }

    function handleFailedJob(data){
        vm.jobStatus = data.status;
    }


    vm.attachTabListener = function () {
        fixedUtil.updateTabs();
    };

    vm.attachMenuListener = function () {
        fixedUtil.updateMenu();
    };
}

module.exports = dataValidatorCtrl;
