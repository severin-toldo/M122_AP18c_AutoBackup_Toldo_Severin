// #!/usr/bin/env node


import {catchError, delay, switchMap, tap} from 'rxjs/operators';
import {FtpService} from "./service/ftp.service";
import {FileService} from "./service/file.service";
import {Observable, of} from "rxjs";
import {EmailService} from "./service/email.service";

declare function require(name: string);
declare const process: {argv: any};

const OS = require('os');
const FS = require('fs');
const ARGS = require('minimist')(process.argv.slice(2)); // library to parse command line arguments
const FTP = require( 'ftp' );
const ARCHIVER = require('archiver');
const MD5 = require('md5');
const NODEMAILER = require('nodemailer');

const fileService = new FileService(FS, OS, ARCHIVER, MD5);
const ftpService = new FtpService(new FTP(), FS, fileService); // new FTP() -> library's ftp client needs to be initialized like this, don't ask me why
const emailService = new EmailService(NODEMAILER);


const DEFAULT_CONFIG_FILE_NAME = 'autobackup.conf';
const DEFAULT_CONFIG_FILE_PATH = OS.homedir() + '/' + DEFAULT_CONFIG_FILE_NAME;
const DEFAULT_CONFIG_FILE_EXISTS = FS.existsSync(DEFAULT_CONFIG_FILE_PATH);



//     const path = '/Users/stoldo/git/M122_AP18c_AutoBackup_Toldo_Severin/src/test.txt';
// console.log(ARGS['name']);
// fileSizeInBytes / (1024*1024)











/*
* Code examples
* */

// const mailOptions = {
//     from: 'autobackup@emai.com',
//     to: 'stoldo@runmyaccounts.com',
//     subject: 'Sending Email using Node.js',
//     text: 'That was easy!',
//     attachments: [
//         {
//             path: '/Users/stoldo/git/M122_AP18c_AutoBackup_Toldo_Severin/src/test.txt'
//         },
//     ]
// };
//
//
// emailService
//     .createTransporter('gmail', 'backuptool24@gmail.com', '?m6X7RgwH[3^6>E9E4gQnXFE*r,ENkaUL236,)Dykwcg2@Fxv&')
//     .sendEmail(mailOptions)
//     .subscribe(res => {
//         console.log('email success! ', res);
//     }, error => {
//         console.log('email error! ', error);
//     });

// fileService
//     .zipFile('/Users/stoldo/git/M122_AP18c_AutoBackup_Toldo_Severin/src/test.txt', '/Users/stoldo/git/M122_AP18c_AutoBackup_Toldo_Severin/src/test.zip')
//     .subscribe(res => {
//         console.log('zip success! ', res);
//     }, error => {
//         console.log('zip error! ', error);
//     });

// ftpService
//     .connect('ftp.byethost32.com', 'b32_28736452', '23hjSJD45')
//     .pipe(switchMap(() => ftpService.download('/htdocs/mytest.txt', '/Users/stoldo/git/M122_AP18c_AutoBackup_Toldo_Severin/src/copydddd3.txt')))
//     .pipe(switchMap(() => ftpService.disconnect()))
//     .subscribe(res2 => {
//         console.log('download success! ', res2);
//     }, error => {
//         console.log('download error! ', error);
//     });

// ftpService
//     .connect('ftp.byethost32.com', 'b32_28736452', '23hjSJD45')
//     .pipe(switchMap(() => ftpService.upload('/Users/stoldo/git/M122_AP18c_AutoBackup_Toldo_Severin/src/test.txt', '/htdocssdsd/mytest_OBSERVALE_3.txt')))
//     .pipe(switchMap(() => ftpService.disconnect()))
//     .subscribe(res2 => {
//         console.log('upload success! ', res2);
//     }, error => {
//         console.log('upload error! ', error);
//     });

// ftpService
//     .connect('ftp.byethost32.com', 'b32_28736452', '23hjSJD45')
//     .pipe(switchMap(() => ftpService.upload('/Users/stoldo/git/M122_AP18c_AutoBackup_Toldo_Severin/src/test.txt', '/htdocs/new_file_8.txt')))
//     .pipe(switchMap(() => ftpService.download('/htdocs/mytest.txt', '/Users/stoldo/git/M122_AP18c_AutoBackup_Toldo_Severin/src/new_copy_8.txt')))
//     .pipe(switchMap(() => ftpService.disconnect()))
//     .subscribe(res2 => {
//         console.log('download + upload success! ', res2);
//     }, error => {
//         console.log('download + upload error! ', error);
//     });
























