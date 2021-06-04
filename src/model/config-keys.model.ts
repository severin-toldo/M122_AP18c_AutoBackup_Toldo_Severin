import {ConfigKey} from "./config-key.model";

export class ConfigKeys {

    public static values(): ConfigKey[] {
        return [
            this.CONFIG_FILE,
            this.FTP_HOST,
            this.FTP_USER,
            this.FTP_PASSWORD,
            this.FTP_BACKUP_LOCATION,
            this.EMAIL_SERVICE,
            this.EMAIL_USER,
            this.EMAIL_PASSWORD,
            this.EMAIL_TO,
            this.FILE_TO_BACKUP_PATH,
            this.LOG_FILE_PATH
        ];
    }

    public static readonly CONFIG_FILE: ConfigKey = {
        key: 'configFile',
        required: false
    };

    public static readonly FTP_HOST: ConfigKey = {
        key: 'ftpHost',
        required: true
    };

    public static readonly FTP_USER: ConfigKey = {
        key: 'ftpUser',
        required: true
    };

    public static readonly FTP_PASSWORD: ConfigKey = {
        key: 'ftpPassword',
        required: true
    };

    public static readonly FTP_BACKUP_LOCATION: ConfigKey = {
        key: 'ftpBackupLocation',
        required: true
    };

    public static readonly EMAIL_SERVICE: ConfigKey = {
        key: 'emailService',
        required: false
    };

    public static readonly EMAIL_USER: ConfigKey = {
        key: 'emailUser',
        required: false
    };

    public static readonly EMAIL_PASSWORD: ConfigKey = {
        key: 'emailPassword',
        required: false
    };

    public static readonly EMAIL_TO: ConfigKey = {
        key: 'emailTo',
        required: false
    };

    public static readonly FILE_TO_BACKUP_PATH: ConfigKey = {
        key: 'file',
        required: true
    };

    public static readonly LOG_FILE_PATH: ConfigKey = {
        key: 'logFile',
        required: false
    };

}
