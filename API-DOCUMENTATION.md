# Home Maintenance Service Marketplace - API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Authentication](#authentication)
4. [User Management](#user-management)
5. [Service Provider Management](#service-provider-management)
6. [Service Catalog](#service-catalog)
7. [Booking Management](#booking-management)
8. [Time Slot & Availability](#time-slot--availability)
9. [Payment Processing](#payment-processing)
10. [Review System](#review-system)
11. [Admin Operations](#admin-operations)
12. [Error Handling](#error-handling)
13. [Data Models](#data-models)

---

## Overview

### What is the Home Maintenance Service Marketplace?

**For Non-Technical Users:**
This is a digital platform that connects homeowners who need maintenance services (like plumbing, electrical work, painting, cleaning) with qualified service providers. Think of it like Uber, but for home repairs and maintenance.

**For Technical Users:**
A RESTful API built with ASP.NET Core implementing Clean Architecture principles, featuring:

- JWT-based authentication with refresh tokens
- Role-based authorization (Customer, Provider, Admin)
- Entity Framework Core with SQL Server
- Background job processing for slot generation
- Optimistic concurrency control for booking slots
- Commission-based payment processing

### Key Features

- ✅ User registration and authentication
- ✅ Service provider approval workflow
- ✅ Service catalog with categories
- ✅ Provider availability scheduling
- ✅ Real-time booking system with conflict prevention
- ✅ Payment processing with 10% platform commission
- ✅ Two-way review system
- ✅ Admin dashboard for provider management

### Base URL

```
http://localhost:5000/api
```

### Technology Stack

- **Backend**: .NET 6/7/8, ASP.NET Core Web API
- **Database**: SQL Server with Entity Framework Core
- **Authentication**: JWT (JSON Web Tokens)
- **Architecture**: Clean Architecture (Domain, Application, Infrastructure, API layers)
- **Background Jobs**: IHostedService for automated slot generation

---

## Getting Started

### Prerequisites

- .NET SDK 6.0 or higher
- SQL Server (LocalDB or Express Edition)
- API testing tool (Postman, Insomnia, or curl)

### Installation Steps

1. **Clone the repository**

```bash
git clone https://github.com/lunarae-mai/Home-Maintenance-Service-Marketplace.git
cd Home-Maintenance-Service-Marketplace
```

2. **Update database connection**
   Edit `HomeMaintenanceServiceMarketplace/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=HomeMaintenanceDB;Trusted_Connection=True;"
  }
}
```

3. **Run migrations**

```bash
cd HomeMaintenanceServiceMarketplace
dotnet ef database update
```

4. **Run the application**

```bash
dotnet run
```

5. **Access Swagger documentation**
   Open browser: `http://localhost:5000/swagger`

### Quick Test

```bash
curl http://localhost:5000/api
# Response: "Home Maintenance API is Running!"
```

---

## Authentication

### Understanding Authentication

**For Non-Technical Users:**
Authentication is like showing your ID card to prove who you are. When you log in, the system gives you a special "token" (think of it as a temporary pass) that you must show with every request to prove it's really you.

**For Technical Users:**
The API uses JWT (JSON Web Tokens) for stateless authentication. Each token is valid for 24 hours and contains user claims (ID, email, role). Refresh tokens (7-day validity) enable seamless token renewal without re-login.

### Authentication Flow

1. Register → Get access token + refresh token
2. Use access token in requests (Authorization header)
3. When token expires → Use refresh token to get new access token
4. Refresh token expires → User must log in again

---

### 1. Register New User

**Endpoint:** `POST /api/Auth/register`

**What it does (Non-Technical):**
Creates a new account on the platform. You choose whether you're a customer (someone who needs services) or a provider (someone who offers services).

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890",
  "role": "Customer"
}
```

**Field Descriptions:**

- `name`: Your full name
- `email`: Must be unique, used for login
- `password`: At least 8 characters, include letters and numbers
- `phone`: Contact number
- `role`: Choose one: `"Customer"`, `"Provider"`, or `"Admin"`

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4=",
    "email": "john.doe@example.com",
    "role": "Customer"
  },
  "errors": null,
  "timestamp": "2026-07-09T10:30:00Z"
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "message": "User already exists",
  "data": null,
  "errors": ["User already exists"],
  "timestamp": "2026-07-09T10:30:00Z"
}
```

**Example (cURL):**

```bash
curl -X POST http://localhost:5000/api/Auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "phone": "+1234567890",
    "role": "Customer"
  }'
```

**Example (JavaScript/Fetch):**

```javascript
const response = await fetch("http://localhost:5000/api/Auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "John Doe",
    email: "john.doe@example.com",
    password: "SecurePass123!",
    phone: "+1234567890",
    role: "Customer",
  }),
});
const data = await response.json();
console.log(data);
```

---

### 2. Login

**Endpoint:** `POST /api/Auth/login`

**What it does (Non-Technical):**
Log into your account using your email and password. You'll get a token that you need to save and use for making other requests.

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4=",
    "email": "john.doe@example.com",
    "role": "Customer"
  }
}
```

**Error Response (401 Unauthorized):**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Example (cURL):**

```bash
curl -X POST http://localhost:5000/api/Auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john.doe@example.com", "password": "SecurePass123!"}'
```

---

### 3. Refresh Token

**Endpoint:** `POST /api/Auth/refresh-token`

**What it does (Non-Technical):**
Your login token expires after 24 hours. Instead of logging in again, you can use your refresh token to get a new access token automatically.

**Request Body:**

```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4="
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Token refreshed successfully.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "bmV3IHJlZnJlc2ggdG9rZW4=",
    "email": "john.doe@example.com",
    "role": "Customer"
  }
}
```

**Using the Token in Requests:**
All protected endpoints require the access token in the Authorization header:

```bash
# cURL example
curl -X GET http://localhost:5000/api/User/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

```javascript
// JavaScript example
fetch("http://localhost:5000/api/User/me", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

---

## User Management

### 1. Get My Profile

**Endpoint:** `GET /api/User/me`  
**Authorization:** Required (any authenticated user)

**What it does (Non-Technical):**
Retrieves your account information including name, email, phone, and role.

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Profile retrieved successfully.",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "role": "Customer",
    "createdAt": "2026-01-15T10:30:00Z"
  }
}
```

---

### 2. Update My Profile

**Endpoint:** `PUT /api/User/me`  
**Authorization:** Required

**What it does (Non-Technical):**
Update your account information like name, phone number, or email address.

**Request Body:**

```json
{
  "name": "John Michael Doe",
  "phone": "+1234567891",
  "email": "john.m.doe@example.com"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Profile updated successfully."
}
```

---

### 3. Change Password

**Endpoint:** `POST /api/User/change-password`  
**Authorization:** Required

**Request Body:**

```json
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Password updated successfully."
}
```

---

### 4. Get All Users (Admin Only)

**Endpoint:** `GET /api/User?role=Customer`  
**Authorization:** Admin only

**Query Parameters:**

- `role` (optional): Filter by role (`Customer`, `Provider`, `Admin`)

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Users retrieved successfully.",
  "data": [
    {
      "id": "user-id-1",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "Customer",
      "createdAt": "2026-02-01T08:15:00Z"
    }
  ]
}
```

---

## Service Provider Management

### Understanding Provider Workflow

**For Non-Technical Users:**

1. Register as a user with "Provider" role
2. Submit provider profile with bio, experience, and services you offer
3. Wait for admin approval
4. Once approved, customers can find and book you
5. Set your weekly availability schedule
6. Receive booking requests and manage them

### 1. Register as Provider

**Endpoint:** `POST /api/Providers/register`  
**Authorization:** Required (Provider role)

**What it does (Non-Technical):**
After creating a Provider account, this is where you tell us about your experience and what services you offer.

**Request Body:**

```json
{
  "bio": "Experienced electrician with 10 years in residential and commercial projects",
  "experience": 10,
  "services": [
    {
      "serviceId": 1,
      "basePrice": 75.0
    },
    {
      "serviceId": 2,
      "basePrice": 150.0
    }
  ]
}
```

**Field Descriptions:**

- `bio`: Brief description of your expertise (2-3 sentences)
- `experience`: Years of experience in the field
- `services`: Array of services you offer
  - `serviceId`: ID of the service (get from Service Catalog API)
  - `basePrice`: Your base price for this service

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Registration successful. Pending admin approval."
}
```

**Real-World Example:**

```json
{
  "bio": "Licensed plumber specializing in emergency repairs, installations, and maintenance. Available 24/7 for urgent issues.",
  "experience": 15,
  "services": [
    {
      "serviceId": 5,
      "basePrice": 100.0
    },
    {
      "serviceId": 6,
      "basePrice": 200.0
    }
  ]
}
```

---

### 2. Get My Provider Profile

**Endpoint:** `GET /api/Providers/profile`  
**Authorization:** Required (Provider role)

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Provider profile retrieved successfully.",
  "data": {
    "bio": "Experienced electrician with 10 years in residential and commercial projects",
    "experience": 10,
    "services": [
      {
        "serviceId": 1,
        "basePrice": 75.0
      }
    ]
  }
}
```

---

### 3. Add New Service

**Endpoint:** `POST /api/Providers/services`  
**Authorization:** Required (Provider role)

**What it does (Non-Technical):**
Add a new service to your offerings. For example, if you're an electrician already offering "Basic Electrical Repair" and now want to add "Smart Home Installation".

**Request Body:**

```json
{
  "serviceId": 3,
  "basePrice": 200.0
}
```

**Success Response (200 OK):**

```json
{
  "message": "Service added successfully."
}
```

---

### 4. Update Service Details

**Endpoint:** `PUT /api/Providers/services/{serviceId}`  
**Authorization:** Required (Provider role)

**Request Body:**

```json
{
  "basePrice": 85.0,
  "priceType": "Hourly"
}
```

**Field Descriptions:**

- `basePrice`: Your new price
- `priceType`: Either `"Fixed"` (one-time price) or `"Hourly"` (per hour rate)

**Success Response (200 OK):**

```json
{
  "message": "Service updated successfully."
}
```

---

### 5. Delete Service

**Endpoint:** `DELETE /api/Providers/services/{serviceId}`  
**Authorization:** Required (Provider role)

**Example:**

```bash
DELETE /api/Providers/services/3
```

**Success Response (200 OK):**

```json
{
  "message": "Service deleted successfully."
}
```

---

### 6. Search Providers

**Endpoint:** `GET /api/Providers/search`  
**Authorization:** Not required (public)

**What it does (Non-Technical):**
Find service providers based on the service you need, their ratings, and pricing type. Returns a paginated list of providers.

**Query Parameters:**

- `serviceId` (required): The service you need (e.g., plumbing, electrical)
- `minRating` (optional): Minimum average rating (1-5)
- `priceType` (optional): Filter by `"Fixed"` or `"Hourly"` pricing
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Results per page (default: 10)

**Example Request:**

```
GET /api/Providers/search?serviceId=1&minRating=4.0&priceType=Hourly&page=1&pageSize=10
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Providers retrieved successfully.",
  "data": {
    "items": [
      {
        "providerId": 5,
        "providerName": "Mike Johnson",
        "bio": "Experienced electrician with 10 years in residential projects",
        "experience": 10,
        "avgRating": 4.8,
        "basePrice": 75.0,
        "priceType": "Hourly",
        "serviceName": "Electrical Repair"
      },
      {
        "providerId": 12,
        "providerName": "Sarah Williams",
        "bio": "Licensed electrician specializing in smart home installations",
        "experience": 8,
        "avgRating": 4.5,
        "basePrice": 90.0,
        "priceType": "Hourly",
        "serviceName": "Electrical Repair"
      }
    ],
    "totalCount": 25,
    "page": 1,
    "pageSize": 10,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

**Practical Example:**

```javascript
// Find plumbers with at least 4-star rating
fetch("/api/Providers/search?serviceId=5&minRating=4.0")
  .then((res) => res.json())
  .then((data) => {
    console.log(`Found ${data.data.totalCount} qualified plumbers`);
    data.data.items.forEach((provider) => {
      console.log(
        `${provider.providerName}: ${provider.avgRating} stars, $${provider.basePrice}/hr`,
      );
    });
  });
```

---

## Service Catalog

### Understanding Services

**For Non-Technical Users:**
The platform offers various home maintenance services organized into categories (like Plumbing, Electrical, Cleaning). Each service has details about what's included and typical duration.

### 1. Get All Service Categories

**Endpoint:** `GET /api/Service/categories`  
**Authorization:** Not required

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Service categories retrieved successfully.",
  "data": [
    {
      "id": 1,
      "name": "Electrical",
      "description": "All electrical services including repairs, installations, and maintenance",
      "isActive": true
    },
    {
      "id": 2,
      "name": "Plumbing",
      "description": "Plumbing services for residential and commercial properties",
      "isActive": true
    },
    {
      "id": 3,
      "name": "Cleaning",
      "description": "Professional cleaning services for homes and offices",
      "isActive": true
    }
  ]
}
```

---

### 2. Get Services by Category

**Endpoint:** `GET /api/Service/categories/{categoryId}/services`  
**Authorization:** Not required

**What it does (Non-Technical):**
Get all services within a specific category. For example, get all types of electrical services available.

**Example Request:**

```
GET /api/Service/categories/1/services
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Services retrieved successfully.",
  "data": [
    {
      "id": 1,
      "name": "Basic Electrical Repair",
      "duration": 60,
      "priceModel": "Hourly",
      "serviceCategoryId": 1,
      "categoryName": "Electrical"
    },
    {
      "id": 2,
      "name": "Light Fixture Installation",
      "duration": 90,
      "priceModel": "Fixed",
      "serviceCategoryId": 1,
      "categoryName": "Electrical"
    }
  ]
}
```

---

### 3. Get Service Details

**Endpoint:** `GET /api/Service/{serviceId}`  
**Authorization:** Not required

**Example Request:**

```
GET /api/Service/1
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Service retrieved successfully.",
  "data": {
    "id": 1,
    "name": "Basic Electrical Repair",
    "duration": 60,
    "priceModel": "Hourly",
    "serviceCategoryId": 1,
    "categoryName": "Electrical"
  }
}
```

---

### 4. Search Services

**Endpoint:** `GET /api/Service/search`  
**Authorization:** Not required

**Query Parameters:**

- `search` (optional): Search by service name
- `categoryId` (optional): Filter by category
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Results per page (default: 10)

**Example Request:**

```
GET /api/Service/search?search=repair&categoryId=1&page=1&pageSize=10
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Services retrieved successfully.",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Basic Electrical Repair",
        "duration": 60,
        "priceModel": "Hourly",
        "serviceCategoryId": 1,
        "categoryName": "Electrical"
      }
    ],
    "totalCount": 1,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

