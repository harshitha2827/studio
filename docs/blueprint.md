# **App Name**: BookShelfie

## Core Features:

- Manual Book Logging: Allow users to add books manually by entering the title, author, and other details. Offer the ability to mark books as 'Reading', 'Finished', or 'Want to Read'.
- Book Rating & Notes with Cookie Persistence: Enable users to rate books and add personal notes or reviews. Implement cookie functionality to remember the last selected bookshelf tab (Reading, Finished, Want to Read) and automatically return the user to that view on their next visit.
- Interactive Bookshelf Display: Display books in a visually appealing, tabbed bookshelf layout.  Allow users to filter books by their reading status.

## Style Guidelines:

- Primary color: White (#FFFFFF) for a clean and modern feel.
- Secondary color: Grey (#808080) for a calming and sophisticated backdrop.
- Accent: Sea Blue (#70A1D7) for interactive elements and highlights.
- Clean and readable sans-serif fonts for body text to ensure a comfortable reading experience.
- Simple, line-based icons for bookshelf statuses and actions to maintain a minimalist aesthetic.
- A tabbed layout for the bookshelf to easily switch between 'Reading', 'Finished', and 'Want to Read' categories.

## Original User Request:
Scenario:
Readers often lose track of what they're reading, want to read, or have already finished. Reviews are scattered, insights forgotten, and meaningful recommendations rarely surface. There's also no light-weight space where readers can track books and share personal takeaways.

BookBurst is a personal reading log and social discovery platform. Users can track their reading activity, log reviews, and explore community trends — without the noise of full-blown social networks.

You are tasked with building a focused, fullstack MVP for this book-loving ecosystem.

Objective:
Build a secure web application where authenticated users can:

Log and manage their personal bookshelf
Track reading status and rate books
Write and share reviews
Discover trending books via community activity
Explore public shelves of other users
Experience subtle personalization via cookie-powered behavior tracking
User Role: user
All data and actions are scoped to the logged-in user, with public sharing of selected content (bookshelves and reviews).

Authentication & Authorization:
Secure login/signup with email/password
Auth-protected access to all core features
Users can only view and modify their own books and reviews
Public users can view shared content but not interact unless logged in
Core Functional Features:
1. My Bookshelf Management
Users can:

Search and add books (manual or via API like Google Books)
Assign each book a status:
:closed_book: Reading
:white_check_mark: Finished
:book: Want to Read
Rate books and add personal notes
Books appear in a tabbed bookshelf with filters by status
Cookie Enhancement The app should remember the last selected bookshelf tab (e.g., Finished) using cookies, and automatically return the user to that view on the next visit — even after
  