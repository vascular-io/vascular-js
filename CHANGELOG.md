## [1.1.1] - 30 May 2026

- Fix getMessageById response handling

## [1.1.0] - 26 May 2026

- Add custom auth
Add support for custom authentication by allowing users to provide their own session token retrieval function.
This enables integration with various authentication systems and enhances flexibility for developers using the SDK.

## [1.0.2] - 02 May 2026

- Resolve pkgs vulnerabilities

## [1.0.0] - 03 Aug 2025.

- Added createUser, getUser, inbox, inboxNext, getMessageById, readMessages, openMessages, deleteMessage, addTags, and deleteTags methods.

- Introduced Language enum to configure localization options when initializing the client.

- Support for pagination through inboxNext() method.
