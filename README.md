# Vascular JavaScript SDK

The Vascular JavaScript SDK is a client for Vascular APIs.

## Installation

```sh
npm install @vascular-io/vascular-js
```

Import the SDK:

```ts
import Vascular, { Language } from '@vascular-io/vascular-js';
```

## Initialize

Create a `Vascular` client with your API key, app key, user ID, endpoint, and optional languages:

```ts
const vascular = new Vascular({
  apiKey: 'API_KEY',
  appKey: 'APP_KEY',
  userId: 'USER_ID',
  endpoint: 'https://api.example.com',
  languages: [Language.ENUK],
});
```

If `languages` is not provided, the SDK defaults to `Language.ENUK`.

## Usage

All network operations are asynchronous and should be awaited.

### Create user

Creates a user. If `userId` is not provided, the SDK uses the user ID passed to the constructor.

```ts
const createdUser = await vascular.createUser();
const createdOtherUser = await vascular.createUser(otherUserId);
```

Returns:

```ts
{
  userId: STRING,
  inboxId: STRING,
  metadata: STRING,
}
```

### Get user

Fetches a user. If `userId` is not provided, the SDK uses the user ID passed to the constructor.

```ts
const user = await vascular.getUser();
const otherUser = await vascular.getUser(otherUserId);
```

Returns:

```ts
{
  uuid: STRING,
  createdAt: STRING,
  metadata: STRING,
}
```

### Inbox

Fetches the first inbox page.

```ts
const messages = await vascular.inbox();
```

Returns:

```ts
[
  INBOX_MESSAGE
]
```

### Next inbox page

Fetches the next inbox page using the pagination state from the previous `inbox()` or `inboxNext()` call.

```ts
const messages = await vascular.inboxNext();
```

Returns:

```ts
[
  INBOX_MESSAGE
]
```

### Get message by ID

Fetches one inbox message by ID.

```ts
const message = await vascular.getMessageById('MESSAGE_ID');
```

Returns:

```ts
{
  uuid: STRING,
  status: STATUS,
  provider: PROVIDER,
  created_at: TIMESTAMP,
  expdate: TIMESTAMP,
  type: TYPE,
  messageData: {
    enUs: MESSAGE_DATA,
    enUk: MESSAGE_DATA,
    nb: MESSAGE_DATA,
  },
}
```

### Read messages

Marks the given message IDs as read.

```ts
const messageIds = ['message-id-1', 'message-id-2'];
const status = await vascular.readMessages(messageIds);
```

Returns:

```ts
STRING
```

### Open messages

Marks the given message IDs as opened.

```ts
const messageIds = ['message-id-1', 'message-id-2'];
const status = await vascular.openMessages(messageIds);
```

Returns:

```ts
STRING
```

### Delete message

Deletes one message.

```ts
const status = await vascular.deleteMessage('MESSAGE_ID');
```

Returns:

```ts
STRING
```

### Add tags

Adds tags to the current user.

```ts
const status = await vascular.addTags(['music', 'sport']);
```

Returns:

```ts
STRING
```

### Delete tags

Deletes matching tags from the current user. Tags that do not exist are ignored.

```ts
const status = await vascular.deleteTags(['music', 'sport']);
```

Returns:

```ts
STRING
```

When no matching tags exist, the SDK returns:

```ts
'Nothing to be deleted'
```

### List tags

Lists tags for the current user.

```ts
const tags = await vascular.tags();
```

Returns:

```ts
[
  {
    uuid: STRING,
    name: STRING,
    createdAt: STRING,
  }
]
```

### Multiple languages

When you initialize the SDK with multiple languages, each inbox message can contain message data keyed by language name.

```ts
const vascular = new Vascular({
  apiKey: 'API_KEY',
  appKey: 'APP_KEY',
  userId: 'USER_ID',
  endpoint: 'https://api.example.com',
  languages: [Language.ENUS, Language.NB],
});

const messages = await vascular.inbox();
const message = messages[0];

const englishMessage = message.messageData.enUs;
console.log(englishMessage?.title);

const norwegianMessage = message.messageData.nb;
console.log(norwegianMessage?.title);
```

Returns:

```ts
{
  title: STRING,
  body: STRING,
  media: {
    thumbnail: STRING,
    image: STRING,
  },
  actions: [
    {
      name: STRING,
      value: STRING,
    }
  ],
  subTitle: STRING,
}
```

## Data Structures

### Inbox message

```ts
{
  uuid: STRING,
  status: STATUS,
  provider: PROVIDER,
  created_at: TIMESTAMP,
  expdate: TIMESTAMP,
  type: TYPE,
  messageData: {
    enUs: MESSAGE_DATA,
    enUk: MESSAGE_DATA,
    nb: MESSAGE_DATA,
  },
}
```

### Message data

```ts
{
  title: STRING,
  body: STRING,
  media: {
    thumbnail: STRING,
    image: STRING,
  },
  actions: [
    {
      name: STRING,
      value: STRING,
    }
  ],
  subTitle: STRING,
}
```

## Enums

### `Language`

```ts
Language.ENUS
Language.ENUK
Language.NB
```

Message data is keyed by:

```ts
enUs
enUk
nb
```

### `Provider`

```ts
api
sfmc
dashboard
```

### `Status`

```ts
delivered
opened
read
deleted
admin_deleted
```

### `Type`

```ts
info
campaign
payment
notification
```
