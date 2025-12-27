# VendorScout - Street Food Vendor Locator

## 1. Project Overview

### Problem Statement
Finding street food vendors in India can be challenging due to their mobile nature and lack of centralized information. Customers often rely on word-of-mouth or physical exploration to discover vendors, leading to inefficiencies and missed opportunities for both customers and vendors.

### Solution Relevance (Indian Context)
This project addresses a significant gap in India's street food ecosystem:
- Street food contributes significantly to India's food economy (~$10 billion annually)
- Vendors lack digital presence and marketing tools
- Customers struggle to locate quality vendors in their vicinity
- No real-time tracking system exists for mobile food vendors

### Target Users
1. **Customers**: People seeking authentic street food experiences
2. **Vendors**: Street food sellers wanting to expand their reach
3. **Future**: Food enthusiasts, tourists, and local guides

### Use Cases
- Locate nearby street food vendors
- View vendor menus and pricing
- Track vendor locations in real-time
- Leave reviews and ratings
- Follow favorite vendors for updates
- Participate in community discussions

### Scope and Limitations
This is a prototype demonstrating core functionality:
- Basic authentication system
- Vendor location tracking
- Menu management
- Customer reviews
- Community discussions
- Broadcast messaging

Current limitations:
- Single-server deployment
- No administrative dashboard
- Limited vendor analytics
- No payment integration

---

## 2. System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   Database      │
│   (React)       │◄──►│   (Node/Express) │◄──►│   (MongoDB)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Browser       │    │   RESTful API    │    │   Collections   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Component Responsibilities

#### Frontend (React)
- User interface and experience
- State management with useState, useEffect, useContext
- API communication via Axios with interceptors
- Real-time location updates with Geolocation API
- Interactive maps with Leaflet.js
- Form validation and error handling

#### Backend (Node.js/Express)
- RESTful API endpoints with proper HTTP methods
- Business logic implementation in controller functions
- Authentication and authorization with JWT middleware
- Data validation with Mongoose schemas
- Error handling with centralized middleware
- Geospatial queries for location-based features

#### Database (MongoDB)
- Data persistence with Mongoose ODM
- Schema validation with built-in and custom validators
- Geospatial indexing with 2dsphere for location queries
- Relationship modeling with references and population
- Performance optimization with indexes

### Why MERN Stack?
1. **JavaScript End-to-End**: Consistent language across layers reduces context switching
2. **JSON Compatibility**: Seamless data flow between frontend, backend, and database
3. **Rich Ecosystem**: Extensive libraries and tools (React, Express, Mongoose)
4. **Scalability**: Horizontal scaling capabilities with Node.js clustering
5. **Developer Productivity**: Rapid prototyping with hot reloading (Vite, Nodemon)

### Alternative Architectures Considered
| Architecture | Pros | Cons |
|--------------|------|------|
| MEAN Stack | Angular's two-way data binding | Steeper learning curve |
| Django/PostgreSQL | Built-in admin panel | Less flexible than Node |
| Firebase | Real-time capabilities | Vendor lock-in |

---

## 3. Data Flow

### Core Data Flow Process
1. **Frontend UI Event** → User action triggers API call
2. **Backend API** → Validates request and processes business logic
3. **Database** → Persists or retrieves data
4. **Backend API** → Formats response
5. **Frontend UI** → Updates state and renders changes

### Example Flows

#### User Loads Map
1. Customer navigates to `/customer/map`
2. Frontend requests all vendors via `GET /api/vendors`
3. Backend queries Vendor collection with pincode filter
4. Database returns vendor documents with location data
5. Backend formats response with vendor details
6. Frontend renders map markers for each vendor

#### Vendor Updates Location
1. Vendor clicks "Start Live Tracking" on `/vendor/location`
2. Frontend requests geolocation from browser using Geolocation API
3. Browser provides coordinates to frontend with accuracy metadata
4. Frontend sends `PUT /api/vendors/location` every 10 seconds
5. Backend validates vendor role and updates Vendor document
6. Database persists new location with geospatial indexing

