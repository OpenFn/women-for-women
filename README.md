# Women for Women International

Repository for WfWI integrations for: BambooHR, MS Azure Active Directy

*Note that commits to `master` will be audo-deployed to OpenFn.org. Always work on a branch!*

## Authorization
OpenFn has developed the adaptor `language-XXX` to connect with the Microsoft Graph API. 

1. We are authorizing with Azure AD `on behalf of a user` - [see docs here](https://docs.microsoft.com/en-us/graph/auth-v2-user?context=graph/api/1.0)
2. To enabled this, Admin users needs to grant `Delegated Permissions` via the API Permissions menu item in the (Azure AD Portal)[https://portal.azure.com/?feature.checklist=true#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/CallAnAPI/appId/a699c0b6-e5c2-4d12-9350-5f5f13154a06/isMSAApp/]

## Data Flows
### Phase 1
For this pilot integration setup, OpenFn will sync BambooHR `Employee` information with AzureAD `users`. [See here]() for the phase 1 data flows configured, which include automation to: 
1. Upsert `users`
2. Assign a `manager`
3. Add `user` as a member to `administrativeUnits`
4. Add `user` as a member to `groups` (and thereby assign licenses)

### Phase 2
Discussed functionality may include additional actions when a user is terminated, syncing of profile photos, etc. 

## Questions
Contact support@openfn.org. 
