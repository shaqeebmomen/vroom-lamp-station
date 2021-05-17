import SerialPort from 'serialport';
import ByteLength from '@serialport/parser-byte-length';
import Logger from '../helpers/logger.js'
const isDevelopment = process.env.NODE_ENV !== 'production'
import misc from '../helpers/misc.js'

export default class {

    constructor() {
        // Port object
        this.port = undefined;
        this.allowedDevices = [
            // Lamp info
            {
                vid: '1A86',
                pid: '7523',
                serialNum: '5&30920091&0&5'
            },
            // Serial Tester info
            {
                vid: '10C4',
                pid: 'EA60',
                serialNum: '0001',

            },

            // Monitor
            {
                vid: '2A03',
                pid: '0043',
                serialNum: '55632313838351215180',
            }
        ]


    }

    // Searches for lamp among connected devices
    connect() {
        const log = new Logger('connect()', isDevelopment);
        log.subTAG = 'listing';
        return new Promise(async (resolve, reject) => {

            // List devices connected and check if lamp is listed
            let device;
            try {
                device = (await SerialPort.list()).find((device) => {
                    if (isDevelopment) {
                        return this.allowedDevices.find((allowedDevice) => {
                            return allowedDevice.vid === device.vendorId && allowedDevice.pid === device.productId && allowedDevice.serialNum === device.serialNumber;
                        })
                    }
                    else {
                        return device.serialNumber === this.allowedDevices[0].serialNum && device.vendorId === this.allowedDevices[0].vid && device.productId === this.allowedDevices[0].pid;
                    }
                })
                log.logInfo('Device Found', device);
            } catch (error) {
                log.logErr('LIST_ERR', error);
                reject({ error, errorMsg: 'LIST_ERR' });
            }

            // if device not found
            if (device === undefined) {
                log.logErr('NO_DEVICE');
                // win.webContents.send(ipcChannels.getToRenderChannel(ipcChannels.upload), { error: 'NO_DEVICE' });
                reject({ errorMsg: 'NO_DEVICE' })
            }

            log.subTAG = 'port';

            // Open port
            this.port = new SerialPort(device.path, {
                baudRate: 19200,
                autoOpen: false,
                dataBits: 8,
                stopBits: 1,
                parity: 'none',
                highWaterMark: 131072
            })

            // Port event listeners
            // Unhandled Errors
            this.port.on('error', (err) => {
                log.logErr('PORT_ERR_EVNT', err, 'Port Event/');
            })

            // Close
            this.port.on('close', (err) => {
                if (err && err.disconnected) log.logInfo('PORT_DISCONNECT', err, 'Port Event/')
                else log.logInfo('PORT_CLOSE', err || null, 'Port Event/')
            })

            // this.port.on('data', console.log);

            resolve();
        })// Promise end
    } // end connect()


    // TODO blow this function up
    // Open
    open() {
        const log = new Logger('open()', isDevelopment);
        return new Promise((resolve, reject) => {
            // Open Port
            this.port.open(async (err) => {
                if (err) {
                    log.logErr('', err);
                    reject({ error: err, errorMsg: 'OPEN_ERR' })
                } else {
                    resolve();
                }
            })
        })
    }

    // Close
    close() {
        const log = new Logger('close()', isDevelopment);
        return new Promise((resolve, reject) => {

            this.port.close((err) => {
                if (err) {
                    log.logErr('', err);
                    reject({ error: err, errorMsg: 'CLOSE_ERR' })
                }
                else {
                    resolve();
                }
            })
        })
    }

    /**
     * Writes to serial port and waits for echo back to compare 
     * @param {Buffer} outputBuff buffer to write to port
     */
    async writeAndCheck(outputBuff) {
        const log = new Logger('writeAndCheck()', isDevelopment);
        // Ensure port is open
        if (this.port.isOpen) {
            // Write
            log.subTAG = 'write';
            try {
                await new Promise((resolve, reject) => {
                    this.port.write(outputBuff, (err) => {
                        if (err) {
                            log.logErr('', err);
                            reject({ error: err, errorMsg: 'WRITE_ERR' });
                        }
                        // this.port.drain((err) => {
                        //     if (err) {
                        //         log.logErr('drain', err);
                        //         reject({ error: err, errorMsg: 'DRAIN_ERR' })
                        //     }
                        resolve();
                        // }) // end drain()
                    }) // end write()
                }) // end write promise
            } catch (error) {
                throw error
            } // end write trycatch
            // drain and check response
            log.subTAG = 'read';
            let readParser;
            try {
                this.readBuffer = []
                const promiseRead = new Promise((resolve, reject) => {
                    // Create parser callback
                    log.logInfo('expectedLength', outputBuff.byteLength);
                    readParser = this.port.pipe(new ByteLength({ length: outputBuff.byteLength }))
                    readParser.on('data', (data) => {
                        log.logInfo('received:', data);
                        const check = Buffer.compare(data, outputBuff) === 0;
                        log.logInfo('check result:', check);
                        resolve(check);
                    });
                }) // end read promise

                const promiseTimeout = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        console.log(this.readBuffer.length);
                        reject({ errorMsg: 'Timeout Triggered' })
                    }, 2 * 1000);
                }) // end timeout promise
                const result = await Promise.race([promiseRead, promiseTimeout]);
                readParser.destroy();
                return result;
            } catch (error) {
                readParser.destroy();
                throw error;
            } // end read trycatch
        }
        // Port isnt open
        else {
            throw Error('port not open');
        }
    }
}
