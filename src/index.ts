// #!/usr/bin/env node


import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {FtpService} from "./service/ftp.service";
import {FileService} from "./service/file.service";
import {EmailService} from "./service/email.service";
import {CommonUtils} from "./common.utils";
import {ErrorCode} from "./model/error-code.enum";
import {ErrorCodeError} from "./model/error-code-error.model";
import {Color} from "./model/color.enum";
import {of} from "rxjs";

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


// TODO arguments + config file
// // console.log(ARGS['name']);
// TODO kann anforderungen?
// • E-Mail senden Ja / Nein konfigurierbar
// • Empfänger E-Mail konfigurierbar
// • FTP Server konfigurierbar

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

            fileService.deleteFile(confirmationFilePath);

            const zippedFileBuffer = fileService.zipFile(FILE_TO_BACKUP_PATH);

            CommonUtils.log('Verifying uploaded file done.');
            return {status: 'success', payload: zippedFileBuffer};
        }),
        tap(() => CommonUtils.log('Backup successful.', Color.FgGreen)),
        catchError(error => {
            CommonUtils.log('Backup failed. ' + error.errorCode, Color.FgRed);
            return of({status: 'error', payload: error.errorCode});
        }),
        tap(() => CommonUtils.log('Sending E-Mail...')),
        switchMap(status => {
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
        CommonUtils.log('Sending E-Mail done.', Color.FgGreen);
        CommonUtils.log('Stopping AutoBackup.');
    }, error => {
        CommonUtils.log('Sending E-Mail failed.', Color.FgRed);
        CommonUtils.log('Stopping AutoBackup.');

        throw error;
    });


function buildBackupFileName(fileToBackupName: string): string {
    const dateStr = CommonUtils.getCurrentDateFormatted();
    return dateStr + '_backup_' + fileToBackupName;
}
