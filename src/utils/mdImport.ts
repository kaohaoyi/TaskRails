import { Task } from '../components/features/KanbanBoard';
import { AgentRole } from '../components/features/RoleSettingsPage';
import { TaskStatus } from '../components/features/TaskDetailModal';

export interface ProjectContext {
    tasks: Task[];
    roles: AgentRole[];
}

export function parseProjectContext(content: string): ProjectContext {
    const tasks: Task[] = [];
    const roles: AgentRole[] = [];
    const lines = content.split('\n');
    
    let currentSection: 'NONE' | 'ROLES' | 'TASKS' = 'NONE';
    let currentTask: any = null;
    let currentRole: any = null;
    let currentStatus: TaskStatus = 'todo';
    
    let capturingDescription = false;
    let descriptionLines: string[] = [];
    let promptLines: string[] = [];

    const statusMap: Record<string, TaskStatus> = {
        'TODO': 'todo',
        '待辦事項': 'todo',
        'IN PROGRESS': 'doing',
        '進行中': 'doing',
        'COMPLETED': 'done',
        '已完成': 'done'
    };

    lines.forEach(line => {
        const trimmed = line.trim();
        
        // 1. Detect Sections
        if (line.startsWith('## ')) {
            const header = line.replace('## ', '').toUpperCase();
            if (header.includes('ROLE REGISTRY')) {
                currentSection = 'ROLES';
            } else if (header.includes('MISSION BOARD')) {
                currentSection = 'TASKS';
            }
            return;
        }

        // ============ ROLE PARSING ============
        if (currentSection === 'ROLES') {
            const roleHeaderMatch = line.match(/^### ROLE:\s*(.*)\s*\((.*)\)/);
            if (roleHeaderMatch) {
                if (currentRole && currentRole.id) {
                    currentRole.systemPrompt = promptLines.join('\n').trim();
                    roles.push(currentRole as AgentRole);
                }
                currentRole = {
                    agentName: roleHeaderMatch[1].trim(),
                    name: roleHeaderMatch[2].trim(),
                };
                promptLines = [];
                return;
            }

            if (!currentRole) return;

            if (line.startsWith('- **ID**:')) {
                currentRole.id = line.replace('- **ID**:', '').trim();
                return;
            }
            if (line.startsWith('- **Type**:')) {
                currentRole.type = line.replace('- **Type**:', '').trim().toLowerCase() as 'ai' | 'human';
                return;
            }
            if (line.startsWith('- **Default**:')) {
                currentRole.isDefault = line.replace('- **Default**:', '').trim() === 'Yes';
                return;
            }

            if (line.startsWith('> ')) {
                promptLines.push(line.replace('> ', ''));
                return;
            }

            if (trimmed === '---') {
                if (currentRole && currentRole.id) {
                    currentRole.systemPrompt = promptLines.join('\n').trim();
                    roles.push(currentRole as AgentRole);
                    currentRole = null;
                }
                return;
            }
        }

        // ============ TASK PARSING ============
        if (currentSection === 'TASKS') {
            // Check status sub-header
            if (line.startsWith('### [STATUS:')) {
                const header = line.toUpperCase();
                for (const [key, status] of Object.entries(statusMap)) {
                    if (header.includes(key)) {
                        currentStatus = status;
                        break;
                    }
                }
                return;
            }

            const taskHeaderMatch = line.match(/^#### (TSK-\d+):\s*(.*)/);
            if (taskHeaderMatch) {
                if (currentTask && currentTask.id) {
                    currentTask.description = descriptionLines.join('\n').trim();
                    tasks.push(currentTask as Task);
                }
                currentTask = {
                    id: taskHeaderMatch[1],
                    title: taskHeaderMatch[2],
                    status: currentStatus,
                };
                descriptionLines = [];
                capturingDescription = false;
                return;
            }

            if (!currentTask) return;

            if (line.startsWith('- **Phase**:')) {
                currentTask.phase = line.replace('- **Phase**:', '').trim();
                return;
            }
            if (line.startsWith('- **Priority**:')) {
                currentTask.priority = line.replace('- **Priority**:', '').trim().replace('P', '');
                return;
            }
            if (line.startsWith('- **Tag**:')) {
                currentTask.tag = line.replace('- **Tag**:', '').trim();
                return;
            }
            if (line.startsWith('- **Assignee**:')) {
                currentTask.assignee = line.replace('- **Assignee**:', '').trim();
                return;
            }
            if (line.startsWith('- **Flags**:')) {
                if (line.includes('[REWORKED]')) {
                    currentTask.isReworked = true;
                }
                return;
            }

            if (trimmed === '---') {
                if (currentTask && currentTask.id) {
                    currentTask.description = descriptionLines.join('\n').trim();
                    tasks.push(currentTask as Task);
                    currentTask = null;
                }
                return;
            }

            // Capture Description
            if (currentTask) {
                if (trimmed === '' && !capturingDescription && descriptionLines.length === 0) {
                    capturingDescription = true; 
                    return;
                }
                if (capturingDescription || (trimmed !== '' && !line.startsWith('-'))) {
                    capturingDescription = true;
                    descriptionLines.push(line);
                }
            }
        }
    });

    // Cleanup last items
    if (currentRole && currentRole.id) {
        currentRole.systemPrompt = promptLines.join('\n').trim();
        roles.push(currentRole as AgentRole);
    }
    
    if (currentTask && currentTask.id) {
        currentTask.description = descriptionLines.join('\n').trim();
        tasks.push(currentTask as Task);
    }

    return { tasks, roles };
}

/**
 * Legacy support for simple task parsing
 */
export function parseTaskMarkdown(content: string): Task[] {
    return parseProjectContext(content).tasks;
}
