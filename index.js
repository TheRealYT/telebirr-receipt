/**
 * Initialize receipt
 * @param {Object} parsedFields Parsed receipt information
 * @param {Object} preDefinedFields Expected receipt information, used for verification
 * @return {Object}
 */
function receipt(parsedFields = {}, preDefinedFields = {}) {
    /**
     * Compare two strings or numbers
     * @param {string|number} a
     * @param {string|number} b
     * @return {boolean} `true` if a and b are both string or number and equal otherwise `false`
     */
    function equals(a, b) {
        // considering `undefined === undefined`
        return (typeof a === 'string' && typeof b === 'string' || typeof a === 'number' && typeof b === 'number') && a === b
    }

    /**
     * Verify any parsed field with its corresponding predefined field
     * @param {function(Object, Object) : boolean} callback Callback function with two parameters `parsedFields` and `preDefinedFields` respectively
     * @return {boolean} the return value from the callback function, should return `boolean`
     */
    function verify(callback) {
        return callback(parsedFields, preDefinedFields)
    }

    /**
     * Match or verify all parsed fields with their corresponding predefined fields
     * `parsedFields` and `preDefinedFields` must have the same name
     * @param {[string]} doNotCompare List of field names to ignore from checking
     * @return {boolean} `true` if all fields match otherwise `false`, if `parsedFields` are empty returns `false`
     */
    function verifyAll(doNotCompare = []) {
        if (Object.keys(parsedFields).length <= 0) {
            return false
        }

        for (const key in parsedFields) {
            if (Object.hasOwnProperty.call(parsedFields, key)) {
                if (!doNotCompare.includes(key)) {
                    if (!equals(parsedFields[key], preDefinedFields[key])) {
                        return false
                    }
                }
            }
        }

        return true
    }

    /**
     * Match or verify specified list of fields with their corresponding predefined fields
     * `parsedFields` and `preDefinedFields` must have the same name
     * @param {[string]} fieldNames List of field names to check
     * @return {boolean} `true` if all fields match otherwise `false`, if empty `fieldNames` passed returns `false`
     */
    function verifyOnly(fieldNames = []) {
        if (fieldNames.length <= 0) {
            return false
        }

        fieldNames.forEach(key => {
            if (!equals(fieldNames[key], preDefinedFields[key])) {
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
 * @return {{payer_name:string?, payer_phone:string?, payer_acc_type:string?, credited_party_name:string?, credited_party_acc_no:string?, transaction_status:string?, bank_acc_no:string?, receiptNo:string?, date:string?, settled_amount:number?, discount_amount:number?, vat_amount:number?, total_amount:number?, amount_in_word:string?, payment_mode:string?, payment_reason:string?, payment_channel:string?}} `parsedFields` as an object with field names and values
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

    const names = ['የከፋይስም/payername', 'የከፋይቴሌብርቁ./payertelebirrno.', 'የከፋይአካውንትአይነት/payeraccounttype', 'የገንዘብተቀባይስም/creditedpartyname', 'የገንዘብተቀባይቴሌብርቁ./creditedpartyaccountno', 'የክፍያውሁኔታ/transactionstatus', 'የባንክአካውንትቁጥር/bankaccountnumber', 'የክፍያቁጥር/receiptno.', 'የክፍያቀን/paymentdate', 'የተከፈለውመጠን/settledamount', 'ቅናሽ/discountamount', '15%ቫት/vat', 'ጠቅላላየተክፈለ/totalamountpaid', 'የገንዘቡልክበፊደል/totalamountinword', 'የክፍያዘዴ/paymentmode', 'የክፍያምክንያት/paymentreason', 'የክፍያመንገድ/paymentchannel']
    const keys = ['payer_name', 'payer_phone', 'payer_acc_type', 'credited_party_name', 'credited_party_acc_no', 'transaction_status', 'bank_acc_no', 'receiptNo', 'date', 'settled_amount', 'discount_amount', 'vat_amount', 'total_amount', 'amount_in_word', 'payment_mode', 'payment_reason', 'payment_channel']

    td.forEach((value, index) => {
        let s = htmlparser.DomUtils.textContent(value).replace(/[\n\r\s\t]/ig, '').trim().toLowerCase();

        const indexOf = names.indexOf(s)
        if (indexOf >= 0) {
            let nextValue = getNextValue(index + (indexOf > 6 && indexOf <= 9 ? 2 : 0));
            let key = keys[indexOf];

            if (key === 'bank_acc_no') {
                fields['to'] = nextValue.replace(/^[0-9]+/g, '').trim()
                fields[key] = nextValue.replace(/[A-Z]/ig, '').trim()
            } else if (key.endsWith('amount')) {
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
 * @param {string} [receiptNo] Receipt number received from telebirr SMS, high priority
 * @param {string} [fullUrl] Or full receipt url, less prior
 * @return {Promise<String>} HTML string
 */
function loadReceipt({receiptNo, fullUrl}) {
    return new Promise((resolve, reject) => {
        const url = receiptNo ? `https://transactioninfo.ethiotelecom.et/receipt/${receiptNo}` : fullUrl

        const https = require('https');
        const options = new URL(url)

        let data = ''
        const req = https.request(options, (res) => {
            res.on('data', (chunk) => {
                data += chunk
            })

            res.on('error', (error) => {
                reject(error)
            })

            res.on('end', () => {
                resolve(data)
            })
        })
        req.on('error', (error) => {
            reject(error)
        })
        req.end()
    })
}

module.exports = {receipt, utils: {parseFromHTML, loadReceipt}}