---

## Time Slot & Availability

### Understanding Time Slots

**For Non-Technical Users:**
Providers set their weekly schedule (e.g., Monday 9 AM - 5 PM). The system automatically creates 1-hour time slots that customers can book. Once a slot is booked, it becomes unavailable.

**For Technical Users:**

- Providers define weekly availability (ProviderAvailability table)
- Background service generates TimeSlots from availability (nightly at 2 AM)
- Slots generated in 1-hour increments, 14 days ahead by default
- Optimistic concurrency control (RowVersion) prevents double-booking
- Expired slots automatically cleaned up

### Provider Workflow:

1. Set weekly availability schedule
2. System generates time slots automatically
3. Customers see and book available slots
4. Booked slots marked as unavailable

---

### 1. Set Weekly Availability (Provider)

**Endpoint:** `PUT /api/Slots/availability`  
**Authorization:** Required (Provider role)

**What it does (Non-Technical):**
Tell the system when you're available to work each week. You can set different hours for different days.

**Request Body:**

```json
{
  "slots": [
    {
      "dayOfWeek": "Monday",
      "startTime": "09:00:00",
      "endTime": "17:00:00"
    },
    {
      "dayOfWeek": "Tuesday",
      "startTime": "09:00:00",
      "endTime": "17:00:00"
    },
    {
      "dayOfWeek": "Wednesday",
      "startTime": "09:00:00",
      "endTime": "17:00:00"
    },
    {
      "dayOfWeek": "Thursday",
      "startTime": "09:00:00",
      "endTime": "17:00:00"
    },
    {
      "dayOfWeek": "Friday",
      "startTime": "09:00:00",
      "endTime": "17:00:00"
    },
    {
      "dayOfWeek": "Saturday",
      "startTime": "10:00:00",
      "endTime": "14:00:00"
    }
  ]
}
```

**Field Descriptions:**

- `dayOfWeek`: Day name (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)
- `startTime`: When you start work (24-hour format: HH:MM:SS)
- `endTime`: When you finish work (24-hour format: HH:MM:SS)

**Important Notes:**

- `startTime` must be before `endTime`
- This replaces your entire schedule (not added to existing)
- System will automatically generate bookable time slots

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Availability updated successfully.",
  "data": [
    {
      "id": 1,
      "providerId": 5,
      "dayOfWeek": "Monday",
      "startTime": "09:00:00",
      "endTime": "17:00:00",
      "isAvailable": true
    }
  ]
}
```

**Example - Part-time Schedule:**

```json
{
  "slots": [
    {
      "dayOfWeek": "Monday",
      "startTime": "18:00:00",
      "endTime": "22:00:00"
    },
    {
      "dayOfWeek": "Wednesday",
      "startTime": "18:00:00",
      "endTime": "22:00:00"
    },
    {
      "dayOfWeek": "Saturday",
      "startTime": "08:00:00",
      "endTime": "16:00:00"
    },
    {
      "dayOfWeek": "Sunday",
      "startTime": "08:00:00",
      "endTime": "16:00:00"
    }
  ]
}
```

---

### 2. Get My Availability (Provider)

**Endpoint:** `GET /api/Slots/availability`  
**Authorization:** Required (Provider role)

**What it does (Non-Technical):**
View your current weekly availability schedule.

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Availability retrieved successfully.",
  "data": [
    {
      "id": 1,
      "providerId": 5,
      "dayOfWeek": "Monday",
      "startTime": "09:00:00",
      "endTime": "17:00:00",
      "isAvailable": true
    },
    {
      "id": 2,
      "providerId": 5,
      "dayOfWeek": "Tuesday",
      "startTime": "09:00:00",
      "endTime": "17:00:00",
      "isAvailable": true
    }
  ]
}
```

---

### 3. Generate Time Slots (Provider)

**Endpoint:** `POST /api/Slots/generate?daysAhead=7`  
**Authorization:** Required (Provider role)

**What it does (Non-Technical):**
Manually create bookable time slots from your availability. The system also does this automatically every night at 2 AM.

**Query Parameters:**

