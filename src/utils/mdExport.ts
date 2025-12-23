import { Task } from '../components/features/KanbanBoard';
import { AgentRole } from '../components/features/RoleSettingsPage';
import { invoke } from '@tauri-apps/api/core';

/**
 * Generates a full project context for synchronization
 */
export function generateProjectContext(tasks: Task[], roles: AgentRole[]): string {
  let md = "# TaskRails Project Context\n\n";
  md += "此檔案由 TaskRails 自動生成，用於工作區同步與 AI 上下文讀取。\n\n";

  // Section 1: Role Registry
  md += "## ROLE REGISTRY\n\n";
  roles.forEach(role => {
    md += `### ROLE: ${role.agentName} (${role.name})\n`;
    md += `- **ID**: ${role.id}\n`;
    md += `- **Type**: ${role.type}\n`;
    md += `- **Default**: ${role.isDefault ? 'Yes' : 'No'}\n`;
    if (role.systemPrompt) {
      md += `\n> ${role.systemPrompt.replace(/\n/g, '\n> ')}\n`;
    }
    md += `\n---\n\n`;
  });

  // Section 2: Mission Board (Tasks)
  md += "## MISSION BOARD\n\n";
  const statusLabels: Record<string, string> = {
    todo: "待辦事項 / TODO",
    doing: "進行中 / IN PROGRESS",
    done: "已完成 / COMPLETED"
  };

  const statusValues = ['todo', 'doing', 'done'];
  
  statusValues.forEach(status => {
    const columnTasks = tasks.filter(t => t.status === status);
    if (columnTasks.length === 0) return;

    md += `### [STATUS: ${statusLabels[status]}]\n\n`;
    
    columnTasks.forEach(task => {
      md += `#### ${task.id}: ${task.title}\n`;
      md += `- **Phase**: ${task.phase}\n`;
      md += `- **Priority**: P${task.priority}\n`;
      if (task.tag) md += `- **Tag**: ${task.tag}\n`;
      if (task.assignee) md += `- **Assignee**: ${task.assignee}\n`;
      if (task.isReworked) md += `- **Flags**: [REWORKED]\n`;
      
      if (task.description) {
        md += `\n${task.description}\n`;
      }
      md += `\n---\n\n`;
    });
  });

  return md;
}

/**
 * Legacy support for simple task export
 */
export function generateTaskMarkdown(tasks: Task[]): string {
  return generateProjectContext(tasks, []);
}

/**
 * Utility to download string content as a file.
 */
export async function downloadMarkdown(content: string, filename: string = 'tasks-export.md') {
  try {
      const isTauri = (window as any).__TAURI_INTERNALS__ !== undefined;
      
      if (isTauri) {
          await invoke('save_md_file', { content, filename });
          return;
      }

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
  }
}
