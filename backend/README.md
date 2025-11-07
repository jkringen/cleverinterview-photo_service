# PHOTO SERVICE - BACKEND
This project is the backend for the Photo Service application and provides the following:

* Flask API server providing APIs for querying users, jobs, and tasks, as well as JWT based authentication, etc.
* SQLAlchemy + alembic to define database models and provide ORM access to interface with the database
* Centralized database engine and session management for handling standard task lifecycle
* Celery & celery beat containers to process any pending tasks / queued jobs
* Periodic task to clean-up any issue with QueuedJob records
* Task success/failure hooks to alert frontend directly when a task has completed
* Database admin panel for exploring postgre database
* Celery Flower instance for dashboard for Celery system

## Later TODOs
- Proper deployment pipeline, ensuring secrets are passed securely
- Dev setup improvement: run flask dev server locally, fast reload, etc.
- Pagination and next/prev links in returned data format, if enough records to break them up
- Performance Monitoring / Tracking / Event Forwarding (Datadog, Splunk, etc.)

## Quickstart

1. Install project: `poetry install`
2. Pull Docker images: `docker compose pull`
3. Launch via Docker: `docker compose up` (wait for containers to be up & `healthy`)
4. Seed database by sending GET request to [http://localhost:8000/seed_db](http://localhost:8000/seed_db)

## Installing Project
This project was built using poetry as the python dependency management system. Make sure you have poetry installed already (version `1.8.2` or greater).

In the root project folder, run: `poetry install`

This will create a virtual environment and install and required project dependencies, etc.

## Docker Setup
Before starting up the project, it's a good idea to pull all required Docker images first: `docker compose pull`

## Launching Project
To fully launch the project, you can use this command: `docker compose up`

Once all services are up and running, you can check the status with: `docker compose ps`. All containers / services should be up and running within a minute or so and none of them should be marked as `unhealthy`.

## Database Admin
A database admin tool is included in the stack for convenience. It does not allow for editing the database, but does provide full view access and SQL query support.

You can access the database admin page at [http://localhost:8081](http://localhost:8081).

## Celery Task Monitor (Flower)
The Flower tool is also included in the stack and provides basic monitoring of Celery workers and tasks.

The admin page can be accessed at [http://localhost:5556](http://localhost:5556).

## Architecture
### Flask APIs
Flask, hosted by gunicorn

#### API Authentication
The frontend app uses oAuth authentication with Google, to allow users to securely sign-in with their Google accounts. During that sign-in process, the frontend will generate a JWT for the user's session and will include that JWT in every API request sent to the backend. This JWT is signed with a private key, and the backend app ha a copy of the public side of that key to allow for verification.

The `resources.py` file includes the definition of a `ProtectedResource` class that add JWT auth requirements to any API resource that extends from that base class.

The `api.py` class has JWT configuration items set that automatically cause the `flask_jwt_extended` library to take care of the JWT verification for us, for any APIs that are a `ProtectedResource`.

### Database
To provide a database, a postgres container is included in the Docker Compose service stack. It is available via the `db` DNS name from within the Docker network stack.

To interface with the database, define the models/tables, and generate migrations, SQLAlchemy + alembic are in place and configured.

The `models.py` file within the `async_job_system` module define all of the SQLAlchemy database models, and the `db.py` file provides some global / common database session lifecycle logic for Flask APIs and Celery workers to utilize.

The `alembic` folder in the project root contains all of the alembic migration and configuration files. If you make changes to database models at all, you'll need to generate a new migration so your model changes can be applied on top of the previous model structure.

The commands below are how you can generate and apply database migrations:

Generate migration: `poetry run alembic revision --autogenerate -m "<your_comment>"`<br/>

Apply migrations: `poetry run alembic upgrade head`

**NOTE:** Before generating & applying migrations, you'll need to make sure the database is up and running. Alembic requires a database connection to generation and apply revisions. You can bring up just the database only using the command `docker compose up db`. You can bring it down once the alembic commands are completed, or bring up the rest of the stack after.

#### Database Models
The following models are the database models currently in place within this project:

`User` -- Represents a logged in User who can submit jobs for processing.

`Job` -- Represents a potential Job to submit for processing.

`QueuedJob` -- Represents a submitted job and its current state (pending, started, etc.) This model also holds the result of the job that was processed.

#### Auto-migration on Application Launch
To achieve this, for now, the Docker Compose file has been configured with a `migrate` container that acts like a "one-shot" service which launches before the API / Celery services and ensures that any pending database migrations are applied before we connect.

In a full production deployment environment / scenario, this may be acheived a totally different way. Perhaps on installation of a new release, a migration would be ran via a post-upgrade/install script, etc. For this simple test application, keeping it in this "one-shot" style container was easiest.

#### Global Engine & Session Management
In the `db.py` file in the `async_job_system` module, there is logic to configure Flask request hooks to ensure that Flask API processing logic is able to retrieve & work with a database session and have it automatically commit / rollback and close the session, simplyfying the logic needed in the API itself.

Within a Flask API handler, you can simply use `db = get_session()`

For Celery workers, there is a session_scope context context masnager that allows Celery workers to work with a database session in the same manner.

Within a Celery worker task function, you can use the following:

```
with session_scope() as s:
    # database query logic here
```

With both approaches, the logic in `db.py` automatically handles any commit / rollback and closing of the session for you.

### Task Processing
In the `async_job_system` module, the `celery.py` file is the primary entrypoint for Celery and its configuration. Celery is configured to auto discover tasks in the module, so any function marked with the `@celery.task` decorator should be registerd with Celery.

There are 2 environment variables that are setup to provide Celery with the configured broker and results backend. For this project, Redis was chosen for both of those. The `CELERY_BROKER_URL` and `CELERY_RESULT_BACKEND` variables defined in the `.env` file are configured to point to the `redis` container in the Docker stack.

Celery tasks are all defined in the `tasks.py` file. 

#### Task / QueuedJob Synchronization
To be able to display the results of a Celery task to a user for a while after the task has completed, a `QueuedJob` database record is created for each task that is created.

In the `tasks.py` there is a section at the top of the file that sets up some hooks to allow for automatic updating of tasks and their associated `QueuedJob` database record. 

The `TaskWithHooks` class is an extension of the base `Task` class and, when used with `@celery.task` provides success/failure handling hooks that update the status and result data on the associated `QueuedJob` database record.

In addition to the `TasksWithHooks` logic, there is one more hook defined as a module function called `on_started` that is decorated with `@task_prerun.connect` which has logic to update the associated `QueuedJob` database record status to **STARTED** when a task is picked up by Celery.

##### QueuedJob Cleanup
Once a task has completed and the `QueuedJob` status is **SUCCESS** / **FAILED**, we eventually would want that record to be dropped from the database, but after a delay so users have a chance to go check on the status and result of the job.

To achieve this, a Celery Beat periodic task is configured that will iterate over all `QueuedJob` records and purge any records that are in a **SUCCESS** / **FAILED** state and have not been updated beyond the configured `MAX_JOB_TTL` time.

### Logging
To provide more meaningful logging, the `log_config.py` file provides a logger configuration that tags log messages with the API request ID / Celery task ID. This makes tracing action across multiple seperate services a bit easier.

### Files & Folders
The table below provides basic descriptions of each file in the project itself.

Root level repository files:
| File               | Description                                                               |
| ------------------ | ------------------------------------------------------------------------- |
| .env               | Contains environment variables, provided to app via Docker Compose.       |
| alembic.ini        | Provides base configuration for alembic system.                           |
| docker-compose.yml | Docker compose file used to launch backend stack.                         |
| Dockerfile         | Docker build file used to build the base image used by this application.  |
| pyproject.toml     | Python project metadata, including all package dependencies, etc.         |
| poetry.lock        | Poetry lock file which contains metadata for all installed packages, etc. |
<br/>

Application module files in the `async_job_system` module folder:
| File           | Description                                                              |
| -------------- | ------------------------------------------------------------------------ |
| api.py         | Entrypoint for Flask App & API.                                          |
| celery.py      | Entrypoint for Celery worker & beat services.                            |
| db.py          | Database utils providing common session commit/rollback lifecycle logic. |
| gunicorn.py    | Configuration for gunicorn process that hosts Flask API.                 |
| log_config.py  | Configuration for logging for the Flask app and Celery workers.          |
| models.py      | Definitions of SQLAlchemy database models.                               |
| resources.py   | Definitions of Resource classes for processing API requests.             |
| serializers.py | Definitions of pydantic models used to serialize SQLAlchemy db models.   |
| tasks.py       | Definitions of all supported celery tasks, and common processing logic.  |
| validators.py  | Definitions of pydantic models used to validate API request data.        |