- `daysAhead` (optional): How many days ahead to generate slots (default: 7)

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Time slots generated successfully.",
  "data": [
    {
      "id": 101,
      "providerId": 5,
      "date": "2026-07-10",
      "startTime": "09:00:00",
      "endTime": "10:00:00",
      "isBooked": false
    },
    {
      "id": 102,
      "providerId": 5,
      "date": "2026-07-10",
      "startTime": "10:00:00",
      "endTime": "11:00:00",
      "isBooked": false
    }
  ]
}
```

**Note:** The system prevents duplicate slots. If slots already exist for a date/time, they won't be recreated.

---

### 4. Get Available Slots for Provider (Customer)

**Endpoint:** `GET /api/Slots/{providerId}?date=2026-07-10`  
**Authorization:** Not required

**What it does (Non-Technical):**
See all available time slots for a specific provider on a specific date. Only shows future slots that haven't been booked yet.

**Query Parameters:**

- `date` (required): Date in format YYYY-MM-DD

**Example Request:**

```
GET /api/Slots/5?date=2026-07-10
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Available time slots retrieved successfully.",
  "data": [
    {
      "id": 101,
      "date": "2026-07-10",
      "startTime": "09:00:00",
      "endTime": "10:00:00"
    },
    {
      "id": 102,
      "date": "2026-07-10",
      "startTime": "10:00:00",
      "endTime": "11:00:00"
    },
    {
      "id": 103,
      "date": "2026-07-10",
      "startTime": "11:00:00",
      "endTime": "12:00:00"
    }
  ]
}
```

**Practical Example (JavaScript):**

```javascript
// Show available slots for today
const providerId = 5;
const today = new Date().toISOString().split("T")[0]; // "2026-07-10"

fetch(`/api/Slots/${providerId}?date=${today}`)
  .then((res) => res.json())
  .then((data) => {
    console.log(`${data.data.length} slots available today`);
    data.data.forEach((slot) => {
      console.log(`${slot.startTime} - ${slot.endTime}`);
    });
  });
```

---

## Booking Management

### Understanding the Booking Lifecycle

**For Non-Technical Users:**

1. **Pending**: You created a booking, waiting for provider to accept
2. **Confirmed**: Provider accepted, booking is scheduled
3. **InProgress**: Provider started working
4. **Completed**: Work is done, waiting for payment
5. **Paid**: Payment received, you can now leave a review
6. **Cancelled**: Booking was cancelled
7. **Rejected**: Provider declined the booking

**Status Transitions:**

```
Pending → Confirmed → InProgress → Completed → Paid
   ↓          ↓
Rejected   Cancelled
```

---

### 1. Create Booking (Customer)

**Endpoint:** `POST /api/Booking`  
**Authorization:** Required (Customer role)

**What it does (Non-Technical):**
Book a service provider for a specific time slot. You need to know the provider ID, service ID, and slot ID.

**Request Body:**

```json
{
  "providerId": 5,
  "serviceId": 1,
  "slotId": 101,
  "notes": "Need to fix kitchen lighting, 3 bulbs not working"
}
```

**Field Descriptions:**

- `providerId`: ID of the provider you want to book
- `serviceId`: ID of the service you need
- `slotId`: ID of the time slot (from available slots API)
- `notes`: Additional information about the job (optional)

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Booking created successfully.",
  "data": {
    "id": 50,
    "customerId": "user-id-123",
    "providerId": 5,
    "serviceId": 1,
    "slotId": 101,
    "notes": "Need to fix kitchen lighting, 3 bulbs not working",
    "status": "Pending",
    "statusLabel": "Pending",
    "createdAt": "2026-07-09T10:30:00Z"
  }
}
```

**Error Responses:**

**Slot already booked (400 Bad Request):**

```json
{
  "success": false,
  "message": "This time slot is already booked. Please choose another slot."
}
```

**Slot in the past (400 Bad Request):**

```json
{
  "success": false,
  "message": "This time slot has already passed and cannot be booked."
}
```

**Complete Example:**

```javascript
// 1. Get available slots
const slotsResponse = await fetch("/api/Slots/5?date=2026-07-10");
const slots = await slotsResponse.json();

// 2. Book the first available slot
const booking = {
  providerId: 5,
  serviceId: 1,
  slotId: slots.data[0].id,
  notes: "Kitchen lighting repair needed",
};

const bookingResponse = await fetch("/api/Booking", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify(booking),
});

const result = await bookingResponse.json();
console.log(`Booking created: ID ${result.data.id}`);
```

---

### 2. Confirm Booking (Provider)

**Endpoint:** `PUT /api/Booking/{id}/confirm`  
**Authorization:** Required (Provider role)

**What it does (Non-Technical):**
Accept a booking request. This moves the booking from "Pending" to "Confirmed" status.

**Example Request:**

```
PUT /api/Booking/50/confirm
```

**Success Response (200 OK):**

```json
{
  "id": 50,
  "customerId": "user-id-123",
  "providerId": 5,
  "serviceId": 1,
  "slotId": 101,
  "notes": "Need to fix kitchen lighting",
  "status": "Confirmed",
  "statusLabel": "Confirmed",
  "createdAt": "2026-07-09T10:30:00Z"
}
```

---

### 3. Reject Booking (Provider)

**Endpoint:** `PUT /api/Booking/{id}/reject`  
**Authorization:** Required (Provider role)

**What it does (Non-Technical):**
Decline a booking request. The time slot becomes available again for other customers.

**Example Request:**

```
PUT /api/Booking/50/reject
```

**Success Response (200 OK):**

```json
{
  "id": 50,
  "status": "Rejected",
  "statusLabel": "Rejected"
}
```

---

### 4. Start Booking (Provider)

**Endpoint:** `PUT /api/Booking/{id}/start`  
**Authorization:** Required (Provider role)

**What it does (Non-Technical):**
Mark that you've arrived and started working on the job. Changes status from "Confirmed" to "InProgress".

**Example Request:**

```
PUT /api/Booking/50/start
```

---

### 5. Complete Booking (Provider)

**Endpoint:** `PUT /api/Booking/{id}/complete`  
**Authorization:** Required (Provider role)

**What it does (Non-Technical):**
Mark the job as finished. Changes status from "InProgress" to "Completed". Customer can now make payment.

**Example Request:**

```
PUT /api/Booking/50/complete
```

---

### 6. Cancel Booking

**Endpoint:** `PUT /api/Booking/{id}/cancel`  
**Authorization:** Required (Customer or Provider)

**What it does (Non-Technical):**
Cancel a booking before work starts. The time slot becomes available again. Cannot cancel after work has started.

**Important Rules:**

- ✅ Can cancel: Pending, Confirmed
- ❌ Cannot cancel: InProgress, Completed, Paid

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Booking cancelled successfully.",
  "data": {
    "id": 50,
    "status": "Cancelled"
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "message": "Cancellation is only allowed before the booking is In Progress."
}
```

---

### 7. Get Booking History (Customer)

**Endpoint:** `GET /api/Booking/customer/{customerId}/history`  
**Authorization:** Required (Customer role)

**What it does (Non-Technical):**
View all your bookings, split into active (ongoing) and past (completed or cancelled).

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Booking history retrieved successfully.",
  "data": {
    "activeBookings": [
      {
        "id": 50,
        "providerId": 5,
        "serviceId": 1,
        "slotId": 101,
        "status": "Confirmed",
        "notes": "Kitchen lighting repair",
        "createdAt": "2026-07-09T10:30:00Z",
        "provider": {
          "name": "Mike Johnson",
          "phone": "+1234567890"
        },
        "service": {
          "name": "Electrical Repair"
        },
        "slot": {
          "date": "2026-07-10",
          "startTime": "09:00:00",
          "endTime": "10:00:00"
        }
      }
    ],
    "pastBookings": [
      {
        "id": 45,
        "providerId": 3,
        "serviceId": 5,
        "status": "Paid",
        "notes": "Fixed leaking faucet",
        "createdAt": "2026-06-15T08:00:00Z"
      }
    ]
  }
}
```

---

### 8. Get Incoming Requests (Provider)

**Endpoint:** `GET /api/Booking/provider/{providerId}/incoming-requests`  
**Authorization:** Required (Provider role)

**What it does (Non-Technical):**
See all booking requests waiting for your response (status: Pending).

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Incoming requests retrieved successfully.",
  "data": [
    {
      "id": 50,
      "customerId": "user-id-123",
      "serviceId": 1,
      "slotId": 101,
      "status": "Pending",
      "notes": "Kitchen lighting repair",
      "createdAt": "2026-07-09T10:30:00Z",
      "customer": {
        "name": "John Doe",
        "phone": "+1234567890",
        "email": "john@example.com"
      },
      "service": {
        "name": "Electrical Repair"
      },
      "slot": {
        "date": "2026-07-10",
        "startTime": "09:00:00"
      }
    }
  ]
}
```

---

### 9. Get Today's Schedule (Provider)

**Endpoint:** `GET /api/Booking/provider/{providerId}/today-schedule`  
**Authorization:** Required (Provider role)

**What it does (Non-Technical):**
See all your bookings scheduled for today, regardless of status.

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Today's schedule retrieved successfully.",
  "data": [
    {
      "id": 50,
      "customerId": "user-id-123",
      "serviceId": 1,
      "slotId": 101,
      "status": "Confirmed",
      "notes": "Kitchen lighting repair",
      "customer": {
        "name": "John Doe",
        "phone": "+1234567890"
      },
      "slot": {
        "date": "2026-07-10",
        "startTime": "09:00:00",
        "endTime": "10:00:00"
      }
    },
    {
      "id": 52,
      "customerId": "user-id-456",
      "serviceId": 2,
      "slotId": 105,
      "status": "InProgress",
      "notes": "Install ceiling fan",
      "customer": {
        "name": "Jane Smith",
        "phone": "+0987654321"
      },
      "slot": {
        "date": "2026-07-10",
        "startTime": "14:00:00",
        "endTime": "15:00:00"
      }
    }
  ]
}
```

