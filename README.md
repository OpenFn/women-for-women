# Women for Women International

Repository for WfWI integrations for: BambooHR, MS Azure Active Directory

*Note that commits to `master` will be audo-deployed to OpenFn.org. Always work on a branch!*

# 1. Solution Overview
## Functional Summary
Summarize how it works and link to data flows...

## BambooHR Webhook Notification
BambooHR has a webhook notification service that will send OpenFn real-time notifications when changes are made to employee records in Bamboo. 

The fields included in this notification & how they map to Azure are listed in [this mapping specification](post-link-here). 


# 2. Technical Overview
## Data Flow
For this pilot integration setup, OpenFn will sync BambooHR `Employee` information with AzureAD `users` in a one-directional data flow.  This includes automation to execute the following actions in Azure: 
1. Upsert `users`
2. Assign a `manager`
3. Add `user` as a member to `administrativeUnits`
4. Add `user` as a member to `groups` (and thereby assign licenses)

## Authorization with Azure
OpenFn is leveraging the adaptor `language-http` to connect with the Microsoft Graph API. 

1. We are authorizing with Azure AD `on behalf of a user` - [see docs here](https://docs.microsoft.com/en-us/graph/auth-v2-user?context=graph/api/1.0)
2. To enable this, Admin users needs to grant `Delegated Permissions` via the API Permissions menu item in the [Azure AD Portal](https://portal.azure.com/?feature.checklist=true#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/CallAnAPI/appId/a699c0b6-e5c2-4d12-9350-5f5f13154a06/isMSAApp/)

## Solution Roadmap 
Discussed functionality may include: 
1. Additional automated actions when a user is terminated
2. Syncing of profile photos
3. ...

## 3. Questions? 
Contact support@openfn.org. 
