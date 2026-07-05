# Dating App

Full-stack dating app: ASP.NET Core Web API (`API/`) + Angular (`client/`).

## Features

- JWT authentication, profile editing, photo upload (Supabase Storage)
- Browse members with filtering, sorting and pagination
- Like / unlike, with "who I like" and "who likes me" lists
- Real-time messaging (SignalR) with online presence indicators
- Role-based admin area: user role management and photo approval queue

## Running locally

### API

```bash
cd API
cp appsettings.Development.json.example appsettings.Development.json
# fill in a random TokenKey and your Supabase credentials
dotnet run
```

The API listens on `http://localhost:5251`, applies EF Core migrations, and seeds demo
members plus an `admin` / `Pa$$w0rd` account (roles: Admin, Moderator) on first run.

### Client

```bash
cd client
npm install
ng serve
```

The app is served at `http://localhost:4200` and expects the API at `http://localhost:5251`
(see `client/src/app/environments/environment.ts`).

## Tech stack

- **API**: .NET 9, EF Core (SQLite), AutoMapper, SignalR, Supabase Storage
- **Client**: Angular 19, Bootstrap 5, ngx-bootstrap, ngx-toastr, @microsoft/signalr