---

## Payment Processing

### Understanding Payments

**For Non-Technical Users:**
After the provider completes the work, you need to verify payment. The platform takes a 10% commission, and the provider receives the rest.

**For Technical Users:**

- Payment required after booking status = "Completed"
- Platform commission: 10% of final amount
- Provider earnings auto-calculated: Amount - Commission
- Payment changes booking status to "Paid"
- Reviews enabled only after payment

### Payment Flow:

1. Provider completes work (Status: Completed)
2. Provider verifies cash payment received
3. System records payment with 10% commission
4. Booking status → Paid
5. Both parties can now review

---

### Verify Cash Payment (Provider)

**Endpoint:** `POST /api/Payments/verify-cash`  
**Authorization:** Required (Provider role)

**What it does (Non-Technical):**
After completing a job and receiving cash payment from the customer, use this endpoint to record the payment in the system.

**Request Body:**

```json
{
  "bookingId": 50,
  "finalAmount": 100.0,
  "method": "Cash"
}
```

**Field Descriptions:**

- `bookingId`: ID of the completed booking
- `finalAmount`: Total amount received from customer
- `method`: Payment method (`"Cash"`, `"Card"`, or `"Wallet"`)

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Payment verified successfully. Status updated to Paid."
}
```

**Payment Breakdown Example:**

```
Customer pays: $100.00
Platform commission (10%): $10.00
Provider receives: $90.00
```

**Error Responses:**

**Booking not completed (400 Bad Request):**

```json
{
  "success": false,
  "message": "Payment could not be processed.",
  "errors": ["Ensure booking is completed and not already paid."]
}
```

**Practical Example:**

```javascript
// After completing work
async function recordPayment(bookingId, amount) {
  const response = await fetch("/api/Payments/verify-cash", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${providerToken}`,
    },
    body: JSON.stringify({
      bookingId: bookingId,
      finalAmount: amount,
      method: "Cash",
    }),
  });

  const result = await response.json();
  if (result.success) {
    console.log("Payment recorded! You earned: $" + (amount * 0.9).toFixed(2));
  }
}

// Record $150 payment
recordPayment(50, 150.0);
// Output: "Payment recorded! You earned: $135.00"
```

---

## Review System

### Understanding Reviews

**For Non-Technical Users:**
After payment is completed, both the customer and provider can leave a review for each other. Reviews help maintain quality and trust on the platform.

**Rules:**

- Reviews only allowed after booking status = "Paid"
- Each person can submit only ONE review per booking
- Customer reviews affect provider's average rating
- Rating scale: 1 (poor) to 5 (excellent)

---

### 1. Create Review

**Endpoint:** `POST /api/Review`  
**Authorization:** Required (Customer or Provider)

**What it does (Non-Technical):**
Leave a review and rating for a completed booking.

**Request Body:**

```json
{
  "bookingId": 50,
  "rating": 5,
  "comment": "Excellent work! Very professional and fixed the issue quickly. Highly recommend."
}
```

**Field Descriptions:**

- `bookingId`: ID of the paid booking
- `rating`: Rating from 1 to 5
  - 5 = Excellent
  - 4 = Good
  - 3 = Average
  - 2 = Below Average
  - 1 = Poor
- `comment`: Your written feedback (optional but recommended)

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Review submitted successfully."
}
```

**Error Responses:**

**Booking not paid (400 Bad Request):**

```json
{
  "success": false,
  "message": "Reviews can only be submitted after payment is completed."
}
```

**Already reviewed (400 Bad Request):**

```json
{
  "success": false,
  "message": "You have already reviewed this booking."
}
```

**Customer Review Example:**

```json
{
  "bookingId": 50,
  "rating": 5,
  "comment": "Mike was fantastic! Arrived on time, diagnosed the issue quickly, and had everything working in 30 minutes. Very clean work and reasonable price."
}
```

**Provider Review Example:**

```json
{
  "bookingId": 50,
  "rating": 5,
  "comment": "Great customer! Clear communication, prepared workspace, and prompt payment. Would gladly work with again."
}
```

---

### 2. Check Review Eligibility

**Endpoint:** `GET /api/Review/can-review/{bookingId}`  
**Authorization:** Required

**What it does (Non-Technical):**
Check if you're allowed to review a booking and why not if you can't.

**Example Request:**

```
GET /api/Review/can-review/50
```

**Success Response - Can Review (200 OK):**

```json
{
  "success": true,
  "message": "Review eligibility checked.",
  "data": {
    "canReview": true
  }
}
```

**Success Response - Cannot Review (200 OK):**

```json
{
  "success": true,
  "message": "Review eligibility checked.",
  "data": {
    "canReview": false,
    "reason": "You have already reviewed this booking."
  }
}
```

**Or:**

```json
{
  "success": false,
  "message": "Payment not completed yet."
}
```

---

### 3. Get Reviews for Booking

**Endpoint:** `GET /api/Review/booking/{bookingId}`  
**Authorization:** Required

**What it does (Non-Technical):**
See all reviews left for a specific booking (usually 2: one from customer, one from provider).

**Example Request:**

```
GET /api/Review/booking/50
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Reviews retrieved successfully.",
  "data": [
    {
      "id": 10,
      "rating": 5,
      "comment": "Excellent work! Very professional.",
      "reviewerType": "Customer",
      "reviewerName": "John Doe",
      "createdAt": "2026-07-10T18:30:00Z"
    },
    {
      "id": 11,
      "rating": 5,
      "comment": "Great customer! Clear communication.",
      "reviewerType": "Provider",
      "reviewerName": "Mike Johnson",
      "createdAt": "2026-07-10T19:00:00Z"
    }
  ]
}
```

---

### 4. Get Provider Reviews

**Endpoint:** `GET /api/Review/provider/{providerId}`  
**Authorization:** Not required (public)

**What it does (Non-Technical):**
View all customer reviews for a provider, including their average rating.

**Example Request:**

```
GET /api/Review/provider/5
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Provider reviews retrieved successfully.",
  "data": {
    "providerName": "Mike Johnson",
    "averageRating": 4.8,
    "totalReviews": 25,
    "reviews": [
      {
        "id": 10,
        "rating": 5,
        "comment": "Excellent work! Very professional and fixed the issue quickly.",
        "reviewerName": "John Doe",
        "createdAt": "2026-07-10T18:30:00Z"
      },
      {
        "id": 8,
        "rating": 4,
        "comment": "Good service, arrived on time but took a bit longer than expected.",
        "reviewerName": "Jane Smith",
        "createdAt": "2026-07-05T14:20:00Z"
      },
      {
        "id": 5,
        "rating": 5,
        "comment": "Outstanding! Fixed everything perfectly and explained the issues.",
        "reviewerName": "Bob Wilson",
        "createdAt": "2026-06-28T16:45:00Z"
      }
    ]
  }
}
```

**Practical Use Case:**

```javascript
// Display provider profile with reviews
async function showProviderProfile(providerId) {
  const response = await fetch(`/api/Review/provider/${providerId}`);
  const data = await response.json();

  console.log(`${data.data.providerName}`);
  console.log(`⭐ ${data.data.averageRating}/5.0 (${data.data.totalReviews} reviews)`);
  console.log("\nRecent Reviews:");

  data.data.reviews.slice(0, 5).forEach((review) => {
    console.log(`\n${"⭐".repeat(review.rating)} - ${review.reviewerName}`);
    console.log(review.comment);
  });
}

showProviderProfile(5);
```

---

## Admin Operations

### Admin Responsibilities

**For Non-Technical Users:**
Admins approve or reject provider applications to ensure only qualified professionals offer services on the platform.

---

### 1. Get Pending Providers

**Endpoint:** `GET /api/Admin/providers/pending`  
**Authorization:** Required (Admin role)

**What it does (Non-Technical):**
View all providers waiting for approval.

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Pending providers retrieved successfully.",
  "data": [
    {
      "id": 8,
      "userId": "user-id-789",
      "bio": "Licensed electrician with 10 years experience",
      "experience": 10,
      "avgRating": 0,
      "status": "PendingApproval",
      "isApproved": false,
      "user": {
        "name": "Alex Martinez",
        "email": "alex@example.com",
        "phone": "+1234567890"
      },
      "providerServices": [
        {
          "serviceId": 1,
          "serviceName": "Electrical Repair",
          "basePrice": 75.0
        }
      ],
      "createdAt": "2026-07-08T09:00:00Z"
    }
  ]
}
```

---

### 2. Approve Provider

**Endpoint:** `PUT /api/Admin/providers/{providerId}/approve`  
**Authorization:** Required (Admin role)

**What it does (Non-Technical):**
Approve a provider's application, allowing them to receive bookings.

**Example Request:**

```
PUT /api/Admin/providers/8/approve
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Provider approved successfully."
}
```

---

### 3. Reject Provider

**Endpoint:** `PUT /api/Admin/providers/{providerId}/reject`  
**Authorization:** Required (Admin role)

**What it does (Non-Technical):**
Reject a provider's application.

**Example Request:**

```
PUT /api/Admin/providers/8/reject
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Provider rejected successfully."
}
```

---

### 4. Update Provider Status

