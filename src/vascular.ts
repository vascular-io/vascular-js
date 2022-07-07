import {
  InboxClient, 
  MessageClient, 
  Next,
  Language,
  GetInboxMessagesReply,
  GetInboxMessagesRequest,
  InboxMessage,
  GetMessageByIdRequest
} from './vascular/index';

export default class Vascular {
  private endpoint = "http://localhost:8080";
  private inboxClient: InboxClient;
  private messageClient: MessageClient;
  private next?: Next;

  constructor(
    private appKey: string,
    private userId: string,
    private languages: Language[]
  ) {
    this.inboxClient = new InboxClient(this.endpoint, null, null);
    this.messageClient = new MessageClient(this.endpoint, null, null);
  }

  inbox(): Promise<GetInboxMessagesReply> {
    const request = new GetInboxMessagesRequest;
    request.setAppKey(this.appKey);
    request.setUserId(this.userId);
    request.setNext(undefined);
    request.setLangaugesList(this.languages);
    return new Promise((resolve, reject) => {
      this.inboxClient.getInboxMessages(request, null,
        (err, response: GetInboxMessagesReply) => {
          if (err) {
            reject(err);
          } else {
            const uuid: string = response.getNext()?.getUuid() || "";
            const createdAt: string = response.getNext()?.getCreatedAt() || "";
            this.next?.setUuid(uuid);
            this.next?.setCreatedAt(createdAt);
            resolve(response);
          }
        }
      );
    });
  }

  getMessageById(messageId: string): Promise<InboxMessage> {
    const request = new GetMessageByIdRequest;
    request.setAppKey(this.appKey);
    request.setUserId(this.userId);
    request.setMessageId(messageId);

    return new Promise((resolve, reject) => {
      this.messageClient.getMessageById(request, null,
        (err, response: InboxMessage) => {
          if (err) reject(err);
          resolve(response);
        }
      );
    });
  }
}
