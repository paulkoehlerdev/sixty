import { SendIcon } from "lucide-react";
import React, { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";

type Props = {
  placeholder: string;
  sendChatMessage: (message: string) => void;
};

export const ChatInput: React.FC<Props> = ({ placeholder, sendChatMessage }) => {
  const [userMessage, setUserMessage] = useState<string>("");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (userMessage === "") {
      return;
    }

    sendChatMessage(userMessage);

    setUserMessage("");

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="flex w-full items-center rounded-full border bg-card py-1.5 pr-1.5 pl-2.5">
        <Input
          placeholder={placeholder}
          className="border-none shadow-none focus-visible:ring-0"
          // autoFocus={true}
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
        />
        <Button className="aspect-square h-10 rounded-3xl p-0" type="submit" disabled={userMessage === ""}>
          <SendIcon />
        </Button>
      </div>
    </form>
  );
};