**Endpoint:** `PUT /api/Admin/providers/status?providerId=8&status=Suspended`  
**Authorization:** Required (Admin role)

**Query Parameters:**

- `providerId`: ID of the provider
- `status`: New status
  - `1` = PendingApproval
  - `2` = Approved
  - `3` = Rejected
  - `4` = Suspended

**Example Request:**

```
PUT /api/Admin/providers/status?providerId=8&status=4
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "The provider's account is now Suspended."
}
```

---

## Error Handling

### Standard Error Response Format

All errors follow a consistent structure:

```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "errors": ["Detailed error 1", "Detailed error 2"],
  "timestamp": "2026-07-09T10:30:00Z"
}
```

### HTTP Status Codes

| Code | Meaning               | When It Happens                         |
| ---- | --------------------- | --------------------------------------- |
| 200  | OK                    | Request succeeded                       |
| 201  | Created               | Resource created successfully           |
| 400  | Bad Request           | Invalid data or business rule violation |
| 401  | Unauthorized          | Missing or invalid authentication token |
| 403  | Forbidden             | Authenticated but lacking permissions   |
| 404  | Not Found             | Resource doesn't exist                  |
| 500  | Internal Server Error | Unexpected server error                 |

### Common Error Scenarios

#### 1. Authentication Errors

**Missing Token:**

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "timestamp": "2026-07-09T10:30:00Z"
}
```

**Invalid/Expired Token:**

```json
{
  "statusCode": 401,
  "message": "Token validation failed",
  "timestamp": "2026-07-09T10:30:00Z"
}
```

#### 2. Authorization Errors

**Wrong Role:**

```json
{
  "statusCode": 403,
  "message": "Forbidden",
  "details": "User does not have the required role",
  "timestamp": "2026-07-09T10:30:00Z"
}
```

#### 3. Validation Errors

**Missing Required Fields:**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Email is required", "Password must be at least 8 characters"]
}
```

#### 4. Business Logic Errors

**Booking Slot Conflict:**

```json
{
  "statusCode": 400,
  "message": "This time slot is already booked. Please choose another slot.",
  "timestamp": "2026-07-09T10:30:00Z"
}
```

**Invalid Status Transition:**

```json
{
  "statusCode": 400,
  "message": "Cannot complete a booking that is currently 'Pending'. Expected status: 'InProgress'.",
  "timestamp": "2026-07-09T10:30:00Z"
}
```

---

## Data Models

### Core Entities

#### ApplicationUser

```json
{
  "id": "string (GUID)",
  "name": "string",
  "email": "string (unique)",
  "phone": "string",
  "role": "Customer | Provider | Admin",
  "createdAt": "datetime"
}
```

#### ProviderProfile

```json
{
  "id": "integer",
  "userId": "string",
  "bio": "string",
  "experience": "integer (years)",
  "avgRating": "decimal (0.0 - 5.0)",
  "status": "PendingApproval | Approved | Rejected | Suspended",
  "isApproved": "boolean",
  "createdAt": "datetime"
}
```

#### Service

```json
{
  "id": "integer",
  "name": "string",
  "duration": "integer (minutes)",
  "priceModel": "Fixed | Hourly",
  "serviceCategoryId": "integer",
  "categoryName": "string"
}
```

#### TimeSlot

```json
{
  "id": "integer",
  "providerId": "integer",
  "date": "date (YYYY-MM-DD)",
  "startTime": "time (HH:MM:SS)",
  "endTime": "time (HH:MM:SS)",
  "isBooked": "boolean"
}
```

#### Booking

```json
{
  "id": "integer",
  "customerId": "string",
  "providerId": "integer",
  "serviceId": "integer",
  "slotId": "integer",
  "status": "Pending | Confirmed | InProgress | Completed | Paid | Cancelled | Rejected",
  "notes": "string",
  "createdAt": "datetime"
}
```

#### Payment

```json
{
  "id": "integer",
  "bookingId": "integer",
  "amount": "decimal",
  "commission": "decimal (10%)",
  "providerEarnings": "decimal (amount - commission)",
  "paymentMethod": "Cash | Card | Wallet",
  "paymentStatus": "Pending | Paid | Failed",
  "paidAt": "datetime"
}
```

#### Review

```json
{
  "id": "integer",
  "bookingId": "integer",
  "reviewerId": "string",
  "revieweeId": "string",
  "reviewerType": "Customer | Provider",
  "rating": "integer (1-5)",
  "comment": "string",
  "createdAt": "datetime"
}
```

---

## Complete User Journey Examples

### Journey 1: Customer Books a Service

**Step 1: Register as Customer**

```bash
POST /api/Auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890",
  "role": "Customer"
}
# Save accessToken from response
```

**Step 2: Browse Service Categories**

```bash
GET /api/Service/categories
# Choose "Electrical" (id: 1)
```

**Step 3: View Electrical Services**

```bash
GET /api/Service/categories/1/services
# Choose "Electrical Repair" (id: 1)
```

**Step 4: Search for Providers**

```bash
GET /api/Providers/search?serviceId=1&minRating=4.0
# Choose provider with id: 5
```

**Step 5: Check Available Slots**

```bash
GET /api/Slots/5?date=2026-07-15
# Choose slot id: 101 (09:00-10:00)
```

**Step 6: Create Booking**

```bash
POST /api/Booking
Authorization: Bearer {accessToken}
{
  "providerId": 5,
  "serviceId": 1,
  "slotId": 101,
  "notes": "Kitchen lighting not working"
}
# Booking created with id: 50, status: Pending
```

**Step 7: Wait for Provider to Confirm**

```bash
# Provider confirms
# Booking status → Confirmed
```

**Step 8: Provider Completes Work**

```bash
# Provider starts: status → InProgress
# Provider completes: status → Completed
```

**Step 9: Provider Records Payment**

```bash
# Provider verifies payment
# Booking status → Paid
```

**Step 10: Leave Review**

```bash
POST /api/Review
Authorization: Bearer {accessToken}
{
  "bookingId": 50,
  "rating": 5,
  "comment": "Excellent work! Very professional."
}
```

---

### Journey 2: Provider Joins Platform

**Step 1: Register as Provider**

```bash
POST /api/Auth/register
{
  "name": "Mike Johnson",
  "email": "mike@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890",
  "role": "Provider"
}
```

**Step 2: Submit Provider Profile**

```bash
POST /api/Providers/register
Authorization: Bearer {accessToken}
{
  "bio": "Licensed electrician with 10 years experience",
  "experience": 10,
  "services": [
    {"serviceId": 1, "basePrice": 75.00},
    {"serviceId": 2, "basePrice": 150.00}
  ]
}
# Status: PendingApproval
```

**Step 3: Wait for Admin Approval**

```bash
# Admin reviews and approves
# Status → Approved, isApproved: true
```

**Step 4: Set Weekly Availability**

```bash
PUT /api/Slots/availability
Authorization: Bearer {accessToken}
{
  "slots": [
    {"dayOfWeek": "Monday", "startTime": "09:00:00", "endTime": "17:00:00"},
    {"dayOfWeek": "Tuesday", "startTime": "09:00:00", "endTime": "17:00:00"},
    {"dayOfWeek": "Wednesday", "startTime": "09:00:00", "endTime": "17:00:00"},
    {"dayOfWeek": "Thursday", "startTime": "09:00:00", "endTime": "17:00:00"},
    {"dayOfWeek": "Friday", "startTime": "09:00:00", "endTime": "17:00:00"}
  ]
}
```

**Step 5: Generate Bookable Slots**

```bash
POST /api/Slots/generate?daysAhead=14
Authorization: Bearer {accessToken}
# System creates bookable time slots
```

**Step 6: Monitor Incoming Requests**

```bash
GET /api/Booking/provider/5/incoming-requests
Authorization: Bearer {accessToken}
# New booking request appears (id: 50)
```

**Step 7: Accept Booking**

```bash
PUT /api/Booking/50/confirm
Authorization: Bearer {accessToken}
# Booking status → Confirmed
```

**Step 8: Check Today's Schedule**

```bash
GET /api/Booking/provider/5/today-schedule
Authorization: Bearer {accessToken}
```

**Step 9: Start Work**

```bash
PUT /api/Booking/50/start
Authorization: Bearer {accessToken}
# Booking status → InProgress
```

**Step 10: Complete Work**

```bash
PUT /api/Booking/50/complete
Authorization: Bearer {accessToken}
# Booking status → Completed
```

**Step 11: Record Payment**

```bash
POST /api/Payments/verify-cash
Authorization: Bearer {accessToken}
{
  "bookingId": 50,
  "finalAmount": 100.00,
  "method": "Cash"
}
# Platform commission: $10
# Provider earnings: $90
# Booking status → Paid
```

**Step 12: Review Customer**

```bash
POST /api/Review
Authorization: Bearer {accessToken}
{
  "bookingId": 50,
  "rating": 5,
  "comment": "Great customer! Clear communication and prompt payment."
}
```

---

## Advanced Features

### Background Job: Automatic Slot Generation

**What it does:**
Every night at 2:00 AM, the system automatically:

1. Deletes expired time slots (past dates)
2. Generates new slots for all providers (14 days ahead)
3. Based on each provider's weekly availability

**Technical Details:**

- Runs as IHostedService
- Prevents duplicate slot generation
- Creates 1-hour time slot increments
- Only generates for providers with availability set

**Provider Benefits:**

- No manual slot management required
- Always have bookable slots available
- Old slots cleaned up automatically

---

### Concurrency Control

