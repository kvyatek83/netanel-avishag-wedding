module.exports = {
    // Leading zeros
    wrapPrefixPhoneWithLeadingZeros(str) {
        if (str.charAt(0) == '+') {
            return `="0` + str.substr(4) + `"`;
        }
        return str;
    },

    wrapIsraeliPhoneWithLeadingZeros(str) {
        if (/^0\d+/.test(str)) {
            return `="` + str + `"`;
        }
        return str;
    },

    parseLeadingZerosPhoneToPrefixPhone(user) {
        if (/^0\d+/.test(user.phone)) {
            const israelPrefix = '+972';
            const prefixPhone = `${israelPrefix}${Number(user.phone)}`;
            user.phone = prefixPhone;
            user.phone = prefixPhone;
        }
    },

    stringBooleanToBoolean(str) {
        return str?.toLowerCase?.() === 'true';
    },

    booleanToHebrewBoolean(str) {
        return str ? 'כן' : 'לא';
    },

    checkIfBoolean(str) {
        return str?.toLowerCase?.() === 'true' || str?.toLowerCase?.() === 'false';
    },

    checkIfPhoneNumber(str) {
        return str.charAt(0) == '+' || str.charAt(0) == '0' && str.length < 1 && str.length > 11;
    }
}