#### Customer Fetches Nearby Vendors
1. Customer enters pincode in dashboard
2. Frontend sends `GET /api/vendors?pincode=XXXXXX`
3. Backend filters Vendor collection by pincode
4. Database returns matching vendor documents
5. Backend calculates average menu prices
6. Frontend displays vendor cards with ratings and prices

### Page Load vs User Actions
- **Page Load**: Authentication check, initial data fetch
- **User Actions**: Form submissions, real-time updates, navigation

---

## 4. Frontend Explanation (React)

### Folder Structure
```
src/
├── components/      # Reusable UI components
├── contexts/        # React context providers
├── pages/           # Page-level components
├── services/        # API service layer
├── styles/          # Global styles
└── utils/           # Utility functions
```

### Key Components
1. **Auth Components**: LoginForm, RegisterForm, ProtectedRoute
2. **Navigation**: Navbar, CustomerFooter
3. **Maps**: VendorMap, VendorLocationMap
4. **Dashboards**: CustomerDashboard, VendorDashboard
5. **Vendor Pages**: VendorProfile, VendorMenu, VendorLocation
6. **Social Features**: VendorComments, CustomerDiscussion

### State Management Approach
- **useState**: Local component state (forms, UI toggles)
- **useEffect**: Side effects (data fetching, subscriptions)
- **useContext**: Global state (authentication, user data)
- **Custom Hooks**: Reusable logic (API calls, form handling)

### Routing Logic
Using React Router v6:
- Public routes: Home, Login, Register
- Protected routes: Dashboards, profile pages
- Role-based access control with ProtectedRoute wrapper

### API Communication
- Axios for HTTP requests with request/response interceptors
- Centralized API service layer with organized endpoints
- Automatic JWT token inclusion in Authorization header
- Token expiration handling with automatic redirect to login

### Alternatives Not Used
1. **Redux**: Overkill for current scope, useContext sufficient
2. **Server-Side Rendering**: Unnecessary complexity for prototype
3. **GraphQL**: REST API sufficient for current requirements

---

## 5. Backend Explanation (Node.js + Express)

### Folder Structure
```
backend/
├── controllers/     # Business logic handlers
├── middleware/      # Request processing functions
├── models/          # Database schemas
├── routes/          # API endpoint definitions
└── server.js        # Application entry point
```

### Route Definitions
- **Auth Routes**: `/api/auth/*` - Registration, login, logout
- **Vendor Routes**: `/api/vendors/*` - Profile, menu, location, ratings
- **Comment Routes**: `/api/comments/*` - Reviews, discussions
- **User Routes**: `/api/users/*` - Profile management

### Controllers
- **authController**: User registration/login workflows with password hashing
- **vendorController**: Vendor management (CRUD operations) with geospatial logic
- **commentController**: Discussion and review handling with like functionality

### Middleware Usage
1. **Authentication**: JWT token verification with role validation
2. **Security**: Helmet headers, CORS configuration
3. **Logging**: Morgan for request logging
4. **Body Parsing**: JSON payload parsing

### REST API Design Principles
- Resource-based endpoints with consistent naming
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Consistent response formats with proper status codes
- Error handling with descriptive messages

### Alternatives Not Used
1. **NestJS**: Too opinionated for prototype
2. **GraphQL**: REST simpler for current scope
3. **Microservices**: Monolithic architecture easier to deploy

---

## 6. API Documentation

### Authentication APIs
| Endpoint | Method | Request Body | Response | Purpose |
|----------|--------|-------------|----------|---------|
| `/api/auth/register` | POST | `{username, email, password, role, phoneNumber, pincode}` | User object with token | Create new user account |
| `/api/auth/login` | POST | `{email/phoneNumber, password}` | User object with token | Authenticate user |
| `/api/auth/logout` | POST | None | Success message | End user session |