**Problem:**
Two customers try to book the same time slot simultaneously.

**Solution:**
TimeSlot entity has RowVersion (concurrency token). When booking:

1. First request locks the slot
2. Second request gets `DbUpdateConcurrencyException`
3. Error message: "This time slot was just booked by someone else"
4. Customer must choose different slot

**Error Response:**

```json
{
  "statusCode": 400,
  "message": "This time slot was just booked by someone else. Please choose a different slot.",
  "timestamp": "2026-07-09T10:30:00Z"
}
```

---

### Commission Calculation

**How It Works:**

```
Customer Payment: $150.00
Platform Commission (10%): $15.00
Provider Earnings: $135.00
```

**In Database:**

```json
{
  "amount": 150.0,
  "commission": 15.0,
  "providerEarnings": 135.0
}
```

**Calculation:**

- Commission = Amount × 0.10
- Provider Earnings = Amount - Commission (computed property)

---

### Rating System

**Provider Average Rating Update:**

- Calculated when customer submits review
- Formula: Average of all customer ratings
- Updates immediately in ProviderProfile table
- Affects search result ordering (higher ratings first)

**Example:**

```
Existing reviews: 4.5, 5.0, 4.0, 5.0, 4.5
New review: 5.0
New average: (4.5 + 5.0 + 4.0 + 5.0 + 4.5 + 5.0) / 6 = 4.67
```

---

## Best Practices

### For Frontend Developers

#### 1. Token Management

```javascript
// Store tokens securely
localStorage.setItem("accessToken", data.accessToken);
localStorage.setItem("refreshToken", data.refreshToken);

// Add token to all requests
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("accessToken");
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
};

// Auto-refresh on 401
async function fetchWithAutoRefresh(url, options) {
  let response = await fetchWithAuth(url, options);

  if (response.status === 401) {
    // Try refreshing token
    const refreshToken = localStorage.getItem("refreshToken");
    const refreshResponse = await fetch("/api/Auth/refresh-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);

      // Retry original request
      response = await fetchWithAuth(url, options);
    }
  }

  return response;
}
```

#### 2. Error Handling

```javascript
async function handleApiCall(url, options) {
  try {
    const response = await fetchWithAuth(url, options);
    const data = await response.json();

    if (!response.ok) {
      // Show user-friendly error
      if (data.errors && data.errors.length > 0) {
        alert(data.errors.join("\n"));
      } else {
        alert(data.message || "An error occurred");
      }
      return null;
    }

    return data;
  } catch (error) {
    console.error("Network error:", error);
    alert("Network error. Please check your connection.");
    return null;
  }
}
```

#### 3. Pagination Helper

```javascript
function PaginationControls({ pagination, onPageChange }) {
  return (
    <div>
      <button
        disabled={!pagination.hasPreviousPage}
        onClick={() => onPageChange(pagination.page - 1)}
      >
        Previous
      </button>

      <span>
        Page {pagination.page} of {pagination.totalPages}({pagination.totalCount} total)
      </span>

      <button disabled={!pagination.hasNextPage} onClick={() => onPageChange(pagination.page + 1)}>
        Next
      </button>
    </div>
  );
}
```

### For Backend Developers

#### 1. Adding New Endpoints

- Follow existing controller patterns
- Use `[Authorize]` for protected endpoints
- Return `ApiResponse<T>` wrapper
- Handle exceptions in GlobalExceptionHandlingMiddleware

#### 2. Database Migrations

```bash
# Add migration
dotnet ef migrations add YourMigrationName

# Update database
dotnet ef database update
```

#### 3. Testing Endpoints

Use Swagger UI at `http://localhost:5000/swagger` for interactive testing.

---

## Security Considerations

### 1. Password Security

- Passwords hashed using ASP.NET Core Identity PasswordHasher
- Algorithm: PBKDF2 with HMAC-SHA256
- Never store plain text passwords

### 2. JWT Security

- Tokens signed with HS256 algorithm
- Secret key stored in appsettings.json (use environment variables in production)
- Access token: 24-hour expiry
- Refresh token: 7-day expiry

### 3. Authorization

- Role-based access control (RBAC)
- Endpoint protection with `[Authorize(Roles = "...")]`
- Claims stored in JWT token

### 4. SQL Injection Prevention

- Entity Framework Core parameterized queries
- Never use string concatenation for queries

### 5. CORS (Cross-Origin Resource Sharing)

Configure in production:

```csharp
builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", policy => {
        policy.WithOrigins("https://yourfrontend.com")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
```

---

## Troubleshooting

### Common Issues

#### Issue 1: "Unauthorized" Error

**Symptoms:** 401 status on protected endpoints

**Solutions:**

- Check token is included: `Authorization: Bearer {token}`
- Verify token hasn't expired (24 hours)
- Use refresh token to get new access token
- Re-login if refresh token expired

#### Issue 2: "Slot Already Booked"

**Symptoms:** Cannot book a time slot

**Solutions:**

- Refresh available slots (GET /api/Slots/{providerId}?date=...)
- Choose different time slot
- This is expected behavior (not a bug)

#### Issue 3: "Cannot Complete Booking"

**Symptoms:** Status transition errors

**Solutions:**

- Check current booking status
- Verify correct status transition:
  - Pending → Confirmed (or Rejected)
  - Confirmed → InProgress
  - InProgress → Completed
  - Completed → Paid (via payment)
- Cannot skip steps

#### Issue 4: "Provider Not Found in Search"

**Symptoms:** Provider doesn't appear in search results

**Possible Reasons:**

- Provider status not "Approved" (check with admin)
- Provider doesn't offer the searched service
- Provider rating below minimum filter
- Provider hasn't set availability/generated slots

#### Issue 5: "Cannot Submit Review"

**Symptoms:** Review submission fails

**Solutions:**

- Ensure booking status is "Paid"
- Check if you already reviewed this booking (one review per user per booking)
- Verify you're part of the booking (customer or provider)

---

## Performance Tips

### For API Consumers

1. **Use Pagination**
   - Don't fetch all results at once
   - Use `page` and `pageSize` parameters
   - Default page size: 10

2. **Cache Static Data**
   - Service categories rarely change
   - Cache on frontend for 24 hours

3. **Minimize Requests**
   - Fetch available slots only when needed
   - Don't poll for updates (consider WebSockets for real-time)

4. **Batch Operations**
   - Currently not supported
   - Make requests sequentially with delays if needed

### For API Developers

1. **Database Indexing**
   - Already indexed: Email, ServiceCategoryId, BookingId, Status
   - Add indexes if query performance issues

2. **Eager Loading**
   - Use `.Include()` for related entities
   - Prevent N+1 query problems

3. **Caching**
   - Consider Redis for frequently accessed data
   - Cache service categories, services

---

## API Rate Limiting

**Current Status:** Not implemented

**Recommended for Production:**

- 100 requests per minute per IP
- 1000 requests per hour per user
- Implement using ASP.NET Core middleware

---

## Versioning

**Current Version:** v1 (implicit)

**Future Versioning Strategy:**

- URL-based: `/api/v2/...`
- Header-based: `Api-Version: 2`
- Backward compatibility maintained for at least 6 months

---

## Support & Contact

### For API Issues

- Check this documentation first
- Review error messages carefully
- Check server logs for detailed errors

### For Business/Integration Questions

- Contact platform administrator
- Review terms of service
- Check integration guidelines

---

## Glossary

**Terms for Non-Technical Users:**

- **API** - Application Programming Interface: A way for software applications to communicate with each other
- **Endpoint** - A specific URL that performs a specific action (like /api/Auth/login)
- **Token** - A secure "ticket" that proves you're logged in
- **Booking** - An appointment scheduled with a service provider
- **Slot** - A specific time period that can be booked
- **Provider** - A service professional offering home maintenance services
- **Customer** - A user who books services
- **Status** - The current state of a booking (Pending, Confirmed, etc.)
- **Review** - Feedback and rating left after a service is completed
- **Commission** - Fee taken by the platform (10% of payment)

**Technical Terms:**

- **JWT** - JSON Web Token: Stateless authentication mechanism
- **CRUD** - Create, Read, Update, Delete operations
- **DTO** - Data Transfer Object: Object for API data exchange
- **GUID** - Globally Unique Identifier: Unique ID format
- **Pagination** - Breaking large result sets into pages
- **Concurrency** - Handling simultaneous operations
- **Migration** - Database schema version/update
- **Seeding** - Populating database with initial data
- **Middleware** - Software component in request processing pipeline
- **Clean Architecture** - Layered architecture pattern (Domain, Application, Infrastructure, API)

---

## Appendix: Quick Reference

### All Endpoints Summary

#### Authentication

- `POST /api/Auth/register` - Register user
- `POST /api/Auth/login` - Login
- `POST /api/Auth/refresh-token` - Refresh token

#### User Management

- `GET /api/User/me` - Get profile
- `PUT /api/User/me` - Update profile
- `POST /api/User/change-password` - Change password
- `GET /api/User` - Get all users (Admin)

#### Providers

- `POST /api/Providers/register` - Register as provider
- `POST /api/Providers/services` - Add service
- `PUT /api/Providers/services/{id}` - Update service
- `DELETE /api/Providers/services/{id}` - Delete service
- `GET /api/Providers/profile` - Get provider profile
- `GET /api/Providers/search` - Search providers

#### Services

- `GET /api/Service/categories` - Get categories
- `GET /api/Service/categories/{id}/services` - Get services by category
- `GET /api/Service/{id}` - Get service details
- `GET /api/Service/search` - Search services

