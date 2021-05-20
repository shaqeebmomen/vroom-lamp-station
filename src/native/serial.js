import SerialPort from 'serialport';
import ByteLength from '@serialport/parser-byte-length';
import Readline from '@serialport/parser-readline';
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
            },
            // Serial Tester info
            {
                vid: '10C4',
                pid: 'EA60',
            },

            // Monitor
            {
                vid: '2A03',
                pid: '0043',
            }
        ]
    }

    // Searches for lamp among connected devices
    async connect() {
        const log = new Logger('connect()', isDevelopment);
        log.subTAG = 'listing';
        // List devices connected and check if lamp is listed
        let device;
        try {
            device = (await SerialPort.list()).find((device) => {
                if (isDevelopment) {
                    return this.allowedDevices.find((allowedDevice) => {
                        return allowedDevice.vid === device.vendorId && allowedDevice.pid === device.productId;
                    })
                }
                else {
                    return device.vendorId === this.allowedDevices[0].vid && device.productId === this.allowedDevices[0].pid;
                }
            })
        } catch (error) {
            log.logErr('LIST_ERR', error);
            throw { error, errorMsg: 'LIST_ERR' };
        }
        // if device not found
        if (device === undefined) {
            log.logErr('NO_DEVICE');
            // win.webContents.send(ipcChannels.getToRenderChannel(ipcChannels.upload), { error: 'NO_DEVICE' });
            throw { errorMsg: 'NO_DEVICE' };
        }
        log.logInfo('Device Found', device);
        log.subTAG = 'port';
        // Open port
        this.port = new SerialPort(device.path, {
            baudRate: 115200,
            autoOpen: false,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
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

        // Sniffing Serial port
        if (isDevelopment) this.port.on('data', console.log);
    } // end connect()


    // Open
    open() {
        const log = new Logger('open()', isDevelopment);
        return new Promise((resolve, reject) => {
            // Open Port
            if (!this.port.isOpen) {
                this.port.open(async (err) => {
                    if (err) {
                        log.logErr('', err);
                        reject({ error: err, errorMsg: 'OPEN_ERR' })
                    } else {
                        resolve();
                    }
                })
            }
            else {
                resolve();
            }
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
     * 
     * @param {Buffer} outputBuff buffer to write
     */
    write(outputBuff, timeout) {
        const log = new Logger('write()', isDevelopment);
        if (this.port.isOpen) {
            return misc.executeWithTimeout(new Promise((resolve, reject) => {
                this.port.write(outputBuff, (err) => {
                    if (err) {
                        log.logErr('', err);
                        reject({ error: err, errorMsg: 'WRITE_ERR' });
                    }
                    log.logInfo('Wrote', outputBuff);
                    resolve();
                })
            }), timeout, new Error('write failed'));
        }
        else {
            throw new Error('port not open');
        }
    }

    async writeACK(valid, timeout = 2000) {
        const log = new Logger('writeACK()', isDevelopment);
        const response = Buffer.alloc(1);
        if (valid) {
            // Write back confirmation to mcu
            response.writeUInt8(255);
            log.logInfo('Sent ACK', response);
            await this.write(response, timeout);
        }
        else {
            await this.write(response, timeout);
            throw new Error('ack failed')
        }
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
            await this.write(outputBuff, 2000);
            // drain and check response
            log.subTAG = 'read';
            let readParser;
            try {
                const validate = await misc.executeWithTimeout(new Promise((resolve, reject) => {
                    // Create parser callback
                    log.logInfo('expectedLength', outputBuff.byteLength);

                    readParser = this.port.pipe(new ByteLength({ length: outputBuff.byteLength }))
                    readParser.on('data', (data) => {
                        log.logInfo('received:', data);
                        const check = outputBuff.compare(data) === 0;
                        log.logInfo('check result: ', check ? 'true' : 'false');
                        resolve(check);
                    });
                }), 2000, new Error('Timeout Triggered'));
                log.logInfo('parser destroyed');
                readParser.destroy();
                await this.writeACK(validate);
                log.subTAG = 'final check';
                log.logInfo('');
                await this.waitForString("Done", 1000);
            } catch (error) {
                log.logInfo('parser destroyed');
                readParser.destroy();
                throw error;
            } // end read trycatch
        }
        // Port isnt open
        else {
            throw Error('port not open');
        }
    } // end writeAndCheck()


    /**
     * Wait for a specific number of bytes to come in
     * @param {Number} byteCount number of bytes to wait for
     * @param {Number} timeout timeout to wait for cancellation
     */
    async waitForBytes(byteCount, timeout = 2000) {
        const log = new Logger('waitForBytes()');
        let readParser;
        try {
            const data = await misc.executeWithTimeout(new Promise((resolve, reject) => {
                readParser = this.port.pipe(new ByteLength({ length: byteCount }));
                readParser.on('data', (data) => {
                    log.logInfo('received response', data);
                    // Pass data to calling scope
                    resolve(data);
                })
            }), timeout, new Error('Timeout Triggered'));
            return new Promise((resolve, reject) => {
                log.logInfo('wait success');
                log.logInfo('parser destroyed');
                readParser.destroy();
                resolve(data);
            })
        } catch (error) {
            log.logErr('wait fail');
            log.logInfo('parser destroyed');
            readParser.destroy();
            throw error;
        }

    }

    /**
     * Wait for a specific string from MCU, terminated by a '\n'
     * @param {String} validString string to look for
     */
    async waitForString(validString, timeout) {
        const log = new Logger('waitForString()', isDevelopment);
        let readParser;
        try {
            await misc.executeWithTimeout(new Promise((resolve, reject) => {
                readParser = this.port.pipe(new Readline({ delimiter: '\r\n' }));
                readParser.on('data', (data) => {
                    log.logInfo('received response', data);
                    if (validString.localeCompare(data) == 0) {
                        // String is good, mcu is ready
                        resolve();
                    }
                    else {
                        reject({ errorMsg: 'HANDSHAKE_ERR' });
                    }
                })
            }), timeout, new Error('Timeout Triggered'))
            return new Promise((resolve, reject) => {
                log.logInfo('wait success');
                log.logInfo('parser destroyed');

                readParser.destroy();
                resolve();
            })
        } catch (error) {
            log.logErr('wait fail ', error)
            log.logInfo('parser destroyed');
            readParser.destroy();
            throw error;
        }
    }
    /** 
     * Sends a code to the lamp, declaring intent and waits for lamp to send a ready string
     * @param {String} intentCode  code for lamp to inteperate intent
     * '[1-6]' -> animation to update 
     * 'r' -> request for stored animations 
     */
    async handshake(intentCode, acceptString) {
        const log = new Logger('handshake()', isDevelopment);
        if (this.port.isOpen) {
            log.subTAG = 'writing';
            // Write Promise
            await new Promise((resolve, reject) => {
                // Send intent code
                this.port.write(intentCode + '-', (err) => {
                    if (err) {
                        log.logErr('write', err);
                        reject({ error: err, errorMsg: 'WRITE_ERR' });
                    }
                    log.logInfo('Wrote: ', intentCode + '-');
                    resolve();
                })
            }) // end write promise
            log.subTAG = 'reading';
            // wait for handshake
            log.logInfo('reading for: ', acceptString);
            return this.waitForString(acceptString, 3000);
        }
        else {
            throw Error('port not open');
        }
    } // end handshake()


}
