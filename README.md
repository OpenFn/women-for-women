# Women for Women International

Repository for WfWI integrations for: BambooHR, MS Azure Active Directory

## Important Notes
### 1. Commits to `master` will be audo-deployed to OpenFn.org. Always work on a branch!
### 2. There are 'production' and 'test' versions of the jobs configured on OpenFn.org. Turn on the `[PROD]` jobs to sync with the live production environment. Choose to keep the `[TEST]` jobs running in parallel for testing purposes.

# Committed Giving <> Salesforce Integration
## 1. Solution Overview
Women for Women International would like to integrate Committed Giving with Salesforce. OpenFn will sync donation data from Committed Giving to Salesforce. In addition, OpenFn to perform duplicate checking before upserting data.

### Functional Summary
Flow: Committed Giving --> Salesforce
1. Weekly, OpenFn will extract CSV exports of donation data from sftp server, convert to JSON.
2. OpenFn will map the converted CSVs to relevant Salesforce objects according to data element mapping specifications defined by WfWI.
3. OpenFn to perform duplicate checking before upserting data in Salesfroce.

## 2. Technical Overview
### Data Flow
See data flow here https://lucid.app/lucidchart/34c8100a-42d2-47ab-8a5a-6c406a744ed8/edit?beaconFlowId=53F1EDFE7A9CEC2A&page=0_0#

### Unique Identifiers
1. **Contacts**: `Legacy_Supporter_ID__c: csv.PersonRef`
2. **Recurring Donations**: ... 
3. ...

### OpenFn Jobs
1. Job 1 gets the CSV files from Committed Giving and converts them to JSON.
2. Job 2 maps the JSON objects to Salesforce and checks for duplicates.
3. Job 3 Upserts Salesforce Objects.


### OpenFn Adaptors
 SFTP adaptor and Salesforce adaptor

