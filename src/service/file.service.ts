import {Observable, of, Subject, from} from "rxjs";
import {Status} from "../model/status.model";
import {map, tap} from "rxjs/operators";
import {CommonUtils} from "../common.utils";


export class FileService {

    public static readonly DEFAULT_CHARSET = 'utf8';
    public static readonly SEPARATOR = '/';


    constructor(private fs: any,
                private os: any,
                private archiver: any,
                private md5: any) {
    }

    public getHomeDirPath(): string {
        return this.os.homedir();
    }

    public getTmpDirPath(): string {
        return this.os.tmpdir();
    }

    public doesFileExist(path: string): boolean {
        return this.fs.existsSync(path);
    }

    public doesParentFileExist(path: string): boolean {
        path = path.substr(0, path.lastIndexOf(FileService.SEPARATOR));
        return this.doesFileExist(path);
    }

    public getFileContent(path: string): string {
        return this.fs.readFileSync(path, FileService.DEFAULT_CHARSET);
    }

    public getFileInformation(path: string): any {
        return this.fs.statSync(path);
    }

    public getFileSize(path: string): number {
        return this.getFileInformation(path).size;
    }

    public getFileMd5Checksum(path: string): string {
        return this.md5(this.getFileContent(path));
    }

    public zipFile(sourcePath: string, targetPath: string): Observable<Status> {
        return from(new Promise((resolve, reject) => {

            // zip library doesn't check if file exists
            if (!this.doesFileExist(sourcePath)) {
                reject({status: 'error', payload: new Error('Invalid source path, file does not exist! ' + sourcePath)});
                return;
            }

            // zip library doesn't check if parent file exists
            if (!this.doesParentFileExist(targetPath)) {
                reject({status: 'error', payload: new Error('Invalid target path, parent file does not exist! ' + targetPath)});
                return;
            }

            const archive = this.archiver('zip', { zlib: { level: 9 }});
            const stream = this.fs.createWriteStream(targetPath);

            archive
                .file(sourcePath, false)
                .on('error', error => reject({status: 'error', payload: error}))
                .pipe(stream);

            stream.on('close', () => resolve({status: 'success'}));
            archive.finalize();

            return;
        }))
            .pipe(map((status: Status) => CommonUtils.handleStatus(status)));
    }
}














