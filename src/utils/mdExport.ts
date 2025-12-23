import { Task } from '../components/features/KanbanBoard';
import { invoke } from '@tauri-apps/api/core';

/**
 * Generates a clean Markdown representation of tasks
 */
export function generateTaskMarkdown(tasks: Task[]): string {
  console.log('[mdExport] Generating MD for', tasks.length, 'tasks');
  let md = "# TaskRails Project Export\n\n";

  const columns = {
    todo: "待辦事項 / TODO",
    doing: "進行中 / IN PROGRESS",
    done: "已完成 / COMPLETED"
  };

  const statusValues = Object.keys(columns) as Array<keyof typeof columns>;
  
  statusValues.forEach(status => {
    const columnTasks = tasks.filter(t => t.status === status);
    if (columnTasks.length === 0) return;

    md += `## ${columns[status]}\n\n`;
    
    columnTasks.forEach(task => {
      md += `### ${task.id}: ${task.title}\n`;
      md += `- **Phase**: ${task.phase}\n`;
      md += `- **Priority**: P${task.priority}\n`;
      if (task.tag) md += `- **Tag**: ${task.tag}\n`;
      if (task.assignee) md += `- **Assignee**: ${task.assignee}\n`;
      if (task.isReworked) md += `- **Status**: [REWORKED]\n`;
      
      if (task.description) {
        md += `\n${task.description}\n`;
      }
      
      md += `\n---\n\n`;
    });
  });

  const genericTasks = tasks.filter(t => !statusValues.includes(t.status as any));
  if (genericTasks.length > 0) {
      md += `## 其他任務 / OTHER TASKS\n\n`;
      genericTasks.forEach(task => {
          md += `### ${task.id}: ${task.title} (${task.status})\n`;
          if (task.description) md += `\n${task.description}\n`;
          md += `\n---\n\n`;
      });
  }

  return md;
}

/**
 * Utility to download string content as a file.
 * Uses Tauri Native Dialog if available, fallback to browser blob.
 */
export async function downloadMarkdown(content: string, filename: string = 'tasks-export.md') {
  console.log('[mdExport] Triggering download for', filename);
  
  try {
      const isTauri = (window as any).__TAURI_INTERNALS__ !== undefined;
      
      if (isTauri) {
          console.log('[mdExport] Detected Tauri environment, using native save_md_file');
          await invoke('save_md_file', { content, filename });
          return;
      }

      // Fallback
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
      }, 100);
  } catch (err) {
      console.error('[mdExport] Download failed:', err);
      alert('導出失敗：' + (err as Error).message);
  }
}
