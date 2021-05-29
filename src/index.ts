// #!/usr/bin/env node


import {delay, switchMap} from 'rxjs/operators';
import {FtpService} from "./service/ftp.service";
import {FileService} from "./service/file.service";

declare function require(name: string);
declare const process: {argv: any};

const OS = require('os');
const FS = require('fs');
const ARGS = require('minimist')(process.argv.slice(2)); // library to parse command line arguments
const FTP = require( 'ftp' );
const ARCHIVER = require('archiver');
const MD5 = require('md5');

const ftpService = new FtpService(new FTP(), FS); // new FTP() -> library's ftp client needs to be initialized like this, don't ask me why
const fileService = new FileService(FS, OS, ARCHIVER, MD5);


const DEFAULT_CONFIG_FILE_NAME = 'autobackup.conf';
const DEFAULT_CONFIG_FILE_PATH = OS.homedir() + '/' + DEFAULT_CONFIG_FILE_NAME;
const DEFAULT_CONFIG_FILE_EXISTS = FS.existsSync(DEFAULT_CONFIG_FILE_PATH);




// fileService
//     .zipFile('/Users/stoldo/git/M122_AP18c_AutoBackup_Toldo_Severin/src/test.txt', '/Users/stoldo/git/M122_AP18c_AutoBackup_Toldo_Severin/src/test.zip')
//     .subscribe(res => console.log('res: ', res), error => console.log('EROOOOOOR: ', error));

//     const path = '/Users/stoldo/git/M122_AP18c_AutoBackup_Toldo_Severin/src/test.txt';


// send email with attachment -> MailService


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

// ftpService
//     .connect('ftp.byethost32.com', 'b32_28736452', '23hjSJD45')
//     .pipe(switchMap(() => ftpService.download('/htdocs/mytest.txt', '/Users/stoldo/git/M122_AP18c_AutoBackup_Toldo_Severin/src/new_copy_4.txt')))
//     .pipe(switchMap(() => ftpService.upload('/Users/stoldo/git/M122_AP18c_AutoBackup_Toldo_Severin/src/test.txt', '/htdocs/new_file_4.txt')))
//     .subscribe(res2 => {
//         console.log('download + upload success! ', res2);
//     }, error => {
//         console.log('download + upload error! ', error);
//     });













// console.log(ARGS['name']);
// fileSizeInBytes / (1024*1024)











