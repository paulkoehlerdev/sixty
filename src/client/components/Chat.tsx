import React, { useCallback, useEffect, useRef } from 'react';
import type { UIMessage } from 'ai';
import { DotIcon } from 'lucide-react';

type Props = {
    messages: UIMessage[];
    isWaitingForResponse: boolean;
};

export const Chat: React.FC<Props> = ({ messages, isWaitingForResponse }) => {
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages, scrollToBottom]);

    return (
        <div className="flex flex-col gap-8 mb-10">
            {messages.map(message => {
                switch (message.role) {
                    case 'user':
                        return <UserMessage key={message.id} message={message} />;

                    case 'assistant':
                        return <AssistantMessage key={message.id} message={message} />;

                    case 'system':
                        return <React.Fragment key={message.id} />;
                }
            })}

            <div>{isWaitingForResponse && <DotIcon className="stroke-8 animate-pulse" />}</div>

            <div ref={chatEndRef} />
        </div>
    );
};

const UserMessage: React.FC<{ message: UIMessage }> = ({ message }) => {
    const text = message.parts
        .filter(part => part.type === 'text')
        .map(part => part.text)
        .join('; ');

    return (
        <div className="w-full flex justify-end mt-8">
            <div className="max-w-[70%] bg-muted px-5 py-2.5 rounded-xl">{text}</div>
        </div>
    );
};

const AssistantMessage: React.FC<{ message: UIMessage }> = ({ message }) => {
    return (
        <div className="w-full grid gap-3">
            {message.parts.map((part, index) => {
                switch (part.type) {
                    case 'text':
                        return (
                            <div className="w-full whitespace-pre-wrap text-wrap" key={index}>
                                {part.text}
                            </div>
                        );

                    case 'tool-exampleTool':
                        return (
                            <div key={part.toolCallId}>
                                {JSON.stringify(part)}
                            </div>
                        );

                    case 'step-start':
                        return <React.Fragment key={index} />;

                    default:
                        return (
                            <div key={index}>
                                [UNKNOWN PART TYPE: {part.type}] {JSON.stringify(part)}
                            </div>
                        );
                }
            })}
        </div>
    );
};
