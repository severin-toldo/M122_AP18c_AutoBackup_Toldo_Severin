// #!/usr/bin/env node


import {catchError, finalize, map, switchMap, tap} from 'rxjs/operators';
import {FtpService} from "./service/ftp.service";
import {FileService} from "./service/file.service";
import {EmailService} from "./service/email.service";
import {CommonUtils} from "./common.utils";
import {ErrorCode} from "./model/error-code.enum";
import {ErrorCodeError} from "./model/error-code-error.model";
import {Color} from "./model/color.enum";

declare function require(name: string);
declare const process: {argv: any};

const OS = require('os');
const FS = require('fs');
const ARGS = require('minimist')(process.argv.slice(2)); // library to parse command line arguments
const FTP = require( 'ftp' );
const ARCHIVER = require('archiver');
const MD5 = require('md5');
const NODEMAILER = require('nodemailer');
const ZIPPER = require('zip-local');

const fileService = new FileService(FS, OS, ARCHIVER, MD5, ZIPPER);
const ftpService = new FtpService(new FTP(), FS, fileService); // new FTP() -> library's ftp client needs to be initialized like this, don't ask me why
const emailService = new EmailService(NODEMAILER);


const DEFAULT_CONFIG_FILE_NAME = 'autobackup.conf';
const DEFAULT_CONFIG_FILE_PATH = OS.homedir() + '/' + DEFAULT_CONFIG_FILE_NAME;
const DEFAULT_CONFIG_FILE_EXISTS = FS.existsSync(DEFAULT_CONFIG_FILE_PATH);

// TODO via config file and or arguments
const FTP_HOST = 'ftp.byethost32.com';
const FTP_USER = 'b32_28736452';
const FTP_PASSWORD = '23hjSJD45';
const FTP_BACKUP_LOCATION = '/htdocs';

const EMAIL_SERVICE = 'gmail';
const EMAIL_USER = 'backuptool24@gmail.com';
const EMAIL_PASSWORD = '?m6X7RgwH[3^6>E9E4gQnXFE*r,ENkaUL236,)Dykwcg2@Fxv&';

const EMAIL_TO = 'stoldo@runmyaccounts.com';
const FILE_TO_BACKUP_PATH = '/Users/stoldo/git/M122_AP18c_AutoBackup_Toldo_Severin/src/test_new_2.txt';


const fileToBackupName = fileService.getFileName(FILE_TO_BACKUP_PATH);
const backupFilePath = FTP_BACKUP_LOCATION + FileService.SEPARATOR + buildBackupFileName(fileToBackupName);
const confirmationFilePath = fileService.getTmpDirPath() + FileService.SEPARATOR + fileToBackupName;
// const confirmationFilePath = '/Users/stoldo/git/M122_AP18c_AutoBackup_Toldo_Severin/src/' + fileToBackupName + '.txt';


// TODO test all error cases....
// TODO arguments + config file
// TODO improve error code exception
// TODO kann anforderungen?
// TODO publish everything to npm




CommonUtils.log('Starting AutoBackup...');

ftpService
    .connect(FTP_HOST, FTP_USER, FTP_PASSWORD)
    .pipe(
        tap(() => CommonUtils.log('Uploading file...')),
        switchMap(() => ftpService.upload(FILE_TO_BACKUP_PATH, backupFilePath)),
        tap(() => CommonUtils.log('Uploading file done.')),
        tap(() => CommonUtils.log('Verifying uploaded file...')),
        switchMap(() => ftpService.download(backupFilePath, confirmationFilePath)),
        switchMap(() => ftpService.disconnect()),
        map(() => {

            // TOOD remove
            // throw new ErrorCodeError(ErrorCode.FILES_NOT_THE_SAME, new Error('file sizes are not equal!'));

            const originalFileSize = fileService.getFileSize(FILE_TO_BACKUP_PATH);
            const downloadedFileSize = fileService.getFileSize(confirmationFilePath);

            if (originalFileSize !== downloadedFileSize) {
                throw new ErrorCodeError(ErrorCode.FILES_NOT_THE_SAME, new Error('file sizes are not equal!'));
            }

            const originalFileMd5Checksum = fileService.getFileMd5Checksum(FILE_TO_BACKUP_PATH);
            const downloadedFileMd5Checksum = fileService.getFileMd5Checksum(confirmationFilePath);

            if (originalFileMd5Checksum !== downloadedFileMd5Checksum) {
                throw new ErrorCodeError(ErrorCode.FILES_NOT_THE_SAME, new Error('file checksums are not equal!'));
            }

            const zippedFileBuffer = fileService.zipFile(FILE_TO_BACKUP_PATH);

            CommonUtils.log('Verifying uploaded file done.');
            return {status: 'success', payload: zippedFileBuffer};
        }),
        finalize(() => fileService.deleteFile(confirmationFilePath)),
        tap(() => {
            CommonUtils.log('Backup successful.', Color.FgGreen);
        }, error => {
            CommonUtils.log('Backup failed. ' + error.errorCode, Color.FgRed);
        }),
        tap(() => CommonUtils.log('Sending E-Mail...')),
        map(status => {
            const mailOptions: any = {
                from: 'auto@backup.com',
                to: EMAIL_TO,
                subject: 'AutoBackup Status E-Mail - ' + CommonUtils.getCurrentDateFormatted(),
            };

            if (status.status === 'success') {
                mailOptions.text = 'Backup Successful.';
                mailOptions.attachments = [
                    {
                        filename: fileToBackupName + '.zip',
                        content: status.payload
                    }
                ];
            } else {
                mailOptions.text = 'Backup failed: ' + status.payload;
            }

            return emailService
                .createTransporter(EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD)
                .sendEmail(mailOptions)
        }),
    )
    .subscribe(() => {
        CommonUtils.log('Sending E-Mail done.');
        CommonUtils.log('Stopping AutoBackup.', Color.FgGreen);
    }, error => {
        CommonUtils.log('Sending E-Mail failed.', Color.FgRed);
        CommonUtils.log('Stopping AutoBackup.', Color.FgRed);
        throw error;
    });


function buildBackupFileName(fileToBackupName: string): string {
    const dateStr = CommonUtils.getCurrentDateFormatted();
    return dateStr + '_backup_' + fileToBackupName;
}








/*
* Code examples
* */

// console.log('\x1b[36m%s\x1b[0m', 'I am cyan');  //cyan
// console.log('\x1b[33m%s\x1b[0m', 'hey');  //yellow

//     const path = '/Users/stoldo/git/M122_AP18c_AutoBackup_Toldo_Severin/src/test.txt';
// console.log(ARGS['name']);

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
























