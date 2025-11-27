# Trello Clone – Startup Assignment 01

Small Trello-style app built for the Software Engineering assignment.

Live app: https://trello-clone-mzpw.vercel.app  
Source code: https://github.com/Gurban15/trello-clone.git  

---

## 1. Features

### Boards
- See all boards on `/`
- Create new boards
- Rename existing boards
- Delete boards  
- Deleting a board also removes all its lists and cards (cascade delete)

### Lists
- Inside a board: create, rename, delete lists
- Each list belongs to a single board
- Deleting a list also deletes all its cards

### Cards
- Inside a list: create, edit, delete cards
- Each card has:
  - **Title**
  - **Description** (editable in a dialog)
- Clicking a card opens an “Edit card” dialog where the title and description can be changed

This covers the assignment requirements: **collection of boards, lists of cards, and card content**.

---

## 2. Tech Stack

- **Next.js 16** (App Router) with **TypeScript**
- **MongoDB Atlas** + **Mongoose**  
  - Models: `Board`, `List`, `Card`
- **Tailwind CSS** for styling (dark, simple UI)
- **PostHog** for product analytics (events)
- **Vercel** for deployment

---

## 3. Data Model (Simplified)

### Board
- Fields: `_id`, `title`, `createdAt`, `updatedAt`

### List
- Fields: `_id`, `title`, `boardId`, `position`, `createdAt`, `updatedAt`
- `boardId` links the list to its board

### Card
- Fields: `_id`, `title`, `description`, `listId`, `position`, `createdAt`, `updatedAt`
- `listId` links the card to its list

### Cascade delete

- When a **board** is deleted:
  - All lists with `boardId` = board’s `_id` are deleted
  - All cards in those lists are deleted
- When a **list** is deleted:
  - All cards with `listId` = list’s `_id` are deleted

This logic is implemented in the API routes under `app/api/boards/[id]` and `app/api/lists/[id]`.

---

## 4. Analytics with PostHog

### Why PostHog?

- Simple JavaScript SDK that works well with Next.js
- Free tier that is enough for a student project
- Focused on product analytics (events, funnels, retention)
- Works fully on the client side in this project

### Integration

- Client helper in `lib/posthogClient.ts`
- Uses environment variables:
  - `NEXT_PUBLIC_POSTHOG_KEY`
  - `NEXT_PUBLIC_POSTHOG_HOST`
- In React components I call:

```ts
posthog?.capture("event_name", { ...properties });
