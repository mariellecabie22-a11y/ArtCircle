# Live Application
- Frontend: https://art-circle-dusky.vercel.app/
- Backend/API: https://artcircle-production.up.railway.app/
- Django Admin: https://artcircle-production.up.railway.app/admin/

# ArtCircle
ArtCircle is my Final Project for the Full Stack Web Application Development course with UCD. It is a web application designed to connect artists with people who are interested in buying artwork or requesting custom pieces.

The main idea behind ArtCircle is to give independent artists a platform where they can showcase their artwork, connect with potential buyers, communicate with users, and manage requests for their work.

The project was inspired by my father, who is very talented at painting and drawing but had limited opportunities to showcase or sell his artwork. Because he did not have access to a platform that could connect his artwork with potential customers, he eventually had to focus on more traditional employment.

This made me think about how technology could provide another opportunity for artists who have talent and passion but may not have the exposure or resources to turn their artwork into an income. ArtCircle is my attempt to explore this idea through a full-stack web application.

The project is currently a prototype developed to meet the requirements of my final course project, but I have designed it with the possibility of developing it further into a real online platform in the future. There are several features that I would like to add as the project grows.

## Inspiration and Branding
The name ArtCircle represents a community of creative people coming together around art. I wanted the branding to feel creative, welcoming and different from a traditional online marketplace.

The logo was inspired by the Citizens of the World flag, which I came across online. I liked the circular design and the idea of the shapes coming together as a symbol of unity. I used this as inspiration for the ArtCircle logo and chose the colours used throughout the logo and website to create a consistent visual identity.

I also chose a soft cream, canvas-like background for the website to create a subtle connection to traditional art and painting. I wanted the overall design to feel warm, creative and welcoming while still keeping the artwork and text easy to see.

The home page also explains the story behind ArtCircle and how my father's experience inspired the project. I originally wanted to include photographs of his artwork, but the photographs available to me were not good enough quality for the website. One of my future plans is to photograph his artwork properly so that it can be included if ArtCircle is developed further.

## Technology Stack

### Frontend
- React
- JavaScript
- HTML
- CSS
- Bootstrap
- Axios for API requests

Bootstrap was used for some layout and responsive design, while custom CSS was used for the ArtCircle branding, colours, forms, buttons and overall visual design.

### Backend
- Django
- Django REST Framework
- Python

### Database
- PostgreSQL
- Django ORM

### External Services
- Brevo for email notifications
- Neon for PostgreSQL database hosting

### Deployment
- Vercel for the React frontend
- Railway for the Django backend
- GitHub for version control

## Main Features
The project was developed using a React frontend with a Django backend and database, with the frontend communicating with the backend through API requests. This follows the full-stack structure required by the assignment, where the frontend, backend and database work together. The assignment requires Django for the backend, a suitable database using Django's ORM, authentication, and optionally React with Django REST Framework for the API.

### Navigation
The main navigation contains:
- Home
- Explore Art
- Sell Art
- Messages
- Profile
- Dashboard
Different parts of the application become available depending on whether the user is logged in and what actions they are allowed to perform.

### Home
The Home page introduces ArtCircle and explains the purpose and inspiration behind the application.

It explains the story behind the project and how my father's experience as an artist influenced the idea for ArtCircle.

The page acts as the landing page for the application, fulfilling the requirement for a home/landing page related to the chosen project idea.

### Explore Art
The Explore Art page allows users to browse artwork listed by other users.

Each artwork contains information such as:
- Artwork image
- Title
- Artist
- Price
- Description
The artist's name is clickable and takes the user to their public profile.

The public profile displays information about the artist, including their:
- Profile photo
- Bio
- Verification status
- Artwork listings
Users can also choose to message the artist from their public profile.

This creates a connection between the artwork, the artist's profile and the messaging system rather than treating each feature as a separate part of the application.

### Artwork Details
When a user selects View Artwork, they are taken to a dedicated artwork details page.

Depending on whether the logged-in user owns the artwork, different actions are available.

For a potential buyer, the page provides options such as:
- Request to Buy
- Make an Offer
- Request Custom Artwork
- Favourite Artwork
The owner of the artwork does not receive the same purchasing options. Instead, they can manage their own listing, including editing the artwork while it is still available.

This is an example of authentication and authorisation, because the application checks what actions a user is allowed to perform rather than simply showing the same controls to everyone.

### Purchase Requests and Email API
One of the main features of ArtCircle is the purchase request system.

A user can select Request to Buy on an available artwork. This creates a purchase request in the database which can then be managed by the artist.

The application also integrates Brevo as an external email API. When a purchase request is submitted, an email notification can be triggered for the user.

This feature demonstrates the assignment requirement to integrate at least one relevant external API into the project.

The purchase request system also demonstrates communication between the React frontend, Django backend and database.

### Sell Art
The Sell Art page allows authenticated users to create artwork listings.

