[33mcommit 49c5dc6983b01f44655c9465c41729efc5a88cea[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmain[m[33m, [m[1;31morigin/feature/booking-history-malak[m[33m, [m[1;32mfeature/booking-history-malak[m[33m)[m
Merge: 1ded1d9 dd82195
Author: Malak Azmy <Malak.mohamed141azmy@gmail.com>
Date:   Thu Jun 25 01:07:25 2026 +0300

    Resolve merge conflict in Booking

[33mcommit 1ded1d9cbba501cf3a0b961bbe54f5b1388c8546[m
Author: Malak Azmy <Malak.mohamed141azmy@gmail.com>
Date:   Thu Jun 25 01:02:09 2026 +0300

    Booking history added need to be tested

[33mcommit dd82195a19fdf879b3de580f7a03f3e36c05ac07[m[33m ([m[1;31morigin/main[m[33m, [m[1;31morigin/HEAD[m[33m)[m
Merge: 6424bb0 cd959b6
Author: Fathy Tarek <ffathy2244@gmail.com>
Date:   Tue Jun 23 17:00:05 2026 +0300

    Merge pull request #6 from lunarae-mai/feature/advanced-user-management
    
    Feature/advanced user management

[33mcommit cd959b648e0916b76e1e07ec7d64c1dc7ac0192a[m[33m ([m[1;31morigin/feature/advanced-user-management[m[33m)[m
Merge: bb5cb3d 6424bb0
Author: Fathy Tarek <ffathy2244@gmail.com>
Date:   Tue Jun 23 16:54:33 2026 +0300

    Merge origin/main into feature/advanced-user-management

[33mcommit 6424bb02472e620f0a793288049c8c31001c9d79[m
Merge: 8ef566d 3886af6
Author: Mariam Khaled <mariam22khalid22@gmail.com>
Date:   Tue Jun 23 07:50:01 2026 +0300

    Merge pull request #5 from lunarae-mai/feature/payment-task
    
    feat: implement payment service and complete sprint 2 task

[33mcommit 3886af698c5f1189c0ed6eb3601553c13e0cd818[m[33m ([m[1;31morigin/feature/payment-task[m[33m)[m
Author: Mariam Khaled <mariam22khalid22@gmail.com>
Date:   Tue Jun 23 07:48:53 2026 +0300

    feat: implement payment service and complete sprint 2 task

[33mcommit 8ef566dc2efecdb3364435a250ad8985a6a43d43[m
Author: nada <nada.baki54@gmail.com>
Date:   Tue Jun 23 03:36:13 2026 +0300

    fixed

[33mcommit bb5cb3d413a86189f898da72a6264e1a05653940[m
Author: Fathy Tarek <ffathy2244@gmail.com>
Date:   Mon Jun 22 20:53:54 2026 +0300

    Feat: Add admin endpoints for user listing and role filtering

[33mcommit 538a4f8ed2786df668ab2406e78e76d367d5537b[m
Author: Fathy Tarek <ffathy2244@gmail.com>
Date:   Mon Jun 22 20:00:46 2026 +0300

    Enhance: Prevent duplicate email updates

[33mcommit 83fbed993702cc227f783115e38516cda0fe65a9[m
Author: Fathy Tarek <ffathy2244@gmail.com>
Date:   Mon Jun 22 19:48:06 2026 +0300

    Enhance: Add validation for profile update requests

[33mcommit ea28352c7ce2b7fd8648cfb89fd3684c303a7a0a[m
Author: Fathy Tarek <ffathy2244@gmail.com>
Date:   Mon Jun 22 19:19:43 2026 +0300

    Refactor: Replace UserManager with PasswordHasher in change password flow

[33mcommit 97fd02b1121db54c55152dae988e60d31aa3f0d4[m
Author: Fathy Tarek <ffathy2244@gmail.com>
Date:   Sun Jun 21 04:27:01 2026 +0300

    Refactor: Align change password with custom authentication

[33mcommit be79e3c865e8c23b3125a7785c08ef22b6df3e6d[m
Author: Fathy Tarek <ffathy2244@gmail.com>
Date:   Sun Jun 21 03:18:01 2026 +0300

    Feat: Implement change password functionality

[33mcommit e609e5d1b5f28e79da4998e759484c43b6581561[m
Author: Fathy Tarek <ffathy2244@gmail.com>
Date:   Sun Jun 21 02:20:44 2026 +0300

    Feat: Configure global JWT extraction (COMPLETED)

[33mcommit a58973fb2d8fc30236250307e5c47e46074bb013[m
Author: Fathy Tarek <ffathy2244@gmail.com>
Date:   Thu Jun 18 04:37:10 2026 +0300

    Feat: Configure global JWT extraction

[33mcommit 4e1d5310552de3252d7ff62250db28657d12b34b[m[33m ([m[1;31morigin/searching_nada[m[33m)[m
Author: nada <nada.baki54@gmail.com>
Date:   Wed Jun 3 02:23:50 2026 +0300

    searching and filtering

[33mcommit f8b40f852f0703a09e60337b1f4a03b59125e799[m
Author: nada <nada.baki54@gmail.com>
Date:   Wed Jun 10 04:40:09 2026 +0300

    Revert "searching and filtering"
    
    This reverts commit c7f21dda60de8841c99276f4a342dbb6096d23cf.

[33mcommit c7f21dda60de8841c99276f4a342dbb6096d23cf[m
Author: nada <nada.baki54@gmail.com>
Date:   Wed Jun 3 02:23:50 2026 +0300

    searching and filtering

[33mcommit 5cfdd66121a7c422fa3206cb859955392ec43f56[m
Merge: 3803777 061e78b
Author: Adham Hossam Shaheen <adhamshaheen282@gmail.com>
Date:   Sun May 24 22:06:23 2026 +0300

    . Implement BookingsController : Handle "Create Booking" and prevent double- booking
    . Manage Booking Status transitions: Pending - Confirmed -> In Progress -> Completed.
    . Implement the Cancellation window logic (Only allowed before "In Progress").

[33mcommit 0af2d14f621bfb98809411748af8e3116516ae2c[m
Merge: 762bb47 4ef8914
Author: Fathy Tarek <ffathy2244@gmail.com>
Date:   Thu May 28 17:38:47 2026 +0300

    Merge pull request #4 from lunarae-mai/feature/provider-management-fathy
    
    Update ProvidersController and Program configuration

[33mcommit 4ef8914509af8404b0d893f8b9dfd2c17a4fa5b4[m
Merge: c9dde40 762bb47
Author: Fathy Tarek <ffathy2244@gmail.com>
Date:   Thu May 28 17:38:25 2026 +0300

    Resolve merge conflict in Program.cs

[33mcommit c9dde403d8039267a987d2127ef25ef710184d10[m
Author: Fathy Tarek <ffathy2244@gmail.com>
Date:   Thu May 28 17:21:33 2026 +0300

    Update ProvidersController and Program configuration

[33mcommit 762bb4792008f241f98bfbbd2b5937a448f59964[m
Merge: 3803777 061e78b
Author: Adham Hossam Shaheen <adhamshaheen282@gmail.com>
Date:   Sun May 24 22:06:23 2026 +0300

    Merge JWT authentication and user profile management implementation
    
    - Implemented JWT-based authentication (register/login)
    - Added password hashing using PasswordHasher
    - Implemented the authorization endpoints (Auth/register & Auth/login)
    - Implemented user profile view and update using claims + their endpoints
    - Integrated Swagger with JWT authentication support

[33mcommit 061e78b6b33f21b1c8666b7f368e716aae5f23e0[m[33m ([m[1;31morigin/authentication_authorization_userProfiles[m[33m)[m
Author: Adham Shaheen <adhamshaheen282@gmail.com>
Date:   Sun May 24 21:52:34 2026 +0300

    Created the UserController and implemented two functions in it to view profile and edit/update profile

[33mcommit 0c86f346c91d6940e9a12c4a78f259c8f2eb1e27[m
Author: Adham Shaheen <adhamshaheen282@gmail.com>
Date:   Sun May 24 21:43:39 2026 +0300

    Created and implemented the ProfileManagementService along with its interface. This service handles the view/edit profile requirement

[33mcommit 9ebb4db5dc9a79bed447c4ccf41f941180a48b3f[m
Author: Adham Shaheen <adhamshaheen282@gmail.com>
Date:   Sun May 24 21:28:23 2026 +0300

    Created and implemented UserProfileDto and UpdateProfileDto

[33mcommit 79c02a88b2397e5cfd379bb9c2d3d1b70e61d79e[m
Author: Adham Shaheen <adhamshaheen282@gmail.com>
Date:   Sat May 23 22:30:02 2026 +0300

    Enabled Swagger and configure API testing environment for controllers.

[33mcommit a1bd43b60d018a29650cf197beab7cfb7ccf3cbf[m
Author: Adham Shaheen <adhamshaheen282@gmail.com>
Date:   Sat May 23 21:04:45 2026 +0300

    Created and implemented the AuthController.cs in the controllers folder in the HomeServicesPlatform.API project. It handles the routing to the AuthService.

[33mcommit ee91d91edf7a99e1849e083554a7eb9a24ab77c3[m
Author: Adham Shaheen <adhamshaheen282@gmail.com>
Date:   Sat May 23 21:01:22 2026 +0300

    Created and implemented AuthService and its interface IAuthService handling the register, login along with the JWT token generation

[33mcommit e6dcebf7ae9de977b39cf3dbe79df61dcdbea7c1[m
Author: Adham Shaheen <adhamshaheen282@gmail.com>
Date:   Sat May 23 19:30:54 2026 +0300

    Created LoginDto, RegisterDto,and AuthResponseDto

[33mcommit b0996953ba7a954fbdff454746fde75794aa9122[m
Author: Adham Shaheen <adhamshaheen282@gmail.com>
Date:   Sat May 23 19:26:28 2026 +0300

    Configured the JWT authorization in Program.cs, added JWT JSON object to appsettings.json and added the authentication & authorization middleware.

[33mcommit 74e968262a8805252e43bc1fb54f98b00648e25e[m
Author: Adham Shaheen <adhamshaheen282@gmail.com>
Date:   Sat May 23 19:04:12 2026 +0300

    Added the attribute called PasswordHash to the ApplicationUser model and updated the database

[33mcommit 3803777ebe40ea1172de32df5160556bd475386f[m
Merge: 5f416bf 1f91b31
Author: Mariam Khaled <mariam22khalid22@gmail.com>
Date:   Thu May 21 22:51:30 2026 +0300

    Merge pull request #2 from lunarae-mai/feature/database-infrastructure
    
    feat: complete database foundation and repositories

[33mcommit 1f91b31f00bc1939ab4bfcea0937d625d0117a82[m[33m ([m[1;31morigin/feature/database-infrastructure[m[33m)[m
Author: Mariam Khaled <mariam22khalid22@gmail.com>
Date:   Thu May 21 22:49:48 2026 +0300

    feat: complete database foundation and repositories

[33mcommit 5f416bf745015d8e0da62e95a317afc53180e44f[m
Merge: f1159c9 3c16603
Author: Fathy Tarek <ffathy2244@gmail.com>
Date:   Fri May 15 04:44:42 2026 +0300

    Merge pull request #1 from lunarae-mai/feature/provider-management-fathy
    
    Feature/provider management

[33mcommit 3c16603f10ed5151a5e78d5efad15791066824db[m
Author: Fathy Tarek <ffathy2244@gmail.com>
Date:   Fri May 15 04:26:55 2026 +0300

    feat: finalize ProvidersController and register DI in program.cs

[33mcommit 2b6fb3554c7ed713a2b1830b6d1bd9ac0ba82ed7[m
Author: Fathy Tarek <ffathy2244@gmail.com>
Date:   Thu May 14 21:07:15 2026 +0300

    feat(application): complete ProviderManagementService logic(implement GetProviderProfile)

[33mcommit 06333153cd4342496c46e2863af17ba8e323165d[m
Author: Fathy Tarek <ffathy2244@gmail.com>
Date:   Thu May 14 06:50:19 2026 +0300

    feat(provider-mgmt): implement core logic for provider registration and status management

[33mcommit 3ebb6ee985f063cd4d3064bf8bbbaacdd0bafb1b[m
Author: Fathy Tarek <ffathy2244@gmail.com>
Date:   Tue May 5 03:50:55 2026 +0300

    feat: add provider domain entities and fix project structure

[33mcommit f1159c9fc9480185331625ebf62bdd18e70376d7[m
Merge: 8b9eaf5 968c540
Author: Fathy Tarek <ffathy2244@gmail.com>
Date:   Thu Apr 23 19:25:09 2026 +0200

    Merge main with local project

[33mcommit 8b9eaf54cc6c332616d69eab7d899ef39be8d40f[m
Author: Fathy Tarek <ffathy2244@gmail.com>
Date:   Thu Apr 23 19:11:31 2026 +0200

    Add project structure and gitignore

[33mcommit 968c540ea6842b41de23adfa981271e078c89744[m
Author: Mariam Khaled <mariam22khalid22@gmail.com>
Date:   Fri Mar 13 17:29:40 2026 +0200

    Update README.md

[33mcommit e49576339d24a7ce7d6b628f69f25f0530798fdd[m
Author: Mariam Khaled <mariam22khalid22@gmail.com>
Date:   Fri Mar 13 17:28:00 2026 +0200

    Update README.md

[33mcommit 73b2bf311b4911b7f8813abedb2fc009a8a09c97[m
Author: Mariam Khaled <mariam22khalid22@gmail.com>
Date:   Fri Feb 20 21:22:42 2026 +0200

    Create README.md
