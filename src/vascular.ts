import { DeleteMessageRequest, MessageReply } from "vascular/message_pb.d copy";
import {
  InboxClient,
  MessageClient,
  UserClient,
  TagClient,
  Next,
  Language,
  GetInboxMessagesReply,
  GetInboxMessagesRequest,
  InboxMessage,
  GetMessageByIdRequest,
  CreateUserRequest,
  CreateUserReply,
  GetUserRequest,
  GetUserReply,
  ChangeMessagesStateRequest,
  AddTagsRequest,
  TagsReply,
  TagData,
  GetUserTagsRequest,
  GetUserTagsReply,
  DeleteTagsRequest,
} from "./vascular/index";

export default class Vascular {
  private endpoint = "http://localhost:8080";
  private inboxClient: InboxClient;
  private messageClient: MessageClient;
  private userClient: UserClient;
  private tagClient: TagClient;
  private next?: Next;

  constructor(
    private appKey: string,
    private userId: string,
    private languages: Language[]
  ) {
    this.inboxClient = new InboxClient(this.endpoint, null, null);
    this.messageClient = new MessageClient(this.endpoint, null, null);
    this.userClient = new UserClient(this.endpoint, null, null);
    this.tagClient = new TagClient(this.endpoint, null, null);
  }

  createUser(userId?: string): Promise<CreateUserReply> {
    const request = new CreateUserRequest();
    request.setAppKey(this.appKey);
    request.setUserId(userId ?? this.userId);
    return new Promise((resolve, reject) => {
      this.userClient.createUser(
        request,
        null,
        (err, response: CreateUserReply) => {
          if (err) {
            reject(err);
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  getUser(userId?: string): Promise<GetUserReply> {
    const request = new GetUserRequest();
    request.setAppKey(this.appKey);
    request.setUserId(userId ?? this.userId);
    return new Promise((resolve, reject) => {
      this.userClient.getUser(request, null, (err, response: GetUserReply) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  }

  inbox(): Promise<GetInboxMessagesReply> {
    const request = new GetInboxMessagesRequest();
    request.setAppKey(this.appKey);
    request.setUserId(this.userId);
    request.setNext(undefined);
    request.setLangaugesList(this.languages);
    return new Promise((resolve, reject) => {
      this.inboxClient.getInboxMessages(
        request,
        null,
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

  inboxNext(): Promise<GetInboxMessagesReply> {
    const request = new GetInboxMessagesRequest();
    request.setAppKey(this.appKey);
    request.setUserId(this.userId);
    request.setNext(this.next);
    request.setLangaugesList(this.languages);
    return new Promise((resolve, reject) => {
      this.inboxClient.getInboxMessages(
        request,
        null,
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
    const request = new GetMessageByIdRequest();
    request.setAppKey(this.appKey);
    request.setUserId(this.userId);
    request.setMessageId(messageId);

    return new Promise((resolve, reject) => {
      this.messageClient.getMessageById(
        request,
        null,
        (err, response: InboxMessage) => {
          if (err) reject(err);
          resolve(response);
        }
      );
    });
  }

  readMessages(messageIds: string[]): Promise<string> {
    const request = new ChangeMessagesStateRequest();
    request.setAppKey(this.appKey);
    request.setIdsList(messageIds);
    request.setUserId(this.userId);
    return new Promise((resolve, reject) => {
      this.messageClient.readMessages(
        request,
        null,
        (err, response: MessageReply) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.getStatus());
          }
        }
      );
    });
  }

  openMessages(messageIds: string[]): Promise<string> {
    const request = new ChangeMessagesStateRequest();
    request.setAppKey(this.appKey);
    request.setIdsList(messageIds);
    request.setUserId(this.userId);
    return new Promise((resolve, reject) => {
      this.messageClient.openMessages(
        request,
        null,
        (err, response: MessageReply) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.getStatus());
          }
        }
      );
    });
  }

  deleteMessage(messageId: string): Promise<string> {
    const request = new DeleteMessageRequest();
    request.setAppKey(this.appKey);
    request.setMessageId(messageId);
    request.setUserId(this.userId);
    return new Promise((resolve, reject) => {
      this.messageClient.deleteMessage(
        request,
        null,
        (err, response: MessageReply) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.getStatus());
          }
        }
      );
    });
  }

  addTags(tagNames: string[]): Promise<string> {
    const request = new AddTagsRequest();
    request.setAppKey(this.appKey);
    request.setUserId(this.userId);
    request.setNamesList(tagNames);
    return new Promise((resolve, reject) => {
      this.tagClient.addTags(request, null, (err, response: TagsReply) => {
        if (err) {
          reject(err);
        } else {
          resolve(response.getStatus());
        }
      });
    });
  }

  async deleteTags(tagNames: string[]): Promise<string> {
    const tags = await this.tags();
    const uuids = tagNames
      .map((tagName) => this.getTagUUID(tags, tagName))
      .filter((tag) => Boolean(tag)) as string[];

    if (uuids.length <= 0) return "Nothing to be deleted";

    const request = new DeleteTagsRequest();
    request.setAppKey(this.appKey);
    request.setUserId(this.userId);
    request.setUuidsList(uuids);
    return new Promise((resolve, reject) => {
      this.tagClient.deleteTags(request, null, (err, response: TagsReply) => {
        if (err) {
          reject(err);
        } else {
          resolve(response.getStatus());
        }
      });
    });
  }

  tags(): Promise<TagData[]> {
    const request = new GetUserTagsRequest();
    request.setAppKey(this.appKey);
    request.setUserId(this.userId);
    return new Promise((resolve, reject) => {
      this.tagClient.getUserTags(
        request,
        null,
        (err, response: GetUserTagsReply) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.getTagsList());
          }
        }
      );
    });
  }

  private getTagUUID(
    allTags: TagData[],
    targetTag: string
  ): string | undefined {
    return allTags.find((tag) => tag.getName() === targetTag)?.getUuid();
  }
}
