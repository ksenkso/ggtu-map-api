const cheerio = require('cheerio');
const fs = require('fs');
const debug = require('debug')('App:Utils');
const path = require('path');
const MAPS_PATH = process.env.MAPS_PATH || path.resolve(__dirname, '../maps/');
/**
 *
 * @param {{map: string}} location
 * @param {String} containerId
 * @param {Object} attributes a dictionary of data-attributes. If an attribute is null, it will bw removed
 */
module.exports = (location, containerId, attributes) => {
    const mapPath = path.join(MAPS_PATH, location.map);
    debug('path: ' + mapPath);
    if (fs.existsSync(mapPath)) {
        debug('Path exists');
        const file = fs.readFileSync(mapPath);
        const $ = cheerio.load(file);
        Object.keys(attributes).forEach(prop => {
            attributes['data-'+prop] = attributes[prop];
            delete attributes[prop];
        });
        $('#' + containerId).attr(attributes);
        const html = $('svg').parent().html();
        fs.writeFileSync(mapPath, html);
    } else {
        console.log(mapPath);
    }
};
