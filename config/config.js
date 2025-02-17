let path = require('path'),
    yargs = require('yargs').argv,
    rootPath = path.normalize(__dirname + '/..'),
    localeConfig = require('./locales'),
    env = process.env.NODE_ENV || 'local',
    port = yargs.port,
    dataApiV2 = yargs.dataapiv2,
    dataApi = yargs.dataapi,
    graphQLApi = yargs.dataapi,
    tileApi = yargs.tileapi,
    basemapTileApi = yargs.basemapTileApi,
    identityApi = yargs.identityApi,
    credentials = yargs.credentials,
    redirects = yargs.redirects,
    spamTerms = yargs.spamTerms,
    verification = yargs.verification,
    analyticsImg = yargs.analyticsImg,
    contentfulApi = yargs.contentfulApi,
    registry = yargs.registry,
    contentfulPreviewApi = yargs.contentfulPreviewApi,
    oozie = yargs.oozie,
    yarnResourceManager = yargs.yarnResourceManager,
    elk = yargs.elk,
    publicKibana = yargs.publicKibana,
    kibanaIndex = yargs.kibanaIndex,
    publicConstantKeys = {
        dataset: {
            backbone: 'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c',
            col: '7ddf754f-d193-4cc9-b351-99906754a03b',
            eod: '4fa7b334-ce0d-4e88-aaae-2e0c138d049e',
            iucn: '19491596-35ae-4a91-9a98-85cf505f1bd3'
        },
        node: {
            'secretariat': '02c40d2a-1cba-4633-90b7-e36e5e97aba8',
            'participantNodeManagersCommittee': '7f48e0c8-5c96-49ec-b972-30748e339115',
            'OBIS_NODE_KEY': 'ba0670b9-4186-41e6-8e70-f9cb3065551a'
        },
        network: {
            backboneNetwork: '029f9226-0d8a-4f28-97fe-13180e9eb0e5',
            obisNetworkKey: '2b7c7b4f-4d4f-40d3-94de-c28b6fa054a6'
        },
        participant: {
            obisKey: 304
        },
        publisher: {
            'GRIIS': 'cdef28b1-db4e-4c58-aa71-3c5238c2d0b5',
            'PLAZI': '7ce8aef0-9e92-11dc-8738-b8a03c50a862'
        },
        treatmentPublishers: [ // this is a mess and not in a config file. It has to be used tomorrow morning, so uuids from multiple environments will be added in one array
          '8d5e227d-ddf8-45f5-953e-e54be3e65ad1', // BHL UAT
          'ad0aba77-575f-45d4-bdf7-aacbd27e01b2', // BHL prod
          '7ce8aef0-9e92-11dc-8738-b8a03c50a862' // Plazi in UAT and prod
        ]
    },
    elasticContentful = yargs.elasticContentful,
    apidocs = 'https://gbif.github.io/gbif-api/apidocs/org/gbif/api',
    userAgent = 'GBIF_WEBSITE',
    healthUpdateFrequency = 30000;

