# JWT Implementation Guide - Kirenz Project

## 📋 Tổng Quan

Dự án này sử dụng **JWT (JSON Web Token)** để xác thực người dùng. JWT là một chuẩn để tạo các token có tính bảo mật cao, cho phép xác thực stateless giữa client và server.

**Công nghệ sử dụng:**
- Backend: Spring Boot + Spring Security + Nimbus JOSE JWT
- Frontend: React + Axios + Zustand
- Algorithm: HS256 (HMAC SHA-256)

---

## 🔐 JWT Token Structure

### Access Token (Mã truy cập - ngắn hạn)
```json
{
  "sub": "123",                    // User ID
  "email": "user@example.com",     // Email người dùng
  "premium": false,                // Trạng thái premium
  "iat": 1234567890,              // Issued at (thời gian tạo)
  "exp": 1234568790               // Expires (hết hạn sau 15 phút)
}
```

**Thời hạn:** 15 phút (900,000ms)

### Refresh Token (Mã làm mới - dài hạn)
```json
{
  "sub": "123",
  "email": "user@example.com",
  "type": "refresh",              // Nhận diện là refresh token
  "iat": 1234567890,
  "exp": 1234567890 + 7 ngày      // Hết hạn sau 7 ngày
}
```

**Thời hạn:** 7 ngày (604,800,000ms)

---

## 🏗️ Backend Architecture

### 1. **JwtService.java** (Quản lý JWT)

**Vị trí:** `backend/src/main/java/com/example/demo/service/JwtService.java`

**Chức năng chính:**

```java
// Tạo Access Token
public String generateAccessToken(String userId, String email, Boolean isPremium)

// Tạo Refresh Token
public String generateRefreshToken(String userId, String email)

// Xác minh token
public boolean validateToken(String token)

// Trích xuất thông tin từ token
public String extractUserId(String token)
public String extractEmail(String token)
public Boolean extractPremiumStatus(String token)
```

**Khoá bí mật (Secret Key):**
- Được lưu trong biến môi trường: `JWT_SECRET`
- Yêu cầu: Ít nhất 256 bits (32 ký tự) để bảo mật
- Thuật toán: HS256 (HMAC SHA-256)

### 2. **AuthenticationService.java** (Xác thực người dùng)

**Vị trí:** `backend/src/main/java/com/example/demo/service/AuthenticationService.java`

**Các phương thức:**

| Phương thức | Chức năng |
|-----------|---------|
| `register()` | Đăng ký user mới → trả về cặp token (access + refresh) |
| `login()` | Xác minh user → trả về cặp token |
| `refreshToken()` | Xác minh refresh token → cấp access token mới |

**Mã hóa mật khẩu:**
- Sử dụng BCrypt với strength = 12
- Không bao giờ lưu mật khẩu plaintext

### 3. **SecurityConfig.java** (Cấu hình bảo mật)

**Vị trí:** `backend/src/main/java/com/example/demo/config/SecurityConfig.java`

**Cấu hình:**
- Session management: **Stateless** (không lưu session trên server)
- Authentication: OAuth2 Resource Server với JWT decoder
- Algorithm: HS256
- CORS: Cho phép `http://localhost:3000`

**Endpoint công khai (không cần token):**
```
/api/auth/**          → Login, Register, Refresh
/api/test/**          → Test endpoints
/ws/**                → WebSocket (xác thực riêng)
/actuator/health      → Health check
```

**Tất cả endpoint khác cần:**
- Header: `Authorization: Bearer {accessToken}`

### 4. **WebSocketAuthInterceptor.java** (Xác thực WebSocket)

**Vị trí:** `backend/src/main/java/com/example/demo/config/WebSocketAuthInterceptor.java`

**Chức năng:**
- Xác thực JWT khi kết nối WebSocket (STOMP)
- Trích xuất `userId` từ token
- Theo dõi người dùng online/offline

### 5. **PremiumAuthorizationFilter.java** (Kiểm tra Premium)

**Vị trí:** `backend/src/main/java/com/example/demo/filter/PremiumAuthorizationFilter.java`

