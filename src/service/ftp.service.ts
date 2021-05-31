import {Observable, Subject, race} from "rxjs";
import {map} from "rxjs/operators";
import {Status} from "../model/status.model";
import {CommonUtils} from "../common.utils";
import {FileService} from "./file.service";
import {ErrorCodeError} from "../model/error-code-error.model";
import {ErrorCode} from "../model/error-code.enum";


export class FtpService {

    // private ftpClientStatus$ = new Subject<Status>();

    private ftpClientConnected$ = new Subject<Status>();
    private ftpClientDisconnected$ = new Subject<Status>();
    private ftpClientError$ = new Subject<Status>();


    constructor(private ftp: any,
                private fs: any,
                private fileService: FileService) {
        this.ftp.on('ready', () => this.ftpClientConnected$.next({status: 'connected'}));
        this.ftp.on('end', () => this.ftpClientDisconnected$.next({status: 'disconnected'}));
        this.ftp.on('error', (error) => this.ftpClientError$.next({status: 'error', payload: new ErrorCodeError(ErrorCode.FTP_CONNECTION_FAILED, error)}));
    }

    public connect(host: string, user: string, password: string): Observable<Status> {
        this.ftp.connect({
            'host': host,
            'user': user,
            'password': password
        });

        return race(
            this.ftpClientConnected$,
            this.ftpClientError$
        )
            .pipe(map(status => CommonUtils.handleStatus(status)))
    }

    public disconnect(): Observable<Status> {
        this.ftp.end();

        return race(
            this.ftpClientDisconnected$,
            this.ftpClientError$
        )
            .pipe(map(status => CommonUtils.handleStatus(status)))
    }

    public upload(sourcePath: string, targetPath: string): Observable<Status> {
        return Observable.create(observer => {
            this.ftp.put(sourcePath, targetPath, (error, response) => {

                // library doesn't check if file exists
                if (!this.fileService.doesFileExist(sourcePath)) {
                    observer.next({status: 'error', payload: new ErrorCodeError(ErrorCode.UPLOAD_FAILED, new Error('Invalid source path, file does not exist! ' + sourcePath))});
                    return;
                }

                if (error) {
                    observer.next({status: 'error', payload: new ErrorCodeError(ErrorCode.UPLOAD_FAILED, error)});
                    return;
                }

                observer.next({status: 'success'});
            });
        })
            .pipe(map((status: Status) => CommonUtils.handleStatus(status)));
    }

    public download(sourcePath: string, targetPath: string): Observable<Status> {
        const _this = this;

        return Observable.create(observer => {
            this.ftp.get(sourcePath, (error, stream) => {
                // library doesn't check if parent file exists
                if (!this.fileService.doesParentFileExist(targetPath)) {
                    observer.next({status: 'error', payload: new ErrorCodeError(ErrorCode.DOWNLOAD_FAILED, new Error('Invalid target path, parent file does not exist! ' + targetPath))});
                    return;
                }

                if (error) {
                    observer.next({status: 'error', payload: new ErrorCodeError(ErrorCode.DOWNLOAD_FAILED, error)});
                    return;
                }

                // stream to string
                let fileContentAsString = '';

                stream.on('data', (data) => {
                    fileContentAsString += data.toString();
                });

                stream.on('end', () => {
                    this.fileService.writeToFile(targetPath, fileContentAsString);
                    observer.next({status: 'success'});
                });

                stream.on('error', error => {
                    observer.next({status: 'error', payload: new ErrorCodeError(ErrorCode.DOWNLOAD_FAILED, error)});
                });
            });
        })
            .pipe(map((status: Status) => CommonUtils.handleStatus(status)));
    }

}
