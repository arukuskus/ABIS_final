import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { Observable, Observer } from 'rxjs';

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

  fileList: NzUploadFile[] =[]; // списочек отправляемых файлов
  loading = false;
  avatarUrl?: string;
  constructor(private msg: NzMessageService) { }

  ngOnInit(): void {
  }

  previewImage: string | undefined = '';
  previewVisible = false;

  beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = this.fileList.concat(file);
    return false;
  };

  handlePreview = async (file: NzUploadFile): Promise<void> => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj!);
    }
    this.previewImage = file.url || file.preview;
    this.previewVisible = true;
  };

}
