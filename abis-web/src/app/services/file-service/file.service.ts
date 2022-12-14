import { mergeMap as _observableMergeMap, catchError as _observableCatch } from 'rxjs/operators';
import { Observable, throwError as _observableThrow, of as _observableOf, BehaviorSubject } from 'rxjs';
import { Injectable, Inject, Optional, InjectionToken } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { NzUploadFile } from 'ng-zorro-antd/upload';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');


@Injectable({
    providedIn: 'root'
  })
export class FileService {

  private http: HttpClient;
  private baseUrl: string;
  protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

  constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_URL) baseUrl?: string) {
      this.http = http;
      this.baseUrl = baseUrl !== undefined && baseUrl !== null ? baseUrl : "https://localhost:7155";
  }

   /**
     * @param file (optional) 
     * @return Success
     */
    // store(file: FormData): Observable<string> {
    //     let url_ = this.baseUrl + "/file/save/store";
    //     url_ = url_.replace(/[?&]$/, "");

    //     let options_ : any = {
    //         body: file,
    //         observe: "response",
    //         responseType: "blob",
    //         headers: new HttpHeaders({
    //             "Accept": "text/plain"
    //         })
    //     };

    //     return this.http.request("post", url_, options_).pipe(_observableMergeMap((response_ : any) => {
    //         return this.processStore(response_);
    //     })).pipe(_observableCatch((response_: any) => {
    //         if (response_ instanceof HttpResponseBase) {
    //             try {
    //                 return this.processStore(response_ as any);
    //             } catch (e) {
    //                 return _observableThrow(e) as any as Observable<string>;
    //             }
    //         } else
    //             return _observableThrow(response_) as any as Observable<string>;
    //     }));
    // }

    // protected processStore(response: HttpResponseBase): Observable<string> {
    //     const status = response.status;
    //     const responseBlob =
    //         response instanceof HttpResponse ? response.body :
    //         (response as any).error instanceof Blob ? (response as any).error : undefined;

    //     let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}
    //     if (status === 200) {
    //         return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
    //         let result200: any = null;
    //         let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
    //             result200 = resultData200 !== undefined ? resultData200 : <any>null;
    
    //         return _observableOf(result200);
    //         }));
    //     } else if (status !== 200 && status !== 204) {
    //         return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
    //         return throwException("An unexpected server error occurred.", status, _responseText, _headers);
    //         }));
    //     }
    //     return _observableOf(null as any);
    // }

    /**
     * @param request (optional) 
     * @return Success
     */
     upload(file: FormData): Observable<UploadCommandResult> {
        let url_ = this.baseUrl + "/api/FileApi/Upload";
        url_ = url_.replace(/[?&]$/, "");

        let options_ : any = {
            body: file,
            observe: "response",
            responseType: "blob",
            headers: new HttpHeaders({
                "Accept": "text/plain"
            })
        };

        return this.http.request("post", url_, options_).pipe(_observableMergeMap((response_ : any) => {
            return this.processUpload(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processUpload(response_ as any);
                } catch (e) {
                    return _observableThrow(e) as any as Observable<UploadCommandResult>;
                }
            } else
                return _observableThrow(response_) as any as Observable<UploadCommandResult>;
        }));
    }

    protected processUpload(response: HttpResponseBase): Observable<UploadCommandResult> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse ? response.body :
            (response as any).error instanceof Blob ? (response as any).error : undefined;

        let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}
        if (status === 200) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result200 = UploadCommandResult.fromJS(resultData200);
            return _observableOf(result200);
            }));
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            }));
        }
        return _observableOf(null as any);
    }

    /**
     * @param id (optional) 
     * @return Success
     */
    download(id: string | undefined): Observable<void> {
        let url_ = this.baseUrl + "/api/FileApi/Download?";
        if (id === null)
            throw new Error("The parameter 'id' cannot be null.");
        else if (id !== undefined)
            url_ += "Id=" + encodeURIComponent("" + id) + "&";
        url_ = url_.replace(/[?&]$/, "");

        let options_ : any = {
            observe: "response",
            responseType: "blob",
            headers: new HttpHeaders({
            })
        };

        return this.http.request("get", url_, options_).pipe(_observableMergeMap((response_ : any) => {
            return this.processDownload(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processDownload(response_ as any);
                } catch (e) {
                    return _observableThrow(e) as any as Observable<void>;
                }
            } else
                return _observableThrow(response_) as any as Observable<void>;
        }));
    }

    protected processDownload(response: HttpResponseBase): Observable<void> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse ? response.body :
            (response as any).error instanceof Blob ? (response as any).error : undefined;

        let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}
        if (status === 200) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
            return _observableOf(null as any);
            }));
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            }));
        }
        return _observableOf(null as any);
    }
}

export class UploadCommandResult implements IUploadCommandResult {
    id?: string;

    constructor(data?: IUploadCommandResult) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
        }
    }

    static fromJS(data: any): UploadCommandResult {
        data = typeof data === 'object' ? data : {};
        let result = new UploadCommandResult();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        return data;
    }
}

export interface IUploadCommandResult {
    id?: string;
}

export interface FileParameter {
    data: any;
    fileName: string;
}

export class ApiException extends Error {
  override message: string;
  status: number;
  response: string;
  headers: { [key: string]: any; };
  result: any;

  constructor(message: string, status: number, response: string, headers: { [key: string]: any; }, result: any) {
      super();

      this.message = message;
      this.status = status;
      this.response = response;
      this.headers = headers;
      this.result = result;
  }

  protected isApiException = true;

  static isApiException(obj: any): obj is ApiException {
      return obj.isApiException === true;
  }
}

function throwException(message: string, status: number, response: string, headers: { [key: string]: any; }, result?: any): Observable<any> {
  if (result !== null && result !== undefined)
      return _observableThrow(result);
  else
      return _observableThrow(new ApiException(message, status, response, headers, null));
}

function blobToText(blob: any): Observable<string> {
  return new Observable<string>((observer: any) => {
      if (!blob) {
          observer.next("");
          observer.complete();
      } else {
          let reader = new FileReader();
          reader.onload = event => {
              observer.next((event.target as any).result);
              observer.complete();
          };
          reader.readAsText(blob);
      }
  });
}
