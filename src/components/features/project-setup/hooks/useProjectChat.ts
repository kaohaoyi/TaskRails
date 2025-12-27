import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Message } from '../../../../types/project-setup';
import { 
    ProjectConfig, 
    Language,
    getProjectSetupSystemPrompt,
    parseProjectConfigFromAI,
    checkProjectCompleteness
} from '../../../../utils/projectConfig';
import { PROVIDER_MODELS } from '../../../../constants/ai-models';

interface UseProjectChatProps {
    projectConfig: ProjectConfig;
    setProjectConfig: React.Dispatch<React.SetStateAction<ProjectConfig>>;
}

export function useProjectChat({ projectConfig, setProjectConfig }: UseProjectChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: '嗨！我是你的專案配置助手。請告訴我你想做什麼樣的專案？' }
    ]);
    const [isThinking, setIsThinking] = useState(false);
    const [isComposing, setIsComposing] = useState(false);
    
    // AI Settings State
    const [currentProvider, setCurrentProvider] = useState<string>('google');
    const [currentModel, setCurrentModel] = useState<string>('gemini-2.0-flash');
    const [outputLanguage, setOutputLanguage] = useState<Language>('zh-TW');
    const [showAiSettings, setShowAiSettings] = useState(false);
    const [availableProviders, setAvailableProviders] = useState<string[]>(['google', 'openai', 'anthropic', 'ollama']);
    
    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load AI Settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                // Load AI provider settings
                const available: string[] = ['ollama', 'custom'];
                for (const p of Object.keys(PROVIDER_MODELS)) {
                    if (p === 'ollama' || p === 'custom') continue;
                    try {
                        // 嘗試從 Tauri 讀取
                        let key: string | null = null;
                        try {
                            key = await invoke<string | null>('get_setting', { key: `ai_api_key_${p}` });
                        } catch {
                            // Tauri 不可用，從 localStorage 讀取
                        }
                        
                        // Fallback 到 localStorage
                        if (!key) {
                            key = localStorage.getItem(`taskrails_api_key_${p}`);
                        }
                        
                        if (key && key.trim().length > 0) {
                            available.push(p);
                        }
                    } catch (e) {
                         // Key not found
                    }
                }
                setAvailableProviders(available);
                
                // 嘗試從 Tauri 或 localStorage 讀取 provider/model
                let provider: string | null = null;
                let model: string | null = null;
                try {
                    provider = await invoke<string | null>('get_setting', { key: 'ai_provider' });
                    model = await invoke<string | null>('get_setting', { key: 'ai_model' });
                } catch {
                    // Fallback
                }
                if (!provider) provider = localStorage.getItem('taskrails_ai_provider');
                if (!model) model = localStorage.getItem('taskrails_ai_model');
                
                if (provider && available.includes(provider)) {
                    setCurrentProvider(provider);
                    if (model) setCurrentModel(model);
                } else if (available.length > 0) {
                    setCurrentProvider(available[0]);
                    setCurrentModel(PROVIDER_MODELS[available[0]]?.[0] || '');
                }
                
                const savedLang = localStorage.getItem('taskrails_output_language');
                if (savedLang) setOutputLanguage(savedLang as Language);
            } catch (e) {
                console.error('Failed to load settings:', e);
            }
        };
        loadSettings();
    }, []);

    // Save AI Settings on change
    useEffect(() => {
        localStorage.setItem('taskrails_ai_provider', currentProvider);
        localStorage.setItem('taskrails_ai_model', currentModel);
        localStorage.setItem('taskrails_output_language', outputLanguage);
    }, [currentProvider, currentModel, outputLanguage]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (content: string) => {
        if (!content.trim() || isThinking) return;
        
        const newMessages: Message[] = [...messages, { role: 'user', content }];
        setMessages(newMessages);
        setIsThinking(true);
        
        try {
            // Calculate completeness for context
            const completenessCheck = checkProjectCompleteness(projectConfig);
            
            // Include current config state in context - 讓 AI 知道要追問什麼
            const configContext = `
## 📊 當前專案配置狀態

| 項目 | 狀態 | 值 |
|------|------|-----|
| 專案名稱 | ${projectConfig.projectName ? '✅ 已設定' : '❌ 未設定'} | ${projectConfig.projectName || '-'} |
| 專案目標 | ${projectConfig.projectGoal ? '✅ 已設定' : '❌ 未設定'} | ${projectConfig.projectGoal?.slice(0, 30) || '-'}${projectConfig.projectGoal && projectConfig.projectGoal.length > 30 ? '...' : ''} |
| 技術棧 | ${projectConfig.techStack.length > 0 ? '✅ 已設定' : '❌ 未設定'} | ${projectConfig.techStack.join(', ') || '-'} |
| 功能清單 | ${projectConfig.features.length > 0 ? '✅ 已設定' : '❌ 未設定'} | ${projectConfig.features.length > 0 ? `${projectConfig.features.length} 項功能` : '-'} |

**完成度：${completenessCheck.progress}%**

## ⚠️ 你的下一步行動

${completenessCheck.missingRequired.length > 0 ? `
**必須追問以下項目：** ${completenessCheck.missingRequired.join('、')}

請用友善的方式詢問使用者，例如：
${completenessCheck.missingRequired.includes('專案名稱') ? '- 「這個專案要叫什麼名字呢？」\n' : ''}${completenessCheck.missingRequired.includes('專案目標') ? '- 「可以詳細描述一下這個專案的目標嗎？例如要解決什麼問題？」\n' : ''}${completenessCheck.missingRequired.includes('技術棧') ? '- 「你有偏好的技術棧嗎？例如前端用 React 還是 Vue？後端用什麼語言？」\n' : ''}${completenessCheck.missingRequired.includes('功能清單') ? '- 「可以列出幾個核心功能嗎？例如使用者要能做什麼？」\n' : ''}
**重要：當使用者回答後，一定要用標記語法記錄！**
例如：/專案名稱/*xxx*、/技術棧/*React*, *Node.js*
` : `
🎉 **所有必填項目已完成！**
請生成完整的 JSON 配置，包含 agents、diagrams、tasks。
`}
`;
            
            const apiMessages = [
                { role: 'system', content: getProjectSetupSystemPrompt(outputLanguage) + '\n\n' + configContext },
                ...newMessages
            ];
            
            const response = await invoke<string>('execute_ai_chat', { 
                messages: apiMessages,
                overrideProvider: currentProvider,
                overrideModel: currentModel
            });
            
            // Parse AI response for config updates
            const parsedConfig = parseProjectConfigFromAI(response);
            if (Object.keys(parsedConfig).length > 0) {
                setProjectConfig(prev => ({
                    ...prev,
                    ...parsedConfig,
                    techStack: parsedConfig.techStack?.length ? parsedConfig.techStack : prev.techStack,
                    features: parsedConfig.features?.length ? parsedConfig.features : prev.features,
                    generatedAgents: parsedConfig.generatedAgents || prev.generatedAgents,
                    generatedDiagrams: parsedConfig.generatedDiagrams || prev.generatedDiagrams,
                    generatedTasks: parsedConfig.generatedTasks || prev.generatedTasks
                }));
            }
            
            setMessages(msgs => [...msgs, { role: 'assistant', content: response }]);
        } catch (err) {
            setMessages(msgs => [...msgs, { role: 'assistant', content: `❌ 錯誤：${err}` }]);
        } finally {
            setIsThinking(false);
        }
    };

    return {
        messages,
        setMessages,
        isThinking,
        isComposing, setIsComposing,
        currentProvider, setCurrentProvider,
        currentModel, setCurrentModel,
        outputLanguage, setOutputLanguage,
        showAiSettings, setShowAiSettings,
        availableProviders,
        handleSendMessage,
        messagesEndRef
    };
}
