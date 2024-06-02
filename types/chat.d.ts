export interface Chat {
    id: string;
    title: string;
    updateTime: number;
    // model: string;
}
export interface Message {
    id: string;
    content: string;
    role:'user'|'assistant';
    chatId: string;
    model: string;
}
export interface MessageRequestBody {
    message: Message[];
    model: string;
}