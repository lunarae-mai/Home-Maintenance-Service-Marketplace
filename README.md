# Home Maintenance Service Marketplace 

A modern, full-stack web-based platform that connects customers with professional home maintenance service providers. The system allows customers to browse available services (such as electrical work, plumbing, painting, and cleaning), set notes, and book appointments based on live provider time slots. Providers can configure services, manage availability, and verify cash payments, while administrators manage category approvals, monitor bookings, and govern the system.

---

## Team Members
1. **Mariam Khaled Ramadan**
2. **Fathy Tarek Fathy**
3. **Adham Hossam Amin**
4. **Mai Ahmed Maged**
5. **Nada Mohamed Mohamed**
6. **Malak Mohamed Mohamed**

**Instructor:** Ashraf Sadek

---

##  Deployment & Execution

###  System Requirements
* **Software Dependencies:**
  * **Backend API:** .NET 10.0 SDK
  * **Frontend SPA:** Node.js (v18.0 or higher) & npm (v9.0 or higher)
  * **Database:** MS SQL Server (LocalDB `.\MSSQLSERVER02` or SQL Express)

---

###  Configuration Instructions

#### 1. Backend Configuration
Create or open the `appsettings.json` file inside the `HomeMaintenanceServiceMarketplace` folder and configure the database connection string and JWT signing parameters:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.\\MSSQLSERVER02;Database=HomeMaintenanceDB;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "JWT": {
    "Key": "SuperSecretSecuritySigningKeyForHomeMaintenanceMarketplace2026!",
    "Issuer": "HomeServicesPlatform",
    "Audience": "HomeServicesPlatformUsers"
  }
}
```

#### 2. Frontend Configuration
The frontend uses Axios to make network requests. Ensure the API base URL points to the running backend local instance inside `src/lib/api.ts`:
```typescript
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
});
```

---

###  Execution Guide (Running Locally)

To run the application locally on your system:

#### 1. Start the Backend API Server
Navigate to the API folder and launch the web host:
```bash
cd HomeMaintenanceServiceMarketplace
dotnet run
```
* The API will start listening at **`http://localhost:5000`**.

#### 2. Start the Frontend Dev Server
In a separate terminal shell, navigate to the root directory and start the Vite dev server:
```bash
npm run dev
```
* The React application will start listening at **`http://localhost:5173`** (or the port output in your terminal). Open this URL in your web browser.

---

###  API Documentation
The API exposes a comprehensive set of RESTful endpoints.
* **Swagger Interactive Docs:** When running the backend API locally, navigate to **`http://localhost:5000/swagger`** to view and test all endpoints using the Swagger UI.
* **Comprehensive Endpoint Specification:** A complete markdown-based guide detailing payload models, responses, and authorization flows can be found in [API-DOCUMENTATION.md](file:///C:/Users/Nada%20Abdulbaky/OneDrive/Documents/GitHub/Home-Maintenance-Service-Marketplace/API-DOCUMENTATION.md).

---

###  Executable Files & Deployment
* **Executable Build (Release Packaging):**
  To package the backend application for staging/production deployment:
  ```bash
  dotnet publish -c Release -o ./publish
  ```
* **Project Deliverables & Assets:**
  You can find the project files, architectural diagrams, wireframes, and presentation documents on Google Drive:
   [Home Maintenance Marketplace Google Drive Folder](https://drive.google.com/drive/folders/1dwiWFlEsDpTtyKvDtxRDrfIYUGSUuASl?usp=sharing)

---