### Vendor APIs
| Endpoint | Method | Request Body | Response | Purpose |
|----------|--------|-------------|----------|---------|
| `/api/vendors/profile` | GET | None | Vendor profile | Get current vendor profile |
| `/api/vendors/profile` | PUT | Vendor data | Updated profile | Update vendor information |
| `/api/vendors/location` | PUT | `{latitude, longitude, accuracy}` | Updated vendor | Update vendor location |
| `/api/vendors/menu` | GET | None | Menu items | Get vendor menu |
| `/api/vendors/menu` | POST | Menu item data | Created menu item | Add menu item |
| `/api/vendors/:vendorId/menu` | GET | None | Menu items | Get specific vendor menu |
| `/api/vendors/follow/:vendorId` | POST | None | Success message | Follow vendor |
| `/api/vendors/unfollow/:vendorId` | POST | None | Success message | Unfollow vendor |

### Comment APIs
| Endpoint | Method | Request Body | Response | Purpose |
|----------|--------|-------------|----------|---------|
| `/api/comments` | GET | Query params | Comments array | Get community discussions |
| `/api/comments` | POST | `{content, pincode, vendorProfile}` | Created comment | Post new comment |
| `/api/comments/:commentId/like` | POST | None | Updated comment | Like/unlike comment |
| `/api/comments/vendor/:vendorId` | GET | None | Comments array | Get vendor-specific comments |

### User APIs
| Endpoint | Method | Request Body | Response | Purpose |
|----------|--------|-------------|----------|---------|
| `/api/users/pincode` | PUT | `{pincode}` | Success message | Update user pincode |
| `/api/users/profile` | GET | None | User profile | Get user profile |

---

## 7. Database Design (MongoDB)

### Collections and Schemas

#### Users
```javascript
{
  username: String,
  email: String,
  password: String,
  role: Enum['customer', 'vendor'],
  phoneNumber: String,
  pincode: String,
  vendorProfile: ObjectId -> Vendor
}
```

#### Vendors
```javascript
{
  user: ObjectId -> User,
  businessName: String,
  cuisineType: String,
  description: String,
  phoneNumber: String,
  pincode: String,
  location: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  images: [Image],
  ratings: { average: Number, count: Number },
  status: Enum['open', 'closed', 'relocating', 'sold_out'],
  followers: [ObjectId -> User]
}
```

#### Menu Items
```javascript
{
  vendor: ObjectId -> Vendor,
  name: String,
  description: String,
  price: Number,
  category: String,
  isAvailable: Boolean,
  imageUrl: String
}
```

#### Comments
```javascript
{
  content: String,
  author: ObjectId -> User,
  authorName: String,
  pincode: String,
  likes: Number,
  likedBy: [ObjectId -> User],
  vendor: String,
  vendorProfile: ObjectId -> Vendor
}
```

#### Ratings
```javascript
{
  customer: ObjectId -> User,
  vendor: ObjectId -> Vendor,
  rating: Number (1-5),
  review: String
}
```

#### Follows
```javascript
{
  customer: ObjectId -> User,
  vendor: ObjectId -> Vendor
}
```

#### Broadcast Messages
```javascript
{
  vendor: ObjectId -> Vendor,
  content: String,
  sentAt: Date,
  recipients: Number
}
```

#### Pincode Locations
```javascript
{
  pincode: String,
  officename: String,
  location: {
    type: 'Point',
    coordinates: [longitude, latitude]
  }
}
```

### Key Fields Purpose
- **pincode**: Geographic segmentation for Indian context
- **location**: Geospatial indexing for proximity queries
- **ratings**: Vendor reputation system
- **followers**: Vendor popularity metrics
- **likedBy**: Prevent duplicate likes

### Relationships
- User 1:1 Vendor (via vendorProfile)
- Vendor 1:N Menu Items
- Vendor 1:N Broadcast Messages
- Vendor N:M Users (Follows)
- Vendor N:M Users (Ratings)
- Vendor N:M Users (Comments)

