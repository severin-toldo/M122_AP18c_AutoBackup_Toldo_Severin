import {Observable, of, Subject, combineLatest} from "rxjs";
import {catchError, delay, map, tap} from "rxjs/operators";
import {Status} from "../model/status.model";
import {CommonUtils} from "../common.utils";
import {FileService} from "./file.service";


export class FtpService {

    private ftpClientStatus$ = new Subject<Status>();


    constructor(private ftp: any,
                private fs: any,
                private fileService: FileService) {
        this.ftp.on('error', (error) => this.ftpClientStatus$.next({status: 'error', payload: error}));
        this.ftp.on('ready', () => this.ftpClientStatus$.next({status: 'connected'}));
        this.ftp.on('end', () => this.ftpClientStatus$.next({status: 'disconnected'}));
    }

    public connect(host: string, user: string, password: string): Observable<Status> {
        this.ftp.connect({
            'host': host,
            'user': user,
            'password': password
        });

        return this.ftpClientStatus$.pipe(map(status => CommonUtils.handleStatus(status)))
    }

    public disconnect(): Observable<Status> {
        this.ftp.end();

        return this.ftpClientStatus$.pipe(map(status => CommonUtils.handleStatus(status)))
    }

    public upload(sourcePath: string, targetPath: string): Observable<Status> {
        return Observable.create(observer => {
            this.ftp.put(sourcePath, targetPath, (error, response) => {

                // library doesn't check if file exists
                if (!this.fileService.doesFileExist(sourcePath)) {
                    observer.next({status: 'error', payload: new Error('Invalid source path, file does not exist! ' + sourcePath)});
                    return;
                }

                if (error) {
                    observer.next({status: 'error', payload: error});
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
                    observer.next({status: 'error', payload: new Error('Invalid target path, parent file does not exist! ' + targetPath)});
                    return;
                }

                if (error) {
                    observer.next({status: 'error', payload: error});
                    return;
                }

                stream.pipe(_this.fs.createWriteStream(targetPath));
                observer.next({status: 'success'});
            });
        })
            .pipe(map((status: Status) => CommonUtils.handleStatus(status)));
    }

}
