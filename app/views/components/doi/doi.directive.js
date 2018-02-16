'use strict';

let angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('doi', doiDirective);

/** @ngInject */
function doiDirective() {
    let directive = {
        restrict: 'E',
        template: '<a ng-href="https://doi.org/{{ vm.asDoi(vm.link) }}" class="doi"><span>DOI</span><span>{{ vm.asDoi(vm.link) }}</span></a>',
        scope: {
        },
        controller: doiCtrl,
        controllerAs: 'vm',
        bindToController: {
            link: '@',
        },
    };
    return directive;

    /** @ngInject */
    function doiCtrl() {
        let vm = this;
        vm.asDoi = function() {
            return vm.link.replace(/^.*(10\.)/, '10.');
        };
    }
}

module.exports = doiDirective;

