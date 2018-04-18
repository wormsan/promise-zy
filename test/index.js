/*
 * @Author: zhaoye 
 * @Date: 2018-04-17 19:49:30 
 * @Last Modified by: zhaoye
 * @Last Modified time: 2018-04-18 21:06:44
 */
const Promise = require('../index.js')
Promise.dontThrow()
var promisesAplusTests = require("promises-aplus-tests");
const adapter = {
    deferred: function() {
        const promise = new Promise(function(){})
        return {
            promise,
            resolve: function (x) {
                try {
                    promise._decide('fufilled', x)
                } catch (e) {
                    console.log(e)
                }
            },
            reject: function (r) {
                try {
                    promise._decide('rejected', r)
                } catch (e) {
                    console.log(e)
                }
            },
        }
    }
}
promisesAplusTests(adapter, function (err) {
    // console.log(err)
    // All done; output is in the console. Or check `err` for number of failures.
});