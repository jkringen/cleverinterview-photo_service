# ASYNC JOB SYSTEM - FRONTEND
This project is the frontend for the Async Job System application and provides the following:

* Web portal to submit & view status of jobs
* View details on available Jobs to run
* Submit new Job to run with custom parameters/data and notes
* Dashboard to monitor status of active Jobs and to view Job results
* Filter Jobs on Dashboard to filter for your desired data
* Google & GitHub Authentication for login/auth

## Quickstart

1. Startup backend services ([README.md](../backend/README.md))
    - Make sure backend database is seeded
2. Install project: `npm install`
3. Start dev server: `npm run dev`

Visit `http://localhost:3000` to view the frontend.

## Architecture
- TailwindCSS Styles
- RadixUI Components
- NextAuth for Google Auth integration
- JWT authentication with backend APIs
- TanStack Query for loading and filtering data
- React Hook Form + ZOD for form geneation & validation

### Authentication
NextAuth / Google & GitHub was selected for a simple user authentication / login process for this application. When attempting to login, users may choose Google or GitHub for their login provider.

The `middleware.ts` file monitors all requests and redirects the user to a login page if they are not logged in while attempting to access a protected route. The `middleware.ts` file provides a `matcher` that defines the list of protected routes.

Once logged in, we have access to the auth session, which includes some basic user information, including the email address, which is how we are currently identifying unique users in the backend.

#### Backend API JWT Authentication
As part of the sign-in process, the frontend will create a JWT for the users session. This JWT is signed with a private key and is included in every API request sent to the backend.

The backend will validate the JWT using the public side of the key, etc.

### TanStack Querying
The TanStack Query library was selected for the job of querying the backend APIs for data. TanStack provides a handy way to define a list of queries to run together, including the ability re-fetch data automatically for auto-refresh, and also handles exponential backoff logic is queries are failing, etc.

On top of the TanStack Query data, there is also a filtering mechanism implemented with a deferred value search, filtering all Jobs listed on the Dashboard by a case insensitive search across all relative fields.

### Later TODOs
- Toast style notification when job completes
- Option to DELETE complete Jobs
- Searching / Filtering could be shifted to a Server-side component with better cache control
- Depending on expected amount of potential job records, backend caching with next.js maybe
- Backend could also be in Next.js instead of Flask, etc
- Material React Table could be a great option
- Proper deployment pipeline, ensuring secrets are passed securely
- Could shift query logic to higher level component, in one location only
- Performance Monitoring / Tracking / Event Forwarding (Datadog, TrackJS, etc.)