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
import {ConfigKeys} from "./model/config-keys.model";

// typescript runtime declares
declare function require(name: string);
declare const process: {argv: any};

// requires
const OS = require('os');
const FS = require('fs');
const ARGS = require('minimist')(process.argv.slice(2)); // library to parse command line arguments
const FTP = require( 'ftp' );
const ARCHIVER = require('archiver');
const MD5 = require('md5');
const NODEMAILER = require('nodemailer');
const ZIPPER = require('zip-local');

// services
const fileService = new FileService(FS, OS, ARCHIVER, MD5, ZIPPER);
const ftpService = new FtpService(new FTP(), FS, fileService); // new FTP() -> library's ftp client needs to be initialized like this, don't ask me why
const emailService = new EmailService(NODEMAILER);

// global constants
const DEFAULT_CONFIG_FILE_NAME = 'autobackup.conf';
const DEFAULT_CONFIG_FILE_PATH = fileService.getHomeDirPath() + '/' + DEFAULT_CONFIG_FILE_NAME;
const CONFIG = buildConfig();

const FTP_HOST = CommonUtils.getConfigKeyValue(ConfigKeys.FTP_HOST, CONFIG);
const FTP_USER = CommonUtils.getConfigKeyValue(ConfigKeys.FTP_USER, CONFIG);
const FTP_PASSWORD = CommonUtils.getConfigKeyValue(ConfigKeys.FTP_PASSWORD, CONFIG);
const FTP_BACKUP_LOCATION = CommonUtils.getConfigKeyValue(ConfigKeys.FTP_BACKUP_LOCATION, CONFIG);

const EMAIL_SERVICE = CommonUtils.getConfigKeyValue(ConfigKeys.EMAIL_SERVICE, CONFIG);
const EMAIL_USER = CommonUtils.getConfigKeyValue(ConfigKeys.EMAIL_USER, CONFIG);
const EMAIL_PASSWORD = CommonUtils.getConfigKeyValue(ConfigKeys.EMAIL_PASSWORD, CONFIG);

const EMAIL_TO = CommonUtils.getConfigKeyValue(ConfigKeys.EMAIL_TO, CONFIG);
const FILE_TO_BACKUP_PATH = CommonUtils.getConfigKeyValue(ConfigKeys.FILE_TO_BACKUP_PATH, CONFIG);
const DO_SEND_MAIL = !!(EMAIL_SERVICE && EMAIL_USER && EMAIL_PASSWORD && EMAIL_TO);


// business logic
CommonUtils.log('Starting AutoBackup...');

const fileToBackupName = fileService.getFileName(FILE_TO_BACKUP_PATH);
const backupFilePath = FTP_BACKUP_LOCATION + FileService.SEPARATOR + buildBackupFileName(fileToBackupName);
const confirmationFilePath = fileService.getTmpDirPath() + FileService.SEPARATOR + fileToBackupName;

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
        switchMap(status => {
            if (DO_SEND_MAIL) {
                CommonUtils.log('Sending E-Mail...')

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
                    .sendEmail(mailOptions);
            }

            return of(null);
        }),
    )
    .subscribe(() => {
        if (DO_SEND_MAIL) {
            CommonUtils.log('Sending E-Mail done.', Color.FgGreen);
        } else {
            CommonUtils.log('No E-Mail sent.');
        }

        CommonUtils.log('Stopping AutoBackup.');
    }, error => {
        CommonUtils.log('Sending E-Mail failed.', Color.FgRed);
        CommonUtils.log('Stopping AutoBackup.');

        throw error;
    });


// helper functions
function buildConfig(): any {
    const defaultConfigFile = resolveConfigFile(DEFAULT_CONFIG_FILE_PATH);
    const argumentConfigFile = resolveConfigFile(CommonUtils.getConfigKeyValue(ConfigKeys.CONFIG_FILE, ARGS));

    const config = {};

    ConfigKeys.values().forEach(configKey => {
        if (CommonUtils.isConfigKeyPresent(configKey, ARGS)) {
            config[configKey.key] = CommonUtils.getConfigKeyValue(configKey, ARGS);
        } else if (CommonUtils.isConfigKeyPresent(configKey, argumentConfigFile)) {
            config[configKey.key] = CommonUtils.getConfigKeyValue(configKey, argumentConfigFile);
        } else if (CommonUtils.isConfigKeyPresent(configKey, defaultConfigFile)) {
            config[configKey.key] = CommonUtils.getConfigKeyValue(configKey, defaultConfigFile);
        }
    });

    validateConfig(config);

    return config;
}

function resolveConfigFile(path: string): any {
    if (fileService.doesFileExist(path)) {
        const fileContent = fileService.getFileContent(path);

        if (CommonUtils.isValidJson(fileContent)) {
            return JSON.parse(fileContent);
        }
    }

    return null;
}

function validateConfig(config: any): void {
    ConfigKeys.values().forEach(configKey => {
        if (configKey.required && !CommonUtils.isConfigKeyPresent(configKey, config)) {
            throw new Error('Required config key missing! ' + configKey.key);
        }
    });
}

function buildBackupFileName(fileToBackupName: string): string {
    const dateStr = CommonUtils.getCurrentDateFormatted();
    return dateStr + '_backup_' + fileToBackupName;
}
