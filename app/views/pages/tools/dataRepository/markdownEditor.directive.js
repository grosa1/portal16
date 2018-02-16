'use strict';
let angular = require('angular'),
    SimpleMDE = require('simplemde'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('markdownEditor', function() {
        return {
            restrict: 'A',
            scope: {
                onMdeChange: '=',
            },
            link: function(scope, element, attrs) {
                let simplemde = new SimpleMDE({element: element[0]});
                simplemde.codemirror.on('change', function() {
                    scope.$apply(function(scope) {
                        scope.onMdeChange(simplemde.value());
                    });
                });
            },
        };
    });
