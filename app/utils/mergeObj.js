/**
 * 对象深度合并方法
 * @author yinjie
 * @date 2017-1-11
 */
/*
 * 自有属性判断
 * 写晚了，后的有些还是直接用 hasOwnProperty
 */
function hasOwnProp(a, b) {
    return Object.prototype.hasOwnProperty.call(a, b);
}
/*
 * 是否是对象的判断
 */
function isObject(input) {
    return input != null && Object.prototype.toString.call(input) === '[object Object]';
}
/**
 * 属性扩展方法
 */
function extend(a, b) {
    for (var i in b) {
        if (hasOwnProp(b, i)) {
            a[i] = b[i];
        }
    }

    if (hasOwnProp(b, 'toString')) {
        a.toString = b.toString;
    }

    if (hasOwnProp(b, 'valueOf')) {
        a.valueOf = b.valueOf;
    }
    return a;
}

/**
 * 深度合并对象的方法
 */
function mergeObj(parentConfig, childConfig) {
    var res = extend({}, parentConfig), prop;
    for (prop in childConfig) {
        if (childConfig.hasOwnProperty(prop)) {
            if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                res[prop] = mergeObj(parentConfig[prop], childConfig[prop]);
            } else if (childConfig[prop] != null) {
                res[prop] = childConfig[prop];
            } else {
                delete res[prop];
            }
        }
    }
    for (prop in parentConfig) {
        if (parentConfig.hasOwnProperty(prop) && !childConfig.hasOwnProperty(prop) && isObject(parentConfig[prop])) {
            res[prop] = extend({}, res[prop]);
        }
    }
    return res;
}

module.exports = mergeObj;

// test
// console.log(mergeConfigs({aaa: 111, ccc: {abc: 123, def: 456, xxx: {xyz: 890}}}, {bbb: 222, ccc: {abc: 890, xxx: {xyz: 891}}}))