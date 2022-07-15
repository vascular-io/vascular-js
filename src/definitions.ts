import { MessageAction, MessageMedia } from "./vascular/index";

export interface IMessageData {
    title: string;
    body: string;
    media: MessageMedia;
    actions: MessageAction;
    metadata: string;
    sub_title: string;
}

export interface IInboxMessage {
    uuid: string;
    status: number;
    provider: number;
    created_at: string;
    expdate: string;
    type: number;
    messageData: { [index: number]: IMessageData }
}

export interface IAction {
    name: string;
    value: string;
}
export interface IMedia {
    thumbnail: string;
    image: string;
}