### Why MongoDB?
1. **Flexible Schema**: Easy to evolve data structures
2. **Geospatial Queries**: Native support for location-based queries
3. **Horizontal Scaling**: Sharding capabilities
4. **Document Model**: Natural fit for JSON data

### Alternatives Trade-offs
| Database | Pros | Cons |
|----------|------|------|
| PostgreSQL | ACID compliance, mature ecosystem | Complex geospatial setup |
| MySQL | Wide adoption, good tooling | Limited geospatial features |
| Firebase | Real-time sync | Vendor lock-in |

---

## 8. Authentication & Authorization

### Current Implementation
- JWT-based stateless authentication with 30-day expiration
- Role-based access control (customer/vendor)
- Separate login flows for user types
- Password hashing with bcrypt (10 salt rounds)

### JWT Flow
1. User submits credentials
2. Backend validates against database
3. JWT token generated with user ID and role
4. Token sent to client for storage in localStorage
5. Subsequent requests include token in Authorization header
6. Middleware verifies token and attaches user data to request

### Password Handling
- bcryptjs for password hashing with configurable salt rounds
- Salt rounds: 10 for balance between security and performance
- Plain text passwords never stored in database

### Role Separation
- **Customer**: Browse vendors, post reviews, follow vendors
- **Vendor**: Manage profile, menu, location, broadcast messages

### Security Limitations
1. **No Refresh Tokens**: Long-lived JWTs pose security risk
2. **Basic RBAC**: No granular permissions
3. **No Rate Limiting**: Vulnerable to brute force attacks
4. **No MFA**: Single-factor authentication only

### Improvement Suggestions
1. Implement refresh token rotation
2. Add rate limiting middleware
3. Introduce multi-factor authentication
4. Add input sanitization and validation

---

## 9. Map & Location Functionality

### Map Service
- OpenStreetMap with Leaflet.js
- Free and open-source alternative to Google Maps
- Good performance in Indian urban areas

### Coordinate Handling
- Latitude/longitude stored as GeoJSON Point
- Coordinates updated every 10 seconds during live tracking
- Accuracy metadata preserved for quality assessment

### Database Storage
- Geospatial indexing with 2dsphere
- Pincode-based geographic segmentation
- Automatic pincode detection from coordinates

### Marker Rendering
- Custom red dot markers for vendor locations
- Popup with business name, phone, and status
- Clustered markers for dense areas (future enhancement)

### Proximity Determination
- Filter vendors by pincode initially
- Calculate distances using Haversine formula (future enhancement)
- Sort by proximity in UI

### Optimizations
1. **Geospatial Indexing**: Efficient location queries
2. **Coordinate Caching**: Reduce database hits
3. **Batch Updates**: Minimize API calls
4. **Lazy Loading**: Load map data on demand

---

## 10. Important Logic & Algorithms

### Non-Trivial Logic

#### Pincode Detection
```javascript
// Backend logic to find pincode from coordinates
const findPincodeByCoordinates = async (latitude, longitude) => {
  const nearestPincodeRecord = await PincodeLocation.findOne({
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [longitude, latitude] },
        $maxDistance: 5000 // 5km radius
      }
    }
  });
  return nearestPincodeRecord ? 
    { pincode: nearestPincodeRecord.pincode, officename: nearestPincodeRecord.officename } : 
    null;
};
```

#### Rating Calculation
```javascript
// Recalculate vendor's average rating
const ratings = await Rating.find({ vendor: vendorId });
const totalRatings = ratings.length;
const sumRatings = ratings.reduce((sum, r) => sum + r.rating, 0);
const averageRating = totalRatings > 0 ? (sumRatings / totalRatings) : 0;

await Vendor.findByIdAndUpdate(vendorId, {
  'ratings.average': parseFloat(averageRating.toFixed(1)),
  'ratings.count': totalRatings
});
```

