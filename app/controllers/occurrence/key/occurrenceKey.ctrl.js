let express = require('express'),
    occurrenceKey = require('./occurrenceKey'),
    imageCacheUrl = rootRequire('app/models/gbifdata/apiConfig').image.url,
    helper = rootRequire('app/models/util/util'),
    request = rootRequire('app/helpers/request'),
    querystring = require('querystring'),
    apiConfig = require('../../../models/gbifdata/apiConfig'),
    router = express.Router({caseSensitive: true});

module.exports = function(app) {
    app.use('/', router);
};

import MyComponent from '../../../shared/src/deleteme2'
import React from 'react'
import {renderToString} from 'react-dom/server'
import { ServerStyleSheet } from 'styled-components'


router.get('/occurrence/deleteme/:key(\\d+).:ext?', function(req, res, next) {
    const sheet = new ServerStyleSheet()
    let rendered = renderToString(sheet.collectStyles(
        <React.Fragment>
            <MyComponent bazZer={'hej fra serveren'}/>
            <h1>something else </h1>
        </React.Fragment>)
        );
    const styleTags = sheet.getStyleTags();
    console.log(styleTags);
    // res.send(rendered);
    helper.renderPage(req, res, next, {
        content: `<my-component baz-zer="'hej fra serveren'">${rendered}</my-component>`,
        style: styleTags
    }, 'pages/react');
});

router.get('/occurrence/:key(\\d+).:ext?', function(req, res, next) {
    let key = req.params.key;
    occurrenceKey.getOccurrenceModel(key, res.__).then(function(occurrence) {
        renderPage(req, res, next, occurrence);
    }).catch(function(err) {
        if (err.type == 'NOT_FOUND') {
            next();
        } else {
            next(err);
        }
    });
});

router.get('/api/template/occurrence/:key(\\d+)', function(req, res, next) {
    let key = req.params.key;
    occurrenceKey.getOccurrenceModel(key, res.__).then(function(occurrence) {
        renderContent(req, res, next, occurrence);
    }).catch(function(err) {
        if (err.type == 'NOT_FOUND') {
            res.sendStatus(404);
        } else {
            res.sendStatus(500);
        }
    });
});

router.get('/occurrence/:key(\\d+)/verbatim', function(req, res, next) {
    let key = req.params.key;
    res.redirect(302, res.locals.gb.locales.urlPrefix + '/occurrence/' + key);
});

router.get('/occurrence/first', function(req, res, next) {
    occurrenceSearchFirst(req.query).then(function(resp) {
        if (resp.count == 1) {
            res.redirect(302, res.locals.gb.locales.urlPrefix + '/occurrence/' + resp.results[0].key);
        } else {
            res.redirect(302, res.locals.gb.locales.urlPrefix + '/occurrence/search?' + querystring.stringify(req.query));
        }
    }, function(err) {
        next(err);
    });
});

function renderPage(req, res, next, occurrence) {
    try {
        if (req.params.ext == 'debug') {
            res.json(occurrence);
        } else {
            let angularInitData = occurrenceKey.getAngularInitData(occurrence);
            let contentItem = {
                occurrence: occurrence,
                occurrenceCoreTerms: occurrenceKey.occurrenceCoreTerms,
                angularInitData: angularInitData,
                occurrenceRemarks: occurrenceKey.occurrenceRemarks,
                _meta: {
                    title: 'Occurrence Detail ' + req.params.key,
                    hasTools: true,
                    imageCacheUrl: imageCacheUrl
                }
            };
            helper.renderPage(req, res, next, contentItem, 'pages/occurrence/key/occurrenceKey');
        }
    } catch (e) {
        next(e);
    }
}

function renderContent(req, res, next, occurrence) {
    try {
        let angularInitData = occurrenceKey.getAngularInitData(occurrence);
        let contentItem = {
            occurrence: occurrence,
            occurrenceCoreTerms: occurrenceKey.occurrenceCoreTerms,
            angularInitData: angularInitData,
            occurrenceRemarks: occurrenceKey.occurrenceRemarks,
            _meta: {
                title: 'Occurrence Detail ' + req.params.key,
                hasTools: true,
                imageCacheUrl: imageCacheUrl
            }
        };
        helper.renderPage(req, res, next, contentItem, 'pages/occurrence/key/occurrenceKey.template.nunjucks');
    } catch (e) {
        res.sendStatus(500);
    }
}

async function occurrenceSearchFirst(query) {
    let baseRequest = {
        url: apiConfig.occurrenceSearch.url + '?' + querystring.stringify(query),
        method: 'GET',
        json: true,
        fullResponse: true
    };
    let response = await request(baseRequest);
    if (response.statusCode != 200) {
        throw response;
    }
    return response.body;
}
