
/**
 * 将数据里的 webp 换成 jpg
 * @param {any} data
 * @returns
 */
function webpToJpg(data) {
    if(!data){
        return;
    }
    if(typeof data === 'string'){
        return data ?data.replace(/\.webp/ig,'.jpg') : '';
    }else{
        const dataStr = JSON.stringify(data);
        return JSON.parse(dataStr.replace(/\.webp/ig,'.jpg'));
    }
}

/**
 * 时效格式化方法
 * eg dateFormat(new Date(), '%Y-%m-%d %H:%M:%S')
 * @param {any} date
 * @param {any} fstr
 * @param {any} utc
 * @returns
 */
function dateFormat(date, fstr, utc) {
    utc = utc ? 'getUTC' : 'get';
    return fstr.replace(/%[YmdHMS]/g, function (m) {
        switch (m) {
        case '%Y':
            return date[utc + 'FullYear']();
        case '%m':
            m = 1 + date[utc + 'Month']();
            break;
        case '%d':
            m = date[utc + 'Date']();
            break;
        case '%H':
            m = date[utc + 'Hours']();
            break;
        case '%M':
            m = date[utc + 'Minutes']();
            break;
        case '%S':
            m = date[utc + 'Seconds']();
            break;
        default:
            return m.slice(1);
        }
        return ('0' + m).slice(-2);
    });
}

/**
 * 获取相对某日的日期
 * @param date 基准日期
 * @n 相对几天，可以是负数
 */
function addDate (date, n) {
    let _dateTs = date.getTime(),
        _date = new Date(_dateTs + n * (24 * 3600 * 1000));
    return _date;
};

module.exports = {
    webpToJpg: webpToJpg,
    dateFormat: dateFormat,
    addDate: addDate,
};