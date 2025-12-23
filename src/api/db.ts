/**
 * Database API - Tauri Commands for persisting Tasks and Roles
 */
import { invoke } from '@tauri-apps/api/core';
import { Task } from '../components/features/KanbanBoard';
import { AgentRole } from '../components/features/RoleSettingsPage';

// ============ Type Mapping ============
interface DbTask {
    id: string;
    title: string;
    description: string | null;
    status: string;
    phase: string | null;
    priority: string | null;
    tag: string | null;
    assignee: string | null;
    is_reworked: boolean | null;
}

interface DbRole {
    id: string;
    name: string;
    agent_name: string;
    role_type: string;
    system_prompt: string | null;
    is_default: boolean;
}

// ============ Task API ============
export async function fetchTasks(): Promise<Task[]> {
    try {
        const dbTasks = await invoke<DbTask[]>('get_tasks');
        return dbTasks.map(t => ({
            id: t.id,
            title: t.title,
            description: t.description || undefined,
            status: t.status as Task['status'],
            phase: t.phase || 'PHASE 1',
            priority: t.priority || '3',
            tag: t.tag || undefined,
            assignee: t.assignee || undefined,
            isReworked: t.is_reworked || false,
        }));
    } catch (err) {
        console.error('[DB] Failed to fetch tasks:', err);
        return [];
    }
}

export async function createTask(task: Task): Promise<void> {
    try {
        await invoke('create_task', {
            task: {
                id: task.id,
                title: task.title,
                description: task.description || null,
                status: task.status,
                phase: task.phase || 'PHASE 1',
                priority: task.priority || '3',
                tag: task.tag || null,
                assignee: task.assignee || null,
                is_reworked: task.isReworked || false,
            }
        });
    } catch (err) {
        console.error('[DB] Failed to create task:', err);
        throw err;
    }
}

export async function updateTask(task: Task): Promise<void> {
    try {
        await invoke('update_task', {
            task: {
                id: task.id,
                title: task.title,
                description: task.description || null,
                status: task.status,
                phase: task.phase || null,
                priority: task.priority || null,
                tag: task.tag || null,
                assignee: task.assignee || null,
                is_reworked: task.isReworked || false,
            }
        });
    } catch (err) {
        console.error('[DB] Failed to update task:', err);
        throw err;
    }
}

export async function deleteTask(id: string): Promise<void> {
    try {
        await invoke('delete_task', { id });
    } catch (err) {
        console.error('[DB] Failed to delete task:', err);
        throw err;
    }
}

export async function deleteAllTasks(): Promise<void> {
    try {
        await invoke('delete_all_tasks');
    } catch (err) {
        console.error('[DB] Failed to delete all tasks:', err);
        throw err;
    }
}

// ============ Role API ============
export async function fetchRoles(): Promise<AgentRole[]> {
    try {
        const dbRoles = await invoke<DbRole[]>('get_roles');
        return dbRoles.map(r => ({
            id: r.id,
            name: r.name,
            agentName: r.agent_name,
            type: r.role_type as 'ai' | 'human',
            systemPrompt: r.system_prompt || undefined,
            isDefault: r.is_default,
        }));
    } catch (err) {
        console.error('[DB] Failed to fetch roles:', err);
        return [];
    }
}

export async function createRole(role: AgentRole): Promise<void> {
    try {
        await invoke('create_role', {
            role: {
                id: role.id,
                name: role.name,
                agent_name: role.agentName,
                role_type: role.type,
                system_prompt: role.systemPrompt || null,
                is_default: role.isDefault || false,
            }
        });
    } catch (err) {
        console.error('[DB] Failed to create role:', err);
        throw err;
    }
}

export async function updateRole(role: AgentRole): Promise<void> {
    try {
        await invoke('update_role', {
            role: {
                id: role.id,
                name: role.name,
                agent_name: role.agentName,
                role_type: role.type,
                system_prompt: role.systemPrompt || null,
                is_default: role.isDefault || false,
            }
        });
    } catch (err) {
        console.error('[DB] Failed to update role:', err);
        throw err;
    }
}

export async function deleteRole(id: string): Promise<void> {
    try {
        await invoke('delete_role', { id });
    } catch (err) {
        console.error('[DB] Failed to delete role:', err);
        throw err;
    }
}
