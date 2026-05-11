package com.vetclinic.app.api

import com.vetclinic.app.model.*
import retrofit2.http.*

interface VetApiService {
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): AuthResponse

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): AuthResponse

    @GET("auth/me")
    suspend fun getCurrentUser(): User

    @GET("pets")
    suspend fun getPets(): List<Pet>

    @GET("pets/{id}")
    suspend fun getPetById(@Path("id") id: String): Pet

    @POST("adoptions")
    suspend fun requestAdoption(@Body body: Map<String, String>): Any

    @GET("products")
    suspend fun getProducts(): List<Product>

    @POST("orders")
    suspend fun createOrder(@Body request: OrderRequest): Order

    @GET("orders")
    suspend fun getOrders(): List<Order>

    @GET("services")
    suspend fun getServices(): List<Service>

    @POST("appointments")
    suspend fun bookAppointment(@Body request: AppointmentRequest): Appointment

    @GET("appointments")
    suspend fun getAppointments(): List<Appointment>

    @GET("medical-records/{petId}")
    suspend fun getMedicalRecords(@Path("petId") petId: String): List<MedicalRecord>
}
