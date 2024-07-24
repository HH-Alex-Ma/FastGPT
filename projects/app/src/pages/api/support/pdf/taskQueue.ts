// projects\app\src\pages\api\support\pdf\taskQueue.ts
import { setTimeout } from 'timers/promises'; // Node.js 16+

// 模拟一个任务队列（你可以使用数据库或缓存系统）
const taskQueue = new Map<string, { status: string; result?: any }>();

export async function addTaskToQueue(taskId: string, accessToken: string) {
  // 添加任务到队列
  taskQueue.set(taskId, { status: 'processing' });

  // 模拟处理时间
  await setTimeout(3000); // 等待3秒

  // 查询任务结果
  const result = await fetch(
    `https://aip.baidubce.com/file/2.0/brain/online/v1/textreview/task/query?access_token=${accessToken}`,
    {
      method: 'POST',
      body: JSON.stringify({ taskId }),
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json'
      }
    }
  );
  const data = await result.json();

  // 更新任务状态
  if (result.ok) {
    taskQueue.set(taskId, { status: 'completed', result: data });
  } else {
    taskQueue.set(taskId, { status: 'failed', result: data.error_msg });
  }
}

export function getTaskStatus(taskId: string) {
  return taskQueue.get(taskId) || { status: 'unknown' };
}
