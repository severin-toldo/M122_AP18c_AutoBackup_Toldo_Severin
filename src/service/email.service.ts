import {Observable, of, Subject, from} from "rxjs";
import {Status} from "../model/status.model";
import {map, tap} from "rxjs/operators";
import {CommonUtils} from "../common.utils";


export class EmailService {

    private transporter: any;

    constructor(private nodemailer: any) {
    }

    public createTransporter(service: string, user: string, password: string): EmailService {
        this.transporter = this.nodemailer.createTransport({
            service: service,
            auth: {
                user: user,
                pass: password
            }
        });

        return this;
    }

    public sendEmail(mailOptions: any): Observable<Status> {
        return Observable.create(observer => {
            if (!this.transporter) {
                observer.next({status: 'error', payload: new Error('no transporter was set up!')})
            }

            this.transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    observer.next({status: 'error', payload: error})
                } else {
                    observer.next({status: 'success', payload: info.response});
                }
            });
        })
            .pipe(tap((status: Status) => CommonUtils.handleStatus(status)));
    }

}
