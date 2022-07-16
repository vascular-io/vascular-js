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
  GetUserTagsRequest,
  GetUserTagsReply,
  DeleteTagsRequest,
  DeleteMessageRequest,
  MessageReply,
} from "./vascular/index";

type User = {
  uuid: string;
  createdAt: string;
  metadata: string;
};

type Message = any;

type Tag = {
  uuid: string;
  name: string;
  createdAt: string;
};

export default class Vascular {
  private endpoint = "https://api.vascular.io:8080";
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

  getUser(userId?: string): Promise<User> {
    const request = new GetUserRequest();
    request.setAppKey(this.appKey);
    request.setUserId(userId ?? this.userId);
    return new Promise((resolve, reject) => {
      this.userClient.getUser(request, null, (err, response: GetUserReply) => {
        if (err) {
          reject(err);
        } else {
          resolve(response.toObject());
        }
      });
    });
  }

  inbox(): Promise<Message[]> {
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
            const messages = response
              .getMessagesList()
              .map((message) => this.mapMessage(message));
            resolve(messages);
          }
        }
      );
    });
  }

  inboxNext(): Promise<Message[]> {
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
            const messages = response
              .getMessagesList()
              .map((message) => this.mapMessage(message));
            resolve(messages);
          }
        }
      );
    });
  }

  getMessageById(messageId: string): Promise<Message> {
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
          resolve(this.mapMessage(response));
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

  tags(): Promise<Tag[]> {
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
            resolve(response.getTagsList().map((tag) => tag.toObject()));
          }
        }
      );
    });
  }

  private getTagUUID(allTags: Tag[], targetTag: string): string | undefined {
    return allTags.find((tag) => tag.name === targetTag)?.uuid;
  }

  private mapMessage(inboxMessage: InboxMessage) {
    const self = this;
    let messagesMap = {};
    const msg = inboxMessage.getMessageMap();
    const languages = [1, 0, 2];
    languages.map((lang) => {
      let langEnum = "enUs";
      if (lang === 1) {
        langEnum = "enUk";
      } else if (lang === 2) {
        langEnum = "nb";
      }

      const data = msg.get(langEnum);
      if (!data) {
        return false; // skip
      }
      messagesMap = Object.assign(
        {
          [lang]: {
            title: data.getTitle(),
            subTitle: data.getSubTitle(),
            body: data.getBody(),
            media: {
              image: data.getMedia()?.getImage,
              thumbnail: data.getMedia()?.getThumbnail,
            },
            actions: self.getMessageActions(data.getActionsList()),
          },
        },
        messagesMap
      );
    });

    return {
      uuid: inboxMessage.getUuid(),
      status: inboxMessage.getStatus(),
      provider: inboxMessage.getProvider(),
      created_at: inboxMessage.getCreatedAt(),
      expdate: inboxMessage.getExpdate(),
      type: inboxMessage.getType(),
      messageData: messagesMap,
    };
  }

  private getMessageActions(actions: any[]) {
    const actionsList: { name: string; value: string }[] = [];
    actions.map((action) => {
      actionsList.push({
        name: action.getName(),
        value: action.getValue(),
      });
    });

    return actionsList;
  }
}