**Chức năng:**
- Kiểm tra claim `premium` trong JWT
- Endpoint có `@RequiresPremium` → trả về 403 nếu user không premium
- Cho phép tính năng theo subscription

### 6. **AuthenticationController.java** (API Endpoint)

**Vị trị:** `backend/src/main/java/com/example/demo/controller/AuthenticationController.java`

```
POST /api/auth/register
  Input:  { "email": "user@example.com", "password": "..." }
  Output: { "accessToken": "...", "refreshToken": "...", "userId": 1, "email": "...", "isPremium": false }

POST /api/auth/login
  Input:  { "email": "user@example.com", "password": "..." }
  Output: { "accessToken": "...", "refreshToken": "...", "userId": 1, "email": "...", "isPremium": false }

POST /api/auth/refresh
  Input:  { "refreshToken": "..." }
  Output: { "accessToken": "...", "refreshToken": "..." }
```

---

## 🎨 Frontend Implementation

### 1. **authStore.ts** (Lưu trữ trạng thái)

**Vị trí:** `frontend/src/stores/authStore.ts`

**Công nghệ:** Zustand (State management)

**Dữ liệu lưu trữ:**
```typescript
{
  accessToken: string | null;
  refreshToken: string | null;
  userId: number | null;
  email: string | null;
  isPremium: boolean;
}
```

**Lưu trữ:** localStorage với key `auth-storage`
- Dữ liệu được lưu khi đăng nhập
- Được khôi phục khi tải lại trang

**Hành động:**
```typescript
setAuthData()        // Lưu token sau đăng nhập
clearAuthData()      // Xóa token khi đăng xuất
updateTokens()       // Cập nhật khi làm mới token
isAuthenticated()    // Kiểm tra xem đã đăng nhập chưa
```

### 2. **authService.ts** (Gọi API xác thực)

**Vị trí:** `frontend/src/api/authService.ts`

**Các phương thức:**

| Phương thức | Chức năng |
|-----------|---------|
| `login(email, password)` | Gửi request login → lưu token vào store |
| `register(email, password)` | Gửi request register → lưu token vào store |
| `refreshToken()` | Làm mới token bằng refresh token |
| `logout()` | Xóa token khỏi store |
| `getAccessToken()` | Lấy access token hiện tại |
| `getRefreshToken()` | Lấy refresh token hiện tại |

### 3. **axiosClient.ts** (Axios Interceptor - Tự động gắn token)

**Vị trí:** `frontend/src/api/axiosClient.ts`

#### **Request Interceptor (Gắn token vào request)**

```typescript
// Tự động thêm vào mỗi request:
Authorization: Bearer {accessToken}
```

#### **Response Interceptor (Xử lý 401 - Token hết hạn)**

**Quy trình:**

1. **Nếu response = 401 (Unauthorized):**
   - Kiểm tra endpoint → Bỏ qua nếu là `/auth/login`, `/auth/register`, `/auth/refresh`
   - Kiểm tra số lần thử lại (max 3)

2. **Làm mới token:**
   - Gọi `/api/auth/refresh` với refresh token
   - Nhận access token mới

3. **Xử lý request đợi:**
   - Các request khác đang chờ → được thử lại với token mới
   - Nếu refresh thành công → tất cả request tiếp tục
   - Nếu refresh thất bại → chuyển hướng tới `/login`

4. **Xóa cache:**
   - React Query cache được invalidate
   - Bắt buộc fetch dữ liệu mới từ server

```
Ví dụ Timeline:
├── Request A gửi (token hết hạn)
├── Response: 401
├── Trigger refresh token → nhận token mới
├── Retry Request A + B + C + D (queue)
├── Tất cả đều thành công ✓
└── Invalidate React Query cache
```

### 4. **ProtectedRoute.tsx** (Bảo vệ route)

**Vị trí:** `frontend/src/components/ProtectedRoute.tsx`

**Chức năng:**
- Kiểm tra `isAuthenticated()` từ auth store
- Nếu chưa login → chuyển hướng tới `/login`
- Nếu đã login → cho phép truy cập

