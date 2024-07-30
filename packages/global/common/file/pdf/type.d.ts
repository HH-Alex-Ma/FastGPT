import { MongoPdfTypeEnum } from './constants';

export type MongoPdfSchemaType = {
  _id: string;
  teamId: string;
  binary: Buffer;
  createTime: Date;
  expiredTime?: Date;
  type: `${MongoPdfTypeEnum}`;

  metadata?: {
    relatedId?: string; // This id is associated with a set of PDFs
    pageCount?: number; // Number of pages in the PDF
  };
};
