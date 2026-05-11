package com.vetclinic.app.data

import com.vetclinic.app.api.VetApiService
import com.vetclinic.app.model.AuthResponse
import com.vetclinic.app.model.LoginRequest
import com.vetclinic.app.model.RegisterRequest
import com.vetclinic.app.model.User

class AuthRepository(
    private val apiService: VetApiService,
    private val sessionManager: SessionManager
) {
    suspend fun login(request: LoginRequest): Result<AuthResponse> {
        return try {
            val response = apiService.login(request)
            sessionManager.saveAuthToken(response.token)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun register(request: RegisterRequest): Result<AuthResponse> {
        return try {
            val response = apiService.register(request)
            sessionManager.saveAuthToken(response.token)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getCurrentUser(): Result<User> {
        return try {
            val response = apiService.getCurrentUser()
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun logout() {
        sessionManager.clearAuthToken()
    }

    fun isLoggedIn(): Boolean {
        return sessionManager.fetchAuthToken() != null
    }
}
