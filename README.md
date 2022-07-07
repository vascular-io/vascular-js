# Vascular Javascript SDK

The Vascular Js SDK allows using Vascular's APIs in Javascript based applications.

## Installation

```bash
npm i -S vascular-js
```
Or
```bash
yarn add vascular-js
```

## Usage

```ts
// Import package
import Vascular, { Language } from 'vascular-js';

// Construct new instance
const vascular = new Vascular("APP_KEY", "USER_ID", [Language.enUk]);

// Create user
const user = await vascular.createUser("USER_ID") // if USER_ID is not passed it will use "USER_ID" from constructor

// Get user
const user = await vascular.getUser("USER_ID") // if USER_ID is not passed it will use "USER_ID" from constructor

// Inbox
const inbox = await vascular.inbox();

// Next inbox (pagination)
const inbox = await vascular.inboxNext();

// Get message by id
const message = await vascular.getMessageById("MESSAGE_ID");

// Read messages
vascular.readMessages(inbox.newMessagesIds);

// Open messages
vascular.openMessages(inbox.readMessagesIds);

// Delete message by id
vascular.deleteMessage(inbox.messages[0].uuid);

// Add tags
vascular.addTags(["music", "sport"]);

// Delete tags
vascular.deleteTags(["music", "sport"]);

// List Tags
const tags = await vascular.tags();
```

###### Inbox data structure
```
{
    messages: [INBOX-MESSAGE]
    newMessagesIds: [STRING],
    readMessagesIds: [STRING],
    next: {
      createdAt: TIMESTAMP
      uuid: STRING
    },
    newInbox: INTEGER
}
```

###### Inbox message data structure
```
{
   "uuid": STRING,
   "status": INTEGER,
   "message":{
      "enUs":{
         "title": STRING,
         "body": STRING,
         "media":{
            "thumbnail": STRING,
            "image": STRING"
         },
         "actions":{
            "name": STRING,
            "value": STRING
         },
         "metadata":{
            "meta": STRING
         },
         "subTitle": STRING
         "language": LANGUAGE-ENUM
      }
   },
   "provider": PROVIDER-ENUM,
   "createdAt": STRING,
   "expdate": STRING
}
```

###### LANGUAGE-ENUM
```
{
    enUs
    enUk
    nb
}
```

###### PROVIDER-ENUM
```
{
    api
    sfmc
    dashboard
}
```
