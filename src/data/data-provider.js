const axios = require("axios");


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

    async fetch() {
        return await axios.get(this.uri, {headers: this.headers})
            .then((response) => {
                const data = response.data.slotDetails;

                let totalSlots = 0;
                for (const idx in data) {
                    totalSlots += data[idx]['slots'];
                }
                return {
                    responseStatus: response.status, responseData: data, totalSlots: totalSlots
                };
            })
            .catch((error) => {
                return {
                    responseStatus: error.status, responseData: error
                }
            })
    }
}

module.exports = DataProvider;