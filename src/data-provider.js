const axios = require("axios");

const units = {
    year  : 24 * 60 * 60 * 1000 * 365,
    month : 24 * 60 * 60 * 1000 * 365/12,
    day   : 24 * 60 * 60 * 1000,
    hour  : 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000
}, rtf = new Intl.RelativeTimeFormat('en', {numeric: 'auto'});

let getRelativeTime = (d1, d2 = new Date()) => {return getRelativeUnits(new Date(d1) - d2);}

function getRelativeUnits(elapsed) {
    for (let u in units)
        if (Math.abs(elapsed) > units[u] || u === 'second')
            return {
                "rel_time_str": rtf.format(Math.round(elapsed/units[u]), u),
                "rel_secs": parseInt(elapsed/1000) * -1
        }
}

class DataProvider {
    constructor(context) {
        this.headers = {
            "accept": "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-GB,en;q=0.9,ta-IN;q=0.8,ta;q=0.7,en-US;q=0.6",
            "dnt": "1",
            "origin": `chrome-extension://${context.chromeId}`,
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36",
            "x-api-key": context.accessKey,
        }

        this.uri = "https://app.checkvisaslots.com/slots/v1";

    }

    async fetch(){
        return await axios.get(this.uri, {headers: this.headers})
            .then((response) => {
                const data = response.data.slotDetails;
                const result = data
                    .map((slot) => `
                            <div>
                                <b>Visa Location: </b>${slot['visa_location']}<br/>
                                <b>Slots: </b>${slot['slots']}<br/>
                                <b>Checked: </b>${getRelativeTime(slot['createdon']).rel_time_str}<br/>
                            </div>
                            <br/>
                        `)
                    .join(" ");
                return {
                    responseStatus: response.status,
                    responseData: result
                };
            })
            .catch((error) => {
                return {
                    responseStatus: error.status,
                    responseData: ""
                }
            })
    }
}

module.exports = DataProvider;