import { AppWhisperConfigType } from './type';

export enum AppTypeEnum {
  simple = 'simple',
  advanced = 'advanced',
  pdf = 'pdf'
}
export const AppTypeMap = {
  [AppTypeEnum.simple]: {
    label: 'simple'
  },
  [AppTypeEnum.advanced]: {
    label: 'advanced'
  },
  [AppTypeEnum.pdf]: {
    label: 'pdf'
  }
};

export const defaultWhisperConfig: AppWhisperConfigType = {
  open: false,
  autoSend: false,
  autoTTSResponse: false
};

export type twoColAppType = {
  id: string;
  name: string;

  left_tag: string;
  left_tabs: string[];
  left_module: string;
  //left_content: () => void,

  right_tag: string;
  right_tabs: string[];
  right_module: string;
  //right_content: () => void
};
