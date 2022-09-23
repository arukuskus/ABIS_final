import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { BehaviorSubject, Observable, Observer } from 'rxjs';
import { FileService } from 'src/app/services/file-service/file.service';

@Component({
  selector: 'app-file-work',
  templateUrl: './file-work.component.html',
  styleUrls: ['./file-work.component.css']
})
export class FileWorkComponent implements OnInit {

  // список добавляемых файлов
  fileList: NzUploadFile[] = [];

  uploading$ = new BehaviorSubject<boolean>(false);
  isMsgErrorSize$ = new BehaviorSubject<boolean>(false);

  // будем передавать загруженный файл в file-component
  @Output() onChanged = new EventEmitter<NzUploadFile>();

  constructor(
    private msg: NzMessageService,
    private fileService: FileService,
    ) { }

  ngOnInit(): void {

  }
  // возвращаем false в любом случае, чтобы загрузить файлы вручную
  // проверяем файлы на размер
  beforeUpload = (file: NzUploadFile, _fileList: NzUploadFile[]): Observable<boolean> => {

    this.fileList = this.fileList.concat(file);

    return new Observable((observer: Observer<boolean>) => {
      const isLt2M = file.size! / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.msg.error('File must smaller than 2MB!');
        observer.complete();
        return;
      }
      observer.next(isLt2M);
      observer.complete();
    });
  };

  // Отслеживание загрузки файлов (и чтение ответа с сервера)
  handleChange(info: NzUploadChangeParam):void{
    let fileList = [...info.fileList];

    //будем показывать только последний загруженный файл
    fileList = fileList.slice(-1);

    // Прочитаем ответ с сервера и положим его в newLoadFile
    fileList = fileList.map(file => {
      if(file.response){
        // получим id для загруженного файла с сервера
        file.uid = file.response;
         // скажем что файл успешно загрузился
        this.msg.success('upload successfully.');
        this.newLoadFile(file);
      }
      return file;
    });
    // отчищаем список загруженных файлов (чтобв там всегда был 1 элемент)
    this.fileList = [];

    this.fileList = fileList
  }
  // Загрузка файла при нажатии на кнопку
  handleUpload(): void {
    this.uploading$.next(true);

    const sendFile: any = this.fileList[this.fileList.length - 1];
   
    const formData = new FormData();

    // отправляем выбранный файл на сервер и получаем с сервера id
    if(sendFile != undefined){
      formData.append('file', sendFile, sendFile?.name);

      this.fileService.upload(formData).subscribe({
          next: res =>{
            if(res.id){
              // сохраним пришедшее id
              this.fileList[this.fileList.length - 1].uid = res.id;
              this.fileList[this.fileList.length - 1].status = "success";

              //файл, который отдаем компоненту поступления
              this.newLoadFile(this.fileList[this.fileList.length - 1]);

              this.msg.success('upload successfully.');
            }else{
              this.msg.error('upload failed.');
            }
            
          },
          error: () =>{
            this.msg.error('upload failed.');
          },
          complete: () => { this.uploading$.next(false); }
        }
      );
      
    }else{
      this.uploading$.next(false);
      alert("упс, что- то пошло не так");
    }
  }

  // возвращаем загруженный файл
  private newLoadFile(increased: any) {
    this.onChanged.emit(increased);
  }
}
