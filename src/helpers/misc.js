export default {
    timeout: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    executeWithTimeout: function(promise,time, error ){
        let timer;
        return Promise.race([
            promise,
            new Promise((resolve,reject) => {timer = setTimeout(reject, time, error)})
        ]).finally(() => {clearTimeout(timer)});
    }

}