---

## 🔄 Authentication Flow

### Đăng nhập

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User nhập email & password trên trang Login             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Frontend gọi authService.login(email, password)          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Backend: POST /api/auth/login                           │
│    - Kiểm tra email & password (BCrypt)                    │
│    - Tạo access token (15 phút)                            │
│    - Tạo refresh token (7 ngày)                            │
│    - Trả về tokens + user info                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Frontend:                                                 │
│    - Lưu tokens vào Zustand store                           │
│    - Lưu vào localStorage                                   │
│    - Chuyển hướng tới Home page                             │
└─────────────────────────────────────────────────────────────┘
```

### Sử dụng API (Gắn token)

```
┌──────────────────────────────────────────────────────────────┐
│ User click nút "Get Posts"                                  │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ Frontend: Axios gọi GET /api/posts                          │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ Request Interceptor:                                         │
│ - Thêm: Authorization: Bearer {accessToken}                 │
│ - Gửi request                                                │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ Backend: SecurityConfig                                      │
│ - Giải mã JWT token                                         │
│ - Xác minh signature & expiration                           │
│ - Trích xuất userId → set vào SecurityContext               │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ Backend: PostController.getPosts()                           │
│ - Lấy userId từ SecurityContext                             │
│ - Trả về posts của user                                     │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ Frontend: Nhận response 200 OK                               │
│ - Hiển thị danh sách posts                                  │
└──────────────────────────────────────────────────────────────┘
```

### Làm mới Token (Refresh)

```
┌──────────────────────────────────────────────────────────────┐
│ Luồng đơn giản: Access token hết hạn                       │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ Frontend gửi request, nhận 401 Unauthorized                 │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ Response Interceptor:                                        │
│ - Phát hiện 401                                             │
│ - Gọi authService.refreshToken()                            │
│ - POST /api/auth/refresh với refresh token                  │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ Backend: POST /api/auth/refresh                             │
│ - Xác minh refresh token                                    │
│ - Tạo access token mới (15 phút)                            │
│ - Trả về token mới                                          │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ Frontend:                                                    │
│ - Cập nhật token trong store                                │
│ - Retry request ban đầu với token mới                       │
│ - Request thành công ✓                                      │
└──────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Cấu hình Environment

### Backend (.env file)

```bash
JWT_SECRET=your-super-secret-jwt-key-at-least-256-bits-long-for-security
JWT_ACCESS_TOKEN_EXPIRATION=900000
JWT_REFRESH_TOKEN_EXPIRATION=604800000
```

**Yêu cầu:**
- `JWT_SECRET` phải ≥ 256 bits (32 ký tự)
- Phải bảo mật, không để lộ công khai
- Nên sử dụng password generator để tạo

### Frontend (Tự động)

Token được lưu vào localStorage:
```
localStorage.auth-storage = {
  "state": {
    "accessToken": "...",
    "refreshToken": "...",
    "userId": 123,
    "email": "user@example.com",
    "isPremium": false
  }
}
```

---

## 🛡️ Security Best Practices

### 1. **Token Expiration**
- ✅ Access token: 15 phút (ngắn)
- ✅ Refresh token: 7 ngày (dài)
- ❌ Token không bao giờ được cấp vô thời hạn

### 2. **Secret Key Protection**
- ✅ Lưu trong `.env` (không commit vào git)
- ✅ Tối thiểu 256 bits
- ✅ Chỉ backend biết secret
- ❌ Frontend không bao giờ nhìn thấy secret

### 3. **HTTPS/TLS**
- ✅ Production phải dùng HTTPS
- ✅ Token chỉ gửi qua HTTPS bảo mật
- ❌ Không bao giờ gửi token qua HTTP

### 4. **XSS Protection**
- ✅ Token lưu trong localStorage (dễ quản lý)
- ✅ Axios tự động gắn token vào header
- ⚠️ localStorage dễ bị XSS → cần sanitize input