#### Menu Price Aggregation
```javascript
// Calculate average menu prices for vendors
const menuItems = await MenuItem.find({ vendor: { $in: vendorIds } });
const menuItemsByVendor = {};
menuItems.forEach(item => {
  if (!menuItemsByVendor[item.vendor]) {
    menuItemsByVendor[item.vendor] = [];
  }
  menuItemsByVendor[item.vendor].push(item);
});

const averagePricesByVendor = {};
Object.keys(menuItemsByVendor).forEach(vendorId => {
  const items = menuItemsByVendor[vendorId];
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  averagePricesByVendor[vendorId] = items.length > 0 ? totalPrice / items.length : 0;
});
```

### Algorithmic Complexity
This project focuses on system integration rather than complex algorithms:
- Sorting: O(n log n) for vendor lists
- Filtering: O(n) for cuisine/status filters
- Database Queries: Indexed lookups where possible

### Distance Calculations
Currently uses pincode-based filtering. Future enhancement would implement:
- Haversine formula for great-circle distance
- MongoDB's `$near` operator for geospatial queries

---

## 11. Technologies, Languages & Libraries

### Programming Languages
- **JavaScript (ES6+)**: Both frontend and backend
- **JSX**: React component syntax
- **JSON**: Data interchange format

### Major Frameworks/Libraries

#### Frontend
| Library | Version | Purpose |
|---------|---------|---------|
| React | 18.x | UI library |
| React Router | 6.x | Client-side routing |
| Axios | 1.x | HTTP client |
| Leaflet | 1.9.x | Interactive maps |
| Tailwind CSS | 3.x | Utility-first CSS framework |

#### Backend
| Library | Version | Purpose |
|---------|---------|---------|
| Express | 4.x | Web framework |
| Mongoose | 7.x | MongoDB ODM |
| JWT | 9.x | Token-based authentication |
| Bcryptjs | 2.x | Password hashing |

#### Database
| Technology | Version | Purpose |
|------------|---------|---------|
| MongoDB | 6.x | Document database |
| Mongoose | 7.x | MongoDB ODM |

### External Services
- **OpenStreetMap**: Map tiles and geocoding
- **Leaflet**: Map rendering library

### Development Tools
- **Vite**: Frontend build tool
- **Nodemon**: Backend auto-restart
- **ESLint**: Code linting
- **PostCSS**: CSS processing

---

## 12. Error Handling & Validation

### Frontend Error Handling
- Try/catch blocks for async operations
- User-friendly error messages with contextual information
- Form validation before submission with real-time feedback
- Graceful degradation for failed API calls with retry mechanisms

### Backend Error Handling
- Centralized error middleware for consistent responses
- HTTP status codes (400, 401, 403, 404, 500) with descriptive messages
- Detailed error logging for debugging
- Consistent JSON error responses for frontend consumption

### Validation Strategies
- **Frontend**: Form validation with HTML5 attributes and custom validation
- **Backend**: Mongoose schema validation with custom validators
- **Business Logic**: Custom validation functions for complex rules

### Common Failure Scenarios
1. **Network Issues**: Timeout handling and retry mechanisms
2. **Authentication Failures**: Token expiration and renewal
3. **Database Errors**: Connection failures and query timeouts
4. **Validation Errors**: Malformed input and missing fields
5. **Geolocation Failures**: Permission denials and unavailable services

---

## 13. Scalability, Performance & Future Improvements

### Current Bottlenecks
1. **Single Server**: No load balancing
2. **Database Queries**: Some N+1 query patterns
3. **Real-time Updates**: Polling instead of WebSocket
4. **Image Handling**: No CDN integration

### Multi-User Behavior
- MongoDB connection pooling handles concurrent requests
- Stateless JWT authentication scales horizontally
- Geospatial indexes optimize location queries

### Future Enhancements

#### Real-Time Features
- WebSocket integration for live updates
- Push notifications for vendor broadcasts
- Real-time chat between customers and vendors

#### Mobile Application
- React Native for cross-platform mobile app
- Native geolocation and camera APIs
- Offline capabilities with local storage

