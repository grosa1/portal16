/**
 add menu to all requests.
 TODO: use default menu - then try to update it ES every now and then.
 */
let _ = require('lodash');
let menu = rootRequire('/app/models/menu');
let esFallbackNavigation = require('./esFallbackNavigation.json');
let esFallBackHomePage = require('./esFallBackHomePage.json');
let resourceSearch = rootRequire('app/controllers/api/resource/search/resourceSearch');

function transformEsNavigationElements(homePage, navElements) {
    let mainNavigationElements = homePage.mainNavigationElements;
    let navIdMap = _.keyBy(navElements.results, 'id');
    let menuBuild = [];
    mainNavigationElements.forEach(function(e) {
        menuBuild.push(buildElement(e.id, navIdMap));
    });
    return menuBuild;
}

function buildElement(key, navIdMap) {
    let navEl = navIdMap[key];
    let item = {name: navEl.title};
    if (navEl.link) {
        item.url = navEl.link;
    } else if (navEl.childNavigationElements) {
        item.items = [];
        item.type = 'normal';
        navEl.childNavigationElements.forEach(function(e, i) {
            let sub = buildElement(e.id, navIdMap);
            if (sub.items) {
                if (item.type !== 'mega' && i > 0) {
                    throw new Error('Mega menus need all children to have items');
                }
                item.type = 'mega';
            }
            item.items.push(sub);
        });
    } else {
        throw new Error('A menu items should either have children or a link : ' + key);
    }
    return item;
}
// try {
//     console.log(JSON.stringify(transformEsNavigationElements(esFallBackHomePage, esFallbackNavigation), null, 2));
// } catch (err) {
//     console.log(err);
// }

function getMenuOrFallback(home, nav) {
    try {
        return transformEsNavigationElements(home, nav);
    } catch (err) {
        console.log(err);
        return menu;
    }
}

async function getNavAndHomePage(locale, __) {
    let nav = await resourceSearch.search({contentType: 'navigationElement', limit: 200, locale: locale}, __, {requestTimeout: 2000});
    let home = esFallBackHomePage; // await resourceSearch.search({contentType: 'homePage', limit: 200, locale: locale}, __, {requestTimeout: 2000});
    return {nav: nav, home: home};
}

let menus = {};
async function getMenuData(locale, __) {
    // if cached version ready, then use that
    let cachedMenu = menus[locale];
    if (cachedMenu) {
        return cachedMenu;
    }
    getNavAndHomePage(locale, __)
        .then(function(data) {
            let dynamicMenu = getMenuOrFallback(data.home, data.nav);
            if (!cachedMenu) {
                return dynamicMenu;
            }
        }).catch(function(err) {
            console.log(err);
            if (!cachedMenu) {
                return esFallbackNavigation;
            }
        });
}

function use(app) {
    app.use(function(req, res, next) {
        getMenuData(res.locals.gb.locales.current, req.__)
            .then(function(menuDynamic) {
                res.locals.gb = res.locals.gb || {};
                res.locals.gb.menu = menuDynamic;
                next();
            }).catch(function(err) {
                console.log(err);
                res.locals.gb = res.locals.gb || {};
                res.locals.gb.menu = menu;
                next();
            });
        
    });
}

module.exports = {
    use: use
};

