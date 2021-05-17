
export default class {
    constructor(mainTag, isEnabled) {
        this.MainTag = mainTag;
        this.subTAG = ''
        this.isEnabled = isEnabled;
    }
    logErr(msg, data = null, tagOverride = null) {
        if (this.isEnabled) console.error('ERR/' + (tagOverride == null ? this.MainTag : tagOverride) + '/' + this.subTAG + ': ' + msg, data || '');
    }
    logInfo(msg, data = null, tagOverride = null) {
        if (this.isEnabled) console.info('INFO/' + (tagOverride == null ? this.MainTag : tagOverride) + '/' + this.subTAG + ': ' + msg, data || '');
    }
}
