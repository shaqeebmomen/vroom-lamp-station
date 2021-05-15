const _channels = ["upload", "download"]
const channels = {}// base names of channels, used by user
const toMainChannels = {};// internal names for channels from main to renderer
const toRenderChannels = {}; // internal names for channels from renderer to main

_channels.forEach(channel => {
    channels[channel] = channel;
    toMainChannels[channel] = 'toMain_' + channel;
    toRenderChannels[channel] = 'toRender' + channel;
});

function getToMainChannel(channel) {
    return toMainChannels[channel];
}

function getToRenderChannel(channel) {
    return toRenderChannels[channel];
}
export default {
    ...channels,
    toMainChannels,
    toRenderChannels,
    getToMainChannel,
    getToRenderChannel,
}