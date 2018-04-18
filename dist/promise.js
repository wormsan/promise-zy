(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Promise"] = factory();
	else
		root["Promise"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * @Author: zhaoye 
 * @Date: 2018-04-17 19:02:17 
 * @Last Modified by: zhaoye
 * @Last Modified time: 2018-04-18 21:20:30
 * A simple implementation of Promise/A+
 */

// for test
var dontThrow = false;

// specification
// https://promisesaplus.com/#point-56
// 中文：https://segmentfault.com/a/1190000002452115
/**
 * 判断一个参数是不是thenable
 * @param {any} x 
 */
function isThenable(x) {
    if (typeof x == 'function' || (typeof x === 'undefined' ? 'undefined' : _typeof(x)) == 'object' && x != null) {
        // TODO: 2.3.3.1 将 then 赋为 x.then. [3.5]
        // 这条没看懂，不知道实现了没
        try {
            var then = x.then;
            if (then && typeof then == 'function') {
                return {
                    throwed: false,
                    then: then
                };
            }
        } catch (e) {
            return {
                throwed: true,
                then: e
            };
        }
    }
    return {
        throwed: false,
        then: null
    };
}
/**
 * 报错
 * @param {*} reason 
 */
function uncaughtError(r) {
    return new Error('Uncaught (in promise) ' + r);
}
/**
 * Promise/A+ 实现
 */

var Promise = function () {
    /**
     * 构造函数
     * @param {function} function(resolve, reject) {}
     */
    function Promise(cb) {
        var _this2 = this;

        _classCallCheck(this, Promise);

        if (typeof cb != 'function') throw new Error('need 1 argument and it should be a function');
        this._decideLock = 'locked';
        this._retrivers = [];
        // 私有数据，防止被误用或篡改
        var __statusTrigger = false;
        var __valueTrigger = false;
        var __PromiseStatus = 'pending';
        var __PromiseValue = void 0;
        Object.defineProperties(this, {
            _PromiseStatus: {
                get: function get() {
                    return __PromiseStatus;
                },
                set: function set(value) {
                    var _this = this;

                    // you are doing an unilegal set, please use _decide fn
                    if (this._decideLock == 'locked') return false;
                    // 2.1
                    /*  
                        一个Promise必须处在其中之一的状态：pending, fulfilled 或 rejected.
                          如果是pending状态,则promise：
                          可以转换到fulfilled或rejected状态。
                        如果是fulfilled状态,则promise：
                          不能转换成任何其它状态。
                        必须有一个值，且这个值不能被改变。
                        如果是rejected状态,则promise可以：
                          不能转换成任何其它状态。
                        必须有一个原因，且这个值不能被改变。
                        ”值不能被改变”指的是其identity不能被改变，而不是指其成员内容不能被改变。
                    */
                    // 2.2.2 如果onFulfilled是一个函数:
                    /*
                        它必须在promise fulfilled后调用， 且promise的value为其第一个参数。
                        它不能在promise fulfilled前调用。
                        不能被多次调用。
                    */
                    // 2.2.3 如果onRejected是一个函数,
                    /*
                        它必须在promise rejected后调用， 且promise的reason为其第一个参数。
                        它不能在promise rejected前调用。
                        不能被多次调用。
                    */
                    // the promise status cannot be set again
                    if (__statusTrigger) {
                        return false;
                    }
                    if (__PromiseStatus == 'pending' && value != 'pending') {
                        __statusTrigger = true;
                        __PromiseStatus = value;

                        if (this._retrivers.length == 0 && this._PromiseStatus == 'rejected') {
                            if (!dontThrow) {
                                throw uncaughtError(this._PromiseValue);
                            }
                        }
                        setTimeout(function () {
                            _this._onStatusChange(value);
                        });
                    }
                }
            },
            _PromiseValue: {
                get: function get() {
                    return __PromiseValue;
                },
                set: function set(value) {
                    // you are doing an unilegal set, please use _decide fn
                    if (this._decideLock == 'locked') return false;
                    // 2.1
                    if (__valueTrigger) {
                        // the promise value cannot be set again
                        return false;
                    }
                    __valueTrigger = true;
                    __PromiseValue = value;
                }
            }
        });
        var resolve = function resolve(arg) {
            _this2._decide('fufilled', arg);
        };
        var reject = function reject(arg) {
            _this2._decide('rejected', arg);
        };
        try {
            cb(resolve, reject);
        } catch (e) {
            setTimeout(function () {
                _this2._decide('rejected', e);
            });
        }
    }
    /**
     * promise的状态和value的变更，必须一起进行
     * 所以封装decide方法，并且配合一个锁，防止状态和value被decide方法之外的其他方法修改
     * @param {string} status 
     * @param {*} value 
     */


    _createClass(Promise, [{
        key: '_decide',
        value: function _decide(status, value) {
            this._decideLock = 'unlock';
            this._PromiseValue = value;
            this._PromiseStatus = status;
            this._decideLock = 'locked';
        }
        /**
         * 当promise实例的状态被决定（settled），触发此事件
         * @param {string} status 
         */

    }, {
        key: '_onStatusChange',
        value: function _onStatusChange(status) {
            // 释放之前pending状态时的取值器
            // 2.2.6 对于一个promise，它的then方法可以调用多次.
            //  当promise fulfilled后，所有onFulfilled都必须按照其注册顺序执行。
            //  当promise rejected后，所有onRejected都必须按照其注册顺序执行。
            while (this._retrivers.length > 0) {
                var retriver = this._retrivers.shift();
                try {
                    var x = void 0;
                    if (status == 'fufilled') {
                        if (!retriver.onFufilled) {
                            // 2.2.7.3 如果 onFulfilled 不是一个函数且promise1已经fulfilled，则promise2必须以promise1的值fulfilled.
                            x = this._PromiseValue;
                        } else {
                            // 2.2.7.1 如果onFulfilled 或 onRejected 返回了值x, 则执行Promise 解析流程[[Resolve]](promise2, x).
                            // 2.2.5 onFulfilled 和 onRejected 必须被当做函数调用 (i.e. 即函数体内的 this 为undefined). [3.2]
                            x = retriver.onFufilled.call(undefined, this._PromiseValue);
                        }
                    } else if (status == 'rejected') {
                        if (!retriver.onRejected) {
                            // 2.2.7.4 如果 onRejected 不是一个函数且promise1已经rejected, 则promise2必须以相同的reason被拒绝.
                            if (this._PromiseValue instanceof Error) {
                                throw this._PromiseValue;
                            } else {
                                this._reject(retriver.promise2, this._PromiseValue);
                                continue;
                            }
                        } else {
                            // 2.2.7.1 如果onFulfilled 或 onRejected 返回了值x, 则执行Promise 解析流程[[Resolve]](promise2, x).
                            // 2.2.5 onFulfilled 和 onRejected 必须被当做函数调用 (i.e. 即函数体内的 this 为undefined). [3.2]
                            x = retriver.onRejected.call(undefined, this._PromiseValue);
                        }
                    }
                    this._resolve(retriver.promise2, x);
                } catch (e) {
                    // 2.2.7.2 如果onFulfilled 或 onRejected抛出了异常e, 则promise2应当以e为reason被拒绝。
                    this._reject(retriver.promise2, e);
                }
            }
        }
        /**
         * 2.3 [[Resolve]](promise, x)
         * 
         * @param {*} promise2 then函数返回的那个promise实例
         * @param {*} x 当前的promise实例的执行的结果
         */

    }, {
        key: '_resolve',
        value: function _resolve(promise2, x) {
            var _this3 = this;

            var _isThenable = isThenable(x),
                throwed = _isThenable.throwed,
                then = _isThenable.then;

            if (throwed) {
                throw then;
            }
            // 2.3.1 如果promise 和 x 指向相同的值, 使用 TypeError做为原因将promise拒绝
            if (promise2 == x) {
                this._reject(promise2, new TypeError('as [[Resolve]](promise, x) defined, promise === x is wrong'));
            }
            // 2.3.2 如果 x 是一个promise, 采用其状态 [3.4]:
            if (x instanceof Promise) {
                // 2.3.2.1 如果x是pending状态，promise必须保持pending走到x fulfilled或rejected.
                if (x._PromiseStatus == 'pending') {
                    // promise2 wait until x is not pending
                    // and trigger promise2 status
                    // 为了通过测试用例，各种倒状态
                    x.then(function (x) {
                        var _isThenable2 = isThenable(x),
                            throwed = _isThenable2.throwed,
                            then = _isThenable2.then;

                        if (throwed) {
                            promise2._decide('rejected', then);
                        } else if (then) {
                            try {
                                then.call(x, function (y) {
                                    promise2._decide('fufilled', y);
                                }, function (r) {
                                    promise2._decide('rejected', r);
                                });
                            } catch (e) {
                                promise2._decide('rejected', e);
                            }
                        } else {
                            promise2._decide('fufilled', x);
                        }
                    }, function (r) {
                        promise2._decide('rejected', r);
                    });
                    // 2.3.2.2 如果x是fulfilled状态，将x的值用于fulfill promise
                } else if (x._PromiseStatus == 'fufilled') {
                    // // 递归去解决吧=。=
                    this._resolve(promise2, x._PromiseValue);
                    // 2.3.2.3 如果x是rejected状态, 将x的原因用于reject promise
                } else if (x._PromiseStatus == 'rejected') {
                    // 递归去解决吧=。=
                    if (x._PromiseValue instanceof Promise) {
                        this._resolve(promise2, x._PromiseValue);
                    } else {
                        promise2._decide('rejected', x._PromiseValue);
                    }
                }
                // 2.3.3 如果x是一个对象或一个函数
            } else if (then) {
                // 2.3.3.3 如果 then 是一个函数， 以x为this调用then函数， 且第一个参数是resolvePromise，第二个参数是rejectPromise，且：
                // 2.3.3.3.1 当 resolvePromise 被以 y为参数调用, 执行 [[Resolve]](promise, y)
                var onceTrigger = false;
                var resolvePromise = function resolvePromise(y) {
                    // 2.3.3.3.3 如果 resolvePromise 和 rejectPromise 都被调用了，或者被调用了多次，则只第一次有效，后面的忽略。
                    if (!onceTrigger) {
                        onceTrigger = true;
                        // [[Resolve]] (promise, y)
                        try {
                            _this3._resolve(promise2, y);
                        } catch (e) {
                            _this3._reject(promise2, e);
                        }
                    }
                };
                // 2.3.3.3.2 当 rejectPromise 被以 r 为参数调用, 则以r为原因将promise拒绝
                var rejectPromise = function rejectPromise(r) {
                    // 2.3.3.3.3 当 如果 resolvePromise 和 rejectPromise 都被调用了，或者被调用了多次，则只第一次有效，后面的忽略。
                    if (!onceTrigger) {
                        onceTrigger = true;
                        _this3._reject(promise2, r);
                    }
                };
                // 2.3.3.3.4 如果在调用then时抛出了异常，则：
                try {
                    then.call(x, resolvePromise, rejectPromise);
                } catch (e) {
                    // 如果 resolvePromise 或 rejectPromise 已经被调用了，则忽略它。
                    if (!onceTrigger) {
                        // 否则, 以e为reason将 promise 拒绝。
                        // 2.3.3.2 如果在取x.then值时抛出了异常，则以这个异常做为原因将promise拒绝。
                        this._reject(promise2, e);
                    }
                }
                // 2.3.3.4 如果 then不是一个函数，则 以x为值fulfill promise
                // 2.3.4 如果 x 不是对象也不是函数，则以x为值 fulfill promise
            } else {
                promise2._decide('fufilled', x);
            }
        }
        /**
         * 
         * @param {*} promise2 then函数返回的那个promise实例
         * @param {*} r 当前的promise实例的失败的原因
         */

    }, {
        key: '_reject',
        value: function _reject(promise2, r) {
            promise2._decide('rejected', r);
        }
        /**
         * promise实例的取值器
         * @param {*} onFufilled 如果promise实例是fufilled状态，执行onFufilled回调
         * @param {*} onRejected 如果promise实例是rejected状态，执行onRejected回调
         */

    }, {
        key: 'then',
        value: function then(onFufilled, onRejected) {
            var _this4 = this;

            // 2.2.1.1
            if (typeof onFufilled != 'function') {
                onFufilled = null;
            }
            // 2.2.1.2
            if (typeof onRejected != 'function') {
                onRejected = null;
            }
            var promise2 = new Promise(function () {});
            // 装弹填充取值器
            this._retrivers.push({
                onFufilled: onFufilled,
                onRejected: onRejected,
                promise2: promise2
            });
            // 2.2.4 onFulfilled 和 onRejected 只允许在 execution context 栈仅包含平台代码时运行. [3.1].
            setTimeout(function () {
                // 如果已经不是pending的状态了，立即执行取值器的逻辑
                if (_this4._PromiseStatus != 'pending') {
                    _this4._onStatusChange(_this4._PromiseStatus);
                }
            });
            return promise2;
        }
        /**
         * promise实例的取值器，只取失败的值，忽略成功的值
         * @param {*} onRejected 如果promise实例是rejected状态，执行onRejected回调
         */

    }, {
        key: 'catch',
        value: function _catch(onRejected) {
            return this.then(null, onRejected);
        }
    }]);

    return Promise;
}();

// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
// Promise.all(iterable) 方法返回一个 Promise 实例
// 此实例在 iterable 参数内所有的 promise 都“完成（resolved）”或参数中不包含 promise 时回调完成（resolve）；
// 如果参数中  promise 有一个失败（rejected），此实例回调失败（rejecte），失败原因的是第一个失败 promise 的结果。
// in this implementation, it only supports array map set
// *fully tested whit the suites in MDN demo


Promise.all = function () {
    var iterable = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    if (!iterable) throw new Error('no argument');
    if (iterable instanceof Array || iterable instanceof Map || iterable instanceof Set) {} else throw new TypeError('arg type wrong');
    return new Promise(function (resolve, reject) {
        var results = [];
        var failed = false;
        var failReason = void 0;
        if (iterable.length == 0) resolve(iterable);
        iterable.forEach(function (item, index) {
            Promise.resolve(item).then(function (value) {
                if (failed) return;
                results.push({
                    index: index,
                    value: value
                });
                if (results.length == iterable.length) {
                    resolve(results.sort(function (a, b) {
                        return a.index > b.index;
                    }).reduce(function (prev, cur) {
                        prev.push(cur.value);
                        return prev;
                    }, []));
                }
            }, function (reason) {
                // 防止重复发生
                if (!failed) {
                    failed = true;
                    reject(reason);
                }
            });
        });
    });
};
// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/race
// Promise.race(iterable) 方法返回一个 promise 
// 并伴随着 promise对象解决的返回值或拒绝的错误原因, 只要 iterable 中有一个 promise 对象"解决(resolve)"或"拒绝(reject)"。
// in this implementation, it only supports array map set
// *fully tested whit the suites in MDN demo
Promise.race = function (iterable) {
    if (!iterable) throw new Error('no argument');
    if (iterable instanceof Array || iterable instanceof Map || iterable instanceof Set) {} else throw new TypeError('arg type wrong');
    return new Promise(function (resolve, reject) {
        var winner = void 0;
        if (iterable.length == 0) resolve(iterable);
        iterable.forEach(function (item, index) {
            Promise.resolve(item).then(function (value) {
                if (!winner) {
                    winner = value;
                    resolve(winner);
                }
            }, function (reason) {
                if (!winner) {
                    winner = reason;
                    reject(winner);
                }
            });
        });
    });
};
// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve
// Promise.resolve(value)方法返回一个以给定值解析后的Promise对象。
// 但如果这个值是个thenable（即带有then方法），返回的promise会“跟随”这个thenable的对象，
// 采用它的最终状态（指resolved/rejected/pending/settled）；如果传入的value本身就是promise对象，
// 则该对象作为Promise.resolve方法的返回值返回；否则以该值为成功状态返回promise对象。
// *fully tested whit the suites in MDN demo
Promise.resolve = function (x) {
    var _isThenable3 = isThenable(x),
        throwed = _isThenable3.throwed,
        then = _isThenable3.then;

    if (throwed) {
        return new Promise(function (resolve, reject) {
            reject(then);
        });
    }
    if (x instanceof Promise) {
        return x;
    } else if (then) {
        return new Promise(function (resolve, reject) {
            try {
                then.call(x, function (y) {
                    resolve(y);
                }, function (r) {
                    reject(r);
                });
            } catch (e) {
                reject(e);
            }
        });
    } else {
        return new Promise(function (resolve, reject) {
            resolve(x);
        });
    }
};
// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject
// Promise.reject(reason)方法返回一个用reason拒绝的Promise。
// *fully tested whit the suites in MDN demo
Promise.reject = function (reason) {
    return new Promise(function (resolve, reject) {
        reject(reason);
    });
};
// for test
Promise.dontThrow = function () {
    dontThrow = true;
};

module.exports = Promise;

/***/ })
/******/ ]);
});