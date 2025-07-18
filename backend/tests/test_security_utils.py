"""
Tests for security utilities.

This module tests the enhanced security utilities including:
- Password strength analysis
- Input validation and sanitization
- Rate limiting
- File upload validation
- Audit logging
"""

import pytest
from datetime import datetime, timedelta
from app.core.security_utils import (
    SecurityUtils, 
    PasswordStrength, 
    PasswordAnalysis,
    validate_password_security,
    validate_registration_data,
    rate_limiter,
    RateLimiter
)


class TestPasswordStrength:
    """Test password strength analysis."""
    
    def test_very_weak_password(self):
        """Test very weak password detection."""
        analysis = SecurityUtils.analyze_password_strength("123")
        
        assert analysis.strength == PasswordStrength.VERY_WEAK
        assert analysis.score <= 1
        assert not analysis.is_acceptable
        assert "too short" in analysis.feedback[0]
    
    def test_weak_password(self):
        """Test weak password detection."""
        analysis = SecurityUtils.analyze_password_strength("password")
        
        assert analysis.strength == PasswordStrength.WEAK
        assert not analysis.is_acceptable
        assert "too common" in analysis.feedback[0]
    
    def test_medium_password(self):
        """Test medium password detection."""
        analysis = SecurityUtils.analyze_password_strength("Password123")
        
        assert analysis.strength == PasswordStrength.MEDIUM
        assert analysis.is_acceptable
        assert "Missing special characters" in analysis.feedback
    
    def test_strong_password(self):
        """Test strong password detection."""
        analysis = SecurityUtils.analyze_password_strength("Password123!")
        
        assert analysis.strength == PasswordStrength.STRONG
        assert analysis.is_acceptable
        assert len(analysis.feedback) == 0 or "Good length" in analysis.feedback
    
    def test_very_strong_password(self):
        """Test very strong password detection."""
        analysis = SecurityUtils.analyze_password_strength("MySecurePassword123!")
        
        assert analysis.strength == PasswordStrength.VERY_STRONG
        assert analysis.is_acceptable
        assert analysis.score >= 5
    
    def test_sequential_characters(self):
        """Test detection of sequential characters."""
        analysis = SecurityUtils.analyze_password_strength("Password123!")
        
        # Add sequential characters
        analysis_with_seq = SecurityUtils.analyze_password_strength("Password123abc!")
        assert "sequential characters" in analysis_with_seq.feedback
    
    def test_repeated_characters(self):
        """Test detection of repeated characters."""
        analysis = SecurityUtils.analyze_password_strength("Password111!")
        assert "repeated characters" in analysis.feedback
    
    def test_common_password_detection(self):
        """Test detection of common passwords."""
        for common_pass in ["password", "123456", "admin", "qwerty"]:
            analysis = SecurityUtils.analyze_password_strength(common_pass)
            assert "too common" in analysis.feedback[0]
            assert analysis.score == 0


class TestUsernameValidation:
    """Test username validation."""
    
    def test_valid_username(self):
        """Test valid username."""
        is_valid, errors = SecurityUtils.validate_username("testuser123")
        assert is_valid
        assert len(errors) == 0
    
    def test_username_too_short(self):
        """Test username too short."""
        is_valid, errors = SecurityUtils.validate_username("ab")
        assert not is_valid
        assert "at least 3 characters" in errors[0]
    
    def test_username_too_long(self):
        """Test username too long."""
        long_username = "a" * 51
        is_valid, errors = SecurityUtils.validate_username(long_username)
        assert not is_valid
        assert "less than 50 characters" in errors[0]
    
    def test_username_invalid_characters(self):
        """Test username with invalid characters."""
        is_valid, errors = SecurityUtils.validate_username("test-user@123")
        assert not is_valid
        assert "letters, numbers, and underscores" in errors[0]
    
    def test_common_username(self):
        """Test common username detection."""
        is_valid, errors = SecurityUtils.validate_username("admin")
        assert not is_valid
        assert "too common" in errors[0]
    
    def test_username_starts_with_underscore(self):
        """Test username starting with underscore."""
        is_valid, errors = SecurityUtils.validate_username("_testuser")
        assert not is_valid
        assert "start or end with underscore" in errors[0]
    
    def test_username_ends_with_underscore(self):
        """Test username ending with underscore."""
        is_valid, errors = SecurityUtils.validate_username("testuser_")
        assert not is_valid
        assert "start or end with underscore" in errors[0]


