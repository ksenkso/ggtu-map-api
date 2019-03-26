const {PlaceProps} = require('../models');
const matchers = {
    cabinet: {
        regex: /((\w+) (?:кабинет|аудитория))|((?:кабинет|аудитория) №?(\w+))/i,
        info(match) {
            return {
                number: match[1] ? match[2] : match[3] ? match[4] : null,
                type: 'place',
                placeType: 'cabinet',
                source: match[1] || match[3]
            };
        }
    },
    building: {
        regex: /((\w+) (корпус|общежитие|общага))|((корпус|общежитие|общага) №?(\w+))/i,
        info(match) {
            return {
                number: match[1] ? match[2] : match[4] ? match[6] : null,
                type: 'building',
                buildingType: PlaceProps.BUILDING.getType(match[1] ? match[3] : match[4] ? match[5] : undefined), // default type is 'study'
                source: match[1] || match[3]
            };
        }
    },
    wc: {
        regex: /((мужской|женский)?\s?(?:туалет|wc))|((?:туалет|wc)\s?(мужской|женский)?)/i,
        info(match) {
            return {
                sex: match[1] ? PlaceProps.WC.getType(match[2]) : match[3] ? PlaceProps.WC.getType(match[4]) : null,
                placeType: 'wc',
                type: 'place',
                source: match[1] || match[3]
            };
        }
    },
    floor: {
        regex: /((\d+) этаж)|(этаж (\d+))/i,
        info(match) {
            return {
                floor: match[2] || match[4],
                type: 'location',
                source: match[1] || match[3]
            };
        }
    },
    shortAddress: {
        regex: /(\d+)([ко]) ([0-9а-я]+)/i,
        info(match) {
            return {
                type: 'shortAddress',
                building: {
                    buildingType: match[2] === 'к' ? 'study' : 'live',
                    number: match[1]
                },
                cabinet: {
                    number: match[3],
                }
            };
        }
    }
};
function parse(line) {
    const results = [];
    let copy = line.substr(0).split(/\s+/).join(' ');
    const tokens = copy.split(' ');
    const processed = new Uint8Array(copy.length);
    const address = new Map();
    let lastChr = 0;
    for (let i = 0; i < tokens.length - 1; i++) {
        const token = tokens[i] + ' ' + tokens[i + 1];
        Object.keys(matchers).forEach(matcher => {
            const match = token.match(matchers[matcher].regex);
            if (match) {
                const info = matchers[matcher].info(match);
                if (!address.has(info.type)) {
                    address.set(info.type, info);
                    for (let i = 0; i < token.length + 1; i++) {
                        processed[lastChr + i] = 1;
                    }
                }
            }
        });
        lastChr += tokens[i].length + 1;

    }
    address.forEach(type => results.push(type));
    let i = 0;
    while (i < processed.length) {
        let token = '';
        while (!processed[i] && i < processed.length) {
            token += line[i];
            i++;
        }
        if (token.length) {
            results.push({
                type: 'place',
                name: token.trim()
            });
        }
        i++;
    }

    return results;
}

module.exports = parse;