// NB endpoints are VERY mixed. Ideally everything should be prod unless we are testing functionality that are developed in sync.
const localEnvironmentPostFix = ''; // e.g. '-uat';
let config = {
    local: {
        env: 'dev',
        healthEnv: 'uat',
        root: rootPath,
        app: {
            name: 'portal - local'
        },
        port: port || 3000,
        serverProtocol: 'http:',
        apidocs: apidocs,
        managementToolsSite: `//registry.gbif${localEnvironmentPostFix}.org/`,
        dataApiV2: dataApiV2 || `//api.gbif${localEnvironmentPostFix}.org/v2/`,
        dataApi: dataApi || `//api.gbif${localEnvironmentPostFix}.org/v1/`,
        graphQLApi: graphQLApi || `//graphql.gbif${localEnvironmentPostFix}.org/graphql`,
        tileApi: tileApi || `//api.gbif${localEnvironmentPostFix}.org/v1/map/density/tile.png`,
        basemapTileApi: basemapTileApi || `//tile.gbif${localEnvironmentPostFix}.org`,
        identityApi: identityApi || `//api.gbif${localEnvironmentPostFix}.org/v1/`,
        analyticsImg: analyticsImg || `www.gbif${localEnvironmentPostFix}.org/sites/default/files/gbif_analytics/`,
        // domain: 'http://www.gbif.org:7000',
        domain: 'http://localhost:3000',
        topDomain: `gbif${localEnvironmentPostFix}.org`,
        // notice the mock credentials will not work and shouldn't.
        // We still have private endpoints (such as the directory) this is unfortunate as it means outside users can only develop on a small part of the site.
        credentials: credentials || (rootPath + '/config/mockCredentials.json'),
        redirects: redirects || (rootPath + '/config/mockRedirects.json'),
        spamTerms: spamTerms || (rootPath + '/config/mockSpam.txt'),
        verification: verification || (rootPath + '/app/models/verification/sample'),
        contentfulApi: contentfulApi || 'https://cdn.contentful.com/',
        contentfulPreviewApi: contentfulPreviewApi || 'https://preview.contentful.com/',
        elasticContentful: elasticContentful || `http://cms-search.gbif${localEnvironmentPostFix}.org:9200/`,
        registry: registry || `https://registry.gbif${localEnvironmentPostFix}.org`,
        oozie: oozie || '//c5master1-vh.gbif.org:11000/oozie/v2/',
        yarnResourceManager: yarnResourceManager || '//c5master2-vh.gbif.org:8088/ws/v1/',
        elk: elk || '//private-logs.gbif.org:5601/',
        publicKibana: publicKibana || '//logs.gbif.org/',
        kibanaIndex: kibanaIndex || '36e5ccd0-fdb1-11ea-93de-b97c40066ce8',
        locales: localeConfig.locales,
        defaultLocale: localeConfig.defaultLocale,
        contentfulLocaleMap: localeConfig.localeMappings.contentful,
        publicConstantKeys: publicConstantKeys,
        fbAppId: 1534726343485342,
        userAgent: userAgent,
        blastApi: 'http://localhost:9000', // 'http://blast.gbif-dev.org',
        graphQL: `http://graphql.gbif${localEnvironmentPostFix}.org/graphql`,
        reactComponents: `//react-components.gbif${localEnvironmentPostFix}.org/lib/gbif-react-components.js`,
        healthUpdateFrequency: 240000
    },

    dev: {
        env: env,
        root: rootPath,
        app: {
            name: 'portal - dev'
        },
        port: port || 80,
        serverProtocol: 'http:',
        apidocs: apidocs,
        managementToolsSite: '//registry.gbif-dev.org/',
        dataApiV2: dataApiV2 || '//api.gbif-dev.org/v2/',
        dataApi: dataApi || '//api.gbif-dev.org/v1/',
        graphQLApi: graphQLApi || `//graphql.gbif-dev.org/graphql`,
        tileApi: tileApi || '//api.gbif-dev.org/v1/map/density/tile.png',
        basemapTileApi: basemapTileApi || '//tile.gbif-dev.org',
        identityApi: identityApi || '//api.gbif-dev.org/v1/',
        analyticsImg: analyticsImg || 'www.gbif-dev.org/sites/default/files/gbif_analytics/',
        domain: 'https://www.gbif-dev.org',
        topDomain: 'gbif-dev.org',
        credentials: credentials || '/etc/portal16/credentials',
        redirects: redirects || '/etc/portal16/redirects',
        spamTerms: spamTerms || ('/etc/portal16/spam.txt'),
        verification: verification || '/var/lib/human-verification/images',
        contentfulApi: contentfulApi || 'https://cdn.contentful.com/',
        contentfulPreviewApi: contentfulPreviewApi || 'https://preview.contentful.com/',
        elasticContentful: elasticContentful || 'http://cms-search.gbif-dev.org:9200/',
        registry: registry || 'https://registry.gbif-dev.org',
        oozie: oozie || '//c3master1-vh.gbif.org:11000/oozie/v2/',
        yarnResourceManager: yarnResourceManager || '//c3master2-vh.gbif.org:8088/ws/v1/',
        elk: elk || '//privatelogs2-vh.gbif.org:5601/',
        publicKibana: publicKibana || '//logs.gbif.org/',
        kibanaIndex: kibanaIndex || '36e5ccd0-fdb1-11ea-93de-b97c40066ce8',
        locales: localeConfig.locales,
        defaultLocale: localeConfig.defaultLocale,
        contentfulLocaleMap: localeConfig.localeMappings.contentful,
        publicConstantKeys: publicConstantKeys,
        fbAppId: 1534726343485342,
        userAgent: userAgent,
        blastApi: 'http://blast.gbif-dev.org',
        graphQL: 'http://graphql.gbif-dev.org/graphql',
        reactComponents: '//react-components.gbif-dev.org/lib/gbif-react-components.js',
        healthUpdateFrequency: healthUpdateFrequency
    },

    // Dev2 is for testing the new cluster.  Fallback to dev or fail where appropriate.
    dev2: {
        env: env,
        root: rootPath,
        app: {
            name: 'portal - dev2'
        },
        port: port || 80,
        serverProtocol: 'http:',
        apidocs: apidocs,
        managementToolsSite: '//registry.gbif-dev2.org/',
        dataApiV2: dataApiV2 || '//api.gbif-dev2.org/v2/',
        dataApi: dataApi || '//api.gbif-dev2.org/v1/',
        graphQLApi: graphQLApi || `//graphql.gbif-dev2.org/graphql`,
        tileApi: tileApi || '//api.gbif-dev2.org/v1/map/density/tile.png',
        basemapTileApi: basemapTileApi || '//tile.gbif-dev.org',
        identityApi: identityApi || '//api.gbif-dev2.org/v1/',
        analyticsImg: analyticsImg || 'www.gbif-dev.org/sites/default/files/gbif_analytics/',
        domain: 'https://www.gbif-dev2.org',
        topDomain: 'gbif-dev2.org',
        credentials: credentials || '/etc/portal16/credentials',
        redirects: redirects || '/etc/portal16/redirects',
        spamTerms: spamTerms || ('/etc/portal16/spam.txt'),
        verification: verification || '/var/lib/human-verification/images',
        contentfulApi: contentfulApi || 'https://cdn.contentful.com/',
        contentfulPreviewApi: contentfulPreviewApi || 'https://preview.contentful.com/',
        elasticContentful: elasticContentful || 'http://cms-search.gbif-dev.org:9200/',
        registry: registry || 'https://registry.gbif-dev2.org',
        oozie: oozie || '//c3master1-vh.gbif.org:11000/oozie/v2/',
        yarnResourceManager: yarnResourceManager || '//c3master2-vh.gbif.org:8088/ws/v1/',
        elk: elk || '//privatelogs2-vh.gbif.org:5601/',
        publicKibana: publicKibana || '//logs.gbif.org/',
        kibanaIndex: kibanaIndex || '36e5ccd0-fdb1-11ea-93de-b97c40066ce8',
        locales: localeConfig.locales,
        defaultLocale: localeConfig.defaultLocale,
        contentfulLocaleMap: localeConfig.localeMappings.contentful,
        publicConstantKeys: publicConstantKeys,
        fbAppId: 1534726343485342,
        userAgent: userAgent,
        blastApi: 'http://blast.gbif-dev.org',
        graphQL: 'http://graphql.gbif-dev2.org/graphql',
        reactComponents: '//react-components.gbif-dev2.org/lib/gbif-react-components.js',
        healthUpdateFrequency: healthUpdateFrequency
    },

    // Demo is using UAT APIs where necessary, as these are public.
    demo: {
        env: env,
        root: rootPath,
        app: {
            name: 'portal - demo'
        },
        port: port || 80,
        serverProtocol: 'http:',
        apidocs: apidocs,
        managementToolsSite: '//registry.gbif-uat.org/',
        dataApiV2: dataApiV2 || '//api-demo.gbif-dev.org/v2/',
        dataApi: dataApi || '//api-demo.gbif-dev.org/v1/',
        graphQLApi: graphQLApi || `//graphql.gbif-dev.org/graphql`,
        tileApi: tileApi || '//api-demo.gbif-dev.org/v1/map/density/tile.png',
        basemapTileApi: basemapTileApi || '//tile.gbif-uat.org',
        identityApi: identityApi || '//api-demo.gbif-dev.org/v1/',
        analyticsImg: analyticsImg || 'www.gbif-uat.org/sites/default/files/gbif_analytics/',
        domain: 'https://www-demo.gbif-dev.org',
        // Not sure what this should be.
        topDomain: 'demo.gbif-dev.org',
        credentials: credentials || '/etc/portal16/credentials',
        redirects: redirects || '/etc/portal16/redirects',
        spamTerms: spamTerms || ('/etc/portal16/spam.txt'),
        verification: verification || '/var/lib/human-verification/images',
        contentfulApi: contentfulApi || 'https://cdn.contentful.com/',
        contentfulPreviewApi: contentfulPreviewApi || 'https://preview.contentful.com/',
        elasticContentful: elasticContentful || 'http://cms-search.gbif-uat.org:9200/',
        registry: registry || 'https://registry.gbif-uat.org',
        oozie: oozie || '//c4oozie.gbif-uat.org:11000/oozie/v2/',
        yarnResourceManager: yarnResourceManager || '//c4yarn.gbif-uat.org:8088/ws/v1/',
        elk: elk || '//private-logs.gbif.org:5601/',
        publicKibana: publicKibana || '//logs.gbif.org/',
        kibanaIndex: kibanaIndex || '36e5ccd0-fdb1-11ea-93de-b97c40066ce8',
        locales: localeConfig.locales,
        defaultLocale: localeConfig.defaultLocale,
        contentfulLocaleMap: localeConfig.localeMappings.contentful,
        publicConstantKeys: publicConstantKeys,
        // Not updated
        fbAppId: 1534726343485342,
        userAgent: userAgent,
        blastApi: 'http://blast.gbif-dev.org',
        graphQL: 'http://graphql.gbif-staging.org/graphql',
        reactComponents: '//react-components.gbif-dev.org/lib/gbif-react-components.js',
        healthUpdateFrequency: healthUpdateFrequency
    },

    uat: {
        env: env,
        root: rootPath,
        app: {
            name: 'portal - uat'
        },
        port: port || 80,
        serverProtocol: 'http:',
        apidocs: apidocs,
        managementToolsSite: '//registry.gbif-uat.org/',
        dataApiV2: dataApiV2 || '//api.gbif-uat.org/v2/',
        dataApi: dataApi || '//api.gbif-uat.org/v1/',
        graphQLApi: graphQLApi || `//graphql.gbif-uat.org/graphql`,
        tileApi: tileApi || '//api.gbif-uat.org/v1/map/density/tile.png',
        basemapTileApi: basemapTileApi || '//tile.gbif-uat.org',
        identityApi: identityApi || '//api.gbif-uat.org/v1/',
        analyticsImg: analyticsImg || 'www.gbif-uat.org/sites/default/files/gbif_analytics/',
        domain: 'https://www.gbif-uat.org',
        topDomain: 'gbif-uat.org',
        credentials: credentials || '/etc/portal16/credentials',
        redirects: redirects || '/etc/portal16/redirects',
        spamTerms: spamTerms || ('/etc/portal16/spam.txt'),
        verification: verification || '/var/lib/human-verification/images',
        contentfulApi: contentfulApi || 'https://cdn.contentful.com/',
        contentfulPreviewApi: contentfulPreviewApi || 'https://preview.contentful.com/',
        elasticContentful: elasticContentful || 'http://cms-search.gbif-uat.org:9200/',
        registry: registry || 'https://registry.gbif-uat.org',
        oozie: oozie || '//c4master1-vh.gbif.org:11000/oozie/v2/',
        yarnResourceManager: yarnResourceManager || '//c4master2-vh.gbif.org:8088/ws/v1/',
        elk: elk || '//private-logs.gbif.org:5601/',
        publicKibana: publicKibana || '//logs.gbif.org/',
        kibanaIndex: kibanaIndex || '782daf00-fdb1-11ea-93de-b97c40066ce8',
        locales: localeConfig.locales,
        defaultLocale: localeConfig.defaultLocale,
        contentfulLocaleMap: localeConfig.localeMappings.contentful,
        publicConstantKeys: publicConstantKeys,
        fbAppId: 1534726343485342,
        userAgent: userAgent,
        blastApi: 'http://blast.gbif-dev.org',
        graphQL: 'http://graphql.gbif-uat.org/graphql',
        reactComponents: '//react-components.gbif-uat.org/lib/gbif-react-components.js',
        healthUpdateFrequency: healthUpdateFrequency
    },

    staging: {
        env: env,
        root: rootPath,
        app: {
            name: 'portal - staging'
        },
        port: port || 80,
        serverProtocol: 'http:',
        apidocs: apidocs,
        managementToolsSite: '//registry.gbif.org/',
        dataApiV2: dataApiV2 || '//api.gbif.org/v2/',
        dataApi: dataApi || '//api.gbif.org/v1/',
        graphQLApi: graphQLApi || `//graphql.gbif.org/graphql`,
        tileApi: tileApi || '//api.gbif.org/v1/map/density/tile.png',
        basemapTileApi: basemapTileApi || '//tile.gbif.org',
        identityApi: identityApi || '//api.gbif.org/v1/',
        analyticsImg: analyticsImg || 'www.gbif.org/sites/default/files/gbif_analytics/',
        domain: 'https://www.gbif-staging.org',
        topDomain: 'gbif-staging.org',
        credentials: credentials || '/etc/portal16/credentials',
        redirects: redirects || '/etc/portal16/redirects',
        spamTerms: spamTerms || ('/etc/portal16/spam.txt'),
        verification: verification || '/var/lib/human-verification/images',
        contentfulApi: contentfulApi || 'https://cdn.contentful.com/',
        contentfulPreviewApi: contentfulPreviewApi || 'https://preview.contentful.com/',
        elasticContentful: elasticContentful || 'http://cms-search.gbif.org:9200/',
        registry: registry || 'https://registry.gbif.org',
        oozie: oozie || '//c4master1-vh.gbif.org:11000/oozie/v2/',
        yarnResourceManager: yarnResourceManager || '//c4master2-vh.gbif.org:8088/ws/v1/',
        elk: elk || '//private-logs.gbif.org:5601/',
        publicKibana: publicKibana || '//logs.gbif.org/',
        kibanaIndex: kibanaIndex || '24993300-fdb1-11ea-93de-b97c40066ce8',
        locales: localeConfig.locales,
        defaultLocale: localeConfig.defaultLocale,
        contentfulLocaleMap: localeConfig.localeMappings.contentful,
        publicConstantKeys: publicConstantKeys,
        fbAppId: 1534726343485342,
        userAgent: userAgent,
        blastApi: 'http://blast.gbif-dev.org',
        graphQL: 'http://graphql.gbif-staging.org/graphql',
        reactComponents: '//react-components.gbif-staging.org/lib/gbif-react-components.js',
        healthUpdateFrequency: healthUpdateFrequency
    },

    prod: {
        env: env,
        root: rootPath,
        app: {
            name: 'portal - prod'
        },
        port: port || 80,
        serverProtocol: 'http:',
        apidocs: apidocs,
        managementToolsSite: '//registry.gbif.org/',
        dataApiV2: dataApiV2 || '//api.gbif.org/v2/',
        dataApi: dataApi || '//api.gbif.org/v1/',
        graphQLApi: graphQLApi || `//graphql.gbif.org/graphql`,
        tileApi: tileApi || '//api.gbif.org/v1/map/density/tile.png',
        basemapTileApi: basemapTileApi || '//tile.gbif.org',
        identityApi: identityApi || '//api.gbif.org/v1/',
        analyticsImg: analyticsImg || 'www.gbif.org/sites/default/files/gbif_analytics/',
        domain: 'https://www.gbif.org',
        topDomain: 'gbif.org',
        credentials: credentials || '/etc/portal16/credentials',
        redirects: redirects || '/etc/portal16/redirects',
        spamTerms: spamTerms || ('/etc/portal16/spam.txt'),
        verification: verification || '/var/lib/human-verification/images',
        contentfulApi: contentfulApi || 'https://cdn.contentful.com/',
        contentfulPreviewApi: contentfulPreviewApi || 'https://preview.contentful.com/',
        elasticContentful: elasticContentful || 'http://cms-search.gbif.org:9200/',
        registry: registry || 'https://registry.gbif.org',
        oozie: oozie || '//c5master1-vh.gbif.org:11000/oozie/v2/',
        yarnResourceManager: yarnResourceManager || '//c5master2-vh.gbif.org:8088/ws/v1/',
        elk: elk || '//private-logs.gbif.org:5601/',
        publicKibana: publicKibana || '//logs.gbif.org/',
        kibanaIndex: kibanaIndex || '24993300-fdb1-11ea-93de-b97c40066ce8',
        locales: localeConfig.locales,
        defaultLocale: localeConfig.defaultLocale,
        contentfulLocaleMap: localeConfig.localeMappings.contentful,
        publicConstantKeys: publicConstantKeys,
        fbAppId: 1534726343485342,
        userAgent: userAgent,
        blastApi: 'http://blast.gbif-dev.org',
        graphQL: 'http://graphql.gbif.org/graphql',
        reactComponents: '//react-components.gbif.org/lib/gbif-react-components.js',
        healthUpdateFrequency: healthUpdateFrequency
    },

    test: {
        env: env,
        root: rootPath,
        app: {
            name: 'portal - test'
        },
        port: port || 3000,
        serverProtocol: 'http:',
        apidocs: apidocs,
        managementToolsSite: '//registry.gbif-uat.org/',
        dataApiV2: dataApiV2 || '//api.gbif.org/v2/',
        dataApi: dataApi || '//api.gbif-uat.org/v1/',
        tileApi: tileApi || '//api.gbif-uat.org/v1/map/density/tile.png',
        basemapTileApi: basemapTileApi || '//tile.gbif.org',
        identityApi: identityApi || '//labs.gbif-uat.org:7003/',
        analyticsImg: analyticsImg || 'www.gbif.org/sites/default/files/gbif_analytics/',
        domain: 'https://www.gbif-uat.org',
        topDomain: 'gbif-uat.org',
        credentials: credentials || '/etc/portal16/credentials',
        redirects: redirects || '/etc/portal16/redirects',
        spamTerms: spamTerms || ('/etc/portal16/spam.txt'),
        verification: verification || '/var/lib/human-verification/images',
        contentfulApi: contentfulApi || 'https://cdn.contentful.com/',
        contentfulPreviewApi: contentfulPreviewApi || 'https://preview.contentful.com/',
        elasticContentful: elasticContentful || 'http://cms-search.gbif.org:9200/',
        registry: registry || 'https://registry-uat.gbif.org',
        oozie: oozie || '//c5master1-vh.gbif.org:11000/oozie/v2/',
        yarnResourceManager: yarnResourceManager || '//c5master2-vh.gbif.org:8088/ws/v1/',
        elk: elk || '//private-logs.gbif.org:5601/',
        publicKibana: publicKibana || '//logs.gbif.org/',
        kibanaIndex: kibanaIndex || '782daf00-fdb1-11ea-93de-b97c40066ce8',
        locales: localeConfig.locales,
        defaultLocale: localeConfig.defaultLocale,
        contentfulLocaleMap: localeConfig.localeMappings.contentful,
        publicConstantKeys: publicConstantKeys,
        fbAppId: 1534726343485342,
        userAgent: userAgent,
        blastApi: 'http://blast.gbif-dev.org',
        graphQL: 'http://graphql.gbif-dev.org/graphql',
        reactComponents: '//react-components.gbif-dev.org/lib/gbif-react-components.js',
        healthUpdateFrequency: healthUpdateFrequency
    }
};

module.exports = Object.freeze(config[env]);