#### Slots & Availability

- `PUT /api/Slots/availability` - Set availability
- `GET /api/Slots/availability` - Get availability
- `POST /api/Slots/generate` - Generate slots
- `GET /api/Slots/{providerId}?date=` - Get available slots

#### Bookings

- `POST /api/Booking` - Create booking
- `PUT /api/Booking/{id}/confirm` - Confirm booking
- `PUT /api/Booking/{id}/reject` - Reject booking
- `PUT /api/Booking/{id}/start` - Start booking
- `PUT /api/Booking/{id}/complete` - Complete booking
- `PUT /api/Booking/{id}/cancel` - Cancel booking
- `GET /api/Booking/customer/{id}/history` - Booking history
- `GET /api/Booking/provider/{id}/incoming-requests` - Incoming requests
- `GET /api/Booking/provider/{id}/today-schedule` - Today's schedule

#### Payments

- `POST /api/Payments/verify-cash` - Verify payment

#### Reviews

- `POST /api/Review` - Create review
- `GET /api/Review/booking/{id}` - Get booking reviews
- `GET /api/Review/can-review/{id}` - Check review eligibility
- `GET /api/Review/provider/{id}` - Get provider reviews

#### Admin

- `GET /api/Admin/providers/pending` - Get pending providers
- `PUT /api/Admin/providers/{id}/approve` - Approve provider
- `PUT /api/Admin/providers/{id}/reject` - Reject provider
- `PUT /api/Admin/providers/status` - Update provider status

---

### Status Code Quick Reference

| Code | Name         | Meaning                  |
| ---- | ------------ | ------------------------ |
| 200  | OK           | Success                  |
| 201  | Created      | Resource created         |
| 400  | Bad Request  | Invalid input            |
| 401  | Unauthorized | Authentication required  |
| 403  | Forbidden    | Insufficient permissions |
| 404  | Not Found    | Resource not found       |
| 500  | Server Error | Internal error           |

---

### Booking Status Flow

```
CREATE BOOKING
    ↓
[PENDING] ──────────→ [REJECTED] (Provider declines, slot freed)
    ↓
    ↓ Provider confirms
    ↓
[CONFIRMED] ─────────→ [CANCELLED] (Before work starts, slot freed)
    ↓
    ↓ Provider starts
    ↓
[IN PROGRESS] ───────→ [CANCELLED] (Not allowed)
    ↓
    ↓ Provider completes
    ↓
[COMPLETED]
    ↓
    ↓ Payment verified
    ↓
[PAID] ──────────────→ Reviews enabled
```

---

### Time Format Reference

| Format      | Example                | Use Case        |
| ----------- | ---------------------- | --------------- |
| Date        | `2026-07-10`           | Slot dates      |
| Time        | `09:00:00`             | Start/End times |
| DateTime    | `2026-07-10T09:30:00Z` | Timestamps      |
| Day of Week | `Monday`               | Availability    |

---

### Sample Integration Code

#### React Example

```jsx
import React, { useState, useEffect } from "react";

function ProviderSearch() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProviders() {
      const response = await fetch("/api/Providers/search?serviceId=1&minRating=4.0");
      const data = await response.json();
      setProviders(data.data.items);
      setLoading(false);
    }
    fetchProviders();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Available Providers</h2>
      {providers.map((provider) => (
        <div key={provider.providerId}>
          <h3>{provider.providerName}</h3>
          <p>⭐ {provider.avgRating}/5.0</p>
          <p>
            ${provider.basePrice} - {provider.priceType}
          </p>
          <p>{provider.bio}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Python Example

```python
import requests
from datetime import datetime

class HomeServiceAPI:
    def __init__(self, base_url):
        self.base_url = base_url
        self.token = None

    def login(self, email, password):
        response = requests.post(
            f"{self.base_url}/api/Auth/login",
            json={"email": email, "password": password}
        )
        data = response.json()
        self.token = data['data']['accessToken']
        return data

    def get_headers(self):
        return {"Authorization": f"Bearer {self.token}"}

    def search_providers(self, service_id, min_rating=None):
        params = {"serviceId": service_id}
        if min_rating:
            params["minRating"] = min_rating

        response = requests.get(
            f"{self.base_url}/api/Providers/search",
            params=params
        )
        return response.json()

    def create_booking(self, provider_id, service_id, slot_id, notes=""):
        response = requests.post(
            f"{self.base_url}/api/Booking",
            headers=self.get_headers(),
            json={
                "providerId": provider_id,
                "serviceId": service_id,
                "slotId": slot_id,
                "notes": notes
            }
        )
        return response.json()

# Usage
api = HomeServiceAPI("http://localhost:5000")
api.login("john@example.com", "SecurePass123!")

providers = api.search_providers(service_id=1, min_rating=4.0)
print(f"Found {len(providers['data']['items'])} providers")

booking = api.create_booking(
    provider_id=5,
    service_id=1,
    slot_id=101,
    notes="Kitchen lighting repair needed"
)
print(f"Booking created: {booking['data']['id']}")
```

#### cURL Examples Collection

```bash
# Save these in a file for quick testing

# 1. Register
curl -X POST http://localhost:5000/api/Auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Pass123!","phone":"+1234567890","role":"Customer"}'

# 2. Login (save token)
curl -X POST http://localhost:5000/api/Auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Pass123!"}'

# 3. Get profile (replace TOKEN)
curl -X GET http://localhost:5000/api/User/me \
  -H "Authorization: Bearer TOKEN"

# 4. Search providers
curl -X GET "http://localhost:5000/api/Providers/search?serviceId=1&minRating=4.0"

# 5. Get available slots
curl -X GET "http://localhost:5000/api/Slots/5?date=2026-07-15"

# 6. Create booking (replace TOKEN)
curl -X POST http://localhost:5000/api/Booking \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"providerId":5,"serviceId":1,"slotId":101,"notes":"Test booking"}'
```

---

## Change Log

### Version 1.0 (Current)

- Initial API release
- All core features implemented
- JWT authentication with refresh tokens
- Role-based authorization
- Booking lifecycle management
- Payment processing with commission
- Review system
- Background slot generation
- Concurrency control for bookings

### Planned Features (Future)

- Real-time notifications (WebSockets/SignalR)
- Email notifications
- SMS notifications
- Advanced search filters
- Provider analytics dashboard
- Customer booking analytics
- Payment gateway integration (Stripe, PayPal)
- File upload for provider certifications
- Multi-language support
- Mobile app API optimizations

---

## FAQ

**Q: How long are JWT tokens valid?**  
A: Access tokens are valid for 24 hours. Refresh tokens are valid for 7 days.

**Q: Can I book multiple slots at once?**  
A: Not currently. You need to create separate bookings for each slot.

**Q: What happens if a provider doesn't confirm my booking?**  
A: The booking stays in "Pending" status. The provider can also reject it, which frees the slot for others to book.

**Q: Can I cancel a booking after the provider starts work?**  
A: No. Cancellation is only allowed before the booking reaches "InProgress" status.

**Q: How is the platform commission calculated?**  
A: The platform takes 10% of the final payment amount. If a customer pays $100, the platform gets $10 and the provider receives $90.

**Q: When can I leave a review?**  
A: Reviews can only be submitted after the booking status becomes "Paid". Both customer and provider can review each other, but only once per booking.

**Q: What if two customers try to book the same slot?**  
A: The system uses optimistic concurrency control. The first request succeeds, and the second receives an error message saying the slot is already booked.

**Q: How often are time slots generated?**  
A: Automatically every night at 2:00 AM, 14 days ahead. Providers can also manually generate slots anytime.

**Q: Can a provider offer services in multiple categories?**  
A: Yes. A provider can offer multiple services across different categories with different base prices.

**Q: What happens to a slot when a booking is cancelled?**  
A: The slot becomes available again and can be booked by other customers.

**Q: Can I see a provider's reviews before booking?**  
A: Yes. Use `GET /api/Review/provider/{providerId}` to see all reviews and the average rating.

**Q: Is there a limit to how far ahead I can book?**  
A: You can only book slots that have been generated. By default, slots are generated 14 days ahead.

**Q: Can admins modify bookings?**  
A: Currently, no. Admin endpoints are limited to provider approval/rejection. Future versions may include admin booking management.

**Q: Are passwords encrypted?**  
A: Yes. Passwords are hashed using ASP.NET Core Identity's PasswordHasher (PBKDF2 with HMAC-SHA256). Plain text passwords are never stored.

**Q: Can I filter providers by location?**  
A: Not in the current version. Location-based filtering is planned for future releases.

**Q: What payment methods are supported?**  
A: Currently, the system records cash payments. Integration with payment gateways (Stripe, PayPal) is planned.

**Q: Can I update a booking after it's created?**  
A: No. You need to cancel the existing booking and create a new one with the desired changes.

**Q: How do I become an admin?**  
A: Admin accounts are created manually in the database or by existing admins. There's no public registration for admin role.

---

## Testing Guide

### Using Postman

**1. Import Collection**

Create a Postman collection with these variables:

- `baseUrl`: `http://localhost:5000/api`
- `accessToken`: (will be set after login)
- `refreshToken`: (will be set after login)

**2. Setup Pre-request Script for Auth**

```javascript
// Auto-add token to requests
pm.request.headers.add({
  key: "Authorization",
  value: "Bearer " + pm.environment.get("accessToken"),
});
```

**3. Setup Test Script for Login**