Users can:
- Upload an artwork image
- Add a title
- Add a description
- Set a price
- Create the listing
The artwork management system demonstrates CRUD operations:
- Create – create a new artwork listing
- Read – view artwork and listing information
- Update – edit an existing artwork listing
- Delete – remove an artwork listing
This is one of the main feature-specific parts of the application and demonstrates how data is created and managed through the backend database.

### Messages
ArtCircle includes a messaging system that allows users to communicate with each other.

Users can access their conversations through the Messages section. User names within conversations are clickable and can take the user to that person's public profile.

This allows users to move between communication, profiles and artwork without having to search for the user again.

The messaging system also demonstrates how related data is handled in the backend, including users, conversations and messages.

### Profile
The Profile page allows users to manage their personal information.

Users can update information such as their name, bio and profile photo.

The profile also contains the artist verification request feature.

A user can request verification, which creates an interaction with the administrator. The administrator can then review the request and approve or reject it.

The verification system is intentionally simplified for this prototype.

For a future version of ArtCircle, I would like verification to involve additional information, such as the user submitting identification and a photograph, so that the platform could have a more reliable artist verification process.

### Dashboard
The Dashboard provides users with a central place to view and manage their ArtCircle activity.

For artists, this includes managing incoming purchase requests. An artist can:
- View pending requests
- Accept a request
- Decline a request
When a purchase request is accepted, the artwork can be marked as sold.

The dashboard therefore provides different functionality based on the user's role and relationship with the artwork.

This also demonstrates authorisation, as users should only be able to manage actions that belong to them.

### Authentication and Security
ArtCircle includes user registration and login functionality.

Users can create an account using their name, email and password and can then log in to access authenticated features.

Passwords are handled through Django's authentication system rather than being stored as plain text.

The application also uses authentication and authorisation to control access to features such as creating artwork, editing personal listings and managing purchase requests.

User authentication and secure password storage are specifically required as part of the assignment.

The registration page also includes password confirmation and a Show Password option to make the authentication forms easier to use.

### Responsive Design 
The application has been designed to work across different screen sizes.

The layout uses responsive CSS so that pages such as the navigation, artwork listings, forms and dashboards can adapt to different screen sizes.

Responsive design is one of the required features in the assignment, which asks the application to provide a consistent experience across different devices.

# Testing

The application was tested during development both manually and through automated Django tests.

Manual testing was used to check the main user workflows, including:

- User registration and login
- Creating artwork listings
- Viewing artwork
- Editing and deleting artwork
- Sending purchase requests
- Accepting and declining purchase requests
- Messaging between users
- Profile updates
- Artist verification requests
- Email notification workflow
- User permissions and access to owner-only features
- Responsive layout and navigation

Automated tests were also implemented using Django's testing framework to check important backend functionality.

The application was tested locally before deployment and the deployed version was checked again to make sure the main features continued to work correctly.

## Future Development
ArtCircle is currently a prototype, but I have many ideas for developing it further.

Some of my future plans include:
- Adding reviews and ratings after successful transactions
- Improving artist verification
- Adding real payment processing
- Adding a shopping cart
- Expanding artist profiles
- Adding more artwork categories and search options
- Improving messaging functionality
- Adding more advanced notifications
- Improving the artwork purchasing process
- Adding additional tools for artists to manage their business
- Using higher-quality photographs of my father's artwork
- Developing the application into a potential real online business
For the current project, I focused on implementing the core features needed to demonstrate my understanding of full-stack development while keeping the scope manageable.

### Reviews and Ratings
A planned feature for ArtCircle was a reviews and ratings system for completed transactions. After a successful purchase, the buyer and artist would be able to leave feedback about their experience with each other and the completed transaction.

I decided to keep this feature as part of the future development plan rather than include it in the final prototype. This allowed me to focus on completing and testing the core marketplace functionality within the available project scope.

In a future version, reviews and ratings could be used to help build trust between users and provide artists and buyers with feedback from previous transactions.

# What I Learned
Developing ArtCircle allowed me to bring together many of the technologies and concepts I learned throughout the course.

The project gave me practical experience with:
- React for building the frontend
- Django for the backend
- Django REST Framework/API communication
- Database management
- User authentication
- CRUD operations
- Authorisation and user permissions
- File and image uploads
- External API integration using Brevo
- Responsive web design
- Git and GitHub for version control
- Deployment of a full-stack application

The project allowed me to put these concepts into practice across the full development process, from building the frontend and backend to managing the database, integrating an external API, testing the application, using Git for version control, and deploying the finished application.

Creating ArtCircle has allowed me to put these concepts into practice rather than only learning them individually.

I am particularly happy with the project because it started as an idea I had for a platform for artists and developed into a working full-stack application. The course gave me the knowledge and skills to turn that idea into something functional, and I would like to continue developing ArtCircle beyond the final project in the future.
