class SlotDataFormatter {
    constructor(data) {
        this.data = data;
    }

    static getRelativeTime(d1, d2 = new Date()) {
        return SlotDataFormatter.getRelativeUnits(new Date(d1) - d2);
    }

    static getRelativeUnits(elapsed) {
        const units = {
            year: 24 * 60 * 60 * 1000 * 365,
            month: 24 * 60 * 60 * 1000 * 365 / 12,
            day: 24 * 60 * 60 * 1000,
            hour: 60 * 60 * 1000,
            minute: 60 * 1000,
            second: 1000
        };

        const rtf = new Intl.RelativeTimeFormat('en', {numeric: 'auto'});

        for (let u in units) if (Math.abs(elapsed) > units[u] || u === 'second') return {
            "rel_time_str": rtf.format(Math.round(elapsed / units[u]), u), "rel_secs": parseInt(elapsed / 1000) * -1
        }
    }

    emailFormat() {
        return this.data
            .map((slot) => `
                            <div>
                                <b>Visa Location: </b>${slot['visa_location']}<br/>
                                <b>Slots: </b>${slot['slots']}<br/>
                                <b>Checked: </b>${SlotDataFormatter.getRelativeTime(slot['createdon']).rel_time_str}<br/>
                            </div>
                            <br/>
                        `)
            .join(" ");
    }

    telegramFormat() {
        let totalSlots = 0;
        for (const idx in this.data) {
            totalSlots += this.data[idx]['slots'];
        }

        return `Total Slots: ${totalSlots}${totalSlots > 0 ? '\n\n' + this.data.filter((item) => item['slots'] > 0)
            .map((item)=> item['visa_location'] + ': ' + item['slots']).join('\n') : ''}`

    }
}

module.exports = SlotDataFormatter;