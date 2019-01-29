'use strict';
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const MAPS_PATH = process.env.MAPS_PATH || path.resolve(__dirname, '../maps/');
const debug = require('debug')('Model:Building');

module.exports = (sequelize, DataTypes) => {
    /**
     * @class Building
     * @extends Sequelize.Model
     */
    const Building = sequelize.define('Building', {
        name: DataTypes.STRING,
        type: {
            type: DataTypes.STRING(16),
            defaultValue: 'study'
        },
        container: {
            type: DataTypes.STRING(48)
        }
    });

    Building.associate = function (models) {
        Building.hasMany(models.Location);
    };

    Building.defineStatic = (models) => {
        Building.hook('afterSave', async (building, options) => {
            debug('afterSave');
            let shouldUpdate = false;
            for (let i = 0; i < options.fields.length; i++) {
                if (options.fields[i] === 'id' || options.fields[i] === 'container') {
                    shouldUpdate = true;
                    break;
                }
            }
            if (shouldUpdate) {
                debug('Id - ' + building.id);
                const location = await models.Location.findOne({where: {BuildingId: null}});
                const mapPath = path.join(MAPS_PATH, location.map);
                debug('path: ' + mapPath);
                if (fs.existsSync(mapPath)) {
                    debug('Path exists');
                    const file = fs.readFileSync(mapPath);
                    const $ = cheerio.load(file);
                    $('#' + building.container).attr('data-id', building.id);
                    const html = $('svg').parent().html();
                    console.log(html);
                    fs.writeFileSync(mapPath, html);
                } else {
                    console.log(mapPath);
                }
            }
        });
    };


    return Building;
};