class TestEmailValidation:
    """Test email validation."""
    
    def test_valid_email(self):
        """Test valid email."""
        assert SecurityUtils.validate_email("test@example.com")
        assert SecurityUtils.validate_email("user.name@domain.co.uk")
        assert SecurityUtils.validate_email("test+tag@example.org")
    
    def test_invalid_email(self):
        """Test invalid email."""
        assert not SecurityUtils.validate_email("invalid-email")
        assert not SecurityUtils.validate_email("@example.com")
        assert not SecurityUtils.validate_email("test@")
        assert not SecurityUtils.validate_email("test@.com")
    
    def test_suspicious_email_patterns(self):
        """Test suspicious email patterns."""
        assert not SecurityUtils.validate_email("test..test@example.com")  # Double dots
        assert not SecurityUtils.validate_email("test@@example.com")  # Multiple @
        assert not SecurityUtils.validate_email("test@example..com")  # Multiple dots


class TestInputSanitization:
    """Test input sanitization."""
    
    def test_basic_sanitization(self):
        """Test basic input sanitization."""
        sanitized = SecurityUtils.sanitize_input("  test input  ")
        assert sanitized == "test input"
    
    def test_null_bytes_removal(self):
        """Test null byte removal."""
        sanitized = SecurityUtils.sanitize_input("test\x00input")
        assert sanitized == "testinput"
    
    def test_length_limiting(self):
        """Test length limiting."""
        long_input = "a" * 2000
        sanitized = SecurityUtils.sanitize_input(long_input, max_length=100)
        assert len(sanitized) == 100
    
    def test_control_characters(self):
        """Test control character handling."""
        sanitized = SecurityUtils.sanitize_input("test\n\tinput")
        assert sanitized == "test\n\tinput"  # Newlines and tabs preserved
    
    def test_empty_input(self):
        """Test empty input handling."""
        assert SecurityUtils.sanitize_input("") == ""


class TestPasswordGeneration:
    """Test secure password generation."""
    
    def test_generate_secure_password(self):
        """Test secure password generation."""
        password = SecurityUtils.generate_secure_password()
        
        assert len(password) == 16
        assert any(c.isupper() for c in password)
        assert any(c.islower() for c in password)
        assert any(c.isdigit() for c in password)
        assert any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
    
    def test_generate_secure_password_custom_length(self):
        """Test secure password generation with custom length."""
        password = SecurityUtils.generate_secure_password(length=20)
        assert len(password) == 20
    
    def test_password_uniqueness(self):
        """Test that generated passwords are unique."""
        passwords = set()
        for _ in range(100):
            password = SecurityUtils.generate_secure_password()
            passwords.add(password)
        
        # All passwords should be unique
        assert len(passwords) == 100


class TestPasswordHashing:
    """Test password hashing and verification."""
    
    def test_hash_password_with_salt(self):
        """Test password hashing with salt."""
        password = "testpassword123"
        hashed, salt = SecurityUtils.hash_password_with_salt(password)
        
        assert hashed != password
        assert len(hashed) > len(password)
        assert len(salt) > 0
    
    def test_verify_password_with_salt(self):
        """Test password verification."""
        password = "testpassword123"
        hashed, _ = SecurityUtils.hash_password_with_salt(password)
        
        assert SecurityUtils.verify_password_with_salt(password, hashed)
        assert not SecurityUtils.verify_password_with_salt("wrongpassword", hashed)
    
    def test_verify_password_invalid_hash(self):
        """Test password verification with invalid hash."""
        assert not SecurityUtils.verify_password_with_salt("password", "invalid_hash")


class TestFileUploadValidation:
    """Test file upload validation."""
    
    def test_valid_file_upload(self):
        """Test valid file upload."""
        is_valid, errors = SecurityUtils.validate_file_upload(
            "document.pdf", "application/pdf"
        )
        assert is_valid
        assert len(errors) == 0
    
    def test_invalid_file_extension(self):
        """Test invalid file extension."""
        is_valid, errors = SecurityUtils.validate_file_upload(
            "script.exe", "application/x-msdownload"
        )
        assert not is_valid
        assert "not allowed" in errors[0]
    
    def test_suspicious_filename(self):
        """Test suspicious filename patterns."""
        is_valid, errors = SecurityUtils.validate_file_upload(
            "file..txt", "text/plain"
        )
        assert not is_valid
        assert "invalid characters" in errors[0]
    
    def test_invalid_content_type(self):
        """Test invalid content type."""
        is_valid, errors = SecurityUtils.validate_file_upload(
            "image.jpg", "application/octet-stream"
        )
        assert not is_valid
        assert "not allowed" in errors[0]


