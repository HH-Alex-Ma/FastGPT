export const pdfBaseUrl = '/api/documents/pdf/';

export enum MongoPdfTypeEnum {
  generic = 'generic'
}

export const mongoPdfTypeMap = {
  [MongoPdfTypeEnum.generic]: {
    label: 'common.file.type.generic',
    unique: false
  }
};

export const uniquePdfTypeList = [];

export const PdfIcon = 'file/fill/pdf';
export const PdfImgUrl = '/imgs/files/pdf.svg';
