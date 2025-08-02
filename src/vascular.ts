import { Metadata } from 'grpc-web';
import {
  InboxClient,
  MessageClient,
  UserClient,
  TagClient,
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
  Provider,
  Type,
  Status,
} from "./vascular/index";

import { Config } from "./definitions"

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
  private readonly apiKey: string;
  private readonly appKey: string;
  private readonly userId: string;
  private readonly endpoint: string;
  private readonly languages: Language[];
  private readonly inboxClient: InboxClient;
  private readonly messageClient: MessageClient;
  private readonly userClient: UserClient;
  private readonly tagClient: TagClient;
  private next: string;


  constructor(config: Config) {
    const { apiKey, appKey, userId, endpoint, languages } = config;
    if (!apiKey || !appKey || !userId || !endpoint) {
      throw new Error("apiKey, appKey, userId, and endpoint are required");
    }
    this.apiKey = apiKey;
    this.appKey = appKey;
    this.userId = userId;
    this.endpoint = endpoint;
    this.languages = languages && languages.length > 0 ? languages : [Language.ENUK];

    this.inboxClient = new InboxClient(this.endpoint, null, null);
    this.messageClient = new MessageClient(this.endpoint, null, null);
    this.userClient = new UserClient(this.endpoint, null, null);
    this.tagClient = new TagClient(this.endpoint, null, null);
    this.next = "";
  }

  createUser(userId?: string): Promise<CreateUserReply> {
    const request = new CreateUserRequest();
    const metadata: Metadata = {
      'app-key': this.appKey,
      'api-key': this.apiKey
    };

    request.setUserId(userId ?? this.userId);
    return new Promise((resolve, reject) => {
      this.userClient.createUser(
        request,
        metadata,
        (err, response: CreateUserReply) => {
          if (err) {
            reject(err.message);
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  getUser(userId?: string): Promise<User> {
    const request = new GetUserRequest();
    const metadata: Metadata = {
      'app-key': this.appKey,
      'api-key': this.apiKey
    };
    request.setUserId(userId ?? this.userId);
    return new Promise((resolve, reject) => {
      this.userClient.getUser(request, metadata, (err, response: GetUserReply) => {
        if (err) {
          reject(err.message);
        } else {
          resolve(response.toObject());
        }
      });
    });
  }

  inbox(): Promise<Message[]> {
    const request = new GetInboxMessagesRequest();
    const metadata: Metadata = {
      'app-key': this.appKey,
      'api-key': this.apiKey
    };
    request.setUserId(this.userId);
    request.setLangaugesList(this.languages);
    return new Promise((resolve, reject) => {
      this.inboxClient.getInboxMessages(
        request,
        metadata,
        (err, response: GetInboxMessagesReply) => {
          if (err) {
            reject(err.message);
          } else {
            const next: string = response.getNext() || "";
            this.next = next;
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
    const metadata: Metadata = {
      'app-key': this.appKey,
      'api-key': this.apiKey
    };
    request.setUserId(this.userId);
    request.setNext(this.next);
    request.setLangaugesList(this.languages);
    return new Promise((resolve, reject) => {
      this.inboxClient.getInboxMessages(
        request,
        metadata,
        (err, response: GetInboxMessagesReply) => {
          if (err) {
            reject(err.message);
          } else {
            const next: string = response.getNext() || "";
            this.next = next;
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
    const metadata: Metadata = {
      'app-key': this.appKey,
      'api-key': this.apiKey
    };
    request.setUserId(this.userId);
    request.setMessageId(messageId);

    return new Promise((resolve, reject) => {
      this.messageClient.getMessageById(
        request,
        metadata,
        (err, response: InboxMessage) => {
          if (err) reject(err.message);
          resolve(this.mapMessage(response));
        }
      );
    });
  }

  readMessages(messageIds: string[]): Promise<string> {
    const request = new ChangeMessagesStateRequest();
    const metadata: Metadata = {
      'app-key': this.appKey,
      'api-key': this.apiKey
    };
    request.setIdsList(messageIds);
    request.setUserId(this.userId);
    return new Promise((resolve, reject) => {
      this.messageClient.readMessages(
        request,
        metadata,
        (err, response: MessageReply) => {
          if (err) {
            reject(err.message);
          } else {
            resolve(response.getStatus());
          }
        }
      );
    });
  }

  openMessages(messageIds: string[]): Promise<string> {
    const request = new ChangeMessagesStateRequest();
    const metadata: Metadata = {
      'app-key': this.appKey,
      'api-key': this.apiKey
    };
    request.setIdsList(messageIds);
    request.setUserId(this.userId);
    return new Promise((resolve, reject) => {
      this.messageClient.openMessages(
        request,
        metadata,
        (err, response: MessageReply) => {
          if (err) {
            reject(err.message);
          } else {
            resolve(response.getStatus());
          }
        }
      );
    });
  }

  deleteMessage(messageId: string): Promise<string> {
    const request = new DeleteMessageRequest();
    const metadata: Metadata = {
      'app-key': this.appKey,
      'api-key': this.apiKey
    };
    request.setMessageId(messageId);
    request.setUserId(this.userId);
    return new Promise((resolve, reject) => {
      this.messageClient.deleteMessage(
        request,
        metadata,
        (err, response: MessageReply) => {
          if (err) {
            reject(err.message);
          } else {
            resolve(response.getStatus());
          }
        }
      );
    });
  }

  addTags(tagNames: string[]): Promise<string> {
    const request = new AddTagsRequest();
    const metadata: Metadata = {
      'app-key': this.appKey,
      'api-key': this.apiKey
    };
    request.setUserId(this.userId);
    request.setNamesList(tagNames);
    return new Promise((resolve, reject) => {
      this.tagClient.addTags(request, metadata, (err, response: TagsReply) => {
        if (err) {
          reject(err.message);
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
    const metadata: Metadata = {
      'app-key': this.appKey,
      'api-key': this.apiKey
    };
    request.setUserId(this.userId);
    request.setUuidsList(uuids);
    return new Promise((resolve, reject) => {
      this.tagClient.deleteTags(request, metadata, (err, response: TagsReply) => {
        if (err) {
          reject(err.message);
        } else {
          resolve(response.getStatus());
        }
      });
    });
  }

  tags(): Promise<Tag[]> {
    const request = new GetUserTagsRequest();
    const metadata: Metadata = {
      'app-key': this.appKey,
      'api-key': this.apiKey
    };
    request.setUserId(this.userId);
    return new Promise((resolve, reject) => {
      this.tagClient.getUserTags(
        request,
        metadata,
        (err, response: GetUserTagsReply) => {
          if (err) {
            reject(err.message);
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
    const msg = inboxMessage.getMessageMap();

    let messagesMap = {};
    const languages = [0, 1, 2];
    languages.map((lang) => {
      let langEnum = "";
      if (lang === 0) {
        langEnum = "enUs";
      } else if (lang === 1) {
        langEnum = "enUk";
      } else if (lang === 2) {
        langEnum = "nb";
      }


      const data = msg.get(langEnum);
      if (!data) {
        return false; // skip
      }


      const image = data.getMedia()?.getImage();
      const thumbnail = data.getMedia()?.getThumbnail();
      const media = (image !== undefined || thumbnail !== undefined)
        ? { image, thumbnail }
        : undefined;
      
      const subTitle = data.getSubTitle();

      messagesMap = Object.assign(
        {
          [langEnum]: {
            title: data.getTitle(),
            ...(subTitle !== "" ? { subTitle } : {}),
            body: data.getBody(),
            ...(media !== undefined ? { media } : {}),
            actions: data.getActionsList()?.length ? self.getMessageActions(data.getActionsList()) : []
          },
        },
        messagesMap
      );
    });


    const providerValue = inboxMessage.getProvider();
    const providerNameMap: Record<number, string> = {
      [Provider.API]: 'api',
      [Provider.DASHBOARD]: 'dashboard',
      [Provider.SFMC]: 'sfmc',
    };
    const typeValue = inboxMessage.getType();
    const typeNameMap: Record<number, string> = {
      [Type.CAMPAIGN]: 'campaign',
      [Type.INFO]: 'info',
      [Type.NOTIFICATION]: 'notification',
      [Type.PAYMENT]: 'payment',
    };
    const statusValue = inboxMessage.getStatus();
    const statusNameMap: Record<number, string> = {
      [Status.DELIVERED]: 'delivered',
      [Status.OPENED]: 'opened',
      [Status.READ]: 'read',
      [Status.DELETED]: 'deleted',
      [Status.ADMIN_DELETE]: 'admin_deleted',
    };
    return {
      uuid: inboxMessage.getUuid(),
      status: statusNameMap[statusValue] ?? 'UNKNOWN',
      provider: providerNameMap[providerValue] ?? 'UNKNOWN',
      created_at: inboxMessage.getCreatedAt(),
      expdate: inboxMessage.getExpdate(),
      type: typeNameMap[typeValue] ?? 'UNKNOWN',
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
