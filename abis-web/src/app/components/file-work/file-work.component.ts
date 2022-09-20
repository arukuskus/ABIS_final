import { HttpClient, HttpRequest, HttpResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { BehaviorSubject, Observable, Observer } from 'rxjs';
import { filter } from 'rxjs/operators';
import { FileParameter, FileService } from 'src/app/services/file-service/file.service';

// это вроде преобразование файлов в ulploadFile
const getBase64 = (file: File): Promise<string | ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
@Component({
  selector: 'app-file-work',
  templateUrl: './file-work.component.html',
  styleUrls: ['./file-work.component.css']
})
export class FileWorkComponent implements OnInit {

  // список добавляемых файлов
  fileList: NzUploadFile[] = [];
  files: File[] = [];

  uploading$ = new BehaviorSubject<boolean>(false);
  isMsgErrorSize$ = new BehaviorSubject<boolean>(false);

  // загрузчик изображения с кардинкой и url - картинки
  loading = false;
  avatarUrl?: string;

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
        this.isMsgErrorSize$.next(true); // чтобы заблокировать пользователю кнопку отправки, пока он не удалит  этот файл (чуть позже применю)
        observer.complete();
        return;
      }
      this.isMsgErrorSize$.next(false);
      observer.next(false);
      observer.complete();
    });
  };

  previewImage: string | undefined = '';
  previewVisible = false;

  // Загрузка файла при нажатии на кнопку
  handleUpload(): void {
    this.uploading$.next(true);

    // файл, который отправится на сервер
    //const sendFile = this.fileList[this.fileList.length - 1].originFileObj;
    const sendFile: any = this.fileList[this.fileList.length - 1];
   
    const formData = new FormData();

    // отправляем выбранный файл на сервер и получаем с сервера id
    if(sendFile != undefined){
      formData.append('file', sendFile, sendFile?.name);

      this.fileService.store(formData).subscribe({
          next: res =>{
            // сохраним пришедшее id
            this.fileList[this.fileList.length - 1].uid = res;
            this.fileList[this.fileList.length - 1].status = "success";

            const saveFile: any = this.fileList[this.fileList.length - 1];
            this.files.push(saveFile);

            // Сохраним файлики в переменную сервиса (будем подписываться на ее изменение в компоненте поступления)
            this.fileService.fileLoadList$.next(this.files);

            this.msg.success('upload successfully.');
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

  // будет выполняться при нажатии на ссылку файла или значок предварительного просмотра.
  handlePreview = async (file: NzUploadFile): Promise<void> => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj!);
    }
    this.previewImage = file.url || file.preview;
    this.previewVisible = true;
  };
}
