'use strict';

let express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    facetHelper = require('./expandFacets'),
    taxonHelper = require('./occurrenceTaxonHelper'),
    request = rootRequire('app/helpers/request'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    querystring = require('querystring'),
    log = require('../../../../config/log');

module.exports = function(app) {
    app.use('/api/chart/occurrence', router);
};

router.get('/basic', function(req, res) {
    getChartData(req.query)
        .then(function(chartData) {
            res.json(chartData);
        })
        .catch(function(err) {
            log.error(err);
            res.sendStatus(500);
        });
});

router.get('/frequentTaxa', function(req, res) {
    taxonHelper.getMostFrequentTaxa(req.query, req.query.percentage, req.query.limit)
        .then(function(chartData) {
            res.json(chartData);
        })
        .catch(function(err) {
            log.error(err);
            res.sendStatus(500);
        });
});

async function getChartData(query) {
    let chartDimension = query.chartDimension;
    // let chartSecondaryDimension = query.chartSecondaryDimension;
    // let secondDimension;
    // let secondSeries;
    // let chartType = query.chartType;
    delete query.dimension;
    query = _.assign({facetLimit: 1000}, query, {limit: 0, facet: chartDimension});
    let result = await getData(query);
    if (result.facets.length == 0) {
        throw 'No facets from the API';
    }
    if (query.allEmums === 'true') {
        facetHelper.populateAllEnums(result.facets);
    }
    // if (query.fillRange === 'true') {
    //    facetHelper.fillAllInRange(result.facets);
    // }
    // return result.facets;
    let facets = await facetHelper.expandFacets(result.facets);
    facets[0].total = result.count;

    // if secondary dimension then get those
    // if (chartSecondaryDimension) {
    //     secondDimension = await getSecondDimension(query, chartDimension, _.map(facets[0].counts, 'name'), chartSecondaryDimension);
        // secondSeries = secondDimension.map(function(e) {
        //     return getSerie(e[0]);
        // });
    // }

    result.facets = facets;
    let chartData = {
        title: getTitle(chartDimension),
        dimension: chartDimension,
        categories: getCategories(result.facets[0]),
        categoryKeys: getCategoryKeys(result.facets[0]),
        series: getSerie(result.facets[0])
        // facets: facets
    };
    return chartData;
}


// async function getSecondDimension(basisFilter, firstDimension, firstValues, secondDimension) {
//     let dimensionPromises = firstValues.map(function(fieldValue) {
//         let additionalFilter = {};
//         additionalFilter[firstDimension] = fieldValue;
//         let secondFilter = _.assign({facetLimit: 1000}, basisFilter, {facet: secondDimension, limit: 0}, additionalFilter);
//         return getData(secondFilter);
//     });
//     let secondaryResults = await Promise.all(dimensionPromises);
//     let decorateFacetsPromises = secondaryResults.map(function(result) {
//         return facetHelper.expandFacets(result.facets);
//     });
//     let decoratedFacets = await Promise.all(decorateFacetsPromises);
//     decoratedFacets.forEach(function(e, index) {
//         e[0].total = secondaryResults[index].count;
//     });
//     return decoratedFacets;
// }

async function getData(query) {
    let options = {
        url: apiConfig.occurrenceSearch.url + '?' + querystring.stringify(query),
        method: 'GET',
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        // TODO log error
        throw 'Internal server error getting data';
    }
    return response.body;
}

function getTitle(dimension) {
    return `Occurrences per ${dimension}`;
}

function getCategories(facet) {
    return _.map(facet.counts, 'displayName');
}

function getCategoryKeys(facet) {
    return _.map(facet.counts, 'name');
}

function getSerie(facet) {
    return [{
        data: _.map(facet.counts, 'count'),
        total: facet.total
    }];
}

/**
 * autogenerated chart title
 * total
 * categories[labels]
 * series[{label<optional if only one series>, data[], filter[{what filter to add to get explore this section}],total}]
 *
 * example A
 * title: Occurrences per basis of record
 * categories: HumanObservation, PreservedSpecimen, Unknown, ...
 * series: [{label: NONE_SPECIFIED, data: [13, 6, 336, ...]}]
 *
 * example B
 * title: Occurrences per month and taxon
 * categories: January, February, ...
 * series: [{label: Annelida, data[2,6,...]}, {label: Chromista, data: [6,3,...]}]
 *
 * example C
 * title:
 */
