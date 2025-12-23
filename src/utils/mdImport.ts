import { Task } from '../components/features/KanbanBoard';
import { TaskStatus } from '../components/features/TaskDetailModal';

export function parseTaskMarkdown(content: string): Task[] {
    const tasks: Task[] = [];
    const lines = content.split('\n');
    
    let currentStatus: TaskStatus = 'todo';
    let currentTask: Partial<Task> | null = null;
    let capturingDescription = false;
    let descriptionLines: string[] = [];

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
        
        // 1. Detect Section Headers (Status)
        if (line.startsWith('## ')) {
            const header = line.replace('## ', '').toUpperCase();
            for (const [key, status] of Object.entries(statusMap)) {
                if (header.includes(key)) {
                    currentStatus = status;
                    break;
                }
            }
            return;
        }

        // 2. Detect Task Header (### ID: Title)
        const taskHeaderMatch = line.match(/^### (TSK-\d+):\s*(.*)/);
        if (taskHeaderMatch) {
            // Save previous task if exists
            if (currentTask && currentTask.id) {
                currentTask.description = descriptionLines.join('\n').trim();
                tasks.push(currentTask as Task);
            }

            // Start new task
            currentTask = {
                id: taskHeaderMatch[1],
                title: taskHeaderMatch[2],
                status: currentStatus,
                phase: 'PHASE 1',
                priority: '3',
                isReworked: false
            };
            descriptionLines = [];
            capturingDescription = false;
            return;
        }

        if (!currentTask) return;

        // 3. Detect Metadata
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
        if (line.startsWith('- **Status**:')) {
            if (line.includes('[REWORKED]')) {
                currentTask.isReworked = true;
            }
            return;
        }

        // 4. Detect Separator or Empty lines before description
        if (trimmed === '---') {
            if (currentTask && currentTask.id) {
                currentTask.description = descriptionLines.join('\n').trim();
                tasks.push(currentTask as Task);
                currentTask = null;
            }
            return;
        }

        // 5. Capture Description
        // If we reach here and it's not a metadata line, it's either an empty line or description
        if (currentTask) {
            // Start capturing description after the first empty line or non-bullet line
            if (trimmed === '' && !capturingDescription && descriptionLines.length === 0) {
                // Usually an empty line follows metadata before description starts
                capturingDescription = true; 
                return;
            }
            
            if (capturingDescription || trimmed !== '') {
                capturingDescription = true;
                descriptionLines.push(line);
            }
        }
    });

    // Push the last task if exists and not followed by ---
    const lastTask = currentTask as any;
    if (lastTask && lastTask.id) {
        lastTask.description = descriptionLines.join('\n').trim();
        tasks.push(lastTask as Task);
    }

    console.log('[mdImport] Successfully parsed', tasks.length, 'tasks');
    return tasks;
}
