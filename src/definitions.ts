import { Language } from "./vascular/index";

export interface Config {
  apiKey: string;
  appKey: string;
  userId: string;
  endpoint: string;
  languages?: Language[];
}

export interface IMessageData {
    title: string;
    body: string;
    media: IMedia;
    actions: IAction[];
    metadata: string;
    subTitle: string;
    language: string;
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