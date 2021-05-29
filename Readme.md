# Alfred Bot

This telegram bot can manage a 15 minute visa slot checking group on its own.

## Product Design

### 1. User Interface (Involves conversation)

People can say Hi to the bot 
```
U: Hi
A: Welcome. Please enter the time you'd like to check:
U: 12:30PM (we'll need to parse this properly)
A: Which consulate would you like to check?
U: Mumbai
A (checks if 12:30PM is free)
A: Sorry 12:30PM-12:45PM Mumbai is not free. Please check the sheet <sheet link>. Which time do you want to check?
U: 1pm
A: Which consulate?
U: Mumbai
A (checks, adds to CSV, adds person to group, updates time sheet)
A: You have been added to the group. Do go through the pinned messages. Check @f1junejulydiscussions for doubts.
```

#### Subtasks:
- Maintain conversation (welcome, next question, back, cancel, what's my time slot)
- Parsing input (parsing time and consulate and check if valid)
- Checking if slot exists (from parsed input check with timesheet CSV if slot is free)
- Updating CSV, Group and time sheet (update users CSV, timesheet CSV, add user to group [to be explored], update Google sheet with new user's name)
- Current status: User can know what his timeslot is and how many misses are left

### 2. Management

The bot would monitor the group
If someone misses their slot, we'll ping them telling that they have missed the slot and can miss 5 more times.
It will also alert in an admins channel if a person has missed their slot.
Once 5 chances are exhausted, the bot would remove them from the group
Apart from this, bot checks if the people in the group and timesheet are same. If any extra people, kick. If anyone leaves, update timesheet

#### Subtasks:
- Sync between User details CSV and sheet in case user name changes
- If someone's added, check if name in user details CSV else kick
- If someone leaves, update timesheet CSV and Google sheet as empty and remove from user details CSV
- Check if people are posting in their interval; Reduce score if not
- If score is 0, kick out of group

## Code structure

index.js would contain the poller and call other sync operations.
users and timesheet would mastered in memory (and synced with a file every 5 seconds).

Pipeline files contain code which handle actions dispatched by the poller in index.

alfredHelpers would contain functions that can be used by the pipeline functions.

telegramHelpers would contain functions that can be used by the piples and alfredHelpers

sheetHelpers would contain functions that can be used by alfredHelpers.

The dependency should be maintained in the above order to prevent circular dependencies.
(upper module can import from lower module). For the other way around, you'll need to pass as a parameter to the function

#### A few things to note

- Google Sheets data is to be used only to induct existing people into the system and to check if the slot is already booked. It need not be updated if any name change happens.
- While checking if a slot is available, both google sheets and timesheet needs to be checked, atleast till all users are onboarded.