### 5. **CORS Configuration**
- ✅ Frontend domain được whitelist: `http://localhost:3000`
- ✅ Credentials được gửi kèm
- ❌ Không bao giờ cho phép `*` (wildcard)

### 6. **Password Hashing**
- ✅ BCrypt strength = 12
- ✅ Mật khẩu không bao giờ được lưu plaintext
- ❌ Không sử dụng MD5 hoặc SHA1

### 7. **Rate Limiting**
- ⚠️ Nên thêm rate limiting cho `/auth/login` để chống brute force
- ⚠️ Nên thêm rate limiting cho `/auth/refresh` để chống replay attack

---

## 📝 Các File Liên Quan

### Backend
| File | Chức năng |
|------|---------|
| [backend/src/main/java/com/example/demo/service/JwtService.java](backend/src/main/java/com/example/demo/service/JwtService.java) | Tạo & xác minh JWT |
| [backend/src/main/java/com/example/demo/service/AuthenticationService.java](backend/src/main/java/com/example/demo/service/AuthenticationService.java) | Xác thực người dùng |
| [backend/src/main/java/com/example/demo/config/SecurityConfig.java](backend/src/main/java/com/example/demo/config/SecurityConfig.java) | Cấu hình Spring Security |
| [backend/src/main/java/com/example/demo/controller/AuthenticationController.java](backend/src/main/java/com/example/demo/controller/AuthenticationController.java) | Endpoints xác thực |
| [backend/src/main/java/com/example/demo/config/WebSocketAuthInterceptor.java](backend/src/main/java/com/example/demo/config/WebSocketAuthInterceptor.java) | Xác thực WebSocket |
| [backend/src/main/resources/application.yml](backend/src/main/resources/application.yml) | Cấu hình ứng dụng |

### Frontend
| File | Chức năng |
|------|---------|
| [frontend/src/stores/authStore.ts](frontend/src/stores/authStore.ts) | Quản lý trạng thái auth |
| [frontend/src/api/authService.ts](frontend/src/api/authService.ts) | Gọi API xác thực |
| [frontend/src/api/axiosClient.ts](frontend/src/api/axiosClient.ts) | Interceptor token |
| [frontend/src/components/ProtectedRoute.tsx](frontend/src/components/ProtectedRoute.tsx) | Bảo vệ route |

---

## 🧪 Testing JWT

### Test Backend

```bash
# 1. Đăng ký user mới
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "userId": 1,
  "email": "test@example.com",
  "isPremium": false
}

# 2. Dùng token để gọi API
curl http://localhost:8080/api/posts \
  -H "Authorization: Bearer {accessToken}"

# 3. Làm mới token khi hết hạn
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"eyJhbGc..."}'
```

### Test Frontend (Browser Console)

```javascript
// Kiểm tra token trong store
import authStore from './stores/authStore'
console.log(authStore.getState().accessToken)

// Kiểm tra localStorage
console.log(localStorage.getItem('auth-storage'))

// Test manual logout
authStore.getState().clearAuthData()
```

---

## 🔍 Troubleshooting

| Vấn đề | Nguyên nhân | Giải pháp |
|------|----------|---------|
| 401 Unauthorized | Token hết hạn | Refresh token tự động |
| 403 Forbidden | Thiếu quyền premium | Kiểm tra `isPremium` claim |
| Token không được gắn vào request | authService chưa được gọi | Gọi login/register trước |
| localStorage không lưu | CORS / localStorage bị block | Kiểm tra DevTools > Application |
| WebSocket disconnect | JWT không hợp lệ trên WS | Kiểm tra WebSocketAuthInterceptor |
| Request retry vô hạn | max retry = 3 không đủ | Tăng `retryCount` trong axiosClient |

---

## 📚 Tài liệu tham khảo

- [JWT.io](https://jwt.io/) - JWT decoder & validator
- [Spring Security JWT](https://spring.io/guides/gs/securing-web/)
- [OWASP - Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Nimbus JOSE JWT](https://bitbucket.org/connect2id/nimbus-jose-jwt/wiki/Home)

---

**Cập nhật lần cuối:** 2026-06-06
