import {
  UpdateAppCollaboratorBody,
  AppCollaboratorDeleteParams
} from '@fastgpt/global/core/app/collaborator';
import { DELETE, GET, POST } from '@/web/common/api/request';
import { CollaboratorItemType } from '@fastgpt/global/support/permission/collaborator';

export const getCollaboratorList = (appId: string) =>
  GET<CollaboratorItemType[]>('/support/collaborator/list', { appId });

export const postUpdateAppCollaborators = (body: UpdateAppCollaboratorBody) =>
  POST('/support/collaborator/update', body);

export const deleteAppCollaborators = (params: AppCollaboratorDeleteParams) =>
  DELETE('/support/collaborator/delete', params);