### Administrator Notes
1. This integration automates a complex donor duplicate-check flow before upserting Salesforce `Contacts`. Please see [this diagram XYZ] for a summary of the logic flow. 
2. We assume that Committed Giving will name the CSV files with the following keywords: `


# Bamboo <> HR Integration
## 1. Solution Overview

[See here](https://www.youtube.com/watch?v=WKgb-UiTcMg&feature=youtu.be&hd=1) for the video walkthrough of the OpenFn setup. 

### Functional Summary
This solution enables Women for Women adminstrators to automate employee registration processes to save time syncing data between their BambooHR system and Microsoft Azure AD. 
OpenFn configured a prototype integration to pilot this data flow by first focusing on automation for new Employee registrations & updates. In subsequent phases, we may expand this automation to handle other employee scenarios (i.e., employee termination, contractor employees, etc.).

Please see this data diagram for a review of the solution: [Data Flow Diagram](https://lucid.app/lucidchart/3da00134-e1d3-4a10-9bed-ada88e89c4fd/edit?page=TDoNVVxjmfJp#?folder_id=home&browser=icon)

### BambooHR Webhook Notification
BambooHR has a webhook notification service that will send OpenFn real-time notifications when changes are made to employee records in Bamboo. The fields included in this notification & how they map to Azure are listed in [this mapping specification](https://docs.google.com/spreadsheets/d/18WNLa01o5ch2xFqVu_6tlUsvHOas-zqlKgJsi9QYWmU/edit#gid=1713086939). 

### Administrator Notes
Depending on the Employment Status, different actions may be taken beyond Azure user record updates. 
1. New Employees --> Sent a "Welcome Email"
2. Terminated Employees --> Helpdesk sent an email 
3. Employees marked as "Other" --> OpenFn logs a message in "Activity History" noting that "Employment Status does not qualify for integration." 
4. Only employee records belonging to Divisions specified as **`Active Divisions`** will be processed by the automation flow. Otherwise, the automation will skip over the record and log `No Azure action taken`. Skip to `02:08` in [this video](https://www.youtube.com/watch?v=WKgb-UiTcMg&t=2m8s) for instructions on updating the `activeDivision` list, and please update the following lines in these jobs: 
- `1. Upsert Azure User` - [see L292](https://www.openfn.org/projects/p56pxp/jobs/jvebjm) (`const activeDivisions = ['Headquarters', 'Headquarters - PM Access'];`)
https://github.com/OpenFn/women-for-women/blob/master/jobs/production/upsertUserProd.js#L292
- `2A. Send Welcome Email` - [see L16](https://www.openfn.org/projects/p56pxp/jobs/jyjxb8)
https://github.com/OpenFn/women-for-women/blob/master/jobs/production/sendWelcomeEmailProd.js#L16
- `2B. Send Supervisor Email` - [see L16](https://www.openfn.org/projects/p56pxp/jobs/jvrqek)
https://github.com/OpenFn/women-for-women/blob/master/jobs/production/sendSupervisorEmailProd.js#L16
- `3. Send Inactive Employee Email` - [see L16](https://www.openfn.org/projects/p56pxp/jobs/jv9nxn)
https://github.com/OpenFn/women-for-women/blob/master/jobs/production/sendInactiveEmailProd.js#L16

## 2. Technical Overview
### Data Flow
For this pilot integration setup, OpenFn will sync BambooHR `Employee` information with AzureAD `users` in a one-directional data flow.  This includes automation to execute the following actions in Azure: 
1. Upsert `users`
2. Assign a `manager`
3. Add `user` as a member to `administrativeUnits`
4. Add `user` as a member to `groups` (and thereby assign licenses)

### OpenFn Logs & Errors
1.  When POST succeeds: 
    `Authentication successful`
2.  When manager assigned:
    `Assigning ${fields['First name Last name']} (${employee.fields.Employee #} to manager ${supervisorEmail} ...`
3.  When assigned manager not found:
    `Manager ${employee.fields['Supervisor email']} not found...`
4.  When member removed from an administrative unit:
    `Removing member from the administrative unit ${value[0]}...`
5.  When member added to an administrative unit:
    `Adding member to the administrative units ${employee.fields.Division}...`
6.  When member removed from group:
    `Removing member from the group ${value[0]}...`
7.  When member added to group:
    `Adding member to the group ${employee.fields['Email User Type']}...`
8.  When upserting a user record, but no work e-mail address provided in BambooHR:
    `No Azure actions taken because 'Work Email' not provided.`
9.  When updating a user record:
    `Updating ${employee.fields.First name Last name} (${employee.fields.Employee #} information...`
10.  When employment status does not comply with criteria requirements for integration:
    `No Azure changes made. Employment Status does not qualify for integration. Nothing to update for ${employee.fields.First name Last name} (${employee.fields.Employee #} at      this time.`
11. When Employee ID and User Principle Name do not match:
    `${employee.fields.First name Last name} User Principal Name ($UserPrincipalName}) and Bamboo Work Email ({$employee.Work Email}) do not match. Please review this employee      {employee.Employee #} to confirm the email and UPN are correct.`
12. When a user is not found a new user is created succesfully:
    `Creating a new user for ${employee.fields.First name Last name} ...`

### Authorization with Azure
OpenFn is leveraging the adaptor `language-http` to connect with the Microsoft Graph API. 

1. We are authorizing with Azure AD `on behalf of a user` - [see docs here](https://docs.microsoft.com/en-us/graph/auth-v2-user?context=graph/api/1.0)
2. To enable this, Admin users needs to grant `Delegated Permissions` via the API Permissions menu item in the [Azure AD Portal](https://portal.azure.com/?feature.checklist=true#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/CallAnAPI/appId/a699c0b6-e5c2-4d12-9350-5f5f13154a06/isMSAApp/)

### Solution Roadmap 
Discussed functionality may include: 
1. Additional automated actions when a user is terminated (consider integration with Jira or Microsoft form to trigger this? 
2. Syncing of profile photos
3. Two way sync capabilities
4. Conversion of special characters

## 3. Questions? 
Contact support@openfn.org. 
