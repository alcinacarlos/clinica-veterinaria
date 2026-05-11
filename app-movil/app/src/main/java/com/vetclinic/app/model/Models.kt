package com.vetclinic.app.model

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: String,
    val email: String,
    val full_name: String,
    val phone: String,
    val role: String
)

@Serializable
data class AuthResponse(
    val token: String,
    val user: User
)

@Serializable
data class LoginRequest(
    val email: String,
    val password: String
)

@Serializable
data class RegisterRequest(
    val email: String,
    val password: String,
    val full_name: String,
    val phone: String
)

@Serializable
data class Pet(
    val id: String,
    val name: String,
    val species: String,
    val breed: String,
    val age_years: Int,
    val description: String,
    val image_url: String,
    val status: String
)

@Serializable
data class Product(
    val id: String,
    val name: String,
    val description: String,
    val price: Double,
    val stock: Int,
    val category: String,
    val image_url: String,
    val is_active: Boolean = true
)

@Serializable
data class OrderItem(
    val product_id: String,
    val quantity: Int
)

@Serializable
data class OrderRequest(
    val items: List<OrderItem>,
    val notes: String = ""
)

@Serializable
data class Order(
    val id: String,
    val user_id: String,
    val total_price: Double,
    val status: String,
    val notes: String,
    val created_at: String
)

@Serializable
data class Service(
    val id: String,
    val name: String,
    val description: String,
    val price: Double,
    val duration_minutes: Int
)

@Serializable
data class AppointmentRequest(
    val service_id: String,
    val pet_id: String,
    val scheduled_at: String,
    val vet_id: String? = null,
    val notes: String = ""
)

@Serializable
data class Appointment(
    val id: String,
    val service_id: String,
    val pet_id: String,
    val scheduled_at: String,
    val status: String,
    val notes: String
)

@Serializable
data class MedicalRecord(
    val id: String,
    val pet_id: String,
    val appointment_id: String,
    val diagnosis: String,
    val treatment: String,
    val notes: String,
    val created_at: String
)
