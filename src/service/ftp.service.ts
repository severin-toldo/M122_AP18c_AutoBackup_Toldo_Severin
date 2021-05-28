import {Observable, of, Subject, combineLatest} from "rxjs";
import {map, tap} from "rxjs/operators";
import {Status} from "../model/status.model";

export class FtpService {

    private ftpClientStatus$ = new Subject<Status>();


    constructor(private ftp: any,
                private fs: any) {
        this.ftp.on('error', (error) => this.ftpClientStatus$.next({status: 'error', payload: error}));
        this.ftp.on('ready', () => this.ftpClientStatus$.next({status: 'ready'}));
    }

    public connect(host: string, user: string, password: string): Observable<Status> {
        this.ftp.connect({
            'host': host,
            'user': user,
            'password': password
        });

        return this.ftpClientStatus$.pipe(map(status => this.handleStatus(status)))
    }

    public upload(sourcePath: string, targetPath: string): Observable<Status> {
        const _this = this;
        const uploadStatus$ = new Subject<Status>();

        this.ftp.put(sourcePath, targetPath, (error, response) => {

            // library doesn't check if file exists...
            if (!this.fs.existsSync(sourcePath)) {
                error = new Error('Invalid source path, file does not exist! ' + sourcePath);
            }

            if (error) {
                uploadStatus$.next({status: 'error', payload: error});
            } else {
                _this.ftp.end();
                uploadStatus$.next({status: 'success', payload: response});
            }
        });

        return uploadStatus$.pipe(map(status => this.handleStatus(status)));
    }

    public download(sourcePath: string, targetPath: string): Observable<Status> {
        const _this = this;
        const downloadStatus$ = new Subject<Status>();

        this.ftp.get(sourcePath, (error, stream) => {
            if (error) {
                downloadStatus$.next({status: 'error', payload: error});
            } else {
                stream.once('close', () => _this.ftp.end());
                stream.pipe(_this.fs.createWriteStream(targetPath));
                downloadStatus$.next({status: 'success'});
            }
        });

        return downloadStatus$.pipe(map(status => this.handleStatus(status)));
    }

    private handleStatus(status: Status): Status {
        if (status.status === 'error') {
            throw status.payload;
        }

        return status;
    }
}
