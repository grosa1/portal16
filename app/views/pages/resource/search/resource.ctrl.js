'use strict';
var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('resourceCtrl', resourceCtrl);

/** @ngInject */
function resourceCtrl($state, ResourceFilter, $rootScope, Species, Dataset, Network, Publisher, suggestEndpoints, Page, enums, NAV_EVENTS, BUILD_VERSION, $translate) {
    var vm = this;
    vm.state = ResourceFilter.getState();
    $translate('resourceSearch.title').then(function(title) {
        Page.setTitle(title);
    });
    Page.drawer(true);
    vm.filters = {};

    vm.hasFilters = function() {
      var hasContentType = vm.state.query.contentType;
      var hasFilters = Object.keys(vm.state.query)
        .filter(function(key) {
          return key !== 'locale' && key !== 'contentType' && typeof vm.state.query[key] !== 'undefined';
        }).length > 0;
        return {
          hasContentType: hasContentType, hasFilters: hasFilters
        };
    };

    vm.filters.countriesOfCoverage = {
        titleTranslation: 'resourceSearch.filters.countriesOfCoverage',
        queryKey: 'countriesOfCoverage',
        filter: ResourceFilter,
        enumTranslationPath: 'country.',
        search: {
            isSearchable: true,
            suggestEndpoint: '/api/country/suggest.json?lang=' + vm.state.query.locale
        },
        facets: {
            hasFacets: true,
            facetKey: 'COUNTRIES_OF_COVERAGE'
        }
    };

    vm.filters.countriesOfResearcher = {
        titleTranslation: 'resourceSearch.filters.countriesOfResearcher',
        queryKey: 'countriesOfResearcher',
        filter: ResourceFilter,
        enumTranslationPath: 'country.',
        search: {
            isSearchable: true,
            suggestEndpoint: '/api/country/suggest.json?lang=' + vm.state.query.locale
        },
        facets: {
            hasFacets: true,
            facetKey: 'COUNTRIES_OF_RESEARCHER'
        }
    };

    vm.filters.contractCountry = {
        titleTranslation: 'resourceSearch.filters.contractCountry',
        queryKey: 'contractCountry',
        filter: ResourceFilter,
        enumTranslationPath: 'country.',
        search: {
            isSearchable: true,
            suggestEndpoint: '/api/country/suggest.json?lang=' + vm.state.query.locale
        },
        facets: {
            hasFacets: true,
            facetKey: 'COUNTRY_COVERAGE'
        }
    };

    vm.filters.contentType = {
        queryKey: 'contentType',
        facetKey: 'CONTENT_TYPE',
        title: 'contentType',
        translationPrefix: 'enums.cms.vocabularyTypes',
        filter: ResourceFilter
    };

    vm.filters.year = {
        titleTranslation: 'resourceSearch.filters.year',
        intervalTranslation: 'intervals.year.',
        queryKey: 'year',
        filter: ResourceFilter,
        singleSelect: true,
        range: {
            'min': [2000, 1],
            'max': [new Date().getFullYear()]
        }
    };


    var facetedEnumFilters = ['purposes', 'topics', 'literatureType', 'relevance', 'audiences'];
    facetedEnumFilters.forEach(function(e) {
        vm.filters[e] = {
            titleTranslation: 'resourceSearch.filters.' + e,
            queryKey: e,
            filter: ResourceFilter,
            enumTranslationPath: 'enums.cms.vocabularyTerms.' + e + '.',
            showAll: true,
            enums: enums.cms[e],
            reversible: true,
            multiSelect: true,
            facets: {
                hasFacets: true,
                facetKey: _.toUpper(_.snakeCase(e))
            }
        };
    });

    vm.filters.dataset = {
        titleTranslation: 'resourceSearch.filters.gbifDatasetKey',
        queryKey: 'gbifDatasetKey',
        filter: ResourceFilter,
        expand: {
            resource: Dataset,
            expandedTitle: 'title'
        },
        facets: {
            hasFacets: false
        },
        search: {
            isSearchable: true,
            suggestEndpoint: suggestEndpoints.dataset,
            suggestTemplate: '/templates/components/filterTaxon/suggestBasicTemplate.html?v=' + BUILD_VERSION,
            suggestTitle: 'title',
            suggestShortName: 'title',
            suggestKey: 'key'
        }
    };

    vm.filters.taxonKey = {
      titleTranslation: 'resourceSearch.filters.gbifTaxonKey',
      helpText: 'resourceSearch.helpText.gbifTaxonKey',
      queryKey: 'gbifTaxonKey',
      filter: ResourceFilter,
      expand: {
        resource: Species,
        expandedTitle: 'scientificName'
      },
      facets: {
        hasFacets: false,
        facetKey: 'TAXON_KEY'
      },
      search: {
        isSearchable: true,
        suggestEndpoint: suggestEndpoints.taxon,
        defaultParams: {
          datasetKey: 'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c'
        },
        suggestTemplate: '/templates/components/filterTaxon/suggestTaxonTemplate.html?v=' + BUILD_VERSION,
        suggestTitle: function(data) {
          return {
            scientificName: _.get(data, 'scientificName'),
            key: _.get(data, 'key'),
            accepted: _.get(data, 'accepted'),
            acceptedKey: _.get(data, 'acceptedKey'),
            synonym: _.get(data, 'synonym')
          };
        }, // 'scientificName',
        suggestTitleTemplate: '/templates/components/filterTaxon/suggestTaxonTitleTemplate.html?v=' + BUILD_VERSION,
        suggestShortName: 'title',
        suggestKey: 'key'
      }
    };

    vm.filters.litSource = {
        titleTranslation: 'resourceSearch.filters.litSource',
        queryKey: 'source',
        filter: ResourceFilter,
        facets: {
            hasFacets: true,
            facetKey: 'SOURCE'
        },
        search: {
            isSearchable: true
        }
    };

    vm.filters.litPublisher = {
        titleTranslation: 'resourceSearch.filters.litPublisher',
        queryKey: 'publisher',
        filter: ResourceFilter,
        facets: {
            hasFacets: true,
            facetKey: 'PUBLISHER'
        },
        search: {
            isSearchable: true
        }
    };

    vm.filters.publisher = {
        titleTranslation: 'resourceSearch.filters.publishingOrganizationKey',
        queryKey: 'publishingOrganizationKey',
        filter: ResourceFilter,
        expand: {
            resource: Publisher,
            expandedTitle: 'title'
        },
        facets: {
            hasFacets: false
        },
        search: {
            isSearchable: true,
            suggestEndpoint: suggestEndpoints.publisher,
            suggestTemplate: '/templates/components/filterTaxon/suggestBasicTemplate.html?v=' + BUILD_VERSION,
            suggestTitle: 'title',
            suggestShortName: 'title',
            suggestKey: 'key'
        }
    };

    vm.filters.network = {
        titleTranslation: 'resourceSearch.filters.networkKey',
        queryKey: 'gbifNetworkKey',
        filter: ResourceFilter,
        expand: {
            resource: Network,
            expandedTitle: 'title'
        },
        facets: {
            hasFacets: false
        },
        search: {
            isSearchable: true,
            suggestEndpoint: suggestEndpoints.networkKey,
            suggestTemplate: '/templates/components/filterTaxon/suggestBasicTemplate.html?v=' + BUILD_VERSION,
            suggestTitle: 'title',
            suggestShortName: 'title',
            suggestKey: 'key'
        }
    };

    vm.filters.projectId = {
        titleTranslation: 'filterNames.projectId',
        queryKey: 'gbifProjectIdentifier',
        filter: ResourceFilter,
        facets: {
            hasFacets: false,
            facetKey: 'GBIF_PROJECT_IDENTIFIER'
        },
        search: {
            isSearchable: true
        }
    };

    vm.filters.gbifProgramme = {
        titleTranslation: 'filterNames.programme',
        queryKey: 'gbifProgrammeAcronym',
        filter: ResourceFilter,
        facets: {
            hasFacets: false,
            facetKey: 'GBIF_PROGRAMME_ACRONYM'
        },
        search: {
            isSearchable: true
        }
    };

    vm.filters.gbifDownloadKey = {
        titleTranslation: 'resourceSearch.filters.gbifDownloadKey',
        queryKey: 'gbifDownloadKey',
        filter: ResourceFilter,
        search: {
            isSearchable: true,
            placeholder: 'filters.searchPlaceholder'
        },
        facets: {
            hasFacets: false,
            facetKey: 'GBIF_DOWNLOAD_KEY'
        }
    };

    vm.filters.doi = {
      titleTranslation: 'resourceSearch.filters.paperDoi',
      queryKey: 'doi',
      filter: ResourceFilter,
      search: {
          isSearchable: true,
          placeholder: 'filters.searchPlaceholder'
      },
      facets: {
          hasFacets: false,
          facetKey: 'GBIF_DOWNLOAD_KEY'
      }
    };

    vm.filters.gbifDerivedDatasetDoi = {
      titleTranslation: 'resourceSearch.filters.gbifDerivedDatasetDoi',
      queryKey: 'gbifDerivedDatasetDoi',
      filter: ResourceFilter,
      search: {
          isSearchable: true,
          placeholder: 'filters.searchPlaceholder'
      },
      facets: {
          hasFacets: false,
          facetKey: 'GBIF_DOWNLOAD_KEY'
      }
    };

    vm.filters.peerReview = {
        titleTranslation: 'resourceSearch.filters.peerReview',
        queryKey: 'peerReview',
        filter: ResourceFilter
    };

    vm.filters.openAccess = {
        titleTranslation: 'resourceSearch.filters.openAccess',
        queryKey: 'openAccess',
        filter: ResourceFilter
    };

    vm.openHelpdesk = function() {
        $rootScope.$broadcast(NAV_EVENTS.toggleSearch, {state: false});
        $rootScope.$broadcast(NAV_EVENTS.toggleFeedback, {toggle: true, type: 'QUESTION'});
        $rootScope.$broadcast(NAV_EVENTS.toggleNotifications, {toggle: false});
    };

    vm.search = function() {
        $state.go('.', vm.state.query, {inherit: false, notify: true, reload: true});
    };

    vm.hasData = function() {
        return typeof vm.state.data.count !== 'undefined';
    };

    vm.isTabShown = function(contentType) {
        if (vm.state.query.contentType == contentType) {
            return true;
        }
        if (_.get(vm, 'state.facetMultiselect.facets.CONTENT_TYPE.counts.' + contentType + '.count', 0) > 0) {
            return true;
        }
        return false;
    };
}

module.exports = resourceCtrl;
