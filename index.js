/**
 * Initialize receipt
 * @param {Object} parsed_fields Parsed receipt information
 * @param {Object} pre_defined_fields Expected receipt information, used for verification
 * @return {Object}
 */
function receipt(parsed_fields = {}, pre_defined_fields = {}) {
    /**
     * Compare two strings or numbers
     * @param {string} a
     * @param {string} b
     * @return {Boolean} `true` if a and b are both string or number and equal otherwise `false`
     */
    function equals(a, b) {
        // considering `undefined === undefined`
        return (((typeof a == 'string' && typeof b == 'string') || (typeof a == 'number' && typeof b == 'number')) && a === b)
    }

    /**
     * Verify any parsed field with its corresponding predefined field
     * @param {Function} callback Callback function with two parameters `parsed_fields` and `pre_defined_fields` respectively
     * @return {Boolean} the return value from the callback function, should return `boolean`
     */
    function verify(callback) {
        return callback(parsed_fields, pre_defined_fields)
    }

    /**
     * Match or verify all parsed fields with their corresponding predefined fields
     * `parsed_fields` and `pre_defined_fields` must have the same name
     * @param {[string]} doNotCompare List of field names to ignore from checking
     * @return {Boolean} `true` if all fields match otherwise `false`, if `parsed_fields` are empty returns `false`
     */
    function verifyAll(doNotCompare = []) {
        if (Object.keys(parsed_fields).length <= 0) {
            return false
        }

        for (const key in parsed_fields) {
            if (Object.hasOwnProperty.call(parsed_fields, key)) {
                if (!doNotCompare.includes(key)) {
                    if (!equals(parsed_fields[key], pre_defined_fields[key])) {
                        return false
                    }
                }
            }
        }

        return true
    }

    /**
     * Match or verify specified list of fields with their corresponding predefined fields
     * `parsed_fields` and `pre_defined_fields` must have the same name
     * @param {[string]} field_names List of field names to check
     * @return {Boolean} `true` if all fields match otherwise `false`, if empty `field_names` passed returns `false`
     */
    function verifyOnly(field_names = []) {
        if (field_names.length <= 0) {
            return false
        }

        field_names.forEach(key => {
            if (!equals(field_names[key], pre_defined_fields[key])) {
                return false
            }
        })

        return true
    }

    return {equals, verify, verifyOnly, verifyAll}
}

/**
 * Parse fields from HTML string
 * @param {string} str HTML string
 * @return {Object} `parsed_fields` as an object with field names `payer_name`, `payer_phone`, `payer_acc_type`, `credited_party_name`, `credited_party_acc_no`, `transaction_status`, `bank_acc_no`, `receipt_no`, `date`, `settled_amount`, `discount_amount`, `vat_amount`, `total_amount`, `amount_in_word`, `payment_mode`, `payment_reason`, `payment_channel`
 */
function parseFromHTML(str) {
    const htmlparser = require('htmlparser2')
    const document = htmlparser.parseDocument(str)
    const td = htmlparser.DomUtils.getElementsByTagName('td', document)
    const fields = {}

    function getNextValue(index) {
        if (index + 1 < td.length) {
            return htmlparser.DomUtils.textContent(td[index + 1]).replace(/[\n\r\t]/ig, '').replace(/\s+/ig, ' ').trim();
        }
        return ''
    }

    const names = ["የከፋይስም/payername", "የከፋይቴሌብርቁ./payertelebirrno.", "የከፋይአካውንትአይነት/payeraccounttype", "የገንዘብተቀባይስም/creditedpartyname", "የገንዘብተቀባይቴሌብርቁ./creditedpartyaccountno", "የክፍያውሁኔታ/transactionstatus", "የባንክአካውንትቁጥር/bankaccountnumber", "የክፍያቁጥር/receiptno.", "የክፍያቀን/paymentdate", "የተከፈለውመጠን/settledamount", "ቅናሽ/discountamount", "15%ቫት/vat", "ጠቅላላየተክፈለ/totalamountpaid", "የገንዘቡልክበፊደል/totalamountinword", "የክፍያዘዴ/paymentmode", "የክፍያምክንያት/paymentreason", "የክፍያመንገድ/paymentchannel"]
    const keys = ['payer_name', 'payer_phone', 'payer_acc_type', 'credited_party_name', "credited_party_acc_no", "transaction_status", "bank_acc_no", "receipt_no", "date", "settled_amount", "discount_amount", "vat_amount", "total_amount", "amount_in_word", "payment_mode", "payment_reason", "payment_channel"]

    td.forEach((value, index) => {
        let s = htmlparser.DomUtils.textContent(value).replace(/[\n\r\s\t]/ig, '').trim().toLowerCase();

        const indexOf = names.indexOf(s)
        if (indexOf >= 0) {
            let nextValue = getNextValue(index + ((indexOf > 6 && indexOf <= 9) ? 2 : 0));
            let key = keys[indexOf];

            if (key === "bank_acc_no") {
                fields['to'] = nextValue.replace(/^[0-9]+/g, '').trim()
                fields[key] = nextValue.replace(/[A-Z]/ig, '').trim()
            } else if (key.endsWith("amount")) {
                fields[key] = parseFloat(nextValue.replace(/birr/ig, '').trim())
            } else {
                fields[key] = nextValue
            }
        }
    })

    return fields
}

/**
 * Load receipt HTML string from receipt number or any url
 * @param {string?} receipt_no Receipt number received from telebirr SMS, high priority
 * @param {string?} full_url Or full receipt url, less prior
 * @return {Promise<String>} HTML string
 */
function loadReceipt({receipt_no, full_url}) {
    return new Promise((resolve, reject) => {
        const url = receipt_no ? `https://transactioninfo.ethiotelecom.et/receipt/${receipt_no}` : full_url

        const https = require("https");
        const options = new URL(url)

        let data = ""
        const req = https.request(options, (res) => {
            res.on("data", (chunk) => {
                data += chunk
            })

            res.on("error", (error) => {
                reject(error)
            })

            res.on("end", () => {
                resolve(data)
            })
        })
        req.on("error", (error) => {
            reject(error)
        })
        req.end()
    })
}

module.exports = {receipt, utils: {parseFromHTML, loadReceipt}}