#### Admin Dashboard
- Vendor analytics and insights
- Content moderation tools
- System health monitoring

#### Deployment Improvements
- Docker containerization
- Kubernetes orchestration
- CI/CD pipeline automation
- Monitoring and logging infrastructure

---

## 14. What Is New or Unique About This Project

### Differentiation from CRUD Apps
1. **Geospatial Focus**: Location-based services not typical in basic CRUD apps
2. **Real-Time Elements**: Live location tracking distinguishes it from static data apps
3. **Social Features**: Community discussions and vendor following create engagement
4. **Indian Context**: Pincode-based segmentation tailored for Indian geography

### Relevance in India
1. **Street Food Culture**: Addresses a significant part of Indian food ecosystem
2. **Digital Divide**: Helps traditional vendors establish digital presence
3. **Employment Impact**: Potential to increase income for street vendors
4. **Urban Planning**: Data could inform city planning decisions

### Academic Learning Outcomes
1. **Full-Stack Development**: Integration of frontend, backend, and database
2. **Geospatial Concepts**: Working with location data and mapping technologies
3. **Authentication Systems**: JWT implementation and role-based access control
4. **Database Design**: Schema modeling with relationships and constraints
5. **API Design**: RESTful principles and error handling strategies

---

## 15. How to Defend This Project in a Viva

### Common Professor Questions & Answers

#### Q: Why use pincode instead of GPS coordinates for vendor discovery?
**A**: Pincode provides a culturally relevant geographic abstraction familiar to Indians. While GPS offers precision, pincode simplifies the user experience and aligns with how people in India typically identify locations. Additionally, it reduces computational overhead for proximity calculations in early-stage development.

#### Q: What are the limitations of your geolocation implementation?
**A**: The current implementation uses browser geolocation with network-based accuracy, which can be imprecise in dense urban areas. It lacks altitude data and relies on polling rather than push updates. A production system would benefit from GPS-level accuracy and WebSocket-based real-time updates.

#### Q: How does your authentication system scale?
**A**: The JWT-based stateless authentication scales horizontally well since no session data is stored server-side. However, long-lived tokens pose security risks, and a refresh token system would be more appropriate for production. Rate limiting and multi-factor authentication are missing but essential for robust security.

#### Q: Why MongoDB instead of a relational database?
**A**: MongoDB's document model naturally fits our JSON data structures, and its geospatial indexing capabilities are crucial for location-based queries. While relational databases offer stronger consistency guarantees, the flexible schema of MongoDB allows for rapid iteration, which is valuable in prototype development.

#### Q: How would you handle vendor data consistency if a vendor deletes their account?
**A**: Currently, vendor data persists even if accounts are deleted to preserve review histories. A production system would implement soft deletes or data anonymization to balance data retention with privacy concerns.

### Honest Limitations & Academic Justifications

1. **Prototype Nature**: This is a proof-of-concept demonstrating core functionality rather than a production-ready system. Many enterprise features like comprehensive testing, extensive error handling, and advanced security measures are simplified or omitted.

2. **Limited Algorithms**: The project emphasizes system architecture and integration over complex algorithmic implementations. This reflects the practical reality that most real-world applications prioritize reliable system design over algorithmic sophistication.

3. **Scalability Assumptions**: Current implementation assumes moderate user loads. Production deployment would require horizontal scaling, caching layers, and database sharding strategies not implemented in this prototype.

4. **Data Quality**: The system assumes accurate vendor data entry. A production system would require data validation, moderation, and verification mechanisms not present in this academic demonstration.

### Suggested Improvements for Production
1. Implement comprehensive test suites (unit, integration, end-to-end)
2. Add extensive logging and monitoring
3. Integrate with cloud services for scalability
4. Implement advanced security measures (rate limiting, input sanitization)
5. Add comprehensive error recovery mechanisms
6. Optimize database queries and implement caching
7. Develop administrative interfaces for content moderation