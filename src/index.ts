// #!/usr/bin/env node


// import { Client, Config, Options } from 'rx-node-ftp-client';

import * as upath from 'upath';
import {switchMap, switchMapTo} from 'rxjs/operators';
import {FtpService} from "./service/ftp.service";

declare function require(name: string);
declare const process: {argv: any};


const OS = require('os');
const FS = require('fs');
const ARGS = require('minimist')(process.argv.slice(2)); // library to parse command line arguments

const DEFAULT_CONFIG_FILE_NAME = 'autobackup.conf';
const DEFAULT_CONFIG_FILE_PATH = OS.homedir() + '/' + DEFAULT_CONFIG_FILE_NAME;
const DEFAULT_CONFIG_FILE_EXISTS = FS.existsSync(DEFAULT_CONFIG_FILE_PATH);

console.log(OS.constructor.name);


const Ftp = require( 'ftp' );
const ftpClient = new Ftp(); // library's ftp client needs to be initialized like this, don't ask me why


const ftpService = new FtpService(ftpClient, FS);


// ftpService
//     .connect('ftp.byethost32.com', 'b32_28736452', '23hjSJD45')
//     .pipe(switchMap(() => ftpService.download('/htdocs/mytest.txt', '/Users/stoldo/git/M122_AP18c_AutoBackup_Toldo_Severin/src/copydddd.txt')))
//     .subscribe(res2 => {
//         console.log('download success! ', res2);
//     }, error => {
//         console.log('download error! ', error);
//     });




// ftpService
//     .connect('ftp.byethost32.com', 'b32_28736452', '23hjSJD45')
//     .pipe(switchMap(() => ftpService.upload('/Users/stoldo/git/M122_AP18c_AutoBackup_Toldo_Severin/src/test.txt', '/htdocs/mytest22233332.txt')))
//     .subscribe(res2 => {
//         console.log('upload success! ', res2);
//     }, error => {
//         console.log('upload error! ', error);
//     });


























// console.log(ARGS['name']);

// readFile(DEFAULT_CONFIG_FILE_PATH, data => console.log(data));






// errno: -13,
//     code: 'EACCES',
//     syscall: 'open',
//     path: '/Users/stoldo/autobackup.conf'


// FS.readFile('/Users/stoldo/git/M122_AP18c_AutoBackup_Toldo_Severin/src/test.txt', 'utf8', function (err, data) {
//     if (err) throw err;
//     console.log(data)
// });

// function readFile(path: string, callbackFn: (data: any) => void): void {
//     FS.readFile(path, 'utf8', (error, data) => {
//         if (error) {
//             throw error;
//         }
//
//         callbackFn.call(null, data);
//     });
// }





//
// console.log(os.homedir() + '/' + DEFAULT_CONFIG_FILE_NAME);
//
//
//
// readFile(
//     os.homedir() + '/' + DEFAULT_CONFIG_FILE_NAME,
//     data => {
//         console.log('data: ', data);
//     },
//     error => {
//         console.log('error: ', error);
//     }
// );
//
//
//
// function readFile(path: string, onSuccessCallbackFn: (data: any) => void, onErrorCallbackFn: (error: any) => void): void {
//     fs.readFile(path, 'utf8', (error, data) => {
//         if (error) {
//             console.log(error);
//             onErrorCallbackFn.apply(error);
//         } else {
//             onErrorCallbackFn.apply(data);
//         }
//     });
// }

// export const DEFUALT_CONFIG_FILE_PATH = '';



// var fs = require('fs');
// var obj;



// var sudo = require('sudo-prompt');
// var options = {
//     name: 'Electron',
// };
// sudo.exec('echo hello', options,
//     function(error, stdout, stderr) {
//         // if (error) throw error;
//         console.log('error: ', error);
//         console.log('stdout: ' + stdout);
//         console.log('stderr: ' + stdout);
//     }
// );
