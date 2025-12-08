## Factly

This project was created as part of the **Web Development** learning journey.
**Factly** is a platform where users can share interesting facts, react to other's facts, manage their own content, and explore facts posted by the category.

It showcases my skills in **authentication, role-based access control, CRUD operations, vote/reaction systems, profile management**, and **full-stack app architecture**.

## Live Website

Visit the link -> https://factly-app.netlify.app/

## Some notable features

1. **RESTful API Backend**

   - Modular controllers, routes and models
   - Authentication & authorization middleware (protect routes / role restrict)
   - Secure route protection and input sanitization
   - Separate routes for **facts**, **users**, and **admin** actions

2. **User Authentication**

   - Sign up / Login using **JWT**
   - JWT stored in **HTTP-only cookies** for security
   - Role-based access: **user**, **admin**

3. **Fact Uploading**

   - Users can post facts with **text**, **source URL**, and **category**
   - Full CRUD API for facts (Create , Read , Update , Delete)

4. **Voting / Reaction System**

   - Users can react with:
     - 👍 `Interesting`
     - 🤯 `Mind-Blowing`
     - ⛔ `Disputed`
   - Users can **react**, **switch reaction**, or **unvote**
   - Reactions are stored in MongoDB and shown instantly in UI
   - Reactions visually color-coded
   - Facts sort by reaction count & by time

5. **Filtering & Sorting**

   - Filter facts by **category**
   - Sort by:
     - Recent
     - Oldest
     - Most Interesting
     - Most Mind-Blowing
     - Most Disputed

6. **Infinite Scroll (Optimized Facts Loading)**

   - Implemented infinite scrolling on the Home page
   - Loads the first 10 facts, then continues loading additional facts as the user reaches the end of the list
   - Fully integrated with category filters and sorting options

7. **User Profiles**

   - Click on any username to view that user’s **public profile**
   - Public profile displays all facts that user uploaded

8. **My Profile Dashboard**

   - **My Facts** — View, edit, delete your uploads
   - **Reacted Facts** — All facts you reacted to (one place to review)
     - Visual colors:
       - Blue → Interesting
       - Green → Mind-Blowing
       - Red → Disputed
   - **User Settings** — Update username, email, and password

9. **Admin Features**
   - Admin has all user features plus:
     - ❗ **Delete any fact uploaded by any user**
   - Admin routes protected through role-based middleware

---

## Website contains

### Implemented Pages

- **Home** — Facts feed with filters & sort controls, reaction buttons
- **Authentication** — Login & Signup pages
- **User Profile** — Public profile page for any user
- **My Profile** — _My Facts_, _Reacted Facts_, _User Settings_
- **Fact Management** — Create, Edit, Delete fact UI
- **Admin** — Delete any fact via admin controls

### Not Yet Implemented (Backend functionality implemented, frontend UI pending)

- **Deactivate User Account** – Allow users to deactivate their account, hiding their profile and facts from public view while retaining data in the database.

## Platforms used

1. [Vite](https://vitejs.dev/guide/)/[React](https://react.dev/), Backend- [Node](https://nodejs.org/en)/[Express](https://expressjs.com/), Database- [MongoDB](https://www.mongodb.com/)/[Mongoose](https://mongoosejs.com/)
2. Frontend deployed in [Netlify](https://www.netlify.com/) and Backend deployed in [Render](https://render.com/)

## Future Ideas

1. Add comments under facts
2. Add bookmarks/saved facts
3. Add admin dashboard to moderate facts
4. Add advanced search
5. Add Google/GitHub OAuth
6. Add push notifications

### Thank you for visiting!
