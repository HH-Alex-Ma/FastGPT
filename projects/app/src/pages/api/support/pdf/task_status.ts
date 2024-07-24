// projects\app\src\pages\api\support\pdf\task_status.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { getTaskStatus } from './taskQueue'; // 引用任务队列处理模块

export default function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (req.method !== 'GET') {
    return jsonRes(res, {
      code: 405,
      error: 'Method not allowed'
    });
  }

  const { taskId } = req.query;

  if (typeof taskId !== 'string') {
    return jsonRes(res, {
      code: 400,
      error: 'Invalid taskId'
    });
  }

  const status = getTaskStatus(taskId);
  jsonRes(res, {
    code: 200,
    data: status
  });
}
