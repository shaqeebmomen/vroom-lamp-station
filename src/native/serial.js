import SerialPort from 'serialport';
import Logger from '../helpers/logger.js'
const isDevelopment = process.env.NODE_ENV !== 'production'

export default class {

    constructor() {
        // Port object
        this.port = undefined;
        // Serial Tester info
        this.testVID = '10C4';
        this.testPID = 'EA60';
        this.testSerialNum = '0001';

        // Lamp info
        this.lampVID = '1A86';
        this.lampPID = '7523';
        this.serialNum = '5&30920091&0&5';

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
                        return (device.serialNumber === this.serialNum || device.serialNumber === this.testSerialNum) && (device.vendorId === this.lampVID || device.vendorId === this.testVID) && (device.productId === this.lampPID || device.productId === this.testPID);
                    }
                    else {
                        return device.serialNumber === this.serialNum && device.vendorId === this.lampVID && device.productId === this.lampPID;
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
                baudRate: 9600,
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

            this.port.on('close', (err) => {
                if (err && err.disconnected) log.logInfo('PORT_DISCONNECT', err, 'Port Event/')
                else log.logInfo('PORT_CLOSE', err || null, 'Port Event/')
            })

            resolve();
        })// Promise end
    } // end connect()



    /**
     * Opens port, writes to device, drains (blocking) and closes
     * @param {Buffer} outputBuff buffer to write
     * @returns promise indicating when done
     */
    writeToDevice(outputBuff) {
        const log = new Logger('writeToDevice()', isDevelopment);
        return new Promise(async (resolve, reject) => {

            // Open Port
            this.port.open((err) => {
                if (err) {
                    log.logErr('open()', err);
                    reject({ error: err, errorMsg: 'OPEN_ERR' });
                }
            }); // end open()
            // Send data
            this.port.write(outputBuff, (err) => {
                if (err) {
                    log.logErr('write()', err);
                    reject({ error: err, errorMsg: 'WRITE_ERR' });
                }
            }); // end write()
            // Drain
            this.port.drain((err) => {
                if (err) {
                    log.logErr('drain()', err);
                    reject({ error: err, errorMsg: 'OPEN_ERR' });
                }
                this.port.close((err) => {
                    if (err) {
                        log.logErr('close()', err);
                        reject({ error: err, errorMsg: 'CLOSE_ERR' });
                    }
                    resolve(); // Resolve promise when drain has completed and port is closed
                }); // end close()
            }); // end drain()
        });
    } // end writeToDevice()
}
