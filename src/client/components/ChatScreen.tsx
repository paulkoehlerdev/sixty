import React, { useState } from 'react';
import { useAgent } from 'agents/react';
import { useAgentChat } from 'agents/ai-react';
import type { UIMessage } from 'ai';
import { ChatInput } from '@/client/components/ChatInput.tsx';
import { Chat } from '@/client/components/Chat.tsx';

type AgentState = {};

export const ChatScreen: React.FC<{ sessionID: string }> = ({ sessionID }) => {
    const [agentState, setAgentState] = useState<AgentState>({});

    const agent = useAgent<AgentState>({
        agent: 'sixty-agent',
        name: sessionID,
        onStateUpdate: newState => setAgentState(newState),
        onOpen: () => console.log('Connection to Sixty established'),
        onClose: () => console.log('Connection to Sixty closed'),
    });

    const agentChat = useAgentChat<AgentState, UIMessage>({ agent });

    const isAgentReadyForNextMessage = agentChat.status === 'ready';

    const sendChatMessage = (message: string) => {
        if (!isAgentReadyForNextMessage) {
            return;
        }

        agentChat.sendMessage({
            role: 'user',
            parts: [{ type: 'text', text: message }],
        });
    };

    const clearHistory = () => {
        agentChat.clearHistory();
        agent.setState({});
    };

    // TEMP
    console.log(agentState);

    return (
        <div className="w-full h-svh grid grid-rows-[1fr_170px]">
            <div
                className="overflow-auto grid justify-items-center p-4"
                style={{ scrollbarGutter: 'stable both-edges' }}
            >
                <div className="w-full max-w-[850px]">
                    <Chat
                        messages={agentChat.messages}
                        isWaitingForResponse={agentChat.status === 'submitted'}
                    />
                </div>
            </div>

            <div className="grid justify-items-center p-4">
                <div className="w-full max-w-[850px]">
                    <ChatInput
                        placeholder="Send a message"
                        sendChatMessage={sendChatMessage}
                    />

                    <div className="text-xs mt-2 text-center w-full inline-block">
                        <a className="underline cursor-pointer hover:text-primary" onClick={() => clearHistory()}>
                            Or delete this conversation
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
