# Security Utilities & Best Practices

This document describes the security utilities and best practices implemented in the Wingstop Inventory App backend. It is intended for developers and administrators who need to understand, use, or extend the security features.

---

## Table of Contents
- [Password Hashing & Verification](#password-hashing--verification)
- [Password Strength Validation](#password-strength-validation)
- [Input Sanitization](#input-sanitization)
- [Audit Logging](#audit-logging)
- [Rate Limiting](#rate-limiting)
- [File Upload Security](#file-upload-security)
- [Security Middleware](#security-middleware)
- [Extending Security Utilities](#extending-security-utilities)

---

## Password Hashing & Verification
- **Library:** Uses [bcrypt](https://pypi.org/project/bcrypt/) for secure password hashing.
- **Usage:**
  - Hash a password: `SecurityUtils.hash_password_with_salt(password)`
  - Verify a password: `SecurityUtils.verify_password_with_salt(password, hashed_password)`
- **Integration:** All user passwords are hashed before storage and verified on login/change.

## Password Strength Validation
- **Comprehensive checks:**
  - Minimum length (8+ characters)
  - Uppercase, lowercase, digit, special character
  - Avoids common passwords, sequential/repeated characters
- **Usage:**
  - Analyze: `SecurityUtils.analyze_password_strength(password)`
  - Validate: `validate_password_security(password)`
- **API:** `/auth/validate-password` endpoint for frontend integration.

## Input Sanitization
- **Purpose:** Prevents injection attacks and enforces input length/character rules.
- **Usage:**
  - Sanitize any user input: `SecurityUtils.sanitize_input(text)`
- **Integration:** Used for usernames, emails, and other user-supplied fields.

## Audit Logging
- **Purpose:** Records security-relevant events (login, registration, password change, etc.).
- **Usage:**
  - Create a log: `SecurityUtils.create_audit_log(action, user_id, details)`
- **Integration:** Called in all authentication and profile endpoints.
- **Log Fields:** Timestamp, action, user_id, details, IP address, user agent.

## Rate Limiting
- **Purpose:** Prevents brute-force and abuse by limiting requests per IP.
- **Usage:**
  - Check/allow: `rate_limiter.is_allowed(key, max_requests, window_seconds)`
  - Get remaining: `rate_limiter.get_remaining_requests(key, ...)`
- **Integration:** Middleware applies rate limiting to all API requests.

## File Upload Security
- **Purpose:** Prevents malicious file uploads.
- **Usage:**
  - Validate: `SecurityUtils.validate_file_upload(filename, content_type, max_size)`
- **Checks:** Extension, content type, suspicious patterns, size.

## Security Middleware
- **Features:**
  - CORS, CSP, and security headers
  - Request validation (size, content type)
  - Authentication (JWT)
  - Rate limiting
- **Integration:** See `app/core/security.py` and `setup_security_middleware()`

## Extending Security Utilities
- **Add new checks:**
  - Extend `SecurityUtils` with new static methods for validation, sanitization, or logging.
- **Custom audit fields:**
  - Add fields to the `create_audit_log` method as needed.
- **Custom rate limiting:**
  - Adjust `RateLimiter` logic or replace with a distributed solution for production.

---

## Example: Using Security Utilities in an Endpoint

```python
from app.core.security_utils import SecurityUtils, validate_password_security

# Sanitize input
username = SecurityUtils.sanitize_input(request.username)

# Validate password
validation = validate_password_security(request.password)
if not validation["is_valid"]:
    raise HTTPException(status_code=400, detail="Weak password")

# Hash password
hashed, salt = SecurityUtils.hash_password_with_salt(request.password)

# Audit log
SecurityUtils.create_audit_log(
    action="user_registered",
    user_id=new_user.id,
    details={"username": username}
)
```

---

## Contact
For questions or to report security issues, contact the project maintainers. 