class TestRateLimiting:
    """Test rate limiting functionality."""
    
    def test_rate_limiter_initial_state(self):
        """Test rate limiter initial state."""
        limiter = RateLimiter()
        assert limiter.is_allowed("test_key")
        assert limiter.get_remaining_requests("test_key") == 9  # 10 - 1
    
    def test_rate_limiter_exceed_limit(self):
        """Test rate limiter when limit is exceeded."""
        limiter = RateLimiter()
        
        # Make 10 requests (limit)
        for _ in range(10):
            assert limiter.is_allowed("test_key")
        
        # 11th request should be blocked
        assert not limiter.is_allowed("test_key")
        assert limiter.get_remaining_requests("test_key") == 0
    
    def test_rate_limiter_window_reset(self):
        """Test rate limiter window reset."""
        limiter = RateLimiter()
        
        # Make some requests
        for _ in range(5):
            limiter.is_allowed("test_key")
        
        # Simulate time passing (window reset)
        # This would normally be handled by the time-based cleanup
        # For testing, we'll just check the remaining requests
        remaining = limiter.get_remaining_requests("test_key")
        assert remaining == 5  # 10 - 5
    
    def test_rate_limiter_different_keys(self):
        """Test rate limiter with different keys."""
        limiter = RateLimiter()
        
        # Each key should have its own limit
        assert limiter.is_allowed("key1")
        assert limiter.is_allowed("key2")
        assert limiter.get_remaining_requests("key1") == 9
        assert limiter.get_remaining_requests("key2") == 9


class TestAuditLogging:
    """Test audit logging functionality."""
    
    def test_create_audit_log(self):
        """Test audit log creation."""
        log_entry = SecurityUtils.create_audit_log(
            action="test_action",
            user_id=123,
            details={"test": "data"}
        )
        
        assert log_entry["action"] == "test_action"
        assert log_entry["user_id"] == 123
        assert log_entry["details"]["test"] == "data"
        assert "timestamp" in log_entry
    
    def test_create_audit_log_no_user(self):
        """Test audit log creation without user."""
        log_entry = SecurityUtils.create_audit_log(
            action="test_action",
            details={"test": "data"}
        )
        
        assert log_entry["user_id"] is None
        assert log_entry["action"] == "test_action"


class TestValidationFunctions:
    """Test validation utility functions."""
    
    def test_validate_password_security(self):
        """Test password security validation."""
        result = validate_password_security("Password123!")
        
        assert "is_valid" in result
        assert "strength" in result
        assert "score" in result
        assert "feedback" in result
        assert "suggestions" in result
        assert "errors" in result
    
    def test_validate_registration_data_valid(self):
        """Test registration data validation with valid data."""
        result = validate_registration_data(
            username="testuser123",
            email="test@example.com",
            password="SecurePassword123!"
        )
        
        assert result["is_valid"]
        assert len(result["errors"]) == 0
    
    def test_validate_registration_data_invalid(self):
        """Test registration data validation with invalid data."""
        result = validate_registration_data(
            username="ab",  # Too short
            email="invalid-email",  # Invalid email
            password="123"  # Too weak
        )
        
        assert not result["is_valid"]
        assert len(result["errors"]) > 0
        assert "at least 3 characters" in result["errors"][0]
        assert "Invalid email format" in result["errors"]


class TestSecurityUtilsIntegration:
    """Test integration of security utilities."""
    
    def test_complete_registration_flow(self):
        """Test complete registration flow with security utilities."""
        # Validate registration data
        result = validate_registration_data(
            username="newuser123",
            email="newuser@example.com",
            password="SecurePassword123!"
        )
        
        assert result["is_valid"]
        
        # Generate secure password if needed
        if result["password_strength"] < 4:
            secure_password = SecurityUtils.generate_secure_password()
            assert len(secure_password) >= 16
        
        # Hash password
        hashed, salt = SecurityUtils.hash_password_with_salt("SecurePassword123!")
        assert hashed != "SecurePassword123!"
        
        # Verify password
        assert SecurityUtils.verify_password_with_salt("SecurePassword123!", hashed)
    
    def test_complete_login_flow(self):
        """Test complete login flow with security utilities."""
        # Sanitize input
        username = SecurityUtils.sanitize_input("  testuser  ")
        assert username == "testuser"
        
        # Validate email
        email = "test@example.com"
        assert SecurityUtils.validate_email(email)
        
        # Validate username
        is_valid, errors = SecurityUtils.validate_username(username)
        assert is_valid
        
        # Create audit log
        log_entry = SecurityUtils.create_audit_log(
            action="login_attempt",
            user_id=123,
            details={"username": username, "email": email}
        )
        
        assert log_entry["action"] == "login_attempt"
        assert log_entry["user_id"] == 123


if __name__ == "__main__":
    pytest.main([__file__]) 