```javascript
// Save tokens after login
if (pm.response.code === 200) {
  const response = pm.response.json();
  pm.environment.set("accessToken", response.data.accessToken);
  pm.environment.set("refreshToken", response.data.refreshToken);
}
```

**4. Test Sequence**

1. Register Customer
2. Register Provider
3. Login as Admin → Approve Provider
4. Login as Provider → Set Availability → Generate Slots
5. Login as Customer → Search Providers → Get Slots → Create Booking
6. Login as Provider → Confirm Booking → Start → Complete
7. Login as Provider → Verify Payment
8. Login as Customer → Create Review

### Using Swagger UI

**Access:** `http://localhost:5000/swagger`

**Steps:**

1. Expand `Auth` section
2. Execute `POST /api/Auth/login`
3. Copy `accessToken` from response
4. Click "Authorize" button (top right)
5. Enter: `Bearer {paste_token_here}`
6. Click "Authorize"
7. Now all protected endpoints will include the token

### Automated Testing Script

```bash
#!/bin/bash
# Save as test-api.sh

BASE_URL="http://localhost:5000/api"

echo "1. Register Customer..."
CUSTOMER_RESPONSE=$(curl -s -X POST "$BASE_URL/Auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer",
    "email": "customer@test.com",
    "password": "Test123!",
    "phone": "+1234567890",
    "role": "Customer"
  }')

CUSTOMER_TOKEN=$(echo $CUSTOMER_RESPONSE | jq -r '.data.accessToken')
echo "Customer registered. Token: ${CUSTOMER_TOKEN:0:20}..."

echo "\n2. Register Provider..."
PROVIDER_RESPONSE=$(curl -s -X POST "$BASE_URL/Auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Provider",
    "email": "provider@test.com",
    "password": "Test123!",
    "phone": "+0987654321",
    "role": "Provider"
  }')

PROVIDER_TOKEN=$(echo $PROVIDER_RESPONSE | jq -r '.data.accessToken')
echo "Provider registered. Token: ${PROVIDER_TOKEN:0:20}..."

echo "\n3. Get Service Categories..."
CATEGORIES=$(curl -s -X GET "$BASE_URL/Service/categories")
echo $CATEGORIES | jq '.data[0]'

echo "\n4. Search Providers..."
SEARCH=$(curl -s -X GET "$BASE_URL/Providers/search?serviceId=1")
echo "Found providers:" $(echo $SEARCH | jq '.data.totalCount')

echo "\nTest completed!"
```

---

## Database Schema Diagram

```
┌─────────────────┐
│ ApplicationUser │
├─────────────────┤
│ Id (PK)         │──┐
│ Name            │  │
│ Email           │  │
│ PasswordHash    │  │
│ Role            │  │
└─────────────────┘  │
                     │
         ┌───────────┴──────────────┐
         │                          │
         ▼                          ▼
┌──────────────────┐      ┌─────────────────┐
│ ProviderProfile  │      │ Review          │
├──────────────────┤      ├─────────────────┤
│ Id (PK)          │──┐   │ ReviewerId (FK) │
│ UserId (FK)      │  │   │ RevieweeId (FK) │
│ Bio              │  │   │ BookingId (FK)  │
│ Experience       │  │   │ Rating          │
│ AvgRating        │  │   │ Comment         │
│ Status           │  │   └─────────────────┘
│ IsApproved       │  │
└──────────────────┘  │
                      │
         ┌────────────┴───────────┐
         │                        │
         ▼                        ▼
┌──────────────────┐    ┌──────────────────┐
│ ProviderService  │    │ TimeSlot         │
├──────────────────┤    ├──────────────────┤
│ Id (PK)          │    │ Id (PK)          │
│ ProviderId (FK)  │    │ ProviderId (FK)  │
│ ServiceId (FK)   │    │ Date             │
│ BasePrice        │    │ StartTime        │
│ PriceType        │    │ EndTime          │
└──────────────────┘    │ IsBooked         │
         │              │ RowVersion       │
         │              └──────────────────┘
         │                       │
         ▼                       │
┌──────────────────┐            │
│ Service          │            │
├──────────────────┤            │
│ Id (PK)          │            │
│ Name             │            │
│ Duration         │            │
│ CategoryId (FK)  │            │
└──────────────────┘            │
         │                      │
         ▼                      │
┌──────────────────┐            │
│ ServiceCategory  │            │
├──────────────────┤            │
│ Id (PK)          │            │
│ Name             │            │
│ Description      │            │
└──────────────────┘            │
                                │
         ┌──────────────────────┘
         │
         ▼
┌──────────────────┐
│ Booking          │
├──────────────────┤
│ Id (PK)          │
│ CustomerId (FK)  │
│ ProviderId (FK)  │
│ ServiceId (FK)   │
│ SlotId (FK)      │
│ Status           │
│ Notes            │
└──────────────────┘
         │
         ▼
┌──────────────────┐
│ Payment          │
├──────────────────┤
│ Id (PK)          │
│ BookingId (FK)   │
│ Amount           │
│ Commission       │
│ PaymentMethod    │
│ PaymentStatus    │
│ PaidAt           │
└──────────────────┘
```

---

## Deployment Guide

### Prerequisites for Production

1. **Environment Variables**

```bash
export ConnectionStrings__DefaultConnection="Server=prod-server;Database=HomeMaintenanceDB;..."
export JWT__Key="your-super-secret-key-min-32-characters"
export JWT__Issuer="HomeServicesPlatform"
export JWT__Audience="HomeServicesPlatformUsers"
```

2. **Update appsettings.Production.json**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "#{ConnectionString}#"
  },
  "JWT": {
    "Key": "#{JWTKey}#",
    "Issuer": "#{JWTIssuer}#",
    "Audience": "#{JWTAudience}#"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### Deployment Steps

**1. Build for Production**

```bash
dotnet publish -c Release -o ./publish
```

**2. Run Migrations**

```bash
dotnet ef database update --connection "YourConnectionString"
```

**3. Configure IIS / Nginx / Apache**

**IIS (Windows):**

- Install .NET Hosting Bundle
- Create Application Pool (.NET CLR Version: No Managed Code)
- Point to published folder
- Set environment to Production

**Nginx (Linux):**

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**4. Setup SSL Certificate**

```bash
# Using Let's Encrypt
sudo certbot --nginx -d api.yourdomain.com
```

**5. Configure Firewall**

```bash
# Allow HTTP/HTTPS
sudo ufw allow 'Nginx Full'
```

**6. Setup Background Service (Linux)**

```bash
sudo nano /etc/systemd/system/homeservices-api.service
```

```ini
[Unit]
Description=Home Services API

[Service]
WorkingDirectory=/var/www/homeservices
ExecStart=/usr/bin/dotnet /var/www/homeservices/HomeServicesPlatform.API.dll
Restart=always
RestartSec=10
SyslogIdentifier=homeservices-api
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable homeservices-api.service
sudo systemctl start homeservices-api.service
sudo systemctl status homeservices-api.service
```

---

## Monitoring & Logging

### Application Insights (Recommended)

**1. Install Package**

```bash
dotnet add package Microsoft.ApplicationInsights.AspNetCore
```

**2. Configure in Program.cs**

```csharp
builder.Services.AddApplicationInsightsTelemetry();
```

### Custom Logging

**Log Levels:**

- **Trace**: Very detailed, not for production
- **Debug**: Internal system events
- **Information**: General flow
- **Warning**: Abnormal events
- **Error**: Failed operations
- **Critical**: Application crashes

**Example:**

```csharp
_logger.LogInformation("Booking {BookingId} created by {CustomerId}", bookingId, customerId);
_logger.LogWarning("Slot {SlotId} booking attempt failed - already booked", slotId);
_logger.LogError(ex, "Payment processing failed for booking {BookingId}", bookingId);
```

---

## License & Legal

### API Usage Terms

**Allowed:**

- ✅ Integration with your applications
- ✅ Development and testing
- ✅ Commercial use with proper authentication

**Not Allowed:**

- ❌ Reverse engineering the API
- ❌ Excessive rate limiting abuse
- ❌ Unauthorized access attempts
- ❌ Data scraping without permission

### Data Privacy

- User passwords are hashed and never stored in plain text
- JWT tokens expire and must be refreshed
- Personal data (email, phone) is protected by authentication
- Booking details only accessible to involved parties

---

## Conclusion

This comprehensive API documentation covers:

✅ **Complete endpoint reference** - All 30+ endpoints documented  
✅ **Authentication & authorization** - JWT implementation details  
✅ **Code examples** - JavaScript, Python, cURL, React  
✅ **Error handling** - All error scenarios explained  
✅ **User journeys** - Complete workflows for customers and providers  
✅ **Data models** - Full entity specifications  
✅ **Best practices** - Security, performance, testing  
✅ **Deployment guide** - Production setup instructions  
✅ **FAQ & troubleshooting** - Common issues and solutions

### Quick Start Reminder

1. Clone repository
2. Update connection string
3. Run migrations: `dotnet ef database update`
4. Start API: `dotnet run`
5. Open Swagger: `http://localhost:5000/swagger`
6. Register → Login → Explore endpoints

### Need Help?

- **Documentation**: You're reading it! ✓
- **Swagger UI**: Interactive testing at `/swagger`
- **Source Code**: Check repository for implementation details
- **Issues**: Report bugs via GitHub issues

---

**Document Version:** 1.0  
**Last Updated:** July 9, 2026  
**API Version:** v1  
**Compatible .NET Version:** 6.0+

---

**End of Documentation**

Thank you for using the Home Maintenance Service Marketplace API! 🏠🔧
